import React, { useState, useEffect } from 'react';
import { Badge } from '../components/common/Badge';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { AiService } from '../services/aiService';
import type { AIAdvisorResponse } from '../types';
import { mockUser } from '../mock/userMock';

export const AIAdvisor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AIAdvisorResponse | null>(null);
  const [activeQuery, setActiveQuery] = useState('Evaluate Dairy Processing in Karnal Block');

  const presetQueries = [
    'Evaluate Dairy Processing in Karnal Block',
    'Compare Dairy vs Drone Rental ROI',
    'Check Cold Storage Feasibility with PMEGP',
    'Generate FSSAI & Pollution License Checklist',
  ];

  const fetchAdvisorData = async (queryText: string) => {
    setLoading(true);
    setActiveQuery(queryText);
    const res = await AiService.generateAdvisoryBrief('Dairy Processing', 'Karnal, Haryana', 850000);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvisorData(presetQueries[0]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Advisory Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-gov-800" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Structured AI Business Advisory Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual decision support system evaluating capital capacity, local market demand, and regulatory roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="navy">Rule-Guided Expert System</Badge>
          <button
            onClick={() => fetchAdvisorData(activeQuery)}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Analysis
          </button>
        </div>
      </div>

      {/* Query Preset Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Analysis Focus:</span>
        {presetQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => fetchAdvisorData(q)}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              activeQuery === q
                ? 'bg-gov-800 text-white shadow-subtle'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Advisory Display */}
      {loading || !data ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-gov-800 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-800">Synthesizing District Datasets & Feasibility Metrics...</div>
          <p className="text-xs text-slate-500">Cross-referencing Karnal agricultural yield with PMEGP subsidy matrices.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Context Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* Context Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Current Entrepreneur Context</span>
                <Badge variant="green">Score: {data.feasibilityScore}/100</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{mockUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Location:</span>
                  <span className="font-bold text-slate-900">{data.context.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Equity Capital:</span>
                  <span className="font-bold text-slate-900">₹{(data.context.capital / 100000).toFixed(1)} Lakh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Focus Sector:</span>
                  <span className="font-bold text-slate-900">{data.context.preferredCategory}</span>
                </div>
              </div>
            </div>

            {/* Risk Mitigation Matrix */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Risk Mitigation Matrix
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {data.riskMatrix.map((risk, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{risk.risk}</span>
                      <Badge variant={risk.severity === 'High' ? 'red' : 'amber'}>{risk.severity}</Badge>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-normal">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Main Advisory Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Executive Summary Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Executive Feasibility Advisory Brief</h2>
                <Badge variant="navy">Official Assessment</Badge>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3.5 rounded border border-slate-200">
                {data.executiveSummary}
              </p>
            </div>

            {/* Top 3 Opportunities Component */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Structured Business Fit Analysis
              </h2>
              <div className="space-y-3">
                {data.topOpportunities.map((opp, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{opp.name}</span>
                      <Badge variant="green">{opp.score} Fit Score</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{opp.whyItFits}</p>
                    <div className="text-[11px] font-semibold text-gov-800">
                      Est. Investment: ₹{(opp.estimatedCost / 100000).toFixed(1)} Lakh
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Roadmap Timeline */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle space-y-3">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gov-800" /> 90-Day Implementation Action Roadmap
              </h2>

              <div className="space-y-4">
                {data.roadmap.map((phase, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-gov-800 text-white font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{phase.phase}</span>
                        <Badge variant="navy">{phase.timeline}</Badge>
                      </div>
                      <ul className="space-y-1 text-slate-600 pt-1">
                        {phase.tasks.map((t, tidx) => (
                          <li key={tidx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
