use bod1eymvxhvhobrcebij;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists verificarNuevoUsuario;
delimiter //
create procedure verificarNuevoUsuario(
	in _dni char(8), in _celular int, in _correo varchar(40),
    out ok boolean, out message json
)
begin
	select coalesce(count(*)=0, 0), coalesce(json_objectagg(k, v), json_object())
		into ok, message
    from (
		select 'dni' as k, 'El DNI ingresado ya se encuentra almacenado en nuestro sistema.' as v
			where exists(select 1 from Personas where dni = _dni)
        union all
        select 'celular', 'El número ingresado ya se encuentra almacenado en nuestro sistema.'
			where exists(select 1 from Celulares where numero = _celular)
        union all
        select 'correo', 'El correo ingresado ya se encuentra almacenado en nuestro sistema.'
			where exists(select 1 from Correos where correo = _correo)
    ) as msg;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists registrarUsuario;
delimiter //
create procedure registrarUsuario(
	in _nombre varchar(30),
    in _apellido varchar(30),
    in _dni char(8),
    in _fechaNacimiento date,
    in _fechaCreacion datetime,
    in _celular int,
    in _correo varchar(250),
    in _areaFacultad int,
    in _contrasenia varchar(255),
    out ok boolean,
    out message json
)
begin
	declare usuario_id int;
    
	if _fechaNacimiento = '' or _fechaNacimiento = '0000-00-00' then
		set _fechaNacimiento = null;
	end if;
    
    if _celular = '' or _celular = 0  then
		set _celular = null;
	end if;
    
	insert into Personas(id, nombre, apellido, dni, fechaNacimiento, fechaCreacion, contrasenia, rol_id)
    values(null, _nombre, _apellido, _dni, _fechaNacimiento, _fechaCreacion, _contrasenia, null);
    set usuario_id = last_insert_id();
    
    if _celular is not null then
		insert into Celulares(id, numero, propietario_id) values(null, _celular, usuario_id);
	end if;
    
    insert into Correos(id, correo, propietario_id) values(null, _correo, usuario_id);
    insert into PersonasProcedenDe(id, persona_id, area_facultad_id) values(null, usuario_id, _areaFacultad);
    
    set ok = true;
    set message = json_object('status','Usuario registrado correctamente');
    
    select
		p.id,
        p.nombre,
        p.apellido,
        p.dni,
        cel.numero,
        c.correo,
        p.fechaNacimiento as fecha_nacimiento,
        af.nombre,
        p.fechaCreacion as fecha_creacion
    from Personas as p
    left join Celulares as cel on p.id = cel.propietario_id
    inner join Correos as c on p.id = c.propietario_id
    inner join PersonasProcedenDe as ppd on p.id = ppd.persona_id
    inner join AreasFacultad as af on af.id = ppd.area_facultad_id
    where p.id = usuario_id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists aprobarRegistro;
delimiter //
create procedure aprobarRegistro(
	in _id int, in _rol int,
    out ok boolean, out message json
)
begin
	update Personas set rol_id = _rol where Personas.id = _id;
    set ok = true;
    set message = json_object('status', 'Usuario aceptado');
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerArgon2Hash;
/* [6544] || [40608621] || [3624311688] || ["usuario@correo.com"] */
delimiter //
create procedure obtenerArgon2Hash(
	in _credencial json,
	out ok boolean,
	out message json
)
main_block: begin
    declare credencial_ varchar(250) default '';
	declare tipo_ varchar(20) default '';
    declare contrasenia_ varchar(250) default null;
    declare rol_ int default null;
	
	set credencial_ = json_unquote(json_extract(_credencial, '$[0]'));
	
	if credencial_ regexp '^[0-9]{10}$' then
		select p.contrasenia, p.rol_id
		into contrasenia_, rol_
		from Personas as p
		inner join Celulares as c on p.id = c.propietario_id
		where c.numero = cast(credencial_ as unsigned);
		
		set tipo_ = 'Celular';
	elseif credencial_ regexp '^[0-9]{8}$' then
		select contrasenia, rol_id
		into contrasenia_, rol_
		from Personas
		where dni = cast(credencial_ as unsigned);
	
		set tipo_ = 'DNI';
	elseif credencial_ regexp '^[0-9]+$' then
		select contrasenia, rol_id
		into contrasenia_, rol_
		from Personas
		where id = cast(credencial_ as unsigned);
		
		set tipo_ = 'Número de usuario';
	elseif credencial_ regexp '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$' then
		select p.contrasenia, p.rol_id
		into contrasenia_, rol_
		from Personas as p
		inner join Correos as c on p.id = c.propietario_id
		where c.correo = credencial_;
		
		set tipo_ = 'Correo';
	else
		set ok = false; set message = json_object('error','Credencial inválida');
		leave main_block;
	end if;

    if contrasenia_ is null then
        set ok = false; set message = json_object('error',concat(tipo_, ' no encontrado'));
    elseif rol_ is null then
        set ok = false; set message = json_object('error','Usuario aún no aceptado por el administrador');
    else
        set ok = true; set message = json_object('status','Usuario encontrado');
        select contrasenia_ as contrasenia;
    end if;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists iniciarSesion;
delimiter //
create procedure iniciarSesion(
	in _usuario_id int,
    in _dispositivo varchar(20),
    in _ip varchar(20),
    in _so varchar(25),
    in _navegador varchar(25),
    in _inicio datetime,
    in _ultimaActividad datetime,
    out ok boolean,
    out message json
)
begin
	declare usuario_json_ json;
    declare sesion_id_ int;
    
    declare exit handler for sqlexception
    begin
		rollback;
        set ok = false;
        set message = json_object('error','Error al iniciar sesión (desde MySQL)');
    end;
    
    start transaction;
		insert into Sesiones(id, usuario_id, dispositivo, ip, so, navegador, inicio, ultimaActividad, activa)
		values(null, _usuario_id, _dispositivo, _ip, _so, _navegador, _inicio, _ultimaActividad, true);
		set sesion_id_ = last_insert_id();
		
		select json_object(
			'id', p.id,
			'nombre', p.nombre,
			'apellido', p.apellido,
			'dni', p.dni,
			'fecha_nacimiento', p.fechaNacimiento,
			'fecha_creacion', p.fechaCreacion,
			'rol', r.rol,
			'permisos', r.permisos,
			'areas_facultad', (
				select json_objectagg(af.id,json_object(af.abreviacion, af.nombre))
				from PersonasProcedenDe as ppd
				inner join AreasFacultad as af on ppd.area_facultad_id = af.id
				where ppd.persona_id = p.id
			),
			'celulares',(
				select json_arrayagg(cel.numero)
				from Celulares as cel
				where cel.propietario_id = p.id
			),
			'correos', (
				select json_arrayagg(c.correo)
				from Correos as c
				where c.propietario_id = p.id
			)
		) into usuario_json_
		from Personas as p
		inner join Roles as r on p.rol_id = r.id
		where p.id = _usuario_id;
		
		set ok = true;
		set message = json_object('status','Sesión iniciada correctamente','id',sesion_id_);
    commit;
    
    select json_object(
		'id',sesion_id_,
        'usuario',usuario_json_
    ) as datos_sesion;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists actualizarUltimaActividad;
delimiter //
create procedure actualizarUltimaActividad(
	in _sesion_id int, in _new_activity datetime,
    out ok boolean, out message json
)
begin
	update Sesiones as s
    set s.ultimaActividad = _new_activity
    where s.id = _sesion_id and activa = true;
    
    set ok = true; set message = json_object('status','Nueva actividad');
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists cerrarSesion;
delimiter //
create procedure cerrarSesion(
	in _sesion_id int, in _cierre datetime,
    out ok boolean, out message json
)
begin
	declare exit handler for sqlexception
    begin
		rollback;
		set ok = false; set message = json_object('error','Ocurrió un error al intentar cerrar la sesión (desde MySQL)');
    end;
    
    start transaction;
		update Sesiones as s
        set s.activa = false, s.ultimaActividad = _cierre
        where s.id = _sesion_id;
        
        if row_count()>0 then
			set ok = true;
            set message = json_object('status','Sesión cerrada correctamente');
		else
			set ok = false;
            set message = json_object('error','La sesión ya se encuentra cerrada o no existe');
		end if;
    commit;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists rechazarRegistro;
delimiter //
create procedure rechazarRegistro(in _id int, out ok boolean, out message json)
begin
	delete from Personas as p where p.id = _id;
    set ok = true; set message = json_object('status','Registro rechazado y datos eliminados');
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerDatosUsuario;
delimiter //
create procedure obtenerDatosUsuario(in _id int, out ok boolean, out message json)
begin
	-- Personas, Correos, Celulares, PersonasProcedenDe, AreasFacultad
    declare correos_ json default null;
    declare celulares_ json default null;
    declare areas_ json default null;
    
    select coalesce(json_arrayagg(numero), json_array()) into celulares_
    from Celulares where propietario_id = _id;
    
    select json_arrayagg(correo) into correos_
    from Correos where propietario_id = _id;
    
    select json_objectagg(af.abreviacion, af.nombre) into areas_
    from PersonasProcedenDe as ppd
    inner join AreasFacultad as af on ppd.area_facultad_id = af.id
    where ppd.persona_id = _id;
    
    set ok = true;
    set message = json_object('status','Contacto correctamente obtenido');
    select
		p.id,
        p.nombre,
        p.apellido,
        p.dni,
        p.fechaNacimiento as fecha_nacimiento,
        p.fechaCreacion as fecha_creacion,
        celulares_ as celulares,
        correos as correos,
        areas_ as areas_facultad,
        r.rol,
        r.permisos
	from Personas as p
	inner join Roles as r
	on r.id = p.rol_id
	where p.id = _id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists crearTicket;
delimiter //
create procedure crearTicket(
	in _fecha datetime,
    in _solicitante_id int,
    in _area_facultad_id int,
    in _fecha_actividad datetime,
    out ok boolean,
    out message json
)
begin
	insert into Tickets(id, fecha, solicitante_id, area_facultad_id, fecha_actividad, estado_id)
    values(null, _fecha, _solicitante_id, _area_facultad_id, _fecha_actividad, 1);
    
    set ok = true; set message = json_object('status','Ticket generado correctamente');
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists aceptarTicket;
delimiter //
create procedure aceptarTicket(
	in _ticket_id int,
    in _fecha datetime,
    in _solicitante_id int,
    in _area_id int,
    in _fecha_actividad datetime,
    out ok boolean,
    out message json
)
begin
	insert into TicketsAprobados(id, fecha, solicitante_id, area_facultad_id, fecha_actividad, ejecutador_id, fecha_finalizacion, estado_id)
    values(_ticket_id, _fecha, _solicitante_id, _area_id, _fecha_actividad, null, null, 4);
    
    delete from Tickets where id = _ticket_id;
	set ok = true; set message = json_object('status','Ticket aceptado y trasladado a la cola de ejecución');
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists cambiarEstadoTicket;
delimiter //
create procedure cambiarEstadoTicket(
	in _id int,
    in _abreviacion varchar(10),
    out ok boolean,
    out message json
)
begin
	declare id_ int;
    declare estado_ varchar(20);
    
    select id, estado
    into id_, estado_
    from Estados
    where abreviacion = _abreviacion;
    
	if _abreviacion in('unseen','seen','missing') then
		update Tickets
        set estado_id = id_
        where id = _id;
        
        set ok = true;
        set message = json_object('status', concat('Estado del Ticket cambiado a ', estado_));
	else
		update TicketsAprovados
        set estado_id = id_
        where id= _id;
        
        set ok = true;
        set message = json_object('status', concat('Estado del Ticket Aprovado cambiado a ', estado_));
	end if;
end;// delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerTicketsPendientes;
delimiter //
create procedure obtenerTicketsPendientes(
	in _usuario_id int,
    in _page int,
    out ok boolean,
    out message json
)
main:begin
	declare permisos_ json;
    declare me_ json;
    declare others_ json;
    declare general_ json;
	
    declare mine_ text default '';
	declare someone_else_ text default '';
    
    set _page = greatest(ifnull(_page, 1), 1);
	set message = json_object();
	-- Permisos del usuario -----------------------------------------
    select r.permisos
    into permisos_
    from Personas as p
    inner join Roles as r on p.rol_id = r.id
    where p.id = _usuario_id;
	-- ---------------------------------------------------------------
    
    set me_ = coalesce(json_extract(permisos_, '$.r.ticket.me'), json_array());
    set others_ = coalesce(json_extract(permisos_, '$.r.ticket.others'), json_array());
    set general_ = coalesce(json_extract(permisos_, '$.r.ticket.general'), json_array());
    
    if json_length(me_)=0 and json_length(others_)=0 and json_length(general_)=0 then
		set ok = false; set message = json_object('error','No tienes permisos para ver ningún ticket');
        leave main;
	end if;
	
	-- permisos generales -------------------------------------
    if json_contains(general_, '"id"') then
		set mine_ = concat(mine_, "'id', t.id, ");
		set someone_else_ = mine_;
	end if;
    if json_contains(general_, '"origin"') then
		set mine_ = concat(mine_, "'procedencia', af.nombre, ");
		set someone_else_ = mine_;
	end if;
    if json_contains(general_, '"status"') then
		set mine_ = concat(mine_, "'estado', e.estado, ");
		set someone_else_ = mine_;
	end if;
	-- ----------------------------------------------------------
	
	-- permisos sobre mis tickets ------------------------------
	if json_length(me_)>0 then
		if json_contains(me_, '"date"') then
			set mine_ = concat(mine_, "'fecha', date(t.fecha), ");
		end if;
		if json_contains(me_, '"time"') then
			set mine_ = concat(mine_, "'hora', time(t.fecha), ");
		end if;
		if json_contains(me_, '"requester"') then
			set mine_ = concat(mine_, "'solicitante', concat(p.nombre, ' ', p.apellido), ");
		end if;
		if json_contains(me_, '"activity_date"') then
			set mine_ = concat(mine_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		set mine_ = trim(trailing ', ' from mine_);
	end if;
	-- ----------------------------------------------------------
    
	-- permisos sobre tickets ajenos ---------------------------
	if json_length(others_)>0 then
		if json_contains(others_, '"date"') then
			set someone_else_ = concat(someone_else_, "'fecha', date(t.fecha), ");
		end if;
		if json_contains(others_, '"time"') then
			set someone_else_ = concat(someone_else_, "'hora', time(t.fecha), ");
		end if;
		if json_contains(others_, '"requester"') then
			set someone_else_ = concat(someone_else_, "'solicitante', concat(p.nombre, ' ', p.apellido), ");
		end if;
		if json_contains(others_, '"activity_date"') then
			set someone_else_ = concat(someone_else_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		set someone_else_ = trim(trailing ', ' from someone_else_);
	end if;
	-- ----------------------------------------------------------
	
	-- consulta dináminca sobre los tickets propios ------------
	if mine_ <> '' then
		set ok = true;
		set message = json_insert(message, '$.mine','Tickets propios');
	
		set @query = concat(
			'select json_arrayagg(json_object(', mine_, ')) into @json_result
			from Tickets as t
			inner join Personas as p on t.solicitante_id = p.id
			inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id = ', _usuario_id,
			' order by t.id desc
            limit 20 offset ', (_page-1)*20
		);
		
        set @json_result = null;
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
        select @json_result;
	else
		set ok = false;
		set message = json_insert(message, '$.mine','No tienes permisos tus tickets');
	end if;
	-- ---------------------------------------------------------
	
	-- consulta dináminca sobre los tickets ajenos ------------
	if someone_else_ <> '' then
		set ok = true;
		set message = json_insert(message, '$.someone_else', 'Tickets ajenos');
		
		set @query = concat(
			'select json_arrayagg(json_object(', someone_else_, ')) into @json_result
			from Tickets as t
			inner join Personas as p on t.solicitante_id = p.id
			inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id <> ', _usuario_id,
			' order by t.id desc
            limit 20 offset ', (_page-1)*20
		);
		
        set @json_result = null;
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
        select @json_result;
	else
		set message = json_insert(message,'$.someone_else','No tienes permisos para ver los tickets ajenos');
	end if;
	-- ---------------------------------------------------------
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerTicketsAceptados;
delimiter //
create procedure obtenerTicketsAceptados(
	in _usuario_id int,
    in _page int,
    out ok boolean,
    out message json
)
main:begin
	declare permisos_ json;
    declare me_ json;
    declare others_ json;
    declare general_ json;
	
    declare mine_ text default '';
	declare someone_else_ text default '';
    
    set _page = greatest(ifnull(_page, 1), 1);
	set message = json_object();
	-- Permisos del usuario -----------------------------------------
    select r.permisos
    into permisos_
    from Personas as p
    inner join Roles as r on p.rol_id = r.id
    where p.id = _usuario_id;
	-- ---------------------------------------------------------------
    
    set me_ = coalesce(json_extract(permisos_, '$.r.ticket.me'), json_array());
    set others_ = coalesce(json_extract(permisos_, '$.r.ticket.others'), json_array());
    set general_ = coalesce(json_extract(permisos_, '$.r.ticket.general'), json_array());
    
    if json_length(me_)=0 and json_length(others_)=0 and json_length(general_)=0 then
		set ok = false; set message = json_object('error','No tienes permisos para ver ningún ticket');
        leave main;
	end if;
	
	-- permisos generales -------------------------------------
    if json_contains(general_, '"id"') then
		set mine_ = concat(mine_, "'id', t.id, ");
		set someone_else_ = mine_;
	end if;
    if json_contains(general_, '"origin"') then
		set mine_ = concat(mine_, "'procedencia', af.nombre, ");
		set someone_else_ = mine_;
	end if;
    if json_contains(general_, '"status"') then
		set mine_ = concat(mine_, "'estado', e.estado, ");
		set someone_else_ = mine_;
	end if;
	-- ----------------------------------------------------------
	
	-- permisos sobre mis tickets ------------------------------
	if json_length(me_)>0 then
		if json_contains(me_, '"date"') then
			set mine_ = concat(mine_, "'fecha', date(t.fecha), ");
		end if;
		if json_contains(me_, '"time"') then
			set mine_ = concat(mine_, "'hora', time(t.fecha), ");
		end if;
		if json_contains(me_, '"requester"') then
			set mine_ = concat(mine_, "'solicitante', concat(p.nombre, ' ', p.apellido), ");
		end if;
		if json_contains(me_, '"executer"') then
			set mine_ = concat(mine_, "'ejecutor', concat(ex.nombre, ' ', ex.apellido), ");
		end if;
		if json_contains(me_, '"activity_date"') then
			set mine_ = concat(mine_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		if json_contains(me_, '"finished_date"') then
			set mine_ = concat(mine_, "'fecha_finalizacion', t.fecha_finalizacion, ");
		end if;
		set mine_ = trim(trailing ', ' from mine_);
	end if;
	-- ----------------------------------------------------------
    
	-- permisos sobre tickets ajenos ---------------------------
	if json_length(others_)>0 then
		if json_contains(others_, '"date"') then
			set someone_else_ = concat(someone_else_, "'fecha', date(t.fecha), ");
		end if;
		if json_contains(others_, '"time"') then
			set someone_else_ = concat(someone_else_, "'hora', time(t.fecha), ");
		end if;
		if json_contains(others_, '"requester"') then
			set someone_else_ = concat(someone_else_, "'solicitante', concat(p.nombre, ' ', p.apellido), ");
		end if;
		if json_contains(others_, '"executer"') then
			set someone_else_ = concat(someone_else_, "'ejecutor', concat(ex.nombre, ' ', ex.apellido), ");
		end if;
		if json_contains(others_, '"activity_date"') then
			set someone_else_ = concat(someone_else_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		if json_contains(others_, '"finished_date"') then
			set someone_else_ = concat(someone_else_, "'fecha_finalizacion', t.fecha_finalizacion, ");
		end if;
		set someone_else_ = trim(trailing ', ' from someone_else_);
	end if;
	-- ----------------------------------------------------------
	
	-- consulta dináminca sobre los tickets propios ------------
	if mine_ <> '' then
		set ok = true;
		set message = json_insert(message, '$.mine','Tickets propios');
	
		set @query = concat(
			'select json_arrayagg(json_object(', mine_, ')) into @json_result
			from TicketsAprobados as t
			inner join Personas as p on t.solicitante_id = p.id
            inner join Personas as ex on t.ejecutador_id = ex.id
			inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id = ', _usuario_id,
			' order by t.id desc
            limit 20 offset ', (_page-1)*20
		);
		
        set @json_result = null;
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
        select @json_result;
	else
		set ok = false;
		set message = json_insert(message, '$.mine','No tienes permisos tus tickets');
	end if;
	-- ---------------------------------------------------------
	
	-- consulta dináminca sobre los tickets ajenos ------------
	if someone_else_ <> '' then
		set ok = true;
		set message = json_insert(message, '$.someone_else', 'Tickets ajenos');
		
		set @query = concat(
			'select json_arrayagg(json_object(', someone_else_, ')) into @json_result
			from TicketsAprobados as t
			inner join Personas as p on t.solicitante_id = p.id
            inner join Personas as ex on t.ejecutador_id = ex.id
			inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id <> ', _usuario_id,
			' order by t.id desc
            limit 20 offset ', (_page-1)*20
		);
		
        set @json_result = null;
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
        select @json_result;
	else
		set message = json_insert(message,'$.someone_else','No tienes permisos para ver los tickets ajenos');
	end if;
	-- ---------------------------------------------------------
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists enviarMensaje;
delimiter //
create procedure enviarMensaje(
	in _id_emisor int,
	in _id_receptor int,
	in _mensaje varchar(300),
	in _fecha datetime,
	in _ticket_id int,
	in _estado_id int,
	out ok boolean
)
begin
	insert into Mensajes(id, emisor_id, receptor_id, mensaje, fecha, ticket_id, estado_id)
	values(null, _id_emisor, _id_receptor, _mensaje, _fecha, _ticket_id, _estado_id);
	
	set ok = true;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerMensajes;
delimiter //
create procedure obtenerMensajes(
	in _me_id int,
	in _other_id int,
	in _ticket_id int,
	in _page int,
	out ok boolean,
	out message json
)
begin
	declare offset_ int;
    
	set _page = greatest(ifnull(_page, 1), 1);
    set offset_ = (_page-1) * 20;
    
	set ok = true;
	set message = json_object('status','Mensajes obtenidos');
	
	select
		m.id,
		m.emisor_id as emisor,
		m.receptor_id as receptor,
		m.mensaje,
		m.fecha,
		m.ticket_id as ticket,
		e.estado as estado
	from Mensajes as m
	inner join Estados as e on m.estado_id = e.id
	where _me_id in(m.emisor_id, m.receptor_id)
		and _other_id in(m.emisor_id, m.receptor_id)
		and m.ticket_id = _ticket_id
	order by m.id desc
	limit 20 offset offset_;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists leerMensaje;
delimiter //
create procedure leerMensaje(
	in _message_ids json,
	out ok boolean
)
main:begin
	declare i_ int default 0;
	declare total_ int;
	declare msg_id_ int;
	
	set total_ = json_length(_message_ids);
	if total_ = 0 then
		set ok = false;
		leave main;
	end if;
	
	while i_ < total_ do
		set msg_id_ = json_unquote(json_extract(_message_ids, concat('$[', i_, ']')));
		
		update Mensajes
		set estado_id = 10
		where id = msg_id_;
		
		set i_ = i_ + 1;
	end while;
	
	set ok = true;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists actualizarTicket;
delimiter //
create procedure actualizarTicket(
	in _id int,
	in _fecha_solicitud datetime,
	in _fecha_actividad datetime,
	in _origin int,
	out ok boolean,
	out message json
)
begin
	declare query_ text default '';
	
	if _origin is not null then
		set query_ = concat(', area_facultad_id = ', _origin);
	end if;
	
	if _fecha_actividad is not null then
		set query_ = concat(query_, ', fecha_actividad = "', _fecha_actividad, '"');
	end if;
	
	set @query = concat(' update Tickets
	set fecha = "', _fecha_solicitud, '"', query_,
	' where id = ', _id);
	
	
	prepare stmt from @query;
	execute stmt;
	deallocate prepare stmt;
	set @query = null;
	
	if row_count()>0 then
		set ok = true;
		set message = json_object('status',if(query_='', 'Solo me modifcó el detalle en MongoDB', 'Modificaciones en MySQL hechas'));
	else
		set ok = false;
		set message = json_object('error','No hubo modificaciones');
	end if;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists existeUsuario;
delimiter //

create procedure existeUsuario(
	in _credencial json,
	out ok boolean,
	out message json
)
begin
	declare credencial_ varchar(250) default '';
	declare tipoCredencial_ varchar(20) default '';
	declare filas_ int default 0;
	
	set credencial_ = json_unquote(json_extract(_credencial, '$[0]'));
	
	if credencial_ regexp '^[0-9]{10}$' then
		select count(*) into filas_ from Celulares where numero = cast(credencial_ as unsigned);
		set tipoCredencial_ = 'celular';
		
	elseif credencial_ regexp '^[0-9]{8}$' then
		select count(*) into filas_ from Personas where dni = cast(credencial_ as unsigned);
		set tipoCredencial_ = 'número de DNI';
		
	elseif credencial_ regexp '^[0-9]+$' then
		select count(*) into filas_ from Personas where id = cast(credencial_ as unsigned);
		set tipoCredencial_ = 'número de usuario';
		
	else
		select count(*) into filas_ from Correos where correo = credencial_;
		set tipoCredencial_ = 'correo';
	end if;

	if filas_>0 then
		set ok = true; set message = json_object('status','encontrado','tipo',tipoCredencial_,'valor',credencial_);
	else
		set ok = false; set message = json_object('status','no encontrado','tipo',tipoCredencial_,'valor',credencial_);
	end if;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerAreas;
delimiter //
create procedure obtenerAreas(
	out ok boolean,
	out message json
)
begin
	select abreviacion, nombre
	from AreasFacultad
	order by nombre;
	
	if row_count()>0 then
		set ok = true; set message = json_object('status','Áreas de la Facultad');
	else
		set ok = false; set message = json_object('error','Error al obtener las Áreas');
	end if;
end; // delimiter ;