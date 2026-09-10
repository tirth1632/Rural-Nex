import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { compareBusinesses } from '../../api/compare';
import { useQuery } from '@tanstack/react-query';
import { MapPin, IndianRupee, Loader2, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BusinessCompare() {
    const { t } = useTranslation();
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    
    // Mock user context (ideally from a global state or previous assessments)
    const [lat, setLat] = useState(28.6139);
    const [lng, setLng] = useState(77.2090);
    const [marginCapital, setMarginCapital] = useState(50000);
    const [shouldFetch, setShouldFetch] = useState(false);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/v1/advisory/categories/');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        staleTime: Infinity
    });

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(catId)) return prev.filter(id => id !== catId);
            if (prev.length >= 3) return prev;
            return [...prev, catId];
        });
        setShouldFetch(false);
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['compare', lat, lng, marginCapital, selectedCategories],
        queryFn: () => compareBusinesses(lat, lng, 5.0, marginCapital, selectedCategories),
        enabled: shouldFetch && selectedCategories.length > 0,
        staleTime: Infinity
    });

    const handleCompare = () => {
        if (selectedCategories.length > 0) {
            setShouldFetch(true);
            refetch();
        }
    };

    const getCategoryName = (id: string) => {
        return categories.find((c: any) => c.id.toString() === id.toString())?.name || id;
    };

    return (
        <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('compare_title', 'Compare Businesses')}</h1>
                <p className="mt-2 text-gray-600 dark:text-neutral-400">
                    {t('compare_subtitle', 'Select up to 3 business types to see a side-by-side feasibility comparison.')}
                </p>
            </div>

            {/* Inputs Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('compare.margin_capital', 'Your Available Capital (₹)')}
                        </label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                value={marginCapital}
                                onChange={(e) => { setMarginCapital(Number(e.target.value)); setShouldFetch(false); }}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('compare.location', 'Location (Lat/Lng)')}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="number" value={lat} onChange={e => {setLat(Number(e.target.value)); setShouldFetch(false);}} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                            </div>
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input type="number" value={lng} onChange={e => {setLng(Number(e.target.value)); setShouldFetch(false);}} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                        {t('compare_choose_hint', 'Select Businesses (Max 3)')}
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat: any) => {
                            const isSelected = selectedCategories.includes(cat.id);
                            const isDisabled = !isSelected && selectedCategories.length >= 3;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    disabled={isDisabled}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                        isSelected 
                                        ? 'bg-primary border-primary text-white' 
                                        : isDisabled 
                                            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary/50'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={handleCompare}
                        disabled={selectedCategories.length === 0 || isLoading}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                        {t('compare_button', 'Run Comparison')}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p>Failed to generate comparison. Please try again.</p>
                </div>
            )}

            {/* Results Section */}
            {data && (
                <div className="space-y-8 animate-fade-in">
                    {/* AI Recommendation Banner */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5">
                            <Sparkles size={100} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                                <Sparkles size={24} />
                                <h2 className="text-xl">AI Recommendation</h2>
                            </div>
                            
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                Winner: <span className="text-primary">{data.ai_analysis.winner}</span>
                            </p>
                            
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-700 dark:text-zinc-200">Why?</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-zinc-400">
                                    {data.ai_analysis.reasons.map((reason: string, idx: number) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mt-4">
                                <span>Confidence: {(data.ai_analysis.confidence * 100).toFixed(0)}%</span>
                                <span>•</span>
                                <span>Based on deterministic scoring across {data.comparisons.length} options</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Matrix Table */}
                    <div className="bg-white dark:bg-zinc-900/90 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-zinc-800">
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500 dark:text-zinc-400 w-1/4">Metric</th>
                                    {data.comparisons.map((c: any) => (
                                        <th key={c.category} className="py-4 px-6 text-left text-lg font-bold text-gray-900 dark:text-white w-1/4">
                                            {getCategoryName(c.category)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-neutral-300">{t('compare_feasibility', 'Feasibility Score')}</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                                                c.feasibility.is_feasible ? 'bg-green-100 dark:bg-emerald-950/80 text-green-700 dark:text-emerald-300 border border-green-200 dark:border-emerald-800/60' : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                                            }`}>
                                                {c.feasibility.overall_score}/100
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-neutral-300">{t('compare_competition', 'Competitor Density')}</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm text-gray-600 dark:text-neutral-400">
                                            {c.feasibility.dimensions.competition.factors.competitor_count} nearby<br/>
                                            <span className="text-xs text-gray-400 dark:text-neutral-500">({c.feasibility.dimensions.competition.factors.density_per_sq_km.toFixed(2)} / sq km)</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-neutral-300">{t('compare_demand', 'Market Reach Score')}</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm text-gray-600 dark:text-neutral-400">
                                            {c.feasibility.dimensions.market_reach.score}/100
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700 dark:text-neutral-300">Risk Profile</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm font-medium">
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'LOW' && <span className="text-green-600 dark:text-emerald-400">Low Risk</span>}
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'MEDIUM' && <span className="text-yellow-600 dark:text-amber-400">Medium Risk</span>}
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'HIGH' && <span className="text-red-600 dark:text-rose-400">High Risk</span>}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-gray-50/50 dark:bg-zinc-950/60">
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-700 dark:text-zinc-300">Financials (Constant across options)</td>
                                    <td colSpan={data.comparisons.length} className="py-4 px-6 text-sm text-gray-600 dark:text-zinc-400">
                                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                                            <div><span className="font-medium text-gray-900 dark:text-white">Project Cost:</span> ₹{Number(data.financials.feasible_project_cost).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium text-gray-900 dark:text-white">Loan:</span> ₹{Number(data.financials.loan_amount).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium text-gray-900 dark:text-white">Working Capital:</span> ₹{Number(data.financials.working_capital_estimate).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium text-gray-900 dark:text-white">Scheme:</span> {data.financials.scheme.name}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
