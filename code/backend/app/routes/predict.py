"""POST /api/v1/predict — classifier + post-hoc add-ons.

Pipeline:
  1. Validate inputs via `PredictionRequest`.
  2. Run the joblib model wrapper (`Predictor.predict`).
  3. Build the deterministic EN/AR summary (`services.summary`).
  4. Compute the three engineering alerts (`services.alerts`).
  5. If the decision is "Treat then inject", attach the chemical-treatment
     recommendation (`services.che_treatment`).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from ..ml.predictor import Predictor
from ..schemas import PredictionRequest, PredictionResponse
from ..services.alerts import build_alerts
from ..services.che_treatment import build_treatment
from ..services.summary import build_summary

router = APIRouter()

# Decision label for which we attach a treatment recommendation.
_TREAT_LABEL = "Treat then inject"


@router.post("/api/v1/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest, request: Request) -> PredictionResponse:
    predictor: Predictor | None = request.app.state.predictor
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    payload = req.model_dump()
    # `language` is a UI hint, not a model feature — pop before inference.
    language = payload.pop("language", "en")

    result = predictor.predict(payload)
    decision = result["decision"]

    summary = build_summary(decision, payload, lang=language)
    alerts = build_alerts(payload)
    treatment = build_treatment(payload) if decision == _TREAT_LABEL else None

    return PredictionResponse(
        decision=decision,
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        summary=summary,
        model_name=result["model_name"],
        alerts=alerts,
        treatment=treatment,
    )
