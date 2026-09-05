from django.conf import settings
from .mock import MockGeoProvider
from .base import GeocodingProvider, MapProvider, NearbyPlacesProvider

def get_geo_provider():
    """
    Returns the active geographic provider based on Django settings.
    Defaults to MockGeoProvider if an external service is not configured.
    """
    # Check settings for a preferred provider (e.g., 'GOOGLE', 'MAPBOX')
    provider_name = getattr(settings, 'GEO_PROVIDER', 'MOCK')
    
    if provider_name == 'MOCK':
        return MockGeoProvider()
    
    # Example for future integration
    # if provider_name == 'GOOGLE':
    #     return GoogleGeoProvider(api_key=settings.GOOGLE_MAPS_API_KEY)

    return MockGeoProvider()
