from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import Count
from .models import CompetitorPOI, ExternalObservation
import math

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class MarketIntelligenceService:
    @staticmethod
    def get_competitors_within_radius(lat: float, lng: float, radius_km: float, category: str = None):
        try:
            user_location = Point(lng, lat, srid=4326)
            # PostGIS DWithin spatial query
            qs = CompetitorPOI.objects.filter(location__distance_lte=(user_location, D(km=radius_km)))
            if category:
                qs = qs.filter(category=category)
            # Evaluate count to check if database backend supports spatial lookup
            _ = qs.count()
            return qs
        except Exception:
            # Fallback for SQLite without SpatiaLite or unsupported spatial lookups
            try:
                qs = CompetitorPOI.objects.all()
                if category:
                    qs = qs.filter(category=category)
                
                matching_ids = []
                for poi in qs:
                    try:
                        p_lat = getattr(poi, 'latitude', None)
                        p_lng = getattr(poi, 'longitude', None)
                        if p_lat is None and hasattr(poi, 'location') and poi.location:
                            p_lat = poi.location.y
                            p_lng = poi.location.x
                        if p_lat is not None and p_lng is not None:
                            dist = haversine(lat, lng, float(p_lat), float(p_lng))
                            if dist <= radius_km:
                                matching_ids.append(poi.pk)
                    except Exception:
                        continue
                return CompetitorPOI.objects.filter(pk__in=matching_ids)
            except Exception:
                return CompetitorPOI.objects.none()

    @staticmethod
    def calculate_competitor_density(lat: float, lng: float, radius_km: float, category: str = None):
        """Calculates competitors per square kilometer within a radius."""
        try:
            competitors = MarketIntelligenceService.get_competitors_within_radius(lat, lng, radius_km, category)
            count = competitors.count()
        except Exception:
            count = 0
            
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
        try:
            competitors = MarketIntelligenceService.get_competitors_within_radius(lat, lng, radius_km)
            distribution = competitors.values('category').annotate(count=Count('category')).order_by('-count')
            return list(distribution)
        except Exception:
            return []

    @staticmethod
    def get_external_observations(lat: float, lng: float, radius_km: float, category: str = None):
        try:
            user_location = Point(lng, lat, srid=4326)
            qs = ExternalObservation.objects.filter(geographic_scope__distance_lte=(user_location, D(km=radius_km)))
            if category:
                qs = qs.filter(category=category)
            _ = qs.count()
            return qs
        except Exception:
            try:
                qs = ExternalObservation.objects.all()
                if category:
                    qs = qs.filter(category=category)
                _ = qs.count()
                return qs
            except Exception:
                return ExternalObservation.objects.none()


