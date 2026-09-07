export interface SimulationPayload {
    own_capital: number;
    project_cost: number;
    selling_price: number;
    expected_customers: number;
    monthly_operating_costs: number;
    employees: number;
    production_capacity: number;
    working_capital: number;
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
}

export interface SimulationResponse {
    simulation: {
        is_financially_feasible: boolean;
        error_message?: string;
        loan_amount: number;
        scheme_name: string;
        monthly_revenue: number;
        gross_margin_percentage: number;
        break_even_customers: number;
        repayment_schedule?: {
            installments?: Array<{ total_installment: number }>;
        };
    };
    feasibility: {
        is_feasible: boolean;
        overall_score: number;
    };
}

export const runSimulation = async (payload: SimulationPayload): Promise<SimulationResponse> => {
    const res = await fetch(`/api/v1/advisory/simulate/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
};
