from rest_framework import viewsets, permissions
from .models import BusinessCategory, BusinessType, Product
from .serializers import BusinessCategorySerializer, BusinessTypeSerializer, ProductSerializer

# Beneficiary Views (Read Only)
class BusinessCategoryReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BusinessCategory.objects.all()
    serializer_class = BusinessCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class BusinessTypeReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BusinessType.objects.all()
    serializer_class = BusinessTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

class ProductReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        business_type_id = self.request.query_params.get('business_type')
        if business_type_id:
            qs = qs.filter(business_type_id=business_type_id)
        return qs

# Admin Views (Full CRUD)
class BusinessCategoryAdminViewSet(viewsets.ModelViewSet):
    queryset = BusinessCategory.objects.all()
    serializer_class = BusinessCategorySerializer
    permission_classes = [permissions.IsAdminUser]
