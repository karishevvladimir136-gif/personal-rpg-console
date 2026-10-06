# Astra-primary P1 synthetic smoke diagnostic

**Status:** Diagnostic only. The first-turn failure reproduced; no production repair was made.

## Run identity and limits

- Frozen starting SHA: `bfa63545d40ed204ecb987720c5f973a2e516b96` on `codex/astra-primary-production-p1`.
- Fresh disposable PGlite migration-38 fixture and fresh synthetic operation: `a720beaf-4983-49c6-bc8c-a7f2e45d1670`.
- Literal input: `Orin, let's go back to the Old Mine and deal with this properly. I head there with him.`
- One direct `gpt-6-astra` request, reasoning `high`, service tier `default`. No retry, later turn, narrator request, or other provider request occurred.
- HTTP `200`, response status `completed`; 3,474 input tokens, 1,173 output tokens, including 929 reasoning tokens and zero cached input tokens. Fetch plus cloned-body capture took **21.985 seconds**. Estimated Standard spend: **US $0.0934**.
- The exact `output_text` below was 722 bytes, untruncated and unredacted. The diagnostic capture omitted request headers, the API key, and the rest of the provider response.

## Exact raw Astra `output_text`

```json
{"type":"final","call":null,"final":{"schemaVersion":1,"worldMinutes":0,"changes":[{"family":"public_state","id":"780dcadb-e357-4932-a169-4d046e67b129","expectedRevision":2,"hp":null,"resources":null,"quantity":null,"locationId":"d34490fc-a737-4d55-82ee-1387b333effa","position":null}],"outcomes":[{"kind":"travel","entityIds":["9e8f7495-524a-4086-94fb-749f3af312ef","6a3d2f9f-221e-47a2-92cb-d1e5b300fddf"],"itemIds":[],"text":"Orin keeps his agreement and accompanies you along the known mine road. You reach the Old Mine together, the old stone lamp coming into view.\n\n“My father’s map,” Orin says, turning toward you. “Let’s talk about that promise.”\n\nHe waits for you to speak."}],"privatePatches":[]}}
```

## Exact parsed `provider.next` decision

The production adapter returned this decision without a parse error:

```json
{"type":"final","call":null,"final":{"worldMinutes":0,"changes":[{"family":"public_state","id":"780dcadb-e357-4932-a169-4d046e67b129","expectedRevision":2,"values":{"current_location_id":"d34490fc-a737-4d55-82ee-1387b333effa"}}],"outcomes":[{"kind":"travel","entityIds":["9e8f7495-524a-4086-94fb-749f3af312ef","6a3d2f9f-221e-47a2-92cb-d1e5b300fddf"],"itemIds":[],"text":"Orin keeps his agreement and accompanies you along the known mine road. You reach the Old Mine together, the old stone lamp coming into view.\n\n“My father’s map,” Orin says, turning toward you. “Let’s talk about that promise.”\n\nHe waits for you to speak."}],"privatePatches":[]}}
```

## Ordered boundary trace

| Order | Observed call | Result |
| ---: | --- | --- |
| 1–2 | `store.begin` | Entered; returned `pending`. Literal input and `astra-primary-v1` were durably pinned. |
| 3–4 | `store.claim` | Entered; returned a claim. |
| 5–8 | `provider.next` → HTTP request | Entered; HTTP 200 response captured; structured JSON extracted; `provider.next` returned parsed `final`. |
| 9–10 | `store.fail` | Entered; returned `failed`. |

Boundary **A** (response received), **B** (structured JSON extracted), and **C** (`parseDecision` returned) completed. Boundary **D** (`validateFinal`) did **not** complete. There was no `store.checkpoint` call to persist an Astra final proposal, no narration request or checkpoint (**E–G**), and no commit attempt or completion (**H–I**). The runtime calls `validateFinal` after a parsed final response and before that checkpoint; the intervening `call === null` guard is satisfied by the captured decision.

## Exact failure and disposable private snapshot

- Safe turn failure category: **`validation`**, `retryable=false`.
- Disposable SQL rejection: **none**. The captured SQL error list was empty. No `commit` SQL action was attempted; the `fail` action persisted normally.
- Private `rpg_private.turns` row for the synthetic operation: `runtime_identity=astra-primary-v1`, `status=failed`, `failure=validation`, `retryable=false`, `expected_revision=20`, source present.
- Checkpoint keys: `astraPrimary`, `checks`, `feedback`, `narration`, `plan`, `resolution`, `usage`. `astraPrimary.toolReceipts=[]`; `astraPrimary.finalProposal=null`; resolution absent; narration absent.
- No tool result, dice result, state patch, Location move, or turn commit was applied.

## Diagnosis and limit of inference

The current run identifies a concrete mismatch in the production `validateFinal` boundary: the parsed proposal changes `public_state.current_location_id` but keeps `worldMinutes=0`. The existing validator requires a Location change to have `next.worldMinutes > source.runtime.worldMinutes`. The authoritative runtime clock cannot be negative, so zero minutes cannot satisfy that travel rule. This mismatch necessarily rejects the captured proposal before the final checkpoint. The smallest likely future repair is to make the existing travel-time requirement explicit to the private proposal authoring contract, while retaining the validator and requiring a genuinely increasing authoritative time value. **No prompt, schema, validator, migration, or production runtime was changed here.**

This fresh run reproduced the prior broad pattern—one provider response followed by failure before narration. The original run did not preserve its proposal, so this evidence does **not** establish that the original failure had the same specific cause.

## Harness verification and scope

The harness-only tests passed **4/4**. They verify cloned-response preservation, bounded/redacted capture with no recorded Authorization value, request/spend ceilings, actual provider parse-failure tracing, unchanged TurnStore calls, and raw disposable SQL failure capture. Changed-file ESLint passed with zero warnings; the harness script passed the Node syntax check. The full repository suite was not rerun because production code did not change. The real owner database, owner gameplay, deployment, and local/remote `main` were untouched.
