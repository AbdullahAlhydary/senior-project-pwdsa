"""Common type aliases reused across multiple schema modules."""
from __future__ import annotations

from typing import Literal

# The categorical reservoir-rock label. Anything outside this set is rejected
# by the predict route. Values are normalized to lower-case before validation.
Lithology = Literal["carbonate", "sandstone", "shale"]

# UI / response language toggle.
Language = Literal["en", "ar"]
