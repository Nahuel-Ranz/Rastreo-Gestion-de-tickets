const express = require('express');
const router = express.Router();

// formularios
router.get('/', (req, res) => res.render('forms/login'));
router.get('/registro', (req, res) => res.render('forms/register'));
router.get('/establecer_clave', (req, res) => res.render('forms/set_password'));
router.get('/recuperar_clave/email', (req, res) => res.render('forms/recovery_password/email'));
router.get('/recuperar_clave/clave', (req, res) => res.render('forms/recovery_password/key'));
router.get('/recuperar_clave/nueva_clave', (req, res) => res.render('forms/recovery_password/new_password'));

// páginas
router.get('/lista_de_espera', (req, res) => res.render('index'));
router.get('/cola_de_ejecucion', (req, res) => res.render('execution_queue'));
router.get('/perfil', (req, res) => res.render('profile'));
router.get('/estadisticas', (req, res) => res.render('dashboard'));
router.get('/configuraciones', (req, res) => res.render('settings'));
router.get('/notificaciones', (req, res) => res.render('notifications'));
router.get('/tipos_de_cuentas', (req, res) => res.render('access_control_dashboard'));

module.exports = router;