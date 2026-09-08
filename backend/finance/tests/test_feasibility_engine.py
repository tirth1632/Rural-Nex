from decimal import Decimal
from datetime import date
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from finance.models import (
    BusinessActivity, 
    ActivityDriverTemplate, 
    SchemeMaster, 
    SchemeRule, 
    VerificationStatus, 
    SubsidyTiming, 
    BusinessSector,
    FinancialProjectPlan
)
from finance.services.project_cost_engine import ProjectCostEngine
from finance.services.scheme_matching_engine import SchemeMatchingEngine
from finance.services.subsidy_engine import SubsidyEngine
from finance.services.funding_waterfall_engine import FundingWaterfallEngine
from finance.services.forecast_engine import ForecastEngine
from finance.services.profit_cash_flow_engine import ProfitAndCashFlowEngine
from finance.services.appraisal_engine import AppraisalEngine
from finance.services.unified_engine import UnifiedFinancialFeasibilityEngine
from finance.services.dpr_engine import DPREngine

class FeasibilityEngineUnitTests(TestCase):
    def setUp(self):
        # 1. Create Business Activity & Template
        self.activity = BusinessActivity.objects.create(
            code="test_dairy",
            name="Dairy Test Farm",
            sector=BusinessSector.AGRI_ALLIED,
            unit_of_measurement="Litre of Milk",
            is_active=True
        )
        self.template = ActivityDriverTemplate.objects.create(
            activity=self.activity,
            base_capacity_monthly=Decimal('5000.00'),
            default_selling_price=Decimal('60.00'),
            default_variable_cost_per_unit=Decimal('35.00'),
            default_operating_days=30,
            default_fixed_costs=[{"name": "Labor", "monthly_amount": 15000}],
            seasonal_factors=[1.0] * 12
        )

        # 2. Create Official Scheme & Rule
        self.scheme = SchemeMaster.objects.create(
            code="TEST_PMEGP",
            name="Prime Minister's Employment Generation Programme",
            ministry="MSME",
            official_portal_url="https://kviconline.gov.in/pmegp/",
            is_active=True
        )
        self.rule = SchemeRule.objects.create(
            scheme=self.scheme,
            rule_version="2026.01",
            effective_from=date(2024, 4, 1),
            verification_status=VerificationStatus.OFFICIAL,
            last_verified_date=date(2026, 1, 1),
            min_project_cost=Decimal('50000.00'),
            max_project_cost=Decimal('5000000.00'),
            max_loan_amount=Decimal('4500000.00'),
            allowed_sectors=["AGRI_ALLIED", "MANUFACTURING"],
            allowed_locations=["rural", "urban"],
            allowed_stages=["new"],
            promoter_contribution_matrix={"general": 10.0, "special": 5.0},
            subsidy_rate_matrix={
                "general_urban": 15.0,
                "general_rural": 25.0,
                "special_urban": 25.0,
                "special_rural": 35.0
            },
            max_subsidy_cap=Decimal('1750000.00'),
            subsidy_timing=SubsidyTiming.BACK_ENDED,
            interest_rate_annual=Decimal('8.50'),
            tenure_months=84,
            moratorium_months=6
        )

    def test_project_cost_engine_aggregation(self):
        cost_items = {
            "building_civil": [
                {"name": "Shed", "quantity": 1, "unit_cost": 200000}
            ],
            "plant_machinery": [
                {"name": "Milker", "quantity": 2, "unit_cost": 50000}
            ],
            "working_capital": [
                {"name": "Feed", "quantity": 1, "unit_cost": 50000}
            ]
        }
        res = ProjectCostEngine.calculate_totals(cost_items)
        self.assertEqual(res['total_project_cost'], 350000.0)
        self.assertEqual(len(res['all_items']), 3)

    def test_scheme_matching_engine_special_rural(self):
        promoter = {"social_category": "obc", "gender": "female", "age": 28}
        loc = {"rural_urban": "rural", "state": "Gujarat"}
        matches = SchemeMatchingEngine.match_schemes(
            project_cost=Decimal('1000000.00'),
            business_activity=self.activity,
            promoter_profile=promoter,
            location_data=loc
        )
        self.assertGreater(len(matches), 0)
        top = matches[0]
        self.assertEqual(top['eligibility_status'], 'Eligible')
        # Special category in rural area qualifies for 35% subsidy
        self.assertEqual(top['applicable_subsidy_pct'], 35.0)
        self.assertEqual(top['required_margin_pct'], 5.0)

    def test_subsidy_engine_calculation_and_cap(self):
        promoter = {"social_category": "sc", "gender": "male"}
        loc = {"rural_urban": "rural"}
        res = SubsidyEngine.calculate_subsidy(
            eligible_project_cost=Decimal('1000000.00'),
            scheme_rule=self.rule,
            promoter_profile=promoter,
            location_data=loc
        )
        self.assertEqual(res['applicable_subsidy_pct'], 35.0)
        self.assertEqual(res['raw_subsidy_amount'], 350000.0)
        self.assertEqual(res['final_subsidy_amount'], 350000.0)
        self.assertFalse(res['is_capped'])
        self.assertIn("Step 1", res['calculation_steps'][0])

    def test_funding_waterfall_back_ended(self):
        subsidy_info = {
            "final_subsidy_amount": 350000.0,
            "applicable_subsidy_pct": 35.0,
            "subsidy_timing": SubsidyTiming.BACK_ENDED,
            "subsidy_timing_display": "Back-Ended Capital Subsidy (TDR)"
        }
        res = FundingWaterfallEngine.calculate_waterfall(
            total_project_cost=Decimal('1000000.00'),
            eligible_project_cost=Decimal('1000000.00'),
            own_contribution_input=Decimal('100000.00'),
            additional_investment_input=Decimal('0.00'),
            subsidy_data=subsidy_info,
            scheme_rule=self.rule
        )
        # Gross Loan sanctioned = 10L - 1L = 9L
        self.assertEqual(res['gross_bank_loan_required'], 900000.0)
        # Net debt after subsidy = 9L - 3.5L = 5.5L
        self.assertEqual(res['net_debt_exposure'], 550000.0)
        self.assertTrue(res['has_adequate_margin'])

    def test_break_even_and_dscr_calculation(self):
        be = AppraisalEngine.calculate_break_even(
            annual_revenue=Decimal('2400000.00'),
            annual_variable_cost=Decimal('1200000.00'),
            annual_fixed_cost=Decimal('360000.00'),
            base_unit_price=Decimal('60.00')
        )
        # Contribution Margin = 12L / 24L = 50%
        # Break even rev = 3.6L / 0.5 = 7.2L
        self.assertEqual(be['break_even_revenue'], 720000.0)
        self.assertEqual(be['contribution_margin_ratio'], 50.0)

        dscr = AppraisalEngine.calculate_dscr(
            annual_pat=Decimal('500000.00'),
            annual_depreciation=Decimal('80000.00'),
            annual_interest=Decimal('60000.00'),
            annual_principal=Decimal('100000.00')
        )
        # Cash available = 500k + 80k + 60k = 640k
        # Obligation = 100k + 60k = 160k
        # DSCR = 640k / 160k = 4.0
        self.assertEqual(dscr['dscr_value'], 4.0)
        self.assertEqual(dscr['status'], 'Strong')

    def test_bank_dpr_contains_28_sections(self):
        pipeline_res = UnifiedFinancialFeasibilityEngine.run_full_feasibility_pipeline(
            activity_id_or_code="test_dairy",
            promoter_profile={"name": "Ramesh Patel", "social_category": "obc", "gender": "male", "age": 30},
            location_data={"rural_urban": "rural", "state": "Gujarat", "district": "Anand"},
            financial_inputs={"own_contribution": 100000, "working_capital": 50000},
            project_cost_items={"plant_machinery": [{"name": "Equipment", "quantity": 1, "unit_cost": 800000}]},
            selected_scheme_rule_id=self.rule.id
        )
        dpr = pipeline_res['bank_dpr']
        self.assertIn('sections', dpr)
        sections = dpr['sections']
        self.assertEqual(len(sections), 28)
        self.assertIn('1_applicant_details', sections)
        self.assertIn('28_disclaimer', sections)
        self.assertEqual(pipeline_res['feasibility_score']['status'] in ['Highly Feasible', 'Feasible', 'Moderately Feasible'], True)


class FeasibilityAPITests(APITestCase):
    def setUp(self):
        self.activity = BusinessActivity.objects.create(
            code="poultry_test",
            name="Poultry Test",
            sector=BusinessSector.AGRI_ALLIED,
            is_active=True
        )
        ActivityDriverTemplate.objects.create(
            activity=self.activity,
            base_capacity_monthly=Decimal('1000.00'),
            default_selling_price=Decimal('100.00'),
            default_variable_cost_per_unit=Decimal('60.00'),
            default_operating_days=26,
            default_fixed_costs=[{"name": "Power", "monthly_amount": 5000}],
            seasonal_factors=[1.0] * 12
        )

    def test_activities_list_api(self):
        url = reverse('activities')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(res.data), 0)

    def test_schemes_match_api(self):
        url = reverse('schemes-match')
        payload = {
            "project_cost": "500000.00",
            "activity_id_or_code": "poultry_test",
            "promoter_profile": {"social_category": "general", "gender": "female"},
            "location_data": {"rural_urban": "rural"}
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('matched_schemes', res.data)

    def test_calculate_unified_pipeline_api(self):
        url = reverse('calculate')
        payload = {
            "activity_id_or_code": "poultry_test",
            "promoter_profile": {"name": "Sunita Devi", "social_category": "special", "gender": "female", "age": 32},
            "location_data": {"rural_urban": "rural", "state": "Rajasthan"},
            "financial_inputs": {"own_contribution": 50000, "additional_investment": 0},
            "project_cost_items": {
                "plant_machinery": [{"name": "Cages", "quantity": 1, "unit_cost": 400000}],
                "working_capital": [{"name": "Feed", "quantity": 1, "unit_cost": 100000}]
            }
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('funding_waterfall', res.data)
        self.assertIn('feasibility_score', res.data)
        self.assertIn('break_even', res.data)
        self.assertIn('bank_dpr', res.data)

    def test_dpr_generate_api(self):
        url = reverse('dpr-generate')
        payload = {
            "activity_id_or_code": "poultry_test",
            "promoter_profile": {"name": "Kavita", "gender": "female"},
            "location_data": {"rural_urban": "rural"},
            "financial_inputs": {"own_contribution": 100000},
            "project_cost_items": {
                "plant_machinery": [{"name": "Setup", "quantity": 1, "unit_cost": 500000}]
            }
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('sections', res.data)
        self.assertEqual(len(res.data['sections']), 28)

    def test_advisor_explain_api(self):
        url = reverse('advisor-explain')
        payload = {
            "calculation_results": {
                "feasibility_score": {"score": 82, "status": "Feasible"},
                "dscr": {"dscr_value": 1.45},
                "risk_analysis": {"overall_risk_level": "Low Risk"},
                "subsidy": {"final_subsidy_amount": 250000.0}
            }
        }
        res = self.client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('advisory_summary', res.data)
        self.assertIn('actionable_recommendations', res.data)
