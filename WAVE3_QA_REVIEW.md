# Wave 3 independent QA review

Status: initial independent review complete; final integration verification pending.

This review uses synthetic fixtures and disposable in-memory PGlite databases only. It does not include live provider calls, paid quality evaluation, real imports, deployment, physical iPhone testing or owner acceptance. QA changed only its assigned tests and this review. Lead owns production repairs, migrations, shared integration and DEV_STATUS.

## Reviewed checkpoints

- Leaf/initial SQL baseline: `f7aed01` on `codex/wave3-qa`.
- First test handoff: `8da52a6a6c02a5ecc011c01196c280eb637a4c3f`.
- Independent SQL attack review additionally inspected the Lead's current, uncommitted migration 12 and turn bridge in `.worktrees/production-wave3`. Those results are not presented as verification of a final commit.
- `WAVE3_QA_MIGRATION` lets the owned SQL fixture read the Lead's migration without changing or copying a shared migration. It always applies migrations 1–11 and the selected additive migration to a new disposable database.

## Reproduced defects sent to Lead

| ID | Severity | Reproduction and impact | Repair status |
| --- | --- | --- | --- |
| W3-F-01 | P2 | A resolver configured for `gpt-6-astra` accepted a valid response reporting `gpt-5.4`; a missing model was recorded as the configured model. Both action and background resolver calls lacked the compiler's response-model check. | Lead reports a per-request actual-model check for both calls; final independent rerun pending. Tests include exact/dated model controls, absent/different/lookalike models and concurrent mixed responses. |
| W3-F-02 | P1 | Configure an authoritative `resolver_required` step with `condition.add(cold)`. Stage its otherwise valid proposal after deleting every typed consequence field from its Event. The migration 12 legacy fast path accepted the downgraded stage and allowed the thread to advance without its effect. | Lead repair pending. Independent regression invokes `public.rpg_world`, checks rejection and verifies no stage or entity mutation remains. |
| W3-F-03 | P2 | Start a valid v2 action, then change both checkpoint and Event quantity/amount from JSON integer `1` to JSON string `"1"`. SQL accepted `inventory.consume` and `resource.spend`, unlike the strict TypeScript parser. | Lead repair pending. Independent regressions include both numeric fields and a correctly typed accepted-stage control. |

## Coverage and actual results so far

- Existing Wave 3 compiler, authoring, premise, consequence, resolver and reconciliation suite: **74/74 passed** at the initial baseline.
- First independent provider/authoring handoff: **9/12 passed**, with the three failures reproducing W3-F-01 at the baseline. No skipped or TODO tests.
- Additional premise SQL checks: **3/3 passed**. Exact EN/RU originals, 35 immutable versions, 32-row pagination, old receipt replay, cross-campaign receipt reuse, idle-turn fencing, save/fork fences and exclusion from rebuilt Memory/runtime were exercised.
- Additional public-policy and client-import checks: **4/4 passed**. All **324** visible policy pairs produced identical review payloads with and without hidden schedules; restart times stayed prospective, no immediate catch-up occurred, and High autonomy did not bypass Deadline Off. All current client entry points were followed through their runtime import graphs.
- Independent typed SQL regressions against the Lead's inspected migration: **1/4 passed**, with the three failures reproducing W3-F-02/F-03. The valid numeric v2 stage control passed.
- Focused zero-warning ESLint passed for all seven owned test and fixture files in this handoff.
- Initial route type generation passed. Initial `tsc --noEmit` failed in the already-integrated `src/lib/production-client.ts:211`: `RuntimeTask` now includes `canon.compile`, while a settings list retained its narrower task type. Lead was notified; QA did not modify production code.
- A final production build has not been claimed for this initial QA handoff. The Lead's final full-suite, migration upgrade, build and browser checks remain separate gates.

The added tests also cover cross-owner source/evidence records, original digests, immutable approved history, stale approval after source correction, explicit review-only Canon authority, authored assumptions versus external source facts, source/refinement instruction injection as data, conservative private/future compiler boundaries, model response attribution and no fallback requests.

## Remaining final review

1. Rerun the owned regressions against the Lead's repaired integration and record its exact commit.
2. Verify typed action/resolver authority through failed narration, retry, duplicate callbacks and timeline/save recovery; retain legacy save readers.
3. Confirm the current client graph includes the merged authoring and premise UI, then report typecheck/lint/build status from actual integration checks.
4. Keep deterministic validation separate from live natural-language quality and owner/browser acceptance. Finite synthetic tests do not establish perfect source comprehension or interpretation of every player request.
