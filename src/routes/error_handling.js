const express = require('express');
const router = express.Router();
const ejs = require('ejs');
const { ejsPath } = require('../utils/utils.js');

router.use( async (req, res) => {
    const e404 = await ejs.renderFile(`${ejsPath}../errors/404.ejs`,
        { login: req.session && req.session.userId }
    );
    
    res.status(404).render('base.ejs', { title:'ERROR 404', content:e404 });
});

module.exports = router;