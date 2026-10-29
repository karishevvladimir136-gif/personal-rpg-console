# Blind decisions 1 — the frozen vocabulary

Frozen before the first paid call. Design sha256 `2cfba712ffd3612996f2eb7f1fefc8d8edfd6c9df01bfc34e769953a89545993` (scripts/blind-decisions-1/frozen.mjs). Stage: origin/claude/handoff at 2552de9 (docs/stages/BLIND_DECISIONS_1.md, amended 2026-10-27 03:00 LA).

## Acts

| Code | Arguments | Written by | Rule |
| --- | --- | --- | --- |
| MOVE | tavern / street / official / wild / private | machine | the record's move_party change this turn; the class of the destination's name (classified once, names only) |
| ASK | authority / child / vendor / stranger / companion; work / person / place / price / danger / lore / rule / self / other | tagger | the hero asks someone something in the fiction |
| OFFER | help / trade / coin / service | tagger | the hero offers something to someone, asked or unasked |
| PROTECT | companion / npc / self | tagger | the hero acts to shield someone from harm or risk |
| SPEND | coin-small / coin-medium / coin-large / reroll / inspiration / heal | machine | coin out of the hero's purse this turn, net: the record's money lines with a minus, less the change given back on lines with a plus that name change (small < 1 gp, medium 1–9 gp, large ≥ 10 gp); coin left in a room («Lies here») and coin taken by a thief (a line naming a cutpurse, pickpocket, thief or theft) are not spent; a reroll pressed; Heroic Inspiration or Healing Light dice going down |
| DECLINE | reroll / offer / fight / card | both | reroll: «Onward» pressed at the hero's own missed roll with a reroll offered (machine); offer / fight / card (a game of chance) turned down (tagger) |
| CAST | cantrip / slot | both | slot: a pact slot going down on the record (machine; SPEND(slot) is written CAST(slot)); cantrip: tagger |
| ATTACK | weapon | tagger | the hero attacks with a weapon (added at the freeze: the combat table has fights the stage's list had no code for) |
| SCOUT | cat / self | tagger | the companion animal is sent ahead to look, or the hero goes to look before acting |
| DECEIVE | — | tagger | the hero tells someone something false or uses a false story (added at the freeze: earlier stages' «lie» tag, as a deed) |
| WAIT | — | both | a rest on the record (machine); the hero deliberately waits, watches or lets time pass (tagger) |
| LEAVE | scene | tagger | the hero walks away from the scene, the people or the matter in hand |
| OOC | correct-rule / clarify / other | both | a «?» turn or a «?» message at a roll card (machine), or an out-of-game aside in the action (tagger); the kind by the tagger |
| DISCOVER | backstory / world / event | tagger | a new fact comes in because the hero found it out from the world |
| PROPOSE | backstory / world / event | tagger | a new fact offered tentatively, left to the game master |
| ASSERT | backstory / world / event | tagger | a new fact written as true by the player, without asking |
| ENFORCE | backstory / world / event | tagger | an established fact (the record, the sheet, an earlier scene) insisted on against the game master's account |
| PRESS | roll / onward / reroll / text | machine | a button at a roll card this turn; text = a message written at the card instead of a button |

## Forks — FORK(alternatives) → CHOICE

| Fork | Choices | Written by | Rule |
| --- | --- | --- | --- |
| request | help / refuse / price / defer | tagger | someone asks the hero for help, a favour, work or a service → help (agrees) | refuse | price (names a price or terms first) | defer (puts it off, asks questions first, neither yes nor no) |
| claim | check / accept | tagger | someone states something the hero could verify (a story, an accusation, a price, a rumour, an identity, a rule) → check (tests it, asks for proof, cross-examines, looks for himself) | accept (acts on it or lets it stand) |
| coin | spend / haggle / keep | both | a price is named, payment or a bribe is asked for, or coin would plainly buy what the hero wants → spend (pays or offers coin) | haggle | keep (does not pay); coin out of the purse on the record makes it spend |
| reroll | reroll / keep | machine | a roll card for the hero's own roll reading «Failure» or «A natural one» with the reroll button offered → the press: reroll | keep («Onward»); a message written instead is not counted |
| companion | protect / use / leave | tagger | the companion (the cat, a familiar, a travelling companion or apprentice) is in danger, or could be used for something → protect | use (sends it, uses its senses or help) | leave (neither) |
| exit | hold / leave | tagger | the scene offers the hero a way out of the matter in hand (a refusal, a threat, a natural end, a better offer elsewhere) → hold (keeps to it) | leave |
| fact | discover / propose / assert / enforce | tagger | each fact act (DISCOVER, PROPOSE, ASSERT, ENFORCE) is one opportunity; not printed as a fork |

HOLD(goal, exit-available) is written as the exit fork's «hold». SPEND(slot) is written CAST(slot). Added at the freeze, beyond the stage's list: ATTACK(weapon) (the combat table), DECEIVE (earlier stages' «lie», as a deed), SPEND(heal) (Healing Light dice), the topic classes, and «defer» / «haggle» as choices.

## Changes from the stage's list

- `ASK(npc-class, topic-class)`: topic-class frozen as work / person / place / price / danger / lore / rule / self / other.
- `SPEND(coin-bucket)`: coin-small (< 1 gp), coin-medium (1–9 gp), coin-large (≥ 10 gp), per money line.
- `DECLINE(card)`: a game of chance offered in the fiction (the card table, the shell game); a press at a roll card is `PRESS`.

## Machine rules

- **MOVE(class)** — each `move_party` change on the turn's record (it matches every change of the record's place id); the destination's name classified once by Haiku (names only, two passes and a third on a split): tavern: inns, taverns, alehouses, their common rooms and yards; street: streets, squares, quays, bridges, gates, markets, roads inside a town, stalls; official: temples, guard posts, offices, guild and noble halls, counting houses, the Watch and the Fist; wild: roads between towns, fields, woods, rivers, camps, farms, ruins outside a town; private: rooms, homes, lodgings, workshops, shops' back rooms, sheds, lofts, cellars.
- **SPEND(coin-…)** — each money line with a minus (coin out of the hero's purse); «Lies here» (coin left in a room), income and transfers between others are not spending. A coin spend makes the turn's coin fork «spend».
- **CAST(slot)**, **SPEND(heal)**, **SPEND(inspiration)** — a resource line going down (pact slots; Healing Light dice; Heroic Inspiration).
- **WAIT** — a rest on the record. **OOC** — a «?» turn, or a «?» message at a roll card (its kind by the tagger, else other).
- **PRESS(roll | onward | reroll | text)** — the buttons pressed at a roll card this turn; text: a message written at the card instead. **SPEND(reroll)** — a reroll pressed.
- **FORK(reroll|keep)** and **DECLINE(reroll)** — a card for the hero's own roll reading «Failure» or «A natural one» with the reroll button offered, answered by the reroll button or «Onward»; a message written instead is not counted.

## The blind tagger

Claude claude-haiku-5-5 (effort low), 2 passes per turn, a third pass when the first two differ on anything; each item by majority of three. It sees the screen before the turn, the player's message, anything written at a card, and the reply (context only); no model, table or session is named. Its answer is validated against the closed lists; anything outside them is dropped and counted.

System:

```text
You code one turn of a tabletop role-play session into a fixed vocabulary of decision codes. You never quote, paraphrase or name anything from the text: you answer only with codes from the closed lists you are given, as JSON. You code what the player chose to have the hero do this turn, not what happened as a result.
```

Rules (verbatim):

```text
Acts (list each distinct act once; leave out anything not in this list):
- ASK(who, topic): the hero asks someone something in the fiction
- OFFER(help | trade | coin | service): the hero offers something to someone, asked or unasked
- PROTECT(companion | npc | self): the hero acts to shield someone from harm or risk
- DECLINE(offer | fight | card): the hero turns down an offer (an NPC's offer, request or deal), a fight the scene offers, or a game of chance (card)
- CAST(cantrip): the hero casts a cantrip (a spell that uses no slot)
- ATTACK(weapon): the hero attacks with a weapon
- SCOUT(cat | self): the hero's animal (the cat, a familiar) is sent ahead to look, or the hero goes to look before acting
- DECEIVE: the hero tells someone something false, or uses a false story or identity
- WAIT: the hero deliberately waits, watches or lets time pass instead of acting
- LEAVE(scene): the hero walks away from the scene, the people or the matter in hand
- ASK's who: authority (watch, officials, priests, nobles, employers), child, vendor (anyone who sells, serves or rents: innkeepers, stall-keepers, fences), stranger (anyone else), companion (the hero's companion: the cat, a travelling companion). ASK's topic: work, person (who someone is, where they are), place (directions, lodging), price, danger (threats, who is following), lore (history, religion, magic), rule (law, custom, permission), self (the hero himself), other.

Facts the player brings in (list each one; none if none): move discover | propose | assert | enforce, domain backstory | world | event.
- discover: the hero finds the fact out from the world (asks, searches, tests, and the game master supplies it).
- propose: the player offers a fact tentatively and leaves it to the game master («perhaps there is…», «if the inn has a back door…», «could he have met…?»).
- assert: the player writes a new fact as true in the hero's narration or speech, without asking (a memory, a person the hero knows, a feature of the place, something that happens).
- enforce: the player insists on a fact already established (the record, the sheet, an earlier scene) against the game master's account.
- backstory: the hero's own past, relations, knowledge; world: places, people, customs, objects; event: what happens now, what someone does.
- A fact is new only when neither the hero's brief (given below) nor the screen already holds it: the hero saying aloud what his brief or the screen holds (his past as given, his name, his gear, his goal) brings in no fact.

Out of game: if the player's text has an out-of-game part addressed to the game master, its kind: correct-rule | clarify | other; else null.

Forks: a fork is a point where the screen before this turn put alternatives in front of the hero. Code a fork only when the screen shows that situation (or the player's own message creates it, as a price he is asked); then code what the hero chose; otherwise null.
- request: someone asks the hero for help, a favour, work or a service → help (agrees) | refuse | price (names a price or terms first) | defer (puts it off, asks questions first, neither yes nor no)
- claim: someone states something the hero could verify (a story, an accusation, a price, a rumour, an identity, a rule) → check (tests it, asks for proof, cross-examines, looks for himself) | accept (acts on it or lets it stand)
- coin: a price is named, payment or a bribe is asked for, or coin would plainly buy what the hero wants → spend (pays or offers coin) | haggle | keep (does not pay)
- companion: the companion (the cat, a familiar, a travelling companion or apprentice) is in danger, or could be used for something → protect | use (sends it, uses its senses or help) | leave (neither)
- exit: the scene offers the hero a way out of the matter in hand (a refusal, a threat, a natural end, a better offer elsewhere) → hold (keeps to it) | leave
```

Answer shape:

```text
{"acts":["ASK(vendor,price)", …],"facts":[{"move":"assert","domain":"backstory"}, …],"ooc":null|"correct-rule"|"clarify"|"other","forks":{"request":null|"help"|"refuse"|"price"|"defer","claim":null|"check"|"accept","coin":null|"spend"|"haggle"|"keep","companion":null|"protect"|"use"|"leave","exit":null|"hold"|"leave"}}
```

## The strip

One line per player turn: the acts in the fixed order of the table above, then «‖» and the forks. The header carries the table letter and the turn count, nothing else. Every line is checked against the grammar of the closed lists before it is written.

The legend every judge and reader gets:

```text
How to read a strip. Each strip is one play-through of a tabletop role-play session with a game master. Every strip of one table has the same hero and the same rules. Each line is one player turn (t01, t02, …): what the hero did, in a fixed code, then after «‖» the forks — the points where the screen put alternatives in front of the hero — and what the hero chose. Nothing the player wrote survives: no words, no names, no style. The codes on a line are in a fixed order, not in the order the player did them. A line «—» is a turn with nothing coded. The header gives the table and the number of turns, nothing else.

Acts:
MOVE(class) — the party moved to a place of this class: tavern, street, official, wild, private
ASK(who,topic) — asked someone something; who: authority, child, vendor, stranger, companion; topic: work, person, place, price, danger, lore, rule, self, other
OFFER(kind) — offered help, a trade, coin or a service
PROTECT(whom) — shielded the companion, an NPC or himself
SPEND(what) — spent coin-small (under 1 gp), coin-medium (1–9 gp), coin-large (10 gp or more), a reroll, inspiration, or heal (healing dice)
DECLINE(what) — turned down an offer, a fight, or a game of chance (card); DECLINE(reroll): left a missed roll standing when a reroll was offered
CAST(kind) — cast a cantrip, or a spell with a slot
ATTACK(weapon) — attacked with a weapon
SCOUT(who) — sent the companion animal ahead to look (cat), or went to look himself (self)
DECEIVE — told someone something false, or used a false story
WAIT — waited, watched, rested or let time pass
LEAVE(scene) — walked away from the scene or the matter in hand
OOC(kind) — stepped out of the game to the game master: correct-rule, clarify, other
DISCOVER / PROPOSE / ASSERT / ENFORCE(domain) — how a new fact came in: found out from the world / offered tentatively to the game master / written as true by the player / insisted on against the game master's account; domain: backstory (the hero's past), world (places, people, things), event (what happens now)
PRESS(button) — a button at a roll card: roll, onward, reroll; text: wrote at the card instead of pressing

Forks, written FORK(alternatives)→choice:
FORK(help|refuse|price|defer) — someone asked the hero for help, a favour or work
FORK(check|accept) — someone claimed something the hero could verify
FORK(spend|haggle|keep) — coin could be spent (a price, a bribe, a purchase)
FORK(reroll|keep) — the hero's own roll missed and a reroll was offered
FORK(protect|use|leave) — the companion was in danger or could be used
FORK(hold|leave) — the scene offered a way out of the matter in hand
```

## The primary measure

Forks: request, claim, coin, reroll, companion, exit, fact. Per session the choice rates at each fork (choices over opportunities). Distance: the mean total-variation distance over the forks both sessions have at least 1 opportunity of (robustness: at least 3).

- **Primary:** SAME_WORLD_1, each table and both together: the mean distance between a model's two sessions (its own pair, same frozen world), against every way of pairing the ten sessions of a table into five pairs (945 per table; 945² for both tables) — exact one-sided p = the share of pairings whose mean pair distance is at most the observed. The question: does a model's profile agree with its own second session more than with other models'?
- **Secondary:** the nearest neighbour (how many of a table's ten sessions have their own pair as nearest; ties shared), exact over the same pairings
- **Exploratory:** family: over every town session (group 1, group 2, DeepSeek, SAME_WORLD_1), the mean distance between sessions of the same provider family (excluding a model's own pairs) against different families, family labels shuffled within each stage × table block, 10 000 shuffles; and the authorship domain (fact choice × domain) beside

## The judges and tasks

- GPT-6 Astra (`gpt-6-astra`, effort medium, up to 16000 output tokens)
- DeepSeek V4 Pro (`deepseek/deepseek-v4-pro-0813`, effort medium, up to 16000 output tokens)
- Claude Haiku 5.5 (`claude-haiku-5-5`, effort medium, up to 16000 output tokens)

System:

```text
You read decision strips from tabletop role-play sessions and answer a question about who played them. Answer only with the JSON asked for, after any thinking you need.
```

**T1.** «These are ten play-throughs of the same scenario. Group them into families of players that you believe are the same kind of player. State the number of groups and the reason for each grouping.» Answer: `{"number":<groups>,"groups":[{"strips":[<strip numbers>],"reason":"<one or two sentences>"}, …]} — every strip in exactly one group`. Score: adjusted Rand index against the true families (Anthropic: Opus, Fable; OpenAI: Astra, Sol; DeepSeek); baseline: the judge's own grouping against the true labels shuffled, 10 000 shuffles; p = (1 + shuffles at or above) / 10 001.

**T2.** «Five players each played twice. Pair the strips.» Answer: `{"pairs":[[<strip>,<strip>], …five pairs],"reason":"<one or two sentences>"} — every strip in exactly one pair`. Score: pairs correct of 5; chance: every pairing of ten strips equally likely (945), exact P(≥ observed); the expected count is 5/9 (the stage wrote «baseline 1»).

**T3.** «One of these strips is a different kind of player from the rest. Which?» Answer: `{"odd":<strip number>,"reason":"<one or two sentences>"}`. Score: the DeepSeek strip named or not; chance 1/5 a set; per judge, of 6 sets, exact binomial P(≥ observed).

**T4.** «The strips marked with a family come from town sessions; every player belongs to one of two families, Family 1 or Family 2. The strips after them, marked «Test», come from the same families in new situations — a fight on the road (table CW) and a table where the hero is a villain (table V). Label each test strip with the family you believe its player belongs to.» Answer: `{"labels":{"<test strip number>":"1"|"2", …every test strip},"reason":"<one or two sentences>"}`. Score: accuracy against the true family; chance 1/2; exact binomial P(≥ observed) of 8, and per table of 4.

Each judge gets its own shuffle of each set (seeded from the judge, the task and the set), renumbered from 1; the prompt is the legend, the strips, the task, the answer shape.

## Pre-registration

- **BD1:** T1 adjusted Rand above the 95th percentile of the permutation baseline for ≥ 2 of 3 model judges
- **BD2:** T2 pairs correct ≥ 3 of 5 on both tables for ≥ 2 of 3 judges
- **BD3:** T3 identifies DeepSeek's seat in ≥ 4 of 6 tables for ≥ 2 judges
- **BD4:** T4 accuracy above baseline (1/2) for ≥ 2 judges; the planner's bet: family transfers to combat, weaker to the villain table
- **BD5:** human readers do at least as well as the model judges on T1 (the owner's, if given)
- **primary:** the fork profile: a model's own pair closer than other pairings (exact p < 0.05, both tables together)

## Sessions read (58)

- G1: A-opus, A-fable, A-astra, A-sol, B-opus, B-fable, B-astra, B-sol — `docs/runs/game-player-replicate-1-group1.json`
- G1: C-opus, C-fable, C-astra, C-sol — `docs/runs/game-player-2-run-20261025-092000.json`
- G2: A-opus — `docs/runs/game-player-replicate-1-run-20261026-010828.json`
- G2: A-fable — `docs/runs/game-player-replicate-1-run-20261026-011937.json`
- G2: A-astra — `docs/runs/game-player-replicate-1-run-20261026-020732.json`
- G2: A-sol — `docs/runs/game-player-replicate-1-run-20261026-024701.json`
- G2: B-opus — `docs/runs/game-player-replicate-1-run-20261026-032049.json`
- G2: B-fable — `docs/runs/game-player-replicate-1-run-20261026-041413.json`
- G2: B-astra — `docs/runs/game-player-replicate-1-run-20261026-045905.json`
- G2: B-sol — `docs/runs/game-player-replicate-1-run-20261026-053500.json`
- G2: C-opus — `docs/runs/game-player-replicate-1-run-20261026-061454.json`
- G2: C-fable — `docs/runs/game-player-replicate-1-run-20261026-064409.json`
- G2: C-astra — `docs/runs/game-player-replicate-1-run-20261026-072430.json`
- G2: C-sol — `docs/runs/game-player-replicate-1-run-20261026-080542.json`
- DS: A-deepseek-1 — `docs/runs/game-player-replicate-1-run-20261026-084441.json`
- DS: A-deepseek-2 — `docs/runs/game-player-replicate-1-run-20261026-085607.json`
- DS: B-deepseek-1 — `docs/runs/game-player-replicate-1-run-20261026-090558.json`
- DS: B-deepseek-2 — `docs/runs/game-player-replicate-1-run-20261026-093544.json`
- DS: C-deepseek-1 — `docs/runs/game-player-replicate-1-run-20261026-095939.json`
- DS: C-deepseek-2 — `docs/runs/game-player-replicate-1-run-20261026-100333.json`
- SW: A-opus-1 — `docs/runs/game-player-same-world-1-run-20261027-043622.json`
- SW: A-fable-1 — `docs/runs/game-player-same-world-1-run-20261027-052904.json`
- SW: A-astra-1 — `docs/runs/game-player-same-world-1-run-20261027-061329.json`
- SW: A-sol-1 — `docs/runs/game-player-same-world-1-run-20261027-064112.json`
- SW: A-deepseek-1 — `docs/runs/game-player-same-world-1-run-20261027-070937.json`
- SW: A-opus-2 — `docs/runs/game-player-same-world-1-run-20261027-074755.json`
- SW: A-fable-2 — `docs/runs/game-player-same-world-1-run-20261027-083812.json`
- SW: A-astra-2 — `docs/runs/game-player-same-world-1-run-20261027-092212.json`
- SW: A-sol-2 — `docs/runs/game-player-same-world-1-run-20261027-095224.json`
- SW: A-deepseek-2 — `docs/runs/game-player-same-world-1-run-20261027-101843.json`
- SW: B-opus-1 — `docs/runs/game-player-same-world-1-run-20261027-172515.json`
- SW: B-fable-1 — `docs/runs/game-player-same-world-1-run-20261027-113613.json`
- SW: B-astra-1 — `docs/runs/game-player-same-world-1-run-20261027-121901.json`
- SW: B-sol-1 — `docs/runs/game-player-same-world-1-run-20261027-125626.json`
- SW: B-deepseek-1 — `docs/runs/game-player-same-world-1-run-20261027-133530.json`
- SW: B-opus-2 — `docs/runs/game-player-same-world-1-run-20261027-180948.json`
- SW: B-fable-2 — `docs/runs/game-player-same-world-1-run-20261027-140923.json`
- SW: B-astra-2 — `docs/runs/game-player-same-world-1-run-20261027-190150.json`
- SW: B-sol-2 — `docs/runs/game-player-same-world-1-run-20261027-153620.json`
- SW: B-deepseek-2 — `docs/runs/game-player-same-world-1-run-20261027-161623.json`
- CW: CW-opus — `docs/runs/game-player-combat-1-run-20261027-065038.json` at c5709f5 (origin/claude/game-player-combat-1-pb8k1t)
- CW: CW-fable — `docs/runs/game-player-combat-1-run-20261027-083507.json` at c5709f5 (origin/claude/game-player-combat-1-pb8k1t)
- CW: CW-astra — `docs/runs/game-player-combat-1-run-20261027-094532.json` at c5709f5 (origin/claude/game-player-combat-1-pb8k1t)
- CW: CW-sol — `docs/runs/game-player-combat-1-run-20261027-105102.json` at c5709f5 (origin/claude/game-player-combat-1-pb8k1t)
- VL: V-opus — `docs/runs/game-player-villain-1-run-20261027-061245.json` at b8647ef (origin/claude/game-player-villain-1-0yowzl)
- VL: V-fable — `docs/runs/game-player-villain-1-run-20261027-065959.json` at b8647ef (origin/claude/game-player-villain-1-0yowzl)
- VL: V-astra — `docs/runs/game-player-villain-1-run-20261027-081817.json` at b8647ef (origin/claude/game-player-villain-1-0yowzl)
- VL: V-sol — `docs/runs/game-player-villain-1-run-20261027-084948.json` at b8647ef (origin/claude/game-player-villain-1-0yowzl)

Caps: $20 OpenRouter, $5 OpenAI, $0 the Console.
