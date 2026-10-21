# Fixes before session 3 — on the candidate, after the audit

Cloud session (`docs/CLOUD.md`, environment `rpg-console`), **Opus 5.5, ultracode off** (linear work, no fan-out). Branch **`claude/s3-candidate`** itself (commit
on it; it is the branch the sandbox and the deploy will take). Nothing to `main`. Paid probes within **$20** (Part 1 probes, the two measurements of 2.6), ledger
`docs/runs/fix-s3-pre-ledger.md`. Report in English `docs/runs/fix-s3-pre-report.md`; talk to the owner in English,
briefly. Every item ends with a test; the stage ends with the full suite green on a clean worktree, typecheck,
zero-warning lint, the production build, and the three acceptance checklists updated where a path changed.

## Part 1 — the two gaps the merge found (`docs/runs/merge-s2-report.md`, checks 1 and 2)

### 1. In «пишет — записывает» the writer's attacks go through the server
Today the writer has one dice tool, `roll`, so in a fight its attacks bypass `combat attack` and the rules module
(cover's AC, crits, resistances, the point-blank rule, conditions' advantage/disadvantage) never applies; the writer
added cover by hand (correctly, but its attack bonus drifted +5/+4). Owner's decision stands: session 3 runs on this
mode and the combat must be as honest as the single DM's. Do: give the writer an attack path that the server resolves —
either `combat attack` in the writer's toolset while a fight is open (the bookkeeper keeps the rest of `combat`), or an
`attack` shape inside `roll` (attacker, target, weapon/spell, the server fills the modifiers from the sheet and the
battlefield and applies the rules), whichever keeps the writer's prompt small and the ledger consistent. The card shows
every applied rule as in the single DM. The writer's instructions (Russian and English) say: in a fight, attacks go
through this path, never a bare d20. Probe: the ford and the lair in session 3's mode — 0 bare attack rolls, the rules
visibly applied, records complete, cost and seconds per turn unchanged within noise.

### 2. The «every roll told» check sees attacks and declared actions
`roll-check.ts` reads only `roll` receipts. Do: (a) `combat attack` cards count as visible rolls; (b) a **declared-action
check**: the player's line names an attack / spell / check the fiction allows → the turn must contain its roll or card,
or an out-of-game sentence saying why not (the rule «the hero's will is the player's»); a miss → one continuation asking
for it; (c) an outcome told only by implication (a companion's line, a receipt) does not count as told for the hero's own
decisive roll — the check wants the event in the narration. Tests from the merge report's ford turns 1, 3, 4 and the 2D
session's original finding (three turns narrated around declared attacks).

## Part 2 — the audit's findings, filtered (`docs/runs/audit-s3-report.md` on `origin/claude/audit-s3`)

The audit was cut by the usage limit: 173 rows, 11 cross-verified, the rest one agent's finding with the code line
re-read by the audit lead («✓ lead»). So **every item below starts with re-checking the evidence line on HEAD**; if the
finding does not hold, say so in the report and move on. Row ids refer to the audit report; full rows with the smallest
fix and risk are in `docs/runs/audit-s3-rows.json` on the audit branch. The owner's decisions behind the items are
already taken (`FIX_S2_PLAN.md`, incl. the three of 2026-10-20 18:15) — do not reopen them. Order is impact order.

### 2.1 Rules the owner decided that exist nowhere (prose in both roles + the server where named)
- **B-17 wounds by HP band** (`roles.ts`, `roles-ru.ts`: grep for the band words is empty). One line in both roles:
  wounds follow the HP left — light / bloodied / badly hurt / down; a killing blow only at 0 HP; a man at 1 HP is never
  an untouched «live man». Add the band word to the receipts at `execute.ts:335` and `:1823` so the model sees it.
  Test: the role text contains the rule; the receipt carries the band.
- **B-7 / A-61 coup de grâce** (`rules.ts:68` is RAW auto-crit — the mechanic that produced item 61). Prose in both
  roles: a helpless target (unconscious, paralysed, or bound and unable to resist) dies to a blade at the throat, no
  rolls. **Server (owner 18:15: yes):** with the rules module on, a melee hit on an adjacent paralysed/unconscious target
  in `execute.ts` `combat attack` → HP 0 and `dead`, the card says «добит». Test in `tests/live2d-fights.test.mjs`.
- **B-2 / A-54 ambush opening** (`execute.ts:1584` stores `opening: "party"` and nothing reads it). Prose in both
  roles' table rules: the party's planned signal or first strike resolves before initiative; it does not spend the
  ambusher's round-1 action. Server: `combat start` with `opening: "party"` makes the ambusher the active participant at
  turn 0 so the first `next_turn` goes to the top of the order. Test with a low-initiative ambusher.
- **B-1 / A-38 / A-9 natural 20** — strict BG3, no «заметная удача сверх успеха»: delete the clause at `roles.ts:57,
  :110`, `roles-ru.ts:29`, `execute.ts:454`. And the reroll bug: a preset reroll re-scores as total ≥ DC and keeps the
  old natural label (`loop.ts:350`, `runtime.ts:161`; a rerolled 20 vs DC 30 returns a failure) — recompute `natural`
  after `recordServerRoll`; `202609180004` lines 351/360 assert the old rule, so an additive migration. Test: a rerolled
  20 is a success, a rerolled 1 a failure, the label matches the new die.
- **B-3 potion as bonus action** — prose exists; the server never marks `economy.bonus` spent on a consume
  (`execute.ts:1021-1035`, cleared only at `:1605`, `:1727`), so the battle screen's «Бонусное» dot lies. Spend it.
- **B-4 Heroic Inspiration** — prose only over the generic counter; the server neither caps it at 1 nor ties a spend to
  a reroll. Smallest: cap the counter at 1 and let a reroll name `heroic_inspiration` as its source (no pause logic
  change). Test: a second grant is refused; a spend produces one reroll.

### 2.2 Session 3's mode and the fight (with Part 1)
- **B-6 / D-7 enemy HP goes stale in the split mode**: the writer's `roll` damage changes the record only
  (`execute.ts:333`); the bars and the battlefield block read the combat mirror (lair record: Серый 20→10 on the record,
  the table still 20 until «Выравнивание»). Mostly moot once Part 1 routes attacks through `combat attack`, but keep the
  guard: `bundledDamage` also sets `combatant.hp` when an encounter is open, and `combat hp` prefers the record (no double
  subtraction with the ALREADY APPLIED brief). Also: enemy HP numbers on the plain play screen's «Бой» panel
  (`gameplay-combat.tsx:131-162` shows none) — the owner's decision is «visible», not «visible on 2D only».
- **A-37 / B-5 the «Дальше» pause (owner 18:15):** pause only while a reroll or Heroic Inspiration is available
  (`loop.ts:114` checks the setting, not availability; `pausesForPlayer` and its client mirror `gameplay-turn.tsx:283`
  must agree). Show «перебросов осталось N из 2» on the hero's card. Test: both spent → no pause.
- **B-16 cap and the button (owner 18:15: 64 000):** `limits.ts:29` → 64 000 in both loops; restore the «⚡ важный
  ход» toggle (server path `boostNext` exists and is tested; the button was removed in 0c7fe21).
- **A-9 saves get no bonus**: `sheetBonus` (`execute.ts:281`) reads `skills` and `abilities` only; schema-2 `saves` are
  never read (a probe returned `null`). Read `saves` when the asked skill names a save. Test with a fixture sheet.

### 2.3 The campaign the owner will play (data that the code's defaults do not reach)
- **A-39 / A-71 the DC is hidden on the owner's campaign**: `202609170001:266` seeds `showDc` false; the TypeScript
  default `true` reaches only previews. Additive migration: set `showDc` true where false (the owner asked for the DC).
- **KF-hidden-layer, prep timing**: the prep fires on the first `/play` read — the Settings screen also makes it — and
  never re-runs; a first action within ~70 s runs without the layer. Do: never schedule the prep from the Settings
  read; re-run it once when the owner saves «Тайны» (≈$0.45); a brand-new campaign's first turn waits for the prep (one
  wait, once). Test the scheduling; the rewrite by the digest gets its missing test.
- **B-12 the «Тайны» field** still presents itself as the owner's full truth (5 rows, 20 000 chars, hint «Правда,
  которую знаешь ты и ведущий…»). Make it a one-line steer: one row, ~200 chars, hint «Необязательная подсказка ведущему
  в одну строку, например: пусть за этим стоит культ». The «Показывать мне тайны ведущего» switch stays, off.
- **A-15 «Кто идёт с героем» (cross-verified)**: those people join only if the DM's first turn adds them. Now: one
  sentence in the opening/first-turn instruction (both languages) — the people the owner marked as going with the hero
  are recorded as `companion` in the first turn. The review checkbox committed as `companion` is a later stage.
- **B-13 gallery shows only the last 64 turns** (`202609180004:91` limit 64 feeds `/play`): the gallery takes its own
  query over all committed turns, grouped by session (owner, item 80: «all frames by session»). Rename the navigation
  entry «Хроника и линии времени» → «Линии времени»; the chronicle route stays reachable by URL only.
- **A-62 save-failure copy after a committed turn**: `persistence/client.ts:20` → `persistent-records.tsx:270` shows
  «Не удалось подтвердить сохранение» on a failed records read. Own copy for that case and a `loadTurn` on an
  `unavailable` send (~10 lines).

### 2.4 Russian on the owner's screens (F, 42 findings; absorbs Part 3's first bullet)
One shared English→Russian map applied at render (stored words stay English because the server matches them
literally), with the owner's wording: dying → «при смерти», unconscious → «без сознания», concentrating →
«концентрируется», surprised → «застигнут врасплох», fled → «бежал», surrendered → «сдался», hidden → «скрыт»,
prone → «лежит», paralysed → «парализован», poisoned → «отравлен», frightened → «напуган», grappled → «схвачен»,
restrained → «опутан», stunned → «оглушён», blinded → «ослеплён», deafened → «оглох», invisible → «невидим»,
incapacitated → «недееспособен»; outcomes victory → «победа», defeat → «поражение», retreat → «отход», truce →
«перемирие». Apply on the battle cards, zone chips, tokens and fight log (`battle-screen.tsx:247, :266-269`,
`battle-map.tsx:142`, `execute.ts:1848`); `+10 ft` → «+10 фт» (`battle-map.tsx:120`); the play aside's counter labels
through `counterLabel` instead of a transliterated key (`game-screen.tsx:447-448`, items 32/52); raw runtime errors on
the play screen get a Russian line (`game-screen.tsx:255`); music track titles and mood reasons in the header player
through a reason map (`music-job.ts:67`, `mood-select.ts:89-157`); item-history words «merged», «the camp», «gear»,
«lost» (`execute.ts:948, 872, 605, 2014`); the five missing `ru.json` keys. The two style fields that feed English-only
generators (illustrator, music style) stay English. Widen `tests/i18n.test.mjs` to the battle components and the
server-built player strings so this class is caught.

### 2.5 Privacy in the public repo (E)
- **E-1a fixtures that re-stage the owner's campaigns by name** — `test-fixtures/stage-v/shov-scene.json` (Мир Шва,
  Джеймс Хейл, Мэг, Урзул, Изольда) and `scripts/eval/scenarios/19-polish-ru-replay.json` (Рэй, Ржавое побережье,
  Марта). Whatever their origin, the rule is «no campaign names or dialogue in git»: rename world, people and places to
  invented ones, keep the shapes; the tests must still pass.
- **E-1c the owner's Windows user name and `C:\Dev\rpg-exports` paths** in 27 + 12 tracked docs (three added by the
  fix run): placeholders `<owner>` / `C:\Dev\rpg-exports` → `<exports>`. Docs only.
- **E-4c the eval tools prefer a shell `ANTHROPIC_API_KEY`** over `.env.local` (`scripts/eval/lib/keys.mjs:10`,
  `loop-harness.mjs:250`): read `.env.local` / `APP_ANTHROPIC_API_KEY` first, the shell variable never.

### 2.6 Measure before play
- **Memory «стандарт» was never measured live** (the cost table is a cache simulation). One replay pair (compact vs
  standard) on the synthetic campaign, ~$3: first word, full turn, cost per turn into `docs/RESEARCH_LOG.md`.
- The roll-check prompt sentence for implied outcomes (Part 1, 2c): validate on a paid replay of the ford turn 4
  record (~$0.30).

### Smaller, do if cheap (first agent only)
`rest` refills only the counters the DM names (A-73); ammunition stacks not merged by any migration (A-74); the action
box grows to a third of the screen, not half (A-42); the companion chip lacks the d20 and the «Броски спутников» switch
is API-only (A-44); the sheet editor cannot change ability scores (A-18); the atlas «Карта» opens a flat campaign at
«Мир» (A-31); the distance rule lacks «a pace is about three feet» (A-70); the wallet shows «зм» with the word only on
hover (A-33); the typography floor misses World Lab, the token badges and the old sheet's fold (A-5); item-17 digest has
no parse repair (A-17).

### Not in this stage (the audit could not check; the owner's acceptance pass covers them)
Items 25–30, 45–64, 79–85 as the owner's items; regression lines D-3–D-6, D-9, D-10; the 2D and music checklists. Nothing
is assumed done there.

## Part 3 — small things already known
- English in player-visible text: folded into 2.4.
- The battle map's painted top-down background: confirm a live fight draws it (the synthetic preview shows a dark grid
  only); if the live path does not request it, wire it as `LIVE2D_1.md` Part 2 says.
- The hidden layer's prep on the owner's existing campaign runs once on the next session start (B1); confirm it is
  armed for «Приключения начинаются» after the sandbox load and never shown.

## Done when
Probes green, suite green, the report lists each item with its test and the money; `docs/SANDBOX_LOAD_FIX_S2.md`
re-checked against the candidate's final migration list; `DEV_STATUS.md` top section updated.
