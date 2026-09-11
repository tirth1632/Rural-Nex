import { apiFetch } from './apiFetch';
export const calculateFinance = async (data: { available_margin: number, desired_project_cost?: number }) => {
    const res = await apiFetch('/api/v1/finance/calculate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Calculation failed');
    return res.json();
};

export const fetchRepaymentSchedule = async (data: { principal: number, interest_rate: number, tenure_months: number, moratorium_months: number }) => {
    const res = await apiFetch('/api/v1/finance/repayment/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
};

export const estimateWorkingCapital = async (data: { projected_annual_turnover: number }) => {
    const res = await apiFetch('/api/v1/finance/working-capital/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to estimate working capital');
    return res.json();
};
