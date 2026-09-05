from django.test import TestCase
from decimal import Decimal
from finance.services.amortization import EMICalculator, AmortizationService
from finance.exceptions import InvalidParameterError

class AmortizationTests(TestCase):
    def test_emi_calculation(self):
        # 1L, 10%, 12 months -> EMI should be 8791.59
        emi = EMICalculator.calculate_emi(Decimal('100000.00'), Decimal('10.00'), 12)
        self.assertEqual(emi, Decimal('8791.59'))

    def test_zero_interest_emi(self):
        emi = EMICalculator.calculate_emi(Decimal('120000.00'), Decimal('0.00'), 12)
        self.assertEqual(emi, Decimal('10000.00'))

    def test_amortization_schedule_no_moratorium(self):
        result = AmortizationService.generate_schedule(Decimal('100000.00'), Decimal('10.00'), 12, 0)
        
        schedule = result['monthly_schedule']
        self.assertEqual(len(schedule), 12)
        
        # Last month's outstanding principal should be 0.00
        self.assertEqual(schedule[-1]['outstanding_principal'], Decimal('0.00'))
        
        # Total principal paid should equal initial principal
        total_principal = sum([m['principal_payment'] for m in schedule])
        self.assertEqual(total_principal, Decimal('100000.00'))

    def test_amortization_schedule_with_moratorium(self):
        result = AmortizationService.generate_schedule(Decimal('100000.00'), Decimal('10.00'), 12, 3)
        
        schedule = result['monthly_schedule']
        self.assertEqual(len(schedule), 12)
        
        # During moratorium (first 3 months), principal payment should be 0
        for i in range(3):
            self.assertEqual(schedule[i]['is_moratorium'], True)
            self.assertEqual(schedule[i]['principal_payment'], Decimal('0.00'))
            self.assertGreater(schedule[i]['interest_payment'], Decimal('0.00'))
            self.assertEqual(schedule[i]['outstanding_principal'], Decimal('100000.00'))
            
        # Month 4 should have principal payment
        self.assertEqual(schedule[3]['is_moratorium'], False)
        self.assertGreater(schedule[3]['principal_payment'], Decimal('0.00'))

        # Last month outstanding should be 0
        self.assertEqual(schedule[-1]['outstanding_principal'], Decimal('0.00'))
        
    def test_invalid_parameters(self):
        with self.assertRaises(InvalidParameterError):
            AmortizationService.generate_schedule(Decimal('-100.00'), Decimal('10.0'), 12, 0)
            
        with self.assertRaises(InvalidParameterError):
            # Moratorium >= tenure
            AmortizationService.generate_schedule(Decimal('100000.00'), Decimal('10.0'), 12, 12)
