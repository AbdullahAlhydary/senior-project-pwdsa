"""Candidate classifier configurations evaluated during training.

Each call returns FRESH instances so that nothing leaks fitted state between
the cross-validation phase and the final refit.
"""
from __future__ import annotations

from lightgbm import LGBMClassifier
from sklearn.ensemble import RandomForestClassifier

# Reproducible random seed shared across estimators and splitters.
RANDOM_STATE = 42


def candidate_models() -> dict[str, object]:
    """Return the model zoo: name -> unfitted estimator."""
    return {
        "random_forest": RandomForestClassifier(
            # Many shallow-to-deep trees for stable probability estimates.
            n_estimators=400,
            max_depth=None,
            min_samples_leaf=2,
            # `class_weight="balanced"` compensates for the imbalanced
            # distribution of the four decision classes.
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE,
        ),
        "lightgbm": LGBMClassifier(
            n_estimators=500,
            learning_rate=0.05,
            num_leaves=63,
            max_depth=-1,
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE,
            verbosity=-1,
        ),
    }
