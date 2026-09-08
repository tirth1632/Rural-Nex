from rest_framework import serializers
from .models import BusinessProposal, BusinessCategory, FeasibilityReport, AnalysisRun, FinancialAssessment

class BusinessCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCategory
        fields = '__all__'

class FeasibilityReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeasibilityReport
        fields = '__all__'

class AnalysisRunSerializer(serializers.ModelSerializer):
    report = FeasibilityReportSerializer(read_only=True)
    
    class Meta:
        model = AnalysisRun
        fields = ['id', 'status', 'started_at', 'completed_at', 'failure_information', 'report']

class FinancialAssessmentSerializer(serializers.ModelSerializer):
    scheme_name = serializers.CharField(source='scheme.name', read_only=True, default='PMEGP / MUDRA')

    class Meta:
        model = FinancialAssessment
        fields = [
            'id', 'scheme', 'scheme_name', 'feasible_project_cost', 
            'constrained_project_cost', 'loan_amount', 'working_capital_estimate', 
            'cap_constrained', 'constraint_reason', 'created_at'
        ]

class BusinessProposalSerializer(serializers.ModelSerializer):
    category = BusinessCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(), 
        source='category', 
        write_only=True,
        required=False,
        allow_null=True
    )
    analysis_runs = AnalysisRunSerializer(many=True, read_only=True)
    financial_assessment = FinancialAssessmentSerializer(read_only=True)
    state_name = serializers.CharField(source='state.name', read_only=True, default='')
    district_name = serializers.CharField(source='district.name', read_only=True, default='')
    block_name = serializers.CharField(source='block.name', read_only=True, default='')
    village_name = serializers.CharField(source='village.name', read_only=True, default='')

    class Meta:
        model = BusinessProposal
        fields = [
            'id', 'user', 'category', 'category_id', 'margin_capital', 
            'current_step', 'state', 'district', 'block', 'village', 
            'state_name', 'district_name', 'block_name', 'village_name',
            'lat', 'lng', 'expected_scale', 'available_shop', 
            'experience_years', 'number_of_workers', 'target_customers', 
            'products', 'analysis_runs', 'financial_assessment', 'created_at'
        ]
        read_only_fields = ['user']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # 1. Resolve category
        cat_name = data.get('category_name') or data.get('category') or data.get('specific_business') or data.get('sub_category')
        if isinstance(cat_name, str) and cat_name.strip():
            cat_obj, _ = BusinessCategory.objects.get_or_create(name=cat_name.strip())
            data['category_id'] = cat_obj.id
        elif 'category_id' in data:
            try:
                cid = int(data['category_id'])
                if not BusinessCategory.objects.filter(id=cid).exists():
                    cat_obj = BusinessCategory.objects.first()
                    data['category_id'] = cat_obj.id if cat_obj else None
            except (ValueError, TypeError):
                data.pop('category_id', None)

        # 2. Resolve location hierarchy if strings were passed
        from geo.models import State, District, Block, Village
        st_val = data.get('state')
        dist_val = data.get('district')
        blk_val = data.get('block')
        vil_val = data.get('village')

        state_obj = None
        if isinstance(st_val, str) and st_val.strip() and not st_val.isdigit():
            state_obj, _ = State.objects.get_or_create(name=st_val.strip(), defaults={'code': st_val.strip()[:5].upper()})
            data['state'] = state_obj.id
        elif isinstance(st_val, int) or (isinstance(st_val, str) and st_val.isdigit()):
            state_obj = State.objects.filter(id=int(st_val)).first()

        dist_obj = None
        if isinstance(dist_val, str) and dist_val.strip() and not dist_val.isdigit():
            if not state_obj:
                state_obj, _ = State.objects.get_or_create(name="Gujarat", defaults={'code': 'GJ'})
            dist_obj, _ = District.objects.get_or_create(name=dist_val.strip(), state=state_obj)
            data['district'] = dist_obj.id
        elif isinstance(dist_val, int) or (isinstance(dist_val, str) and dist_val.isdigit()):
            dist_obj = District.objects.filter(id=int(dist_val)).first()

        blk_obj = None
        if isinstance(blk_val, str) and blk_val.strip() and not blk_val.isdigit():
            if not dist_obj:
                if not state_obj:
                    state_obj, _ = State.objects.get_or_create(name="Gujarat", defaults={'code': 'GJ'})
                dist_obj, _ = District.objects.get_or_create(name="Ahmedabad", state=state_obj)
            blk_obj, _ = Block.objects.get_or_create(name=blk_val.strip(), district=dist_obj)
            data['block'] = blk_obj.id
        elif isinstance(blk_val, int) or (isinstance(blk_val, str) and blk_val.isdigit()):
            blk_obj = Block.objects.filter(id=int(blk_val)).first()

        if isinstance(vil_val, str) and vil_val.strip() and not vil_val.isdigit():
            if not blk_obj:
                if not dist_obj:
                    if not state_obj:
                        state_obj, _ = State.objects.get_or_create(name="Gujarat", defaults={'code': 'GJ'})
                    dist_obj, _ = District.objects.get_or_create(name="Ahmedabad", state=state_obj)
                blk_obj, _ = Block.objects.get_or_create(name="Daskroi", district=dist_obj)
            vil_obj, _ = Village.objects.get_or_create(name=vil_val.strip(), block=blk_obj)
            data['village'] = vil_obj.id

        return super().to_internal_value(data)


