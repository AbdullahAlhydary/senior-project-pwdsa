# PWDSA Backend

FastAPI service hosting the trained LightGBM classifier, deterministic
engineering services (alerts + CHE treatment recommendations), and an
OpenAI reasoning layer. Called by the mobile client at `code/mobile/`.

The codebase has been re-organized into small, single-purpose modules so
no file exceeds ~250 lines and each module has one clear responsibility.

---

## Layout

```
code/backend/
├── .env.example                       ← copy to .env and fill OPENAI_API_KEY
├── requirements.txt
├── README.md
├── app/
│   ├── __init__.py
│   ├── main.py                        ← FastAPI app + lifespan + CORS + router mounting
│   ├── config.py                      ← env loading + path constants
│   ├── routes/
│   │   ├── health.py                  ← GET  /api/v1/health
│   │   ├── predict.py                 ← POST /api/v1/predict (decision + alerts + treatment)
│   │   └── explain.py                 ← POST /api/v1/explain (LLM analysis)
│   ├── schemas/
│   │   ├── common.py                  ← shared Literal types (Lithology, Language)
│   │   ├── prediction.py              ← PredictionRequest/Response, AlertResult, TreatmentRecommendation
│   │   ├── explain.py                 ← ExplainRequest/Response
│   │   └── health.py                  ← HealthResponse
│   ├── ml/
│   │   ├── features.py                ← canonical feature lists (single source of truth)
│   │   ├── trainer.py                 ← orchestrator that composes training/* helpers
│   │   ├── predictor.py               ← inference wrapper around the joblib bundle
│   │   └── training/
│   │       ├── data.py                ← CSV loader + column validation
│   │       ├── preprocess.py          ← median-impute + scale + one-hot
│   │       ├── candidates.py          ← RandomForest + LightGBM configs
│   │       ├── evaluate.py            ← stratified-CV + held-out test metrics
│   │       └── report.py              ← TrainingReport dataclass
│   └── services/
│       ├── summary.py                 ← deterministic EN/AR 1-2 sentence verdict
│       ├── alerts.py                  ← porosity/permeability/injectivity rules (PETE)
│       ├── che_treatment.py           ← top-contributor scoring + treatment lookup (CHE)
│       └── llm/
│           ├── service.py             ← async OpenAI wrapper
│           ├── prompts.py             ← EN/AR system prompts
│           └── errors.py              ← typed LLMError → HTTP mapping
├── scripts/
│   └── train.py                       ← CLI trainer
└── artifacts/
    ├── model.joblib                   ← trained pipeline (committed)
    └── training_report.json           ← CV + test metrics
```

---

## Tech stack

| Layer            | Library / Tool                                |
|------------------|-----------------------------------------------|
| Web framework    | **FastAPI** + **Uvicorn** (ASGI)              |
| Validation       | **Pydantic v2** (Literal types, Field bounds) |
| ML pipeline      | **scikit-learn** (Pipeline, ColumnTransformer)|
| Models tested    | **RandomForestClassifier**, **LGBMClassifier**|
| Imputation       | `SimpleImputer(median / most_frequent)`       |
| Scaling / encoding | `StandardScaler` + `OneHotEncoder`          |
| Persistence      | **joblib** (single bundle artifact)           |
| LLM client       | **openai** (async)                            |
| Env loading      | **python-dotenv**                             |
| HTTP testing     | **fastapi.testclient** (built-in)             |

---

## Setup

```powershell
cd code/backend
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
cp .env.example .env       # then edit .env, set OPENAI_API_KEY
```

---

## Retrain the model

```powershell
./.venv/Scripts/python.exe scripts/train.py
```

Reads `../../data/dataset.csv` by default (15,600 rows). The pipeline:

1. `training/data.py` validates and loads the dataset (drops nothing —
   missing columns raise an error so silent regressions can't ship).
2. `training/preprocess.py` builds a `ColumnTransformer` that median-imputes
   + scales numeric features and most-frequent-imputes + one-hot encodes
   the lithology column.
3. `training/candidates.py` instantiates RandomForest + LightGBM with
   `class_weight="balanced"` (decisions are imbalanced).
4. `training/evaluate.py` runs **5-fold StratifiedKFold cross-validation**
   on each candidate, scoring **F1-macro** (treats every class equally).
5. `trainer.py` selects the higher-scoring model, refits on the 80%
   training split, evaluates on the 20% held-out test split, and saves
   `artifacts/model.joblib` + `artifacts/training_report.json`.

### Latest training run (with `reservoir_pressure_psi`)

| Metric              | Value                |
|---------------------|----------------------|
| Selected model      | **LightGBM**          |
| CV F1-macro mean    | 0.9865                |
| CV F1-macro std     | 0.0023                |
| Test accuracy       | **0.9846** (3120 rows) |
| Test F1-macro       | **0.9855**            |
| Training time       | ~77 s                 |
| Feature count       | 19 (numeric + lithology) |
| Class count         | 4 (Inject / Treat then inject / Disposal / Injection not suitable) |

---

## Run the API

```powershell
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` (not `127.0.0.1`) is required so a phone on the same
Wi-Fi / hotspot can reach it. Open http://127.0.0.1:8000/docs for the
interactive Swagger UI.

---

## Endpoints

| Method | Path              | Description                                          |
|--------|-------------------|------------------------------------------------------|
| GET    | /api/v1/health    | Liveness + model + LLM status                        |
| POST   | /api/v1/predict   | Classify a sample + alerts + treatment + summary     |
| POST   | /api/v1/explain   | Send sample + prediction → LLM analysis (3-4 sents)  |

### Sample `/predict` request

```json
{
  "water_cut_fraction": 0.5,
  "reservoir_pressure_psi": 3500,
  "MAIP_psi": 7000,
  "required_injection_pressure_psi": 4500,
  "porosity_fraction": 0.25,
  "permeability_md": 600,
  "TDS_mg_L": 2500,
  "oil_in_water_ppm": 10,
  "TSS_mg_L": 80,
  "Ca_mg_L": 1200,
  "SO4_mg_L": 280,
  "Ba_mg_L": 0,
  "Sr_mg_L": 165,
  "lithology": "sandstone",
  "pH": 7.9,
  "temperature_C": 50,
  "GRSS": 75,
  "injection_rate_bwpd": 1800,
  "language": "en"
}
```

`CRI` and `SRI` are computed from training-set medians server-side when
omitted — so the mobile form doesn't ask for them. `injection_rate_bwpd`
is **not** a model feature; it is consumed only by the injectivity alert.

### Sample `/predict` response

```json
{
  "decision": "Treat then inject",
  "confidence": 0.99,
  "probabilities": {
    "Disposal": 0.0,
    "Inject": 0.0,
    "Injection not suitable": 0.0,
    "Treat then inject": 0.99
  },
  "summary": "Injection is viable but treatment is advised first — TDS …",
  "model_name": "lightgbm",
  "alerts": [
    { "key": "porosity", "severity": "excellent", "value": 25.0,
      "label_en": "Porosity", "label_ar": "المسامية",
      "detail_en": "Excellent (25.0%)", "detail_ar": "ممتازة (25.0%)" },
    { "key": "permeability", "severity": "excellent", "value": 600.0, "...": "..." },
    { "key": "injectivity", "severity": "moderate", "value": 1.8, "...": "..." }
  ],
  "treatment": {
    "contributor": "Sr",
    "contributor_label_en": "Strontium (Sr)",
    "substance": "DTPMP",
    "when_to_use_en": "Since there is a scaling risk by Strontium …",
    "pubchem_url": "https://pubchem.ncbi.nlm.nih.gov/compound/Diethylenetriaminepenta_methylenephosphonic-acid#section=GHS-Classification",
    "score": 1.0
  }
}
```

Set `"language": "ar"` for Arabic strings in `summary` (alerts + treatment
always include both `_en` and `_ar` so the client picks at render time).

The `treatment` block is `null` when the predicted decision is anything
other than `"Treat then inject"`.

### `/explain`

Pass the full prediction + the original inputs to get a 3-4 sentence
engineer-grade justification from `gpt-5.4-mini`. Errors return structured
codes (`auth_error`, `rate_limited`, `timeout`, `network`, `not_configured`,
`upstream`, `empty_reply`) so the client can show a specific message.

---

## Engineering services (deterministic, no LLM)

### `services/alerts.py` — PETE engineering bullets

| Alert        | Inputs used                                              | Buckets (per spec)                                    |
|-------------|-----------------------------------------------------------|------------------------------------------------------|
| Porosity    | `porosity_fraction`                                       | `<10% low`, `10-20% good`, `>20% excellent`          |
| Permeability| `permeability_md`                                         | `<10 mD low`, `10-100 mD good`, `>100 mD excellent`  |
| Injectivity | `injection_rate_bwpd / (P_inj − P_reservoir)`             | `<10 poor`, `20-40 good`, `>50 excellent`            |

If the differential pressure is non-positive, the injectivity alert
returns `severity="n_a"` with an explanatory message (no crash).

### `services/che_treatment.py` — top-contributor selection

Each driver input is normalized to a 0-1 "score" using a clamp formula
specified by the CHE deliverable. The highest score is chosen as the
"top contributor"; the static lookup table maps:

| Contributor    | Substance        | Reason                                  |
|---------------|-------------------|-----------------------------------------|
| Sr / Ca / SO4 | DTPMP (Phosphonates)| Mineral-scale risk                    |
| pH (acidic) / Temp / TDS | Imidazoline | Corrosion risk                  |
| TSS           | Sodium Nitrate    | Suspended-solid fouling                 |

Each entry carries a stable PubChem hazard URL the mobile UI opens via
`Linking.openURL` so users can review the GHS classification.

---

## Module dependency map

```
            ┌─────────────────────────────────────────────┐
            │                main.py                      │
            └──┬─────────────────┬──────────────────┬─────┘
               ▼                 ▼                  ▼
        routes/health     routes/predict     routes/explain
               │                 │                  │
               │                 ▼                  ▼
               │        services/summary    services/llm/service
               │        services/alerts             │
               │        services/che_treatment      ▼
               ▼                 │            services/llm/prompts
        ml/predictor             ▼            services/llm/errors
               │           ml/predictor
               ▼                 │
       artifacts/model.joblib    ▼
                          ml/features
```

`scripts/train.py` runs independently and only writes
`artifacts/model.joblib` + `training_report.json`; it does not import the
FastAPI layers.
