from rest_framework import viewsets, views, generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from .models import Location, State, District, Block, Village, DatasetLocation
from .serializers import (
    LocationSerializer, LocationSummarySerializer, GeocodeRequestSerializer,
    StateSerializer, DistrictSerializer, BlockSerializer, VillageSerializer,
)
from .providers.factory import get_geo_provider
from .services.dataset_service import DatasetAnalyticsService
from advisory.scoring import DataDrivenSuitabilityEngine


class DynamicHierarchyView(views.APIView):
    """GET /api/v1/geo/hierarchy/ — Returns dynamic hierarchy of states and districts directly from dataset."""
    permission_classes = []

    def get(self, request):
        data = DatasetAnalyticsService.get_dynamic_hierarchy()
        return Response(data)


class DynamicDistrictsView(views.APIView):
    """GET /api/v1/geo/districts-data/?state=Gujarat — Returns districts for state with centroids."""
    permission_classes = []

    def get(self, request):
        state_name = request.query_params.get('state', 'Gujarat')
        data = DatasetAnalyticsService.get_districts_for_state(state_name)
        return Response(data)


class DynamicVillagesView(views.APIView):
    """GET /api/v1/geo/villages-data/?state=Rajasthan&district=Kota — Returns villages for district."""
    permission_classes = []

    def get(self, request):
        state_name = request.query_params.get('state', 'Rajasthan')
        district_name = request.query_params.get('district', 'Kota')
        data = DatasetAnalyticsService.get_villages_for_district(state_name, district_name)
        return Response(data)


class RadiusSearchView(views.APIView):
    """GET /api/v1/geo/radius-search/?lat=21.67&lng=74.99&radius=15&category=Food — Dynamic spatial query."""
    permission_classes = []

    def get(self, request):
        try:
            lat = float(request.query_params.get('lat', 21.670487))
            lng = float(request.query_params.get('lng', 74.996298))
            radius_km = float(request.query_params.get('radius', 10.0))
            category = request.query_params.get('category', None)
            
            data = DatasetAnalyticsService.radius_search(lat, lng, radius_km, category)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BusinessCategoriesView(views.APIView):
    """GET /api/v1/geo/business-categories/ — Returns unique business categories from dataset."""
    permission_classes = []

    def get(self, request):
        categories = DatasetAnalyticsService.get_available_business_categories()
        return Response({"categories": categories})


class SuitabilityAssessmentView(views.APIView):
    """POST /api/v1/geo/suitability-assessment/ — Calculates data-driven suitability score."""
    permission_classes = []

    def post(self, request):
        try:
            lat = float(request.data.get('lat', 21.670487))
            lng = float(request.data.get('lng', 74.996298))
            radius_km = float(request.data.get('radius', 10.0))
            category = request.data.get('category', 'Food Processing & Agribusiness')

            assessment = DataDrivenSuitabilityEngine.analyze_suitability(lat, lng, radius_km, category)
            return Response(assessment)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Legacy endpoints maintained for backward compatibility
class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class GeocodeView(views.APIView):
    def post(self, request):
        return Response({'message': 'Geocode static fallback'})

class StateListView(generics.ListAPIView):
    serializer_class = StateSerializer
    permission_classes = []
    def get_queryset(self): return State.objects.order_by('name')

class DistrictListView(generics.ListAPIView):
    serializer_class = DistrictSerializer
    permission_classes = []
    def get_queryset(self):
        qs = District.objects.select_related('state').order_by('name')
        state_param = self.request.query_params.get('state')
        state_id = self.request.query_params.get('state_id')
        if state_param:
            # Accept numeric ID or state name string
            if state_param.isdigit():
                qs = qs.filter(state_id=int(state_param))
            else:
                qs = qs.filter(state__name__iexact=state_param)
        elif state_id:
            qs = qs.filter(state_id=state_id)
        return qs

class BlockListView(generics.ListAPIView):
    serializer_class = BlockSerializer
    permission_classes = []
    def get_queryset(self): return Block.objects.order_by('name')

class VillageListView(generics.ListAPIView):
    serializer_class = VillageSerializer
    permission_classes = []
    def get_queryset(self): return Village.objects.order_by('name')
