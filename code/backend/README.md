# PWDSA Backend

FastAPI service hosting the trained RandomForest classifier and an OpenAI
reasoning layer. Called by the mobile client at `code/mobile/`.

## Layout

```
code/backend/
├── .env.example            ← copy to .env and fill OPENAI_API_KEY
├── requirements.txt
├── README.md
├── app/
│   ├── main.py             ← FastAPI app + routes
│   ├── schemas.py          ← Pydantic request/response
│   └── ml/
│       ├── features.py     ← canonical feature lists
│       ├── trainer.py      ← sklearn + LightGBM training pipeline
│       ├── predictor.py    ← inference wrapper
│       ├── summary.py      ← deterministic EN/AR summary (Spec 3)
│       └── llm.py          ← OpenAI reasoning (Deeper AI Analysis)
├── scripts/
│   └── train.py            ← CLI trainer
└── artifacts/
    ├── model.joblib            ← trained pipeline (committed)
    └── training_report.json    ← CV + test metrics
```

## Setup

```powershell
cd code/backend
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
cp .env.example .env       # then edit .env, set OPENAI_API_KEY
```

## Retrain (optional)

```powershell
./.venv/Scripts/python.exe scripts/train.py
```

Reads `../../data/dataset.csv` by default (15,600 rows). Runs 5-fold
stratified CV on RandomForest vs LightGBM, picks the higher F1-macro, refits
on 80% train, evaluates on 20% held-out test. Saves `artifacts/model.joblib`
+ `artifacts/training_report.json`.

Last run:
- Model: `random_forest`
- CV F1-macro: 0.9805 (± 0.0016)
- Test accuracy: **0.9808**
- Test F1-macro: **0.9828**

## Run the API

```powershell
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` (not `127.0.0.1`) is required so the phone on the same
Wi-Fi / hotspot can reach it.

Open http://127.0.0.1:8000/docs for the interactive Swagger UI.

### Endpoints

| Method | Path              | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | /api/v1/health    | Liveness + model + LLM status            |
| POST   | /api/v1/predict   | Classify a sample                        |
| POST   | /api/v1/explain   | Send sample + prediction → LLM analysis  |

### Sample /predict request

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
  "lithology": "sandstone",
  "pH": 7.6,
  "temperature_C": 55.0,
  "GRSS": 82.0,
  "language": "en"
}
```

`CRI` and `SRI` are computed from training-set medians server-side when
omitted — so the mobile form doesn't ask for them.

### Sample /predict response

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

Set `"language": "ar"` anywhere for the Arabic variant.

### /explain

Pass the full prediction + the original inputs to get a 3-4 sentence
engineer-grade justification from `gpt-5.4-mini`. Errors return structured
codes (`auth_error`, `rate_limited`, `timeout`, `network`, `not_configured`,
`upstream`) so the client can show a specific message.
