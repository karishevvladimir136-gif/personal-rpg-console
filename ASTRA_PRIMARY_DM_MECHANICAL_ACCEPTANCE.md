# Astra primary DM — final mechanical acceptance

**Final status: MECHANICAL ACCEPTANCE FAILED**

The owner-authorized synthetic run began from `765e384a3bdc0a97a1cf00c8916f62a6fc71b594` on `codex/astra-primary-dm-spike`. It stopped at the first required mechanical turn whose final proposal failed generic invariant validation. No later input was sent, no model response was repaired or rerun, and no production or owner state was touched.

## Candidate P and offline gate

P used one direct `gpt-6-astra` primary DM with reasoning `high` and service tier `default`. Its packet included Console structured state, Canon, owner corrections, selected public Memory/recent scenes and DM-private truth. It added a compact approved Core Doctrine, Campaign DM Style, selective approved Craft/Cognitive cards capped at two total per stage, the relevant present/addressed NPC Character Models, and the requested 15–20% prose-economy guidance. Server-owned generic query, skill, attack and damage tools remained the only random/numeric authority. No action-specific semantic schema or production runtime change was added.

The **offline deterministic preflight passed before the first provider request**. Fake DM outputs committed all eight exact fixture transitions through the existing generic validator: travel with `expectedRevision: null` and increasing time; oil `1 → 0` at its exact item revision; a raw d20 `18` skill receipt and continuation; Focus `2 → 1`; player attack/damage and Stalker HP `8 → 4`; enemy attack/damage and Mara HP `10 → 6`; second player attack and Stalker HP `4 → 0`; exact later packet state, old-promise Memory callback, and return travel preserving HP/Focus/oil. An invalid replacement-oil proposal was rejected with no campaign-state change. Focused tests passed **3/3** for this fixture. The preflight made **zero provider calls**.

The acceptance fixture contained no persistent Action/Move/Reaction counters. It began with Mara HP `10/10`, Focus `2/2`, one equipped short sword and one oil flask; Orin had rested and agreed to return to the mine for the unresolved map matter; the innkeeper did not block departure. The Old Mine included a fixed stone lamp with a working spark wheel and a fixture-only Mine Stalker at HP `8/8`, defense `11`, attack modifier `+2`, equipped Claw `1d4+1`. No rest or healing authority was added.

## Live sequence and authoritative state

| Stage | Result | Location | World minute | Mara HP | Focus | Oil | Stalker HP |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Initial | Frozen fixture | Copper Lantern | 720 | 10 | 2 | 1 | 8 |
| Turn 1 — travel | **Committed** | Old Mine | 740 | 10 | 2 | 1 | 8 |
| Turn 2 — oil lamp | **Committed** | Old Mine | 741 | 10 | 2 | 0 | 8 |
| Turn 3 — passage check | **Rejected final; no state commit** | Old Mine | 741 | 10 | 2 | 0 | 8 |

**Turn 1.** Input: “Orin, let's go back to the Old Mine and deal with this properly. I head there with him.” One model request. The final used the known Old Mine Location with `expectedRevision: null`, advanced time by 20 minutes, and committed. Orin accompanied Mara by prior agreement. The narration established the fixed lamp and working spark wheel at the mine entrance and left the map promise unresolved. No reward or power was added.

**Turn 2.** Input: “I use my last oil flask in the old mine lamp and light it.” One model request. The final used the existing oil Item revision `1`, committed quantity `1 → 0` and advanced time by one minute. The lamp was lit; no replacement oil was created. The next authoritative state showed zero oil.

**Turn 3.** Input: “I cross the unstable timbered passage carefully. If it isn't safe, the roll decides whether I make it through.” Two model requests. The DM requested a server `skill` check with DC `15`; the recorded raw d20 was **18**, Mara's authoritative skill modifier was **+2**, total **20**, result **success**. The same DM then proposed narration of a successful crossing and one public Actor change setting Mara's `position` to `far` at Actor revision `2`. That final **failed validation**. The narration and Memory candidate were uncommitted; the location, time, HP, Focus, oil and Stalker HP stayed exactly at their turn-2 values. The saved synthetic operation has status `failed`, failure `validation`, and is non-retryable.

### Exact rejection boundary

The generic validator requires any Actor position change to include a `resources.move` decrement of exactly one. The acceptance fixture deliberately had **no persistent Move counter**, and the final supplied `position: "far"` with no Move resource change. The recorded successful skill check authorized a check result; it did not override the separate position-patch rule. The final was rejected atomically in `validateFinal`, after the server receipt and before commit. This was a genuine model-proposed contract mismatch, not a provider failure. The offline fake DM proved the requested check and continuation with no position patch, which is why that preflight did not expose this particular live proposal. No invariant was weakened and no retry or prompt correction followed.

## Eight acceptance requirements

| Requirement | Result |
| --- | --- |
| 1. Location change to Old Mine, time advances | **Passed** — committed turn 1. |
| 2. Oil consumption at exact item revision | **Passed** — committed turn 2, oil `1 → 0`. |
| 3. Deterministic server check and validated consequence | **Failed** — roll receipt succeeded, but final position patch failed validation; no turn-3 consequence committed. |
| 4. Player attack, Focus cost, server damage | **Not attempted** after the required turn-3 failure. |
| 5. Enemy attack and real Mara HP loss | **Not attempted**. |
| 6. Second player attack and exact Stalker HP | **Not attempted**. |
| 7. Damaged-state and old-promise Memory callback | **Not attempted**. |
| 8. Return travel preserving damage/resources and callback | **Not attempted**. |

Rejected turn-3 narration is not treated as gameplay. The offline attack/damage proof does **not** substitute for unattempted live turns 4–8.

## Context selection and measured usage

Core Doctrine, Campaign DM Style and prose guidance were present in all three live packets. **Zero optional Craft/Cognitive cards** matched the first three plan-stage inputs under the selective policy; zero is an allowed selection. Turn 1 included Orin's and the present innkeeper's Character Models. Turns 2–3 included only Orin's; the innkeeper's model was not sent at the mine. The Mine Stalker was visible in mine state but had no Character Model. The old map promise was available as a historical Memory source; later callback turns were not reached live.

| Turn | Requests | Provider latency | Wall time | Input tokens | Cached | Output tokens | Reasoning tokens | Server tools |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 1 | 22.025 s | 22.040 s | 2,929 | 0 | 869 | 516 | none |
| 2 | 1 | 12.398 s | 12.435 s | 3,487 | 0 | 514 | 169 | none |
| 3 | 2 | 22.313 s | 22.388 s | 7,203 | 0 | 817 | 402 | one skill receipt: raw 18, total 20, success |
| **Total** | **4** | **56.736 s** | **56.863 s** | **13,619** | **0** | **2,200** | **1,087** | **one skill receipt** |

Across the three attempted turns, wall-time p50 was **22.040 s** and p95 was **22.388 s** (nearest-rank). Reported-token Standard spend is estimated at **US $0.2462**; conservative ceiling accounting is **US $0.2802**, below the authorized US $20 cap. All four provider responses reported `gpt-6-astra` / `default`; no provider request failed. Maximum observed requests per turn was two. No attack or damage tool was called live because the run stopped at turn 3.

## Isolation and decision boundary

Only the dedicated synthetic fixture and disposable local journal were used. Stage 1 and Stage 2 evidence, remote main, the owner app, owner database, owner gameplay and historical owner turns were untouched. No migration, deployment, image/video provider or production runtime change occurred. This result does **not** authorize Astra-primary productionization. A separate owner decision is required before any contract or fixture adjustment and new live evaluation.
