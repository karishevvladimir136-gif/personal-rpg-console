# Music stage — progress (resume from here)

Branch `claude/stage-music` from `origin/claude/session-2-prep` (d74b6c6). Spec: `docs/stages/STAGE_MUSIC.md` on
`origin/claude/handoff`. Cloud session (`docs/CLOUD.md`, environment `rpg-console`), started 2026-10-20 in parallel with
the fix run and the 2D slice. Paid cap: **$50** (the stage file says $40; the owner's task message of the same day says
$50), enforced by the bench's guard and `docs/runs/music-ledger.json` (every fal call, the free validation probes at $0
included; `music-ledger.md` is rewritten from it). Synthetic worlds only («Мир Шва», «Neon & Rain»); no owner database
here (the app's own generation path runs on the owner's machine through the normal settings screen).

A restarted session: read this file, `git log` of the branch, continue at the first part not marked done. Never
repeat a paid step marked done.

| Part | State | Notes |
| --- | --- | --- |
| 0 — endpoints and fields | done | fal's model pages are outside the VM's network list; each endpoint's fields and enums were learned from the queue's own validation replies (wrong-typed bodies, rejected before generation, $0 — 19 probes in the ledger). Findings in `src/lib/audio/models.ts`: Lyria 3 / 3.5 refuse `negative_prompt` (the field exists); ElevenLabs 2.5 wants a chunk plan (`chunks[].text/duration_ms/positive_styles`) and refuses `force_instrumental` next to it; Stable Audio 3 takes `duration`, `seed`, `negative_prompt`, `output_format=mp3`; prices from the pages as quoted by search, the higher figure counted where two exist |
| 1 — the comparison | done | `node scripts/music-bench.mjs compare --world shov --moods travel,tension,combat,warm,mystery --seconds 60` on seven models: 35 tracks, $8.10 counted; `docs/runs/music-review/compare.md` (the table) and `compare/*.mp3` (64 kbps review copies); the records `docs/runs/music-review/*-compare-shov.json` |
| 2 — the library: the music migration (`202610210301`), the job engine, the API | done | `supabase/migrations/202610210301_music_stage.sql` (`rpg_private.music_settings / music_packs / music_tracks`, `public.rpg_music`, the bucket takes audio up to 40 MB); `src/lib/audio/music-job.ts` (plan a pack, one paid track per call counted against the pack's cap in SQL before the request, uploads); `src/lib/server/audio/music-store.ts`; `src/app/api/music/route.ts` (state, scene signal, track bytes same-origin, settings, generate/cancel/run, hide/tag, multipart upload) |
| 3 — the mood from the public scene | done | `src/lib/audio/mood-select.ts`: `signalFromPlay` reads the committed turn's public projection (`sceneKinds`, `stats.depthTension`, `nextTension`, `playerMoment`), the public encounter list, the clock and the current place's public name; `chooseMood` by priority; `stepMood` with hysteresis (a fight or a two-step jump at once, else two turns or 90 s; inside a fight only the two-turn rule); nothing DM-private is read |
| 4 — the player | done | `src/lib/audio/web-player.ts` (Web Audio: decoded tracks on gain nodes, 4-s crossfade between moods, a self-crossfaded loop 3 s before the effective end — the fade-outs of every model are trimmed by `effectiveEnd` —, ducking under a playing `<video>` with sound, nothing before the first gesture, at most three decoded tracks in memory); `src/components/registry/music-player.tsx` (the provider in the shell, the header control: mood, volume, mute, «Музыка выкл», pin, skip; the scene poll every 8 s / 3 s while a turn is in flight and at once after a commit; the generation pump); `src/components/registry/music-settings.tsx` (the settings block: on/off, the world's musical style with a suggestion from the records, the model, takes per mood, the cap per soundtrack, generate/stop, the pack by mood, own uploads with mood tags, hide, the spend, the «why» log) |
| 5 — the two soundtracks | done | `node scripts/music-bench.mjs pack --world shov|noir --variants 3 --models-by-variant lyria3/pro,lyria-3.5,stable-audio-3 --extra-take-moods quiet,night,mystery,dread,sorrow,warm,explore --kbps 96`: 15 moods × 2 takes (take 1 Lyria 3 Pro, take 2 Lyria 3.5) + a third ambient take on Stable Audio 3 for the seven calm moods = 37 tracks a world; `docs/runs/music-review/shov/` and `noir/` with `moods.md` |
| 6 — the session log | done | `node scripts/music-session-log.mjs` → `docs/runs/music-session-log.md` (the 20-turn «Мир Шва» scene with labelled public signals, 9 switches in 20 turns); the labels in `test-fixtures/music/shov-20-turn-signals.json` |
| 7 — tests | done | `tests/music-stage.test.mjs` (11 tests: models and bodies, audio lengths, prompts, moods, the chooser, hysteresis, the player's decisions and `effectiveEnd`, the fal adapter on a fake queue, the job engine on fakes with the cap, the music migration on PGlite, the session log); `tests/integration-saves.test.mjs` lists the migration |
| 8 — the ambient layer (the owner's addition; «давай сразу») | done | `src/lib/audio/ambient.ts` (24 place kinds + 5 weathers with hints; `placeSound` from the public name/description and the hour, `weatherFrom` the public text, `stepAmbient` holds the weather two turns); the migration carries `layer` on packs and tracks with tags validated per layer and the read's `ambientPack`; `fal-ai/elevenlabs/sound-effects/v2` in the catalogue (22-s loops, `loop: true`), `planAmbientPack`, `music.generate {layer: "ambient"}`; the player's `place` and `weather` channels with a make-up gain (`makeupGain`, up to ×40: the effects files are −40 to −65 LUFS), 60 % under music, ducked under video; the popover's rain-cloud row; the settings' «Звуки места и погода» block; the session log's last column; `node scripts/music-bench.mjs ambient` → `docs/runs/music-review/ambient/shov|noir` (47 loops, $5.42, review copies normalised to −23 LUFS) |
| 9 — the renumbering | done | `202610210371_music_stage.sql` → `202610210301_music_stage.sql` (prefix `2026102103`; the turn-lease fix on the other branches took `202610200071`); references in the tests and docs updated |
| final — checks, screenshots, docs, push | see the report | typecheck, lint (zero warnings), the stage's tests, the full suite, build; `docs/runs/music-report.md`, `music-acceptance.md` (Russian), `music-ledger.md`, `DEV_STATUS.md` |

## Paid calls log

Every entry, with its counted and settled price, is in `docs/runs/music-ledger.md` (rewritten from the JSON by the
bench). In short: 22 validation probes at $0; the comparison 35 tracks + 8 refused-at-submit attempts at $0 — $8.10; the
«Мир Шва» pack $3.34 and the «Neon & Rain» pack $3.16 (re-runs included); the ambient layer 47 loops $5.42. Total
$19.82 of $50.

## Shared files touched (the stage's rule: list them)

- `src/components/registry/shell.tsx` — the `MusicProvider` around the live shell, the `MusicControl` in the desktop
  header tools and in the phone top bar (the DM model pill moved under it on phones).
- `src/components/registry/settings-screen.tsx` — one import and the `<MusicBlock>` under the pictures block.
- `tests/integration-saves.test.mjs` — the migration list.
- No change to the campaign page router (the music API has its own route; no new screen).
- Not touched: the DM loop, the context, world records, pictures, video code.
