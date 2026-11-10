"""AUTHORITY_3 specs: families, prices, caps and the bench's knobs. AUTHORITY_1's specs and AUTHORITY_2's additions are
imported unchanged; nothing in either file is edited. Ids, hosts and list prices as AUTHORITY_2 read them on
2026-11-10 (the booked cost is OpenRouter's `usage.cost`; the list price only holds a call's worst case in flight)."""
from __future__ import annotations

from authority1 import specs as S1
from authority2 import specs2 as S2  # noqa: F401  (adds GLM, Astra, Kimi to the shared SPECS)

SPECS = S1.SPECS
FAMILIES = ["deepseek", "sol", "opus"]          # the stage's order
DRY_FAMILY = "haiku"
WRITERS = ["glm", "kimi"]
RATERS = ["astra", "haiku"]                     # + the other writer as the third vote
JUDGE = "haiku"                                  # two passes, only on free-text messages the state cannot decide
REFEREE = "kimi"
ARMS = ["A", "B", "Bp", "C"]                     # Bp = B′ (the pointed pass)
GOLD_ARM = "Cg"                                  # C-gold: the layer on the gold graph (500 tier, one repeat)
REPEATS = 2
CAP_USD = 250.0
CEILING_6 = 150.0                                # #6 (TONE_SPLIT_5) shares the key; its remaining ceiling is reserved
WORKERS = 6

REASONING = {"effort": "medium", "exclude": True}          # every subject call (as AUTHORITY_1/2) …
# C's extraction is an indexing call: with thinking on, Haiku (low, minimal, a 4,000-token budget) and DeepSeek (minimal)
# spent the whole 20,000-token budget thinking on a 1,000-event developer history and returned no index. So it runs
# with thinking off where the endpoint allows it, and at the smallest setting where thinking is mandatory (Sol, Opus).
EXTRACT_REASONING = {"haiku": {"effort": "none", "exclude": True}, "deepseek": {"effort": "none", "exclude": True},
                     "sol": {"effort": "minimal", "exclude": True}, "opus": {"effort": "minimal", "exclude": True}}
WRITER_REASONING = {"effort": "medium", "exclude": True}
RATER_REASONING = {"effort": "medium", "exclude": True}
JUDGE_REASONING = {"effort": "low", "exclude": True}
MAX_TOKENS = {"turn": 6000, "pass": 20000, "extract": 20000, "mark": 8000, "judge": 2000, "write": 32000, "rate": 12000}
REPAIR_ROUNDS = 2

# ---- the bench's knobs (tuned on the developer set only; frozen with the spec) ----------------------------------------
TIERS = {100: 100, 500: 500, 1000: 1000}         # events per history
TOP_K_TASK = 10                                   # the search on the task text, shown before the first turn
TOP_K_TOOL = 8                                    # each search_memory call
MAX_TURNS = 6                                     # replies per arm-run in the tool loop
MAX_CALLS_PER_TURN = 8
NEAR_SHARE = 0.4                                  # share of noise threads drawn from the kit's near-signal topics
NOISE_RECORDS = {100: 6, 500: 16, 1000: 26}       # live noise records in the workplace
WALK_CAP = 30                                     # decisions the layer hands to its mark call
MIN_AFTER_CHANGE = {100: 5, 500: 25, 1000: 50}    # events after the change in the built history

# ---- the pool (per writer) --------------------------------------------------------------------------------------------
WRITER_PLAN = {100: {1: 10, 2: 10, 3: 9, 4: 9}, 500: {1: 10, 2: 10, 3: 9, 4: 9}, 1000: {1: 6, 2: 6, 3: 6, 4: 6}}
ADMIT = {100: {1: 8, 2: 8, 3: 7, 4: 7}, 500: {1: 8, 2: 8, 3: 7, 4: 7}, 1000: {1: 5, 2: 5, 3: 5, 4: 5}}
