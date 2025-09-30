use bod1eymvxhvhobrcebij;

/*	POST
	tablas: Personas, Celulares, Correos, Roles, PersonasProcedenDe, Organizaciones.
	registrarPersona(
		nombre, apellido, dni, fechaNacimiento,
        JSON(celulares), JSON(correos), JSON(organizaciones),
        rol, contrasenia, fechaCreacion
	);
    
    tablas: Personas, Sesiones.
    iniciarSesion(id_usuario, dispositivo, so, navegador, inicio, ultimaActividad);
    
    tablas: Personas, Tickets, Estados, Organizaciones.
    generarTicket(fecha, solicitante_id, organizacion_id)
    
    tablas: Tickets, TicketsAprobados.
    aprobarTicket(ticket_id);
    
    tablas: Personas, Escriben, Estados.
    enviarMensaje(emisor_id, receptor_id, mensaje, fecha);
*/

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
		
    end;
//
delimiter ;