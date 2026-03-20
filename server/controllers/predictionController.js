const User = require('../models/User');
const { getPrediction } = require('../services/aiService');
const { getWeatherData } = require('../services/weatherService');
const decisionEngine = require('../services/decisionEngine');

const predictionController = {
  // Get loss prediction for today/tomorrow
  getPrediction: async (req, res) => {
    try {
      const { city, timeSlot } = req.body;

      if (!city || !timeSlot) {
        return res.status(400).json({ error: 'City and timeSlot required' });
      }

      // Get weather data
      const weather = await getWeatherData(city);

      // Get AI prediction
      const prediction = await getPrediction(city, 'Delivery', timeSlot, weather);

      // Get insurance price
      const insurancePrice = decisionEngine.calculatePremium(prediction.riskLevel, timeSlot);

      res.json({
        city,
        timeSlot,
        ...prediction,
        insurancePrice,
        weather: {
          temperature: weather.temperature,
          condition: weather.condition,
          rainProbability: weather.rainProbability
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get risk map
  getRiskMap: async (req, res) => {
    try {
      const cities = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore'];
      const timeSlots = ['morning', 'afternoon', 'evening'];

      const riskMap = [];

      for (const city of cities) {
        const weather = await getWeatherData(city);

        for (const timeSlot of timeSlots) {
          const prediction = await getPrediction(city, 'Delivery', timeSlot, weather);
          riskMap.push({
            city,
            timeSlot,
            ...prediction
          });
        }
      }

      res.json({ riskMap });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get dashboard data
  getDashboard: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { city, timeSlot } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const weather = await getWeatherData(city || user.city);
      const prediction = await getPrediction(city || user.city, user.job_type, timeSlot || 'morning', weather);
      const insurancePrice = decisionEngine.calculatePremium(prediction.riskLevel, timeSlot || 'morning');

      res.json({
        user: {
          name: user.name,
          city: user.city,
          jobType: user.job_type,
          behaviorScore: user.behavior_score,
          points: user.points
        },
        dashboard: {
          tomorrow: {
            predictedLoss: prediction.predictedLoss,
            confidence: prediction.confidence + '%',
            riskLevel: prediction.riskLevel,
            weather: weather.condition,
            rainProbability: weather.rainProbability + '%'
          },
          recommendation: prediction.recommendation,
          insurancePrice
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = predictionController;
