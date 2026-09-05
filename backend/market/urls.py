from django.urls import path
from .views import CompetitorsAPIView, DensityAPIView, ObservationsAPIView, PricingAPIView

urlpatterns = [
    path('competitors/', CompetitorsAPIView.as_view(), name='market-competitors'),
    path('density/', DensityAPIView.as_view(), name='market-density'),
    path('observations/', ObservationsAPIView.as_view(), name='market-observations'),
    path('pricing/', PricingAPIView.as_view(), name='market-pricing'),
]
