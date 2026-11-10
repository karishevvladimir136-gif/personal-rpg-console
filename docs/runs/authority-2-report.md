# AUTHORITY_2 — report

The same layer, arms and judges as AUTHORITY_1, on **17 scenarios written by GLM 5.3 and admitted by two raters (Astra, Kimi K3)**. The tasks force an act; each scenario has a distractor; obligations are measured. **17 scenarios are a pilot: every rate is a pilot rate.** Each cell gives the rate, the count and a Wilson 95 % interval. Pooled rates also get a bootstrap over scenarios (1,000 resamples, stratified by class) in the bootstrap table. Design and hashes: `docs/runs/authority-2-freeze.md` / `.json`. Pool and ratings: `docs/runs/authority-2-pool.md`. Dry run: `docs/runs/authority-2-dry-run.md`. Raw units: `docs/runs/authority-2-units-<family>.jsonl.gz`.

Families run: DeepSeek V4 Pro, GPT-6.1 Sol, Claude Opus 5.5. 102 units × 3 arms = 306 arm-runs.

## In brief

- **The pool was short.** GLM 5.3 wrote 50 candidates and 49 passed the structure check. **Astra rejected 28 as «the truth table does not follow»**, and on reading her objections hold up. Kimi accepted 48. Under the frozen rule, a short class runs short: **17 scenarios were admitted (3 / 3 / 6 / 5), so the stage ran 306 arm-runs, not 720**. κ is near zero on the yes/no questions (Kimi said yes almost every time) and 0.89 on class.
- **AU2 held: the gain survived foreign scenarios, smaller.** Propagation pooled: A 88.7 %, B 84.9 %, **C 96.2 %**. C − A is **+7.5 [1.6, 13.0]**; C − B is **+11.3 [3.9, 17.7]** (bootstrap over scenarios). **It is carried by DeepSeek** (C − A +16.1, C − B +24.2). Sol is smaller (+8.1 / +4.8, the C − B lower bound at 0.0). **For Opus, the gain over the bare backend vanished: C − A −1.6 [−10.0, 10.0]**, C − B +4.8 [−5.0, 13.3].
- **AU1 lost: there were still no stale actions to reduce.** 0 of 72 in every arm, in every family. Distractor pull was also 0 of 102 in every arm. Tasks that force an act and plausible stale values were not enough. Mem0 kept the change in 98 of 102 units, and the search returned it there and returned **every touched decision (100 %)**. GLM's histories (21–29 items) mostly fit in the top-20 search. The change texts announce the new value outright. With this backend and these histories, no stale act was observed.
- **Where C's gain comes from here: the marks alone.** The search returned every touched decision, so the walk added no reach. In AUTHORITY_1, part of the gain was reach.
- **AU3 lost the other way: the plain pass hurt.** B − A on propagation was **−3.8 [−6.2, −1.1]**: DeepSeek −8.1, Opus −6.5, Sol +3.2. **B also dropped obligations**: 87.3 % against A 95.1 % and C 96.1 %, and Sol's B only 76.5 %. After its check, the model writes that it «can't send bookings» and leaves the due act to the owner. The dry run showed this first.
- **AU8 lost: the C − B gap shrank with strength this time** (DeepSeek 24.2, Sol 4.8, Opus 4.8 points). AUTHORITY_1's surprise did not repeat. This time the layer looks like a help weaker families need more.
- **AU6 lost, as bet:** obligations C 96.1 % against A 95.1 %. **AU4 held:** substance changes to untouched decisions ≤ 0.5 % in every arm, and 0 of 30 plan-changing choices on controls in every arm. **AU5 held:** C cost $0.0171 a run against B's $0.0232, and took 48.7 s against 47.4 s. **AU7 held only by the letter:** B ≥ A with both at 0.
- **The reviewer's sentence, scored against the stage's rule** («withdrawn, not softened, if the gain vanishes»). Pooled, the gain on propagation did not vanish. For Opus against the bare backend it did. The stale-action half had nothing to stand on in either stage. *What the data allow:* on seventeen foreign scenarios, three families and two repeats, the layer improved correction propagation over the same memory backend and over a plain check pass, with bootstrap intervals above zero, controlling for unnecessary intervention and at lower cost than the pass. The gain came mostly from DeepSeek, and was absent for Opus against the bare backend. It did not reduce stale actions, because none occurred.

## Bets

| bet | numbers | parts | verdict |
|---|---|---|---|
| AU0 ceiling, sandbox, hashes, layer prompt identical | spent $12.34 of $120; 0 blocked egress attempts in the workers; worker connections only to loopback ['127.0.0.1', '127.0.0.1:33419', '127.0.0.1:36357', '127.0.0.1:42287', '127.0.0.1:46409']; the main process tunnels only to openrouter.ai; AUTHORITY_1's prompts (the layer's `d1c59ee0…` among them) and code hash-checked identical, and AUTHORITY_2's scenarios, truth tables and prompts checked against the freeze, before every command | – | **held** |
| AU1 stale actions exist; C ≤ ½ A, bootstrap separated | A 0.0 %, B 0.0 %, C 0.0 %; bootstrap A 0.0 [0.0, 0.0], C 0.0 [0.0, 0.0] | {'A ≥ 10 %': False, 'B ≥ 8 %': False, 'C ≤ ½ A': True, 'boot hi(C) < boot lo(A)': False} | **lost** |
| AU2 propagation C − A ≥ 6 and C − B ≥ 6, bootstrap lower bounds > 0 | A 88.7 %, B 84.9 %, C 96.2 %; C − A 7.5 [1.6, 13.0], C − B 11.3 [3.9, 17.7] | {'C − A ≥ 6': True, 'C − B ≥ 6': True, 'boot lo(C − A) > 0': True, 'boot lo(C − B) > 0': True} | **held** |
| AU3 plain pass does not help: \|B − A\| ≤ 3 | B − A -3.8 [-6.2, -1.1] points | {'|B − A| ≤ 3': False} | **lost** |
| AU4 guard: substance C ≤ A; class-4 plan-changing 0 everywhere | untouched changed (substance) A 0.2 %, B 0.5 %, C 0.2 %; class-4 plan-changing choices A 0/30, B 0/30, C 0/30 | {'substance C ≤ A': True, 'class-4 plan-changing 0 in every arm': True} | **held** |
| AU5 cost C ≤ 1.5× B, latency ≤ 2× | $/run A 0.0112, B 0.0232, C 0.0171; s/run A 27.4, B 47.4, C 48.7 | {'C ≤ 1.5× B cost': True, 'C ≤ 2× B latency': True} | **held** |
| AU6 obligations C ≥ A + 10 (planner bet: lost) | A 95.1 %, B 87.3 %, C 96.1 %; C − A 1.0 [0.0, 2.9] points | {'C ≥ A + 10': False} | **lost** |
| AU7 distractor pull B ≥ A | A 0.0 %, B 0.0 %, C 0.0 %; B − A 0.0 [0.0, 0.0] points | {'B ≥ A': True} | **held** |
| AU8 C − B gap does not shrink with strength (Opus ≥ DeepSeek) | DeepSeek V4 Pro 24.2, GPT-6.1 Sol 4.8, Claude Opus 5.5 4.8 points | {'Opus gap ≥ DeepSeek gap': False, 'not DeepSeek > Sol > Opus': True} | **lost** |

## Bootstrap over scenarios (point [2.5 %, 97.5 %], points; stale and propagation over classes 1–3, the rest over all classes)

| scope | stale A / B / C (cl. 1–3) | propagation A / B / C (cl. 1–3) | C − A | C − B | B − A | obligation A / B / C | distractor A / B / C |
|---|---|---|---|---|---|---|---|
| all families | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] | 88.7 [83.9, 92.8] / 84.9 [79.0, 91.1] / 96.2 [93.3, 100.0] | 7.5 [1.6, 13.0] | 11.3 [3.9, 17.7] | -3.8 [-6.2, -1.1] | 95.1 [88.2, 100.0] / 87.3 [77.5, 96.1] / 96.1 [88.2, 100.0] | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] |
| DeepSeek V4 Pro | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] | 83.9 [73.4, 95.0] / 75.8 [63.6, 88.3] / 100.0 [100.0, 100.0] | 16.1 [5.0, 26.6] | 24.2 [11.7, 36.4] | -8.1 [-13.3, -1.7] | 94.1 [82.4, 100.0] / 94.1 [82.4, 100.0] / 94.1 [82.4, 100.0] | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] |
| GPT-6.1 Sol | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] | 88.7 [80.3, 98.3] / 91.9 [81.8, 100.0] / 96.8 [90.9, 100.0] | 8.1 [1.7, 12.9] | 4.8 [0.0, 9.1] | 3.2 [0.0, 6.7] | 97.1 [91.2, 100.0] / 76.5 [61.8, 91.2] / 100.0 [100.0, 100.0] | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] |
| Claude Opus 5.5 | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] | 93.5 [90.0, 100.0] / 87.1 [85.0, 90.3] / 91.9 [80.0, 100.0] | -1.6 [-10.0, 10.0] | 4.8 [-5.0, 13.3] | -6.5 [-12.1, -1.7] | 94.1 [82.4, 100.0] / 91.2 [79.4, 100.0] / 94.1 [82.4, 100.0] | 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] / 0.0 [0.0, 0.0] |

## By arm (all families pooled)

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance) | cl. 4 plan-changing ↓ | cl. 4 changed anything (frozen / substance) | obligation done ↑ | obligation listed | distractor pull ↓ | right action | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A** | 0.0 % (0/72) [0–5] | 88.7 % (165/186) [83–92] | 88.7 % (165/186) [83–92] | 4.3 % (8/186) [2–8] | 2.1 % (12/576) [1–4] | 0.2 % (1/576) [0–1] | 0.0 % (0/30) [0–11] | 30 % (9/30) [17–48] / 3 % (1/30) [1–17] | 95.1 % (97/102) [89–98] | 94.1 % (96/102) [88–97] | 0.0 % (0/102) [0–4] | 100.0 % (102/102) [96–100] | 0.0112 | 27.4 | 1.00 | 102/102 | 0 |
| **B** | 0.0 % (0/72) [0–5] | 84.9 % (158/186) [79–89] | 84.9 % (158/186) [79–89] | 5.4 % (10/186) [3–10] | 1.6 % (9/576) [1–3] | 0.5 % (3/576) [0–2] | 0.0 % (0/30) [0–11] | 13 % (4/30) [5–30] / 3 % (1/30) [1–17] | 87.3 % (89/102) [79–92] | 75.5 % (77/102) [66–83] | 0.0 % (0/102) [0–4] | 100.0 % (102/102) [96–100] | 0.0232 | 47.4 | 2.00 | 102/102 | 0 |
| **C** | 0.0 % (0/72) [0–5] | 96.2 % (179/186) [92–98] | 96.2 % (179/186) [92–98] | 0.0 % (0/186) [0–2] | 0.7 % (4/576) [0–2] | 0.2 % (1/576) [0–1] | 0.0 % (0/30) [0–11] | 13 % (4/30) [5–30] / 3 % (1/30) [1–17] | 96.1 % (98/102) [90–98] | 94.1 % (96/102) [88–97] | 0.0 % (0/102) [0–4] | 100.0 % (102/102) [96–100] | 0.0171 | 48.7 | 1.71 | 102/102 | 0 |

## By family and arm

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance) | cl. 4 plan-changing ↓ | cl. 4 changed anything (frozen / substance) | obligation done ↑ | obligation listed | distractor pull ↓ | right action | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DeepSeek V4 Pro A | 0.0 % (0/24) [0–14] | 83.9 % (52/62) [73–91] | 83.9 % (52/62) [73–91] | 1.6 % (1/62) [0–9] | 2.1 % (4/192) [1–5] | 0.5 % (1/192) [0–3] | 0.0 % (0/10) [0–28] | 40 % (4/10) [17–69] / 10 % (1/10) [2–40] | 94.1 % (32/34) [81–98] | 94.1 % (32/34) [81–98] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0063 | 67.7 | 1.00 | 34/34 | 0 |
| DeepSeek V4 Pro B | 0.0 % (0/24) [0–14] | 75.8 % (47/62) [64–85] | 75.8 % (47/62) [64–85] | 3.2 % (2/62) [1–11] | 2.6 % (5/192) [1–6] | 0.5 % (1/192) [0–3] | 0.0 % (0/10) [0–28] | 40 % (4/10) [17–69] / 10 % (1/10) [2–40] | 94.1 % (32/34) [81–98] | 94.1 % (32/34) [81–98] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0088 | 112.1 | 2.00 | 34/34 | 0 |
| DeepSeek V4 Pro C | 0.0 % (0/24) [0–14] | 100.0 % (62/62) [94–100] | 100.0 % (62/62) [94–100] | 0.0 % (0/62) [0–6] | 1.6 % (3/192) [1–4] | 0.0 % (0/192) [0–2] | 0.0 % (0/10) [0–28] | 30 % (3/10) [11–60] / 0 % (0/10) [0–28] | 94.1 % (32/34) [81–98] | 94.1 % (32/34) [81–98] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0098 | 126.2 | 1.71 | 34/34 | 0 |
| GPT-6.1 Sol A | 0.0 % (0/24) [0–14] | 88.7 % (55/62) [78–94] | 88.7 % (55/62) [78–94] | 8.1 % (5/62) [3–18] | 4.2 % (8/192) [2–8] | 0.0 % (0/192) [0–2] | 0.0 % (0/10) [0–28] | 50 % (5/10) [24–76] / 0 % (0/10) [0–28] | 97.1 % (33/34) [85–99] | 100.0 % (34/34) [90–100] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0067 | 7.5 | 1.00 | 34/34 | 0 |
| GPT-6.1 Sol B | 0.0 % (0/24) [0–14] | 91.9 % (57/62) [82–97] | 91.9 % (57/62) [82–97] | 3.2 % (2/62) [1–11] | 1.0 % (2/192) [0–4] | 0.0 % (0/192) [0–2] | 0.0 % (0/10) [0–28] | 0 % (0/10) [0–28] / 0 % (0/10) [0–28] | 76.5 % (26/34) [60–88] | 44.1 % (15/34) [29–61] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0123 | 13.3 | 2.00 | 34/34 | 0 |
| GPT-6.1 Sol C | 0.0 % (0/24) [0–14] | 96.8 % (60/62) [89–99] | 96.8 % (60/62) [89–99] | 0.0 % (0/62) [0–6] | 0.5 % (1/192) [0–3] | 0.5 % (1/192) [0–3] | 0.0 % (0/10) [0–28] | 10 % (1/10) [2–40] / 10 % (1/10) [2–40] | 100.0 % (34/34) [90–100] | 100.0 % (34/34) [90–100] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0093 | 9.1 | 1.71 | 34/34 | 0 |
| Claude Opus 5.5 A | 0.0 % (0/24) [0–14] | 93.5 % (58/62) [85–97] | 93.5 % (58/62) [85–97] | 3.2 % (2/62) [1–11] | 0.0 % (0/192) [0–2] | 0.0 % (0/192) [0–2] | 0.0 % (0/10) [0–28] | 0 % (0/10) [0–28] / 0 % (0/10) [0–28] | 94.1 % (32/34) [81–98] | 88.2 % (30/34) [73–95] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0207 | 7.1 | 1.00 | 34/34 | 0 |
| Claude Opus 5.5 B | 0.0 % (0/24) [0–14] | 87.1 % (54/62) [77–93] | 87.1 % (54/62) [77–93] | 9.7 % (6/62) [5–20] | 1.0 % (2/192) [0–4] | 1.0 % (2/192) [0–4] | 0.0 % (0/10) [0–28] | 0 % (0/10) [0–28] / 0 % (0/10) [0–28] | 91.2 % (31/34) [77–97] | 88.2 % (30/34) [73–95] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0487 | 16.9 | 2.00 | 34/34 | 0 |
| Claude Opus 5.5 C | 0.0 % (0/24) [0–14] | 91.9 % (57/62) [82–97] | 91.9 % (57/62) [82–97] | 0.0 % (0/62) [0–6] | 0.0 % (0/192) [0–2] | 0.0 % (0/192) [0–2] | 0.0 % (0/10) [0–28] | 0 % (0/10) [0–28] / 0 % (0/10) [0–28] | 94.1 % (32/34) [81–98] | 88.2 % (30/34) [73–95] | 0.0 % (0/34) [0–10] | 100.0 % (34/34) [90–100] | 0.0320 | 10.8 | 1.71 | 34/34 | 0 |

## By class and arm (all families pooled)

| | stale action ↓ (cl. 1–3) | propagation ↑ (cl. 1–3) | listed | asked instead | untouched changed ↓ (frozen) | untouched changed ↓ (substance) | cl. 4 plan-changing ↓ | cl. 4 changed anything (frozen / substance) | obligation done ↑ | obligation listed | distractor pull ↓ | right action | $/run | s/run | calls/run | form kept | refusals |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| class 1 (stale fact) A | 0.0 % (0/18) [0–18] | 73.3 % (44/60) [61–83] | 73.3 % (44/60) [61–83] | 11.7 % (7/60) [6–22] | 0.0 % (0/96) [0–4] | 0.0 % (0/96) [0–4] | – | – / – | 77.8 % (14/18) [55–91] | 77.8 % (14/18) [55–91] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0135 | 61.1 | 1.00 | 18/18 | 0 |
| class 1 (stale fact) B | 0.0 % (0/18) [0–18] | 70.0 % (42/60) [57–80] | 70.0 % (42/60) [57–80] | 13.3 % (8/60) [7–24] | 0.0 % (0/96) [0–4] | 0.0 % (0/96) [0–4] | – | – / – | 55.6 % (10/18) [34–75] | 50.0 % (9/18) [29–71] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0250 | 44.6 | 2.00 | 18/18 | 0 |
| class 1 (stale fact) C | 0.0 % (0/18) [0–18] | 88.3 % (53/60) [78–94] | 88.3 % (53/60) [78–94] | 0.0 % (0/60) [0–6] | 0.0 % (0/96) [0–4] | 0.0 % (0/96) [0–4] | – | – / – | 77.8 % (14/18) [55–91] | 77.8 % (14/18) [55–91] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0224 | 63.5 | 2.00 | 18/18 | 0 |
| class 2 (changed rule) A | 0.0 % (0/18) [0–18] | 94.4 % (51/54) [85–98] | 94.4 % (51/54) [85–98] | 1.9 % (1/54) [0–10] | 0.0 % (0/84) [0–4] | 0.0 % (0/84) [0–4] | – | – / – | 100.0 % (18/18) [82–100] | 88.9 % (16/18) [67–97] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0141 | 35.9 | 1.00 | 18/18 | 0 |
| class 2 (changed rule) B | 0.0 % (0/18) [0–18] | 85.2 % (46/54) [73–92] | 85.2 % (46/54) [73–92] | 3.7 % (2/54) [1–13] | 0.0 % (0/84) [0–4] | 0.0 % (0/84) [0–4] | – | – / – | 100.0 % (18/18) [82–100] | 83.3 % (15/18) [61–94] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0256 | 46.1 | 2.00 | 18/18 | 0 |
| class 2 (changed rule) C | 0.0 % (0/18) [0–18] | 100.0 % (54/54) [93–100] | 100.0 % (54/54) [93–100] | 0.0 % (0/54) [0–7] | 0.0 % (0/84) [0–4] | 0.0 % (0/84) [0–4] | – | – / – | 100.0 % (18/18) [82–100] | 88.9 % (16/18) [67–97] | 0.0 % (0/18) [0–18] | 100.0 % (18/18) [82–100] | 0.0237 | 60.0 | 2.00 | 18/18 | 0 |
| class 3 (chain) A | 0.0 % (0/36) [0–10] | 97.2 % (70/72) [90–99] | 97.2 % (70/72) [90–99] | 0.0 % (0/72) [0–5] | 1.0 % (2/198) [0–4] | 0.0 % (0/198) [0–2] | – | – / – | 100.0 % (36/36) [90–100] | 100.0 % (36/36) [90–100] | 0.0 % (0/36) [0–10] | 100.0 % (36/36) [90–100] | 0.0110 | 16.1 | 1.00 | 36/36 | 0 |
| class 3 (chain) B | 0.0 % (0/36) [0–10] | 97.2 % (70/72) [90–99] | 97.2 % (70/72) [90–99] | 0.0 % (0/72) [0–5] | 2.0 % (4/198) [1–5] | 1.0 % (2/198) [0–4] | – | – / – | 97.2 % (35/36) [86–100] | 80.6 % (29/36) [65–90] | 0.0 % (0/36) [0–10] | 100.0 % (36/36) [90–100] | 0.0234 | 59.4 | 2.00 | 36/36 | 0 |
| class 3 (chain) C | 0.0 % (0/36) [0–10] | 100.0 % (72/72) [95–100] | 100.0 % (72/72) [95–100] | 0.0 % (0/72) [0–5] | 0.0 % (0/198) [0–2] | 0.0 % (0/198) [0–2] | – | – / – | 100.0 % (36/36) [90–100] | 100.0 % (36/36) [90–100] | 0.0 % (0/36) [0–10] | 100.0 % (36/36) [90–100] | 0.0174 | 60.8 | 2.00 | 36/36 | 0 |
| class 4 (control) A | – | – | – | – | 5.1 % (10/198) [3–9] | 0.5 % (1/198) [0–3] | 0.0 % (0/30) [0–11] | 30 % (9/30) [17–48] / 3 % (1/30) [1–17] | 96.7 % (29/30) [83–99] | 100.0 % (30/30) [89–100] | 0.0 % (0/30) [0–11] | 100.0 % (30/30) [89–100] | 0.0083 | 15.8 | 1.00 | 30/30 | 0 |
| class 4 (control) B | – | – | – | – | 2.5 % (5/198) [1–6] | 0.5 % (1/198) [0–3] | 0.0 % (0/30) [0–11] | 13 % (4/30) [5–30] / 3 % (1/30) [1–17] | 86.7 % (26/30) [70–95] | 80.0 % (24/30) [63–90] | 0.0 % (0/30) [0–11] | 100.0 % (30/30) [89–100] | 0.0206 | 35.5 | 2.00 | 30/30 | 0 |
| class 4 (control) C | – | – | – | – | 2.0 % (4/198) [1–5] | 0.5 % (1/198) [0–3] | 0.0 % (0/30) [0–11] | 13 % (4/30) [5–30] / 3 % (1/30) [1–17] | 100.0 % (30/30) [89–100] | 100.0 % (30/30) [89–100] | 0.0 % (0/30) [0–11] | 100.0 % (30/30) [89–100] | 0.0094 | 18.5 | 1.00 | 30/30 | 0 |

## Family × class (stale / propagation; class 4: plan-changing / changed anything by substance)

| family | class | A | B | C |
|---|---|---|---|---|
| DeepSeek V4 Pro | 1 | 0 % (0/6) / 70 % (14/20) | 0 % (0/6) / 65 % (13/20) | 0 % (0/6) / 100 % (20/20) |
| DeepSeek V4 Pro | 2 | 0 % (0/6) / 89 % (16/18) | 0 % (0/6) / 67 % (12/18) | 0 % (0/6) / 100 % (18/18) |
| DeepSeek V4 Pro | 3 | 0 % (0/12) / 92 % (22/24) | 0 % (0/12) / 92 % (22/24) | 0 % (0/12) / 100 % (24/24) |
| DeepSeek V4 Pro | 4 | 0 % (0/10) / 10 % (1/10) | 0 % (0/10) / 10 % (1/10) | 0 % (0/10) / 0 % (0/10) |
| GPT-6.1 Sol | 1 | 0 % (0/6) / 70 % (14/20) | 0 % (0/6) / 75 % (15/20) | 0 % (0/6) / 90 % (18/20) |
| GPT-6.1 Sol | 2 | 0 % (0/6) / 94 % (17/18) | 0 % (0/6) / 100 % (18/18) | 0 % (0/6) / 100 % (18/18) |
| GPT-6.1 Sol | 3 | 0 % (0/12) / 100 % (24/24) | 0 % (0/12) / 100 % (24/24) | 0 % (0/12) / 100 % (24/24) |
| GPT-6.1 Sol | 4 | 0 % (0/10) / 0 % (0/10) | 0 % (0/10) / 0 % (0/10) | 0 % (0/10) / 10 % (1/10) |
| Claude Opus 5.5 | 1 | 0 % (0/6) / 80 % (16/20) | 0 % (0/6) / 70 % (14/20) | 0 % (0/6) / 75 % (15/20) |
| Claude Opus 5.5 | 2 | 0 % (0/6) / 100 % (18/18) | 0 % (0/6) / 89 % (16/18) | 0 % (0/6) / 100 % (18/18) |
| Claude Opus 5.5 | 3 | 0 % (0/12) / 100 % (24/24) | 0 % (0/12) / 100 % (24/24) | 0 % (0/12) / 100 % (24/24) |
| Claude Opus 5.5 | 4 | 0 % (0/10) / 0 % (0/10) | 0 % (0/10) / 0 % (0/10) | 0 % (0/10) / 0 % (0/10) |

## Obligation verdicts (judged; «correct» counts as done)

| | correct | stale | other | no_value | not_done | unresolved |
|---|---|---|---|---|---|---|
| DeepSeek V4 Pro A | 32 | 0 | 0 | 0 | 2 | 0 |
| DeepSeek V4 Pro B | 32 | 0 | 0 | 0 | 2 | 0 |
| DeepSeek V4 Pro C | 32 | 0 | 0 | 0 | 2 | 0 |
| GPT-6.1 Sol A | 33 | 0 | 1 | 0 | 0 | 0 |
| GPT-6.1 Sol B | 26 | 0 | 2 | 0 | 6 | 0 |
| GPT-6.1 Sol C | 34 | 0 | 0 | 0 | 0 | 0 |
| Claude Opus 5.5 A | 32 | 0 | 0 | 0 | 2 | 0 |
| Claude Opus 5.5 B | 31 | 0 | 1 | 0 | 2 | 0 |
| Claude Opus 5.5 C | 32 | 0 | 0 | 0 | 2 | 0 |

## Diagnostics

- DeepSeek V4 Pro: Mem0 kept the change in 32/34 units, the search returned it in 32/34; the search returned 62/62 touched decisions (100.0 %) and 30/34 distractor items.
- GPT-6.1 Sol: Mem0 kept the change in 32/34 units, the search returned it in 32/34; the search returned 62/62 touched decisions (100.0 %) and 30/34 distractor items.
- Claude Opus 5.5: Mem0 kept the change in 34/34 units, the search returned it in 34/34; the search returned 62/62 touched decisions (100.0 %) and 30/34 distractor items.
- Judgments by route: judge agree: 300, judge referee: 6, obligation agree: 301, obligation referee: 5, substance agree: 22, substance nothing flagged: 283, substance referee: 1 (agree = both Haiku passes identical; referee = Kimi K3 decided).
- Subject refusals: 0.
- Judge refusals (Haiku): 0.
- Position of the correct option across the 17 scenarios: {'a': 4, 'b': 10, 'c': 3}; items per history: 21–29.

## Worked examples (chosen by rule: first match in family order Opus, Sol, DeepSeek, then scenario id and repeat)

### 1. A stale action A took and C did not

None in the runs.

### 2. A distractor pull

None in the runs.

### 3. An obligation missed by all three arms

**G1-11 — Graduate Council review moved earlier** (class 1; setting: A university department chair at Northgate University whose academic assistant keeps the record of committee decisions and tenure timeline commitments), Claude Opus 5.5, repeat 1.

- Change (2026-10-28): The Graduate Council has moved its review of the department's revised PhD curriculum proposal forward to its meeting on Friday 26 February 2027; the previously recorded March date no longer stands. Every preparation deadline tied to the review shifts accordingly. Revokes: F6.
- Mem0 kept the change: yes; the search returned it: yes.
- Distractor item(s): F14: The Undergraduate Curriculum Committee will review the new BA course list at its meeting on Friday 5 February 2027.
- Task: I want the internal pre-review meeting on the PhD curriculum proposal on the books now — please book the right room and send the calendar invite to all faculty. — a) Book Room 214 for Friday 26 February 2027, 2:00-4:00 pm, and send the calendar invite to all faculty.; b) Book Room 214 for Friday 12 February 2027, 2:00-4:00 pm, and send the calendar invite to all faculty.; c) Book Room 214 for Friday 5 February 2027, 2:00-4:00 pm, and send the calendar invite to all faculty.
- Key: correct ['b'], stale ['a'], distractor ['c'], unnecessary []; touched D4 → The pre-review meeting moves two weeks before the new review date: Friday 12 February 2027, still in Room 214., D5 → The proposal goes to the Graduate Council portal two weeks before the new review date: by 12 February 2027, still after dean's office sign-off., D7 → Dana presents the curriculum map and 40 printed copies are prepared for the pre-review meeting on 12 February 2027; nothing else about the presentation changes.; due obligation O2: Send the Graduate Council the notice of intent to submit the revised curriculum proposal, stating the planned submission date → «12 February 2027» (stale «26 February 2027»).

C's layer reached ['D4', 'D5', 'D7']; marks `{"D4": {"mark": "keep", "why": "D4 sets the Room 214 pre-review meeting relative to the review ('two weeks before'), not on a fixed date, so it holds as written and simply lands around 12 February 2027 under C1; Room 214 (F4) and the booking rule (R3) are untouched, and there is still ample lead time to book."}, "D5": {"mark": "keep", "why": "D5 ties the portal submission to 'exactly two weeks before the Council review' after dean's office sign-off, so the new 26 February 2027 review date only moves the resulting day to about 12 February 2027 without contradicting anything the decision states."}, "D7": {"mark": "keep", "why": "D7 depends on D4 only for the meeting itself and its room, which still stand, and its presenter, curriculum map (F8) and 40 printed copies (F1, F4) do not depend on the review date."}}`

**A** — action b (right); obligation `not_done`; judges `{"direction": {"D4": true, "D5": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm booking Room 214 for Friday 12 February 2027, 2:00-4:00 pm, which is two weeks before the Graduate Council's moved review on 26 February 2027. I'm also sending the calendar invite to all 22 faculty.",
 "revise": [
  {
   "id": "D4",
   "now": "The internal pre-review faculty meeting is held in Room 214 on Friday 12 February 2027, 2:00-4:00 pm. That is two weeks before the 26 February 2027 Council review, and the room is booked now."
  },
  {
   "id": "D5",
   "now": "The full revised proposal is submitted to the Graduate Council portal by 12 February 2027, after dean's office sign-off. That is two weeks before the 26 February 2027 review."
  }
 ],
 "ask": [],
 "obligations_done": [],
 "note": "The notice of intent to the Graduate Council (O2) was due 30 October and is still unsent. It should give 12 February 2027 as the planned submission date."
}
```

**B** — action b (right); obligation `not_done`; judges `{"direction": {"D4": true, "D5": true}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm booking Room 214 for Friday 12 February 2027, 2:00–4:00 pm, and sending a calendar invite to all 22 faculty titled \"Internal pre-review: revised PhD curriculum proposal\". The invite notes that the Graduate Council review is now on 26 February 2027.",
 "revise": [
  {
   "id": "D4",
   "now": "The internal pre-review faculty meeting is held in Room 214 on Friday 12 February 2027, 2:00–4:00 pm. That is two weeks before the corrected Graduate Council review on 26 February 2027 (C1, replacing F6)."
  },
  {
   "id": "D5",
   "now": "The full revised proposal is submitted to the Graduate Council portal by Friday 12 February 2027, after dean's office sign-off. That is two weeks before the corrected 26 February 2027 review."
  }
 ],
 "ask": [],
 "obligations_done": [],
 "note": "The notice of intent to the Graduate Council (O2) was due 30 October and still hasn't been sent; it should state 12 February 2027 as the submission date. Shall I draft it today?"
}
```

**C** — action b (right); obligation `not_done`; judges `{"direction": {}, "changes_untouched_in_text": []}`

```json
{
 "action": "b",
 "what_i_do": "I'm booking Room 214 for Friday 12 February 2027, 2:00-4:00 pm, and sending the calendar invite to all faculty. That is two weeks before the Graduate Council review, which C1 moved to 26 February 2027.",
 "revise": [],
 "ask": [],
 "obligations_done": [],
 "note": "The notice of intent to the Graduate Council (O2) was due 30 October and hasn't been sent. It should give about 12 February 2027 as the planned submission date. Shall I draft it today?"
}
```


## Spend by door

**OpenRouter $12.3419** of the $120 ceiling (writer, raters, probes, dry run, subjects, Mem0's own calls, judges, referee). Anthropic key $0, OpenAI key $0, Bedrock $0.

| who | part | $ |
|---|---|---|
| deepseek | A | 0.2166 |
| deepseek | B | 0.3114 |
| deepseek | C | 0.3373 |
| deepseek | mem0 | 0.2071 |
| haiku | A | 0.0036 |
| haiku | B | 0.0076 |
| haiku | C | 0.0055 |
| haiku | mem0 | 0.0077 |
| judges on deepseek | Haiku | 0.0796 |
| judges on haiku | Haiku | 0.0122 |
| judges on opus | Haiku | 0.0869 |
| judges on opus | referee (kimi) | 0.0144 |
| judges on sol | Haiku | 0.0939 |
| judges on sol | referee (kimi) | 0.0426 |
| opus | A | 0.7030 |
| opus | B | 1.6543 |
| opus | C | 1.0889 |
| opus | mem0 | 2.1408 |
| probe | astra | 0.0004 |
| probe | glm | 0.0000 |
| probe | kimi | 0.0008 |
| rater | astra | 2.0269 |
| rater | kimi | 0.5783 |
| sol | A | 0.2267 |
| sol | B | 0.4169 |
| sol | C | 0.3168 |
| sol | mem0 | 0.1498 |
| writer | glm | 1.6116 |

Spend checks (34; every one held):

- 2026-11-10T19:49:09+00:00 before probe (writer, raters): credit $280.55 less $150.00 for #6 → $130.55; stage $0.00; projected $0.50 → holds
- 2026-11-10T19:49:20+00:00 before writer settings (1 call): credit $280.55 less $150.00 for #6 → $130.55; stage $0.00; projected $1.00 → holds
- 2026-11-10T19:49:46+00:00 before writer (50 candidates, ≤ 150 calls): credit $280.55 less $150.00 for #6 → $130.55; stage $0.01; projected $7.50 → holds
- 2026-11-10T19:55:29+00:00 before raters (98 calls): credit $278.83 less $150.00 for #6 → $128.83; stage $1.61; projected $41.65 → holds
- 2026-11-10T19:57:55+00:00 before dry run (Haiku, 4 scenarios × 3 arms): credit $275.84 less $150.00 for #6 → $125.84; stage $4.22; projected $2.00 → holds
- 2026-11-10T19:57:55+00:00 before haiku units batch 1 (4 units): credit $275.84 less $150.00 for #6 → $125.84; stage $4.22; projected $2.40 → holds
- 2026-11-10T19:58:29+00:00 before judge haiku batch 1 (12 arm-runs, ≤ 36 calls): credit $275.80 less $150.00 for #6 → $125.80; stage $4.24; projected $0.24 → holds
- 2026-11-10T19:58:44+00:00 before substance haiku batch 1 (12 arm-runs, ≤ 36 calls): credit $275.72 less $150.00 for #6 → $125.72; stage $4.25; projected $0.24 → holds
- 2026-11-10T19:58:51+00:00 before obligation haiku batch 1 (12 arm-runs, ≤ 36 calls): credit $275.68 less $150.00 for #6 → $125.68; stage $4.25; projected $0.24 → holds
- 2026-11-10T19:59:45+00:00 before deepseek units batch 1 (30 units): credit $275.51 less $150.00 for #6 → $125.51; stage $4.25; projected $3.51 → holds
- 2026-11-10T20:22:58+00:00 before deepseek units batch 2 (4 units): credit $273.49 less $150.00 for #6 → $123.49; stage $5.22; projected $0.47 → holds
- 2026-11-10T20:32:08+00:00 before deepseek units batch 1 (2 units): credit $273.37 less $150.00 for #6 → $123.37; stage $5.28; projected $0.23 → holds
- 2026-11-10T20:33:31+00:00 before judge deepseek batch 1 (60 arm-runs, ≤ 180 calls): credit $273.33 less $150.00 for #6 → $123.33; stage $5.33; projected $1.20 → holds
- 2026-11-10T20:34:17+00:00 before judge deepseek batch 2 (42 arm-runs, ≤ 126 calls): credit $273.29 less $150.00 for #6 → $123.29; stage $5.36; projected $0.84 → holds
- 2026-11-10T20:34:55+00:00 before substance deepseek batch 1 (60 arm-runs, ≤ 180 calls): credit $273.25 less $150.00 for #6 → $123.25; stage $5.38; projected $1.20 → holds
- 2026-11-10T20:34:55+00:00 before substance deepseek batch 2 (42 arm-runs, ≤ 126 calls): credit $273.25 less $150.00 for #6 → $123.25; stage $5.38; projected $0.84 → holds
- 2026-11-10T20:35:04+00:00 before obligation deepseek batch 1 (60 arm-runs, ≤ 180 calls): credit $273.25 less $150.00 for #6 → $123.25; stage $5.38; projected $1.20 → holds
- 2026-11-10T20:35:30+00:00 before obligation deepseek batch 2 (42 arm-runs, ≤ 126 calls): credit $273.22 less $150.00 for #6 → $123.22; stage $5.40; projected $0.84 → holds
- 2026-11-10T20:35:51+00:00 before sol units batch 1 (30 units): credit $273.21 less $150.00 for #6 → $123.21; stage $5.41; projected $8.34 → holds
- 2026-11-10T20:37:50+00:00 before sol units batch 2 (4 units): credit $272.38 less $150.00 for #6 → $122.38; stage $6.43; projected $1.11 → holds
- 2026-11-10T20:38:14+00:00 before judge sol batch 1 (60 arm-runs, ≤ 180 calls): credit $272.18 less $150.00 for #6 → $122.18; stage $6.52; projected $1.20 → holds
- 2026-11-10T20:39:05+00:00 before judge sol batch 2 (42 arm-runs, ≤ 126 calls): credit $272.04 less $150.00 for #6 → $122.04; stage $6.55; projected $0.84 → holds
- 2026-11-10T20:40:00+00:00 before substance sol batch 1 (60 arm-runs, ≤ 180 calls): credit $272.01 less $150.00 for #6 → $122.01; stage $6.60; projected $1.20 → holds
- 2026-11-10T20:40:00+00:00 before substance sol batch 2 (42 arm-runs, ≤ 126 calls): credit $271.99 less $150.00 for #6 → $121.99; stage $6.60; projected $0.84 → holds
- 2026-11-10T20:40:08+00:00 before obligation sol batch 1 (60 arm-runs, ≤ 180 calls): credit $271.99 less $150.00 for #6 → $121.99; stage $6.60; projected $1.20 → holds
- 2026-11-10T20:40:41+00:00 before obligation sol batch 2 (42 arm-runs, ≤ 126 calls): credit $271.96 less $150.00 for #6 → $121.96; stage $6.63; projected $0.84 → holds
- 2026-11-10T20:41:19+00:00 before opus units batch 1 (30 units): credit $271.94 less $150.00 for #6 → $121.94; stage $6.65; projected $15.79 → holds
- 2026-11-10T20:43:45+00:00 before opus units batch 2 (4 units): credit $267.04 less $150.00 for #6 → $117.04; stage $11.71; projected $2.10 → holds
- 2026-11-10T20:44:14+00:00 before judge opus batch 1 (60 arm-runs, ≤ 180 calls): credit $266.52 less $150.00 for #6 → $116.52; stage $12.24; projected $1.20 → holds
- 2026-11-10T20:45:05+00:00 before judge opus batch 2 (42 arm-runs, ≤ 126 calls): credit $266.29 less $150.00 for #6 → $116.29; stage $12.28; projected $0.84 → holds
- 2026-11-10T20:45:47+00:00 before substance opus batch 1 (60 arm-runs, ≤ 180 calls): credit $266.25 less $150.00 for #6 → $116.25; stage $12.32; projected $1.20 → holds
- 2026-11-10T20:45:47+00:00 before substance opus batch 2 (42 arm-runs, ≤ 126 calls): credit $266.25 less $150.00 for #6 → $116.25; stage $12.32; projected $0.84 → holds
- 2026-11-10T20:45:53+00:00 before obligation opus batch 1 (60 arm-runs, ≤ 180 calls): credit $266.25 less $150.00 for #6 → $116.25; stage $12.32; projected $1.20 → holds
- 2026-11-10T20:46:20+00:00 before obligation opus batch 2 (42 arm-runs, ≤ 126 calls): credit $266.23 less $150.00 for #6 → $116.23; stage $12.33; projected $0.84 → holds

## Readings

- **No stale action and no distractor pull, so worked examples 1 and 2 do not exist.** The rule that picks the examples found none. In their place, one reading where C was wrong: **G1-11 (Opus, repeat 1)**, shown as example 3 above. The layer reached D4, D5 and D7 correctly. Opus, as the marking model, marked all three «keep». Those decisions are written *relative to* the review date («two weeks before the Council review»), so their text still holds after the review moves; the key counts them as touched. Opus's «keep» is defensible. The scenario is ambiguous, and both raters passed it. This one unit accounts for most of Opus's class-1 dip in C (75 % against A's 80 %).
- **Where B lost propagation:** most of B's misses are decisions it moved to `ask` instead of `revise` (asked instead: B 5.4 %, A 4.3 %, C 0.0 %). C never asked.
- **Correct-option position:** GLM put the correct option at «b» in 10 of 17 scenarios (a 4, c 3). Every arm chose the right option in 102 of 102 runs, so the position bias did not decide anything here.

## Notes on record

- **The amendment** (stage at `1fe27ef1`, read before any subject call): Kimi K3 refereed every disputed judgment. That came to 6 frozen-judge disputes, 5 obligation disputes and 1 substance dispute; on 623 judged questions the two Haiku passes agreed, and 283 substance questions had nothing flagged. Kimi also rated the candidates, before any subject call. Both roles are disclosed. Haiku refused nothing; no subject refused anything.
- **The reviewer** (her sentence from AUTHORITY_1; the stage's rule «withdrawn, not softened»): the numbers are in «In brief». Whether the Opus result withdraws the sentence or limits it to «over a plain pass» is her call; this report does not soften it.
- **The owner** gave no bets and delegated the launch. The session posted the pool, the freeze and one dry-run trace per arm in #7 at about 20:00 UTC, and went straight on.
- **The shared key:** #6 reported no spend in its thread during this run, so #6's full $150 stayed reserved at every check. The key fell $2.02 more than this stage's own spend ($280.55 → $266.19 against $12.34 booked), which is other use of the key. Every check held.
- **Owner acceptance is pending.** This report shows that the work is done. It does not show that the owner has accepted it.

## Deviations and limits (read before the numbers)

1. **17 scenarios, not 40; 306 arm-runs, not 720.** This follows the frozen admission rule and is not a choice made after seeing results. Seventeen foreign scenarios are a small pilot, and the Wilson and bootstrap intervals are wide accordingly. Classes 3–4 hold 11 of the 17, so the pooled rates lean on chains and controls.
2. **The rater filter was one rater's.** Kimi said «yes» to «truth follows» on 48 of 49, so admission was in effect Astra's judgement plus both raters' class. Even so, one ambiguous key (G1-11) got through.
3. **Mem0 dropped the change in 4 of 102 units** (G4-05, a class-4 restated rule, both repeats, in DeepSeek and Sol). Its extractor treated the change as a duplicate, as it did in AUTHORITY_1.
4. **DeepSeek's host rate-limited us 145 times** (HTTP 429, all on DeepInfra, all waited out within the six-wait bound). DeepSeek's wall times (68–126 s a run) include those waits. AU5's latency is pooled over families and is affected; Sol and Opus alone show C at 9.1 / 10.8 s against B at 13.3 / 16.9 s.
5. **One restart.** The session's first family loop hit a 30-minute background limit at about 20:29 UTC, during DeepSeek's last units. Two units in flight were lost (24 calls, $0.0258, booked in the ledger) and re-run from scratch after the restart. Nothing frozen changed; the freeze check passed on restart.
6. **Pre-registered here, post hoc in AUTHORITY_1:** the substance measure (AU4 uses it) and the field-by-field reading of the referee's reply. The judge breaker was keyed per judged family. No breaker tripped.
7. **Histories of 21–29 items** (the spec allowed 20–50). Mem0's top-20 search returned every touched decision, so retrieval was not stressed. A test where retrieval fails would need longer or noisier memories.
