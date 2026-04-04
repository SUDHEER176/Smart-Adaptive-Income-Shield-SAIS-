/**
 * Dynamic Premium Calculation Engine
 * Factors: Base Premium, Risk Score, Working Hours, Zone Risk, Claim History
 */

function calculatePremium(worker, zone, claimHistory = []) {
  // Base premium (weekly)
  const basePremium = 200;

  // Risk-based adjustment (0-100 scale)
  const riskAdjustment = worker.riskScore * 150; // Up to 150 per week
  
  // Working hours bonus (incentive for stability)
  const weeklyHours = worker.weeklyHours || 40;
  const hoursBonus = Math.max(0, (weeklyHours - 30) * 5); // ₹5 per hour above 30hrs
  
  // Zone risk multiplier
  const zoneRisk = zone ? zone.riskScore * 100 : 0; // Up to 100 per week
  
  // Claim frequency penalty
  const claimsPenalty = Math.min(100, claimHistory.length * 25); // Up to 100 for multiple claims
  
  // Calculate final premium
  const totalPremium = Math.round(
    basePremium + 
    riskAdjustment + 
    hoursBonus + 
    zoneRisk - 
    (claimsPenalty * 0.2) // Only 20% impact as penalty
  );

  return {
    totalPremium: Math.max(150, totalPremium), // Minimum ₹150
    breakdown: {
      basePremium,
      riskAdjustment: Math.round(riskAdjustment),
      hoursBonus: Math.round(hoursBonus),
      zoneRisk: Math.round(zoneRisk),
      claimsPenalty: Math.round(claimsPenalty * 0.2)
    },
    factors: {
      workerRiskScore: worker.riskScore,
      weeklyHours: weeklyHours,
      zoneRiskScore: zone?.riskScore || 0,
      recentClaims: claimHistory.length
    }
  };
}

function getCoverageLimit(premium, worker, zone) {
  // Coverage limit based on premium and risk
  const baseCoverage = 50000;
  const premiumMultiplier = premium / 200; // Base is 50K at 200 premium
  const riskAdjustment = Math.max(0.5, 1 - worker.riskScore * 0.3); // Lower risk = higher coverage
  
  const coverageLimit = Math.round(baseCoverage * premiumMultiplier * riskAdjustment);
  
  return {
    coverageLimit: Math.max(30000, coverageLimit), // Minimum 30K
    monthlyPayout: Math.round(coverageLimit / 4), // Approximate monthly
  };
}

function getValidityPeriod(startDate = null) {
  const start = startDate ? new Date(startDate) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7); // Weekly validity
  
  return {
    weekStart: start.toISOString().split('T')[0],
    weekEnd: end.toISOString().split('T')[0],
    daysRemaining: 7
  };
}

module.exports = {
  calculatePremium,
  getCoverageLimit,
  getValidityPeriod
};
