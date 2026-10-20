# 2D Live, first slice — report (`docs/stages/LIVE2D_1.md`, Part 1)

Branch `claude/live2d-1-9lq5bf` (the cloud session's name for `claude/live2d-1`) from `origin/claude/session-2-prep`
(`d74b6c6`). Cloud session, environment `rpg-console`, 2026-10-20. Part 2 (the combat screen) follows on the same
branch; its section is appended below as it lands.

## What was built (Part 1)

The rule over everything held: **the DM and the rules decide what happened; the records remember it; the 2D layer only
shows it and turns clicks into intents in the action box.** Text play keeps working with the «2D» screen closed; nothing
on the screen moves the party, opens a door or starts a talk.

1. **The region map** (`src/lib/live2d/region.ts`, `server/region.ts`). A stable painted map of the region the party
   travels, drawn once from the places the records know, laid out by the existing atlas placement code
   (`src/lib/map/*`): the places as marks (known / visited / rumoured), the party's marker, the road between the places
   visited. It is redrawn only when a new place appears in the region (the map keeps a signature of the places drawn;
   the screen says «На карте появилось новое место: …» and offers «Перерисовать»). A campaign whose places all sit at
   the world level (session 2) gets the flat «known region»; a campaign with region-level places gets one map per region.
   Marker visibility: **Выкл. / Только цель / Обычно / Всё известное** — presentation only, saved per campaign, with the
   latent hooks never an input (so no mode can show them). The atlas's «Мир» level is untouched; the existing location
   paintings stay each place's illustration and serve as the town/district backgrounds.
2. **Travel on the map** (`src/lib/live2d/travel.ts`). When a committed turn moved the party (`move_party`), the marker
   glides from the old place to the new one, its length from the turn's travel time (1.2 s + 25 ms a minute, at most
   9 s); an interrupting turn retargets the glide from where the marker is. A click on a known place writes «Идём в
   <место>.» into the action box; a place with children offers «Открыть».
3. **The local scene with interactive points** (`src/lib/live2d/scene.ts`, `server/scenes.ts`). A visited place gets a
   scene: the **scene sheet** first (Claude Sonnet 5.5 from the records and the public narration that mentions the
   place: layout, exits, notable objects, light, time of day, what is never there, who is present and where they
   stand), then one picture on the quality tier without people (GPT Image 2.5 Sunburst, the campaign's style, the
   place's own illustration as a reference so the scene and the turn's frames agree), then the **check** by a strong
   vision model (Sonnet 5.5): every must-show item visible and locatable, no prominent object that contradicts the
   sheet, no named people in the background. A miss or a contradiction earns **one** corrected redraw; still wrong →
   the scene is flagged for the owner and the missing items go to a side list («Здесь также: погреб»), never a guessed
   marker. The **locator** (Claude Haiku 5.5) returns positions only for the sheet's features; a person present stands
   at the feature the sheet put them at, as a portrait token; confidence below 0.6 shows as a dashed «approximate»
   ring. Hover shows the label and what is known; a click writes «Подхожу к …» / «Осматриваю …» / «Иду в …» into the
   action box. The owner can drag a marker, hide it, edit the sheet, or redraw with a one-line comment (his placement
   is kept through later locator runs).
4. **The hierarchy and lazy detail** (`src/lib/live2d/hierarchy.ts`). World › region › town › district › scene from
   the records (a town is a place with child places by the DM's own `parentId`), a breadcrumb between scales, «Текст»
   one click away at every level. A level exists when the records give it content; a scene only once the place was
   visited; a known, unvisited place opens at its region.
5. **POI seeds — the DM's hidden layer** (`server/region.ts` → `seedArea`, table `rpg_private.live2d_seeds`). With the
   first map of an area the server asks Sonnet for 3–5 latent hooks (a theme and a private premise each) and stores
   them privately in the `note_world` fact shape (`poi_seed_<area>_<n>`), never in the public board (the parser refuses
   a board that carries a `seeds` key). `seed.discover` turns one into a public POI. How the fix run's hidden layer
   absorbs them is a proposal below.

Storage: migration `202610210200_live2d.sql` (additive): `live2d_scenes` (+ append-only `live2d_scene_versions`),
`live2d_pois`, `live2d_region_maps`, `live2d_seeds`, `live2d_settings`, the RPC `public.rpg_live2d`; the Stage V picture
catalogue gains the `scene`, `region` and `battle` compositions. Scene and region pictures are ordinary Stage V picture
rows (the daily cap, the signed URLs, the board polling, «Скрыть» all apply).

## Quality — measured, not assumed

`scripts/eval/live2d/probe.mjs`: eight synthetic places (a warehouse, a temple, a mine yard, a forest camp, a tavern, a
ford, a market, a guard post; invented names, Russian records and passages) through the production chain. Results in
`docs/runs/live2d-1-probe-results.json`; pictures in `docs/samples/live2d/`.

| Place | Must show | First pass found / contradictions | Final found | Redraws | People in background | POIs placed (approx.) | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Кривой брод | 5 | 5/5 · 0 | 5/5 | 0 | no | 7/7 (3) | $0.047 |
| Склад Гребня | 5 | 5/5 · 1 (an extra opening on the left) | 5/5 · 0 | 1 | no | 7/7 (1) | $0.086 |
| Храм Тихой Воды | 4 | 4/4 · 0 | 4/4 | 0 | no | 6/6 (2) | $0.046 |
| Двор Старой Шахты | 4 | 4/4 · 1 (the cart's wheel count) | 4/4 · 0 | 1 | no | 6/6 (1) | $0.085 |
| Лагерь у Чёрного Ручья | 4 | 4/4 · 0 | 4/4 | 0 | no | 7/7 (2) | $0.047 |
| Таверна «Кривой Якорь» | 5 | 5/5 · 0 | 5/5 | 0 | no | 8/8 (2) | $0.048 |
| Рыночная площадь | 5 | 5/5 · 0 | 5/5 | 0 | no (crowd extras, as the sheet allows) | 7/7 (2) | $0.048 |
| Застава у Южных ворот | 5 | 5/5 · 0 | 5/5 | 0 | no | 6/7 (0) | $0.047 |

- **«Must show» found after at most one redraw: 100 % (37/37 items, 8/8 places).** First pass complete without a
  contradiction: 6/8. Redraw rate 2/8 (both for one contradicting detail; both redraws came back clean).
- Contradicting objects after the chain: **0**. Named people in backgrounds: **0** (the market's anonymous crowd is the
  sheet's `crowded` case). Markers for things not in the records: **0** by construction (the locator may only return
  the sheet's keys; an invented key is dropped — tested).
- Cost per scene: **$0.057 mean** ($0.046–$0.086 with a redraw): the sheet ≈ $0.009, the picture ≈ $0.032, the check
  ≈ $0.006, the locator < $0.001. The region map $0.03 + the seeds $0.01.
- The one weak spot: on the first run the check's reply for the warehouse was unparsable (the model wrote prose
  around the JSON); the parser now takes the last JSON object in the reply and the check has room for its reasoning
  (6 000 tokens); an unchecked scene is **flagged**, never passed. The re-run was clean.
- Timings: a scene picture 30–36 s, the sheet 5–6 s, the check 8–12 s, the locator 1–2.5 s — about 45 s per place,
  85 s with a redraw.

## Money

`docs/runs/live2d-1-ledger.md` / `.json`: **$0.73 of the $40 cap** after Part 1 (46 calls: 8 + 2 scene pictures, 1
region map, 4 preview-art pictures, 10 sheets/checks ×2, 9 locator calls, 1 seeds call).

## Verification

- `tests/live2d-model.test.mjs` 9, `tests/live2d-sql.test.mjs` 2, `tests/live2d-vision.test.mjs` 3,
  `tests/live2d-ui.test.mjs` 4 — green; typecheck, lint (zero warnings), build — pass at the Part 1d commit.
- Screenshots `docs/runs/live2d-1-shots/`: the synthetic walk world › region (with the glide) › town › district › scene
  (RU and EN) at 1920×1080, 2560×1440 and 390×844 — 21 shots, zero horizontal overflow, nothing clipped on the phone
  (`index.json`). Preview route `/preview/live2d?level=…&travel=1`.
- The full suite on the final code: see the Part 2 section when it closes (the suite runs once on the frozen candidate).

## Shared files touched (outside `src/lib/live2d`, `src/components/live2d`, the new route and tests)

- `src/lib/visual-frame/pictures.ts` — `PictureComposition` and `COMPOSITIONS` gain `scene`, `region`, `battle`.
- `src/lib/visual-frame/fal-image.ts` — the same three in `FalComposition`, `COMPOSITION_SIZE` (scene/region wide,
  battle 4:3) and the fallback framing text.
- `src/app/campaigns/[campaignId]/[screen]/page.tsx` — `case "live"` (one line + the import).
- `src/components/registry/shell.tsx` — `"live"` in `CampaignScreenId`, one nav item «2D» after «Карта», the icon import.
- `tests/integration-saves.test.mjs` — the ordered migration list gains the new files.
- `src/lib/gameplay/dm-loop/*` — **untouched in Part 1** (Part 2 touches the `combat` tool, `context.ts` by one line, and
  adds `battlefield.ts`; listed in its section).

## Proposals for the fix run (not implemented here, by the stage's rule)

1. **The scene sheet in the DM's context.** For the current place with a scene, one block from
   `sheetForDm(sheet, placeName)` (`src/lib/live2d/scene.ts`): «Scene sheet of <place> (what the drawn scene shows;
   keep narration consistent with it): … Features: … Not there: … Light: …». Wire it next to `currentPlace` in
   `currentState` (context.ts), read from `rpg_live2d` `read` by the runtime source. ≈ 120 tokens per place.
2. **Seeds into the hidden layer.** `live2d_seeds` rows are already in the `note_world` fact shape
   (`poi_seed_<area>_<n>` → the premise). At integration, the DM prep step (key finding 2) can read them through
   `listSeeds` (`server/store.ts`) into the private notes, and a `note_world` with a `poi_seed_` key could call
   `seed.discover` when the DM marks one as found — then a public POI appears on the map and the scene.
3. **A DM tool for the scene.** `scene_note {placeRef, add: [feature…], remove: […]}` so a fire, a battle or a new door
   changes the sheet (and marks the scene for a redraw) without the owner's hand; the server would bump the sheet's
   revision and keep the picture until the owner redraws.

## Needs the owner

- The «2D» nav item's label («2D» / «2D Live») and its place after «Карта» — rename at will.
- The default marker mode is **Обычно** (Standard); say if «Всё известное» should be the default.
- Seeds are planted with the first region map only (one Sonnet call, ~$0.01). Say if a «seed more» button on the
  region (the direction doc's «this area is boring») should exist before the Chat-with-DM director does it.
- The region map for a flat campaign is drawn once for all world-level places; when session 2's places get a region
  record (item 31's «Побережье Мечей»), the map follows the region anchor and is drawn afresh for it.

---

# Part 2 — the combat screen and the battle map

## What was built

**The fight lives on the server, in the encounter rows** (`src/lib/live2d/battle/contracts.ts`, migration
`202610210201_live2d_battle.sql`): per combatant in `encounter_participants.public_resources` (initiative, the active
flag, side, the action economy — action / bonus / reaction / movement left and max —, conditions as the system's words,
death-save pips, the enemy's HP mirror, «what is known» lines, the noticed intent, armour class and the damage types
resisted / ignored / feared) and `public_position` (the zone word plus the grid cell `x, y` and the elevation `z`); the
battlefield in the encounter's new `public_field` (the grid, features — cover with half / three-quarters / full,
difficult ground, light sources with a radius, burning areas, walls, elevation —, the ambient light, the active turn
pointer, the planned-ambush flag, the pending reaction, the roll log, the rules switch). The turn's commit carries it
atomically with everything else; the play projection returns it to every client; an old encounter reads as «no map».
No rule of any system is in code: the grid is 5-ft cells, the words and numbers come from the DM.

**The `combat` tool grew** (`src/lib/gameplay/dm-loop/tools.ts`, the handler in `execute.ts`; the old `start` /
`position` / `end` keep working): `start` with placements and initiative totals, the grid, the ambient light,
`surprisedRefs` (no action in round 1), `opening: "party"` (the owner's house rule: the party's declared ambush resolves
before initiative), stat-block `hp` rows with AC, resistances and speed, `rules` on/off; `place` (a late arrival joins);
`move` to a cell — the server measures the path (difficult ground doubles it, a wall blocks), spends movement and names
the foes who may take an opportunity attack; `next_turn` (the order kept, the round counter, the economy restored at the
start of one's turn, surprise cleared after round 1); `attack` (below); `condition` with `deathSave`; `hp` for enemies
(the party's goes through `resource`), logged with who dealt it; `profile`; `feature` add/update/remove; `known`;
`intent` with who noticed it; `reaction` (the trigger and the options; the DM ends the turn so the player chooses; the
card writes «Реакция: <option>» into the action box; `resolved: true` clears it); `log`; `end` with the fight's card
(rounds, damage dealt and taken, hits, misses, crits, close calls, the fallen). Every player-visible line is a chip in
the campaign's language («Раунд 2 · ходит Кадрик», «Брам → (3, 4), 25 фт», «Серый: −9 (13/22)»).

**Geometry, measured not ruled** (`geometry.ts`, 4 tests + the fights): Chebyshev distance × 5 ft with elevation added,
Bresenham lines, line of sight (a wall or full cover blocks), the best cover between two cells, the light on a cell
(bright within a source's radius, dim within its dim radius, else the ambient), hazards under a cell, a move's cost,
sphere and line templates, who is caught, opportunity-attack candidates. The zone words («вплотную / рядом / далеко /
в укрытии») are **derived from the coordinates seen from the hero** every time anything moves, so the zones view and
the map never disagree (tested).

**The battlefield block** (`src/lib/gameplay/dm-loop/battlefield.ts`, wired by one line in `context.ts`): for the active
encounter, the short text the DM reads instead of the picture — per party member the distance, zone word, cover and
elevation to each foe; each foe's light, hazards, conditions and HP; the features on the field; the party's spent
economy, conditions and death saves; a pending reaction; the ambush rule. ≤ 2 400 characters. Example from the lair
probe: «Rowan: Кадрик 40 фт, далеко, укрытие на три четверти (горящая телега), выше на 10 фт; Серый 35 фт, далеко.
Кадрик: на свету, HP 18/18; Серый: вне света, HP 20/20.»

**The optional rules module** (`rules.ts`, the owner's addition; 3 tests): when the campaign's system describes them
(on by default for 5e-like systems by the rules-system name; the DM switches it per fight), `combat attack` applies what
is pure arithmetic — a condition's advantage or disadvantage (blinded, restrained, poisoned, frightened or prone
attacker; blinded, restrained, stunned, petrified, paralysed or unconscious target; prone target near / far; a ranged
attack within 5 ft; an unseen attacker or target), the auto-crit on a paralysed or unconscious target within 5 ft,
cover's +2 / +5 to AC, the crit's doubled dice, resistance / immunity / vulnerability by damage type, advantage and
disadvantage cancelling — and **names each applied rule on the card** («укрытие на три четверти: +5 к КД; сопротивление:
fire: урон вдвое меньше»). `count` rolls several attacks or rays separately (session 2's three-rays-as-one). The hero's
attack is a visible roll card (the check DTO, kind `attack`); an enemy's roll stays private. The DM still decides what
happens; the code does the sums.

**The battle background** (`server/battle.ts`, `battle.prepare`): the place's Part 1 scene sheet drawn top-down for the
grid (composition `battle`, 1024×768 → 24 × 18 cells), checked like a scene (every must-show feature from above, no
invented walls, doors or cover, no people), one corrected redraw, flagged otherwise; one per place and sheet revision;
without one the map shows plain ground, and text play never waits.

**The battle screen** (`src/components/live2d/battle/*`; the «2D» screen switches to it when a fight is on — the banner
«Идёт бой — открыть карту боя»): the header (round, place, light, whose turn), the initiative ribbon (portrait rings,
allies and foes in different colours, the active one glowing, a foe click → target), «Зоны / Карта», the map (the
picture under an SVG grid; cover hatch, burning glow, difficult stipple, walls, light radii; dark cells shaded; cells the
hero cannot see greyed; tokens that glide; foes' HP bars with numbers; condition chips; floating «−N» / «Промах» / crit
from the turn's chips; the hero's token draggable with the path, «N фт из M», «атака по возможности» on adjacent foes,
release → «Иду в клетку (x, y), N фт» / «Подхожу к <feature>, N фт» in the action box; «Шар 20 фт» / «Линия 30 фт»
templates with the caught names → «Шар в точку (x, y) — в области: …»), the fight log, the target card (HP numbers —
the owner's BG3 decision —, conditions, «Что известно» with «???», the intent only when noticed), «Твой ход» with the
economy dots and death-save pips, the reaction card, the end-of-fight card; on a phone the ribbon scrolls, the map pans
and zooms, the aside goes under the map. Nothing on it changes the state: every click is words in the action box.

## Probes

**Two scripted fights through the real loop** (`tests/live2d-fights.test.mjs`, PGlite, deterministic dice): the ford
ambush (the planned opening before initiative, a surprised bandit, zones from the coordinates, the hero's attack as a
card with the exact numbers, the record's HP mirrored, a move that leaves a foe's reach naming the opportunity attack,
round wrap, death saves 1✓/1✗, the end card summing the log, the block gone from the context after the fight) and the
lair (a caster on a ledge z = 10, a burning cart as three-quarters cover, a torch in the dark, the battlefield text with
distance + elevation + cover + light, a ranged attack through cover with +5 AC and the fire resistance halving the
damage, a pending reaction the DM is told about, a move into a wall refused, a move through the fire reported). The
battlefield text reaches the next turn's context («Поле боя»).

**Screenshots per round** (`docs/runs/live2d-1-shots/battle-*`): the ford rounds 1–4 and the zones view, the lair
rounds 1–3, at 1920 and 390 (the last round of each at 2560) — from the synthetic fixtures
(`src/lib/ui/preview/live2d-battle-fixture.ts`), zero overflow; the scrolling ribbon is the one legitimate overflow and
the width check now knows a horizontal scroll region.

**Live DM probes** (scenarios `20-live2d-ford`, `21-live2d-lair`; Claude Opus 5.5 at `high`, the bench harness with a
hard budget of $3.5 a run; records `docs/runs/20261020-081119-…-ford.jsonl`, `…-080656-…-lair.jsonl`; the tables from
`node scripts/eval/live2d/fights-report.mjs <record> [--lines]`).

| Fight | Turns | Committed | Mean turn | First word | Cost | Combat actions the DM used | Rejected calls |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Ford ambush | 5 | 5 | 77 s | 33 s | $1.61 | start, feature ×2, attack ×5, move ×5, next_turn ×4, intent ×3, known, log ×2, condition ×2, end | move ×3 (a flee past the grid edge) |
| Lair | 5 | 4 | 106 s | 42 s | $2.80 | start, feature ×6, attack ×13, move ×8, next_turn ×10, hp ×2, known, intent, condition ×3, log ×6, end | attack ×2 (no `ac` for the hero in turn 1; no damage formula once) |

The lair's fifth turn was cut by the bench's own $3.5 guard after 33 model requests (the fight had reached `end` by
then: the guard did its job, the run is counted whole in the ledger). Both fights ran to their end card.

*The DM's battlefield text checked against the map.* The ford: the DM built the field itself (the river as 36 cells
of difficult ground, the boulders as half cover); the server then added +2 AC from the boulders to the bolt and the
arrow across them and the DM narrated exactly that («болт чиркнул по валуну в ладони от головы Тобина», «стрела над
краем валуна»); Ян's charge «crosses брод» cost him all 30 ft and left him at (6, 6), the hero stepped to (5, 6), and the
text says «застрял по бёдра в воде у самого берега, в двух шагах от Ярвен» — 5 ft on the grid. The lair: the DM's
out-of-game advice to the player — «путь в обход телеги и вверх на уступ стоит примерно 40 футов движения, а у тебя 30»,
«если уйдёшь от Серого, он ударит тебе вдогонку», «Огненный снаряд в упор пойдёт с помехой, потому что громила стоит
вплотную» — is the server's block read back (Кадрик 40 ft and 10 ft up, Серый adjacent after his move to (4, 7)). With
the rules module off (the lair fixture's system is not 5e-like and the DM did not switch it on), the DM did the cover
arithmetic itself from the block: Кадрик's ray against the hero behind the burning cart was rolled against AC 24
(14 + Shield 5 + three-quarters cover 5) — consistent with the map; with the module on (the ford), the server adds the
cover and names it on the card. No narrated distance, cover or light contradicted the field in either run.

*Findings fixed from the runs (code).* (1) The first attempts died at the end of every turn with a bare «validation»
after all tool calls had been accepted: the 300 s turn lease expired on 100–200 s fight turns (the owner's known «stuck
long turn» bug); the fix branch `claude/stage-fix-turn-lease` (migration 71, every receipt renews the lease) is merged
into this branch and the fix run was told to merge it first too. (2) The hero's opening blow against a foe created in
the same turn was rejected at commit (`dm_tool` checks a card's target against the DB): the attack card now carries
`targetId: null` for a target not yet persisted; regression in the fights test. (3) The DM moved the fleeing Пузо past
the edge of the grid three turns running and was refused each time: a move past the edge is now leaving the field
(withdrawn, `fled`, out of the order; the token stays where it left); regression in the fights test. (4) The DM
narrated the 5e rule «a ranged attack with a hostile at your elbow is at disadvantage» for a target 40 ft away; the
module applied it only when the *target* was adjacent — it now applies to any hostile able to act within 5 ft of the
shooter (the server measures it); rules test.

*Findings for the DM's behaviour (not code; the prompt is the fix run's).* In the ford the player's declared attacks in
turns 2–4 («Бью Яна ещё раз», «стреляю в него из лука», «Добиваю того, кто ближе») were never rolled: the DM narrated
the foes' turns first (initiative order) and the hero's never came before the surrender — one round per two turns and
a player who did not get to swing. In the lair the DM asked the player a question instead of acting on «лезу на уступ»
(a reasonable pause: the route cost more movement than the hero had). The DM's first attack in the lair lacked the
hero's `ac` (the loop hero has an empty stat block; the sheet-AC fallback found nothing) and it recovered on the next
call. The `contextIncludes "Поле боя"` check the scenarios carried reads «no request context recorded» on every live
turn — the bench records the request context only for scripted models — so it was dropped from the two scenarios;
the scripted fights test asserts the block.

**Seconds per combat turn, before and after a lower continuation depth** (the stage's question). The runtime picked
`xhigh` for every continuation request of the fights on its own («important turn» logic); the «after» run forces
`--continuation-effort medium` on the same ford scenario.

| Ford run | Continuations | Turns committed | Mean turn | Mean first word | Cost |
| --- | --- | --- | --- | --- | --- |
| before (`20261020-081119`) | xhigh (chosen) | 5 / 5 | 77.4 s | 33.3 s | $1.61 |
| after (`20261020-081900`) | medium (forced) | 4 / 5 (the fifth cut by the $2.5 guard) | 78.9 s | 34.8 s | $1.89 |

Reading the records per request: a continuation at `medium` answers in 8.8 s on average against 12.8 s at `xhigh`
(−31 %), but the first request of every turn stays at `xhigh` (41 s before, 43 s after) and the `medium` DM made more
calls to do the same fight (26 requests against 19), so **the seconds per combat turn did not move** (77 s → 79 s). The
turn's time is the first, deliberating request plus the number of tool rounds, not the continuations' depth; the lever
for a faster fight is fewer tool rounds per turn (the DM batching its combat calls) or a cheaper first request, which is
the fix run's prompt work, not this slice. The `medium` DM did roll the hero's declared attacks in every turn, where the
`xhigh` one narrated around them — one run each, so a hint, not a finding.

## Money (Part 2)

`docs/runs/live2d-1-ledger.md`: **$9.93 of the $40 cap** after Part 2 — Part 1 $0.73; the live fights
$9.20 (ford attempts 1–3 that died at commit $2.40, the ford $1.61, the lair $2.80, the comparison run
$$1.89, the stopped first lair attempt $0.50). No image calls in Part 2 (the battle background is drawn on the
owner's click; the probes use the synthetic fixtures).

## Verification (Part 2, the frozen candidate)

- The slice's tests `tests/live2d-*.test.mjs` 34/34 (model 9, SQL 2, vision 3, UI 4, battle 4, rules 3, battle SQL 1,
  battle UI 6, fights 2); typecheck pass; lint pass (zero warnings); build pass (the preview server that took the
  screenshots serves that build).
- The full suite on the frozen candidate (`node --test --test-concurrency=2 tests/*.test.mjs`, Node 22): **2 661 tests ·
  2 630 pass · 27 skipped · 3 cancelled · 1 fail.** The 3 cancelled are three tests of `tests/d2a-composition.test.mjs`
  («Promise resolution is still pending but the event loop has already resolved») — identical on the branch base
  `d74b6c6` in a clean worktree, an environment artefact of this runner, no file of this slice. The 1 fail was the
  tool-schema size bound in `tests/stage4-dossier.test.mjs` (< 9 500 estimated tokens): the grown `combat` tool put the
  sixteen tools at 12 091. Fixed after the run: the combat schema's descriptions trimmed (3 289 → 2 645 tokens for the
  tool, 11 468 for the set) and the bound raised to 12 000 (the schema sits in the cached prefix; the test's comment
  records the growth per stage); that file, the slice's tests and the dm-loop tests ran again, 84/84 green; typecheck and
  lint pass on the final code. The Windows CRLF artefacts earlier stages list did not fail on this Linux checkout.
- Screenshots `docs/runs/live2d-1-shots/`: 39 shots (the walk at three widths, the fights round by round at 1920 and
  390, the last round of each at 2560), zero horizontal overflow, nothing clipped (`index.json`).
- Live records committed: `docs/runs/20261020-081119-loop-opus-live-20-live2d-ford.jsonl`,
  `20261020-080656-loop-opus-live-21-live2d-lair.jsonl`, `20261020-081900-loop-opus-live-20-live2d-ford.jsonl` (the
  comparison run), `20261020-080121-loop-opus-live-20-live2d-ford.jsonl` (the lease-expiry attempt, for the fix run).

## Shared files touched in Part 2 (outside `src/lib/live2d`, `src/components/live2d`, the new routes and tests)

- `src/lib/gameplay/dm-loop/tools.ts` — the `combat` tool's schema only (the actions and their parameters;
  `strict: { anthropic: false }` for the optional keys).
- `src/lib/gameplay/dm-loop/execute.ts` — the `combat` handler only (rewritten around `src/lib/live2d/battle/*`;
  `start` / `position` / `end` keep their old inputs).
- `src/lib/gameplay/dm-loop/context.ts` — one line (+ the import) adding the battlefield block to the tail parts.
- `src/lib/gameplay/dm-loop/battlefield.ts` — new: the block, built from the active encounter.
- `src/lib/gameplay/contracts.ts` — `EncounterRecord.public_field?` (2 lines).
- `supabase/migrations/202610210201_live2d_battle.sql` — `rpg_encounters.public_field`; patches in place (the
  migrations 64/67 pattern) `rpg_private.runtime_change_before_astra_ordered` (the encounter field list),
  `rpg_private.runtime_play` (the projection) and `rpg_live2d` (`battleMaps`, `battle.save`); the private table
  `rpg_private.live2d_battle_maps`.
- `tests/integration-saves.test.mjs` — the ordered migration list (+ 71, 200, 201).
- `tests/stage4-dossier.test.mjs` — the tool-schema size bound 9 500 → 12 000 (the grown `combat` tool; see
  Verification).
- `DEV_STATUS.md` — the top section.
- From the merge of `origin/claude/stage-fix-turn-lease` (identical to that branch, not edited here): `docs/TURN_LOOP.md`,
  `docs/runs/turn-lease-fix-report.md`, `src/components/gameplay-composer.tsx`, `src/lib/gameplay/client-state.ts`,
  `src/lib/gameplay/client.ts`, `src/lib/gameplay/dm-loop/loop.ts`, `src/lib/gameplay/dm-loop/two-pass/runtime.ts`,
  `supabase/migrations/202610200071_dm_loop_turn_lease.sql`, `tests/dm-loop-turn-lease.test.mjs`.
- Untouched: inventory, the turn timeline, the other dm-loop tools, the bench harness (`scripts/eval/lib/*`).

## Needs the owner (Part 2)

- **HP numbers on foes** are shown as numbers (your BG3 decision); the DM's `hp` rows set the max. Say if a foe whose HP
  the DM never gave should show a bar without numbers or nothing.
- **The ambush rule** («the party's declared ambush resolves before initiative», `opening: "party"`) is a house rule
  the DM applies when the player declares one; the live ford DM chose not to (Ян noticed the glint) — say if the rule
  should be forced whenever the party declared an ambush the turn before.
- **Reactions** go through the DM: it writes a `reaction` card, ends its turn, the player's choice is words in the action
  box («Реакция: Щит»). The alternative (a server-side reaction prompt that pauses the turn) is the fix run's call.
- **The rules module** is on by default only when the campaign's rules-system name reads like D&D 5e / Pathfinder; for
  any other system the DM switches it on per fight (`rules: true` in `start`). Say if the default should be «on unless
  the system says otherwise».
- **The DM's pace in a fight**: one round per ~2 turns and unrolled player attacks (above) are prompt work for the fix
  run, not this slice; say if you want the DM told to always resolve the hero's declared action in the same turn.
