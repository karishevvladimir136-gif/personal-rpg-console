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
- OpenAI image generation
- gallery
- Set as Canon Reference

Acceptance:
- 5 generated James scenes look recognizably consistent
- hidden NPC/secret details never appear
- failed generation does not affect game

Suggested prompt:

> Implement Milestone 4 only. Add Visual Bible and FRAME generation using server-side OpenAI image generation. Use approved references and spoiler-safe visible scene data only. Save generated assets to campaign Gallery.

---

# MILESTONE 5 — VIDEO

Goal:
One click turns a scene into a short cinematic clip.

Build:
- fal server integration
- queue submit/status
- video jobs table
- current frame as preferred source
- hidden keyframe fallback
- character/location references
- 5/10/15 sec options
- async status
- gallery video

Acceptance:
- player can continue text game while generation runs
- result attaches to correct campaign/scene
- no API secret in browser
- failure is retryable

Suggested prompt:

> Implement Milestone 5 only using fal Seedance. Keep FAL_KEY server-side. Use queue-based async generation. Prefer current scene frame and canonical references. Default 10 seconds. Do not block gameplay.

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
