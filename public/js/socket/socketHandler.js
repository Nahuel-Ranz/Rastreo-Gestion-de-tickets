import { getSocket } from '/js/socket/socket.js';

export function initSocketHandlers() {
    const socket = getSocket();

    socket.on("code_expired", ({mail}) => alert(`El código enviado a ${mail} ha expirado.`));
    socket.on("chat_message", data => {

    });

    socket.on("notification", data => {

    });
}