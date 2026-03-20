const express = require('express');
const insuranceController = require('../controllers/insuranceController');
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
router.get('/plans', insuranceController.getPlans);

// Protected routes
router.post('/buy', verifyToken, insuranceController.buyPlan);
router.get('/mypolicies', verifyToken, insuranceController.getUserPolicies);
router.delete('/cancel/:policyId', verifyToken, insuranceController.cancelPolicy);

module.exports = router;
