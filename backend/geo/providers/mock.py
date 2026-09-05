from typing import Dict, Any, List
from .base import GeocodingProvider, MapProvider, NearbyPlacesProvider

class MockGeoProvider(GeocodingProvider, MapProvider, NearbyPlacesProvider):
    """
    Mock provider for local development or when external APIs are unavailable.
    Returns deterministic, clearly labeled mock data.
    """
    
    def geocode(self, query: str) -> Dict[str, Any]:
        return {
            'lat': 18.5204,
            'lng': 73.8567,
            'formatted_address': f"[MOCK] Result for '{query}' - Pune, Maharashtra",
            'confidence': 'HIGH (Mock)'
        }

    def get_static_map_url(self, lat: float, lng: float, zoom: int) -> str:
        return f"https://mock-map-server.local/map?lat={lat}&lng={lng}&z={zoom}"

    def get_nearby_places(self, lat: float, lng: float, radius: int, category: str = None) -> List[Dict[str, Any]]:
        return [
            {
                'id': 1,
                'name': '[MOCK] Local Grocer A',
                'lat': lat + 0.001,
                'lng': lng + 0.001,
                'category': category or 'Retail'
            },
            {
                'id': 2,
                'name': '[MOCK] Supermarket B',
                'lat': lat - 0.002,
                'lng': lng - 0.001,
                'category': category or 'Retail'
            }
        ]
