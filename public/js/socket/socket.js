import { io } from "/socket.io/socket.io.esm.min.js";

let socket = null;

export function getSocket() {
    if(!socket) socket = io();
    return socket;
}