from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, UserProfileSerializer
from .models import UserProfile

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        # Ensure profile exists
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


import random
import string
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import PasswordResetOTP
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

class ForgotPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if not user:
            # Return an explicit error during development so you know if the email exists
            return Response({'detail': 'No account found with this email address.'}, status=status.HTTP_404_NOT_FOUND)

        # Invalidate old OTPs
        PasswordResetOTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Generate new OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        PasswordResetOTP.objects.create(
            user=user,
            otp=otp_code,
            expires_at=expires_at
        )

        # Send Email
        send_mail(
            subject='RuralNex - Password Reset OTP',
            message=f'Hello {user.first_name or user.username},\n\nYour OTP for password reset is: {otp_code}\n\nIt is valid for 10 minutes.\n\nRuralNex Team',
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@ruralnex.com'),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({'detail': 'If an account exists, an OTP has been sent.'}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({'detail': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp, is_used=False).order_by('-created_at').first()
        
        if not otp_record or not otp_record.is_valid():
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Mark as used
        otp_record.is_used = True
        otp_record.save()

        # Generate a short-lived token to use for the actual password reset step
        refresh = RefreshToken.for_user(user)
        # We can just return the access token to be used as a Bearer token for the ResetPasswordView
        return Response({
            'detail': 'OTP verified successfully.',
            'reset_token': str(refresh.access_token)
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    # Require the reset_token provided by VerifyOTPView
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'detail': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = request.user
        user.set_password(new_password)
        user.save()
        
        return Response({'detail': 'Password reset successful.'}, status=status.HTTP_200_OK)


import requests

class GoogleLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'detail': 'Access token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the access token with Google
        try:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if not google_response.ok:
                return Response({'detail': 'Invalid or expired Google token.'}, status=status.HTTP_400_BAD_REQUEST)
                
            user_info = google_response.json()
            email = user_info.get('email')
            
            if not email:
                return Response({'detail': 'Email not provided by Google.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Find or create user
            user = User.objects.filter(email=email).first()
            if not user:
                # Create a new user
                base_username = email.split('@')[0]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                    
                user = User(
                    username=username,
                    email=email,
                    first_name=user_info.get('given_name', ''),
                    last_name=user_info.get('family_name', '')
                )
                user.set_unusable_password()
                user.save()
                
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'detail': 'Error verifying Google token.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

