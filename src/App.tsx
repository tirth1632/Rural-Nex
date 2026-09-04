import { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { BusinessInput } from './pages/BusinessInput';
import { MarketAnalysis } from './pages/MarketAnalysis';
import { GISMap } from './pages/GISMap';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { GovSchemes } from './pages/GovSchemes';
import { FinancialCalculator } from './pages/FinancialCalculator';
import { AIAdvisor } from './pages/AIAdvisor';
import { Reports } from './pages/Reports';
import { AdminPanel } from './pages/AdminPanel';
import type { UserRole } from './types';
import { Bell, HelpCircle, Settings, CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('entrepreneur');

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      userRole={userRole}
      onChangeRole={(role) => setUserRole(role)}
    >
      {currentTab === 'dashboard' && (
        <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />
      )}

      {currentTab === 'business-input' && (
        <BusinessInput onAnalysisSubmitted={() => setCurrentTab('dashboard')} />
      )}

      {currentTab === 'market-analysis' && <MarketAnalysis />}

      {currentTab === 'gis-map' && <GISMap />}

      {currentTab === 'competitors' && <CompetitorAnalysis />}

      {currentTab === 'schemes' && <GovSchemes />}

      {currentTab === 'finance' && <FinancialCalculator />}

      {currentTab === 'ai-advisor' && <AIAdvisor />}

      {currentTab === 'reports' && <Reports />}

      {currentTab === 'admin' && <AdminPanel />}

      {/* Auxiliary Pages */}
      {currentTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Bell className="w-5 h-5 text-gov-800" />
            <h2 className="text-base font-bold text-slate-900">Notifications & Application Alerts</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-950">PMEGP Eligibility Dossier Validated</div>
                <div className="text-emerald-800 mt-0.5">Your 35% margin money subsidy calculation of ₹2,97,500 has been verified against Karnal DIC guidelines.</div>
                <div className="text-[10px] text-emerald-600 mt-1">2 hours ago</div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Upcoming EMI Alert</div>
                <div className="text-slate-600 mt-0.5">Payment of ₹14,250 for SBI Dairy Processing Loan is due on September 15, 2026.</div>
                <div className="text-[10px] text-slate-400 mt-1">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'help' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <HelpCircle className="w-5 h-5 text-gov-800" />
            <h2 className="text-base font-bold text-slate-900">Help & Support for Rural Entrepreneurs</h2>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="font-bold text-slate-900">District Industries Center (DIC) Karnal Helpline</div>
              <div className="text-slate-600 mt-0.5">Toll Free: 1800 180 2026 • Email: dic.karnal@haryana.gov.in</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="font-bold text-slate-900">How is the Business Feasibility Score calculated?</div>
              <div className="text-slate-600 mt-0.5">
                The score combines 4 key vectors: local market demand gap (30%), competitor density radius (25%), applicant equity capital fit (25%), and government subsidy percentage (20%).
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'settings' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-subtle space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Settings className="w-5 h-5 text-gov-800" />
            <h2 className="text-base font-bold text-slate-900">Platform Preferences & API Settings</h2>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Main Backend API Base Endpoint</label>
              <input
                type="text"
                readOnly
                value="https://api.gramudyog.gov.in/api/v1 (Django REST + PostGIS Active)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono text-slate-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">AI Inference Engine Endpoint</label>
              <input
                type="text"
                readOnly
                value="https://ai.gramudyog.gov.in/v1 (FastAPI + pgvector Active)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono text-slate-600"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600">
              GramUdyog Intelligence Platform • Production Build v2.4.0 (SIH Edition)
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default App;
