from django.db import models
from core.models import AuditModel

class BusinessCategory(AuditModel):
    name = models.CharField(max_length=100, unique=True, help_text="e.g. Dairy, Retail")
    description = models.TextField(blank=True, null=True)
    icon_slug = models.CharField(max_length=50, blank=True, help_text="Slug for UI icon mapping")

    def __str__(self):
        return self.name

class BusinessType(AuditModel):
    category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE, related_name='types')
    name = models.CharField(max_length=150, help_text="e.g. Milk Collection Center")
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class Product(AuditModel):
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=150, help_text="e.g. Buffalo Milk")
    base_unit = models.CharField(max_length=50, help_text="e.g. Litre, Kg, Piece")

    def __str__(self):
        return f"{self.name} ({self.base_unit})"

class CostComponent(AuditModel):
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE, related_name='cost_components')
    name = models.CharField(max_length=150, help_text="e.g. Fodder, Electricity")
    frequency = models.CharField(max_length=50, help_text="e.g. Daily, Monthly, Yearly")
    is_variable = models.BooleanField(default=True, help_text="True if variable cost, False if fixed")

    def __str__(self):
        return self.name

class RevenueComponent(AuditModel):
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE, related_name='revenue_components')
    name = models.CharField(max_length=150, help_text="e.g. Daily Milk Sales")
    frequency = models.CharField(max_length=50, help_text="e.g. Daily, Monthly")

    def __str__(self):
        return self.name

class OperationalRisk(AuditModel):
    business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE, related_name='risks')
    name = models.CharField(max_length=200, help_text="e.g. Disease Outbreak")
    description = models.TextField()
    severity = models.CharField(max_length=50, choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')])

    def __str__(self):
        return self.name
