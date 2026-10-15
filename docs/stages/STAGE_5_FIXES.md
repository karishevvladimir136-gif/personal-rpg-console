# Stage 5 — review fixes

Branch: continue on `claude/stage-5-ui` (pushed at `05d333a`). Stage 5 is accepted; this is a short polish pass from the
owner-side review of the 48 screenshots in `docs/screens/stage-5/`. Same rules as `STAGE_5.md`: universal by design (no
campaign or ruleset hardcoding in components), no changes to stage 2b–4 paths, nothing to `main`.

## Fixes

1. **Roll card breaks on phones** (`game-phone`, `game-moment-dice-phone`). At 390 px the label column collapses to one
   word per line, the DC badge overlaps the label and the dice icon disappears. On narrow widths stack the card: icon and
   label on the first row, DC badge and result on the second. Check at 360 and 390 px.
2. **Hidden horizontal overflow on Character and Inventory phones.** The full-page captures are 421 and 422 px wide while
   `index.json` reports 0 px overflow, so the check is masked (probably `overflow-x` clipping on an ancestor). Visible
   result: the sheet tabs row is cut off on the right («Заклинания и умения»), and the doll's right column truncates
   («Торба контрабанди…»). Let the tabs wrap or scroll inside their own row, let slot labels wrap to two lines, and make the
   screenshot check catch clipping too (for example, compare every element's right edge with the viewport, or fail when
   the captured image is wider than the viewport).
3. **Mixed English labels in a Russian campaign**: «Armor class», «Spell dc», «Spell slots 1», «Sorcery points», «Gold»,
   «Crew», «Cargo», item categories «Tool» and «Misc», «ARMOR CLASS» on party cards. These come from record and ruleset
   data, so add a display-label layer, not component strings: use a localized label if the ruleset or record provides one;
   otherwise a translation table for common keys in the locale files; otherwise the raw label. The English «Neon & Rain»
   sample must stay English. Also drop the monospace font from the stat line on the game screen's hero card.
4. **Item tiles without a picture are unreadable.** In the inventory grid 7 of 10 tiles are the same box icon, and one is
   «…» with a count. Until a picture exists, show the item's short name (two lines, small) with a category glyph; keep
   the box only for items with no name. The same applies to the hold on the Holdings screen.
5. **Too many «появится позже» blocks.** Party cards repeat the same four-line placeholder on every card; Codex and
   Journal side panels repeat it too. Rule: no per-record placeholders. Hide the missing block on each card, and show at
   most one short line per screen about what will appear later. Keep a section placeholder only where the section is
   the point of the screen (Journal «Главная арка»), and make it one line.
6. **Broken portrait shows alt text** (Codex, «Ирэна» shows «рис…»). When an image fails to load, fall back to the
   initial-letter avatar. Apply the same fallback everywhere portraits are shown.
7. **Map.**
   - Clustered pins overlap: «Белая башня», «Алькантара», «Лиссабон» and «Пещера дома Альвареш» cover each other. Add
     simple label collision handling: offset labels, hide the lower-priority ones until hover or tap, and keep the
     current place always visible.
   - Remove the duplicate title: the page header and the atlas header both say «Атлас знакомых мест».
   - The travel hint builds «Я отправляюсь в Женева», which is wrong in Russian because the place name would need
     declension. Use a phrase without it, such as «Отправляюсь. Цель — Женева.»
8. **New-campaign wizard hardcodes `medium` effort** (`library-screen.tsx`). Use the selected model's own default from
   its capabilities, the same way the server does. Final defaults are chosen in Stage 4.
9. **«Dungeon Master» in the English UI** (sidebar and settings), which is wrong for a noir campaign. Use «Game Master».
   Do not touch the DM prompt here; Stage 4 owns it.
10. **Quick prompts in the companion talk drawer are masculine** («Что ты заметил?» to Мэг). Use gender-neutral
    wording, or the record's gender if the app has it.
11. **The player's message in the story uses a letter avatar** («Д») although the hero has a portrait. Use the portrait
    when there is one.

## Also record, do not fix here

- fal returned `validation` errors on the first try for 5 of 22 calls, all of them portraits; they succeeded on retry.
  Log the error body once (no keys), find the cause, and write it in `docs/UI_DATA_NEEDS.md` for Stage 4's autopilot,
  which must not retry in a loop.

## Checks

typecheck / lint / test / build. Re-capture only the affected screenshots (game, character, inventory, holdings,
party, party-talk, codex, map, new-campaign-dm, noir-*), with the strengthened overflow check passing on every phone
shot. No paid calls. Update the Stage 5 part of `DEV_STATUS.md`, commit, push `claude/stage-5-ui`. Report in English:
each fix and how it was checked.
