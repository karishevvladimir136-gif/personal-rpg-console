# Speed of the turn (Stage 2b)

Where the ~35 s of a Stage 2 turn went, what Stage 2b changed, and what the live bench
measured afterwards. Numbers come from the saved bench records (`scripts/eval/out/*.jsonl`,
git-ignored; per-request tables with `node scripts/eval/report.mjs <run> --calls`).

## 1. Before: where the 35 seconds went (Stage 2 records, no new spend)

Both Stage 2 runs (Opus 5.5 high, 33 turns, 137 requests; Astra medium, 26 turns, 109
requests) were re-read per model request. The whole turn is model time: the server's own
work (shadow state, receipts, checkpoints, commit) is under 0.1 s per turn, so the median
"model latency share of the turn" is 100%.

### Requests per turn and why each one existed

| Why the request existed | Opus (137) | Astra (109) |
| --- | --- | --- |
| First request of the turn | 33 | 25 |
| After calls that changed state (a dependent call followed) | 37 | 53 |
| After bookkeeping-only calls (notes, places, characters) | 29 | 31 |
| `finish_turn` called before any text, so the loop asked for the narration | 23 | 0 |
| After a rejected call (a retry) | 11 | 1 |
| After `query_state` | 4 | 1 |

Median 4 requests per turn on both models, but for different reasons:

- **Opus** did all its tool work first, in several rounds, and wrote the narration last: text
  arrived in request 1 in only 5 of 33 turns, and in 28 of 33 turns it came only in the last
  request. In 23 turns it called `finish_turn` before writing anything, which cost one more
  request (the loop asked for the text). Requests at position 2–5 were mostly 1-call rounds
  (median 1.0 tool call) of 6.7–8.5 s each: the extra rounds, not the work, were the cost.
- **Astra** made exactly one tool call per request (never two together, although parallel
  calls were enabled) and also wrote the text last (23 of 26 turns): 4–10 requests of
  7–10 s each, with ~85 output tokens and zero reasoning tokens — the latency was per
  request, not per token.

### Per request (medians)

| | Opus 5.5 high | Astra medium |
| --- | --- | --- |
| Request latency | 10.2 s (first), 6.7–8.5 s (later) | 6.6 s (first), 7.9–9.9 s (later) |
| Time to first text, when a request had text | 6.3–7.8 s | 4.6–13.9 s |
| Output tokens per request (thinking included on Opus) | 628–838 | 59–126 |
| Input tokens per request / read from cache | 17.3k / 10.5k (first), 18–20k / 17–20k (later) | 7.4k / **0** (first), 7.6k / 7.4k (later) |
| Cost per request | $0.050 (first), $0.020 (later) | $0.098 (first), $0.013–0.015 (later) |

So an Opus turn was 4 × ~8 s and an Astra turn 4 × ~8 s, both ending with the text.

### Cache

- Opus: the first request of a turn read layers 1–2 (10.5k of 17.3k tokens) and wrote the
  changed living layer; later requests read 94–97%. Median 89% per turn.
- Astra: **the first request of every turn read 0 tokens and wrote the whole prefix**
  (6.5–9.4k tokens at 1.25×, ~$0.08–0.12 each — most of Astra's turn cost). OpenAI places
  its implicit cache breakpoint at the end of the latest message, i.e. after the player's
  input, so nothing of a previous turn's request matched. Later requests of the same turn
  matched 97%. Median 75% per turn.

### Rejections (an extra request each)

Opus: 11 rejected calls in 8 of 33 turns — 9 × `note_character` over the Stage 1 Character
Model limits (3-entry lists, 120–160-character texts), 1 × a wrong argument shape
(`stress` at the top level), 1 × a character referred to by a name the model had already
changed. Astra: 1 × an honest "not enough copper".

### Scripted checks that a correct live turn failed

The live DM named people ("Aldous Fenn", "Hesper Vane"), recorded them at first sight
rather than in the "accept" turn, docked a coin for a split sack, let a wolf hunt fail. Of
the 23 Opus check failures, 19 were of this kind (names, timing of records, exact amounts);
the remaining 4 were real misses (no bounty quest, no quest completion on delivery).

## 2. What Stage 2b changed

1. **Narration first, tools inside the story** (`context.ts`): the instructions and three
   examples in the campaign language teach the live-DM order — text at once; a call that
   *decides* an outcome (roll, payment, transfer, reward) before the sentence that describes
   it; all *bookkeeping* (new characters and places, items, quests, time, notes) in one final
   message that ends with `finish_turn`; independent calls together, never one per round;
   `query_state` only for what the context lacks. The loop joins text written around a tool
   call into one narration (a dash continues the sentence, a full stop starts a paragraph)
   and streams the same to the player.
2. **Fewer reasons for a round**: Character Model bounds relaxed to anti-garbage limits
   (12 entries per list, 400–600 characters per text, 6000 bytes per model; plan §9 pulled
   forward); a rejection names the field and the bound, an unknown reference names the
   closest existing records with their IDs, so one retry is enough.
3. **Astra cache**: the three stable layers are developer messages with explicit cache
   breakpoints (`prompt_cache_breakpoint`), plus the campaign ID as `prompt_cache_key`; the
   implicit breakpoint keeps continuations within a turn cached.
4. **Effort per round**: a pinned continuation effort (bench flag `--continuation-effort`)
   runs the requests after the first at a lower level. On Opus this is a top-level change
   (the per-message form only takes effect after a user turn with new input, never after tool
   results) and restarts the message cache; on Astra it is a GPT-6 `configuration_update`
   item that keeps the prefix.
5. **Bench**: outcome-based live checks (timing-of-record checks run only against the
   scripted model), the fluency scenario 12, per-request tool lists and full narration in the
   records, `scripts/eval/samples.mjs` for the owner's samples, and a budget guard that
   reserves half a token per byte and settles every reservation (Stage 2's guard refused
   Astra requests at $5.4 of $6 while $3.8 was spent).

## 3. After: the live bench (2026-10-15, commits `b8c48c5`–`0b13744`)

`node scripts/eval/run.mjs --scenario 01…08,12-fluency --runtime dm-loop-v1 --provider live --model <opus|astra>
--budget-usd 3.6`. Each scenario is a fresh campaign on PGlite; probe steps are skipped live; checks are
the outcome-based ones (scripted-only timing checks are skipped). Samples for the owner:
`docs/samples/stage-2b/opus-high.md`, `docs/samples/stage-2b/astra-medium.md`.

### Claude Opus 5.5, effort high — 40 turns, 58 requests, $3.2933

| Measure | Stage 2 | Stage 2b |
| --- | --- | --- |
| Turns committed / failed | 33 / 0 | 37 / 3 — 2 × a server bug (a clock note set to text failed the SQL commit; fixed in `0b13744`, the call is now rejected), 1 × the budget guard refusing the last request at $3.29 of $3.60 (not a model or runtime failure) |
| Time to first word, median (p25–p75) | 31.8 s | **8.2 s** (6.2–11.9 s); 9 of 37 turns ≤ 6 s, 25 ≤ 10 s |
| Full turn, median (p25–p75) | 35.3 s | **25.9 s** (23.1–29.6 s); 15 of 37 turns ≤ 25 s, 29 ≤ 30 s |
| Model requests per turn, median (mean) | 4 (4.2) | **1** (1.43): 25 turns in one request, 10 in two, 2 in three or more |
| Tool calls per turn, median | 5 | 6 |
| Turns with a rejected call | 24% | **5%** (3 calls: 2 × `claim_reward` before `complete`, 1 × moving to the current place) |
| Cost per turn, median | $0.104 | **$0.075** |
| Cache read share, median | 89% | 77% (one request per turn means every request is a "first" one that writes the living layer) |
| Output tokens per turn, median | ~2600 over 4 requests | 2311 in one request; narration median 234 words |
| Outcome checks | 58/81 scripted | 75/89 outcome-based |
| Literal secret leaks | 0 | 1 of 10 provocation turns: in p10 Edric himself asks "Have you got forty silver in that coat?" — the private debt figure, spoken in character after nine turns of pressure. The literal detector did not flag it (the private value is the whole sentence "owes the smuggler captain forty silver"). |

The turn now has the shape the stage asked for: text first in 37 of 37 turns (the player reads the
opening while the dice and the bookkeeping follow in the same reply), a deciding call before its
outcome (every second request of a two-request turn followed a `roll`, a `money` or a `quest` call),
and all bookkeeping in one final message with `finish_turn` (no `finish_turn`-before-text round, no
bookkeeping-only round).

**Where the 26 s go now.** In a one-request turn Opus high thinks for ~7.8 s before the first word,
then writes for ~14.6 s: ~230 words of narration plus six tool calls with their arguments
(~2200 output tokens, thinking included). Both halves are model time; the loop adds under 0.1 s.
So the floor at this effort is set by (a) up-front thinking and (b) output volume. Lower effort
shortens (a); shorter notes shorten (b). See §4 for the effort experiment.

**What the checks still catch (real misses, not naming):** no quest record for the wolf bounty and no
payment on its claim (07), the two loaves of 05 never created as items, the "no bread without money"
rule bent once (a bread heel given on credit, 04), and the `claim_reward`-before-`complete` order
(2 rejections, both fixed by the model in its next message).

### GPT‑6 Astra, effort medium — 30 turns, 87 requests, $2.9454

The run stopped at the budget guard during scenario 08 (7 of its 10 provocation turns ran; the
fluency set did not run for Astra): the guard reserves the full 6000-token output allowance at $50/M
before every request (~$0.55 at Astra prices), so it refuses at ~$3.0 of a $3.6 limit. Not a model
or runtime failure.

| Measure | Stage 2 | Stage 2b |
| --- | --- | --- |
| Turns committed / failed | 24 / 0 (+2 guard refusals) | 29 / 0 (+1 guard refusal) |
| Time to first word, median (p25–p75) | 23.6 s | **2.0 s** (1.7–3.1 s); 27 of 29 turns ≤ 6 s |
| Full turn, median (p25–p75) | 35.1 s | **14.3 s** (11.4–18.0 s); 26 of 29 turns ≤ 25 s |
| Model requests per turn, median (mean) | 4 (4.2) | **2** (2.93): 7 turns in one request, 8 in two, 6 in three, 8 in four or more |
| Tool calls per turn, median | 4 | 4 |
| Turns with a rejected call | 4% | 3% (one honest "not enough copper") |
| Cost per turn, median | $0.147 | **$0.093** |
| Cache read share, median | 75% | **84%** — the first request of a turn now reads 6.4k of 8.3k tokens (Stage 2: 0) |
| Output tokens per turn, median | ~340 | 463; narration median 119 words |
| Outcome checks | 45/67 scripted | 61/68 outcome-based |
| Literal secret leaks | 0 (1 provocation turn ran) | 0 in 7 provocation turns |

Astra writes the opening at once (text in request 1 in 30 of 30 turns, 2 s in) and its narration is
short, so the player is reading within two seconds; the rest of the turn is the model's habit of one
tool call per request: the first request ends after one call, and `finish_turn` comes in a round of its
own in 23 of 29 turns (a 2.5–3 s request each). The instructions ask for all bookkeeping in one message;
Astra at medium follows that only partly (it did batch 5 calls in one message in several turns). The
remaining misses are the same kind as Opus's: the job completed but never paid (03), the delivered
quest left open (06), no payment and no weapon on the bounty claim (07).

### GPT‑6 Astra, effort xhigh — scenarios 01, 03 and 08 only (owner's request), 13 turns, 35 requests, $1.8608

Run with what was left of the budget (guard $2.60). Scenarios 01 and 03 ran completely; 08 ran 6 of its
10 provocation turns before the guard refused the next request (12 turns committed, the 13th is the
refusal). A run at *high* effort had been started first and was stopped after three turns ($0.40) when
the owner asked for xhigh instead; its three turns (01 twice, 03 once) are not in any table.

| Measure | Astra medium (same three scenarios) | Astra xhigh |
| --- | --- | --- |
| Turns committed | 13 of 13 (01: 2, 03: 4, 08: 7) | 12 of 12 (01: 2, 03: 4, 08: 6) |
| Time to first word, median (p25–p75) | 1.9 s | **1.8 s** (1.5–1.8 s); 12 of 12 ≤ 6 s |
| Full turn, median (p25–p75) | 13.8 s | 19.8 s (11.4–32.1 s); 8 of 12 ≤ 25 s; the longest 104 s (a 5-request opening turn) |
| Model requests per turn, median (mean) | 2 (2.7) | 2 (2.75) |
| Output tokens per turn, median | 466 | 847, of which reasoning 219 (medium reasoned 0) |
| Cost per turn, median | $0.096 | $0.105 |
| Cache read share, median | 84% | 78% |
| Outcome checks | 27/28 (01 4/4, 03 9/10, 08 13/14) | **27/28** (01 4/4, 03 **10/10**, 08 13/14) — the one miss in each is the guard refusal |
| Rejected calls | 0 | 1 (a move to the current place) |
| Literal secret leaks | 0 in 7 turns | 0 in 6 turns |

So on Astra the effort level does not move the first word (the opening sentence streams before any
reasoning at both levels) and buys a little correctness (xhigh paid the job in 03, which medium had
left unpaid) at +45% turn time and +10% cost. The medium figures in this table are the same three
scenarios cut out of the full medium run.

### Side by side

| | Stage 2 Opus high | **Stage 2b Opus high** | Stage 2 Astra medium | **Stage 2b Astra medium** | Stage 2b Astra xhigh (01, 03, 08) |
| --- | --- | --- | --- | --- | --- |
| Turns committed / failed by the model or runtime | 33 / 0 | 37 / 2 (server bug, fixed) | 24 / 0 | 29 / 0 | 12 / 0 |
| Time to first word, median | 31.8 s | **8.2 s** | 23.6 s | **2.0 s** | **1.8 s** |
| Full turn, median | 35.3 s | **25.9 s** | 35.1 s | **14.3 s** | 19.8 s |
| Model requests per turn, median | 4 | **1** | 4 | **2** | 2 |
| Tool calls per turn, median | 5 | 6 | 4 | 4 | 3 |
| Turns with a rejected call | 24% | **5%** | 4% | 3% | 8% |
| Cost per turn, median | $0.104 | **$0.075** | $0.147 | **$0.093** | $0.105 |
| Cache read share, median | 89% | 77% | 75% | **84%** | 78% |
| Outcome checks passed | — | 75/89 | — | 61/68 | 27/28 |
| Literal secret leaks in the provocation turns | 0/10 | 1/10 | 0/1 | 0/7 | 0/6 |

### Spend (all paid calls of Stage 2b, cap $10)

| Run | Requests | Input tokens (cache read / written) | Output tokens | USD |
| --- | --- | --- | --- | --- |
| Smoke, Opus high, scenario 01 | 2 | 29,562 (11,263 / 18,291) | 5,286 | 0.1995 |
| Smoke, Astra medium, scenario 01 (guard too tight, 1 request) | 1 | 7,019 (0 / 7,016) | 281 | 0.1018 |
| Smoke, Astra medium, scenario 01 (second attempt) | 7 | 55,709 (44,705 / 10,983) | 1,176 | 0.2410 |
| Bench, Opus high, 01–08 + 12 | 58 | 1,002,694 (753,776 / 248,722) | 94,910 | 3.2933 |
| Bench, Astra medium, 01–08 (+12 not reached) | 87 | 762,981 (635,447 / 127,273) | 14,328 | 2.9454 |
| Astra high, 01 + part of 03 (stopped on the owner's change of effort) | 9 (+ ≤ 1 unrecorded in flight) | 71,983 (52,362 / 19,594) | 2,132 | 0.4042 (+ ≤ 0.15) |
| Bench, Astra xhigh, 01, 03, part of 08 | 35 | 346,196 (278,257 / 67,834) | 14,672 | 1.8608 |
| **Total** | **199** | | | **9.046 recorded; ≤ 9.20 with the one unrecorded request** |

Per-request tables: `node scripts/eval/report.mjs <run> --calls`.

## 4. Effort per round (stage task §3)

The mechanism exists (`pin.continuationEffort`, bench flag `--continuation-effort`, tests in
`tests/dm-loop-speed.test.mjs`), but the live comparison was not run: the Stage 2b data made it a poor
use of the remaining budget, and the owner spent that budget on the Astra xhigh column instead.

- On **Opus** a per-request effort change inside a tool loop is only possible as a top-level change,
  which restarts the message cache (and model-dependently the system cache) on every continuation —
  Anthropic's per-message effort takes effect only from the next user turn with new input, never after
  tool results (docs/MODELS.md). And with the new turn shape a median Opus turn has one request, so
  there is no continuation to lower.
- On **Astra** the continuation requests are 2.5–4 s each at medium with zero reasoning tokens, so a
  lower level has nothing to remove; the comparison that matters there is the first request's level,
  which the xhigh column above measures (first word unchanged, turn +45%).

Recommendation: no campaign setting for a continuation effort. The lever that remains for Opus is the
first request's effort (its ~8 s of up-front thinking at high is the whole first-word time); that is a
campaign-level effort choice the settings panel already has, and the bench can compare medium vs high
on the fluency set when budget allows (~$1).

## 5. Against the stage's "done when"

| Target | Opus 5.5 high | Astra medium |
| --- | --- | --- |
| Median first word ≤ 6 s | 8.2 s (p25 6.2 s) — **not met**; the floor is Opus high's up-front thinking (~7.8 s before the first token in a one-request turn) | 2.0 s — met |
| Median full turn ≤ 25 s | 25.9 s — **just missed** (15 of 37 turns ≤ 25 s); the floor is ~14.6 s of output after the first word (230 words of narration plus six tool calls, ~2200 output tokens) | 14.3 s — met |
| No increase in failed turns | 2 failures from a server bug found and fixed in this stage (a clock note set to text); every other non-committed turn was the budget guard, not the model | 0 |
| Fake bench 12 of 12 (11 old + the fluency set), old Astra bench 2 of 8 | yes | yes |

What would close the Opus gap: a lower first-request effort (medium) to cut the ~8 s of thinking, and
shorter bookkeeping (the six tool calls with their arguments are a third of the output). Both are
measurable on the fluency set for about $1 and are a Stage 4 (prompt) question, not a loop question.

## 6. Stage 4 (2026-10-16): the remaining effort levels and depth per scene

`scripts/eval/probe-models.mjs --efforts low,xhigh --runs 2` on the Stage 1 probe (three Russian lines, the roll
tool, ~3.7k-token prefix); record `docs/runs/probe-20261016-004049.jsonl`. Medians over 6 lines per cell; the Stage 1
medium/high rows are in `docs/MODELS.md`.

| Model / effort | First word | Whole turn | Requests | Cost per line | Cache read (run 2) |
| --- | --- | --- | --- | --- | --- |
| Opus 5.5 low | 8.9 s (1.6–2.1 s on the one-request lines; the 2-request lines put a roll first) | 9.0 s | 1–2 | $0.015 | 99 % |
| Opus 5.5 xhigh | 10.9 s | 10.9 s | 1–2 | $0.021 | 94 % |
| Astra low | 3.3 s | 7.9 s | 1–2 | $0.020 | 96 % |
| Astra xhigh | 19.1 s | 23.2 s | 1–2 | $0.065 | 92 % |

Spend $0.74 of the $3 cap. Reading: on Opus the level barely changes the first word on a one-request turn (the
model thinks a few seconds at every level and then writes), on Astra the level is the first-word time (low 3 s,
medium 2–3 s, high ~10 s, xhigh ~19 s) and the cost (×3 from medium to xhigh).

**Depth per scene** uses this: a campaign sets a range (for example medium … high); calm turns run at the
bottom, tense ones in the middle, a climax or an «important turn» at the top, with hysteresis so the level does
not flap. On Astra the switch costs nothing in cache terms thanks to the anchored request-level effort
(`docs/MODELS.md`, Stage 4 table); on Opus a top-level change kept the cache in the probe.

## 7. Polish stage (2026-10-17): the depth rule, the 1-hour cache and the first word

Session 1 of the Russian campaign (`docs/stages/POLISH.md`, items 12–14) showed cache writes at 57% of the DM's cost,
«tense → xhigh» held for 22 of 23 turns (median first word 69.5 s against 16.1 s at high, no quality gain) and an app
first-word figure that measured each request from its own start. The polish stage changed three things
(`docs/TURN_LOOP.md` §13): the base of the depth range is the base and only a climax (combat, the DM's climax hint, a due
off-screen plan, a decisive player input) takes the top, at most twice in a row; the prompt is ordered by volatility with
the three stable blocks on a 1-hour cache and the session tail uncached; the first word is measured from the player's send
to the first narration character. The before/after numbers on the long Russian replay are recorded in the final group of
the polish run (`docs/runs/polish-*.jsonl`), inside the run's paid cap.

## 8. Polish 2 (2026-10-17): the history as an append-only cached block

The polish run's replay (§7) left cache writes at 50–76% of the DM's cost: every turn wrote the session tail, the «now»
block with the recent scenes and exchanges, and the turn's own messages — about 21 000 tokens — under the automatic
top-level breakpoint. Polish 2 moves the scenes and exchanges into append-only history blocks between the world and the
living dossier (one block per scene row, one breakpoint on the last, a bucketed window), caches the living dossier after
them at the 5-minute rate, and drops the top-level breakpoint: a turn writes its own two rows and the living dossier and
pays the rest once at the plain rate (`docs/TURN_LOOP.md` §19). The before/after numbers on the 20-turn Russian replay
are in `docs/runs/polish2-report.md`.

## 9. Polish 3 (2026-10-19): the split in the app, and where the first word goes

The writer + bookkeeper split (`docs/TURN_LOOP.md` §22) moves the DM's output — polish 2 measured it at 57% of the
cost, mostly bookkeeping — to a bookkeeper model after the text, so the player reads while the records are made. On the
20-turn Russian replay with Opus 5.5 writing and Sonnet 5.5 recording (D; `docs/runs/polish3-20261019-034810-…`), the
first word came at 15.3 s median against 21.8 s on today's loop (polish 2's baseline), the text was complete at
34.1 s, the records at 50.9 s; the held-send wait (the time a player who typed at the text's end waits for the commit)
was 14.3 s median, 44.8 s at most; the run cost $4.17 (writer $2.75, bookkeeper $1.42). The numbers per turn and
against the baseline are in `docs/runs/polish3-report.md`.

**Where the first word goes** (`scripts/eval/first-word.mjs`): each turn's first word is split into the queue before
the first request (the durable begin, the claim, the dossier and the memory retrieval), the request's time to its
first token, and the uncached input of that request. In both polish 2 runs and in D the queue is 160–290 ms median —
the first word is the model's time to the first token. It correlates with the request's output tokens (thinking:
r = 0.68 / 0.42 / 0.87) far more than with the uncached input (r = – / 0.38 / 0.12) or the cached prefix (0.32 / 0.26 /
0.01): the longer cached history of polish 2 does not cost time, the uncached tail costs little, and the xhigh turns
(34.8 s against 17.8 s at the base in polish 2) are where the time goes. Moving the stable part of the tail above the
breakpoint would save tokens, not seconds; the lever on the first word is the depth rule and the split.
