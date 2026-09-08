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


import numpy as np
import cv2
from users.face_engine import face_engine, COSINE_SIMILARITY_THRESHOLD

class ArcFaceEngineTestCase(APITestCase):
    def test_l2_norm_similarity(self):
        """Test Cosine Similarity calculation between identical and orthogonal vectors."""
        vec_a = np.random.randn(512).astype(np.float32)
        vec_a /= np.linalg.norm(vec_a)

        # Self-similarity must be exactly ~1.0
        sim_self = face_engine.compute_similarity(vec_a.tolist(), vec_a.tolist())
        self.assertAlmostEqual(sim_self, 1.0, places=4)

        # Orthogonal/different vector similarity should be low
        vec_b = np.random.randn(512).astype(np.float32)
        vec_b /= np.linalg.norm(vec_b)
        sim_diff = face_engine.compute_similarity(vec_a.tolist(), vec_b.tolist())
        self.assertLess(sim_diff, COSINE_SIMILARITY_THRESHOLD)

    def test_quality_validation(self):
        """Test passive anti-spoofing quality filters (blurry, dark, overexposed)."""
        # 1. Blurry uniform image (zero Laplacian variance)
        blur_img = np.zeros((480, 640, 3), dtype=np.uint8) + 120
        ok, err = face_engine.validate_quality_and_anti_spoofing(blur_img)
        self.assertFalse(ok)
        self.assertEqual(err, "BLURRY_IMAGE")

        # 2. Dark image with texture (low mean)
        dark_img = np.random.randint(0, 10, size=(480, 640, 3), dtype=np.uint8)
        ok, err = face_engine.validate_quality_and_anti_spoofing(dark_img)
        self.assertFalse(ok)
        self.assertEqual(err, "POOR_LIGHTING_DARK")

        # 3. Overexposed image with texture (high mean)
        bright_img = np.random.randint(245, 255, size=(480, 640, 3), dtype=np.uint8)
        ok, err = face_engine.validate_quality_and_anti_spoofing(bright_img)
        self.assertFalse(ok)
        self.assertIn(err, ["POOR_LIGHTING_BRIGHT", "SCREEN_REFLECTION_GLARE"])


