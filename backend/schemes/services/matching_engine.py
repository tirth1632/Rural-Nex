from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db.models import Q
from ..models import GovtScheme, SchemeStatus, VerificationStatus, GovernmentLevel


class SchemeMatchingEngine:
    @staticmethod
    def match_schemes(
        project_cost: Decimal,
        business_sector: Optional[str] = None,
        business_activity: Optional[str] = None,
        location: Optional[Dict[str, Any]] = None,
        promoter_profile: Optional[Dict[str, Any]] = None,
        business_stage: str = 'new',
        own_contribution: Optional[Decimal] = None,
        min_score_threshold: int = 20
    ) -> Dict[str, Any]:
        """
        Two-stage deterministic matching engine.
        Stage 1: Candidate retrieval based on location scope and status.
        Stage 2: Detailed rule evaluation and dimensional scoring.
        """
        location = location or {}
        promoter_profile = promoter_profile or {}

        user_state = (location.get('state') or '').strip()
        user_district = (location.get('district') or '').strip()
        rural_urban = (location.get('rural_urban') or 'rural').lower()

        gender = (promoter_profile.get('gender') or 'male').lower()
        age = int(promoter_profile.get('age') or 28)
        social_category = (promoter_profile.get('social_category') or 'general').lower()
        special_category = (promoter_profile.get('special_category') or 'none').lower()
        min_education = (promoter_profile.get('education') or '').lower()

        is_special_promoter = (
            social_category in ['sc', 'st', 'obc', 'minority', 'special'] or
            special_category in ['divyang', 'physically_handicapped', 'ex_servicemen', 'ner', 'border', 'island'] or
            gender == 'female'
        )

        # -------------------------------------------------------------
        # STAGE 1: Candidate Retrieval
        # -------------------------------------------------------------
        # Schemes that are either Central (applicable nationwide) OR match the user's state
        candidate_query = Q(status=SchemeStatus.ACTIVE)
        if user_state:
            candidate_query &= (Q(level=GovernmentLevel.CENTRAL) | Q(state__iexact=user_state) | Q(state=''))
        else:
            candidate_query &= Q(level=GovernmentLevel.CENTRAL)

        candidates = GovtScheme.objects.filter(candidate_query).select_related(
            'financial_rule', 'category'
        ).prefetch_related('eligibility_rules', 'benefits', 'documents', 'application_steps')

        matched_results = []
        total_evaluated = 0
        verified_matches_count = 0
        needs_verification_count = 0

        # -------------------------------------------------------------
        # STAGE 2: Rule Evaluation & Dimensional Scoring
        # -------------------------------------------------------------
        for scheme in candidates:
            total_evaluated += 1
            fin_rule = getattr(scheme, 'financial_rule', None)

            # Dimensions (Total 100)
            # Location: 25 pts
            # Business: 25 pts
            # Promoter: 25 pts
            # Cost: 15 pts
            # Benefit: 10 pts
            dim_location = 25
            dim_business = 25
            dim_promoter = 25
            dim_cost = 15
            dim_benefit = 10

            matched_reasons = []
            unmet_reasons = []
            is_disqualified = False

            # --- Dimension 1: Location Matching ---
            if scheme.level == GovernmentLevel.CENTRAL:
                matched_reasons.append("✓ Central scheme applicable across all Indian States & Union Territories.")
            elif scheme.state and user_state:
                if scheme.state.lower() == user_state.lower():
                    dim_location = 25
                    matched_reasons.append(f"✓ Tailored state scheme for {scheme.state}.")
                    # Check district if specified
                    if scheme.districts:
                        if user_district and any(user_district.lower() in str(d).lower() for d in scheme.districts):
                            matched_reasons.append(f"✓ Specifically targeted for {user_district} district.")
                        else:
                            dim_location -= 10
                            unmet_reasons.append(f"Targeted for districts: {', '.join(scheme.districts)}.")
                else:
                    dim_location = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicable only in {scheme.state} (your location is {user_state}).")
            else:
                dim_location = 15

            # Rural/Urban check against rules
            rule_rural_urban = scheme.eligibility_rules.filter(field='rural_urban').first()
            if rule_rural_urban:
                expected = rule_rural_urban.expected_value
                if isinstance(expected, list):
                    if rural_urban not in [str(x).lower() for x in expected]:
                        dim_location -= 15
                        unmet_reasons.append(f"Restricted to {', '.join(expected)} areas (applicant location is {rural_urban}).")
                    else:
                        matched_reasons.append(f"✓ Covers {rural_urban} enterprises.")

            # --- Dimension 2: Business Sector & Activity Matching ---
            matched_sector = False
            if business_sector:
                scheme_sectors = [str(s).lower() for s in (scheme.sectors or [])]
                b_sec = business_sector.lower()
                for s in scheme_sectors:
                    if b_sec in s or s in b_sec or 'all' in s or 'msme' in s:
                        matched_sector = True
                        break

            if matched_sector or not business_sector:
                dim_business = 25
                matched_reasons.append(f"✓ Supports {business_sector or 'selected'} enterprise sector.")
            else:
                dim_business = 5
                unmet_reasons.append(f"Target sectors: {', '.join(scheme.sectors or ['General MSME'])}.")

            # Stage check
            rule_stage = scheme.eligibility_rules.filter(field='business_stage').first()
            if rule_stage:
                expected_stages = rule_stage.expected_value
                if isinstance(expected_stages, list) and business_stage.lower() not in [str(s).lower() for s in expected_stages]:
                    dim_business -= 10
                    unmet_reasons.append(f"Restricted to {', '.join(expected_stages)} businesses (applicant is {business_stage}).")
                else:
                    matched_reasons.append(f"✓ Valid for {business_stage} business setup.")

            # --- Dimension 3: Promoter Profile Matching ---
            # Age check
            rule_age = scheme.eligibility_rules.filter(field='age').first()
            if rule_age:
                min_age = 18
                max_age = None
                if isinstance(rule_age.expected_value, dict):
                    min_age = rule_age.expected_value.get('min', 18)
                    max_age = rule_age.expected_value.get('max')
                if age < min_age:
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicant age ({age}) is below scheme minimum of {min_age} years.")
                elif max_age and age > max_age:
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicant age ({age}) exceeds scheme maximum limit of {max_age} years.")
                else:
                    matched_reasons.append(f"✓ Promoter age ({age} years) is within permissible range.")
            else:
                matched_reasons.append(f"✓ Promoter age requirement met.")

            # Gender / Special category restrictions (e.g. Stand-Up India, MMUY)
            if scheme.official_id in ['STAND_UP_INDIA', 'MMUY_GUJ']:
                if scheme.official_id == 'MMUY_GUJ' and gender != 'female':
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append("✕ Exclusively reserved for Women Self-Help Groups (SHGs) and Women Entrepreneurs.")
                elif scheme.official_id == 'STAND_UP_INDIA' and (gender != 'female' and social_category not in ['sc', 'st']):
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append("✕ Exclusively reserved for SC/ST or Women Entrepreneurs.")
                else:
                    matched_reasons.append("✓ Satisfies affirmative reservation criteria for priority credit.")

            # --- Dimension 4: Project Cost Matching ---
            if fin_rule:
                if fin_rule.min_project_cost and project_cost < fin_rule.min_project_cost:
                    dim_cost = 5
                    unmet_reasons.append(f"Project outlay ₹{project_cost:,.2f} is below minimum limit ₹{fin_rule.min_project_cost:,.2f}.")
                elif fin_rule.max_project_cost and project_cost > fin_rule.max_project_cost:
                    dim_cost = 8
                    unmet_reasons.append(f"Project outlay ₹{project_cost:,.2f} exceeds standard ceiling ₹{fin_rule.max_project_cost:,.2f} (benefits will be capped).")
                else:
                    dim_cost = 15
                    matched_reasons.append(f"✓ Project cost ₹{project_cost:,.2f} fits within statutory funding limits.")
            else:
                dim_cost = 12

            # --- Dimension 5: Benefit Relevance ---
            # Evaluate subsidy / interest rates
            subsidy_rate = Decimal('0.00')
            margin_rate = Decimal('10.00')
            subsidy_cap = Decimal('0.00')
            interest_rate = Decimal('8.50')
            interest_subvention = Decimal('0.00')

            if fin_rule:
                if is_special_promoter:
                    subsidy_rate = fin_rule.subsidy_rate_special_rural if rural_urban == 'rural' else fin_rule.subsidy_rate_special_urban
                    margin_rate = fin_rule.promoter_margin_special_pct
                else:
                    subsidy_rate = fin_rule.subsidy_rate_general_rural if rural_urban == 'rural' else fin_rule.subsidy_rate_general_urban
                    margin_rate = fin_rule.min_promoter_margin_pct

                subsidy_cap = fin_rule.max_subsidy_amount
                interest_rate = fin_rule.interest_rate_min
                interest_subvention = fin_rule.interest_subvention_pct

            # Calculate potential amounts
            eligible_base = min(project_cost, fin_rule.max_project_cost if fin_rule and fin_rule.max_project_cost else project_cost)
            raw_subsidy = eligible_base * (subsidy_rate / Decimal('100.0'))
            final_subsidy = min(raw_subsidy, subsidy_cap) if subsidy_cap > Decimal('0.00') else raw_subsidy
            required_margin_amount = eligible_base * (margin_rate / Decimal('100.0'))

            if final_subsidy > Decimal('0.00'):
                matched_reasons.append(f"✓ High capital subsidy: {subsidy_rate}% (up to ₹{final_subsidy:,.2f}).")
                dim_benefit = 10
            elif interest_subvention > Decimal('0.00'):
                matched_reasons.append(f"✓ Subsidized credit: {interest_subvention}% annual interest subvention.")
                dim_benefit = 9
            else:
                dim_benefit = 6

            # Compute Total Score
            if is_disqualified:
                total_score = max(0, min(dim_location + dim_business + dim_promoter + dim_cost + dim_benefit, 35))
                status = "Not Eligible"
            else:
                total_score = max(0, min(100, dim_location + dim_business + dim_promoter + dim_cost + dim_benefit))
                if scheme.verification_status == VerificationStatus.PENDING_VERIFICATION:
                    status = "Verification Required"
                    needs_verification_count += 1
                elif total_score >= 75:
                    status = "Eligible"
                    verified_matches_count += 1
                elif total_score >= 50:
                    status = "Potentially Eligible"
                    verified_matches_count += 1
                else:
                    status = "Not Eligible"

            if total_score >= min_score_threshold:
                # Primary benefits preview
                primary_benefit_title = "Credit & Subsidy Facility"
                primary_benefit = scheme.benefits.filter(is_primary=True).first() or scheme.benefits.first()
                if primary_benefit:
                    primary_benefit_title = primary_benefit.title

                matched_results.append({
                    "id": str(scheme.id),
                    "official_id": scheme.official_id,
                    "name": scheme.name,
                    "short_name": scheme.short_name,
                    "level": scheme.level,
                    "state": scheme.state,
                    "ministry": scheme.ministry,
                    "department": scheme.department,
                    "nodal_agency": scheme.nodal_agency,
                    "category": scheme.category.name if scheme.category else 'General Welfare',
                    "category_slug": scheme.category.slug if scheme.category else 'general',
                    "sectors": scheme.sectors,
                    "description": scheme.description,
                    "short_description": scheme.short_description or scheme.description[:180] + '...',
                    "eligibility_status": status,
                    "match_score": total_score,
                    "dimension_scores": {
                        "location": dim_location,
                        "business": dim_business,
                        "promoter": dim_promoter,
                        "cost": dim_cost,
                        "benefit": dim_benefit,
                    },
                    "matched_reasons": matched_reasons,
                    "unmet_reasons": unmet_reasons,
                    "financial_preview": {
                        "project_cost": float(project_cost),
                        "eligible_base": float(eligible_base),
                        "applicable_subsidy_pct": float(subsidy_rate),
                        "potential_subsidy_amount": float(final_subsidy),
                        "required_promoter_margin_pct": float(margin_rate),
                        "required_promoter_margin_amount": float(required_margin_amount),
                        "interest_rate_min": float(interest_rate),
                        "interest_subvention_pct": float(interest_subvention),
                        "effective_interest_rate": float(max(Decimal('0.00'), interest_rate - interest_subvention)),
                        "collateral_requirement": fin_rule.collateral_type if fin_rule else 'Not specified',
                        "subsidy_timing": fin_rule.subsidy_timing if fin_rule else 'BACK_ENDED',
                    },
                    "primary_benefit": primary_benefit_title,
                    "official_portal_url": scheme.official_portal_url,
                    "source_name": scheme.source_name,
                    "source_document": scheme.source_document,
                    "scheme_version": scheme.scheme_version,
                    "last_verified_date": scheme.last_verified_date.isoformat(),
                    "verification_status": scheme.verification_status,
                })

        # Sort: Eligible first, then highest subsidy %, then highest match score
        status_ranks = {"Eligible": 0, "Potentially Eligible": 1, "Verification Required": 2, "Not Eligible": 3}
        matched_results.sort(key=lambda x: (
            status_ranks.get(x['eligibility_status'], 4),
            -x['financial_preview']['applicable_subsidy_pct'],
            -x['match_score']
        ))

        return {
            "matched_schemes": matched_results,
            "total_matches": len(matched_results),
            "verified_matches": verified_matches_count,
            "needs_verification": needs_verification_count,
            "total_evaluated": total_evaluated,
            "disclaimer": "Potential benefits are calculated based on official government scheme parameters and do not constitute a credit sanction or legal guarantee. Final sanction is subject to lender verification."
        }
