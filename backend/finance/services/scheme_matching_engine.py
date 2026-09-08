from decimal import Decimal
from typing import Dict, Any, List, Optional
from ..models import SchemeRule, BusinessActivity, VerificationStatus

class SchemeMatchingEngine:
    @staticmethod
    def match_schemes(
        project_cost: Decimal,
        business_activity: Optional[BusinessActivity],
        promoter_profile: Dict[str, Any],
        location_data: Dict[str, Any],
        business_stage: str = 'new'
    ) -> List[Dict[str, Any]]:
        """
        Deterministically evaluates all active scheme rules against promoter, project, and location inputs.
        """
        active_rules = SchemeRule.objects.filter(
            scheme__is_active=True
        ).select_related('scheme').order_by('scheme__code', '-effective_from')

        # De-duplicate to pick the latest rule version per scheme
        seen_schemes = set()
        unique_rules = []
        for rule in active_rules:
            if rule.scheme_id not in seen_schemes:
                seen_schemes.add(rule.scheme_id)
                unique_rules.append(rule)

        results = []

        social_category = str(promoter_profile.get('social_category', 'general')).lower()
        special_category = str(promoter_profile.get('special_category', 'none')).lower()
        gender = str(promoter_profile.get('gender', 'male')).lower()
        age = int(promoter_profile.get('age', 25) or 25)
        rural_urban = str(location_data.get('rural_urban', 'rural')).lower()
        state = str(location_data.get('state', '')).strip()

        is_special_promoter = (
            social_category in ['special', 'sc', 'st', 'obc', 'minority'] or
            special_category in ['divyang', 'ner', 'border', 'hill', 'island'] or
            gender == 'female'
        )


        sector_code = business_activity.sector if business_activity else 'AGRI_ALLIED'

        for rule in unique_rules:
            score = 100
            reasons = []
            eligibility_status = "Eligible"

            # 1. Location match
            if rule.allowed_locations and rural_urban not in rule.allowed_locations:
                score -= 40
                reasons.append(f"Scheme restricted to {', '.join(rule.allowed_locations)} areas (applicant is in {rural_urban} area).")

            # 2. Sector match
            if rule.allowed_sectors and sector_code not in rule.allowed_sectors:
                score -= 40
                reasons.append(f"Scheme targets {', '.join(rule.allowed_sectors)} (selected sector is {sector_code}).")

            # 3. Project stage match
            if rule.allowed_stages and business_stage.lower() not in rule.allowed_stages:
                score -= 20
                reasons.append(f"Scheme covers {', '.join(rule.allowed_stages)} units (current stage is {business_stage}).")

            # 4. Project cost range
            if rule.min_project_cost and project_cost < rule.min_project_cost:
                score -= 25
                reasons.append(f"Project cost ₹{project_cost:,.2f} is below scheme floor of ₹{rule.min_project_cost:,.2f}.")
            if rule.max_project_cost and project_cost > rule.max_project_cost:
                score -= 15
                reasons.append(f"Project cost ₹{project_cost:,.2f} exceeds standard ceiling ₹{rule.max_project_cost:,.2f} (funding will be capped).")

            # 5. Promoter Age
            if age < rule.min_promoter_age:
                score -= 50
                reasons.append(f"Minimum applicant age is {rule.min_promoter_age} years (applicant is {age}).")
            if rule.max_promoter_age and age > rule.max_promoter_age:
                score -= 50
                reasons.append(f"Maximum applicant age is {rule.max_promoter_age} years (applicant is {age}).")

            # 6. Scheme-specific criteria
            if rule.scheme.code == 'STAND_UP_INDIA':
                # Strictly for Women or SC/ST
                if gender != 'female' and social_category not in ['sc', 'st']:
                    score = 0
                    reasons.append("Stand-Up India is exclusively reserved for SC/ST and Women entrepreneurs.")

            # Determine final eligibility status
            if rule.verification_status == VerificationStatus.PENDING_VERIFICATION:
                eligibility_status = "Verification Required"
            elif score >= 80:
                eligibility_status = "Eligible"
            elif score >= 50:
                eligibility_status = "Potentially Eligible"
            else:
                eligibility_status = "Not Eligible"

            # Determine subsidy percentage from matrix
            subsidy_matrix = rule.subsidy_rate_matrix or {}
            subsidy_key = f"{'special' if is_special_promoter else 'general'}_{rural_urban}"
            subsidy_rate = Decimal(str(subsidy_matrix.get(subsidy_key, subsidy_matrix.get('default', 0.0))))

            # Determine promoter margin requirement
            margin_matrix = rule.promoter_contribution_matrix or {}
            margin_key = 'special' if is_special_promoter else 'general'
            required_margin_pct = Decimal(str(margin_matrix.get(margin_key, margin_matrix.get('default', 10.0))))

            # Calculate preliminary subsidy preview
            eligible_base = min(project_cost, rule.max_project_cost or project_cost)
            raw_subsidy = eligible_base * (subsidy_rate / Decimal('100.0'))
            final_subsidy = min(raw_subsidy, rule.max_subsidy_cap) if rule.max_subsidy_cap > Decimal('0.00') else raw_subsidy

            # State top-ups if present
            state_top_up_info = None
            if state and rule.state_top_ups and state in rule.state_top_ups:
                state_top_up_info = rule.state_top_ups[state]

            results.append({
                "rule_id": rule.id,
                "scheme_id": rule.scheme.id,
                "scheme_code": rule.scheme.code,
                "scheme_name": rule.scheme.name,
                "ministry": rule.scheme.ministry,
                "scheme_type": rule.scheme.scheme_type,
                "eligibility_status": eligibility_status,
                "eligibility_score": max(0, min(100, score)),
                "reasons": reasons if reasons else ["Meets all baseline eligibility criteria."],
                "applicable_subsidy_pct": float(subsidy_rate),
                "estimated_subsidy_amount": float(final_subsidy),
                "max_subsidy_cap": float(rule.max_subsidy_cap),
                "required_margin_pct": float(required_margin_pct),
                "annual_interest_rate": float(rule.interest_rate_annual),
                "interest_subvention_pct": float(rule.interest_subvention_pct),
                "effective_interest_rate": float(max(Decimal('0.00'), rule.interest_rate_annual - rule.interest_subvention_pct)),
                "tenure_months": rule.tenure_months,
                "moratorium_months": rule.moratorium_months,
                "moratorium_policy": rule.moratorium_policy,
                "collateral_support": rule.collateral_support,
                "state_top_up": state_top_up_info,
                "subsidy_timing": rule.subsidy_timing,
                "required_documents": rule.required_documents,
                "official_portal_url": rule.scheme.official_portal_url,
                "source_document": rule.source_document,
                "rule_version": rule.rule_version,
                "last_verified_date": rule.last_verified_date.isoformat(),
                "verification_status": rule.verification_status
            })

        # Sort: Eligible first, then highest subsidy rate, then highest score
        status_rank = {"Eligible": 0, "Potentially Eligible": 1, "Verification Required": 2, "Not Eligible": 3}
        results.sort(key=lambda x: (status_rank.get(x['eligibility_status'], 4), -x['applicable_subsidy_pct'], -x['eligibility_score']))
        return results

