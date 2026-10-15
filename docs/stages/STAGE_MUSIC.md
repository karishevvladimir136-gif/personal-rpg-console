# Stage «Музыка» — a soundtrack that follows the scene

Runs in a cloud session (`docs/CLOUD.md`) after the video stage, on `claude/stage-music` from the latest finished media
branch. Do not touch the DM loop, the context, world records, pictures or video code; this stage owns new audio files
(`src/lib/audio/*`, a player component), a music block in the settings screen and one small player control in the
shell.

## What the owner gets

Music like a good table DM puts on: calm while the party walks, tense in an interrogation, epic in a battle, warm in a
quiet scene with a companion. It changes smoothly and never gets in the way.

- **Moods from what is visible.** The mood comes from the public scene: the scene kinds `finish_turn` already records
  (combat, conversation, mystery, exploration, quiet, humour, trade, travel), the tension class from Stage 4 when present,
  the kind of place and the time of day. The DM may also choose a mood the way a DM picks a track («тревога нарастает»).
  Music never reveals a hidden fact: no ambush music because a private note says an ambush is coming.
- **A soundtrack per world.** Once per world (and again when its style changes) generate a pack of instrumental,
  loop-friendly tracks in the world's musical style — a steampunk Lisbon is not a noir city — about 10–15 moods with
  2–3 variants each. Playback afterwards costs nothing. Candidate models (check current docs and terms): Google Lyria
  (per-track), ElevenLabs Music (per minute, instrumental flag), Stable Audio; Suno has no official API. Pick by
  measured quality, loop seams and price; Google adds a SynthID watermark, which is fine for personal use.
- **Your own music.** Upload your own tracks (for example made in Suno) and tag their moods; they mix with the pack.
- **Player.** Crossfades between moods with hysteresis (no switch on every turn), volume, mute, «музыка выкл», pin a
  track, skip. Music ducks under a video clip's own sound. Works on the phone; never autoplays before the first click,
  as browsers require.
- Optional later layer, not in this stage: ambient sound (rain, a tavern, ship engines) and real-time generated music
  (Lyria RealTime, experimental).

## Checks

Paid generation within **$15**, stopped by a guard; report every call's cost; synthetic worlds only. A review pack: the
«Мир Шва» and «Neon & Rain» soundtracks with their mood lists, and a 20-turn synthetic session log showing which mood
played when and why. typecheck / lint / test / build pass; push `claude/stage-music` only, never `main`, never the owner's
database. Report in English.
