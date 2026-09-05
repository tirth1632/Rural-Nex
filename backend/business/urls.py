from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BusinessCategoryReadOnlyViewSet, 
    BusinessTypeReadOnlyViewSet, 
    ProductReadOnlyViewSet,
    BusinessCategoryAdminViewSet
)

router = DefaultRouter()
router.register(r'categories', BusinessCategoryReadOnlyViewSet, basename='categories')
router.register(r'types', BusinessTypeReadOnlyViewSet, basename='types')
router.register(r'products', ProductReadOnlyViewSet, basename='products')
router.register(r'admin/categories', BusinessCategoryAdminViewSet, basename='admin-categories')

urlpatterns = [
    path('', include(router.urls)),
]
