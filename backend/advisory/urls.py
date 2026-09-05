from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BusinessProposalViewSet, 
    AnalysisRunViewSet, 
    BusinessCategoryViewSet, 
    FeasibilityAnalyzeAPIView,
    GenerateAdvisoryAPIView,
    ReportAPIView,
    TranscribeAudioAPIView,
    SynthesizeAudioAPIView,
    BusinessCompareAPIView,
    SimulationAPIView
)

router = DefaultRouter()
router.register(r'categories', BusinessCategoryViewSet)
router.register(r'proposals', BusinessProposalViewSet, basename='businessproposal')
router.register(r'runs', AnalysisRunViewSet, basename='analysisrun')

urlpatterns = [
    path('', include(router.urls)),
    path('feasibility/analyze/', FeasibilityAnalyzeAPIView.as_view(), name='feasibility-analyze'),
    path('feasibility/compare/', BusinessCompareAPIView.as_view(), name='feasibility-compare'),
    path('generate/', GenerateAdvisoryAPIView.as_view(), name='advisory-generate'),
    path('reports/<int:pk>/generate/', ReportAPIView.as_view(), name='report-generate'),
    path('reports/<int:pk>/', ReportAPIView.as_view(), name='report-download'),
    path('voice/transcribe/', TranscribeAudioAPIView.as_view(), name='voice-transcribe'),
    path('voice/synthesize/', SynthesizeAudioAPIView.as_view(), name='voice-synthesize'),
    path('simulate/', SimulationAPIView.as_view(), name='simulate'),
]
