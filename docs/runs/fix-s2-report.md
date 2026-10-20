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
| D | $3.07 | the lair search and the fight on the stage D rules (Opus writes, Opus records, Russian instructions) |
| C | $0 | (the turn on screen is code and synthetic tests; the 2D session took the combat work) |
| E | $0.60 | the picture probe on both frame paths (the brief path twice on five synthetic scenes; the default shot path on three, then two again), one raw check call, the check re-run |
| F | $0.32 | the one-pass hero on the live DM (two synthetic heroes) |
| **Total** | **$30.12 of $50** (A+B $26.13 of $30) | |

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

## Stage D — records and inventory, done once

### What changed

- **The model, once** (`docs/runs/fix-s2-inventory-design.md`, written by a Fable 5.1 subagent, with an implementation
  appendix; `src/lib/inventory/model.ts` and `sheet.ts`, the same rules in SQL in migration 76). Things are items;
  counters are only slots, hit dice and charges — potions are items. Money is a wallet per person (a character's
  `currency_<code>` and a storage's wallet), one line in the order of value («Кошелёк: 10 зм · 11 см · 26 мм»), the full
  coin name on hover; the DM's «золотые» and an older «зм» are one balance. Eleven slots on every person's doll (Голова,
  Амулет, Плащ, Броня/одежда, Перчатки/наручи, Пояс, Сапоги, two rings, both hands; no «Ноги»); eleven kinds; a
  thing's bonuses, hands, charges and attunement (three at most); a sheet of schema 2 (level, AC, speed, saves,
  attacks, spells with every field) for the hero, the companions and the NPCs made from a 5e stat block.
- **The DM's tools on the model** (D part 2): gear and sheets from stat blocks at creation (a search lists what the bodies
  carry); identical things merge into one stack, a part of a stack moves on its own; loot the story shows lying is
  recorded where it lies («Здесь лежит: …», a place pile); one source pays once (the mine's loot was granted twice in
  session 2 — a second grant of the same source is refused with a hint); a ranged attack spends one arrow or bolt per
  shot, hit or miss, and none left means no shot; worn things add their bonuses to rolls with the item as source (a
  fiction bonus naming the same item is dropped — the ring that counted twice); new counters need a Russian label (no
  `spell_slots_1` or `shaman_tusk` on screen); the hero's sheet changes in play only with a reason, shown as a chip;
  mounts carry saddlebags, never riders; the ledger checker knows the people present and the place's pile.
- **The screens** (D part 4, a worker in its own worktree, merged): the Character tab in three columns that fill the
  window — the sheet (wallet with «Разделить…», counters with pips, attacks, saves, skills, «Изменить лист…»), the doll
  (body slots left, amulet/rings/belt right, both hands below; a two-handed thing marks the off hand «занято»), the
  person's own things; the item card («Надеть / Снять», the kind picker, «Отдать → себе / Брам / седельные сумки» with
  «сколько», «Использовать», bonuses, charges, attunement, the history); the Inventory tab with drag between the hero,
  the companions present, the saddlebags and «Здесь лежит» («Забрать →»), drag onto the doll; lent things read
  «отдано: X» / «взято у: Y»; the Spells tab (cantrips, slots by level with pips, «подготовлено N из M», the spellbook,
  ritual and concentration marks, «Концентрация: …», a card per spell, «Колдовать» puts the line into the action box);
  companions open in the same sheet view with their stat block's numbers. Every owner move is an owner correction with
  a history entry, undone if a later step fails; the DM sees them next turn (`ownerMovesSinceYouLastTouchedThem`).
- **Starting things on the doll** (migration 83): a new hero's starting weapon goes in the hand, armour on the body,
  the hat, cloak, boots, rings left then right; a stack and a second thing for a slot stay in the pack.
- **The conversion of your records** (migration 77 defines it; it does not run by itself):
  `rpg_private.fix_s2_inventory_convert()` gives the old possessions their kinds, moves every doll to the eleven slots
  (neck and talisman → Амулет, «Ноги» comes off and stays), turns potion counters into potion items, empties a
  mount's riders and joins coin entries under their codes. `docs/SANDBOX_LOAD_FIX_S2.md` says when to run it.

### Numbers

- The lair search (one turn, $1.66, 5 requests): ten things and four kinds of coins recorded where they lie, the coins
  by their 5e codes from rolled 5e treasure tables (168 мм, 148 см, 6 зм, 13 эм), no checker miss.
- The fight (one turn, $1.42, 3 requests): bundled attack-and-damage rolls for the hero and two companions; the dropped
  light crossbow recorded where it lies.
- Tests: the model and SQL agree on slots, kinds and coin words; the DM-side scenario (fight → search → take → equip →
  drink → shoot → buy) and the owner-side acceptance (one potion of three to Брам, four gold to Брам, the staff into the
  hand) both run through the real database saves and check every record; 14 screen tests (`fix-s2-d-ui`).

### Screens

`docs/runs/fix-s2-shots/D-*` — character, character with spells, a companion's sheet, inventory, the item card, party,
holdings; 1920×1080, 2560×1440 and phone, no overflow. (The 1920 px cap at 2560 was lifted in stage F, item 22.)

## Stage C — the turn on screen

### What changed

- **One timeline per turn** (items 53, 63): the told text, each roll in the place it was made, the continuation; the
  text never vanishes and comes back. Before the first word «Ведущий думает…» (the only place it appears); a pause in
  the middle is named from what the DM does — «Ведущий бросает кости…», «сверяется с записями…», «записывает
  изменения…» (the stream now says it); at the hero's roll «Ждёт твой бросок» with «Дальше»; after a companion's roll
  «Бросок: Мэг — ведущий рассказывает, что вышло…»; while the records are written «Ведущий записывает…».
- **The continuation after «Дальше» streams live** (it used to appear only at the commit: the reopened stream replayed
  the old pause and closed). A saved turn knows where each roll was made (`changes[].at`, migration 81), so a turn this
  page did not see told still shows its rolls in place; a paused turn carries the text told so far, so a reload or a
  restart shows the card after its text.
- **Roll cards** (items 43, 44, 66): one card per hero roll; companions' and NPCs' rolls are one-line chips in place
  (the DM rolls for the companions — your decision; «Броски спутников: игрок» in the DM options gives you their cards).
  The card shows every part of the total with its own source — «Скрытность +5 · Кольцо защиты +1 · тень от телеги
  +2 · 17 + 8 = 25» — the dice kept, advantage and why, the difficulty in words, the DC only when the campaign shows it
  (migration 82 keeps the parts with the check; older checks show «лист и снаряжение» as one line).
- **The screen**: the action box starts at four lines and grows with the text to a third of the screen; the session
  transcript stays folded inside the owner's editor («Открыть стенограмму сессии»), which is never forced open.
- Combat, the battle map and the combat screen moved to the 2D session; nothing here touches them.

### Screens

`docs/runs/fix-s2-shots/C-game-turn-*` (a companion's chip and the named pause), `C-game-combat-turn-*` (chips, the
hero's card waiting, «Ждёт твой бросок»), `C-game-recording-turn-*` (the card revealed, the continuation, «Ведущий
записывает…»).

## Stage E — pictures, the gallery, the session close

### What changed

- **Frames match their turn** (items 78, 79). Role words resolve to the scene's people, the hero first: «Горн
  выслушивает мага» now draws the hero, not a stranger in a hood. The shot director writes each person's gaze,
  expression and action and which hand does what; the reference pictures give identity only («do not copy the pose,
  head angle, gaze or expression»); things in hands come only from the records — what the person wears or holds, what
  they carry packed away, and «no other weapon, no shield, no lantern»; the hero's position (hidden, behind what) and
  the light come from the turn; a temporary look (ash on the face, a burned robe) stays in the person's look until the
  story removes it («no longer: …»); a person at 0 HP is drawn with closed eyes. Names never reach the picture prompt,
  even when the model writes them in Latin letters. Portrait anchors are now neutral (front to a slight three-quarter,
  calm face, looking at the viewer).
- **The caption is the frame's own moment** in the campaign's language (it was the turn's first sentence).
- **No frame for an out-of-game reply** («(Вне игры: записываю.)»), and an aside inside a story turn never reaches the
  shot.
- **The vision check** after each frame (Claude Haiku 5.5, a fraction of a cent): extra or missing arms and hands, a
  shield or a lantern the person does not have, open eyes at 0 HP. A mistake queues one automatic redraw with the
  corrections (never a second one, never past the daily limit) or marks the frame for you («Проверка кадра: …»).
- **The frame appears in its turn** (item 77): «Кадр сцены» draws the frame of the last turn with narration (never a
  failed or out-of-game one), the page no longer scrolls through the campaign, and every answer is said in words
  («Дневной лимит картинок исчерпан — новый день начнётся в полночь», «У этого хода нет текста…», «Это ответ вне
  игры…»).
- **The daily picture limit starts at your midnight**, not UTC's (17:00 for you): the app takes the time zone of your
  device the first time it opens (migration 79).
- **The gallery replaces the chronicle** (item 80): «Галерея» on the game screen; all frames in story order by session
  with their captions; a large view with «К ходу» and «Перерисовать»; tabs Кадры / Люди / Места / Вещи / Карты. The
  chronicle and its one-click batch redraw left the navigation.
- **The session close by length** (item 81, your design): after a short session «Что было» in a few lines; after a long
  one (30 turns or three hours of play, pauses over 15 minutes not counted) the ending cards — one per person or group
  met, with the portrait, where they are, how they stand with the hero, one line of fate, «неизвестно» when the hero
  does not know; then «Открытые нити» from all live threads; then «Тем временем» through an in-world channel («донесение
  начальнику порта»), which moves the story without answering an open question; «Ранее в…» is three or four
  forward-looking sentences (where we are, what is at stake, what comes next). One digest per session, shown once.
- The party council never offers the hero as a listener (stage A did it; a test pins it now).

### The picture probe (synthetic scenes, live models)

Five scenes shaped like session 2's misses, each through the brief (Sonnet 5.5), the picture (GPT Image 2.5
Sunburst, no references) and the vision check; frames `docs/runs/fix-s2-shots/E-probe-*.jpg`, numbers
`docs/runs/fix-s2-picture-probe.json`.

| Scene | Who is drawn | Caption (Russian, the frame's moment) | What the frame shows |
| --- | --- | --- | --- |
| «Хальвар выслушивает мага и кивает» | the hero and the sergeant | yes | the hero (the mage) holding the map, the sergeant looking at it; no shield |
| kneeling behind the root, aiming | the hero and the sergeant | yes | the hero kneels and aims, the sergeant's hand on the hilt |
| the ash paste | the hero and the scout | yes | one hand smears the paste, the other holds the waterskin; two hands each |
| the hidden raid | the hero and the sergeant | yes | the hero hidden in the cart's shadow, ash on his face, no lantern; the sergeant gags the guard |
| down at 0 HP behind the burning cart | the hero, the sergeant, the leader | yes | your reference frame (item 76): eyes closed, the hat beside him, the bloody blade, the key on the dead man's chain |
| «(Вне игры: записываю.)» | — | — | no call at all |

**The default path.** Session 2 played with the shot director off (polish 3's default), so most frames come from the
short shot, not the brief. The same rules now hold there: the shot gives each person's gaze and which hand does what,
the frame carries the records' gear («wears or holds only: …; no other weapon, no shield, no lantern»), «eyes closed»
at 0 HP, and identity-only references. Probed live on three scenes (`E-probe-shot-*.jpg`): the right people (the mage is
the hero), Russian captions, gaze and hands; the first run found names in the shot model's own text, a dead man drawn
with open eyes, and a rope belt flagged by the check — all three fixed, the two scenes re-run clean. The brief path
(«режиссёр кадра» on in «Картинки») stays the richer one for about $0.01–0.02 more a frame.

Gaze across the frames (the check reads it): the hero looks at the map, at the target up-right, at the scout, far
away, down; the sergeant at the map, far away, down at the guard, at the leader — no repeated portrait gaze. Found and
fixed on the way: the check's answer was unreadable three times of five (its thinking used the 700-token cap — now
3000); the brief once wrote «looking at Lira» in its prose (names are now scrubbed from the prose too); the check
flagged the distant target the story names (now allowed). Not measured: likeness to a portrait anchor (the probe had
no anchors) — that is what your session will show.

### Screens

`docs/runs/fix-s2-shots/E-gallery-*`, `E-ending-*` (short), `E-ending-cards-*` (long), `E-game-*` (the frame in its
turn, with its caption).

### The regression list on stages D, C and E

- Honest dice: every roll is the server's; the card shows each addend with its source and the dice kept.
- Enemies that play to kill: not changed here (stage B's rules; the combat work moved to the 2D session).
- No item lost: loot is recorded where the story shows it lying; a part of a stack moves on its own; the owner's moves
  keep a history and the DM sees them; one source pays once; arrows and bolts are spent per shot.
- Active companions: the DM rolls for them and their rolls show in place as chips; companion sheets carry their stat
  block's skills and attacks.
- Right modifiers and advantage: the sheet's skill, each worn thing and each bonus of the fiction are separate on the card;
  a fiction bonus naming a worn item is dropped (no double count); advantage shows why.
- Honest magic and slots: the Spells tab shows the slots by level with pips, what is prepared and the concentration.
- Facts held: not changed here.
- Secrets only through people who know them: captions come from the narration only (never from the writer's private
  notes); the ending cards and «Тем временем» carry only what the hero knows or could hear; the vision check and the
  brief never reach the player.

## Stage F — the new campaign, the hero, the screens and settings

Two workers in their own worktrees (the new-campaign flow and the one-pass hero; the screens and settings), merged and
reviewed here; the rest (item 32 b, the sandbox load guide, the owner's corrections, the leftovers of both workers)
done on the branch. Items 23 (the history window, decided in stage B as «Память ведущего») and 31 (the 2D session)
are not here.

### What changed

- **The hero in one pass** (items 20, 16 — your top priority from the wizard). You write «Кто вы?» (up to 20 000
  characters) and press «Собрать героя»; the campaign's DM (Claude Opus 5.5 at high, not the app's OpenAI model) builds
  the whole sheet in one request: scores with modifiers, HP, AC, speed, saves, skills, attacks, features, spells with
  every field, the things (kind, the slot on the doll, damage and properties, bonuses, two-handed, attunement, charges),
  counters with Russian labels and the purse by 5e coins. The answer is read tolerantly: every number you wrote wins
  over the DM's, and the sheet says so («Сила 8 — как в твоём тексте (у ведущего было 10)»); a bad entry is repaired or
  dropped with a plain note; potions given as a counter become items; the DM's questions never block. A failed or
  unreadable call opens a sheet to fill in by hand with the reason — never «503». Every attempt, its cost and any
  refusal are logged (session 2's three refusals left nothing behind). Migration 84 commits it: each thing goes on the
  doll in its own slot (no guessing from the name), counters with their maximum and label, coins as the wallet; at most
  80 things and 40 counters at creation.
- **The sheet and «Утвердить героя»** (item 19): everything editable in place; a thing opens on a click with its kind,
  slot (only slots that take that kind), damage, properties, bonuses, charges and description; a grey button always
  says why («В слоте «Основная рука» две вещи»); «Изменения применятся при создании».
- **One wizard in story order** (items 21, 11, 12, 13): Мир → Герой → Приключение (title, what we play, pace, «Кто идёт
  с героем») → Ведущий (model, depth range in words, «Что мне нравится», voice samples) → Первая сцена («Предложить
  первую сцену», then «Играть» opens the game). The first step is the world only; after creating one — «Мир создан и
  выбран», «Ещё один мир…», no «v1»; the three texts and the duplicate heading are gone; «Другие поддерживаемые правила»
  (the old Level 1 Fighter starter) is removed. A reload returns to the step reached; «Отмена» ends the wizard.
- **What the DM reads from the start** (items 8, 15, 34): the world's text is a canon document of every new campaign
  («Этот текст ведущий видит в каждом ходе»); the active adventure's whole text reaches every turn (it was 600
  characters marked «never new facts») — what it states is established; the opening's DM names everyone, brings in the
  people the adventure names and gets the hero's sheet and your likes; your answers to the opening's and the hero's
  questions become pinned facts, and an answer to «Как зовут …?» renames that person.
- **Depth** (item 10): the summary and the DM step show the range in words («высокая», «высокая — очень высокая»);
  Opus's single-effort default is now high, as the campaign plays.
- **The screens fill the window** (items 22, 33, 1–3): the 1920 px cap is gone (3200 px), the menu runs the full height
  with the DM box at its foot, the content is at least the window's height, a one-panel page reaches the bottom; at
  2200 px and wider the menu, headers, the sheet and the lists are a step larger and the game's side column wider; the
  campaign list and the wizard widen to 1800 px. The home card is sized to its content and centred.
- **Readable text** (item 5): nothing under 13 px anywhere (a test checks every style file outside World Lab and the 2D
  session's combat rules), helper and muted text 14–15 px, body 16 px.
- **«Крупный текст истории» works** (item 6): the story goes from 17 to 21 px (24.5 on a big monitor), your words to
  18 px, the line kept readable.
- **«Мастерство Ведущего»** (item 7): one-size cards with the title, kind, role, version and the first sentences; «Как
  вести игру» set apart as the main one; the whole card in a dialog (text, «Избегать», Russian tags, the role switch,
  «Изменить и проверить новую версию», its own folded history with «Сделать одобренной»); the long history list at the
  bottom is gone. The role is «учётчик» everywhere (the campaign settings said «бухгалтер»).
- **The Library** (item 25): the list alone until a document is picked; the document read as formatted text (headings,
  lists, quotes; never inserted as HTML); «Изменить» turns the same panel into the editor with «Загрузить файл» as a
  link and no system paragraphs; «Сохранить» closes it with «Сохранено» on the row; the history behind «Версии»; a link
  `?doc=<id>` opens a document. The false «Покинуть страницу…» on «Приключения» is gone: it now appears only while a
  request is in flight or when you edited the opening.
- **General settings** (item 4): «ИИ: кто что делает» — the Anthropic, OpenAI and fal keys as «ключ есть / нет ключа»
  (the server says only whether a key is set), «Ведущий — в настройках каждой кампании (по умолчанию Claude Opus 5.5)»,
  «Картинки — в настройках кампании», the background OpenAI model named for its jobs, its model chips under
  «Подробнее».
- **Campaign settings** (items 26, 39): «Правила и кости» — the rules in words from the DM guide's first line («D&D 5e
  (2014) … — по руководству ведущего», or «Свои правила…») with a link to the guide; «Показывать сложность (DC)»,
  «Важные броски кидаю я» and «Перебросы» for every rules system, «Логика мира» included; the per-turn limits left the
  screen (they still apply on the server).
- **The opening's frame** (item 29): the approved opening is drawn as the starting place's picture (the header shows the
  place the story is in), asked once when the opening shows («кадр сцены рисуется…»); a second open tab gets the picture
  already in work instead of a second paid one; a failure is not retried by itself.
- **Small things** (items 24, 30, 32 b): no loot panel on «Приключения» (it stays under the settings' advanced
  section); «Закончить сессию» a quiet link at the end of the row; the HP buttons behind «Исправить хиты…»; item cards
  close on Esc or a click outside; a counter named in the campaign language gets a Latin key and keeps its name.

### The hero probe (two synthetic heroes, the live DM)

`scripts/eval/fix-s2/hero-probe.mjs` runs the app's own provider with the wizard's default DM; the record is
`docs/runs/fix-s2-hero-probe.json`.

| Hero | Seconds | Cost | What the sheet held |
| --- | --- | --- | --- |
| A detailed level 9 wizard with your kind of numbers, gear, spells and money | 90 | $0.23 | every number kept (six scores, HP 58, AC 15, level 9, 60 зм · 57 см · 14 мм); slots 4/3/3/3/1 and hit dice d6 9/9 by the rules; saves with the ring of protection's +1; staff, dagger and fire bolt to-hit right; 11 things, the staff in the hand, the ring, cloak and hat worn, two healing potions as items; 17 spells (5 cantrips); no question, no note, the button open |
| A short archer with no numbers | 39 | $0.09 | a level 1 fighter with the archery style derived by the rules (longbow +7, HP 12, AC 14 in leather), 20 arrows as ammunition, 10 зм; no question |

Both sheets were ready to approve as they came. A detailed hero takes about a minute and a half — the wizard shows
that it is working; a first real draft for your own hero costs about a quarter of a dollar.

### Not done, and why

- Changing the sheet in words («поменяй запугивание на убеждение») — optional in the item; not built.
- A «fill in by hand» button before any model call — the hand-filled sheet appears only when the DM fails.
- The people who go with the hero are not joined to the party at the opening (the opening's handoff keeps the party as
  the hero alone); the adventure's whole text and the opening's named people reach the DM, who adds them as companions
  on the first turn.
- A per-world rules document («D&D 5e») — optional in item 21; the DM guide's first line names the rules.
- The hero is drafted by the default DM (Opus 5.5 at high) even when you later pick another DM: the DM step comes
  after the hero.
- World Lab's styles and the 2D session's combat styles keep their sizes (not this run's to change).

### Screens

`docs/runs/fix-s2-shots/F-*` at 1440×900, 1920×1080, 2560×1440 and a phone, retaken on the merged branch: the wizard
(`F-new-campaign`, `-created`, `-hero`, `-sheet`, `-item-items`, `-adventure`, `-dm`, `-opening`, `-opening-people`),
the menu, campaigns, general settings, «Мастерство Ведущего» and a card, the Library (list, document, editor), the
game (with the frame drawing and with large text), character, inventory and its card, campaign settings and «Правила и
кости», «Приключения».

### The regression list on stage F

- Honest dice: not changed (the hero's numbers are the owner's or the rules'; rolls stay the server's).
- No item lost: every thing the owner names becomes an item on the doll or in the pack; potions are items; a repeated
  name stacks; nothing is guessed from a name.
- Right modifiers: the sheet's saves, skills and attacks come from the rules with worn bonuses (the ring's +1 on the
  probe); the owner's numbers win.
- Honest magic and slots: slots by class and level, prepared maximum, every spell with its fields.
- Facts held: the opening's and the hero's answers are pinned facts; the adventure's text is established.
- Secrets only through people who know them: the settings show only whether a key is set; the Library's text is never
  inserted as HTML; nothing DM-private reaches the new screens.

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
6. **The one-time conversion of your records** (stage D) runs from your own machine after the database dump —
   `docs/SANDBOX_LOAD_FIX_S2.md` has the one line. Nothing converts by itself.
7. **Portraits from a second angle** were not added (one neutral angle now). A second anchor per person costs one more
   picture each; say if you want it.
8. **The vision check's automatic redraw** costs one more frame when it finds a mistake (it counts toward the daily
   limit). If you prefer only the mark, say so — it is one switch to add.
9. **The chronicle** left the navigation (the gallery replaced it); its page still opens at `…/chronicle` if you miss it.
10. **The new hero comes from the default DM** (Claude Opus 5.5 at high, about a quarter of a dollar and a minute and a
    half for a detailed hero), because the wizard asks for the hero before the DM. If you want the DM chosen first, the
    two steps can swap.
11. **The people who go with the hero** (the adventure's «Кто идёт с героем») reach the DM, who adds them as companions
    on the first turn; they are not in the party before that. Say if they should join at the opening itself.
12. **The per-turn limits** («Правила и пределы») left the campaign settings completely (they still apply on the
    server); they are not kept in a folded developer section.
