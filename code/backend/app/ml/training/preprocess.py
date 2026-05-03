"""Reusable preprocessing pipeline for both training and inference.

The same `ColumnTransformer` is used in CV folds, on the final fit, and at
inference time (loaded from the joblib bundle). Centralizing it here keeps
training and serving perfectly in sync.
"""
from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ..features import CATEGORICAL_FEATURES, NUMERIC_FEATURES


def build_preprocessor() -> ColumnTransformer:
    """Return a fresh, unfitted preprocessor.

    Numeric columns: median imputation (robust to outliers) + standard scaling.
    Categorical columns: most-frequent imputation + dense one-hot encoding
    (`handle_unknown="ignore"` so unseen labels at inference don't crash).
    """
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
