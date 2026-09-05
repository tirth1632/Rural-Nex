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

export const runSimulation = async (payload: SimulationPayload) => {
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
