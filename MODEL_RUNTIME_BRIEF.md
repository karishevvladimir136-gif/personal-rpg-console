# Model Runtime — architecture proposal

**Phase 3.75 design only, September 19, 2026. Not implemented or owner-approved.** No adapter, configuration, model selection or provider call changes in this pass. Preserve accepted implementation `8099e0cca1463f767476190c456d4f3947e7c84e` and acceptance `6db58b5e3d464e4a09604ce344424c4fa8ed763e`.

> No durable world architecture may depend on a specific AI provider or model. Model choice is execution policy and provenance, not world ontology.

Use the smallest internal adapter interface that can serve the existing single DM, source-grounded Memory, future Canon Compiler and World Resolver. No agent framework, hosted orchestration product or second backend is required. The private owner's quality preference takes precedence over cheap-model routing or commercial concurrency economics.

## Accepted implementation and extension points

`src/lib/gameplay/server-contracts.ts` already separates `DmProvider.plan/narrate/feedback`, `TurnStore`, structured plans, checks and bounded context. `src/lib/server/dm/provider.ts` implements that boundary with OpenAI Responses, strict output schemas, local parsing, allow-listed diagnostics and no exposed reasoning. `src/lib/server/dm/index.ts` selects one environment-configured model. `src/lib/server/memory/provider.ts` reuses that requester for source-selection summaries.

These are useful seams, not an existing multi-provider runtime. Model budgets and recognized actual-model names in `src/lib/gameplay/dm-context.ts` and provider/config modules are currently a fixed supported list. `ProviderUsage` does not yet carry the full proposed provenance. Campaign settings do not yet select providers/models. Preserve the accepted OpenAI adapter and configured baseline during future refactoring; do not relabel support for unimplemented adapters as working.

OpenAI, Anthropic, Google and Kimi are candidate integrations, not verified capability or availability claims in this design. Verify official provider documentation, actual API identifiers, data controls, context accounting and supported reasoning/options when a specific implementation is authorized. No universal reasoning-effort string or context-window size is assumed here.

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
