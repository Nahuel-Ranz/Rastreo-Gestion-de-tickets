const http = require('http');
const cookie = require('cookie');
const { Server } = require('socket.io');
const { srcPath } = require('../utils/utils');
const { getRedis } = require(`${srcPath}storage/connections`);

function init(app) {
    const server = http.createServer(app);
    const io = new Server(server);
    
    uses(io);
    io.on('connection', (socket) => {
        if(socket.isGuest) onGuest(socket);
        else onAuthenticated(socket);
    });
    return { server, io };
}

function uses(io) {
    io.use((socket, next) => {
        const raw = socket.request.headers.cookie;
        if(!raw) { socket.isGuest = true; return next(); }

        const cookies = cookie.parse(raw);
        const sid = cookies.sid;
        if(!sid) { socket.isGuest = true; return next(); }

        socket.sid = sid;
        next();
    });
}

async function onGuest(socket) {
    const { cli } = await getRedis();

    socket.on('verify_email', async ({ mail }) => {
        await cli.set(`verify_email:${mail}`, socket.id, 'EX', 130);
    });
}

async function onAuthenticated(socket) {
    const { cli } = await getRedis();
    if(!saveSessionOnRedis(cli, socket)) return;

	socket.on('activity', async () => {
		const sid = socket.sid;
		if (!sid) return;

		// Levantamos la sesión desde Redis
		let sess = await cli.get(`sess:${sid}`);
        if(!sess) return;
		sess = JSON.parse(sess);

		// Diferencia de minutos
		const now = Date.now();
		const last = new Date(sess.last_activity).getTime();
		const diffMinutes = (now - last) / (1000 * 60);
		
		sess.last_activity = new Date().toISOString();
		await cli.set(`sess:${sid}`, JSON.stringify(sess), 'EX', 1800);
		await cli.expire(`sess_socket:${sid}`, 1860);

		socket.emit('refresh_cookie', { refreshMysql: diffMinutes>=2 });
	});
    
    socket.on('disconnect', async (reason) => {
        console.log(`Socket desconectado: ${socket.id}; Razón: ${reason}`);
        const sid = socket.sid;
        if(!sid) return;
    
        await cli.srem(`sess_socket:${sid}`, socket.id);
    });
}

async function saveSessionOnRedis(cli, socket) {
    const sid = socket.sid;
    const uid_LastActivity = await cli.get(`sess:${sid}`);
    if(!uid_LastActivity) { socket.disconnect(true); return false; }

    await cli.sadd(`sess_socket:${sid}`, socket.id);
    await cli.expire(`sess_socket:${sid}`, 1860);
    await cli.expire(`sess:${sid}`, 1800);

    console.log(`Socket: ${socket.id} | vinculado a la sesión: ${sid}`);
    return true;
}

module.exports = { init }