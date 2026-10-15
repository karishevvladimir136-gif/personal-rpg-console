# Simplified Astra runtime — final privacy and live gate

Starting reviewed candidate: `56d2e3b0b41602758d87fbbf46dc2fc267e8fb80` on `codex/astra-simplified-play-runtime`. Production main remains `5fb142b7dad6406473e3d3ae77e49cc5b2d3320d`; owner DB remains Migration **50**. This report covers an isolated candidate, not activation.

## Operation-specific privacy routing

The existing durable begin pins `unified-v1` with the literal input. Deterministic, campaign/timeline-scoped selection then constructs the operation's actual provider packet. Before any provider request or tool execution, its response mode is privately pinned:

- **`public-unified`:** selected packet contains no secret-bearing private evidence. Strict public projection → Astra High/default (tools and continuations if needed) → validated final plus public narration → existing atomic commit. A no-tool turn needs one response, no dedicated narrator.
- **`private-informed`:** selected packet contains relevant private Memory, Character Model cognition, facts/clocks/consequences, hidden World content or other selected DM-only semantics. Astra High/default private adjudication (tools and continuations if needed) → pinned validated final → separate strict public projection → Astra Medium/default public narration → existing atomic commit.

Campaign-global possession of unrelated secrets is not a routing trigger. Existing bounded Character Model relevance, present/explicit actor and current Location scope, existing ranked private retrieval and deterministic term relevance select the evidence. Public current state, Canon, corrections, public Memory, proven public World capabilities/routes, public agreed jobs and observable voices do not themselves require the private route. Empty arrays, IDs and revision metadata are not secrets. Unknown future authoring fields default to requiring review through the private route.

Historical Astra-primary operations without the modern contract pin retain their original two-stage semantics; other legacy runtimes retain their existing routing. Retried operations retain the selected mode even if later retrieval differs; a public-pinned retry removes newly available private evidence. Final-pinned private retries reuse final/tools and reconstruct scoped Memory only for the independent disclosure guard, with no foreground summaries or repeated private planner request.

## Public generation boundary

The private-informed final schema contains no `publicNarration`, no private interpretation prose, and no model-authored base outcomes. The public request receives only public state/scene/history/Memory, bounded observable voices, and allowlisted server-validated public results. It receives no private state, private Memory, hidden Character Model fields, raw World packet, private checkpoint, private proposal/patches or narration bridge. Requests are stateless (`store: false`), with no private conversation/response continuation ID passed to the narrator.

The public projection is idempotent: a second projection preserves already authorized observable voices without recovering their private Character Model. Modern Memory checkpoints expose only the established public resume fields; unknown private extensions and explicitly private checkpoints are omitted. Selected private Memory also participates in the literal disclosure guard, including after final-pinned retry. Literal/identifier rejection remains defense in depth, not the semantic secrecy architecture.

Semantic fixture: private cognition about hiding a brass key until midnight and a concealed debt reaches the private adjudicator. Those semantic excerpts and its interpretation never enter the public narrator. Normal client output contains only the independently generated public response; malicious literal-copy outputs are rejected atomically.

**Bounded quality limitation:** private nonmechanical cognition is not handed to public generation as untrusted plan prose. An exact private choice/refusal that has no validated public consequence may not be reproduced by the public narrator. It derives ordinary fiction from public evidence, observable voice and validated outcomes. No new cognition bridge, semantic action DSL, agent or mechanics authority was introduced to bypass secrecy.

## Migration 51 amendment — disposable only

`202610140051_astra_unified_contract.sql` adds one further nullable private column, `turns.astra_response_mode`, constrained to `public-unified`/`private-informed` with the existing modern contract. A narrow `astra_response_mode` action requires owner/service authority, current campaign/timeline fence, live lease/token, exact source/runtime revision and an explicitly modern Astra Game operation. First pin must precede receipts/final; identical replay is idempotent and a changed mode conflicts. Modern tools, final checkpoint and commit require the mode.

The existing save/timeline capture preserves both nullable columns. Old immutable manifests remain unchanged and restore null/legacy semantics. The new runtime wrapper remains service-only; its predecessor is inaccessible to service_role/PUBLIC/anon/authenticated while internal SECURITY DEFINER delegation works. Migration 1–50 and all delegated state/commit guards are unchanged. No Migration 52 was created. Migration 51 has not been applied to owner DB.

## Offline verification

**202 distinct focused checks pass**, including final privacy selection **11/11**, disposable populated Migration-51/ACL/recovery **4/4** and the live harness **6/6**. The 22-file batch passed 201 checks; its 10 privacy checks were superseded by the final 11/11 rerun, giving 202 distinct checks. The narrow unused test-binding lint correction was followed by another 4/4 migration rerun.

Fresh complete suite: **2,362 passed / 2,363 total**, **zero failures**, **one existing explicit-opt-in live disposable Supabase Auth/PostgREST skip**, **503.820 seconds**, three workers. **TypeScript passes**, repository **ESLint passes with zero warnings**, and the **production webpack build passes**. The first lint attempt's single unused test binding was corrected; no production behavior changed for that cleanup. Required tests cover actual selected private retrieval, public-only one-call behavior, unrelated secrets, safe public generation, semantic/literal leakage, mode pin/retry/save/load, legacy recovery, dice, effects, atomicity and permissions.

The retained 200-turn production-module/PGlite soak passes: **200 commits**, **300 fake primary responses**, **100 durable tool receipts**, **45 background fake summaries**, **zero foreground summaries**. Exact final state: hero HP **10**, Focus **20**, supplies **10**, Nera HP **40**, world minute **9,800**, original Location, **20 completed rests**. Callback retrieval, actual Memory overflow, save/load, exact replay and frozen historical World remain verified. Final full-run packets are **40,710–62,243 bytes** in that deterministic soak; these are not live speed measurements. The **64KB soft target** and **993,404-byte outer bound** remain; no foreground summaries or action/mechanic guardrails were restored.

## Live smoke procedure and cost limit

`scripts/astra-simplified-live-smoke.mjs` uses actual production provider/runtime modules and a fresh disposable PGlite campaign. It imports no owner DB/session/environment file and invokes no media provider. A host-only wrapper reads only the existing configured OpenAI key into memory; credentials are never written to the report, source, request arguments or logs.

Hard dispatch caps: **four actual HTTP requests**, **US $5**, **gpt-6-astra/high/default only**, **4,096 maximum output tokens**. Before every request, serialized UTF-8 request bytes plus 2,048 framing must be at most 64,000, purely as this smoke's spending bound. All input is conservatively reserved at **$12.50/M** and output at **$50/M**; four worst-case requests reserve **$4.0192**. This is not a production input cliff. No quality/semantic retry, manual output repair or fixture change is allowed after dispatch. Systemic schema/parse failure stops the run immediately.

Three sequential synthetic scenarios cover ordinary conversation, movement/search with a meaningful server skill check and continuation, and accepting an established mundane bread gift. The harness records actual model, HTTP status, bytes, tokens, parse outcome, provider/full-turn latency, pinned mode, narrator count, exact synthetic output and safe checkpoint/SQL boundaries. If the model omits a requested tool/effect, coverage is reported honestly.

Pricing source checked for this run: [official GPT-6 Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra). Estimated Standard spend uses $10/M uncached input, $1/M cached input and $50/M output; reasoning tokens are included in output, not billed twice. Actual invoiced/cache-write charges are not exposed by this harness, so the conservative ceiling remains the spending safeguard.

## Final results

All required offline gates have passed. No paid request has been made at this code checkpoint. Final live measurements, exact tested code SHA and synthetic evidence paths will be appended without changing the verified implementation.

## Owner safety

Read-only verification still matches all **79/79** owner RPG fingerprints. Iris remains runtime revision **79**, world minute **508**, with unchanged timeline and preserved failed operation `5267cd71-79c0-44e1-b24a-2d7a7c3eddea`. Main, owner app/process/configuration, owner DB, gameplay, saves, media and deployment remain untouched. Only credential-free isolated preview `127.0.0.1:3129` is used for repository tests; owner port 3000 is not used by those tests.
