import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a structured JSON response from the LLM based on context."""
        pass
        
    @abstractmethod
    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        """Generate a raw text response for conversational AI."""
        pass

class MockLLMProvider(BaseLLMProvider):
    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        # Simulated intelligent response parsing the context
        feasibility_score = context.get('feasibility_score', 0)
        label = "RECOMMENDED" if feasibility_score >= 60 else "MARGINAL" if feasibility_score >= 40 else "NOT RECOMMENDED"
        
        return {
            "summary": f"Based on the deterministic score of {feasibility_score}, this project is {label}.",
            "feasibility": {
                "score": int(feasibility_score),
                "label": label
            },
            "strengths": ["Strong deterministic score alignment.", "Sufficient margin capital."],
            "weaknesses": ["Lack of real-time supply chain data."],
            "opportunities": ["Untapped local market segment based on density analysis."],
            "threats": ["Potential future competitors entering the 5km radius."],
            "recommendations": ["Proceed with the formal loan application.", "Focus on local marketing."],
            "risks": ["Standard operational risks for this sector."],
            "assumptions": ["Assuming cost components hold true for the first 6 months."],
            "data_quality": {
                "confidence_note": "Data based on mock aggregation and deterministic engine."
            }
        }
        
    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        return f"Mock AI Response to: '{user_message}'. I have read the context with score {context.get('feasibility_score')}."

class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        import openai
        self.client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy"))
        self.model = os.environ.get("OPENAI_MODEL", "gpt-4o")

    def _sanitize_context(self, context: Dict[str, Any]) -> str:
        import copy
        import html
        
        safe_ctx = copy.deepcopy(context)
        # Limit the size of free-text inputs
        for key in ['expected_scale', 'target_customers', 'products']:
            if key in safe_ctx and isinstance(safe_ctx[key], str):
                safe_ctx[key] = html.escape(safe_ctx[key][:500]) # Hard limit 500 chars
                
        return json.dumps(safe_ctx)

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_context_str = self._sanitize_context(context)
        # Using OpenAI Structured Outputs (json_schema)
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"<context>{safe_context_str}</context>\n\nPlease analyze this context and output JSON."}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "advisory_report",
                    "schema": schema,
                    "strict": True
                }
            },
            temperature=0.2 # Low temp for analytical consistency
        )
        return json.loads(response.choices[0].message.content)
        
    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_context_str = self._sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_context_str}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.5
        )
        return response.choices[0].message.content

def get_llm_provider() -> BaseLLMProvider:
    provider = os.environ.get("LLM_PROVIDER", "mock").lower()
    if provider == "openai":
        return OpenAIProvider()
    return MockLLMProvider()
