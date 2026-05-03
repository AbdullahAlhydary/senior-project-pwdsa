"""Typed LLM error class.

Carrying `code` + `http_status` lets the FastAPI route convert an upstream
failure into a structured response the mobile UI can map to a user-visible
message ("rate limited", "auth error", "timeout", etc.).
"""
from __future__ import annotations


class LLMError(Exception):
    """Custom exception for any failure raised inside the LLM layer."""

    def __init__(self, code: str, message: str, http_status: int = 500):
        self.code = code
        self.message = message
        self.http_status = http_status
        super().__init__(message)
