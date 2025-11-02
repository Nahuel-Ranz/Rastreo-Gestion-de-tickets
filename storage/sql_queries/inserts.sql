use bod1eymvxhvhobrcebij;
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
describe Estados;
insert into Estados(id, estado, abreviacion)
values(null,'no visto','unseen'),
	(null,'visto','seen'),
    (null,'falta información','missing'),
    (null,'pendiente','pending'),
    (null,'en ejecución','processing'),
    (null,'finalizado','finished'),
    (null,'cancelado','canceled'),
    (null,'no realizado','undone'),
    (null,'recibido','received'),
    (null,'leído','read');
select * from Estados;
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
describe Roles;
insert into Roles(id, rol, abreviacion, permisos)
	values(null,'administrador','admin', cast('{"c":{"me":["phone","email"],"others":[],"general":["user","rol","area"]},"r":{"ticket":{"me":[],"others":["date","time","requester","executer","activity_date","finished_date","details"],"general":["id","origin","status"]},"user":{"me":["id","name","last_name","dni","phones","emails","birthdate","creation_date","rol","origin"],"others":["name","last_name","dni","phones","emails","rol","origin"]},"session":{"me":["id","user","device","os","browser","init","last_activity","end","status"],"others":[]},"permisos":true,"area":true,"statistic":true},"u":{"ticket":{"me":[],"others":[]},"user":{"me":["phones","emails"],"others":["rol"]},"session":{"me":["status"],"others":["status"]},"area":true,"permisos":true},"d":{"user":{"me":["phones","emails"],"others":["account"]},"rol":true,"area":["email"],"areas":true}}' as json)),
    (null,'solicitante','req', cast('{"c":{"me":["ticket","phone","email"],"others":[],"general":[]},"r":{"ticket":{"me":["date","time","requester","executer","activity_date","finished_date","details"],"others":[],"general":["id","origin","status"]},"user":{"me":["id","name","last_name","dni","phones","emails","birthdate","creation_date","rol","origin"],"others":[]},"session":{"me":["id","user","device","os","browser","init","last_activity","end","status"],"others":[]},"permisos":false,"area":false,"statistic":false},"u":{"ticket":{"me":["origin","activity_date","details"],"others":[]},"user":{"me":["phones","emails","origin"],"others":[]},"session":{"me":["status"],"others":[]},"area":false,"permisos":false},"d":{"user":{"me":["account","phones","emails","origin"],"others":[]},"rol":false,"area":[],"areas":false}}' as json));
select * from Roles;
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------ */
describe AreasFacultad;
insert into AreasFacultad(id, nombre, abreviacion, correo)
values(null, 'Secretaría de Extensión Universitaria', 'seu', 'extuniv@frre.utn.edu.ar'),
	(null, 'Subsecretaría de Relaciones Internacionales', 'sri', 'internacionales@frre.utn.edu.ar'),
    (null, 'Secretaría de Infraestructura', 'si', 'mlagrost@frre.utn.edu.ar'),
    (null, 'Secretaría de Asuntos Universitarios', 'sau', 'sau@frre.utn.edu.ar'),
    (null, 'Secretaría de Ciencia y Tecnología', 'scyt', 'scyt@frre.utn.edu.ar');
select * from AreasFacultad;