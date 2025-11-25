require('dotenv').config();

const { init: initExpress } = require('./services/expressServices.js');
const { init: configureRedis } = require('./services/redisServices.js');
const { init: initSocket } = require('./services/socketServices.js');

const app = initExpress();
const { server, io } = initSocket(app);
(async () => configureRedis(io))();

module.exports.io = io

const PORT = process.env.EXPRESS_PORT || 3000;
server.listen(PORT, () => console.log(`Servidor: http://localhost:${PORT}`));