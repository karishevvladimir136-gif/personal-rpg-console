# Picture models — one prompt, many models (blind bake-off)

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), branch `claude/picture-models` from
`origin/claude/integration`. Runs in parallel with the polish stage: it owns only the picture adapters
(`src/lib/**/fal*`, a new adapter file per provider), `scripts/eval/pictures/**`, `docs/samples/pictures/` and
`docs/runs/`. No change to the game screen, the DM loop or the picture store schema; a new model is a new entry in the
existing Stage V model catalogue.

## Why

First real play (owner, 2026-10-16): the style holds, but people are «не прям вау» — the hero's face and age drift,
clothes are wrong (bare-chested right after putting on a shirt), weather contradicts the text. Pictures cost cents and
carry the atmosphere; the owner wants the best models, quality decides, price only within the cap.

## Candidates (check current endpoints, prices and terms first; the list moves monthly)

Leaderboards seen on 2026-10-16 — Artificial Analysis text-to-image: GPT Image 2.5 (Sunburst / Flare), GPT Image 2
(high), Nano Banana 2.1 (not callable yet), Grok Imagine Image 2.0, MAI-Image-2.6, Nano Banana 2, FLUX 3 Image;
Artificial Analysis image editing (2026-09-02): MAI-Image-2.6-Preview, MAI-Image-2.5-Pro, Reve 2.1, GPT Image 2 (high),
Nano Banana 2, Qwen-Image-3.0-Pro, Nano Banana Pro, Seedream 5.0 Pro.

Test at least: **Seedream 5.0 Pro** (owner's request), **Nano Banana Pro** and **Nano Banana 2** (fal
`fal-ai/nano-banana-pro/edit` and its Nano Banana 2 sibling), **GPT Image 2.5** and **GPT Image 2** (OpenAI, key
present), **FLUX 3 Image** if on fal, **FLUX.2 [pro]** and **[klein] 9B** (today's baselines), **Qwen-Image-3.0-Pro**
and **Reve 2.1** if reachable. MAI-Image and Grok Imagine need hosts outside the environment's network list: report
what they would need (domain, key) instead of working around it.

## The test

1. **One hero, real anchors.** Draw (or reuse) a hero like the owner's — a former guild diver, about 35–40, dark
   swept-back hair, stubble, weathered face, worn dark work jacket with a guild patch — as a portrait and a full
   figure on the best model; every candidate gets the same two anchors as references plus his appearance text.
2. **Eight shots from the owner's first session** (scene text only, no names in the prompt): a tavern keeper sets a
   mug before him at the counter; he kneels on a pontoon repairing a winch with a file; underwater under a pontoon in a
   copper diving helmet in murky water; a silent net-maker washes his cut forearm and smears resin on it; he tears his
   shirt into strips and wraps resin gloves; upstairs, a big red-nosed docker reads a pencil note; a stranger in a dry
   coat at the counter, seen through floorboard gaps; dusk, a narrow flat-bottomed boat pushing off a pontoon with
   three people and a hand pump. Same style text for all (the campaign's cinematic one).
3. **Clothing and state.** Two of the shots specify state (bandaged hands; wearing a borrowed grey linen shirt under
   the jacket) — score whether the model keeps it.
4. **Measure per model:** identity score against the anchors (vision model, as in Stage V), clothing/state kept (yes
   or no), **anatomy** (extra or missing limbs, hands, fingers — the current full-figure anchor of the owner's hero has
   three hands), prompt adherence, no text or logos, latency (median), price per image, refusals. Three seeds per shot.
   Also redraw the hero's full-figure anchor on each candidate: anchors are the references for every later frame, so an
   anatomy error there spreads.
5. **Blind page for the owner:** the planner builds it from `docs/samples/pictures/` — for each shot, all models side
   by side under letters, one click «лучший», names revealed at the end. Write the JSON in the same shape as the blind
   DM samples (shot, variants with file, model hidden in a sealed field).
6. Recommend per tier from the numbers and leave the choice to the owner: live frames (needs ≤ ~6 s), key frames and
   anchors (quality first).

## Budget and checks

Paid calls within **$20**, stopped by a guard; every call in a ledger. typecheck, lint, tests for the new adapters
(request shape, refusal handling, no key in logs); push `claude/picture-models` only, never `main`. Report in English:
endpoints used, what was unreachable and why, the table, the recommendation.
