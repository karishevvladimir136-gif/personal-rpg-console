# Polish — after the owner's first sandbox play

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), branch `claude/polish` from `origin/claude/integration`.
The owner's notes from the first play are added below by the planner before launch.

## Known before the play

1. **A roll that is never narrated.** After an interactive dice roll the turn pauses; the game master's continuation
   after the roll sometimes holds only tool calls and no text, so the player sees the roll but not what happened.
   Seen on Opus in both blind runs (English and Russian). The continuation after a roll must always narrate the
   outcome; if the model returns no text, ask it once more for the narration only, and never close the turn silently.
2. **Stage V review fixes** — `docs/stages/STAGE_V.md` §7: one stage instead of two stacked pictures, a real frame in
   the review screens, a portrait anchor queued for a named person seen in a frame without one, gender and looks from
   the public text until then, visible traits kept in anchors, action text with the same person labels, no mid-word
   cuts.
3. **Latin shorthand in a Russian campaign.** «HP» and «NPC» appear in four game-master notes of the Russian blind
   run, one of them in a counter receipt («без потери HP»). Anything the player can see follows the campaign
   language; notes use the campaign's own words for these.
4. **Astra breaks the fiction about equipment.** In the Russian combat scene Astra said «по установленному снаряжению у
   Роуэна есть компас, но оружия не указано» inside the narration. Questions about the sheet belong in a short
   out-of-fiction aside or a clarifying question, never in the story voice.
5. **Astra sometimes ends a turn without `finish_turn`** (Stage 4 known limit): tension and refusal hints are lost on
   those turns.

## The owner's notes from the first play

(to be filled in)

## Checks

typecheck, lint, the full suite with `--test-concurrency=2`, build, fake bench, screenshots with the overflow check, a
short live smoke on the changed paths within **$5**. Push `claude/polish` only, never `main`. Report in English.
