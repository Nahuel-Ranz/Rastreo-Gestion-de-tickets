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
end; //
delimiter ;
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
end; //
delimiter ;
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
end; //
delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
drop procedure if exists obtenerArgon2Hash;
delimiter //
create procedure obtenerArgon2Hash(in _credencial json, out ok boolean, out message json)
main_block: begin
    declare clave_ varchar(20);
    declare valor_ varchar(250);
    declare id_ int default null;
    declare contrasenia_ varchar(250) default null;
    declare rol_ int default null;

    set clave_ = json_unquote(json_extract(json_keys(_credencial), '$[0]'));
    set valor_ = json_unquote(json_extract(_credencial, concat('$.', clave_)));

    case clave_
        when 'id' then
            select p.id, p.contrasenia, p.rol_id
            into id_, contrasenia_, rol_
            from Personas as p
            where p.id = cast(valor_ as unsigned);
        when 'celular' then
            select p.id, p.contrasenia, p.rol_id
            into id_, contrasenia_, rol_
            from Personas as p
            inner join Celulares as c on p.id = c.propietario_id
            where c.numero = cast(valor_ as unsigned);
        when 'correo' then
            select p.id, p.contrasenia, p.rol_id
            into id_, contrasenia_, rol_
            from Personas as p
            inner join Correos as c on p.id = c.propietario_id
            where c.correo = valor_;
        when 'dni' then
            select p.id, p.contrasenia, p.rol_id
            into id_, contrasenia_, rol_
            from Personas as p
            where p.dni = valor_;
        else
            set ok = false; set message = json_object('error','Credencial inválida');
            leave main_block;
    end case;

    if contrasenia_ is null then
        set ok = false; set message = json_object('error',concat(if(clave_ = 'id', 'número de usuario', clave_), ': no encontrado'));
    elseif rol_ is null then
        set ok = false; set message = json_object('error','Usuario aún no aceptado');
    else
        set ok = true; set message = json_object('status',contrasenia_);
        select id_ as id;
    end if;
end; //
delimiter ;
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
				select json_arrayagg(af.nombre)
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
end; //
delimiter ;
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
end; //
delimiter ;
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
end; //
delimiter ;
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------- */