# Music stage — owner report (2026-10-20)

Branch `claude/stage-music` from `origin/claude/session-2-prep` (d74b6c6). Spec: `docs/stages/STAGE_MUSIC.md` on
`origin/claude/handoff`. A cloud session (`docs/CLOUD.md`); nothing went to `main`, no owner database was touched.
Resume notes: `docs/runs/music-progress.md`; the ledger: `docs/runs/music-ledger.md`; the acceptance checklist (in
Russian): `docs/runs/music-acceptance.md`; the review pack: `docs/runs/music-review/`.

## In one paragraph

The game now has a soundtrack that follows the scene. Once per world the owner presses «Сгенерировать саундтрак» in
the settings: the app writes a pack of 15 moods × 2 takes of instrumental, loop-friendly music in the world's own
musical style (the style text is editable; the app proposes one from the world's premise) on fal — Lyria 3 Pro by
default, any of seven models by choice — in the background, one track per request, under a money cap per pack, never
blocking a turn. In play, the player reads only what the player can see (the scene kinds and tension the DM already
records on the committed turn, a public fight, the clock, the current place) and picks a mood with hysteresis: a fight
switches at once, a calm change waits two turns or 90 seconds, so the music never flips on every turn. Tracks crossfade;
each loops on itself with a three-second overlap placed before its fade-out; the music ducks under a video clip; nothing
plays before the first click. One control in the header: volume, mute, «Музыка выкл», pin a track, skip. The owner's
own tracks (Suno and the like) upload with mood tags and mix with the pack. For the review: the same five moods on seven
models, and the full soundtracks of «Мир Шва» and «Neon & Rain», as small MP3s with a table of what each file is.
Added the same day, on the owner's word: **the ambient layer** — the place's sound and the weather under the music (see its
section). Paid: **$19.82 of the $50 cap** ($14.40 for the soundtracks and the review, within their $40; $5.42 for the ambient
layer, within its $10), every call in the ledger.

## What to click first

1. Open any folder in `docs/runs/music-review/shov/` and `noir/` and play `travel-1.mp3` against `travel-2.mp3`: take 1
   is Lyria 3 Pro, take 2 is Lyria 3.5. Then the same mood in the other world. `compare/` has the five moods on all
   seven models (file names end with the model). `README.md` there says what to listen for.
2. In the app (your machine, after the migration applies): **Настройки → Музыка**. Press «Предложить по миру», edit the
   style text if you like, keep Lyria 3 Pro and 2 takes, press «Сгенерировать саундтрак». The pack writes itself in the
   background while any page of the campaign is open (about 30 requests, 20–30 s each, ≈ $2.40 at the list prices); the
   mood grid shows progress; «Остановить» cancels the rest.
3. Play a turn. The note icon in the header (next to the save icon) opens the player: now playing, the mood and why,
   volume, mute, «Музыка выкл», «Дальше», «Закрепить». The browser forbids autoplay: the music starts after your first
   click anywhere on the page.
4. «Свои треки» under the same block: pick an MP3/WAV/OGG (up to 25 MB), tick its moods, «Загрузить».

## The decision on models

The stage asked for the best models by quality and loop seams, price not a criterion within the cap, with the owner
hearing the finalists. The numbers are in `docs/runs/music-review/compare.md`; what they say:

| Model | Output | Time per 60 s | Loudness | Price per 60 s | Verdict |
| --- | --- | --- | --- | --- | --- |
| **Lyria 3 Pro** (`fal-ai/lyria3/pro`) | MP3 | ~22 s | −11 LUFS | $0.08 | **The default.** Top of the instrumental leaderboards (the stage brief); full, cinematic, follows the style text; the length follows the prompt (58–60 s asked 60). Tails fade out — the player trims them. |
| **Lyria 3.5** (`google/lyria-3.5`) | MP3 | ~23 s | −12 LUFS | $0.10 | **Take 2 of every mood**, so the pack itself is a listening comparison. The newest Lyria; ends in silence (trimmed); its content checker refused the very same prompt three times out of 80 and passed it on retry — the pack handles that as a failed take, «Сгенерировать заново» fills it. |
| **Stable Audio 3** (`fal-ai/stable-audio-3/medium/text-to-audio`) | MP3 | ~8 s | −15 LUFS | $0.04 | **A third ambient take for the seven calm moods** (quiet, night, mystery, dread, sorrow, warm, explore): steady textures, exact length, cheap and fast. |
| ElevenLabs Music 2.5 (`elevenlabs/music/v2.5`) | MP3 | ~8 s | −15 LUFS | $0.60–0.80/min | A finalist by sound (the owner's ear decides): exact lengths and a section plan, but ten times the price per track and it bills whole minutes; in the catalogue, not in the default plan. |
| Stable Audio 2.5 | WAV | ~6 s | −14 LUFS | $0.20 | Superseded by Stable Audio 3 (same house, MP3, a fifth of the price). |
| Lyria 2 | WAV | ~31 s | −23 LUFS | $0.10 per 30 s | 30-second beds only, quiet; not for loops. |
| ACE-Step | WAV | ~9 s | −15 LUFS | $0.0002/s | Drafts and volume; counted at $0.005/s to be safe. |

Loop seams: **no endpoint loops natively.** Every model fades out or cuts at its end (the «tail» column of the table:
−45 to −80 dB against a −14 dB body). So the player does what the stage allowed: it finds where the music effectively
stops (the last 50 ms window within 24 dB of the track's loud windows), restarts the track three seconds before that
point with a crossfade, and the seam is an overlap. The prompt asks for «ending as it begins»; Lyria mostly obliges.

Facts learned the hard way (all in `src/lib/audio/models.ts` with the date): fal's model pages are outside the cloud
VM's network list, so every endpoint's fields were read from the queue's own validation replies (wrong-typed bodies the
worker rejects before generation; 19 such probes, $0 each, in the ledger). Lyria 3 and 3.5 refuse a negative prompt
although the field exists; ElevenLabs 2.5 wants a chunk plan and refuses `force_instrumental` next to it; a refusal at
submit (HTTP 422) is never queued and is settled at $0, any later failure stays counted at the list price.

## What changed, part by part

**The library (`202610210301_music_stage.sql`, prefix `2026102103` as the stage asks — renumbered after the other
branches' `202610200071` turn-lease fix appeared; additive).** `rpg_private.music_settings` per campaign
(on/off, the model, takes per mood, the cap per pack, the style text), `rpg_private.music_packs` (one generation run of
a world's — or, without a bound world, a campaign's — soundtrack: version, the style text it was written with, status,
cost) and `rpg_private.music_tracks` (generated takes and uploads: moods, status queued → generating → ready/failed,
the storage path, length, cost, the prompt — private). One RPC `public.rpg_music` (service role only): read, settings,
pack create/cancel, the next queued track, the claim that counts the list price against the pack's cap *before* the
request (a crash never repeats a paid request past the cap), ready/failed, upload, hide, tag. History: a finished track
never changes except its hidden flag, title and tags; packs keep every version. The private bucket accepts audio up to
40 MB. Nothing here reads DM-private state. Proof: the migration test in `tests/music-stage.test.mjs` (the projection
never carries a prompt, a seed or a storage path; the cap; the transitions; the other user refused).

**The job engine and the API.** `src/lib/audio/music-job.ts` plans a pack (every mood × takes, prompts from the style
text and the mood's hint, list prices counted), generates one track per call (claim → one fal request → bytes to the
bucket → the row), stores an upload (audio by its first bytes, the length from the header or the MP3 frames). The API
`/api/music`: state, the public scene signal, the bytes of a ready track (same-origin, so the browser can decode it),
settings, generate/stop/run, hide/tag, a multipart upload. Keys never leave the server; a client sees projections.

**The mood (`src/lib/audio/mood-select.ts`).** The signal is what `finish_turn` already records on the committed turn
in its public projection — `sceneKinds`, the server's tension reading, the DM's `nextTension` hint (the DM choosing a
track, no new tool), the player's moment — plus the public encounter list, the world clock and the current place's
public name (there is no stored place kind: a few word stems make tavern, market, town, ship, wild, underground,
sacred). Priority: a fight first (climax when the tension or the moment says so), then mystery, tension, trade,
humour, a quiet talk (warm), quiet, travel, exploration, conversation, then the place and the hour. Hysteresis: a jump
upward to a fight or by two energy steps switches at once; anything else waits for two turns of the same wish or 90 s
of the current mood; inside a fight only the two-turn rule, so combat ↔ climax never flaps. Fifteen moods: дорога,
открытие, тайна, напряжение, бой, кульминация, тишина, тепло, шутка, торг, город, ночь, жуть, горе, победа; a mood with
no track in the pack falls back to its nearest neighbour.

**The player (`src/lib/audio/web-player.ts`, `src/components/registry/music-player.tsx`).** Web Audio: decoded tracks
on gain nodes, a four-second crossfade between moods, the self-crossfaded loop above, ducking to 20 % under any playing
`<video>` with sound on the page (no coupling with the video code), at most three decoded tracks in memory (phones),
nothing before the first gesture. The provider sits in the shell: it polls the public scene signal every 8 s (3 s while a
turn is in flight) and at once after a commit, keeps the device preferences (volume, mute, off) in the browser, and
pumps a generating pack one request at a time while any page of the campaign is open. The header control shows the mood
and opens the popover; a «why» log sits under the settings block.

**The settings block (`src/components/registry/music-settings.tsx`).** Switch, style text with «Предложить по миру»
(from the world's premise and visual style: steampunk → clockwork orchestra, neon noir → synthwave jazz, fantasy, space,
sea, frontier, horror, else cinematic), the model with its price per track, takes per mood (1–3), the cap per soundtrack
(default $8), «Сгенерировать саундтрак» with the estimate, the mood grid with progress, «Остановить», the uploads, the
spend, the «why» log.

**Shared files touched:** `shell.tsx` (the provider and the control), `settings-screen.tsx` (one import, one block),
`tests/integration-saves.test.mjs` (the migration list). The campaign page router was not needed. Not touched: the DM
loop, the context, world records, pictures, video.

## The ambient layer (the owner's addition of 2026-10-20)

A second, quieter layer under the music: **the place's sound and the weather**, from the public records only. The place's
sound comes from the current place's public name and description (the head word of the name decides first — «Комната
над лавкой» is a room, «Лес у реки» a forest; then the whole name, then the description; built places before open
country) and the hour (a forest at night, open country at night is a camp): **24 place kinds** — tavern, market, town,
village, forge, temple, library, room, cave, mine, sewer, forest by day, forest at night, open country, mountains,
river, sea shore, ship's deck (the open sky counts as the airship's deck in this world), engine room (steam engines),
camp, ruins, swamp, desert, neon city. The weather comes from the committed turn's public narration and the place's
description: **5 weathers** — rain, downpour, wind, snow, thunderstorm («громче» is not thunder); it holds for two turns
after the word disappears, so one turn without the word is not the sun. Nothing hidden is read.

Generation: once per world, on `fal-ai/elevenlabs/sound-effects/v2` — 22-second loops with the endpoint's own seamless
`loop` flag (its fields read from the queue's validation reply: `text`, `duration_seconds` ≤ 22, `loop`,
`prompt_influence` ≤ 1, `output_format`; the page says $0.002 a second, counted at $0.005) — and, for the owner's ear,
60-second soundscapes on `fal-ai/stable-audio-25/text-to-audio` for four kinds (forest at night, engine room, cave,
shore). The effects model delivers very quiet files (−40 to −65 LUFS): the player applies a make-up gain per loop from
the decoded samples (up to ×40), the review copies are normalised to −23 LUFS. The ambient pack is a second pack of
the same shape as the music's (`layer = 'ambient'`, tags are place kinds and weathers instead of moods, validated per
layer in SQL), generated the same way — one request per call, counted against the cap before the request, in the
background — and both layers may generate at the same time.

In play: two more channels in the player (the place and the weather), each with its own crossfade and loop; the layer
sits at 60 % under playing music and ducks under video like the music; its own switch and volume in the player's
popover (the rain-cloud button) and a campaign switch in the settings; «Сгенерировать звуки мест» with the estimate
(29 kinds × $0.11 ≈ $3.19 counted) and a progress grid. The session log's last column shows the layer on the 20-turn
scene: the cave, then the airship's deck with wind and snow from the text, then Geneva.

Review: `docs/runs/music-review/ambient/shov/` (24 place kinds + 5 weathers + 4 long soundscapes) and
`ambient/noir/` (13 kinds a noir city needs), `kinds.md` in each. 47 loops, none failed; **$5.42** counted.

## The soundtracks and the session log

- `docs/runs/music-review/shov/moods.md` and `noir/moods.md`: 15 moods × 2 takes + 7 ambient takes = 37 tracks a world,
  with the model, length, loudness and cost of each; the review copies at 96 kbps. Three takes failed on the first run
  (one fal «downstream service error», two Lyria 3.5 content-checker refusals of the same prompt) and were re-run
  (the bench re-runs a mood whole, so take 1 of those three moods is also a second take).
- `docs/runs/music-session-log.md`: the 20-turn «Мир Шва» scene with its public signals labelled, replayed through the
  chooser — **9 switches in 20 turns**, each with its reason (the road → warm after two turns of a quiet talk → tension at
  the sighting → climax at the first blow → humour in the galley once the climax played its minimum → … → the fight in
  Geneva at once).

## Checks

typecheck pass · lint pass (zero warnings) · `tests/music-stage.test.mjs` 12/12 (the ambient layer included) · build pass · screenshots of the
settings and game screens, desktop and phone, with the overflow check passing (`docs/screens/stage-5/settings-*.jpg`,
`game-*.jpg`, `noir-*`) · the full suite on the final code: FULLSUITE2.

## Money

Every call is in `docs/runs/music-ledger.md` (193 entries): 22 validation probes at $0; the comparison, 35
tracks and 8 attempts refused at submit ($0), **$8.10**; the «Мир Шва» pack $3.34 and the «Neon & Rain» pack $3.16
(37 tracks each; the three failed takes were re-run, and as the bench re-runs a mood whole, take 1 of those moods was
rewritten too: $0.54); the ambient layer 47 loops **$5.42**. **Total $19.82 of $50** ($14.40 of the $40 for the
soundtracks and the review, $5.42 of the $10 for the ambient layer). Prices are list prices counted before each call
and never under-counted (ACE-Step, ElevenLabs Music and the sound-effects model are counted at the higher of two
published figures), so the real bill is at or below this.

## Known limits and what the owner decides

- **The ear.** I could not listen. The choice of Lyria 3 Pro as the default and Lyria 3.5 as take 2 rests on the brief's
  leaderboard note, the measured files (length, loudness, seams, formats) and the price only within the cap. If the
  owner prefers ElevenLabs or Stable Audio 3 for some moods after listening, it is one select in the settings before
  pressing «Сгенерировать заново»; the catalogue stays.
- **Loudness differs by model** (Lyria about −11 LUFS, Stable Audio 3 about −15 to −19). The player has no per-track
  normalisation yet; the volume slider covers it. A later polish could store a gain per track from the length reader.
- **Lyria 3.5's content checker** refuses the same prompt now and then (3 of 80). A refused take fails at $0;
  «Сгенерировать заново» writes a new version (the old one stays in history) — a «retry the failed takes only» button
  is a small later addition.
- **One pack per world**, as asked; a campaign without a bound world gets its own. The style text is per campaign in
  the settings and is copied into the pack it generates.
- **The DM choosing a track** is read from its `nextTension` hint; no new DM tool, as the stage required.
- **Ambient word lists** are stems in two languages; a place whose name and description name nothing known plays no
  place sound (the last known one stays). The DM's `upsert_place` has no kind field, so the lists are the only source
  until the records carry one.
- Ambient sound and real-time Lyria are out of scope, as the stage said.
- **Manual setup:** none beyond pulling the branch; the migration applies with the others. A `FAL_KEY` in `.env.local`
  is already there for pictures.
