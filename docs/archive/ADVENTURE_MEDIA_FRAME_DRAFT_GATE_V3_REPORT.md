# FRAME Draft/Approval gate v3 — completed synthetic product gate

Frozen production candidate: `d43da1e8dd6108aabcd236f3ff21ca338882e7d4`; gate `illustration-draft-owner-approval-v3`; fixture digest `d59f65697b468c56326cc4901ecca1116d547e61b47c3c6a0bcee051978719e4`. The unchanged five public scene meanings ran sequentially on disposable PGlite migrations 1–28 and an isolated immutable local pixel store. No owner database or hosted Storage was used.

**Result: PASS for the Draft → explicit decision product boundary.** Exactly five image attempts plus five presentation-QA attempts, no retry/fallback. Four independent Acceptable Draft decisions were explicitly committed; F2 was explicitly discarded. Before each decision, no ordinary image Asset existed. Original outputs, QA verdicts, versions, decision/dispatch receipts and replay evidence are retained. Media operations did not change gameplay/private/source/Canon/head/timeline state. Existing accepted art survived rejection.

This is not owner acceptance of the whole wave, universal visual fidelity, perfect face consistency, or proof that automated QA detects every bad image. The synthetic independent decisions are evaluation actions, not acceptance of the owner's real campaign art.

## Per-case results

All requests pinned `gpt-image-2.5-sunburst-2026-09-08`, high, 1536×1024, PNG, n=1. Each returned HTTP 200 but **no actual image-model identity field**; endpoint/request pinning is recorded, not an invented returned identity. All QA responses were completed `gpt-5.4-2026-03-05`, high, Standard/default, strict schema v2.

| Case | Public scene / reference basis | Automated QA | Independent decision and limits | Image / QA seconds | Image / QA charge |
| --- | --- | --- | --- | --- | --- |
| F1 | Standing at stone bridge, charcoal outfit, visible compass, public style/bridge/item references | safe_to_review | Acceptable Draft; compass held by body rather than strap is minor illustration variation | 30.126 / 12.935 | $0.045035 / $0.015200 |
| F2 | Courtyard profile, standing/pausing at bench, same outfit, no compass/person, courtyard/style references | safe_to_review | **Reject**: distinct unsupported tower and buildings beyond arch; automatic check missed them. Standing pose and item absence were correct; previous accepted art retained | 30.240 / 32.260 | $0.044720 / $0.0310175 |
| F3 | Standing under rainy timber shelter, road, fixed lantern, appearance/style/location references | safe_to_review | Acceptable Draft with coat/stubble/age variation; eyebrow detail and cropped boots not fully verified | 29.981 / 15.265 | $0.044750 / $0.0188975 |
| F4 | Seated at wooden table, warm light, visible compass/strap, appearance/style/location/item references | review_warning | Acceptable Draft; incidental props and unclear eyebrow notch retained as warnings | 28.292 / 38.938 | $0.045025 / $0.039450 |
| F5 | Standing at sunset overlook, approved rust scarf variant, empty hands, appearance/style/location references | safe_to_review | Acceptable Draft with **face-continuity warning**: visibly younger/softer than F3/F4. Scarf variant is clear | 29.003 / 11.461 | $0.044735 / $0.014795 |

Independent counts: **4 accepted, 1 rejected**; all four accepted drafts have recorded minor/continuity limitations. Automated counts: **4 safe, 1 warning, 0 hard rejects**. These are overlapping classifications, not nine accepted images. No extra major characters or private/future source information were accepted. Recurring likeness is not reliably identical; F5 illustrates this limitation.

## Usage and accounting

Image input/output by F1–F5: 775/1372, 712/1372, 718/1372, 773/1372, 715/1372; image-reference input tokens 0 in each. QA input/output/reasoning: 3002/513/487, 2939/1578/1552, 2945/769/743, 3000/2130/2040, 2942/496/470. All returned cached-read/cache-write counts were 0. Raw provider usage is preserved separately.

Official standard accounting basis checked before dispatch: image text input $5/M, image input $8/M, output $30/M; GPT-5.4 input $2.50/M, cached input $0.25/M, output including reasoning $15/M. [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [image-generation guide](https://developers.openai.com/api/docs/guides/image-generation).

New image charge **$0.224265**, QA charge **$0.119360**, total **$0.343625** calculated from returned usage. Historical failed gates remain $0.1619825; combined calculated charge **$0.5056075**. Provider invoice/observed billing is unavailable. New retained reservations $3.00 plus historical $1.40 = **$4.40**; reserve is not charge. Zero VIDEO calls/charge. Planned two-video reserve $14 would make the conservative combined envelope $18.40, below the same $20 ceiling.

## Exact evidence and owner-viewable images

[Open the original five images and EN/RU review notes](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-draft-approval-gate-v3-20260928/OWNER_REVIEW.html). [Exact journal](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-draft-approval-gate-v3-20260928/journal.json) retains scene/reference versions, prompt/wire/image/response digests, job/receipt/asset identities, untouched provider responses, immutable owner decisions, no-Asset-before-decision and exact replays. [Summary](C:/Users/karis/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-draft-approval-gate-v3-20260928/SUMMARY.json) exposes bounded accounting and per-case identities. The evidence manifest hashes 39 files, including the disposable database dump and original PNGs.

[Original gate](ADVENTURE_MEDIA_FRAME_LIVE_GATE_REPORT.md) and [strict grounding gate v2](ADVENTURE_MEDIA_FRAME_GROUNDING_GATE_V2_REPORT.md) remain historical failures, unchanged and hash-identical. The new product gate does not relabel those decisions. F2's new QA false-negative is preserved, and explicit human Discard is the boundary that protected accepted art. Generated pixels never establish world facts, even after Accept; setting a Canon Reference remains separate where supported.
