from django.db import models
from django.conf import settings

class PromptTemplate(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    template_content = models.TextField(help_text="The actual prompt text, can contain variables like {{ context }}")
    version = models.CharField(max_length=50, default='1.0')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('name', 'version')

    def __str__(self):
        return f"{self.name} (v{self.version})"

class LLMRequest(models.Model):
    template = models.ForeignKey(PromptTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    provider = models.CharField(max_length=100, default='openai')
    model_name = models.CharField(max_length=100, default='gpt-4')
    exact_prompt_sent = models.TextField()
    raw_response = models.TextField(blank=True)
    structured_response = models.JSONField(null=True, blank=True)
    status = models.CharField(max_length=50, default='PENDING') # PENDING, SUCCESS, FAILED
    error_message = models.TextField(blank=True)
    tokens_used = models.IntegerField(default=0)
    latency_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
