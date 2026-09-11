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
        stateSchemeDesc: 'Up to 35% Gujarat State Capital Subsidy',
        color: 'text-amber-700 bg-amber-50 border-amber-200'
      };
    }
    if (st.includes('maharashtra')) {
      return {
        stateSchemeName: 'CMEGP Maharashtra',
        stateSchemeDesc: '15% - 35% State Capital Subsidy',
        color: 'text-orange-700 bg-orange-50 border-orange-200'
      };
    }
    if (st.includes('tamil nadu')) {
      return {
        stateSchemeName: 'NEEDS Tamil Nadu',
        stateSchemeDesc: '25% Capital Subsidy + 3% Interest Subvention',
        color: 'text-purple-700 bg-purple-50 border-purple-200'
      };
    }
    if (st.includes('uttar pradesh')) {
      return {
        stateSchemeName: 'Mukhyamantri Yuva Swarojgar (UP)',
        stateSchemeDesc: '25% State Margin Money Subsidy',
        color: 'text-blue-700 bg-blue-50 border-blue-200'
      };
    }
    if (st.includes('karnataka')) {
      return {
        stateSchemeName: 'CMEGP Karnataka',
        stateSchemeDesc: '25% - 35% State Enterprise Subsidy',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
      };
    }
    if (st.includes('rajasthan')) {
      return {
        stateSchemeName: 'Dr. B.R. Ambedkar Swarojgar Yojana',
        stateSchemeDesc: 'Capital & Interest Subvention',
        color: 'text-rose-700 bg-rose-50 border-rose-200'
      };
    }
    if (st.includes('bihar')) {
      return {
        stateSchemeName: 'Mukhyamantri Udyami Yojana',
        stateSchemeDesc: '50% Subsidy up to ₹5 Lakhs',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }
    if (areaType === 'SPECIAL') {
      return {
        stateSchemeName: 'NER & Hilly Area Development Subvention',
        stateSchemeDesc: 'Special Regional Transport & Capital Grant',
        color: 'text-teal-700 bg-teal-50 border-teal-200'
      };
    }
    return {
      stateSchemeName: 'State MSME Subsidized Credit Scheme',
      stateSchemeDesc: 'Location & Area-linked State Incentive',
      color: 'text-teal-700 bg-teal-50 border-teal-200'
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
    <div className="space-y-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-0.5">
          <Sparkles size={14} className="text-emerald-600" />
          <span>Dynamic Area-Dependent Credit Model</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('wizard_step3_title', 'Available Margin Capital')}
        </h2>
        <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">
          {t('wizard_step3_desc', 'Enter your personal equity investment to calculate eligible bank credit and govt subsidies.')}
        </p>

        {/* Location Display & Active Area Classification Pill */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 font-medium">
            <MapPin size={13} className="text-emerald-600 shrink-0" />
            <strong className="text-gray-900 font-bold">{locationDisplayName}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 border border-emerald-200 font-bold shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-700" />
            <span>{financialRules.areaLabel} ({financialRules.subsidyPct}% Capital Subsidy)</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-200/90 space-y-6">
        
        {/* Area & Social Category Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/80">
          
          {/* Area Classification Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 size={13} className="text-emerald-600" />
              <span>Location Classification</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setAreaType('RURAL')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                  areaType === 'RURAL'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                Rural Area
              </button>
              <button
                type="button"
                onClick={() => setAreaType('URBAN')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                  areaType === 'URBAN'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                Urban Area
              </button>
              <button
                type="button"
                onClick={() => setAreaType('SPECIAL')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border text-center flex items-center justify-center gap-1 ${
                  areaType === 'SPECIAL'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <Mountain size={11} />
                <span>Special/Hilly</span>
              </button>
            </div>
          </div>

          {/* Social / Beneficiary Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1">
              <Users size={13} className="text-emerald-600" />
              <span>Beneficiary Category</span>
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setBeneficiaryCategory('GENERAL')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                  beneficiaryCategory === 'GENERAL'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                General (10% Equity)
              </button>
              <button
                type="button"
                onClick={() => setBeneficiaryCategory('SPECIAL_CAT')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border text-center ${
                  beneficiaryCategory === 'SPECIAL_CAT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
                title="SC/ST/OBC/Women/Minorities/Divyang (5% Equity & Higher Subsidy)"
              >
                Special (5% Equity)
              </button>
            </div>
          </div>
        </div>

        {/* Currency Input Container */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              {t('wizard_step3_label', 'Your Margin Equity (₹)')}
            </label>
            {numericValue > 0 && (
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                {formatIndianWords(numericValue)}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-emerald-600 font-black text-2xl pointer-events-none select-none">
              ₹
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={numericValue === 0 && margin === '' ? '' : numericValue ? numericValue.toLocaleString('en-IN') : margin}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 text-2xl sm:text-3xl font-extrabold text-gray-900 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-mono"
              placeholder="e.g. 5,00,000"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Presets:</span>
            {PRESET_AMOUNTS.map((preset) => {
              const isActive = numericValue === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setMargin(preset.value.toString())}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-[1.02] ring-2 ring-emerald-600/20'
                      : 'bg-gray-50 text-gray-700 border-gray-200/90 hover:border-emerald-300 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-gray-400">
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Financial Leverage Breakdown Panel (Dynamic Area-Dependent) */}
        {numericValue > 0 && (
          <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-zinc-900/90 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
              <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-extrabold text-sm">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Estimated Project Capital Capacity ({financialRules.multiplier}x Potential)</span>
              </div>
              <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs self-start sm:self-auto">
                {formatIndianWords(estimatedProjectCapacity)}
              </span>
            </div>

            {/* Proportional Progress Bar (Dynamic % per location & category) */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-200/80 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  style={{ width: `${financialRules.equityPct}%` }} 
                  className="bg-emerald-600 h-full transition-all duration-300" 
                  title={`Your Equity Margin (${financialRules.equityPct}%)`}
                />
                <div 
                  style={{ width: `${financialRules.subsidyPct}%` }} 
                  className="bg-amber-500 h-full transition-all duration-300" 
                  title={`Govt Subsidy (${financialRules.subsidyPct}%)`}
                />
                <div 
                  style={{ width: `${financialRules.loanPct}%` }} 
                  className="bg-sky-600 h-full transition-all duration-300" 
                  title={`Bank Credit Loan (${financialRules.loanPct}%)`}
                />
              </div>

              {/* Legend Cards (Dynamic % and Amounts) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">YOUR EQUITY ({financialRules.equityPct}%)</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(numericValue)}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">EST. GOVT SUBSIDY ({financialRules.subsidyPct}%)</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(estimatedSubsidy)}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">BANK CREDIT LOAN ({financialRules.loanPct}%)</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(estimatedBankLoan)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unlocked Location & State Specific Schemes */}
            <div className="pt-2 border-t border-emerald-100/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark size={14} className="text-emerald-700" />
                  <span>UNLOCKED CREDIT & SUBSIDY SCHEMES FOR THIS LOCATION</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {financialRules.areaLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                {/* PMEGP Scheme Card with Exact Area Subsidy Rate */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">PMEGP Scheme</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">{financialRules.subsidyPct}% Capital Subsidy ({financialRules.areaLabel})</p>
                  </div>
                </div>

                {/* Location / State Specific Subsidy Scheme */}
                <div className={`p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs`}>
                  <Landmark size={16} className="text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{stateSchemes.stateSchemeName}</p>
                    <p className="text-[10px] text-purple-700 font-semibold">{stateSchemes.stateSchemeDesc}</p>
                  </div>
                </div>

                {/* MUDRA / AIF Financing */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2.5 shadow-2xs">
                  <Zap size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">MUDRA / NABARD AIF</p>
                    <p className="text-[10px] text-amber-700 font-semibold">Collateral-Free + 3% Subvention</p>
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
          className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition cursor-pointer"
        >
          {t('wizard_back', 'Back')}
        </button>
        <button 
          onClick={handleContinue}
          disabled={!numericValue || numericValue <= 0}
          className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>{t('wizard_next', 'Next Step')}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
