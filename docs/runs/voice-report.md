# Voice stage — owner report (2026-10-19)

Branch `claude/voice` from `origin/claude/polish-3` (8d6d26a). Spec: `docs/stages/VOICE.md` «The build» on
`origin/claude/handoff`, plus the owner's addition of 2026-10-18 (the two bugs of polish 3's replay tool). Nothing went to
`main`. Resume notes: `docs/runs/voice-progress.md`. The stage ran on the owner's machine (the Codex runtime's Node
24.19) in a git worktree with a keys-only `.env.local`; no owner database was touched. **No passage of the owner's bank
and no other author's text entered the repository, a log, a fixture or a test**: every passage in the tests and in the
paid smoke is a synthetic placeholder written by the session and marked as such.

## In one paragraph

The Russian voice layer and its reminder are written and in the prompt (both printed below for your approval). Before
any person speaks, the DM decides in thinking what that person wants from the hero right now. «Образцы голоса» has a
passage format (`---` between passages, `## вид` at a passage's head) and an examples mode in the settings — off, five
(diverse by kind, the same five for a whole session so the cache holds) or all (the whole bank up to a token cap, in the
cached layer); the store takes a bank-sized text now. The speech profiles of the people in the scene travel next to the
reminder, and a person who spoke without a profile is asked for in the next turn. After every committed turn a cheap
model reads the NPC lines and flags quotable ones — slogans, symmetric epigrams, metaphors instead of a motive — and
one line goes into the next turn's tail; the flags are logged per turn. A metrics script prints the voice numbers per
variant (particles, incomplete speech, short paragraphs, metaphor markers, flags, repeated phrases per character,
«tennis», Latin, канцелярит, calques). The replay tool plays four voice variants on your own turns with the bank read
from a file outside the repository; your two replay bugs are fixed with tests. Checks: typecheck, lint (zero warnings),
build, the loop fake bench 21/21, the full suite (below), screenshots with zero overflow. Paid: the smoke (two turns ×
four voice variants on the synthetic campaign) — see «Money».

## The two texts (part 1) — please read and approve the wording

**The voice layer** (`VOICE_LAYER_RU`; 1 452 characters, 226 words; 554 tokens by the repo's estimator, 629 on Opus's
own count — the stage asked for about 400–600). It sits in the cached layer 1 right after the turn shape, for Russian
campaigns, for the single DM and for the writer alike:

> Голос. Люди говорят, чтобы добиться чего-то от того, кто перед ними, а не чтобы их процитировали. Прежде чем человек
> откроет рот, реши, чего он хочет от героя сейчас; реплика работает на это. У каждого своё хотение: отказать,
> выторговать, выведать, отвязаться.
>
> Говорить — не значит отвечать. Живой человек не отвечает на всё по порядку полными фразами: цепляется за одно,
> остальное мимо ушей, перебивает, спрашивает в ответ, молчит. Реплики короче, чем хочется; между ними — жест, пауза,
> дело в руках. Двое не пересказывают друг другу известное обоим и не называют чувств вслух — их видно по поступкам.
>
> Русская речь живёт частицами и порядком слов: же, ведь, -то, ну, вот, уж, небось, разве; главное слово — в конец или
> в начало; обрыв вместо точки. Слово простое, глагол вместо отглагольного имени.
>
> Цены, условия, риски — в рассказ, не в чужие рты: человек говорит, а не объясняет игру. Сравнения остаются у
> рассказчика, и редко. В гневе человек называет обиду своими словами — кто что сделал и кому ответить, — а не
> чеканит афоризм. Проверь каждую реплику: сказал бы это живой человек вслух, в лицо, в ту секунду? Словечко или жест
> персонажа — не чаще раза за сцену.
>
> Юмор чёрный и сухой: одна строка, что переворачивает чужие слова буквально и мрачно — смерть, долг, утопленники,
> глупость годятся, — и никто её не объясняет; не игра звуков. Когда герой говорит дикость, человек напротив сначала
> не понимает: «Э?», пауза — и только потом отвечает.

**The reminder** (`VOICE_REMINDER_RU`; 244 characters; 93 tokens by the estimator, 119 on Opus's count — the stage
asked for ≤ 120). It closes the last, uncached block next to your input, after the speech profiles of the people in
the scene:

> Перед репликой — чего человек хочет от героя сейчас; говорит он, чтобы это получить. Не отвечай на всё по порядку:
> одно зацепить, остальное мимо. Цены и условия — в рассказ, не в реплики. Сказал бы это живой человек вслух, в лицо,
> в ту секунду?

**The sentence of part 2** at the head of both turn shapes: «Перед каждой репликой персонажа реши в размышлении, чего
этот человек хочет от героя прямо сейчас, — реплика служит этому хотению (шаг мысли, не инструмент).» (and its
English twin for English campaigns).

## What changed, part by part, and how it is proved

**1 · The voice layer and the reminder** — above. Proof: `tests/voice-stage.test.mjs` §1 (the size, prose not a list,
no Latin letters, every point of the research present; the layer in the cached layer 1 after the turn shape and the
reminder at the end of the last block, for both roles; an English campaign gets neither).

**2 · Want before the line** — one sentence at the head of the turn shape of the single loop and of the writer, in
both languages, naming no tool. Proof: §2 test.

**3 · Examples that work** (`docs/TURN_LOOP.md` §26; migration 70). The passage format: `---` separates passages, a
passage may start with `## <kind>`; a text without `---` is one passage, so a multi-paragraph piece never splits into
several (polish 3's blank-line split did that, and only the first five paragraphs travelled). The examples mode is a
campaign setting (`voice_mode` off · five · all; `voice_token_cap`, default 30 000; the old switch maps to five/off;
the samples store takes 200 000 characters — the bank of about 40 passages is about 80 000). *Five* picks five
passages diverse by kind — round-robin over the kinds, each kind's list rotated by the session id — so the pick is the
same for a whole session (the cached layer holds) and differs between sessions. *All* quotes the whole bank in order up
to the cap, whole passages only, and reports what the cap dropped. The settings screen's disabled switch became
«Образцы в подсказке ведущего» (Выключено · Пять · Все, the cap for «Все»; the format text and the placeholder show
the `---` / `## вид` format). Proof: §3 tests — the format, the pick (diverse, stable, different per seed), the cap, the
SQL setting (saved, read, the legacy boolean, the bounds, the 200 000-character store, the turn's source carries the
mode and the cap), and in play (five quoted in the cached layer 1, the same five on the next turn, all eight in «all»,
the cap keeps whole passages, nothing of the samples in the logged observations or the public state).

*Measured on the fixture campaign (estimated tokens of layer 1, the 8-passage synthetic bank):* off **4 777**, five
**6 040**, all **6 772**. For the real bank the arithmetic is: five passages of 150–400 words ≈ 1 300–3 300 tokens on
top of the layer; the whole bank of about 40 passages ≈ 20 000–30 000 tokens (the default cap) — written once into the
one-hour cache per session (Opus 5.5: $8 per million tokens for the one-hour write, so about $0.20–0.25 once), then
read at $0.20 per million (about $0.005 a turn). The paid smoke below measured the cached share per variant.

**4 · Speech profiles in play.** The profiles of the people in the scene (register, sentence length, tics with their
frequency, never says, ты/вы) travel in the last block right before the reminder — the persona-drift remedy of the
research, next to your input; a named person who spoke in the last narration without a profile gets one line asking
for it (note_character speech for the loop; for the writer, the ledger's people line so the bookkeeper records it).
Proof: §4 test (asked after the first line, drafted → listed, nobody present → nothing).

**5 · The quotable-line check** (the time-word pattern). After a commit, off the turn's path (Next's `after`), Claude
Haiku 5.5 at low effort reads the narration's NPC lines (dash lines without their attribution, quoted speech) and
flags lines that are slogans, symmetric epigrams or metaphors standing in for a motive; the flags are stored per turn
(`rpg_private.voice_flags`) and logged (`dm_loop_quotable`); the next turn's tail carries one line — the line, why —
only while the flags belong to the last committed turn, nothing otherwise. A failure or a missing key is one log line,
never a turn failure. Proof: §5 tests (the lines, the parse, the tail line; the model call with a fake fetcher — no
lines → no request, the cost from the usage, a failure reported; the SQL log and the next turn's tail on the fixture
campaign; both runtimes hand the narration to the hook).

**6 · Metrics** — `node scripts/eval/voice-metrics.mjs <sample dirs | run records>` prints, per variant: particles per
100 speech words, the share of incomplete speech sentences, the share of ≤ 5-word paragraphs, simile markers per 100
words, quotable flags per checked turn, repeated three-word phrases per character, the «tennis» share (reply–reply
with at most a bare attribution between), Latin letters, канцелярит and the humanizer-ru calque markers per 1 000
words, the share of sentences with a spaced dash. Crude counts, not judgements; the owner judges blind. Proof: §6 test.

*Baseline on polish 3's live runs (no voice layer yet):*

| Variant | Turns | Words | Speech lines | Particles /100 speech words | Incomplete speech | ≤5-word paragraphs | Metaphor markers /100 words | Tennis | Dash sentences |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Opus 5.5 writer + Sonnet 5.5 (D, 25 turns) | 25 | 6 908 | 91 | 1.6 | 27% | 4% | 0.22 | 0% | 3% |
| Fable 5.1 writer + Opus 5.5 (C, 10 turns) | 10 | 2 687 | 52 | 2.7 | 50% | 10% | 0.26 | 0% | 21% |

**7 · The replay tool** takes `--voice live|off|layer|five|all` and `--examples-file <path outside the repo>` (read at
run time; the sample carries the variant's label and the passage count, never a passage), `--ledger voice|polish3`
(the stage's own ledger is the default) and runs the quotable check on every committed paid turn (`--no-quotable`).
**Your two bugs:** (1) the snapshot list listed no turn from before migration 68 — inside the SQL function the
variable `t` shadowed the table alias `t`; migration 70 aliases the table `tr`, and the list names every committed
loop turn from its claim-time source (polish 3's own test had encoded the bug: after pruning it expected the pruned
turn to vanish from the list; it now expects it listed as `stored: "turn"`); (2) `replay.mjs --base` expected the
SQL's `{encoding, source}` from the route, which answers with the decoded `payload`; the tool reads both shapes now,
and a `--snapshots` file may hold either (your workaround file works too). Proof: §7 tests and the two «owner's replay
fix» tests.

**8 · Proof.** The tests above (`tests/voice-stage.test.mjs`, 16 tests), the fake bench, the paid smoke and the metrics
on it (below), and `docs/REPLAY_2_PROMPT.md` for your local session.

## The paid smoke (part 8)

`node scripts/eval/real-replay/synthetic.mjs` built a throwaway copy of the 30-turn Russian scenario on PGlite (three
scripted turns, the state before each saved), then `replay.mjs` played the owner's lines of turns 2 and 3 on variant A
(Opus 5.5, today's loop, high) with each of the four voice variants — `off` (the prompt before this stage), `layer`,
`five` and `all` with a **synthetic** seven-passage examples file written by the session (one passage per kind; never
the owner's bank) — each run with a $1 budget, the quotable check on every committed turn. Records
`docs/runs/real-replay-20261019-052738.jsonl` (off), `…-052921` (layer), `…-053120` and `…-053556` (five), `…-053315`
(all); samples `docs/samples/real-replay/synthetic-voice-<variant>/` (the variant label and the passage count inside,
no passage). One turn (five, turn 3) was stopped by the tool's own money guard, not by the model: the writer's retry
request after a rejected record could not be reserved within the $1 budget; it was re-run alone with $1.5 and
committed. All 8 turns committed; no leak diagnostic on any.

| Voice variant | Turn | First word | Text done | Cost | Input tokens / cached | One-hour cache written on the first turn | Narration words | Quotable flags / lines read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| off | 2 | 12.9 s | 48.4 s | $0.267 | 21 567 / 0 | 19 263 | 214 | 0 / 7 |
| off | 3 | 19.1 s | 51.1 s | $0.119 | 22 111 / 19 263 (87%) | – | 190 | 0 / 4 |
| layer | 2 | 16.0 s | 60.0 s | $0.294 | 22 297 / 0 | 19 883 | 229 | 0 / 8 |
| layer | 3 | 19.3 s | 54.5 s | $0.123 | 22 841 / 19 883 (87%) | – | 232 | 0 / 7 |
| five (7 synthetic passages) | 2 | 14.8 s | 56.2 s | $0.290 | 23 326 / 0 | 20 912 | 236 | 0 / 11 |
| five | 3 (re-run) | 20.7 s | 50.6 s | $0.114 | 23 870 / 21 625 (91%) | – | 200 | 0 / 6 |
| all (7 synthetic passages) | 2 | 20.3 s | 52.6 s | $0.287 | 23 726 / 0 | 21 312 | 186 | **1** / 7 |
| all | 3 | 25.1 s | 60.2 s | $0.137 | 24 270 / 21 312 (88%) | – | 228 | 0 / 8 |

**The cached layer's size and the cost per turn in each mode** (the stage's measure, part 3): the one-hour cache
written on a session's first turn grows from 19 263 tokens (off) to 19 883 (layer: +620, the voice layer itself) to
20 912 (five: +1 029 — five short synthetic passages) to 21 312 (all: +1 429 — all seven). At Opus 5.5's one-hour write
rate ($8 per million) the layer costs about $0.005 once a session and the examples under $0.01; at the read rate
($0.20 per million) the whole cached layer costs under $0.005 a turn in every mode. The turn's cost is its output
(5–6k tokens of thinking and text at $20 per million: $0.10–0.12) — the voice variants cost the same within noise
($0.11–0.14 on the cached turn 3). With the real bank, *five* adds about 1 300–3 300 tokens and *all* about 20 000–30 000
(the default cap): about $0.25 once a session for *all*, then about $0.006 a turn. The first word did not move with
the mode within these two turns (12.9–25.1 s, the same spread as polish 3's A runs).

**The quotable check** read 58 lines over the eight turns at $0.0001–0.0003 a turn and flagged one: Мокей's «На тихой
воде легла» in the *all* run (its reason: «поэтичный образ без мотива; звучит как строка для цитаты») — a fisherman's
plain line about a barge sinking in calm water, arguably a false flag; a cheap judge's miss of this kind is the known
limit, and the line it puts in the next turn's tail asks for plain speech, which costs nothing.

**The metrics on the smoke** (`node scripts/eval/voice-metrics.mjs docs/samples/real-replay/synthetic-voice-*`; two turns
a variant, so direction only, not a verdict):

| Variant | Words | Speech lines | Particles /100 speech words | Incomplete speech | ≤5-word paragraphs | Metaphor markers /100 words | Quotable flags | Tennis | Dash sentences |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| off | 404 | 11 | 0.5 | 29% | 5% | 0.25 | 0 | 0% | 9% |
| layer | 461 | 15 | **6.8** | 39% | 0% | 0.22 | 0 | 0% | 4% |
| five | 436 | 17 | 0.6 | 38% | 17% | 0.46 | 0 | 8% | 10% |
| all | 414 | 15 | 2.4 | 28% | 12% | 0.00 | 1 | 10% | 7% |

The layer alone raised the particle rate of the NPC lines from 0.5 to 6.8 per 100 speech words and the incomplete
sentences from 29% to 39%, with no short-paragraph staccato; with the synthetic examples the people spoke more
(15–17 lines) and the five/all runs picked up more one-line paragraphs — the synthetic passages are dialogue-heavy
one-liners, so that is the examples teaching their rhythm, which is exactly the lever the owner's own bank will pull
in his direction. Polish 3's baseline (no layer) on the live runs: particles 1.6 (D, 25 turns) and 2.7 (C, 10 turns).

## Money

| Run | Record | Spent |
| --- | --- | --- |
| Part 8: the smoke, 2 turns × A, voice off (budget $1) | `docs/runs/real-replay-20261019-052738.jsonl` | $0.39 |
| Part 8: the smoke, voice layer (budget $1) | `docs/runs/real-replay-20261019-052921.jsonl` | $0.42 |
| Part 8: the smoke, voice five (budget $1; turn 3 stopped by the money guard on the retry request) | `docs/runs/real-replay-20261019-053120.jsonl` | $0.41 |
| Part 8: the smoke, voice all (budget $1) | `docs/runs/real-replay-20261019-053315.jsonl` | $0.42 |
| Part 8: the smoke, voice five, turn 3 re-run alone (budget $1.5) | `docs/runs/real-replay-20261019-053556.jsonl` | $0.11 |
| **Total** | `docs/runs/voice-ledger.json` | **$1.75 of $8** — all five entries settled |

The quotable checks inside the runs (Haiku) are counted in the runs' spend ($0.0015 in all).

No other paid call was made (the fake bench, the screenshots and the suites are free; no OpenAI, no fal). The free
token-count endpoint was used twice to measure the two texts.

## Final checks (the final code)

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass, zero warnings |
| `pnpm build` | pass |
| The stage's tests (`tests/voice-stage.test.mjs`) | 16 pass; the touched files (`polish-group7`, `polish3-split`, `polish3-replay`, `polish3-craft`, `integration-saves`) pass |
| Fake bench, loop runtime (`--runtime dm-loop-v1 --scenario all`, 21 scenarios) | all pass, 351/351 checks (the known weakness W2 of scenario 08 stays open as the bench expects, as in polish 3) |
| Screenshots (`stage5-screenshots.mjs` on an isolated `next start` on 3105; playwright-core 1.58 + Edge) | 50 shots, desktop and phone, zero horizontal overflow, zero clipping (`docs/screens/stage-5/index.json`); the settings screen with «Образцы в подсказке ведущего» among them (`settings-*.jpg`) |
| Full suite on the part-8 commit 487c8b4 (a detached worktree pinned to it, Node 24.19, `--test-concurrency=2`, 908 s) | **2 620 tests · 2 588 pass · 27 skipped · 5 fail**: the two Windows CRLF artefacts (`sandbox-start`, `polish-group6`, as in polish 3 — environment-specific per `docs/CLOUD.md`, not rewritten) and three test expectations shifted by this stage, fixed in the closing commit with no application change — `dm-loop-play` compared the whole settings object (the mode and the cap are new fields) and `astra-first-startup-gate` keeps an allow-list of the gameplay service's modules (the quotable-check module added, stubbed). The two files pass alone on the final code (19/19); lint stays at zero warnings |

## What to click

- **Settings → Образцы голоса**: the format text names `---` and `## вид`; paste the bank (or let the local session
  load it, `docs/REPLAY_2_PROMPT.md` step 3); «Образцы в подсказке ведущего» — Выключено · Пять · Все; with «Все» the
  token cap appears below.
- **A Russian campaign's next turn** carries the voice layer and the reminder already (no switch); the examples only
  with the mode on.
- **The replay tool** (local, against the sandbox): the four runs of `docs/REPLAY_2_PROMPT.md` step 7, then step 8's
  metrics.

## Needs the owner

1. **The wording** of the voice layer and the reminder (above): approve, or say what to change — they are two string
   constants, a minute to edit.
2. **The bank**: save it from the project file to a plain text file outside the repo and run the local session with
   `docs/REPLAY_2_PROMPT.md` (it converts the format, loads the sandbox's «Образцы голоса», replays session 1's eight
   turns × four voice variants with the writer you chose, prints the metrics, zips outside the repo). It needs the
   voice ledger's cap raised from $8 to $18 (the prompt says where).
3. **The writer** for the replays (A, C or D from the writer page) — the prompt asks for it once.
4. **The examples mode for live play** stays «Выключено» until you choose; «Пять» costs little; «Все» writes the bank
   into the cache once a session.
5. **The quotable-line check** runs on every committed turn now (Haiku, well under a cent a turn); if a flag feels
   wrong in play, say so — the rule it quotes is one line in the tail and it can be made quieter.
6. **The blind page** is the planner's (prose and dialogue judged separately), after the local session's zip.

## Known limits and environment notes

- The smoke ran on the synthetic campaign (three scripted turns, two replayed) with a synthetic seven-passage bank:
  it proves the mechanics and measures the cache, not the prose; the prose is judged on your own turns.
- The metrics are counts: the particle list and the simile markers are crude; «tennis» counts bare attributions as no
  beat; the quotable judge is a cheap model (its misses are expected; the owner judges humour and voice blind).
- The quotable check needs the ANTHROPIC key on the server (the sandbox has it); without it the check logs one line
  and the turn is unaffected.
- The owner's bank never reached this machine: the format conversion and the load are the local session's steps.
- Two tests fail on Windows only because of CRLF line endings (`sandbox-start`, `polish-group6`, as in polish 3).
