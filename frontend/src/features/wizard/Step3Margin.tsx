import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  Landmark,
  ShieldCheck,
  Zap
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

  const numericValue = useMemo(() => {
    const parsed = parseFloat(margin);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [margin]);

  // Financial leverage metrics
  const estimatedProjectCapacity = useMemo(() => numericValue * 10, [numericValue]);
  const estimatedSubsidy = useMemo(() => Math.round(estimatedProjectCapacity * 0.25), [estimatedProjectCapacity]);
  const estimatedBankLoan = useMemo(() => Math.max(0, estimatedProjectCapacity - numericValue - estimatedSubsidy), [estimatedProjectCapacity, numericValue, estimatedSubsidy]);

  const handleInputChange = (val: string) => {
    // Sanitize input to digits only
    const clean = val.replace(/[^0-9]/g, '');
    setMargin(clean);
  };

  const handleContinue = () => {
    if (numericValue > 0) {
      onNext({ margin_capital: numericValue });
    }
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-0.5">
          <Sparkles size={14} className="text-emerald-600" />
          <span>Capital Equity & Scheme Leverage</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {t('wizard_step3_title', 'Available Margin Capital')}
        </h2>
        <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">
          {t('wizard_step3_desc', 'Enter your personal equity investment to calculate eligible bank credit and govt subsidies.')}
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-200/90 space-y-6">
        
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

        {/* Financial Leverage Breakdown Panel */}
        {numericValue > 0 && (
          <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-zinc-900/90 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
              <div className="flex items-center gap-2 text-emerald-950 dark:text-emerald-200 font-extrabold text-sm">
                <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Estimated Project Capital Capacity (10x Potential)</span>
              </div>
              <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs self-start sm:self-auto">
                {formatIndianWords(estimatedProjectCapacity)}
              </span>
            </div>

            {/* Proportional Progress Bar */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-200/80 rounded-full overflow-hidden flex shadow-inner">
                <div 
                  style={{ width: '10%' }} 
                  className="bg-emerald-600 h-full transition-all duration-300" 
                  title="Your Equity Margin (10%)"
                />
                <div 
                  style={{ width: '25%' }} 
                  className="bg-amber-500 h-full transition-all duration-300" 
                  title="Govt Subsidy (25%)"
                />
                <div 
                  style={{ width: '65%' }} 
                  className="bg-sky-600 h-full transition-all duration-300" 
                  title="Bank Credit Loan (65%)"
                />
              </div>

              {/* Legend Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Your Equity</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(numericValue)}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Est. Govt Subsidy (25%)</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(estimatedSubsidy)}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center gap-2.5 shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full bg-sky-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bank Credit Loan</p>
                    <p className="font-extrabold text-gray-900 text-xs">{formatIndianWords(estimatedBankLoan)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligible Schemes Breakdown */}
            <div className="pt-2 border-t border-emerald-100/80 space-y-2">
              <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark size={14} className="text-emerald-700" />
                <span>Unlocked Rural Credit & Subsidy Schemes</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">PMEGP Scheme</p>
                    <p className="text-[10px] text-gray-500">15% - 35% Capital Subsidy</p>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2">
                  <Zap size={15} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">MUDRA Loan</p>
                    <p className="text-[10px] text-gray-500">Collateral-Free Credit</p>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-emerald-200/80 flex items-center gap-2">
                  <Landmark size={15} className="text-sky-600 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">NABARD / AIF</p>
                    <p className="text-[10px] text-gray-500">3% Interest Subvention</p>
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


