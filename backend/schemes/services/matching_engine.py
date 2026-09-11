from decimal import Decimal
from typing import Dict, Any, List, Optional
from django.db.models import Q
from ..models import GovtScheme, SchemeStatus, VerificationStatus, GovernmentLevel


# Business activity → canonical sector slug mapping for strict sub-branch matching
ACTIVITY_SECTOR_MAP: Dict[str, List[str]] = {
    # Dairy & Livestock
    'dairy farming': ['dairy-livestock'],
    'dairy': ['dairy-livestock'],
    'milk chilling': ['dairy-livestock'],
    'cattle': ['dairy-livestock'],
    'poultry': ['dairy-livestock'],
    'goat farming': ['dairy-livestock'],
    'pig farming': ['dairy-livestock'],
    'sheep farming': ['dairy-livestock'],
    'animal husbandry': ['dairy-livestock'],
    'veterinary': ['dairy-livestock'],
    'fodder': ['dairy-livestock'],
    # Agriculture & Food Processing
    'agriculture': ['agriculture-food'],
    'farming': ['agriculture-food'],
    'crop': ['agriculture-food'],
    'flour mill': ['agriculture-food'],
    'rice mill': ['agriculture-food'],
    'oil extraction': ['agriculture-food'],
    'food processing': ['agriculture-food'],
    'cold storage': ['agriculture-food', 'infrastructure'],
    'organic farming': ['agriculture-food'],
    'spices': ['agriculture-food'],
    'pulses': ['agriculture-food'],
    'horticulture': ['agriculture-food'],
    'fruit processing': ['agriculture-food'],
    'vegetable': ['agriculture-food'],
    'pickle': ['agriculture-food'],
    'jam': ['agriculture-food'],
    'bakery': ['agriculture-food'],
    'honey': ['agriculture-food'],
    'masala': ['agriculture-food'],
    # Fisheries
    'fish': ['fisheries'],
    'fishery': ['fisheries'],
    'aquaculture': ['fisheries'],
    'shrimp': ['fisheries'],
    'biofloc': ['fisheries'],
    'prawn': ['fisheries'],
    # Handicraft & Artisans
    'handicraft': ['handicraft-artisan'],
    'handloom': ['handicraft-artisan'],
    'weaving': ['handicraft-artisan'],
    'pottery': ['handicraft-artisan'],
    'bamboo': ['handicraft-artisan'],
    'cane': ['handicraft-artisan'],
    'terracotta': ['handicraft-artisan'],
    'leather': ['handicraft-artisan'],
    'artisan': ['handicraft-artisan'],
    'craft': ['handicraft-artisan'],
    'embroidery': ['handicraft-artisan'],
    'textile': ['handicraft-artisan'],
    'blacksmith': ['handicraft-artisan'],
    'carpenter': ['handicraft-artisan'],
    'goldsmith': ['handicraft-artisan'],
    'stone carving': ['handicraft-artisan'],
    # MSME & Manufacturing
    'manufacturing': ['msme-manufacturing'],
    'production unit': ['msme-manufacturing'],
    'small factory': ['msme-manufacturing'],
    'workshop': ['msme-manufacturing'],
    'fabrication': ['msme-manufacturing'],
    'printing': ['msme-manufacturing'],
    'packaging': ['msme-manufacturing'],
    'plastic': ['msme-manufacturing'],
    'metal works': ['msme-manufacturing'],
    'auto parts': ['msme-manufacturing'],
    # Renewable Energy
    'solar': ['renewable-green'],
    'biogas': ['renewable-green'],
    'wind': ['renewable-green'],
    'green energy': ['renewable-green'],
    'renewable': ['renewable-green'],
    'biomass': ['renewable-green'],
    'vermicompost': ['renewable-green', 'agriculture-food'],
    # Rural Services & Logistics
    'transport': ['rural-services'],
    'logistics': ['rural-services'],
    'auto rickshaw': ['rural-services'],
    'truck': ['rural-services'],
    'repair workshop': ['rural-services'],
    'mechanic': ['rural-services'],
    'rural retail': ['rural-services'],
    'grocery': ['rural-services'],
    'pharmacy': ['rural-services'],
    'beauty parlour': ['rural-services'],
    'salon': ['rural-services'],
    'tailoring': ['rural-services', 'handicraft-artisan'],
    'custom hiring': ['rural-services'],
    'agri drone': ['rural-services', 'agriculture-food'],
    # Farm Infrastructure & Storage
    'warehouse': ['infrastructure'],
    'godown': ['infrastructure'],
    'silo': ['infrastructure'],
    'pack house': ['infrastructure'],
    'grading unit': ['infrastructure'],
    'irrigation': ['infrastructure', 'agriculture-food'],
    # Tourism & Hospitality
    'homestay': ['tourism-hospitality'],
    'eco tourism': ['tourism-hospitality'],
    'hotel': ['tourism-hospitality'],
    'resort': ['tourism-hospitality'],
    'restaurant': ['tourism-hospitality'],
    'tourism': ['tourism-hospitality'],
    # Digital & Startups
    'tech': ['digital-startups'],
    'software': ['digital-startups'],
    'startup': ['digital-startups'],
    'digital': ['digital-startups'],
    'it services': ['digital-startups'],
    # Women & SHGs
    'shg': ['women-shgs'],
    'self help group': ['women-shgs'],
}

# Broad sectors that match any scheme not narrowly restricted
BROAD_SECTORS = {'msme', 'msme-manufacturing', 'general', 'all sectors', 'all msme', 'rural', 'allied agriculture'}


def resolve_activity_sectors(business_sector: Optional[str], business_activity: Optional[str]) -> List[str]:
    """
    Returns list of resolved category slugs from sector + activity strings.
    E.g. 'Dairy Farming' → ['dairy-livestock']
    """
    slugs = set()
    for term in [(business_sector or '').lower(), (business_activity or '').lower()]:
        if not term:
            continue
        for key, cats in ACTIVITY_SECTOR_MAP.items():
            if key in term or term in key:
                slugs.update(cats)
    # If no specific match, extract category from sector string directly
    if not slugs and business_sector:
        s = business_sector.lower()
        if 'dairy' in s or 'livestock' in s or 'animal' in s:
            slugs.add('dairy-livestock')
        elif 'agri' in s or 'food' in s or 'crop' in s or 'farm' in s:
            slugs.add('agriculture-food')
        elif 'fish' in s or 'aqua' in s:
            slugs.add('fisheries')
        elif 'handicraft' in s or 'artisan' in s or 'handloom' in s or 'textile' in s:
            slugs.add('handicraft-artisan')
        elif 'solar' in s or 'energy' in s or 'renew' in s or 'green' in s:
            slugs.add('renewable-green')
        elif 'fish' in s or 'aqua' in s:
            slugs.add('fisheries')
        elif 'tourism' in s or 'hospital' in s or 'homestay' in s:
            slugs.add('tourism-hospitality')
        elif 'infra' in s or 'storage' in s or 'warehouse' in s:
            slugs.add('infrastructure')
        elif 'service' in s or 'logistics' in s or 'transport' in s:
            slugs.add('rural-services')
        elif 'digital' in s or 'tech' in s or 'startup' in s:
            slugs.add('digital-startups')
        elif 'women' in s or 'shg' in s:
            slugs.add('women-shgs')
        elif 'msme' in s or 'manufactur' in s or 'production' in s:
            slugs.add('msme-manufacturing')
    return list(slugs)


def scheme_sector_match_level(scheme: GovtScheme, target_slugs: List[str]) -> str:
    """
    Returns 'exact', 'broad', or 'none'.
    - 'exact': scheme category matches one of the resolved target slugs
    - 'broad': scheme targets 'all MSME' / 'Rural Manufacturing' broadly
    - 'none': scheme is sector-restricted to something different
    """
    if not target_slugs:
        return 'broad'  # No sector info → treat as broad match

    scheme_cat_slug = scheme.category.slug if scheme.category else ''
    scheme_sectors_lower = [str(s).lower() for s in (scheme.sectors or [])]

    # Direct category slug match
    if scheme_cat_slug in target_slugs:
        return 'exact'

    # Sector keyword exact match
    for t_slug in target_slugs:
        slug_tokens = t_slug.replace('-', ' ').split()
        for s_sector in scheme_sectors_lower:
            if any(tok in s_sector for tok in slug_tokens):
                return 'exact'

    # Broad match: scheme covers all MSME / general rural
    for s_sector in scheme_sectors_lower:
        if any(broad in s_sector for broad in BROAD_SECTORS):
            return 'broad'

    # Check if scheme has no sector restriction (empty sectors list)
    if not scheme.sectors:
        return 'broad'

    return 'none'


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

        Scoring breakdown (100 pts total):
          Location:  25 pts
          Business:  25 pts (strict: exact sector=25, broad=15, none=5)
          Promoter:  25 pts (via DB eligibility rules — no hardcoded scheme IDs)
          Cost:      15 pts
          Benefit:   10 pts
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
        education = (promoter_profile.get('education') or '').lower()

        is_special_promoter = (
            social_category in ['sc', 'st', 'obc', 'minority', 'special'] or
            special_category in ['divyang', 'physically_handicapped', 'ex_servicemen', 'ner', 'border', 'island'] or
            gender == 'female'
        )

        # Resolve target sector slugs for strict matching
        target_slugs = resolve_activity_sectors(business_sector, business_activity)

        # -------------------------------------------------------------------
        # STAGE 1: Candidate Retrieval
        # -------------------------------------------------------------------
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

        # -------------------------------------------------------------------
        # STAGE 2: Rule Evaluation & Dimensional Scoring
        # -------------------------------------------------------------------
        for scheme in candidates:
            total_evaluated += 1
            fin_rule = getattr(scheme, 'financial_rule', None)

            dim_location = 25
            dim_business = 25
            dim_promoter = 25
            dim_cost = 15
            dim_benefit = 10

            matched_reasons = []
            unmet_reasons = []
            is_disqualified = False

            # ---------------------------------------------------------------
            # Dimension 1: Location Matching (25 pts)
            # ---------------------------------------------------------------
            if scheme.level == GovernmentLevel.CENTRAL:
                matched_reasons.append("✓ Central scheme applicable across all Indian States & Union Territories.")
            elif scheme.state and user_state:
                if scheme.state.lower() == user_state.lower():
                    dim_location = 25
                    matched_reasons.append(f"✓ Tailored state scheme for {scheme.state}.")
                    if scheme.districts:
                        if user_district and any(user_district.lower() in str(d).lower() for d in scheme.districts):
                            matched_reasons.append(f"✓ Specifically targeted for {user_district} district.")
                        else:
                            dim_location -= 10
                            unmet_reasons.append(f"Targeted for districts: {', '.join(str(d) for d in scheme.districts)}.")
                else:
                    dim_location = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicable only in {scheme.state} (your location: {user_state}).")
            else:
                dim_location = 15

            # Rural/Urban eligibility rule check
            rule_rural_urban = scheme.eligibility_rules.filter(field='rural_urban').first()
            if rule_rural_urban:
                expected = rule_rural_urban.expected_value
                if isinstance(expected, list):
                    allowed = [str(x).lower() for x in expected]
                    if rural_urban not in allowed:
                        dim_location = max(0, dim_location - 15)
                        unmet_reasons.append(f"Restricted to {', '.join(expected)} areas (you are in {rural_urban} area).")
                    else:
                        matched_reasons.append(f"✓ Covers {rural_urban} enterprises.")
                elif isinstance(expected, str) and expected.lower() != rural_urban:
                    dim_location = max(0, dim_location - 15)
                    unmet_reasons.append(f"Restricted to {expected} area (you are in {rural_urban} area).")

            # ---------------------------------------------------------------
            # Dimension 2: Business Sector & Activity Matching (25 pts)
            # Strict: exact sub-branch = 25, broad MSME = 15, none = 5
            # ---------------------------------------------------------------
            sector_level = scheme_sector_match_level(scheme, target_slugs)

            if sector_level == 'exact':
                dim_business = 25
                matched_reasons.append(f"✓ Scheme directly supports {business_sector or business_activity or 'your'} enterprise sector.")
            elif sector_level == 'broad':
                dim_business = 15
                matched_reasons.append(f"✓ Broad MSME/rural scheme applicable to your sector (potentially eligible).")
                unmet_reasons.append(f"Scheme covers all MSME/rural enterprises — not exclusively your sector.")
            else:
                dim_business = 5
                unmet_reasons.append(f"Scheme sectors: {', '.join(scheme.sectors or ['General'])} — does not match {business_sector or 'your sector'}.")

            # Business stage eligibility rule
            rule_stage = scheme.eligibility_rules.filter(field='business_stage').first()
            if rule_stage:
                expected_stages = rule_stage.expected_value
                if isinstance(expected_stages, list):
                    if business_stage.lower() not in [str(s).lower() for s in expected_stages]:
                        dim_business = max(0, dim_business - 10)
                        unmet_reasons.append(f"Restricted to {', '.join(expected_stages)} businesses (yours: {business_stage}).")
                    else:
                        matched_reasons.append(f"✓ Valid for {business_stage} business setup.")

            # ---------------------------------------------------------------
            # Dimension 3: Promoter Profile Matching (25 pts)
            # All checks done via DB eligibility rules — NO hardcoded scheme IDs
            # ---------------------------------------------------------------

            # Age check
            rule_age = scheme.eligibility_rules.filter(field='age').first()
            if rule_age:
                ev = rule_age.expected_value
                min_age = 18
                max_age = None
                if isinstance(ev, dict):
                    min_age = int(ev.get('min', 18))
                    max_age = ev.get('max')
                elif isinstance(ev, (int, float)):
                    min_age = int(ev)
                if age < min_age:
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicant age ({age}) is below minimum of {min_age} years.")
                elif max_age and age > int(max_age):
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Applicant age ({age}) exceeds maximum of {max_age} years.")
                else:
                    matched_reasons.append(f"✓ Age ({age} years) within permissible range.")
            else:
                matched_reasons.append("✓ No age restriction for this scheme.")

            # Gender eligibility — READ FROM RULES, not hardcoded IDs
            rule_gender = scheme.eligibility_rules.filter(field='gender').first()
            if rule_gender and not is_disqualified:
                ev = rule_gender.expected_value
                allowed_genders = ev if isinstance(ev, list) else [ev]
                allowed_genders_lower = [str(g).lower() for g in allowed_genders]
                if gender not in allowed_genders_lower:
                    dim_promoter = 0
                    is_disqualified = True
                    gender_label = '/'.join(g.capitalize() for g in allowed_genders_lower)
                    unmet_reasons.append(f"✕ Exclusively reserved for {gender_label} applicants.")
                else:
                    matched_reasons.append(f"✓ Gender eligibility satisfied ({gender.capitalize()}).")

            # Social category eligibility — READ FROM RULES
            rule_social = scheme.eligibility_rules.filter(field='social_category').first()
            if rule_social and not is_disqualified:
                ev = rule_social.expected_value
                allowed_cats = ev if isinstance(ev, list) else [ev]
                allowed_cats_lower = [str(c).lower() for c in allowed_cats]
                if social_category not in allowed_cats_lower and 'all' not in allowed_cats_lower:
                    dim_promoter = 0
                    is_disqualified = True
                    unmet_reasons.append(f"✕ Reserved for: {', '.join(c.upper() for c in allowed_cats_lower)}.")
                else:
                    cat_label = social_category.upper() if social_category != 'general' else 'General Category'
                    matched_reasons.append(f"✓ Social category ({cat_label}) satisfies scheme criteria.")

            # Education eligibility — READ FROM RULES
            rule_edu = scheme.eligibility_rules.filter(field='education').first()
            if rule_edu and not is_disqualified and education:
                ev = rule_edu.expected_value
                if isinstance(ev, str):
                    edu_req = ev.lower()
                    edu_levels = ['illiterate', '5th pass', '8th pass', '10th pass', '12th pass', 'graduate', 'postgraduate']
                    req_idx = next((i for i, e in enumerate(edu_levels) if e in edu_req), -1)
                    usr_idx = next((i for i, e in enumerate(edu_levels) if e in education), 99)
                    if req_idx >= 0 and usr_idx < req_idx:
                        dim_promoter = max(0, dim_promoter - 10)
                        unmet_reasons.append(f"Minimum education: {ev}.")
                    elif req_idx >= 0:
                        matched_reasons.append(f"✓ Education qualification ({education}) meets requirement.")

            # Special category promoter bonus
            if is_special_promoter and not is_disqualified:
                if social_category in ['sc', 'st']:
                    matched_reasons.append("✓ SC/ST applicant — eligible for higher subsidy tier.")
                elif gender == 'female':
                    matched_reasons.append("✓ Woman entrepreneur — eligible for preferential subsidy and lower margin.")
                elif social_category == 'obc':
                    matched_reasons.append("✓ OBC applicant — eligible for special category benefits.")

            # ---------------------------------------------------------------
            # Dimension 4: Project Cost Matching (15 pts)
            # ---------------------------------------------------------------
            if fin_rule:
                if fin_rule.min_project_cost and project_cost < fin_rule.min_project_cost:
                    dim_cost = 5
                    unmet_reasons.append(f"Project cost ₹{project_cost:,.0f} below minimum ₹{fin_rule.min_project_cost:,.0f}.")
                elif fin_rule.max_project_cost and project_cost > fin_rule.max_project_cost:
                    dim_cost = 8
                    unmet_reasons.append(f"Project cost ₹{project_cost:,.0f} exceeds ceiling ₹{fin_rule.max_project_cost:,.0f} (benefits capped).")
                else:
                    dim_cost = 15
                    matched_reasons.append(f"✓ Project cost ₹{project_cost:,.0f} fits within statutory limits.")
            else:
                dim_cost = 12

            # ---------------------------------------------------------------
            # Dimension 5: Benefit Relevance (10 pts)
            # ---------------------------------------------------------------
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

            eligible_base = min(project_cost, fin_rule.max_project_cost if fin_rule and fin_rule.max_project_cost else project_cost)
            raw_subsidy = eligible_base * (subsidy_rate / Decimal('100.0'))
            final_subsidy = min(raw_subsidy, subsidy_cap) if subsidy_cap > Decimal('0.00') else raw_subsidy
            required_margin_amount = eligible_base * (margin_rate / Decimal('100.0'))

            if final_subsidy > Decimal('0.00'):
                matched_reasons.append(f"✓ Capital subsidy: {subsidy_rate}% (up to ₹{final_subsidy:,.0f}).")
                dim_benefit = 10
            elif interest_subvention > Decimal('0.00'):
                matched_reasons.append(f"✓ Interest subvention: {interest_subvention}% p.a. off lending rate.")
                dim_benefit = 9
            elif fin_rule and 'free' in fin_rule.collateral_type.lower():
                matched_reasons.append("✓ Collateral-free credit guarantee available.")
                dim_benefit = 8
            else:
                dim_benefit = 6

            # ---------------------------------------------------------------
            # Compute Total Score & Eligibility Status
            # ---------------------------------------------------------------
            raw_total = dim_location + dim_business + dim_promoter + dim_cost + dim_benefit

            if is_disqualified:
                total_score = 0
                status = "Not Eligible"
            else:
                total_score = max(0, min(100, raw_total))
                if scheme.verification_status == VerificationStatus.PENDING_VERIFICATION:
                    status = "Verification Required"
                    needs_verification_count += 1
                elif total_score >= 75 and sector_level == 'exact':
                    status = "Eligible"
                    verified_matches_count += 1
                elif total_score >= 50:
                    status = "Potentially Eligible"
                    verified_matches_count += 1
                else:
                    status = "Not Eligible"

            if total_score >= min_score_threshold:
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
                    "sector_match_level": sector_level,
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

        # Sort: Eligible first → highest subsidy → highest score
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
            "disclaimer": "Benefit estimates are based on official government scheme parameters and do not constitute a credit sanction or legal guarantee. Final sanction is subject to lender verification."
        }
