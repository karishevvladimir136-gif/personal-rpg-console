# Development status

Last updated: September 17, 2026.

Update before milestone-completion commits and after architectural changes. Never include secrets, credentials, keys or DM-private content.

## Current milestone

**Phase 0 — Static clickable UI, now with the final Game Combat View refinement.** Private single-user James & Jinn application. Phase 1 has not started.

## Current status

The Combat View refinement is implemented and verified. **All 60 tests pass in development and production; typecheck, lint and the production build pass.** Desktop and 390px/320px browser checks are complete. **Owner approval remains pending.** Requirement approval is not delivery acceptance.

Preview: **http://127.0.0.1:3000/campaigns/long-road-west/game** (loopback port **3000**). No account, keys or manual setup. After a computer restart, double-click **Start Preview.cmd** in the repository.

## Completed work

- Preserved all existing Phase 0 screens, campaign/global settings, bilingual UI, inventories, conversations, Camp, rest/cooking and generic skill-check/dice previews.
- Added Game → Preview Combat as an internal mode with synthetic indicator, reset, exit and withdrawal/victory summaries. No new top-level route or navigation tab.
- Added portrait initiative/round, active versus inspected party members, public HP/conditions, scene/enemy cards, qualitative enemy health and public positioning; optional existing illustration with usable no-art layout.
- Added Attack, Abilities / Spells, Item, Move, Defend and End Turn, explicit eligible targets/costs, D&D-style remaining budget, James/Jinn direct control, a grouped scripted opponent turn and party return.
- Shared the existing dice presenter/animation while keeping combat completion isolated. Hidden skips the modal and roll details; compact is automatic; interactive closes/resumes the same reserved action. Repeated confirmation/completion/turn events cannot duplicate effects. No enemy roll or private target exists.
- Literal free-text proposals receive an explicitly authored response with no interpreted effect. Summary retains injuries, records spent resources, and permits one demo-only loot collection after victory, with no automatic healing/rest.
- Added English/Russian text, mobile scene/party/history switches, keyboard focus restoration, reduced-motion feedback and automated regression coverage.
- MASTER_SPEC section 37 and DEVELOPMENT_PLAN document Phase 0 versus future persistence/resolution foundations, mandatory combat rolls versus Check Frequency, encounter end states and deferred companion automation/grids. Remote documentation was fetched before edits; local and origin/main matched at 896d25b.

## Files / areas changed

- `src/lib/combat-preview.ts`: authored fixtures, labels, isolated reducer, validated demo targets/costs, pending action identities and lifecycle.
- `src/components/combat-preview.tsx`, Game entry, shared dice presentation, combat styling in globals.css and bilingual catalog ru.json.
- New `tests/combat-preview.test.mjs`; existing HTTP Game smoke check extended. No dependency added.
- MASTER_SPEC, DEVELOPMENT_PLAN, DEV_STATUS, README and VERIFICATION document scope and handoff.

## Tests and build status

- Development `pnpm test`: **60 passed** (49 preserved tests + 11 combat tests).
- `pnpm typecheck`: passed. `pnpm lint`: passed without warnings.
- Final `pnpm build`: passed, 26 prerender entries plus campaign-root redirect.
- Final production `pnpm test`: **60 passed** against loopback port 3001.
- Browser checks passed: desktop and English/Russian 390px/320px fit; interactive close/resume/replay without duplicate effect; Hidden no-modal/no-breakdown resolution; automatic compact dice and absent target number; direct party control, scripted damage, healing, literal proposals, victory/withdrawal summaries and isolated loot; focus restoration/Tab containment; no-art interaction; original 19-point dice regression; Game draft retention. Russian 320px page and dialog widths have no horizontal overflow. See VERIFICATION.md for the actual checks and limits.
- Physical devices/Safari, software keyboard, screen-reader speech and OS reduced-motion switching remain unverified. Shared dice reduced-motion behavior is unit-tested and combat CSS respects the preference.

## Key technical decisions

- Combat state lives only in Game's separate reducer. It has no access to campaign setters, inventory or rest; read-only dice preferences are the only campaign input. Normal Game drafts survive entering/exiting; navigating away or refreshing discards the encounter.
- The encounter is a fixed UI script, not a general combat engine: 14 + 4 = 18; strike 6, lantern flare 8, tonic up to 4, cover move 10 ft; fixed enemy damage 3 or guarded 1, capped at 1 remaining party HP. These are invented examples, not official rules or canon.
- Both opponents act in a single explicitly advanced scripted turn. No timers or background simulation advance the encounter. Direct party control is initial; automation and grids are deferred.
- Action cost is reserved once at confirmation; interactive damage applies on first reveal. Closing preserves the pending action. Reopening/replay cannot change its result or spend again. Reset/exit discard all reservations.
- Attack fixtures contain no target number; Show DC cannot invent one. Existing skill-check fixtures still demonstrate disclosed DCs. Hidden suppresses roll numbers/details but retains public damage and narrative consequences.
- English/Russian source dictionaries remain centralized. No storage, API routes, auth, database, AI, provider calls, server dice, paid media or real gameplay operations were added.

## Known issues

- All encounters/results/resources/loot remain synthetic; no campaign combat consequences or persistence exist. Navigation/refresh resets this demo. Generic settings and existing campaign memory behavior are preserved.
- Only James & Jinn is connected. The invented enemies, ability, tonic and loot do not establish canon. Physical devices, assistive-technology speech and OS reduced-motion switching are not yet verified.
- Local availability depends on the running development process/computer; no deployment was made. Supplied art may contain embedded English lettering.

## Remaining work

Owner click-through and explicit Phase 0 approval remain. This verified status accompanies the focused Phase 0 completion commit. Future persistence/rules/AI work is intentionally deferred. **Do not start Phase 1.**

## Recommended next step — owner click-through

1. Open the preview URL above. Click **Preview Combat**. Inspect Jinn: James should remain the active character.
2. **Attack → Raincoat lookout → Confirm demo action → Roll → Continue**. Close before rolling and use **Resume sample roll**; reviewing a resolved roll must not hit again.
3. **End Turn** gives you Jinn. Attack the same lookout, then End Turn → **Play scripted enemy turn**. In round 2, use **Item** on an injured party member; try Move or Defend.
4. Defeat the remaining sentry over subsequent turns, then **Show encounter summary → Collect demo loot → Return to Game**. Or use **Finish demo with withdrawal**. Campaign HP/inventory/rest stay unchanged.
5. Try a literal English/Russian proposal, Hide illustration, Reset demo and Exit. On a narrow screen use Scene & actions / Party details / Combat history.
6. Exit, open **Campaign Settings → Rules & Play Style → Checks & Dice** and try Hidden, Interactive Dice Off and All Player Rolls, then reenter combat. Interface language is in Main menu → General Settings.

## Preserved checkpoints

Original shell ab7b891; bilingual UI 84e73f0; Rules & Play Style 54c1c73; Checks & Dice 4403666; consolidated navigation/inventory/Camp 896d25b. Remote media-model and item-transformation requirements are preserved. None imply approval or implementation of later phases.
