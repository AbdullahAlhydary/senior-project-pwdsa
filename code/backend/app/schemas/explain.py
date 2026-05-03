"""Schemas for `POST /api/v1/explain` — the LLM analysis route."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from .common import Language


class ExplainRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    inputs: dict[str, object]
    decision: str
    confidence: float
    probabilities: dict[str, float]
    classifier_summary: str = ""
    language: Language = "en"


class ExplainResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    analysis: str
    model: str
    tokens_prompt: int | None = None
    tokens_completion: int | None = None
