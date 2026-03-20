import React, { useState, useEffect } from 'react';
import { insuranceService, claimsService, authService } from '../api';
import '../styles/profile.css';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userResponse = await authService.getProfile(token);
      setUser(userResponse.data);

      const policiesResponse = await insuranceService.getUserPolicies(token);
      setPolicies(policiesResponse.data.policies);

      const claimsResponse = await claimsService.getUserClaims(token);
      setClaims(claimsResponse.data.claims);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <header>
        <h1>👥 My Profile</h1>
      </header>

      {user && (
        <div className="profile-overview">
          <div className="user-card">
            <h2>{user.name}</h2>
            <p>📍 {user.city} • {user.jobType}</p>
            <p>📧 {user.email}</p>
            <p>📱 {user.phone}</p>
          </div>

          <div className="score-card">
            <h3>🎮 Behavior Score</h3>
            <div className="score-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="score-bg"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="score-fill"
                  style={{
                    strokeDashoffset: `${282.7 * (1 - user.behaviorScore / 100)}`
                  }}
                ></circle>
              </svg>
              <div className="score-value">{user.behaviorScore}/100</div>
            </div>
            <p className="score-label">Excellent</p>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <p>⭐ Points</p>
              <h3>{user.points}</h3>
            </div>
            <div className="stat">
              <p>📋 Total Claims</p>
              <h3>{user.totalClaims}</h3>
            </div>
            <div className="stat">
              <p>🚨 Fraud Risk</p>
              <h3>{user.fraudRisk ? '🔴 HIGH' : '🟢 LOW'}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        {['overview', 'policies', 'claims'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'policies' && (
        <div className="policies-list">
          <h2>🛡️ Active Policies</h2>
          {policies.length === 0 ? (
            <p>No active policies. <a href="/insurance">Buy one now</a></p>
          ) : (
            policies.map(policy => (
              <div key={policy._id} className="policy-item">
                <p>Time Slots: {policy.timeSlots.join(', ')}</p>
                <p>Premium: ₹{policy.premium}</p>
                <p>Coverage: ₹{policy.coverage}</p>
                <p>Valid: {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="claims-list">
          <h2>📋 Claim History</h2>
          {claims.length === 0 ? (
            <p>No claims filed yet</p>
          ) : (
            claims.map(claim => (
              <div key={claim._id} className={`claim-item status-${claim.status}`}>
                <p>Loss: ₹{claim.loss}</p>
                <p>Payout: ₹{claim.payout}</p>
                <p>Status: {claim.status.toUpperCase()}</p>
                <p>Date: {new Date(claim.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
