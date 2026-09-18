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

Acceptance:
- no broken routes
- desktop matches mockups closely
- mobile usable
- user approves visual direction

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

Acceptance:
- refresh loses nothing
- documents version correctly
- two campaigns stay isolated
- private state never appears in normal client data

Suggested prompt:

> Implement Milestone 1 only using Supabase. Add migrations and persistence for the existing UI. Keep DM Private server-only. Seed realistic demo data. No OpenAI yet. Test campaign isolation and document versioning.

---

# MILESTONE 2 — TEXT DM

Goal:
The app becomes playable.

Build:
- server-side OpenAI DM endpoint
- structured schema
- dice tool
- player input
- narration
- state patch validation
- inventory/resource updates
- quest updates
- private state updates
- retry/error handling

Acceptance:
- 20–30 turn test campaign works
- HP/resources remain correct
- consumed items stay consumed
- hidden state does not leak
- failure never destroys player input

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
