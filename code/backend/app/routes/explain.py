"""POST /api/v1/explain — LLM reasoning add-on.

Triggered by the mobile UI when the user taps the "Deeper AI Analysis"
button after seeing a prediction. Forwards the structured context to the
configured LLM and converts upstream failures into HTTP responses with
machine-readable `code` fields (the mobile app maps each code to a
localized message).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from ..schemas import ExplainRequest, ExplainResponse
from ..services.llm import LLMError

router = APIRouter()


@router.post("/api/v1/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest, request: Request) -> ExplainResponse:
    llm = request.app.state.llm
    if llm is None or not llm.configured:
        # 503 lets the client distinguish "missing config" from "rate-limited".
        raise HTTPException(
            status_code=503,
            detail={
                "code": "not_configured",
                "message": "The AI service is not configured on the server.",
            },
        )
    try:
        result = await llm.explain(
            decision=req.decision,
            confidence=req.confidence,
            probabilities=req.probabilities,
            classifier_summary=req.classifier_summary,
            inputs=req.inputs,
            language=req.language,
        )
    except LLMError as e:
        raise HTTPException(
            status_code=e.http_status,
            detail={"code": e.code, "message": e.message},
        ) from e
    return ExplainResponse(**result)
