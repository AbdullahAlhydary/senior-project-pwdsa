"""Canonical feature definitions shared by training and inference.

This file is the single source of truth for the model's input feature set.
Both the training pipeline (`app.ml.training.*`) and the inference wrapper
(`app.ml.predictor`) import these constants, which guarantees the model
receives features in the exact same order it was trained on.

If you add or rename a feature, update this file FIRST — every other layer
(schemas, mobile form, training script) is downstream of it.
"""
from __future__ import annotations

# Numeric features expected by the trained pipeline.
# Order matters: it is preserved end-to-end so the column transformer
# always sees the same arrangement.
NUMERIC_FEATURES: list[str] = [
    "water_cut_fraction",
    "reservoir_pressure_psi",
    "MAIP_psi",
    "required_injection_pressure_psi",
    "porosity_fraction",
    "permeability_md",
    "TDS_mg_L",
    "oil_in_water_ppm",
    "TSS_mg_L",
    "Ca_mg_L",
    "SO4_mg_L",
    "Ba_mg_L",
    "Sr_mg_L",
    "CRI",
    "SRI",
    "pH",
    "temperature_C",
    "GRSS",
]

# Categorical features handled by a one-hot encoder.
CATEGORICAL_FEATURES: list[str] = ["lithology"]

# Final ordered feature list consumed by the sklearn Pipeline.
ALL_FEATURES: list[str] = NUMERIC_FEATURES + CATEGORICAL_FEATURES

# The supervised target column inside `data/dataset.csv`.
TARGET: str = "recommended_decision"
