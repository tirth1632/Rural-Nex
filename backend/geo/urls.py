from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, GeocodeView,
    StateListView, DistrictListView, BlockListView, VillageListView,
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    path('states/', StateListView.as_view(), name='state-list'),
    path('districts/', DistrictListView.as_view(), name='district-list'),
    path('blocks/', BlockListView.as_view(), name='block-list'),
    path('villages/', VillageListView.as_view(), name='village-list'),
    path('', include(router.urls)),
]
