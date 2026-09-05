import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProposal } from '../../api/wizard';
import { triggerReportGeneration, downloadReport } from '../../api/reports';
import { CheckCircle, AlertTriangle, ShieldCheck, Download, Loader2 } from 'lucide-react';
import ChatLayout from '../chat/ChatLayout'; // Reuse the chat interface we built
import { useTranslation } from 'react-i18next';

export default function Step10to11Recommendation({ proposalId }: { proposalId: number }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const { t } = useTranslation();

    // We fetch the final proposal which now has the report attached
    const { data: proposal, isLoading } = useQuery({
        queryKey: ['proposal', proposalId],
        queryFn: () => getProposal(proposalId),
        refetchInterval: (data: any) => data?.analysis_runs?.[0]?.report ? false : 2000 // poll if report isn't ready
    });

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await triggerReportGeneration(proposalId); // ensure it's ready
            await downloadReport(proposalId); // actually download
        } catch (err) {
            console.error("Failed to download PDF", err);
            alert("Failed to generate PDF report.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading || !proposal) {
        return <div className="text-center py-20 text-gray-500">Loading final report...</div>;
    }

    const run = proposal.analysis_runs?.[0];
    const report = run?.report;

    if (!report) {
        return <div className="text-center py-20 text-gray-500 animate-pulse">Waiting for report generation to finalize...</div>;
    }

    const aiSummary = report.executive_summary;
    const isFeasible = report.is_feasible;
    const score = parseFloat(report.overall_score);

    return (
        <div className="space-y-8 pb-20">
            {/* Executive Summary Banner */}
            <div className={`p-8 rounded-2xl border shadow-sm ${
                isFeasible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
                <div className="flex items-start gap-4">
                    {isFeasible ? (
                        <ShieldCheck className="text-green-600 w-12 h-12 shrink-0" />
                    ) : (
                        <AlertTriangle className="text-red-600 w-12 h-12 shrink-0" />
                    )}
                    <div>
                        <h2 className={`text-2xl font-bold mb-2 ${isFeasible ? 'text-green-900' : 'text-red-900'}`}>
                            {isFeasible ? 'Business Recommended' : 'High Risk / Not Recommended'}
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                            <div className="bg-white/60 px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                                {t('dashboard_score')}: {score.toFixed(0)}/100
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 text-gray-800"
                            >
                                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {isDownloading ? t('saving') : t('wizard_step10_download')}
                            </button>
                        </div>
                        <p className={`text-lg leading-relaxed ${isFeasible ? 'text-green-800' : 'text-red-800'}`}>
                            {aiSummary || "The deterministic engine has completed its calculation based on local market data and scheme constraints."}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Advisor Chat Interface */}
            {/* Note: In a true prod build, ChatLayout would be refactored slightly to accept the proposalId and fetch its own context.
                For the scope of this wizard, we embed it below so the user can immediately talk to the AI about this specific report. 
            */}
            <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">{t('wizard_step10_title')}</h2>
            <div className="border rounded-xl overflow-hidden shadow-lg h-[600px]">
                <ChatLayout />
            </div>
            
            <div className="text-center">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-2 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors mt-8"
                >
                    Return to {t('nav_dashboard')}
                </button>
            </div>
        </div>
    );
}
