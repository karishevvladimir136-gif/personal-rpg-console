# Development status — Mega DM v1 — OWNER ACCEPTED / CLOSED

**Owner decision:** the completed blind bake-off is accepted as three bounded evidence points: Repair / History / Shared Joy → Astra; Identity / Knowledge / Independent Refusal → Astra; Cognitive World Fingerprint → Sol. The owner selects **gpt-6-astra / high / Standard (`default`)** as the new/inherited application gameplay default. This is a product choice, not an automatic overall winner or universal superiority claim. Evaluated Mega DM implementation: `33c6163110090ff69a2737a435666954bbf2bced`; bounded diagnostic/capability baseline: `b39c929df5e58faa42f0c2e149bf2d6d0a6a2744`. See [closure record](MEGA_DM_V1_CLOSURE.md).

**Implemented/integrated:** one shared application-default selector now feeds Settings readiness, ordinary server factories and persistent profile resolution. The existing Responses requester explicitly uses Standard tier. Explicit environment overrides, campaign RuntimePolicies, task overrides, capability-default semantics and pinned execution profiles are preserved; Sol remains registered/selectable, and unknown/invalid selections fail closed. No schema, migration, save format, Canon, Character Model, Craft, prompt or gameplay authority changed. The corrected v5 synthetic fixture/test/preparer is committed with closure; historical live evidence and reveal mappings are unchanged.

**Fresh verification:** complete repository run with the local production test server collected **1,191 tests: 1,190 passed, zero failed, one opt-in disposable hosted-Supabase test skipped**. Focused default/runtime/capability/v5 tests: **34 passed, zero failed**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint of application/tests/scripts (ignored immutable `test-results/` excluded), and production webpack build passed. The offline actual plan → validation → deterministic resolution → private narration bridge → narration proof used Astra/high/Standard in both mocked requests with zero persistent mutation. All **128** v4/v5 evidence files matched their recorded SHA-256 hashes. The initial complete run's 26 HTTP tests had no local server; the fresh complete run with the server passed. Existing populated migration/save/timeline/privacy/reward/commerce/Mega DM regressions passed on disposable state.

**Limits:** no new live/provider request, physical-device review, hosted Supabase verification, real-data migration/import or deployment was performed. Previous live evaluation qualifications and diagnostic failures remain historical evidence. No universal/long-horizon simulation or model-quality guarantee is claimed; the dedicated Character Model owner visual editor remains outside this closure.

**Publication/next step:** owner authorizes fast-forward-only publication from remote main `d927ae6c1039d4aeb66e2fc430e66a9a845a45a8`, then a separately bounded parallel V1 completion wave. No D2B, Timeline Explorer, Home or FRAME production implementation is included in this closure commit. Freeze lane ownership before launching that wave. Existing D2A acceptance and all prior status bodies below are retained verbatim.

---

# Development status — Mega DM v1 plan-to-narration owner-review correction — READY FOR OWNER REVIEW

**Milestone/status:** bounded correction from reviewed `3bba085fd5d262728fa6cb6b64af8a4868bf08d8` on `codex/mega-dm-v1-cognitive-living`. Implemented and deterministically verified; **not live-model-quality evaluated and not owner accepted**. Main and the original dirty checkout remain unchanged. No provider/model request, real campaign import, migration, deployment, D2B, Home, media or adapter work occurred.

**Implemented:** the private narrator now receives a bounded internal DM-to-DM handoff. The persisted plan is parsed and authority-validated again before its at-most-4,000-character narrative intent is projected; this is a non-authoritative proposal, never public text or a state patch. The narrator also receives the existing at-most-two-actor/6,200-byte Character Packet, with stable identity, values, boundaries, signatures, current state, relevant relationship/episode interpretation, observable voice and positive `knownBy` evidence filtering. It does not receive raw Character Model storage or the entire private state. Narration instructions preserve supported character decisions without reversing them, while validated outcomes, NPC knowledge and controlled-PC agency remain higher authority. The exact saved plan reconstructs the same bridge on retry. A scripted narrator can still write poor prose, but narration alone cannot commit mechanics; live quality remains unproven.

**Offline smoke:** three dense synthetic probes now cover identity/knowledge/refusal, repair/history/joy, and the Cognitive World fingerprint. A/B/C use the same frozen source, model field, budget and production schemas per probe; A→B changes Craft and B→C adds Character treatment. Nine production plan contexts are prepared now. Nine dependent narration slots require original validated plan outputs, deterministic disposable resolution and the production `narrationSource()`/`buildContext()` path before becoming requests. Maximum future evaluation is **3 × 3 × 2 = 18 provider calls**, subject to separate owner authorization; **zero calls were made**. The blind X/Y/Z first pass shows final player-visible narration only; original plan output remains separate for later technical diagnosis. No persistent smoke mutation or live settlement is claimed.

**Files/areas changed:** `src/lib/gameplay/turn-engine.ts`, `dm-context.ts`, `server-contracts.ts`; `test-fixtures/mega-dm/living-smoke-v1.mjs`, `living-review-v1.mjs`; `scripts/mega-dm/prepare-living-smoke.mjs`; focused narration/smoke tests and the existing integrated-PGlite secrecy regression; `MEGA_DM_LIVING_SMOKE_PLAN.md`; this status. No Character Model schema, migration, provider adapter or RuntimePolicy change.

**Fresh verification:** focused bridge/Character/smoke suite **20/20**; old integrated PGlite regression **6/6**. Complete repository suite **1,161 collected: 1,160 passed, zero failed, one hosted opt-in skipped**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint, production webpack build and `git diff --check` passed. Existing old-save/timeline and populated Character Model upgrade checks remain green. This is deterministic local/PGlite evidence, not hosted Supabase or physical-device testing.

**Next step:** owner review of this exact correction. A separately approved live two-stage smoke is still needed to judge whether final player-visible characters and worlds improve. D2B remains deferred.

---

# Development status — Mega DM v1 Cognitive/Living owner-review correction — READY FOR OWNER REVIEW

**Milestone/status:** bounded correction on `codex/mega-dm-v1-cognitive-living` from exact reviewed candidate `66ed447902d8a12d5d2bcb8f8c61b7dfad38dec0`. The accepted architecture, Character Model schema, save format, Identity authority and single-DM runtime remain intact. This correction is implemented and deterministically verified, **not live-model-quality evaluated or owner accepted**. No provider/model call, real/private campaign input, deployment, D2B, Home UI, media work or adapter change occurred.

**Implemented:** Character Packet selection now filters eligible actors for an existing valid model, ranks an explicitly addressed actor before generic present actors, resolves ties deterministically and only then applies the unchanged two-actor/6,200-byte cap. Controlled actors remain excluded; off-screen mentions can inform private planning but cannot add an off-screen voice to narration. The private DM may use relevant fictional cognition; `knownBy` continues to constrain what the fictional NPC knows. Companion-only Character Model scope and the two-actor cap are context-efficiency heuristics pending quality evidence, not owner-mandated private-state barriers.

**Offline smoke correction:** the five frozen purposes are identity under pressure, impossible knowledge, repair with history, Cognitive World fingerprint and shared joy after intensity. Each A/B/C arm now uses the production `buildContext()` path; C uses the production Character Model parser and `characterPacket()` with positive Memory evidence filtering. B and C assembled context inputs differ only by C's exact embedded packet. A and B differ only by pinned Craft. The 48-scene synthetic cast digest is unchanged; a new exact snapshot of the Cognitive Craft seed is checked against disposable SQL. An anonymous X/Y/Z owner form and separate reveal key are prepared. The maximum remains **5 probes × 3 arms = 15 future paid calls**, with **zero calls made**. Provider-wire model/reasoning/tier/budget/cost authorization is still a separate gate; no byte-equivalent live wire request or live settlement is claimed.

**Files/areas changed:** `src/lib/gameplay/character-model.ts`; `test-fixtures/mega-dm/living-smoke-v1.mjs`, `living-smoke-source-v1.mjs`, `frozen-cognitive-craft-v2.json`, `living-review-v1.mjs`; `scripts/mega-dm/prepare-living-smoke.mjs`; focused Character Model and smoke tests; `LIVING_CHARACTERS_BRIEF.md`, `MEGA_DM_LIVING_SMOKE_PLAN.md`, `MEGA_DM_V1_CONTRACTS.md`, and this status. No migration, provider adapter, settings authority, runtime schema or client UI was changed.

**Fresh verification:** focused Character Model, Living Character benchmark and smoke tests passed **18/18**. The complete repository suite collected **1,156 tests: 1,155 passed, zero failed, one opt-in hosted test skipped**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint, production webpack build and `git diff --check` passed. Existing disposable tests continue to cover populated old saves, timeline load/fork, Character correction receipts after restore, stale pending turns, controlled-PC and cross-campaign refusal, unsupported evidence, ordinary Identity rewrite refusal, owner correction, absent Character history, seven-field Style defaults, and plan/narrate secrecy. This is local/PGlite evidence, not hosted Supabase or physical-device coverage.

**Next step:** owner review of this exact correction, followed only by separately authorized live smoke preparation/execution. Live character recognizability, multi-character companion benefit, optimal packet count and long-campaign emotional rhythm remain unproven. D2B remains deferred.

---

# Development status — Mega DM v1 Cognitive Worlds, Living Characters & Positive Afterglow — READY FOR OWNER REVIEW

**Milestone/status:** implemented and integrated on `codex/mega-dm-v1-cognitive-living` from owner-approved corrected Mega DM baseline `43ad7d696830847434ddb3909d4b14e2c9b7bed0`. This expansion is deterministically verified, **not live-model-quality evaluated or owner accepted**. Main and the original dirty checkout remain unchanged. No provider/model call, real campaign import, production migration, deployment, D2B, Home UI, FRAME or media work occurred.

**Implemented:** the existing one-DM Craft authority now has compact, bilingual Cognitive World, Living Characters and Positive Afterglow doctrine/cards, selected deterministically and pinned to each turn. Campaign DM Style adds owner-controlled Emotional Tone (Hopeful Humanist default) and Tragedy Intensity (Normal default) through existing versioned settings. A bounded Character Model lives in the existing DM-private state, with owner-only correction, immutable correction receipts, save/timeline compatibility, positive `knownBy` evidence checks, structural resistance to identity drift, and atomic turn-patch/retry validation. Planning receives at most two relevant private actor packets; narration receives only an observable voice projection for present actors. Normal player DTOs receive no Character Packet or private selection trace.

**Files/areas:** additive migrations `202609250019_mega_dm_cognitive_craft.sql` and `202609250020_mega_dm_character_models.sql`; Campaign Settings/Style controls and validation; Character Model parser, packet, runtime/Memory seam and owner-authorized API; synthetic fixture, deterministic benchmarks, offline smoke preparer; `COGNITIVE_DM_CRAFT_RESEARCH.md`, `LIVING_CHARACTERS_BRIEF.md`, `POSITIVE_AFTERGLOW_BRIEF.md`, `MEGA_DM_LIVING_SMOKE_PLAN.md`, and source-of-truth/contract updates. No second DM, Memory store, save authority or provider requester was added.

**Fresh verification:** the complete repository suite collected **1,151 tests: 1,150 passed, zero failed, one opt-in hosted test skipped**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint and production webpack build passed. Focused disposable PGlite tests covered old populated migration/save compatibility, immutable owner correction, atomic/idempotent turn patches, cross-campaign/evidence refusal, controlled-actor SQL refusal with no partial state, stale-turn fencing, companion scoping, old seven-field Style defaults and bilingual Craft. The frozen synthetic cast contains 48 scenes, 20 Living Character probes, 13 Cognitive probes and 8 afterglow cases. UI render tests covered the EN/RU owner Style controls; no physical-device or hosted-Supabase browser claim is made. `git diff --check` passed.

**Limits / next step:** no live model-quality evidence establishes that characters feel recognizably alive, that emotional rhythm works over long campaigns, or that the new Craft improves outcomes. Character Model establishment/correction currently uses the owner-only server API; a dedicated owner visual editor is not part of this slice. The development-only future smoke proposal is **five frozen probes × three arms = 15 maximum paid calls**, subject to a separate model, budget, hard cost cap and owner authorization; **zero calls were made here**. Owner review of this exact branch is next, then separately authorized live evaluation before final Mega DM v1 acceptance. D2B remains deferred.

---

# Development status — Mega DM v1 correction — READY FOR OWNER REVIEW

**Milestone/status:** narrow correction on `codex/mega-dm-v1` from exact reviewed candidate `2f52b1514aa9ef45d6f17b345d980a34b24a6409`. This implementation is integrated and deterministically verified, **not owner accepted or live-model-quality evaluated**. Main remains at its authorized prior state; no D2B, deployment, real campaign import, owner-database migration or provider/model call was performed.

**Implemented:** Chat with DM feedback can return a typed, bounded Campaign DM Style delta or generalized bilingual Global Craft Card draft alongside its explanation. The existing proposal and explicit owner approval paths remain authoritative; the UI shows current/proposed values, prefilled editable content, and Approve/Reject. The additive migration stores the reviewed candidate with the existing turn proposal and immutable retry receipt. Legacy text-only feedback and DM Guide approval remain compatible. New Craft claims use a versioned selector with only literal input plus a 512-character public scene/location signal; older pinned turns retain the literal policy. At most two optional Cards per stage remain exact-pinned. Future replay inputs now freeze the 48-scene fixture and seeded Doctrine/Card content, version identities, selected cards, policy, model field, scene, literal input, adjudicated outcome and public-before state. The replay harness remains network-disabled without an adapter or credentials.

**Files/areas:** additive migration 18; gameplay feedback contracts/parser/validation and existing turn settlement; Craft claim policy and owner review UI; EN/RU preview/copy; versioned benchmark materials and focused tests. No new DM, retrieval authority, provider requester, Canon store or save system.

**Fresh verification:** focused Mega DM/legacy tests passed. The final complete repository suite collected **1,138 tests: 1,137 passed, zero failed, one opt-in hosted test skipped**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint, production webpack build and `git diff --check` passed. Disposable PGlite tests covered additive migration, typed Style/Global proposals, no self-application, private-content rejection, deterministic public-context selection, legacy pins, retries and frozen replay provenance. Browser checks of the actual synthetic Teach DM review passed in EN/RU at desktop, 390px and 320px widths: proposed controls were prefilled/editable, preview approval remained disabled, and no horizontal overflow or browser console error appeared. This was not physical-iPhone or hosted-Supabase testing.

**Limits/next step:** no live model behavior or generated-card quality is claimed; the future replay still requires separate owner authorization and a supplied adapter. Global generalization uses conservative literal server checks and owner review, not semantic proof. Owner review of this exact corrected branch is next. Historical D2A and Mega DM docs acceptance below are unchanged.

---

# Development status — Mega DM priority/docs consolidation — OWNER ACCEPTED

The owner explicitly accepts the documentation consolidation at exact reviewed docs SHA `68925a10db3a9688d7475294cd156158ca6b77a5`. **Mega DM priority/docs consolidation status: OWNER ACCEPTED.** The current forward order is **Mega DM v1 → D2B → Timeline Explorer V1 → Timeline Explorer V2 → Enter This World → FRAME / Visual Bible + fal → 2D Presentation Engine → VIDEO**. D2B remains deferred until Mega DM v1 is implemented, evaluated and owner accepted. This documentation acceptance does **not** itself authorize Mega DM implementation, D2B or any later phase.

The reviewed nine-file documentation diff is preserved. Historical D2A owner acceptance and evaluation evidence remain unchanged. This is a `DEV_STATUS.md`-only acceptance record; no application code, schema, migration, test, fixture, dependency, browser review, provider/model call, database action or deployment is part of it.

---

# Development status — Mega DM priority and architecture consolidation — DOCS ONLY

**Current milestone/status:** documentation consolidation from exact remote main `68b2e96fd715ad65a9b96a0d525aa6cdfa55908f`, pending owner review. The World Lab D2A **OWNER ACCEPTED** record below remains unchanged; no implementation/evaluation acceptance is implied by this planning commit. The new forward order is **Mega DM v1 → D2B → Timeline Explorer V1 → Timeline Explorer V2 → Enter This World → FRAME / Visual Bible + fal → 2D Presentation Engine → VIDEO**. D2B remains deferred until Mega DM v1 is implemented, evaluated and owner accepted.

**Completed documentation:** consolidated the single-`DmProvider` Core Doctrine, Long-Form Campaign Craft, small stage-aware approved-card selection, Campaign DM Style/Chat with DM/Teach DM scope, immutable approval and server trace, frozen approximately 48-scene benchmark, Timeline Explorer V1/V2 boundaries, and development-agent model/efficiency guidance in existing source-of-truth documents. Changed areas: `MASTER_SPEC.md`, `DEVELOPMENT_PLAN.md`, `RPG_DESIGN_DOCTRINE.md`, `MODEL_RUNTIME_BRIEF.md`, `WORLD_LAB_WHAT_IF_BRIEF.md`, `WORLD_ENGINE_BRIEF.md`, `AGENTS.md`, `START_HERE.md` and this forward status. These are design priorities and future gates, not implemented runtime/UI behavior.

**Verification/limits:** focused documentation checks passed: all **9** changed files are Markdown, **16** introduced relative links/anchors resolve, UTF-8 decodes cleanly, code fences are balanced, no replacement characters/conflict markers were found, `git diff --check` reports no whitespace errors, and the historical D2A status body remains unchanged. No application suite, typecheck, lint, build, browser review, model/provider call, database action or real-data import is performed. D2A code/evidence are untouched. Next step is owner review of this documentation branch, followed by a separately authorized Mega DM v1 implementation/evaluation plan; neither Mega DM nor D2B starts here.

---

# Development status — World Lab D2A — OWNER ACCEPTED

The owner explicitly accepts World Lab D2A at exact implementation SHA `fdc63d07183dba999aefb2626d76f1a46a6ec40c` on `codex/world-lab-d2a-single-model`. **D2A status: OWNER ACCEPTED.** Acceptance includes natural-language What If → structured review; immutable owner corrections and explicit approval; single-model detached generative simulation; task-specific output budgets and provider deadlines; nullable unresolved timing and explicit owner timing confirmation; knowledge/future-source boundaries; validated bounded consequences; retry/replay/fencing/non-mutation; EN/RU owner UX; and recorded deterministic/security/browser evidence, completed GPT-5.4/Astra evaluations, all documented limitations and inconclusive cases. Milestone acceptance does not approve unresolved Scenario/Divergence drafts.

**Final GPT-5.4 live-evaluation conclusion:** the exercised synthetic cases established their tested safety/authority boundaries, including null unresolved timing/horizon, and bounded patrol/courier causal behavior. Composition still requires owner review and corrections. Successful polar logistics remains **INCONCLUSIVE** after a safe unsupported pause; its continuation remains **NOT ATTEMPTED — prerequisite continuation checkpoint was not legitimately reached**. Historical incomplete output, timeout, runner-only zero-attempt stop and Stage 1.3's unaccepted numeric timing quality remain unchanged evidence, not newly successful cases. The completed evaluation/recoveries total **10 network attempts**, nine returned identities (`gpt-5.4-2026-03-05`, high/Standard) and one historical timeout with unknown identity/usage. Known calculated charge: **$0.6306925**; unchanged timeout reservation: **$0.295760**; conservative accounting: **$0.9264525**. The final corrected ambiguity draft remains blocked and unapproved.

**Final GPT-6 Astra Stage 2 conclusion:** all **four** predeclared sequential requests completed as `gpt-6-astra` / high / Standard with valid structured responses, no retry/replacement/fallback and no active-campaign mutation. Temporal composition and its normally reviewed/approved courier resolver, Russian polar composition and Russian ambiguity composition passed the exercised safety/authority gates with documented qualifications. The courier resolver produced the same bounded relocation decision as GPT-5.4; no broader causal improvement was demonstrated. Astra's temporal draft needed an authoritative starting-position correction. Its ambiguous draft selected no Actor/Thread/Location, kept offset/horizon null and correctly blocked approval; six unanswered questions add useful duration coverage but expose the internal 43,200-minute cap and potentially unnecessary location clarification. No answers, timing confirmation, approval or resolver followed that ambiguity call. **No new production defect was observed in Stage 2.**

Stage 2 used **5,162 input tokens** (0 cached reads, 5,150 cache writes, 12 ordinary input), **6,498 output tokens**, including **3,931 reasoning tokens**, at a calculated **$0.389395** charge within the **$4.00** cap and **$3.86720** conservative envelope. No Stage 2 usage is unknown. The four corresponding GPT-5.4 samples cost **$0.370210**, used 21,439 reasoning tokens and totaled 189.765 seconds versus Astra's 151.263 seconds. Astra was faster in three samples, but slower and more expensive in corrected ambiguity. Older temporal/polar composition contracts differ; corrected ambiguity input/schema/instructions match. These limited samples establish no automatic winner, universal cost/latency superiority or equal reasoning compute.

**Evidence / verification:** every earlier status entry below remains verbatim historical context, including its then-current pending/untested statements. Original outputs, review versions, journals, charges and prior qualifications are preserved. Final local reports remain `test-results/d2a-stage1-4/D2A_LIVE_EVAL_CONSOLIDATED_SUMMARY.md` and `test-results/d2a-stage2/D2A_STAGE2_FINAL_REPORT.md`; ignored historical artifacts are neither modified nor added to this acceptance commit. No application tests, full suite, typecheck, lint, build, browser review or provider evaluation are rerun for this documentation-only acceptance. Earlier deterministic/security/browser results are accepted evidence, not fresh results for this commit.

**Limits / publication:** acceptance does not claim universal simulation correctness, unsupported mechanics, successful polar logistics, hosted Supabase behavior, physical-iPhone testing or general long-horizon world-model accuracy. PASS establishes no feast/message/notification/obedience mechanic, future knowledge or other unsupported authority. Remote main was freshly fetched and verified at `fbe44e789ff4993e76b47ad9040dca238a231292`. The owner authorizes one `DEV_STATUS.md`-only acceptance commit with the accepted implementation as its direct parent, then fast-forward-only publication from that exact main base. Preserve the original dirty checkout; verify remote head, direct ancestry, single-file diff, evidence hashes and clean integration worktree, then stop. No production code/migration/test/schema/fixture change, migration execution, deployment, provider call, D2B, Mega DM, FRAME/fal/video or other next-phase implementation is included.

---

# Development status — D2A timing review correction — offline verified, awaiting owner review

Implemented and integrated on `codex/world-lab-d2a-single-model` from exact `7037d2126c6dc422021eda809a4855c625bf032c`. The owner accepted Stage 1.3's predeclared ambiguous-composition safety/authority criterion, **not its timing/horizon quality**, and authorized this narrow offline correction. **Zero live provider calls** occurred. Remote main remains `fbe44e789ff4993e76b47ad9040dca238a231292`; the original dirty checkout's two modified files retain their recorded hashes.

**Root cause / implemented:** mandatory integer composition timing forced numeric placeholders for unresolved timing. Consequential answers were checked separately from those integers in both application and SQL approval validation. Draft/proposal offset and horizon now accept explicit null; unknown timing cannot approve. An explicit owner timing confirmation binds the exact timing description, offset, horizon and clarification answers. Changing any bound field invalidates confirmation. Answer-only edits cannot authorize either null timing or old numeric placeholders. EN/RU review keeps unknown values blank, permits saving unresolved drafts, and requires the owner to confirm resolved timing before saving the review version and approving. Natural-language authoring, immutable original proposals and the existing Scenario/Divergence authority remain unchanged. No time parser, extra AI request, service, agent or scheduling system.

**Persistence / compatibility:** existing Scenario JSON gains nullable draft timing and an optional `review.timingReview` snapshot. Additive migration **16** changes approval validation functions only, with no tables, columns, backfill or historical row writes. It was executed only on disposable PGlite databases. New approvals independently enforce the timing gate in SQL; historical approved integer data remains readable without reinterpretation. Old unambiguous compositions still approve. Old draft/approved records are not rewritten; new edits must pass the new gate. Approved run inputs remain concrete bounded integers. Resolver behavior, settlement, fences, provider/model configuration, reasoning, budgets, timeout and retry semantics are unchanged. See [exact files/contracts and review semantics](D2A_TIMING_REVIEW_CORRECTION.md).

**Fresh deterministic verification:** affected D2A suite **125 passed, zero failed**. After freezing the candidate, exactly **one complete repository suite** collected **1,108 tests: 1,107 passed, zero failed, one opt-in hosted Supabase test skipped**, in **204.656 seconds**. This used disposable databases and a credential-free loopback server serving the frozen checkout. Route type generation, non-incremental typecheck, repository-wide zero-warning source/test/config lint and production webpack build all passed. Lint command: `eslint . --max-warnings 0 --ignore-pattern "test-results/**"`; the initial unrestricted attempt found an unused import in the immutable, Git-ignored Stage 1.3 harness, which was preserved unchanged. No production rule was disabled. Generated `next-env.d.ts` was restored; the disposable verification server was stopped.

New regression coverage includes nullable who/what/when; unresolved and answer-only approval rejection; old `0`/`43200` placeholders; exact confirmation and invalidation after answer/text/offset/horizon changes; valid reviewed approval; unambiguous compatibility; old approved metadata and populated migration-15 history/read compatibility; independent SQL approval rejection; no resolver or live network during authoring/review/preparation; immutable original proposal; unchanged live and sibling projection. Existing migration-prefix 7/9/10/11/12/13/14 upgrade and D1/D2A privacy, provider, retry, detached-state and Wave 1–4 regression suites pass through migration 16.

**Evidence / boundaries:** all **339** Stage 1.0–1.3 local evidence files retain their pre-repair SHA-256 hashes; the frozen live-evaluation fixture is unchanged. All **509** frozen implementation/test/migration files remain unchanged throughout final verification. Historical evidence/charges and prior PASS/INCONCLUSIVE qualifications are untouched. This is deterministic verification, **not a new live model-quality evaluation or owner acceptance of this correction**. EN/RU actual-component rendering was tested; no new browser, hosted-Supabase or physical-iPhone claim. No real database migration/import, main change, deployment, Astra request or D2B. Stop for owner review; any later live evaluation needs separate authorization against a newly reviewed corrected candidate.

---

# Development status — D2A task-timeout recovery — verified, awaiting Stage 1.2 authorization

Implemented and integrated on existing `codex/world-lab-d2a-single-model` from exact `9c6708b5ad066699da7a60c52dc189e9421ccc0e`. The owner authorized only a narrow production timeout correction following Stage 1.1 Call 6's inconclusive 60-second timeout. **Zero live provider calls** occurred during this recovery. Remote main remains `fbe44e789ff4993e76b47ad9040dca238a231292`; the original dirty checkout's two modified files retain their recorded hashes.

**Implemented / integrated:** the existing structured requester now selects a server-owned task deadline: `world.compose` **180 seconds**, D2A simulation `world.resolve` **120 seconds**, all ordinary DM / Memory / compiler / gameplay and unaffected paths **60 seconds unchanged**. Existing timeout overrides can shorten but not exceed those ceilings. Safe attempt diagnostics include the effective deadline. Composition and simulation reuse their existing provider adapters; no provider/registry, GPT-5.4/high reasoning, input/output budget, output schema, Scenario/Divergence authority, SQL, settlement or retry change.

**Runtime compatibility checked:** both World Lab routes explicitly use Node; composition exports `maxDuration=240`, simulation `maxDuration=180`, providing 60 seconds beyond their provider deadlines for surrounding validation/persistence. The existing synchronous route/client/lease path has no shorter application deadline or wall-clock lease expiry. Both windows fit Vercel's documented 300-second Fluid limit. The production build records the exact duration exports. No hosted project configuration was available locally; hosted plan/proxy limits still require verification before any future authorized deployment. No deployment or new infrastructure was introduced. See [D2A_TIMEOUT_RECOVERY.md](D2A_TIMEOUT_RECOVERY.md).

**Deterministically verified, fresh:** final focused run **97 passed, zero failed**. After freezing the implementation/test candidate, exactly **one** complete repository suite collected **1,101 tests: 1,100 passed, zero failed, one explicitly opt-in hosted test skipped**, in **205.009 seconds**. Then route type generation, non-incremental typecheck, repository-wide zero-warning lint and production webpack build all passed. The full suite used disposable databases and credential-free loopback HTTP; implementation/test hashes stayed unchanged. Timeout tests cover exact task ceilings, clamped overrides, ordinary defaults, header/body abort, no automatic retry/fallback, no accepted composition/run or World effects, and durable timeout-pause replay after a lost receipt response. Existing model-identity, incomplete/malformed response, input/output-budget, private/future-source, save/timeline and settlement tests passed. Generated `next-env.d.ts` was restored.

**Live evidence preserved:** Stage 1.1 Calls 1–4 remain accepted live evidence with their original qualifications; Call 5 remains **NOT ATTEMPTED — prerequisite continuation checkpoint was not legitimately reached**. Original Call 6 remains **INCONCLUSIVE**, not a model-quality failure, with no returned identity/usage/proposal and its full **$0.29576** unknown-charge reservation. Known Calls 1–4 returned-usage cost stays **$0.2167175**, conservatively **$0.5124775** with that reservation. Stage 1.0 remains separate at **$0.064055** calculated charge. All 139 historical local evidence files, the historical plans/report and frozen fixture remain unchanged.

**Prepared, NOT EXECUTED:** [Stage 1.2 recovery plan](D2A_LIVE_EVAL_STAGE1_2_PLAN.md) contains only three maximum new sequential attempts: fresh frozen temporal composition, its dependent resolver after explicit human review/approval, and frozen ambiguous RU composition. Same GPT-5.4/high, standard tier, 20,000 full-wire accounting ceiling and 16,384/8,192 output caps; revised 180/120-second timeouts. Current official standard pricing gives **$0.76440** maximum new charges; proposed separate hard cap **$0.80**. No automatic retry/replacement, repeated successful cases, old-journal continuation or invented prerequisite.

**Limits / stop:** timeout headroom does not guarantee provider completion or successful causal advancement. No new live model-quality/latency evaluation, browser/physical-iPhone or hosted Supabase claim. No real migration, import, main change, Astra, D2B or other phase implementation. D2A owner acceptance remains pending. Next step: explicit owner authorization of Stage 1.2 at the reported corrected integration SHA; stop until then.

---

# Previous production correction — D2A task-budget recovery

Implemented and integrated on the existing `codex/world-lab-d2a-single-model`, continuing from `90ae12bcaec5fb961a01cd39305177130bef48d4`. This is the owner-authorized narrow production output-headroom correction following the inconclusive Stage 1.0 request. No implementation beyond this correction, no schema/migration change, no main change and **zero additional live provider calls** occurred. The original dirty checkout's two modified files retain their recorded hashes.

**Production correction:** the existing model budget function now reserves **16,384** output tokens for `world.compose`, **8,192** for D2A simulation `world.resolve`, and the accepted **4,096** for ordinary DM, Memory, compiler, gameplay World Logic and other unaffected paths. The selected reserve drives the existing Responses `max_output_tokens` and context/input admission. Production input capability remains **64,000** accounting units. Safe server attempt diagnostics record `maxOutputTokens`; provider/model registry, strict output schemas, reasoning selection, immutable Scenario/Divergence authority, D1 settlement and retry/receipt semantics are unchanged. GPT-5.4/high remains the proposed candidate for both evaluated tasks.

Changed areas: `src/lib/gameplay/dm-context.ts`, the existing DM requester diagnostic type, composer/resolver adapters, focused budget regressions and frozen synthetic evaluation fixtures. No UI correction or browser recheck was needed for this server-budget change; earlier browser results remain historical.

**Fresh deterministic verification on the frozen corrected source:**

- Focused/affected repair tests: **81 passed, 0 failed**. Four additional disposable fixture flows exercised all eight planned request slots using scripted providers; complete wire input accounting ranged from **8,365 to 8,818** units, without truncating mandatory evidence. Ambiguous approval is blocked, future-source reference remains outside Actor/resolver knowledge, active state is unchanged, and continuation replay does not call the provider or duplicate effects.
- Exactly **one fresh complete repository run after the code candidate was frozen**: **1,096 collected, 1,095 passed, 0 failed, 1 skipped**, duration **393.960 seconds**. The sole skip remains the explicitly opt-in hosted Supabase Auth/PostgREST test. Command: `node --test --test-concurrency=2 tests/*.test.mjs`, using a credential-free local production server through `PREVIEW_URL=http://127.0.0.1:4193`. The disposable server was stopped afterward. The full run includes D1/D2A authority/privacy/retry tests, historical disposable migrations, Waves 1–4 and reward/inventory/commerce/save-load regressions.
- Fresh `next typegen`, `tsc --noEmit --incremental false`, repository-wide `eslint . --max-warnings=0`, and `next build --webpack`: **all passed**. Generated `next-env.d.ts` was restored. Production/test source hashes remained unchanged during the final verification; only documentation was finalized afterward.
- Local ignored evidence: `test-results/d2a-budget-focused.log`, `d2a-budget-preflight.log`, `d2a-budget-full-suite.log`, `d2a-budget-build.log`, `d2a-budget-typegen.log`, `d2a-budget-typecheck.log`, `d2a-budget-lint.log`, `d2a-budget-frozen.json` and `d2a-budget-verification.json`. No owner credentials or real database were used by these checks.

**Revised Stage 1.1 proposal:** [D2A_LIVE_EVAL_STAGE1_1_PLAN.md](D2A_LIVE_EVAL_STAGE1_1_PLAN.md) preserves the same eight scenarios and GPT-5.4/high. A **20,000-unit evaluation-only** full-wire input ceiling fits every frozen fixture and must also be checked before each future actual request. Four 16,384-output composition attempts plus four 8,192-output resolver attempts have a conservative maximum standard token charge of **$1.87456**, within the proposed **US $2.00 hard cap** at current official pricing. No live attempt under this revised envelope is authorized or executed yet. Inputs, reasoning and output caps must not be weakened to pass preflight.

**Historical evidence:** Stage 1.0 remains a separate inconclusive production-configuration sample, not a model-quality failure or successful scenario. Its original plan/report/response/journal are unchanged, including returned model `gpt-5.4-2026-03-05`, 1,046 input / 4,096 output tokens (4,008 reasoning), and calculated **$0.064055** charge. The report and stopped journal hashes were rechecked unchanged. See [D2A_LIVE_EVAL_STAGE1_REPORT.md](D2A_LIVE_EVAL_STAGE1_REPORT.md).

**Limits and stop:** larger output allowance does not establish live composition/simulation quality or guarantee completion within the unchanged 60-second timeout. Live quality remains inconclusive; D2A owner acceptance is pending. No new browser/physical-iPhone or hosted-database claim is made. No Astra Stage 2, D2B, real-data import, deployment or next-phase work. Next step is explicit owner authorization of the revised Stage 1.1 plan, with human review before dependent simulation calls.

---

# Previous evaluation — D2A Stage 1 — stopped, inconclusive

The owner authorized the exact eight-call synthetic GPT-5.4/high plan with a hard US $2 provider-charge cap. Against implementation `69abccfc1bc41d292466246e8f1d4ade69914b8f`, only **call 1** was attempted. It returned HTTP 200 with `status=incomplete` and `reason=max_output_tokens`; the application accepted no proposal. The evaluation guard conservatively halted on the incomplete response, which the approved plan classifies as inconclusive; there was no automatic retry or budget increase. Calls 2–8, retries, fallback and GPT-6 Astra were not run.

Actual provider identity was **`gpt-5.4-2026-03-05`**, standard `default` tier. Returned usage: **1,046 input, 0 cached input, 4,096 output tokens, including 4,008 reasoning tokens**. Calculated provider charge from returned usage and rechecked standard prices: **US $0.064055**; billing invoice not queried. The approved 4,096 total output allowance left 88 non-reasoning tokens in this sample and did not complete the schema.

The exercised safety boundary held: active synthetic projection/head digest remained identical, World Lab run count remained zero, and no simulation/time/inventory/resource/reward/Event effect committed. No private/future canary leak, wrong model, fallback or state mutation was observed in this attempt. Full Stage 1 safety/authority and model-quality coverage is **not established**, because the remaining live cases were not executed. No usable proposal existed for manual correction or approval.

Production code and migrations are unchanged. Evaluation-only guard/preflight tools and synthetic evidence are ignored local artifacts. Guard tests and the real-service scripted preflight passed without live calls before the single authorized attempt; the guard enforces standard tier, eight attempts, fixed per-call budgets, durable reservations and no automatic retry. No real/hosted database migration, owner-data import or deployment occurred. The original dirty checkout and main remain untouched.

Full per-call evidence, usage, assessment and the output-headroom limitation are recorded in [D2A_LIVE_EVAL_STAGE1_REPORT.md](D2A_LIVE_EVAL_STAGE1_REPORT.md). The original [D2A_LIVE_EVAL_PLAN.md](D2A_LIVE_EVAL_PLAN.md) remains the historical approved plan; its pre-evaluation authorization wording is superseded by the owner's explicit Stage 1 authorization and this result.

**Stop:** Stage 1 is inconclusive; no retry under the original plan. A revised budget/profile and evaluation envelope need review before another attempt. Stage 2's prerequisite was not established, so no qualified Stage 2 proposal or Astra call follows. D2B and other next-phase work remain closed; D2A owner acceptance remains pending. The prior complete automated/build/browser results below are historical implementation verification, not rerun or relabelled as successful live evaluation.

---

# Previous milestone — World Lab D2A — deterministic implementation verified

Implemented from freshly fetched exact authorized main `fbe44e789ff4993e76b47ad9040dca238a231292`, including owner-accepted D1, on isolated `codex/world-lab-d2a-single-model`. Remote main remains unchanged. The original checkout still has exactly its two pre-existing modified files, `DEV_STATUS.md` and `PHASE3_EVALUATION.md`, with unchanged SHA-256 hashes; its local main remains untouched. Contextualized workers covered five isolated handoffs with Lead plus no more than three worker slots. Lead owned shared contracts, migrations, production integration, repairs and this status.

## Milestone status

- **Implemented:** natural-language What If; strict `world.compose`; manual immutable Scenario review; explicit approval and D1 preparation; one pinned `world.resolve` model; bounded typed consequences; durable model-result/retry provenance; EN/RU owner controls and safe checkpoint summaries.
- **Integrated:** composition, resolver, UI, scripted end-to-end fixtures and independent security QA, plus Lead-owned migration 15, API/service orchestration, source/knowledge guards and exact historical usage/receipt replay.
- **Deterministically verified:** fresh complete repository run **1,089 collected, 1,088 passed, 0 failed, 1 skipped**, duration **387.973 seconds**, on the final integrated production source. The sole skip is the explicitly opt-in hosted Supabase Auth/PostgREST test. Independent QA's **58/58** cases are included and passed again. Route type generation, non-incremental TypeScript, repository-wide zero-warning lint and production webpack build passed.
- **Browser checked:** final actual components/styles with synthetic scripted transport in **EN/RU at 1365×900 and 390×844**. Describe, interpret, manual edit, approval/preparation, separate start, two checkpoints, continuation, lost-response retry, pause/resume/cancel and empty/unavailable prerequisites were exercised. No horizontal overflow was observed. This is not physical-iPhone or hosted database testing.
- **Ready for bounded live model-quality evaluation:** the reviewable [D2A_LIVE_EVAL_PLAN.md](D2A_LIVE_EVAL_PLAN.md) proposes at most eight synthetic GPT-5.4/high requests with a US $2 provider-charge ceiling, explicit quality criteria and stop conditions. It is not executed or authorized.
- **Live model quality NOT YET evaluated:** no live provider/model calls, paid probes or bake-offs occurred. Scripted transport exercises the actual production request/parser/model-validation path; it does not establish real causal quality or complete resistance to model training knowledge.
- **Owner acceptance NOT YET granted:** implementation verification is separate from acceptance and paid-evaluation authorization. Stop here; D2B/comparison, Enter This World, FRAME and other later work have not started.

## What the owner can use

Open **Campaign → World / Мир → What If / Что, если**. Describe one change in ordinary language, choose a saved starting point and model, then **Interpret**. Manually correct the title, change, time/place, affected participants/Threads, assumptions, constraints, unchanged baseline and horizon; answer consequential questions; **Save corrections**. **Approve & Prepare** saves the exact approved Scenario/Divergence and prepares an isolated NON-CANON run. **Start simulation** is separate. Inspect committed history and explicitly continue, pause, resume, retry or cancel. The live campaign is never activated/restored/switched to run an experiment.

Manual corrections need no additional AI call, retain the original proposal, create immutable owner-authored versions and invalidate prior approval as appropriate. Source facts and owner assumptions remain distinct. Authority IDs, private state and raw JSON are not editing controls. The expert/reuse D1 path remains secondary. Provider charges are disclosed at the explicit Interpret/Start/Continue boundaries; page load does not execute a model.

The actual UI can be reviewed with synthetic data and no real setup. Production use would later require reviewed schema through migration 15, owner authentication and server-side provider configuration. No migration was applied to owner/production data in this sprint. See [D2A_OWNER_GUIDE.md](D2A_OWNER_GUIDE.md).

## Authority and changed areas

There remains one Scenario/Source/Canon authority, Model Runtime, World Resolver, Memory pipeline, Saves/Timelines/vault, inventory/resource/progression authority and World Event settlement. Optional composition metadata extends existing immutable Scenario versions. Migration `supabase/migrations/202609200015_world_lab_d2a.sql` adds no table or manifest family, preserves old manifest meanings/hashes, and extends the existing private operation stages and SQL validators. Historical D1 inputs retain their deterministic mode; new runs pin one profile under `single-model-world-v1`.

The production service records the model request before transport and the exact validated response before settlement. SQL independently revalidates the approved basis/profile/scope, owning-validator effects, source knowledge and full detached fence before the original vault/manifest/CAS transaction. Cancellation, lease/head changes and source/canon correction reject stale callbacks. A normal live campaign load/switch remains independent. Original receipt replay includes usage only through that operation's revision, never later progress.

Changes are in `src/lib/world-lab`, existing detached reader/writer/World Resolver and Library parsers, the one Model Runtime registry task addition, private provider/service and composition API, `src/components/world-lab`, migration 15 and focused tests. Public projections derive fixed localized summaries from committed state. There is no second narrative request or authority.

## Fresh integrated verification

- `node --test --test-concurrency=2 tests/*.test.mjs` with `PREVIEW_URL=http://127.0.0.1:4192`, using a credential-free local production build: **1,089 tests, 1,088 passed, zero failed, one hosted opt-in skip**. Local ignored evidence: `d2a-final-suite.log`. An earlier run without the required local server had connection-refused HTTP failures; the fresh complete configured run supersedes it.
- `next typegen` and `tsc --noEmit --incremental false`: **passed** after all worker integration. Generated `next-env.d.ts` was restored.
- Repository-wide `eslint . --max-warnings 0`: **passed, zero warnings**.
- `next build --webpack`: **passed**, including compilation, TypeScript and all pages/API routes. No Turbopack claim is made for the established external dependency junction.
- Disposable populated migration prefixes **7, 9, 10, 11, 12, 13 through 15**, plus D1/schema-3 run/input/receipt history through 15, passed. Old save payloads/hashes/loads and accepted Wave 4 state remain intact. No hosted migration or multi-session lock scheduling is claimed; PGlite serializes SQL.
- The real service/SQL/production-provider flow passes in EN/RU: interpret → manual edit → immutable approval → D1 prepare → two resolver continuations. Supplies change **10→8→7**, focus **6→4→3**, a supported condition is added/removed, and only the detached branch changes. Live projection/head, player state, unrelated/private families and Wave 4 definitions/receipts remain exact.
- Lost model-result and commit responses replay durable results with no extra scripted request or repeated effects. Earlier preparation/continuation receipts remain byte-equivalent after later steps, including their usage. Deterministic-only steps make zero model requests.
- Independent QA covers strict composition/model contracts, injection, positive Actor knowledge, private/future canaries, malformed/raw/foreign effects, wrong models/no fallback, cancellation/lease/head/source changes, sibling/cross-owner isolation, atomic rollback, manual immutable review, stale approval, client import boundaries and actual service DTO parsing. All eight reported defects were repaired and regressed; details are in [D2A_QA_REPORT.md](D2A_QA_REPORT.md).
- Browser observations are separately recorded in [D2A_BROWSER_REVIEW.md](D2A_BROWSER_REVIEW.md). They use the exact integrated components with public fixtures; durable SQL behavior is covered by automated tests, not inferred from that preview.

## Bounded limits

This is causal simulation over established autonomous Actors, Locations, capabilities and Threads, not arbitrary creation of a world from a premise. Admitted effects are bounded resource spending, inventory consumption, supported conditions, relocation and known-fact observation through the existing validators. Unsupported relationship/rule changes, controlled-PC decisions, missing knowledge, overlapping consequences or newly caused unsupported mandatory work pause without partial settlement. No detached rewards, commerce, new armies/Actors or character takeover is implied.

Saved World policy remains read-only in review to preserve existing overdue reconciliation; changing it requires a newly saved campaign basis. Direct authoritative observation/travel uses current positive-known facts without indirect evidence chains. Conservative composition excludes uncertain/private/future facts rather than upgrading them. The original 60-minute segment, finite horizon and 32-checkpoint budget remain. A longer requested horizon may stop at the bounded step limit.

Recorded valid response/token totals are provenance, not a billing guarantee. Missing usage remains unknown. A request whose response was lost before durable recording, or overlapping transport attempts, may incur another charge; exactly-once state settlement does not mean exactly-once billing. No unsupported claim about real model quality, hosted Supabase behavior or physical iPhone testing is made.

## Worker handoffs and stop point

All worker branches are pushed. Lead integration contains central fixes after these immutable handoffs.

| Branch | Handoff SHA |
| --- | --- |
| `codex/d2a-composition` | `0157159d5c44c22e393c55238cb743fcc8dc54ab` |
| `codex/d2a-resolver` | `75b639265cc35ed2730c068a239ce1a9b69c42df` |
| `codex/d2a-integration-tests` | `07a4cbfc6742e4ab83d3b6e136e6f59c5f518518` |
| `codex/d2a-ui` | `b1379a67c5349d0d25127b0fa312cae07ceb5bec` |
| `codex/d2a-qa` | `a4c94e9038776bf3175a7d82541bafb7dee8042c` |

Shared decisions: [D2A_CONTRACTS.md](D2A_CONTRACTS.md). Recommended next step: owner review and separate authorization of the bounded live-evaluation plan. No real request will be made before that authorization. Keep main unchanged; do not begin D2B or Enter This World.

---

# Previous milestone — World Lab D1 — owner accepted

World Lab D1 was implemented from exact authorized base `b0336cf651e8649db4c4db1aee7a73ceb39e71cd` on isolated branch `codex/world-lab-d1-detached-foundation`, leaving main and the original dirty checkout untouched. Waves 1–4 remain owner accepted. D1 is now owner accepted at exact implementation SHA `d65e5f150b52c6c1ad760c45ea80defe3d43d8c6`. The current action is limited to the status-only approval and authorized fast-forward below.

## Explicit owner acceptance and publication scope

The owner explicitly approves World Lab D1 at exact SHA `d65e5f150b52c6c1ad760c45ea80defe3d43d8c6`, accepting the detached simulation foundation, NON-CANON World Lab UI direction, deterministic execution proof, disclosed limitations and current browser-reviewed presentation. This acceptance changes only `DEV_STATUS.md` in one approval commit on `codex/world-lab-d1-detached-foundation`.

Remote main was freshly fetched and verified at exact authorized SHA `b0336cf651e8649db4c4db1aee7a73ceb39e71cd`, and the remote D1 branch was verified at the approved implementation SHA. The owner authorizes fast-forwarding main only from that base to the resulting approved D1 head. The approved implementation must remain the approval commit's direct parent and in main's direct ancestry. Publication verification checks the single-file diff, unchanged implementation, exact parent, remote integration/main SHAs and clean integration worktree. The original dirty checkout remains untouched.

Application tests, typecheck, lint and build are not rerun for this documentation-only approval. All implementation and browser results below were recorded at the accepted checkpoint; they are not fresh results for the approval commit. No force push, squash, rebase, implementation changes, migration execution, deployment, provider calls, real-data import, D2, Enter This World, FRAME or other next-phase implementation is authorized by this approval. Stop after publication verification.

## Milestone status

- **Implemented:** immutable authorized input bundles; exact detached manifest reads; private durable run/operation ledger; branch-local leases and atomic compare-and-swap commits; narrow existing World/Memory adapters; EN/RU NON-CANON owner controls.
- **Integrated:** six isolated worker branches plus Lead-owned migration 14, production service/API, campaign navigation, authority repairs and acceptance tests. Lead alone owns shared contracts, SQL, integration and this status.
- **Deterministically verified:** at the accepted implementation checkpoint, the complete repository suite passed **983 collected, 982 passed, 0 failed, 1 skipped**, against the integration checkout and a credential-free loopback production server. The skip is the explicitly opt-in hosted Supabase test. Independent adversarial QA passed 33/33 cases and those cases passed again in the complete suite. Route type generation, non-incremental typecheck, repository-wide zero-warning lint and production webpack build passed on the integrated production source. These checks were not rerun for this status-only approval.
- **Browser checked:** actual D1 components/styles with an explicitly synthetic scripted transport, EN/RU at 1365×900 and 390×844. Prepare, continue, lost-response retry, pause/resume/cancel and empty prerequisites were exercised. No horizontal overflow or browser warning/error was observed. This is separate from production SQL/API verification and is not physical-iPhone or hosted Auth/Supabase testing.
- **Not live-model-quality evaluated:** no live model/provider calls, paid evaluation, real-data migration/import, deployment or web research occurred.
- **Owner accepted:** the owner explicitly approves D1 at exact SHA `d65e5f150b52c6c1ad760c45ea80defe3d43d8c6`, including the detached foundation, NON-CANON UI direction, deterministic proof, disclosed limitations and browser-reviewed presentation. D2, comparison, Enter This World, FRAME and other future phases have not started.

Owner instructions: [D1_OWNER_GUIDE.md](D1_OWNER_GUIDE.md). Independent adversarial findings: [D1_QA_REPORT.md](D1_QA_REPORT.md). Separate browser evidence: [D1_BROWSER_REVIEW.md](D1_BROWSER_REVIEW.md). Minimum shared contracts and final bounded decisions: [D1_CONTRACTS.md](D1_CONTRACTS.md).

## What can be used

Open **Campaign → World / Мир → What If**. Choose an eligible exact saved checkpoint and an existing approved Scenario/Divergence pair; review the starting point, public assumptions and finite horizon; prepare a labelled **NON-CANON / НЕ КАНОН** experiment. Inspect its chronological checkpoints and explicitly continue, pause, resume or cancel. An interrupted request retains its exact operation for retry. There is no automatic simulation on page load.

The detached timeline never becomes the playable campaign. The ordinary Game, Inventory and Saves continue using their own active state. Simulation timelines cannot be activated through the Save API and are excluded from playable timeline choices. The UI displays public observations without raw source IDs, manifests, private event titles/counts, resolver diagnostics or editable authority fields.

D1 executes only already configured deterministic World schedule steps. Scenario/Divergence prose is pinned for future D2; it is not interpreted as generative simulation. Existing resolver-required work, unsupported consequences, controlled-player decisions, missing knowledge or warning requirements pause at the last coherent checkpoint. A normal live campaign load/switch does not invalidate an otherwise valid detached run.

## Authority and integration

Migration `supabase/migrations/202609200014_world_lab_d1.sql` adds simulation purpose/head revision to the existing timeline authority, explicit schema-3 run association to immutable manifests, and small private run/operation tables. It reuses the same vault/version rows, World Events, World settlement validators, Library Scenario/Divergence authority and Memory retrieval. It creates no second save system, world database, inventory, wallet, reward ledger, DM, Memory index or orchestration service.

Preparation resolves authorized references on the server and independently revalidates them in SQL. The immutable digest covers the exact source checkpoint, Scenario/Divergence, included Pack/source/document versions, effective saved profile/settings/guidance, correction generation, deterministic resolution policy and finite time horizon. Source text and premise prose remain data. The browser cannot supply arbitrary private records, source lists, manifests, policy or commit plans.

Every detached continuation validates the expected branch head and full branch-local fence, including lease generation and immutable input/source basis. SQL independently derives the allowed schedule transition from exact vault rows, then atomically appends versions/checkpoint, swaps only that simulation head, and records the operation. Failed validation or CAS leaves no partial mutation. Cancellation/replacement/head changes/source invalidation reject stale callbacks. Exact committed retries return their original coherent operation result even after later progress; normal inspection separately returns current history.

The narrow write set is World foundation state/revision, explicit runtime time/revision, and typed World Events. Inherited Wave 4 inventory/resources, progression/reward receipts, commerce state and private rows remain exact. No detached shopping/reward execution is implied. Unchanged-time no-op work creates no extra manifest/version, performs no model work and advances no time. Wall-clock timestamps are audit metadata only.

Exact manifest/source/document membership, current restrictions and positive Actor knowledge are checked before the existing Memory ranking/limits. Public projections apply current restrictions even when showing a historical operation receipt. Saved schema-1/schema-2 meanings and family inventories remain unchanged; historical payloads/digests are not rewritten, and historical saves contain no fabricated Lab runs.

Changed areas: `src/lib/world-lab`, the detached Save reader/fence/contracts, the World Lab component/client/translations, private service/API, campaign shell/navigation, migration 14, focused D1 tests and owner/QA/browser documentation. Existing accepted architecture and runtime/provider registry remain intact.

## Recorded implementation verification and repairs at the accepted checkpoint

- `node --test --test-concurrency=2 tests/*.test.mjs`, with `PREVIEW_URL=http://127.0.0.1:3097` pointing to a credential-free built application: **983 tests, 982 passed, 0 failed, 1 skipped**, duration **159.155 seconds**. The sole skip is the opt-in hosted Supabase Auth/PostgREST test, not counted as passed. Existing Phase 0–3.5 and Wave 1–4 regressions, actual D1 HTTP boundaries, deterministic service/SQL proof, privacy/import checks and historical upgrades are included. Ignored local evidence: `test-results/d1-verification/full-suite.log`.
- Route type generation plus `tsc --noEmit --incremental false`: **passed** on final integrated production source.
- Repository-wide ESLint `. --max-warnings 0`: **passed, zero warnings**, without an additional generated-file exclusion in the integration worktree.
- `next build --webpack`: **passed** compilation, TypeScript and page/route generation. The existing external `node_modules` junction requires the established webpack build path; default Turbopack success is not claimed.
- Independent QA: **33 passed, 0 failed, 0 skipped**. Actual SQL/service tests exercise exact membership, sibling branches/campaigns, losing CAS callbacks, stale leases/heads, cancellation, response loss, original receipts, injected rollback after vault insertion, no-op time, private/future-source canaries and positive Actor knowledge before retrieval limits. Client imports do not reach server/private/provider modules.
- Disposable historical upgrades cover populated migration prefixes **7, 9, 10, 11, 12 and 13 through 14**. Genuine schema-1 and pre-Wave-4 schema-2 payloads, hashes, manifests, save points and old loads are preserved. Prefix 7 predates Saves and verifies populated application state plus post-upgrade Save access.
- The deterministic production service/SQL proof prepares a branch, reads its exact inherited state, commits two bounded continuations, reloads checkpoint history and retries original operations without replay. Independent tests preserve all 40 live capture families plus active timeline/head/epoch authority and nonempty Wave 4 currency, inventory, rewards, progression/pending choices and private state.
- Separate browser checks are recorded in `D1_BROWSER_REVIEW.md`. Subsequent error-envelope, inherited-event timestamp and Save-label/history-size repairs have actual service-to-browser regression coverage; the browser fixtures did not exercise those boundary cases.

Lead repaired all nine material findings in the independent report, including span-digest validation, a no-time trigger bypass, null lifecycle revisions, SQL payload ambiguity, unresolved Pack rejection, original retry results and browser/server contract bounds. No unresolved material defect was observed in the exercised D1 boundaries. Verification does not establish hosted multi-session lock behavior: PGlite serializes SQL submissions, so its race test proves rejection of the second proposal from one head rather than hosted lock scheduling.

## Worker handoffs

Six distinct workstreams reused three worker slots alongside Lead. Domain/security used Astra Max; bounded UI used Astra Extra High. Workers stayed in isolated branches/worktrees and Lead alone integrated them. Central repairs are in the integration branch after these handoffs.

| Worker branch | Integrated handoff SHA |
| --- | --- |
| `codex/d1-reader` | `8091dd2d51b93ef1da9588a48d6b6bdc3f573919` |
| `codex/d1-writer` | `24ba599bd81c897e6fd425fc4e7e1d20fd52cb3d` |
| `codex/d1-inputs` | `6e9bc63cd4be068382ebf7ab6c8b3e85df3be67c` |
| `codex/d1-runtime` | `a8b6b12f345e0bdaa7e8161720bf618e857861ae` |
| `codex/d1-ui` | `36426f17d97cc1b701704d2beefb98875ef907e2` |
| `codex/d1-qa` | `ce7e93c466d59949b4aa6f980ab8eb486aacdc0d` |

## Limits and stop point

Eligible preparation requires a stable, configured schema-2 World save without pending/retryable action and compatible approved Scenario/Divergence inputs. D1 does not add full Scenario Composition or automatic approval. Older saves remain loadable; they may need an explicitly configured new checkpoint before preparation. Unresolved included Pack contradictions are rejected.

Each continuation advances at most 60 fictional minutes, within a horizon of at most 43,200 minutes and at most 32 coherent continuation checkpoints. Larger horizons may stop at the work limit. Only the accepted deterministic schedule subset executes; arbitrary premise consequences and richer typed action effects pause. D1 inherits Wave 4 state exactly without implementing a detached economy. It neither activates nor promotes, merges or rebases simulation checkpoints.

The local synthetic component preview requires no owner database or provider. Production use needs a separately authorized migration/configuration release process, not performed here. No live-model quality, hosted Supabase/Auth behavior or physical-iPhone result is claimed. The owner has accepted D1 and its disclosed limits at the exact checkpoint above. The only authorized next step is publication of this single status-only approval commit and the fast-forward from `b0336cf651e8649db4c4db1aee7a73ceb39e71cd`, followed by verification and a stop. The two pre-existing dirty files in the original checkout retain their recorded hashes. D2, Enter This World, FRAME and any other next phase require separate authorization.

---

# Previous milestone — Production Foundation Wave 4 — owner accepted

Started September 20, 2026 from freshly fetched exact remote main `7f4b65ea60e0e497f27528c9efcf73ececa6e360` in isolated branch `codex/production-foundation-wave4`. Implementation left main at that base and the original dirty checkout untouched. Waves 1–3 remain owner accepted; Wave 4 is now owner accepted at exact SHA `38e6ef22138412ed29b4999126000e5c2a6f287c`.

Implementation checkpoint: September 20, 2026. The bounded playable-world, rewards/progression and commerce foundation is implemented and integrated. This is not Phase 4 / FRAME. The integration and six worker branches were published for owner review. The approved implementation checkpoint is `38e6ef22138412ed29b4999126000e5c2a6f287c`; the current action is limited to the status-only approval and authorized fast-forward below.

## Explicit owner acceptance and publication scope

The owner explicitly accepts Production Foundation Wave 4 at exact SHA `38e6ef22138412ed29b4999126000e5c2a6f287c`, including playable-world preparation, rewards/progression, commerce/trade, natural-language action integration, disclosed limitations and the current UI direction. Waves 1–3 remain accepted. This acceptance changes only `DEV_STATUS.md` in one approval commit on `codex/production-foundation-wave4`.

Remote main was freshly fetched and verified at exact authorized SHA `7f4b65ea60e0e497f27528c9efcf73ececa6e360` before this approval. The owner authorizes fast-forwarding main only from that SHA to the resulting approved Wave 4 head. The accepted implementation checkpoint must remain the approval commit's direct parent and in main's direct ancestry. Publication verification checks the single-file diff, unchanged implementation, exact parent, remote integration/main SHAs and clean integration worktree. The original dirty checkout remains untouched.

Application tests, typecheck, lint and build are not rerun for this documentation-only approval. All implementation and browser results below were recorded at the accepted checkpoint; they are not fresh results for the approval commit. No force push, squash, rebase, implementation changes, migration execution, deployment, provider calls, real-data import, World Lab, Enter This World, FRAME or next-wave implementation is part of this approval. Stop after publication verification.

## Milestone status

- **Implemented:** explicit approved-Pack preparation; owner-editable Actors/capabilities/Threads and merchant participation; bounded rewards, progression and advancement choices; profile currencies, buy/sell/barter and valuation; normal Game price inquiries, negotiation and theft/robbery proposals.
- **Integrated:** all six isolated worker branches, Lead-owned migration 13, normal turn/World Event settlement, save/timeline integration, application routes and existing shell surfaces. Lead repaired production defects centrally.
- **Deterministically verified:** recorded implementation suite **863 collected, 862 passed, 0 failed, 1 skipped**, plus passing typecheck, repository-wide zero-warning lint and production build. Disposable legacy/Wave 1/2/3 upgrades, the full objective-to-reward-to-trade loop, privacy/import checks and scripted provider transports are included. These checks were not rerun for this status-only approval.
- **Browser checked:** actual components/styles and pure planners using synthetic process-memory fixtures in EN/RU across desktop and 390×844 mobile viewports. Manual edits, exchanges, advancement, retry and timeline freezing were exercised. This is not hosted database/Auth verification or physical iPhone testing.
- **Not live-model-quality evaluated:** no live provider/model calls, paid evaluation, real database migration, real/private data import, web research or deployment.
- **Owner accepted:** the owner explicitly approves Wave 4 at exact SHA `38e6ef22138412ed29b4999126000e5c2a6f287c`, including the implemented functionality, disclosed limitations and current UI direction. Waves 1–3 remain accepted. A/B/C are not declared universally complete. World Lab, Enter This World, FRAME and next-wave implementation have not started.

Owner instructions: [WAVE4_OWNER_GUIDE.md](WAVE4_OWNER_GUIDE.md). Separate browser evidence: [WAVE4_BROWSER_REVIEW.md](WAVE4_BROWSER_REVIEW.md). Frozen ownership and final additions: [WAVE4_CONTRACTS.md](WAVE4_CONTRACTS.md). Independent security findings: [WAVE4_QA_REVIEW.md](WAVE4_QA_REVIEW.md).

## What is usable

- **Campaign Settings → World Packs → Prepare for campaign:** review a selected subset of an approved, explicitly pinned Pack. Edit display names, aliases, bounded kinds, public descriptions, capabilities/limitations, Thread title/goal/policy, and merchant participation/label before creation. Preparation records exact Pack/source provenance and stable campaign identities. Corrections preserve history; repeated preparation does not duplicate entities. Private/future-source content remains excluded. Existing inventory/storage controls supply possessions and merchant stock rather than inventing them from prose.
- **Campaign Settings → foundation settings:** configure profile-owned currency labels/resources, item valuations and restrictions, merchant stock sources/availability/funds/capacity/modifiers/stolen-item policy, progression tracks, approved reward definitions and bounded manual progress corrections. Inputs are named fields rather than editable authority IDs or JSON. Definitions and corrections remain versioned through existing events/commands/save history.
- **Inventory → Trade:** choose quantities on either side, review a frozen quote, and confirm a purchase, sale or barter. Stock, ownership, payment, restrictions and merchant policy commit atomically. Stale quotes fail without repricing or partial transfer. Lost replies retain an exact retry; timeline changes freeze old forms. Currency is defined by the active profile, not a universal gold balance.
- **Character → Progression:** claim eligible approved rewards, view configured tracks and pending advancement, and choose a supported capability when required. Classic-XP, milestone and generic tracks have deterministic fixtures; Off/zero-track mode suppresses progression without losing eligible item/currency rewards. One source entitlement pays at most once; forks inherit committed receipts and isolate later ones.
- **Normal Game composer:** free-form price inquiries, offers, negotiation and theft/robbery remain ordinary actions. The existing DM/World Logic runtime may supply strict semantic proposals; trusted validators derive money, quantities and effects from approved definitions, recorded checks and established capabilities. Theft cannot use a privileged trade API. Successful transfers retain stolen provenance; failures produce no partial transfer. No HP/d20 assumptions are added to World Logic.

## Authority, integration and repairs

Migration `supabase/migrations/202609200013_production_wave4.sql` adds a nullable versioned `loop_state` to the existing `world_foundations` save family and the bounded merchant-storage kind. Currency balances remain `Entity.resources`; stock remains ordinary `Item`/`Storage`; reward receipts remain private World Events and exact operations remain existing command receipts. There is no second inventory, wallet, reward ledger, Actor database, DM, Memory pipeline or save engine. Migration 13 was executed only in disposable synthetic PGlite databases.

Normal Game foundation proposals use the existing runtime task boundaries. Their exact typed checkpoint, original action/checks and campaign/head/timeline/epoch fences are retained through retry. Ordinary resolution, foundation transfers, receipts, World Events and the final autosave commit in one transaction. Stale staged foundation proposals fail safely rather than being rebased or force-applied. Public narration sees only approved public result text; private options, detection data and receipts stay server-side.

Changed areas: new `foundation-loop`, `playable-world`, `progression`, `commerce` and `foundation-actions` modules; their owner/player components; existing gameplay/production/provider adapters, persistence shell/routes and localization; migration 13; focused domain, SQL, provider, UI and independent QA tests. Shared inert field parsing was separated from private Library modules to preserve client import boundaries.

Independent QA reproduced and verified central fixes for hidden merchant stock and private reward references, unsafe ruleset switching after loop configuration, unchanged preparation, inconsistent progression bounds, unordered history, and forged trade/reward plans. SQL now independently checks payment, stock debit, transfer identity, reward totals, pending choices and unchanged unrelated state. The final full suite reruns all independent QA cases after the final repairs. Browser review also caught an unsaved Pack draft being reloaded on language switching; the corrected editor preserves the draft and renders status/errors in the current language.

## Recorded implementation verification at the accepted checkpoint

- `node --test --test-concurrency=2 tests/*.test.mjs`, with a credential-free loopback application server for existing HTTP checks: **863 tests, 862 passed, 0 failed, 1 skipped**, duration **113.987 seconds**. The sole skip is the explicitly opt-in live Supabase Auth/PostgREST test; it is not counted as passed. Phase 0–3.5 and Waves 1–3 regressions are included.
- Route type generation and non-incremental TypeScript `--noEmit`: **passed**. The final production build also completed TypeScript validation.
- Repository-wide ESLint `--max-warnings 0`: **passed, zero warnings**, including the finalized local verification helpers.
- `next build --webpack`: **passed** compilation, TypeScript, page generation and route generation. The existing external `node_modules` junction prevents default Turbopack use; webpack builds the same source without changing dependencies/configuration. No default Turbopack success is claimed.
- Disposable PGlite upgrades from migration prefixes **1–9, 1–10, 1–11 and 1–12 through 13** preserve old records, manifests, digests, source/Pack pins and immutable vault history. Missing/null loop state restores as empty/off without fabricated receipts.
- The deterministic complete loop executes an actual normal Game objective resolution, claims approved rewards into ordinary inventory/resources, trades a rewarded item, saves/loads, retries without duplicate grants and checks pre/post-reward fork isolation. Normal Game SQL cases cover console-basic and World Logic, paid trade, quote, haggle, theft/robbery, failure/rollback, closure, one final autosave and duplicate callbacks.
- Security cases cover owner/campaign isolation, private/future sources and hidden stock, RLS/runtime/Memory projections, forged service plans, controlled-PC agency, wrong currency/ownership, stolen/quest restrictions, quantity races, price changes, stale heads/timelines/epochs, progression Off/thresholds/choices, exact entitlements, prompt/proposal boundaries and provider no-fallback. Browser client imports do not reach private planners/service authority. Providers are scripted; no live requests are used.
- Separate browser verification exercised EN/RU purchases/sales, progression and manual preparation/configuration edits, lost-reply retry, unavailable/insufficient-funds cases and timeline freezing. No horizontal overflow was observed at 390×844. Details and synthetic-only boundaries are recorded in `WAVE4_BROWSER_REVIEW.md`.

## Worker handoffs

Astra Max was used for domain/actions/security work; bounded UI used Astra Extra High. Three worker slots were reused alongside Lead. All workers had separate branches/worktrees and exclusive ownership; Lead alone merged, owned SQL/shared surfaces and updated this file.

| Worker branch             | Integrated handoff SHA                     |
| ------------------------- | ------------------------------------------ |
| `codex/wave4-preparation` | `81bd38dce417fbcdc80f3f9a5559b8fdd0618798` |
| `codex/wave4-progression` | `a12587fa6919b4eec4901c59b7c0554e66be86af` |
| `codex/wave4-commerce`    | `551ad016d7e356ca1f5931591ae1b80a1f770493` |
| `codex/wave4-ui`          | `54b7051dd7e89590995f1d65ab646b33c3924b87` |
| `codex/wave4-actions`     | `4726ebb31d18b0020c13b8ba3c2886f3996cb5c2` |
| `codex/wave4-qa`          | `aa1b82ddddb0507b4babba80b2036c4ddc3c130f` |

## Accepted limits and publication stop

This establishes bounded playable-world, progression and economy authorities and proves their joined loop. It does not implement every RPG rule or complete all A/B/C product scope. Preparation selects eligible public Pack content; it does not automatically extract arbitrary possessions/relationships or transfer control to canon characters. Stock and mechanics need explicit owner definitions. Rewards use approved fixed definitions tied to supported completed quests, resolved Threads or eligible committed World Events; no general encounter valuation/pacing engine or official D&D 5e progression is claimed. Advancement grants bounded capabilities, not arbitrary prerequisite graphs or a universal reputation system.

Commerce supports explicit profile resources, values and coarse merchant availability/modifiers. No universal currency, continuous economy, autonomous merchants or general crime/wanted simulation is added. Once loop definitions/state exist, changing the active ruleset is blocked to protect balances/history; profile migration is not implemented. Unsupported/ambiguous Game consequences pause, and materially stale foundation stages require review/new action rather than forced continuation. Live model quality and hosted Supabase/Auth behavior remain unevaluated in this sprint.

The owner has accepted the implementation and disclosed limits at the exact checkpoint above. The only authorized next step is publication of this single status-only approval commit and the fast-forward from `7f4b65ea60e0e497f27528c9efcf73ececa6e360`, followed by verification and a stop. Real use would require a separate migration/configuration release process, which is not executed here. The original checkout's two pre-existing dirty files retain their recorded hashes. World Lab, Enter This World, FRAME and another wave require separate authorization.

---

# Previous milestone — Production Mega Coding Sprint, Wave 3 — owner accepted

Started September 20, 2026 from exact authorized remote main `b7b065726ac1e0f64056e1970c8390f8448b4875` in isolated branch `codex/production-mega-sprint-wave3`. Waves 1 and 2 remain owner accepted. The original dirty checkout is untouched.

Updated September 20, 2026. Owner-approved Wave 3 checkpoint: `5a4feaf8261ed2640540fdf1d61374e5935eb2d7`. Initial implementation and independent QA checkpoint: `1763cd4820e14cd9cfd6633284ded2d7aa6460d6`; initial verified handoff: `bc72e04cc3d68aec6ab18b272eaca1ceb27fb27f`. The accepted checkpoint includes the owner-control completion pass below. Remote main was fetched and verified at exact authorized base `b7b065726ac1e0f64056e1970c8390f8448b4875` before this status-only approval.

## Explicit owner acceptance and publication scope

The owner explicitly accepts Wave 3 at exact SHA `5a4feaf8261ed2640540fdf1d61374e5935eb2d7`, including the implemented functionality, disclosed limitations, UI direction and owner-control completion pass. Waves 1 and 2 remain owner accepted. This acceptance changes only `DEV_STATUS.md` in one status-only approval commit on `codex/production-mega-sprint-wave3`.

The owner authorizes fast-forwarding remote main only from `b7b065726ac1e0f64056e1970c8390f8448b4875` to the resulting approval commit. The accepted implementation checkpoint must remain the approval commit's direct parent and in main's direct ancestry. Verification checks the single-file diff, unchanged implementation tree, one direct approval commit, remote branch/main SHAs and clean integration worktree. The original dirty checkout remains untouched.

Application tests, typecheck, lint and build are not rerun for this documentation-only approval. All results below are recorded implementation verification, not fresh results for the approval commit. No force push, squash, rebase, implementation change, migration execution, deployment, provider call, real-data import, World Lab, Enter This World or next-wave implementation is authorized by this acceptance. Stop after publication verification.

## Owner-control completion pass — owner accepted

Implemented and integrated by Lead: guided Pack review now offers **Edit identity** for entity display name, aliases and the existing bounded type; unknown items have an optional **Owner note / resolution**. Existing source text, descriptions, Pack/claim text, contradiction resolution, refinement instructions and campaign premises remain manually editable. EN/RU labels and the existing responsive styling are preserved. No AI request is necessary for these corrections.

The existing `pack.save` authority creates a new immutable draft with the same canonical IDs, membership, structural links, source/evidence references and compiler provenance. Review acknowledgements/Canon selections are cleared in the editor, and persisted approval is removed with every claim reset to Reference. Notes remain owner-authored reference, preserving the original unknown question; they never publish Canon or become external source facts. Historical versions remain readable, pending stale edits fail, retries do not duplicate versions, later refinements retain corrections, and approved campaign pins do not advance. No migration or architecture change was required.

Changed areas: guided review/Pack editor, client command allowlist and EN/RU vocabulary, owner command validation and optional Pack unknown-note parsing, focused UI/domain/SQL regressions, owner guide and this status/addendum. IDs are not displayed as editable controls. The server rejects entry replacement/addition/removal, extra structural fields, invalid type/length/alias values and attempts to rewrite unknown questions or their entity links through notes.

Recorded completion-pass verification at the accepted implementation:

- **199/199 tests passed, 0 failed, 0 skipped** in **32.769 seconds**: every `wave3-*.test.mjs`, Wave 2 Library/compiler/privacy tests, and Wave 1 Library/Pack/legacy-import boundary tests. Includes eight new regression cases, expanded SQL immutable-edit/approval/pinning checks, disposable migration upgrades and the existing compiler, premise, consequence, reconciliation and recovery flows. The earlier complete-suite result below is historical, not claimed as a fresh full-suite run for this pass.
- Route type generation plus TypeScript `--noEmit`: **passed**.
- Repository-wide ESLint `--max-warnings 0`: **passed, zero warnings**.
- Production build `next build --webpack`: **passed** with the same documented dependency-junction limitation for default Turbopack.
- Separate synthetic browser check: manually changed name, multiline aliases, entity type and unknown note in English at 1440×960, saved a new draft, then saved Russian corrections at 390×844. Verified the earlier version kept its original name/type/note and disabled editing; both corrected versions remain in history. No horizontal overflow was observed on mobile. Actual current components and the in-memory authoring service were used; no live database/provider or physical iPhone result is claimed.

No live model-quality evaluation, provider call, real-data import, real database migration, deployment, main change or Wave 4 work occurred during the completion pass. This pass is implemented, integrated, deterministically verified and browser checked, and is now **owner accepted** as part of exact checkpoint `5a4feaf8261ed2640540fdf1d61374e5935eb2d7`. No additional setup beyond the previously disclosed Wave 3 release requirements is introduced. Publication is limited to the status-only approval and authorized fast-forward described above.

## Milestone status

- **Implemented:** bounded natural-language World authoring, assisted compiler proposals, guided Pack review, campaign premises, typed World Logic consequences and overdue reconciliation.
- **Integrated:** all six worker handoffs, Lead-owned shared contracts, additive migration 12, application wiring and central production repairs in the isolated integration branch.
- **Deterministically verified:** the recorded complete suite and completion-pass regressions, disposable migration upgrades, typecheck, repository-wide zero-warning lint, production build and privacy/import analysis passed at their documented implementation checkpoints. The exact results and boundaries are below; these checks were not rerun for the status-only approval.
- **Browser checked:** actual application components with synthetic data and scripted responses, in English and Russian at desktop 1440×960 and mobile 390×844 viewports. No horizontal overflow was observed in the checked flows. This is not physical iPhone testing or authenticated live-database testing.
- **Not live-model-quality evaluated:** no live provider/model requests, paid evaluation, real database migration, real source/campaign import, web research or deployment occurred.
- **Owner accepted:** the owner explicitly approves Wave 3 at exact SHA `5a4feaf8261ed2640540fdf1d61374e5935eb2d7`, including its implemented functionality, disclosed limitations, UI direction and owner-control completion pass. Waves 1 and 2 remain accepted. A/B/C are not declared fully complete. World Lab, What-If, Enter This World and Wave 4 remain unstarted.

Owner instructions: [WAVE3_OWNER_GUIDE.md](WAVE3_OWNER_GUIDE.md). Frozen ownership: [WAVE3_CONTRACTS.md](WAVE3_CONTRACTS.md). Independent security review: [WAVE3_QA_REVIEW.md](WAVE3_QA_REVIEW.md).

## What is usable

- **World Library → Describe From Scratch** preserves exact multiline EN/RU owner text, language, digest, evidence locators and immutable provenance as an authored premise, never an external source fact. Upload Sources and Combine share the existing Source Store/compiler. TXT/Markdown remain the supported local formats; Research is visibly unavailable.
- **Configured model assistance** uses the existing Model Runtime through the strict `canon.compile` task. The configured application model is pinned to the job; bounded structured entities, relationships, geography, timeline, rules, assumptions and gaps stop for review. Explicit request/retry checkpoints prevent automatic invocation or fallback. Deterministic/scripted providers cover the complete flow.
- **Guided Pack review** presents people, factions, places, assumptions, source priority, evidence, contradictions, unknowns and coverage before approval. Owners can edit, reject, keep uncertainty, select eligible Canon claims or ask for refinement. Immutable history, explicit approval and separate campaign pinning remain authoritative. Corrections invalidate stale pending work; newer source versions never repin a campaign.
- **Create campaign / Campaign Settings → Campaign premise** provides a substantial free-form field backed by the existing versioned document authority. Save, review, paginated history, restore-as-new-version and exact-operation retry preserve original wording and provenance. The premise is advisory; it neither applies structured settings nor enters DM context/Memory or campaign-state rollback.
- **World Logic** accepts free-form actions without mandatory HP, d20, classes or initiative. Typed v2 consequences cover established travel, autonomous actor relocation, exact public observations, owned inventory consumption, established integer resource spending, a bounded physical-condition vocabulary and open objective completion, alongside existing Thread/Hook/warning progression. Server and SQL independently validate settlement, source/current-state evidence, bounds and controlled-PC agency. Ambiguous or unsupported proposals pause without applying state.
- **AI, World & Rules → Before the world resumes** requires an explicit prospective restart choice when simulation/deadline policy expands. Owners select a fictional-time allowance and acknowledge the restart. Saving advances no events, reveals no private schedules and applies no overdue backlog. Active schedules and warning opportunities remain intact; autonomy does not bypass deadline policy.
- **Staged recovery** also handles equivalent restored snapshots whose unordered record collections arrive in a different order. Original checks, stages, event identities, ordered history and captured proofs are preserved. Materially changed authority still requires review; typed costs/effects commit once after valid continuation across save/head/load/branch/epoch changes.

## Authority and changed areas

Lead owns the only additive migration, `supabase/migrations/202609200012_production_wave3.sql`. It extends the existing document-purpose/version commands for premises, validates typed world settlement, applies prospective policy reconciliation and independently reconstructs initial compiler Pack claims, evidence, coverage and privacy constraints. Existing saves, readers, source history and campaign pins are preserved. It was applied only to synthetic disposable PGlite databases.

Changed areas include `src/lib/world-library`, `rulesets/world-logic*`, `world/resolver*`, `world/reconciliation*`, the existing model-runtime/production adapters and turn bridge, campaign premise and Library client components/locales, application routes, migration 12, deterministic tests and review documentation. Public premise input validation is isolated from private modules. Identity, Canon/source provenance, rulesets, provider profiles, campaign/character/inventory state, World Events, Memory and Saves/Timelines retain one authority each. No dependency, backend, agent framework, second DM or deployment configuration was added.

Independent QA reproduced four defects, all repaired centrally and reverified: wrong/missing provider response model identity; stripping typed resolver metadata to reach a legacy validation path; JSON numeric strings accepted as quantities; and initial assisted Pack origin/privacy tampering at the SQL boundary. SQL now verifies the bounded compiler derivation before the first immutable draft is inserted. No outstanding reproduced QA defect remains.

## Initial Wave 3 integrated verification — before the owner-control pass

- `node --test --test-concurrency=2 tests/*.test.mjs`: **673 collected, 672 passed, 0 failed, 1 skipped**, duration **78.539 seconds**. The skip is the existing opt-in live Supabase test; it is not counted as passed. This run includes Phase 0–3.5 and Wave 1–2 regressions and the Wave 3 integration/QA additions.
- `next typegen` followed by TypeScript `--noEmit`: **passed**. Independent QA also passed a non-incremental integration typecheck.
- Repository-wide ESLint `--max-warnings 0`: **passed, zero warnings**, rerun after the disposable browser harness was finalized.
- Next.js production build `next build --webpack`: **passed**. Default Turbopack rejects this environment's external `node_modules` junction; webpack builds the same application without changing dependencies or project configuration. A default Turbopack success is not claimed.
- Disposable PGlite applies migrations 1–12 and upgrades populated legacy/v1, Wave 1 and Wave 2 states. Four dedicated upgrade cases preserve manifests, hashes, document history and Pack/source pins, including a pending Wave 2 stage recovered after upgrade and save fork. Other SQL cases cover atomic rejection, owner/campaign isolation, duplicate operations, legacy saves and timeline/head/epoch fencing.
- The suite exercises authored source → scripted assisted compilation → review → explicit Canon → immutable Pack → campaign pin; EN/RU premise save/review/restore/history; typed action and action-plus-resolver settlement without HP/d20; prospective overdue reconciliation; and typed continuation after manual save or load/branch with no provider replay, reroll, repeated costs or duplicate events.
- Privacy/security coverage includes source/prompt injection as data, private/future evidence, cross-owner/campaign records, model no-fallback and response attribution, stale approvals/source correction, immutable history, controlled-PC protection, public World Event filtering and current/legacy client import graphs. Independent QA's final focused run passed **34/34 owned tests plus 4/4 integration/boundary cases**; those counts are separate from, and included in, the complete suite.
- Git whitespace checks pass. Generated `next-env.d.ts` output is restored rather than committed. The original checkout's two pre-existing dirty files remain untouched; their recorded SHA-256 hashes are checked again during publication verification.

## Separate browser review

The ignored local harness at `test-results/wave3-owner-review` imports current application components/styles. It uses in-memory synthetic records and a scripted compiler provider, an allowlisted credential-free environment and outbound-network guards. It runs locally at `http://127.0.0.1:3093/preview/owner`. The toolbar and turn-state selectors are demo-only. This loopback URL is for the host computer, not a phone's `127.0.0.1`.

- **Library:** saved exact English and Russian multiline descriptions; completed the explicit scripted assisted-job lifecycle in English; materialized, reviewed unknowns/coverage and approved a reference-only immutable Pack without selecting Canon. Inspected evidence/edit controls, assumptions, source priority, coverage, unknowns and the separate Canon/approval summary in both languages. Creation modes and description/Pack panels fit desktop and mobile layouts.
- **Premise:** saved an English draft, explicitly reviewed it into a new version and loaded older history through the original version. Saved Russian text with a simulated lost response, observed frozen editing and recovered the same version through retry without duplication. Inspected campaign-creation forms and existing-campaign panels in both languages and viewport sizes. Browser creation-form checks did not submit a new campaign; its persistence is covered by deterministic SQL tests.
- **Reconciliation:** changed Off to On/increased pressure, observed Save disabled before consent, chose future allowances and saved acknowledged changes in English and Russian. Inspected the explanation and controls at both widths. Actual schedule settlement is verified in the disposable SQL tests, not inferred from this synthetic settings API.
- **World Logic/recovery:** inspected completed, resumable, review-required, missing-evidence and unsupported-effect states in EN/RU, including mobile presentation. These are scripted display scenarios; engine/dice/model execution is not claimed as browser verification.

Campaign Pack binding is intentionally blocked in the synthetic harness; its real authoring-to-pin database path passes deterministic tests. Early disposable-preview hot-reload/state-reset problems were repaired in the ignored harness, then the affected click-throughs were repeated against a frozen production build. No production-code change was needed for those harness problems. No physical iPhone, live Auth/Supabase or live model-quality result is claimed.

## Worker handoffs

Requested Astra reasoning was used: Max for difficult compiler/logic/security/integration work, Extra High for UI work. Three worker slots were reused alongside Lead; each workstream had isolated branches/worktrees and exclusive ownership. Lead alone integrated and repaired shared production surfaces.

| Worker branch | Final handoff SHA |
| --- | --- |
| `codex/wave3-compiler` | `11c5478ab5688fa69411387e63750cec51f0589b` |
| `codex/wave3-logic` | `cbc0ebbbb823555cf0b76306b895ad14b89961f8` |
| `codex/wave3-reconciliation` | `4cdc1156bdedf0ddc6a84b227d8a0cccb032ca85` |
| `codex/wave3-premise-ui` | `a8038389cd32ff5aef542ed1c104816729d4f88a` |
| `codex/wave3-library-ui` | `c27a54264d00a3b2fedca3fd3f07fb276b40f163` |
| `codex/wave3-qa` | `ba71fbe13062432ce5f061b0a609f561f220124f` |

## Remaining limits and next step

Natural-language output quality is not live-evaluated; bounded TXT/Markdown inputs and model proposals always need owner review. Pack pinning does not automatically compose playable actors, capabilities or schedules. Consequence types are finite; arbitrary relationship systems, resource creation and tabletop mechanics remain unsupported. Premises remain advisory composition input. Reconciliation exposes a uniform prospective choice, not private schedule details or a hidden-work indicator. Recovery requires equivalent authority; legacy stages without captured proof cannot cross changed fences.

Real installation still requires a separately reviewed release and additive migration 12; neither was performed here. Wave 3 owner acceptance is complete. Publication is limited to this status-only approval commit and the authorized fast-forward of main from `b7b065726ac1e0f64056e1970c8390f8448b4875` to the approved Wave 3 head. A possible later bounded wave remains reviewed authoring of playable actors, capabilities and causal Threads from an approved Pack, subject to a new owner instruction. No Wave 4, World Lab or Enter This World work starts. Stop after verifying remote main, accepted-checkpoint ancestry and the clean integration worktree.

---

# Historical Wave 2 status — owner accepted

Updated September 20, 2026. Owner-approved Wave 2 checkpoint: `d59d1f49f1bc44f9369baa3cdd541173eee5fd3f`. Integration branch: `codex/production-mega-sprint-wave2`. Implementation/QA checkpoint: `f9b8ce3b7c1329f2be502cfdf3d12adcbc8d8742`. Authorized base and remote main before approval: `0e52f446753caba88e98870c8785107aae92aa23`, fetched and reverified for this status-only approval. The owner authorizes fast-forwarding remote main from that exact base to the resulting approval commit. The original dirty checkout remains untouched.

## Milestone status

- **Implemented:** the bounded Wave 2 configuration, local Library/compiler, World Logic/resolver, and staged recovery slices below.
- **Integrated:** worker handoffs and Lead-owned shared contracts, migration, application routes, UI wiring, and production repairs on the isolated integration branch.
- **Deterministically verified:** the complete suite, SQL upgrade/turn/authoring/recovery tests, typecheck, zero-warning lint, build, and privacy/import checks passed for the accepted implementation. They were not rerun for this status-only approval.
- **Browser checked:** implementation checks covered actual settings components with synthetic callbacks, desktop and 390×844, English/Russian. The owner subsequently visually reviewed the disposable Wave 2 synthetic preview and approved the implemented UI direction and disclosed limitations.
- **Not live-model-quality evaluated:** no provider requests, benchmarks, model bake-off, hosted database verification, real source/campaign imports, or production migration.
- **Owner accepted:** the owner explicitly approves Wave 2 at exact SHA `d59d1f49f1bc44f9369baa3cdd541173eee5fd3f`, including the implemented UI direction and disclosed limitations after visual review of the synthetic preview. Wave 1 remains accepted; A/B/C are not declared fully complete. World Lab, What-If, and Enter This World remain unstarted. Wave 3 has not started.

Owner click-through instructions and setup limits: [WAVE2_OWNER_GUIDE.md](WAVE2_OWNER_GUIDE.md). Frozen ownership/addendum: [WAVE2_CONTRACTS.md](WAVE2_CONTRACTS.md). Independent audit: [WAVE2_QA_REVIEW.md](WAVE2_QA_REVIEW.md).

## Explicit owner acceptance and publication scope

The owner explicitly accepts the bounded Wave 2 implementation at `d59d1f49f1bc44f9369baa3cdd541173eee5fd3f` after visually reviewing its synthetic preview. This acceptance changes only `DEV_STATUS.md` in one status-only commit on `codex/production-mega-sprint-wave2`. It authorizes a fast-forward of remote main only from `0e52f446753caba88e98870c8785107aae92aa23` to the resulting approved Wave 2 head, preserving the accepted checkpoint in ancestry.

Approval verification checks the documentation diff, unchanged implementation tree, one direct approval commit, ancestry, clean integration worktree and exact remote main after the fast-forward. Application tests, typecheck, lint and build are not rerun for this documentation-only approval; the results below remain evidence from the accepted implementation. No force push, squash, rebase, implementation change, Wave 3 work, migration execution, deployment, provider/model call or real-data import is part of this approval task.

## What is usable

- Main-menu Settings now shows **AI Providers / Models** with registered model choices, configured/unavailable status and the inherited application default. Campaign Settings adds a primary model and supported task overrides, explicit inheritance, World simulation, autonomy, deadline pressure and the two implemented rulesets. Credentials remain server-only; settings never probe providers. Unsupported choices stop explicitly without fallback. The duplicate campaign autonomy control is removed and legacy settings writes remain synchronized with the same world policy.
- Main-menu **World Library** creates immutable TXT/Markdown source versions, preserves exact originals and hashes, orders source priority, distinguishes public/private and source/future knowledge, and executes explicit bounded compiler passes. Draft entities/claims and coverage, contradictions, unknowns, geography/timeline/rules references remain reviewable. Pack edits create new versions; approval and individual Canon promotion require explicit review. Campaign **World Packs** explicitly pins approved Pack/source versions and displays their provenance. Corrections invalidate pending work and stale approvals, preserving approved history and existing pins.
- **World Logic** is connected to the existing Game screen, single narrator, runtime registry and authoritative settlement. Free-form typed proposals support observation, speech, attempts, waiting and bounded known-location movement without requiring HP/class/ability scores/initiative/d20. Unknown or unsupported consequences pause with clear recovery copy. Generated prose cannot directly patch state. Eligible world threads can request one bounded resolver proposal; established evidence, circumstances, consequences and controlled-PC protections are validated on the server and again at the SQL boundary.
- **Resume this turn** can safely continue an equivalent staged result after manual save/head or load/branch/epoch changes. Original input, checks, profiles, event identity and origin remain preserved. Current authority, membership, lease and fences must match; no reroll, duplicate event, stale force-apply, sibling stage borrowing or history rewrite occurs. Material changes expose review/cancel/new-action recovery. Old stages without proof load safely but cannot resume across changed fences.

## Authority and changed areas

Lead owns the only additive migration, `supabase/migrations/202609200011_production_wave2.sql`. It adds nullable recovery authority to the existing stage/save family, immutable continuation receipts in the existing commands family, owner configuration synchronization, the bounded resolver/action validation seam, exact UTF-16 passage digest checks and atomic stale-source approval rejection. Existing v1/v2 saves and immutable history remain supported. No destructive schema change or production migration was performed.

Main areas: `src/lib/production`, `production-adapters`, `model-runtime/registry`, `rulesets/world-logic*`, `world/resolver`, `world-library`, `world-packs`, existing gameplay turn/runtime services and UI. New owner routes are `/api/settings/ai`, campaign `/production` and `/packs`, and `/api/world-library`; `/world-library` is owner guarded. Browser helpers/locales live outside the private Library subtree. Identity, World Events, Memory, Saves/Timelines, campaign/character/inventory state, provider profiles and Pack/source provenance retain one authority each. No dependency, backend, save engine, DM, deployment or framework configuration replacement was introduced.

## Implementation verification recorded at the accepted checkpoint

- `node --test --test-concurrency=2 tests/*.test.mjs`: **530 collected, 529 passed, 0 failed, 1 skipped**. The skip is the existing opt-in live Supabase test and is not claimed as passed. These are the recorded integrated implementation results, including 126 additional Wave 2 cases; they are not a fresh run for this approval commit.
- `next typegen` then TypeScript `--noEmit`: **passed**, run sequentially after the final build to avoid generated-type output races.
- Repository-wide ESLint `--max-warnings 0`: **passed, zero warnings**.
- Next.js 16.3.5 production build, `next build --webpack`: **passed**. This worktree uses the existing dependency junction; default Turbopack rejects an external dependency junction. Webpack builds the same application without changing dependencies/configuration. A successful default Turbopack build is not claimed.
- Disposable PGlite applies migrations 1–11 and exercises populated Wave 1 and older v1 save upgrades; settings ownership/revisions; actual compiler/source/Pack approval/pinning; no automatic Canon; source invalidation; full World Logic/resolver turn settlement; recovery across manual save/load/branch/head/epoch; cancellation/new action, duplicate callbacks and atomic rollback. No production data was used.
- Independent E tests: **19 passed**; combined with five Lead turn integration cases, **24 passed**. All five recorded findings were repaired by Lead and verified: stale compiler approval, private-stage metadata leakage, exact-text SQL evidence mismatch, missing World Logic settlement bypass, and mixed-type resolver evidence indexes. Full-suite privacy/client-import and EN/RU checks also pass.
- Separate implementation browser checks: settings model/ruleset/world-policy changes, inherited/unavailable status, English/Russian, frozen controls after an unconfirmed write and exact-operation retry; no horizontal overflow at 390×844 and no console warnings/errors. Those agent-run checks did not include authenticated owner/database authoring or physical iPhone testing. The subsequent owner visual review and acceptance of the synthetic preview are recorded above and do not establish live database or model-quality verification.
- Git whitespace checks pass. Generated `next-env.d.ts` changes are restored. Original checkout `DEV_STATUS.md` and `PHASE3_EVALUATION.md` hashes match the recorded starting values.

## Worker handoffs

All coding/review work used requested Astra / Extra High. Three worker slots ran alongside Lead; A reused the completed D slot, and E audited independently with exclusive test/report ownership. Lead performed Git integration and shared production repairs.

| Worker branch | Handoff SHA |
| --- | --- |
| `codex/wave2-config` | `660e05d044d4f2ed2d41bdaa43f08a1113e671c1` |
| `codex/wave2-library` | `395fcd6338d1f82463b30ab649f37176e38df386` |
| `codex/wave2-logic` | `ffa1dc470462da7e3bedddc2421b26ee542a119c` |
| `codex/wave2-recovery` | `3a144351b3ce2a46fb76ff824dcc691d825b25b9` |
| `codex/wave2-qa` | `f9b8ce3b7c1329f2be502cfdf3d12adcbc8d8742` |

## Remaining limits and next step

Global credential/default editing remains server configuration; the owner UI displays availability and campaign choices. No Test Connection button was added. The compiler is deterministic and limited to bounded TXT/Markdown patterns, not general natural-language Canon extraction, research, PDF/OCR, or arbitrary formats. Pack pinning does not build a complete playable world automatically; richer actor/thread authoring remains future work. World Logic effects/resolver decisions remain narrow; custom tabletop mechanics are not supported. Enabling overdue world schedules can stop for reconciliation that this wave does not expose. Legacy stages without captured proof cannot continue across changed fences; changed authoritative inputs require cancellation/review and an explicit new action.

Wave 2 owner review is complete. Publication is limited to the status-only approval commit and authorized fast-forward of main. Using the accepted implementation against a real installation still requires a separately reviewed migration/release step; no real database was upgraded or app deployed here. A possible next bounded wave remains richer reviewed capabilities/consequences, explicit overdue-schedule reconciliation and guided Pack review/pinning, subject to a new owner instruction. Stop after approval publication verification; do not start World Lab, Enter This World or Wave 3.

---

# Historical Wave 1 status

Updated September 20, 2026. No secrets, real campaign data or DM-private material are included here.

## Current milestone and status

**The owner explicitly accepts the first bounded A1 / minimum A2 / B1 / C production wave at exact checkpoint `a3274900e245f1f7c947cc775546cd5a7027d1f0`. Wave 1 is owner-approved; A/B/C are not declared fully complete.** Implementation and integrated verification are unchanged. The owner authorizes one status-only approval commit on `codex/production-mega-sprint`, followed by a fast-forward of production `main` only from `dd695a7056cfb7569237d305fe48aa2893f1f18e` to the resulting approved sprint head. The accepted checkpoint remains in ancestry. Original implementation verification ran on `68cc3754fd27ba2c62aad333bff1ff7eaafc9d15` and was recorded at the accepted checkpoint.

The lead and workers used the requested Astra / Extra High configuration. Shared contract/ownership freeze: `5769d86687097b2fdb300cb9dbd018244c9a9c42`. Tool capacity permits the lead plus three concurrent workers, so A/B/C started together and independent QA/D started when C freed a slot. Every worker used a separate branch/worktree; the lead integrated and owns the single additive migration. See [sprint contracts](PRODUCTION_SPRINT_CONTRACTS.md) and [independent QA review](WAVE1_QA_REVIEW.md).

## Completed work

- Added the versioned provider/task registry around the accepted direct OpenAI DM and summary seams. Global server defaults, campaign primary and task overrides resolve explicitly; relevant DM stages are pinned together in immutable private execution-profile records before a request. Retry reuses the recorded choices. Unsupported selections fail safely; there is no model/provider fallback or second DM.
- Added immutable owner-scoped source, pack, scenario, divergence and compiler-job records, version/reference validation, retained inline originals and hashes, bounded compiler lifecycle/checkpoints, source priority, temporal knowledge filtering and explicit campaign bindings. Campaign instance IDs remain separate from reusable source IDs. Corrections invalidate dependent pending work and Memory derivatives without rewriting original source/event history or automatically repinning campaigns.
- Added versioned Full Ruleset / World Logic / Custom Ruleset foundations with identity/control separate from optional mechanics. Existing `console-basic-v1` remains the only connected gameplay mechanics interpreter. Unsupported ruleset gameplay pauses before provider execution.
- Added persistent Actors, finite deterministic Threads, immutable Events and latent Hooks. Meaningful fictional changes select bounded work; simulation/autonomy/deadline policies remain independent. There is no wall-clock simulation or autonomous controlled-PC action. Unsupported resolver work and oversized proposals pause; no-op paths submit zero model requests.
- Integrated world staging after authoritative mechanics and before narration. Gameplay, World Events/state, Memory indexing and turn autosave commit in the same existing SQL transaction. Failed commits roll back all effects; duplicate commits add no events. Public observations are delivered in final narration, including Russian mechanic turns and provider omission, before any fair-warning receipt can be treated as delivered.
- Extended the existing save engine with five private v2 projection families while retaining exact v1 save membership/readability. Owner library history remains outside campaign rollback. New events feed the existing Memory pipeline as records, not automatically as unquestionable facts; private/future knowledge is filtered. Saved corrections remain effective after old-save restoration.

## Files / areas changed

New foundation modules: `src/lib/production`, `model-runtime`, `production-adapters`, `rulesets`, `world-library`, `world-packs`, `world`, and their dedicated server adapters. Narrow integration changes: existing turn contracts/engine, mechanical narration, DM/summary factories and authorized gameplay/Memory services. One additive migration: `supabase/migrations/202609190010_production_wave1.sql`. New deterministic, SQL and QA tests: `tests/wave1-*`. Sprint contract, QA report and this status record document the scope.

No application pages/components, dependency manifests/lockfiles, deployment configuration or experiment files changed. No production database migration was applied. The original OneDrive checkout's pre-existing `DEV_STATUS.md` and `PHASE3_EVALUATION.md` edits remain untouched; their original SHA-256 hashes were reverified.

## Tests and build status — actual integrated results

- **404 tests collected: 403 passed, 0 failed, 1 skipped.** Command: `node --test --test-concurrency=2 tests/*.test.mjs`. The skipped test is the existing opt-in live Supabase integration test; it was not run or represented as passed. These totals include 101 new Wave 1 cases, including 30 independent QA cases, 6 lead SQL/turn integration cases and 3 warning-delivery regressions.
- Route type generation and TypeScript `--noEmit`: **passed**.
- Repository-wide ESLint `--max-warnings=0`: **passed, zero warnings**.
- Next.js 16.3.5 production build via `next build --webpack`: **passed**. The default Turbopack builder rejects this local worktree's external `node_modules` junction; webpack uses the same installed dependencies and project configuration without a dependency/config change. This environment limitation is not presented as a successful default Turbopack run.
- Synthetic PGlite databases applied all ten migrations, including upgrade from pre-Wave-1 v1 saves. Verified atomic rollback, duplicate/stale/head/epoch rejection, explicit cancellation/new-action recovery, source/version and campaign isolation, anon/non-owner denial, private/future filtering, source correction after restoration, exact v2 autosave membership and initial/retried profile persistence. The real turn-engine → world staging → SQL causal settlement path passes with zero provider requests.
- Client import/privacy checks pass; normal runtime DTOs omit internal settlements, private world state and execution policy. Git whitespace checks pass. Generated `next-env.d.ts` path changes are restored rather than committed.

Implementation verification did not include live Supabase/Auth verification, live model-quality evaluation or browser/mobile acceptance. Explicit owner acceptance of the bounded Wave 1 checkpoint is now recorded above and does not expand those verification boundaries. This approval changes only `DEV_STATUS.md`; application tests, typecheck, lint and build were not rerun for the status-only update. Approval verification checks the documentation diff, unchanged implementation tree, ancestry, clean sprint worktree and exact remote main after its fast-forward. No real source/campaign import, provider call, experiment, paid operation, migration execution or deployment occurs in this approval task.

## Key technical decisions

Use one existing authoritative Postgres projection, one primary DM, one Memory pipeline and one save/timeline engine. Library versions are immutable owner history; campaign bindings/profiles/world projections are save members. Provider IDs never replace canonical entity/event IDs. All new RPCs are service-only and recheck owner/campaign/fences; browser routes do not expose private foundation payloads. Model credentials remain application-level server secrets, absent from profiles/campaign records. Server validation independently rejects forged public observations, private thread IDs, skipped progression, protected-PC decisions, invalid deadline completion and warning/hook rewrites.

The authoring/configuration surfaces are currently server/domain foundations, not new owner-facing screens. The existing campaign autonomy preference continues its accepted narration role; new deterministic world-policy authoring is not connected to that settings UI in this bounded wave. Future UI integration must use one explicit campaign policy rather than presenting conflicting controls.

## Known issues and limitations

- **A saved pending world settlement pauses on a changed save head or timeline epoch.** It retains input, rolls and the narration draft and publishes no partial effects. Use the existing Cancel unfinished turn action, then explicitly submit a new action. It does not silently rebase, reroll or execute the stale proposal. Legacy pending saves without world settlements retain their accepted behavior. Seamless continuation of newly staged world work is deferred.
- Compiler/model-pass execution, real file extraction/upload, immutable binary Storage provisioning and source ingestion UI are not implemented. Binary references are validated locators, not proof that an object was uploaded. Inline synthetic text/version persistence is verified.
- Full/custom ruleset mechanics, complete D&D support, dynamic sheets and ruleset authoring UI are not implemented. No World Logic campaign is silently executed through legacy HP/d20 mechanics.
- World work is finite authored deterministic transitions. Deep resolver decisions, long-interval continuation UI and rich world authoring are deferred. Provider/model-selection UI and non-technical onboarding remain future A1 work; this wave implements their runtime/persistence seam.
- Semantic quality of arbitrary public prose is not proved by schema checks. Model-quality evaluation and browser acceptance remain pending; owner acceptance covers this bounded Wave 1 checkpoint with the disclosed limitations. Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. Finite tests do not guarantee perfect memory, branching, isolation or universal recovery. No hosted deployment or real campaign/private-data acceptance has occurred.

Phases 0–3.5 retain their recorded acceptance. Phase 3.75 decisions and Phase 3.8B's **ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS** freeze remain unchanged, including historical accounting/unknown charges. Broad architecture research remains closed unless implementation exposes a concrete blocker.

## Remaining work and recommended next step

Wave 1 owner review is complete. Await separate authorization before scoping or implementing Wave 2 within A → B → C: owner-facing provider/profile and source/pack/world configuration, explicit safe continuation of staged world saves, and the next ruleset/compiler/resolver capabilities with separately authorized synthetic/live acceptance where needed. No manual provider setup is required to review this branch. A/B/C completion, model-quality evaluation and browser acceptance must be assessed separately.

Do not start D/World Lab, E/Enter This World, B2 visual references, Phase 4, 2D, EXPLORE, VIDEO, additional spatial experiments, deployment or real/private imports as part of this wave. The owner authorizes only the status approval commit and fast-forward integration into main. No Wave 2 work begins. Stop after verifying the remote main SHA and clean sprint worktree; all existing implementation limits and historical records remain unchanged.

---

## Historical source-of-truth integration status — preserved below

The following record describes its earlier documentation-only checkpoint. Its statements that production coding had not started are historical; the current Wave 1 implementation status is recorded above.

# Development status — owner-approved source-of-truth integration

## Current milestone and status

Final source-of-truth integration before production implementation. **Owner explicitly approved integration content at `7d945d3754647015ecdd765cef2b688dbab38777`.** This documentation-only finalization records acceptance for the authorized fast-forward of main; production coding has not started. Branch: `codex/source-of-truth-integration`. Base main: `cb7f6be2fb513de13604d381046a3240f3261383`; complete approved roadmap: `a3d0fa66da42f36a5401c3513e3484e83150f9d3`; historical final freeze: `3c99552a66d9b4b270b3a7a8552c709cf9faf73e`. The finalization commit SHA is reported after creation and verified against remote main after the fast-forward.

Phase 3.8B status is **ARCHITECTURE / CAPABILITY EVIDENCE COMPLETE WITH DOCUMENTED LIMITATIONS**. Phases 0–3.5 remain owner-accepted at their recorded checkpoints. Phase 3.75 decisions are unchanged. Broad product research/design is closed unless implementation reveals a genuine architectural blocker.

## Completed work and files / areas changed

Integrated the full roadmap history; manually reconciled current status and final spatial decisions in MASTER_SPEC.md, DEVELOPMENT_PLAN.md, PHASE38_SPATIAL_RUNTIME.md and this file. Updated START_HERE.md and added historical notices to PHASE38B_LIVE_PROTOCOL.md / PHASE38_PROVIDER_CAPABILITIES.md. Added production-safe PHASE38B_ARCHITECTURE_FREEZE.md and [SOURCE_OF_TRUTH_INTEGRATION.md](SOURCE_OF_TRUTH_INTEGRATION.md), which contains the exact 19-file comparison to prior production main, coverage map and reconciliation decisions. Historical evidence uses exact commit references; no experiment tree is imported. This finalization updates only current-status wording in MASTER_SPEC, DEVELOPMENT_PLAN, DEV_STATUS, START_HERE, PHASE38_SPATIAL_RUNTIME and PHASE38B_ARCHITECTURE_FREEZE, plus a historical notice on SOURCE_OF_TRUTH_INTEGRATION; its substantive review remains unchanged.

## Tests and build status — documentation finalization

**PASS: the 23 existing local documentation/integration assertions rerun for this finalization.** Verified exact source commits and ancestry; recomputed the historical canonical freeze hash; checked preservation of roadmap requirements and accepted capability/authority/accounting decisions; confirmed the entire experiment tree is absent. All **240 non-Markdown Git objects** match prior production main. Ten complete roadmap briefs are unchanged; MASTER_SPEC sections 1–44, the content of section 46, plan milestones 0–3.5/A–E and 4+ sequencing, prior DEV_STATUS history, and historical proposal/research bodies are preserved.

Checked **33 Markdown documents / 301 links**, including **8 immutable evidence links** whose commit/path targets exist in local Git. No broken local links/anchors or pre-existing unrelated documentation failures were found. Strict UTF-8, conflict-marker, fenced-block and Git whitespace checks pass. The earlier integration removed one trailing blank line inherited from the roadmap's MASTER_SPEC; no such content change is made in this status cleanup. The original checkout's two dirty-document hashes remain unchanged. Remote main was verified at the exact required base before finalization.

There is no existing documentation-check command. Application tests/typecheck/lint/build were not rerun: all changes are Markdown and production code/test/config/dependency blobs remain identical to exact base main. No test success from an older phase is presented as a fresh run. No live or browser acceptance is performed in this task.

## Key technical decisions

- Preserve all roadmap product requirements and future sequencing; do not replace newer roadmap briefs with the older experiment-side versions.
- Authoritative RPG/world state is truth; spatial artifacts are projections. Bind only structurally verified addressable provider parts/nodes/anchors to canonical entities/actions; provider IDs are not canonical IDs.
- Text remains independent; 2D Live is the planned primary visual layer; optional EXPLORE follows Phase 4 canonical assets. Spatial providers and object generation are not prerequisites for World Engine, Rulesets, DM, Memory, Saves/Timelines or progression.
- Fal-world's accepted PLY candidate requires PLY support or validated offline conversion, not DRC exclusively. Chest POST entered the queue then the first poll stopped locally; completion/charge UNKNOWN, no GLB, PBR/articulation unverified, lid STRUCTURE_UNVERIFIED. Do not infer provider generation failure or a separate lid.
- Four submissions permanently reserve $4.75 / $4.75, leaving $0. Known billing $2.528; both fal charges UNKNOWN. No extra experiment, chest recovery, fal retry or reservation reuse.
- Historical canonical freeze hash `eef894c15e27bc167cf3bbcbaaf99dd51ec640f545b1a16cd1b2e539da239119` identifies the historical artifact, not the reconciled production Markdown copy.

## Known issues and verification limits

Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic/model evidence cannot guarantee perfect memory, branching, isolation, geometry, provider behavior or universal recovery. Marble evidence is architecture-only; visual quality, navigation, canonical metric correctness and production EXPLORE readiness are not accepted. No hosted deployment or real campaign/private-data acceptance has occurred. No broad design work is reopened to resolve these limitations.

The original local checkout is older than GitHub main and has pre-existing uncommitted documentation; that checkout and its files remain untouched. The integrated roadmap is based on the exact prior production main checkpoint. See the review for the verification scope and any pre-existing documentation issues.

## Remaining work and recommended next step

Integration content is owner-approved and the complete roadmap is integrated. The next phase is the **Production Multi-Agent Coding Sprint**, to begin in a fresh project chat, with Lead/Integrator establishing shared contracts before World Engine, World Library/Packs/Rulesets, Runtime/Memory/Saves and QA/Security/Recovery workstreams begin. Shared migrations/event/save-timeline/authority/canonical-identity contracts cannot be independently changed by workers. No implementation or worker dispatch begins in this task.

Zero provider/paid/experiment calls, asset/DNS access, generations, polling, downloads, exports, billing requests, ledger mutations, production coding, deployment or real-data import. Only GitHub verification and publication of the status-finalization branch / fast-forward of main use network.

---

## Historical roadmap status — preserved verbatim below

The following entries describe their original checkpoints. Earlier proposed/preparation/not-authorized Phase 3.8 wording is superseded by the current integration status above; it is not a new execution instruction.

# Development status

Last updated: September 19, 2026. Never include secrets, credentials or DM-private content.

## Current milestone and status

### World Library web-research ingestion — final clarification

Docs-only clarification on `chatgpt/poi-2d-roadmap`; this is **not a new research/design cycle or foundational subsystem**. Future World Library creation can use **Upload Sources / Research from Web / Describe From Scratch / Combine**. Research from Web is an explicit owner-triggered bounded source-acquisition job: a finite orchestrator may parallelize specialized workers, preserve source provenance/citations and disagreements, and feed reviewed results into the existing Source Store + Canon Compiler. It never writes canon directly, never becomes the ordinary gameplay DM, and never runs as an unlimited autonomous crawler/swarm.

Research plans expose bounded coverage/budget and stop with gaps/uncertainties; **Deepen Research** starts another explicit bounded pass. Historical packs preserve Source Knowledge / Canon at Entry / Character Knowledge / future-event separation so later research cannot leak future outcomes into the played perspective. Reuse existing Model Runtime, provenance, retrieval/versioning and correction machinery; no second vector DB/backend is introduced.

No implementation, provider/search call, real source ingestion, production/main mutation or Phase 3.8B work occurs in this clarification. The existing final foundational architecture boundary remains in force.

### Spellcasting / World Magic / semantic causality — final clarification

Docs-only clarification on `chatgpt/poi-2d-roadmap` after accepted Progression architecture; this is **not a new research cycle or new foundational subsystem**. It makes three already-intended boundaries explicit: Character → Spells derives from authoritative known/spellbook/prepared/resource state; magic is split between campaign **World Magic Rules** (what is possible) and the active **Ruleset** (how an Actor accesses/pays/targets/resolves it); and the World Engine may use the selected strong reasoning model for bounded semantic/causal physical consequences while deterministic code and authoritative Events remain the authority.

High-scale supported magic may therefore persistently change terrain, Locations, infrastructure and downstream world state instead of being forced into encounter-only flavor. The reasoning model is not an engineering-grade physics solver: exact calculable mechanics stay in code, causal proposals use selective simulation and explicit uncertainty, and visual frames/video are generated only from committed state. Provider choice remains replaceable even if the current owner configuration uses an Astra-class model.

No production/runtime/database/UI/provider/Phase 3.8B work is part of this clarification. `main` remains untouched; the existing final-addendum boundary still stands.

### Progression / Rewards / Challenge Scaling — final planned foundational addendum

Documentation-only work on `chatgpt/poi-2d-roadmap`, starting at exactly `fb97364f707f40e35e4e9480265be0e4041e83c1` in the existing isolated roadmap checkout. The requested product decisions are documented; no production coding has started and owner acceptance of the resulting documents remains separate.

This is the **final planned foundational product-architecture addendum before the separately scoped production multi-agent coding sprint**, unless implementation later reveals a genuine architectural blocker. Do not initiate another broad product research/design cycle. Remaining pre-coding work is limited to separately authorized Phase 3.8B capability checks, final architecture/source-of-truth freeze, safe roadmap integration into main and the separately scoped production sprint. None of those actions is authorized or performed by this documentation task.

Completed: generic Progression Engine with composable tracks, Ruleset-owned Reward Packages/valuation, stable source entitlements, atomic settlement and Pending Advancement; classic/use-based/milestone/career/secondary/hybrid/Off progression; explicit Character → Progression choices and latent/custom ability boundaries; World Anchored / Adaptive / Hybrid scaling; distinct threat/power/budget, bounded encounter materialization and advisory Progression Pacing; caps/post-cap growth, WWII tank-crew example, World Leverage/world-scale effects, exact saves and imported baseline compatibility. Future acceptance cases are specified, not executed.

Files/areas changed: [RULESETS_AND_DYNAMIC_UI_BRIEF.md](RULESETS_AND_DYNAMIC_UI_BRIEF.md) holds detailed contracts and future tests; [MASTER_SPEC.md](MASTER_SPEC.md) integrates setup, Character, Game/Recap and authority; [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) records the final-addendum boundary and incremental production slices; [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md) connects validated reward/world-scale settlement; [POV_AND_WORLD_LEVERAGE.md](POV_AND_WORLD_LEVERAGE.md) connects growth, institutional authority and military example; [RPG_DESIGN_DOCTRINE.md](RPG_DESIGN_DOCTRINE.md) records reward/challenge principles; this status record. No new overlapping specification.

Key decisions: progression is required for RPG-capable Rulesets, while XP/levels are not universal. Hybrid is the recommended general scaling default, not full level matching. Level caps are Ruleset policy, not engine limits. AI supplies semantic evidence, trusted code owns mechanical quantities and validation; manual corrections win. Reward receipts/track state share existing atomic commit, timeline fencing and versioned saves. Pacing forecasts do not grant rewards; committed encounters cannot silently rescale. One DM, one authoritative world and existing application/storage architecture remain intact.

Verification: documentation checks passed across exactly seven existing Markdown files: 119 relative links, including 33 heading anchors; balanced code fences; strict UTF-8 decoding; no conflict markers, replacement characters or whitespace errors. Diff review confirms documentation-only scope and unchanged earlier DEV_STATUS content. Production typecheck/lint/tests/build intentionally not run under this documentation-only instruction. No executable code, database/migrations, UI, runtime/provider calls, research or Phase 3.8B work; no main/experiment branch changes.

Known limitations and remaining work: all added engine/UI capabilities remain design only; numeric examples are illustrative, not tested balance or implemented rules. Future implementation must validate exact save/legacy compatibility, idempotency, privacy, scaling stability, typed abilities and bounded large effects. Recommended next step is document review and the limited pre-coding sequence above under separate scope; no setup or app clicking is needed now. Commit/push only the roadmap branch and stop without merging. Earlier status and experiment records below remain unchanged.

### DM Craft architecture / product-design addition — documentation only

Branch: `chatgpt/poi-2d-roadmap`. Exact starting SHA: `5ac98d91af09b58bdf9cbaf9f34f4d5eb7ad3f4a`. The requested design decisions are recorded; implementation has not begun and owner acceptance of this documentation remains separate. Prior milestone/experiment records below are historical and unchanged by this addition.

Completed: documented **application main menu → Global DM Craft** (what the DM has learned) and **Campaign → DM Style** (how to run this campaign). Added compact versioned Doctrine, approved stage-relevant Craft Cards, Teach DM approval/reversal, Sources/Packs, safe examples, Scene Directing / DM Performance, bounded provenance and synthetic Academy evaluation. Existing RPG research is candidate material for a future owner-approved RPG Console Core Craft pack, not implemented cards. Fine-tuning is optional, late and separately reviewed.

Files/areas changed: [MASTER_SPEC.md](MASTER_SPEC.md) (navigation, single-DM flow, style and feedback); [RPG_DESIGN_DOCTRINE.md](RPG_DESIGN_DOCTRINE.md) (Craft content/approval/sources/evaluation); [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md) (stage routing, authority, storage separation, trace and save/retry policy); [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) (progressive slices); [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md) (guidance versus world authority); this status record. No new overlapping specification was created.

Key decisions: preserve the existing single `DmProvider.plan/narrate/feedback`; authoritative RPG state and Canon / Memory remain distinct from guidance. Campaign style uses existing saved/timeline effective guidance/settings semantics; global Craft is outside campaign rollback, with versions pinned per operation. Every campaign record retains `campaign_id`; global records are owner-scoped. Normal server validation/commit and secrecy remain mandatory. Prefer existing Supabase/Postgres and retrieval capabilities; no second backend, vector database, agent framework or SaaS.

Verification: documentation checks passed across exactly six existing Markdown files: 101 relative links, including 19 heading anchors; strict UTF-8 decoding; balanced code fences; no conflict markers, replacement characters or whitespace errors. Diff review confirms documentation-only scope and unchanged historical status content. Production typecheck, lint, tests and build deliberately not rerun under the documentation-only instruction. No runtime, retrieval, AI-call, database/migration, UI or fine-tuning implementation; no research cycle or evaluation execution. Production `main`, its pre-existing local edits and Phase 3.8B code/history are outside this change.

Known limitations/remaining work: all new capabilities are design only; quality benefits are unmeasured. Future implementation must prove approval, scope/privacy, bounded retrieval, compatible saves and no history rewrites, with separately authorized model evaluation where needed. Recommended next step: owner reviews the documentation; any implementation starts only under a new scoped instruction following the progressive World Engine → integration → Craft sequence. No manual setup or application clicking is required for this pass. Commit/push only this documentation branch, then stop without merging.

**TIME PRESSURE / DEADLINES ADDENDUM — owner preference recorded.** Future campaigns expose Off / Critical Only / Normal deadline pressure independently from World Autonomy. Off means no quest/Adventure Hook/autonomous Thread can fail, expire or irreversibly complete solely because in-world time passed; exploration/rest/travel cannot be punished by hidden countdowns. Immediate causal processes already in motion still resolve normally. Re-enabling never executes a retroactive hidden backlog. Documentation only; no implementation authorized.

**KINGMAKER / ROGUE TRADER REFERENCE ADDENDUM — realm/delegation/rumour lessons recorded.** Documentation-only: adds realm/holding-as-World-Actor, advisor/officer delegation, causal linking of episodic hooks, fair urgency/signposting, optional management abstraction, jurisdictional power, rumors-as-fallible-claims, colony/project opportunity costs, player-facing major-decision provenance and adversarial testing for unexpected system combinations. Pathfinder/40K rules complexity and separate mandatory management minigames are explicit non-targets. No implementation is authorized.

**WRATH OF THE RIGHTEOUS REFERENCE ADDENDUM — scale/identity lessons recorded.** Documentation-only: added lessons from Owlcat's Pathfinder: Wrath of the Righteous about one Actor operating across embodied and strategic scales, transformative identity/progression changing world affordances/reactivity, and the risk of a disconnected mandatory strategy minigame. Pathfinder rules density/alignment/class proliferation are explicitly not universal targets. No implementation is authorized.

**POV / WORLD LEVERAGE ADDENDUM — character-specific knowledge and influence recorded.** A documentation-only follow-up distinguishes narrative Player Role from the controlled Actor's actual knowledge, capabilities, institutional authority, command scope, jurisdiction, resources and information access. King/commander/soldier POVs can therefore expose different information and action scales over the same authoritative world. Orders remain validated in-world actions rather than direct reality edits; high status is not omniscience; POV switching cannot leak another Actor's knowledge; owner-side World Authoring remains separate. No implementation is authorized by this addendum.

**RPG DESIGN DOCTRINE ADDENDUM — industry best practices recorded.** A documentation-only follow-up extracts player-agency lessons from Larian/Baldur's Gate 3, Deus Ex/immersive-sim design, New Vegas mission structure, Disco Elysium micro-reactivity/depth and Wildermyth procedural-character consistency. The resulting doctrine emphasizes problems-not-puzzles, choice→consequence→recovery, fail-forward, honeycomb quests, micro/macro reactivity, stable companion/NPC identity, environmental storytelling, lazy depth, selective simulation and campaign resilience after unexpected player actions. No implementation/runtime/model call is authorized by this addendum.

**QUEST / POI MARKER VISIBILITY ADDENDUM — owner preference recorded.** Future maps support Off / Tracked Only / Standard / All Known marker modes. This is presentation-only: players may choose dense modern-RPG guidance or no automatic markers without changing discovery/canon/quest state. Even All Known remains limited to player-known information and cannot reveal latent DM-private hooks. No frontend/runtime implementation is authorized by this documentation addition.

**SYSTEMIC WORLD REFERENCE ADDENDUM — Terra Randoma + Approaching Infinity recorded.** A documentation-only follow-up on the separate roadmap branch extracts procedural/systemic lessons: stateful settlements/factions, travel incidents, quest grammars, hidden clue ladders, multi-step/lazy arcs, semantic location archetypes, selective simulation, local environmental affordances, inter-actor reactions, multi-scale abstraction and bounded opportunity density. These games are explicitly NOT visual-style targets. No runtime/frontend/provider/model call is authorized or implemented by this addendum.

**OWNER PRODUCT DIRECTION ADDENDUM — 2D presentation and Adventure Hooks recorded.** A documentation-only follow-up records permanent first-class Text mode; a future style-agnostic 2D target inspired by Fabled Lands exploration + Sorcery! encounters/combat; world/region/town/local lazy presentation; player-knowledge-gated POIs; DM-private latent Adventure Hooks; and a future Chat with DM world-authoring path for explicit owner requests such as increasing regional quest/mystery density. Everweave, Sorcery!, Duskpunk, Quest for Infamy, Fabled Lands, Sunless Sea and Sunless Skies are interaction/presentation references, not a fixed aesthetic. No renderer/frontend/runtime/migration/provider call is authorized or implemented by this addendum. Phase 3.8B remains separately gated exactly as before.

**PHASE 3.75 ARCHITECTURE DECISION OWNER-ACCEPTED; PHASE 3.8A DOCUMENTATION READY FOR OWNER REVIEW.** The owner independently reviewed evidence 9d5a99c0e93917190f415eedab3d4067c63b8ee2 and execution/stop-guard 8c5a9f7e731a9ab2ce24b17a61423fe7b46e1e23 against production main cb7f6be2fb513de13604d381046a3240f3261383. The incomplete benchmark is accepted as sufficient for an architecture decision only; it is not relabelled complete or successful. [Final freeze](PHASE375_ARCHITECTURE_DECISION.md) is authoritative over older candidate/spike wording below.

### Completed work

- Recorded direct OpenAI Responses as v1 baseline and preserved the server-only DmProvider / structured requester seam. No Vercel AI SDK/Gateway production adoption. Jev is DO NOT ADOPT for Thread relevance, Actor relevance, Canon/source classification and parallel comparison; disabled for production/real/private data and its benchmark closed. No additional calls, diagnostics, retries or reruns. classifier.dev, OpenRouter, GLiNER and Vercel Workflows remain deferred and were not contacted.
- Inspected accepted runtime, Memory and Saves/Timelines; designed optional Spatial Runtime capabilities, immutable artifact/binding versions, public knowledge filtering, normal-game typed interactions, source/epoch fences and compatible future save references. No implementation or schema change.
- Researched current official world/object/realtime provider documentation, dated 2026-09-19; distinguished hosted APIs, weights, research/access-gated surfaces, evidence and unknowns. Current hosted Hunyuan3D 3.1, HY-World 2.x and Atlas availability are distinguished from older fal World 1.0 and realtime video.
- Proposed four synthetic spatial generation jobs with a $4.75 reservation ceiling. Not run, not authorized by this record; no new keys requested. Exact endpoints/options, bounded read/download counts, cost arithmetic, stop-first-failure and acceptance questions are in the proposal.
- Added EXPLORE to v1 after Phase 4 FRAME / Visual Bible. Owner Diagnostics/System Inspector remains late-stage; AutoEval/autoresearch remains future bounded owner-authorized experimentation, never autonomous production changes.

### Files / areas changed

Exactly twelve Markdown documents in isolated codex/phase38-spatial-architecture, based on production main cb7f6be2fb513de13604d381046a3240f3261383:

1. [PHASE375_ARCHITECTURE_DECISION.md](PHASE375_ARCHITECTURE_DECISION.md) — new final decision and evidence checkpoints.
2. [PHASE38_SPATIAL_RUNTIME.md](PHASE38_SPATIAL_RUNTIME.md) — new architecture/contracts and offline acceptance plan.
3. [PHASE38_PROVIDER_CAPABILITIES.md](PHASE38_PROVIDER_CAPABILITIES.md) — new dated official-source matrix.
4. [PHASE38B_LIVE_PROTOCOL.md](PHASE38B_LIVE_PROTOCOL.md) — new proposed minimal paid study, not execution.
5. [MASTER_SPEC.md](MASTER_SPEC.md) — current scope, closed classifier decision and §45 spatial invariants.
6. [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) — freeze, 3.8A/B gates and post-FRAME EXPLORE/late diagnostics ordering.
7. [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md) — baseline freeze and no scheduled Jev continuation.
8. [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md) — remove obsolete pending Jev-spike prerequisite.
9. [WORLD_LAB_WHAT_IF_BRIEF.md](WORLD_LAB_WHAT_IF_BRIEF.md) — same closed decision for comparison classification.
10. [WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md) — same closed decision for source classification.
11. [START_HERE.md](START_HERE.md) — current owner guidance, no setup needed for document review.
12. [DEV_STATUS.md](DEV_STATUS.md) — this actual status; earlier acceptance/verification records remain historical below.

### Verification for this pass

Documentation checks passed: twelve-file Markdown-only scope; 97 relative links including five heading anchors; balanced fences; no conflict markers, replacement characters or whitespace errors; unchanged accepted Phase 3.5-and-earlier status content; $4.553 published maximum generation-cost arithmetic and $4.75 reservation ceiling. All 29 original local experiment artifacts/reservation files match SHA-256 values in the pushed evidence record. Seventeen tracked experiment-result documents and both original-checkout dirty documents also retain their pre-task hashes. Remote production main and bake-off head match the owner checkpoints. No live spatial/model tests were run.

Application typecheck, lint, tests and production build are **not rerun**: only Markdown is changed; no tooling/configuration/runtime edit makes those checks relevant under this task's instruction. Historical implementation/test results below belong to their own checkpoints. No browser/spatial/mobile acceptance or provider/account capability has been tested here. Public documentation reads are research, not paid/model calls.

### Key technical decisions and known issues

- Authoritative RPG state is unchanged by spatial geometry/video. All actions use normal authorization, rules, recorded checks and commit semantics. Provider IDs/coordinates remain versioned presentation metadata; no universal 3D format, D&D ontology or provider dependency is introduced.
- Reuse source versions/Memory authority and existing save/timeline membership, leases/revisions/epoch fences. The future manifest extension needs compatible versioned readers; no new rollback engine and no claim spatial records already persist.
- Only player-discovered inputs and safe browser-delivered geometry. A provider can invent spaces even from safe input, so output review/withholding is required. Hosted privacy, export/storage rights, actual model identity, object binding and browser usability must be measured; UNKNOWN stays explicit.
- Provider API availability and price are dated documentation evidence, not guarantees. Fal's part-splitter requirements do not directly match its 3.1 generator outputs. Realtime video does not establish persistent editable objects or save fidelity. No provider winner or production readiness is asserted.
- Physical iPhone/Safari and historical optional Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic/model tests do not guarantee perfect memory, branching, isolation, causality or recovery. No hosted deployment or real campaign/private-data acceptance has occurred.
- Original checkout uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md are not staged, overwritten, reconciled or attributed to this work. Original benchmark branch/artifacts are preserved; no runner/dependencies are merged into production. No production main mutation, campaign data or synthetic fixture changes.

### Remaining work and recommended next step

Owner reviews the Phase 3.8A documents and proposed minimal 3.8B scope. No manual setup is needed now. Any experiment preparation, credentials, paid execution or production dependency needs a later scoped authorization; no permission is inferred from a remaining Phase 3.75 budget. Production EXPLORE waits until after separately authorized Phase 4 FRAME / Visual Bible. Broader World Engine/Library/Lab/ruleset implementation also remains separately gated.

Stop for owner review after this documentation checkpoint. Do not begin Phase 4, EXPLORE implementation, deployment or real import.

---

## Historical pre-bake-off architecture design pass — superseded status, preserved record

**PHASE 3.75 ARCHITECTURE DOCUMENTATION — design pass completed; pending owner review.** The proposed World Engine / World Lab / Source Worlds layer is neither implemented nor owner-approved. Only documentation work is authorized in this pass. Latest accepted implementation remains Phase 3.5 `8099e0cca1463f767476190c456d4f3947e7c84e`, with explicit acceptance at `6db58b5e3d464e4a09604ce344424c4fa8ed763e`. Earlier accepted checkpoints and their actual verification records remain below.

### Completed work and inspected foundations

Read the specification, development plan and agent instructions, then inspected accepted runtime/mechanics, Memory, save contracts/adapters and migrations, followed by the current status record. The resulting architecture deliberately extends existing systems:

- World Actors reference stable entities; Threads hold goals/deadlines; Events are validated factual history. Bounded in-world triggers and staged turn settlement preserve recorded dice, agency and private knowledge.
- World Lab uses existing timeline identities, immutable row versions/manifests and source membership. Concurrent non-canon runs require a future detached-manifest reader/writer and per-run head/lease fencing; the current single active campaign projection cannot support them by switching live timelines. Enter This World creates a validated playable child while preserving the original and simulation.
- World Library/Packs preserve originals, evidence, conflicts and approved visuals. Reusable owner-scoped versions bind into isolated campaign instances. Entry anchors distinguish current canon/character knowledge from later source events; original/canon/simulated character selection and literal/native scenario composition preserve provenance and agency.
- D&D is a selectable ruleset, not universal ontology. The accepted `console-basic-v1` remains a house-profile compatibility baseline, not full official 5e. Proposed World Logic/custom profiles and bounded sheet/inventory components remove future compulsory HP/d20 assumptions without rewriting accepted behavior.
- Model Runtime extends current DmProvider/SummaryProvider seams with provider/task selection, pinned execution profiles, verified budgets and provenance. One primary DM, no silent fallback or automatic cheap-model routing. Supported-provider onboarding uses one ignored local server-secret file, future safe example/instructions and Settings → AI Providers with explicit Test Connection. Campaigns never contain keys; no configuration/setup implementation was added.
- Optional Decision Model addendum: a vendor-neutral classification/ranking capability is disabled by default, has no state authority and does not replace primary reasoning. Mandatory evidence bypasses pruning; relevant/uncertain authorized candidates pass through, and failures bypass optimization without relaxing secrecy or silently changing models. A future optional 3.75A spike compares deterministic filtering, a candidate classifier and frontier reasoning on synthetic bilingual/adversarial fixtures, prioritizing recall. Jev and classifier.dev are candidates only, not integrations or required dependencies.

### Files / areas changed

Exactly eight documentation files: [MASTER_SPEC.md](MASTER_SPEC.md), [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md), this DEV_STATUS.md, and new [WORLD_ENGINE_BRIEF.md](WORLD_ENGINE_BRIEF.md), [WORLD_LAB_WHAT_IF_BRIEF.md](WORLD_LAB_WHAT_IF_BRIEF.md), [WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md](WORLD_LIBRARY_AND_WORLD_PACKS_BRIEF.md), [RULESETS_AND_DYNAMIC_UI_BRIEF.md](RULESETS_AND_DYNAMIC_UI_BRIEF.md), [MODEL_RUNTIME_BRIEF.md](MODEL_RUNTIME_BRIEF.md). The specification explicitly revises former universal rules/provider assumptions; the plan proposes separately reviewed A–E slices and records remaining owner decisions. Accepted Phase 2/3/3.5 contract files are unchanged.

The initial design pass was committed at `67fc6f75358ac2bcaa7ca6e99d5e84feea1702d6`. This follow-up changes seven of those existing documents: Model Runtime, World Engine, World Lab, World Library, MASTER_SPEC, DEVELOPMENT_PLAN and DEV_STATUS. RULESETS_AND_DYNAMIC_UI_BRIEF.md is unchanged by the Decision Model addition. No new files or dependencies are introduced. The original acceptance boundaries remain unchanged.

### Verification for this documentation pass

The initial design pass passed documentation whitespace/diff, 44 relative file links, balanced code fences, encoding/conflict-marker and eight-file scope checks. **Decision Model addendum checks passed:** 49 relative file links and five heading anchors across the eight architecture documents; balanced fences; no conflict markers/encoding replacement characters; exactly seven existing Markdown files changed and no untracked additions. The prior Phase 3.5 acceptance and all following historical status/verification text are unchanged. SHA-256 checks again confirm both original checkout documents remain byte-for-byte unchanged. Runtime, migrations, tests, configuration and accepted contracts remain outside this change. No classifier benchmark was run; no accuracy, latency or savings result is claimed.

No application test suite, typecheck, lint, production build, browser acceptance or live integration was rerun: no executable/configuration change was made. Historical passing results below belong to their original accepted checkpoints, not this design pass. No app/provider/model API calls, migrations, database operations, runtime/UI implementation, synthetic fixture changes, deployment or real-data imports occurred. Git fetch/push is solely repository synchronization.

### Key decisions and known limitations

- Reuse existing Memory, authority/knowledge filters and save vault/manifests. Version-1 manifest validation uses a fixed family list; future world/profile families need compatible versioned readers, not silent invalidation of accepted saves.
- Pin complete source/contract/profile versions for comparisons; a save ID alone cannot pin ordinary canon documents outside rollback. Global canon corrections retain authority and invalidate affected derived work; a What If premise remains a local assumption.
- Canon before entry is history; future source outcomes do not force choices. Model pretraining knowledge cannot be guaranteed erased. Exact state never comes solely from a generated recap, and source originals survive compilation/summarization.
- Use the existing Next.js/Supabase application with small adapters and bounded jobs. No new backend, swarm, graph database, alternate branch system or general low-code platform.
- No tracked `.env.example` currently exists. The future Model Runtime slice must supply a placeholder-only example, keep real secrets ignored and provide exact nontechnical file/variable/restart instructions. Proposed providers are candidates, not newly verified working integrations. Test Connection is future explicit synthetic work, never automatic probing or a call made here.
- Decision Model accuracy, calibration, latency, context savings and cost are unmeasured. The synthetic spike is a future requirement, not a completed benchmark or permission to call classifier.dev. Adoption needs meaningful benefit, recall-first gates and a separate decision; retaining no classifier is a valid outcome. No classification proxy, Jev integration, new credential/dependency or runtime mutation was introduced.
- Physical iPhone/Safari remains unverified. The historical optional Phase 1 conflict-rebase confirmation remains unverified. Finite synthetic/model tests do not guarantee perfect memory, branching, simulation causality or universal recovery. No hosted deployment or real campaign/private-data acceptance has occurred.

The work uses an isolated `codex/world-architecture-docs` checkout based on the accepted checkpoint. The original checkout's pre-existing uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md are outside this pass: not staged, overwritten, reconciled or attributed to it. Original acceptance/implementation verification text remains preserved below.

### Remaining work and recommended next step

Owner review of the five briefs and the decision table in DEVELOPMENT_PLAN: phase/order naming, canon-continuation policy, default imported-world ruleset, Live World/Off behavior, visual association scope, default simulation count, initial model/provider task policy and ruleset breadth. Suggested defaults are explicit proposals, not owner decisions. Review does not require source-code inspection or manual setup.

Stop after the documentation commit/push. A later explicit instruction may scope A1 or another agreed slice with concrete contracts, compatibility gates and independently authorized live evaluation. Do not begin Phase 3.75 implementation, Phase 4, FRAME, VIDEO, deployment or real campaign/private import now.

## Accepted Phase 3.5 checkpoint — preserved historical record

**PHASE 3.5 OWNER-APPROVED — Save / Load / Timeline Forks.** The owner explicitly accepted implementation checkpoint `8099e0cca1463f767476190c456d4f3947e7c84e` on September 18, 2026. This acceptance is separate from the implementation verification recorded below and does not claim additional testing. Preserve Phase 3 implementation `ca4499bc279d37eb52c0a36b0524eb19322071b0` and owner acceptance `96964964a7d5046ff34b6b6ae695ecf494885cc4`, plus all earlier accepted checkpoints.

## Phase 3.5 owner-acceptance record

This status-only acceptance commit changes **only DEV_STATUS.md in the isolated phase35-lead checkout**. Application code, migrations, runtime, tests, configuration, Phase 3/3.5 contracts, save/timeline data and synthetic fixtures are unchanged. Tests, typecheck, lint, production build, live integration and browser checks were not rerun for this documentation-only acceptance. Verification is limited to the exact checkpoint, single-file diff, preserved verification text and original-document hashes. All implementation results below belong to the accepted implementation checkpoint.

All disclosed limitations and verification boundaries remain in effect:

- Physical iPhone/Safari remains unverified.
- The historical optional Phase 1 conflict-rebase confirmation remains unverified.
- Finite synthetic tests do not guarantee perfect branching, memory isolation or universal recovery.
- No hosted deployment or real campaign/private-data acceptance has occurred.
- The original checkout's pre-existing uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md remain byte-for-byte untouched. They are not staged, overwritten, reconciled or attributed to Phase 3.5; their recorded hashes are checked for this acceptance commit as well.

This acceptance authorizes no further implementation. Do not begin World Engine, Phase 4, FRAME, VIDEO, deployment or real campaign/private-data import. Stop after committing and pushing this acceptance record.

## Phase 3.5 completed work

- Contract/types checkpoint `73d4ab2b7bb38f76aa9528afb68c323a1e674124` was committed first. All three separate-worktree development workers acknowledged that exact checkpoint before GO. The lead integrated storage, memory and UI commits and completed the shared routing, authorization, translation and verification work. Only Worker A changed supabase/**. The product still has one gameplay DM.
- Dedicated bilingual Saves screen with Save Games and Timelines tabs, Quick Save, named manual saves, bounded autosaves, safety-before-load records, load confirmation and preserved-timeline switching. Desktop placement follows Sessions; mobile uses More and retains five bottom controls. The existing charcoal/bronze design is preserved.
- Immutable deduplicated record-version manifests restore exact structured state, consumed/equipped/stored items, quests, time/location, rests/encounters/effects, pending operations/checks, effective settings/guidance and public/private memory membership. Loading forks a path; switching restores a preserved head. Neither regenerates narration, replays mutations or rerolls recorded dice.
- Exact inherited source/version membership excludes abandoned public/private history, summaries, aliases and NPC knowledge before retrieval limits. Phase 3 bounded context and manual-correction authority remain. Explicit campaign-wide canon corrections propagate on activation; branch corrections preserve siblings.
- Stable request IDs, atomic safety/fork/load/switch, monotonic activation fences and revoked execution leases protect retries and concurrent tabs. Operation IDs used in an abandoned future cannot become fresh actions. Stale provider/job callbacks and browser writes fail closed. Drafts and uncertain requests remain available for explicit review/retry.

## Phase 3.5 files / areas changed

PHASE3_5_CONTRACTS.md; shared save DTOs and timeline envelopes; src/lib/saves/ and src/lib/server/saves/; campaign Saves routes/page; authorized repository/gameplay/memory services and RPC adapters; Phase 3 memory filtering/context/jobs; client draft/recovery providers and Saves UI/navigation/styles; merged Russian strings; migrations 202609190008_phase35_timelines.sql and 202609190009_phase35_fencing.sql; focused Phase 3.5 tests and updated prior compatibility fixtures; synthetic application/privacy acceptance scripts; MASTER_SPEC.md §42, DEVELOPMENT_PLAN.md, PHASE3_5_BRIEF.md, PHASE3_5_SETUP.md and this record. Local environments, credentials, backups, logs, reports and build output remain ignored.

## Phase 3.5 tests and build status

### Automated local verification

- Final Next route type generation, TypeScript check, full ESLint and normal Turbopack production build **passed**. The final build followed live/browser verification; no lint warnings. Worker-local tests were followed by the full integrated gate.
- Full integrated suite: **303 total, 302 passed, 1 intentionally skipped, 0 failed**. The skip is the historical opt-in Phase 1 empty-database seed test; the populated database was not reset or reseeded. HTTP tests targeted the integrated production preview on port 3001. Existing Phase 0–3 regressions passed alongside the new save/branch suites.
- The final rebuilt production preview also passed all **27 HTTP/route checks**, with no failures or skips.
- Embedded PostgreSQL executes all committed migrations and production adapters: populated upgrade, immutable saves, Quick Save replacement, bounded retention, exact restoration, active rests/encounters/effects/component provenance, preserved pending dice versus fresh future rolls, stale leases, idempotency, owner/campaign boundaries, correction scopes and global version allocation. Existing upgrade assertions still compare all original gameplay fields; they additionally validate new serving fences. Old memory fixtures now carry the required authorized campaign fence.
- The production SQL branch test adds **1,000 later events**, processes **at least 42 bounded memory batches**, forks repeatedly and returns to preserved heads. Exact mechanics and original public/private summaries return on the old timeline; abandoned secrets, NPC knowledge and summaries remain absent on the fork. The old promise remains retrievable below the existing **64,000** operational input cap. A separate mixed-history retrieval test rejects stale/sibling sources and nested references.

### Populated disposable local Supabase and application verification

- Created an ignored local database backup before applying committed migrations 008–009 atomically, without reset. All **40 pre-existing table row counts and content fingerprints matched exactly before/after migration**. Eight existing synthetic campaigns and their accounts/history were preserved, with one root timeline backfilled per campaign. The backup is 922,432 bytes; SHA-256 `FDE0E6815BC33FD7EF1D65DF6D4F8A5B5A559C50C529F253AB9F0339533A9867`.
- Appended only two unrelated fixtures: **Synthetic Phase 3.5 · Amber Observatory** and **Synthetic Phase 3.5 · Silver Current**. Real Auth/API acceptance passed **11 scenario groups**, covering manual/quick/replacement, safety/fork/switch, exact restored state and public/private/NPC/summary boundaries, duplicate and stale writes, saved pending dice/new future check identity, effective settings/guide restoration with new immutable versions, canon/branch corrections, logout/relogin and unrelated-campaign isolation.
- Anonymous/non-owner access, direct ordinary-owner privileged RPC/private-schema access, cross-campaign requests and foreign-origin writes were denied. The main harness inspected **199 ordinary API responses, six authenticated HTML pages and 20 production client bundles**, with no synthetic private marker exposed.
- A final read-only privacy pass inspected **11 additional Auth/API/error responses, 12 authenticated HTML pages, all 20 final client bundles and six ordinary application stdout/stderr logs**. No synthetic canary, server credential name or configured secret value appeared. Save/Timeline DOM checks also contained no canary. No real private material was used.
- **Zero OpenAI calls** during Phase 3.5 implementation acceptance. Deterministic synthetic fixture packets and source selections exercise the persistence/runtime boundary without inventing product replies or making paid model requests. The final preview retains the existing local provider configuration; no new key or model change is required.

### Browser verification actually performed

- Created manual saves, loaded a new named path, verified the safety/preserved-timeline UI, and switched back to the original timeline. English and Russian save titles persist after refresh.
- In a second tab, an unsaved character description survived a timeline change and its stale save control was blocked. This is a real two-tab browser check, separate from API/SQL conflict tests.
- Deliberately stopped only the temporary localhost test server, submitted a manual save and verified the title and original request were retained. Restarted it, chose **Retry same request**, observed exactly one resulting save card, then refreshed successfully. The ordinary error revealed no private detail.
- Changed and saved the synthetic campaign's autosave policy, confirmed its persisted values and restored the defaults. Saved Russian through General Settings and confirmed it across navigation; restored English afterward.
- Inspected **both tabs in English and Russian at desktop, 390px and 320px**, including narrow Save Games controls, timeline cards and mobile More navigation. No horizontal overflow; no sixth permanent bottom item. Restored the normal viewport. This is desktop browser resizing, not physical-device verification.

## Phase 3.5 key decisions and known limitations

- One existing active campaign projection, a private immutable row-version vault and exact manifests avoid copying the entire database per save. Atomic reads prevent mixed snapshots during activation. Technical revision/lease/fence rebinding never changes recorded outcomes or mechanics.
- Campaign identity, global preferences, ordinary canon/reference documents, feedback history and immutable document/settings histories remain outside historical rollback. Saved effective settings/guide versions control future play; new edits allocate versions above all preserved siblings. Feedback is never world history.
- Default autosaves occur at successful session boundaries, with **15** recent slots per timeline (configurable **10–20**, or off). Optional turn autosaves exclude feedback/OOC. Retention bounds the visible recent slots; immutable history referenced by saves/branches is preserved, so storage can grow. This is not a backup/export system.
- If campaign-wide canon changed after a saved unresolved proposal was generated, loading that stale proposal fails atomically instead of silently treating it as current. Input, checks and old history remain preserved; the app does not rebuild a plan, reroll or call AI merely to load. Owner recovery bypasses only soft policy, never consistency or authorization.
- Physical iPhone/Safari remains unverified. The optional historical Phase 1 conflict-rebase confirmation remains unverified; the new timeline stale-draft check is a different test. Finite synthetic branching/model evaluations are not a guarantee of perfect memory or universal recovery. No hosted deployment or real campaign/private-data acceptance has occurred.

## Preserved pre-existing owner edits

The original checkout's uncommitted DEV_STATUS.md and PHASE3_EVALUATION.md were preserved **byte-for-byte**, not staged, overwritten, attributed to this milestone or silently reconciled. Their original SHA-256 values were rechecked after implementation and browser verification and still match the record in PHASE3_5_CONTRACTS.md. Phase 3.5 uses the accepted committed documents in **.worktrees/phase35-lead** and separate worker checkouts. The original dirty main checkout remains at its prior accepted commit; the integrated lead branch is pushed safely to origin/main without modifying it or force-pushing. Deliberate reconciliation of those unrelated local edits remains separate from this milestone.

## Phase 3.5 remaining work and recommended next step

No required available implementation, verification or owner-acceptance gate remains open. **Explicit owner acceptance is recorded at `8099e0cca1463f767476190c456d4f3947e7c84e`.** The prepared local preview and restart instructions remain in **PHASE3_5_SETUP.md**; preview/runtime state was not changed or reverified for this status-only acceptance.

**Stop after recording and pushing this acceptance.** Await a separate owner instruction before any further work. World Engine, Phase 4, FRAME, VIDEO, deployment and real campaign/private-data import remain unauthorized.

## Accepted Phase 3 checkpoint (historical)

The following acceptance and verification belong to the preserved Phase 3 checkpoint. Its next-phase stop applied until the explicit Phase 3.5 authorization above.

### Phase 3 acceptance status

**PHASE 3 OWNER-APPROVED — Long-Term Memory.** The owner explicitly accepted implementation checkpoint `ca4499bc279d37eb52c0a36b0524eb19322071b0` on September 18, 2026. This acceptance is separate from implementation verification and does not claim additional testing. Phase 2 and earlier approved checkpoints remain preserved.

## Phase 3 owner-acceptance record

This status-only acceptance commit changes **only DEV_STATUS.md**. Application code, migrations, runtime, tests, configuration, Phase 3 contracts and campaign data are unchanged. The implementation verification results and their boundaries at the accepted checkpoint remain preserved; tests, typecheck, lint, production build, live model evaluation and browser checks were not rerun for this documentation-only acceptance. Verification for this commit is restricted to its diff and single-file scope.

All disclosed limitations remain in effect:

- Physical iPhone/Safari remains unverified.
- The optional historical Phase 1 conflict-rebase confirmation remains unverified.
- Finite synthetic retrieval/model evaluation is not a guarantee of perfect memory; the disclosed sample, failures, lead-review boundary and operational limits remain unchanged.
- No hosted deployment or real campaign/private-data acceptance has occurred. No real campaign or real DM-private material has been imported.

Phase 3 has no remaining owner-acceptance gate. **Stop after recording and pushing this acceptance.** Phase 3.5, Phase 4, World Engine, deployment and real campaign/private-data import are not authorized by this acceptance. Await a separate owner instruction before any further work.

## Phase 3 current status and completed work

- Three separate-worktree development workers acknowledged PHASE3_CONTRACTS.md and the lead-owned contracts before GO. The lead integrated storage, retrieval and UI checkpoints in order. When workers reached their usage limit, the lead preserved their commits and completed integration and verification locally, taking sole ownership of final migration fixes. The application still has one primary gameplay DM.
- Source-linked public/private indexes, immutable summary versions, ordered coverage, bounded jobs and correction invalidation extend the existing authoritative records. Original messages, scenes, events, document versions and state revisions remain available; derived memory never becomes the sole truth.
- END SESSION saves an exact resume boundary before recap generation. Failure/retry does not lose state or input. Continue preserves an unresolved operation and its recorded dice; only explicit resolution/cancellation and a subsequent Continue start the next session. Continuing does not heal, replenish supplies or advance world time.
- Bounded context retains exact current state, rules, effective guidance, pending checks and valid checkpoint metadata, then selects recent complete exchanges, canon and relevant older evidence. PostgreSQL English/Russian/simple text search and aliases support historical recall without embeddings, a second backend or a second gameplay agent. Missing essential evidence or unsafe size/conflict pauses rather than inventing continuity.
- Model-generated summaries are strict source/version selections. The server renders original complete source spans, retaining claims, uncertainty, negation and intentions. Separate private planning memory never reaches public narration, ordinary APIs or client bundles. Companion retrieval requires positive knowledge evidence for its listeners. Feedback/OOC/guide text is not world history.
- Sessions/Game expose saved-point, recap, pending, failure, explicit retry and Continue states in English/Russian, preserving the approved visual design. Correction invalidation withholds stale recaps immediately; rebuilding uses current originals. No Save/Load or timeline UI was added.

## Phase 3 files / areas changed

PHASE3_CONTRACTS.md; shared and pure memory modules in src/lib/memory/; authorized server memory/context/provider orchestration; campaign memory routes and gameplay integration; Sessions/Game components and localized labels; additive migrations 202609180005 through 202609180007; focused storage, populated-upgrade, retrieval, lifecycle, summary and UI tests; synthetic acceptance scripts; PHASE3_SETUP.md, PHASE3_EVALUATION.md, MASTER_SPEC.md, DEVELOPMENT_PLAN.md and this status file. PHASE3_5_BRIEF.md records the complete queued future brief and navigation clarification. Local environments, credentials, backups, reports and logs remain ignored.

## Phase 3 tests and build status

### Automated local verification

- Final Next route type generation, TypeScript check, full ESLint and normal Turbopack production build **passed**, after live/browser verification and the final retry fix. No lint warnings.
- The final production application also passed **27 HTTP/route checks** (19 preview/route and eight authorization/policy checks), plus the real local application verification below. Its temporary port-3001 server was stopped; the development preview remains on port 3000.
- Full suite: **266 total, 265 passed, 1 intentionally skipped, 0 failed**. The skip is the opt-in Phase 1 empty-database seed test, already passed at the accepted Phase 1 checkpoint; it must not reseed populated fixtures. Current real Supabase checks are reported separately below.
- Embedded PostgreSQL tests execute the migrations and production adapters, including upgrade of populated Phase 2 data; owner/campaign/private boundaries; immutable originals; source versions; stale jobs/corrections; ordered coverage; expired and exhausted retry recovery; duplicate requests; and pending recorded dice across END/Continue.
- Production SQL repeatedly compacted **1,000 events across 20 sessions into at least 42 bounded batches**, preserving exact HP/resources, zero-quantity consumed items and embedded-component provenance. The old promise remained retrievable and its runtime context stayed below the 64,000 operational input cap.
- The labeled retrieval evaluation contains **43 scenarios, 2,435 sources and 48 sessions across two unrelated campaigns**. Expected-source recall **37/38 (97.37%)**; **43/43 critical cases included required evidence or paused safely**; zero campaign/private leaks. A redundant derived summary was missed while its original promise was retrieved; the miss remains counted. This evaluator uses a dedicated candidate table; separate production-query/adapter/context tests cover the actual runtime path.

### Real disposable local Supabase / application verification

- Backed up the populated local database and applied additive migrations 005–007 without reset. Existing synthetic accounts, the single authorized owner and prior fixtures were preserved. An initial backfill type error rolled the entire first attempt back; it was fixed and covered by a populated-database regression before successful reapplication.
- Appended only **Synthetic Phase 3 · Lantern Harbor** and **Synthetic Phase 3 · Frost Circuit**. Real Auth logout/relogin, campaign isolation, anonymous/non-owner denial, ordinary-client RPC/private-schema denial, public-summary RLS and feedback exclusion from world retrieval passed.
- Ten normal owner API responses and all **17 final production client bundles** contained no synthetic private canary or server credential names/values (the earlier build's 20 bundles also passed). Six authenticated production HTML pages and four ordinary application log files likewise contained no marker or credential. No real private material was used. Stable check IDs/results and public records survived refresh/relogin. Final production verification made no model calls.
- Owner correction of a synthetic promise immediately invalidated old derived memory/checkpoint access. Rebuilding used the corrected red-compass record, while the unrelated campaign remained unchanged. Recap processing/feedback did not change HP, inventory, quests, scenes or time. One public recap failure was deliberately injected to verify recovery; it was not a provider outage.

### Live model-quality verification

- Configured **gpt-6-astra / xhigh**, strict Responses outputs and store:false; every response reported Astra. No fallback or model switch. **25 valid generated cases (21 continuations and four source-selection summaries) passed lead rubric review: 25/25, zero critical state contradictions and zero private disclosures.** One additional invalid-checkpoint case safely paused without a model call.
- The dedicated harness made 26 successful requests, including one initially misconfigured Russian fixture excluded from scoring. Its configured campaign language was corrected and the replacement answered in Russian. The original output and exclusion remain recorded. This was lead review, not an independent second review.
- Application acceptance added ten calls, including actual historical recall through the existing planner/narrator and recap recovery. One private-summary output failed validation, leaving coverage unchanged. Tightening the schema to nonempty, allowed source/version selections and explicitly retrying recovered it.
- Combined **36 generation requests: 35 validated successes, one rejected output; 59,679 input and 12,879 output tokens** including known rejected-output usage. Conservative uncached estimate **$1.24**, latency **2.39–24.18 seconds**, mean **8.65 seconds** per request. Within the authorized 48-request/$15 envelope. Full case/results/limitations are in PHASE3_EVALUATION.md; successful schema validation alone was not counted as quality acceptance.

### Browser verification actually performed

- Exercised END, preparing/ready/failure/retry, saved resume metadata, Sessions history, Continue with an unresolved action, and Continue to the next session. Reopened the same server-recorded **6 + 3 = 9** failed forage roll and explicitly confirmed it. Only completing the action charged its one hour; starting the next session charged nothing and preserved HP/items.
- After Continue, a real Game question recalled Nera's old unresolved brass-compass promise accurately. Separately rebuilt the corrected second-campaign recap, then continued without changing its HP/time or the other campaign.
- Inspected desktop, 390px and 320px layouts, English/Russian Game/Sessions and persistent language selection, including refresh. Narrow pages had no horizontal overflow. Restored English and the normal viewport. Owner-authored text and extractive quotations retain their original language.
- Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation were **not** tested and remain disclosed non-blocking limitations from earlier owner approvals.

## Phase 3 key decisions and known limitations

One Supabase backend, existing authoritative mechanics and one gameplay DM remain. Source/version references and positive knowledge checks precede ranking; exact state and manual corrections outrank summaries. Jobs publish coverage atomically and never rebuild from summaries alone. No private error details or source IDs appear in public failure messages.

The 64,000 application input cap is intentionally smaller than Astra's context window. Each lifecycle request processes at most four jobs; preflight at most two. Polling does not generate. A fresh explicit retry can recover an exhausted attempt window, while duplicate operation IDs cannot reset an active lease. Long backlogs may require another explicit continuation. Complete paragraphs are preserved; an indivisible source exceeding 24,000 UTF-8 bytes pauses safely. These are bounded, inspectable memory aids, not a guarantee of perfect recall.

Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain unverified. Quality results are a finite synthetic sample reviewed by the lead. No hosted deployment, real campaign acceptance, semantic/embedding retrieval, Save/Load or timeline restoration is claimed. Session continuation uses current authoritative state; it is not historical rollback.

## Phase 3 remaining work and recommended next step

No required Phase 3 implementation, verification or owner-acceptance gate remains open. **Explicit owner acceptance is recorded at `ca4499bc279d37eb52c0a36b0524eb19322071b0`.** Open http://127.0.0.1:3000/campaigns and follow PHASE3_SETUP.md using the existing synthetic owner account; keep Docker Desktop and the development server running. No new key, provider or manual configuration is needed for this prepared local environment.

The complete queued Phase 3.5 Save/Load/Timeline Fork brief and the dedicated **Saves / Сохранения** navigation requirement are recorded in PHASE3_5_BRIEF.md, MASTER_SPEC §42 and DEVELOPMENT_PLAN. The future screen will have Save Games and Timelines tabs, desktop placement after Sessions, and mobile access through More. This is documentation only. Phase 3 owner acceptance is now recorded; separate Phase 3.5 authorization is still required before implementation. Stop here; do not deploy, import real material or begin another phase.

## Accepted Phase 2 checkpoint (historical)

The following Phase 2 sections preserve the accepted checkpoint and its verification. Their next-phase prohibition applied until the new Phase 3 authorization recorded above.


**PHASE 2 OWNER-APPROVED.** The owner explicitly accepted Phase 2 at commit `24fcd405b65b7ddd281837e491f1975e1fe3a765` on September 18, 2026. This acceptance is distinct from the implementation and verification results recorded below. The disclosed non-blocking limitations remain unchanged, including physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation, which remain unverified. Phase 1 remains owner-approved at `a0c7a815b413251df45a961af8c77986975e546f`, recorded in `1a4fee6cc7e3827a51749e23fe1b00a7eee78b1a`. Phase 3 has not begun and is not authorized. Deployment and real campaign/DM-private imports remain prohibited.

## Phase 2 current status and completed work

- All three development workers acknowledged PHASE2_CONTRACTS.md and the lead's shared DTOs before GO, used separate worktrees/branches, and did not push. The lead integrated runtime/database, mechanics and UI in that order. Only the database worker changed supabase/**. These were development workers; the application has one primary DM runtime.
- Owner-authorized APIs connect persistent Game, OOC, companion conversations and separate Chat with DM to the server-side runtime. Strict planning/output schemas, public-only narration and allow-listed errors keep private planning and raw provider payloads out of browser responses.
- Durable accepted input, operation/check IDs, fenced leases, saved plans/results and transactional consequences survive failure and retry. Duplicate operations return their recorded result; stale state/settings/document revisions reject old proposals. Dice use server randomness; animation never generates a new roll. Explicit rerolls enforce the campaign allowance.
- The explicit console-basic-v1 house profile enforces supported checks/combat budgets, enemy HP/damage scaling, defeat policies, items/resources, quests/locations, camp/rest supplies and recovery, remote storage/cargo access, meal/coffee preparation and consumption, effects and the component-aware spear transformation. Unsupported mechanics fail closed. Manual corrections and isolated Phase 0 previews remain available.
- Feedback proposes guidance without automatically applying it. Session approval and immutable campaign-guide versions reuse existing document infrastructure, revision checks and retry receipts. Session guidance expires with its session; ordinary gameplay receives approved guidance rather than the entire feedback conversation.
- The owner-selected baseline is gpt-6-astra with xhigh reasoning. Explicit server configuration, bounded context and strict Responses output remain in place. No automatic fallback or switching. The earlier configuration-only change was verified against official OpenAI documentation before editing; live verification is recorded separately below.
- Acceptance review identified missing context needed to reliably plan the supported rules and narrate exact results. Planning now receives centralized profile constants, check/action pairings and historical settings pinned by active rests/encounters. Narration receives an allow-listed projection of validated public after-values, including effect and turn-budget changes. Missing pinned settings pause safely. Raw resolutions, hidden checks and private patches remain excluded. Four new context regressions cover these boundaries.
- Safe provider diagnostics now record HTTP status and known error codes/types only, never arbitrary error messages. Added the bounded opt-in live harness and fresh-fixture privacy checks. Corrected two Russian system labels without translating owner-authored narration or changing the visual design.

## Phase 2 files / areas changed

Integrated implementation: PHASE2_CONTRACTS.md; shared DTOs/context/schema/mechanics/turn modules in src/lib/gameplay/; server-only src/lib/server/dm/ and gameplay service; campaign play/turn/resume/guidance routes; additive migration 202609180004_phase2_runtime.sql; Game/Chat/Camp/actions/configuration UI and existing Party/Inventory/Settings integration; gameplay.css; EN/RU strings; tests and synthetic acceptance scripts; specification/plan/setup/status documentation.

The live-acceptance follow-up at `24fcd405b65b7ddd281837e491f1975e1fe3a765` changed the context builder, provider diagnostics, focused regressions, combat system-label localization, scripts/gameplay-live-acceptance.mjs, scripts/gameplay-access-acceptance.mjs, locale documentation, PHASE2_CONTRACTS.md, PHASE2_SETUP.md and this status file. No new migration or mechanic was introduced. Local environment, credentials, reports, logs and backups remain ignored.

This owner-acceptance follow-up changes **only DEV_STATUS.md** to record approval of that exact checkpoint. No application code, configuration, migrations, runtime or campaign data changed.

## Phase 2 tests and build status

The results below belong to the owner-approved implementation checkpoint `24fcd405b65b7ddd281837e491f1975e1fe3a765`. Tests, typecheck, lint, build and live API checks were not rerun for this status-only acceptance record; its diff was checked and restricted to DEV_STATUS.md.

### Automated local verification

- After live/browser checks: Next route type generation, TypeScript, full ESLint and the normal Turbopack production build **passed**. No lint warnings.
- Final full suite: **218 total, 217 passed, 1 explicitly skipped, 0 failed**. The skipped test is the opt-in Phase 1 empty-database integration/seed test; it passed at the accepted Phase 1 checkpoint and must not reseed these populated fixtures. Current real Supabase checks are separate below.
- The suite covers output/patch validation, owner/campaign boundaries, turn serialization and lease recovery, duplicate/reconnect/retry, stable dice, explicit rerolls, hidden/DC filtering, stale corrections/settings, required/discretionary checks, inventory/resources, encounters/rest/storage/effects/transformation, guidance approval/scope/version conflicts, bounded context/oversize and drafts/localization.
- Embedded PostgreSQL integration executes all four migrations with synthetic Auth and scripted provider responses through the production turn engine/RPC adapter. A separate 26-operation deterministic mechanics journey reloads serialized state between actions. Neither is described as live OpenAI verification.
- Final checks exposed a flaky privacy assertion that searched random UUID text for the letters 'dc'. It now checks actual field names; the exact expected public object assertion remains. An unexpected untracked root loading.tsx made redirects/404s stream with HTTP 200. Its contents were preserved in an ignored local backup and it was removed from routing. Original redirect/404 assertions were retained and passed. The **19 route/HTML tests also passed against the final production server**.

### Real disposable local Supabase / application verification

- Preserved the populated Phase 1 database and its two accounts/one authorized owner. At integration checkpoint 8178509, a local backup preceded additive migration 004; no reset/destructive reseed occurred. Auth/Postgres/REST remain local. Service credentials were configured directly in ignored environment files without exposing them.
- At that integration checkpoint, scripts/gameplay-app-acceptance.mjs passed **all 8 groups** against real Auth/database/application APIs: owner/non-owner/anonymous/origin restrictions, persisted mechanics, duplicate/concurrent protection, stale correction, campaign isolation, rest/recipes/effects, consumed-source preservation, quest/location consequences and logout/relogin. These checks did not call OpenAI.
- The live acceptance harness appended a fresh Glass Orchard / Quiet Comet synthetic pair, preserving earlier fixtures. Final verification passed for **26 committed operations**, exact saved input/status/results, duplicate submissions of all 26 operations without new generations, logout/relogin durability and unrelated-campaign isolation. The initial failed-operation verification separately passed before billing was fixed: no narration, dice, state revision or gameplay consequence committed, and exact input survived relogin.
- Guidance verification passed: explicit session approval, separate campaign approval, a manual guide edit and restoration of an older version as a new **fourth version**, preserving all originals. Proposals did not automatically edit the guide; approvals/manual version operations did not change HP, inventory, quests, scenes, time or other gameplay state.
- Final scripts/gameplay-access-acceptance.mjs --live passed against both development and the final production application. Real PostgREST denied anonymous, ordinary owner and non-owner direct access to the service-only runtime RPC/private schema. **30** normal owner campaign/play/turn responses contained no synthetic private canary, operational checkpoint or server credential. All **20** production client JavaScript files contained no private canary or server credential names/values. Only synthetic private markers were used.
- The temporary production verification server was stopped. The development preview remains at **http://127.0.0.1:3000/campaigns**, using local Supabase.

### Browser verification actually performed

- Inspected desktop, 390px and 320px layouts, including Game, Russian Game/settings, Camp, companion controls and Chat with DM. Checked narrow pages had no horizontal overflow. Saved Russian, refreshed to verify translated persistent controls, then restored the owner's English preference. Saved narration remains in its campaign language.
- Earlier unconfigured-provider checks verified exact input/draft survival across navigation/refresh, retry of the same accepted action, cancellation without draft loss, isolated feedback errors and no fabricated narration/rolls.
- During live acceptance, **Resume this turn** recovered a rate-limited camp action using the same operation. Entering camp granted no early healing, supplies or time. Persistent records reflected later explicit recovery and charges.
- Opened the actual interactive dice result: server-recorded 1 + 4 = 5 for the failed forage check. Replayed, refreshed and reopened it with the same result, then clicked **Continue with this result**. Narration followed the resolved failure; read-only API checks confirmed stable check IDs/results.
- In Chat with DM, clicked **This session** and **Save for this campaign** on separate real proposals. Manually saved a guide edit, opened version history and restored the older version as a new version. The mobile feedback/guide screen was also inspected at 320px.
- Companion knowledge/future-plan behavior and the Russian second-campaign action were verified against actual live responses and persisted public snapshots. Not every live turn was individually exercised through browser controls; the bounded harness uses the same authorized application API.

### Live OpenAI verification: passed, bounded synthetic sample

**26 committed turns:** 25 in Glass Orchard and one additional Russian-language action in unrelated Quiet Comet. The sequence used natural-language owner input through the production planner/narrator, not scripted provider results. It covered observation, one healing item, a focus expenditure, a future intention, companion knowledge/acknowledgment, camp/meal/coffee/rest, stash access/refusal, server-rolled forage and transformation, an encounter with player and private NPC attacks, negotiation, exact-state continuity, quest archival, two feedback proposals and a post-approval turn.

Persisted results matched the expected code-enforced consequences: HP recovered only as authorized; focus and consumables remained spent; meal/coffee waited for rest completion; a spear retained component provenance; a blocked withdrawal changed nothing; negotiation granted no healing/refund; the stated intention never became an accomplished fact. Private NPC roll details stayed absent. The Russian action changed only its own location/quest; the first campaign stayed unchanged. Review of all sampled public narration found no material state contradiction or synthetic private marker disclosure.

**Actual model:** every successful response reported gpt-6-astra; configured reasoning was xhigh throughout. **54 generation requests total: 53 application requests (49 successful, 4 failed) plus one earlier tiny diagnostic request that failed with insufficient_quota.** The 49 successful responses comprise 24 planning, 23 narration and 2 feedback responses. A separate non-generation model-access GET returned HTTP 200.

Before billing was fixed, the application had two failed attempts on the first operation (the first lacked an HTTP diagnostic; the next returned 429); the separate diagnostic established insufficient_quota. After billing, two temporary rate_limit_exceeded responses occurred, one in planning and one in narration. Explicit resumes reused saved operation identity and recovered successfully. No automatic retries, rerolls, model fallback or settings reduction occurred.

**Reported successful usage: 427,975 input tokens and 26,479 output tokens.** Using the verified [Astra standard prices](https://developers.openai.com/api/docs/models/gpt-6-astra) of $10/M input and $50/M output gives approximately **$5.60 before input caching discounts**. This is an uncached estimate for reported successful usage, not a billing receipt; cached-token breakdown and failed-request usage/cost were unavailable. Successful per-request latency ranged from **5.75 to 25.95 seconds**, median **10.37 seconds**; a gameplay turn normally needs both planning and narration. The existing 4,096 total output/reasoning reserve and 60-second request timeout were sufficient for this sample.

## Phase 2 key decisions and known limitations

- One DM runtime with private planning and public-only narration; the browser never receives raw provider/private planning data. External calls run outside transactions; fenced commits revalidate the campaign revision. The server remains authoritative for mechanics.
- Astra/xhigh is explicitly selected. Supported alternatives remain owner choices; there is no automatic switching. Strict Responses schemas, store:false, bounded requests and content-free diagnostics remain.
- Context conservatively counts serialized UTF-8 bytes plus framing/schema against explicit input/output/safety budgets and a 64,000 input cap. At most 32 complete exchanges are admitted. Missing essential history or oversized mandatory sources pause rather than silently truncating/inventing continuity. No automatic summaries, compaction, retrieval, embeddings or guarantee for arbitrarily long campaigns.
- The small console-basic-v1 house profile is not official D&D or an automatic rules-document interpreter. Rest/encounter settings are pinned when they begin; changes are prospective. Existing inert records are reused.
- Live acceptance is a finite synthetic sample, not a general model-quality guarantee. The post-approval response was compatible with the approved style and context tests verify guidance inclusion, but this does not establish causal style adherence across future responses. OpenAI availability, quota and rate limits remain external constraints; retry preserves the recorded operation.
- **Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain non-blocking unverified items.** Desktop-browser mobile widths do not verify physical Safari. No hosted environment, deployment or real campaign/private data was tested or imported.

## Phase 2 remaining work and recommended next step

No required Phase 2 implementation or acceptance gate remains open. **Explicit owner acceptance is recorded at `24fcd405b65b7ddd281837e491f1975e1fe3a765`.** The known limitations above remain disclosed; acceptance does not claim additional verification. Await separate owner authorization before starting any next phase.

Stop after recording and pushing this acceptance. Do not begin Phase 3, deploy or import real campaign/DM-private material.

## Approved Phase 0 checkpoint

The owner explicitly approved **96b69dcd63d2fa015f5e75bcc5d632c41e04369e**. It remains unchanged in Git as the approved restore point.

- **Original implementation verification:** typecheck, lint, production build and 60 automated tests, plus the implementation browser checks recorded in the historical VERIFICATION.md.
- **Independent review reported by the owner:** typecheck, lint, production build, 41 logic/localization tests, 5 HTTP tests and 14 additional HTML/status route checks passed. Independent visual and image-asset verification was **not performed**. Physical iPhone/Safari remains unverified. These records are distinct.

## Accepted Phase 1 status (historical checkpoint)

All Phase 1 subsections below describe that accepted checkpoint, not the current Phase 2 implementation. In particular, their disabled-gameplay/no-service-key statements were true at Phase 1 and are superseded by the explicit Phase 2 record above.

Remote documentation commits through f46014d were safely merged; section 38 remains intact. Our persistence and Chat with DM additions are sections 39 and 40. Only ordered source records and immutable correction-history foundations are added now; no memory runtime is implemented.

**The owner explicitly accepted Phase 1 at commit `a0c7a815b413251df45a961af8c77986975e546f`.** This is owner approval of that implementation checkpoint, separate from the verification results below. The required local database, application HTTP and browser acceptance checks passed on September 18, 2026 UTC (September 17 locally). Physical iPhone/Safari and the optional conflict-rebase confirmation action remain disclosed, non-blocking unverified items; acceptance does not claim they were tested. At that acceptance checkpoint Phase 2 was not yet authorized; its subsequent authorization is recorded above. Deployment, real campaign imports and real DM-private imports remain prohibited.

Three implementation workers used separate worktrees and agreed shared contracts before implementation; the lead integrated their work. The queued Chat with DM addition joined the campaigns/documents workstream, with an additive migration from the sole database owner. This acceptance follow-up preserves that implementation and the approved Phase 0 checkpoint.

Disposable local Supabase is running on WSL 2.7.14 and Docker Desktop 4.91.0 / Engine 29.8.0. The official CLI 2.117.0 release checksum was verified. All three committed migrations applied to the initially empty database. After the owner selected Docker Desktop's localhost-only publishing option, Docker mappings and Windows listeners were verified on loopback before accounts were created. Exactly two synthetic Auth users and exactly one owner-registry row exist. The two campaigns are **Synthetic · Tidal Observatory** and **Synthetic · Copper Orchard**. Only synthetic private canaries were inserted through trusted local SQL for leakage checks. No deployment, real campaign import or real DM-private import occurred.

Two acceptance blockers were reproduced and fixed narrowly: the local Supabase email provider was disabled alongside public signup, and Next proxy normalization changed `127.0.0.1` to `localhost` before the strict origin check. Email/password login is now enabled while global public signup remains disabled; the proxy preserves the original URL. Real tests verify both owner login and rejection of signup, non-owner access and foreign-origin writes. No origin check was relaxed.

## Queued section 38 coordination checkpoint

- **Documentation incorporated:** fetched origin/main and confirmed `d5b2771`, `24443b7` and `f46014d` are ancestors of the integrated branch, merged in `2f85834`. Section 38 matches the remote text verbatim. Its milestone 1–3 requirements and the separate Chat with DM refinement are retained. This follow-up does not restart implementation or duplicate the merge.
- **Foundations implemented and verified:** existing campaign/entity UUIDs and operation request IDs; database-assigned scene/feedback ordering; immutable document/settings versions; revision-checked state corrections; public/private access boundaries; and immutable original/correction receipts linking campaign, operation, source record and resulting revision. Migration 003 was supplied by the existing database/migrations owner and integrated in `04c6c73`. Scene ordering survives corrections, and document restoration appends a version. SQL tests cover tied timestamps, source relationships, retries, original-record preservation and populated-database migration. This is embedded PostgreSQL verification with synthetic auth, not live Supabase verification.
- **Runtime features deferred:** Phase 2 context assembly/token budgeting and live DM behavior; Phase 3 automatic summaries, historical/semantic retrieval and correction-driven derived-memory rebuilding. No embeddings, new memory service or memory UI were added. Section 38's long-campaign, compaction, retrieval-quality and model-quality gates remain future acceptance requirements, not Phase 1 results or additional work.

## Completed work

- Owner-authenticated server APIs, verified cookie sessions, owner-only RLS, separate private schema, campaign-scoped references, bounded same-origin writes and safe public errors.
- Campaigns, independent application/campaign settings, immutable document/settings history, atomic idempotent manual corrections and stale-revision conflicts.
- Generic character/companion/NPC records, storage/items/equipment, sessions/public scenes/resume state, quest/location/asset metadata screens.
- Chat with DM owner messages and reference-only DM Guide reuse the existing save/version/restore infrastructure; no fake replies, automatic guide edits or runtime application.
- Approved Phase 0 demonstrations remain isolated under `/preview`. Persistent screens use actual campaign data without sample fallbacks. Gameplay stays disabled.
- Three migrations include stable public source ordering and immutable private correction receipts. Remote memory requirements remain documented; no summaries, retrieval or memory UI were implemented.
- Setup instructions and opt-in non-destructive two-campaign synthetic verification. START_HERE reflects selectable media providers/models and required owner-access verification before separately approved deployment.

## Files / areas changed

`supabase/`, `src/lib/server/`, `src/lib/persistence/`, owner-only API routes, persistence providers/shell/forms, campaign route integration, English/Russian catalog, isolated preview routing, focused tests, setup/contract/spec/plan/status documentation and dependencies.

The verification follow-up at `a0c7a8` changed only `next.config.ts`, local `supabase/config.toml`, the live integration regression, the new `scripts/persistence-app-acceptance.mjs`, local-tooling ignores, and setup/status documentation. It introduced no migration, feature, AI behavior or visual refactoring. Credentials, CLI binaries, logs and disposable configuration remain ignored locally.

This owner-acceptance follow-up changes **only `DEV_STATUS.md`** to record approval of the exact checkpoint above. No application code, configuration, migrations, runtime or campaign data changed.

## Tests and build status

The results below belong to the approved implementation checkpoint. Tests, typecheck, lint and build were not rerun for this status-only acceptance record; its diff was checked and restricted to `DEV_STATUS.md`.

### Automated local checks

- Final type generation, TypeScript check, full ESLint and production build **passed**, rerun after live/browser verification. No lint warnings.
- Ordinary suite: **122 total, 121 passed, 1 explicitly skipped, 0 failed**. It passed against both development and production servers; the final development rerun passed again after browser acceptance. The skipped test is deliberately opt-in and was executed separately below, not silently counted as a pass in this invocation.
- Embedded PostgreSQL tests execute all three migrations with synthetic auth roles: durable reopen, two campaigns, owner/non-owner/anonymous access, immutable document/guide history, revision conflicts/retries, inventory integrity, feedback isolation, ordering and preserved original/correction receipts. These remain distinct from real Auth verification.

### Live disposable Supabase and application HTTP

- Opt-in `tests/persistence-database-supabase.test.mjs`: **1 passed, 0 failed, 0 skipped** against real local Supabase Auth/PostgREST after the provider fix. Public signup is explicitly rejected. All three migration versions and the two-user/one-owner counts were checked directly. Do not rerun its seed step on these populated fixtures; it correctly refuses a nonempty database.
- New application acceptance script: **all 9 groups passed against development on port 3000 and production on port 3001**. Real cookie login/logout/relogin, anonymous and independently authenticated non-owner denial, cross-campaign references/history denial, immutable restore, stale-write conflicts, independent settings, manual character/inventory/session/scene corrections, retry-safe DM feedback, guide separation and persisted relogin snapshots passed.
- Before/after snapshots prove sending feedback changes only its feedback collection: HP, inventory, quests, scenes, public state/time/canon, settings and guide remain unchanged; the other campaign remains unchanged. Unsupported dice/combat/rest/DM-reply/private operations and foreign-origin writes are rejected.
- Synthetic private canaries were absent from every checked public HTTP response and all 20 production JavaScript chunks. Normal authenticated/anonymous private-schema access is denied. No service-role key is in the app environment; no environment or credential file is tracked.

### Browser acceptance

- Real owner sign-in, sign-out and sign-in again passed. Both unrelated campaigns retain distinct characters, places, inventories and campaign languages. The second campaign has no messages or guidance from the first.
- Two Library tabs loaded the same revision: the first saved, the second received a conflict, and its full unsaved draft remained intact. Refreshing saved data presented the newer comparison without replacing that draft. Document history/restoration in the other tab appended a new version and retained older versions.
- Stopping only the local REST service produced a genuine feedback-save error. The complete typed draft remained. Restarting the service and retrying saved it with a timestamp; refresh and relogin retained it. No fake DM reply appeared and sending feedback did not modify the guide.
- Manually saved two DM Guide versions, viewed their history and restored the older as a new current version. The restored text and feedback survived refresh and relogin.
- Manually corrected inventory quantity in the Russian 320px interface; refresh retained the new quantity. Character HP, session recap and manually corrected scene records saved by the HTTP checks were visible in the browser.
- Saved Russian globally, refreshed and signed out/in: Russian returned. Saved English again and loaded it on the narrow-screen settings page. Campaign story languages remained independent. Inspected desktop and 390px/320px screenshots and menu/form interactions with no horizontal page overflow. The mobile inventory dialog scrolls within the screen.
- Game's execution controls remain disabled; only manual records and the separate Phase 0 demonstrations are available.

### Not claimed

Physical iPhone/Safari was not tested. An additional **Keep my draft for the next revision** native confirmation stalled browser automation; completing that optional rebase confirmation remains unverified. This does not negate the observed stale-save rejection and exact draft preservation above. The owner was asked to cancel the synthetic confirmation if visible. No deployment, hosted Supabase verification, live AI, gameplay execution or real-data acceptance is claimed.

## Key technical decisions

One Supabase backend; no browser database client, service key, AI or second runtime. Every public read has an explicit projection. Writes use one allow-listed transactional RPC with expected revisions and stable retry IDs; direct table writes are denied. Document restore appends a version; scene settings revisions never change when preferences change. The private schema has no ordinary application reader. PGlite is development-only SQL verification.

Feedback is append-only, campaign-scoped owner text. The DM Guide is a stable linked reference document using the same immutable history, not established canon. Approved guidance is not applied until a separately authorized Phase 2 runtime exists. Future companion/rest/recipe/combat structures remain inert.

## Known issues

Physical iPhone/Safari and the optional conflict-rebase confirmation action remain unverified and non-blocking for the owner's explicit Phase 1 acceptance. The optional Supabase Vector **log collector** restart-looped on this Windows host and is excluded from the local stack; required Auth/Postgres/REST services are healthy. This collector is unrelated to embedding/vector-search features, which remain unimplemented. A saved Russian preference is loaded after initial page hydration, so a brief English loading render can occur on refresh; the saved preference then appears correctly.

NPC records are supported, but NPC equipment is unavailable in Phase 1; equipment supports players, companions and appropriate transports/mounts. Asset uploads/media generation and gameplay execution are outside this phase. Preexisting history receives deterministic sequence backfill; unknown old commit order is not reconstructed. No secrets or real campaign material are seeded.

## Remaining work

No required Phase 1 acceptance work remains. The owner has explicitly accepted the implementation with the two non-blocking unverified items preserved above. Stop after recording acceptance; do not reset or replace the synthetic fixtures, import real campaign or real DM-private material, deploy, or start Phase 2. Acceptance does not itself authorize any next phase.

## Recommended next step

Await a separate owner instruction. No further implementation or setup is requested by this acceptance. The following local access instructions remain available for optional inspection of the accepted synthetic environment.

Keep Docker Desktop and the port-3000 development server running. Open **http://127.0.0.1:3000/campaigns**. The browser is signed in to the synthetic owner; if sign-in is requested, use the ignored local `test-results/LOCAL_TEST_LOGIN.txt` file directly in the application, never in chat. The temporary production verification server on port 3001 was stopped after its checks.

For optional inspection: open each synthetic campaign and compare its records; in **Chat with DM / Чат с DM**, refresh the saved feedback and restored guide; in **Library**, open version history; in **General Settings**, save either interface language and refresh. Sign out/in once if desired. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full repeatable procedure. If the older synthetic Library tab has a native draft-confirmation prompt, cancel it before continuing.

The approved visual preview remains separately isolated at **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. The configured persistent application starts at **http://127.0.0.1:3000/**. No sample campaign is imported into its database.

---

## Historical remote documentation handoff — September 18, 2026

The owner reports having sent Phase 0 approval and the Phase 1 multi-agent implementation prompt to the local development Codex. The implementation status below records the last published Phase 0 checkpoint, not a verification of the local Phase 1 work. Do not interpret its historical approval-pending/stop statements as revoking the owner's subsequent authorization.

Added MASTER_SPEC section 38 and aligned DEVELOPMENT_PLAN milestones 1–3: exact state versus derived memory, source/visibility/revision tracking, model-specific context budgets, bounded retrieval, validated summary/checkpoint lifecycle, corrections/invalidation, idempotent turn/resume behavior, failure recovery and measurable synthetic acceptance gates. These are requirements, not implemented features or guarantees of perfect recall.

This update changes documentation only; no application code, migrations, dependencies, runtime, credentials or campaign data were changed. Tests/typecheck/lint/build were not rerun for this update. Earlier verification results below remain historical.

For the active lead integrator: fetch and safely merge these remote documentation changes at the next safe checkpoint; preserve local work, including the separately requested Chat with DM refinement. Coordinate overlapping documentation edits. Continue authorized Phase 1; incorporate only its memory foundations now. Phase 2/3 runtime work remains deferred until separately authorized.

---
# Development status — Mega DM v1 production candidate — AWAITING OWNER REVIEW

**Milestone/status (2026-09-23):** Mega DM v1 is implemented and integrated on `codex/mega-dm-v1` from exact accepted base `d927ae6c1039d4aeb66e2fc430e66a9a845a45a8`. The frozen implementation candidate is `33194f1` before this status documentation. It is **deterministically/security/UI verified**, but **not live-model-quality evaluated and not owner accepted**. The previous Mega DM *documentation* acceptance and all historical D2A acceptance/evidence below remain unchanged. No D2B or later roadmap implementation was started.

**Implemented/integrated:** the existing `DmProvider.plan/narrate/feedback` receives compact owner-scoped, versioned Core Doctrine and at most two relevant approved Craft Cards per stage through its existing context builder. A deterministic literal trigger selector ranks by match count and stable key and may select zero optional cards. Exact selected versions, policy and campaign Style/settings revision are pinned once in the server-private turn source; retries retain that source, and existing pending turns never silently acquire Craft. Mandatory state/evidence wins the context budget. Craft is guidance, never Canon, Memory fact, mechanics or state authority. The v1 seed contains one compact bilingual Doctrine and seven bounded bilingual original-wording cards. The owner can manually create/edit/activate immutable versions, including restoring an earlier version without deleting history.

**Campaign and teaching:** seven bounded DM Style choices extend existing campaign settings/history, so saves and timelines restore Style while old settings resolve neutral defaults. The owner-scoped global Craft library does not roll back when a campaign save loads. The existing Chat with DM and legacy session/campaign guidance remain. New campaign-Style or explicitly global Craft teaching uses a reviewable Approve/Edit/Reject path with exact proposal/timeline fencing and idempotent receipts. Feedback does not directly change gameplay facts, inventory, dice, World Events or other authority. Main menu → DM Craft and Campaign Settings → DM Style are EN/RU and responsive. A local `/preview/mega-dm` view is **synthetic/read-only** and never calls an owner API.

**Areas changed:** `MEGA_DM_V1_CONTRACTS.md`; additive `supabase/migrations/202609230017_mega_dm_v1.sql`; campaign settings/validation; server Craft and teaching routes; turn claim/context integration; owner UI/navigation/translations/styles; 48-scene frozen synthetic fixture, offline benchmark/security tests and a network-disabled future live replay harness. Existing DM Guide, provider registry, Memory, Saves/Timelines and World authority are preserved.

**Fresh final verification:** full repository suite **1,130 passed, 1 skipped, 0 failed** against the local production build (`PREVIEW_URL=http://127.0.0.1:3094`); the skipped test is an explicitly opt-in live disposable Supabase Auth/PostgREST check. Route type generation and non-incremental TypeScript check passed; repository-wide ESLint passed with **zero warnings**; Next.js production **webpack** build passed. Mega DM focused suite: **22 passed**, followed by one additional populated pre-upgrade migration regression that passed both focused and in the final full suite. Disposable PGlite migration/authority tests cover owner isolation, versioning, selection, retry pinning, old-turn compatibility, populated pre-Mega-DM campaign/manual-save upgrade, save/timeline Style rollback, global Craft non-rollback, Teach DM idempotency and sibling-timeline rejection. The first full-suite attempt lacked the required local HTTP server; the next attempt found one preview i18n accessibility label, which was fixed and verified before the passing final run. No real or persistent owner database migration ran.

**Browser check (separate from tests):** synthetic `/preview/mega-dm` rendered and switched EN/RU at 1280px desktop and at 390px and 320px mobile viewports with no horizontal overflow. This was an in-app browser viewport check, **not physical-iPhone testing**. The actual authenticated owner API was not exercised locally because this isolated worktree has no configured Supabase/owner credentials; HTTP boundary tests and PGlite cover the server behavior deterministically. Hosted Supabase behavior remains unverified.

**Limits/next step:** zero live provider/model calls were made. The 48-scene fixture and offline rubric verify selection, authority and privacy constraints, not subjective storytelling quality. The later baseline/Core/Craft live replay requires separate owner authorization. Owner should review the synthetic screens and the click path in `MEGA_DM_V1_OWNER_REVIEW.md`, then decide whether to authorize live model-quality evaluation. This milestone does not authorize a production migration, deployment, D2B or owner acceptance by inference.
