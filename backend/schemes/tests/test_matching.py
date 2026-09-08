from decimal import Decimal
from django.test import TestCase
from django.core.management import call_command
from schemes.services.matching_engine import SchemeMatchingEngine
from schemes.services.benefit_calculator import SchemeBenefitCalculator
from schemes.models import GovtScheme


class SchemeMatchingAndBenefitTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_govt_schemes')

    def test_stand_up_india_gender_reservation(self):
        # Male General promoter should not qualify for Stand-Up India
        res_male = SchemeMatchingEngine.match_schemes(
            project_cost=Decimal('2000000.00'),
            promoter_profile={'gender': 'male', 'social_category': 'general', 'age': 30},
            location={'rural_urban': 'rural'},
            business_sector='Manufacturing'
        )
        su_male = next((s for s in res_male['matched_schemes'] if s['official_id'] == 'STAND_UP_INDIA'), None)
        if su_male:
            self.assertEqual(su_male['eligibility_status'], 'Not Eligible')

        # Female promoter should qualify
        res_female = SchemeMatchingEngine.match_schemes(
            project_cost=Decimal('2000000.00'),
            promoter_profile={'gender': 'female', 'social_category': 'general', 'age': 30},
            location={'rural_urban': 'rural'},
            business_sector='Manufacturing'
        )
        su_female = next((s for s in res_female['matched_schemes'] if s['official_id'] == 'STAND_UP_INDIA'), None)
        self.assertIsNotNone(su_female)
        self.assertIn(su_female['eligibility_status'], ['Eligible', 'Potentially Eligible'])

    def test_pmegp_subsidy_rate_rural_special(self):
        # Rural Special category (e.g. SC/ST/Women in Rural) should get 35% PMEGP
        res = SchemeMatchingEngine.match_schemes(
            project_cost=Decimal('1000000.00'),
            promoter_profile={'gender': 'female', 'social_category': 'general', 'age': 28},
            location={'rural_urban': 'rural', 'state': 'Gujarat'},
            business_sector='Manufacturing'
        )
        pmegp = next((s for s in res['matched_schemes'] if s['official_id'] == 'PMEGP'), None)
        self.assertIsNotNone(pmegp)
        self.assertEqual(pmegp['financial_preview']['applicable_subsidy_pct'], 35.0)
        self.assertEqual(pmegp['financial_preview']['potential_subsidy_amount'], 350000.0)

    def test_benefit_calculator_capping(self):
        pmegp = GovtScheme.objects.get(official_id='PMEGP')
        # Cost of ₹60 Lakh exceeds ₹50 Lakh max ceiling; subsidy should be capped at ₹17.5 Lakh (35% of ₹50L)
        res = SchemeBenefitCalculator.calculate_benefit(
            scheme=pmegp,
            project_cost=Decimal('6000000.00'),
            promoter_profile={'gender': 'female', 'social_category': 'general'},
            location={'rural_urban': 'rural'}
        )
        self.assertEqual(res['eligible_cost_base'], 5000000.0)
        self.assertEqual(res['potential_subsidy_amount'], 1750000.0)
        self.assertIn("capped", res['calculation_steps'][0].lower())

    def test_interest_subvention_calculation(self):
        aif = GovtScheme.objects.get(official_id='AIF')
        res = SchemeBenefitCalculator.calculate_benefit(
            scheme=aif,
            project_cost=Decimal('5000000.00'),
            promoter_profile={'gender': 'male', 'social_category': 'general'},
            location={'rural_urban': 'rural'}
        )
        self.assertEqual(res['interest_subvention_pct'], 3.0)
        self.assertGreater(res['annual_interest_savings'], 0.0)
