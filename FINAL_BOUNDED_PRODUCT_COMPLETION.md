# Final bounded Character, Inventory, and Game completion review

**Status:** BLOCKED — the one controlled Map image dispatch ended uncertain before pixels, review, or a draft were recorded. No retry was made. This is an isolated candidate for owner review, not an owner activation.

## Scope and authority

- Branch: `codex/character-sheet-polish`; reviewed base: `36486d78c3ac642d1bfe9d2e2a85f6b969015b32`.
- Main remains `4d4de0b0cc16ff21f84c24b63df7cbd5290f81df`. The owner database remains at Migration 41. Migration 42 was applied to disposable databases only.
- The diff from the reviewed base is 27 intended files, 603 insertions and 108 deletions: bootstrap/equipment authority, accepted-only subject art, bounded Game/Character/Inventory presentation, player copy, tests, and these two review documents. No provider, Memory, Astra, save/timeline, or gameplay authority was replaced.
- No Astra gameplay turn was submitted. The historical Greenmarch campaign, owner gameplay, running owner app, and deployment were not changed. The live media review used the explicitly isolated disposable campaign `6a02d590-044d-465e-8dba-bf7a72fc5900` through the normal candidate UI on port 3001.

## Product corrections

- A reviewed, structured humanoid protagonist now creates the existing eight-slot equipment profile: Head, Neck, Armor, Hand, Off Hand, Belt, Legs, and Boots. An approved starting weapon occupies the canonical `hand` slot. Narrative and nonhumanoid characters do not receive a forced humanoid profile. Historical entities and saves retain their previous representation. The additive Migration 42 remains unactivated on the owner database.
- Character and item details offer Generate or Regenerate according to accepted art. The same subject identity is used throughout. A replacement draft stays in review while the previous accepted image remains ordinary art; only explicit Keep selects the replacement. Portraits reuse the accepted public image in Character, Game, and campaign identity surfaces. Item cards/details reuse the accepted item art. No image changes an Entity, Item, Canon, or game mechanic.
- Game now has one primary action composer with a compact OOC toggle, recorded Dice view, Take note, and What do I know? links. FRAME and VIDEO remain compact secondary actions inside the current scene card; the repeated `FRAME & VIDEO · this scene` section below the composer is gone. Advanced records stay collapsed. The current scene artwork control is in that same card. The "Your action" anchor lands above the text box, and a Journal deep link is consumed once so focus refresh does not reopen a dismissed note.
- Normal player labels touched by this sprint use campaign language rather than World Logic, Foundation, Console Basic, or active rules profile implementation names. Internal ruleset IDs and authority are unchanged.

## Live image evidence

All paid actions below were new, explicitly confirmed requests. No historical uncertain job was retried. The shared OpenAI image provider, existing reservation budget, PNG storage, automated review, draft, and owner Keep lifecycle were used. The five successful images each have one stored PNG, one completed review check, and one accepted Asset. Review drafts were never made ordinary art before Keep.

| Review | Saved job | Result |
| --- | --- | --- |
| First Character portrait | `14b28f3b-1af1-4d0d-a9e1-e1e47a2deba4` | Accepted; shown on Character and Game. |
| Replacement Character portrait | `ee674bec-eb1e-49ec-a63a-c70b92cdff3a` | Old portrait remained active during generation and draft; new accepted image replaced it on Character and Game. |
| First Plain sword image | `74296ca7-d56f-423b-9e08-5403ce4f334b` | Accepted; shown in item details and Inventory. |
| Replacement Plain sword image | `9627baa8-512c-4e2c-98b3-596ef6cc1da7` | Old image remained active during draft; new accepted image replaced it in item details and Inventory. |
| Current committed-scene FRAME | `6989351d-5511-4cfd-b906-b4999649b6d0` | Accepted; shown in the Game scene. A suspected pre-accept display was a screenshot timing mistake: the Asset had already been accepted four seconds earlier. |
| Structured atlas Map | `c85787c3-fad4-4e8d-b3c5-aaf39251cd73` | One dispatch was claimed, then the job became `uncertain`. No PNG, review check, draft, or Asset exists. No retry or recovery was attempted. |

For Map, the job was queued at 08:31:47 UTC, claimed/generating at 08:31:48, and uncertain at 08:32:39. The app returned HTTP 503 after roughly 60 seconds. This is the application's response, not proof of the OpenAI HTTP status. The image-provider adapter collapses transport errors and non-definite provider outcomes into `unavailable`; whether OpenAI received a response or charged the request is unknown. The structured map pins and gameplay geography were unchanged. A separate browser refresh briefly showed a campaign-store error during the resource-heavy test run; a later GET returned 200. It is not evidence of a Map image result.

There were **six server-side image generation invocations**: five with stored output, one uncertain. Five automated reviewer calls completed. Six new reservations total **$3.60 maximum** ($0.60 per request). The existing $20 owner media budget moved from four reservations/$2.40 reserved to ten reservations/$6.00 reserved, leaving twenty call slots and $14.00 of reservation ceiling. Actual provider billing is not established by reservation records, especially for the uncertain Map request.

## Visual review

The actual candidate application was inspected in a signed-in browser. Evidence is outside Git at `C:\Users\<owner>\.codex\artifacts\final-product-completion-20261007`. Key captures include `game-desktop-scene-composer.jpg`, `game-mobile-scene-composer.jpg`, `character-desktop-before-portrait.jpg`, `character-desktop-accepted-portrait-full.jpg`, `character-desktop-replacement-draft-full.jpg`, `character-desktop-replacement-accepted.jpg`, `game-desktop-replacement-avatar.jpg`, `item-detail-first-draft-before-keep.jpg`, `item-detail-replacement-draft-old-active.jpg`, `item-detail-replacement-accepted.jpg`, `game-frame-after-accept.jpg`, `map-artwork-ready-before-generation.jpg`, and `map-uncertain-ui-store-error.jpg`. The 390px Game view had no horizontal overflow. The Map screenshot records the visible error state, not a completed artwork.

A separate real app session against the disposable rehearsal database at Migration 42 captured the eight-slot Character sheet at `C:\Users\<owner>\.codex\artifacts\greenmarch-ui-review-20261007\rehearsal-character-eight-slots.png` (SHA-256 `cf837bc509c6abd952195269afb94f13485d8e715c92c2030d0010e8a2f4e88f`). Its disposable structured humanoid had all eight slot IDs and the same simple sword equipped in `hand`. A disposable rehearsal-only auth password was set for that browser capture; the isolated app was stopped afterward. The owner app/database were not changed.

## Verification and next boundary

The focused equipment, visual, Game/Character, vocabulary, and bootstrap batch passed **72/72**. The targeted Game, live UI integration, and vocabulary batch after final diff review passed **46/46**. The final complete repository suite passed **2,085/2,086**, with zero failures and one existing skip. TypeScript, repository ESLint with zero warnings, and the production webpack build all passed. An earlier full run found a review-only Journal effect regression; it was corrected before this final full run.

The remaining acceptance boundary is a separately authorized investigation or exact-request recovery for the uncertain Map job. It must retain the existing dispatch identity and must not create an automatic second paid request. There is no evidence that Map artwork passed the required live acceptance gate. No owner DB Migration 42 application, main merge, or deployment is included in this candidate.
