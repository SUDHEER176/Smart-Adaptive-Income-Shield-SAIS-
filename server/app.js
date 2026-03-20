const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
require('./database');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/prediction', require('./routes/predictionRoutes'));
app.use('/api/insurance', require('./routes/insuranceRoutes'));
app.use('/api/simulation', require('./routes/simulationRoutes'));
app.use('/api/claims', require('./routes/claimsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: '✅ GigShield API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GigShield Server running on port ${PORT}`);
});
