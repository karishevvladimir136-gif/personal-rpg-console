# Music stage — the review pack

Everything here was generated on 2026-10-20 from the two **synthetic** sample worlds («Мир Шва» and «Neon & Rain»);
no owner data. Every paid call is in `../music-ledger.md`. The MP3s are small review copies (64 kbps for the
comparison, 96 kbps for the soundtracks); the app itself stores the provider's own file in the private bucket.

| Folder / file | What |
| --- | --- |
| `compare.md`, `compare/` | The same five moods (travel, tension, combat, warm, mystery) of «Мир Шва» on seven models: Lyria 3 Pro, Lyria 3.5, ElevenLabs Music 2.5, Stable Audio 3, Stable Audio 2.5, Lyria 2, ACE-Step. The table has the length, time, price, loudness and the seam levels of every file. |
| `shov/`, `shov/moods.md` | The «Мир Шва» soundtrack: 15 moods, take 1 on Lyria 3 Pro, take 2 on Lyria 3.5, a third ambient take on Stable Audio 3 for the seven calm moods. |
| `noir/`, `noir/moods.md` | The «Neon & Rain» soundtrack, the same plan in the noir world's musical style. |
| `*-compare-shov.json`, `*-pack-shov.json`, `*-pack-noir.json` | The research records: every request's prompt, model, seed, price, elapsed time, the provider's content type and result keys, the measured length, loudness and seam. |
| `../music-session-log.md` | The 20-turn synthetic session: which mood played when and why. |

How to listen: open a folder, play `travel-1.mp3` against `travel-2.mp3` (Lyria 3 Pro against Lyria 3.5), then the
same mood in the other world — the style must change with the world. In `compare/` the file names end with the model.
What to listen for: does the mood fit, is there a tune that would wear out after ten minutes (a loop plays long), is
the texture steady enough to crossfade into itself, and are there vocals (there should be none).

The player's loop: no endpoint loops natively, every model fades out or cuts at the end. The player finds where the
music effectively stops (the last 50 ms window within 24 dB of the track's loud windows) and restarts the track three
seconds before that point with a crossfade, so the seam is an overlap, not a dip.
