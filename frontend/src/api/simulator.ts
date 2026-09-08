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

export function calculateLocalSimulation(payload: SimulationPayload): SimulationResponse {
    const ownCapital = Math.max(0, payload.own_capital || 0);
    const projectCost = Math.max(1, payload.project_cost || 1);
    const loanAmount = Math.max(0, projectCost - ownCapital);
    const sellingPrice = Math.max(0, payload.selling_price || 0);
    const customers = Math.max(0, payload.expected_customers || 0);
    const monthlyOperatingCosts = Math.max(0, payload.monthly_operating_costs || 0);

    let schemeName = "PMEGP Term Loan Scheme";
    let interestRate = 0.08;
    let tenureMonths = 84;

    if (projectCost <= 150000) {
        schemeName = "PM MUDRA (Shishu) / Micro Finance";
        interestRate = 0.065;
        tenureMonths = 36;
    } else if (projectCost <= 1000000) {
        schemeName = "PM MUDRA (Kishor / Tarun)";
        interestRate = 0.085;
        tenureMonths = 60;
    } else if (projectCost <= 5000000) {
        schemeName = "PMEGP Term Loan Scheme";
        interestRate = 0.08;
        tenureMonths = 84;
    } else {
        schemeName = "MSME Priority Term Loan";
        interestRate = 0.0875;
        tenureMonths = 84;
    }

    if (loanAmount === 0) {
        schemeName = "Self-Financed (100% Margin)";
    }

    const monthlyRate = interestRate / 12;
    let emi = 0;
    if (loanAmount > 0) {
        emi = Math.round(
            (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        );
    }

    const monthlyRevenue = sellingPrice * customers;
    const grossProfit = monthlyRevenue - monthlyOperatingCosts;
    const grossMargin = monthlyRevenue > 0 ? ((grossProfit / monthlyRevenue) * 100) : 0;
    const breakEven = sellingPrice > 0 ? Math.ceil(monthlyOperatingCosts / sellingPrice) : 0;

    // Feasibility calculation
    const coverageRatio = emi > 0 ? (grossProfit / emi) : 2.5;
    let overallScore = 65;
    if (coverageRatio > 2.0 && grossMargin > 30) overallScore = 88;
    else if (coverageRatio > 1.5 && grossMargin > 20) overallScore = 78;
    else if (coverageRatio > 1.0 && grossMargin > 10) overallScore = 68;
    else if (coverageRatio > 0.8) overallScore = 52;
    else overallScore = 38;

    return {
        simulation: {
            is_financially_feasible: grossProfit >= 0 && (loanAmount === 0 || coverageRatio >= 0.8),
            loan_amount: loanAmount,
            scheme_name: schemeName,
            monthly_revenue: monthlyRevenue,
            gross_margin_percentage: Number(grossMargin.toFixed(1)),
            break_even_customers: breakEven,
            repayment_schedule: {
                installments: Array.from({ length: tenureMonths }, () => ({
                    total_installment: emi
                }))
            }
        },
        feasibility: {
            is_feasible: overallScore >= 60,
            overall_score: overallScore
        }
    };
}

export const runSimulation = async (payload: SimulationPayload): Promise<SimulationResponse> => {
    try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token && token !== 'null' && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`/api/v1/advisory/simulate/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.warn('Backend simulation call failed, utilizing deterministic client fallback', err);
    }

    return calculateLocalSimulation(payload);
};

