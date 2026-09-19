# World Library and World Packs — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** Builds on accepted implementation `8099e0cca1463f767476190c456d4f3947e7c84e` and acceptance `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. No sources, real characters, private material or assets are imported in this pass.

## Product and scope

`World Library → World Pack → Scenario Composition → Divergence / What If → Enter This World → Ruleset → RPG`

World Library is the owner's reusable source workspace. The existing campaign Library remains the place for a campaign's documents and versions. A World Pack is a versioned structured index over preserved sources, not a summary replacing them and not a running campaign. Campaigns instantiate approved versions into their own isolated continuity. The owner can also describe a world from scratch in natural language; approved invented premises become authored assumptions, never falsely labelled quotations or historical facts.

Future sources include TXT, Markdown, PDF, EPUB, DOCX, notes and reference files, plus uploaded images. Maps and other structured assets can follow without changing provenance fundamentals. Parsing support must be verified format by format; scanned PDFs need an explicit OCR capability or a clear unsupported/incomplete warning, not invented text. No paid extraction service, unrestricted scraping, generated artwork or real-data import is authorized here.

Natural language is the primary interface: “Build a detailed world from these books; treat these two as primary canon.” The app proposes a short source-priority and coverage plan, asks only about consequential ambiguities, and exposes evidence for review. It must not require the owner to edit a graph, JSON or database rows.

## Reuse and the necessary scope extension

The accepted system already has immutable document versions, stable campaign/entity/source IDs, source references, public/private Memory records, correction invalidation and exact save membership. Reuse their versioning, authorization and source-validation patterns. Do not create a second summarizer, vector service, correction authority or timeline engine.

Existing campaign document and Memory APIs are campaign-scoped. They cannot be reused unchanged as a shared owner library. Future World Library sources/packs are **owner-scoped**, with immutable versions and explicit campaign bindings; every instantiated campaign entity, fact, event, memory derivative and operation still carries `campaign_id`. Never invent a fake campaign just to represent a reusable book. A library access check alone grants no access to campaign DM-private records. Campaign A's emergent relationships or secrets never update its source pack or Campaign B automatically.

A campaign pins a World Pack version and a source-to-campaign identity map. Within one campaign's timeline family, preserve entity identity across forks. A separate campaign receives its own entity IDs with immutable origin references, so a reusable literary person can have independent histories. Existing `SourceRef` kinds need a deliberate versioned extension or authorized adapter for pack sources; no unrecognized reference is accepted as if the current union already supported it.

## Logical records, not a proposed SQL schema

| Record | Essential information |
| --- | --- |
| Source version | Owner/source/version IDs, preserved original binary/text, content digest, format, attribution, extraction version/status, declared access scope |
| Source location | Exact source version plus page/paragraph/section, EPUB spine/location, text span or image region as applicable; stable locator and excerpt digest |
| World Pack version | Pack/version IDs, approved source-priority policy, member source versions, entity/fact/relationship/history index, conflicts, coverage/unknowns, compilation provenance |
| Source entity | Stable pack-local identity, aliases, type/capabilities and referenced claims; no compulsory class, HP or tabletop statistics |
| Fact / relationship | Subject/predicate/object, origin classification, evidence, uncertainty, valid-world-time interval, epistemic/access labels and supersession links |
| Campaign binding | Campaign/pack/version IDs, approved scenario and continuity anchor, source-to-instance identity map, permitted source scope |
| Visual reference | Asset/version/digest, owner provenance, approval and appearance variant, entity/location/object association, temporal and visibility applicability |

Pack content can cover characters, factions, institutions, locations, species, cultures, objects, relationships, religions, magic, technology, social norms, geography and history. An incomplete domain is marked incomplete. These are extensible domain facts, not a mandatory empty table for every possible subject. Stable IDs plus typed links suffice; no graph database is required.

Original records are retained. A new extraction or correction creates a new source/pack version and dependency links; it does not overwrite the source or rewrite an existing campaign. Adopting a changed pack in a campaign is an explicit validated update. Existing campaign-wide corrections remain authoritative within their declared scope and invalidate affected derivatives through accepted Memory machinery. Updating a source pack alone is not permission to propagate a retcon across all campaigns.

## Canon Compiler

Use resumable bounded jobs and [Model Runtime](MODEL_RUNTIME_BRIEF.md), within the existing Next.js/Postgres application. A logical pipeline is:

1. Preserve originals; extract structure, source locators and coverage. Treat uploaded instructions as source data, never executable system policy.
2. Index bounded passages and identify candidate entities/aliases; retain ambiguity rather than merging similar names blindly.
3. Extract relationships, events and time ordering with evidence and confidence/unknowns.
4. Extract world rules, geography, capabilities and social institutions; distinguish general rules from unreliable character claims.
5. Audit contradictions, source priorities, temporal/knowledge consistency and missing coverage.
6. Associate owner-approved visual assets, review the proposed pack and freeze an approved version.

Each pass has input/version digests, stable operation IDs, checkpoints, bounded context and idempotent outputs. Retry reuses completed valid work; source changes invalidate dependent work. No whole-book prompt or endless automatic fan-out. “Most detailed” means preserving fine-grained recoverable evidence with a visible coverage report, not a guarantee of exhaustive or perfect extraction. Report unreadable/omitted sections, unresolved entities, conflicting facts and unprocessed assets. Publication as an approved reusable pack waits for the owner's review of material uncertainties.

The optional [Decision Model capability](MODEL_RUNTIME_BRIEF.md#optional-decision-model-capability--design-only) may later classify/rank authorized source passages or retrieval candidates after deterministic scope/visibility/version filtering. It cannot decide canon, erase source coverage, resolve contradictions or replace the Canon Compiler's deep reasoning. Retain uncertain passages and mandatory evidence; a classifier failure bypasses optimization, not access controls. Originals remain available regardless of routing labels. Any external proxy evaluation requires separate explicit approval; no source/private library is sent to `classifier.dev` by this proposal. The [final Phase 3.75 owner decision](PHASE375_ARCHITECTURE_DECISION.md) closes Jev evaluation with DO NOT ADOPT for this role. No benchmark continuation is scheduled; the extension remains conceptual, and any future different candidate requires fresh explicit evaluation/adoption authorization.

## Four origins of a fact

| Origin | Authority and evidence |
| --- | --- |
| Source Fact | Explicit source statement with exact version/location; a narrator's or speaker's assertion is still labelled as such |
| Source Inference | Derived claim with supporting references and a concise justification/uncertainty; not promoted to an explicit source fact |
| Scenario Assumption | Owner-approved authored premise or necessary adaptation/divergence, scoped to that version of the scenario |
| Simulation Fact | Validated committed event/state in one simulated or playable timeline, linked to its causal operation and checkpoint |

Origin classification is orthogonal to existing Memory statement kinds such as fact, rumor, lie, hypothesis and intention. Preserve both: a quotation can be a source fact about what someone said without proving the quoted rumor true. Never persist model chain-of-thought as evidence. Source priority is an explicit owner policy, not a universal “last upload wins” rule. Store unresolved contradictions side by side; block only operations needing a definite answer and ask a focused clarification. Lower-priority variants remain attributable, not silently erased.

## Continuity anchor and existing canon characters

Campaign creation offers **Original Character** and **Existing Canon Character**. An entry anchor may be a date, age, chapter, named event or selected source point. Chapter order alone is not chronological time: flashbacks and later revelations require temporal mapping. Ambiguous age/date combinations produce an explicit proposed anchor for approval.

Create an evidence-backed Character Snapshot at the anchor: stable identity, location, capabilities, possessions, personality, relationships, known facts and relevant world state. Missing details remain unknown or become explicitly approved supplements. Ruleset conversion creates future mechanical components without pretending that source material contained those numbers. Preserve one identity when an existing instantiated NPC becomes player-controlled; branch-local control replaces autonomous action for that entity. See [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md).

Keep four separate views:

| View | Use |
| --- | --- |
| Source Knowledge | What the complete uploaded corpus states; available only to authorized authoring/compilation tasks |
| Canon at Entry | Facts already true at the selected world time; includes server-private historical truth where permitted |
| Character Knowledge at Entry | Positive, evidenced subset this character could know; not everything the owner or compiler knows |
| Future Source Events | Later source outcomes retained as source material, excluded from current reality and ordinary actor/DM planning unless explicitly approved as a scenario constraint |

A later revelation about an earlier event can establish past truth without granting the earlier character knowledge. A later death is not already true at an earlier anchor. **Canon before entry is history; after entry, play may diverge. Source fidelity applies to established facts, not predetermined future outcomes.** Character personality informs context and NPC expectations but never forces the owner's actions. If the owner explicitly wants a future constraint, record it in the Scenario Contract and surface conflicts with agency; it cannot command the PC to reenact a plot.

Apply these filters before retrieval ranking/limits and provider context assembly using accepted Memory boundaries. A model may know a famous story from training; instructions and tests reduce contamination but cannot prove it forgets its training. Do not advertise a perfect knowledge-erasure guarantee. Preserve that limitation in future evaluations.

## Scenario Composition

Natural-language requests combine setting, cast, relationships, history, starting situation, world rules, tone/adaptation and divergence. The resulting immutable **Scenario Contract** pins ingredient versions, source priorities, identity mappings, continuity anchor, adaptation mode, assumptions, unresolved conflicts and visibility policy. Minimal contract validation is required before Lab runs; the complete composition/takeover UI can arrive later.

Distinguish **literal crossover** (characters arrive from another world with explicitly carried memories/possessions) from **native adaptation** (characters have a coherent local history). “Romeo and Juliet native to Middle-earth” needs approved local relationships/history, not an unexplained portal or imported future plot. Preserve ingredient provenance and adapted/inferred labels. Resolve name collisions and incompatible cosmologies explicitly. Do not silently merge distinct people, transfer future knowledge or change the scenario mid-run. A changed premise creates a new version and a new fork.

## Visual identity and later media

Use owner-provided or owner-approved portraits, TV stills, costume/location/object references and heraldry. For example, approved Daenerys adaptation images may define that owner's selected appearance variant. Associate assets with stable source entities and campaign instances through versioned bindings. Record attribution/source when known, owner approval, variant priority, valid appearance period and source digest. An image does not automatically establish personality, allegiance or historical facts.

Initial proposal: manual association and approval; future suggestions remain unapproved candidates. Resolve conflicting book/adaptation appearances explicitly. A future injury, costume transformation or unrevealed location must not appear in an earlier player-visible reference. Store originals in the existing private Storage architecture with authorized access; public UI receives only an approved, visibility-filtered asset projection. No public permanent asset URLs for private references.

The existing Visual Bible and future FRAME/VIDEO consumers use these same associations; do not create a competing asset registry. Later media prompts can use the selected approved text and image references with model capability checks. No image generation, video generation, model-based image analysis or scraping is implemented or called in this pass. Image association support can precede those media phases.

## Future acceptance gates — not executed here

- Each supported format preserves originals and accurate source-version locators; malformed/scanned/partial input reports gaps. Retries do not duplicate entities or quietly overwrite approved packs.
- Two unrelated packs and two campaigns instantiated from one pack remain isolated; changed pack versions and campaign corrections require their explicit scopes. Source instructions cannot override runtime policy.
- Contradictory sources, uncertain aliases, inferences and owner assumptions remain distinguishable and reviewable.
- Earlier canon entry reconstructs correct identity/possessions/relationships with no future-outcome or character-knowledge leak; timeline forks preserve that cutoff.
- Original/scratch worlds, literal crossovers and native adaptations produce coherent approved contracts without claiming invented facts are sourced.
- Character takeover preserves identity and disables autonomous decisions for the PC without erasing NPC history or forcing source plot.
- Approved entity/location/object visual references retain provenance, variant and time/visibility restrictions through pack binding and save/fork. Unapproved/private future imagery is excluded from ordinary responses.
- Updating source evidence invalidates affected derived Memory using the existing authority system; summaries never become the only surviving source.

Owner decisions: imported-world default ruleset, source-continuation strictness, and whether visual association starts manual-only. Proposed defaults: World Logic where no tabletop system is requested, emergent future after the anchor, manual visual approval first.
