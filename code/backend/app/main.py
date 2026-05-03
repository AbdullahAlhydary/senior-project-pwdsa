"""FastAPI application entry point.

Boots the HTTP service: loads the trained classifier into app state, builds
the LLM client, mounts CORS, and wires the per-resource routers under
`app.routes`. The actual HTTP handlers live in those route modules so this
file stays small and easy to scan.

Run locally:
    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import model_artifact_path
from .ml.predictor import Predictor
from .routes import explain_router, health_router, predict_router
from .services.llm import build_service_from_env

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("pwdsa")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hook. Loads heavy state once per process."""
    artifact_path = model_artifact_path()
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
    description=(
        "Produced Water Decision-Support Application — supervised classifier "
        "+ deterministic alerts/treatment + LLM reasoning."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS is intentionally wide-open during local LAN development so the Expo
# client on a phone can talk to the desktop. Lock it down before any public
# deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(explain_router)
