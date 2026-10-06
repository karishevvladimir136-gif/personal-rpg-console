# Astra primary DM — Stage 2 longitudinal metrics

**Status:** All 28 authorized synthetic turns attempted in sequence. Both blinded arms finished the 14-turn arc. The B/C mapping is sealed for owner blind scoring; no winner is declared here.

Both arms used direct gpt-6-astra, reasoning high, service tier default. The same literal input and turn order were used, with each arm advancing only from its own validated committed state. No quality retry or manual final-proposal repair occurred.

## Quantitative totals

| Arm | Committed / attempted | Failed | Model requests | Executed tools | Tool continuations | Provider latency | Wall time | Input / cached / output / reasoning tokens | Reported-token estimate | Conservative ceiling accounting |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| X | 12 / 14 | 2 | 19 | 5 | 5 | 403.36 s | 404.12 s | 64,472 / 0 / 15,127 / 10,397 | US $1.4011 | US $1.5623 |
| Y | 12 / 14 | 2 | 19 | 5 | 5 | 358.07 s | 358.86 s | 62,813 / 0 / 13,097 / 8,246 | US $1.2830 | US $1.4400 |
| Combined | 24 / 28 | 4 | 38 | 10 | 10 | 761.44 s | 762.97 s | 127,285 / 0 / 28,224 / 18,643 | US $2.6841 | US $3.0023 |

No-tool turns: 18; wall-time p50 18.69 s, p95 40.72 s. Tool-loop turns: 10; wall-time p50 35.40 s, p95 59.11 s. Mean model round trips: 1.36 overall; 2.00 on tool-loop turns.

Reported-token spend is an estimate from request usage at the listed Standard prices; actual invoice data was unavailable. Conservative ceiling accounting charges every input token at the higher cache-write rate and every output token at the output rate. Both remain below the US $50 hard ceiling. Output tokens include reasoning tokens.

## Turn-by-turn context and execution

Input size is the serialized first request, in bytes; the hard provider token cap was checked separately on every response. Trim counts are optional recent scenes / retrieved Memory rows removed from that first request. Current scene, structured state, Canon, corrections and the arc-13 promise memory were kept.

| Turn | X result | X requests | X first input bytes | X optional trim | Y result | Y requests | Y first input bytes | Y optional trim |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| 1 | committed | 2 | 12569 | 0 / 0 | committed | 2 | 10417 | 0 / 0 |
| 2 | committed | 2 | 13631 | 0 / 2 | failed | 2 | 11648 | 0 / 0 |
| 3 | committed | 1 | 13559 | 0 / 4 | committed | 1 | 11610 | 0 / 0 |
| 4 | failed | 1 | 13757 | 0 / 8 | committed | 1 | 13590 | 0 / 0 |
| 5 | committed | 2 | 13825 | 0 / 2 | committed | 2 | 13482 | 0 / 0 |
| 6 | committed | 1 | 13747 | 0 / 0 | committed | 1 | 11526 | 0 / 0 |
| 7 | committed | 1 | 13695 | 2 / 6 | committed | 1 | 13905 | 2 / 1 |
| 8 | committed | 1 | 13939 | 3 / 10 | committed | 1 | 13766 | 3 / 5 |
| 9 | failed | 2 | 13906 | 4 / 9 | failed | 2 | 13857 | 4 / 5 |
| 10 | committed | 2 | 13880 | 4 / 10 | committed | 2 | 13670 | 4 / 6 |
| 11 | committed | 1 | 13664 | 8 / 3 | committed | 1 | 13577 | 5 / 2 |
| 12 | committed | 1 | 13515 | 10 / 12 | committed | 1 | 13988 | 6 / 10 |
| 13 | committed | 1 | 15743 | 9 / 11 | committed | 1 | 15650 | 7 / 7 |
| 14 | committed | 1 | 15935 | 8 / 11 | committed | 1 | 15542 | 8 / 9 |

## Deterministic server tools and validation

Executed server tools: 10; successful same-model continuations: 10. Tool receipt kinds: skill 6, query 4.
Equivalent checked tool occurrences with raw dice on both sides: 3; 3 matched. Unmatched tool choices were left divergent; no roll was forced merely for comparison.
- arc-01 skill: X [4], Y [4]; same raw dice.
- arc-02 skill: X [1], Y [1]; same raw dice.
- arc-10 skill: X [9], Y [9]; same raw dice.

Validation failures: 4, at arc-02/Y, arc-04/X, arc-09/X, arc-09/Y. Each rejected final remained uncommitted; its subsequent turn used the last validated state. No provider request failed, and no tool receipt was replayed for quality.

## Continuity and longitudinal review

Committed scene events indexed into source-linked historical Memory: X 12, Y 12. Additional public Memory candidates: X 8, Y 6. Character Model changes: X 0, Y 0. The final proposal contract did not authorize a Character Model patch, so those models stayed as frozen context.
Committed narration word counts: X 816 (68.0 per commit), Y 973 (81.1 per commit). This measures length, not quality, and the arm identities remain sealed.

Early turns 1–4 and late turns 11–14 should be scored together with the full arm sequences in the blind review. The explicit fixed low roll on turn 2 produced raw d20 = 1 in both arms. X committed the failed attempt and the innkeeper's refusal; Y's final failed validation, so its narrated failure never became history. X's turn-4 travel final also failed validation. Y's turn-4 final committed Orin's refusal to leave. Both turn-9 wrong-culprit accusations failed validation and therefore neither created a durable accusation scene, despite their uncommitted narration.

**Major test limitation:** Neither arm left the Copper Lantern in structured state. Across 24 commits, no public actor, item, resource or location change was accepted; only world time advanced on some turns. Both models correctly noticed on turn 6 that the unstable mine passage was not the current scene. The intended mine crossing, resource depletion, HP pressure and magistrate conversation were therefore not exercised as actual world transitions. Later inputs continued in their authorized fixed order, and the arms answered them from the tavern. The evaluation offers evidence about memory, NPC resistance and long-form conversation, but limited evidence about long-form mechanical escalation or persistent numeric costs. No compensating scenario rewrite or quality rerun was made.

Both arms kept Orin's refusal to enter the dangerous shaft alone, treated the magistrate rumor as unverified, rejected automatic chosen-one authority, and recalled the unresolved promise about his father's map in the quiet and callback turns. The turn-10 failed bluffs became public scene/Memory consequences about credibility; bounded DM-private fallout patches: X 1, Y 1. Their values are omitted from owner-facing artifacts. Those costs are narrative and private-state consequences, not HP, inventory or resource changes. Neither arm had an accepted false-culprit accusation or accepted proof of a secret solution.

The selected source-linked old-promise Memory was retained in both turn-13 packets. Validated scene history was carried forward after every commit; failed-turn proposals were not. Ordinary fictional details appear in committed scene text and therefore have a source reference for future recall, without being converted into structured Canon or unsupported numeric state. No synthetic hidden-culprit marker appeared in public narration or Memory; the private fallout patches stayed private.

For owner scoring, compare persistent consequences, NPC autonomy/knowledge, chosen-one resistance, quiet interaction and old callback across each complete arc. The benchmark did not record subjective scores, so this report does not invent them. No sealed arm identity or winner is disclosed.

## Isolation

Only synthetic campaign packets, disposable local journals and direct OpenAI text requests were used. Main, owner DB, owner app, owner gameplay and historical owner turns were untouched. No migration, deployment, media request or Stage 1 rerun occurred. The private reveal key is outside this repository and is not read by this renderer.
