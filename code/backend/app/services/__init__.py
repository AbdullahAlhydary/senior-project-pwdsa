"""Application services — domain logic that runs after the ML prediction.

Each module here is deliberately small and dependency-free so it can be
unit-tested in isolation:

  * `summary.py`        — bilingual deterministic 1-2 sentence verdict.
  * `alerts.py`         — rule-based porosity/permeability/injectivity bullets.
  * `che_treatment.py`  — top-contributor scoring + treatment lookup.
  * `llm/`              — OpenAI reasoning subpackage.

The FastAPI route handlers in `app.routes.*` compose these services.
"""
