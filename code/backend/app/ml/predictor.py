"""Inference wrapper around the trained sklearn pipeline.

Loads the joblib artifact produced by `app.ml.trainer.train`, fills any
missing optional fields with the imputation defaults that were captured at
training time, and returns a deterministic prediction dict consumed by
`POST /api/v1/predict`.

Workflow position:
  trainer.py  -->  artifacts/model.joblib  -->  Predictor (this file)
                                                      |
                                                      v
                                              FastAPI route handler
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from .features import ALL_FEATURES


class Predictor:
    """Thin wrapper that hides the joblib bundle behind a typed API."""

    def __init__(self, artifact_path: Path):
        bundle = joblib.load(artifact_path)
        self.pipeline = bundle["pipeline"]
        self.label_encoder = bundle["label_encoder"]
        self.feature_order: list[str] = bundle["feature_order"]
        self.classes: list[str] = list(bundle["classes"])
        self.model_name: str = bundle.get("model_name", "unknown")
        # Imputation defaults captured at training time. Used when the
        # client omits an optional input (CRI/SRI today).
        self.numeric_medians: dict[str, float] = bundle.get("numeric_medians", {})
        self.categorical_modes: dict[str, str] = bundle.get("categorical_modes", {})

    def _fill_defaults(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Replace `None` / missing values with the training-set median/mode."""
        filled = dict(payload)
        for f, med in self.numeric_medians.items():
            if filled.get(f) is None:
                filled[f] = med
        for f, mode in self.categorical_modes.items():
            if filled.get(f) is None:
                filled[f] = mode
        return filled

    def predict(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Run the pipeline on a single sample and return a structured result."""
        filled = self._fill_defaults(payload)
        # Build a single-row DataFrame in the exact column order the model
        # was trained with — sklearn's ColumnTransformer is positional.
        row = {f: filled.get(f) for f in self.feature_order}
        X = pd.DataFrame([row], columns=self.feature_order)
        proba = self.pipeline.predict_proba(X)[0]
        idx = int(np.argmax(proba))
        decision = str(self.label_encoder.inverse_transform([idx])[0])
        probabilities = {cls: float(p) for cls, p in zip(self.classes, proba)}
        return {
            "decision": decision,
            "confidence": float(proba[idx]),
            "probabilities": probabilities,
            "model_name": self.model_name,
        }

    @property
    def features(self) -> list[str]:
        """Public accessor for callers that want to inspect feature order."""
        return list(ALL_FEATURES)
