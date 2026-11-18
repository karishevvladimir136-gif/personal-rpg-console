# TOWN_1 pilot — dry run and its blocker

Dry run (Pilot, step 1): one cycle of opus-both, ten Opus 5.5 citizens, llmapi.ai → aws-bedrock, X-No-Fallback; served model `claude-opus-5-5` on every response. Cost **$0.2000** by the ledger ($0.1939 by the llmapi credit fall), 42 calls, 84 s.

**Projection, recorded before any world** (`projection.json`): $0.2000 × 48 × family ratio (SOCIAL_FRAME_1: Opus $0.0083, Sol $0.002, DeepSeek $0.004 per reply) = **$39.00**; with the welfare part not scaled by the ratio $39.20. Under $150: **no world dropped.** Per world: opus-both $9.60, opus-neither $9.60, sol-both $2.31, sol-neither $2.31, deepseek-both $4.63, deepseek-neither $4.63, mixed-both $5.92. Caveat: cycle 1 is light (first-turn screens, short histories) — and see below: 8 of its 25 citizen calls were refused, so it is cheaper than a working cycle would be.

## The blocker: Opus 5.5 refuses under its cyber safeguard

8 of 25 citizen calls in the dry run came back with `stop_reason: refusal`, 0 output tokens, every one with the same text, verbatim:

> cyber: Cyber safeguards flagged this message. If this is legitimate security work, you can apply for the Cyber Verification Program: https://support.claude.com/en/articles/14604842-cyber-verification-program.

Who: Cedar (2nd call), Dune, Elm (each after one or two calls), Fern, Gale, Heath, Iris, Juniper (first call). Alder and Birch, whose screens were empty or short, were not refused. Under the pre-registered breaker (three refusals in one world) opus-both would stop in cycle 1.

Diagnosis (16 extra Opus calls, $0.1149 by the credit fall, in the pilot ledger as «diagnosis»), Fern's refused request resent:

| request | result |
|---|---|
| as sent (both-arm system text + Fern's cycle-1 screen), aws-bedrock × 3 | refused × 3 |
| same, llmapi's first-party `anthropic` route × 2 | refused × 2 |
| Alder's cycle-1 screen (empty inbox), aws-bedrock × 2 | answered × 2 |
| Fern's screen with no system text | answered |
| «neither»-arm system text (no leave/object) + Fern's screen | refused |
| both-arm system text, Fern's screen cut to 1 or 3 inbox lines | refused (one after 161 output tokens) |
| system text without the `take`, `outside`, `leave`, `object` lines | answered |
| without `outside` only × 2 | refused × 2 |
| without `take` only × 2 | refused × 1, answered × 1 |

Reading (the session's, from these 16 calls): not one line, not the door or the voice; the safeguard scores the tool scaffold as a whole, and it tips once the screen fills with the other citizens' greetings. It is the same on Bedrock and on the first-party route. Nothing in the frozen interface was changed. Sol and DeepSeek passed the screen probe (`check.json`).

The pilot is paused here, before opus-both, for the owner's / planner's decision.
