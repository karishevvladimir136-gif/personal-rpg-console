# Phase 3.75 — final owner architecture decision

Recorded 2026-09-19. **Owner decision accepted; technical benchmark incomplete and closed.** Acceptance of sufficient evidence for this decision is not acceptance of a completed benchmark, classifier quality, or a new production implementation.

## Exact checkpoints and preserved evidence

| Record | Immutable checkpoint |
| --- | --- |
| Independently reviewed, pushed evidence | [9d5a99c0e93917190f415eedab3d4067c63b8ee2](https://github.com/karishevvladimir136-gif/personal-rpg-console/commit/9d5a99c0e93917190f415eedab3d4067c63b8ee2) |
| Execution and stop guard | [8c5a9f7e731a9ab2ce24b17a61423fe7b46e1e23](https://github.com/karishevvladimir136-gif/personal-rpg-console/commit/8c5a9f7e731a9ab2ce24b17a61423fe7b46e1e23) |
| Production main baseline for this documentation | [cb7f6be2fb513de13604d381046a3240f3261383](https://github.com/karishevvladimir136-gif/personal-rpg-console/commit/cb7f6be2fb513de13604d381046a3240f3261383) |

The evidence remains on codex/phase375-technical-bakeoff, including original failures, smoke recoveries, reservations, incomplete full-run observations and their hashes. This record neither replaces nor relabels them. No experimental runner/dependency is merged into production to preserve evidence. Historical reported costs and unknown charges retain their original meanings; closing the experiment does not turn missing charges into zero or authorize spending its unused budget.

## Frozen decisions

1. **Keep direct OpenAI Responses as the v1 production Model Runtime baseline.** Preserve the existing server-only DmProvider / structured requester seam and SummaryProvider reuse. Provider neutrality remains the extension boundary; it does not require installing another framework now.
2. **No Vercel AI SDK or AI Gateway production integration now.** Qualifying smoke established a viable future transport with hard provider pins and unchanged structured schemas. It did not demonstrate enough production benefit to replace the simpler accepted direct path. No automatic model/provider fallback.
3. **Jev / TypeSafe: DO NOT ADOPT** for World Thread relevance, World Actor relevance, Canon/source classification or parallel outcome comparison. Disabled for production and real campaign/private data. The benchmark is closed: no further live calls, diagnostics, retries, smoke reruns or benchmark attempts. The optional vendor-neutral Decision Model extension may remain documented; reopening evaluation of any candidate requires a new explicit owner scope. There is no pending Jev adoption gate to finish.
4. **classifier.dev, OpenRouter, GLiNER and Vercel Workflows remain deferred.** No integration or contact in this task.
5. Report a safely proven actual provider API model ID, or explicit **UNKNOWN/null**. Never infer execution identity from an SDK echo of the requested model. Preserve valid routing evidence separately from optional provider-internal model naming.

These decisions supersede earlier proposal wording that scheduled the Jev spike or treated its adoption as an open Phase 3.75 task. They do not approve all proposed World Engine/Library/Lab/ruleset implementation slices. No production code, migrations, dependencies or campaign data change here.

## Next authorized work and continuing limits

[Phase 3.8A Spatial Runtime](PHASE38_SPATIAL_RUNTIME.md) is documentation, official-source research and an offline test plan only. EXPLORE joins the v1 roadmap; its production implementation waits until after Phase 4 FRAME / Visual Bible and separate authorization. Phase 3.8B paid tests are proposed, not authorized by this record.

Physical iPhone/Safari and the historical optional Phase 1 conflict-rebase confirmation remain unverified. Finite synthetic/model evaluations guarantee neither perfect memory, branching, recovery nor classifier/world quality. No hosted deployment or real campaign/private-data acceptance has occurred. The original checkout's uncommitted documentation is outside this work and remains untouched.
