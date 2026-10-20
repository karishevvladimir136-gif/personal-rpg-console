# Fixes after session 2 — progress (the whole run, stages A → B → D → C → E → F)

The run's instruction: `docs/stages/FIX_S2_RUN.md` (copied from `claude/handoff` with `FIX_S2_AB.md`, `FIX_S2_CDEF.md`
and `FIX_S2_PLAN.md`); the owner's notes: `docs/runs/session2-owner-notes.md` on `claude/handoff` (not copied).

**Branch:** `claude/session2-fixes-a-f-jh3krk` — the cloud session's own branch (the session may push only there; the
run's instruction names `claude/fix-s2`, so the work is on this branch instead, as `docs/CLOUD.md` allows). Based on
`origin/claude/session-2-prep` at `d74b6c6`, with `origin/claude/stage-fix-turn-lease` (`fb40961`) merged first.

**Money:** the ledger `docs/runs/fix-s2-ledger.md` (cap $50; A+B within $30), guarded by
`scripts/eval/real-replay/lib/ledger.mjs` (`fixs2`).

## Done

- Setup: the branch, the lease-renewal branch reviewed and merged (migration 71: every dm_tool, checkpoint, commit and
  fail of a dm-loop-v1 turn renews the lease while its token is the turn's; a retry may claim a pending or generating
  turn; the composer drops a refused resume command), `.env.local` from the `APP_*` variables, the ledger.
- Baseline: the full suite on a clean worktree of the base (`a49c1e2`): 2627 tests, 2600 pass, 27 skipped, 0 fail.
- Stage A, part 1 (commit `22b748b`): A1 — the output cap 32 000 (thinking included), a cut turn continues once from
  where it stopped one notch lower (tool calls of a cut answer dropped, unsigned thinking never resent), the lease
  heartbeat while the model streams (migration 72), the provider's error in the log, the failure texts and «Отправить
  этот ход ещё раз»; A2 — the cache inside the turn (the message breakpoint at the turn's end; the living dossier rides
  the history's breakpoint), the cache simulator (`scripts/eval/fix-s2/cache-sim.mjs`) on the synthetic long campaign;
  A3 — depth: every turn at the range's base, «⚡ важный ход» and a combat climax one level deeper (default range high–high);
  bundled rolls (`roll` takes the attack's damage and a save's half-on-save effect in one call); «Продолжение хода»
  (same / one notch lighter) as a DM option (migration 73: `dm_options`).
- Stage A, part 2 (commit `3af4a34`): the client's polling backs off (3 s → 20 s, paused in a hidden tab, one read in
  flight); the stream is `no-transform`; the session-end card polls only while open; the digest's guard (one at a
  time, once a minute on entry, never while a turn is unresolved) and its cut-by-cap reason in the log (A4); the party
  council as a light call (two system blocks, notes/time/finish tools, medium depth, no memory retrieval); «Что мне
  нравится» in the cached world layer, the DM's observations append-only (A2); «Память ведущего» presets
  (compact / standard / wide) as a DM option; the owner screen «Для владельца» — each turn's cost, requests, seconds and
  depth, a turn over $1 or 4 requests flagged with its cause, and «Что видит ведущий» (the layers of the last request,
  their sizes; private text only with the owner's opt-in) (A3, A5); the bootstrap and picture-frame calls logged (A5);
  A6 — the two-pass runtime gets the cap, the cut recovery, the heartbeat, the turn cache and the continuation depth,
  the council stays on the light call; the ledger checker (Haiku 5.5 compares the narration, the writer's ledger and the
  accepted records before the commit; a miss → one correcting bookkeeper call; what still does not match → the owner's
  chip «не записано: …» in «Для владельца» and a log line; its cost joins the turn's cost); the probes
  (`scripts/eval/fix-s2/probes.mjs`: talk, council, mine-style fight, long rest) and the replay's flags
  (`--continuation`, `--memory`, `--instructions`, `--label`, `--ledger-check`, variant O = Opus writes and records).

- Stage A, measurements and follow-ups (this commit): the probes before (base) and after in four arms ($14.97 in all);
  found and fixed live — the bookkeeper recorded a roll's applied damage twice (the brief now says it is applied), a cut
  continuation refused with HTTP 400 (plain-text retry; whitespace-only blocks filtered), the lighter continuation left
  a fight untold twice in three (default stays «как основной запрос»; the outcome request runs at the turn's depth), the
  ledger checker's false flags (it now gets the people on record and the party's tracked stock: 8/8 known misses caught,
  0/6 controls flagged); the DM options in Settings; «Opus пишет — Opus записывает» as a choice; the owner screen's
  preview, Russian causes and phone cards; screenshots `docs/runs/fix-s2-shots/A-*`; the report's stage A section.

- Stage A's clean-worktree full suite on `f54f317`: 2656 tests, 2624 pass, 27 skipped, 2 fail, 3 cancelled. The two
  failures were a test of the game screen's runtime that did not know the new backoff poll (fixed in stage B: the test
  loads the real poll on the window's timers); the three cancelled are `d2a-composition` tests that are cancelled the
  same way on the untouched base (`a49c1e2`) — pre-existing, not this run's.
- Stage B, part 1 (`01d7402`) and part 2 (`1232fbb`): B1 the hidden layer (the prep, «Тайны (видит только ведущий)»,
  migration 74), B2 memory hygiene (validity, `recall`, folds, the gauge), B3 the rules on the server (every seen roll
  told, natural 20/1, the doubled modifier, `rest`, person-named places, «Твой момент», Heroic Inspiration; migration
  75), B4 the native Russian instructions (written by a Fable 5.1 subagent) and the voice layer.
- Stage B, part 3 (this commit): the paid B probes in session 3's mode with both instruction languages, the prep probes,
  the Russian fight and rest, the memory presets (simulated on a 300-turn campaign, the recall probe live at
  «компактно»); defaults by the result — Russian instructions, «стандарт» memory; a wider window slides in bigger
  steps; a roll is told as what happens, never as the die's number; the report's stage B section.

- Stage B's clean-worktree full suite on `01492a5`: 2670 tests, 2640 pass, 0 fail, 27 skipped, 3 cancelled (the
  `d2a-composition` cancellations, the same on the untouched base). Stage B is done.
- Stage D (parts 1–3, `6cedf0c` … `9d62244`, probes `fb9ff8d`): the inventory model (`src/lib/inventory/model.ts`,
  `sheet.ts`; the design note `docs/runs/fix-s2-inventory-design.md` by a Fable 5.1 subagent, with an implementation
  appendix), migrations 76–78 (the place pile, the eleven-slot doll in SQL, the sheet of schema 2, the conversion
  function the owner's session runs once, owner saves with the model's fields), the DM's tools on the model (gear and
  sheets from stat blocks, merging stacks, found loot where it lies, coins by 5e codes, one source pays once,
  ammunition per shot, worn items' bonuses, counters with labels, the hero's sheet with a reason, mounts with
  saddlebags), the DM's state and the ledger checker on the model; the DM-side acceptance scenario; the loot and fight
  probes ($3.07).
- Stage C, part 1 (`716b306`): the owner's decision «the DM rolls for the companions» on the server — a companion's
  check never pauses the turn (both DM modes) unless «Броски спутников: игрок».
- Stage C, parts 2–4 (`6419590` the screens by a worker, `c30eef8`, `727c1e5`): the turn as one timeline (text, the
  roll cards and the companions' chips in place, the named pause), the action box that grows, the transcript folded;
  the continuation after «Дальше» streams live; each roll of a saved turn knows its place in the text (migration 81);
  a paused turn carries its told text; every addend of a roll with its own source (migration 82); the pause named
  from the DM's calls.
- Stage D, parts 4+ (`2c74835` the screens by a worker, `277f7fc`, `e762714`): the doll, the item card, «Надеть /
  Снять», drag, owner moves with undo and history, the wallet line, «Здесь лежит», lent marks, companion sheets, the
  spells tab; starting things on the doll at creation (migration 83); the owner-side acceptance through the real
  saves.
- Stage E (`b5f772e` … `91d5583`): frames that match their turn (role words, gaze and hands, gear from the records,
  identity-only references, temporary looks, 0 HP), the caption of the frame's own moment, no frame for an
  out-of-game reply, the vision check with one automatic redraw, the frame in its turn and the button's answers in
  words, the day from the owner's midnight (migration 79), the gallery instead of the chronicle, the session close by
  length (migration 80: the ending cards, the open threads, «Тем временем» through the world); the picture probe
  ($0.43); screenshots `E-*`.

- Stages C, D and E's clean-worktree full suite on `91d5583` (their work is interleaved, so one suite covers the
  three): 2725 tests, 2695 pass, 0 fail, 27 skipped, 3 cancelled (the `d2a-composition` cancellations, the same on the
  untouched base). The default frame path's two follow-up commits (`9d1fcd2`, `39c42ee`) passed their focused tests;
  the final suite covers them. Stages C, D and E are done.

- Stage F (`4593089`, `2ce04b5`; F2 by a worker `7b08b02` … `b9665d5` → merged as `…008509b`; F1 by a worker `8063f89` …
  `dc29bd5` → merged as `a2a467a` … `e4211bc`; then `3701857`, `bdd334a`, `b718733`): the hero built by the campaign's
  DM in one pass (migration 84), the wizard in story order, the world as a canon document, the adventure's whole text
  in each turn, the opening's answers pinned and names applied, Opus at high; readable sizes, the screens filling the
  window, «Крупный текст истории», «Мастерство Ведущего», the Library, «ИИ: кто что делает», «Правила и кости», the
  opening's frame, the quiet tools; «учётчик» as the one role word; the false «Покинуть страницу…» fixed; the
  Adventures screen's sizes and the wide campaign list. The hero probe ($0.32): both synthetic heroes right. The
  acceptance checklist's sections 6–7, the report's stage F section, the sandbox guide, DEV_STATUS. Screenshots `F-*`
  (26 screens × 4 sizes) retaken on the merged code. The production build passes on a clean worktree of `b718733`.

## In progress

- The final clean-worktree typecheck, lint and full suite on `b718733` (the last code commit). Money: $30.12 of $50
  spent; nothing more is planned.

## Owner's instructions during the run

- 2026-10-20: item 31 (the region map, the location paintings) moved to the parallel 2D Live session
  (`docs/stages/LIVE2D_1.md`, branch `claude/live2d-1`) — skipped in stage F. This run's migrations stay below the prefix
  `2026102102`; `src/lib/live2d/` and `src/components/live2d/` are not touched (the new section at the end of
  `FIX_S2_CDEF.md`).
- 2026-10-20 (later): stage C's combat items (the combat tool's rounds and turns, enemy HP, reactions, ambush, coup de
  grâce, the battle map and the combat screen) also moved to the 2D session (`LIVE2D_1.md` Part 2). This run does not
  touch `src/components/gameplay-combat.tsx`, `src/lib/gameplay/combat-exchange.ts` or the `combat` tool; stage C keeps
  the turn timeline, the roll cards and the screen items; the B3 rules (damage per attack, every roll told) stay in B.
  The owner now talks with the session in English.
- 2026-10-20 (later): A3 gained bundled rolls (independent ones; an attack with its damage, a save with its effect),
  lighter continuations as a campaign setting adopted only if the probes show no quality loss, and each turn's cost,
  requests and seconds in the owner panel (a turn over $1 or 4 requests flagged with its cause); A5 gained the owner
  screen «Что видит ведущий»; stage D gained the companion cards with the stat block's numbers; the run ends with
  `docs/SANDBOX_LOAD_FIX_S2.md` (backup, migrations, a production build, the owner's data corrections, the replay).
- 2026-10-20 (later): A2 — the owner's «Что мне нравится» lives in the cached stable layer; the DM's observations of the
  player are append-only. Then: the history window becomes «Память ведущего» with three presets (компактно / стандарт /
  широко), all measured on the probes, the default by the result.
- 2026-10-20 (later): B2 (5) — private facts and clocks carry «true since / until»; the DM closes a fact instead of
  overwriting it; closed facts rank last and fold first; recall can answer «what was true then»; no external memory
  platform.
- 2026-10-20 (later): A6 — the stage A fixes go into the two-pass runtime too; the two modes compared on the probes.
  Then the owner decided session 3 runs on «пишет — записывает» (unless the probes show its records worse) with the
  ledger checker.

## Open questions

- Session 3's mode: the owner's «Opus пишет — Opus записывает» holds on the records but costs ~$0.70 a turn against
  ~$0.40 (in the report's «Needs the owner»).
- The ledger checker runs before the commit (while the player already reads the text), so its correction lands in
  the same atomic commit; the stage doc says «after the bookkeeper commits … off the turn's path». The player's text
  is never delayed; the turn's records close a few seconds later (one Haiku call, ≈2–4 s; a correction adds one
  bookkeeper request). Reported in the report's A6 section with the measured seconds.
