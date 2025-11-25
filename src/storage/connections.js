require('dotenv').config();

const mysql2=require('mysql2/promise');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');

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
let cli = null;
let sub = null;

async function getRedis() {
    if(!cli) {
        cli = new Redis(process.env.REDIS_URL);
        cli.on("connect", () => console.log("Redis conectado (ioredis)."));
        cli.on("error", (e) => console.error(`Error en ioRedis: ${e}`));
    }
    
    if(!sub) {
        sub = new Redis(process.env.REDIS_URL);
        sub.on("connect", () => console.log("Redis Subscriber conectado (ioredis)."));
        sub.on("error", (e) => console.error(`Error en ioRedis Subscriber: ${e}`));
    }
    return { cli, sub };
}

module.exports = { mysql, getMongo, getRedis };