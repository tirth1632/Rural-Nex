import { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  Users, 
  Clock, 
  MapPin, 
  Package, 
  ChevronRight, 
  CheckCircle2,
  Briefcase,
  Store,
  Layers,
  Settings2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AIModelModal from '../chat/AIModelModal';

const SCALE_OPTIONS = [
  {
    id: 'Micro',
    title: 'Micro Venture',
    desc: 'Self-employed or 1-2 operators',
    icon: Store,
    badge: 'Low Capital Outlay'
  },
  {
    id: 'Small',
    title: 'Small Enterprise',
    desc: '2 - 5 dedicated workers',
    icon: Briefcase,
    badge: 'Standard Rural Unit'
  },
  {
    id: 'Medium',
    title: 'Medium Unit',
    desc: '5+ workers & processing machinery',
    icon: Layers,
    badge: 'Commercial Outlay'
  }
];

const EXPERIENCE_PRESETS = [
  { label: 'Fresh Start (0 Yrs)', value: 0 },
  { label: '1 - 3 Years', value: 2 },
  { label: '3 - 5 Years', value: 4 },
  { label: '5+ Years', value: 6 },
];

export default function Step6Details({ data, onNext, onBack }: any) {
  const { t } = useTranslation();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [details, setDetails] = useState({
    expected_scale: data.expected_scale || 'Small',
    available_shop: data.available_shop || false,
    experience_years: data.experience_years || 0,
    number_of_workers: data.number_of_workers || 1,
    target_customers: data.target_customers || 'Local & District Market',
    products: data.products || ''
  });

  const handleScaleChange = (scaleId: string) => {
    let defaultWorkers = details.number_of_workers;
    if (scaleId === 'Micro') {
      if (details.number_of_workers > 2) defaultWorkers = 1;
    } else if (scaleId === 'Small') {
      if (details.number_of_workers < 2 || details.number_of_workers > 5) defaultWorkers = 3;
    } else if (scaleId === 'Medium') {
      if (details.number_of_workers < 6) defaultWorkers = 6;
    }

    setDetails(prev => ({
      ...prev,
      expected_scale: scaleId,
      number_of_workers: defaultWorkers
    }));
  };

  const handleWorkersChange = (newCount: number) => {
    const count = Math.max(1, newCount);
    let autoScale = details.expected_scale;
    if (count <= 2) {
      autoScale = 'Micro';
    } else if (count <= 5) {
      autoScale = 'Small';
    } else {
      autoScale = 'Medium';
    }

    setDetails(prev => ({
      ...prev,
      number_of_workers: count,
      expected_scale: autoScale
    }));
  };

  const handleChange = (field: string, value: any) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    onNext(details);
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 relative">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-emerald-600" />
            <span>AI Risk & Feasibility Calibration</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
            title="Choose AI Model or Add API Keys"
          >
            <Settings2 size={13} />
            <span>AI Models & Keys</span>
          </button>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Operational Details <span className="text-gray-400 font-normal text-lg">(Optional)</span>
        </h2>
        <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">
          Help our AI engine refine your ROI timeline, operational risk index, and scheme match score.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-200/90 space-y-6">
        
        {/* 1. Proposed Scale Card Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={15} className="text-emerald-600" />
            <span>Proposed Enterprise Scale</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCALE_OPTIONS.map((opt) => {
              const isSelected = details.expected_scale === opt.id;
              const IconComp = opt.icon;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleScaleChange(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-gray-200/90 bg-gray-50/40 hover:border-emerald-300 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200/80 text-gray-600'
                      }`}>
                        <IconComp size={16} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-emerald-600 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{opt.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <span className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded inline-block self-start ${
                    isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Experience & Workforce Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
          {/* Domain Experience */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} className="text-emerald-600" />
              <span>Prior Domain Experience</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_PRESETS.map((preset) => {
                const isActive = details.experience_years === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleChange('experience_years', preset.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expected Workforce Count */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-emerald-600" />
              <span>Team / Worker Count</span>
            </label>
            <div className="flex items-center gap-3 bg-gray-50/70 border border-gray-200/90 rounded-xl p-1.5 max-w-[180px]">
              <button
                type="button"
                onClick={() => handleWorkersChange(details.number_of_workers - 1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm cursor-pointer"
              >
                -
              </button>
              <span className="font-extrabold text-gray-900 text-sm flex-1 text-center font-mono">
                {details.number_of_workers} {details.number_of_workers === 1 ? 'Person' : 'People'}
              </span>
              <button
                type="button"
                onClick={() => handleWorkersChange(details.number_of_workers + 1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center text-sm cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 3. Shop & Land Asset Switch Card */}
        <div 
          onClick={() => handleChange('available_shop', !details.available_shop)}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
            details.available_shop
              ? 'border-emerald-600 bg-emerald-50/60 shadow-2xs'
              : 'border-gray-200/90 bg-gray-50/30 hover:border-emerald-300'
          }`}
        >
          <div className={`p-2 rounded-lg mt-0.5 transition-colors ${
            details.available_shop ? 'bg-emerald-600 text-white' : 'bg-gray-200/80 text-gray-500'
          }`}>
            <MapPin size={18} />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-gray-900 text-sm">
                I already have a shop premises or agricultural land available
              </h4>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                details.available_shop ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                {details.available_shop && <CheckCircle2 size={14} strokeWidth={2.5} />}
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Reduces upfront capital setup costs and shortens financial break-even projections by ~15% - 25%.
            </p>
          </div>
        </div>

        {/* 4. Products & Target Market */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
          {/* Products / Services */}
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={15} className="text-emerald-600" />
              <span>Specific Key Products / Services Offered</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Packaged Whole Wheat Flour, Multigrain Atta, Bran Feed..."
              value={details.products}
              onChange={(e) => handleChange('products', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

      </div>

      {/* Navigation & Action Footer */}
      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition cursor-pointer"
        >
          {t('wizard_back', 'Back')}
        </button>
        <button 
          onClick={handleContinue}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2.5 group"
        >
          <Sparkles size={16} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span>Run Full AI Analysis</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* AI Model & Key Manager Modal */}
      <AIModelModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />
    </div>
  );
}

