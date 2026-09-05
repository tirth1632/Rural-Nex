from django.db import models
from django.conf import settings
from geo.models import Village, Block, District, State
from finance.models import SchemeDefinition

class JobState(models.TextChoices):
    QUEUED = 'QUEUED', 'Queued'
    PROCESSING = 'PROCESSING', 'Processing'
    FETCHING_LOCATION = 'FETCHING_LOCATION', 'Fetching Location'
    FETCHING_POI = 'FETCHING_POI', 'Fetching POI'
    ANALYZING_MARKET = 'ANALYZING_MARKET', 'Analyzing Market'
    GENERATING_AI = 'GENERATING_AI', 'Generating AI'
    COMPILING_REPORT = 'COMPILING_REPORT', 'Compiling Report'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class BusinessCategory(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class BusinessProposal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='proposals')
    category = models.ForeignKey(BusinessCategory, on_delete=models.SET_NULL, null=True, blank=True)
    margin_capital = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Tracking
    current_step = models.IntegerField(default=1)

    # Location hierarchy references
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    block = models.ForeignKey(Block, on_delete=models.SET_NULL, null=True, blank=True)
    village = models.ForeignKey(Village, on_delete=models.SET_NULL, null=True, blank=True)
    lat = models.FloatField(null=True, blank=True, db_index=True)
    lng = models.FloatField(null=True, blank=True, db_index=True)
    
    # Optional details
    expected_scale = models.CharField(max_length=100, blank=True)
    available_shop = models.BooleanField(default=False)
    experience_years = models.IntegerField(default=0)
    number_of_workers = models.IntegerField(default=1)
    target_customers = models.CharField(max_length=200, blank=True)
    products = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Proposal {self.id} for {self.user.username}"

class FinancialAssessment(models.Model):
    proposal = models.OneToOneField(BusinessProposal, on_delete=models.CASCADE, related_name='financial_assessment')
    scheme = models.ForeignKey(SchemeDefinition, on_delete=models.SET_NULL, null=True)
    feasible_project_cost = models.DecimalField(max_digits=12, decimal_places=2)
    constrained_project_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    working_capital_estimate = models.DecimalField(max_digits=12, decimal_places=2)
    cap_constrained = models.BooleanField(default=False)
    constraint_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

class RepaymentSchedule(models.Model):
    assessment = models.OneToOneField(FinancialAssessment, on_delete=models.CASCADE, related_name='repayment_schedule')
    total_principal = models.DecimalField(max_digits=12, decimal_places=2)
    total_interest = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount_payable = models.DecimalField(max_digits=12, decimal_places=2)
    installments_data = models.JSONField(help_text="Stores full schedule array")
    
class AnalysisRun(models.Model):
    proposal = models.ForeignKey(BusinessProposal, on_delete=models.CASCADE, related_name='analysis_runs')
    status = models.CharField(max_length=50, choices=JobState.choices, default=JobState.QUEUED)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    algorithm_version = models.CharField(max_length=50, default='1.0')
    prompt_version = models.CharField(max_length=50, default='1.0')
    input_snapshot = models.JSONField(null=True, blank=True)
    external_data_snapshot = models.JSONField(null=True, blank=True)
    failure_information = models.TextField(blank=True)

class AnalysisJob(models.Model):
    analysis_run = models.OneToOneField(AnalysisRun, on_delete=models.CASCADE, related_name='job')
    celery_task_id = models.CharField(max_length=255, null=True, blank=True)
    current_state = models.CharField(max_length=50, choices=JobState.choices, default=JobState.QUEUED)
    updated_at = models.DateTimeField(auto_now=True)

class FeasibilityReport(models.Model):
    analysis_run = models.OneToOneField(AnalysisRun, on_delete=models.CASCADE, related_name='report')
    executive_summary = models.TextField(blank=True)
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    scoring_data = models.JSONField(null=True, blank=True, help_text="Structured scoring output")
    is_feasible = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
