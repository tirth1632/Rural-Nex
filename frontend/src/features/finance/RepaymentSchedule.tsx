import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRepaymentSchedule } from '../../api/finance';
import { formatCurrency } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RepaymentSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const schemeData = location.state; // Passed from SchemeResult

  const { data, isLoading, error } = useQuery({
    queryKey: ['repaymentSchedule', schemeData],
    queryFn: () => fetchRepaymentSchedule({
        principal: schemeData.eligible_loan,
        interest_rate: schemeData.interest_rate,
        tenure_months: schemeData.tenure,
        moratorium_months: schemeData.moratorium
    }),
    enabled: !!schemeData
  });

  if (!schemeData) {
    return <div className="p-8 text-center"><Link to="/finance/calculator" className="text-primary underline">Go back to calculator</Link></div>;
  }

  if (isLoading) return <div className="p-8 text-center">Generating your schedule...</div>;
  
  if (error || !data) return <div className="p-8 text-center text-red-500">Failed to generate schedule.</div>;

  const chartData = data.monthly_schedule.map((m: any) => ({
      month: m.month,
      balance: parseFloat(m.outstanding_principal)
  }));

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Your Repayment Plan</h2>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary">← Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border text-center">
            <div className="text-xs text-gray-500 uppercase">Loan Amount</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(data.summary.total_principal)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
            <div className="text-xs text-gray-500 uppercase">Total Interest</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(data.summary.total_interest)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
            <div className="text-xs text-gray-500 uppercase">Total Repayment</div>
            <div className="text-xl font-bold text-gray-800">{formatCurrency(data.summary.total_repayment)}</div>
        </div>
        <div className="bg-primary/10 p-4 rounded shadow border border-primary/20 text-center">
            <div className="text-xs text-primary/80 uppercase font-bold">Monthly Payment</div>
            <div className="text-xl font-bold text-primary">{formatCurrency(data.summary.active_emi)}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow border">
          <h3 className="text-lg font-bold mb-4">Outstanding Balance Over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(v) => `Mo ${v}`} />
                <YAxis tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(v) => `Month ${v}`} />
                <Area type="monotone" dataKey="balance" stroke="#2563eb" fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      <div className="bg-white rounded shadow border overflow-hidden">
          <h3 className="text-lg font-bold p-6 border-b">Quarterly Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Quarter</th>
                  <th className="px-6 py-3 font-medium text-right">Principal Paid</th>
                  <th className="px-6 py-3 font-medium text-right">Interest Paid</th>
                  <th className="px-6 py-3 font-medium text-right">Total Paid</th>
                  <th className="px-6 py-3 font-medium text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                  {data.quarterly_summary.map((q: any) => (
                      <tr key={q.quarter} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">Q{q.quarter}</td>
                          <td className="px-6 py-4 text-right">{formatCurrency(q.principal_payment)}</td>
                          <td className="px-6 py-4 text-right text-red-600">{formatCurrency(q.interest_payment)}</td>
                          <td className="px-6 py-4 text-right font-medium">{formatCurrency(q.total_payment)}</td>
                          <td className="px-6 py-4 text-right font-semibold">{formatCurrency(q.outstanding_principal)}</td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
      </div>
      
      <div className="flex justify-end pt-4 pb-10">
          <button 
             className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium shadow"
             onClick={() => navigate('/finance/working-capital')}
          >
             Estimate Working Capital Needs →
          </button>
      </div>
    </div>
  );
};

export default RepaymentSchedule;
