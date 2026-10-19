# Voice stage — progress (resume from here)

Branch `claude/voice` from `origin/claude/polish-3` (8d6d26a). Spec: `docs/stages/VOICE.md` «The build» on
`origin/claude/handoff` (launched 2026-10-18), plus the owner's addition of 2026-10-18: two bugs of polish 3's replay
tool (the snapshot list empty for pre-migration-68 turns — the variable `t` shadows the table alias; `replay.mjs
--base` expecting the RPC's shape instead of the route's) fixed with tests in part 7. Run locally on the owner's
machine (the Codex runtime's Node 24.19, pnpm 11.25) in a git worktree with a keys-only `.env.local`; no owner database.
Paid cap for the stage: **$8**, enforced by the replay tool's guard and `docs/runs/voice-ledger.json`. No passage of
the owner's bank and no other author's text enters the repository, a log, a fixture or a test: the tests and the
smoke use synthetic placeholder passages written by the session and marked as such.

A restarted session: read this file, `git log` of the branch, continue at the first part not marked done. Never
repeat a paid step marked done.

| Part | State | Notes |
| --- | --- | --- |
| 1 — the voice layer and the reminder | done | `VOICE_LAYER_RU` (1 452 chars, 554 tokens by the repo's estimator, 629 on Opus's own count) and `VOICE_REMINDER_RU` (93 / 119) in `src/lib/gameplay/dm-loop/voice.ts`; the texts are printed in the report |
| 2 — want before the line | done | `WANT_BEFORE_THE_LINE_RU/EN` as the first line of both turn shapes (`roles.ts`) |
| 3 — the passage format and the examples mode | pending | |
| 4 — speech profiles in play | pending | |
| 5 — the quotable-line check | pending | |
| 6 — the metrics | pending | |
| 7 — the replay tool's voice variants; the owner's two replay bugs | pending | |
| 8 — proof: tests, the fake bench, the paid smoke, `docs/REPLAY_2_PROMPT.md` | pending | |
| final — checks, screenshots, docs, report | pending | |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| | **Total** | `docs/runs/voice-ledger.json` | **$0 of $8** |
