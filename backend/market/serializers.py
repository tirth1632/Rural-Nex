from rest_framework import serializers
from .models import CompetitorPOI, ExternalObservation, DataSource
from django.contrib.gis.geos import Point

class PointSerializer(serializers.Field):
    """Custom serializer for PostGIS Point geometry."""
    def to_representation(self, value: Point):
        if value:
            return {"lat": value.y, "lng": value.x}
        return None

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = ['id', 'provider_name', 'source_url', 'retrieval_timestamp', 'confidence_score', 'verification_status']

class CompetitorPOISerializer(serializers.ModelSerializer):
    location = PointSerializer()
    data_source = DataSourceSerializer(read_only=True)
    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = CompetitorPOI
        fields = ['id', 'name', 'category', 'location', 'distance_from_center_km', 'data_source', 'distance_km']
        
    def get_distance_km(self, obj):
        # If annotated by the queryset using Distance()
        if hasattr(obj, 'distance'):
            return round(obj.distance.km, 2)
        return obj.distance_from_center_km

class ExternalObservationSerializer(serializers.ModelSerializer):
    source = DataSourceSerializer(read_only=True)
    geographic_scope = PointSerializer()

    class Meta:
        model = ExternalObservation
        fields = [
            'id', 'source', 'collection_timestamp', 'geographic_scope', 
            'category', 'sub_category', 'raw_value', 'normalized_value', 'confidence_score'
        ]
