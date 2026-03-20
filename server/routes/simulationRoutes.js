const express = require('express');
const simulationController = require('../controllers/simulationController');
const router = express.Router();

// Routes
router.post('/run', simulationController.runSimulation);
router.post('/compare', simulationController.compareTimeSlots);

module.exports = router;
