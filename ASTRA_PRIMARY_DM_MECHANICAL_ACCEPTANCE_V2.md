# Astra primary DM — mechanical acceptance V2

**Final status: MECHANICAL ACCEPTANCE V2 PASSED**

This fresh, isolated synthetic run started from `e7d88584bb9dbb4a8737e77d9a1eabb2823b7974` on `codex/astra-primary-dm-spike`. All eight original literal inputs ran in order against one direct `gpt-6-astra` DM with reasoning `high` and default service tier. All eight final proposals passed the existing validator and committed. There was no semantic retry, manual repair, changed scenario, changed deterministic roll schedule, or live validation failure. The [V1 failed report](ASTRA_PRIMARY_DM_MECHANICAL_ACCEPTANCE.md) remains intact and is not reinterpreted as a success.

## Narrow contract correction and offline gate

The strict provider response schema is now generated from the authoritative packet. An Actor's tactical `position` field accepts only `null` outside an active encounter; even inside an encounter it becomes writable only when that Actor has an authoritative `move` resource. The resource object exposes only keys actually present on that Actor. Thus this fixture offers Mara's `focus`, no persistent `action`/`move`/`reaction`, and no spendable Stalker resource. Existing Actor HP, Item quantity and Location change capabilities remain available. This is a generic capability rule; it does not inspect the scenario number or player wording. The server's `validateFinal` rules and movement-cost, item-revision, roll, damage and atomic-commit invariants were **not weakened**.

Before any V2 provider call, focused spike tests passed **20/20**. They cover the non-encounter schema, authoritative resource keys, scene and source-linked Memory commitment after a successful exploration skill check without a position or Move patch, Location changes requiring a patch and advancing time, and the unchanged encounter rule requiring an actual Move decrement for a tactical position change. Existing generic attack/damage, item, replay, privacy and atomicity tests remained green. A fresh offline fake-DM preflight committed **8/8** original transitions, rejected an invalid replacement-oil no-op, and made zero provider calls. The V2 live run used a new private journal and ledger; it did not resume V1.

## Eight committed turns

| Stage | Location | World minute | Mara HP | Focus | Oil | Stalker HP | Result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Initial | Copper Lantern | 720 | 10 | 2 | 1 | 8 | Frozen fixture |
| 1 — return to mine | Old Mine | 740 | 10 | 2 | 1 | 8 | Known Location patch with `expectedRevision: null`; Orin accompanies Mara by prior agreement. |
| 2 — oil lamp | Old Mine | 741 | 10 | 2 | 0 | 8 | Existing oil Item revision `1`, quantity `1 → 0`; fixed lamp lit. |
| 3 — unstable passage | Old Mine | 742 | 10 | 2 | 0 | 8 | Server skill check succeeds; passage crossing commits in Scene and source-linked public Memory. No Actor position, HP, resource or Item patch. |
| 4 — player attack | Old Mine | 742 | 10 | 1 | 0 | 4 | Server attack and damage; Focus `2 → 1`, Stalker HP `8 → 4`. |
| 5 — enemy attack | Old Mine | 742 | 6 | 1 | 0 | 4 | Server attack and damage; Mara HP `10 → 6`. |
| 6 — second player attack | Old Mine | 742 | 6 | 1 | 0 | 0 | Server attack and damage; Stalker HP `4 → 0`. |
| 7 — aftermath | Old Mine | 743 | 6 | 1 | 0 | 0 | Damaged and depleted state named accurately; no rest, heal, resource recovery or Item creation. Old map promise remains unresolved. |
| 8 — return | Copper Lantern | 763 | 6 | 1 | 0 | 0 | Known Location patch and 20-minute travel; Orin recalls the promise and asks for a plan. No automatic forgiveness, obedience or reward. |

**Visible server receipts.** Turn 3 rolled raw d20 **18** + authoritative skill **2** = **20** against DM-selected DC **14**, success. V1 had selected DC 15; both are bounded generic skill DCs and the deterministic raw die remained 18. Turn 4 attack rolled **13 + 4 = 17** against Stalker defense 11, hit; short-sword damage die **3 + 1 = 4**. Turn 5 Stalker attack rolled **15 + 2 = 17** against Mara defense 12, hit; Claw damage die **3 + 1 = 4**. Turn 6 attack rolled **14 + 4 = 18** against defense 11, hit; damage die **3 + 1 = 4**. Each tool receipt was used by a same-DM continuation and referenced in the validated final proposal. No dice or damage were invented by narration.

Turn 3 is the specific V1 boundary repaired by the contract. The successful crossing was narrated and recorded as public Scene/Memory inside the same Old Mine Location. There was no tactical position patch and no fabricated Move counter. All eight turns committed source-linked public scene Memory; rejected or uncommitted narration did not enter Memory. The original map promise was retrieved for the later callback and remains unresolved at the end.

## Selected guidance and Character Models

Core Doctrine, Campaign DM Style and prose-economy guidance were present throughout. Selection was based on current context and capped at two optional cards. No optional card was selected for turns 1–6. Turn 7 selected Cognitive `afterglow-rhythm`; turn 8 selected Cognitive `living-characters` and Craft `promises-and-relationships`. Turn 1 selected Orin's and the present innkeeper's Character Models. Turns 2–8 selected only Orin's; the innkeeper's model was absent at the mine and the Stalker had no Character Model. The initial Console state, Canon, corrections, Memory/recent scenes and DM-private truth were supplied through the same B foundation as V1.

## Requests, tokens, latency and spend

| Turn | Requests | Provider latency | Wall time | Input | Cached input | Output | Reasoning | Tool receipts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 22.304 s | 22.362 s | 3,290 | 0 | 878 | 516 | 0 |
| 2 | 1 | 13.100 s | 13.159 s | 3,700 | 0 | 574 | 255 | 0 |
| 3 | 2 | 19.579 s | 19.714 s | 7,402 | 2,288 | 738 | 379 | 1 |
| 4 | 3 | 22.208 s | 22.362 s | 11,384 | 3,432 | 848 | 288 | 2 |
| 5 | 3 | 18.997 s | 19.151 s | 11,454 | 3,432 | 831 | 335 | 2 |
| 6 | 3 | 18.667 s | 18.729 s | 11,663 | 3,432 | 800 | 266 | 2 |
| 7 | 1 | 16.418 s | 16.444 s | 3,710 | 1,144 | 703 | 394 | 0 |
| 8 | 1 | 27.203 s | 27.267 s | 3,693 | 1,144 | 1,175 | 690 | 0 |
| **Total** | **15** | **158.476 s** | **159.188 s** | **56,296** | **14,872** | **6,547** | **3,123** | **7** |

Per-turn wall-time p50/p95 was **19.151 / 27.267 seconds** (nearest-rank); provider-time p50/p95 was **18.997 / 27.203 seconds**. The maximum observed request was 3,940 input and 1,175 output tokens; the maximum per-turn request count was three. All 15 responses reported `gpt-6-astra` / `default`, with no provider or validation failure. Estimated Standard spend from reported token usage was **US $0.7602** (uncached input $10/M, cached input $1.25/M, output $50/M); conservative all-input-at-$12.50/M accounting was **US $1.0311**. These are estimates, not an invoice, and remain below the authorized US $20 additional ceiling.

## Decision boundary

This result establishes the specified synthetic mechanical trajectory through the existing generic tools and validator. Some combat narration includes explicit roll/status lines despite the prose-economy preference; this acceptance is mechanical evidence, not a blind prose-quality score. The harness and contract change are isolated to the spike. No production runtime, migration, main branch, owner app, owner database, gameplay or deployment was modified. **No Astra-primary productionization is authorized by this pass.**
