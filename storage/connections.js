require('dotenv').config();

const mysql2=require('mysql2/promise');
const { MongoClient } = require('mongodb');
const { createClient } = require('redis');

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

// redis connection (singleton)
let redis = null;

async function getRedis() {
    if(!redis) {
        redis = createClient({ url: process.env.REDIS_URL });
        redis.on("error", (error) => console.error(`Error en Redis: ${error}`));
        
        try {
            await redis.connect();
            console.log("Redis Conectado.");
        } catch(error) { console.error(`Error al conectar Redis: ${error}`)}
    }
    return redis;
}

module.exports = { mysql, getMongo, getRedis };