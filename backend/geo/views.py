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


class DynamicBlocksView(views.APIView):
    """GET /api/v1/geo/blocks-data/?state=Gujarat&district=Ahmedabad — Returns blocks/talukas."""
    permission_classes = []

    def get(self, request):
        state_name = request.query_params.get('state', '')
        district_name = request.query_params.get('district', '')
        data = DatasetAnalyticsService.get_blocks_for_district(state_name, district_name)
        return Response(data)


class DynamicVillagesView(views.APIView):
    """GET /api/v1/geo/villages-data/?state=Gujarat&district=Ahmedabad&block=Daskroi — Returns villages."""
    permission_classes = []

    def get(self, request):
        state_name = request.query_params.get('state', '')
        district_name = request.query_params.get('district', '')
        block_name = request.query_params.get('block', None)
        data = DatasetAnalyticsService.get_villages_for_district(state_name, district_name, block_name)
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


class DataStatusView(views.APIView):
    """GET /api/v1/geo/data-status/ — Returns live row counts, columns, and file statuses for all 18 datasets."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        return Response(engine.get_data_status())


class BusinessesDataView(views.APIView):
    """GET /api/v1/geo/businesses-data/?state=... — Returns dynamic business & skill dataset records."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        state = request.query_params.get('state')
        return Response(engine.get_businesses(state=state))


class PopulationDataView(views.APIView):
    """GET /api/v1/geo/population-data/?state=...&district=... — Returns dynamic population summary."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        return Response(engine.get_population_summary(state=state, district=district))


class GroundwaterDataView(views.APIView):
    """GET /api/v1/geo/groundwater-data/?state=...&district=... — Returns depth-to-water level readings."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        state = request.query_params.get('state')
        district = request.query_params.get('district')
        block = request.query_params.get('block')
        village = request.query_params.get('village')
        return Response(engine.get_groundwater_readings(state=state, district=district, block=block, village=village))


class EconomicsDataView(views.APIView):
    """GET /api/v1/geo/economics-data/?state=... — Returns rural wages, ASUSE & CPI economic trends."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        state = request.query_params.get('state')
        wages = engine.get_rural_wages(state=state)
        return Response({"wages": wages})


class LivestockDataView(views.APIView):
    """GET /api/v1/geo/livestock-data/?state=... — Returns canonical NSS 77th AIDIS livestock asset statistics."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        state = request.query_params.get('state')
        return Response(engine.get_livestock_stats(state=state))


class MarketDataView(views.APIView):
    """GET /api/v1/geo/market-data/ — Returns daily mandi price and commodity arrival analysis."""
    permission_classes = []

    def get(self, request):
        from data.services.data_engine import DataEngine
        engine = DataEngine.get_instance()
        return Response(engine.get_market_prices())


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
