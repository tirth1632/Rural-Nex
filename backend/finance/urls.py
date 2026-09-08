from django.urls import path
from .views import (
    BusinessActivitiesListView,
    GovernmentSchemesListView,
    SchemeMatchView,
    CalculateFeasibilityView,
    GenerateBankDPRView,
    AIAdvisorExplainView,
    SaveFinancialPlanView,
    UserFinancialPlansListView,
    FinancialPlanDetailView,
    SchemesView,
    EMIView, 
    RepaymentScheduleView, 
    WorkingCapitalView
)

urlpatterns = [
    # Master Data Endpoints
    path('activities/', BusinessActivitiesListView.as_view(), name='activities'),
    path('schemes/', SchemesView.as_view(), name='schemes'),
    path('schemes/all/', GovernmentSchemesListView.as_view(), name='government-schemes'),
    path('schemes/match/', SchemeMatchView.as_view(), name='schemes-match'),

    # Calculations & Pipeline
    path('calculate/', CalculateFeasibilityView.as_view(), name='calculate'),
    path('dpr/generate/', GenerateBankDPRView.as_view(), name='dpr-generate'),
    path('advisor/explain/', AIAdvisorExplainView.as_view(), name='advisor-explain'),

    # Plan Drafts & History
    path('plans/save/', SaveFinancialPlanView.as_view(), name='plans-save'),
    path('plans/', UserFinancialPlansListView.as_view(), name='plans-list'),
    path('plans/<uuid:pk>/', FinancialPlanDetailView.as_view(), name='plan-detail'),

    # Legacy Endpoints (Preserved for compatibility)
    path('emi/', EMIView.as_view(), name='emi'),
    path('repayment/', RepaymentScheduleView.as_view(), name='repayment'),
    path('working-capital/', WorkingCapitalView.as_view(), name='working-capital'),
]
