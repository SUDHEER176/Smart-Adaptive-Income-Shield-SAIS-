import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Auth Service
export const authService = {
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  getProfile: (token) => axios.get(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

// Prediction Service
export const predictionService = {
  getPrediction: (city, timeSlot) => 
    axios.post(`${API_BASE}/prediction/get`, { city, timeSlot }),
  getDashboard: (token, city, timeSlot) =>
    axios.post(`${API_BASE}/prediction/dashboard`, { city, timeSlot }, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getRiskMap: () => axios.get(`${API_BASE}/prediction/riskmap`)
};

// Insurance Service
export const insuranceService = {
  getPlans: () => axios.get(`${API_BASE}/insurance/plans`),
  buyPlan: (token, data) =>
    axios.post(`${API_BASE}/insurance/buy`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getUserPolicies: (token) =>
    axios.get(`${API_BASE}/insurance/mypolicies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Simulation Service
export const simulationService = {
  runSimulation: (city, baseTimeSlot, alternateTimeSlot) =>
    axios.post(`${API_BASE}/simulation/run`, { city, baseTimeSlot, alternateTimeSlot }),
  compareTimeSlots: (city) =>
    axios.post(`${API_BASE}/simulation/compare`, { city })
};

// Claims Service
export const claimsService = {
  fileClaim: (token, data) =>
    axios.post(`${API_BASE}/claims/file`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  getUserClaims: (token) =>
    axios.get(`${API_BASE}/claims/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
};

// Admin Service
export const adminService = {
  getStats: () => axios.get(`${API_BASE}/admin/stats`),
  getRiskHeatmap: () => axios.get(`${API_BASE}/admin/heatmap`),
  getHighRiskAreas: () => axios.get(`${API_BASE}/admin/high-risk`)
};
