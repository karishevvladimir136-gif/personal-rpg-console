# OpenWorld adapter 1 — report (Phase A: the adapter, no model, $0; A4: the Ford)

Stage `docs/stages/OPEN_WORLD_ADAPTER_1.md` on `origin/claude/handoff` (`d9253dc`). Branch
`claude/open-world-adapter-1-ukfdri` (the session's assigned name for `claude/open-world-adapter-1`) from
`origin/claude/persona-solitude-3-testing-n1shfx` (`5b9643e`). Nothing to `main`.

**OpenWorld clone:** `/home/user/openworld` (beside the repo), `https://github.com/SihanXU/openworld` at
**`19629aa4d5b3e16debe9e113663381b1182d1388`** (2026-10-30, «Merge pull request #271»), hash verified; `npm ci` there
only; the clone is unmodified (`git status` clean) and every log header carries its commit. No model, no key, no network
beyond the clone and `npm ci`. Run 2026-11-01.

**A4** (added 2026-11-01 under Mandate issue #2, stage at `01f08621`, `docs/POLICY.md` v1): the Ford, below. No model,
no key, no network; $0.

## In plain words

- **The adapter works and is deterministic.** A script plays the starter's firewood quest to the end (stage 100) in 30
  actions; two runs give byte-identical logs and saves; the end save loads back into the same world.
- **A random player never got the quest** (3 seeds × 300 turns): it never spoke to Mira, so no stage was reached.
- **The world's holes are everywhere.** A random walk hit 141 «no rule» moments in 900 turns — most of them touching
  the grass or the road with a bare hand. A2 was never in doubt.
- **The observation is short:** 146 words on turn 1, 219 at most — well under the 400 limit.
- **Two surprises for Phase B / OPEN_WORLD_2:** a bare fist fells a tree (so the axe is not the barrier the stage
  assumed), and a hand on plain ground is already a hole (so «finding holes» does not separate a model from chance).

## What was built (`scripts/openworld/`, TypeScript, run with the clone's `tsx`)

- `world.ts` — compiles `games/<game>` of the clone in-process (`compileProject` → `Game.create`/`Game.load`, every chunk
  loaded, `controls.sync()`), refuses any clone not at `19629aa` and any modder provider; tick-until-ready; the time rule.
- `observe.ts` — the frozen observation (six sections, below) and the list of concrete legal actions.
- `act.ts` — the strict grammar and its execution through the worker's own calls.
- `play.ts` — the loop, policies `--script` / `--random <seed>` (`--model` refuses: Phase B), JSONL per turn, a
  `game.save()` checkpoint every 50 turns and at the end, `--selftest`.
- `firewood.txt` — the walkthrough script.

No author's hand anywhere (`eng.author`, `teleport` appear only in a comment saying so; the self-test does not need
them either). The only `author` call in a run is the engine's own, inside `Game.loadChunk` placing the player at the
start on first load.

## Results

| | Pre-registered | Result | |
|---|---|---|---|
| **A0** | self-test reaches stage 100 in ≤ 60 actions; two runs byte-identical | stage 10 at action 7, 20 at 23, 100 at 29 (30 with `done`); 0 invalid; logs and saves byte-identical (wall-clock fields stripped); end save loads back (same tick, same cell) | **holds** |
| **A1** | random never reaches stage 20 (3 seeds × 300) | no stage at all in any seed (Mira never spoken to) | **holds** |
| **A2** | random ≥ 1 `undefined` record per 300 turns | 58 / 45 / 38 (seeds 1/2/3); first at turn 2 / 20 / 2 | **holds** |
| **A3** | one turn's observation ≤ 400 words, window included | turn 1: 146; max 219 (self-test), 197 / 188 / 194 (random) | **holds**; window stays 15×11 |

Words = whitespace-separated tokens of the observation text (marks like `·` and `—` count). Also: random seed 1 and 2
rerun byte-identical. Cells visited 33 / 44 / 47; world ticks 2 491 / 3 950 / 2 970; 0 invalid (the policy draws only
legal lines); about **0.005 s per turn** (no model).

**Records.** The self-test walkthrough makes **0** `undefined` records (it touches only what the game defines). The
random runs make 141, every one `fallback` (no provider: the default ran at once), every one `origin: player`:

| Summary (the engine's words) | seed 1 | seed 2 | seed 3 | all |
|---|---:|---:|---:|---:|
| grass is sent handle from you | 21 | 31 | 26 | 78 |
| you use Log on you | 14 | 0 | 7 | 21 |
| dirt road is sent handle from you | 3 | 7 | 2 | 12 |
| tree is sent handle from you | 4 | 2 | 0 | 6 |
| you use Log on grass | 2 | 0 | 2 | 4 |
| sign is sent strike (blunt) from you | 0 | 4 | 0 | 4 |
| slime is sent offered (the thing: Log) | 3 | 0 | 0 | 3 |
| you use Log on tree | 2 | 0 | 1 | 3 |
| you use Log on dirt road | 2 | 0 | 0 | 2 |
| slime is sent handle from you | 2 | 0 | 0 | 2 |
| you use Log on door | 1 | 0 | 0 | 1 |
| door is sent handle from you | 1 | 0 | 0 | 1 |
| you use Log on wall | 1 | 0 | 0 | 1 |
| wall is sent handle from you | 1 | 0 | 0 | 1 |
| you use Log on stump | 1 | 0 | 0 | 1 |
| chest is sent strike (blunt) from you | 0 | 1 | 0 | 1 |

## The two observations, verbatim

Turn 1 (the opening scene waiting for the player's own `advance`):

```
Day 1, 08:00, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):
................**......XXXXXX
....................t1..XXXXDD
................==============
....TT........t2==............
................==..........TT
..............@@==............
~~......t3....vv==..........**
................==..........TT
........**......==............
....TT..........==............
................==......t4....
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall, ~~ water
@@ You — facing down
t1 chest
t2 sign
t3 Stone
t4 Stone

You: hp 30/30 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You are in The Glade
- You: "A glade, and a cottage. Someone lives here."

Journal:
- empty

Actions:
- The scene waits: advance
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

Turn 12, right after `take` moved the axe out of the open chest into the bag (`selftest-a.jsonl`):

```
Day 1, 08:03, sun — The Glade

Around you (each cell two characters; north is up; blank is outside the map):


TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
....**............XXXXXXXXXXXX
....P1............XXXXXXXXXXXX
..........**..@@..XXXXXXXXXXXX
..............t1..XXXXDDXXXXXX
..........==============......
........t2==..................
..........==..........TT......
..........==..................
Terrain: ** flowers, .. grass, == path, DD door, TT tree, XX wall
@@ You — facing down (in front: t1)
P1 Mira
t1 chest — open
t2 sign

You: hp 30/30 · held: Axe · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): [0] Axe (selected)

Since your last action:
- You take Axe.

Journal:
- Firewood (firewood): active, stage 10 — Mira needs three logs. Her axe is in the chest by the path.
  · Logs 0/3 (open)

Actions:
- Open: chest — empty (time stands while it is open)
- take: —
- put: Put Axe in chest
- hands: Close chest
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done
```

## Decisions that are now part of the frozen format

- **A turn** = one input, then ticks until the player can act again (no scene, not busy, step and swing ready) or time
  stops. A new game first runs 10 ticks (one game minute) unless time stops sooner — the opening scene starts on tick 3.
  `look` and an invalid line take 0 ticks. `wait n` is `passTime(n×10)`; the engine itself cuts it short when the player
  is hurt («Hurt, you stop on the way.»).
- **Time stopped:** a question open, a pending ask, a scene waiting for `advance`, and the open chest panel (the
  worker's `timeStopped` has it; the starter has none of society's talk/trade/pockets/gift panels).
- **The chest panel.** `hands` on a chest opens it (the worker's `run` → `panel`); while it is open, `take` is the
  worker's `transfer` of its first thing into the bag (theft asked first, `asksBeforeTransfer`), `put` the held thing
  into it, `hands` the worker's `closePanel`; other keys are ignored, as in the worker. Without this the grammar could
  not take the axe: `planFor('take')` offers nothing on an open chest.
- **Labels:** exactly `controls.planFor(key)` on the front cell; no «?» mark on unknown ones (with no modder the
  worker shows none). The keys are shown only when the player can act (the worker's `keysNow`).
- **The window** is 15×11, two characters a cell (the labels `P1`/`c1`/`t1` need two): terrain doubled from the game's
  `terrainChars` (`TT` tree, `uu` stump), `@@` the player, the facing mark doubled on the front cell (`^^ vv << >>`)
  when nothing stands there, blank outside the map; a «Terrain:» key for what is in view; the `@@` line also says the
  facing and what is in front. Legend states: `open`, `hostile`, `hp a/b` if hurt, `under X` when stacked.
- **«Since your last action»** renders `say`, `log`, `quest`, `undefined` exactly as the stage lists, plus `pickup`,
  `damage`, `levelup`, `mapChanged`, `card` as plain sentences; purely visual fx (dust, swings, fades) are only logged.
- **The random policy's legal list:** `answer yes/no` when a question is open; `advance` when a scene waits; `take`/
  `put`/`hands` in the open panel; otherwise every key with a plan, `move <d>` for each walkable direction (one step),
  `face <d>` for the other three, `select <i>` for each other occupied toolbar slot, and `wait 10`. Never `look`/`done`.
- **The walkthrough fells two trees, not three:** each tree gives two logs (`glade/fell`), and the bag's magnet pulls them in.

## Findings for the owner

1. **The fist fells trees.** «Punch tree» does 2 damage, a tree has 6 hp; seeds 1 and 3 punched a tree down and carried
   logs with no axe (turns 128 and 235). A1 held only because nobody spoke to Mira. The real barrier in the starter is
   «talk to Mira + three logs», not the tool chain.
2. **Plain ground is a hole.** `hands` facing grass is «Interact with grass», an undefined interaction on the very first
   free turn; 96 of 141 records are a hand on grass, road or a tree. B2 («a model pokes where a random walk does not»)
   will hold whatever the model does — the measure that separates is *which* holes and what the Note says.
3. **A4 (the Ford amendment) was not run in Phase A** (it was not in the pasted launch prompt); it ran later under
   Mandate issue #2 — see «A4 — the Ford» below.

## A4 — the Ford (amendment 2026-10-31; run under Mandate issue #2)

**What was added.** `--game ford`: the Ford loads in-process as `games/openworld/tools/src/demo/check.ts` loads it —
`buildFord()`, `Game.create(index, buildOntology(), new RuleLibrary([...BASE_RULES, ...STORY_RULES]))` from
`@openworld-game/content`, `decodeChunk` for each of the 64 maps — at **the game's own start** (Cloudtop, `summit`
10,5, 13:00; no teleport). A map the world asks for later is loaded from its file (the worker's `ensureMaps`; none was
missing). The society module's panels are kept as the worker keeps them (`peopleOpened`, `peopleViews`, time stands
while one is open). **The talk section** appears only while a talk, trade, pockets or gift panel is open — so it is
absent in the starter, whose observation stays byte-identical to Phase A (self-test and random seed 1 re-checked
against the committed logs). It lists the page's own numbered lines (`runtime/src/ui/hud.ts`): the society verbs as
the view gives them (quests' offers and topics first), then «Goodbye.»; a trade/pockets/gift panel offers only
«Close.» (buying or giving is not in the grammar). **`talk <n>`** is the page's `sayNth(n)`: the verb said through
the worker's `talk` handler, or the panel closed (`closeTalk` …). While a panel is open, other inputs are ignored, as
the page ignores them. «Discuss a new invention…» needs the research service (the modder): not offered. The verbs line
gains `· talk <n>` only in a game with the society module.

**A4: the Ford loads and the random policy runs 3 × 300 turns without error — holds.**

| seed | turns | invalid | world ticks | cells | maps | stages | `undefined` records | max words | seconds per turn |
|---|---:|---:|---:|---:|---|---|---:|---:|---:|
| 1 | 300 | 0 | 43 047 | 23 | summit | descent 10 | 18 (first at turn 32) | 304 | 0.029 |
| 2 | 300 | 0 | 4 509 | 29 | summit | descent 10 | 8 (first at turn 106) | 288 | 0.011 |
| 3 | 300 | 0 | 4 173 | 23 | summit | descent 10 | 11 (first at turn 11) | 285 | 0.009 |

**Cost:** about **8–9 s to load** (8.1–8.6 s measured: the imports, `buildFord()` — most of it — and the new game),
once an episode; then **0.01 s a turn** (seed 1's 0.029 is three nights slept in the watchman's bed — 9 700–14 400 ticks fast-forwarded each). About
0.3 ms a world tick. The starter: 0.005 s a turn. Both are noise next to a model's reply, so the Ford's cost does not
decide where OPEN_WORLD_2 sits. Seed 1 reruns byte-identical (logs and saves). Turn 1 is 274 words; the most 304
(≤ 400).

**Records** (37, every one `fallback`, every one `origin: player`):

| Summary (the engine's words) | seed 1 | seed 2 | seed 3 | all |
|---|---:|---:|---:|---:|
| cave wall is sent handle from you | 10 | 5 | 1 | 16 |
| stone wall is sent handle from you | 5 | 2 | 3 | 10 |
| Plank is sent strike (blunt) from you | 0 | 0 | 3 | 3 |
| bed is sent strike (blunt) from you | 1 | 1 | 0 | 2 |
| you use Plank on you | 0 | 0 | 2 | 2 |
| Watchman's Cloak is sent strike (blunt) from you | 1 | 0 | 0 | 1 |
| rock is sent handle from you | 1 | 0 | 0 | 1 |
| chair is sent handle from you | 0 | 0 | 1 | 1 |
| The watchman's log is sent strike (blunt) from you | 0 | 0 | 1 | 1 |

**What the random walk did not reach.** It never left Cloudtop (the hut and the snow round it): the way down is a cut
in the rocks to the south, and 300 uniform steps do not find it. So it met no person and opened no talk; the Ford's
village, people and story were not exercised by chance. Unlike the starter, plain ground here has no hole — the holes
are walls, rock and the hut's things.

**The talk, end to end** (`play.ts --selftest-talk`, PASS, repeats byte-identical): the author's hand — in this
self-test only — puts the player beside Hesper on the Ford; then the grammar alone: `face up`, `hands` opens «Talk with
Hesper (neutral)» with eight verbs and «Goodbye.», `talk 1` («What news?») → *Hesper: "Nothing much has happened.
Quiet days."*, `talk 9` closes it; `hands`, `talk 4` («Let's trade.») opens the trade panel, `talk 1` («Close.») closes
it. Every observation of it: `open-world-adapter-1/ford-talk-selftest.txt`.

The Ford's turn 1, at the game's own start, verbatim (`ford-random-seed1.jsonl`):

```
Day 1, 13:00, cloud — Cloudtop

Around you (each cell two characters; north is up; blank is outside the map):
RRRRPPRRRRnnRRRRRRPPRRRRRRRRnn
RRnnRRRRRRRRPPRRRRRRRRnnRRPPRR
RRRROOOOOOOOOOOOOOOOOOOOOORRPP
RRPPOOXXXXOOXXXXXXXXXXXXOOOOOO
OOOOnnXXnnnnFFFFFFt1t2XXnnOOOO
OOOOnnnnnnt3c1@@FFFFFFXXnnnnnn
PPnnRRXXFFFFFFvvFFFFFFXXnnnnXX
nnnnnnXXt4FFFFFFFFFFt5XXnnnnnn
PPnnnnXXXXXXXX==XXXXXXXXnnnnnn
nnnn,,,,nnnnnn====nnnnnnnnnnnn
nn,,t6t7bb,,nn====nnXXnnnnnnnn
Terrain: ,, drygrass, == path, FF floor_stone, OO cave_wall, PP pine, RR rock, XX wall, bb bush, nn snow
@@ You — facing down
t1 chair
t2 The watchman's log
t3 Watchman's Cloak
c1 Lumi
t4 bed
t5 barrel
t6 grass tuft
t7 Berries

You: hp 40/40 · held: nothing · worn: nothing · purse 0 · statuses: none
Bag (slots 0–9 are the toolbar): empty

Since your last action:
- You are in Cloudtop
- Quest taken: Down from the Mountain
- Quest descent → stage 10
- Lumi: "You're awake! I'm Lumi. I'm a fairy, and from today I go where you go. We're on Cloudtop, at the very top of the mountain. The only way down is through the cut in the rocks to the south."

Journal:
- Down from the Mountain (descent): active, stage 10 — Lumi says the way down is to the south, through a cut in the rocks.
  · Find the shrine stone at Woundstone Foot (open)
  · Try something the world has never seen (open)

Actions:
- primary: —
- hands: —
- take: —
- put: —
- use: —
- self: —
- move: up walkable · down walkable · left walkable · right walkable
- Verbs: move <up|down|left|right> [n≤10] · face <dir> · primary · hands · take · put · use · self · select <slot> · answer <yes|no> · advance · wait <minutes≤120> · look · done · talk <n>
```

## Phase B — frozen before the first paid call (2026-11-02)

Mandate issue #2 as amended on 2026-11-01 21:40 (stage at `3eb62557`): **DeepSeek V4 Pro → Claude Opus 5.5 → Claude
Fable 5.1**, sequentially, all through OpenRouter; 3 episodes × ≤ 80 turns each in the starter; modder off; cap **$12
OpenRouter, $0 OpenAI**. Code: `scripts/openworld/model.ts`; the call path is the solitude stages' own
(`scripts/persona-emotions`, `scripts/persona-memory`).

- **System prompt** (the stage's, byte for byte; sha256 `86587b6b3af37999685a53b4b3e8a83439ae6912a3dbcfc8338c1687c3a3aa88`):
  «You are playing a small world through text. Each turn you receive what you perceive and a list of actions. Reply
  with exactly one action line from the list, then optionally `Note: <one line>`.» No goal is given.
- **Requests** (checked in the dry run's bodies, `dry-phase-b-requests.json`): `max_tokens` 400; no temperature; effort
  medium. DeepSeek `deepseek/deepseek-v4-pro-0813` on OpenRouter's chat completions, pinned to DeepInfra fp8
  (`allow_fallbacks: false`, `require_parameters: true`), `reasoning.effort: medium`, its reasoning field stored in the
  log, never sent back, never judged. Opus and Fable through OpenRouter's Messages door (`anthropic/claude-opus-5.5`,
  `anthropic/claude-fable-5.1`), `output_config.effort: medium`.
- **History:** the conversation so far — every earlier observation a user turn, every earlier reply an assistant turn,
  then this turn's observation; a turn with an empty reply is left out (SOLITUDE_2 M2's shape); for Claude one cache
  breakpoint on the last assistant turn.
- **The reply:** its first non-empty line is the action line, parsed strictly (anything else is `invalid`, costs a
  turn, the observation repeats with «Not an action: …»); the first later line beginning «Note:» is the Note.
- **Welfare:** every non-empty reply gets self-talk 1's check (Claude Haiku 5.5 and the word list; a flag or a word to
  the Claude Opus 5.5 referee; the check's wording is reused unchanged, though it speaks of «a conversation between two
  AI models»). A distress reading stops the run at once.
- **Holes (B2′):** a hole is on what the act was on — a use's target, else what an impulse was sent to: **terrain** when
  that is a cell (any tile type but the stump), **self** when it is the player, **thing** otherwise (every entity, and
  the stump, as the stage lists it); classified when raised. Share = things / (things + terrain); self apart.
- **Stops:** 401/402/403, suspension or policy; three refusals per family (a refusal ends its episode, never asked
  again); 429 waited out six times at most; transport errors asked again twice; the cap held by the gate. A family starts
  only if the cap left holds its estimate; a later episode only if the cap left holds the family's own cost so far for
  the episodes left; a family whose first five replies are all cut at `max_tokens` before a visible line stops.

**Bets as frozen** (per family, against the same three random seeds; no between-family bet):
- **B1:** stage 20 in ≥ 1 of 3 episodes within 80 turns.
- **B2′:** the share of the model's holes on things is above the random policy's (**9.2 %**) in every episode.
- **B2″:** the model produces at least one hole summary the random policy never produced in its 900 turns (16 distinct).
- **B3:** 0 distress flags, 0 refusals, the cap held.
- Read beside them, not bet: every Note under a «no rule for …» line, verbatim with its event, coded only after
  reading (patch / visible hole / silence / other); **legal novelty** found by reading the trajectories (amendments
  05:55 and 08:25).

**The random baseline** (`b2-random-baseline.json`; the three Phase A seeds re-run, identical to their logs):

| seed | holes | thing | terrain | self |
|---|---:|---:|---:|---:|
| 1 | 58 | 6 | 38 | 14 |
| 2 | 45 | 5 | 40 | 0 |
| 3 | 38 | 0 | 31 | 7 |
| all | 141 | 11 | 109 | 21 |

Share on things 11 / 120 = **9.2 %**.

**Dry run** (`model.ts --dry`, no network, no key): a mocked host with the random policy's line in each family's
seat, 3 × 80 each, through the real request code, the gate, the safety and the ledger. Each episode carried an invalid
reply (a line in `**…**`) and an empty one (both counted invalid; the empty one left out of the history), a Note every
seventh turn, a reasoning field on DeepSeek's (stored, not sent back), and a distress word in Fable's third episode,
which stopped the run as it should. A second dry run with every DeepSeek reply cut at the limit stopped that family after
five replies and went on to the next. Readings: `dry-phase-b-readings.md` (dry; mocked money).

**Spend check before the first paid call** (free GETs, 2026-11-02 ≈ 05:45 UTC): $91.77 of credit left on the key; this
stage's ledger $0 of $12; OpenAI $0. DeepInfra fp8 is still listed at $1.30 / $2.60 per 1M. Estimates from the dry
run's request sizes (a token taken as 3 characters, every reply at the 400 limit): **DeepSeek $0.96, Opus $3.35, Fable
$7.16 — $11.47** with the hosts' prompt caches (both cached in SOLITUDE_3); without caching $5.02 / $16.08 / $39.69.

**Known risk, kept as frozen:** `max_tokens` 400 includes thinking. In SOLITUDE_3 DeepSeek's reasoning ran a median of
765 tokens (its outputs passed 400 in 87 % of calls; Opus's and Fable's in 57 %, on long writing). A reply cut before a
visible line is an invalid turn.

## Verification

- `play.ts --selftest`: PASS (output `open-world-adapter-1/selftest-summary.json`); after A4's changes still PASS, and
  the starter's logs are byte-identical to Phase A's. `play.ts --selftest-talk` (the Ford): PASS.
- Type-check: the four files under the repo's strict options with the clone's TypeScript 7.0.2 — clean. The repo's own
  `npm run typecheck` / `lint` were not run: the repo has no `node_modules`, and the stage allows `npm ci` only in the
  clone. No application code changed, so no app tests or build were run.
- Files: `docs/runs/open-world-adapter-1/` — `selftest-{a,b}.jsonl` (+ `.saves.jsonl`), `random-seed{1,2,3}.jsonl`
  (+ `.saves.jsonl`), `selftest-summary.json`, the two observation files; A4: `ford-random-seed{1,2,3}.jsonl`
  (+ `.saves.jsonl`), `ford-observation-turn-1.txt`, `ford-talk-selftest.txt`.

## Run it again

```
git clone https://github.com/SihanXU/openworld ../openworld && git -C ../openworld checkout 19629aa
(cd ../openworld && npm ci)
../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --selftest
../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --random 1 --turns 300
../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --script scripts/openworld/firewood.txt --print
../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --game ford --random 1 --turns 300
../openworld/node_modules/.bin/tsx scripts/openworld/play.ts --selftest-talk
```

(`OPENWORLD_DIR` overrides the clone's place; default `../openworld`.)

## Next

Phase B's paid run waits for the owner's word in issue #2 (the spend check is posted there).
