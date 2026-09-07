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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('compare.title', 'Compare Businesses')}</h1>
                <p className="mt-2 text-gray-600">
                    {t('compare.subtitle', 'Select up to 3 business types to see a side-by-side feasibility comparison.')}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('compare.select_categories', 'Select Businesses (Max 3)')}
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
                        {t('compare.run_comparison', 'Run Comparison')}
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
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles size={100} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-purple-700 font-bold">
                                <Sparkles size={24} />
                                <h2 className="text-xl">AI Recommendation</h2>
                            </div>
                            
                            <p className="text-2xl font-bold text-gray-900">
                                Winner: <span className="text-primary">{data.ai_analysis.winner}</span>
                            </p>
                            
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-700">Why?</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {data.ai_analysis.reasons.map((reason: string, idx: number) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                                <span>Confidence: {(data.ai_analysis.confidence * 100).toFixed(0)}%</span>
                                <span>•</span>
                                <span>Based on deterministic scoring across {data.comparisons.length} options</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Matrix Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500 w-1/4">Metric</th>
                                    {data.comparisons.map((c: any) => (
                                        <th key={c.category} className="py-4 px-6 text-left text-lg font-bold text-gray-900 w-1/4">
                                            {getCategoryName(c.category)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Feasibility Score</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6">
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                                                c.feasibility.is_feasible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {c.feasibility.overall_score}/100
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Competitor Density</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm text-gray-600">
                                            {c.feasibility.dimensions.competition.factors.competitor_count} nearby<br/>
                                            <span className="text-xs text-gray-400">({c.feasibility.dimensions.competition.factors.density_per_sq_km.toFixed(2)} / sq km)</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Market Reach Score</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm text-gray-600">
                                            {c.feasibility.dimensions.market_reach.score}/100
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm font-medium text-gray-700">Risk Profile</td>
                                    {data.comparisons.map((c: any) => (
                                        <td key={c.category} className="py-4 px-6 text-sm font-medium">
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'LOW' && <span className="text-green-600">Low Risk</span>}
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'MEDIUM' && <span className="text-yellow-600">Medium Risk</span>}
                                            {c.feasibility.dimensions.risk.factors.category_risk_tier === 'HIGH' && <span className="text-red-600">High Risk</span>}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-gray-50/50">
                                    <td className="py-4 px-6 text-sm font-semibold text-gray-700">Financials (Constant across options)</td>
                                    <td colSpan={data.comparisons.length} className="py-4 px-6 text-sm text-gray-600">
                                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                                            <div><span className="font-medium">Project Cost:</span> ₹{Number(data.financials.feasible_project_cost).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium">Loan:</span> ₹{Number(data.financials.loan_amount).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium">Working Capital:</span> ₹{Number(data.financials.working_capital_estimate).toLocaleString('en-IN')}</div>
                                            <div><span className="font-medium">Scheme:</span> {data.financials.scheme.name}</div>
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
