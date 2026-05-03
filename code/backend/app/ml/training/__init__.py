"""Training subpackage.

Splits the supervised-learning pipeline into focused modules so each file has
a single responsibility:
  * `data.py`          — loading the dataset CSV.
  * `preprocess.py`    — column transformer (impute + scale + one-hot).
  * `candidates.py`    — competing classifier configs (RF vs LightGBM).
  * `evaluate.py`      — cross-validation and held-out test metrics.
  * `report.py`        — typed training report.

The orchestrator `app.ml.trainer` composes these pieces.
"""
