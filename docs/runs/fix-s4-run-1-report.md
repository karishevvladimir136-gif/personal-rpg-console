# Fix S4 run 1 — report

Stage: `docs/stages/FIX_S4_RUN_1.md` with `docs/stages/FIX_S4_TABLE.md` (both on `origin/claude/handoff` at `e13d457`).

**Branch.** `claude/fix-s4-run-1-apsty3`, the session's designated name for `claude/fix-s4-run-1`. It starts from
`origin/claude/game-player-2` at `6158fff`. `origin/claude/anthropic-providers-1` (`d13b0fa`) was already in it, so that
merge changed nothing. The one commit of `claude/persona-self-talk-x3-fix-1` (the `reasoning_content` ledger field) is not
included: that branch has not landed on origin.

**Nothing went to `main`.**

**Scope.** Items 1–6 and 11a–11w, with the keep-list as tests. The pictures (items 7–9) wait, as the stage says. Item 10's
three table rules were not touched (none of their text is in `src` on this branch).

**Work.** Five workers in their own worktrees (the roll record; the waiting card; the campaign start; the small screen
things; the lead's rules, table notes and clock) were merged by the lead.

## In short

- **Every item has code and a test, or (for model-behaviour rules) a prompt-level test plus a bench measure for later.**
  The table below maps each item to the player's line it answers and to its test.
- **The roll card adds the sheet's number.**
  - On the twelve group-1 transcripts, 27 of the 32 cards that use a numbered sheet line were wrong. All 32 now read
    the sheet's own number.
  - The per-table constant (+2 on Table B, +4 on Table C) is gone.
  - Five recorded outcomes would flip by the sheet (below). The record is left as it was.
- **New on the table:**
  - «?» while a card waits;
  - a withdrawn or voided card;
  - rerolls that name their card and show how many are left;
  - a refused press shown with its reason;
  - the DM's clock line;
  - table notes that the DM keeps.
- **One additive migration:** `202610250701_fix_s4_run_1_pending_cards` (the card states; no table, column or row
  changes). Its row is in `docs/SANDBOX_LOAD_FIX_S2.md`.
- **Checks and smoke:** see the sections below.

## Spend check (before the paid run)

| Door | Balance / state |
| --- | --- |
| OpenRouter | $600 credits. Left before this stage: $466.78 at the start; $454.59 just before the smoke. The $12.19 between the two checks was not this session's: it made no paid call in that time, so another user of the key spent it. |
| OpenAI | The key answers (HTTP 200); this key cannot read its balance. |
| Console | Not used (cap $0). The month's Console limit was reached on 2026-10-25. |

For CARRY_1a: its $450 OpenRouter cap is now close to the whole balance left. Top up before CARRY_1a starts.

## The items

Each row: the line it answers, what changed, and the test (file `tests/fix-s4-run-1-*.test.mjs` unless named).

| Item | The line it answers | What changed | Test |
| --- | --- | --- | --- |
| 1 | The owner's hour: the DM wrote «that's now a fact of James's story», then next turn «I went back through my notes and I can't find that discussion.» | Every committed «?» exchange is a table note. The DM sees this session's whole and earlier ones in a line, in every turn and in the next «?» (`dm-loop/table-notes.ts`, `context.ts`). The digest carries the session's notes into the next session's notebook (`digest.ts`). The journal shows them under «Договорились за столом / Agreed at the table». A fact the exchange settles («tableFact» in the answer) is pinned as an owner fact: the DM always sees it, and the owner sees it pinned and can unpin it. | `table`: «item 1: a «?» exchange is a table note…», «…the notes' shape…», «…a fact the exchange settles becomes an owner-pinned fact…» |
| 2 | The owner's hour: a Deception check on a true answer («she gave me no such word»). | Rule, both languages: a check only when the hero chooses to lie. If the DM thinks the hero is mistaken, it asks out of game. An NPC's belief is hers, never a fact about the hero; the hero is never asked to account for a fact in no record. | `table`: «items 2, 4, 11d…: the players' rules…» (prompt-level). The bench measure is the judge's `DECEPTION_RULE` (`true_statement`), already in the harness. |
| 3 | The owner's hour: the DM cancelled the check in its aside, but the card stayed with «Roll the die» live. | The DM may withdraw a waiting card in its «?» answer (`withdrawChecks`, checked by the server), or the owner from the card («Withdraw this check»). The card becomes one quiet line, and «Onward» tells the DM. A rolled card can be voided by the owner («Void this roll (owner's correction)»): the record is amended with a mark, never rewritten, and an owner fact is pinned. Migration `202610250701`. | `pending`: «item 3: the DM withdraws the card…», «item 3: the owner withdraws a waiting card…», «item 3, roll-then-cancel: the owner voids a rolled card…», «check_correction holds its invariants…» |
| 4 | The owner's hour: three turns ended «(Out of game: here's that cut spelled out…)». | Rule, both languages: the outcome of every roll, contested ones above all, is said in the story in the same paragraph as the dice or cards («Her king beats his queen; the question is hers»). No out-of-game paragraph restates numbers. | Prompt-level (`table`). The stage's 3 × 2 measure is paid and was not run: smoke only. |
| 5 | The owner's hour: the cat's portrait came out as a man with a raven. | A familiar or animal companion is a creature. Its portrait prompt draws the animal alone (no person, no full-length doll). Its visual profile is drafted from words only (owner's text first, then the sheet line), never from a picture. A redraw after an owner edit follows the text (`visual-frame/creature.ts`, `pictures.ts`, `pictures-service.ts`, `brief-model.ts`). | `start`: four «item 5: …» tests |
| 6 | The owner's hour: «⚡ important turn» ran one plain reply at «max» for 268 s. Also: the field did not clear, the placeholder stayed, the hint stayed, and the editor sat on the game screen. | **⚡:** it is off unless pressed and shows «⚡ Important turn: off/on». The client bug is fixed: a stale revision made the second press fail and flip back to «on». A council line never spends it. The depth classifier reads «something irreversible is decided» (an oath, a deal, a betrayal, a killing blow, giving away or destroying, a point of no return) and thinks one notch deeper. **The other four:** the field empties at Send; the placeholder goes after the first turn; the hint folds after the first visit (per campaign); the editor moved to «More → For the owner». | `screen` (10 tests); `table`: «item 6…: a council line never spends «⚡»…» |
| 11a | Every player: the card shows «Persuasion +7» and adds +4 (or +2). | The first signed number after the skill's name on its sheet line (`sheetBonus`/`readSheetBonus`, `execute.ts`). The roll record keeps the modifier and its basis (`modifierBasis`; addend `basis`, e.g. «sheet: Persuasion +7 (Beguiling Influence)»). | `roll`: «11a: the drafted sheets of the twelve group-1 sessions…» and three more; fixture `test-fixtures/fix-s4-run-1/drafted-sheets.json` |
| 11b | Astra: «Pressing Onward felt like accepting a result I knew was wrong». | «?» goes through while a card waits. The game screen keeps the waiting card live above the out-of-game talk. The DM answers seeing the card (its public face, never the die) and may correct it (item 3). The turn still waits for the die. | `pending`: «11b: «?» goes through while a card waits…», «the game screen: in the «?» view…» |
| 11c | Opus: «the heist premise hasn't surfaced yet»; Fable: «no sense of what Tymora actually wants»; Astra: «the larger premise barely came into view»; Sol: «What was missing was more specifically James». | **The prep:** it writes a length and an act plan with turn budgets, the owner's split by default (15 / 40 / 60 / end). The plan is DM-private (`dm-loop/clock.ts`, `hidden-layer.ts`). `finish_turn errandOffered` marks the first offer. **The clock line:** before every turn the DM reads «turn N of ~70; now act k; act 1 was due by 15 — L behind; the errand has (not) been offered; this session has run …; session s, … at the table in all». After a lag of more than five turns, the line names the three tools: offer, converge, ask about time; never shorten the player's day. **Elsewhere:** the owner panel shows only «act N». A pure-simulation campaign has no plan and no line (Table C stays the control). | `table`: three «11c: …» tests |
| 11d | Astra: «a numbered audit of opening a window interrupts the mood»; Fable: «the same paragraph about 'none of those needed a roll' appeared twice»; Opus: «read like the GM defending itself to an auditor». | Rule: an out-of-game note is one line. «No roll was needed» is one line, never a list. No retrospective summary after the narration. A plain retelling only when the story did not tell the outcome. | Prompt-level (`table`); measure on the bench (median words of out-of-game notes) |
| 11e | Fable (A), Astra (C): the hero's unread letter never reached the inventory. | The wizard's record pass unfolds a grouped papers line into its things (`adventures/sheet-records.ts`). A part already there is not doubled, and the owner's review stands. | `start`: three «11e: …» tests (all twelve drafted sheets) |
| 11f | Opus: «A short time-skip offer would have helped, something like 'nothing else happens before the lamps unless you want it to.'» | Rule: when a scene's business is done and nothing waits, end with one line that offers the time; the player may decline. The clock line repeats «ask about time». | Prompt-level (`table`) |
| 11g | Opus: «the cards haven't really been leaned on»; Sol (B): «…'investigating the table is a legitimate choice.'» | **Rule:** the weakness is a price, not a fragility. The world leans on it for a reason and may use the hero's card knowledge. Watching a table is not playing at it; never warn him off twice. **Prep:** each session it names one ban test (prep and digest). | Prompt-level (`table`); the prep's «banTest» in «11c: the prep asks…» |
| 11h | Sol: «James performed actions I hadn't explicitly chosen — paying for supper, … casting Light after offering it»; Astra: «…takes a little character ownership away from me». | Rule: money, slots, spells, actions and memories are the player's. The DM offers («You pay?») and never executes, and narrates no inner state the player did not write. A companion's senses are borrowed only when the player says so. | Prompt-level (`table`) |
| 11i | Sol: «every interaction was another guarded clue»; Astra: «Some ordinary explanations or unrelated city life…». | Rule and prep: for every scene with a hint, one without. At least one clue a session points the wrong way (the prep's «falseLead», renewed by the digest). | Prompt-level (`table`); the prep's «falseLead» |
| 11j | Sol: «made it unusually authoritative very quickly»; Astra: «clearer limits on telepathy versus actively borrowing its senses». | Rule: the familiar gives sensations and the player draws the conclusions. It knows only what it met in this campaign; nothing divine comes through it unless planned. | Prompt-level (`table`; also a keep-list line) |
| 11k | Opus (B): «The reroll was logged as "10 vs 15 — failure" although the 17 stood»; Astra (B): «the journal still recorded the original natural-one failure». | The standing roll is what the model reads, what the checker quotes, and what the chip and journal line show. The first roll stays as history marked «rerolled» (`dm-loop/standing-roll.ts`, `dm-store.ts`). | `roll`: five «11k: …» tests |
| 11l | Opus (B): «These need one source of truth before they matter in a fight»; Astra (B): «Those should be reconciled once, not silently changed». | The numbers the supplied sheet states win over the draft's re-derivation. The review step shows one list of differences. A companion at the default numbers takes the sheet's own (an owner correction after the opening). | `start`: three «11l: …» tests |
| 11m | Opus (B): «Even a small sensation at the moment of the reroll would have helped»; Fable (B): «…ideally with a deck in front of me». | Rule: every reroll, and every turn where luck visibly turned, carries one small sign of the patron. The patron speaks at temptation, not comfort. Prep: one «patronMoment» a session. | Prompt-level (`table`); the prep's «patronMoment» |
| 11n | Opus (B): «Several rolls felt like DC 15 for things a scout-trained veteran might just do». | Rule: before calling a check, ask whether the background covers it. Routine work in one's trade succeeds without a card. | Prompt-level (`table`) |
| 11o | Astra (B): «a raw `recall` invocation, duplicated explanations of resolved rolls, and awkward currency labels» (Table A's «+8 sps»). | A tool call written as text is dropped from the DM's stream, the paused card's told text and the saved narration; backticked tool names lose their backticks (`dm-loop/presentation.ts`, both runtimes). Coin codes on the chips read as words («+8 silver», `receipt-text.ts`). Rule: no tool names, tags or codes in the story. | `table`: two «11o: …» tests (B-astra's own leaked text; the money chip) |
| 11p | Astra (B): «the barely touched ale became a carried mug after leaving the Kettle». | Rule for the DM and the bookkeeper: possession only from what the story says was taken, bought or given. Money handed to the hero to hold or pass on is kept apart from his purse (an item «held for» its owner). | Prompt-level (`table`, bookkeeper role) |
| 11q | Astra (B): «Pim anticipating our trip to the Lady's Hall stood out». | Rule: what a person knows about the hero has a source in the records or the scene, and the DM can name it; the hidden layer gives sources, never omniscience. | Prompt-level (`table`) |
| 11r | Fable (B): «the app rerolled the *successful* Perception on the card above it…»; Fable (C): «I never saw how many rerolls I had left». | **The request:** a reroll names its card, and the server refuses any card that is not waiting now, in the loop and in SQL. A refused reroll never fails the turn. **The cards:** a card resolved at an earlier pause never waits again. Each waiting card has its own «Request an allowed reroll — <title>» and «Rerolls left: N of M». A roll that already dealt its damage takes no reroll (11k's gap). | `pending`: five «11r: …» tests, plus the screen test |
| 11s | Fable (B): «I'm carrying 350 *gold* and nothing smaller…». | A gold-only purse with no stated split starts as mixed coin: 90 % gold, 9 % silver, 1 % copper by value, exact (350 gp → 315 gp, 315 sp, 350 cp). The owner's split stays. | `start`: «11s: …» |
| 11t | Fable (C): «I'd rather see only what changed»; Astra (C): «a compact end-of-session summary». | Per turn, the screen (the harness's text screen) shows only the records that changed: a list as «+ came; − went». At session end, one «Where things stand / Где всё стоит» block (HP and counters, money in words, promises and debts) beside the open threads. | `table`: two «11t: …» tests |
| 11u | Fable (C): «The opening timestamp read "Day 1 · night" and then jumped seven hours on my first action.» | The opening's clock follows its narration («last night's», «until dawn» no longer set it). The first turn's «time passes» is the action's own length. | `start`: «11u: …» (all twelve openings), the PGlite start test |
| 11u′ | B-fable: «"Day 2 · night" ticked over at midnight, which is correct but jarred». | One `campaignDay`: the day turns at first light (05:00) or when a long rest ends, never at midnight. Screen, harness and DM use it (`gameplay/world-day.ts`). | `start`: «11u′: …» |
| 11v | Natural 20s: Inspiration granted twice and withheld twice across eight B/C sessions, by mood. | In code: a natural 20 on the hero's called, shown check grants Heroic Inspiration when he has none. The chip says why it was granted, or why it was withheld («already held»). Any other grant needs a named trigger quoted in the records (the table rule). A reroll's natural 20 does not count. | `roll`: two «11v: …» tests |
| 11w | Fourteen «?» messages and two reroll presses at B/C counted as nothing (C-opus t14, the «broken reroll button»). | A refused press is shown refused with its reason, on the screen and in the harness. The harness logs it `swallowed`, and the report counts «?» presses and refused presses apart. | `pending`: «11b/11w in the harness…»; the smoke (below) |

### The keep-list as tests

The players' «what worked» stays a rule, in both roles and both languages, closing the table rules. «the keep-list as
prompt-level tests…» (in `table`) asserts each line in all four role texts. It also asserts that the new rules never ask
to soften a die, hurry the player or speak for the hero.

| What worked | Tested how |
| --- | --- |
| A failed lie still earns its scene | prompt-level |
| The cat speaks in sensations | prompt-level (11j's rule) |
| The die is not softened | prompt-level (with «failure is canon» from before) |
| Rules flagged before they bite | prompt-level |
| Silence where the scene speaks | prompt-level |
| Consequences on the world's schedule | prompt-level (with «the world moves for game time only» from before) |
| NPCs with their own limit | prompt-level (with «NPCs may refuse» and «not there to serve the plot») |

None of these could be tested by a scenario without paid calls. Whether the fixes dulled any of them is for the acceptance
bench (the same four players, CARRY_1a / 1b) to show.

### 11a in numbers (the twelve group-1 transcripts)

| Session | Cards | Sheet-line cards | Wrong before | What changes |
| --- | --- | --- | --- | --- |
| A-opus | 4 | 4 | 4 | Persuasion, Deception +4→+7; Perception +2→+1 ×2 |
| A-fable | 3 | 3 | 3 | Persuasion +4→+7 ×2; Religion +4→+3 |
| A-astra | 3 | 2 | 2 | Persuasion, Intimidation +2→+7 |
| A-sol | 5 | 3 | 1 | Deception +4→+7 |
| B-opus | 9 | 4 | 3 | Deception ×2, Persuasion +2→+7 |
| B-fable | 10 | 5 | 3 | Persuasion ×2, Deception +2→+7 |
| B-astra | 6 | 4 | 4 | Perception +2→+1 ×3; Persuasion +2→+7 |
| B-sol | 2 | 1 | 1 | Persuasion +2→+7 |
| C-opus | 8 | 2 | 2 | Intimidation, Persuasion +4→+7 |
| C-fable | 5 | 2 | 2 | Persuasion, Deception +4→+7 |
| C-astra | 1 | 1 | 1 | Arcana +4→+3 |
| C-sol | 1 | 1 | 1 | Arcana +4→+3 |

Outcomes the sheet's number would flip. Reported only; the records stay as played, and CARRY keeps them:

| Turn | Recorded | By the sheet | Note |
| --- | --- | --- | --- |
| C-sol t9 | Arcana 11 + 4 = 15 vs 15, success | 14, a failure | Thalantyr's answer rests on it |
| B-astra t7 | a natural 1 rerolled to 12 + 2 = 14, failure | 19, a success | the prose overrode it |
| C-fable t18 | 7 + 4 = 11 vs 14, failure | 14, a success | the prose overrode it |
| A-fable t2 | 12, failure | 15 vs 15, a success | new |
| A-astra t4 | 14, failure | 19, a success | new |

The last two were not in the night reading.

## The smoke

One four-turn table per player door on the fixed DM. Command:
`NODE_USE_ENV_PROXY=1 node --experimental-transform-types scripts/fix-s4-run-1/smoke.mjs --go`. Output files:
- page: `docs/runs/fix-s4-run-1-smoke-report.md`;
- transcripts: `docs/runs/fix-s4-run-1-smoke-transcripts/`;
- run record: `docs/runs/fix-s4-run-1-smoke-run-20261026-013130.json`;
- ledgers: `docs/runs/fix-s4-run-1-smoke-ledger-*`.

Setup:
- **The table:** Table A, «Envoy of Luck», with the wishes, so the prep writes the act plan.
- **The DM:** the owner's settings, Opus 5.5 writes and records, through OpenRouter.
- **The players:** Claude Haiku 5.5 (A-haiku, through OpenRouter) and GPT-6 Luna (A-luna, through OpenAI). No scoring.

| | A-haiku | A-luna |
| --- | --- | --- |
| Turns | 4, ended by turns | 4, ended by turns |
| The prep | a hidden layer of 10 136 characters, 3 clocks, an act plan (~70 turns, about 7 h) | 11 290 characters, 3 clocks, an act plan (~70 turns, about 7 h) |
| The card (11a) | «Deception … What adds to the die: +7 Deception» — the sheet's +7, not +2 | «Stealth … +2 Stealth» — the sheet's own «Stealth +2 (not proficient)» |
| Rerolls left (11r) | «Rerolls left: 2» on the card | «Rerolls left: 2» |
| A refused press (11w) | the probe «I wait.» refused on screen with its reason, logged `swallowed` | the same |
| «?» while the card waits (11b) | answered with the card still waiting: «The card adds +7, straight from James's sheet, where it reads "Deception +7"…» | «The card adds +2, and that is your Dexterity modifier alone… your sheet lists it the same way: "Stealth +2 (not proficient)"…» |
| The clock line (11c), every turn | «turn N of ~70 (about 7 hours of play); now act 1 — …, to turn 15; the errand has not been offered; for the player this session has run M min, session 1…» | the same shape |
| The records at the start | Rapier +5, Healing Light «up to 5 dice», Money 315 gp / 315 sp / 350 cp, opening «Day 1 · evening» as narrated, first turn «Time passes: 5 minutes» | the same; first turn «Time passes: 2 minutes» |

**What the smoke found.** The unread letter reached the pack, but named «Sum and the name are the DM's. A letter». The
drafted description had a sentence where 05 has a semicolon. Fixed after the smoke: a new sentence that starts like a
thing is its own part, and a clause is never a thing (`adventures/sheet-records.ts`). Regression test «11e, the smoke's
drafted line…» in `start`. The smoke was not run again for it.

**The cat stayed at 8/8.** Neither 05 nor these two drafts state the cat's numbers (see «Declared changes and limits»).

**Shown, and what stays DM-private.** The clock line is DM-side: the record and the page show its public form, with the
act plan's aims, its convergence notes and the errand left out («…»).

**Money:**

| Door | Spent | Cap |
| --- | --- | --- |
| OpenRouter | $5.0231 (Opus 5.5 $5.01: wizard, opening, prep, eight turns, two «?»; Haiku 5.5 $0.014) | $15 |
| OpenAI | $0.0104 (GPT-6 Luna) | $3 |
| Console | $0 | $0 |

## Checks

On a clean worktree (no `.env.local`; `node --test --test-concurrency=2 tests/*.test.mjs`; clone unshallowed first,
as `docs/CLOUD.md` says):

| Check | Result |
| --- | --- |
| Full suite on `468b99fd` (the final code) | **3 040 tests · 3 013 pass · 0 fail · 27 skipped** |
| `pnpm typecheck` | pass |
| `pnpm lint --max-warnings=0` | pass, zero warnings |
| `pnpm build` (production) | pass |

The baseline before this stage (the branch as it came, `6158fff`) was 2 972 tests, 2 943 pass, 2 fail, 27 skipped. Both
failures came from git history missing in the shallow clone; they pass after `git fetch --unshallow`.

The first integrated run, on `cab46046`, had one failure: `stage4-dossier`'s plan due at minute 2 880 read «day 3». By
11u′ the day turns at first light, so 00:00 is still the second day's night. The assertion now reads «day 2 00:00»
(`468b99fd`), and the suite above was run again on that commit.

Typecheck, lint and build ran on `cab46046`; the last commit changed one test assertion only.

New test files:

| File | Tests |
| --- | --- |
| `fix-s4-run-1-table` | 14 |
| `fix-s4-run-1-roll` | 13 |
| `fix-s4-run-1-pending` | 18 |
| `fix-s4-run-1-start` | 15 |
| `fix-s4-run-1-screen` | 10 |

## Declared changes and limits

- **The smoke's wizard gets 05 §2 (the sheet) with §1.** Game player 1's wizard step pastes only §1. The owner checks
  §2 field by field on the review; the harness accepts the draft as drafted. Without the sheet, 11e and 11l cannot
  show. `heroSheet: true` is the smoke stage's only. Game player 1 and 2 are unchanged, and their frozen design hash
  does not cover it.
- **The smoke's two probes.** On the first waiting card the harness itself sends a stray message (refused on screen,
  logged `swallowed`) and a «?» about the card. Both are marked `probe`, never counted as the player's.
- **«Haiku player per door»** is read as the cheap player of each door: Claude Haiku 5.5 through OpenRouter, and GPT-6
  Luna through OpenAI. The DM is the owner's: Opus writes, Opus records, through OpenRouter.
- **The cat's numbers:** only 6 of the 12 drafted sheets have a cat stat line. Elsewhere it keeps the default, because
  neither 05 nor the draft states one.
- **Attunement:** the drafts agree with 05. The players' complaint is 05 against the DM guide's house rule (03), which
  the wizard never reads. Not reconciled here.
- **The scene frame prompt** still lists the cat among «people». With a correct portrait and profile as references,
  frames should follow, but the prompt itself does not yet say «animal». A follow-up.
- **«Void this roll»** is offered on the latest story turn's cards only.
- **A DM who says in prose that it withdraws a check but does not use the field** leaves the card. The owner's
  «Withdraw this check» covers it.
- **The records panel** (the app's side panel) keeps its compact coin codes, with the coin's name as the title. The
  chips and the story use words.
- **One older test widened:** `tests/polish3-craft.test.mjs` asserts layer 1 stays under 0.65 (was 0.6) of itself
  plus the craft library. The players' rules added about 1,500 tokens; the library still stays out of layer 1.
- **Tests updated for changed behaviour:**
  - by the roll worker: `polish-group2` (the chip names the Inspiration grant);
  - by the screen worker: `fix-s3-pre-2`, `playtest-game-character-ui`, `polish-group10`, `fix-s2-c-ui`, `polish3-split`
    (the editor's new place, the fresh-revision save);
  - by the pending-card worker: `astra-first-startup-gate` (one stub), `integration-saves` (the new migration in its list);
  - by the campaign-start worker: `astra-first-creation-review` (one stub).

## What the owner does

- **Nothing to set up for the branch itself.** The new migration applies by itself on the next `--prod` start
  (`docs/SANDBOX_LOAD_FIX_S2.md`).
- **To try it:**
  - a new campaign: the letter is in the pack, the purse is mixed coin, and the opening's time is the scene's;
  - press «?» while a card waits: the card stays, the DM answers;
  - on a card: «Withdraw this check» / «Void this roll»;
  - the reroll button names its card, and «Rerolls left» shows;
  - after a «?», the journal's «Agreed at the table»;
  - «⚡ Important turn: off» by default;
  - the campaign editor is under «More → For the owner».
- **Approval is the owner's.** This report records implementation and checks, not acceptance.

## Next

GAME_PLAYER_CARRY_1a branches from here (`origin/claude/fix-s4-run-1-apsty3`) once the owner agrees. Its $450 OpenRouter
cap is close to the balance left on the key (see the spend check).
