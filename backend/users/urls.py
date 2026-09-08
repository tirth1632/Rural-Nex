from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, CurrentUserView, UpdateProfileView, ForgotPasswordView, 
    VerifyOTPView, ResetPasswordView, GoogleLoginView, SendPhoneOTPView, VerifyPhoneOTPView,
    ChangePasswordView, ActiveSessionsView, RevokeOtherSessionsView,
    Setup2FAView, Verify2FAView, Disable2FAView, DeleteAccountView,
    UserDataCountsView, UserDataExportView, ClearAssessmentHistoryView, DeleteAllSavedDataView,
    FaceLoginView, FaceEnrollView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('face-login/', FaceLoginView.as_view(), name='face_login'),
    path('face-enroll/', FaceEnrollView.as_view(), name='face_enroll'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', UpdateProfileView.as_view(), name='update_profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('send-phone-otp/', SendPhoneOTPView.as_view(), name='send_phone_otp'),
    path('verify-phone-otp/', VerifyPhoneOTPView.as_view(), name='verify_phone_otp'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('sessions/', ActiveSessionsView.as_view(), name='active_sessions'),
    path('sessions/revoke-others/', RevokeOtherSessionsView.as_view(), name='revoke_other_sessions'),
    path('2fa/setup/', Setup2FAView.as_view(), name='setup_2fa'),
    path('2fa/verify/', Verify2FAView.as_view(), name='verify_2fa'),
    path('2fa/disable/', Disable2FAView.as_view(), name='disable_2fa'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('data-counts/', UserDataCountsView.as_view(), name='user_data_counts'),
    path('export-data/', UserDataExportView.as_view(), name='user_data_export'),
    path('clear-assessment-history/', ClearAssessmentHistoryView.as_view(), name='clear_assessment_history'),
    path('delete-all-saved-data/', DeleteAllSavedDataView.as_view(), name='delete_all_saved_data'),
]

