# V1 completion wave 1 — owner review

Mega DM v1 is closed on main at e4f9171f9db87428b5b5812837474eb2c87c5aa8. Its new/inherited gameplay default is GPT-6 Astra / high / Standard. Existing explicit campaign model choices remain unchanged; Sol and task overrides remain supported.

This separate wave is ready for owner review. Its fresh verification and worker handoffs are recorded in V1_COMPLETION_VERIFICATION.md and DEV_STATUS.md. It is not automatically published to main or owner accepted. The original dirty checkout and historical evaluation evidence are preserved.

## Safe local preview

Open http://127.0.0.1:3100/preview/v1 on this computer. Choose English or Русский at the top, then use the four review buttons. Every record is synthetic. Edits exist only in the page and reset on reload or language switch. No credential, database, provider request or paid image generation is needed. This loopback address refers to the device opening it; it does not provide phone access.

1. **Timeline Explorer:** read the recorded scene order, switch between playable timelines and labelled NON-CANON runs, inspect checkpoints, and try the text/type filters. Fictional time appears only where recorded. Historical Actor/place/consequence associations that were never recorded are shown as unknown, not inferred from prose.
2. **Places of Belonging:** open the Lantern Room, edit its display label, role and personal notes, save a version, and open history. Storage names are context only; they grant no access and move no items. These owner notes do not establish Canon, automatic visits or rest mechanics.
3. **What If · checkpoint child:** inspect the offered exact NON-CANON checkpoint, read the scripted review, select a new proposal and type an ordinary-language What If. The preview uses a fixed scripted suggestion and keeps approval blocked; production approval/child execution is proved separately with deterministic fixtures. No model is called from this preview.
4. **Visual Bible / FRAME:** edit a reference's appearance/outfit/guidance by hand, save a new draft, explicitly approve the visual reference, select a public scene and request a MOCK frame. Complete/cancel the queued mock and inspect its result/history. The result is a local schematic image, not a generated depiction of the campaign. Editing a reference invalidates its approval; older results keep their original basis.

## Ordinary campaign navigation

The campaign menu now includes Timeline Explorer, Places of Belonging, and Visual Bible / FRAME. Game's FRAME button opens the same visual screen. World → What If includes inspection and natural-language creation of a child from an eligible exact coherent checkpoint. Gallery displays labelled mock results without showing internal metadata.

Production continuation interpretation and simulation use the existing owner-selected Model Runtime, so an explicit action can make a paid model request when configured. This wave made zero live requests. Preparing a child requires the normal review, clarification, valid timing confirmation and immutable Scenario/Divergence approval. It never activates/restores the experiment into playable state.

## Limits and setup

No real/persistent owner database migration was executed. Additive migrations 21 and 22 were tested only on disposable PGlite. A later separately authorized installation must apply them to use the new production SQL operations; preview review requires no setup.

This completes four bounded slices, not the whole V1 roadmap. Full multi-model D2B/comparison, Timeline V2 causal graphs, Enter This World, live image adapters/quality, VIDEO, EXPLORE and the 2D engine are not implemented here. FRAME completion uses two existing idempotent writes (asset then attachment), with explicit retry after an interrupted attachment; it is not a new atomic media-job database. Places/visual reference edits use campaign-scoped immutable document corrections and can invalidate derived Lab bases; an ordinary Save/Load does not erase their owner history. No automatic visit/history collection or new storage permission is implied.

Browser verification is English/Russian desktop and 390×844 viewport testing with synthetic data. It is not physical iPhone or hosted Supabase verification. Live creative quality of these new slices has not been evaluated.

Recommended next step: owner review of this exact integrated wave and its disclosed limits, then a separately scoped acceptance/publication decision. Do not automatically begin another lane or future phase.
