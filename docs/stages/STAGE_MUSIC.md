# Stage «Музыка» — a soundtrack that follows the scene

Runs in a cloud session (`docs/CLOUD.md`, environment `rpg-console`) — started 2026-10-20 by the owner's decision, in
parallel with the fix run and the 2D slice. Branch `claude/stage-music` from `origin/claude/session-2-prep` (`d74b6c6`).
Do not touch the DM loop, the context, world records, pictures or video code; this stage owns new audio files
(`src/lib/audio/*`, a player component), a music block in the settings screen and one small player control in the
shell. Living next to the other two sessions: migrations with the prefix `2026102103` only; shared files touched (the
shell, the settings screen, the campaign page router) listed in the report; the scene signal is read from what
`finish_turn` already commits (scene kinds, tension) and from the public campaign state — no new DM tool. Report in
`docs/runs/music-report.md`, progress in `docs/runs/music-progress.md`, the ledger in `docs/runs/music-ledger.md`;
end with a Russian acceptance checklist `docs/runs/music-acceptance.md`.

**Generation on fal (all reachable with the existing fal key; check each endpoint's docs for loop/extend before relying
on seamless loops):** `fal-ai/lyria3/pro` ($0.08 a track, up to 3 min, top of the instrumental leaderboard),
`fal-ai/elevenlabs/music` (`force_instrumental`, 3 s–10 min, section plan with fixed durations — the best fit for cues
that must hold a runtime; $0.80 an output minute), `fal-ai/stable-audio-25/text-to-audio` (long evolving textures,
WAV, seeds), `fal-ai/lyria2` (30-s ambient beds, seeds), `fal-ai/ace-step/prompt-to-audio` (instrumental toggle,
$0.0002/s — drafts and volume). Compare on the same mood list; the owner hears the finalists (publish the review pack as
files in `docs/runs/music-review/` — small MP3s, synthetic worlds only). Loop seams: if no endpoint loops natively,
generate with a few seconds of overlap and crossfade in the player.

## What the owner gets

Music like a good table DM puts on: calm while the party walks, tense in an interrogation, epic in a battle, warm in a
quiet scene with a companion. It changes smoothly and never gets in the way.

- **Moods from what is visible.** The mood comes from the public scene: the scene kinds `finish_turn` already records
  (combat, conversation, mystery, exploration, quiet, humour, trade, travel), the tension class from Stage 4 when present,
  the kind of place and the time of day. The DM may also choose a mood the way a DM picks a track («тревога нарастает»).
  Music never reveals a hidden fact: no ambush music because a private note says an ambush is coming.
- **A soundtrack per world.** Once per world (and again when its style changes) generate a pack of instrumental,
  loop-friendly tracks in the world's musical style — a steampunk Lisbon is not a noir city — about 10–15 moods with
  2–3 variants each. Playback afterwards costs nothing. **The owner wants the best models, not the cheap ones: choose
  by quality and loop seams only; price is not a criterion within the cap.** Candidates (check current docs and terms):
  the newest Google Lyria, ElevenLabs Music, Stable Audio; Suno and Udio have no official API. Compare them on the same
  mood list and let the owner hear the finalists; a different model per mood is fine if it sounds better. Google adds a
  SynthID watermark, which is fine for personal use.
- **Your own music.** Upload your own tracks (for example made in Suno) and tag their moods; they mix with the pack.
- **Player.** Crossfades between moods with hysteresis (no switch on every turn), volume, mute, «музыка выкл», pin a
  track, skip. Music ducks under a video clip's own sound. Works on the phone; never autoplays before the first click,
  as browsers require.
- **Ambient layer (owner, 2026-10-20: «давай сразу»).** A second, quieter layer under the music: the place's sound
  (a tavern, a forge, a forest at night, a stream, a mine, a ship, steam engines for a steampunk world) and the
  weather (rain, wind) from the public place record and the scene's time of day; loops of 30–60 s, crossfaded, ducked
  under music and video, its own volume and «выкл». Generated per place kind once (not per place): fal
  `fal-ai/elevenlabs/sound-effects` for short seamless loops (check its loop flag), `fal-ai/stable-audio-25` for long
  evolving soundscapes. The pack: 15–20 place kinds × 1–2 variants, plus 5–6 weathers. Never from hidden facts.
- Real-time generated music (Lyria RealTime) is **not** in this stage (owner, 09:10: «чисто эмбиент, без живой
  музыки»); the pack and the ambient layer are the whole deliverable.
  Paid generation cap for the whole stage: **$50** (the pack and the review within $40, ambient $10).

## Checks

Paid generation within **$50** (see the caps above), stopped by a guard; report every call's cost; synthetic worlds only. A review pack: the
«Мир Шва» and «Neon & Rain» soundtracks with their mood lists, and a 20-turn synthetic session log showing which mood
played when and why. typecheck / lint / test / build pass; push `claude/stage-music` only, never `main`, never the owner's
database. Report in English.
