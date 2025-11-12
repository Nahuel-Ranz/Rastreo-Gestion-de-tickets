const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const registerController = require('../controllers/registerController.js');

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.post('/verificar_usuario', registerController.checkNewUser);

module.exports = router;