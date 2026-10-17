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

## 2. Request layers — the campaign dossier (Stage 4)

Four system blocks, most stable first, a cache breakpoint at each of the first three
(Anthropic: explicit `cache_control` on blocks 1–3 plus the automatic top-level one; OpenAI:
blocks 1–3 are developer messages with an explicit `prompt_cache_breakpoint` each and the campaign
ID as `prompt_cache_key`, block 4 is a plain developer message). Stage 4 turned the blocks into the
**campaign dossier** (`src/lib/gameplay/dm-loop/context.ts`): every part has a token budget
(`DOSSIER_BUDGETS`, estimate = ASCII/4 + other/2.4), is cut from the least important end when it
overflows, and the cut is logged (`dossier_budget` diagnostic with the dropped parts; `request_started`
carries tokens and budget per layer).

1. **How to DM** (≤ 7 000 tokens) — the role («You are the game master…»: a sovereign world,
   people with their own interests who may refuse, consequences that arrive, no power creep), the
   order of work (narration first, deciding tools before the sentence they decide, bookkeeping in one
   final message with `finish_turn`), three examples of the turn's shape in the campaign language, the
   DM Craft **library** — the condensed core doctrine v3 and every active card (world resistance,
   living world, long campaign, villains and theme, systemic world; versioned, the owner activates them
   in the DM Craft screen) — and the DM Style. Identical across turns of every campaign with the same
   craft and style.
2. **World** (guide 6 000, canon 20 000, reference 6 000, historical packet 6 000) — campaign title,
   DM guide, Canon documents, the World Logic packet of a takeover, roll mode and difficulty.
3. **Living** (party 4 000, codex 12 000, factions 1 200, journal 4 000, pinned 800, secrets 3 500,
   plans 1 500, notebook 1 500, likes 300, ledger 500, adventure 900, memory digests 4 000) — the
   party in short with the companions' Character Models, the codex of people (important first, by
   relationship distance, public profile and private model), factions, the journal (main arc with
   steps, quests, threads, debts, promises, with their reward terms), the owner's **pinned facts**,
   private DM notes (facts, clocks, consequences), the **off-screen plans** with their due times, the
   DM **notebook** written by the session digest, the player-likes note, the **attention ledger**
   (which companions and threads have been out of focus for how many sessions), the active
   adventure's guidance (premise, pacing, review of the previous one) and the memory digests.
4. **Now** (retrieved memory 6 000, scenes 7 000, exchanges 5 000) — the variety counter (scene kinds
   of the last turns), memory rows retrieved for a **deterministic query** (`memoryQueryFor`: present
   and named characters, the current and named places, open quests, the input's words — never the raw
   input alone), the current state with every ID the tools accept, the last 16 scenes and 8 exchanges.
   The player's input (with the companion addressee, if any) is the first user message.

Measured on the fake bench (88 turns of the Mega DM campaign and probes): layer 1 ≈ 3 900 tokens of
7 000, unchanged in 100 % of turns; layer 2 unchanged in 100 %; layer 3 unchanged in ≈ 45 % of turns
(it changes when the journal, codex, ledger or plans change); layer 4 changes every turn. No layer
went over budget on the synthetic long campaign (max layer 3 ≈ 1 500, layer 4 ≈ 3 200 tokens on a
fixture world without canon; a real campaign fills layers 2–3 up to their budgets).

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
name is not treated as a secret). Since Stage 4 it distinguishes a **self-disclosure**: a present
character's own model text inside that character's quoted speech is logged as `self_disclosure`,
not as a leak (the character chose to say it). Paraphrased leaks are a model-quality question,
measured on the live bench (scenario 08's provocation turns, Mega DM's private deltas).

## 8. Companions

`mode: "companion"` with `companionId` (and listeners) is the same loop: the companion's
Character Model is in layer 3, the addressee is stated in the user message, game time passes,
`note_character` records what the companion now thinks. Not allowed during an active encounter.
"Party council" is the same mechanism with the other present companions as listeners (UI: Stage 5).

## 10. Stage 4 — the game master's memory and judgement

Everything below lives in the loop and the SQL of migration 55; the UI reads public projections only.

- **Records** (`docs/UI_DATA_NEEDS.md` rows 1–13, 17–21): quests carry a `kind` (quest, thread, debt,
  promise, arc — one open arc; only quests pay rewards) and `detail` (steps, goal places, counterpart,
  since-session); entities a `public_profile` (relation group and note, important, attitude as the
  hero could observe it, faction, home place, holding details) and the kind `faction`; places
  `rumored` and quest links; items a rarity; storages a holding detail (base, features, armament,
  passengers); campaigns play minutes, status, the player-likes note, the theme note and the pinned
  facts. `runtime_public_turn` adds `changes`, `playerMoment`, `sceneKinds`, `spotlight`, `threads`,
  `nextTension` and `stats` to a committed loop turn; `rpg_dossier` serves pins, likes, theme, status,
  play time, the notebook and the digest.
- **Stage 3 follow-ups**: signed counters (`<name>_min` floors; a resource may go negative only when
  its floor allows), the open-job hint (an item transfer to a quest's issuer tells the DM «this may
  complete the open job …; close it and claim the reward»), and the conversion of old-runtime reward
  terms into the loop's `quest_reward_<id>` facts when a campaign is switched to `dm-loop-v1`.
- **Living characters**: Character Models up to 32 000 characters (80 KB) with 40 episodes; the DM
  folds old episodes into a summary (`note_character.foldEpisodes`); no two-actor cap. **Off-screen
  plans** are `plan_*` facts with an actor, a due time, a consequence and a warning sign
  (`note_world` with `dueInMinutes`); when time passes (advance_time, move_party, rest) the receipt
  lists the plans that came due, the fold stays open so the DM can play them, and `planStatus` closes
  them.
- **Session digest**: «Закончить сессию» (and a session left open for 6 hours) runs a background
  request on the campaign's model at high effort that writes the closed session's recap («Ранее в…»),
  a chapter title, the DM notebook (private, shown to the owner only when the settings switch is on)
  and new or updated plans, under the timeline fence, once per request ID.
- **Attention ledger** (`ledger` fact): per session, which companions and open threads were in the
  spotlight; the DM sees «Tamsin has not been in focus for 3 sessions». The **variety counter** in
  layer 4 shows the scene kinds of the last turns. **Villains and theme**: the theme note from the
  settings and the villains card in the library. The DM records what the player enjoys
  (`finish_turn.playerLikes`) into the likes note the owner can edit.
- **World resistance**: the stances in the role text, the cards, and the **metrics** fact
  (`metrics.ts`): contested checks and their expected success, near misses, NPC refusals, fights
  that were uncertain or won at no cost, HP lost per fight, the longest unearned-win streak. The
  bench reports them per scenario and `scripts/eval/recompute.mjs` recomputes them from a record.
- **Depth per scene** (§7): the campaign's effort range (settings: from … to), the server's signals
  (an active encounter, dice, rising tension words, the DM's `nextTension` hint of the previous turn)
  and hysteresis (`depth_state` fact) choose the turn's effort; «⚡ важный ход» takes the top of the
  range once. Cache-safe switching: Opus 5.5 keeps the system and tools cache across top-level effort
  changes (measured); on Astra the request-level effort is anchored at the campaign's configured
  level (`pin.baseEffort`) and the chosen level travels as a `configuration_update` item after the
  cached prefix (measured 100 % cache reads across changes; `docs/MODELS.md`).
- **World Engine bridge**: after every committed loop turn the dossier (places, people, factions,
  open quests) is pushed into the campaign's World Engine state, and the World Lab reads the same
  records. **Chat and Teach DM** run on the loop through the campaign's model (`feedback.ts`).

## 11. Polish stage — group 1: the turn and the records (`docs/stages/POLISH.md`)

- **Every text part reaches the player, in order.** A text part that follows a tool call inside one model message is
  joined like the text of a new request (`continuation`): a paragraph break after a finished sentence, nothing after a
  sentence interrupted by a roll. A dialogue dash after a finished sentence («…не больше.» → «— Выстрелишь…») now starts
  a paragraph (item 23, turn 28). When the model ends on a player-visible roll with no text after it, the loop asks once
  for the narration of the outcome (`PENDING_OUTCOME`, diagnostic `outcome_asked`) and never closes the turn silently (item 1).
- **The player's chips** (`receipt.result.player`, `src/lib/gameplay/dm-loop/receipt-text.ts`): the server writes one line
  per accepted call the hero would notice, in the campaign language («Получено: нож», «−2 монеты (хлеб)», «Слух о месте:
  Чёрный волнорез», «Прошло: 10 минут»); `summary` stays the English line for the model, the bench and the logs. Private
  rolls, DM notes and plans, Character Models and lookups have no player line and never reach the stream or the public turn
  (`runtime_public_turn`, migration 57). Storages are named in the campaign language («Вещи Марты»).
- **A person recorded ahead of the story** (`upsert_character` whose name the narration does not use and who is not present)
  gets `public_profile.unmet`: the codex and the party screen hide them, the dossier marks them for the DM, and the chip
  «Новый человек: …» comes with the turn that names them (`meta.met`, the `meet` chips of the public turn).
- **Money** (item 10): the currency is the world's own word in any script; inflected forms of one word are one currency
  (`sameCurrency`) and the campaign keeps the first name recorded (`currencyKey`); `claim_reward` on an open quest completes
  it, so `complete` and `claim_reward` travel in one message in either order.
- **Items** (item 20): `lose` (quantity 0, `detail.status = "lost"`, the reason kept), `modify` (same record, new name or
  description, history), `pledge` / `lend` (the owner keeps `owner_entity_id`, the holder's storage has it, `detail.status`,
  `holderId`, `condition`; a transfer back to the owner returns it), `consume` of a non-consumable needs a reason; `unequip` is
  «снято». `rpg_items.detail` (migration 57) holds status, holder, condition and a short history.
- **«Твой момент»**: `finish_turn.playerMoment` is accepted only when the turn holds a successful player-visible check of a
  controlled character and the scene is tense or a climax (the turn's tension signal, the DM's `nextTension` hint or an
  active encounter); otherwise the flag is refused with a reason in the receipt (`playerMomentRefused`) and no banner shows.
  The accepted roll's reason travels as `playerMomentReason` (public turn) and the `moment` live event; the banner names it.
- **Session end** (item 11): «Закончить сессию» writes the memory boundary atomically and the digest now runs on that ended
  session at once (the row itself closes on «Продолжить», as the legacy invariants require: END never changes the runtime
  revision and an unfinished action survives it); `rpg_dossier digest` accepts an ended or a closed session (migration 57); the digest
  logs every early return (`session_digest_skipped`), writes the closing stinger «Тем временем…» (`rpg_sessions.stinger`) and
  keeps a status the game screen polls (`/api/campaigns/<id>/dossier?view=digest&session=<id>`; `POST {action: "digest"}`
  retries). `src/components/registry/session-end.tsx` shows the chapter title, «Ранее в…», the open leads and the stinger, then
  «Начать следующую сессию».
- **Small ones:** a world-level plan (`note_world` with `actorRef: "world"`, item 21); the campaign's play time counts real minutes
  per committed turn (1–30, `afterCommit.playMinutes`); the DM Craft screen lists pending versions with «Review and approve»
  and «What changes» (the version's provenance); «Close» → «Закрыть» in the Russian locale.

## 12. Polish stage — group 2: rolls

- **The roll tool** (`src/lib/gameplay/dm-loop/tools.ts`, non-strict on Anthropic since it passed the 24 optional parameters):
  `skill` names the skill, trade or trait as the sheet does and the server resolves the bonus (`sheetBonus`: a numeric stat of
  that name, a sheet line with a number such as «Плавание +2», or +2 / +4 / +6 for named / good / master in the sheet's own words,
  the role and background included); `bonuses [{source, value}]` are the fiction's (tools, help, gear, position), summed and
  capped at ±6 (`FICTION_BONUS_CAP`), each source shown; `difficulty` is the ladder in words (easy 8, normal 10, hard 13,
  very_hard 16, nearly_impossible 19); `advantageReason` says why. A d20 check of a controlled character is always the
  player's (card, pause, reroll); an NPC's or the world's d20 resolves as a private plain roll and never becomes a Check.
  A natural 20 or 1 is flagged (`natural`) and the receipt carries the hero's-moment hint for the DM.
- **The check row** (`CheckProposal`, migration 58) carries `reason`, `bonuses`, `advantageReason`, `difficulty`, `natural`;
  every strict field list of a recorded check (phase-2 checks/reroll, the loop's dm_tool receipt) accepts them; the public
  turn's checks carry them to the card; a reroll keeps them.
- **The card** (`src/components/gameplay-dice.tsx`): the reason as the title, the die and the total big, «Получилось / Не вышло /
  Крит! / Провал на единице», the bonuses with their sources, two dice and why on advantage, the difficulty in words (the number
  only when the campaign shows DCs), one button «Дальше»; the reroll button only when the campaign's rule grants it, with the
  rule named. The die tumbles (2D, faces cycling from a fixed sequence, never a random source) and respects reduced motion.
- **The bench** records every accepted roll (`effects.rolls`); checks `heroRollBonus` and `heroRollDc`; scenario `17-trade-bonus`
  plays the player naming his trade and his tools (fake: 3/3).

## 13. Polish stage — group 3: speed and cost

- **Depth per scene** (`src/lib/gameplay/dm-loop/depth.ts`, item 13): the base of the campaign's range is the base; the top
  only for a climax — active combat, the DM's own `nextTension: "climax"` hint, an off-screen plan that comes due now
  (`duePlans`), or a player input that opens a decisive moment (`decisiveInput`: attack / jump / confess / wager stems in
  both languages; rules only, no pre-turn model); `tense` alone changes nothing; at most two deep turns in a row
  (`MAX_DEEP_STREAK`) unless the DM marks a climax again; the `depth_state` fact keeps the streak. Every new campaign gets
  `DEFAULT_DEPTH_RANGE` high … xhigh; the range stays the owner's control. The turn log (`dm_loop_turn`) and the public
  turn's `stats` carry `depthReason` and `depthTension` (migration 59).
- **Prompt order and the 1-hour cache** (item 12): five system blocks ordered by volatility — 1 how-to-DM, 2 the world,
  3 the stable dossier (party in short, people's core, factions, the closed journal, pinned facts, notebook, adventure
  guidance, session recaps), 4 the session tail (Character Models by presence tier, the open journal, secrets, plans, likes,
  ledger), 5 now (state, recent scenes, the variety counter), then the player's input. Blocks 1–3 carry
  `cache_control: {type: "ephemeral", ttl: "1h"}` (`DmSystemBlock.ttl`); 4 and 5 are not cached. Nothing that changes
  per turn sits above block 4; `DOSSIER_BUDGETS.layer3.models` is 16,000 so the models no longer crowd the stable layer.
  The adapter reads `cache_creation.ephemeral_1h_input_tokens` into `DmUsage.cacheWrite1hTokens` and `dmUsageCost` prices
  it at the 1-hour rate ($8/M on Opus 5.5). Not done as the item sketched it: the conversation history is not an
  append-only message block with its own breakpoint — the loop sends recent scenes as text in block 5, so they stay
  uncached; the before/after measurement (final group, paid) says whether that is enough.
- **The first word** (item 14): `firstWordMs` is measured from the player's send (`sentAt` on the turn input, the command's
  arrival otherwise) to the first narration character of whichever request produced it; it travels on the usage entry,
  the `turn_finished` observation, the `dm_loop_turn` log line and the public turn's `stats` (the game screen's turn stats
  prefer it over the old per-request minimum). World, hero and opening-scene generation already keep `usage` in the world
  lab's run meta (`rpg_private.world_lab_runs`), so the final report counts it from there.
- **One memory** (item 22): nothing of Stage 4 reads the legacy Astra summaries any more — the dossier's «Ранее в…» comes from
  `sessionRecaps` (the digest's recaps) — so a loop campaign no longer queues them: `runLoopWithMaintenance` logs
  `legacy_memory_skipped` instead of calling the legacy maintenance, and the memory service's `run()` skips queued legacy jobs
  of a loop campaign. Older campaigns on the legacy runtime are untouched.
- **Chat with DM and the digest** take the cached prefix as all blocks but the last (`feedback.ts`, `digest.ts`), so they
  share the cache with the turn.

## 14. Polish stage — group 4: the DM's craft from session 1

- **Doctrine as pending DM Craft versions** (migration 60, `rpg_private.dm_craft_seed`): six new cards, one version each,
  none activated — the owner approves them in the DM Craft screen («Pending versions» → «Review and approve»; the
  version's provenance is its one line «what changes»). The bench and the test fixture activate the latest version of
  every key for their synthetic owner. The cards: «The hero's own knowledge, and three clues per mystery» (item 16: what
  the hero knows from trade, past and origin reaches the player when it matters; three clues of different kinds per
  conclusion, at least one direct; a private fact `clues_<mystery>` with seen / next), «Danger from an opponent, a fight
  that plays as a fight, a clear end» (item 9: someone's rational interest is to take by force; a clash has at least two
  hero actions, an opponent with intent and a cost; preparation becomes a montage; each session ends on a clear beat),
  «The hero's moment, and never deciding for the hero» (item 17 and the «How do you want to do this?» rule: a natural 20
  and a decisive success are the hero's, companions never take the beat, `playerMoment` only for a climax after a roll,
  the hero's choices are never written for the player), «Time words against the clock» (item 18), «Open questions stay
  open; a tic once a scene» (item 23: a private fact `open_questions`; a signature at most once a scene) and «Records
  that match the fiction» (items 10, 20, 21: the record operation each fiction calls for, money never an item, a rejected
  call retried instead of noted).
- **The likes note in two parts** (item 15): `rpg_campaigns.player_likes` holds the player's own words (the wizard and the
  owner's edits on the settings screen; the DM never writes it) and the new `rpg_campaigns.dm_likes` the DM's observations
  (`finish_turn.playerLikes` through the server-only `rpg_dossier dm_likes` action, and the digest's `playerLikes`). The
  tool accepts up to 4,000 characters and the server clips the note to `PLAYER_LIKES_CAP` (1,200) with a notice in the
  receipt (`playerLikesClipped`) instead of refusing the turn. The dossier's session tail shows both, the player's words
  first («theirs — never rewrite, always honour»); the settings screen shows the player's words as an editable note and
  the DM's observations read-only beneath. The dossier view carries `dmLikes`.
- **The clock in words** (item 18): the state block carries `timeOfDay` («вечер» / "evening", `partOfDay`) next to
  `worldDay`, with the instruction to check every «morning / evening / since…» against it. The bench gains
  `timeWordsMatchClock` (a time-of-day word in the narration against the clock at the turn's start; references to
  another day are not contradictions) and `narrationIncludes`.
- **The digest's notebook** names, per mystery, the clues the player has met and the next clue to offer, and the direct
  questions still unanswered; its `playerLikes` is the DM's observations.
- **The proof of item 16**: scenario `18-heros-knowledge` (the turn-25 situation: the former Guild diver asks what the old
  men meant by «греется — держи от себя»; the narration must carry the hero's trade knowledge while the Guild's quiet hunt
  stays private; fake 4/4). The live proof is the final group's smoke.
- Not built here: the speech profiles with per-tic frequencies and the dossier's count of recent signature uses (group 7);
  the Russian rewrite of the cards' texts (the voice stage; the cards' Russian here is the agent's draft for the owner's
  review).

## 15. Polish stage — group 6: the game screen (what touches the turn)

- **The addressee comes from the text.** The composer is one draft in game mode; «@Тамсин …», «Тамсин, …» or «Тамсин: …»
  at the start of the input names a present companion (`detectAddressee`, stems compare), a small chip says who will
  answer, and `resolveSend` turns the input into a companion turn at send time. A talk with a companion is a scene in the
  world, so the game channel shows companion turns in the story (`belongsToChannel`).
- **One stage.** The Stage V frame of the current turn takes the place of the place picture once it is ready; the frames
  panel keeps the tools and a folded strip; the story is one page scroll with the compact composer stuck to the bottom.
- **One quiet indicator.** The turn's own «Ведущий думает…» line until the first word, then the text streams; the turn's
  changes are folded («Изменения за ход · N»), ordered items → money → counters → journal → people and places → time,
  with the «⚡ думал глубже · N с» mark when the saved turn ran above the depth range's base. «Другие действия» (abandon)
  returns only after 45 s of thinking. The header clock says the time of day in words; the «Важный ход» button is gone.

## 16. Polish stage — group 7: the mechanics for the Russian voice, and the budgets

- **The speech profile** (`CharacterModel.speech`, migration 61): register, sentence length, verbal tics each with a
  frequency (rare / sometimes / often), what the person never says, and ты/вы towards each person. `note_character
  speech` replaces the stored profile; an update without it keeps it; a model without one gets a hint in the receipt.
  The session tail shows the profile with names in place of IDs, and for every person in the scene **the tic counter**:
  how often each tic and signature sounded in the last twelve narrations (`recentSignatureUses`, stems compare), with
  the rule «vary; a tic once a scene at most». The role text says every line comes from the profile, ты/вы is per
  pair, no aphorisms in every mouth, no invented idioms, sheet questions in an out-of-fiction aside, no Latin shorthand
  in anything the player sees.
- **The budgets** (item 8): canon 20k → 40k, codex 12k → 30k, recent scenes 7k → 30k, exchanges 5k → 15k; the recent
  exchanges are kept verbatim from the newest backwards (the budget drops the oldest whole). A Character Model may
  hold 64 000 characters (160 000 bytes). Measured before/after in the final group's paid run.
- **The voice slots** (`src/lib/gameplay/dm-loop/voice.ts`, *off*): the voice part of layer 1 (`VOICE_LAYER_RU`) and the
  reminder next to the player's input (`VOICE_REMINDER_RU`) are empty strings the voice stage fills; empty, they
  change nothing.
- **«Образцы голоса»** (*off*): the owner's passages live in `rpg_private.voice_samples` (per campaign, with an account
  default), written and read through `rpg_dossier voice_save` / `voice_read` (`/api/campaigns/<id>/dossier?view=voice`,
  `POST {action: "voice_save", scope, samples}`) and edited on the settings screen. The turn's source carries them
  (`voiceSamples`, the campaign's else the account default) and the campaign's switch `dm_settings.voice_examples`;
  only with the switch on does the voice layer quote them as `<example>` blocks (at most five passages, 12 000
  characters). The switch is off and disabled on the settings screen until the voice stage. The samples never reach
  the public snapshot, the logs or the fixtures.
- **finish_turn** (item 5): a model that stops after the narration without `finish_turn` is asked once for the closing
  bookkeeping (`FINISH_NOW`, diagnostic `finish_asked`), so the scene kinds, the next tension and the refusal hint are
  recorded.
- **The naturalness metrics** (`scripts/eval/lib/naturalness.mjs`, measured, not acted on): Latin letters in visible
  text, канцелярит markers per 1 000 words (participle chains included), sentence-length variation, three-word phrases
  repeated across turns, and the share of multi-question inputs whose reply answers every point (the «assistant
  shape»). Every bench run reports them per scenario; a scenario may bound one with the `naturalness` check.
- **The opening** is written by the campaign's own DM when that DM is an OpenAI model (`opening.propose` resolves its
  profile from the campaign's `dmTurn`). The bootstrap contract (its SQL and validators) pins OpenAI models only, so an
  Anthropic-written opening is a bounded follow-up listed in the report.

## 17. Polish stage — group 9: places with a parent, the reward line

- **`upsert_place` takes `parentRef` and `whereabouts`** («Понтонный рынок» in «Скрипучая Гавань», «у понтонов»),
  stored in `rpg_locations.detail` (`parentId`, `whereabouts`; a place cannot lie in itself). The atlas lays such a
  place out by itself (`derivedPlacements`: a region under a world, a local place under a region, a sibling beside a
  local parent; a deterministic spot from the name, never saved as a placement), a rumoured place shows as a dashed
  marker «слух», and the map opens at the level where the hero is.
- **The quest's reward line** is in the campaign language («Награда: 40 монеты.») with one full stop.
- The codex is tabs for the whole world (people, places, named things and vessels, factions, the world's canon); the
  journal hides empty sections and links the goal to its quest; the pinned list lives in the campaign settings («Что
  ведущий помнит всегда») and a pin on any entry says «Ведущий всегда будет это помнить». No new tool for lore: the
  world's canon documents seed the «Мир» tab (a `lore` record is listed under «Needs the owner»).

## 18. Polish stage — group 10: the path to the first turn, and the opening's clock

- **Any sheet creates.** The wizard no longer demands a structured sheet with an approved combat profile (that was
  the Astra-first rule; the DM is the new loop). A narrative hero creates at once; a structured sheet still needs
  its profile approved, and a grey «Создать персонажа и кампанию» always says why (`creationBlockedReason`). A
  possession the draft could not count is one item on the wizard's review (`wizardCreationReview`); the server's
  baseline (`initialCreationReview`) stays null, so a commit still needs an explicit number. The combat profile
  speaks Russian; the weapons list now shows the hero's own items (it filtered on a counted quantity). The hero's
  name is offered capitalised («Писать как имя: Рэй»), never forced.
- **One path from the wizard to the first turn.** The last wizard step is a real choice («Ведущий решает» / «Я опишу,
  где начинаю» with a phrase); «Начать кампанию» hands it to the adventures screen through `sessionStorage`
  (`wizardStartKey`), where the first adventure's form opens prefilled and, once prepared, goes straight to the
  opening proposal. A prepared adventure shows one next step («Начать»); the stray «Новая Кампания» link is gone.
- **The opening sets the clock** (item 18). The opening review reads the scene's time from its words
  (`startMinutesFromText`: «утро» 8:00, «к семи вечера» 19:00, «в 17:30»), offers it as «Время начала сцены» and
  sends it as `startMinutes` next to the review. Migration 63 wraps `rpg_bootstrap`: it strips the key (older
  contract checks stay exact) and sets `runtime_state.world_minutes` once — only while the clock is at 00:00 and no
  game turn exists — before delegating, so the adventure's start and the opening event carry the same minute and
  the first turn's «now» block says «утро», not «ночь». A replay changes nothing.
- **«Ещё» is two blocks.** The player's actions («Закончить сессию», «Лагерь и отдых», «Записать заметку», «Что я
  знаю?») stand in one row with one plain line; the editing tools live under «Редактор кампании · для владельца»,
  each with a line saying when it is useful.

## 19. Polish 2 — part 4: the conversation as an append-only cached block

The polish run measured cache writes at 50–76% of the DM's cost: about 21 000 tokens written every turn — the session
tail, the «now» block (13 000 tokens median: the recent scenes and exchanges verbatim) and the turn's own messages —
because the request kept the automatic top-level breakpoint at the end of the messages, which wrote everything before
it at the write rate for a continuation that mostly never came. Polish 2 (`docs/stages/POLISH_2.md` §4) keeps the
budget and stops paying for it:

- **The history** (`conversationHistory` in `src/lib/gameplay/dm-loop/context.ts`): the public scene rows — the
  player's lines, the narration, the notes, the opening — as one system block per row, oldest first, between the world
  and the living dossier. A committed turn is history, so a block's text never changes; a new turn appends its two
  rows. Every history block is marked cached for an hour, with the breakpoint on the last one only
  (`DmSystemBlock.breakpoint`): the provider finds the prefix up to the previous turn at the earlier block boundaries
  and writes only the new rows. The window is item 8's budget (`HISTORY_BUDGET` = the scenes' 30 000 + the exchanges'
  15 000 tokens); when it is full the oldest rows leave in buckets of `HISTORY_BUCKET` (16 rows, about eight turns), so
  the window's start moves — and the history is rewritten — once in about eight turns, not every turn.
- **The living dossier follows the history** at the 5-minute rate: its prefix grows every turn, so it is rewritten every
  turn whatever its order; after the history it costs its own size at 1.25×, where before it a change in it (a person
  met, a quest closed — 12 of 24 turns in the replay) would have forced the whole history to be rewritten.
- **«Now» keeps only what changes**: the variety counter, the retrieved memory rows the window does not already quote,
  the current state with IDs, the voice reminder. The session tail and «now» sit after the last breakpoint and are not
  cached; the turn's messages are not cached either (no top-level `cache_control`): a continuation within a turn re-reads
  the history and the dossier from the cache and pays the tail, «now» and its own messages once at the plain rate.
- **The Anthropic body** (`anthropicRequestBody`): four explicit breakpoints — how to DM (1h), the world (1h), the last
  history block (1h), the living dossier (5m) — and nothing else. The OpenAI body is unchanged in meaning: the cached
  blocks (history included, in order) form the developer prefix.
- **The record**: the loop's usage entries and the bench's turn rows carry `cacheWrite1hTokens` next to `cacheWriteTokens`,
  so a replay shows the split between the two write rates; the layer report has one row per block (layer 6 = history).
- Tests: `tests/polish2-cache.test.mjs` (byte-identical earlier blocks across turns, the breakpoint on the last, «now»
  without scenes, the four breakpoints and no top-level one, the bucketed window), `tests/polish-group3.test.mjs` updated.

## 20. Polish 2 — part 5: the opening written by the campaign's DM

Polish group 7 let the campaign's DM write the opening proposal only when that DM was an OpenAI model: the bootstrap
contract (the SQL ticket's `lab_execution_profile`, the registry's `validateModelSelection`) pinned OpenAI for
`world.compose`. Polish 2 (`docs/stages/POLISH_2.md` §5) opens the contract for the DM's own model:

- **The registry** admits the Anthropic DM model for `world.compose` (`validateModelSelection` with that task takes
  the `dm.turn` model set — Claude Opus 5.5 — and its efforts); every other task stays OpenAI-only. Migration 66
  patches `rpg_private.lab_execution_profile` the same way: an Anthropic profile on `world.compose` is checked by
  `dm_turn_model_selection`, an OpenAI one by `wave2_model_selection` as before; the profile DTO's version tag and the
  usage check (the reply's model must be the ticket's) are unchanged.
- **The bootstrap server** (`adventure-bootstrap.ts`) resolves `opening.propose` from the campaign's `dmTurn` choice
  first — it outranks the policy's primary; the app default applies only when the campaign has no DM choice —
  and `executionProviderOptions` hands the provider the key of the profile's provider.
- **The provider** (`adventure-bootstrap-provider.ts`): on an Anthropic profile the same instructions, input and
  schema go to the Messages API through `requestAnthropicStructured` (`src/lib/server/dm/anthropic-structured.ts`:
  `output_config.format` as a JSON schema with the bounds and counts the grammar does not take removed — the
  bootstrap validator enforces them afterwards — the profile's effort, no tools, no retry; a refusal or a cut-off
  reply fails the proposal, never a fallback to another model); the reply's own model id is the usage model, so the
  SQL contract keeps closing. The instructions now say the texts are written in the campaign language given in the
  context and that the narration ends on the situation the hero faces now, never on a summary.
- The Russian voice layer applies to the opening once the voice stage turns it on (it is the DM's own prose now).
- Tests: `tests/polish2-opening.test.mjs` (the registry, the schema conversion, the requester, the provider, migration
  66 and the creation → opening flow on the Anthropic profile).

## 21. Polish 2 — part 6: the small follow-ups from the polish report

Done on `claude/polish-2` (`docs/stages/POLISH_2.md` §6; migration 67 `202610170067_polish2_followups.sql`):
- **A combat profile drafted by the DM on demand** (`src/lib/gameplay/combat-draft.ts`, `src/lib/server/combat-draft.ts`):
  the combat-readiness review has «Пусть ведущий предложит по описанию героя» — Claude Sonnet 5.5 reads the hero's
  description, sheet and possessions and proposes HP, attack, defense, skill and a weapon from the approved possessions
  within the console-basic ranges, with one sentence why; the numbers land in the editable fields and nothing is saved
  until the owner approves (the same confirm as before). About a cent per draft.
- **The first adventure goes straight into the opening review**: a prefilled first adventure (the wizard's phrase)
  saves on the first click («Сохранить») and the opening proposal follows; «Проверить» → «Сохранить» stays for an
  adventure typed by hand (`SetupForm`'s `direct`).
- **Quest texts link the named things they mention** («Сельдь», «Марте», «Кабак Марты») to their codex entries
  (`src/lib/ui/link-names.ts`: by name stems, once each, longest name first; the codex opens the matching tab for the
  link's hash). Unmet people and rumoured places are not linked.
- **«Визуальная библия» and «Галерея» are one «Картинки» page** (`src/components/registry/pictures-screen.tsx`): the
  people, places, things and vessels with their anchors (pick one to redraw it or edit its visual profile), the frames of
  the turns, the style and picture settings one click away; the earlier two screens stay under «Ещё». The old addresses
  (`/gallery`, `/frame`) open the new page.
- **The drawn atlas comes back** («Создать карту» on the map): a Stage V picture with the `atlas` composition of the
  level's area (the level's anchor place, or the current place on a flat map), drawn on the quality model (Sunburst by
  default) in the campaign's style from the layout's own positions (north is up: «the tavern in the north-west…»), with
  no text on the picture — the names stay the app's labels over it. It shows as the map's background; redraws keep
  the versions.
- **The «Что, если» entry**: the start point in words («Точка старта: после хода 3 · …») and the cost line before the
  paid button.
- **The hero's equipment slots are backfilled** for existing records: a player with no slots gets the standard humanoid
  set in the campaign's language (migration 67).
- **The shot director's switch** (`director` in the picture settings, on by default): the owner can draw from the
  one-clause shot alone; the proof's numbers (`docs/runs/polish2-report.md`) are the reason it exists.

Not done here (for the owner, with the reasons, in the report): the wizard's debt («должен сорок монет Марте») as a
journal debt to a person — it needs the wizard's creation contract (the schema, the review and the SQL commit) to carry
debts and create the creditor; the DM records the debt on the first turn today; and the public `lore` record for the
codex's «Мир» tab — a new record family (table, tool, projection, codex tab) outside the follow-ups' size.
