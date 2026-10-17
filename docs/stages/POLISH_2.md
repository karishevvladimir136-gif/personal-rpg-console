# Polish 2 — after the polish run and the picture bake-off

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch `claude/polish-2` from `origin/claude/polish`, with
`origin/claude/picture-models` merged first. One session, nothing in parallel. Work unattended in this order, commit
and push after each part, keep `docs/runs/polish2-progress.md` current; anything that needs the owner goes to «Needs
the owner» in the report. Never `main`; keys only in `.env.local`; live paid calls within **$15** for the turn loop and
**$10** for pictures.

## 1. Merge the two branches

`claude/polish` (the ten groups) and `claude/picture-models` (new models in the catalogue, the OpenAI GPT Image
adapter, the prompt compiler wired into live frames). Expected overlap: `src/lib/server/media/pictures-service.ts`.
Keep both sides' intent; the full suites of both branches green after the merge.

## 2. Pictures by the owner's blind picks (2026-10-17)

The owner judged nine scenes blind (eight from session 1 and the hero's full figure), eleven models each:

| Model | Best | Liked | Judges: likeness / adherence | Median s | $/image |
| --- | --- | --- | --- | --- | --- |
| GPT Image 2.5 Sunburst | 6 (t1, t2, t4, t7, t8, figure) | 2 | 8.42 / 8.42 | 27.4 | 0.045 |
| GPT Image 2.5 Flare | 1 (t5) | 6 | 8.45 / 8.23 | 16.0 | 0.045 |
| Nano Banana 2 | 1 (t3, underwater) | 0 | 4.75 / 7.83 | 11.1 | 0.080 |
| Nano Banana Pro | 1 (t6) | 0 | 5.83 / 7.96 | 21.7 | 0.150 |
| Qwen-Image 3 | 0 | 4 | 7.55 / 7.96 | 114.1 | 0.040 |
| GPT Image 2 | 0 | 2 | 8.17 / 8.00 | 69.0 | 0.136 |
| Seedream 5.0 Pro | 0 | 1 | 6.50 / 8.04 | 87.8 | 0.071 |
| FLUX 3, FLUX.2 [pro], FLUX.2 [klein] 9B, Grok Imagine | 0 | 0 | — | — | — |

In every scene one of the two GPT Image 2.5 models is best or liked; the owner and the judges agree. Do:

- **Anchors, key frames and redraws: GPT Image 2.5 Sunburst. Live frames: GPT Image 2.5 Flare**, with Sunburst as the
  fallback when Flare refuses (it refused the cut-forearm shot twice in three) — after the app's one softened
  re-submit. FLUX models stay in the catalogue, off by default; the owner can switch a tier in the picture settings.
- Wire the OpenAI path in `src/lib/visual-frame/picture-job.ts` (`generateOpenAIImage` for OpenAI model IDs, the
  server's OpenAI key, the same key check, price ledger and daily cap), then `modelForTier`.
- The full-figure anchor prompt: carried items as separate constraints, not «pistol in hand, helmet in hands» inside
  the pose — the likely trigger of the three-handed anchor.
- Pass the world clock (time of day, weather) to the compiler through a side-effect-free read (the bake-off left it out
  because `readPlay` can start a digest).

## 3. The shot director: expand the one-line shot into a visual brief (owner's idea, 2026-10-17)

Owner: «надо сделать систему, что будет расширять промпт — часто одной строки не хватает». Today a live frame is built
from the turn's **first paragraph** only, and the small shot model returns one clause: `action` ≤ 200 characters,
`where` ≤ 100, `angle`, `mood` ≤ 60 (`src/lib/visual-frame/shot.ts`). The compiler then adds people's looks and state
from the records, but the moment itself stays one line. Industry practice expands short prompts with a language model:
DALL-E 3 is sampled with GPT-4 «upsampled» descriptive captions, which fixes images «it would have otherwise gotten
wrong» ([paper](https://cdn.openai.com/papers/dall-e-3.pdf)); Imagen's LLM prompt rewriter is on by default and
rewrites prompts under 30 words, and turning it off «may reduce image quality»
([Google](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/use-prompt-rewriter?authuser=0)).

Build:

- **A visual brief instead of the one-clause shot**, written by Claude Sonnet 5.5 (quality first; +2–4 s, about a cent)
  from the whole turn's narration, not the first paragraph: the most visual beat of the turn (not simply the first
  sentence); composition — foreground, middle, background; for each person in frame, pose, expression, what they hold,
  clothes and visible state from the records; the place — materials, light sources, layout; time of day and weather
  from the clock; light and palette; camera — distance, angle, lens feel; continuity with the previous frame (what is
  still there, what changed); what must not appear (text, extra people). Plain English sentences, 80–160 words; the
  compiler adapts it per model family (GPT Image takes it whole; FLUX gets a shorter form). Stored with the picture,
  never shown to the player. When the brief model fails or times out, fall back to today's shot.
- **Visual profiles** for named people and places: a full look (face, age, hair, build, usual clothes, marks; for a
  place — materials, light, layout, landmarks), drafted once from the text and the approved anchor, editable by the
  owner on the person's or place's card, updated when the story changes the look (a wound, a borrowed shirt), and fed
  into every brief. One line of appearance is the root of the face and age drift too.
- **«Перерисовать» with a comment**: the owner may add one line («сделай ночь», «он без шлема»); the brief merges it,
  and the request goes as an edit — «change only this; keep everything else» (GPT Image supports edits).
- **Proof**: the eight bake-off shots, today's one-clause shot vs the brief, on Sunburst and Flare, two samples each; the
  planner builds the owner's blind page from `docs/samples/pictures-brief/` (same JSON shape as the bake-off); measure
  adherence, likeness, clothing state, people count, latency.

## 4. Cache: history as an append-only block

The polish run left cache writes at 50–76% of the DM's cost: about 21 000 tokens are written every turn — the «now»
block (13 000 median: the recent scenes verbatim, item 8's budget) and the messages. Keep the budget and stop paying
for it: the conversation and the recent scenes go into an append-only block before the volatile tail, with a cache
breakpoint at the last completed turn, so each turn writes only the new turn; the volatile «now» block keeps only what
changes (state, receipts, plans due, the voice reminder). Target: cache writes under 25% of the DM's cost on a 20-turn
Russian replay; report first word and cost per turn before and after.

## 5. The opening written by the campaign's DM

The opening proposal is written by the campaign's DM only for OpenAI DMs (the bootstrap contract's `usage.model` check
and validators pin OpenAI). Let the campaign's DM (Opus) write it, in the campaign language, ending on a situation; the
Russian voice layer applies to it once the voice stage turns it on.

## 6. Small follow-ups from the polish report

- A debt in the wizard's hero description («должен сорок монет Марте») becomes a journal debt to a person, not a
  resource line.
- A combat profile drafted by the DM from the hero's text on demand (the owner approves), for any sheet.
- The first adventure goes straight into the opening review — no «Проверить» → «Сохранить» clicks.
- Quest texts link the named things they mention to their codex entries («Сельдь»).
- «Визуальная библия» and «Галерея» merge into one «Картинки» page.

## Checks

typecheck, lint, full suites (`--test-concurrency=2`, Node 24), build, fake bench, screenshots with the overflow check,
a 20-turn Russian replay on Opus 5.5 high for item 4, the picture proof of item 3. Report in English: per part what
changed and how it was proved, the cache numbers before/after, the picture numbers, money spent, «Needs the owner».
Then the owner plays session 2 in the sandbox and the local session runs `docs/SESSION_REPORT_PROMPT.md` into
`C:\dev\rpg-exports\session-2\`.
