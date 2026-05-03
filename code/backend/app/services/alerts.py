"""Hard-coded petroleum-engineering alerts (PETE spec).

After the classifier returns its decision, the API also runs three simple
deterministic if/else checks on the inputs and surfaces the verdicts in an
"Alerts" panel in the mobile UI:

  1. Porosity      (porosity_fraction)
  2. Permeability  (permeability_md)
  3. Injectivity   (= injection_rate_bwpd / (required_injection_pressure_psi
                       - reservoir_pressure_psi))

If injection_rate_bwpd is missing or the pressure differential is non-positive,
injectivity is reported as `n_a` instead of crashing.

Workflow position:
    /predict route ---> Predictor.predict() ---> build_alerts() ---> response
"""
from __future__ import annotations

from typing import Any

from ..schemas.prediction import AlertResult


def _porosity_alert(porosity_fraction: float | None) -> AlertResult:
    """Convert porosity (0-1) to a categorical bullet.

    Thresholds are stated in percent in the spec, so we multiply by 100.
    """
    if porosity_fraction is None:
        return AlertResult(
            key="porosity",
            severity="n_a",
            label_en="Porosity",
            label_ar="المسامية",
            value=None,
            detail_en="No value provided.",
            detail_ar="لم يتم إدخال قيمة.",
        )
    pct = porosity_fraction * 100.0
    if pct < 10.0:
        severity, en, ar = "low", "Low", "منخفضة"
    elif pct <= 20.0:
        severity, en, ar = "good", "Good", "جيدة"
    else:
        severity, en, ar = "excellent", "Excellent", "ممتازة"
    return AlertResult(
        key="porosity",
        severity=severity,
        label_en="Porosity",
        label_ar="المسامية",
        value=round(pct, 2),
        detail_en=f"{en} ({pct:.1f}%)",
        detail_ar=f"{ar} ({pct:.1f}%)",
    )


def _permeability_alert(permeability_md: float | None) -> AlertResult:
    """Convert permeability (mD) to a categorical bullet."""
    if permeability_md is None:
        return AlertResult(
            key="permeability",
            severity="n_a",
            label_en="Permeability",
            label_ar="النفاذية",
            value=None,
            detail_en="No value provided.",
            detail_ar="لم يتم إدخال قيمة.",
        )
    k = permeability_md
    if k < 10.0:
        severity, en, ar = "low", "Low", "منخفضة"
    elif k <= 100.0:
        severity, en, ar = "good", "Good", "جيدة"
    else:
        severity, en, ar = "excellent", "Excellent", "ممتازة"
    return AlertResult(
        key="permeability",
        severity=severity,
        label_en="Permeability",
        label_ar="النفاذية",
        value=round(k, 2),
        detail_en=f"{en} ({k:.1f} mD)",
        detail_ar=f"{ar} ({k:.1f} mD)",
    )


def _injectivity_alert(payload: dict[str, Any]) -> AlertResult:
    """Compute the injectivity index and bucket it.

    Formula (from spec):
        II = injection_rate_bwpd / (required_injection_pressure_psi
                                    - reservoir_pressure_psi)

    Buckets (per spec):
        < 10        -> poor
        20 - 40     -> good
        > 50        -> excellent
        Anything in between (10-20, 40-50) is reported as "moderate".
    """
    qi = payload.get("injection_rate_bwpd")
    p_inj = payload.get("required_injection_pressure_psi")
    p_res = payload.get("reservoir_pressure_psi")
    base = AlertResult(
        key="injectivity",
        severity="n_a",
        label_en="Injectivity Index",
        label_ar="مؤشر قابلية الحقن",
    )
    if qi is None or p_inj is None or p_res is None:
        return base.model_copy(
            update={
                "detail_en": "Missing inputs for injectivity calculation.",
                "detail_ar": "بعض المدخلات اللازمة لحساب مؤشر الحقن غير متوفرة.",
            }
        )
    delta_p = float(p_inj) - float(p_res)
    if delta_p <= 0:
        return base.model_copy(
            update={
                "detail_en": "Cannot compute — required injection pressure must exceed reservoir pressure.",
                "detail_ar": "تعذر الحساب — يجب أن يكون ضغط الحقن المطلوب أكبر من ضغط المكمن.",
            }
        )
    ii = float(qi) / delta_p
    if ii < 10:
        severity, en, ar = "poor", "Poor", "ضعيف"
    elif ii < 20:
        severity, en, ar = "moderate", "Moderate", "متوسط"
    elif ii <= 40:
        severity, en, ar = "good", "Good", "جيد"
    elif ii <= 50:
        severity, en, ar = "moderate", "Moderate", "متوسط"
    else:
        severity, en, ar = "excellent", "Excellent", "ممتاز"
    return AlertResult(
        key="injectivity",
        severity=severity,
        label_en="Injectivity Index",
        label_ar="مؤشر قابلية الحقن",
        value=round(ii, 2),
        detail_en=f"{en} ({ii:.2f} bwpd/psi)",
        detail_ar=f"{ar} ({ii:.2f} bwpd/psi)",
    )


def build_alerts(payload: dict[str, Any]) -> list[AlertResult]:
    """Compose the three engineering alerts for the response."""
    return [
        _porosity_alert(payload.get("porosity_fraction")),
        _permeability_alert(payload.get("permeability_md")),
        _injectivity_alert(payload),
    ]
