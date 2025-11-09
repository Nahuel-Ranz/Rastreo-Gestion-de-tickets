const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController.js');
const { isAuthenticated, isGuest } = require('../middlewares/authMiddleware.js');

// formularios
router.get('/', isGuest, (req, res) => res.render('forms/login', { login:false }));
router.get('/registro', isGuest, viewController.showRegister );
router.get('/establecer_clave', isGuest, (req, res) => res.render('forms/set_password', { login:false }));
router.get('/recuperar_clave/email', isGuest, (req, res) => res.render('forms/recovery_password/email', { login:false }));
router.get('/recuperar_clave/clave', isGuest, (req, res) => res.render('forms/recovery_password/key', { login:false }));
router.get('/recuperar_clave/nueva_clave', isGuest, (req, res) => res.render('forms/recovery_password/new_password', { login:false }));
router.get('/crear_ticket', isAuthenticated, (req, res) => res.render('forms/new_ticket', { login:true }));

// páginas
router.get('/lista_de_espera', isAuthenticated, viewController.showWaitingList );
router.get('/cola_de_ejecucion', isAuthenticated, (req, res) => res.render('execution_queue', { login:true }));
router.get('/perfil', isAuthenticated, (req, res) => res.render('profile', { login:true }));
router.get('/estadisticas', isAuthenticated, (req, res) => res.render('dashboard', { login:true }));
router.get('/configuraciones', isAuthenticated, (req, res) => res.render('settings', { login:true }));
router.get('/notificaciones', isAuthenticated, (req, res) => res.render('notifications', { login:true }));
router.get('/tipos_de_cuentas', isAuthenticated, (req, res) => res.render('access_control_dashboard', { login:true }));

module.exports = router;