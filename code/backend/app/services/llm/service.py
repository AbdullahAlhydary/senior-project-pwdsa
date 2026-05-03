"""Async wrapper around OpenAI's chat completions endpoint.

Only this file talks to the network. Each upstream failure mode is caught
explicitly and re-raised as `LLMError` with a structured `code` so the
FastAPI layer can translate it into an HTTP response the mobile app can
display verbatim.
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

from .errors import LLMError
from .prompts import SYSTEM_AR, SYSTEM_EN

logger = logging.getLogger(__name__)

# Model name kept here so it's the only place to edit when bumping versions.
DEFAULT_MODEL = "gpt-5.4-mini"


class LLMService:
    """Thin async wrapper — all OpenAI plumbing lives in this one class."""

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
        # Defer client construction so missing API keys do NOT crash boot.
        self._client: AsyncOpenAI | None = (
            AsyncOpenAI(api_key=api_key, timeout=timeout) if api_key else None
        )

    @property
    def configured(self) -> bool:
        """True iff an API key was provided at construction time."""
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
        """Send the prediction context to the LLM and return its analysis."""
        if self._client is None:
            raise LLMError(
                "not_configured",
                "The AI service is not configured on the server.",
                http_status=503,
            )

        system = SYSTEM_AR if language == "ar" else SYSTEM_EN

        # Pack the structured context as compact JSON. Rounding probabilities
        # avoids spending tokens on noise digits the model never reads.
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
    """Read OPENAI_API_KEY / OPENAI_MODEL from environment and build a service."""
    key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_MODEL", DEFAULT_MODEL)
    return LLMService(api_key=key, model=model)
