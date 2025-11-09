-- use bod1eymvxhvhobrcebij;
use Rastreo;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists verificarNuevoUsuario;
delimiter //
create procedure verificarNuevoUsuario(in _dni char(8), in _celular int, in _correo varchar(40))
begin
	select 'dni' as credential, 'El DNI ingresado ya se encuentra almacenado en nuestro sistema.' as message
		where exists(select 1 from Personas where dni = _dni)
	union all
	select 'celular', 'El número ingresado ya se encuentra almacenado en nuestro sistema.'
		where exists(select 1 from Celulares where numero = _celular)
	union all
	select 'correo', 'El correo ingresado ya se encuentra almacenado en nuestro sistema.'
		where exists(select 1 from Correos where correo = _correo);
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
    in _contrasenia varchar(255)
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
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists aprobarRegistro;
delimiter //
create procedure aprobarRegistro(in _id int, in _rol int)
begin
	update Personas set rol_id = _rol where Personas.id = _id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerArgon2Hash;
/* [6544] || [40608621] || [3624311688] || ["usuario@correo.com"] */
delimiter //
create procedure obtenerArgon2Hash(in _credencial json)
main_block: begin
    declare credencial_ varchar(250) default '';
	declare tipo_ varchar(20) default '';
    declare id_ int default 0;
    declare contrasenia_ varchar(250) default null;
    declare rol_ int default null;
	
	set credencial_ = json_unquote(json_extract(_credencial, '$[0]'));
	
	if credencial_ regexp '^[0-9]{10}$' then
		select p.id, p.contrasenia, p.rol_id into id_, contrasenia_, rol_
		from Personas as p
		inner join Celulares as c on p.id = c.propietario_id
		where c.numero = cast(credencial_ as unsigned);
		
		set tipo_ = 'Celular';
	elseif credencial_ regexp '^[0-9]{8}$' then
		select id, contrasenia, rol_id into id_, contrasenia_, rol_
		from Personas
		where dni = credencial_;
	
		set tipo_ = 'DNI';
	elseif credencial_ regexp '^[0-9]+$' then
		select id, contrasenia, rol_id into id_, contrasenia_, rol_
		from Personas
		where id = cast(credencial_ as unsigned);
		
		set tipo_ = 'Número de usuario';
	elseif credencial_ like '%@%' then
		select p.id, p.contrasenia, p.rol_id into id_, contrasenia_, rol_
		from Personas as p
		inner join Correos as c on p.id = c.propietario_id
		where c.correo = credencial_;
		
		set tipo_ = 'Correo';
	else
		select false as ok, 'Credencial inválida.' as 'error';
		leave main_block;
	end if;

    if contrasenia_ is null then
		select false as ok, concat(tipo_, ' no encontrado') as 'error';
    elseif rol_ is null then
		select false as ok, 'Usuario aún no aceptado por el administrador' as 'error';
    else
        select true as ok, id_ as id_user, contrasenia_ as 'hash';
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
    in _ultimaActividad datetime
)
begin
    declare sesion_id_ int default 0;
    
    declare exit handler for sqlexception
    begin
		rollback;
        select false as ok, 'Error al iniciar sesión (desde MySQL)' as 'error';
    end;
    
    start transaction;
		insert into Sesiones(id, usuario_id, dispositivo, ip, so, navegador, inicio, ultimaActividad, activa)
		values(null, _usuario_id, _dispositivo, _ip, _so, _navegador, _inicio, _ultimaActividad, true);
		set sesion_id_ = last_insert_id();
    commit;
    
    select
		true as ok, sesion_id_ as session_id, _ultimaActividad as last_activity, _usuario_id as user_id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists actualizarUltimaActividad;
delimiter //
create procedure actualizarUltimaActividad(in _sesion_id int, in _new_activity datetime)
begin
	update Sesiones
    set ultimaActividad = _new_activity
    where id = _sesion_id and activa = true;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists cerrarSesion;
delimiter //
create procedure cerrarSesion(
	in _sesion_id int, in _cierre datetime
)
begin
	update Sesiones
	set activa = false, ultimaActividad = _cierre
	where id = _sesion_id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists rechazarRegistro;
delimiter //
create procedure rechazarRegistro(in _id int)
begin
	delete from Personas where id = _id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerDatosUsuario;
delimiter //
create procedure obtenerDatosUsuario(in _id int)
begin
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
    
    select
		p.id,
        p.nombre,
        p.apellido,
        p.dni,
        p.fechaNacimiento as fecha_nacimiento,
        p.fechaCreacion as fecha_creacion,
        celulares_ as celulares,
        correos_ as correos,
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
    in _fecha_actividad datetime
)
begin
	insert into Tickets(id, fecha, solicitante_id, area_facultad_id, fecha_actividad, estado_id)
    values(null, _fecha, _solicitante_id, _area_facultad_id, _fecha_actividad, 1);
    
    select last_insert_id() as ticket_id;
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
    in _fecha_actividad datetime
)
begin
	insert into TicketsAprobados(id, fecha, solicitante_id, area_facultad_id, fecha_actividad, ejecutador_id, fecha_finalizacion, estado_id)
    values(_ticket_id, _fecha, _solicitante_id, _area_id, _fecha_actividad, null, null, 4);
    
    delete from Tickets where id = _ticket_id;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists cambiarEstadoTicket;
delimiter //
create procedure cambiarEstadoTicket(in _id int, in _abreviacion varchar(10))
begin
	declare id_ int;
    
    select id
    into id_
    from Estados
    where abreviacion = _abreviacion;
    
	if _abreviacion in('unseen','seen','missing') then
		update Tickets
        set estado_id = id_
        where id = _id;
	else
		update TicketsAprovados
        set estado_id = id_
        where id= _id;
	end if;
end;// delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerTickets;
delimiter //
-- tipo: 'Aprobados' || ''
create procedure obtenerTickets(in _usuario_id int, in _page int, in _tipo varchar(10))
main:begin
	declare permisos_ json;
    declare me_ json;
    declare others_ json;
    declare general_ json;
	
    declare mine_ text default '';
	declare someone_else_ text default '';
    
	if _tipo not in ('', 'Aprobados') then
		select false as ok, 'Tipo erróneo de ticket (desde MySQL)' as 'error';
		leave main;
	end if;
	
    set _page = greatest(ifnull(_page, 1), 1);
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
    
    if
		ifnull(json_length(me_),0)=0
		and ifnull(json_length(others_),0)=0
		and ifnull(json_length(general_),0)=0
	then

		select false as ok, 'No tienes permisos para ver ningún ticket' as 'error';
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
		if json_contains(me_, '"executer"') and _tipo = 'Aprobados' then
			set mine_ = concat(mine_, "'ejecutor', concat(ex.nombre, ' ', ex.apellido), ");
		end if;
		if json_contains(me_, '"activity_date"') then
			set mine_ = concat(mine_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		if json_contains(me_, '"finished_date"') and _tipo = 'Aprobados' then
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
		if json_contains(others_, '"executer"') and _tipo = 'Aprobados' then
			set someone_else_ = concat(someone_else_, "'ejecutor', concat(ex.nombre, ' ', ex.apellido), ");
		end if;
		if json_contains(others_, '"activity_date"') then
			set someone_else_ = concat(someone_else_, "'fecha_actividad', t.fecha_actividad, ");
		end if;
		if json_contains(others_, '"finished_date"') and _tipo = 'Aprobados' then
			set someone_else_ = concat(someone_else_, "'fecha_finalizacion', t.fecha_finalizacion, ");
		end if;
		set someone_else_ = trim(trailing ', ' from someone_else_);
	end if;
	-- ----------------------------------------------------------
	
	-- consulta dináminca sobre los tickets propios ------------
	set @mis_tickets = null;
	if mine_ <> '' then
		set @query = concat(
			'select json_arrayagg(json_object(', mine_, ')) into @mis_tickets
			from Tickets', _tipo, ' as t
			inner join Personas as p on t.solicitante_id = p.id ',
			if(_tipo = '', '', ' inner join Personas as ex on t.ejecutador_id = ex.id '),
			' inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id = ', _usuario_id,
			' order by t.id desc
            limit 50 offset ', ((_page-1)*50)
		);
		
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
	end if;
	-- ---------------------------------------------------------
	
	-- consulta dináminca sobre los tickets ajenos ------------
	set @tickets_de_otros = null;
	if someone_else_ <> '' then
		set @query = concat(
			'select json_arrayagg(json_object(', someone_else_, ')) into @tickets_de_otros
			from Tickets', _tipo, ' as t
			inner join Personas as p on t.solicitante_id = p.id ',
			if(_tipo = '', '', ' inner join Personas as ex on t.ejecutador_id = ex.id '),
			' inner join Estados as e on t.estado_id = e.id
			inner join AreasFacultad as af on t.area_facultad_id = af.id
			where t.solicitante_id <> ', _usuario_id,
			' order by t.id desc
            limit 50 offset ', ((_page-1)*50)
		);
		
		prepare stmt from @query;
		execute stmt;
		deallocate prepare stmt;
		set @query = null;
	end if;
	-- ---------------------------------------------------------
	if @mis_tickets is null and @tickets_de_otros is null then
		select true as ok, 'No hay tickets por mostrar' as 'status';
        leave main;
	end if;
    
	select
		true as ok,
		json_object(
			'propios', @mis_tickets,
			'ajenos', @tickets_de_otros
		) as tickets;
	set @mis_tickets = null;
	set @tickets_de_otros = null;
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
    in _ticket_id int
)
begin
	insert into Mensajes(id, emisor_id, receptor_id, mensaje, fecha, ticket_id, estado_id)
	values(null, _id_emisor, _id_receptor, _mensaje, _fecha, _ticket_id, 9);
    
    select last_insert_id();
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists recibirMensajes;
delimiter //
create procedure recibirMensajes(in _me_id int)
begin
	update Mensajes
    set estado_id = 10
    where receptor_id = _me_id and estado_id = 9;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerMensajes;
delimiter //
create procedure obtenerMensajes(in _me_id int, in _other_id int, in _ticket_id int, in _page int)
begin
	declare offset_ int default 0;
    
	set _page = greatest(ifnull(_page, 1), 1);
    set offset_ = (_page-1) * 40;
	
	select m.id, m.emisor_id, m.receptor_id, m.mensaje, m.fecha, m.ticket_id, e.estado, e.id
	from Mensajes as m
	inner join Estados as e on m.estado_id = e.id
	where _me_id in(m.emisor_id, m.receptor_id)
		and _other_id in(m.emisor_id, m.receptor_id)
		and m.ticket_id = _ticket_id
	order by m.id desc
	limit 40 offset offset_;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists leerMensajes;
delimiter //
create procedure leerMensajes(in _message_ids json)
main:begin
	declare i_ int default 0;
	declare total_ int;
	declare msg_id_ int;
	
	set total_ = json_length(_message_ids);
	if total_ = 0 then
		leave main;
	end if;
	
	while i_ < total_ do
		set msg_id_ = json_unquote(json_extract(_message_ids, concat('$[', i_, ']')));
		
		update Mensajes
		set estado_id = 11
		where id = msg_id_;
		
		set i_ = i_ + 1;
	end while;
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
	in _origin int
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
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists existeUsuario;
delimiter //
create procedure existeUsuario(in _credencial json)
begin
	declare credencial_ varchar(250) default '';
	declare tipoCredencial_ varchar(20) default '';
	declare filas_ int default 0;
	
	set credencial_ = json_unquote(json_extract(_credencial, '$[0]'));
	
	if credencial_ regexp '^[0-9]{10}$' then
		select count(*) into filas_ from Celulares where numero = cast(credencial_ as unsigned);
		set tipoCredencial_ = 'celular';
		
	elseif credencial_ regexp '^[0-9]{8}$' then
		select count(*) into filas_ from Personas where dni = credencial_;
		set tipoCredencial_ = 'número de DNI';
		
	elseif credencial_ regexp '^[0-9]+$' then
		select count(*) into filas_ from Personas where id = cast(credencial_ as unsigned);
		set tipoCredencial_ = 'número de usuario';
		
	else
		select count(*) into filas_ from Correos where correo = credencial_;
		set tipoCredencial_ = 'correo';
	end if;

	if filas_>0 then
		select true as ok, concat('Usuario encontrado por su ', tipoCredencial_) as 'status';
	else
		select false as ok, 'Usuario NO encontrado' as 'status';
	end if;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerAreas;
delimiter //
create procedure obtenerAreas()
begin
	select abreviacion as 'value', nombre as content
	from AreasFacultad
	order by nombre;
end; // delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerPermisosUsuario;
delimiter //
create procedure obtenerPermisosUsuario(in _id int)
begin
	select concat(p.nombre, ' ', p.apellido) as 'full_name', r.permisos as 'permissions'
    from Personas as p
    inner join Roles as r on p.rol_id = r.id
    where p.id = _id;
end; // delimiter ;