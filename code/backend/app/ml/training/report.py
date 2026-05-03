"""Typed training report saved alongside the joblib artifact.

The mobile app's CI / README parses `training_report.json` to display fresh
metrics, so the schema here doubles as a public contract.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class TrainingReport:
    model_name: str
    cv_f1_macro_mean: float
    cv_f1_macro_std: float
    test_accuracy: float
    test_f1_macro: float
    classes: list[str]
    confusion_matrix: list[list[int]]
    classification_report: dict
    n_train: int
    n_test: int
    training_seconds: float
    feature_order: list[str]
