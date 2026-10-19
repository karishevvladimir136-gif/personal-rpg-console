# Polish 3 — the writer and the bookkeeper in the app

Cloud session (`docs/CLOUD.md`, environment `rpg-console`). Branch `claude/polish-3` from `origin/claude/polish-2`, with
`origin/claude/dm-arch-bakeoff-zuxey2` merged first. One session, nothing in parallel. Work unattended in this order,
commit and push after each part, keep `docs/runs/polish3-progress.md` current; anything that needs the owner goes to
«Needs the owner» in the report. Never `main`; keys only in `.env.local`, never printed; live paid calls within **$20**,
stopped by a guard, every call in a ledger. Report in English.

Inputs: `docs/runs/dmarch-REPORT.md` (on the bake-off branch — its sections «What broke in the split» and «What moving
the default runtime to C or D would take» are the design notes for this stage) and `docs/runs/polish2-report.md`.

## Why

The bake-off (2026-10-17) measured four DMs on the same eight states. Fable alone is not viable (113 s a turn, $31 a
session, 22 tool calls a turn). The split — a writer that only narrates (with the `roll` tool) and closes with a
private `<ledger>`, then a bookkeeper that records with today's tools — worked in all 25 live turns, the ledger never
leaked and no money or item record was wrong:

| Variant | First word | Text done | Records done | Session (41 turns) | Missed / wrong facts |
| --- | --- | --- | --- | --- | --- |
| A — Opus alone (today) | 24.7 s | 46 s | 46 s | $12 | 8 / 2 of 42 |
| C — Fable writes, Opus records | 26.7 s | 48 s | 84 s | $27 | 4 / 0 of 58 |
| D — Opus writes, Sonnet records | 15.7 s | 34 s | 51 s | $11 | 9 / 0 of 56 |

The blind prose page failed as a test of prose (owner, 2026-10-18: «тексты практически бредовые, только первый
норм»), and the cause is the bench, not the writers: the scenes came from the scripted harbour replay, whose player lines
were written in advance; by turn 5 reference run A's story had diverged (the hero became a struck-off diver, barred from
diving), so «Торгуюсь за цену погружения» and «Ныряю» contradict the world, and all four DMs spend the turn explaining
why not. Only s01, before any divergence, reads like play. The timings, costs and record counts stand; **the writer must
be chosen on the owner's own story** — part 4 builds that. Until then the app needs the split as a real runtime the
owner can choose, not a server flag. Polish 2 also showed that the DM's output (57% of the cost, mostly bookkeeping) is
now the money — which is what the split moves to a cheaper or better-suited model.

## 1. Merge

Merge the bake-off branch into this one. Expected overlaps: the DM model registry (Fable 5.1 and Sonnet 5.5 were
registered there), the `DM_TWO_PASS` flag in `gameplay-service.ts`, the startup-gate test's stub list, and polish 2's
context layout (`context.ts`, the append-only history block). Keep both sides' intent; the full suite green on the merge
commit (clean worktree pinned to it, as polish 2 did).

## 2. The DM architecture as a campaign setting

- **Settings → Ведущий**: three choices, per campaign — «Opus ведёт один» (today's loop), «Fable пишет — Opus
  записывает», «Opus пишет — Sonnet записывает»; under «Подробнее» the writer (Opus 5.5 / Fable 5.1) and the bookkeeper
  (Opus 5.5 / Sonnet 5.5) separately, so any pair is possible. A migration widens migration 52's assert to these models
  in these roles; the settings screen shows each choice with the bake-off's numbers (first word, cost a session) as a
  hint. **Default: today's loop** for existing and new campaigns — the owner switches after the blind page. The server
  flag goes away (or stays only as a test override).
- **Prompt layers** (report §«What moving…»): the writer's role becomes a sibling of the default role in `context.ts`,
  sharing the voice slot, the doctrine, the style and the approved DM Craft cards, and takes polish 2's append-only
  history block exactly as the loop does. The bookkeeper gets its own cached role layer, the dossier layers 3–5 (no
  craft, no canon, no history), this turn's narration and the ledger — small and cache-stable.
- **The ledger**: keep the fixed tag and headings; a server check that it exists (a missing ledger asks the writer once,
  as the loop asks for `finish_turn` today); clip at a budget; private — it goes into the bookkeeper's brief and the
  turn's checkpoint, never into the scenes, the player's chips or the export's public text.
- **Depth**: the depth rule (high … xhigh) applies to the writer only; a Fable writer is pinned to high (xhigh is where
  its cost and wait double). The bookkeeper runs at a fixed effort: Opus high, Sonnet high; measure Sonnet at medium in
  part 6 and keep it if the records hold.
- **The game screen**: after the text, a quiet «Ведущий записывает…» state until the commit; the chips arrive with the
  commit. The composer opens as soon as the text ends — the player may type; the send is held until the commit and goes
  at once when it lands (no two-commit turn).
- **Resume and failure**: one checkpoint with a marker where the bookkeeper's conversation starts; a failure during
  bookkeeping resumes the bookkeeper only; a retryable transport failure of the writer's continuation after a dice pause
  is retried before the turn fails. A refusal or an empty narration fails the turn as today.
- **Other consumers of the turn**: the shot director starts at the end of the writer's text (not after the bookkeeper),
  with the ledger as context for clothes, wounds and items — so the frame is not held back by the records. The opening
  is written by the campaign's writer model. Cost gauges and the session export count both models.

## 3. Bookkeeping fixes (both runtimes)

- **Every rejected record call is retried once** with the server's reason, and the bookkeeper's brief (and today's
  loop's tool guidance) names the schemas' exact field names — the bake-off's misses: `details` on `upsert_character`,
  a faction that does not exist, a clock value as text, reward terms on a thread, `note_world` without
  `kind/key/operation`.
- **`move_party` resolves every place ID the state lists**: the bake-off's A s27 and C s28 offered the same ID
  (`db431570-…`) and the tool rejected it, so the party never moved and the time call fell with it. Reproduce on that
  state (likely a place of polish group 9's parent/whereabouts kind), fix, and add the regression test.

## 4. Replayable turns: blind tests on the owner's own story

Every future blind test of the DM (the writer choice now, the voice stage's A/B next) must run on the owner's real
states with the line he actually typed, so the move always fits the world.

- **A state snapshot at every committed turn** of a campaign: compact, private, owner-only, never shown to the DM or the
  player; pruned by an owner setting (default: keep all). From session 2 on, every turn can be replayed.
- **`scripts/eval/real-replay/`**: given a campaign, a list of turn numbers and variants (today's loop on Opus, and any
  writer + bookkeeper pair), it restores the snapshot before each turn into an isolated copy (never the live campaign;
  nothing is written back), plays the owner's own line from that turn with each variant (the dice fixed per state, as
  the bake-off did), and writes blind samples in the bake-off's JSON shape — the variant inside the file, the file name
  silent — with the real previous turn's player line and narration as «before» context. A cost line before the paid run
  and a guard. It runs where the campaign lives: the owner's local session runs it against the sandbox; the app's
  server is the only way in, with the same keys rule.
- **Session 1**: if its states before each turn can be rebuilt from the record history, make that possible and say how
  faithful it is; if not, say so — session 2 is then the material.
- Proof: tests on a synthetic campaign (snapshot at commit, restore into a copy, the copy isolated from the live
  campaign, the samples' shape), and one paid smoke run of two turns × two variants on a synthetic campaign.

## 5. Pictures by the owner's second blind page (2026-10-18)

One line against the shot director, on Sunburst and Flare, seven scenes: best — one line 4, director 3; Sunburst 5,
Flare 2. The director does not win and costs time (it waits for the whole narration, the frame comes about 20 s after
the text, more refusals and extra people). So: **the director's switch off by default** (kept in the settings; the visual
profiles still feed the one-line shot and the anchors), and **live frames on Sunburst** by default as well (the owner
picked Sunburst in 11 of 16 scenes over both pages; same price, about 30 s instead of 16, and the frame starts from the
first paragraph while the player reads). Flare stays the fast choice in the settings.

## 6. Proof

- Tests: the setting and its migration, the writer's and bookkeeper's layers (the history block on the writer only; the
  approved craft cards on the writer), the ledger check and clip, the held send, the bookkeeper-only resume, the retry
  of a rejected call, `move_party` on the listed place.
- **Live replay**: polish 2's 20-turn Russian replay, continuous (the bake-off's continuity runs were only 4–5 turns):
  **D for all 20 turns**, then **C for the first 10**. Polish 2's run on today's loop is the baseline (first word 21.8 s
  median, $3.99 for 20 turns, 37/40 checks) — do not repeat it. This run measures speed, cost, continuity and records;
  its prose is not judged (scripted lines, see «Why»). Per turn: first word, text done, records done, held-send
  wait, cost split by model, cache writes and reads per model, checks; the bake-off's Sonnet judge on missed and wrong
  facts per turn. Sonnet bookkeeper at medium on turns 11–20 of D if the first ten are clean.
- **First word after polish 2**: the median rose 16.4 s → 21.8 s, put down to story variance. Split each turn's first
  word in both polish 2 runs and in the new D run into queue, request, uncached input tokens and time to the first token,
  and say whether the longer cached history or the uncached tail costs time; if it does, move what is stable above the
  breakpoint.

## 7. Craft by role and by situation (owner, 2026-10-18 — added while the run was going)

The owner's worry: more rules, drier prose. Today the whole active DM Craft library is in layer 1 on every turn (the
Stage 4 test «layer 1 carries the whole active craft library»), and with the owner's approval below it grows from 11
to 22 entries. Research points the same way (instruction density lowers adherence and favours early instructions;
more constraints make stories less coherent). Do this after the part you are in, before the final checks:

- **First merge `origin/claude/craft-approval`**: migration `202610180090_owner_approves_craft.sql` — the owner approved
  all twelve pending versions (Stage 4's doctrine v3 and five cards, the six polish cards) as new versions with the
  Russian rewritten in plain Russian; «How to run the game» v4 restores the v2 lines v3 had dropped. Its SQL was proved
  on PostgreSQL 16 with all migrations; its JS test updates (polish-group4, mega-dm-storage, mega-dm-character-model,
  the migration list) have **not** been run — run them. Keep its number after your own migrations in the list.
- **Always-on stays short**: layer 1 keeps the core doctrine, the voice slot and the style; the library is no longer
  listed whole. The existing selector (`dm_craft_stage_v2`: at most two cards per stage, by triggers and the public
  signal) decides which cards travel, in the volatile tail (they change per turn and must not break the cached layers).
  Report layer 1's tokens and the cache split before and after.
- **Each role its rules**: a card role — writer, bookkeeper or both — as an additive column (default both), set for the
  22 active keys by their content (records, the clock through tools, private clue and question notes → bookkeeper;
  narration craft → writer; mixed → both). The single loop gets every selected card; in the split the writer gets
  writer + both and the bookkeeper bookkeeper + both, its selection run on the narration and the ledger. The DM Craft
  screen shows the role and lets the owner change it.
- **Code instead of a rule where code can check**: the bench's time-word check runs after each committed turn; a
  mismatch puts one line into the next turn's tail (what was written, what the clock said), nothing otherwise. The same
  pattern for any other rule the server can verify.
- **For the owner's ablation**: part 4's tool takes a craft-set variant per run — none; the set active before
  2026-10-18 (session 1's: core doctrine v2 and its ten cards); all — so the owner judges blind, on his own turns,
  whether the cards cost prose.
- Tests for each; the layer-1 numbers and any change in first word in the report.

## Checks

typecheck, lint, full suites (`--test-concurrency=2`, Node 24), build, fake bench (both runtimes), screenshots with the
overflow check (the settings screen and the «Ведущий записывает…» state, desktop and phone), the live replay above.
Report in English: per part what changed and how it was proved, the replay table against polish 2's baseline, the
first-word breakdown, money spent, «Needs the owner». Then the owner plays session 2 in the sandbox on today's loop (the
clean comparison with session 1), the local session runs `docs/SESSION_REPORT_PROMPT.md` into
`C:\dev\rpg-exports\session-2\`, and runs part 4's tool on eight of session 2's turns for the writer's blind page.
