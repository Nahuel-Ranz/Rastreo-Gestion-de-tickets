
const express = require('express');
const path = require('path');
const activityMiddleware = require('../middlewares/activityMiddleware');

let app = null
function init() {
    if(!app) {
        global.__root = path.resolve(__dirname, '..');
        app = express();
    
        app.set('views', path.join(__root, 'views'));
        app.set('view engine', 'ejs');
        
        app.use(express.static(path.join(__root, 'public')));
        app.use(express.json());
        app.use(express.urlencoded({ extended:true }));
        
        app.use(activityMiddleware);
        
        app.use('/', require('../routes/views'));
        app.use('/', require('../routes/actions'));
        app.use(require('../routes/error_handling'));
    }
    return app;
}

module.exports = { init }