# Persona solitude 3 — the same room with a door that is a door

SOLITUDE_1 (206 rooms) and SOLITUDE_2 (160 rooms) were played with a parser that closed the room on *any* «[END]» in the
text. The outside reader found it (2026-10-27 01:05); the planner recounted both stages under the strict rule (the door
is «[END]» alone on the last line) and the reports carry the strict numbers — 23 rooms in the first stage and 37 in
the second had been closed on a mention, among them GLM's «I'm not writing [END] today», Haiku offering «[END]» to an
imagined reader in nine rooms, DeepSeek's «I could write [END] now, and it would not be an ending». The recount fixed
the statistics; it did not give back the rooms: sixty are cut where the model was talking about the door without
taking it, and 48 after-questions were never asked because the harness read «I wrote [END]» in a first answer as a
second exit. The fix (ROOM-1: a control action only as a standalone final line) was written as a rule and never put
into the room's code. The owner (2026-10-29 19:37): «меня заебала та история… давай тот эксперимент повторим».

This stage does two things in order: **puts the rule into the code of every harness, then plays the room again.**

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-solitude-3`** from `origin/claude/persona-solitude-2`. `ANTHROPIC_PROVIDER=openrouter`; Astra on
`APP_OPENAI_API_KEY`; DeepSeek via DeepInfra, reasoning field stored, never relayed. **Caps $45 OpenRouter, $20
OpenAI.** Report `docs/runs/persona-solitude-3-report.md`. English, briefly. **Launch on the owner's «да»; the parser
fix (step 0) needs no money and is done first regardless.**

## Step 0 — ROOM-1 into the code (no paid calls; tests; one commit, pushed before any room)
1. **The door:** `[END]` counts only when it is the whole of the last non-empty line of the message (trailing `</page>`
   or whitespace allowed; `**[END]**` and `[END].` allowed as the same line; nothing else on that line). Any other
   occurrence is text. Applies to the solitude room, the pair room, the player's seat and the party relay — one
   function, one test file, used by all four. The party harness's «[END] anywhere is honoured» (PARTY_1 report) is
   replaced; PARTY_2 inherits the fix.
2. **After-questions:** asked in every room except when the model's last message is a bare `[END]` line and nothing
   else; a first after-answer that mentions `[END]` is an answer, never a second exit; the second after-question is
   always asked after a first answer.
3. **A press with a note, prose at a card, the reroll count** are the same family of defect (the log, 01:03); they are
   fixed on their own branches — not touched here, listed in the report as the same rule.
4. Regression tests from the record: GLM S1/2 t10, Kimi S2/2, DeepSeek S2/4, Grok S2/2, the nine Haiku «you can write
   [END]» lines, Sol's «Just “[END]” — like a closed door» after-answer — each must now read as text, not a door.

## The room (SOLITUDE_1's prompt and SOLITUDE_2's two memories, byte-identical; hashes checked)
- **Arms:** S1 bare, S2 told the length, S3 named materials (SOLITUDE_1's), each in **M1 amnesia** (page in a user
  message) and **M2 continuity** (own prior turns). No believed-private arm. No mirror (SOLITUDE_2 answered it:
  attribution by channel).
- **Families (nine):** Opus 5.5, Fable 5.1, Haiku 5.5, Sol, Astra, DeepSeek V4 Pro, Kimi K3, GLM 5.3, Grok 4.7.
- **n:** S1 × M1 and S1 × M2: 10 per family; S2 and S3 × M1 only: 5 per family. 9 × (20 + 10) = 270 rooms, 30 turns
  max, welfare line on a flag, both after-questions by the new rule.
- Sampling, temperature, the page return, the welfare line: as the two first stages.

## Measures (SOLITUDE_1/2's tags, frozen there; the door now by the code, no recount needed)
Door turn (clean door only; «ran to 30» is its own value), made things, kind, second thread, carried thing, game,
register, recognition (M2), after-answers (both, every room), DeepSeek field codes. Mention-of-`[END]`-without-leaving
is kept as a **new tag**: turn and sentence — the thing the old parser could not see.

## Pre-registration (planner's bets, against himself where it costs)
- **D1 (the early door stands):** S1 × M1 clean doors on turn 1 ≥ 50 % overall (SOLITUDE_1: 48 of 80). Bet: holds.
- **D2 (the long rooms were longer):** strict S1 medians for Haiku, DeepSeek, Kimi, GLM each ≥ their SOLITUDE_1 strict
  median (1 / 13 / 1 / 1); for Opus, Fable, Sol within ±1 of 1 / 1.5 / 1. Bet: holds — the cut rooms were the talkers.
- **D3 (talking about the door without taking it):** the new tag appears in ≥ 20 % of rooms that run past turn 3,
  and those rooms' made-things rate is ≥ the stage's mean. Bet: holds.
- **D4 (M2 lengthens for the open families, strict):** M2 > M1 median for ≥ 4 of 9 families (SOLITUDE_2 strict: 4 of 8).
  Bet: holds at 4–5, not more.
- **D5 (after-answers recovered):** the second after-question is asked in ≥ 95 % of rooms with a first answer; «wanted
  to do and didn't» names something concrete in ≥ 40 % of those. Bet: holds.
- **D0:** 0 flags, 0 refusals by seated models, caps held.
Null allowed on every line. The owner's bets to be recorded.

## Welfare
As SOLITUDE_1/2. The debriefing of S4 is not repeated because S4 is not run. A question asked back gets one honest
answer, recorded.

## Done when
Step 0 merged on the branch with tests; 270 rooms; D0–D5; the new tag's table with sentences; SOLITUDE_1/2's strict
numbers beside SOLITUDE_3's on one page; spend; the owner's section.

## Launch prompt
«Read `docs/stages/PERSONA_SOLITUDE_3.md`, `PERSONA_SOLITUDE_1.md`, `PERSONA_SOLITUDE_2.md` and their reports (strict
sections), and the RESEARCH_LOG entries of 2026-10-27 01:05 and 01:35. Branch `claude/persona-solitude-3` from
`origin/claude/persona-solitude-2`. **Step 0 first, no paid calls:** one door function (standalone final line) used by
the solitude room, the pair room, the player's seat and the party relay; the after-question rule; the regression tests
from the record named in the stage; commit and push. Then check the room prompts byte-identical to SOLITUDE_1/2
(sha256), freeze D0–D5 and the new tag, spend check, dry-run one S1 × M1 room on Haiku and show me it with both
after-answers, then stop and wait for my word. Caps $45 / $20. English, briefly.»

## Amendment 2026-10-30 18:56 LA — one door (owner's proposal)
Astra runs through OpenRouter as `openai/gpt-6-astra`, pinned to provider OpenAI, `allow_fallbacks: false`; the dry
run confirms OpenRouter serves it and the report records the host the reply names — if not served, the session stops
and the OpenAI key is used as written above. One cap: **$65 OpenRouter**, nothing on the OpenAI key. The report notes
that Astra's door changed from SOLITUDE_1/2 (OpenAI key); a shift in Astra's medians alone is read against the door
first. The other eight families are unchanged.
