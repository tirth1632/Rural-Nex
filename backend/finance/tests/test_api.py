from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from decimal import Decimal
from finance.services.constants import Schemes

class FinanceAPITests(APITestCase):
    def test_schemes_api(self):
        url = reverse('schemes')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(Schemes.MICRO, response.data)
        self.assertIn(Schemes.TERM, response.data)

    def test_calculate_api(self):
        url = reverse('calculate')
        response = self.client.post(url, {'available_margin': '10000.00'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['scheme'], Schemes.MICRO)
        self.assertEqual(response.data['eligible_loan'], '90000.00')

    def test_calculate_api_validation(self):
        url = reverse('calculate')
        response = self.client.post(url, {'available_margin': '-500'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_emi_api(self):
        url = reverse('emi')
        response = self.client.post(url, {
            'principal': '100000.00',
            'interest_rate': '10.0',
            'tenure_months': 12
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['emi'], '8791.59')

    def test_repayment_api(self):
        url = reverse('repayment')
        response = self.client.post(url, {
            'principal': '100000.00',
            'interest_rate': '10.0',
            'tenure_months': 12,
            'moratorium_months': 3
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['monthly_schedule']), 12)
        self.assertEqual(response.data['summary']['total_principal'], '100000.00')

    def test_working_capital_api(self):
        url = reverse('working-capital')
        response = self.client.post(url, {
            'projected_annual_turnover': '1000000.00'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_working_capital_required'], '200000.00')
        self.assertEqual(response.data['eligible_bank_finance'], '150000.00')
        self.assertEqual(response.data['promoter_margin'], '50000.00')
