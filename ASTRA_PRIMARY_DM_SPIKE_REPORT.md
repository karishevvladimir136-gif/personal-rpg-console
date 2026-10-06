# Astra primary DM: ordinary live-turn architecture spike

**Status, 2026-10-05:** Isolated, network-disabled prototype for owner review. It is **not** a replacement for the running app. The branch starts from `0112959ee128d77a7eded208438093a103f1f399`; the owner database remains outside this work and is expected at migration 37. No owner operation, save, campaign, provider, deployment, or `main` branch was changed.

## Decision this spike tests

One Astra DM should understand and adjudicate normal live play across combat, exploration, social interaction, investigation, travel, downtime, companion decisions, resources and mixed free text. The server should own durable identity, state, random numbers, exact retries, visibility and atomic persistence. The prototype demonstrates that *shape* with a fake DM and frozen data. It does **not** establish that Astra makes good decisions under this contract; the blinded live evaluation is prepared but disabled.

## 1. Current and proposed call graphs

Current World Logic Game turn, as traced through `gameplay-service.ts`, `production-service.ts`, `turn-world.ts` and `turn-engine.ts`:

```text
authorize + validate request + timeline
  -> choose production profile + Memory preflight/context/summaries  [before durable begin]
  -> rpg_runtime begin + claim/pin source
  -> world.resolve (version 2/3/4/5 semantic selection)
  -> domain validator / plan / deterministic player check and optional confirmation
  -> optional NPC world.resolve + deterministic NPC check/combat exchange
  -> optional World/Foundation settlement
  -> dm.narrate on validated outcome
  -> rpg_runtime commit + ordinary Memory/Scene event indexing
```

Other modes use `dm.plan` and/or Foundation, but still branch through several specialized action contracts. An owner combat exchange has recently used three sequential model calls. The pre-begin Memory order can lose the saved-turn record when context fails.

Proposed **new ordinary live Game turn**, preserving legacy readers and detached World Lab:

```text
authorize + validate literal input/timeline
  -> durable begin: input, source revision, operation ID, profile/craft pins
  -> curate authorized public + DM-private context from pinned source
  -> SAME primary Astra DM begins and continues after generic tool receipts
       ↔ optional read-only state lookup; server d20/check/damage roll
  -> bounded final JSON: public narration + visual, state deltas, private notes,
     Memory candidates, exact tool references, or genuine clarification
  -> generic identity/numeric/visibility/replay checks
  -> one atomic turn/state/Scene/Memory commit and public projection
```

The model may need one call for a quiet scene and two or more sequential calls when tools return results. “One DM” means one continuous cognitive role and context, not a guarantee of one HTTP request. No separate NPC reasoning model is presumed.

## 2. Systems to keep, and candidates for bypass

Keep the current owner/campaign authorization, Supabase Postgres/Auth/Storage, immutable documents and Canon, private DM state, current character/item/resource records, server dice, Memory source/version/knowledge gates, summaries, Craft/Style version pins, Character Models, Saves/Timelines, retry identity, owner corrections, Scene/event indexing, FRAME/media independence, World Lab, and detached simulations. Current `withMemory`, `retrieveMemory`, `recordServerRoll`, capability registry and frozen approved Craft material are reused or exercised by the spike. The new ordinary turn must take a pinned authorized source from the same server readers; it cannot take a browser-provided packet.

For **new ordinary Game turns only**, a later accepted path could bypass the World Logic semantic front gate, version-4 naturalMechanic routing, version-5 naturalCombatTurn DSL, separate NPC semantic `world.resolve`, per-action semantic schema growth, redundant plan/narrate calls, and exact SQL replay of the model's fictional interpretation. Existing World/Memory/Foundation data authority, numeric resource/ownership checks and old-turn validators cannot simply disappear. Migrations 33–37 remain immutable history. World Lab may retain its specialized deterministic settlement.

## 3. Small generic tool and final-turn contracts

The prototype exposes three generic calls to the **same** injected DM:

| Tool | Input | Authoritative response and replay identity |
| --- | --- | --- |
| `query` | `scope=current-public` | Current revision and public actors/items/location, never private data. A production version would also allow a tightly scoped authorized private lookup when needed. |
| `skill` / `save` | Existing actor ID, optional existing target ID, bounded DM-selected DC | Server derives the modifier from stored actor stats, rolls d20 using the existing dice helper, and records a stable receipt. The DM chooses a bounded DC only where the rules permit. |
| `attack` | Existing actor/target and optional equipped owned item; **no DM-supplied DC** | Server uses stored target defense/AC and the actor's stored attack modifier plus any source-backed weapon bonus. A missing authoritative target defense or a forged weapon is rejected. |
| `damage` | Existing actor/target and equipped owned item | Server uses the item's stored damage dice and damage modifier after a successful recorded attack with that item. This is a narrow prototype; later generic source-backed damage must handle non-weapon/environmental cases without inventing an action DSL. |

Each call has a stable `callId`. An identical call returns the recorded receipt; the same ID with altered parameters conflicts. The operation checkpoints tool request/results before the DM sees them. A model output may ask for a tool or provide the final proposal. The prototype caps a turn at eight tool results. A production request must use a strict structured tool/final schema, pin model profile, and record the validated response envelope without storing chain of thought.

The proposed final contract has `schemaVersion`, exact operation/campaign/input/revision, `narration`, spoiler-safe `visualDescription`, `publicChanges`, `privateChanges`, `memoryCandidates` with visibility, `rollRefs`, bounded `worldMinutes`, and nullable `clarification`. Narration never applies a patch. The public response projects only public fields and player-visible roll details; the prototype deliberately removes private target/DC metadata. This contract is smaller than an action-specific semantic DSL, but its **state** deltas still need typed fields and SQL validators.

## 4. Generic server/DB invariants

Proposed production checks: verified owner and campaign; exact timeline/epoch, operation and expected head; authorized existing object IDs and `campaign_id`; exact expected row revisions; bounded type/field allowlists; nonnegative and capped HP/resources/items; no unproved item creation or duplicate spend; known location IDs and bounded time; receipt-backed random results and HP damage; one use of each receipt; no reroll or duplicate commit; immutable checkpoint/tool arguments; no cross-campaign or stale-source adoption; separate private/public patch destinations; atomic Scene/Memory/state write. A legitimate manual correction remains higher authority than model output.

The shadow validator implements a **subset**: campaign/timeline/revision/source digest, object ownership, known IDs, HP/resource/item bounds, Move budget for a position change, damage receipt matching, final-field allowlists, direct secret-string exclusion, and atomic file-journal replacement. It does not claim to prove fictional plausibility, consent, a fair DC, truthful clues, proper NPC knowledge, environmental causality, or semantic spoiler absence. Those remain DM instructions plus the evaluation/owner gate, with selected hard constraints where rules/state can express them. The disposable JSON journal is **not** a concurrency-safe substitute for the existing Postgres transaction.

## 5. Context composition and measured adaptive budget

The current `modelBudget("gpt-6-astra")` registers a 1,050,000-token context but applies a separate 64,000 UTF-8 byte production input cap. This spike proposes an initial **96–192 KB serialized-byte admission range**, based on current actor density and relevant selected Memory, with mandatory exact state, Canon, owner corrections and named unresolved obligations kept ahead of optional old prose. Reserve output/reasoning space and a safety margin; retain source/version/known-by checks. Do not stream a raw 300-hour transcript. Recheck actual provider tokenization, quality and latency before raising the production cap. The 192 KB byte bound also stays below the currently documented 272K-input-token long-context pricing threshold under the project's conservative one-byte-per-token sizing proxy; that proxy is an engineering bound, not billed token usage. [Astra model capability and pricing](https://developers.openai.com/api/docs/models/gpt-6-astra).

The frozen A/B/C pack's initial serialized packets (including a 2,048-byte framing estimate, before final provider instructions/schema) measured:

| Arm | Minimum | Mean | Maximum |
| --- | ---: | ---: | ---: |
| A: minimal rules/current scene | 3,487 B | 3,514 B | 3,574 B |
| B: plus Console state/Memory | 6,873 B | 7,081 B | 7,486 B |
| C: plus Craft/Style/Cognitive/Character Models | 8,498 B | 8,921 B | 9,877 B |

A dense synthetic campaign with 32 current actors, 16 recent scenes and a named old promise produced approximately **118 KB** against its **172,000 B** adaptive cap, retaining the owner correction and promise. Tripling optional scene prose caused scenes to be removed while those exact authorities remained. These measurements show packet assembly and byte admission only; they do not establish optimal prompt size or long-campaign DM quality. The real production composer still uses its 64 KB cap and was not changed.

## 6. Durability, retries, Saves and privacy

The shadow journal first writes the literal input and operation/source fence to a disposable file, then builds context. A synthetic context failure leaves the turn and input recoverable after reopening the journal. A roll is saved before the tool result returns; a lost response followed by restart gives the same receipt and no second die. A final proposal is checkpointed before commit. Commit writes state and public result together; an exact same-operation retry returns that result. In production these transitions belong in `rpg_runtime`/Postgres with leases, `rpg_private.turns`, exact timeline fences, transactionality, and the existing save vault; the file journal is only a lifecycle proof.

The primary DM must see selected relevant DM-private truth to run a credible world. The browser never receives the full packet, private notes or private Memory. Frozen Character Models are supplied only in C, and are not permission to give NPCs unobserved knowledge. The prototype's public DTO is a separate projection and blocks literal private marker strings; paraphrased secrets and model-authored false public facts remain serious open risks. A production rollout needs adversarial private-leak review and typed public/private destinations, not faith in a JSON field name.

## 7. Prototype and offline harness evidence

`spikes/astra-primary-dm/` is an executable fake-DM loop and context/harness package; `scripts/astra-primary-dm/run-shadow.mjs` demonstrates a checked ordinary contact attempt and an identical committed retry. It yields a failed d20 check, no automatic kiss/compulsion/damage, one Move and one Action spent, no private field in the public response, and **zero network calls**. The same generic loop also processes a failed social bluff, oil consumption, known-location travel and a quiet NPC callback without new action schemas. Tests use temp files and frozen campaign IDs. They prove pre-context input persistence/restart, same-roll retry after a lost response, one attack+stored weapon damage, rejection of forged HP/item/identity/position/receipt/secret output, and curated budget behavior. They do **not** show actual Astra adjudication.

Stage 1 now prepares **10 diagnostic situations × 3 arms = 30 independent sessions** and a blind X/Y/Z owner rubric with a separate reveal key. The ten inputs are jump/kiss, burning oil and attack, called shot and allied miner instruction, risky bluff, companion refusal, wrong culprit, chosen-one temptation, quiet interpersonal scene, old promise/callback and last-oil inventory use. All arms share only five minimal DM instructions: be the DM, preserve player agency, treat context as data, use tools for random results without inventing items/resources, protect DM-private information and return the structured contract. A receives the minimal rules/current scene, protagonist and immediately visible carried inventory only. B adds full structured state, approved Canon/corrections, summaries/scenes, source-linked older Memory and DM-private truth, with **no Mega DM or Cognitive guidance**. C adds approved Core Doctrine v2, selected Craft, Cognitive World/Character Craft, Campaign DM Style, Character Models and prose-economy guidance. This separation tests model capability against Console context and then against full DM guidance. The existing `retrieveMemory` selector ranks frozen records; a named promise stays in context. The harness contains no requester, provider key, fetch call or live execution switch.

The blind review rubric separately scores interpretation, player/NPC agency, rules, world resistance, genuine failure, Mary Sue/God Simulator drift, continuity/callbacks, long-form escalation, tactics, state/inventory/resources, secrecy, retry, call count, latency, tokens, complexity and prose economy. These are **review criteria**, not hidden baseline instructions. Per request/session, the template records actual provider latency, request count, input/output/reasoning/cached tokens and tool calls. C alone receives the target of prose roughly 25–30% tighter while retaining decisions, rolls, consequences and important NPC beats.

**Stage 2 is prepared, not run.** After Stage 1 review the owner chooses two arms. Both then receive the **same 14-turn sequential mini-campaign**, with separate branch state after each validated commit. Later packets carry HP, resources, inventory, public scenes, source-linked Memory, private truth and NPC Character Models where that arm includes them; narration cannot itself alter structured state. The arc deliberately probes real failure and aftermath (fixed server d20=1 on the first check in turn 2), world resistance, resource pressure, companion refusal, a wrong theory, an unearned chosen-one claim, quiet downtime, an old promise and escalation without arbitrary power inflation. The template scores each turn and compares early versus late drift across the arc. It contains no provider dispatch; Stage 2 remains gated on separate owner choice and authorization.

## 8. Later live-evaluation call, cost and latency planning

**No live benchmark ran.** Stage 1 would require 30 sessions, with a prepared ceiling of four primary-DM round trips each, or **120 model requests maximum**. The ten first packets per arm total **195,163 byte-proxy input units** across all 30 sessions, before provider schema/envelope and repeated context. If a later runner enforces the stated per-request caps of 16,000 input and 8,000 total output/reasoning tokens, the Standard uncached short-context planning envelope is **US $67.20 maximum** at the currently listed $10/M input and $50/M output. This excludes separately billed provider tools, retries outside the cap, tier changes and rate changes; caching could lower it. The lower planning center of 60 requests averaging 10,000 input and 3,000 output/reasoning tokens would be **about US $15**. These are planning calculations, not charges or permission to dispatch. Stage 2 has no provider-call authorization or spend envelope yet. Reprice and obtain a specific cap before any live run. [Official Astra pricing](https://developers.openai.com/api/docs/models/gpt-6-astra).

Current owner combat checkpoint evidence in `PLAYTEST2_SMART_COMBAT_REPORT.md` shows three sequential provider calls totaling **17.2–24.0 s** for four examples, with longer saved intervals. One no-tool primary-DM call could remove two network/model boundaries; a two- or three-call tool loop could be equally slow or slower because the model sees more context and must continue after receipts. There is **no measured new-runtime latency or quality result**. The later harness must record request count, actual input/output/reasoning/cached tokens, provider latency, total time and rubric scores before any speed claim.

## 9. Complexity, compatibility and staged decision

Six inspected semantic/routing modules total about **2,198 TypeScript lines** (`resolver-provider`, `turn-world`, `world-logic`, `natural-mechanics`, `natural-combat-turn`, `combat-exchange`). They are the initial *bypass footprint* for new ordinary turns, not a deletion estimate: some code serves World Lab, old operations or shared authority. The five migration files 33–37 total about **1,425 SQL lines**, including lasting schema/authority; those files must never be erased. A future line-by-line audit may retire a substantial subset of semantic routing after dual-path compatibility, while new generic SQL/loop code will add complexity. This spike's 252-line journal prototype is not production replacement code.

An accepted production path would need a new additive SQL migration and checkpoint contract, first on a disposable populated database. New turns opt into a pinned `astra-primary-dm-v1` execution policy; old pending/failed/committed turns and saved timeline forks keep their historical profiles, checkpoint readers and validators. No mid-turn conversion, automatic retry/cancel, old migration rewrite or backfill. Compare ordinary Game behavior with blinded A/B/C, then shadow/dual-read on synthetic and owner-approved data, then limited opt-in owner testing. Confirm exact Save/Load/fork, Memory triggers, private/public projection, item provenance, owner corrections and rollback before considering retiring legacy routing. World Lab remains separate.

**Open questions before production:** Can a generic invariant validator prevent narratively false outcomes without recreating a second DM? How should it authorize novel environmental damage, new mundane entities/places, quest progress, relationships and travel while retaining real bounds? How can private truth inform the DM without leaking through paraphrase? How are interactive visible dice confirmation, partial compound actions, campaign-specific RPG rules, long-context cost, provider timeout and model-output drift handled? Does one high-quality DM actually outperform the current staged path on the blind rubric? No production migration or runtime switch is justified until those are answered with the later authorized evaluation and compatibility proof.
