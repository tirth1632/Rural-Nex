from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, GeocodeView,
    StateListView, DistrictListView, BlockListView, VillageListView,
    DynamicHierarchyView, DynamicDistrictsView, DynamicVillagesView,
    RadiusSearchView, BusinessCategoriesView, SuitabilityAssessmentView
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    # Dynamic Dataset API Endpoints
    path('hierarchy/', DynamicHierarchyView.as_view(), name='geo-dynamic-hierarchy'),
    path('districts-data/', DynamicDistrictsView.as_view(), name='geo-districts-data'),
    path('villages-data/', DynamicVillagesView.as_view(), name='geo-villages-data'),
    path('radius-search/', RadiusSearchView.as_view(), name='geo-radius-search'),
    path('business-categories/', BusinessCategoriesView.as_view(), name='geo-business-categories'),
    path('suitability-assessment/', SuitabilityAssessmentView.as_view(), name='geo-suitability-assessment'),

    # Legacy Endpoints
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    path('states/', StateListView.as_view(), name='state-list'),
    path('districts/', DistrictListView.as_view(), name='district-list'),
    path('blocks/', BlockListView.as_view(), name='block-list'),
    path('villages/', VillageListView.as_view(), name='village-list'),
    path('', include(router.urls)),
]
