"""Pydantic request/response schemas for the prediction API."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Lithology = Literal["carbonate", "sandstone", "shale"]
Language = Literal["en", "ar"]


class PredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())


    water_cut_fraction: float = Field(..., ge=0, le=1)
    MAIP_psi: float = Field(..., ge=0)
    required_injection_pressure_psi: float = Field(..., ge=0)
    porosity_fraction: float = Field(..., ge=0, le=1)
    permeability_md: float = Field(..., ge=0)
    TDS_mg_L: float = Field(..., ge=0)
    oil_in_water_ppm: float = Field(..., ge=0)
    TSS_mg_L: float = Field(..., ge=0)
    Ca_mg_L: float = Field(..., ge=0)
    SO4_mg_L: float = Field(..., ge=0)
    Ba_mg_L: float = Field(..., ge=0)
    Sr_mg_L: float = Field(..., ge=0)
    CRI: float | None = None
    SRI: float | None = None
    lithology: Lithology
    pH: float = Field(..., ge=0, le=14)
    temperature_C: float
    GRSS: float = Field(..., ge=0, le=100)
    language: Language = "en"

    @field_validator("lithology", mode="before")
    @classmethod
    def _normalize_lithology(cls, v: str) -> str:
        return v.strip().lower() if isinstance(v, str) else v


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    decision: str
    confidence: float
    probabilities: dict[str, float]
    summary: str
    model_name: str


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


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    model_loaded: bool
    model_name: str | None = None
    classes: list[str] | None = None
    llm_configured: bool = False
