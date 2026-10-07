# Map / Atlas V2 — isolated owner-review candidate

**Status:** Isolated owner-review candidate on `codex/astra-ui-media-map-integration`, based on exact reviewed UI/media integration `5d1d0cea1c0b0541dd9c4bf6873e87c61968c966`. Offline implementation and verification passed; owner approval and activation have not occurred. Nothing in this branch has been merged to main or applied to the owner's database or app.

## Authority and migration order

The disposable migration sequence is 38 Astra-primary runtime → 39 World Logic takeover → 40 standalone subject visuals → 41 Map / Atlas V2 (`supabase/migrations/202610060041_map_atlas_v2.sql`). Migration 41 adds `public.rpg_map_placements`, keyed by `(campaign_id, location_id)`, with `level`, `parent_location_id`, optional normalized `x/y`, revision, update time and last request identity. A service-only, owner-authorized `rpg_map_layout` operation checks campaign and active timeline fences, existing public Location visibility, exact placement revision, parent level and idempotent retries. Region requires a World parent; Local requires a Region parent with an active World ancestor. Changing a parent's level cannot invalidate saved children. Coordinates are both null or both 0..1. No map row has a foreign key to a timeline-restored Location, so loading an old save can safely leave campaign-wide metadata in place while suppressing it from reads.

The existing Location, public state, encounter, World Foundation and runtime authorities still decide current place, travel legality, routes, elapsed time and consequences. A pin or generated road never authorizes travel. Map V2 is an exploration atlas, not a tactical grid or GIS.

Map placement is campaign-wide presentation metadata. A playable save or timeline still determines which Locations exist and are known or visited. Reads and rendering intersect placements with that active public snapshot, so restoring an older timeline cannot reveal a Location absent there. Older Locations remain valid without a placement; no names, text, image pixels or route proximity are used to infer hierarchy. Placement corrections do not rewrite Location gameplay records.

## Atlas experience

World contains top-level placed Locations. Region is anchored to the current Location's World ancestor where available, otherwise the owner's selected World. Local similarly uses the current Region ancestor or selected Region. Region and Local render only direct children of that anchor. The current place comes solely from `publicState.current_location_id`. Known and visited pins, selection and a planned destination are application overlays. An unplaced known-place list keeps old and newly authored Locations accessible.

The owner can open **Edit map layout**, choose an existing public Location and level, choose a valid parent where needed, click or tap the atlas to assign normalized placement coordinates, and save an exact-revision presentation edit. Selecting **Set destination** returns to Game for a free-text journey; it does not itself move the character. Without metadata or artwork, the atlas surface, known-place list, details and destination planning remain usable. Route lines are omitted unless an exact authorized route projection is available; no route is inferred from pin proximity, shared parents or generated roads.

## Generated map artwork

Map images use schema-6 `map_visual` jobs in the existing visual-frame documents, OpenAI image provider, reservation/budget, storage, draft, grounding/review, owner acceptance, asset, history and signed-access lifecycle. A map job is explicitly scoped to World, Region or Local and its active public basis; it does not invent a Scene or Location. Its pinned basis includes the active timeline/head, public State revision, level and anchor, exact public Location facts, normalized placement coordinates/revisions and approved style-reference versions. The job limits the visible place list to 32. Only active public places and approved textual style guidance may enter the image prompt. Private World facts, hidden places, Character Models and Memory never do. The prompt excludes readable place labels, new lore and implied travel routes; structured application pins remain the geography authority. The image is optional presentation, never Canon or gameplay state.

Generation requires paid confirmation. The result remains a private reviewable draft until the owner accepts or discards it. Accepted artwork can remain in use when a new known Location appears; its new pin can overlay the older art. A changed compatible basis labels the image **Older map artwork** and offers regeneration. Artwork must be hidden if an original basis place is absent, undiscovered or no longer belongs to that map's visible hierarchy on the active timeline. Historical art remains accessible in Gallery → Maps. Approved visual references currently contribute text guidance only; image pixels are not sent back to the model as conditioning.

The existing subject portrait/item/location jobs and scene FRAME/video jobs keep their own lifecycle and image identities. Map acceptance does not approve a visual reference or change public game records. The normal Map page offers the compact generation flow inside **Map artwork**; Gallery groups accepted Maps separately from Frames. Signed map pixels are returned only after a fresh active-public-basis check, while a draft image is available only through the existing owner review path.

## Privacy, saves and World Lab

The map job and placement write are owner-authorized and campaign/timeline fenced. Draft pixels are review-only, and map records do not appear in DM-private or gameplay authority. World Lab / What-If continues as detached, non-canonical simulation; its Locations and imagery cannot leak into the playable map. Campaign-wide placement metadata does not become encounter rollback authority; active timeline public visibility is checked at read and render time.

Map-job Documents and accepted Assets remain campaign-wide so the existing media recovery and history still work. The browser campaign DTO and initial server-rendered snapshot therefore filter them against the active playable public Location basis. The document-version endpoint applies the same visibility gate. An unfinished draft requires its exact timeline and basis; an accepted map and its historical versions remain readable after ordinary gameplay revisions while the original public places still exist in the correct subtree. The image-signing route and the private draft-pixel SQL operation independently recheck access. Loading an older save hides a later map's job text, asset metadata and pixels without erasing the stored job.

## Verification

The exact committed 38 → 39 → 40 → 41 sequence installed on an empty disposable PGlite database. A populated 39 → 40 → 41 upgrade retained existing campaign/save/Location/accepted-subject-visual rows and unrelated RPG fingerprints. Focused placement/media SQL tests passed 9/9. The final combined map/atlas/UI/media run passed **54/54**; UI-focused tests passed **60/60**, and the browser/privacy/persistence subset passed **44/44**. These focused runs overlap. The complete repository suite passed **2,031/2,032**, zero failures and one existing skip. Route type generation, TypeScript, repository ESLint with zero warnings, and the production webpack build passed. No paid provider call was made.

The synthetic `/preview/live-ui` fixture contains no owner campaign data and disables all edits and media requests. The 13 requested visual captures are in [`docs/review/map-atlas-v2`](docs/review/map-atlas-v2/):

| Review state | File |
| --- | --- |
| World desktop | `01-world-desktop.jpg` |
| Region desktop | `02-region-desktop.jpg` |
| Local desktop | `03-local-desktop.jpg` |
| Location detail desktop | `04-location-detail-desktop.jpg` |
| World with synthetic artwork | `05-world-placeholder-art-desktop.jpg` |
| Artwork collapsed | `06-map-artwork-collapsed-desktop.jpg` |
| Unplaced known places | `07-unplaced-locations-desktop.jpg` |
| Layout editor collapsed | `08-edit-layout-collapsed-desktop.jpg` |
| Layout editor open | `09-edit-layout-open-desktop.jpg` |
| Gallery Maps | `10-gallery-maps-desktop.jpg` |
| World mobile | `11-world-mobile.jpg` |
| Local mobile | `12-local-mobile.jpg` |
| Location detail mobile | `13-location-detail-mobile.jpg` |

At a 390px mobile viewport the synthetic page reported a 390px scroll width, with no horizontal overflow. World, Region, Local and Gallery Maps loaded in an independent browser review without console errors. The Gallery Maps screenshot contains one contract-valid accepted synthetic map card, rendered with local CSS placeholder art and no media request. The screenshot artwork is a local CSS placeholder; no image model was called.

## Known limits and activation boundary

The map does not infer or edit travel routes, compute distance, auto-place Astra-authored places, represent tactical combat, or use reference image pixels for conditioning. A map image job with more than 32 visible placed Locations is refused without affecting the usable structured atlas. This is an isolated review candidate; migrations 39–41 remain unapplied to the owner database, and the owner campaign, app activation, main and deployment remain unchanged.

## Changed areas

- Migration: `supabase/migrations/202610060041_map_atlas_v2.sql`.
- Pure map authority/projection: `src/lib/map/atlas-view.ts`, `placement-contracts.ts`, `public-projection.ts`; server `map-layout.ts` and `public-campaign.ts`.
- Browser routes: campaign read, document versions, map layout, and the existing visual-frame route; initial campaign layout uses the same filtered public snapshot.
- Player UI: `atlas-map.tsx` and styles, `generate-map.tsx`, Gallery/Map sections, synthetic preview fixture, a small Russian label update, and 13 review screenshots.
- Existing media adapter: `map-job.ts` plus narrow edits to the existing media client, server, orchestration, and grounding modules.
- Tests: map placement, SQL/media lifecycle, public DTO and old-save filtering, atlas UI/mobile, live UI preview, persistence security, and legacy FRAME regression fixtures.
- Milestone notes: this report, `DEV_STATUS.md`, and successor links in the prior UI/media reports.
