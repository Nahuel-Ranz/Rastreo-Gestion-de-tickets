const http = require('http');
const cookie = require('cookie');
const { Server } = require('socket.io');
const { srcPath } = require('../utils/utils');
const { getRedis } = require(`${srcPath}storage/connections`);

function init(app) {
    const server = http.createServer(app);
    const io = new Server(server);

    use(io);
    on(io);
    io.on("connection", socket => socketListeners(socket));
    return { server, io };
}

function use(io) {
    io.use((socket, next) => {
        const raw = socket.request.headers.cookie;
        if(!raw) return next(new Error('No Cookies'));

        const cookies = cookie.parse(raw);
        const sid = cookies.sid;

        if(!sid) return next(new Error('No sid cookie'));

        socket.sid = sid;
        next();
    });
}

function on(io) {
    io.on('connection', async (socket) => {
        const { cli } = await getRedis();
        const sid = socket.sid;

        const uid = await cli.get(`sess:${sid}`);

        if(!uid) {
            socket.disconnect(true);
            return;
        }

        await cli.sadd(`sess_socket:${sid}`, socket.id);
        await cli.expire(`sess_socket:${sid}`, 1800);

        console.log(`Socket: ${socket.id} | vinculado a la sesión: ${sid} `);
        socketListeners(socket, cli);
    });
}

function socketListeners(socket, cli) {

    socket.on('activity', async () => {
        const sid = socket.sessionId;
        if(!sid) return;

        await cli.expire(`sess:${sid}`, 1800);
        await cli.expire(`sess_socket:${sid}`, 1800);
    });

    socket.on('verify_email', async ({mail}) => await cli.set(`verify_email:${mail}`, socket.id, 'EX', 130));
    socket.on('disconnect', async (reason) => {
        console.log(`Socket desconectado: ${socket.id}; Razón: ${reason}`);
        const sid = socket.sessionId;
        if(!sid) return;

        await cli.srem(`sess_socket:${sid}`, socket.id);
    });
}

module.exports = { init }