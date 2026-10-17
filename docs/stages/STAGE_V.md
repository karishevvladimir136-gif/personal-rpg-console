# Stage V — pictures: styles, references, live frames, illustrated chronicle

Runs in a Claude Code **cloud session** in parallel with Stage 4 (`docs/CLOUD.md`, do its "Session start" first).
Branch `claude/stage-v-visuals` from `origin/claude/stage-5-ui` after the Stage 5 fixes are pushed (check `DEV_STATUS.md`
on that branch; if the fixes are not in yet, start anyway and merge `origin/claude/stage-5-ui` again before the final
checks). Stage 4 runs at the same time on `claude/stage-4-dm` and owns the DM loop, the context and the world records; this
stage owns every picture. Plan: `REBUILD_PLAN.md` §8 (pictures), §10.2 (chronicle), §15 rows «Живые кадры» and «2D Live».

The owner's idea: **every player action gets a picture** — the game renders what happens, like a child of Esoteric Ebb and
Fabled Lands. Many players are visual; a picture appearing seconds after you act is the strongest way to show the game.
Rule for every visual: the DM and the rules decide what happened, the records remember it, pictures only show it. A turn
never waits for a picture, and a picture never reveals what the hero does not know.

## Ownership (to keep the parallel stages apart)

This stage may change: `src/lib/visual-frame/*`, `src/lib/server/media/*`, `src/lib/ui/visual-autopilot.ts`,
`src/lib/ui/subject-images.ts`, `src/components/registry/visual-autopilot.tsx`, `live-images.tsx`, new
`src/components/registry/live-frames*` and `chronicle*` files, the picture block of `settings-screen.tsx`, and new additive
migrations for pictures only. In `game-screen.tsx` add the frames panel and nothing else. Do not touch
`src/lib/gameplay/dm-loop/*`, the composer logic or any other screen block: Stage 4 changes them. Use timestamped
migration names as the repo already does, so the two branches never collide.

## 0. One small layout fix from the Stage 5 review

On phones the stat tiles of the character sheet now break the Russian labels mid-word («СЛОЖНОС-ТЬ ЗАКЛИНА-НИЙ»,
«СКОРОСТ-Ь»). In `character.module.css` (the only non-picture file you may touch for this): fewer tiles per row on narrow
screens, or the ruleset's short labels where it provides them, and `hyphens: auto` with the campaign language. Check
the phone screenshot.

## 1. Pictures that persist (`UI_DATA_NEEDS` #14–#16)

- SQL validators of `subject_visual` jobs and asset provenance accept `provider = 'fal'`, the fal model IDs and a fal
  reservation. Autopilot settings move from the device into campaign settings. A full-figure composition beside the
  portrait (#14).
- fal `validation` errors (5 of 22 portrait calls in Stage 5): log the error body once (no keys), fix the cause; on a
  validation error retry once with a simplified prompt, never in a loop.

## 2. Styles the owner can change

- A world has a **style**: a short style text plus one style reference image, stored as a version of the existing visual
  bible. A campaign may override it. Offer a few starting presets the owner can edit or replace (for example: line art
  with a limited palette, painterly oil, pixel art, noir graphic novel). Nothing is hardcoded to one look; the noir sample
  must look noir.
- **Changing the style** creates a new style version and re-renders the **anchor set** in the background, within the daily
  cap: portraits of the hero and companions, important NPCs, known places, holdings, item icons. Until a new anchor is
  ready the old one stays. Old versions are kept and the owner can roll back. Past frames keep the style they were drawn
  in; the chronicle can be re-rendered in the new style on request.
- Report the cost of a full anchor re-render for the «Мир Шва» sample.

## 3. Reference images for consistency

Today only text reaches the image model, not the pixels of approved pictures. Send references: the style image, the
place's illustration and the portraits of the people in the shot, up to the model's limit (fast models take about 4;
check each model's current docs). Measure consistency: an automatic check (a vision model compares a frame's people and
place with their anchors) on a 20-turn synthetic scene, with and without references.

## 4. Live frames

- **Shot.** While the narration streams, a small fast model turns the first paragraph (player-visible text only) into a
  shot: who, doing what, where, angle, mood. The plan allows a smaller model for image prompts (§8б); the DM itself is
  not called again. Hidden facts never enter a shot: build it only from text the player has already received.
- **Frame.** A fast image model (candidates: FLUX.2 [klein], FLUX.2 [flash]; pick by measured speed, cost and consistency)
  draws it with the references from §3. Target: the frame appears within a few seconds after the first words, while the
  text is still streaming.
- **Key moments.** On «Твой момент», a combat climax or the end of a fight, re-render the frame with a better model once
  the turn is committed.
- **Settings:** frames on every action / key moments only / off; quality tier; daily cap (shared with the autopilot).
- **UI:** the frame sits with its turn in the story (desktop and phone), with «Перерисовать» and «Скрыть»; frames of past
  turns stay with them after a reload. The shot text is not shown to the player.
- Frames are stored per turn as public assets with versions, bound to the timeline (a loaded save shows its own frames).

## 5. Illustrated chronicle (§10.2)

A readable book of the campaign: sessions as chapters, the story text with its frames. Use the session recaps that exist
today; Stage 4 adds chapter titles and «Ранее в…» — read them when present, never require them.

## 6. Owner review pack

The same 10-turn synthetic scene in three styles (one of them the line-art preset), with frames and anchors, published as
screenshots in `docs/screens/stage-v/`, plus the noir sample in its own style. Measured: time from first word to frame,
cost per frame and per turn, consistency scores with and without references.

## 7. Fixes from the planner's review of the first pack (do before the final checks)

1. **No drawn frame in the review screens.** `game-desktop`, `game-phone` and `game-moment-desktop` all show the empty
   «кадр рисуется…» box; only the strip has a thumbnail. Find out whether the capture is too early or the current frame
   does not load in the preview, fix it, and recapture so the main frame is a real picture (the moment screen shows the
   key-moment frame).
2. **One stage, not two pictures.** Today the place header (~300 px) and the frame box (~470 px) stack, so the story
   starts around 1050 px on desktop and is cut by the tab bar on the phone. The live frame takes the header's place: the
   place picture shows until the frame is ready, then the frame fades in; the place title, time and «Герой и партия»
   stay over it. No empty box at all — with frames off or nothing drawn yet, the header stays as it is. «Перерисовать»,
   «Скрыть», «Хроника» and the strip of earlier frames sit in one compact row under the stage. Check: at 1440×900 the
   first story paragraph is visible without scrolling; at 390×844 the stage is at most about 40% of the screen height
   and the story starts above the tab bar.
3. **People without a portrait.** In the noir re-run Velvet has no anchor: t07 draws her as a woman, t08 as a man in a
   leather jacket, and t07 adds a man nobody asked for. (a) A named person who appears in a frame without a portrait gets
   a portrait anchor queued automatically (within the daily cap), so later frames have a reference. (b) Until then the
   prompt gives that person's gender and visible looks taken from the public text (pronouns, described appearance);
   never invent them. (c) An anchor's approved appearance text keeps visible traits — skin tone, hair, build, age range;
   they are appearance, not nationality, and the softened re-submit keeps them too. In t10 Dana, with three references,
   comes out light-skinned — check that (c) fixes it.
4. **Prompt hygiene.** The people line uses «person 1/2» but the action still says «Dana stands…», «Velvet's smile…»:
   write the action with the same labels or short descriptors so the model knows who is who. Fields are cut mid-word
   («Private investigator i», «toward the o»): cut on a word boundary or raise the caps.
5. Re-run the noir sample (10 turns) and the oil scene (20 turns) after these fixes, rescore, recapture every screen,
   then the final checks and push. Report the before/after people scores and show t07, t08 and t10 again.

## Budget and checks

Paid image and small-model calls within **$25**, stopped by a guard; report every call's cost. Images only from synthetic
campaigns. Keep research-grade records of paid runs in `docs/runs/` as in `STAGE_4.md`.
Done when: typecheck, lint, test, build pass; frames, styles and the chronicle work on the preview samples and on a
PGlite-backed test campaign; screenshots captured with the overflow check passing on phones; a turn is never slower with
frames on. Commit in small steps, push `claude/stage-v-visuals` regularly; nothing to `main`, never the owner's database.
Update `docs/UI_DATA_NEEDS.md` and add a Stage V section to `DEV_STATUS.md`. Report in English: what changed, the numbers,
the spend, what the owner should look at first, known limits.

## 8. Polish stage (2026-10-17): one picture path, «Скрыть», the lightbox, «Кадр сцены»

Done on `claude/polish` (group 5 of `POLISH.md`; the picture models and the prompt compiler belong to the parallel
`claude/picture-models` session and were not touched here):
- **One picture path for every button.** The party's «Перерисовать портрет», the character screen's portrait and item
  redraws, the holdings' redraw, the records page's item picture and the map's «Иллюстрация места» all draw through the
  Stage V store (`src/components/registry/redraw-anchor.tsx` → `pictures.anchor`, trigger `manual`, the campaign's style,
  the quality tier, priced, within the daily cap; the cap is explained instead of a dead button). The legacy
  `GenerateVisual` / `GenerateMap` path left the player's screens; the atlas artwork («Создать карту») has no Stage V
  composition yet and left the map screen with it (listed under «Needs the owner»).
- **The «OpenAI draws the anchors» trap.** The setting is gone from the picture settings; a stored `provider: "openai"`
  reads as fal. OpenAI images come back, if at all, as one more Stage V model selected per tier (the bake-off's call).
- **«Кадр сцены»** under the composer draws or redraws the Stage V frame of the current turn and scrolls to the frames
  panel; the legacy FRAME panel and the video block left the game screen (video returns with the video stage, built on
  Stage V frames).
- **«Скрыть»** hides every ready version of the turn's frame (`frameFor` never shows a hidden version); «Показать» brings
  the newest back; the chronicle follows the same rule.
- **The strip lightbox.** A thumbnail (or the frame itself) opens the frame large with the turn's first line, «←/→»
  through the frames, Esc or the scrim to close, and a link to the saved turn.
Not done here: the anatomy check on anchors before auto-accept (§7 of POLISH's findings, not in group 5's list); the
negative «no lettering» prompt line (the prompt compiler's); the one-stage layout is group 6.
