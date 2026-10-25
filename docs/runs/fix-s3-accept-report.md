# Fixes from the owner's acceptance pass — report

Stage: `docs/stages/FIX_S3_ACCEPT.md` (on `claude/handoff`), done on `claude/s3-candidate` itself. Nothing went to `main`.
The owner's words: `docs/runs/s3-acceptance-notes.md`. Paid calls: **$0.98 of the $15 cap**, all in
`docs/runs/fix-s3-accept-ledger.md`. Implementation is complete; the owner's acceptance is not.

First, `origin/claude/s3-sandbox-fixes` (the three commits made on the owner's PC: the `--prod` opt-in, the double
«Подготовить сцену», the forced region redraw) was merged into the candidate (a fast-forward); its tests passed (20/20),
and the full suite on the merged candidate was green before any change (2 845 tests · 2 818 pass · 0 fail · 27 skipped).

## In short (for the owner)

- **The sheet's numbers.** In your 5e campaign «КД» is counted, not written once: armour or 10, Dexterity, the shield,
  the robe of the battle mage (+1 with no armour and no shield), the ring of protection, «Доспехи мага» (13 + Dex),
  «Щит» (+5 until your next turn). One number on the sheet, the doll, the fight screen and in the server's attacks.
  Saves the same way. The plates read «КД», «Атака», «Навык» with a breakdown on hover or tap. «Клык шамана» in Russian.
- **Spells as items.** «Заговоры», «Подготовлено сегодня», «Книга заклинаний», a school filter, a card per spell with
  its picture and history. Your «Умения» lines become 13 cards on the first open of «Персонаж».
- **2D.** The action box and the DM's answer under the scene; hotspot notes in Russian; 5–8 hotspots; what did not
  match the records listed under «Ещё».
- **The map.** A tree of places with breadcrumbs; «Карта» opens it at the deepest level with something to show. The
  region is designed by the DM first (rivers, roads, where each place is, days of travel; the hidden part stays
  private), then painted from that text; markers sit on their objects. On the probe the guard post is inside the village.
- **Inventory.** Cells, one inventory at a time (the hero; companions, saddlebags and «здесь лежит» through the
  portraits); a type filter; «Надеть» and «Использовать» only where they apply; history folded; your ring worn on
  «Кольцо (правая)»; companions get full-length figures on their dolls.
- **«Судьбы».** Portraits instead of initials; the missing ones drawn in one batch.
- **«Пожелания к приключению»** (added to the stage on 22.10 20:10): a second field beside «Тайны», only for the DM, any
  length — what you want the adventure to be. The DM's hidden-layer prep builds on it; you will not see it in play.
- **Manual setup:** none beyond the sandbox load (`docs/SANDBOX_LOAD_FIX_S2.md`, now five migration ranges). Two
  migrations change a record of yours: `202610230501` (the counter's name «Клык шамана») and `202610230521` (the ring).
  Step 7 of the load is now your 6–8-turn test campaign on the production build, as you decided. Five migrations in
  all (`202610230501`, `…511`, `…521`, `…541`, `…551`), all additive.

## Money

| Block | What | Spent |
| --- | --- | --- |
| Б | the scene sheet on 3 Russian places and one redo, first on Sonnet 5 (while 5.5 was unreachable), then on Sonnet 5.5 | $0.07 |
| Д | the region probe (prep → picture → check) and the diagnosis of a refusal on Opus 5, then the final run on Opus 5.5 | $0.79 |
| В | two spell pictures («Огненный шар», «Щит») through the app's spell prompt | $0.11 |
| — | the model-access check (two 1-token calls) | $0.0001 |
| **Total** | | **$0.98 of $15** |

## Г — the sheet's numbers

### Г3 AC is derived, not stored
- `src/lib/live2d/battle/rules-5e.ts` (the 5e rules module, next to the attack rules): AC = base (10, or the body
  armour's from its own words or the SRD name) + Dex as the armour allows + a worn shield + bonuses of worn things
  (`detail.bonuses` first, else the item's words; conditions such as «нет доспехов и щита» honoured) + effects (Mage
  Armor 13 + Dex with no armour; Shield +5, a fight condition the server ends at the caster's next turn). Saves the
  same (the ring's +1; the SRD class table when a sheet lists no save lines). Pathfinder and every non-5e system keep
  their stored number.
- On the server: `readPublicCampaign` attaches each person's numbers (`withDerivedSheets`, the optional `Entity.derived`);
  the sheet, the party cards, the doll's «КД» badge and the battle block read them; `combat attack`
  (`fightAttack` in `execute.ts`) uses the derived AC for a party target, with the fight's conditions.
- The DM records lasting effects with `upsert_character.conditions {add, remove}` (the hero too, with a reason) — the
  first way the DM can set a condition outside a fight. Mage Armor has no automatic 8-hour end (the DM removes it).
- The owner's «КД вручную» (sheet editor) outranks the rules; empty returns to them.
- Tests (`tests/fix-s3-accept-g.test.mjs`): «Г3: robe on/off → AC 13/12…», «Г3: Mage Armor active → 15; Shield +5 until
  the caster's next turn…», «Г3: the ring's +1 to all saves…», «Г3: a non-5e campaign keeps its stored number…»,
  «Г3: the owner's «КД вручную» outranks the rules…», «Г3: computed on the server…», «Г3: `combat attack` uses the
  derived AC…» (PGlite: 13 → 16 with Mage Armor → 21 with Shield, Shield cleared at the hero's turn), «Г3: in a campaign
  of another system `combat attack` keeps the sheet's stored number».

### Г1 the labels
- `sheetPlates` (`src/lib/ui/campaign-view.ts`) feeds the sheet, the party cards and the game screen's hero line:
  «КД», «Атака», «Навык», each with its breakdown («10 + Ловкость 2 = 12 · с Доспехами мага 15», «+4 Инт +3 мастерство»).
- Test: «Г1: in a 5e campaign the plates read «КД», «Атака», «Навык», each with its breakdown».

### Г2 «Shaman tusk»
- Cause: the counter `shaman_tusk` was recorded with no name; the earlier sheet and records under «Ещё» printed raw keys.
  Every counter rendering now goes through `counterLabel`; migration `202610230501` names the owner's counter
  «Клык шамана» once (a name already given is never touched).
- Test (`tests/i18n.test.mjs`): «Г2: every counter rendering names the counter in the campaign language — «Клык
  шамана», never «Shaman tusk»» (source scan and the migration on PGlite).

## В — spells as items

### В1
- Records: a spell keeps an id, its school and its own history (`src/lib/inventory/model.ts`, `sheet.ts`); migration
  `202610230511` widens the sheet check and adds the picture kind «spell».
- The texts: `src/lib/inventory/spell-records.ts` — **13** Russian cards (the spec lists 4 cantrips and 9 levelled
  spells), own words at the 5e SRD level, every field. The conversion is TypeScript (texts and parsing in one place),
  saved as the owner's ordinary sheet correction (a new revision, its receipt kept) on the first open of «Персонаж»
  when no turn is running; the DM's first sheet write converts too. Non-spell lines stay.
- The tab: `src/components/registry/spells-tab.tsx` — «Заговоры», «Подготовлено сегодня» (slot pips), «Книга
  заклинаний» with the prepare toggle, a school filter, a tile per spell (its picture or the school's sign), the card
  with «История», «Колдовать» with a slot picker, «Нарисовать / Перерисовать».
- The DM: the sheet tool takes school, time, range, components, duration, `known` and a history line (a spell with a
  card gets the card's missing fields); `resource` takes `spell` and is refused for a cantrip, a too-low slot, a spell
  not on the sheet or not prepared; the context lists one line per spell. The instructions (en, ru) say a levelled cast
  spends its slot.
- The slot dims at once: an accepted `resource` sends the new counter value in the live stream and the game screen's
  pips apply it; the spells tab shows it after the commit's refresh.
- Pictures: the subject kind and composition «spell», the same path, price and daily cap as things; the autopilot
  draws spells after things. Probe: «Огненный шар» and «Щит» (`docs/samples/spells/`, $0.108) — a sigil with its effect,
  no people, no text.
- Tests (`tests/fix-s3-accept-v.test.mjs`): «В1: the cards…», «В1: conversion on a fixture sheet…», «В1: conversion on
  a fixture campaign…», «В1: prepared toggle…», «В1: the DM's sheet tool adds a spell like a thing…», «В1: slot dims on a
  recorded cast…», «В1: pictures requested within the cap…».

## Б — the 2D screen

### Б4 play from the 2D screen
- `src/components/live2d/scene-play.tsx` mounts the same `GameplayComposer` as «Игра» under the scene picture (the same
  send, stream, resume and «Дальше»); a hotspot fills the shared draft; the answer shows rolls, cards and companions;
  the turn's frame sits in the corner of the picture (`SceneFrame`). The route reads play through the same runtime as
  «Игра». The shared aftermath (changes this turn, «Твой момент», the addressee) moved unchanged to
  `src/components/registry/turn-aftermath.tsx`.
- Test: «Б4: a turn sent from the 2D route commits and renders…» (a real DM-loop turn on PGlite, rendered under the
  scene; no second send path).

### Б2 hotspot descriptions in the campaign's language
- `sheetRequest` writes the player's text in the campaign's language; an English `brief` per hotspot stays for the
  illustrator, the check and the locator. Older English sheets are redone once on the first read of the 2D board (cheap
  model, failure-safe, a new sheet revision, the owner's notes kept, no marker moves).
- Tests: «Б2: the generator's prompt and output language…», «Б2: an older English scene sheet is redone once…», «Б2:
  the redo is failure-safe…», and in `tests/i18n.test.mjs` «Fix S3-accept Б2: a Russian campaign's 2D hotspots read
  Russian…».
- Probe on the app's model (Sonnet 5.5): three Russian places → 7, 7 and 6 hotspots, all Russian, on the first ask; the
  redo turned an English guard post Russian. Record `docs/runs/fix-s3-accept-b-probe.json` ($0.037).

### Б3 5–8 hotspots; the mismatch list
- The rule with a minimum in code: a short (or English) sheet is asked once more and the better answer kept; more than 8
  trimmed, must-show kept. «Перерисовать» on a scene with fewer than 5 writes a new sheet first. The mismatch list
  (`src/components/live2d/scene-mismatches.tsx`) at the top of «Ещё».
- Tests: «Б3: 5–8 hotspots…», «Б3: the mismatch list…».

### Б1 the double «Подготовить сцену»
- Verified after the merge: `tests/live2d-prepare-twice.test.mjs` passes; the second request joins the first.

## Д — the map

### Д1 the map is a tree of places
- Places nest world → region → settlement → place → scene; a place's parent is the record's, else the region prep's
  (presentation only). «Карта» (`MapRoute`) opens at the deepest level with content; «2D» at the current scene. Breadcrumbs
  replace the tabs; one tap on a marker goes down; a place with nothing below gets a card with «Идём туда». The old
  atlas route is gone from the campaign; its tools («Изменить размещение» — drag the painted region's markers, «Исправить
  записи», «что, если») are under one «Ещё» (`src/components/live2d/map-more.tsx`). The old atlas components stay for the
  synthetic previews only.
- Tests: «Д1 the map is a tree of places…», «Д1 «Карта» opens the tree; the old atlas route is gone…», «Д1 down by
  marker, up by crumb…».

### Д3 the DM designs the region first
- `src/lib/live2d/region-prep.ts`, `region-marks.ts`, `server/region-vision.ts`, `server/region.ts`: the DM's prep (the
  campaign's DM model, off the turn, failure-safe; once per region, amended only for new places) → the public part as a
  versioned canon document «Карта края — …», on the map row and in append-only versions (the owner's edits to the
  document kept); the hidden part only in the DM's private notes → the picture from the public text with places by
  role → the scenes' check locates every place; a place drawn outside its settlement is a mismatch and its marker goes
  inside → a flagged map lists what did not match. A redraw reuses the prep: a new picture, the same geography. Every
  known place appears: visited bright, hearsay dim, «положение примерное» without a position.
- Migration `202610230541`: the prep's storage (new columns with defaults, a versions table, two new actions); no row
  changes.
- Tests: «Д3 all known places appear…», «Д3 the region's prep…», «Д3 the painter paints from the prep…», «Д3 markers on
  their objects…», «Д3 the calls fail soft…», «Д3 the check asks for pixels…», «Д3 migration 202610230541…».
- Probe (synthetic «Заречье»: a guard post the records never put inside the village, a bridge downstream, hearsay
  places). On Opus 5 (while 5.5 was unreachable) the prep was refused as «cyber» whenever it opened like a role prompt;
  found by removing one line at a time and reworded in plain words. The check now asks for pixels (steadier than
  fractions on the probe). Final run on the app's models (Opus 5.5 prep, GPT Image 2.5 picture, Sonnet 5.5 check):
  8 places, 3 routes, the guard post inside Заречье, nothing secret in the public prep, the canon or the brief; 4/4
  places found, nothing invented; the guard post's marker on the north gate tower, inside the village ($0.090). Picture:
  `docs/samples/live2d/fix-s3-accept-d-region-first-3b5f6c-markers.jpg`.

### Д2 the forced redraw
- Verified: `tests/live2d-region-redraw.test.mjs` passes unchanged; the redraw only paints («Д2 the forced redraw
  stays…»).

## А — inventory and item cards

| Item | What changed | Test (`tests/fix-s3-accept-a.test.mjs`) |
| --- | --- | --- |
| А1 grid, one at a time | cells; one holder on screen (the hero; companions, saddlebags, «здесь лежит» through the portrait switch); the filter всё / оружие / доспех / украшения / расходуемое / снаряжение / инструмент / разное with counts; worn marked on the cell; drag onto a portrait hands over (`src/lib/inventory/grid.ts`, `src/components/registry/inventory-grid.tsx`) | «А1: the type filter…», «А1: worn items are marked on the cell…», «А1: one inventory at a time, as cells…» |
| А2 history | under a folded «История · N»; an «появилось» equal to the description hidden | «А2: …» |
| А4 buttons | «Надеть» only when a slot takes it; «Использовать» only for consumables, charges, or a described use (words, no item names in code); «Вид вещи» and «Отдать» always | «А4: «Надеть» only for items with a slot», «А4: «Использовать» only…», «А4: a clue keeps…» |
| А3 the ring | migration `202610230521`: by shape, the phrase removed, worn on «Кольцо (правая)», a new revision with two history lines; idempotent | «А3: the ring of minor protection is worn…», «А3: the data fix is a migration…» |
| А5 companion dolls | every companion gets a full-length figure after its portrait (the autopilot, within the cap); until then the portrait at its own size; the doll's «Перерисовать» redraws the figure | «А5: …» |

## Е — session close

### Е1 portraits on «Судьбы»
- A card shows the portrait «Люди» shows (the person the digest linked, else the one record of that name); the missing
  ones are queued as one batch after the digest is written, and once when a closed chapter is shown with portraits
  missing (`pictures.fates`); a click opens «Перерисовать».
- Test: «Е1: «Судьбы» cards show the portrait from «Люди»…».

## Ж — the owner's wishes for the adventure

### Ж1 «Пожелания к приключению»
- Migration `202610230551` (additive): the DM-only store of «Тайны» admits a campaign's `wishes`; `rpg_dm_secrets` reads
  and saves them as `campaign_wishes` (owner-only, revisions, the store's 20 000 limit — free length); the DM's source
  carries them as `dmSecrets.wishes`, server-only like «Тайны».
- Only the hidden-layer prep reads them (`buildPrepRequest`, `ownerWishesText`): «a wish to build the hidden layer
  toward, not an established fact; never quote it to the player». A turn's context does not carry them; the player's
  snapshot and play never do. The rebuild's instructions name them beside «Тайны».
- The settings: a separate block «Пожелания к приключению (видит только ведущий)» under «Тайны» (five rows, free length);
  saving a changed text rebuilds the layer once, as «Тайны» do. «Тайны» keep their one-line steer.
- The wizard: the same field on «Во что играем?», saved to the DM-only store (never into the adventure's text, which the
  player's screens show) with `rebuild: false` — the campaign has no opening yet; its first prep reads the wishes.
- Tests (`tests/fix-s3-accept-zh.test.mjs`): «Ж1: the prep's input contains «Пожелания к приключению»; the player's
  snapshot never does» (PGlite: stored apart from «Тайны», owner-only, conflicts, the 20 000 bound; the source, the prep
  request and its rebuild carry it; a turn's context, the player's snapshot, play and records do not), «Ж1: the field
  beside «Тайны» on the settings and in the wizard…». The older «KF-hidden-layer» test follows the new `rebuild` guard.

## How it was done

Five blocks were built in parallel in separate worktrees and merged in the stage's order (Г, В, Б, Д, then А+Е). The
container restarted once (memory, five workers); nothing was lost; after it the owner set two workers at a time and no
test suite while workers ran. Merge resolutions: both blocks' DM tool fields (the hero's conditions, spells) kept, the
tool schema trimmed to 13 494 / 12 443 estimated tokens and its bound raised from 13 500 / 12 500 to 14 000 / 13 000; the
2D route serves both «Карта» and «2D» through the play runtime; the doll moved to `inventory-grid.tsx` keeps the AC
badge; the stage's four migrations in the saves test in name order; the test fixtures now apply every migration (the
old «99» was all of them, and this stage passes 99 files).

**Model access during the stage.** From about 03:46 to some time before 04:48 UTC the app's Anthropic key got HTTP 403
`permission_error` on `claude-opus-5-5` and a model listing without the 5.5 models; the same key (unchanged all session)
reached both again at 04:48. The blocks' first probes ran on Opus 5 / Sonnet 5 (records kept as `*-substitute.json`);
the final probes ran on the app's own models.

## Checks

- **Final, at `c806ad8`** (every block and Ж1; later commits are documents only), on a clean worktree without
  `.env.local` and without the cloud's key variables: the full suite **2 893 tests · 2 866 pass · 0 fail · 0 cancelled ·
  27 skipped** (33 min); typecheck pass; lint pass with zero warnings; the production build pass, no warnings.
- Before Ж1, at `7eb8277`: 2 891 · 2 864 pass · 0 fail · 27 skipped; typecheck, lint and build pass. The run before it
  (at `a6864b8`, the five blocks just merged) caught two tests that predated the merge of Б and Д (the 2D route's source
  pattern; the records provider the scene's action box needs); both followed the merged screen, nothing in the code
  changed.
- The baseline on the candidate with the owner's three PC commits, before any change: 2 845 · 2 818 pass · 0 fail ·
  27 skipped.
- The DM tool schema re-measured after the merge: 17 tools, 13 494 (OpenAI) / 12 443 (Anthropic) estimated tokens; the
  bound raised to 14 000 / 13 000 (`tests/stage4-dossier.test.mjs`).
- The test fixtures apply every migration (the old «99» was all of them when written; this stage passes 99 files).
- `docs/SANDBOX_LOAD_FIX_S2.md` re-checked against the final migration list (five ranges; `202610230501`–`551` listed,
  `0501` and `0521` marked as changing a record); the two checklists updated where a path changed; the index lists what
  changed. `package.json` and `pnpm-lock.yaml` have no `litellm` (or any new) dependency.

## Needs the owner

1. **«Изменить размещение»** on the new map means dragging the painted region's markers; the old level/parent form is
   gone (parents come from the records and the region prep). A city's own painted plan is left for later.
2. **«Перерисовать» on a scene with fewer than 5 hotspots** writes a new scene sheet first (one call ≈ $0.012) — otherwise
   your guard post would never gain hotspots.
3. **«Использовать»** follows the thing's words. If the signal horn or the taper say nothing about how they are used,
   the button will not show: set «Вид вещи → Расходуемое», or the DM adds the properties.
4. **«Доспехи мага»** has no automatic 8-hour end: the DM (or you) removes the condition.
5. **The spells' conversion** runs on your first open of «Персонаж» as your own sheet correction (13 cards; the old
   sheet stays in the history).
6. **The new DM ability:** the DM can now set lasting conditions on your hero outside a fight (with a reason shown to
   you) — that is how «Доспехи мага» counts in the AC.
7. **Not verified, from the Б worker:** on «Игра» the composer is keyed by the addressed companion; typing «Тобин, …»
   might make the box remount. Not changed in this stage; the 2D box decides the addressee only at send time.
8. Acceptance: the two updated checklists (`docs/runs/fix-s2-acceptance.md` section 9, `docs/runs/live2d-1-acceptance.md`
   section 2а) and the 6–8-turn prose check before session 3.
