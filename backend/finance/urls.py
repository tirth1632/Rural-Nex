from django.urls import path
from .views import (
    SchemesView, 
    CalculateView, 
    EMIView, 
    RepaymentScheduleView, 
    WorkingCapitalView
)

urlpatterns = [
    path('schemes/', SchemesView.as_view(), name='schemes'),
    path('calculate/', CalculateView.as_view(), name='calculate'),
    path('emi/', EMIView.as_view(), name='emi'),
    path('repayment/', RepaymentScheduleView.as_view(), name='repayment'),
    path('working-capital/', WorkingCapitalView.as_view(), name='working-capital'),
]
