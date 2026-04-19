"""FastAPI app exposing the trained decision classifier + LLM reasoning layer."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .ml.llm import LLMError, build_service_from_env
from .ml.predictor import Predictor
from .ml.summary import build_summary
from .schemas import (
    ExplainRequest,
    ExplainResponse,
    HealthResponse,
    PredictionRequest,
    PredictionResponse,
)

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ARTIFACT = BACKEND_DIR / "artifacts" / "model.joblib"

load_dotenv(BACKEND_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("pwdsa")


@asynccontextmanager
async def lifespan(app: FastAPI):
    artifact_path = Path(os.environ.get("PWDSA_MODEL_PATH", DEFAULT_ARTIFACT))
    if not artifact_path.exists():
        logger.error("Model artifact not found at %s", artifact_path)
        app.state.predictor = None
    else:
        app.state.predictor = Predictor(artifact_path)
        logger.info(
            "Loaded model '%s' with classes %s",
            app.state.predictor.model_name,
            app.state.predictor.classes,
        )
    app.state.llm = build_service_from_env()
    logger.info(
        "LLM configured=%s model=%s",
        app.state.llm.configured,
        app.state.llm.model,
    )
    yield


app = FastAPI(
    title="PWDSA Decision API",
    description="Produced Water Decision-Support Application — prediction + LLM reasoning.",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", response_model=HealthResponse)
def health() -> HealthResponse:
    predictor: Predictor | None = app.state.predictor
    if predictor is None:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            llm_configured=app.state.llm.configured if app.state.llm else False,
        )
    return HealthResponse(
        status="ok",
        model_loaded=True,
        model_name=predictor.model_name,
        classes=predictor.classes,
        llm_configured=app.state.llm.configured if app.state.llm else False,
    )


@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest) -> PredictionResponse:
    predictor: Predictor | None = app.state.predictor
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    payload = req.model_dump()
    language = payload.pop("language", "en")
    result = predictor.predict(payload)
    summary = build_summary(result["decision"], payload, lang=language)
    return PredictionResponse(
        decision=result["decision"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        summary=summary,
        model_name=result["model_name"],
    )


@app.post("/api/v1/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest) -> ExplainResponse:
    llm = app.state.llm
    if llm is None or not llm.configured:
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
