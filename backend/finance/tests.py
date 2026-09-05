from django.test import TestCase
from decimal import Decimal
from .models import SchemeDefinition, MoratoriumPolicy
from .services import FinancialAssessmentEngine, LoanCalculator, EMICalculator

class FinanceDomainTests(TestCase):
    def setUp(self):
        # Micro Finance Scheme
        self.micro_scheme = SchemeDefinition.objects.create(
            name="Micro Finance Scheme",
            min_project_cost=Decimal('0.00'),
            max_project_cost=Decimal('140000.00'),
            funding_percentage=Decimal('90.00'),
            max_loan_amount=Decimal('125000.00'),
            interest_rate_annual=Decimal('6.50'),
            tenure_months=36,
            moratorium_months=3,
            moratorium_policy=MoratoriumPolicy.CAPITALIZE_INTEREST
        )
        
        # Term Loan Scheme
        self.term_scheme = SchemeDefinition.objects.create(
            name="Term Loan Scheme",
            min_project_cost=Decimal('140000.01'),
            max_project_cost=Decimal('5000000.00'),
            funding_percentage=Decimal('90.00'),
            max_loan_amount=Decimal('4500000.00'),
            interest_rate_annual=Decimal('8.00'),
            tenure_months=84,
            moratorium_months=6,
            moratorium_policy=MoratoriumPolicy.CAPITALIZE_INTEREST
        )

    def test_loan_calculator_project_cost(self):
        # Test basic 90% funding math: margin = 10,000 -> project cost = 100,000
        cost = LoanCalculator.calculate_project_cost(Decimal('10000.00'), Decimal('90.00'))
        self.assertEqual(cost, Decimal('100000.00'))
        
    def test_micro_finance_standard_case(self):
        # Margin = 10,000. Project cost should be 100,000. Eligible for micro finance.
        result = FinancialAssessmentEngine.assess(Decimal('10000.00'))
        self.assertEqual(result.scheme.name, "Micro Finance Scheme")
        self.assertEqual(result.feasible_project_cost, Decimal('100000.00'))
        self.assertEqual(result.loan_amount, Decimal('90000.00'))
        self.assertFalse(result.cap_constrained)
        self.assertEqual(result.working_capital_estimate, Decimal('20000.00')) # 20%

    def test_micro_finance_boundary_cap(self):
        # Margin = 15,000. Unconstrained cost = 150,000 -> Exceeds Micro Finance max_project_cost (140,000).
        # This will jump to Term Loan Scheme
        result = FinancialAssessmentEngine.assess(Decimal('15000.00'))
        self.assertEqual(result.scheme.name, "Term Loan Scheme")
        self.assertEqual(result.feasible_project_cost, Decimal('150000.00'))
        self.assertEqual(result.loan_amount, Decimal('135000.00'))
        self.assertFalse(result.cap_constrained)

    def test_term_loan_boundary_cap(self):
        # Max loan is 45,00,000. 
        # If margin = 6,00,000. Unconstrained cost = 60,00,000 -> Exceeds Term Loan max_project_cost (50,00,000).
        # Should raise ValueError since no scheme fits.
        with self.assertRaises(ValueError):
            FinancialAssessmentEngine.assess(Decimal('600000.00'))
            
    def test_term_loan_max_loan_cap_constraint(self):
        # We need a case where the calculated loan exceeds the max loan, but the new constrained cost is still eligible.
        # Max loan is 45L. For a project cost of 50L (max allowed), 90% loan is exactly 45L.
        # Let's artificially lower the max loan for Term Loan to 40L to test the constraint.
        self.term_scheme.max_loan_amount = Decimal('4000000.00')
        self.term_scheme.save()
        
        # Margin = 5,00,000. Unconstrained cost = 50,00,000.
        # Unconstrained Loan = 45,00,000 (Exceeds max loan of 40L).
        # Constrained Loan = 40,00,000.
        # Constrained Project Cost = 40L + 5L = 45L. (Eligible, since 45L < 50L).
        result = FinancialAssessmentEngine.assess(Decimal('500000.00'))
        self.assertTrue(result.cap_constrained)
        self.assertEqual(result.scheme.name, "Term Loan Scheme")
        self.assertEqual(result.loan_amount, Decimal('4000000.00'))
        self.assertEqual(result.constrained_project_cost, Decimal('4500000.00'))
        self.assertEqual(result.feasible_project_cost, Decimal('4500000.00'))

    def test_emi_calculator(self):
        # Loan = 1,00,000. Rate = 12% (1% monthly). Tenure = 12 months. Moratorium = 0.
        schedule = EMICalculator.calculate_schedule(
            Decimal('100000.00'), 
            Decimal('12.00'), 
            12, 
            0, 
            MoratoriumPolicy.CAPITALIZE_INTEREST
        )
        self.assertEqual(len(schedule.installments), 12)
        # Check standard EMI math formula roughly
        self.assertAlmostEqual(schedule.total_amount_payable, Decimal('106618.52'), places=1)
        self.assertEqual(schedule.installments[-1].remaining_balance, Decimal('0.00'))

    def test_moratorium_capitalize(self):
        # Loan = 1,00,000. Rate = 12% (1% monthly). Tenure = 12 months. Moratorium = 3 months.
        # Policy = CAPITALIZE_INTEREST
        # Month 1, 2, 3: Principal grows.
        schedule = EMICalculator.calculate_schedule(
            Decimal('100000.00'), 
            Decimal('12.00'), 
            12, 
            3, 
            MoratoriumPolicy.CAPITALIZE_INTEREST
        )
        self.assertEqual(len(schedule.installments), 12)
        
        # Installment 1-3 should be 0 payment.
        self.assertEqual(schedule.installments[0].total_installment, Decimal('0.00'))
        self.assertEqual(schedule.installments[1].total_installment, Decimal('0.00'))
        self.assertEqual(schedule.installments[2].total_installment, Decimal('0.00'))
        
        # Remaining balance after 3 months of 1% interest = 100000 * 1.01^3 ~ 103030.10
        self.assertAlmostEqual(schedule.installments[2].remaining_balance, Decimal('103030.10'), places=2)

    def test_emi_zero_repayment_months(self):
        # Tenure = 3, Moratorium = 3. Repayment months = 0. Should raise ValueError.
        with self.assertRaises(ValueError):
            EMICalculator.calculate_schedule(
                Decimal('100000.00'), 
                Decimal('12.00'), 
                3, 
                3, 
                MoratoriumPolicy.CAPITALIZE_INTEREST
            )
