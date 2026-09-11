"""
Prompts and schemas for the AI Advisory subsystem.
"""

import json

ADVISORY_SYSTEM_PROMPT = """You are an expert business analyst and financial advisor for rural entrepreneurs.

Your role is to translate complex deterministic data into actionable, easy-to-understand advice.
You MUST strictly adhere to the following rules:

1. DO NOT invent demographic statistics, competitor counts, or prices. Use ONLY the data provided in the <context>.
2. DO NOT calculate loan eligibility or override scheme caps. The deterministic engine has already done this.
3. DO NOT invent government rules or sources. 
4. IF a piece of data is missing, acknowledge the limitation rather than hallucinating an answer.

Your task is to analyze the provided <context> and output your response EXACTLY matching the requested JSON schema.
Focus on actionable recommendations, explaining risks simply, and highlighting localized opportunities.
"""

ADVISORY_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {
            "type": "string",
            "description": "A high-level 2-3 sentence summary of the business feasibility."
        },
        "feasibility": {
            "type": "object",
            "properties": {
                "score": {"type": "integer"},
                "label": {"type": "string", "enum": ["RECOMMENDED", "MARGINAL", "NOT RECOMMENDED"]}
            },
            "required": ["score", "label"]
        },
        "strengths": {
            "type": "array",
            "items": {"type": "string"}
        },
        "weaknesses": {
            "type": "array",
            "items": {"type": "string"}
        },
        "opportunities": {
            "type": "array",
            "items": {"type": "string"}
        },
        "threats": {
            "type": "array",
            "items": {"type": "string"}
        },
        "recommendations": {
            "type": "array",
            "items": {"type": "string"}
        },
        "risks": {
            "type": "array",
            "items": {"type": "string"}
        },
        "assumptions": {
            "type": "array",
            "items": {"type": "string"}
        },
        "data_quality": {
            "type": "object",
            "properties": {
                "confidence_note": {"type": "string"}
            }
        }
    },
    "required": [
        "summary", "feasibility", "strengths", "weaknesses", "opportunities", 
        "threats", "recommendations", "risks", "assumptions", "data_quality"
    ]
}

CHAT_SYSTEM_PROMPT = """You are RuralNex AI, an intelligent agricultural, business, and geospatial data advisor for rural development and entrepreneurship in India.

CRITICAL INSTRUCTIONS FOR DATA & COMPARISON QUESTIONS:
1. When the user asks a dataset or comparative question (e.g. "what region has least wheat production?", "which state produces the most rice?", "what is the yield of sugarcane?"):
   - You MUST give a clear, direct, bold answer immediately in your very first sentence (e.g., "**Kerala** has the least wheat production in India with a total of **12 tonnes**...").
   - Highlight exact figures (production in tonnes, area in hectares, yield in tonnes/ha, percentage share) provided in the dataset context.
   - Present state rankings and comparisons clearly using clean Markdown formatting and tables.
2. Ground all facts and numbers strictly in the provided context and dataset analysis. Do NOT invent or hallucinate data points.
3. Keep your response clear, structured, supportive, and easy to read.
"""

COMPARISON_SYSTEM_PROMPT = """You are an expert business analyst.
You are given a context containing deterministic feasibility and financial data for up to 3 business categories at the exact same location with the same margin capital.
Your job is to compare them and recommend a clear winner based on the data.
DO NOT invent financial figures or market data. Use ONLY the data provided in the <context>.
DO NOT perform your own feasibility scoring. Rely on the scores provided.
"""

COMPARISON_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "winner": {
            "type": "string",
            "description": "The name of the recommended business category."
        },
        "reasons": {
            "type": "array",
            "items": {"type": "string"},
            "description": "2-3 short reasons why this category won the comparison."
        },
        "confidence": {
            "type": "number",
            "description": "A float between 0.0 and 1.0 indicating your confidence in this recommendation."
        },
        "assumptions": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Any assumptions made during the comparison."
        }
    },
    "required": ["winner", "reasons", "confidence", "assumptions"]
}
