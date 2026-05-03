"""LLM reasoning subpackage.

Wraps OpenAI's `chat.completions` API behind a thin async service. Split
across three files so the prompts (which read like long English prose) live
separately from the network/error code:

  * `prompts.py`  — system prompts (EN / AR).
  * `errors.py`   — typed `LLMError` for HTTP-friendly mapping.
  * `service.py`  — the actual `LLMService` class + factory.
"""
from .errors import LLMError
from .service import LLMService, build_service_from_env

__all__ = ["LLMError", "LLMService", "build_service_from_env"]
