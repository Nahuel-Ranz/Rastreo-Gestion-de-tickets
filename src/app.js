const { express } = require('./envCredential');

const { init: initExpress, mountRoutes } = require('./services/expressServices.js');
const { init: configureRedis } = require('./services/redisServices.js');
const { init: initSocket } = require('./services/socketServices.js');

const app = initExpress();
const { server, io } = initSocket(app);
mountRoutes(app, io);
(async () => configureRedis(io))();

const PORT = express.port || 3000;
server.listen(PORT, () => console.log(`Servidor: http://localhost:${PORT}`));