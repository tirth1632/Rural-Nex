from rest_framework import serializers
from .models import (
    BusinessActivity, 
    ActivityDriverTemplate, 
    SchemeMaster, 
    SchemeRule, 
    FinancialProjectPlan
)

# Legacy Request Serializers (Maintained for Backward Compatibility)
class CalculateRequestSerializer(serializers.Serializer):
    available_margin = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    desired_project_cost = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

class EMIRequestSerializer(serializers.Serializer):
    principal = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    tenure_months = serializers.IntegerField(required=True)

class RepaymentRequestSerializer(EMIRequestSerializer):
    moratorium_months = serializers.IntegerField(required=True)
    moratorium_policy = serializers.CharField(required=False, default='PAY_INTEREST_ONLY')

class WorkingCapitalRequestSerializer(serializers.Serializer):
    projected_annual_turnover = serializers.DecimalField(max_digits=14, decimal_places=2, required=True)
    margin_percentage = serializers.DecimalField(max_digits=3, decimal_places=2, required=False, default='0.20')


# Dynamic Business Activity Serializers
class ActivityDriverTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityDriverTemplate
        fields = [
            'base_capacity_monthly',
            'default_selling_price',
            'default_variable_cost_per_unit',
            'default_operating_days',
            'default_capex_breakdown',
            'default_fixed_costs',
            'default_variable_costs',
            'seasonal_factors'
        ]

class BusinessActivitySerializer(serializers.ModelSerializer):
    driver_template = ActivityDriverTemplateSerializer(read_only=True)
    sector_display = serializers.CharField(source='get_sector_display', read_only=True)

    class Meta:
        model = BusinessActivity
        fields = [
            'id',
            'code',
            'name',
            'sector',
            'sector_display',
            'icon',
            'description',
            'unit_of_measurement',
            'sort_order',
            'driver_template'
        ]


# Scheme & Rule Serializers
class SchemeRuleSerializer(serializers.ModelSerializer):
    scheme_code = serializers.CharField(source='scheme.code', read_only=True)
    scheme_name = serializers.CharField(source='scheme.name', read_only=True)
    ministry = serializers.CharField(source='scheme.ministry', read_only=True)
    official_portal_url = serializers.CharField(source='scheme.official_portal_url', read_only=True)
    scheme_type = serializers.CharField(source='scheme.scheme_type', read_only=True)

    class Meta:
        model = SchemeRule
        fields = [
            'id',
            'scheme_code',
            'scheme_name',
            'ministry',
            'official_portal_url',
            'scheme_type',
            'rule_version',
            'effective_from',
            'effective_to',
            'verification_status',
            'last_verified_date',
            'source_document',
            'min_project_cost',
            'max_project_cost',
            'max_loan_amount',
            'allowed_sectors',
            'allowed_locations',
            'allowed_stages',
            'promoter_contribution_matrix',
            'subsidy_rate_matrix',
            'max_subsidy_cap',
            'subsidy_timing',
            'interest_rate_annual',
            'interest_subvention_pct',
            'tenure_months',
            'moratorium_months',
            'moratorium_policy',
            'collateral_support',
            'required_documents'
        ]

class SchemeMasterSerializer(serializers.ModelSerializer):
    rules = SchemeRuleSerializer(many=True, read_only=True)

    class Meta:
        model = SchemeMaster
        fields = [
            'id',
            'code',
            'name',
            'ministry',
            'official_portal_url',
            'scheme_type',
            'description',
            'rules'
        ]


# Pipeline API Request Serializers
class SchemeMatchRequestSerializer(serializers.Serializer):
    project_cost = serializers.DecimalField(max_digits=14, decimal_places=2, required=True)
    activity_id_or_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_stage = serializers.CharField(required=False, default='new')
    promoter_profile = serializers.DictField(required=False, default=dict)
    location_data = serializers.DictField(required=False, default=dict)

class FullFeasibilityRequestSerializer(serializers.Serializer):
    activity_id_or_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    business_stage = serializers.CharField(required=False, default='new')
    promoter_profile = serializers.DictField(required=False, default=dict)
    location_data = serializers.DictField(required=False, default=dict)
    financial_inputs = serializers.DictField(required=False, default=dict)
    project_cost_items = serializers.DictField(required=False, default=dict)
    selected_scheme_rule_id = serializers.IntegerField(required=False, allow_null=True)
    what_if_modifiers = serializers.DictField(required=False, default=dict)

class SaveFinancialPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProjectPlan
        fields = [
            'id',
            'title',
            'business_activity',
            'business_stage',
            'location_state',
            'location_district',
            'location_block',
            'location_village',
            'rural_urban',
            'pincode',
            'promoter_profile',
            'financial_inputs',
            'project_cost_items',
            'matched_scheme_rule',
            'calculation_results',
            'rule_version_used'
        ]
        read_only_fields = ['id', 'rule_version_used']
