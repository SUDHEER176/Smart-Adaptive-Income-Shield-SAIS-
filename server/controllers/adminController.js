const User = require('../models/User');
const Claim = require('../models/Claim');
const LossAnalytics = require('../models/LossAnalytics');

const adminController = {
  // Get dashboard stats
  getStats: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const claims = await Claim.find();
      const users = await User.find();

      const totalClaims = claims.length;
      const totalPayout = claims.reduce((sum, c) => sum + (c.payout || 0), 0);

      // Group claims by status
      const claimsByStatus = {};
      claims.forEach(claim => {
        claimsByStatus[claim.status] = (claimsByStatus[claim.status] || 0) + 1;
      });

      // Calculate average behavior score
      const avgBehaviorScore = users.length > 0 
        ? users.reduce((sum, u) => sum + (u.behavior_score || 0), 0) / users.length 
        : 0;

      // Count high-risk users
      const highRiskUsers = users.filter(u => (u.behavior_score || 100) < 60).length;

      res.json({
        totalUsers,
        totalClaims,
        totalPayout,
        claimsByStatus,
        avgBehaviorScore: Math.round(avgBehaviorScore),
        highRiskUsers,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get risk map (heatmap data)
  getRiskHeatmap: async (req, res) => {
    try {
      const users = await User.find();
      const claims = await Claim.find();

      // Group users by city
      const usersByCity = {};
      users.forEach(user => {
        if (!usersByCity[user.city]) {
          usersByCity[user.city] = { count: 0, totalScore: 0 };
        }
        usersByCity[user.city].count += 1;
        usersByCity[user.city].totalScore += user.behavior_score || 0;
      });

      // Group claims by city
      const claimsByCity = {};
      claims.forEach(claim => {
        const user = users.find(u => u.id === claim.user_id);
        if (user) {
          if (!claimsByCity[user.city]) {
            claimsByCity[user.city] = { totalLoss: 0, totalPayout: 0, claimCount: 0 };
          }
          claimsByCity[user.city].totalLoss += claim.loss || 0;
          claimsByCity[user.city].totalPayout += claim.payout || 0;
          claimsByCity[user.city].claimCount += 1;
        }
      });

      // Build heatmap
      const heatmap = Object.keys(usersByCity).map(city => {
        const userStats = usersByCity[city];
        const claimStats = claimsByCity[city] || { totalLoss: 0, totalPayout: 0, claimCount: 0 };
        const avgScore = userStats.totalScore / userStats.count;
        
        return {
          city,
          users: userStats.count,
          avgBehaviorScore: Math.round(avgScore),
          totalLoss: claimStats.totalLoss,
          totalPayout: claimStats.totalPayout,
          claimCount: claimStats.claimCount,
          riskLevel: avgScore < 70 ? 'HIGH' : avgScore < 80 ? 'MEDIUM' : 'LOW'
        };
      });

      res.json({ heatmap });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get high-risk areas
  getHighRiskAreas: async (req, res) => {
    try {
      const users = await User.find();
      
      // Group users by city and filter by behavior score
      const highRiskByCity = {};
      users.forEach(user => {
        if ((user.behavior_score || 100) < 60) {
          if (!highRiskByCity[user.city]) {
            highRiskByCity[user.city] = 0;
          }
          highRiskByCity[user.city] += 1;
        }
      });
      
      // Convert to sorted array
      const highRisk = Object.entries(highRiskByCity)
        .map(([city, count]) => ({ _id: city, count }))
        .sort((a, b) => b.count - a.count);

      res.json({ highRiskAreas: highRisk });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user behavior score (admin)
  updateUserScore: async (req, res) => {
    try {
      const { userId, newScore } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { behaviorScore: Math.max(0, Math.min(100, newScore)) },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: '✅ Score updated', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminController;
