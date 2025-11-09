drop event if exists desactivar_sesiones_inactivas;
delimiter //
create event desactivar_sesiones_inactivas
	on schedule every 2 minute
	do
begin
	update Sesiones
    set activa = false, cierre = now()
    where activa = true and timestampdiff(minute, ultimaActividad, now()) > 30;
end; // delimiter ;