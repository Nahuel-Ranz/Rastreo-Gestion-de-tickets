const mysql2=require('mysql2/promise');
const { MongoClient } = require('mongodb');

// mysql connection.
const mysql = mysql2.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    port: process.env.MYSQL_PORT
});

// mongodb connection.
const mongoCli = new MongoClient(process.env.MONGO_URI);
let mongodb = null;

async function startMongo(){
    if(!mongodb){
        await mongoCli.connect();
        mongodb = mongoCli.db(process.env.MONGO_DB);
    }

    return mongodb;
}

const mongo = await startMongo();
module.exports = { mysql, mongo };