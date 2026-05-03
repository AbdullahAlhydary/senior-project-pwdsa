"""Top-level training orchestrator.

Composes the focused helpers under `app.ml.training.*` to:
  1. Load + split the dataset (data.py).
  2. Cross-validate every candidate model (candidates.py + evaluate.py).
  3. Refit the best one on 80% train.
  4. Score it on 20% held-out test.
  5. Persist a single joblib bundle that contains the fitted pipeline,
     the label encoder, and the imputation defaults so inference can fall
     back to medians when the user omits an optional input.

The orchestrator is intentionally short — heavy lifting is delegated to
the submodules so each file stays small and single-purpose.
"""
from __future__ import annotations

import json
import time
from dataclasses import asdict
from pathlib import Path

import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

from .features import ALL_FEATURES, CATEGORICAL_FEATURES, NUMERIC_FEATURES
from .training.candidates import RANDOM_STATE, candidate_models
from .training.data import load_dataset
from .training.evaluate import cross_validate_f1_macro, evaluate_test_split
from .training.preprocess import build_preprocessor
from .training.report import TrainingReport


def _select_best_model(X_train, y_train) -> tuple[str, float, float]:
    """Run CV across all candidate models, return (name, mean, std) of winner."""
    best_name: str | None = None
    best_score = -np.inf
    best_std = 0.0
    for name, clf in candidate_models().items():
        pipe = Pipeline(
            steps=[("preprocess", build_preprocessor()), ("classifier", clf)]
        )
        mean, std = cross_validate_f1_macro(pipe, X_train, y_train)
        print(f"[cv] {name}: f1_macro = {mean:.4f} (+/- {std:.4f})")
        if mean > best_score:
            best_score, best_std, best_name = mean, std, name
    assert best_name is not None
    print(f"[selected] {best_name}")
    return best_name, best_score, best_std


def train(csv_path: Path, artifact_dir: Path) -> TrainingReport:
    """End-to-end training entry point.

    Args:
        csv_path: Path to the labeled CSV (must contain every column declared
            in `features.ALL_FEATURES` plus `features.TARGET`).
        artifact_dir: Output directory for `model.joblib` and
            `training_report.json`.
    """
    artifact_dir.mkdir(parents=True, exist_ok=True)

    X, y = load_dataset(csv_path)

    # Encode the string target ("Inject", "Disposal", ...) to integers so
    # sklearn's accuracy/F1 helpers and LightGBM accept it natively.
    label_encoder = LabelEncoder()
    y_enc = label_encoder.fit_transform(y)
    classes = list(label_encoder.classes_)

    # Stratified split keeps the same per-class proportions in train/test.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, stratify=y_enc, random_state=RANDOM_STATE
    )

    start = time.time()
    best_name, best_score, best_std = _select_best_model(X_train, y_train)

    final_pipe = Pipeline(
        steps=[
            ("preprocess", build_preprocessor()),
            ("classifier", candidate_models()[best_name]),
        ]
    )
    final_pipe.fit(X_train, y_train)
    training_seconds = time.time() - start

    test_metrics = evaluate_test_split(final_pipe, X_test, y_test, classes)
    print(
        f"[test] accuracy = {test_metrics['accuracy']:.4f}  "
        f"f1_macro = {test_metrics['f1_macro']:.4f}"
    )

    # Imputation defaults are saved so inference can substitute medians for
    # optional inputs (CRI/SRI in particular) without re-loading the dataset.
    numeric_medians = {col: float(X_train[col].median()) for col in NUMERIC_FEATURES}
    categorical_modes = {
        col: str(X_train[col].mode().iloc[0]) for col in CATEGORICAL_FEATURES
    }

    artifact_path = artifact_dir / "model.joblib"
    joblib.dump(
        {
            "pipeline": final_pipe,
            "label_encoder": label_encoder,
            "feature_order": ALL_FEATURES,
            "numeric_features": NUMERIC_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
            "classes": classes,
            "model_name": best_name,
            "numeric_medians": numeric_medians,
            "categorical_modes": categorical_modes,
        },
        artifact_path,
    )
    print(f"[saved] {artifact_path}")

    report = TrainingReport(
        model_name=best_name,
        cv_f1_macro_mean=best_score,
        cv_f1_macro_std=best_std,
        test_accuracy=test_metrics["accuracy"],
        test_f1_macro=test_metrics["f1_macro"],
        classes=classes,
        confusion_matrix=test_metrics["confusion_matrix"],
        classification_report=test_metrics["classification_report"],
        n_train=int(len(y_train)),
        n_test=int(len(y_test)),
        training_seconds=float(training_seconds),
        feature_order=list(ALL_FEATURES),
    )
    with (artifact_dir / "training_report.json").open("w", encoding="utf-8") as f:
        json.dump(asdict(report), f, indent=2)
    return report
