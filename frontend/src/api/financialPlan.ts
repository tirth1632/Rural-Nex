const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface CapExLineItem {
    id: string;
    category: string;
    category_label?: string;
    name: string;
    quantity: number;
    unit_cost: number;
    total_amount: number;
    specification?: string;
}

export interface ActivityDriverTemplate {
    base_capacity_monthly: number;
    default_selling_price: number;
    default_variable_cost_per_unit: number;
    default_operating_days: number;
    default_capex_breakdown: Array<{
        category: string;
        name: string;
        quantity: number;
        unit_cost: number;
        specification?: string;
    }>;
    default_fixed_costs: Array<{
        name: string;
        monthly_amount: number;
    }>;
    default_variable_costs: Array<{
        name: string;
        unit_cost?: number;
    }>;
    seasonal_factors: number[];
}

export interface BusinessActivity {
    id: number;
    code: string;
    name: string;
    sector: string;
    sector_display: string;
    icon: string;
    description: string;
    unit_of_measurement: string;
    sort_order: number;
    driver_template?: ActivityDriverTemplate;
}

export interface SchemeRule {
    id: number;
    scheme_code: string;
    scheme_name: string;
    ministry: string;
    official_portal_url: string;
    scheme_type: string;
    rule_version: string;
    effective_from: string;
    verification_status: string;
    last_verified_date: string;
    source_document: string;
    min_project_cost: number;
    max_project_cost: number;
    max_loan_amount: number;
    promoter_contribution_matrix: Record<string, number>;
    subsidy_rate_matrix: Record<string, number>;
    max_subsidy_cap: number;
    subsidy_timing: string;
    interest_rate_annual: number;
    interest_subvention_pct: number;
    tenure_months: number;
    moratorium_months: number;
    moratorium_policy: string;
    collateral_support: string;
    required_documents: string[];
}

export interface SchemeMaster {
    id: number;
    code: string;
    name: string;
    ministry: string;
    official_portal_url: string;
    scheme_type: string;
    description: string;
    rules: SchemeRule[];
}

export interface SchemeMatchResult {
    rule_id: number;
    scheme_id: number;
    scheme_code: string;
    scheme_name: string;
    ministry: string;
    scheme_type: string;
    eligibility_status: 'Eligible' | 'Potentially Eligible' | 'Not Eligible' | 'Verification Required';
    eligibility_score: number;
    reasons: string[];
    applicable_subsidy_pct: number;
    estimated_subsidy_amount: number;
    max_subsidy_cap: number;
    required_margin_pct: number;
    annual_interest_rate: number;
    interest_subvention_pct: number;
    effective_interest_rate: number;
    tenure_months: number;
    moratorium_months: number;
    moratorium_policy: string;
    collateral_support: string;
    subsidy_timing: string;
    required_documents: string[];
    official_portal_url: string;
    source_document: string;
    rule_version: string;
    last_verified_date: string;
    verification_status: string;
}

export interface PromoterProfile {
    name?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    social_category?: 'general' | 'obc' | 'sc' | 'st' | 'minority';
    special_category?: 'none' | 'divyang' | 'ner' | 'border' | 'hill' | 'island';
    education?: string;
    experience?: string;
    existing_business?: boolean;
    existing_revenue?: number;
    existing_assets?: number;
    existing_loan?: number;
    existing_employees?: number;
    existing_capacity?: string;
}

export interface LocationData {
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    rural_urban?: 'rural' | 'urban';
    pincode?: string;
}

export interface FinancialInputs {
    project_title?: string;
    own_contribution: number;
    additional_investment: number;
    working_capital?: number;
    existing_savings?: number;
    other_funding?: number;
    existing_loan?: number;
    custom_drivers?: {
        capacity?: number;
        selling_price?: number;
        variable_cost_per_unit?: number;
        operating_days?: number;
        fixed_costs?: Array<{ name: string; monthly_amount: number }>;
    };
}

export interface FeasibilityCalculationResponse {
    activity: {
        id: number | null;
        code: string;
        name: string;
        sector: string;
        unit_of_measurement: string;
        description: string;
    };
    matched_schemes: SchemeMatchResult[];
    selected_scheme_rule: {
        id: number;
        code: string;
        name: string;
        rule_version: string;
        verification_status: string;
        official_portal_url: string;
        last_verified_date: string;
    } | null;
    project_cost: {
        total_project_cost: number;
        category_summaries: Record<string, {
            key: string;
            label: string;
            total: number;
            item_count: number;
            items: CapExLineItem[];
        }>;
        all_items: CapExLineItem[];
    };
    cost_validation: {
        eligible_project_cost: number;
        ineligible_portion: number;
        is_within_limits: boolean;
        reasons: string[];
    };
    subsidy: {
        applicable_subsidy_pct: number;
        eligible_base_amount: number;
        raw_subsidy_amount: number;
        max_subsidy_cap: number;
        final_subsidy_amount: number;
        is_capped: boolean;
        subsidy_timing: string;
        subsidy_timing_display: string;
        calculation_explanation: string;
        calculation_steps: string[];
        source_document?: string;
        official_portal_url?: string;
        rule_version: string;
        last_verified_date: string;
        verification_status: string;
    };
    funding_waterfall: {
        total_project_cost: number;
        eligible_project_cost: number;
        promoter_own_contribution: number;
        additional_investment: number;
        total_promoter_equity: number;
        min_required_margin_pct: number;
        min_required_margin_amount: number;
        has_adequate_margin: boolean;
        margin_gap: number;
        subsidy_amount: number;
        subsidy_timing: string;
        gross_bank_loan_required: number;
        net_debt_exposure: number;
        other_funding: number;
        loan_capped_warning: string | null;
        waterfall_stages: Array<{
            source: string;
            amount: number;
            pct_of_cost: number;
            type: 'EQUITY' | 'SUBSIDY' | 'DEBT' | 'OTHER';
            notes: string;
        }>;
    };
    loan: {
        principal: number;
        interest_rate: number;
        interest_subvention: number;
        effective_interest_rate: number;
        tenure_months: number;
        moratorium_months: number;
        moratorium_policy: string;
    };
    amortization: {
        summary: {
            total_principal: number;
            total_interest: number;
            total_repayment: number;
            active_emi: number;
            tenure_months: number;
            moratorium_months: number;
            moratorium_policy: string;
            annual_interest_rate: number;
        };
        monthly_schedule: Array<{
            month: number;
            is_moratorium: boolean;
            opening_principal: number;
            payment: number;
            principal_payment: number;
            interest_payment: number;
            closing_principal: number;
            outstanding_principal: number;
        }>;
        quarterly_summary: Array<{
            quarter: number;
            label: string;
            total_payment: number;
            principal_payment: number;
            interest_payment: number;
            outstanding_principal: number;
        }>;
        annual_summary: Array<{
            year: number;
            label: string;
            total_payment: number;
            principal_payment: number;
            interest_payment: number;
            outstanding_principal: number;
        }>;
    };
    forecast: {
        unit_of_measurement: string;
        base_monthly_capacity: number;
        base_selling_price: number;
        base_variable_cost_per_unit: number;
        monthly_fixed_costs: number;
        operating_days_per_month: number;
        scenarios: {
            conservative: ScenarioForecast;
            base: ScenarioForecast;
            optimistic: ScenarioForecast;
        };
        attribution: Record<string, string>;
    };
    profit_and_loss: {
        monthly: Array<{
            month: number;
            month_label: string;
            gross_revenue: number;
            variable_costs: number;
            gross_profit: number;
            fixed_costs: number;
            total_opex: number;
            ebitda: number;
            depreciation: number;
            interest_expense: number;
            profit_before_tax: number;
            tax: number;
            net_profit: number;
        }>;
        annual_summary: {
            gross_revenue: number;
            variable_costs: number;
            gross_profit: number;
            fixed_costs: number;
            total_opex: number;
            ebitda: number;
            depreciation: number;
            interest_expense: number;
            pbt: number;
            tax: number;
            pat: number;
        };
        ebitda_margin_pct: number;
        net_profit_margin_pct: number;
    };
    cash_flow: {
        monthly: Array<{
            month: number;
            month_label: string;
            opening_cash: number;
            inflows: {
                revenue: number;
                loan_disbursement: number;
                subsidy: number;
                total: number;
            };
            outflows: {
                capex: number;
                opex: number;
                debt_service: number;
                tax: number;
                total: number;
            };
            net_cash_flow: number;
            closing_cash: number;
            is_deficit: boolean;
        }>;
        annual_inflows: number;
        annual_outflows: number;
        net_annual_cash_generation: number;
        closing_cash_year1: number;
        min_cash_balance: number;
        has_cash_deficit: boolean;
        deficit_months: number[];
        max_deficit_amount: number;
        warning_message: string;
    };
    break_even: {
        annual_fixed_cost: number;
        annual_variable_cost: number;
        contribution_margin: number;
        contribution_margin_ratio: number;
        break_even_revenue: number;
        break_even_units: number;
        margin_of_safety_amount: number;
        margin_of_safety_pct: number;
        break_even_months: number;
    };
    dscr: {
        dscr_value: number;
        cash_available_for_debt: number;
        debt_service_obligation: number;
        status: string;
        risk_level: string;
        interpretation: string;
        thresholds: {
            strong: number;
            moderate: number;
            weak: number;
        };
    };
    roi: {
        roi_pct: number;
        annual_net_profit: number;
        annual_cash_profit: number;
        total_investment: number;
        payback_period_years: number;
        payback_period_months: number;
    };
    feasibility_score: {
        score: number;
        status: string;
        verdict: string;
        breakdown: {
            profitability: number;
            cash_flow: number;
            dscr: number;
            project_funding: number;
            working_capital: number;
            promoter_contribution: number;
            risk: number;
        };
        reasons: string[];
    };
    risk_analysis: {
        overall_risk_level: string;
        risk_score_points: number;
        summary: string;
        indicators: Array<{
            category: string;
            severity: 'LOW' | 'MEDIUM' | 'HIGH';
            message: string;
        }>;
    };
    sensitivity_analysis: {
        matrix: Array<{
            variable_key: string;
            variable_name: string;
            minus_10_pct: { net_profit: number; dscr: number };
            base: { net_profit: number; dscr: number };
            plus_10_pct: { net_profit: number; dscr: number };
            swing_amount: number;
        }>;
        most_sensitive_variable: string;
        insight: string;
    };
    recommended_project_size: {
        recommended_project_cost: number;
        formatted_recommended_cost: string;
        reason: string;
        scenarios: Array<{
            project_cost: number;
            formatted_cost: string;
            required_promoter_margin: number;
            estimated_subsidy: number;
            estimated_loan: number;
            estimated_dscr: number;
            status: string;
            feasibility: string;
        }>;
    };
    bank_dpr: BankDPR;
    calculation_audit: {
        rule_version_used: string;
        verification_status: string;
        official_source_url: string;
        last_verified: string;
        engine: string;
        data_source: string;
    };
}

export interface ScenarioForecast {
    scenario_name: string;
    months: Array<{
        month: number;
        month_label: string;
        capacity_utilization_pct: number;
        production_volume: number;
        selling_price_per_unit: number;
        gross_revenue: number;
        variable_cost: number;
        fixed_cost: number;
        total_opex: number;
        operating_profit: number;
    }>;
    annual_revenue: number;
    annual_variable_cost: number;
    annual_fixed_cost: number;
    annual_total_opex: number;
    annual_operating_profit: number;
    average_monthly_revenue: number;
    average_monthly_opex: number;
}

export interface BankDPR {
    metadata: {
        report_id: string;
        generation_timestamp: string;
        formatted_date: string;
        system_branding: string;
        appraisal_standard: string;
        rule_version_used: string;
        verification_status: string;
    };
    sections: Record<string, any>;
}

// -------------------------------------------------------------
// Geo Location Interfaces
// -------------------------------------------------------------
export interface GeoState {
    id: number;
    name: string;
    code: string;
}

export interface GeoDistrict {
    id: number;
    name: string;
    state: number;
}

export interface GeoBlock {
    id: number;
    name: string;
    district: number;
}

export interface GeoVillage {
    id: number;
    name: string;
    block: number;
}

// -------------------------------------------------------------
// API Helper Functions
// -------------------------------------------------------------

export const fetchBusinessActivities = async (): Promise<BusinessActivity[]> => {
    const res = await fetch('/api/v1/finance/activities/', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch business activities');
    return res.json();
};

export const fetchGovernmentSchemes = async (): Promise<SchemeMaster[]> => {
    const res = await fetch('/api/v1/finance/schemes/all/', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch government schemes');
    return res.json();
};

export const matchApplicableSchemes = async (payload: {
    project_cost: number;
    activity_id_or_code?: string;
    business_stage?: string;
    promoter_profile?: PromoterProfile;
    location_data?: LocationData;
}): Promise<{ matched_schemes: SchemeMatchResult[]; rule_engine_version: string }> => {
    const res = await fetch('/api/v1/finance/schemes/match/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to match schemes');
    return res.json();
};

export const calculateFeasibility = async (payload: {
    activity_id_or_code?: string;
    business_stage?: string;
    promoter_profile?: PromoterProfile;
    location_data?: LocationData;
    financial_inputs?: FinancialInputs;
    project_cost_items?: Record<string, CapExLineItem[]>;
    selected_scheme_rule_id?: number | null;
    what_if_modifiers?: Record<string, any>;
}): Promise<FeasibilityCalculationResponse> => {
    const res = await fetch('/api/v1/finance/calculate/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || 'Financial feasibility calculation failed');
    }
    return res.json();
};

export const generateBankDPR = async (payload: any): Promise<BankDPR> => {
    const res = await fetch('/api/v1/finance/dpr/generate/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate Bank DPR');
    return res.json();
};

export const fetchAIAdvisoryInsights = async (calculationResults: any) => {
    const res = await fetch('/api/v1/finance/advisor/explain/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ calculation_results: calculationResults })
    });
    if (!res.ok) throw new Error('Failed to fetch AI advisory insights');
    return res.json();
};

export const saveFinancialPlan = async (payload: any) => {
    const res = await fetch('/api/v1/finance/plans/save/', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save financial plan draft');
    return res.json();
};

export const fetchSavedFinancialPlans = async () => {
    const res = await fetch('/api/v1/finance/plans/', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch saved plans');
    return res.json();
};

export const fetchGeoStates = async (): Promise<GeoState[]> => {
    const res = await fetch('/api/v1/geo/states/', { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch states');
    return res.json();
};

export const fetchGeoDistricts = async (stateId: number | string): Promise<GeoDistrict[]> => {
    const res = await fetch(`/api/v1/geo/districts/?state=${stateId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch districts');
    return res.json();
};

export const fetchGeoBlocks = async (districtId: number | string): Promise<GeoBlock[]> => {
    const res = await fetch(`/api/v1/geo/blocks/?district=${districtId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch blocks');
    return res.json();
};

export const fetchGeoVillages = async (blockId: number | string): Promise<GeoVillage[]> => {
    const res = await fetch(`/api/v1/geo/villages/?block=${blockId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch villages');
    return res.json();
};
