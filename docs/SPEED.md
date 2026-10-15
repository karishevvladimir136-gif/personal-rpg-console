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

## 3. After: the live bench

(filled in below from the Stage 2b live runs)
