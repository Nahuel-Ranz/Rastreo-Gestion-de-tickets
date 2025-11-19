require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { getRedis } = require('./storage/connections.js')
const activityMiddleware = require('./middlewares/activityMiddleware.js');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
(async () => {
    const redis = await getRedis();
    
    app.use(session({
        store: new RedisStore({ client:redis, prefix:"sess:" }),
        secret: process.env.SESSION_SECRET,
        resave:false,
        saveUninitialized:false,
        cookie:{
            maxAge:1000*60*30,
            secure: false,
            httpOnly: true
        }
    }));
})();
app.use(activityMiddleware);

app.use('/', require('./routes/views'));
app.use('/', require('./routes/actions'));
app.use(require('./routes/error_handling'));

const PORT = process.env.EXPRESS_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
});