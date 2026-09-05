from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import Count
from .models import CompetitorPOI, ExternalObservation
import math

class MarketIntelligenceService:
    @staticmethod
    def get_competitors_within_radius(lat: float, lng: float, radius_km: float, category: str = None):
        user_location = Point(lng, lat, srid=4326)
        
        # PostGIS DWithin spatial query
        qs = CompetitorPOI.objects.filter(location__distance_lte=(user_location, D(km=radius_km)))
        
        if category:
            qs = qs.filter(category=category)
            
        return qs

    @staticmethod
    def calculate_competitor_density(lat: float, lng: float, radius_km: float, category: str = None):
        """Calculates competitors per square kilometer within a radius."""
        competitors = MarketIntelligenceService.get_competitors_within_radius(lat, lng, radius_km, category)
        count = competitors.count()
        
        # Area of a circle = pi * r^2
        area_sq_km = math.pi * (radius_km ** 2)
        density = count / area_sq_km if area_sq_km > 0 else 0
        
        return {
            "radius_km": radius_km,
            "competitor_count": count,
            "area_sq_km": area_sq_km,
            "density_per_sq_km": density
        }

    @staticmethod
    def get_category_distribution(lat: float, lng: float, radius_km: float):
        """Returns the distribution of competitor categories within the radius."""
        competitors = MarketIntelligenceService.get_competitors_within_radius(lat, lng, radius_km)
        distribution = competitors.values('category').annotate(count=Count('category')).order_by('-count')
        return list(distribution)

    @staticmethod
    def get_external_observations(lat: float, lng: float, radius_km: float, category: str = None):
        user_location = Point(lng, lat, srid=4326)
        
        qs = ExternalObservation.objects.filter(geographic_scope__distance_lte=(user_location, D(km=radius_km)))
        if category:
            qs = qs.filter(category=category)
            
        return qs
