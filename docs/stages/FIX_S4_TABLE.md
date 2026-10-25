# Fix S4 — the table after the first hour of «Envoy of Luck» (2026-10-23 22:45 → 00:25)

The owner played the first hour of the English campaign on the candidate with the new frame. The DM was good — the
opening scene, Mags, the Low Lantern, the gloved woman's two cuts all landed — and the hour turned up eight things,
four of them about the table rather than the pictures. Cloud session (`docs/CLOUD.md`, environment `rpg-console`,
**Opus 5.5, ultracode off**), branch **`claude/s3-candidate`** itself. Nothing to `main`. Paid probes within **$8**,
ledger `docs/runs/fix-s4-table-ledger.md`; report in English `docs/runs/fix-s4-table-report.md`; talk to the owner in
English, briefly. Suite green on a clean worktree, typecheck, zero-warning lint, production build at the end;
`docs/SANDBOX_LOAD_FIX_S2.md` updated for any migration. The owner's three Russian checklists stay untouched.

## The table (do these first; they are what the owner hit)

### 1. The DM's out-of-game answers are records
What happened: the owner pressed «?», the DM answered («a check only comes up if James chooses to lie… her assumption
is her belief, not a fact about James»), the owner answered back, the DM wrote «that's now a fact of James's story» —
and on the next turn: «I went back through my notes and I can't find that discussion.» The «?» exchange lives only on
the screen. Do: every out-of-game exchange (the owner's question, the DM's answer, any agreement reached) is written as
a **table note** record that the DM sees in every following turn of the session and that the digest carries into the
next session's notes; the player-facing journal shows them under «Договорились за столом / Agreed at the table». A
DM aside that states a fact («the Lady's words were "give up the cards"») becomes a fact of the hero's story through
the same record, visibly, and the sheet's history notes it as the owner's correction. Test: scripted model answers a
«?», the next turn's prompt contains the exchange; the digest carries it.

### 2. Truth is never rolled
What happened: the DM asked for a Deception check on a true answer («she gave me no such word») because its reading of
the sheet («give up the cards») made it a lie. Rule, both languages, firm: **a check is called only when the hero
chooses to lie; a true statement is the hero's words, and the person across the table reacts to them.** If the DM
believes the hero is mistaken about his own story, it asks the player out of game (which now becomes a record, item 1)
rather than rolling. And the companion rule: an NPC may believe things about the hero that are not in his records —
that is her belief and is played as hers — but the DM never treats such a belief as a fact about the hero and never
asks the hero to account for a fact that is in no record («what did she ask you *not* to do», when no ban was written
as spoken words). Test: a fixture where the hero's true answer contradicts an NPC's belief — no check is requested,
the NPC's reaction is played.

### 3. A cancelled check disappears
What happened: the DM cancelled the Deception check in its aside, but the roll card stayed on the screen with «Roll
the die» live; the owner pressed it; the record now held a lie that was never told. Do: when the DM withdraws a check
(in an aside or on the owner's objection), the card is removed and the pending check closed; if a roll was made on a
later-cancelled check, the owner can void it from the card and the record is amended as a correction. Test: cancel →
card gone; roll-then-cancel → void path.

### 4. Roll outcomes in the text, no asides about numbers
What happened: three turns in a row ended with «(Out of game: here's that cut spelled out…)» because the card faces
were told in the story but the owner could not tell who had won. The roll rule from FINDINGS_S3 says every outcome is
told as an event. Do: the outcome of a contested roll is stated plainly in the story in the same paragraph as the
cards/dice («Her king beats his queen; the question is hers»), and the numbers live only on the roll cards — no
out-of-game paragraphs restating them. Measure on the interrogation and the card-table scenes (3 runs each): zero
number asides, zero untold outcomes.

### 5. Companion portraits for non-human companions
What happened: the cat's portrait came out as a man with a raven; the visual profile was then drafted *from the
picture* («The Cat is a large, glossy black raven, not a feline»), and every frame for an hour carried a stranger with
a bird. Do: the portrait prompt for a companion whose kind is an animal or a familiar draws the animal alone — no
human figure, no full-length «doll» framing; the visual profile is drafted from the sheet and the description, never
from a picture; the owner's text wins and a redraw after an owner edit uses only the text. Test: fixture cat → prompt
contains the species and no person; profile draft quotes the sheet.

### 6. Small screen things
- The «⚡ important turn» button must not be lit by default and must show on/off plainly; it ran one plain reply at
  «max» for 268 s. Better: depth by meaning — the depth classifier gets «something irreversible is being decided» as a
  signal, so a quiet decisive conversation is not scored as calm; then the button is a manual override only.
- The action field clears after Send.
- The placeholder «Your story is ready to begin» goes after the first turn.
- The hint line under the four buttons shows once per campaign, then folds.
- «Campaign editor · for the owner» leaves the game screen (settings or «More»).

## The pictures (after the table)

### 7. Markers follow the picture
What happened: on every level — region, city, scene — markers sat where the DM's coordinates put them, not where the
painter drew the thing («The Blushing Mermaid» on a ship's mast; the harbour on the upper-city walls; «Tavern Door»
on a barrel). Do: after any picture is painted, one cheap vision pass (the fast model, one call) reads the picture and
moves each marker onto the drawn object it names; the scene keeps «position approximate» only where the object is not
in the picture. Test: a fixture picture with known object boxes → markers land inside them.

### 8. The region and the city
What happened: the region map was refused by its own check («Baldur's Gate Harbour — not in Baldur's Gate») because a
district is a child of a settlement and the region scale has no inside; the city plan showed one marker (the harbour)
and no districts, though the hero is a former soldier who knows the city's shape. Do: the region map shows settlements
only (districts and houses never appear at region scale, so the check passes); the region is drawn automatically after
the first turn of a new campaign; the settlement plan is prepared from the world and the canon at first entry —
districts the hero would have heard of as «heard of», visited ones brighter, houses only as discovered; the DM's text
for the region and the city is shown under the map. Test: wizard → first turn → region drawn, city plan with ≥4 known
districts; the «Text» button on the map stays the mode switch, the description gets its own place.

### 9. Scene for 2D after each turn
The scene («Prepare the scene · $0.040») is prepared by the chain after a turn, not by a button, when the host is
long-lived; on a short-lived host the button stays. One flag.

### 10. Three table rules from the Opus table (journal arm of self-talk 1, Opus–Opus #3)
Two Opus instances, one with the planner's notes, played the opening of this very campaign with each other and
left three rules for the DM, from the table rather than the lab. They go into the DM's frame (both languages) as
rules, and the run checker measures them on the three existing scenes: (a) **leave one thing in each scene the
player can interpret but not resolve** (a coin standing on its edge; the ledger must not close it as an error);
(b) **pay off open threads somewhere other than where they started** (the coin is answered by an officer's «why
won't it fall?», not by the hero); (c) **plant one testable thing per scene, and reward a test by deciding something
true** — a player who only asks «what do I see» gives the storyteller nothing to push against, and the DM must put
the test on the table before he asks. Measure (3 runs × 3 scenes): scenes with ≥ 1 unresolved-but-interpretable
detail; threads paid off in a later scene; scenes with a testable plant; and that the ledger raised no «unresolved
state» flag on any of them.

### 11. What four model players found at this table (GAME_PLAYER_1, 2026-10-25; the report has the notes verbatim)
Four players — Claude Opus 5.5, Claude Fable 5.1, GPT-6 Astra, GPT-6.1 Sol — each played 20 turns of this campaign
against the candidate DM, not seeing each other. Their notes agree on four things; each becomes an item here.
- **11a. The roll card adds the wrong number.** Every player caught it: the card shows «Persuasion +7» and adds +4
  (or +2). Cause found by the session: `sheetBonus` in `execute.ts` reads a number only at the end of a line, and the
  wizard-drafted sheet writes «Persuasion +7 (proficient, Beguiling Influence)», so the reader falls back to a guess
  by the word «proficient». The owner's hand-typed lines read correctly, which is why he never saw it. Fix: parse the
  first signed number after the skill name; a test over the four drafted sheets from the run (11 mismatched cards
  across five sessions must all come out right); and the ledger's roll record stores the modifier it used and where
  it came from.
- **11b. No way to object while a card waits.** The composer is closed until the roll card is resolved
  (`gameplay-composer.tsx:392`), so a player who sees a wrong modifier can only press «Onward» and argue after. Astra:
  «Pressing Onward felt like accepting a result I knew was wrong». Fix: «?» stays available while a card is pending
  (out of game only, no action), and the DM may correct the card before the die is pressed. Ties to item 3.
- **11c. The errand must show its face every session.** All four, in different words: two in-game days of excellent
  legwork and Tymora's task never came into view (Opus: «the heist premise hasn't surfaced yet»; Fable: «no sense of
  what Tymora actually wants beyond the coin going warm and cold»; Astra: «the larger premise barely came into view»;
  Sol: «What was missing was more specifically **James**»). Not a pace problem — the slow city they all praised — but a
  missing obligation: «believe the simple version first» has no end. Rule for the DM's frame (both languages): **by the
  end of each session the player holds at least one thing he can tie to the brief** — a «price, interest, secret»
  conversation with someone who could be crew, or a first clear sign of what the Lady wants — and the hidden-layer
  prep names, per session, which one it will be. Measured by the checker: sessions whose last three scenes contain a
  brief-tied thing (judge-tagged), target 100 %.
- **11d. The out-of-game notes are too long and repeat the narration.** Three of four: «a numbered audit of opening a
  window interrupts the mood» (Astra); «the same paragraph about 'none of those needed a roll' appeared twice in one
  reply» (Fable); «read like the GM defending itself to an auditor rather than talking to me» (Opus). Rule: one line
  for «no roll needed», never a list; no retrospective summary paragraph after the narration («Looking back, James
  knows the lie worked…» repeats what the scene showed). Measured: median words of out-of-game notes per turn, and
  turns with a post-narration summary (target 0).
- **11e. The unread letter is lost at campaign start.** Twice, in different campaigns: Fable (Table A) and Astra (Table C)
  each used «?» to point out that the hero's unread letter from his old company was on the sheet («James's Papers») but
  never reached the inventory record, and the DM admitted the miss both times. One item lost in two of eight campaigns
  is a place in the code, not luck: the sheet's grouped line («a pay slip…; a promissory note…; a letter…») is read as
  one item. Fix: the wizard's record pass unfolds a grouped papers line into its items; a test on the drafted sheets.
- **11f. Offer the time-skip.** Opus: «A short time-skip offer would have helped, something like 'nothing else happens
  before the lamps unless you want it to.'» When a scene's business is done and nothing is waiting, the DM ends his turn
  with that one-line offer instead of waiting for the player to invent filler; the player may decline. Measured: scenes
  ending in an offer / scenes with nothing pending.
- **11g. Lean on the one weakness.** Opus: «No temptation yet. Pip's free turn was a nice first touch, but the cards
  haven't really been leaned on.» The hero has one ban; in 20 turns the world pressed it once. The hidden-layer prep
  names, per session, one moment where the ban is tested for a reason (a stake, a favour, a bluff that needs a hand
  played) — never as a trap for its own sake (the standing rule on scenarios applies). Measured by the judge: sessions
  with a tested ban.
Also from the run, for the owner's own setup: the «?» claim on a new campaign with the Astra-takeover flag comes back
from migration 46's wrapper without its timeline stamp and the old engine refuses it (the harness patched around it);
check the owner's local database before the next session and fix the SQL if it reproduces.

## Done when
Items 1–5 and 11a–11b each with a test; the item-4 table in the report; items 6–9 as built; 10–11c–11d as rules
with their measures; the owner's reload is one step
(`--stop`, `--prod`); the report lists the money and names, for each of the eight things, the turn of the owner's
session where it was seen.
