const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Register
  register: async (req, res) => {
    try {
      const { name, email, phone, password, city, jobType } = req.body;

      // Validate input
      if (!name || !email || !password || !city || !jobType) {
        return res.status(400).json({ error: 'All fields required' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user using Supabase
      const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        job_type: jobType,
        behavior_score: 85,
        points: 0
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: '✅ User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          city: user.city,
          jobType: user.job_type,
          behaviorScore: user.behavior_score
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        message: '✅ Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          city: user.city,
          jobType: user.job_type,
          behaviorScore: user.behavior_score,
          points: user.points
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;
