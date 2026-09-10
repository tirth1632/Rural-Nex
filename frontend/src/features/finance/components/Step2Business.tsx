import React, { useEffect, useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Database,
  RefreshCw,
  Info,
  Cpu,
  Scissors,
  ShoppingBag,
  Package,
  Wrench,
  Truck,
  Factory,
  ShoppingCart,
  Landmark,
  Milk,
  Egg,
  Utensils,
  HeartPulse,
  GraduationCap,
  Layers,
  Sprout,
  Palette,
  Sun,
  Compass,
  Laptop,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import {
  businessDataService,
  classifyBusinessSector,
  type DatasetBusiness,
  type SectorDefinition,
  type BusinessContextResult
} from '../../../services/businessDataService';

interface Step2Props {
  selectedBusinessCode: string;
  onSelectBusiness: (business: DatasetBusiness) => void;
  onNext: () => void;
  onBack: () => void;
  selectedState?: string;
  selectedDistrict?: string;
  selectedBlock?: string;
  selectedVillage?: string;
}

// Icon helper mapping for sectors & activities
const renderSectorIcon = (iconName: string, className: string = 'text-emerald-500') => {
  const size = 20;
  switch (iconName) {
    case 'Sprout': return <Sprout className={className} size={size} />;
    case 'Milk': return <Milk className={className} size={size} />;
    case 'Egg': return <Egg className={className} size={size} />;
    case 'Utensils': return <Utensils className={className} size={size} />;
    case 'Store': return <Store className={className} size={size} />;
    case 'Wrench': return <Wrench className={className} size={size} />;
    case 'Factory': return <Factory className={className} size={size} />;
    case 'Palette': return <Palette className={className} size={size} />;
    case 'Truck': return <Truck className={className} size={size} />;
    case 'Sun': return <Sun className={className} size={size} />;
    case 'Compass': return <Compass className={className} size={size} />;
    case 'Laptop': return <Laptop className={className} size={size} />;
    case 'Sparkles': return <Sparkles className={className} size={size} />;
    default: return <Briefcase className={className} size={size} />;
  }
};

const renderActivityIcon = (iconName?: string, className: string = 'text-emerald-500') => {
  const size = 18;
  switch (iconName) {
    case 'Milk': return <Milk className={className} size={size} />;
    case 'Egg': return <Egg className={className} size={size} />;
    case 'Utensils': return <Utensils className={className} size={size} />;
    case 'Factory': return <Factory className={className} size={size} />;
    case 'ShoppingCart': return <ShoppingCart className={className} size={size} />;
    case 'Store': return <Store className={className} size={size} />;
    case 'Scissors': return <Scissors className={className} size={size} />;
    case 'ShoppingBag': return <ShoppingBag className={className} size={size} />;
    case 'Package': return <Package className={className} size={size} />;
    case 'Wrench': return <Wrench className={className} size={size} />;
    case 'Cpu': return <Cpu className={className} size={size} />;
    case 'Truck': return <Truck className={className} size={size} />;
    case 'Building': return <Building2 className={className} size={size} />;
    case 'HeartPulse': return <HeartPulse className={className} size={size} />;
    case 'GraduationCap': return <GraduationCap className={className} size={size} />;
    case 'Landmark': return <Landmark className={className} size={size} />;
    case 'Sprout': return <Sprout className={className} size={size} />;
    case 'Palette': return <Palette className={className} size={size} />;
    case 'Sun': return <Sun className={className} size={size} />;
    case 'Compass': return <Compass className={className} size={size} />;
    case 'Laptop': return <Laptop className={className} size={size} />;
    default: return <Briefcase className={className} size={size} />;
  }
};

const getAccentClasses = (color: SectorDefinition['accentColor']) => {
  switch (color) {
    case 'amber':
      return {
        iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        cardBorder: 'hover:border-amber-500/60',
        selectedCard: 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500',
        textAccent: 'text-amber-500',
        badge: 'text-amber-600 dark:text-amber-400'
      };
    case 'teal':
      return {
        iconBg: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        cardBorder: 'hover:border-teal-500/60',
        selectedCard: 'bg-teal-500/10 border-teal-500 ring-1 ring-teal-500',
        textAccent: 'text-teal-500',
        badge: 'text-teal-600 dark:text-teal-400'
      };
    case 'rose':
      return {
        iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        cardBorder: 'hover:border-rose-500/60',
        selectedCard: 'bg-rose-500/10 border-rose-500 ring-1 ring-rose-500',
        textAccent: 'text-rose-500',
        badge: 'text-rose-600 dark:text-rose-400'
      };
    case 'blue':
      return {
        iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        cardBorder: 'hover:border-blue-500/60',
        selectedCard: 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500',
        textAccent: 'text-blue-500',
        badge: 'text-blue-600 dark:text-blue-400'
      };
    case 'purple':
      return {
        iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        cardBorder: 'hover:border-purple-500/60',
        selectedCard: 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500',
        textAccent: 'text-purple-500',
        badge: 'text-purple-600 dark:text-purple-400'
      };
    case 'violet':
      return {
        iconBg: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        cardBorder: 'hover:border-violet-500/60',
        selectedCard: 'bg-violet-500/10 border-violet-500 ring-1 ring-violet-500',
        textAccent: 'text-violet-500',
        badge: 'text-violet-600 dark:text-violet-400'
      };
    case 'pink':
      return {
        iconBg: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
        cardBorder: 'hover:border-pink-500/60',
        selectedCard: 'bg-pink-500/10 border-pink-500 ring-1 ring-pink-500',
        textAccent: 'text-pink-500',
        badge: 'text-pink-600 dark:text-pink-400'
      };
    case 'sky':
      return {
        iconBg: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
        cardBorder: 'hover:border-sky-500/60',
        selectedCard: 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500',
        textAccent: 'text-sky-500',
        badge: 'text-sky-600 dark:text-sky-400'
      };
    case 'cyan':
      return {
        iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        cardBorder: 'hover:border-cyan-500/60',
        selectedCard: 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500',
        textAccent: 'text-cyan-500',
        badge: 'text-cyan-600 dark:text-cyan-400'
      };
    case 'indigo':
      return {
        iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        cardBorder: 'hover:border-indigo-500/60',
        selectedCard: 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500',
        textAccent: 'text-indigo-500',
        badge: 'text-indigo-600 dark:text-indigo-400'
      };
    default:
      return {
        iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        cardBorder: 'hover:border-emerald-500/60',
        selectedCard: 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500',
        textAccent: 'text-emerald-500',
        badge: 'text-emerald-600 dark:text-emerald-400'
      };
  }
};

const ITEMS_PER_PAGE = 12;

export const Step2Business: React.FC<Step2Props> = ({
  selectedBusinessCode,
  onSelectBusiness,
  onNext,
  onBack,
  selectedState,
  selectedDistrict,
  selectedBlock,
  selectedVillage
}) => {
  const [sectors, setSectors] = useState<SectorDefinition[]>([]);
  const [businesses, setBusinesses] = useState<DatasetBusiness[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View state: 'sectors' (Tier 1) or 'activities' (Tier 2)
  const [viewMode, setViewMode] = useState<'sectors' | 'activities'>('sectors');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedBiz, setSelectedBiz] = useState<DatasetBusiness | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showInspectionPanel, setShowInspectionPanel] = useState<boolean>(false);

  // Custom Business inputs
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('Custom Rural Enterprise');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load dataset master & sectors
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const mainSecs = await businessDataService.getMainSectors();
      setSectors(mainSecs);

      const bList = await businessDataService.getBusinesses();
      setBusinesses(bList);

      if (selectedBusinessCode) {
        const found = bList.find(
          b => b.code.toLowerCase() === selectedBusinessCode.toLowerCase() || String(b.id) === selectedBusinessCode
        );
        if (found) {
          setSelectedBiz(found);
          const secId = classifyBusinessSector(found);
          setSelectedSectorId(secId);
          setViewMode('activities');
        } else if (bList.length > 0) {
          setSelectedBiz(bList[0]);
          onSelectBusiness(bList[0]);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load business dataset records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered businesses based on viewMode, selectedSectorId, and debouncedQuery
  const activeSectorDef = useMemo(() => {
    if (!selectedSectorId) return null;
    return sectors.find(s => s.id === selectedSectorId) || null;
  }, [sectors, selectedSectorId]);

  const filteredBusinesses = useMemo(() => {
    const query = debouncedQuery.toLowerCase().trim();

    return businesses.filter(b => {
      // If a specific sector is picked, filter by sector
      if (selectedSectorId && viewMode === 'activities') {
        const itemSector = classifyBusinessSector(b);
        if (itemSector !== selectedSectorId) return false;
      }

      if (!query) return true;

      const nameMatch = b.name.toLowerCase().includes(query);
      const catMatch = b.category.toLowerCase().includes(query);
      const codeMatch = b.code.toLowerCase().includes(query);
      const descMatch = (b.description || '').toLowerCase().includes(query);
      const srcMatch = (b.source_dataset || '').toLowerCase().includes(query);

      return nameMatch || catMatch || codeMatch || descMatch || srcMatch;
    });
  }, [businesses, selectedSectorId, viewMode, debouncedQuery]);

  // Handle Sector Click (Tier 1 -> Tier 2)
  const handleSelectSector = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setViewMode('activities');
    setCurrentPage(1);

    // If Custom business, create or select custom business object
    if (sectorId === 'other_custom') {
      const customBiz: DatasetBusiness = {
        id: 'custom_001',
        code: 'custom_enterprise',
        name: customName || 'Custom Rural Enterprise',
        category: customCategory || 'Custom Rural Enterprise',
        sector: 'OTHER',
        icon: 'Sparkles',
        unit_of_measurement: 'Units / Services',
        description: 'User-specified micro-enterprise activity.',
        source_dataset: 'User Defined Custom Venture',
        national_rural_establishments: 1
      };
      setSelectedBiz(customBiz);
      onSelectBusiness(customBiz);
    } else {
      // Find first activity in sector to auto-highlight
      const sectorActivities = businesses.filter(b => classifyBusinessSector(b) === sectorId);
      if (sectorActivities.length > 0) {
        setSelectedBiz(sectorActivities[0]);
        onSelectBusiness(sectorActivities[0]);
      }
    }
  };

  const handleSelectActivity = (biz: DatasetBusiness) => {
    setSelectedBiz(biz);
    onSelectBusiness(biz);
  };

  const handleCustomSubmit = () => {
    if (!customName.trim()) return;
    const customBiz: DatasetBusiness = {
      id: `custom_${Date.now()}`,
      code: `custom_${customName.toLowerCase().replace(/\s+/g, '_')}`,
      name: customName.trim(),
      category: customCategory.trim() || 'Custom Enterprise',
      sector: 'OTHER',
      icon: 'Sparkles',
      unit_of_measurement: 'Units / Services',
      description: `Custom specified rural enterprise: ${customName.trim()}.`,
      source_dataset: 'User Defined Specification',
      national_rural_establishments: 1
    };
    setSelectedBiz(customBiz);
    onSelectBusiness(customBiz);
  };

  // Pagination Slicing
  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE));
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBusinesses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBusinesses, currentPage]);

  // Compute dataset context
  const contextResult: BusinessContextResult | null = useMemo(() => {
    if (!selectedBiz) return null;
    return businessDataService.getBusinessContext(selectedBiz, {
      state: selectedState,
      district: selectedDistrict,
      block: selectedBlock,
      village: selectedVillage
    });
  }, [selectedBiz, selectedState, selectedDistrict, selectedBlock, selectedVillage]);

  // Location breadcrumb
  const locationBreadcrumb = [selectedState, selectedDistrict, selectedBlock, selectedVillage]
    .filter(Boolean)
    .join(' → ');

  return (
    <div className="space-y-6">
      {/* Header & Location Connection */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-emerald-500" size={22} />
              Step 2: Proposed Business & Enterprise Selection
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Select your primary business sector first, then choose your specific sub-branch enterprise activity from official GoI datasets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowInspectionPanel(!showInspectionPanel)}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Database size={13} className="text-emerald-500" />
            Data Inspection Status
          </button>
        </div>

        {/* Selected Location Connection Bar */}
        <div className="flex items-center justify-between gap-2 text-xs bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-emerald-500" />
            <span>Project Location:</span>
            <strong className="font-bold text-emerald-900 dark:text-emerald-200">
              {locationBreadcrumb || 'India (Default National Scope)'}
            </strong>
          </div>

          {/* Breadcrumb Navigation indicator */}
          {viewMode === 'activities' && activeSectorDef && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold">
              <span
                onClick={() => setViewMode('sectors')}
                className="text-gray-500 dark:text-zinc-400 hover:text-emerald-500 cursor-pointer underline underline-offset-2"
              >
                Sectors
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-emerald-600 dark:text-emerald-400">{activeSectorDef.title}</span>
            </div>
          )}
        </div>

        {/* Collapsible Inspection Panel */}
        {showInspectionPanel && (
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex justify-between items-center font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Business Datasets Pipeline Status
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Data Deduplicated: YES
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 dark:text-zinc-400">
              <div>Total Unique Activities: <strong className="text-gray-900 dark:text-white">{businesses.length}</strong></div>
              <div>Main Sectors: <strong className="text-gray-900 dark:text-white">{sectors.length}</strong></div>
              <div>Active Sector: <strong className="text-emerald-600 dark:text-emerald-400">{activeSectorDef ? activeSectorDef.title : 'All Sectors'}</strong></div>
              <div>Filtered Sub-Branches: <strong className="text-gray-900 dark:text-white">{filteredBusinesses.length}</strong></div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 italic">
              Data Sources: GoI ASUSE, 20th Livestock Census, PACS Infrastructure & Micro-Enterprise Catalog.
            </p>
          </div>
        )}
      </div>

      {/* Global / Sector Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              // Switch to sub-branch view if user types search query
              if (e.target.value.trim() && viewMode === 'sectors') {
                setViewMode('activities');
              }
            }}
            placeholder={
              viewMode === 'activities' && activeSectorDef
                ? `Search inside ${activeSectorDef.title} (e.g. Grain mill, Milk chilling, Solar pump)...`
                : "Search business activities across all sectors (e.g. Dairy, Solar, Flour Mill, Kirana)..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 font-bold px-1.5 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {viewMode === 'activities' && (
          <button
            type="button"
            onClick={() => {
              setViewMode('sectors');
              setSelectedSectorId(null);
              setSearchQuery('');
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ArrowLeft size={14} className="text-emerald-500" />
            ← Back to All Sectors
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400 dark:text-zinc-500 bg-white dark:bg-[#0c0d10] rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-3">
          <RefreshCw size={24} className="mx-auto text-emerald-500 animate-spin" />
          <p className="font-medium">Loading enterprise dataset records from official GOI sources...</p>
        </div>
      ) : error ? (
        <div className="py-12 px-6 text-center text-xs text-red-500 dark:text-red-400 bg-white dark:bg-[#0c0d10] rounded-2xl border border-red-200 dark:border-red-900/50 space-y-3">
          <AlertCircle size={24} className="mx-auto text-red-500" />
          <p className="font-bold">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 cursor-pointer shadow-xs"
          >
            Retry Loading Dataset
          </button>
        </div>
      ) : viewMode === 'sectors' && !debouncedQuery ? (
        /* TIER 1: MAIN SECTOR CARDS GRID */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              Select Main Business Sector / Branch ({sectors.length} Sectors)
            </h3>
            <span className="text-xs text-gray-400 font-medium">Click a sector to view its sub-branches</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map(sec => {
              const styles = getAccentClasses(sec.accentColor);
              const isSelected = selectedSectorId === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSector(sec.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? styles.selectedCard
                      : `bg-white dark:bg-[#0c0d10] border-gray-200 dark:border-zinc-800 ${styles.cardBorder} hover:shadow-md hover:-translate-y-0.5`
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 text-emerald-500">
                      <CheckCircle2 size={18} />
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Sector Icon Box */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${styles.iconBg} transition-transform group-hover:scale-105`}>
                      {renderSectorIcon(sec.icon)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {sec.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>
                  </div>

                  {/* Sub-branch Badge Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-900 flex items-center justify-between text-[11px] font-bold">
                    <span className={styles.badge}>
                      {sec.countBadge || 'Sub-Branches Available'}
                    </span>
                    <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
                      ➔
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIER 2: SUB-BRANCH ACTIVITY SELECTION & CONTEXT DRAWER */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sub-Branches List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header for Active Sector */}
            {activeSectorDef && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${getAccentClasses(activeSectorDef.accentColor).iconBg}`}>
                    {renderSectorIcon(activeSectorDef.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {activeSectorDef.title} Sub-Branches
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                      Showing {filteredBusinesses.length} enterprise activity options in this sector.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {filteredBusinesses.length} Options
                </span>
              </div>
            )}

            {/* Custom Business Input Form if "Other / Custom Business" is selected */}
            {selectedSectorId === 'other_custom' && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  <PlusCircle size={16} className="text-emerald-500" />
                  Define Custom Venture Specification
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                      Business Activity Name *
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="e.g. Mushroom Cultivation & Processing Unit..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 block mb-1">
                      Category Label
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="e.g. Agri-tech / Horticulture"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  disabled={!customName.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Save & Select Custom Business
                </button>
              </div>
            )}

            {filteredBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[340px] pr-1">
                  {paginatedBusinesses.map(biz => {
                    const isSelected = selectedBiz?.code === biz.code || selectedBiz?.id === biz.id;

                    return (
                      <button
                        key={biz.code || biz.id}
                        type="button"
                        onClick={() => handleSelectActivity(biz)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                            : 'bg-white dark:bg-[#0c0d10] border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-xs'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3.5 right-3.5 text-emerald-500">
                            <CheckCircle2 size={18} />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-900">
                              {renderActivityIcon(biz.icon)}
                            </div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800 truncate max-w-[180px]">
                              {biz.category}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 pr-6">
                            {biz.name}
                          </h4>

                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {biz.description || `Registered activity under ${biz.category}.`}
                          </p>
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-gray-100 dark:border-zinc-900 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-gray-400 dark:text-zinc-500">
                            Code: <strong className="text-gray-700 dark:text-zinc-300">{biz.code}</strong>
                          </span>

                          <span className="text-gray-500 dark:text-zinc-400">
                            UOM: <strong className="text-gray-800 dark:text-zinc-200">{biz.unit_of_measurement}</strong>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 px-1 text-xs">
                    <span className="text-gray-500 dark:text-zinc-400 font-medium">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredBusinesses.length)} of{' '}
                      <strong>{filteredBusinesses.length}</strong> activities
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span className="font-bold text-gray-800 dark:text-zinc-200">
                        {currentPage} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center text-xs text-gray-400 dark:text-zinc-500 bg-white dark:bg-[#0c0d10] rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
                <AlertCircle size={22} className="mx-auto text-gray-400" />
                <p className="font-bold text-gray-700 dark:text-zinc-300">
                  No sub-branch activities found matching your criteria.
                </p>
                <p className="text-[11px] text-gray-400">
                  Try clearing search filters or choosing "Other / Custom Business" to define a custom enterprise.
                </p>
              </div>
            )}
          </div>

          {/* Selected Enterprise Dataset Context Panel */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2.5">
                <Building2 size={16} className="text-emerald-500" />
                Selected Enterprise Dataset Context
              </h3>

              {selectedBiz && contextResult ? (
                <div className="space-y-4">
                  {/* Selected Business Overview */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {selectedBiz.category}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800">
                        {selectedBiz.code}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      {renderActivityIcon(selectedBiz.icon)}
                      {selectedBiz.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {selectedBiz.description || `Official dataset activity under ${selectedBiz.category}.`}
                    </p>
                  </div>

                  {/* Attribute Cards */}
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900/80 border border-gray-100 dark:border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Source Dataset</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200">{selectedBiz.source_dataset || 'Official GoI Dataset'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Unit of Measurement</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200">{selectedBiz.unit_of_measurement}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Geographic Scope</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {contextResult.geographicCoverage}
                      </span>
                    </div>
                  </div>

                  {/* Programmatic Dataset Availability Breakdown */}
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={13} className="text-emerald-500" />
                      Dataset Context Status
                    </h5>

                    <div className="space-y-1.5 text-xs">
                      {Object.entries(contextResult.datasetAvailability).map(([key, item]) => {
                        const isAvail = item.status === 'Available';
                        const isNotRel = item.status === 'Not Relevant';

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/60 text-[11px]"
                          >
                            <span className="capitalize font-medium text-gray-700 dark:text-zinc-300">
                              {key.replace('_', ' ')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                isAvail
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : isNotRel
                                  ? 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Market Intelligence Fact Box */}
                  <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Info size={14} className="text-blue-500 shrink-0" />
                      Market & Ecosystem Intelligence
                    </div>
                    <p className="leading-relaxed text-[10px] text-blue-800/80 dark:text-blue-300/80">
                      {contextResult.marketIntelligence.establishmentDensityNote}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-zinc-400 italic pt-1 border-t border-blue-500/10">
                      Note: Existing establishment metrics serve as local competition context — NOT as your proposed project instance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-zinc-500 space-y-2">
                  <Info size={20} className="mx-auto text-gray-400" />
                  <p>Select a business activity to view available dataset attributes and location context.</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              Selection will persist into Step 3 (Project Cost Builder).
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => {
            if (viewMode === 'activities') {
              setViewMode('sectors');
              setSelectedSectorId(null);
            } else {
              onBack();
            }
          }}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        >
          {viewMode === 'activities' ? '← Back to All Sectors' : '← Back to Promoter Profile'}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedBiz}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          Proceed to Project Cost Builder ➔
        </button>
      </div>
    </div>
  );
};
