"""Evaluation helpers — cross-validation and held-out test metrics.

We score with `f1_macro` (rather than accuracy) because the four decision
classes are imbalanced — F1-macro weighs each class equally so a model that
silently ignores the minority class is penalized.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline

from .candidates import RANDOM_STATE


def cross_validate_f1_macro(
    pipe: Pipeline,
    X: pd.DataFrame,
    y_enc: np.ndarray,
    n_splits: int = 5,
) -> tuple[float, float]:
    """5-fold stratified CV scored on f1_macro. Returns (mean, std)."""
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_STATE)
    scores = cross_val_score(pipe, X, y_enc, cv=skf, scoring="f1_macro", n_jobs=-1)
    return float(scores.mean()), float(scores.std())


def evaluate_test_split(
    pipe: Pipeline,
    X_test: pd.DataFrame,
    y_test: np.ndarray,
    classes: list[str],
) -> dict:
    """Return final test-set metrics for the chosen model.

    Output keys: accuracy, f1_macro, confusion_matrix, classification_report.
    """
    y_pred = pipe.predict(X_test)
    return {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1_macro": float(f1_score(y_test, y_pred, average="macro")),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(
            y_test,
            y_pred,
            target_names=classes,
            output_dict=True,
            zero_division=0,
        ),
    }
