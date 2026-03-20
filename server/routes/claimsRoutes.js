const express = require('express');
const claimsController = require('../controllers/claimsController');
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

// Protected routes
router.post('/file', verifyToken, claimsController.fileClaim);
router.get('/my', verifyToken, claimsController.getUserClaims);

// Admin route
router.get('/all', claimsController.getAllClaims);

module.exports = router;
