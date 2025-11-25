const { getRedis } = require('../storage/connections.js');

async function init(io) {
	const { cli, sub } = await getRedis();
	
	await cli.config('SET', 'notify-keyspace-events', 'Ex');
	
	await sub.psubscribe('__keyevent@0__:expired');
	sub.on('pmessage', (pattern, channel, key) => {
		
		if(key.startsWith('verify:')) {
			const mail = key.replace('verify:', '');
			console.log(`Código expirado para ${mail}`);
			
			io.emit('code_expired', { mail});
		}
	});
	
	console.log('Subscripción a expiración Redis lista.');
}

module.exports = { init }