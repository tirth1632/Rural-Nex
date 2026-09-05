from django.db import models
from django.contrib.gis.db import models as gis_models

class ProvenanceType(models.TextChoices):
    VERIFIED_EXTERNAL = 'VERIFIED_EXTERNAL_DATA', 'Verified External Data'
    DETERMINISTIC = 'DETERMINISTIC_CALCULATION', 'Deterministic Calculation'
    AI_GENERATED = 'AI_GENERATED_RECOMMENDATION', 'AI Generated Recommendation'
    ASSUMPTION = 'ASSUMPTION_ESTIMATE', 'Assumption / Estimate'

class DataSource(models.Model):
    provider_name = models.CharField(max_length=255)
    source_url = models.URLField(max_length=500, null=True, blank=True)
    retrieval_timestamp = models.DateTimeField(auto_now_add=True)
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    verification_status = models.CharField(max_length=50, default='UNVERIFIED')
    raw_data_snapshot = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.provider_name} at {self.retrieval_timestamp}"

class ExternalObservation(models.Model):
    """
    A generic model for storing atomic data points (demographics, pricing, indicators)
    as requested in the Hyper-Local Data Aggregation subsystem.
    """
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='observations')
    collection_timestamp = models.DateTimeField(auto_now_add=True)
    geographic_scope = gis_models.GeometryField(null=True, blank=True) # Point or Polygon
    category = models.CharField(max_length=100, help_text="e.g. demographic, price, indicator")
    sub_category = models.CharField(max_length=100, blank=True)
    raw_value = models.JSONField()
    normalized_value = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.category} - {self.normalized_value}"

class CompetitorPOI(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    location = gis_models.PointField()
    distance_from_center_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    data_source = models.ForeignKey(DataSource, on_delete=models.SET_NULL, null=True, related_name='competitors')

    def __str__(self):
        return self.name

class MarketAnalysis(models.Model):
    # Temporarily removing AnalysisRun foreign key to decouple from advisory
    competitor_count = models.IntegerField(default=0)
    competitor_density = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True) # per sq km
    distance_to_nearest_competitor_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    market_radius_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    estimated_market_reach = models.IntegerField(null=True, blank=True) # estimated population/footfall
    service_business_gap = models.TextField(blank=True)
    proximity_to_infrastructure = models.TextField(blank=True)
    
    data_source = models.ForeignKey(DataSource, on_delete=models.SET_NULL, null=True, blank=True)
    provenance = models.CharField(max_length=50, choices=ProvenanceType.choices, default=ProvenanceType.DETERMINISTIC)
