import React from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProposalWizard from './features/proposal/ProposalWizard'
import ChatAssistant from './features/chat/ChatAssistant'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import ForgotPassword from './features/auth/ForgotPassword'
import Profile from './features/auth/Profile'
import LocationSearch from './features/geo/LocationSearch';
import BusinessSelection from './features/business/BusinessSelection';
import CalculatorForm from './features/finance/CalculatorForm';
import SchemeResult from './features/finance/SchemeResult';
import RepaymentSchedule from './features/finance/RepaymentSchedule';
import WorkingCapitalForm from './features/finance/WorkingCapitalForm';
import MarketDashboard from './features/market/MarketDashboard';
import ChatLayout from './features/chat/ChatLayout';
import WizardLayout from './features/wizard/WizardLayout';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './features/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BusinessCompare from './features/comparison/BusinessCompare';
import WhatIfSimulator from './features/simulator/WhatIfSimulator';

function App() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="market" element={<MarketDashboard />} />
            <Route path="assistant" element={<ChatLayout />} />
            <Route path="competitors" element={<div className="p-8">Competitors Module - Coming Soon</div>} />
            <Route path="finance" element={<CalculatorForm />} />
            <Route path="reports" element={<div className="p-8">Reports Module - Coming Soon</div>} />
            <Route path="compare" element={<BusinessCompare />} />
            <Route path="simulator" element={<WhatIfSimulator />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Standalone pages reachable from nav or links */}
            <Route path="location-search" element={<LocationSearch />} />
            <Route path="business-selection" element={<BusinessSelection />} />
            <Route path="finance/calculator" element={<CalculatorForm />} />
            <Route path="finance/scheme-result" element={<SchemeResult />} />
            <Route path="finance/repayment" element={<RepaymentSchedule />} />
            <Route path="finance/working-capital" element={<WorkingCapitalForm />} />
          </Route>
          
          <Route path="/wizard" element={<WizardLayout />} />
        </Route>
      </Routes>
      
      {/* Global assistant widget if needed */}
      {/* {user && <ChatAssistant />} */}
    </div>
  )
}

export default App
