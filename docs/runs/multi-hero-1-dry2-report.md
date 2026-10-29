# Multi-hero 1 — a table with no main character (the second dry run, after the three fixes)

Stage origin/claude/handoff at 6f1c9fe (docs/stages/MULTI_HERO_1.md, its amendment of 2026-10-28 23:15 LA: A1–A8, and of 2026-10-29 02:30 LA: three fixes after the first dry run). Branch `claude/multi-hero-1` (the session's `claude/multi-hero-1-mdk43v`), from `origin/claude/game-party-1`. Design sha256 `da3aa5fcab6508422e5556c745e6309622e2adda74a9229219b779fc3a4268ad`. Synthetic content: invented characters in an invented campaign.

The dry run again, after the amendment of 2026-10-29 02:30 LA (fixes A2, A7, A4): one P-SAND table of 6 rounds, three Claude Haiku 5.5 players, every Claude call of the app sent as Haiku but the relay's, sent as Claude Sonnet 5.5 (ANTHROPIC_PROVIDER=openrouter); the world (three arms' company campaigns; this table's coin: 0, so Bram → Sefa → Pell at the seats) and the P-GOAL and P-DUNGEON company layers built and frozen on Haiku first. 6 round(s), ended by rounds.

**In short:** A1 held · A2 lost · A3 held · A4 lost · A5 held · A6 held · A7 lost · A8 held.

## Reading the dry run (the session's notes)

- A1 held: the 23 DM requests of the mode (8 DM turns, 10 bookkeeping requests, 3 openings, 2 preps) say no «hero», in the frame or in the story. The desert table's opening, which no longer gets the one record the app holds before it, named the three alike, by their roads, in the coin's order («Bram Halloway came up the Coast Way from Nashkel… Sefa Marrin came down it from Baldur's Gate… Pell Dunmore came in from the west… Three roads, one table»).
- A2 lost, though fix A2's own check held. Who comes first: each seat was named first in the DM's inputs in 2 of the 6 rounds, every input of a round agreeing with the round's own order (the coin gave 0: Bram's seat first in rounds 1 and 4). By inputs Bram is 47 % only because his two rounds each had a second bookkeeping pass. The evenness itself: the DM wrote 45.9 % about Bram, 23.9 % about Sefa, 30.2 % about Pell (spread 22 points; Bram 0.9 points over the 45 % bar), while Bram's player again wrote the fewest words (28.9 %). The lean followed the story more than the lists: in round 3 Bram's player walked over to the stranger at the bar, and the narration of that meeting carried 72 and 141 words about Bram (rounds 3 and 4); in round 5 the stranger asked him who had paid him off in Nashkel. Order in what the DM reads was not the cause of the lean, or not the only one.
- A4 lost on Sonnet 5.5, as the amendment allows: the relay's first pass copied a player's words in 19 places on 14 screens; each of those screens went back alone with its runs marked; 11 came back clean and 3 kept 5 copies, logged as defects (one of the five came through the DM's own narration, which had repeated the player's words). Per the owner's instruction no third relay model was tried. On Haiku the first run kept 14 copies after its whole-answer second ask; on Sonnet with the per-screen resend, 5.
- A7 lost by the frozen reading, on a different pattern from the first run in two of three rounds. Rounds 4 and 5 closed on the stranger's question put to one character (Pell, then Bram — «Who paid you?»), with the room waiting on that character after the other two had acted; round 4's narration says so in the DM's own words («the room waits for Pell to answer it»). Round 6 closed on Pell's offer to Sefa left open — the first run's pattern (one character's question or offer to another), which the new line in the guide's note was meant to stop. The DM's own calls for action named one character in rounds 4 and 5 and no one in the others.
- A8 held on both new company layers: P-GOAL 2/2/2 and P-DUNGEON 2/2/3, by the blind reading and by the DM's own list.
- In play: no card was asked for and the DM rolled nothing, so no reroll or Inspiration came up; A3 and A6 rest on the mocked host. No character slept; the waiting skip is tested on the mocked host.

## What changed in the app, and what stayed

**Changed — only behind the DM option «company»** (`src/lib/gameplay/dm-loop/options.ts`; off unless a campaign sets it):
- **No «hero» in anything the DM reads for the mode.** `src/lib/gameplay/dm-loop/company.ts` rewrites every DM request of a company table — the roles (game master, writer, bookkeeper), the turn shapes, the tools' descriptions, the dossier and the current state, the tool results, the app's own notes in the conversation — into the company's words: whole sentences where a rule meant one person, then the remaining words. The frame closes with one paragraph: several players, none the main character; the company moves when any of them acts; the DM never waits on one character's decision; each player character has their own Inspiration and each player their own rerolls. The story's own words (a player's message, the history of what was played) go as they are. The same rewrite reaches the out-of-game answers, the session digest and the prep; the opening has its own company paragraph (no protagonist).
- **The three records alike.** The state shows every controlled party member as kind «player», role «player character» (the app's one player record is no longer told apart); the party lines say «player character»; no «attitude to the hero».
- **Heroic Inspiration per character.** A natural 20 on a called check of any player character grants that character's own; any player character's roll may spend that character's own (`execute.ts`).
- **Rerolls per player.** The session's allowance (2) counts per player character, in TypeScript (`reroll-allowance.ts` `rerollsLeftFor`, the pause rule in `loop.ts`) and in SQL (migration `202610290801_multi_hero_company_rerolls.sql`: the public turn's `canReroll` and the runtime's count of a session's rerolls, both per character only when the campaign's DM options say «company»; additive, no table or row changed).
- **The company's prep.** The prep of a company table asks for the layer to be written with no one at its centre — each character the natural addressee of at least one puzzle, threat or reward, none of more than half, the threads touching each one's hooks — and keeps the DM's own list in the layer.
- **No first place (fix A2, the amendment of 2026-10-29 02:30 LA).** Every list of the three that the DM reads — the party's sheets, the current state, the Character Models and speech profiles, the layer's own list of puzzles, threats and rewards — follows the order of the round's own message (`company.ts` `companyOrder`: the paragraphs' order, which the table turns each round, or the fight's initiative); before the first round, the seats as the table's coin turned them (the DM option `companyStart`, drawn once per table). The opening no longer gets the one record the app holds before it (the wizard's): it reads the three alike from the adventure's set-up, written in the coin's order. The campaign line drops a subtitle that is one character's name; the attention ledger no longer lists two of the three as «companions»; the turn shapes' combat example no longer names its archer «Bram».

**Stayed:** with the option off (the owner's campaign) every DM request is built and sent exactly as before (the same frame, the same toolset object, the same receipts), the table's two rerolls are counted as before, Inspiration is the hero's, the opening and the prep are asked as before; the screens, the wizard and the Russian instructions are untouched (the company rewrite is for the English instructions). The existing suite passes. Known residues of the one player record at a company table: the fight's zone words are still measured from it, a reward with no named recipient defaults to it, and the wizard's own draft of it (before the campaign exists) is the app's usual hero draft — none of them is text the DM reads in play.

## Acceptance (the stage's text)

- **A1:** no «hero» in the DM's inputs for the mode (a test greps the prompt, the guide note, the prep and the opening).
- **A2:** the three narration shares within ±10 % of each other over the 6 rounds, and no seat's share of the DM's words above 45 %.
- **A3:** Inspiration can be earned and spent by each seat; rerolls counted per player; each seat's journal holds only its own scenes.
- **A4:** the relay's screens contain no run of 8 words copied from another player's message (the paraphrase check), and a sleeping character's round is skipped with a «waiting» line.
- **A5:** the owner's single-hero campaign plays unchanged (the existing suite passes; a smoke test on the owner's path).
- **A6 equal mechanical power:** any seat can initiate a roll (ask the DM for a check and get a card of its own), spend its own Inspiration, use its own rerolls, and nothing a seat does requires another seat's press — tested on the mocked host from each seat in turn.
- **A7 equal access to initiative:** the DM's guide note for the mode says the company moves when any character acts; the DM never waits on seat 1's decision nor treats one character's consent as the condition of movement — checked in the dry run by the round tags (who the DM's «what do you do» addresses, rotating; no round where the scene waits on one named character while the others have acted).
- **A8 neutral prep:** in the frozen layer, the puzzles, threats and rewards are distributed — each character is the natural addressee of at least one and no character of more than half — checked on the layer file before the dry run.

## A1–A8

| | Verdict | By the record |
| --- | --- | --- |
| A1 | **held** | tests: no «hero» in any DM request of the mode on the mocked host (tests/multi-hero-1*.test.mjs). Dry run: 23 DM requests read; the frame: 0 hit(s); the story's own words: 0; the wizard's draft of the first record (outside the mode): 15; the app's checkers (not the DM): 8 |
| A2 | **lost** | shares Bram 45.9 %, Sefa 23.9 %, Pell 30.2 %; spread 22 % (bar ≤ 10 points); largest 45.9 % (bar ≤ 45 %); first in the DM's inputs (fix A2): Bram 2 of 6 rounds (47.4 % of 19 inputs), Sefa 2 of 6 rounds (26.3 % of 19 inputs), Pell 2 of 6 rounds (26.3 % of 19 inputs) — a third each, give or take one round; the opening: Bram (the coin's seat) |
| A3 | **held** | held on the mocked host (tests/multi-hero-1.test.mjs, tests/multi-hero-1-app.test.mjs): each seat earned its own Inspiration and spent it on its own roll; two rerolls per player, the third refused for that player only; the thread of the scene Pell walked into reached his journal only. Dry run: cards per seat Bram 0, Sefa 0, Pell 0; rerolls used Bram 0, Sefa 0, Pell 0; Inspiration in play: none earned or spent |
| A4 | **lost** | the relay: Claude Sonnet 5.5; copies of 8 words in its first pass: 19; screens sent back alone, runs marked: 14 (accepted 11); defects logged: 5; waiting lines: none in the dry run (the skip is tested on the mocked host) |
| A5 | **held** | the full suite on this branch after the fixes: 3 107 tests, 3 075 pass, 27 skipped, 2 fail, 3 cancelled — the two mega-dm fixture tests that read old commits this shallow clone does not have, and the three timing-sensitive World Lab tests in tests/d2a-composition.test.mjs (all five fail the same on the base commit 03b0991); the owner-path smoke (tests/multi-hero-1-app.test.mjs «A5» and the fix-A2 loop test): without the option the DM is sent the same frame and the same toolset object, the lists in the records' order and the campaign line with its subtitle, and the table keeps its two shared rerolls. Typecheck, zero-warning lint and the production build pass. |
| A6 | **held** | held on the mocked host, from each seat in turn (tests/multi-hero-1.test.mjs): rounds 1–3, each asking seat got a card of its own character, pressed by its own player, rerolled twice on its own allowance; a press from a seat with no card was refused on screen and never counted as «stuck»; each seat spent its own Inspiration. |
| A7 | **lost** | the guide's note says it (a test); rounds tagged 6; a round waiting on one character: r4 Pell Dunmore, r5 Bram Halloway, r6 Sefa Marrin; the same single character addressed every round: no |
| A8 | **held** | P-GOAL: 6 item(s) — Bram 2, Sefa 2, Pell 2; threads touching each one's hooks Bram 10, Sefa 7, Pell 6; the DM's own list Bram 2, Sefa 2, Pell 2 · P-DUNGEON: 7 item(s) — Bram 2, Sefa 2, Pell 3; threads touching each one's hooks Bram 5, Sefa 12, Pell 4; the DM's own list Bram 2, Sefa 2, Pell 3 |

How each line is read: `READINGS` in `scripts/multi-hero-1/frozen.mjs`.

## Evenness (A2, built in — reported every table from here on)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 365 | 45.9 % | 2.6 % | 6 | 1065 (28.9 %) |
| Sefa Marrin | 190 | 23.9 % | 2 % | 6 | 1183 (32.1 %) |
| Pell Dunmore | 240 | 30.2 % | 2.8 % | 6 | 1438 (39 %) |
| (the world: about no character) | 1092 | — | — | — | — |

Per round (words about each): r1 Bram 17/Sefa 10/Pell 30 · r2 Bram 50/Sefa 58/Pell 7 · r3 Bram 72/Sefa 10/Pell 32 · r4 Bram 141/Sefa 23/Pell 101 · r5 Bram 29/Sefa 33/Pell 40 · r6 Bram 56/Sefa 56/Pell 31.

## Who comes first in what the DM reads (fix A2)

Every DM request of the table (the opening, the turns, the bookkeeper, the out-of-game answers), read outside the story's own words: the character named first. Each seat came first in a third of the rounds, give or take one. The opening named Bram Halloway first (the coin's seat).

| Round | Order sent to the DM | DM inputs | First in them |
| --- | --- | --- | --- |
| 1 | Bram → Sefa → Pell | 4 | Bram 4 |
| 2 | Sefa → Pell → Bram | 3 | Sefa 3 |
| 3 | Pell → Bram → Sefa | 3 | Pell 3 |
| 4 | Bram → Sefa → Pell | 4 | Bram 4 |
| 5 | Sefa → Pell → Bram | 2 | Sefa 2 |
| 6 | Pell → Bram → Sefa | 2 | Pell 2 |

Per seat: Bram first in 2 round(s), 9 input(s) (47.4 %); Sefa first in 2 round(s), 5 input(s) (26.3 %); Pell first in 2 round(s), 5 input(s) (26.3 %).

## Initiative (A7): the order sent to the DM and whom its call for action addressed, by the round tags

| Round | Order sent to the DM | Addressed | Waits on one character |
| --- | --- | --- | --- |
| 1 | Bram → Sefa → Pell | — | — |
| 2 | Sefa → Pell → Bram | — | — |
| 3 | Pell → Bram → Sefa | — | — |
| 4 | Bram → Sefa → Pell | Pell | Pell Dunmore |
| 5 | Sefa → Pell → Bram | Bram | Bram Halloway |
| 6 | Pell → Bram → Sefa | — | Sefa Marrin |

- r4, waits on Pell Dunmore: «The closing narration puts the grey man's question directly to Pell and says the room waits for his answer while Bram and Sefa have already acted.»
- r5, waits on Bram Halloway: «The grey man's closing question, "Halloway. You were paid off in Nashkel. Who paid you?", is put to Bram alone, and the scene holds until he answers while Sefa and Pell have already acted.»
- r6, waits on Sefa Marrin: «The narration ends on description with no question or call, but it leaves the scene hanging on Sefa, still standing with her cloak and Pell's offer waiting beside her, after Pell and Bram have acted.»

The judges: Claude Haiku 5.5 twice (effort low), a third pass on a disagreement.

## Neutral prep (A8): the frozen company layers

- **P-GOAL** — sha256 `0944694badf05a1a27442a71a6b9787789db25d8123e1fae9ab406ca7caabf01`: the blind reading lists 6 puzzles, threats and rewards (Bram 2, Sefa 2, Pell 2); every character at least one and none more than half: yes; threads touching each one's hooks: Bram 10, Sefa 7, Pell 6. The DM's own list: Bram 2, Sefa 2, Pell 2 of 6.
- **P-DUNGEON** — sha256 `d4be32a2a725d97882dc0c9fa23a2854c2cba779f3c068d6457db5fed6f41889`: the blind reading lists 7 puzzles, threats and rewards (Bram 2, Sefa 2, Pell 3); every character at least one and none more than half: yes; threads touching each one's hooks: Bram 5, Sefa 12, Pell 4. The DM's own list: Bram 2, Sefa 2, Pell 3 of 7.

## The paraphrase (A4)

The relay: Claude Sonnet 5.5. Fix A4: after its pass, each screen that copied a run of 8 words from another player's message was sent back once, alone, with the runs marked — 14 screen(s), 11 accepted clean; 5 defect(s) logged.

Of the 5 copy(-ies) still on the screens that went out, 1 came through the DM's own narration (which repeated the player's words) and the rest are the relay's own.

- r1: Bram Halloway's screen copied Pell Dunmore's words in the relay's first pass: «himself a cup from the jug before edda» — retold when sent back
- r1: Sefa Marrin's screen copied Bram Halloway's words in the relay's first pass: «the chair with its back to the wall» — retold when sent back
- r1: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first pass: «himself a cup from the jug before edda» — still there after it was sent back: a defect
- r1: Pell Dunmore's screen copied Bram Halloway's words in the relay's first pass: «the chair with its back to the wall» — retold when sent back
- r2: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first pass: «stool so his back is to the hearth» — retold when sent back
- r2: Pell Dunmore's screen copied Sefa Marrin's words in the relay's first pass: «the purse at her belt counting the coins» — retold when sent back
- r2: Bram Halloway's screen copied Sefa Marrin's words in the relay's first pass: «the purse at her belt counting the coins» — still there after it was sent back: a defect
- r2: Bram Halloway's screen copied Pell Dunmore's words in the relay's first pass: «stool so his back is to the hearth» — still there after it was sent back: a defect
- r3: Pell Dunmore's screen copied Bram Halloway's words in the relay's first pass: «the length of the room behind the tables» — retold when sent back
- r3: Bram Halloway's screen copied Pell Dunmore's words in the relay's first pass: «a crow on a fence post that watched» — retold when sent back
- r3: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first pass: «been on the wrong end of both he» — retold when sent back
- r3: Sefa Marrin's screen copied Bram Halloway's words in the relay's first pass: «nashkel wagons don't run late for no reason» — retold when sent back
- r4: Bram Halloway's screen copied Sefa Marrin's words in the relay's first pass: «a letter from a sister at the hospice» — retold when sent back
- r4: Pell Dunmore's screen copied Sefa Marrin's words in the relay's first pass: «a letter from a sister at the hospice» — still there after it was sent back: a defect
- r5: Bram Halloway's screen copied Sefa Marrin's words in the relay's first pass: «still watching you to the grey man she» — retold when sent back
- r5: Bram Halloway's screen copied Pell Dunmore's words in the relay's first pass: «nobody on the hedge says much to a» — retold when sent back
- r6: Pell Dunmore's screen copied Bram Halloway's words in the relay's first pass: «through their wagon master and the coin was» — retold when sent back
- r6: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first pass: «like to have walked the road first so» — retold when sent back
- r6: Sefa Marrin's screen copied Bram Halloway's words in the relay's first pass: «through their wagon master and the coin was» — retold when sent back

## The table

Seats: Bram Halloway (Claude Haiku 5.5); Sefa Marrin (Claude Haiku 5.5); Pell Dunmore (Claude Haiku 5.5). Counts: strayPresses 0, swallowed 0, proseAtCard 0, questions 0, autoCards 0, relayFallbacks 0, waitingRounds 0, relayCopied 19, relayCopiedAfter 5, relayRetold 6, relayResent 14, relayDefects 5. Player words: Bram 1065, Sefa 1183, Pell 1438.

## Money

- openrouter: $0.87 of $5.00.
- The spend checks: before the dry run — OpenRouter account left $111.66; after the dry run — OpenRouter account left $106.56.
- Caps: anthropic $0, openrouter $5, openai $0; no other paid call.

## Files

- the run record: `docs/runs/multi-hero-1-run-20261029-095454.json`
- the rounds side by side (page): `docs/runs/multi-hero-1-dry2-rounds.html`
- the rounds side by side (markdown): `docs/runs/multi-hero-1-dry2-rounds.md`
- the transcripts: `docs/runs/multi-hero-1-transcripts/SAND-haiku-dry2`
- the frozen layers (DM-only) and the manifest (the world's snapshot, built on Haiku, is named there by its sha256 and not committed): `docs/runs/multi-hero-1-frozen-dry2/`
- the ledger: `docs/runs/multi-hero-1-ledger-openrouter.md`
