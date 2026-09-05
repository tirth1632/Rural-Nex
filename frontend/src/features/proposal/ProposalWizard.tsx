import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportDashboard from '../reports/ReportDashboard';

// Define the shape of our mock result
interface FinancialResult {
  scheme_name: string;
  feasible_project_cost: number;
  loan_amount: number;
  cap_constrained: boolean;
}

const ProposalWizard = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    village: '',
    block: '',
    district: '',
    margin_capital: '',
    category: ''
  });
  
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null);

  const handleNext = async () => {
    if (step === 1) {
      try {
        const mockResult: FinancialResult = {
          scheme_name: 'Micro Finance Scheme',
          feasible_project_cost: Number(formData.margin_capital) * 10,
          loan_amount: Number(formData.margin_capital) * 9,
          cap_constrained: false
        };
        setFinancialResult(mockResult);
        setStep(2);
      } catch (e) {
        console.error(e);
      }
    } else if (step === 2) {
      setStep(3);
      // Simulate loading report
      setTimeout(() => setStep(4), 2500);
    }
  };

  if (step === 4) {
    return <ReportDashboard />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm border mt-10">
      <h2 className="text-2xl font-semibold mb-6">{t('wizard_title')}</h2>
      
      {/* Step Indicator */}
      <div className="flex space-x-4 mb-8 border-b pb-4">
        <div className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>{t('step_1')}</div>
        <div className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>{t('step_2')}</div>
        <div className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>{t('step_3')}</div>
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('district')}</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.district}
              onChange={e => setFormData({...formData, district: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('village')}</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.village}
              onChange={e => setFormData({...formData, village: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('category')}</label>
            <input 
              type="text" 
              className="w-full border rounded p-2" 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('margin')}</label>
            <input 
              type="number" 
              className="w-full border rounded p-2" 
              value={formData.margin_capital}
              onChange={e => setFormData({...formData, margin_capital: e.target.value})}
            />
          </div>
          
          <button 
            onClick={handleNext}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            {t('btn_calculate')}
          </button>
        </div>
      )}

      {/* Step 2: Financials */}
      {step === 2 && financialResult && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 text-green-900 rounded border border-green-200">
            <h3 className="font-semibold text-lg mb-2">{t('fin_title')}</h3>
            <p><strong>{t('scheme')}:</strong> {financialResult.scheme_name}</p>
            <p><strong>{t('proj_cost')}:</strong> ₹{financialResult.feasible_project_cost}</p>
            <p><strong>{t('loan_amount')}:</strong> ₹{financialResult.loan_amount}</p>
            {financialResult.cap_constrained && (
              <p className="text-orange-600 mt-2 text-sm">{t('cap_note')}</p>
            )}
          </div>
          
          <button 
            onClick={handleNext}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            {t('btn_generate_report')}
          </button>
        </div>
      )}
      
      {/* Step 3: Report Loading */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">{t('analyzing')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('analyzing_sub')}</p>
        </div>
      )}
    </div>
  );
};

export default ProposalWizard;
