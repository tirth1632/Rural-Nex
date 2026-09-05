from rest_framework import serializers
from .models import BusinessProposal, BusinessCategory, FeasibilityReport, AnalysisRun

class BusinessCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCategory
        fields = '__all__'

class BusinessProposalSerializer(serializers.ModelSerializer):
    category = BusinessCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BusinessCategory.objects.all(), 
        source='category', 
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = BusinessProposal
        fields = [
            'id', 'user', 'category', 'category_id', 'margin_capital', 
            'current_step', 'state', 'district', 'block', 'village', 
            'lat', 'lng', 'expected_scale', 'available_shop', 
            'experience_years', 'number_of_workers', 'target_customers', 
            'products', 'created_at'
        ]
        read_only_fields = ['user']

class FeasibilityReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeasibilityReport
        fields = '__all__'

class AnalysisRunSerializer(serializers.ModelSerializer):
    report = FeasibilityReportSerializer(read_only=True)
    
    class Meta:
        model = AnalysisRun
        fields = ['id', 'status', 'started_at', 'completed_at', 'failure_information', 'report']
