from rest_framework import serializers
from .models import User, UserProfile
from django.contrib.auth.password_validation import validate_password


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'preferred_language',
            'entrepreneur_type',
            'experience',
            'own_capital',
            'business_interest',
            'default_state',
            'default_district',
            'default_block',
            'default_village',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'profile']
        read_only_fields = ['role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone_number']

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=phone_number,
        )
        UserProfile.objects.create(user=user)
        return user
