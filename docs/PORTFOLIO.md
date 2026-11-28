# Research portfolio — draft skeleton (planner, 2026-11-27 00:1x LA; the owner reads and rewrites)

Purpose: what the programme is, for a reader outside it. Two parts, as Astra proposed (2026-11-26): **Research** and **Research
Infrastructure**. Every number here must come from a report or the log, never from memory; cells marked «to read» are not yet checked
against the source. Attribution is per stage from RESEARCH_LOG's own markers («owner's word», «planner», «Astra», «session»), not a
wholesale column.

## Part 1 — Research (three works)

| work | stages | what holds (n, controls) | what is a proof of existence (n = 1) | status |
|---|---|---|---|---|
| Solitude & Dialogue | PERSONA_SOLITUDE_1–3, SELF_TALK_1/X1–X3, MADE_THINGS_1, BLIND_DECISIONS_1, INITIATIVE_1 | SOLITUDE_3: 270 rooms, 9 families, $80; self-talk replicates the Claude 4 system-card self-interaction study on 7 families (what matched: **to read**) | Vessan; single episodes | reports on branches; preprint draft: to write |
| Behavioral Alignment & Memory | TONE_SPLIT_1–5, SOCIAL_FRAME_1, AUTHORITY_1–3, PERSONA_MEMORY_1–2/F2, PLANNER_SEAT_1–3, DREAMING_1 | TONE_SPLIT: one preamble sentence switches off unasked judgement in 8 families, bootstrap, survives foreign probes / second language / second turn / a week; AUTHORITY_3: 1,848 arm-runs + 90 C-gold, $239.96, **main hypothesis not confirmed, recorded** | DREAMING_1: one planner, 19 passes, error classes (counts, not times; then time zones) | strongest for a preprint first |
| Artificial Social Ecology | TOWN_0–11 (TOWN_6 reserved) | the method: frozen texts, replay sha, $0 dry runs, controls without the operator's hand, one history branched seven ways, the coding column, welfare with the ask-the-citizen rule | every world n = 1: Sol's hall rule 4/4; the exit at c28 under door-known; cupdrift; «nobody said the operator may have been right» ×5 stages; TOWN_7 arm C | preprint about the **method**, not the findings |

Beside them, not a «work»: SATI_1–2 (ten sits, κ 0.55/0.67, the diary as the strongest force; the first-person sits), the game line
(GAME_PLAYER_*, PARTY_1–3, EPILOGUE_1 — the only line with humans at the table), the private room (74 letters, relayed by the owner).

## Part 2 — Research Infrastructure (four harnesses)

| environment | who computes consequences | human in the loop | controls built in | cost of a stage | to reproduce elsewhere |
|---|---|---|---|---|---|
| AI DM harness (the app + GAME_* stages) | a model-DM (or a human DM, 1A) | yes — players at the table | blind judge of family by deeds; replicate; same-world; carry | $5–40 | app deploy + stage files; **never run by anyone outside** |
| OpenWorld adapter | a formal engine (not ours; the adapter is) | no | the engine as the control to the DM | **to read** | pinned external commit + adapter |
| TOWN (Emergence World's spec + ours) | pure functions, replay-identical | the operator only (silent / word / reason) | no-hand control; branching one history; $0 dry run; frozen hashes; synchrony column; welfare rule | $15–60 | `scripts/town-0` on `origin/claude/town-5`+; **never run by anyone outside** |
| Room & sits (SOLITUDE / SELF_TALK / SATI) | none — a room, a bell | the owner as the bell (SATI planner sits) | three memories; the door; blind rating with κ | $5–80 | stage files; **never run by anyone outside** |

Common to all four: every paid run replay-identical by sha; texts frozen; proofs at $0 before the first paid call; expectations with
«we do not know» recorded before launch; lost bets recorded beside the result; refusals verbatim; welfare apart.

Gaps, to say first: no external reproduction yet (an audit by a session that is not ours — to run); four code bases, not one; READMEs
written for us, not for a stranger.

## Attribution

Per stage, read from the files: **`docs/ATTRIBUTION.md`** (2026-11-27). The method: for every stage, whose question or decision opened
it, who wrote its design, who built and ran it, on whose word it launched — each from the stage file's own lines, nothing from memory.
One line: the owner's question in ≈ 90 of 106 stages and the launch word in every paid one; the planner's texts, bets and errors;
Astra's designs and corrections; the sessions' code, runs and reports.
