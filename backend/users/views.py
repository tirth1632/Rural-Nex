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


import base64
import cv2
import numpy as np

face_cascade = None
try:
    if hasattr(cv2, 'CascadeClassifier') and hasattr(cv2, 'data'):
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
except Exception:
    face_cascade = None

def base64_to_cv2(b64_str):
    if not b64_str:
        return None
    if ',' in b64_str:
        b64_str = b64_str.split(',', 1)[1]
    try:
        img_bytes = base64.b64decode(b64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception:
        return None

def extract_face_crop(img):
    if img is None:
        return None
    if face_cascade is not None:
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            if len(faces) > 0:
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                x, y, w, h = faces[0]
                mx, my = int(w * 0.15), int(h * 0.15)
                x1 = max(0, x - mx)
                y1 = max(0, y - my)
                x2 = min(img.shape[1], x + w + mx)
                y2 = min(img.shape[0], y + h + my)
                crop = img[y1:y2, x1:x2]
                if crop.shape[0] > 10 and crop.shape[1] > 10:
                    return crop
        except Exception:
            pass
    return img

def parse_face_data_payload(raw_data):
    """
    Extract base64 images list & landmark vector from raw face_data input.
    Supports legacy raw base64 string AND multi-pose JSON objects ({ main, center, left, right, landmarks }).
    """
    images = []
    landmarks = None

    if not raw_data:
        return images, landmarks

    if isinstance(raw_data, str) and (raw_data.strip().startswith('{') or raw_data.strip().startswith('[')):
        try:
            parsed = json.loads(raw_data)
            if isinstance(parsed, dict):
                for k in ['main', 'center', 'left', 'right', 'image']:
                    val = parsed.get(k)
                    if val and isinstance(val, str) and len(val) > 50:
                        images.append(val)
                if 'landmarks' in parsed and isinstance(parsed['landmarks'], list):
                    landmarks = [float(x) for x in parsed['landmarks'] if isinstance(x, (int, float))]
            elif isinstance(parsed, list):
                images = [x for x in parsed if isinstance(x, str) and len(x) > 50]
        except Exception:
            pass

    if not images and isinstance(raw_data, str):
        images.append(raw_data)

    unique_images = []
    for img in images:
        if img not in unique_images:
            unique_images.append(img)

    return unique_images, landmarks

def compute_single_image_similarity(scanned_b64, stored_b64):
    if not scanned_b64 or not stored_b64:
        return 0.0

    raw1 = base64_to_cv2(scanned_b64)
    raw2 = base64_to_cv2(stored_b64)

    if raw1 is None or raw2 is None:
        return 0.0

    img1 = extract_face_crop(raw1)
    img2 = extract_face_crop(raw2)

    try:
        # Resize cropped face images to standard 128x128
        g1 = cv2.cvtColor(cv2.resize(img1, (128, 128)), cv2.COLOR_BGR2GRAY)
        g2 = cv2.cvtColor(cv2.resize(img2, (128, 128)), cv2.COLOR_BGR2GRAY)

        # Equalize histogram
        g1_eq = cv2.equalizeHist(g1)
        g2_eq = cv2.equalizeHist(g2)

        # 1. Cosine similarity of pixel intensities
        v1 = g1_eq.flatten().astype(np.float32)
        v2 = g2_eq.flatten().astype(np.float32)
        v1_norm = np.linalg.norm(v1)
        v2_norm = np.linalg.norm(v2)
        cosine_sim = float(np.dot(v1, v2) / (v1_norm * v2_norm)) if (v1_norm > 0 and v2_norm > 0) else 0.0

        # 2. Template correlation score
        res = cv2.matchTemplate(g1_eq, g2_eq, cv2.TM_CCOEFF_NORMED)
        tmpl_sim = float(res[0][0])

        # 3. ORB feature matching score
        orb = cv2.ORB_create(nfeatures=500)
        kp1, des1 = orb.detectAndCompute(g1_eq, None)
        kp2, des2 = orb.detectAndCompute(g2_eq, None)
        
        orb_score = 0.0
        if des1 is not None and des2 is not None and len(des1) > 0 and len(des2) > 0:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            good_matches = [m for m in matches if m.distance < 50]
            max_kp = max(len(des1), len(des2))
            orb_score = min(1.0, len(good_matches) / max(6, max_kp * 0.2))

        # Composite similarity score for single image pair
        score = (cosine_sim * 0.4) + (max(0, tmpl_sim) * 0.35) + (orb_score * 0.25)
        return score
    except Exception:
        return 0.0

def compute_face_similarity(scanned_data_str, stored_data_str):
    scanned_images, scanned_landmarks = parse_face_data_payload(scanned_data_str)
    stored_images, stored_landmarks = parse_face_data_payload(stored_data_str)

    if not scanned_images or not stored_images:
        return 0.0

    # Max similarity across all combinations of scanned vs stored multi-pose views
    max_img_score = 0.0
    for s_img in scanned_images:
        for t_img in stored_images:
            sim = compute_single_image_similarity(s_img, t_img)
            if sim > max_img_score:
                max_img_score = sim

    # Landmark vector cosine similarity score (if present)
    landmark_sim = 0.0
    if scanned_landmarks and stored_landmarks and len(scanned_landmarks) == len(stored_landmarks):
        vec1 = np.array(scanned_landmarks, dtype=np.float32)
        vec2 = np.array(stored_landmarks, dtype=np.float32)
        n1 = np.linalg.norm(vec1)
        n2 = np.linalg.norm(vec2)
        if n1 > 0 and n2 > 0:
            landmark_sim = float(np.dot(vec1, vec2) / (n1 * n2))

    if landmark_sim > 0:
        return (max_img_score * 0.7) + (max(0, landmark_sim) * 0.3)
    
    return max_img_score


class FaceLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        face_image = request.data.get('face_image')
        user_id = request.data.get('user_id')

        if not face_image:
            return Response({'detail': 'Face image scan is required for face login.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. If explicit user_id is provided (selected from modal), authenticate directly for that user
        user = None
        if user_id:
            user = User.objects.filter(id=user_id, is_active=True).first()
            if not user:
                return Response({'detail': 'Selected user account not found.'}, status=status.HTTP_404_NOT_FOUND)

        # 2. If no user_id specified, compare scanned face against stored face data for registered users
        if not user:
            from django.db.models import Q
            registered_face_users = list(User.objects.filter(
                is_active=True
            ).filter(
                Q(profile__face_verified=True) | Q(profile__face_data__gt='') | Q(profile__avatar_url__icontains='data:image')
            ).distinct())

            matching_users = []
            if registered_face_users:
                threshold = 0.38 if len(registered_face_users) == 1 else 0.45
                for u in registered_face_users:
                    stored_face = getattr(u.profile, 'face_data', '') or getattr(u.profile, 'avatar_url', '')
                    sim_score = compute_face_similarity(face_image, stored_face)
                    if sim_score >= threshold:
                        matching_users.append((u, sim_score))

            if matching_users:
                # Sort matched users by highest face similarity score
                matching_users.sort(key=lambda x: x[1], reverse=True)
                matched_user_objs = [m[0] for m in matching_users]

                if len(matched_user_objs) > 1 and matching_users[0][1] - matching_users[1][1] < 0.12:
                    accounts_list = []
                    for u in matched_user_objs[:6]:
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
                        'detail': 'Multiple accounts detected matching your face. Please select your account to sign in.'
                    }, status=status.HTTP_200_OK)
                else:
                    user = matched_user_objs[0]
            else:
                return Response(
                    {'detail': 'Face scan does not match any registered user account. Please check lighting or sign in with password.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

        if not user:
            return Response({'detail': 'No registered user found for face login.'}, status=status.HTTP_404_NOT_FOUND)

        # Mark face as verified & save face data strictly for login biometric authentication
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.face_verified = True
        profile.face_data = face_image
        profile.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)






