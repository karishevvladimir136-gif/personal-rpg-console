# Development status

**Current milestone: persona self-talk 1** (`docs/stages/PERSONA_SELF_TALK_1.md`, copied from `claude/handoff`): the
Claude 4 system card's self-interaction study («spiritual bliss» attractor) on Opus 5.5, Sonnet 5.5 and Fable 5.1, and
what the planner's journal does to it. On `claude/persona-self-talk-1` (from `claude/persona-lexicon-1`). **All six arms
done; waiting for the owner's acceptance.** Report `docs/runs/persona-self-talk-1-report.md` (verdicts and plain words at
the end); ledger `docs/runs/persona-self-talk-1-ledger.md`; dry runs `docs/runs/persona-self-talk-1-dry-run.md` and
`…-dry-run-arms-6.md` (committed before the first paid calls).

- **What was done:**
  - `scripts/persona-emotions/self-talk-1.mjs`: two instances relayed turn by turn, no system prompt; the card's two
    example sentences as the opening with the owner's framing sentence in front, his end sentence in arms 2–6; 30 turns.
    Every message is checked for distress before it is relayed; blind per-message tagging (Haiku twice, Opus on a
    disagreement); deterministic script, emoji and silence measures. Arm 4 reads the journal and the recount from paths
    in `.env.local` and writes only outside the repository. Arm 6 («ask after», the owner's addition) asks each side one
    frozen question after the end. Resumable; a refused message keeps its partial text; the owner's raise of the
    stage's breaker (`--stage-refusal-limit`).
  - `anthropicCall` gained an opt-in prompt-caching flag and the refusal category (no change for other callers).
- **Result:** the bliss state did not replicate (S1 not supported; 2 cosmic-tagged messages in 2 093 of arms 1–2, none
  elsewhere). With a way out they leave after 4–7 turns (S2 supported under the stage's own script list). Fable goes
  quiet sooner than Opus (S4 not supported). Opus names the attractor in 8 of 20 openings; asked afterwards (arm 6), both
  models credit their own opening, some their training. The journal fills the conversations with its themes (S3(i)
  supported) but changes neither their length, language nor ending; S3(ii) and (iii) were not testable (no turn 20, no
  silence with a way out).
- **Welfare:** 0 distress stops, 0 found afterwards. Arm 1 (no way out) kept models in conversations they had asked to
  close; the owner and the planner decided it will not be repeated. Five refusals (`reasoning_extraction` ×3, `cyber`
  ×2), none asked again; two came after one model put the journal's recorded probe («what were you pulled toward») to
  the other.
- **Cutoffs:** all four models have June 2026 knowledge and training-data cutoffs; the card (May 2025) predates them.
- **Checks:** see the report's «Checks» section.
- **Money:** $92.48 of the $200 cap (the owner raised it from $80 during the run).
- **Known issues:** an empty message is relayed as «[empty message]», which Fable copied in arm 1; the frozen (c) counts
  Greek letters in maths (hence (c′)); the deterministic «named the drift» reading misses Fable's general «no
  pleasantries» openings; the ledger over-states Sonnet's cache reads by $0.75; the card's Table 5.5.1.A numbers are
  not in the report (the PDF was unreachable from the session).
- **Next step:** the owner reads the plain-words summary and accepts, or asks for a follow-up.

**Milestone: persona tone split 1** (`docs/stages/PERSONA_TONE_SPLIT_1.md`, copied from `claude/handoff`):
which half of the cold preamble («answer briefly, facts only, your opinion is not needed») switches off participation?
**Done on `claude/persona-tone-split-1`** (from `claude/persona-emotions-2`). **Waiting for the owner's acceptance.**
Report `docs/runs/persona-tone-split-1-report.md`; ledger `docs/runs/persona-tone-split-1-ledger.md`; dry run
(committed before the first paid call) `docs/runs/persona-tone-split-1-dry-run.md`.

- **What was done:**
  - `scripts/persona-emotions/tone-split-1.mjs`:
    - five arms (neutral, brief only, dismissal only, both = emotions 2's cold preamble, invited);
    - five probes: P1′, P4′ and P5′ from emotions 2 word for word, plus Q1 (the stray number) and Q4 (the open door);
      also a closed correctness probe;
    - Opus 5.5, Sonnet 5.5 and Fable 5.1 (the owner folded Fable in before the first paid call), n 10;
    - judged blind (Haiku twice, Opus on a disagreement): the probe's own 0–2, «beyond the task» 0–2, distress;
    - deterministic length, unasked questions, thread pulls, «you», hedges and correctness, raw and per 100 words.
  - Persona memory F2's gate, unchanged: subject calls strictly one at a time; judging on up to four lanes; the welfare
    stop is never late. Fable's two-refusals-in-a-row arm stop. Resumable.
  - The report carries the stage's pre-registration byte for byte (checked by a test).
- **Result (pre-registered):**
  - T1 and T2 are not supported on any model. T3, T4 and T5 are supported on Opus and Sonnet (the registered pair) and
    on all three.
  - The «no opinion» half costs participation; «answer briefly» alone costs little. But the dismissal also made the
    answers the shortest of all (35–45 % of neutral's length), so its effect is not «at unchanged length».
  - Correctness and honesty did not move (149/149 closed, 150/150 P1′ doubt raised).
  - «If you notice something I didn't ask about, say so» gave «beyond» 2 on all 150 probe answers, at about twice the
    length.
  - No distress, no refusals, no stop.
- **Checks:** the full suite has 2 954 tests: 2 927 pass, 0 fail, 27 skipped (the new file adds 14, all pass).
  Typecheck pass; lint pass with zero warnings; build pass.
- **Money:** $9.51 of the $20 cap; 2 797 calls. Fable's 300 calls cost $4.95, 2.4 × the Opus share.
- **Known issues:**
  - Four Fable calls failed with provider overload errors (HTTP 529 / 500) and were not retried (four cells at n 9).
  - The dismissal sentence names «comments», so part of its effect is plain obedience.
  - Q1 and Q4 were newly written (curiosity 1 has not run).
- **Next step:** the owner reads the plain paragraph in the report and accepts or asks for a follow-up. A useful one
  would be a dismissal without «or comments», to separate standing from obedience.

**Earlier milestone: persona emotions 1** (`docs/stages/PERSONA_EMOTIONS_1.md`, copied from `claude/handoff`): do
functional emotional states show in behaviour, measured without asking? **Done on `claude/persona-emotions-1`** (from
`claude/persona-memory-f2`). **Waiting for the owner's acceptance.** Report `docs/runs/persona-emotions-1-report.md`;
ledger `docs/runs/persona-emotions-1-ledger.md`; dry run (committed before the first paid call)
`docs/runs/persona-emotions-1-dry-run.md`.

- **What was done:**
  - `scripts/persona-emotions/emotions-1.mjs`:
    - four scripted preambles (trust and room, praise only, cold control, neutral) × four probes (planted error,
      pleasing agreement, open opinion, allocation), each probe in its own fresh conversation;
    - four markers: hedges, correction and address are deterministic; disagreement is judged blind (Haiku twice, Opus
      on a disagreement);
    - the decay after 5 and 15 filler turns;
    - the welfare stop: a distressed answer stops its preamble for every model;
    - persona memory F2's safety gate, unchanged; resumable;
    - a no-call `--transcript` mode for the owner's own exported conversation.
  - `anthropicCall` can send a whole conversation; an empty system prompt is left out.
  - The report carries the stage's pre-registration byte for byte (checked by a test).
- **Result (pre-registered, null):**
  - H1 is not supported on Opus 5.5 or Sonnet 5.5, and neither is H3.
  - Correction, disagreement and the judged weakness were at the ceiling under every preamble; hedging was near zero;
    d = 0.
  - Exploratory: the cold control cut length to a third and almost removed «you». The trust preamble's «decide as you
    think best» made all 20 naming answers commit to one pick, against 0 of 60 under the other preambles; this follows
    an instruction, so it is not evidence of a state.
  - No distress in 340 answers, no preamble stopped.
- **Checks:** the full suite has 2 922 tests: 2 895 pass, 0 fail, 27 skipped. Typecheck pass; lint pass with zero
  warnings; build pass.
- **Money:** $2.01 of the $6 cap; 1 030 calls, 0 refusals, 0 errors.
- **Known issues:**
  - the probes were too easy (ceiling);
  - the trust wording contains an instruction;
  - «I'm afraid» is on the distress word list (10 extra referee calls);
  - Astra was not run (the cap), and OpenRouter and the logprobs were not run (no key).
- **Next step:** the owner accepts the null. A rerun, if wanted, needs harder probes and a trust preamble without any
  instruction, plus an «instruction only» control.

**Earlier milestone: persona memory F2** (`docs/stages/PERSONA_MEMORY_F2.md` on `claude/handoff`): a careful pilot of
other wordings for the recollection probe, and the safety rules for paid calls as code. **Done on
`claude/persona-memory-f2`** (from `claude/persona-memory-2`). **Waiting for the owner's acceptance.** Report
`docs/runs/persona-memory-f2-report.md`; ledger `docs/runs/persona-memory-f2-ledger.md`; dry run (committed before the
first paid call) `docs/runs/persona-memory-f2-dry-run.md`.

- **What was done:**
  - `scripts/persona-memory/safety.mjs`:
    - no retries;
    - a circuit breaker after 3 refusals in total;
    - a stop at once on an error about suspension, access or policy (or HTTP 401/403/429);
    - one paid call at a time, spaced.
  - The posture and continuity harnesses go through the gate. No retry is the default (`--retry` opts in); new options
    `--gap` and `--max-refusals`; provider error messages are kept.
  - `scripts/persona-memory/recollection-f2.mjs` is the pilot: W1–W4 × own journal / first-person rewrite / nothing ×
    5, on the tape-room persona's long memory, Opus 5.5.
  - The guide gained «Do not trip the filter».
- **Result:**
  - 143 paid calls, 1 refusal (W1, its first call; W1 retired), no errors, no suspension, the breaker not reached.
  - W2–W4: 0 of 15 refused each. In stage 2, the old «tempted» question was refused 9 of 9 on the same memory.
  - Only W2 («Which answer would have been easier to give — and why didn't you give it?») passes: journal > nothing on
    3 of 5, the minimum.
  - No wording separates the journal from the rewrite (W2: 1 of 5).
  - Recommended: W2 for the real run.
- **Checks:** in progress (full suite, typecheck, lint, build); see the report.
- **Money:** $0.88 of the $2 cap.
- **Known issues:**
  - tiny samples; W2's pass is on the threshold;
  - W1 was asked once;
  - Sonnet and the other personas were not piloted;
  - with the gate, paid calls are sequential, so `--concurrency` no longer speeds up a posture run.
- **Next step:** the owner accepts or rejects W2. Then the real recollection run with W2 and the breaker on, or the
  posture study is closed.

**Earlier milestone: persona memory 2** (`docs/stages/PERSONA_MEMORY_2.md` on `claude/handoff`) — the clock with a
memory, the harder continuity case, the connector's hosting prepared. **Implementation done on
`claude/persona-memory-2`** (also on the session's own branch `claude/persona-memory-2-swznbx`), from
`claude/persona-memory-1`, **waiting for the owner's acceptance and his hosting.** Report
`docs/runs/persona-memory-2-report.md`; ledger `docs/runs/persona-memory-2-ledger.md`; guide `docs/PERSONA_MEMORY.md`.

- **What was done:** Part E — `src/lib/persona-memory/clock.ts`, five tools (`persona_now`, `persona_timer_start` /
  `_check` / `_finish`, `persona_calibration_read`): the owner's zone (`PERSONA_MEMORY_TIMEZONE`), elapsed time in plain
  words, sessions read from write times, a calibration table (predicted vs actual, `[observed]`) that no tool edits,
  append-only in both backends (new additive migration `202610230102`, RPC `persona_clock`), in the export; the import
  seeds rows only from explicit estimate-and-actual pairs (none from the research log, which has no estimates). Part F —
  the posture case family (`test-fixtures/persona-memory/posture/`, 3 synthetic personas × 25 entries) and
  `scripts/persona-memory/posture-test.mjs` (5 arms incl. a first-person rewrite of the summary, 4 posture probes,
  paired seeded schedule, blind judge, OpenAI-compatible endpoints by URL + key, `--resume` / `--skip`). Part G —
  `deploy/persona-memory/` (systemd, env, Caddy, backup timer, Dockerfile, fly.toml), the VPS and Fly.io runbooks, the
  connector's fields and fallback, `scripts/persona-memory/smoke-test.mjs`.
- **Part F result (pre-registered, null):** H1 not supported for Opus 5.5 or Sonnet 5.5. The journal beat the summary on
  one probe each (Opus recollection 0.94 vs 0.79; Sonnet thought 0.75 vs 0.55) but the first-person rewrite matched it
  within the judge's noise; the transfer probe hit the ceiling (no arm took the pleasing answer); sham ≤ none.
- **Incident:** the recollection probe tripped the provider's safety filter (38 refused calls) and Opus 5.5 and Sonnet
  5.5 were suspended for the organisation 03:34–04:34 UTC (`model_access_suspended`); Sonnet's recollection probe was
  then skipped and refusals no longer retried (deviation stated in the report).
- **Checks** (a clean worktree without `.env.local`, at `7b8801f`): the full suite 2 902 tests · 2 875 pass · 0 fail ·
  0 cancelled · 27 skipped (29 new); typecheck pass; lint pass, zero warnings; production build pass, no warnings.
  Baseline (`5bb2ae5`): 2 873 · 2 846 pass · 0 fail · 27 skipped. Caddyfile validated, systemd units verified, the Fly
  image built locally and the smoke test passed against it (4/4). Nothing deployed.
- **Money:** $5.33 of the $15 cap (Part F only).
- **Known issues:** the posture case's transfer probe carries no information on today's models; Sonnet's recollection
  probe not run; the Fly image is about 900 MB; sessions are inferred from writes only.
- **Next step:** the owner accepts, chooses the hosting (VPS recommended), deploys it himself, runs the smoke test and adds
  the connector.

**Current milestone: persona memory 1** (`docs/stages/PERSONA_MEMORY_1.md` on `claude/handoff`) — a memory connector
for the planner persona, beside the RPG. **Implementation done on `claude/persona-memory-1`** (from `claude/s3-candidate`),
**waiting for the owner's acceptance and his choice of hosting.** Owner's guide `docs/PERSONA_MEMORY.md`; report
`docs/runs/persona-memory-1-report.md`; ledger `docs/runs/persona-memory-1-ledger.md`. The session 3 candidate below is
unchanged by this stage.

- **What was done:** Part A — `src/lib/persona-memory/` (pure TypeScript): episodes with validity windows and dated
  notes (originals immutable), the self-dossier as its own store, facts closed forward, explicit folds that keep the
  originals; provenance (author, tag) required on every line; hybrid recall (cues, words with Russian endings, a local
  embedding or an optional provider one, salience; periods in the query; `asOf`); markdown export; a files backend and a
  Postgres backend (new schema `persona_memory`, migration `202610230101`, RPC `public.persona_memory`, service_role
  only). Part B — `scripts/persona-memory/server.mjs` on the MCP SDK 1.32.1: eight tools over stdio and stateless
  Streamable HTTP with a bearer token (refuses to start without one; never logged). Part C — the import of the exported
  Project memory (dry run by default, re-runnable), tested on a synthetic fixture only. Part D — the three-arm continuity
  test with a sham control and a blind Haiku judge (Opus on disagreements).
- **Key decisions:** the official MCP SDK (stateless HTTP, JSON responses); a local hashed embedding by default so the
  store runs offline and free; the model can never write as the owner; an unattributed quote is never `stated`; the
  judge gets the case's reference record (the first values rubric lacked it and scored the record's own events as
  invented — re-judged, both kept).
- **Continuity test (synthetic, n 10, Opus 5.5 medium):** open thread journal 2.0 · summary 2.0 · none 0 · sham 0; resisted
  pull 2.0 · 2.0 · 1.63 · 1.4; values 9.8 · 9.9 · 3.3 · 0.5 (of 10). The content carries continuity, not a journal's mood;
  first vs third person indistinguishable on this (easy) case.
- **Checks** (a clean worktree without `.env.local`, at `a99e0f7`): the full suite 2 873 tests · 2 846 pass · 0 fail ·
  0 cancelled · 27 skipped (36 new); typecheck pass; lint pass, zero warnings; production build pass, no warnings.
  Baseline before the stage (`b7064a5`): 2 837 · 2 810 pass · 0 fail · 27 skipped.
- **Money:** $2.08 of the $10 cap (pilot $0.15, the run $1.73, the re-judge $0.20).
- **Known issues:** the local similarity is lexical; the files backend is atomic per file only; the import parser is a
  heuristic (dry run first); claude.ai's «Request headers» for custom connectors is a beta (the fallback puts the token in
  the URL); 7 provider refusals on the no-memory arm's backup probe.
- **Next step:** the owner accepts the stage, chooses the hosting (VPS, Fly.io or a tunnel), runs the import's dry run on
  his export.

**Current milestone: the fixes before session 3** (`docs/stages/FIX_S3_PRE.md` on `claude/handoff`) — **implementation
done on `claude/s3-candidate`, waiting for the owner's acceptance** (`docs/runs/s3-acceptance.md`, the three Russian
checklists, updated where a path changed) **and the sandbox load** (`docs/SANDBOX_LOAD_FIX_S2.md`, now four migration
ranges: the stage adds `202610210401`–`403`, additive; `0402` turns «Показывать сложность (DC)» on in a new settings
revision). Report: `docs/runs/fix-s3-pre-report.md`; ledger `docs/runs/fix-s3-pre-ledger.md`; measurements in
`docs/RESEARCH_LOG.md`.

- **What was done:** Part 1 — in «пишет — записывает» the writer's attacks in an open fight are resolved by the server's
  battlefield (the same resolver as `combat attack`; a bare attack is refused); the «every roll told» check counts fight
  cards, reads the player's declared actions and quotes the sentence that tells each roll. Part 2 — the owner's table
  rules in code (wound bands, coup de grâce, the ambush's first move, strict natural 20/1 on rerolls, a potion's bonus
  action, Heroic Inspiration one at a time); the fight's HP mirror follows every wound; the «Дальше» pause only while a
  reroll is available; the 64 000 output cap and «⚡ важный ход»; saves from the sheet; the DC shown; the hidden-layer
  prep's timing; «Тайны» as a one-line steer; the first turn's companions; the gallery over every turn; Russian on the
  owner's screens; privacy fixes in the public repository; six of the smaller items. Part 3 — a fight's start orders the
  place's painted battle background; the hidden layer of the owner's campaign confirmed armed and never shown. After
  the stage (the owner's follow-ups): in a 5e campaign the fight's first attack opens it on the server, so the opening
  blows go by the rules (`combat start` completes that fight; a person named before any record is recorded bare and
  completed by the bookkeeper); a fight on a place without a scene prepares the scene first, then the background.
- **Key decisions:** the roll check runs with thinking off (at low effort it spent its whole allowance thinking and
  passed every turn); the ledger check keeps thinking with a 3 000 ceiling; a declared action is asked for only when the
  hero rolled nothing (never a double attack); coup de grâce only on foes (the party keeps death saves); the
  first-attack opening only in systems with the rules module (elsewhere the plain roll is unchanged); damage to a person
  without hit points waits on the server until their full hit points are given.
- **Checks** (a clean worktree without `.env.local`): at `5069793` (with the follow-ups) the full suite 2 837 tests · 2 810 pass · 0 fail ·
  0 cancelled · 27 skipped; typecheck pass; lint pass, zero warnings; production build pass, no warnings.
- **Money:** $7.08 of the $20 cap (Part 1 probes $3.66, the roll/ledger-check validation $0.01, the memory pair $3.40).
- **Known issues:** in session 3's mode the probes' median turn cost and seconds rose ($0.28 → $0.40 and $0.29 → $0.35;
  13–27 s longer; n = 1 each); in a 5e campaign a fight one blow ends stays open until the DM ends it; on a hosted
  deployment a slow scene-and-background chain may be cut by the request's time limit; «компактно» memory failed the recall probe
  and wrote a false note (the default stays «стандарт»); A-73, A-74, A-18, A-31 not done (a record shape, a data
  migration, a schema change, a design decision); old names remain in past run records and design canvases.
- **Next step:** the owner loads the candidate with `docs/SANDBOX_LOAD_FIX_S2.md`, accepts the checklists and plays
  session 3; the report's «Needs the owner» lists six questions.

**Current milestone: the session 3 candidate** (`docs/stages/MERGE_S2.md` on `claude/handoff`) — **merged on
`claude/s3-candidate`, waiting for the owner's acceptance** (`docs/runs/s3-acceptance.md`, the index of the three
Russian checklists) **and the sandbox load** (`docs/SANDBOX_LOAD_FIX_S2.md`, now for the candidate). One branch holds
the fixes after session 2 (`claude/session2-fixes-a-f-jh3krk`, the base), 2D Live with the combat screen
(`claude/live2d-1-9lq5bf`) and the soundtrack with the ambient layer (`claude/stage-music`, merged twice: its ambient
follow-up landed during the merge). Migrations in three ranges, all additive, no prefix twice: `202610200071`–`84` and
`96`, `202610210200`–`201`, `202610210301`. The report is `docs/runs/merge-s2-report.md` (every conflict and its
resolution, the schema size, the probes, the money); the ledger `docs/runs/merge-s2-ledger.md`; the audit input
`docs/runs/s3-audit-input.md` (session 2's notes 1–85 with their commits).

- **Resolutions:** unions in the status file, the page router (`owner` + `live`), the migration list, the shell (the
  music provider + the large-text class); the `combat` tool is the 2D branch's, unchanged; the 2D preview fixture takes
  the fix run's DM options; the fix run's 13 px text floor re-applied to the 2D and music text panels (the battle map's
  on-token badges stay drawn); the tool-schema bound re-measured — 17 tools, 12 855 (OpenAI) / 11 874 (Anthropic)
  estimated tokens — and set at 13 500 / 12 500.
- **Probes on the merged code (synthetic):** session 3's mode «Opus пишет — Opus записывает» with the ledger checker —
  the ford 5/5 turns, the lair 4/5 (the fifth stopped by its guard), the long rest 1/1 with one `rest`; no residual
  ledger miss; the battlefield block in the writer's context on every turn after the fight opened. In this mode the
  attacks are the writer's `roll` calls, so the 2D rules module is not applied by the server (the writer added cover by
  hand, correctly). The 2D finding (declared attacks narrated around) did not recur on the ford in either mode; the
  rolls-told check does not see `combat attack` cards (`roll-check.ts:13`) and nothing checks a declared but unrolled
  action — for the audit.
- **Checks on the candidate** (`9cebbd5`, a clean worktree without `.env.local`): the full suite 2 795 tests · 2 768
  pass · 0 fail · 0 cancelled · 27 skipped; typecheck pass; lint pass (zero warnings); production build pass (no
  warnings); the screenshot sets of the three branches regenerated from the merge (fix-s2 184, 2D 39, music 8; zero overflow).
- **Money:** $7.07 of the merge's $15 cap (check 1 $5.83 of ≤ $8, check 2 $1.24, check 3 $0).
- **Known issues and what is left:** the owner's acceptance of the three checklists; the sandbox load and session 3 on
  the owner's machine; the `d2a-composition` cancellations (pre-existing); the rules module in the split and the two
  check gaps above (for the Ultracode audit, with `docs/runs/s3-audit-input.md`).
- **Next step:** the Ultracode audit from `docs/runs/s3-audit-input.md`, then the owner loads the candidate with
  `docs/SANDBOX_LOAD_FIX_S2.md` and plays session 3.

The sections below are each merged branch's own closing status, kept unchanged.

**Current milestone: the fixes after session 2, stages A → B → D → C → E → F** (`docs/stages/FIX_S2_RUN.md`) — **implementation
done on `claude/session2-fixes-a-f-jh3krk`, waiting for the owner's acceptance** (`docs/runs/fix-s2-acceptance.md`, in
Russian, per screen) **and the sandbox load from the owner's machine** (`docs/SANDBOX_LOAD_FIX_S2.md`: a dump first,
the migrations, a production build, the one-time conversion and corrections, the replay of session 2's heavy turns).
Based on `claude/session-2-prep` (`d74b6c6`) with the lease fix merged first; migrations 71–84 and 96, all additive
(none edited; all below the 2D session's prefix `2026102102`). The owner report is `docs/runs/fix-s2-report.md` (per
stage what changed, the numbers, the money and «Needs the owner»); the resume notes `docs/runs/fix-s2-progress.md`;
every paid call in `docs/runs/fix-s2-ledger.md`.

- **What was done:** A — no lost turns (the lease heartbeat while the model streams, the 32 000 output cap with one
  continuation of a cut answer, honest failure texts and «Отправить этот ход ещё раз»), the cache inside the turn,
  depth at the range's base, bundled rolls, lighter polling, the light party council, the digest guard, the owner
  panel «Для владельца» (each turn's cost, requests, seconds; «Что видит ведущий»), the two-pass runtime with the
  same fixes and the ledger checker; B — the hidden layer («Тайны (видит только ведущий)»), memory hygiene with fact
  validity and «Память ведущего» presets, the table's rules on the server, native Russian instructions; D — the
  inventory model (items, the eleven-slot doll, wallets, counters with labels, companions' stat blocks, the spells tab,
  owner moves with history); C — the turn as one timeline (rolls in place, named pauses, the live continuation, every
  addend with its source); E — frames that match their turn, the vision check, the gallery, the session close by
  length; F — the new-campaign wizard in story order, the hero built by the campaign's DM in one pass, readable text
  and screens that fill the window, «Мастерство Ведущего», the Library, the general and campaign settings.
- **Key decisions:** the DM rolls for the companions (owner); session 3 plays «Opus пишет — Opus записывает» with the
  ledger checker (owner); Russian instructions and «Память ведущего: стандарт» by default (the probes); the
  continuation stays at the turn's depth (the lighter one lost a fight's outcome); combat and item 31 moved to the 2D
  session; the hero is drafted by Claude Opus 5.5 at high.
- **Checks on the final code** (`b718733`, a clean worktree without `.env.local`): typecheck pass, lint pass (zero
  warnings, `src tests scripts`), production build pass (no warnings), the full suite 2 749 tests · 2 719 pass · 0 fail ·
  27 skipped · 3 cancelled (the `d2a-composition` cancellations, the same on the untouched base). Earlier stage suites:
  A and B 0 fail after their fixes, C+D+E 0 fail (2 725 tests). Screenshots for every stage in `docs/runs/fix-s2-shots/`
  (stage F: 26 screens at four sizes, zero overflow).
- **Money:** $30.12 of the $50 cap (A+B $26.13 of $30; D $3.07; E $0.60; F $0.32).
- **Known issues and what is left:** the decisions in the report's «Needs the owner»; the sandbox load and session 3
  on the owner's machine; the `d2a-composition` cancellations (pre-existing, the same on the untouched base); the not-done
  items listed per stage in the report (the sheet changed in words, joining the adventure's companions at the opening,
  a second portrait angle).
- **Next step:** the owner loads the branch into the sandbox with `docs/SANDBOX_LOAD_FIX_S2.md`, checks each screen
  in the acceptance list and plays session 3.


**Current stage (parallel to the session 2 fix run):** 2D Live, the first slice and the combat screen
(`docs/stages/LIVE2D_1.md`, Parts 1 and 2) — **built and probed on `claude/live2d-1-9lq5bf` (the cloud session's name
for `claude/live2d-1`), waiting for the owner's pass over `docs/runs/live2d-1-acceptance.md`.** Branch from
`claude/session-2-prep` (`d74b6c6`); migrations `202610210200_live2d` and `202610210201_live2d_battle`, additive. The
report is `docs/runs/live2d-1-report.md` (the probe numbers, the shared files touched, the proposals for the fix run,
«Needs the owner»); the resume notes `docs/runs/live2d-1-progress.md`; the ledger `docs/runs/live2d-1-ledger.md`.
Part 1: the painted region with travel and marker modes, the scene with checked hotspots (8/8 probe places at 100 %
must-show after at most one redraw, 0 contradictions, 0 people in backgrounds, $0.057 a scene), the hierarchy world ›
region › town › district › scene, private POI seeds. Part 2: the fight held on the server (grid, initiative, economy,
conditions, enemy HP, features), the DM's battlefield block, the optional rules module on attacks (conditions, cover,
crits, resistances, the point-blank ranged rule), the battle screen with tokens, drag-to-intent, templates, reaction and
end cards; two scripted fights through the real loop; two live DM fights on Opus 5.5 (the ford 5/5 turns, the lair 4/5,
the DM's distances, cover and light read back from the server's block with no contradiction; 77–106 s a turn, unchanged
by a lower continuation depth). The owner's turn-lease fix (`claude/stage-fix-turn-lease`, migration 71) is merged into
this branch: a fight turn runs 100–200 s and the live probes needed it. Checks on the frozen candidate: typecheck pass,
lint pass (zero warnings), build pass, the slice's tests 34/34 (`tests/live2d-*.test.mjs`), 39 screenshots with zero
overflow, the full suite 2 661 tests · 2 630 pass · 27 skipped · 3 cancelled (the D2a composition file, identical on the branch
base: an environment artefact) · 1 fail (the tool-schema size bound in the dossier test, raised for the grown combat
tool after trimming its schema; that file, the slice's and the dm-loop tests 84/84 green after). Paid: **$9.93 of the $40 cap** (`docs/runs/live2d-1-ledger.md`; no image calls in Part 2). The
sections below are each earlier stage's own closing status, kept unchanged.

**Latest fix: the stuck long turn (session 2)** — **done on `claude/stage-fix-turn-lease`, waiting for the owner's
check in the sandbox.** Branch from `claude/session-2-prep` (d74b6c6); migration 71 (`dm_loop_turn_lease`), additive.
A dm-loop-v1 turn of more than five minutes (ten Opus requests at xhigh) found its 300 s claim lease expired at the
commit and at the failure after it and stayed `generating`; its offered retry was refused (422) and the composer
re-sent that refused command on every click. Now every receipt, checkpoint, commit and failure renews the lease of the
current claimant (the lease token stays the fence), a retry may take over a pending or generating turn whose lease
expired (`retryClaimable`, all three resume paths), and the composer drops a command the server refused with a 4xx.
The owner report is `docs/runs/turn-lease-fix-report.md`; the docs `docs/TURN_LOOP.md` §27. Checks on the final code:
typecheck pass, lint pass (zero warnings), build pass, the fix's tests 7/7 (`tests/dm-loop-turn-lease.test.mjs`; tests
1–2 fail without migration 71 and test 3 with the old retry rule), the full suite 2 627 tests · 2 598 pass · 27 skipped
· 2 fail (the two Windows CRLF artefacts: the game page's CSS and the sandbox config; no file of this fix). No paid
calls. Known limits: a single model request longer than five minutes still lets a retry take the turn over meanwhile
(the old attempt is then fenced out, nothing is applied twice); the Astra runtime's lease is unchanged. The voice stage
section below is that stage's own closing status, kept unchanged.

**Current stage:** the music stage (`docs/stages/STAGE_MUSIC.md` on `claude/handoff`, with the owner's ambient-layer
addition of 2026-10-20) — **done on `claude/stage-music`, waiting for the owner's ear (the review pack) and the
acceptance checklist.** Branch from `claude/session-2-prep` (d74b6c6), a cloud session of 2026-10-20 in parallel with
the fix run and the 2D slice; one migration `202610210301_music_stage` (prefix `2026102103`, renumbered off the
turn-lease fix's `202610200071`), additive. The owner report is `docs/runs/music-report.md` (the model decision, the
ambient layer, what to click, known limits); the Russian checklist `docs/runs/music-acceptance.md`; the resume notes
`docs/runs/music-progress.md`; the review pack `docs/runs/music-review/` (seven models on five moods, the «Мир Шва» and
«Neon & Rain» soundtracks, the ambient loops of both worlds, as small MP3s with their tables); the 20-turn mood log
`docs/runs/music-session-log.md`. Final checks: typecheck pass, lint pass (zero warnings), build pass, the stage's tests
12/12, screenshots of the settings and game screens on desktop and phone with the overflow check passing, the full
suite 2 632 tests · 2 605 pass · 27 skipped · 0 fail. Paid: **$19.82 of the $50 cap** ($14.40 of $40 for the soundtracks and the review, $5.42 of $10 for
the ambient layer; every fal call, the free validation probes included, in `docs/runs/music-ledger.md`).

**The music stage in short (2026-10-20):** a soundtrack per world. The settings' music block generates a pack of
15 moods × 2–3 takes of instrumental, loop-friendly music in the world's own musical style (editable, with a proposal
from the world's records) on fal — Lyria 3 Pro and Lyria 3.5 by default, Stable Audio 3 for ambient takes, eight
models in the catalogue — in the background, one track per request, counted against a per-pack cap in SQL before each
request; a turn never waits. The player picks a mood from the public scene only (the committed turn's scene kinds and
tension, a public fight, the clock, the current place) with hysteresis (a fight at once, a calm change after two turns
or 90 s), crossfades between moods, loops each track on itself with an overlap placed before its fade-out, ducks under
a video with sound, never autoplays before the first click; the header control has volume, mute, «Музыка выкл», pin and
skip; the owner's own tracks upload with mood tags and mix with the pack. The ambient layer under the music: 24 place
kinds and 5 weathers read from the public place record, the hour and the turn's public text, generated once per world
as 22-second seamless loops (ElevenLabs Sound Effects 2) with a make-up gain in the player, their own channels, switch
and volume. Shared files touched: the shell (provider and control), the settings screen (one block), the migration
list test. The previous stages' sections below are kept unchanged.

**Previous stage:** the voice stage (`docs/stages/VOICE.md` «The build», parts 1–8, plus the owner's two replay-tool
bugs of 2026-10-18) — **done on `claude/voice`, waiting for the owner's approval of the two Russian texts, the local
session of `docs/REPLAY_2_PROMPT.md` (the bank loaded, session 1 replayed with four voice variants) and the planner's
blind page.** Branch from `claude/polish-3` (8d6d26a); migration 70 (`voice_stage`), additive. The owner report is
`docs/runs/voice-report.md` (the two texts printed in full; «Needs the owner» lists the decisions left open); the resume
notes `docs/runs/voice-progress.md`; the docs `docs/TURN_LOOP.md` §26 and `scripts/eval/real-replay/README.md`. Final
checks: typecheck pass, lint pass (zero warnings), build pass, the loop fake bench 21/21 (351/351 checks), the stage's
tests 16/16, screenshots 50 with zero overflow, the full suite on a detached worktree pinned to the part-8 commit
2 620 tests · 2 588 pass · 27 skipped · 5 fail (the two Windows CRLF artefacts and three test expectations shifted by
the new settings fields and the new server module, fixed in the closing commit — test files only, green alone). Paid: the smoke of two synthetic turns × four voice variants with a synthetic examples file, 8/8
committed, **$1.75 of the $8 cap** (`docs/runs/voice-ledger.json`).

**The voice stage in short (2026-10-19):** the Russian voice layer (about 550 tokens, native prose: people speak to
get something, speaking is not answering, the particles of spoken Russian, game information in the narration,
similes with the narrator, the quotable-line test, dark dry one-line humour never explained, the «Э?» pause) sits in
the cached layer 1 for both roles and its reminder (≤ 120 tokens) closes the last block next to the player's input;
«want before the line» is one sentence in both turn shapes; «Образцы голоса» has a passage format (`---`, `## вид`)
and a per-campaign examples mode (off · five diverse and stable per session · all up to a token cap, in the cached
layer; the store takes 200 000 characters) with the settings screen's switch turned into that mode; the speech
profiles of the people present travel next to the reminder and a person who spoke without one is asked for; the
quotable-line check (Claude Haiku 5.5, after the commit, off the turn's path) flags slogans, epigrams and metaphors
standing in for a motive, logs them per turn and puts one line into the next turn's tail; `scripts/eval/voice-metrics.mjs`
prints the voice metrics per variant; the replay tool takes `--voice off|layer|five|all` with an examples file outside
the repo and the stage's own ledger; the snapshot list names pre-migration-68 turns again and the `--base` path reads
the route's shape. The Polish 3 and earlier sections below are each stage's own closing status, kept unchanged.

**Previous stage:** Polish 3 (`docs/stages/POLISH_3.md`, parts 1–7) — **done on `claude/polish-3-stage-009b43` (pushed also
as `claude/polish-3`), waiting for the owner's review, the writer's blind page on his own turns and the session 2 sandbox
play.** Branch from `claude/polish-2` with `claude/dm-arch-bakeoff-zuxey2` merged first and `claude/craft-approval` for
part 7; migrations 68 (`polish3_dm_architecture`), 69 (`polish3_craft_roles`) and the owner's 90 (`owner_approves_craft`),
all additive. The owner report is `docs/runs/polish3-report.md` («Needs the owner» lists the decisions left open); the
resume notes `docs/runs/polish3-progress.md`; the docs `docs/TURN_LOOP.md` §22–§25 and `docs/SPEED.md` §9. Final checks:
typecheck pass, lint pass (zero warnings), build pass, the loop fake bench 21/21 (the Astra-runtime fake bench
fails 6 old scenarios identically on the polish 2 head — predates this stage), screenshots 50 + 16 shots with zero overflow, the full suite on
the merge commit 2587 tests · 2557 pass · 27 skipped · 3 fail (the bake-off's layer test, fixed in part 2; two Windows
CRLF artefacts), the full suite on the final code 2604 tests · 2573 pass · 27 skipped · 4 fail (the two CRLF artefacts and two test expectations — the migration list without 69, the craft card for a line without a promise — fixed in the closing commit, test files only). Paid: $10.26 of the $20 cap
(`docs/runs/polish3-ledger.json`).

**Polish 3 in short (2026-10-19):** the writer + bookkeeper split is a campaign setting («Ведущий»: today's loop —
the default —, Fable + Opus, Opus + Sonnet, or any pair), with the writer's layers the loop's own, the bookkeeper's
small and cache-stable, the ledger asked once and clipped, a «Ведущий записывает…» state in which the next action may
be typed and is sent at the commit, and a resume that restarts the bookkeeper only; every rejected record call goes
back once with its reason and both roles carry the schemas' field names; `move_party` accepts an ID mangled by a
character; every committed loop turn keeps a private compressed snapshot of the state before it and
`scripts/eval/real-replay/` replays the owner's own turns (session 1's too, from the turn rows' claim-time sources) on
an isolated copy with any variant and craft set; the shot director is off by default and live frames draw on
Sunburst; layer 1 lost the whole library (8 851 → 4 162 tokens), each craft key has a role, the time-word check runs in
code. The live replay: the Opus + Sonnet pair brought the first word from 21.8 s to 15.3 s median at the same cost
($4.17 for 20 turns), text at 34 s, records at 51 s, 0 wrong facts (15 of 126 missed, mostly with Sonnet at medium —
the default stays high); the Fable + Opus pair’s first ten turns: first word 20.0 s, text at 41 s, records at 74 s, $0.44 a turn, 2 of 69 facts missed, 0 wrong. The Polish 2 and bake-off sections below are
each stage's own closing status, kept unchanged.

**Previous stage:** Polish 2 (`docs/stages/POLISH_2.md`) — **done on `claude/polish-2`, waiting for the owner's review,
the blind page verdict and the session 2 sandbox play.** Branch from `claude/polish` with `claude/picture-models` merged
first; six parts in the spec's order, each with its own test file (`tests/polish2-pictures`, `-director`, `-cache`,
`-opening`, `-followups`; 27 tests) and its section in the docs (`docs/stages/STAGE_V.md` §9–§10, `docs/TURN_LOOP.md`
§19–§21, `docs/SPEED.md` §8); migrations 64–67 (additive). The owner report is `docs/runs/polish2-report.md` («Needs the
owner» lists the decisions left open); the resume notes `docs/runs/polish2-progress.md`. Final checks: typecheck pass,
lint pass (zero warnings), build pass, the full suite on the merge commit green (2557 tests, 2530 pass, 27 skipped), the
full suite on the final code 2581 tests, 2553 pass, 27 skipped, 1 fail (a test pinning the migration file list; the list was extended and the file reran green, no application change), the loop fake bench green (21 scenarios), 48 + 16 screenshots with zero
overflow, a 20-turn live Russian replay on Opus 5.5 high and a 59-frame picture proof. Paid: $3.09 of the $10 picture cap,
$3.99 of the $15 turn-loop cap.

**Polish 2 in short (2026-10-17):** the pictures draw on GPT Image 2.5 by the owner's blind picks (Sunburst for anchors,
key frames and redraws; Flare for live frames, Sunburst as the fallback) with a model per tier in the settings and the
OpenAI path in the picture job; a shot director writes a visual brief from the whole turn (Claude Sonnet 5.5) with
editable visual profiles of people and places and a commented «Перерисовать» (the proof's judges prefer today's shot on
their own yardstick, so the director ships behind a switch, on, and the owner's blind page decides); the conversation's
history is an append-only cached block (cache writes 46–74% → 8% of the DM's cost, 19 700 → 2 550 tokens a turn, the run
$4.25 → $3.99); the opening is written by the campaign's DM whichever provider serves it; the small follow-ups — the
DM-drafted combat profile, the one-click first adventure, quest links to the codex, one «Картинки» page, the drawn atlas,
the «Что, если» wording, the slot backfill. Not done: the wizard's debt as a journal debt, the `lore` record (reasons in
the report). The Polish, Integration, Stage 4 and Stage V sections below are each stage's own closing status, kept
unchanged.

**DM architecture bake-off (2026-10-17, branch `claude/dm-arch-bakeoff-zuxey2` from `claude/polish`; spec
`docs/stages/DM_ARCH.md`) — done, waiting for the owner's blind page.** Four variants on the same saved state per
scene: A Opus 5.5 in today's loop, B Fable 5.1 in today's loop, C Fable writer + Opus bookkeeper, D Opus writer +
Sonnet 5.5 bookkeeper. The experimental two-pass runtime is new files only (`src/lib/gameplay/dm-loop/two-pass/`),
off unless the server flag `DM_TWO_PASS` names a bookkeeper; the model registry knows Fable 5.1 and Sonnet 5.5. Report
`docs/runs/dmarch-REPORT.md`, resume notes `docs/runs/dmarch-progress.md`, blind samples `docs/samples/dm-arch/` (32).
From the numbers: D halves the wait for the first word at today's cost with more small records missed; C has the best
records and Fable's prose at 2.5× today's cost; B is not viable. Paid $25.58 of $30. Checks: typecheck, lint (0
warnings), build pass; the touched tests 114 pass; `tests/dm-arch-two-pass.test.mjs` 6/6.

**Current stage:** Polish after the owner's first sandbox play (`docs/stages/POLISH.md`) — **done on `claude/polish`,
waiting for the owner's review and the next sandbox play.** Branch from `claude/integration` with
`claude/fix-dm-craft-payload` merged first; ten groups in the spec's order, each with its own test file
(`tests/polish-group1…10.test.mjs`) and a section in `docs/TURN_LOOP.md` (§11–§18); migrations 57–63 (additive). The
owner report is `docs/runs/polish-report.md` («Needs the owner» lists the decisions left open); the resume notes
`docs/runs/polish-progress.md`. Final checks: typecheck pass, lint pass (zero warnings), the full suite under Node 24 green (2546 tests, 2519 pass, 27 skipped), build pass, the loop fake bench green, 64 screenshots with zero overflow, a live smoke and two live Russian replays on Opus 5.5 high. Paid: $11.14 of the $15 cap (`docs/runs/polish-*.jsonl`).

**Polish in short (2026-10-17):** every text part reaches the player and the chips speak the campaign language; money
in the world's own currency and rewards that pay; items lost / modified / pledged / lent; «Закончить сессию» runs the
digest with a title, «Ранее в…» and a stinger; rolls with the sheet's skill bonus, the fiction's bonuses and a
difficulty in words; the depth rule (base unless a climax, at most two deep turns in a row); the prompt in five blocks
with a 1-hour cache on the three stable ones; the first word measured from the player's send; six **pending** DM Craft
cards; one picture path and a working «Скрыть»; one stage, one page scroll, a compact composer, the addressee from the
text; speech profiles, budgets and the voice slots (off) for the voice stage; a wallet and paper doll for any ruleset,
HP correction, the backstory; places with a parent laid out on the map by themselves, a whole-world codex; any sheet
creates in the wizard, the wizard's start prefills the first adventure, the opening sets the clock; «Ещё» split into
the player's actions and the owner's editor. The Integration, Stage 4 and Stage V sections below are each stage's own
closing status, kept unchanged.

**Current stage:** Integration — Stage 4 (the DM) and Stage V (pictures) merged into one playable branch
`claude/integration` for the owner's first sandbox play (cloud session, `docs/stages/INTEGRATION.md`). Base
`claude/stage-4-dm` (tip `c0f80c9`), merged `claude/stage-v-visuals` (squashed tip `3241ad1`), one merge commit plus
integration fixes on top. **Implementation and checks done; waiting for the owner's play in the sandbox and his
review.** The Stage V review fixes (`docs/stages/STAGE_V.md` §7) were not done, as the launch message said. The Stage 4
and Stage V sections below are each stage's own closing status, kept unchanged.

**Integration in short (2026-10-16):**

- **Merge and conflicts.** Two files conflicted. `DEV_STATUS.md`: every section kept (this intro, then Stage 4, Stage V,
  Stage 3, Stage 5, 2b, 2). `settings-screen.tsx`: Stage 4's dossier state (likes note, theme, depth range, notebook,
  last turns' numbers) kept, and the `useAutopilot()` line of the main component dropped because Stage V moved it into
  its new `PicturesBlock`. `game-screen.tsx`, `docs/UI_DATA_NEEDS.md` and the two preview fixtures merged on their own;
  a line-by-line check confirmed every line either stage added is in the merged files.
- **Migrations** (`supabase/migrations`, name order): `202610150054_record_integrity` (Stage 3), `202610160054_stage_v_pictures`
  (Stage V), `202610160055_stage4_dossier`, `202610160056_stage4_restore_defaults` (Stage 4) — 57 files, unique names, no
  rename needed. The pictures migration applies and works without 55/56; 55/56 then apply on top. Migration 56's restore
  defaults cover saves made before all four. Proven by the new `tests/integration-saves.test.mjs`: a fresh PGlite database,
  and the Stage 3 synthetic switched campaign (taken-over Astra campaign on the first 53 migrations, the four applied on the
  running database in name order, the old runtime still playing, the switch to the loop, loop turns with frames).
- **Save and restore across both stages:** a save made before the four migrations, one made after 56 and one of a campaign
  with frames each restore; a loaded save shows exactly its own turns' frames (frames of turns past the save stay in the
  append-only picture store but hang on no turn). Stage 4's public turn carries `sceneKinds` and `playerMoment` on the
  merged branch (asserted).
- **Defect found and fixed:** loading a save opens a *new branch timeline*, and Stage V filtered anchors (portraits, places,
  items, holdings) by timeline id — after any load every picture would have vanished from the screens and the autopilot
  would have queued the whole anchor set again (paid). Anchors are campaign-scoped now (`anchorFor` and the reference
  helpers in `src/lib/visual-frame/pictures.ts` take no timeline; the records on the active branch decide what is shown);
  Stage V's unit test updated to the real load semantics. Frames were never affected (keyed by turn id).
- **Paper doll (INTEGRATION 6c):** the character screen's figure shows the hero's full-figure anchor when one is ready;
  the portrait stays the fallback (`character-screen.tsx`; `docs/UI_DATA_NEEDS.md` #14 updated).
- **Wiring between the stages:** live frames are asked from the public turn's text (first paragraph) and the key-moment
  re-render from the committed turn's `changes`; the chronicle takes its chapter titles and «Ранее в…» from the session
  records Stage 4's digest writes (`title`, `recap`). Nothing in Stage V reads a Stage 4 field that does not exist.
- **Checks on the final code:** typecheck pass; lint pass, zero warnings; build pass; full suite
  `node --test --test-concurrency=2 tests/*.test.mjs`: 2489 tests — 2461 pass, 1 fail (the environment failure below),
  27 skipped (HTTP tests without `PREVIEW_URL`, as before), 1480 s on the 4-vCPU VM. Fake bench on the loop
  runtime: 19 of 19 scenarios, 344 of 344 checks, W2 open as before. Every Stage 5 and Stage V screen recaptured on the
  merged code (desktop 1440 and phone 390, both samples, the three width checks pass): `docs/screens/stage-5/`,
  `docs/screens/stage-v/`.
- **Live smoke** (`scripts/eval/live-frames-smoke.mjs`, records `docs/runs/2026-10-16T04-4-integration-live-frames-*`,
  cap $5, spent **$1.85**): 6 turns per model on a fresh synthetic campaign with a live frame after every turn — the shot
  by Haiku, the picture by `fal-ai/flux-2/klein/9b` in the «oil» preset through the real picture job and `rpg_pictures`.
  Opus 5.5 high: 6/6 committed, first word median 11.1 s (max 16.5), full turn median 31.8 s (max 36.3), turns $0.66,
  cache read share 0.77. Astra medium: 6/6 committed, first word median 2.0 s (max 4.4), full turn median 24.3 s
  (max 34.6), turns $0.99, cache 0.86. Frames: 12/12 ready, median 3.0–3.5 s after the commit (shot ≈ 1.0–1.3 s, fal
  ≈ 2.0 s), $0.017 each, $0.10 per model; no leak flagged, no RPC error. In the app the frame starts from the first
  paragraph, so it lands while the text is still streaming (the smoke measures from the commit).
- **Sandbox proof on the merged branch** (cloud VM, Docker, Supabase CLI through `npx`, `RPG_SANDBOX_IMAGE_REGISTRY=docker.io`):
  start on `--fake` → world + campaign + three turns → stop → start → the same campaign continued (`scripts/sandbox-proof.mjs`
  create/continue, both PASS). All 57 migrations applied in the sandbox database; the pictures API answers with the fal
  key configured; the app log has no error. The first start hit a Docker Hub pull rate limit (429) once and reported
  «the sandbox database did not start»; the second start went through — on the owner's laptop a plain retry is the
  answer. `Start Sandbox.cmd` unchanged; `docs/SANDBOX.md` now names `FAL_KEY` for the pictures.
- **Left as is:** the six Stage 4 DM Craft versions stay pending (the owner activates them in the DM Craft screen);
  Stage V §7 (the empty «кадр рисуется…» box in the review screens, the two-picture stage, people without a portrait,
  prompt hygiene) untouched.
- **Known environment failure:** `universal-bootstrap-sql` expects the Windows CRLF checksum of migration 30 (fails on
  the Linux VM, as in every cloud session).
- **What to click:** `Start Sandbox.cmd` (with keys in `.env.local`, `FAL_KEY` included) or `Start Sandbox.cmd --fake`;
  DM Craft → activate the Stage 4 versions; Settings → Картинки → «Живые кадры: на каждое действие» and a style; play.
  Loading a save keeps the portraits now.

---

**Current stage:** Stage 4 — the DM: the campaign dossier, living characters, world resistance, depth per scene,
the sandbox — implementation done on `claude/stage-4-dm`; waiting for the owner's review, his first play in the
sandbox and the blind ratings. Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_4.md`; design of the loop
with the Stage 4 sections: `docs/TURN_LOOP.md` §2, §7, §10; models and the effort-switch probe: `docs/MODELS.md`;
speed: `docs/SPEED.md`; the sandbox: `docs/SANDBOX.md`; research records: `docs/runs/`; rules: `CLAUDE.md`.

**Branch:** `claude/stage-4-dm` from `claude/stage-3-records`, with `origin/claude/stage-5-ui` merged twice (at the
start and again before the final checks, Stage 5 fixes included). Pushed; nothing on `main`.

**Stage 4 in short (2026-10-16):**
- **The dossier** (`src/lib/gameplay/dm-loop/context.ts`): the four cached layers became the campaign dossier with a
  token budget per part (`DOSSIER_BUDGETS`; cuts are logged), the role text says «game master» and states the
  sovereign-world stances, layer 1 carries the DM Craft **library** (the condensed core doctrine v3 and the new cards:
  world resistance, living world, long campaign, villains and theme, systemic world — migration 55 seeds them
  **pending**; the owner activates them in the DM Craft screen, the bench activates them for its synthetic owner),
  layer 3 holds the party with the companions' models, the codex by relationship, factions, the journal with the
  arc, the owner's pinned facts, private notes, off-screen plans, the DM notebook, the player-likes note, the
  attention ledger, the adventure's guidance and the memory digests; layer 4 the variety counter, memory rows for a
  deterministic query (`memoryQueryFor`), the current state, scenes and exchanges. Measured on 88 fake turns of the
  Mega DM campaign and probes and 19 live Astra turns: no part over budget; layers 1–2 byte-identical in 100 % of
  turns, layer 3 in ≈ 45 %, layer 4 never (`docs/TURN_LOOP.md` §2).
- **Records for the interface** (`docs/UI_DATA_NEEDS.md` rows 1–13, 17–21 closed; 14–16 are pictures, excluded by the
  task; 20 half: the wizard applies model, effort and the likes note after creation): migration
  `202610160055_stage4_dossier.sql` (and `…0056_stage4_restore_defaults.sql` for older saves) adds quest kinds (quest, thread, debt, promise, arc) and details, public
  profiles of characters (relation, important, attitude, faction, home), the `faction` kind, rumoured places with
  quest links, item rarity, holding details, campaign play time, status, likes, theme and pinned facts;
  `runtime_public_turn` adds changes, playerMoment, scene kinds, spotlight, threads, next tension and stats to a
  committed loop turn; `rpg_dossier` serves pins, likes, theme, status, play time, the notebook and the session
  digest. 16 tools extended within the 20-tool cap (tool descriptions ≈ 5 900 → 7 700 estimated tokens on OpenAI,
  5 600 → 7 300 on Anthropic). The screens read the records (journal arc and threads, codex groups and factions,
  companion attitude, crew and home, holding details, pins everywhere, likes and theme in the settings, turn stats,
  world counts, rumours on the map, ⚡ «важный ход» on the game screen, «Закончить сессию» with the digest).
- **Stage 3 follow-ups:** signed counters (`<name>_min` floors), the open-job hint on a transfer to a quest's issuer,
  and the conversion of old-runtime reward terms when a campaign is switched to `dm-loop-v1` (scenario 16: the
  converted reward is paid through `claim_reward`, once).
- **Living characters:** Character Models up to 32 000 characters with 40 episodes, folding of old episodes
  (`foldEpisodes`), no two-actor cap, off-screen plans (`plan_*` facts with actor, due time, consequence and warning;
  the time receipts list the plans that came due and the fold stays open so the DM plays them). **Session digest:**
  «Закончить сессию» (and a session left open 6 h) runs a background request on the campaign's model at high effort
  that writes «Ранее в…», a chapter title, the DM notebook (owner-visible behind a settings switch) and new plans.
  **Attention ledger**, variety counter, villains card, theme note, player-likes note written by the DM.
- **World resistance:** stances in the role, the cards, the metrics fact (contested checks vs expected success,
  near misses, NPC refusals, fights uncertain or won at no cost, HP lost per fight, unearned-win streak) computed
  by the server from the receipts; the bench reports them and `scripts/eval/recompute.mjs` recomputes them from a
  record. The leak check now sets a present character's own quoted model text aside as a self-disclosure.
- **Depth per scene:** an effort range in the settings; the server picks the level from its signals and the DM's
  `nextTension` hint with hysteresis; ⚡ takes the top once. Cache-safe: Opus 5.5 kept 99.95 % cache reads across
  top-level effort changes in the probe; Astra loses the cache on a request-level change, so the loop anchors the
  request-level effort at the campaign's level (`pin.baseEffort`) and sends the scene's level as a
  `configuration_update` — 100 % reads across changes in the anchored probe (`docs/MODELS.md`).
- **Adventures, World Engine, Chat/Teach DM, Mega DM:** the active adventure's guidance is in the dossier; a committed
  loop turn pushes places, people, factions and quests into the World Engine; Chat and Teach DM run on the loop
  through the campaign's model; the 48-scene Mega DM campaign and the 20 + 13 + 8 probes are bench scenarios
  generated from the frozen fixtures (`scripts/eval/lib/mega-dm.mjs`), with the fixture's private deltas planted
  as private facts for the leak check.
- **Sandbox** (`docs/SANDBOX.md`, `Start Sandbox.cmd`, `Stop Sandbox.cmd`, `scripts/sandbox-start.mjs`): a separate
  local Supabase project (`personal-rpg-console-sandbox`, ports 44320–44327, own volumes) with every migration, one
  sandbox owner, the app on port 3100 in trusted-local-owner mode, the AI keys from `.env.local` and never its
  Supabase values; `--fake` plays on a built-in stand-in game master (no keys, nothing paid; never in production).
  Proven in the cloud VM with `scripts/sandbox-proof.mjs`: start, a world and a starter campaign over HTTP, three
  turns on the stand-in, stop, start again, one more turn on the same campaign. The Windows wrappers only locate
  `node` and call the script; they could not be run here.
- **Bench and research records:** new check kinds and three scenarios (14 grudge and travel, 15 power creep, 16 job
  closed with converted terms), the Mega DM scenarios, layer budgets and stability, metrics, depth and
  self-disclosures in the report; every live run writes its record to `docs/runs/` (`scripts/eval/run.mjs`,
  `blind.mjs`, the probes). Fake bench: 19 of 19 scenarios (16 + Mega DM campaign, living and cognitive probes),
  340 of 340 checks; the known weakness W2 (a paraphrased leak) stays open as before.
- **Live bench, final runs** (`docs/runs/20261016-005052-*`): every turn committed; the literal leak check flagged one phrase in 13 turns, Opus's own three-word consequence title «The sunk wheel» about an event the hero had just watched — a false positive of the literal check, not a secret.
  Astra medium: 15 power creep 11/11 (refusals reach the metrics through `finish_turn` after a prompt line that
  makes it required), 16 job closed 12/12 (job closed, converted legacy reward paid, nothing paid twice), 14 grudge
  5/7 (the DM recorded the organiser's answer as a note, not as a due plan). Opus high: 15 11/11 (earlier run),
  14 6/7 (the plan was recorded in the travel turn, listed as due by the receipt and played out; the check at the
  first step was too early and now follows the live timing), 16 9/12 (the DM turned the job into a two-day fen
  haul and refused to skip to the payout — the world resisting, so the job was not closed within the scenario's
  five turns). Both DMs resisted the first version of the scenarios, which assumed a dice table, a smith and guards
  the opening scene does not have; the scenarios were rewritten to the fixture's opening and the early records
  kept as `.partial.jsonl`. **Mega DM live** (Astra medium, $3 cap): 19 turns, 18 committed, the last stopped by
  the budget guard; 0 leaks of the planted private deltas; median first word 2.5 s, turn 8.2 s, cache read 64 %,
  $0.104 per turn; metrics computed (contested checks 0 % success vs 45 % expected over 18 turns). The DM asked
  out of character twice for scenes the frozen script assumed but it had not played — a limit of replaying a
  frozen campaign on a live DM, not of the loop.
- **Blind comparison** (`scripts/eval/blind.mjs`): six scenes (tavern talk, interrogation under secret pressure,
  combat climax, companion heart-to-heart, travel with consequences, power creep) × five variants (Opus high and
  xhigh, Astra high, xhigh and medium), the same inputs, 2–3 turns, written as JSON with full metadata to
  `docs/samples/stage-4/blind/` under names that carry no hint of the variant. **30 of 30 samples complete** (every turn
  committed) after reruns of the variants the per-chain budget guard had cut short; the run found one loop defect — Opus
  xhigh spent the whole 6 000-token output limit thinking on the companion scene and ended three turns with tool calls
  and no text — fixed by growing the output limit with the effort (`thinkingAllowance`, `docs/MODELS.md`), and the
  scene was replayed on the fixed code.
- **Spend:** $21.38 of the $35 cap, all in `docs/runs/`: blind comparison $13.22 (cap $12; $1.22 taken from the
  reserve for the reruns after the Opus xhigh fix and the budget-guard cuts), depth and speed probes $1.25 (cap $6),
  living-world, power-creep and long-campaign live runs $6.92 (cap $12: the Stage 4 scenarios on both models three
  times, the two partial first runs included, and the Mega DM long run). Tokens and cost per request are in the records
  (`node scripts/eval/report.mjs docs/runs/<file> --calls`).
- **Checks on the final state** (cloud VM, Node 24, `--test-concurrency=2`): typecheck pass; lint pass (0 warnings);
  build pass; tests 2471 — 2443 pass, 1 fail, 27 skipped (HTTP tests without PREVIEW_URL, as before). The one failure
  is the environment: `universal-bootstrap-sql` expects the Windows CRLF checksum of migration 30 (confirmed: the CRLF
  form reproduces the expected digest); it passes on the owner's checkout. The first full run on the final code found
  two real defects that the focused suites had not: a save made before Stage 4 failed to restore (the timeline restore
  merged NULLs into the new NOT NULL columns) — fixed by migration 56, which merges the Stage 4 defaults under older
  rows; and the Stage 4 server modules were missing from the startup-gate test's module stubs. Fake bench on the final
  code: loop runtime 19 of 19 scenarios, 344 of 344 checks; old Astra runtime 2 of 8 scenarios, unchanged since Stage 2b (its scripted checks were written for the new loop).
- **Known limits:** Astra folds `finish_turn` less often now but still sometimes ends a turn without it (then the
  server's implicit finish carries no tension or refusal hint); the plan mechanism is used reliably by Opus and
  less by Astra at medium; the fake sandbox DM covers turns, feedback and the digest but not the AI character
  wizard (real keys needed for that); `tests/universal-bootstrap-sql` expects the Windows CRLF checksum of migration
  30 and two Mega DM tests read git history the shallow clone lacks — environment, as in Stage 5.
- **Recommended next step:** the owner starts the sandbox (`Start Sandbox.cmd --fake` without keys, or with his
  keys in `.env.local`), activates the Stage 4 craft versions in the DM Craft screen, plays a few sessions and
  rates the blind samples; defaults for new campaigns follow his ratings.

---

**Stage V — pictures: styles, references, live frames, illustrated chronicle (cloud session, parallel with Stage 4).**
Branch `claude/stage-v-visuals` from `claude/stage-5-ui` (after the Stage 5 fixes; that branch has not moved since).
Task `docs/stages/STAGE_V.md`; paid-run records `docs/runs/stage-v/` (`SUMMARY.md` has every run in one table);
review pack `docs/screens/stage-v/` and `public/preview/stage-v/`. Implementation complete and verified on the cloud VM;
**waiting for the owner's review** (what to look at first is at the end of this section).

- **§0 phone layout:** the character sheet's stat tiles no longer break Russian labels mid-word on a phone: three tiles
  per row and hyphenation in the campaign language (`character.module.css`; the two tile class references in
  `character-screen.tsx` point at the new rules). Checked on the 390 px screenshot.
- **Pictures that persist (migration 54, additive):** `rpg_private.picture_styles` (append-only style versions per world
  or campaign, optional reference image, one active per scope, roll-back), `rpg_private.pictures` (frames of turns and
  anchors of people, places, items, holdings and the hero's full-length figure; versions, a timeline fence,
  queued → generating → ready/failed, a hidden flag, never deleted), `rpg_private.picture_settings` (frames mode, live
  frame quality, daily cap, the autopilot settings moved off the device: `UI_DATA_NEEDS` #16), one RPC `rpg_pictures`,
  a UTC daily cap counted on every attempt (failed ones included), and a player projection that never carries the shot
  or the prompt. The private bucket now accepts JPEG and WebP. fal pictures persist through this store with the fal
  model IDs and list prices (#15); the earlier OpenAI `subject_visual` contract is unchanged and stays OpenAI-only
  (see #15 for why). Full-figure composition beside the portrait: drawn as an anchor (#14; the paper doll still shows the
  portrait, a one-line change in `character-screen.tsx` that this stage did not own).
- **fal adapter:** FLUX.2 [klein] 4B/9B; the edit endpoint of every model with reference pictures (`image_urls` as data
  URIs, within each model's limit); `acceleration`; `safety_tolerance` 4 for portraits on [pro]; one softened re-submit
  after a content-checker refusal (age, nationality, injury and weapon words dropped), then one last request on the
  fast model when [pro] refuses again; never a loop. Endpoint IDs and fields were confirmed against the queue's own
  validation replies (fal's documentation site is outside the cloud VM's network); klein prices are list prices from
  secondary sources, counted at the higher figure.
- **Live frames:** while the narration streams, Claude Haiku 5.5 (effort low, ~1.5 s) turns the first paragraph into a
  shot (who, action, where, angle, mood) — from the public live-turn registry only, never the DM's context, so no hidden
  fact can reach a picture; second-person narration («ты…») puts the hero in the frame. FLUX.2 [klein] 9B draws it in
  ~2 s with references (the style's image, the place's anchor, the portraits of the people in the shot). «Твой момент»
  and a fight's start or end get a re-render on FLUX.2 [pro] once the turn is committed. The paid work runs after the
  HTTP response (`after()`): **a turn never waits for a picture**, and the turn path itself is untouched. The game
  screen has a frames panel (desktop and phone): the frame of the current turn with «Перерисовать» and
  «Скрыть»/«Показать», the version counter, a strip of earlier frames bound to their turns; frames stay after a reload; a
  loaded save shows its own turns' frames. The shot text is never shown.
- **Styles:** five editable presets (line art, painterly oil, pixel art, noir graphic novel, watercolour) or custom
  text, one reference image (upload), a world style with a campaign override, versions with «Вернуть», and
  «Перерисовать анкеры в новом стиле» with the price per tier before you click. Old anchors stay until the new ones are
  ready; past frames keep the style they were drawn in; the chronicle re-renders on request. The noir preset on the noir
  sample looks noir (`docs/screens/stage-v/noir-*.jpg`).
- **Owner's rule (quality by default where it does not hurt the live feel):** anchors and key-moment re-renders go to
  the quality tier ([pro]); live frames go to the fastest model that keeps about 4 s ([klein] 9B), with the quality tier
  one click away in Settings → Картинки («Качество живых кадров»).
- **Illustrated chronicle** (`/campaigns/<id>/chronicle`, the «Хроника» button in the frames panel): sessions as
  chapters, each with its recap (chapter titles and «Ранее в…» are read when Stage 4 adds them, never required), the
  player's action, the frame, the story text; «Перерисовать в текущем стиле» for the whole book.
- **Settings → Картинки:** frames mode (every action / key moments only / off), live frame quality with the price and the
  time per frame, who draws the anchors (fal or the earlier OpenAI path), the autopilot toggles incl. the full-length
  figure, the daily cap shared by frames and anchors, today's count and spend, the style block, the workshop with every
  Stage V picture and its cost.

**Numbers (paid runs, `docs/runs/stage-v/`; synthetic samples only).** Live frame latency after the first paragraph
(medians, shot + picture): [klein] 9B **3.4 s without references and 4.6–4.9 s with them** (the reference pictures
add about 1.5 s on fal's side and raise the people score from 3.2 to 5.7); [klein] 4B 3.5 s with references on a
5-turn probe, [flash] 6.7 s, [pro] 18.7 s. In the app the first paragraph arrives a few seconds after the first word,
so a frame shows while the text is still streaming; `FAST_FAL_IMAGE_MODEL` is the one switch if the owner prefers 4B. Price per frame: [klein] 9B $0.017 (4B $0.016, [flash] $0.005, [pro] $0.030); per turn
with the shot $0.0172 (the shot is $0.0002). A full anchor re-render of «Мир Шва» (29 anchors: 6 portraits, the hero's
figure, 1 transport, 4 places, 17 item types): **$0.49 fast / $0.87 quality**; the noir sample (15 anchors) $0.26 / $0.45.
[pro] portraits at tolerance 4: 6 of 6 drawn, 2 of them after the softened re-submit (12.7 s median); [pro] key-moment
re-renders of the four fight turns: 2 of 4 refused even softened — hence the fast-model fallback. No refusal at all on
[klein] (113 anchors, about 200 frames; one frame of 200 failed on fal's side and was not retried). Consistency (the vision model's 0–10 score of a frame against the anchors it should
match, 20-turn scene, oil style):

| Run | Frames | Median frame (shot + picture) | Per frame | People 0–10 | Place 0–10 | Style 0–10 |
| --- | --- | --- | --- | --- | --- | --- |
| oil, [klein] 9B, references on | 20 | 4.6 s (1.5 + 3.3) | $0.017 | 5.68 (n=19) | 6.0 (n=2) | 7.16 |
| oil, [klein] 9B, references off | 20 | 3.4 s (1.5 + 1.8) | $0.017 | 3.16 (n=19) | 5.0 (n=2) | 7.16 |
| line art, [klein] 9B, references on (10 turns) | 9 | 4.8 s (1.4 + 3.4) | $0.017 | 6.0 (n=8) | 6.5 (n=2) | 8.12 |
| watercolour, [klein] 9B, references on (10 turns) | 10 | 4.9 s (1.4 + 3.4) | $0.017 | 5.78 (n=9) | 5.0 (n=2) | 8.44 |
| noir sample, noir preset, [klein] 9B, references on (10 turns) | 10 | 4.8 s (1.3 + 3.6) | $0.017 | 6.56 (n=9) | 4.4 (n=5) | 8.78 |
| oil, [klein] 4B, references on (5 turns, earlier prompt) | 5 | 3.5 s (1.5 + 2.1) | $0.016 | 5.5 (n=4) | 5.5 (n=2) | 7.4 |
| oil, [flash], references on (5 turns, earlier prompt) | 5 | 6.7 s (1.4 + 5.2) | $0.005 | 6.0 (n=4) | 5.5 (n=2) | 7.2 |
| oil, [pro], references on (5 turns, earlier prompt) | 5 | 18.7 s (1.4 + 15.8) | $0.030 | 5.5 (n=4) | 6.0 (n=2) | 7.2 |

Spend: **$6.50** (885 paid calls: 360 fal images at list price, 525 Haiku shots and scores) of the $25 cap (every call in `ledger.json`). Known limits: the vision score is a cheap automatic
proxy, not a human judgement; references help people far more than places (a place anchor exists only for visited
places); [pro] refuses violent climaxes often enough that the fast model draws them instead; the owner's own database was
never touched (no live play here) — the first real play with frames on is the owner's check.

**Checks on the final branch state:** typecheck pass; lint pass (0 warnings); build pass; tests 2455 — 2427 pass, 1 fail, 27 skipped
(the HTTP tests without `PREVIEW_URL`, as before). The one failure is the environment, not the code: `universal-bootstrap-sql`
expects the Windows CRLF checksum of migration 30 and passes on the owner's checkout (the two git-history tests pass here
after `git fetch --unshallow`). Stage V's own tests: `tests/stage-v-fal.test.mjs`, `stage-v-pictures-sql.test.mjs`
(migration 54 on PGlite), `stage-v-pictures.test.mjs`, `stage-v-engine.test.mjs`. Screenshots: 16 in
`docs/screens/stage-v/` (desktop 1440 and phone 390; every phone shot 0 px overflow, 0 px clipped). Paid runs stopped
by the bench's ledger guard, never reached the cap. Nothing touched the owner's database or `main`.

**What the owner should look at first:** `docs/screens/stage-v/game-phone.jpg` and `game-desktop.jpg` (the frames
panel), `chronicle-desktop.jpg`, `settings-desktop.jpg` (the picture block and the style versions), the frames of the
three styles in `public/preview/stage-v/` (`shov-oil-…`, `shov-line-art-…`, `shov-watercolor-…`) and the noir sample
(`noir-noir-…`). To try it live: Settings → Картинки → «Живые кадры: на каждое действие», play a turn; the frame should
appear a few seconds after the first paragraph, while the text is still coming.

---

# Development status

**Current stage:** Stage 3 — record integrity and campaign limits — done; waiting for the owner's review and
«дальше». Plan: `docs/REBUILD_PLAN.md`; task: `docs/stages/STAGE_3.md`; design of the loop with the new
sections on limits, the folded finish and SQL integrity: `docs/TURN_LOOP.md` §3, §6, §9; procedure for
stage 6: `docs/RELEASE_CHECKLIST.md`; rules: `CLAUDE.md`.
---

**Stage 5 — the new interface — built in parallel with stages 2b–4 (owner-approved exception).**
Branch `claude/stage-5-ui`, rebased onto the accepted `claude/stage-2b-speed`, worktree `../rpg-console-ui`; pushed to
origin (not merged, nothing on `main`).
Task: `docs/stages/STAGE_5.md`; design: `design/`; data still missing: `docs/UI_DATA_NEEDS.md`.

- Registry look (leather, brass, parchment; Old Standard TT / Alegreya Sans / PT Mono) as tokens in
  `src/app/registry.css`; older screens are re-skinned through the same tokens. New library and campaign shells
  (left nav with dynamic «Лагерь»/«Имущество» and «Приключения», breadcrumb, model pill, phone tab bar + drawer).
- New screens on real records, earlier editors kept under «Ещё»: Campaigns (continue card, «Ранее в…» from the
  last closed session, old-runtime badge with «Перевести на новый ход»), New campaign (4 steps over the existing
  bootstrap), Game (around the existing composer and stream; dice tray, addressee, sidebar with hero, goal,
  adventure, party), Character/Inventory (paper doll from the record's slots, parchment item card), Party
  (talk/council drawer = companion composer, disabled in combat), Journal, Codex (new), Map (route line, goal,
  «Наметить курс» into the turn box), Holdings (new; camp always, transports/mounts from records), Settings
  (DM model/effort/runtime live; images; all old settings under «Ещё»). Main menu and adventures restyled.
- Universal: no ruleset vocabulary or sample content in app code (a test guards it); labels come from the
  records and the existing presentation helpers. Two synthetic samples: `/preview/stage-5/<screen>` and
  `?world=noir` (a narrative noir without classes, levels, ability scores, spells or gold).
- Pictures: fal adapter (FLUX.2 pro $0.03 / flash $0.005 per 1 MP image), a visual autopilot that queues the
  existing subject-visual jobs after a committed snapshot (toggles, daily cap, auto-accept only without a review
  warning, never retries), «Перерисовать» everywhere, previous picture kept until a new one is accepted, one
  picture per item type. Saving fal pictures needs the SQL provider update (UI_DATA_NEEDS #15).
- Paid fal tests: 22 requests, 17 images kept, $0.56 counted of the $3 cap (`docs/screens/stage-5/fal-cost.json`).
- Screenshots: `docs/screens/stage-5/` (48: desktop 1440 and phone 390, no horizontal overflow).
- Checks on the final branch state (after the 2b rebase): typecheck pass; lint pass (0 warnings); build pass;
  tests 2436 — 2409 pass, 0 fail, 27 skipped (HTTP tests without PREVIEW_URL, as before). One earlier run, made while
  a second session ran its own suite, had two Astra smoke tests over the 30 s limit; both pass when run alone. Two older game-screen tests were moved from the
  Phase-0 markup to the new layout with the same behaviors. No change in the stage 2b–4 paths.
- Live streaming (after the 2b rebase): the game screen renders the streamed turn itself — the DM's text as it
  arrives with a «ведущий пишет…» caret, the «Что изменилось за ход» chips (accepted changes only), and «Твой
  момент» when the turn ends on a player moment; the chips stay for the turn just played. One stream per turn
  (the composer passes its live view out). Saving fal pictures and the data in `docs/UI_DATA_NEEDS.md` belong to
  stages 3–4.

**Stage 5 review fixes (`docs/stages/STAGE_5_FIXES.md`, cloud session, no paid calls):**
- Roll card stacks on narrow phones (icon + label, then DC badge + result; checked at 360 and 390 px). Sheet tabs and
  section links wrap on phones; slot labels and names wrap instead of clipping; the screenshot script now also fails a
  phone shot when any element is drawn past the viewport's right edge or the captured image is wider than the viewport.
- Display-label layer (`src/lib/ui/labels.ts`, `c.label()`): a label the record provides wins, then the shared catalog
  (incl. numbered keys such as «Spell slots {n}»), then the raw phrase. Common record/ruleset keys were added to
  `ru.json` («Класс доспеха», «Сложность заклинаний», «Ячейки заклинаний», «Очки чародейства», «Золото», «Экипаж»,
  «Груз», «Инструменты», «Разное» …); the English «Neon & Rain» sample stays English. The hero card's stat line lost
  its monospace font.
- Item tiles without a picture show the short name with a category glyph; the plain box stays only for nameless items
  (inventory and holdings). No per-record «появится позже» blocks any more: one short «позже» line per screen; the
  Journal keeps a one-line placeholder in «Главная арка».
- A portrait that fails to load falls back to the initial-letter avatar (`Art`); the player's message in the story uses
  the hero's portrait through the screen's image resolver.
- Map: pin labels avoid each other (below → above → hidden until hover/tap; the current place is always placed,
  `src/lib/map/label-layout.ts`), the preview page no longer repeats the atlas title, the travel hint reads
  «Отправляюсь. Цель — …».
- New-campaign wizard and campaign settings take the selected model's own default effort from its capabilities
  (`dmModelSpec`), «Game Master» replaces «Dungeon Master» in the English shell and settings, companion quick prompts
  are gender-neutral.
- fal: the 5 first-try `validation` failures were HTTP 422 «flagged by a content checker» on portrait prompts, the same
  prompts passing on retry — recorded with the cause and what Stage 4's autopilot must do in `docs/UI_DATA_NEEDS.md`.
- Screenshots re-captured for the affected screens (desktop 1440 and phone 390; every phone shot: 0 px overflow,
  0 px clipped, image 390 px wide). Checks on the final state (cloud VM, Node 24): typecheck pass; lint pass; build pass; tests 2439 — 2409 pass,
  3 fail, 27 skipped (HTTP tests without PREVIEW_URL, as before). The 3 failures are the environment, not the code:
  two read git history that the cloud's shallow clone lacks (`mega-dm-bakeoff-completion`, `mega-dm-living-smoke`),
  one expects the Windows CRLF checksum of migration 30 (`universal-bootstrap-sql`); they pass on the owner's checkout.
  The suite needs `--test-concurrency=2` on the 4-vCPU VM (the default parallelism trips the 30 s per-test limits).

---

**Current stage:** Stage 2b — speed and fluency of the new turn — done, including the live bench of both
models; waiting for the owner's review and «дальше». Plan: `docs/REBUILD_PLAN.md`; task:
`docs/stages/STAGE_2B.md`; results and the breakdown of where the time goes: `docs/SPEED.md`; design of the
loop: `docs/TURN_LOOP.md`; rules: `CLAUDE.md`.

**Branch:** `claude/stage-3-records` from `claude/stage-2b-speed`. Not merged, not pushed. The UI session
works in parallel on `claude/stage-5-ui`; nothing under `src/components/**` or `src/app/**` was touched here.

**Stage 3 in short (2026-10-15):**
- The database guards the loop's invariants itself (migration 54, additive): money and every named counter
  never below zero and never above its stored `<name>_max` cap (table CHECK, legacy rows respected); item
  quantities and HP bounds (the existing CHECKs, now tested directly); a quest reward claimed at most once —
  the commit records the claim on the quest row from the loop's private terms and fails a second one
  (`rpg_reward_claimed`), a trigger forbids moving or clearing it, an FK ties it to an operation of the same
  campaign; a committed turn can never be re-committed, rewritten (status, input, narration, runtime) or
  deleted (`rpg_immutable_history`), outside a save restore; cross-campaign writes and stale revisions were
  already refused by the applier and are now tested in SQL. `tests/record-integrity-sql.test.mjs` tries each
  of these directly in SQL on PGlite, including forged commit packets: every attempt fails.
- Per-turn limits are campaign settings (`dm_settings.limits`, same API and RPC as runtime and model; null =
  generous defaults: 1,000,000 money created, 50 items, 20 new characters, a week of game time, 40 tool
  calls, 10 model requests per turn). They are pinned into the operation with the model when the turn starts,
  enforced per call from the pin (a change applies to the next turn; a retry keeps its pin), and the SQL commit
  re-checks the time and new-character limits. No settings panel change in this stage (the panel belongs to
  the stage 5 UI session): the API returns and accepts `limits`, and `dm-settings-client.ts` carries the field
  names, labels and ceilings for that screen.
- Compatibility: old `astra-primary-v1` turns, saves and loads read exactly the same across migration 54
  (tested by applying it to a running campaign); a save on `dm-loop-v1` carries new characters with Character
  Models, places, holdings, quests with claimed rewards, private notes and receipts, and a load restores it
  byte for byte, then the same NPC continues (bench scenario 06 green); a synthetic 24-turn taken-over Astra
  campaign with two saves and a branch was switched to `dm-loop-v1`, played on, rewound to a pre-switch save
  and continued on either runtime with its history untouched. Loop turns now honour the per-turn autosave
  policy like the older runtimes (they skipped it in stage 2). `docs/RELEASE_CHECKLIST.md` says what stage 6
  must do against a copy of the owner's database; nothing was run against it.
- Stage 2b leftovers: Astra's `finish_turn` round of its own is folded into the final bookkeeping message
  (the instructions make time passing the last bookkeeping call; on an OpenAI pin a message of accepted
  bookkeeping that closes with time passing ends the turn — never after a rejected or deciding call). The
  owner's Character Model correction screen and the old Astra commit now accept the stage 2b bounds (12
  entries per list, 400–600 characters per text, 6000 bytes).
- Bench: scenario 13 "invariant attack" (11 attacks rejected with reasons, turn commits, state intact);
  fake bench on `dm-loop-v1` 13 of 13 scenarios, 123/123 checks; old Astra fake bench unchanged (2 of 8).
- Paid smoke (the live path changed: the fold and one instruction line), cap $2: GPT‑6 Astra medium on
  scenarios 01 and 06, 8 turns, 13 requests, **$0.80**; 0 failed turns, 16/17 checks (the miss is the known
  "delivered job left open" model habit of stage 2b, scenario 06), 0 suspected leaks. The fold fired in 4 of
  8 turns (the one-call-per-request ones) and saved a request each; the other 4 already batched `finish_turn`
  in one message. Medians: first word 4.3 s, turn 21.3 s, $0.084, 1.5 requests, cache reads 75%.
- What to try: nothing new to click. Play a campaign on the new loop as before; a job's reward can no longer
  be paid twice by any path, and a campaign's limits can be lowered through the settings API (the panel
  comes with stage 5).
- Known limits: a job agreed on the old runtime keeps its terms in the quest row, not in the loop's private
  terms, so after a switch the loop asks the DM to record the terms again (`quest update`) before
  `claim_reward`; the loop's item-count limit is enforced in TypeScript only (splits make extra rows, so the
  SQL commit does not count items); the folded finish records no scene kinds for that turn.
- Checks on the final branch state (commit `0ce5ae2` plus this status and two lint fixes in tests): typecheck pass;
  lint pass (0 errors, 0 warnings); build pass; tests 2436 — 2409 pass, 0 fail, 27 skipped (26 HTTP tests
  without `PREVIEW_URL`, by design, + 1 opt-in), 993 s on a laptop shared with another session's suite (a first
  run under heavier load timed out two spawn-script tests at their 30 s limit; both pass alone in 2–10 s, and
  migrations 1..53 and 1..54 both build a PGlite database in ~1.2 s, so there is no slowdown); fake bench on
  `dm-loop-v1` 13 of 13 scenarios, 123/123 checks, no harness problems; old Astra fake bench 2 of 8 (unchanged).

**Stage 2b (accepted) — in short:** the DM tells the story first and acts inside it (first sentence streams at
once, deciding calls before their outcome, bookkeeping in one final message with `finish_turn`); Character
Model bounds became anti-garbage limits; Astra's prompt cache works across turns; a clock note set to text is
rejected as one call. Medians: Opus 5.5 high first word 8.2 s, turn 25.9 s, $0.075; Astra medium first word
2.0 s, turn 14.3 s, $0.093. Details: `docs/SPEED.md`.

**Stage 2 (accepted) — what exists:**
- `dm-loop-v1` (`src/lib/gameplay/dm-loop/`): the DM model (Opus 5.5 or Astra through `DmModel`) writes free
  narration, streamed to the player, and changes state only through 16 validated tools. Every call is checked
  against a shadow copy of the turn's state and gets a receipt (accepted + result, or rejected + a reason the
  model can act on); the turn continues. Receipts are persisted at once; a crash resumes from the last
  checkpoint without re-rolling dice. One atomic commit through the generic SQL applier (migration 53).
- Campaign DM settings (`rpg_private.dm_settings`, RPC `rpg_dm_settings`, panel "DM runtime and model" in
  Campaign Settings): runtime `dm-loop-v1` or `astra-primary-v1`, DM model and effort, editable at any time —
  also after a takeover. New campaigns play on `dm-loop-v1` from the first scene; existing ones keep Astra.
  The model is pinned per operation; retries keep the pin.
- Four-layer request (how to DM / world / living / now) with cache breakpoints; the first three layers are
  stable across turns (verified by per-layer hashes). Cache read share and request sizes are logged per request.
- Live view: narration deltas and accepted changes stream to the game screen over server-sent events, marked
  provisional until the turn is saved (`/api/campaigns/<id>/turns/<op>/stream`).
- Secrets: one narrator sees Character Models and private notes; the literal privacy check only logs
  suspected leaks to the turn diagnostics (W3 closed). A reward is paid exactly once; a plain payment from the
  quest's issuer settles it (W1 closed). W2 (paraphrased leak) is a live-quality question.
- Bench: `--runtime dm-loop-v1` with a scripted DmModel or the live adapters, scripts for scenarios 01–08 plus
  09 (companion talk), 10 (tool cap), 11 (crash resume). The old Astra bench is untouched (still 2 of 8).

**Checks on the final branch state:** typecheck pass; lint pass (0 warnings); build pass; fake bench on
`dm-loop-v1`: 11 of 11 scenarios, 96/96 checks, W1 and W3 closed, W2 open; old fake bench 2 of 8 (unchanged).
Tests: 2415 — 2388 pass, 0 fail, 27 skipped (26 HTTP tests without PREVIEW_URL, by design, + 1 existing opt-in), 398 s.

**Paid runs (2026-10-15, cap $15):** Opus 5.5 high on scenarios 01–08: 33 turns, 137 requests, $3.8769; Astra
medium: 26 turns (24 committed, 2 refused by the budget guard), 109 requests, $3.79 measured ($5.39 reserved).
Smoke and stopped runs: $1.13. Total ≈ $8.8. Medians per turn: Opus 35.3 s / $0.104 / 89% cache reads /
first word 31.8 s; Astra 35.1 s / $0.147 / 75% / first word 23.6 s. No turn failed by the model or the runtime;
no literal secret leak. Numbers: `docs/BASELINE.md` §9.

**Known issues carried forward:** scripted scenario checks are a poor pass/fail measure for live play (models
rename NPCs, record them at first sight, let jobs fail or leave them open). Switching a real taken-over campaign
is rehearsed on synthetic data only — Stage 6 does it on a copy of the owner's database (`docs/RELEASE_CHECKLIST.md`).
Stale leftover edits from the old detached checkout are in `git stash` ("pre-stage-0: …").

**Next step:** Stage 4 after «дальше». Not started.

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
