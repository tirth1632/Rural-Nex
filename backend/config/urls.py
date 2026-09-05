from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'ok'})

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # OpenAPI Schema Generation & UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # App routes (to be implemented)
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/business/', include('business.urls')),
    path('api/v1/market/', include('market.urls')),
    path('api/v1/advisory/', include('advisory.urls')),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/health/', health_check, name='health_check'),
    path('api/locations/', include('geo.urls')),
]
