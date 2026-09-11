import os
import json
import logging
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger(__name__)

def sanitize_context(context: Dict[str, Any]) -> str:
    import copy
    import html
    safe_ctx = copy.deepcopy(context)
    for key in ['expected_scale', 'target_customers', 'products']:
        if key in safe_ctx and isinstance(safe_ctx[key], str):
            safe_ctx[key] = html.escape(safe_ctx[key][:500])
    return json.dumps(safe_ctx)

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
        if context and "dataset_query_analysis" in context:
            answer = context["dataset_query_analysis"]
            table = context.get("crop_state_comparison_table", "")
            return f"{answer}\n\n### State-wise Production & Yield Analysis (All-India Crop Dataset):\n{table}"
        score = context.get('feasibility_score')
        score_note = f" (Feasibility Score: {score})" if score is not None else ""
        return f"Based on RuralNex dataset analysis for '{user_message}'{score_note}: Please feel free to ask about crop yields, state-wise agricultural production, or business feasibility!"

class OpenRouterProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY", "")
        self.model = model or os.environ.get("OPENROUTER_MODEL", "openrouter/auto")
        self.url = "https://openrouter.ai/api/v1/chat/completions"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        prompt = (
            f"{system_prompt}\n\n"
            f"Context Data:\n{safe_ctx}\n\n"
            f"REQUIRED OUTPUT: Provide ONLY a valid JSON object matching the requested advisory schema. Do not include markdown codeblocks or extra text."
        )
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ruralnex.app",
            "X-Title": "RuralNex Advisory Platform"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model = model or os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        prompt = (
            f"{system_prompt}\n\n"
            f"Context Data:\n{safe_ctx}\n\n"
            f"REQUIRED OUTPUT: Output strict raw JSON only."
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }
        res = requests.post(url, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        contents = [{"role": "user", "parts": [{"text": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]}]
        for msg in chat_history:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": user_message}]})

        payload = {"contents": contents, "generationConfig": {"temperature": 0.5}}
        res = requests.post(url, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]

class GrokProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("GROK_API_KEY", os.environ.get("XAI_API_KEY", ""))
        self.model = model or os.environ.get("GROK_MODEL", "grok-2-latest")
        self.url = "https://api.x.ai/v1/chat/completions"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"<context>{safe_ctx}</context>\n\nPlease analyze this context and output JSON."}
            ],
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.model = model or os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        self.url = "https://api.openai.com/v1/chat/completions"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context Data:\n{safe_ctx}\n\nREQUIRED OUTPUT: Provide ONLY a valid JSON object matching the requested advisory schema."}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]


class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        self.model = model or os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        self.url = "https://api.anthropic.com/v1/messages"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": f"Context:\n{safe_ctx}\nOutput ONLY valid raw JSON matching schema."}],
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["content"][0]["text"]
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        messages = []
        for msg in chat_history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "max_tokens": 1024,
            "system": f"{system_prompt}\n\nContext:\n{safe_ctx}",
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["content"][0]["text"]


class DeepSeekProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY", "")
        self.model = model or os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
        self.url = "https://api.deepseek.com/v1/chat/completions"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{safe_ctx}\nOutput JSON only."}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]


class GroqProvider(BaseLLMProvider):
    def __init__(self, api_key=None, model=None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "")
        self.model = model or os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        safe_ctx = sanitize_context(context)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{safe_ctx}\nOutput JSON only."}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        safe_ctx = sanitize_context(context)
        messages = [{"role": "system", "content": f"{system_prompt}\n\nReport Context:\n{safe_ctx}"}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_message})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5
        }
        res = requests.post(self.url, headers=headers, json=payload, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]


class MultiFallbackLLMProvider(BaseLLMProvider):
    def __init__(self, custom_key=None, custom_provider=None, custom_model=None):
        self.providers = []
        
        if custom_provider and custom_key:
            prov = custom_provider.lower()
            if prov == "gemini":
                self.providers.append(("CustomGemini", GeminiProvider(api_key=custom_key, model=custom_model)))
            elif prov == "openai":
                self.providers.append(("CustomOpenAI", OpenAIProvider(api_key=custom_key, model=custom_model)))
            elif prov == "anthropic":
                self.providers.append(("CustomAnthropic", AnthropicProvider(api_key=custom_key, model=custom_model)))
            elif prov == "deepseek":
                self.providers.append(("CustomDeepSeek", DeepSeekProvider(api_key=custom_key, model=custom_model)))
            elif prov == "groq":
                self.providers.append(("CustomGroq", GroqProvider(api_key=custom_key, model=custom_model)))
            elif prov == "openrouter":
                self.providers.append(("CustomOpenRouter", OpenRouterProvider(api_key=custom_key, model=custom_model)))

        if os.environ.get("OPENROUTER_API_KEY"):
            self.providers.append(("OpenRouter", OpenRouterProvider()))
        if os.environ.get("GEMINI_API_KEY"):
            self.providers.append(("Gemini", GeminiProvider()))
        if os.environ.get("OPENAI_API_KEY"):
            self.providers.append(("OpenAI", OpenAIProvider()))
        if os.environ.get("ANTHROPIC_API_KEY"):
            self.providers.append(("Anthropic", AnthropicProvider()))
        if os.environ.get("DEEPSEEK_API_KEY"):
            self.providers.append(("DeepSeek", DeepSeekProvider()))
        if os.environ.get("GROQ_API_KEY"):
            self.providers.append(("Groq", GroqProvider()))
        if os.environ.get("GROK_API_KEY") or os.environ.get("XAI_API_KEY"):
            self.providers.append(("Grok", GrokProvider()))
        
        self.mock = MockLLMProvider()

    def generate_advisory_report(self, system_prompt: str, context: Dict[str, Any], schema: Dict[str, Any]) -> Dict[str, Any]:
        for name, provider in self.providers:
            try:
                logger.info(f"Attempting AI report generation with {name} provider...")
                return provider.generate_advisory_report(system_prompt, context, schema)
            except Exception as e:
                logger.warning(f"AI Provider {name} failed: {e}. Falling back to next provider...")
        
        logger.info("All live AI providers failed or were unconfigured. Using Mock provider fallback.")
        return self.mock.generate_advisory_report(system_prompt, context, schema)

    def generate_chat_response(self, system_prompt: str, context: Dict[str, Any], chat_history: list, user_message: str) -> str:
        for name, provider in self.providers:
            try:
                logger.info(f"Attempting AI chat response with {name} provider...")
                return provider.generate_chat_response(system_prompt, context, chat_history, user_message)
            except Exception as e:
                logger.warning(f"AI Provider {name} failed: {e}. Falling back to next provider...")

        return self.mock.generate_chat_response(system_prompt, context, chat_history, user_message)

def get_llm_provider(provider_name=None, model_name=None, api_key=None) -> BaseLLMProvider:
    provider = (provider_name or os.environ.get("LLM_PROVIDER", "multi_fallback")).lower()
    if provider == "openrouter":
        return OpenRouterProvider(api_key=api_key, model=model_name)
    elif provider == "gemini":
        return GeminiProvider(api_key=api_key, model=model_name)
    elif provider == "openai":
        return OpenAIProvider(api_key=api_key, model=model_name)
    elif provider == "anthropic":
        return AnthropicProvider(api_key=api_key, model=model_name)
    elif provider == "deepseek":
        return DeepSeekProvider(api_key=api_key, model=model_name)
    elif provider == "groq":
        return GroqProvider(api_key=api_key, model=model_name)
    elif provider == "grok":
        return GrokProvider(api_key=api_key, model=model_name)
    elif provider == "mock":
        return MockLLMProvider()
    return MultiFallbackLLMProvider(custom_key=api_key, custom_provider=provider_name, custom_model=model_name)


