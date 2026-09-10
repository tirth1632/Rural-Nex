from django.contrib.gis.db import models
from core.models import AuditModel, SoftDeleteModel

class Location(AuditModel, SoftDeleteModel):
    name = models.CharField(max_length=255)
    point = models.PointField(geography=True, srid=4326)
    formatted_address = models.TextField(blank=True, null=True)
    
    # Store standard hierarchy if resolved
    village = models.CharField(max_length=100, blank=True, null=True)
    block = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class State(AuditModel, SoftDeleteModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    boundary = models.MultiPolygonField(geography=True, srid=4326, null=True, blank=True)

    def __str__(self):
        return self.name

class District(AuditModel, SoftDeleteModel):
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    boundary = models.MultiPolygonField(geography=True, srid=4326, null=True, blank=True)

    class Meta:
        unique_together = ('state', 'name')

    def __str__(self):
        return f"{self.name}, {self.state.name}"

class Block(AuditModel, SoftDeleteModel):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=100)
    boundary = models.MultiPolygonField(geography=True, srid=4326, null=True, blank=True)

    class Meta:
        unique_together = ('district', 'name')

    def __str__(self):
        return f"{self.name}, {self.district.name}"

class Village(AuditModel, SoftDeleteModel):
    block = models.ForeignKey(Block, on_delete=models.CASCADE, related_name='villages')
    name = models.CharField(max_length=100)
    centroid = models.PointField(geography=True, srid=4326, null=True, blank=True)
    boundary = models.MultiPolygonField(geography=True, srid=4326, null=True, blank=True)

    class Meta:
        unique_together = ('block', 'name')

    def __str__(self):
        return f"{self.name}, {self.block.name}"


# ==============================================================================
# DATASET MODELS (Ingested from project datasets in Datasets/)
# ==============================================================================

class DatasetLocation(AuditModel):
    village_code = models.BigIntegerField(unique=True, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    taluka_sub_district = models.CharField(max_length=100, db_index=True)
    village = models.CharField(max_length=150, db_index=True)
    area_locality = models.CharField(max_length=255, blank=True, null=True)
    district_code = models.IntegerField(null=True, blank=True)
    state_code = models.IntegerField(null=True, blank=True)
    latitude = models.FloatField(db_index=True)
    longitude = models.FloatField(db_index=True)
    population = models.IntegerField(default=1500)

    def __str__(self):
        return f"{self.village} ({self.district}, {self.state})"


class DatasetRouting(AuditModel):
    village_code = models.BigIntegerField(unique=True, db_index=True)
    village_name = models.CharField(max_length=150)
    straight_line_distance_km = models.FloatField(default=0.0)
    road_distance_km = models.FloatField(default=0.0)
    travel_time_minutes = models.IntegerField(default=0)
    nearest_highway_distance_km = models.FloatField(default=0.0)
    nearest_mandi_distance_km = models.FloatField(default=0.0)
    nearest_railway_station_km = models.FloatField(default=0.0)
    accessibility_rating = models.CharField(max_length=50, default='Medium')

    def __str__(self):
        return f"Routing for {self.village_name} ({self.accessibility_rating})"


class GroundwaterRecord(AuditModel):
    state_ut = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    block = models.CharField(max_length=100, blank=True, null=True)
    village = models.CharField(max_length=150, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True, db_index=True)
    longitude = models.FloatField(null=True, blank=True, db_index=True)
    date_recorded = models.CharField(max_length=50, blank=True, null=True)
    dtwl_meters = models.FloatField(help_text="Depth to Water Level in meters")

    def __str__(self):
        return f"{self.district}, {self.state_ut} - DTWL: {self.dtwl_meters}m"


class RuralWageRecord(AuditModel):
    year = models.CharField(max_length=20)
    month = models.CharField(max_length=20)
    state = models.CharField(max_length=100, db_index=True)
    occupation = models.CharField(max_length=100, db_index=True)
    item = models.CharField(max_length=150)
    wage_men = models.FloatField(null=True, blank=True)
    wage_women = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.state} - {self.item}: Men={self.wage_men}, Women={self.wage_women}"


class AsuseEnterpriseRecord(AuditModel):
    indicator = models.CharField(max_length=255)
    frequency = models.CharField(max_length=50, default='Annually')
    year = models.CharField(max_length=20, default='2025')
    state_ut = models.CharField(max_length=100, db_index=True)
    sector = models.CharField(max_length=50, default='Rural')
    activity_category = models.CharField(max_length=150, db_index=True)
    establishment_type = models.CharField(max_length=150)
    establishments_count = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.state_ut} - {self.activity_category}: {self.establishments_count}"


class EconomicIndexRecord(AuditModel):
    sector = models.CharField(max_length=50, default='Rural')
    year = models.IntegerField(default=2025)
    month = models.CharField(max_length=20)
    state = models.CharField(max_length=100, db_index=True)
    cpi_index = models.FloatField(default=100.0)

    def __str__(self):
        return f"{self.state} ({self.month} {self.year}): CPI {self.cpi_index}"


class InfrastructureCoopRecord(AuditModel):
    year = models.CharField(max_length=20)
    state_ut = models.CharField(max_length=100, db_index=True)
    number_of_societies = models.IntegerField(default=0)
    membership_thousands = models.FloatField(default=0.0)
    share_capital = models.FloatField(default=0.0)
    working_capital = models.FloatField(default=0.0)
    loans_issued = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.state_ut} ({self.year}): Societies={self.number_of_societies}"


class MicroEnterpriseSkillRecord(AuditModel):
    state_ut = models.CharField(max_length=100, db_index=True)
    candidates_trained = models.IntegerField(default=0)
    candidates_placed = models.IntegerField(default=0)
    beneficiaries_assisted = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.state_ut}: Trained={self.candidates_trained}, Assisted={self.beneficiaries_assisted}"


class WholesaleArrivalRecord(AuditModel):
    market_name = models.CharField(max_length=150, db_index=True)
    commodity = models.CharField(max_length=100, default='Chow Chow')
    state = models.CharField(max_length=100, default='Telangana')
    arrival_current_mt = models.FloatField(default=0.0)
    arrival_prev_week_mt = models.FloatField(default=0.0)
    arrival_prev_month_mt = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.market_name} - {self.commodity}: {self.arrival_current_mt} MT"

