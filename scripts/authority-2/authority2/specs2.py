"""AUTHORITY_2 additions to AUTHORITY_1's specs, made at import time without editing any AUTHORITY_1 file.

The writer (GLM 5.3) and the raters (Astra, Kimi K3) are added to authority1.specs.SPECS (the dict the gateway and the
client already read). Ids, hosts and list prices from OpenRouter's catalogue read 2026-11-10 ≈ 19:40 UTC
(`GET /api/v1/models`, `GET /api/v1/models/<id>/endpoints`, free calls). Booked cost is OpenRouter's `usage.cost`; the
list price only holds a call's worst case in flight.

Amendment 2026-11-10 11:4x LA (stage at 1fe27ef1): the referee of the subject runs' disputed judgments is Kimi K3, not
Sol (Sol is a subject). Kimi also rates the candidates, before any subject call; both roles are disclosed.
"""
from __future__ import annotations

from authority1 import specs as S1

S1.SPECS.update({
    "glm": {"label": "GLM 5.3", "model": "z-ai/glm-5.3", "stem": "glm-5.3", "slug": "z-ai/fp8",
            "provider_name": "Z.AI", "price": {"in": 1.4, "out": 4.4}},
    "astra": {"label": "GPT-6 Astra", "model": "openai/gpt-6-astra", "stem": "gpt-6-astra", "slug": "openai",
              "provider_name": "OpenAI", "price": {"in": 10.0, "out": 50.0}},
    "kimi": {"label": "Kimi K3", "model": "moonshotai/kimi-k3", "stem": "kimi-k3", "slug": "moonshotai",
             "provider_name": "Moonshot AI", "price": {"in": 3.0, "out": 15.0}},
})
SPECS = S1.SPECS
FAMILIES = ["deepseek", "sol", "opus"]   # the stage's order, as AUTHORITY_1
DRY_FAMILY = "haiku"
WRITER = "glm"
RATERS = ["astra", "kimi"]
JUDGE = "haiku"                          # two independent Haiku passes, as AUTHORITY_1
REFEREE = "kimi"                         # the amendment: Kimi K3, not Sol
REPEATS = 2
CAP_USD = 120.0
WORKERS = 6
WRITER_REASONING = {"effort": "medium", "exclude": True}
RATER_REASONING = {"effort": "medium", "exclude": True}
WRITER_MAX_TOKENS = 32000
RATER_MAX_TOKENS = 16000
REPAIR_ROUNDS = 2                        # a structurally invalid candidate gets the validator's messages back, at most twice
N_CANDIDATES = {1: 12, 2: 12, 3: 14, 4: 12}
N_ADMIT = 10                             # per class, by hash order

# Shared key (mandate #7): #6 (TONE_SPLIT_5, ceiling $150) shares it. Its remaining ceiling is reserved: $150 less what
# #6 has reported spent in its thread or ledger (read by the session before each command; the file below records it).
CEILING_6 = 150.0
