"""Machine-learning subpackage.

  * `features.py`   — single source of truth for the model's feature list.
  * `training/`     — focused helpers used during fitting (data loader,
                      preprocessor builder, candidate models, evaluators,
                      report dataclass).
  * `trainer.py`    — orchestrator that composes the training helpers.
  * `predictor.py`  — runtime wrapper around the saved joblib bundle.
"""
