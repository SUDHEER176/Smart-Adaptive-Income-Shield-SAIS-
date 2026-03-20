const { getPrediction, simulateLoss } = require('../services/aiService');
const { getWeatherData } = require('../services/weatherService');

const simulationController = {
  // Run what-if simulation
  runSimulation: async (req, res) => {
    try {
      const { city, baseTimeSlot, alternateTimeSlot } = req.body;

      if (!city || !baseTimeSlot) {
        return res.status(400).json({ error: 'City and baseTimeSlot required' });
      }

      const weather = await getWeatherData(city);

      // Base scenario
      const basePrediction = await getPrediction(city, 'Delivery', baseTimeSlot, weather);

      // Simulate loss with and without insurance
      const simulation = await simulateLoss(basePrediction, null);

      res.json({
        scenario: 'What-If Analysis',
        baseTimeSlot,
        city,
        weather: {
          condition: weather.condition,
          rainProbability: weather.rainProbability
        },
        basePrediction,
        simulation
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Compare time slots
  compareTimeSlots: async (req, res) => {
    try {
      const { city } = req.body;

      if (!city) {
        return res.status(400).json({ error: 'City required' });
      }

      const weather = await getWeatherData(city);
      const timeSlots = ['morning', 'afternoon', 'evening'];
      const comparison = [];

      for (const slot of timeSlots) {
        const prediction = await getPrediction(city, 'Delivery', slot, weather);
        comparison.push({
          timeSlot: slot,
          predictedLoss: prediction.predictedLoss,
          riskLevel: prediction.riskLevel,
          confidence: prediction.confidence
        });
      }

      res.json({
        city,
        weather: weather.condition,
        comparison
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = simulationController;
