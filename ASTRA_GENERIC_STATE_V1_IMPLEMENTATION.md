# Astra DM / Generic State V1 — isolated implementation

Status: offline candidate complete; prioritized live journey and privacy route passed. Additional live tool/check coverage remains incomplete under the reservation ceiling. Not activated or owner-accepted.

## Provenance and boundaries

- Branch: `codex/astra-generic-state-v1`.
- Starting commit: `65dc99c105d86b2860d284d10846c450d20b3e2d`, directly above production main `8ad7b87da43100320e93a44646a87016fc9a95ad`.
- Approved architecture, including its §15 DM-authority clarification: `22b2e519ecc609eeeb6f36538676dd4fa30c8ae6`.
- Original checkpoint `338667d8468b7f6e4fd42fcf8f5859bfb6300f30` and its report branch are preserved. Neither history nor the original draft migration was merged wholesale.
- Implementation unit 1: `30c6976dc1fd8581bc5e5c00ccee3221806025bd`, contract/compiler.
- Implementation unit 2: `ab9c029e973bd64ecaf8dfc01c20dee294bc17d9`, persistence/reconstruction/recovery.
- Unit 3 closes prompt/continuity/behavior, acceptance, verification and this report. Its exact final SHA is supplied in the delivery and Git history.

Owner DB, Iris, main, owner application/configuration and deployment were not changed. Owner DB level 51 is the owner's stated baseline, not a new owner-DB inspection. All database work here uses disposable in-memory PGlite. The HTTP tests use only a separately launched credential-free loopback server on port 3107. The live gate may read only the existing ignored OpenAI key for authorized synthetic text requests; it does not load an owner database client or owner campaign material.

## Architecture and reuse

One Astra DM interprets fiction. Console pins input/contracts, selects bounded context, records deterministic tools, compiles durable intents and atomically commits through the existing TurnStore. There is no new runtime, agent, store or semantic classifier.

Reusable pieces retained/adapted: shared currency arithmetic and Item splitting/transfer, existing carried-storage construction, ordered virtual-state application/collapse, existing formal-rest calculations and SQL proof, server dice, Migration-51 privacy routing, established save/timeline capture/recovery and detached World Lab projection. The legacy NPC storage helper still uses its original deterministic ID namespace and eligibility rules.

Quarantined/not copied: the WIP's separate promotion/acquisition/commerce/combatant paths, ground-storage schema, public continuity column, broad model-write payloads, original draft Migration 52 and unfinished UI work. Gallery, paper doll, VIDEO, owner configuration and unrelated UI are unchanged.

## Six-family contract

| Family | Bounded operations |
| --- | --- |
| `entity.upsert` | Ordinary public NPC identity; public label/details/presence update; optional create-only existing public basic actor profile. No player/companion promotion or arbitrary stats. |
| `location.upsert` | Known/visited public Location label/details; actual current-Location travel requires positive accepted elapsed time. |
| `item.mutate` | Mundane food/supply/misc creation, public wording, existing equipment assignment, transfer/split, consume/remove quantity. Empty mechanics for newly created mundane Items. |
| `resource.adjust` | Actual tracked resource decrease, receipt-supported HP damage, explicit payer currency delta or conserved currency transfer. Recovery comes from existing rule calculations. |
| `quest.mutate` | Create/update an accepted commitment; validated status transition; claim stored reward terms once. |
| `time.advance` | Integral elapsed minutes, at most 1,440 total per ordinary turn; existing short/long-rest rule may compute its duration. |

Known handles bind scoped records. Local refs point backward to accepted creating opIds; server IDs derive from campaign + operation + opId. No model-provided persistence UUID, SQL, table/column selector or unrestricted values object is accepted. Twelve intents, six existing private patches and two observable behavior projections are the envelope bounds.

`basis:null` is the pinned DM's current bounded adjudication. The current player input can accept an agreement immediately. Public evidence handles identify actual source/version text; they do not pretend to prove dialogue semantics or require a prior acceptance receipt.

The server evaluates an ordered shadow state, implicit local dependencies and contiguous atomic groups. An invalid group leaves none of its changes. Dependent narration/visual/locale fragments are filtered; independent well-formed prose remains. Unusable root envelopes, authorization/revision failure and reconstruction mismatch still fail the operation. Semantic truth and correct consequence tagging remain DM responsibilities; no additional model judges fiction.

## Payer refinement and exact once

A positive currency delta names its payer with the same known/local Ref. A Quest claim derives issuer and amount from its stored terms; it cannot override them.

- Authoritatively absent NPC currency property: untracked. Bounded mundane grant (1–20) may credit the controlled hero without inventing a merchant purse.
- Tracked sufficient property: debit payer and credit recipient exactly.
- Tracked insufficient or explicit zero: reject; do not mint the difference.
- Receiving a real payment may establish that NPC's tracked balance from the actual credited amount.
- A failed read or omitted prompt field never establishes untracked funds. SQL reconstructs against the original private claim source and rejects a forged compiler view.

The committed fenced operation is the receipt. Quest `reward_operation_id`, deterministic creation IDs and the existing turn/command receipts prevent duplicate payment, Item creation or dice. Informal separate grants remain bounded DM adjudications; this adds no parallel obligation ledger. Prompt guidance requires stored job payments to use Quest claim and forbids reclassifying an already paid job as a new grant.

## Privacy, tools and continuity

Public-only selected context: Astra High tools/continuations → unified public final → compiler/checkpoint/commit. A no-tool public turn uses one response.

Selected relevant DM-private evidence: Astra High private adjudication → validated typed public outcomes and bounded stance/tone/intensity enums → Astra Medium narration from a projection containing no private semantic material → checkpoint/commit. Unrelated campaign secrets do not automatically select this route. Response mode remains pinned by Migration 51 and survives retries.

Private-informed public record text must quote an exact bounded substring of pinned public evidence. Private inline text, including paraphrased secret fixtures, is rejected. No raw planner prefix/private patches or private Character Model/Memory/World text enters the narrator. Literal-disclosure defense also covers the new Scene locale field. This exact-string defense supplements the architectural projection; it is not a semantic secrecy claim.

Scene locale is stored in the new narration Scene's existing title. Generic authoring carries the current Scene plus up to three ranked older public Scenes, with original indices/source locators; existing bounded Memory remains responsible for older recall. No transcript replay or new summary source-of-truth is introduced. The same selected history/coverage state is retained through tool context rebuilds, including background Memory maintenance.

Tool prefixes are pinned before query/skill/attack/save/damage execution. New actor profiles exist only in virtual state until commit. Receipt identity/order/dice are server-owned. Same-position replay returns the recorded receipt; changed calls conflict. Damage has its own durable receipt and every positive damage receipt must be applied exactly in the final plan. Interactive rerolls use existing authorized Check/command policy and return an existing command receipt before generating random values again. The provider sees the latest authorized Check result, while the original tool receipt remains append-only.

For generic encounter attacks, the attacker must have the real active action budget; a waiting defender remains a valid participant target. The generic-only correction removes the accidental requirement that the defender also own the active turn. The legacy tool branch is preserved. A second attack from an empty action budget is rejected before rolling.

## Replacement Migration 52

File: `supabase/migrations/202610140052_astra_generic_state.sql`.

Working-file SHA-256: `3D5A4BE99E04B39A92CB3D547919B68BEBF5EFD9D74D226A2500370BCFA6F9D4`.

This is the only runnable Migration-52 file in the candidate; there is no Migration 53. It is not applied to the owner DB.

- One nullable private `turns.astra_state_contract` (`generic-v1` or null), pinned with literal input at begin; no backfill or public table.
- Existing `astra_ordered_effects` JSONB stores schema-3 canonical plans; existing checkpoint/receipts/final remain the recovery authority.
- SQL independently resolves refs, stable IDs, balances, groups, quotes, profiles, dice, damage, rule proofs and exact changes from the authoritative source. It does not trust TypeScript RecordChanges alone.
- New mode/tool/final requirements remain under the live lease/current revision/timeline. Prefixes and final cannot change on replay.
- Generic commit reuses the existing authoritative atomic core and business validators, with a narrow independently reconstructed branch. Quest claim metadata and normalized currency registry metadata are applied inside that transaction before its autosave.
- No temporary public insert, source-hash substitution, revision-trigger suppression or new ledger is used.
- Public wrapper is service-only. Its renamed predecessor and new private helpers are revoked from PUBLIC, anon, authenticated and service_role; internal SECURITY DEFINER delegation remains.
- Existing historical/null state contracts delegate to their old validators and effect versions. Missing fields in old immutable manifests naturally restore as null.

World Foundation authoring, Actors and Events remain frozen. Only the already-authorized bounded currency registry/version metadata may change under the exact generic commit pin. Detached World Lab reads the same save's standard public/runtime state: current protagonist Location, overlapping actor public names/known current presence, and new standard NPC identities with empty capability/knowledge lists. Absent standard NPCs project an unknown current Location rather than a stale historical one. Original playable Foundation and immutable saves are unchanged; an actual detached prepare/continue run is tested.

## Disposable acceptance evidence

The A–G journey begins with only hero Ari, village, ordinary player funds/items, configured rules and a public miller lead. No Hobb/Bessa, bread stock, merchant purse or acceptance receipt is preseeded. No between-turn fixture repair is used.

| Step | Asserted durable result |
| --- | --- |
| A | Mill/Hobb offer commits as fiction; still one Entity and no mandatory mill Location/Quest. |
| B–C | Current acceptance creates Hobb and open crate Quest in one group via local issuer ref; stored reward is two silver. |
| D | Completion + claim credits Ari 5→7; Quest stamps the payment operation. Original replay pays nothing again. |
| E | New Bessa + new ordinary bread + reciprocal exchange commit together: Ari 7→5, Bessa untracked→2, bread owned by Ari. |
| F | Consumption persists bread quantity 1→0. The matrix separately proves a real gift transfer to Hobb. |
| G | Save/load and callback reuse exactly one Hobb. New-operation duplicate claim leaves money and claim stamp unchanged. |

Both ordinary payer deltas and Quest payments test untracked / 3 / 1 / explicit 0. Only untracked and sufficient 3 pay two; tracked 3→1 is conserved. Altering the prompt-side source to omit an authoritative zero cannot commit.

Other evidence: clean 1→52 and populated 51→52 data/immutable-save preservation; old pending null contract; generic begin/replay conflict; forged final/stale lease rollback; lost commit response; pending tool save/fork/retry; final-pinned save/load without replanning; current input retained on failure; cross-campaign refs/Memory isolation; private routing/quotes/enums/literal and paraphrase cases; exact interactive reroll command; real server attack/damage/HP loss; configured rest supply/HP/time; active encounter action budget; coherent detached World Lab; historical schema-1/2 regressions in complete suite.

The sixteen-case matrix extends to **200 committed Game turns** (four bootstrap OOC receipts are counted separately). It performs 23 fake background summary responses and 11 Memory-maintenance interleavings, save/forks, query/check continuations, rejected purchase groups, original replay, separate duplicate claim and explicit transport retry. Exact final state: Ari HP10, silver5; Bessa silver2; rat HP8; provisions29; one completed/claimed crate Quest; one Hobb; no unpaid-loaf Item; original village Location; worldMinutes660. Zero real provider/media calls occur in the soak. Fake timing is not a live latency result.

## Verification and live gate

Final focused coverage: **37/37**, zero failures/skips (compiler7, journey1, migration8, runtime10, provider3, soak1, live harness7). Final complete repository run: **2,411/2,412**, zero failures, one existing explicit-opt-in disposable Auth/PostgREST skip; **982.400 seconds** with three workers. TypeScript, repository ESLint with zero warnings and production webpack build pass. The final production code, Migration52 and all new tests are included in this complete run. The final build followed it; generated `next-env.d.ts` is restored and excluded from the commit.

An earlier complete run passed 2,402/2,403 before the additional gates. A subsequent run was deliberately stopped to include final encounter/Scene-locale privacy corrections; its partial result is not counted as a pass. Earlier focused failures (JSON key-order recovery, detached actor identity, an ambiguous SQL alias, test counting/bootstrap OOC and incomplete fake HTTP/encounter fixtures) are preserved in ignored local logs. The exact corrected candidate passed the final gates above. Another unrelated test runner caused memory pressure during the final run; it was not stopped or modified. Only this task's credential-free port3107 verification server was launched/stopped.

Live harness: `scripts/astra-generic-live-smoke.mjs`. Importing it never dispatches. Explicit opt-in, disposable fixtures only, no owner DB/app client. At most 10 paid text requests and $5 sum of conservative pre-dispatch reservations, including retries; maximum output4096. Every dispatch fetches the current official Astra pricing page and fails closed if the published rates cannot be established or change. UTF-8 full request bytes +2,048 framing upper-bound input tokens; input reserves use the higher $12.50/M cache-write rate and output reserves $50/M, without releasing unused reservations. No media/background paid summary/quality retry occurs.

Official price sources: [Astra model](https://developers.openai.com/api/docs/models/gpt-6-astra), [API pricing](https://developers.openai.com/api/docs/pricing). Checked October 15 UTC / October 14 local, 2026: Standard short-context $10/M input, $1/M cached input, $12.50/M cache write, $50/M output. Requests remain below the documented 272K long-context threshold. These sources are rechecked by the harness for each dispatch.

### Actual live results

**Six real synthetic turns committed, seven paid text requests, seven HTTP200 responses and seven successful parses; zero SQL errors, rejected operations, transport/quality retries or media calls.** Five public turns used exactly one Astra High response each. One separately prepared synthetic private-informed case used Astra High then Astra Medium. All actual responses report `gpt-6-astra`, default tier.

| Paid request | Scenario/stage | Reasoning | Request bytes | Input / output / reasoning tokens | Provider HTTP/body seconds | Reserved USD |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | Introduce mill/Hobb; zero operations | High | 31,685 | 7,181 /602 /338 | 18.737 | 0.6264625 |
| 2 | Current acceptance + record job + hour of work + completion + claim | High | 37,399 | 8,695 /2,277 /1,309 | 52.253 | 0.6978875 |
| 3 | Introduce Bessa + create loaf + conserved purchase | High | 43,820 | 10,732 /1,477 /690 | 31.046 | 0.7781500 |
| 4 | Consume owned bread | High | 46,675 | 11,868 /581 /282 | 14.521 | 0.8138375 |
| 5 | Return to same Hobb/callback | High | 49,056 | 12,468 /595 /289 | 16.027 | 0.8436000 |
| 6 | Relevant private-informed adjudication/refusal | High | 34,629 | 8,180 /275 /163 | 10.508 | 0.6632625 |
| 7 | Separate public-safe refusal narration | Medium | 15,206 | 4,031 /178 /0 | 8.163 | 0.4204750 |

Total **63,155 input /5,985 output /3,071 reasoning /0 cached tokens**. Reasoning is included in output, not added again. Estimated Standard spend **$0.9308**, not an invoice. Sum of held maximum reservations **$4.843675**; unused output allowances were not released. Remaining reservation **$0.156325** cannot fit even one 4,096-token output allowance ($0.2048) before input. No further dispatch was attempted.

Full-turn seconds: introduction19.279; acceptance/completion53.232; purchase32.719; consume15.952; return16.644; private-informed20.781. Descriptive full-turn median20.030 seconds; nearest-rank p95=53.232 seconds across only six turns. Public-only median19.279 /nearest-rank p95=53.232 seconds. Provider HTTP/body median16.027 /nearest-rank p95=52.253 seconds across seven responses. HTTP/body timing excludes the prior official-price verification; full-turn timing includes preparation, price verification and database work. These small-sample observations are not a general production latency claim.

Actual main-fixture result: exactly Ari, Hobb and Bessa; Ari HP10/10, Focus2, silver5 (5→7 earned→5 spent); Bessa silver2 from the real payment; Hobb funds remain untracked. One completed crate Quest has stored two-silver terms and `reward_operation_id=f140e709-0e01-4a70-869c-679f3de8ca2b`. One ordinary bread Item owned by Ari has quantity0 after consumption; initial compass remains1. World time60 from the model's accepted hour of work. The same village remains the tracked location; mill/bakery/stream use scene fiction. Hobb is not duplicated on return.

The real introductory offer created no Entity/Quest. Current acceptance subsequently created Hobb and the job in the same operation. The baker/stock were unseeded before purchase. Return prose recalled the same work/hammering naturally. The private case produced a firm refusal without revealing its synthetic hidden reason; structural narrator isolation is separately proven by the production privacy tests. These are observations, not a claim of exhaustive narrative-quality evaluation.

Coverage boundary: the live gate proves the prioritized unseeded A–F trajectory, immediate G-return continuity and private-informed generation. Save/load/duplicate-claim and tool/check/combat/rest coverage is deterministic/offline, not new live-provider coverage. The reservation ceiling prevents an additional real tool continuation. This is reported as incomplete additional live coverage rather than silently extending the budget or claiming all suggested live situations ran.

Artifacts: `ASTRA_GENERIC_STATE_V1_LIVE.json` contains bounded sanitized synthetic outputs, parsed decisions, ordered boundaries, per-turn before/after state, parse/usage/pricing and SQL diagnostics. `ASTRA_GENERIC_STATE_V1_VERIFICATION.json` records offline gates/source hashes and aggregate live measurements. Detailed ignored logs remain under `test-results/generic-*`; no credentials/environment, disposable database, build output or test-output directory is committed.

## Deliberate and inherited limits

- Six generic families only. No new relationship/condition/party-promotion or persistent ground-placement authority; ordinary promises/attitudes/props remain Scenes/Memory where suitable.
- New Items are food/supply/misc, 1–20 quantity and empty mechanics. Existing equipment may transfer/equip under current ownership/slot policy; no new weapon powers or magical payloads.
- Quest title/description currently retain the shared legacy constructor's tighter 120/500-character limits (rather than the design's outer 200/1,000 envelope); reward Item text retains 80/160. These are documented implementation limits, not immutable security principles.
- New combatants may reuse only an already configured public basic actor statline with bounded max HP and attack/defense/skill/save. No bestiary/profile expansion is implemented. A missing usable profile cannot become invented HP damage.
- Private-informed genuinely new public wording cannot be created in the same response unless it already appears in pinned public evidence. Already-public job/issuer/offer quotation works; this does not solve all private-informed same-turn record creation.
- Formal short/long rest reuses current supply/safety/encounter calculations. Ordinary lodging permission remains fiction; no new permission subsystem or permanent safe-Location write.
- Progression and older specialized effect/mechanic flows are retained with their historical contracts and explicit authorities. Not every older effect gets a new generic authoring surface.
- An existing explicit legacy `mode=mechanic` claim on the post-takeover bootstrap fixture lacks source runtime/snapshot timeline fields. Read-only claim comparison reproduces it identically on M51 and M52; this pass does not fix that pre-existing legacy admission issue. The generic combat/rest path and active encounter budget are tested independently against supported state. No end-to-end manual encounter-start success is claimed.
- Model fictional quality and truthful consequence tagging still need owner play review. No owner action, 30-turn owner campaign review or production activation is claimed.

## Review / activation boundary

Review this isolated branch, Migration 52, privacy cases and live coverage first. Owner activation would require separate explicit authorization, a fresh owner backup/integrity check, applying the reviewed M52 once and integrating/restarting the owner app. None of that was performed here.

## Changed files

- `AGENTS.md`
- `ASTRA_GENERIC_STATE_V1_IMPLEMENTATION.md`
- `ASTRA_GENERIC_STATE_V1_LIVE.json`
- `ASTRA_GENERIC_STATE_V1_VERIFICATION.json`
- `DEV_STATUS.md`
- `MASTER_SPEC.md`
- `scripts/astra-generic-live-smoke.mjs`
- `src/lib/gameplay/astra-capabilities.ts`
- `src/lib/gameplay/astra-generic-compiler.ts`
- `src/lib/gameplay/astra-generic-contract.ts`
- `src/lib/gameplay/astra-plan-context.ts`
- `src/lib/gameplay/astra-plan-schema.ts`
- `src/lib/gameplay/astra-primary.ts`
- `src/lib/gameplay/astra-privacy-context.ts`
- `src/lib/gameplay/astra-settlement.ts`
- `src/lib/gameplay/dm-store.ts`
- `src/lib/gameplay/server-contracts.ts`
- `src/lib/progression/settlement-core.ts`
- `src/lib/server/dm/astra-primary-provider.ts`
- `src/lib/server/dm/store.ts`
- `supabase/migrations/202610140052_astra_generic_state.sql`
- `tests/astra-generic-compiler.test.mjs`
- `tests/astra-generic-fixture.mjs`
- `tests/astra-generic-journey.test.mjs`
- `tests/astra-generic-live-harness.test.mjs`
- `tests/astra-generic-migration.test.mjs`
- `tests/astra-generic-provider.test.mjs`
- `tests/astra-generic-runtime.test.mjs`
- `tests/astra-generic-soak.test.mjs`

## Delivery status

OFFLINE CANDIDATE COMPLETE — LIVE COVERAGE INCOMPLETE: additional real tool/check continuation not dispatched within the $5 reservation ceiling.
