const { srcPath } = require('../utils/utils');
const express = require('express');
const cookieParser = require('cookie-parser');
const { refreshSessionCookie } = require(`${srcPath}middlewares/updateSessionCookieMiddleware.js`);

let app = null
function init() {
    if(!app) {
        app = express();
    
        app.set('views', `${srcPath}views`);
        app.set('view engine', 'ejs');
        
        app.use(express.json());
        app.use(express.static(`${srcPath}public`));
        app.use(express.urlencoded({ extended:true }));
        app.use(cookieParser());
        app.use(refreshSessionCookie);
    }
    return app;
}

function mountRoutes(app, io) {
    app.use('/', require(`${srcPath}routes/views`)({ io }));
    app.use('/', require(`${srcPath}routes/actions`)({ io }));
    app.use(require(`${srcPath}routes/error_handling`));
}

module.exports = { init, mountRoutes }