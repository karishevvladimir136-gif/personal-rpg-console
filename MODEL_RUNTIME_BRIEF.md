# Model Runtime — accepted baseline and future extension design

**Owner freeze recorded 2026-09-19:** direct OpenAI Responses remains the v1 production baseline. Preserve the server-only DmProvider/structured requester seam; no Vercel AI SDK/Gateway production adoption. Jev is DO NOT ADOPT for Thread/Actor relevance, Canon/source classification and parallel comparison; its incomplete benchmark is closed. See [final decision and exact evidence checkpoints](PHASE375_ARCHITECTURE_DECISION.md). Other adapter/onboarding/ruleset extensions below remain future design, not implemented or newly approved. No production changes in this pass.

**Current forward scope after D2A acceptance:** the owner now prioritizes Mega DM v1 before D2B. This document defines guidance selection on the existing single-DM seam; it does not assert that Global DM Craft retrieval or Campaign DM Style already runs in production. The development-agent Sol/Astra routing in [AGENTS.md](AGENTS.md#development-agent-model-policy) is separate from runtime provider/model configuration and does not change `OPENAI_DM_MODEL`.

> No durable world architecture may depend on a specific AI provider or model. Model choice is execution policy and provenance, not world ontology.

Use the smallest internal adapter interface that can serve the existing single DM, source-grounded Memory, future Canon Compiler and World Resolver. No agent framework, hosted orchestration product or second backend is required. The private owner's quality preference takes precedence over cheap-model routing or commercial concurrency economics.

## Accepted implementation and extension points

`src/lib/gameplay/server-contracts.ts` already separates `DmProvider.plan/narrate/feedback`, `TurnStore`, structured plans, checks and bounded context. `src/lib/server/dm/provider.ts` implements that boundary with OpenAI Responses, strict output schemas, local parsing, allow-listed diagnostics and no exposed reasoning. `src/lib/server/dm/index.ts` selects one environment-configured model. `src/lib/server/memory/provider.ts` reuses that requester for source-selection summaries.

These are useful seams, not an existing multi-provider runtime. Model budgets and recognized actual-model names in `src/lib/gameplay/dm-context.ts` and provider/config modules are currently a fixed supported list. `ProviderUsage` does not yet carry the full proposed provenance. Campaign settings do not yet select providers/models. Preserve the accepted OpenAI adapter and configured baseline during future refactoring; do not relabel support for unimplemented adapters as working.

OpenAI, Anthropic, Google and Kimi are candidate integrations, not verified capability or availability claims in this design. Verify official provider documentation, actual API identifiers, data controls, context accounting and supported reasoning/options when a specific implementation is authorized. No universal reasoning-effort string or context-window size is assumed here.

## DM Craft context and authority — future design

The existing `DmProvider.plan()`, `narrate()` and `feedback()` remain the single DM boundary. DM Craft is reusable owner-approved guidance for the frontier reasoning/generative model, not a second DM, agent, factual Memory store or fine-tuned replacement. Product/approval semantics live in [MASTER_SPEC](MASTER_SPEC.md#dm-craft-and-campaign-dm-style--future-product-design) and [RPG Design Doctrine](RPG_DESIGN_DOCTRINE.md#36-dm-craft--reusable-owner-approved-education).

Conceptual flow: **authoritative RPG state + Canon / Memory + approved Global DM Craft + Campaign DM Style → existing DmProvider stages → server validation of consequences → authoritative commit**. These inputs retain separate authority and visibility; this is not permission to send private planning context to every stage. `feedback()` returns proposals for explicitly approved preferences/Craft, never world mutations. `plan()` and `narrate()` retain their existing structured plan/result contracts and validated public/private patch separation.

| Stage | Relevant Craft emphasis |
| --- | --- |
| `plan()` | Quest structure, systemic freedom, world consequences, Actor/Thread interactions, investigation, factions, fail-forward, alternate approaches, agency and recovery from unexpected actions |
| `narrate()` | Scene directing, dialogue, NPC initiative, pacing, sensory presentation, dramatic tension, companion spotlight, callbacks and tone |
| `feedback()` | Owner's explicit teaching/style request and the small applicable approved guidance set; propose a reviewable scoped change, never self-approve it |

For Mega DM v1, `plan()` may select approved techniques for alternate approaches, player-created goals, resilient quests, failure/recovery, durable promises, backstory/world intersection, Actor/faction trajectories, setup/dormancy/payoff and relationship causality. Main-quest pressure must respect the effective Deadline Pressure and the owner's choice to wander. `narrate()` may select scene directing, quiet breathing room, dialogue, knowledge-consistent NPC/companion initiative, character continuity, useful callbacks/Return With Delta, emotional geography, decompression, sensory presentation and tone. Stage-specific applicability is explicit.

A card may apply to both planning and narration. Keep Core Doctrine compact and versioned; retrieve only a small relevant, approved subset of the larger Craft Library for each stage. Never send the full library every turn or displace mandatory rules, current state or required evidence. Prefer ordinary Supabase/Postgres structures and the existing authorized retrieval capabilities with a distinct guidance record kind/filter, not a new vector database, backend, agent framework, hosted orchestration product or knowledge SaaS. Stage tags, relevance conditions and bounded text selection can provide an initial path without a classifier dependency.

Start with deterministic eligibility and selection: authorize owner/campaign scope and approved exact version; filter by operation stage and declared relevance conditions; rank only against authorized current context; take a small fixed budget with stable tie-breaking; and pin the selected versions on the operation. The compact Core Doctrine is broadly eligible, while optional Craft Cards remain selective. No classifier or second retrieval authority is needed. Absent relevant Craft is a valid result, not a reason to send the whole library. Record the selector policy/version and selected/omitted-by-budget metadata in a bounded **server-only** trace so QA can compare same-model baselines without disclosing hidden source details or model reasoning.

Conceptual storage separates owner-scoped Doctrine, Craft Cards, Craft Packs, source provenance and owner-approved examples from campaign-scoped DM Style, feedback and overrides (all with `campaign_id`). Authoritative world/campaign state is separate from both. A Craft Pack is not a World Pack: it supplies techniques, not entities, source-world facts or campaign truth. Campaign-derived examples retain restricted provenance; only explicitly approved, sanitized/generalized examples may become global material. Imported source text is untrusted data, not executable instruction or automatic approval.

Authorize scope, active approval/version and stage eligibility before retrieval. Revalidate effective revisions at the operation boundary. No card grants tools, bypasses actor knowledge/secrecy, invents established facts, changes dice or directly creates/persists canonical state. Manual owner corrections/decisions outrank Craft; explicit campaign style specializes general guidance but cannot override mechanics, canon, agency, privacy, autonomy/deadline policies or authoritative commit. Resolve incompatible preference proposals explicitly, not through hidden rule rewriting. Missing optional Craft material must not fabricate instructions or facts; use an explicitly defined bounded policy and record absence without weakening mandatory context checks.

### Craft trace, saves and retry provenance

Keep a bounded server-side trace of selected Doctrine/Card/Pack IDs and exact versions, applicable stage, campaign-style revision and existing operation/execution identity. For example a plan may select `systemic-alternate-solution v3`, `witness-propagation v2` and `persistent-consequence v1`; these illustrate metadata only, not implemented cards. A selection trace shows what was supplied, not proof that the model used it correctly. Paired with permitted outcomes/evaluation, it helps distinguish missed retrieval, wrong selection, poor application and pack regressions.

This is not chain-of-thought. Never request, store or expose model private reasoning. Selected IDs/versions can themselves reveal private routing, so keep detailed traces server-only; any later owner-facing diagnostics use a separately validated spoiler-safe projection without private IDs, counts or raw context.

Future campaign DM Style revisions extend existing saved effective settings/guidance and timeline fencing with compatible readers; old saves remain loadable. Global Craft version history is not rolled back by loading a campaign. Pin approved guidance versions per operation: pending/retried operations keep their original versions unless an explicit validated continuation boundary is approved, while the next new operation resolves current approved global Craft plus restored effective campaign style. No mid-turn rule switch, past-event reinterpretation, model call merely to load, or second save system. Corrections/authorization are still revalidated; an unsafe pending continuation pauses rather than bypassing them.

Lightweight [Craft Academy scenarios](RPG_DESIGN_DOCTRINE.md#owner-feedback-corpus-and-dm-craft-evaluation--academy) compare baseline and candidate packs outside gameplay. Deterministic approval/scope/provenance/privacy checks and separately authorized model-quality evaluation are different gates. Fine-tuning is optional and late, after Doctrine, cards, retrieval, owner feedback and evaluation; it requires a separate provider/model/data/privacy/cost review and is never a runtime dependency. No schema, retrieval, provider call or behavior is implemented by this addition.

## Minimal logical contracts

| Concept | Responsibility |
| --- | --- |
| Provider Adapter | Server-only authenticated request/response transport, provider schema translation, timeout/refusal/error normalization, usage and actual-model reporting |
| Model Registry | Versioned configured provider/model identity, supported task capabilities/options, verified context/output accounting, attachment support and owner quality preference |
| Task Profile | Purpose, input/output contract version, mandatory evidence, visibility boundary, validation policy and operational budget |
| Execution Profile | Resolved provider/model/options plus policy/registry versions, frozen before an operation calls a provider |
| Model Artifact Provenance | Traceable link between validated artifact, execution profile, input snapshot/source versions and accepted operation/checkpoint |

Conceptual flow: `generateStructured(task profile, authorized context, execution profile, operation identity) → untrusted output + usage → task parser and domain validation → existing commit`. This is a design interface, not an executable declaration. It must not accept a database client, client-supplied credentials, arbitrary endpoint URLs or instructions to mutate state.

Retain domain-specific `DmProvider` and `SummaryProvider` methods as thin callers of the shared structured requester. A future World Resolver returns proposals, not player narration. Compiler requests return candidate facts and source references, not newly authoritative campaign state. The server decides what can commit. Provider normalization cannot relax a domain invariant.

Require a task-compatible output contract: use native constrained output where supported, then strict local schema parsing in every adapter. A supported alternate transport must still return one validated bounded structured payload; raw prose, malformed/tool-executing output and unsupported schema fields fail closed. Do not silently strip constraints to make an incompatible model work. Schema validity does not prove causality, canon fidelity or truth; task-specific evaluation remains necessary.

## Optional Decision Model capability — design only

Leave an optional capability for specialized non-generative classification/ranking models. **Disabled by default, never a required dependency and never a replacement for the primary reasoning model.** The owner has rejected Jev (TypeSafe) adoption for the four named application roles; no continuation of that benchmark is permitted. The extension point stays vendor-neutral for a future separately authorized candidate, not a queued Jev integration. This optimization serves quality-preserving relevance selection; it does not change the owner's preference for strong reasoning where needed.

Conceptual path: **authoritative Postgres state → deterministic eligibility filtering → optional Decision Model filtering/ranking → frontier reasoning model when deep reasoning is required → server validation → authoritative commit**. Deterministic/no-op outcomes still need no model call. Without a classifier, the existing authorized deterministic/strong-reasoning path remains complete.

Possible uses are World Thread and World Actor relevance, Canon Compiler passage/chunk classification, retrieval pre-filtering/reranking, identifying relevant Memory/source candidates, and classifying similarities/divergences between parallel simulation outcomes. Similarity labels are comparison aids, not truth, canon, a model-winner decision or permission to merge branches.

### Small vendor-neutral classification contract

Add a distinct optional Model Registry capability, conceptually **`classify(inputs, labels, instructions?)`**. Do not force a non-generative classifier to support narration, generative structured-output APIs or reasoning-effort settings. Reuse server authorization, task/execution profiles, budgets, normalized errors and provenance; the classification adapter has no database connection, mutation tool or provider-specific world object.

| Boundary | Logical content |
| --- | --- |
| Inputs | Stable candidate IDs, minimal authorized evidence/features and exact source versions; fixed label-set/schema version; optional trusted task instructions, distinct from untrusted source text |
| Per-candidate result | Candidate ID, selected label(s), explicit abstention/unknown status, confidence or equivalent uncertainty if supported, optional per-label scores with documented semantics |
| Provenance | Provider/model requested and actual where available, task/contract/instruction/label versions, calibration and threshold-policy versions, input/source/timeline revision, operation/attempt identity and available latency/usage |

Absent confidence is **unknown**, never fabricated certainty. Raw scores or logits are not calibrated probabilities merely because an adapter rescales them. Preserve score meaning and record calibration method/version when verified on relevant fixtures. Models without useful uncertainty may rank or classify for inspection, but must not prune unless a separately evaluated conservative policy supplies a defensible uncertainty bound. Strictly validate candidate membership, unique IDs, allowed labels, completeness and score shape/range; never accept invented entities or source references. Partial, malformed, contradictory, out-of-distribution or unsupported responses leave affected candidates uncertain; an unusable response bypasses the optimization altogether.

### Recall-first admission and authority boundaries

| Decision | Routing behavior |
| --- | --- |
| Confident relevant | Retain for applicable strong reasoning/evidence selection |
| Uncertain, abstained, omitted, failed or uncalibrated | Retain; never silently discard |
| Sufficiently confident irrelevant under the evaluated task policy | May be excluded from this request's optional candidate set, never deleted from original records or treated as resolved |

Authorize owner, campaign/timeline, source validity, visibility and actor knowledge **before** a candidate reaches a classifier, then revalidate before context use/commit. Fail-open means retain already-authorized candidates for reasoning; access control and public/private validation still fail closed. Public comparison, narration and actor-specific classification cannot receive private-inclusive inputs. A private-task classifier may receive only explicitly permitted private evidence through an approved transport; its results/IDs/counts remain private too.

Code pins mandatory candidates outside pruning: crossed deadlines, required warning/agency obligations, direct action targets and evidence/dependencies necessary to avoid contradiction. Ranking must not turn into an unexamined top-k cutoff. Relevant and uncertain candidates that exceed the established workload/context budget trigger existing bounded segmentation or a pause/clarification, not silent loss. For example, 300 Threads might deterministically become 50 eligible, then yield 8 relevant + 5 uncertain: retain all 13 plus any mandatory dependencies, even if a single evaluation can process only 12. Process a coherent bounded interval or pause; do not discard the thirteenth or increase work indefinitely. A pruned Thread remains available for later triggers, corrections and evaluation.

A Decision Model must never directly create a World Event; kill, move or change an entity; modify inventory/player state; alter timelines; decide canon; bypass knowledge validation; perform an irreversible consequence; or write persistent state. A classification output is advisory routing metadata, not a gameplay patch, factual Memory assertion or source of truth. The application may retain a safe server-side evaluation/routing audit through existing job/provenance patterns; only normal domain validation and authoritative commit can change world state. No second DM, agent swarm or autonomous classifier loop.

The optional execution policy is explicit and pinned per operation. Disabled/unavailable/timed-out classification bypasses only the optimization and retains authorized candidates; it never changes the selected frontier model. If full evidence cannot fit safely, pause. This defined bypass is not silent provider fallback. No automatic retry storm, substitute classifier or background call on settings/page load. Any reused result must match source versions, campaign/timeline/knowledge scope, model, labels and calibration policy; stale classification cannot prune new evidence.

### Closed evaluation and requirements for any separately reopened candidate

**Phase 3.75 is closed by the [owner decision](PHASE375_ARCHITECTURE_DECISION.md): no further calls, diagnostics, retries or reruns.** classifier.dev, OpenRouter, GLiNER and Vercel Workflows remain deferred; none is integrated or contacted in this task. Any future external proxy use needs explicit authorization and a separate review of destination, retention/training/logging, licensing and allowed data scope. Synthetic spike permission never authorizes real source libraries or campaign/private material. A direct provider adapter, a different approved implementation or no Decision Model must remain possible. Credentials follow the same application-level server-secret onboarding rules; campaigns store configuration IDs only.

The following evaluation criteria are retained only for a future newly authorized candidate; they do not schedule another 3.75A1 spike or authorize resuming Jev. Before any independently approved live World Engine pruning evaluation, use RPG Console-specific synthetic, labelled fixtures for (1) World Thread relevance, (2) World Actor relevance, (3) canon/source passages, (4) parallel-simulation similarity/divergence, (5) English and Russian, and (6) adversarial/ambiguous cases. Include paraphrases, negation, conflicting sources, rare but consequential deadlines, noisy distractors, unknown labels, prompt-injection text and synthetic private/branch markers.

Compare deterministic filtering only, the candidate Decision Model and the selected frontier reasoning baseline on the same authorized input snapshots and owner-reviewed expected relevance labels. The frontier answer is a comparator, not automatically ground truth. Measure relevant-item recall/false negatives and precision, uncertainty/abstention and calibration, latency (including tail latency), strong-model context avoided and actual cost where available. Report both raw classifier results and end-to-end behavior with mandatory-candidate protection, including all uncertain items and classifier overhead; unsupported cost/score metrics remain unknown, not zero.

Before evaluation, define a task-specific extremely-high-recall target and non-prunable critical fixtures; freeze thresholds/calibration on a calibration set and evaluate separately held-out English/Russian and adversarial cases. Report sample sizes, misses and confidence limits rather than claiming finite zero misses prove perfect recall. No arbitrary universal confidence cutoff or forced adoption target is set in this design. False negatives in world causality matter more than extra candidates. Verify failure bypass, bounded overflow, secrecy and no gameplay mutations independently of accuracy. A useful result may justify reranking only, not pruning.

Adopt only after the spike demonstrates meaningful benefit over deterministic filtering without unacceptable recall loss, a separate owner-reviewed go/no-go decision and explicit implementation authorization. If benefit is absent, uncertainty is unreliable or important evidence is missed, keep the layer disabled. The completed historical experiment is preserved separately and was insufficient to justify adoption. No new benchmark, live classifier, dependency or runtime code is added in this documentation pass.

## Non-technical provider onboarding — future implementation

Routine connection and model selection must not require TypeScript, request code, HTTP knowledge, database edits or browser-visible credentials. Adding a genuinely unsupported provider adapter remains a development task; connecting an already-supported adapter or choosing its registered compatible models is an owner settings task. Do not imply that an arbitrary model name automatically satisfies the required contracts.

Use one local convention: **`.env.local` in the checkout actually running RPG Console**, beside `package.json`. Credentials belong to the application server, never to a campaign, World Pack, save or exported configuration. Campaigns store provider/model configuration identifiers and supported non-secret options only. All adapters resolve credentials on the server. Never use `NEXT_PUBLIC_` for provider credentials or send stored values, partial keys or key fingerprints to the browser.

The inspected repository has setup instructions for `.env.local` but **no tracked `.env.example`**; `.gitignore` currently ignores all `.env*`. A future Model Runtime implementation must add a safe `.env.example` with empty placeholders only, narrowly allow that example in Git, and keep the real `.env.local` and every other credential file ignored. This pass does not create or change configuration. Conceptual future placeholders (final adapter names verified during implementation):

```dotenv
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
KIMI_API_KEY=
GOOGLE_API_KEY=
```

Future owner instructions must identify the absolute running project folder and offer **Open local setup instructions / Open folder**, then explain: open `.env.local` in a text editor; find the named provider line; paste the key after `=` locally; save; restart RPG Console through the documented desktop launcher/restart action; reopen Settings. If the file does not exist, copy the placeholder example to `.env.local` once, retaining any existing Supabase configuration. Do not overwrite the whole file to add one key. The future implementation must supply and verify a simple restart workflow for this Windows owner; a terminal command may be a clearly explained fallback, not the assumed routine. There is no such new launcher or settings flow implemented here.

The supported-provider flow is: obtain a key from the provider → place it on the documented line locally → restart if necessary → open **Settings → AI Providers** → test/confirm connection → select compatible models globally or in Campaign settings. No secrets are requested in chat, entered into a campaign form, saved in localStorage, exported, logged or committed. This design deliberately keeps credential entry in the local server-secret file; the Settings page never reads back that file.

The future provider status screen exposes safe server-computed status only:

| Status | Meaning / owner action |
| --- | --- |
| Not Connected | No configured credential; show the exact local file/variable instructions |
| Configured — not tested | Credential is present; usability has not been verified |
| Connected — last tested at … | An explicit test succeeded for the displayed provider/model; not a perpetual health guarantee |
| Connection needs attention | Test failed or credentials changed; retain selected model, show neutral guidance and allow retry |

OpenAI, Anthropic, Kimi and Google rows appear as supported only once their adapters exist; unimplemented adapters must be labelled unavailable, not “Not Connected.” Show the tested model and time. A model-specific permission or capability failure need not mark every model from that provider unusable. Ordinary page loads/status refreshes read local configuration and recorded test status and **make no provider calls**. Detecting a local key change invalidates old test status server-side without revealing secret-derived material.

### Test Connection

Design an explicit authenticated **Test Connection** action for a selected, already-supported provider/model. Explain that it sends a small synthetic request and may incur the provider's normal charge. It tests credentials, model access and a minimal required structured response with a bounded timeout/output limit. Success proves only that tested path at that moment, not unlimited quota, every task capability or world-model quality. The Model Registry's broader compatibility gate still applies.

The server owns the request, validates the registered destination/model and returns a safe success/failure summary and test timestamp. No campaign text, original sources, private state or gameplay input is sent. No world time, inventory, health, canon, memory, saves or campaign guidance is mutated. It cannot silently change the chosen model, try other providers, start simulations or run background probes. Distinguish missing credentials, denied model access, rate/quota limits, network failure and incompatible output using neutral messages; never echo raw provider errors or request payloads. Preserve an uncertain result as uncertain rather than showing a false Connected status. Bound repeated clicks and permit an explicit retry.

Future acceptance includes adding a second supported provider using only `.env.local` and the documented restart/UI workflow, selecting its models globally and per campaign without code/SQL edits, denying anonymous/non-owner tests, verifying secret-free network/DOM/log/error/export payloads, zero calls on page load and zero campaign mutations on successful/failed tests. No connection test is executed during this design pass.

## Selection, inheritance and quality

Global configuration holds credential references, enabled providers/models and the owner's preferred high-quality primary model. Secrets stay in ignored server configuration or another explicitly approved server secret facility. Browser choices contain safe registry IDs and supported options only.

Campaign model policy has a primary model plus optional overrides:

| Task | Default |
| --- | --- |
| DM Reasoning / feedback | Campaign primary |
| Narration | Campaign primary |
| World Engine | Campaign primary |
| What If | Campaign primary; a Lab run explicitly pins its chosen configuration |
| Canon Compiler | Campaign primary when compiling in that campaign's scope; otherwise World Library's explicit choice or global primary |
| Memory | Campaign primary |
| Optional Decision Model | Disabled; enable only an explicitly selected compatible classification capability after its evaluation/adoption gate; do not inherit the primary reasoning model as an automatic substitute |

Resolution order is explicit operation/Lab selection → campaign task override → campaign primary → approved global default. An unavailable or incompatible explicit selection pauses; it does **not** fall through this order to a different model. Inheritance is used only when a value is deliberately unset. Display the effective choice before an important run.

Default to the strongest configured model preferred by the owner, not an automatic economy tier. “Strongest” is an owner-approved preference informed by task quality evaluation, not an inferred claim from a model's name, price or release date. Do not automatically promote a newly released model. Token and work limits protect correctness, latency and runaway operations; they do not justify omitting essential evidence to save a small amount of money.

Persist versioned selection policies alongside existing settings/versioning concepts. A global default edit must disclose which inheriting campaigns/tasks would change; explicit owner confirmation creates a new policy revision for future operations. Existing operations retain their resolved profile. Explicit per-task overrides remain unchanged. No mid-turn model switch when another tab changes settings.

One live campaign has one chosen primary DM configuration, with optional task-stage overrides executed by that same runtime. Different planner/narrator transports do not constitute independent agents voting on play. Multi-model comparison belongs in [World Lab](WORLD_LAB_WHAT_IF_BRIEF.md), where the owner deliberately requests independent runs.

## Context, secrecy and provider independence

Preserve MASTER_SPEC §38, `withMemory`, exact current state, complete exchanges, source/version validity, public/private paths and timeline fences. Task profiles assemble evidence before adapters run; adapters do not conduct hidden retrieval or own provider conversation memory. Worlds must survive changing or losing a provider account.

Each execution uses verified context limit, output/reasoning reservation, safety margin and accounting version. Keep the accepted 64,000 operational cap as the compatibility baseline until a separately tested task policy changes it; it is not a universal provider limit. Larger windows do not justify sending an entire corpus indefinitely. A smaller explicit model selection must prove mandatory context fits or pause. Never silently truncate input, rules, recorded results or necessary evidence.

Planning/world tasks may receive server-authorized private facts; narration/public recaps/media/feedback receive only their permitted public inputs. Companion/actor inputs require positive knowledge membership and the applicable entry-point cutoff. Provider capability matching must honor these task boundaries. No whole private prompt, private output, private source IDs/counts or chain-of-thought enters browser payloads or ordinary logs. Provider retention/training controls must be verified before sending even synthetic private context during future live tests; no real-data permission is implied.

## Provenance and retry boundaries

For every important AI-derived result, record provider, requested and safely reported actual model ID (or explicitly unknown), relevant reasoning/sampling/configuration options, task profile, prompt/output-contract version, input/source digest and versions, owner/campaign/world scope, timeline/checkpoint, operation/attempt ID, createdAt, validation outcome and available usage. Store no chain-of-thought, credentials or raw private payload in public metadata. Detailed source/attempt provenance with private references remains server-only; public provenance is a safe projection.

Persist accepted input, selected profile and operation identity before calls; store validated results before further stages. A retry cannot duplicate a committed consequence, resubmit recorded dice or silently alter its model. Timeouts can lead to more than one billed provider request if a response was lost; application idempotency guarantees one committed effect, not universal provider billing idempotency. Reuse provider idempotency only when verified to exist.

If the provider is unavailable or refuses, preserve input and pause with neutral status. The owner can retry the same configuration, cancel, or explicitly approve a different model. A change creates a provenance boundary: a new attempt/profile revision or a new Lab continuation branch. Revalidate source/fence/rules, keep accepted dice and previous committed history, and never rewrite past artifacts to claim the new model produced them. A recorded result needing no new call can still be inspected or loaded when its old provider is unavailable.

Save/load remains provider-independent. Saved effective rules/guidance and historical artifact provenance are restored exactly. The execution policy for the **next new** operation is resolved visibly from the chosen campaign policy; no model is called merely to load. A pending operation keeps its original execution profile unless the owner explicitly authorizes a validated continuation boundary. Changing a provider does not change ontology, history or character identity.

## Parallelism without infrastructure sprawl

World Lab requests one to three runs. Use a small durable job ledger with independent run leases/status, backed by the same Postgres and application server. Provider requests can run concurrently, outside transactions, against separately pinned input manifests. Each result validates and commits only its own timeline head. One provider failure must not cancel the others or cause a substitute model to finish its run.

Real-time lease expiry permits recovery, not fictional time advancement. Start/Continue explicitly authorizes a finite horizon and workload. Work can finish an already-authorized request while the tab is backgrounded; it cannot schedule additional simulation just because time elapsed. On process interruption, resume only durable pending work within that authorization. See the Lab brief for the required detached-manifest extension; current active-campaign RPCs cannot safely provide this concurrency by toggling live timelines.

## Future acceptance gates — not executed here

- Existing OpenAI/house-profile turns and source-selection summaries retain behavior behind the new adapter; existing tests remain, not renamed into claimed support for other providers.
- At least two separately authorized, configured providers pass transport/schema/refusal/budget/privacy tests before claiming replaceability. Validate campaign inheritance, task overrides and incompatible selections without fallback.
- Changing a global default or campaign policy does not change an in-flight operation; changing models with explicit approval records a visible provenance boundary and preserves dice/effects.
- No required context silently disappears under a smaller model; provider-specific reasoning/accounting is honored without universal option assumptions.
- One-to-three independent synthetic runs share the approved base, survive one failing provider, retain selected/actual-model provenance and never contaminate live or sibling state.
- No chain-of-thought, secret credentials or private diagnostic content in public artifacts, errors or logs. Actual-model uncertainty is reported honestly.
- Separately authorized live quality evaluation tests grounding, uncertainty, agency and secrecy; deterministic adapters alone do not prove model quality. No live/model/API calls are part of this documentation pass.

Owner decisions: initial supported providers/models, preferred quality order and any task overrides. Proposed default: one strongest configured primary inherited everywhere, with explicit exceptions rather than automatic routing.
