const BASE_URL = '/api/v1/advisory/proposals';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export interface ProposalItem {
    id: number;
    category?: { id: number; name: string; description?: string };
    margin_capital?: string | number;
    current_step?: number;
    state?: number | string;
    district?: number | string;
    block?: number | string;
    village?: number | string;
    state_name?: string;
    district_name?: string;
    block_name?: string;
    village_name?: string;
    lat?: number;
    lng?: number;
    expected_scale?: string;
    available_shop?: boolean;
    experience_years?: number;
    number_of_workers?: number;
    target_customers?: string;
    products?: string;
    analysis_runs?: Array<{
        id: number;
        status: string;
        started_at?: string;
        completed_at?: string;
        report?: {
            id?: number;
            overall_score?: number | string;
            is_feasible?: boolean;
            executive_summary?: string;
            scoring_data?: any;
            created_at?: string;
        };
    }>;
    financial_assessment?: {
        id?: number;
        scheme?: number;
        scheme_name?: string;
        feasible_project_cost?: string | number;
        constrained_project_cost?: string | number;
        loan_amount?: string | number;
        working_capital_estimate?: string | number;
        cap_constrained?: boolean;
        constraint_reason?: string;
    };
    created_at: string;
}

export const calculateEMI = (principal: number, annualRatePct: number = 9.5, tenureYears: number = 5): number => {
    if (!principal || principal <= 0) return 0;
    const monthlyRate = (annualRatePct / 12) / 100;
    const totalMonths = tenureYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
};

export const formatINR = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null || val === '') return '₹0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
};

export const getUserProposals = async (): Promise<ProposalItem[]> => {
    let backendProposals: ProposalItem[] = [];
    try {
        const res = await fetch(`${BASE_URL}/`, {
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            const data = await res.json();
            backendProposals = Array.isArray(data) ? data : [];
        }
    } catch (err) {
        console.warn('Error fetching user proposals:', err);
    }

    let localProposals: ProposalItem[] = [];
    try {
        const raw = localStorage.getItem('ruralnex_saved_proposals');
        localProposals = raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('Could not read local proposals', e);
    }

    const map = new Map<number, ProposalItem>();

    // Initial benchmark proposal #101
    const benchmarkProposal: ProposalItem = {
        id: 101,
        category: { id: 1, name: 'Agro & Dairy Processing Unit' },
        village_name: 'Vastral',
        block_name: 'Daskroi',
        district_name: 'Ahmedabad',
        margin_capital: 500000,
        current_step: 7,
        created_at: '2026-01-15T00:00:00Z',
        analysis_runs: [{
            id: 101,
            status: 'COMPLETED',
            report: {
                id: 101,
                overall_score: 84,
                is_feasible: true,
                executive_summary: 'Agro & Dairy Processing Unit has strong commercial viability with high local demand density.',
                scoring_data: {
                    dimensions: {
                        market_reach: { score: 82, factors: { estimated_population: 38500 } },
                        competition: { score: 75, factors: { competitor_count: 2 } },
                        opportunity: { score: 68 }
                    }
                }
            }
        }],
        financial_assessment: {
            feasible_project_cost: 2000000,
            loan_amount: 1500000,
            scheme_name: 'PMEGP (25-35% Capital Subsidy)'
        }
    };
    map.set(101, benchmarkProposal);

    // Merge backend proposals
    for (const p of backendProposals) {
        map.set(p.id, p);
    }

    // Merge locally saved proposals (from wizard)
    for (const p of localProposals) {
        if (!map.has(p.id)) {
            map.set(p.id, p);
        } else {
            map.set(p.id, { ...map.get(p.id)!, ...p });
        }
    }

    return Array.from(map.values());
};

export const getProposalDetail = async (id: number): Promise<ProposalItem | null> => {
    try {
        const res = await fetch(`${BASE_URL}/${id}/`, {
            headers: getAuthHeaders(),
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.warn(`Error fetching proposal #${id}:`, err);
    }

    try {
        const raw = localStorage.getItem('ruralnex_saved_proposals');
        const list: ProposalItem[] = raw ? JSON.parse(raw) : [];
        const found = list.find(p => p.id === id);
        if (found) return found;
    } catch {}

    if (id === 101) {
        return {
            id: 101,
            category: { id: 1, name: 'Agro & Dairy Processing Unit' },
            village_name: 'Vastral',
            block_name: 'Daskroi',
            district_name: 'Ahmedabad',
            margin_capital: 500000,
            current_step: 7,
            created_at: '2026-01-15T00:00:00Z',
            analysis_runs: [{
                id: 101,
                status: 'COMPLETED',
                report: {
                    id: 101,
                    overall_score: 84,
                    is_feasible: true,
                    executive_summary: 'Agro & Dairy Processing Unit has strong commercial viability with high local demand density.',
                    scoring_data: {
                        dimensions: {
                            market_reach: { score: 82, factors: { estimated_population: 38500 } },
                            competition: { score: 75, factors: { competitor_count: 2 } },
                            opportunity: { score: 68 }
                        }
                    }
                }
            }],
            financial_assessment: {
                feasible_project_cost: 2000000,
                loan_amount: 1500000,
                scheme_name: 'PMEGP (25-35% Capital Subsidy)'
            }
        };
    }

    return null;
};

export const getLatestAssessment = async (): Promise<ProposalItem | null> => {
    try {
        const proposals = await getUserProposals();
        if (proposals.length === 0) return null;

        // Prefer proposal with completed analysis
        const completed = proposals.filter(p => p.analysis_runs && p.analysis_runs.length > 0);
        const target = completed.length > 0 ? completed[completed.length - 1] : proposals[proposals.length - 1];

        const fullDetail = await getProposalDetail(target.id);
        return fullDetail || target;
    } catch (err) {
        console.warn('Error in getLatestAssessment:', err);
        return null;
    }
};

