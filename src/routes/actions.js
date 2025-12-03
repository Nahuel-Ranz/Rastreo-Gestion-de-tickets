const { srcPath } = require('../utils/utils');
const express = require('express');
const router = express.Router();
const userController = require(`${srcPath}controllers/userController`);
const registerController = require(`${srcPath}controllers/registerController`);

router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.post('/verificar_usuario', registerController.checkNewUser);
router.post('/verificar_correo', registerController.sendCode);
router.post('/verificar_codigo', registerController.checkCode);
router.post('/re-send_code', registerController.reSendCode);
router.post('/saveNorimalizedData', registerController.saveNormalizedData);
router.post('/setPassword', registerController.setPassword);

module.exports = router;