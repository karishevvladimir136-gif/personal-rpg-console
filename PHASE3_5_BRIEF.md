# Phase 3.5 — Save / Load / Timeline Fork

Now explicitly authorized after Phase 3 owner acceptance at implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0`, recorded in `96964964a7d5046ff34b6b6ae695ecf494885cc4`. The original queued brief below is preserved as the requirement history; its prerequisite stop is satisfied by that acceptance and the separate Phase 3.5 authorization. Follow PHASE3_5_CONTRACTS.md for the inspected architecture, concrete shared interfaces, worker ownership and acceptance gates. No later phase, World Engine, deployment or real-data import is authorized.

## Campaign navigation clarification

Save/Load is a first-class inside-campaign feature. Add a dedicated **Saves / Сохранения** navigation entry, with desktop order **Library → Gallery → Sessions → Saves → Campaign Settings**. Settings is not the primary Save/Load location. The canonical Saves screen has two simple tabs: **Save Games / Сохранения** (Quick Save, Manual Saves, Autosaves) and **Timelines / Временные линии** (current timeline and preserved previous branches). No node graph is required. On mobile, expose Saves through the existing **More** menu, without adding a permanent bottom-navigation item. An optional Game overflow Quick Save shortcut may supplement the dedicated screen. Preserve campaign navigation hierarchy and dark/bronze design.

## Complete owner-supplied future brief

This is a queued future milestone, not an instruction to interrupt active Phase 3 work.
Do not stop, restart, redirect, or expand the current Phase 3 workers.
Finish Phase 3 exactly under its existing contract and stop at PHASE 3 READY FOR OWNER ACCEPTANCE.
Do not implement anything from this prompt until:
1.  Phase 3 implementation is complete;
2.  Phase 3 has passed its required acceptance gates;
3.  the owner has explicitly accepted Phase 3;
4.  the owner separately authorizes Phase 3.5 implementation.
Until then, treat this as the design brief for the next milestone only.
Add a robust Save / Load / Timeline Fork system for a private single-user RPG.
The player should be able to:
-  create manual saves;
-  quick-save;
-  use bounded autosaves;
-  load an older point safely;
-  try different choices without destroying the original timeline;
-  return to a previous branch later;
-  optionally use stricter save policies for harder campaigns.
The implementation must work with the Phase 3 long-term memory architecture and must never allow stale memory from a discarded future to contaminate the restored timeline.
The core architectural principle is:
Loading a save creates or activates a coherent timeline branch from that historical state. It does not destructively rewrite history in place.
A save is not only HP/inventory.
Loading must restore a coherent world state including:
-  exact structured state;
-  campaign time;
-  location;
-  character/NPC state;
-  inventory/resources;
-  equipment/storage;
-  quests;
-  relationships where structured;
-  encounter/rest state;
-  pending operations/checks;
-  public knowledge;
-  NPC/companion knowledge;
-  DM-private state;
-  hidden clocks/plans;
-  session/resume state;
-  applicable settings/guidance revisions;
-  memory/checkpoint visibility;
-  derived-memory validity;
-  source-history watermark.
A future event from Timeline A must never be retrieved or remembered after loading an earlier state into Timeline B unless that event also occurred in B.
Example:
```
SAVE — before meeting the king
         |
         +-- Timeline A
         |     threaten king
         |     war begins
         |
         +-- Timeline B
               negotiate
               alliance forms
```
Timeline B must not remember that the war from Timeline A occurred.
Prefer the simplest extension of the existing Supabase architecture.
Do not:
-  create a second backend;
-  clone the entire database per save;
-  create a vector service;
-  build a blockchain/event-sourcing framework;
-  build an elaborate Git-like UI;
-  introduce multiplayer branching.
Reuse the durable ordered source history, snapshots, checkpoints, revisions and memory source links already present after Phase 3.
Add explicit timeline identity where needed so all active historical and derived records can be scoped to:
-  campaign;
-  timeline/branch;
-  source revision/watermark.
The exact schema design should be proposed by the lead after inspecting the completed Phase 3 repository.
A save point is immutable.
At minimum store or reference:
-  save ID;
-  campaign ID;
-  timeline ID;
-  owner-visible name;
-  save type:
  -  manual;
  -  quick;
  -  autosave;
  -  safety-before-load;
-  creation time;
-  gameplay session/scene/turn;
-  exact state revision;
-  source-history watermark;
-  current in-world time;
-  current location;
-  current participants;
-  exact structured snapshot/reference;
-  public memory checkpoint;
-  private DM checkpoint/reference;
-  effective settings revision;
-  effective DM guidance revision;
-  pending operation/check status;
-  derived-memory validity/version references.
Save points themselves must never be rewritten.
Owner-visible renaming/favoriting may update metadata without changing the saved gameplay state.
Do NOT implement destructive rollback of the existing campaign history.
When the owner chooses Load:
1.  Validate campaign/owner/save ownership.
2.  Verify all referenced source/state records still exist and are internally valid.
3.  Create a safety save of the current timeline when appropriate.
4.  Create or activate a new timeline branch rooted at the selected save point.
5.  Restore the exact active state for that branch.
6.  Restore the correct public/private memory checkpoint.
7.  Ensure retrieval only sees history valid for the newly active timeline.
8.  Exclude all later events from the abandoned branch.
9.  Preserve the old branch so the owner may return to it.
10.  Resume from the exact recorded operation/check state.
Do not:
-  reroll an already recorded roll;
-  duplicate a committed mutation;
-  regenerate historical narration;
-  silently merge divergent timelines;
-  bring future knowledge into the restored branch.
Each timeline should have:
-  stable ID;
-  campaign ID;
-  parent timeline ID when forked;
-  fork save ID / source watermark;
-  owner-visible label;
-  created time;
-  active/archive status;
-  current head revision/checkpoint.
Initially keep timeline UX simple.
Owner-facing concepts:
-  Current Timeline
-  Save
-  Load
-  Previous Timelines
Do not expose implementation details such as database revisions, source IDs or memory watermarks in normal UI.
Add a simple Quick Save action.
Desired behavior:
-  one current quick-save slot per campaign/timeline is enough initially;
-  creating a new quick save may replace the owner-visible quick-save pointer;
-  the underlying immutable save record/history may remain auditable internally;
-  quick save must never interrupt or duplicate an in-flight operation.
If there is an unresolved check/turn, either:
-  save it exactly as pending;
-  or refuse safely with a clear explanation.
Never auto-resolve it.
Allow owner-created manual saves with a simple title, e.g.:
-  Before the fortress
-  Before talking to Elena
-  Boss room
Manual saves should be effectively unlimited for this private home project, subject only to practical storage limits.
Do not add commercial quota logic.
Add bounded autosaves.
Sensible initial triggers may include:
-  session start;
-  session end;
-  before a major committed encounter if appropriate;
-  after a meaningful committed scene;
-  before a load operation.
Keep autosave frequency conservative and configurable.
Retain a bounded recent autosave set, e.g. 10–20 per timeline.
Do not generate an autosave on every keystroke or provider call.
Autosaves must not create model calls by themselves.
Prepare campaign-level policy support:
Manual save/load available at safe points.
Saves/loads restricted to defined checkpoints/session boundaries as configured.
Limited or disabled manual load behavior.
Do not make Ironman irreversible at the database level.
This is a player experience/rules setting, not a reason to destroy recovery data.
The owner of this private application must always retain an emergency recovery path outside ordinary gameplay restrictions.
Do not overbuild difficulty policy in the first implementation.
This is the most important requirement.
Phase 3 derived memory must become timeline-aware.
On fork/load:
-  only source events valid at or before the fork point plus new events on the active branch are eligible;
-  summaries from abandoned future history must be excluded;
-  retrieval indexes must respect timeline ancestry/fork boundaries;
-  caches must include timeline identity;
-  NPC knowledge must reflect only events valid in the active timeline;
-  private DM plans from the abandoned future must not survive unless they existed before the fork and remain valid;
-  invalid/stale derived artifacts must not be served while rebuild is pending.
Prefer source-linked validity/filtering rather than physically deleting old branch memory.
Raw source history remains preserved.
At fork time, the new timeline inherits only state/history valid up to the chosen save point.
Historical data before the fork should not need physical duplication where immutable records can safely be referenced.
New post-fork events belong to the new timeline.
Optimize for correctness and simplicity before storage optimization.
Clearly distinguish:
Example:
 World Bible document current version.
Example:
 The king died in Timeline A but survived in Timeline B.
If the owner corrects an underlying canonical/source fact globally, follow existing Phase 3 authority/invalidation rules.
If the owner corrects a timeline-specific event/state, scope it to that timeline unless explicitly choosing a campaign-wide correction.
Do not silently propagate branch-specific events across timelines.
Timeline branching must include private continuity correctly.
Example:
Before fork:
```
antagonist intends to betray player
```
Timeline A:
```
betrayal occurs
```
Timeline B:
```
player prevents betrayal
```
Loading/forking from before the divergence may inherit the original intention.
Timeline B must never inherit the completed betrayal event from Timeline A.
Keep all DM-private branching server-only.
Normal client payloads must not reveal:
-  hidden branch differences;
-  unrevealed plans;
-  private memory;
-  hidden event counts;
-  private timeline metadata.
Save/load is intentionally allowed to support experimentation and owner-selected save-scumming styles.
However, preserve deterministic historical integrity:
-  loading a save may create a new future in which a new future roll can occur;
-  replaying/refreshing an already accepted operation in the same timeline must reuse its recorded result;
-  never reroll due merely to refresh/retry;
-  a new branch after loading may legitimately produce a different future roll once a genuinely new operation is submitted.
This distinction must be tested explicitly.
Add a simple Save/Load experience consistent with the current dark/bronze design.
Suggested UI:
Save Game
-  Quick Save
-  New Manual Save
Load Game
Cards/list showing:
-  save name;
-  session;
-  scene/turn;
-  in-world location if public;
-  timestamp;
-  save type.
Loading should warn:
Restore this save?
Your current timeline will be preserved so you can return to it later.
Add a lightweight Timelines view only if needed:
```
Current
└─ Main Timeline

Previous
├─ Before the Fortress
└─ King Negotiation Alternative
```
Do not build a complex node graph in the first version.
Unless the current state is already safely represented by an equivalent save/checkpoint, automatically create a hidden or clearly labeled:
Before load — [timestamp]
safety point.
This protects the owner from accidental loss.
Loading must never destructively erase the current future.
Do not duplicate media blobs when forking.
Existing image/video/assets should be referenced by stable identity where valid.
Future timeline-specific media may attach to that branch.
FRAME/VIDEO implementation is still outside this milestone.
Do not implement full backup/export/import UI here unless separately authorized.
Design save/timeline records so future full campaign export can preserve them.
Use synthetic campaigns only.
At minimum test:
-  create manual save;
-  quick save;
-  bounded autosave retention;
-  load/fork;
-  return to previous timeline;
-  safety save before load;
-  exact HP/resources restoration;
-  inventory quantities;
-  consumed item remains consumed at the save point;
-  item consumed after save exists again when correctly loading the earlier state;
-  quests/location/time restoration;
-  companion/NPC knowledge restoration;
-  DM-private plan restoration;
-  pending visible roll survives correctly;
-  retry does not reroll;
-  new branch can produce a genuinely new future roll;
-  abandoned future events are absent from active retrieval;
-  abandoned future summaries are absent;
-  old branch remains intact;
-  branch-specific owner correction stays scoped;
-  campaign-wide source correction invalidates affected timelines correctly;
-  no cross-campaign leakage;
-  no cross-timeline future leakage;
-  duplicate load request is idempotent;
-  stale load request fails safely;
-  two browser tabs cannot create an inconsistent active timeline;
-  logout/relogin preserves active timeline;
-  English/Russian;
-  desktop/390px/320px.
Build a specific synthetic scenario:
1.  Save at point S.
2.  Continue Timeline A for many events.
3.  Reveal a private secret to an NPC.
4.  Consume an item.
5.  Complete a quest.
6.  Generate summaries/retrieval memory.
7.  Load S into Timeline B.
Verify in B:
-  NPC does not know the later secret;
-  consumed item is present if it existed at S;
-  completed quest is not completed unless it was at S;
-  Timeline A's later summary is not retrieved;
-  DM-private future from A is not included;
-  exact state matches S;
-  new actions create B-only history.
Then return to A and verify all A history/state still exists unchanged.
Creating or loading a save should not require an OpenAI call unless a separately required memory rebuild genuinely needs one.
Prefer exact persisted snapshots/references and deterministic restoration.
Do not regenerate an entire campaign through AI to load a save.
Preserve all existing owner/auth/campaign isolation.
Every save/timeline is campaign-scoped and owner-authorized.
DM-private snapshots remain server-only.
Seed synthetic private canaries and verify absence from:
-  normal API responses;
-  browser payloads;
-  save cards;
-  public timeline names/details;
-  errors;
-  production client bundles.
This milestone does NOT authorize:
-  Phase 4 FRAME;
-  VIDEO;
-  World Engine;
-  world simulation;
-  book/world imports;
-  alternate-history automatic simulation;
-  branch-merging AI;
-  multiplayer;
-  cloud deployment;
-  real James & Jinn import.
Timeline Fork is infrastructure for future experimentation, not authorization to implement the World Engine now.
After implementation:
-  typecheck;
-  lint;
-  full automated tests;
-  production build;
-  real local Supabase integration;
-  privacy/security checks;
-  browser desktop/mobile checks;
-  Phase 3 memory regression suite;
-  branch/retrieval isolation evaluation.
Update DEV_STATUS.md with actual results and limitations.
Do not claim that Save/Load protects against every future bug.
When all Phase 3.5 requirements are satisfied, commit and push, then stop at:
PHASE 3.5 READY FOR OWNER ACCEPTANCE
Do not mark it owner-approved.
Do not begin Phase 4.
Do not import the real campaign.
