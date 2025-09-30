use bod1eymvxhvhobrcebij;

delimiter //
	create trigger validarPersona before insert on Personas
    for each row
    begin
		declare msg text;
        set msg = '';
        
        if char_length(new.nombre) < 3 then
			set msg = concat(msg, '{"campo":"nombre","error":"menos de 3 caracteres"},');
		end if;
        
        if char_length(new.apellido) < 3 then
			set msg = concat(msg, '{"campo":"apellido","error":"menos de 3 caracteres"},');
		end if;
        
        if exists(select 1 from Personas where dni = new.dni) then
			set msg = concat(msg, '{"campo":"dni","error":"DNI duplicado"},');
		end if;
        
        if 
    end;
//
delimiter ;