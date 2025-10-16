use bod1eymvxhvhobrcebij;

/* definición del charset y del collation */
create database bod1eymvxhvhobrcebij
    character set utf8mb4
    collate utf8mb4_spanish_ci;

/* modificarlo en una base de datos existente */
alter database bod1eymvxhvhobrcebij
    character set utf8mb4
    collate utf8mb4_spanish_ci;

/* consulta del charset y de collation por defecto */
select
    schema_name as BaseDeDatos,
    default_character_set_name as Charset,
    default_collation_name as Collation
from information_schema.schemata
where schema_name = 'bod1eymvxhvhobrcebij';

/* aplicación a una tabla existente */
alter table Personas
convert to character set utf8mb4
collate utf8mb4_spanish_ci;

/* ----------------- ENGINE ------------------ */
/* consultar cuales hay y cual está configurada por defecto */
show engines;

/* establecer InnoDB temporalmente, durante la sesión */
set default_storage_engine = InnoDB;

/* consultar motor por defecto */
select @@default_storage_engine;