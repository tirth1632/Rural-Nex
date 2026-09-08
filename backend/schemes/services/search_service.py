from typing import Dict, Any, Optional
from decimal import Decimal
from django.db.models import Q, Count
from django.core.paginator import Paginator
from ..models import GovtScheme, SchemeStatus, VerificationStatus, GovernmentLevel, SchemeCategory


class SchemeSearchService:
    @staticmethod
    def search(
        query: Optional[str] = None,
        jurisdiction: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        benefit_type: Optional[str] = None,
        min_cost: Optional[Decimal] = None,
        max_cost: Optional[Decimal] = None,
        collateral_free_only: bool = False,
        verified_only: bool = False,
        sort_by: str = 'relevance',
        page: int = 1,
        page_size: int = 12
    ) -> Dict[str, Any]:
        """
        Full-text search, faceted filtering, and server-side pagination for government schemes.
        """
        qs = GovtScheme.objects.filter(status=SchemeStatus.ACTIVE).select_related(
            'category', 'financial_rule'
        ).prefetch_related('benefits', 'eligibility_rules', 'documents', 'application_steps')

        # 1. Text Search across multiple indexed fields
        if query:
            q_clean = query.strip()
            text_filter = (
                Q(name__icontains=q_clean) |
                Q(short_name__icontains=q_clean) |
                Q(official_id__icontains=q_clean) |
                Q(ministry__icontains=q_clean) |
                Q(department__icontains=q_clean) |
                Q(nodal_agency__icontains=q_clean) |
                Q(description__icontains=q_clean) |
                Q(target_audience__icontains=q_clean) |
                Q(keywords__icontains=q_clean) |
                Q(category__name__icontains=q_clean) |
                Q(benefits__title__icontains=q_clean)
            )
            qs = qs.filter(text_filter).distinct()

        # 2. Jurisdiction & Location Filtering
        if jurisdiction == 'central':
            qs = qs.filter(level=GovernmentLevel.CENTRAL)
        elif jurisdiction == 'state':
            qs = qs.filter(level=GovernmentLevel.STATE)
            if state:
                qs = qs.filter(state__iexact=state)
        elif state:
            # When specific state is selected: show Central schemes (valid in that state) + State schemes for that state
            qs = qs.filter(Q(level=GovernmentLevel.CENTRAL) | Q(state__iexact=state))
            if district:
                # If district specified, prioritize or match
                qs = qs.filter(Q(districts=[]) | Q(districts__icontains=district) | Q(level=GovernmentLevel.CENTRAL))

        # 3. Category Filter
        if category and category.lower() != 'all':
            qs = qs.filter(Q(category__slug=category) | Q(category__name__iexact=category))

        # 4. Sector Filter
        if sector and sector.lower() != 'all':
            qs = qs.filter(sectors__icontains=sector)

        # 5. Benefit Type
        if benefit_type and benefit_type.lower() != 'all':
            qs = qs.filter(benefits__benefit_type=benefit_type).distinct()

        # 6. Project Cost bounds
        if min_cost is not None and min_cost > Decimal('0.00'):
            qs = qs.filter(Q(financial_rule__max_project_cost__gte=min_cost) | Q(financial_rule__max_project_cost__isnull=True))

        if max_cost is not None and max_cost > Decimal('0.00'):
            qs = qs.filter(financial_rule__min_project_cost__lte=max_cost)

        # 7. Collateral Free
        if collateral_free_only:
            qs = qs.filter(
                Q(financial_rule__collateral_type__icontains='free') | 
                Q(benefits__benefit_type='COLLATERAL_FREE') |
                Q(benefits__benefit_type='CREDIT_GUARANTEE')
            ).distinct()

        # 8. Verified Only
        if verified_only:
            qs = qs.filter(verification_status__in=[VerificationStatus.OFFICIAL, VerificationStatus.VERIFIED])

        # 9. Sorting
        if sort_by == 'benefit_high':
            qs = qs.order_by('-financial_rule__subsidy_rate_special_rural', '-priority_score', 'name')
        elif sort_by == 'name_asc':
            qs = qs.order_by('name')
        elif sort_by == 'recently_verified':
            qs = qs.order_by('-last_verified_date', '-priority_score')
        elif sort_by == 'central_first':
            qs = qs.order_by('level', '-priority_score', 'name')
        elif sort_by == 'state_first':
            qs = qs.order_by('-level', '-priority_score', 'name')
        else: # relevance / priority default
            qs = qs.order_by('-priority_score', 'level', 'name')

        # 10. Faceted Aggregations
        total_count = qs.count()
        central_count = qs.filter(level=GovernmentLevel.CENTRAL).count()
        state_count = qs.filter(level=GovernmentLevel.STATE).count()
        verified_count = qs.filter(verification_status__in=[VerificationStatus.OFFICIAL, VerificationStatus.VERIFIED]).count()

        # Pagination
        paginator = Paginator(qs, page_size)
        current_page = paginator.get_page(page)

        return {
            "total_count": total_count,
            "page": current_page.number,
            "total_pages": paginator.num_pages,
            "has_next": current_page.has_next(),
            "has_previous": current_page.has_previous(),
            "schemes": list(current_page.object_list),
            "facets": {
                "central_count": central_count,
                "state_count": state_count,
                "verified_count": verified_count,
            }
        }
