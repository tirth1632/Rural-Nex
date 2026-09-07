import { useState, useMemo } from 'react';
import { 
  Sprout, 
  Milk, 
  Egg, 
  Utensils, 
  Store, 
  Wrench, 
  Factory, 
  Palette, 
  Truck, 
  Sun, 
  Compass, 
  Laptop, 
  CheckCircle2, 
  ShieldAlert,
  Search,
  ChevronRight,
  Sparkles,
  X,
  type LucideIcon 
} from 'lucide-react';

export interface SubBusinessItem {
  name: string;
  regulated?: boolean;
  note?: string;
}

export interface CategoryItem {
  id: number;
  key: string;
  name: string;
  icon: LucideIcon;
  description: string;
  badgeBg: string;
  badgeText: string;
  subBusinesses: SubBusinessItem[];
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 1,
    key: 'agriculture',
    name: 'Agriculture & Crop Farming',
    icon: Sprout,
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    badgeText: 'text-emerald-700',
    description: 'Wheat, rice, cotton, vegetables, fruits, organic farming & seed production.',
    subBusinesses: [
      { name: 'Wheat Farming' },
      { name: 'Rice Farming' },
      { name: 'Cotton Farming' },
      { name: 'Groundnut Farming' },
      { name: 'Vegetable Farming' },
      { name: 'Fruit Farming' },
      { name: 'Organic Farming' },
      { name: 'Horticulture' },
      { name: 'Floriculture' },
      { name: 'Greenhouse Farming' },
      { name: 'Nursery' },
      { name: 'Seed Production' },
    ]
  },
  {
    id: 2,
    key: 'dairy',
    name: 'Dairy & Livestock',
    icon: Milk,
    badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
    badgeText: 'text-amber-700',
    description: 'Dairy farm, milk collection, processing, goat/sheep rearing & animal feed.',
    subBusinesses: [
      { name: 'Dairy Farm' },
      { name: 'Milk Collection Center' },
      { name: 'Milk Processing' },
      { name: 'Goat Farming' },
      { name: 'Sheep Farming' },
      { name: 'Pig Farming' },
      { name: 'Cattle Breeding' },
      { name: 'Fodder Production' },
      { name: 'Animal Feed Business' },
    ]
  },
  {
    id: 3,
    key: 'poultry_fisheries',
    name: 'Poultry & Fisheries',
    icon: Egg,
    badgeBg: 'bg-teal-50 text-teal-600 border-teal-100',
    badgeText: 'text-teal-700',
    description: 'Broiler & layer poultry, egg production, fish farming, hatchery & aquaculture.',
    subBusinesses: [
      { name: 'Broiler Poultry' },
      { name: 'Layer Poultry' },
      { name: 'Hatchery' },
      { name: 'Egg Production' },
      { name: 'Fish Farming' },
      { name: 'Shrimp Farming' },
      { name: 'Fish Hatchery' },
      { name: 'Aquaculture' },
    ]
  },
  {
    id: 4,
    key: 'food_processing',
    name: 'Food Processing & Agro',
    icon: Utensils,
    badgeBg: 'bg-orange-50 text-orange-600 border-orange-100',
    badgeText: 'text-orange-700',
    description: 'Flour/rice/oil mills, spice processing, pickles, papad, bakery & snacks.',
    subBusinesses: [
      { name: 'Flour Mill' },
      { name: 'Rice Mill' },
      { name: 'Oil Mill' },
      { name: 'Dal Mill' },
      { name: 'Spice Processing' },
      { name: 'Pickle Manufacturing' },
      { name: 'Papad Manufacturing' },
      { name: 'Bakery' },
      { name: 'Snack Manufacturing' },
      { name: 'Fruit Processing' },
      { name: 'Vegetable Processing' },
      { name: 'Dairy Processing' },
    ]
  },
  {
    id: 5,
    key: 'retail',
    name: 'Retail & Consumer',
    icon: Store,
    badgeBg: 'bg-blue-50 text-blue-600 border-blue-100',
    badgeText: 'text-blue-700',
    description: 'Kirana store, supermarket, hardware, agro inputs, clothing & medical shop.',
    subBusinesses: [
      { name: 'Kirana Store' },
      { name: 'Supermarket' },
      { name: 'Hardware Store' },
      { name: 'Agricultural Input Store' },
      { name: 'Fertilizer Shop', regulated: true, note: 'Statutory License Required: Requires State Fertilizer Dealer License & stock registry under Fertilizer Control Order.' },
      { name: 'Seed Shop', regulated: true, note: 'Statutory License Required: Requires State Seed License under the Seeds Act 1966.' },
      { name: 'Clothing Store' },
      { name: 'Footwear Store' },
      { name: 'Electronics Store' },
      { name: 'Mobile Shop' },
      { name: 'Medical Store', regulated: true, note: 'Regulated Business: Requires Retail Drug License (Form 20/21) & Registered Pharmacist (D.Pharm/B.Pharm) on staff.' },
    ]
  },
  {
    id: 6,
    key: 'services',
    name: 'Services & Repair',
    icon: Wrench,
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    description: 'Mobile/appliance/auto repair, tractor service, tailoring, salon & Xerox.',
    subBusinesses: [
      { name: 'Mobile Repair' },
      { name: 'Electronics Repair' },
      { name: 'Automobile Repair' },
      { name: 'Tractor Repair' },
      { name: 'Electrical Services' },
      { name: 'Plumbing' },
      { name: 'Welding' },
      { name: 'Tailoring' },
      { name: 'Salon' },
      { name: 'Beauty Services' },
      { name: 'Computer Services' },
      { name: 'Printing / Xerox' },
    ]
  },
  {
    id: 7,
    key: 'manufacturing',
    name: 'Manufacturing & Industry',
    icon: Factory,
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    badgeText: 'text-indigo-700',
    description: 'Furniture, bricks, cement products, textiles, packaging & metal fabrication.',
    subBusinesses: [
      { name: 'Furniture Manufacturing' },
      { name: 'Brick Manufacturing' },
      { name: 'Cement Products' },
      { name: 'Packaging' },
      { name: 'Textile Manufacturing' },
      { name: 'Garment Manufacturing' },
      { name: 'Metal Fabrication' },
      { name: 'Plastic Products' },
      { name: 'Small Machinery' },
      { name: 'Agricultural Equipment' },
    ]
  },
  {
    id: 8,
    key: 'handicrafts',
    name: 'Handicrafts & Rural Products',
    icon: Palette,
    badgeBg: 'bg-rose-50 text-rose-600 border-rose-100',
    badgeText: 'text-rose-700',
    description: 'Pottery, handloom, bamboo craft, woodcraft, jewelry & leather goods.',
    subBusinesses: [
      { name: 'Pottery' },
      { name: 'Handloom' },
      { name: 'Bamboo Products' },
      { name: 'Woodcraft' },
      { name: 'Jewellery' },
      { name: 'Leather Products' },
      { name: 'Traditional Textiles' },
      { name: 'Basket Making' },
      { name: 'Handmade Products' },
    ]
  },
  {
    id: 9,
    key: 'transport',
    name: 'Transport & Logistics',
    icon: Truck,
    badgeBg: 'bg-sky-50 text-sky-600 border-sky-100',
    badgeText: 'text-sky-700',
    description: 'Agri-freight, rural delivery, tractor transport, cold chain & warehousing.',
    subBusinesses: [
      { name: 'Goods Transportation' },
      { name: 'Agri-Freight' },
      { name: 'Rural Delivery' },
      { name: 'Tractor Transport' },
      { name: 'Cold Chain' },
      { name: 'Warehouse' },
      { name: 'Micro-Warehousing' },
      { name: 'Logistics Service' },
      { name: 'Farm Equipment Rental' },
    ]
  },
  {
    id: 10,
    key: 'renewable_energy',
    name: 'Renewable Energy',
    icon: Sun,
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badgeText: 'text-emerald-800',
    description: 'Solar pumps, solar panel installation, biogas plants & biomass energy.',
    subBusinesses: [
      { name: 'Solar Pump Installation' },
      { name: 'Solar Panel Installation' },
      { name: 'Solar Equipment Sales' },
      { name: 'Biogas Plant' },
      { name: 'Biomass Energy' },
      { name: 'Solar Water Heating' },
      { name: 'Renewable Energy Services' },
    ]
  },
  {
    id: 11,
    key: 'tourism',
    name: 'Tourism & Hospitality',
    icon: Compass,
    badgeBg: 'bg-violet-50 text-violet-600 border-violet-100',
    badgeText: 'text-violet-700',
    description: 'Homestays, farm stays, eco-tourism, agri-tourism & rural experience centers.',
    subBusinesses: [
      { name: 'Homestay' },
      { name: 'Rural Resort' },
      { name: 'Farm Stay' },
      { name: 'Eco-Tourism' },
      { name: 'Agri-Tourism' },
      { name: 'Camping' },
      { name: 'Rural Restaurant' },
      { name: 'Tourist Guide' },
      { name: 'Local Experience Center' },
    ]
  },
  {
    id: 12,
    key: 'digital_services',
    name: 'Digital & Professional Services',
    icon: Laptop,
    badgeBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    badgeText: 'text-cyan-700',
    description: 'Cyber cafe, digital service center, CSC/e-governance, accounting & training.',
    subBusinesses: [
      { name: 'Cyber Cafe' },
      { name: 'Digital Service Center' },
      { name: 'Online Government Services' },
      { name: 'Computer Training' },
      { name: 'Digital Marketing' },
      { name: 'Accounting Services' },
      { name: 'Photography' },
      { name: 'Videography' },
      { name: 'E-commerce Fulfillment' },
      { name: 'Freelance Services' },
    ]
  },
];

export default function Step4Category({ data, onNext, onBack }: any) {
  const [selectedCatId, setSelectedCatId] = useState<number | null>(() => {
    if (data.category_id && typeof data.category_id === 'number') return data.category_id;
    if (data.category_name) {
      const match = CATEGORIES_DATA.find(c => c.name.toLowerCase() === data.category_name.toLowerCase());
      if (match) return match.id;
    }
    return 1; // Default to Agriculture & Crop Farming
  });

  const [selectedSubBusiness, setSelectedSubBusiness] = useState<string>(
    data.sub_category || data.specific_business || ''
  );

  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const selectedCategory = useMemo(() => {
    return CATEGORIES_DATA.find(c => c.id === selectedCatId) || CATEGORIES_DATA[0];
  }, [selectedCatId]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchFilter.trim()) return CATEGORIES_DATA;
    const q = searchFilter.toLowerCase();
    return CATEGORIES_DATA.filter(cat => 
      cat.name.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.subBusinesses.some(sub => sub.name.toLowerCase().includes(q))
    );
  }, [searchFilter]);

  const selectedSubObj = useMemo(() => {
    if (!selectedCategory || !selectedSubBusiness) return null;
    return selectedCategory.subBusinesses.find(sub => sub.name === selectedSubBusiness) || null;
  }, [selectedCategory, selectedSubBusiness]);

  const handleSelectCategory = (cat: CategoryItem) => {
    setSelectedCatId(cat.id);
    setIsCustomMode(false);
    // Auto select first sub-business if none selected
    if (cat.subBusinesses.length > 0) {
      setSelectedSubBusiness(cat.subBusinesses[0].name);
    } else {
      setSelectedSubBusiness('');
    }
  };

  const handleContinue = () => {
    if (isCustomMode && customCategory.trim()) {
      onNext({ 
        category_id: 999, 
        category_name: 'Custom Business',
        category: customCategory.trim(),
        sub_category: customCategory.trim(),
        specific_business: customCategory.trim(),
        is_regulated: false
      });
    } else if (selectedCategory) {
      const subName = selectedSubBusiness || selectedCategory.subBusinesses[0]?.name || selectedCategory.name;
      onNext({ 
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        category: selectedCategory.name,
        sub_category: subName,
        specific_business: subName,
        is_regulated: !!selectedSubObj?.regulated,
        licensing_note: selectedSubObj?.note || ''
      });
    }
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Header & Quick Search */}
      <div className="text-center space-y-2.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          What kind of business?
        </h2>
        <p className="text-gray-500 text-sm font-medium max-w-lg mx-auto">
          Select your primary enterprise sector and specific business model for instant feasibility mapping.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-1.5">
          <div className="relative flex items-center">
            <Search size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search e.g. Kirana, Solar, Medical, Poultry, Flour Mill..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-gray-400"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Categories 12-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {filteredCategories.map((cat) => {
          const isSelected = !isCustomMode && selectedCatId === cat.id;
          const IconComp = cat.icon;
          return (
            <div 
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                isSelected 
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' 
                  : 'border-gray-200/90 bg-white hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5'
              }`}
            >
              <div>
                {/* Header Icon + Selected Badge */}
                <div className="flex justify-between items-center mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${cat.badgeBg}`}>
                    <IconComp size={20} />
                  </div>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-gray-900 text-sm mb-1 tracking-tight group-hover:text-emerald-950 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11.5px] text-gray-500 font-normal leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              {/* Sub-Businesses Count Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold">
                <span className={isSelected ? 'text-emerald-700 font-bold' : 'text-gray-500'}>
                  {cat.subBusinesses.length} Business Types
                </span>
                <ChevronRight 
                  size={14} 
                  className={`transition-transform duration-200 ${
                    isSelected 
                      ? 'text-emerald-600 translate-x-0.5' 
                      : 'text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5'
                  }`} 
                />
              </div>
            </div>
          );
        })}

        {/* Custom / Other Category Card */}
        <div 
          onClick={() => {
            setIsCustomMode(true);
            setSelectedSubBusiness('');
          }}
          className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
            isCustomMode 
              ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20' 
              : 'border-dashed border-gray-300 bg-gray-50/40 hover:border-emerald-400 hover:bg-emerald-50/20'
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              {isCustomMode && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </div>
              )}
            </div>

            <h3 className="font-bold text-gray-900 text-sm mb-1 tracking-tight">
              Other / Custom Business
            </h3>
            <p className="text-[11.5px] text-gray-500 font-normal leading-relaxed">
              Define a specific niche enterprise or unlisted venture.
            </p>
          </div>

          {isCustomMode ? (
            <div className="mt-3 pt-2 border-t border-emerald-200/80">
              <input 
                type="text"
                autoFocus
                placeholder="Enter custom business name..."
                className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="mt-3.5 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-semibold text-gray-400 group-hover:text-emerald-600">
              <span>Custom Specification</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>

      {/* Sub-Businesses Selector Panel */}
      {!isCustomMode && selectedCategory && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3.5 transition-all">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedCategory.badgeBg}`}>
                <selectedCategory.icon size={17} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                  {selectedCategory.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Select your exact sub-business type below:
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200/80">
              {selectedCategory.subBusinesses.length} Sub-Types Available
            </span>
          </div>

          {/* Sub-business Pill Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedCategory.subBusinesses.map((sub) => {
              const isSubSelected = selectedSubBusiness === sub.name;
              return (
                <button
                  key={sub.name}
                  type="button"
                  onClick={() => setSelectedSubBusiness(sub.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSubSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-[1.02] ring-2 ring-emerald-600/20'
                      : 'bg-gray-50/80 text-gray-700 border-gray-200/90 hover:border-gray-300 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span>{sub.name}</span>
                  {sub.regulated && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isSubSelected 
                        ? 'bg-amber-400 text-amber-950' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      Regulated
                    </span>
                  )}
                  {isSubSelected && <CheckCircle2 size={13} className="ml-0.5 text-emerald-200" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>

          {/* Regulated Business Statutory Notice */}
          {selectedSubObj?.regulated && (
            <div className="mt-3 p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-3 text-amber-950 text-xs shadow-2xs">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wide text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                    Statutory Compliance Advisory
                  </span>
                  <span className="text-[11px] font-bold text-amber-900">{selectedSubObj.name}</span>
                </div>
                <p className="text-xs font-medium text-amber-900 leading-relaxed pt-1">
                  {selectedSubObj.note || 'This business requires mandatory statutory licensing and regulatory compliance approvals.'}
                </p>
                <p className="text-[11px] text-amber-800 font-semibold pt-0.5">
                  RuralNex feasibility model will automatically include regulatory timelines, fee schedules, and required documentation in your final report.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200/80">
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition cursor-pointer"
        >
          Back
        </button>
        <button 
          onClick={handleContinue}
          disabled={isCustomMode ? !customCategory.trim() : !selectedSubBusiness}
          className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

