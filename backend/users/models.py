from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import AuditModel, SoftDeleteModel
from geo.models import Village, Block, District, State


class UserRole(models.TextChoices):
    BENEFICIARY = 'BENEFICIARY', 'Beneficiary'
    ADMIN = 'ADMIN', 'Admin'
    ANALYST = 'ANALYST', 'Analyst'


class EntrepreneurType(models.TextChoices):
    ASPIRING = 'aspiring', 'Aspiring Entrepreneur'
    NEW = 'new', 'New Entrepreneur'
    EXISTING = 'existing', 'Existing Entrepreneur'


class BusinessExperience(models.TextChoices):
    NONE = 'none', 'No experience'
    LESS_THAN_1 = 'lt1', 'Less than 1 year'
    ONE_TO_THREE = '1_3', '1–3 years'
    THREE_TO_FIVE = '3_5', '3–5 years'
    MORE_THAN_5 = 'gt5', 'More than 5 years'


class User(AbstractUser, SoftDeleteModel):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.BENEFICIARY)

    def __str__(self):
        return self.username


class UserProfile(AuditModel, SoftDeleteModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_language = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('hi', 'Hindi'), ('gu', 'Gujarati')],
        default='en'
    )

    # Entrepreneur profile
    entrepreneur_type = models.CharField(
        max_length=20,
        choices=EntrepreneurType.choices,
        blank=True,
        null=True
    )
    experience = models.CharField(
        max_length=10,
        choices=BusinessExperience.choices,
        blank=True,
        null=True
    )
    own_capital = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Approximate own capital available in INR'
    )
    # Interest only — not bound to a single assessment
    business_interest = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='General business interest category (not tied to any specific assessment)'
    )

    # Optional default location preferences
    default_state = models.ForeignKey(State, null=True, blank=True, on_delete=models.SET_NULL)
    default_district = models.ForeignKey(District, null=True, blank=True, on_delete=models.SET_NULL)
    default_block = models.CharField(max_length=100, null=True, blank=True)
    default_village = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and timezone.now() <= self.expires_at

    def __str__(self):
        return f"OTP for {self.user.username}"
