from rest_framework import serializers
from decimal import Decimal
from .models import (
    SchemeCategory, 
    GovtScheme, 
    SchemeBenefit, 
    SchemeEligibilityRule, 
    SchemeFinancialRule, 
    SchemeDocument, 
    SchemeApplicationStep, 
    SavedScheme
)


class SchemeCategorySerializer(serializers.ModelSerializer):
    scheme_count = serializers.SerializerMethodField()

    class Meta:
        model = SchemeCategory
        fields = ['id', 'name', 'slug', 'icon', 'description', 'sort_order', 'scheme_count']

    def get_scheme_count(self, obj):
        return obj.schemes.filter(status='ACTIVE').count()


class SchemeBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeBenefit
        fields = [
            'id', 'benefit_type', 'calculation_type', 'title', 
            'percentage', 'fixed_amount', 'max_amount', 'min_amount', 
            'eligible_base_description', 'conditions', 'is_primary'
        ]


class SchemeEligibilityRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeEligibilityRule
        fields = [
            'id', 'field', 'operator', 'expected_value', 
            'condition_group', 'priority', 'rule_description', 'is_mandatory'
        ]


class SchemeFinancialRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeFinancialRule
        fields = [
            'min_project_cost', 'max_project_cost', 'max_loan_amount',
            'min_promoter_margin_pct', 'promoter_margin_special_pct',
            'subsidy_rate_general_urban', 'subsidy_rate_general_rural',
            'subsidy_rate_special_urban', 'subsidy_rate_special_rural',
            'max_subsidy_amount', 'subsidy_timing',
            'interest_rate_min', 'interest_rate_max',
            'interest_subvention_pct', 'subvention_tenure_years',
            'tenure_months_max', 'moratorium_months_max',
            'collateral_type'
        ]


class SchemeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeDocument
        fields = ['id', 'name', 'requirement_level', 'issuing_authority', 'description', 'sort_order']


class SchemeApplicationStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeApplicationStep
        fields = ['id', 'step_number', 'title', 'description', 'portal_url', 'expected_time_days']


class GovtSchemeListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    financial_summary = serializers.SerializerMethodField()
    primary_benefit = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()

    class Meta:
        model = GovtScheme
        fields = [
            'id', 'official_id', 'name', 'short_name', 'slug', 'level',
            'state', 'districts', 'ministry', 'department', 'nodal_agency',
            'category_name', 'category_slug', 'sectors',
            'description', 'short_description', 'status',
            'financial_summary', 'primary_benefit', 'badges',
            'official_portal_url', 'source_name', 'source_document',
            'verification_status', 'last_verified_date', 'scheme_version'
        ]

    def get_financial_summary(self, obj):
        fin = getattr(obj, 'financial_rule', None)
        if not fin:
            return None
        return {
            'max_loan': f"Up to ₹{fin.max_loan_amount:,.2f}" if fin.max_loan_amount else "Need Based / As per Project Cost",
            'max_subsidy': f"Up to ₹{fin.max_subsidy_amount:,.2f}" if fin.max_subsidy_amount else "Credit Linked / As per Policy",
            'subsidy_rate_display': f"{fin.subsidy_rate_general_rural}% (General) to {fin.subsidy_rate_special_rural}% (Special Rural)" if fin.subsidy_rate_special_rural else "Interest Subvention / Margin Assistance",
            'interest_rate_display': f"{fin.interest_rate_min}% – {fin.interest_rate_max}%" if fin.interest_rate_min else "Concessional Bank Rate",
            'interest_subvention_pct': float(fin.interest_subvention_pct),
            'collateral_requirement': fin.collateral_type,
            'max_tenure_months': fin.tenure_months_max,
            'moratorium_months': fin.moratorium_months_max,
            'min_project_cost': float(fin.min_project_cost),
            'max_project_cost': float(fin.max_project_cost) if fin.max_project_cost else None,
        }

    def get_primary_benefit(self, obj):
        benefit = obj.benefits.filter(is_primary=True).first() or obj.benefits.first()
        return benefit.title if benefit else "Credit & Subsidy Support"

    def get_badges(self, obj):
        badges = [obj.get_level_display()]
        fin = getattr(obj, 'financial_rule', None)
        if fin:
            if fin.subsidy_rate_special_rural > 0 or fin.subsidy_rate_general_rural > 0:
                badges.append('Subsidy')
            if fin.interest_subvention_pct > 0:
                badges.append('Interest Support')
            if 'free' in (fin.collateral_type or '').lower() or 'cgtmse' in (fin.collateral_type or '').lower():
                badges.append('Collateral-Free')
            if fin.max_loan_amount and fin.max_loan_amount > 0:
                badges.append('Loan')
        return badges


class GovtSchemeDetailSerializer(GovtSchemeListSerializer):
    benefits = SchemeBenefitSerializer(many=True, read_only=True)
    eligibility_rules = SchemeEligibilityRuleSerializer(many=True, read_only=True)
    financial_rule = SchemeFinancialRuleSerializer(read_only=True)
    documents = SchemeDocumentSerializer(many=True, read_only=True)
    application_steps = SchemeApplicationStepSerializer(many=True, read_only=True)

    class Meta(GovtSchemeListSerializer.Meta):
        fields = GovtSchemeListSerializer.Meta.fields + [
            'target_audience', 'source_url', 'source_document_date',
            'effective_from', 'effective_to', 'priority_score', 'keywords',
            'benefits', 'eligibility_rules', 'financial_rule', 'documents', 'application_steps'
        ]


class SchemeMatchRequestSerializer(serializers.Serializer):
    project_cost = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal('1000.00'))
    business_sector = serializers.CharField(required=False, allow_blank=True, default='')
    business_activity = serializers.CharField(required=False, allow_blank=True, default='')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    district = serializers.CharField(required=False, allow_blank=True, default='')
    rural_urban = serializers.ChoiceField(choices=['rural', 'urban'], default='rural')
    business_stage = serializers.ChoiceField(choices=['new', 'existing', 'expansion'], default='new')
    promoter_category = serializers.CharField(required=False, allow_blank=True, default='general')
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'], default='male')
    age = serializers.IntegerField(required=False, default=28, min_value=14, max_value=90)
    special_category = serializers.CharField(required=False, allow_blank=True, default='none')
    own_contribution = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, default=Decimal('0.00'))


class BenefitCalculationRequestSerializer(serializers.Serializer):
    project_cost = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=Decimal('1000.00'))
    own_contribution = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, default=Decimal('0.00'))
    loan_requirement = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, default=Decimal('0.00'))
    rural_urban = serializers.ChoiceField(choices=['rural', 'urban'], default='rural')
    gender = serializers.ChoiceField(choices=['male', 'female', 'other'], default='male')
    social_category = serializers.CharField(required=False, default='general')
    special_category = serializers.CharField(required=False, default='none')


class SchemeCompareRequestSerializer(serializers.Serializer):
    scheme_ids = serializers.ListField(
        child=serializers.CharField(),
        min_length=2,
        max_length=5,
        help_text="List of 2 to 5 scheme UUIDs or official IDs"
    )


class SavedSchemeSerializer(serializers.ModelSerializer):
    scheme_details = GovtSchemeListSerializer(source='scheme', read_only=True)

    class Meta:
        model = SavedScheme
        fields = ['id', 'scheme', 'scheme_details', 'notes', 'notify_updates', 'created_at']
        read_only_fields = ['id', 'created_at']
