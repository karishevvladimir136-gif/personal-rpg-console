# Development status

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

**Branch:** `claude/stage-2b-speed` from `claude/stage-2-turn-loop`. Not merged, not pushed.

**Stage 2b in short (2026-10-15):**
- The DM now tells the story first and acts inside it: the opening sentence streams at once, a roll or a
  payment is called before the sentence that describes its outcome, and all bookkeeping (new characters,
  places, items, quests, time, notes) goes in one final message with `finish_turn`. Text written around a
  tool call is joined into one narration and streamed the same way.
- Fewer reasons for an extra round: Character Model bounds are now anti-garbage limits (12 entries per list,
  400–600 characters per text; plan §9 pulled forward), a rejection names the field and the bound, an
  unknown name is answered with the closest records and their IDs. A clock note set to text, which made the
  SQL commit fail twice in the live run, is now rejected as one call.
- Astra's prompt cache works across turns (explicit breakpoints on the three stable layers): the first
  request of a turn reads 76% of its prompt instead of writing all of it.
- Medians, Stage 2 → Stage 2b. Opus 5.5 high: first word 31.8 s → **8.2 s**, full turn 35.3 s → **25.9 s**,
  4 → **1** model request per turn, $0.104 → **$0.075** per turn, turns with a rejected call 24% → 5%.
  GPT‑6 Astra medium: first word 23.6 s → **2.0 s**, full turn 35.1 s → **14.3 s**, 4 → **2** requests,
  $0.147 → **$0.093**, cache reads 75% → 84%. Astra xhigh (owner's request, scenarios 01, 03 and part of 08):
  first word 1.8 s, turn 19.8 s, $0.105, 27/28 checks.
- Against the targets: Astra meets both (≤ 6 s first word, ≤ 25 s turn). Opus high does not: its first word
  is the ~8 s of thinking before the first token, and the turn is ~15 s of writing after it (230 words plus
  six tool calls). The floor and the two levers (first-request effort, shorter bookkeeping) are in
  `docs/SPEED.md` §5. No failed turns by the model; 1 literal leak in 10 Opus provocation turns (the NPC
  names his own debt under pressure), 0 on Astra.
- Effort per round (task §3): implemented as a pinned continuation effort (Anthropic top-level change,
  OpenAI `configuration_update`), tested offline, not compared live — on Opus it restarts the cache and a
  median turn has one request anyway; on Astra the continuations reason nothing. No campaign setting added.
- Bench: live checks are outcome-based (a live DM may name and order things its own way), scenario 12 is the
  fluency set, records keep full narration and per-request tool lists, `scripts/eval/samples.mjs` writes
  sample turns. Samples: `docs/samples/stage-2b/opus-high.md`, `astra-medium.md`, `astra-xhigh.md`.
- What to try: play a few turns of a campaign set to the new turn loop (Campaign Settings → "DM runtime and
  model"); the first sentence should appear within a few seconds and the accepted changes follow under it.
- Known limits: Astra at medium still puts `finish_turn` in a round of its own (2.5–3 s); the owner's
  Character Model correction screen (old SQL validator) still enforces the old 120/160-character, 2–3-entry
  bounds — Stage 4 redoes that screen; the bench's budget guard reserves the full output allowance per
  request (~$0.55 on Astra), so a live run stops ~$0.6 before its limit.
- Paid runs of this stage: $9.05 recorded (at most $9.20 with one unrecorded in-flight request of a run the
  owner stopped) of the $10 cap; per run in `docs/SPEED.md` §3.
- Checks on the final branch state (commit `2a04772` plus this line): typecheck pass; lint pass; build pass;
  tests 2423 — 2396 pass, 0 fail, 27 skipped (26 HTTP tests without `PREVIEW_URL`, by design, + 1 opt-in),
  456 s; fake bench on `dm-loop-v1` 12 of 12 scenarios, 109/109 checks; old Astra fake bench 2 of 8 (unchanged).

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

**Known issues / what Stage 3 must harden:** balances, quantities and the one-reward-claim rule are TypeScript
rules today — SQL invariants in Stage 3 (the generic applier already keeps resources non-negative and HP in
bounds). Both models write the narration after the last tool round, so the first word arrives with the whole
text (23–32 s). Character Model limits from Stage 1 reject many of Opus's notes (Stage 4). Scripted scenario
checks are a poor pass/fail measure for live play (models rename NPCs, record them at first sight, let jobs fail).
Switching a taken-over campaign to `dm-loop-v1` is wired (the begin re-labels the Astra row) but untested on a
real campaign — Stage 6 on a copy of the owner's database. Stale leftover edits from the old detached checkout
are in `git stash` ("pre-stage-0: …").

**Next step:** Stage 3 (atomic write with SQL invariants, campaign limits, compatibility of old turns and saves)
after «дальше». Not started.

The full pre-rebuild status history is in `docs/archive/DEV_STATUS_history.md`.
