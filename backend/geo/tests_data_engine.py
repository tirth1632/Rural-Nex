from django.test import TestCase, Client
import json
from data.services.data_engine import DataEngine, haversine_km, normalize_state, parse_float
from geo.models import DatasetLocation, DatasetRouting, GroundwaterRecord, RuralWageRecord

class DataEngineTestSuite(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.engine = DataEngine.get_instance()
        
        # Seed test data models if needed
        DatasetLocation.objects.get_or_create(
            village_code=81311001,
            defaults={
                'state': 'Rajasthan',
                'district': 'Kota',
                'taluka_sub_district': 'Kota',
                'village': 'Devpur pukhuria',
                'latitude': 21.670487,
                'longitude': 74.996298,
                'population': 1845
            }
        )
        DatasetRouting.objects.get_or_create(
            village_code=81311001,
            defaults={
                'village_name': 'Devpur pukhuria',
                'road_distance_km': 29.16,
                'travel_time_minutes': 71,
                'accessibility_rating': 'High'
            }
        )

    def test_01_dataset_loading(self):
        """Test 1: Verify all 18 project datasets are loaded cleanly."""
        self.assertTrue(self.engine.is_loaded)
        status = self.engine.get_data_status()
        self.assertGreaterEqual(len(status), 18)
        loaded_keys = [s["dataset"] for s in status if s["status"] == "Loaded"]
        self.assertIn("businesses", loaded_keys)
        self.assertIn("population", loaded_keys)
        self.assertIn("groundwater", loaded_keys)
        self.assertIn("livestock_canonical", loaded_keys)

    def test_02_schema_detection(self):
        """Test 2: Verify schema metadata generation."""
        schemas = self.engine.schema_metadata
        self.assertIn("businesses", schemas)
        self.assertIn("population", schemas)
        self.assertIn("groundwater", schemas)
        self.assertIn("columns", schemas["businesses"]["sheets"]["default"])

    def test_03_normalization(self):
        """Test 3: Verify state and text normalization."""
        self.assertEqual(normalize_state("ANDHRA PRADESH"), "Andhra Pradesh")
        self.assertEqual(normalize_state("ORISSA"), "Odisha")
        self.assertEqual(normalize_state("UTTARANCHAL"), "Uttarakhand")
        self.assertIsNone(parse_float("--"))
        self.assertIsNone(parse_float("@"))
        self.assertEqual(parse_float("1,245.50"), 1245.50)

    def test_04_geographic_hierarchy(self):
        """Test 4: Verify state -> district -> block -> village hierarchy."""
        states = self.engine.get_states()
        self.assertIsInstance(states, list)
        self.assertGreater(len(states), 0)
        
        guj_districts = self.engine.get_districts("Gujarat")
        self.assertIsInstance(guj_districts, list)
        self.assertGreater(len(guj_districts), 0)

    def test_05_haversine_radius_filtering(self):
        """Test 5: Verify Haversine formula calculation for 10-100km radius."""
        d = haversine_km(21.670487, 74.996298, 21.700000, 75.000000)
        self.assertLess(d, 10.0) # Should be ~4km
        
        villages = self.engine.get_radius_villages(21.670487, 74.996298, radius_km=25)
        self.assertIsInstance(villages, list)

    def test_06_api_endpoints(self):
        """Test 6: Verify Django REST API endpoints respond with valid JSON."""
        client = Client()
        
        # Test Hierarchy
        res = client.get('/api/v1/geo/hierarchy/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("states", data)

        # Test Data Status Endpoint
        res = client.get('/api/v1/geo/data-status/')
        self.assertEqual(res.status_code, 200)
        status_data = res.json()
        self.assertGreaterEqual(len(status_data), 18)

        # Test Radius Search Endpoint
        res = client.get('/api/v1/geo/radius-search/?lat=21.67&lng=74.99&radius=25')
        self.assertEqual(res.status_code, 200)
        radius_data = res.json()
        self.assertIn("summary", radius_data)

        # Test Businesses Data Endpoint
        res = client.get('/api/v1/geo/businesses-data/')
        self.assertEqual(res.status_code, 200)

        # Test Population Summary Endpoint
        res = client.get('/api/v1/geo/population-data/?state=Gujarat')
        self.assertEqual(res.status_code, 200)

        # Test Groundwater Data Endpoint
        res = client.get('/api/v1/geo/groundwater-data/?state=Andhra%20Pradesh')
        self.assertEqual(res.status_code, 200)
