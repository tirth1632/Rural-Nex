from django.db import models
from decimal import Decimal

class MoratoriumPolicy(models.TextChoices):
    CAPITALIZE_INTEREST = 'CAPITALIZE_INTEREST', 'Capitalize Interest'
    PAY_INTEREST_ONLY = 'PAY_INTEREST_ONLY', 'Pay Interest Only'
    DEFER_INTEREST = 'DEFER_INTEREST', 'Defer Interest'

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
