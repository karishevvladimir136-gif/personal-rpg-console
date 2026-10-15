# Wave 4 owner review

Wave 4 is implemented and deterministically verified, but is not owner accepted. Main remains unchanged. This is the bounded RPG foundation, not FRAME or World Lab.

## Safe local preview

Open **http://127.0.0.1:3095/preview/owner** on this computer while the local preview is running. All records and toolbar scenarios are synthetic and live only in process memory. No real database migration, provider request, credentials or real campaign import is needed. A phone cannot reach this computer by opening its own `127.0.0.1`.

1. **Prepare the world:** select a person/location/Thread, directly correct names, aliases, descriptions, capabilities, limitations and Thread fields, then save. Merchant participation has ordinary named controls. Only selected eligible content is prepared.
2. **Owner corrections:** inspect and edit currency labels, item valuations/restrictions, merchant policy, progression tracks and approved reward definitions. Simple corrections do not need AI. Existing inventory/storage editing supplies stock and its ownership.
3. **Trade:** choose a stock quantity, select **Review trade**, inspect the fixed price and currency, then **Confirm exchange**. Choose a player item quantity to sell, or quantities on both sides to barter. Restricted/equipped/stolen items show the applicable limits.
4. **Progression & rewards:** inspect the track, choose an earned advancement, and claim the eligible synthetic reward. Switch the toolbar scenario to **Progression off** to inspect the zero-progress case.
5. Switch **English / Русский** and resize the window. Optional demo controls can show a lost response, changed timeline or unavailable merchant. **Reset demo** restores the synthetic records.

In the application, these surfaces are integrated at **Campaign Settings → World Packs → Prepare for campaign**, foundation settings in **Campaign Settings**, **Inventory → Trade**, and **Character → Progression**. The normal **Game** composer remains the place to describe any negotiation, trade, theft or robbery action. The preview does not run a real model or a real campaign turn.

## What to assess

Check that important proposed content can be corrected directly, quotes are understandable before confirmation, retry/reload states are clear, and the compact progression and trade panels fit the existing RPG interface in both languages. Technical validation and browser evidence are recorded in `DEV_STATUS.md` and `WAVE4_BROWSER_REVIEW.md`; the owner does not need to inspect code.

## Disclosed limits

- Pack preparation is selected and evidence-gated. It does not automatically turn every source entity, possession or relationship into gameplay mechanics.
- Rewards use explicitly approved definitions and supported source entitlements. Progression includes bounded XP, milestones, generic tracks and capability choices; it is not official D&D 5e or an arbitrary tabletop rules engine.
- Commerce uses profile-defined currencies, stock and trusted valuations. Merchant availability and modifiers are coarse; there is no continuous economy or universal crime/wanted system.
- Changing the ruleset after foundation configuration is blocked to preserve existing balances/history. A materially stale staged Game settlement needs review/new action and is never forced onto a changed timeline.
- Model output quality and hosted Supabase/Auth behavior were not live evaluated. Actual deployment, real-data migration and owner acceptance remain separate decisions. World Lab and Enter This World have not started.
