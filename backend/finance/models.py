import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from core.models import AuditModel

class MoratoriumPolicy(models.TextChoices):
    CAPITALIZE_INTEREST = 'CAPITALIZE_INTEREST', 'Capitalize Interest'
    PAY_INTEREST_ONLY = 'PAY_INTEREST_ONLY', 'Pay Interest Only'
    DEFER_INTEREST = 'DEFER_INTEREST', 'Defer Interest'

class VerificationStatus(models.TextChoices):
    OFFICIAL = 'OFFICIAL', 'Official Government Data'
    VERIFIED = 'VERIFIED', 'Verified by Financial Institution'
    PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
    EXPIRED = 'EXPIRED', 'Expired / Superseded'

class SubsidyTiming(models.TextChoices):
    BACK_ENDED = 'BACK_ENDED', 'Back-Ended Capital Subsidy (TDR)'
    UPFRONT = 'UPFRONT', 'Upfront Capital Subsidy'
    CAPITAL_SUBSIDY = 'CAPITAL_SUBSIDY', 'Credit-Linked Capital Subsidy'
    INTEREST_SUBVENTION = 'INTEREST_SUBVENTION', 'Interest Rate Subvention'
    REIMBURSEMENT = 'REIMBURSEMENT', 'Reimbursement'

class BusinessSector(models.TextChoices):
    AGRI_ALLIED = 'AGRI_ALLIED', 'Agriculture & Allied'
    MANUFACTURING = 'MANUFACTURING', 'Rural Manufacturing & Processing'
    SERVICE = 'SERVICE', 'Rural Services & Tech'
    RETAIL = 'RETAIL', 'Rural Retail & Trading'
    OTHER = 'OTHER', 'Other Activities'

# Legacy model preserved for backward compatibility
class SchemeDefinition(models.Model):
    name = models.CharField(max_length=255)
    min_project_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    max_project_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    funding_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="e.g., 90.00 for 90%")
    max_loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate_annual = models.DecimalField(max_digits=5, decimal_places=2, help_text="e.g., 6.50 for 6.5%")
    tenure_months = models.IntegerField(help_text="Total tenure in months, including moratorium")
    moratorium_months = models.IntegerField(default=0)
    moratorium_policy = models.CharField(
        max_length=50, 
        choices=MoratoriumPolicy.choices,
        default=MoratoriumPolicy.CAPITALIZE_INTEREST
    )
    is_active = models.BooleanField(default=True)
    version = models.IntegerField(default=1)

    class Meta:
        unique_together = ('name', 'version')

    def __str__(self):
        return f"{self.name} (v{self.version})"

# Dynamic Business Activity Models
class BusinessActivity(models.Model):
    code = models.CharField(max_length=100, unique=True, help_text="Unique identifier e.g. dairy_farming")
    name = models.CharField(max_length=200)
    sector = models.CharField(max_length=50, choices=BusinessSector.choices, default=BusinessSector.AGRI_ALLIED)
    icon = models.CharField(max_length=50, default='Briefcase')
    description = models.TextField(blank=True, default='')
    unit_of_measurement = models.CharField(max_length=100, default='Units')
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_sector_display()})"

class ActivityDriverTemplate(models.Model):
    activity = models.OneToOneField(BusinessActivity, on_delete=models.CASCADE, related_name='driver_template')
    base_capacity_monthly = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('1000.00'))
    default_selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('100.00'))
    default_variable_cost_per_unit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('60.00'))
    default_operating_days = models.IntegerField(default=26)
    default_capex_breakdown = models.JSONField(default=list, help_text="Default 7-category CapEx line items")
    default_fixed_costs = models.JSONField(default=list, help_text="Default monthly fixed overheads")
    default_variable_costs = models.JSONField(default=list, help_text="Default variable cost drivers")
    seasonal_factors = models.JSONField(default=list, help_text="12 monthly multipliers")

    def __str__(self):
        return f"Driver Template for {self.activity.name}"

# Official Government Scheme Models
class SchemeMaster(models.Model):
    code = models.CharField(max_length=100, unique=True, help_text="e.g. PMEGP, MUDRA, AIF, PMFME")
    name = models.CharField(max_length=255)
    ministry = models.CharField(max_length=255, blank=True, default='')
    official_portal_url = models.URLField(blank=True, default='')
    scheme_type = models.CharField(max_length=100, default='Capital Subsidy')
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class SchemeRule(models.Model):
    scheme = models.ForeignKey(SchemeMaster, on_delete=models.CASCADE, related_name='rules')
    rule_version = models.CharField(max_length=50, default='2026.01')
    effective_from = models.DateField()
    effective_to = models.DateField(null=True, blank=True)
    verification_status = models.CharField(
        max_length=50, 
        choices=VerificationStatus.choices, 
        default=VerificationStatus.OFFICIAL
    )
    last_verified_date = models.DateField()
    source_document = models.CharField(max_length=255, blank=True, default='')
    
    # Financial project cost limits
    min_project_cost = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    max_project_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    max_loan_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    
    # Eligibility criteria
    allowed_sectors = models.JSONField(default=list)
    allowed_locations = models.JSONField(default=list, help_text="['rural', 'urban']")
    allowed_stages = models.JSONField(default=list, help_text="['new', 'existing', 'expansion']")
    min_promoter_age = models.IntegerField(default=18)
    max_promoter_age = models.IntegerField(null=True, blank=True)
    min_education = models.CharField(max_length=100, blank=True, default='')
    
    # Financial parameters
    promoter_contribution_matrix = models.JSONField(
        default=dict, 
        help_text="e.g. {'general': 10.0, 'special': 5.0}"
    )
    subsidy_rate_matrix = models.JSONField(
        default=dict,
        help_text="e.g. {'general_urban': 15.0, 'general_rural': 25.0, 'special_urban': 25.0, 'special_rural': 35.0}"
    )
    max_subsidy_cap = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    subsidy_timing = models.CharField(
        max_length=50, 
        choices=SubsidyTiming.choices, 
        default=SubsidyTiming.BACK_ENDED
    )
    interest_rate_annual = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('8.50'))
    interest_subvention_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tenure_months = models.IntegerField(default=84)
    moratorium_months = models.IntegerField(default=6)
    moratorium_policy = models.CharField(
        max_length=50,
        choices=MoratoriumPolicy.choices,
        default=MoratoriumPolicy.PAY_INTEREST_ONLY
    )
    collateral_support = models.CharField(max_length=255, blank=True, default='')
    state_top_ups = models.JSONField(default=dict, help_text="State-specific top-up subsidies")
    required_documents = models.JSONField(default=list)
    special_conditions = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('scheme', 'rule_version')
        ordering = ['-effective_from', '-rule_version']

    def __str__(self):
        return f"{self.scheme.name} - v{self.rule_version} ({self.verification_status})"

# Entrepreneur Financial Plans & Audit
class FinancialProjectPlan(AuditModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='financial_plans'
    )
    title = models.CharField(max_length=255, default='Project Feasibility Plan')
    business_activity = models.ForeignKey(
        BusinessActivity, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    business_stage = models.CharField(max_length=50, default='new')
    
    # Location
    location_state = models.CharField(max_length=100, blank=True, default='')
    location_district = models.CharField(max_length=100, blank=True, default='')
    location_block = models.CharField(max_length=100, blank=True, default='')
    location_village = models.CharField(max_length=100, blank=True, default='')
    rural_urban = models.CharField(max_length=20, default='rural')
    pincode = models.CharField(max_length=10, blank=True, default='')

    # Snapshots
    promoter_profile = models.JSONField(default=dict)
    financial_inputs = models.JSONField(default=dict)
    project_cost_items = models.JSONField(default=list)
    matched_scheme_rule = models.ForeignKey(
        SchemeRule, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    calculation_results = models.JSONField(default=dict)
    rule_version_used = models.CharField(max_length=50, blank=True, default='')
    calculation_timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.business_activity or 'Unassigned'}"

class FinancialPlanAudit(models.Model):
    plan = models.ForeignKey(FinancialProjectPlan, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=50)
    input_snapshot = models.JSONField(default=dict)
    output_snapshot = models.JSONField(default=dict)
    rule_version = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class FeasibilityConfiguration(models.Model):
    # Weights for 0-100 scoring
    profitability_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'))
    cash_flow_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'))
    dscr_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('20.00'))
    funding_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('15.00'))
    working_capital_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    promoter_contribution_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    risk_weight = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'))

    # DSCR Thresholds
    dscr_strong_threshold = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('1.50'))
    dscr_moderate_threshold = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('1.20'))
    dscr_weak_threshold = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('1.00'))

    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_config(cls):
        config = cls.objects.first()
        if not config:
            config = cls.objects.create()
        return config

