from rest_framework import viewsets, views, generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from .models import Location, State, District, Block, Village
from .serializers import (
    LocationSerializer, LocationSummarySerializer, GeocodeRequestSerializer,
    StateSerializer, DistrictSerializer, BlockSerializer, VillageSerializer,
)
from .providers.factory import get_geo_provider


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        locations = Location.objects.filter(name__icontains=query)[:10]
        serializer = LocationSummarySerializer(locations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def nearby(self, request, pk=None):
        location = self.get_object()
        radius_km = float(request.query_params.get('radius', 5.0))

        nearby_locations = Location.objects.filter(
            point__dwithin=(location.point, D(km=radius_km))
        ).exclude(id=location.id).annotate(
            distance=Distance('point', location.point)
        ).order_by('distance')

        serializer = LocationSerializer(nearby_locations, many=True)
        return Response(serializer.data)


class GeocodeView(views.APIView):
    def post(self, request):
        serializer = GeocodeRequestSerializer(data=request.data)
        if serializer.is_valid():
            query = serializer.validated_data['query']
            provider = get_geo_provider()

            try:
                result = provider.geocode(query)
                point = Point(result['lng'], result['lat'], srid=4326)
                location, created = Location.objects.get_or_create(
                    point=point,
                    defaults={
                        'name': query,
                        'formatted_address': result.get('formatted_address', '')
                    }
                )
                return Response(LocationSummarySerializer(location).data)
            except Exception as e:
                return Response(
                    {'error': 'Geocoding failed', 'details': str(e)},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Hierarchy list views for cascading location UI ---

class StateListView(generics.ListAPIView):
    """GET /api/v1/geo/states/ — list all states ordered by name."""
    serializer_class = StateSerializer
    permission_classes = []  # Public — needed during registration (unauthenticated)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        return State.objects.order_by('name')


class DistrictListView(generics.ListAPIView):
    """GET /api/v1/geo/districts/?state=<id> — list districts for a state."""
    serializer_class = DistrictSerializer
    permission_classes = []
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        state_id = self.request.query_params.get('state')
        qs = District.objects.order_by('name')
        if state_id:
            qs = qs.filter(state_id=state_id)
        return qs


class BlockListView(generics.ListAPIView):
    """GET /api/v1/geo/blocks/?district=<id> — list blocks for a district."""
    serializer_class = BlockSerializer
    permission_classes = []
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        district_id = self.request.query_params.get('district')
        qs = Block.objects.order_by('name')
        if district_id:
            qs = qs.filter(district_id=district_id)
        return qs


class VillageListView(generics.ListAPIView):
    """GET /api/v1/geo/villages/?block=<id> — list villages for a block."""
    serializer_class = VillageSerializer
    permission_classes = []
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        block_id = self.request.query_params.get('block')
        qs = Village.objects.order_by('name')
        if block_id:
            qs = qs.filter(block_id=block_id)
        return qs
