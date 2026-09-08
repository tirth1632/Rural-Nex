from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from ..models import SchemeRule, SubsidyTiming

ROUNDING = '1.00'

class FundingWaterfallEngine:
    @staticmethod
    def calculate_waterfall(
        total_project_cost: Decimal,
        eligible_project_cost: Decimal,
        own_contribution_input: Decimal,
        additional_investment_input: Decimal,
        subsidy_data: Dict[str, Any],
        scheme_rule: Optional[SchemeRule],
        other_funding_input: Decimal = Decimal('0.00')
    ) -> Dict[str, Any]:
        """
        Computes the complete multi-source funding waterfall, accounting for statutory promoter equity,
        subsidy timing (back-ended vs upfront), and bank loan sanction requirements.
        """
        final_subsidy = Decimal(str(subsidy_data.get('final_subsidy_amount', 0.0)))
        subsidy_timing = subsidy_data.get('subsidy_timing', SubsidyTiming.BACK_ENDED)

        # 1. Determine minimum required own contribution from scheme or baseline 10%
        if scheme_rule:
            is_special = subsidy_data.get('applicable_subsidy_pct', 0) >= 25.0
            margin_matrix = scheme_rule.promoter_contribution_matrix or {}
            required_margin_pct = Decimal(str(margin_matrix.get('special' if is_special else 'general', Decimal('10.0'))))
        else:
            required_margin_pct = Decimal('10.0')

        min_required_margin_amount = (total_project_cost * (required_margin_pct / Decimal('100.0'))).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)

        # 2. Total Promoter Equity = Own Contribution + Additional Investment
        promoter_equity = own_contribution_input + additional_investment_input
        has_adequate_margin = promoter_equity >= min_required_margin_amount
        margin_gap = max(Decimal('0.00'), min_required_margin_amount - promoter_equity)

        # 3. Calculate Bank Loan Requirement based on Subsidy Timing
        # In Upfront subsidy: Loan = Total Cost - Equity - Subsidy - Other
        # In Back-ended subsidy (like PMEGP): Bank sanctions Gross Loan = Total Cost - Equity - Other.
        # The subsidy is held in a Subsidy Reserve Fund (TDR) without charging interest on the subsidy portion.
        if subsidy_timing == SubsidyTiming.UPFRONT:
            gross_loan = max(Decimal('0.00'), total_project_cost - promoter_equity - final_subsidy - other_funding_input)
            net_debt_exposure = gross_loan
            subsidy_in_waterfall = final_subsidy
        elif subsidy_timing == SubsidyTiming.BACK_ENDED:
            gross_loan = max(Decimal('0.00'), total_project_cost - promoter_equity - other_funding_input)
            net_debt_exposure = max(Decimal('0.00'), gross_loan - final_subsidy)
            subsidy_in_waterfall = final_subsidy
        else: # Capital subsidy / reimbursement / none
            gross_loan = max(Decimal('0.00'), total_project_cost - promoter_equity - other_funding_input)
            net_debt_exposure = max(Decimal('0.00'), gross_loan - final_subsidy)
            subsidy_in_waterfall = final_subsidy

        # Check maximum loan limits on the scheme
        if scheme_rule and scheme_rule.max_loan_amount and gross_loan > scheme_rule.max_loan_amount:
            loan_excess = gross_loan - scheme_rule.max_loan_amount
            gross_loan = scheme_rule.max_loan_amount
            net_debt_exposure = max(Decimal('0.00'), gross_loan - final_subsidy)
            # Remaining deficit must be covered by promoter equity
            promoter_equity += loan_excess
            loan_capped_warning = f"Gross bank loan capped at scheme maximum ceiling of ₹{scheme_rule.max_loan_amount:,.2f}. Additional equity of ₹{loan_excess:,.2f} required."
        else:
            loan_capped_warning = None

        total_funding_sources = promoter_equity + final_subsidy + (gross_loan if subsidy_timing != SubsidyTiming.UPFRONT else gross_loan) + other_funding_input

        waterfall_stages = [
            {
                "source": "Promoter Own Contribution",
                "amount": float(own_contribution_input),
                "pct_of_cost": float((own_contribution_input / total_project_cost * 100).quantize(Decimal('0.1'))) if total_project_cost > 0 else 0.0,
                "type": "EQUITY",
                "notes": f"Baseline applicant equity deposit (Min required: {required_margin_pct}% = ₹{min_required_margin_amount:,.2f})"
            },
            {
                "source": "Additional Promoter Investment",
                "amount": float(additional_investment_input),
                "pct_of_cost": float((additional_investment_input / total_project_cost * 100).quantize(Decimal('0.1'))) if total_project_cost > 0 else 0.0,
                "type": "EQUITY",
                "notes": "Supplementary internal cash accruals or partner funds"
            },
            {
                "source": "Government Subsidy / Benefit",
                "amount": float(final_subsidy),
                "pct_of_cost": float((final_subsidy / total_project_cost * 100).quantize(Decimal('0.1'))) if total_project_cost > 0 else 0.0,
                "type": "SUBSIDY",
                "notes": f"{subsidy_data.get('subsidy_timing_display', 'Government Assistance')} ({subsidy_data.get('applicable_subsidy_pct', 0)}%)"
            },
            {
                "source": "Commercial Bank Loan",
                "amount": float(gross_loan),
                "pct_of_cost": float((gross_loan / total_project_cost * 100).quantize(Decimal('0.1'))) if total_project_cost > 0 else 0.0,
                "type": "DEBT",
                "notes": f"Bank term loan + working capital sanction (Net debt after subsidy adjustment: ₹{net_debt_exposure:,.2f})"
            },
            {
                "source": "Other Funding / Grants",
                "amount": float(other_funding_input),
                "pct_of_cost": float((other_funding_input / total_project_cost * 100).quantize(Decimal('0.1'))) if total_project_cost > 0 else 0.0,
                "type": "OTHER",
                "notes": "External grants, angel funding, or unsecured family loans"
            }
        ]

        return {
            "total_project_cost": float(total_project_cost),
            "eligible_project_cost": float(eligible_project_cost),
            "promoter_own_contribution": float(own_contribution_input),
            "additional_investment": float(additional_investment_input),
            "total_promoter_equity": float(promoter_equity),
            "min_required_margin_pct": float(required_margin_pct),
            "min_required_margin_amount": float(min_required_margin_amount),
            "has_adequate_margin": has_adequate_margin,
            "margin_gap": float(margin_gap),
            "subsidy_amount": float(final_subsidy),
            "subsidy_timing": subsidy_timing,
            "gross_bank_loan_required": float(gross_loan),
            "net_debt_exposure": float(net_debt_exposure),
            "other_funding": float(other_funding_input),
            "loan_capped_warning": loan_capped_warning,
            "waterfall_stages": waterfall_stages
        }
