# 2D Live — the first slice and the combat screen (parallel to the session 2 fix run)

Owner (2026-10-19 23:34): «можно отдельно в клауде 2D-движок, то, что мы хотели тогда» — start the 2D presentation layer
now, in a second cloud session, while the fix run (`docs/stages/FIX_S2_RUN.md`) works on its own branch.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch **`claude/live2d-1`** from `origin/claude/session-2-prep`
(tip `d74b6c6`). Commit and push after each part; keep `docs/runs/live2d-1-progress.md` current; report in English in
`docs/runs/live2d-1-report.md` with «Needs the owner». If your context runs low, finish the part, push, write «next» in
the progress file and stop; a new session continues from it.

Hard rules: never `main`; keys only in `.env.local`, never printed or logged; `APP_ANTHROPIC_API_KEY`, never
`ANTHROPIC_API_KEY`; never the owner's real database or port 3000; never edit an applied migration; the repo is public —
fixtures synthetic, no campaign dialogue; live paid calls (pictures, vision, DM) within **$40**, stopped by a guard, every
call in `docs/runs/live2d-1-ledger.md`.

## Read first

`2D_RENDERING_DIRECTION.md` (the product direction — Fabled Lands exploration + Sorcery! encounters, text always first),
`MASTER_SPEC.md` §46, `DEVELOPMENT_PLAN.md` «POST-PHASE-4 V1 SLICE — 2D PRESENTATION / RENDERING ENGINE» (its acceptance
criteria), `docs/REBUILD_PLAN.md` §15 rows «2D Live» and «Живые кадры», and in `docs/runs/session2-owner-notes.md` (on
`claude/handoff`) item 31 with its follow-up (the owner: the location paintings are «отличная основа для 2D-движка, потом
туда добавим интерактивные точки», and «нет карты региона, где мы перемещаемся») and key finding 2 (the DM's hidden
layer — POI seeds belong to it). The existing map code: `src/lib/map/*` (atlas levels, auto-placement, label layout, public
projection), `src/components/atlas-map.tsx`, `world-map.tsx`, the map-layout route, the place pictures in
`src/lib/server/media/pictures-service.ts`.

The rule over everything: **the DM and the rules decide what happened; the records remember it; the 2D layer only shows
it and turns clicks into intents in the action box.** Text play keeps working with the 2D view closed.

## The slice

1. **The region map** (moved here from the fix run's item 31). A stable painted map of the region the party travels — for
   the session 2 campaign the stretch of the Trade Way (Beregost, Кривой брод, the road south to Nashkel, Cloakwood, what
   the canon names around it) — drawn once per region and redrawn only when a new place appears in it. Places are marks
   from the location records (known / visited / rumoured), laid out by the existing placement code on the painting's
   coordinates; the party's position — at a place, or «в пути» between two with the route drawn. Marker visibility:
   Off / Tracked only / Standard / All known (the direction doc). The atlas's «Мир» level stops being a painting of the
   current location; those paintings become each place's illustration.
2. **Travel on the map.** When a turn moves the party (`move_party`, travel time), the marker moves along the route as
   presentation, in step with the turn's time; an interrupting turn («стоп, свернём туда») stops it where the story says.
   A click on a known place writes «идём в <место>» into the action box — the DM decides.
3. **The local scene with interactive points.** A place's illustration becomes a 2D scene: hotspots for what the hero
   knows there (people present, doors, a stall, a shrine, a body), each a POI record with a normalised position on the
   picture. Positions come from a cheap vision call on the illustration matched to the records (never inventing a POI
   that is not in the records), adjustable by the owner. Hover shows what is known; a click writes the intent («подхожу к
   кузнецу», «осматриваю алтарь») into the action box. A new scene picture is drawn only when a place is first visited or
   changes for good (a fire, a battle).
4. **The hierarchy and lazy detail**: world → region → town → district → scene, generated only at the scale the party
   reaches; a breadcrumb to move between scales; «Текст» one click away at every level.
5. **POI seeds (with the DM's hidden layer).** Each area may privately hold a few latent hooks (an old cemetery, a sealed
   mine, a strange house) — the direction doc's «POIs make freedom interesting». Store them as private DM notes the
   player never sees until discovered, in a form the fix run's hidden layer (key finding 2) can absorb at integration;
   a discovered seed becomes a public POI.

## Quality — the scene must not hallucinate (owner, 23:42: «повышенные требования к качеству генерации»)

A clickable scene is a promise: what is drawn is what is there. So:
- **The records come first.** Before a place is drawn, it gets a short scene sheet from the narration and records: the
  layout (entrance, counter, back gate to the yard, stairs, cellar hatch), the notable objects the story named, the light
  and time of day, what is never there. The DM sees the sheet in its context afterwards, so later narration does not
  contradict the picture.
- **No named people baked into the background.** People move, leave and die; draw the place without them and show them
  as portrait tokens on their spot. Background extras only if the sheet says the place is crowded (a market).
- **A brief with «must show» and «must not show»** from the sheet; a wide, readable composition with the key objects
  separated (not cluttered, no text or labels in the image), on the quality tier (scene backgrounds are drawn rarely).
- **A check after every scene picture** by a strong vision model (not the cheapest — it runs once per place): each
  «must show» item is visible and locatable; no prominent object or feature contradicts the sheet (an invented forge,
  a second door, a lantern nobody has). A miss or a contradiction → one redraw with the brief corrected; still wrong →
  the scene is marked for the owner, and the missing items appear as a side list («здесь также: погреб»), never as a
  guessed marker.
- **Markers never invent.** The locator returns a position only for items in the records, with a confidence; low
  confidence shows as an «approximate» marker style; the owner can drag, hide or redraw with a comment.
- **The place anchor is shared.** Once a scene exists, the live frames of that place use it as their place reference, so
  the turn's pictures and the scene agree.
- **Measured, not assumed:** a probe set of at least eight synthetic places with sheets (a warehouse, a temple, a mine
  yard, a forest camp, a tavern, a ford, a market, a guard post); report the share of «must show» items found, the rate
  of contradicting objects, the redraw rate and the cost per scene. Target: ≥ 90% of «must show» found after at most one
  redraw, zero named people in backgrounds, zero markers for things not in the records.

## Part 2 — the combat screen and the battle map, «как в Friends & Fables, чтобы бой был прям вау» (owner, 23:44)

Moved here from the fix run's stage C: it is the same spatial engine as the scenes (a painted place, tokens on top,
positions held by the server). Build it after Part 1 on the same branch. Inputs: `docs/REBUILD_PLAN.md` §13 «Экран боя»,
the mockup `design/canvas/Combat.dc.html` (on `claude/handoff`), the notes' section «Combat — a separate stage» and items
43–46, 54, 61, 64, 65; the existing combat code (`src/components/gameplay-combat.tsx`, `src/lib/gameplay/combat-exchange.ts`,
the `combat` tool in `src/lib/gameplay/dm-loop/tools.ts` / `execute.ts`, combat-readiness). Owner decisions that stand:
enemy HP and damage shown as numbers, BG3-style (a bar with numbers on each enemy card and token); damage rolled per
attack and shown; 5e dying and death saves (not «dies at 0» as in Friends & Fables); a party-set ambush — the planned
opening goes before initiative; coup de grâce on a helpless target is an execution; no D&D rules hardcoded — the grid,
movement, conditions and action economy come from the campaign's system as knowledge.

**The combat state on the server** (the DM's `combat` tool grows): initiative from the rolls and the order kept; «next
turn» and rounds; per-combatant action / bonus action / reaction / movement as the system gives them; conditions
(prone, paralysed, concentrating, surprised, fled, unconscious, dying with death-save pips); enemy HP from the stat block
recorded at combat start and changed per hit; positions on a 5-ft grid with elevation; features (cover, difficult ground,
light sources and their radius, burning areas). `move` takes grid coordinates; the server computes distances, reach,
ranges, cover and line of sight and gives the DM a short text block every combat turn («Брам в 10 фт от Кадрика; между
Джеймсом и Серым горящая телега — укрытие на три четверти; Серый вне света»), because the model cannot see the picture.
The zones view («вплотную / рядом / далеко / в укрытии») is derived from the coordinates, so both views always agree.
A round's independent rolls go in one message (one request per round where possible).

**The battle map — the «wow»:**
- the background: the place's scene drawn top-down for battle (from the Part 1 scene sheet: same layout, same objects,
  no people), grid-aligned, on the quality tier, checked like a scene (no invented walls, doors or cover); a new
  background only when a fight starts somewhere new;
- portrait tokens (hero, companions, each enemy type) with HP bars and condition icons; the active combatant
  highlighted; tokens glide when moved; damage numbers float up from a token on a hit, «Промах» on a miss, a crit marked;
- an initiative ribbon of portraits across the top (allies and enemies in different colours), the round number, whose
  turn it is;
- **your turn**: hovering a spell or weapon from the hero's sheet shows its range ring; area spells show their template
  where you point (a Fireball's 20-ft sphere, a cone, a line) with the creatures it would catch highlighted; dragging
  your token shows the path and its length in feet against your remaining movement and any opportunity attacks; letting
  go writes the intent into the action box («подхожу к телеге, 25 фт», «Огненный шар в точку у двери барака — в радиусе
  Кадрик, Пузо, Лысый»); the DM decides;
- light and line of sight: dark areas shaded, light sources glow with their radius, what the hero cannot see is greyed;
- enemy cards: portrait, HP bar with numbers, conditions, «что известно» unlocked by knowledge checks or observation
  («???» until then), the enemy's intent only when the hero or a companion could notice it (an arrow on the map);
- reactions: when an enemy attack would hit the hero and he has a reaction (Shield, an opportunity attack), the turn
  pauses with a choice card;
- a combat log of roll receipts; the end-of-fight card — damage dealt and taken, resources spent, close calls, loot
  (the inventory records from the fix run's stage D);
- phone layout: the map pans and zooms, the ribbon scrolls.

**Optional rules module (from the Friends & Fables split — the engine applies mechanics, the AI narrates):** when the
campaign's system describes them, the server applies to rolls what is pure arithmetic — a condition's advantage or
disadvantage (blinded, prone, paralysed → auto-crit within 5 ft), resistance / immunity / vulnerability on damage, the
crit's doubled dice, cover's AC bonus — and shows each applied rule on the card. The DM still decides what happens; the
code does the sums. Off by default for systems without such descriptions; on for 5e campaigns. This removes the class
of errors session 2 showed (a doubled modifier, three rays rolled as one).

**Combat speed**: the continuation after a roll runs a notch lower in depth (the plan is already made); measure seconds
per combat turn before and after on the probe fights.

**Probes**: two scripted fights on the synthetic campaign — an ambush at a ford and a lair fight with an area spell, a
caster on high ground and a burning cart — recorded as screenshots per round, with the DM's battlefield text checked
against the map (distances, cover, who is in an area).

## Not in this slice
EXPLORE 3D; video; music; Enter This World.

## Living next to the fix run (it works in parallel on `claude/session2-fixes-a-f-*`)
- New code under `src/lib/live2d/` and `src/components/live2d/`, a new screen in `src/app/campaigns/[campaignId]/[screen]/
  page.tsx` and one navigation link; touch shared files only where unavoidable and list every one in the report.
- In the dm-loop core (`src/lib/gameplay/dm-loop/*`) change only the `combat` tool (its schema and handler) and add the
  battlefield context block in a file of its own, wired by one line in `context.ts`; the fix run edits the same folder
  (the cache layout, `roll`, `rest`, the rules), so keep the diff there small and list it in the report. Do not change
  the inventory or the turn timeline — the fix run rewrites them; read them through their APIs.
- Migrations only with the prefix `2026102102` (the fix run uses lower numbers), each self-contained.

## Done when
The suite is green; a synthetic campaign walks world → region → town → scene with travel animated and hotspots clickable;
screenshots at 1920×1080, 2560×1440 and 390×844 in `docs/runs/live2d-1-shots/`; the report lists the shared files touched,
the money spent, and a short Russian checklist for the owner (`docs/runs/live2d-1-acceptance.md`) — what to open and try.
