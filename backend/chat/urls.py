from django.urls import path
from .views import ChatMessageAPIView

urlpatterns = [
    path('message/', ChatMessageAPIView.as_view(), name='chat-message'),
]
