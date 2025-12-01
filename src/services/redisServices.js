const { srcPath } = require('../utils/utils');
const { getRedis } = require(`${srcPath}storage/connections`);

async function init(io) {
	const { cli, sub } = await getRedis();
	
	await cli.config('SET', 'notify-keyspace-events', 'Ex');
	
	await sub.psubscribe('__keyevent@0__:expired');
	sub.on('pmessage', async (pattern, channel, key) => {
		
		// expiración de códigos
		if(key.startsWith('verify:')) {
			const mail = key.replace('verify:', '');

			const socketId = await cli.get(`verify_email:${mail}`);
			if(socketId) {
				io.to(socketId).emit('code_expired', {mail});
				console.log(`Código expirado para ${mail}. Enviado solo a ${socketId}`);
			}
		}

		// expiración de sesión
		if(key.startsWith('sess:')) {
			const sid = key.replace('sess:', '');

			const sockets = await cli.smembers(`sess_socket:${sid}`);
			sockets.forEach( id => io.to(id).emit(`session_expired`));

			await cli.del(`sess_socket:${sid}`);
			console.log(`Sesión ${sid} expirada. ${sockets.length} sockets cerrados`);
		}
	});
	
	console.log('Subscripción a expiración Redis lista.');
}

module.exports = { init }