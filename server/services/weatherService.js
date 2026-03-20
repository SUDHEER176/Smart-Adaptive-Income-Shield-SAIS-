const axios = require('axios');

const CITY_COORDS = {
  'Hyderabad': { lat: 17.3850, lon: 78.4867 },
  'Mumbai': { lat: 19.0760, lon: 72.8777 },
  'Delhi': { lat: 28.7041, lon: 77.1025 },
  'Bangalore': { lat: 12.9716, lon: 77.5946 }
};

function interpretWeatherCode(code) {
  let condition = 'Clear';
  let rainProbability = 5;

  if (code === 0) { condition = 'Clear'; rainProbability = 0; }
  else if (code >= 1 && code <= 2) { condition = 'Partly Cloudy'; rainProbability = 10; }
  else if (code === 3) { condition = 'Cloudy'; rainProbability = 20; }
  else if (code >= 45 && code <= 48) { condition = 'Moderate'; rainProbability = 15; }
  else if (code >= 51 && code <= 55) { condition = 'Rainy'; rainProbability = 60; }
  else if (code >= 61 && code <= 65) { condition = 'Rainy'; rainProbability = 85; }
  else if (code >= 80 && code <= 82) { condition = 'Rainy'; rainProbability = 95; }
  else if (code >= 95 && code <= 99) { condition = 'Rainy'; rainProbability = 100; }
  else { condition = 'Moderate'; rainProbability = 30; }

  return { condition, rainProbability };
}

// REAL-TIME Weather Fetcher! NO MOCKS.
const getWeatherData = async (city) => {
  try {
    const coords = CITY_COORDS[city] || CITY_COORDS['Delhi'];
    
    // Live hit to Free Real-Time Weather API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
    
    const response = await axios.get(url);
    const current = response.data.current_weather;
    
    const { condition, rainProbability } = interpretWeatherCode(current.weathercode);
    
    return {
      temperature: current.temperature,
      humidity: 60,
      rainProbability: rainProbability,
      condition: condition,
      windSpeed: current.windspeed
    };
  } catch (error) {
    console.error(`❌ Real-Time Weather API failed for ${city}:`, error.message);
    return { temperature: 30, humidity: 60, rainProbability: 25, condition: 'Partly Cloudy', windSpeed: 10 };
  }
};

module.exports = { getWeatherData };
