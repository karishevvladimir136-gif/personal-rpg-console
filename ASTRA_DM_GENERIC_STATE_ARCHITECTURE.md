# Astra as DM; Console as Memory, ledger and saves

**Status: architecture proposal only; not implemented or approved for activation.**

This report preserves the checkpoint and proposes its replacement architecture. It changes no production code, test, migration, owner data, or application configuration. Migration 52 remains an unapproved draft. The owner database remains outside this task; its reported Migration-51 state was not queried.

## 1. Evidence, source priority and preserved history

Source priority is `MASTER_SPEC.md` → `DEVELOPMENT_PLAN.md` → `AGENTS.md` → production repository → checkpoint implementation. The specification's primary DM, server dice, public/private separation, bounded Memory and manual-correction authority remain controlling requirements. The checkpoint is evidence, not a new source of product authority.

| Reference | Exact commit |
| --- | --- |
| Production main | `8ad7b87da43100320e93a44646a87016fc9a95ad` |
| Checkpoint starting point | `65dc99c105d86b2860d284d10846c450d20b3e2d` |
| Preserved checkpoint | `338667d8468b7f6e4fd42fcf8f5859bfb6300f30` |
| Isolated branch | `codex/natural-play-exhaustive-closure` |

The exact checkpoint was verified clean and pushed unchanged before creating this report. The remote branch then resolved to `338667d8468b7f6e4fd42fcf8f5859bfb6300f30`; remote main resolved to `8ad7b87da43100320e93a44646a87016fc9a95ad`. The later documentation commit adds only this file.

The ancestry was inspected, rather than inferred from branch names:

```text
8ad7b87da43100320e93a44646a87016fc9a95ad  production main
  -> 65dc99c105d86b2860d284d10846c450d20b3e2d
     fix: separate fictional freedom from durable authority
    -> 338667d8468b7f6e4fd42fcf8f5859bfb6300f30
       wip: checkpoint natural-play work before architecture reframe
```

Both `merge-base(main, starting-point)` and `merge-base(main, checkpoint)` equal production main. Main versus checkpoint has **0 commits unique to main and 2 unique to the checkpoint**. The checkpoint has the starting point as its direct parent; the starting point has production main as its direct parent. There is no divergence.

The checkpoint contains 32 changed/added files. Its tracked paths and newly added lines were inspected for credentials, owner evidence and ignored diagnostic artifacts. No such new material was found. Existing historical status-document records were preserved. Synthetic test secrets are fixtures, not owner DM evidence. No ignored output, credential file, environment file, database, or dependency directory was added.

## 2. Architecture decision

**Astra is the DM. Console supplies durable state, long-term Memory, saves, deterministic tools, privacy and UI.**

1. Structured state is authoritative, not exhaustive.
2. Missing records never block plausible, non-contradictory fiction.
3. Ordinary creative actions do not require a handler for each verb or fictional object.
4. Validation decides whether a durable mutation is legal. Rejection of that mutation does not reject independent narration.
5. Astra owns fictional adjudication. Console owns persistence, rule-bound effects and system invariants.

A mill, miller, conversation, offer, path through a room or picked-up untracked prop may first exist in public narration. Only consequences worth durable tracking require operations. Creating a record must not be an admission ticket to fiction. Established facts and owner corrections still constrain invention.

### Minimal turn pipeline

```text
literal input + operation/runtime/contract pin saved together
  -> authoritative current state + Canon/corrections
     + recent public Scenes + relevant bounded Memory/Craft/Character Models
  -> select and pin response mode from the actual provider-bound context
  -> Astra tool request OR final response
     [repeat only for requested deterministic tools]
  -> narration + optional generic operations + private patches
  -> one Generic Delta Compiler; validate operations and narration dependencies
  -> pin canonical proposal and public publication
  -> existing TurnStore atomic Scene/state/private commit
  -> background Memory maintenance
```

For `public-unified`, the final narration is authored in the primary response. For `private-informed`, private adjudication is followed by narration from a freshly constructed public-only context. There is one primary DM and no semantic resolver or NPC agent before or after it.

Zero operations and zero private patches are normal. Narration-only is always an available gameplay outcome; it does not need `unsupported_optional`. This does not bypass owner authorization, private-data boundaries, a stale timeline/revision, malformed transport, or a failed database transaction. Those are system failures, not judgments that a fictional action is impossible.

No foreground summary call returns. Approximately 64 KB remains a **soft selection target**, not a validity threshold. Required exact state, Canon/corrections and necessary evidence outrank optional Craft and prose. Context selection stays bounded; this proposal does not claim infinite provider capacity or replay the entire campaign transcript.

## 3. Concrete model-facing contract

This is the proposed normative JSON grammar, expressed as closed TypeScript-shaped schema for readability. It is a design, not a new executable interface. Every object has `additionalProperties: false`; every listed field is required, with `null` used explicitly where shown. Nested unions become closed schema alternatives. The top-level object retains tool/final decisions. Cross-field, scope and rule checks run independently of provider schema validation.

### Scalars and operation-local identity

```typescript
type LocalId = string;       // /^[a-z][a-z0-9_-]{0,31}$/
type KnownHandle = string;   // exact enum issued in this operation's public packet
type EvidenceHandle = string; // exact enum bound to selected public evidence/version
type RuleHandle = string;    // exact enum for an existing server rule/capability
type ProofHandle = string;   // exact enum for a durable server tool/rule/public-evidence receipt
type Ref = { source: "known" | "local"; key: string };
type PublicText =
  | { source: "inline"; text: string }
  | { source: "public-evidence"; evidence: EvidenceHandle };
type Basis =
  | { source: "tool" | "rule" | "public-evidence"; key: ProofHandle }
  | null;
type Common = {
  opId: LocalId;
  requiresOperations: LocalId[];
  atomicGroup: LocalId | null;
};
```

Known handles map to exact existing records, campaigns and revisions in a server-owned manifest. They are not UUIDs supplied by the model. A local reference names an earlier creating operation's `opId`; subsequent updates may use that reference. A creation gets its stable ID from the existing deterministic-ID utility with a versioned namespace containing **campaign ID + gameplay operation ID + opId**. Updates preserve the resolved existing ID. IDs are never derived from a mutable display name.

The manifest also binds public-evidence handles to exact public text spans or typed fields and their versions. They are not arbitrary JSON paths. Rule and proof handles cannot select hidden records, another campaign, arbitrary code, or a receipt belonging to another turn. A tool receipt gets its order and identity from the server, never from a model handle.

### Decision and public publication

```typescript
type Decision = {
  type: "tool" | "final";
  toolRequest: null | {
    operations: GenericOperation[];
    call: {
      kind: "query" | "skill" | "attack" | "save" | "damage";
      actor: Ref | null;
      target: Ref | null;
      item: Ref | null;
      dc: number | null;
      scope: "current-public" | null;
    };
  };
  final: null | {
    publicNarration: PublicNarration | null;
    genericOperations: GenericOperation[];
    privatePatches: PrivatePatch[];
    publicBehavior: PublicBehavior[];
  };
};
type PublicNarration = {
  beats: { text: string; requiresOperations: LocalId[] }[];
  visualDescription: { text: string; requiresOperations: LocalId[] } | null;
  sceneLocale: { label: string; requiresOperations: LocalId[] } | null;
};
type PublicBehavior = {
  actor: Ref;
  stance: "accept" | "refuse" | "hesitate" | "deflect" | "leave" |
          "attack" | "offer_conditions";
  tone: "neutral" | "warm" | "firm" | "guarded" | "angry" | "fearful" | "tired";
  intensity: 1 | 2 | 3;
};
type PrivatePatch = {
  kind: "fact" | "clock" | "npc" | "faction" | "consequence";
  key: string;
  operation: "set" | "advance";
  value: string | null;
  amount: number | null;
};
```

Exactly one decision branch is non-null and matches `type`. `publicNarration` is required/non-null for a public-unified final and must be null for private-informed adjudication. The public-safe narrator returns only `PublicNarration`, never state operations or private patches. Existing private-patch validators, including Character Model restrictions, remain authoritative; this shape is not permission to replace private Canon or create arbitrary Character Models.

Bounds proposed for the new contract:

- At most 12 operations in the entire turn, including tool-prelude operations; at most 12 tool positions under the existing stricter runtime/request ceilings where applicable. No extra provider calls are authorized by this report.
- At most 12 public beats, at most 6,000 characters total; at least one nonempty, independently understandable beat with `requiresOperations: []`. Visual description is at most 2,000 characters; scene locale is 1–120 characters.
- Operation IDs and atomic-group IDs are unique within their respective namespaces. Dependency lists are unique and at most 12 entries. Local references point backward; cycles and ambiguous creation aliases are rejected.
- Public behavior is at most two present, non-controlled NPCs/companions. The bridge has no reason, quote, free text, hidden identifier or arbitrary intensity.
- At most 12 private patches. Keys are bounded to 80 characters and existing allowed namespaces; values to 2,000 characters. `set` uses a string and null amount; `advance` uses null value and an integer within the existing clock's bounds. Existing validators may impose stricter bounds. Character Model identity remains immutable.
- Tool field combinations follow existing tool validation: query has `scope: "current-public"`; non-query has null scope; actor/target/item/DC requirements depend on kind. A skill/save DC is an integer in the active ruleset's allowed range. No model dice, totals, damage, receipt identity or tool position is accepted.
- Limits are safety ceilings, not a requirement to emit records, narration of a fixed length, tools, or a Quest.

### Generic operations: closed union

```typescript
type GenericOperation = Common & (
  | { kind: "entity.upsert"; target: Ref | null;
      name: PublicText | null; description: PublicText | null;
      profile: RuleHandle | null; present: boolean | null }
  | { kind: "location.upsert"; target: Ref | null;
      name: PublicText | null; description: PublicText | null;
      status: "known" | "visited" | null; makeCurrent: boolean }
  | { kind: "item.mutate"; mutation: ItemMutation }
  | { kind: "resource.adjust"; mutation: ResourceMutation }
  | { kind: "quest.mutate"; mutation: QuestMutation }
  | { kind: "time.advance"; minutes: number | null; basis: Basis }
);
type ItemMutation =
  | { action: "create"; name: PublicText; description: PublicText | null;
      category: "food" | "supply" | "misc"; quantity: number;
      owner: Ref | null; storage: Ref | null; basis: Basis }
  | { action: "update"; target: Ref; name: PublicText | null;
      description: PublicText | null;
      equipment: { wearer: Ref; slot: KnownHandle | null } | null }
  | { action: "transfer"; target: Ref; quantity: number;
      recipient: Ref | null; storage: Ref | null; basis: Basis }
  | { action: "consume" | "remove"; target: Ref; quantity: number; basis: Basis };
type CurrencySelection = { existing: KnownHandle | null; publicName: PublicText | null };
type ResourceSelection =
  | { kind: "hp" }
  | { kind: "tracked"; key: KnownHandle }
  | { kind: "currency"; currency: CurrencySelection };
type ResourceMutation =
  | { action: "delta"; actor: Ref; resource: ResourceSelection;
      amount: number; basis: Basis }
  | { action: "transfer"; from: Ref; to: Ref;
      currency: CurrencySelection;
      amount: number; basis: Basis };
type QuestMutation =
  | { action: "create"; title: PublicText; description: PublicText;
      issuer: Ref | null; reward: RewardTerms | null; basis: Basis }
  | { action: "update"; target: Ref; title: PublicText | null;
      description: PublicText | null }
  | { action: "status"; target: Ref; status: "open" | "complete" | "archived";
      outcome: PublicText | null; basis: Basis }
  | { action: "claim"; target: Ref; basis: Basis };
type RewardTerms = {
  currency: CurrencySelection | null;
  amount: number;
  item: { name: PublicText; category: "food" | "supply" | "misc";
          description: PublicText | null } | null;
};
```

These are six families, not six player-action handlers. Different verbs compose the same operations. Field alternatives are deliberately limited; no `values`, free-form metadata, arbitrary record patch, SQL, model-selected UUID, executable mechanic or privilege field exists. A reference's family is checked against its position, not merely against UUID syntax.

Null target means create under the operation's stable local identity. A non-null target means update the resolved record; it never means “find a similar name and overwrite it.” On an update, null optional fields mean leave unchanged; an explicit nested equipment slot of null means unequip. At least one allowed field must actually be proposed. No identity merge is inferred from names.

A CurrencySelection has exactly one non-null selector. Public names use the existing 1–32-character normalized ASCII currency policy, maximum 32 campaign definitions, deterministic definition/resource keys and collision checks. New definitions are permitted only through the current accepted currency registry helper. A delta against a newly defined currency still needs separate bounded grant authority; definition creation alone authorizes no balance. RewardTerms amount is zero when currency is null and otherwise within the current 1–20 mundane reward bound; its optional Item uses the current 1–80-character name and 1–160-character description bounds with a deterministic fallback.

## 4. Authority and validation for every family

All operations share campaign/owner/timeline fences, expected source revision, current record revisions, closed shape checks and deterministic replay. TypeScript compiles an ordered virtual state. SQL independently reconstructs the same accepted plan from the pinned intents and authoritative source; it does not trust the compiler's `RecordChange[]` alone.

| Family | Allowed intent, creation/update and bounds | Existing authority and visibility | Independent validation and reconstruction |
| --- | --- | --- | --- |
| `entity.upsert` | Create an ordinary public NPC identity or update allowed public name/description/presence. Create requires name; description may use a deterministic public fallback. Name 1–200; description ≤1,000. New kind is `npc`; no new player, ownership, wealth, Character Model, secret identity, arbitrary stats, powers or companion status. `profile` is a server-issued existing bounded ruleset profile, create-only. Null profile creates an identity without invented combat stats. | `public.rpg_entities`; presence in existing `rpg_private.runtime_state.configuration`. Known/local refs resolve exact actors. New IDs are stable by opId. No World Actor/Event authoring. | TS checks public provenance, current presence/location, existing kind, manual corrections and profile eligibility. SQL repeats these checks and builds exactly the allowed Entity/configuration fields; any HP/default statistics are from the named server profile, never text. No silent overwrite of an unrelated actor. |
| `location.upsert` | Create a useful tracked public place or update its public label/description/known status. Name 1–200; description ≤1,000. `visited` requires established presence or the accepted transition. `makeCurrent` requires actual travel and strictly positive accepted world-time advance; null status preserves current status on update. No arbitrary topology, hidden-location discovery, weather engine or Foundation route rewrite. | `public.rpg_locations`, `public.rpg_public_state.current_location_id`, existing runtime clock/configuration. Both known/local refs accepted. Scene locale alone creates no Location. | TS/SQL enforce campaign-known/visited policy, prior public evidence, revision, positive travel time and owner corrections. After takeover, standard records own play; World Lab uses the existing deterministic saved-state projection, extended only to include the new standard Location records. Frozen Foundation history is unchanged. |
| `item.mutate` | Create bounded mundane food/supply/misc with empty mechanical payload; rename/describe or equip an existing Item; transfer/split; consume/remove quantity. Creation names 1–80, descriptions ≤160 (current mundane helper bounds); updates stay within current record policy, names ≤200 and descriptions ≤1,000. Creation quantity 1–20, all quantities positive integers. Existing stack/aggregate limits remain ≤1,000,000. No new magical/equipment powers, provenance invention or ownership by text. `remove` sets/decreases quantity, not destructive historical deletion. | `public.rpg_items`, `public.rpg_storages`, Entity equipment-slot definitions and existing item policies. Create/transfer to an authorized recipient derives its normal carried storage if storage is null. The generic ownership adapter may derive one stable default Storage only where current actor/storage policy permits; otherwise a real authorized storage must resolve. Equipment updates reuse current slot/type rules. | TS checks ownership/access, exact quantity, known policies, compatible destination and one Item per slot. SQL recomputes transfer conservation, any minimal derived Storage, deterministic split ID, equip pairing and current revisions. `settledItemTransfer` supplies shared arithmetic. Reciprocal exchange is grouped atomically. No new free-form mechanics payload reaches an Item. |
| `resource.adjust` | Adjust existing HP/resource or transfer currency between scoped actors. Integral delta, absolute amount ≤1,000,000 and stricter current policy limits; after-state is bounded, currency nonnegative, HP 0..max. HP decrease requires recorded server damage; HP recovery/increase requires existing rule authority. Existing resource increases need a rule; decreases need available balance and action-cost authority where applicable. Transfer uses positive amount, both balances and the same currency. | `public.rpg_entities.hp/resources`; current campaign currency/progression registry through accepted mechanics helpers. Resource handles bind keys; no arbitrary model-created key. A bounded public currency name may select/create only the existing normalized deterministic currency definition, not new money policy. | TS/SQL check damage/rule receipts, action budgets, balance conservation, no duplicate receipt consumption and profile limits. Existing `settledCurrencyBalance` is reused. Currency registry creation does not mint money. Small grounded grants remain possible through existing mundane-grant policy/public evidence, with its current cap (up to 20), not arbitrary positive delta. |
| `quest.mutate` | Create a real accepted commitment, update public wording, transition existing status, or claim stored reward terms. Titles 1–200; descriptions/outcomes ≤1,000. Create starts `open`; no casual dialogue becomes a job automatically. Reward terms use current bounded currency/item policy and present issuer. Claim uses stored terms only, with no replacement amount. | `public.rpg_quests`, including issuer/reward terms/reward_operation_id from existing settlement authority. Stored statuses are `open`, `complete`, `archived`. No new Quest store or World Event receipt. | TS/SQL validate issuer, real commitment, transition and one-time claim. `claim` internally invokes existing job-reward settlement and sets reward_operation_id in the same commit. Failed/abandoned fiction can archive with a public outcome; old archived records are not reinterpreted as failures. Existing/local refs and stable creation IDs prevent duplication. |
| `time.advance` | Advance the current authoritative clock by integer minutes, 0..1,440 total per turn under current limits; null minutes means the referenced rule computes the exact duration. No backward time or absolute model timestamp. Dialogue may use zero. Actual tracked Location change requires positive advance. | `rpg_private.runtime_state.world_minutes` and existing rest/time helpers. No Scene label changes clock automatically. | TS/SQL derive from current clock, validate the bound and rule result, and reject duplicate application of a rest duration. Existing turn/fence receipt gives exact replay. Rule-derived rest, supply consumption and recovery share one atomic group. |

### Deliberate limits and omitted families

- **No initial `relationship.set`.** Public agreements, promises and changes of attitude already live in public Scenes and bounded Memory; actual accepted jobs can use Quests. Existing Character Model relationships are private, evidence-constrained and owner-established. A new “public relationship label” table or a bypass to create/update Character Models would add authority. Keep the existing private-patch path; consider a future typed relationship operation only if a concrete durable need remains.
- **No initial `condition.set`.** Existing conditions that change mechanics must come from current rule effects or server tools. The model cannot invent `advantage`, `dead`, permanent bonuses or arbitrary condition strings. Existing validated rules may emit condition/participant changes internally. Ordinary “muddy,” “embarrassed” or “tired” prose needs no operation.
- **Ground placement is a real storage limitation.** Production Items require a storage; production Storage kinds have no general ground/locale anchor. The draft's new `ground` Storage is not silently accepted here. Initial transfer requires an existing authorized recipient/storage; pickup may create a bounded Item in the hero's carried storage. Persistent dropped-object placement/retrieval needs a later explicit generic placement decision. Do not use a fake camp storage, provenance history or an invented Location as a second current Item store.
- **Combat profiles are ruleset data.** A generic NPC constructor may use an existing server-owned profile; this does not prove every creature has an available profile today. The rat acceptance fixture must explicitly supply a valid bounded profile. When no profile exists, independent confrontation/flight fiction continues, but the system must not claim mechanically unsupported HP damage occurred.
- **An unrecorded merchant is not an unlimited wallet.** Negotiation remains free. A transfer needs authoritative funds; a small externally grounded grant needs the existing grant policy. Creating a currency definition does not provide a balance. No new merchant-specific constructor is proposed.
- Existing progression, party, trade, rest, crafting and World Lab authorities remain supported for old operations and their current explicit flows. The initial generic vocabulary does not grant every existing authority a new model-write surface.

## 5. One Generic Delta Compiler

### Chosen representation

Use a small **server-only generic plan, schema 3**, in the existing private ordered-effect/checkpoint authority. Reuse the existing `astra_ordered_effects` JSONB column for the versioned plan and the existing Astra final/checkpoint for its pin. Do not add a second ledger or event store. The column is JSONB without a schema CHECK, but Migration-48 wrapper guards currently understand schema 2: new semantics require an explicit pinned version and new reconstruction branch, not a silent payload change.

The plan contains canonical operations, the server ref manifest, stable creation IDs, groups/dependencies, accepted/rejected op IDs, safe reason enums, rule/tool references, compiled `MechanicsResolution`, publication dependency decisions and the existing private-patch pin. Public DTOs receive existing public Scene/outcome projections, not this plan.

```text
GenericOperation[]
  -> parse closed intent envelope
  -> resolve operation-local handles / add implicit dependencies
  -> ordered virtual-state evaluation, with group rollback
  -> existing settlement + mechanics arithmetic as internal adapters
  -> collapse RecordChanges to original source revisions
  -> pin canonical schema-3 plan + final + publication
  -> SQL independently reconstructs and compares exact result
  -> existing runtime_change / TurnStore transaction applies once
```

`RecordChange` remains an internal persistence representation. Astra never supplies its table family, row ID, expectedRevision or raw values. `MechanicsResolution.changes`, worldMinutes, configuration and outcomes remain the application target. Existing row validators and maximum change counts still apply.

### Ordering, groups and narration

1. Validate owner, campaign, current timeline/fence, operation lease and source revision before any planning.
2. Validate the publication envelope independently from each optional operation. A malformed operation does not invalidate well-formed independent prose. Invalid JSON or an unusable publication envelope remains a provider-contract failure; the server does not invent missing narration.
3. Resolve known handles from the private manifest and earlier local creations. Add implicit dependencies for local refs; keep explicit dependencies for semantic prerequisites.
4. Compile in proposed order against a cloned authoritative state. Apply accepted changes only to that shadow. Preserve original expected revisions for the collapsed final change per row.
5. Treat a non-null `atomicGroup` as one contiguous all-or-nothing unit. A failure rolls back its entire candidate shadow, including earlier members. Groups cannot overlap; cycles/forward local refs are invalid. Later operations may depend on the completed group members.
6. Require reciprocal payment/Item exchange, ingredient/output bundles and formal-rest supply/time/recovery bundles to share an atomic group. Dependencies alone cannot undo a successful debit if a later transfer fails. Server validation checks this obligation; the model cannot obtain a one-sided trade by omitting a group.
7. Reject an invalid optional operation/group and its dependent operations. Evaluate unrelated operations normally. Unknown/foreign handles receive the same safe rejection without revealing whether a foreign record exists. Forged owner/fence/lease, stale source, altered pinned content and SQL mismatch remain whole-transaction integrity failures.
8. Retain only beats whose dependencies all succeeded. Filter visualDescription and sceneLocale by the same rule. Unknown/ambiguous dependency graphs reject the affected operations and dependent prose; do not guess identities. The independent beat still commits when system integrity permits.
9. Pin the accepted final and publication before atomic commit. Narration cannot mutate state. SQL mismatch rolls back the whole transaction; no reward precedes a failed Scene commit.

Example: independent mill dialogue, `bread` Item creation and `delivery-job` creation can be independent. Rejecting `bread` removes only its dependent beat. The job survives if it does not depend on bread. If the job truly requires delivery of that bread, its local reference creates a dependency and it is rejected too. No `unsupported_optional` marker is required.

### Tools against new identities, without a promotion subsystem

A tool request may contain a prefix of the **same generic operations**, for example a bounded NPC identity needed as an attack target. Compile and pin this prefix in the existing private checkpoint before executing the tool. Tools see a validated virtual projection; no public Entity, Item or encounter is inserted early. Receipt authority binds the prefix digest and tool position.

The final must repeat the pinned prefix unchanged and may append operations. A later changed prefix conflicts. The SQL tool/commit guard independently reconstructs that virtual view before accepting the receipt or final. Missing mechanical profile rejects the tool use; it does not create a combatant through a second special pipeline. A provider failure after tools leaves receipts and literal input durable but commits no provisional public rows.

The current Migration-38 source/receipt checks and Migration-45/48 allowed changes do **not** already authorize arbitrary new Entities or Locations. The future generic branch must factor/reuse their relevant checks with a canonical virtual plan. It must not rewrite stored original source, suppress revision triggers, or insert temporary public rows to trick old guards into accepting a target.

Derived defaults are limited infrastructure, not a promotion engine. For example, a legitimate recipient may need one carrying Storage for a transfer. Reuse/refactor the existing NPC-storage helper's bounded constructor against the generic public Entity instead of requiring a frozen World Actor name. Use only existing allowed Storage kinds/fields and deterministic IDs; do not create stock, wealth, commerce capabilities or a ground anchor. SQL must reconstruct this derived row too. If no existing Storage kind/policy can represent the destination honestly, reject that transfer while retaining independent narration.

### Existing helpers become internal targets

| Existing path | Generic use | Compatibility / retirement |
| --- | --- | --- |
| `settledCurrencyBalance`, `settledItemTransfer` | Shared integer/bounds/conservation arithmetic for all resource and Item operations. | Keep one implementation; callers validate scope/consent. |
| `planAstraSettlement` and mundane grant/transfer/purchase/sale/craft/exchange logic | Factor shared pure legality and change construction. Resource/Item groups supply intent, not a new model-facing sale grammar. | Retain old effect kinds and exact replay. Retire their use as the new generic prompt vocabulary only after the compiler is proven. |
| Job offer/complete/reward settlement | Quest create/status/claim compile to existing fields and one-time reward authority. | No synthetic World Event receipt; no fabricated job for informal rewards. |
| `planAstraMechanics`, `resolveMechanics`, `formal_rest` | Resolve configured rule bundles and derive actual time, supplies, HP/resources, participant/condition changes. | Preserve all rule checks. Model sees generic effects and server rule/proof handles; no player-verb routing. |
| `planAstraOrderedEffects`, shadow application, change collapse | Reuse ordered evaluation and original-revision collapse; extend to generic groups/dependencies. | Schema-1/2 paths remain version-pinned for old turns. |
| TurnStore / `runtime_change` / private-patch and Character Model validators | Existing durable input, lease, final pin, atomic state/Scene/private application. | No replacement store, no generic write-state API. |

## 6. Scene continuity and selected-evidence privacy

### Continuity without a mandatory noun registry

Persist the lightweight `sceneLocale.label` as the **new narration Scene's existing title** (≤120 characters, within its existing 200-character limit). Public Scene body contains the fiction. A room/building name does not alter `current_location_id`, create an atlas pin or advance time. Existing FRAME context already reads Scene title and body. Manual title corrections remain authoritative.

Use the current Scene, recent Scenes and relevant older Memory for names and callbacks. Reuse the checkpoint's bounded continuity selection: current scene plus at most three relevant older continuity entries, with learned public names and owner corrections winning. A derived continuity capsule may live in the existing checkpoint's explicitly public projection; it is a cache/index of cited public Scenes, not a source of truth or a mandatory registry for every noun. The minimal design does not require the draft `rpg_scenes.public_continuity` column.

Return-to-mill continuity must work when neither mill nor miller has a row. When tracking becomes useful, a generic create may link the prior public evidence to a stable new identity. Similar names alone never merge actors. Preserve the Memory race fix: selected history and `historyComplete` semantics must not be lost when rebuilding a packet after background maintenance/save/load.

### Call graph and mode pin

```text
selected public evidence only:
  Astra High (tools/continuations as requested, then public final)
  -> compiler/filter -> final checkpoint -> commit

selected secret-bearing evidence:
  Astra High private adjudication (tools/continuations as requested)
  -> compiler + public outcome projection
  -> Astra Medium public-safe narration
  -> publication checkpoint -> commit
```

Migration-51 `unified-v1`, `public-unified` and `private-informed` remain unchanged. Mode is chosen from the **actual selected provider packet**, including private Memory, hidden Character Model fields, private facts/clocks, World evidence and private continuation text. Unrelated private rows do not force two stages. Pin mode before tools/final, retain it on retry, and default unknown selected semantic fields to private-informed until explicitly classified. The relevance selector is not a semantic secrecy oracle; the narrator projection is the boundary.

The private-informed narrator receives only public state/Canon/Scenes/Memory, server-validated public outcomes and the enum-only behavior bridge. No private rationale, secret reason, raw private proposal, hidden clock, private patch, diagnostic prose or Character Model relationship is copied. “Refuse / firm / 2” may produce a refusal without explaining its secret cause. A `leave` or `attack` stance does not itself grant movement, damage or turn-cost authority.

### Prevent operations from becoming a secret-prose laundering path

Structural validation alone cannot make private-planner-authored Item descriptions, Quest titles or NPC names safe. Therefore:

- In public-unified mode, `PublicText.source: inline` is allowed only because the request contains no selected secret-bearing evidence. Existing public-fact/correction validation still applies.
- In private-informed adjudication, all free-text public operation fields must use `source: public-evidence`, resolving to exact already-public text/fields. Inline public text is rejected as an optional operation. Private patches remain private.
- The public narrator authors new free-form narration from public context only. A needed new public record description can be deferred to a subsequent public-only operation or use an already-public bounded fallback. This is an explicit initial limitation; do not solve it by passing private planner prose to the narrator.
- Rule/tool outputs expose only authorized observable outcomes. Unknown fields are never spread into public context. Public handles resolve only public records, and private receipt details/rejection reasons are not published.
- Literal-secret/identifier checks remain defense in depth. No paraphrase detector is treated as a semantic security boundary.

The enum bridge is a deliberately bounded declassification of observable behavior, not proof of zero information about an NPC's choices. Its permitted fields are owner-reviewed; it never carries secret reasons or general private text.

## 7. Checkpoint function/file triage

Classification meanings: **KEEP** directly reusable; **ADAPT** useful after becoming generic; **QUARANTINE** preserve but do not integrate without explicit rework; **DELETE LATER** remove only after a replacement is proven. Nothing is deleted or changed in this task.

All 18 changed TypeScript production files and the draft SQL migration are covered below. Multiple rows distinguish reusable code from rejected orchestration in the same file. Paths are relative to the preserved repository.

| File | Symbol / area | Classification | Reason | Target action |
| --- | --- | --- | --- | --- |
| `src/lib/gameplay/astra-natural-behavior.ts` | `naturalBehaviorStances`, `naturalBehaviorTones`, `validateNaturalBehavior`, `projectNaturalBehavior` | KEEP | Closed observable enums, present non-controlled actor scope, maximum two, no secret prose. | Reuse bridge and allowlist reconstruction. |
| Same | `NaturalBehavior.actorId` authoring | ADAPT | UUID authoring should use scoped handles. | Resolve known/local actor refs server-side; retain actor-scope checks. |
| `src/lib/gameplay/astra-natural-continuity.ts` | `readSceneContinuity`, `selectSceneContinuity`, `selectedContinuitySubjects` | KEEP | Bounded recent/relevant public continuity, learned-name/callback evidence. | Preserve selection and correction precedence. |
| Same | `SceneContinuityV1/Proposal`, `sceneContinuitySubjectId`, `buildSceneContinuity` | ADAPT | Locale and derived identity are useful, but no required object catalog or new public column is needed. | Cite public Scenes; existing title/checkpoint cache; no compulsory promotion. |
| `src/lib/gameplay/astra-natural-contract.ts` | Freedom and independent-narration guidance in `naturalPlayInstructions` | KEEP | Missing records should not block fiction. | Retain principle, extract concise generic guidance. |
| Same | `naturalReferenceSchema`, `naturalizeReferenceSelections`, `resolveNaturalReferences` | ADAPT | Shared alias/enum work can support a generic handle manifest. | Replace subject/purpose aliases with typed known/local refs. |
| Same | `naturalMaterializationsSchema`, purpose/kind instructions, `natural-v1` authoring | QUARANTINE | Purpose-specific promotion is the architecture being stopped. | Replace new-operation vocabulary; preserve checkpoint evidence. |
| `src/lib/gameplay/astra-natural-effective.ts` | `intentReferences`, `foreignKeys`, `dependencies`, generic dependency closure | ADAPT | Dependency closure is useful across all operations. | Use typed dependencies, accepted groups and local-ref reachability. |
| Same | `usedByAcceptedIntent`, `effectiveNaturalRecordIds`, `effectiveNaturalChanges` promotion policy | QUARANTINE | Record retention depends on job/trade/party/combat purposes. | No purpose-specific promotion receipt pruning in generic path. |
| Same | `pruneRejectedPromotionIntents` rewrites into unsupported optional intent | DELETE LATER | Generic per-op rejection and beat filtering make this rewrite unnecessary. | Delete only after generic compiler/replay tests; preserve old semantics where required. |
| `src/lib/gameplay/astra-natural-effects.ts` | Scope/transfer arithmetic in `authority`, `assertNaturalEffectScope`, `carriedStorage`, `planNaturalEffect` | ADAPT | Validity checks and ownership arithmetic are reusable. | Factor shared generic transfer validation; use real production storage authority. |
| Same | `NaturalEffectIntent`, `isNaturalEffectIntent`, `isNaturalEncounterIntent`, companion/ground handlers, `planNaturalEncounter` | QUARANTINE | Separate companion/ground/combat promotion dispatch broadens scenario-specific architecture. | Keep existing mechanics helpers internal; no model-facing equivalent pipelines. |
| `src/lib/gameplay/astra-natural-promotion.ts` | Stable IDs, bounded constructors, virtual projection in `materializeNaturalSubject`, `projectNaturalSource` | ADAPT | Determinism and shadow construction are useful. | One generic entity/item/location compiler with closed fields. |
| Same | `NaturalMaterializationRequest/Receipt`, `NaturalTurnState`, `subject`, `naturalLocaleKey`, `naturalMaterializationChanges`, purpose dispatch/merchant stock | QUARANTINE | Separate promotion authority/receipts and merchant-specific creation are unnecessary. | Preserve only as checkpoint evidence; use one generic plan. |
| `src/lib/gameplay/astra-ordered-effects.ts` | `applyAstraShadowChanges`, `collapse`, `planAstraOrderedEffects` ordering/revisions | KEEP | Existing atomic shadow evaluation and original-revision collapse are sound reuse targets. | Share implementation; add generic atomic-group semantics. |
| Same | Natural-effect dispatch in ordered planner | QUARANTINE | Domain promotion is embedded in central ordering. | Remove from new generic branch; retain old-version behavior if ever supported. |
| `src/lib/gameplay/astra-plan-context.ts` | `astraPlanProjection`, `buildAstraPlanContext` bounded selected context/voices | KEEP | Reuses Memory/Canon and soft context budgeting. | Preserve selected source authority and budgets. |
| Same | Natural instructions/ref/continuity insertion | ADAPT | Generic handles and cited public continuity replace materialization terms. | Add compact generic authoring projection. |
| Same | `natural-v1` purpose instructions | QUARANTINE | They make fictional intent depend on promotion categories. | Omit from target prompt. |
| `src/lib/gameplay/astra-plan-schema.ts` | `astraPlanResponseSchema`, `withSharedEnums` | ADAPT | Closed schemas and shared enums are useful; model-facing unions must change. | Generate six-family contract with scoped handles and separate per-op admission. |
| Same | Materializations, `item_relocate`, `companion_join` schema additions | QUARANTINE | Scenario-specific additions should not become permanent vocabulary. | Preserve evidence; no target contract branches. |
| `src/lib/gameplay/astra-primary.ts` | `unifiedNarration` independent-beat work, atomic `persistCheckpoint`, Memory packet/history preservation | KEEP | Publication safety and race/recovery fixes are directly relevant. | Reuse with opId dependencies and current authority. |
| Same | `validateFinal`, `activeParticipant`, `astraToolResult` virtual-source/scope guards | ADAPT | Generic tool-prefix validation must retain action budgets and distinguish active actor from legitimate target. | Validate canonical virtual plan; preserve real recorded dice/HP authority. |
| Same | `astraExecute` naturalProjection/materialization orchestration, natural begin pin, purpose/effective-record loop | QUARANTINE | Second promotion path should not own ordinary fictional objects. | Route only new generic-pinned operations through one compiler. |
| Same | Duplicated promotion/replan/pruning glue | DELETE LATER | Generic plan and dependency filtering replace it. | Delete after compatibility and exact-once gates; never erase historical validators. |
| `src/lib/gameplay/astra-privacy-context.ts` | `curateAstraContextSource`, `astraContextHasPrivateEvidence`, `projectAstraPublicSource` selection/projection | KEEP | Actual selected evidence determines two-stage need; narrator excludes private semantics. | Preserve architectural boundary and fail-closed handling of unknown fields. |
| Same | Natural authoring allowlists/gating | ADAPT | New generic payloads need explicit public/private field classification. | Add mode-specific PublicText admission; do not merely whitelist a whole plan. |
| `src/lib/gameplay/astra-settlement.ts` | Existing settlement helpers, old `AstraEffectIntent` replay | KEEP | Shared deterministic settlement and old operation semantics are required. | Reuse as internal targets; keep old kind validators. |
| Same | New natural union / `AstraOrderedEffectsPlan` integration | QUARANTINE | Natural-purpose types should not become new generic prompt authority. | New schema-3 plan is separate/version-pinned, using shared internals. |
| `src/lib/gameplay/dm-store.ts` | `createRpcTurnStore` existing RPC/error/atomic checkpoint plumbing | KEEP | One TurnStore remains the persistence authority. | Preserve lease/fence/error semantics. |
| Same | Natural lookup/materialize/publication/begin payload additions | ADAPT | Atomic publication is useful; generic pin/payload should replace promotion RPCs. | Keep one versioned checkpoint/final API; no parallel journal. |
| Same | Purpose-specific materialization methods | QUARANTINE | Specialized RPC lifecycle is unnecessary. | Do not carry into target store. |
| `src/lib/gameplay/server-contracts.ts` | Private RuntimeSource/TurnClaim/TurnStore boundary, atomic publication/checkpoint concept | KEEP | Typed server-only authority and public/private separation remain. | Preserve current public DTOs. |
| Same | `AstraNaturalPublication`, optional checkpoint publication | ADAPT | Generalize dependency projection and versioned plan. | Generic publication/ref types with operation pin. |
| Same | NaturalState/origins/materialization store methods | QUARANTINE | Promotion-specific persistence should not spread through contracts. | Preserve branch only; target one generic IR. |
| `src/lib/persistence/contracts.ts` | Scene continuity/locale concept | ADAPT | Public continuity is useful without requiring new public schema. | Existing Scene title/body and explicit checkpoint projection. |
| Same | `Scene.public_continuity`, Storage `ground`, `location_id`, `locale_key` draft additions | QUARANTINE | They broaden minimal persistence and imply new placement authority. | No initial public schema additions; document ground-storage limitation. |
| `src/lib/progression/settlement-core.ts` | `settledItemTransfer` nullable recipient arithmetic | KEEP | Shared deterministic whole/split transfer arithmetic; no duplicate engine. | Caller still proves valid storage/destination/scope. |
| `src/lib/server/dm/astra-primary-provider.ts` | Structured-output and bounded diagnostic handling | KEEP | Provider errors must preserve actual boundary; no quality/semantic retry. | Preserve diagnostics and transport policy. |
| Same | `parseBaseDecision`, `parseDecision` independent narration and aliases; `narrate` continuity | ADAPT | Parse publication separately from optional operations; use generic refs. | Keep exact observable boundaries and public-safe narrator. |
| Same | Parser-coupled `materializeNaturalSubject` / natural grammar | QUARANTINE | Parsing must not become an object-promotion engine. | Move generic compilation after closed intent parsing. |
| `src/lib/server/dm/store.ts` | Global `natural-v1` option in `createTurnStore` | QUARANTINE | App configuration must not reinterpret existing operations. | Explicit generic-v1 pin for newly begun operations only, after owner activation. |
| `supabase/migrations/202610140052_astra_natural_play.sql` | Entire 1,092-line draft | QUARANTINE | Contains promotion constructors/public-schema additions and substantial runtime rewriting. | Do not integrate/apply as-is; replace with minimal generic authority proposal below. |
| Same | Lease/fence/ACL, atomic checkpoint/publication and lost-response principles | ADAPT | These invariants are worth retaining in a smaller implementation. | Reuse tests and authority shape, not a copy of the draft wrapper chain. |
| Same | Materialization/project/effective-ID helpers, insertion/revision suppression, deferred autosave, source-hash rebinding, encounter-specific patches | QUARANTINE | They solve promotion-pipeline problems and complicate source/revision/save semantics. | No temporary public inserts, source substitution or per-scenario SQL in target. |

The inherited `src/lib/gameplay/astra-fiction-authority.ts` change belongs to the starting commit, not the checkpoint diff. **KEEP** its explicit authoritative-but-not-exhaustive rule. Reword only the new target prompt's state-operation vocabulary when implementation is authorized.

### Remaining checkpoint files and evidence

| Files | Classification | Treatment |
| --- | --- | --- |
| `tests/astra-natural-promotion-db.test.mjs` | ADAPT | Retain lease/fence, rollback, ACL, exact-once, source-preservation and lost-response assertions; replace purpose-promotion fixture grammar. |
| `tests/helpers/natural-play-fixture.mjs` | ADAPT | Reuse disposable campaign/time/isolation helpers; no owner data. |
| `tests/natural-play-acceptance.test.mjs` | ADAPT | Reuse natural actions and exact-state assertions against one generic compiler. |
| `tests/natural-play-continuity.test.mjs` | KEEP | Public names, callbacks, Memory races and selection bounds. |
| `tests/natural-play-effective.test.mjs` | ADAPT | Generalize dependency/identity/group tests; no purpose-based record pruning. |
| `tests/natural-play-live-harness.test.mjs` | KEEP | Bounded diagnostics, request/spend limits and secret-free capture. |
| `tests/natural-play-provider.test.mjs` | ADAPT | Preserve private-boundary/contract assertions; replace natural schema samples. |
| `tests/natural-play-routing.test.mjs` | KEEP | Old-operation pinning, isolation and recovery invariants; add generic pin later. |
| `scripts/natural-play-live-smoke.mjs` | ADAPT | Harness-only use of future approved generic contract; no paid run now. |
| `scripts/natural-play-soak.mjs` | ADAPT | Keep production-path fake-provider long-run measurement and exact state. |
| `NATURAL_PLAY_CONTRACTS.md`, `NATURAL_PLAY_EXHAUSTIVE_CLOSURE.md` | QUARANTINE | Preserved WIP design/evidence, not approved target architecture. |
| Checkpoint changes in `DEV_STATUS.md` | KEEP | Historical checkpoint status stays unchanged. This task adds only this proposal. |

No Gallery, paper-doll or failed-turn UI production fix was present in this checkpoint's changed-file list. Do not claim those areas were completed by this report.

## 8. Migration 52 decision and exact minimum SQL need

**Decision: reject wholesale adoption of the current draft; partially reuse its invariants/tests; design a much smaller replacement only after owner review. Do not alter the draft now.**

Existing turn/checkpoint/effect storage is sufficient for receipts, canonical generic operations, ref mappings, tool prefixes and final publication. It is insufficient for safely distinguishing new generic authoring semantics at begin and independently authorizing new record construction at commit. Migration 51 permits only `astra_response_contract = unified-v1`; its two response modes describe privacy, not state-operation schema. Reusing either field to mean generic-v1 would silently change old turns.

Proposed minimum Migration-52 surface:

1. One nullable private `rpg_private.turns.astra_state_contract` text column, constrained to null or `generic-v1`. Pin it server-side in the same begin transaction as literal input/runtime/response contract. Null/missing means the operation's existing legacy semantics. No backfill and no immutable manifest rewrite.
2. Reuse existing `astra_ordered_effects`/checkpoint storage for schema-3 plan and a pinned generic tool prefix/final/publication. Append-only prefix and final pins reject changed replay. No new receipt table or ledger.
3. One generic private reconstruction/validation entry point (with small pure private helpers if required for shared arithmetic). It handles the six closed families, scoped ref manifest, group/dependency closure, current revisions, proof/rule checks and exact publication dependency result. It must independently compute allowed changes rather than bless server-submitted JSON.
4. One narrow `public.rpg_runtime` wrapper branch for generic begin, tool-prefix/receipt, checkpoint and commit; non-generic operations delegate through the unchanged legacy chain. Existing `runtime_change` remains the atomic business persistence path. Shared guard factoring must not bypass Migration-35–51 checks for old operations.
5. Preserve public-only RPC permissions: new wrapper service-role only; renamed predecessor explicitly revoked from public, anon, authenticated **and service_role**; internal SECURITY DEFINER delegation retained. No public access to private plan or state-contract mutation.
6. Verify existing save/fork/load capture of private turns includes the new nullable field and canonical plan. Old JSON manifests omit it naturally. If an explicit restore column list exists, add only that compatibility adapter; do not rewrite historical snapshots.

Not needed in the initial replacement: new public tables/columns, `public_continuity`, ground-storage anchors, separate natural origins, promotion RPCs, one constructor per scenario, temporary public record insertion, original-source hash rebinding, revision-trigger suppression, deferred autosave machinery, Foundation authoring or another migration numbered 53.

The replacement cannot be described honestly as “just permit arbitrary changes”: the current final/tool guards restrict record origins and allowed changes. Independent generic reconstruction is essential work. If that cannot fit one additive Migration 52 without destructive rewrites or bypassing old guards, stop at the newly proven boundary and request review rather than expand authority.

## 9. Worked examples using the same contract

All names and state below are synthetic. JSON samples are proposed model output, not real provider evidence. Each `known` or proof handle is issued by the server for this operation. Independent text avoids claiming a mutation succeeded; dependent beats carry durable consequences.

### A. Mill and miller: first fiction, then useful tracking

First final, no records required:

```json
{
  "type": "final",
  "toolRequest": null,
  "final": {
    "publicNarration": {
      "beats": [{"text":"The mill wheel knocks unevenly. A flour-dusted man looks up. ‘Hobb. What brings you here?’","requiresOperations":[]}],
      "visualDescription": {"text":"A dim timber mill beside a narrow stream.","requiresOperations":[]},
      "sceneLocale": {"label":"Village Mill","requiresOperations":[]}
    },
    "genericOperations": [],
    "privatePatches": [],
    "publicBehavior": []
  }
}
```

Compiler: no changes, same world clock, existing tracked parent Location, new narration Scene titled Village Mill. Validation: public fiction does not contradict current Canon/location; no state identity lookup is required. Commit: Scene only, with normal turn receipt. Next turn's recent Scenes retain Hobb's name even without an Entity. Retry returns that Scene, not another Scene or NPC.

Later, the player accepts a recurring delivery job. The same final shape may contain this operation array and corresponding dependent beats:

```json
[
  {"opId":"miller","requiresOperations":[],"atomicGroup":"agreement","kind":"entity.upsert","target":null,"name":{"source":"inline","text":"Hobb"},"description":{"source":"inline","text":"The flour-dusted miller who offered the delivery."},"profile":null,"present":true},
  {"opId":"delivery-job","requiresOperations":["miller"],"atomicGroup":"agreement","kind":"quest.mutate","mutation":{"action":"create","title":{"source":"inline","text":"Deliver Hobb's flour"},"description":{"source":"inline","text":"Take the agreed sacks to the bakery."},"issuer":{"source":"local","key":"miller"},"reward":null,"basis":{"source":"public-evidence","key":"accepted-delivery"}}}
]
```

Compiler derives both IDs, creates an ordinary NPC and open Quest using existing tables, sets only legitimate presence, and leaves Foundation frozen. SQL verifies public acceptance and exact fields/groups/IDs. No job is created merely for an offer. Rejecting the job rolls back this grouped identity creation too; unrelated conversation still commits. A separate `location.upsert` is used only if tracking the mill on Map is useful, never because it was mentioned. Replay derives the same IDs and returns the committed result.

### B. Trade: negotiated agreement becomes conserved deltas

Fixture: hero and baker are present; baker owns one unequipped bread Item in real storage; hero has 3 silver; baker has a real wallet. Dialogue establishes a price of 2 silver. The public final includes an independent beat such as “The baker waits with the loaf on the counter,” and an exchange beat depending on both operations:

```json
[
  {"opId":"payment","requiresOperations":[],"atomicGroup":"bread-sale","kind":"resource.adjust","mutation":{"action":"transfer","from":{"source":"known","key":"hero"},"to":{"source":"known","key":"baker"},"currency":{"existing":"silver","publicName":null},"amount":2,"basis":{"source":"public-evidence","key":"agreed-bread-price"}}},
  {"opId":"bread","requiresOperations":["payment"],"atomicGroup":"bread-sale","kind":"item.mutate","mutation":{"action":"transfer","target":{"source":"known","key":"bread-stock"},"quantity":1,"recipient":{"source":"known","key":"hero"},"storage":null,"basis":{"source":"public-evidence","key":"agreed-bread-price"}}}
]
```

Compiler uses shared transfer helpers: hero silver becomes 1, baker silver increases by 2, bread changes owner/storage with conserved quantity and original revisions. SQL reconstructs both balances and Item transfer, consent/evidence scope and atomic group. If stock or funds are insufficient, **neither side moves**, and only independent dialogue remains. No agreement means zero operations. Selling a sword reverses payment/ownership under existing item/equipment policy; it does not create a new sale handler. Retry/save/load replay pays once because the fenced committed turn is the receipt.

For an informal earned reward, `resource.adjust`/Item create can compile through existing bounded mundane-grant policy from public evidence. For a stored structured job, `quest.mutate claim` uses stored terms and reward_operation_id. Do not create a Quest to make an informal reward payable, or a World Event to serve as a post-takeover receipt.

### C. Combat: generic identity plus recorded tools and HP consequences

Fixture supplies a server-approved small-creature profile. A rat may already be described in the Scene without a row. A tool decision can carry a generic identity prefix:

```json
{
  "type":"tool",
  "toolRequest":{
    "operations":[{"opId":"rat","requiresOperations":[],"atomicGroup":null,"kind":"entity.upsert","target":null,"name":{"source":"inline","text":"Cellar rat"},"description":{"source":"inline","text":"The rat beside the spilled grain."},"profile":"small-creature-profile","present":true}],
    "call":{"kind":"attack","actor":{"source":"known","key":"hero"},"target":{"source":"local","key":"rat"},"item":{"source":"known","key":"sword"},"dc":null,"scope":null}
  },
  "final":null
}
```

Compiler validates/pins the generic prefix and virtual actor. Server tools record attack, then damage if authorized, under durable positions 0/1. Defense, modifiers, dice and totals come from the existing profile/tools. A final repeats the prefix and appends an HP delta with `basis: {source: "tool", key: "damage-result-1"}`. Its amount must equal the legal recorded damage/clamped HP effect; SQL checks tool chain, target, receipt use and action costs. Existing rule helpers derive required participant/defeat effects; the model cannot declare death or create a bonus.

Commit creates the useful tracked actor and changes HP/participant state once, along with only supported outcome beats. No provisional row exists if the turn fails before commit. An enemy attack uses the same tools and `resource.adjust` on the hero. Missing profile or invalid damage rejects the unsupported tool/operation; independent confrontation remains possible. Replay returns the same dice and IDs. It never rerolls to obtain a different result.

### D. Long rest: generic effects, existing configured rules

Fixture: safe public permission is established, no encounter, hero HP 6/10, eligible food exists, and current profile exposes a bounded long-rest rule handle. Illustrative final operations:

```json
[
  {"opId":"provisions","requiresOperations":[],"atomicGroup":"overnight","kind":"item.mutate","mutation":{"action":"consume","target":{"source":"known","key":"rest-food"},"quantity":1,"basis":{"source":"rule","key":"long-rest-rule"}}},
  {"opId":"overnight-time","requiresOperations":["provisions"],"atomicGroup":"overnight","kind":"time.advance","minutes":null,"basis":{"source":"rule","key":"long-rest-rule"}},
  {"opId":"recovery","requiresOperations":["provisions","overnight-time"],"atomicGroup":"overnight","kind":"resource.adjust","mutation":{"action":"delta","actor":{"source":"known","key":"hero"},"resource":{"kind":"hp"},"amount":4,"basis":{"source":"rule","key":"long-rest-rule"}}}
]
```

Compiler resolves the rule **once**, reusing existing rest/provision/safety helpers, then verifies the proposed pieces match its supply/time/recovery outcome. Rest IDs, any rest records and computed duration are server-generated. The canonical group may include helper-derived changes not authored as arbitrary model record patches. SQL independently computes the same group; no duplicate time advance or recovery is allowed.

The rule handle is bound to this operation's actor, current Location, profile and public safety evidence under the existing rest-safety policy. It is not a permanent `safeLocationIds` write and not permission to assume any location is safe. Existing operation-scoped rest-safety adjudication must remain available through that bounded capability; absence of a permanent safe-location entry alone must not erase public permission. Invalid safety, no supplies or an active encounter still prevents configured recovery.

Independent beat: “You settle into the loft while the mill quiets below.” Recovery beat depends on all three operations. If provisions/safety are invalid, the formal group is rejected together and the fiction must not claim full healing, spent supplies or completed formal rest. Missing a specialized helper does not block lying down, quiet dialogue or a separately valid ordinary time advance; it only prevents unsupported recovery being persisted/narrated. Retry returns the same rest/consumption result and no second overnight advance.

## 10. Compatibility and rollout boundaries

| Existing object / operation | Required behavior |
| --- | --- |
| Historical/committed/cancelled turns | Preserve input, runtime, response contract/mode, final, narration, receipts and effect versions exactly. No rewriting. |
| Pending/generating/awaiting/failed retryable operation | Resume the contract pinned at begin. Null generic state contract never becomes generic because application configuration changed. |
| Migration-51 unified operation | Keep its public-unified/private-informed routing. State vocabulary remains old unless its own generic pin was present at begin. |
| Current schema-1 settlement/effects and schema-2 ordered effects | Retain original constructors, validators, SQL reconstruction and exact-once reward behavior for replay. |
| Old saves/manifests (Migrations 1–51) | Missing/null new field means existing semantics. No NOT NULL backfill or immutable manifest rewrite. |
| New save/fork/load | Capture generic plan/prefix/final and pin through existing private turn capture. Fork boundaries and stale timeline checks remain current authority. |
| Owner campaign / frozen World | No conversion, authoring, data repair or activation in this task. Standard post-takeover records remain live; old World history remains reference. |
| Legacy World Logic / What-If / World Lab | Existing ruleset/takeover routing retained. Detached simulation never becomes live ordinary-play authority. New standard Locations/actors require coherent deterministic saved-state projection, not World Event dual writes. |
| Manual corrections / Canon / Character Models | Corrections outrank generated history. Private Character Model knowledge/identity/evidence rules remain separate. |

Runtime identity stays `astra-primary-v1`; response contract stays `unified-v1`; privacy modes stay the two Migration-51 modes. The proposed nullable **state contract** distinguishes generic mutation semantics. This is versioning of one DM runtime, not a second runtime or orchestration engine.

“DELETE LATER” never authorizes deletion of old settlement/schema validators needed to resume historical operations. It applies to new-path duplicate promotion glue after a tested generic replacement, with old-version support preserved.

## 11. Maximum three implementation commits — proposal only

| Commit | Work | Required gate |
| --- | --- | --- |
| 1 — Contract and compiler | Closed generic schema; known/local refs; PublicText provenance; per-op admission; group/dependency evaluation; one virtual compiler to existing change/settlement/mechanics helpers. No UI or global activation. | Focused pure compiler/provider-schema/privacy tests; narration-only; invalid op retains independent beat; transfer/group conservation; tool profile/receipt proofs. New path not activated before persistence gate. |
| 2 — Persistence and compatibility | Small replacement Migration 52 only if still required as described; begin pin; canonical plan/tool-prefix/final pin; independent SQL reconstruction; unchanged legacy delegation; save/fork/load/old-manifest recovery. | Clean and populated 51→52 disposable upgrades, source/revision/ACL regression, forced rollback, replay/lost-response, old/new save routing, cross-campaign isolation. Stop if safe scope needs another migration. |
| 3 — Prompt, continuity and acceptance | Concise freedom guidance, Scene-title locale, selected continuity/Memory race fixes, enum bridge, the shared acceptance sequence/soak. Apply reviewed source-of-truth amendments only with implementation authorization. | Full suite, typecheck, zero-warning lint and build; bounded synthetic live gate only after separate explicit approval. Owner review before any owner DB/application activation. |

No commit is organized around miller, merchant, rat, companion, stick, bread or an individual player verb. No proposed UI redesign, new service, agent or backend.

## 12. Acceptance matrix: one machinery, sixteen situations

Run this as one sequential fake-provider production-path campaign, asserting exact authoritative state after each step. The same schema/compiler/SQL branch handles every row.

| # | Situation | Contract use | Mandatory assertion |
| --- | --- | --- | --- |
| 1 | Invent a plausible mill | Narration + locale; zero ops | Scene commits; no Entity/Location/Quest required; current Map Location unchanged. |
| 2 | Speak again to Hobb | Recent public Scene continuity; zero ops | Same learned name/person; no compulsory row or transcript replay. |
| 3 | Track the recurring miller | `entity.upsert` with stable ref | One bounded public NPC, no World Actor/Event or new private Character Model. |
| 4 | Accept an actual job | `quest.mutate create` | Open objective with real acceptance; an unaccepted offer creates none. |
| 5 | Buy bread | Resource transfer + Item transfer, same group | Both balances and ownership change, or neither; no merchant-specific handler. |
| 6 | Give an Item | `item.mutate transfer` | Quantity conserved, recipient real/present/authorized, no ownership by prose. |
| 7 | Pick up an ordinary stick | `item.mutate create` | One mundane empty-mechanics Item in real carried storage; no invented weapon powers. |
| 8 | Attack a rat | Generic NPC prefix, existing profile, attack/damage tools, HP delta | Durable server dice; no provisional public rows; no model damage/defeat authority. |
| 9 | Take damage | Same attack/damage tools + HP delta | Real player HP loss supported by exact receipts; action/reaction limits retained. |
| 10 | Rest | Generic consume/time/recovery group using existing rule | Exact supplies/HP/time/rest state; missing supply rejects group but independent scene survives. |
| 11 | Return to mill | Public continuity; tracked travel only if needed | Hobb/callback preserved, no mandatory mill Location; actual tracked travel advances time. |
| 12 | Save/load | Existing saves/timelines | Old and generic contracts/receipts/identities preserved; no detached simulation leakage. |
| 13 | Retry/replay/lost response | Same operation/ref/receipt identities | No duplicate Entity/Item/Quest/payment/Scene, no new dice. |
| 14 | Private-informed refusal | Selected secret → private adjudication → public-safe narrator + enums | Narrator gets no private text; literal and paraphrased secret never reach client via operations or prose. |
| 15 | Another campaign | Same operations with scoped handles/IDs | No Memory/Craft/state/receipt/ref leakage; foreign refs rejected without existence disclosure. |
| 16 | Strange creative free-form action | Narration only | Zero operations commits naturally, with no bespoke handler or unsupported marker. |

Additional negative assertions: stale fence/revision and altered final conflict atomically; unknown/extra fields cannot write; reciprocal-group failure pays nothing; operation-dependent visual description is filtered; a rejected optional Item does not erase unrelated job/dialogue; private-informed inline descriptions cannot launder secrets; profile-less actor cannot acquire invented HP; generic mutation cannot author Foundation/World Events; old saves retain old operation meaning.

### Extended acceptance and paid gate proposal

- **30-turn real-play review:** the owner types all actions. Mix quiet scenes, creative mundane actions, recurring strangers, negotiation, a small reward, one real tracked transition, combat/rest where desired and old callbacks. Measure continuity, agency, prose, response latency and state correctness. Record failures without silently playing/retrying on the owner's behalf. Readiness is not a claim that all 30 turns are already tested.
- **At least 200 fake-provider turns:** through the production compiler and disposable DB, with exact final state. Include multiple campaigns, Memory maintenance races, full/empty resources, rejected groups, save/load/fork, failed providers before/after tools, checkpoint lost responses, private mode and schema-1/2 replay. Assert no duplicate rewards/dice, no context correctness cliff and no partial public/provisional state.
- **Future synthetic live gate, requiring new explicit authorization:** default tier; Astra High planner/unified and Astra Medium only for private-informed public narration. Maximum **10 paid text requests and US $5 total**, no media, no quality retry. Reserve conservatively before dispatch; if a request's worst-case estimate/remaining allowance cannot fit, stop. This report grants no provider authorization and makes no fresh pricing claim.
- Suggested live allocation within that ceiling: three public narration/effect scenarios (3 requests), one tool→final scenario (2), one private refusal (2), one continuity return (1); at most two remaining requests for necessary tool continuation. Requests, not turns, consume the cap. Stop on systemic schema/parse failure, uncertain dispatch or budget uncertainty. Do not extend the budget to obtain a pleasing answer.
- Measure each paid response: actual model/tier, response/parse status, latency, request bytes, input/output/cached/reasoning tokens where reported, estimated spend and whether narration was a second call. Assert public-only no-tool turns use one response and unrelated secrets do not force two stages.
- Future implementation signoff requires focused generic/compiler/privacy/dice/settlement/rest/save/migration tests, complete repository suite, TypeScript, zero-warning lint and production build. Passing the current checkpoint's tests does not verify this proposed replacement.

## 13. Exact proposed source-of-truth wording — not applied

### MASTER_SPEC.md — add within AI runtime / state-authority architecture

> Astra is the campaign's primary DM. Console supplies authoritative structured state, long-term Memory, Canon/corrections, saves/timelines, deterministic dice/tools, validation and UI.
>
> 1. Structured state is authoritative, not exhaustive.
> 2. Missing structured records never block plausible, non-contradictory fiction.
> 3. Ordinary player actions never require bespoke handlers for each fictional verb or object.
> 4. Console validates durable state mutations and system invariants, not fictional possibility. Astra adjudicates fiction subject to established state, Canon, owner corrections and campaign rules.
> 5. Independent narration survives rejected optional state operations. Narration dependent on a rejected mutation must be omitted or regenerated from public-safe accepted outcomes; it must never falsely claim that mutation completed.
> 6. Do not add one gameplay subsystem per verb, NPC type, place type, merchant type or fictional object. Use a small closed generic operation vocabulary compiled into existing authorities.
>
> Narration-only turns are supported. No structured record is required merely to name, describe, converse with or revisit something in fiction. Only durable consequences need typed operations. Model output never has raw SQL, arbitrary record-patch or unrestricted mechanics authority. Deterministic dice, exact-once replay, atomic persistence, campaign/timeline fences, manual-correction precedence and DM-private/public generation boundaries remain mandatory. Selected secret-bearing evidence requires a separate public-safe narration context; unrelated private state does not force every turn into that mode.

### AGENTS.md — add within AI runtime / scope discipline

> Preserve these ordinary-play invariants:
>
> - Structured state is authoritative, not exhaustive.
> - Missing structured records never block plausible, non-contradictory fiction.
> - Ordinary actions never require bespoke handlers.
> - Console validates durable state and system invariants, not fictional possibility.
> - Independent narration survives rejected optional state operations; dependent success claims must be filtered.
> - Do not add one gameplay subsystem per verb, NPC type, place type, merchant type or fictional object.
>
> Astra owns fictional adjudication. Compile optional durable consequences through a small closed typed operation vocabulary and existing persistence/rule authorities. Reuse shared deterministic helpers. Never give the model raw table/column patches, SQL, model-selected persistence IDs or arbitrary mechanical effects. Preserve per-operation contract pins, old save/turn semantics, server-owned dice, owner/campaign/timeline fences, exact-once atomic commits and the selected-evidence private/public generation boundary. A missing mechanics adapter may reject an unsupported durable effect; it must not make independent fiction invalid.

Neither source file was edited. This wording is a proposal for owner review, not a change to source priority or permission to implement.

## 14. Verification and remaining decisions

This task performed Git ancestry/path/diff checks, code/SQL review and documentation checks only. It ran **no application tests, disposable migrations, owner DB queries, provider requests or media requests**. The existing checkpoint's test/soak evidence stays historical; its final post-atomic full-suite run was stopped under the earlier stop directive and is not represented as a completed new gate.

Remaining design limitations requiring honest implementation tests:

1. Independent SQL reconstruction of a virtual new actor/tool target must retain every relevant older guard; the current draft workaround is not accepted.
2. Six families intentionally omit new relationship/condition authoring and persistent ground placement. Existing mechanics and public fiction continue; no invented authority fills those gaps.
3. Private-informed public record creation is restricted to public-evidence text. A later broader authoring bridge would require separate security review.
4. Generic acceptance requires real configured combat/rest/currency capabilities. Their absence cannot justify invented powers, money, recovery or completed durable success.
5. World Lab projection of newly tracked standard actors/Locations must remain coherent at a saved takeover boundary without reviving World authoring.
6. Narrative plausibility is adjudicated by Astra and owner corrections; deterministic code cannot prove all fictional claims. The compiler proves bounded durable legality, scope, receipts and atomicity.

**Decision requested:** approve or revise this six-family contract, optional-operation/group filtering, minimal Migration-52 replacement and three-commit plan. Implementation, owner migration and activation remain unauthorized by this report.

ARCHITECTURE REFRAME READY FOR OWNER REVIEW
