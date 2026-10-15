# Playtest 2.0 — smart NPC combat and natural action language

**Status (2026-10-05):** Isolated review candidate based on activated `main` `53446d707f9dab538154c1574018781bc0839d12`, with the real owner database still at migration 36. No owner turn was submitted, retried, cancelled or continued. No owner database, app, deployment or `main` change was made. Migration 37 was not created.

## Read-only live diagnosis

The five requested owner inputs were read from saved operations and public encounter state, without changing them:

| Input | Operation | Saved classification/result | NPC |
| --- | --- | --- | --- |
| Kiss the innkeeper | `5d0b73d1-ccde-4128-8bc0-deaf709a21b3` | v4 improvise; skill 7+1=8 vs DC10, failed; no damage/condition | defend |
| Sword strike | `04e14277-59fa-465f-9c6d-e92cd85a40e6` | v4 attack with approved equipped longsword; 17+2=19 hit; defense reduced damage 2→1, innkeeper 6→5 HP | defend |
| Kick toward wall | `12f56ea9-c5f5-4997-9065-67fd5e38fe09` | v4 unarmed attack; 5+2=7 missed; no movement | defend |
| Table, requested advantage, sword strike | `d56380c0-4791-40a3-90d2-e20ae762740a`, `bacf7605-ede4-4895-a95e-f5ee93584efe` | v2 attempt blocked on table evidence; saved validation failures; no attack/roll/NPC exchange | none |
| Taunt while hiding behind bar | `cd0645d4-2679-433b-8cd2-d7a4f606097a` | v2 speak blocked on cover evidence; saved validation failure; no mechanics/roll/NPC exchange | none |

The table and bar cases were durably saved. Their v2 missing-evidence proposals paused, then the bridge had no resolution for final validation; these were not the earlier unsaved preflight failure. Seven recent committed exchanges selected NPC `defend`, a model choice rather than hardcoded behavior. The old NPC request carried projected HP and position but omitted the just-resolved player input/outcome, and its prompt identified defend/end-turn as safe choices. The inspected innkeeper had no saved Character Model. Latest read-only encounter: Round 8, hero 10/10 HP and Action 1/Move 1/Reaction 1, innkeeper 5/8 HP and defending. The sprint did not alter it.

## Code-only correction and authority

The player resolver now receives one shared rule: select the **first independently consequential uncertain action**, not the first verb. Incidental table staging, a feint, a called body part or hoped-for stun may accompany one ordinary attack, but grant no advantage, position, condition or other outcome. A prior shove that needs its own result remains a bounded improvise attempt, and later strikes wait. A kick primarily intended to force someone toward a wall should be interpreted as an improvise attempt; an injuring kick remains an unarmed attack. Neither grants displacement. The exact live kick was previously classified attack; the new semantic classification is guidance and has not been tested against a live player resolver in this sprint. Pure speech remains World Logic speech; hidden truth and Foundation transfers keep their existing guards.

The NPC request now receives the bounded literal player text as **untrusted data**, the validated first player action and public outcome, before/after HP for validated public changes, the current encounter HP/positions/budgets, bounded public scene and Character details, and actor-authorized Character Model data. A spent-Action continuation explicitly says the new text was not executed. Foreign, future, private and unsupported recollections are filtered. The model chooses among the existing attack, attempt, defend, move and end-turn intents; no action is mandatory or a personality-independent default. Existing deterministic dice, damage, targets, gear, budgets, conditions, persistence guards and retry identity remain authoritative. The final narrator still receives the validated whole exchange.

## Synthetic Astra Medium NPC evaluation

The NPC worker made eight resolver-only calls: three before/after pairs, plus one corrected wounded pair. The original wounded pair had a sword claim without an authoritative Item and remains counted as a fixture diagnostic. All eight strict outputs passed intent validation. On the three correct paired cases, the old context chose defend three times; the new context chose an uncertain shove attempt against an aggressor, retreat for a badly wounded innkeeper, and contextual defense after a failed conditional head/table attempt. Full synthetic inputs, outputs and timings are in [the NPC report](PLAYTEST2_NPC_COMBAT_INTENT_REPORT.md) and `docs/review/playtest2-smart-combat/npc-intent-evidence.json`.

After lead integration added the validated HP delta field, four more resolver-only calls checked two final-prompt before/after pairs. Immediate provocation: old defend 3.075 s (804/79 tokens), new defend 3.037 s (1,170/82); wounded innkeeper: old defend 2.682 s (859/84), new move far 3.474 s (1,259/90). Both final-prompt after intents validated. These final synthetic fixtures had no HP delta row; a disposable actual sword-hit exchange separately proves the delta is 8→6 HP. The results show contextual choice and sampling variation, not a measured quality rate or a promise that every threatened NPC retaliates. **Exactly 12 real Astra Medium resolver-only calls** were used across the sprint, totaling **12,083 input and 1,017 output tokens**. There were no narrator, summary, image, video or owner-data provider calls. Final four JSON records are in `docs/review/playtest2-smart-combat/npc-final-*.json`.

## Migration-36 boundary

Migration 36's `rpg_private.natural_combat_validate` requires a v4 `naturalMechanic` intent (`attack` or `improvise` against a visible target), validates one player attack/attempt and check, then the automatic end-turn and bounded NPC actions. The current v4 representation has a mandatory target and no player move/defend/speech step. World Logic v2 movement means travel to an existing Location with time, not an encounter participant moving to cover. Therefore `I duck behind the bar and taunt him`, `I back away and attack`, and `I defend and wait` are **not implemented** as free-text combat turns here. Speech alone remains speech without a taunted condition. Using the existing interpreter for player move, defend or Action+Move requires a new bounded checkpoint and commit-validator branch; one additive migration 37 appears sufficient, subject to a separate design, disposable migration proof and owner authorization. The existing schema-1 historical path must remain valid. No workaround or client-side effect was added.

## Disposable ten-turn and security coverage

An in-memory migration-36 campaign completed ten consecutive varied natural combat requests, including kiss, sword strike, kick, table tactic, feint, attempted disarm, mug, tackle, elbow and table contact. Fake resolvers supplied explicit semantic proposals and varied legal NPC intents; this tests the actual turn/runtime/SQL path, **not live Astra player classification**. Every exchange committed once, advanced one round, returned player Action/Move/Reaction to 1/1/1, produced distinct deterministic check IDs, and survived same-operation retry without extra damage or NPC decisions. Public Memory indexed all ten narrations, and an unrelated campaign row stayed unchanged. Existing focused tests cover forged effects, cross-campaign refs, missing equipment, hidden truth, Foundation transfer, Character Model knowledge, save/load and crash recovery. The movement/defend free-text cases remain pending migration 37.

## Current sequential latency baseline

The read-only owner checkpoints show player `world.resolve` → optional visible confirmation → NPC `world.resolve` → `dm.narrate`, with deterministic mechanics and checkpoints between calls. NPC intent must follow validated player resolution; narration must follow validated NPC resolution. The values below are checkpoint provider timings. The saved interval also includes confirmation, server work and user/browser time, so it is **not** a provider-only latency measure. Source snapshot bytes are only a context-size proxy; exact provider request bytes were not saved.

| Saved exchange | Player resolve | NPC resolve | Narrate | Blocking provider sum | Saved interval | In/out tokens: player; NPC; narrator | Source snapshot bytes |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| Kiss | 4.426 s | 5.313 s | 12.528 s | 22.267 s | 30.472 s | 5575/143; 855/78; 14660/589 | 70,515 |
| Sword | 3.911 s | 2.499 s | 17.551 s | 23.961 s | 38.706 s | 5573/119; 856/79; 16261/573 | 79,247 |
| Kick | 3.955 s | 2.742 s | 13.914 s | 20.611 s | 25.739 s | 5576/119; 857/77; 16289/607 | 79,736 |
| Later kiss | 4.798 s | 2.588 s | 9.817 s | 17.203 s | 32.214 s | 5562/139; 847/77; 17760/431 | 84,093 |

Some bounded public context preparation may be prepared early, but no model request or commit effect was parallelized across the player→NPC→narrator authority dependencies. Model profiles remain `world.resolve = gpt-6-astra / medium` and `dm.narrate = gpt-6-astra / high`. A separate latency sprint should measure exact request bytes and test safe preparation overlap without changing ordering.

## Verification and review state

Focused cross-system tests, the complete suite, typecheck, zero-warning lint and production build results are recorded in `DEV_STATUS.md` after integration. This candidate is for owner review; it is not activated. Known unrelated issues, including protagonist identity, UI polish and pre-begin Memory durability, remain outside this sprint.
