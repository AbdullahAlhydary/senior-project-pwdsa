# PWDSA Backend

FastAPI service hosting the trained supervised classifier that predicts
`recommended_decision` from the dashboard inputs.

Everything (venv, pip cache, model artifact) lives on the **D drive** —
nothing is installed to C.

## Layout

```
backend/
  app/
    main.py                # FastAPI app + routes
    schemas.py             # Pydantic request/response
    ml/
      features.py          # Canonical feature lists
      trainer.py           # Training pipeline
      predictor.py         # Inference wrapper
      summary.py           # EN/AR plain-language summary (Spec 3)
  scripts/
    train.py               # CLI: train + save artifact
  artifacts/
    model.joblib           # Trained sklearn Pipeline
    training_report.json   # CV + test metrics
  requirements.txt
```

## First-time setup (already done once on this machine)

```bash
# Creates .venv and .pip-cache on D:
python -m venv .venv
.venv\Scripts\python.exe -m pip install \
  --cache-dir "D:/Desktop/Final SP implementation/backend/.pip-cache" \
  -r requirements.txt
```

## Retrain the model

```bash
.venv\Scripts\python.exe scripts\train.py
```

Uses `../datasetSP_CSV.csv` by default. The trainer runs 5-fold stratified
CV on RandomForest and LightGBM, picks the higher F1-macro, refits on 80%
train, and evaluates on the 20% held-out test set. Last run:

- Model: `random_forest`
- CV F1-macro: 0.9805 (+/- 0.0016)
- Test accuracy: **0.9808**
- Test F1-macro: **0.9828**

## Run the API

```bash
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs for the interactive Swagger UI.

### Endpoints

| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /api/v1/health    | Liveness + model metadata            |
| POST   | /api/v1/predict   | Classify a sample                    |

### Sample request

```json
{
  "water_cut_fraction": 0.35,
  "MAIP_psi": 7000,
  "required_injection_pressure_psi": 4500,
  "porosity_fraction": 0.22,
  "permeability_md": 650,
  "TDS_mg_L": 3200,
  "oil_in_water_ppm": 8.5,
  "TSS_mg_L": 25.0,
  "Ca_mg_L": 1100,
  "SO4_mg_L": 180,
  "Ba_mg_L": 2,
  "Sr_mg_L": 90,
  "CRI": 30.0,
  "SRI": 25.0,
  "lithology": "sandstone",
  "pH": 7.6,
  "temperature_C": 55.0,
  "GRSS": 82.0,
  "language": "en"
}
```

### Sample response

```json
{
  "decision": "Inject",
  "confidence": 0.99,
  "probabilities": {
    "Disposal": 0.0,
    "Inject": 0.99,
    "Injection not suitable": 0.0025,
    "Treat then inject": 0.0075
  },
  "summary": "The water is suitable for direct injection: quality indicators …",
  "model_name": "random_forest"
}
```

Set `"language": "ar"` for an Arabic summary (Specification 11 / Integrated Spec 4).

## How the frontend finds the API

The Flutter client reads `ApiConfig.baseUrl` in `lib/services/api_config.dart`:
- Desktop / web: `http://127.0.0.1:8000`
- Android emulator: `http://10.0.2.2:8000`
- Override at build time: `flutter run --dart-define=API_BASE_URL=http://<lan-ip>:8000`
