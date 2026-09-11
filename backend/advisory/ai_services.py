from typing import Dict, Any
from .llm_providers import get_llm_provider
from .prompts import ADVISORY_SYSTEM_PROMPT, ADVISORY_JSON_SCHEMA
from .scoring import FeasibilityScoringService

class BusinessAdvisorService:
    def __init__(self, provider_name=None, model_name=None, api_key=None):
        self.provider = get_llm_provider(provider_name, model_name, api_key)
        self.scoring_engine = FeasibilityScoringService()

    def generate_full_advisory(self, lat: float, lng: float, radius: float, category: str, project_size: float, financial_data: Dict[str, Any] = None, language: str = 'en') -> Dict[str, Any]:
        """
        Orchestrates the entire AI flow:
        1. Calls deterministic engines.
        2. Compiles Structured Context.
        3. Invokes LLM.
        """
        
        # 1. Deterministic Engine Call
        feasibility_result = self.scoring_engine.analyze(lat, lng, radius, category, project_size)
        
        # 2. Compile Structured Context (Guardrails)
        context = {
            "business_category": category,
            "project_size_in_inr": project_size,
            "feasibility_score": feasibility_result["overall_score"],
            "feasibility_dimensions": feasibility_result["dimensions"],
            "financial_constraints": financial_data or {"note": "No explicit finance constraints provided."}
        }
        
        # 3. LLM Call
        # Inject language instruction
        lang_map = {'en': 'English', 'hi': 'Hindi', 'gu': 'Gujarati'}
        target_lang = lang_map.get(language, 'English')
        localized_prompt = ADVISORY_SYSTEM_PROMPT + f"\n\nCRITICAL INSTRUCTION: You MUST generate your entire response in {target_lang}. Maintain strict JSON schema formatting. Do NOT translate JSON keys. Ensure Indian Rupee (₹) formatting is kept consistent."

        ai_response = self.provider.generate_advisory_report(
            system_prompt=localized_prompt,
            context=context,
            schema=ADVISORY_JSON_SCHEMA
        )
        
        # 4. Final Merged Response
        # We ensure the LLM's "feasibility" object strictly aligns with the deterministic engine
        # by explicitly overwriting any hallucinated scores, just in case.
        ai_response['feasibility']['score'] = feasibility_result["overall_score"]
        ai_response['feasibility']['label'] = feasibility_result["verdict"]
        
        return {
            "deterministic_data": feasibility_result,
            "ai_analysis": ai_response
        }

    def compare_businesses(self, context: Dict[str, Any], language: str = 'en') -> Dict[str, Any]:
        from .prompts import COMPARISON_SYSTEM_PROMPT, COMPARISON_JSON_SCHEMA
        
        lang_map = {'en': 'English', 'hi': 'Hindi', 'gu': 'Gujarati'}
        target_lang = lang_map.get(language, 'English')
        localized_prompt = COMPARISON_SYSTEM_PROMPT + f"\n\nCRITICAL INSTRUCTION: You MUST generate your entire response in {target_lang}. Maintain strict JSON schema formatting. Do NOT translate JSON keys."

        return self.provider.generate_advisory_report(
            system_prompt=localized_prompt,
            context=context,
            schema=COMPARISON_JSON_SCHEMA
        )

# Sub-services for specialized operations, delegating to the provider
class SWOTGeneratorService:
    pass

class ChatService:
    def __init__(self, provider_name=None, model_name=None, api_key=None):
        self.provider = get_llm_provider(provider_name, model_name, api_key)
        
    def converse(self, report_context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        from .prompts import CHAT_SYSTEM_PROMPT
        from data.services.data_engine import DataEngine

        merged_context = dict(report_context or {})
        
        # Query DataEngine for dataset analytics on user message
        try:
            crop_analysis = DataEngine.get_instance().analyze_crop_query(user_message)
            if crop_analysis:
                merged_context["dataset_query_analysis"] = crop_analysis["direct_answer"]
                merged_context["crop_data_summary"] = crop_analysis["ranking"]
                merged_context["crop_state_comparison_table"] = crop_analysis["comparison_table"]
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Crop dataset analysis failed: {e}")

        return self.provider.generate_chat_response(
            system_prompt=CHAT_SYSTEM_PROMPT,
            context=merged_context,
            chat_history=chat_history,
            user_message=user_message
        )

