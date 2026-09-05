from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User
from advisory.models import BusinessProposal
from django.contrib.gis.geos import Point
import uuid

class SecurityTests(TestCase):
    def setUp(self):
        self.client1 = APIClient()
        self.client2 = APIClient()
        self.unauth_client = APIClient()
        
        self.user1 = User.objects.create_user(
            phone_number='+919999999991',
            password='TestPassword123!',
            uid=uuid.uuid4()
        )
        self.user2 = User.objects.create_user(
            phone_number='+919999999992',
            password='TestPassword123!',
            uid=uuid.uuid4()
        )
        
        self.client1.force_authenticate(user=self.user1)
        self.client2.force_authenticate(user=self.user2)
        
        # Create a proposal belonging to user 1
        self.proposal1 = BusinessProposal.objects.create(
            user=self.user1,
            margin_capital=50000,
            location=Point(78.0, 21.0),
            lat=21.0,
            lng=78.0
        )

    def test_unauthenticated_access_denied(self):
        url = reverse('businessproposal-list')
        response = self.unauth_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_object_level_isolation_proposals(self):
        # User 1 should see their proposal
        url = reverse('businessproposal-detail', kwargs={'pk': self.proposal1.pk})
        response1 = self.client1.get(url)
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        
        # User 2 should NOT be able to access User 1's proposal
        response2 = self.client2.get(url)
        self.assertEqual(response2.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_unauthenticated_simulation_denied(self):
        url = reverse('simulate')
        response = self.unauth_client.post(url, {
            "own_capital": 50000,
            "project_cost": 500000
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_excessive_numeric_bounds_validation(self):
        url = reverse('simulate')
        # Attempt to pass an extremely large number
        response = self.client1.post(url, {
            "own_capital": 10000000000, # 1000 Cr, exceeds 100 Cr limit
            "project_cost": 500000
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Values exceed maximum allowed limits", str(response.data))
