# PWDSA — Produced Water Decision-Support Application

Senior Project, KFUPM · Term 251 · Team M084
(PETE · CHE · GEO · SWE).

Given a produced-water sample, the system recommends one of four actions:
**Inject**, **Treat then inject**, **Disposal**, or **Injection not suitable**.
A supervised RandomForest classifier (98% test accuracy) makes the primary
decision; an LLM layer adds a deeper engineer-grade justification on demand.

## Repository layout

```
Final SP implementation/
├── README.md              ← you are here
├── .gitignore
│
├── docs/                  ← project deliverable documents
│   ├── Scope Form.docx
│   └── Specifications.xlsx
│
├── data/                  ← training data (single source of truth)
│   └── dataset.csv
│
└── code/                  ← all running code lives here
    ├── backend/           ← FastAPI + ML + LLM (Python)
    │   ├── README.md
    │   ├── .env.example       ← copy to .env, fill OPENAI_API_KEY
    │   ├── requirements.txt
    │   ├── app/
    │   │   ├── main.py        ← FastAPI routes
    │   │   ├── schemas.py     ← Pydantic request/response
    │   │   └── ml/
    │   │       ├── features.py    ← feature lists
    │   │       ├── trainer.py     ← sklearn + LightGBM training
    │   │       ├── predictor.py   ← inference wrapper
    │   │       ├── summary.py     ← deterministic EN/AR summary
    │   │       └── llm.py         ← OpenAI reasoning layer
    │   ├── scripts/
    │   │   └── train.py       ← CLI: trains + saves model
    │   └── artifacts/
    │       ├── model.joblib       ← trained pipeline (committed)
    │       └── training_report.json
    │
    └── mobile/            ← Expo / React Native client
        ├── README.md
        ├── App.js
        ├── app.json
        ├── package.json
        └── src/
            ├── i18n/              ← EN + AR catalogs + context
            ├── theme/             ← dark / light palette + toggle
            ├── services/
            │   ├── config.js      ← API URL
            │   ├── api.js         ← predict() + explain() calls
            │   └── samples.js     ← 🎲 auto-fill samples
            ├── components/        ← Card, FormField, SegmentedSelect
            └── screens/
                └── DashboardScreen.js
```

## End-to-end flow

```
 ┌────────────────┐ POST /api/v1/predict  ┌──────────────────────────────┐
 │  Expo Go app   │ ────────────────────▶ │  code/backend (FastAPI)       │
 │ (Android phone)│ ◀──────────────────── │  ├─ RandomForest (sklearn)    │
 │                │  decision + probs     │  ├─ EN/AR deterministic summary│
 │ ⋯ user taps    │                       │  └─ OpenAI gpt-5.4-mini       │
 │ "🧠 Deeper AI" │ ────────────────────▶ │     (for /api/v1/explain)     │
 │                │ ◀──────────────────── │                               │
 │                │  engineer analysis    └──────────────────────────────┘
 └────────────────┘  (3-4 sentences)
```

## Quick start

### 1. Start the backend
```powershell
cd code/backend
# First time only:
#   cp .env.example .env    (then edit .env, paste your real OPENAI_API_KEY)
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Swagger UI: http://127.0.0.1:8000/docs
Full details: [code/backend/README.md](code/backend/README.md)

### 2. Start the mobile app
```powershell
cd code/mobile
$env:EXPO_PUBLIC_API_URL = "http://<your-PC-LAN-IP>:8000"
npx expo start --lan
```
Scan the QR code in **Expo Go** on your phone, or enter `exp://<PC-IP>:8081`
manually. The phone must be on the same Wi-Fi / hotspot as the PC.
Full details: [code/mobile/README.md](code/mobile/README.md)

### 3. Retrain the model (optional)
```powershell
cd code/backend
./.venv/Scripts/python.exe scripts/train.py
```
Reads `data/dataset.csv`, writes a new `artifacts/model.joblib`.

## Model performance

| Metric        | Value |
|---------------|-------|
| Dataset size  | 15,600 rows × 19 features |
| CV F1-macro   | 0.9805 ± 0.0016 |
| Test accuracy | **0.9808** |
| Test F1-macro | **0.9828** |
| Chosen model  | RandomForest (beat LightGBM) |

## Status against Team M084 specifications

| Item                                         | Status |
|----------------------------------------------|--------|
| Spec 2 — ≥ 2,000 training rows               | ✅ 15,600 |
| Spec 3 — 1–2 sentence plain-language summary | ✅ deterministic + LLM |
| Spec 7 — Decision coverage 100 %             | ✅ classifier always outputs 1 of 4 |
| Spec 11 / Int-Spec 4 — EN/AR parity          | ✅ UI + summary + LLM bilingual |
| Int-Spec 1 — Unified risk-based output       | ✅ decision + confidence + probability bars |
| Int-Spec 5 — Automated input vetting         | ✅ Pydantic bounds (server) + React (client) |

## Security

- `**/.env` is gitignored; only `.env.example` is committed.
- OpenAI key has a prepaid cap set in the OpenAI dashboard.
- Input validation is authoritative on the server side (Pydantic).
- CORS is wide-open for local-LAN development; lock down before any
  public deployment.
