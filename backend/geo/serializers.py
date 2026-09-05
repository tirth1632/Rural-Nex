from rest_framework import serializers
from .models import Location, Village, Block, District, State
from rest_framework_gis.serializers import GeoFeatureModelSerializer


class LocationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Location
        geo_field = "point"
        fields = ['id', 'name', 'formatted_address', 'village', 'block', 'district', 'state']


class LocationSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'formatted_address', 'village', 'block', 'district', 'state']


class GeocodeRequestSerializer(serializers.Serializer):
    query = serializers.CharField(required=True)


# --- Hierarchy serializers for cascading location selects ---

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name', 'code']


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ['id', 'name', 'state']


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = ['id', 'name', 'district']


class VillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Village
        fields = ['id', 'name', 'block']
