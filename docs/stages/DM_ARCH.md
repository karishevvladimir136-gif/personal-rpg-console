# DM architecture bake-off — Fable as the DM, and a writer + bookkeeper split

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch `claude/dm-arch` from `origin/claude/polish`. Runs in
parallel with `claude/polish-2`: it adds **new files only** — `src/lib/gameplay/dm-loop/two-pass/**` (the experimental
runtime), `scripts/eval/dm-arch/**`, `docs/samples/dm-arch/`, `docs/runs/` files prefixed `dmarch-` — plus at most a
small, separate commit registering the experimental runtime behind a flag. No change to the default loop, the context
builder or the pictures (polish 2 changes those). Paid calls within **$30**, stopped by a guard, every call in a
ledger. Never `main`; keys only in `.env.local`. Report in English.

## Why

The owner wants to try Claude Fable 5.1 as the DM: on the human-vote creative writing board Claude Fable 5 is #1
(Claude Opus 5 is #1 on EQ-Bench Creative Writing v3). Fable costs 2.5× Opus 5.5 ($10 / $50 per million input / output,
cache write $12.50 / $20 for 5 min / 1 h, read $0.25; Opus 5.5: $4 / $20, write $5 / $8, read $0.20 — confirm on the
Anthropic pricing page first). Session 1 cost $14.56 for the DM on Opus over 41 turns; a straight swap would be about
$36, before the polish run's savings. Speed is unknown — measure it.

The owner's idea: an orchestrator — one model writes, another does the rest. In his chat campaign the model writes the
scene first and updates the registry separately, and it works. Today one model does both in one reply: narration
interleaved with 5–18 bookkeeping tool calls per turn (records, items, money, notes, Character Models, plans), and
most of the output tokens are bookkeeping and thinking, not prose. Splitting may give better prose (the writer only
writes), faster text (no tool calls in the stream; bookkeeping runs while the player reads) and a cost close to Opus
alone even with Fable as the writer.

## The variants (same scenes, same context, same voice — the current one)

- **A** — Opus 5.5, single loop (today's runtime after the polish run), high…xhigh.
- **B** — Fable 5.1, single loop, the same prompts and tools.
- **C** — **Fable 5.1 writer + Opus 5.5 bookkeeper.** The writer gets the full dossier and the player's input, writes the
  whole turn as prose, and keeps only the `roll` tool (interactive dice keep pausing the turn as today). At the end it
  adds a short private ledger in a fixed tag: what changed in plain words (items, money, debts and promises, people
  met, places, time passed, plans set in motion, tension next). The bookkeeper then gets the narration, the ledger, the
  rolls and the state, and makes every record with today's tools (and `finish_turn`). The narration is canon: the
  bookkeeper records, never rewrites. The player sees the text as soon as the writer streams it; the records and chips
  arrive when the bookkeeper finishes.
- **D** — **Opus 5.5 writer + Claude Sonnet 5.5 bookkeeper** — the same split on today's model, to separate the effect of
  the architecture from the effect of the model.

Off-screen planning stays with the bookkeeper in C and D (it sees the plans and their due times in the state, and
records new ones from the ledger); if the writer needs a plan's content to play it, it is in the dossier as today.

## Scenes and measures

The Russian harbour replay of the polish run (`19-polish-ru-replay`) and the eight scenes of the voice plan (session 1
turns 1, 16, 20–21, 23, 24, 34, 37–38, 41), each reached by replaying its preceding inputs once per variant where the
budget allows, otherwise from a saved state at that turn. Per turn and variant:

- **speed** — first word from the player's send, full text done, records done;
- **cost** — writer, bookkeeper, total; projected cost of a 41-turn session;
- **records correctness** — a judge (Claude Sonnet 5.5) compares the records with the narration: items, money, debts,
  people, places, time; count misses, wrong records and rejected calls;
- **craft checks** from the bench — time words against the clock, hero's knowledge, «Твой момент», no leaks;
- **prose** — the owner's blind page: per scene the four narrations under letters (the planner builds it from
  `docs/samples/dm-arch/`, the same JSON shape as the earlier blind samples: scene, input, variants with the text,
  the variant sealed), dialogue judged separately.

## Output

`docs/runs/dmarch-REPORT.md`: the table per variant (speed, cost, projected session cost, records correctness, craft
checks), what broke in the split and how it was handled, a recommendation from the numbers — the owner chooses after
the blind page. If C or D wins, list what moving the default runtime to it would take (prompt layers, the ledger
format, how chips and the interactive roll fit, the cache layout after polish 2).
