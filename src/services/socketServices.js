const http = require('http');
const { Server } = require('socket.io');
const { srcPath } = require('../utils/utils');
const { getRedis } = require(`${srcPath}storage/connections`);

function init(app) {
    const server = http.createServer(app);
    const io = new Server(server);

    io.on("connection", socket => socketListeners(socket));
    return { server, io };
}

function socketListeners(socket) {
    let cli = null;
    (async () => {
        const redis = await getRedis();
        cli = redis.cli;
    })();

    socket.on('bind_session', async ({ sid }) => {
        const userId = await cli.get(`sess:${sid}`);
        if(!userId) return socket.disconnect(true);

        socket.sessionId = sid;

        await cli.sadd(`sess_socket:${sid}`, socket.id);
        await cli.expire(`sess_socket:${sid}`, 1800);
    });

    socket.on('activity', async () => {
        const sid = socket.sessionId;
        if(!sid) return;

        await cli.expire(`sess:${sid}`, 1800);
        await cli.expire(`sess_socket:${sid}`, 1800);
    });

    socket.on('verify_email', async ({mail}) => await cli.set(`verify_email:${mail}`, socket.id, 'EX', 130));
    socket.on('disconnect', async () => {
        const sid = socket.sessionId;
        if(!sid) return;

        await cli.srem(`sess_socket:${sid}`, socket.id);
    });
}

module.exports = { init }