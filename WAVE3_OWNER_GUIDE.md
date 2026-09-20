# Wave 3 owner review

Wave 3 is ready for review only after the verification recorded in `DEV_STATUS.md`. It does not change main, upgrade your database or deploy the application. Waves 1 and 2 remain accepted; Wave 3 needs separate owner acceptance.

## What to click

1. **Main menu → World Library → Describe From Scratch.** Give the world a title and describe it in ordinary language. Preserve the description. Your exact words become an owner-authored source, including its language and version history; they are never labelled as an external source fact.
2. Select sources under **Compile a draft** and arrange their priority. **Upload Sources** supports TXT and Markdown; **Combine** uses descriptions and uploaded sources together. **Local source indexing** makes no model request. **Configured model assistance** pins the configured application model and discloses the provider request before the explicit request action. Research is unavailable.
3. Open the resulting **World Pack**. Review the world overview, entities, assumptions, contradictions, unknowns and source coverage. Under a person, faction or location, expand **Edit identity** to correct its display name, aliases (one per line) or bounded entity type by hand. Add an optional **Owner note / resolution** beneath an unknown question; the original question remains visible. Use **Save new draft version**, then review that version again. These edits need no AI request and do not move campaign pins. Edit or reject claims, keep uncertain claims as Reference, or explicitly select eligible claims for Canon. **Ask to refine** remains optional and never silently approves Canon. Approve the reviewed version only after checking the approval summary.
4. **Campaign Settings → World Packs.** Choose and explicitly pin an approved Pack version. New source or Pack versions do not move an existing campaign pin. Pinning does not automatically create all playable actors, capabilities or schedules.
5. **Create campaign**, or **Campaign Settings → Campaign premise.** Write the intended scenario, role, tone and pace in the substantial multiline field. Save, review, browse older versions or restore an earlier version as a new version. This is advisory writing: review does not change effective rules, control a character or execute a prompt. Use the structured settings separately.
6. **Campaign Settings → AI, World & Rules.** Select World Logic for free-form play without required HP/d20/classes. Supported consequences need established capabilities and current state. When enabling world simulation or increasing deadline pressure, review **Before the world resumes**, choose a fictional-time allowance and acknowledge the prospective restart. Saving advances no events and never applies an overdue backlog immediately.

The existing language control switches the interface between English and Russian. It does not translate preserved source or premise text.

## Synthetic review and real use

The disposable local review uses actual application components with synthetic sources, campaign records and scripted compiler/turn responses. Changes stay in memory; real databases and provider connections are blocked. The review toolbar and turn-state selectors exist only in the ignored local harness. Campaign Pack binding is deliberately disabled there; the real database flow is verified separately with disposable PGlite tests.

World Logic preview states show a completed typed action, an equivalent turn ready to resume, recovery requiring review, missing evidence and unsupported effects. They demonstrate presentation only. Deterministic engine/database tests separately verify settlement, save/load, timelines, original checks and duplicate protection.

Real use requires a separately reviewed release and additive migration 12. Assisted compilation and gameplay also require server-side provider configuration. Unsupported models stop explicitly. No live-model quality evaluation, real migration, real import or deployment was performed during this sprint.

## Boundaries

- Consequences cover bounded established travel, NPC relocation, exact public observations, inventory consumption, integer resource spending, a small physical-condition vocabulary, objective completion and existing Thread/Hook/warning progression. Arbitrary relationship systems, new resources, free-form state patches and arbitrary tabletop mechanics are unsupported.
- Source extraction is bounded TXT/Markdown. Model proposals may be incomplete and always need review. Private/future inputs conservatively keep newly generated candidates private/future. Approval and campaign pinning remain separate actions.
- Manual identity corrections preserve canonical IDs and all source/evidence references. Aliases are limited to 20 distinct names of up to 240 characters each. Unknown-item notes accept up to 2,000 characters and remain owner-authored reference; they do not become source facts or Canon, remove the original gap or bypass review. Earlier immutable versions retain the original proposal and previous corrections.
- Reconciliation explains the policy change without exposing private schedules, IDs, counts or a hidden-work indicator. It restarts only newly enabled overdue work in future fictional time and preserves existing warning opportunities.
- Recovery resumes only when current authority is equivalent. Material changes require review/cancellation and an explicit new action. Legacy stages without captured proof cannot cross changed fences.
- Campaign premise is the composition-input foundation. World Lab, What-If and Enter This World remain unstarted. A/B/C are not declared complete.

After owner review, a possible next bounded wave is owner-reviewed authoring of playable actors, their capabilities and causal Threads from an approved Pack, with deterministic consequence examples. This recommendation does not authorize or start Wave 4.
