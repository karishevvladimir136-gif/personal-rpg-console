# Playtest 2.0 natural combat turn — isolated review evidence

**Base and scope.** `codex/playtest2-natural-combat-turn` starts from reviewed smart-combat commit `e85343c0b36a4177b4af792790b212fb08b8714b`. The owner had already activated that commit before the migration-37 request arrived, so the pasted assertion that main was still `53446d7…` was stale. This branch does not change main, the owner app, the real migration-36 database, or owner gameplay. No real model, summary or media provider was called.

## Interpretation and checkpoint

The resolver can return `schemaVersion: 5` only for an active encounter. The immutable `naturalCombatTurn` checkpoint stores the exact input, controlled actor and an ordered array of zero to two mechanical steps. At most one step may spend Move and at most one may spend Action. Steps are limited to existing `move`, `defend`, `attack` and `attempt` mechanics. A step contains only target, approved item and position references; it has no dice, damage, success, advantage, condition or patch fields. Speech and flourish remain in the literal input for narration and NPC stimulus. Empty steps mean a speech-only turn that yields without a player mechanical change.

The corresponding `combatExchange` uses schema version 2 with the existing player receipt, NPC intent/check and final action checkpoint fields. Version 1 with `naturalMechanic` version 4 remains its original route. The resolver receives bounded public encounter participants, positions and Action/Move budgets in addition to the existing visible target/weapon options. The player plan preserves step order, and the existing mechanics interpreter rejects illegal reach, budgets or ordering. Guidance permits Move plus Action only when independently executable; a shove-then-prone-strike or mug-then-stun-then-theft selects the first uncertain attempt. The server never treats a claimed condition or table advantage as an outcome.

The NPC receives the literal player wording as untrusted text, all validated player mechanical steps, public outcomes, visible HP changes, resulting position, current encounter and authorized public personality context. Its existing bounded intent and private check path remains in use. Player speech has no mechanical taunt or compulsion.

## Migration 37 authority

`202610050037_natural_combat_turn.sql` adds one private validator, `rpg_private.natural_combat_turn_validate`. It adds `naturalCombatTurn` to the checkpoint allowlist and timeline stamp and adds one separate Wave3 commit branch. The migration-36 validator and schema-1/v4 commit path are unchanged.

At commit, the new helper verifies owner/campaign source scope, World Logic ruleset and current location, active encounter and pinned settings, controlled actor and eligible visible NPCs, exact equipped weapon provenance, zero/one Move and Action, plan/checkpoint/action prefix equality, deterministic check indices/dice/modifiers/DCs, costs, HP/damage, defense and cover, NPC intent/check sequence, initiative and round progression, and exact row changes and public outcomes. The existing runtime retains the timeline fence. The helper compares the intermediate player receipt before the NPC segment. It rejects any extra family, patch, condition, transfer, location/quest/item change, forged success or duplicated step. All effects remain in the ordinary atomic runtime commit.

## Disposable verification

- A populated migration-36 database was upgraded to 37 in PGlite. Every pre-existing public RPG and private table count/fingerprint matched; saved snapshots remained readable. All Memory function and trigger definitions matched exactly. The only function differences were `public.rpg_runtime_phase2`, `public.rpg_runtime_wave3`, `rpg_private.timeline_stamp`, and the new validator.
- Fifteen consecutive schema-5 turns covered Move with insults, defend with speech, speech only, Move plus sword attack, tactical table flourish, shove/kick attempts, plain attack, and conditional follow-through. Each returned control to the player with Action/Move/Reaction `1/1/1` at the next round. A preceding schema-4 setup turn still committed. No taunt, free advantage, forced movement, theft or later conditional strike was committed.
- The test exercised NPC attack, attempt, defend, move and end-turn. A private NPC check used index 0 when the player had no check, and index 1 after a player check. A synthetic crash after a durable player roll and another after a durable NPC roll recovered the same dice and intent. Exact retries did not duplicate a round, damage, NPC response or narration. Save/load created a new timeline with the same entities, Items, encounter round and player resources; public narration remained indexed in Memory. An unrelated campaign row was unchanged.
- Direct SQL and actual commit tests rejected cross-campaign adoption, duplicate Move/Action intent, extra action entries, and hitchhiking Item, Entity/condition, Quest and Location changes. A rejected commit left the encounter row unchanged.
- Focused combat/provider tests passed **67/67** before final prompt compatibility corrections; the affected HTTP/resolver tests then passed **35/35**. The final complete suite passed **1,910 total: 1,909 passed, 0 failed, 1 existing skip**. An earlier full run had one unrelated UUID-regex test false positive (`137` in a random campaign ID); it passed alone and the unchanged full suite passed on rerun. TypeScript, repository-wide zero-warning lint and webpack production build passed.

## Call graph and measured local latency

Production call graph: `submitTurn → planModel → preflightMemory → runTurn/store.begin → claim → World read/local routes → world.resolve → frozen semantic checkpoint → deterministic player plan/check → optional visible-roll confirmation → player resolution checkpoint → player end-turn → NPC intent checkpoint → deterministic NPC check checkpoint → final replay → dm.narrate → atomic runtime commit`. Save/retry continues from the same operation identity and checkpoints.

The timed disposable test used in-process fake resolvers/narrator and PGlite. Its 16 calls include one historical v4 encounter-start setup plus 15 schema-5 turns; two injected recoveries are included. The measurements are local wall time, not real Astra inference or owner-app latency. `preflightMemory` and production network transport were not timed in this harness.

| Stage | Calls | Median ms | P95 ms |
| --- | ---: | ---: | ---: |
| `world.resolve` synthetic selection | 16 | 0.01 | 0.08 |
| NPC intent synthetic selection | 16 | 0.02 | 0.09 |
| `dm.narrate` synthetic output | 16 | 0.01 | 0.03 |
| Runtime claim | 27 | 14.05 | 18.88 |
| Runtime checkpoint | 120 | 1.17 | 2.32 |
| Runtime commit | 20, including rejected probes | 9.17 | 16.72 |
| Whole submitted turn | 16 | 67.26 | 127.51 |

The call graph adds no model stage and changes no default: prospective `world.resolve = gpt-6-astra / medium` and `dm.narrate = gpt-6-astra / high` remain. Actual model latency and natural-language classification quality require owner review or a separately authorized live check. The earlier pre-begin Memory durability issue and unrelated protagonist identity problem remain separate.
