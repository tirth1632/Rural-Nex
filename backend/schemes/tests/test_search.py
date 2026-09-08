from decimal import Decimal
from django.test import TestCase
from django.core.management import call_command
from schemes.services.search_service import SchemeSearchService
from schemes.models import GovtScheme, GovernmentLevel


class SchemeSearchServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_govt_schemes')

    def test_search_all_schemes(self):
        res = SchemeSearchService.search(page_size=20)
        self.assertGreaterEqual(res['total_count'], 14)
        self.assertEqual(res['page'], 1)
        self.assertIn('central_count', res['facets'])
        self.assertIn('state_count', res['facets'])

    def test_search_by_keyword(self):
        res = SchemeSearchService.search(query='pmegp')
        self.assertGreaterEqual(res['total_count'], 1)
        scheme_ids = [s.official_id for s in res['schemes']]
        self.assertIn('PMEGP', scheme_ids)

    def test_search_by_state(self):
        res = SchemeSearchService.search(state='Gujarat', page_size=20)
        # Should include Central schemes + Gujarat state schemes (MMUY, GAIC, VBY)
        states = set(s.state for s in res['schemes'] if s.level == GovernmentLevel.STATE)
        self.assertTrue(all(st == 'Gujarat' for st in states))
        self.assertTrue(any(s.official_id == 'MMUY_GUJ' for s in res['schemes']))

    def test_filter_by_category(self):
        res = SchemeSearchService.search(category='women-shgs')
        self.assertGreaterEqual(res['total_count'], 1)
        self.assertTrue(all(s.category.slug == 'women-shgs' for s in res['schemes']))

    def test_filter_collateral_free(self):
        res = SchemeSearchService.search(collateral_free_only=True)
        self.assertGreaterEqual(res['total_count'], 1)
