const express = require('express');
const predictionController = require('../controllers/predictionController');
const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Public routes
router.post('/get', predictionController.getPrediction);
router.get('/riskmap', predictionController.getRiskMap);

// Protected routes
router.post('/dashboard', verifyToken, predictionController.getDashboard);

module.exports = router;
