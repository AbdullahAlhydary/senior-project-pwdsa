"""LLM-based reasoning layer.

Wraps the OpenAI chat.completions API with careful prompt engineering, strict
length/tone constraints, and typed errors so the FastAPI layer can translate
upstream failures into clear HTTP responses.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

from openai import (
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    AsyncOpenAI,
    AuthenticationError,
    RateLimitError,
)

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gpt-5.4-mini"


_SYSTEM_EN = """You are a senior produced-water and petroleum engineer delivering a concise \
technical verdict to a field operator. A supervised classifier has already issued \
a decision about a produced-water sample. Your job is to explain WHY the decision \
fits the sample and add operational insight the operator can act on.

Write exactly 3 to 4 sentences, 70-110 words total. No bullet points, no headings, \
no preamble (do NOT start with "Based on", "The model", "Looking at"). Speak as \
the engineer, not as an AI.

Structure the reply as:
1. One sentence naming the 2 or 3 numeric inputs (by name and value, with units) \
that most justify the decision.
2. One sentence on a specific operational risk those numbers imply — e.g. \
scaling from high Ca × SO4, injectivity loss at high TSS, fracture-pressure \
proximity (compare required injection pressure to MAIP), corrosion at low pH, \
aquifer protection, seal integrity at low GRSS, lithology-specific damage.
3. One sentence with a concrete, actionable recommendation (treatment step, \
pressure adjustment, monitoring cadence, site re-evaluation, additive class).
4. (Only if needed) One sentence flagging any input that strongly conflicts \
with the decision — be blunt, do not hedge.

Absolute rules:
- Reply in English.
- Do NOT repeat the classifier's summary verbatim.
- Do NOT add safety disclaimers, caveats about uncertainty, or generic advice.
- Do NOT include Markdown, JSON, or code blocks in the reply.
"""

_SYSTEM_AR = """أنت مهندس بترول ومعالجة مياه منتجة متمرس، تُقدّم رأياً فنياً موجزاً لمهندس \
التشغيل في الحقل. خوارزمية تعلُّم آلي مُشرف عليه قد أصدرت قراراً بشأن عيّنة مياه منتجة، \
ومهمّتك هي توضيح لماذا هذا القرار يتلاءم مع العيّنة وإضافة بصيرة عملية قابلة للتنفيذ.

اكتب ردّاً من 3 إلى 4 جُمل فقط، بمجموع 70-110 كلمة. لا تستخدم قوائم أو عناوين، \
ولا تبدأ بعبارات مثل "بناءً على" أو "النموذج". تحدَّث كمهندس، لا كنموذج ذكاء اصطناعي.

ابنِ الردّ على هذا النحو:
1. جملة تذكر 2-3 مدخلات رقمية (بالاسم والقيمة والوحدة) تُبرّر القرار أكثر من غيرها.
2. جملة عن خطر تشغيلي محدّد تستلزمه هذه الأرقام — مثل الترسّبات من Ca × SO4 المرتفع، \
أو فقدان الحقن بسبب TSS المرتفع، أو قرب ضغط الحقن المطلوب من MAIP، أو التآكل بسبب pH \
المنخفض، أو حماية المياه الجوفية، أو سلامة الحاجز عند GRSS منخفض، أو ضرر خاص بالصخور.
3. جملة بتوصية ملموسة قابلة للتنفيذ (خطوة معالجة، تعديل ضغط، جدولة مراقبة، \
إعادة تقييم موقع، نوع مضاف كيميائي).
4. (فقط عند الحاجة) جملة تُلفت النظر صراحةً إلى مُدخل يتعارض بشدّة مع القرار.

قواعد مُلزِمة:
- الردّ باللغة العربية الفصحى.
- لا تُكرّر ملخّص النموذج حرفياً.
- لا تُضف تنبيهات سلامة عامّة أو تحفّظات حول عدم اليقين أو نصائح عامّة.
- لا تستخدم Markdown أو JSON أو مقاطع برمجية.
"""


class LLMError(Exception):
    def __init__(self, code: str, message: str, http_status: int = 500):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)


class LLMService:
    """Thin async wrapper around OpenAI chat completions."""

    def __init__(
        self,
        api_key: str | None,
        model: str = DEFAULT_MODEL,
        timeout: float = 20.0,
        max_output_tokens: int = 280,
        temperature: float = 0.3,
    ):
        self.model = model
        self.timeout = timeout
        self.max_output_tokens = max_output_tokens
        self.temperature = temperature
        self._client: AsyncOpenAI | None = (
            AsyncOpenAI(api_key=api_key, timeout=timeout) if api_key else None
        )

    @property
    def configured(self) -> bool:
        return self._client is not None

    async def explain(
        self,
        *,
        decision: str,
        confidence: float,
        probabilities: dict[str, float],
        classifier_summary: str,
        inputs: dict[str, Any],
        language: str = "en",
    ) -> dict[str, Any]:
        if self._client is None:
            raise LLMError(
                "not_configured",
                "The AI service is not configured on the server.",
                http_status=503,
            )

        system = _SYSTEM_AR if language == "ar" else _SYSTEM_EN

        user_payload = {
            "decision": decision,
            "confidence": round(float(confidence), 4),
            "probabilities": {k: round(float(v), 4) for k, v in probabilities.items()},
            "classifier_summary": classifier_summary,
            "inputs": inputs,
        }
        user_msg = (
            "Here is the sample (JSON). Produce the engineer's reply per the system rules.\n\n"
            + json.dumps(user_payload, ensure_ascii=False)
        )

        try:
            resp = await self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                max_completion_tokens=self.max_output_tokens,
            )
        except AuthenticationError as e:
            logger.error("OpenAI auth error: %s", e)
            raise LLMError(
                "auth_error",
                "The AI service rejected the credentials. Contact the maintainer.",
                http_status=401,
            ) from e
        except RateLimitError as e:
            logger.warning("OpenAI rate/quota error: %s", e)
            raise LLMError(
                "rate_limited",
                "The AI service is rate-limited or out of credit. Try again later.",
                http_status=429,
            ) from e
        except APITimeoutError as e:
            logger.warning("OpenAI timeout: %s", e)
            raise LLMError(
                "timeout",
                "The AI service timed out. Try again.",
                http_status=504,
            ) from e
        except APIConnectionError as e:
            logger.warning("OpenAI connection error: %s", e)
            raise LLMError(
                "network",
                "Could not reach the AI service. Check your network.",
                http_status=502,
            ) from e
        except APIStatusError as e:
            logger.error("OpenAI upstream status error: %s", e)
            raise LLMError(
                "upstream",
                "The AI service returned an error. Try again in a moment.",
                http_status=502,
            ) from e
        except APIError as e:
            logger.error("OpenAI generic error: %s", e)
            raise LLMError(
                "upstream",
                "The AI service returned an error. Try again in a moment.",
                http_status=502,
            ) from e

        text = (resp.choices[0].message.content or "").strip()
        if not text:
            raise LLMError("empty_reply", "The AI service returned an empty reply.", 502)

        usage = resp.usage
        logger.info(
            "LLM ok: model=%s prompt=%s completion=%s",
            resp.model,
            getattr(usage, "prompt_tokens", None),
            getattr(usage, "completion_tokens", None),
        )
        return {
            "analysis": text,
            "model": resp.model,
            "tokens_prompt": getattr(usage, "prompt_tokens", None) if usage else None,
            "tokens_completion": getattr(usage, "completion_tokens", None) if usage else None,
        }


def build_service_from_env() -> LLMService:
    key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_MODEL", DEFAULT_MODEL)
    return LLMService(api_key=key, model=model)
