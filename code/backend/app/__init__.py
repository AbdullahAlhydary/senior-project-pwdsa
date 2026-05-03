"""PWDSA backend package.

High-level layout:
  * `config.py`     — env + path constants.
  * `main.py`       — FastAPI app boot.
  * `routes/`       — HTTP handlers (health, predict, explain).
  * `schemas/`      — Pydantic request / response shapes.
  * `ml/`           — feature list, training pipeline, inference wrapper.
  * `services/`     — domain logic (summary, alerts, CHE, LLM).
"""
