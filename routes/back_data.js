const express = require('express');
const router = express.Router();
const backDataController = require('../controllers/backDataControllers');

router.get('/areas', backDataController.obtenerAreas);

module.exports = router;