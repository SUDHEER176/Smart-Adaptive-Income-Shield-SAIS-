// Real-Time Rules-Based AI Engine (No ML training needed, mathematical heuristic)
const getPrediction = async (city, jobType, timeSlot, weather) => {
  try {
    const baseRisk = { morning: 150, afternoon: 250, evening: 450 };
    
    // Impact multipliers based on real live weather fetched
    const weatherMultiplier = {
      'Clear': 0.8,
      'Partly Cloudy': 1.0,
      'Cloudy': 1.1,
      'Moderate': 1.2,
      'Rainy': 2.5
    };

    let baseLoss = baseRisk[timeSlot] || 250;
    const weatherFactor = weatherMultiplier[weather.condition] || 1.2;
    
    // Mathematical calculation of predicted risk using live variables
    let predictedLoss = Math.round(baseLoss * weatherFactor);

    if (weather.temperature >= 40) {
      predictedLoss = Math.round(predictedLoss * 1.6); // Heatwave constraint
    }

    if (weather.rainProbability > 70) {
      predictedLoss = Math.round(predictedLoss * 1.5);
    }

    let confidence = 85; 
    if (weather.rainProbability > 70) confidence += 10;
    if (weather.rainProbability < 30) confidence -= 10;
    confidence = Math.min(Math.max(confidence, 50), 95);

    let riskLevel = 'LOW';
    if (weather.temperature >= 40) riskLevel = 'EXTREME HEAT';
    else if (predictedLoss > 400) riskLevel = 'HIGH';
    else if (predictedLoss > 200) riskLevel = 'MEDIUM';

    let rec = 'Standard Day. Work safe.';
    if (riskLevel === 'HIGH' && weather.rainProbability > 70) rec = 'Heavy rain expected tomorrow. Expect significant delays. Buy coverage.';
    else if (riskLevel === 'EXTREME HEAT') rec = 'Extreme heatwave condition detected. Exhaustion risk is high. Protect your income.';

    return {
      predictedLoss,
      confidence,
      riskLevel,
      riskScore: Math.round(predictedLoss / 10),
      weather: weather.temperature >= 40 ? `Heatwave (${weather.temperature}°C)` : weather.condition,
      rainProbability: weather.rainProbability,
      recommendation: rec
    };
  } catch (error) {
    console.error('AI Calculation Error:', error);
    throw error;
  }
};

const simulateLoss = async (baseScenario, alternateScenario) => {
  const withoutInsurance = baseScenario.predictedLoss;
  const coverage = 400; 
  const withInsurance = Math.max(withoutInsurance - coverage, 0);

  return {
    scenario: 'What-If Analysis',
    withoutInsurance: withoutInsurance,
    withInsurance: withInsurance,
    saved: withoutInsurance - withInsurance,
    recommendation: (withoutInsurance - withInsurance) > 100 ? 'Buy Coverage against real-time threats' : 'Optional'
  };
};

const calculateBehaviorScore = (user, claimHistory) => {
  let score = user.behavior_score || 85;
  if (claimHistory.length > 5) score -= 15;
  return Math.max(Math.min(score, 100), 0);
};

module.exports = {
  getPrediction,
  simulateLoss,
  calculateBehaviorScore
};
