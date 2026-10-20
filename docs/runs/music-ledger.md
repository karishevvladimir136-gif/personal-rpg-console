# Music stage — ledger of paid calls

Cap **$50** (the stage file says $40; the owner raised it to $50 in the session's task). Every fal request of the stage, counted at the list price before it is sent and settled after it returns (a failed request settles at the list price: fal may bill it). Validation probes — bodies the worker rejected before any generation — are recorded at $0; fal does not bill them. Times are UTC.

**Total settled: $14.4000 of $50.**

| # | When | Kind | Model | What | Counted | Settled | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2026-10-20 16:21:46 | probe | fal-ai/lyria3/pro | empty-body probe (required fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 2 | 2026-10-20 16:21:46 | probe | fal-ai/elevenlabs/music | empty-body probe (required fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 3 | 2026-10-20 16:21:47 | probe | fal-ai/stable-audio-25/text-to-audio | empty-body probe (required fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 4 | 2026-10-20 16:21:47 | probe | fal-ai/lyria2 | empty-body probe (required fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 5 | 2026-10-20 16:21:47 | probe | fal-ai/ace-step/prompt-to-audio | empty-body probe (required fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 6 | 2026-10-20 16:21:47 | probe | fal-ai/lyria3/pro | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 7 | 2026-10-20 16:21:47 | probe | fal-ai/elevenlabs/music | wrong-typed fields probe (known fields, output formats) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 8 | 2026-10-20 16:21:47 | probe | fal-ai/stable-audio-25/text-to-audio | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 9 | 2026-10-20 16:21:47 | probe | fal-ai/lyria2 | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 10 | 2026-10-20 16:21:47 | probe | fal-ai/ace-step/prompt-to-audio | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 11 | 2026-10-20 16:21:47 | probe | fal-ai/elevenlabs/music | composition_plan structure probe | $0.0000 | $0.0000 | rejected before generation ($0) |
| 12 | 2026-10-20 16:21:47 | probe | google/lyria-3.5 | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 13 | 2026-10-20 16:21:48 | probe | fal-ai/stable-audio-3/medium/text-to-audio | wrong-typed fields probe (known fields, output formats) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 14 | 2026-10-20 16:21:48 | probe | fal-ai/lyria3 | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 15 | 2026-10-20 16:21:48 | probe | fal-ai/stable-audio-3/large/text-to-audio | probe: path not found (404) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 16 | 2026-10-20 16:21:48 | probe | elevenlabs/music/v2.5 | wrong-typed fields probe (known fields, seed, output formats) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 17 | 2026-10-20 16:21:48 | probe | elevenlabs/music/v2 | wrong-typed fields probe (known fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 18 | 2026-10-20 16:21:48 | music | fal-ai/lyria3/pro | shov/travel 60s | $0.0800 | $0.0000 | failed: validation (HTTP 422: Value error, Negative prompting is not supported by Lyria 3.) — refused at submit, never queued: $0 |
| 19 | 2026-10-20 16:21:48 | music | google/lyria-3.5 | shov/travel 60s | $0.1000 | $0.0000 | failed: validation (HTTP 422: Value error, Negative prompting is not supported by Lyria 3.5.) — refused at submit, never queued: $0 |
| 20 | 2026-10-20 16:21:48 | music | elevenlabs/music/v2.5 | shov/travel 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: Field required) — refused at submit, never queued: $0 |
| 21 | 2026-10-20 16:21:48 | music | fal-ai/stable-audio-25/text-to-audio | shov/travel 60s | $0.2000 | $0.2000 | ok 60.0s audio/wav 5s |
| 22 | 2026-10-20 16:21:48 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/travel 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 8s |
| 23 | 2026-10-20 16:21:48 | music | fal-ai/lyria2 | shov/travel 30s | $0.1000 | $0.1000 | ok 32.8s audio/wav 31s |
| 24 | 2026-10-20 16:21:48 | music | fal-ai/ace-step/prompt-to-audio | shov/travel 60s | $0.3000 | $0.3000 | ok 60.0s audio/wav 14s |
| 25 | 2026-10-20 16:23:52 | probe | elevenlabs/music/v2.5 | composition_plan probe with the sections shape: rejected, v2.5 wants chunks | $0.0000 | $0.0000 | rejected before generation ($0) |
| 26 | 2026-10-20 16:23:52 | probe | elevenlabs/music/v2.5 | chunk structure probe (wrong-typed fields) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 27 | 2026-10-20 16:24:23 | probe | elevenlabs/music/v2.5 | chunk plan shape probe with duration_ms=1 (out of range, rejected) | $0.0000 | $0.0000 | rejected before generation ($0) |
| 28 | 2026-10-20 16:24:35 | music | fal-ai/lyria3/pro | shov/travel 60s | $0.0800 | $0.0800 | ok 60.0s audio/mpeg 24s |
| 29 | 2026-10-20 16:24:35 | music | google/lyria-3.5 | shov/travel 60s | $0.1000 | $0.0000 | failed: validation (HTTP 422: prompt: The content could not be processed because it contained material flagged by a content checker.) — refused at submit, never queued: $0 |
| 30 | 2026-10-20 16:24:35 | music | elevenlabs/music/v2.5 | shov/travel 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: : Value error, force_instrumental cannot be used with composition_plan) — refused at submit, never queued: $0 |
| 31 | 2026-10-20 16:24:59 | music | fal-ai/lyria3/pro | shov/tension 60s | $0.0800 | $0.0800 | ok 58.4s audio/mpeg 26s |
| 32 | 2026-10-20 16:24:59 | music | google/lyria-3.5 | shov/tension 60s | $0.1000 | $0.1000 | ok 59.6s audio/mpeg 28s |
| 33 | 2026-10-20 16:24:59 | music | elevenlabs/music/v2.5 | shov/tension 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: : Value error, force_instrumental cannot be used with composition_plan) — refused at submit, never queued: $0 |
| 34 | 2026-10-20 16:24:59 | music | fal-ai/stable-audio-25/text-to-audio | shov/tension 60s | $0.2000 | $0.2000 | ok 60.0s audio/wav 5s |
| 35 | 2026-10-20 16:24:59 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/tension 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 8s |
| 36 | 2026-10-20 16:24:59 | music | fal-ai/lyria2 | shov/tension 30s | $0.1000 | $0.1000 | ok 32.8s audio/wav 35s |
| 37 | 2026-10-20 16:24:59 | music | fal-ai/ace-step/prompt-to-audio | shov/tension 60s | $0.3000 | $0.3000 | ok 60.0s audio/wav 9s |
| 38 | 2026-10-20 16:25:35 | music | fal-ai/lyria3/pro | shov/combat 60s | $0.0800 | $0.0800 | ok 58.4s audio/mpeg 20s |
| 39 | 2026-10-20 16:25:35 | music | google/lyria-3.5 | shov/combat 60s | $0.1000 | $0.1000 | ok 61.6s audio/mpeg 28s |
| 40 | 2026-10-20 16:25:35 | music | elevenlabs/music/v2.5 | shov/combat 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: : Value error, force_instrumental cannot be used with composition_plan) — refused at submit, never queued: $0 |
| 41 | 2026-10-20 16:25:35 | music | fal-ai/stable-audio-25/text-to-audio | shov/combat 60s | $0.2000 | $0.2000 | ok 60.0s audio/wav 6s |
| 42 | 2026-10-20 16:25:35 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/combat 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 8s |
| 43 | 2026-10-20 16:25:35 | music | fal-ai/lyria2 | shov/combat 30s | $0.1000 | $0.1000 | ok 32.8s audio/wav 30s |
| 44 | 2026-10-20 16:25:35 | music | fal-ai/ace-step/prompt-to-audio | shov/combat 60s | $0.3000 | $0.3000 | ok 60.0s audio/wav 9s |
| 45 | 2026-10-20 16:26:07 | music | fal-ai/lyria3/pro | shov/warm 60s | $0.0800 | $0.0800 | ok 58.8s audio/mpeg 21s |
| 46 | 2026-10-20 16:26:07 | music | google/lyria-3.5 | shov/warm 60s | $0.1000 | $0.1000 | ok 62.6s audio/mpeg 23s |
| 47 | 2026-10-20 16:26:07 | music | elevenlabs/music/v2.5 | shov/warm 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: : Value error, force_instrumental cannot be used with composition_plan) — refused at submit, never queued: $0 |
| 48 | 2026-10-20 16:26:07 | music | fal-ai/stable-audio-25/text-to-audio | shov/warm 60s | $0.2000 | $0.2000 | ok 60.0s audio/wav 7s |
| 49 | 2026-10-20 16:26:07 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/warm 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 10s |
| 50 | 2026-10-20 16:26:07 | music | fal-ai/lyria2 | shov/warm 30s | $0.1000 | $0.1000 | ok 32.8s audio/wav 29s |
| 51 | 2026-10-20 16:26:07 | music | fal-ai/ace-step/prompt-to-audio | shov/warm 60s | $0.3000 | $0.3000 | ok 60.0s audio/wav 11s |
| 52 | 2026-10-20 16:26:38 | music | fal-ai/lyria3/pro | shov/mystery 60s | $0.0800 | $0.0800 | ok 59.6s audio/mpeg 22s |
| 53 | 2026-10-20 16:26:38 | music | google/lyria-3.5 | shov/mystery 60s | $0.1000 | $0.1000 | ok 60.9s audio/mpeg 20s |
| 54 | 2026-10-20 16:26:38 | music | elevenlabs/music/v2.5 | shov/mystery 60s | $0.8000 | $0.0000 | failed: validation (HTTP 422: : Value error, force_instrumental cannot be used with composition_plan) — refused at submit, never queued: $0 |
| 55 | 2026-10-20 16:26:38 | music | fal-ai/stable-audio-25/text-to-audio | shov/mystery 60s | $0.2000 | $0.2000 | ok 60.0s audio/wav 6s |
| 56 | 2026-10-20 16:26:38 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/mystery 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 10s |
| 57 | 2026-10-20 16:26:38 | music | fal-ai/lyria2 | shov/mystery 30s | $0.1000 | $0.1000 | ok 32.8s audio/wav 32s |
| 58 | 2026-10-20 16:26:38 | music | fal-ai/ace-step/prompt-to-audio | shov/mystery 60s | $0.3000 | $0.3000 | ok 60.0s audio/wav 8s |
| 59 | 2026-10-20 16:29:37 | music | elevenlabs/music/v2.5 | shov/travel 60s | $0.8000 | $0.8000 | ok 60.0s audio/mpeg 9s |
| 60 | 2026-10-20 16:29:47 | music | elevenlabs/music/v2.5 | shov/tension 60s | $0.8000 | $0.8000 | ok 60.0s audio/mpeg 9s |
| 61 | 2026-10-20 16:29:57 | music | elevenlabs/music/v2.5 | shov/combat 60s | $0.8000 | $0.8000 | ok 60.0s audio/mpeg 8s |
| 62 | 2026-10-20 16:30:07 | music | elevenlabs/music/v2.5 | shov/warm 60s | $0.8000 | $0.8000 | ok 60.0s audio/mpeg 8s |
| 63 | 2026-10-20 16:30:16 | music | elevenlabs/music/v2.5 | shov/mystery 60s | $0.8000 | $0.8000 | ok 60.0s audio/mpeg 7s |
| 64 | 2026-10-20 16:30:24 | music | google/lyria-3.5 | shov/travel 60s | $0.1000 | $0.1000 | ok 62.7s audio/mpeg 17s |
| 65 | 2026-10-20 16:36:39 | music | fal-ai/lyria3/pro | shov/travel#1 60s | $0.0800 | $0.0800 | ok 58.9s audio/mpeg 25s |
| 66 | 2026-10-20 16:36:39 | music | google/lyria-3.5 | shov/travel#2 60s | $0.1000 | $0.1000 | ok 65.5s audio/mpeg 31s |
| 67 | 2026-10-20 16:36:39 | music | fal-ai/lyria3/pro | shov/explore#1 60s | $0.0800 | $0.0800 | ok 57.1s audio/mpeg 27s |
| 68 | 2026-10-20 16:37:12 | music | google/lyria-3.5 | shov/explore#2 60s | $0.1000 | $0.1000 | failed: unavailable (HTTP 500: : Downstream service error) |
| 69 | 2026-10-20 16:37:12 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/explore#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 70 | 2026-10-20 16:37:12 | music | fal-ai/lyria3/pro | shov/mystery#1 60s | $0.0800 | $0.0800 | ok 58.3s audio/mpeg 26s |
| 71 | 2026-10-20 16:37:40 | music | google/lyria-3.5 | shov/mystery#2 60s | $0.1000 | $0.1000 | ok 61.4s audio/mpeg 30s |
| 72 | 2026-10-20 16:37:40 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/mystery#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 73 | 2026-10-20 16:37:40 | music | fal-ai/lyria3/pro | shov/tension#1 75s | $0.0800 | $0.0800 | ok 73.8s audio/mpeg 27s |
| 74 | 2026-10-20 16:38:12 | music | google/lyria-3.5 | shov/tension#2 75s | $0.1000 | $0.1000 | ok 71.9s audio/mpeg 25s |
| 75 | 2026-10-20 16:38:12 | music | fal-ai/lyria3/pro | shov/combat#1 90s | $0.0800 | $0.0800 | ok 89.3s audio/mpeg 34s |
| 76 | 2026-10-20 16:38:12 | music | google/lyria-3.5 | shov/combat#2 90s | $0.1000 | $0.1000 | ok 91.5s audio/mpeg 30s |
| 77 | 2026-10-20 16:38:49 | music | fal-ai/lyria3/pro | shov/climax#1 90s | $0.0800 | $0.0800 | ok 87.9s audio/mpeg 27s |
| 78 | 2026-10-20 16:38:49 | music | google/lyria-3.5 | shov/climax#2 90s | $0.1000 | $0.1000 | ok 98.4s audio/mpeg 32s |
| 79 | 2026-10-20 16:38:49 | music | fal-ai/lyria3/pro | shov/quiet#1 60s | $0.0800 | $0.0800 | ok 59.1s audio/mpeg 35s |
| 80 | 2026-10-20 16:39:26 | music | google/lyria-3.5 | shov/quiet#2 60s | $0.1000 | $0.1000 | ok 65.9s audio/mpeg 28s |
| 81 | 2026-10-20 16:39:26 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/quiet#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 82 | 2026-10-20 16:39:26 | music | fal-ai/lyria3/pro | shov/warm#1 60s | $0.0800 | $0.0800 | ok 57.9s audio/mpeg 21s |
| 83 | 2026-10-20 16:39:56 | music | google/lyria-3.5 | shov/warm#2 60s | $0.1000 | $0.1000 | ok 62.2s audio/mpeg 26s |
| 84 | 2026-10-20 16:39:56 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/warm#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 85 | 2026-10-20 16:39:56 | music | fal-ai/lyria3/pro | shov/humor#1 60s | $0.0800 | $0.0800 | ok 59.6s audio/mpeg 29s |
| 86 | 2026-10-20 16:40:28 | music | google/lyria-3.5 | shov/humor#2 60s | $0.1000 | $0.1000 | ok 59.4s audio/mpeg 25s |
| 87 | 2026-10-20 16:40:28 | music | fal-ai/lyria3/pro | shov/trade#1 60s | $0.0800 | $0.0800 | ok 59.2s audio/mpeg 23s |
| 88 | 2026-10-20 16:40:28 | music | google/lyria-3.5 | shov/trade#2 60s | $0.1000 | $0.0000 | failed: validation (HTTP 422: prompt: The content could not be processed because it contained material flagged by a content checker.) — refused at submit, never queued: $0 |
| 89 | 2026-10-20 16:40:55 | music | fal-ai/lyria3/pro | shov/town#1 60s | $0.0800 | $0.0800 | ok 60.2s audio/mpeg 28s |
| 90 | 2026-10-20 16:40:55 | music | google/lyria-3.5 | shov/town#2 60s | $0.1000 | $0.1000 | ok 66.7s audio/mpeg 30s |
| 91 | 2026-10-20 16:40:55 | music | fal-ai/lyria3/pro | shov/night#1 60s | $0.0800 | $0.0800 | ok 58.3s audio/mpeg 21s |
| 92 | 2026-10-20 16:41:27 | music | google/lyria-3.5 | shov/night#2 60s | $0.1000 | $0.1000 | ok 62.5s audio/mpeg 26s |
| 93 | 2026-10-20 16:41:27 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/night#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 94 | 2026-10-20 16:41:27 | music | fal-ai/lyria3/pro | shov/dread#1 75s | $0.0800 | $0.0800 | ok 73.1s audio/mpeg 28s |
| 95 | 2026-10-20 16:41:57 | music | google/lyria-3.5 | shov/dread#2 75s | $0.1000 | $0.1000 | ok 82.9s audio/mpeg 31s |
| 96 | 2026-10-20 16:41:57 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/dread#3 75s | $0.0400 | $0.0400 | ok 75.0s audio/mpeg 9s |
| 97 | 2026-10-20 16:41:57 | music | fal-ai/lyria3/pro | shov/sorrow#1 60s | $0.0800 | $0.0800 | ok 58.5s audio/mpeg 22s |
| 98 | 2026-10-20 16:42:31 | music | google/lyria-3.5 | shov/sorrow#2 60s | $0.1000 | $0.1000 | ok 66.6s audio/mpeg 26s |
| 99 | 2026-10-20 16:42:31 | music | fal-ai/stable-audio-3/medium/text-to-audio | shov/sorrow#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 100 | 2026-10-20 16:42:31 | music | fal-ai/lyria3/pro | shov/triumph#1 75s | $0.0800 | $0.0800 | ok 73.3s audio/mpeg 19s |
| 101 | 2026-10-20 16:42:59 | music | google/lyria-3.5 | shov/triumph#2 75s | $0.1000 | $0.1000 | ok 80.9s audio/mpeg 29s |
| 102 | 2026-10-20 16:43:31 | music | fal-ai/lyria3/pro | noir/travel#1 60s | $0.0800 | $0.0800 | ok 57.8s audio/mpeg 25s |
| 103 | 2026-10-20 16:43:31 | music | google/lyria-3.5 | noir/travel#2 60s | $0.1000 | $0.0000 | failed: validation (HTTP 422: prompt: The content could not be processed because it contained material flagged by a content checker.) — refused at submit, never queued: $0 |
| 104 | 2026-10-20 16:43:31 | music | fal-ai/lyria3/pro | noir/explore#1 60s | $0.0800 | $0.0800 | ok 58.1s audio/mpeg 28s |
| 105 | 2026-10-20 16:45:41 | music | google/lyria-3.5 | noir/explore#2 60s | $0.1000 | $0.1000 | ok 62.6s audio/mpeg 28s |
| 106 | 2026-10-20 16:45:41 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/explore#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 107 | 2026-10-20 16:45:41 | music | fal-ai/lyria3/pro | noir/mystery#1 60s | $0.0800 | $0.0800 | ok 59.9s audio/mpeg 30s |
| 108 | 2026-10-20 16:46:13 | music | google/lyria-3.5 | noir/mystery#2 60s | $0.1000 | $0.1000 | ok 61.7s audio/mpeg 26s |
| 109 | 2026-10-20 16:46:13 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/mystery#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 110 | 2026-10-20 16:46:13 | music | fal-ai/lyria3/pro | noir/tension#1 75s | $0.0800 | $0.0800 | ok 73.5s audio/mpeg 47s |
| 111 | 2026-10-20 16:47:03 | music | google/lyria-3.5 | noir/tension#2 75s | $0.1000 | $0.1000 | ok 74.2s audio/mpeg 27s |
| 112 | 2026-10-20 16:47:03 | music | fal-ai/lyria3/pro | noir/combat#1 90s | $0.0800 | $0.0800 | ok 90.6s audio/mpeg 30s |
| 113 | 2026-10-20 16:47:03 | music | google/lyria-3.5 | noir/combat#2 90s | $0.1000 | $0.1000 | ok 92.8s audio/mpeg 35s |
| 114 | 2026-10-20 16:47:41 | music | fal-ai/lyria3/pro | noir/climax#1 90s | $0.0800 | $0.0800 | ok 88.3s audio/mpeg 27s |
| 115 | 2026-10-20 16:47:41 | music | google/lyria-3.5 | noir/climax#2 90s | $0.1000 | $0.1000 | ok 90.4s audio/mpeg 31s |
| 116 | 2026-10-20 16:47:41 | music | fal-ai/lyria3/pro | noir/quiet#1 60s | $0.0800 | $0.0800 | ok 58.9s audio/mpeg 19s |
| 117 | 2026-10-20 16:48:15 | music | google/lyria-3.5 | noir/quiet#2 60s | $0.1000 | $0.1000 | ok 62.2s audio/mpeg 28s |
| 118 | 2026-10-20 16:48:15 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/quiet#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 119 | 2026-10-20 16:48:15 | music | fal-ai/lyria3/pro | noir/warm#1 60s | $0.0800 | $0.0800 | ok 57.8s audio/mpeg 26s |
| 120 | 2026-10-20 16:48:46 | music | google/lyria-3.5 | noir/warm#2 60s | $0.1000 | $0.1000 | ok 62.1s audio/mpeg 28s |
| 121 | 2026-10-20 16:48:46 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/warm#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 122 | 2026-10-20 16:48:46 | music | fal-ai/lyria3/pro | noir/humor#1 60s | $0.0800 | $0.0800 | ok 59.9s audio/mpeg 25s |
| 123 | 2026-10-20 16:49:16 | music | google/lyria-3.5 | noir/humor#2 60s | $0.1000 | $0.1000 | ok 62.8s audio/mpeg 24s |
| 124 | 2026-10-20 16:49:16 | music | fal-ai/lyria3/pro | noir/trade#1 60s | $0.0800 | $0.0800 | ok 59.7s audio/mpeg 27s |
| 125 | 2026-10-20 16:49:16 | music | google/lyria-3.5 | noir/trade#2 60s | $0.1000 | $0.1000 | ok 62.7s audio/mpeg 21s |
| 126 | 2026-10-20 16:49:45 | music | fal-ai/lyria3/pro | noir/town#1 60s | $0.0800 | $0.0800 | ok 60.1s audio/mpeg 21s |
| 127 | 2026-10-20 16:49:45 | music | google/lyria-3.5 | noir/town#2 60s | $0.1000 | $0.1000 | ok 62.7s audio/mpeg 28s |
| 128 | 2026-10-20 16:49:45 | music | fal-ai/lyria3/pro | noir/night#1 60s | $0.0800 | $0.0800 | ok 58.6s audio/mpeg 23s |
| 129 | 2026-10-20 16:50:14 | music | google/lyria-3.5 | noir/night#2 60s | $0.1000 | $0.1000 | ok 61.4s audio/mpeg 22s |
| 130 | 2026-10-20 16:50:14 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/night#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 131 | 2026-10-20 16:50:14 | music | fal-ai/lyria3/pro | noir/dread#1 75s | $0.0800 | $0.0800 | ok 74.3s audio/mpeg 26s |
| 132 | 2026-10-20 16:50:43 | music | google/lyria-3.5 | noir/dread#2 75s | $0.1000 | $0.1000 | ok 74.9s audio/mpeg 26s |
| 133 | 2026-10-20 16:50:43 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/dread#3 75s | $0.0400 | $0.0400 | ok 75.0s audio/mpeg 9s |
| 134 | 2026-10-20 16:50:43 | music | fal-ai/lyria3/pro | noir/sorrow#1 60s | $0.0800 | $0.0800 | ok 59.2s audio/mpeg 29s |
| 135 | 2026-10-20 16:51:14 | music | google/lyria-3.5 | noir/sorrow#2 60s | $0.1000 | $0.1000 | ok 66.8s audio/mpeg 26s |
| 136 | 2026-10-20 16:51:14 | music | fal-ai/stable-audio-3/medium/text-to-audio | noir/sorrow#3 60s | $0.0400 | $0.0400 | ok 60.0s audio/mpeg 9s |
| 137 | 2026-10-20 16:51:14 | music | fal-ai/lyria3/pro | noir/triumph#1 75s | $0.0800 | $0.0800 | ok 73.7s audio/mpeg 24s |
| 138 | 2026-10-20 16:51:43 | music | google/lyria-3.5 | noir/triumph#2 75s | $0.1000 | $0.1000 | ok 76.8s audio/mpeg 25s |
| 139 | 2026-10-20 16:52:24 | music | fal-ai/lyria3/pro | shov/explore#1 60s | $0.0800 | $0.0000 | dry |
| 140 | 2026-10-20 16:52:24 | music | google/lyria-3.5 | shov/explore#2 60s | $0.1000 | $0.0000 | dry |
| 141 | 2026-10-20 16:52:24 | music | fal-ai/lyria3/pro | shov/trade#1 60s | $0.0800 | $0.0000 | dry |
| 142 | 2026-10-20 16:52:24 | music | google/lyria-3.5 | shov/trade#2 60s | $0.1000 | $0.0000 | dry |
| 143 | 2026-10-20 16:52:42 | music | fal-ai/lyria3/pro | shov/explore#1 60s | $0.0800 | $0.0800 | ok 59.3s audio/mpeg 27s |
| 144 | 2026-10-20 16:52:42 | music | google/lyria-3.5 | shov/explore#2 60s | $0.1000 | $0.1000 | ok 61.2s audio/mpeg 25s |
| 145 | 2026-10-20 16:52:42 | music | fal-ai/lyria3/pro | shov/trade#1 60s | $0.0800 | $0.0800 | ok 59.0s audio/mpeg 19s |
| 146 | 2026-10-20 16:53:12 | music | google/lyria-3.5 | shov/trade#2 60s | $0.1000 | $0.1000 | ok 62.8s audio/mpeg 29s |
| 147 | 2026-10-20 16:53:43 | music | fal-ai/lyria3/pro | noir/travel#1 60s | $0.0800 | $0.0800 | ok 58.7s audio/mpeg 21s |
| 148 | 2026-10-20 16:53:43 | music | google/lyria-3.5 | noir/travel#2 60s | $0.1000 | $0.1000 | ok 62.1s audio/mpeg 26s |
