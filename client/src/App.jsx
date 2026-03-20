import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import InsurancePlans from './pages/InsurancePlans';
import Profile from './pages/Profile';
import RiskMap from './pages/RiskMap';
import AdminPanel from './pages/AdminPanel';
import './styles/global.css';
import './styles/App.css';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute><InsurancePlans /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/risk-map" element={<ProtectedRoute><RiskMap /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}
