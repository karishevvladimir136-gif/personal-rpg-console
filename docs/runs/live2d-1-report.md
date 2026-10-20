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
