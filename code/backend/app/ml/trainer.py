"""Train a supervised classifier for `recommended_decision`.

Compares RandomForest vs. LightGBM with stratified 5-fold CV, selects the
better model by F1-macro (handles class imbalance better than accuracy),
refits on the full training split, evaluates on a held-out test set, and
persists the full sklearn Pipeline as a single joblib artifact.
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass, asdict
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler

from .features import ALL_FEATURES, CATEGORICAL_FEATURES, NUMERIC_FEATURES, TARGET

RANDOM_STATE = 42


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


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_FEATURES),
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )


def candidate_models() -> dict[str, object]:
    return {
        "random_forest": RandomForestClassifier(
            n_estimators=400,
            max_depth=None,
            min_samples_leaf=2,
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


def load_dataset(csv_path: Path) -> tuple[pd.DataFrame, pd.Series]:
    df = pd.read_csv(csv_path)
    missing = [c for c in ALL_FEATURES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
    X = df[ALL_FEATURES].copy()
    y = df[TARGET].astype(str).copy()
    return X, y


def cross_validate(pipe: Pipeline, X: pd.DataFrame, y_enc: np.ndarray) -> tuple[float, float]:
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    scores = cross_val_score(pipe, X, y_enc, cv=skf, scoring="f1_macro", n_jobs=-1)
    return float(scores.mean()), float(scores.std())


def train(csv_path: Path, artifact_dir: Path) -> TrainingReport:
    artifact_dir.mkdir(parents=True, exist_ok=True)
    X, y = load_dataset(csv_path)

    label_encoder = LabelEncoder()
    y_enc = label_encoder.fit_transform(y)
    classes = list(label_encoder.classes_)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, stratify=y_enc, random_state=RANDOM_STATE
    )

    best_name: str | None = None
    best_score = -np.inf
    best_std = 0.0
    cv_results: dict[str, tuple[float, float]] = {}

    start = time.time()
    for name, clf in candidate_models().items():
        pipe = Pipeline(
            steps=[("preprocess", build_preprocessor()), ("classifier", clf)]
        )
        mean, std = cross_validate(pipe, X_train, y_train)
        cv_results[name] = (mean, std)
        print(f"[cv] {name}: f1_macro = {mean:.4f} (+/- {std:.4f})")
        if mean > best_score:
            best_score, best_std, best_name = mean, std, name

    assert best_name is not None
    print(f"[selected] {best_name}")

    final_pipe = Pipeline(
        steps=[
            ("preprocess", build_preprocessor()),
            ("classifier", candidate_models()[best_name]),
        ]
    )
    final_pipe.fit(X_train, y_train)
    training_seconds = time.time() - start

    y_pred = final_pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1m = f1_score(y_test, y_pred, average="macro")
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(
        y_test, y_pred, target_names=classes, output_dict=True, zero_division=0
    )

    print(f"[test] accuracy = {acc:.4f}  f1_macro = {f1m:.4f}")

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

    training_report = TrainingReport(
        model_name=best_name,
        cv_f1_macro_mean=best_score,
        cv_f1_macro_std=best_std,
        test_accuracy=float(acc),
        test_f1_macro=float(f1m),
        classes=classes,
        confusion_matrix=cm,
        classification_report=report,
        n_train=int(len(y_train)),
        n_test=int(len(y_test)),
        training_seconds=float(training_seconds),
    )
    with (artifact_dir / "training_report.json").open("w", encoding="utf-8") as f:
        json.dump(asdict(training_report), f, indent=2)
    return training_report
