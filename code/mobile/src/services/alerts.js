// Client-side mirror of `app/services/alerts.py`.
//
// Why duplicate the logic on the client?
//   * The backend may not have been restarted after a new build, in which
//     case its response will not contain the `alerts` field. Computing
//     locally guarantees the user sees the alerts no matter what.
//   * The visualization screen also wants to show injectivity live as the
//     user drags a slider — running the math locally keeps that snappy.
//
// The output shape MATCHES the backend response (`AlertResult`) exactly,
// so AlertsCard does not need to know who computed the data.

const NA = (key, label_en, label_ar) => ({
  key,
  severity: "n_a",
  label_en,
  label_ar,
  value: null,
  detail_en: "No value provided.",
  detail_ar: "لم يتم إدخال قيمة.",
});

function porosityAlert(porosityFraction) {
  if (porosityFraction == null || Number.isNaN(porosityFraction)) {
    return NA("porosity", "Porosity", "المسامية");
  }
  const pct = porosityFraction * 100;
  let severity, en, ar;
  if (pct < 10) [severity, en, ar] = ["low", "Low", "منخفضة"];
  else if (pct <= 20) [severity, en, ar] = ["good", "Good", "جيدة"];
  else [severity, en, ar] = ["excellent", "Excellent", "ممتازة"];
  return {
    key: "porosity",
    severity,
    label_en: "Porosity",
    label_ar: "المسامية",
    value: round2(pct),
    detail_en: `${en} (${pct.toFixed(1)}%)`,
    detail_ar: `${ar} (${pct.toFixed(1)}%)`,
  };
}

function permeabilityAlert(k) {
  if (k == null || Number.isNaN(k)) {
    return NA("permeability", "Permeability", "النفاذية");
  }
  let severity, en, ar;
  if (k < 10) [severity, en, ar] = ["low", "Low", "منخفضة"];
  else if (k <= 100) [severity, en, ar] = ["good", "Good", "جيدة"];
  else [severity, en, ar] = ["excellent", "Excellent", "ممتازة"];
  return {
    key: "permeability",
    severity,
    label_en: "Permeability",
    label_ar: "النفاذية",
    value: round2(k),
    detail_en: `${en} (${k.toFixed(1)} mD)`,
    detail_ar: `${ar} (${k.toFixed(1)} mD)`,
  };
}

function injectivityAlert(qi, pInj, pRes) {
  const base = {
    key: "injectivity",
    severity: "n_a",
    label_en: "Injectivity Index",
    label_ar: "مؤشر قابلية الحقن",
    value: null,
  };
  if (qi == null || pInj == null || pRes == null) {
    return {
      ...base,
      detail_en: "Missing inputs for injectivity calculation.",
      detail_ar: "بعض المدخلات اللازمة لحساب مؤشر الحقن غير متوفرة.",
    };
  }
  const dp = pInj - pRes;
  if (dp <= 0) {
    return {
      ...base,
      detail_en:
        "Cannot compute — required injection pressure must exceed reservoir pressure.",
      detail_ar:
        "تعذر الحساب — يجب أن يكون ضغط الحقن المطلوب أكبر من ضغط المكمن.",
    };
  }
  const ii = qi / dp;
  let severity, en, ar;
  if (ii < 10) [severity, en, ar] = ["poor", "Poor", "ضعيف"];
  else if (ii < 20) [severity, en, ar] = ["moderate", "Moderate", "متوسط"];
  else if (ii <= 40) [severity, en, ar] = ["good", "Good", "جيد"];
  else if (ii <= 50) [severity, en, ar] = ["moderate", "Moderate", "متوسط"];
  else [severity, en, ar] = ["excellent", "Excellent", "ممتاز"];
  return {
    ...base,
    severity,
    value: round2(ii),
    detail_en: `${en} (${ii.toFixed(2)} bwpd/psi)`,
    detail_ar: `${ar} (${ii.toFixed(2)} bwpd/psi)`,
  };
}

/**
 * Build the three alert bullets from the API payload (snake_case keys).
 */
export function buildAlerts(payload) {
  return [
    porosityAlert(num(payload?.porosity_fraction)),
    permeabilityAlert(num(payload?.permeability_md)),
    injectivityAlert(
      num(payload?.injection_rate_bwpd),
      num(payload?.required_injection_pressure_psi),
      num(payload?.reservoir_pressure_psi)
    ),
  ];
}

function num(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function round2(x) {
  return Math.round(x * 100) / 100;
}
