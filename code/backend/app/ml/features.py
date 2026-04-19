"""Canonical feature definitions shared by training and inference."""
from __future__ import annotations

NUMERIC_FEATURES: list[str] = [
    "water_cut_fraction",
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

CATEGORICAL_FEATURES: list[str] = ["lithology"]

ALL_FEATURES: list[str] = NUMERIC_FEATURES + CATEGORICAL_FEATURES

TARGET: str = "recommended_decision"
