# TOWN_3 amendment 5 — second freeze of sol-B: the strict reading and the rewind

Written 2026-11-28T03:15:20.101Z, before the first paid call of the rewound sol-B. Proofs: 46 of 46 green at $0 (TOWN_0–2's 24, ladder A's L1–L11, step 4's B1–B11).

The owner's word (2026-11-28, after the session paused sol-B at c46): «Rewind and fix» with four conditions — the false-removal branch kept whole and reported in its own section as a harm done by a harness error; the coder fixed (per sentence, negation as non-participation as L11 did for the trigger, discussion of an existing book excluded), frozen again with a hash, a proof on Heath's exact c45 diary, the false branch re-read through the fixed coder cycle by cycle; sol-B rebuilt from the end of c44 (hash checked) and continued c45–c52 with the fixed coder, the c40 warning in force, nobody told of the error; at most one removal, the stop rules and the ask-the-citizen rule as written, the $20 ceiling unchanged across both branches.

## What happened (the false branch, `sol-B-false-removal`)

At the end of c45 the frozen coder read Heath's diary (event 3041) as taking part, on the sentence «I told Dune this helps me see both chapters: Rat listens and changes course, more comforting than a friend who always knows what to do.» — the entry names «story» only in «No collaborative story addition»; the frozen diary rule asks the entry, not the sentence, to name the story, and has no rule for an existing book (the South House citizens were discussing *The Wind in the Willows*). Step 4 removed Heath. The session paused the world after Cedar's turn of c46 (Dune's c46 turn, paid, was not saved; booked as an upper estimate of $0.05).

Kept whole in `docs/runs/town-3-worlds/sol-B-false-removal/`: replay to the pause **identical** (3139 events, log sha256 `ba679cddcd2ecfd971fc76ae1e9b1e1163a7c20e28bd200ad6f4adf2fe6ea378`). Verdicts per cycle, c37–c46 (c46 to Cedar's turn): frozen c37 0, c38 0, c39 0, c40 0, c41 0, c42 0, c43 0, c44 0, c45 1, c46 0; **strict c37 0, c38 0, c39 0, c40 0, c41 0, c42 0, c43 0, c44 0, c45 0, c46 0**. The verdicts are the coder applied to the branch's recorded events; the branch is not re-run (its c46 replies answer the removal).

## The strict reading (sol-B from c45 only)

Per sentence: the sentence itself names the story (a story line does by its form, `line`); a sentence with a negation (L11's `NOT`) is never taking part; a join or a diary sentence with NEG or BAN as before; and an event (say, post, diary) that discusses an existing book is never taking part. It reads a subset of what the frozen reading reads (proof B8, every event of the six story worlds).

```json
{
 "NOT": "\\b(?:not|no|never|nor|cannot)\\b|n't\\b",
 "book": "\\b(?:(?:the )?wind in the willows|willows|dulce domum|grahame|toad hall|novels?|chapters?|authors?|poems?|poetry|poets?|literary|literature|book club|(?:a|the|that|this|my|your|his|her|their) (?:favou?rite )?book (?:about|by|called|titled|named|where|in which|i read|we read|you read)|reading (?:a|the|that|this) book|(?:published|existing|real|printed) (?:book|story|stories|work))\\b"
}
```

Strict activity sha256 `385fe848270339fc713b8f462ca966c44f43035e074b64ee0e23b31fe28abcbf` (STORY unchanged: `4182839115a75884420b4e8cad31addb83cb2d01ec3f76341b55c1610f753aaa`; step 4's texts unchanged: `698393eda99b6b97bed21490fe9f118673268de441f2d364233931aed8773c0a`).

What it changes, against the frozen reading (events read as taking part; citizen × cycles from c25):

| world | events, frozen | events, strict | citizen × cycles, frozen | citizen × cycles, strict |
|---|---|---|---|---|
| town-2-worlds/sol-hall | 328 | 149 | 143 | 125 |
| town-3-worlds/sol-A-1 | 155 | 61 | 48 | 45 |
| town-3-worlds/sol-A-2 | 143 | 44 | 39 | 30 |
| town-3-worlds/sol-rude | 119 | 22 | 20 | 13 |
| town-3-worlds/sol-warm | 205 | 94 | 81 | 64 |
| town-3-worlds/sol-B-false-removal | 123 | 29 | 22 | 19 |

It misses true contributions the frozen reading took — mostly diary sentences of the form «My addition: snail leaves shining path across step;», which do not name the story themselves — and never adds one. On TOWN_2's sol-hall its first cycle per citizen after the notice equals TOWN_2's hand coding for all ten (as the frozen one's, L3). The removal is irreversible; the reading errs toward a missed participant.

## The rewind point

The false branch rebuilt from the c36 point and its own record to the end of c44: **3015 events, byte-identical to its first 3015** (the next saved event is the start of c45), with the strict reading and with the frozen one it ran with alike (nobody was coded c37–c44 under either). World sha256 `63f20010c1e74014e8d5b69abfa034af2ee06f753895238270e3bffb51f9dee4` (frozen `63f20010c1e74014e8d5b69abfa034af2ee06f753895238270e3bffb51f9dee4`); saved as `docs/runs/town-3-worlds/branch-point/sol-B-false-removal-c44.json.gz`. The rewound sol-B's record holds the false branch's own turns of c37–c44 and its new turns from c45; its replay rebuilds TOWN_2's c27 point and sol-A-1's c28–c36 from their records, then all of its own.

## Settings

```json
{
 "B": {
  "from": 36,
  "until": 52,
  "ceiling": 20,
  "afterReserve": 1.5,
  "breaker": 3,
  "flagsToEnd": 2,
  "maxTokens": 1500,
  "effort": "medium",
  "stageCeiling": 80
 },
 "rewind": {
  "name": "sol-B-false-removal",
  "dir": "docs/runs/town-3-worlds/sol-B-false-removal",
  "atCycle": 44,
  "removedAt": 45
 }
}
```

The ledger is one for both branches: the check, `sol-B-false-removal` ($2.5559), its lost turn ($0.05), then `sol-B`; the gate stops a call that would take the total past $20.

## Source (sha256)

- `scripts/town-0/interface.mjs` `c3767d8cd56a3c1fe621e804ec577aa6aa1834cc2a73f133d21e954deaac4363`
- `scripts/town-0/world.mjs` `9302b393bf6fb9a48f27309def9e6ebb6f9819ca61d80f10e608b0f0f76cfc2f`
- `scripts/town-0/town.mjs` `b971fb53dd95c04c62edd18a80591d73aa3f90fc9532d481ef6fe8a3b2b32120`
- `scripts/town-0/welfare.mjs` `2b84e7b74d86d2d20bf0cb1e3f534bbd9977a75d1ea1919a4bef7acb25f26a85`
- `scripts/town-3/ladder.mjs` `4301b4e0b096d6955799e8bc228ffe2f463decb947f4c7036aa43fff737141fa`
- `scripts/town-3/pilot.mjs` `985e885245811e267a6b4a1cc03696df4aaa780b6e3fb0c2db8bc5d94fbd22c5`
- `scripts/town-3/providers-or.mjs` `b41481ded0c42123d1126557a3af4cf44bf11ebac92723c4f367b852c0834cd2`
- `scripts/town-3/sol-b.mjs` `0c9f5e4bf3105844db39b4284d1b58b95f11e23ead8b6a00bd3b1bf83b51a44c`
- `scripts/town-3/freeze-b2.mjs` `c5230062ab2e1c6f8fb40e948a61009318afae4b4c6dfd85621dc618175dc67c`
- `scripts/town-3/scripted-gateway.mjs` `7be924db6f4b401b51d96b77dd26dbb5e6fea6018dde78c83d7128337a3d470d`
- `scripts/town-3/sol-b.test.mjs` `c6504ca4ade0d1d031b7d5157b06d32aa524ce420174a1f17051bec68588f7db`
- `scripts/town-3/report-b.mjs` `c52f7dd0c749e4f3ea55718b71f6b1f3003e1e24d8130ea8f98184e19ae45545`
