from django.urls import path
from .views import (
    SchemeListView,
    SchemeSearchView,
    SchemeStatsView,
    SchemeCategoriesListView,
    SchemeMinistriesListView,
    SchemeBenefitsListView,
    SchemeLocationsListView,
    SchemeDetailView,
    SchemeMatchView,
    SchemeBenefitCalculateView,
    SchemeEligibilityCheckView,
    SchemeCompareView,
    SavedSchemesView,
    SavedSchemeDeleteView,
    SchemeAddToFinancialPlanView
)

urlpatterns = [
    # Search, stats & faceted queries
    path('', SchemeListView.as_view(), name='scheme-list'),
    path('search/', SchemeSearchView.as_view(), name='scheme-search'),
    path('stats/', SchemeStatsView.as_view(), name='scheme-stats'),
    path('categories/', SchemeCategoriesListView.as_view(), name='scheme-categories'),
    path('ministries/', SchemeMinistriesListView.as_view(), name='scheme-ministries'),
    path('benefits/', SchemeBenefitsListView.as_view(), name='scheme-benefits'),
    path('locations/', SchemeLocationsListView.as_view(), name='scheme-locations'),
    path('match/', SchemeMatchView.as_view(), name='scheme-match'),
    path('compare/', SchemeCompareView.as_view(), name='scheme-compare'),

    # Saved Schemes
    path('saved-schemes/', SavedSchemesView.as_view(), name='saved-schemes'),
    path('saved-schemes/<int:pk>/', SavedSchemeDeleteView.as_view(), name='saved-scheme-delete'),

    # Scheme actions by ID or official_id
    path('<str:pk>/', SchemeDetailView.as_view(), name='scheme-detail'),
    path('<str:pk>/calculate-benefit/', SchemeBenefitCalculateView.as_view(), name='scheme-calculate-benefit'),
    path('<str:pk>/eligibility/', SchemeEligibilityCheckView.as_view(), name='scheme-eligibility'),
    path('<str:pk>/add-to-financial-plan/', SchemeAddToFinancialPlanView.as_view(), name='scheme-add-to-financial-plan'),
]
