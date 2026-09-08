from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status
from schemes.models import GovtScheme


class SchemeAPIEndpointsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_govt_schemes')

    def setUp(self):
        self.client = APIClient()

    def test_stats_api(self):
        res = self.client.get('/api/schemes/stats/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data['total_schemes'], 14)
        self.assertGreaterEqual(res.data['verified_schemes'], 14)

    def test_list_and_search_api(self):
        res = self.client.get('/api/schemes/?q=pmegp')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data['results']), 1)

    def test_categories_api(self):
        res = self.client.get('/api/schemes/categories/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 9)

    def test_detail_api(self):
        scheme = GovtScheme.objects.first()
        res = self.client.get(f'/api/schemes/{scheme.official_id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['official_id'], scheme.official_id)
        self.assertIn('benefits', res.data)
        self.assertIn('eligibility_rules', res.data)
        self.assertIn('documents', res.data)
        self.assertIn('application_steps', res.data)

    def test_match_api(self):
        payload = {
            'project_cost': 500000,
            'business_sector': 'Dairy & Livestock',
            'state': 'Gujarat',
            'rural_urban': 'rural',
            'gender': 'female',
            'promoter_category': 'special',
            'age': 29
        }
        res = self.client.post('/api/schemes/match/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('matched_schemes', res.data)
        self.assertGreaterEqual(res.data['total_matches'], 1)

    def test_compare_api(self):
        res = self.client.post('/api/schemes/compare/', {
            'scheme_ids': ['PMEGP', 'PM_MUDRA']
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['schemes']), 2)

    def test_add_to_financial_plan_api(self):
        res = self.client.post('/api/schemes/PMEGP/add-to-financial-plan/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['official_id'], 'PMEGP')
        self.assertIn('financial_rules', res.data)
        self.assertIn('redirect_url', res.data)
