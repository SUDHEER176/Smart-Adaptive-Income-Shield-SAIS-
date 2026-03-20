import React, { useState, useEffect } from 'react';
import { predictionService } from '../api';
import '../styles/riskmap.css';

export default function RiskMap() {
  const [riskMap, setRiskMap] = useState([]);
  const [filter, setFilter] = useState('HIGH');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskMap();
  }, []);

  const fetchRiskMap = async () => {
    try {
      setLoading(true);
      const response = await predictionService.getRiskMap();
      setRiskMap(response.data.riskMap);
    } catch (error) {
      console.error('Error fetching risk map:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = riskMap.filter(item => 
    filter === 'ALL' || item.riskLevel === filter
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="riskmap-container">
      <header>
        <h1>📍 Risk Map</h1>
        <p>Real-time risk levels by city and time</p>
      </header>

      <div className="filter-controls">
        {['LOW', 'MEDIUM', 'HIGH', 'ALL'].map(level => (
          <button
            key={level}
            className={`filter-btn ${filter === level ? 'active' : ''}`}
            onClick={() => setFilter(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="heatmap-grid">
        {filteredData.map((item, idx) => (
          <div key={idx} className={`heatmap-cell risk-${item.riskLevel.toLowerCase()}`}>
            <h4>{item.city}</h4>
            <p className="time">{item.timeSlot}</p>
            <p className="loss">₹{item.predictedLoss}</p>
            <p className="risk">{item.riskLevel}</p>
            <p className="confidence">🎯 {item.confidence}%</p>
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item low">Low Risk</div>
        <div className="legend-item medium">Medium Risk</div>
        <div className="legend-item high">High Risk</div>
      </div>
    </div>
  );
}
