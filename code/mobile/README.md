# PWDSA Mobile

Expo / React Native client for the PWDSA backend. Bilingual (EN/AR), dark
+ light themes, and a fully interactive 2D well-injection simulation.

The codebase has been re-organized into small, focused components — the
heaviest file is the dashboard screen at ~300 lines and every other file
sits well under 300.

---

## Layout

```
code/mobile/
├── README.md
├── App.js                                 ← root component (theme + i18n providers)
├── app.json                               ← Expo metadata
├── package.json                           ← deps incl. react-native-svg + slider
├── index.js                               ← Expo entry
└── src/
    ├── i18n/
    │   ├── index.js                       ← I18nProvider + useI18n hook
    │   ├── en.js                          ← English catalog (incl. tip* tooltip text)
    │   └── ar.js                          ← Arabic catalog (translations from spec PDF)
    ├── theme/
    │   └── index.js                       ← dark + light palettes + toggle
    ├── domain/
    │   ├── fields.js                      ← single source of truth for form metadata
    │   ├── validators.js                  ← number / range / required validators
    │   └── payload.js                     ← form values → API payload
    ├── services/
    │   ├── config.js                      ← default backend URL
    │   ├── api.js                         ← predict() + explain() over fetch
    │   └── samples.js                     ← stratified auto-fill samples
    ├── components/
    │   ├── Card.js                        ← rounded card with optional title + tooltip
    │   ├── FormField.js                   ← labelled input + "?" tooltip
    │   ├── SegmentedSelect.js             ← pill-style selector (lithology)
    │   ├── InfoTooltip.js                 ← "?" badge + popup modal
    │   ├── FormSection.js                 ← renders a section from `domain/fields.js`
    │   ├── Header.js                      ← top bar
    │   ├── AutoFillButton.js              ← 🎲 auto-fill button
    │   ├── ApiSettingsModal.js            ← edit backend URL at runtime
    │   ├── results/
    │   │   ├── ResultCard.js              ← composite results card
    │   │   ├── ProbabilityBars.js         ← class probability bars
    │   │   ├── AlertsCard.js              ← porosity / permeability / injectivity bullets
    │   │   ├── TreatmentCard.js           ← CHE treatment recommendation
    │   │   └── DeeperAnalysisPanel.js     ← LLM CTA + visualize button + result
    │   └── visualization/
    │       ├── VisualizationModal.js      ← full-screen modal with sliders + scene
    │       ├── WellScene.js               ← composes the SVG scene
    │       ├── SliderRow.js               ← labeled slider with chip
    │       ├── StateBanner.js             ← Safe / Marginal / Fracture banner
    │       ├── Legend.js                  ← color-swatch legend
    │       ├── LithologyPicker.js         ← pill picker for lithology
    │       └── scene/
    │           ├── Sky.js                 ← clouds + sky background
    │           ├── Surface.js             ← rig + tank silhouettes + grass
    │           ├── Layers.js              ← soil + aquifer + reservoir bands
    │           ├── Wellbore.js            ← casing + fluid + bubbles
    │           └── Fractures.js           ← branching jagged cracks
    └── screens/
        └── DashboardScreen.js             ← thin orchestrator
```

---

## Tech stack

| Layer            | Library / Tool                                            |
|------------------|-----------------------------------------------------------|
| App platform     | **Expo** SDK 54 (managed workflow)                        |
| Framework        | **React 19** + **React Native 0.81**                      |
| Navigation       | (single screen — no router required)                      |
| HTTP             | Built-in `fetch` with manual `AbortController` for timeout |
| State            | Local `useState` + a small `I18nContext` and `ThemeContext`|
| Styling          | `StyleSheet.create` per file (no global CSS)              |
| Bilingual        | EN/AR catalogs + `lang === "ar"` controls `direction:rtl` |
| 2D graphics      | **react-native-svg** (vector primitives + paths)          |
| Sliders          | **@react-native-community/slider**                        |
| Modals           | Built-in `<Modal>` (transparent, slide / fade)            |

---

## Setup

```powershell
cd code/mobile
npm install         # picks up react-native-svg + slider
```

If `npm install` errors, run the Expo-blessed installer instead so the
versions match SDK 54 exactly:

```powershell
npx expo install react-native-svg @react-native-community/slider
```

---

## How to run (phone + PC on the same network)

### 1. Network — put phone and PC on the same LAN

Easiest: **enable Personal Hotspot on your phone, connect the PC to that
hotspot Wi-Fi**. Now the phone and PC are on the same subnet with the
phone as the gateway.

### 2. Find your PC's IP on the hotspot network

In PowerShell:

```powershell
ipconfig
```

Look under "Wireless LAN adapter Wi-Fi" → `IPv4 Address` (e.g.
`192.168.43.12` or `172.20.10.3`). Write it down.

### 3. Start the backend, bound to all interfaces

```powershell
cd "D:/Desktop/Final SP implementation/code/backend"
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

> `--host 0.0.0.0` (not `127.0.0.1`) lets the phone reach it.

**Windows Firewall:** if you missed the first-time prompt, run as admin:

```powershell
New-NetFirewallRule -DisplayName "PWDSA API" -Direction Inbound `
  -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

### 4. Start Expo (second terminal)

```powershell
cd "D:/Desktop/Final SP implementation/code/mobile"
$env:EXPO_PUBLIC_API_URL = "http://192.168.43.12:8000"   # your PC IP
npx expo start --lan
```

### 5. On the phone

- Open **Expo Go** → **Scan QR code** → point at the terminal QR.
- The app loads over your hotspot/LAN.
- You can also override the backend URL at runtime from the **⚙ settings**
  icon in the header.

---

## How the screen is composed

```
DashboardScreen
├── Header                            ← title + theme + ⚙ + lang toggle
├── AutoFillButton                    ← 🎲 randomly fills the form
├── FormSection × 3                   ← Injection / Formation / Chemistry
│     └── FormField (or SegmentedSelect)  ← each label has a "?" InfoTooltip
├── "Show Results" button
├── ApiErrorCard (conditional)
├── ResultCard
│     ├── decision + confidence + summary
│     ├── ProbabilityBars
│     ├── AlertsCard                  ← porosity / permeability / injectivity
│     ├── TreatmentCard (conditional) ← only when "Treat then inject"
│     └── DeeperAnalysisPanel
│           ├── 🧠 Deeper AI Analysis  → POST /api/v1/explain
│           └── Visualize the Situation → opens VisualizationModal
└── ApiSettingsModal & VisualizationModal (full-screen)
```

---

## Bilingual UI

Every user-visible string is keyed in `src/i18n/en.js` and `src/i18n/ar.js`.
The Arabic translations are aligned with the **"Suggested Arabic
translation"** lines in `fields info.pdf`. Tooltip text (`tip*` keys) is
adapted from the **"Short concise description"** lines in the same
document, edited lightly for grammar without changing the meaning.

The screen sets `direction: "rtl"` when `lang === "ar"`, so labels,
sliders, and buttons mirror correctly.

---

## Field tooltips

Every input now has a small "?" badge next to its label. Tapping it
opens a centered modal that explains the field in the active language.

The same mechanism is used for **section titles** (Injection & Water /
Formation & Fluid Properties / Water Chemistry) so users can also see a
short paragraph about the section's purpose.

The tooltip component (`components/InfoTooltip.js`) is generic and can be
attached to any element via the `tooltip` prop on `Card`, `FormField`,
or `SegmentedSelect`.

---

## Alerts panel

After every prediction the response includes three deterministic bullets
computed by the backend:

* **Porosity** — `low` / `good` / `excellent`
* **Permeability** — `low` / `good` / `excellent`
* **Injectivity Index** — `poor` / `moderate` / `good` / `excellent`
  (computed as `injection_rate_bwpd / (P_inj − P_reservoir)`)

The colored dot uses semantic theme tokens — green for safe outcomes,
amber for marginal, red for poor.

---

## CHE treatment recommendation

When the classifier returns `"Treat then inject"`, the response also
includes a `treatment` block; the mobile UI renders it as a card with:

* The top contributor name (e.g. "Strontium (Sr)").
* The recommended treatment substance (DTPMP / Imidazoline / Sodium
  Nitrate).
* A short sentence describing **when to use** it.
* A **PubChem hazard** button that opens the GHS classification page in
  the device's browser via `Linking.openURL(...)`.

---

## Interactive visualization

Tapping **"Visualize the Situation"** under the AI section opens a
full-screen modal showing a 2D cross-section of the well + reservoir.
The scene is built from small, single-purpose SVG components:

| Component       | What it draws                                              |
|----------------|-------------------------------------------------------------|
| `Sky.js`       | Pale-blue sky band + 3 fluffy white clouds                 |
| `Surface.js`   | Grass strip + black derrick silhouette + 2 tank silhouettes |
| `Layers.js`    | Top brown soil + blue aquifer + dark-brown reservoir bands |
| `Wellbore.js`  | Vertical casing + 90° elbow + horizontal section + bubbles |
| `Fractures.js` | Branching jagged cracks rendered when `P_inj > MAIP`        |

`WellScene.js` lays them out into one `<Svg>`. The fracture pattern's
size and count scale with the **fracture margin** = `(P_inj − MAIP) / MAIP`:

* margin ≤ 0   → no fractures, **Safe injection** banner.
* −0.05 < margin < 0 → no fractures, **Approaching fracture pressure** banner.
* margin ≥ 0   → cracks appear, **Reservoir fracturing — STOP injection** banner.

Sliders + a lithology pill picker let users explore "what if" scenarios
without re-running the API — the SVG re-paints in real time as the user
drags. Sliders cover:

* Injection Pressure
* MAIP (max allowable injection pressure)
* Reservoir Pressure
* Injection Rate (controls bubble density inside the pipe)
* Water Cut (subtly tints the fluid darker, reflecting more produced water)

The modal seeds its sliders from the values the user just submitted, so
the simulation always starts from the actual current scenario; a "Reset"
button snaps everything back.

---

## Auto-fill samples

`services/samples.js` ships **11 stratified samples** — at least one for
every (decision × lithology) combination in the dataset. Each sample now
also carries `reservoirPressure` so the new alert + visualization start
with realistic numbers immediately.

---

## API client

`services/api.js` is a thin wrapper around `fetch`:

* `predict(baseUrl, payload)` — `POST /api/v1/predict`
* `explain(baseUrl, body)` — `POST /api/v1/explain` with a 25-second
  timeout; rejected promises carry a structured `code` (`network`,
  `timeout`, `auth_error`, `rate_limited`, `not_configured`, `upstream`,
  `http_XXX`) that the dashboard maps to a localized message.
* `health(baseUrl)` — `GET /api/v1/health` (used for diagnostics).

---

## Theming

`src/theme/index.js` defines a dark and a light palette and a tiny
`ThemeProvider`/`useTheme` pair. Components only read `colors.*` so
swapping themes is a one-state-update; the ☾/☀ icon in the header
toggles the mode at runtime.

The palettes also expose `alertSuccess` / `alertWarning` / `alertDanger`
so the AlertsCard severity dots stay readable in both themes.

---

## Troubleshooting

| Symptom                                                  | Fix |
|---------------------------------------------------------|-----|
| "Could not reach the backend" in the app                | Double-check your PC IP in ⚙. Make sure backend is running with `--host 0.0.0.0`. Make sure Windows firewall allowed port 8000 for private networks. |
| Expo Go says "Something went wrong" loading the bundle  | Phone and PC aren't on the same LAN. Re-check the hotspot connection, or use `npx expo start --tunnel` (slower but works across different networks). |
| Visualization shows a blank box                          | `react-native-svg` was not installed — run `npx expo install react-native-svg`. |
| Slider does not move                                     | `@react-native-community/slider` was not installed — run `npx expo install @react-native-community/slider`. |
| Arabic looks garbled                                     | Make sure you're on the latest Expo Go — SDK 54 is required. |
