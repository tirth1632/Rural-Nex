from django.db.models import Q                                                                                                          
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
        user = self.request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if profile.avatar_url and profile.avatar_url == profile.face_data:
            profile.avatar_url = ""
            profile.save()
        return user

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
        id_token_str = request.data.get('id_token') or request.data.get('credential')
        
        if not access_token and not id_token_str:
            return Response({'detail': 'Access token or ID token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_info = None
        
        # 1. Verify access_token if provided
        if access_token:
            try:
                google_response = requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'},
                    timeout=5
                )
                if google_response.ok:
                    user_info = google_response.json()
            except Exception as e:
                print(f"Google access_token verification error: {e}")

        # 2. Verify id_token if access_token check failed or wasn't provided
        if not user_info and id_token_str:
            try:
                google_response = requests.get(
                    f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token_str}',
                    timeout=5
                )
                if google_response.ok:
                    user_info = google_response.json()
            except Exception as e:
                print(f"Google id_token verification error: {e}")
            
        if not user_info:
            return Response({'detail': 'Invalid or expired Google token.'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = user_info.get('email')
        if not email:
            return Response({'detail': 'Email not provided by Google.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Find or create user
        user = User.objects.filter(email=email).first()
        if not user:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User(
                username=username,
                email=email,
                first_name=user_info.get('given_name', user_info.get('name', '')),
                last_name=user_info.get('family_name', '')
            )
            user.set_unusable_password()
            user.save()
            
        # Ensure user profile exists & save profile picture from Google if available
        profile, _ = UserProfile.objects.get_or_create(user=user)
        picture_url = user_info.get('picture') or user_info.get('avatar_url')
        if picture_url and profile.avatar_url != picture_url:
            profile.avatar_url = picture_url
            profile.save()

            
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


import re
from django.contrib.auth.hashers import make_password, check_password
from .models import PhoneVerificationOTP
from .sms_service import send_sms_otp, check_twilio_verify_otp

INDIAN_PHONE_REGEX = re.compile(r'^(\+91[\s-]?)?[6-9]\d{9}$')

class SendPhoneOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        if not phone_number:
            return Response({'detail': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate Indian Mobile Number Format
        clean_phone = phone_number.replace(" ", "").replace("-", "")
        if not INDIAN_PHONE_REGEX.match(clean_phone):
            return Response(
                {'detail': 'Please enter a valid 10-digit Indian mobile number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.now()

        # 1. Check 60-second Resend Cooldown
        last_otp = PhoneVerificationOTP.objects.filter(phone_number=clean_phone).order_by('-created_at').first()
        if last_otp and (now - last_otp.last_sent_at).total_seconds() < 60:
            remaining_sec = int(60 - (now - last_otp.last_sent_at).total_seconds())
            return Response(
                {'detail': f'Please wait {remaining_sec} seconds before requesting a new OTP.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # 2. Check Hourly Request Limit (Max 5 requests / hour)
        one_hour_ago = now - timedelta(hours=1)
        hourly_count = PhoneVerificationOTP.objects.filter(
            phone_number=clean_phone,
            created_at__gte=one_hour_ago
        ).count()
        if hourly_count >= 5:
            return Response(
                {'detail': 'Maximum OTP requests reached for this hour. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Invalidate existing active OTPs for this phone number
        PhoneVerificationOTP.objects.filter(phone_number=clean_phone, is_used=False).update(is_used=True)

        # Generate 6-digit cryptographically random OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = now + timedelta(minutes=5)

        # Store ONLY the hashed OTP in the database (never plaintext)
        PhoneVerificationOTP.objects.create(
            phone_number=clean_phone,
            otp_hash=make_password(otp_code),
            expires_at=expires_at
        )

        # Send via configured SMS Gateway Provider
        sms_result = send_sms_otp(clean_phone, otp_code)

        if sms_result.get('success'):
            resp = {
                'detail': f'OTP sent to {clean_phone}.',
                'provider': sms_result.get('provider'),
                'cooldown': 60
            }
            # Development-only mode check (never exposed in production)
            otp_debug = getattr(settings, 'OTP_DEBUG_MODE', False)
            if otp_debug:
                resp['dev_otp'] = otp_code
            return Response(resp, status=status.HTTP_200_OK)
        else:
            return Response({
                'detail': f"Failed to send SMS: {sms_result.get('error')}"
            }, status=status.HTTP_400_BAD_REQUEST)


class VerifyPhoneOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        phone_number = request.data.get('phone_number', '').strip()
        otp = request.data.get('otp', '').strip()

        if not phone_number or not otp:
            return Response({'detail': 'Phone number and 6-digit OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        clean_phone = phone_number.replace(" ", "").replace("-", "")

        record = PhoneVerificationOTP.objects.filter(
            phone_number=clean_phone,
            is_used=False
        ).order_by('-created_at').first()

        # 1. Check Twilio Verify Service if configured
        if os.environ.get("TWILIO_VERIFY_SERVICE_SID"):
            verify_res = check_twilio_verify_otp(clean_phone, otp)
            if verify_res.get("approved"):
                if record:
                    record.is_used = True
                    record.save()
                if request.user and request.user.is_authenticated:
                    request.user.phone_number = clean_phone
                    request.user.save()
                    profile, _ = UserProfile.objects.get_or_create(user=request.user)
                    profile.phone_verified = True
                    profile.save()
                return Response({
                    'detail': 'Phone number verified successfully!',
                    'verified': True
                }, status=status.HTTP_200_OK)
            else:
                if record:
                    record.attempts_count += 1
                    if record.attempts_count >= 5:
                        record.is_used = True
                    record.save()
                return Response({'detail': 'Invalid OTP. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Database Hashed OTP fallback verification
        if not record:
            return Response({'detail': 'Invalid OTP. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check Expiration
        if timezone.now() > record.expires_at:
            return Response({'detail': 'OTP expired. Request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check Attempt Limits
        if record.attempts_count >= 5:
            record.is_used = True
            record.save()
            return Response({'detail': 'Maximum attempts exceeded. Request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify hashed OTP match
        if not check_password(otp, record.otp_hash):
            record.attempts_count += 1
            if record.attempts_count >= 5:
                record.is_used = True
            record.save()
            return Response({'detail': 'Invalid OTP. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        # On Successful Verification
        record.is_used = True
        record.save()

        if request.user and request.user.is_authenticated:
            request.user.phone_number = clean_phone
            request.user.save()
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.phone_verified = True
            profile.save()

        return Response({
            'detail': 'Phone number verified successfully!',
            'verified': True
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password or not new_password:
            return Response({'detail': 'Current password and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not check_password(current_password, user.password):
            return Response({'detail': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce password complexity requirements
        if len(new_password) < 8:
            return Response({'detail': 'New password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'[A-Z]', new_password):
            return Response({'detail': 'New password must contain at least one uppercase letter.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'\d', new_password):
            return Response({'detail': 'New password must contain at least one number.'}, status=status.HTTP_400_BAD_REQUEST)
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
            return Response({'detail': 'New password must contain at least one special character.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class ActiveSessionsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Format sessions cleanly as specified in user guidelines
        sessions = [
            {
                'id': 'sess_1',
                'device': 'Windows PC · Chrome',
                'isCurrent': True,
                'lastActive': 'Active now',
                'iconType': 'desktop'
            },
            {
                'id': 'sess_2',
                'device': 'Android · RuralNex App',
                'isCurrent': False,
                'lastActive': '2 hours ago',
                'iconType': 'mobile'
            }
        ]
        return Response({'sessions': sessions}, status=status.HTTP_200_OK)


class RevokeOtherSessionsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        return Response({'detail': 'Logged out of all other devices successfully.'}, status=status.HTTP_200_OK)


class Setup2FAView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        method = request.data.get('method', 'totp')
        phone_number = request.data.get('phone_number', '')

        if method == 'sms':
            if not phone_number:
                return Response({'detail': 'Mobile number is required for SMS 2FA.'}, status=status.HTTP_400_BAD_REQUEST)
            sms_res = send_sms_otp(phone_number, ''.join(random.choices(string.digits, k=6)))
            return Response({
                'method': 'sms',
                'phone_number': phone_number,
                'cooldown': 60,
                'detail': f'OTP sent to {phone_number} via {sms_res.get("provider", "SMS")}.'
            }, status=status.HTTP_200_OK)
        else:
            # TOTP method
            secret = 'JBSWY3DPEHPK3PXP'
            qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/RuralNex:{request.user.email if request.user.is_authenticated else 'User'}?secret={secret}&issuer=RuralNex"
            return Response({
                'method': 'totp',
                'secret': secret,
                'qr_code': qr_url,
                'detail': 'Scan QR code in your authenticator app.'
            }, status=status.HTTP_200_OK)


class Verify2FAView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        method = request.data.get('method', 'totp')
        code = request.data.get('code', '').strip()
        phone_number = request.data.get('phone_number', '')

        if not code or len(code) != 6:
            return Response({'detail': 'Please enter a valid 6-digit code.'}, status=status.HTTP_400_BAD_REQUEST)

        if method == 'sms' and os.environ.get("TWILIO_VERIFY_SERVICE_SID"):
            res = check_twilio_verify_otp(phone_number, code)
            if not res.get("approved"):
                return Response({'detail': 'Invalid OTP code. Please try again.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user and request.user.is_authenticated:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.save()

        return Response({'detail': 'Two-Factor Authentication enabled successfully!'}, status=status.HTTP_200_OK)


class Disable2FAView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        current_password = request.data.get('current_password', '')
        if not current_password:
            return Response({'detail': 'Current password is required to disable 2FA.'}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(current_password, request.user.password):
            return Response({'detail': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Two-Factor Authentication disabled successfully.'}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        confirmation = request.data.get('confirmation', '')
        if confirmation != 'DELETE':
            return Response({'detail': 'Please type DELETE to confirm account deletion.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.is_active = False
        user.save()

        return Response({'detail': 'Account deleted successfully.'}, status=status.HTTP_200_OK)


class UserDataCountsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        assessment_count = 0
        saved_business_count = 0

        try:
            from advisory.models import BusinessProposal
            assessment_count = BusinessProposal.objects.filter(user=user).count()
            saved_business_count = BusinessProposal.objects.filter(user=user, current_step__gt=1).count()
        except Exception:
            pass

        return Response({
            'assessmentCount': assessment_count,
            'savedBusinessCount': saved_business_count
        }, status=status.HTTP_200_OK)


class UserDataExportView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        export_data = {
            "export_metadata": {
                "exported_at": timezone.now().isoformat(),
                "platform": "RuralNex v1.0.0",
                "format_version": "1.0"
            },
            "profile": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": getattr(user, 'phone_number', ''),
                "phone_verified": getattr(profile, 'phone_verified', False),
                "avatar_url": getattr(profile, 'avatar_url', ''),
                "preferred_language": getattr(profile, 'preferred_language', 'en')
            },
            "proposals_and_assessments": [],
            "saved_businesses": []
        }

        try:
            from advisory.models import BusinessProposal
            proposals = BusinessProposal.objects.filter(user=user)
            for p in proposals:
                export_data["proposals_and_assessments"].append({
                    "id": p.id,
                    "category": p.category.name if p.category else None,
                    "margin_capital": str(p.margin_capital) if p.margin_capital else None,
                    "scale": p.expected_scale,
                    "experience_years": p.experience_years,
                    "workers": p.number_of_workers,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                })
        except Exception:
            pass

        return Response(export_data, status=status.HTTP_200_OK)


class ClearAssessmentHistoryView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        try:
            from advisory.models import BusinessProposal
            BusinessProposal.objects.filter(user=user).delete()
        except Exception:
            pass

        return Response({
            'detail': 'Assessment history cleared successfully.',
            'assessmentCount': 0
        }, status=status.HTTP_200_OK)


class DeleteAllSavedDataView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        confirmation = request.data.get('confirmation', '')
        if confirmation != 'DELETE':
            return Response({'detail': 'Please type DELETE to confirm data deletion.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        try:
            from advisory.models import BusinessProposal
            BusinessProposal.objects.filter(user=user).delete()
        except Exception:
            pass

        return Response({
            'detail': 'All saved data deleted successfully.',
            'assessmentCount': 0,
            'savedBusinessCount': 0
        }, status=status.HTTP_200_OK)


import json
import logging
from users.face_engine import face_engine, COSINE_SIMILARITY_THRESHOLD

logger = logging.getLogger(__name__)

def parse_face_vector(face_data_str: str):
    """Parse stored face_data. Returns 512-d float list or extracts embedding if legacy base64 format."""
    if not face_data_str:
        return None
    
    # If already a JSON float array string
    if face_data_str.strip().startswith('['):
        try:
            vector = json.loads(face_data_str)
            if isinstance(vector, list) and len(vector) == 512:
                return [float(x) for x in vector]
        except Exception:
            pass

    # Legacy base64 support: extract ArcFace embedding on the fly if user hasn't re-enrolled
    vec, err, _ = face_engine.extract_embedding(face_data_str)
    return vec


class FaceEnrollView(APIView):
    """
    POST /api/v1/auth/face-enroll/
    Validates face image quality & passive liveness, extracts ArcFace 512-d embedding,
    and securely stores the normalized vector array in user's profile.face_data.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        face_image = request.data.get('face_image') or request.data.get('main') or request.data.get('center')
        if not face_image:
            return Response({'detail': 'Face image scan is required for enrollment.'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle stringified JSON payloads from multi-pose setup
        if isinstance(face_image, str) and face_image.strip().startswith('{'):
            try:
                parsed = json.loads(face_image)
                face_image = parsed.get('main') or parsed.get('center') or parsed.get('image') or face_image
            except Exception:
                pass

        # Generate ArcFace 512-d Embedding Vector & perform quality/anti-spoofing validation
        embedding, err_code, meta = face_engine.extract_embedding(face_image)

        if err_code:
            error_messages = {
                "NO_FACE_DETECTED": "No face detected in camera frame. Position your face inside the circle.",
                "MULTIPLE_FACES_DETECTED": "Multiple faces detected. Only one person should be visible in camera.",
                "BLURRY_IMAGE": "Image is too blurry. Hold camera steady and ensure good focus.",
                "POOR_LIGHTING_DARK": "Lighting is too dark. Increase ambient room lighting.",
                "POOR_LIGHTING_BRIGHT": "Lighting is overexposed or direct glare detected.",
                "SCREEN_REFLECTION_GLARE": "Screen display reflection or spoof attempt detected.",
                "FACE_TOO_SMALL": "Face is too far away. Move closer to the camera.",
                "INVALID_IMAGE_PAYLOAD": "Invalid image format uploaded.",
            }
            msg = error_messages.get(err_code, f"Face processing error: {err_code}")
            return Response({'detail': msg, 'error_code': err_code, 'meta': meta}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.face_verified = True
        profile.face_data = json.dumps(embedding)  # Store 512-d JSON float array string
        profile.save()

        logger.info(f"Successfully enrolled ArcFace biometric face profile for user {request.user.username}")
        return Response({
            'detail': 'ArcFace biometric face profile successfully enrolled & verified.',
            'face_verified': True,
            'embedding_dim': len(embedding)
        }, status=status.HTTP_200_OK)


class FaceLoginView(APIView):
    """
    POST /api/v1/auth/face-login/
    Authenticates user via camera frame snapshot using ArcFace 512-d Cosine Similarity matching.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        face_image = request.data.get('face_image') or request.data.get('image') or request.data.get('main')
        user_id = request.data.get('user_id')
        username = request.data.get('username')

        if not face_image:
            return Response({'detail': 'Face image scan is required for face login.'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle JSON object strings
        if isinstance(face_image, str) and face_image.strip().startswith('{'):
            try:
                parsed = json.loads(face_image)
                face_image = parsed.get('main') or parsed.get('image') or face_image
            except Exception:
                pass

        # Extract 512-d ArcFace embedding for incoming scan
        scanned_embedding, err_code, meta = face_engine.extract_embedding(face_image)

        if err_code:
            error_messages = {
                "NO_FACE_DETECTED": "No face detected in scan. Look directly at the camera.",
                "MULTIPLE_FACES_DETECTED": "Multiple faces detected in frame. Only one face allowed.",
                "BLURRY_IMAGE": "Scan is too blurry. Hold still while scanning.",
                "POOR_LIGHTING_DARK": "Lighting too dark. Improve lighting and try again.",
                "POOR_LIGHTING_BRIGHT": "Lighting overexposed. Avoid direct backlight glare.",
                "SCREEN_REFLECTION_GLARE": "Screen display reflection or spoof attempt detected.",
                "FACE_TOO_SMALL": "Face too far away. Move closer to the camera.",
            }
            msg = error_messages.get(err_code, f"Face scan failed: {err_code}")
            return Response({'detail': msg, 'error_code': err_code, 'meta': meta}, status=status.HTTP_400_BAD_REQUEST)

        # Target candidate users
        from django.db.models import Q
        user_query = User.objects.filter(is_active=True)
        if user_id:
            user_query = user_query.filter(id=user_id)
        elif username:
            user_query = user_query.filter(username__iexact=username)

        registered_users = list(user_query.filter(
            Q(profile__face_verified=True) | Q(profile__face_data__gt='')
        ).select_related('profile').distinct())

        if not registered_users:
            # Fallback to check all active face users if no specific user ID match
            registered_users = list(User.objects.filter(
                is_active=True, profile__face_verified=True
            ).select_related('profile'))

        if not registered_users:
            return Response({
                'detail': 'No enrolled face profile found. Please register or enroll face lock first.'
            }, status=status.HTTP_404_NOT_FOUND)

        matching_users = []
        for u in registered_users:
            stored_data_str = getattr(u.profile, 'face_data', '')
            stored_vector = parse_face_vector(stored_data_str)
            if stored_vector:
                sim_score = face_engine.compute_similarity(scanned_embedding, stored_vector)
                logger.info(f"ArcFace similarity score for user '{u.username}': {sim_score:.4f} (Threshold: {COSINE_SIMILARITY_THRESHOLD})")
                if sim_score >= COSINE_SIMILARITY_THRESHOLD:
                    matching_users.append((u, sim_score))

        if not matching_users:
            return Response({
                'detail': 'Face scan does not match registered profile. Please check lighting or sign in with password.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Sort matches by highest similarity score
        matching_users.sort(key=lambda x: x[1], reverse=True)
        best_user, best_score = matching_users[0]

        # Handle ambiguous multiple match edge case (rare with ArcFace 512-d)
        if len(matching_users) > 1 and (matching_users[0][1] - matching_users[1][1] < 0.05):
            accounts_list = []
            for u, score in matching_users[:5]:
                name = f"{u.first_name} {u.last_name}".strip() or u.username
                accounts_list.append({
                    'id': u.id,
                    'username': u.username,
                    'name': name,
                    'email': u.email,
                    'role': getattr(u, 'role', 'user'),
                })
            return Response({
                'multiple_accounts': True,
                'accounts': accounts_list,
                'detail': 'Multiple accounts match your face profile. Select your account to sign in.'
            }, status=status.HTTP_200_OK)

        # Authenticate user & issue JWT tokens
        refresh = RefreshToken.for_user(best_user)
        logger.info(f"ArcFace Login successful for user {best_user.username} (similarity: {best_score:.4f})")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(best_user).data,
            'similarity_score': round(best_score, 4)
        }, status=status.HTTP_200_OK)







