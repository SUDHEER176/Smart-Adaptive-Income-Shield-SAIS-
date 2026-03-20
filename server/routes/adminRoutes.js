const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

// Stats
router.get('/stats', adminController.getStats);
router.get('/heatmap', adminController.getRiskHeatmap);
router.get('/high-risk', adminController.getHighRiskAreas);

// Admin actions
router.put('/user-score', adminController.updateUserScore);

module.exports = router;
