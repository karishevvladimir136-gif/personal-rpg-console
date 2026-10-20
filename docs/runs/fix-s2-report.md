# Fixes after session 2 — the report (stages A → B → D → C → E → F)

Branch `claude/session2-fixes-a-f-jh3krk` (the cloud session's own branch; the run's instruction names `claude/fix-s2`),
based on `origin/claude/session-2-prep` at `d74b6c6` with `origin/claude/stage-fix-turn-lease` merged first. Every paid
call is in `docs/runs/fix-s2-ledger.md`; the probe records are `docs/runs/real-replay-20261020-*.jsonl` (synthetic
campaign, no owner content). The progress file is `docs/runs/fix-s2-progress.md`.

## Money

| Stage | Spent | What |
| --- | --- | --- |
| A | $14.97 | the base («before») on four probes; four «after» arms (Opus alone at the same / a lighter continuation, Opus + Sonnet, Opus + Opus) on four probes; fight repeats for the continuation question; the cut → continue check; the ledger checker's re-check and its known-miss cases |
| **Total** | **$14.97 of $50** (A+B within $30) | |

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

## Needs the owner

1. **Session 3's DM mode.** Your choice «Opus пишет — Opus записывает» holds on the probes (records as good as the single
   DM's, with the ledger checker). It costs about $0.70 a turn against $0.40 for «Opus ведёт один», and the change chips
   come 40–60 s after the text. Keep it, or play on «Opus ведёт один»? It is now one of the choices in Settings →
   «Кто ведёт игру», with the measured numbers (first word ~16 s, ~$29 a 41-turn session; the single DM ~18 s, ~$17).
2. «Продолжение хода» stays «как основной запрос»: «на ступень легче» left a fight's outcome untold twice in three runs.
