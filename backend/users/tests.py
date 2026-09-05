from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.refresh_url = reverse('token_refresh')
        self.me_url = reverse('current_user')
        self.profile_url = reverse('update_profile')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_successful_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_duplicate_username(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_invalid_login(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'WrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_obtain_and_refresh(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'StrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        refresh_token = response.data['refresh']
        refresh_response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_unauthorized_api_access(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_profile_access(self):
        self.client.post(self.register_url, self.user_data)
        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'StrongPassword123!'
        })
        token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

        # GET /me/
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], 'testuser')

        # PATCH /profile/
        profile_response = self.client.patch(self.profile_url, {'preferred_language': 'hi'})
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['preferred_language'], 'hi')
