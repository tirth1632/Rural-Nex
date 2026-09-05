from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from decimal import Decimal
import time
import json
from .models import LLMRequest, PromptTemplate

class GeocodingProvider(ABC):
    @abstractmethod
    def geocode(self, village_name: str, block_name: str = "", district_name: str = "") -> Optional[Dict[str, float]]:
        """Returns {'lat': float, 'lng': float} or None"""
        pass

class POIProvider(ABC):
    @abstractmethod
    def fetch_competitors(self, lat: float, lng: float, radius_km: float, category: str) -> List[Dict[str, Any]]:
        """Returns list of POI dictionaries"""
        pass

class LLMProvider(ABC):
    @abstractmethod
    def generate_structured_output(self, prompt: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """Returns JSON matching the schema"""
        pass

# Example stub implementation for LLM
class BaseLLMService:
    def __init__(self, provider: LLMProvider):
        self.provider = provider
        
    def execute_prompt(self, template_name: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        try:
            template_obj = PromptTemplate.objects.get(name=template_name, is_active=True)
            # Simplistic template rendering for demonstration
            prompt_text = template_obj.template_content
            for k, v in context.items():
                prompt_text = prompt_text.replace(f"{{{{ {k} }}}}", str(v))
        except PromptTemplate.DoesNotExist:
            prompt_text = f"Fallback prompt for {template_name}. Context: {context}"
            template_obj = None
            
        llm_request = LLMRequest.objects.create(
            template=template_obj,
            exact_prompt_sent=prompt_text,
            provider=self.provider.__class__.__name__
        )
        
        start_time = time.time()
        try:
            result = self.provider.generate_structured_output(prompt_text, schema)
            llm_request.structured_response = result
            llm_request.status = 'SUCCESS'
        except Exception as e:
            llm_request.status = 'FAILED'
            llm_request.error_message = str(e)
            raise e
        finally:
            llm_request.latency_ms = int((time.time() - start_time) * 1000)
            llm_request.save()
            
        return result
