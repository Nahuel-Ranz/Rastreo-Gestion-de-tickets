use bod1eymvxhvhobrcebij;
describe AreasFacultad;
select @global.sql_mode;
select @session.sql_mode;

alter table Tickets
add column fechaActividad datetime not null
after area_facultad_id;

alter table Tickets
rename column fechaActividad
to fecha_actividad;
select * from Tickets;
select version();
alter table TicketsAprobados add column fecha_actividad datetime not null after area_facultad_id;
alter table TicketsAprobados rename column fechaFinalizacion to fecha_finalizacion;
select * from TicketsAprobados;


select * from AreasFacultad;
select * from Personas;
delete from Personas where id > 23121;
select * from Correos;
select * from Celulares;
select * from Roles;