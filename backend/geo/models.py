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
