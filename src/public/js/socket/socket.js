import { io } from "/socket.io/socket.io.esm.min.js";

let socket = null;
export function getSocket() {
    if(!socket) socket = io();
	
	socket.on('connect', () => {
		console.log('Socket conectado con id:', socket.id);
	});
    return socket;
}