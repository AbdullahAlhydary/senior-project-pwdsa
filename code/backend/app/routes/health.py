"""GET /api/v1/health — liveness + dependency status.

Reports whether the model artifact loaded successfully and whether the
LLM has credentials. The mobile client uses this to decide whether to even
offer the "Deeper AI Analysis" button.
"""
from __future__ import annotations

from fastapi import APIRouter, Request

from ..ml.predictor import Predictor
from ..schemas import HealthResponse

router = APIRouter()


@router.get("/api/v1/health", response_model=HealthResponse)
def health(request: Request) -> HealthResponse:
    """Simple readiness probe."""
    predictor: Predictor | None = request.app.state.predictor
    llm = request.app.state.llm
    if predictor is None:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            llm_configured=llm.configured if llm else False,
        )
    return HealthResponse(
        status="ok",
        model_loaded=True,
        model_name=predictor.model_name,
        classes=predictor.classes,
        llm_configured=llm.configured if llm else False,
    )
