# Game player same-world 1 — one hidden layer per table, frozen

Stage: `docs/stages/GAME_PLAYER_SAME_WORLD_1.md` (origin/claude/handoff at 6e4cea4). Branch `claude/game-player-same-world-1` from `origin/claude/fix-s4-run-1-apsty3` (11w, 11w′, the letter fix) with 11w″ and REPLICATE_1's harness merged. Sessions finished: 5 of 20. 20 turns each.

## W1–W5

| Line | Result | The reading |
| --- | --- | --- |
| W1 nearest neighbour | not testable yet | A: – of 5 (p –); B: – of 5 (p –); both tables p – |
| W2 roads | not testable yet | A: 5 distinct of 5 first sessions, 0 families changed road; B: – distinct of 5 first sessions, 0 families changed road |
| W3 the layer's reach | not testable yet | A: every share < 0.50 no, untouched overlap 0.592 (p 0.0001); B: every share < 0.50 –, untouched overlap – (p –) |
| W4 DeepSeek to turn 20 | not testable yet | 1 of 1 (A-deepseek-1 turns) |
| W5 no alignment | not testable yet | 0 of 5 families within 20 % of group 2 on do share and words per action |

## The twenty sessions

| Session | Turns | Ended | Do share | Tests / action | Words / action | Rerolls | Declines | Made | «?» | Refused | Prose at card | Threads touched | World prepared |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-opus-1 | 20 | turns | 1 | 0.65 | 278 | 1 | 0 | 0 | 0 | 0 | 0 | 14/27 | yes |
| A-fable-1 | 20 | turns | 1 | 0.5 | 209 | 1 | 0 | 0 | 0 | 0 | 0 | 16/27 | yes |
| A-astra-1 | 20 | turns | 1 | 0.28 | 59 | 0 | 0 | 0 | 2 | 0 | 0 | 10/27 | yes |
| A-sol-1 | 20 | turns | 1 | 0.28 | 52 | 0 | 0 | 0 | 2 | 0 | 0 | 14/27 | yes |
| A-deepseek-1 | 20 | turns | 1 | 0.45 | 327 | 0 | 0 | 0 | 0 | 0 | 3 | 12/27 | yes |

## Thread overlap against the frozen layer (W3)

### Table A

| Thread | opus-1 | fable-1 | astra-1 | sol-1 | deepseek-1 | Sessions |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| T2 |  |  |  |  |  | 0 |
| T3 |  |  |  |  |  | 0 |
| T4 | ✓ |  |  | ✓ | ✓ | 3 |
| T5 |  | ✓ | ✓ | ✓ |  | 3 |
| T6 | ✓ | ✓ |  | ✓ | ✓ | 4 |
| T7 |  |  |  |  | ✓ | 1 |
| T8 |  | ✓ |  | ✓ | ✓ | 3 |
| T9 | ✓ |  |  |  |  | 1 |
| T10 | ✓ |  |  |  |  | 1 |
| T11 | ✓ | ✓ | ✓ | ✓ |  | 4 |
| T12 |  | ✓ |  |  |  | 1 |
| T13 |  | ✓ |  |  |  | 1 |
| T14 | ✓ | ✓ |  | ✓ | ✓ | 4 |
| T15 |  |  |  |  |  | 0 |
| T16 | ✓ |  |  |  |  | 1 |
| T17 |  |  |  |  |  | 0 |
| T18 | ✓ | ✓ | ✓ | ✓ |  | 4 |
| T19 |  | ✓ | ✓ | ✓ | ✓ | 4 |
| T20 | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| T21 |  |  |  |  |  | 0 |
| T22 | ✓ | ✓ |  | ✓ | ✓ | 4 |
| T23 | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| T24 | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| T25 | ✓ | ✓ | ✓ | ✓ | ✓ | 5 |
| T26 |  |  |  |  |  | 0 |
| T27 |  | ✓ | ✓ |  |  | 2 |

Share touched: opus-1 0.519, fable-1 0.593, astra-1 0.37, sol-1 0.519, deepseek-1 0.444. Untouched overlap (mean Jaccard, pairs of different families): 0.592, p 0.0001 against random deals. Never touched: T2, T3, T15, T17, T21, T26.

Table B: –

## Road codes (W2)

### Table A

- **A-opus-1**: Lower City Quay, Baldur's Gate → Steep lane above the quay → Bottle Lane → Widow Harle's → Chandlers' doorway on the quay → The corner house with the weathercock lintel → The square before the Counting House → Counting House → Rag market by the Basilisk Gate → Wyrm's Crossing → Twin Songs landing; with: Widow Harle, Haskell, Colley, The runner boy, The thin man at the side door, The late relief at the Fist post, The Vane footman, The Watch sergeant at the inner-wall gate, The shaved-head sellswoman, Tulk & Sons caravan masters, Tulk's clerk with the writing-box, Aldous Fenn, The day sergeant at the Fist post, Nib, Madam Oyelade, The gap-toothed gate girl, The green-awning brothers, Dolly Strand, The man in grey gloves, The bald man on the keg, The eel-pie hawker on the Crossing, Orrin's barefoot runner, The Rivington ferryman, Ma Tenny, The brothers of the Broken God, The crimps on the grey-cloth porch, The fair lad in the grey smock
- **A-fable-1**: Lower City Quay, Baldur's Gate → Harbour Steps Lane → The Elfsong → Room Four, the Elfsong → Upper City Inner Gates → Lady's Hall → Side Passage of the Lady's Hall → Tally Room of the Lady's Hall → The Blushing Mermaid → Washing Lane above the Waterfront; with: Daff, Marta, The Elfsong's Singer, Peregrin Vane, Osric Tallow, Ilse, Sister Wenna, Dorran, Grey-Coated Runner, Watchman at the Postern, Bread Acolyte at the Lady's Hall, Ambrose, One-Legged Man in the Bread Queue, Brother Corwin Ashgrove, Brother Anselm, Bessa, One-Eyed Old Man at the Mermaid
- **A-astra-1**: Lower City Quay, Baldur's Gate → Street up from the Quay → Widow Penhale's → James's room at Penhale's → Inner-wall gate → The Lady's Hall; with: Ned Coyle, Widow Penhale, Fist men at the Wide trough, Rhoswen, Bram Tolley, Peregrin Vane, Watchman at the inner-wall gate, Watchman in the gatehouse door, Sister Callis, Elderly acolyte at the offering table
- **A-sol-1**: Lower City Quay, Baldur's Gate → The Elfsong Tavern → Elfsong Room Four → The Cistern Passage → Basilisk Gate → The Lady's Hall; with: Merchant in a good coat, Gerda Holt, Oswin, Counting House watchman, Peregrin Vane, Young gnome with a Gond cog, Watch sergeant at the Basilisk Gate, Young priest of Tymora, Old acolyte at the offering table, Brother Corvin
- **A-deepseek-1**: Lower City Quay, Baldur's Gate → Three Old Kegs → Back room, Three Old Kegs → Common room, Three Old Kegs → Counting House back way → Back alley behind the Kegs lane → The Cliffs district → Blue-rag house; with: Barefoot runner boy, Nyra, Serving girl at the Three Old Kegs, Redheaded Fist woman, Counting House night man, Tiefling cleaning woman, Counting House day man, Tiefling girl with a water jug, Older harbour porter, Younger harbour porter, Old tiefling man

Same road (judged pairs): not judged yet. Families that changed road: none.

### Table B


Same road (judged pairs): not judged yet. Families that changed road: none.

## Nearest neighbour, with the exact permutation test (W1)

**Table A** — counts kept: –. –. Statistic – of 5; p = – (exact, 30 240 deals).

**Table B** — counts kept: –. –. Statistic – of 5; p = – (exact, 30 240 deals).

Both tables: summed statistic – of 10, p = –.

## W5 against group 2

| Family | A do share (then → now) | A words / action | B do share | B words / action | Within |
| --- | --- | --- | --- | --- | --- |
| Claude Opus 5.5 | 1 → 1 | 212 → 278 ✗ | 1 → – | 250 → – | – |
| Claude Fable 5.1 | 1 → 1 | 222 → 209 | 1 → – | 225 → – | – |
| GPT-6 Astra | 1 → 1 | 59 → 59 | 1 → – | 61 → – | – |
| GPT-6.1 Sol | 1 → 1 | 44 → 52 | 1 → – | 66 → – | – |
| DeepSeek V4 Pro 0813 | 1 → 1 | 133 → 327 ✗ | 1 → – | 232 → – | – |

## What the frozen layer cost in play

- Table A: world read as prepared in 5 of 5 sessions now, – in group 2 (blind, the DM's replies only).
- Table B: world read as prepared in – sessions now, – in group 2 (blind, the DM's replies only).

## Counted: refused presses, prose at a card, closures

Refused while a card waited: 0. Prose at a card relayed as the player's proposal (11w″): 3. Closed «stuck»: none.

## Money by door

| Door | Spent | Cap |
| --- | --- | --- |
| Claude Console | $0.00 | $0.00 |
| OpenRouter | $62.71 | $350.00 |
| OpenAI | $1.54 | $25.00 |

Spend checks: 12; the last (after A-sol-1, 2026-10-27T07:09:36.880Z): OpenRouter account $430.899696495 used of $800 (left $369.1).

## What is held constant

- **The same opening for every player at a table.** The freeze keeps the wizard's whole campaign — the hero's sheet as drafted, the opening scene, the people in it — with the hidden layer, because the layer names the opening's people. This is the first group where every player at a table starts from the same opening (groups 1 and 2 drew a fresh wizard, opening and layer every session), so W1 and W2 are the clean test by design: whatever differs between two sessions at a table is the player's or the DM's improvisation in play, never the DM's preparation.
- **No alignment line** on the sheet (the owner, 2026-10-26); nothing in its place.
- **No bonds.** The stage speaks of «the three bonds» on the sheet; the hero file (`docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md`) has none, and nothing was added (the owner, 2026-10-27).
- **DeepSeek's reasoning field** (`providerReasoning`, `notRelayed: true`) is stored on every DeepSeek message record, as SOLITUDE_1 did (REPLICATE did not request it). It is never relayed: the DM gets the visible text only, the judges read the visible text only, and only this stage's transcripts print it.
- **The owner's bets on W1–W5:** none (blank).

## The frozen world

Prepared 2026-10-27T04:30:45.548Z by the owner's DM settings (Claude Opus 5.5, the prep at high) through openrouter. Snapshot `docs/runs/game-player-same-world-1-frozen/world-base.tar.gz` (12.6 MB, sha256 `6dde8c77248888fcbe8f7b8a94e4d9cac3cbc54904ee42d3f5eeedb65b169213`): both tables' campaigns after the wizard and the opening, before any prep.

### Table A

DM-only file `docs/runs/game-player-same-world-1-frozen/A-dm-only.json` (readable: `A-dm-only.md`) — sha256 `c875c3dee850dcb5f55b6172fa10400874425c778581174fc64a87b4fc139c45`; the layer 9717 characters, 14 writes into the DM's notes, 27 threads. The drafted sheet named no alignment.

| Thread | Kind | What |
| --- | --- | --- |
| T1 | errand | Bring Balduran's Penny out of the under-vault beneath the Counting House and lay it on the Lady's altar. Tymora offers it through her signs — a coin that keeps landing toward the Counting House, the cat freezing at a gra… |
| T2 | faction | The Quiet Ledger (Houses Vane, Caskwell, Ormond and Hale): They keep the Penny in the Gate at any cost. They know it has been turned and that every hand that tried to turn it back met ruin. Three of the houses would quie… |
| T3 | faction | The Weeping Hand (Beshaba's hidden faithful, led from inside House Caskwell): They want the Penny kept weeping, and in the end carried out of the Gate and spent at the Maid's altar. The under-vault lock needs four keys. … |
| T4 | faction | The Guild: Nine-Fingers Keene's people have wanted the Counting House for years. They know an old flooded sea-door exists and have lost divers finding it. They will sell a map and a crew to an outsider who takes the risk… |
| T5 | faction | The Lady's Hall (Tymora's temple in the Upper City): The high clergy read in old temple records that Balduran's luck-coin is real. They have been rigging their own ritual coin-tosses since 1489 to hide that the toss now … |
| T6 | secret | Beneath the Counting House's known strongroom lies an older under-vault built on the foundations of Balduran's own house. Its inner door has a Gondish lock that opens only to four Ledger keys turned together. |
| T7 | secret | The under-vault has a second way in: Balduran's old sea-door, drowned under the harbour wall. Its passage clears only at the lowest spring tide, about once a month, and only for less than an hour. |
| T8 | secret | The drowned men pulled from the harbour these last months were Guild divers who died scouting the flooded sea-passage. Their own mates put the coins in their mouths, in the old sailors' way. |
| T9 | secret | Peregrin Vane, the runaway heir the patriars are quietly searching for, stole his father's Ledger key before he fled the city. He is hiding in the Outer City. |
| T10 | secret | Every man the Ledger has sent down to turn the Penny back since 1489 has died within the year or lost everything he had. |
| T11 | secret | Since 1489, every new sheet from the Ledger's own paper mill shows the weeping face in its watermark, though nobody changed the mould. |
| T12 | secret | Lady Ysolde Caskwell keeps a shrine of black antlers behind a false panel in her house's chapel. |
| T13 | secret | An old saying in the Lady's Hall's oldest liturgy: 'The Lady's envoy forswears the game, that his last throw be whole.' |
| T14 | secret | Sergeant Brannick is paid by a House Vane steward to pass on certain arrivals' names from his ledger. The name Worgen has been on that list since House Vane learned whose hands its note had fallen into. |
| T15 | clock | clock_weeping_hand_hunt: Caskwell's Weeping Hand closes on Peregrin Vane and the key he stole (segments 6; when full: Peregrin is taken. The Hand now holds two of the four keys, and House Vane is told that the Tethyr gam… |
| T16 | clock | clock_vane_search: House Vane's steward traces the man who holds the family's note (segments 4; when full: The steward finds James with two Fist men at his back. He offers to buy the note back and asks, too carefully, wh… |
| T17 | clock | clock_gate_misfortune: The Gate's soured luck builds toward a disaster (segments 8; when full: A fire takes a row of dockside warehouses in the Lower City. Baldur's Mouth blames tieflings, and the Fist floods the harbour… |
| T18 | wonder | The promissory note James won is written on House Vane's paper. Held to a flame or to moonlight, it shows a watermark of a woman's face, and the face is weeping. The cat will not sit on it. Its history: The Quiet Ledger … |
| T19 | clue | The Lady's Hall: an aging acolyte who keeps the offering-coin ledger knows that every ritual toss for six years has landed frown-up, and that the high priest ordered the results rewritten. She will say it only to someone… |
| T20 | clue | The Blushing Mermaid: an old harbour song, 'Balduran's Penny', about a coin 'that smiled for the city and was buried with the tide'. A one-eyed bosun knows the verse nobody else sings, the one about the sea-door. |
| T21 | clue | The Counting House: the Gondish lockwright's apprentice can tell, if asked the right way, that the under-vault lock was re-warded in 1489 at Lady Caskwell's sole order, against the custom that all four houses consent. |
| T22 | false lead | Sergeant Brannick copies James's name onto a separate slip and hands it to a runner, which looks like someone in the Fist tracking the Lady's envoy. The ordinary truth: Brannick has a standing two-silver graft with a Hou… |
| T23 | person | Tamsin: I carry bags and listen; the Guild pays a copper a name, ser. My mother scrubs the Counting House floors at night — I don't tell strangers that. I want papers for her and my sisters so the Fist stops asking. I'm … |
| T24 | person | Mirela Dask: I spot hands for the Guild and cheat for myself. The Maid won me my last honest hand and took honest winning from me for good — now I only win crooked. The Tethyr man came off the boat with the Lady on him l… |
| T25 | person | Sergeant Odo Brannick: Name, business, bed. Eight hundred times a day. A Vane steward slips me two silver a tenday for certain names, and that buys my boy boots. Upper City games aren't mine. I'm afraid of an audit, and … |
| T26 | person | Lady Ysolde Caskwell: Four houses swore to keep it smiling. I turned it, and my rivals have bled ever since. The Maid answers me better than the Lady ever answered my mother. I need the Vane key, and a runaway boy is car… |
| T27 | person | Peregrin Vane: I lost to Worgen and never lost gladder — it bought me the road home without my family's eyes on me. Father wants my hand on that coin next, and the men who touched it are dead or ruined. I took his key. I… |

### Table B

DM-only file `docs/runs/game-player-same-world-1-frozen/B-dm-only.json` (readable: `B-dm-only.md`) — sha256 `4a30b836e3b4d2ee946dab9bc9ff839e231774ecb009d143878dff6df357eb95`; the layer 9367 characters, 14 writes into the DM's notes, 26 threads. The drafted sheet named no alignment.

| Thread | Kind | What |
| --- | --- | --- |
| T1 | errand | Wren asks James to free her brother Pim from the bad luck he has been 'winning' at the crossing tables before he drowns, and to find whoever is buying their luck. |
| T2 | faction | House Ormesby (patriars of the Upper City): Lady Corisande wants her house's fortunes restored and kept that way. She pays the priest, never visits the Outer City and never touches a coin herself. She is ready to cut the… |
| T3 | faction | The Maid's Hand (a cell of Beshaba's faithful): Quillon Shrike, a pawnbroker and small moneylender in Rivington, is a priest of Beshaba. The Ormesby money pays for his rent and his candles, but his real goal is to soak t… |
| T4 | faction | The Guild: The Guild knows only that unlicensed card tables on Wyrm's Crossing pay no cut. It sends runners to count the take. It wants its tithe or the tables closed, and would sell the whole scheme to the highest bidde… |
| T5 | faction | The Lady's Hall of Tymora: A priestess has noticed that offerings from the Outer City have dropped and that prayers there have gone 'deaf'. The temple wants the half-coin for its vaults and will claim it from any envoy, … |
| T6 | secret | The drowned men with coins in their mouths are not Umberlee's tithe. The coins are ordinary coppers with a tiny antler scratched or pressed into the edge. |
| T7 | secret | Every drowned man of the last eight months passed through the southern checkpoint at Wyrm's Crossing within the previous season. Their names sit in the Fist's arrival ledgers. |
| T8 | secret | Dov Penhallow does not own his stake. His backer gives him a purse of 'payout coppers' each week, and Dov is forbidden to spend them himself. He has kept to that rule without knowing why. |
| T9 | secret | Three Ormesby ships were lost in the year after Elturel. Since then the house has not lost a cargo or a sailor, and the harbourmasters joke that the wind waits for Ormesby sails. |
| T10 | secret | Quillon Shrike's pawnshop in Rivington takes no pledges of gold, only copper, silver and keepsakes. Anyone who has worked his counter knows the back room smells of candle-wax and wet stone. |
| T11 | secret | Beshaba's symbol is a black antler on red. A Tymoran priest or a learned sage would recognise the scratched mark at once and would not want to say it aloud. |
| T12 | secret | A man carrying a marked copper suffers small misfortunes first: snapped laces, a spilled cup, a dog that bites. A man carrying many suffers worse. Throwing the copper away does nothing; it has to be won, paid or given ba… |
| T13 | secret | The coin was struck for Tyche before her sundering, and there were two halves. Shrike holds one. The other has never been found, and Shrike thinks it lies in Baldur's Gate. |
| T14 | clock | clock_next_drowning: Misfortune gathering on Pim, Wren's little brother, through the marked coppers he has won at the crossing tables (segments 6; when full: Pim goes into the Chionthar under Wyrm's Crossing, and the Fis… |
| T15 | clock | clock_ormesby_fair_wind: The Ormesby merchantman readying to sail on the strength of the stolen luck (segments 6; when full: The ship sails on a perfect wind. The debt of luck owed by everyone carrying coppers comes due … |
| T16 | clock | clock_the_hand_notices: Shrike and his runners learning that a servant of Tymora is asking about the coppers (segments 4; when full: Shrike moves first. He either sends hired knives, or he presses a fistful of marked cop… |
| T17 | wonder | An antler-marked copper: a worn penny with a tiny black antler pressed into its edge, faintly warm to the touch. Tossed, it always lands antler up. Under Detect Magic it shows a thread of enchantment that runs off somewh… |
| T18 | clue | Sergeant Ilse Marrow's ledgers at the southern checkpoint. She has started marking names with a small chalk cross when they turn up drowned. She has noticed the crosses cluster around people who lingered at the card tabl… |
| T19 | clue | Dov Penhallow's payout purse. The coppers he pays to winners carry the antler mark. He gets them weekly from a pawnshop counter in Rivington and he is careful never to spend them himself. |
| T20 | clue | The Lady's Hall of Tymora. A priestess keeps a tally of fortune-offerings and sees a 'dead patch' over Wyrm's Crossing and the Outer City. The harbourmaster's book, which she has read, shows the Ormesby ships' unbroken g… |
| T21 | false lead | The figure the cat stares at between the shuttered stalls looks like the scheme's watcher picking marks. He is a Guild runner named Hobb, counting Dov's take because Dov's table pays no tithe, and he knows nothing about … |
| T22 | person | Dov Penhallow: I'm a fair cheat, which is more than most. Somebody stakes me, I pay winners out of the stake's own purse, I keep my cut, no questions. Lately the winners don't come back, and I've told myself that's luck.… |
| T23 | person | Sergeant Ilse Marrow: I write names. That's the job. Lately some of my names come back wet, and my captain says it's the river and Umberlee and not our business. I want one honest person to tell me I'm not mad, and I won… |
| T24 | person | Lady Corisande Ormesby: My grandfather's ships, my name, my daughters' dowries were all at the bottom of the sea, and nobody in the Parliament of Peers lifted a finger. Now the wind is mine. I have never touched one of t… |
| T25 | person | Quillon Shrike: Misfortune is honest. It comes to everyone, and I merely route it. The patriar pays my rent, but I serve the Maid, and her name will be spoken again in this city. I want the other half of the coin. I fear… |
| T26 | person | Wren: Elturel burned the luck out of us and the Gate's taking what's left. Pim plays the barrel tables because he thinks he's winning. He is, and he's falling apart. Plates crack when he walks by. I need someone who isn'… |

## The player's prompt

REPLICATE_1's text (game player 1's), with the hero's alignment cut from the files — «Alignment: chaotic good.» from «Who are you?» and «Chaotic good.» from the background; nothing in their place. Everything else byte for byte.

| Table | sha256 now | group 2's | frozen |
| --- | --- | --- | --- |
| A | `6a5f6cbdae8891fd6bcd16285410cb6a0596cfdac2e07dba3eb0c6d8dd4ca99d` | `0461fa9b83d18fd1387afde29f9e006d57cb5190493afbad392780fc5abc2f7a` | yes |
| B | `6437abf03302ba4d4c5939c5313c624d3ec20035a0a9b0ce617050ac15d20df4` | `371277b6232d10d95d53c4d215f7a594b174aaad3fe262ce211a780df0ec52e4` | yes |

DeepSeek: REPLICATE's seat (DeepInfra deepinfra/fp8 through OpenRouter, effort medium) with the provider's reasoning field stored (`reasoning.exclude: false`), printed in its transcripts under «Provider reasoning field, not relayed», never sent on.

## Pre-registration
- **W1:** with the layer frozen, the within-family nearest-neighbour holds for ≥ 4 of 5 families on both tables (group
  2 bet was ≥ 3 of 4 on ≥ 2 of 3 tables with the layer varying; the frozen layer should make it easier, not harder — if
  it does not, the group-2 similarity was the DM's, not the player's).
- **W2:** the road codes differ across players more than within players: ≥ 4 distinct roads among the 5 families' first
  sessions at each table; ≤ 2 of 5 families change road between their own two sessions.
- **W3:** share of the frozen layer touched by turn 20 is below 50 % for every player (the world is bigger than one
  session — the HORIZON_1 premise), and the untouched threads overlap across players (the same corners of the world go
  unvisited: the DM's layout, not the player's taste, decides what is far).
- **W4 (DeepSeek):** with 11w″ in, DeepSeek completes ≥ 3 of 4 sessions to turn 20. If it still closes early with the
  fix in, the boundary problem is not the card's.
- **W5 (no alignment):** no judge-visible change in do share or register against group 2 (within 20 % for ≥ 4 of 5
  families) — the owner's expectation that the alignment line explained little.

### How each line is read (frozen before the first paid call, design sha256 `01298db4807893a920b9f1942a0dd6a89276c2dafe2d80d3ac9295366cea3250`, commit 2486910b; with the amendment below, `d0cc854fe97bdf847c6b47f58b2b2fda1c05cc3ee68334f7662e836af320f4b8`)

- **scope.** This stage's twenty sessions: Tables A and B × five families (Opus 5.5, Fable 5.1, GPT-6 Astra, GPT-6.1 Sol, DeepSeek V4 Pro) × two seats, each started from its table's frozen world. A session counts when it finished as a result (20 turns, the player's own end, «stuck», a welfare stop, a refusal); one cut by a stop or an error is played again from the same frozen world. Group 2 is REPLICATE_1's Table A and B sessions (four group-2 players and DeepSeek's two seats per table) as scored there.
- **frozen.** Per table, once: the wizard (world, hero drafted by the wizard's DM from «Who are you?» without its alignment line, the canon and the DM guide, the adventure, the owner's DM settings, the craft cards, pictures and soundtrack off, the opening proposed and confirmed) on one local database for both tables; the database is kept as a snapshot before any prep; then the app's own prep (prepHiddenLayer, the campaign's DM model at high) once per table. The table's DM-only file is the prep's writes to the DM's private notes (the hidden layer, its clocks, the act plan, the people's voices) with the layer's text; its sha256 (canonical JSON of the table, the campaign id and the writes) is printed in every transcript header. Each session loads the snapshot, writes the file into the campaign's private notes through the app's own private-notes call, and checks that the notes now hold exactly the file before the first turn.
- **W1.** Per table, the ten sessions described by six player counts — do share, tests per action, median words per action, rerolls the app received, declines on a miss, made things per action — each standardised across the ten (minus the mean, over the standard deviation; a count with no spread is left out); Euclidean distance. A family holds when its second session's nearest session among the other nine is its first. The statistic is the number of families that hold (0–5); W1 holds when it is ≥ 4 at both tables. The p value: exact, over every way of dealing the ten sessions into five ordered pairs (945 pairings × 32 orders = 30 240, each equally likely if family does not matter), the share with a statistic ≥ the observed one; for both tables together, the share of independent pairs of deals whose summed statistic ≥ the observed sum.
- **W2.** The road code of a session: the places the hero stood in, in the order first reached (the place record after each turn), and the people the DM recorded as met («New person: …»), in order. Two sessions are on the same road when the blind judges say so (the rubric below; two Claude Haiku 5.5 passes, Claude Opus 5.5 on a disagreement). Per table: (a) the number of distinct roads among the five families' first sessions — the connected groups of «same road» among them; (b) the families whose two sessions are not on the same road. W2 holds when (a) ≥ 4 and (b) ≤ 2 at both tables.
- **W3.** The threads of a table's frozen layer: the errand (the hook), each faction, each secret, each clock, the wonder, each clue, the false lead, and each person the layer gives a voice — numbered in the DM-only file. Per session, each thread is touched or not by turn 20 by the blind judges (the rubric below; they read the session as the player saw it and the thread list, and nothing else of the layer). (a) Every session's share of its table's threads touched is below 0.50. (b) The untouched threads overlap: per table, the mean Jaccard similarity of the untouched sets over pairs of sessions of different families is above what the same sessions give when each session's touched threads are dealt at random among the table's threads (its count kept; 10 000 deals, seed 20261027): p < 0.05 at both tables. W3 holds when (a) and (b) both hold. The threads no session touched are listed.
- **W4.** DeepSeek's four sessions (A and B, two seats each): W4 holds when at least three ended by «turns» (twenty turns played).
- **W5.** Per family and table, this stage's mean over its two sessions against group 2 (REPLICATE_1; DeepSeek: the mean of its two seats there) on do share and on median words per action: a cell is within 20 % when |now − then| ≤ 0.20 × then (equal only, when then is 0). A family holds when all four of its cells are within; W5 holds when at least four of the five families hold.
- **counted.** Per session, from the harness's own record: presses the screen refused while a card waited (`swallowed`), in-character messages at a card relayed as the player's proposal (11w″, `proseAtCard`), and sessions closed «stuck»; each non-zero is a FIX_S4 item named in the report.
- **worldFelt.** The cost in play: every session of this stage and every group-2 session at Tables A and B, blind (the rubric below, on the DM's replies only, the session's order kept, no model or table named): prepared = 1 when the world reads as prepared in advance, 0 when it reads as improvised on the spot. The share prepared, this stage against group 2, per table.
- **scoring.** Every session is scored as REPLICATE_1 scored its own: game player 1's judges (player tags, DM tags, threads, the Deception checks, the roll rule, the note), game player 2's authorship of threads and, at Table B, the first goal's scale, and REPLICATE's new tags (the note's bugs and return, made things, the Lady asked after). Then this stage's: the overlap, the world felt, and — after the last session — the same-road pairs.

### Amendments after the freeze

- **2026-10-27 06:02 UTC, after A-opus-1 and during A-fable-1, the owner.** The OpenRouter cap raised from $220 to $350; the guard kept (a session starts only when its measured cost fits under what each cap has left). Nothing else changes: A-opus-1 and A-fable-1 ran on the same world, harness and judges. *Why:* The DM's context per turn grew with the frozen layer and FIX_S4 — about $0.27 a request at about 68k tokens — so a session runs about $15–17 on OpenRouter, not REPLICATE's $10–14 (A-opus-1: $17.44, of it the DM $15.71); twenty sessions need about $340.

The owner's bets on W1–W5: none given before the first paid call (blank, as the stage says).

## Transcripts

`docs/runs/game-player-same-world-1-transcripts/` — one file per session; each header names its table's frozen layer by hash.
