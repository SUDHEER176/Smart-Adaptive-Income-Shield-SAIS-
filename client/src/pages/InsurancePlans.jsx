import React, { useState, useEffect } from 'react';
import { insuranceService } from '../api';
import '../styles/insurance.css';

export default function InsurancePlans() {
  const [plans, setPlans] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await insuranceService.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlots(prev =>
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((sum, slot) => {
      const plan = plans.find(p => p.timeSlot.toLowerCase() === slot);
      return sum + (plan?.price || 0);
    }, 0);
  };

  const handleBuyPlan = async () => {
    if (selectedSlots.length === 0) {
      alert('Select at least one time slot');
      return;
    }

    try {
      setLoading(true);
      const response = await insuranceService.buyPlan(token, {
        timeSlots: selectedSlots,
        weeklyPlan
      });

      alert(`✅ Bought! Premium: ₹${response.data.policy.premium}`);
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error buying plan: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insurance-container">
      <header>
        <h1>💰 Insurance Plans (Micro-Time)</h1>
        <p>Flexible coverage by time slot</p>
      </header>

      <div className="plans-grid">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`plan-card ${selectedSlots.includes(plan.timeSlot.toLowerCase()) ? 'selected' : ''}`}
            onClick={() => handleSelectSlot(plan.timeSlot.toLowerCase())}
          >
            <h3>{plan.timeSlot}</h3>
            <div className="risk-badge" style={{
              backgroundColor: plan.riskLevel === 'Low' ? '#4CAF50' :
                             plan.riskLevel === 'Medium' ? '#FF9800' : '#F44336'
            }}>
              {plan.riskLevel} Risk
            </div>
            <p className="price">₹{plan.price}<span>/day</span></p>
            <p className="coverage">Coverage: ₹{plan.coverage}</p>
            <p className="description">{plan.description}</p>
            <input
              type="checkbox"
              checked={selectedSlots.includes(plan.timeSlot.toLowerCase())}
              onChange={() => {}}
            />
          </div>
        ))}
      </div>

      <div className="plan-options">
        <label>
          <input
            type="checkbox"
            checked={weeklyPlan}
            onChange={(e) => setWeeklyPlan(e.target.checked)}
          />
          Weekly Plan (7 days)
        </label>
      </div>

      <div className="checkout">
        <div className="summary">
          <h3>Selected Slots: {selectedSlots.length}</h3>
          <p>Total Premium: <strong>₹{calculateTotal()}</strong></p>
          <p>Duration: {weeklyPlan ? '7 days' : '1 day'}</p>
        </div>

        <button
          onClick={handleBuyPlan}
          disabled={loading || selectedSlots.length === 0}
          className="btn-checkout"
        >
          {loading ? '💳 Processing...' : '🛡️ Activate Plan'}
        </button>
      </div>
    </div>
  );
}
