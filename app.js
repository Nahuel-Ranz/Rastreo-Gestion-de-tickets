require('dotenv').config();

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { getRedis, getRedisSubscriber } = require('./storage/connections.js')
const activityMiddleware = require('./middlewares/activityMiddleware.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ====== Configuración de Express ==========================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
// ==========================================================================

// ====== Configuración de sesión ===========================================
(async () => {
    const redis = await getRedis();
    
    app.use(session({
        store: new RedisStore({ client:redis, prefix:"sess:" }),
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        cookie:{
            maxAge:1000*60*30,
            secure: false,
            httpOnly: true
        }
    }));
})();
// ==========================================================================
app.use(activityMiddleware);

// ====== Rutas =============================================================
app.use('/', require('./routes/views'));
app.use('/', require('./routes/actions'));
app.use(require('./routes/error_handling'));
// ==========================================================================

// ====== Socket.io =========================================================
io.on("connection", socket => {
    console.log(`Cliente Conectado: ${socket.id}`);
    socket.on("disconnect", () => console.log(`Cliente desconectado: ${socket.id}`))
});
// ==========================================================================

// ====== Configuración Redis Subscriber ====================================
(async () => {
    const redis = await getRedis();
    const subscriber = await getRedisSubscriber();

    // activación de eventos de expiración.
    await redis.configSet('notify-keyspace-events', 'Ex');

    // escuchar las expiraciones.
    await subscriber.pSubscribe('__keyevent@0__:expired', (key) => {
        if(key.startsWith('verify:')) {
            const mail = key.replace("verify:", "");
            console.log(`Código expirado para ${mail}`);

            io.emit("code_expired", { mail });
        }
    });
    console.log('Subscripción a expiraciones Redis lista.');    
})();
// ==========================================================================

module.exports.io = io;
// ==========================================================================

const PORT = process.env.EXPRESS_PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
});