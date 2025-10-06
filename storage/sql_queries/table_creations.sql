use bod1eymvxhvhobrcebij;

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
    correo varchar(40) not null unique,
    constraint chk_nombre check(nombre regexp '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+( [a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$'),
    constraint chk_correo check(correo regexp "^[\w!#$%&'*+/=?^`{|}~-]+(\.[\w!#$%&'*+/=?^`{|}~-]+)*@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$")
) engine = InnoDB;

create table Estados (
	id int primary key auto_increment,
    estado varchar(20) not null unique,
    constraint chk_estado check(estado regexp '^[a-záéíóúñ]+( [a-záéíóúñ]+)*$')
) engine = InnoDB;

create table Roles (
	id int primary key auto_increment,
    rol varchar(20) not null unique,
    permisos json not null,
    constraint chk_rol check(rol regexp '^[a-záéíóúñ]+( [a-záéíóúñ]+)*$')
) engine = InnoDB;

create table Personas (
	id int primary key auto_increment,
    nombre varchar(30) not null,
    apellido varchar(30) not null,
    dni char(8) not null unique,
    fechaNacimiento date null,
    fechaCreacion datetime not null,
    constrasenia varchar(255) not null,
    rol_id int null,
    aceptado boolean not null,
    constraint fk_personas_roles foreign key(rol_id) references Roles(id) on delete restrict on update cascade,
    constraint chk_persona_nombre check(char_length(nombre) between 3 and 30 and nombre regexp '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}( [a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})*$'),
    constraint chk_apellido check(char_length(apellido) between 3 and 30 and apellido regexp '^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}( [a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})*$'),
	constraint chk_dni check(dni regexp '^\d{8}$')
) engine = InnoDB;

create table Celulares (
	id int primary key auto_increment,
    numero varchar(10) not null unique,
    propietario_id int not null,
    constraint fk_celulares_personas foreign key(propietario_id) references Personas(id) on delete cascade on update cascade,
    constraint chk_numero check(numero regexp '^\d{10}$')
) engine = InnoDB;

create table Correos (
	id int primary key auto_increment,
    correo varchar(40) not null unique,
    propietario_id int not null,
    constraint fk_correos_personas foreign key(propietario_id) references Personas(id) on delete cascade on update cascade,
    constraint chk_correos_correo check(correo regexp "^[\w!#$%&'*+/=?^`{|}~-]+(\.[\w!#$%&'*+/=?^`{|}~-]+)*@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$")    
) engine = InnoDB;

create table Sesiones (
	id int primary key auto_increment,
    usuario_id int not null,
    dispositivo varchar(15) not null,
    ip varchar(15) not null,
    so varchar(20) not null,
    navegador varchar(20) not null,
    inicio datetime not null,
    ultimaActividad datetime not null,
    cierre datetime null,
    activa boolean not null,
    constraint fk_sesiones_personas foreign key(usuario_id) references Personas(id) on delete cascade on update cascade
) engine = InnoDB;

create table PersonasProcedenDe (
	id int primary key auto_increment,
    persona_id int not null,
    area_facultad_id int not null,
    constraint fk_personasprocedende_personas foreign key(persona_id) references Personas(id) on delete cascade on update cascade,
	constraint fk_personasprocedende_areasfacultad foreign key(area_facultad_id) references AreasFacultad(id) on delete restrict on update cascade
) engine = InnoDB;

create table Tickets (
	id int primary key auto_increment,
    fecha datetime not null,
    solicitante_id int not null,
    area_facultad_id int not null,
    estado_id int not null,
    constraint fk_tickets_personas foreign key(solicitante_id) references Personas(id) on delete cascade on update cascade,
	constraint fk_tickets_areasfacultad foreign key(area_facultad_id) references AreasFacultad(id) on delete cascade on update cascade,
	constraint fk_tickets_estados foreign key(estado_id) references Estados(id) on delete cascade on update cascade
) engine = InnoDB;

create table Mensajes (
	id int primary key auto_increment,
    emisor_id int not null,
    receptor_id int not null,
    mensaje varchar(300) not null,
    fecha datetime not null,
    ticket_id int not null,
    estado_id int not null,
    constraint fk_emisor_mensajes_personas foreign key(emisor_id) references Personas(id) on delete cascade on update cascade,
	constraint fk_receptor_mensajes_personas foreign key(receptor_id) references Personas(id) on delete cascade on update cascade,
    constraint fk_mensajes_tickets foreign key(ticket_id) references Tickets(id) on delete cascade on update cascade,
	constraint fk_mensajes_estados foreign key(estado_id) references Estados(id) on delete cascade on update cascade
) engine = InnoDB;

create table TicketsAprobados (
	id int primary key,
    fecha datetime not null,
    solicitante_id int not null,
    area_facultad_id int not null,
    ejecutador_id int null,
    fechaFinalizacion datetime null,
    estado_id int not null,
    constraint fk_solicitante_ticketsaprobados_personas foreign key(solicitante_id) references Personas(id) on delete restrict on update cascade,
	constraint fk_ticketsaprobados_areasfacultad foreign key(area_facultad_id) references AreasFacultad(id) on delete restrict on update cascade,
	constraint fk_ejecutador_ticketsaprobados_personas foreign key(ejecutador_id) references Personas(id) on delete restrict on update cascade,
	constraint fk_ticketsaprobados_estados foreign key(estado_id) references Estados(id) on delete restrict on update cascade
) engine = InnoDB;

create table Historial (
    id int primary key auto_increment,
    fecha datetime not null,
    ticketAprobado_id int not null,
    estado_id int not null,
    automatico boolean not null,
    constraint fk_historial_ticketsaprobados foreign key(ticketAprobado_id) references TicketsAprobados(id) on delete cascade on update cascade,
    constraint fk_historial_estados foreign key(estado_id) references Estados(id) on delete cascade on update cascade
) engine = InnoDB;