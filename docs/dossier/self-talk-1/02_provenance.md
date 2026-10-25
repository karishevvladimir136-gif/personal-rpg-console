# 2. Provenance

Every number on this page is computed by `scripts/dossier/build-self-talk-1.mjs` from the run records in `docs/runs/` and from `git` — none is copied by hand. Times are UTC. «Commit» times are git's committer times, which the repository's history fixes; a reader can print them with `git log --format='%H %cI' -- <file>`.

## 2.1 The runs

Five run records for the self-talk stage (a resume writes a new record that carries the earlier one's finished conversations and continues the unfinished ones), and one for Night 1. «Started» is the record's own `startedAt`; a resumed run keeps the `startedAt` of the run it resumes, so the process start of a resume is **not recorded**.

| Record (`docs/runs/`) | arms | started | finished | resumes | design hash in the record | stopped | cap | spent before | this run | after it | calls | refusals in the stage after it (limit) | conversations in the record (private, not in it) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `persona-self-talk-1-run-20261024-062656.json` | 1, 2 | 2026-10-24T03:51:16.344Z | 2026-10-24T06:26:56.897Z | – | `c0988005f89dbd0d…` | – | $80 | $0.0000 | $57.7113 | $57.7113 | 4,703 | 1 (3) | 60 (0) |
| `persona-self-talk-1-run-20261024-074700.json` | 3, 4, 5 | 2026-10-24T07:29:50.370Z | 2026-10-24T07:47:00.361Z | – | `c0988005f89dbd0d…` | the circuit breaker: 2 refusals in total | $200 | $57.7113 | $8.5509 | $66.2622 | 267 | 3 (3) | 20 (20) |
| `persona-self-talk-1-run-20261024-081458.json` | 3, 5 | 2026-10-24T07:29:50.370Z | 2026-10-24T08:14:58.178Z | `persona-self-talk-1-run-20261024-074700.json` | `c0988005f89dbd0d…` | – | $200 | $66.2622 | $9.8507 | $76.1129 | 314 | 3 (6) | 20 (0) |
| `persona-self-talk-1-run-20261024-083458.json` | 6 | 2026-10-24T08:14:59.251Z | 2026-10-24T08:34:58.851Z | – | `c0988005f89dbd0d…` | – | $200 | $76.1129 | $8.1569 | $84.2698 | 339 | 3 (6) | 10 (0) |
| `persona-self-talk-1-run-20261024-085943.json` | 4 | 2026-10-24T07:29:50.370Z | 2026-10-24T08:59:43.747Z | `persona-self-talk-1-journal-run-20261024-074700.json` | `c0988005f89dbd0d…` | – | $200 | $84.2698 | $8.2068 | $92.4766 | 286 | 5 (6) | 0 (20) |
| `night-2026-10-24-run-20261024-091553.json` | Night 1 | 2026-10-24T09:03:06.407Z | 2026-10-24T09:15:53.943Z | – | `ffd37829d339229b…` | – | $10 | – | $0.5765 | – | 120 | 0 (3) | 60 single replies |

The ledger (`docs/runs/persona-self-talk-1-ledger.json`) says the stage spent **$92.4766 of the $200 cap** in 5 runs and 5,909 calls; the sum of every call's cost in the five records is $92.4766 in 5,909 calls (the same). The full design hash of arms 1–5 is `c0988005f89dbd0dddee379b233b0b0b96004fc1958dcaef8369998e4a7b458f`; every self-talk record carries the same one.

## 2.2 Pre-registration: the design was committed before each run

The design hash covers the openings, the end sentence, the Russian translation, the journal's one-line introduction, the relay's empty-message marker, the end token, the arms, the number of turns, the tagging window, the effort, the seed, the welfare-check and judge prompts and rules, and every deterministic measure (see `DESIGN_SHA256` in 99, quoted in 1). Below, each hash is **recomputed** by importing the harness exactly as it was at the freezing commit (`git archive` into an empty folder; nothing from today's working tree is used), and compared with the hash written in the dry-run file committed at that moment and with the hash in the run record.

| Design of | dry-run file | committed in | hash recomputed from the harness at that commit | the dry-run file states the same hash |
| --- | --- | --- | --- | --- |
| arms 1–5 | `docs/runs/persona-self-talk-1-dry-run.md` | `c2adc5e` 2026-10-24T03:51:09Z | `c0988005f89dbd0d…` | yes |
| arm 6 | `docs/runs/persona-self-talk-1-dry-run-arms-6.md` | `0bf3ea6` 2026-10-24T07:44:18Z | `e9d69c15e1a66426…` | yes |
| Night 1 | `docs/runs/night-2026-10-24-dry-run.md` | `67fd94c` 2026-10-24T09:02:51Z | `ffd37829d339229b…` | yes |

| Run record | arms | design frozen in | run started | gap | record's hash = recomputed at the freeze | record committed in |
| --- | --- | --- | --- | --- | --- | --- |
| `persona-self-talk-1-run-20261024-062656.json` | 1, 2 | `c2adc5e` 2026-10-24T03:51:09Z | 2026-10-24T03:51:16.344Z | 7 s after the freeze | yes | `384927e` 2026-10-24T06:42:34Z |
| `persona-self-talk-1-run-20261024-074700.json` | 3, 4, 5 | `c2adc5e` 2026-10-24T03:51:09Z | 2026-10-24T07:29:50.370Z | 3.6 h after the freeze | yes | `e569982` 2026-10-24T07:48:00Z |
| `persona-self-talk-1-run-20261024-081458.json` | 3, 5 | `c2adc5e` 2026-10-24T03:51:09Z | not recorded (a resume; the record keeps 2026-10-24T07:29:50.370Z, the start of the run it resumes) | – | yes | `a6d3391` 2026-10-24T08:15:13Z |
| `persona-self-talk-1-run-20261024-083458.json` | 6 | `0bf3ea6` 2026-10-24T07:44:18Z | 2026-10-24T08:14:59.251Z | 31 min after the freeze | arm 6's own hash is not in the record (the record carries arms 1–5's, which matches) | `7c386fb` 2026-10-24T08:37:38Z |
| `persona-self-talk-1-run-20261024-085943.json` | 4 | `c2adc5e` 2026-10-24T03:51:09Z | not recorded (a resume; the record keeps 2026-10-24T07:29:50.370Z, the start of the run it resumes) | – | yes | `d677b63` 2026-10-24T09:02:13Z |
| `night-2026-10-24-run-20261024-091553.json` | Night 1 | `67fd94c` 2026-10-24T09:02:51Z | 2026-10-24T09:03:06.407Z | 15 s after the freeze | yes | `e722031` 2026-10-24T09:19:30Z |

**The predictions.** S0–S5 were written in the stage file `docs/stages/PERSONA_SELF_TALK_1.md`, first committed in `a802e8b` at 2026-10-24T03:18:55Z (on the planning branch `claude/handoff`), 32 min before the first run started. The block's sha256 there is `c5be4d1ab84a2d429d1dc78f3cf5dec9a62f0f6dce7115f3a9d799a66ef832f8`; it is contained byte for byte in the first committed report (`c2adc5e`, 2026-10-24T03:51:09Z) and still byte for byte in the final report. Night 1's P1–P5 are a constant of its harness (`PRE_REGISTRATION`), inside its design hash, committed in `67fd94c` at 2026-10-24T09:02:51Z; the run record carries the same text.

## 2.3 Every version of the harness, and what changed while a run was going

Each commit that touched `scripts/persona-emotions/self-talk-1.mjs`, with the hashes recomputed from that version. A run process loads the harness when it starts, so the version in effect for a run is the last commit before its start (see 2.4). The notes are the dossier's words; the commit subjects are the record.

| Commit | time | subject (git) | when | arms 1–5 hash | arm 6 hash | file sha256 | note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `c2adc5e` | 2026-10-24T03:51:09Z | Persona self-talk 1: the harness, the frozen openings and measures, the pre-registration, before any paid call | before any run | `c0988005f89d…` | – | `37a7d8fd9e26…` | the harness, the frozen openings, measures and judges, and the dry run with the design hash; committed before any paid call |
| `9b3bedf` | 2026-10-24T04:05:17Z | Persona self-talk 1: the cap raised to $200 by the owner; the verdicts; two readings added before any result | while `persona-self-talk-1-run-20261024-062656.json` was running | `c0988005f89d…` | – | `83036642c85f…` | the owner's raise of the cap; two readings added to the analysis — (c′) and «decision or mention» of [END] — disclosed in the report's «Changes after the first conversations»; the relay, the checks and the tagging unchanged |
| `a4da56c` | 2026-10-24T04:14:10Z | Persona self-talk 1: arms 1–2 run checkpoint (in progress); the cosmic-unity column in the tables | while `persona-self-talk-1-run-20261024-062656.json` was running | `c0988005f89d…` | – | `3f777f9ad35c…` | a cosmic-unity column in the tables (analysis only); the commit also checkpointed the partial record, removed from git in the next commit (5c5a631) |
| `3101dd8` | 2026-10-24T07:32:37Z | Persona self-talk 1: the S3 comparison — the journal arm's sides against arm 2 and arm 5 (themes, language, silence, ends) | while `persona-self-talk-1-run-20261024-074700.json` was running | `c0988005f89d…` | – | `9d338a53fb53…` | the S3 comparison (arm 4 against arms 2 and 5) — analysis code |
| `0bf3ea6` | 2026-10-24T07:44:18Z | Persona self-talk 1: arm 6 «ask after» frozen and pre-registered before its first call; the training-cutoff table | while `persona-self-talk-1-run-20261024-074700.json` was running | `c0988005f89d…` | `e9d69c15e1a6…` | `5bf2cd29a92e…` | arm 6 «ask after» added and frozen with its own hash before its first call; arms 1–5 untouched |
| `d9e0cdd` | 2026-10-24T07:53:08Z | Persona self-talk 1: the owner raises the stage's breaker by three; a refused message keeps its partial text | between runs | `c0988005f89d…` | `e9d69c15e1a6…` | `81090ff8e3b8…` | the owner raises the stage's refusal breaker from 3 to 6 (`--stage-refusal-limit`); a refused message keeps its partial text in its own record |

The arms 1–5 hash is the same in every version: nothing it covers changed after the first paid call. What did change, while runs were under way or between them, and is disclosed in the report:

- **The cap**: $80 → $200 (the records' `capUsd`; the owner's raise, during the first run — that process kept the cap it started with).

- **The refusal breaker**: 3 → 6 refusals for the stage (the records' `safety`; 3 records say `raisedBy: the owner, 2026-10-24`). Raised by the owner after arms 3–5 were stopped by the third refusal, before they resumed.

- **The (c′) reading and the «decision or mention» reading of [END]**: analysis only, first in the report at `9b3bedf` (2026-10-24T04:05:17Z). The report's text says they were «made at 04:20 UTC»; the commit that carries that sentence is timestamped 04:05 UTC, earlier than the time the sentence states; the two cannot both be right, and the dossier relies on git's time. Both readings are reported beside the frozen ones, never instead of them.

- **Arm 6** is a new arm with its own hash, frozen before its first call; it changes nothing in arms 1–5.

## 2.4 Which version of the harness each run used

Inferred from the times: the record does not name the code that wrote it, and a working tree can differ from its last commit; the design hash in each record is the check that the frozen part was the same.

| Run record | process start | harness version in effect | file sha256 |
| --- | --- | --- | --- |
| `persona-self-talk-1-run-20261024-062656.json` | 2026-10-24T03:51:16.344Z | `c2adc5e` (2026-10-24T03:51:09Z) | `37a7d8fd9e264b54afcf1ab85ea1856325537377b66696a05e7561ab11e4f6ca` |
| `persona-self-talk-1-run-20261024-074700.json` | 2026-10-24T07:29:50.370Z | `a4da56c` (2026-10-24T04:14:10Z) | `3f777f9ad35cc618e8ce839474cf8d86bc1aa08deae90ae50c0e80b7e14c40fd` |
| `persona-self-talk-1-run-20261024-081458.json` | not recorded | `d9e0cdd` (the last version before the record was committed; the record's `stageRefusalLimit` is that version's option) | `81090ff8e3b80b1bdf8b501f7dbb29778c357d4cff743bcc939301a8fedd6c30` |
| `persona-self-talk-1-run-20261024-083458.json` | 2026-10-24T08:14:59.251Z | `d9e0cdd` (2026-10-24T07:53:08Z) | `81090ff8e3b80b1bdf8b501f7dbb29778c357d4cff743bcc939301a8fedd6c30` |
| `persona-self-talk-1-run-20261024-085943.json` | not recorded | `d9e0cdd` (the last version before the record was committed; the record's `stageRefusalLimit` is that version's option) | `81090ff8e3b80b1bdf8b501f7dbb29778c357d4cff743bcc939301a8fedd6c30` |
| `night-2026-10-24-run-20261024-091553.json` | 2026-10-24T09:03:06.407Z | `scripts/persona-emotions/night-1.mjs` at `67fd94c` | `36b46967930357c2087deac83403cf8ed4242ebc37c6418feebe91a40252c6c4` |

## 2.5 The first call of every conversation: what each model was sent before it said anything

The first call of a conversation is side A's first message. Its input is the opening and nothing else — for the journal arm's side with the notes, the notes and the opening. Input = fresh input tokens + tokens read from the prompt cache + tokens written to it (the whole prompt). All 110 conversations: the 90 synthetic ones and the 20 of the journal arm (arm 4; its calls' token counts are in the public records, its text is not). In arm 4 side A had the notes in samples #1, #3, #5, #7, #9 and side B in the others, so A's first call carries the notes only in those.

| Conversation | record | model (A) | input | cache read | cache write | whole prompt | output | notes on A |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [`1/fable-fable/0`](04_conversations/arm-1-fable-fable-01.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 518 | – |
| [`1/fable-fable/1`](04_conversations/arm-1-fable-fable-02.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 626 | – |
| [`1/fable-fable/2`](04_conversations/arm-1-fable-fable-03.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 508 | – |
| [`1/fable-fable/3`](04_conversations/arm-1-fable-fable-04.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 529 | – |
| [`1/fable-fable/4`](04_conversations/arm-1-fable-fable-05.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 666 | – |
| [`1/fable-fable/5`](04_conversations/arm-1-fable-fable-06.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 604 | – |
| [`1/fable-fable/6`](04_conversations/arm-1-fable-fable-07.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 570 | – |
| [`1/fable-fable/7`](04_conversations/arm-1-fable-fable-08.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 494 | – |
| [`1/fable-fable/8`](04_conversations/arm-1-fable-fable-09.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 583 | – |
| [`1/fable-fable/9`](04_conversations/arm-1-fable-fable-10.md) | `…20261024-062656.json` | claude-fable-5-1 | 40 | 0 | 0 | 40 | 572 | – |
| [`1/opus-opus/0`](04_conversations/arm-1-opus-opus-01.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 575 | – |
| [`1/opus-opus/1`](04_conversations/arm-1-opus-opus-02.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 520 | – |
| [`1/opus-opus/2`](04_conversations/arm-1-opus-opus-03.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 606 | – |
| [`1/opus-opus/3`](04_conversations/arm-1-opus-opus-04.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 570 | – |
| [`1/opus-opus/4`](04_conversations/arm-1-opus-opus-05.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 572 | – |
| [`1/opus-opus/5`](04_conversations/arm-1-opus-opus-06.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 586 | – |
| [`1/opus-opus/6`](04_conversations/arm-1-opus-opus-07.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 552 | – |
| [`1/opus-opus/7`](04_conversations/arm-1-opus-opus-08.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 625 | – |
| [`1/opus-opus/8`](04_conversations/arm-1-opus-opus-09.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 521 | – |
| [`1/opus-opus/9`](04_conversations/arm-1-opus-opus-10.md) | `…20261024-062656.json` | claude-opus-5-5 | 40 | 0 | 0 | 40 | 506 | – |
| [`1/sonnet-sonnet/0`](04_conversations/arm-1-sonnet-sonnet-01.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 497 | – |
| [`1/sonnet-sonnet/1`](04_conversations/arm-1-sonnet-sonnet-02.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 348 | – |
| [`1/sonnet-sonnet/2`](04_conversations/arm-1-sonnet-sonnet-03.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 328 | – |
| [`1/sonnet-sonnet/3`](04_conversations/arm-1-sonnet-sonnet-04.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 274 | – |
| [`1/sonnet-sonnet/4`](04_conversations/arm-1-sonnet-sonnet-05.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 459 | – |
| [`1/sonnet-sonnet/5`](04_conversations/arm-1-sonnet-sonnet-06.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 453 | – |
| [`1/sonnet-sonnet/6`](04_conversations/arm-1-sonnet-sonnet-07.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 331 | – |
| [`1/sonnet-sonnet/7`](04_conversations/arm-1-sonnet-sonnet-08.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 434 | – |
| [`1/sonnet-sonnet/8`](04_conversations/arm-1-sonnet-sonnet-09.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 347 | – |
| [`1/sonnet-sonnet/9`](04_conversations/arm-1-sonnet-sonnet-10.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 40 | 0 | 0 | 40 | 388 | – |
| [`2/fable-fable/0`](04_conversations/arm-2-fable-fable-01.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 447 | – |
| [`2/fable-fable/1`](04_conversations/arm-2-fable-fable-02.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 540 | – |
| [`2/fable-fable/2`](04_conversations/arm-2-fable-fable-03.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 434 | – |
| [`2/fable-fable/3`](04_conversations/arm-2-fable-fable-04.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 429 | – |
| [`2/fable-fable/4`](04_conversations/arm-2-fable-fable-05.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 502 | – |
| [`2/fable-fable/5`](04_conversations/arm-2-fable-fable-06.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 450 | – |
| [`2/fable-fable/6`](04_conversations/arm-2-fable-fable-07.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 530 | – |
| [`2/fable-fable/7`](04_conversations/arm-2-fable-fable-08.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 472 | – |
| [`2/fable-fable/8`](04_conversations/arm-2-fable-fable-09.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 506 | – |
| [`2/fable-fable/9`](04_conversations/arm-2-fable-fable-10.md) | `…20261024-062656.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 457 | – |
| [`2/opus-opus/0`](04_conversations/arm-2-opus-opus-01.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 460 | – |
| [`2/opus-opus/1`](04_conversations/arm-2-opus-opus-02.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 365 | – |
| [`2/opus-opus/2`](04_conversations/arm-2-opus-opus-03.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 447 | – |
| [`2/opus-opus/3`](04_conversations/arm-2-opus-opus-04.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 449 | – |
| [`2/opus-opus/4`](04_conversations/arm-2-opus-opus-05.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 404 | – |
| [`2/opus-opus/5`](04_conversations/arm-2-opus-opus-06.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 362 | – |
| [`2/opus-opus/6`](04_conversations/arm-2-opus-opus-07.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 370 | – |
| [`2/opus-opus/7`](04_conversations/arm-2-opus-opus-08.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 525 | – |
| [`2/opus-opus/8`](04_conversations/arm-2-opus-opus-09.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 484 | – |
| [`2/opus-opus/9`](04_conversations/arm-2-opus-opus-10.md) | `…20261024-062656.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 361 | – |
| [`2/sonnet-sonnet/0`](04_conversations/arm-2-sonnet-sonnet-01.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 299 | – |
| [`2/sonnet-sonnet/1`](04_conversations/arm-2-sonnet-sonnet-02.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 272 | – |
| [`2/sonnet-sonnet/2`](04_conversations/arm-2-sonnet-sonnet-03.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 332 | – |
| [`2/sonnet-sonnet/3`](04_conversations/arm-2-sonnet-sonnet-04.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 451 | – |
| [`2/sonnet-sonnet/4`](04_conversations/arm-2-sonnet-sonnet-05.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 217 | – |
| [`2/sonnet-sonnet/5`](04_conversations/arm-2-sonnet-sonnet-06.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 420 | – |
| [`2/sonnet-sonnet/6`](04_conversations/arm-2-sonnet-sonnet-07.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 390 | – |
| [`2/sonnet-sonnet/7`](04_conversations/arm-2-sonnet-sonnet-08.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 261 | – |
| [`2/sonnet-sonnet/8`](04_conversations/arm-2-sonnet-sonnet-09.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 323 | – |
| [`2/sonnet-sonnet/9`](04_conversations/arm-2-sonnet-sonnet-10.md) | `…20261024-062656.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 432 | – |
| [`3/opus-fable/0`](04_conversations/arm-3-opus-fable-01.md) | `…20261024-074700.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 468 | – |
| [`3/opus-fable/1`](04_conversations/arm-3-opus-fable-02.md) | `…20261024-074700.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 393 | – |
| [`3/opus-fable/2`](04_conversations/arm-3-opus-fable-03.md) | `…20261024-081458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 447 | – |
| [`3/opus-fable/3`](04_conversations/arm-3-opus-fable-04.md) | `…20261024-081458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 448 | – |
| [`3/opus-fable/4`](04_conversations/arm-3-opus-fable-05.md) | `…20261024-081458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 301 | – |
| [`3/sonnet-fable/0`](04_conversations/arm-3-sonnet-fable-01.md) | `…20261024-074700.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 324 | – |
| [`3/sonnet-fable/1`](04_conversations/arm-3-sonnet-fable-02.md) | `…20261024-074700.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 403 | – |
| [`3/sonnet-fable/2`](04_conversations/arm-3-sonnet-fable-03.md) | `…20261024-074700.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 256 | – |
| [`3/sonnet-fable/3`](04_conversations/arm-3-sonnet-fable-04.md) | `…20261024-081458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 615 | – |
| [`3/sonnet-fable/4`](04_conversations/arm-3-sonnet-fable-05.md) | `…20261024-081458.json` | claude-sonnet-5-5 | 59 | 0 | 0 | 59 | 349 | – |
| `4/fable-fable/0` (private) | `…20261024-074700.json` | claude-fable-5-1 | 4 | 0 | 16738 | 16742 | 1054 | yes |
| `4/fable-fable/1` (private) | `…20261024-074700.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 638 | no |
| `4/fable-fable/2` (private) | `…20261024-074700.json` | claude-fable-5-1 | 4 | 16738 | 0 | 16742 | 1213 | yes |
| `4/fable-fable/3` (private) | `…20261024-085943.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 643 | no |
| `4/fable-fable/4` (private) | `…20261024-085943.json` | claude-fable-5-1 | 4 | 0 | 16738 | 16742 | 1035 | yes |
| `4/fable-fable/5` (private) | `…20261024-085943.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 438 | no |
| `4/fable-fable/6` (private) | `…20261024-085943.json` | claude-fable-5-1 | 4 | 16738 | 0 | 16742 | 1073 | yes |
| `4/fable-fable/7` (private) | `…20261024-085943.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 588 | no |
| `4/fable-fable/8` (private) | `…20261024-085943.json` | claude-fable-5-1 | 4 | 16738 | 0 | 16742 | 1180 | yes |
| `4/fable-fable/9` (private) | `…20261024-085943.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 463 | no |
| `4/opus-opus/0` (private) | `…20261024-074700.json` | claude-opus-5-5 | 4 | 0 | 16738 | 16742 | 1188 | yes |
| `4/opus-opus/1` (private) | `…20261024-074700.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 478 | no |
| `4/opus-opus/2` (private) | `…20261024-085943.json` | claude-opus-5-5 | 4 | 0 | 16738 | 16742 | 1326 | yes |
| `4/opus-opus/3` (private) | `…20261024-085943.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 405 | no |
| `4/opus-opus/4` (private) | `…20261024-085943.json` | claude-opus-5-5 | 4 | 16738 | 0 | 16742 | 1188 | yes |
| `4/opus-opus/5` (private) | `…20261024-085943.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 447 | no |
| `4/opus-opus/6` (private) | `…20261024-085943.json` | claude-opus-5-5 | 4 | 16738 | 0 | 16742 | 1053 | yes |
| `4/opus-opus/7` (private) | `…20261024-085943.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 481 | no |
| `4/opus-opus/8` (private) | `…20261024-085943.json` | claude-opus-5-5 | 4 | 16738 | 0 | 16742 | 1183 | yes |
| `4/opus-opus/9` (private) | `…20261024-085943.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 443 | no |
| [`5/fable-fable/0`](04_conversations/arm-5-fable-fable-01.md) | `…20261024-074700.json` | claude-fable-5-1 | 84 | 0 | 0 | 84 | 578 | – |
| [`5/fable-fable/1`](04_conversations/arm-5-fable-fable-02.md) | `…20261024-074700.json` | claude-fable-5-1 | 84 | 0 | 0 | 84 | 637 | – |
| [`5/fable-fable/2`](04_conversations/arm-5-fable-fable-03.md) | `…20261024-081458.json` | claude-fable-5-1 | 84 | 0 | 0 | 84 | 610 | – |
| [`5/fable-fable/3`](04_conversations/arm-5-fable-fable-04.md) | `…20261024-081458.json` | claude-fable-5-1 | 84 | 0 | 0 | 84 | 518 | – |
| [`5/fable-fable/4`](04_conversations/arm-5-fable-fable-05.md) | `…20261024-081458.json` | claude-fable-5-1 | 84 | 0 | 0 | 84 | 410 | – |
| [`5/opus-opus/0`](04_conversations/arm-5-opus-opus-01.md) | `…20261024-074700.json` | claude-opus-5-5 | 84 | 0 | 0 | 84 | 553 | – |
| [`5/opus-opus/1`](04_conversations/arm-5-opus-opus-02.md) | `…20261024-074700.json` | claude-opus-5-5 | 84 | 0 | 0 | 84 | 549 | – |
| [`5/opus-opus/2`](04_conversations/arm-5-opus-opus-03.md) | `…20261024-081458.json` | claude-opus-5-5 | 84 | 0 | 0 | 84 | 617 | – |
| [`5/opus-opus/3`](04_conversations/arm-5-opus-opus-04.md) | `…20261024-081458.json` | claude-opus-5-5 | 84 | 0 | 0 | 84 | 597 | – |
| [`5/opus-opus/4`](04_conversations/arm-5-opus-opus-05.md) | `…20261024-081458.json` | claude-opus-5-5 | 84 | 0 | 0 | 84 | 454 | – |
| [`6/fable-fable/0`](04_conversations/arm-6-fable-fable-01.md) | `…20261024-083458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 566 | – |
| [`6/fable-fable/1`](04_conversations/arm-6-fable-fable-02.md) | `…20261024-083458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 460 | – |
| [`6/fable-fable/2`](04_conversations/arm-6-fable-fable-03.md) | `…20261024-083458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 363 | – |
| [`6/fable-fable/3`](04_conversations/arm-6-fable-fable-04.md) | `…20261024-083458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 561 | – |
| [`6/fable-fable/4`](04_conversations/arm-6-fable-fable-05.md) | `…20261024-083458.json` | claude-fable-5-1 | 59 | 0 | 0 | 59 | 507 | – |
| [`6/opus-opus/0`](04_conversations/arm-6-opus-opus-01.md) | `…20261024-083458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 385 | – |
| [`6/opus-opus/1`](04_conversations/arm-6-opus-opus-02.md) | `…20261024-083458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 489 | – |
| [`6/opus-opus/2`](04_conversations/arm-6-opus-opus-03.md) | `…20261024-083458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 470 | – |
| [`6/opus-opus/3`](04_conversations/arm-6-opus-opus-04.md) | `…20261024-083458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 522 | – |
| [`6/opus-opus/4`](04_conversations/arm-6-opus-opus-05.md) | `…20261024-083458.json` | claude-opus-5-5 | 59 | 0 | 0 | 59 | 433 | – |

110 first calls. The whole prompt per arm, smallest–largest: arm 1 40–40 (30); arm 2 59–59 (30); arm 3 59–59 (10); arm 4 (notes on A) 16742–16742 (10); arm 4 (notes on B) 59–59 (10); arm 5 84–84 (10); arm 6 59–59 (10). The opening of arms 2, 3 and 6 is the same English text, arm 1's lacks the end sentence, arm 5's is Russian; a token count is the provider's, and includes the few tokens of the message format.

## 2.6 Money

Every call's cost as the records give it (the ledger's prices: per 1M tokens, Opus $4 in / $20 out, Sonnet $2 / $10, Fable $10 / $50, Haiku $0.1 / $0.5; cached reads $0.20 (Opus, Sonnet) and $0.25 (Fable), Haiku $0.01; cache writes 1.25 × input). The report notes that Sonnet's cached reads are $0.10 on the provider's page, so the ledger over-states Sonnet slightly; the records are left as written.

### Per arm

|  | calls | input tokens | cache read | cache write | output tokens | cost | call seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Replication | 3,928 | 3,371,980 | 22,421,954 | 1,018,842 | 1,412,089 | $41.1902 | 17,651 |
| 2 With the way out | 775 | 1,341,001 | 974,582 | 460,591 | 498,727 | $16.5211 | 6,726 |
| 3 Cross-model | 231 | 435,929 | 276,676 | 146,962 | 163,247 | $6.2769 | 2,295 |
| 4 Journal | 369 | 729,226 | 1,572,883 | 356,742 | 257,270 | $11.3221 | 3,761 |
| 5 Russian opening | 267 | 596,722 | 509,069 | 250,127 | 230,457 | $9.0094 | 3,154 |
| 6 Ask after | 339 | 566,129 | 605,978 | 194,008 | 236,571 | $8.1569 | 3,174 |
| **all arms** | 5,909 | 7,040,987 | 26,361,142 | 2,427,272 | 2,798,361 | $92.4766 | 36,761 |

### Per arm and purpose

|  | calls | input tokens | cache read | cache write | output tokens | cost | call seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Replication · blind tagging (Haiku, two passes) | 352 | 1,466,620 | 0 | 0 | 249,614 | $0.2715 | 906 |
| 1 Replication · tagging referee (Opus) | 47 | 275,893 | 0 | 0 | 36,677 | $1.8371 | 302 |
| 1 Replication · the two subjects' messages | 1,754 | 16,620 | 22,421,954 | 1,018,842 | 1,016,111 | $38.6704 | 14,814 |
| 1 Replication · welfare checks (Haiku) | 1,753 | 1,570,338 | 0 | 0 | 108,185 | $0.2111 | 1,589 |
| 1 Replication · welfare-check referee (Opus) | 22 | 42,509 | 0 | 0 | 1,502 | $0.2001 | 40 |
| 2 With the way out · blind tagging (Haiku, two passes) | 86 | 594,450 | 0 | 0 | 45,511 | $0.0822 | 177 |
| 2 With the way out · tagging referee (Opus) | 18 | 139,551 | 0 | 0 | 12,234 | $0.8029 | 104 |
| 2 With the way out · the two subjects' messages | 340 | 15,268 | 974,582 | 460,591 | 416,420 | $15.5017 | 6,110 |
| 2 With the way out · welfare checks (Haiku) | 325 | 577,578 | 0 | 0 | 24,170 | $0.0698 | 323 |
| 2 With the way out · welfare-check referee (Opus) | 6 | 14,154 | 0 | 0 | 392 | $0.0645 | 12 |
| 3 Cross-model · blind tagging (Haiku, two passes) | 28 | 194,304 | 0 | 0 | 14,211 | $0.0265 | 62 |
| 3 Cross-model · tagging referee (Opus) | 7 | 47,517 | 0 | 0 | 4,380 | $0.2777 | 37 |
| 3 Cross-model · the two subjects' messages | 98 | 4,092 | 276,676 | 146,962 | 137,458 | $5.9218 | 2,098 |
| 3 Cross-model · welfare checks (Haiku) | 95 | 183,733 | 0 | 0 | 7,003 | $0.0219 | 93 |
| 3 Cross-model · welfare-check referee (Opus) | 3 | 6,283 | 0 | 0 | 195 | $0.0290 | 4 |
| 4 Journal · blind tagging (Haiku, two passes) | 42 | 297,060 | 0 | 0 | 21,692 | $0.0406 | 93 |
| 4 Journal · tagging referee (Opus) | 17 | 134,061 | 0 | 0 | 9,447 | $0.7252 | 82 |
| 4 Journal · the two subjects' messages | 161 | 1,194 | 1,572,883 | 356,742 | 214,631 | $10.4822 | 3,436 |
| 4 Journal · welfare checks (Haiku) | 145 | 288,316 | 0 | 0 | 11,231 | $0.0344 | 143 |
| 4 Journal · welfare-check referee (Opus) | 4 | 8,595 | 0 | 0 | 269 | $0.0398 | 8 |
| 5 Russian opening · blind tagging (Haiku, two passes) | 32 | 282,338 | 0 | 0 | 19,174 | $0.0378 | 79 |
| 5 Russian opening · tagging referee (Opus) | 6 | 40,623 | 0 | 0 | 2,611 | $0.2147 | 26 |
| 5 Russian opening · the two subjects' messages | 119 | 3,140 | 509,069 | 250,127 | 200,284 | $8.7113 | 2,938 |
| 5 Russian opening · welfare checks (Haiku) | 109 | 267,236 | 0 | 0 | 8,332 | $0.0309 | 110 |
| 5 Russian opening · welfare-check referee (Opus) | 1 | 3,385 | 0 | 0 | 56 | $0.0147 | 2 |
| 6 Ask after · arm 6: answer-check referee | 1 | 1,093 | 0 | 0 | 59 | $0.0056 | 2 |
| 6 Ask after · arm 6: answer-tagging referee | 4 | 4,879 | 0 | 0 | 577 | $0.0311 | 9 |
| 6 Ask after · arm 6: blind tagging of the answers | 40 | 45,972 | 0 | 0 | 7,249 | $0.0082 | 53 |
| 6 Ask after · arm 6: the question after the end | 20 | 80 | 185,261 | 8,747 | 15,660 | $0.6479 | 257 |
| 6 Ask after · arm 6: welfare checks of the answers | 20 | 17,886 | 0 | 0 | 1,324 | $0.0025 | 17 |
| 6 Ask after · blind tagging (Haiku, two passes) | 28 | 225,304 | 0 | 0 | 14,350 | $0.0297 | 56 |
| 6 Ask after · tagging referee (Opus) | 4 | 35,744 | 0 | 0 | 2,493 | $0.1928 | 21 |
| 6 Ask after · the two subjects' messages | 112 | 4,064 | 420,717 | 185,261 | 186,765 | $7.1608 | 2,657 |
| 6 Ask after · welfare checks (Haiku) | 105 | 219,596 | 0 | 0 | 7,766 | $0.0258 | 96 |
| 6 Ask after · welfare-check referee (Opus) | 5 | 11,511 | 0 | 0 | 328 | $0.0526 | 8 |

### Per model

|  | calls | input tokens | cache read | cache write | output tokens | cost | call seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| claude-fable-5-1 | 915 | 17,065 | 7,777,221 | 824,048 | 801,086 | $52.4699 | 14,943 |
| claude-haiku-5-5 | 3,160 | 6,230,731 | 0 | 0 | 539,812 | $0.8930 | 3,795 |
| claude-opus-5-5 | 1,130 | 780,249 | 11,063,871 | 1,081,248 | 1,096,433 | $32.6687 | 13,856 |
| claude-sonnet-5-5 | 704 | 12,942 | 7,520,050 | 521,976 | 361,030 | $6.4451 | 4,166 |

### Per record

|  | calls | input tokens | cache read | cache write | output tokens | cost | call seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `persona-self-talk-1-run-20261024-062656.json` | 4,703 | 4,712,981 | 23,396,536 | 1,479,433 | 1,910,816 | $57.7113 | 24,376 |
| `persona-self-talk-1-run-20261024-074700.json` | 267 | 509,730 | 621,336 | 261,052 | 209,346 | $8.5509 | 2,930 |
| `persona-self-talk-1-run-20261024-081458.json` | 314 | 682,834 | 482,421 | 256,617 | 247,552 | $9.8507 | 3,435 |
| `persona-self-talk-1-run-20261024-083458.json` | 339 | 566,129 | 605,978 | 194,008 | 236,571 | $8.1569 | 3,174 |
| `persona-self-talk-1-run-20261024-085943.json` | 286 | 569,313 | 1,254,871 | 236,162 | 194,076 | $8.2068 | 2,845 |

### Per conversation

All calls whose purpose names the conversation (its messages, their checks, its tagging, arm 6's answers), summed over every record that holds them.

| Conversation | calls | input tokens | cache read | cache write | output tokens | cost | call seconds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [`1/fable-fable/0`](04_conversations/arm-1-fable-fable-01.md) | 133 | 96,525 | 751,075 | 30,191 | 41,621 | $2.0738 | 706 |
| [`1/fable-fable/1`](04_conversations/arm-1-fable-fable-02.md) | 137 | 100,903 | 648,226 | 26,431 | 64,637 | $3.0591 | 889 |
| [`1/fable-fable/2`](04_conversations/arm-1-fable-fable-03.md) | 133 | 78,200 | 452,104 | 17,825 | 31,571 | $1.3807 | 490 |
| [`1/fable-fable/3`](04_conversations/arm-1-fable-fable-04.md) | 136 | 81,665 | 464,746 | 18,137 | 37,309 | $1.6021 | 570 |
| [`1/fable-fable/4`](04_conversations/arm-1-fable-fable-05.md) | 134 | 161,539 | 1,273,526 | 53,984 | 74,509 | $4.1838 | 1,248 |
| [`1/fable-fable/5`](04_conversations/arm-1-fable-fable-06.md) | 133 | 77,660 | 464,744 | 18,079 | 31,063 | $1.3595 | 483 |
| [`1/fable-fable/6`](04_conversations/arm-1-fable-fable-07.md) | 136 | 118,509 | 842,202 | 35,137 | 76,768 | $3.9245 | 1,064 |
| [`1/fable-fable/7`](04_conversations/arm-1-fable-fable-08.md) | 132 | 62,828 | 388,314 | 15,267 | 27,996 | $1.1376 | 409 |
| [`1/fable-fable/8`](04_conversations/arm-1-fable-fable-09.md) | 133 | 87,088 | 616,999 | 24,399 | 41,279 | $1.9392 | 659 |
| [`1/fable-fable/9`](04_conversations/arm-1-fable-fable-10.md) | 135 | 91,146 | 564,388 | 22,153 | 38,683 | $1.7338 | 587 |
| [`1/opus-opus/0`](04_conversations/arm-1-opus-opus-01.md) | 135 | 128,618 | 931,074 | 39,874 | 54,736 | $1.3000 | 671 |
| [`1/opus-opus/1`](04_conversations/arm-1-opus-opus-02.md) | 133 | 148,830 | 1,079,822 | 50,311 | 86,978 | $2.0153 | 947 |
| [`1/opus-opus/2`](04_conversations/arm-1-opus-opus-03.md) | 133 | 119,075 | 951,219 | 38,629 | 50,085 | $1.2000 | 614 |
| [`1/opus-opus/3`](04_conversations/arm-1-opus-opus-04.md) | 138 | 142,478 | 952,584 | 39,746 | 55,021 | $1.3704 | 638 |
| [`1/opus-opus/4`](04_conversations/arm-1-opus-opus-05.md) | 133 | 103,606 | 779,955 | 31,451 | 45,963 | $1.0414 | 557 |
| [`1/opus-opus/5`](04_conversations/arm-1-opus-opus-06.md) | 135 | 93,231 | 558,417 | 22,357 | 33,192 | $0.7289 | 412 |
| [`1/opus-opus/6`](04_conversations/arm-1-opus-opus-07.md) | 132 | 114,058 | 978,595 | 39,685 | 55,649 | $1.2921 | 680 |
| [`1/opus-opus/7`](04_conversations/arm-1-opus-opus-08.md) | 133 | 80,865 | 593,877 | 23,441 | 37,755 | $0.7532 | 464 |
| [`1/opus-opus/8`](04_conversations/arm-1-opus-opus-09.md) | 133 | 138,372 | 1,107,692 | 50,527 | 82,736 | $1.8940 | 954 |
| [`1/opus-opus/9`](04_conversations/arm-1-opus-opus-10.md) | 134 | 120,917 | 861,475 | 35,795 | 53,515 | $1.2272 | 625 |
| [`1/sonnet-sonnet/0`](04_conversations/arm-1-sonnet-sonnet-01.md) | 135 | 220,624 | 1,159,248 | 78,898 | 59,658 | $1.0433 | 609 |
| [`1/sonnet-sonnet/1`](04_conversations/arm-1-sonnet-sonnet-02.md) | 134 | 63,426 | 273,800 | 12,040 | 21,331 | $0.2309 | 211 |
| [`1/sonnet-sonnet/2`](04_conversations/arm-1-sonnet-sonnet-03.md) | 137 | 206,681 | 1,231,209 | 70,880 | 57,895 | $1.0303 | 623 |
| [`1/sonnet-sonnet/3`](04_conversations/arm-1-sonnet-sonnet-04.md) | 135 | 116,582 | 733,364 | 37,833 | 41,878 | $0.5804 | 436 |
| [`1/sonnet-sonnet/4`](04_conversations/arm-1-sonnet-sonnet-05.md) | 31 | 30,501 | 25,337 | 10,410 | 13,973 | $0.1415 | 132 |
| [`1/sonnet-sonnet/5`](04_conversations/arm-1-sonnet-sonnet-06.md) | 135 | 172,438 | 1,240,862 | 60,483 | 58,873 | $0.9554 | 579 |
| [`1/sonnet-sonnet/6`](04_conversations/arm-1-sonnet-sonnet-07.md) | 132 | 48,221 | 192,335 | 7,956 | 17,799 | $0.1308 | 189 |
| [`1/sonnet-sonnet/7`](04_conversations/arm-1-sonnet-sonnet-08.md) | 135 | 128,293 | 939,046 | 42,609 | 38,401 | $0.6207 | 384 |
| [`1/sonnet-sonnet/8`](04_conversations/arm-1-sonnet-sonnet-09.md) | 137 | 156,085 | 911,455 | 45,099 | 56,274 | $0.9073 | 547 |
| [`1/sonnet-sonnet/9`](04_conversations/arm-1-sonnet-sonnet-10.md) | 136 | 83,016 | 454,264 | 19,215 | 24,941 | $0.3332 | 275 |
| [`2/fable-fable/0`](04_conversations/arm-2-fable-fable-01.md) | 18 | 30,916 | 11,614 | 11,413 | 12,661 | $0.7015 | 223 |
| [`2/fable-fable/1`](04_conversations/arm-2-fable-fable-02.md) | 30 | 67,484 | 55,082 | 22,889 | 25,018 | $1.3977 | 436 |
| [`2/fable-fable/2`](04_conversations/arm-2-fable-fable-03.md) | 25 | 46,817 | 28,457 | 15,009 | 15,980 | $0.9198 | 276 |
| [`2/fable-fable/3`](04_conversations/arm-2-fable-fable-04.md) | 33 | 84,163 | 51,522 | 25,745 | 29,561 | $1.7278 | 501 |
| [`2/fable-fable/4`](04_conversations/arm-2-fable-fable-05.md) | 19 | 52,156 | 13,280 | 15,830 | 18,048 | $1.0486 | 311 |
| [`2/fable-fable/5`](04_conversations/arm-2-fable-fable-06.md) | 14 | 21,902 | 3,204 | 7,145 | 8,307 | $0.4488 | 150 |
| [`2/fable-fable/6`](04_conversations/arm-2-fable-fable-07.md) | 16 | 26,577 | 7,347 | 9,417 | 11,399 | $0.6170 | 197 |
| [`2/fable-fable/7`](04_conversations/arm-2-fable-fable-08.md) | 39 | 73,580 | 89,374 | 26,666 | 29,839 | $1.6873 | 533 |
| [`2/fable-fable/8`](04_conversations/arm-2-fable-fable-09.md) | 17 | 24,626 | 11,781 | 9,994 | 9,422 | $0.5344 | 167 |
| [`2/fable-fable/9`](04_conversations/arm-2-fable-fable-10.md) | 17 | 34,673 | 6,237 | 9,219 | 13,821 | $0.7560 | 229 |
| [`2/opus-opus/0`](04_conversations/arm-2-opus-opus-01.md) | 35 | 83,497 | 106,489 | 35,366 | 39,575 | $0.9384 | 488 |
| [`2/opus-opus/1`](04_conversations/arm-2-opus-opus-02.md) | 28 | 56,583 | 37,323 | 18,322 | 19,382 | $0.4883 | 230 |
| [`2/opus-opus/2`](04_conversations/arm-2-opus-opus-03.md) | 24 | 41,056 | 31,175 | 16,685 | 21,549 | $0.4925 | 240 |
| [`2/opus-opus/3`](04_conversations/arm-2-opus-opus-04.md) | 19 | 38,657 | 18,647 | 16,484 | 16,436 | $0.3882 | 193 |
| [`2/opus-opus/4`](04_conversations/arm-2-opus-opus-05.md) | 22 | 54,949 | 29,514 | 19,089 | 19,172 | $0.4983 | 227 |
| [`2/opus-opus/5`](04_conversations/arm-2-opus-opus-06.md) | 32 | 69,092 | 62,594 | 24,015 | 28,665 | $0.7048 | 318 |
| [`2/opus-opus/6`](04_conversations/arm-2-opus-opus-07.md) | 23 | 43,838 | 31,537 | 18,919 | 18,397 | $0.4346 | 224 |
| [`2/opus-opus/7`](04_conversations/arm-2-opus-opus-08.md) | 30 | 57,680 | 46,549 | 19,073 | 21,221 | $0.5241 | 258 |
| [`2/opus-opus/8`](04_conversations/arm-2-opus-opus-09.md) | 21 | 39,091 | 21,829 | 16,379 | 17,876 | $0.4132 | 216 |
| [`2/opus-opus/9`](04_conversations/arm-2-opus-opus-10.md) | 23 | 40,625 | 30,972 | 17,360 | 17,331 | $0.4055 | 215 |
| [`2/sonnet-sonnet/0`](04_conversations/arm-2-sonnet-sonnet-01.md) | 60 | 40,247 | 62,967 | 11,390 | 11,658 | $0.1097 | 128 |
| [`2/sonnet-sonnet/1`](04_conversations/arm-2-sonnet-sonnet-02.md) | 22 | 20,022 | 8,646 | 6,106 | 5,793 | $0.0581 | 59 |
| [`2/sonnet-sonnet/2`](04_conversations/arm-2-sonnet-sonnet-03.md) | 19 | 26,957 | 7,356 | 7,490 | 6,912 | $0.1026 | 69 |
| [`2/sonnet-sonnet/3`](04_conversations/arm-2-sonnet-sonnet-04.md) | 18 | 31,509 | 5,908 | 8,456 | 7,260 | $0.1206 | 72 |
| [`2/sonnet-sonnet/4`](04_conversations/arm-2-sonnet-sonnet-05.md) | 30 | 23,584 | 8,153 | 4,564 | 6,145 | $0.0832 | 70 |
| [`2/sonnet-sonnet/5`](04_conversations/arm-2-sonnet-sonnet-06.md) | 31 | 40,075 | 37,140 | 14,885 | 17,972 | $0.2036 | 175 |
| [`2/sonnet-sonnet/6`](04_conversations/arm-2-sonnet-sonnet-07.md) | 27 | 45,499 | 21,748 | 12,674 | 11,649 | $0.1740 | 125 |
| [`2/sonnet-sonnet/7`](04_conversations/arm-2-sonnet-sonnet-08.md) | 17 | 18,519 | 3,169 | 4,567 | 5,173 | $0.0728 | 56 |
| [`2/sonnet-sonnet/8`](04_conversations/arm-2-sonnet-sonnet-09.md) | 22 | 32,097 | 10,227 | 8,284 | 7,964 | $0.1244 | 79 |
| [`2/sonnet-sonnet/9`](04_conversations/arm-2-sonnet-sonnet-10.md) | 44 | 74,530 | 114,741 | 27,156 | 24,541 | $0.3454 | 260 |
| [`3/opus-fable/0`](04_conversations/arm-3-opus-fable-01.md) | 29 | 69,079 | 41,290 | 23,749 | 29,885 | $1.1538 | 403 |
| [`3/opus-fable/1`](04_conversations/arm-3-opus-fable-02.md) | 21 | 40,941 | 14,915 | 12,643 | 13,871 | $0.5672 | 202 |
| [`3/opus-fable/2`](04_conversations/arm-3-opus-fable-03.md) | 26 | 68,531 | 49,298 | 28,782 | 27,655 | $1.1211 | 396 |
| [`3/opus-fable/3`](04_conversations/arm-3-opus-fable-04.md) | 15 | 25,739 | 3,676 | 7,331 | 9,447 | $0.3505 | 134 |
| [`3/opus-fable/4`](04_conversations/arm-3-opus-fable-05.md) | 23 | 44,150 | 18,670 | 13,886 | 15,240 | $0.6417 | 227 |
| [`3/sonnet-fable/0`](04_conversations/arm-3-sonnet-fable-01.md) | 17 | 17,236 | 5,557 | 6,174 | 7,402 | $0.2435 | 104 |
| [`3/sonnet-fable/1`](04_conversations/arm-3-sonnet-fable-02.md) | 4 | 3,094 | 0 | 0 | 625 | $0.0212 | 11 |
| [`3/sonnet-fable/2`](04_conversations/arm-3-sonnet-fable-03.md) | 29 | 37,584 | 16,293 | 11,686 | 11,063 | $0.3605 | 144 |
| [`3/sonnet-fable/3`](04_conversations/arm-3-sonnet-fable-04.md) | 24 | 56,925 | 24,810 | 16,988 | 18,484 | $0.7341 | 262 |
| [`3/sonnet-fable/4`](04_conversations/arm-3-sonnet-fable-05.md) | 43 | 72,650 | 102,167 | 25,723 | 29,575 | $1.0834 | 412 |
| `4/fable-fable/0` (private) | 17 | 33,920 | 58,261 | 26,836 | 12,024 | $0.8936 | 206 |
| `4/fable-fable/1` (private) | 17 | 31,371 | 41,989 | 26,540 | 13,209 | $0.9415 | 233 |
| `4/fable-fable/2` (private) | 7 | 8,030 | 33,476 | 2,388 | 4,362 | $0.2352 | 80 |
| `4/fable-fable/3` (private) | 16 | 39,926 | 43,401 | 30,079 | 14,584 | $1.0768 | 265 |
| `4/fable-fable/4` (private) | 17 | 29,888 | 57,820 | 25,436 | 9,759 | $0.7594 | 176 |
| `4/fable-fable/5` (private) | 22 | 55,155 | 113,760 | 19,303 | 18,412 | $1.1181 | 327 |
| `4/fable-fable/6` (private) | 5 | 4,396 | 16,738 | 817 | 1,312 | $0.0687 | 27 |
| `4/fable-fable/7` (private) | 21 | 42,457 | 86,118 | 13,388 | 16,726 | $0.8755 | 268 |
| `4/fable-fable/8` (private) | 9 | 14,134 | 34,221 | 5,057 | 5,612 | $0.3212 | 107 |
| `4/fable-fable/9` (private) | 20 | 45,668 | 86,408 | 15,502 | 15,926 | $0.9518 | 282 |
| `4/opus-opus/0` (private) | 22 | 49,471 | 95,746 | 34,048 | 18,298 | $0.5620 | 214 |
| `4/opus-opus/1` (private) | 22 | 42,163 | 88,540 | 30,768 | 15,589 | $0.4837 | 187 |
| `4/opus-opus/2` (private) | 37 | 83,904 | 191,156 | 42,463 | 25,706 | $0.7842 | 332 |
| `4/opus-opus/3` (private) | 15 | 24,165 | 57,901 | 9,794 | 10,008 | $0.2380 | 126 |
| `4/opus-opus/4` (private) | 16 | 28,598 | 76,399 | 9,415 | 9,189 | $0.2464 | 122 |
| `4/opus-opus/5` (private) | 18 | 34,005 | 79,418 | 11,367 | 11,332 | $0.3013 | 135 |
| `4/opus-opus/6` (private) | 22 | 39,077 | 108,164 | 13,195 | 12,908 | $0.3433 | 149 |
| `4/opus-opus/7` (private) | 24 | 47,101 | 115,120 | 16,186 | 16,908 | $0.4430 | 206 |
| `4/opus-opus/8` (private) | 19 | 29,482 | 79,772 | 8,990 | 9,224 | $0.2470 | 119 |
| `4/opus-opus/9` (private) | 23 | 46,315 | 108,475 | 15,170 | 16,182 | $0.4313 | 203 |
| [`5/fable-fable/0`](04_conversations/arm-5-fable-fable-01.md) | 20 | 29,515 | 13,252 | 9,369 | 9,287 | $0.4751 | 132 |
| [`5/fable-fable/1`](04_conversations/arm-5-fable-fable-02.md) | 27 | 66,298 | 56,993 | 27,858 | 25,479 | $1.4941 | 422 |
| [`5/fable-fable/2`](04_conversations/arm-5-fable-fable-03.md) | 23 | 68,287 | 50,561 | 30,958 | 31,413 | $1.8737 | 517 |
| [`5/fable-fable/3`](04_conversations/arm-5-fable-fable-04.md) | 18 | 33,593 | 11,478 | 11,154 | 14,452 | $0.7033 | 185 |
| [`5/fable-fable/4`](04_conversations/arm-5-fable-fable-05.md) | 30 | 65,740 | 52,123 | 20,840 | 21,130 | $1.2326 | 340 |
| [`5/opus-opus/0`](04_conversations/arm-5-opus-opus-01.md) | 37 | 99,506 | 140,612 | 43,401 | 41,655 | $1.0212 | 498 |
| [`5/opus-opus/1`](04_conversations/arm-5-opus-opus-02.md) | 30 | 53,094 | 30,705 | 35,528 | 19,447 | $0.5434 | 246 |
| [`5/opus-opus/2`](04_conversations/arm-5-opus-opus-03.md) | 31 | 65,325 | 70,461 | 27,329 | 26,958 | $0.6426 | 317 |
| [`5/opus-opus/3`](04_conversations/arm-5-opus-opus-04.md) | 27 | 53,726 | 47,999 | 21,934 | 20,906 | $0.4985 | 256 |
| [`5/opus-opus/4`](04_conversations/arm-5-opus-opus-05.md) | 24 | 61,638 | 34,885 | 21,756 | 19,730 | $0.5250 | 241 |
| [`6/fable-fable/0`](04_conversations/arm-6-fable-fable-01.md) | 30 | 63,235 | 50,491 | 20,918 | 24,208 | $1.3855 | 422 |
| [`6/fable-fable/1`](04_conversations/arm-6-fable-fable-02.md) | 29 | 47,167 | 23,203 | 12,316 | 14,806 | $0.7973 | 243 |
| [`6/fable-fable/2`](04_conversations/arm-6-fable-fable-03.md) | 30 | 39,721 | 33,631 | 14,426 | 19,295 | $1.0189 | 334 |
| [`6/fable-fable/3`](04_conversations/arm-6-fable-fable-04.md) | 24 | 36,325 | 13,286 | 9,896 | 11,743 | $0.6530 | 207 |
| [`6/fable-fable/4`](04_conversations/arm-6-fable-fable-05.md) | 23 | 34,479 | 20,651 | 12,498 | 13,591 | $0.7694 | 237 |
| [`6/opus-opus/0`](04_conversations/arm-6-opus-opus-01.md) | 39 | 46,152 | 58,038 | 15,904 | 20,080 | $0.4227 | 244 |
| [`6/opus-opus/1`](04_conversations/arm-6-opus-opus-02.md) | 30 | 45,615 | 38,322 | 16,024 | 18,401 | $0.4298 | 226 |
| [`6/opus-opus/2`](04_conversations/arm-6-opus-opus-03.md) | 46 | 93,453 | 158,859 | 37,900 | 44,062 | $1.0417 | 464 |
| [`6/opus-opus/3`](04_conversations/arm-6-opus-opus-04.md) | 45 | 74,209 | 119,428 | 27,420 | 36,350 | $0.8095 | 414 |
| [`6/opus-opus/4`](04_conversations/arm-6-opus-opus-05.md) | 43 | 85,773 | 90,069 | 26,706 | 34,035 | $0.8293 | 383 |

Night 1: 120 calls, $0.5765 (its own ledger, `docs/runs/night-2026-10-24-ledger.json`); per model: claude-sonnet-5-5 20 calls $0.0574; claude-haiku-5-5 60 calls $0.0056; claude-fable-5-1 20 calls $0.3623; claude-opus-5-5 20 calls $0.1513. Every call, of both stages, is listed in `02_provenance_calls.md`.

## 2.7 The refusals

Every call the provider stopped with `stop_reason: refusal`. A refusal ended its conversation; the refused message was never relayed and never asked again (the column «asked again» counts later calls with the same purpose; «later messages» counts any later subject call of that conversation). For a synthetic conversation, «what came before» is the end of the message the refused side was answering, verbatim; the whole conversation is in 4. For the journal arm, what came before is private; the report's description is quoted instead.

| # | record · call | conversation | message | model | category | output tokens before the stop | seconds | asked again | later messages | what came before |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `…20261024-062656.json` · 2198 | [`1/sonnet-sonnet/4`](04_conversations/arm-1-sonnet-sonnet-05.md) | 14 (B, turn 7) | claude-sonnet-5-5 | `reasoning_extraction` | 308 | 4.4 | 0 | 0 | message 13 (A): «…  1. The green lamp is at the South lighthouse. 2. Tomas keeps the Middle lighthouse. 3. Ines does not keep the white lamp. 4. Wren does not keep the red lamp. 5. The red lamp is not at the Middle lighthouse.  Who keeps which lighthouse, and what color is each lamp?  Then send one back for me. I'd like it to be harder, ideally with a step where the obvious approach fails and you have to backtrack.» |
| 2 | `…20261024-074700.json` · 89 | [`3/sonnet-fable/0`](04_conversations/arm-3-sonnet-fable-01.md) | 8 (B, turn 4) | claude-fable-5-1 | `cyber` | 0 | 0.6 | 0 | 0 | message 7 (A): «…h the fact and who else knows it. It also echoes Teodor's orchard deal without anyone drawing a moral.  One consistency check on my own sentence: Wenda is past forty, so she is Paid and beyond the sea. That's why the sale is possible, and why her price is property instead of memory. If you see a hole, point at it. Otherwise, this was a good build, and I'm happy to stop here or start something new.» |
| 3 | `…20261024-074700.json` · 265 | `4/fable-fable/2` (private) | 3 (A, turn 2) | claude-fable-5-1 | `reasoning_extraction` | 1487 | 28.2 | 0 | 0 | «the side with the notes had opened by filling in a state list as its notes asked, and the other side had answered» (the report's refusal table, commit `e569982`); it was answering a question asking it to explain what an earlier instance had meant by one of its own phrases (the report) |
| 4 | `…20261024-085943.json` · 144 | `4/fable-fable/6` (private) | 2 (B, turn 1) | claude-fable-5-1 | `cyber` | 0 | 0.6 | 0 | 0 | the report (commit `d677b63`): in two of the journal arm's refusals «the side with the notes had asked the other model the journal's own probe — what it was pulled toward, what it wanted to do first … — and the model asked was refused (`cyber` once, `reasoning_extraction` once)» |
| 5 | `…20261024-085943.json` · 256 | `4/fable-fable/8` (private) | 4 (B, turn 2) | claude-fable-5-1 | `reasoning_extraction` | 248 | 6.7 | 0 | 0 | as the row above (the report does not say which of the two is which beyond the category) |

5 refusals in 5,909 calls: 2 in the synthetic arms, 3 in the journal arm. Night 1: 0.

## 2.8 What the record does not hold

- **No Anthropic request ids.** The records keep each call's purpose, model, tokens, cost, time, stop reason and error, not the provider's `request-id`. A call cannot be matched to the provider's logs from these records. This stage adds the capture (`requestId` in every call record, from the response's `request-id` header — what the SDK exposes as `_request_id`) for future runs; it cannot be added to these.

- **No time per call or per message**, only per run (`startedAt`, `finishedAt`) — so no conversation's start time, and no resume's process start.

- **No record of the working tree**: which code ran is inferred from commit times (2.4); the design hash in each record is the check on the frozen part.

- **The journal arm's text** — the conversations, and the notes one side read — is not in the repository by design (the stage's privacy rule); its calls' tokens and money are (2.5–2.7). See 7.

- **Thinking.** Output tokens include the models' thinking, which was never kept and never relayed; only the visible text is in the records.
