"""Dataset loader for the training pipeline.

Reads `data/dataset.csv` and validates that every required feature column is
present. We split out this loader from `trainer.py` so the validation logic
can be unit-tested without spinning up sklearn.
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

from ..features import ALL_FEATURES, TARGET


def load_dataset(csv_path: Path) -> tuple[pd.DataFrame, pd.Series]:
    """Load the supervised dataset and split it into (X, y).

    Raises:
        ValueError: when the CSV is missing one of the required columns
            declared in `features.ALL_FEATURES` or `features.TARGET`.
    """
    df = pd.read_csv(csv_path)
    missing = [c for c in ALL_FEATURES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
    X = df[ALL_FEATURES].copy()
    y = df[TARGET].astype(str).copy()
    return X, y
