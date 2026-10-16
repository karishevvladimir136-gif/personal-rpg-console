# Stage «Оживить кадр» — video on demand

Runs in a cloud session (`docs/CLOUD.md`) **after Stage V is finished**, on a branch `claude/stage-video` from
`origin/claude/stage-v-visuals`. Stage 4 may still be running on `claude/stage-4-dm`: do not touch the DM loop, the
context, world records or any screen block other than the frame and video UI. Plan: `REBUILD_PLAN.md` §15 row
«Оживить кадр».

Video already exists (built 2026-09-28): fal `bytedance/seedance-2.5/us/image-to-video`, 10 s, 720p, with sound, from an
accepted scene frame; one live clip cost about $5.60. Code: `src/lib/scene-video/*`, `src/lib/server/media/video-*`,
`src/components/visual-frame/current-scene-video.tsx`, migration 29. It is enabled by `RPG_VIDEO_ENABLED` plus a one-time
SQL enable. Keep what works; extend it.

## What the owner gets

- An «Оживить» button on every live frame and on the scene frame. A dialog to choose:
  - **model** — from a catalog of video models with their own capabilities (maximum seconds per generation,
    resolutions, audio, price formula), never one hardcoded model;
  - **duration** — any length up to a sane cap (for example 60 s). Up to the model's maximum it is one generation;
    longer clips are built from segments where each segment starts from the last frame of the previous one, then
    joined into one file with the sound joined smoothly;
  - **resolution** and **sound** on or off.
- The **price is shown before anything runs** and needs a confirmation; a daily video cap in the campaign's picture
  settings. Nothing runs automatically.
- The job runs in the background and never blocks a turn; progress is visible; the clip stays with its turn (versions,
  a loaded save shows its own clips) and appears in the illustrated chronicle.
- The prompt comes from the frame's shot and the turn's player-visible text only; hidden facts never enter it.

## Work

1. The model catalog: check the current fal docs for Seedance 2.5 and two or three newer or cheaper image-to-video models;
   record for each: endpoint, maximum duration, resolutions, audio, price formula, typical time. SQL validators accept
   the catalog's models (additive migration).
2. Segments and joining: last-frame extraction and joining need a video tool that also works on the owner's Windows
   machine (for example a packaged ffmpeg from npm); measure the seams.
3. UI: the dialog, progress, the clip in the story and in the chronicle; phone layout.
4. Owner review pack: the same frame animated by each catalog model at 10 s, plus one 30 s clip from segments; seams,
   consistency, time and cost of each, in `docs/screens/stage-video/` with links to the clips.

## Budget and checks

Paid calls within **$40** (video is expensive), stopped by a guard; report every call's cost. Synthetic campaigns only;
research-grade records of paid runs in `docs/runs/`. typecheck / lint / test / build pass; screenshots with the phone
overflow check; a turn is never slower with video enabled. Push `claude/stage-video` only, never `main`, never the owner's
database. Report in English: the catalog with numbers, how segments look, the spend, known limits.

## Note from the first sandbox play (planner, 2026-10-16)

The game screen still shows the legacy FRAME/video block under «Кадр сцены» («Примите FRAME текущей сцены, прежде чем
создавать видео», «Создание видео недоступно. Нужны включённая серверная модель и лимит расходов»). Build «Оживить
кадр» on the Stage V frames (the current live frame or any frame in the strip and the chronicle), with its own price
and cap, and remove the legacy FRAME/video block from the player's screen (the polish stage hides it first).
