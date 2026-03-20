import React, { useState, useEffect } from 'react';
import { predictionService } from '../api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState('morning');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboard();
  }, [selectedTime]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await predictionService.getDashboard(token, user.city, selectedTime);
      setUserData(response.data.user);
      setPrediction(response.data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🏠 Dashboard</h1>
        <div className="user-info">
          <p>Welcome, {userData?.name}! 👋</p>
          <p className="city">{userData?.city} • {userData?.jobType}</p>
        </div>
      </header>

      {/* Main Prediction Card */}
      <div className="prediction-card main">
        <h2>📊 Tomorrow's Prediction</h2>
        <div className="time-selector">
          {['morning', 'afternoon', 'evening'].map(time => (
            <button
              key={time}
              className={selectedTime === time ? 'active' : ''}
              onClick={() => setSelectedTime(time)}
            >
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </button>
          ))}
        </div>

        <div className="prediction-details">
          <div className="stat">
            <label>💰 Predicted Loss</label>
            <div className="highlight">₹{prediction?.tomorrow?.predictedLoss || 0}</div>
          </div>
          <div className="stat">
            <label>🎯 Confidence</label>
            <div className="confidence-score">{prediction?.tomorrow?.confidence || 0}%</div>
          </div>
          <div className="stat">
            <label>⚠️ Risk Level</label>
            <div className={`risk-${prediction?.tomorrow?.riskLevel?.toLowerCase() || 'low'}`}>
              {prediction?.tomorrow?.riskLevel || 'LOW'} 🔴
            </div>
          </div>
          <div className="stat">
            <label>🌦️ Weather</label>
            <div>{prediction?.tomorrow?.weather || 'Unknown'}</div>
          </div>
        </div>

        <div className="recommendation">
          <p>💡 {prediction?.recommendation || 'Get insights'}</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="score-card">
        <h3>🎮 Your Score</h3>
        <div className="score-display">
          <span className="score-number">{userData?.behaviorScore || 85}</span>
          <span className="score-label">/100</span>
        </div>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${userData?.behaviorScore || 85}%` }}></div>
        </div>
        <p>Points: ⭐ {userData?.points || 0}</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={() => window.location.href = '/simulator'}>
          ▶ Run Simulation
        </button>
        <button className="btn btn-success" onClick={() => window.location.href = '/insurance'}>
          🛡️ Buy Insurance
        </button>
        <button className="btn btn-info" onClick={() => window.location.href = '/risk-map'}>
          📍 View Risk Map
        </button>
      </div>
    </div>
  );
}
