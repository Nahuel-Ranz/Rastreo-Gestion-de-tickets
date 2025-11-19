// muestra las bases de datos que existen en el servidor MongoDB al que estoy conectado.
// show databases;

// selecciona la base de datos (la crea si no existe).
// use Rastreo;

// una vez seleccionada la base de datos, esta se almacenará dentro del objeto 'db'.
db.metodos();

// creación explícita de una colección.
db.createCollection('CollectionName');

// insertar varios elementos
db.insertMany([
    { id:234, key1:'value1', key2:'value2' },
    { id:234, key3:'value3', key4:'value4' },
    { id:234, key5:'value5', key6:'value6' },
    { id:234, key7:'value7', key8:'value8' },
]);

// insertar un solo elemento
db.insertOne({
    id:234,
    key1:'value1',
    key2:'value2',
    fecha: new Date()
});

// consultar sobre que base de datos estamos
db.getName();

// consultar los nombres de las colecciones.
db.getCollectionNames();

// eliminar una collection
db.CollectionName.drop();

// elimina todas las colecciones.
db.getCollectionNames().forEach(c => db[c].drop());

// elimina la base de datos.
db.dropDatabase();

// crear colection con restricciones de datos y tipos (tipo constraint)
db.createCollection("Personas", {
    validator: {
        $jsonSchema: {
            bsonType:"object",
            required:["id","superior_id"],
            additionalProperties:false,
            properties: {
                id: { bsonType:"int" },
                superior_id: { bsonType:["int","null"] }
            }
        }
    },
    validationLevel:"strict",
    validationAction:"error"
});

db.createCollection("Notificaciones", {
    validator: {
        $jsonSchema: {
            bsonType:"object",
            required:["origen","motivo","origen_id","destinos_id","fecha","descripcion","visto"],
            additionalProperties:false,
            properties: {
                origen: { bsonType: "string", pattern: "^[a-z]*$" },
                motivo: { bsonType: "string" },
                origen_id: { bsonType: "int" },
                destinos_id: {
                    bsonType: "array",
                    minItems: 1,
                    items: { bsonType:"int" }
                },
                fecha: { bsonType: "date" },
                descripcion: { bsonType: "string" },
                visto: { bsonType: "bool"}
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});

db.createCollection("Tickets", {
    validator: {
        $jsonSchema: {
            bsonType:"object",
            required:["id", "detalles"],
            additionalProperties:false,
            properties: {
                id: { bsonType:"int" },
                detalles: {
                    bsonType:"object",
                    required:["descripcion"],
                    properties: {
                        descripcion: { bsonType: "string" }
                    }
                }
            }
        }
    },
    validationLevel:"strict",
    validationAction:"error"
});