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
- Stage A, part 2 (this commit): the client's polling backs off (3 s → 20 s, paused in a hidden tab, one read in
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

## In progress

- Stage A measurements (paid, guarded, `FIX_S2_STAGE=A`): the cache before/after on a live turn pair; the probes in
  «Opus ведёт один» (same / lighter continuation) and «пишет — записывает» (Sonnet / Opus records) with the ledger
  checker; the continuation default by the result; the stage's clean-worktree suite and screenshots.

## Next

- Stage B (B1 hidden layer, B2 memory hygiene with fact validity and the memory presets measured, B3 rules, B4 voice and
  the Russian instructions via a Fable subagent), then D → C → E → F.

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

- The ledger checker runs before the commit (while the player already reads the text), so its correction lands in
  the same atomic commit; the stage doc says «after the bookkeeper commits … off the turn's path». The player's text
  is never delayed; the turn's records close a few seconds later (one Haiku call, ≈2–4 s; a correction adds one
  bookkeeper request). Reported in the report's A6 section with the measured seconds.
