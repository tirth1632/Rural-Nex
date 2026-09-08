from decimal import Decimal
from typing import Dict, Any, Optional
from ..models import GovtScheme


class SchemeBenefitCalculator:
    @staticmethod
    def calculate_benefit(
        scheme: GovtScheme,
        project_cost: Decimal,
        own_contribution: Optional[Decimal] = None,
        loan_requirement: Optional[Decimal] = None,
        promoter_profile: Optional[Dict[str, Any]] = None,
        location: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates mathematical potential benefits based on verified scheme financial rules.
        """
        promoter_profile = promoter_profile or {}
        location = location or {}

        fin_rule = getattr(scheme, 'financial_rule', None)
        if not fin_rule:
            return {
                "error": "No financial rules defined for this scheme.",
                "potential_subsidy_amount": 0.0,
                "potential_loan_amount": 0.0,
                "effective_interest_rate": 0.0,
                "steps": []
            }

        rural_urban = (location.get('rural_urban') or 'rural').lower()
        gender = (promoter_profile.get('gender') or 'male').lower()
        social_category = (promoter_profile.get('social_category') or 'general').lower()
        special_category = (promoter_profile.get('special_category') or 'none').lower()

        is_special_promoter = (
            social_category in ['sc', 'st', 'obc', 'minority', 'special'] or
            special_category in ['divyang', 'physically_handicapped', 'ex_servicemen', 'ner', 'border', 'island'] or
            gender == 'female'
        )

        steps = []

        # 1. Eligible Project Base
        max_cost_cap = fin_rule.max_project_cost
        if max_cost_cap and project_cost > max_cost_cap:
            eligible_base = max_cost_cap
            steps.append(f"Project cost ₹{project_cost:,.2f} exceeds statutory ceiling ₹{max_cost_cap:,.2f}; eligible base capped at ₹{eligible_base:,.2f}.")
        else:
            eligible_base = project_cost
            steps.append(f"Entire project cost of ₹{eligible_base:,.2f} is recognized as eligible cost base.")

        # 2. Subsidy Rate & Potential Subsidy Amount
        if is_special_promoter:
            subsidy_rate = fin_rule.subsidy_rate_special_rural if rural_urban == 'rural' else fin_rule.subsidy_rate_special_urban
            margin_rate = fin_rule.promoter_margin_special_pct
            promoter_tier = f"Special Category ({'Rural' if rural_urban == 'rural' else 'Urban'})"
        else:
            subsidy_rate = fin_rule.subsidy_rate_general_rural if rural_urban == 'rural' else fin_rule.subsidy_rate_general_urban
            margin_rate = fin_rule.min_promoter_margin_pct
            promoter_tier = f"General Category ({'Rural' if rural_urban == 'rural' else 'Urban'})"

        raw_subsidy = eligible_base * (subsidy_rate / Decimal('100.0'))
        if fin_rule.max_subsidy_amount > Decimal('0.00') and raw_subsidy > fin_rule.max_subsidy_amount:
            final_subsidy = fin_rule.max_subsidy_amount
            steps.append(f"Raw calculated subsidy at {subsidy_rate}% is ₹{raw_subsidy:,.2f}, capped at statutory maximum of ₹{final_subsidy:,.2f}.")
        else:
            final_subsidy = raw_subsidy
            if subsidy_rate > Decimal('0.00'):
                steps.append(f"Capital subsidy applied at {subsidy_rate}% ({promoter_tier}) yielding ₹{final_subsidy:,.2f}.")
            else:
                steps.append("No upfront/back-ended capital subsidy applicable under this credit facility.")

        # 3. Promoter Contribution
        min_required_margin = eligible_base * (margin_rate / Decimal('100.0'))
        steps.append(f"Mandatory promoter contribution rate is {margin_rate}% (₹{min_required_margin:,.2f}).")

        actual_own = own_contribution if (own_contribution is not None and own_contribution > Decimal('0.00')) else min_required_margin
        equity_deficit = max(Decimal('0.00'), min_required_margin - actual_own)
        if equity_deficit > Decimal('0.00'):
            steps.append(f"Warning: Current promoter equity ₹{actual_own:,.2f} is short by ₹{equity_deficit:,.2f} of mandatory margin.")

        # 4. Bank Loan Sanction & Net Debt
        calculated_loan = max(Decimal('0.00'), project_cost - actual_own)
        if fin_rule.max_loan_amount and calculated_loan > fin_rule.max_loan_amount:
            sanctioned_loan = fin_rule.max_loan_amount
            steps.append(f"Gross loan requirement exceeds scheme limit ₹{fin_rule.max_loan_amount:,.2f}; maximum bank loan capped at ₹{sanctioned_loan:,.2f}.")
        else:
            sanctioned_loan = calculated_loan
            steps.append(f"Proposed bank loan sanction is ₹{sanctioned_loan:,.2f}.")

        # Net debt after subsidy adjustment (if back-ended, subsidy sits in TDR and offsets debt after lock-in)
        net_debt = max(Decimal('0.00'), sanctioned_loan - final_subsidy)

        # 5. Interest Rate & Subvention
        nominal_rate = fin_rule.interest_rate_min
        subvention_rate = fin_rule.interest_subvention_pct
        effective_rate = max(Decimal('0.00'), nominal_rate - subvention_rate)

        annual_interest_savings = (sanctioned_loan * (subvention_rate / Decimal('100.0'))) if subvention_rate > Decimal('0.00') else Decimal('0.00')
        total_subvention_savings = annual_interest_savings * Decimal(str(fin_rule.subvention_tenure_years or 5))

        if subvention_rate > Decimal('0.00'):
            steps.append(f"Annual interest subvention of {subvention_rate}% reduces effective lending rate from {nominal_rate}% to {effective_rate}%.")
            steps.append(f"Estimated interest savings of ~₹{annual_interest_savings:,.2f} annually (~₹{total_subvention_savings:,.2f} over {fin_rule.subvention_tenure_years} years).")

        return {
            "scheme_id": str(scheme.id),
            "scheme_name": scheme.name,
            "short_name": scheme.short_name,
            "project_cost": float(project_cost),
            "eligible_cost_base": float(eligible_base),
            "promoter_tier": promoter_tier,
            "applicable_subsidy_rate_pct": float(subsidy_rate),
            "potential_subsidy_amount": float(final_subsidy),
            "subsidy_timing": fin_rule.subsidy_timing,
            "required_promoter_margin_pct": float(margin_rate),
            "required_promoter_margin_amount": float(min_required_margin),
            "actual_promoter_contribution": float(actual_own),
            "equity_deficit": float(equity_deficit),
            "potential_loan_amount": float(sanctioned_loan),
            "net_debt_after_subsidy": float(net_debt),
            "nominal_interest_rate_pct": float(nominal_rate),
            "interest_subvention_pct": float(subvention_rate),
            "effective_interest_rate_pct": float(effective_rate),
            "annual_interest_savings": float(annual_interest_savings),
            "total_interest_savings": float(total_subvention_savings),
            "subvention_tenure_years": fin_rule.subvention_tenure_years,
            "max_tenure_months": fin_rule.tenure_months_max,
            "max_moratorium_months": fin_rule.moratorium_months_max,
            "collateral_requirement": fin_rule.collateral_type,
            "calculation_steps": steps,
            "official_source": {
                "portal_url": scheme.official_portal_url,
                "source_document": scheme.source_document,
                "rule_version": scheme.scheme_version,
                "last_verified_date": scheme.last_verified_date.isoformat(),
            },
            "disclaimer": "Potential Benefit calculation is an automated estimate for advisory purposes. Final subsidy release and loan sanction are contingent on official verification and lender underwriting."
        }
