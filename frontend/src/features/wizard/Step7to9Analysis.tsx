import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeProposal, recommendProposal } from '../../api/wizard';
import { Loader2, Calculator, Brain } from 'lucide-react';

export default function Step7to9Analysis({ proposalId, onNext }: { proposalId: number, onNext: () => void }) {
    const [status, setStatus] = useState<string>("Calculating financial eligibility...");
    
    // We execute Analyze (Finance + Market Feasibility), then Recommend (AI) sequentially
    const analyzeMutation = useMutation({
        mutationFn: () => analyzeProposal(proposalId),
        onSuccess: () => {
            setStatus("Generating AI Advisory Report...");
            recommendMutation.mutate();
        },
        onError: (err) => {
            setStatus(`Analysis Failed: ${err.message}`);
        }
    });

    const recommendMutation = useMutation({
        mutationFn: () => recommendProposal(proposalId),
        onSuccess: () => {
            setStatus("Complete! Redirecting...");
            setTimeout(() => onNext(), 1000);
        },
        onError: (err) => {
            setStatus(`AI Generation Failed: ${err.message}`);
        }
    });

    useEffect(() => {
        // Kick off the chain on mount
        analyzeMutation.mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isError = analyzeMutation.isError || recommendMutation.isError;

    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
                {isError ? (
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-500 text-3xl font-bold">!</span>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl relative z-10">
                            {analyzeMutation.isPending && <Calculator className="text-primary w-10 h-10 animate-pulse" />}
                            {recommendMutation.isPending && <Brain className="text-purple-500 w-10 h-10 animate-pulse" />}
                            {recommendMutation.isSuccess && <Loader2 className="text-green-500 w-10 h-10 animate-spin" />}
                        </div>
                    </>
                )}
            </div>

            <div className="text-center space-y-2 max-w-md">
                <h2 className={`text-2xl font-bold ${isError ? 'text-red-600' : 'text-gray-900'}`}>
                    {status}
                </h2>
                {!isError && (
                    <p className="text-gray-500 text-sm">
                        Our deterministic engines are evaluating your margins against government scheme caps, and checking hyper-local competitor density.
                    </p>
                )}
            </div>
            
            {isError && (
                <button 
                    onClick={() => analyzeMutation.mutate()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Retry Analysis
                </button>
            )}
        </div>
    );
}
