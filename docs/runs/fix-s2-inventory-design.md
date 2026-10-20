# Fix S2, stage D — records and inventory, fixed once

Scope: the one model for items, counters, money, the doll, gear, moves, ledger guards, companion cards, spells and sheet
changes. Combat (the `combat` tool, battle map, enemy HP panel) is the parallel session's; this note only decrements
ammunition inside `roll` receipts. Every record is per campaign, every change goes through validated tool calls or an
owner correction; the owner's correction always wins. "Keep" marks what the current code already does right.

## 1. One source of truth
- **An item** is a row of `rpg_items`: name, kind (`category`), quantity, free-text `mechanics`, owner, storage, equipped slot,
  `detail` (history, lent/pledged status — keep). Kinds: `weapon, shield, armor, clothing, jewelry, accessory, ammunition,
  consumable, tool, gear, misc` (today's six plus five real kinds; `possession` disappears). Potions are `consumable`
  items, arrows and bolts `ammunition` items; «Использовать» / `item consume` lowers the stack (keep).
- **A counter** is an `entity.resources` key with its `_max` (keep) and lives only for pools: HP (the columns), spell slots
  per level (`spell_slots_N`), hit dice, class charges (ki, arcane recovery), sorcery points and the like. Charges of an
  item (a wand, a tusk) are a counter **on the item** — `detail.charges {value, max}` — never an entity counter named after
  the thing. Every counter has a label in the campaign language (`entity.resource_labels[key]`, §6).
- **Money is neither** (§2). The `resource` tool rejects `currency_*` keys and any name that is a potion or coin word, with
  the hint «potions are items (item create consumable); money is money (money grant)».
- **Conversion** (migration, §10): a counter on a player/companion/npc whose key or review label matches the potion list
  (`potion`, `potions`, `healing_potion(s)`, `elixir`, `зель*`, `эликсир*`) with value ≥ 1 becomes one `consumable` item
  named from the review label (else from the key, in the campaign language) × value in the owner's own storage, merging
  into an identical stack if one exists; the key and its `_max` are removed; value 0 is just removed. It never touches
  `hp`, `spell_slots*`, `hit_dice*`, `_min`/`_max` of other pools, unmatched keys, items, scenes, saves or turns.

## 2. Money: a wallet per character
- `rpg_entities.wallet` and `rpg_storages.wallet` (jsonb maps currency code → integer ≥ 0, non-negative enforced in SQL).
  Everyone who can hold things has a wallet: the hero, companions, NPCs (a body keeps its purse), mounts and transports
  (coins in the saddlebags), places and bases (a chest). Money is never an `entity.resources` key again.
- The campaign's **currency system** is a settings list in order of value, each with code, full name and value in the
  smallest coin: 5e `пм 1000 · зм 100 · эм 50 · см 10 · мм 1` (platinum, gold, electrum, silver, copper), written by the
  world/hero step from the system's knowledge and editable by the owner. A campaign with no list keeps today's rule
  (keep): the first currency word recorded becomes the one canonical currency; `sameCurrency` inflection matching stays.
  With a list, `money` resolves the DM's word to a code («золотые», «зм», «gold» → `зм`); an unknown word is rejected
  with the list as the hint.
- **Display**: one line everywhere («Персонаж», inventory header, party card): «Кошелёк: 10 зм · 11 см · 26 мм» in the
  list's order, zero coins hidden (all zero → «Кошелёк: пусто»), the full name on hover («золотые монеты»), never «Зм».
- **Starting money is money**: the review screen marks each resource entry «деньги» or «счётчик» (a money entry has a
  currency); creation writes money entries into the hero's wallet and counters with `_max` into resources (item 28).
- **Found money lies where it lies**: coins in a chest or on a body are `money grant` to that storage's or body's wallet
  the moment the story shows them; taking them is `money transfer` (a move, never a second mint). **Splitting**: the
  owner's «Разделить…» on the wallet line (amount per currency → Брам / Тоби / седельные сумки) is an owner move (§5); the
  DM uses `money transfer`.
- **Double-grant guard**: `money grant` gains `sourceRef` (the chest, the body, the quest, the employer — what the money
  came from). The server keeps a private list of paid grants (sourceRef or normalised reason, currency, amount, turn,
  recipient). A grant with the same sourceRef, or the same normalised reason and currency within the same session, is
  rejected with the hint «уже выплачено (ход N, 80 зм — из сундука)»; the retry needs `repeat: true` and a reason that
  names why this is new money. Quest rewards stay with `quest claim_reward`, paid exactly once (keep).

## 3. The doll (equipment slots)
- One universal slot set for every humanoid record (hero, companions, NPCs), replacing `humanoidSlots` (loop), the
  12-slot `universalSlots` (UI) and the SQL `bootstrap_humanoid_slots` (a new function; the old is left as is):
  `head` Голова (armor, clothing) · `amulet` Амулет (jewelry, accessory) · `cloak` Плащ (clothing, armor) · `body`
  Броня/одежда (armor, clothing) · `gloves` Перчатки/наручи (armor, clothing, accessory) · `belt` Пояс (gear, accessory,
  tool, clothing) · `boots` Сапоги (armor, clothing) · `ring_left` Кольцо (левая) (jewelry) · `ring_right` Кольцо (правая)
  (jewelry) · `hand` Основная рука (weapon, tool) · `offhand` Вторая рука (weapon, shield, tool, gear). No «Ноги».
- **Mapping of existing records**: `head→head, neck→amulet, body→body, hand→hand, offhand→offhand, belt→belt, boots→boots`;
  UI ids `talisman→amulet, ring1→ring_left, ring2→ring_right, cloak, gloves` as named; a `legs` item is unequipped by the
  migration and stays in the owner's inventory (the migration log lists them). What a hero wears stays on (item 33).
- **«Надеть / Снять» on every item card** (character, inventory and holdings screens) and **drag to the doll**: an owner
  move (`item.equip`, §5) validated by the same TypeScript rule as the DM's `item equip`: the slot is chosen by kind
  (first free fitting slot, rings left then right), a kind picker appears when the item fits no slot and saves the kind
  on the item (item 27). The DM's `equip` keeps its rejection that lists the fitting slots (keep).
- **Two hands**: an item with `detail.hands = 2` (set at review, by `item create/modify hands`, or by the kind picker;
  the DM sets it when the system's rule says two-handed) occupies `hand` and blocks `offhand` (shown «занято: посох»);
  equipping into `offhand` then is rejected with that reason. Versatile weapons are one-handed records.
- **Starting items equipped at creation**: the review screen gives each possession a kind and a «надеть» toggle (default
  guesses by head noun only: посох/меч/кинжал/лук/арбалет → weapon, кольцо/амулет → jewelry, плащ/мантия/роба/шляпа/сапоги
  → clothing, зелье → consumable, стрелы/болты → ammunition; anything else → gear, owner confirms); creation writes kind,
  `detail.hands`, `detail.bonuses` and the equipped slot. Existing `possession` rows are converted by the same head-noun
  rule, else `gear`.
- **Bonuses reach rolls**: an item's structured bonuses are `detail.bonuses: [{to, value}]`, `to` in the sheet's words
  («Скрытность», «атака», «КД», «спасброски», «все проверки»); `mechanics` stays free text. On every `roll` the server adds
  the matching bonuses of the actor's **equipped** items as bonus lines with the item as source («Кольцо защиты +1»),
  outside the ±6 fiction cap; a DM `bonuses` entry naming the same item is dropped as a duplicate (session 2's doubled
  ring). Sheet lines hold clean numbers; the DM guide stops saying «fold the item into the line». `detail.attunement`
  marks an attuned item; the campaign setting `attunementLimit` (5e: 3, set by the hero step) rejects equipping a fourth.

## 4. Gear from stat blocks
- `upsert_character` gains `gear: [{name, kind, quantity, equipped, properties}]`; the DM fills it from the stat block
  at creation for every companion and enemy (model knowledge, no server parser): weapons named in the attack lines,
  armour and shield from the AC line, ammunition with every ranged weapon (the block's count, else 20), clothes and
  objects that matter to the story (a red cloak with the gang's mark). Not gear: natural attacks (bite, claw), spells,
  innate traits, unremarkable clothes, food. Coins the block or the DM know go to the body's wallet (`money grant
  toRef` = the body). The receipt hints when a character with an attack stat or a weapon in its block has no weapon item
  (item 36), and when a ranged weapon has no ammunition.
- A body's storage is its inventory (keep `storageFor`); `query_state inventory ref=<npc>` lists it (keep). The DM guide
  says: a search lists everything the bodies carry **from the records**, and each «забрали» in the story is an `item
  transfer` (money: `money transfer`) from the body to the taker; the ledger checker's TRACKED list now includes the
  items and wallets of present NPCs and of the current place, so a forgotten crossbow is a flagged miss (keep the checker).
- **Found but not taken is recorded where it lies**: `item create` and `money grant` accept a **place** ref (the current
  location, or `here`) and the server creates a storage of kind `place` for that location on demand. The chest's 80 зм,
  1800 мм, 700 см, six art objects and the mithral shirt exist as records in «Здесь лежит» before anyone touches them;
  the party's wallets stay unchanged until the transfer.

## 5. Moving things without a turn
- Owner operations `item.move` (item or part of a stack → hero / companion / mount / place / base), `item.equip`
  (equip, unequip, set kind, hands), `money.move` (amounts per currency between wallets): owner-authenticated mutations
  with the hero's correction scope, validated by the same TypeScript functions as the DM tools (quantity, non-negative
  balances, one item per slot, lent items return to their owner), recorded as corrections (keep the `entity.save` path).
- UI: the inventory tab shows the hero, the companions and the mounts' saddlebags as side-by-side lists; drag an item
  between lists or onto a doll slot; the card has «Отдать → Брам / Тоби / седельные сумки / себе» and «Надеть / Снять».
  «Передать…» no longer writes text into the action box.
- **The DM sees it next turn**: the dossier's current-state block gets «Owner moves since your last turn: герой → Тоби:
  красный плащ; герой надел Кольцо защиты (правая)», built from the correction rows after the last committed turn.
- **Mounts** are `holding kind mount` entities with a storage named «Седельные сумки (<name>)»; `passengerRefs` is
  rejected for mounts («a mount carries saddlebags, not a crew; riders are the party»); the party screen never lists a
  holding's passengers (crews stay on «Имущество», item 35). **«Лагерь» is a base** the DM creates at a place (or a long
  rest creates) — `ownerRef: "camp"` resolves to the party's base at the current location, else to the current place's
  storage with the hint «nobody carries this; it lies at <place>». The old shared stash is kept as a base «Лагерь»
  pinned to the migration-time location; the owner empties it by drag.

## 6. Ledger guards (server checks)
- Double money grant: §2. **Ammunition**: `roll` gains `ammunitionRef`; an attack roll that names an `ammunition` item
  of the actor with quantity ≥ 1 decrements it by one per roll, hit or miss, with a chip «Болты: 19 → 18»; zero left
  rejects the roll («болтов нет»); a ranged attack without `ammunitionRef` while the actor owns ammunition gets a hint.
- **Stacks merge**: on create, transfer or split-arrival the server merges into an existing stack of the same owner,
  storage, kind, rarity (common or none), no equipped slot, no lent/pledged status, equal or one-empty `mechanics`, and
  the same normalised name. Normalisation: lowercase, strip quotes and punctuation, drop stop words (для, из, с, и, of,
  for, the, a), stem with the existing `skillStems` rule, compare as sets: equal sets merge; a subset merges when both
  share the head noun (the stack's last noun) — «лёгкие болты» ⊂ «болты для лёгкого арбалета», head «болт». The longer
  name wins. Conservative by design: any doubt keeps two stacks; the owner can «Объединить» from the card.
- **Labels, never keys**: a new counter needs `label` (the `resource` tool's new field) in the campaign language; chips
  and screens show `resource_labels[key]`; the migration fills labels for known pools («Ячейки 1 круга», «Кости хитов»)
  and humanises the rest («shaman_tusk» → «Shaman tusk», flagged for the owner to rename). No chip ever shows a raw key.
- **Lent** stays `detail.status: lent` (keep) and shows on both lists: «отдано: Тоби» on the owner's, «взято у героя» on
  the holder's, until `transfer` back to the owner returns it (keep).

## 7. Companion cards from the stat block
- `upsert_character` gains `sheet` (the hero's sheet shape, §9): skills with numbers («Восприятие +5»), saves, speed,
  AC (`stats.defense`), attacks as lines («Скимитар +5, 1d6+3 рубящий»), level/CR. The DM writes it from the stat block
  at creation; the private `statblock_` note stays private (keep). The party card and the character screen render a
  companion with the same sheet view as the hero; a numeric stat of 0 is not shown («Навык 0» disappears).

## 8. The spells tab
- A «Заклинания» tab beside Персонаж / Инвентарь / Задания, for anyone whose sheet has spells. Spells are records in
  `character_sheet.spells` (v2): `{name, level (0 = заговор), castingTime, range, components, duration, saveOrAttack,
  damage, higherLevels, text, ritual, concentration, known, prepared}`, plus `preparedMax` on the sheet. Written by the
  hero step or the DM from the system's knowledge, edited by the owner; no spell data in code.
- Shows: slots by level as pips from `spell_slots_N` / `_max` (keep; a safe long rest refills them — keep), cantrips,
  prepared by level with «подготовлено N из M», the spellbook (known, not prepared), ritual and concentration marks, the
  current concentration from a condition «Концентрация: <spell>» (set and cleared by the DM), a card per spell;
  «Колдовать» puts «колдую «<spell>» ячейкой <круг> на …» (a cantrip: no slot part) into the action box.

## 9. The hero's sheet changes in play
- The DM path: `upsert_character ref=<hero>` accepts **only** `sheet` (a patch: level, attributes, skill/ability lines
  add/replace/remove, spells learn/prepare/forget, counters' labels and `_max`) with a required `reason`; name, kind,
  HP, description, party stay refused (keep). Every accepted patch is a chip «Лист: уровень 8 → 9 (бонус мастерства +4)».
- The owner edits every line on the character screen («Изменить») → `entity.save` with the sheet (keep the correction
  path); the DM sees «owner edited the sheet: …» next turn. The owner's edit wins: a DM patch carrying a revision older
  than the owner's correction is rejected by the revision check (keep), and the DM re-reads the sheet.

## 10. Data and migrations (additive; applied migrations untouched)
- `202610200076_fix_s2_inventory.sql` (schema): `rpg_entities.wallet jsonb default {}` and `resource_labels jsonb default
  {}` (SQL checks: integer maps, wallet ≥ 0); `rpg_storages.wallet jsonb default {}`, `location_id uuid` (FK to the
  campaign's location), kind `place` allowed, the `(kind='camp') = (entity_id is null)` check replaced by one that also
  admits `place`; a v2 sheet validator (level, saves, speed, spells, `preparedMax` allowed) replacing the constraint;
  `rpg_private.universal_slots(lang)`; the runtime change applier admits `wallet`, `resource_labels`, `character_sheet`
  on entities and `wallet`, `location_id` on storages; a campaign setting `currencies` and `attunementLimit`. Every new
  row type carries `campaign_id`.
- `202610200077_fix_s2_inventory_convert.sql` (data, idempotent): potion counters → items (§1); `currency_*` keys →
  wallets, the label mapped to the system list by word (золот/gold → зм, серебр/silver → см, медн/copper → мм,
  платин → пм, электр → эм), an unmatched word kept as its own currency with no value; slots remapped and `legs`
  unequipped (§3); `possession` kinds converted (§3); mounts lose passengers; the camp stash becomes a base «Лагерь»
  (§5); labels filled (§6). It writes a log line per campaign into the correction history.
- Tools gain fields, no new tools: `item` — `bonuses`, `hands`, `charges`, `attunement`, `ownerRef` accepts a place or
  storage, `merge` is automatic; `money` — `sourceRef`, `repeat`, refs accept storages and places; `resource` — `label`,
  `itemRef` (item charges); `roll` — `ammunitionRef`; `upsert_character` — `gear`, `sheet`, `reason`; `rest` —
  `restore` accepts item refs; `holding` — `passengerRefs` refused for mounts; `query_state` — `ref` accepts a place or
  body. Owner operations: `item.move`, `item.equip`, `money.move`. The guide text and receipts change accordingly.

## 11. Acceptance
- A scripted sandbox scenario on PGlite (`tests/dm-loop-fixture.mjs` + the scripted model, no paid calls), a Russian 5e
  campaign with the hero, Брам, Тоби and a mount: **fight** (two bandits from stat blocks get weapons, leather, bolts and
  purses at creation) → the hero **shoots** three bolts (`ammunitionRef`: 20 → 17; the fourth after zero is rejected) →
  **search** (`query_state` lists the bodies' gear; a chest's coins, art objects and mithral shirt are granted to the
  place; the party's wallets unchanged) → **hand out** (DM `transfer` scimitar → Брам; owner `item.move` cloak → Тоби;
  the next turn's dossier shows the owner move) → **equip** (Брам's scimitar to `hand`; the hero's ring right, second
  left, a two-handed staff blocks `offhand`) → **drink a potion** (stack 2 → 1, no counter anywhere) → **buy** (spend
  5 зм; not enough rejected) → **split coins** (chest → hero by transfer, hero → Брам 20 зм by `money.move`); then the
  guards: the chest's 80 зм granted again → rejected with the hint; «лёгкие болты» ×9 created beside «болты для лёгкого
  арбалета» ×7 → one stack of 16; the lent crossbow shows lent on both lists; a long rest refills slots; a level-up patch
  → chip; an owner sheet edit beats a stale DM patch. Every record is asserted from receipts against the script's story.
- Screens: character, inventory and spells at 1920×1080 and 2560×1440 filling the window (item 33); the wallet line
  «Кошелёк: 10 зм · 11 см · 26 мм» with names on hover; the doll with the eleven slots and «Надеть / Снять»; companions'
  sheets with the block's numbers; the party screen without «Экипаж и люди дома» for mounts; no raw key in any chip.
  Then the owner's pass in the sandbox: a checklist per screen and his «принято» before the stage is called done.
