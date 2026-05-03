"""HTTP route handlers, one router per resource.

Each module exposes `router: APIRouter` so `app.main` can simply mount them.
Splitting by resource keeps each handler file under ~80 lines and makes the
public API surface immediately scannable.
"""
from .explain import router as explain_router
from .health import router as health_router
from .predict import router as predict_router

__all__ = ["explain_router", "health_router", "predict_router"]
