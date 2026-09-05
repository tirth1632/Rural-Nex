from rest_framework import views, response, permissions
from rest_framework.exceptions import ValidationError
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from .services import MarketIntelligenceService
from .serializers import CompetitorPOISerializer, ExternalObservationSerializer

class BaseMarketAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_query_params(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lng = float(request.query_params.get('lng'))
            radius = float(request.query_params.get('radius', 5.0)) # Default 5km
        except (TypeError, ValueError):
            raise ValidationError({"error": "Valid lat, lng, and radius (optional) are required."})
        
        category = request.query_params.get('category', None)
        return lat, lng, radius, category

class CompetitorsAPIView(BaseMarketAPIView):
    def get(self, request):
        lat, lng, radius, category = self.get_query_params(request)
        user_loc = Point(lng, lat, srid=4326)
        
        competitors = MarketIntelligenceService.get_competitors_within_radius(lat, lng, radius, category)
        # Annotate exact distance for serialization
        competitors = competitors.annotate(distance=Distance('location', user_loc)).order_by('distance')
        
        serializer = CompetitorPOISerializer(competitors, many=True)
        return response.Response({
            "meta": {
                "lat": lat,
                "lng": lng,
                "radius_km": radius,
                "count": competitors.count()
            },
            "data": serializer.data
        })

class DensityAPIView(BaseMarketAPIView):
    def get(self, request):
        lat, lng, radius, category = self.get_query_params(request)
        
        density_data = MarketIntelligenceService.calculate_competitor_density(lat, lng, radius, category)
        distribution = MarketIntelligenceService.get_category_distribution(lat, lng, radius)
        
        return response.Response({
            "density": density_data,
            "distribution": distribution
        })

class ObservationsAPIView(BaseMarketAPIView):
    def get(self, request):
        lat, lng, radius, category = self.get_query_params(request)
        
        observations = MarketIntelligenceService.get_external_observations(lat, lng, radius, category)
        serializer = ExternalObservationSerializer(observations, many=True)
        
        return response.Response({
            "data": serializer.data
        })

class PricingAPIView(BaseMarketAPIView):
    def get(self, request):
        lat, lng, radius, category = self.get_query_params(request)
        # Assuming pricing data is stored under category='price'
        observations = MarketIntelligenceService.get_external_observations(lat, lng, radius, category='price')
        
        if category:
            observations = observations.filter(sub_category=category)
            
        serializer = ExternalObservationSerializer(observations, many=True)
        return response.Response({
            "data": serializer.data
        })
