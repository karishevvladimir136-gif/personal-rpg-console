# Fix S2, stage D — records and inventory, fixed once

One model for items, counters, money, the doll, gear, moves, ledger guards, companion cards, spells and sheet changes.
Combat (the `combat` tool, battle map, enemy HP) is the parallel session's; ammunition is decremented inside `roll` receipts
only. Every row is per campaign; every change is a validated tool call or an owner correction, and the owner's correction
always wins. "Keep" marks what the current code already does right.

## 1. One source of truth
- **An item** is a row of `rpg_items`: name, kind (`category`), quantity, free-text `mechanics`, owner, storage, equipped slot,
  `detail` (history, lent/pledged — keep). Kinds: `weapon, shield, armor, clothing, jewelry, accessory, ammunition, consumable,
  tool, gear, misc` (`possession` disappears). Potions are `consumable` items, arrows and bolts `ammunition`; `item consume`
  lowers the stack (keep).
- **A counter** is an `entity.resources` key with `_max` (keep), only for pools: HP (the columns), `spell_slots_N`, hit dice,
  class charges (ki, arcane recovery, sorcery points). Charges of a thing (a wand, a tusk) live **on the item** as
  `detail.charges {value, max}`, never as an entity counter named after it. Every counter has a label (§6).
- **Money is neither** (§2). `resource` rejects `currency_*` keys and potion or coin words with the hint «potions are items
  (item create consumable); money is money (money grant)».
- **Conversion** (§10): a counter on a player/companion/npc whose key or review label matches `potion(s)`, `healing_potion(s)`,
  `elixir`, `зель*`, `эликсир*` with value ≥ 1 becomes one `consumable` item named from the review label (else the key, in the
  campaign language) × value in the owner's storage, merged into an identical stack if one exists; the key and its `_max` go;
  value 0 is just removed. Never touched: `hp`, `spell_slots*`, `hit_dice*`, other pools' `_min`/`_max`, unmatched keys, items,
  scenes, saves, turns.

## 2. Money: a wallet per character
- `rpg_entities.wallet` and `rpg_storages.wallet`: jsonb map currency code → integer ≥ 0 (non-negative in SQL). Everyone who
  holds things has one: hero, companions, NPCs (a body keeps its purse), mounts and transports (coins in the saddlebags),
  places and bases (a chest). Money never returns to `resources`.
- The **currency system** is a campaign setting, a list in order of value with code, full name and value in the smallest
  coin — 5e `пм 1000 · зм 100 · эм 50 · см 10 · мм 1` — written by the world/hero step from the system's knowledge, owner-
  editable. No list → today's rule (keep): the first word recorded is the one currency, `sameCurrency` inflection matching
  stays. With a list, `money` resolves the DM's word to a code («золотые», «зм», «gold» → `зм`); an unknown word is rejected
  with the list as the hint.
- **Display**: one line everywhere (sheet, inventory header, party card): «Кошелёк: 10 зм · 11 см · 26 мм» in the list's
  order, zero coins hidden (all zero → «Кошелёк: пусто»), full name on hover («золотые монеты»), never «Зм».
- **Starting money is money**: the review marks each resource entry «деньги» (has a currency) or «счётчик» (has a max);
  creation writes money into the hero's wallet and counters with `_max` into resources (item 28).
- **Found money lies where it lies**: coins in a chest or on a body are `money grant` to that storage's or body's wallet when
  the story shows them; taking is `money transfer` — a move, never a second mint. **Splitting**: the owner's «Разделить…» on
  the wallet line (amount per currency → Брам / Тоби / седельные сумки) is an owner move (§5); the DM uses `money transfer`.
- **Double-grant guard**: `money grant` gains `sourceRef` (the chest, the body, the employer). The server keeps a private list
  of paid grants (sourceRef or normalised reason, currency, amount, turn, recipient). The same sourceRef, or the same reason
  and currency within one session, is rejected with «уже выплачено (ход N: 80 зм из сундука)»; the retry needs `repeat: true`
  and a reason naming why this is new money. Quest rewards stay with `quest claim_reward`, paid once (keep).

## 3. The doll (equipment slots)
- One universal set for every humanoid record (hero, companions, NPCs), replacing `humanoidSlots` (loop), `universalSlots`
  (UI) and SQL `bootstrap_humanoid_slots` (a new function beside it): `head` Голова (armor, clothing) · `amulet` Амулет
  (jewelry, accessory) · `cloak` Плащ (clothing, armor) · `body` Броня/одежда (armor, clothing) · `gloves` Перчатки/наручи
  (armor, clothing, accessory) · `belt` Пояс (gear, accessory, tool, clothing) · `boots` Сапоги (armor, clothing) ·
  `ring_left` Кольцо (левая) (jewelry) · `ring_right` Кольцо (правая) (jewelry) · `hand` Основная рука (weapon, tool) ·
  `offhand` Вторая рука (weapon, shield, tool, gear). No «Ноги».
- **Existing records**: `neck→amulet`, UI `talisman→amulet`, `ring1→ring_left`, `ring2→ring_right`; same-named ids stay; a
  `legs` item is unequipped by the migration and stays in the inventory (logged). What a hero wears stays on (item 33).
- **«Надеть / Снять» on every item card** and **drag to the doll** (character, inventory, holdings): the owner move
  `item.equip` (§5), validated by the same TypeScript rule as the DM's `item equip`: slot by kind, first free fitting slot,
  rings left then right; a kind picker when nothing fits, saving the kind on the item (item 27). The DM's rejection that
  lists fitting slots stays (keep).
- **Two hands**: `detail.hands = 2` (review, `item create/modify hands`, kind picker; the DM sets it when the system's rule
  says two-handed) occupies `hand` and blocks `offhand` («занято: посох»); equipping there is rejected with that reason.
- **Starting items equipped at creation**: the review gives each possession a kind and a «надеть» toggle (default guesses by
  head noun only: посох/меч/кинжал/лук/арбалет → weapon, кольцо/амулет → jewelry, плащ/мантия/роба/шляпа/сапоги → clothing,
  зелье → consumable, стрелы/болты → ammunition, else gear; owner confirms); creation writes kind, hands, bonuses and the
  equipped slot. Existing `possession` rows convert by the same rule, else `gear`.
- **Bonuses reach rolls**: `detail.bonuses: [{to, value}]`, `to` in the sheet's words («Скрытность», «атака», «КД»,
  «спасброски», «все проверки»); `mechanics` stays prose. Every `roll` adds the matching bonuses of the actor's **equipped**
  items as bonus lines with the item as source («Кольцо защиты +1»), outside the ±6 fiction cap; a DM `bonuses` entry naming
  the same item is dropped as a duplicate (session 2's doubled ring). Sheet lines hold clean numbers; the guide stops saying
  «fold the item into the line». `detail.attunement` marks an attuned item; the setting `attunementLimit` (5e: 3, set by the
  hero step) rejects equipping one more.

## 4. Gear from stat blocks
- `upsert_character` gains `gear: [{name, kind, quantity, equipped, properties}]`; the DM fills it from the stat block at
  creation for every companion and enemy (model knowledge, no server parser): weapons from the attack lines, armour and
  shield from the AC line, ammunition with each ranged weapon (the block's count, else 20), clothes and objects that matter
  (a red cloak with the gang's mark). Not gear: natural attacks, spells, traits, plain clothes, food. Coins go to the body's
  wallet (`money grant toRef` = the body). The receipt hints when a character with an attack stat or a weapon in its block
  has no weapon item (item 36), and when a ranged weapon has no ammunition.
- A body's storage is its inventory (keep `storageFor`; `query_state inventory ref=<npc>` lists it — keep). The guide: a
  search lists everything the bodies carry **from the records**; each «забрали» is an `item transfer` (coins: `money
  transfer`) body → taker. The ledger checker's TRACKED list adds present NPCs' items and wallets and the current place's,
  so a forgotten crossbow is a flagged miss (keep the checker).
- **Found but not taken is recorded where it lies**: `item create` and `money grant` accept a place ref (a location or
  `here`); the server creates a storage of kind `place` for it on demand. The chest's 80 зм, 1800 мм, 700 см, six art objects
  and the mithral shirt exist in «Здесь лежит» before anyone touches them; the party's wallets change only on transfer.

## 5. Moving things without a turn
- Owner operations `item.move` (item or part of a stack → hero / companion / mount / place / base), `item.equip` (equip,
  unequip, kind, hands) and `money.move` (amounts per currency between wallets): owner-authenticated mutations in the
  correction scope, validated by the same functions as the DM tools (quantities, balances ≥ 0, one item per slot, a lent
  item returning to its owner), recorded as corrections (keep the `entity.save` path).
- UI: the inventory tab shows the hero, companions and the mounts' saddlebags as side-by-side lists; drag between lists or
  onto a doll slot; the card has «Отдать → Брам / Тоби / седельные сумки / себе» and «Надеть / Снять». «Передать…» stops
  writing text into the action box.
- **The DM sees it next turn**: the dossier's current-state block gets «Owner moves since your last turn: герой → Тоби:
  красный плащ; герой надел Кольцо защиты (правая)», built from the correction rows after the last committed turn.
- **Mounts** are `holding kind mount` entities with a storage «Седельные сумки (<name>)»; `passengerRefs` is rejected for
  mounts («riders are the party, a mount carries saddlebags»); the party screen never lists a holding's passengers (crews
  stay on «Имущество», item 35). **«Лагерь» is a base** the DM creates at a place (a long rest creates one); `ownerRef:
  "camp"` resolves to the party's base at the current location, else to the current place's storage with the hint «nobody
  carries this; it lies at <place>». The old shared stash becomes a base «Лагерь» at the migration-time location.

## 6. Ledger guards (server checks)
- Double grant: §2. **Ammunition**: `roll` gains `ammunitionRef`; an attack naming an `ammunition` item of the actor with
  quantity ≥ 1 decrements one per roll, hit or miss, chip «Болты: 19 → 18»; zero rejects the roll («болтов нет»); a ranged
  attack without it while the actor owns ammunition gets a hint.
- **Stacks merge** on create, transfer and split-arrival into a stack of the same owner, storage, kind, rarity (common or
  none), no equipped slot, no lent/pledged status, equal or one-empty `mechanics`, same normalised name. Normalisation:
  lowercase, strip quotes and punctuation, drop stop words (для, из, с, и, of, for, the, a), stem with `skillStems`, compare
  as sets: equal sets merge; a subset merges only when both share the head noun (the last noun) — «лёгкие болты» ⊂ «болты
  для лёгкого арбалета», head «болт»; the longer name wins. Any doubt keeps two stacks; the owner has «Объединить».
- **Labels, never keys**: a new counter needs `label` (new `resource` field) in the campaign language; chips and screens show
  `entity.resource_labels[key]`; the migration fills known pools («Ячейки 1 круга», «Кости хитов») and humanises the rest
  («Shaman tusk», flagged for renaming). No chip shows a raw key.
- **Lent** stays `detail.status: lent` (keep), shown on both lists — «отдано: Тоби» and «взято у героя» — until the transfer
  back returns it (keep).

## 7. Companion cards from the stat block
- `upsert_character` gains `sheet` (the hero's shape, §9): skills with numbers («Восприятие +5»), saves, speed, AC
  (`stats.defense`), attacks as lines («Скимитар +5, 1d6+3 рубящий»), level/CR — written from the block at creation; the
  private `statblock_` note stays private (keep). Party card and character screen render a companion with the hero's sheet
  view; a numeric stat of 0 is hidden («Навык 0» disappears).

## 8. The spells tab
- «Заклинания» beside Персонаж / Инвентарь / Задания for anyone whose sheet has spells. Spells are records in
  `character_sheet.spells` (v2): `{name, level (0 = заговор), castingTime, range, components, duration, saveOrAttack, damage,
  higherLevels, text, ritual, concentration, known, prepared}` plus `preparedMax` — written by the hero step or the DM from
  the system's knowledge, owner-editable; no spell data in code.
- Shows slots by level as pips from `spell_slots_N` / `_max` (keep; a safe long rest refills — keep), cantrips, prepared by
  level with «подготовлено N из M», the spellbook (known, not prepared), ritual and concentration marks, the current
  concentration from a condition «Концентрация: <spell>» (set and cleared by the DM), a card per spell; «Колдовать» puts
  «колдую «<spell>» ячейкой <круг> на …» (cantrip: no slot part) into the action box.

## 9. The hero's sheet changes in play
- DM path: `upsert_character ref=<hero>` accepts **only** `sheet` (a patch: level, attributes, lines add/replace/remove,
  spells learn/prepare/forget, counters' labels and `_max`) with a required `reason`; name, kind, HP, description, party
  stay refused (keep). Every patch is a chip «Лист: уровень 8 → 9 (бонус мастерства +4)».
- The owner edits any line on the character screen («Изменить») → `entity.save` with the sheet (keep); the DM reads «owner
  edited the sheet: …» next turn. The owner wins: a DM patch with a revision older than the correction is rejected by the
  revision check (keep) and the DM re-reads.

## 10. Data and migrations (additive; applied migrations untouched)
- `202610200076_fix_s2_inventory.sql` (schema): `rpg_entities.wallet`, `resource_labels` (jsonb `{}`, SQL checks: integer
  maps, wallet ≥ 0); `rpg_storages.wallet`, `location_id` (FK to the campaign's location), kind `place`, the camp check
  rewritten to admit it; a v2 sheet validator (level, saves, speed, spells, `preparedMax`) replacing the constraint;
  `rpg_private.universal_slots(lang)`; the runtime applier admits `wallet`, `resource_labels`, `character_sheet` on
  entities and `wallet`, `location_id` on storages; settings `currencies`, `attunementLimit`. All rows carry `campaign_id`.
- `202610200077_fix_s2_inventory_convert.sql` (data, idempotent, one log line per campaign in the correction history):
  potion counters → items (§1); `currency_*` → wallets, the label mapped by word (золот/gold → зм, серебр/silver → см,
  медн/copper → мм, платин → пм, электр → эм; an unmatched word stays its own currency); slots remapped, `legs` unequipped,
  `possession` converted (§3); mounts lose passengers and the stash becomes a base (§5); labels filled (§6).
- Tools gain fields, no new tools: `item` — `bonuses`, `hands`, `charges`, `attunement`, `ownerRef` takes a place or
  storage; `money` — `sourceRef`, `repeat`, refs take storages and places; `resource` — `label`, `itemRef` (charges);
  `roll` — `ammunitionRef`; `upsert_character` — `gear`, `sheet`, `reason`; `rest` — `restore` takes item refs;
  `holding` — `passengerRefs` refused for mounts; `query_state` — `ref` takes a place or body. Owner operations:
  `item.move`, `item.equip`, `money.move`. Guide text and receipts follow.

## 11. Acceptance
- A scripted sandbox scenario on PGlite (`tests/dm-loop-fixture.mjs` + the scripted model, no paid calls): a Russian 5e
  campaign with the hero, Брам, Тоби and a mount. **Fight** (two bandits from stat blocks get weapons, leather, bolts and
  purses at creation) → **shoot** three bolts (`ammunitionRef`: 20 → 17; a shot at zero is rejected) → **search**
  (`query_state` lists the bodies' gear; the chest's coins, art and shirt are granted to the place; party wallets unchanged)
  → **hand out** (DM `transfer` scimitar → Брам; owner `item.move` cloak → Тоби; the next dossier shows the move) → **equip**
  (scimitar to `hand`; a ring right, a second left; a two-handed staff blocks `offhand`) → **drink a potion** (2 → 1, no
  counter anywhere) → **buy** (`spend` 5 зм; too much is rejected) → **split coins** (chest → hero by transfer, hero → Брам
  20 зм by `money.move`). Guards: the chest's 80 зм granted again → rejected with the hint; «лёгкие болты» ×9 beside
  «болты для лёгкого арбалета» ×7 → one stack of 16; the lent crossbow shows lent on both lists; a long rest refills slots;
  a level-up patch → chip; an owner sheet edit beats a stale DM patch. Every record is asserted from receipts against the
  script's story.
- Screens: character, inventory and spells at 1920×1080 and 2560×1440 filling the window (item 33); «Кошелёк: 10 зм ·
  11 см · 26 мм» with names on hover; the eleven-slot doll with «Надеть / Снять»; companions' sheets with the block's
  numbers; no «Экипаж и люди дома» for mounts; no raw key in any chip. Then the owner's sandbox pass — a checklist per
  screen and his «принято» before the stage is called done.

## Implementation decisions (stage D, recorded after the note)
The model above is built as written, with five storage choices that keep working systems and saves untouched:
- **A character's wallet is its `currency_<code>` entries** (stored with the record's resources since polish group 8;
  the database's non-negative checks already hold them). They are never shown, listed or edited as counters; the
  screens and the DM read them as one wallet. A storage's coins (a place's pile, a base, saddlebags) are
  `rpg_storages.detail.wallet`. No `wallet` columns — no data migration of money, saves restore as they are.
- **The coin system is recognised from the coin words** already recorded (зм / золотые / gold …, `coinOf`), so a 5e
  campaign gets the order of value and the full names without a new setting; migration 77 keeps older words under
  the 5e codes. Attunement is limited to three (5e) wherever an item is marked as needing it.
- **A place pile's location is `detail.locationId`** of a storage of kind `place` (migration 76 admits the kind).
- **Counter labels live in the entity's public profile** (`counterLabels`), not a new column; a party member's new
  counter is refused without its label.
- **Owner moves are owner corrections** through the existing `item.save` / `entity.save` mutations, planned by the
  shared rules (`equipPlan`, `sameStack`) and marked in the item's history (`owner_moved`, `owner_equipped` …); the
  DM's current state lists the latest owner moves per thing («ownerMovesSinceYouLastTouchedThem»).
