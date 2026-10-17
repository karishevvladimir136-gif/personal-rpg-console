# Picture model bake-off — records (`docs/stages/PICTURE_MODELS.md`)

Cloud session, 2026-10-17, branch `claude/picture-models`. Synthetic hero and scenes only; nothing from the owner's
database. The owner's blind page is built by the planner from `docs/samples/pictures/` (see the README there).

## Files

- `pictures-ledger.json` — every paid call (images and the vision judge): reserved at an upper bound before it is
  sent, settled afterwards. fal at its list price (below; fal does not report a price per request), OpenAI and
  Anthropic exactly, from the token usage each reply reports. The run stops at the cap (`PICTURES_CAP_USD`, $20).
- `pictures-results.json` — one row per paid picture: model, shot, prompt mode (`compiled` or `generic`), sample,
  the full prompt, the reference roles sent, endpoint, request ID, size, time from submit to downloaded picture, price,
  refusal or error, the file, and the judge's scores. It is also the resume point: a finished picture is never drawn
  again.
- `pictures-summary.json` — the per-model table (`node scripts/eval/pictures/bakeoff.mjs summary`, no paid call).
- `pictures-REPORT.md` — the findings, the table and the recommendation per tier.

## Endpoints used (all confirmed before any paid call)

fal endpoints were confirmed with deliberately invalid requests: the queue accepts the request, the worker answers
with a validation error that names every field and its allowed values, nothing is generated. OpenAI models were
confirmed the same way (one invalid value per request, refused before generation) and by the key's model list.

| Model | Provider | Without references | With references |
| --- | --- | --- | --- |
| Nano Banana Pro | fal | `fal-ai/nano-banana-pro` | `fal-ai/nano-banana-pro/edit` |
| Nano Banana 2 | fal | `fal-ai/nano-banana-2` | `fal-ai/nano-banana-2/edit` |
| Seedream 5.0 Pro | fal | `bytedance/seedream/v5/pro/text-to-image` | `bytedance/seedream/v5/pro/edit` |
| FLUX 3 | fal | `blackforestlabs/flux-3/text-to-image` | `blackforestlabs/flux-3/edit-image` |
| FLUX.2 [pro] (baseline) | fal | `fal-ai/flux-2-pro` | `fal-ai/flux-2-pro/edit` |
| FLUX.2 [klein] 9B (baseline) | fal | `fal-ai/flux-2/klein/9b` | `fal-ai/flux-2/klein/9b/edit` |
| Qwen-Image 3 | fal | `fal-ai/qwen-image-3/text-to-image` | `fal-ai/qwen-image-3/edit` |
| GPT Image 2 | OpenAI | `/v1/images/generations` | `/v1/images/edits` (`image[]`) |
| GPT Image 2.5 Sunburst | OpenAI | same, `gpt-image-2.5-sunburst` | same |
| GPT Image 2.5 Flare | OpenAI | same, `gpt-image-2.5-flare` | same |

Request shapes differ per family (`src/lib/visual-frame/fal-image.ts`): Nano Banana and FLUX 3 take an aspect ratio
and a resolution (`1K` / `1k`), Seedream and Qwen an `image_size`; Seedream and FLUX 3 take no seed; OpenAI takes
`WIDTHxHEIGHT` (multiples of 16), `quality` low/medium/high/auto and no seed. Sizes: frames 1344×768 (just under one
megapixel; Nano Banana returns 1376×768, FLUX 3 1360×768), figures 768×1344, portraits 1024×1024. OpenAI quality
`high` for all three.

Prices counted (fal's own pages are outside the network list; figures from fal's pricing page as quoted by search
results, the unconfirmed ones counted high): Nano Banana Pro $0.15 per image; Nano Banana 2 $0.08 (unconfirmed);
Seedream 5.0 Pro $0.0675 + $0.0045 per reference after the first; FLUX 3 $0.024 per megapixel (rounded up); FLUX.2
[pro] $0.03 + $0.015 per extra megapixel; [klein] 9B $0.017 + $0.002; Qwen-Image 3 $0.04 (unconfirmed). Whether fal
bills a FLUX edit's input megapixels is not confirmed; the guard counts each reference as one extra megapixel, so
the FLUX rows in the ledger are an upper bound. OpenAI: text input $5, image input $8, image output $30 per million
tokens, from each reply's usage.

## Not reachable from this environment

- **MAI-Image-2.x (Microsoft)** — served by Microsoft Foundry (Azure): a Foundry resource with a MAI-Image
  deployment, an API key, and the host `<resource>.services.ai.azure.com` (`/mai/v1/images/generations`) added to the
  environment's network list. Not on fal's queue (`Application "mai-image-2" not found`).
- **Reve 2.1** — fal lists `reve/2.1/edit`, but fal's queue answers `Application "2.1" not found` for it and every
  variant tried; Reve's own API (`api.reve.com`, a Reve key) is outside the network list.
- **Nano Banana 2.1** — not callable yet (as the stage file says).
- **Grok Imagine** — reachable after all: fal serves `xai/grok-imagine-image` and `xai/grok-imagine-image/edit`
  (confirmed by the worker's validation reply). xAI's own API (`api.x.ai`, an xAI key) is not needed. Whether fal's
  version is «Image 2.0» could not be confirmed. Tested as an extra only if the budget allowed (see the report).
- **Qwen-Image-3.0 Pro** — fal has `fal-ai/qwen-image-3/edit` (and the same under `alibaba/`), but no separate
  «Pro» path; the model tested is fal's Qwen-Image 3.

## Method

1. **Anchors.** One hero like the owner's (a former diver, about 35–40, dark swept-back hair, stubble, weathered
   face, worn dark work jacket with a plain cloth patch; `scripts/eval/pictures/scene.mjs`). Portrait candidates on
   Nano Banana Pro, GPT Image 2.5 Sunburst and Seedream 5.0 Pro; the full figure drawn from the chosen portrait on the
   same model and checked by eye (one head, two arms, two hands, head to boots). Every candidate then gets the same
   two anchors (`docs/samples/pictures/anchors/hero.json`) plus the hero's appearance text.
2. **Eight shots** from the owner's first session, written the way the shot model writes them (who, action, where,
   angle, mood; names only as keys, never in a prompt): t1 the tavern keeper sets a mug before him; t2 kneeling on a
   pontoon filing a winch gear; t3 under a pontoon in a copper helmet; t4 the silent net-maker washes his cut forearm
   and smears resin; t5 tearing a shirt into strips for resin gloves; t6 upstairs, the red-nosed docker reads a pencil
   note (**state: a borrowed grey linen shirt under the jacket**); t7 a stranger in a dry coat at the counter, seen
   through floorboard gaps (no hero, no references); t8 dusk, a flat-bottomed boat with three people and a hand pump
   (**state: hands wrapped in resin-smeared linen strips**). The same style text for all: the campaign's starting look
   «Cinematic noir».
3. **Prompts.** Each model gets its compiled prompt (`src/lib/visual-frame/prompt-compiler.ts`, its own dialect) for
   all eight shots, three samples each (seeds 101/202/303 where the model takes a seed; plain repeats where it does
   not). Today's generic prompt (`framePrompt` in `src/lib/visual-frame/shot.ts`) on two shots (t1, t6), one sample,
   for the generic-vs-compiled comparison — two shots, not more, to stay within the cap. GPT Image 2 gets two samples
   per shot instead of three (the cut that keeps the run under $20; it costs three times GPT Image 2.5 per frame).
4. **Full-figure redraw.** Every model redraws the hero's full-figure anchor from the portrait with the compiled
   anchor prompt (anatomy guard included): an anatomy error in an anchor spreads to every later frame.
5. **Scores.** A vision judge (Claude Haiku 5.5, as in Stage V) looks at each picture with the two anchors and
   answers in JSON: identity 0–10 (null when the face is hidden), clothing/state kept (t6, t8), people counted,
   anatomy errors listed, prompt adherence 0–10, any text or logo (handwriting on t6's note excepted). Latency is the
   adapter's wall clock from submit to downloaded picture, median over the compiled frames. Refusals are counted, not
   retried (the app re-submits a softened prompt once; the bake-off measures the first answer).

Re-running: `node scripts/eval/pictures/bakeoff.mjs <command>` (the header of the script lists the commands). Keys
come from `.env.local`; nothing here holds a key.
