# Picture bake-off — blind samples for the owner's page

Written by `node scripts/eval/pictures/bakeoff.mjs blind` (no paid call). The planner builds the owner's page from
these files; the owner never opens them. Records of the paid run: `docs/runs/pictures-*`.

- `index.json` — the list of sample files.
- `t1-<hash>.json` … `t8-<hash>.json` — one file per shot of the owner's first session; `figure-<hash>.json` — the
  hero's full-figure anchor redrawn by each model from the same portrait.
- Each file: `shot`, `title` (`ru`, `en`), `description` (what the picture should show, English), `state` (the
  visible state from the records the picture must keep, if any), `references` (the anchor pictures every model
  received, with their role), and `variants`: one per model, under a letter. The letters are shuffled per shot, so a
  letter does not follow a model from one shot to the next.
- A variant: `letter`, `file` (the first sample — show this one side by side), `files` (all samples of that model
  for the shot, three where the budget allowed; GPT Image 2 has two), `refused` (samples the provider refused), and
  `sealed` — the model, hidden: base64 of a JSON object `{model, modelId, label, provider, prompt}`. Decode it only to
  reveal the names at the end of the page.
- `img/` — the pictures (random names; nothing in a file name says which model drew it). `anchors/hero.json` names
  the hero's portrait and full figure that every model received as references.

Suggested page: for each shot, the title, the references small on the side, the variants side by side by letter
with one click «лучший» (and a way to flip through a variant's other samples); after the last shot, reveal the names
and show the owner's picks next to the measured numbers in `docs/runs/pictures-REPORT.md`.
