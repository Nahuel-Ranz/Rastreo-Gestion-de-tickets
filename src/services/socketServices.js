const http = require('http');
const { Server } = require('socket.io');

function init(app) {
    const server = http.createServer(app);
    const io = new Server(server);

    io.on("connection", socket => {
        console.log(`Cliente IO Conectado: ${socket.id}`);
        socket.on('disconnect', () => console.log(`Cliente IO Desconectado: ${socket.id}`));
    });

    return { server, io };
}

module.exports = { init }