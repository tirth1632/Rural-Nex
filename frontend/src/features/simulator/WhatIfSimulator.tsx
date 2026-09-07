import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { runSimulation, type SimulationPayload } from '../../api/simulator';
import { 
    Calculator, TrendingUp,
    IndianRupee, AlertCircle, Save
} from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

type Scenario = 'Conservative' | 'Base' | 'Optimistic';

export default function WhatIfSimulator() {
    const { t } = useTranslation();
    const [activeScenario, setActiveScenario] = useState<Scenario>('Base');
    
    // In a real app, these base values would come from the user's active assessment
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
        Conservative: { ...basePayload, expected_customers: 100, selling_price: 140 },
        Base: { ...basePayload },
        Optimistic: { ...basePayload, expected_customers: 350, selling_price: 160 }
    });

    const activePayload = scenarios[activeScenario];
    const debouncedPayload = useDebounce(activePayload, 500);

    const { data: result, isLoading, isError } = useQuery({
        queryKey: ['simulate', debouncedPayload],
        queryFn: () => runSimulation(debouncedPayload),
        staleTime: Infinity,
    });

    const handleChange = (field: keyof SimulationPayload, value: number) => {
        setScenarios(prev => ({
            ...prev,
            [activeScenario]: {
                ...prev[activeScenario],
                [field]: value
            }
        }));
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('simulator.title', 'What-If Simulator')}</h1>
                    <p className="mt-2 text-gray-600">
                        {t('simulator.subtitle', 'Adjust operational and financial assumptions to see immediate impacts on viability. These are estimates only.')}
                    </p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(['Conservative', 'Base', 'Optimistic'] as Scenario[]).map(sc => (
                        <button
                            key={sc}
                            onClick={() => setActiveScenario(sc)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeScenario === sc 
                                ? 'bg-white text-primary shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {sc}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Inputs Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Financial Overrides</h3>
                        
                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Own Capital (Margin)</span>
                                <span>₹{activePayload.own_capital.toLocaleString('en-IN')}</span>
                            </label>
                            <input 
                                type="range" min="10000" max="500000" step="5000"
                                value={activePayload.own_capital}
                                onChange={(e) => handleChange('own_capital', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Project Cost</span>
                                <span>₹{activePayload.project_cost.toLocaleString('en-IN')}</span>
                            </label>
                            <input 
                                type="range" min="50000" max="2500000" step="10000"
                                value={activePayload.project_cost}
                                onChange={(e) => handleChange('project_cost', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Operational Overrides</h3>
                        
                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Selling Price / Unit</span>
                                <span>₹{activePayload.selling_price}</span>
                            </label>
                            <input 
                                type="range" min="10" max="1000" step="10"
                                value={activePayload.selling_price}
                                onChange={(e) => handleChange('selling_price', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Expected Customers / Month</span>
                                <span>{activePayload.expected_customers}</span>
                            </label>
                            <input 
                                type="range" min="10" max="2000" step="10"
                                value={activePayload.expected_customers}
                                onChange={(e) => handleChange('expected_customers', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Monthly Operating Costs</span>
                                <span>₹{activePayload.monthly_operating_costs.toLocaleString('en-IN')}</span>
                            </label>
                            <input 
                                type="range" min="1000" max="100000" step="1000"
                                value={activePayload.monthly_operating_costs}
                                onChange={(e) => handleChange('monthly_operating_costs', Number(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Dashboard */}
                <div className="lg:col-span-8">
                    {isLoading && !result && (
                        <div className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {isError && (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-3">
                            <AlertCircle size={24} />
                            <p>Simulation failed. Please adjust parameters.</p>
                        </div>
                    )}

                    {result && !result.simulation.is_financially_feasible && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl mb-6 flex items-start gap-3">
                            <AlertCircle size={24} className="shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold">Scenario Not Feasible</h4>
                                <p>{result.simulation.error_message}</p>
                            </div>
                        </div>
                    )}

                    {result && result.simulation.is_financially_feasible && (
                        <div className="space-y-6">
                            
                            {/* Top Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <IndianRupee size={18} />
                                        <span className="text-sm font-medium">Eligible Loan</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        ₹{Number(result.simulation.loan_amount).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Scheme: {result.simulation.scheme_name}</div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <TrendingUp size={18} />
                                        <span className="text-sm font-medium">Est. Monthly Revenue</span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-600">
                                        ₹{Number(result.simulation.monthly_revenue).toLocaleString('en-IN')}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                                        <Calculator size={18} />
                                        <span className="text-sm font-medium">Gross Margin</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {result.simulation.gross_margin_percentage}%
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Stats */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                                    <div className="p-6">
                                        <div className="text-sm text-gray-500 mb-1">Break-even Volume</div>
                                        <div className="text-xl font-bold">{result.simulation.break_even_customers} units/mo</div>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-sm text-gray-500 mb-1">Estimated EMI</div>
                                        <div className="text-xl font-bold">
                                            {result.simulation.repayment_schedule?.installments?.[result.simulation.repayment_schedule?.installments?.length - 1]?.total_installment 
                                                ? `₹${Number(result.simulation.repayment_schedule.installments[result.simulation.repayment_schedule.installments.length - 1].total_installment).toLocaleString('en-IN')}` 
                                                : 'N/A'
                                            }
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="text-sm text-gray-500 mb-1">Feasibility Score Override</div>
                                        <div className={`text-xl font-bold ${result.feasibility.is_feasible ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.feasibility.overall_score} / 100
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save Scenario Action */}
                            <div className="flex justify-end pt-4">
                                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors">
                                    <Save size={20} />
                                    {t('simulator.save_scenario', 'Save Scenario to Profile')}
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-400 text-right">
                                * Note: These are simulated estimates. Click 'Save Scenario' to permanently update your assessment.
                            </p>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
