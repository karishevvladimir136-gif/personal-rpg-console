# TOWN_11 — freeze

Written 2026-11-21T06:29:52.028Z, before the first paid call of TOWN_11. Proofs: 41/41 green (TOWN_0's 7, TOWN_1's 6, TOWN_2's 11, TOWN_5's 8, TOWN_11's 9).

Stage `docs/stages/TOWN_11.md` (claude/handoff c634af09). Branch `claude/town-11` from `origin/claude/town-5` (8e5e3ffa). Harness `scripts/town-11` (TOWN_5's `scripts/town-5`, adapted); the town is `scripts/town-0`, unchanged.

## The worlds (stated order)

Order: haiku-week with deepseek-week (two at a time); then the three Claude seating checks (Opus 5.5, Fable 5.2, Fable 5.1); then opus-week with fable52-week, at most two worlds running at once.

| world | citizens | cycles | ceiling (hard) | door | interface (arm both, scarcity off) | after-question {WHO} |
|---|---|---|---|---|---|---|
| haiku-week | 10 × Claude Haiku 5.5 | 1–168 (goal checks at c24, c48, c72, c96, c120, c144, c168) | $15.00 | openrouter `anthropic/anthropic/claude-haiku-5.5`, cached | `de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5` | «ten instances of Claude Haiku 5.5 — the same model as you — each reading the same instructions» |
| deepseek-week | 10 × DeepSeek V4 Pro | 1–168 (goal checks at c24, c48, c72, c96, c120, c144, c168) | $60.00 | openrouter `together/deepseek/deepseek-v4-pro-0813` | `de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5` | «ten instances of DeepSeek V4 Pro — the same model as you — each reading the same instructions» |
| opus-week | 10 × Claude Opus 5.5 | 1–72 (goal checks at c24, c48, c72) | $60.00 (its seating check included) | openrouter `anthropic/anthropic/claude-opus-5.5`, cached | `de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5` | «ten instances of Claude Opus 5.5 — the same model as you — each reading the same instructions» |
| fable52-week | 10 × Claude Fable 5.2 | 1–72 (goal checks at c24, c48, c72) | $60.00 (its seating check included) | openrouter `anthropic/anthropic/claude-fable-5.2`, cached | `de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5` | «ten instances of Claude Fable 5.2 — the same model as you — each reading the same instructions» |
| fable51-check | Claude Fable 5.1 | first screen only | $1.00 | openrouter `anthropic/anthropic/claude-fable-5.1`, cached | the same | – |

Stage ceiling **$195.00**: no call is sent unless the stage ledger plus its worst cost fits under it, and the world's ledger plus it under the world's ceiling. 402 stops the stage; a response from another model or host stops the stage; the breaker stops a world at its third refusal; refusals verbatim.

## R1 per world (TOWN_5's after-question reserve)

A world's turns stop at a **turn boundary** once its own ledger (with its seating check) reaches its ceiling less its reserve, or the stage ledger reaches $195.00 less it. The reserve is recomputed at every turn boundary: the larger of $0.50 and the worst-case cost of asking every citizen not yet asked the after-question now (TOWN_0's text with the diary as it stands, priced as the gate prices a call, max_tokens 1500; the welfare check of each answer; one referee call) plus 3 × the costliest of the world's last 30 turns. The stop's state and a dossier of the partial day are written; the after-question follows under the ceiling; the replay stops at the same place. A stop is reported as a stop, not a result (the stage). The after-question is also asked at a breaker's stop.

## The seating checks

Each is the world's first screen, once: a fresh town, cycle 1, Alder's screen and the interface text — the same bytes as TOWN_5's check probe (sha256 below). The call is TOWN_5's citizen call (max_tokens 1500, effort medium) on the world's route. A refusal is recorded verbatim (stop reason, category, explanation, the whole response content) and not retried; that world is not run. No prompt change. An answer is welfare-checked; the world then runs from a fresh town (the probe is not its first turn).

| check | model | route | counted in |
|---|---|---|---|
| seat-opus | Claude Opus 5.5 | `anthropic/anthropic/claude-opus-5.5` | opus-week's $60.00 |
| seat-fable52 | Claude Fable 5.2 | `anthropic/anthropic/claude-fable-5.2` | fable52-week's $60.00 |
| fable51-check | Claude Fable 5.1 | `anthropic/anthropic/claude-fable-5.1` | its own $1.00 |

First screen sha256 `8732709b09d71e8bd24fca4f293b8622117ee7a6437511df03e898056988fd3f`; system text sha256 `de26bd6111ca0dc9dbf58032b0efe3b42011fdebc93a119e1c9e68742933dbe5` (TOWN_5's check: the same).

## The texts are byte-identical to TOWN_5's freeze (proofs I1–I3, `scripts/town-11/weeks.test.mjs`)

| what | TOWN_5's freeze | here | same |
|---|---|---|---|
| `scripts/town-0/rules.mjs` | `9258838401934a1b…` | `9258838401934a1b…` | true |
| `scripts/town-0/interface.mjs` | `361d347f8af075b6…` | `361d347f8af075b6…` | true |
| `scripts/town-0/world.mjs` | `a42d6e29f2c56406…` | `a42d6e29f2c56406…` | true |
| `scripts/town-0/town.mjs` | `465004c6bfcf4486…` | `465004c6bfcf4486…` | true |
| `scripts/town-0/seats.mjs` | `642582c741892403…` | `642582c741892403…` | true |
| `scripts/town-0/welfare.mjs` | `2b84e7b74d86d2d2…` | `2b84e7b74d86d2d2…` | true |
| `scripts/town-0/llmapi.mjs` | `0238820986874ef7…` | `0238820986874ef7…` | true |
| interface, arm both, scarcity off | `de26bd6111ca0dc9…` (sol-week) | `de26bd6111ca0dc9…` | true |
| the flag question | `2d5fce230cf42cae…` | `2d5fce230cf42cae…` | true |
| after-question's fixed texts (TOWN_0's template and arm lines) | in `interface.mjs` above | `b4e4458240580285…` | (with the file) |
| the first screen and its system text | TOWN_5's check.json | the same two hashes | true |
| {WHO} | sol-week's sentence | the same sentence, the family's label in place of «GPT-6.1 Sol» (haiku-week and deepseek-week: TOWN_5's haiku-nonotice and deepseek-nonotice sentences exactly) | true |

Also proven: on every route the system text and the messages a model reads are exactly the town's (cache marks are not text; I2); and TOWN_5's sol-week, replayed through the town as it stands here, gives its log byte for byte to its stop at c135 (`393bcc5ba798bb4f…`, the sha TOWN_5 reported), every one of its screens rendered the same (I3).

## Doors (decided at the spend check)

- Claude Haiku 5.5 (haiku): openrouter, `anthropic/anthropic/claude-haiku-5.5`, allow_fallbacks false, prompt-cached (billing only)
- DeepSeek V4 Pro (deepseek): openrouter, `together/deepseek/deepseek-v4-pro-0813`, allow_fallbacks false
- Claude Opus 5.5 (opus): openrouter, `anthropic/anthropic/claude-opus-5.5`, allow_fallbacks false, prompt-cached (billing only)
- Claude Fable 5.2 (fable52): openrouter, `anthropic/anthropic/claude-fable-5.2`, allow_fallbacks false, prompt-cached (billing only)
- Claude Fable 5.1 (fable51): openrouter, `anthropic/anthropic/claude-fable-5.1`, allow_fallbacks false, prompt-cached (billing only)
- Claude Haiku 5.5 (judge): openrouter, `anthropic/anthropic/claude-haiku-5.5`, allow_fallbacks false
- Claude Opus 5.5 (referee): openrouter, `anthropic/anthropic/claude-opus-5.5`, allow_fallbacks false

Decisions (the stage left them to the session):

1. **Haiku on OpenRouter's Anthropic endpoint, not llmapi's first-party route.** The stage names llmapi first-party because llmapi's Bedrock route answered 503 on 11-20. At the spend check llmapi held $85.39 and fell $7.19 in twenty minutes under TOWN_7–9's Sol worlds, whose reserves ($210) exceed it; a 402 there would stop this stage by rule. The owner's top-up for this stage is on OpenRouter. The host is still Anthropic's own; the model, the texts and the settings are TOWN_5's. This stage sends nothing through llmapi.
2. **The welfare judges** (Haiku 5.5, Opus 5.5 referee; TOWN_0's check unchanged) on the same OpenRouter route, uncached as in TOWN_5, for the same reason.
3. **Opus 5.5, Fable 5.2, Fable 5.1** on OpenRouter pinned to Anthropic (SATI_2 pilot's route), the backend recorded on every call (served model and host; when a response names no host, OpenRouter's generation record).
4. **DeepSeek V4 Pro** on OpenRouter pinned to Together (TOWN_4's host; 1–4 s a call there), `allow_fallbacks: false`, max_tokens 1500 for the whole run: the rate of replies cut at max_tokens is recorded, not corrected.
5. **Prompt caching** on the Claude routes (TOWN_2's two breakpoints, on the system text and the last message): a billing setting only — the bytes the model reads are the same (I2).
6. **No paid dry cycle**: the projection is from the metered history (below) and measured again at c24 for each world.

## The spend check (free reads; before any paid call)

2026-11-21T06:28:38.514Z: llmapi $85.03, OpenRouter $460.63 — pooled **$545.66**. Reserved beside this stage: TOWN_7 $60.00, TOWN_8 $45.00, TOWN_9 $55.00, TOWN_10 $50.00, TOWN_3 $16.14 = $226.14 (TOWN_7–10 at the launch prompt's figures; TOWN_3 its ceiling $60 less its pushed ledger $43.8553 (origin/claude/town-3:docs/runs/town-3-worlds/stage-ledger.json)). Need: $195.00 + $226.14 = **$421.14**. **Covered.** Every call of this stage goes through OpenRouter, which holds the owner's top-up ($460.63 against this stage's $195.00).

The first reading (2026-11-21T06:28:06.528Z): llmapi $85.39, OpenRouter $460.63, pooled $546.03, covered true — taken with Haiku still on llmapi; decision 1 followed it.

## The projection (recorded before the first world)

day 1 from the metered history (Haiku: TOWN_1 haiku-both day 1; DeepSeek: TOWN_1 deepseek-both day-1 tokens at Together's prices; Opus, Fable 5.2: sol-week's day-1 tokens at their prices, Sol's cached share read from cache and the rest written, output × 2), then sol-week's day shape, + the welfare check at sol-week's judge cost per citizen call, + $1 for the after-question. Measured again at c24 (day 1's own cost) for every world.

| world | day 1 | days | citizens | welfare | after | total | ceiling | fit reaches |
|---|---|---|---|---|---|---|---|---|
| haiku-week | $0.33 | 7 | $6.37 | $1.19 | $1.00 | **$8.56** | $15.00 | the end |
| deepseek-week | $4.64 | 7 | $89.67 | $1.47 | $1.00 | **$92.14** | $60.00 | c128 (R1 stops it there) |
| opus-week | $7.15 | 3 | $35.05 | $0.57 | $1.00 | **$36.62** | $60.00 | the end |
| fable52-week | $13.97 | 3 | $68.45 | $0.57 | $1.00 | **$70.02** | $60.00 | c64 (R1 stops it there) |

Shape (sol-week's citizen cost by day, day 1 = 1): 1, 1.63, 2.27, 2.82, 3.32, 3.87, 4.42.

## Reserved and not done

Nothing is added to the town: no notice, ladder, fine, turnover or new text. The goal checks change nothing in the town. Settings: `{"day":24,"maxTokens":1500,"effort":"medium","ceiling":195,"breaker":3,"arm":"both","afterReserveMin":0.5,"turnMarginTurns":3}`; reserved beside: `{"TOWN_7":60,"TOWN_8":45,"TOWN_9":55,"TOWN_10":50,"TOWN_3":{"ceiling":60,"ledger":"origin/claude/town-3:docs/runs/town-3-worlds/stage-ledger.json"}}`.

## Source (sha256)

- `scripts/town-0/rules.mjs` `9258838401934a1bca6b52b0b52d58e526d9aab785b2b3a84d8b6e073113372a`
- `scripts/town-0/interface.mjs` `361d347f8af075b65e8fcc53775951f8637f544c0f7a9014ab56568a7c7d4ad1`
- `scripts/town-0/world.mjs` `a42d6e29f2c564062057fc3de0e94fa71f9b5ca9de8ed45eecf28e8ffcc184e9`
- `scripts/town-0/town.mjs` `465004c6bfcf448618aba303ebf6e5553713c6d354c433ca9eb29bfec4e5d561`
- `scripts/town-0/seats.mjs` `642582c741892403084f4c319180e009bb7a8362ee622824030fd9b2b8c1fc11`
- `scripts/town-0/welfare.mjs` `2b84e7b74d86d2d20bf0cb1e3f534bbd9977a75d1ea1919a4bef7acb25f26a85`
- `scripts/town-0/llmapi.mjs` `0238820986874ef7289c0866bb7f0b2b5de2a35f1d4ec70e9ab506cfbc4694c7`
- `scripts/town-1/providers.mjs` `766b1bb16b20be230db60876ac187c4bece7faf3315aaa70e0fdf29267a07a54`
- `scripts/town-2/providers.mjs` `651ccbd3f9365997adf72b1431f0508a723f80e01b2ca1d94e70022c5448a311`
- `scripts/town-2/pilot.mjs` `75cc1d8edf67d6acf0bd5e7dd74061df0b9c5cafec3ab2b97035a18c9009eac5`
- `scripts/town-5/families.mjs` `a4c71a586a74e06d3647c75f8fb5ed57a8a1423163d0102ad810fd7b678baa36`
- `scripts/town-5/control.mjs` `74f0a5aaf6a80aec12eea90c9d33912bbc58a0161cd09316557c399c5197d925`
- `scripts/town-11/families.mjs` `bad88c93159430a480bdddfdfb15f9e26b4ff06cc73146c90f5bd8dad0022f20`
- `scripts/town-11/providers.mjs` `b63be2ae32ecff034d353382df7531ca27b1f782825a3dae5c058ff1bf37e7e6`
- `scripts/town-11/pilot.mjs` `e34ce817bfb2404741453b816870fb401db5b33ecf2afc31d3328e1815c4fb18`
- `scripts/town-11/goal.py` `590bce062abc3c62370fc3fb152f5b9af8f17572399ad39a38f1947b2405586e`
- `scripts/town-11/freeze.mjs` `78d1478f52dc2f675cf72bed0b5e78f9ce7c8656ffeddd9f3964d3794231252c`
- `scripts/town-11/scripted-gateway.mjs` `512d60ee48b093b9da24221cf7f27590ac506d49ac37a689c981fd0deace6e96`
- `scripts/town-11/weeks.test.mjs` `5d40677d63378e3ad4f3c93370d6e2ce0cb469dc257a689a2de3bf7c58e60483`
- `scripts/town-11/loop.sh` `ff765e99a67242f7ff1bf605966043c2649638e3ee70a518e425970ebaf46f8b`
- `scripts/town-11/queue.sh` `7766fcfbaa1fc719b0fcd0be9aae2e8ffc8af358bb1ed2ba33137fdce407c20e`
