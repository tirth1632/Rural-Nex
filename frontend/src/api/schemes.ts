const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const API_BASE = '/api/schemes';

export interface SchemeFinancialSummary {
  max_loan: string;
  max_subsidy: string;
  subsidy_rate_display: string;
  interest_rate_display: string;
  interest_subvention_pct: number;
  collateral_requirement: string;
  max_tenure_months: number;
  moratorium_months: number;
  min_project_cost: number;
  max_project_cost: number | null;
}

export interface GovtSchemeListItem {
  id: string;
  official_id: string;
  name: string;
  short_name: string;
  slug: string;
  level: 'CENTRAL' | 'STATE' | 'LOCAL';
  state: string;
  districts: string[];
  ministry: string;
  department: string;
  nodal_agency: string;
  category_name: string;
  category_slug: string;
  sectors: string[];
  description: string;
  short_description: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING_VERIFICATION';
  financial_summary: SchemeFinancialSummary | null;
  primary_benefit: string;
  badges: string[];
  official_portal_url: string;
  source_name: string;
  source_document: string;
  verification_status: 'OFFICIAL' | 'VERIFIED' | 'PENDING_VERIFICATION' | 'EXPIRED';
  last_verified_date: string;
  scheme_version: string;
}

export interface SchemeBenefit {
  id: number;
  benefit_type: string;
  calculation_type: string;
  title: string;
  percentage: string | null;
  fixed_amount: string | null;
  max_amount: string | null;
  min_amount: string | null;
  eligible_base_description: string;
  conditions: string;
  is_primary: boolean;
}

export interface SchemeEligibilityRule {
  id: number;
  field: string;
  operator: string;
  expected_value: any;
  condition_group: string;
  priority: number;
  rule_description: string;
  is_mandatory: boolean;
}

export interface SchemeFinancialRule {
  min_project_cost: string;
  max_project_cost: string | null;
  max_loan_amount: string | null;
  min_promoter_margin_pct: string;
  promoter_margin_special_pct: string;
  subsidy_rate_general_urban: string;
  subsidy_rate_general_rural: string;
  subsidy_rate_special_urban: string;
  subsidy_rate_special_rural: string;
  max_subsidy_amount: string;
  subsidy_timing: 'BACK_ENDED' | 'UPFRONT';
  interest_rate_min: string;
  interest_rate_max: string;
  interest_subvention_pct: string;
  subvention_tenure_years: number;
  tenure_months_max: number;
  moratorium_months_max: number;
  collateral_type: string;
}

export interface SchemeDocument {
  id: number;
  name: string;
  requirement_level: 'REQUIRED' | 'CONDITIONAL' | 'OPTIONAL';
  issuing_authority: string;
  description: string;
  sort_order: number;
}

export interface SchemeApplicationStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  portal_url: string;
  expected_time_days: number;
}

export interface GovtSchemeDetail extends GovtSchemeListItem {
  target_audience: string;
  source_url: string;
  source_document_date: string | null;
  effective_from: string | null;
  effective_to: string | null;
  priority_score: number;
  keywords: string[];
  benefits: SchemeBenefit[];
  eligibility_rules: SchemeEligibilityRule[];
  financial_rule: SchemeFinancialRule | null;
  documents: SchemeDocument[];
  application_steps: SchemeApplicationStep[];
}

export interface SchemeCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sort_order: number;
  scheme_count: number;
}

export interface SchemeStats {
  total_schemes: number;
  verified_schemes: number;
  central_schemes: number;
  state_schemes: number;
  last_data_update: string | null;
  data_source: string;
}

export interface SchemeMatchItem {
  id: string;
  official_id: string;
  name: string;
  short_name: string;
  level: 'CENTRAL' | 'STATE' | 'LOCAL';
  state: string;
  ministry: string;
  department: string;
  nodal_agency: string;
  category: string;
  category_slug: string;
  sectors: string[];
  description: string;
  short_description: string;
  eligibility_status: 'Eligible' | 'Potentially Eligible' | 'Verification Required' | 'Not Eligible';
  match_score: number;
  dimension_scores: {
    location: number;
    business: number;
    promoter: number;
    cost: number;
    benefit: number;
  };
  matched_reasons: string[];
  unmet_reasons: string[];
  financial_preview: {
    project_cost: number;
    eligible_base: number;
    applicable_subsidy_pct: number;
    potential_subsidy_amount: number;
    required_promoter_margin_pct: number;
    required_promoter_margin_amount: number;
    interest_rate_min: number;
    interest_subvention_pct: number;
    effective_interest_rate: number;
    collateral_requirement: string;
    subsidy_timing: string;
  };
  primary_benefit: string;
  official_portal_url: string;
  source_name: string;
  source_document: string;
  scheme_version: string;
  last_verified_date: string;
  verification_status: string;
}

export interface SchemeMatchResponse {
  matched_schemes: SchemeMatchItem[];
  total_matches: number;
  verified_matches: number;
  needs_verification: number;
  total_evaluated: number;
  disclaimer: string;
}

export interface BenefitCalculationResult {
  scheme_id: string;
  scheme_name: string;
  short_name: string;
  project_cost: number;
  eligible_cost_base: number;
  promoter_tier: string;
  applicable_subsidy_rate_pct: number;
  potential_subsidy_amount: number;
  subsidy_timing: string;
  required_promoter_margin_pct: number;
  required_promoter_margin_amount: number;
  actual_promoter_contribution: number;
  equity_deficit: number;
  potential_loan_amount: number;
  net_debt_after_subsidy: number;
  nominal_interest_rate_pct: number;
  interest_subvention_pct: number;
  effective_interest_rate_pct: number;
  annual_interest_savings: number;
  total_interest_savings: number;
  subvention_tenure_years: number;
  max_tenure_months: number;
  max_moratorium_months: number;
  collateral_requirement: string;
  calculation_steps: string[];
  official_source: {
    portal_url: string;
    source_document: string;
    rule_version: string;
    last_verified_date: string;
  };
  disclaimer: string;
}

export interface SchemeComparisonItem {
  id: string;
  official_id: string;
  name: string;
  short_name: string;
  level: string;
  ministry: string;
  state: string;
  category: string;
  sectors: string[];
  max_project_cost: string;
  max_loan: string;
  subsidy_rate: string;
  max_subsidy: string;
  interest_rate: string;
  interest_subvention: string;
  collateral_free: string;
  promoter_margin: string;
  tenure_months: string;
  moratorium_months: string;
  portal_url: string;
  verification_status: string;
}

export interface SavedSchemeItem {
  id: number;
  scheme: string;
  scheme_details: GovtSchemeListItem;
  notes: string;
  notify_updates: boolean;
  created_at: string;
}

// API methods
export async function fetchSchemes(params?: {
  q?: string;
  jurisdiction?: string;
  state?: string;
  district?: string;
  category?: string;
  sector?: string;
  benefit_type?: string;
  min_cost?: number;
  max_cost?: number;
  collateral_free?: boolean;
  verified_only?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  total_count: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  facets: { central_count: number; state_count: number; verified_count: number };
  results: GovtSchemeListItem[];
}> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
  }
  const res = await fetch(`${API_BASE}/?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch schemes');
  return res.json();
}

export async function searchSchemes(query: string, state?: string, category?: string): Promise<{
  query: string;
  total_count: number;
  results: GovtSchemeListItem[];
}> {
  const qParams = new URLSearchParams({ q: query });
  if (state) qParams.append('state', state);
  if (category) qParams.append('category', category);

  const res = await fetch(`${API_BASE}/search/?${qParams.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to search schemes');
  return res.json();
}

export async function fetchSchemeStats(): Promise<SchemeStats> {
  const res = await fetch(`${API_BASE}/stats/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme statistics');
  return res.json();
}

export async function fetchSchemeCategories(): Promise<SchemeCategory[]> {
  const res = await fetch(`${API_BASE}/categories/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme categories');
  return res.json();
}

export async function fetchSchemeMinistries(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/ministries/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme ministries');
  return res.json();
}

export async function fetchSchemeBenefits(): Promise<{ code: string; label: string }[]> {
  const res = await fetch(`${API_BASE}/benefits/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme benefits');
  return res.json();
}

export async function fetchSchemeLocations(): Promise<{
  jurisdictions: { code: string; label: string }[];
  active_states: string[];
}> {
  const res = await fetch(`${API_BASE}/locations/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme locations');
  return res.json();
}

export async function fetchSchemeDetail(id: string): Promise<GovtSchemeDetail> {
  const res = await fetch(`${API_BASE}/${id}/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch scheme details');
  return res.json();
}

export async function matchSchemes(payload: {
  project_cost: number;
  business_sector?: string;
  business_activity?: string;
  state?: string;
  district?: string;
  rural_urban?: 'rural' | 'urban';
  business_stage?: 'new' | 'existing' | 'expansion';
  promoter_category?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  special_category?: string;
  own_contribution?: number;
}): Promise<SchemeMatchResponse> {
  const res = await fetch(`${API_BASE}/match/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to match schemes');
  return res.json();
}

export async function calculateSchemeBenefit(
  schemeId: string,
  payload: {
    project_cost: number;
    own_contribution?: number;
    loan_requirement?: number;
    rural_urban?: 'rural' | 'urban';
    gender?: 'male' | 'female' | 'other';
    social_category?: string;
    special_category?: string;
  }
): Promise<BenefitCalculationResult> {
  const res = await fetch(`${API_BASE}/${schemeId}/calculate-benefit/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to calculate potential benefit');
  return res.json();
}

export async function compareSchemes(schemeIds: string[]): Promise<{
  total_compared: number;
  schemes: SchemeComparisonItem[];
}> {
  const res = await fetch(`${API_BASE}/compare/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheme_ids: schemeIds })
  });
  if (!res.ok) throw new Error('Failed to compare schemes');
  return res.json();
}

export async function fetchSavedSchemes(): Promise<SavedSchemeItem[]> {
  const res = await fetch('/api/user/saved-schemes/', {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch saved schemes');
  return res.json();
}

export async function saveScheme(schemeId: string, notes?: string): Promise<SavedSchemeItem> {
  const res = await fetch('/api/user/saved-schemes/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheme_id: schemeId, notes: notes || '' })
  });
  if (!res.ok) throw new Error('Failed to save scheme');
  return res.json();
}

export async function deleteSavedScheme(id: number): Promise<void> {
  const res = await fetch(`/api/user/saved-schemes/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete saved scheme');
}

export async function addSchemeToFinancialPlan(schemeId: string): Promise<{
  scheme_id: string;
  official_id: string;
  scheme_name: string;
  short_name: string;
  redirect_url: string;
  financial_rules: any;
}> {
  const res = await fetch(`${API_BASE}/${schemeId}/add-to-financial-plan/`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to handoff scheme to financial plan');
  return res.json();
}
