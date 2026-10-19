# Polish 3 — owner report (2026-10-19)

Branch `claude/polish-3-stage-009b43` (the session's own; pushed also as `claude/polish-3`) from `origin/claude/polish-2`
(096fb5a) with `origin/claude/dm-arch-bakeoff-zuxey2` merged first and, for part 7, `origin/claude/craft-approval`.
Spec: `docs/stages/POLISH_3.md` on `origin/claude/handoff` (part 7 added by the owner while the run was going). Nothing
went to `main`. Resume notes: `docs/runs/polish3-progress.md`. The stage ran on the owner's machine (the Codex
runtime's Node 24.19) in a worktree with a keys-only `.env.local`; no owner database was touched.

## In one paragraph

The writer + bookkeeper split is now a campaign setting («Ведущий» in the settings: today's loop, Fable + Opus, Opus
+ Sonnet, or any pair under «Подробнее»), with the writer's layers the loop's own, the bookkeeper's small and
cache-stable, the ledger checked and private, a quiet «Ведущий записывает…» state in which the player may already
type the next action, and a resume that restarts only the bookkeeper. Today's loop stays the default. On the 20-turn
Russian replay the Opus + Sonnet pair (D) brought the first word from 21.8 s to **15.3 s** median at the same cost
($4.17 for 20 turns against $3.99), with the text complete at 34 s and the records at 51 s; the records judge found
**0 wrong** facts and 15 of 126 missed, most of them on the turns where Sonnet ran at medium — so the bookkeeper stays
at high. The Fable + Opus pair (C) ran the first ten turns continuously: the numbers are in the table below. Every
rejected record call is now sent back once with its reason, both roles carry the schemas' exact field names, and the
bake-off's `move_party` rejection turned out to be a mangled ID, which the resolver now accepts. Every committed turn
keeps a private snapshot of the state before it, and `scripts/eval/real-replay/` replays the owner's own turns on an
isolated copy with any variant — session 1's turns included, from their claim-time sources. The shot director is off
by default and live frames draw on Sunburst. Part 7 keeps layer 1 short (the library left the cached layer: 8 851 →
4 162 tokens on the fixture campaign), gives each card a role, runs the time-word check as code and gives the replay
tool the craft sets for the owner's ablation. Checks: typecheck, lint (zero warnings), build, the loop fake bench
21/21, screenshots with zero overflow, the full suite (below). Paid: see «Money».

## What changed, part by part, and how it is proved

**1 · Merge.** `claude/dm-arch-bakeoff-zuxey2` merged into the polish-2 line (only `DEV_STATUS.md` conflicted: both
stages' sections kept). The full suite on a clean worktree pinned to the merge commit (c17ca39), Node 24.19,
`--test-concurrency=2`: **2587 tests, 2557 pass, 27 skipped, 3 fail** — the bake-off's own layer test (the bookkeeper's
layers were picked by index and polish 2's history blocks had shifted them; fixed in part 2), and two Windows
line-ending artefacts (`sandbox-start`, `polish-group6` regexes against files the checkout converts to CRLF;
environment-specific per `docs/CLOUD.md`, not rewritten).

**2 · The split as a campaign setting** (`docs/TURN_LOOP.md` §22; migration 68). The DM settings carry `split`
(null — today's loop; `{writer, bookkeeper}` — the pair) and the settings screen's «Ведущий» offers the three choices
with the bake-off's numbers and, under «Подробнее», the writer and the bookkeeper separately with the bookkeeper's
effort. The model assert of migration 52 became role-aware (turn: Opus or Astra; writer: Opus or Fable; bookkeeper:
Opus or Sonnet; the pin and the opening's ticket take any writer). The runtime: `runCampaignTurn` dispatches by the
campaign's choice and a resume by the turn's own pin (the pin carries the bookkeeper, so a retry keeps the pair). The
writer's layers are the loop's own with the writer role (`roles.ts`: the three roles in one place; the same voice slot,
doctrine, style, cards and append-only history); the bookkeeper's: its cached role, the living dossier, the tail and
«now». The ledger: asked once when missing, clipped at 6 000 characters, private (the brief, the checkpoint; the
server keeps it apart for the shot director, which starts at the writer's end and reads it for clothes, wounds and
items). The depth rule applies to the writer only; a Fable writer is pinned to high; the bookkeeper runs at its fixed
effort. The game screen: «Ведущий записывает…» after the text, the composer open, the send held until the commit. A
retryable transport failure of the writer's continuation is retried once; a failure during bookkeeping resumes the
bookkeeper only. The opening is written by the writer. The server flag is gone. Proof: `tests/polish3-split.test.mjs`
(11 tests), `tests/dm-arch-two-pass.test.mjs` updated, the live replay below.

**3 · Bookkeeping fixes** (§23). Every rejected record call goes back once with the server's reason on both runtimes
(a deciding call the state refused — money the hero lacks — is the story's business and is not sent back); the exact
field names of the schemas, generated from the tool definitions, sit in both roles' layer 1 with the bake-off's misses
named. `move_party`: the bake-off's rejected ID (`db431570-…-cea-…`) was the listed `…-9cea-…` with one character
dropped by the model, not a place of the parent/whereabouts kind; the resolver accepts a hex-and-dash string within
two edits of exactly one listed ID. Proof: the §3 tests in `tests/polish3-split.test.mjs` (both runtimes retry; the
mangled ID resolves and the party moves); on the live D run the retry fired on 7 of 20 turns and the judge saw the
fixed resends accepted.

**4 · Replayable turns** (§24; migration 68). A compressed private snapshot of the state before every committed loop
turn (`rpg_private.turn_snapshots`), with the player's line and the campaign's rules of the moment, pruned by the
setting `snapshotsKeep` (null: all). Session 1: its turns are replayable too — every committed loop turn has kept the
runtime source it was claimed with (`rpg_private.turns.source`, since the phase 2 runtime), and the snapshot API falls
back to it; the fidelity is exact (the same object the DM saw that turn) except the memory-retrieval rows, which a
replay runs without. `scripts/eval/real-replay/replay.mjs` reads the snapshots through the app's server (the sandbox
on :3100), restores each into an isolated in-memory copy (the live campaign is never read or written), plays the
owner's line with each variant (A, C, D, Dm, the campaign's own; the dice fixed per state), and writes blind samples in
the bake-off's shape with the real previous exchange as «before». The copy runs the tools' validators; the SQL
commit's own checks do not run (no database). Proof: `tests/polish3-replay.test.mjs` (the snapshot at commit, the
restore into a copy, the copy isolated, the samples' shape), the snapshot RPC test, and the paid smoke below.

**5 · Pictures** by the second blind page: the shot director off by default (existing campaigns switched off by
migration 68; the switch stays), live frames on Sunburst by default (Flare stays a choice). Proof: the picture tests
updated (`polish2-followups`, `polish2-pictures`).

**6 · Live replay.** Below.

**7 · Craft by role and by situation** (§25; migration 69; `origin/claude/craft-approval` merged first, its test
updates run green). Layer 1 is the role, the turn shape, the voice slot, the campaign language, the core doctrine and
the style; the selector's cards (at most two per turn) travel in the volatile tail by role. Each key has a role
(writer / bookkeeper / both — a per-key owner setting, since versions are immutable; set by content for the 22 active
keys; the DM Craft screen shows «Для кого» and lets the owner change it). The bookkeeper selects its own and the shared
cards on the narration and the ledger. The time-word check runs in code after each commit on both runtimes: a mismatch
is one line in the next turn's tail, nothing otherwise. The replay tool takes `--craft live|all|none|session1`. Proof:
`tests/polish3-craft.test.mjs` (4 tests).

## The live replay (part 6)

The 20-turn Russian replay of polish 2 (`19-polish-ru-replay`, continuous), from a worktree pinned to the parts 1–5
code (the measured prompts are the pre-part-7 ones; the layer-1 change of part 7 is measured below). The baseline is
polish 2's run on today's loop (`docs/runs/polish2-20261017-184438-…`), not repeated.

| Run | Turns | First word (median / p75 / max) | Text done | Records done | Held-send wait (median / max) | Cost | Writer / bookkeeper | Cache read | Requests | Checks | Judge: facts / missed / wrong / invented | Verdicts good/fair/poor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Polish 2 baseline — Opus 5.5, today's loop | 20 | 21.8 s / 30.8 s / 51.3 s | 46 s (= records) | 46 s | – | $3.99 | $3.99 / – | 74% | 32 | 37/40 | (not judged) | – |
| **D — Opus 5.5 writer + Sonnet 5.5 bookkeeper** (high on 1–10, medium on 11–20) | 20 | **15.3 s** / 22.1 s / 29.2 s | 34.1 s | 50.9 s | 14.3 s / 44.8 s | $4.17 | $2.75 / $1.42 | 59% / 53% | 56 | 34/40 | 126 / 15 / **0** / 4 | 13 / 7 / 0 |
| **C — Fable 5.1 writer + Opus 5.5 bookkeeper** (the first ten turns) | 10 | 20.0 s / 24.5 s / 41.1 s | 41.1 s | 73.9 s | 30.5 s / 44.0 s | $4.38 ($0.44 a turn) | $3.09 / $1.29 | 56% / 52% | 25 | 19/20 | 69 / 2 / **0** / 5 | 7 / 3 / 0 |

- **D per turn** (`docs/runs/polish3-20261019-034810-loop-opus+sonnet-live-ru-replay.jsonl`): first word 10–29 s; the
  ledger present on all 20 turns, none clipped; 15 rejected calls over 11 turns (`note_world` without `operation` four
  times, `attitude` on a non-companion twice, hit points before the hero had any twice, a faction ref to a person, an
  item not equipped, a missing `fromRef`) — the retry fired on 7 turns and the resends were accepted; 34/40 checks, the
  six misses all time words («ночью» on a morning clock on turns 15–20), which part 7 now catches in code. The judge
  (Sonnet 5.5 medium, $0.25): **Sonnet at high (turns 1–10): 68 facts, 4 missed, 0 wrong, 8 good / 2 fair; at medium
  (11–20): 58 facts, 11 missed, 0 wrong, 5 good / 5 fair** — the misses at medium are people recorded as notes
  instead of characters, items left unrecorded after a rejected call. Medium does not hold: the bookkeeper stays at
  high (the setting allows medium). **On C the Opus bookkeeper (high) missed 2 of 69 facts, 0 wrong, 5 invented
  (notes that go beyond the narration), 7 good / 3 fair** — the best records of the three, as in the bake-off.
- **C per turn** (`docs/runs/polish3-20261019-040609-loop-fable+opus-live-ru-replay.jsonl`): first word 5.8–41.1 s
  (the 41 s turn, s08, is the night watch — Fable thinks longest before a tense scene), text done 25–69 s, the records
  46–103 s; narrations of 185–380 words (D's: 120–300); one rejected call in ten turns (an item equipped to a slot the
  hero's sheet does not have); 19/20 checks (one time-word miss); the ledger on every turn, none clipped; the writer
  made 1.5 requests a turn (its rolls), the bookkeeper 1. C's first word is not slower than today's loop (20.0 s against
  21.8 s) but the chips come 23 s later than D's and the turn costs 1.6× D's; against the bake-off's same-state scenes
  (C 26.7 s, D 15.7 s) the continuous run keeps the order.
- **The held send**: a player who types at the text's end waits the bookkeeper's time — 14 s median on D (max 45 s on
  the longest bookkeeping turn), 30 s on C (Opus records more slowly than Sonnet).

### Where the first word goes (`scripts/eval/first-word.mjs`)

| Run | First word (median) | Queue before the first request | Time to the first token | First request: input / cached / written / uncached tokens | r with uncached tokens | r with cached tokens | r with the request's output tokens | xhigh turns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Polish (before the cache change) | 20.8 s | 246 ms | 20.5 s | 44 519 / 23 695 / 20 615 / 4 | – | 0.32 | 0.68 | 3 (22.4 s) |
| Polish 2 (the append-only history) | 21.8 s | 287 ms | 21.4 s | 42 054 / 30 721 / 2 735 / 8 259 | 0.38 | 0.26 | 0.42 | 5 (34.8 s vs 17.8 s at the base) |
| Polish 3 D (the writer's first request) | 15.3 s | 164 ms | 15.2 s | 31 132 / 17 672 / 3 203 / 10 094 | 0.12 | 0.01 | 0.87 | 0 |
| Polish 3 C (Fable's first request) | 20.0 s | 103 ms | 19.9 s | 21 734 / 12 723 / 2 085 / 7 258 | 0.68 | 0.63 | 0.87 | 0 |

The queue before the first request (the durable begin, the claim, the dossier, the memory retrieval) is 160–290 ms in
every run: the first word is the model's time to its first token. That time tracks the request's output (thinking and
tool JSON: r = 0.68 / 0.42 / 0.87) and not the cached prefix (0.32 / 0.26 / 0.01) or the uncached tail (– / 0.38 /
0.12). The rise from 16.4 s to 21.8 s in polish 2 came with five xhigh turns (34.8 s) against three (22.4 s) and from
the story, not from the longer cached history; the uncached tail costs little. Moving the stable part of the tail
above the breakpoint would save tokens, not seconds — the levers on the first word are the depth rule and the split
(D's writer has no tool JSON to think about before the text: 15.2 s to the first token at the same effort).

### Part 7's numbers

- Layer 1 on the fixture campaign (the same 22 entries active): **8 851 tokens with the whole library → 4 162** without
  it; the library's 4 689 tokens leave the 1-hour cached layer, and at most two cards (about 720 tokens) travel in the
  tail per turn. On the live D run layer 1 was 7 534 tokens (the pre-approval library); the cached share of the writer's
  input was 59%.
- The cache split after part 7: the cached prefix shrinks by the library and the tail grows by the selected cards
  (≈ 700 tokens at the plain rate, which the one-hour cache no longer has to hold).
- **First word after part 7** (`docs/runs/polish3-20261019-041923-loop-opus+sonnet-live-ru-replay-post7.jsonl`: the
  first five turns of the same replay on D, on the final code; $0.67): layer 1 **3 134 tokens** live (7 534 on the
  pre-part-7 D run — the library and the field sheet's share), the writer's cached prefix 16–31 KB growing with the
  history; first word **9.3 s median** (the same five turns on the pre-part-7 D run: 12.7 s median; polish 2's loop:
  12.5 s on its first five), text done 23 s, records 44 s, cost $0.13 a turn (D's first five: $0.18); the time-word
  check fired live on turn 5 (a «night» word on a morning clock — the line for turn 6's tail), the only check miss.
  Five turns are a small sample and the first turns of a campaign are the cheapest; the direction is a shorter cached
  layer and no slower first word.

## The replay tool's paid smoke (part 4)

`node scripts/eval/real-replay/synthetic.mjs` builds a throwaway copy of the 30-turn Russian scenario on PGlite (three
committed turns, snapshots saved at each commit), then `replay.mjs` played the owner's lines of turns 2 and 3 on
variants A (Opus 5.5 single loop) and D (Opus 5.5 writer + Sonnet 5.5 bookkeeper at high) from the snapshots, each
on its own isolated store, the source campaign untouched. Record `docs/runs/real-replay-20261019-041923.jsonl`;
four blind samples in `docs/samples/real-replay/synthetic-smoke/` (the file name carries no variant; the variant,
timings, tokens, cost and the accepted records are inside each file). Spent **$0.66** of the $2 budget
(estimate before the run: $1.16).

| Turn | Variant | Outcome | First word | Text done | Records done | Cost | Records |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | A | committed | 32.8 s | 70.3 s | 70.3 s | $0.27 | 14 accepted |
| 2 | D | committed | 12.8 s | 30.9 s | 63.9 s | $0.17 | 17 accepted |
| 3 | A | committed | 15.1 s | 46.9 s | 46.9 s | $0.10 | 10 accepted |
| 3 | D | committed | 9.4 s | 25.3 s | 48.3 s | $0.12 | 11 accepted, 3 rejected then re-sent |

Turn 3 on D exercised part 3 live: the bookkeeper sent three `note_world` calls without `operation`, the server
rejected them with the field name, the retry message went back once (`records_retry_asked` in the diagnostics) and
the three re-sent calls were accepted. Turn 2 on D also fired the part-7 time-word check (a «night» word on an 08:10
clock) — the diagnostic is in the sample. No leaks on any of the four turns.

## Money

| Run | Record | Spent |
| --- | --- | --- |
| Part 6: live replay D, 20 turns (budget $6.5) | `docs/runs/polish3-20261019-034810-loop-opus+sonnet-live-ru-replay.jsonl` | $4.17 |
| Part 6: the records judge on D (Sonnet 5.5 medium, 20 turns) | `docs/runs/polish3-20261019-040819-judge.jsonl` | $0.25 |
| Part 6: live replay C, 10 turns (budget $7) | `docs/runs/polish3-20261019-040609-loop-fable+opus-live-ru-replay.jsonl` | $4.38 |
| Part 6: the records judge on C (Sonnet 5.5 medium, 10 turns) | `docs/runs/polish3-20261019-041923-judge.jsonl` | $0.14 |
| Part 4: the replay tool's smoke, 2 turns × 2 variants on the synthetic campaign | `docs/runs/real-replay-20261019-041923.jsonl` (budget $2) | $0.66 |
| Part 7: a 5-turn D run on the final code (the first word after part 7; budget $1.5) | `docs/runs/polish3-20261019-041923-loop-opus+sonnet-live-ru-replay-post7.jsonl` | $0.67 |
| **Total** | `docs/runs/polish3-ledger.json` | **$10.26 of $20** |

No other paid call was made (the fake benches, the screenshots and the suites are free; no OpenAI, no fal).

## Final checks (the final code)

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass, zero warnings |
| `pnpm build` | pass (the screenshots worktree, 139d0b7; the final code differs from it only in docs, records and screenshots) |
| Full suite on the merge commit (part 1, clean worktree, Node 24.19, `--test-concurrency=2`) | 2587 tests · 2557 pass · 27 skipped · 3 fail (the bake-off's layer test, fixed in part 2; two CRLF artefacts) |
| Full suite on the final code (clean worktree, Node 24.19, `--test-concurrency=2`) | 2 604 tests · 2 573 pass · 27 skipped · 4 fail (747 s): two Windows CRLF artefacts (`sandbox-start`, `polish-group6`, as on the merge commit) and two test expectations fixed in the closing commit — `integration-saves` listed the migrations without 69, and `mega-dm-correction` expected the promises card for a line that no longer names a promise (the owner-approved Stage 4 cards of migration 90 tie it at one trigger hit; the test now asks with a line that names the promise). Both files pass alone on the final code; the fixes touch no application code |
| Fake bench, loop runtime (`--runtime dm-loop-v1 --scenario all`, 21 scenarios) | all pass, 351/351 checks (the known weakness W2 of scenario 08 stays open as the bench expects) |
| Fake bench, Astra runtime (`--runtime astra-primary-v1 --scenario all`) | 6 of the old scenarios fail (the miller, the baker, the loaves are not recorded) — identically on the polish 2 head (096fb5a) in a separate worktree, so it predates this stage; the Astra runtime is not touched by polish 3 |
| Screenshots (`stage5-screenshots.mjs`, `stage-v-screenshots.mjs` on an isolated `next start` on 3105 without `.env.local`; playwright-core 1.58 + Edge) | 50 + 16 shots, desktop and phone, zero horizontal overflow, zero clipping (`docs/screens/stage-5/index.json`, `docs/screens/stage-v/index.json`); the settings screen’s «Ведущий» and the «Ведущий записывает…» state (`game-recording-*.jpg`) among them |
| Live replay (part 6) | D 20 turns + C 10 turns, above |

## What to click

- **Settings → Ведущий**: the three choices with the bake-off's numbers; «Подробнее» — the writer, the bookkeeper and
  its depth. Today's loop stays chosen until you switch.
- **The game screen** on a split campaign: the text streams, then «Ведущий записывает…»; you can type the next action
  at once — «Отправить после записи» holds it and sends it when the records are in; the chips arrive with them.
- **DM Craft**: each card shows «Для кого» (писатель / бухгалтер / оба); the editor lets you change it.
- **Settings → Картинки**: the director is off; live frames draw on Sunburst (Flare still in the list).
- **The replay tool** (local, against the sandbox): `node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100
  --campaign <id> --turns 5,8,12 --variants A,C,D --budget-usd 6` — the blind samples land in
  `docs/samples/real-replay/<campaign>/`; `--craft session1|all|none` for the ablation.

## Needs the owner

1. **The writer**: C's prose against D's on your own turns — part 4's tool on eight of session 2's turns (and session
   1's, which replay too) makes the blind page; the numbers say D is the cheap fast pair and C the richer, slower,
   dearer one. Today's loop stays the default until you choose.
2. **The bookkeeper's effort**: Sonnet at medium missed 11 of 58 facts against 4 of 68 at high (the later turns are
   also busier — a confound); the default is high; medium is in «Подробнее» if you prefer the faster chips.
3. **The held send**: 14 s median on D. If that is too long, the alternative is a two-commit turn (the narration
   committed first, the records as a second commit), a larger change the spec set aside.
4. **The craft ablation** (part 7): run part 4's tool on your turns with `--craft session1`, `--craft all` and `--craft
   none` and judge blind whether the cards cost prose.
5. **The time-word line**: the check now writes one line into the next turn's tail when the narration's time words
   disagree with the clock. The six misses of D (all «ночью» at 07:00–08:00 after a night scene) are what it is for.
6. **Session 2**: play it in the sandbox on today's loop (the clean comparison with session 1); then the local session
   runs `docs/SESSION_REPORT_PROMPT.md` into `C:\dev\rpg-exports\session-2\` and the replay tool on eight of its
   turns.
7. **The existing campaigns' director switch** was turned off by migration 68 (your second blind page); turn it back
   on in «Картинки» if you want the brief.

## Known limits and environment notes

- The live runs played from a worktree pinned to the parts 1–5 code; part 7's layer-1 change is measured on the
  fixture campaign and on the 5-turn post-part-7 run only.
- The replay copy runs the tools' validators, not the SQL commit's checks; the SQL would refuse nothing the shadow
  state accepted in the runs so far, but a replay sample is not a database commit.
- The judge is a model (Sonnet 5.5 at medium); its «invented» count includes notes that go beyond the narration, as
  the bake-off's did.
- Two tests fail on Windows only because of CRLF line endings; the astra-runtime fake bench failures predate this
  stage.
