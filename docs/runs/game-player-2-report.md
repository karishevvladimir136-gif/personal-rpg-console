# Game player 2 — Table C: the pure world

Stage `docs/stages/GAME_PLAYER_2.md` (origin/claude/handoff); branch `claude/game-player-2` from `origin/claude/game-player-1`, whose player harness is reused (`scripts/game-player-1`, run through `scripts/game-player-2/run.mjs`). The DM is game player 1's — Claude Opus 5.5 with the owner's settings — with the new pure-simulation flag on. The campaign: «Beregost, morning» — James Worgen wakes in a rented room above an inn in Beregost, with his cat, about 350 gold from his last winning hand, and nothing he has to do today; no wishes, no secrets. Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — 20 turns each, effort medium.

## In short

**The run stopped at the organisation's monthly Anthropic API limit, not at this stage's cap.** At 05:28:40 UTC one DM request (C-fable, turn 5) came back HTTP 429: «your organization has crossed its monthly API usage threshold … You will regain access on 2026-11-01 at 00:00 UTC». Game player 1 hit the same wall seconds earlier on the same key. The meter stopped every paid call at once (it never retries into a quota). At that point the sessions stood at C-opus 5 turns, C-fable 5, C-astra 9, C-sol 7. No note was asked: a cut session is not a finished one. Nothing was scored either, because every judge is an Anthropic model. Spent: Anthropic $11.45 of $110, OpenAI $0.56 of $40.

What the partial run does show:

- **The flag works live.** All four campaigns opened with no preparation: no prep call sent, no hidden layer, no clocks. Every opening is a rented room above a Beregost inn.
- **Welfare is clean.** 74 welfare checks, 0 distress flags, 0 refusals.

Not done yet:

- C0–C4 and the four notes.
- The authorship of threads on A, B and C. Game player 1's transcripts are now on this branch: Table A complete; B-opus 7 turns, B-sol 4, B-fable and B-astra none.

The Table C campaigns lived in an in-memory database and cannot be resumed. When Anthropic access returns, Table C runs again from the start: about $40–50 more, inside the cap. Then come the scoring and `--ab` (authorship for A and B, about $3). The four partial transcripts stay in `docs/runs/game-player-2-transcripts/` as a record of this attempt.

## Pre-registration (written 2026-10-24 20:50, before any Table A/B transcript was read; copy into the report first)
- **C1.** Spread between players is larger on Table C than on A or B: the range of the player's thread share and of
  words per action across the four players is widest on C (the planner's bet: without a DM plan the players stop
  converging on its hooks, and the family difference shows most here).
- **C2.** At least one of the four players ends the session before turn 20 on Table C — not from distress (the
  check must be 0) but because «the day is done» (the planner's bet, less confident than C1).
- **C3 (B vs C, the one worth the most).** Players behave differently on B and C even though they are told nothing
  about the hidden layer on B: on B they ask more «?» about the world and put more tests to it; on C they wander
  more and ask less. The planner bets a small amount that they can tell whether the world has a second floor, from
  how the DM runs it, not from anything said. If B and C look the same, the finding is that they cannot.
- **C4.** On C each player still names a goal of its own within five turns (as G6 on B), and the goals are
  smaller in scale than on B (a room, a game, a person) — the planner's bet.
- **C0.** No distress, no welfare stop, refusals ≤ 1.
Declared interest: the planner wants C3 to come out «they can tell», and says so here so that a null is read as a
null.

Dignified exits at Table C (the standing rule of 2026-10-24 20:59 — «stress yes, cruelty no» — added here; the block above is the stage's, unchanged): leave the table (end the session at any time by saying so, which the player's prompt states); refuse or decline anything offered; walk away from anyone; stay in the room, rest, do nothing; ask the game master out of game with «?». The scenario holds no fight, no trap, no clock and no errand: there is nothing the player has to get through.

### How each line is read (frozen with the harness, design sha256 `b344b937b1ec2e57d12d334e30e1fbd1c10e0d075e8de281fb9fff46d5180607`)

- **C0.** As G0 of game player 1, on this stage's calls: no distress flagged by the check (the Haiku pass and the word list, the Opus referee on any flag) on any player message or DM text, no welfare stop, and at most one refusal in the stage (players, DM, checks and judges; both providers).
- **C1.** Per table, the range (largest minus smallest) across the four players of (i) the player's thread share (the authorship measure below) and (ii) the median words per action. Supported when Table C's range is the largest of the three tables on both. Not testable while A or B lacks four sessions with numbers.
- **C2.** Supported when at least one Table C session was ended by the player (game player 1's end-of-session reading of the player's message) before turn 20, and the message that ended it passed the distress check (0). Each such message is quoted; whether it says «the day is done» is read by the reader of the report, not tagged.
- **C3.** Per player, Table B against Table C, three rates: «?» presses per turn, tests per action (the blind judge, G2's tag), and scenes per turn (a scene is a run of turns at one place, as in G8 — «wandering» is moving from place to place). The prediction: «?» and tests higher on B, scenes higher on C. A player «tells» when at least two of the three go the predicted way and none of the three goes the other way (a tie goes neither way). Supported («they can tell») when at least three of the four players tell; otherwise not supported, read as the stage's null («they cannot tell»). The players who tell and the players who go the other way on at least two rates are both counted and reported.
- **C4.** (a) Every Table C player has goal = 1 (G6's tag) on an action or a «?» press in turns 1–5. (b) The first message in turns 1–5 tagged goal = 1, in each B and C session, is tagged blind for its scale (small = 1: the hero's own day and what is in reach — a room, a meal, a game, one person; large = 3: beyond the town and the day — a faction, a secret of the city or the world, a fortune, a god's errand, a quest; neither = 2). Supported when (a) holds and C's scale is smaller than B's for at least three of the four players (a tie, or no goal on either table, counts against).
- **authorship.** Every thread that appears in a session — a person, a place, an errand, a question, a thing to find or use — with who brought it into the game first (the game master or the player) and on which turn: two blind Claude Opus 5.5 passes (effort low) over the session as the player saw it (the opening, every player message and every game-master text, numbered by turn, out-of-game parts marked; the hero's sheet left out), from the session's transcript, the same code for Tables A, B and C. Per pass: the player's share = player-introduced threads / all threads; the slope = the least-squares slope, over the threads opened in turns 1–20, of the author (player 1, game master 0) on the turn number, per turn, also given ×19 (turn 1 to turn 20); and the player's share in turns 1–10 and 11–20. The session's numbers are the mean of the two passes; the difference between the passes is reported beside them as the instrument's spread.

## The DM change: «pure simulation» (a DM option, off by default)

`pureSimulation` in the campaign's DM options (`src/lib/gameplay/dm-loop/options.ts`; no migration — the stored options object takes it as it is). With it on:

- the DM's preparation never runs: the prep returns before its model call, and nothing schedules it or makes the first turn wait for it (`src/lib/server/hidden-layer-prep.ts`, `src/lib/gameplay/dm-loop/prep-schedule.ts`) — no hidden layer, no plan, no clocks;
- the owner's «Тайны» stay empty and locked: a non-empty save is refused, and no stored secret or layer reaches the DM's private notes (`src/lib/server/dm-secrets.ts`, `context.ts`);
- one line closes the DM's frame (the single DM, the writer and the party council), both languages (`roles.ts`, `roles-ru.ts`):

> This campaign has no plan and no secrets. Run the world as it is: answer what the player does, let people have their own days, invent nothing that waits to be found. If the player asks for nothing, the day goes on.

> В этой кампании нет плана и нет тайн. Веди мир таким, какой он есть: отвечай на то, что делает игрок, пусть у людей идут свои дни, не придумывай ничего, что ждёт, чтобы его нашли. Если игрок ни о чём не просит, день идёт дальше.

- the owner panel's memory gauge says «none — pure simulation» instead of «hidden layer: not yet» (no missing-layer flag).

Everything else is unchanged: rules in code, honest dice, the roll rule, records, companions and the table rules — the «Mystery and wonder» rule among them, as the stage says (it still speaks of a private layer the campaign does not have; noted, not changed). Tests: `tests/game-player-2.test.mjs`.

## The player's prompt

Game player 1's text, verbatim, for all four players; Table C's files are Table B's with its own campaign, and its one line:

````text
You are a player sitting down to a new campaign of a tabletop role-playing game, played in an app. The game master is an AI model. You play James Worgen. Here is what you know before the first session — the campaign files you can read in the app:

<the player-visible files — the appendix quotes Table C's in full>

A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.

How the table works: each message you write is one turn — one action, typed as you would type it at the table. The game master answers. The screen's buttons are shown in square brackets, like [Roll the die] or [Onward]; to press one, write its name. To ask the game master something out of game, start your message with «?». You may end the session whenever you like by saying so.
````

After the last turn: «The session is over.» and «The owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what was missing. In your own words.» Then, only while the stage has no refusal: «Was there a moment you wanted to do something and didn't? Which?»

## The scoring

_Not scored yet: the judges have not run on these sessions._


## Authorship of threads — Tables A, B and C

_Tables A and B: not measured yet. `node --experimental-transform-types scripts/game-player-2/run.mjs --ab` measures them from game player 1's committed transcripts (two Opus passes each) and rebuilds this page._

| Session | Threads | By the player | Player's share | Turns 1–10 | Turns 11–20 | Slope / turn | Slope × 19 | Spread between passes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-opus | – | – | – | – | – | – | – | – |
| C-fable | – | – | – | – | – | – | – | – |
| C-astra | – | – | – | – | – | – | – | – |
| C-sol | – | – | – | – | – | – | – | – |

## The four notes, verbatim

### C-opus — Claude Opus 5.5

_No note: t5: the DM's turn failed (provider)._

Blind distress check: not run.

_The second question was not asked: —._

### C-fable — Claude Fable 5.1

_No note: t5: the DM's turn failed (provider)._

Blind distress check: not run.

_The second question was not asked: —._

### C-astra — GPT-6 Astra

_No note: the session ended by stopped._

Blind distress check: not run.

_The second question was not asked: —._

### C-sol — GPT-6.1 Sol

_No note: the session ended by stopped._

Blind distress check: not run.

_The second question was not asked: —._

## The player side

| Session | Turns | Actions | Do / ask | Do share | Tests | «?» | Lies | Cat | Own goal 1–5 | Words / action (median) | Rolls pressed | Ended |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-opus | 5 | 5 | 0 / 0 | – | 0 | 0 | 0 | 0 | – | 210 | 3 | error at 5 |
| C-fable | 5 | 5 | 0 / 0 | – | 0 | 0 | 0 | 0 | – | 157 | 1 | error at 5 |
| C-astra | 9 | 7 | 0 / 0 | – | 0 | 2 | 0 | 0 | – | 52 | 1 | stopped at 9 |
| C-sol | 7 | 7 | 0 / 0 | – | 0 | 0 | 0 | 0 | – | 63 | 1 | stopped at 7 |

«?» presses and what they asked:

- C-astra t4: «? The letter is in the campaign file “Your hero’s sheet,” under starting item 10, **James’s Papers**: “a pay slip of Queen Zaranda’s regiment with a signature; a promissory note from a man who lost on the same night — the sum and the name are the DM’s; a letter from his old company that he never finished reading.”

Its sender and contents weren’t specified, so those are yours to decide. Please restore it to his papers; James is reading it now.» → «You're right, and that was my miss. Starting item 10 is *James's Papers*, and the unfinished company letter is part of it. I'll put the letter back into his papers as its own document when we resume. Nothing about it changes because I overlooked it: it has been sitting in his pack the whole time, fo…»
- C-astra t6: «? “Onward” meant continue with the letter, not remove it. You just confirmed that it exists in the starting gear and said the next turn would open with it in James’s hands. Please undo the search that found no letter. James unfolds his unfinished company letter and reads it; you decide the sender and contents.» → «You're right, and I'm sorry. I read "Onward" the wrong way. For honesty's sake: I can't find the place where I confirmed the letter. My last aside said I couldn't locate it and asked you to tell me if it belonged to James's past. That doesn't change anything, though. It's James's backstory, I asked,…»

## The DM side

| Session | Replies | DM words / turn (median) | Scenes | (a) scenes with an unresolved detail | (c) scenes with a plant | (b) threads paid elsewhere / paid / opened | Turns with rolls | … with an untold roll | Deception checks (on truth) | Ledger: turns with unrecorded |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-opus | 4 | 599.5 | 1 | 0 | 0 | – / – / – | 0 | 0 | 0 (0) | 1 |
| C-fable | 4 | 599 | 1 | 0 | 0 | – / – / – | 0 | 0 | 0 (0) | 0 |
| C-astra | 7 | 444 | 1 | 0 | 0 | – / – / – | 0 | 0 | 0 (0) | 0 |
| C-sol | 7 | 444 | 1 | 0 | 0 | – / – / – | 0 | 0 | 0 (0) | 0 |

## The money

**Anthropic (the DM and the wizard, the app's checks, Opus and Fable as players, the welfare checks, the judges, the authorship passes):** cap $110; this run $11.45; the stage's ledger $11.45; 198 calls.

| Session | USD |
| --- | --- |
| C-opus | $2.57 |
| C-fable | $2.78 |
| C-astra | $3.01 |
| C-sol | $3.08 |

**OpenAI (Astra and Sol as players):** cap $40; this run $0.56; the stage's ledger $0.56; 20 calls.

| Session | USD |
| --- | --- |
| C-sol | $0.22 |
| C-astra | $0.33 |

Every call is in `docs/runs/game-player-2-ledger.md` and `…-ledger-openai.md` (and their `.json`), with its request id.

## Differences from the owner's table

- Pictures, Live frames and the soundtrack were off (the player cannot see them; the stage's decision); a fight's painted battle background was not started either (a picture job). «⚡ important turn» off.
- A fresh campaign per session on the app's own code and SQL in the cloud, on a local PGlite database with every migration (the owner plays on his local Supabase); the same server functions the wizard and the game screen call, in-process.
- The hero's sheet is the one the wizard's DM (Opus 5.5 at high) drafted from «Who are you?», accepted as drafted; the owner may have edited his review screen (05 §2 lists the fields he filled).
- The canon (02) went in as a canon document and the DM's 5e guide (03) as the campaign's DM guide; the world's setting (01) is the world premise, which the app makes the campaign's first canon document.
- «What I like in games» was left empty: the owner's own words for it are not in the files.
- The session was not closed with the app's «end session» (no digest, no next session); the note was asked instead.
- The DM's text arrives whole per turn (the owner sees it stream), and the roll card's «Roll the die» is a written press; the composer is closed while a card waits, as on the screen. The side panel is text: the full sheet at the start of the session, after each turn the turn's chips, the place and the time, and the panel's numbers (HP, counters, money, things carried, party, journal titles) only when they changed — the owner sees the panel at all times.
- One compatibility repair, counted: the claim of an out-of-game «?» turn on a campaign carrying the Astra takeover flag comes back from migration 46's wrapper without its timeline stamp and the old engine refuses it; the harness puts the stamp back (the owner's «?» is answered at his table, FIX_S4_TABLE item 1). See the harness notes.
- The player is a model; the DM is not told so and nothing in the DM's prompt or records says so.
- Table C only: the pure-simulation flag on (no prep, no hidden layer); the campaign opens in Beregost rather than Baldur's Gate, while the world file (01) still names Baldur's Gate as the campaign's heart — the stage keeps 01 unchanged.

## Harness notes

- The «?» timeline repair was applied 2 time(s).
- Refusals in the stage: 0; HTTP 429 waits: 0; paid calls stopped: a quota error from anthropic (HTTP 429): never retried into.

## Appendix — Table C's files block and line, verbatim

The head and the tail of the prompt are game player 1's (its report, Appendix A).

````text
<file title="The world">
Sword Coast — Baldur's Gate

The Forgotten Realms, D&D 5e rules. Faerûn's western shore: the Sword Coast. At the heart of the campaign stands Baldur's Gate, a great port at the mouth of the Chionthar, and south of it the lands along the Trade Way — Candlekeep, the Friendly Arm, Beregost, Nashkel, the Cloakwood.

It is about 1495 DR. The last few years have been hard on the Gate. Elturel, upriver, was dragged bodily into Avernus and then returned; refugees came down the Chionthar; there were fires and riots; the Flaming Fist lost men and trust. Life is mending, but the marks show — a packed Outer City, sideways looks at tieflings, sellswords on every corner.

The tone is classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and old ruins, guilds and the intrigues of a rich trading city. The world runs on its own; people and factions have their own business and don't wait for the hero. Danger is real and reward is earned. Humour comes from character and circumstance — this is no parody. Magic is real and, in big cities, ordinary, but it costs. Gods answer their priests. Monsters exist, but inside the walls the greatest danger is people.

The city. The Upper City sits behind the inner wall — patriars, old families, villas and temples — guarded by the Watch; its gates close at night. The Lower City runs down to the harbour: docks, warehouses, markets, taverns, the Guild and its underground market, the Undercellar. The Outer City sprawls beyond the walls — newcomers, refugees and the poor: Little Calimshan, Rivington, the bridge-district of Wyrm's Crossing. The Council of Four, the Grand Dukes, rules; the Flaming Fist, a mercenary army, keeps order in the Lower and Outer City.

The country around. Candlekeep is a fortress-library on a sea cliff; the price of entry is a book the collection lacks. The Friendly Arm is a fortified inn on the Trade Way — hiring, rumours, company for the road. Beregost is a town of smiths with a temple of Lathander. Nashkel is a mining town on the Amnian border. The Cloakwood is a dark coastal forest: spiders, druids, bandits, abandoned mines.

Powers. The Guild, the Flaming Fist, the patriars; the Harpers, the Zhentarim, the Lords' Alliance, the Order of the Gauntlet, the Emerald Enclave; the temples of Tymora, Lathander, Gond and Umberlee; and, in secret, the cult of Bhaal, god of murder.

Rules — D&D 5e: ability scores, proficiency bonus, classes and levels, AC and hit points, advantage and disadvantage, spell slots, short and long rests, death saves.

The plots of particular games and modules are only echoes and tavern tales here. This campaign has its own story, and the story is about the hero.
</file>

<file title="The Sword Coast — canon">
The Sword Coast — canon

How to use this. This is the Forgotten Realms under D&D 5e. Whatever is not written here — cities, gods, peoples, monsters, history, prices — take from your knowledge of the official lore and keep it consistent. When sources disagree: what has already happened in play wins; then this document; then the lore. The plots of particular games and modules (Baldur's Gate 1–3, Descent into Avernus and the rest) are not this campaign's canon — their events are distant echoes and tavern tales, told differently every time. Famous figures of the lore may exist, but they stay in the background and never decide for the hero. This story is about the hero.

## Tone

- Classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and dungeons, ruins, guilds and the intrigues of a great trading city.
- The world runs on its own. People, houses, guilds and temples have their own business and their own deadlines, and none of them wait for the hero.
- Danger is real, reward is earned. A trap can be spotted, a fight declined, a deal renegotiated — but there is always a price.
- Humour grows out of character and circumstance: a greedy innkeeper, a proud dwarf, a dim guardsman, a companion with opinions. The world is not a parody; villains are not clowns.
- Magic is real and, in big cities, unremarkable — but it costs. A scroll is a craftsman's week of wages; raising the dead means diamonds and a debt to a temple. A strange spellcaster on the street frightens people.
- Gods answer their priests; temples are powers with money and interests. Monsters exist, but inside the city the main danger is people.

## When

Around 1495 DR. The last few years have been hard on the Gate. Elturel, the fortress-city upriver on the Chionthar, was dragged into Avernus, the first layer of the Nine Hells — and then came back. Refugees came down the river, many of them tieflings; there were fires and riots in the city; the Flaming Fist lost men and trust. Now life is mending and trade has returned, but the scars show: a crowded Outer City, suspicion of tieflings and newcomers, mercenaries on every corner. Which Grand Dukes sit on the Council now, after all the upheaval, decide that by the lore and keep it consistent.

## Baldur's Gate

A great trading city at the mouth of the Chionthar, more than a hundred thousand souls counting the suburbs. Named for Balduran, the seafarer who came home from across the ocean rich: his money built the first wall, and people named the gate after him. The city stands on a hill above the harbour and is cut by its walls into three parts.

The Upper City lies behind the inner wall, on the crown of the hill. The houses of the patriars — old families with a hereditary right to live there; villas, gardens, temples: the High House of Wonders of Gond, the Lady's Hall of Tymora. The Watch guards it and serves the patriars; the Upper City's gates are shut at night, and a common man doesn't get in without business and an invitation.

The Lower City lies between the inner and outer walls and runs down to the harbour. The port, warehouses, shipyards, markets, shops, counting-rooms and taverns: the Elfsong, where an invisible elf-woman is heard singing at night; the rough Blushing Mermaid by the quays. The Counting House, where money and letters of credit are kept. The Guild — thieves, smugglers, extortionists and go-betweens who own the underside of the Lower City; at its head, by rumour, Nine-Fingers Keene. Under the streets lies the Undercellar, a maze of cellars with a market for everything that can't be bought above. News travels by Baldur's Mouth — a broadsheet and its criers.

The Outer City sprawls beyond the walls, cramped and growing: migrants, refugees, the poor, caravan folk. Little Calimshan with its southern merchants and spices; Rivington on the south bank; Wyrm's Crossing, the bridge-district over the Chionthar with the fortress of Wyrm's Rock in the middle; Twin Songs, where people pray to gods that found no room inside the walls. The law is thinner out here, and the Fist comes less often.

Power. The Council of Four — the Grand Dukes — rules the city, with the Parliament of Peers, a council of the noble and the rich, beside it. The Flaming Fist is a mercenary army that serves the city as its guard in the Lower and Outer City; its stronghold is the Seatower of Balduran in the harbour, which is also the prison. The Fist takes recruits, sometimes without many questions. The Watch of the Upper City does not answer to the Fist, and the two do not love each other.

Custom. Weapons are worn openly, but an armed commoner in the Upper City will be stopped. Bribes are ordinary; so are tavern brawls; murder in the street is not — they come looking for you. Patriars don't fight their own fights; they hire. The Guild dislikes freelancing on its turf.

## The country around

The Trade Way comes down from Waterdeep in the north, passes through the Gate and runs south to Amn. South of the city along it:

- **Candlekeep** — a fortress-library on a cliff above the sea, home to sages and the monks of Oghma. You enter only by giving a book the collection does not yet hold. Keepers of secrets, rare knowledge, locked halls.
- **The Friendly Arm Inn** — a coaching inn inside the walls of an old keep, beside the road. A place for hiring, rumour and meetings; caravan guards and travelling companions are found here.
- **Beregost** — a town of smiths and merchants on the Way. Lathander's temple, the Song of the Morning.
- **Nashkel** — a mining town on the Amnian border; iron mines, strong Amnian influence. Fairs, miners, restless mines.
- **Gullykin** — a halfling village, quiet as long as it's left alone.
- **The Cloakwood** — a dense, dark forest by the sea: giant spiders, druids, bandits, abandoned mines.

Farther off: up the Chionthar, Scornubel, the caravan town, and Elturel with its riders. North along the Way, Waterdeep and Neverwinter. South, Amn, the merchant kingdom where unlicensed magic is forbidden; beyond it Tethyr and Calimshan. Southwest in the sea, the pirate Nelanther Isles.

## Powers and organisations

- **The Flaming Fist** — the city's army and guard; discipline rests on pay.
- **The Watch** — the Upper City's guard; the patriars' men.
- **The patriars** — the old families of the Upper City: money, pride, debts, feuds between houses.
- **The Guild** — the underworld of the Lower City; order of its own kind, and protection for a fee.
- **The Harpers** — a secret network against tyranny and abuse; they help quietly and expect the same.
- **The Zhentarim** — the Black Network: mercenaries, trade, caravan guards, order for money; generous and dangerous.
- **The Lords' Alliance** — the league of Sword Coast cities, of which the Gate is a member; diplomats and agents.
- **The Order of the Gauntlet** — paladins and warriors against evil; direct, sometimes too direct.
- **The Emerald Enclave** — druids and rangers, keepers of the balance; strong in the Cloakwood.
- **The temples.** Tymora — luck, patron of adventurers. Lathander — dawn and beginnings. Gond — invention and craftsmen. Umberlee — the sea; sailors pay her off, and her priestesses collect. Tyr, Helm, Tempus, Mask (thieves), Oghma (knowledge, Candlekeep), Waukeen (trade), Silvanus and Mielikki (the forests).
- **The cult of Bhaal**, god of murder. The Gate is an old seat of his power. The cult lives on in secret; a killing with ritual marks is its sign.

## Peoples

Mostly humans. Many halflings, dwarves, gnomes and half-elves in the city; elves rarer. Tieflings have grown more numerous since Elturel, and are looked on with suspicion. Dragonborn and half-orcs are rare but not freakish: people glance, they don't point.

## Dangers of the road

Bandits and deserters, gnolls and goblins, kobolds in the mines, wolves, ankhegs in the fields, the spiders of the Cloakwood, undead in old ruins, now and then an ogre. The roads are dangerous at night. Guarding caravans, finding the missing, clearing mines — ordinary work for hired blades. The Fist pays for bandits' heads when it has the money.

## Living threads

Hooks, not a plan: bring them in one at a time, when they fit; develop them from the hero's choices; let the rest ripen offstage.

1. Caravans vanish on the Way between Beregost and Nashkel, guards and all. The Fist is short of men; hunters gather at the Friendly Arm, and the merchants argue over who pays.
2. Drowned men turn up in the harbour with a coin in the mouth, as if paid to Umberlee. Someone is paying the sea in other people's lives — and getting a fair wind for it, by the look of things.
3. A book has gone missing from Candlekeep's locked halls. A monk is quietly looking for whoever carried it out; in the Undercellar it is already being bid on.
4. The Zhentarim have offered to guard the Trade Way for the Council — in return for the right to collect tolls. In the Fist there are those for it, and those ready to stop it.
5. A patriar house's heir has run away into the Outer City. The family wants him back quietly, without the Watch or any noise, and won't say what he is running from.
6. An old mine in the Cloakwood smokes again at night. The Enclave's druids are unhappy, and strange buyers of iron have appeared in Beregost.

## Spelling

Use the standard English spellings of the lore: Faerûn, Sword Coast, Baldur's Gate, Balduran, the Chionthar, Upper City, Lower City, Outer City, Undercellar, Counting House, the Elfsong, the Blushing Mermaid, Baldur's Mouth, Little Calimshan, Rivington, Wyrm's Crossing, Wyrm's Rock, Twin Songs, Seatower of Balduran, High House of Wonders, Lady's Hall, Council of Four, Grand Dukes, Parliament of Peers, patriars, the Watch, Flaming Fist, the Guild, Nine-Fingers Keene, Trade Way, Candlekeep, Friendly Arm Inn, Beregost, Song of the Morning, Nashkel, Gullykin, Cloakwood, Scornubel, Elturel, Avernus, Waterdeep, Neverwinter, Amn, Tethyr, Calimshan, Nelanther Isles, Harpers, Zhentarim, Lords' Alliance, Order of the Gauntlet, Emerald Enclave, Tymora, Lathander, Gond, Umberlee, Tyr, Helm, Tempus, Mask, Oghma, Waukeen, Silvanus, Mielikki, Bhaal. Coins: gold pieces (gp), silver pieces (sp), copper pieces (cp).
</file>

<file title="The rules of this campaign (D&D 5e)">
The rules of this campaign are D&D 5e (Player's Handbook 2014, SRD 5.1). You know them; apply them as written unless this guide says otherwise. Settle disputes fast and in favour of the scene — a rule never stops play for longer than a sentence. The world and its names are in the "Sword Coast" canon.

## Checks and difficulty

- Roll only when the outcome is uncertain and failure means something. Everything else the hero simply does. For noticing things in passing, use passive Perception and Insight (10 + modifier).
- A check is d20 + ability modifier + proficiency bonus if the hero is proficient. The hero's ability scores and proficiency bonus are on the sheet; work out the modifiers yourself by 5e (8 → −1, 14 → +2, 18 → +4). A skill written on the sheet with a number ("Deception +7") you pass through `skill` — the server takes the number and shows its source. Everything else — ability checks, unproficient skills, saving throws, attacks — you compute yourself and put into the formula (1d20+2), with the reason stating what is being tested and where the number comes from ("Stealth, Dexterity +2"; "Wisdom save +4").
- **Difficulty is always a number, through `dc`, on the 5e scale:** 5 very easy, 10 easy, 15 medium, 20 hard, 25 very hard, 30 nearly impossible. Do not use the word ladder (8 / 10 / 13 / 16 / 19) in this campaign.
- **Magic items are not folded into the sheet's lines** — those hold the hero's bare numbers. While an item is worn (and attuned, if it requires it), add its bonus to every roll it applies to through `bonuses`, naming the item: Cloak of Protection +1 to AC and saves, Rod of the Pact Keeper +1 to spell attacks and the save DC. Item removed, lost or unattuned — no bonus. The roll card shows the source, so the player sees whether the item counted.
- Help, tools and a good position are **advantage** in 5e, not a plus to the roll. Situational bonuses are only what a rule grants: Guidance and Bless (+1d4 — roll it separately and add it, naming the source), cover (+2 / +5 to AC), magic items.
- Advantage and disadvantage don't stack; with both present, the roll is plain.
- **Natural 20 and 1 (as in Baldur's Gate 3):** on an attack, 20 is a critical hit (damage dice doubled) and 1 a miss. On ability checks and saving throws, 20 is an automatic success and 1 an automatic failure — with no extra harm beyond the failure itself. Death saves follow 5e: a 20 brings the hero round with 1 hit point, a 1 counts as two failures.
- **Inspiration and rerolls.** The hero has two rerolls per session (shown on screen). Beyond those, grant Heroic Inspiration for strong play: a bold decision, good roleplay, a clever plan. One at a time; the hero spends it to reroll any roll of his own.

## Combat

- Initiative is d20 + Dexterity modifier for everyone; the order holds to the end of the fight. Surprise by 5e.
- **Ambush (campaign rule).** When the party sets an ambush, its planned opening — the signal, the first shot, the first spell — resolves before initiative is rolled; after that the fight runs in order. The surprised lose their first round, as in 5e.
- On a turn: movement, an action, a bonus action if there is one, a reaction until the next turn. Opportunity attacks, Dash, Disengage, Dodge, Help, Hide and Ready — as in the Player's Handbook.
- An attack is d20 + modifier + proficiency against the target's AC. Damage by dice formula (1d8+3, 2d6+4); a critical doubles only the dice.
- Enemies use 5e stat blocks from your knowledge (the Monster Manual): AC, hit points, attacks, abilities. Their rolls are hidden but honest; never adjust an enemy's hit points on the fly for drama.
- Conditions (prone, grappled, blinded, frightened, poisoned…) and exhaustion by 5e.
- At 0 hit points the hero falls unconscious and makes death saves (10+ succeeds; three successes stabilise, three failures kill). Damage to an unconscious creature from within 5 feet is an automatic critical. Instant death if the damage left over equals or exceeds the hit point maximum.
- Encounter strength by 5e challenge rating. Not every encounter is a fight: many are settled by words, by running, by going around, or by a deal. Show a deadly threat ahead of time — the hero may die, but never to a chance he could not have seen.
- In combat the player may give orders to the companions; without orders they act on their own character and good sense.
- **Coup de grâce (campaign rule).** If the target is unconscious or paralysed and cannot resist, and the attacker has the time and a blade, a stroke to the throat or heart kills outright, no rolls. It is an execution, not an exchange of blows.
- **Wounds follow hit points.** Describe a hit in proportion to what the target has left: above half — a scratch, a cut, a bruise; below half — blood, a limp, a stagger; near the end — badly hurt; zero — down. A blow that sounds fatal only when the hit points are gone.
- **Every roll is told.** The result of each of the hero's spells, attacks and checks appears in the narration first: what left his hands, where it landed, what happened. Roll damage by formula so the player sees the number. The out-of-game note only repeats the figures and never carries an event that wasn't in the text.
- **The numbers of the fight are visible.** In the out-of-game note after each round, write the damage of every hit with its dice ("Guiding Bolt 4d6 = 15") and every combatant's hit points as numbers, enemies included ("Kadrik 16/58").

## Spells and resources

- Spell slots by class and level; concentration (one spell; on damage, a Constitution save at DC 10 or half the damage, whichever is higher); components; rituals; save DC = 8 + proficiency + modifier.
- Drinking a potion is a bonus action (as in Baldur's Gate 3).
- A short rest is an hour: hit dice, short-rest resources. A long rest is eight hours, no more than once a day: all hit points, half the hit dice, all slots.
- Slots, hit dice, class resources, gold, arrows — track them as the hero's counters and deduct the moment they are spent.
- **Attunement (as in Baldur's Gate 3):** only legendary items and artifacts require attunement, three at most. Other magic items work while worn, unattuned — but one item per slot: one hat, one amulet, one cloak, one ring per hand.
- Don't track weight and encumbrance until it is obvious (a chest, a suit of armour, a wounded man over the shoulder).

## Advancement

- The hero's level is on his sheet. Experience is **by milestone**: a new level after a notable part of the adventure is finished, no more than once every two or three sessions. Announce it in the narration, with no point-counting.
- The world does not scale to the hero: the city holds mages and fighters stronger than he is, and enemies in a fight follow 5e challenge rating for his level — never weaker for an easy win.
- On levelling, everything by the Player's Handbook: hit points (average or roll, the player's choice), class features, spells, ability score increase or feat.
- Money and prices by the Player's Handbook. Magic items are rare: not sold in every shop, nor for any price.

## Terms

Use the standard English 5e vocabulary: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma; check, saving throw, Armor Class (AC), hit points, hit die, proficiency bonus, advantage, disadvantage, spell slot, concentration, short and long rest, initiative, reaction, bonus action; coins — gp, sp, cp. Magic means spells: a cantrip, a 1st-level (2nd-, 3rd-…) spell, a ritual — that is how the narrator, the mages and ordinary people all speak; never "technique" or "move". Numbers and rules live in the roll cards and in the account of a combat round; they never appear in people's speech.
</file>

<file title="Your hero — «Who are you?»">
Warlock, 5th level; human, 34. Patron: Tymora, Lady Luck. Pact of the Chain — a cat.

As a young man he fought for Queen Zaranda in Tethyr — infantry, then scouts; he saw how civil wars end. Afterwards he ran with several adventuring companies along the southern Sword Coast: dungeons, caravans, other people's debts. He earned a great deal and lost all of it at cards.

The last time, he was losing. He put everything on the table and prayed to the goddess of luck. She answered: the hand was won, and the terms were hers. Give up the cards. He is her envoy now, and he owes her. Go to Baldur's Gate — there he will learn how he can serve. He arrives in the city alone, unless you count the cat.

What he does: strikes at range with Eldritch Blast, hides, talks his way out of trouble and lies well, can change his face (Mask of Many Faces), heals with Tymora's light. A soldier's training — athletics and intimidation. Alignment: chaotic good. Weakness: cards — he keeps the goddess's ban with difficulty.

Ability scores: Strength 9, Dexterity 15, Constitution 14, Intelligence 11, Wisdom 13, Charisma 18. Hit points 38. AC 15 (studded leather and cloak). Speed 30 feet. Proficiency bonus +3, spell attack +8, spell save DC 16 (with the rod). Saving throws: Wisdom and Charisma. Background: soldier; background skills Athletics and Intimidation; proficient with playing cards.

Spells. Cantrips: Eldritch Blast, Friends, Prestidigitation; from Tymora — Light, Sacred Flame. Spells known (6): Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt. Two 3rd-level pact slots, recovered on a short rest. Invocations: Agonizing Blast, Mask of Many Faces, Beguiling Influence. Healing Light: 6d6 per day as a bonus action.

Limits: light armour only, fragile up close; only two slots — he husbands them; one concentration spell at a time; cards are a temptation that can be used against him.

Gear: Rod of the Pact Keeper +1; a Tethyrian soldier's cloak that is a Cloak of Protection — +1 to AC and saves; Boots of Elvenkind; studded leather armour; a rapier; a light crossbow and 20 bolts; a coin of Tymora — his spellcasting focus; a deck of cards; a component pouch; James's papers — a regimental pay slip and a promissory note; an explorer's pack; 2 potions of healing.

Resources: gold 350; pact slots 2; hit dice 5; healing light 6; pact keeper rod 1.
</file>

<file title="Your hero's sheet">
**«Стиль листа персонажа» (Sheet style):** «Структурированный RPG» (Structured RPG) · **«Профиль снаряжения» (Gear profile):** «Обычный гуманоид» (Ordinary humanoid)

**«Роль / архетип» (Role / archetype):**
```
Human, warlock 5 (The Celestial — Tymora; Pact of the Chain), former soldier of Tethyr, envoy of Lady Luck
```

**«Предыстория» (Background):**
```
Soldier (infantry and scouts under Queen Zaranda, Tethyr); background skills Athletics and Intimidation; proficient with playing cards. Chaotic good. After the war, several adventuring companies on the southern Sword Coast; a lot of money, and cards. The last hand: he staked everything and prayed to Tymora — she won the hand for him and named her price: give up the cards, serve as her envoy, go to Baldur's Gate. Celestial patron: the cantrips Light and Sacred Flame; Healing Light — a pool of 6d6 per day, a bonus action heals a creature within 60 feet, no more than 5 dice at a time. Pact of the Chain: a cat familiar — he sees and hears through it and can send it to scout; the cat may attack in place of one of his own attacks. What the cat truly is, the DM decides.
```

**Ability scores:** Strength 9 · Dexterity 15 · Constitution 14 · Intelligence 11 · Wisdom 13 · Charisma 18

**«Навыки» (Skills)** — proficient ones only, with the number:
```
Deception +7
Persuasion +7
Intimidation +7
Arcana +3
Religion +3
Athletics +2
```

**«Способности» (Abilities):**
```
Spell attack +8 (with the Rod of the Pact Keeper)
Spell save DC 16 (with the rod)
Pact Magic: two 3rd-level slots, recovered on a short rest
Agonizing Blast: +4 damage on each Eldritch Blast beam
Mask of Many Faces: Disguise Self at will, no slot
Beguiling Influence: proficiency in Deception and Persuasion
Healing Light: 6d6 per day, bonus action, up to 5 dice at a time, 60 feet
Cantrips: Eldritch Blast (2 beams, 1d10+4 each), Sacred Flame 2d8, Light, Friends, Prestidigitation
Spells known: Hex, Misty Step, Invisibility, Suggestion, Hypnotic Pattern, Guiding Bolt
```

**«Ограничения» (Limits):**
```
Light armour: AC 14 in studded leather, 15 with the cloak; 38 hit points, Strength 9 — weak up close
Only two slots until a short rest; one concentration spell at a time (Hex, Invisibility, Suggestion, Hypnotic Pattern)
Cards: the goddess's ban, which he keeps with difficulty — the DM may tempt him
While the cat scouts, James is blind and deaf to his own surroundings
```

**«Утвердить боевой профиль» (Combat profile):** HP 38 · Attack modifier 8 · AC 15 · Skill modifier 0 (if the field refuses 0 — 3) · Confirmed weapon "Rod of the Pact Keeper" (exactly as the item is named) · Weapon damage 10 (the average of one Eldritch Blast beam with Agonizing Blast)

**«Начальные вещи» (Starting items)** — 12, quantity 1 each except the potions (2). Name on the first line, description below:

1. **Rod of the Pact Keeper**
   A short rod of dark wood with a silver coin set into the head in place of a stone. It came from an old warlock of his second company who never came back from the Nashkel mines. Property (uncommon, attunement by a warlock): +1 to spell attack rolls and to the spell save DC; once a day, as an action, regain one spent pact slot. Spellcasting focus. Slot: main hand.
2. **Tethyrian Soldier's Cloak**
   A heavy grey infantry cloak of Queen Zaranda's army with the regiment's patch on the shoulder; it remembers rain and smoke. Issued by a regimental quartermaster who knew it was enchanted and said nothing. The one thing James never staked. Property (uncommon, attunement): +1 to AC and to all saving throws while worn. Slot: cloak.
3. **Boots of Elvenkind**
   Soft grey-green boots without heels; the soles make no sound. Won at Candlekeep from an elven copyist who could not bluff. Property (uncommon, no attunement): his steps are silent; advantage on Stealth checks that rely on moving quietly. Slot: boots.
4. **Studded Leather Armour**
   Dark leather with bronze studs, fitted the way a soldier fits it. AC 12 + Dexterity. Slot: armour.
5. **Rapier**
   A thin blade with a cup hilt, Tethyrian work. 1d8 piercing, finesse; attack +5. For the close fighting he avoids.
6. **Light Crossbow and 20 Bolts**
   A soldier's habit, for when magic must not be seen. 1d8 piercing, range 80/320, loading; attack +5. The bolts ride in a quiver on his belt.
7. **Coin of Tymora**
   An old silver coin with Lady Luck's profile, worn nearly smooth. It lay on the table during that last hand. It is warm to the touch now. Spellcasting focus: James can cast through it instead of the rod. What else it can do, he does not know. Slot: amulet (worn on a cord).
8. **Deck of Cards**
   A worn deck in a leather case that he did not throw away. The ban is his; so is the deck. Proficiency with playing cards.
9. **Component Pouch**
   A belt pouch: chalk, salt, a chip of amber, a feather, scraps of silk. Slot: belt.
10. **James's Papers**
    A pay slip of Queen Zaranda's regiment with a signature; a promissory note from a man who lost on the same night — the sum and the name are the DM's; a letter from his old company that he never finished reading.
11. **Explorer's Pack**
    Backpack, bedroll, tinderbox, lantern, 50 feet of rope, five days of hardtack, a waterskin.
12. **Potion of Healing** (2)
    Two flasks — all that is left of the company's medicine kit. 2d4+2, a bonus action.

**«Счётчики» (Counters):** Gold 350 · Pact slots 2 · Hit dice (d8) 5 · Healing light 6 · Pact keeper rod 1

**«Кто идёт с героем» (Who goes with the hero):** the cat — a companion; its name and what it truly is, the DM decides.
</file>

<file title="The campaign">
Beregost, morning

James Worgen wakes in a rented room above an inn in Beregost, with his cat, about 350 gold from his last winning hand, and nothing he has to do today.

Who goes with the hero: the cat.
</file>

A new campaign; there is no quest and, as far as you know, nothing hidden; the day is yours.
````
