# Fixes after session 2 — stages A and B (turns, cost, the DM's core)

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch `claude/fix-s2-ab` from `origin/claude/session-2-prep`
(tip `d74b6c6`). If `origin/claude/stage-fix-turn-lease` exists (a local session wrote a lease-renewal fix there), review
it and merge it first; otherwise do A1 yourself. One session, nothing in parallel. Work unattended in the order below,
commit and push after each part, keep `docs/runs/fix-s2-ab-progress.md` current; anything that needs the owner goes to
«Needs the owner» in the report (`docs/runs/fix-s2-ab-report.md`). Report in English.

Hard rules: never `main`; keys only in `.env.local`, never printed or logged; the environment variable is
`APP_ANTHROPIC_API_KEY`, never `ANTHROPIC_API_KEY`; never touch the owner's real database or port 3000; never edit an
applied migration — new migrations only; the repo is public — no campaign dialogue, no passages from the owner's voice
bank, no session transcripts in git, fixtures and probes synthetic; live paid calls within **$30** for the whole stage,
stopped by a guard, every call in a ledger (`docs/runs/fix-s2-ab-ledger.md`); ask (in the report) before anything
destructive.

Inputs: `docs/runs/session2-owner-notes.md` (on `claude/handoff`: the owner's verdict, key findings 1 and 2, items
1–85 — read it whole), `docs/stages/FIX_S2_PLAN.md`. The session 2 report itself is private on the owner's PC; its
numbers that matter are quoted in the notes (items 83–85 and «Other headline findings»).

## Why

Session 2 (70 turn attempts, 8.8 hours) was the best play so far — the owner: «огромный шаг вперёд» — and it showed
three things to fix before the next session:
1. **Turns were lost and cost three times session 1** — $48 for the DM against $15: 59% of it is input paid at the full
   rate because the context tail after the last cache breakpoint is re-sent on every request, and a turn now makes two
   requests on average (item 83). Four turns were lost: three hit the output cap (item 73), one the 300-second lease
   (item 58).
2. **The DM has no hidden layer** (key finding 2). Campaign creation forbids it outright, nothing gives it one, so a
   strong improviser produced an honest, coherent, down-to-earth story with no mystery and no wonder — the owner's main
   complaint (item 82). The private-facts layer meanwhile overflowed its budget and silently dropped facts (item 85).
3. **The voice and a handful of rules** — the English core instructions and the humour recipe (key finding 1),
   closing maxims, repeated gestures, deciding for the hero, untold strikes, the hidden DC, the doubled modifier.

## Stage A — turns never lost, cheaper, faster

### A1. The lease and the output cap
- The 300-second turn lease (`rpg_runtime`, never renewed) expired on a finished 5-minute turn and the commit threw
  `rpg_conflict`; the turn stayed «generating» and both resume and cancel answered 422 (item 58). Renew the lease while a
  turn streams (a heartbeat well inside the window); a commit after an expired lease that no one else took still
  commits; cancel works on a stuck turn; resume works on a failed retryable turn.
- `dmLoopLimits.maxOutputTokens` 6000 → **32000** (owner: «до предела»; at ~95 tokens/s a 5-minute lease ends near
  28k, so higher is unusable). Update `tests/stage4-dossier.test.mjs`.
- On `stop: max_tokens` with a cut tool call: drop the incomplete tool call, add the wrap-up message and continue once,
  instead of sending the broken message to the provider (items 56, 73 — today the next request fails as «provider»).
- A failed turn tells the player plainly that nothing changed in the game and offers to resend the same move; the draft
  stays (item 73 follow-up — the owner believed a failed long rest had happened).

### A2. Cost — the cache
Today: no breakpoint after the history (polish 2 §4 removed it to stop paying cache writes), so the session tail, the
«now» block and the turn's own messages (~40k tokens a request, growing) are paid at $4/M on every request, twice a turn
on average. Rebuild the layout so the prefix only grows: stable layers, then the append-only history with a breakpoint
at its end, then the volatile blocks; and a breakpoint inside the turn so a continuation (after a tool result) reads
everything before it from the cache. Respect the provider's four-breakpoint limit; keep the one-hour TTL where the
owner's pauses exceed five minutes. Measure on the synthetic long campaign (40+ turns) before and after: cost per turn at
high, cache read share, uncached input per request. Target: **≤ $0.45 per turn at high** and uncached input per
continuation under 5k tokens. Put the numbers in the report.

### A3. Speed — depth and requests
- **xhigh only for an important move** (owner's decision): the player's «⚡ важный ход» and a combat climax; the DM's
  «tense» hint alone stays at the range's base. Default range for new campaigns «высокая — высокая» with the button
  shown.
- **One request per round where the tools allow**: today each roll is its own request (the mine fight turn made 10
  requests of ~130k tokens). Let the DM make several independent rolls in one message (the server resolves them in
  order and returns all results); a player-interactive roll still pauses.
- **Polling**: the open game screen polled `/play` 231 times in 13 minutes at 3–5 s of server time each, and
  `dossier?view=digest` about once a second at the session end (items 62, 75, 81). Back off while a turn streams, stop
  when the tab is hidden, and make `/play` cheap (no heavy recompute per poll). Fix the `MaxListenersExceededWarning`
  on Gzip drain listeners if it is ours.
- **Party council** (item 75): one line to a companion ran a full DM turn (129k input, high, 48 s, $0.30). Make it a
  light call — the companion's model, the scene and the last exchanges; depth low/medium; streamed; tools only for notes
  and time; the hero is never offered as a listener.

### A4. The digest
`scheduleDigest` has no in-flight guard and `readPlay` starts an entry digest whenever the session has none, so one
«Закончить сессию» paid two digests ($1.06 + $0.48) and the card showed twice (item 81); in another campaign a failing
digest was retried on every entry, three at a time (item 17, $4.43). Add the guard; no entry digest while an end digest
runs or after one failed (the «Повторить» button stays); the card shows once. The digest asks for 6000 output tokens —
check whether «unparsed» digests were cut by the cap (thinking counts against it) and give it room.

### A5. Logging that the session needed
Log the returned status of every `pictures.frame` request (queued / existing / cap / no_text / waiting / off) — frames
stopped after 20:48 with the daily cap not reached and nothing in the log said why (items 77, 83); log every dossier
entry dropped by a budget with its layer (item 85); log the bootstrap's provider attempt and refusal reason (item 16).

## Stage B — the DM's core

### B1. The hidden layer (key finding 2, items 82, 84)
- Remove from `bootstrapInstructions` (`src/lib/server/adventure-bootstrap-provider.ts`) the ban on secret histories, a
  culprit, a twist or a hidden explanation. The opening the player sees stays public and grounded in records; the hidden
  part goes to the DM only.
- **DM prep before the first session** (and once, on the next session start, for an existing campaign that has no
  hidden layer): a private call writes the campaign's hidden layer into the private notes under a reserved key that is
  never budget-dropped — the bigger truth behind the first case, the factions' hidden aims, 5–10 secrets not tied to
  places, two or three clocks, one wondrous thread (magic with a history and an open question). Grounded in the world
  text and the canon; never shown to the player; the owner sees it only if he opts in.
- An owner field **«Тайны (видит только ведущий)»** on the world and on the campaign: text the owner writes himself (as
  in his chat campaigns). The prep builds on it when present.
- The session digest updates the layer (what moved, which clues were found, clocks advanced) together with its notebook.
- **The mystery-and-wonder rule** goes into the DM's instructions (not only the owner's guide): one hidden truth per
  arc, larger than the visible case, clues in several places, each answer opening a deeper question, no character
  explaining the whole picture; at least once a session magic with a history and an open question (an item with a
  strange sign and unknown properties, a ritual mark, a cipher, an old seal where it should not be); loot by the 5e
  treasure guidance for the challenge — «rare magic items» means rare in shops, not in hoards. The owner's Russian
  wording is in the notes (item 82); use it in the Russian instructions (B4).
- Check: the polish-stage craft cards («three clues per mystery», «open questions stay open» — `rpg_private.dm_craft_seed`,
  migration 60) — are they active by default for a new campaign? If they are still pending versions, make the approved
  ones active.

### B2. Memory hygiene (item 85)
The private facts are cut by `withinBudget` in storage order (3500 tokens; the session reached 17k) and `query_state`
cannot fetch them. Do: (1) priority — the hidden layer, open threads, clocks, debts and promises first; closed scene notes
last, newest first; (2) consolidation — at a fight's end and in the digest, closed per-round and setup notes fold into one
line each (a cheap background call, off the turn's path); (3) a lookup — `query_state` (or a new `recall`) searches the
archived facts by name or keyword; (4) a memory gauge in the owner panel and a log line per drop. Owner corrections given
out of game (the DC rule, the style rules) become owner-pinned facts — the DM's own «likes» rewrite dropped the DC rule at
turn 56 (item 71).

### B3. The session's rules (server checks where a check is possible)
- **DC visible** for the hero's checks by default, and the toggle reachable under «Логика мира» (items 39, 71).
- **The hero's will** (item 67): a companion objecting to an order says his reason aloud and the turn ends on it; the
  narration never accepts, changes or replaces the hero's declared action or its manner; the DM never writes the hero's
  lines (report §16). A question to the hero ends the turn (51). No time or resource spent without the player (50).
- **Every roll told** (60, report §14): a server check after the narration — a hero roll or a damage roll with no
  matching sentence in the narration (outside the out-of-game note) gets one continuation asking to tell it.
- **Doubled modifier** (66): `roll` refuses (or strips with a hint) a formula modifier when `skill` or a sheet field is
  passed; the card shows every addend.
- **Damage per attack**: each ray, arrow and strike rolls its own damage (Scorching Ray was rolled 6d6 at once).
- **Distances in feet** in rules and notes; paces only as «about three feet» (70).
- **Private plans' specifics** (hours, places) never appear before the hero could know them (41); out-of-game notes
  never state what an enemy saw, knows or has left (report §6).
- **Names**: a person returning after a long absence comes with an anchor (68); a person's name is never used as a
  place (72) — a check against the codex.
- **`rest`** restores every rest-based resource in one call (both short rests restored nothing); the DM uses it instead
  of per-counter `resource` calls (73, report §20).
- **«Твой момент»** never fired in 66 turns — find out why and fix or remove.
- **The owner's rule decisions (23:19)** as campaign rule settings with these defaults, reflected in the `roll` tool and
  the instructions: natural 20 on an ability check or save is an automatic success and natural 1 an automatic failure
  (BG3), with no extra harm, death saves unchanged — the server decides success accordingly and the tool's hint no longer
  tells the DM otherwise; drinking a potion is a bonus action; Heroic Inspiration — the DM grants it for strong play
  (`finish_turn` or a `resource`), one at a time, shown on the hero panel, spent to reroll any of the hero's own dice —
  alongside the preset's two rerolls a session.

### B4. The voice (key finding 1, items 38, 47, 69, 72)
- Delete the humour recipe from `VOICE_LAYER_RU` (`dm-loop/voice.ts`); the owner's rule stands: no quips on someone
  else's word, a joke at most once a scene and from character.
- Closing lines: a speech ends on the thought, not on a maxim; no parallel two-part aphorisms; deductions and motives
  said as reason → consequence with every link; a companion does not restate what the scene just showed.
- A companion's signature gesture or word at most once a scene (the sergeant's strap: 40 times in 33 turns).
- **Native Russian instructions**: the core role and doctrine are English with a Russian voice layer, so the Russian
  reads like a translation (key finding 1). Write the Russian version of the role, the doctrine and the rules from this
  stage, as a campaign setting «Инструкции ведущего: русские / английские». Measure both on the probe scenes (paid, within
  the cap): the quotable-check flags, calques, closing maxims, repeated gestures per companion — and tool reliability
  (records, rolls, finish_turn) so the switch costs nothing in bookkeeping. Default to Russian only if records hold.

## Probes (synthetic, in the repo)
Add probe scenes for: a companion objecting to an order; companions reacting to a letter everyone read; an
interrogation where the player asks «is it a conspiracy?»; a lair search after a fight (loot); a long rest after a
heavy night (bookkeeping, one `rest`); a mine-style fight with several rolls in one round (requests per turn); a fresh
campaign's prep (the hidden layer exists, clues appear, the truth is not said). Each with its pass rule.

## Done when
The full suite is green; the probes pass; the report has the cost per turn before/after, requests per turn, the voice
metrics for both instruction languages, the money spent, and «Needs the owner». Then the owner's local session loads the
branch into the sandbox and replays the session 2 heavy turns (a separate local prompt) before the next play session.
