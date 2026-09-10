import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, RefreshCw } from 'lucide-react';

import { StepHeader } from './components/StepHeader';
import { Step1Promoter, type PromoterData } from './components/Step1Promoter';
import { Step2Business } from './components/Step2Business';
import { Step3CostBuilder } from './components/Step3CostBuilder';
import { Step4CapitalFunding, type FundingData } from './components/Step4CapitalFunding';
import { Step5SchemeMatching } from './components/Step5SchemeMatching';
import { Step6LoanCalculator, type LoanInputs } from './components/Step6LoanCalculator';
import { Step7Forecast, type ForecastInputs } from './components/Step7Forecast';
import { Step8FeasibilityDashboard } from './components/Step8FeasibilityDashboard';
import { BankDPRView, type SavedAssessmentRecord } from './components/BankDPRView';

const STORAGE_KEY_ASSESSMENTS = 'ruralnex_saved_assessments_list_v1';

const loadSavedAssessments = (): SavedAssessmentRecord[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ASSESSMENTS) : null;
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load saved assessments list:', e);
  }
  return [];
};

import type { DatasetBusiness } from '../../services/businessDataService';
import {
  calculateCapExTotals,
  calculateFundingWaterfall,
  calculateAmortization,
  calculate5YearForecast,
  calculateFinancialMetrics,
  runSensitivityAnalysis,
  type CapExItem
} from './services/financialEngine';
import { saveFinancialPlan } from '../../api/financialPlan';

class StepErrorBoundary extends React.Component<
  { children: React.ReactNode; stepName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; stepName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error caught in ${this.props.stepName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0c0d10] border border-red-200 dark:border-red-900/50 text-center space-y-4 max-w-xl mx-auto shadow-lg my-12">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            An issue occurred loading {this.props.stepName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {this.state.error?.message || 'A temporary component rendering issue occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 cursor-pointer shadow-xs"
          >
            Retry Step View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const STORAGE_KEY = 'ruralnex_financial_plan_draft_v2';

const loadSavedDraft = () => {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sanitize legacy state mismatch if Andhra Pradesh was stored with Ahmedabad district
      if (parsed.promoter && parsed.promoter.state === 'Andhra Pradesh' && parsed.promoter.district === 'Ahmedabad') {
        parsed.promoter.state = 'Gujarat';
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load draft synchronously:', e);
  }
  return null;
};

export const FinancialPlanPage: React.FC = () => {
  const initialSavedRecords = loadSavedAssessments();
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessmentRecord[]>(initialSavedRecords);
  const [currentStep, setCurrentStep] = useState<number>(() => (initialSavedRecords.length > 0 ? 9 : 1));
  const [initialDprTab, setInitialDprTab] = useState<'report' | 'portfolio'>(() => (initialSavedRecords.length > 0 ? 'portfolio' : 'report'));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Load draft synchronously on initial render
  const initialDraft = loadSavedDraft();

  // 1. Promoter & Location State
  const [promoter, setPromoter] = useState<PromoterData>(() => initialDraft?.promoter || {
    name: 'Rural Entrepreneur',
    age: 30,
    gender: 'male',
    socialCategory: 'general',
    specialCategory: 'none',
    education: '12th Pass',
    experienceYears: 3,
    projectStage: 'new',
    state: 'Gujarat',
    district: 'Ahmedabad',
    block: 'Daskroi Taluka',
    village: 'Geratpur Settlement',
    areaType: 'rural'
  });

  // 2. Business Selection State
  const [selectedBusiness, setSelectedBusiness] = useState<DatasetBusiness | null>(() => initialDraft?.selectedBusiness || null);

  // 3. CapEx Line Items State (Single Source of Truth)
  const [capexItems, setCapexItems] = useState<CapExItem[]>(() => initialDraft?.capexItems || [
    { id: 'item_init_1', category: 'building_civil', name: 'Workshed / Premises Construction', quantity: 1, unit: 'sq.ft', unit_cost: 0, total_amount: 0 },
    { id: 'item_init_2', category: 'plant_machinery', name: 'Primary Operational Machinery', quantity: 1, unit: 'units', unit_cost: 0, total_amount: 0 }
  ]);

  // 4. Capital & Funding State
  const [funding, setFunding] = useState<FundingData>(() => initialDraft?.funding || {
    ownContribution: 100000,
    partnerEquity: 0,
    workingCapitalReserve: 50000,
    otherSupport: 0,
    estimatedSubsidy: 0
  });

  // 5. Selected Scheme State
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  // 6. Loan Parameters State
  const [loanInputs, setLoanInputs] = useState<LoanInputs>(() => initialDraft?.loanInputs || {
    loanAmount: 450000,
    interestRatePct: 9.5,
    tenureYears: 5,
    moratoriumMonths: 3
  });

  // 7. Forecast Inputs State
  const [forecastInputs, setForecastInputs] = useState<ForecastInputs>(() => initialDraft?.forecastInputs || {
    baseMonthlyRevenue: 120000,
    baseMonthlyOpEx: 70000,
    revenueGrowthPct: 5,
    expenseGrowthPct: 4,
    taxRatePct: 15
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => initialDraft?.completedSteps || []);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => initialDraft?.lastSavedTime || '');

  // Auto-persist wizard draft to LocalStorage whenever any step data updates
  useEffect(() => {
    try {
      const payload = {
        promoter,
        selectedBusiness,
        capexItems,
        funding,
        loanInputs,
        forecastInputs,
        completedSteps,
        lastSavedTime: lastSavedTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Auto-persist draft error:', e);
    }
  }, [promoter, selectedBusiness, capexItems, funding, loanInputs, forecastInputs, completedSteps]);

  // Recalculate Project Cost & Debt Requirement whenever CapEx / Funding changes
  const capexTotals = calculateCapExTotals(capexItems);

  useEffect(() => {
    const waterfall = calculateFundingWaterfall(
      capexTotals.totalProjectCost,
      funding.ownContribution,
      funding.partnerEquity,
      funding.estimatedSubsidy,
      funding.otherSupport
    );
    setLoanInputs(prev => ({
      ...prev,
      loanAmount: waterfall.financingRequirement
    }));
  }, [capexTotals.totalProjectCost, funding.ownContribution, funding.partnerEquity, funding.estimatedSubsidy]);

  // Financial Engine Computations
  const amortizationSummary = calculateAmortization({
    principal: loanInputs.loanAmount,
    annualRatePct: loanInputs.interestRatePct,
    tenureMonths: loanInputs.tenureYears * 12,
    moratoriumMonths: loanInputs.moratoriumMonths
  });

  const yearForecast = calculate5YearForecast(
    forecastInputs,
    amortizationSummary,
    capexTotals.totalProjectCost,
    Math.max(5, Math.ceil(loanInputs.tenureYears || 5))
  );

  const financialRatios = calculateFinancialMetrics(
    capexTotals.totalProjectCost,
    funding.ownContribution + funding.partnerEquity,
    loanInputs.loanAmount,
    yearForecast,
    forecastInputs.baseMonthlyRevenue,
    forecastInputs.baseMonthlyOpEx
  );

  const sensitivityMatrix = runSensitivityAnalysis(
    forecastInputs.baseMonthlyRevenue,
    forecastInputs.baseMonthlyOpEx,
    capexTotals.totalProjectCost,
    funding.ownContribution + funding.partnerEquity,
    loanInputs.loanAmount,
    amortizationSummary
  );

  // Auto-Save Handler
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const payload = {
      promoter,
      selectedBusiness,
      capexItems,
      funding,
      loanInputs,
      forecastInputs,
      completedSteps,
      lastSavedTime: nowStr
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      await saveFinancialPlan(payload).catch(() => null); // Silent fallback if API unavail
      setSaveStatus('saved');
      setLastSavedTime(nowStr);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('idle');
    }
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const handleFinishAndSave = async () => {
    markStepComplete(8);
    markStepComplete(9);
    await handleSaveDraft();

    const nowStr = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const record: SavedAssessmentRecord = {
      id: `assess_${Date.now()}`,
      title: `${selectedBusiness?.name || 'Rural Enterprise'} - ${promoter.village || promoter.district || 'Location'}, ${promoter.state || 'India'}`,
      businessName: selectedBusiness?.name || 'Rural Enterprise',
      location: `${promoter.village ? promoter.village + ', ' : ''}${promoter.district ? promoter.district + ', ' : ''}${promoter.state || 'Gujarat'}`,
      dateSaved: nowStr,
      totalProjectCost: capexTotals.totalProjectCost,
      debtAmount: loanInputs.loanAmount,
      promoterEquity: funding.ownContribution + funding.partnerEquity,
      verdict: financialRatios.feasibilityVerdict,
      score: financialRatios.verdictScore,
      minDSCR: financialRatios.minDSCR,
      breakEvenMonths: financialRatios.breakEvenMonths,
      roiPct: financialRatios.roiPct,
      paybackPeriodYears: financialRatios.paybackPeriodYears,
      snapshot: {
        promoter,
        selectedBusiness,
        capexItems,
        funding,
        loanInputs,
        forecastInputs,
        selectedScheme,
        completedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      }
    };

    try {
      const currentList = loadSavedAssessments();
      const existingIdx = currentList.findIndex(a => a.businessName === record.businessName && a.location === record.location);
      let updated: SavedAssessmentRecord[];
      if (existingIdx >= 0) {
        updated = [...currentList];
        updated[existingIdx] = record;
      } else {
        updated = [record, ...currentList];
      }
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(updated));
      setSavedAssessments(updated);
    } catch (e) {
      console.warn('Failed to save assessment to list:', e);
    }

    setCurrentStep(9);
  };

  const handleLoadAssessmentRecord = (record: SavedAssessmentRecord) => {
    if (record.snapshot) {
      if (record.snapshot.promoter) setPromoter(record.snapshot.promoter);
      if (record.snapshot.selectedBusiness) setSelectedBusiness(record.snapshot.selectedBusiness);
      if (record.snapshot.capexItems) setCapexItems(record.snapshot.capexItems);
      if (record.snapshot.funding) setFunding(record.snapshot.funding);
      if (record.snapshot.loanInputs) setLoanInputs(record.snapshot.loanInputs);
      if (record.snapshot.forecastInputs) setForecastInputs(record.snapshot.forecastInputs);
      if (record.snapshot.selectedScheme) setSelectedScheme(record.snapshot.selectedScheme);
      if (record.snapshot.completedSteps) setCompletedSteps(record.snapshot.completedSteps);
    }
  };

  const handleDeleteAssessmentRecord = (id: string) => {
    try {
      const currentList = loadSavedAssessments();
      const filtered = currentList.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(filtered));
      setSavedAssessments(filtered);
    } catch (e) {
      console.warn('Failed to delete saved assessment:', e);
    }
  };

  const handleStartNewAssessment = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear draft key:', e);
    }

    setPromoter({
      name: 'Rural Entrepreneur',
      age: 30,
      gender: 'male',
      socialCategory: 'general',
      specialCategory: 'none',
      education: '12th Pass',
      experienceYears: 3,
      projectStage: 'new',
      state: 'Gujarat',
      district: 'Ahmedabad',
      block: '',
      village: '',
      areaType: 'rural'
    });
    setSelectedBusiness(null);
    setCapexItems([
      { id: `item_init_1_${Date.now()}`, category: 'building_civil', name: 'Workshed / Premises Construction', quantity: 1, unit: 'sq.ft', unit_cost: 0, total_amount: 0 },
      { id: `item_init_2_${Date.now()}`, category: 'plant_machinery', name: 'Primary Operational Machinery', quantity: 1, unit: 'units', unit_cost: 0, total_amount: 0 }
    ]);
    setFunding({
      ownContribution: 100000,
      partnerEquity: 0,
      workingCapitalReserve: 50000,
      otherSupport: 0,
      estimatedSubsidy: 0
    });
    setSelectedScheme(null);
    setLoanInputs({
      loanAmount: 450000,
      interestRatePct: 9.5,
      tenureYears: 5,
      moratoriumMonths: 3
    });
    setForecastInputs({
      baseMonthlyRevenue: 120000,
      baseMonthlyOpEx: 70000,
      revenueGrowthPct: 5,
      expenseGrowthPct: 4,
      taxRatePct: 15
    });
    setCompletedSteps([]);
    setLastSavedTime('');
    setSaveStatus('idle');
    setInitialDprTab('report');
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    markStepComplete(currentStep);
    setCurrentStep(prev => Math.min(9, prev + 1));
    handleSaveDraft();
  };

  const handleBackStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070709] text-gray-900 dark:text-white flex flex-col font-sans">
      {/* Top Header Navigation */}
      {currentStep !== 9 && (
        <StepHeader
          currentStep={currentStep}
          totalSteps={9}
          onSelectStep={step => setCurrentStep(step)}
          completedSteps={completedSteps}
        />
      )}

      {/* Auto-save Toolbar */}
      {currentStep !== 9 && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-3 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 dark:text-zinc-200">
              {promoter.village || promoter.district || 'Location'}, {promoter.state || 'India'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {selectedBusiness?.name || 'Enterprise'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Save size={13} /> Save Draft
            </button>

            {saveStatus === 'saving' && <span className="text-amber-500 font-semibold flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Saving...</span>}
            {saveStatus === 'saved' && <span className="text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Saved ({lastSavedTime})</span>}
          </div>
        </div>
      )}

      {/* Main Wizard Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <StepErrorBoundary key={currentStep} stepName={`Step ${currentStep}`}>
          {currentStep === 1 && (
            <Step1Promoter
              data={promoter}
              onChange={upd => setPromoter(prev => ({ ...prev, ...upd }))}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <Step2Business
              selectedBusinessCode={selectedBusiness?.code || ''}
              onSelectBusiness={biz => setSelectedBusiness(biz)}
              onNext={handleNextStep}
              onBack={handleBackStep}
              selectedState={promoter.state}
              selectedDistrict={promoter.district}
              selectedBlock={promoter.block}
              selectedVillage={promoter.village}
            />
          )}

          {currentStep === 3 && (
            <Step3CostBuilder
              items={capexItems}
              onUpdateItems={items => setCapexItems(items)}
              onNext={handleNextStep}
              onBack={handleBackStep}
              businessCategoryOrName={selectedBusiness?.name || selectedBusiness?.category || ''}
              selectedLocationText={[promoter.village, promoter.block, promoter.district, promoter.state].filter(Boolean).join(', ')}
            />
          )}

          {currentStep === 4 && (
            <Step4CapitalFunding
              totalProjectCost={capexTotals.totalProjectCost}
              totalCapEx={capexTotals.totalCapEx}
              totalWorkingCapital={capexTotals.totalWorkingCapital}
              funding={funding}
              onChange={upd => setFunding(prev => ({ ...prev, ...upd }))}
              onNext={handleNextStep}
              onBack={handleBackStep}
              onGoToStep3={() => setCurrentStep(3)}
              selectedLocationText={[promoter.village, promoter.block, promoter.district, promoter.state].filter(Boolean).join(', ')}
              businessCategoryOrName={selectedBusiness?.name || selectedBusiness?.category || ''}
            />
          )}

          {currentStep === 5 && (
            <Step5SchemeMatching
              projectCost={capexTotals.totalProjectCost}
              businessCode={selectedBusiness?.code || ''}
              promoterProfile={promoter}
              locationData={promoter}
              selectedSchemeRuleId={selectedScheme?.rule_id}
              onSelectScheme={scheme => {
                setSelectedScheme(scheme);
                if (scheme) {
                  setFunding(prev => ({ ...prev, estimatedSubsidy: scheme.estimated_subsidy_amount }));
                } else {
                  setFunding(prev => ({ ...prev, estimatedSubsidy: 0 }));
                }
              }}
              onNext={handleNextStep}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 6 && (
            <Step6LoanCalculator
              loanInputs={loanInputs}
              onChange={upd => setLoanInputs(prev => ({ ...prev, ...upd }))}
              onNext={handleNextStep}
              onBack={handleBackStep}
              amortizationSummary={amortizationSummary}
            />
          )}

          {currentStep === 7 && (
            <Step7Forecast
              inputs={forecastInputs}
              onChange={upd => setForecastInputs(prev => ({ ...prev, ...upd }))}
              onNext={handleNextStep}
              onBack={handleBackStep}
              forecast={yearForecast}
            />
          )}

          {currentStep === 8 && (
            <Step8FeasibilityDashboard
              ratios={financialRatios}
              sensitivity={sensitivityMatrix}
              onGenerateDPR={() => {
                markStepComplete(8);
                setCurrentStep(9);
              }}
              onFinishAndSave={handleFinishAndSave}
              onBack={handleBackStep}
            />
          )}

          {currentStep === 9 && (
            <BankDPRView
              promoter={promoter}
              business={selectedBusiness}
              items={capexItems}
              funding={funding}
              amortization={amortizationSummary}
              forecast={yearForecast}
              ratios={financialRatios}
              sensitivity={sensitivityMatrix}
              selectedScheme={selectedScheme}
              onBack={() => setCurrentStep(8)}
              onFinishAndSave={handleFinishAndSave}
              lastSavedTime={lastSavedTime}
              savedAssessments={savedAssessments}
              onLoadAssessment={handleLoadAssessmentRecord}
              onDeleteAssessment={handleDeleteAssessmentRecord}
              onStartNewAssessment={handleStartNewAssessment}
              initialTab={initialDprTab}
            />
          )}
        </StepErrorBoundary>
      </main>
    </div>
  );
};

export default FinancialPlanPage;
