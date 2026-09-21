# D2A task-specific provider timeout recovery

Implemented on `codex/world-lab-d2a-single-model` from `9c6708b5ad066699da7a60c52dc189e9421ccc0e`. The owner authorized a narrow production timeout correction and deterministic verification, not another live evaluation attempt.

## Correction

The existing server-only `createStructuredRequester` accepts a server-selected task/purpose. `world.compose` chooses **180,000 ms**; `world.resolve` with detached `simulation` purpose chooses **120,000 ms**. All other callers retain **60,000 ms**, including ordinary DM, Memory, Canon compiler, gameplay World Logic and ordinary World resolution. An optional existing `timeoutMs` override can shorten, never exceed, the selected ceiling. The same abort signal covers fetch and response-body consumption. Safe server attempt diagnostics include the effective timeout without prompts or credentials.

Composition and the existing resolver's `simulate` method supply the task/purpose. No browser or model field selects timeout. Provider, registry, reasoning, wire payload/schema, input/output budgets, Scenario/Divergence authority, SQL, settlement, receipts and retry behavior are unchanged. No new requester, queue, background Response or polling is introduced.

A timeout accepts no model result or authoritative World effects. The existing authoring path retains the requested immutable premise without review/approval. The existing simulation path records its unavailable result and a durable pause; status/operation metadata can change, but the preceding coherent world checkpoint, live projection, inventory/resources and fictional time remain unchanged. Replaying that receipt does not dispatch another request. An explicit future new operation is governed by existing controls; this repair does not promise exactly-once provider billing.

## Route/deployment compatibility inspection

- Both World Lab APIs are synchronous Next.js **16.3.5 Node** route handlers. Each affected operation issues at most one provider request; no provider call is held inside a database transaction. D1 run fences use identities/revisions/generations, not a 60-second wall-clock lease.
- `src/app/api/world-lab/composition/route.ts` explicitly exports `runtime="nodejs"`, `maxDuration=240`: 180 seconds for the provider plus 60 seconds for surrounding authorization, validation and immutable storage.
- `src/app/api/world-lab/route.ts` explicitly exports `runtime="nodejs"`, `maxDuration=180`: 120 seconds for the provider plus 60 seconds for surrounding authorization, validation and settlement. Existing unrelated route limits, including gameplay 300/180 seconds, remain unchanged.
- World Lab client POSTs have no shorter fixed timer or automatic retry. The existing proxy/config introduces no shorter deadline. The isolated local worktree has no Vercel project link/config or credential file that establishes a hosted plan or lower limit.
- [Next.js route configuration](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) supports Node runtime and platform-consumed `maxDuration`. [Vercel's current duration documentation](https://vercel.com/docs/functions/configuring-functions/duration), checked September 20, 2026 local date, allows 300 seconds even on Fluid Hobby. Both route windows fit that bound. A legacy non-Fluid Hobby function capped at 60 seconds would be incompatible; no evidence establishes that configuration for this application.
- **Conclusion:** the existing local Node architecture and documented compatible Vercel Node duration support 180/120-second provider deadlines with headroom; no concrete current hard limit was found that blocks the correction. Hosted account settings and intermediate idle-connection limits were not tested or changed. Before any separately authorized hosted deployment, verify that its function/proxy limits admit the exported 240/180-second windows; a lower hard limit must block that deployment, not prompt invented infrastructure. No deployment or hosted Supabase behavior is claimed.

## Deterministic verification

Focused final run: **97 passed, zero failed**, across task timeout/budget, composition/resolver authority, real-service replay, frozen evaluation preflight, ordinary DM and Wave 4 provider tests. Five new tests cover exact/clamped deadlines; ordinary defaults; abort before headers and during body reading; composition timeout with no run; and resolver timeout plus lost failure-receipt response, replay and unchanged World state. Existing actual short-timer tests also pass. The safe diagnostic allowlist regression now explicitly includes `timeoutMs`; an initial focused run caught that expected test update.

After the implementation/test candidate was frozen, **one** fresh complete repository suite collected **1,101 tests: 1,100 passed, zero failed, one skipped**, in **205.009 seconds**. The single skip is the explicitly opt-in hosted Supabase Auth/PostgREST test. HTTP regressions used a credential-free local webpack development server on loopback; all database fixtures were disposable. No full-suite run was used during iteration.

Following that suite, route type generation and non-incremental TypeScript passed; repository-wide `eslint . --max-warnings 0` passed with zero warnings; and `next build --webpack` passed. The built `.next/server/functions-config-manifest.json` contains composition `maxDuration=240` and World Lab `maxDuration=180`, confirming Next consumed the route settings. Generated `next-env.d.ts` was restored. Frozen implementation/test hashes remained unchanged throughout verification. Logs and source/evidence fingerprints are in ignored `test-results/d2a-timeout-recovery/`.

No additional browser/physical-iPhone, hosted deployment, hosted database or live-latency/model-quality result is claimed. This is a transport-only repair; the repository suite includes the accepted UI, privacy, migration, fencing and settlement regressions.

## Immutable live history and proposed next step

139 existing files under Stage 1.0/1.1 evidence directories were fingerprinted before changes and rechecked unchanged after verification. No historical script, journal, response, reservation, owner review, database dump or fixture is edited. Stage 1.1 Call 6 remains INCONCLUSIVE with unknown usage/actual identity and its **$0.29576** reservation. It is not relabelled a model-quality failure or free request.

[Stage 1.2](D2A_LIVE_EVAL_STAGE1_2_PLAN.md) proposes only three maximum new attempts: temporal composition, human-approved dependent resolution, ambiguous RU composition. Same frozen fixtures and GPT-5.4/high, standard tier, 20,000 full-wire ceiling and 16,384/8,192 output caps. Calculated maximum **$0.76440**; proposed independent hard cap **$0.80**. The old guard's 60-second override must not be copied into a future trial; historical guard/evidence stays immutable.

**Zero live provider calls during this correction.** No real database migration, import, deployment, main update, Astra or D2B. D2A acceptance and Stage 1.2 execution remain pending owner authorization.
