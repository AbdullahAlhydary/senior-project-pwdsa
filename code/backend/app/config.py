"""Centralized configuration & environment loading.

Two callers — `app.main` and `scripts/train.py` — need to know where the
backend root lives, so the path math is shared here. `.env` is loaded eagerly
at import time so any module that runs after this file sees the OPENAI_API_KEY.
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# `parents[1]` = code/backend (the .env file lives in the backend root).
BACKEND_DIR: Path = Path(__file__).resolve().parents[1]

# Default location of the trained joblib bundle.
DEFAULT_ARTIFACT_PATH: Path = BACKEND_DIR / "artifacts" / "model.joblib"

load_dotenv(BACKEND_DIR / ".env")


def model_artifact_path() -> Path:
    """Allow runtime override via env var (handy in containers & CI)."""
    return Path(os.environ.get("PWDSA_MODEL_PATH", DEFAULT_ARTIFACT_PATH))
