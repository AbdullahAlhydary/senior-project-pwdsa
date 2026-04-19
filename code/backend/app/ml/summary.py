"""Plain-language summary generator (Specification 3 / Integrated Spec 1).

Produces a 1-2 sentence explanation in English or Arabic based on the
predicted decision class and the driving input values. Deterministic,
rule-based — no external LLM — so it runs fully offline alongside the
classifier.
"""
from __future__ import annotations

from typing import Any

Lang = str  # "en" | "ar"

_EN_TEMPLATES: dict[str, str] = {
    "Inject": (
        "The water is suitable for direct injection: quality indicators "
        "(TDS {TDS_mg_L:.0f} mg/L, TSS {TSS_mg_L:.1f} mg/L, oil {oil_in_water_ppm:.1f} ppm) "
        "are within safe limits and the injection pressure ({required_injection_pressure_psi:.0f} psi) "
        "stays below the maximum allowable ({MAIP_psi:.0f} psi)."
    ),
    "Treat then inject": (
        "Injection is viable but treatment is advised first — TDS {TDS_mg_L:.0f} mg/L, "
        "TSS {TSS_mg_L:.1f} mg/L or oil {oil_in_water_ppm:.1f} ppm are high enough to risk "
        "scaling, plugging or formation damage in the {lithology} zone."
    ),
    "Disposal": (
        "Disposal is recommended: the combination of water quality "
        "(TDS {TDS_mg_L:.0f} mg/L, TSS {TSS_mg_L:.1f} mg/L) and reservoir indicators "
        "(GRSS {GRSS:.1f}, CRI {CRI:.1f}) makes reuse uneconomical or risky."
    ),
    "Injection not suitable": (
        "Injection is not recommended: subsurface integrity or compatibility is insufficient "
        "(GRSS {GRSS:.1f}, lithology {lithology}) and injection pressure "
        "({required_injection_pressure_psi:.0f} psi) vs MAIP ({MAIP_psi:.0f} psi) leaves no safe margin."
    ),
}

_AR_TEMPLATES: dict[str, str] = {
    "Inject": (
        "المياه مناسبة للحقن المباشر: مؤشرات الجودة "
        "(TDS {TDS_mg_L:.0f} mg/L، TSS {TSS_mg_L:.1f} mg/L، زيت {oil_in_water_ppm:.1f} ppm) "
        "ضمن الحدود الآمنة، وضغط الحقن ({required_injection_pressure_psi:.0f} psi) "
        "أقل من الحد الأقصى المسموح به ({MAIP_psi:.0f} psi)."
    ),
    "Treat then inject": (
        "الحقن ممكن لكن يُنصح بالمعالجة أولاً — قيم TDS {TDS_mg_L:.0f} mg/L أو "
        "TSS {TSS_mg_L:.1f} mg/L أو الزيت {oil_in_water_ppm:.1f} ppm مرتفعة بما يكفي "
        "للتسبب في الترسبات أو الانسداد أو الضرر في تكوين {lithology}."
    ),
    "Disposal": (
        "يُنصح بالتخلص من المياه: الجمع بين جودة المياه "
        "(TDS {TDS_mg_L:.0f} mg/L، TSS {TSS_mg_L:.1f} mg/L) ومؤشرات المكمن "
        "(GRSS {GRSS:.1f}، CRI {CRI:.1f}) يجعل إعادة الاستخدام غير اقتصادي أو محفوف بالمخاطر."
    ),
    "Injection not suitable": (
        "الحقن غير موصى به: سلامة التكوين أو التوافق غير كافيين "
        "(GRSS {GRSS:.1f}، صخر {lithology})، وضغط الحقن "
        "({required_injection_pressure_psi:.0f} psi) مقارنة بـ MAIP ({MAIP_psi:.0f} psi) لا يوفر هامش أمان."
    ),
}


def build_summary(decision: str, features: dict[str, Any], lang: Lang = "en") -> str:
    templates = _AR_TEMPLATES if lang == "ar" else _EN_TEMPLATES
    tmpl = templates.get(decision)
    if tmpl is None:
        return (
            f"Recommended decision: {decision}."
            if lang == "en"
            else f"القرار الموصى به: {decision}."
        )
    safe: dict[str, Any] = {k: (v if v is not None else 0) for k, v in features.items()}
    try:
        return tmpl.format(**safe)
    except (KeyError, ValueError):
        return (
            f"Recommended decision: {decision}."
            if lang == "en"
            else f"القرار الموصى به: {decision}."
        )
