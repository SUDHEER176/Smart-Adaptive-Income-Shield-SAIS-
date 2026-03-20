const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { checkFraud } = require('../services/fraudService');
const decisionEngine = require('../services/decisionEngine');
const { getWeatherData } = require('../services/weatherService');

const claimsController = {
  // File a claim
  fileClaim: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { policyId, loss, weatherCondition, timeSlot } = req.body;

      if (!userId || !policyId || !loss) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify policy belongs to user
      const policy = await Policy.findOne({ id: policyId, user_id: userId });
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      // Get user
      const user = await User.findById(userId);

      // Fraud check
      const fraudCheck = await checkFraud({ loss }, user);

      // Get weather
      const weather = await getWeatherData(user.city);

      // Decide payout
      const payout = await decisionEngine.decidePayout(
        { loss, time: timeSlot },
        user,
        weather
      );

      // Create claim using Supabase
      const status = fraudCheck.fraudRisk ? 'rejected' : 'approved';
      const claim = await Claim.create({
        user_id: userId,
        policy_id: policyId,
        loss,
        payout,
        status: status,
        weather_condition: weatherCondition || weather.condition,
        fraud_check: fraudCheck.fraudRisk,
        reason: fraudCheck.fraudRisk ? `Fraud detected: ${fraudCheck.flags.join(', ')}` : 'Auto-approved'
      });

      // Update user
      const pointsToAdd = status === 'approved' ? Math.ceil(payout / 50) : 0;
      const newBehaviorScore = fraudCheck.fraudRisk ? user.behavior_score - 20 : user.behavior_score;
      
      await User.updateById(userId, {
        total_claims: user.total_claims + 1,
        fraud_risk: fraudCheck.fraudRisk || user.fraud_risk,
        behavior_score: newBehaviorScore,
        points: user.points + pointsToAdd
      });

      // Auto-trigger payout if approved
      let finalStatus = status;
      if (status === 'approved') {
        finalStatus = 'paid';
        await Claim.updateOne({ id: claim.id }, { status: 'paid' });
      }

      res.status(201).json({
        message: '✅ Claim processed',
        claim: {
          id: claim.id,
          loss: claim.loss,
          payout: claim.payout,
          status: finalStatus,
          fraudCheck: fraudCheck.fraudRisk,
          createdAt: claim.created_at
        },
        fraudAnalysis: {
          verdict: fraudCheck.verdict,
          fraudScore: fraudCheck.fraudScore,
          flags: fraudCheck.flags
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user claims
  getUserClaims: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const claims = await Claim.find({ userId }).sort({ createdAt: -1 });

      const summary = {
        totalClaims: claims.length,
        totalLoss: claims.reduce((sum, c) => sum + c.loss, 0),
        totalPayout: claims.reduce((sum, c) => sum + c.payout, 0),
        approvedCount: claims.filter(c => c.status === 'paid').length,
        rejectedCount: claims.filter(c => c.status === 'rejected').length
      };

      res.json({ claims, summary });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all claims (admin)
  getAllClaims: async (req, res) => {
    try {
      const claims = await Claim.find().populate('userId', 'name email city').sort({ createdAt: -1 });
      res.json({ claims });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = claimsController;
