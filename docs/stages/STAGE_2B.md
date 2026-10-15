# Stage 2b — speed and fluency of the new turn

Context: stage 2 delivered `dm-loop-v1` and it works (33/33 Opus and 24/24 Astra live turns committed, 0 failures,
0 literal leaks, Opus ~$0.10 per turn). But it does not yet *feel* like a live DM: median time to first word is
31.8 s (Opus high) and 23.6 s (Astra medium), full turn ~35 s, because both models run all tool rounds first and
write the whole narration in one burst at the end. Plan targets: first word ≤ 5 s, full turn ≤ 20 s.
This stage closes that gap before stage 3. It changes how the turn flows, not what it may do.

Branch: `claude/stage-2b-speed` from `claude/stage-2-turn-loop`. First commit: the updated plan and this file.
If you continue in the stage 2 session and its context is large, commit and write a progress note at the top of
`DEV_STATUS.md` first.

## 0. Measure before changing (no new spend)

From the saved stage 2 live run records, break each turn down per model request: request latency, time to first
token, thinking/reasoning tokens, output tokens, tool calls in the round, and why the round existed
(first request, after a rejection, after `query_state`, a dependent call, `finish_turn` with no text…).
Also list the top rejection reasons. Write it to `docs/SPEED.md`: where the ~35 s goes. If the bench does not
record enough to answer this, add the instrumentation first and get the numbers in step 5.

## 1. Fewer rounds per turn

Target: median ≤ 2.5 model requests per turn (stage 2: Opus ~4.2).
- Put the state the model usually needs into the request (party, HP/resources, money, inventory summary,
  present and nearby characters, location, open quest terms) so `query_state` becomes the exception.
- Independent calls go in one round as parallel tool calls. Say so in the instructions with short examples;
  check that both adapters send all parallel calls and return all results together.
- **Pull forward from plan §9:** relax the Character Model limits now (no 3-item lists, no 120-character texts;
  keep only generous anti-garbage bounds, keep the identity core protected). Stage 2 showed Opus hitting them
  constantly, and every rejection costs a whole extra round.
- For every other top rejection reason: if it is an artificial limit rather than data integrity, relax it;
  if it is integrity, make the rejection message carry the exact correction (current value, allowed value,
  existing ID) so one retry is enough.

## 2. Narration first, tools inside the story

Stage 1 and 2 both showed: the models act first and narrate last. Teach the other order, as a live DM does:
- Start the scene in text right away. Call a tool at the moment the story needs it, mid-text, and continue
  after the receipt. A roll: describe the attempt → `roll` → describe the outcome.
- Calls that **decide** an outcome (roll, spend, buy, transfer that may fail) come *before* the sentence that
  describes that outcome. Pure **bookkeeping** that cannot change what was said (recording an NPC exactly as
  described, `note_character`, `note_world`, scene kinds in `finish_turn`) goes *after* the text, batched in
  one final round — it no longer blocks the player from reading.
- Where the provider supports text and tool calls interleaved in one assistant message (Claude does; check
  Astra), continue the same message after the tool result instead of starting a fresh narration.
- Put 2–3 short examples of this flow in layer 1 (cached), in the campaign language.
- Make sure the client shows each text segment as soon as it streams, not only after the last round.

## 3. Effort per round

The effort level can differ per request inside one turn. Try: first request at the campaign effort (Opus high),
continuation requests after tool results at a lower effort. Measure speed and compare narration quality on the
same inputs. Keep it only if quality holds; make it a campaign setting with the default chosen from the data.

## 4. Astra cache

Stage 2: Astra cache read share 75% and every cache write billed at 1.25×. Check what OpenAI offers for
`gpt-6-astra` (stable prefix order, prompt cache key, retention) and raise the read share if possible.

## 5. Bench and live run

- Make live scenario checks **outcome-based**, so a correct turn passes even if the model names or orders things
  its own way: "an NPC tied to the mill exists", "the hero's money went down by the price paid",
  "the reward is paid exactly once", "a weapon item exists in the hero's inventory".
- Add a short fluency set: a combat roll, a purchase, meeting a new person, a companion talk, a secret probe.
- **Live run (paid):** both models (Opus high, Astra medium) on scenarios 1–8 plus the fluency set.
  **Budget: $10 total.** Before the run, state what you will run; after it, tokens and cost per call and in total.
- Report medians before → after: time to first word, full turn, model requests per turn, share of turns with a
  rejected call, cost per turn, cache read share, failed turns, outcome checks passed.
- Save 5 sample turns per model (player line, narration, accepted changes) to `docs/samples/stage-2b/` so the
  owner can judge the writing.

## 6. Done when

- Median first word ≤ 6 s and full turn ≤ 25 s for Opus high on the live bench — or, if the models' own latency
  makes that impossible, the best achieved plus a clear breakdown of the floor in `docs/SPEED.md`.
- No increase in failed turns; fake bench still 11 of 11; old Astra bench unchanged.
- typecheck / lint / test / build pass on the final branch.
- A short report in English: numbers before → after, what worked, what did not, sample paths. Update the top of
  `DEV_STATUS.md`. Do not start stage 3. Nothing to `main`.
