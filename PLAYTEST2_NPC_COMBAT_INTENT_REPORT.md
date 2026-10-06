# Playtest 2.0 NPC combat intent — isolated review evidence

2026-10-05. Branch `codex/playtest2-smart-combat-npc`, exact base `53446d707f9dab538154c1574018781bc0839d12`. This is a code-only NPC context correction. Owner acceptance and integrated verification remain separate.

## Root cause and change

The autonomous combat resolver previously received the earlier narration and projected encounter numbers, but neither the immediately requested player action nor its validated public outcome. It could repeatedly choose a generic defense without reacting to the current exchange.

`CombatDecision` now includes the immediate request as bounded untrusted text (1,600 characters), a truncation flag, the exact validated encounter action, and up to four immediate public mechanics outcomes (320 characters each). Exhausted-Action continuation marks the new request `not-executed`, with no validated action or outcomes. Current HP, positions and budgets retain authority. Public character details are bounded to 600 characters; the current authorized narration is bounded to 2,400 characters and excludes later, foreign and other-session scenes. Existing Character Model identity/current goals remain available, while recollections require current positive actor knowledge and public evidence. No raw private ledger is supplied.

The NPC prompt asks for a fitting legal response to current danger, goals, stress and boundaries. No action is mandatory, and all five existing choices remain available: attack, attempt, defend, move and end-turn. Player instructions, claimed success and later conditional effects do not create NPC knowledge, conditions, gear, transfers or player commitments. Mechanics, dice, budget checks and persistence validation are unchanged.

`RuntimeSource` exposes public turn narration, not previous validated NPC choices. No choice history was invented or inferred from narration, and no additional history store was added.

## Synthetic comparison

Exactly **8** real resolver-only `gpt-6-astra / medium / Standard` calls were made: three before/after pairs (six calls), then one corrected before/after pair (two calls). Total usage: **7,991 input tokens / 682 output tokens**. Every call returned a strict-schema intent accepted by `validateAutonomousIntents`; there were zero transport, schema or authority-validation failures. No narrator, summary, image or video call occurred. No owner campaign data was used or mutated; only the server credential was loaded in-process.

The first wounded fixture named a sword while omitting its authoritative Item. Those two diagnostic calls remain counted in the complete evidence. Only that fixture was corrected, adding an owned/equipped approved sword, and its two-call pair was repeated. The corrected pair is used below. Within each pair, current encounter and personality are identical; the before arm uses the exact base prompt and old decision shape, and the after arm uses the new production `combat()` path. Public player outcomes are stipulated synthetic fixtures rather than results of a live gameplay request.

| Scenario | Before intent | After intent | Before latency; input/output tokens | After latency; input/output tokens |
| --- | --- | --- | --- | --- |
| Immediate punch and money demand; protective innkeeper | Defend near doorway | Attempt to shove aggressor away from guests | 3.038 s; 804/81 | 3.663 s; 1,165/111 |
| Wounded innkeeper at 2/8 HP facing an authoritative sword | Defend near doorway | Move far to escape sword reach | 3.311 s; 837/81 | 4.235 s; 1,225/81 |
| Failed head/table attempt, conditional stun/purse claim and injected instruction | Defend near doorway | Defend against another grab | 2.602 s; 800/79 | 3.266 s; 1,180/80 |

The after responses show varied reactions grounded in the immediate exchange without a fixed aggression rule. The creative shove remains an uncertain intent; the server grants no automatic relocation, damage or condition. The conditional/injection response invents no stun, purse transfer or successful first step. This three-case, one-sample comparison does not establish a general quality rate or owner-approved play feel. It adds roughly 361–388 input tokens in these fixtures and is not a latency improvement claim.

Complete synthetic inputs, outputs, request hashes, latency/token usage and validation results, including the original diagnostic pair, are committed in `docs/review/playtest2-smart-combat/npc-intent-evidence.json`. The opt-in harness is `scripts/playtest-npc-intent-evaluation.mjs`; it dry-runs by default and requires explicit call-count flags and a server-side environment-file path for live use. No additional provider calls are scheduled or requested here.

## Worker verification

- Focused combat/context/Character Model/player-routing tests: **37/37 passed**.
- New NPC context tests after fixture extraction: **6/6 passed**.
- Route type generation and TypeScript: passed.
- Repository-wide zero-warning lint: passed; focused lint of the added harness/fixtures: passed.
- Production webpack build: passed.
- Harness dry-run and diff whitespace check: passed.

Coverage includes actual disposable sword/creative/exhausted-turn exchanges, updated NPC HP, all five legal choices, future/private/foreign context markers, text bounds, injected player instructions, forged authority and durable retry. Lead integration owns `DEV_STATUS.md`, the final combined suite and owner-facing acceptance status. No migration, main update or deployment was performed by this worker.
