# Picture models — bake-off report (2026-10-17)

Stage: `docs/stages/PICTURE_MODELS.md`. Branch `claude/picture-models`. Method, endpoints and what was unreachable:
`pictures-README.md`. Raw records: `pictures-results.json` (every picture, prompt, time, price, scores),
`pictures-ledger.json` (every paid call), `pictures-identity-rank.json`, `pictures-summary.json`. The owner's blind
page is built from `docs/samples/pictures/`.

## In short

- **Tested:** ten models (Nano Banana Pro, Nano Banana 2, Seedream 5.0 Pro, FLUX 3, FLUX.2 [pro], FLUX.2 [klein] 9B,
  Qwen-Image 3, GPT Image 2, GPT Image 2.5 Sunburst, GPT Image 2.5 Flare) plus Grok Imagine as a light extra (it turned
  out to be on fal). One hero with two anchors, eight shots from the owner's first session, each model with its own
  compiled prompt, three samples per shot (GPT Image 2: two; Grok: one), today's generic prompt on two shots, and a
  redraw of the hero's full-figure anchor on every model. 274 pictures (5 of them anchor candidates), **$19.45 of $20**
  (images $18.85, judges $0.61).
- **The «bare-chested right after putting on a shirt» bug is the prompt, not the model.** Today's prompt never tells
  the model what the hero wears now. On the shot with the borrowed grey shirt, today's generic prompt kept it in
  **0 of 9** pictures (every model drew a dark undershirt); with the compiled prompt, the shirt and the bandaged hands
  were kept in **54 of 60** pictures across all models — 53 of 54 without FLUX.2 [klein], which kept it once in six.
- **Face and age drift is mostly the model.** Shown side by side against the portrait, the judge ranks GPT Image 2.5
  Flare (8.45/10), GPT Image 2.5 Sunburst (8.42) and GPT Image 2 (8.17) highest, then Qwen-Image 3 (7.55) and FLUX 3
  (7.33). Today's two models are at the bottom: FLUX.2 [pro] 4.64 and FLUX.2 [klein] 9B 3.92 — the drift the owner saw.
  The prompt barely moves likeness (7.05 → 7.15 on the same shots): references do that work, and both prompts sent
  the same two.
- **Lettering is a FLUX habit.** Letters or signs appeared in 7 of 24 FLUX.2 [klein] pictures, 5 of 23 FLUX.2 [pro]
  and 5 of 24 FLUX 3; none in GPT Image, Nano Banana Pro, Seedream, Qwen-Image 3 or Grok.
- **Anatomy is clean everywhere.** No extra or missing limbs in any of the 271 judged pictures (the judge flagged 7 tangled-hand pictures;
  the two I opened at full size were plausible). The hero's full figure redrawn by all eleven models with the new
  anchor prompt: one head, two arms, two hands, two legs every time. The app's current figure prompt on FLUX.2 [pro]
  was also clean in three tries, so the owner's three-handed anchor was not reproduced here; the likeliest trigger is
  the equipment list the app adds to figure prompts (pistol in hand, helmet in hands), which this control left out.
- **Speed:** only FLUX.2 [klein] 9B is under 6 seconds (median 3.3 s, every frame). Next: Nano Banana 2 11 s, Grok 11 s,
  GPT Image 2.5 Flare 16 s, FLUX.2 [pro] 17 s, Nano Banana Pro 22 s, GPT Image 2.5 Sunburst 27 s, FLUX 3 29 s, GPT Image 2
  69 s, Seedream 88 s, Qwen-Image 3 114 s (two requests over 5 minutes).

## Recommendation per tier (numbers only — the owner chooses, after the blind page)

**Anchors and key frames (quality first): GPT Image 2.5 Sunburst.** Best prompt adherence (8.42), top likeness
(8.42), clothing state kept 6/6, no lettering, no refusals, $0.045 a picture (cheaper than today's FLUX.2 [pro] at
$0.056), about 27 s. Runner-up if the owner prefers to stay on fal only: FLUX 3 (likeness 7.33, $0.066, 29 s) — but it
paints lettering in one picture of five. Nano Banana Pro draws clean, text-free pictures (adherence 7.96) but costs
$0.15 for less likeness (5.83).

**Live frames (needs about 6 s or less): no model is both fast enough and good enough.** FLUX.2 [klein] 9B is the only
one under 6 s, and it is the weakest on likeness, on clothing state and on lettering. Two ways:

- **A.** Keep [klein] for the instant frame and redraw every frame with GPT Image 2.5 (Flare or Sunburst) once the
  turn is saved — about $0.066 a turn.
- **B.** GPT Image 2.5 Flare as the only frame: median 16 s (14–18 s), $0.045, likeness 8.45, clothing 6/6, no
  lettering. It refused the cut-forearm shot twice in three tries (the app's one softened re-submit covers that case).

My reading: **B** if a picture 16 seconds after the first words is acceptable (a turn usually takes longer than that to
read), otherwise **A**.

**Not recommended:** GPT Image 2 (the same quality as 2.5 at three times the price and four times the wait),
Qwen-Image 3 (good likeness, but 1–4½ minutes a picture and timeouts), Seedream 5.0 Pro (88 s median), Nano Banana 2
(drifts to a comic look, likeness 4.75), FLUX.2 [pro] (likeness 4.64, lettering).

**Caveat on likeness:** the two anchors were drawn by GPT Image 2.5 Sunburst (the only colour portrait under
«Cinematic noir», and the best fit for the description), so the GPT models may have a home advantage on likeness.
Adherence, clothing state and lettering do not share that bias, and GPT Image 2.5 leads or ties there too.

## What switching needs (not done here; outside this stage's files)

- A fal model (FLUX 3, Nano Banana, Seedream, Qwen-Image 3, Grok): `modelForTier` in
  `src/lib/visual-frame/pictures.ts` — one line. The adapter, request shapes and prices are in the catalogue.
- GPT Image 2.5: `src/lib/visual-frame/picture-job.ts` must call `generateOpenAIImage` for OpenAI model IDs with the
  server's OpenAI key (about ten lines, plus the same key check and daily cap), then `modelForTier`. The adapter
  (`openai-image.ts`), its prices and tests are ready. GPT Image 2 is also on fal (`openai/gpt-image-2/edit`); 2.5 is not.
- No database change: the picture store keeps any model ID (free text).

## The prompt compiler (built and wired)

`src/lib/visual-frame/prompt-compiler.ts`, deterministic, one dialect per model family: natural sentences; references
by role in a fixed order (hero's face, hero's figure, other people, place, style) — numbered for GPT Image («Image 1 —
the man's face and hair (keep exact)»), by position for the others; an identity lock with what may change, in every
frame; the visible state from the records as constraints; the exact number of people; an anatomy guard; «no text» —
except to FLUX, which has no negative prompts, so plain unmarked surfaces are described instead; an anchor prompt and an
«edit, don't re-roll» prompt. Live frames in the app now use it (`requestFrame`): the hero's full figure goes beside the
portrait, worn items and visible conditions come from the records, subjects first in the reference order. The compiled
prompt is stored with the picture as before (private).

Generic vs compiled, all models together, same shots (t1, t6), first sample:

| | Pictures | Clothing state kept (t6) | People count right | Adherence | No text | Anatomy ok | Likeness (per picture) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Today's generic prompt | 19 | 0/9 | 17/19 | 7.26 | 17/19 | 19/19 | 7.05 |
| Compiled prompt | 20 | 8/10 | 20/20 | 8.15 | 19/20 | 20/20 | 7.15 |

Not yet wired: the world clock (time of day) — the clock lives in the play snapshot, and the only server read of it
in the picture path (`readPlay`) can start a session digest, so it was left out; the compiler takes it when a
side-effect-free read is passed. «Перерисовать» as an edit: the prompt is ready and tested, the button belongs to the
polish stage. Neither was measured in the bake-off (budget).

## The table

Frames include the two generic-prompt pictures. Median: the lower of the two middle values for an even count; in
brackets, the share under 6 s. «Identity, side by side»: Claude Sonnet 5.5 sees the portrait and every model's frame
for one shot at once (six hero shots × samples 1 and 2; the face is hidden in t3) — the identity number to use.
«Identity (compiled)»: Claude Haiku 5.5 per picture (Stage V's measure; it bunches between 6 and 8). Clothing kept: t6
(grey shirt) and t8 (bandaged hands). People count: t7's tavern sometimes gains extra patrons and t2's pontoon market
extra passers-by.

| Model | Frames | Refused | Median s (≤6 s) | $/image | Identity, side by side (Sonnet) | Identity (compiled) | Identity generic → compiled (same shots) | Clothing kept | Anatomy ok | People count right | Adherence | No text | Figure redraw anatomy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Nano Banana Pro | 26 | 0 | 21.7 (0/24) | $0.150 | 5.83 (12) | 6.85 | 6.5 → 7 | 6/6 (generic 0/1) | 24/24 | 21/24 | 7.96 (generic 7) | 24/24 | ok |
| Nano Banana 2 | 26 | 0 | 11.1 (0/24) | $0.080 | 4.75 (12) | 6.76 | 6.5 → 6.5 | 6/6 (generic 0/1) | 20/24 | 20/24 | 7.83 (generic 7) | 22/24 | ok |
| Seedream 5.0 Pro | 26 | 0 | 87.8 (0/24) | $0.071 | 6.5 (12) | 7.1 | 7.5 → 7.5 | 6/6 (generic 0/1) | 23/24 | 24/24 | 8.04 (generic 8) | 24/24 | ok |
| FLUX 3 | 26 | 0 | 29.1 (0/24) | $0.066 | 7.33 (12) | 7.24 | 7 → 7.5 | 5/6 (generic 0/1) | 24/24 | 24/24 | 7.67 (generic 7) | 19/24 | ok |
| FLUX.2 [pro] | 25 | 1 | 17.1 (0/23) | $0.056 | 4.64 (11) | 6.65 | 6.5 → 7 | 6/6 (generic 0/1) | 22/23 | 21/23 | 7.48 (generic 6.5) | 18/23 | ok |
| FLUX.2 [klein] 9B | 26 | 0 | 3.3 (24/24) | $0.021 | 3.92 (12) | 6.3 | 6.5 → 7 | 1/6 (generic 0/1) | 24/24 | 24/24 | 7.42 (generic 7.5) | 17/24 | ok |
| Qwen-Image 3 | 24 | 0 | 114.1 (0/23) | $0.040 | 7.55 (11) | 7.2 | 7 → 6.5 | 6/6 (generic —) | 23/23 | 23/23 | 7.96 (generic 7) | 23/23 | ok |
| Grok Imagine (extra) | 8 | 0 | 11.2 (0/8) | $0.040 | 5.83 (6) | 7.14 | — → 8 | 2/2 (generic —) | 8/8 | 8/8 | 7.88 (generic —) | 8/8 | ok |
| GPT Image 2 | 18 | 0 | 69.0 (0/16) | $0.136 | 8.17 (12) | 7.43 | 8 → 8 | 4/4 (generic 0/1) | 16/16 | 16/16 | 8 (generic 7.5) | 16/16 | ok |
| GPT Image 2.5 Sunburst | 26 | 0 | 27.4 (0/24) | $0.045 | 8.42 (12) | 7.43 | 7 → 7 | 6/6 (generic 0/1) | 23/24 | 21/24 | 8.42 (generic 7.5) | 24/24 | ok |
| GPT Image 2.5 Flare | 24 | 2 | 16.0 (0/22) | $0.045 | 8.45 (11) | 7.53 | 8 → 7.5 | 6/6 (generic 0/1) | 22/22 | 21/22 | 8.23 (generic 7.5) | 22/22 | ok |

Refusals and failures: GPT Image 2.5 Flare refused t4 (a cut forearm washed and smeared with resin) twice in three
(OpenAI moderation, HTTP 400, not billed); FLUX.2 [pro]'s content checker refused one t4 sample it had drawn in another;
Qwen-Image 3 timed out after 5 minutes twice (counted at full price). Nano Banana 2 turns «Cinematic noir» into a
pencil-sketch look in some frames; Nano Banana Pro and Seedream drew black-and-white portraits from it.
FLUX.2 [klein] read «red-nosed» as a clown's nose and handed the note to the wrong man.

## Spend ($19.45 of $20, 572 paid calls)

| | USD |
| --- | --- |
| Nano Banana Pro | 4.20 |
| GPT Image 2 | 2.58 |
| Nano Banana 2 | 2.16 |
| Seedream 5.0 Pro | 1.99 |
| FLUX 3 | 1.78 |
| FLUX.2 [pro] | 1.67 |
| GPT Image 2.5 Sunburst | 1.35 |
| GPT Image 2.5 Flare | 1.13 |
| Qwen-Image 3 | 1.08 |
| FLUX.2 [klein] 9B | 0.55 |
| Grok Imagine | 0.36 |
| Judge, Claude Sonnet 5.5 (identity side by side) | 0.39 |
| Judge, Claude Haiku 5.5 (every picture) | 0.22 |

fal rows are at list price (fal reports no price per request; FLUX rows include one megapixel per reference, an upper
bound; Nano Banana 2, Qwen-Image 3 and Grok prices are unconfirmed and counted high). OpenAI and Anthropic rows are
exact, from each reply's usage. Ten judge calls of a calibration run were overwritten in the ledger by a parallel
process and restored by hand from the printed costs (marked `restored`).

## Limits

- The judges are models, not the owner: Haiku answers per picture (state, people, anatomy, lettering, adherence);
  Sonnet ranks likeness side by side. The blind page is the real test.
- Latency is from one cloud VM on one evening (UTC 00:50–02:20); Seedream's and Qwen's queues varied a lot.
- Samples per shot: three; GPT Image 2 two and Grok one, to stay within the cap. Generic vs compiled: two shots, one
  sample per model.
- Not reachable: MAI-Image (Microsoft Foundry: a `<resource>.services.ai.azure.com` host and an Azure key), Reve 2.1
  (fal's queue: `Application "2.1" not found`; Reve's own `api.reve.com` and a key), Nano Banana 2.1 (not callable).
  Qwen-Image «3.0 Pro» has no separate fal path; fal's Qwen-Image 3 was tested.

## Checks (final code, cloud VM)

`pnpm typecheck` passes; `pnpm lint` passes with no warnings; `pnpm build` passes. Full suite
(`node --test --test-concurrency=2 tests/*.test.mjs`): 2,499 tests, 2,471 pass, 27 skipped, 1 fail — «Migration 30 is
byte-identical…» (`tests/universal-bootstrap-sql.test.mjs`), a hash of an SQL migration file that fails the same way on
the untouched base branch in this environment (an environment difference, not a picture change). New tests
(`tests/picture-models.test.mjs`, 10): request shapes of every new model, prices, the OpenAI adapter's multipart edit and
cost from usage, refusals told apart from transport trouble, the key only in the Authorization header and never in an
error or a log line, and the prompt compiler (reference roles and order, state, clock, people count, anatomy guard,
lettering, no names, FLUX without negatives, the anchor and edit prompts, the records path the app uses).
