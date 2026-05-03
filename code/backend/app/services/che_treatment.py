"""CHE (Chemical Engineering) treatment recommender.

Run only when the classifier returns "Treat then inject". The procedure is:

  1. Normalize each candidate input to a 0-1 "score" using a clamp formula.
     The numerator and denominator constants come from the senior project's
     CHE deliverable and are intentionally hard-coded here so the math is
     auditable from one place.
  2. Pick the highest-scoring contributor.
  3. Look up the recommended treatment substance + PubChem hazard URL.

Workflow position:
    /predict route -->  Predictor returns "Treat then inject"
                  -->  build_treatment(payload)  -->  response.treatment
                  -->  mobile UI shows substance + PubChem hazard button
"""
from __future__ import annotations

from typing import Any

from ..schemas.prediction import TreatmentRecommendation


def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Numerical clamp helper — keeps a value inside [lo, hi]."""
    if x < lo:
        return lo
    if x > hi:
        return hi
    return x


def _safe(value: Any) -> float | None:
    """Coerce a value to float, returning None for missing/invalid inputs."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


# Score formulas — exact constants from the CHE specification document.
# Each function returns None when its driver input is missing.
def _score_sr(sr: float | None) -> float | None:
    return _clamp((sr - 117.0) / (157.0 - 117.0)) if sr is not None else None


def _score_ca(ca: float | None) -> float | None:
    return _clamp((ca - 1365.5) / (1766.0 - 1365.5)) if ca is not None else None


def _score_so4(so4: float | None) -> float | None:
    return _clamp((so4 - 217.0) / (322.0 - 217.0)) if so4 is not None else None


def _score_tds(tds: float | None) -> float | None:
    return _clamp((tds - 2323.5) / (4100.0 - 2323.5)) if tds is not None else None


def _score_temp(t: float | None) -> float | None:
    return _clamp((t - 43.555) / (56.321 - 43.555)) if t is not None else None


def _score_tss(tss: float | None) -> float | None:
    return _clamp((tss - 96.21) / (249.532 - 96.21)) if tss is not None else None


def _score_ph(ph: float | None) -> float | None:
    """pH is inverted: lower (more acidic) means higher corrosion risk."""
    return _clamp((7.62 - ph) / (8.0 - 7.62)) if ph is not None else None


# Treatment lookup table — keyed by contributor symbol used in the formulas.
# Source: the senior project CHE deliverable.
_DTPMP_URL = (
    "https://pubchem.ncbi.nlm.nih.gov/compound/"
    "Diethylenetriaminepenta_methylenephosphonic-acid"
    "#section=GHS-Classification&fullscreen=true"
)
_IMIDAZOLINE_URL = (
    "https://pubchem.ncbi.nlm.nih.gov/compound/2-IMIDAZOLINE"
    "#section=GHS-Classification&fullscreen=true"
)
_SODIUM_NITRATE_URL = (
    "https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-Nitrate"
    "#section=GHS-Classification&fullscreen=true"
)


def _treatment_for(contributor: str) -> dict[str, str]:
    """Static lookup — returns substance, EN/AR rationale, hazard URL."""
    table = {
        "Sr": {
            "contributor_label_en": "Strontium (Sr)",
            "contributor_label_ar": "السترونيوم (Sr)",
            "substance": "DTPMP",
            "when_to_use_en": (
                "Since there is a scaling risk by Strontium it is advised "
                "to use DTPMP (Phosphonates) to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر ترسبات بسبب السترونيوم، يُنصح باستخدام "
                "DTPMP (الفوسفونات) لمعالجتها."
            ),
            "pubchem_url": _DTPMP_URL,
        },
        "Ca": {
            "contributor_label_en": "Calcium (Ca)",
            "contributor_label_ar": "الكالسيوم (Ca)",
            "substance": "DTPMP",
            "when_to_use_en": (
                "Since there is a scaling risk by Calcium it is advised "
                "to use DTPMP (Phosphonates) to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر ترسبات بسبب الكالسيوم، يُنصح باستخدام "
                "DTPMP (الفوسفونات) لمعالجتها."
            ),
            "pubchem_url": _DTPMP_URL,
        },
        "SO4": {
            "contributor_label_en": "Sulfate (SO₄)",
            "contributor_label_ar": "الكبريتات (SO₄)",
            "substance": "DTPMP",
            "when_to_use_en": (
                "Since there is a scaling risk by Sulfates it is advised "
                "to use DTPMP (Phosphonates) to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر ترسبات بسبب الكبريتات، يُنصح باستخدام "
                "DTPMP (الفوسفونات) لمعالجتها."
            ),
            "pubchem_url": _DTPMP_URL,
        },
        "pH": {
            "contributor_label_en": "pH (acidity)",
            "contributor_label_ar": "الرقم الهيدروجيني (الحموضة)",
            "substance": "Imidazoline",
            "when_to_use_en": (
                "Since there is a corrosion risk caused by acidity it is "
                "advised to use Imidazoline to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر تآكل بسبب الحموضة، يُنصح باستخدام "
                "الإيميدازولين لمعالجته."
            ),
            "pubchem_url": _IMIDAZOLINE_URL,
        },
        "Temp": {
            "contributor_label_en": "Temperature",
            "contributor_label_ar": "درجة الحرارة",
            "substance": "Imidazoline",
            "when_to_use_en": (
                "Since there is a corrosion risk caused by elevated "
                "temperature it is advised to use Imidazoline to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر تآكل بسبب ارتفاع درجة الحرارة، يُنصح "
                "باستخدام الإيميدازولين لمعالجته."
            ),
            "pubchem_url": _IMIDAZOLINE_URL,
        },
        "TDS": {
            "contributor_label_en": "Total Dissolved Solids (TDS)",
            "contributor_label_ar": "إجمالي المواد الصلبة الذائبة (TDS)",
            "substance": "Imidazoline",
            "when_to_use_en": (
                "Since there is a corrosion risk caused by TDS it is "
                "advised to use Imidazoline to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر تآكل بسبب TDS، يُنصح باستخدام "
                "الإيميدازولين لمعالجته."
            ),
            "pubchem_url": _IMIDAZOLINE_URL,
        },
        "TSS": {
            "contributor_label_en": "Total Suspended Solids (TSS)",
            "contributor_label_ar": "إجمالي المواد الصلبة المعلّقة (TSS)",
            "substance": "Sodium Nitrate",
            "when_to_use_en": (
                "Since there is a fouling risk caused by TSS it is "
                "advised to use Sodium Nitrate to treat it."
            ),
            "when_to_use_ar": (
                "نظراً لوجود خطر انسداد/تلوث بسبب TSS، يُنصح باستخدام "
                "نترات الصوديوم لمعالجته."
            ),
            "pubchem_url": _SODIUM_NITRATE_URL,
        },
    }
    return table[contributor]


def build_treatment(payload: dict[str, Any]) -> TreatmentRecommendation | None:
    """Run the scoring + lookup pipeline.

    Returns `None` when every score is missing — e.g. the user submitted no
    chemistry inputs at all.
    """
    scores: dict[str, float | None] = {
        "Sr": _score_sr(_safe(payload.get("Sr_mg_L"))),
        "Ca": _score_ca(_safe(payload.get("Ca_mg_L"))),
        "SO4": _score_so4(_safe(payload.get("SO4_mg_L"))),
        "TDS": _score_tds(_safe(payload.get("TDS_mg_L"))),
        "Temp": _score_temp(_safe(payload.get("temperature_C"))),
        "TSS": _score_tss(_safe(payload.get("TSS_mg_L"))),
        "pH": _score_ph(_safe(payload.get("pH"))),
    }
    valid = {k: v for k, v in scores.items() if v is not None}
    if not valid:
        return None
    top_key, top_value = max(valid.items(), key=lambda kv: kv[1])
    info = _treatment_for(top_key)
    return TreatmentRecommendation(
        contributor=top_key,
        contributor_label_en=info["contributor_label_en"],
        contributor_label_ar=info["contributor_label_ar"],
        substance=info["substance"],
        when_to_use_en=info["when_to_use_en"],
        when_to_use_ar=info["when_to_use_ar"],
        pubchem_url=info["pubchem_url"],
        score=round(float(top_value), 4),
    )
