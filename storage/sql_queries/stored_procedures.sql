use bod1eymvxhvhobrcebij;

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






drop procedure if exists registrarUsuario;
delimiter //
create procedure registrarUsuario(
	in _nombre varchar(30),
	in _apellido varchar(30),
	in _dni varchar(8),
	in _fechaNacimiento date,
	in _celulares json,
	in _correos json,
	in _organizaciones json,
	in _contrasenia varchar(255),
	in _fechaCreacion date,
	out ok boolean,
	out message json
)
begin
	
end; //
delimiter ;