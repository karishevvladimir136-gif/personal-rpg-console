# Polish 2 — owner report (2026-10-17)

Branch `claude/polish-2` from `origin/claude/polish` (b740161) with `origin/claude/picture-models` (1b60abb) merged
first. Spec: `docs/stages/POLISH_2.md` (on `origin/claude/handoff`). Everything below is on `claude/polish-2`; nothing
went to `main`. Resume notes: `docs/runs/polish2-progress.md`. The parallel `claude/dm-arch` files were never touched.

## In one paragraph

The six parts are done in the file's order, each proved by its own test file (`tests/polish2-*.test.mjs`, 27 tests)
plus the older suites updated. The pictures now draw on GPT Image 2.5 by your blind picks (Sunburst for anchors, key
frames and redraws, Flare for live frames with Sunburst as the fallback), with a model per tier in the settings. A shot
director writes a visual brief from the whole turn (Claude Sonnet 5.5) with visual profiles of people and places the
owner can edit, and «Перерисовать» takes a comment — the proof on the eight bake-off shots says the judges prefer
today's one-clause shot on their own yardstick, so the brief ships behind a switch (on) and your blind page decides.
The conversation's history is an append-only cached block: cache writes fell from 46–74% of the DM's cost to **8%** on
the 20-turn Russian replay (writes 19 700 → 2 550 tokens a turn), the cost per turn from $0.183 to $0.170 median and
the run from $4.25 to $3.99 — a modest saving, because the money now goes to the DM's output (55%) and the uncached
tail (34%), not to the cache. The opening is written by the campaign's DM (Opus) whichever provider serves it. Seven of
the nine small follow-ups are done; the wizard's debt and the `lore` record are not (reasons below). Checks: typecheck
pass, lint pass with zero warnings, build pass, the fake bench green on all 21 scenarios, 48 + 16 screenshots with zero
overflow or clipping, the full suite below. Paid: **$3.09** of the $10 picture cap and **$3.99** of the $15 turn-loop cap.

## What changed, part by part, and how it is proved

**1 · Merge.** `claude/picture-models` merged into the polish branch cleanly (the two sides changed different hunks of
`pictures-service.ts`: the live-turn status filter and the prompt compiler). The full suite on the merge commit, on a
clean worktree pinned to it: **2557 tests, 2530 pass, 27 skipped, 0 fail** (1849 s). Typecheck and lint pass.

**2 · GPT Image 2.5 in the app** (`docs/stages/STAGE_V.md` §9, migration 64). `modelForTier(tier, settings)`: the quality
tier (anchors, key frames, «Перерисовать») draws on **GPT Image 2.5 Sunburst**, the fast tier (live and committed frames)
on **GPT Image 2.5 Flare**; the settings screen offers the whole catalogue of both providers per tier (label, the
bake-off's median seconds, the price), so FLUX stays available, off by default. The picture job calls OpenAI's images
API with the server's key — the same key check, price ledger (the exact usage of each reply) and daily cap — at the
bake-off's sizes (frames 1344×768). The refusal ladder: one softened re-submit, then Flare hands the picture to Sunburst
(FLUX.2 [pro] still hands to [klein]). The full-figure anchor lists the carried items as their own constraint («worn on
the body, slung or hung from the belt, not held in the hands; both hands empty»). The world clock reaches the frame
prompt through a side-effect-free read of the play (no digest). Proof: `tests/polish2-pictures.test.mjs` (7).

**3 · The shot director** (§10, migration 65). A visual brief from the **whole turn's narration** — not the first
paragraph — with the visual profiles, the records' state (worn items, conditions), the clock and the previous frame's
brief: the most visual beat, composition, each person's pose, expression, what they hold, clothes and state, the place's
materials, light and layout, time and weather, palette, camera, continuity, what must not appear; the compiler adapts it
per model family (GPT Image whole, FLUX the short form). A live frame's row is created at once from the first paragraph's
shot (the board shows «рисуется»), the director waits for the narration to end, writes the brief and replaces the
prompt before the paid picture; when the model fails or times out, today's shot draws. The brief is stored with the
picture, never shown to the player. **Visual profiles** of named people and places (a full look; append-only versions)
are drafted once by Sonnet from the records and the ready anchors (as images), editable on the person's or place's
card (the party, character, holdings and map cards; «Составить» drafts, «Сохранить профиль» keeps your text, which
always wins), appended to when the story changes a look (a wound, a borrowed shirt — each change removable), and fed
into every brief and anchor prompt. **«Перерисовать» takes one line** («сделай ночь», «он без шлема»): the brief folds
it in and the request goes as an edit of the previous frame — «change only this; keep everything else». Proof:
`tests/polish2-director.test.mjs` (6) and the live proof below.

**4 · The cache** (`docs/TURN_LOOP.md` §19, `docs/SPEED.md` §8). The public scene rows (the player's lines, the
narration, the notes, the opening) travel as one system block each between the world and the living dossier, cached
for an hour with the breakpoint on the last block: a committed turn never changes, so the provider finds the prefix up
to the previous turn at the block boundaries and writes only the new rows. The window is item 8's budget (45 000 tokens
— about 20 turns verbatim, where the old «now» block held 8) and slides in buckets of sixteen rows, so the history is
rewritten once in about eight turns, not every turn. The living dossier follows at the 5-minute rate; «now» keeps the
state, the counters, the retrieved rows the window does not quote, the voice reminder; no top-level breakpoint, so
nothing after the living dossier is written for a continuation that mostly never comes. The bench records the 1-hour
split and takes `--max-steps`. Proof: `tests/polish2-cache.test.mjs` (2), the layout test of polish group 3 rewritten,
the fake bench, and the live replay below.

**5 · The opening by the campaign's DM** (§20, migration 66). The registry and the SQL ticket admit the DM's Anthropic
model for `world.compose`; `opening.propose` resolves from the campaign's DM choice first (it outranks the policy's
primary); an Anthropic structured requester sends the same instructions, input and schema through the Messages API
(`output_config.format`; the bounds the grammar does not take are removed and enforced by the validator afterwards) and
keeps the model contract (the reply's model must be the ticket's); the instructions ask for the campaign language and
an ending on the situation the hero faces. Proof: `tests/polish2-opening.test.mjs` (5: the registry, the schema, the
requester, the provider, the SQL flow creation → opening on the Anthropic profile).

**6 · The small follow-ups** (§21, migration 67). Done: the DM-drafted combat profile on demand (a button in the
combat-readiness review; Sonnet proposes HP, attack, defense, skill and a weapon from the approved possessions, you
approve as before); the first adventure goes straight into the opening review (one click); quest texts link the named
things they mention to their codex entries («Сельдь», «Марте», «Кабак Марты», by name stems; the codex opens the right
tab); «Визуальная библия» and «Галерея» are one **«Картинки»** page (people, places, things, frames; pick one to redraw
or edit its profile; the old addresses open it); **the drawn atlas is back** («Создать карту» on the map: a Stage V
`atlas` picture of the level's area on Sunburst, the places drawn where the layout puts them, no text on the picture,
shown as the map's background); the «Что, если» entry names its start point in words and shows the cost line before the
paid button; the hero's equipment slots are backfilled for existing records; the shot director's switch. Proof:
`tests/polish2-followups.test.mjs` (4). Not done: see «Needs the owner».

## The picture proof (part 3): today's shot against the brief

The eight bake-off shots, today's one-clause shot (the compiled prompt of the bake-off) against the brief written by
Sonnet from a synthetic whole-turn Russian narration of each scene (`scripts/eval/pictures/narration.mjs`), on Sunburst
and Flare, two samples each, with the hero's two anchors as references. The bake-off's judges: Claude Haiku 5.5 per
picture against the shot's own description, Claude Sonnet 5.5 for likeness side by side. Records
`docs/runs/pictures-brief-*.json`; the blind page `docs/samples/pictures-brief/` (8 files, four variants per shot under
shuffled letters, both samples, the narration included; the bake-off's JSON shape).

| Model | Prompt | Frames | Refused | Median s | $/image | Adherence | Likeness side by side | Clothing kept | People count right | No text | Anatomy ok |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT Image 2.5 Sunburst | shot | 16 | 0 | 30.1 | $0.045 | 8.06 | 7.42 | 4/4 | 12/16 | 16/16 | 15/16 |
| GPT Image 2.5 Sunburst | brief | 14 | 2 | 30.4 | $0.048 | 7.21 | 5.90 | 3/4 | 8/14 | 14/14 | 13/14 |
| GPT Image 2.5 Flare | shot | 16 | 0 | 16.4 | $0.045 | 8.13 | 7.25 | 4/4 | 16/16 | 16/16 | 16/16 |
| GPT Image 2.5 Flare | brief | 13 | 3 | 16.0 | $0.048 | 7.23 | 5.89 | 4/4 | 6/13 | 13/13 | 13/13 |

The briefs: eight, 158–205 words (median 188 — above the 80–160 asked; the model does not count well at low effort and
a second, tighter prompt did not change that), 5.7 s median, $0.010 each; none of them chose the first sentence as the
beat; two of them recorded a change to the hero's look (the resin-smeared cut, the torn shirt), as designed.

**What the numbers say.** On the judges' yardstick — which is the shot's own description — the shot wins: adherence
8.1 against 7.2, likeness 7.3–7.4 against 5.9, the people count right in 28 of 32 against 14 of 27. Three reasons, all
visible in the pictures: the brief composes a fuller scene (the hero seen over the shoulder through the floorboards,
a crowd in the tavern), so the judge counts extra people and the hero's face is smaller; the brief says the wound
plainly («a long cut smeared with dark pine tar», «tears his shirt into strips»), and OpenAI's moderation refused five
brief frames (t4 on both models, t5 on Flare) where the shot's milder clause passed — in the app the ladder (softened
re-submit, then Sunburst) would have caught these, the proof measures first answers; and a 190-word brief leaves the
model more room to drift from the one line the judge expects. Latency and price are the same. **My reading:** the brief
is the better *scene* and the worse *match to a one-line description*; the owner's blind page is the real test, so the
director ships on, with a switch in the picture settings to draw from the shot alone. Not measured: continuity across
turns (the brief's previous-frame context) and the profile drift over a session — those need a played session.

## The cache numbers (part 4): before and after on the 20-turn Russian replay

Before: the polish run's replay 2 (`docs/runs/polish-20261017-041509-loop-opus-live-ru-replay.jsonl`, the same scenario
on the same model and effort, its first 20 turns — the polish branch is this branch's parent, so the run stands as the
baseline and was not repeated). After: `docs/runs/polish2-20261017-184438-loop-opus-live-ru-replay.jsonl`, 20 turns,
Opus 5.5 high, 1226 s.

| | Before (polish, 20 turns) | After (polish 2, 20 turns) |
| --- | --- | --- |
| Cache writes, tokens per turn | 19 698 | **2 554** (of which 889 at the 1-hour rate) |
| Cache writes as a share of the DM's cost | 46–74% (the 5m/1h split was not recorded) | **8%** ($0.31 of $3.99) |
| Cache read share of the input | 75% | 74% |
| Cost of the 20 turns | $4.25 | **$3.99** |
| Cost per turn, median / max | $0.183 / $0.529 | **$0.170** / $0.399 |
| Where the money goes | writes ≈ $2, output ≈ $2 | output $2.26 (57%), uncached input $1.32 (33%), writes $0.31 (8%), reads $0.20 (5%) |
| First word from the player's send, median / p75 / max | 16.4 s / 26.9 s / 52.8 s | 21.8 s / 30.8 s / 51.3 s |
| Model requests | 34 | 32 |
| Checks | 44/48 (23 turns) | 37/40: the three misses are time words («утро» at 00:00, «день» at 18:00 — s12, s14, s17), the same class as the polish run's, not the cache |

The target (writes under 25%) is met with room. The saving in dollars is modest because the writes were mostly the
0.25× premium on text that is still sent once a turn: the session tail, the state and the turn's own messages now travel
at the plain rate (33%) and the recent scenes (now about 20 turns verbatim instead of 8) are read from the cache for
almost nothing. The lever that remains is the DM's output — 113 000 tokens over 20 turns, mostly bookkeeping — which is
the `claude/dm-arch` session's question. The first word did not improve: the two runs tell different stories (the turn
with the longest first word in each was a fight), and the median sits in the range the polish run measured (16–23 s);
the cached history makes the prompt longer but cached, which the measurement cannot separate from the story.

## Money spent

| Run | Record | Spent |
| --- | --- | --- |
| Part 3 briefs (Claude Sonnet 5.5, two runs of eight; the second after the prompt was tightened) | `docs/runs/pictures-brief-briefs.json` | $0.16 |
| Part 3 proof frames: 64 asked, 59 drawn, 5 refused (GPT Image 2.5 Sunburst $1.40, Flare $1.35) | `docs/runs/pictures-brief-results.json` | $2.75 |
| Part 3 judges (Haiku per picture $0.05, Sonnet side by side $0.14) | the ledger | $0.19 |
| **Pictures total** | `docs/runs/pictures-brief-ledger.json` | **$3.09 of $10** |
| Part 4 live replay, 20 turns, Opus 5.5 high (budget $6) | `docs/runs/polish2-20261017-184438-loop-opus-live-ru-replay.jsonl` | **$3.99 of $15** |

No other paid call was made (the fake bench, the screenshots and the suites are free). Every paid request is in the
records above with its usage and cost.

## Final checks (the final code)

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass, zero warnings |
| `pnpm build` | pass |
| Full suite on the merge commit (part 1, clean worktree, Node 24, `--test-concurrency=2`) | 2557 tests · 2530 pass · 27 skipped · 0 fail |
| Full suite on the final code (Node 24, `--test-concurrency=2`) | FINAL_SUITE_RESULT |
| Fake bench, loop runtime (`--runtime dm-loop-v1 --scenario all`, 21 scenarios) | all pass (the known weakness W2 of scenario 08 stays open as the bench expects) |
| Screenshots (`stage5-screenshots.mjs`, `stage-v-screenshots.mjs` on an isolated server on 3105 without `.env.local`) | 48 + 16 shots, desktop and phone, zero horizontal overflow, zero clipping (`docs/screens/stage-5/index.json`, `docs/screens/stage-v/index.json`) |
| Live replay (part 4) | 20 turns, 37/40 checks (above) |
| Picture proof (part 3) | 59 frames, judged, blind page built (above) |

## What to click

- **Settings → Картинки**: the model per tier (Sunburst / Flare by default), the «Режиссёр кадра» switch, the keys' badges.
- **Any person's or place's card** (party, character, map): «Визуальный профиль» — «Составить», edit, «Сохранить профиль».
- **The game screen's frame panel**: type one line next to «Перерисовать» and press it.
- **The map**: «Создать карту» draws the atlas of the level; it becomes the background.
- **The new «Картинки» page** in the side menu (the old «Галерея» and «Визуальная библия» open it too).
- **The combat-readiness review** (first fight): «Пусть ведущий предложит по описанию героя».
- **A new campaign**: the first adventure saves in one click and goes to the opening review; the opening is written by
  the campaign's DM (Opus) now.
- **The blind page**: `docs/samples/pictures-brief/` — the planner builds it as before from the JSON (four variants per
  shot: two models × two prompts, both samples each).

## Needs the owner

1. **The brief or the shot.** The judges prefer the shot on their own yardstick; the brief draws the fuller scene. Judge
   the blind page (`docs/samples/pictures-brief/`); the «Режиссёр кадра» switch in the picture settings turns the brief
   off at any time. If the brief stays, two things to decide after a played session: whether the live frame should wait
   for the whole narration (today: yes, by the spec — the picture arrives about 20 s after the text ends) or draw at once
   from the first paragraph and redraw from the brief at commit; and whether to soften the wound words in briefs
   automatically (the ladder already re-submits softened, then Sunburst).
2. **The wizard's debt as a journal debt** («должен сорок монет Марте») is not done: the wizard's creation contract
   (the OpenAI strict schema, the review, the SQL commit that creates the records) would have to carry debts and create
   the creditor as an unmet person; a rule on the text cannot name Марта from «Марте» reliably. The DM records the debt
   on the first turn today (the replay shows «Сорок монет Марте» as a journal debt on turn 1–2). Say if you want the
   contract change; it is a bounded stage of its own.
3. **The public `lore` record** for the codex's «Мир» tab is not done: a new record family (table, projection, a DM tool,
   the codex tab, privacy rules) — larger than a follow-up. Today the tab shows the canon documents.
4. **The opening's wording** on Opus: the instructions ask for the campaign language and an ending on a situation; the
   Russian voice layer applies once the voice stage turns it on. Try one new campaign and read the opening.
5. **The `pictures` profile drafts** run when an anchor becomes ready and cost about a cent each (Sonnet with the
   pictures as input); they are not counted in the daily picture cost gauge (the gauge counts pictures). Logged as
   `profile_drafted` in the server log with their usage.
6. **The three time-word misses** in the replay (s12, s14, s17) are the DM's judgment («утро» at midnight), the same class
   the polish run saw; material for the pending `time-and-clock` craft card, not code.
7. **Session 2.** The branch is ready for the sandbox play; the local session then runs `docs/SESSION_REPORT_PROMPT.md`
   into `C:\dev\rpg-exports\session-2\`.

## Known limits and environment notes

- The first full-suite run after the merge read the part-2 edits live (tests read the sources) and was stopped; the
  clean run went on a worktree pinned to the merge commit (above).
- The proof's judges are models, not you: Haiku against the shot's description (which favours the shot), Sonnet for
  likeness side by side. The blind page is the real test.
- The screenshots overwrite `docs/screens/stage-5` and `docs/screens/stage-v` (the scripts' fixed folders); the previous
  shots stay in git history.
- The brief's length target (80–160 words) is not met by the model (158–205); the prompt accepts it as long as the
  compiled prompt stays under 8 000 characters, which it does.
