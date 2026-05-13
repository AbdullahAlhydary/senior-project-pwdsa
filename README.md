# PWDSA — Produced Water Decision-Support Application

Senior Project, KFUPM · Term 251-252 · Team M084
(PETE · CHE · GEO · SWE).

Given a produced-water sample, the system recommends one of four actions:
**Inject**, **Treat then inject**, **Disposal**, or **Injection not
suitable**. A supervised LightGBM classifier (98.5% test accuracy) makes
the primary decision; rule-based engineering alerts and a chemical
treatment recommender add deterministic interpretability; an LLM layer
adds an engineer-grade justification on demand; and a 2D interactive
simulation lets users explore how the well behaves between safe operation
and reservoir fracturing.

For direct installation of the Android app, use the secure link below. The official release on the Google Play Store will be available soon:
https://expo.dev/accounts/abdullahalhydary/projects/pwdsa/builds/ceb49c7e-96d6-449f-ba0c-37368f9196ed

---

## Repository layout

```
Final SP implementation/
├── README.md              ← you are here
├── .gitignore
│
├── Alerting.pdf                                  ← spec doc — alerts logic
├── What is needed for CHE-treat then inject.docx ← spec doc — treatment logic
├── visualization instructions.docx               ← spec doc — visualization
├── fields info.pdf                               ← spec doc — field tooltips + AR
│
├── data/                  ← training data (single source of truth)
│   └── dataset.csv        ← 15,600 rows × 22 columns (incl. reservoir_pressure_psi)
│
└── code/                  ← all running code lives here
    ├── backend/           ← FastAPI + ML + LLM (Python)
    │   ├── README.md
    │   ├── .env.example       ← copy to .env, fill OPENAI_API_KEY
    │   ├── requirements.txt
    │   ├── app/
    │   │   ├── __init__.py
    │   │   ├── main.py        ← FastAPI app boot
    │   │   ├── config.py      ← env + path constants
    │   │   ├── routes/
    │   │   │   ├── health.py      ← GET /api/v1/health
    │   │   │   ├── predict.py     ← POST /api/v1/predict
    │   │   │   └── explain.py     ← POST /api/v1/explain
    │   │   ├── schemas/
    │   │   │   ├── common.py      ← shared Literal types
    │   │   │   ├── prediction.py  ← PredictionRequest/Response + AlertResult + TreatmentRecommendation
    │   │   │   ├── explain.py     ← ExplainRequest/Response
    │   │   │   └── health.py      ← HealthResponse
    │   │   ├── ml/
    │   │   │   ├── features.py        ← canonical feature list
    │   │   │   ├── trainer.py         ← orchestrator (composes training/*)
    │   │   │   ├── predictor.py       ← inference wrapper
    │   │   │   └── training/
    │   │   │       ├── data.py            ← CSV loader + column validation
    │   │   │       ├── preprocess.py      ← median-impute + scale + one-hot
    │   │   │       ├── candidates.py      ← RandomForest + LightGBM configs
    │   │   │       ├── evaluate.py        ← CV + held-out test metrics
    │   │   │       └── report.py          ← TrainingReport dataclass
    │   │   └── services/
    │   │       ├── summary.py         ← deterministic EN/AR 1-2 sentence verdict
    │   │       ├── alerts.py          ← porosity/permeability/injectivity rules
    │   │       ├── che_treatment.py   ← top-contributor scoring + treatment lookup
    │   │       └── llm/
    │   │           ├── service.py     ← async OpenAI wrapper
    │   │           ├── prompts.py     ← EN/AR system prompts
    │   │           └── errors.py      ← typed LLMError
    │   ├── scripts/
    │   │   └── train.py               ← CLI: trains + saves model
    │   └── artifacts/
    │       ├── model.joblib           ← trained pipeline (committed)
    │       └── training_report.json   ← CV + test metrics
    │
    └── mobile/            ← Expo / React Native client
        ├── README.md
        ├── App.js
        ├── app.json
        ├── package.json   ← +react-native-svg, +@react-native-community/slider
        ├── index.js
        └── src/
            ├── i18n/                  ← EN + AR catalogs (incl. tooltip text) + context
            ├── theme/                 ← dark / light palette + toggle
            ├── domain/
            │   ├── fields.js          ← single source for field metadata (label/tooltip/api)
            │   ├── validators.js      ← number/range/required validators
            │   └── payload.js         ← form values → API payload
            ├── services/
            │   ├── config.js          ← API URL
            │   ├── api.js             ← predict() + explain() calls
            │   └── samples.js         ← 🎲 auto-fill samples
            ├── components/
            │   ├── Card.js                ← card wrapper with optional tooltip
            │   ├── FormField.js           ← labelled input with "?" tooltip
            │   ├── SegmentedSelect.js     ← pill-style selector (used for lithology)
            │   ├── InfoTooltip.js         ← "?" popup modal explaining a field
            │   ├── FormSection.js         ← renders one section from `domain/fields.js`
            │   ├── Header.js              ← top bar (title + theme + settings + lang)
            │   ├── AutoFillButton.js      ← 🎲 auto-fill button
            │   ├── ApiSettingsModal.js    ← edit backend URL at runtime
            │   ├── results/
            │   │   ├── ResultCard.js          ← composite results panel
            │   │   ├── ProbabilityBars.js     ← class probability bars
            │   │   ├── AlertsCard.js          ← porosity/permeability/injectivity bullets
            │   │   ├── TreatmentCard.js       ← CHE treatment recommendation
            │   │   └── DeeperAnalysisPanel.js ← LLM CTA + visualize button + result
            │   └── visualization/
            │       ├── VisualizationModal.js  ← full-screen modal with sliders + scene
            │       ├── WellScene.js           ← composes the SVG scene
            │       ├── SliderRow.js           ← labeled slider with chip
            │       ├── StateBanner.js         ← Safe / Marginal / Fracture banner
            │       ├── Legend.js              ← color-swatch legend
            │       ├── LithologyPicker.js     ← pill picker for lithology
            │       └── scene/
            │           ├── Sky.js             ← clouds + sky background
            │           ├── Surface.js         ← rig + tank silhouettes + grass
            │           ├── Layers.js          ← soil + aquifer + reservoir bands
            │           ├── Wellbore.js        ← casing + fluid + bubbles
            │           └── Fractures.js       ← branching jagged cracks
            └── screens/
                └── DashboardScreen.js     ← thin orchestrator (~300 lines)
```

---

## End-to-end flow

```
 ┌────────────────┐   POST /api/v1/predict     ┌──────────────────────────────────┐
 │  Expo Go app   │ ─────────────────────────▶ │  code/backend (FastAPI)          │
 │ (Android phone)│                            │  ├─ LightGBM (sklearn pipeline)   │
 │                │ ◀───────────────────────── │  ├─ EN/AR deterministic summary   │
 │                │  decision + probs +        │  ├─ porosity/permeability/        │
 │                │  alerts + treatment +      │  │  injectivity alerts            │
 │                │  summary                   │  └─ CHE treatment lookup          │
 │                │                            │     (only if "Treat then inject") │
 │ user taps      │                            │                                  │
 │ "🧠 Deeper AI" │ ─── POST /api/v1/explain ─▶│     OpenAI gpt-5.4-mini          │
 │                │ ◀───────────────────────── │     (3-4 sentence engineer reply) │
 │                │                            └──────────────────────────────────┘
 │                │
 │ user taps      │   (no network — runs entirely on device)
 │ "Visualize"    │ ──▶ 2D SVG simulation with sliders & dropdown
 │                │     • injection pressure / MAIP / reservoir pressure
 │                │     • injection rate (controls bubbles)
 │                │     • water cut (tints the fluid)
 │                │     • lithology picker
 │                │     • live state banner: Safe / Marginal / Fracture
 │                │     • fractures drawn when P_inj > MAIP, scaling with overshoot
 └────────────────┘
```

---

## Quick start

### 1. Start the backend

```powershell
cd code/backend
# First time only:
#   cp .env.example .env       (then edit .env, paste your real OPENAI_API_KEY)
#   python -m venv .venv
#   ./.venv/Scripts/python.exe -m pip install -r requirements.txt
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Swagger UI: http://127.0.0.1:8000/docs
Full details: [code/backend/README.md](code/backend/README.md)

### 2. Start the mobile app

```powershell
cd code/mobile
# First time only — install JS deps (incl. react-native-svg + slider):
#   npm install
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

---

## Model performance (latest run, includes `reservoir_pressure_psi`)

| Metric        | Value |
|---------------|-------|
| Dataset size  | 15,600 rows × 19 features |
| CV F1-macro   | 0.9865 ± 0.0023 |
| Test accuracy | **0.9846** |
| Test F1-macro | **0.9855** |
| Chosen model  | LightGBM (beat RandomForest) |

---

## Feature additions in this iteration

| Feature                                     | Where it lives                                                         |
|--------------------------------------------|------------------------------------------------------------------------|
| `reservoir_pressure_psi` input + retraining | `app/ml/features.py`, mobile `Injection & Water` section              |
| Per-field "?" tooltips (EN + AR)            | `mobile/src/i18n/{en,ar}.js` (`tip*` keys), `components/InfoTooltip.js`|
| Updated AR translations matching spec PDF   | `mobile/src/i18n/ar.js`                                                |
| Alerts panel (porosity/permeability/inj.)   | `app/services/alerts.py`, `components/results/AlertsCard.js`           |
| CHE treatment recommendation (PubChem URL)  | `app/services/che_treatment.py`, `components/results/TreatmentCard.js` |
| 2D interactive well simulation              | `mobile/src/components/visualization/`                                  |
| Modular code structure (every file < 800 LOC) | `app/{routes,schemas,services,ml/training}` + `mobile/src/components/{visualization,results}` |

---

## Status against Team M084 specifications

| Item                                                | Status |
|-----------------------------------------------------|--------|
| Spec 2 — ≥ 2,000 training rows                      | ✅ 15,600 |
| Spec 3 — 1–2 sentence plain-language summary        | ✅ deterministic + LLM |
| Spec 7 — Decision coverage 100 %                    | ✅ classifier always outputs 1 of 4 |
| Spec 11 / Int-Spec 4 — EN/AR parity                 | ✅ UI + summary + LLM + tooltips bilingual |
| Int-Spec 1 — Unified risk-based output              | ✅ decision + confidence + probability bars + alerts |
| Int-Spec 5 — Automated input vetting                | ✅ Pydantic bounds (server) + React (client) |
| PETE — Hard-coded engineering alerts                | ✅ porosity / permeability / injectivity |
| CHE — Treatment recommendation                      | ✅ DTPMP / Imidazoline / Sodium Nitrate + PubChem hazard link |
| GEO — Visualization with safe ↔ failure transition  | ✅ Interactive 2D SVG cross-section |

---

## Security

- `**/.env` is gitignored; only `.env.example` is committed.
- OpenAI key has a prepaid cap set in the OpenAI dashboard.
- Input validation is authoritative on the server side (Pydantic).
- CORS is wide-open for local-LAN development; lock down before any
  public deployment.
