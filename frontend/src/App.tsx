import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import ForgotPassword from './features/auth/ForgotPassword'
import Profile from './features/auth/Profile'
import LocationSearch from './features/geo/LocationSearch';
import BusinessSelection from './features/business/BusinessSelection';
import FinancialPlanPage from './features/finance/FinancialPlanPage';
import SchemeResult from './features/finance/SchemeResult';
import RepaymentSchedule from './features/finance/RepaymentSchedule';
import WorkingCapitalForm from './features/finance/WorkingCapitalForm';
import ChatLayout from './features/chat/ChatLayout';
import WizardLayout from './features/wizard/WizardLayout';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './features/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BusinessCompare from './features/comparison/BusinessCompare';
import WhatIfSimulator from './features/simulator/WhatIfSimulator';
import SettingsPage from './features/settings/SettingsPage';
import GeoSpatialPage from './features/geospatial/GeoSpatialPage';
import GovtSchemesPage from './features/schemes/GovtSchemesPage';
import { SettingsProvider } from './features/settings/SettingsContext';

function App() {

  return (
    <SettingsProvider>
      <div className="font-sans">
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="market" element={<GeoSpatialPage />} />
            <Route path="geospatial" element={<GeoSpatialPage />} />
            <Route path="assistant" element={<ChatLayout />} />
            <Route path="competitors" element={<div className="p-8">Competitors Module - Coming Soon</div>} />
            <Route path="finance" element={<FinancialPlanPage />} />
            <Route path="schemes" element={<GovtSchemesPage />} />
            <Route path="reports" element={<div className="p-8">Reports Module - Coming Soon</div>} />
            <Route path="compare" element={<BusinessCompare />} />
            <Route path="simulator" element={<WhatIfSimulator />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<Profile />} />

            
            {/* Standalone pages reachable from nav or links */}
            <Route path="location-search" element={<LocationSearch />} />
            <Route path="business-selection" element={<BusinessSelection />} />
            <Route path="finance/calculator" element={<FinancialPlanPage />} />
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
  </SettingsProvider>
  )
}

export default App
