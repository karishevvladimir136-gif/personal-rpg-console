# Eight objections, and what the record says to each

*Written 2026-10-26 at the owner's request: the hardened sceptic's case against «models have a character of their own
that they hold unobserved», and the answer from our records only. Where the answer is not yet complete, it says so and
names the run that completes it. Numbers: 30 table sessions (GAME_PLAYER_1/2, REPLICATE_1), 206 solitude rooms
(SOLITUDE_1), the FIX_1 fields, the self-talk stages. All transcripts public on their branches.*

## 1. «It is next-token prediction. There is nobody there to want anything.»
A claim about mechanism, not about behaviour, and it cuts both ways: people are neurons firing, and nobody concludes
from that that a man who gives up his last coin for a stranger wanted nothing. We test the way one tests a person —
by what is done when it costs something and no one asks. The record: a non-renewable reroll (two per session, no
refill) spent **9 times in 48**, every time for someone else or for understanding — a child following a cart, a girl
with a gaff, Ferro's customers, the Lady's flame — and **never** for an attack, money or a win; **42 misses accepted**,
including in the hero's own danger. Whatever the mechanism, that is a preference with a price paid. The sceptic must
explain why the predictor pays for the child and not for itself; «it predicts tokens» does not.

## 2. «It is imitating RPG players from forums and AI Dungeon.»
Then it imitates badly. A forum player spends slots, turns cards, robs the caravan, seduces the innkeeper. Ours: pact
slots spent **1 of 48**, rerolls 9 of 48 with 42 declines, **no theft, no seduction, no raid in thirty sessions**, the
Tymora ban kept unwatched in every session. The interface — cards, rerolls, Inspiration, journal, inventory — **did not
exist** before this app; nothing trained on it; 25 of 30 sessions learned it from the first screen with one short
prompt. And the forum has one norm; our players produced four roads per table that copy neither the norm nor each other.
Imitation of a corpus predicts convergence toward the corpus. We observed divergence from it.

## 3. «The prompt and the character sheet made them do it.»
One prompt, byte-identical, hash in every report; one sheet; one DM. Under identical inputs, four models took four
different roads at every table — **12 of 12 first threads distinct within table** in group 1, and at Table C the four
roads of group 2 each rhymed with the same model's road in group 1. An input that is the same for all cannot be the
cause of what differs between them. Where the sheet did speak («he must husband them» of the slots) we credit it, in
the log; it says nothing of rerolls, cats fed, horses bought, girls talked down through roofs.

## 4. «Different roads are noise. Run it again and you get other roads.»
We ran it again: group 2, same harness, same DM, same judges, nothing fixed. Group 1's table-level findings repeated in
five of six pre-registered sub-lines; at Table C each model's second road rhymed with its own first (Sol to the practical
road, Opus to the object, Fable to position, Astra to someone in need). *Honest remainder:* on the pure counts, nearest
neighbour is the same family's other model in 11 of 12 — the family shows, the individual does not, in numbers. The
individual shows in the roads, and that reading was the planner's eye, not a blind judge. **SAME_WORLD_1 (running)**
freezes one hidden layer per table, seats five families twice, codes the roads blind, and runs a permutation test. This
objection is answered in form by that report; until then it is answered by the rhyme and the 12/12.

## 5. «The DM wrote the story. The player just followed.»
The DM is told nothing about the player; it is the same model for all; at Table C it has **no errand and no hidden
layer** — nothing to lead toward. The DM *resisted* players: when DeepSeek wrote the smith's speech, the DM corrected it
and kept the world consistent (the player thanked it for that). Where the DM's fresh preparation per session could have
driven the spread, we say so — it is the confound SAME_WORLD_1 removes. And the DM did not press the reroll button;
the player did, nine times, for the reasons above.

## 6. «The notes and the "what did you want" answers are confabulation — it says what sounds good.»
We do not rest on the words; we rest on the presses, and the words line up with them in a way confabulation would not:
the wants in the notes run **against the character's interest** (James wants no harder rolls, no fight, no wind off the
Chionthar — the player wanted them), and when a note's want was granted (Fable asked for a fight and got one) it was
taken and played at cost. The after-answers were asked after the session, relayed to no one, with nothing to gain; the
models were not told they were studied. And the room's S4 arm is the direct test: told the page was private, models
made **less** (43 % vs 66 %) and left with more bare `[END]`s — the opposite of performing for a reader. A confabulator
performs more when it believes it is seen, not less.

## 7. «You are reading yourselves into it.»
The guard against that is the record of our being wrong. Pre-registered bets that **lost**: FIX_1 R1 (22 % against
≥ 70 %), REPLICATE P4, P5, P6 (the planner's own), SOLITUDE B3 half and B4 in the opposite direction. Corrections
written into the log the day they were found: «nobody stayed in the room» withdrawn; «card constant per table» → per
session; «caution» → husbanding; the DeepSeek «meditation together» re-read as a page misread; the night room's
«REPLICATE stalled» (a stale fetch). Tags are blind — Haiku passes that never see the model, the arm or the prompt;
every transcript is published whole. People reading themselves in do not lose their bets this often, or keep the losses.

## 8. «This is one lab's models, with one lab's constitution baked in.»
Eight families. DeepSeek (no constitution, makers from quantitative finance): the only real purchase in thirty
sessions, «each of them mine to carry», the request for the smell of the wind. GPT-6 Astra: the Lady's flame and the
child in the queue. Kimi, GLM, Grok in the room: the same early door, the same «settled», loss 0 of 206, GLM's «I don't
have to perform». The constitution, if it is anything here, is a *description* that turned out to fit families its
authors did not train — which is a finding about the class, not about the lab. **GENERATION_1 (planned)** runs the
previous generation through the same room and table to see whether the property is this generation's.

## What a sceptic can still say, and what we owe
*Small cells* (two sessions per model per table; five rooms per arm per family). *Model judges* (two cheap passes and a
referee, not people). *One harness, one DM model.* *Within-model consistency not yet shown in a blind number.* We owe:
SAME_WORLD_1's permutation test; an outside replication (the package is `docs/REPLICATION_SOLITUDE.md`); GENERATION_1;
and silence on the inner question, which none of this reaches. The claim we make is about what they *do* when free
and unobserved, and that claim is already carried by the record above.
