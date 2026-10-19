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
| 3 — the passage format and the examples mode | done | `parseVoicePassages` (`---`, `## kind`), `pickFivePassages` (round-robin over kinds, rotated by the session id), the `all` mode up to the cap (whole passages, the dropped counted in the layer report); migration 70 (`voice_mode`, `voice_token_cap`, the samples store 200 000 chars, the old boolean mirrors the mode); the settings screen's «Образцы в подсказке ведущего» (off · five · all, the cap for «all»); measured on the fixture campaign: layer 1 off 4 777 · five 6 040 · all 6 772 estimated tokens with the 8-passage synthetic bank (the real bank: see the report) |
| 4 — speech profiles in play | done | `speechProfilesBlock` in the last block right before the reminder: the profiles of the people present (register, sentences, tics, never says, ты/вы), and one line asking for the profile of a named person who spoke in the last narration without one (wording per role: note_character for the loop, the ledger's people line for the writer) |
| 5 — the quotable-line check | done | `quotable.ts` (the NPC lines, the Haiku request, the parse, the tail line), `server/voice/quotable-check.ts` (scheduled with Next's `after` from `afterCommit`, never on the turn's path), migration 70's `rpg_private.voice_flags` with `rpg_dossier voice_flags_save / voice_flags_read`, `runtime_source.voiceFlags`; the line travels in the tail only while the flags belong to the last committed turn; both runtimes hand the narration to `afterCommit` |
| 6 — the metrics | done | `scripts/eval/lib/voice-metrics.mjs` + `scripts/eval/voice-metrics.mjs` (per variant over sample dirs and run records): particles per 100 speech words, incomplete speech, ≤ 5-word paragraphs, metaphor markers, quotable flags, repeated phrases per character, tennis, Latin, канцелярит, calques (humanizer-ru), dash sentences |
| 7 — the replay tool's voice variants; the owner's two replay bugs | done | `--voice live\|off\|layer\|five\|all`, `--examples-file` (outside the repo, read at run time, only the passage count recorded), `--ledger voice\|polish3` (the stage's `docs/runs/voice-ledger.json`, cap $8, the default), the quotable check after every committed paid turn (`--no-quotable`); the sample carries `variant.voice` and `turns[].quotable`. Bug 1 (the list empty for pre-68 turns): migration 70 aliases the turns table `tr` in `rpg_turn_snapshots`; bug 2 (`--base` shape): `lib/snapshots.mjs` reads the route's decoded `payload` and the SQL's shape; the judge names its ledger explicitly |
| 8 — proof: tests, the fake bench, the paid smoke, `docs/REPLAY_2_PROMPT.md` | done | `tests/voice-stage.test.mjs` 16/16; the fake bench 21/21 (351/351 checks); the smoke 2 turns × A × off/layer/five/all on the synthetic campaign with a synthetic seven-passage file — 8/8 committed (five/t3 re-run after the money guard stopped the retry request), $1.75; the metrics on it in the report; `docs/REPLAY_2_PROMPT.md` written |
| final — checks, screenshots, docs, report | done | typecheck, lint (zero warnings), build pass; screenshots 50, zero overflow; `docs/TURN_LOOP.md` §26, `scripts/eval/real-replay/README.md`, `scripts/eval/README.md`, `DEV_STATUS.md`, `docs/runs/voice-report.md`; the full suite on a detached worktree pinned to the final commit: see the report's checks table |

## Paid calls log

| When (UTC) | What | Record | Spent |
| --- | --- | --- | --- |
| 2026-10-19 05:27–05:29 | part 8: the smoke, 2 turns × A, voice off (budget $1) | `docs/runs/real-replay-20261019-052738.jsonl` | $0.39 |
| 05:29–05:31 | voice layer (budget $1) | `docs/runs/real-replay-20261019-052921.jsonl` | $0.42 |
| 05:31–05:33 | voice five (budget $1; turn 3 stopped by the guard on the retry) | `docs/runs/real-replay-20261019-053120.jsonl` | $0.41 |
| 05:33–05:35 | voice all (budget $1) | `docs/runs/real-replay-20261019-053315.jsonl` | $0.42 |
| 05:35–05:37 | voice five, turn 3 alone (budget $1.5) | `docs/runs/real-replay-20261019-053556.jsonl` | $0.11 |
| | **Total** | `docs/runs/voice-ledger.json` | **$1.75 of $8** — all five entries settled |
