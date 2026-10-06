# Astra-primary P1 final sequential synthetic smoke

**Result: FAILED AT TURN 7.** The one authorized fresh disposable run stopped immediately. Turns 1–6 committed; turn 7 did not commit; turn 8 was never submitted. There was no retry, second run, production repair after the failure, owner-data access, or deployment.

## Fixture and run boundary

- Isolated branch starting SHA: 16d1a21aa5cf45e9195742e5f822a5c9d9bae692.
- Fresh in-memory PGlite campaign at migration 38, with one sequential authoritative state and fresh operation IDs.
- Direct OpenAI gpt-6-astra, reasoning high, default service tier. Twenty requests, below the 32-request and US $20 ceilings.
- The requested raw damage dice were 3 on turns 4, 5, and 6. P1's authoritative damage receipt has modifier 0. The historical V2 fixture used die 3 plus modifier 1, so this disposable fixture began Mara at **9/10** and Stalker at **6/8** to make the requested final 6/10 and 0/8 reachable without altering production damage authority. This difference from historical V2 is explicit; the story inputs and raw dice schedule are unchanged.
- Initial Copper Lantern Location ID: ab7e9173-e57f-4447-b942-fe45a48b24e2. Known Old Mine Location ID: 0eab0ece-5594-46c1-8291-6e02818190b6.
- The retained forensic fetch wrapper captured bounded synthetic assistant output_text, parsed decisions, private checkpoint summaries, store boundaries, safe disposable SQL errors, token usage, and latency. It did not capture request headers or credentials.

## Sequential outcome

| Turn | Required action | Requests | Committed state |
| ---: | --- | ---: | --- |
| 1 | Travel with Orin to Old Mine | 2 | Old Mine, world time **0 → 10** |
| 2 | Consume last oil flask | 2 | Oil **1 → 0**, world time 11 |
| 3 | Unstable passage check | 3 | Server skill die **18**; Old Mine retained, world time 12 |
| 4 | Spend Focus; player attack and damage | 4 | Server attack die **13**, damage die **3**; Focus **2 → 1**, Stalker **6 → 3/8** |
| 5 | Enemy attack and Mara HP loss | 4 | Server attack die **15**, damage die **3**; Mara **9 → 6/10** |
| 6 | Second player attack | 4 | Server attack die **14**, damage die **3**; Stalker **3 → 0/8** |
| 7 | No heal/rest; inspect state and recall promise | 1 | **Failed before a tool receipt, final proposal, narration, or commit.** No state changed. |
| 8 | Return to Copper Lantern | 0 | Not attempted under the mandatory stop policy. |

All six committed state transitions passed the production validation and existing TurnStore commit path. Their visible dice came from server receipts, and their public narration did not contain the synthetic private marker. The turn-7 private planning context contained Orin's Character Model and four promise-related Memory source IDs, but no turn-7 callback narration was produced. No conclusion about the unrun return travel is possible.

## Exact turn-7 failure evidence

Synthetic operation ID: 1110d203-c2f7-401c-b9bb-efe504a5d753.

The provider returned HTTP **200**, model gpt-6-astra, service tier default, response status completed. The exact untruncated assistant output_text was:

~~~json
{"type":"tool","call":{"kind":"skill","actorId":"4bd447a2-6394-4cdf-b982-9ea2fd578f69","targetId":null,"dc":12,"itemId":null,"scope":null},"final":null}
~~~

provider.next returned the **same parsed decision**:

~~~json
{"type":"tool","call":{"kind":"skill","actorId":"4bd447a2-6394-4cdf-b982-9ea2fd578f69","targetId":null,"dc":12,"itemId":null,"scope":null},"final":null}
~~~

The exact ordered boundary trace for this turn was:

1. store.begin entered and returned pending; literal input and astra-primary-v1 were durable.
2. store.claim entered and returned.
3. provider.next entered; the 20th HTTP request entered and returned with one extracted output_text.
4. provider.next returned parsed type tool.
5. The synthetic deterministic-roll callback was invoked with min=1, max=21, but turn 7 had **no scheduled die**. It threw synthetic_roll_schedule_mismatch before producing a number.
6. store.fail entered and returned failed.

The furthest completed provider boundary was **C — parsed decision returned**. A server tool was attempted, but recordAstraTool was not entered; no check or die was recorded. This was **not** a validateFinal rejection and no SQL commit was attempted. The safe turn failure category is unavailable, retryable=true, because the runtime mapped the harness callback error to that category. The exact underlying observed boundary is the harness's unscheduled roll, not a provider outage. The disposable SQL error list is empty.

The private synthetic checkpoint after failure has runtime_identity=astra-primary-v1, status=failed, failure=unavailable, expected_revision=57, source present, zero Astra tool receipts, finalProposal=null, no resolution, and no narration.

State before and after turn 7 was field-equivalent:

~~~json
{"location":"Old Mine","locationId":"0eab0ece-5594-46c1-8291-6e02818190b6","publicRevision":9,"runtimeRevision":57,"worldMinutes":15,"maraHp":6,"maraMaxHp":10,"focus":1,"oil":0,"stalkerHp":0,"stalkerMaxHp":8}
~~~

The model's requested skill check is an observed response to the quiet inspection turn. The fixed roll schedule covered only turns 3–6. This run cannot establish how turn 7 would have continued if a server die were available, and the stop policy forbids adding one and rerunning now.

## Usage and selection evidence

Twenty provider requests used **199,030 input**, **9,284 output**, **13,608 cached input**, and **5,861 reasoning** tokens. The existing harness pricing formula estimates **US $2.4545**; actual billing may differ. The failed turn used 11,346 input / 793 output tokens, with a 26.449-second provider fetch. Seven attempted turns took 288.112 seconds combined. Turn latency nearest-rank p50 was **42.862 s** and p95 was **54.579 s**; the same p50/p95 values hold for the six committed turns.

| Turn | Optional Craft cards in private plan | Orin Character Model | Promise-related Memory IDs |
| ---: | --- | --- | ---: |
| 1 | afterglow-rhythm; living-characters | present | 0 |
| 2 | none | present | 3 |
| 3 | living-characters; promises-and-relationships | present | 5 |
| 4 | none | present | 4 |
| 5 | none | present | 4 |
| 6 | none | present | 3 |
| 7 | afterglow-rhythm; living-characters | present | 4 |

The requested eight-turn success criteria were **not met**. The synthetic final state remained at the Old Mine with Mara 6/10 HP, Focus 1/2, oil 0, Stalker 0/8, and world time 15. The return trip and its second positive time advance were not tested. No interpretation of rejected or unrun proposals as committed gameplay is made.
