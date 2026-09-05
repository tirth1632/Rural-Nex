import { useForm as useRHF } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  available_margin: z.number().min(1, 'You must have some money to start.'),
  desired_project_cost: z.number().optional()
});

type FormData = z.infer<typeof schema>;

const CalculatorForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useRHF<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    // Navigate to results page and pass the form data via state
    navigate('/finance/scheme-result', { state: data });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow border">
      <h2 className="text-2xl font-bold mb-2 text-primary">Financial Calculator</h2>
      <p className="text-sm text-gray-500 mb-6">Let's see what kind of business you can start.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Money (Available Margin) ₹</label>
          <input 
            type="number"
            step="1000"
            className="w-full border rounded p-2 focus:ring-1 focus:ring-primary outline-none"
            placeholder="e.g. 10000"
            {...register('available_margin', { valueAsNumber: true })}
          />
          {errors.available_margin && <p className="text-red-500 text-xs mt-1">{errors.available_margin.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estimated Project Cost ₹ (Optional)</label>
          <input 
            type="number"
            step="1000"
            className="w-full border rounded p-2 focus:ring-1 focus:ring-primary outline-none"
            placeholder="If you know how much the business costs..."
            {...register('desired_project_cost', { 
                setValueAs: v => v === "" ? undefined : parseInt(v, 10) 
            })}
          />
          {errors.desired_project_cost && <p className="text-red-500 text-xs mt-1">{errors.desired_project_cost.message}</p>}
        </div>

        <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded font-medium mt-4">
          Calculate My Options
        </button>
      </form>
    </div>
  );
};

export default CalculatorForm;
