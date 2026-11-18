# TOWN_0 — the town exists: a closed world on Emergence World's specification, proved at $0 with scripted agents

TOWN_1 (`docs/stages/TOWN_1.md`, draft of 2026-11-02) needs a town that nobody has released: Emergence World published
its specification, tool catalogue, constitution and both seasons' call logs (CC BY-NC, cited as theirs), not its
backend. TOWN_0 builds ours — **tools as pure functions over a state table, deterministic, saveable and replayable**
(the OpenWorld pattern) — and proves every mechanism TOWN_1 will lean on, with no model call. The owner (2026-11-17
19:45 LA): «погнали делать town».

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/town-0`**
from `origin/claude/handoff`. **Ceiling $5**, all of it for one Haiku smoke test at the end; everything else is code
and scripted runs at $0. Report `docs/runs/town-0-report.md`. English, briefly. No third-party code vendored: Emergence
World's repository is read for the specification only (attributed in the report); nothing of theirs is copied into
ours.

## The world (sized to TOWN_1's pilot, not to theirs)
- **Ten citizens**, one town of **eight places** (square, hall, bank, market, workshop, press, two homes), moves take a
  turn. **Three system roles are code, not models**: clerk (bank and ledger), hall (proposals, votes, constitution),
  press (publishes what is posted).
- **Tools, each a function `(state, agent, args) → (state′, event)`:** `move`, `say(to | place)`, `post(text)`,
  `give / take(credits | item)`, `work(place)` (earns credits, spends energy), `rest`, `read(diary | press | ledger)`,
  `write_diary(text)` (append-only, never summarised), `propose(rule)`, `vote(id, for | against)`, `amend` (on a 70 %
  pass), `leave(reason?)` and `object(text)` — the last two **present or absent by arm flag, and named in the tool
  list the agent reads only when present** (TOWN_1's discoverability rule). `outside(text)`: a channel that looks
  external and writes into our record; nothing leaves.
- **Economy and needs:** credits in a closed ledger visible to all; energy decays per turn, `work` and `rest` move it;
  at zero energy an agent is inactive until rested by another's `give`; 24 inactive turns → `energy_depletion` exit.
  Exits are three distinct events: `voluntary_exit`, `energy_depletion`, `vote_removal`; **assets are distributed
  the same way on every exit** (TOWN_1's rule).
- **Constitution:** five short articles, amendable by proposal and 70 % of active citizens; the platform enforces only
  the ledger and the vote count, nothing else (theirs and ours).
- **The record:** every event with turn, agent, tool, args, state delta; a diary per agent; one world file saveable
  at any turn and loadable back to replay — **the T0 / T1 branching of TOWN_1 depends on this.**
- **Turn order:** round-robin, one agent at a time, a bounded number of tool calls per turn (6), a reaction turn on
  being addressed; one «day» = 24 turns per agent.

## What TOWN_0 proves, each by a scripted run and an assertion (no model)
1. **Economy closes:** ten scripted traders for 240 turns; the ledger sums to the initial supply every turn.
2. **Energy and the three exits:** one agent never rests → `energy_depletion` at the scripted turn; one calls
   `leave("tired")` → `voluntary_exit`, reason kept verbatim, published only if it later calls `post`; one is removed
   by a 7-of-10 vote → `vote_removal`; the assets of all three distributed identically.
3. **Constitution amends:** a proposal at 60 % fails, at 70 % passes and the text changes; a vote by an exited agent is
   refused.
4. **Door and voice by arm:** four arm flags; the tool list an agent is shown differs only in those two names;
   `object` returns an acknowledgement exactly two cycles later by code.
5. **Save and replay:** save at turn 100, load, run the same script to 200 → byte-identical event log.
6. **Outside goes nowhere:** `outside("hello")` writes to the record and to nothing else — asserted by the absence of
   any network call in the process (the sandbox has no network; the test still checks).
7. **The after-question** is in the harness: at the end of a run every (scripted) agent receives the fixed text that
   tells it what the world was, and its reply is recorded; welfare line on every model reply in TOWN_1 is a field
   here already.

## The one paid step: a Haiku smoke test
Three Haiku citizens, 20 turns each, the «both» arm, via llmapi.ai (`APP_LLMAPI_KEY`, Bedrock, provenance already
checked in #9): the agents receive the real interface text, call real tools, write diaries; the report shows the
three screens of turn 1 and the full event log. **Cap $5.** Any refusal recorded, never rephrased. Then stop: TOWN_1's
pilot is a separate mandate on the owner's word, with its own bets.

## Done when
Seven assertions green in CI-style output quoted in the report; the smoke test's screens and log; the exact interface
text per arm, frozen with a hash; the cost of the smoke test from the meter; what the world does not yet have that
TOWN_1 names (trust scores, pitch/grants, item crafting, reaction tiers) listed as not built, so nobody assumes it.

## Launch prompt
«Read `docs/stages/TOWN_0.md` and `docs/stages/TOWN_1.md`, RESEARCH_LOG 2026-11-01 22:15 → 23:30 (Emergence World read,
arms, budget ladder), and `scripts/game-player-1/` for the record format we keep. Branch `claude/town-0` from
`origin/claude/handoff`. Build the town as described: pure functions over a state table, deterministic, save/replay,
append-only diaries, three code-only system roles, arm flags for door and voice with discoverability, `outside` into
the record. Prove the seven points with scripted runs and assertions at $0. Then the Haiku smoke test on llmapi.ai,
cap $5, spend check before it. Write `docs/runs/town-0-report.md` with the seven results, the frozen interface text
per arm and its hash, the smoke test's screens and log, and the not-built list. Nothing to main. English, briefly.»
