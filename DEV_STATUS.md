# Development status

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
