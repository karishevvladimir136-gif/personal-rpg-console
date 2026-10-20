# 2D Live — the first slice (parallel to the session 2 fix run)

Owner (2026-10-19 23:34): «можно отдельно в клауде 2D-движок, то, что мы хотели тогда» — start the 2D presentation layer
now, in a second cloud session, while the fix run (`docs/stages/FIX_S2_RUN.md`) works on its own branch.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch **`claude/live2d-1`** from `origin/claude/session-2-prep`
(tip `d74b6c6`). Commit and push after each part; keep `docs/runs/live2d-1-progress.md` current; report in English in
`docs/runs/live2d-1-report.md` with «Needs the owner». If your context runs low, finish the part, push, write «next» in
the progress file and stop; a new session continues from it.

Hard rules: never `main`; keys only in `.env.local`, never printed or logged; `APP_ANTHROPIC_API_KEY`, never
`ANTHROPIC_API_KEY`; never the owner's real database or port 3000; never edit an applied migration; the repo is public —
fixtures synthetic, no campaign dialogue; live paid calls (pictures, vision, DM) within **$25**, stopped by a guard, every
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

## Not in this slice
The battle map (it is in the fix run, stage C); EXPLORE 3D; video; music; Enter This World.

## Living next to the fix run (it works in parallel on `claude/session2-fixes-a-f-*`)
- New code under `src/lib/live2d/` and `src/components/live2d/`, a new screen in `src/app/campaigns/[campaignId]/[screen]/
  page.tsx` and one navigation link; touch shared files only where unavoidable and list every one in the report.
- Do not change the dm-loop core (`src/lib/gameplay/dm-loop/*`), the inventory or the turn screen — the fix run rewrites
  them. Read through existing APIs; if the slice needs a new DM tool or context block, write it as a proposal in the report.
- Migrations only with the prefix `2026102102` (the fix run uses lower numbers), each self-contained.

## Done when
The suite is green; a synthetic campaign walks world → region → town → scene with travel animated and hotspots clickable;
screenshots at 1920×1080, 2560×1440 and 390×844 in `docs/runs/live2d-1-shots/`; the report lists the shared files touched,
the money spent, and a short Russian checklist for the owner (`docs/runs/live2d-1-acceptance.md`) — what to open and try.
