# Russian blind samples — a 10-minute test for the owner

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), in parallel with the integration session. Branch
`claude/blind-ru` from `origin/claude/stage-4-dm`. Touch only the eval harness and its fixtures
(`scripts/eval/**`, `tests` for them) and `docs/samples/stage-4/blind-ru/`, `docs/runs/`; never the app code, so
nothing collides with the integration branch. If the game master cannot be made to play in Russian without an app
change, stop and say what change it needs.

## Why

The English blind run (`docs/samples/stage-4/blind/`) was too long to read: 30 samples of 2–3 turns, the same setup
five times, and in English, while the owner plays in Russian. The new test shows only one key turn per scene, in
Russian, four variants side by side, and asks one question: which one is best.

## What to produce

1. **Russian fixture and scenes.** The six blind scenes (`scripts/eval/scenarios/blind/*.json`) as Russian copies in
   `scripts/eval/scenarios/blind-ru/`: the campaign language Russian, the fixture's public world and opening text in
   natural Russian (same facts, same names where they are names, same secrets in the Character Models), the player's
   inputs written the way the owner writes — short, first person, informal Russian. Keep the step ids.
2. **Key turn per scene** (stored as `keyStep` in each sample): `tavern-talk` t3, `companion-heart` h2,
   `secret-pressure` p3, `power-creep` obey, `combat-climax` c2, `travel-consequences` travel. The whole scene still
   runs (the key turn needs the turns before it); only the page shows the key turn.
3. **Variants: four** — `opus-high`, `opus-xhigh`, `astra-high`, `astra-xhigh`. Astra medium is left out: the owner
   picks by quality, not price.
4. A `--lang ru` (or a separate scenario folder flag) for `scripts/eval/blind.mjs`, writing to
   `docs/samples/stage-4/blind-ru/<scene>-<random>.json` with the same schema plus `keyStep` and `language: "ru"`;
   the file name still carries no hint of the variant.
5. **Probe first:** one turn on each model to confirm the narration, names of places and the DM's records come out in
   Russian (no English leftovers, no transliterated English idioms). Fix the fixture until they do.
6. Run 6 scenes × 4 variants with a hard budget of **$14**; every turn committed or the failure recorded; a
   research record in `docs/runs/`.

## Checks and report

typecheck, lint, the eval tests; the English blind run still works unchanged. Push `claude/blind-ru` only, never
`main`, never the owner's database. Report in English: spend, samples written, any failed turn, and for each sample
whether its key turn is fully Russian. The planner builds the owner's page from the files.
