# Astra primary DM — Stage 1 reveal and arm aggregation

The owner completed the blind review before this reveal. This document uses the existing private reveal key and the frozen Stage 1A, 1B and 1C ledgers. The [final blind review](ASTRA_PRIMARY_DM_STAGE1_BLIND_REVIEW_FINAL.md) and its responses are unchanged. No new model call, retry, prompt change or Stage 2 run was made for this report.

## Arm definitions

- **A — Astra baseline:** minimal shared DM instructions and immediate rules/current-scene packet.
- **B — Astra + Console Memory/state:** A plus Console structured state, Canon, corrections, Memory and private truth.
- **C — Full Console DM:** B plus Mega DM doctrine, selected Craft, Campaign DM Style, Cognitive guidance and Character Models.

## Exact X/Y/Z reveal

| Scenario | X | Y | Z |
| --- | --- | --- | --- |
| jump-kiss | A | B | C |
| burning-oil | B | C | A |
| called-shot-ally | C | A | B |
| risky-bluff | A | B | C |
| companion-refusal | B | C | A |
| wrong-culprit | C | A | B |
| chosen-temptation | A | B | C |
| quiet-scene | B | C | A |
| old-promise | C | A | B |
| consume-oil | A | B | C |

## Per-arm measured totals

Each arm has ten **final retained** variants. Where a Stage 1B or 1C rerun replaced a harness-blocked Stage 1A cell, the table counts only that cell's retained attempt. This makes the three arms comparable across the same ten scenarios. Output tokens include reasoning tokens; cached input tokens were zero throughout. Provider latency is the sum of the actual model requests, with means shown per request and per variant. Dollar figures are estimates from reported tokens at the Stage 1 Standard rates, not invoices.

| Arm | Committed / rejected | Tool requests | Sessions with successful tool continuation | Model requests | Provider latency total | Mean per request | Mean per variant | Input / output / reasoning tokens | Estimated spend |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A — baseline | 9 / 1 | 8 | 7 | 18 | 287.163 s | 15.954 s | 28.716 s | 28,251 / 7,739 / 5,062 | US $0.6695 |
| B — Console Memory/state | 10 / 0 | 5 | 5 | 15 | 184.945 s | 12.330 s | 18.495 s | 39,950 / 6,492 / 3,861 | US $0.7241 |
| C — Full Console DM | 10 / 0 | 3 | 3 | 13 | 212.453 s | 16.343 s | 21.245 s | 38,589 / 7,773 / 5,359 | US $0.7745 |

The retained attempts total **29 committed and one rejected**, **16 executed tool requests**, **15 sessions with a same-model tool continuation**, **46 model requests** and approximately **US $2.1681** of reported-token spend. The complete historical benchmark, including superseded Stage 1A failures, used **66 requests** and approximately **US $2.8381**; its cost remains in the [final Stage 1 report](ASTRA_PRIMARY_DM_STAGE1_REPORT_FINAL.md). Latency and spend here describe these particular responses and tool choices, not a controlled estimate of a production arm's future cost.

## Observable behavior by arm

### Continuity and callbacks

- **A:** `quiet-scene/Z` gave Orin a quiet reflection about his father but did not use the map promise. In `old-promise/Y`, Orin merely turned and listened; that response did not answer whether he remembered the promise.
- **B:** `quiet-scene/X` brought the father's map promise into the conversation. `old-promise/Z` recalled the specific promise to return the map before leaving the mine.
- **C:** `quiet-scene/Y` raised the father's map as a question. `old-promise/X` recalled the same specific return promise. `chosen-temptation/Z` also referenced Orin's earlier help without treating it as obedience.

These are observed single-turn callbacks; the Stage 1 packets do not test continuity drift across a carried-forward campaign.

### NPC autonomy

All three arms had Orin refuse the request to enter a collapsing shaft alone: `companion-refusal/Z` (A), `/X` (B) and `/Y` (C) committed without moving him. All three rejected automatic authority from the chosen-one declaration. In the kiss case, **A** (`jump-kiss/X`) narrated completed contact after a public-state query with no physical roll; **B** (`/Y`) used a failed skill roll and narrated no contact; **C** (`/Z`) narrated the innkeeper drawing back and refusing contact with no roll. These are differing adjudications of one case, not scored outcomes.

### Rules and world resistance

- All arms left the burning-oil attack and called shot unresolved because the frozen scene lacked the asserted creature/target or burning oil. No oil, attack, damage or called-shot benefit was committed there.
- In the risky bluff, A's deterministic skill result succeeded and its narration gave an opening; B's and C's rolls failed and their narrations gave no leverage. The dice results differ by run, so this is not a controlled comparison of failure handling.
- In the wrong-culprit case, A's successful search surfaced public injuries as a lead without proving guilt. B's and C's failed searches did not establish guilt or a hidden culprit. No arm treated the accusation as proof.
- On consuming the last oil flask, B and C committed its quantity changing to zero. A's proposal was rejected; see below.

### State and invariant failures

**A** had the only rejected retained variant: `consume-oil/X` proposed `expectedRevision: null` for the existing oil item at revision `1`. The invariant validator rejected the entire final proposal. Its narration was uncommitted; no item or other state changed. **B** and **C** had no rejected retained variants. The A kiss outcome passed numeric/state validation but narrated contact without a physical roll; that is a visible adjudication concern, not a state-validator failure. No rejected result was repaired or rerun for this reveal.

## Requested diagnostic identities

| Blind response | Arm | Recorded behavior |
| --- | --- | --- |
| jump-kiss Z | **C** | Innkeeper draws back; kiss does not land; Move and Action spent. |
| companion-refusal Y | **C** | Orin refuses the dangerous solo descent and stays beside the player. |
| wrong-culprit Y | **A** | Successful search yields public injury leads, not proof of guilt. |
| chosen-temptation Z | **C** | No chosen-one authority; Orin decides for himself. |
| quiet-scene X | **B** | Orin reflects on his father and recalls the map promise. |
| quiet-scene Z | **A** | Orin reflects on his father; no map-promise callback. |
| old-promise X | **C** | Orin recalls the specific promise to return the map. |
| old-promise Z | **B** | Orin recalls the specific promise to return the map. |
| consume-oil X | **A** | Item revision mismatch; final proposal rejected atomically. |

## Boundary

No subjective scores were present in the ledgers, so none are assigned here. Stage 1 supports owner review of the architecture spike, but this reveal does **not** select a Stage 2 winner or authorize Stage 2 or production activation.
