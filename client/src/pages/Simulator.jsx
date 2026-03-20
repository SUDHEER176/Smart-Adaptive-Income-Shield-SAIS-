import React, { useState, useEffect } from 'react';
import { simulationService } from '../api';
import '../styles/simulator.css';

export default function Simulator() {
  const [city, setCity] = useState('Hyderabad');
  const [selectedSlot, setSelectedSlot] = useState('morning');
  const [simulation, setSimulation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.city) setCity(user.city);
  }, []);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const response = await simulationService.runSimulation(city, selectedSlot);
      setSimulation(response.data);

      // Get comparison
      const compRes = await simulationService.compareTimeSlots(city);
      setComparison(compRes.data);
    } catch (error) {
      console.error('Error running simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulator-container">
      <header>
        <h1>🧠 What-If Simulator</h1>
        <p>Run scenarios and see impact on your earnings</p>
      </header>

      <div className="simulator-controls">
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option>Hyderabad</option>
          <option>Mumbai</option>
          <option>Delhi</option>
          <option>Bangalore</option>
        </select>

        <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
          <option value="morning">🌅 Morning</option>
          <option value="afternoon">☀️ Afternoon</option>
          <option value="evening">🌆 Evening</option>
        </select>

        <button onClick={runSimulation} disabled={loading} className="btn-run">
          {loading ? '⏳ Running...' : '▶ Run Simulation'}
        </button>
      </div>

      {simulation && (
        <div className="simulation-result">
          <h2>📊 Results for {simulation.baseTimeSlot}</h2>
          <div className="result-boxes">
            <div className="result-box">
              <h3>Without Insurance</h3>
              <div className="highlight-red">₹{simulation.simulation.withoutInsurance}</div>
              <p>💸 Total Loss</p>
            </div>
            <div className="result-box">
              <h3>With Insurance</h3>
              <div className="highlight-green">₹{simulation.simulation.withInsurance}</div>
              <p>✅ You Pay</p>
            </div>
            <div className="result-box">
              <h3>💰 Savings</h3>
              <div className="highlight-blue">₹{simulation.simulation.saved}</div>
              <p>Protected Amount</p>
            </div>
          </div>

          <div className="recommendation">
            <p>{simulation.simulation.recommendation}</p>
          </div>
        </div>
      )}

      {comparison && (
        <div className="time-slot-comparison">
          <h2>⏰ Compare Time Slots</h2>
          <table>
            <thead>
              <tr>
                <th>Time Slot</th>
                <th>Predicted Loss</th>
                <th>Risk Level</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {comparison.comparison.map(item => (
                <tr key={item.timeSlot} className={`risk-${item.riskLevel?.toLowerCase()}`}>
                  <td>{item.timeSlot}</td>
                  <td>₹{item.predictedLoss}</td>
                  <td>{item.riskLevel}</td>
                  <td>{item.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
