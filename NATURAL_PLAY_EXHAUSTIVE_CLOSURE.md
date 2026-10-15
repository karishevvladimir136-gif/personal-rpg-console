# Natural play exhaustive closure

## Review status

Starting reviewed SHA: `65dc99c105d86b2860d284d10846c450d20b3e2d`.
Branch: `codex/natural-play-exhaustive-closure`.
This is an isolated candidate. Main, owner application/environment, owner DB (Migration 51), Iris and deployment have not been changed by this task. Migration 52 is disposable-only. No owner operation has been retried or cancelled.

Runtime offline verification is in progress. Live acceptance and the separately gated UX closure are pending. This report does not authorize activation.

## Three authority layers

1. **Ephemeral fiction:** bounded public Scene continuity, without Entity/Location/Item/Quest rows merely for naming or conversation.
2. **Promotion:** the private `natural-v1` contract pins server-derived provisional materialization receipts. Accepted jobs/trade/party effects, actual combat tools, inventory acquisition or explicit tracking select effective records. Rejected optional setup is pruned, including unused merchant stock.
3. **Hard state:** existing runtime, deterministic dice, effects, commerce, progression, rest, ownership, revision/fence and atomic TurnStore commit remain authoritative. No raw SQL/RecordChange interface is offered to Astra.

`astra-primary-v1` remains the only gameplay runtime. New natural operations require an actual Astra-taken-over timeline. Direct console-basic campaigns retain their accepted P1/unified behavior without promotion; missing historical contract pins retain their original semantics. Browser payloads cannot choose the private contract.

## Before / after support matrix

| Scenario class | Reviewed starting behavior | Candidate deterministic evidence |
| --- | --- | --- |
| Unrecorded mill/miller, name, incidental dialogue | Fiction allowed; no dedicated public continuity identity | Bounded Scene capsule; immediate continuation, learned name and ten-turn callback |
| Scene locale / tracked place | Narrative sub-place; tracked Location unchanged | Explicit locale and parent ID; tracked promotion only when requested |
| Accept / decline delivery job | Requires eligible durable issuer | Promote accepted issuer once; one existing Quest/job; decline creates none |
| Buy bread / barter / sell / haggle / refuse | Requires eligible merchant and stock | Minimal promoted merchant/stock; existing deterministic settlement validates funds/ownership; refused effects transfer nothing |
| Pick up stick/stone/apple | Requires existing inventory authority | One bounded mundane Item; server IDs, no power payload |
| Drop / retrieve / give | Existing transfer rules lacked genuine scene-ground anchor | Existing Item store plus campaign/parent/locale-anchored ground Storage; quantities conserved |
| Consume / break / discard | Existing consume/removal authority | Reused ordered mechanics, no new verb-specific action catalog |
| Rat/dog/bandit/incidental combat | Existing target records required | Server default actor + existing encounter/tool authority; canonical initiative, exact replay |
| Flee / rest | Existing mechanics | Existing encounter escape and formal rest; supplies/time/recovery remain validated |
| Companion agreement | Existing NPC required | Bounded role/storage promotion; sole controlled player, no invented private relationship history |
| Private-informed refusal | Safe two-stage boundary, broad Character Model relevance | Selected-evidence routing plus enum-only observable behavior bridge |
| Rejected optional durable assertion | Dependency filtering could leave no ordinary prose | Required independent fiction beat survives; rejected dependent success assertions removed |
| Session/save/load/retry/fork/World Lab | Existing authorities | Natural receipts/capsules preserved; trusted source-hash rebinding; detached saved Location projection verified |

The 25-case matrix includes seven ordinary incidental interactions, work, commerce, acquisition, combat, rest, callbacks, session transitions, retries and private refusal. Scripted contradiction cases supply Canon absence/destruction, unsupported legendary power, fabricated debt, money/HP cheats and secret-knowledge assertions. These prove priority evidence and hard-state admission; they are **not** a guarantee that a live model always obeys semantic Canon.

## Continuity and locale

Scene capsules are at most 12 subjects and 12,000 UTF-8/jsonb-accounted bytes. The provider receives the current capsule plus at most three relevant historical capsules. IDs/provenance are server-derived. An explicit selected subject reference may refine a public label (miller → Hobb), preserving identity and origin; it does not rename an existing Entity. Corrected Scenes invalidate generated capsule evidence rather than outranking owner corrections.

A locale is a room/building within the current known parent Location. It creates no Map pin. Historical subject recall does not establish current durable NPC presence. Configured durable presence remains parent-Location scoped; this candidate adds no NPC room/travel simulation.

## Promotion and atomicity

Migration: `supabase/migrations/202610140052_astra_natural_play.sql`.

The existing private turns gain nullable natural contract/state; public Scenes gain bounded continuity; existing Storages gain genuine ground anchors. No second journal, inventory, reward, Quest or Memory store is added.

Requests contain only subject reference, kind, purpose and optional merchant reference: at most three per response/eight per operation. Standard IDs derive from the fenced operation. New actors use server-owned mundane defaults (HP 8, attack 0, defense 10, skill 0, unarmed damage 2), zero funds; new Items are quantity one, neutral description and empty mechanics. No species simulator, wealth or magical powers are accepted from the model.

Existing dice guards run against an independently reconstructed provisional source in a rollback subtransaction. Only private receipts survive tools. Final commit independently reconstructs effective rows and runs the existing guard chain. The narrow INSERT revision adapter checks exact expected new rows under the private live lease/source hash; existing row updates and revision guards are not suppressed. Narration Scene continuity is attached during its original INSERT. Any failure rolls back all gameplay changes.

Publication and the exact final/narration checkpoint now share the existing checkpoint RPC transaction. A reproduced failure between the former two calls left publication pinned alone and blocked a later valid retry. The optional private checkpoint argument closes that window: SQL failures roll back both, and lost successful responses reuse both pins without another provider dispatch. It adds no separate receipt/store or public authority.

Save restoration validates immutable manifest authority and rebinds only the trusted active restored source hash. The ground Location FK is deferred to transaction end because the existing save loader restores Storages before Locations. It still rejects foreign/missing Locations. Actual pre/post promoted-Location World Lab runs use saved standard Locations and existing detached actor projection; frozen World rows/events remain identical. No second Foundation location catalog is introduced.

## Privacy and publication

Public-only selected context → Astra High unified → validate → commit.
Relevant selected secret evidence → Astra High private adjudication → enum bridge + strictly public context → Astra Medium narration → validate → commit.

The 30-turn mixed fixture routes 24 turns public-unified and six private-informed. Unrelated campaign secrets and mere Character Model possession do not force two-stage. This is a bounded lexical selection policy, not a perfect semantic relevance classifier. Legacy routing is preserved.

The bridge permits only actual present noncontrolled actor ID, stance, tone and intensity. It carries no free text, secret reason, cognition or private checkpoint material. Literal disclosure rejection remains defense in depth. Private semantic fixture content is absent from public generation context.

An independent public fiction beat is mandatory. Optional-effect success assertions belong in exact effect-dependent beats. Validated base/tool outcomes and mandatory inventory/tracking promotion may use separate beats with empty effect dependencies: the entire final is validated atomically, rather than optionally filtering those outcomes. Rejected optional-effect beats are removed without invented replacement mechanical fiction. Server checks dependency bounds; it cannot prove arbitrary prose semantics.

## Offline acceptance

- Disposable Migration 52 populated/empty-chain, authority/replay/atomicity/recovery tests: 24 passing nodes, including six publication/checkpoint failure or uncertain-response regressions.
- Continuity tests: 13 passing nodes, including learned-name identity and 20 rapid turns.
- Selected-context routing: six passing nodes; 24 public / six private mixed turns.
- Provider/schema regressions: seven passing nodes.
- Effective-record pruning: seven passing nodes.
- Bounded live-harness regressions: eight passing nodes; no paid dispatch.
- Production acceptance file: 49 nodes, including the 25 scenarios, contradiction/hard-admission checks, direct TS/SQL parity and actual failed background maintenance.
- **200-turn production soak passed:** 200 committed turns, 220 fake primary responses, zero paid calls. 52 background summary calls/165 postcommit maintenance attempts; no foreground summary wait. Immediate continuity, callback, source coverage past the raw history window, soft-target overflow, exact committed replays and final save/load passed.
- Exact soak after-state: HP 10; Focus 20; Silver 2; world minutes 9,600; original tracked Location; supplies 30; 20 completed rests; 19 new mundane Items; one completed/paid Quest. Frozen World/Event rows and second-campaign isolation remain intact.

The pre-atomic-closure complete rerun passed **2,482/2,483**, zero failures, one existing explicit-opt-in disposable Supabase Auth/PostgREST skip, 691.732 seconds. The first run had one HTTP 500 with Next dev's `Unexpected end of JSON input` during compilation; all ten HTTP security checks passed unchanged on recheck and on a fresh credential-free production server. No product-code workaround was inferred from that transient test-server evidence. A fresh complete run after the atomic recovery fix is required before live dispatch. Final TypeScript, zero-warning lint and production-build results will be recorded with that gate.

Four reproduced integration failures were fixed and retained as disposable evidence: raw claim history coverage reinstated after provisional projection (turn 62), TOAST-backed JSON escaping a rolled-back subtransaction, ground-FK restoration order, and publication pinned without its checkpoint. No owner failure is attributed to these synthetic findings.

## Live acceptance and UX gate

Pending all offline gates. Authorized ceiling: ten text requests/$5, default tier, no media, no owner data, no quality retries. Six sequential synthetic topics and exact replay are asserted by the import-safe bounded harness. A failure stops the run. UX changes must follow runtime acceptance in separate commits.

## Bounded limitations

- Natural promotion currently applies to actual Astra-taken-over World Logic-origin timelines; direct Console campaigns retain P1 behavior.
- New combat targets use generic mundane defaults. Adding a new target to an already active encounter is unsupported. Previously promoted actors use the existing encounter.start effect; materializing them again for combat can reject scaling updates. Encounter start/end must be separate mechanic_actions effects from other mechanics.
- Generic possession/companion changes during an active encounter cannot bypass existing action-cost authority. Unsupported optional effects retain fiction without claiming completion.
- Default newly acquired Items have no special mechanics and do not automatically qualify as rest supplies.
- Durable NPC presence is parent-Location scoped. Public Scene omission cannot silently rewrite configured durable presence.
- No hidden numeric relationship meter, new relationship store, tactical grid, generic World authoring, extra gameplay agent, automatic media or VIDEO work.

## Evidence locations

Ignored local evidence is under `test-results/`: `natural-promotion-focused.log`, `natural-play-soak-report.json`, `natural-play-soak-final.log`, `natural-runtime-full.log`, `natural-runtime-typecheck.log`, `natural-runtime-lint.log`, `natural-runtime-build.log`, and the bounded live report when dispatched. The preview uses explicit `http://127.0.0.1:3112` with credential environment removed and no env files; HTTP tests never default to the owner server.
