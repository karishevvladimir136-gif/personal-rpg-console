# Merge after session 2 — three branches into one candidate

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Result branch **`claude/s3-candidate`**. Nothing to `main`.
Report in English in `docs/runs/merge-s2-report.md`; talk to the owner in English, briefly. No paid calls except the
probes named below (cap **$15**, ledger `docs/runs/merge-s2-ledger.md`).

## The branches (all from `origin/claude/session-2-prep` at `d74b6c6`)
1. `claude/session2-fixes-a-f-jh3krk` — the fix run, stages A–F (the base of the merge; the largest).
2. `claude/live2d-1-9lq5bf` — 2D Live and the combat screen with the battle map.
3. `claude/stage-music` — the soundtrack, the ambient layer (check that the ambient follow-up and the migration
   renumbering landed; if not, merge what is there and say so).

Both 1 and 2 already contain `origin/claude/stage-fix-turn-lease` (migration 202610200071) — the same commits, no
conflict expected there.

## Order
Start from branch 1. Merge 2, resolve, run the focused tests of both (dm-loop, combat, live2d, inventory). Merge 3,
resolve, run its tests. Then the full suite on a clean worktree pinned to the merge commit; typecheck; zero-warning
lint; production build; the screenshot sets of all three (fix-s2, live2d-1, music) regenerated from the merge.

## Where conflicts are expected — and the rule for each
- `src/lib/gameplay/dm-loop/contracts.ts`, `tools.ts`, `execute.ts`: the fix run changed `roll`, `rest`, the rules and
  the cache layout; the 2D branch changed the `combat` tool and added the battlefield context block. Keep both; the
  `combat` tool is the 2D branch's version.
- `tests/stage4-dossier.test.mjs`: both raised the tool-schema size bound (fix run: 32000 output cap test; 2D: 12000
  tokens for the schema set). Keep the larger bound with both comments; re-measure the schema set after the merge and
  put the number in the report.
- Migrations: every file keeps its number; check there are no duplicate prefixes across the three branches
  (fix run 72–96, 2D 2026102102xx, music 2026102103xx after its renumbering). If the music branch still has a 71,
  renumber it in the merge and say so.
- `DEV_STATUS.md`, `docs/TURN_LOOP.md`, the shell and the settings screen, the campaign page router: union of all
  three; the status file gets one new top section naming the candidate.
- `src/components/gameplay-combat.tsx`, `combat-exchange.ts`: the 2D branch owns them (the fix run was told not to
  touch them — verify it did not; if it did, the 2D version wins and the fix run's intent is re-applied by hand).

## After the merge — three checks that need the merged code
1. **Session 3 mode end to end**: the probe fights and the long rest in «Opus пишет — Opus записывает» with the ledger
   checker, on the merged code — records complete, the battlefield block present in the writer's context, the combat
   tool's rules applied (≤ $8).
2. **The 2D session's open finding**: «the DM narrated around the hero's declared attacks for three turns without
   rolling them» — confirm the fix run's rule «every seen roll told» / «the hero's declared action is never replaced»
   catches it on that probe; if not, say exactly where the check misses.
3. **The audit input**: list every item of `docs/runs/session2-owner-notes.md` (1–85, the key findings) with the
   commit(s) that address it on the candidate, as the starting table for the Ultracode audit.

## Done when
The suite is green on the candidate (the three `d2a-composition` cancellations are known pre-existing); the report has
the conflict list with each resolution, the schema-set size, the probe results, the money; `docs/SANDBOX_LOAD_FIX_S2.md`
updated to load the candidate (its three migration ranges, the music assets, the 2D tables); and the three Russian
acceptance checklists linked from one `docs/runs/s3-acceptance.md` index.
