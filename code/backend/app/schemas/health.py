"""Schema for `GET /api/v1/health`."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    model_loaded: bool
    model_name: str | None = None
    classes: list[str] | None = None
    llm_configured: bool = False
