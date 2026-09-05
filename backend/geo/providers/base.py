from abc import ABC, abstractmethod
from typing import Dict, Any, List

class GeocodingProvider(ABC):
    @abstractmethod
    def geocode(self, query: str) -> Dict[str, Any]:
        """
        Geocodes a search string and returns standard normalized dictionary:
        {
            'lat': float,
            'lng': float,
            'formatted_address': str,
            'confidence': str
        }
        """
        pass

class MapProvider(ABC):
    @abstractmethod
    def get_static_map_url(self, lat: float, lng: float, zoom: int) -> str:
        """Returns a URL for a static map image."""
        pass

class NearbyPlacesProvider(ABC):
    @abstractmethod
    def get_nearby_places(self, lat: float, lng: float, radius: int, category: str = None) -> List[Dict[str, Any]]:
        """
        Retrieves nearby points of interest.
        Returns a list of dicts with lat, lng, name, and category.
        """
        pass
