# P0A — playable first Adventure opening

Status: implemented on `codex/p0a-playable-bootstrap` from accepted `c885dc357ab63ee32421679e881735750022172f`; owner review pending. This lane remains separate from `codex/playtest-game-character`. Neither is merged to main.

## What changes for the player

For the supported fresh starter path, **Start Adventure** now establishes a public opening and takes the owner directly to **Game**. The ordinary, unknown Fighter begins in a settlement meeting house, where a local organiser offers ordinary paid work. The player can look around, discuss terms, refuse or explore. No job is accepted, payment fixed, reward granted, combat started or hidden plot decided by the opening.

The Adventure premise remains the existing versioned advisory guidance supplied to normal play. It is not interpreted as commands, imported Canon, a predetermined twist or automatic outcomes. The minimal starter opening supplies the missing public facts for the ordinary-paid-work playtest; it is not a general generator for arbitrary World premises.

## Cause and authority

Migration 24's New Hero template creates a Fighter, items, an open session and an introductory note, but no Location. The previous Start operation activates Adventure metadata only. Normal gameplay correctly refuses to invent missing authoritative facts.

Migration **30** extends that existing Start RPC. After its existing campaign, source, head, revision, timeline and lifecycle checks, a private preparation helper uses the accepted `runtime_change` record validators and `world_validate_state`. Location, public NPC, visible narration, current location/scene, actor presence and a public opening Event are committed together with the existing immutable Adventure version, receipt and Saves/Timelines manifest. An exact retry returns its receipt; a failed insertion rolls back the entire Start. Existing established continuities resume their recorded location without another opening.

The migration is necessary because separate browser mutations could leave a partially prepared, partially activated Adventure and break the existing revision fence. It adds/replaces functions only, without changing tables or manifest schemas. Migrations 1–29 are preserved. No migration has been applied to the owner's real database.

## Review steps after separately approved integration/setup

1. Create/select a simple classic-fantasy World with no pinned Pack.
2. Use **New Hero** for the supported Level 1 Fighter.
3. Prepare **Evening · 3–5h** with guidance that the hero is unknown and seeks ordinary paid work.
4. Press **Start Adventure**. Game should show the meeting-house opening and recorded current place.
5. Try **I look around** or **I ask about paid work**. The runtime receives the established public place, present NPC and Adventure guidance.
6. Refresh and inspect Saves. The opening remains ordinary campaign state, captured through the existing manifest system.

No provider request is made by Start. A subsequent real gameplay action uses the owner's normal DM configuration and has not been live-evaluated in this correction.

## Verification

- Focused SQL/bootstrap and navigation checks: **18 passed** (included in the affected run).
- Affected Adventure, gameplay, save/timeline and migration regressions: **96 passed; zero failures/skips**.
- Route generation, nonincremental typecheck, repository-wide zero-warning lint and production webpack build: **passed**.
- Complete frozen-candidate suite: **1,721 total; 1,720 passed, zero failed, one existing hosted-Supabase opt-in skip** (215,168.3848 ms).
- Disposable populated migration 29 → 30: existing records, manifests and grants preserved; pre-upgrade save remains loadable; opening can be created after loading it.
- Established-location continuities retain accepted Start behavior, including a closed preceding session; the helper does not invent a new session or change existing lifecycle requirements. Normal gameplay retains its own session checks.
- Real SQL fixtures cover fresh World/Hero/Evening Start, public classification, current location, first scripted turns through the production parser/mechanics/settlement, EN/RU, rollback, retry, save/load, sibling isolation, forged fields and stale fences.

Local ignored logs: `test-results/p0a/focused-complete.txt`, `affected-final.txt`, `full-suite.txt`, `typegen.txt`, `typecheck.txt`, `lint.txt`, `build.txt`. The preceding full run (1,720 total, 1,719 passed, one existing hosted-Supabase skip, zero failures) is retained separately in `full-suite-before-continuity-check.txt`; final results reflect the later compatibility guard and regression.

## Limits and stop

Changed files: `supabase/migrations/202609290030_adventure_playable_opening.sql`, `src/components/adventures/adventures-panel.tsx`, `src/components/persistent-adventures.tsx`, `tests/adventure-playable-opening.test.mjs`, `tests/adventure-v1-ui.test.mjs`, this guide and `DEV_STATUS.md`.

This deliberately covers the wholly fresh, unplayed, no-Pack starter Fighter path and resumption of already-established locations. Pack-backed worlds, partly authored/played campaigns with no starting place, other profiles and already-active empty Adventures fail safely or retain their existing state; this pass does not invent missing Canon or retrospectively rewrite them. In particular, the owner's previously started Garrick Adventure is not silently repaired. Later missing-fact clarification behavior remains intact.

No FRAME/VIDEO, Game presentation, World Library, provider, mechanics, rewards, progression or Save/Timeline contract is redesigned. No live-model, browser-playthrough, hosted Supabase or physical-device claim is made. No provider call, real database migration/import, deployment or new feature lane was started. The owner must separately review integration and migration 30 before activating this fix in the real playtest environment.

Stop for owner/supervisor integration review together with the separately completed Character lane.
