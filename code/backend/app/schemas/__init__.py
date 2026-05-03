"""Pydantic schemas for the public API.

Split into one file per route family so each schema lives next to its
sibling shapes (request + response) without dragging unrelated types into
the same module.

Re-exports from this `__init__` keep import paths short for callers:

    from app.schemas import PredictionRequest, ExplainResponse, HealthResponse
"""
from .common import Language, Lithology
from .explain import ExplainRequest, ExplainResponse
from .health import HealthResponse
from .prediction import (
    AlertResult,
    PredictionRequest,
    PredictionResponse,
    TreatmentRecommendation,
)

__all__ = [
    "Language",
    "Lithology",
    "ExplainRequest",
    "ExplainResponse",
    "HealthResponse",
    "AlertResult",
    "PredictionRequest",
    "PredictionResponse",
    "TreatmentRecommendation",
]
