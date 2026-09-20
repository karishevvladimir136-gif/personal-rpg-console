# Source-of-truth integration candidate

> **Historical integration-review artifact at `7d945d3754647015ecdd765cef2b688dbab38777`, now owner-approved.** The candidate/main-approval wording below describes that earlier review checkpoint. The substantive diff, coverage and verification record is preserved.

## Exact sources and integration boundary

| Source | Exact checkpoint |
| --- | --- |
| Production main base | cb7f6be2fb513de13604d381046a3240f3261383 |
| Complete owner-approved roadmap: chatgpt/poi-2d-roadmap | a3d0fa66da42f36a5401c3513e3484e83150f9d3 |
| Historical Phase 3.8B freeze: codex/phase38-final-freeze | 3c99552a66d9b4b270b3a7a8552c709cf9faf73e |
| Historical freeze identity | phase38b-final-architecture-evidence-freeze-1 |
| Historical canonical payload SHA-256 | eef894c15e27bc167cf3bbcbaaf99dd51ec640f545b1a16cd1b2e539da239119 |

Candidate branch: **codex/source-of-truth-integration**. It was created from exact main, then fast-forwarded through the complete roadmap history before targeted reconciliation. The commit containing this review is the candidate; its exact SHA is reported to the owner after commit creation. Neither the original local main checkout nor GitHub main is advanced by this task. Main requires review of the candidate/checks and explicit owner approval.

Source priority: MASTER_SPEC → DEVELOPMENT_PLAN → AGENTS → repository → DEV_STATUS. The [production-safe final architecture record](PHASE38B_ARCHITECTURE_FREEZE.md) preserves accepted decisions with immutable evidence URLs. Its bytes are not the historical canonical freeze and do not inherit that hash.

## Reconciliation decisions

| Overlap / area | Resolution |
| --- | --- |
| MASTER_SPEC and DEVELOPMENT_PLAN | Retain the complete roadmap requirements, progression/DM Craft/web/magic additions and future phase sequencing; update current scope and Phase 3.8 closure; add only the requested coding-team handoff |
| MODEL_RUNTIME_BRIEF, WORLD_ENGINE_BRIEF, WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF | Keep the newer approved roadmap versions unchanged, preserving requirements absent from the older experiment branch |
| PHASE38_SPATIAL_RUNTIME | Retain the authority/privacy/provider/binding design and future acceptance plan; apply measured format findings, closure, permanent Text independence and implementation boundaries |
| DEV_STATUS | Add current integration verification and boundaries; retain the complete roadmap status body under an explicit historical label |
| PHASE38B_LIVE_PROTOCOL and PHASE38_PROVIDER_CAPABILITIES | Preserve dated historical bodies; add clear supersession notices so earlier proposal/untested statements cannot be mistaken for current status |
| START_HERE | Direct the owner to this candidate review instead of the old proposed spatial test |
| PHASE375_ARCHITECTURE_DECISION and WORLD_LAB_WHAT_IF_BRIEF | Identical across the two source heads; retain the roadmap copies unchanged |
| PHASE38B_ARCHITECTURE_FREEZE | Select only production-safe decisions, final accounting and exact historical Git references; replace local experiment links and supersede the old missing-roadmap-object limitation |

There was no wholesale selection of the freeze's overlapping documents and no merge of its experiment branch. Old STOPPED records keep their original meaning. Unknown billing/model/capability fields remain unknown, not fabricated. All changes from production main are Markdown documentation.

## Owner-approved requirement coverage

| Requirement | Preserved source |
| --- | --- |
| World Engine; Actors / Threads / Events / Hooks; bounded world progression | [World Engine](WORLD_ENGINE_BRIEF.md), MASTER_SPEC §44, DEVELOPMENT_PLAN 3.75C |
| Factions / settlements; persistent consequences; delegation | [World Engine](WORLD_ENGINE_BRIEF.md), [POV / World Leverage](POV_AND_WORLD_LEVERAGE.md), [RPG doctrine](RPG_DESIGN_DOCTRINE.md) |
| POV / World Leverage; rumors / epistemic state; optional fair deadline pressure | [POV / World Leverage](POV_AND_WORLD_LEVERAGE.md), [World Engine](WORLD_ENGINE_BRIEF.md), [RPG doctrine](RPG_DESIGN_DOCTRINE.md) |
| World Library / World Packs; Canon Compiler | [Library / Packs](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md), MASTER_SPEC §7/44, DEVELOPMENT_PLAN 3.75B |
| Bounded Research from Web; Upload / Research / Describe / Combine | [Source ingestion](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md#research-from-web--agentic-source-acquisition), MASTER_SPEC §7, DEVELOPMENT_PLAN 3.75B |
| Rulesets / Dynamic UI; D&D not universal | [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md), MASTER_SPEC §44, DEVELOPMENT_PLAN 3.75A |
| Progression; rewards; challenge scaling; companion progression | [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md), [World Engine](WORLD_ENGINE_BRIEF.md), MASTER_SPEC §9/14, DEVELOPMENT_PLAN A2/C |
| DM Craft; Campaign DM Style; progressive implementation order | [RPG doctrine](RPG_DESIGN_DOCTRINE.md), [Model Runtime](MODEL_RUNTIME_BRIEF.md), MASTER_SPEC §25/40, DEVELOPMENT_PLAN progressive DM Craft slices |
| Spellbook / spellcasting; World Magic Rules | MASTER_SPEC §9, [Rulesets](RULESETS_AND_DYNAMIC_UI_BRIEF.md#world-magic-rules-and-spellcasting-profiles) |
| Semantic physical causality | [World Engine](WORLD_ENGINE_BRIEF.md#semantic-physical-causality-and-selective-simulation), MASTER_SPEC §44 |
| Text / 2D Live / EXPLORE; style-agnostic presentation; travel / POIs / marker preferences | MASTER_SPEC §45/46, [2D direction](2D_RENDERING_DIRECTION.md), [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md), DEVELOPMENT_PLAN post-Phase-4 slices |
| Interaction Bindings; stable canonical identity; artifact projection authority | MASTER_SPEC §45/46, [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md), [final architecture record](PHASE38B_ARCHITECTURE_FREEZE.md) |
| Provider-neutral Model Runtime; nontechnical onboarding; optional Decision Model only | [Model Runtime](MODEL_RUNTIME_BRIEF.md), [Phase 3.75 decision](PHASE375_ARCHITECTURE_DECISION.md) |
| World Lab / What If; parallel realities; Enter This World | [World Lab](WORLD_LAB_WHAT_IF_BRIEF.md), MASTER_SPEC §44, DEVELOPMENT_PLAN 3.75D/E |
| Reuse accepted Memory / Saves / Timelines; no parallel authority | [World Engine](WORLD_ENGINE_BRIEF.md), [Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md), MASTER_SPEC §38/42/43/44 |

The coverage map is not a replacement specification. The complete approved roadmap documents remain present. No product requirement is rescoped or newly implemented by this integration.

## Final Phase 3.8 decision

**ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS.** Authoritative state is truth; generated artifacts are projections. Marble room/courtyard evidence is architecture-only. Fal-world is accepted as STRUCTURALLY_USABLE_PLY_WORLD_CANDIDATE; support PLY or validated offline conversion, not DRC exclusively. Chest completion/charge remain UNKNOWN; object/PBR/articulation remain unverified; no GLB, no proven separate lid. No chest recovery or fal retry.

Four historical generation submissions permanently reserve **$4.75 / $4.75**, with **$0 remaining**. Known reported billing is **$2.528**; fal-world and chest charges remain UNKNOWN. No refund/reuse, replenishment, fifth generation or additional 3.8B experiment. Future provider problems are bounded implementation blockers, not a reopened bake-off.

Text remains permanently first-class and spatial-independent. 2D Live is the planned primary visual gameplay layer; EXPLORE is optional/progressive after Phase 4 Visual Bible / canonical assets. World Engine, Rulesets, DM, Memory, Saves/Timelines and progression do not depend on spatial providers or successful object generation.

## Changed files relative to exact main

- [2D_RENDERING_DIRECTION.md](2D_RENDERING_DIRECTION.md)
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)
- [DEV_STATUS.md](DEV_STATUS.md)
- [MASTER_SPEC.md](MASTER_SPEC.md)
- [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md)
- [PHASE375_ARCHITECTURE_DECISION.md](PHASE375_ARCHITECTURE_DECISION.md)
- [PHASE38B_ARCHITECTURE_FREEZE.md](PHASE38B_ARCHITECTURE_FREEZE.md)
- [PHASE38B_LIVE_PROTOCOL.md](PHASE38B_LIVE_PROTOCOL.md)
- [PHASE38_PROVIDER_CAPABILITIES.md](PHASE38_PROVIDER_CAPABILITIES.md)
- [PHASE38_SPATIAL_RUNTIME.md](PHASE38_SPATIAL_RUNTIME.md)
- [POV_AND_WORLD_LEVERAGE.md](POV_AND_WORLD_LEVERAGE.md)
- [RPG_DESIGN_DOCTRINE.md](RPG_DESIGN_DOCTRINE.md)
- [RULESETS_AND_DYNAMIC_UI_BRIEF.md](RULESETS_AND_DYNAMIC_UI_BRIEF.md)
- [SOURCE_OF_TRUTH_INTEGRATION.md](SOURCE_OF_TRUTH_INTEGRATION.md)
- [START_HERE.md](START_HERE.md)
- [SYSTEMIC_WORLD_REFERENCES.md](SYSTEMIC_WORLD_REFERENCES.md)
- [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md)
- [WORLD_LAB_WHAT_IF_BRIEF.md](WORLD_LAB_WHAT_IF_BRIEF.md)
- [WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md)

The reconciliation commit itself changes seven roadmap documents and adds the final architecture record and this review; the remaining changes arrive through the full roadmap history.

## Intentionally excluded and protected

- The entire experiment-only tree `experiments/phase38-spatial/**`: harnesses, CLIs, ledgers, witnesses, recovery runners, polling code, experiment tests/parsers, result files, binary metadata and `final-freeze.json` remain only in historical Git checkpoints.
- Production code, migrations, runtime, gameplay UI, dependencies/lockfile, configuration, tests, fixtures and campaign data are unchanged from exact main. AGENTS.md is unchanged; its stack preferences do not override the higher-priority owner-approved provider-neutral specification.
- The original checkout's pre-existing uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md, local main and all execution/evidence checkouts remain untouched. No evidence, source or ledger file is rewritten.

## Verification

**PASS: 23 local documentation/integration assertions.** Verified exact source commits and ancestry; recomputed the historical canonical freeze hash; checked preservation of roadmap requirements and accepted capability/authority/accounting decisions; confirmed the entire experiment tree is absent. All **240 non-Markdown Git objects** match production main. Ten complete roadmap briefs are unchanged; MASTER_SPEC sections 1–44, the content of section 46, plan milestones 0–3.5/A–E and 4+ sequencing, prior DEV_STATUS history, and historical proposal/research bodies are preserved.

Checked **33 Markdown documents / 301 links**, including **8 immutable evidence links** whose commit/path targets exist in local Git. No broken local links/anchors or pre-existing unrelated documentation failures were found. Strict UTF-8, conflict-marker, fenced-block and Git whitespace checks pass. One trailing blank line inherited from the roadmap's MASTER_SPEC was removed; section content is unchanged. Main and the original checkout's two dirty-document hashes remain unchanged.

No existing documentation-check script is defined in package.json or repository scripts. The local checks use Node built-ins and Git; no dependency is installed. Application tests/typecheck/lint/build are not rerun for Markdown-only integration with an identical production application tree. Historical experiment tests are attributed to their historical checkpoint, not presented as current execution results. No new browser, live integration or device verification is claimed.

Network use is limited to GitHub source synchronization and publication of this review branch. Provider, paid, experiment, generation, polling, result, asset/DNS, export and billing requests are **zero**. No secret file is read or credential requested. No feature coding, production-state mutation, deployment or real-data import occurs.

## Remaining boundary and recommended next step

Review this candidate and its checks; explicitly approve advancement of main before any main push. **Broad product research/design is closed** unless implementation reveals a genuine architectural blocker. After approved integration, the next phase is the **Production Multi-Agent Coding Sprint** under the [lead-first contract and team handoff](DEVELOPMENT_PLAN.md#production-multi-agent-coding-sprint--handoff-only). Do not dispatch workers or begin coding during this review.

Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic/model tests do not guarantee perfect memory, branching, isolation or universal recovery. No hosted deployment, production EXPLORE or real campaign/private-data acceptance has occurred.
