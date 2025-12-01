const { srcPath } = require('../utils/utils');
const {
    mysql: mysqlEV,
    mongo: mongoEV,
    redis: redisEV
} = require(`${srcPath}envCredential`);

const mysql2=require('mysql2/promise');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');

// mysql connection.
const mysql = mysql2.createPool({
    host: mysqlEV.host,
    user: mysqlEV.user,
    password: mysqlEV.password,
    database: mysqlEV.db,
    port: mysqlEV.port,
    multipleStatements: true
});

// mongodb connection (singleton)
const mongoCli = new MongoClient(mongoEV.uri);
let mongodb = null;

async function getMongo(){
    if(!mongodb){
        try {
            await mongoCli.connect();
            mongodb = mongoCli.db(mongoEV.db);
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
        cli = new Redis(redisEV.url);
        cli.on("connect", () => console.log("Redis conectado (ioredis)."));
        cli.on("error", (e) => {
            console.error(`Error en ioRedis: ${e}`);
            if(e?.errors) console.log("Sub-errors: ", e.errors);
        });
    }
    
    if(!sub) {
        sub = new Redis(redisEV.url);
        sub.on("connect", () => console.log("Redis Subscriber conectado (ioredis)."));
        sub.on("error", (e) => {
            console.error(`Error en ioRedis - Subscriber: ${e}`);
            if(e?.errors) console.log("Sub-errors: ", e.errors);
        });
    }
    return { cli, sub };
}

module.exports = { mysql, getMongo, getRedis };