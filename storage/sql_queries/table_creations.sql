-- use bod1eymvxhvhobrcebij;
use Rastreo;

drop table if exists Historial;
drop table if exists TicketsAprobados;
drop table if exists Mensajes;
drop table if exists Tickets;
drop table if exists PersonasProcedenDe;
drop table if exists Sesiones;
drop table if exists Correos;
drop table if exists Celulares;
drop table if exists Personas;
drop table if exists Roles;
drop table if exists Estados;
drop table if exists AreasFacultad;

create table AreasFacultad (
	id int primary key auto_increment,
    nombre varchar(70) not null unique,
    abreviacion varchar(30) not null unique,
    correo varchar(250) null unique,

    constraint chk_nombre
        check(
            nombre regexp '^[a-záéíóúñ]+( [a-záéíóúñ]+)*$'
        ),

    constraint chk_areasfacultad_abreviacion
        check(
            abreviacion regexp '^[a-z0-9-_.]+$'
        ),

    constraint chk_areasfacultad_correo
        check(
            correo regexp '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$'
            and correo not like '%..%'
        )
);

create table Estados (
	id int primary key auto_increment,
    estado varchar(20) not null unique,
    abreviacion varchar(10) not null unique,

    constraint chk_estado
        check(
            estado regexp '^[a-záéíóúñ]+( [a-záéíóúñ]+)*$'
        ),
	constraint chk_estados_abreviacion
		check(
			abreviacion regexp '^[a-z]{1,10}$'
        )
);

create table Roles (
	id int primary key auto_increment,
    rol varchar(20) not null unique,
    abreviacion varchar(30) not null unique,
    permisos json not null,

    constraint chk_rol
        check(
            rol regexp '^[a-záéíóúñ]+( [a-záéíóúñ]+)*$'
        ),

    constraint chk_roles_abreviacion
        check(
            abreviacion regexp '^[a-z0-9-_.]+$'
        )
);

create table Personas (
	id int primary key auto_increment,

    nombre varchar(30) not null,
    apellido varchar(30) not null,

    dni char(8) not null unique,
    fechaNacimiento date null,
    fechaCreacion datetime not null,
    contrasenia varchar(255) not null,
    rol_id int null,

    constraint fk_personas_roles
        foreign key(rol_id)
        references Roles(id)
        on delete restrict
        on update cascade,

    constraint chk_persona_nombre
        check(
            char_length(nombre) between 3 and 30
            and nombre regexp '^[a-záéíóúñ]{3,}( [a-záéíóúñ]{2,})*$'
        ),

    constraint chk_apellido
        check(
            char_length(apellido) between 3 and 30
            and apellido regexp '^[a-záéíóúñ]{3,}( [a-záéíóúñ]{2,})*$'
        ),

	constraint chk_dni
        check(dni regexp '^[0-9]{8}$')
);

create table Celulares (
	id int primary key auto_increment,
    numero int not null unique,
    propietario_id int not null,

    constraint fk_celulares_personas
        foreign key(propietario_id)
        references Personas(id)
        on delete cascade
        on update cascade
);

create table Correos (
	id int primary key auto_increment,
    correo varchar(250) not null unique,
    propietario_id int not null,

    constraint fk_correos_personas
        foreign key(propietario_id)
        references Personas(id)
        on delete cascade
        on update cascade,

    constraint chk_correos_correo
        check(
            correo regexp '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$'
            and correo not like '%..%'
        )
);

create table Sesiones (
	id int primary key auto_increment,
    usuario_id int not null,
    dispositivo varchar(20) not null,
    ip varchar(20) not null,
    so varchar(25) not null,
    navegador varchar(25) not null,
    inicio datetime not null,
    ultimaActividad datetime not null,
    cierre datetime null,
    activa boolean not null,

    constraint fk_sesiones_personas
        foreign key(usuario_id)
        references Personas(id)
        on delete cascade
        on update cascade
);

create table PersonasProcedenDe (
	id int primary key auto_increment,
    persona_id int not null,
    area_facultad_id int not null,

    constraint fk_personasprocedende_personas
        foreign key(persona_id)
        references Personas(id)
        on delete cascade
        on update cascade,

	constraint fk_personasprocedende_areasfacultad
        foreign key(area_facultad_id)
        references AreasFacultad(id)
        on delete restrict
        on update cascade
);

create table Tickets (
	id int primary key auto_increment,
    fecha datetime not null,
    solicitante_id int not null,
    area_facultad_id int not null,
    fecha_actividad datetime not null,
    estado_id int not null,

    constraint fk_tickets_personas
        foreign key(solicitante_id)
        references Personas(id)
        on delete cascade
        on update cascade,

	constraint fk_tickets_areasfacultad
        foreign key(area_facultad_id)
        references AreasFacultad(id)
        on delete cascade
        on update cascade,

	constraint fk_tickets_estados
    foreign key(estado_id)
    references Estados(id)
    on delete cascade
    on update cascade
);

create table Mensajes (
	id int primary key auto_increment,
    emisor_id int not null,
    receptor_id int not null,
    mensaje varchar(300) not null,
    fecha datetime not null,
    ticket_id int not null,
    estado_id int not null,

    constraint fk_emisor_mensajes_personas
        foreign key(emisor_id)
        references Personas(id)
        on delete cascade
        on update cascade,

	constraint fk_receptor_mensajes_personas
        foreign key(receptor_id)
        references Personas(id)
        on delete cascade
        on update cascade,

    constraint fk_mensajes_tickets
        foreign key(ticket_id)
        references Tickets(id)
        on delete cascade
        on update cascade,

	constraint fk_mensajes_estados
        foreign key(estado_id)
        references Estados(id)
        on delete cascade
        on update cascade
);

create table TicketsAprobados (
	id int primary key,
    fecha datetime not null,
    solicitante_id int not null,
    area_facultad_id int not null,
    fecha_actividad datetime not null,
    ejecutador_id int null,
    fecha_finalizacion datetime null,
    estado_id int not null,

    constraint fk_solicitante_ticketsaprobados_personas
        foreign key(solicitante_id)
        references Personas(id)
        on delete restrict
        on update cascade,

	constraint fk_ticketsaprobados_areasfacultad
        foreign key(area_facultad_id)
        references AreasFacultad(id)
        on delete restrict
        on update cascade,

	constraint fk_ejecutador_ticketsaprobados_personas
        foreign key(ejecutador_id)
        references Personas(id)
        on delete restrict
        on update cascade,

	constraint fk_ticketsaprobados_estados
        foreign key(estado_id)
        references Estados(id)
        on delete restrict
        on update cascade
);

create table Historial (
    id int primary key auto_increment,
    fecha datetime not null,
    ticketAprobado_id int not null,
    estado_id int not null,
    automatico boolean not null,

    constraint fk_historial_ticketsaprobados
        foreign key(ticketAprobado_id)
        references TicketsAprobados(id)
        on delete cascade
        on update cascade,

    constraint fk_historial_estados
        foreign key(estado_id)
        references Estados(id)
        on delete cascade
        on update cascade
);