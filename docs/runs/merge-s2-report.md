# The merge after session 2 — three branches into the session 3 candidate

Task: `docs/stages/MERGE_S2.md` on `origin/claude/handoff`. A cloud session (`docs/CLOUD.md`, environment `rpg-console`);
the result is **`claude/s3-candidate`**; nothing went to `main`, no owner database was touched. Paid calls: only the
probes below, in `docs/runs/merge-s2-ledger.md` (cap $15).

## In short

The three branches are one branch now, `claude/s3-candidate`: the fixes after session 2 as the base, 2D Live with the
combat screen, and the soundtrack with its ambient layer (the music branch was merged twice — its ambient follow-up
landed while the merge was under way). Conflicts in five files (nine over the three merges), resolved as unions, the
schema bound re-measured; the `combat` tool is the 2D branch's; two things the merged code needed were fixed (the 2D
preview's DM options; the fix run's 13 px text floor carried to the 2D and music screens). The full suite on the frozen candidate: **2 795 tests, 0 fail**; typecheck, zero-warning lint and
the production build pass. Session 3's mode on the merged code: the ford 5/5, the lair 4/5 (stopped by its own guard),
the long rest 1/1 with one `rest`; records complete; the battlefield block reached the writer in every fight turn. Two
things for the owner and the audit: in «Opus пишет — Opus записывает» the attacks are the writer's rolls, so the 2D
rules module is not applied by the server (the writer added cover correctly by hand); and the «every seen roll told»
check does not see `combat attack` cards nor a declared attack that was never rolled — the 2D finding did not recur on
the ford, but the checks would not have caught it. Paid: **$7.07 of $15**.

## The branches and the order

All three start at `origin/claude/session-2-prep` (`d74b6c6`); both the fix run and the 2D branch already carry the
turn-lease fix (`claude/stage-fix-turn-lease`, migration `202610200071`) as the same commits — no conflict there.

| Step | Branch | Tip merged | Commit on the candidate |
| --- | --- | --- | --- |
| base | `claude/session2-fixes-a-f-jh3krk` — the fix run, stages A–F | `7456479` | the candidate starts here |
| 1 | `claude/live2d-1-9lq5bf` — 2D Live and the combat screen | `b4e96e6` | `9831952` |
| 2 | `claude/stage-music` — the soundtrack | `865b849` | `f23c512` |
| 2b | `claude/stage-music` again — **the ambient follow-up**, pushed while the merge was under way | `f04534b` | `05a7c57` |
| — | the bench and the replay tool: the app's checks on live runs, one adapter for Opus+Opus, the merge's ledger | — | `83d596b`, `9cebbd5`, `87361e8` |

**The music branch's follow-ups.** At the first fetch the branch ended at `865b849`, without the ambient layer; its
migration was `202610210371`. During the merge the music session pushed `66765e9` (the ambient layer: place sounds and
weather under the music) and `f04534b` (its closing numbers), with the migration renamed to `202610210301`. Both landed
and are merged (`05a7c57`); there was no `…71` left to renumber.

## Conflicts and how each was resolved

| File | Where | Resolution |
| --- | --- | --- |
| `DEV_STATUS.md` | 2D, music, music again | Union: every branch's closing section kept; the music branch's updated sections applied over the union; one new top section for the candidate (this merge). |
| `src/app/campaigns/[campaignId]/[screen]/page.tsx` (the campaign page router) | 2D | Union: the fix run's `owner` route («Для владельца») and the 2D `live` route. |
| `tests/integration-saves.test.mjs` (the ordered migration list) | 2D, music, music again | Union of the three lists in name order; the music file renamed to `0301` with its branch. |
| `tests/stage4-dossier.test.mjs` (the tool-schema size bound) | 2D | Both comments kept; the bound re-measured on the merged set (below) and set just above it. |
| `src/components/registry/shell.tsx` | music | The music provider wraps the shell; the fix run's large-text class on the same element stays. |
| `src/lib/gameplay/dm-loop/tools.ts`, `execute.ts`, `context.ts`, `loop.ts`, `two-pass/runtime.ts`, `contracts.ts` | 2D | Auto-merged, no textual conflict. Checked by hand: the `combat` tool is byte-identical to the 2D branch's; the fix run's `roll` (damage, ammunition), `rest`, `recall`, the table rules and the cache layout are untouched by the 2D side; the battlefield block joins the context's tail; `retryClaimable` (the lease fix) is the same on both. |
| `src/components/registry/settings-screen.tsx` | music | Auto-merged: the music block under the pictures block, next to the fix run's settings. |
| `docs/TURN_LOOP.md` | 2D | Auto-merged (the same lease section on both sides). |
| `src/components/gameplay-combat.tsx`, `src/lib/gameplay/combat-exchange.ts` | — | **Neither the fix run nor the 2D branch changed them** (`git diff d74b6c6` is empty on both); nothing to re-apply. |

**Fixes the merged code needed (not textual conflicts):**

1. `src/lib/ui/preview/live2d-fixture.ts` — the 2D preview's DM settings lacked the fix run's `options` (migration 73);
   typecheck failed until they took `DM_OPTION_DEFAULTS`.
2. **Readable text (the fix run's F2, owner item 5) on the new screens.** The fix run's rule «nothing on the owner's
   screens under 13 px» failed on the 2D screens (17 rules at 9–12 px) and the music player (4 rules at 12–12.5 px). The
   fix run's intent was re-applied by hand: every text panel of the 2D screens and the music block now has the 13 px
   floor (the initiative ribbon's names, the zone notes, chips' tags, the path and «caught» notes, the map label, the
   fight log, the cards' captions, the art and pin labels; the player's reason, lock, mood captions and log). The battle
   map's on-token badges (the initiative number, the HP number, the condition letters, the opportunity flag, the phone
   token's initials) and the SVG feature labels (grid units) stay as drawn, sized to a 44 px token; the test excludes
   exactly those six selectors.

**Migrations.** Every file keeps its number; no prefix is used twice: the fix run `202610200071`–`202610200084` and
`202610200096`, 2D `202610210200`–`202610210201`, music `202610210301`. No later migration redefines a function, view
or bucket rule an earlier branch's migration changed (checked: the 2D migration re-creates the pictures composition
check that only it extends; the music migration sets the media bucket's types, which no other branch touches).

## The tool-schema size after the merge

The 17 DM tools measure **12 855 estimated tokens in OpenAI's strict form and 11 874 in Anthropic's** (the fix run alone
10 529 / 9 835; the 2D branch alone 11 468 / 10 656 for its 16 tools; the grown `combat` tool is 2 666 / 2 376 of it).
Neither branch's bound held the sum (the fix run's 11 000 / 10 000, the 2D's 12 000 / 12 000), so the bound is now
13 500 / 12 500 with both branches' comments and the measured numbers in the test. The schema sits in the cached prefix.

## The three checks on the merged code

All probes are synthetic campaigns (the 2D branch's ford and lair scenarios, the fix run's long synthetic campaign);
the records are committed next to this report. The bench now runs **the app's own two in-turn checks** on a live run
(`--app-checks`: the ledger checker of the split and «every seen roll told», wired as `gameplay-service.ts` wires them,
behind the run's budget) and records whether **the writer's first request of each turn carried the battlefield block**.

### 1. Session 3's mode end to end — «Opus пишет — Opus записывает» with the ledger checker ($5.83 of ≤ $8)

| Probe | Turns committed | Cost per turn (median) | Turn / text done / first word (median) | Records accepted · rejected | Ledger checker | Battlefield block in the writer's context |
| --- | --- | --- | --- | --- | --- | --- |
| The ford ambush (`20261020-180617`) | **5 / 5** | $0.28 (total $1.49) | 110 s / 56 s / 18 s | 87 · 1 | 0 misses in every turn | **4 of 4** turns after the fight opened |
| The lair (`20261020-181543`) | **4 / 5** (the fifth stopped by the run's own $3 guard) | $0.33 (total $1.98) | 108 s / 53 s / 32 s | 87 · 3 | 0 misses in every committed turn | **4 of 4** turns after the fight opened |
| The long rest (`real-replay-20261020-182723`, the fix run's probe 4) | **1 / 1** | $1.50 (a cold cache: the first request wrote 127k tokens to it; 2 requests) | 120 s / 44 s / 28 s | 23 · 0 | in turn 0, after the commit 0 | — (no fight) |

- **Records complete.** No residual miss on any committed turn. The rejected records were recovered in the same turn
  (a crossbow dropped while still equipped → recorded as changed; a fallen companion's sword → taken off, then left where
  it fell; a `combat reaction` first aimed at the attacker, then at the hero; a `note_world` key with a Cyrillic letter,
  then fixed). The long rest: **one `rest` call** for the three party members; the three `resource` calls are the
  enemies' deaths, not per-counter bookkeeping.
- **The battlefield block reached the writer** on every turn after `combat start` (the turn that opens a fight is built
  before the fight exists). The writer used it: «До подножия уступа остаётся около 40, а подъём на 10 футов стоит
  20 футов движения» (the lair), «Ян … в 30 футах от твоего валуна… двадцать футов брода по колено в воде замедляют»
  (the ford) are the server's numbers read back.
- **The combat tool's rules — what applies in this mode.** The bookkeeper ran the fight on the server — `start` with
  placements and initiative, `feature` (the boulders as cover, the ford as difficult ground, the burning cart), `move`,
  `next_turn`, `hp`, `condition`, `intent`, `known`, `reaction`, `profile`, `log` — **and never `attack`** (0 server
  attacks in 9 turns, so no attack was rolled twice). The attacks themselves are the writer's `roll` calls (the writer's
  only dice tool), so **the 2D rules module (cover's AC, crits, resistances, the point-blank rule) is not applied by the
  server in this mode**; the writer applied cover by hand, correctly every time it came up (17 = AC 15 + half cover at
  the boulders; 18 = AC 13 + three-quarters; 19 = AC 14 + three-quarters behind the burning cart; 14 in the open), and the
  `roll` tool doubled a natural 20's dice. Small drift the server would have held: the caster's attack bonus +5 in two
  turns and +4 in two; one Fire Bolt rolled its damage as a second roll instead of in the same call. **For the owner /
  the audit:** in «пишет — записывает» the combat tool's `attack` and the rules module are single-DM features; making
  them apply in the split needs the writer to resolve attacks through the server (a design change, not done here).
- **The first ford attempt** (`20261020-180119`, 2 turns, $0.85) was cut by a bench bug, not by the app: with Opus in
  both roles the bookkeeper's reservations were never released, so the $3 guard tripped at $0.85 of real spend (its
  second turn's one ledger-checker miss, a dropped crossbow, was being corrected when the guard cut the turn). Fixed
  in the bench and in the replay tool (`9cebbd5`, `87361e8`), then the ford re-ran whole. The first long-rest attempt
  sent nothing ($0): the first request's worst case ($2.48 for a 455 KB context) was over its $1.50 guard.

### 2. The 2D session's open finding — «the DM narrated around the hero's declared attacks without rolling them»

Played on that probe, the ford, twice on the merged code: in session 3's mode (above) and with Opus alone, the mode
where the finding was seen (`20261020-182957`, 5 / 5 turns, $1.24), both with the app's checks on.

| Ford turn — the player's line | Opus writes — Opus records | Opus alone |
| --- | --- | --- |
| 1 «как только Ян ступит в воду — бьём первыми. Я выхожу и рублю…» | not rolled: the ambush check failed, Ян never stepped into the water (the condition of the declared action did not happen); told | the same; the foes' and Тобин's attacks resolved by `combat attack` and told; «Теперь ход за тобой» |
| 2 «Бью Яна ещё раз» | not rolled: out of game, the DM says the hero has not hit him yet and the server's distance (30 ft, 20 of it knee-deep water) puts him out of reach; offers the bow | the same: the server refused the 35-ft move (30 ft left); out of game, the numbers and three options |
| 3 «Отхожу… и стреляю в него из лука» | **rolled**; the rolls check found **2 of 3 rolls untold** and the writer told them in the same turn | **rolled** (`combat attack`), told |
| 4 «Добиваю того, кто ближе» | **rolled** (a natural 20); told only by implication («Он теперь без арбалета») and the check passed it | the fight had ended; a helpless foe finished in words, no roll |
| 5 «Осматриваю тела…» | no roll needed; the DM points out the fight is still on | no roll needed |

**On this probe the finding did not recur in either mode**: every declared attack that the fiction allowed was rolled;
where it was not, the DM said why, out of game, with the server's numbers (the fix run's «the hero's declared action is
never replaced» held). **But the checks would not have caught it**, and here is exactly where they miss:

1. **`visibleRolls` reads only `roll` receipts** (`src/lib/gameplay/dm-loop/roll-check.ts:13`, `receipt.call.name ===
   "roll"`). A `combat attack` card — the way the single DM attacks on a grid, and the way the original finding's
   attacks went — is a player-visible card that the check never sees: in the Opus-alone ford turn 1 the check read 2 of
   the 4 cards (the ambush and initiative rolls, not the two attacks), and in turn 3 it did not run at all (the only card
   was the hero's attack). In session 3's mode the attacks are `roll` calls, so they are covered.
2. **Nothing checks an action the player declared and the DM never rolled.** «Every seen roll told» compares rolls made
   with the narration; an attack that was never rolled leaves nothing to compare. The declared-action rule lives only
   in the instructions (`roles.ts` / `roles-ru.ts`, «The hero's will is the player's»). Catching the original pattern
   needs a check that reads the player's line against the turn's rolls and attack cards.
3. **An implied outcome passes.** Ford turn 4 (session 3's mode): the hero's critical shot is in the records and on its
   card, but the story tells it only through a companion's line; the cheap checker counted that as told.

### 3. The audit input

`docs/runs/s3-audit-input.md`: all 85 items of `docs/runs/session2-owner-notes.md` and the key findings (as five rows),
each with its status and the commit(s) on the candidate: **72 done, 15 partial, 0 not addressed, 3 no code needed**
(90 rows). The partial items and the ones whose mapping needs the auditor's eye (9, 37, 38, 41: gaps found only in the
code; 62) are listed at its end. Item 5 (small text) is now partial only for World Lab: the merge gave the 2D and music
screens the 13 px floor.

## Checks on the candidate

On a clean worktree without `.env.local`, pinned to the frozen candidate `9cebbd5` (the last merge `05a7c57` plus
the bench's adapter fix; everything after it is the replay tool's same fix and documents):

- **Full suite** (`node --test --test-concurrency=2 tests/*.test.mjs`, Node 24): **2 795 tests · 2 768 pass · 0 fail ·
  0 cancelled · 27 skipped** (35 min). The three known `d2a-composition` cancellations did not occur on this run.
- **Typecheck** pass · **lint** pass with zero warnings (`eslint . --max-warnings 0`) · **production build** pass, no
  warnings.
- Focused runs while merging: after the 2D merge the dm-loop, combat, live2d, inventory, fix-s2, dossier and saves
  tests (261) — 2 failures, both fixed in the merge (the 13 px rule on the 2D styles, the schema bound), then green; after
  each music merge the music, saves, readable-text, stage-5 and settings tests (49–68) green after the music player's
  13 px fix.
- **Screenshots regenerated from the merge** (the production build above, `next start` on :3105): the fix run's set
  `docs/runs/fix-s2-shots/` (stages A–F, 46 screens at 1440×900, 1920×1080, 2560×1440 and a 390 phone — 184 shots;
  stages A–E gain the 900p size F introduced; the E picture-probe images are paid outputs and stay as they were), the 2D
  set `docs/runs/live2d-1-shots/` (39 shots: the walk at three widths, both fights round by round) and the music set in
  `docs/screens/stage-5/` (the game and settings screens of both sample worlds, desktop and phone — 8 shots); **zero
  horizontal overflow and nothing clipped** in every index. The merged screens show the union: «Для владельца» and «2D»
  in the menu, the music control in the header, the music and place-sound block under the fix run's settings.

## Money

`docs/runs/merge-s2-ledger.md`: **$7.07 of the $15 cap.**

| Check | Runs | Spent |
| --- | --- | --- |
| 1 — session 3's mode (≤ $8) | the ford attempt 1 $0.85 (cut by the bench bug), the ford $1.49, the lair $1.98, the long rest $1.50 (its first attempt sent nothing, $0) | **$5.83** |
| 2 — the open finding | the ford with Opus alone $1.24 (the session 3 mode's ford above is counted in check 1) | **$1.24** |
| 3 — the audit input | no paid calls | $0 |

Each run's own guard capped it before any request whose worst case could cross it; the checkers' calls (Haiku, about
$0.0005 each) are inside the totals. The replay tool registers in the ledger before its first request; the bench has
its own guard and its runs were entered as each one ended, with the provider-measured spend.

## Files of this merge

- The report (this file), the ledger `docs/runs/merge-s2-ledger.md` (and `.json`), the probes' records
  `docs/runs/20261020-18*-loop-opus*-live-2*.jsonl` and `docs/runs/real-replay-20261020-18*.jsonl` (synthetic campaigns
  only).
- The bench (`scripts/eval/run.mjs`, `scripts/eval/lib/loop-harness.mjs`: `--app-checks`, the live context, one adapter
  for the same model in both roles) and the replay tool (`scripts/eval/real-replay/replay.mjs`: the same adapter fix;
  `lib/ledger.mjs`: the merge's ledger).
- `docs/runs/s3-audit-input.md` — every item of `docs/runs/session2-owner-notes.md` with the commits that address it.
- `docs/runs/s3-acceptance.md` — the index of the three Russian acceptance checklists.
- `docs/SANDBOX_LOAD_FIX_S2.md` — now loads `claude/s3-candidate`: the three migration ranges, the 2D tables, the
  music and place-sound packs.
- `DEV_STATUS.md` — a new top section naming the candidate.
