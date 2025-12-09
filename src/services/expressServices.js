const { srcPath } = require('../utils/utils');
const express = require('express');
const cookieParser = require('cookie-parser');

let app = null
function init() {
    if(!app) {
        app = express();
    
        app.set('views', `${srcPath}views`);
        app.set('view engine', 'ejs');
        
        app.use(express.static(`${srcPath}public`));
        app.use(express.json());
        app.use(express.urlencoded({ extended:true }));
        app.use(cookieParser());
        
        app.use('/', require(`${srcPath}routes/views`));
        app.use('/', require(`${srcPath}routes/actions`));
        app.use(require(`${srcPath}routes/error_handling`));
    }
    return app;
}

module.exports = { init }