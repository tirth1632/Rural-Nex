from django.db import models
from django.conf import settings
from advisory.models import BusinessProposal

class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    proposal = models.ForeignKey(BusinessProposal, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=50, choices=[('USER', 'User'), ('ASSISTANT', 'Assistant'), ('SYSTEM', 'System')])
    content = models.TextField()
    tool_calls = models.JSONField(null=True, blank=True, help_text="Tools called by the assistant")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
