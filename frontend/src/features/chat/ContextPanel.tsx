import { useTranslation } from 'react-i18next';
import { MapPin, Calculator, ShieldCheck, FileText } from 'lucide-react';

interface ContextPanelProps {
    report: any;
}

export default function ContextPanel({ report }: ContextPanelProps) {
    const { t } = useTranslation();

    if (!report) return null;

    const feasibilityScore = report.deterministic_data?.overall_score;
    const isFeasible = report.deterministic_data?.is_feasible;

    return (
        <div className="w-full bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {t('chat_context', 'Business Context')}
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Location Context */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                            <MapPin className="text-blue-500 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-medium text-gray-900">Target Area</h3>
                                <p className="text-sm text-gray-600">Within {report.deterministic_data?.dimensions?.market_reach?.factors?.project_size} radius</p>
                            </div>
                        </div>

                        {/* Financial Context */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3">
                            <Calculator className="text-purple-500 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-medium text-gray-900">Financial Setup</h3>
                                <p className="text-sm text-gray-600">Calculated externally</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Deterministic Feasibility
                    </h2>
                    
                    <div className={`p-4 rounded-xl shadow-sm border flex items-center justify-between ${
                        isFeasible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Calculated Score</p>
                            <h3 className={`text-3xl font-bold ${isFeasible ? 'text-green-700' : 'text-red-700'}`}>
                                {feasibilityScore} <span className="text-sm font-normal text-gray-500">/ 100</span>
                            </h3>
                        </div>
                        <ShieldCheck className={isFeasible ? 'text-green-500' : 'text-red-500'} size={32} />
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Data Sources & Assumptions
                    </h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-600 space-y-2">
                        <div className="flex items-start gap-2">
                            <FileText size={16} className="mt-0.5 shrink-0" />
                            <p>{report.ai_analysis?.data_quality?.confidence_note || "Data bound to hyper-local search."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
