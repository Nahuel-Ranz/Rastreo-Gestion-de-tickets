module.exports = ({ io }) => {
    const { srcPath } = require('../utils/utils');
    const express = require('express');
    const router = express.Router();
    const viewController = require(`${srcPath}controllers/viewController.js`);
    const { isAuthenticated, isGuest } = require(`${srcPath}middlewares/authMiddleware.js`);
    
    // formularios
    router.get('/', isGuest, viewController.renderLogin );
    router.get('/registro', isGuest, viewController.renderRegister );
    router.get('/establecer_clave', isGuest, viewController.renderSetPassword );
    router.get('/esperando_confirmacion', isGuest, viewController.renderWaitingConfirm );
    router.get('/recuperar_clave/email', isGuest, viewController.renderRecoveryPasswordEmail );
    router.get('/recuperar_clave/nueva_clave', isGuest, viewController.renderRecoveryPasswordNewPassword );
    router.get('/clave_actualizada', isGuest, viewController.renderUpdatedPassword );
    router.get('/crear_ticket', isAuthenticated, (req, res) => res.render('forms/new_ticket', { login:true }));
    
    // páginas
    router.get('/lista_de_espera', isAuthenticated, viewController.renderWaitingList );
    router.get('/cola_de_ejecucion', isAuthenticated, viewController.renderExecutionQueue );
    router.get('/perfil', isAuthenticated, viewController.renderProfile );
    router.get('/estadisticas', isAuthenticated, (req, res) => res.render('dashboard', { login:true }));
    router.get('/configuraciones', isAuthenticated, (req, res) => res.render('settings', { login:true }));
    router.get('/notificaciones', isAuthenticated, (req, res) => res.render('notifications', { login:true }));
    router.get('/tipos_de_cuentas', isAuthenticated, (req, res) => res.render('access_control_dashboard', { login:true }));

    return router;
};