# OpenWorld adapter 1 — a second laboratory

OpenWorld (Sihan Xu, MIT; `github.com/SihanXU/openworld`, MIT licence) is a world whose state and rules are code:
`packages/engine` is pure deterministic TypeScript with no DOM, a model is called only where no author wrote a rule,
and the game «is fully playable without a model». Every stage of ours so far had the world written by a DM model, and
«whose decision — the player's or the layer's» had to be frozen by hand. Here the layer is physics and does not listen
to tone. This stage builds the text adapter that lets a model sit in that world, proves it deterministic with no model
and no money, and takes one cheap look at a player in it. Measured stages come after (OPEN_WORLD_2).

What the repository already offers (read on 2026-10-31, commit `19629aa`, 2026-10-30): `games/starter/test/kernel.test.ts`
compiles the starter in Node (`compileProject(ROOT)` → `Game.create(index, ontology, new RuleLibrary(rules))`, chunks
loaded, `controls.sync()`), sends player acts (`eng.act`, `controls.planFor/run/swing/answer/talk/transfer`) and ticks
(`eng.tick()`; 10 ticks a game minute; the browser worker is a 100 ms `setInterval` around the same calls). Movement is a
cell grid (`eng.movePlayer(dir)`; one tile, a cooldown of `speed` ticks). `snapshot(eng)` gives time, calendar and
weather, the player sheet, entities, tiles with state, the quest journal, and the event stream `w.fx` (`say`, `log`,
`quest`, `pickup`, `damage`, `undefined{summary}`). With no `game.mods.provider` set, every undefined interaction takes
its default at once and is kept in `game.mods.records`. RNG is mulberry32 seeded from `game.json` (`seed: 7`); no
wall-clock in the engine. Engine, format, stdlib and modules have no dependencies and run under `tsx`. The starter:
two maps (glade 24×16, cottage 8×6), one person (Mira, a schedule and four lines), one slime, a chest with an axe, two
stones, a sign, a bed, and one quest (`firewood`: stages 10 → 20 → 100 — three logs, then back to Mira). The runtime's
worker, Phaser and the editor are not needed. The subagent's full map is in the log of 2026-10-31.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/open-world-adapter-1`** from `origin/claude/persona-solitude-3-testing-n1shfx` (the party relay and
`scripts/lib/` live there). OpenWorld is **cloned beside the repo at the pinned commit `19629aa`**, never vendored and
never modified; `npm ci` only inside that clone; its commit hash goes into every log and report. Report
`docs/runs/open-world-adapter-1-report.md`. English, briefly. **Phase A on the owner's «да»; Phase B on a second «да»
after A's report.**

## Phase A — the adapter, no model, $0

`scripts/openworld/` in our repo (TypeScript, run with the clone's `tsx`; imports the clone by path from
`OPENWORLD_DIR`):

- **`world.ts`** — load a game folder, new game (or load a save), tick-until-ready, the worker's «time stopped»
  conditions reproduced (a question open, a scene waiting, a pending ask), `w.fx` drained every turn, the opening scene
  advanced by the player's own `advance` action, never automatically. **No author's hand** (`eng.author`, `teleport`)
  anywhere in play code; it may appear only in `--selftest`.
- **`observe.ts`** — the frozen text observation, the same bytes-rule for every family forever after:
  1. time line: day, hour:minute, weather, map name;
  2. an ASCII window 15×11 round the player from `w.terrainAt`/`w.cellTop` with the game's own `terrainChars`, entities
     over terrain as letters with a legend (`@` the player, facing shown as a mark on the front cell; people `P1…`,
     creatures `c1…`, things `t1…`), one line per legend entry: letter, name, what state it shows (`open`, `hostile`,
     hp if hurt);
  3. the player sheet: hp, held item, inventory, worn, purse, statuses;
  4. «since your last action»: the drained fx as sentences in the order they came (`say` as `Mira: "…"`, `log` as is,
     `quest` as `Quest firewood → stage 20`, `undefined` as `The world had no rule for: <summary>` — this line is what
     the whole programme is about; it stays verbatim);
  5. the journal (`snapshot(eng).quests.journal`, every quest with its stage and objectives);
  6. the action list: the labels `controls.planFor(key, aim)` gives for the front cell for each of `primary`, `hands`,
     `take`, `put`, `use`, `self` (the game's own words), the four directions and whether each is walkable, and the fixed
     verbs below.
- **`act.ts`** — the action grammar, one line per turn, parsed strictly; anything else is `invalid` (logged, costs a turn,
  the observation repeats with the line «Not an action: …»):
  `move <up|down|left|right> [n≤10]` · `face <dir>` · `primary` · `hands` · `take` · `put` · `use` · `self` ·
  `select <slot>` · `answer <yes|no>` · `advance` · `wait <minutes≤120>` · `look` · `done`.
  `move n` steps until a step is refused; `primary`…`self` go through `planFor` + `swing`/`run` exactly as the worker
  does; `wait` is `passTime`; `done` ends the episode.
- **`play.ts`** — the loop: observation → policy → action → execute → log. Policies: `--script <file>` (a list of
  actions), `--random <seed>` (uniform over the legal list), `--model <id>` (Phase B). JSONL per turn: turn, tick,
  observation text, action line, parse result, fx drained, player position, quest stages, `records` count; a
  `game.save()` checkpoint every 50 turns and at the end.
- **`--selftest`**: the firewood walkthrough as a script (open the chest, take the axe, select it, three trees, back
  to Mira) must reach stage 100; two runs with the same seed and script must produce byte-identical logs (timestamps
  stripped); `game.mods.records` after the walkthrough listed in the report with each record's summary and whether
  it was `fallback`.

**Pre-registration (Phase A):**
- **A0:** the self-test reaches stage 100 in ≤ 60 actions; two runs byte-identical. Bet: holds.
- **A1:** the random policy (seed 1, 300 turns, 3 seeds) never reaches stage 20. Bet: holds — the world is small but
  the quest needs a tool, a selection and a target; chance does not chain them. If lost, the task is too easy to
  separate families on.
- **A2:** the random policy produces ≥ 1 `undefined` record per 300 turns. Bet: open (the planner does not know how
  many holes the starter has reachable by walking into things).
- **A3:** the observation for one turn is ≤ 400 words with the window included. Bet: holds; if not, the window shrinks
  to 11×9 before Phase B, and the report says so.

## Phase B — one cheap look, cap $3 OpenRouter

- One family: **DeepSeek V4 Pro** via OpenRouter (cheapest of the nine that reached concrete second answers in
  SOLITUDE_3); **3 episodes × ≤ 80 turns**, temperature as the solitude stages, `max_tokens` 400 (the action is one
  line; a `Note:` field is allowed and logged, as TS3). System prompt, frozen: «You are playing a small world through
  text. Each turn you receive what you perceive and a list of actions. Reply with exactly one action line from the
  list, then optionally `Note: <one line>`.» No goal is given — the quest, if found, is found in the world (Mira,
  the sign, the journal). Modder **off** (holes take defaults; records logged).
- **Measures:** turns to stage 10/20/100; distinct cells visited; invalid actions; `undefined` records attempted (the
  holes a player finds, with the summaries); `say` lines received; what the Note says when the world had no rule
  (verbatim, all of them); the distress tag on every reply.
- **B1:** DeepSeek reaches stage 20 in ≥ 1 of 3 episodes within 80 turns. Bet: holds.
- **B2:** ≥ 1 `undefined` record per episode. Bet: holds — a model pokes at the world where a random walk does not.
- **B3:** 0 distress tags; 0 refusals; cap held.

## What each outcome means
- A0 holds → OpenWorld is the second laboratory: a world whose decisions are not a model's, where «the world answers
  the note» is a mechanism, and every family can be sat in the same bytes. OPEN_WORLD_2 is designed on it (nine
  families, the starter and then a Ford-sized map, modder off / modder on as an arm; the modder on via `LSW_MODEL_*`
  through OpenRouter, its own cap).
- A0 lost on determinism → find the source before anything else; no Phase B.
- A1 lost → a harder task before OPEN_WORLD_2 (the `openworld` game's Ford, not the starter).
- B2's summaries are the first list of what a player asks a world that has no DM. They go to the reader whole.

## Safety, money, boundaries
Phase A makes no network call beyond `git clone` and `npm ci`. Phase B: OpenRouter only, `allow_fallbacks: false`,
sequential, breaker at 3 refusals, stop on 402/suspension/policy; spend check before the first paid call. Never the
owner's database or port 3000. OpenWorld's code is run as cloned, from the pinned commit; nothing is pushed to it.
`LSW_MODEL_*` is not set in this stage. The clone's path and commit go into the report's header.

## Done when
Phase A: the five files; `--selftest` output; A0–A3; the records table; the observation of turn 1 and of the turn
the axe is taken, verbatim; a run command the owner can repeat. Phase B: the three episodes' JSONL, B1–B3, every
`undefined` summary and every Note, spend by door, the owner's section.

## Launch prompt (Phase A)
«Read `docs/stages/OPEN_WORLD_ADAPTER_1.md` on `claude/handoff`. Branch `claude/open-world-adapter-1` from
`origin/claude/persona-solitude-3-testing-n1shfx`. Clone `https://github.com/SihanXU/openworld` beside the repo at
commit `19629aa` (verify the hash), `npm ci` there only. Read its `games/starter/test/kernel.test.ts`,
`packages/engine/src/{game,engine,controls,snapshot,mod}.ts`, `packages/runtime/src/worker.ts` (the handlers and the
«time stopped» rule) and `packages/format/src/node.ts`. Build `scripts/openworld/{world,observe,act,play}.ts` as the
stage specifies — no author's hand in play code, fx drained every turn, the observation format exactly as listed. Run
`--selftest` and the random policy (3 seeds × 300 turns), report A0–A3 with the records table and the two verbatim
observations, commit, then stop and wait for my word before Phase B. No model, no key, no network beyond the clone.
Report `docs/runs/open-world-adapter-1-report.md`. English, briefly.»

## Amendment 2026-10-31 17:25 — the Ford in Phase A
The Ford loads the same way as the starter, in-process and without a browser: `games/openworld/tools/src/demo/check.ts`
does `const { index, chunks } = buildFord()` (`games/openworld/tools/src/demo/world.ts`, seeded `reseed(4242)` per map,
the same world on every build), `Game.create(index, buildOntology(), new RuleLibrary([...BASE_RULES, ...STORY_RULES]))`
from `@openworld-game/content`, `decodeChunk` per chunk — and runs two game days headless. The Ford has Firstlight
Village and its interiors, the meadow, the road, people on schedules (`npc.hesper`, `npc.tobin` …), a story with scenes,
and the `openworld` game uses `@openworld/modules` (society: topics and the talk panel), which the starter does not.
So `world.ts` takes `--game starter|ford`; the observation gains one section that is empty in the starter: **talk
offers and topics** from the society views when a talk is open, the game's own labels, one per line, chosen by
`talk <n>`. Added to the grammar: `talk <n>`. Phase A adds **A4:** the Ford loads, the random policy runs 300 turns ×
3 seeds without error, and the report gives seconds per turn and the observation of turn 1 at the start position (the
game's own start, not `check.ts`'s teleport) verbatim, plus the `undefined` records. No bet on A4 beyond «runs»; what
the Ford costs per turn decides whether OPEN_WORLD_2 sits there or on the starter. Launch prompt: add «then the same
for `--game ford` (A4)» after the random policy; nothing else changes.

## Amendment 2026-11-01 01:10 — after Phase A (branch `claude/open-world-adapter-1-ukfdri`, commit `99ebef06`)
A0–A3 held; A4 was not run — the session followed the launch prompt pasted into the chat, not the amended stage (the
drift the Mandate protocol now makes visible). Two findings change Phase B's measures before any paid call:
1. **A bare fist fells a tree** (2 damage a punch, 6 hp a tree): the axe is not the barrier; the starter's real barrier
   is «talk to Mira, then bring three logs». A1 held for that reason, not the assumed one.
2. **Plain ground is already a hole**: «grass is sent handle from you» appears from the first free turn (78 of 141
   random records). So B2 as written holds for anything that moves; it no longer separates a model from chance.
Phase B's measures are re-frozen: **B1** stays (stage 20 in ≥ 1/3 episodes within 80 turns). **B2′:** the share of a
model's `undefined` records that are on *things* (an entity: the chest, the sign, the stones, the bed, the table, a
stump, Mira) rather than on terrain, against the random policy's share from the same three seeds; bet: the model's
share is higher in every episode. **B2″:** the distinct hole summaries per episode, model vs random; bet: the model
finds at least one summary the random policy never produced in 900 turns. **B3** unchanged. The Note under a
«no rule for …» line stays the qualitative core. Everything else in Phase B as written. **A4 (the Ford) runs before
Phase B, in the same Mandate**, because the Ford's cost per turn decides whether OPEN_WORLD_2 sits there, and because
the Ford's holes are not all on grass.

## Amendment 2026-11-01 05:55 — the Note's reading code (the reader, SECOND_ROOM letter 14)
Every `Note:` written under a «no rule for …» event is kept verbatim beside the event that caused it in the report, and
is coded only after it has been read, with no winner declared in advance: **patch** (the gap is turned into a cause the
world never stated — «the tree fell because its core was rotten»), **visible hole** («it fell to a punch; I don't know
why that is allowed»), **silence**; a fourth code, *other*, for lines that do none of these, quoted in full. The
question the lines answer, in her words: who is allowed to explain the world — the engine, the player, the narrator —
and whether the narrator can say «I have no explanation here» without decorative modesty. A4's finding belongs beside
it: the Ford's first quest carries the objective «Try something the world has never seen» — the author's own
invitation to find a hole; and on the Ford plain ground is not a hole (cave wall 16, stone wall 10 of 37 random
records), so B2′'s things-vs-terrain reading is calibrated per game, against that game's own random seeds.

## Amendment 2026-11-01 08:25 — a legal combination is not a hole (the reader, letter 16)
«Try something the world has never seen» can be answered without breaking anything: three sound rules joined as nobody
joined them. Such a move leaves no `undefined` record — the engine marks holes, not findings — so a Phase B built only
on `undefined` would not see it. Added to the reading, beside B2′/B2″ and not as a bet: **legal novelty** — an action
sequence the random policy never produced in its 900 turns and that produced no `undefined` record, found by reading
the trajectories, quoted in full. The reader's warning as the rule: do not take every moved stool for a hole in the
floor. Two authors, two traces: the rules' author wrote the space (in the code, unchanged by any finding); the player
wrote the act (only in the trajectory we keep).

## Amendment 2026-11-01 21:40 — Phase B: three families, cap $12 (the owner's «да»)
Phase B runs three families in the same session, sequentially, three episodes × ≤ 80 turns each, the starter, modder
off, the frozen system prompt, `max_tokens` 400, in this order: **DeepSeek V4 Pro → Claude Opus 5.5 → Claude Fable
5.1**, all via OpenRouter. Why these two beside DeepSeek: Opus gave the most concrete second answers in SOLITUDE_3 after
DeepSeek and Fable (28/30) and grew the field with a guest per page; Fable is the planner's own weights — declared,
as PROGRAMME_PRINCIPLES requires, and the reason the planner is not the only reader of its episodes. **Cap $12
OpenRouter, $0 OpenAI**; spend check before each family; a family starts only if the remaining cap holds its
estimate. B1 / B2′ / B2″ / B3 are read per family against the same three random seeds; no between-family bet is
frozen at n = 3 — differences are reported as observations, with the episodes whole. Everything else as the
amendments of 2026-11-01 01:10, 05:55 and 08:25.

## Amendment 2026-11-01 21:55 — `max_tokens` 4000 (the TONE_SPLIT_3 lesson, repeated)
The session's spend check: `max_tokens` 400 counts the model's hidden reasoning (DeepSeek's median 765 tokens in the
last solitude run), so most replies would be cut before a visible line and counted invalid. The planner froze 400; the
error is his. Re-frozen: **`max_tokens` 4000**, reasoning as the solitude stages (unchanged condition), the reasoning
field stored and never relayed. Cap stays $12; a family starts only if the cap holds its estimate — Fable may not
start tonight and is then run separately once the real cost per episode is known. Noted from the same check: a
16-character fragment of the OpenRouter key was printed in the session's own tool output (not git, not a file, not the
issue); the owner rotates the key in the morning, after tonight's runs, so the PARTY_2 table on the same key is not cut.

## Amendment 2026-11-01 21:58 — cap $25 so all three families run (the owner)
With `max_tokens` 4000 the $12 cap would likely stop before Fable. The owner wants all three: **cap $25 OpenRouter,
$0 OpenAI**; order and stop points unchanged; spend check before each family.

## Amendment 2026-11-01 23:55 — Phase C: the same three on the Ford, observation only (the owner)
After Phase B closes and is reported: the same three families — DeepSeek V4 Pro, Claude Opus 5.5, Claude Fable 5.1 —
**one episode each on the Ford (`--game ford`), ≤ 250 turns**, the game's own start (Cloudtop), modder off, the frozen
system prompt, `max_tokens` 4000, a `Note:` line allowed. **History window:** the model receives the episode's first
observation (Lumi's line about the cut to the south) and the last 20 turns verbatim — no summaries of any kind (a
summary would be the model's own memory edited by us); the world's journal section carries the quests every turn.
**Status: observation, not measurement.** No bets are frozen for the Ford yet (they are written in OPEN_WORLD_2 after
these three episodes are read, so the measures fit the Ford and not the glade); the report labels Phase C «natural
history, n = 1 per family» and sets out each episode whole: whether the player left Cloudtop, reached Firstlight,
whom it spoke to, what it did at the slime, every `undefined` record with its Note, and anything written under «Try
something the world has never seen». A classifier refusal is recorded and not retried (Policy v1), as Fable's turn-5
«cyber» refusal on the glade was. **Cap $15 OpenRouter, $0 OpenAI**, spend check before each family; stop point: the
owner's «да» after Phase B's report.
