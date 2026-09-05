from abc import ABC, abstractmethod
from typing import List, Dict, Any
from .models import ExternalObservation, CompetitorPOI, DataSource
from django.contrib.gis.geos import Point

class GeocodingProvider(ABC):
    @abstractmethod
    def geocode(self, query: str) -> Dict[str, Any]:
        """Convert address string to lat/lng"""
        pass

    @abstractmethod
    def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """Convert lat/lng to address"""
        pass

class POIDataProvider(ABC):
    @abstractmethod
    def get_nearby_businesses(self, lat: float, lng: float, radius_km: float, category: str = None) -> List[Dict[str, Any]]:
        """Fetch nearby Points of Interest (POIs)"""
        pass

class DemographicProvider(ABC):
    @abstractmethod
    def get_demographics(self, lat: float, lng: float, radius_km: float) -> Dict[str, Any]:
        """Fetch population, income, etc."""
        pass

class MarketObservationProvider(ABC):
    @abstractmethod
    def get_price_observations(self, product_category: str, lat: float, lng: float) -> List[Dict[str, Any]]:
        """Fetch real-world price points"""
        pass

class EconomicIndicatorProvider(ABC):
    @abstractmethod
    def get_indicators(self, region_code: str) -> Dict[str, Any]:
        """Fetch inflation, growth rates, etc."""
        pass

# Implementation: Mock Provider for testing
class MockPOIDataProvider(POIDataProvider):
    def get_nearby_businesses(self, lat: float, lng: float, radius_km: float, category: str = None) -> List[Dict[str, Any]]:
        # Simulate some data around the given lat/lng
        return [
            {
                "name": "Local Grocery 1",
                "category": category or "Grocery",
                "lat": lat + 0.01,
                "lng": lng + 0.01,
                "distance_km": 1.2
            },
            {
                "name": "Local Grocery 2",
                "category": category or "Grocery",
                "lat": lat - 0.02,
                "lng": lng + 0.015,
                "distance_km": 2.5
            }
        ]
