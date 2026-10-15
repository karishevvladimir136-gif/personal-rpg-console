# Spatial Runtime / EXPLORE — final Phase 3.8 architecture

**Current status: ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS.** The [production-safe Phase 3.8B final record](PHASE38B_ARCHITECTURE_FREEZE.md) references the exact historical freeze and evidence. [Phase 3.75 final decision](PHASE375_ARCHITECTURE_DECISION.md) remains fixed. [Provider research](PHASE38_PROVIDER_CAPABILITIES.md) and the [original 3.8B proposal](PHASE38B_LIVE_PROTOCOL.md) are historical; neither authorizes another experiment. The authority and privacy design below is preserved; implementation remains pending.

EXPLORE is part of v1, optional and progressive. Natural language remains the primary interface. Text is permanently first-class and spatial-independent; 2D Live is the primary planned visual gameplay layer over the same state and remains visual-style agnostic. Production EXPLORE is asset-first **after Phase 4 FRAME / Visual Bible**. Marble is the intended initial EXPLORE provider unless implementation reveals a concrete blocker. World Engine, Rulesets, DM, Memory, Saves/Timelines and progression never depend on a spatial provider or object generation. No implementation starts in this integration task.

## Inspected foundation and reuse

Design is based on production main cb7f6be2fb513de13604d381046a3240f3261383, not the experimental dependency tree:

| Accepted seam | Spatial design use, not an implemented extension |
| --- | --- |
| [DmProvider / TurnStore](src/lib/gameplay/server-contracts.ts), [direct structured requester](src/lib/server/dm/provider.ts) | Normal DM/mechanics validation and authoritative commit remain unchanged; spatial providers never receive a state-writing tool |
| [Memory provider](src/lib/server/memory/provider.ts), [Memory timeline membership](src/lib/memory/timeline.ts) | Use authorized source versions and branch membership; generated geometry is not factual Memory or retrieval evidence |
| [Save contracts](src/lib/saves/contracts.ts), [save validation](src/lib/saves/validation.ts), [SaveStore](src/lib/saves/server-contracts.ts) | Reuse timeline IDs, activation epoch, expected revisions, operation IDs and immutable history; never build a second spatial rollback engine |
| [World Library / Packs](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md) and future FRAME / Visual Bible | Reuse approved source/visual associations and existing Supabase Storage; do not invent another canon or reference registry |

Future implementation uses the existing Next.js server, Supabase Postgres/Auth/Storage, a small adapter registry and durable bounded job records where generation outlives a request. No microservices, Kubernetes, extra orchestration service, custom 3D backend, game-engine server or second authoritative store. Browser rendering libraries, if needed, get a separate measured selection; none is added now. Single-user scope does not remove owner/campaign authorization.

## Authority, interactions and privacy

Spatial output is an **untrusted versioned projection of a canonical Location**. It cannot directly change inventory, canon, quests, entity position, NPC existence/life, relationships, authoritative time, discoveries, saves or timelines; it cannot disclose DM-private facts. A visually generated chest does not create an RPG chest. A model animation of death does not kill an NPC. Locally moving the camera is presentation only and never elapsed game time, travel or discovery.

Flow: player intent in EXPLORE → typed interaction → authorized current entity/location/binding lookup → ordinary rules/DM/check lifecycle → validated authoritative commit → refreshed public projection. A check uses the existing recorded server dice; spatial physics/video never substitutes a result. Unsupported interactions return to normal text intent; no silent new mechanics.

The server builds input from **player-visible/discovered information only**, including approved appearance references at the current source/branch version. Do not load a whole private world and conceal it in the browser. Exclude secret rooms, unrevealed enemies, hidden identities, undiscovered props, future transformations and private plans from prompts, assets, manifests, URLs, bindings, counts and geometry. Visibility is knowledge in the active campaign/timeline, not simply owner authentication.

Input filtering alone cannot prevent a model inventing hidden-looking geometry. Outputs remain quarantined until reviewed against the allowed location envelope. Unbound decorative output is labelled noncanonical and cannot be inspected as a discovery. If the renderer cannot reliably exclude an unseen region, embedded secret, misleading door or stale removed item, withhold that artifact or restrict to an approved safe view. Camera bounds are useful only if the complete browser-delivered asset contains no protected geometry. Do not send unsafe geometry and rely on an overlay or occlusion. No automatic classifier or model reviewer is introduced for this gate.

Future server-private generation would require separate provider/privacy/data authorization, separate assets/access paths and proof that no hidden geometry can reach public delivery. It is outside v1's proposed initial scope and entirely outside 3.8A/B. No real/private/source-library input is authorized by a successful synthetic test.

## Small provider capability contract — conceptual only

Capabilities are optional and advertised with supported input/output kinds and constraints, not a universal format:

- createWorld / reconstructWorld / extendWorld;
- hostedWorld / exportedSplat / exportedMeshScene / panorama;
- realtimeWorldStream;
- generateObject / decomposeParts / articulation / topology / pbr.

A descriptor records adapter/version, explicit model IDs, endpoint/host allowlist, formats, size/scale conventions, authentication mode, supported polling/cancel/idempotency, retention/export limits and evidence verification date. Unsupported capability means unavailable; never silently substitute another model, a panorama for a mesh, or a video for persistent geometry. Do not force a non-articulated GLB or splat into an object-joint ontology.

Conceptual server calls:

- capabilities(profile) → descriptor, without a paid connection probe;
- submit(capability, authorizedProjection, pinnedProfile, operationId) → jobReceipt;
- readJob(receipt) → pending / succeeded(untrustedAssets) / failed / unknown;
- openPresentation(approvedArtifactVersion) → safe viewer descriptor;
- optional extend/reconstruct/export/cancel operations, separately budgeted when chargeable;
- future openStream / sendPresentationControl / closeStream, only for an explicitly supported streaming profile.

Receipts normalize request/job/world IDs, status and reported usage/cost without copying provider payloads into public DTOs. Actual model is nullable provenance, not the requested name echoed back. Provider-specific details live in a bounded versioned adapter namespace. Adapters have no database mutation capability. A server coordinator owns authorization, source fencing, artifact persistence and approval. No API route or TypeScript contract is implemented in this pass.

A realtime stream has an ephemeral presentation session, input/camera sequence and bounded duration/spend. Resuming a video generator is not loading a save. A provider lacking reproducible persistent state may offer temporary visualization only. Its movement/object effects never become committed RPG actions. A future browser session token, when essential, must be short-lived and limited to the approved model/session; a master provider key stays server-side. Unknown provider session limits block integration rather than widening access.

## Artifact and binding records — proposed minimum metadata

| Concept | Required logical fields |
| --- | --- |
| SpatialArtifactVersion | App UUID, schema version, owner_id, campaign_id, authoritative location_id; immutable artifact version/parent; creation time; job status and separate review/publication status |
| Source fence | timeline_id, activation epoch at submission, expected location/state revision, scene/session reference when relevant; exact document/location/Visual Bible/reference versions; public projection and knowledge-scope hashes |
| Execution provenance | provider/adapter version, requested model, actual model nullable with evidence basis, pinned non-secret generation config/prompt/contract versions, seed if supported, synthetic/source attribution, operation/attempt ID; provider world/job IDs nullable |
| Assets | Discriminated kind (hosted world, splat, mesh scene, panorama, object, parts, articulation, stream recording); MIME/format, byte hash/size, private Storage association or authorized external locator/expiry, units/axis/scale transform, optional collider/material/part references |
| Safety and accounting | Player-discovered scope plus allowed regions/entity IDs, review record/version; reported cost/currency or unknown, reservation, usage where meaningful; sanitized failure/provenance and retention/license policy references |
| SpatialBindingVersion | App UUID, owner/campaign/location/timeline scope; authoritative entity_id; exact artifact version; provider-local object/part/anchor or point/region plus transform; allowed intent labels; mapping provenance and verified / needs-rebind / disabled state |

Provider world IDs never become Location primary keys. Coordinates are presentation metadata with declared scale, not authoritative geography. Stable entity identity survives asset regeneration, provider changes and rebinding. Uncertain matches require review; no nearest-object heuristic silently transfers a weapon binding to another prop. Multipart assets can bind a lid anchor to the existing chest; generated parts do not become new inventory entities.

Operation/job status transitions can change; successfully recorded artifact versions and approved binding versions remain immutable. Record approval/rejection/new versions rather than overwriting old blobs. Asset retention honors save references; deletion of a provider world cannot delete canon. Keep signed URLs and provider payloads out of permanent public metadata; store safe references and reauthorize delivery. No secrets in configurations, save exports, logs or client state.

Typed interaction envelope: schemaVersion, unique operationId, campaignId, timelineId/epoch, expected authoritative revision, locationId, artifactVersionId, bindingVersionId, authoritative entityId, bounded intent (inspect/open/take/use/talk/travel as the current ruleset supports), optional natural-language text. The client claim is untrusted. Server resolves binding/visibility and current entity state, checks range/eligibility when the ruleset supports it, rejects stale/deleted/wrong-campaign targets, and routes to normal gameplay. It accepts neither a client-supplied outcome nor an arbitrary state patch. Inspect remains knowledge-filtered.

## Jobs, failure independence and version behavior

Reserve approved work durably before submission; persist unique operation and provider receipt. Serialize any explicitly bounded evaluation. A timeout after submission is an unknown outcome, not permission to resubmit. Resume read-only polling only within the approved bounds. Unsupported provider idempotency is stated; local duplicate protection cannot prove exactly-once remote billing. There is no silent retry, fallback or unbounded background regeneration. A completed stale job may be retained as an unselected historical artifact, but cannot activate on a new timeline or newer location revision.

Text, normal DM, Saves, FRAME, VIDEO and campaign load never await an EXPLORE provider. On unavailable provider/asset/binding: show a concise status and return to text/approved image; disable affected spatial actions. Preserve the last approved artifact as history without pretending it depicts current state. A missing spatial asset never makes a valid save unloadable.

| Change / return case | Required behavior |
| --- | --- |
| Return to same known Location | Reuse an approved immutable version only if source/knowledge/state membership still matches. Reopen provider world or permitted locally retained assets; do not regenerate on navigation |
| Inventory changed / weapon taken | Current authoritative owner/location wins. Disable the old binding immediately. Remove a separable presentation object if supported; otherwise withhold or replace the stale view. Never recreate the item from baked geometry |
| Door opened or destroyed | Reflect committed status using a supported component/overlay only when misleading geometry is excluded; otherwise request later explicit regeneration. No fabricated passage or new discovery |
| Location canon corrected | Pin new source versions; mark affected projections stale. Ordinary campaign-wide corrections outside rollback retain authority. Do not restore an invalidated visual as current after loading an old save |
| New wing discovered | Only the committed discovery permits new input/geometry. Extend if the adapter genuinely supports it; otherwise make a new version. Earlier saves retain their own allowed scope |
| Regenerate geometry | Create a new artifact version; prior bindings require verification/rebinding. Do not change authoritative object IDs or rewrite scenes/events |
| Change provider | New explicit profile, artifact and bindings; preserve old provenance. No provider-ID migration of Location ontology, automatic conversion or fallback |
| Load / fork / switch timeline | Reuse existing save membership and epoch fencing. Select only artifacts/bindings valid for that branch's source and knowledge state. Never expose the abandoned future's discoveries |

A future save extension stores selected artifact/binding version references, not remote mutable world state as truth. Accepted manifests have versioned fixed-family validation: introduce compatible readers/new schema only in the authorized implementation, preserving old saves. Old saves with no spatial reference load normally and may later request an optional projection. Immutable assets can be shared physically by hash, but branch access/membership and binding selection stay scoped. No provider call, rerender or dice replay is required by load. No new timeline system and no edits to Phase 3/3.5 contracts now.

## Accepted capability findings and binding limits

The [final evidence record](PHASE38B_ARCHITECTURE_FREEZE.md) distinguishes measured structure from quality. Marble room/courtyard are sufficient for the architecture decision only, not production rendering, visual quality, navigation, canonical metric correctness or production EXPLORE readiness. Fal-world is `STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE`; adapters/renderers must support observed PLY or a validated offline conversion path, never DRC exclusively. Requested DRC was absent; visual/navigation remain unverified and no retry is planned.

Chest POST was accepted into the queue; the first poll stopped locally. Completion/charge are UNKNOWN; no GLB was retrieved; object/PBR/articulation are UNVERIFIED. Lid `STRUCTURE_UNVERIFIED` means a separate lid is not proven. This is not a provider-generation failure finding, and no recovery is planned. Missing/fused parts must not become a production architecture dependency.

Interaction Bindings are the Spatial Bindings described above, not a second subsystem. They connect structurally verified addressable provider nodes/parts/anchors to stable canonical entities/actions. Provider IDs are never canonical IDs. Names, colors or model descriptions do not prove an independently addressable lid; unsupported interactions remain available through the normal text/rules/DM authority path.

## Offline acceptance plan — specified, not executed runtime tests

Use two unrelated synthetic campaigns and two branches each. These are fixture descriptions only; no database records are created here.

| Case | Expected assertion in future deterministic tests |
| --- | --- |
| Duplicate interaction / uncertain request | Existing operation result or safe pending state; no second item transfer, check or paid generation |
| Wrong owner/campaign/entity/binding | Rejected before provider or state mutation; sanitized error exposes no hidden target |
| Secret-room marker in source | Absent from provider input, public metadata, every browser asset and binding; incomplete review withholds output |
| Unbound generated chest / simulated death | No entity, canon, inventory, HP, relationship or time change |
| Take then return / open then save-load | State and branch membership win; no duplicate item, false closed door or future-area leak |
| Regeneration / provider switch | New versions and explicit rebinding; same authoritative IDs; old observations remain intact |
| Late callback after load/correction | Fails source/epoch activation fence; cannot select abandoned geometry |
| Outage / expired asset / unsupported format | Text/DM/save/load/FRAME/VIDEO continue; spatial UI reports limitation |
| Realtime action stream | Camera motion has zero authoritative effects; typed game action uses standard commit path |
| License / retained blob / external URL | Approved storage/expiry handling; arbitrary URLs, embedded scripts and unsafe archive paths rejected |

Future browser gates include English/Russian labels, keyboard/touch controls, reduced motion, bounded asset sizes/LOD, desktop/mobile load and memory measurements, visible return to text and stable binding targets. Physical iPhone/Safari must be tested separately; no browser or hardware claim is made now. No generic 3D dashboard redesign.

## Roadmap and review boundary

Phase 3.8A research and Phase 3.8B capability evidence are closed. The four submissions permanently consumed $4.75 / $4.75 in reservations ($0 remaining); known reported billing is $2.528 and both fal charges remain UNKNOWN. No additional 3.8B experiment, fifth generation, chest recovery or fal retry is planned. A future provider issue is a bounded implementation blocker investigation, not continuation of this bake-off. Phase 4 FRAME / Visual Bible remains separately scoped; EXPLORE implementation follows its canonical asset foundation. Realtime streams, articulation/physics and private spatial generation need later independent gates.

Owner Diagnostics / System Inspector remains late-stage: owner-readable sanitized provider/job/provenance/failure information, never keys, chain-of-thought or a spoiler/private-state browser. AutoEval / autoresearch remains future bounded owner-authorized experiments with frozen inputs, budgets and review; never autonomous production self-modification, automatic adoption or continuous paid probing.

**Broad product research/design is closed** unless implementation reveals a genuine architectural blocker. Viewer/export integration, source-safe rendering limits, artifact lifecycle/storage limits, supported formats and interaction coverage are bounded implementation decisions under the approved architecture. Source-of-truth integration is owner-approved. The next phase is the Production Multi-Agent Coding Sprint with lead-owned shared contracts first, in a fresh project task. This finalization starts no production coding and requires no keys/setup, provider calls, deployment or real data.
