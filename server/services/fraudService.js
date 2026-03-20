// Real-Time Fraud Service Model
const checkFraud = async (claim, user) => {
  let fraudScore = 0;
  const flags = [];

  // Check 1: Too many claims
  if (user.total_claims > 5) {
    fraudScore += 30;
    flags.push('High claim frequency');
  }

  // Check 2: Behavior drop
  if (user.behavior_score < 60) {
    fraudScore += 25;
    flags.push('Low historical reliability');
  }

  // Check 3: Suspiciously high unverified loss
  if (claim.loss > 2000) {
    fraudScore += 20;
    flags.push('Anomalous claim value');
  }

  // Real-time Risk Assessment logic
  const fraudRisk = fraudScore > 50;

  return {
    fraudRisk: fraudRisk,
    fraudScore: Math.min(fraudScore, 100),
    flags,
    verdict: fraudRisk ? 'HIGH RISK' : 'VERIFIED'
  };
};

const checkGPSMismatch = async (userLocation, claimLocation) => {
  const distance = Math.random() * 5; 
  return {
    mismatch: distance > 2,
    distance: distance.toFixed(2),
    riskLevel: distance > 2 ? 'HIGH' : 'LOW'
  };
};

module.exports = {
  checkFraud,
  checkGPSMismatch
};
