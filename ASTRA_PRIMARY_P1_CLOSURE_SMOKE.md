# Astra-primary P1 tool-policy closure smoke

**Result: both authorized live closure turns committed.** This is cumulative acceptance evidence, not a claim that one uninterrupted live eight-turn run passed.

## Evidence chain

The prior fresh production-path live smoke committed turns 1–6 and then stopped at turn 7 after Astra requested a skill roll for a quiet inspection. Its exact failed boundary remains in ASTRA_PRIMARY_P1_EIGHT_TURN_SMOKE.md. This new run used a **fresh disposable migration-38 campaign**. A scripted fake provider replayed the six acceptance inputs through the real production Astra runtime and TurnStore with the requested deterministic dice; no provider call reconstructed those turns. The reconstruction asserted:

| Post-turn-6 authority | Exact value |
| --- | --- |
| Location / world time | Old Mine / 15 |
| Mara | 6/10 HP; Focus 1/2 |
| Oil / Mine Stalker | 0 / 0 of 8 HP |
| Continuity | 12 new player/DM scenes; 12 indexed scene Memory sources; old map promise still present and unresolved |

The disposable fixture begins Mara at 9/10 and Stalker at 6/8 because current P1 damage receipts use raw die 3 with modifier 0; the earlier V2 fixture used die 3 plus modifier 1. This fixture difference was disclosed in the prior smoke report. No final-state table update manufactured the reconstruction.

## Narrow production repair

The private Astra planning packet now includes one generic tool-use policy. Current-public query is deterministic and never rolls. Skill is reserved for a genuinely uncertain proactive attempt with materially different success and failure; exact self-state, accessible owned inventory, supplied Memory, sitting, thinking, conversation, and restated facts do not call for a skill roll. Attack, save, damage and direct final each have one bounded use rule. The private instruction repeats the meaningful-uncertainty rule in one sentence. It names no acceptance character, place or turn. The public narration context, provider schema, gameplay validator, server dice, replay identity, Memory, Craft, Character Models, migration 38 and database commit guards were unchanged.

## Live closure

Direct provider: gpt-6-astra, reasoning high, default service tier. The closure made **four** requests, below the limits of two live turns, eight requests and US $5. There was no quality retry.

| Turn | Private decision and tool choice | Commit and state |
| ---: | --- | --- |
| 7 | Final proposal directly; no query or random tool, zero receipts. | Committed. Old Mine; world time 15 → 16; Mara 6/10; Focus 1/2; oil 0; Stalker 0/8. No heal, refill, loot or rest. |
| 8 | Final proposal directly; no random tool, zero receipts. It referenced the known Copper Lantern ID and exact public-state expected revision 10. | Committed. Copper Lantern; world time 16 → 26. HP, Focus, oil and Stalker HP unchanged. |

Turn 7's public narration recalls Orin's father's map and explicitly leaves the promise unfinished. Turn 8 has Orin state that he still wants the map but does not want Mara killed while finding it; he asks for a plan about the unstable timbers and leaves Mara's answer open. The only turn-8 private patch records that the promise was **acknowledged and remains unfulfilled**. There was no automatic forgiveness, obedience, relationship reward, power reward, item creation or resource recovery. Orin's Character Model and promise-related Memory were present in the private planning context. Both turns reached pinned final, public narration and atomic TurnStore commit; the disposable SQL error list was empty.

Final synthetic authority: **Copper Lantern, world time 26, Mara 6/10 HP, Focus 1/2, oil 0, Mine Stalker 0/8 HP, map promise unresolved.**

## Usage and measured latency

| Metric | Turn 7 | Turn 8 | Closure total |
| --- | ---: | ---: | ---: |
| Provider requests | 2 | 2 | 4 |
| Input tokens | 19,025 | 22,989 | 42,014 |
| Output tokens | 1,956 | 1,548 | 3,504 |
| Cached input tokens | 0 | 1,177 | 1,177 |
| Reasoning tokens | 1,404 | 810 | 2,214 |
| Turn latency | 59.238 s | 45.344 s | p50 45.344 s; p95 59.238 s |

The existing harness pricing formula estimates **US $0.5953** for this closure; actual billing may differ. The prior live run's attempted-turn p50/p95 was **42.862/54.579 s** and estimated spend was US $2.4545. Latency optimization was outside this authorization.

## Final gates and limits

- Focused Astra P1, migration-38, provider, forensic and soak tests: **26/26 passed**.
- Focused migration 35–37 and natural-action/combat regressions: **40/40 passed**.
- Complete suite against an isolated local preview: **1,935 passed / 1,936 total**, zero failures, one existing skip. The initial complete-suite attempt lacked a preview server and had 26 connection failures; the preview-backed rerun passed. The temporary preview was stopped.
- Route type generation, TypeScript, repository-wide ESLint with zero warnings, and production webpack build passed.

The previous six live turns and these two closure turns ran on **different disposable campaigns**. The closure fixture reconstructed the prior post-turn-6 state through the same production turn path with a fake provider and indexed its scenes into the existing Memory. This gives all eight acceptance behaviors live production-path evidence across the two authorized runs, while preserving the failed uninterrupted-run history and its limitation. No owner database, gameplay, application runtime, remote main or deployment changed.
