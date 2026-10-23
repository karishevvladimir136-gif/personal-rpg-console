# Fixes from the owner's acceptance pass — before session 3

Source: the owner's pass over the sandbox on 2026-10-22 19:00–19:45 (`docs/runs/s3-acceptance-notes.md`, his words). Cloud
session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/s3-candidate`**
itself. Nothing to `main`. Paid probes within **$15**, ledger `docs/runs/fix-s3-accept-ledger.md`; report in English
`docs/runs/fix-s3-accept-report.md`; talk to the owner in English, briefly. Every item ends with a test; the stage ends
with the full suite on a clean worktree, typecheck, zero-warning lint, the production build, `docs/SANDBOX_LOAD_FIX_S2.md`
updated for any new migration, and the three Russian checklists updated where a path changed.

**First:** fetch `origin/claude/s3-sandbox-fixes` (three commits made on the owner's PC during the pass: the `--prod`
launcher opt-in flag, the double «Подготовить сцену» guard, the forced region redraw) and merge it into the candidate
before anything else; run their tests.

Order is by what breaks play, then what the owner will look at most. All of it is before session 3 (owner: «давай
правки делать и начнем сессию»).

## Г — the sheet's numbers (combat correctness)
- **Г3 AC is derived, not stored.** Today «Защита» is a number written once: the robe of the battle mage (+1 AC with no
  armour and no shield) worn or removed leaves 12. Do: AC = base (10 or the armour's) + Dex (as the armour allows) +
  bonuses of worn items (robe, shield, ring of protection) + active effects (Mage Armor → 13 + Dex, Shield → +5 until the
  next turn); computed on the server from the equipped set and effects, read by the sheet, the doll, the battlefield block
  and `combat attack` — one number everywhere. Saves get the same treatment (the ring's +1 to all saves). Rules live in
  the 5e rules module, not in generic code. Tests: robe on/off → 13/12; Mage Armor active → 15; `combat attack` uses the
  derived AC; a non-5e campaign keeps its stored number.
- **Г1 the labels.** In a 5e campaign the sheet's plates read «КД», «Атака», «Навык» (labels from the rules module), each
  with a breakdown on hover/tap: «10 + Ловкость 2 = 12 · с Доспехами мага 15», «+4 Инт +3 мастерство». Test: labels and
  breakdown text.
- **Г2 the counter «Shaman tusk»** still shows its English key on the sheet; `counterLabel` is not applied there. Sweep
  every counter rendering. Test extends `tests/i18n.test.mjs`.

## В — spells as items (the hero is a wizard; owner: «надо этот раздел прям прикольно сделать»)
- **В1.** The sheet already holds the spells as prose in «Умения» (cantrips: Огненный снаряд, Электрошок, Волшебная
  рука, Сообщение; prepared by level: Щит, Доспехи мага, Огненные ладони / Палящий луч, Туманный шаг, Удержание личности /
  Огненный шар, Молния, Контрзаклинание). Do: a structured spell record per spell, like an item — name, school, level,
  casting time, range, components, duration, full text (own words, 5e SRD-level), a picture drawn like item pictures
  (sigil or image), history («выучено в Кормире», «переписано со свитка»), and `known` / `prepared` flags. The tab gets
  three sections: **Заговоры**, **Книга заклинаний** (everything written in the book — the wizard's mechanic), **Подготовлено
  сегодня** with a toggle from the book; a school filter on top; the slot pips stay and a spent slot dims at once when the
  server records the cast. A one-time migration/conversion turns the «Умения» prose of the owner's campaign into records
  (names above; the texts the stage writes, in Russian); the DM's `sheet`/`records` tools can add a spell. The DM's
  context gets the structured list instead of prose. Tests: conversion on a fixture sheet; prepared toggle; slot dims on
  a recorded cast; pictures requested within the cap.

## Б — the 2D screen
- **Б4 play from the 2D screen.** Today a hotspot click writes «Осматриваю Дома кузнецов» into the composer on the text
  screen and offers «Открыть текст». Do: the composer under the scene (hotspot fills it, the owner edits and sends here),
  the turn runs the same path as «Игра», the DM's answer appears under the picture with rolls, cards and companions, the
  turn's frame lands in the scene; «Игра» stays as the text mode. Test: a turn sent from the 2D route commits and renders.
- **Б2 hotspot descriptions in English** («The main door of the guard post…»): the scene generator describes in the
  campaign's language; existing scenes get their descriptions redone once (cheap call). Test: the generator's prompt and
  output language; `tests/i18n.test.mjs` covers hotspot text.
- **Б3 too few hotspots** (2–3 per scene): the generator must give 5–8 — every object a player would look at or walk to
  (door, window, barrels, road, fence, houses, the bell tower) — as a rule with a minimum, re-asked once if short. The
  mismatch list behind «Картинка не сошлась с записями» is shown on «Ещё» (today nothing is listed).
- **Б1** (double prepare, done on the PC) — only verify after the merge.

## Д — the map (one block; owner's design 19:36–19:44)
- **Д1 the map is a tree of places.** World → region → settlement → place → scene; each place knows its parent. The
  screen opens at the deepest level that has content and skips empty ones (today: the region). A village is one picture
  with markers (guard post, elder's house, smithy); a city gets its own plan with districts, each district can open
  further. Breadcrumbs replace the «Мир / Регион / Окрестности» tabs; down by marker, up by crumb; the 2D scene is the
  leaf. The old atlas's extra sections («Изменить размещение», «Исправить записи», «что, если») fold under one «Ещё».
  The «Карта» nav entry opens this; the old atlas route is removed.
- **Д3 the DM designs the region first, then the painter paints it.** Two steps: (1) a region prep as text by the DM —
  geography, rivers and roads, where each settlement is and what lies between, distances in days, what the heroes know
  vs what stays in the hidden layer — stored in the canon and surviving redraws; (2) the picture painted from that text
  with the places listed by role, and markers placed on their objects and checked by the same mismatch control the
  scenes use (today the guard post's marker sits at a bridge downstream, not in the town). All known places from the
  records appear: visited bright, known-by-hearsay dim, «положение примерное» where the canon gives no position. A
  redraw changes the picture, never the geography. Same later for a city plan.
- **Д2** (forced redraw, done on the PC) — verify after the merge.

## А — inventory and item cards
- **А1 grid, one inventory at a time.** The hero's inventory as cells (like before), not a list, and only one inventory
  on screen: the hero by default, companions and saddlebags through the portrait switch (the per-companion view already
  exists). A type filter on top: всё / оружие / доспех / украшения / расходуемое / снаряжение / инструмент / разное;
  worn items marked on the cell.
- **А2 item history off the card.** «появилось / снято / надето» lines go under a collapsible «История»; an «появилось»
  entry identical to the description is not shown at all.
- **А4 buttons only where they apply.** «Надеть» only for items with a slot; «Использовать» only for consumables and
  items with an action (potion, scroll, food, signal horn, the taper); a clue keeps «Вид вещи» and «Отдать».
- **А3 data fix:** the ring of minor protection is worn on «Кольцо (правая)» and its description loses «у куклы пока нет
  слота для колец».
- **А5 companion dolls.** The doll frame shows the companion's portrait stretched; draw a full-length figure per
  companion (from description and gear) like the hero's, with «Перерисовать»; within the pictures' cap.

## Е — session close
- **Е1 portraits on the «Судьбы» cards** instead of initials: people with a portrait in «Люди» use it; the rest are drawn
  in one batch at chapter close within the cap, «Перерисовать» on click.

## Done when
Probes green, suite green, the report lists each item with its test and the money; the owner reloads the sandbox by
`docs/SANDBOX_LOAD_FIX_S2.md` and plays the 6–8-turn prose check before session 3.
