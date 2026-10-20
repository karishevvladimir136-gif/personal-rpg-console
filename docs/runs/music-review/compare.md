# Model comparison — the same five moods of «Мир Шва» on seven fal music models

Generated 2026-10-20 by `node scripts/music-bench.mjs compare --world shov --moods travel,tension,combat,warm,mystery --seconds 60`. Every row is one paid call (the ledger holds them all, the failed attempts too). The files are review copies at 64 kbps in `compare/` (the app stores the provider's own file). «Seam» is the RMS level of the first and the last 0.4 s against the body: a tail far below the body is a fade-out (or silence), which the player trims before its loop seam (`effectiveEnd` in `src/lib/audio/web-player.ts`). Loudness is integrated LUFS (the first round's four travel rows were measured on the review copies after a parsing fix). The owner judges by ear; these numbers only say what the files are.

| Mood | Model | Output | Length | Time | Price | LUFS | Head / tail / body dB | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| travel | Lyria 3 Pro | mpeg | 60.0 s | 24 s | $0.080 | -11.8 | -15 / -43 / -14 | `shov-travel-fal_ai_lyria3_pro.mp3` |
| travel | Lyria 3.5 | mpeg | 62.7 s | 17 s | $0.100 | -11.6 | -16 / silence / -14 | `shov-travel-google_lyria_3.5.mp3` |
| travel | ElevenLabs Music 2.5 | mpeg | 60.0 s | 9 s | $0.800 | -14.5 | -34 / -74 / -18 | `shov-travel-elevenlabs_music_v2.5.mp3` |
| travel | Stable Audio 3 | mpeg | 60.0 s | 8 s | $0.040 | -18.9 | -32 / -22 / -21 | `shov-travel-fal_ai_stable_audio_3_medium_text_to_audio.mp3` |
| travel | Stable Audio 2.5 | wav | 60.0 s | 5 s | $0.200 | -13.5 | -20 / -75 / -17 | `shov-travel-fal_ai_stable_audio_25_text_to_audio.mp3` |
| travel | Lyria 2 | wav | 32.8 s | 31 s | $0.100 | -23.6 | -24 / -24 / -26 | `shov-travel-fal_ai_lyria2.mp3` |
| travel | ACE-Step | wav | 60.0 s | 14 s | $0.300 | -15.8 | -30 / -74 / -17 | `shov-travel-fal_ai_ace_step_prompt_to_audio.mp3` |
| tension | Lyria 3 Pro | mpeg | 58.4 s | 26 s | $0.080 | -10.9 | -36 / -48 / -14 | `shov-tension-fal_ai_lyria3_pro.mp3` |
| tension | Lyria 3.5 | mpeg | 59.6 s | 28 s | $0.100 | -11.2 | -24 / -79 / -14 | `shov-tension-google_lyria_3.5.mp3` |
| tension | ElevenLabs Music 2.5 | mpeg | 60.0 s | 9 s | $0.800 | -16.6 | -28 / -79 / -20 | `shov-tension-elevenlabs_music_v2.5.mp3` |
| tension | Stable Audio 3 | mpeg | 60.0 s | 8 s | $0.040 | -12.5 | -19 / -72 / -15 | `shov-tension-fal_ai_stable_audio_3_medium_text_to_audio.mp3` |
| tension | Stable Audio 2.5 | wav | 60.0 s | 5 s | $0.200 | -13.5 | -66 / -74 / -16 | `shov-tension-fal_ai_stable_audio_25_text_to_audio.mp3` |
| tension | Lyria 2 | wav | 32.8 s | 35 s | $0.100 | -22.4 | -26 / -25 / -25 | `shov-tension-fal_ai_lyria2.mp3` |
| tension | ACE-Step | wav | 60.0 s | 9 s | $0.300 | -13.8 | -72 / -54 / -17 | `shov-tension-fal_ai_ace_step_prompt_to_audio.mp3` |
| combat | Lyria 3 Pro | mpeg | 58.4 s | 20 s | $0.080 | -11 | -26 / -53 / -14 | `shov-combat-fal_ai_lyria3_pro.mp3` |
| combat | Lyria 3.5 | mpeg | 61.6 s | 28 s | $0.100 | -12.1 | -19 / silence / -14 | `shov-combat-google_lyria_3.5.mp3` |
| combat | ElevenLabs Music 2.5 | mpeg | 60.0 s | 8 s | $0.800 | -15 | -18 / -64 / -18 | `shov-combat-elevenlabs_music_v2.5.mp3` |
| combat | Stable Audio 3 | mpeg | 60.0 s | 8 s | $0.040 | -15.5 | -15 / -17 / -17 | `shov-combat-fal_ai_stable_audio_3_medium_text_to_audio.mp3` |
| combat | Stable Audio 2.5 | wav | 60.0 s | 6 s | $0.200 | -12.2 | -31 / -70 / -14 | `shov-combat-fal_ai_stable_audio_25_text_to_audio.mp3` |
| combat | Lyria 2 | wav | 32.8 s | 30 s | $0.100 | -23.7 | -25 / -27 / -25 | `shov-combat-fal_ai_lyria2.mp3` |
| combat | ACE-Step | wav | 60.0 s | 9 s | $0.300 | -15.3 | -19 / -73 / -17 | `shov-combat-fal_ai_ace_step_prompt_to_audio.mp3` |
| warm | Lyria 3 Pro | mpeg | 58.8 s | 21 s | $0.080 | -11.8 | -36 / -50 / -14 | `shov-warm-fal_ai_lyria3_pro.mp3` |
| warm | Lyria 3.5 | mpeg | 62.6 s | 23 s | $0.100 | -11.2 | -16 / silence / -14 | `shov-warm-google_lyria_3.5.mp3` |
| warm | ElevenLabs Music 2.5 | mpeg | 60.0 s | 8 s | $0.800 | -14.1 | -26 / -72 / -17 | `shov-warm-elevenlabs_music_v2.5.mp3` |
| warm | Stable Audio 3 | mpeg | 60.0 s | 10 s | $0.040 | -15.3 | -20 / -28 / -17 | `shov-warm-fal_ai_stable_audio_3_medium_text_to_audio.mp3` |
| warm | Stable Audio 2.5 | wav | 60.0 s | 7 s | $0.200 | -13.5 | -30 / -72 / -16 | `shov-warm-fal_ai_stable_audio_25_text_to_audio.mp3` |
| warm | Lyria 2 | wav | 32.8 s | 29 s | $0.100 | -23.5 | -23 / -28 / -25 | `shov-warm-fal_ai_lyria2.mp3` |
| warm | ACE-Step | wav | 60.0 s | 11 s | $0.300 | -15.9 | -19 / -73 / -17 | `shov-warm-fal_ai_ace_step_prompt_to_audio.mp3` |
| mystery | Lyria 3 Pro | mpeg | 59.6 s | 22 s | $0.080 | -11 | -29 / -46 / -14 | `shov-mystery-fal_ai_lyria3_pro.mp3` |
| mystery | Lyria 3.5 | mpeg | 60.9 s | 20 s | $0.100 | -12.8 | -13 / silence / -14 | `shov-mystery-google_lyria_3.5.mp3` |
| mystery | ElevenLabs Music 2.5 | mpeg | 60.0 s | 7 s | $0.800 | -15.2 | -13 / -83 / -17 | `shov-mystery-elevenlabs_music_v2.5.mp3` |
| mystery | Stable Audio 3 | mpeg | 60.0 s | 10 s | $0.040 | -13.1 | -17 / -39 / -16 | `shov-mystery-fal_ai_stable_audio_3_medium_text_to_audio.mp3` |
| mystery | Stable Audio 2.5 | wav | 60.0 s | 6 s | $0.200 | -15.4 | -35 / -74 / -19 | `shov-mystery-fal_ai_stable_audio_25_text_to_audio.mp3` |
| mystery | Lyria 2 | wav | 32.8 s | 32 s | $0.100 | -24 | -28 / -27 / -25 | `shov-mystery-fal_ai_lyria2.mp3` |
| mystery | ACE-Step | wav | 60.0 s | 8 s | $0.300 | -13.3 | -14 / -73 / -15 | `shov-mystery-fal_ai_ace_step_prompt_to_audio.mp3` |

## Per model

| Model | Tracks | Output | Median time | Mean LUFS | Price per 60-s track (counted) | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Lyria 3 Pro | 5 | mpeg | 22 s | -11.3 | $0.080 | MP3; the length follows the prompt (58–60 s when asked for 60); refuses a negative prompt; fade-out tails |
| Lyria 3.5 | 5 | mpeg | 23 s | -11.8 | $0.100 | MP3; one content-checker refusal of the very same prompt on the first try (passed on retry); ends in silence |
| ElevenLabs Music 2.5 | 5 | mpeg | 8 s | -15.1 | $0.800 | MP3; exact length; quieter; chunk plan, no `force_instrumental` with a plan; billed per minute rounded up |
| Stable Audio 3 | 5 | mpeg | 8 s | -15.1 | $0.040 | MP3; exact length; the cheapest of the quality tier; fast |
| Stable Audio 2.5 | 5 | wav | 6 s | -13.6 | $0.200 | WAV (10 MB a minute); exact length; fast |
| Lyria 2 | 5 | wav | 31 s | -23.4 | $0.100 | WAV; 30 s fixed (32.8 s delivered); quiet (−23 LUFS) |
| ACE-Step | 5 | wav | 9 s | -14.8 | $0.300 | WAV; exact length; draft tier; counted at $0.005/s (an older index) against the page's $0.0002/s |
