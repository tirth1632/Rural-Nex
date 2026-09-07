import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { estimateWorkingCapital } from '../../api/finance';
import { formatCurrency } from '../../utils/formatters';

const schema = z.object({
  projected_annual_turnover: z.number().min(1000, 'Turnover must be at least 1,000.')
});

type FormData = z.infer<typeof schema>;

const WorkingCapitalForm = () => {
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: estimateWorkingCapital,
    onSuccess: (data) => setResult(data)
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-2xl font-bold mb-2 text-primary">Day-to-Day Money (Working Capital)</h2>
        <p className="text-sm text-gray-500 mb-6">Estimate how much money you need to keep your business running smoothly every day.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Projected Yearly Sales (Turnover) ₹</label>
            <input 
              type="number"
              step="1000"
              className="w-full border rounded p-2 focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. 1000000"
              {...register('projected_annual_turnover', { valueAsNumber: true })}
            />
            {errors.projected_annual_turnover && <p className="text-red-500 text-xs mt-1">{errors.projected_annual_turnover.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground py-2 rounded font-medium mt-4 disabled:opacity-50"
          >
            {mutation.isPending ? 'Calculating...' : 'Estimate Working Capital'}
          </button>
        </form>
      </div>

      {result && (
          <div className="bg-white p-6 rounded-lg shadow border animate-in fade-in zoom-in duration-300">
              <h3 className="text-lg font-bold mb-4">Your Working Capital Breakdown</h3>
              
              <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-dashed">
                      <span className="text-gray-600 font-medium">Total Required Working Capital</span>
                      <span className="text-xl font-bold">{formatCurrency(result.total_working_capital_required)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dashed">
                      <span className="text-gray-600 font-medium">Bank Finance (Loan Portion)</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(result.eligible_bank_finance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Your Margin (Out of Pocket)</span>
                      <span className="text-xl font-bold text-green-700">{formatCurrency(result.promoter_margin)}</span>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default WorkingCapitalForm;
