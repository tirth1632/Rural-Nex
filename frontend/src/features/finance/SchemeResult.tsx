import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { calculateFinance } from '../../api/finance';
import { formatCurrency } from '../../utils/formatters';
import { AlertCircle, CheckCircle } from 'lucide-react';

const SchemeResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  const { data, isLoading, error } = useQuery({
    queryKey: ['calculateFinance', formData],
    queryFn: () => calculateFinance(formData as any),
    enabled: !!formData
  });

  if (!formData) {
    return <div className="p-8 text-center"><Link to="/finance/calculator" className="text-primary underline">Go back to calculator</Link></div>;
  }

  if (isLoading) return <div className="p-8 text-center">Crunching the numbers...</div>;
  
  if (error || !data) return <div className="p-8 text-center text-red-500">Failed to calculate.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-primary">Your Financial Options</h2>
      
      {data.warnings && data.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex gap-3">
            <AlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
            <div>
                <h4 className="font-semibold text-yellow-800">Eligibility Notice</h4>
                <ul className="list-disc pl-4 mt-1 text-sm text-yellow-700">
                    {data.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Input side */}
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">Your Money</div>
            <div className="text-3xl font-bold mt-1 text-gray-900">{formatCurrency(data.requested_margin)}</div>
            <div className="mt-4 text-sm text-gray-500 font-medium tracking-wide uppercase">Your Actual Contribution</div>
            <div className="text-xl font-semibold text-green-700">{formatCurrency(data.beneficiary_contribution)}</div>
        </div>

        {/* Calculated Loan */}
        <div className="bg-primary/10 p-6 rounded-lg shadow border border-primary/20">
            <div className="text-sm text-primary/80 font-bold tracking-wide uppercase">Potential Loan (Calculated)</div>
            <div className="text-4xl font-bold mt-1 text-primary">{formatCurrency(data.eligible_loan)}</div>
            <div className="mt-4 text-sm text-gray-600 font-medium tracking-wide">Estimated Project Cost</div>
            <div className="text-lg font-semibold">{formatCurrency(data.eligible_project_cost)}</div>
        </div>
      </div>

      {/* Official Scheme Info */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            Official Scheme: {data.scheme === 'MICRO' ? 'Micro Finance Scheme' : 'Term Loan Scheme'}
        </h3>
        
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Interest Rate</div>
                <div className="text-xl font-bold text-gray-800">{data.interest_rate}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Tenure</div>
                <div className="text-xl font-bold text-gray-800">{data.tenure} months</div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Moratorium</div>
                <div className="text-xl font-bold text-gray-800">{data.moratorium} months</div>
            </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-4">
            * Moratorium means you only pay the interest for the first {data.moratorium} months, giving your business time to grow before you start repaying the actual loan amount.
        </p>

        <div className="mt-6 flex justify-end">
             <button 
                className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium shadow"
                onClick={() => navigate('/finance/repayment', { state: data })}
             >
                View Repayment Schedule →
             </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeResult;
