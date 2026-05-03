// English translation catalog.
//
// `t.tip*` keys hold the small popup explanation shown when the user taps
// the question-mark next to a field label. Translations of these tips
// follow the "Short concise description" lines in `fields info.pdf`,
// lightly edited for grammar and clarity without changing the meaning.
const en = {
  appTitle: "Water Analyzer",
  provideData: "Please provide the required data to view results",
  showResults: "Show Results",
  predicting: "Analyzing sample…",
  results: "Results",
  recommendedDecision: "Recommended Decision",
  confidence: "Confidence",
  probabilities: "Probabilities",
  modelInfo: "Model",
  predictionFailed: "Prediction failed",
  language: "Language",
  english: "English",
  arabic: "العربية",
  cancel: "Cancel",
  save: "Save",
  close: "Close",

  sectionInjection: "Injection & Water",
  sectionFormation: "Formation & Fluid Properties",
  sectionChemistry: "Water Chemistry",

  fieldInjectionPressure: "Injection Pressure (psi)",
  fieldInjectionRate: "Injection Rate (bbl/day)",
  fieldReservoirPressure: "Reservoir Pressure (psi)",
  fieldMAIP: "MAIP (psi)",
  fieldWaterRate: "Water Rate (bbl/day)",
  fieldWaterCut: "Water Cut (0-1)",

  fieldLithology: "Lithology",
  fieldPorosity: "Porosity (0-1)",
  fieldPermeability: "Permeability (mD)",
  fieldGRSS: "GRSS (0-100)",
  fieldTemperature: "Temperature (°C)",

  fieldTDS: "TDS (mg/L)",
  fieldTSS: "TSS (mg/L)",
  fieldOil: "Oil in Water (ppm)",
  fieldPH: "pH (0-14)",
  fieldCa: "Calcium (Ca) (mg/L)",
  fieldSO4: "Sulfate (SO₄) (mg/L)",
  fieldBa: "Barium (Ba) (mg/L)",
  fieldSr: "Strontium (Sr) (mg/L)",
  fieldCRI: "CRI",
  fieldSRI: "SRI",

  lithCarbonate: "Carbonate",
  lithSandstone: "Sandstone",
  lithShale: "Shale",

  // Tooltip text — short, beginner-friendly.
  tipSectionInjection:
    "Injection is the process of pumping water back into the reservoir to keep its pressure high.",
  tipSectionFormation:
    "Characteristics of the reservoir rock and contained fluids that control flow behaviour and production performance.",
  tipSectionChemistry:
    "The composition and quality of the produced water.",

  tipInjectionPressure:
    "How hard we are pushing water into the reservoir.",
  tipInjectionRate:
    "How many barrels of water per day are entering the reservoir.",
  tipReservoirPressure:
    "Static pressure of the fluid currently inside the reservoir.",
  tipMAIP:
    "Maximum Allowable Injection Pressure — the upper safe limit for injection.",
  tipWaterRate:
    "How much water per day is flowing into the reservoir.",
  tipWaterCut:
    "Fraction of the produced fluid that is water (0 to 1).",

  tipLithology:
    "Description of the rock's physical characteristics and composition.",
  tipPorosity:
    "Measure of the void space inside the rock (0 to 1).",
  tipPermeability:
    "Ability of the rock to transmit fluids.",
  tipGRSS:
    "Geological Reinjection Suitability Score — composite score for reinjection suitability (0 to 100).",
  tipTemperature:
    "Temperature of the produced water.",

  tipTDS:
    "Total Dissolved Solids — amount of dissolved salts and minerals in the water.",
  tipTSS:
    "Total Suspended Solids — amount of suspended particles in the water.",
  tipOil:
    "Amount of oil remaining in the produced water.",
  tipPH:
    "Measures how acidic or basic the water is.",
  tipCa:
    "Calcium ion concentration — affects scale risk.",
  tipSO4:
    "Sulfate ion concentration — affects sulfate-scale risk.",
  tipBa:
    "Barium ion concentration — affects barite-scale risk.",
  tipSr:
    "Strontium ion concentration — affects celestite-scale risk.",
  tipCRI:
    "Corrosion Risk Index — corrosion risk score for equipment and the injection system.",
  tipSRI:
    "Scaling Risk Index — scaling risk score for mineral precipitation and blockage.",

  errEmpty: "This field cannot be empty",
  errNonNumeric: "Enter a numeric value",
  errNegative: "Must be ≥ 0",
  errRange: (lo, hi) => `Must be between ${lo} and ${hi}`,
  errSelect: "Please select a value",
  errCannotReach:
    "Could not reach the backend. Is the API running and reachable?",

  apiSettings: "Backend URL",
  apiSettingsHint: "Set this to http://<PC-IP>:8000 for Expo Go on phone.",

  autoFill: "Auto-fill sample",
  autoFillHint: "Randomly fills the form from a representative dataset sample",

  // Alerts panel.
  alerts: "Alerts",
  alertPorosity: "Porosity",
  alertPermeability: "Permeability",
  alertInjectivity: "Injectivity Index",
  alertSeverityLow: "Low",
  alertSeverityGood: "Good",
  alertSeverityExcellent: "Excellent",
  alertSeverityPoor: "Poor",
  alertSeverityModerate: "Moderate",
  alertSeverityNa: "Not available",

  // CHE treatment recommendation.
  treatmentTitle: "Suggested Treatment",
  treatmentContributor: "Top contributor",
  treatmentSubstance: "Treatment substance",
  treatmentWhen: "When to use",
  treatmentPubchem: "PubChem hazard",

  // Visualization.
  visualizeBtn: "Visualize the Situation",
  visualizationTitle: "Well Injection Simulation",
  visualizationDesc:
    "Drag the sliders to explore how the injection state evolves between safe operation and reservoir fracturing.",
  controlInjectionPressure: "Injection Pressure",
  controlMAIP: "MAIP",
  controlReservoirPressure: "Reservoir Pressure",
  controlWaterCut: "Water Cut",
  controlLithology: "Lithology",
  stateSafe: "Safe injection",
  stateMarginal: "Approaching fracture pressure",
  stateFracture: "Reservoir fracturing — STOP injection",
  legendInjection: "Injected water",
  legendAquifer: "Aquifer",
  legendReservoir: "Reservoir",
  legendFracture: "Fracture",
  fractureProgress: "Fracture margin",
  resetDefaults: "Reset",

  deeperAnalysis: "Deeper AI Analysis",
  deeperAnalysisHint:
    "Send inputs + result to the AI for a richer, engineer-level justification.",
  aiAnalysis: "AI Analysis",
  analyzing: "Thinking…",
  retry: "Retry",
  aiErrorNetwork:
    "Couldn't reach the AI service. Check your network and try again.",
  aiErrorTimeout:
    "The AI service took too long to respond. Try again.",
  aiErrorAuth:
    "The AI service is not configured correctly. Contact the maintainer.",
  aiErrorQuota:
    "The AI service is out of credit or rate-limited. Try again later.",
  aiErrorNotConfigured: "AI analysis is not enabled on the server.",
  aiErrorGeneric: "AI analysis failed. Please try again.",
};

export default en;
