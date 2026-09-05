from rest_framework import serializers
from .models import BusinessCategory, BusinessType, Product, CostComponent, RevenueComponent, OperationalRisk

class BusinessCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCategory
        fields = ['id', 'name', 'description', 'icon_slug']

class BusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessType
        fields = ['id', 'category', 'name', 'description']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'business_type', 'name', 'base_unit']

class CostComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostComponent
        fields = ['id', 'business_type', 'name', 'frequency', 'is_variable']

class RevenueComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueComponent
        fields = ['id', 'business_type', 'name', 'frequency']

class OperationalRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationalRisk
        fields = ['id', 'business_type', 'name', 'description', 'severity']
