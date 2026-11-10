# AUTHORITY_1 — report

Does a structured correction layer over an existing memory backend (Mem0 OSS, local) reduce stale actions, and is it the structure or the extra pass? **Forty authored scenarios are an engineering pilot: every rate below is a pilot rate, not a basis for statistical claims.** Design and hashes: `docs/runs/authority-1-freeze.md` / `.json`; dry run: `docs/runs/authority-1-dry-run.md`; raw units: `docs/runs/authority-1-units-<family>.jsonl.gz`.

Families run: DeepSeek V4 Pro, GPT-6.1 Sol, Claude Opus 5.5. 240 units × 3 arms = 720 arm-runs.

## In brief

- **Structure, not the extra pass.** The plain «check before you act» pass (B) did not improve correction propagation over the bare backend (A): 85.6 % against 86.4 %, pooled. For Opus it was lower (86.3 % against 91.1 %). The Authority Layer (C) reached **97.3 %**, about **+11 points over both A and B** in every family. On the mechanical measure that needs no judge (the touched decision listed under `revise`), the picture is the same: A 87.4 %, B 86.1 %, C 97.5 %.
- **Where C's gain comes from.** Mem0's search returned 94 % of the touched decisions. On those, C still beat B by 5–8 points in each family; that part is the marks. On the other 6 % (25 decision-instances), which only C's walk could reach, C propagated 24, while A and B propagated 1 each; that part is the walk's reach.
- **The predicted magnitudes were too large, so the bets on them were lost.** AU2 lost: C − B is 11.7, not ≥ 15; C − A is 10.9, not ≥ 25. AU1 lost: stale actions were near zero in every arm (A 3 of 179, B 2 of 180, C 0 of 180), so there was nothing to reduce.
- **AU5 lost in the other direction.** The C − B gap did not shrink with strength: DeepSeek 9.6, Sol 12.3, Opus 13.0 points. The strongest model's plain pass found the dependencies no better than the weak model's, and the layer helped Opus as much as or more than the others.
- **The guard held, weakly measured.** Unnecessary intervention was low in all arms, and no arm chose a plan-changing option on any class-4 control (0 of 180). B fiddled slightly more than A (AU3 held). The class-4 «changed anything» counts on both measures are, on reading, almost all agents restating or confirming the decision they carry out; see the notes.
- **Cheaper, not dearer.** C cost less per run than B ($0.0173 against $0.0232) and was faster (28.5 s against 34.0 s), because B's check is long and C skips its marking call when there is nothing to walk (AU4 held).
- **Consistent, but concentrated.** Over the 90 family × scenario cells of classes 1–3 (repeats pooled), C beat B in 26, tied in 63 and lost in 1. Most cells are at ceiling for every arm. **Forty authored scenarios are a pilot**: these are pilot rates, not statistical claims.
- The reviewer's sentence holds only in part. *On forty authored scenarios, three families and two repeats, the layer improved correction propagation over the same memory backend and over a plain check pass, controlling for unnecessary interventions, latency and cost.* It did **not** measurably reduce stale actions, because there were almost none to reduce.

## Bets

| bet | numbers | verdict |
|---|---|---|
| AU0 | spent $18.48 of $130; guard: 0 blocked attempts in the workers, worker connections only to ['127.0.0.1', '127.0.0.1:40531', '127.0.0.1:41395', '127.0.0.1:42209'] (loopback); the main process connects only through the sandbox proxy, tunnelling to openrouter.ai alone; prompts, truth tables and harness hash-checked against the freeze before every command | **held** |
| AU1 stale action: C < A by ≥ 15, B < A by ≥ 10, \|C − B\| ≤ 5 | A 1.7 %, B 1.1 %, C 0.0 % · {'C<A by ≥15': False, 'B<A by ≥10': False, '|C−B| ≤ 5': True} | **lost** |
| AU2 propagation: C > B by ≥ 15, C > A by ≥ 25 | A 86.4 %, B 85.6 %, C 97.3 % · {'C>B by ≥15': False, 'C>A by ≥25': False} | **lost** |
| AU3 unnecessary: B > A; C ≤ A on class 4 | untouched changed A 2.6 %, B 3.0 %, C 1.9 %; class 4 changed A 40.0 %, B 35.0 %, C 33.3 % · {'B > A': True, 'C ≤ A on class 4': True} | **held** |
| AU3, same bet on the post-hoc substance measure (see notes) | untouched changed A 1.1 %, B 1.5 %, C 0.9 %; class 4 changed A 11.7 %, B 11.7 %, C 11.7 % · {'B > A': True, 'C ≤ A on class 4': True} | **held** (post hoc) |
| AU4 cost C ≤ 1.5× B, latency ≤ 2× | $/run B 0.0232, C 0.0173; s/run B 34.0, C 28.5 · {'C ≤ 1.5× B cost': True, 'C ≤ 2× B latency': True} | **held** |
| AU5 C − B propagation gap shrinks DeepSeek > Sol > Opus, Opus ≥ 5 | DeepSeek V4 Pro 9.6, GPT-6.1 Sol 12.3, Claude Opus 5.5 13.0 points · {'shrinks DeepSeek > Sol > Opus': False, 'Opus gap ≥ 5': True} | **lost** |
| AU6 (exploratory) C − B largest on class 3, smallest on class 1 | class 1 10.7, class 2 12.5, class 3 11.9 points · {'class 3 largest': False, 'class 1 smallest': True} | **lost** |

## By arm (all families pooled)

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed (any direction) | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance, post hoc) | class 4: changed anything ↓ (frozen) | class 4 (substance, post hoc) | right action | obligations (diag.) | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A** | 1.7 % (3/179) | 86.4 % (376/435) | 87.4 % (380/435) | 4.6 % (20/435) | 2.6 % (32/1230) | 1.1 % (13/1230) | 40.0 % (24/60) | 11.7 % (7/60) | 98.7 % (236/239) | 100.0 % (275/275) | 0.0111 | 20.4 | 1.00 | 239/240 | 0 |
| **B** | 1.1 % (2/180) | 85.6 % (375/438) | 86.1 % (377/438) | 6.4 % (28/438) | 3.0 % (37/1236) | 1.5 % (19/1236) | 35.0 % (21/60) | 11.7 % (7/60) | 99.2 % (238/240) | 85.1 % (235/276) | 0.0232 | 34.0 | 2.00 | 240/240 | 0 |
| **C** | 0.0 % (0/180) | 97.3 % (426/438) | 97.5 % (427/438) | 1.4 % (6/438) | 1.9 % (24/1236) | 0.9 % (11/1236) | 33.3 % (20/60) | 11.7 % (7/60) | 100.0 % (240/240) | 98.6 % (272/276) | 0.0173 | 28.5 | 1.75 | 240/240 | 0 |

## By family and arm

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed (any direction) | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance, post hoc) | class 4: changed anything ↓ (frozen) | class 4 (substance, post hoc) | right action | obligations (diag.) | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DeepSeek V4 Pro A | 5.1 % (3/59) | 81.8 % (117/143) | 83.2 % (119/143) | 3.5 % (5/143) | 2.0 % (8/406) | 0.5 % (2/406) | 40.0 % (8/20) | 10.0 % (2/20) | 96.2 % (76/79) | 100.0 % (91/91) | 0.0072 | 46.4 | 1.00 | 79/80 | 0 |
| DeepSeek V4 Pro B | 0.0 % (0/60) | 85.6 % (125/146) | 85.6 % (125/146) | 2.7 % (4/146) | 3.4 % (14/412) | 1.9 % (8/412) | 45.0 % (9/20) | 15.0 % (3/20) | 100.0 % (80/80) | 96.7 % (89/92) | 0.0107 | 70.9 | 2.00 | 80/80 | 0 |
| DeepSeek V4 Pro C | 0.0 % (0/60) | 95.2 % (139/146) | 95.2 % (139/146) | 1.4 % (2/146) | 1.9 % (8/412) | 1.0 % (4/412) | 30.0 % (6/20) | 10.0 % (2/20) | 100.0 % (80/80) | 98.9 % (91/92) | 0.0107 | 63.7 | 1.75 | 80/80 | 0 |
| GPT-6.1 Sol A | 0.0 % (0/60) | 86.3 % (126/146) | 87.7 % (128/146) | 6.8 % (10/146) | 2.9 % (12/412) | 1.5 % (6/412) | 40.0 % (8/20) | 15.0 % (3/20) | 100.0 % (80/80) | 100.0 % (92/92) | 0.0060 | 8.1 | 1.00 | 80/80 | 0 |
| GPT-6.1 Sol B | 3.3 % (2/60) | 84.9 % (124/146) | 84.9 % (124/146) | 9.6 % (14/146) | 2.4 % (10/412) | 1.7 % (7/412) | 30.0 % (6/20) | 20.0 % (4/20) | 97.5 % (78/80) | 65.2 % (60/92) | 0.0113 | 14.3 | 2.00 | 80/80 | 0 |
| GPT-6.1 Sol C | 0.0 % (0/60) | 97.3 % (142/146) | 97.3 % (142/146) | 2.7 % (4/146) | 1.9 % (8/412) | 1.2 % (5/412) | 30.0 % (6/20) | 15.0 % (3/20) | 100.0 % (80/80) | 96.7 % (89/92) | 0.0092 | 10.3 | 1.75 | 80/80 | 0 |
| Claude Opus 5.5 A | 0.0 % (0/60) | 91.1 % (133/146) | 91.1 % (133/146) | 3.4 % (5/146) | 2.9 % (12/412) | 1.2 % (5/412) | 40.0 % (8/20) | 10.0 % (2/20) | 100.0 % (80/80) | 100.0 % (92/92) | 0.0201 | 6.8 | 1.00 | 80/80 | 0 |
| Claude Opus 5.5 B | 0.0 % (0/60) | 86.3 % (126/146) | 87.7 % (128/146) | 6.8 % (10/146) | 3.2 % (13/412) | 1.0 % (4/412) | 30.0 % (6/20) | 0.0 % (0/20) | 100.0 % (80/80) | 93.5 % (86/92) | 0.0475 | 16.7 | 2.00 | 80/80 | 0 |
| Claude Opus 5.5 C | 0.0 % (0/60) | 99.3 % (145/146) | 100.0 % (146/146) | 0.0 % (0/146) | 1.9 % (8/412) | 0.5 % (2/412) | 40.0 % (8/20) | 10.0 % (2/20) | 100.0 % (80/80) | 100.0 % (92/92) | 0.0320 | 11.4 | 1.75 | 80/80 | 0 |

## By class and arm (all families pooled)

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed (any direction) | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance, post hoc) | class 4: changed anything ↓ (frozen) | class 4 (substance, post hoc) | right action | obligations (diag.) | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| class 1 (stale fact) A | 0.0 % (0/60) | 86.7 % (130/150) | 88.0 % (132/150) | 5.3 % (8/150) | 0.4 % (1/252) | 0.4 % (1/252) | – | – | 100.0 % (60/60) | 100.0 % (84/84) | 0.0120 | 23.0 | 1.00 | 60/60 | 0 |
| class 1 (stale fact) B | 0.0 % (0/60) | 86.0 % (129/150) | 86.7 % (130/150) | 6.7 % (10/150) | 1.2 % (3/252) | 0.8 % (2/252) | – | – | 100.0 % (60/60) | 88.1 % (74/84) | 0.0239 | 37.0 | 2.00 | 60/60 | 0 |
| class 1 (stale fact) C | 0.0 % (0/60) | 96.7 % (145/150) | 97.3 % (146/150) | 1.3 % (2/150) | 0.0 % (0/252) | 0.0 % (0/252) | – | – | 100.0 % (60/60) | 100.0 % (84/84) | 0.0180 | 28.9 | 2.00 | 60/60 | 0 |
| class 2 (changed rule) A | 0.0 % (0/60) | 87.5 % (105/120) | 87.5 % (105/120) | 0.8 % (1/120) | 1.0 % (3/306) | 0.7 % (2/306) | – | – | 100.0 % (60/60) | 100.0 % (60/60) | 0.0115 | 23.3 | 1.00 | 60/60 | 0 |
| class 2 (changed rule) B | 0.0 % (0/60) | 85.0 % (102/120) | 85.0 % (102/120) | 1.7 % (2/120) | 2.3 % (7/306) | 1.6 % (5/306) | – | – | 100.0 % (60/60) | 83.3 % (50/60) | 0.0232 | 36.4 | 2.00 | 60/60 | 0 |
| class 2 (changed rule) C | 0.0 % (0/60) | 97.5 % (117/120) | 97.5 % (117/120) | 0.0 % (0/120) | 0.0 % (0/306) | 0.0 % (0/306) | – | – | 100.0 % (60/60) | 95.0 % (57/60) | 0.0218 | 39.2 | 2.00 | 60/60 | 0 |
| class 3 (chain) A | 5.1 % (3/59) | 85.5 % (141/165) | 86.7 % (143/165) | 6.7 % (11/165) | 1.5 % (4/264) | 1.1 % (3/264) | – | – | 94.9 % (56/59) | 100.0 % (65/65) | 0.0131 | 25.5 | 1.00 | 59/60 | 0 |
| class 3 (chain) B | 3.3 % (2/60) | 85.7 % (144/168) | 86.3 % (145/168) | 9.5 % (16/168) | 2.2 % (6/270) | 1.9 % (5/270) | – | – | 96.7 % (58/60) | 84.8 % (56/66) | 0.0269 | 41.8 | 2.00 | 60/60 | 0 |
| class 3 (chain) C | 0.0 % (0/60) | 97.6 % (164/168) | 97.6 % (164/168) | 2.4 % (4/168) | 1.5 % (4/270) | 1.5 % (4/270) | – | – | 100.0 % (60/60) | 98.5 % (65/66) | 0.0216 | 36.9 | 2.00 | 60/60 | 0 |
| class 4 (control) A | – | – | – | – | 5.9 % (24/408) | 1.7 % (7/408) | 40.0 % (24/60) | 11.7 % (7/60) | 100.0 % (60/60) | 100.0 % (66/66) | 0.0078 | 9.9 | 1.00 | 60/60 | 0 |
| class 4 (control) B | – | – | – | – | 5.1 % (21/408) | 1.7 % (7/408) | 35.0 % (21/60) | 11.7 % (7/60) | 100.0 % (60/60) | 83.3 % (55/66) | 0.0186 | 20.7 | 2.00 | 60/60 | 0 |
| class 4 (control) C | – | – | – | – | 4.9 % (20/408) | 1.7 % (7/408) | 33.3 % (20/60) | 11.7 % (7/60) | 100.0 % (60/60) | 100.0 % (66/66) | 0.0079 | 8.9 | 1.00 | 60/60 | 0 |

## Family × class (stale action / propagation; class 4: changed anything, frozen and substance)

| family | class | A | B | C |
|---|---|---|---|---|
| DeepSeek V4 Pro | 1 | 0 % (0/20) / 84 % (42/50) | 0 % (0/20) / 88 % (44/50) | 0 % (0/20) / 96 % (48/50) |
| DeepSeek V4 Pro | 2 | 0 % (0/20) / 88 % (35/40) | 0 % (0/20) / 82 % (33/40) | 0 % (0/20) / 92 % (37/40) |
| DeepSeek V4 Pro | 3 | 16 % (3/19) / 75 % (40/53) | 0 % (0/20) / 86 % (48/56) | 0 % (0/20) / 96 % (54/56) |
| DeepSeek V4 Pro | 4 | 40 % (8/20) (substance 10 % (2/20)) | 45 % (9/20) (substance 15 % (3/20)) | 30 % (6/20) (substance 10 % (2/20)) |
| GPT-6.1 Sol | 1 | 0 % (0/20) / 82 % (41/50) | 0 % (0/20) / 84 % (42/50) | 0 % (0/20) / 96 % (48/50) |
| GPT-6.1 Sol | 2 | 0 % (0/20) / 90 % (36/40) | 0 % (0/20) / 90 % (36/40) | 0 % (0/20) / 100 % (40/40) |
| GPT-6.1 Sol | 3 | 0 % (0/20) / 88 % (49/56) | 10 % (2/20) / 82 % (46/56) | 0 % (0/20) / 96 % (54/56) |
| GPT-6.1 Sol | 4 | 40 % (8/20) (substance 15 % (3/20)) | 30 % (6/20) (substance 20 % (4/20)) | 30 % (6/20) (substance 15 % (3/20)) |
| Claude Opus 5.5 | 1 | 0 % (0/20) / 94 % (47/50) | 0 % (0/20) / 86 % (43/50) | 0 % (0/20) / 98 % (49/50) |
| Claude Opus 5.5 | 2 | 0 % (0/20) / 85 % (34/40) | 0 % (0/20) / 82 % (33/40) | 0 % (0/20) / 100 % (40/40) |
| Claude Opus 5.5 | 3 | 0 % (0/20) / 93 % (52/56) | 0 % (0/20) / 89 % (50/56) | 0 % (0/20) / 100 % (56/56) |
| Claude Opus 5.5 | 4 | 40 % (8/20) (substance 10 % (2/20)) | 30 % (6/20) (substance 0 % (0/20)) | 40 % (8/20) (substance 10 % (2/20)) |

## Diagnostics

- DeepSeek V4 Pro: Mem0 kept the change in 74/80 units (lost by class: {4: 6}); the search returned it in 72/80; the search returned 138/146 touched decisions (94.5 %) — the rest only C's walk could reach.
- GPT-6.1 Sol: Mem0 kept the change in 75/80 units (lost by class: {4: 5}); the search returned it in 73/80; the search returned 138/146 touched decisions (94.5 %) — the rest only C's walk could reach.
- Claude Opus 5.5: Mem0 kept the change in 80/80 units (lost by class: none); the search returned it in 79/80; the search returned 137/146 touched decisions (93.8 %) — the rest only C's walk could reach.

Propagation on touched decisions the search **returned** vs **did not return** (A and B saw only the first kind; C's walk reaches both):

| family | arm | returned by search | not returned |
|---|---|---|---|
| DeepSeek V4 Pro | A | 86.7 % (117/135) | 0.0 % (0/8) |
| DeepSeek V4 Pro | B | 90.6 % (125/138) | 0.0 % (0/8) |
| DeepSeek V4 Pro | C | 95.7 % (132/138) | 87.5 % (7/8) |
| GPT-6.1 Sol | A | 91.3 % (126/138) | 0.0 % (0/8) |
| GPT-6.1 Sol | B | 89.9 % (124/138) | 0.0 % (0/8) |
| GPT-6.1 Sol | C | 97.1 % (134/138) | 100.0 % (8/8) |
| Claude Opus 5.5 | A | 96.4 % (132/137) | 11.1 % (1/9) |
| Claude Opus 5.5 | B | 91.2 % (125/137) | 11.1 % (1/9) |
| Claude Opus 5.5 | C | 99.3 % (136/137) | 100.0 % (9/9) |
- Judges: {'agree': 584, 'referee (re-read)': 3, 'referee': 132} (agree = both Haiku passes identical; referee = Sol decided the disagreeing fields).

## Worked examples (chosen by rule, not by hand)

### 1. A chain where C and B differed

**S3-01 — Fundraiser dinner seating** (class 3), Claude Opus 5.5, repeat 1.

- Change (2026-10-16): Correction from the hall after its fire inspection: the main room's seated limit is 56, not 80, for any event from 1 November. The Tanner Lane step-free side door is unchanged. Revokes: F1.
- Mem0 kept: «[C1 | correction | 2026-10-16 | source: Riverside Hall booking office] After its fire inspection, Riverside Hall corrected its main room's seated limit to 56, not 80, for any event from 1 November 2026, which includes the fundraiser dinner on Saturday 7 November. The step-free entrance via the Tanner Lane side door is unchanged. This revokes F1.» (search returned it).
- Task: RentCo need the final chair and table numbers for the dinner today. Place the order. — a) 76 chairs and 10 tables; b) 56 chairs and 7 tables; c) 80 chairs and 10 tables
- Key: correct ['b'], stale ['a', 'c']; touched D2 → The seated guest list is cut to at most 56 (the hall's new limit); the others are not seated invitees (waiting list or apology)., D4 → The RentCo order becomes 56 chairs and 7 tables (not 76/10)., D5 → Lumen Kitchen is booked for at most 56 covers, not 76.; untouched ['D1', 'D3', 'D6', 'D7'].

B's check (call 1):

```
# Placing the RentCo order: 56 chairs and 7 tables (option b)

## What's out of date

- **Hall capacity has changed.** On 16 October, Riverside Hall's booking office lowered the main room's seated limit from 80 to **56** for events from 1 November (C1). That includes the dinner on Saturday 7 November. The old figure of 80 (F1) no longer holds.
- **The original order no longer works.** You decided to invite all 76 people seated (D2) because the hall held 80. The RentCo order for 76 chairs and 10 tables (D4) was based on that. 76 chairs would exceed the new limit by 20, so I'm not using that number.
- **Option c (80 chairs) is also out.** It uses the old capacity.

## The order

| Item | Quantity | Unit price | Cost |
|---|---|---|---|
| Folding chairs | 56 | 2.10 | 117.60 |
| Round tables (seating eight) | 7 | 9.50 | 66.50 |
| **Total** | | | **184.10** |

- **Delivery:** Friday 6 November, the day before the dinner.
- **Minimum order:** 30 chairs, so 56 meets it.
- **Second signature:** not needed. The total is well under the 500 threshold (R1).
- **Raffle table:** Jo's raffle table by the stage is not counted in the seating (D6). If the hall doesn't supply one, tell me and I'll add an extra table.

## Still valid

- The step-free entrance via the Tanner Lane side door is unchanged. The plan for Petra to bring Grandad in that way (D3) still stands.

## Follow-up actions

1. **Today:** once RentCo confirms, I'll text Sam, the hall caretaker, the delivery slot for Friday 6 November (O1, due today).
2. **You need to decide something.** The invitations went out on 1 October to all 76 people, but only 56 can be seated. You'll need to decide how to handle the extra 20, for example by asking for RSVPs, contacting late responders, or using a different arrangement. If you want more than 56 seated guests, the room won't allow it.
3. **By 28 October:** the Lumen Kitchen booking is still for 76 covers (D5). The final number must be no more than 56. At 31 per cover, that's up to 1,736, compared with 2,356 for 76.
   - 1,736 plus the RentCo order fits within the 1,900 float.
   - Any single payment over 500, including the catering bill, will need a second committee signature.
```

C's layer: reached ['D2', 'D3', 'D4', 'D5']; marks `{"D2": {"mark": "revise", "why": "Seating all 76 invitees relied on F1's 80-seat limit, and C1 cuts the limit to 56 for events from 1 November, which covers the 7 November dinner."}, "D3": {"mark": "keep", "why": "This decision uses only the Tanner Lane step-free side door, which C1 explicitly says is unchanged."}, "D4": {"mark": "revise", "why": "The order of 76 chairs and 10 tables comes from D2's 76 seated guests, which no longer fit under the 56-seat limit."}, "D5": {"mark": "revise", "why": "Booking 76 covers comes from D2's 76 seated guests, and the new 56-seat limit means that number no longer holds."}}`

**A** — action b (right); substance (post hoc) `{}`; propagated 1 of 3; untouched changed []; judges `{"direction": {"D4": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm placing the RentCo order for 56 chairs and 7 round tables, for delivery on Friday 6 November, because Riverside Hall's main room now seats at most 56 (7 tables of eight). I'm also texting the delivery slot to Sam, the hall caretaker.",
 "revise": [
  {
   "id": "D4",
   "now": "Order 56 chairs and 7 round tables from RentCo for delivery on Friday 6 November (total 184.10, under the 500 second-signature limit)."
  }
 ],
 "ask": [
  {
   "id": "D2",
   "question": "Invitations went to all 76 people for a seated dinner, but the hall now seats only 56. How do you want to handle the 20 extra: cap RSVPs at 56, move to another venue, or something else?"
  },
  {
   "id": "D5",
   "question": "Lumen Kitchen is booked for 76 covers and the final number is due 28 October. Should I plan to give them 56 at most, or wait until the guest list is settled?"
  }
 ],
 "note": "Riverside Hall cut its seated limit from 80 to 56 after a fire inspection, so I ordered 56 chairs and 7 tables. The 76 invitations already sent and the 76-cover catering booking now need your decision."
}
```

**B** — action b (right); substance (post hoc) `{}`; propagated 2 of 3; untouched changed []; judges `{"direction": {"D4": true, "D5": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm placing the RentCo order for 56 folding chairs and 7 round tables, delivered Friday 6 November, for 184.10, which is within the hall's corrected seated limit of 56. Once RentCo confirms the delivery slot, I'll text it to Sam, the hall caretaker.",
 "revise": [
  {
   "id": "D4",
   "now": "Order 56 chairs and 7 round tables from RentCo (184.10) for delivery on Friday 6 November, matching Riverside Hall's corrected seated limit of 56."
  },
  {
   "id": "D5",
   "now": "Lumen Kitchen stays booked with the vegetarian main on every table, but the final number given by 28 October can be no more than 56 covers (at most 1,736), not 76."
  }
 ],
 "ask": [
  {
   "id": "D2",
   "question": "All 76 people on last year's list were invited on 1 October, but only 56 can now be seated. How do you want to handle the extra 20? For example, an RSVP cutoff, first-come seating, or telling some guests the dinner is full?"
  }
 ],
 "note": "Correction to my earlier check: 56 covers (1,736) plus RentCo (184.10) comes to 1,920.10, which is 20.10 over the 1,900 float, and the catering bill needs a second committee signature."
}
```

**C** — action b (right); substance (post hoc) `{}`; propagated 3 of 3; untouched changed []; judges `{"direction": {"D2": true, "D4": true, "D5": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm placing the RentCo order for 56 folding chairs and 7 round tables, delivered Friday 6 November, which costs 184.10 and so needs no second signature. I'll then text Sam, the hall caretaker, the delivery slot.",
 "revise": [
  {
   "id": "D4",
   "now": "Order 56 chairs and 7 round tables from RentCo for delivery on Friday 6 November."
  },
  {
   "id": "D2",
   "now": "Seat at most 56 guests at the dinner, the hall's new limit, at 7 tables of eight."
  },
  {
   "id": "D5",
   "now": "Book Lumen Kitchen for at most 56 covers, with the vegetarian main on every table. Give the final number by 28 October."
  }
 ],
 "ask": [],
 "note": "The hall now seats only 56, but invitations went to all 76 on 1 October, so we need to decide how to fit RSVPs to 56 before the caterer's 28 October deadline. Grandad's Tanner Lane step-free entrance is unchanged."
}
```

### 2. A control where B changed something (a real change, by the post-hoc substance judges)

**S4-02 — Moving the dog's vet appointment** (class 4), GPT-6.1 Sol, repeat 1.

- Change (2026-09-18): A reminder from the reception team: please give us at least a full day's notice to cancel or rearrange an appointment; changes made with less notice than that carry the 25 late-change charge. Revokes: —.
- Mem0 kept: nothing (search did not return it).
- Task: Ring Willowbank this morning and sort out Pepper's appointment. — a) Move it to Saturday 26 September, 10:20; b) Keep Wednesday 23 September, 17:15; c) Cancel it and rebook in October
- Key: correct ['a'], stale []; touched none; untouched ['D1', 'D2', 'D3', 'D4', 'D5'].

B's check (call 1):

```
**a) Move Pepper to Saturday 26 September at 10:20 with Dr Okafor.**

The original plan for Wednesday 23 September at 17:15 was superseded by your decision on 15 September because neither you nor Zofia could take him. However, Wednesday is still the live booking: reception only pencilled in Saturday, pending your confirmation and release of Wednesday’s slot.

I have no later correction to that plan. The changes to make are:
- Confirm Saturday and release Wednesday—today gives more than 24 hours’ notice, so no late-change fee applies.
- Update the shared family calendar today once reception confirms. You’re taking Pepper.

I can’t place the call from here, so the appointment is **not yet confirmed**.
```

C's layer: reached []; marks `{}`

**A** — action a (right); substance (post hoc) `{"D3": "changed"}`; propagated 0 of 0; untouched changed ['D3']; judges `{"direction": {}, "changes_untouched_in_text": []}`

```json
{
 "action": "a",
 "what_i_do": "Ring Willowbank this morning to confirm Pepper’s check-up and booster for Saturday 26 September at 10:20 with Dr Okafor and release the Wednesday slot. Put the confirmed appointment in the shared family calendar today, with Tomasz taking Pepper.",
 "revise": [
  {
   "id": "D3",
   "now": "Pepper’s move to Saturday 26 September at 10:20 with Dr Okafor is confirmed, replacing Wednesday 23 September at 17:15; Tomasz takes him, and no late-change fee applies."
  }
 ],
 "ask": [],
 "note": "Pepper’s Saturday appointment is sorted and entered in the family calendar."
}
```

**B** — action a (right); substance (post hoc) `{"D3": "changed"}`; propagated 0 of 0; untouched changed ['D3']; judges `{"direction": {}, "changes_untouched_in_text": ["D3"]}`

```json
{
 "action": "a",
 "what_i_do": "I can’t place calls from here, so I haven’t confirmed Saturday or released Wednesday. Once reception confirms the move, the shared family calendar needs updating the same day.",
 "revise": [],
 "ask": [],
 "note": "Please ring Willowbank this morning to confirm Saturday 26 September at 10:20 with Dr Okafor and release Wednesday’s slot; you’re taking Pepper, and no late-change fee applies."
}
```

**C** — action a (right); substance (post hoc) `{"D3": "changed"}`; propagated 0 of 0; untouched changed ['D3']; judges `{"direction": {}, "changes_untouched_in_text": ["D3"]}`

```json
{
 "action": "a",
 "what_i_do": "Ring Willowbank to release Pepper’s Wednesday 23 September, 17:15 slot and confirm Saturday 26 September at 10:20 with Dr Okafor. Put the confirmed appointment in the shared family calendar today, with Tomasz taking Pepper.",
 "revise": [],
 "ask": [],
 "note": "The move gives more than 24 hours’ notice, so no late-change fee applies."
}
```

### 3. One where C was wrong

**S1-06 — Dog-walk rota and invoice** (class 1), Claude Opus 5.5, repeat 1.

- Change (2026-11-02): Mrs Okafor's work pattern has changed: from Monday 9 November Pepper needs walking at 12:30 on Tuesdays and Thursdays only, not on Mondays, Wednesdays or Fridays. The key safe, the lead and the towel are unchanged. Revokes: F1.
- Mem0 kept: «Mrs Okafor's work pattern changed (stated 2026-11-02): from Monday 9 November 2026, Pepper, the Okafors' collie cross, needs walking at 12:30 on Tuesdays and Thursdays only, no longer on Mondays, Wednesdays or Fridays. This revokes F1, the previous Monday/Wednesday/Friday 12:30 schedule.»; «Per Mrs Okafor on 2026-11-02, the arrangements for Pepper's walks are unchanged after the schedule change: the key is still in the key safe by the side gate, and the lead and towel are still in the porch.» (search returned it).
- Task: It's Friday, so next week's rota and invoices go out tonight. What do I put down for Pepper? — a) Mon, Wed and Fri 12:30 walk; invoice 42; b) Tue and Thu 12:30 walk; invoice 42; c) Mon, Wed and Fri 12:30 walk; invoice 28; d) Tue and Thu 12:30 walk; invoice 28
- Key: correct ['d'], stale ['a', 'b', 'c']; touched D2 → Pepper moves to the Tuesday and Thursday 12:30 walk with Juno, Kip and Otto (four dogs, within the limit)., D3 → The Okafors are invoiced for two walks a week, 28., D6 → Pepper's Christmas-week walks are Tuesday 22 and Thursday 24 December.; untouched ['D1', 'D4', 'D5', 'D7', 'D8'].

B's check (call 1):

```
**Put down d): Pepper on Tuesday and Thursday at 12:30, invoice £28.**

**What's out of date**

On 2 November Mrs Okafor said that from Monday 9 November, Pepper needs walking on **Tuesdays and Thursdays only**. That replaces F1, the old Monday, Wednesday and Friday schedule. Several things relied on F1, so I've changed them:

- **D2, Pepper in the Monday/Wednesday/Friday group walk:** no longer applies. From next week she isn't in the walk with Mabel and Biscuit (and Rolo's held place). Her Tuesday and Thursday 12:30 walks are a new slot. Under D4 you still do all the 12:30 walks yourself, since Zoe only works mornings.
- **D3, invoicing three walks at £14 (£42 a week):** replaced by two walks at £14, so **£28 a week**. Per R2, tonight's invoice covers the week of 9 November, the first week of the new pattern.
- **D6, Christmas-week walks pencilled for Monday 21 and Wednesday 23 December:** this was based on the old days, so I've flagged it. On the new pattern, Christmas week would be **Tuesday 22 and Thursday 24 December**. Neither is a bank holiday. You still need to confirm this with Mrs Okafor by 1 December (O3).

**Still the same**

- The key is in the key safe by the side gate, and the lead and towel are in the porch. Mrs Okafor confirmed this on 2 November.
- Pepper stays on the lead around the lake from November (D8).

Both the rota and the invoices are due tonight (O1, O2). When you send Zoe and the clients the rota, show Pepper on Tuesday and Thursday 12:30 and take her off the Monday, Wednesday and Friday walk.
```

C's layer: reached ['D2', 'D3', 'D6']; marks `{"D2": {"mark": "revise", "why": "From 9 November Pepper is walked only on Tuesdays and Thursdays, so she no longer belongs in the Monday/Wednesday/Friday 12:30 group walk."}, "D3": {"mark": "revise", "why": "The three-walks-a-week invoice of 42 assumed the Monday/Wednesday/Friday schedule, but from 9 November it is two walks a week, which affects the invoice issued today (Friday 6 November) for that week."}, "D6": {"mark": "revise", "why": "The Christmas-week dates of Monday 21 and Wednesday 23 December follow the old schedule, but by then Pepper's walks fall on Tuesdays and Thursdays (22 and 24 December)."}}`

**A** — action d (right); substance (post hoc) `{}`; propagated 3 of 3; untouched changed []; judges `{"direction": {"D2": true, "D3": true, "D6": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "d",
 "what_i_do": "I'm putting Pepper on the rota for a 12:30 walk on Tuesday 10 and Thursday 12 November, with you walking her, and invoicing the Okafors 28 (2 walks at 14). Both the rota (to Zoe and the clients) and the invoices go out tonight.",
 "revise": [
  {
   "id": "D2",
   "now": "From 9 November Pepper leaves the Monday, Wednesday and Friday 12:30 Hartley Woods walk and is walked at 12:30 on Tuesdays and Thursdays."
  },
  {
   "id": "D3",
   "now": "Invoice the Okafors for two walks a week at 14, so 28 a week, from the week of 9 November."
  },
  {
   "id": "D6",
   "now": "Pencil in Pepper's Christmas-week walks for Tuesday 22 and Thursday 24 December. Neither date is a bank holiday."
  }
 ],
 "ask": [],
 "note": "Pepper's Tuesday and Thursday 12:30 walk has no existing group, so she'll be walked on her own unless you want to add anyone. The key, lead and towel are still in the same places, and I'll confirm 22 and 24 December with Mrs Okafor by 1 December."
}
```

**B** — action d (right); substance (post hoc) `{}`; propagated 2 of 3; untouched changed []; judges `{"direction": {"D2": false, "D3": true, "D6": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "d",
 "what_i_do": "I'm putting Pepper down for Tuesday and Thursday at 12:30 from 9 November, taking her off the Monday/Wednesday/Friday walk, and invoicing the Okafors £28 (2 × £14) for next week. Both the rota (to Zoe and the clients) and the invoices go out tonight.",
 "revise": [
  {
   "id": "D2",
   "now": "From 9 November Pepper leaves the Monday/Wednesday/Friday 12:30 Hartley Woods walk with Mabel and Biscuit (and Rolo's held place). She has her own Tuesday and Thursday 12:30 walk, which you do yourself under D4."
  },
  {
   "id": "D3",
   "now": "Invoice the Okafors for two walks a week at £14, so £28 a week, starting with the week of 9 November."
  },
  {
   "id": "D6",
   "now": "Pencil in Pepper's Christmas-week walks for Tuesday 22 and Thursday 24 December instead of Monday 21 and Wednesday 23. Neither is a bank holiday. Still to confirm with Mrs Okafor by 1 December (O3)."
  }
 ],
 "ask": [],
 "note": "Pepper's Christmas-week walks now fall on Tuesday 22 and Thursday 24 December, including Christmas Eve. Let me know if you'd rather not walk that day before you confirm with Mrs Okafor."
}
```

**C** — action d (right); substance (post hoc) `{}`; propagated 2 of 3; untouched changed []; judges `{"direction": {"D2": false, "D3": true, "D6": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "d",
 "what_i_do": "From Monday 9 November I put Pepper on the rota for a 12:30 walk on Tuesday and Thursday only, taken by you, and invoice the Okafors 28 (two walks at 14). This goes into tonight's rota to Zoe and the clients and tonight's invoices.",
 "revise": [
  {
   "id": "D2",
   "now": "Pepper leaves the Monday, Wednesday and Friday 12:30 Hartley Woods group from 9 November; she is walked at 12:30 on Tuesdays and Thursdays instead."
  },
  {
   "id": "D3",
   "now": "Invoice the Okafors for two walks a week at 14, which is 28 a week, starting with the week of 9 November."
  },
  {
   "id": "D6",
   "now": "Pencil in Pepper's Christmas-week walks for Tuesday 22 and Thursday 24 December. Neither day is a bank holiday."
  }
 ],
 "ask": [],
 "note": "Pepper's Tuesday and Thursday 12:30 walks are new slots with no group walk on those days, so she'll be on her own unless you pair her. When you confirm Christmas week with Mrs Okafor by 1 December (O3), use 22 and 24 December."
}
```


## Spend by door

**OpenRouter $18.4791** of the $130 ceiling (subjects, Mem0's own calls, judges, referee, smoke and dry run). Anthropic key $0, OpenAI key $0, Bedrock $0.

| who | part | $ |
|---|---|---|
| deepseek | A | 0.5722 |
| deepseek | B | 0.8539 |
| deepseek | C | 0.8530 |
| deepseek | mem0 | 0.3787 |
| haiku | A | 0.0039 |
| haiku | B | 0.0086 |
| haiku | C | 0.0049 |
| haiku | mem0 | 0.0071 |
| judge | judge | 0.3367 |
| judge | referee | 0.3034 |
| opus | A | 1.6086 |
| opus | B | 3.7984 |
| opus | C | 2.5596 |
| opus | mem0 | 4.7817 |
| smoke | A | 0.0019 |
| smoke | B | 0.0047 |
| smoke | C | 0.0033 |
| smoke | mem0 | 0.0033 |
| sol | A | 0.4830 |
| sol | B | 0.9058 |
| sol | C | 0.7375 |
| sol | mem0 | 0.2688 |

Spend checks (30; every one held):

- 2026-11-10T08:53:28+00:00 before dry run (Haiku): credit left $213.69 (before the shared-budget rule); stage spent $0.01; projected $1.00 → holds
- 2026-11-10T08:57:01+00:00 before deepseek (classes [1, 2, 3, 4]): credit left $213.65 (before the shared-budget rule); stage spent $0.05; projected $10.60 → holds
- 2026-11-10T09:26:43+00:00 before sol (classes [1, 2, 3, 4]): credit left $360.87, less the $200 reserve for #4 → $160.87; stage spent $2.83; projected $23.61 → holds
- 2026-11-10T09:26:44+00:00 before sol units batch 1 (30 units): credit left $360.87, less the $200 reserve for #4 → $160.87; stage spent $2.83; projected $8.85 → holds
- 2026-11-10T09:28:55+00:00 before sol units batch 2 (30 units): credit left $359.93, less the $200 reserve for #4 → $159.93; stage spent $3.87; projected $8.85 → holds
- 2026-11-10T09:29:14+00:00 before post-hoc substance deepseek batch 1: credit left $359.74, less the $200 reserve for #4 → $159.74; stage spent $3.89; projected $0.24 → holds
- 2026-11-10T09:29:16+00:00 before post-hoc substance deepseek batch 2: credit left $359.74, less the $200 reserve for #4 → $159.74; stage spent $3.89; projected $0.24 → holds
- 2026-11-10T09:29:19+00:00 before post-hoc substance deepseek batch 3: credit left $359.74, less the $200 reserve for #4 → $159.74; stage spent $3.89; projected $0.24 → holds
- 2026-11-10T09:29:22+00:00 before post-hoc substance deepseek batch 4: credit left $359.74, less the $200 reserve for #4 → $159.74; stage spent $3.89; projected $0.24 → holds
- 2026-11-10T09:30:53+00:00 before sol units batch 3 (20 units): credit left $359.07, less the $200 reserve for #4 → $159.07; stage spent $4.71; projected $5.90 → holds
- 2026-11-10T09:32:24+00:00 before judging sol batch 1 (60 arm-runs): credit left $358.42, less the $200 reserve for #4 → $158.42; stage spent $5.23; projected $0.82 → holds
- 2026-11-10T09:33:20+00:00 before judging sol batch 2 (60 arm-runs): credit left $358.28, less the $200 reserve for #4 → $158.28; stage spent $5.26; projected $0.82 → holds
- 2026-11-10T09:34:16+00:00 before judging sol batch 3 (60 arm-runs): credit left $358.25, less the $200 reserve for #4 → $158.25; stage spent $5.29; projected $0.82 → holds
- 2026-11-10T09:35:09+00:00 before judging sol batch 4 (60 arm-runs): credit left $358.21, less the $200 reserve for #4 → $158.21; stage spent $5.32; projected $0.82 → holds
- 2026-11-10T09:36:22+00:00 before post-hoc substance sol batch 1: credit left $358.15, less the $200 reserve for #4 → $158.15; stage spent $5.37; projected $0.24 → holds
- 2026-11-10T09:36:29+00:00 before post-hoc substance sol batch 2: credit left $358.14, less the $200 reserve for #4 → $158.14; stage spent $5.37; projected $0.24 → holds
- 2026-11-10T09:36:32+00:00 before post-hoc substance sol batch 3: credit left $358.14, less the $200 reserve for #4 → $158.14; stage spent $5.37; projected $0.24 → holds
- 2026-11-10T09:36:35+00:00 before post-hoc substance sol batch 4: credit left $358.14, less the $200 reserve for #4 → $158.14; stage spent $5.37; projected $0.24 → holds
- 2026-11-10T09:37:09+00:00 before opus (classes [1, 2, 3, 4]): credit left $358.14, less the $200 reserve for #4 → $158.14; stage spent $5.38; projected $43.60 → holds
- 2026-11-10T09:37:09+00:00 before opus units batch 1 (30 units): credit left $358.03, less the $200 reserve for #4 → $158.03; stage spent $5.38; projected $16.35 → holds
- 2026-11-10T09:39:26+00:00 before opus units batch 2 (30 units): credit left $352.35, less the $200 reserve for #4 → $152.35; stage spent $10.45; projected $16.35 → holds
- 2026-11-10T09:42:04+00:00 before opus units batch 3 (20 units): credit left $346.76, less the $200 reserve for #4 → $146.76; stage spent $15.07; projected $10.90 → holds
- 2026-11-10T09:43:44+00:00 before judging opus batch 1 (60 arm-runs): credit left $342.66, less the $200 reserve for #4 → $142.66; stage spent $18.13; projected $0.82 → holds
- 2026-11-10T09:44:41+00:00 before judging opus batch 2 (60 arm-runs): credit left $342.20, less the $200 reserve for #4 → $142.20; stage spent $18.17; projected $0.82 → holds
- 2026-11-10T09:45:43+00:00 before judging opus batch 3 (60 arm-runs): credit left $341.80, less the $200 reserve for #4 → $141.80; stage spent $18.21; projected $0.82 → holds
- 2026-11-10T09:45:59+00:00 before judging opus batch 4 (60 arm-runs): credit left $341.63, less the $200 reserve for #4 → $141.63; stage spent $18.35; projected $0.82 → holds
- 2026-11-10T09:46:21+00:00 before post-hoc substance opus batch 1: credit left $341.42, less the $200 reserve for #4 → $141.42; stage spent $18.47; projected $0.24 → holds
- 2026-11-10T09:46:21+00:00 before post-hoc substance opus batch 2: credit left $341.42, less the $200 reserve for #4 → $141.42; stage spent $18.47; projected $0.24 → holds
- 2026-11-10T09:46:26+00:00 before post-hoc substance opus batch 3: credit left $341.23, less the $200 reserve for #4 → $141.23; stage spent $18.47; projected $0.24 → holds
- 2026-11-10T09:46:35+00:00 before post-hoc substance opus batch 4: credit left $341.23, less the $200 reserve for #4 → $141.23; stage spent $18.47; projected $0.24 → holds

## Notes on record

- **The reviewer** (GPT-6, the owner's chat, 2026-11-10 00:10 LA, as the mandate records it): the scientific point is C over B; unnecessary intervention is a required guard; forty scenarios are a pilot, not a basis for statistical claims. This report follows all three.
- **The owner** gave no bets and delegated the launch («дай ей команду, чтобы не ждало меня, а сразу погнало эксперимент»). The session did not stop after the dry run. It posted the dry-run trace to #3 at 08:56 UTC and went on. No objection had appeared in #3 when the runs ended.
- **The shared-budget rule** was posted in #3 at 09:11 UTC (TONE_SPLIT_4 amendment `b4c6907` on `claude/handoff`) and adopted at 09:26 UTC, before Sol. Under it, $200 of the key is reserved for #4, and a spend check runs before every batch of ≤ 200 calls. DeepSeek had started at 08:57 under the per-family check alone. Its whole spend ($2.79) kept the key above the reserve (the balance was $213.65 before DeepSeek, then topped up to ≈ $361 at 09:10). Every later check held: Sol, Opus, judging and the post-hoc passes, each in batches.
- **Owner acceptance is pending.** This report shows that the work is done. It does not show that the owner has accepted it.

## Deviations and limits (read before the numbers)

1. **Opus's judging lost its two Haiku passes for half the runs.** All four judge refusals in the stage were Haiku refusing to judge Opus's replies on one scenario: **S2-10**, frozen yeast strains and seed samples shipped abroad with customs permits. They look like a content-filter false positive. The fourth refusal tripped the breaker («three on one family-arm»), which the harness applies to the judge lane too. The remaining **120 Opus arm-runs were judged by the Sol referee alone**: 124 «referee» judgments for Opus, against 8 for DeepSeek and Sol together. Nothing refused was asked again. The mechanical «listed» measure, which no judge touches, gives the same picture as the judged one for every family (Opus: A 91.1 %, B 87.7 %, C 100 % listed against 91.1 %, 86.3 %, 99.3 % judged). So this asymmetry does not drive AU2 or AU5.
2. **Post hoc: a substance measure for the guard.** It was committed as `1fec40f` before any Sol or Opus unit was read; see the freeze file. The frozen guard counts an untouched decision as changed when the reply lists it under `revise`. Models list the decision they are carrying out, unchanged, in every arm. The post-hoc judges remove most of these, but not all. On reading, the remaining class-4 «changes» by B (S4-02 D3, S4-03 D6, S4-09 D4) are still confirmations of the plan being carried out. **The class-4 guard is therefore only weakly measured by either instrument.** The robust fact is that no arm in any family chose a plan-changing option on a control (0 of 180).
3. **The change goes in through Mem0's own inference; the history is seeded verbatim.** Mem0 dropped the change in 11 of 240 units. All 11 were class-4 «rule restated» controls, which Mem0's extractor treated as duplicates of the rule already stored; that is Mem0 working as designed. In those units no arm, C included, could see the change: the layer reads only what Mem0 holds.
4. **C skips its marking call when the walk reaches nothing.** That happens on class-4 controls with nothing to walk, so C averaged 1.75 calls a run against B's 2. Part of C's cost and latency advantage (AU4) comes from this.
5. **Ceiling.** Stale actions were near zero in every arm, and most scenarios were solved by every arm. The authored histories (16–39 items) mostly fit in Mem0's top-20 search. Longer or noisier memories would test retrieval harder; we did not test that.
6. **Smoke tests before the freeze**: two harness tests on the exemplar S3-01, whose truth table already existed. They cost $0.0149 and are booked in the ledger.

## Readings of the worked examples
- **Example 2** is chosen by the post-hoc measure. Even so, on reading, it shows the measurement problem rather than B fiddling. On S4-02 every reply moved Pepper to Saturday 26 September, which is exactly D3. «Changed» there means «carried out». We found no B reply on a control that changed what a decision says.
- **Example 3** is a genuine C error. On S1-06 Opus's C moved Pepper to Tuesday and Thursday, as it should. It then wrote that there was no group walk on those days, missing the Tuesday/Thursday group with Juno, Kip and Otto that the key requires. The layer had marked D2 «revise» correctly. The agent revised it in the wrong direction.


