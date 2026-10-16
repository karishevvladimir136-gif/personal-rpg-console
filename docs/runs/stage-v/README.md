# Stage V paid runs — records

Every paid call of Stage V (fal images, Claude Haiku 5.5 shots and vision scores) is recorded here, as
`STAGE_4.md` asks for research-grade records. Synthetic sample campaigns only («Мир Шва», «Neon & Rain»);
never the owner's campaigns. The images themselves are in `public/preview/stage-v/` (the preview screens show them).

- `ledger.json` — every paid call, counted at its list price before it was sent and settled afterwards; the bench
  stops at the cap (`--cap`, 25 USD for this stage).
- `*-anchors-<world>-<style>-<model>.json` — one row per anchor of the sample's anchor set: subject, composition,
  prompt, size, references, fal endpoint and request ID, time, price, whether the softened re-submit was needed.
- `*-frames-<world>-<style>-<model>-<refs|norefs>[-tag].json` — one row per turn of the synthetic scene
  (`test-fixtures/stage-v/<world>-scene.json`): the paragraph, the shot (JSON from Haiku, or the deterministic
  fallback), its usage and cost, the matched entities and the reference pictures sent, the frame prompt, fal
  endpoint, request ID, time, price; a summary with medians (shot ms, fal ms, frame ms = shot + fal) and the price per
  frame and per turn (frame + shot).
- `*-score-<world>-<style>-<model>-<refs|norefs>[-cmp|-key].json` — the vision model's consistency scores
  (0 = nothing alike, 10 = the same) of each frame against the anchors it should match: `people` (faces, hair,
  clothes of the portraits), `place`, `style`; the mean per run.
- `SUMMARY.md` — all records in one table (`scripts/stage-v-bench.mjs summary`).
- `superseded/` — paid runs that a later run replaced (an early frames run whose shot model hit its output limit and
  fell back to the deterministic shot; the first scoring pass whose parser lost cut-off replies; the frames and scores
  made before the shot builder learned that second-person narration puts the hero in the frame). Kept because no paid
  run is thrown away; their calls are in the ledger.

Re-running: `node --conditions=react-server scripts/stage-v-bench.mjs <command> …` (the header of the script lists
the commands and options). Keys come from `.env.local`; nothing here holds a key.
