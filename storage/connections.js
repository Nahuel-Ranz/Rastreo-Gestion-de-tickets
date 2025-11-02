require('dotenv').config();

const mysql2=require('mysql2/promise');
const { MongoClient } = require('mongodb');

// mysql connection.
const mysql = mysql2.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT,
    multipleStatements: true
});

// mongodb connection.
const mongoCli = new MongoClient(process.env.MONGO_URI);
let mongodb = null;

async function getMongo(){
    if(!mongodb){
        try {
            await mongoCli.connect();
            mongodb = mongoCli.db(process.env.MONGO_DB);
        } catch(error) {
            console.log("Error de conexión de MongoDB ... ", error);
        }
    }
    return mongodb;
}
console.log("MySQL: ", mysql);
console.log(getMongo());
module.exports = { mysql, getMongo };