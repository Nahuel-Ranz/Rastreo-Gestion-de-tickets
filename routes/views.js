const express = require('express');
const router = express.Router();
const { requests } = require('../utils/mocks'); // remove from here

router.get('/', (req, res) => {
    res.render('session_control/login', { requests });
});

module.exports = router;