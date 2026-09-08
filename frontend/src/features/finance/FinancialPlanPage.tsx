import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Printer, 
  HelpCircle, 
  Users, 
  X, 
  Info, 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  Building, 
  DollarSign, 
  Layers, 
  Save, 
  Sliders, 
  Plus,
  Trash2,
  ExternalLink,
  Check,
  PieChart,
  Wallet,
  Landmark,
  CalendarClock,
  Award,
  MapPin,
  Briefcase,
  UserCheck,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';

import {
  fetchBusinessActivities,
  fetchGeoStates,
  fetchGeoDistricts,
  fetchGeoBlocks,
  fetchGeoVillages,
  calculateFeasibility,
  saveFinancialPlan,
  fetchAIAdvisoryInsights,
  type BusinessActivity,
  type CapExLineItem,
  type PromoterProfile,
  type LocationData,
  type FinancialInputs,
  type FeasibilityCalculationResponse,
  type GeoState,
  type GeoDistrict,
  type GeoBlock,
  type GeoVillage
} from '../../api/financialPlan';

// Helper Currency Formatter
const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val || 0));
};

// Compact Indian Currency Formatter for quick scanning by all age groups
const formatWordsINR = (val: number): string => {
  const num = Math.round(val || 0);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num}`;
};

const CATEGORY_NAMES: Record<string, string> = {
  land_site: 'A. Land & Site Development',
  building_civil: 'B. Building & Civil Works',
  plant_machinery: 'C. Plant, Machinery & Equipment',
  furniture_office: 'D. Furniture & Office Equipment',
  productive_assets: 'E. Livestock & Productive Assets',
  pre_operative: 'F. Pre-operative & Licensing Expenses',
  working_capital: 'G. Initial Working Capital Margin'
};

export const FinancialPlanPage: React.FC = () => {
  // Tab View: 'overview' vs 'bank_dpr'
  const [activeTab, setActiveTab] = useState<'overview' | 'bank_dpr'>('overview');


  // Master Data State (Loaded dynamically from backend)
  const [activities, setActivities] = useState<BusinessActivity[]>([]);
  const [selectedActivityCode, setSelectedActivityCode] = useState<string>('');
  const [loadingMaster, setLoadingMaster] = useState<boolean>(true);

  // Geo Hierarchy State
  const [statesList, setStatesList] = useState<GeoState[]>([]);
  const [districtsList, setDistrictsList] = useState<GeoDistrict[]>([]);
  const [blocksList, setBlocksList] = useState<GeoBlock[]>([]);
  const [villagesList, setVillagesList] = useState<GeoVillage[]>([]);

  // Section A: Promoter & Project Profile
  const [promoterProfile, setPromoterProfile] = useState<PromoterProfile>({
    name: 'Rural Entrepreneur',
    age: 30,
    gender: 'male',
    social_category: 'general',
    special_category: 'none',
    education: '12th Pass',
    experience: '3+ years experience',
    existing_business: false,
    existing_revenue: 0,
    existing_assets: 0,
    existing_loan: 0,
    existing_employees: 0,
    existing_capacity: ''
  });

  const [locationData, setLocationData] = useState<LocationData>({
    state: '',
    district: '',
    block: '',
    village: '',
    rural_urban: 'rural',
    pincode: ''
  });

  const [businessStage, setBusinessStage] = useState<'new' | 'existing' | 'expansion' | 'modernization'>('new');

  // Section B & C: User Financial Input
  const [financialInputs, setFinancialInputs] = useState<FinancialInputs>({
    project_title: '',
    own_contribution: 100000,
    additional_investment: 0,
    working_capital: 50000,
    existing_savings: 150000,
    other_funding: 0,
    existing_loan: 0
  });

  // Section D: Itemized Project Cost Items across 7 categories
  const [costItems, setCostItems] = useState<Record<string, CapExLineItem[]>>({
    land_site: [],
    building_civil: [],
    plant_machinery: [],
    furniture_office: [],
    productive_assets: [],
    pre_operative: [],
    working_capital: []
  });

  // Selected Scheme Rule Override (if user picks a specific matched scheme)
  const [selectedSchemeRuleId, setSelectedSchemeRuleId] = useState<number | null>(null);

  // What-If Modifiers State
  const [whatIfModifiers, setWhatIfModifiers] = useState<{
    project_cost_delta_pct: number;
    revenue_delta_pct: number;
    interest_rate_delta_pct: number;
    raw_material_delta_pct: number;
    own_contribution_delta_pct: number;
    scale_multiplier: number;
  }>({
    project_cost_delta_pct: 0,
    revenue_delta_pct: 0,
    interest_rate_delta_pct: 0,
    raw_material_delta_pct: 0,
    own_contribution_delta_pct: 0,
    scale_multiplier: 1.0
  });

  // Calculation Engine Result State
  const [calcResponse, setCalcResponse] = useState<FeasibilityCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  // Modals & Collapsibles
  const [showCalculationModal, setShowCalculationModal] = useState<boolean>(false);
  const [aiAdvisoryData, setAiAdvisoryData] = useState<any>(null);
  const [loadingAiAdvisor, setLoadingAiAdvisor] = useState<boolean>(false);
  const [repaymentViewMode, setRepaymentViewMode] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [forecastScenario, setForecastScenario] = useState<'conservative' | 'base' | 'optimistic'>('base');
  const [saveDraftStatus, setSaveDraftStatus] = useState<string | null>(null);

  // 1. Initial Load of Dynamic Master Data
  useEffect(() => {
    let isMounted = true;
    setLoadingMaster(true);

    Promise.all([
      fetchBusinessActivities().catch(() => []),
      fetchGeoStates().catch(() => [])
    ]).then(([fetchedActivities, fetchedStates]) => {
      if (!isMounted) return;
      setActivities(fetchedActivities);
      setStatesList(fetchedStates);

      if (fetchedActivities.length > 0) {
        const defaultAct = fetchedActivities[0];
        setSelectedActivityCode(defaultAct.code);
        initializeCostItemsFromTemplate(defaultAct);
      }

      if (fetchedStates.length > 0) {
        const firstState = fetchedStates[0];
        setLocationData((prev) => ({ ...prev, state: firstState.name }));
        fetchGeoDistricts(firstState.id).then((dists) => {
          if (isMounted) {
            setDistrictsList(dists);
            if (dists.length > 0) {
              const firstDist = dists[0];
              setLocationData((prev) => ({ ...prev, district: firstDist.name }));
              fetchGeoBlocks(firstDist.id).then((blks) => {
                if (isMounted) {
                  setBlocksList(blks);
                  if (blks.length > 0) {
                    const firstBlk = blks[0];
                    setLocationData((prev) => ({ ...prev, block: firstBlk.name }));
                    fetchGeoVillages(firstBlk.id).then((vills) => {
                      if (isMounted) {
                        setVillagesList(vills);
                        if (vills.length > 0) {
                          setLocationData((prev) => ({ ...prev, village: vills[0].name }));
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
      setLoadingMaster(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Initialize Cost Items from Selected Activity Driver Template
  const initializeCostItemsFromTemplate = (activity: BusinessActivity) => {
    const defaultCapex = activity.driver_template?.default_capex_breakdown || [];
    const grouped: Record<string, CapExLineItem[]> = {
      land_site: [],
      building_civil: [],
      plant_machinery: [],
      furniture_office: [],
      productive_assets: [],
      pre_operative: [],
      working_capital: []
    };

    defaultCapex.forEach((item, idx) => {
      const catKey = item.category || 'plant_machinery';
      if (!grouped[catKey]) grouped[catKey] = [];
      grouped[catKey].push({
        id: `${catKey}_${idx + 1}`,
        category: catKey,
        name: item.name,
        quantity: item.quantity || 1,
        unit_cost: item.unit_cost || 0,
        total_amount: (item.quantity || 1) * (item.unit_cost || 0),
        specification: item.specification || ''
      });
    });

    setCostItems(grouped);
  };

  // Handle Activity Change
  const handleActivityChange = (newCode: string) => {
    setSelectedActivityCode(newCode);
    const act = activities.find((a) => a.code === newCode);
    if (act) {
      initializeCostItemsFromTemplate(act);
      setSelectedSchemeRuleId(null);
    }
  };

  // Handle State Change -> Load Districts -> Load Blocks
  const handleStateChange = (stateName: string) => {
    const selectedStateObj = statesList.find((s) => s.name === stateName);
    setLocationData((prev) => ({ ...prev, state: stateName, district: '', block: '', village: '' }));
    setDistrictsList([]);
    setBlocksList([]);
    setVillagesList([]);

    if (selectedStateObj) {
      fetchGeoDistricts(selectedStateObj.id).then((dists) => {
        setDistrictsList(dists);
        if (dists.length > 0) {
          const firstDist = dists[0];
          setLocationData((prev) => ({ ...prev, district: firstDist.name }));
          fetchGeoBlocks(firstDist.id).then((blks) => {
            setBlocksList(blks);
            if (blks.length > 0) {
              const firstBlk = blks[0];
              setLocationData((prev) => ({ ...prev, block: firstBlk.name }));
              fetchGeoVillages(firstBlk.id).then((vills) => {
                setVillagesList(vills);
                if (vills.length > 0) {
                  setLocationData((prev) => ({ ...prev, village: vills[0].name }));
                }
              });
            }
          });
        }
      });
    }
  };

  // Handle District Change -> Load Blocks -> Load Villages
  const handleDistrictChange = (districtName: string) => {
    const distObj = districtsList.find((d) => d.name === districtName);
    setLocationData((prev) => ({ ...prev, district: districtName, block: '', village: '' }));
    setBlocksList([]);
    setVillagesList([]);

    if (distObj) {
      fetchGeoBlocks(distObj.id).then((blocks) => {
        setBlocksList(blocks);
        if (blocks.length > 0) {
          const firstBlk = blocks[0];
          setLocationData((prev) => ({ ...prev, block: firstBlk.name }));
          fetchGeoVillages(firstBlk.id).then((vills) => {
            setVillagesList(vills);
            if (vills.length > 0) {
              setLocationData((prev) => ({ ...prev, village: vills[0].name }));
            }
          });
        }
      });
    }
  };

  // Handle Block Change -> Load Villages
  const handleBlockChange = (blockName: string) => {
    const blockObj = blocksList.find((b) => b.name === blockName);
    setLocationData((prev) => ({ ...prev, block: blockName, village: '' }));
    setVillagesList([]);

    if (blockObj) {
      fetchGeoVillages(blockObj.id).then((vills) => {
        setVillagesList(vills);
        if (vills.length > 0) {
          setLocationData((prev) => ({ ...prev, village: vills[0].name }));
        }
      });
    }
  };

  // 2. Trigger Full Backend Calculation Pipeline
  const runCalculation = useCallback(async () => {
    if (!selectedActivityCode) return;
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const payload = {
        activity_id_or_code: selectedActivityCode,
        business_stage: businessStage,
        promoter_profile: promoterProfile,
        location_data: locationData,
        financial_inputs: financialInputs,
        project_cost_items: costItems,
        selected_scheme_rule_id: selectedSchemeRuleId,
        what_if_modifiers: whatIfModifiers
      };

      const result = await calculateFeasibility(payload);
      setCalcResponse(result);
    } catch (err: any) {
      console.error('Calculation pipeline failed', err);
      setCalculationError(err.message || 'Error executing financial feasibility calculations');
    } finally {
      setIsCalculating(false);
    }
  }, [
    selectedActivityCode,
    businessStage,
    promoterProfile,
    locationData,
    financialInputs,
    costItems,
    selectedSchemeRuleId,
    whatIfModifiers
  ]);

  // Debounced auto-recalculation whenever inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 300);
    return () => clearTimeout(timer);
  }, [runCalculation]);

  // Cost Item Manipulations
  const handleAddItem = (categoryKey: string) => {
    setCostItems((prev) => {
      const currentList = prev[categoryKey] || [];
      const newItem: CapExLineItem = {
        id: `${categoryKey}_${Date.now()}`,
        category: categoryKey,
        name: 'New Asset / Item',
        quantity: 1,
        unit_cost: 10000,
        total_amount: 10000,
        specification: 'Standard grade'
      };
      return { ...prev, [categoryKey]: [...currentList, newItem] };
    });
  };

  const handleUpdateItem = (categoryKey: string, itemId: string, field: keyof CapExLineItem, value: any) => {
    setCostItems((prev) => {
      const currentList = prev[categoryKey] || [];
      const updated = currentList.map((item) => {
        if (item.id !== itemId) return item;
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_cost') {
          const qty = Number(field === 'quantity' ? value : updatedItem.quantity) || 0;
          const cost = Number(field === 'unit_cost' ? value : updatedItem.unit_cost) || 0;
          updatedItem.total_amount = qty * cost;
        }
        return updatedItem;
      });
      return { ...prev, [categoryKey]: updated };
    });
  };

  const handleDeleteItem = (categoryKey: string, itemId: string) => {
    setCostItems((prev) => {
      const currentList = prev[categoryKey] || [];
      return { ...prev, [categoryKey]: currentList.filter((i) => i.id !== itemId) };
    });
  };

  // AI Advisory Loader
  const handleLoadAiAdvisor = async () => {
    if (!calcResponse) return;
    setLoadingAiAdvisor(true);
    try {
      const advice = await fetchAIAdvisoryInsights(calcResponse);
      setAiAdvisoryData(advice);
    } catch (e) {
      console.warn('AI Advisor fetch error', e);
    } finally {
      setLoadingAiAdvisor(false);
    }
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!calcResponse) return;
    setSaveDraftStatus('Saving...');
    try {
      await saveFinancialPlan({
        title: financialInputs.project_title || `${calcResponse.activity.name} Plan`,
        business_activity: calcResponse.activity.id,
        business_stage: businessStage,
        location_state: locationData.state,
        location_district: locationData.district,
        location_block: locationData.block,
        location_village: locationData.village,
        rural_urban: locationData.rural_urban,
        pincode: locationData.pincode,
        promoter_profile: promoterProfile,
        financial_inputs: financialInputs,
        project_cost_items: costItems,
        matched_scheme_rule: calcResponse.selected_scheme_rule?.id,
        calculation_results: calcResponse,
        rule_version_used: calcResponse.calculation_audit.rule_version_used
      });
      setSaveDraftStatus('Saved Successfully!');
      setTimeout(() => setSaveDraftStatus(null), 2500);
    } catch (e) {
      setSaveDraftStatus('Save failed');
      setTimeout(() => setSaveDraftStatus(null), 2500);
    }
  };

  // Export / Print Bank DPR Action
  const handlePrintDPR = () => {
    setActiveTab('bank_dpr');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* ------------------------------------------------------------- */}
      {/* 2. PAGE HEADER & STICKY CONTROL BAR                           */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            {/* Title & Engine Meta */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Financial Feasibility Engine
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {calcResponse?.calculation_audit?.rule_version_used ? `Rule Version: ${calcResponse.calculation_audit.rule_version_used}` : 'Deterministic Engine v2026.01'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  MoF / MoFPI Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
                <Calculator className="w-7 h-7 text-emerald-600 shrink-0" />
                Financial Feasibility & Capital Budgeting
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Government subsidy matching, loan amortization, cash-flow forecasting and institutional Bank DPR generation.
              </p>
            </div>

            {/* Top Toolbar: Activity Selector + View Switcher + Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Dynamic Business Activity Dropdown */}
              <div className="relative shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                </div>
                <select
                  value={selectedActivityCode}
                  onChange={(e) => handleActivityChange(e.target.value)}
                  disabled={loadingMaster}
                  aria-label="Select Enterprise Activity"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 text-sm font-bold rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block h-11 pl-9 pr-8 shadow-xs transition cursor-pointer"
                >
                  {activities.map((act) => (
                    <option key={act.id} value={act.code}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher: Basic Overview vs Detailed Bank DPR */}
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 h-11 items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`h-9 px-3.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  Basic Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bank_dpr')}
                  className={`h-9 px-3.5 text-xs sm:text-sm font-bold rounded-lg transition flex items-center gap-1.5 ${
                    activeTab === 'bank_dpr'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Detailed Bank DPR
                </button>
              </div>

              {/* Save Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
              >
                <Save className="w-4 h-4 text-slate-500" />
                {saveDraftStatus || 'Save Draft'}
              </button>

              {/* Export / Print */}
              <button
                type="button"
                onClick={handlePrintDPR}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition shrink-0 whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                Export / Print DPR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Loading / Status Indicator */}
        {isCalculating && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm font-semibold text-emerald-900 animate-pulse print:hidden shadow-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
            Recalculating capital structure, verified government subsidy caps, and debt service ratios...
          </div>
        )}

        {calculationError && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm font-semibold text-red-900 print:hidden shadow-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            {calculationError}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 1: BASIC OVERVIEW MODE                                    */}
        {/* ============================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 print:hidden">
            {/* --------------------------------------------------------- */}
            {/* 1. EXECUTIVE FEASIBILITY SCORECARD & 6-METRIC GRID        */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                {/* Score Header & 6-Card Metric Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left: Score Badge & Verdict */}
                  <div className="lg:col-span-4 flex items-center gap-4 sm:gap-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-100/70 border-2 border-emerald-300 flex flex-col items-center justify-center text-emerald-800 font-black shadow-xs">
                      <span className="text-3xl sm:text-4xl leading-none">{calcResponse.feasibility_score.score}</span>
                      <span className="text-xs text-emerald-700 font-bold mt-1">/ 100 PTS</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FEASIBILITY RATING</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide uppercase ${
                          calcResponse.feasibility_score.score >= 80 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          calcResponse.feasibility_score.score >= 65 ? 'bg-teal-100 text-teal-900 border border-teal-300' :
                          calcResponse.feasibility_score.score >= 50 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          ● {calcResponse.feasibility_score.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {calcResponse.feasibility_score.verdict}
                      </p>
                    </div>
                  </div>

                  {/* Right: Symmetrical 6-Card Executive Metric Grid */}
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {/* Metric 1: Project Cost */}
                    <div className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PROJECT COST</span>
                        <Building className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {formatINR(calcResponse.project_cost.total_project_cost)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">
                        Total Capital Outlay
                      </span>
                    </div>

                    {/* Metric 2: Own Margin */}
                    <div className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OWN MARGIN</span>
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {formatINR(calcResponse.funding_waterfall.total_promoter_equity)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">
                        Promoter Equity Share
                      </span>
                    </div>

                    {/* Metric 3: Govt Subsidy */}
                    <div className="bg-emerald-50/80 hover:bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-emerald-700 mb-1">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">GOVT SUBSIDY</span>
                        <Award className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-emerald-700 leading-tight">
                        {formatINR(calcResponse.subsidy.final_subsidy_amount)}
                      </span>
                      <span className="text-xs text-emerald-700/80 font-medium mt-0.5">
                        Non-Repayable Grant
                      </span>
                    </div>

                    {/* Metric 4: Required Loan */}
                    <div className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">REQUIRED LOAN</span>
                        <Landmark className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {formatINR(calcResponse.funding_waterfall.gross_bank_loan_required)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">
                        Term Loan Sanction
                      </span>
                    </div>

                    {/* Metric 5: Active EMI */}
                    <div className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">MONTHLY EMI</span>
                        <CalendarClock className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {formatINR(calcResponse.amortization.summary.active_emi)}<span className="text-xs font-semibold text-slate-500">/mo</span>
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">
                        Repayment Installment
                      </span>
                    </div>

                    {/* Metric 6: DSCR */}
                    <div className="bg-slate-50/90 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between transition">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DSCR RATIO</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-lg sm:text-xl font-black text-emerald-700 leading-tight">
                        {calcResponse.dscr.dscr_value}
                      </span>
                      <span className="text-xs text-slate-500 font-medium mt-0.5">
                        Debt Service Coverage
                      </span>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Bottom Two Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-slate-100">
                  <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-200/80">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      Why This Project Is Feasible (Appraisal Merits)
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 font-medium">
                      {calcResponse.feasibility_score.reasons.slice(0, 3).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 leading-snug">
                          <Check className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-200/80">
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      Key Financial Risks & Institutional Safeguards
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-amber-900 font-medium">
                      {calcResponse.risk_analysis.indicators.slice(0, 2).map((ind, i) => (
                        <li key={i} className="flex items-start gap-2 leading-snug">
                          <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                          <span><strong>{ind.category}:</strong> {ind.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 2. MATCHED ENTITLEMENT AWARD BANNER                       */}
            {/* --------------------------------------------------------- */}
            {calcResponse?.subsidy && calcResponse.subsidy.final_subsidy_amount > 0 ? (
              <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/80">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
                        MATCHED ENTITLEMENT
                      </span>
                      <span className="text-xs font-semibold text-emerald-200">
                        {calcResponse.selected_scheme_rule?.code || 'Official Scheme'} (Rule Version: {calcResponse.calculation_audit?.rule_version_used || '2026.01'})
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                      <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                      {calcResponse.subsidy.applicable_subsidy_pct}% {calcResponse.subsidy.subsidy_timing_display}
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
                      {calcResponse.subsidy.calculation_explanation}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0">
                    <div className="lg:text-right">
                      <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">
                        Calculated Subsidy Entitlement
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-emerald-300 block my-0.5">
                        {formatINR(calcResponse.subsidy.final_subsidy_amount)}
                      </span>
                      {calcResponse.subsidy.max_subsidy_cap > 0 && (
                        <span className="text-xs text-emerald-300/80 font-medium block">
                          Statutory Ceiling Cap: {formatINR(calcResponse.subsidy.max_subsidy_cap)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCalculationModal(true)}
                      className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/25 transition inline-flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-emerald-300" />
                      View Calculation Breakdown
                    </button>
                  </div>
                </div>

                {/* Additional Entitlement Badges */}
                <div className="mt-6 pt-4 border-t border-emerald-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-emerald-100">
                  <div className="flex items-center gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Collateral Support:</strong> {calcResponse.selected_scheme_rule?.code === 'PMEGP' ? '100% CGTMSE Guarantee' : 'Priority Sector Lending'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Moratorium Policy:</strong> {calcResponse.loan.moratorium_months} Months Principal Grace</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/40">
                    <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a 
                      href={calcResponse.selected_scheme_rule?.official_portal_url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline hover:text-white font-semibold"
                    >
                      Official Scheme Guidelines Portal
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 text-amber-900 shadow-xs">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black text-base block text-amber-950">Official Scheme Verification Notice</span>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    Official subsidy rules could not be confirmed for the current combination of activity, sector, and promoter profile. 
                    Continuing with financial feasibility analysis without subsidy (Verification Required). 
                    Bank loan and repayment feasibility are calculated on standard commercial priority banking benchmarks.
                  </p>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 3. SECTION A: PROJECT & PROMOTER PROFILE (3 CARDS)        */}
            {/* --------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Section A — Project & Promoter Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Fill your details to calculate official government scheme eligibility and loan sanction limits.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                  Master Data Driven
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 1: Promoter Information */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Promoter Information</h4>
                      <p className="text-[11px] text-slate-500">Applicant identity & demographics</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Promoter Full Name</label>
                    <input
                      type="text"
                      value={promoterProfile.name || ''}
                      onChange={(e) => setPromoterProfile({ ...promoterProfile, name: e.target.value })}
                      className="w-full h-11 text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                      placeholder="e.g. Ramesh Patel"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Age (Years)</label>
                      <input
                        type="number"
                        min="18"
                        max="100"
                        value={promoterProfile.age || 25}
                        onChange={(e) => setPromoterProfile({ ...promoterProfile, age: Number(e.target.value) })}
                        className="w-full h-11 text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Gender</label>
                      <select
                        value={promoterProfile.gender || 'male'}
                        onChange={(e) => setPromoterProfile({ ...promoterProfile, gender: e.target.value as any })}
                        className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female (Women Priority)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Social Category</label>
                    <select
                      value={promoterProfile.social_category || 'general'}
                      onChange={(e) => setPromoterProfile({ ...promoterProfile, social_category: e.target.value as any })}
                      className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    >
                      <option value="general">General (Standard Rate)</option>
                      <option value="obc">OBC (Other Backward Classes)</option>
                      <option value="sc">SC (Scheduled Caste - 35% Rate)</option>
                      <option value="st">ST (Scheduled Tribe - 35% Rate)</option>
                      <option value="minority">Minority Community</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">Special categories qualify for higher subsidy rate.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Special Category</label>
                    <select
                      value={promoterProfile.special_category || 'none'}
                      onChange={(e) => setPromoterProfile({ ...promoterProfile, special_category: e.target.value as any })}
                      className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    >
                      <option value="none">None / Not Applicable</option>
                      <option value="divyang">Divyang / Person with Disability (PwD)</option>
                      <option value="ner">North-East Region (NER)</option>
                      <option value="border">Border / Hill / Island Area</option>
                    </select>
                  </div>
                </div>

                {/* Card 2: Location Master Data & Area Classification Selector */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Project Location</h4>
                      <p className="text-[11px] text-slate-500">Government geography & subsidy rate tier</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">State</label>
                    <select
                      value={locationData.state || ''}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    >
                      {statesList.length === 0 && <option value="">Loading States...</option>}
                      {statesList.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">District</label>
                      <select
                        value={locationData.district || ''}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                      >
                        {districtsList.length === 0 && <option value="">Select District</option>}
                        {districtsList.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Block / Taluka</label>
                      <select
                        value={locationData.block || ''}
                        onChange={(e) => handleBlockChange(e.target.value)}
                        className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                      >
                        {blocksList.length === 0 && <option value="">Select Block</option>}
                        {blocksList.map((b) => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Visual Area Classification Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Area Classification & Subsidy Rate Tier
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setLocationData({ ...locationData, rural_urban: 'rural' })}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          locationData.rural_urban === 'rural'
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          🏡 Rural Area
                          {locationData.rural_urban === 'rural' && <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto" />}
                        </span>
                        <span className="text-xs font-black text-emerald-700 mt-1 block">
                          35% High Subsidy Rate
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLocationData({ ...locationData, rural_urban: 'urban' })}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          locationData.rural_urban === 'urban'
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          🏙️ Urban Area
                          {locationData.rural_urban === 'urban' && <Check className="w-3.5 h-3.5 text-emerald-700 ml-auto" />}
                        </span>
                        <span className="text-xs font-bold text-slate-600 mt-1 block">
                          25% Standard Subsidy
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Village / Settlement</label>
                    <input
                      type="text"
                      list="villages-datalist"
                      value={locationData.village || ''}
                      onChange={(e) => setLocationData({ ...locationData, village: e.target.value })}
                      placeholder="e.g. Anandpur"
                      className="w-full h-11 text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    />
                    <datalist id="villages-datalist">
                      {villagesList.map((v) => (
                        <option key={v.id} value={v.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Card 3: Business Stage & Enterprise Details */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Business Stage & Enterprise</h4>
                      <p className="text-[11px] text-slate-500">Operation profile & educational credentials</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Project Stage</label>
                    <select
                      value={businessStage}
                      onChange={(e) => setBusinessStage(e.target.value as any)}
                      className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    >
                      <option value="new">New / Greenfield Enterprise</option>
                      <option value="existing">Existing Enterprise (Operation)</option>
                      <option value="expansion">Expansion / Scaling Up</option>
                      <option value="modernization">Modernization / Technology Upgrade</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">New projects are eligible for highest capital subsidies.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      Promoter Education Level
                    </label>
                    <select
                      value={promoterProfile.education || '12th Pass'}
                      onChange={(e) => setPromoterProfile({ ...promoterProfile, education: e.target.value })}
                      className="w-full h-11 text-sm font-semibold px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    >
                      <option value="Under 8th">Below 8th Pass</option>
                      <option value="8th Pass">8th Pass (Meets PMEGP &gt; ₹10L Norm)</option>
                      <option value="10th Pass">10th / Matriculation</option>
                      <option value="12th Pass">12th / Intermediate</option>
                      <option value="Graduate">Graduate / Diploma Holder</option>
                    </select>
                    <span className="text-[11px] text-slate-500 mt-1 block">8th pass is mandatory for project loans above ₹10 Lakhs in manufacturing.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Entrepreneurial Experience</label>
                    <input
                      type="text"
                      value={promoterProfile.experience || ''}
                      onChange={(e) => setPromoterProfile({ ...promoterProfile, experience: e.target.value })}
                      placeholder="e.g. 3 years in dairy farming"
                      className="w-full h-11 text-sm font-semibold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-slate-50/50"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Prior domain knowledge boosts bank appraisal scoring.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* 4. SECTION B: USER FINANCIAL INPUT & CAPITAL MARGIN       */}
            {/* --------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Section B — User Financial Inputs & Capital Margin
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Enter your own cash contribution and liquid reserves. The system automatically verifies compliance against official bank norms.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Dynamic Statutory Margin: {calcResponse?.funding_waterfall?.min_required_margin_pct || 10}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Card 1: Own Margin Contribution */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Own Margin Contribution
                      </label>
                      <Wallet className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your personal equity invested in project</p>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-black text-slate-500 text-base">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={financialInputs.own_contribution}
                        onChange={(e) => setFinancialInputs({ ...financialInputs, own_contribution: Math.max(0, Number(e.target.value)) })}
                        className="w-full h-12 text-lg font-black text-slate-900 pl-8 pr-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-emerald-800">
                        {formatINR(financialInputs.own_contribution)} ({formatWordsINR(financialInputs.own_contribution)})
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Margin Status Badge */}
                  <div className="pt-2 border-t border-slate-200">
                    {calcResponse && (
                      calcResponse.funding_waterfall.total_promoter_equity >= calcResponse.funding_waterfall.min_required_margin_amount ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3 text-emerald-700" /> Meets minimum {calcResponse.funding_waterfall.min_required_margin_pct}% statutory margin ({formatINR(calcResponse.funding_waterfall.min_required_margin_amount)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3 text-amber-700" /> Below statutory {calcResponse.funding_waterfall.min_required_margin_pct}% margin ({formatINR(calcResponse.funding_waterfall.min_required_margin_amount)} required)
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Card 2: Additional Investment */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Additional Equity / Partner
                      </label>
                      <Building className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Co-promoter capital or additional savings</p>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-black text-slate-500 text-base">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={financialInputs.additional_investment}
                        onChange={(e) => setFinancialInputs({ ...financialInputs, additional_investment: Math.max(0, Number(e.target.value)) })}
                        className="w-full h-12 text-lg font-black text-slate-900 pl-8 pr-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        {formatINR(financialInputs.additional_investment)} ({formatWordsINR(financialInputs.additional_investment)})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">Reduces required bank loan and interest burden</span>
                  </div>
                </div>

                {/* Card 3: Dedicated Working Capital Reserve */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Working Capital Reserve
                      </label>
                      <Layers className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Liquid cash reserved for raw material & ops</p>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-black text-slate-500 text-base">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={financialInputs.working_capital || 0}
                        onChange={(e) => setFinancialInputs({ ...financialInputs, working_capital: Math.max(0, Number(e.target.value)) })}
                        className="w-full h-12 text-lg font-black text-slate-900 pl-8 pr-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-teal-800">
                        {formatINR(financialInputs.working_capital || 0)} ({formatWordsINR(financialInputs.working_capital || 0)})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">Safeguards cash flow against seasonal delays</span>
                  </div>
                </div>

                {/* Card 4: Other Funding / Family Grants */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Other Grants / Family Support
                      </label>
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Interest-free soft loans or family support</p>
                  </div>

                  <div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-black text-slate-500 text-base">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={financialInputs.other_funding || 0}
                        onChange={(e) => setFinancialInputs({ ...financialInputs, other_funding: Math.max(0, Number(e.target.value)) })}
                        className="w-full h-12 text-lg font-black text-slate-900 pl-8 pr-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-purple-800">
                        {formatINR(financialInputs.other_funding || 0)} ({formatWordsINR(financialInputs.other_funding || 0)})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">Counts as secondary promoter contribution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------- */}
            {/* 5. SECTION C: PROJECT COST BUILDER (7 CATEGORIES)         */}
            {/* --------------------------------------------------------- */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-emerald-600" />
                    Section C — Interactive Project Cost Builder
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Itemized CapEx and OpEx margin allocation across 7 standard banking appraisal categories.
                  </p>
                </div>
                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                  <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Total Project Cost</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {formatINR(calcResponse?.project_cost?.total_project_cost || 0)}
                  </span>
                </div>
              </div>

              {/* 7 Standard Categories Accordion / Lists */}
              <div className="space-y-4">
                {Object.keys(CATEGORY_NAMES).map((catKey) => {
                  const items = costItems[catKey] || [];
                  const categorySum = items.reduce((sum, item) => sum + (item.total_amount || 0), 0);

                  return (
                    <div key={catKey} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-900">{CATEGORY_NAMES[catKey]}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-900">{formatINR(categorySum)}</span>
                          <button
                            type="button"
                            onClick={() => handleAddItem(catKey)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            Add Item
                          </button>
                        </div>
                      </div>

                      {/* Items Table */}
                      {items.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                              <tr>
                                <th className="py-2.5 px-3.5">Item Name / Asset Description</th>
                                <th className="py-2.5 px-3.5 w-28 text-center">Quantity</th>
                                <th className="py-2.5 px-3.5 w-36 text-right">Unit Cost (₹)</th>
                                <th className="py-2.5 px-3.5 w-36 text-right">Total (₹)</th>
                                <th className="py-2.5 px-3.5 w-12 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-2 px-3.5">
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={(e) => handleUpdateItem(catKey, item.id, 'name', e.target.value)}
                                      className="w-full h-9 p-2 border border-slate-200 hover:border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm text-slate-900 font-medium"
                                    />
                                  </td>
                                  <td className="py-2 px-3.5">
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateItem(catKey, item.id, 'quantity', e.target.value)}
                                      className="w-full h-9 p-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-center font-bold text-slate-900"
                                    />
                                  </td>
                                  <td className="py-2 px-3.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.unit_cost}
                                      onChange={(e) => handleUpdateItem(catKey, item.id, 'unit_cost', e.target.value)}
                                      className="w-full h-9 p-2 border border-slate-200 rounded-lg text-xs sm:text-sm text-right font-bold text-slate-900"
                                    />
                                  </td>
                                  <td className="py-2 px-3.5 text-right font-black text-slate-900 text-sm">
                                    {formatINR(item.total_amount)}
                                  </td>
                                  <td className="py-2 px-3.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(catKey, item.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-1">No items added to this category.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Project Cost Validation Callout */}
              {calcResponse?.cost_validation && (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block text-sm sm:text-base">Scheme Eligible Project Cost Validation</span>
                    <p className="text-slate-600">
                      {calcResponse.cost_validation.reasons[0]}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Eligible Base for Subsidy</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-700 block">
                      {formatINR(calcResponse.cost_validation.eligible_project_cost)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* --------------------------------------------------------- */}
            {/* 6. SECTION D: FUNDING STRUCTURE WATERFALL                */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                      <Layers className="w-5 h-5 text-emerald-600" />
                      Section D — Funding Structure Waterfall
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Institutional capital stack: Loan = max(0, Total Cost - Equity - Govt Subsidy).
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                    Full Capital Coverage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {calcResponse.funding_waterfall.waterfall_stages.map((stg, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border text-center transition flex flex-col justify-between space-y-2 ${
                        stg.type === 'SUBSIDY' ? 'bg-emerald-50/80 border-emerald-300' :
                        stg.type === 'DEBT' ? 'bg-blue-50/80 border-blue-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                        {stg.source}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 block my-1">
                        {formatINR(stg.amount)}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 inline-block text-slate-700 mx-auto">
                        {stg.pct_of_cost}% of Outlay
                      </span>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {stg.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 7. SECTION E: LOAN CALCULATOR & REPAYMENT SCHEDULE       */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      Section E — Loan Calculator & Repayment Schedule
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Standard reducing-balance amortization with statutory moratorium grace periods.
                    </p>
                  </div>

                  {/* Frequency Switcher */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setRepaymentViewMode('monthly')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        repaymentViewMode === 'monthly' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Monthly Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepaymentViewMode('quarterly')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        repaymentViewMode === 'quarterly' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Quarterly Rollup
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepaymentViewMode('annual')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        repaymentViewMode === 'annual' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Annual Summary
                    </button>
                  </div>
                </div>

                {/* Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sanctioned Principal</span>
                    <span className="font-black text-slate-900 text-base sm:text-lg mt-1 block">{formatINR(calcResponse.amortization.summary.total_principal)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Interest Rate</span>
                    <span className="font-black text-slate-900 text-base sm:text-lg mt-1 block">{calcResponse.loan.effective_interest_rate}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lifetime Interest</span>
                    <span className="font-black text-amber-800 text-base sm:text-lg mt-1 block">{formatINR(calcResponse.amortization.summary.total_interest)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Repayment</span>
                    <span className="font-black text-emerald-800 text-base sm:text-lg mt-1 block">{formatINR(calcResponse.amortization.summary.total_repayment)}</span>
                  </div>
                </div>

                {/* Amortization Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={calcResponse.amortization.monthly_schedule}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} label={{ value: 'Repayment Month', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                      <Area type="monotone" dataKey="outstanding_principal" name="Outstanding Principal" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrincipal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Table Preview */}
                <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3.5">Period</th>
                        <th className="py-2.5 px-3.5 text-right">Opening Balance</th>
                        <th className="py-2.5 px-3.5 text-right">Principal Paid</th>
                        <th className="py-2.5 px-3.5 text-right">Interest Paid</th>
                        <th className="py-2.5 px-3.5 text-right">Total Payment</th>
                        <th className="py-2.5 px-3.5 text-right">Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {repaymentViewMode === 'monthly' && calcResponse.amortization.monthly_schedule.map((row) => (
                        <tr key={row.month} className={row.is_moratorium ? 'bg-amber-50/50' : 'hover:bg-slate-50 transition'}>
                          <td className="py-2 px-3.5 font-bold text-slate-900">
                            Month {row.month} {row.is_moratorium && <span className="text-amber-800 font-semibold">(Moratorium)</span>}
                          </td>
                          <td className="py-2 px-3.5 text-right text-slate-600">{formatINR(row.opening_principal)}</td>
                          <td className="py-2 px-3.5 text-right font-bold text-slate-900">{formatINR(row.principal_payment)}</td>
                          <td className="py-2 px-3.5 text-right text-amber-700 font-semibold">{formatINR(row.interest_payment)}</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(row.payment)}</td>
                          <td className="py-2 px-3.5 text-right font-bold text-emerald-800">{formatINR(row.closing_principal)}</td>
                        </tr>
                      ))}

                      {repaymentViewMode === 'quarterly' && calcResponse.amortization.quarterly_summary.map((row) => (
                        <tr key={row.quarter} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3.5 font-bold text-slate-900">{row.label}</td>
                          <td className="py-2 px-3.5 text-right text-slate-600">—</td>
                          <td className="py-2 px-3.5 text-right font-bold text-slate-900">{formatINR(row.principal_payment)}</td>
                          <td className="py-2 px-3.5 text-right text-amber-700 font-semibold">{formatINR(row.interest_payment)}</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(row.total_payment)}</td>
                          <td className="py-2 px-3.5 text-right font-bold text-emerald-800">{formatINR(row.outstanding_principal)}</td>
                        </tr>
                      ))}

                      {repaymentViewMode === 'annual' && calcResponse.amortization.annual_summary.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3.5 font-bold text-slate-900">{row.label}</td>
                          <td className="py-2 px-3.5 text-right text-slate-600">—</td>
                          <td className="py-2 px-3.5 text-right font-bold text-slate-900">{formatINR(row.principal_payment)}</td>
                          <td className="py-2 px-3.5 text-right text-amber-700 font-semibold">{formatINR(row.interest_payment)}</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(row.total_payment)}</td>
                          <td className="py-2 px-3.5 text-right font-bold text-emerald-800">{formatINR(row.outstanding_principal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 8. SECTION F: REVENUE & EXPENSE FORECAST ENGINE          */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Section F — 12-Month Revenue & Expense Forecast
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold uppercase">FORECAST</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold uppercase">OFFICIAL DATA DRIVEN</span>
                      <span className="text-xs text-slate-500 font-medium">Unit: {calcResponse.forecast.unit_of_measurement}</span>
                    </div>
                  </div>

                  {/* Scenario Toggle */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs sm:text-sm font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setForecastScenario('conservative')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        forecastScenario === 'conservative' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Conservative (-15%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForecastScenario('base')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        forecastScenario === 'base' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Base Case (Expected)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForecastScenario('optimistic')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        forecastScenario === 'optimistic' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Optimistic (+15%)
                    </button>
                  </div>
                </div>

                {/* Forecast Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={calcResponse.forecast.scenarios[forecastScenario].months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip formatter={(val: any) => formatINR(Number(val))} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar dataKey="gross_revenue" name="Gross Revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="total_opex" name="Operating Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="operating_profit" name="Operating Profit (EBITDA)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 9. SECTION G: CASH FLOW ANALYSIS & SHORTFALL WARNING     */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Section G — 12-Month Liquidity & Cash Flow Statement
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Tracks monthly cash inflows, debt service outflows, and net closing bank balance.
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    calcResponse.cash_flow.has_cash_deficit ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    ● {calcResponse.cash_flow.has_cash_deficit ? 'Working Capital Deficit Detected' : 'Comfortable Liquidity Surplus'}
                  </span>
                </div>

                {calcResponse.cash_flow.has_cash_deficit && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-900 text-xs sm:text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{calcResponse.cash_flow.warning_message}</span>
                  </div>
                )}

                {/* Cash Flow Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calcResponse.cash_flow.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip formatter={(v: any) => formatINR(Number(v))} />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Line type="monotone" dataKey="closing_cash" name="Closing Cash Balance" stroke="#059669" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="net_cash_flow" name="Net Monthly Cash Flow" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 10. BREAK-EVEN & REAL-TIME SENSITIVITY SLIDERS            */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Break-Even Box */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <PieChart className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Break-Even Economics</h4>
                      <p className="text-xs text-slate-500">Commercial viability threshold</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs sm:text-sm">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block uppercase font-bold text-[11px]">Break-Even Revenue</span>
                      <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">{formatINR(calcResponse.break_even.break_even_revenue)}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block uppercase font-bold text-[11px]">Break-Even Production</span>
                      <span className="text-base sm:text-lg font-black text-slate-900 mt-1 block">{calcResponse.break_even.break_even_units.toLocaleString()} {calcResponse.forecast.unit_of_measurement}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block uppercase font-bold text-[11px]">Contribution Margin</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700 mt-1 block">{calcResponse.break_even.contribution_margin_ratio}%</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block uppercase font-bold text-[11px]">Margin of Safety</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700 mt-1 block">{calcResponse.break_even.margin_of_safety_pct}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    Enterprise reaches complete operational break-even within approx <strong>{calcResponse.break_even.break_even_months} months</strong> under standard operating capacity.
                  </p>
                </div>

                {/* Real-Time Sensitivity Sliders */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">What-If Sensitivity Simulation</h4>
                        <p className="text-xs text-slate-500">Real-time stress test on key variables</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatIfModifiers({
                        project_cost_delta_pct: 0,
                        revenue_delta_pct: 0,
                        interest_rate_delta_pct: 0,
                        raw_material_delta_pct: 0,
                        own_contribution_delta_pct: 0,
                        scale_multiplier: 1.0
                      })}
                      className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      Reset Modifiers
                    </button>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <div className="flex justify-between text-slate-700 font-bold mb-1.5">
                        <span>Project Cost Change</span>
                        <span className="font-black text-slate-900">{whatIfModifiers.project_cost_delta_pct > 0 ? `+${whatIfModifiers.project_cost_delta_pct}%` : `${whatIfModifiers.project_cost_delta_pct}%`}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-20" 
                        max="30" 
                        step="5" 
                        value={whatIfModifiers.project_cost_delta_pct}
                        onChange={(e) => setWhatIfModifiers({ ...whatIfModifiers, project_cost_delta_pct: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 font-bold mb-1.5">
                        <span>Revenue Realization Impact</span>
                        <span className="font-black text-slate-900">{whatIfModifiers.revenue_delta_pct > 0 ? `+${whatIfModifiers.revenue_delta_pct}%` : `${whatIfModifiers.revenue_delta_pct}%`}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-30" 
                        max="30" 
                        step="5" 
                        value={whatIfModifiers.revenue_delta_pct}
                        onChange={(e) => setWhatIfModifiers({ ...whatIfModifiers, revenue_delta_pct: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 font-bold mb-1.5">
                        <span>Interest Rate Variation</span>
                        <span className="font-black text-slate-900">{whatIfModifiers.interest_rate_delta_pct > 0 ? `+${whatIfModifiers.interest_rate_delta_pct}%` : `${whatIfModifiers.interest_rate_delta_pct}%`}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-2" 
                        max="4" 
                        step="0.5" 
                        value={whatIfModifiers.interest_rate_delta_pct}
                        onChange={(e) => setWhatIfModifiers({ ...whatIfModifiers, interest_rate_delta_pct: Number(e.target.value) })}
                        className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" 
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <span>Most Sensitive Variable: <strong className="text-slate-900">{calcResponse.sensitivity_analysis.most_sensitive_variable}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* 11. RECOMMENDED SCALE & AI ADVISOR                        */}
            {/* --------------------------------------------------------- */}
            {calcResponse && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recommended Scale */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Recommended Project Scale</h4>
                      <p className="text-xs text-slate-500">Optimal investment capacity evaluated against available equity</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs sm:text-sm">
                    <span className="text-emerald-950 font-black block text-base">
                      Recommended Project Cost: {calcResponse.recommended_project_size.formatted_recommended_cost}
                    </span>
                    <p className="text-emerald-900 mt-1 leading-relaxed">
                      {calcResponse.recommended_project_size.reason}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    {calcResponse.recommended_project_size.scenarios.map((sc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-bold text-slate-900">{sc.formatted_cost}</span>
                        <span className="text-slate-600">Loan: {formatINR(sc.estimated_loan)}</span>
                        <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          sc.feasibility === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                          sc.feasibility === 'MODERATE' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {sc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Advisor Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="text-base font-bold text-slate-900">AI Institutional Underwriting Advisor</h4>
                          <p className="text-xs text-slate-500">Institutional credit appraisal insights strictly grounded in calculated data</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold uppercase">
                        AI EXPLAINABILITY
                      </span>
                    </div>

                    {aiAdvisoryData ? (
                      <div className="space-y-3 text-xs sm:text-sm text-slate-700 mt-3">
                        <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                          {aiAdvisoryData.advisory_summary}
                        </p>
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">Key Underwriting Strengths:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {aiAdvisoryData.key_strengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">Actionable Recommendations:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {aiAdvisoryData.actionable_recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs sm:text-sm text-slate-500 space-y-1">
                        <p>Generate grounded insights on debt servicing coverage, liquidity buffer, and bank documentation.</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadAiAdvisor}
                    disabled={loadingAiAdvisor}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingAiAdvisor ? 'Analyzing Calculated Figures...' : 'Generate AI Underwriting Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: DETAILED BANK DPR (28 SECTIONS)                        */}
        {/* ============================================================= */}
        {activeTab === 'bank_dpr' && calcResponse && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-12 space-y-8 text-slate-900 print:border-none print:shadow-none print:p-0">
            {/* DPR Header Branding */}
            <div className="border-b-2 border-emerald-700 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                  {calcResponse.bank_dpr.metadata.system_branding}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  DETAILED PROJECT APPRAISAL REPORT (DPR)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Prepared for Institutional Financing under {calcResponse.selected_scheme_rule?.name || 'MSME Priority Lending Guidelines'}
                </p>
              </div>

              <div className="text-right text-xs sm:text-sm space-y-0.5">
                <span className="font-bold text-slate-900 block">Report ID: {calcResponse.bank_dpr.metadata.report_id}</span>
                <span className="text-slate-600 block">Generated: {calcResponse.bank_dpr.metadata.formatted_date}</span>
                <span className="text-emerald-700 font-bold block">Rule Version: {calcResponse.bank_dpr.metadata.rule_version_used}</span>
              </div>
            </div>

            {/* 28 Formal Sections Rendered Cleanly */}
            <div className="space-y-8 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {/* Section 1 & 2 & 3: Applicant, Project & Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs border-b pb-1.5">
                    1. Applicant Details
                  </h4>
                  <p><strong>Name:</strong> {calcResponse.bank_dpr.sections['1_applicant_details']?.full_name}</p>
                  <p><strong>Phone:</strong> {calcResponse.bank_dpr.sections['1_applicant_details']?.contact_phone}</p>
                  <p><strong>Type:</strong> {calcResponse.bank_dpr.sections['1_applicant_details']?.applicant_type}</p>
                  <p><strong>KYC:</strong> {calcResponse.bank_dpr.sections['1_applicant_details']?.aadhaar_pan_status}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs border-b pb-1.5">
                    2. Project Profile
                  </h4>
                  <p><strong>Activity:</strong> {calcResponse.bank_dpr.sections['2_project_details']?.activity_name}</p>
                  <p><strong>Sector:</strong> {calcResponse.bank_dpr.sections['2_project_details']?.sector}</p>
                  <p><strong>Capacity:</strong> {calcResponse.bank_dpr.sections['2_project_details']?.proposed_capacity}</p>
                  <p><strong>Timeline:</strong> {calcResponse.bank_dpr.sections['2_project_details']?.implementation_period}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs border-b pb-1.5">
                    3. Location Master Data
                  </h4>
                  <p><strong>Village:</strong> {calcResponse.bank_dpr.sections['3_location']?.village}</p>
                  <p><strong>Block / District:</strong> {calcResponse.bank_dpr.sections['3_location']?.block_taluka}, {calcResponse.bank_dpr.sections['3_location']?.district}</p>
                  <p><strong>State:</strong> {calcResponse.bank_dpr.sections['3_location']?.state}</p>
                  <p><strong>Classification:</strong> {calcResponse.bank_dpr.sections['3_location']?.area_classification} Area</p>
                </div>
              </div>

              {/* Section 4, 5, 6: Promoter, Business Description, Market */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-1.5 text-xs">
                    4. Promoter Profile
                  </h4>
                  <p>Age: {calcResponse.bank_dpr.sections['4_promoter_profile']?.age} Yrs | Gender: {calcResponse.bank_dpr.sections['4_promoter_profile']?.gender}</p>
                  <p>Category: {calcResponse.bank_dpr.sections['4_promoter_profile']?.social_category} ({calcResponse.bank_dpr.sections['4_promoter_profile']?.special_category})</p>
                  <p>Qualification: {calcResponse.bank_dpr.sections['4_promoter_profile']?.educational_qualification}</p>
                  <p>Prior Business: {calcResponse.bank_dpr.sections['4_promoter_profile']?.existing_business}</p>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-1.5 text-xs">
                    5. Business Description
                  </h4>
                  <p>{calcResponse.bank_dpr.sections['5_business_description']?.overview}</p>
                  <p className="mt-1 text-slate-600">{calcResponse.bank_dpr.sections['5_business_description']?.employment_generation}</p>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-1.5 text-xs">
                    6. Market & Demand Overview
                  </h4>
                  <p>{calcResponse.bank_dpr.sections['6_market_overview']?.demand_drivers}</p>
                  <p className="mt-1 text-slate-600">Target Buyer: {calcResponse.bank_dpr.sections['6_market_overview']?.target_market}</p>
                </div>
              </div>

              {/* Section 7: Project Cost Table */}
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                  7. Itemized Project Cost Statement
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3.5">Asset Category</th>
                        <th className="py-2.5 px-3.5">Line Item</th>
                        <th className="py-2.5 px-3.5 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Unit Rate (₹)</th>
                        <th className="py-2.5 px-3.5 text-right">Total Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {calcResponse.project_cost.all_items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3.5 font-medium text-slate-600">{it.category_label || it.category}</td>
                          <td className="py-2 px-3.5 font-bold text-slate-900">{it.name}</td>
                          <td className="py-2 px-3.5 text-center font-semibold">{it.quantity}</td>
                          <td className="py-2 px-3.5 text-right font-medium">{formatINR(it.unit_cost)}</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(it.total_amount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="py-2.5 px-3.5 text-right font-black uppercase">TOTAL PROJECT COST</td>
                        <td className="py-2.5 px-3.5 text-right text-emerald-800 text-base font-black">
                          {formatINR(calcResponse.project_cost.total_project_cost)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 8 & 9 & 10: Means of Finance & Subsidy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                    8. Means of Finance (Funding Waterfall)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-100 font-bold">
                        <tr>
                          <th className="py-2 px-3.5">Funding Source</th>
                          <th className="py-2 px-3.5 text-center">% Share</th>
                          <th className="py-2 px-3.5 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {calcResponse.funding_waterfall.waterfall_stages.map((stg, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3.5 font-bold text-slate-900">{stg.source}</td>
                            <td className="py-2 px-3.5 text-center font-semibold">{stg.pct_of_cost}%</td>
                            <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(stg.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                    9 & 10. Government Scheme & Subsidy Calculation
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <p><strong>Nodal Scheme:</strong> {calcResponse.selected_scheme_rule?.name || 'N/A'}</p>
                    <p><strong>Subsidy Rate:</strong> {calcResponse.subsidy.applicable_subsidy_pct}% ({calcResponse.subsidy.subsidy_timing_display})</p>
                    <p><strong>Eligible Base:</strong> {formatINR(calcResponse.subsidy.eligible_base_amount)}</p>
                    <p><strong>Total Sanctioned Subsidy:</strong> <span className="font-black text-emerald-800 text-base">{formatINR(calcResponse.subsidy.final_subsidy_amount)}</span></p>
                    <p className="text-xs text-slate-600 border-t pt-2 mt-1">
                      {calcResponse.subsidy.calculation_explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 11, 12, 13: Loan & EMI Repayment */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-black text-slate-900 uppercase tracking-wider mb-3 text-xs">
                  11, 12 & 13. Bank Loan & Repayment Structure
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[11px]">Bank Sanction Required</span>
                    <span className="font-black text-slate-900 text-base mt-1 block">{formatINR(calcResponse.loan.principal)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[11px]">Interest Rate & Tenure</span>
                    <span className="font-black text-slate-900 text-base mt-1 block">{calcResponse.loan.effective_interest_rate}% p.a. / {calcResponse.loan.tenure_months} M</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[11px]">Active Monthly EMI</span>
                    <span className="font-black text-emerald-800 text-base mt-1 block">{formatINR(calcResponse.amortization.summary.active_emi)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block uppercase text-[11px]">Moratorium Policy</span>
                    <span className="font-black text-slate-900 text-base mt-1 block">{calcResponse.loan.moratorium_months} M ({calcResponse.loan.moratorium_policy})</span>
                  </div>
                </div>
              </div>

              {/* Section 17 & 18: Profit & Loss and Cash Flow Year 1 Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                    17. Profit & Loss Statement (Year 1)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-2 px-3.5">Gross Sales Revenue</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-900">{formatINR(calcResponse.profit_and_loss.annual_summary.gross_revenue)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 text-slate-600">Less: Direct Operating Expenses</td>
                          <td className="py-2 px-3.5 text-right text-rose-700 font-semibold">-{formatINR(calcResponse.profit_and_loss.annual_summary.total_opex)}</td>
                        </tr>
                        <tr className="font-bold bg-slate-50/50">
                          <td className="py-2 px-3.5">EBITDA / Operating Profit</td>
                          <td className="py-2 px-3.5 text-right text-emerald-800 font-black">{formatINR(calcResponse.profit_and_loss.annual_summary.ebitda)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 text-slate-600">Less: Depreciation (10% SLM)</td>
                          <td className="py-2 px-3.5 text-right text-slate-700 font-medium">-{formatINR(calcResponse.profit_and_loss.annual_summary.depreciation)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 text-slate-600">Less: Bank Loan Interest</td>
                          <td className="py-2 px-3.5 text-right text-slate-700 font-medium">-{formatINR(calcResponse.profit_and_loss.annual_summary.interest_expense)}</td>
                        </tr>
                        <tr className="font-bold text-sm bg-emerald-50">
                          <td className="py-2.5 px-3.5 text-emerald-950 font-black">Net Profit After Tax (PAT)</td>
                          <td className="py-2.5 px-3.5 text-right text-emerald-900 font-black text-base">{formatINR(calcResponse.profit_and_loss.annual_summary.pat)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                    18, 19 & 20. Cash Flow, Break-Even & DSCR
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2 px-3.5 font-bold">Year 1 Cash Inflows</td>
                          <td className="py-2 px-3.5 text-right font-black">{formatINR(calcResponse.cash_flow.annual_inflows)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-bold">Year 1 Cash Outflows</td>
                          <td className="py-2 px-3.5 text-right font-black text-slate-700">{formatINR(calcResponse.cash_flow.annual_outflows)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-2 px-3.5">Closing Bank Balance (Year 1)</td>
                          <td className="py-2 px-3.5 text-right text-emerald-800 font-black">{formatINR(calcResponse.cash_flow.closing_cash_year1)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3.5 font-bold">Break-Even Sales Revenue</td>
                          <td className="py-2 px-3.5 text-right font-black">{formatINR(calcResponse.break_even.break_even_revenue)}</td>
                        </tr>
                        <tr className="bg-emerald-50 font-bold text-sm">
                          <td className="py-2.5 px-3.5 text-emerald-950 font-black">Debt Service Coverage Ratio (DSCR)</td>
                          <td className="py-2.5 px-3.5 text-right text-emerald-900 font-black text-base">{calcResponse.dscr.dscr_value} ({calcResponse.dscr.status})</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 21 to 28: Institutional Assessment, Checklist & Signatures */}
              <div className="border-t-2 border-slate-200 pt-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                      24 & 25. Institutional Scorecard & Document Checklist
                    </h4>
                    <p className="mb-2"><strong>Feasibility Score:</strong> {calcResponse.feasibility_score.score}/100 — {calcResponse.feasibility_score.status}</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                      {calcResponse.bank_dpr.sections['25_required_documents']?.checklist.slice(0, 5).map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">
                      27 & 28. Sources & Institutional Disclaimer
                    </h4>
                    <p className="text-xs text-slate-600">
                      <strong>Rule Version:</strong> {calcResponse.calculation_audit.rule_version_used} | 
                      <strong> Status:</strong> {calcResponse.calculation_audit.verification_status} | 
                      <strong> Last Verified:</strong> {calcResponse.calculation_audit.last_verified}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">
                      {calcResponse.bank_dpr.sections['28_disclaimer']?.text}
                    </p>
                  </div>
                </div>

                {/* Signature Blocks for Formal DPR */}
                <div className="pt-10 flex items-center justify-between border-t border-slate-200 text-xs sm:text-sm text-slate-600">
                  <div className="text-center">
                    <div className="w-56 border-b-2 border-slate-400 mb-2"></div>
                    <span className="font-bold text-slate-800">Signature of Applicant / Promoter</span>
                  </div>
                  <div className="text-center">
                    <div className="w-56 border-b-2 border-slate-400 mb-2"></div>
                    <span className="font-bold text-slate-800">Appraising Bank Branch Officer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 11. "HOW WAS THIS CALCULATED?" SUBSIDY MODAL                  */}
      {/* ------------------------------------------------------------- */}
      {showCalculationModal && calcResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                Subsidy Calculation Transparency Audit
              </h3>
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-black text-emerald-950 block text-base">
                  {calcResponse.subsidy.applicable_subsidy_pct}% Applicable Subsidy Rate
                </span>
                <span className="text-emerald-800 font-bold text-sm block mt-0.5">
                  Sanctioned Amount: {formatINR(calcResponse.subsidy.final_subsidy_amount)}
                </span>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Step-by-Step Arithmetic Traceability:</span>
                <ol className="space-y-2 list-decimal list-inside text-slate-700">
                  {calcResponse.subsidy.calculation_steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-0.5">
                <p><strong>Official Document:</strong> {calcResponse.subsidy.source_document || 'Official Gazette'}</p>
                <p><strong>Rule Engine Version:</strong> {calcResponse.subsidy.rule_version} | <strong>Status:</strong> {calcResponse.subsidy.verification_status}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPlanPage;
