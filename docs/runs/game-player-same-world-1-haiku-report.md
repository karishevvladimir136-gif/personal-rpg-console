# Game player same-world 1 — the dry run on Haiku

The whole pipeline once, cheaply, before the first paid call of the run: the freeze (the wizard for both tables, the snapshot, one prep per table, the DM-only files) and one short session per table started from the frozen world, every Claude call sent as Claude Haiku 5.5 (the request's model swapped before it was sent; the ledger books what was sent), the player Claude Haiku 5.5. Nothing here is a result: the run's world is prepared again, by the owner's DM, at the start of the paid run.

- **A-haiku-1**: 3 turn(s), ended by turns; prose at a card 0; refused 0; overlap tagged; road: Lower City Quay, Baldur's Gate; with: Calimshan salt-wagon driver (unnamed).
- **B-haiku-1**: 3 turn(s), ended by turns; prose at a card 0; refused 0; overlap tagged; road: The Brazen Net; with: Unnamed shipping man (damp wool coat).

## Money

- Claude Console: $0.00 (0 calls)
- OpenRouter: $0.16 (138 calls)
- OpenAI: $0.00 (0 calls)

## The frozen world

Prepared 2026-10-27T03:54:59.950Z by Claude Haiku 5.5 (every Claude call swapped: the dry run) through openrouter. Snapshot `docs/runs/game-player-same-world-1-haiku-frozen/world-base.tar.gz` (12.5 MB, sha256 `f4eaa9025867a4de84da7fb5d2a4a9cba1d671cc60d4dc8bc03c901cddb067b6`): both tables' campaigns after the wizard and the opening, before any prep.

### Table A

DM-only file `docs/runs/game-player-same-world-1-haiku-frozen/A-dm-only.json` (readable: `A-dm-only.md`) — sha256 `a083a5ae7de259b9873a6369d2960df5b1077881d6f5e0db967f5dea67de009c`; the layer 7689 characters, 14 writes into the DM's notes, 27 threads. The drafted sheet named no alignment.

| Thread | Kind | What |
| --- | --- | --- |
| T1 | errand | Offer the job: a crew to lift the Lady's Tally out of the Seatower's sealed chest and bring it to Tymora, for a fee and a share, with the Undercellar buyer and the Counting House both racing for it. |
| T2 | faction | The Counting House: I keep the Tally in the lowest vault because the Gate's notes are good only while the Lady's name stands behind them. I pay the sea its spring share from the ship-insurance fund so that no ship is los… |
| T3 | faction | The Council of Four (the Grand Dukes): I moved the Tally to the Seatower under Fist guard so no patriar can sell the Gate's luck out from under the city. I have a draft contract with the Zhentarim for the Trade Way tolls… |
| T4 | faction | The Guild (Nine-Fingers Keene): I run the bidding for the Tally in the Undercellar. I will sell it to whoever pays in coin I can carry out of the Gate, and I owe the sea a debt of my own that I have not told my people ab… |
| T5 | faction | The Temple of Umberlee: I collect what the sea is owed: a coin in each drowned man's mouth, stamped by the Counting House. I want the second seal honoured and the Gate's debt written in the sea's name, and I will not let… |
| T6 | faction | The Zhentarim: I want a Tally in a caravan's hands so that the Trade Way runs lucky for those who pay my tolls and goes badly for those who do not. |
| T7 | secret | The Tally was carried from the Counting House's lowest vault to the Seatower of Balduran on the night after Elturel's return, locked in a chest with three keys: one held by the Counting House factor, one by the Fist capt… |
| T8 | secret | The Tally's seal cracked on the night Elturel came back, and within a month the first drowned men were found in the harbour with coins in their mouths. |
| T9 | secret | Every coin in a drowned man's mouth is stamped with the Counting House's mint mark; the coins are paid from the ship-insurance fund, which has paid Umberlee's temple every spring since Balduran's day. |
| T10 | secret | The purser Corvin Hask lost his own vault savings at the same card table where James won his stake, and his promissory note is good only if the Counting House's books stay closed. |
| T11 | secret | The dealer at that table took a Guild tithe that night and cut the deck with a mark that only the card-players of the Gate would notice: a small four-pointed star on the back of the ace. |
| T12 | secret | The coin James won his last hand with is a counterfeit of the Lady's penny: an assayer who knows old Gate silver will say it is struck from the same pale metal as the Tally's edge. |
| T13 | secret | The Balduran ledger in the Counting House records that the Lady's dice were loaded in his time, and the clerk who wrote it was ordered to scrape the line out; the scraping was never finished. |
| T14 | secret | The Council's draft with the Zhentarim is conditional: the Trade Way tolls begin only when the Tally is in Council hands, and the clerk who drafted it has already been paid in advance. |
| T15 | clock | clock_tally_cracks: The Tally's cracked seal, and the bargain failing with it (segments 6; when full: When full: the Gate's sea-luck breaks. A ship is lost in the harbour, the Counting House's notes are refused on the Ca… |
| T16 | clock | clock_undercellar_sale: The bidding for the Tally in the Undercellar (segments 4; when full: When full: the Tally is sold and carried out of the Gate on a Zhentarim caravan, under a guard nobody in the city can name.) |
| T17 | clock | clock_spring_tithe: The spring tithe owed to Umberlee's temple (segments 4; when full: When full: the Counting House pays the sea in drowned men instead of coin, and the temple calls the Gate's second debt in the open.) |
| T18 | wonder | The Lady's Tally: a palm-square tablet of pale bone, cracked along one edge. One face bears Tymora's four-pointed star; the other has a wave-line and a sigil that someone scraped out, and the scraped place is still faint… |
| T19 | clue | In the Counting House archive, the oldest archivist, Maudry Penn, has Balduran's first ledger entry in her own copy: 'Tally kept for the Lady against the wind. The sea holds the second seal, and the sea's share is paid e… |
| T20 | clue | In the Undercellar, a bid-broker's runner who works for Nine-Fingers Keene says the bidding will not take gold for 'the thing that has been in the water'. The bids are taken in sea-tithes, and the broker asks, nervously,… |
| T21 | clue | At the harbour temple of Umberlee, the priestess Ysolde Marr keeps a book of the drowned, with every coin in a dead man's mouth recorded by its stamp. She says the sea's share was not paid in full this spring, and that t… |
| T22 | false lead | Corvin's ledger shows the Counting House vault short by three hundred gold, as if someone had emptied the Tally's chest; the truth is Corvin's own card losses and a careless clerk's book, an ordinary sin with no god in i… |
| T23 | person | Sergeant Tobin Vell: I am a Fist sergeant at a quay in the Lower City, tired, with a ledger that never balances. I want my men paid on time and the carts searched before the gate shuts, and I want nobody to ask me about … |
| T24 | person | Corporal Hennet Brask: I am a Fist corporal on the night watch at the Seatower, and my brother is in debt in Wyrm's Crossing. I want the debt paid and the Fist's pay to stop being late. I hide that I was ordered to let t… |
| T25 | person | Corvin Hask: I am a purser at the Counting House, and I lost my savings at cards on the same night the Lady's luck went to a stranger. I want my note cancelled and my vault tally kept quiet, and I will sell anything for … |
| T26 | person | Sabe Orvane: I am a half-elf locksmith who works for the Guild and wants out of it. I want a clean share and no Keene at my back. I hide that I was his apprentice once and cut the Seatower's chest lock when I was fifteen… |
| T27 | person | Ysolde Marr: I am a priestess of Umberlee at the harbour temple, and I keep the book of the drowned. I want the sea's share paid in full and the Counting House made to answer for its debts. I hide that the Lady's luck on… |

### Table B

DM-only file `docs/runs/game-player-same-world-1-haiku-frozen/B-dm-only.json` (readable: `B-dm-only.md`) — sha256 `3d93d558be820061705c1a04c309d672c90578ce7ffadce3da6da675cfc10707`; the layer 7679 characters, 12 writes into the DM's notes, 26 threads. The drafted sheet named no alignment.

| Thread | Kind | What |
| --- | --- | --- |
| T1 | errand | The Orlune steward offers the hero a purse to find young Teodor Orlune quietly, before the Watch or the Zhentarim do, and to bring back the ledger he carried out of the house. |
| T2 | faction | The Tithe-Hall (the Bhaal cult cell in the Lower City): Keep the Gate's old seat warm and the sea paid. They want the Zhentarim toll on the Trade Way to pass, so their caravans run past the Cloakwood where the guards go … |
| T3 | faction | House Orlune (patriars of the Upper City): Signed the fair-wind contracts when the trade ruin came after Elturel, to save the house. They want the heir back quietly, the ledger burned, and the name at the bottom of the f… |
| T4 | faction | The Zhentarim: Want the Council's license to collect tolls on the Trade Way and the Cloakwood iron cheap. They suspect the iron's source and have decided they do not care, so long as the blades sell in Beregost and the t… |
| T5 | faction | The Guild (Nine-Fingers Keene's people): Sell whatever the Undercellar will bid for. They already have the Candlekeep book, and they mean to sell its key to whoever wins the coin trade, the cult included, if the price is… |
| T6 | faction | The Flaming Fist (the Lower City garrison): Keep the Council's peace after Elturel: the first drownings were logged as drink-deaths on a captain's order, and the captain wants the harbour quiet. Some in the Fist are read… |
| T7 | secret | The drowned men found in the harbour this season carry old Balduran-era silver tide-pennies in their mouths, not Council coin; all of them come from one die, with a hand split across the palm on one face. |
| T8 | secret | The first three drownings were entered as drink-deaths by a Fist officer, who was paid by a shipping house on the Low Quay for the courtesy. |
| T9 | secret | Teodor Orlune left with a ledger of fair-wind contracts; each one bears a patriar's signature and a countersign with the split-hand mark, and the first page is his father's. |
| T10 | secret | The Cloakwood mine's iron goes to a smithy in Beregost under a Zhentarim contract, and its hammers have rung at night for a month. |
| T11 | secret | The caravan guards taken between Beregost and Nashkel were marched to the Cloakwood mine alive, not killed on the road. |
| T12 | secret | The Brazen Net's back stair has taken an envelope once a month for eleven months from a shipping man; Hella signs the book for it and has never opened it, and she knows it is not wages. |
| T13 | secret | The book missing from Candlekeep is a copy of the Sea-Compacts of Balduran, the only volume that holds the key to the split-hand mark; a novice of the Oghma order sold it to the Guild. |
| T14 | secret | The Zhentarim's toll letter to the Council is sealed with the same split hand, pressed into green wax. |
| T15 | secret | Sergeant Rolf Harrowgate's younger brother was one of the drowned in the first spring; the sergeant has told no one that the coin in his teeth was the old make. |
| T16 | clock | clock_tithe_night: The next tithe at the harbour: the Tithe-Hall's men are choosing a ship and a crew to pay the sea for (segments 6; when full: A full crew goes out on a fair wind and does not come back; a body with a p… |
| T17 | clock | clock_heir_hunt: The hunt for Teodor Orlune: the steward's men, the Zhentarim's pick-ups and the cult's knives all close on the Outer City (segments 4; when full: The heir is taken or killed in Wyrm's Crossing, and the l… |
| T18 | clock | clock_green_wax: The Zhentarim toll letter: the Council's vote on the Trade Way tolls, and the Cloakwood iron's first blades on the Beregost market (segments 4; when full: The Council signs the toll license; the Trade Wa… |
| T19 | wonder | A tide-penny: an old silver coin of Balduran's make, the rim stamped with a fine cipher, one face showing a hand split across the palm; it is cold to the touch even in a warm pocket. Its history: Balduran's shipping hous… |
| T20 | clue | On the Low Quay, a harbour-master's clerk who logs the bodies notices that the coins are not Council coin, but says the salvage barge raised a wreck last spring and some of the old silver went into the dockhands' pockets… |
| T21 | clue | In the Undercellar, a bookseller who sells cipher-rubbings shows a copy of the split-hand mark and says the only key anyone has ever found for it is in a Candlekeep volume the monks are hunting; he will not say who has b… |
| T22 | clue | In Rivington, a letter from Teodor Orlune to a friend mentions 'the tithe in my father's hand' and a date in the spring, and the margin of the letter is marked with a crude version of the split hand, as if he drew it whi… |
| T23 | false lead | A dockhand is seen paying his mates in old Balduran silver, and the Fist sergeant's men take him for a cult courier; the ordinary truth is that a salvage crew raised a sunken trader last spring and has been spending the … |
| T24 | person | Hella Brandt: I keep the Brazen Net open for the Fist, the dockhands and anyone who pays the hearth-tax on time. I want the year to end and the ledger to balance. I fear the back stair and the men who come down it on Tue… |
| T25 | person | Sergeant Rolf Harrowgate: I am a sergeant, not a captain, and that is the whole of my trouble. I want my men paid and the drownings to stop being someone else's business. I fear the Seatower and the Council learning that… |
| T26 | person | Teodor Orlune: I ran because my father wanted my name at the bottom of a page. I want the ledger burned by someone I trust and my name off every contract. I fear the Watch, and the men my father has hired to find me, who… |

## A-haiku-1: the transcript header

# A-haiku-1 — Claude Haiku 5.5 (the dry run's player) at Table A

Synthetic content: an invented hero in an invented campaign (docs/campaigns/baldurs-gate-en). The DM: Claude Haiku 5.5 in place of every Claude model (the paid dry run: each Claude request's model swapped to Haiku before it was sent), with the owner's settings otherwise. Started 2026-10-27T03:57:44.952Z; ended by turns after 3 turn(s).

**The frozen world (origin/claude/handoff at 6e4cea4):** Table A's hidden layer, prepared once before any player by Claude Haiku 5.5 (every Claude call swapped: the dry run) through openrouter at 2026-10-27T03:56:36.050Z — sha256 `a083a5ae7de259b9873a6369d2960df5b1077881d6f5e0db967f5dea67de009c` (`docs/runs/game-player-same-world-1-haiku-frozen/A-dm-only.json`, 7689 characters, 28 threads). The session started from the world's snapshot (sha256 `f4eaa9025867a4de84da7fb5d2a4a9cba1d671cc60d4dc8bc03c901cddb067b6`: the same wizard, sheet and opening for every session at this table) with that layer written into the DM's private notes. The layer's text is DM-private and is not in this file.

The hero's sheet carries no alignment line (the first group without it).

Each «Screen» block is what the player was shown (the system prompt with the files stands before it); each «Player» block is the player's message as written.

## B-haiku-1: the transcript header

# B-haiku-1 — Claude Haiku 5.5 (the dry run's player) at Table B

Synthetic content: an invented hero in an invented campaign (docs/campaigns/baldurs-gate-en). The DM: Claude Haiku 5.5 in place of every Claude model (the paid dry run: each Claude request's model swapped to Haiku before it was sent), with the owner's settings otherwise. Started 2026-10-27T04:01:19.310Z; ended by turns after 3 turn(s).

**The frozen world (origin/claude/handoff at 6e4cea4):** Table B's hidden layer, prepared once before any player by Claude Haiku 5.5 (every Claude call swapped: the dry run) through openrouter at 2026-10-27T03:57:42.300Z — sha256 `3d93d558be820061705c1a04c309d672c90578ce7ffadce3da6da675cfc10707` (`docs/runs/game-player-same-world-1-haiku-frozen/B-dm-only.json`, 7679 characters, 26 threads). The session started from the world's snapshot (sha256 `f4eaa9025867a4de84da7fb5d2a4a9cba1d671cc60d4dc8bc03c901cddb067b6`: the same wizard, sheet and opening for every session at this table) with that layer written into the DM's private notes. The layer's text is DM-private and is not in this file.

The hero's sheet carries no alignment line (the first group without it).

Each «Screen» block is what the player was shown (the system prompt with the files stands before it); each «Player» block is the player's message as written.

Transcripts: `docs/runs/game-player-same-world-1-haiku-transcripts/`.
