# Fictional world freedom — review candidate

Starting main: `8ad7b87da43100320e93a44646a87016fc9a95ad`.
Isolated branch: `codex/astra-fictional-world-freedom`.

Implemented for owner review. Not merged, activated or deployed. No Iris operation was retried/cancelled, no gameplay was submitted, and no live model/media request was made. The owner app was not restarted or reconfigured. Migration 51 remains the owner baseline; no migration is added. The interrupted full-test attempt reached the owner app authentication boundary; see the verification incident below.

## Finding

The owner reported that `i go to mill and ask miller for job`, following a public miller lead, produced a refusal because the mill and miller had no structured records. The source audit found these overly broad authoring clauses:

- Astra planner: “never invent tool results, resources, items, positions, or completed outcomes.” This did not limit the prohibition to server-owned mechanics and persistent records.
- Public narrator: “Use only the supplied public facts…” followed by permission for conversation and temporary permissions. This did not expressly permit a new ordinary fictional person or sub-place.
- World takeover guidance said structured state “controls overlapping live facts,” without explaining that the supplied records are not an exhaustive world roster.

The existing capability projection filters writable/tool Entity, Item and Location IDs. That is the correct durable-state boundary. No deterministic guard was found that requires every person/place/object mentioned in narration to have a row: prose validation checks contract shape, bounds, effect dependencies and secrecy instead.

These are concrete prompt ambiguities consistent with the reported response. The exact historical provider request/output was not re-read, reconstructed or rerun, so this report does not claim retrospective proof of which sentence caused that response.

## Narrow correction

One shared instruction, `astraFictionAuthorityInstructions`, now states:

> Structured state is authoritative, not exhaustive. Astra owns fiction; Console owns durable state.

It explicitly permits plausible, non-contradictory mundane premises, incidental NPC dialogue, services, sensory detail and unrecorded sub-places inside the current tracked Location. Missing rows alone are not a reason to refuse or ask for clarification. Supplied record arrays describe tracked authority and writable targets, rather than everything that exists.

Owner corrections, current structured state, Canon, established public history and relevant Memory retain their precedence. Explicit absence, destruction, unavailable magic, known secrets and positive NPC knowledge boundaries remain constraints. Rumor stays hearsay. Local movement does not invent a new Location ID or disguise travel between distinct tracked Locations.

The original broad planner/narrator clauses now refer specifically to durable resources, owned inventory, tactical positions and mechanical outcomes. The shared rule is used by all Astra planning paths, unified public narration, private-informed public narration and legacy Astra public narration. The separate public generation request still receives only the existing strict public-safe projection; no private interpretation bridge was added.

## Durable authority remains unchanged

No schema, capability set, validator, SQL function, migration, tool, effect kind, receipt, retry contract or commit authority changes. No ordinary World Logic path changes. No new agent, automatic promotion, world synchronization or arbitrary write API.

- A fictional mill, room, passerby or miller creates no Location or Entity row.
- Incidental possessions create no owned Item, money or equipment.
- Fiction alone cannot heal, deal damage, grant a power or mutate tracked NPC state.
- An informal work offer need not create a Quest. A durable contract still needs the existing bounded job authority and eligible recorded references.
- Frozen historical World records and events remain frozen.

Future promotion of an incidental person/place to tracked state is outside this pass. This correction does not invent a promotion mechanism or make an unrecorded NPC a valid durable reward issuer.

## Deterministic verification

New tests use production `runAstraTurn`, the existing RPC TurnStore and disposable PGlite migrations through 51 with a scripted provider. The fixture has one real opening Location and no pre-created mill/tavern/guard/tree/room/orchard. A real committed scene first establishes the public lead “Try the miller…”.

Verified cases:

1. Exact owner mill input follows that lead and commits a fictional mill conversation.
2. Nearby tavern inquiry.
3. Unnamed guard conversation.
4. Passerby directions.
5. Sitting beneath an unrecorded tree.
6. Entering an ordinary unrecorded room.
7. Plausible nearby mundane destination.

All seven commit scene history without adding or mutating Entity, Location, Item or Quest rows, tracked Location, HP/resources, inventory, time or frozen World records. Private-informed narration receives no synthetic secret; unpinned legacy Astra operations retain two-stage semantics.

Explicit Canon absence and destroyed-mill public history reach the actual production model packet, and scripted responses preserve them. Unauthorized Location/Entity IDs, within-maximum HP recovery, invented money, Item increases and raw Item creation with a fabricated ID fail validation atomically, retain the literal input and publish no successful narration. An unavailable magical artifact can remain an unverified conversational possibility without granting an Item or power.

These tests prove prompt/context delivery and deterministic acceptance/persistence boundaries. They do not prove semantic obedience by a real model. No new prose classifier or keyword-based refusal engine was introduced, and no paid/live call or owner turn was made.

Final verification:

- New regression cases: **12/12**; existing affected context/provider/privacy checks: **38/38**. **50/50 focused**, zero skips/failures.
- Fresh corrected complete suite: **2,374/2,375**, zero failures, one existing explicit-opt-in live disposable Supabase Auth/PostgREST skip; **527.652 seconds**, three test workers. The existing **200-turn production soak passes**.
- TypeScript, repository ESLint with zero warnings and production webpack build: **passed**.
- No live model/media calls. No provider-contract ambiguity required paid verification.

Logs are ignored in the isolated worktree: `test-results/astra-fictional-world-freedom.log`, `fiction-existing-focused.tap`, `fiction-full-suite-isolated.tap`, `fiction-typecheck.log`, `fiction-lint.log` and `fiction-build.log`. The unsuccessful initial environment attempt remains separately recorded below.

## Verification environment incident

The first full-suite attempt omitted `PREVIEW_URL`, so existing HTTP tests defaulted to port 3000. The D1 unauthorized-read assertion failed against the trusted-local owner app. Three requests are confirmed in the interrupted TAP record: one synthetic World Lab GET and two World Lab POSTs. The POSTs returned 403/422 and are rejected before service execution; the GET path can authorize/read only and cannot invoke simulation, settlement or a provider. None targets Iris. Source review also checked the other HTTP test payloads: their synthetic requests lack valid mutation/turn authority. Buffered TAP output alone cannot prove that no later HTTP test had begun.

The trusted-local proxy may establish normal Supabase Auth sessions before route rejection. Accordingly, this report does **not** claim the entire owner database was untouched: normal Auth session/audit/last-sign-in side effects are possible. The audited test payloads cannot perform RPG mutations or provider dispatch. No Auth rollback, owner operation repair or cleanup was attempted. Old activation fingerprints were not reused as proof of integrity after intervening owner play.

The owned test process tree was stopped. The corrected full run uses `PREVIEW_URL=http://127.0.0.1:3107` and a separate candidate server with no environment files and explicitly blank credential/trusted-owner/provider settings. Its preview returns 200, and the protected synthetic World Lab read returns 503 `not_configured` before database access. The owner server was left running. The aborted evidence remains in ignored `test-results/fiction-full-suite.tap`; corrected evidence is `test-results/fiction-full-suite-isolated.tap`. No product code was changed to accommodate the environment issue.

## Changed files

- `src/lib/gameplay/astra-fiction-authority.ts`
- `src/lib/gameplay/astra-plan-context.ts`
- `src/lib/gameplay/astra-primary.ts`
- `tests/astra-fictional-world-freedom.test.mjs`
- `FICTIONAL_WORLD_FREEDOM.md`
- `DEV_STATUS.md`

Next step: owner review. Main is not integrated and the owner app is not activated with this candidate. No Iris gameplay mutation or retry was performed; the unintended authentication contact is disclosed above.
