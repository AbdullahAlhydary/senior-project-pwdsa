// Client-side mirror of `app/services/che_treatment.py`.
//
// The shape returned matches the backend's `TreatmentRecommendation` so
// `TreatmentCard` doesn't need to care who computed it.
//
// All numeric clamp constants are taken verbatim from the CHE deliverable.

const DTPMP_URL =
  "https://pubchem.ncbi.nlm.nih.gov/compound/" +
  "Diethylenetriaminepenta_methylenephosphonic-acid" +
  "#section=GHS-Classification&fullscreen=true";
const IMIDAZOLINE_URL =
  "https://pubchem.ncbi.nlm.nih.gov/compound/2-IMIDAZOLINE" +
  "#section=GHS-Classification&fullscreen=true";
const SODIUM_NITRATE_URL =
  "https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-Nitrate" +
  "#section=GHS-Classification&fullscreen=true";

const TABLE = {
  Sr: {
    contributor_label_en: "Strontium (Sr)",
    contributor_label_ar: "السترونيوم (Sr)",
    substance: "DTPMP",
    when_to_use_en:
      "Since there is a scaling risk by Strontium it is advised to use DTPMP (Phosphonates) to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر ترسبات بسبب السترونيوم، يُنصح باستخدام DTPMP (الفوسفونات) لمعالجتها.",
    pubchem_url: DTPMP_URL,
  },
  Ca: {
    contributor_label_en: "Calcium (Ca)",
    contributor_label_ar: "الكالسيوم (Ca)",
    substance: "DTPMP",
    when_to_use_en:
      "Since there is a scaling risk by Calcium it is advised to use DTPMP (Phosphonates) to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر ترسبات بسبب الكالسيوم، يُنصح باستخدام DTPMP (الفوسفونات) لمعالجتها.",
    pubchem_url: DTPMP_URL,
  },
  SO4: {
    contributor_label_en: "Sulfate (SO₄)",
    contributor_label_ar: "الكبريتات (SO₄)",
    substance: "DTPMP",
    when_to_use_en:
      "Since there is a scaling risk by Sulfates it is advised to use DTPMP (Phosphonates) to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر ترسبات بسبب الكبريتات، يُنصح باستخدام DTPMP (الفوسفونات) لمعالجتها.",
    pubchem_url: DTPMP_URL,
  },
  pH: {
    contributor_label_en: "pH (acidity)",
    contributor_label_ar: "الرقم الهيدروجيني (الحموضة)",
    substance: "Imidazoline",
    when_to_use_en:
      "Since there is a corrosion risk caused by acidity it is advised to use Imidazoline to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر تآكل بسبب الحموضة، يُنصح باستخدام الإيميدازولين لمعالجته.",
    pubchem_url: IMIDAZOLINE_URL,
  },
  Temp: {
    contributor_label_en: "Temperature",
    contributor_label_ar: "درجة الحرارة",
    substance: "Imidazoline",
    when_to_use_en:
      "Since there is a corrosion risk caused by elevated temperature it is advised to use Imidazoline to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر تآكل بسبب ارتفاع درجة الحرارة، يُنصح باستخدام الإيميدازولين لمعالجته.",
    pubchem_url: IMIDAZOLINE_URL,
  },
  TDS: {
    contributor_label_en: "Total Dissolved Solids (TDS)",
    contributor_label_ar: "إجمالي المواد الصلبة الذائبة (TDS)",
    substance: "Imidazoline",
    when_to_use_en:
      "Since there is a corrosion risk caused by TDS it is advised to use Imidazoline to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر تآكل بسبب TDS، يُنصح باستخدام الإيميدازولين لمعالجته.",
    pubchem_url: IMIDAZOLINE_URL,
  },
  TSS: {
    contributor_label_en: "Total Suspended Solids (TSS)",
    contributor_label_ar: "إجمالي المواد الصلبة المعلّقة (TSS)",
    substance: "Sodium Nitrate",
    when_to_use_en:
      "Since there is a fouling risk caused by TSS it is advised to use Sodium Nitrate to treat it.",
    when_to_use_ar:
      "نظراً لوجود خطر انسداد/تلوث بسبب TSS، يُنصح باستخدام نترات الصوديوم لمعالجته.",
    pubchem_url: SODIUM_NITRATE_URL,
  },
};

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

// Score formulas — exact constants from the CHE specification document.
const score = {
  Sr: (sr) => (sr == null ? null : clamp((sr - 117) / (157 - 117))),
  Ca: (ca) => (ca == null ? null : clamp((ca - 1365.5) / (1766 - 1365.5))),
  SO4: (so4) => (so4 == null ? null : clamp((so4 - 217) / (322 - 217))),
  TDS: (tds) => (tds == null ? null : clamp((tds - 2323.5) / (4100 - 2323.5))),
  Temp: (t) => (t == null ? null : clamp((t - 43.555) / (56.321 - 43.555))),
  TSS: (tss) => (tss == null ? null : clamp((tss - 96.21) / (249.532 - 96.21))),
  // pH is inverted: lower (more acidic) means higher corrosion risk.
  pH: (ph) => (ph == null ? null : clamp((7.62 - ph) / (8 - 7.62))),
};

/**
 * Return the recommended treatment for the highest-scoring contributor, or
 * null if every score is missing.
 *
 * @param {object} payload  - API payload (snake_case keys).
 */
export function buildTreatment(payload) {
  const scores = {
    Sr: score.Sr(num(payload?.Sr_mg_L)),
    Ca: score.Ca(num(payload?.Ca_mg_L)),
    SO4: score.SO4(num(payload?.SO4_mg_L)),
    TDS: score.TDS(num(payload?.TDS_mg_L)),
    Temp: score.Temp(num(payload?.temperature_C)),
    TSS: score.TSS(num(payload?.TSS_mg_L)),
    pH: score.pH(num(payload?.pH)),
  };
  let best = null;
  for (const [k, v] of Object.entries(scores)) {
    if (v == null) continue;
    if (best == null || v > best.value) best = { key: k, value: v };
  }
  if (best == null) return null;
  const info = TABLE[best.key];
  return {
    contributor: best.key,
    contributor_label_en: info.contributor_label_en,
    contributor_label_ar: info.contributor_label_ar,
    substance: info.substance,
    when_to_use_en: info.when_to_use_en,
    when_to_use_ar: info.when_to_use_ar,
    pubchem_url: info.pubchem_url,
    score: Math.round(best.value * 10000) / 10000,
  };
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
