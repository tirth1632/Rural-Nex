from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, Optional
from ..models import SchemeRule, SubsidyTiming

ROUNDING = '1.00'

class SubsidyEngine:
    @staticmethod
    def calculate_subsidy(
        eligible_project_cost: Decimal,
        scheme_rule: Optional[SchemeRule],
        promoter_profile: Dict[str, Any],
        location_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates official subsidy, applies statutory caps, and produces transparent arithmetic audit trail.
        """
        if not scheme_rule:
            return {
                "applicable_subsidy_pct": 0.0,
                "eligible_base_amount": float(eligible_project_cost),
                "raw_subsidy_amount": 0.0,
                "max_subsidy_cap": 0.0,
                "final_subsidy_amount": 0.0,
                "subsidy_timing": "NONE",
                "subsidy_timing_display": "No Subsidy / Commercial Financing",
                "calculation_explanation": "No government scheme selected. Standard commercial funding structure applied with zero subsidy.",
                "calculation_steps": [
                    "No official scheme selected.",
                    "Project evaluated under standard commercial banking guidelines.",
                    "Total subsidy: ₹0.00."
                ],
                "verification_status": "NONE"
            }

        social_category = str(promoter_profile.get('social_category', 'general')).lower()
        special_category = str(promoter_profile.get('special_category', 'none')).lower()
        gender = str(promoter_profile.get('gender', 'male')).lower()
        rural_urban = str(location_data.get('rural_urban', 'rural')).lower()

        is_special = (
            social_category in ['special', 'sc', 'st', 'obc', 'minority'] or
            special_category in ['divyang', 'ner', 'border', 'hill', 'island'] or
            gender == 'female'
        )


        subsidy_matrix = scheme_rule.subsidy_rate_matrix or {}
        matrix_key = f"{'special' if is_special else 'general'}_{rural_urban}"
        subsidy_pct = Decimal(str(subsidy_matrix.get(matrix_key, subsidy_matrix.get('default', Decimal('0.00')))))

        # Eligible base for subsidy
        max_cap_cost = scheme_rule.max_project_cost or eligible_project_cost
        eligible_base = min(eligible_project_cost, max_cap_cost)

        raw_subsidy = (eligible_base * (subsidy_pct / Decimal('100.0'))).quantize(Decimal(ROUNDING), rounding=ROUND_HALF_UP)
        max_cap = scheme_rule.max_subsidy_cap

        if max_cap > Decimal('0.00'):
            final_subsidy = min(raw_subsidy, max_cap)
            is_capped = raw_subsidy > max_cap
        else:
            final_subsidy = raw_subsidy
            is_capped = False

        # Build explainable calculation steps
        steps = [
            f"Step 1 — Eligible Base Cost: ₹{eligible_base:,.2f} determined after applying scheme ceilings (Project Cost: ₹{eligible_project_cost:,.2f}, Max Cap: ₹{max_cap_cost:,.2f}).",
            f"Step 2 — Promoter Classification: Category '{social_category.upper()}' ({'Special/Priority' if is_special else 'General'}) in '{rural_urban.title()}' location entitles to {subsidy_pct}% subsidy rate per {scheme_rule.scheme.code} guidelines.",
            f"Step 3 — Raw Subsidy: ₹{eligible_base:,.2f} × {subsidy_pct}% = ₹{raw_subsidy:,.2f}.",
            f"Step 4 — Ceiling Cap Application: Scheme statutory maximum subsidy ceiling is ₹{max_cap:,.2f}." if max_cap > Decimal('0.00') else "Step 4 — No upper statutory subsidy cap constraint applied.",
            f"Step 5 — Final Applicable Subsidy: ₹{final_subsidy:,.2f} {'(Capped at maximum ceiling)' if is_capped else '(Fully within ceiling)'}."
        ]

        timing_descriptions = {
            SubsidyTiming.BACK_ENDED: "Back-Ended Subsidy: Deposited into a separate Term Deposit Receipt (TDR) in applicant's name with bank. No interest charged on this portion; adjusted against loan after 3-year lock-in.",
            SubsidyTiming.UPFRONT: "Upfront Subsidy: Credited directly at initial loan sanction, directly reducing required bank loan principal.",
            SubsidyTiming.CAPITAL_SUBSIDY: "Credit-Linked Capital Subsidy: Released upon asset verification and credited to loan account.",
            SubsidyTiming.INTEREST_SUBVENTION: "Interest Subvention: Applied directly on loan interest rate reducing annual borrowing cost.",
            SubsidyTiming.REIMBURSEMENT: "Reimbursement: Paid to promoter post-commercial production upon submission of audit report."
        }

        explanation = (
            f"Under {scheme_rule.scheme.name} (Rule Version: {scheme_rule.rule_version}), "
            f"the applicant qualifies for a {subsidy_pct}% subsidy on an eligible base of ₹{eligible_base:,.2f}, "
            f"resulting in ₹{final_subsidy:,.2f} in government assistance. "
            f"{timing_descriptions.get(scheme_rule.subsidy_timing, '')}"
        )

        return {
            "applicable_subsidy_pct": float(subsidy_pct),
            "eligible_base_amount": float(eligible_base),
            "raw_subsidy_amount": float(raw_subsidy),
            "max_subsidy_cap": float(max_cap),
            "final_subsidy_amount": float(final_subsidy),
            "is_capped": is_capped,
            "subsidy_timing": scheme_rule.subsidy_timing,
            "subsidy_timing_display": scheme_rule.get_subsidy_timing_display(),
            "calculation_explanation": explanation,
            "calculation_steps": steps,
            "source_document": scheme_rule.source_document,
            "official_portal_url": scheme_rule.scheme.official_portal_url,
            "rule_version": scheme_rule.rule_version,
            "last_verified_date": scheme_rule.last_verified_date.isoformat(),
            "verification_status": scheme_rule.verification_status
        }
