from django.test import TestCase
from decimal import Decimal
from finance.services.calculator import FinancialCalculationService
from finance.exceptions import NegativeCapitalError, ZeroCapitalError
from finance.services.constants import Schemes

class CalculatorTests(TestCase):
    def test_zero_capital(self):
        with self.assertRaises(ZeroCapitalError):
            FinancialCalculationService.calculate(Decimal('0.00'))
            
    def test_negative_capital(self):
        with self.assertRaises(NegativeCapitalError):
            FinancialCalculationService.calculate(Decimal('-1000.00'))

    def test_micro_scheme_determination(self):
        # 10k margin -> theoretical project cost 100k
        result = FinancialCalculationService.calculate(Decimal('10000.00'))
        self.assertEqual(result['scheme'], Schemes.MICRO)
        self.assertEqual(result['theoretical_project_cost'], Decimal('100000.00'))
        self.assertEqual(result['eligible_project_cost'], Decimal('100000.00'))
        self.assertEqual(result['theoretical_loan'], Decimal('90000.00'))
        self.assertEqual(result['eligible_loan'], Decimal('90000.00'))
        self.assertEqual(result['beneficiary_contribution'], Decimal('10000.00'))
        self.assertEqual(len(result['warnings']), 0)

    def test_term_scheme_determination(self):
        # 20k margin -> theoretical project cost 200k
        result = FinancialCalculationService.calculate(Decimal('20000.00'))
        self.assertEqual(result['scheme'], Schemes.TERM)
        self.assertEqual(result['eligible_project_cost'], Decimal('200000.00'))

    def test_micro_scheme_capped_loan(self):
        # 15k margin -> theoretical project cost 150k
        # Micro max is 140k. Wait! If project cost is 150k, it will fall into TERM scheme, not MICRO.
        result = FinancialCalculationService.calculate(Decimal('15000.00'))
        self.assertEqual(result['scheme'], Schemes.TERM)
        self.assertEqual(result['eligible_project_cost'], Decimal('150000.00'))
        
    def test_desired_project_cost_lower_than_theoretical(self):
        # Margin 50k -> Theoretical PC 500k. 
        # But desired is 100k (which falls in MICRO)
        result = FinancialCalculationService.calculate(Decimal('50000.00'), Decimal('100000.00'))
        self.assertEqual(result['scheme'], Schemes.MICRO)
        self.assertEqual(result['eligible_project_cost'], Decimal('100000.00'))
        self.assertEqual(result['eligible_loan'], Decimal('90000.00'))
        # They only need to contribute 10k of their 50k margin
        self.assertEqual(result['beneficiary_contribution'], Decimal('10000.00'))

    def test_term_scheme_capped_loan(self):
        # 60L margin -> Theoretical PC 6Cr. Term max is 50L.
        result = FinancialCalculationService.calculate(Decimal('6000000.00'))
        self.assertEqual(result['scheme'], Schemes.TERM)
        self.assertEqual(result['theoretical_project_cost'], Decimal('60000000.00'))
        self.assertEqual(result['eligible_project_cost'], Decimal('5000000.00'))
        self.assertEqual(result['eligible_loan'], Decimal('4500000.00'))
        # Beneficiary has to bring 50L - 45L = 5L
        self.assertEqual(result['beneficiary_contribution'], Decimal('500000.00'))
        self.assertGreater(len(result['warnings']), 0)
