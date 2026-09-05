from django.test import TestCase
from django.contrib.gis.geos import Point
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import Location

class GeographicSubsystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create a central location (e.g., Pune)
        self.center_loc = Location.objects.create(
            name="Pune Center",
            point=Point(73.8567, 18.5204, srid=4326),
            formatted_address="Pune, MH"
        )
        
        # Create a location 2km away
        # Approximately 1 degree = 111km, so 2km = 0.018 degrees
        self.nearby_loc = Location.objects.create(
            name="Nearby Village",
            point=Point(73.8567 + 0.018, 18.5204, srid=4326),
            formatted_address="Nearby, Pune"
        )
        
        # Create a location 20km away
        self.far_loc = Location.objects.create(
            name="Far Village",
            point=Point(73.8567 + 0.18, 18.5204, srid=4326),
            formatted_address="Far, Pune"
        )

    def test_search_location(self):
        url = reverse('location-search')
        response = self.client.get(f"{url}?q=Pune")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return both Pune Center and Nearby Village/Far Village since they contain 'Pune'
        # Wait, the names are "Pune Center", "Nearby Village", "Far Village". 
        # Only "Pune Center" has Pune in the name.
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Pune Center")

    def test_nearby_5km_radius(self):
        url = reverse('location-nearby', kwargs={'pk': self.center_loc.id})
        response = self.client.get(f"{url}?radius=5")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should include nearby_loc but NOT far_loc
        names = [item['properties']['name'] for item in response.data]
        self.assertIn("Nearby Village", names)
        self.assertNotIn("Far Village", names)

    def test_geocode_fallback(self):
        url = reverse('geocode')
        response = self.client.post(url, {'query': 'Test Location'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('lat', response.data['point']['coordinates'][1]) # Just checking structure 
        # The mock provider returns 18.5204, 73.8567
        self.assertEqual(response.data['formatted_address'], "[MOCK] Result for 'Test Location' - Pune, Maharashtra")
