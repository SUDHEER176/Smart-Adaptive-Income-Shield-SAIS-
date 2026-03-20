import React, { useState, useEffect } from 'react';
import { adminService } from '../api';
import '../styles/admin.css';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [highRiskAreas, setHighRiskAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await adminService.getStats();
      setStats(statsRes.data);

      const heatmapRes = await adminService.getRiskHeatmap();
      setHeatmap(heatmapRes.data.heatmap);

      const highRiskRes = await adminService.getHighRiskAreas();
      setHighRiskAreas(highRiskRes.data.highRiskAreas);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-container">
      <header>
        <h1>⚙️ Admin Dashboard</h1>
        <p>System Overview & Analytics</p>
      </header>

      {stats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>👥 Total Users</h3>
            <div className="metric-value">{stats.totalUsers}</div>
          </div>
          <div className="metric-card">
            <h3>📋 Total Claims</h3>
            <div className="metric-value">{stats.totalClaims}</div>
          </div>
          <div className="metric-card">
            <h3>💸 Total Payout</h3>
            <div className="metric-value">₹{stats.totalPayout.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <h3>🎯 Avg Behavior Score</h3>
            <div className="metric-value">{Math.round(stats.avgBehaviorScore)}</div>
          </div>
          <div className="metric-card alert">
            <h3>🚨 High Risk Users</h3>
            <div className="metric-value">{stats.highRiskUsers}</div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <h2>🗺️ City Risk Heatmap</h2>
        <table>
          <thead>
            <tr>
              <th>City</th>
              <th>Users</th>
              <th>Avg Score</th>
              <th>Total Loss</th>
              <th>Total Payout</th>
              <th>Claims</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {heatmap.map(item => (
              <tr key={item.city} className={`risk-${item.riskLevel.toLowerCase()}`}>
                <td>{item.city}</td>
                <td>{item.users}</td>
                <td>{item.avgBehaviorScore}</td>
                <td>₹{item.totalLoss}</td>
                <td>₹{item.totalPayout}</td>
                <td>{item.claimCount}</td>
                <td>{item.riskLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-section">
        <h2>🚨 High-Risk Areas</h2>
        <ul>
          {highRiskAreas.map(area => (
            <li key={area._id}>
              {area._id}: <strong>{area.count}</strong> high-risk users
            </li>
          ))}
        </ul>
      </div>

      <div className="claims-breakdown">
        <h2>📊 Claims Status Breakdown</h2>
        {stats?.claimsByStatus && (
          <div className="status-breakdown">
            {Object.entries(stats.claimsByStatus).map(([status, count]) => (
              <div key={status} className={`status-item status-${status}`}>
                <p>{status.toUpperCase()}</p>
                <h3>{count}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
