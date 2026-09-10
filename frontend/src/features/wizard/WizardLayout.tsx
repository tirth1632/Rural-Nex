import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createProposal, getProposal, updateProposal } from '../../api/wizard';
import { useLocation, useNavigate } from 'react-router-dom';

import Step1Welcome from './Step1Welcome';
import Step2Location from './Step2Location';
import Step3Margin from './Step3Margin';
import Step4Category from './Step4Category';
import Step6Details from './Step6Details';
import Step7to9Analysis from './Step7to9Analysis';
import Step10to11Recommendation from './Step10to11Recommendation';

export default function WizardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // We can pass `?id=X` in URL to resume an assessment
    const searchParams = new URLSearchParams(location.search);
    const existingId = searchParams.get('id');

    const [proposalId, setProposalId] = useState<number | null>(existingId ? Number(existingId) : null);
    const [step, setStep] = useState(1);
    const [draftData, setDraftData] = useState<any>({});

    const createMutation = useMutation({
        mutationFn: createProposal,
        onSuccess: (data) => {
            setProposalId(data.id);
            setStep(2);
            // push state to URL so we can refresh
            navigate(`?id=${data.id}`, { replace: true });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateProposal(proposalId!, data)
    });

    const { data: fetchedData } = useQuery({
        queryKey: ['proposal', proposalId],
        queryFn: () => getProposal(proposalId!),
        enabled: !!proposalId,
    });

    useEffect(() => {
        if (fetchedData) {
            setDraftData(fetchedData);
            if (fetchedData.current_step && !existingId) {
                // Only jump if we just created it or are deliberately resuming
                setStep(fetchedData.current_step);
            }
        }
    }, [fetchedData, existingId]);

    // Check for pre-filled data from GeoSpatial Map ("Run Full Assessment")
    useEffect(() => {
        try {
            const prefillRaw = sessionStorage.getItem('ruralnex_assessment_prefill');
            if (prefillRaw && !existingId) {
                const prefill = JSON.parse(prefillRaw);
                setDraftData((prev: any) => ({
                    ...prev,
                    state_name: prefill.state,
                    district_name: prefill.district,
                    village_name: prefill.area,
                    category_name: prefill.businessCategory,
                    specific_business: prefill.businessCategory,
                    formatted_address: `${prefill.area}, ${prefill.district}, ${prefill.state}`,
                }));
                sessionStorage.removeItem('ruralnex_assessment_prefill');
            }
        } catch (e) {
            console.warn('Could not read assessment prefill', e);
        }
    }, [existingId]);

    const handleNext = async (stepData: any) => {
        const nextStep = step + 1;
        const payload = { ...stepData, current_step: nextStep };
        
        setDraftData((prev: Record<string, any>) => ({ ...prev, ...payload }));
        setStep(nextStep);

        if (proposalId) {
            updateMutation.mutate(payload);
        } else if (step === 1) {
            createMutation.mutate();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            const prevStep = step - 1;
            setStep(prevStep);
            if (proposalId) {
                updateMutation.mutate({ current_step: prevStep });
            }
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step1Welcome onNext={() => createMutation.mutate()} />;
            case 2: return <Step2Location data={draftData} onNext={handleNext} onBack={handleBack} />;
            case 3: return <Step3Margin data={draftData} onNext={handleNext} onBack={handleBack} />;
            case 4: return <Step4Category data={draftData} onNext={handleNext} onBack={handleBack} />;
            case 5: return <Step6Details data={draftData} onNext={handleNext} onBack={handleBack} />;
            case 6: return <Step7to9Analysis proposalId={proposalId!} onNext={() => setStep(7)} />;
            case 7: return <Step10to11Recommendation proposalId={proposalId!} />;
            default: return <div>Unknown Step</div>;
        }
    };

    // Note: To match the 11 logical steps but keep the UI clean, 
    // we grouped 7-9 into an Analysis loading screen, 
    // and 10-11 into the final AI rendering screen.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h1 className="font-bold text-xl text-gray-900">Business Assessment</h1>
                <div className="text-sm text-gray-500 font-medium">Step {step} of 7</div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 w-full bg-gray-100">
                <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(step / 7) * 100}%` }}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}
