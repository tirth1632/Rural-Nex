import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Landmark, 
  Search, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Scale, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';

import type {
  GovtSchemeListItem,
  GovtSchemeDetail,
  SchemeCategory,
  SchemeStats,
  SchemeMatchItem,
  SchemeComparisonItem,
  SavedSchemeItem,
  BenefitCalculationResult
} from '../../api/schemes';

import {
  fetchSchemes,
  fetchSchemeStats,
  fetchSchemeCategories,
  fetchSchemeLocations,
  fetchSchemeDetail,
  matchSchemes,
  calculateSchemeBenefit,
  compareSchemes,
  fetchSavedSchemes,
  saveScheme,
  deleteSavedScheme,
  addSchemeToFinancialPlan
} from '../../api/schemes';

export const ALL_INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('dairy') || lower.includes('animal') || lower.includes('livestock')) return '🐄';
  if (lower.includes('agri') || lower.includes('farm') || lower.includes('crop')) return '🌾';
  if (lower.includes('solar') || lower.includes('energy') || lower.includes('green') || lower.includes('renew')) return '☀️';
  if (lower.includes('women') || lower.includes('mahila')) return '👩‍👧‍👦';
  if (lower.includes('msme') || lower.includes('small') || lower.includes('business')) return '🏭';
  if (lower.includes('handicraft') || lower.includes('art') || lower.includes('handloom') || lower.includes('textile')) return '🎨';
  if (lower.includes('food') || lower.includes('process')) return '🍲';
  if (lower.includes('fish') || lower.includes('aqua')) return '🐟';
  if (lower.includes('retail') || lower.includes('trade')) return '🏪';
  if (lower.includes('service') || lower.includes('logistics')) return '🚚';
  return '🏛️';
}

export default function GovtSchemesPage() {
  const navigate = useNavigate();

  // Master Data & Stats
  const [stats, setStats] = useState<SchemeStats | null>(null);
  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Computed & Combined Locations (active states from DB + all Indian states)
  const combinedStateList = React.useMemo(() => {
    const set = new Set([...availableStates, ...ALL_INDIAN_STATES_AND_UTS]);
    return Array.from(set).sort();
  }, [availableStates]);

  // Scheme Grid State
  const [schemes, setSchemes] = useState<GovtSchemeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingSchemes, setLoadingSchemes] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBenefit, setSelectedBenefit] = useState<string>('all');
  const [collateralFreeOnly, setCollateralFreeOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Unified Location Selector helper
  const currentLocationFilter = selectedJurisdiction === 'central' ? 'central' : (selectedState || 'all');

  const handleLocationFilterChange = (val: string) => {
    setCurrentPage(1);
    if (val === 'all') {
      setSelectedJurisdiction('all');
      setSelectedState('');
    } else if (val === 'central') {
      setSelectedJurisdiction('central');
      setSelectedState('');
    } else {
      setSelectedJurisdiction('state');
      setSelectedState(val);
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedJurisdiction !== 'all' ||
    selectedState !== '' ||
    selectedCategory !== 'all' ||
    selectedBenefit !== 'all' ||
    collateralFreeOnly ||
    verifiedOnly
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedJurisdiction('all');
    setSelectedState('');
    setSelectedCategory('all');
    setSelectedBenefit('all');
    setCollateralFreeOnly(false);
    setVerifiedOnly(false);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // Instant Matcher State
  const [matcherSector, setMatcherSector] = useState('Agriculture & Food');
  const [matcherCost, setMatcherCost] = useState(1000000);
  const [matcherState, setMatcherState] = useState('Gujarat');
  const [matcherDistrict, setMatcherDistrict] = useState('');
  const [matcherRuralUrban, setMatcherRuralUrban] = useState<'rural' | 'urban'>('rural');
  const [matcherStage, setMatcherStage] = useState<'new' | 'existing' | 'expansion'>('new');
  const [matcherCategory, setMatcherCategory] = useState('general');
  const [matcherGender, setMatcherGender] = useState<'male' | 'female' | 'other'>('male');
  const [matcherAge, setMatcherAge] = useState(28);
  const [matcherSpecial, setMatcherSpecial] = useState('none');
  const [matcherResults, setMatcherResults] = useState<SchemeMatchItem[]>([]);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [matcherHasSearched, setMatcherHasSearched] = useState(false);
  const [matcherMobileOpen, setMatcherMobileOpen] = useState(false);

  // Scheme Detail Modal
  const [detailSchemeId, setDetailSchemeId] = useState<string | null>(null);
  const [detailScheme, setDetailScheme] = useState<GovtSchemeDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'benefits' | 'eligibility' | 'calculator' | 'docs' | 'steps'>('overview');

  // Benefit Calculator within Modal
  const [calcCost, setCalcCost] = useState<number>(1000000);
  const [calcOwn, setCalcOwn] = useState<number>(100000);
  const [calcResult, setCalcResult] = useState<BenefitCalculationResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Scheme Comparison State
  const [comparedSchemeIds, setComparedSchemeIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [comparisonMatrix, setComparisonMatrix] = useState<SchemeComparisonItem[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  // Saved Schemes Drawer
  const [savedSchemes, setSavedSchemes] = useState<SavedSchemeItem[]>([]);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);

  // Active Proposal synchronization from LocalStorage
  useEffect(() => {
    try {
      const activeState = localStorage.getItem('ruralnex_active_state');
      if (activeState && !selectedState) {
        setSelectedState(activeState);
        setMatcherState(activeState);
      }
    } catch {
      // ignore
    }
  }, [selectedState]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load stats, categories, and locations on mount
  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoadingStats(true);
        const [statsData, categoriesData, locationsData] = await Promise.all([
          fetchSchemeStats(),
          fetchSchemeCategories(),
          fetchSchemeLocations(),
        ]);
        setStats(statsData);
        setCategories(categoriesData);
        setAvailableStates(locationsData.active_states);
      } catch (err) {
        console.error('Failed to load master scheme data:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadMasterData();
    loadSavedSchemes();
  }, []);

  // Load Schemes based on active filters and search
  const loadSchemes = useCallback(async () => {
    try {
      setLoadingSchemes(true);
      const res = await fetchSchemes({
        q: debouncedSearch || undefined,
        jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
        state: selectedState || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        benefit_type: selectedBenefit !== 'all' ? selectedBenefit : undefined,
        collateral_free: collateralFreeOnly || undefined,
        verified_only: verifiedOnly || undefined,
        sort_by: sortBy,
        page: currentPage,
        page_size: 12
      });
      setSchemes(res.results);
      setTotalCount(res.total_count);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoadingSchemes(false);
    }
  }, [
    debouncedSearch,
    selectedJurisdiction,
    selectedState,
    selectedCategory,
    selectedBenefit,
    collateralFreeOnly,
    verifiedOnly,
    sortBy,
    currentPage
  ]);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  // Load Saved Schemes
  const loadSavedSchemes = async () => {
    try {
      const data = await fetchSavedSchemes();
      setSavedSchemes(data);
    } catch {
      // User might be unauthenticated or demo mode
    }
  };

  // Toggle Save Scheme
  const handleToggleSave = async (schemeId: string) => {
    try {
      const existing = savedSchemes.find(s => s.scheme === schemeId || s.scheme_details?.official_id === schemeId);
      if (existing) {
        await deleteSavedScheme(existing.id);
        setSavedSchemes(prev => prev.filter(s => s.id !== existing.id));
      } else {
        const newItem = await saveScheme(schemeId);
        setSavedSchemes(prev => [newItem, ...prev]);
      }
    } catch (err) {
      console.error('Error toggling save scheme:', err);
    }
  };

  const isSchemeSaved = (schemeId: string, officialId?: string) => {
    return savedSchemes.some(s => s.scheme === schemeId || s.scheme_details?.official_id === officialId);
  };

  // Toggle Comparison
  const handleToggleCompare = (id: string) => {
    setComparedSchemeIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 5) {
        alert("You can compare up to 5 schemes simultaneously.");
        return prev;
      }
      return [...prev, id];
    });
  };

  // Open Scheme Comparison Modal
  const handleOpenComparison = async () => {
    if (comparedSchemeIds.length < 2) {
      alert("Please select at least 2 schemes to compare.");
      return;
    }
    try {
      setCompareLoading(true);
      setCompareModalOpen(true);
      const res = await compareSchemes(comparedSchemeIds);
      setComparisonMatrix(res.schemes);
    } catch (err) {
      console.error('Error fetching scheme comparison:', err);
    } finally {
      setCompareLoading(false);
    }
  };

  // Instant Scheme Matcher Submission
  const handleRunMatcher = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setMatchingInProgress(true);
      setMatcherHasSearched(true);
      const res = await matchSchemes({
        project_cost: matcherCost,
        business_sector: matcherSector,
        state: matcherState || undefined,
        district: matcherDistrict || undefined,
        rural_urban: matcherRuralUrban,
        business_stage: matcherStage,
        promoter_category: matcherCategory,
        gender: matcherGender,
        age: matcherAge,
        special_category: matcherSpecial
      });
      setMatcherResults(res.matched_schemes);
    } catch (err) {
      console.error('Error running instant scheme matcher:', err);
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Open Scheme Details Modal
  const handleOpenDetail = async (schemeId: string) => {
    try {
      setDetailSchemeId(schemeId);
      setDetailLoading(true);
      setDetailTab('overview');
      const data = await fetchSchemeDetail(schemeId);
      setDetailScheme(data);
      setCalcCost(data.financial_rule?.max_project_cost ? Math.min(1000000, Number(data.financial_rule.max_project_cost)) : 1000000);
      setCalcOwn(100000);
      setCalcResult(null);
    } catch (err) {
      console.error('Error fetching scheme detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Trigger Benefit Calculation in Modal
  const handleRunBenefitCalc = async () => {
    if (!detailScheme) return;
    try {
      setCalcLoading(true);
      const res = await calculateSchemeBenefit(detailScheme.official_id, {
        project_cost: calcCost,
        own_contribution: calcOwn,
        rural_urban: matcherRuralUrban,
        gender: matcherGender,
        social_category: matcherCategory,
        special_category: matcherSpecial
      });
      setCalcResult(res);
    } catch (err) {
      console.error('Error calculating benefit:', err);
    } finally {
      setCalcLoading(false);
    }
  };

  // Handoff to Financial Plan Module
  const handleAddToFinancialPlan = async (schemeId: string) => {
    try {
      const res = await addSchemeToFinancialPlan(schemeId);
      localStorage.setItem('ruralnex_selected_scheme', JSON.stringify(res));
      navigate(res.redirect_url || `/finance?scheme_id=${res.official_id}`);
    } catch (err) {
      console.error('Error adding scheme to financial plan:', err);
      navigate(`/finance?scheme_id=${schemeId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black text-gray-900 dark:text-zinc-100 transition-colors pb-24">
      
      {/* -------------------------------------------------------------
          1. HERO SECTION (Dynamic Statistics)
      ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-transparent pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-200/80 dark:border-zinc-800/80">
        <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-primary/10 text-primary border border-primary/25 mb-4 shadow-xs">
                <ShieldCheck size={16} className="text-primary" />
                <span>OFFICIAL GOVERNMENT WELFARE &amp; SUBSIDIES</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15]">
                Rural Enterprise Government Schemes &amp; Subsidies
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-300 font-medium leading-relaxed">
                Discover verified Central and State government schemes, capital subsidies, credit support, interest benefits, and collateral-free guarantees for your rural enterprise.
              </p>
            </div>

            {/* Dynamic Statistics Symmetrical Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0">
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-primary">
                    {loadingStats ? '...' : `${stats?.verified_schemes || 14}+`}
                  </div>
                  <ShieldCheck className="text-primary/70 shrink-0" size={20} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mt-1.5">
                  Verified Schemes
                </div>
              </div>

              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                    {loadingStats ? '...' : `${stats?.central_schemes || 8}`}
                  </div>
                  <Landmark className="text-blue-500/70 shrink-0" size={20} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mt-1.5">
                  Central Schemes
                </div>
              </div>

              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                    {loadingStats ? '...' : `${stats?.state_schemes || 6}`}
                  </div>
                  <Scale className="text-purple-500/70 shrink-0" size={20} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mt-1.5">
                  State Schemes
                </div>
              </div>

              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm sm:text-base font-black text-gray-950 dark:text-white truncate">
                    {loadingStats ? '...' : (stats?.last_data_update || 'Recent')}
                  </div>
                  <Clock className="text-amber-500/80 shrink-0" size={18} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mt-1.5">
                  Last Update
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. SEARCH & JURISDICTION BAR (Unified & Accessible)
      ------------------------------------------------------------- */}
      <section className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, ministry, category, benefit type, business sector..."
                className="w-full h-12 pl-12 pr-11 bg-gray-50 dark:bg-zinc-800/90 rounded-xl border border-gray-200 dark:border-zinc-700 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Single Unified Geographic / Jurisdiction Dropdown */}
            <div className="relative shrink-0 w-full md:w-72">
              <select
                value={currentLocationFilter}
                onChange={(e) => handleLocationFilterChange(e.target.value)}
                className="w-full appearance-none h-12 pl-4 pr-10 bg-gray-50 dark:bg-zinc-800/90 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-bold text-gray-900 dark:text-zinc-100 outline-none cursor-pointer focus:ring-2 focus:ring-primary shadow-xs transition"
              >
                <option value="all">🇮🇳 All India (Central &amp; All States)</option>
                <option value="central">🏛️ Central Government Only</option>
                <optgroup label="── State Government Schemes ──" className="font-bold text-gray-500">
                  {combinedStateList.map((st) => (
                    <option key={st} value={st} className="font-medium text-gray-900 dark:text-white">
                      📍 {st} State Schemes
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 pointer-events-none" size={18} />
            </div>

            {/* Saved Schemes Bookmark Toggle */}
            <button
              onClick={() => setSavedDrawerOpen(true)}
              className="h-12 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 transition shrink-0 shadow-xs"
              title="View Bookmarked Schemes"
            >
              <Bookmark size={18} className="text-primary" />
              <span>Saved Schemes</span>
              {savedSchemes.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-primary text-white font-black">
                  {savedSchemes.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filter Checkbox Toggles, Benefit Filter, Sorting, & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Collateral-Free Pill Button */}
              <button
                type="button"
                onClick={() => setCollateralFreeOnly(!collateralFreeOnly)}
                className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition ${
                  collateralFreeOnly
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                <ShieldCheck size={16} className={collateralFreeOnly ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
                <span>Collateral-Free Only</span>
                {collateralFreeOnly && <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />}
              </button>

              {/* Verified Only Pill Button */}
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition ${
                  verifiedOnly
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                <CheckCircle2 size={16} className={verifiedOnly ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} />
                <span>Official Verified Only</span>
              </button>

              {/* Benefit Type Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedBenefit}
                  onChange={(e) => setSelectedBenefit(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-gray-800 dark:text-zinc-200 outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Benefit Types</option>
                  <option value="CAPITAL_SUBSIDY">💰 Capital Subsidy</option>
                  <option value="INTEREST_SUBVENTION">📉 Interest Subvention</option>
                  <option value="LOAN_SUPPORT">🏦 Composite Loan Support</option>
                  <option value="COLLATERAL_FREE">🛡️ Credit Guarantee</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Reset Filters Action */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-10 px-3 rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-zinc-400">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-10 pl-3 pr-8 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer focus:ring-1 focus:ring-primary"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="benefit_high">Highest Potential Benefit</option>
                  <option value="recently_verified">Recently Verified</option>
                  <option value="central_first">Central Schemes First</option>
                  <option value="state_first">State Schemes First</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. DYNAMIC CATEGORY PILLS (Horizontal Scroll with Icons)
      ------------------------------------------------------------- */}
      <section className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-11 px-5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white ring-2 ring-primary/20'
                : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>🇮🇳</span>
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`h-11 px-4 sm:px-5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-xs ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white ring-2 ring-primary/20'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="text-base">{getCategoryIcon(cat.name)}</span>
              <span>{cat.name}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                selectedCategory === cat.slug ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
              }`}>
                {cat.scheme_count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. MAIN CONTENT: 2-COLUMN LAYOUT (Schemes Grid + Instant Matcher)
      ------------------------------------------------------------- */}
      <section className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Scheme Cards Grid */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header / Active Filter Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Landmark className="text-primary" size={22} />
                  <span>Available Government Schemes</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Showing {schemes.length} of {totalCount} verified schemes matching your criteria
                </p>
              </div>

              {/* Mobile trigger for Instant Matcher */}
              <button
                onClick={() => setMatcherMobileOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles size={14} />
                <span>Find My Best Scheme</span>
              </button>
            </div>

            {/* Schemes List / Cards */}
            {loadingSchemes ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 animate-pulse h-48" />
                ))}
              </div>
            ) : schemes.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-zinc-800">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matching schemes found</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto mt-2">
                  Try selecting a broader category, clearing search terms, or checking All-India Central schemes.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedJurisdiction('all');
                    setSelectedState('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {schemes.map((scheme) => {
                  const fin = scheme.financial_summary;
                  const isSaved = isSchemeSaved(scheme.id, scheme.official_id);
                  const isCompared = comparedSchemeIds.includes(scheme.official_id);

                  return (
                    <div
                      key={scheme.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-gray-200/90 dark:border-zinc-800 shadow-sm hover:shadow-lg transition duration-200 relative group"
                    >
                      {/* Badges Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            scheme.level === 'CENTRAL' 
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30' 
                              : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                          }`}>
                            {scheme.level === 'CENTRAL' ? '🏛️ Central Scheme' : `📍 ${scheme.state || 'State'} Scheme`}
                          </span>

                          {scheme.badges?.map((badge, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25">
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* Verified Status Tag */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-black text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Official Verified</span>
                        </div>
                      </div>

                      {/* Scheme Name & Ministry */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white group-hover:text-primary transition-colors leading-tight">
                            {scheme.name}
                          </h3>
                          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-400 mt-1.5 flex flex-wrap items-center gap-2">
                            <span>{scheme.ministry}</span>
                            {scheme.nodal_agency && <span>• Nodal: {scheme.nodal_agency}</span>}
                          </div>
                        </div>

                        {/* Save Bookmark Action */}
                        <button
                          onClick={() => handleToggleSave(scheme.id)}
                          className={`p-2.5 rounded-xl border transition shrink-0 ${
                            isSaved 
                              ? 'bg-primary/10 border-primary/30 text-primary' 
                              : 'border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                          }`}
                          title={isSaved ? "Remove Bookmark" : "Save Scheme"}
                        >
                          {isSaved ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
                        </button>
                      </div>

                      {/* Short Description */}
                      <p className="mt-3.5 text-sm sm:text-base text-gray-700 dark:text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                        {scheme.short_description || scheme.description}
                      </p>

                      {/* Symmetrical 4-Card Financial Attributes Matrix */}
                      {fin && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-zinc-800/80">
                          <div className="p-3.5 rounded-xl bg-gray-50/90 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Max Subsidy Cap</div>
                            <div className="text-base sm:text-lg font-black text-gray-950 dark:text-white mt-1">
                              {fin.max_subsidy}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50">
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Subsidy Rate</div>
                            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                              {fin.subsidy_rate_display}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-gray-50/90 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Interest Support</div>
                            <div className="text-base sm:text-lg font-black text-gray-950 dark:text-white mt-1">
                              {fin.interest_subvention_pct > 0 ? `${fin.interest_subvention_pct}% Subvention` : fin.interest_rate_display}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-gray-50/90 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
                            <div className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Collateral Policy</div>
                            <div className="text-base sm:text-lg font-black text-gray-950 dark:text-white mt-1 truncate" title={fin.collateral_requirement}>
                              {fin.collateral_requirement}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleCompare(scheme.official_id)}
                            className={`h-11 px-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                              isCompared 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Scale size={16} />
                            <span>{isCompared ? 'Compared' : 'Compare'}</span>
                          </button>

                          {scheme.official_portal_url && (
                            <a
                              href={scheme.official_portal_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-11 px-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary flex items-center gap-1.5 transition hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                              <ExternalLink size={14} />
                              <span>Official Portal</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleOpenDetail(scheme.official_id)}
                            className="h-11 px-5 rounded-xl text-sm font-bold border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-zinc-100 transition shadow-xs"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleAddToFinancialPlan(scheme.official_id)}
                            className="h-11 px-5 rounded-xl text-sm font-black bg-primary hover:bg-primary/90 text-white shadow-md flex items-center gap-2 transition"
                          >
                            <Calculator size={16} />
                            <span>Add to Financial Plan</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between py-6 border-t border-gray-200 dark:border-zinc-800 mt-6">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="h-11 px-5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-xs"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                      Page <span className="text-primary font-black">{currentPage}</span> of {totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="h-11 px-5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition shadow-xs"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: INSTANT SCHEME MATCHER */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-zinc-800 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>Instant Scheme Matcher</span>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-950 dark:text-white">
                Find Your Best Scheme
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1 mb-5 leading-relaxed">
                Enter your business profile to evaluate statutory eligibility, calculate subsidy entitlement, and check credit guarantees.
              </p>

              <form onSubmit={handleRunMatcher} className="space-y-4">
                
                {/* Sector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Business Sector</label>
                  <select
                    value={matcherSector}
                    onChange={(e) => setMatcherSector(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="Agriculture & Food">🌾 Agriculture &amp; Food Processing</option>
                    <option value="Dairy & Livestock">🐄 Dairy &amp; Animal Husbandry</option>
                    <option value="Manufacturing">🏭 Manufacturing &amp; Engineering</option>
                    <option value="Rural Retail">🏪 Rural Retail &amp; Trading</option>
                    <option value="Rural Services">🚚 Rural Services &amp; Logistics</option>
                    <option value="Fisheries">🐟 Fisheries &amp; Aquaculture</option>
                    <option value="Renewable Energy">☀️ Renewable &amp; Solar Energy</option>
                  </select>
                </div>

                {/* State & District */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">State</label>
                    <select
                      value={matcherState}
                      onChange={(e) => setMatcherState(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      {combinedStateList.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">District (Optional)</label>
                    <input
                      type="text"
                      value={matcherDistrict}
                      onChange={(e) => setMatcherDistrict(e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Area & Stage */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Area Type</label>
                    <select
                      value={matcherRuralUrban}
                      onChange={(e) => setMatcherRuralUrban(e.target.value as any)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="rural">🏡 Rural Area</option>
                      <option value="urban">🏢 Urban Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Business Stage</label>
                    <select
                      value={matcherStage}
                      onChange={(e) => setMatcherStage(e.target.value as any)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="new">🌱 New Venture</option>
                      <option value="existing">⚙️ Existing Unit</option>
                      <option value="expansion">📈 Expansion</option>
                    </select>
                  </div>
                </div>

                {/* Project Cost */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Project Outlay</label>
                    <span className="text-lg font-black text-primary">₹{(matcherCost / 100000).toFixed(1)} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={5000000}
                    step={50000}
                    value={matcherCost}
                    onChange={(e) => setMatcherCost(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-1">
                    <span>₹50K</span>
                    <span>₹25 Lakh</span>
                    <span>₹50 Lakh</span>
                  </div>
                </div>

                {/* Promoter Profile */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Social Category</label>
                    <select
                      value={matcherCategory}
                      onChange={(e) => setMatcherCategory(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="general">General</option>
                      <option value="special">SC / ST / OBC / Minorities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Gender</label>
                    <select
                      value={matcherGender}
                      onChange={(e) => setMatcherGender(e.target.value as any)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female (Women Entrepreneur)</option>
                    </select>
                  </div>
                </div>

                {/* Age & Special */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Promoter Age</label>
                    <input
                      type="number"
                      min={18}
                      max={75}
                      value={matcherAge}
                      onChange={(e) => setMatcherAge(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Special Category</label>
                    <select
                      value={matcherSpecial}
                      onChange={(e) => setMatcherSpecial(e.target.value)}
                      className="w-full h-11 px-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="divyang">Divyang / PwD</option>
                      <option value="ex_servicemen">Ex-Servicemen</option>
                      <option value="ner">NER / Hill State</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={matchingInProgress}
                  className="w-full h-12 mt-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition"
                >
                  {matchingInProgress ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  <span>{matchingInProgress ? 'Evaluating Rules & Limits...' : 'Match Best Government Schemes'}</span>
                </button>
              </form>

              {/* Matcher Results Preview */}
              {matcherHasSearched && (
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                      Top Matched Schemes ({matcherResults.length})
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                    {matcherResults.slice(0, 3).map((match) => (
                      <div
                        key={match.id}
                        className="p-4 bg-gray-50/90 dark:bg-zinc-800/70 rounded-xl border border-gray-200/90 dark:border-zinc-700 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-sm text-gray-950 dark:text-white line-clamp-1">
                            {match.short_name}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                            match.match_score >= 80 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            {match.match_score}% Match
                          </span>
                        </div>

                        {/* Financial Preview */}
                        <div className="mt-2 text-xs sm:text-sm text-gray-700 dark:text-zinc-200">
                          {match.financial_preview.potential_subsidy_amount > 0 ? (
                            <span className="font-extrabold text-primary">
                              Potential Subsidy: ₹{match.financial_preview.potential_subsidy_amount.toLocaleString()} ({match.financial_preview.applicable_subsidy_pct}%)
                            </span>
                          ) : (
                            <span className="font-semibold">{match.financial_preview.collateral_requirement}</span>
                          )}
                        </div>

                        {/* Explainable Reasons */}
                        <div className="mt-2.5 space-y-1">
                          {match.matched_reasons.slice(0, 2).map((r, i) => (
                            <div key={i} className="text-xs text-emerald-700 dark:text-emerald-400 leading-tight font-medium flex items-center gap-1.5">
                              <CheckCircle2 size={12} className="shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action link */}
                        <div className="mt-3.5 pt-2.5 border-t border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleOpenDetail(match.official_id)}
                            className="font-bold text-gray-700 dark:text-zinc-300 hover:text-primary transition"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleAddToFinancialPlan(match.official_id)}
                            className="font-black text-primary flex items-center gap-1 hover:underline"
                          >
                            <span>Add to DPR</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. SCHEME DETAIL MODAL (6 Comprehensive Sections)
      ------------------------------------------------------------- */}
      {detailSchemeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-start justify-between gap-4 bg-gray-50/50 dark:bg-zinc-800/40">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                    {detailScheme?.level === 'CENTRAL' ? 'Central Government' : `${detailScheme?.state} State Scheme`}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    ID: {detailScheme?.official_id}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
                  {detailScheme?.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {detailScheme?.ministry} • {detailScheme?.nodal_agency}
                </p>
              </div>

              <button
                onClick={() => setDetailSchemeId(null)}
                className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 border-b border-gray-100 dark:border-zinc-800 overflow-x-auto scrollbar-none text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'benefits', label: 'Benefits' },
                { id: 'eligibility', label: 'Eligibility' },
                { id: 'calculator', label: 'Calculate Benefit' },
                { id: 'docs', label: 'Required Documents' },
                { id: 'steps', label: 'Application Process' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id as any)}
                  className={`py-3.5 px-3 border-b-2 whitespace-nowrap transition-all ${
                    detailTab === t.id
                      ? 'border-primary text-primary font-extrabold'
                      : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 text-sm leading-relaxed">
              {detailLoading ? (
                <div className="py-16 text-center">
                  <RefreshCw className="animate-spin mx-auto text-primary mb-3" size={32} />
                  <p className="text-xs font-bold text-gray-500">Loading scheme guidelines &amp; statutory rules...</p>
                </div>
              ) : detailScheme && (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {detailTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h4>
                        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed font-normal">
                          {detailScheme.description}
                        </p>
                      </div>

                      {detailScheme.target_audience && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Target Beneficiaries</h4>
                          <p className="text-gray-700 dark:text-zinc-300 font-normal">
                            {detailScheme.target_audience}
                          </p>
                        </div>
                      )}

                      {/* Official Source Lineage Box */}
                      <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                          <ShieldCheck className="text-emerald-500" size={16} />
                          <span>Official Source &amp; Legal Lineage</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-zinc-300">
                          <div>
                            <span className="font-semibold text-gray-500">Source:</span> {detailScheme.source_name}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-500">Document:</span> {detailScheme.source_document || 'Official Gazette'}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-500">Last Verified:</span> {detailScheme.last_verified_date}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-500">Scheme Version:</span> {detailScheme.scheme_version}
                          </div>
                        </div>

                        {detailScheme.official_portal_url && (
                          <a
                            href={detailScheme.official_portal_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                          >
                            <span>Open Official Government Portal</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: BENEFITS */}
                  {detailTab === 'benefits' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detailScheme.benefits?.map((b) => (
                          <div key={b.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary">
                                {b.benefit_type.replace('_', ' ')}
                              </span>
                            </div>
                            <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                              {b.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">
                              {b.conditions}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ELIGIBILITY */}
                  {detailTab === 'eligibility' && (
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        {detailScheme.eligibility_rules?.map((rule) => (
                          <div key={rule.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold text-xs text-gray-900 dark:text-white">
                                {rule.rule_description}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Condition: {rule.field} {rule.operator} {JSON.stringify(rule.expected_value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CALCULATE POTENTIAL BENEFIT */}
                  {detailTab === 'calculator' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                        <h4 className="font-bold text-sm text-primary mb-1">Calculate My Potential Benefit</h4>
                        <p className="text-xs text-gray-600 dark:text-zinc-400">
                          Simulate potential subsidy, bank loan sanction and interest subvention for your enterprise outlay.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                            Project Cost (₹)
                          </label>
                          <input
                            type="number"
                            value={calcCost}
                            onChange={(e) => setCalcCost(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-bold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                            Own Contribution / Margin (₹)
                          </label>
                          <input
                            type="number"
                            value={calcOwn}
                            onChange={(e) => setCalcOwn(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-bold outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleRunBenefitCalc}
                        disabled={calcLoading}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
                      >
                        {calcLoading ? <RefreshCw className="animate-spin" size={14} /> : <Calculator size={14} />}
                        <span>Calculate Potential Benefit</span>
                      </button>

                      {/* Calculation Results Card */}
                      {calcResult && (
                        <div className="p-5 bg-white dark:bg-zinc-800/80 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                              <div className="text-[11px] text-gray-500 font-semibold">Potential Subsidy</div>
                              <div className="text-base font-extrabold text-primary mt-0.5">
                                ₹{calcResult.potential_subsidy_amount.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Rate: {calcResult.applicable_subsidy_rate_pct}% ({calcResult.subsidy_timing})
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl">
                              <div className="text-[11px] text-gray-500 font-semibold">Proposed Bank Loan</div>
                              <div className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
                                ₹{calcResult.potential_loan_amount.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Net Debt: ₹{calcResult.net_debt_after_subsidy.toLocaleString()}
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl col-span-2 sm:col-span-1">
                              <div className="text-[11px] text-gray-500 font-semibold">Effective Interest</div>
                              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {calcResult.effective_interest_rate_pct}%
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                Subvention: {calcResult.interest_subvention_pct}% p.a.
                              </div>
                            </div>
                          </div>

                          {/* Step-by-Step Breakdown */}
                          <div>
                            <h5 className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2">Arithmetic Breakdown</h5>
                            <ul className="space-y-1 text-xs text-gray-600 dark:text-zinc-400 list-disc pl-4">
                              {calcResult.calculation_steps.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40">
                            {calcResult.disclaimer}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: REQUIRED DOCUMENTS */}
                  {detailTab === 'docs' && (
                    <div className="space-y-3">
                      {detailScheme.documents?.map((doc) => (
                        <div key={doc.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 flex items-start justify-between gap-4">
                          <div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white">
                              {doc.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 font-normal">
                              {doc.description}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            doc.requirement_level === 'REQUIRED'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {doc.requirement_level}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 6: APPLICATION STEPS */}
                  {detailTab === 'steps' && (
                    <div className="space-y-4">
                      {detailScheme.application_steps?.map((step) => (
                        <div key={step.id} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                            {step.step_number}
                          </div>
                          <div className="flex-1 pb-4 border-b border-gray-100 dark:border-zinc-800/80">
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                              {step.title}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                            {step.portal_url && (
                              <a
                                href={step.portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                              >
                                <span>Visit Application Portal</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Data Version: <span className="font-bold">{detailScheme?.scheme_version}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailSchemeId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                {detailScheme && (
                  <button
                    onClick={() => {
                      setDetailSchemeId(null);
                      handleAddToFinancialPlan(detailScheme.official_id);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <Calculator size={14} />
                    <span>Add to Financial Plan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          6. FLOATING COMPARISON BAR & MODAL
      ------------------------------------------------------------- */}
      {comparedSchemeIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-950 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-zinc-800 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Scale size={16} className="text-primary" />
            <span>{comparedSchemeIds.length} schemes selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenComparison}
              disabled={comparedSchemeIds.length < 2}
              className="px-4 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold disabled:opacity-40"
            >
              Compare Now
            </button>
            <button
              onClick={() => setComparedSchemeIds([])}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="text-primary" size={22} />
                <span>Side-by-Side Scheme Comparison</span>
              </h3>
              <button onClick={() => setCompareModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-x-auto overflow-y-auto flex-1 text-xs">
              {compareLoading ? (
                <div className="py-12 text-center">Loading comparison matrix...</div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-800 text-left font-bold text-gray-500">
                      <th className="p-3 w-40">Parameter</th>
                      {comparisonMatrix.map((s) => (
                        <th key={s.id} className="p-3 min-w-[200px] text-gray-950 dark:text-white font-extrabold text-sm">
                          {s.short_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium text-gray-700 dark:text-zinc-300">
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Level</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.level}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Ministry</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.ministry}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Max Project Cost</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3 font-bold">{s.max_project_cost}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Subsidy Support</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3 text-primary font-bold">{s.subsidy_rate}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Max Subsidy Cap</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.max_subsidy}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Interest Subvention</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.interest_subvention}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Collateral Requirement</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.collateral_free}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Tenure / Moratorium</td>
                      {comparisonMatrix.map(s => <td key={s.id} className="p-3">{s.tenure_months} / {s.moratorium_months}</td>)}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-gray-500">Actions</td>
                      {comparisonMatrix.map(s => (
                        <td key={s.id} className="p-3">
                          <button
                            onClick={() => {
                              setCompareModalOpen(false);
                              handleAddToFinancialPlan(s.official_id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold"
                          >
                            Add to DPR
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          7. SAVED SCHEMES DRAWER
      ------------------------------------------------------------- */}
      {savedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                <Bookmark className="text-primary" size={18} />
                <span>Saved Schemes ({savedSchemes.length})</span>
              </div>
              <button onClick={() => setSavedDrawerOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {savedSchemes.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-xs font-semibold">
                  No schemes bookmarked yet. Click the bookmark icon on any card to save schemes for quick review.
                </div>
              ) : (
                savedSchemes.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                        {item.scheme_details?.name || 'Scheme'}
                      </h4>
                      <button
                        onClick={() => handleToggleSave(item.scheme)}
                        className="text-gray-400 hover:text-rose-500"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => {
                          setSavedDrawerOpen(false);
                          handleOpenDetail(item.scheme_details?.official_id || item.scheme);
                        }}
                        className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setSavedDrawerOpen(false);
                          handleAddToFinancialPlan(item.scheme_details?.official_id || item.scheme);
                        }}
                        className="text-primary hover:underline"
                      >
                        Add to Plan →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          8. MOBILE INSTANT MATCHER DRAWER
      ------------------------------------------------------------- */}
      {matcherMobileOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs lg:hidden">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                <Sparkles className="text-primary" size={16} />
                <span>Instant Scheme Matcher</span>
              </div>
              <button onClick={() => setMatcherMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form onSubmit={(e) => { handleRunMatcher(e); setMatcherMobileOpen(false); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Business Sector</label>
                  <select
                    value={matcherSector}
                    onChange={(e) => setMatcherSector(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none"
                  >
                    <option value="Agriculture & Food">🌾 Agriculture &amp; Food Processing</option>
                    <option value="Dairy & Livestock">🐄 Dairy &amp; Animal Husbandry</option>
                    <option value="Manufacturing">🏭 Manufacturing &amp; Engineering</option>
                    <option value="Rural Retail">🏪 Rural Retail &amp; Trading</option>
                    <option value="Rural Services">🚚 Rural Services &amp; Logistics</option>
                    <option value="Fisheries">🐟 Fisheries &amp; Aquaculture</option>
                    <option value="Renewable Energy">☀️ Renewable &amp; Solar Energy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">State</label>
                  <select
                    value={matcherState}
                    onChange={(e) => setMatcherState(e.target.value)}
                    className="w-full h-11 px-3.5 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none"
                  >
                    {combinedStateList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Project Outlay</label>
                    <span className="text-lg font-black text-primary">₹{(matcherCost / 100000).toFixed(1)} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={5000000}
                    step={50000}
                    value={matcherCost}
                    onChange={(e) => setMatcherCost(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Sparkles size={16} />
                  <span>Match Best Schemes</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
