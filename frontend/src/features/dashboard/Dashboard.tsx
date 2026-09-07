import { useQuery } from '@tanstack/react-query';
import { getLatestAssessment } from '../../api/dashboard';
import { useNavigate } from 'react-router-dom';
import { 
    PlusCircle, 
    ShieldCheck, 
    Store, 
    Wallet, 
    Banknote, 
    FileSignature, 
    CalendarClock, 
    Users, 
    TrendingUp, 
    AlertTriangle 
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';

import { useTranslation } from 'react-i18next';

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: assessment, isLoading } = useQuery({
        queryKey: ['latestAssessment'],
        queryFn: getLatestAssessment
    });

    if (isLoading) {
        return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!assessment || !assessment.analysis_runs || assessment.analysis_runs.length === 0) {
        return (
            <div className="p-8 md:p-12 max-w-4xl mx-auto text-center mt-20">
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Store className="text-primary w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{t('dashboard_empty_title')}</h2>
                    <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
                        {t('dashboard_empty_subtitle')}
                    </p>
                    <button 
                        onClick={() => navigate('/wizard')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                        <PlusCircle size={24} />
                        {t('dashboard_start_assessment')}
                    </button>
                </div>
            </div>
        );
    }

    // Extract data from the complex nested payload safely
    const fin = assessment.financial_assessment || {};
    const report = assessment.analysis_runs[0]?.report || {};
    const scoringData = report.scoring_data || {};
    const dimensions = scoringData.dimensions || {};

    const formatINR = (val: number | string) => {
        if (!val) return '₹0';
        return `₹${parseFloat(val.toString()).toLocaleString('en-IN')}`;
    };

    // Recharts Data Prep
    const radarData = [
        { subject: 'Competition', A: dimensions.competition?.score || 0, fullMark: 100 },
        { subject: 'Market Reach', A: dimensions.market_reach?.score || 0, fullMark: 100 },
        { subject: 'Opportunity', A: dimensions.opportunity?.score || 0, fullMark: 100 },
        { subject: 'Risk Level', A: dimensions.risk?.score || 0, fullMark: 100 },
        { subject: 'Pricing', A: dimensions.pricing?.score || 0, fullMark: 100 },
    ];

    const pieData = [
        { name: 'Your Margin', value: parseFloat(assessment.margin_capital || '0') },
        { name: 'Bank Loan', value: parseFloat(fin.loan_amount || '0') },
    ];
    const PIE_COLORS = ['#3b82f6', '#10b981'];

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard_latest_assessment')}</h1>
                    <p className="text-gray-500">{assessment.category?.name || 'Business'}</p>
                </div>
                <button 
                    onClick={() => navigate('/wizard')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <PlusCircle size={20} />
                    {t('dashboard_start_assessment')}
                </button>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${report.is_feasible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard_score')}</p>
                        <h3 className={`text-2xl font-bold ${report.is_feasible ? 'text-green-700' : 'text-red-700'}`}>
                            {report.overall_score || 'N/A'} <span className="text-sm font-normal text-gray-500">/ 100</span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        <Store size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard_recommended')}</p>
                        <h3 className="text-xl font-bold text-gray-900">{assessment.category?.name || 'N/A'}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{t('dashboard_project_cost')}</p>
                        <h3 className="text-xl font-bold text-gray-900">{formatINR(fin.feasible_project_cost)}</h3>
                    </div>
                </div>
            </div>

            {/* Financial & Market Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { title: t('dashboard_loan'), value: formatINR(fin.loan_amount), icon: Banknote, color: 'text-emerald-600' },
                    { title: t('dashboard_scheme'), value: 'MUDRA / PMEGP', icon: FileSignature, color: 'text-indigo-600' },
                    { title: t('dashboard_emi'), value: 'Calculate ->', icon: CalendarClock, color: 'text-orange-600' },
                    { title: t('dashboard_competitors'), value: dimensions.competition?.score > 50 ? 'Low' : 'High', icon: Users, color: 'text-rose-600' },
                    { title: t('dashboard_opportunity'), value: `${dimensions.opportunity?.score || 0}/100`, icon: TrendingUp, color: 'text-teal-600' },
                    { title: t('dashboard_risk'), value: dimensions.risk?.factors?.category_risk || 'Medium', icon: AlertTriangle, color: 'text-amber-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <stat.icon size={24} className={stat.color} />
                    </div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Feasibility Dimensions</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                                <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Breakdown</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatINR(Number(value || 0))} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
