# Wave 3 independent QA review

Status: all four reproduced defects repaired and independently verified at integration commit `a888fef62dd1b1f02cd4d53848fbe4ccec03c108`. No outstanding reproduced defect remains in this QA review.

This review uses synthetic fixtures and disposable in-memory PGlite databases only. It does not include live provider calls, paid quality evaluation, real imports, deployment, physical iPhone testing or owner acceptance. QA changed only its assigned tests and this review. Lead owns production repairs, migrations, shared integration and DEV_STATUS.

## Reviewed checkpoints

- Leaf/initial SQL baseline: `f7aed01` on `codex/wave3-qa`.
- First test handoff: `8da52a6a6c02a5ecc011c01196c280eb637a4c3f`.
- Independent SQL attack review additionally inspected the Lead's current, uncommitted migration 12 and turn bridge in `.worktrees/production-wave3`. Those results are not presented as verification of a final commit.
- The repaired integration inspected next is based on `f2e8186dc25085e811d67dc186800f888ecff2fb` plus the Lead's pending shared repairs. Existing QA tests passed there; an additional compiler persistence invariant failure was then reproduced.
- Final independent review: `a888fef62dd1b1f02cd4d53848fbe4ccec03c108` on `codex/production-mega-sprint-wave3`. This committed checkpoint contains all four production repairs, the independent SQL compiler reconstruction, typed settlement/recovery validation and the shared inert premise input validator. The final focused runs below used this implementation. The Lead's generated Next type declaration was the only observed worktree difference during verification.
- `WAVE3_QA_MIGRATION` lets the owned SQL fixture read the Lead's migration without changing or copying a shared migration. It always applies migrations 1–11 and the selected additive migration to a new disposable database.

## Reproduced defects sent to Lead

| ID | Severity | Reproduction and impact | Repair status |
| --- | --- | --- | --- |
| W3-F-01 | P2 | A resolver configured for `gpt-6-astra` accepted a valid response reporting `gpt-5.4`; a missing model was recorded as the configured model. Both action and background resolver calls lacked the compiler's response-model check. | Repaired and independently verified. Tests include exact/dated model controls, absent/different/lookalike models and concurrent mixed responses. |
| W3-F-02 | P1 | Configure an authoritative `resolver_required` step with `condition.add(cold)`. Stage its otherwise valid proposal after deleting every typed consequence field from its Event. The migration 12 legacy fast path accepted the downgraded stage and allowed the thread to advance without its effect. | Repaired and independently verified. Detection now inspects stored typed steps and typed candidate metadata before choosing the legacy path. Rejection leaves no stage or entity mutation. |
| W3-F-03 | P2 | Start a valid v2 action, then change both checkpoint and Event quantity/amount from JSON integer `1` to JSON string `"1"`. SQL accepted `inventory.consume` and `resource.spend`, unlike the strict TypeScript parser. | Repaired and independently verified. Both numeric-field regressions and the correctly typed accepted-stage control pass. |
| W3-F-04 | P2 | At the service-role RPC boundary, alter only the first assisted Pack INSERT after normal service validation. SQL accepted an inference relabelled as `source_fact`, and separately accepted a claim/citation changed from private future knowledge to public source knowledge when the compilation also included private/future material. The service noticed the changed response only after the immutable draft existed. | Repaired and independently verified. SQL reconstructs bounded passages and derived claim/coverage/review fields; both regressions now reject before any Pack row is inserted. Four positive SQL cases verify Unicode, partial coverage, private/future boundaries and owner-corrected refinement. This was a database invariant gap: no bypass of the normal model parser or browser authorization is asserted, and no automatic Canon approval was observed. |

## Coverage and actual results

Final focused verification at `a888fef`: **34/34 owned QA tests passed**, plus **4/4 existing integration/boundary tests**. All nine owned test/fixture files passed zero-warning ESLint. Independent integration typecheck passed. The production build and complete deterministic suite are reported separately by Lead.

- Existing Wave 3 compiler, authoring, premise, consequence, resolver and reconciliation suite: **74/74 passed** at the initial baseline.
- First independent provider/authoring handoff: **9/12 passed**, with the three failures reproducing W3-F-01 at the baseline. No skipped or TODO tests.
- Additional premise SQL checks: **3/3 passed**. Exact EN/RU originals, 35 immutable versions, 32-row pagination, old receipt replay, cross-campaign receipt reuse, idle-turn fencing, save/fork fences and exclusion from rebuilt Memory/runtime were exercised.
- Additional public-policy and client-import checks: **4/4 passed**. All **324** visible policy pairs produced identical review payloads with and without hidden schedules; restart times stayed prospective, no immediate catch-up occurred, and High autonomy did not bypass Deadline Off. All current client entry points were followed through their runtime import graphs.
- Independent typed SQL regressions against the Lead's inspected migration: **1/4 passed**, with the three failures reproducing W3-F-02/F-03. The valid numeric v2 stage control passed.
- After the Lead's repairs, all **23/23** owned provider, authoring, premise, typed SQL, policy and client-import tests passed in the integration worktree. Its merged campaign-premise and World Library UI are included in the client graph traversal.
- Additional typed recovery checks: **5/5 passed** against the same integration. Six-effect actions and combined action/resolver turns survive both manual saves and save forks, retain original stages and Event ancestry, rerun neither proposal provider, and spend once. Stale timeline callbacks fail; a corrected resource row invalidates pending authority without provider replay or partial effects.
- Before the final repair, both initial-Pack SQL tampering regressions failed, reproducing W3-F-04; each found one incorrectly persisted immutable Pack row. After the repair, both pass and no Pack row is inserted.
- Final compiler SQL verification: **6/6 passed**. In addition to the two negative regressions, positive tests preserve exact EN/RU source text and UTF-16 locators across CR/LF, astral characters, combining characters, Unicode whitespace and embedded Unicode line separators. Mixed private/future sources retain conservative claim/citation boundaries, sparse coverage, declared contradictions and unknowns. A one-passage budget counts a 4,002-unit astral line as oversize and keeps an unprocessed private/future source visible in coverage without declassifying output. Refinement preserves immutable owner corrections, prior history and inherited private/future boundaries without approval or Canon promotion.
- Final integration rerun: **32/32 passed** across the other 28 owned tests, the existing three-test legacy boundary file and the existing SQL Describe → compiler → review → explicit Canon → Pack → pin flow. This includes both current and legacy client import graph checks after the premise input helper was separated from private validation imports.
- Focused zero-warning ESLint passed for all nine owned test and fixture files, including the recovery and compiler-SQL regressions.
- Initial route type generation passed. Initial `tsc --noEmit` failed in the already-integrated `src/lib/production-client.ts:211`: `RuntimeTask` now includes `canon.compile`, while a settings list retained its narrower task type. Lead was notified; QA did not modify production code.
- An independent `tsc --project ../production-wave3/tsconfig.json --noEmit --incremental false` run **passed** against the repaired integration and passed again at `a888fef`. The initial task-list type error is resolved there.
- A final production build has not been claimed by this QA worker. The Lead's final full-suite, migration upgrade, build and browser checks remain separate gates.

The added tests also cover cross-owner source/evidence records, original digests, immutable approved history, stale approval after source correction, explicit review-only Canon authority, authored assumptions versus external source facts, source/refinement instruction injection as data, conservative private/future compiler boundaries, model response attribution and no fallback requests.

## Handoff and limits

Independent repair review is complete at the committed checkpoint above. Lead retains responsibility for the final complete deterministic suite, migration upgrades, production build, browser review, DEV_STATUS and integration handoff. These focused results do not substitute for those gates.

Keep deterministic validation separate from live natural-language quality and owner/browser acceptance. Finite synthetic tests do not establish perfect source comprehension or interpretation of every player request. No live quality evaluation or owner acceptance is claimed.
