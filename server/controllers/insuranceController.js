const Policy = require('../models/Policy');
const User = require('../models/User');
const decisionEngine = require('../services/decisionEngine');

const insuranceController = {
  // Get available plans
  getPlans: async (req, res) => {
    try {
      const plans = [
        {
          id: 1,
          timeSlot: 'Morning',
          riskLevel: 'Low',
          price: 5,
          coverage: 200,
          description: '5 AM - 11 AM coverage'
        },
        {
          id: 2,
          timeSlot: 'Afternoon',
          riskLevel: 'Medium',
          price: 15,
          coverage: 350,
          description: '12 PM - 5 PM coverage'
        },
        {
          id: 3,
          timeSlot: 'Evening',
          riskLevel: 'High',
          price: 20,
          coverage: 500,
          description: '6 PM - 11 PM coverage (Peak risk)'
        }
      ];

      res.json({ plans });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Buy insurance plan
  buyPlan: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { timeSlots, weeklyPlan } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate premium
      let totalPremium = 0;
      for (const slot of timeSlots) {
        const riskLevel = slot === 'morning' ? 'LOW' : slot === 'afternoon' ? 'MEDIUM' : 'HIGH';
        const price = decisionEngine.calculatePremium(riskLevel, slot);
        totalPremium += price;
      }

      // Create policy using Supabase
      const startDate = new Date();
      const endDate = weeklyPlan ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      const policy = await Policy.create({
        user_id: userId,
        weekly_plan: weeklyPlan,
        time_slots: timeSlots,
        premium: totalPremium,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        coverage: timeSlots.length * 200,
        is_active: true
      });

      // Update user points
      const pointsEarned = Math.ceil(totalPremium / 5);
      await User.updateById(userId, {
        points: user.points + pointsEarned
      });

      res.status(201).json({
        message: '✅ Policy purchased successfully',
        policy: {
          id: policy.id,
          timeSlots: policy.time_slots,
          premium: policy.premium,
          coverage: policy.coverage,
          startDate: policy.start_date,
          endDate: policy.end_date,
          weeklyPlan: policy.weekly_plan
        },
        pointsEarned: pointsEarned
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user policies
  getUserPolicies: async (req, res) => {
    try {
      const userId = req.user?.userId;
      
      const policies = await Policy.find({ userId, isActive: true }).sort({ createdAt: -1 });
      res.json({ policies });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Cancel policy
  cancelPolicy: async (req, res) => {
    try {
      const { policyId } = req.params;
      const userId = req.user?.userId;

      const policy = await Policy.findOneAndUpdate(
        { _id: policyId, userId },
        { isActive: false },
        { new: true }
      );

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json({ message: '✅ Policy cancelled', policy });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = insuranceController;
