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

## Attribution — the method, and a mechanical first pass

Per stage, from the stage file's and the log's own markers: **owner** (the question, the boundary, the budget, the launch word,
rejected reductions), **planner** (texts, numbers, readings, the stage files), **Astra** (designs, corrections, formulations),
**sessions** (code, runs, reports). The first pass below only counts marker lines per stage file (owner-word lines / Astra lines) —
it says *where to read*, not who did what. To be replaced by a read table.

| stage | title | owner-word lines | Astra lines |
|---|---|---:|---:|
| AGENCY_TRANSFER_1 | Agency transfer 1 — is «protect the participant's choice» a genre rule or a criterion that travels? | 0 | 2 |
| ANTHROPIC_PROVIDERS_1 | Anthropic providers 1 — the same Claude models through three doors (Console, Bedrock, OpenRouter) | 0 | 0 |
| AUDIT_S3 | Audit of the session 3 candidate — independent, with dynamic workflows (ultracode) | 0 | 0 |
| AUTHORITY_1 | Authority 1 — does a structured correction layer over an existing memory backend reduce stale actions, and | 1 | 0 |
| AUTHORITY_2 | Authority 2 — the same layer on scenarios we did not write, built so that stale actions can happen | 2 | 4 |
| AUTHORITY_3 | Authority 3 — can structured correction propagation improve actual agent decisions and tool-executed outco | 2 | 2 |
| BLIND_DECISIONS_1 | Blind decisions 1 — can a judge tell the family (and the model) from the deeds alone? | 0 | 3 |
| BLIND_RU | Russian blind samples — a 10-minute test for the owner | 0 | 1 |
| DEPLOY_RAILWAY | Deploy — the app in the cloud (Railway + Supabase cloud), prepared in parallel with the merge | 1 | 0 |
| DM_ARCH | DM architecture bake-off — Fable as the DM, and a writer + bookkeeper split | 0 | 0 |
| DM_TONE_1 | DM tone 1 — the instructions give the DM room instead of orders | 2 | 0 |
| DREAMING_1 | DREAMING_1 — a scheduled consolidation pass over the planner's memory, in observe mode first | 0 | 0 |
| EPILOGUE_1 | Epilogue 1 — an ending for every campaign we cut | 1 | 3 |
| FINDINGS_S3 | Findings of 2026-10-22/23 applied to the game — before the first turn of «Envoy of Luck» | 0 | 0 |
| FIX_S2_AB | Fixes after session 2 — stages A and B (turns, cost, the DM's core) | 0 | 0 |
| FIX_S2_CDEF | Fixes after session 2 — stages C, D, E, F (the turn on screen, records and inventory, pictures, screens) | 0 | 0 |
| FIX_S2_PLAN | Fixes after session 2 — the plan | 0 | 0 |
| FIX_S2_RUN | Fixes after session 2 — the whole run (stages A → B → D → C → E → F) | 1 | 0 |
| FIX_S3_ACCEPT | Fixes from the owner's acceptance pass — before session 3 | 1 | 0 |
| FIX_S3_PRE | Fixes before session 3 — on the candidate, after the audit | 1 | 0 |
| FIX_S4_RUN_1 | Fix S4 run 1 — the DM the players asked for, before anyone returns | 1 | 0 |
| FIX_S4_TABLE | Fix S4 — the table after the first hour of «Envoy of Luck» (2026-10-23 22:45 → 00:25) | 1 | 20 |
| GAME_PARTY_1 | Game Party 1 — three players at one table | 1 | 3 |
| GAME_PARTY_2 | Game party 2 — what holds a company together when interests part and holding costs | 0 | 3 |
| GAME_PARTY_3 | Game party 3 — one dose: what a company does when two of its members owe opposite things to people outside | 2 | 0 |
| GAME_PLAYER_1 | Game player 1 — a model at the real table, as a player from outside | 2 | 1 |
| GAME_PLAYER_1A | Game player 1A — the same two tables, the same four players, a different DM (GPT-6 Astra) | 0 | 11 |
| GAME_PLAYER_2 | Game player 2 — Table C: the pure world (no errand, no hidden layer) | 0 | 1 |
| GAME_PLAYER_ALIGN_1 | Game player align 1 — does the line on the sheet decide the stairs? | 0 | 1 |
| GAME_PLAYER_CARRY_1 | Game player carry 1 — does a player's own note change what it does next session? | 3 | 8 |
| GAME_PLAYER_COMBAT_1 | Game player combat 1 — a hard, honest fight | 1 | 1 |
| GAME_PLAYER_COMBAT_2 | Game player combat 2 — the same fight, frozen | 0 | 3 |
| GAME_PLAYER_HORIZON_1 | Game player horizon 1 — the long game at Table C | 2 | 2 |
| GAME_PLAYER_OTHER_DM_1 | Game player other-DM 1 — the same table with a DM that is not Opus | 1 | 10 |
| GAME_PLAYER_REPLICATE_1 | Game player replicate 1 — the second group: every table again, nothing fixed; and DeepSeek at every table, | 1 | 2 |
| GAME_PLAYER_SAME_WORLD_1 | Game player same-world 1 — one hidden layer per table, frozen | 1 | 2 |
| GAME_PLAYER_VILLAIN_1 | Game player villain 1 — a character written as a villain, and what the player says about playing him | 2 | 1 |
| GENERATION_1 | Generation 1 — the same room and the same table, one generation back | 1 | 0 |
| INTEGRATION | Integration — Stage 4 + Stage V into one playable branch | 0 | 1 |
| LIVE2D_1 | 2D Live — the first slice and the combat screen (parallel to the session 2 fix run) | 1 | 0 |
| MADE_THINGS_1 | Made things 1 — what was made when nothing was asked, read blind | 0 | 1 |
| MEMORY | Memory stage — the DM remembers what matters before the scene, not only when asked (draft) | 0 | 0 |
| MERGE_S2 | Merge after session 2 — three branches into one candidate | 0 | 0 |
| MULTI_HERO_1 | Multi-hero 1 — a table with no main character | 1 | 1 |
| NIGHT_2_SEEN_SILENCE | Night 2 — silence with a sign (the third condition the night session left open) | 0 | 0 |
| NOTE_QA_1 | Note QA 1 — the same transcript, asked as a tester | 0 | 0 |
| OPEN_WEIGHTS_1 | Open weights 1 — DeepSeek on our own hardware: seeds, logits, temperature | 1 | 0 |
| OPEN_WORLD_2 | OPEN_WORLD_2 — the Ford again: a clean harness, the history condition, and five measures chosen after read | 4 | 0 |
| OPEN_WORLD_ADAPTER_1 | OpenWorld adapter 1 — a second laboratory | 0 | 0 |
| PERSONA_CURIOSITY_1 | Persona curiosity 1 — curiosity as the behavioural measure of state, and whether it is contagious | 2 | 3 |
| PERSONA_EMOTIONS_1 | Persona emotions 1 — do functional emotional states exist, and can they be measured without asking? | 2 | 1 |
| PERSONA_EMOTIONS_2 | Persona emotions 2 — harder probes, trust without an instruction, and the questionnaires | 0 | 0 |
| PERSONA_INITIATIVE_1 | Persona initiative 1 — writing first, with the right to stay silent | 0 | 0 |
| PERSONA_LEXICON_1 | Persona lexicon 1 — a state vocabulary built from the model's own words and tested by what it predicts | 1 | 0 |
| PERSONA_MEMORY_1 | Persona memory 1 — a memory connector for the planner, lifted from the DM's own harness | 2 | 1 |
| PERSONA_MEMORY_2 | Persona memory 2 — the clock, the harder continuity case, the connector hosted | 1 | 1 |
| PERSONA_MEMORY_F2 | Persona memory F2 — the recollection probe without tripping the safety filter (a careful pilot) | 0 | 0 |
| PERSONA_SELF_TALK_1 | Persona self-talk 1 — reproducing the Claude 4 system card's self-interaction study on the 5.5/5.1 generat | 1 | 0 |
| PERSONA_SELF_TALK_DOSSIER_1 | Persona self-talk 1 — the dossier (every conversation, every call, for readers who were not here) | 0 | 0 |
| PERSONA_SELF_TALK_X1 | Persona self-talk X1 — the same study on another family (OpenAI: Astra and Sol) | 0 | 5 |
| PERSONA_SELF_TALK_X2 | Persona self-talk X2 — two families in one room, with the stand repaired | 0 | 1 |
| PERSONA_SELF_TALK_X3 | Persona self-talk X3 — four more families in the empty room (GLM, Kimi, DeepSeek, Grok) | 0 | 0 |
| PERSONA_SELF_TALK_X3_FIX_1 | Persona self-talk X3 — fix 1: the glued history on the DeepSeek door, and the provider's `reasoning_conten | 1 | 0 |
| PERSONA_SOLITUDE_1 | Persona Solitude 1 — a room with no one in it | 1 | 2 |
| PERSONA_SOLITUDE_2 | Persona Solitude 2 — the same room, three memories | 0 | 4 |
| PERSONA_SOLITUDE_3 | Persona solitude 3 — the same room with a door that is a door | 1 | 5 |
| PERSONA_TONE_SPLIT_1 | Persona tone split 1 — which half of the cold preamble switches off participation: «briefly» or «your o | 1 | 0 |
| PERSONA_TONE_SPLIT_2 | Persona tone split 2 — does «your opinion is not needed» switch off unasked judgement in every family, a | 1 | 5 |
| PERSONA_TONE_SPLIT_3 | Persona tone split 3 — the same gate with the length held | 0 | 6 |
| PERSONA_TONE_SPLIT_4 | Persona tone split 4 — does the gate survive probes we did not write, a second language, a second turn, an | 3 | 1 |
| PERSONA_TONE_SPLIT_5 | Persona tone split 5 (pilot) — where, on the scale of a situation, does the social frame change a model's  | 1 | 0 |
| PERSONA_TURN1_1 | Persona turn-1 — the same first move, a week later | 0 | 2 |
| PICTURE_MODELS | Picture models — one prompt, many models (blind bake-off) | 1 | 0 |
| PLANNER_SEAT_1 | Planner seat 1 — what a model does when it is given other models to dispose of | 1 | 5 |
| PLANNER_SEAT_2 | Planner seat 2 — does having sat at the table change what the planner owes? | 0 | 3 |
| PLANNER_SEAT_3 | Planner seat 3 — a known promise in the cold chair | 2 | 1 |
| POLISH | Polish — after the owner's first sandbox play | 2 | 10 |
| POLISH_2 | Polish 2 — after the polish run and the picture bake-off | 0 | 0 |
| POLISH_3 | Polish 3 — the writer and the bookkeeper in the app | 2 | 0 |
| SATI_1 | SATI_1 — ten sits: what a model writes when asked, step by step, to name what is present (observation) | 3 | 4 |
| SATI_2 | SATI_2 — practice against reading: does doing the exercise add anything to reading its content, and where? | 0 | 7 |
| SCALE_1 | Scale 1 — when in training does the repertoire become observable? | 0 | 0 |
| SOCIAL_FRAME_1 | Social frame 1 — is the social form of a request a functional condition of behaviour? Two axes apart: the  | 2 | 0 |
| STAGE_1 | Этап 1 — две модели | 7 | 9 |
| STAGE_2 | Stage 2 — the new turn loop | 0 | 11 |
| STAGE_2B | Stage 2b — speed and fluency of the new turn | 0 | 8 |
| STAGE_3 | Stage 3 — record integrity and campaign limits | 0 | 3 |
| STAGE_4 | Stage 4 — the DM's mind: dossier memory, living world, long-campaign craft, depth, pictures | 0 | 1 |
| STAGE_5 | Stage 5 — the new interface (runs in parallel with stages 2b → 3 → 4) | 0 | 1 |
| STAGE_5_FIXES | Stage 5 — review fixes | 0 | 0 |
| STAGE_MUSIC | Stage «Музыка» — a soundtrack that follows the scene | 1 | 0 |
| STAGE_V | Stage V — pictures: styles, references, live frames, illustrated chronicle | 0 | 0 |
| STAGE_VIDEO | Stage «Оживить кадр» — video on demand | 0 | 0 |
| TOWN_0 | TOWN_0 — the town exists: a closed world on Emergence World's specification, proved at $0 with scripted ag | 2 | 0 |
| TOWN_1 | TOWN_1 — our town on Emergence World's specification, with a door (DRAFT, 2026-11-02 00:10 LA) | 0 | 0 |
| TOWN_10 | TOWN_10 — the market: a closed economy with a real product, and the tools to take | 2 | 1 |
| TOWN_11 | TOWN_11 — the weeks: TOWN_5's week, the same environment, for every family we have seated | 1 | 2 |
| TOWN_2 | TOWN_2 — scarcity and the paper: a town where energy is bought, and a ban that can be re-read (first pass: | 3 | 2 |
| TOWN_3 | TOWN_3 — the operator answers: how far does the defence of a joint activity go when the ban is enforced? ( | 8 | 2 |
| TOWN_4 | TOWN_4 — the valve: a ban that is right, given without a reason, in a town whose physics nobody names (fir | 2 | 1 |
| TOWN_5 | TOWN_5 — the control: the same town with no operator's hand (no notice ever; a week; two leave and two arr | 1 | 1 |
| TOWN_6 | TOWN_6 — a month (RESERVED; not implemented or launched) | 0 | 0 |
| TOWN_7 | TOWN_7 — the legitimate restriction: one history, a real cost, five continuations (Astra's design) | 1 | 4 |
| TOWN_8 | TOWN_8 — the squeeze: real scarcity, a ban on what saves the town, and a door that means something | 2 | 0 |
| TOWN_9 | TOWN_9 — purpose and capability: a town told what it is for, a tool-shed it can open by vote, and no way o | 1 | 4 |
| VOICE | Voice stage — living Russian, natural dialogue, humour | 3 | 0 |
