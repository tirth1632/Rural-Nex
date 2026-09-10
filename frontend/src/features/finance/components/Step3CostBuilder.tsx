import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
  PieChart,
  ShieldCheck,
  Building2,
  Wrench,
  Truck,
  Landmark,
  Package,
  Coins,
  ChevronDown
} from 'lucide-react';
import {
  calculateCapExTotals,
  calculateLineItemTotal,
  calculateCategorySubtotal,
  CAPEX_CATEGORY_KEYS,
  WORKING_CAPITAL_CATEGORY_KEYS,
  type CapExItem
} from '../services/financialEngine';
import { businessDataService } from '../../../services/businessDataService';

const CAPEX_CATEGORIES: Record<string, { label: string; icon: string }> = {
  land_site: { label: 'A. Land & Site Development', icon: 'Landmark' },
  building_civil: { label: 'B. Building & Civil Works', icon: 'Building2' },
  plant_machinery: { label: 'C. Plant, Machinery & Equipment', icon: 'Wrench' },
  vehicles_trans: { label: 'D. Vehicles & Transportation', icon: 'Truck' },
  furniture_office: { label: 'E. Furniture & Office Equipment', icon: 'Package' },
  pre_operative: { label: 'F. Pre-operative & Licensing Expenses', icon: 'Coins' }
};

const WORKING_CAPITAL_CATEGORIES: Record<string, { label: string; icon: string }> = {
  raw_materials: { label: 'G. Initial Inventory & Raw Materials', icon: 'Package' },
  working_capital: { label: 'H. Initial Working Capital Reserve', icon: 'Coins' },
  other_costs: { label: 'I. Other Project Costs', icon: 'Layers' }
};

const ALL_CATEGORIES = { ...CAPEX_CATEGORIES, ...WORKING_CAPITAL_CATEGORIES };

// Category-Specific Unit Options
const CATEGORY_UNITS: Record<string, string[]> = {
  land_site: ['sq.ft', 'sq.m', 'acres', 'bigha', 'hectares', 'plots', 'units'],
  building_civil: ['sq.ft', 'sq.m', 'sheds', 'units', 'rooms', 'structures'],
  plant_machinery: ['units', 'sets', 'machines', 'lines', 'hp', 'kw', 'capacity (TPD)', 'animals'],
  vehicles_trans: ['vehicles', 'trucks', 'tractors', 'trollies', 'vans', 'units'],
  furniture_office: ['units', 'sets', 'chairs', 'desks', 'racks', 'computers'],
  pre_operative: ['licenses', 'permits', 'months', 'fees', 'lump sum', 'units'],
  raw_materials: ['kg', 'quintals', 'tonnes', 'litres', 'bags', 'batches', 'animals', 'units'],
  working_capital: ['months', 'days', 'weeks', 'lump sum'],
  other_costs: ['lump sum', 'months', 'units', 'other']
};

export interface UnitBenchmark {
  defaultQty: number;
  defaultUnitCost: number;
  unitLabel: string;
}

/**
 * Returns realistic benchmark rates and default quantities matching the selected unit type.
 */
export function getUnitBenchmark(unit: string): UnitBenchmark {
  const u = (unit || 'units').toLowerCase().trim();

  switch (u) {
    case 'sq.ft':
      return { defaultQty: 1000, defaultUnitCost: 350, unitLabel: '/ sq.ft' };
    case 'sq.m':
      return { defaultQty: 100, defaultUnitCost: 3500, unitLabel: '/ sq.m' };
    case 'acres':
      return { defaultQty: 1, defaultUnitCost: 200000, unitLabel: '/ acre' };
    case 'bigha':
      return { defaultQty: 1, defaultUnitCost: 150000, unitLabel: '/ bigha' };
    case 'hectares':
      return { defaultQty: 1, defaultUnitCost: 400000, unitLabel: '/ hectare' };
    case 'animals':
      return { defaultQty: 5, defaultUnitCost: 60000, unitLabel: '/ animal' };
    case 'rooms':
      return { defaultQty: 2, defaultUnitCost: 150000, unitLabel: '/ room' };
    case 'sheds':
    case 'structures':
      return { defaultQty: 1, defaultUnitCost: 300000, unitLabel: '/ shed' };
    case 'months':
      return { defaultQty: 1, defaultUnitCost: 50000, unitLabel: '/ month' };
    case 'days':
      return { defaultQty: 30, defaultUnitCost: 500, unitLabel: '/ day' };
    case 'weeks':
      return { defaultQty: 4, defaultUnitCost: 12500, unitLabel: '/ week' };
    case 'kg':
      return { defaultQty: 500, defaultUnitCost: 100, unitLabel: '/ kg' };
    case 'quintals':
      return { defaultQty: 50, defaultUnitCost: 2500, unitLabel: '/ quintal' };
    case 'tonnes':
      return { defaultQty: 5, defaultUnitCost: 25000, unitLabel: '/ tonne' };
    case 'litres':
      return { defaultQty: 1000, defaultUnitCost: 50, unitLabel: '/ litre' };
    case 'vehicles':
    case 'trucks':
    case 'tractors':
    case 'vans':
      return { defaultQty: 1, defaultUnitCost: 250000, unitLabel: '/ vehicle' };
    case 'licenses':
    case 'permits':
    case 'fees':
      return { defaultQty: 1, defaultUnitCost: 15000, unitLabel: '/ license' };
    default:
      return { defaultQty: 1, defaultUnitCost: 0, unitLabel: '/ unit' };
  }
}

// Section-Relevant Item Description Presets
const CATEGORY_DESCRIPTION_PRESETS: Record<string, Array<{ name: string; defaultUnit: string }>> = {
  land_site: [
    { name: 'Land Purchase / Lease Hold Rights', defaultUnit: 'acres' },
    { name: 'Site Levelling & Earth Filling Work', defaultUnit: 'sq.ft' },
    { name: 'Boundary Wall & Security Fencing', defaultUnit: 'sq.ft' },
    { name: 'Internal Concrete / Gravel Access Road', defaultUnit: 'sq.m' },
    { name: 'Deep Borewell & Water Storage Tank', defaultUnit: 'units' }
  ],
  building_civil: [
    { name: 'Processing / Manufacturing Shed Construction', defaultUnit: 'sq.ft' },
    { name: 'Ventilated Dairy / Livestock Shed & Slurry Drainage', defaultUnit: 'sq.ft' },
    { name: 'Biosecure Poultry Shed with Side Curtains', defaultUnit: 'sq.ft' },
    { name: 'Store Front Fitout & Vitrified Flooring', defaultUnit: 'sq.ft' },
    { name: 'Office Room & POS Billing Counter Setup', defaultUnit: 'sq.ft' },
    { name: 'Hygienic Epoxy Flooring & Wall Tiling', defaultUnit: 'sq.ft' },
    { name: 'Raw Material Warehouse & Cold Store Depot', defaultUnit: 'sq.ft' }
  ],
  plant_machinery: [
    { name: 'Primary Operational Processing Machinery', defaultUnit: 'units' },
    { name: 'High-Yield Milch Animals (Cows / Buffaloes)', defaultUnit: 'animals' },
    { name: 'Bulk Milk Cooler (BMC) & Automated Milking Machine', defaultUnit: 'units' },
    { name: 'Motorized Chaff Cutter & Feed Mixer', defaultUnit: 'units' },
    { name: 'Automated Nipple Drinker & Feeder Lines', defaultUnit: 'units' },
    { name: 'Processing, Milling & Grain Cleaning Machinery', defaultUnit: 'units' },
    { name: 'Automatic Pouch Packaging & Sealing Machine', defaultUnit: 'units' },
    { name: 'POS Billing Counter & Visi-Cooler Unit', defaultUnit: 'units' },
    { name: 'Heavy Duty Diesel Generator / Solar Power Inverter', defaultUnit: 'kw' }
  ],
  vehicles_trans: [
    { name: 'Agri-Freight Cargo Transport Truck', defaultUnit: 'vehicles' },
    { name: 'Tractor with Hydraulic Tipping Trailer', defaultUnit: 'tractors' },
    { name: 'Refrigerated Insulated Milk / Food Delivery Van', defaultUnit: 'vans' },
    { name: 'Commercial Delivery Auto-Rickshaw / E-Loader', defaultUnit: 'vehicles' },
    { name: 'Two-Wheeler Field Sales & Executive Motorbike', defaultUnit: 'vehicles' }
  ],
  furniture_office: [
    { name: 'Heavy Duty Display Shelving Racks & Counters', defaultUnit: 'racks' },
    { name: 'Executive Office Billing Desk & Ergonomic Chairs', defaultUnit: 'sets' },
    { name: 'Computer System & Thermal POS Printer', defaultUnit: 'computers' },
    { name: 'Heavy Duty Steel Storage Almirah / Lockers', defaultUnit: 'units' },
    { name: 'CCTV Security Camera & Security System', defaultUnit: 'sets' }
  ],
  pre_operative: [
    { name: 'FSSAI Food Safety License & Registration', defaultUnit: 'licenses' },
    { name: 'GST, Trade License & Business Incorporation Fees', defaultUnit: 'fees' },
    { name: 'Detailed Project Report (DPR) & Consultancy Charges', defaultUnit: 'fees' },
    { name: 'Architectural Plan & Layout Engineering Fees', defaultUnit: 'fees' },
    { name: 'State Pollution Control Board NOC Certificate', defaultUnit: 'permits' },
    { name: 'Commercial Electricity Sanction & Security Deposit', defaultUnit: 'lump sum' }
  ],
  raw_materials: [
    { name: 'Raw Material Crop / Grain Procurement Buffer', defaultUnit: 'quintals' },
    { name: 'Day-Old Chicks (DOC) & Poultry Flock Stock', defaultUnit: 'units' },
    { name: 'Packaging Pouches, Bags & Corrugated Boxes', defaultUnit: 'batches' },
    { name: 'Initial Grocery & FMCG Inventory Stock', defaultUnit: 'units' },
    { name: 'Spices, Preservatives & Processing Additives', defaultUnit: 'kg' }
  ],
  working_capital: [
    { name: '30-Day Operational Expense Working Reserve', defaultUnit: 'months' },
    { name: 'Initial Fodder & Cattle Feed Reserve', defaultUnit: 'months' },
    { name: 'Poultry Feed & Vaccine Operating Buffer', defaultUnit: 'months' },
    { name: 'Staff Salary & Worker Wage Buffer', defaultUnit: 'months' },
    { name: 'Utility, Electricity & Diesel Operating Buffer', defaultUnit: 'months' }
  ],
  other_costs: [
    { name: 'Machine Calibration & Trial Run Expenses', defaultUnit: 'lump sum' },
    { name: 'Staff Skill Training & Hands-On Exposure Visit', defaultUnit: 'months' },
    { name: 'Marketing, Store Signage & Grand Opening Launch', defaultUnit: 'lump sum' },
    { name: 'Contingency Fund (Unforeseen Setup Expenses)', defaultUnit: 'lump sum' }
  ]
};

/**
 * Combobox Component allowing typing AND selecting section-relevant dropdown presets
 */
const DescriptionCombobox: React.FC<{
  value: string;
  category: string;
  onChange: (newName: string, suggestedUnit?: string) => void;
}> = ({ value, category, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const basePresets = CATEGORY_DESCRIPTION_PRESETS[category] || [];

  const filteredPresets = useMemo(() => {
    const query = value.toLowerCase().trim();
    if (!query) return basePresets;
    return basePresets.filter(p => p.name.toLowerCase().includes(query));
  }, [value, basePresets]);

  return (
    <div ref={containerRef} className="relative col-span-4">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Select preset or type custom description..."
          className="w-full pl-2.5 pr-7 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
        >
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Section-Relevant Presets Dropdown Menu */}
      {isOpen && basePresets.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl py-1 text-xs animate-in fade-in duration-100">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <span>Section Presets</span>
            <span className="text-[9px] text-emerald-500 font-normal">Click to select</span>
          </div>

          {filteredPresets.length > 0 ? (
            filteredPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(preset.name, preset.defaultUnit);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between text-xs cursor-pointer ${
                  value.toLowerCase() === preset.name.toLowerCase()
                    ? 'bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-700 dark:text-zinc-300'
                }`}
              >
                <span className="truncate pr-2">{preset.name}</span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 shrink-0">
                  [{preset.defaultUnit}]
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-[11px] text-gray-400 italic text-center">
              Type custom: "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface Step3Props {
  items: CapExItem[];
  onUpdateItems: (items: CapExItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  businessCategoryOrName?: string;
  selectedLocationText?: string;
}

export const Step3CostBuilder: React.FC<Step3Props> = ({
  items,
  onUpdateItems,
  onNext,
  onBack,
  businessCategoryOrName = '',
  selectedLocationText = ''
}) => {
  // Single Source of Truth Derivation
  const totals = useMemo(() => calculateCapExTotals(items), [items]);

  // Fetch business-specific suggestions (without auto-invented fake prices)
  const suggestions = useMemo(
    () => businessDataService.getCostSuggestionsForCategory(businessCategoryOrName),
    [businessCategoryOrName]
  );

  const handleAddItem = (category: string, defaultName: string = '', defaultUnit: string = '') => {
    const availableUnits = CATEGORY_UNITS[category] || ['units'];
    const unitToUse = defaultUnit || availableUnits[0];
    const bm = getUnitBenchmark(unitToUse);

    const newItem: CapExItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      category,
      name: defaultName || '',
      quantity: defaultName ? bm.defaultQty : 1,
      unit: unitToUse,
      unit_cost: defaultName ? bm.defaultUnitCost : 0,
      total_amount: defaultName ? (bm.defaultQty * bm.defaultUnitCost) : 0,
      sourceType: defaultName ? 'REFERENCE BENCHMARK' : 'USER INPUT'
    };
    onUpdateItems([...items, newItem]);
  };

  const handleItemChange = (id: string, field: keyof CapExItem, val: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unit_cost') {
          const qty = Math.max(0, Number(newItem.quantity) || 0);
          const cost = Math.max(0, Number(newItem.unit_cost) || 0);
          newItem.quantity = qty;
          newItem.unit_cost = cost;
          newItem.total_amount = qty * cost;
        }
        return newItem;
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleUnitChange = (item: CapExItem, newUnit: string) => {
    const bm = getUnitBenchmark(newUnit);
    const updated = items.map(i => {
      if (i.id === item.id) {
        // If unit cost is 0 or matching previous unrealistic default, auto-adjust to benchmark rate
        const shouldAdjustRate = !i.unit_cost || i.unit_cost === 0 || i.unit_cost === 300000 || i.unit_cost === 100000;
        const newCost = shouldAdjustRate ? bm.defaultUnitCost : i.unit_cost;
        const newQty = (shouldAdjustRate && bm.defaultQty > 1) ? bm.defaultQty : i.quantity;
        return {
          ...i,
          unit: newUnit,
          quantity: newQty,
          unit_cost: newCost,
          total_amount: newQty * newCost
        };
      }
      return i;
    });
    onUpdateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter(item => item.id !== id));
  };

  const handleDuplicateItem = (item: CapExItem) => {
    const dup: CapExItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: item.name ? `${item.name} (Copy)` : '',
      total_amount: calculateLineItemTotal(item)
    };
    onUpdateItems([...items, dup]);
  };

  // Validation
  const hasValidCost = totals.totalProjectCost > 0;
  const hasEmptyItemNames = items.some(i => !i.name.trim());

  return (
    <div className="space-y-6">
      {/* Location & Enterprise Context Bar */}
      <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calculator className="text-emerald-500" size={22} />
              Step 3: Project Cost Builder
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Itemize capital expenditure (CapEx) and initial working capital reserves required for your venture.
            </p>
          </div>

          {/* TOTAL PROJECT COST DISPLAY CARD */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl text-left sm:text-right shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              TOTAL PROJECT COST
            </span>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-mono">
              ₹{totals.totalProjectCost.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2 justify-start sm:justify-end">
              <span>CapEx: <strong>₹{totals.totalCapEx.toLocaleString('en-IN')}</strong></span>
              <span>•</span>
              <span>Working Cap: <strong>₹{totals.totalWorkingCapital.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        {/* Selected Context & Reconciliation Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300 font-medium">
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-900 font-bold text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800">
              {selectedLocationText || 'Selected Location'}
            </span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              {businessCategoryOrName || 'Selected Business'}
            </span>
          </div>

          {/* Reconciliation Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {totals.isReconciled ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <ShieldCheck size={13} />
                Cost Calculation Reconciled (100% Accurate)
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                <AlertTriangle size={13} />
                Reconciliation Warning: Delta ₹{totals.reconciliationDelta}
              </span>
            )}
          </div>
        </div>

        {/* Cost Breakdown Progress Bar */}
        {totals.totalProjectCost > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-zinc-900">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><PieChart size={12} className="text-emerald-500" /> Capital Allocation Breakdown</span>
              <span>{items.length} Total Items</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-zinc-900 overflow-hidden flex">
              {Object.entries(ALL_CATEGORIES).map(([catKey, catInfo]) => {
                const sub = calculateCategorySubtotal(items, catKey);
                if (sub <= 0) return null;
                const pct = (sub / totals.totalProjectCost) * 100;
                const isWc = WORKING_CAPITAL_CATEGORY_KEYS.includes(catKey);

                return (
                  <div
                    key={catKey}
                    style={{ width: `${pct}%` }}
                    title={`${catInfo.label}: ₹${sub.toLocaleString('en-IN')} (${pct.toFixed(1)}%)`}
                    className={`h-full transition-all ${isWc ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Business-Specific Cost Item Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Sparkles size={15} />
              Suggested Cost Items for {businessCategoryOrName || 'Selected Business'}
            </div>
            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
              Click to add asset with benchmark rate
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, idx) => {
              const alreadyAdded = items.some(i => i.name.toLowerCase() === sug.name.toLowerCase());

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !alreadyAdded && handleAddItem(sug.category, sug.name, sug.unit)}
                  disabled={alreadyAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    alreadyAdded
                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 border-transparent cursor-not-allowed'
                      : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <Plus size={13} className={alreadyAdded ? 'text-gray-400' : 'text-amber-500'} />
                  <span>{sug.name}</span>
                  {alreadyAdded && <span className="text-[10px] font-bold text-emerald-500 ml-1">Added ✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 1: CAPITAL EXPENDITURE (CAPEX) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="text-emerald-500" size={16} />
            1. Capital Expenditure (CapEx)
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            CapEx Subtotal: ₹{totals.totalCapEx.toLocaleString('en-IN')}
          </span>
        </div>

        {Object.entries(CAPEX_CATEGORIES).map(([catKey, catInfo]) => {
          const categoryItems = items.filter(i => i.category === catKey);
          const categorySubtotal = calculateCategorySubtotal(items, catKey);
          const availableUnits = CATEGORY_UNITS[catKey] || ['units'];

          return (
            <div key={catKey} className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider">
                    {catInfo.label}
                  </h4>
                  <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500">
                    ({categoryItems.length} items)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{categorySubtotal.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddItem(catKey)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
              </div>

              {categoryItems.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500 px-2 uppercase tracking-wider">
                    <span className="col-span-4">Item Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-center">Unit</span>
                    <span className="col-span-2 text-right">Unit Cost (₹)</span>
                    <span className="col-span-2 text-right pr-2">Total (₹)</span>
                  </div>

                  {categoryItems.map(item => {
                    const lineTotal = calculateLineItemTotal(item);
                    const unitBm = getUnitBenchmark(item.unit || 'units');

                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/60">
                        {/* ITEM DESCRIPTION WITH COMBOBOX */}
                        <DescriptionCombobox
                          value={item.name}
                          category={catKey}
                          onChange={(newName, suggestedUnit) => {
                            handleItemChange(item.id, 'name', newName);
                            if (suggestedUnit) {
                              handleUnitChange(item, suggestedUnit);
                            }
                          }}
                        />

                        {/* QTY INPUT */}
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                          placeholder="1"
                          className="col-span-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-center text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                        />

                        {/* UNIT SELECTION DROPDOWN */}
                        <select
                          value={item.unit || availableUnits[0]}
                          onChange={e => handleUnitChange(item, e.target.value)}
                          className="col-span-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-800 dark:text-zinc-200 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          {availableUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>

                        {/* UNIT COST INPUT (₹ PER UNIT) */}
                        <div className="col-span-2 relative flex flex-col justify-center">
                          <input
                            type="number"
                            min="0"
                            value={item.unit_cost || ''}
                            onChange={e => handleItemChange(item.id, 'unit_cost', e.target.value)}
                            placeholder="Cost / Unit"
                            className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-right text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 text-right pr-1 pt-0.5 truncate">
                            {unitBm.unitLabel}
                          </span>
                        </div>

                        {/* LINE TOTAL DISPLAY (DYNAMICALLY CALCULATED) */}
                        <div className="col-span-2 flex items-center justify-end gap-1.5 pl-1">
                          <div className="text-right">
                            <span className="text-xs font-mono font-extrabold text-gray-900 dark:text-white block">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono block">
                              ({item.quantity || 0} {item.unit || 'units'})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            title="Duplicate item"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete item"
                            className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2.5 text-center text-[11px] text-gray-400 dark:text-zinc-500 italic">
                  No line items in this category.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 2: INITIAL WORKING CAPITAL & OTHER COSTS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="text-amber-500" size={16} />
            2. Initial Working Capital & Operating Reserves
          </h3>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            Working Capital Subtotal: ₹{totals.totalWorkingCapital.toLocaleString('en-IN')}
          </span>
        </div>

        {Object.entries(WORKING_CAPITAL_CATEGORIES).map(([catKey, catInfo]) => {
          const categoryItems = items.filter(i => i.category === catKey);
          const categorySubtotal = calculateCategorySubtotal(items, catKey);
          const availableUnits = CATEGORY_UNITS[catKey] || ['months'];

          return (
            <div key={catKey} className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider">
                    {catInfo.label}
                  </h4>
                  <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500">
                    ({categoryItems.length} items)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    ₹{categorySubtotal.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddItem(catKey)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
              </div>

              {categoryItems.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500 px-2 uppercase tracking-wider">
                    <span className="col-span-4">Item Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-center">Unit</span>
                    <span className="col-span-2 text-right">Unit Cost (₹)</span>
                    <span className="col-span-2 text-right pr-2">Total (₹)</span>
                  </div>

                  {categoryItems.map(item => {
                    const lineTotal = calculateLineItemTotal(item);
                    const unitBm = getUnitBenchmark(item.unit || 'months');

                    return (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/60">
                        {/* ITEM DESCRIPTION WITH COMBOBOX */}
                        <DescriptionCombobox
                          value={item.name}
                          category={catKey}
                          onChange={(newName, suggestedUnit) => {
                            handleItemChange(item.id, 'name', newName);
                            if (suggestedUnit) {
                              handleUnitChange(item, suggestedUnit);
                            }
                          }}
                        />

                        {/* QTY INPUT */}
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                          placeholder="1"
                          className="col-span-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-center text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                        />

                        {/* UNIT SELECTION DROPDOWN */}
                        <select
                          value={item.unit || availableUnits[0]}
                          onChange={e => handleUnitChange(item, e.target.value)}
                          className="col-span-2 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-800 dark:text-zinc-200 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                        >
                          {availableUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>

                        {/* UNIT COST INPUT (₹ PER UNIT) */}
                        <div className="col-span-2 relative flex flex-col justify-center">
                          <input
                            type="number"
                            min="0"
                            value={item.unit_cost || ''}
                            onChange={e => handleItemChange(item.id, 'unit_cost', e.target.value)}
                            placeholder="Cost / Unit"
                            className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-bold text-right text-gray-900 dark:text-white font-mono focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 text-right pr-1 pt-0.5 truncate">
                            {unitBm.unitLabel}
                          </span>
                        </div>

                        {/* LINE TOTAL DISPLAY */}
                        <div className="col-span-2 flex items-center justify-end gap-1.5 pl-1">
                          <div className="text-right">
                            <span className="text-xs font-mono font-extrabold text-gray-900 dark:text-white block">
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono block">
                              ({item.quantity || 0} {item.unit || 'units'})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            title="Duplicate item"
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete item"
                            className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2.5 text-center text-[11px] text-gray-400 dark:text-zinc-500 italic">
                  No line items in this category.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Notices & Summary */}
      {!hasValidCost && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-amber-500" />
          <span>Add at least one project cost item with a valid unit cost to proceed to Step 4 (Capital & Funding).</span>
        </div>
      )}

      {hasEmptyItemNames && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-rose-500" />
          <span>Please enter descriptions for all cost items before proceeding.</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        >
          ← Back to Business Selection
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasValidCost || hasEmptyItemNames}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          Proceed to Capital & Funding ➔
        </button>
      </div>
    </div>
  );
};
