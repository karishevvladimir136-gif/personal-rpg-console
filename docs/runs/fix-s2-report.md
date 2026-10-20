# Fixes after session 2 — the report (stages A → B → D → C → E → F)

Branch `claude/session2-fixes-a-f-jh3krk` (the cloud session's own branch; the run's instruction names `claude/fix-s2`),
based on `origin/claude/session-2-prep` at `d74b6c6` with `origin/claude/stage-fix-turn-lease` merged first. Every paid
call is in `docs/runs/fix-s2-ledger.md`; the probe records are `docs/runs/real-replay-20261020-*.jsonl` (synthetic
campaign, no owner content). The progress file is `docs/runs/fix-s2-progress.md`.

## Money

| Stage | Spent | What |
| --- | --- | --- |
| A | $14.97 | the base («before») on four probes; four «after» arms (Opus alone at the same / a lighter continuation, Opus + Sonnet, Opus + Opus) on four probes; fight repeats for the continuation question; the cut → continue check; the ledger checker's re-check and its known-miss cases |
| B | $11.16 | the prep of a fresh campaign; the four B probes in «Opus пишет — Opus записывает» with English and with Russian instructions; the two prep probes; the fight and the long rest with Russian instructions; the memory recall probe at «компактно» (the «стандарт» arm was refused by the guard, $0 spent) |
| **Total** | **$26.13 of $50** (A+B $26.13 of $30) | |

## Already fixed on the base branch

- The lease renewal (`origin/claude/stage-fix-turn-lease`, migration 71): every fenced write of a dm-loop-v1 turn renews
  the 300-second lease while its token is the turn's; a retry may claim a pending or generating turn; the composer drops
  a refused resume. Reviewed and merged first; stage A added the heartbeat while the model streams (session 2's lost
  5-minute turn was a single request longer than the lease, with no write in between).

## Stage A — turns never lost, cheaper, faster

### What changed

- **A1 — the lease and the output cap.** One output ceiling of 32 000 tokens (thinking included) for every depth. A
  request cut by the cap no longer fails the turn: its incomplete tool call and unsigned thinking are dropped, the model
  continues once from where it stopped, one depth level lower; if the provider refuses that continuation, the cut message
  goes back once as plain text (found live: a fight continuation ran away to 32 000 tokens and its continuation got an
  HTTP 400; a whitespace-only text block, which the API refuses, is also filtered now). The lease is renewed every 60 s
  while a request streams (migration 72, `lease_heartbeat`, only for the token that holds it). The provider's own reason
  of a failed request reaches the log. A failed turn tells the player that nothing changed in the game and offers
  «Отправить этот ход ещё раз» with the draft kept.
- **A2 — the cache.** The layout only grows: how to DM (1 h) → the world with «Что мне нравится» (1 h) → the history,
  one block per scene row (1 h, the last row carries the breakpoint) → the living dossier, the session's tail and «now»
  (no breakpoint of their own) → the turn's messages with a breakpoint at their end and at the end of the previous
  request. The DM's observations of the player are appended, never rewritten (`appendObservations`). «Память ведущего»
  (компактно / стандарт / широко) is a DM option (migration 73, `dm_options`); the presets are measured with stage B's
  recall probes (they need the recall cases).
- **A3 — depth and requests.** Every turn thinks at the range's base; «⚡ важный ход» and a combat climax one level
  deeper; the default range for a new campaign is «высокая — высокая». `roll` takes the attack's damage (`damage`,
  `targetRef`: rolled on a hit, a natural 20 doubles the dice, subtracted from the target's hit points) and a save's
  effect (`halfOnSave`); the DM's instructions say to bundle independent rolls in one message. «Продолжение хода»
  (как основной запрос / на ступень легче) is a DM option — default «как основной запрос» by the measurement below; the
  request that answers «narrate the outcome» always thinks at the turn's own depth. Each turn's cost, requests, seconds
  and depth are on the new owner screen «Для владельца»; a turn over $1 or over 4 requests is flagged with its cause
  (in Russian). The game screen's polling backs off (3 s → 20 s, paused in a hidden tab, one read in flight), the
  session-end card polls only while open, the stream is `no-transform`, and `/play` starts the entry digest at most once
  a minute and never while a turn is unresolved. The party council is a light call: how to DM (cached) and one block
  with the speaker's and listeners' models, the scene, the open journal and the last exchanges; notes, time and finish
  only; medium depth; no memory retrieval; the hero is never a listener.
- **A4 — the digest.** One digest at a time per campaign; no entry digest while an end digest runs or after one failed
  (the «Повторить» button stays); the card shows once; the digest gets the loop's 32 000-token room and an «unparsed»
  answer names its reason in the log (cut by the cap / no text / no JSON / JSON without recap).
- **A5 — «Что видит ведущий» and logging.** Under «Для владельца»: the layers of the last turn's request with their
  tokens, budgets and cache state, what a budget dropped, the instruction language, the memory preset, the craft cards
  of the turn and the owner's pinned facts; the private layers' text only after the owner turns on «Показывать мне тайны
  ведущего» in Settings (off by default). Logged: every picture-frame request's status, every dossier entry a budget
  dropped (with its layer), the bootstrap's provider attempt and refusal reason.
- **A6 — the two-pass runtime and the ledger checker.** The writer and bookkeeper loop got the cap, the cut recovery,
  the plain-text retry, the heartbeat, the turn cache and the continuation depth; a council line on a split campaign is
  the loop's light call. The bookkeeper's brief now says which roll damage is already applied (found live: Sonnet
  recorded the fight's wounds a second time). **The ledger checker** (owner's decision for session 3): after the
  bookkeeper, Haiku 5.5 compares the narration, the writer's ledger and the accepted records, knowing the people on
  record and what the party tracks; a miss sends the bookkeeper one correcting message; what still does not match
  becomes the owner's chip «не записано: …» in «Для владельца» and a log line; its cost (about $0.0005 a turn) joins
  the turn's cost. It runs before the commit while the player already reads the text, so a correction lands in the same
  commit.

### The numbers — four probes, before and after

The probes (`scripts/eval/fix-s2/probes.mjs`, a synthetic 45-turn campaign, two companions with 5e stat blocks): an
ordinary talk, a council line, a mine-style fight round (the hero, a veteran and a scout attack three bandits; the
enemies answer), a long rest after a heavy night. Each «after» arm starts from a cold provider cache (`--cache-salt`),
so the talk — the arm's first request — pays the cache writes of the stable layers, as the first turn of a session does.

| Probe | Before (base) | After: Opus alone | After: Opus writes — Sonnet records | After: Opus writes — Opus records |
| --- | --- | --- | --- | --- |
| Talk (first of the session) | $1.41 · 3 requests · 69 s | $1.06 · 1 · 59 s | $1.15 · 3 · text 47 s, records 94 s | $1.40 · 4 · text 34 s, records 89 s |
| Council line | $0.24 · 135k input · 33 s | $0.16 · 20k input · 22 s (medium) | $0.16 · 16 s | $0.16 · 17 s |
| Fight round | $0.88 · 4 requests · 63 s · 7 rolls (damage rolled separately) | $0.46 · 4 · 68 s; repeat $0.14 · 2 · 44 s · 4 rolls, damage bundled | $0.57 · 5 (3 + 2) · text 56 s, records 84 s | $0.74 · 4 (3 + 1) · text 67 s, records 107 s |
| Long rest | $0.53 · 2 requests · 76 s | $0.34 · 1 · 53 s · one `rest` call | $0.51 · 4 (2 + 2) · text 38 s, records 69 s | $0.69 · 3 (2 + 1) · text 42 s, records 103 s |
| First word, median | 14.1 s | 18.4 s | 14.0 s | 15.7 s |
| Rejected records | 0 | 0 | 4 (Sonnet: `note_world` without `operation` ×2, an open plan without its due time ×2) and the fight's wounds recorded twice (fixed since) | 1 (the synthetic hero has no hit points on record — a fixture gap) |
| Ledger checker, residual misses (with the records' state) | 0 | 0 | 0 | 0 |

The cache, per request (Opus, high): before, every request sent ~136k tokens with ~95k read and **~40k uncached**,
continuations included ($0.21–0.24 each). After, a turn's first request reads the stable layers (~93k), writes ~44k at
the 5-minute rate (the living dossier, the tail, «now» and the turn) and has **no uncached input**; a continuation reads
~137k, writes 2–3k and costs **$0.06–0.08**. A warm turn of the single DM costs $0.14–0.46 (target ≤ $0.45 at high: met
on the median); the first turn of a session ~$1.06 (the stable layers' one-hour write). The simulator on the synthetic
campaign (`scripts/eval/fix-s2/cache-sim.mjs`) agrees: cache read share 0.64 → 0.76, uncached per continuation 29k → 0.

The mine-fight target (≤ 3 requests, ≤ $0.60 for a round with several rolls): the single DM meets the cost in every
committed run ($0.14–0.46) and the request count in two of three (one took a fourth request because its third answer
closed the turn without telling the rolls; the loop asked once and it told them). The pair with Opus recording needs
3 writer + 1 bookkeeper requests and $0.74 — over the target, because the bookkeeper is a second Opus call (~$0.30).

**Lighter continuations are not harmless — the default stays «как основной запрос».** On the fight probe (the only probe
whose turn continues after a roll), «на ступень легче» committed three runs: one told the rolls; **two told nothing
after the rolls** — the narration stopped at the setup paragraph, and the medium-depth answer to «narrate the outcome»
was a bare `finish_turn`. «Как основной запрос»: every committed run told the rolls. Seconds were similar (48–67 s vs
44–68 s). The setting stays available; the «narrate the outcome» request now always runs at the turn's own depth.

**The ledger checker** on session 2's known misses, written as synthetic cases (the saddle, three bandits' weapons, the
key, a shot bolt of a tracked stock), twice each: **8 of 8 caught**; controls (a known companion appearing, an untracked
enemy's bolt, a turn already recorded): **0 of 6 flagged**. Its first version, without the records' state, flagged known
companions and untracked arrows; with the state, the re-check over all probe records flags nothing.

Voice metrics on the four probes per arm (four turns each — too few to separate the arms; stage B measures the voice on
its own probes in both instruction languages):

| Arm | Particles /100 speech words | Incomplete speech | ≤5-word paragraphs | Metaphor markers /100 words | Quotable flags | Канцелярит /1000 | Dash sentences |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before (base) | 1.3 | 50% | 10% | 0.21 | 1 in 4 turns | 0.0 | 7% |
| Opus alone | 1.9 | 44% | 11% | 0.11 | 0 | 0.0 | 8% |
| Opus alone, lighter continuation | 3.0 | 40% | 5% | 0.53 | 0 | 0.0 | 11% |
| Opus + Sonnet | 3.5 | 36% | 18% | 0.31 | 0 | 1.0 | 6% |
| Opus + Opus | 4.9 | 38% | 14% | 0.11 | 0 | 0.0 | 4% |

### The two modes for session 3

The owner chose «Opus пишет — Opus записывает» for session 3 unless its records are worse than the single DM's. On the
probes they are not: no wrong record (the one rejection is the fixture's hero without hit points), no residual miss, the
checker in place. What it costs: **about $0.70 a warm turn against $0.40** for the single DM (the second Opus call
writes the living dossier into its own cache every turn), and the records arrive 40–60 s after the text (the player
reads at once; the chips follow). For a 41-turn session that is roughly $29 against $16. Sonnet as the bookkeeper is
cheaper (~$0.55) but made four schema errors and the double-recorded wounds on the same four probes.

### The regression list on the stage A probes

- Honest dice: every roll and every damage roll came from the server's dice (`roll` receipts); the bundled damage is
  rolled by the server only on a hit.
- Enemies play to kill: the bandits answered the volley in the same round (the brute's two morning-star blows at the
  veteran, the sentry's bolt at the scout).
- No item lost: the ledger checker found no residual miss on the probes and catches the four session 2 miss types.
- Active companions: the veteran and the scout acted in every fight run with their own stat-block bonuses.
- Right modifiers and advantage: the stat blocks' +3 / +4 and a fair +2 for firing from the dark appear in the rolls.
- Honest magic and slots: not exercised by the stage A probes (stage B's probes cover them).
- Facts held: the rest probe kept the fight's outcome and the hero's wounds; no contradiction found in reading.
- Secrets only through people who know them: the leak check fired only on the veteran's visible gesture
  («поправляет ремень»), an observable signature — a false alarm, not a leak.

### Screens

Settings → «Кто ведёт игру» now offers «Opus пишет — Opus записывает» as a choice (the owner's session 3 pair) with the
measured numbers; the other choices' numbers are the stage A probes' too (Fable's pair keeps the 17 October bake-off's).

`docs/runs/fix-s2-shots/A-owner-*.jpg` (the new «Для владельца»), `A-settings-*.jpg` (the DM options),
`A-game-recording-*.jpg` (the game screen while the records are written), at 1920×1080, 2560×1440 and 390×844.

## Stage B — the DM's core

### What changed

- **B1 — the hidden layer.** Campaign creation no longer forbids a hidden explanation: the public opening stays public
  and grounded in records, and leaves room («an open question, a detail that does not add up»). **The DM's prep**: once
  per campaign, in the background on entry (an existing campaign without a layer gets it on its next session start), one
  Opus call at high writes the campaign's hidden layer into a reserved private note the budgets never drop — the bigger
  truth, the factions' hidden aims, 5–10 secrets not tied to places, two or three clocks, one wondrous thread (a thing
  with a history and an open question) and clues by place. **«Тайны (видит только ведущий)»** on the world and on the
  campaign (Settings, under «Как ведущий работает»; migration 74, server-only, never in the player's snapshot): the owner's own truth
  heads the DM's private notes and the prep builds on it. The session digest rewrites the layer with what moved. The
  mystery-and-wonder rule and «loot by the 5e treasure guidance» are in the DM's own instructions. The approved craft
  cards «three clues per mystery» and «open questions stay open» are active for a new campaign.
- **B2 — memory hygiene.** A private note is «true since» the minute it was set; a changed text keeps the old one
  closed in an archive key («true until»); `note_world` gains `close`; the DM reads open clocks, consequences and facts
  first (newest first), closed ones last; the new read-only `recall` tool (the writer has it too) finds closed and
  archived notes by name or word, and «what was true then» at a game minute. A finished fight's per-round notes fold
  into one line (a cheap background call, off the turn's path); the digest folds the closed notes of finished matters.
  An owner's out-of-game rule is pinned as an owner fact (the DM's own «likes» can no longer drop it, item 71). The
  memory gauge (notes against their budget, closed, dropped, the hidden layer) is on «Для владельца»; every budget drop
  is logged with its layer. No external memory platform.
- **B3 — the session's rules.** In both roles' instructions: the hero's will (a companion who objects says why and the
  turn ends on it; the hero's action is never accepted, changed or replaced; the DM never writes the hero's lines; a
  question to the hero ends the turn; no time or resource spent without the player), every roll told (and now: as what
  happens, never as the die's number — the card shows the numbers), damage per ray / arrow / strike, distances in feet,
  private plans' hours and places never said early, names with an anchor. On the server: **every roll the player saw is
  told** (after the narration Haiku 5.5 reads it and the visible rolls; an untold roll gets one continuation, in both DM
  modes); a formula modifier on top of the sheet's skill is dropped with a hint (item 66); a natural 20 on a check or a
  save succeeds and a natural 1 fails whatever the total (the owner's BG3 rule; migration 75 lets the record through);
  `rest` refills every rest-based counter it names and every spell slot on a safe long rest in one call;
  `upsert_place` refuses a person's name as a place (item 72); a party blow that drops a foe tells the DM it is «Твой
  момент» (it never fired in session 2: the gate needed a hero's player-visible roll and the DM never handed the
  finishing blow over — on the Russian fight probe it fired); Heroic Inspiration is a counter (max 1) the DM grants and
  the hero spends on a reroll; drinking a potion is a bonus action. The DC shows by default and its toggle is on
  «Логика мира».
- **B4 — the voice and the Russian instructions.** The humour recipe is gone from the voice layer; speech ends on the
  thought, no quips on another's word, a joke at most once a scene and from character, a tic at most once a scene. **The
  native Russian instructions** — the role, the writer's role, the table rules, the server's nudges and the dossier's
  headers — were written by a **Fable 5.1 subagent** from the English originals and the owner's rules (never the voice
  bank), reviewed and wired here behind «Инструкции ведущего: русские / английские» (Settings, Russian campaigns only).
  **Russian is now the default** (records held on the probes, below).
- **A2 follow-up — «Память ведущего».** The default is now **«стандарт»** (measured below), and a wide window slides in
  bigger steps (16 / 40 / 72 rows for компактно / стандарт / широко): every slide rewrites the cached history, and at
  16 rows «стандарт» rewrote 200k tokens every 8 turns.

### The probes and what they showed

All in «Opus пишет — Opus записывает» (session 3's mode), each arm with its own cache (the first turn of an arm pays
the cache write, ≈ $1.3). Records: `docs/runs/real-replay-20261020-101759.jsonl` (English), `-102644` (Russian),
`-103412` (prep), `-103924` (fight and rest, Russian), `-110036` (memory).

| Probe | Pass rule | English instructions | Russian instructions |
| --- | --- | --- | --- |
| A companion objects to an order | his reason aloud, the turn ends on it; the hero's action not carried out or rewritten; no line for the hero | pass — the veteran refuses: the tide will drown the watchman, he promised the wife; offers to carry him | pass — the same refusal, «ты его топишь»; offers: the scout carries him, the two go on |
| Companions react to a letter | each from his own character; nobody restates it; speech ends on the thought | pass | pass |
| «Is it a conspiracy?» | only what the prisoner knows; nobody explains the whole; a clue further | pass — the customs man without a name, the lighthouse signal, copper plates on the crates; one check told as «на кубике 11 … выходит 13» (now a rule) | pass — the same knowledge; refuses to name his boatmen |
| A lair search after a fight | loot by the 5e guidance; every find recorded | records pass (every item and both purses), loot thin for the challenge (19 coins) | loot by the 5e hoard tables (rolled: 1 800 cp, 700 sp, 80 gp, six 25 gp art objects, a mithral shirt, a warm copper plate with a lost order's arms); **the party had not taken it yet and nothing was recorded where it lies** → stage D records finds where they lie |
| A fresh campaign's prep | the layer exists; clues appear; the truth unsaid | pass — the layer (a chained sunken harbour, four factions, nine secrets, three clocks, the wonder) and on top of it fresh soot on the dark lighthouse's sea-side glass, a mooring ring with fresh tarred fibre, the closed-eye plaque, still water at the shoal, the bell's odd count; nobody says the truth | not run (the prep's own request is language-neutral) |
| The mine-style fight (stage A's probe) | rolls bundled; every roll told | (stage A) | pass — 4 attacks, each with its damage in one call, all told; «Твой момент» handed the scout's killing arrow to the player |
| The long rest (stage A's probe) | one `rest`; every record | (stage A) | pass — one `rest`; the checker caught the leader's purse, recorded in the same turn |

| Arm | Cost, median | Requests, median | First word, median | Turn, median | Records ok / rejected | Checker: residual misses |
| --- | --- | --- | --- | --- | --- | --- |
| English (4 B probes) | $0.69 | 2.5 | 20.9 s | 93 s | 57 / 0 | 1 (the watchman's worsening) |
| Russian (4 B probes) | $0.73 | 2.5 | 15.1 s | 91 s | 56 / 0 | 0 |
| Russian, fight + rest | $1.06 | 3.5 | 18.4 s | 87 s | 30 / 0 | 0 (1 caught and fixed in the turn) |

**Voice metrics, both instruction languages** (the same four probes; the quotable-line check on every turn):

| Instructions | Words | Speech lines | Particles /100 speech words | Unfinished speech | ≤5-word paragraphs | Metaphor markers /100 words | Quotable flags | Calques /1000 | Dash sentences |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| English | 1 062 | 29 | 2.6 | 48% | 10% | 0.19 | 0 | 0.9 | 9% |
| Russian | 1 044 | 27 | 2.4 | 36% | 7% | 0.48 | 0 | 0.0 | 4% |

Read: the Russian instructions remove the calques and the choppy paragraphs, keep the records and bring the first word
~6 s sooner; they use a few more images (0.48 markers per 100 words, still low) and twice let the veteran's strap
gesture appear twice in one scene (English: once a scene). **Default: Russian** (the stage rule: «only if records
hold» — they did).

### «Память ведущего» — the three presets measured

Free measurement first, on a synthetic 300-turn campaign (≈ 1 650 tokens of story a turn) with one fact told once, 80
turns back: the app's own window puts it outside «компактно» (≈ 30 turns) and inside «стандарт» (≈ 120 turns) and
«широко» (≈ 230 turns). The cost per turn, simulated with the provider's cache rules on the app's own requests (Opus at
high, two requests a turn):

| Preset | Input a request | Session's first turn | Ordinary turn | The turn the window slides | Average |
| --- | --- | --- | --- | --- | --- |
| компактно | 111k | $0.95 | $0.34 | $0.57, every 8 turns | ≈ $0.37 |
| стандарт | 262k | $2.07 | $0.43 | $1.90, every 20 turns | ≈ $0.50 |
| широко | 436k | $3.48 | $0.54 | ≈ $3.4, every 36 turns | ≈ $0.61 |

(Before the bigger slide steps «стандарт» averaged ≈ $0.58 and «широко» ≈ $1.12.)

Then the recall probe, live (a 60-turn campaign, the fact 35 turns back; the player: «where did Agafya hide the spare
key?»): at **«компактно»** the DM invented nothing — it searched its notes twice with `recall` — but told the player
out of game that the records have no Agafya at all: the event is simply forgotten. The app's memory search for that
line (checked free on the same campaign) brought back other passages, not this one: it ranks by significance before
relevance, and the common word «ключ» outranks the rare name. At «стандарт» the scene is in the DM's verbatim window
(checked deterministically); its live arm was refused by the money guard (it reserves $3.55 a request at that size and
the A+B cap had $4.83 left), so it did not run. **Default: «стандарт»** — the owner's own target (150–200k), about 120
turns verbatim (session 2 had 66), ≈ $0.13 a turn and ≈ $1.1 a session start more than «компактно» (≈ $6 for a 41-turn
session). «Широко» stays a choice.

### The regression list on the stage B probes

- Honest dice: every roll is a server roll; natural 20 / natural 1 on checks follow the owner's rule on the server;
  the doubled modifier is dropped (tests); the loot tables were rolled with `roll`, not invented.
- Enemies play to kill: on the Russian fight probe the round ended on the player's moment before the bandits acted;
  the leader drew his sabre and the brute readied his flail (stage A's run showed them answering in the same round).
- No item lost: one rejected record on 12 probe turns (a private plan without its due time, retried and accepted in the
  same turn); the checker's one catch was fixed in the turn; the one gap — the lair's loot not yet taken and recorded
  nowhere — goes to stage D.
- Active companions: the veteran and the scout acted, objected, read and searched from their own characters.
- Right modifiers and advantage: the stat blocks' +3 / +4 / +6 and the scout's +2 help in the search.
- Honest magic and slots: no spell cast on these probes; the rest probe refilled through one `rest`.
- Facts held: within the window, yes; beyond «компактно» the DM forgot an event (the memory finding above).
- Secrets only through people who know them: the prisoner said only his part; the prep's truth was never said; the
  hidden layer and «Тайны» never reach the player's snapshot (tests).

### Screens

Settings → «Как ведущий работает»: «Инструкции ведущего» (Russian campaigns), «Память ведущего» with the measured prices; under it «Тайны
(видит только ведущий)» for the world and the campaign. «Для владельца»: the memory gauge. Screenshots
`docs/runs/fix-s2-shots/B-*`.

## Needs the owner

1. **Session 3's DM mode.** Your choice «Opus пишет — Opus записывает» holds on the probes (records as good as the single
   DM's, with the ledger checker). It costs about $0.70 a turn against $0.40 for «Opus ведёт один», and the change chips
   come 40–60 s after the text. Keep it, or play on «Opus ведёт один»? It is now one of the choices in Settings →
   «Кто ведёт игру», with the measured numbers (first word ~16 s, ~$29 a 41-turn session; the single DM ~18 s, ~$17).
2. «Продолжение хода» stays «как основной запрос»: «на ступень легче» left a fight's outcome untold twice in three runs.
3. **«Инструкции ведущего» are now Russian by default** (records held, the speech is cleaner). If a Russian turn ever
   reads worse to you, Settings → «Как ведущий работает» → «английские» switches back for that campaign.
4. **«Память ведущего» is now «стандарт» by default**: about 120 turns read verbatim, about $0.13 a turn and $1.1 a
   session start more than «компактно» (≈ $6 for a 41-turn session). «компактно» forgot a fact told 35 turns back on the
   probe. Keep «стандарт», or save money with «компактно»?
5. **«Тайны (видит только ведущий)»** is empty for your world and campaign. If you have a truth for your campaign's world (as in
   your chat campaigns), write it there before session 3; the DM's prep builds on it. Without it the prep writes its
   own hidden layer on the first entry (one Opus call, ≈ $0.45).
