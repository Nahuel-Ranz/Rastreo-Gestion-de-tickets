const express = require('express');
const router = express.Router();

router.use((req, res) => {
    res.status(404).render('pages/errors/404', {
        title: 'ERROR 404',
        subtitle: 'Página no encontrada!!!'
    });
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.render(500).render('pages/errors/500', {
        title: 'ERROR 500',
        subtitle: 'Inconvenientes con el Servidor'
    });
});

module.exports = router;