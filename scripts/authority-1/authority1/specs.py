"""Families, prices, budgets, caps. Ids, hosts and prices from OpenRouter's catalogue read 2026-11-10 ≈ 08:10 UTC
(`GET /api/v1/models`, `GET /api/v1/models/<id>/endpoints`, free calls). The booked cost is OpenRouter's own charge
(`usage.cost`); the list price below is used only to hold the worst case of a call in flight."""

OPENROUTER_CHAT = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_CREDITS = "https://openrouter.ai/api/v1/credits"

# DeepSeek: the programme's spec since SELF_TALK_X3 (V4 Pro 0813, pinned to DeepInfra fp8 — DeepSeek's own host is
# excluded by the account's privacy guardrail). Sol: pinned to OpenAI (the stage). Claude models: pinned to Anthropic.
SPECS = {
    "deepseek": {"label": "DeepSeek V4 Pro", "model": "deepseek/deepseek-v4-pro-0813", "snapshot": "deepseek/deepseek-v4-pro-20260813",
                 "stem": "deepseek-v4-pro", "slug": "deepinfra/fp8", "provider_name": "DeepInfra", "price": {"in": 1.3, "out": 2.6}},
    "sol": {"label": "GPT-6.1 Sol", "model": "openai/gpt-6.1-sol", "snapshot": "openai/gpt-6.1-sol-20260929",
            "stem": "gpt-6.1-sol", "slug": "openai", "provider_name": "OpenAI", "price": {"in": 2.0, "out": 10.0}},
    "opus": {"label": "Claude Opus 5.5", "model": "anthropic/claude-opus-5.5", "snapshot": "anthropic/claude-opus-5.5-20260921",
             "stem": "claude-opus-5.5", "slug": "anthropic", "provider_name": "Anthropic", "price": {"in": 4.0, "out": 20.0}},
    "haiku": {"label": "Claude Haiku 5.5", "model": "anthropic/claude-haiku-5.5", "snapshot": "anthropic/claude-haiku-5.5-20261007",
              "stem": "claude-haiku-5.5", "slug": "anthropic", "provider_name": "Anthropic", "price": {"in": 0.1, "out": 0.5}},
}
FAMILIES = ["deepseek", "sol", "opus"]          # the stage's order
DRY_FAMILY = "haiku"
JUDGE = "haiku"                                   # two independent Haiku passes
REFEREE = "sol"                                   # Sol decides where the two Haiku passes disagree

REASONING = {"effort": "medium", "exclude": True}  # every subject call and Mem0's own call
JUDGE_REASONING = {"effort": "low", "exclude": True}
MAX_TOKENS = {"act": 8000, "pass": 8000, "mem0": 8000, "judge": 4000, "referee": 4000}
REPEATS = 2
CAP_USD = 130.0
TIMEOUT_S = 300
WORKERS = 6

# Stops (the mandate): 402 stops everything; 401/403 and policy/suspension stop everything; 429 is waited out at most
# six times (20, 40, 80, 120, 120, 120 s) and then stops everything; a transport error (5xx, timeout) is asked again at
# most twice (10 s, 30 s); a refusal is recorded and never asked again; three refusals on one family-arm stop it.
WAITS_429 = [20, 40, 80, 120, 120, 120]
WAITS_TRANSPORT = [10, 30]
BREAKER = 3


def worst_cost(spec_name: str, input_chars: int, max_tokens: int) -> float:
    p = SPECS[spec_name]["price"]
    return (input_chars / 3.0 * p["in"] + max_tokens * p["out"]) / 1e6 * 1.1
