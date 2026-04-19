# PWDSA — Produced Water Decision-Support Application

Senior Project, KFUPM, Term 251 — Team M084
(PETE · CHE · GEO · SWE).

The system recommends a treatment/reuse/disposal decision for a produced-water
sample. A supervised machine-learning classifier makes the primary decision,
and an LLM layer produces a deeper engineer-level justification on demand.

## Layout

```
Final SP implementation/
├── README.md                    ← you are here
├── .gitignore                   ← excludes .env, venvs, node_modules, etc.
├── 251-Scope Form-TEAMM084 (for submitting).docx
├── 251-Specifications-TEAMM084 (1).xlsx
├── datasetSP.xlsx
├── datasetSP_CSV.csv            ← training data (15,600 rows)
│
├── backend/                     ← FastAPI + ML + LLM
│   ├── README.md
│   ├── .env.example             ← copy to .env, fill OPENAI_API_KEY
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py              ← FastAPI app + routes
│   │   ├── schemas.py           ← Pydantic request/response
│   │   └── ml/
│   │       ├── features.py      ← canonical feature lists
│   │       ├── trainer.py       ← training pipeline (sklearn + LightGBM cmp)
│   │       ├── predictor.py     ← inference wrapper
│   │       ├── summary.py       ← EN/AR deterministic plain-language summary
│   │       └── llm.py           ← OpenAI LLM reasoning layer
│   ├── scripts/
│   │   └── train.py             ← CLI: trains + saves model.joblib
│   └── artifacts/
│       ├── model.joblib         ← trained RandomForest pipeline
│       └── training_report.json ← CV + test metrics
│
├── mobile/                      ← Expo / React Native client
│   ├── README.md                ← run instructions for Expo Go
│   ├── app.json
│   ├── App.js
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── i18n/                ← EN + AR catalogs + React context
│       ├── theme/               ← dark/light palette + toggle
│       ├── services/
│       │   ├── config.js        ← API base URL
│       │   ├── api.js           ← predict() and explain() calls
│       │   └── samples.js       ← 11 stratified rows for the 🎲 auto-fill
│       ├── components/          ← Card, FormField, SegmentedSelect
│       └── screens/
│           └── DashboardScreen.js
│
└── thecode/senior_project/      ← (legacy) original Flutter prototype;
                                   kept for reference, not part of the
                                   shipped product.
```

## End-to-end architecture

```
 ┌──────────────────┐    POST /api/v1/predict   ┌─────────────────────────┐
 │   Expo Go app    │ ────────────────────────▶ │  FastAPI backend         │
 │ (Android phone)  │ ◀──────────────────────── │  ├─ RandomForest (sklearn)│
 │                  │     decision + probs      │  ├─ EN/AR summary templ. │
 │   ⋯ user taps    │                           │  └─ OpenAI chat.completions│
 │   "🧠 Deeper AI" │ ────────────────────────▶ │     (gpt-5.4-mini)        │
 │                  │ ◀──────────────────────── │                           │
 │                  │    engineer-level         └─────────────────────────┘
 │                  │    analysis (3-4 sentences)
 └──────────────────┘
```

## Running the system

### 1. Backend
```powershell
cd backend
cp .env.example .env    # then edit .env and put your real OPENAI_API_KEY
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Full details in [backend/README.md](backend/README.md).

### 2. Mobile (Expo Go)
```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL = "http://<PC-IP>:8000"
npx expo start
```
Scan the QR in Expo Go on your phone, or enter `exp://<PC-IP>:8081` manually.
Full details in [mobile/README.md](mobile/README.md).

## Model performance

Training dataset: 15,600 rows from `datasetSP_CSV.csv`, stratified 80/20
train/test split plus 5-fold stratified cross-validation on the train set.

| Metric        | Value  |
|---------------|--------|
| CV F1-macro   | 0.9805 (+/- 0.0016) |
| Test accuracy | **0.9808** |
| Test F1-macro | **0.9828** |
| Chosen model  | RandomForest (beat LightGBM on F1-macro) |

Retrain any time with `python backend/scripts/train.py`.

## Status against the Team M084 Specifications

| Item                                         | Status |
|----------------------------------------------|--------|
| Spec 2 — ≥ 2000 training rows                | ✅ 15,600 |
| Spec 3 — 1–2 sentence plain-language summary | ✅ deterministic + LLM deeper analysis |
| Spec 7 — Decision coverage 100 %             | ✅ classifier always outputs one of 4 classes |
| Spec 11 / Int-Spec 4 — EN/AR parity          | ✅ UI + deterministic summary + LLM in both languages |
| Int-Spec 1 — Unified risk-based output       | ✅ decision + confidence + probability bars |
| Int-Spec 5 — Automated input vetting         | ✅ Pydantic bounds server-side + client-side |
| Everything else                              | ⚪ see the Constraints/Spec audit |

## Security notes

- **Never commit `.env`.** The `.gitignore` at the repo root excludes it.
- The OpenAI key has a $10 prepaid cap set in the OpenAI dashboard — worst-case
  blast radius if the key leaks.
- Input validation happens twice: client-side (React) and server-side
  (Pydantic) — the second is the authoritative one.
- CORS is open for development convenience. Lock it down before any public
  deployment.
