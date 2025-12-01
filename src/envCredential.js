require('dotenv').config();

module.exports = {
    express: {
        port: process.env.EXPRESS_PORT,
        environment: process.env.EXPRESS_ENV,
        name: process.env.EXPRESS_NAME,
    },
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        db: process.env.MYSQL_DB,
        password: process.env.MYSQL_PASS,
        port: process.env.MYSQL_PORT,
    },
    mongo: {
        uri: process.env.MONGO_URI,
        db: process.env.MONGO_DB,
    },
    email: {
        service: process.env.EMAIL_SERV,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
    },
    redis: {
        url: process.env.REDIS_URL
    }
}