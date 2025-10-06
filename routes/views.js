const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('login'));
router.get('/waiting_list', (req, res) => res.render('index'));
router.get('/execution_queue', (req, res) => res.render('execution_queue'));
router.get('/profile', (req, res) => res.render('profile'));
router.get('/statistics', (req, res) => res.render('dashboard'));
router.get('/settings', (req, res) => res.render('settings'));
router.get('/notifications', (req, res) => res.render('notifications'));
router.get('/account_types', (req, res) => res.render('account_types'));

module.exports = router;