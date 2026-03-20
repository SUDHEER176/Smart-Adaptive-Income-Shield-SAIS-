// Dynamic Decision Engine - Real Time Analysis
const decisionEngine = {
  calculatePremium: (riskLevel, timeSlot) => {
    const basePrices = { morning: 15, afternoon: 25, evening: 40 };
    let price = basePrices[timeSlot] || 25;

    const riskMultiplier = { LOW: 1.0, MEDIUM: 1.2, HIGH: 1.8, 'EXTREME HEAT': 2.0 };
    return Math.round(price * (riskMultiplier[riskLevel] || 1));
  },

  decidePayout: async (claim, user, weather) => {
    if (!claim.loss || claim.loss === 0) return 0;

    let payout = claim.loss;
    const maxCoverage = 2000;
    payout = Math.min(payout, maxCoverage);

    // Dynamic penalty for poor behavior
    if (user.behavior_score < 70) {
      payout = Math.round(payout * 0.85); 
    }

    // Dynamic bonus for severe live weather disruption
    if (weather?.temperature >= 40 || weather?.rainProbability > 60) {
      payout = Math.round(payout * 1.15); // Add hazard supplement
    }

    return Math.round(payout);
  },

  calculateGroupPayout: (memberCount, totalPoolSize) => {
    if (memberCount === 0) return 0;
    return Math.round(totalPoolSize / memberCount);
  },

  getRiskLevel: (rainProb, timeSlot, loss) => {
    if (rainProb > 70 || loss > 400) return 'HIGH';
    if (rainProb > 40 || loss > 200) return 'MEDIUM';
    return 'LOW';
  }
};

module.exports = decisionEngine;
