import { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  Landmark,
  ShieldCheck,
  Zap,
  MapPin,
  Users,
  Building2,
  Mountain,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Helper to format Indian currency in words (Lakhs / Crores)
function formatIndianWords(num: number): string {
  if (isNaN(num) || num <= 0) return '₹ 0';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹ ${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore${cr > 1 ? 's' : ''}`;
  }
  if (num >= 100000) {
    const lakh = num / 100000;
    return `₹ ${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh${lakh > 1 ? 's' : ''}`;
  }
  if (num >= 1000) {
    const th = num / 1000;
    return `₹ ${th % 1 === 0 ? th : th.toFixed(1)} Thousand`;
  }
  return `₹ ${num.toLocaleString('en-IN')}`;
}

const PRESET_AMOUNTS = [
  { label: '₹50K', value: 50000 },
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹2 Lakhs', value: 200000 },
  { label: '₹5 Lakhs', value: 500000 },
  { label: '₹10 Lakhs', value: 1000000 },
  { label: '₹25 Lakhs', value: 2500000 },
];

export default function Step3Margin({ data, onNext, onBack }: any) {
  const { t } = useTranslation();
  const [margin, setMargin] = useState<string>(data.margin_capital?.toString() || '500000');

  // Extract location details from wizard state
  const formattedAddr = data.formatted_address || '';
  const villageName = data.village_name || data.village || '';
  const districtName = data.district_name || data.district || '';
  const stateName = data.state_name || data.state || '';
  const fullLocString = (formattedAddr || `${villageName} ${districtName} ${stateName}`).toLowerCase();

  // Smart Automatic Area Classification
  const defaultAreaType = useMemo(() => {
    const specialStates = [
      'arunachal pradesh', 'assam', 'manipur', 'meghalaya', 'mizoram', 
      'nagaland', 'sikkim', 'tripura', 'jammu and kashmir', 'ladakh', 
      'himachal pradesh', 'uttarakhand', 'andaman'
    ];
    const isSpecial = specialStates.some(s => stateName.toLowerCase().includes(s) || fullLocString.includes(s));
    if (isSpecial) return 'SPECIAL';

    const urbanKeywords = ['city', 'metro', 'urban', 'corporation', 'municipal', 'town', 'mumbai', 'delhi', 'bengaluru', 'hyderabad', 'kolkata', 'chennai', 'ahmedabad city', 'pune city'];
    const isUrban = urbanKeywords.some(u => fullLocString.includes(u)) && !fullLocString.includes('rural') && !fullLocString.includes('village');
    if (isUrban) return 'URBAN';

    return 'RURAL';
  }, [stateName, fullLocString]);

  const [areaType, setAreaType] = useState<'RURAL' | 'URBAN' | 'SPECIAL'>(data.area_type_code || defaultAreaType);
  const [beneficiaryCategory, setBeneficiaryCategory] = useState<'GENERAL' | 'SPECIAL_CAT'>(data.beneficiary_category || 'GENERAL');

  // Sync default if areaType hasn't been explicitly touched yet
  useEffect(() => {
    if (!data.area_type_code) {
      setAreaType(defaultAreaType);
    }
  }, [defaultAreaType, data.area_type_code]);

  const numericValue = useMemo(() => {
    const parsed = parseFloat(margin);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [margin]);

  // Compute dynamic area-dependent subsidy rates & equity requirements per KVIC/MSME guidelines
  const financialRules = useMemo(() => {
    let subsidyPct = 25;
    let equityPct = 10;
    let areaLabel = 'Rural Area';
    let categoryLabel = beneficiaryCategory === 'SPECIAL_CAT' 
      ? 'Special Category (SC/ST/OBC/Women/Minority/Divyang)' 
      : 'General Category';

    if (areaType === 'SPECIAL') {
      areaLabel = 'Hilly / Border / North-East Special Region';
      subsidyPct = 35;
      equityPct = 5;
    } else if (areaType === 'URBAN') {
      areaLabel = 'Urban Municipal Area';
      subsidyPct = beneficiaryCategory === 'SPECIAL_CAT' ? 25 : 15;
      equityPct = beneficiaryCategory === 'SPECIAL_CAT' ? 5 : 10;
    } else {
      // RURAL
      areaLabel = 'Rural Panchayat Area';
      subsidyPct = beneficiaryCategory === 'SPECIAL_CAT' ? 35 : 25;
      equityPct = beneficiaryCategory === 'SPECIAL_CAT' ? 5 : 10;
    }

    const loanPct = Math.max(0, 100 - equityPct - subsidyPct);
    const multiplier = 100 / equityPct; // 10x for 10% equity, 20x for 5% equity

    return {
      areaLabel,
      categoryLabel,
      subsidyPct,
      equityPct,
      loanPct,
      multiplier
    };
  }, [areaType, beneficiaryCategory]);

  // Calculated project capacity and breakdown
  const estimatedProjectCapacity = useMemo(() => {
    return numericValue * financialRules.multiplier;
  }, [numericValue, financialRules.multiplier]);

  const estimatedSubsidy = useMemo(() => {
    return Math.round(estimatedProjectCapacity * (financialRules.subsidyPct / 100));
  }, [estimatedProjectCapacity, financialRules.subsidyPct]);

  const estimatedBankLoan = useMemo(() => {
    return Math.max(0, estimatedProjectCapacity - numericValue - estimatedSubsidy);
  }, [estimatedProjectCapacity, numericValue, estimatedSubsidy]);

  // Dynamic State-Specific Scheme Unlocking based on exact location state
  const stateSchemes = useMemo(() => {
    const st = stateName.toLowerCase() || fullLocString;
    
    if (st.includes('gujarat')) {
      return {
        stateSchemeName: 'Shri Vajpayee Bankable Yojana',
        stateSchemeDesc: 'Up to 35% Gujarat Capital Subsidy',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      };
    }
    if (st.includes('maharashtra')) {
      return {
        stateSchemeName: 'CMEGP Maharashtra',
        stateSchemeDesc: '15% - 35% State Capital Subsidy',
        badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      };
    }
    if (st.includes('tamil nadu')) {
      return {
        stateSchemeName: 'NEEDS Tamil Nadu',
        stateSchemeDesc: '25% Capital Subsidy + 3% Subvention',
        badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
      };
    }
    if (st.includes('uttar pradesh')) {
      return {
        stateSchemeName: 'Mukhyamantri Yuva Swarojgar (UP)',
        stateSchemeDesc: '25% State Margin Subsidy',
        badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      };
    }
    if (st.includes('karnataka')) {
      return {
        stateSchemeName: 'CMEGP Karnataka',
        stateSchemeDesc: '25% - 35% State Subsidized Credit',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
      };
    }
    if (st.includes('rajasthan')) {
      return {
        stateSchemeName: 'Dr. B.R. Ambedkar Swarojgar Yojana',
        stateSchemeDesc: 'Capital & Interest Subvention',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      };
    }
    if (st.includes('bihar')) {
      return {
        stateSchemeName: 'Mukhyamantri Udyami Yojana',
        stateSchemeDesc: '50% Subsidy up to ₹5 Lakhs',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      };
    }
    if (areaType === 'SPECIAL') {
      return {
        stateSchemeName: 'NER & Hilly Area Development Fund',
        stateSchemeDesc: 'Special Regional Transport & Capital Grant',
        badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
      };
    }
    return {
      stateSchemeName: 'State MSME Subsidized Credit Scheme',
      stateSchemeDesc: 'Location & Area-linked State Incentive',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    };
  }, [stateName, fullLocString, areaType]);

  const locationDisplayName = formattedAddr || [villageName, districtName, stateName].filter(Boolean).join(', ') || 'Selected Location';

  const handleInputChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setMargin(clean);
  };

  const handleContinue = () => {
    if (numericValue > 0) {
      onNext({ 
        margin_capital: numericValue,
        area_type_code: areaType,
        area_type: financialRules.areaLabel,
        beneficiary_category: beneficiaryCategory,
        subsidy_pct: financialRules.subsidyPct,
        equity_pct: financialRules.equityPct,
        loan_pct: financialRules.loanPct,
        multiplier: financialRules.multiplier,
        estimated_capacity: estimatedProjectCapacity,
        estimated_subsidy: estimatedSubsidy,
        estimated_loan: estimatedBankLoan
      });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/5 backdrop-blur-md">
          <Sparkles size={14} className="text-emerald-500 animate-pulse" />
          <span>Capital Equity & Scheme Leverage</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {t('wizard_step3_title', 'Available Margin Capital')}
        </h2>
        <p className="text-gray-600 dark:text-zinc-400 text-sm font-medium max-w-md mx-auto">
          {t('wizard_step3_desc', 'Enter your personal equity investment to calculate eligible bank credit and govt subsidies.')}
        </p>

        {/* Location Display & Active Area Classification Pill */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700/80 font-semibold shadow-xs">
            <MapPin size={14} className="text-emerald-500 shrink-0" />
            <span className="font-bold">{locationDisplayName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 font-bold shadow-xs">
            <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
            <span>📍 Location Classification: <strong>{financialRules.areaLabel}</strong> ({financialRules.subsidyPct}% Subsidy)</span>
          </span>
        </div>
      </div>

      {/* Main Glassmorphic Interactive Card */}
      <div className="bg-white dark:bg-zinc-900/90 p-6 sm:p-8 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-emerald-950/20 border border-gray-200/90 dark:border-zinc-800 backdrop-blur-xl transition-all space-y-7">
        
        {/* Area & Social Category Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-zinc-950/70 rounded-2xl border border-gray-200/80 dark:border-zinc-800/90 shadow-inner">
          
          {/* Area Classification Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-gray-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={13} className="text-emerald-500" />
              <span>Location Area Type</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/60 dark:bg-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => setAreaType('RURAL')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  areaType === 'RURAL'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Rural Area
              </button>
              <button
                type="button"
                onClick={() => setAreaType('URBAN')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  areaType === 'URBAN'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Urban Area
              </button>
              <button
                type="button"
                onClick={() => setAreaType('SPECIAL')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  areaType === 'SPECIAL'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Mountain size={12} />
                <span>Special/Hilly</span>
              </button>
            </div>
          </div>

          {/* Social / Beneficiary Category Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-gray-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} className="text-emerald-500" />
              <span>Beneficiary Category</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-200/60 dark:bg-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => setBeneficiaryCategory('GENERAL')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  beneficiaryCategory === 'GENERAL'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                General (10% Equity)
              </button>
              <button
                type="button"
                onClick={() => setBeneficiaryCategory('SPECIAL_CAT')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  beneficiaryCategory === 'SPECIAL_CAT'
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
                title="SC/ST/OBC/Women/Minorities/Divyang (5% Equity & Higher Subsidy)"
              >
                Special (5% Equity)
              </button>
            </div>
          </div>
        </div>

        {/* Currency Input Container */}
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-black text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
              {t('wizard_step3_label', 'YOUR MARGIN (₹)')}
            </label>
            {numericValue > 0 && (
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-300/80 dark:border-emerald-800/80 shadow-xs font-mono">
                {formatIndianWords(numericValue)}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-emerald-600 dark:text-emerald-400 font-black text-2xl sm:text-3xl pointer-events-none select-none">
              ₹
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={numericValue === 0 && margin === '' ? '' : numericValue ? numericValue.toLocaleString('en-IN') : margin}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white bg-gray-50/80 dark:bg-zinc-950/80 border-2 border-gray-200 dark:border-zinc-800 rounded-2xl focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-mono tracking-tight shadow-inner"
              placeholder="e.g. 5,00,000"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mr-1">PRESETS:</span>
            {PRESET_AMOUNTS.map((preset) => {
              const isActive = numericValue === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setMargin(preset.value.toString())}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-500/25 scale-[1.03] ring-2 ring-emerald-500/20'
                      : 'bg-gray-100/80 dark:bg-zinc-800/80 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700/70 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 dark:text-zinc-500">
              <span>Min ₹10,000</span>
              <span>Max ₹50 Lakhs+</span>
            </div>
            <input
              type="range"
              min={10000}
              max={5000000}
              step={10000}
              value={Math.min(5000000, numericValue)}
              onChange={(e) => setMargin(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Financial Leverage Breakdown Panel (Dynamic Area-Dependent) */}
        {numericValue > 0 && (
          <div className="p-6 bg-gradient-to-br from-gray-50 via-emerald-50/40 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 space-y-5 shadow-inner backdrop-blur-md">
            
            {/* Project Capital Capacity Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-extrabold text-sm sm:text-base">
                <TrendingUp size={20} className="text-emerald-500 shrink-0" />
                <span>Estimated Project Capital Capacity ({financialRules.multiplier}x Potential)</span>
              </div>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-950 px-4 py-1.5 rounded-xl border border-emerald-500/30 shadow-md font-mono self-start sm:self-auto">
                {formatIndianWords(estimatedProjectCapacity)}
              </span>
            </div>

            {/* Proportional Progress Bar (Dynamic % per location & category) */}
            <div className="space-y-2.5">
              <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800/90 rounded-full overflow-hidden flex shadow-inner p-0.5 border border-gray-300/40 dark:border-zinc-700/40">
                <div 
                  style={{ width: `${financialRules.equityPct}%` }} 
                  className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-l-full transition-all duration-500 shadow-sm" 
                  title={`Your Equity Margin (${financialRules.equityPct}%)`}
                />
                <div 
                  style={{ width: `${financialRules.subsidyPct}%` }} 
                  className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-500 shadow-sm" 
                  title={`Govt Subsidy (${financialRules.subsidyPct}%)`}
                />
                <div 
                  style={{ width: `${financialRules.loanPct}%` }} 
                  className="bg-sky-500 dark:bg-sky-400 h-full rounded-r-full transition-all duration-500 shadow-sm" 
                  title={`Bank Credit Loan (${financialRules.loanPct}%)`}
                />
              </div>

              {/* Legend Cards (Dynamic % and Amounts) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-white/90 dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-emerald-500/40 transition-all">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0 shadow-xs" />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">YOUR EQUITY ({financialRules.equityPct}%)</p>
                    <p className="font-black text-gray-900 dark:text-white text-sm font-mono">{formatIndianWords(numericValue)}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white/90 dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-amber-500/40 transition-all">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 shadow-xs" />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">EST. GOVT SUBSIDY ({financialRules.subsidyPct}%)</p>
                    <p className="font-black text-gray-900 dark:text-white text-sm font-mono">{formatIndianWords(estimatedSubsidy)}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white/90 dark:bg-zinc-900/80 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-sky-500/40 transition-all">
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-500 dark:bg-sky-400 shrink-0 shadow-xs" />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">BANK CREDIT LOAN ({financialRules.loanPct}%)</p>
                    <p className="font-black text-gray-900 dark:text-white text-sm font-mono">{formatIndianWords(estimatedBankLoan)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlocked Location & State Specific Schemes */}
            <div className="pt-3 border-t border-gray-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Landmark size={15} className="text-emerald-500" />
                  <span>UNLOCKED RURAL CREDIT & SUBSIDY SCHEMES</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  {financialRules.areaLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                {/* PMEGP Scheme Card */}
                <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-xs">PMEGP Scheme</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{financialRules.subsidyPct}% Capital Subsidy</p>
                  </div>
                </div>

                {/* Location / State Specific Subsidy Scheme */}
                <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-purple-500/40 hover:-translate-y-0.5 transition-all">
                  <Landmark size={18} className="text-purple-500 shrink-0" />
                  <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-xs">{stateSchemes.stateSchemeName}</p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">{stateSchemes.stateSchemeDesc}</p>
                  </div>
                </div>

                {/* MUDRA / AIF Financing */}
                <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-xl border border-gray-200 dark:border-zinc-800 flex items-center gap-3 shadow-xs hover:border-amber-500/40 hover:-translate-y-0.5 transition-all">
                  <Zap size={18} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-xs">MUDRA Loan</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Collateral-Free Credit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={onBack} 
          className="px-6 py-3 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/80 font-bold text-sm rounded-2xl transition cursor-pointer"
        >
          {t('wizard_back', 'Back')}
        </button>
        <button 
          onClick={handleContinue}
          disabled={!numericValue || numericValue <= 0}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
        >
          <span>{t('wizard_next', 'Next Step')}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
