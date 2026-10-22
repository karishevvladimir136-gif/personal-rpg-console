# Fixes before session 3 — report

Stage: `docs/stages/FIX_S3_PRE.md` (on `claude/handoff`), done on `claude/s3-candidate` itself. Nothing went to `main`.
Every item started from its evidence line re-read on the candidate's HEAD; every item ends with a test (named below).
Paid calls: **$7.08 of the $20 cap**, all in `docs/runs/fix-s3-pre-ledger.md`.

## In short (for the owner)

- In «Opus пишет — Opus записывает» the storyteller's attacks now go through the server's rules, as with the single DM:
  cover, crits, resistances, conditions; the card shows each rule. A bare d20 attack in a fight is refused and redone.
- The «every roll told» check now sees fight cards and the actions you declared, and it actually answers again (it had
  been silently passing every turn — see 2.6).
- Your table rules are in code: wounds in words by HP band, coup de grâce on a helpless foe, the planned ambush acts
  first, strict BG3 natural 20/1 (also on a reroll), a potion in a fight costs the bonus action, Heroic Inspiration is
  one at a time.
- Screens: DC shown (a migration turns it on), «Тайны» is a one-line hint, «Кадры» show every turn, «Линии времени» in
  the menu, the fight's words in Russian, the wallet in words, the companion's kept die on its line, a «Броски спутников»
  switch, the action box up to half the screen, «⚡ важный ход» back.
- A fight's start orders the battle map's painted background by itself; a place you never prepared gets its scene
  first, by the same path as «Подготовить сцену» (after the stage, see the last section).
- The fight's opening blows go through the rules too: in a 5e campaign the first attack opens the fight on the server
  (after the stage, see the last section).
- **Manual setup:** none beyond the sandbox load (`docs/SANDBOX_LOAD_FIX_S2.md`, now four migration ranges). Note that
  migration `202610210402` changes a setting on your campaign (DC on).

## Money

| Part | Spent |
| --- | --- |
| Part 1 probes: the ford ($1.95) and the lair ($1.71) in session 3's mode | $3.66 |
| 2.6 the roll-check validation on the merge's ford turn 4 (4 runs × 5) and the ledger-check ceiling (5 turns) | $0.01 |
| 2.6 the memory pair: compact cold $1.25, compact warm $0.24, standard warm $0.56, standard's first attempt stopped by the replay guard after one request $1.36 | $3.40 |
| **Total** | **$7.08 of $20** |

## Part 1 — the merge's two gaps

### 1. The writer's attacks go through the server
- `roll` with `kind: "attack"` while a fight is open is resolved on the battlefield by the same resolver as
  `combat attack` (`src/lib/gameplay/dm-loop/execute.ts`: `fightAttack`, `fightRoll`): attacker and target from the
  fight, the attack line from the sheet / the weapon / the fight's memory of that weapon, cover to AC, distance,
  conditions' advantage, crits, resistances by meaning (English and Russian), HP on the map and on the record, the log
  line, the attacker's action. New fields on `roll`: `weapon`, `damageType`, `ranged`. A bare attack (no target) in a
  fight is refused with the fix in the message. The writer's instructions (en `roles.ts`, ru `roles-ru.ts`) say: in a
  fight, attacks go through this path, never a bare d20; the bookkeeper's brief marks them RESOLVED IN THE FIGHT.
- Tests: `tests/fix-s3-pre-1.test.mjs` — «the attack line of a sheet or a weapon», «the writer's instructions in both
  languages…», «in the split, the writer's attack in an open fight is resolved on the battlefield…», «a bare attack in
  the fight is refused…», «the ford probe's two findings» (a hero's AC written in words; no note when the formula's
  bonus equals the weapon's).

### 2. The «every roll told» check sees attacks and declared actions
- `src/lib/gameplay/dm-loop/roll-check.ts`: fight attack cards count as rolls the player saw; the hero's own rolls are
  marked; the player's line is read for declared actions (a cheap word gate first); a declared action with no roll and
  no out-of-game reason gets one continuation; the checker now **quotes** the sentence that tells each roll, and an
  empty quote is untold — so a hero's decisive roll told only by a companion's line or an aftermath is untold.
- Tests: `tests/fix-s3-pre-1.test.mjs` — «the check's pieces…» (the merge's ford turn 1 shape), «the single DM — the
  ford turn 3 shape … the 2D finding gets one continuation and is rolled», «the split — the ford turn 4 shape…», and
  «2.6: the roll check's request runs without thinking…».

### The probes (synthetic campaigns, «Opus пишет — Opus записывает», records in `docs/runs/`)

| | The merge (before) | This stage |
| --- | --- | --- |
| Ford, turns committed | 5/5 | 5/5 |
| Ford, attacks on the battlefield / bare | 0 / 7 | 3 / 0 in the open fight (4 more in the turn that opened it, see below) |
| Ford, median cost · turn · first word | $0.28 · 110 s · 18 s | $0.40 · 123 s · 24 s |
| Lair, turns committed | 4/5 | 5/5 |
| Lair, attacks on the battlefield / bare | 0 / 13 | 3 / 0 in the open fight (3 more in the opening turn) |
| Lair, median cost · turn · first word | $0.29 · 90 s · 27 s | $0.35 · 117 s · 49 s |

Records: `docs/runs/20261021-013927-loop-opus+opus-high-live-20-live2d-ford.jsonl`,
`docs/runs/20261021-014903-loop-opus+opus-high-live-21-live2d-lair.jsonl`. Three attacks were refused and redone in the
same turn: twice the hero's AC stood only in the sheet's words (fixed after the probe — the AC is now read from the text,
test «the ford probe's two findings»), once a target was named «dm» in the opening turn. Records complete: no residual
ledger miss.

- **Not met: «cost and seconds unchanged within noise».** One run per arm, different dice and fight shapes, so the
  noise is large, but both medians rose: +$0.06–0.12 and +13–27 s a turn. Likely causes: a refused-and-redone attack
  costs a round (the AC case is fixed now); the fight's tool results are longer. Not trimmed in this stage (see «Needs
  the owner» 1).
- **A limit (closed after the stage, see the last section):** attacks rolled in the same turn as `combat start` came
  before the battlefield existed (7 across both probes), so they were plain rolls without the rules module. From the
  next turn on, every attack went through the fight.

## Part 2 — the audit's findings

### 2.1 The owner's table rules
| Item | What changed | Test |
| --- | --- | --- |
| B-17 wounds by HP band | the rule in both roles; the band word on the hit receipt («lightly wounded», «bloodied», «badly hurt», «down») | `fix-s3-pre-2`: «2.1 B-17 and B-1: the roles carry…», «2.1 B-17: a hit's receipt names the band…» |
| B-7 / A-61 coup de grâce | with the rules module on, a melee hit on an adjacent paralysed / unconscious foe is HP 0 and dead, the card says «добит» | `live2d-fights`: «fix S3-pre B-7…» |
| B-2 / A-54 ambush | `combat start` with a party opening makes the ambusher act first at turn 0; the first `next_turn` goes to the top of the order without spending a round-1 action | `live2d-fights`: «fix S3-pre B-2…» |
| B-1 / A-38 / A-9 strict BG3 | no extra on a natural 20; a reroll recomputes the natural label and the verdict (migration `202610210401`) | `fix-s3-pre-2`: «2.1 B-1: a rerolled natural 20…» |
| B-3 potion in a fight | spends the drinker's bonus action, never a rejection | `fix-s3-pre-2`: «2.1 B-3 and B-4…» |
| B-4 Heroic Inspiration | one at a time; `roll heroicInspiration` spends it as one reroll | same |

### 2.2 Session 3's mode and the fight
| Item | What changed | Test |
| --- | --- | --- |
| B-6 / D-7 | a wound outside `combat attack` (a roll's bundled damage, `resource hp`) moves the open fight's HP mirror with a log line; `combat hp` reads the record first; enemy HP numbers on the play screen's «Бой» panel | `fix-s3-pre-2`: «2.2 B-6…» |
| A-37 / B-5 | the «Дальше» pause holds only while a reroll or Heroic Inspiration is available (one rule for server and client, `reroll-allowance.ts`); «перебросов осталось N из M» on the card | «2.2 A-37…» |
| B-16 | the output cap 64 000 in both loops; «⚡ важный ход» is back and saves `boostNext` | «2.2 B-16…» |
| A-9 saves | a saving throw reads the sheet's save bonus | «2.2 A-9…» |

### 2.3 The campaign the owner will play
| Item | What changed | Test |
| --- | --- | --- |
| A-39 / A-71 DC hidden | migration `202610210402`: each campaign stored with `showDc` false gets a new settings revision with it true (history kept); new campaigns seed true | `fix-s3-pre-3`: «2.3 A-39 / A-71…» |
| KF-hidden-layer | the prep never runs from the Settings read (`?for=settings`); rebuilt once when «Тайны» are saved; a brand-new campaign's first turn waits for it once (`prep-schedule.ts`); the digest's rewrite of the layer got its missing test | «2.3 KF-hidden-layer…» (two tests) |
| B-12 «Тайны» | one row, 200 characters, the new hint; the «Показывать мне тайны ведущего» switch stays off | «2.3 B-12…» |
| A-15 «Кто идёт с героем» | one sentence in the first turn's instruction (en, ru): those people are recorded as companions | «2.3 A-15…» |
| B-13 gallery | its own read over every committed game turn (`rpg_gallery_turns`, migration `202610210403`), grouped by session; the menu says «Линии времени» | «2.3 B-13…» |
| A-62 save-failure copy | a failed records read has its own words; a send whose answer never came reads the stored turn | «2.3 A-62…» |

### 2.4 Russian on the owner's screens
One English→Russian map applied at render (`src/lib/live2d/battle/words.ts`, `src/lib/audio/words.ts`); the stored
words stay English. The owner's wording for conditions and outcomes; battle cards, zone chips, tokens, the fight log,
«+10 фт»; the play aside's counter labels; runtime errors through the catalogue; track titles and mood reasons; item
history words; five missing `ru.json` keys; a sheet stat's key on the roll card; «2D»; «с». Tests: `tests/i18n.test.mjs`
— «2.4: the fight's words…», «2.4: the battle components and the 2D screen…», «2.4: the server-built player strings of
a Russian fight carry no English word…».

### 2.5 Privacy in the public repository
| Item | What changed | Test |
| --- | --- | --- |
| E-1a | the two fixtures that re-staged a campaign by name carry invented names, shapes kept; the music session log regenerated | `fix-s3-pre-3`: «2.5 E-1a…» |
| E-1c | `<owner>` and `<exports>` placeholders for the Windows home and the exports folder (106 paths in 35 files) | «2.5 E-1c…» |
| E-4c | the eval tools read `.env.local`, else the cloud's `APP_` variable, never the shell's key variable | «2.5 E-4c…» |

### 2.6 Measure before play
- **The roll check (paid validation on the merge's ford turn 4).** Root cause found first: at low effort the cheap
  model still thinks, and on the quoting prompt it spent the whole 900-token allowance thinking — no answer, so the
  check passed every turn. It now runs with thinking off. Old prompt: 0 of 10 runs flagged the hero's critical shot that
  the story told only through a companion's line; new: 10 of 10. A declared action is asked for only when the hero
  rolled nothing that turn, so an untold attack is never rolled twice. $0.01.
- **The ledger check (same cause, found in passing).** At 900 tokens, 2 of 5 answers on the ford probe were all
  thinking (empty → «no misses»). Without thinking it listed records that exist, so it keeps thinking with a 3 000
  ceiling: 5 of 5 answered. Test: «2.6: the roll check's request runs without thinking…» (`fix-s3-pre-1`).
- **Memory «стандарт» vs «компактно», live** (the 60-turn synthetic campaign's recall probe: a fact told once 35 turns
  back; Opus writes + Opus records; `docs/RESEARCH_LOG.md`):

  | | first word | text | full turn | cost | recall |
  | --- | --- | --- | --- | --- | --- |
  | стандарт (warm cache) | 27.1 s | 33.4 s | 77.9 s (a scene, 14 records) | $0.56 | the fact exact |
  | компактно (warm cache) | 15.0 s | 15.0 s | 26.6 s (an out-of-game answer, 4 records) | $0.24 | not recalled |
  | компактно (cold cache) | 17.5 s | 17.5 s | 26.4 s | $1.25 | not recalled |

  With «компактно» the DM said out of game the person was not in the records and asked the player; the cold run also
  wrote a note «not in canon, do not introduce retroactively» — a false record that would block the real fact later.
  The replay has no memory search (the window and the DM's notes only), so live «компактно» would also get the search's
  block; still, the default «стандарт» is confirmed. The two turns differ in shape, so the time and cost gap is not
  memory alone. Records `docs/runs/real-replay-20261021-024834 / -024927 / -024954 / -025143.jsonl`, samples
  `docs/samples/real-replay/21fe924b/`.

### Smaller, done because cheap (`tests/fix-s3-pre-4.test.mjs` unless named)
- A-42: the action box grows to half the screen; its text follows the player's words in the story on wide screens and
  in «Крупный текст истории» (`tests/fix-s2-c-ui.test.mjs`).
- A-44: a companion's chip shows its kept die before the total («Восприятие: кубик 14 → 17 против 15 — получилось»;
  the die is not named by its size, so the screen stays system-neutral);
  «Броски спутников» is a switch on the Settings screen.
- A-33: the wallet reads in words with Russian plurals («10 золотых · 11 серебряных · 26 медных»); a panel header keeps
  the short code.
- A-70: the distance rule adds «a pace is about three feet» in both languages.
- A-5: World Lab and the old sheet's fold keep the 13 px floor (`tests/fix-s2-f2.test.mjs`); the battle map's on-token
  badges stay exempt by the merge's decision (map drawing sized to the 44 px token).
- A-17: the digest's answer is repaired once — a trailing comma, or an answer cut mid-field closed at its last complete
  field; still none without a recap and a title.

### Smaller, not done (not cheap, or a decision)
- A-73 `rest` refills only the named counters: counters carry no rest kind on record; a record-shape change.
- A-74 ammunition stacks not merged: needs a data migration on the owner's records; better done after seeing them in
  the sandbox.
- A-18 ability scores in the sheet editor and the DM's sheet tool: the sheet patch has no attributes; a schema change.
- A-31 the atlas opens a flat campaign at «Мир»: which level a flat campaign should open at is a design decision; the 2D
  region map covers travel.

## Part 3 — small things already known
- English in player text: folded into 2.4.
- **The battle map's painted background was never requested in a live fight**: the map reads the place's top-down
  picture, and only a `battle.prepare` action asks for one, which no screen sent. Now a turn that starts a fight asks for
  it after the commit, off the turn's path (`src/lib/live2d/server/battle-schedule.ts`); `prepareBattleMap` keeps one
  per place and sheet revision, needs the place's scene sheet (LIVE2D_1 Part 1) and respects the pictures' cap. Test:
  «Part 3: a turn that starts a fight asks for its place's painted battle background…». A place without a scene now
  gets one first (after the stage, see the last section).
- **The hidden layer of «Приключения начинаются»**: confirmed armed — the first game-screen read after the sandbox load
  schedules the prep («existing»); the Settings read never does; a campaign with turns never makes a turn wait; once a
  layer exists nothing runs again. Never shown: the owner's «Что видит ведущий» carries only «a layer exists» unless
  «Показывать мне тайны ведущего» is on; the player's play and public records never have it. Test: «Part 3: the owner's
  existing campaign gets its hidden layer…».

## Checks
- Full suite on a clean worktree (no `.env.local`) at `da7a0dd`: **2 833 tests · 2 806 pass · 0 fail · 0 cancelled ·
  27 skipped** (21 min). Typecheck pass; lint pass with zero warnings; production build pass, no warnings.
- Two earlier full runs caught what the focused runs did not, and both were fixed before the run above: the
  startup-gate test's module stubs did not know the new battle-schedule import, and the stage-5 guard caught «к20» in
  the companion chip's UI code (a system's rule in code) — the chip now says «кубик».
- The older tests updated for this stage's owner decisions: the hit record's band (`fix-s2-a1`), the DC migration
  (`phase3-upgrade`, `phase35-storage`), the restored «⚡ важный ход» (`polish-group6`), the 64 000 cap
  (`fix-s2-a1`, `fix-s2-a6`, `stage4-dossier`), the half-screen action box and the companion chip (`fix-s2-c-ui`), the
  typography floor (`fix-s2-f2`).
- `docs/SANDBOX_LOAD_FIX_S2.md` re-checked against the final migration list (four ranges; `202610210401`–`403` listed,
  the DC migration marked as a settings change); the three acceptance checklists updated where a path changed; the
  index `docs/runs/s3-acceptance.md` lists what changed.

## Needs the owner
1. **Cost and seconds in session 3's mode rose** on the probes (ford $0.28 → $0.40 a turn, lair $0.29 → $0.35; turns
   13–27 s longer), n = 1 each. Acceptable for session 3, or should the next stage measure n ≥ 3 and trim it?
2. **Coup de grâce excludes the party**: a dying hero or companion keeps 5e death saves (your decision stands); say if
   foes should be able to execute your people too.
3. **«Важные броски кидаю я» no longer pauses by itself**: the «Дальше» pause holds only while a reroll or Heroic
   Inspiration is available (A-37).
4. ~~The battle background needs a prepared scene~~ — decided by the owner: a fight's start prepares the scene too
   (done after the stage, see the last section).
5. **Old names in history**: earlier runs' records and design canvases still carry session-1 names (E-1a covered the
   two fixtures that re-staged a campaign); they are past records in a public repository.
6. Acceptance of the three checklists (`docs/runs/s3-acceptance.md`); implementation is complete, owner approval is not.

## After the stage — the owner's two follow-ups

### The fight's opening attacks go through the rules
In «пишет — записывает» the writer rolls the opening blows before the bookkeeper's `combat start`, so no battlefield
existed and those attacks were plain rolls (7 over the two probes).
- **The first attack opens the fight on the server** (`src/lib/gameplay/dm-loop/execute.ts`, «the fight's opening
  attacks»). That covers the attacker, the target and the party, with no positions yet and the attacker acting first.
  The attack and every later blow of the opening are resolved by the same fight path as `combat attack`: the card, the
  rules module, crits, resistances, the hit points on the map and on the record, and the log.
- **A person the writer names before anyone recorded them** (the lair's case: the writer had to say «dm» for the two
  bandits) is recorded bare: name only, no hit points.
  - Damage dealt to them waits on the server and is subtracted as soon as their full hit points are given, whether by
    `upsert_character`, `combat start` hp, `combat hp` or `resource hp`.
  - The bookkeeper's `upsert_character` with the same name completes that record and never makes a second one.
  - A name close to someone already on record («Кривого Яна» for «Кривой Ян») is refused with a hint to use the exact
    name.
  - A lowercase word («часовой») or «dm» creates no one, and the plain roll applies exactly as before.
- **The bookkeeper's `combat start` completes that fight** instead of opening a second one:
  - its placements, initiative, grid, light and stat blocks are added;
  - the opening wounds, conditions, spent actions and log entries are kept;
  - a stat block's full hit points never heal a wound the opening already dealt;
  - a planned ambush still does not spend the ambusher's round-1 action.
- The writer's instructions (en, ru) say: name the attacker and the target by their names, a new person too. The
  bookkeeper's instructions and brief say: «this attack OPENED THE FIGHT: complete it with combat start», and damage to
  a person with no hit points is «KEPT BY THE SERVER».
- **Only in systems with the rules module** (D&D 5e, Pathfinder — your campaign). In a campaign of another system a
  fight would add nothing to the roll, and the plain roll's natural 20 still doubles the dice. The attack stays as it
  was, and the fight opens with `combat start` as before.
- **What this changes in play:** in a 5e campaign any attack between two people outside a fight now opens one. If the
  turn ends without a `combat start`, for example one blow kills a sentry, the fight stays open. The receipt tells the
  DM to end it with `combat end`.
- Tests: `tests/fix-s3-pre-5.test.mjs`:
  - «opening attacks: in the split, the writer's first attack opens the fight…», which covers the ford's opening with
    a new crossbowman, one fight, no duplicate person, the opening damage kept and the brief;
  - «…the single DM's attack before its own combat start is the fight's too; a generic word or a near name never makes
    a person; another system keeps the plain roll»;
  - «the writer's and the bookkeeper's instructions say it».

### A fight on a place nobody prepared gets its scene, then its painted background
`src/lib/live2d/battle/background.ts` holds the order and `src/lib/live2d/server/battle-schedule.ts` the server calls.
- After a turn that starts a fight, a place with a scene sheet gets its battle background as before.
- A place that never had a scene gets one first, by the «Подготовить сцену» path (`prepareScene`). That means the sheet,
  one quality picture, the vision check, at most one corrected redraw and the markers. The background starts only after
  the scene's picture is done, so it draws on it.
- Both steps keep the daily pictures' cap. A place not yet visited, the cap reached, or a scene already drawing stops
  the chain. A scene that exists without a usable sheet is left for you to redraw.
- The whole chain runs after the response inside the turn's request. Text play never waits for it.
- **Cost:** for a new place, one scene (≈ one quality picture plus the cheap sheet and check calls) and one background
  (one quality picture plus its check), both within the daily cap.
- **Hosting limit:** on a hosted deployment with a time limit per request (Vercel, 300 s for the turn route), a slow
  chain may be cut and leave the scene marked «drawing». On the sandbox's local `next start` there is no such limit.
- Test: «battle background: a place nobody prepared gets its scene first (its picture done), then the background…»,
  covering the order and each stop condition, plus the wiring.

### Checks after the follow-ups
- Full suite on a clean worktree (no `.env.local`) at `5069793`: **2 837 tests · 2 810 pass · 0 fail · 0 cancelled ·
  27 skipped** (25 min). Typecheck pass; lint pass with zero warnings; production build pass, no warnings.
- The older fight tests were not changed by the follow-ups: their campaigns are not 5e, so they keep the plain roll.
  One wiring assertion of Part 3 (`fix-s3-pre-4`) now expects the scene step.
- No paid calls; the stage's total stays $7.08 of $20.

