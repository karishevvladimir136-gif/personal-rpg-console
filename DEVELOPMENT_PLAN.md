# DEVELOPMENT PLAN
## Personal RPG Console

---

# MILESTONE 0 — UI SHELL

Goal:
A clickable application that looks and feels correct before any backend complexity.

Build:
- global shell
- campaigns
- game
- character/inventory
- journal/evidence
- map
- library
- session recap
- settings
- responsive mobile

Use fake data only.

Owner-requested Phase 0 refinement (MASTER_SPEC section 33):
- dedicated **Campaign settings → Rules & Play Style** tab, separate from application preferences
- Easy / Medium / Hard / Custom and expandable Advanced difficulty controls; explicit centralized provisional values, independent HP/damage, conditional limited-reroll allowance, defeat, recovery, and scarcity
- respect the campaign's rules-system capabilities; unsupported mechanics are unavailable
- independent Story Structure, Player Role, and World Autonomy controls with explanations and agency guarantees
- defaults: Medium / Balanced / One of many / Moderate
- keep structured settings/presets separate from presentation; use campaign-scoped in-memory state across screen navigation, reset on refresh
- English and Russian labels, responsive desktop/mobile layout, clear preview/no-gameplay-effect notice
- no migrations, API routes, persistence, authentication, AI, or simulation engine

Final Phase 0 checks/dice refinement (MASTER_SPEC section 35):
- extend campaign Rules & Play Style with independent Check Frequency (Narrative / Balanced / Full RPG; Balanced default), Dice Presentation (Hidden / Key Rolls / All Player Rolls; Key Rolls default), Interactive Dice (On), and Show DC (Off)
- Hidden disables the last two controls without discarding preferences; never expose private checks or private DCs, or hint that a private check occurred
- frequency does not change difficulty or select Custom; Full RPG excludes trivial guaranteed, impossible, and repeated unchanged attempts
- reusable original HTML/CSS/inline-SVG d20 demo from Game and Settings, using fixed success/failure/advantage/disadvantage samples and important/non-important checks
- neutral waiting state, modifiers, permitted DC, guarded short animation, result breakdown, final announcement, and explicit sample-animation replay; no campaign effects or allowance consumption
- honor Hidden, compact automatic, and interactive presentation modes; accessible modal, reduced motion, timer cleanup, shared temporary state, both languages, desktop/390px/320px layouts
- test presentation/setting independence, DC policy, fixture arithmetic, kept dice, double activation, cancellation/reopen, and translations; distinguish automated coverage from browser/physical-device checks

Consolidated Phase 0 refinement (MASTER_SPEC section 36):
- separate main menu / campaign selection / URL-scoped campaign navigation, honest Exit, unknown-ID 404s and legacy redirects; preserve concept isolation
- split global interface/reading preferences from campaign story language, narrative/rules/play style, and visual settings
- replace primary inventory tables with reusable icon grids and shared item details; storage views, translated search/category filters, player/companion paper dolls and configurable transport profiles
- one campaign-scoped model for item identity, ownership, storage, and equipment; retain Old Ford without inventing mounts; respect absent companions and unestablished anatomy
- Party/Camp free-text conversation preview with stored sample exchange and temporary campaign/companion messages
- Game Rest → compact Short Rest / dedicated warm Camp; explicit demo entry/eligibility/leave/complete; separate short/long supply costs including zero select Custom independently of Recovery
- remote deposit preview from accessible inventories; stash inspect always, withdraw/use/equip only during active long-rest camp; cargo proximity remains independent
- small optional grilled meal/stew/coffee samples with accessible ingredients, quantities, recipients, provisional effects, insufficient state, and shared Talk over food/drink
- honest item-image entry and local demo states only; no provider, persistence, engine, resource mutations, or actual effects
- retain all existing difficulty/narrative/check/dice behavior; bilingual desktop/390px/320px and keyboard/dialog/reduced-motion verification

Final Phase 0 Combat View refinement (MASTER_SPEC section 37):
- Game-only Preview Combat entry/exit/reset and visible synthetic indicator; no new navigation tab
- portrait initiative/round, public party inspection distinct from active character, static scene with selectable qualitative-health enemies and positioning labels, public log, active-character action/bonus/reaction/movement budget
- action → eligible target → cost confirmation → existing dice presenter → isolated authored consequence; James/Jinn direct control, explicitly advanced enemy response and party return
- reuse Hidden/Key/All, Interactive and Show DC; Hidden opens no modal, compact needs no roll click, no private checks or targets in client/log; Check Frequency never removes mandatory combat rolls/saves
- literal free-text proposal with labeled sample response, stable pending action IDs and duplicate protection; no campaign mutations, actual rules, persistence, AI or provider calls
- summary of injuries/resources/loot, no automatic healing/rest, demo-only loot; reset/exit/navigation discard encounter
- bilingual desktop/390px/320px, keyboard focus, reduced motion, no-art fallback, mobile party/history switches; isolated lifecycle/idempotency/presentation tests and actual browser results
- future direct party control first; automatic companions and tactical grids remain deferred

Acceptance:
- no broken routes
- desktop matches mockups closely
- mobile usable
- preset application, every Custom transition, and narrative independence covered by tests
- rules-system capability checks, both languages, navigation retention, and refresh defaults verified
- typecheck, lint, tests, and production build pass; actual results recorded in DEV_STATUS.md
- user approves visual direction

Implementation completion does not count as owner approval. The owner subsequently approved Phase 0 at 96b69dcd63d2fa015f5e75bcc5d632c41e04369e and explicitly authorized Phase 1. See DEV_STATUS.md for distinct implementation and independent-review records. Phase 2 and deployment remain unauthorized.

Suggested agent prompt:

> Implement Milestone 0 only. Use `/design` as primary reference. Build the full static UI shell with mock data. No database, auth or AI. Run typecheck/lint/build. Give me a preview.

---

# MILESTONE 1 — PERSISTENCE

Goal:
Everything the user edits survives refresh.

Build database entities:
- Campaign
- Document
- DocumentVersion
- Character
- NPC
- Session
- Scene
- CampaignState
- Item
- Quest
- Location
- Asset metadata

Add:
- create campaign
- edit docs
- version history
- inventory editing
- session persistence
- one owner login
- persist campaign-scoped encounter participants, turn order, public positioning, system-specific resources and pending actions/status; separate server-private data (section 37); persistence does not activate combat resolution
- persist campaign Rules & Play Style and rules-system capabilities separately from global preferences and document context (MASTER_SPEC section 33)
- validate structured values and record effective settings revisions/history so changes are prospective
- persist scoped equipment entities/profiles, item ownership/storage/equipped slots, conversation records, recipe/effect data, and required rest-stage records from section 36; keep access-dependent operations disabled until authoritative rules exist
- persist the consolidated Checks & Dice campaign preferences, including the saved Interactive Dice/Show DC values while Hidden; keep presentation separate from difficulty and defer resolution to Phase 2

Acceptance:
- refresh loses nothing
- documents version correctly
- two campaigns stay isolated
- private state never appears in normal client data
- campaign rules/play-style choices survive refresh and remain isolated by `campaign_id`
- settings changes never rewrite historical scenes, rolls, or established facts; no AI behavior yet

Suggested prompt:

> Implement Milestone 1 only using Supabase. Add migrations and persistence for the existing UI. Keep DM Private server-only. Seed realistic demo data. No OpenAI yet. Test campaign isolation and document versioning.

---

# MILESTONE 2 — TEXT DM

Goal:
The app becomes playable.

Build:
- server-side OpenAI DM endpoint
- section 36 companion conversations through the same DM, contextual knowledge/listeners, non-guaranteed trust, public session history, and serialized state-changing Game/conversation turns
- authoritative rest/camp eligibility and lifecycle, explicit completion/recovery/time, no recovery on leave, access closure, and no refresh/direct-route bypass; preserve completed activities, keep hidden interruptions server-only
- code-enforced remote deposits, active-camp-only stash withdrawal/use/equip, independent cargo access, campaign/quantity validation, and atomic/idempotent operations
- optional small recipe system with explicit preparation versus consumption, validated stock/recipients, modest rules-compatible temporary effects, one meal + one drink maximum, replace/refresh not stacking, activation after creating rest and explicit expiry, no duplicate charges or double counting as rest supplies
- structured schema
- dice tool
- player input
- narration
- state patch validation
- inventory/resource updates
- minimal server-validated item transformations through gameplay actions (MASTER_SPEC section 34): consumed ingredients, embedded components, retained tools, provenance, atomic updates, and idempotent retries; no dedicated crafting/alchemy system
- quest updates
- private state updates
- retry/error handling
- authoritative encounter action/target/cost validation, server dice, reactions, validated literal free-text proposals and atomic/idempotent campaign consequences (section 37); support victory/escape/surrender/negotiation/objective completion, without automatic healing/rest
- Check Frequency applies to discretionary situational checks and never removes required attack rolls or saves
- code-enforced, rules-system-aware mechanics for difficulty, reroll limits, recovery, and resource consumption; AI prompts alone must not enforce mechanics
- pass structured narrative guidance and campaign document context to the single DM while preserving canon and player agency
- clarify settings/canon conflicts rather than silently rewriting; changes only affect future play
- advance relevant NPC/faction goals with meaningful events and in-world time according to autonomy, without a background simulator or multiple AI agents
- validate AI-proposed structured checks server-side before resolution; withhold action outcomes until the server produces and records actual dice results
- separate check resolution from animation/presentation; stable check IDs and idempotent resolution prevent extra rolls from double-clicks, retries, navigation, or refresh
- enforce campaign reroll policy in code; private checks/targets remain server-only without UI hints; disclose only permitted player-facing DCs

Acceptance:
- 20–30 turn test campaign works
- HP/resources remain correct
- consumed items stay consumed
- transformation tests cover valid outputs, rules-defined failed-attempt costs, missing/inaccessible inputs, retained tools, embedded components, campaign isolation, atomic rollback, and duplicate/retry protection
- hidden state does not leak
- failure never destroys player input
- tests prove supported mechanics are enforced, unsupported HP assumptions are rejected, narrative axes stay independent, and historical outcomes are unchanged by settings edits
- tests prove check idempotency, authorized reroll limits, no premature outcome narration, no private-check/DC leakage, and correct campaign-specific natural-roll rules

Suggested prompt:

> Implement Milestone 2 only. Add one server-side DM runtime using OpenAI. Use structured output with separate narration, public patches and private patches. Add deterministic dice. Validate patches before persistence. No long-term retrieval yet.

---

# MILESTONE 3 — LONG-TERM MEMORY

Goal:
New sessions feel like the same campaign.

Build:
- END SESSION
- player recap
- private summary
- exact resume point
- snapshots
- document retrieval
- older scene retrieval
- NPC memory retrieval
- canon priority
- conflict checks
- retrieve scoped companion conversations, trust-relevant events, rest/cooking outcomes and item provenance without private/cross-campaign leakage
- effective campaign settings/history included in snapshots and resume without retroactively reinterpreting prior facts

Acceptance:
- Session 2 starts correctly
- old facts can be recovered
- archived canon is ignored
- manual corrections win
- no cross-campaign leakage

Suggested prompt:

> Implement Milestone 3 only. Add session summaries, snapshots and campaign-scoped long-term retrieval. Follow canon priority from MASTER_SPEC. Add tests for cross-campaign leakage and hidden-data leakage.

---

# MILESTONE 4 — FRAME + VISUAL BIBLE

Goal:
Scene images feel consistent.

Build:
- optional asynchronous item art from known appearance/safe references using owner-selected supported image model; category fallbacks remain immediately usable, assets follow item identity, generic icons may be reused, unique art cannot affect unrelated items
- item generation only by explicit request, duplicate-job protection, cost estimate/unknown disclosure, preserved prior asset on regeneration/failure, no mechanics/canon changes (section 36)
- Visual Bible UI
- approved references
- FRAME button
- spoiler-safe visual scene builder
- owner-selectable supported image provider/model, with campaign default and per-generation override
- server-side spoiler-safe text-model prompt preparation with optional review/edit
- small model registry and provider adapters (MASTER_SPEC section 32)
- gallery
- Set as Canon Reference

Acceptance:
- 5 generated James scenes look recognizably consistent
- hidden NPC/secret details never appear
- failed generation does not affect game

Suggested prompt:

> Implement Milestone 4 only. Add Visual Bible and FRAME generation using owner-selected supported provider/model integrations as specified in MASTER_SPEC section 32. Verify provider capabilities and model choices with the owner before integration. Use approved references and spoiler-safe visible scene data only. Save generated assets to campaign Gallery.

---

# MILESTONE 5 — VIDEO

Goal:
One click turns a scene into a short cinematic clip.

Build:
- owner-selected supported video provider/model integration
- campaign default and manual per-generation model override
- video-specific spoiler-safe prompt preparation
- queue submit/status
- video jobs table
- current frame as preferred source
- hidden keyframe fallback
- character/location references
- model-supported duration/audio/reference options (5/10/15 seconds only where supported)
- async status
- gallery video

Acceptance:
- player can continue text game while generation runs
- result attaches to correct campaign/scene
- no API secret in browser
- failure is retryable

Suggested prompt:

> Implement Milestone 5 only following MASTER_SPEC section 32. Confirm the owner's video providers/models and their API capabilities first; fal is a candidate, not a fixed exclusive choice. Keep all keys server-side. Use asynchronous generation with explicit model choice and optional prompt review. Prefer current scene frame and canonical references. Default to 10 seconds only when supported. Do not block gameplay.

---

# MILESTONE 6 — POLISH

Add only after core system is stable:
- drag/drop Evidence Board
- What Do I Know?
- relationship UI
- session cover generation
- travel route polish
- global search
- export/import
- restore snapshot
- accessibility
- mobile refinements
- subtle animations

Acceptance:
The owner prefers playing here over managing the same campaign manually in ChatGPT.


## Preliminary media selection decision

FRAME and VIDEO must support owner choice of supported providers/models, independently, with campaign defaults and per-generation overrides. Optional Fast / Quality / Key Scene profiles supplement rather than replace manual selection. Exact providers/models are undecided. Follow MASTER_SPEC section 32, including spoiler-safe prompt expansion, capability validation, cost transparency, and no silent model fallback. This decision adds no implementation work to Phase 0 and does not authorize starting later milestones.
