# Astra Freedom Pass — corrected live acceptance, blocked at interactive continuation

Starting reviewed SHA: `4a85ae8c9483b89ea28da0305daacea3f65721d2`, branch `codex/astra-freedom-pass`. Main remains `edeb3542cb00c068b129faa95f24a21eeb3b9425`. This is disposable evidence, not owner activation.

## Harness-only correction

Three independent PGlite campaigns now isolate A, B and C. A explicitly requests payment, permission to use the loft later and an inquiry about tomorrow, without sleeping or accepting another job. A never requires a future Quest. B starts independently injured, with three supplies and previously established suitable lodging. C accepts ordinary fiction or generic tools without prescribing a bartender response.

Semantic acceptance differences are recorded while later independent cases continue. Provider/schema/routing/billing, SQL, replay/save integrity and request-budget failures stop the run. The harness checks both the requested and returned Astra/default route and requires known input/output usage before further processing, including the final response. Bounded raw synthetic output, parsed decisions, private receipts, ordered-effects authority and SQL rejection details are retained.

Only the harness, its tests and documentation/evidence changed. Production code, Astra schemas, Migration 47, Migration 48 and settlement/mechanics authority are byte-for-byte unchanged from the reviewed starting commit. No repair followed the new failure.

## Live results

Exact new evidence: [ASTRA_FREEDOM_LIVE_ACCEPTANCE_DATA.json](ASTRA_FREEDOM_LIVE_ACCEPTANCE_DATA.json).

| Scenario | Disposable campaign | Operation | Result | Requests | Provider latency |
| --- | --- | --- | --- | ---: | ---: |
| A — reward, permission, inquiry | `849659bb-9024-4ffb-a757-b797aeaa40fa` | `5923bc55-0d19-450a-8b8f-df870d0d6114` | committed; acceptance and exact replay passed | 2 | 30.852 s |
| B — explicit long rest | `70a15bbe-4091-45d4-ac12-41be1489883c` | `b5d77bba-3a65-4e12-9a19-b533f95742bf` | committed; acceptance, exact replay and save/load passed | 2 | 19.371 s |
| C — dishwater improvisation | `c2967c8a-b54f-45c4-8380-ec9447ac681e` | `7607cd69-2c9e-4343-9962-9c3a446c14ab` | failed during interactive-check continuation; no narration or gameplay commit | 1 | 7.843 s |

A settled +2 silver, one vegetables Item and the completed existing job. HP remained 4/12, supplies remained 3, no rest occurred, and time advanced only one ordinary conversational minute. Tomorrow's work remained unaccepted; no new Quest was required or created. Exact replay made zero provider requests and changed nothing.

B used the actual Astra plan's `formal_rest` effect. Existing deterministic rules consumed one supply, advanced exactly 480 minutes and recovered six HP: 4/12 → 10/12. Persistent `safeLocationIds` remained empty. Exact replay made zero provider requests and applied no additional recovery or consumption. Manual save/load preserved the exact result.

C selected an ordinary existing `attack` tool against the visible bartender. The server recorded the check at position/index 0: raw 20, modifier 0, total 20, defense/DC 10, success true. That receipt is durable in the disposable checkpoint. No damage, HP/resource/item change, final proposal, narration or turn commit occurred. The before/after gameplay snapshots are identical.

All five provider responses were HTTP 200, returned `gpt-6-astra` / default tier and had usable token accounting. Planners used High and narrators used Medium. Total: **5 requests; 36,693 input / 2,334 output / 0 cached / 1,244 reasoning tokens; estimated US $0.4836; 58.066 seconds summed provider latency**. Estimate uses the existing conservative $10/$50-per-million accounting, not a billing receipt. Request latencies: 25.772, 5.080, 13.951, 5.420 and 7.843 seconds. No media request occurred. The run stopped immediately on C's runtime failure; no quality retry, reroll or further model request occurred.

## Demonstrated rejection boundary

Observed C sequence:

1. Durable begin and claim succeeded.
2. Provider response, structured extraction and parsing succeeded.
3. `store.recordAstraTool` persisted the server-owned attack receipt.
4. `store.checkpoint` persisted the displayed check and `awaiting_confirmation` state.
5. The harness issued the normal disposable `continue` action; a second claim succeeded.
6. The next `recordStage("plan", "entered")` failed in SQL action **`astra_diagnostic`**, code **`22023`**, message **`rpg_validation`**.
7. The catch's failed-stage diagnostic hit the same guard; `store.fail` then recorded non-retryable `validation`.

The exact rejecting assertion from the saved SQL detail requires, among its lease/source checks:

```sql
t.runtime_identity='astra-primary-v1'
and t.status in ('pending','generating')
```

Migration 44's diagnostic guard excludes `awaiting_confirmation`. The effective claim delegates to the existing runtime claim, which renews the lease without changing that status. Migration 38 and the later claim wrappers preserve it. Migration 48's narrow status correction applies only to failed schema-2 operations; C has no final or ordered-effects pin and does not qualify. `resumeAstraTurn` nevertheless starts planning-stage diagnostics immediately after claiming the displayed check. This status/diagnostic lifecycle mismatch therefore rejects a legitimate continuation before another provider call.

Evidence locations: `src/lib/gameplay/astra-primary.ts` (`astraExecute`, `resumeAstraTurn`), `supabase/migrations/202609180004_phase2_runtime.sql` (claim/checkpoint), `supabase/migrations/202610060044_astra_execution_diagnostic.sql` (diagnostic guard), and `supabase/migrations/202610080048_astra_ordered_mechanics.sql` (narrow failed schema-2 claim correction). Production `src/lib/server/dm/store.ts` enables these diagnostics, so this is a production integration defect rather than a bespoke-action classification rejection.

The existing interactive Astra regression uses a Migration-38 fixture and `createRpcTurnStore` with diagnostics omitted/default false. It proves recorded-check/reroll/continue authority, but does not exercise the post-44 diagnostic lifecycle. The corrected harness's offline C deliberately uses valid trivial fiction, so it also does not exercise a displayed-check continuation. These explain the missing coverage without inferring a model or dishwater-specific defect.

No repair or additional regression implementation was made after this discovery. Owner review is required before correcting the resumed-check lifecycle. The deterministic check must be preserved; introducing a dishwater action, rerolling, disabling diagnostics or weakening unrelated commit guards is not justified by this evidence.

## Offline gates and preserved history

- Corrected fake-provider A/B/C run passed with zero requests.
- Harness regression tests: **10/10**, including independent state, semantic-difference continuation, failure stops, returned routing, unknown final-response billing and secret redaction.
- Relevant provider/formal-rest/ordered-effects/recovery tests: **39/39**.
- Focused total this closure: **49/49**, zero failures/skips. Harness/test ESLint passed with zero warnings.
- Shared production code was unchanged, so the complete suite, TypeScript and production build were not rerun. The starting reviewed candidate's recorded full result remains **2,196/2,197**, zero failures, one existing opt-in persistence skip; TypeScript, repository lint and webpack build passed at that checkpoint.

Previous [ASTRA_FREEDOM_LIVE_SMOKE_DATA.json](ASTRA_FREEDOM_LIVE_SMOKE_DATA.json) remains unchanged (SHA-256 `2F28C99DF81275378A805739182BA5E7F2D6BF342CC7EFFA6AA35EDD2B2A7221`). Its prior A was an owner-accepted successful product outcome, followed by an invalid harness assertion. The new C failure is separate, observed evidence and does not reinterpret the previous result.

No owner database was connected, no owner campaign or either historical Iris operation was touched, no migration was applied to owner data, and no owner app/environment, main branch or deployment was changed. All three disposable databases were closed after evidence capture. Migration 47/48 activation remains unauthorized.

**BLOCKED — legitimate Astra interactive-check continuation is rejected by Migration 44's diagnostic status guard before planning resumes.**
