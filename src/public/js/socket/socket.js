import { io } from "/vendor/socket.io.esm.min.js";

let socket = null;
export function getSocket() {
    if(!socket) socket = io();
	
	socket.on('connect', () => {
		console.log('Socket conectado con id:', socket.id);
		onActivity();
	});
    return socket;
}

function onActivity() {
	let lastActivity = 0;
	
	['click', 'keydown', 'scroll'].forEach( e => {
		document.addEventListener(e, () => {
			const now = Date.now();
			if(now - lastActivity < 30_000) return;

			lastActivity = now;
			socket.emit('activity');
		}, { passive:true });
	});
}