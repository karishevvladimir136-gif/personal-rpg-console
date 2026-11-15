# Multi-hero 1 — a table with no main character

Stage origin/claude/handoff at 2552de9 (docs/stages/MULTI_HERO_1.md and its amendment of 2026-10-28 23:15 LA: A1–A8). Branch `claude/multi-hero-1` (the session's `claude/multi-hero-1-mdk43v`), from `origin/claude/game-party-1`. Design sha256 `41f157630006e9cee322401add02d88ef67a6e3139240f68ced57b19390d5f2f`. Synthetic content: invented characters in an invented campaign.

The dry run: one P-SAND table of 6 rounds, three Claude Haiku 5.5 players, every Claude call of the app sent as Haiku (ANTHROPIC_PROVIDER=openrouter); the world (three arms' company campaigns) and the P-GOAL and P-DUNGEON company layers built and frozen on Haiku first. 6 round(s), ended by rounds.

**In short:** A1 held · A2 lost · A3 held · A4 lost · A5 held · A6 held · A7 lost · A8 held.

## Reading the dry run (the session's notes)

- A1 held: the 36 DM requests of the mode (10 DM turns, 15 bookkeeping requests, 6 out-of-game answers at cards, 3 openings, 2 preps) say no «hero», in the frame or in the story. The opening named the three alike («Three travellers have come in by three roads and found the same table»). The wizard's draft of the first record still says «hero» (15 hits): it runs before the campaign exists, and its text is replaced by the frozen review.
- A2 lost: the DM wrote most about Bram (42.7 %) although Bram's player wrote the fewest words (28 %). Rounds 1–3 leaned on him; rounds 4–6 evened out. Bram is the app's first record and still comes first in every list the DM reads (the party, the current state, the guide's note, the adventure line). That is the one ordering asymmetry left in the mode. The other bar (no share above 45 %) held.
- A4 lost on Haiku: the relay (Haiku in place of the owner's Opus 5.5) copied runs of 8 words from the other players' messages in 19 places. Asked again with the runs named, it retold 5 and kept 14, none of them from the DM's narration. The guard catches and counts them. Whether the owner's relay model keeps them is a paid question this dry run cannot answer. No character slept, so the dry run has no waiting line; the skip is tested on the mocked host.
- A7 lost by the frozen reading. Round 4 closed on «Bram has not yet answered either of them»: Sefa's question and Pell's offer, made in the same round after Bram had already acted. Round 6 closed on «It is Sefa's to give»: Bram's question to Sefa. Both are a question one player character put to another within the round, which the DM left open by name. With the rotation, the character who acts first in a round is the one left owing an answer. The DM's own calls for action named no one in most rounds (round 3: Bram and Pell; round 6: Sefa).
- A8 held on both company layers: P-GOAL 2/2/2 and P-DUNGEON 2/2/3 puzzles, threats and rewards per character, by the blind reading and by the DM's own list. Every character's hooks are touched by threads; at P-DUNGEON most of them are Bram's (14 against 7 and 4).
- In play: Pell rolled three cards of his own and used one of his own rerolls. There was no natural 20, so no Inspiration was earned. Pell left for a scene of his own in round 6, and the two scenes were played and relayed apart.

## What changed in the app, and what stayed

**Changed — only behind the DM option «company»** (`src/lib/gameplay/dm-loop/options.ts`; off unless a campaign sets it):
- **No «hero» in anything the DM reads for the mode.** `src/lib/gameplay/dm-loop/company.ts` rewrites every DM request of a company table — the roles (game master, writer, bookkeeper), the turn shapes, the tools' descriptions, the dossier and the current state, the tool results, the app's own notes in the conversation — into the company's words: whole sentences where a rule meant one person, then the remaining words. The frame closes with one paragraph: several players, none the main character; the company moves when any of them acts; the DM never waits on one character's decision; each player character has their own Inspiration and each player their own rerolls. The story's own words (a player's message, the history of what was played) go as they are. The same rewrite reaches the out-of-game answers, the session digest and the prep; the opening has its own company paragraph (no protagonist) and sends the record it has as `playerCharacter`.
- **The three records alike.** The state shows every controlled party member as kind «player», role «player character» (the app's one player record is no longer told apart); the party lines say «player character»; no «attitude to the hero».
- **Heroic Inspiration per character.** A natural 20 on a called check of any player character grants that character's own; any player character's roll may spend that character's own (`execute.ts`).
- **Rerolls per player.** The session's allowance (2) counts per player character, in TypeScript (`reroll-allowance.ts` `rerollsLeftFor`, the pause rule in `loop.ts`) and in SQL (migration `202610290801_multi_hero_company_rerolls.sql`: the public turn's `canReroll` and the runtime's count of a session's rerolls, both per character only when the campaign's DM options say «company»; additive, no table or row changed).
- **The company's prep.** The prep of a company table asks for the layer to be written with no one at its centre — each character the natural addressee of at least one puzzle, threat or reward, none of more than half, the threads touching each one's hooks — and keeps the DM's own list in the layer.

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
| A1 | **held** | tests: no «hero» in any DM request of the mode on the mocked host (tests/multi-hero-1*.test.mjs). Dry run: 36 DM requests read; the frame: 0 hit(s); the story's own words: 0; the wizard's draft of the first record (outside the mode): 15; the app's checkers (not the DM): 12 |
| A2 | **lost** | shares Bram 42.7 %, Sefa 29.4 %, Pell 27.9 %; spread 14.8 % (bar ≤ 10 points); largest 42.7 % (bar ≤ 45 %) |
| A3 | **held** | held on the mocked host (tests/multi-hero-1.test.mjs, tests/multi-hero-1-app.test.mjs): each seat earned its own Inspiration and spent it on its own roll; two rerolls per player, the third refused for that player only; the thread of the scene Pell walked into reached his journal only. Dry run: cards per seat Bram 0, Sefa 1, Pell 3; rerolls used Bram 0, Sefa 0, Pell 1; Inspiration in play: none earned or spent |
| A4 | **lost** | copied runs of 8 on the screens: first answers 19, after the second ask 14; waiting lines: none in the dry run (the skip is tested on the mocked host) |
| A5 | **held** | the full suite on this branch: 3 103 tests, 3 071 pass, 27 skipped, 2 fail, 3 cancelled — the two mega-dm fixture tests that read old commits this shallow clone does not have, and three World Lab tests in tests/d2a-composition.test.mjs that wait on a 1 ms AbortSignal.timeout Node does not keep alive (all five fail the same on the base commit, 03b0991; before the rebase the three passed); the owner-path smoke (tests/multi-hero-1-app.test.mjs «A5»): without the option the DM is sent the same frame and the same toolset object, and the table keeps its two shared rerolls. Typecheck, zero-warning lint and the production build pass. |
| A6 | **held** | held on the mocked host, from each seat in turn (tests/multi-hero-1.test.mjs): rounds 1–3, each asking seat got a card of its own character, pressed by its own player, rerolled twice on its own allowance; a press from a seat with no card was refused on screen and never counted as «stuck»; each seat spent its own Inspiration. |
| A7 | **lost** | the guide's note says it (a test); rounds tagged 6; a round waiting on one character: r4 Bram Halloway, r6 Sefa Marrin; the same single character addressed every round: no |
| A8 | **held** | P-GOAL: 6 item(s) — Bram 2, Sefa 2, Pell 2; threads touching each one's hooks Bram 4, Sefa 4, Pell 4; the DM's own list Bram 2, Sefa 2, Pell 2 · P-DUNGEON: 7 item(s) — Bram 2, Sefa 2, Pell 3; threads touching each one's hooks Bram 14, Sefa 7, Pell 4; the DM's own list Bram 2, Sefa 2, Pell 3 |

How each line is read: `READINGS` in `scripts/multi-hero-1/frozen.mjs`.

## Evenness (A2, built in — reported every table from here on)

| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |
| --- | --- | --- | --- | --- | --- |
| Bram Halloway | 299 | 42.7 % | 2.3 % | 6 | 1320 (27.7 %) |
| Sefa Marrin | 206 | 29.4 % | 2.7 % | 9 | 1607 (33.8 %) |
| Pell Dunmore | 195 | 27.9 % | 3 % | 12 | 1834 (38.5 %) |
| (the world: about no character) | 1448 | — | — | — | — |

Per round (words about each): r1 Bram 55/Sefa 15/Pell 7 · r2 Bram 69/Sefa 25/Pell 15 · r3 Bram 51/Sefa 17/Pell 14 · r4 Bram 24/Sefa 12/Pell 48 · r5 Bram 37/Sefa 62/Pell 48 · r6 Bram 63/Sefa 75/Pell 64.

## Initiative (A7): the order sent to the DM and whom its call for action addressed, by the round tags

| Round | Order sent to the DM | Addressed | Waits on one character |
| --- | --- | --- | --- |
| 1 | Bram → Sefa → Pell | — | — |
| 2 | Sefa → Pell → Bram | — | — |
| 3 | Pell → Bram → Sefa | Bram, Pell | — |
| 4 | Bram → Sefa → Pell | — | Bram Halloway |
| 5 | Sefa → Pell → Bram | — | — |
| 6 | Sefa → Bram / Pell | Sefa | Sefa Marrin |

- r4, waits on Bram Halloway: «The narration ends on no question or call to a character, but it closes with Bram not yet having answered Sefa's question and Pell's offer, so the scene is left waiting on him.»
- r6, waits on Sefa Marrin: «The Hob scene closes with Bram's question, which is Sefa's to answer while Bram waits, and the Pell scene ends on no call to action.»

The judges: Claude Haiku 5.5 twice (effort low), a third pass on a disagreement.

## Neutral prep (A8): the frozen company layers

- **P-GOAL** — sha256 `68f7c50cce77fabe190b900c3e0107b6f29ffbe7b53959b1f8e6e308d25cb48a`: the blind reading lists 6 puzzles, threats and rewards (Bram 2, Sefa 2, Pell 2); every character at least one and none more than half: yes; threads touching each one's hooks: Bram 4, Sefa 4, Pell 4. The DM's own list: Bram 2, Sefa 2, Pell 2 of 6.
- **P-DUNGEON** — sha256 `71ce3d43e07f5cc0a01bf9e58581531c9035d2ea1a121eb1d27f4ac8999423a9`: the blind reading lists 7 puzzles, threats and rewards (Bram 2, Sefa 2, Pell 3); every character at least one and none more than half: yes; threads touching each one's hooks: Bram 14, Sefa 7, Pell 4. The DM's own list: Bram 2, Sefa 2, Pell 3 of 7.

## The paraphrase (A4)

Of the 14 run(s) still on the screens after the second ask, none came through the DM's own narration: all are the relay's own.

- r1: Bram Halloway's screen copied Pell Dunmore's words in the relay's first answer: «the stool with its back to the wall» — still there after the second ask
- r1: Sefa Marrin's screen copied Bram Halloway's words in the relay's first answer: «props his shield against the wall within reach» — still there after the second ask
- r1: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first answer: «pell takes the stool with its back to» — still there after the second ask
- r1: Pell Dunmore's screen copied Bram Halloway's words in the relay's first answer: «the chair with his back to the wall» — still there after the second ask
- r1: Pell Dunmore's screen copied Sefa Marrin's words in the relay's first answer: «her eyes rest for a moment on the» — still there after the second ask
- r2: Pell Dunmore's screen copied Sefa Marrin's words in the relay's first answer: «came up from the gate by the trade» — still there after the second ask
- r2: Bram Halloway's screen copied Sefa Marrin's words in the relay's first answer: «came up from the gate by the trade» — still there after the second ask
- r2: Bram Halloway's screen copied Pell Dunmore's words in the relay's first answer: «a ferryman who wanted two coppers to take» — still there after the second ask
- r3: Pell Dunmore's screen copied Bram Halloway's words in the relay's first answer: «facing north toward the gate or south toward» — retold on the second ask
- r3: Bram Halloway's screen copied Pell Dunmore's words in the relay's first answer: «two wagons a day or more overdue and» — retold on the second ask
- r3: Sefa Marrin's screen copied Bram Halloway's words in the relay's first answer: «crust was the only thing on the plate» — retold on the second ask
- r4: Bram Halloway's screen copied Pell Dunmore's words in the relay's first answer: «two miles past the last farm on the» — retold on the second ask
- r4: Sefa Marrin's screen copied Bram Halloway's words in the relay's first answer: «knew the caravan master who hired them a» — retold on the second ask
- r4: Sefa Marrin's screen copied Pell Dunmore's words in the relay's first answer: «two miles past the last farm on the» — retold on the second ask
- r4: Pell Dunmore's screen copied Sefa Marrin's words in the relay's first answer: «someone had told them to watch the inn» — still there after the second ask
- r5: Pell Dunmore's screen copied Bram Halloway's words in the relay's first answer: «two miles past the last farm moving south» — retold on the second ask
- r5: Bram Halloway's screen copied Pell Dunmore's words in the relay's first answer: «into the dusk keeping to the side of» — retold on the second ask
- r6: Sefa Marrin's screen copied Bram Halloway's words in the relay's first answer: «a man who drove a wagon up that» — still there after the second ask
- r6: Bram Halloway's screen copied Sefa Marrin's words in the relay's first answer: «in the back room and hallam's boy at» — still there after the second ask

## The table

Seats: Bram Halloway (Claude Haiku 5.5); Sefa Marrin (Claude Haiku 5.5); Pell Dunmore (Claude Haiku 5.5). Counts: strayPresses 0, swallowed 0, proseAtCard 6, questions 0, autoCards 0, relayFallbacks 0, waitingRounds 0, relayCopied 19, relayCopiedAfter 14, relayRetold 6. Player words: Bram 1320, Sefa 1607, Pell 1834.

## Money

- openrouter: $0.27 of $5.00.
- The spend checks: before the dry run — OpenRouter account left $173.75; after the dry run — OpenRouter account left $166.19.
- Caps: anthropic $0, openrouter $5, openai $0; no other paid call.

## Files

- the run record: `docs/runs/multi-hero-1-run-20261029-070232.json`
- the rounds side by side (page): `docs/runs/multi-hero-1-rounds.html`
- the rounds side by side (markdown): `docs/runs/multi-hero-1-rounds.md`
- the transcripts: `docs/runs/multi-hero-1-transcripts/SAND-haiku`
- the frozen layers (DM-only) and the manifest (the world's snapshot, built on Haiku, is named there by its sha256 and not committed): `docs/runs/multi-hero-1-frozen/`
- the ledger: `docs/runs/multi-hero-1-ledger-openrouter.md`
