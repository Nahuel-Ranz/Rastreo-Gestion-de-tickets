const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const registerController = require('../controllers/registerController.js');

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.post('/verificar_usuario', registerController.checkNewUser);
router.post('/verificar_correo', registerController.sendCode);
router.post('/re-send_code', registerController.reSendCode);

module.exports = router;