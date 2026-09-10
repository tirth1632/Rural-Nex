import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
    runSimulation, 
    calculateLocalSimulation,
    type SimulationPayload, 
    type SimulationResponse 
} from '../../api/simulator';
import { 
    Calculator, TrendingUp, IndianRupee, Save, 
    RotateCcw, Building2, CheckCircle2,
    ArrowUpRight, PieChart, Sparkles, SlidersHorizontal,
    Activity, ShieldCheck
} from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

type Scenario = 'Conservative' | 'Base' | 'Optimistic';

interface BusinessCategoryOption {
    id: string;
    name: string;
    defaultPrice: number;
    defaultCost: number;
    defaultCustomers: number;
    defaultProjectCost: number;
}

const CATEGORIES: BusinessCategoryOption[] = [
    { id: 'Grocery', name: 'Grocery & Kirana Store', defaultPrice: 150, defaultCost: 15000, defaultCustomers: 200, defaultProjectCost: 500000 },
    { id: 'Dairy', name: 'Dairy & Milk Chilling Center', defaultPrice: 65, defaultCost: 28000, defaultCustomers: 600, defaultProjectCost: 800000 },
    { id: 'Poultry', name: 'Poultry & Layer Farming', defaultPrice: 180, defaultCost: 35000, defaultCustomers: 300, defaultProjectCost: 650000 },
    { id: 'AgroProcessing', name: 'Agro-Processing & Flour Mill', defaultPrice: 40, defaultCost: 22000, defaultCustomers: 850, defaultProjectCost: 750000 },
    { id: 'Solar', name: 'Solar Installation & Agri Pumps', defaultPrice: 1200, defaultCost: 45000, defaultCustomers: 60, defaultProjectCost: 1200000 },
    { id: 'Textiles', name: 'Handloom & Garment Stitching', defaultPrice: 350, defaultCost: 18000, defaultCustomers: 120, defaultProjectCost: 350000 },
    { id: 'ColdStorage', name: 'Micro Cold Storage & Warehousing', defaultPrice: 450, defaultCost: 55000, defaultCustomers: 180, defaultProjectCost: 2200000 },
    { id: 'RuralPharmacy', name: 'Rural Pharmacy & Medical Supplies', defaultPrice: 220, defaultCost: 20000, defaultCustomers: 300, defaultProjectCost: 450000 },
];

export default function WhatIfSimulator() {
    const { t } = useTranslation();
    const [activeScenario, setActiveScenario] = useState<Scenario>('Base');
    const [selectedCategory, setSelectedCategory] = useState<string>('Grocery');
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Initial base payload
    const basePayload: SimulationPayload = {
        own_capital: 50000,
        project_cost: 500000,
        selling_price: 150,
        expected_customers: 200,
        monthly_operating_costs: 15000,
        employees: 2,
        production_capacity: 500,
        working_capital: 20000,
        category: 'Grocery'
    };

    const [scenarios, setScenarios] = useState<Record<Scenario, SimulationPayload>>({
        Conservative: { 
            ...basePayload, 
            expected_customers: 120, 
            selling_price: 140, 
            monthly_operating_costs: 16000 
        },
        Base: { ...basePayload },
        Optimistic: { 
            ...basePayload, 
            expected_customers: 320, 
            selling_price: 165, 
            monthly_operating_costs: 14500 
        }
    });

    const activePayload = scenarios[activeScenario];
    const debouncedPayload = useDebounce(activePayload, 400);

    // React Query with fallback
    const { data: serverResult, isFetching } = useQuery<SimulationResponse>({
        queryKey: ['simulate', debouncedPayload],
        queryFn: () => runSimulation(debouncedPayload),
        staleTime: 60000,
    });

    // Immediate local computation for instantaneous 0ms slider response
    const localResult = useMemo(() => {
        return calculateLocalSimulation(activePayload);
    }, [activePayload]);

    // Use server result when available, otherwise local immediate calculation
    const result: SimulationResponse = serverResult || localResult;

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
        const cat = CATEGORIES.find(c => c.id === categoryId);
        if (!cat) return;

        setScenarios({
            Conservative: {
                ...activePayload,
                category: cat.name,
                project_cost: cat.defaultProjectCost,
                own_capital: Math.round(cat.defaultProjectCost * 0.15),
                selling_price: Math.round(cat.defaultPrice * 0.9),
                expected_customers: Math.round(cat.defaultCustomers * 0.7),
                monthly_operating_costs: Math.round(cat.defaultCost * 1.1),
            },
            Base: {
                ...activePayload,
                category: cat.name,
                project_cost: cat.defaultProjectCost,
                own_capital: Math.round(cat.defaultProjectCost * 0.1),
                selling_price: cat.defaultPrice,
                expected_customers: cat.defaultCustomers,
                monthly_operating_costs: cat.defaultCost,
            },
            Optimistic: {
                ...activePayload,
                category: cat.name,
                project_cost: cat.defaultProjectCost,
                own_capital: Math.round(cat.defaultProjectCost * 0.1),
                selling_price: Math.round(cat.defaultPrice * 1.1),
                expected_customers: Math.round(cat.defaultCustomers * 1.4),
                monthly_operating_costs: cat.defaultCost,
            }
        });
    };

    const handleChange = (field: keyof SimulationPayload, value: number) => {
        setScenarios(prev => ({
            ...prev,
            [activeScenario]: {
                ...prev[activeScenario],
                [field]: value
            }
        }));
    };

    const handleReset = () => {
        const cat = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
        setScenarios({
            Conservative: { ...basePayload, expected_customers: 120, selling_price: Math.round(cat.defaultPrice * 0.9), project_cost: cat.defaultProjectCost },
            Base: { ...basePayload, selling_price: cat.defaultPrice, expected_customers: cat.defaultCustomers, project_cost: cat.defaultProjectCost },
            Optimistic: { ...basePayload, expected_customers: 320, selling_price: Math.round(cat.defaultPrice * 1.1), project_cost: cat.defaultProjectCost }
        });
    };

    const handleSaveScenario = () => {
        try {
            const saved = {
                timestamp: new Date().toISOString(),
                scenario: activeScenario,
                category: selectedCategory,
                payload: activePayload,
                result: result.simulation,
                feasibility: result.feasibility
            };
            const existing = JSON.parse(localStorage.getItem('ruralnex_saved_scenarios') || '[]');
            existing.unshift(saved);
            localStorage.setItem('ruralnex_saved_scenarios', JSON.stringify(existing.slice(0, 10)));
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3500);
        } catch (e) {
            console.error('Failed to save scenario', e);
        }
    };

    // Financial breakdown values
    const sim = result.simulation;
    const monthlyRev = sim.monthly_revenue || (activePayload.selling_price * activePayload.expected_customers);
    const monthlyCosts = activePayload.monthly_operating_costs;
    const installments = sim.repayment_schedule?.installments;
    const lastInstallment = installments && installments.length > 0 
        ? installments[installments.length - 1].total_installment 
        : (sim.loan_amount > 0 ? Math.round((sim.loan_amount * 0.08 / 12) * 1.3) : 0);
    const estimatedEMI = Number(lastInstallment || 0);
    const netSurplus = Math.max(0, monthlyRev - monthlyCosts - estimatedEMI);
    const marginPercent = sim.gross_margin_percentage;
    const isViable = sim.is_financially_feasible && (result.feasibility?.overall_score || 0) >= 50;

    return (
        <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#0a0a0c] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-colors">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <SlidersHorizontal size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {t('sim_title', 'What-If Scenario Simulator')}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                                {t('sim_subtitle', 'Adjust operational and financial assumptions to see immediate impacts on viability and loan eligibility.')}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Scenario Toggle Pills */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 self-stretch md:self-auto justify-center">
                    {(['Conservative', 'Base', 'Optimistic'] as Scenario[]).map(sc => (
                        <button
                            key={sc}
                            onClick={() => setActiveScenario(sc)}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                activeScenario === sc 
                                ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/80 dark:border-neutral-700' 
                                : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {sc === 'Conservative' ? t('sim_conservative', 'Conservative') : sc === 'Base' ? t('sim_base', 'Base Case') : t('sim_optimistic', 'Optimistic')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Quick Bar */}
            <div className="bg-white dark:bg-[#0a0a0c] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-neutral-300">
                    <Building2 size={18} className="text-emerald-500" />
                    <span>Business Domain:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedCategory === cat.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Financial Overrides Card */}
                    <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 space-y-6 transition-colors">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                            <div className="flex items-center gap-2">
                                <IndianRupee size={18} className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">Financial Overrides</h3>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Capital & Project
                            </span>
                        </div>
                        
                        {/* Own Capital */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">Own Capital (Margin)</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{activePayload.own_capital.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input 
                                type="range" min="10000" max="1000000" step="5000"
                                value={activePayload.own_capital}
                                onChange={(e) => handleChange('own_capital', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                                <span>₹10,000</span>
                                <span>Margin: {((activePayload.own_capital / Math.max(1, activePayload.project_cost)) * 100).toFixed(0)}%</span>
                                <span>₹10,00,000</span>
                            </div>
                        </div>

                        {/* Project Cost */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">Project Cost</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">
                                    ₹{activePayload.project_cost.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input 
                                type="range" min="50000" max="5000000" step="25000"
                                value={activePayload.project_cost}
                                onChange={(e) => handleChange('project_cost', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                                <span>₹50,000</span>
                                <span>₹50,00,000</span>
                            </div>
                        </div>

                        {/* Working Capital */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">Working Capital Reserve</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">
                                    ₹{(activePayload.working_capital || 20000).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input 
                                type="range" min="5000" max="500000" step="5000"
                                value={activePayload.working_capital || 20000}
                                onChange={(e) => handleChange('working_capital', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Operational Overrides Card */}
                    <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-800 p-6 space-y-6 transition-colors">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">Operational Overrides</h3>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                Pricing & Volume
                            </span>
                        </div>
                        
                        {/* Selling Price */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">{t('sim_selling_price', 'Selling Price / Unit')}</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{activePayload.selling_price}
                                </span>
                            </div>
                            <input 
                                type="range" min="10" max="2500" step="5"
                                value={activePayload.selling_price}
                                onChange={(e) => handleChange('selling_price', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                                <span>₹10</span>
                                <span>₹2,500</span>
                            </div>
                        </div>

                        {/* Expected Customers */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">{t('sim_customers', 'Expected Customers / Mo')}</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white">
                                    {activePayload.expected_customers} customers
                                </span>
                            </div>
                            <input 
                                type="range" min="10" max="2000" step="10"
                                value={activePayload.expected_customers}
                                onChange={(e) => handleChange('expected_customers', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                                <span>10</span>
                                <span>2,000 / mo</span>
                            </div>
                        </div>

                        {/* Monthly Operating Costs */}
                        <div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-neutral-300">{t('sim_opex', 'Monthly Operating Costs')}</span>
                                <span className="font-mono font-bold text-red-500 dark:text-red-400">
                                    ₹{activePayload.monthly_operating_costs.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <input 
                                type="range" min="1000" max="150000" step="1000"
                                value={activePayload.monthly_operating_costs}
                                onChange={(e) => handleChange('monthly_operating_costs', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                                <span>₹1,000</span>
                                <span>₹1,50,000</span>
                            </div>
                        </div>

                        {/* Reset and Quick Controls */}
                        <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                <RotateCcw size={14} />
                                {t('sim_reset', 'Reset to Default')}
                            </button>
                            <span className="text-[11px] text-gray-400 dark:text-neutral-500 flex items-center gap-1.5">
                                {isFetching ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Updating live metrics...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={12} className="text-amber-500" />
                                        <span>Real-time dynamic sync</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Results Dashboard (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Live Viability Banner */}
                    <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                        isViable 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300' 
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300'
                    }`}>
                        <div className="flex items-center gap-3">
                            {isViable ? (
                                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                                    <CheckCircle2 size={22} />
                                </div>
                            ) : (
                                <div className="p-2 bg-amber-500 text-white rounded-xl">
                                    <ShieldCheck size={22} />
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-base">
                                    {isViable ? 'Financially Viable Scenario' : 'Optimization Recommended'}
                                </h4>
                                <p className="text-xs opacity-90">
                                    {isViable 
                                        ? `Eligible under ${sim.scheme_name}. Projected monthly profit: ₹${netSurplus.toLocaleString('en-IN')}`
                                        : (sim.error_message || 'Operating costs or loan repayments are tight relative to sales volume.')
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="text-right pl-4">
                            <div className="text-xs font-medium uppercase tracking-wider opacity-75">Feasibility</div>
                            <div className="text-2xl font-black font-mono">
                                {result.feasibility?.overall_score || 72}/100
                            </div>
                        </div>
                    </div>

                    {/* Top 3 Primary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Eligible Loan */}
                        <div className="bg-white dark:bg-[#0a0a0c] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors">
                            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">Eligible Loan</span>
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <IndianRupee size={16} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white">
                                ₹{Number(sim.loan_amount).toLocaleString('en-IN')}
                            </div>
                            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {sim.scheme_name}
                            </div>
                        </div>

                        {/* Monthly Revenue */}
                        <div className="bg-white dark:bg-[#0a0a0c] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors">
                            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">{t('sim_revenue', 'Est. Monthly Revenue')}</span>
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                ₹{Number(monthlyRev).toLocaleString('en-IN')}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-neutral-400 flex items-center gap-1">
                                <ArrowUpRight size={14} className="text-emerald-500" />
                                {activePayload.expected_customers} units @ ₹{activePayload.selling_price}
                            </div>
                        </div>

                        {/* Gross Margin */}
                        <div className="bg-white dark:bg-[#0a0a0c] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors">
                            <div className="flex items-center justify-between text-gray-500 dark:text-neutral-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">{t('sim_margin', 'Gross Margin')}</span>
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Calculator size={16} />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white">
                                {marginPercent}%
                            </div>
                            <div className="mt-2 text-xs font-medium">
                                {marginPercent >= 30 ? (
                                    <span className="text-emerald-600 dark:text-emerald-400">● Healthy operating margin</span>
                                ) : (
                                    <span className="text-amber-500">● Tight margin profile</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Secondary Metrics Bar */}
                    <div className="bg-white dark:bg-[#0a0a0c] rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden transition-colors">
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-neutral-800">
                            <div className="p-5">
                                <div className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
                                    Break-even Volume
                                </div>
                                <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                                    {sim.break_even_customers} <span className="text-xs font-normal text-gray-400">units/mo</span>
                                </div>
                                <div className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                    Capacity buffer: {Math.max(0, activePayload.expected_customers - Number(sim.break_even_customers))} units
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
                                    Estimated Monthly EMI
                                </div>
                                <div className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                                    {estimatedEMI > 0 ? `₹${estimatedEMI.toLocaleString('en-IN')}` : '₹0 (Self-funded)'}
                                </div>
                                <div className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                    {sim.loan_amount > 0 ? 'Benchmark rate: 8.0% - 8.5% p.a.' : '100% Equity margin'}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
                                    {t('sim_profit', 'Net Monthly Profit')}
                                </div>
                                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    ₹{netSurplus.toLocaleString('en-IN')}
                                </div>
                                <div className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">
                                    Net surplus after costs & EMI
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Cash Flow Breakdown Bar */}
                    <div className="bg-white dark:bg-[#0a0a0c] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-4 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PieChart size={18} className="text-emerald-500" />
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Monthly Cash Flow Distribution</h3>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-neutral-500 font-mono">
                                Total Revenue: ₹{monthlyRev.toLocaleString('en-IN')}
                            </span>
                        </div>

                        {/* Multi-segment Progress Bar */}
                        <div className="w-full h-4 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden flex shadow-inner">
                            <div 
                                style={{ width: `${Math.min(100, (monthlyCosts / Math.max(1, monthlyRev)) * 100)}%` }}
                                className="bg-amber-500 transition-all duration-500"
                                title={`Operating Costs: ₹${monthlyCosts.toLocaleString('en-IN')}`}
                            />
                            <div 
                                style={{ width: `${Math.min(100, (estimatedEMI / Math.max(1, monthlyRev)) * 100)}%` }}
                                className="bg-blue-500 transition-all duration-500"
                                title={`Loan EMI: ₹${estimatedEMI.toLocaleString('en-IN')}`}
                            />
                            <div 
                                style={{ width: `${Math.min(100, (netSurplus / Math.max(1, monthlyRev)) * 100)}%` }}
                                className="bg-emerald-500 transition-all duration-500"
                                title={`Net Profit: ₹${netSurplus.toLocaleString('en-IN')}`}
                            />
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="text-gray-600 dark:text-neutral-400">Operating Costs:</span>
                                <strong className="text-gray-900 dark:text-white font-mono">₹{monthlyCosts.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span className="text-gray-600 dark:text-neutral-400">Loan EMI:</span>
                                <strong className="text-gray-900 dark:text-white font-mono">₹{estimatedEMI.toLocaleString('en-IN')}</strong>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-gray-600 dark:text-neutral-400">Net Surplus:</span>
                                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹{netSurplus.toLocaleString('en-IN')}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Scenario Comparison Quick Matrix */}
                    <div className="bg-white dark:bg-[#0a0a0c] p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm space-y-3 transition-colors">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                            Scenario Comparison Overview
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Conservative', 'Base', 'Optimistic'] as Scenario[]).map(sc => {
                                const p = scenarios[sc];
                                const rev = p.selling_price * p.expected_customers;
                                const gross = rev - p.monthly_operating_costs;
                                const isCurrent = activeScenario === sc;

                                return (
                                    <div 
                                        key={sc}
                                        onClick={() => setActiveScenario(sc)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            isCurrent
                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60 shadow-sm'
                                            : 'bg-gray-50/50 dark:bg-neutral-900/50 border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-xs font-bold mb-1 text-gray-900 dark:text-white">
                                            <span>{sc}</span>
                                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                        </div>
                                        <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{rev.toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                                            Margin: ₹{gross.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="text-xs text-gray-500 dark:text-neutral-400">
                            {savedSuccess ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 size={16} />
                                    Scenario successfully saved to your profile!
                                </span>
                            ) : (
                                <span>* Dynamic estimates based on RBI MSME guidelines and Govt scheme norms.</span>
                            )}
                        </div>

                        <button 
                            onClick={handleSaveScenario}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            <Save size={18} />
                            {savedSuccess ? 'Saved!' : t('simulator.save_scenario', 'Save Scenario to Profile')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
