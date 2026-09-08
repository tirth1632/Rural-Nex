import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings


class GovernmentLevel(models.TextChoices):
    CENTRAL = 'CENTRAL', 'Central Government'
    STATE = 'STATE', 'State Government'
    LOCAL = 'LOCAL', 'District / Local Agency'


class SchemeStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active & Accepting Applications'
    EXPIRED = 'EXPIRED', 'Expired / Superseded'
    PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Official Verification'


class VerificationStatus(models.TextChoices):
    OFFICIAL = 'OFFICIAL', 'Official Government Data'
    VERIFIED = 'VERIFIED', 'Verified by Financial Institution'
    PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'
    EXPIRED = 'EXPIRED', 'Expired / Superseded'


class BenefitType(models.TextChoices):
    CAPITAL_SUBSIDY = 'CAPITAL_SUBSIDY', 'Capital Subsidy'
    INTEREST_SUBVENTION = 'INTEREST_SUBVENTION', 'Interest Subvention'
    CREDIT_GUARANTEE = 'CREDIT_GUARANTEE', 'Credit Guarantee Cover'
    LOAN_SUPPORT = 'LOAN_SUPPORT', 'Term Loan / Working Capital'
    GRANT = 'GRANT', 'Direct Grant Support'
    WORKING_CAPITAL = 'WORKING_CAPITAL', 'Working Capital Assistance'
    COLLATERAL_FREE = 'COLLATERAL_FREE', 'Collateral-Free Loan'
    TRAINING_INFRA = 'TRAINING_INFRA', 'Training & Skill Development'
    INSURANCE = 'INSURANCE', 'Risk & Insurance Coverage'


class CalculationType(models.TextChoices):
    PERCENTAGE = 'PERCENTAGE', 'Percentage of Eligible Cost'
    FIXED = 'FIXED', 'Fixed Lump-Sum Amount'
    TIERED_PERCENTAGE = 'TIERED_PERCENTAGE', 'Tiered Percentage'
    INTEREST_SPREAD = 'INTEREST_SPREAD', 'Annual Interest Rate Discount'


class RequirementLevel(models.TextChoices):
    REQUIRED = 'REQUIRED', 'Mandatory Document'
    CONDITIONAL = 'CONDITIONAL', 'Conditional on Category/Project'
    OPTIONAL = 'OPTIONAL', 'Optional / Supporting'


class SubsidyTiming(models.TextChoices):
    BACK_ENDED = 'BACK_ENDED', 'Back-Ended Capital Subsidy (TDR)'
    UPFRONT = 'UPFRONT', 'Upfront Capital Subsidy'


class SchemeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='Landmark')
    description = models.TextField(blank=True, default='')
    sort_order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Scheme Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class GovtScheme(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    official_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    short_name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=120, unique=True)
    level = models.CharField(max_length=20, choices=GovernmentLevel.choices, default=GovernmentLevel.CENTRAL)
    state = models.CharField(max_length=100, blank=True, default='', db_index=True, help_text="e.g. Gujarat (empty for Central schemes)")
    districts = models.JSONField(default=list, blank=True, help_text="List of district names if district-specific")
    ministry = models.CharField(max_length=255, db_index=True)
    department = models.CharField(max_length=255, blank=True, default='')
    nodal_agency = models.CharField(max_length=255, blank=True, default='')
    category = models.ForeignKey(SchemeCategory, on_delete=models.SET_NULL, null=True, related_name='schemes')
    sectors = models.JSONField(default=list, help_text="e.g. ['Dairy & Livestock', 'Agriculture & Allied']")
    description = models.TextField()
    short_description = models.TextField(blank=True, default='')
    target_audience = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=SchemeStatus.choices, default=SchemeStatus.ACTIVE, db_index=True)

    # Official Source Metadata
    official_portal_url = models.URLField(blank=True, default='')
    source_name = models.CharField(max_length=255, default='Official Government Scheme Portal')
    source_url = models.URLField(blank=True, default='')
    source_document = models.CharField(max_length=255, blank=True, default='')
    source_document_date = models.DateField(null=True, blank=True)
    last_verified_date = models.DateField(db_index=True)
    verification_status = models.CharField(
        max_length=30, 
        choices=VerificationStatus.choices, 
        default=VerificationStatus.OFFICIAL, 
        db_index=True
    )
    scheme_version = models.CharField(max_length=50, default='2026.01')
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)

    # Ranking & Search
    priority_score = models.IntegerField(default=100)
    keywords = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority_score', 'name']

    def __str__(self):
        return f"{self.short_name} - {self.name} ({self.get_level_display()})"


class SchemeBenefit(models.Model):
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='benefits')
    benefit_type = models.CharField(max_length=50, choices=BenefitType.choices)
    calculation_type = models.CharField(max_length=50, choices=CalculationType.choices, default=CalculationType.PERCENTAGE)
    title = models.CharField(max_length=255)
    percentage = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    fixed_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    max_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    min_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    eligible_base_description = models.CharField(max_length=255, blank=True, default='')
    conditions = models.TextField(blank=True, default='')
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ['-is_primary', 'id']

    def __str__(self):
        return f"{self.scheme.short_name}: {self.title}"


class SchemeEligibilityRule(models.Model):
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='eligibility_rules')
    field = models.CharField(max_length=100, db_index=True, help_text="e.g. state, rural_urban, age, gender, project_cost, sector")
    operator = models.CharField(max_length=20, default='=', help_text="=, !=, >, >=, <, <=, IN, NOT_IN, BETWEEN, CONTAINS")
    expected_value = models.JSONField(help_text="Target value or array of values")
    condition_group = models.CharField(max_length=50, default='DEFAULT')
    priority = models.IntegerField(default=1)
    rule_description = models.TextField()
    is_mandatory = models.BooleanField(default=True)

    class Meta:
        ordering = ['priority', 'id']

    def __str__(self):
        return f"{self.scheme.short_name}: {self.field} {self.operator} {self.expected_value}"


class SchemeFinancialRule(models.Model):
    scheme = models.OneToOneField(GovtScheme, on_delete=models.CASCADE, related_name='financial_rule')
    min_project_cost = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    max_project_cost = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    max_loan_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    
    # Margin
    min_promoter_margin_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    promoter_margin_special_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'))

    # Subsidies
    subsidy_rate_general_urban = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    subsidy_rate_general_rural = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    subsidy_rate_special_urban = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    subsidy_rate_special_rural = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    max_subsidy_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    subsidy_timing = models.CharField(max_length=50, choices=SubsidyTiming.choices, default=SubsidyTiming.BACK_ENDED)

    # Lending parameters
    interest_rate_min = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('8.50'))
    interest_rate_max = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('11.50'))
    interest_subvention_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    subvention_tenure_years = models.IntegerField(default=0)
    tenure_months_max = models.IntegerField(default=84)
    moratorium_months_max = models.IntegerField(default=6)
    collateral_type = models.CharField(max_length=255, default='Collateral-Free via Credit Guarantee')

    def __str__(self):
        return f"Financial Rule for {self.scheme.short_name}"


class SchemeDocument(models.Model):
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    requirement_level = models.CharField(max_length=30, choices=RequirementLevel.choices, default=RequirementLevel.REQUIRED)
    issuing_authority = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']

    def __str__(self):
        return f"{self.scheme.short_name} Doc: {self.name}"


class SchemeApplicationStep(models.Model):
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='application_steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    portal_url = models.URLField(blank=True, default='')
    expected_time_days = models.IntegerField(default=15)

    class Meta:
        ordering = ['step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.title} ({self.scheme.short_name})"


class SavedScheme(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_schemes')
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='saved_by_users')
    notes = models.TextField(blank=True, default='')
    notify_updates = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'scheme')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.scheme.short_name}"


class SchemeAuditLog(models.Model):
    scheme = models.ForeignKey(GovtScheme, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=50)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    old_values = models.JSONField(default=dict)
    new_values = models.JSONField(default=dict)
    reason = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.scheme.short_name} - {self.action} at {self.timestamp}"
