# The turn loop (`dm-loop-v1`) — Stage 2

The runtime in which the DM model writes free narration and changes state only through
validated tools. Code: `src/lib/gameplay/dm-loop/` (contracts, tools, shadow, execute,
context, loop, limits, settings, scripted-model), `src/lib/server/dm/live-turns.ts`,
migration `supabase/migrations/202610150053_dm_loop_runtime.sql`.

## 1. Lifecycle

```text
begin   durable literal input; runtime identity 'dm-loop-v1'; empty dmLoop checkpoint
claim   lease + pinned source (snapshot, runtime, private state, Craft, memory on read)
pin     the campaign's DM model and effort, once per operation (rpg_execution_profile, task dm.turn)
loop    request → stream text deltas + tool calls
        → execute each call against the SHADOW state → receipt (ok + result | rejected + reason)
        → every receipt persisted at once (dm_tool) → checkpoint (transcript, receipts, shadow delta)
        → next request … until the model stops without tool calls, or finish_turn after narration exists
commit  one atomic call: narration scene + collapsed RecordChanges + private patches + receipts + metadata
after   memory maintenance in the background (existing lifecycle)
```

Only lease / fence / revision violations and broken transport fail a turn. A rejected tool
call returns `{ ok: false, reason, hint? }` to the model and the turn continues. A failed turn
is retryable; a retry claims the same operation, rebuilds the shadow from the stored delta,
replays the recorded receipts (dice are never rolled twice) and continues the conversation.

### Runtime selection

`rpg_private.dm_settings` (one row per campaign; not part of timelines or world canon):
`runtime` = `dm-loop-v1` | `astra-primary-v1`, `dm_turn` = optional model selection, `limits` =
optional per-turn limits (Stage 3, see §3). New
campaigns (no row) play on `dm-loop-v1` from the first scene; every existing campaign got a
row with `astra-primary-v1` in migration 53. The owner changes both in Campaign Settings →
"DM runtime and model" (API `/api/campaigns/<id>/dm-settings`, RPC `rpg_dm_settings`), at
any time, even after a takeover. A turn pins the model when it starts; a retry keeps the pin.

Model resolution: `dm_settings.dm_turn` → the Stage 1 `runtimePolicy.taskOverrides["dm.turn"]`
→ default (GPT‑6 Astra). Reasoning effort = the selection's `reasoning`.

### Where two-stage mode would plug in

The loop runs one narrator who sees secrets (`privacy: "single-narrator"` in the pin). A
two-stage campaign option would change two points only: (1) `buildDmLoopContext` would omit
layer 3's private parts for a second "narrator" request, and (2) after the tool rounds end,
`execute()` would make that extra request with the accepted receipts as validated outcomes
and use its text as the narration. Nothing in the tools, receipts or commit changes.

## 2. Request layers (prepare for caching)

Four system blocks, most stable first, a cache breakpoint at each of the first three
(Anthropic: explicit `cache_control` on blocks 1–3 plus the automatic top-level one;
OpenAI since Stage 2b: blocks 1–3 are developer messages with an explicit
`prompt_cache_breakpoint` each and the campaign ID as `prompt_cache_key`, block 4 is a plain
developer message — OpenAI's implicit breakpoint sits after the latest message, so without
the explicit ones the first request of every turn wrote the whole prefix and read nothing):

1. **How to DM** — role and tool policy (narration first, tools inside the story, bookkeeping
   in one final message with `finish_turn`), three examples of the turn's shape in the campaign
   language, campaign language, DM Craft core doctrine, DM Style. Identical across turns and
   campaigns with the same doctrine and style.
2. **World** — campaign title, DM guide, Canon documents (≤ 60 KB), the historical World
   Logic packet if the campaign had a takeover, roll mode and difficulty settings.
3. **Living** — Character Models (all present/mentioned ones within 24 KB, no two-actor cap),
   private DM notes (facts, clocks, factions, consequences), quest reward terms, memory digests.
4. **Now** — DM Craft cards picked for this turn, recent/retrieved memory rows, the current
   state with every ID the tools accept (characters, items, storages, places, quests,
   encounters), the last 16 scenes and 8 exchanges. The player's input (with the companion
   addressee, if any) is the first user message.

Per request the loop logs `requestBytes`, `cachedPrefixBytes`, per-layer size and hash, and
after the response the usage with the cache read share (`dm_loop_request` events).
The closed-world filters of the old path (`presentEntityIds`/`routeLocationIds` narrowing,
dynamic ID enums) are gone: the model sees all IDs and may create records.

## 3. Tools

Sixteen tools, one neutral schema each (`tools.ts`), compiled per provider by the Stage 1
compiler. Strict mode: OpenAI strict for every tool. Anthropic strict where the optional
parameters fit the provider limit (24 optional parameters across all strict tools): `roll`,
`query_state`, `move_party`, `money`, `resource`, `advance_time`, `rest`, `note_world`,
`combat`, `finish_turn`; non-strict (bounds kept as ordinary JSON Schema keywords):
`upsert_character`, `upsert_place`, `item`, `quest`, `note_character`, `holding`.
Arguments are always validated on the server (`validateToolArguments`), then against the
shadow state.

References: an ID from the context, the `localKey` of a record created earlier in the same
turn (also by an earlier call of the same message), or a unique exact name. `"camp"` is the
shared camp stock, `"dm"` a roll of nobody. A reference nobody has is rejected with the
closest existing names and their IDs, so one retry is enough.

### The shape of a turn (Stage 2b)

The instructions teach the order of a live DM: narration text at once; a call that *decides*
an outcome (roll, payment, transfer, reward) before the sentence that describes it; pure
*bookkeeping* (new characters and places, items, quests, time, notes) after the text, all in
one final message that ends with `finish_turn`; independent calls together in one message.
Text written around a tool call is joined into one narration by `joinText` (a dash continues
the sentence, a finished sentence starts a paragraph) and the live stream emits the same
pieces, so the player reads the first sentence before the first tool runs. The loop still
asks for the narration if a model calls `finish_turn` before writing (safety net).

Requests after the first may run at a pinned **continuation effort** (`pin.continuationEffort`;
bench flag `--continuation-effort`): Anthropic takes it as the request's top-level
`output_config.effort` (which restarts the message cache — the per-message form only applies
after a user turn with new input, never after tool results); OpenAI keeps the request-level
effort and inserts one GPT-6 `configuration_update` item before the first tool outputs, which
keeps the cached prefix. Whether a campaign setting for it is worth having is decided from
the Stage 2b bench (docs/SPEED.md).

| Tool | Does | Server checks (data integrity, not plausibility) |
| --- | --- | --- |
| `roll` | any formula (`1d20+5`, `2d6`, `1d100`), reason, who rolls, visibility, optional DC, sheet modifier field, advantage | formula parsed by the server (1–20 dice, 2–1000 sides); modifier from the actor's `stats`; a single d20 with a DC becomes a Check; player visibility only for the player's characters; ≤ 8 checks per turn |
| `query_state` | exact current values after this turn's accepted changes | read-only |
| `upsert_character` | create/update an NPC or companion (name, description, presence, party, HP, stats, private stat block) | the hero is never rewritten; only a companion joins the party; a similar existing name is returned as a hint |
| `upsert_place` | create/update a location | — |
| `move_party` | travel to a place, time > 0 | place exists; minutes > 0; party travels, locals stay; place becomes visited |
| `item` | create / transfer / consume / equip / unequip / split | ownership, quantities ≥ 0, equipped items are not transferred, slots accept the category (standard slots are granted to a character without any), stacks split exactly |
| `money` | transfer / grant (reason) / spend of a named currency | balances never negative; a grant naming a quest whose reward was paid is refused |
| `resource` | HP or a named counter: delta / set / max | HP within 0..max; counters ≥ 0; caps kept |
| `quest` | create / update / complete / fail / claim_reward | reward terms kept privately by the server; `claim_reward` pays exactly once (the issuer pays if they can, otherwise the reward is minted) and marks the operation |
| `advance_time` | minutes with a reason | ≤ one week per turn in total |
| `rest` | short/long rest for the party or listed participants | time passes; recovery by the campaign's recovery setting when safe; listed supplies consumed; a rest record is written |
| `note_character` | Character Model: identity (set once), current state, beliefs, relationships, episodes | `parseCharacterModel` with the Stage 2b anti-garbage bounds (`CHARACTER_MODEL_BOUNDS`: 12 entries per list, 400–600 characters per text, 6000 bytes per model); identity is fixed once established; evidence for this turn's entries is the turn's own narration scene; a rejection names the field and the bound |
| `note_world` | private facts, clocks (set/advance), factions, consequences | key format; clock advance 0–100; reserved key prefixes |
| `combat` | start / position / end an encounter | one active encounter; participants exist |
| `holding` | create / update / remove a transport, base or mount with its own storage | — |
| `finish_turn` | scene kinds, characters in focus, `playerMoment` | ends the turn only after narration text exists; otherwise the model is asked to write it |

### Limits (Stage 3)

Two kinds, both in `limits.ts`. **Hard ceilings** of one call never change: money up to
1,000,000 per call, stacks up to 100,000, counters up to 1,000,000, narration up to 12,000
characters, 8 checks per turn, two weeks of game time per turn (the SQL commit's bound).
**Per-turn campaign limits** are campaign settings (`rpg_private.dm_settings.limits`, read and
saved through the same `/api/campaigns/<id>/dm-settings` route and `rpg_dm_settings` RPC as the
runtime and model; `null` means the defaults): money created per turn (grants and rewards the
issuer cannot pay; transfers create none) 1,000,000, items created 50, new characters 20, game
minutes 10,080 (a week), tool calls 40, model requests 10. Each has a ceiling the SQL validator
(`rpg_private.dm_turn_limits_valid`) and `parseDmLoopLimits` share. When a turn starts, the
limits are **pinned into the operation with the model** (`pin.limits` in the checkpoint): every
call is validated against the pin, never against the live settings, so a change applies to the
next turn and a retry keeps its pin. The shadow state counts what the turn has created
(`counters` in the delta) and a call beyond a limit is rejected with the limit named; past the
tool-call limit the model is told to wrap up, on the last allowed request it is asked to finish
without tools — the turn never fails for a limit. The SQL commit re-checks the time and the
new-character limits of the pin (`rpg_limit_exceeded`); the rest it trusts to the executor.

### The folded `finish_turn` round (Stage 3 §4)

GPT‑6 Astra at medium records its bookkeeping one call per request and then spends a request
of its own on `finish_turn` (23 of 29 turns in the Stage 2b bench, 2.5–3 s each). The
instructions now make time passing the last bookkeeping call of a turn, and on an OpenAI pin
the loop treats a message of accepted bookkeeping that closes with `advance_time`,
`move_party` or `rest` — written after the narration exists — as the turn's final message
(`foldsFinish` in `loop.ts`): the turn ends there, with an `implicit_finish` diagnostic and
metadata of its own (no scene kinds, the characters introduced or updated in focus, no player
moment). Any rejected call, any deciding call (a roll, money, an item transfer or consumption, a
claim, combat, `query_state`) or a message without time passing keeps the conversation open,
so a model that records its bookkeeping in several single-call messages is never cut short
before its time call. Opus batches `finish_turn` itself; Anthropic pins are never folded.

## 4. Receipts, shadow state, resume

- A **receipt** is `{ position, id, call: { id, name, arguments }, result }` with `result`
  either `{ ok: true, value, summary, check }` or `{ ok: false, reason, hint, summary }`.
  `summary` is a public-safe line for the player's list of accepted changes. Receipts are
  appended by `rpg_runtime('dm_tool')`: the same position with the same call returns the
  recorded receipt (idempotent replay); a different call at a recorded position is a conflict.
  A receipt carrying a Check also appends it to `checkpoint.checks` (validated in SQL as the
  old checks are: dice 1–20, kept, total, success, deterministic ID).
- The **shadow state** (`shadow.ts`) is a clone of the claimed source. Each accepted call
  mutates a candidate copy that is adopted on success; a rejected call leaves no trace. Changes
  collapse into one `RecordChange` per record, parents before children (entities → locations →
  storages → items → quests → public state → runtime rows). The delta (changes, private
  patches, local keys, time, configuration) is persisted with every checkpoint.
- **Checkpoint** (`checkpoint.dmLoop`): receipts, the neutral transcript (user, assistant with
  the provider's opaque native items — signed thinking / encrypted reasoning — and tool calls,
  tool results), narration text so far, usage per request, diagnostics, the pin and the shadow
  delta. Tool results are re-rendered from receipts for every request, so an allowed reroll
  reaches the model as the current dice.
- **Resume** (crash, provider error, "Retry"): the claim resets the attempt, the shadow is
  rebuilt from the delta, pending tool calls of the last assistant message that have no
  receipt are executed, recorded ones are replayed, and the conversation continues.
- **Interactive dice**: a player-visible important d20 check (campaign roll mode and
  interactive-dice setting, exactly as before) pauses the turn in `awaiting_confirmation` after
  the tool round. Continue resumes with the same receipt; Reroll replaces the check through the
  existing reroll authority, and the model sees the rerolled result.

## 5. Streaming and the client

The loop emits public-safe live events (`text`, `tool` with `summary`, `status`) to an
in-process registry (`live-turns.ts`). `GET /api/campaigns/<id>/turns/<op>/stream` serves them
as server-sent events (replay, then follow). The game screen's composer opens the stream when it
sends a game or companion turn and shows the provisional narration and the accepted changes
until the turn commits (then the saved turn replaces them) or fails (then they are discarded).
A server restart ends the stream; the client falls back to the saved turn. The new UI is Stage 5.

## 6. Commit

`rpg_runtime('commit')` for a `dm-loop-v1` turn (migration 53) applies the collapsed changes
through the generic applier `rpg_private.runtime_change` (storages through a small sibling,
since the applier has no storage family), writes the player and narration scenes with
deterministic IDs (`wave4_id(op, 'scene:player' | 'scene:narration')`), updates public state,
applies private patches to `dm_state`, records the event with receipts and turn metadata, and
marks the turn committed, all in one transaction. Since Stage 3 (migration 54) the commit
wrapper also re-checks the pinned time and new-character limits, records every reward claim on
the quest row (`rpg_quests.reward_operation_id`, from the private `quest_reward_<id>` terms
whose `paidOperationId` names this operation — a second claim fails with `rpg_reward_claimed`),
and makes the per-turn autosave policy apply to loop turns as it does to the older runtimes.

## 9. Record integrity in SQL (Stage 3)

The database guards the invariants of the loop on its own, so no code path — a bug, a retry, a
future tool, a direct write — can corrupt a campaign. Logic stays in TypeScript; SQL only
applies and guards (`tests/record-integrity-sql.test.mjs` tries each of these directly in SQL
and every attempt fails):

| Invariant | How it is enforced |
| --- | --- |
| Item quantities ≥ 0 (and ≤ 1,000,000); an equipped item has stock | table CHECKs on `rpg_items` (phase 1) |
| Money and every named counter ≥ 0 for every holder; a counter never above its stored `<name>_max` cap | CHECK `rpg_entities_resources_within_bounds` (migration 54; whatever a ruleset stores without a cap is respected) plus the applier's integer check |
| HP within 0..`max_hp` | table CHECK on `rpg_entities` (phase 1) |
| A quest reward is claimed at most once, including the "paid by a transfer from the issuer" settlement | `reward_operation_id` is set by the commit from the private terms and fails if already set (`rpg_reward_claimed`); the trigger `reward_claim_once` forbids moving or clearing it; an FK ties it to an operation of the same campaign (deferred, like every save-restored reference) |
| Every record a commit touches belongs to the campaign and the timeline of the operation; revisions hold | `runtime_change` scopes every row by `campaign_id` and never adopts a foreign ID (`rpg_validation`); composite FKs `(campaign_id, …)` on items, storages and participants; `timeline_assert` on every write; a stale `expectedRevision` is `rpg_conflict` |
| Operation IDs unique; a committed operation is never committed again, rewritten or deleted | primary key on `turns`; a second commit of a committed turn is `rpg_conflict`; the trigger `committed_turn_immutable` refuses status, input, narration or runtime changes and deletes of a committed turn (`rpg_immutable_history`) outside a save restore |
| Per-turn limits of the pin | the commit re-checks minutes and new characters (`rpg_limit_exceeded`); the executor enforces all six per call |

The two constraints that validate existing rows are added `NOT VALID` and validated in the
migration; if the owner's database held a legacy row that violates one, the migration leaves it
`NOT VALID` (new writes are still checked) and `docs/RELEASE_CHECKLIST.md` names the query to
find and correct that row.

## 7. Secrets

One narrator sees private notes and Character Models and is instructed not to reveal them.
The literal check (`suspectedLiteralLeaks`) runs on the final narration and only logs
`suspected_leak` diagnostics (never fails the turn; a stress value such as `strained` or a short
name is not treated as a secret). Paraphrased leaks are a model-quality question, measured on
the live bench (scenario 08's provocation turns).

## 8. Companions

`mode: "companion"` with `companionId` (and listeners) is the same loop: the companion's
Character Model is in layer 3, the addressee is stated in the user message, game time passes,
`note_character` records what the companion now thinks. Not allowed during an active encounter.
"Party council" is the same mechanism with the other present companions as listeners (UI: Stage 5).
