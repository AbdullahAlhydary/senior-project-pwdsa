"""Prediction request/response schemas.

`PredictionRequest` mirrors the model's full feature set (with bounded
validation). The response carries the classifier's verdict plus three
post-hoc, interpretable add-ons computed server-side:

  * `summary`         — deterministic 1-2 sentence explanation (EN/AR).
  * `alerts`          — porosity / permeability / injectivity bullets.
  * `treatment`       — chemical treatment recommendation (only when the
                        decision is "Treat then inject").

The mobile UI consumes them as separate sections so users can scan them
without re-running anything.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .common import Language, Lithology


class PredictionRequest(BaseModel):
    """Single produced-water sample submitted by the client."""

    model_config = ConfigDict(protected_namespaces=())

    water_cut_fraction: float = Field(..., ge=0, le=1)
    reservoir_pressure_psi: float = Field(..., ge=0)
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
    # CRI / SRI are intentionally optional — if omitted the predictor falls
    # back to the training-set median.
    CRI: float | None = None
    SRI: float | None = None
    lithology: Lithology
    pH: float = Field(..., ge=0, le=14)
    temperature_C: float
    GRSS: float = Field(..., ge=0, le=100)
    # Optional injection rate (bbl/day). Not a model feature — used only by
    # the rule-based injectivity alert.
    injection_rate_bwpd: float | None = Field(default=None, ge=0)
    language: Language = "en"

    @field_validator("lithology", mode="before")
    @classmethod
    def _normalize_lithology(cls, v: str) -> str:
        return v.strip().lower() if isinstance(v, str) else v


class AlertResult(BaseModel):
    """One bullet for the Alerts panel — porosity / permeability / injectivity."""

    model_config = ConfigDict(protected_namespaces=())

    key: str
    severity: str  # "low" | "good" | "excellent" | "poor" | "moderate" | "n_a"
    label_en: str
    label_ar: str
    value: float | None = None
    detail_en: str | None = None
    detail_ar: str | None = None


class TreatmentRecommendation(BaseModel):
    """CHE recommendation shown when decision == 'Treat then inject'."""

    model_config = ConfigDict(protected_namespaces=())

    contributor: str
    contributor_label_en: str
    contributor_label_ar: str
    substance: str
    when_to_use_en: str
    when_to_use_ar: str
    pubchem_url: str
    score: float


class PredictionResponse(BaseModel):
    """Result of `POST /api/v1/predict`."""

    model_config = ConfigDict(protected_namespaces=())

    decision: str
    confidence: float
    probabilities: dict[str, float]
    summary: str
    model_name: str
    alerts: list[AlertResult]
    treatment: TreatmentRecommendation | None = None
