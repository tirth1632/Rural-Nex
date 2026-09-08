import uuid
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.db.models import Max, Q
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response

from .models import (
    GovtScheme, 
    SchemeCategory, 
    SchemeBenefit, 
    SavedScheme,
    GovernmentLevel, 
    VerificationStatus, 
    SchemeStatus
)
from .serializers import (
    GovtSchemeListSerializer,
    GovtSchemeDetailSerializer,
    SchemeCategorySerializer,
    SchemeMatchRequestSerializer,
    BenefitCalculationRequestSerializer,
    SchemeCompareRequestSerializer,
    SavedSchemeSerializer
)
from .services.search_service import SchemeSearchService
from .services.matching_engine import SchemeMatchingEngine
from .services.benefit_calculator import SchemeBenefitCalculator


class SchemeListView(views.APIView):
    """
    GET /api/schemes/
    Lists schemes with full filtering, sorting, and pagination.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q')
        jurisdiction = request.query_params.get('jurisdiction')
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        category = request.query_params.get('category')
        sector = request.query_params.get('sector')
        benefit_type = request.query_params.get('benefit_type')
        
        min_cost = request.query_params.get('min_cost')
        min_cost = Decimal(min_cost) if min_cost else None
        max_cost = request.query_params.get('max_cost')
        max_cost = Decimal(max_cost) if max_cost else None

        collateral_free = request.query_params.get('collateral_free') in ['true', '1', 'True']
        verified_only = request.query_params.get('verified_only') in ['true', '1', 'True']
        sort_by = request.query_params.get('sort_by', 'relevance')

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 12))

        result = SchemeSearchService.search(
            query=query,
            jurisdiction=jurisdiction,
            state=state,
            district=district,
            category=category,
            sector=sector,
            benefit_type=benefit_type,
            min_cost=min_cost,
            max_cost=max_cost,
            collateral_free_only=collateral_free,
            verified_only=verified_only,
            sort_by=sort_by,
            page=page,
            page_size=page_size
        )

        serializer = GovtSchemeListSerializer(result['schemes'], many=True)
        return Response({
            'total_count': result['total_count'],
            'page': result['page'],
            'total_pages': result['total_pages'],
            'has_next': result['has_next'],
            'has_previous': result['has_previous'],
            'facets': result['facets'],
            'results': serializer.data
        })


class SchemeSearchView(views.APIView):
    """
    GET /api/schemes/search/?q=
    Dedicated quick-search endpoint with relevance ranking.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        state = request.query_params.get('state')
        category = request.query_params.get('category')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 12))

        result = SchemeSearchService.search(
            query=query,
            state=state,
            category=category,
            sort_by='relevance',
            page=page,
            page_size=page_size
        )

        serializer = GovtSchemeListSerializer(result['schemes'], many=True)
        return Response({
            'query': query,
            'total_count': result['total_count'],
            'page': result['page'],
            'total_pages': result['total_pages'],
            'results': serializer.data
        })


class SchemeStatsView(views.APIView):
    """
    GET /api/schemes/stats/
    Returns live dynamic statistics for hero badges:
    total verified schemes, central schemes, state schemes, and last update date.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_schemes = GovtScheme.objects.filter(status=SchemeStatus.ACTIVE)
        total_schemes = active_schemes.count()
        central_schemes = active_schemes.filter(level=GovernmentLevel.CENTRAL).count()
        state_schemes = active_schemes.filter(level=GovernmentLevel.STATE).count()
        verified_schemes = active_schemes.filter(
            verification_status__in=[VerificationStatus.OFFICIAL, VerificationStatus.VERIFIED]
        ).count()
        
        last_updated = active_schemes.aggregate(latest=Max('last_verified_date'))['latest']

        return Response({
            'total_schemes': total_schemes,
            'verified_schemes': verified_schemes,
            'central_schemes': central_schemes,
            'state_schemes': state_schemes,
            'last_data_update': last_updated.isoformat() if last_updated else None,
            'data_source': 'Ministry Portals & Central Scheme Gazette'
        })


class SchemeCategoriesListView(generics.ListAPIView):
    """
    GET /api/schemes/categories/
    Returns dynamic categories from database.
    """
    queryset = SchemeCategory.objects.all().order_by('sort_order', 'name')
    serializer_class = SchemeCategorySerializer
    permission_classes = [permissions.AllowAny]


class SchemeMinistriesListView(views.APIView):
    """
    GET /api/schemes/ministries/
    Returns distinct ministries associated with verified active schemes.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ministries = GovtScheme.objects.filter(status=SchemeStatus.ACTIVE).values_list(
            'ministry', flat=True
        ).distinct().order_by('ministry')
        return Response(list(filter(None, ministries)))


class SchemeBenefitsListView(views.APIView):
    """
    GET /api/schemes/benefits/
    Returns distinct benefit types.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        benefits = [
            {'code': 'CAPITAL_SUBSIDY', 'label': 'Capital Subsidy'},
            {'code': 'INTEREST_SUBVENTION', 'label': 'Interest Subvention'},
            {'code': 'CREDIT_GUARANTEE', 'label': 'Credit Guarantee Cover'},
            {'code': 'LOAN_SUPPORT', 'label': 'Term Loan / Working Capital'},
            {'code': 'COLLATERAL_FREE', 'label': 'Collateral-Free Loan'},
            {'code': 'GRANT', 'label': 'Grant Support'},
            {'code': 'TRAINING_INFRA', 'label': 'Training & Skill Assistance'},
            {'code': 'INSURANCE', 'label': 'Insurance & Risk Cover'},
        ]
        return Response(benefits)


class SchemeLocationsListView(views.APIView):
    """
    GET /api/schemes/locations/
    Returns jurisdictions supported: Central plus distinct active states.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        states = GovtScheme.objects.filter(
            level=GovernmentLevel.STATE, status=SchemeStatus.ACTIVE
        ).values_list('state', flat=True).distinct().order_by('state')
        return Response({
            'jurisdictions': [
                {'code': 'all', 'label': 'India (All Central & State Schemes)'},
                {'code': 'central', 'label': 'Central Government Only'},
                {'code': 'state', 'label': 'State Government Schemes'},
            ],
            'active_states': list(filter(None, states))
        })


class SchemeDetailView(views.APIView):
    """
    GET /api/schemes/<id>/
    Returns full scheme dossier including eligibility rules, financial rules,
    documents checklist, and application roadmap.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        # Support UUID or official_id
        scheme = None
        try:
            val = uuid.UUID(str(pk))
            scheme = get_object_or_404(GovtScheme, id=val)
        except (ValueError, AttributeError):
            scheme = get_object_or_404(GovtScheme, official_id=pk)

        serializer = GovtSchemeDetailSerializer(scheme)
        return Response(serializer.data)


class SchemeMatchView(views.APIView):
    """
    POST /api/schemes/match/
    Instant Scheme Matcher running two-stage eligibility and dimensional scoring.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SchemeMatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        match_results = SchemeMatchingEngine.match_schemes(
            project_cost=data['project_cost'],
            business_sector=data.get('business_sector'),
            business_activity=data.get('business_activity'),
            location={
                'state': data.get('state'),
                'district': data.get('district'),
                'rural_urban': data.get('rural_urban', 'rural')
            },
            promoter_profile={
                'gender': data.get('gender', 'male'),
                'age': data.get('age', 28),
                'social_category': data.get('promoter_category', 'general'),
                'special_category': data.get('special_category', 'none')
            },
            business_stage=data.get('business_stage', 'new'),
            own_contribution=data.get('own_contribution')
        )
        return Response(match_results)


class SchemeBenefitCalculateView(views.APIView):
    """
    POST /api/schemes/<id>/calculate-benefit/
    Calculates dynamic potential benefits for a specific scheme.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            val = uuid.UUID(str(pk))
            scheme = get_object_or_404(GovtScheme, id=val)
        except (ValueError, AttributeError):
            scheme = get_object_or_404(GovtScheme, official_id=pk)

        serializer = BenefitCalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = SchemeBenefitCalculator.calculate_benefit(
            scheme=scheme,
            project_cost=data['project_cost'],
            own_contribution=data.get('own_contribution'),
            loan_requirement=data.get('loan_requirement'),
            promoter_profile={
                'gender': data.get('gender', 'male'),
                'social_category': data.get('social_category', 'general'),
                'special_category': data.get('special_category', 'none'),
            },
            location={'rural_urban': data.get('rural_urban', 'rural')}
        )
        return Response(result)


class SchemeEligibilityCheckView(views.APIView):
    """
    GET /api/schemes/<id>/eligibility/
    Evaluates applicant profile against a single scheme with detailed rule breakdown.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            val = uuid.UUID(str(pk))
            scheme = get_object_or_404(GovtScheme, id=val)
        except (ValueError, AttributeError):
            scheme = get_object_or_404(GovtScheme, official_id=pk)

        rules = scheme.eligibility_rules.all()
        fin = getattr(scheme, 'financial_rule', None)

        rule_items = []
        for r in rules:
            rule_items.append({
                'field': r.field,
                'operator': r.operator,
                'expected_value': r.expected_value,
                'description': r.rule_description,
                'is_mandatory': r.is_mandatory
            })

        return Response({
            'scheme_id': str(scheme.id),
            'scheme_name': scheme.name,
            'official_id': scheme.official_id,
            'eligibility_rules': rule_items,
            'financial_limits': {
                'min_project_cost': float(fin.min_project_cost) if fin else 0.0,
                'max_project_cost': float(fin.max_project_cost) if fin and fin.max_project_cost else None,
                'max_loan_amount': float(fin.max_loan_amount) if fin and fin.max_loan_amount else None,
                'min_promoter_margin_pct': float(fin.min_promoter_margin_pct) if fin else 10.0,
            } if fin else None,
            'official_source': scheme.source_name,
            'guidelines_url': scheme.official_portal_url
        })


class SchemeCompareView(views.APIView):
    """
    POST /api/schemes/compare/
    Side-by-side comparison of 2 to 5 schemes.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SchemeCompareRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scheme_ids = serializer.validated_data['scheme_ids']

        schemes = []
        for s_id in scheme_ids:
            try:
                val = uuid.UUID(str(s_id))
                s = GovtScheme.objects.filter(id=val).first()
            except (ValueError, AttributeError):
                s = GovtScheme.objects.filter(official_id=s_id).first()
            if s:
                schemes.append(s)

        if len(schemes) < 2:
            return Response({'error': 'At least 2 valid schemes are required for comparison.'}, status=status.HTTP_400_BAD_REQUEST)

        comparison_matrix = []
        for s in schemes:
            fin = getattr(s, 'financial_rule', None)
            comparison_matrix.append({
                'id': str(s.id),
                'official_id': s.official_id,
                'name': s.name,
                'short_name': s.short_name,
                'level': s.get_level_display(),
                'ministry': s.ministry,
                'state': s.state or 'All-India',
                'category': s.category.name if s.category else 'General',
                'sectors': s.sectors,
                'max_project_cost': f"₹{fin.max_project_cost:,.2f}" if (fin and fin.max_project_cost) else "Need Based / As per Project Cost",
                'max_loan': f"₹{fin.max_loan_amount:,.2f}" if (fin and fin.max_loan_amount) else "Need Based",
                'subsidy_rate': f"{fin.subsidy_rate_general_rural}% to {fin.subsidy_rate_special_rural}%" if (fin and fin.subsidy_rate_special_rural > 0) else "Not applicable / Interest benefit",
                'max_subsidy': f"₹{fin.max_subsidy_amount:,.2f}" if (fin and fin.max_subsidy_amount > 0) else "Policy Driven",
                'interest_rate': f"{fin.interest_rate_min}% – {fin.interest_rate_max}%" if (fin and fin.interest_rate_min) else "Bank Concessional",
                'interest_subvention': f"{fin.interest_subvention_pct}% p.a." if (fin and fin.interest_subvention_pct > 0) else "None",
                'collateral_free': fin.collateral_type if fin else "Not specified",
                'promoter_margin': f"{fin.promoter_margin_special_pct}% (Special) / {fin.min_promoter_margin_pct}% (General)" if fin else "10%",
                'tenure_months': f"Up to {fin.tenure_months_max} months" if (fin and fin.tenure_months_max) else "Not specified",
                'moratorium_months': f"Up to {fin.moratorium_months_max} months" if (fin and fin.moratorium_months_max) else "Standard",
                'portal_url': s.official_portal_url,
                'verification_status': s.get_verification_status_display(),
            })

        return Response({
            'total_compared': len(comparison_matrix),
            'schemes': comparison_matrix
        })


class SavedSchemesView(views.APIView):
    """
    GET /api/user/saved-schemes/
    POST /api/user/saved-schemes/
    Allows logged-in or demo users to bookmark schemes.
    """
    def get(self, request):
        if request.user.is_authenticated:
            saved = SavedScheme.objects.filter(user=request.user).select_related('scheme')
        else:
            saved = SavedScheme.objects.none()
        serializer = SavedSchemeSerializer(saved, many=True)
        return Response(serializer.data)

    def post(self, request):
        scheme_id = request.data.get('scheme_id')
        notes = request.data.get('notes', '')

        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required to save schemes to your profile.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            val = uuid.UUID(str(scheme_id))
            scheme = get_object_or_404(GovtScheme, id=val)
        except (ValueError, AttributeError):
            scheme = get_object_or_404(GovtScheme, official_id=scheme_id)

        saved_item, created = SavedScheme.objects.get_or_create(
            user=request.user,
            scheme=scheme,
            defaults={'notes': notes}
        )
        if not created and notes:
            saved_item.notes = notes
            saved_item.save()

        serializer = SavedSchemeSerializer(saved_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class SavedSchemeDeleteView(views.APIView):
    """
    DELETE /api/user/saved-schemes/<id>/
    Removes a saved scheme bookmark.
    """
    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        item = get_object_or_404(SavedScheme, id=pk, user=request.user)
        item.delete()
        return Response({'status': 'deleted'}, status=status.HTTP_204_NO_CONTENT)


class SchemeAddToFinancialPlanView(views.APIView):
    """
    POST /api/schemes/<id>/add-to-financial-plan/
    Prepares verified financial parameters from this scheme for handoff to the Financial Plan module.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            val = uuid.UUID(str(pk))
            scheme = get_object_or_404(GovtScheme, id=val)
        except (ValueError, AttributeError):
            scheme = get_object_or_404(GovtScheme, official_id=pk)

        fin = getattr(scheme, 'financial_rule', None)
        if not fin:
            return Response({'error': 'This scheme has no verified financial parameters.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build handoff package
        handoff_payload = {
            'scheme_id': str(scheme.id),
            'official_id': scheme.official_id,
            'scheme_name': scheme.name,
            'short_name': scheme.short_name,
            'scheme_version': scheme.scheme_version,
            'verification_status': scheme.verification_status,
            'last_verified_date': scheme.last_verified_date.isoformat(),
            'financial_rules': {
                'min_project_cost': float(fin.min_project_cost),
                'max_project_cost': float(fin.max_project_cost) if fin.max_project_cost else None,
                'max_loan_amount': float(fin.max_loan_amount) if fin.max_loan_amount else None,
                'promoter_margin_matrix': {
                    'general': float(fin.min_promoter_margin_pct),
                    'special': float(fin.promoter_margin_special_pct),
                },
                'subsidy_rate_matrix': {
                    'general_urban': float(fin.subsidy_rate_general_urban),
                    'general_rural': float(fin.subsidy_rate_general_rural),
                    'special_urban': float(fin.subsidy_rate_special_urban),
                    'special_rural': float(fin.subsidy_rate_special_rural),
                },
                'max_subsidy_cap': float(fin.max_subsidy_amount),
                'subsidy_timing': fin.subsidy_timing,
                'interest_rate_annual': float(fin.interest_rate_min),
                'interest_subvention_pct': float(fin.interest_subvention_pct),
                'tenure_months': fin.tenure_months_max,
                'moratorium_months': fin.moratorium_months_max,
                'collateral_support': fin.collateral_type,
            },
            'source': {
                'portal_url': scheme.official_portal_url,
                'source_document': scheme.source_document,
            },
            'redirect_url': f"/finance?scheme_id={scheme.official_id}"
        }

        return Response(handoff_payload)
