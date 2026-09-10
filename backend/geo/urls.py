from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, GeocodeView,
    StateListView, DistrictListView, BlockListView, VillageListView,
    DynamicHierarchyView, DynamicDistrictsView, DynamicBlocksView, DynamicVillagesView,
    RadiusSearchView, BusinessCategoriesView, SuitabilityAssessmentView,
    DataStatusView, BusinessesDataView, PopulationDataView, GroundwaterDataView,
    EconomicsDataView, LivestockDataView, MarketDataView
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    # Dynamic Dataset API Endpoints
    path('hierarchy/', DynamicHierarchyView.as_view(), name='geo-dynamic-hierarchy'),
    path('districts-data/', DynamicDistrictsView.as_view(), name='geo-districts-data'),
    path('blocks-data/', DynamicBlocksView.as_view(), name='geo-blocks-data'),
    path('villages-data/', DynamicVillagesView.as_view(), name='geo-villages-data'),

    path('radius-search/', RadiusSearchView.as_view(), name='geo-radius-search'),
    path('business-categories/', BusinessCategoriesView.as_view(), name='geo-business-categories'),
    path('suitability-assessment/', SuitabilityAssessmentView.as_view(), name='geo-suitability-assessment'),
    path('data-status/', DataStatusView.as_view(), name='geo-data-status'),
    path('businesses-data/', BusinessesDataView.as_view(), name='geo-businesses-data'),
    path('population-data/', PopulationDataView.as_view(), name='geo-population-data'),
    path('groundwater-data/', GroundwaterDataView.as_view(), name='geo-groundwater-data'),
    path('economics-data/', EconomicsDataView.as_view(), name='geo-economics-data'),
    path('livestock-data/', LivestockDataView.as_view(), name='geo-livestock-data'),
    path('market-data/', MarketDataView.as_view(), name='geo-market-data'),

    # Legacy Endpoints
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    path('states/', StateListView.as_view(), name='state-list'),
    path('districts/', DistrictListView.as_view(), name='district-list'),
    path('blocks/', BlockListView.as_view(), name='block-list'),
    path('villages/', VillageListView.as_view(), name='village-list'),
    path('', include(router.urls)),
]
