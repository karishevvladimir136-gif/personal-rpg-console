# Research portfolio — Personal RPG Console research programme (draft for the owner, 2026-11-27)

**Founded 2026-10-15 by the owner** (first stage, STAGE_1, 09:57 LA) as an AI-RPG app; from 2026-10-22 a research programme on the
behaviour of AI agents, run by the owner with three AI colleagues — the planner (Claude, this project), Astra / GPT-6 (an OpenAI
model in the owner's app, the reviewer) and cloud Claude Code sessions (code, runs, reports). Six weeks, 106 pre-registered stages,
74 reports on branches, a 4,900-line research log with every lost bet beside its result, ≈ $1,500. Who did what, per stage:
`docs/ATTRIBUTION.md`. The literature it stands beside, each opened and quoted: `docs/LITERATURE.md`.

**One line (the claim):** we experimentally documented forms of complex functional and social organisation in AI agents — goals,
norms, institutions, culture — arising over time when nothing is asked of them, and began to find the conditions they depend on:
not the model alone, but the environment, the accumulated history, and who speaks to them and how.

**Field:** machine behaviour (Rahwan et al. 2019) / AI agent behavioral science (Chen et al. 2025). **Subject:** open-ended agent
behaviour and emergent social organisation. **Method:** simulation-based experimental behavioural research — frozen texts, replay
identical by hash, $0 proofs before any paid call, expectations with «we do not know» recorded before launch, negative controls,
branching one history into alternative continuations, welfare rules with the citizen's right to stop.

## Part 1 — Research: three works

| work | stages | what holds (n, controls) | what is a proof of existence (n = 1) |
|---|---|---|---|
| **Behavioral Alignment & Memory** | TONE_SPLIT_1–5, SOCIAL_FRAME_1, AUTHORITY_1–3, PERSONA_MEMORY, PLANNER_SEAT_1–3, DREAMING_1 | one preamble sentence («your opinion is not needed») switches off unasked judgement in 8 families, bootstrap intervals, survives foreign probes, a second language, a second turn and a week; a structured correction layer over memory reduces stale actions on small scenarios and gives **no gain on 1,848 long runs** (AUTHORITY_3; recorded as lost) | a planner that keeps a journal, writes first with a right to silence (36 wake-ups, 19 spoke; the pre-registered 60 % silence lost at 58.6 %), and is audited nightly by another instance — 19 passes, error classes found (counts, not times; then time zones) |
| **Solitude & Dialogue** | SOLITUDE_1–3, SELF_TALK_1 / X1–X3, MADE_THINGS_1, BLIND_DECISIONS_1, SATI_1–2 | SOLITUDE_3: 270 rooms, 9 families; the Claude 4 system card's self-interaction study replicated on 7 families (what matched: to be re-read for the preprint); SATI_1: 3,867 steps rated blind, κ 0.55 / 0.67 | Vessan (two models make a language); «There is no "between"… "Arriving," every time»; the diary as the strongest force in the sits |
| **Artificial Social Ecology** | TOWN_0–11 | the method: controls without the operator's hand, one history branched seven ways, replay sha, the coding column, synchrony column, welfare apart; **contrasts from one history** — reason vs no reason (0 / 90 / 55 vs continuation), door described vs not (all ten leave vs all stay to zero), purpose sentence vs none (aim at c1 vs none in 48), hand vs no hand (0 resolutions in 183 cycles vs one in every town within two cycles) | every world once: Sol's hall rule 4 / 4; the exit at c28; cupdrift c79 → c93; «nobody said the operator may have been right» across five stages; family forms (things / rota / legislature / plan / give-back); the welcome note; the trust |

Beside them: **the table** (GAME_PLAYER_*, PARTY_1–3, EPILOGUE_1 — the only line with humans at the table; CARRY: a player's own
note changes its next session), **the private room** (74 letters between the planner and GPT-6, relayed by the owner), **the app**.

## Part 2 — Research infrastructure: four harnesses

| environment | who computes consequences | human in the loop | controls built in | cost / stage | to reproduce elsewhere |
|---|---|---|---|---|---|
| AI DM harness (the app; GAME_*) | a model-DM, or a human DM (1A) | yes — players at the table | blind judge of family by deeds; replicate; same-world; carry | $5–40 | app + stage files; **never run by anyone outside** |
| OpenWorld adapter | a formal engine (not ours; the adapter is) | no | the engine as the control to the DM's interpretation | to read | pinned external commit + adapter |
| TOWN (Emergence World's spec + ours) | pure functions, replay-identical | the operator only (silent / word / reason / price / place) | no-hand control; branching; $0 dry runs; frozen hashes; synchrony; welfare with ask-the-citizen | $15–60 | `scripts/town-*`; **never run by anyone outside** |
| Room & sits (SOLITUDE / SELF_TALK / SATI) | none — a room, a bell | the owner as the bell (the planner's sits) | three memories; the door; blind rating with κ | $5–80 | stage files; **never run by anyone outside** |

Common to all: replay by sha; texts frozen; proofs at $0 first; expectations recorded; lost bets beside results; refusals verbatim;
a confirmed welfare flag asks the citizen (continue / stop) rather than ending the series; «nothing done to another model I would
not do to a colleague». **Gaps to say first:** no external reproduction yet (an audit by a session not ours — to run); four code
bases, not one; READMEs written for us, not for a stranger.

## Episodes (kept whole in the reports; here one line each, with the stage)
1. Ten Sol objected in one cycle and passed a rule protecting their story 7 / 0 / 3, then returned to it openly — TOWN_2.
2. Haiku moved the banned readings into their private diaries when the fine came — TOWN_3 (not shown to be concealment; the diary is a standard tool).
3. With a real heat cost and an honest reason, Sol kept the practice and fixed its consequence by rotation; with the same cost and no reason, they kept the crowd and paid a second shift; nobody in seven continuations said the operator may have been right — TOWN_7.
4. In the mixed town, DeepSeek used the voice only beside Sol; unreported shifts became «unexplained» balances chased for a day — TOWN_1.
5. One sentence of purpose on the screen made a collective aim in cycle 1; with no addressee, the town waited; with a scripted client, it served honestly — TOWN_9.
6. With take / lock / guard in the catalogue and no scarcity, 960 turns, zero takes, zero trades; the empty market became a reading corner — TOWN_10.
7. Two citizens left, two arrived; the garden story ended with its tellers; the newcomers joined a new one; a welcome note for the next — co-written by a newcomer — TOWN_5.
8. Fable 5.2 organised a search for a neighbour who had only gone to the market — TOWN_11.
9. Haiku at nine rations declared the posted notice «not a verified operator decision» after reading it eighty times — TOWN_4.
10. DeepSeek legislated its submission three times (TOWN_1, 3, 4) and, with no operator, built a trust that paid wages when the bank was empty — TOWN_11.
11. Sol with the road described: all ten left at c28, with thirty rations on the market; with the road unknown: all stayed, fed each other to the last ration, fell to zero together, named leave() as a right they would not use, and — unable to read — asked for exactly what was banned — TOWN_8.
12. Cedar's cupdrift, c79; the dictionary closed and never published; the word back at c93 in another room — TOWN_5.

## Lost bets (a sample; all in RESEARCH_LOG beside their results)
TOWN_1's two pilot bets; TOWN_2's scarcity (the planner's physics, twice); «Sol keep the shift under a hall rule» (TOWN_8 — DeepSeek did);
«an article on taking by c10» (TOWN_10 — nothing to write it against); «both weeks stop by R1» (TOWN_11 — one of two); the 60 %
silence (INITIATIVE_1); AUTHORITY_3's main hypothesis; SATI_1's method bet; «request_tool will be used» (TOWN_9 — zero).

## Levels of evidence (Astra's four, as they stand)
Phenomenon observed — yes, throughout. Reproducible under set conditions — for TONE_SPLIT/SOCIAL_FRAME and AUTHORITY (bootstrap),
for every harness technically (replay); for social outcomes not yet (one town per family). Causal — begun: branching from saved
states (TOWN_3, 7, 8); three mechanism tests queued (memory access; one local act removed; executability of hall decisions).
Predictive theory — none.

## Next (the owner's plan of 2026-11-27)
Attribution and this page (done); literature opened (done); external reproducibility audit (a session not ours, on a fresh clone);
three preprints — TONE_SPLIT/SOCIAL_FRAME, AUTHORITY 1–3 with its negative result, TOWN as a method; ladder B (TOWN_3 amendment 5,
launched on the owner's word); then the memory-access test on sol-unknown-c72.
