const express = require('express');
const router = express.Router();

router.use((req, res) => res.status(404).render('errors/404', { login: false }));

module.exports = router;