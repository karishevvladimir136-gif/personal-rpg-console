# Fixes after session 2 — stages C, D, E, F (the turn on screen, records and inventory, pictures, screens)

Part of the run in `docs/stages/FIX_S2_RUN.md` (same branch, rules, ledger and progress file as stages A and B). Every
item number is an item of `docs/runs/session2-owner-notes.md`; each item there has a «Do:» — implement what it says unless
this file says otherwise. First check each item against the base branch: if it is already fixed, say so in the progress
file with the commit, and move on.

## Stage D — records and inventory, done once (run D before C: combat reads these records)

The owner: «иначе мы тот инвентарь уже четвёртый раз правим». Start with a one-page design note
(`docs/runs/fix-s2-inventory-design.md`) that fixes the model, then implement it whole:
- **One source of truth.** Things are items; counters are only for slots, hit dice and class or item charges. Potions
  are items (the session tracked them both ways and the two diverged — the sergeant's potion came off the hero's
  counter). A migration converts existing potion counters into items.
- **Money is a wallet per character**, never a resource counter (items 28, 52): starting money as money in the
  campaign's currency; one line in the system's order of value («Кошелёк: 10 зм · 11 см · 26 мм»; 5e: пм, зм, эм, см,
  мм), full coin names on hover, the word instead of «Зм» (item 33). Companions can carry money.
- **The doll** (items 14, 27, 33, 36): the hero moves to the universal slot set — Голова, Амулет, Плащ, Броня/одежда,
  Перчатки/наручи, Пояс, Сапоги, Кольцо (левая), Кольцо (правая), Основная рука, Вторая рука; no «Ноги»; what he wears
  stays on. «Надеть / Снять» on every item card, drag to the doll, a kind picker when an item fits no slot; starting
  items equipped at creation; item bonuses from equipped items reach rolls with their source shown.
- **Gear from stat blocks**: a companion or enemy made from a 5e stat block gets its gear as items at creation
  (items 36, 48), so a search can list everything the bodies carry and nothing the story showed disappears; «забрали»
  in the story → item receipts.
- **Moving things without a turn** (item 55): drag between the hero's, the companions' and the mounts' lists, or
  «Отдать → Брам / Тоби / седельные сумки / себе» on the card — an owner move the DM sees next turn. Mounts are
  mounts with saddlebags, not a crewed holding listing riders «на борту» (item 35); «Лагерь» is a place the party sets
  up, not «what nobody carries».
- **The ledger errors of the session** (report, quoted in the notes «Other headline findings»): the mine's loot money
  granted twice (a guard: a grant whose source was already paid gets a hint and needs a reason); ammunition decremented
  per shot by the server when a ranged attack uses it; identical items merge into one stack (normalised name and kind;
  «лёгкие болты» = «болты для лёгкого арбалета»); change chips and counters in Russian, never `spell_slots_1` or
  `shaman_tusk`; the light crossbow lent and never returned shows as lent.
- **Spells tab** (item 49): slots by level with pips, cantrips, prepared by level («подготовлено N из M»), the
  spellbook, rituals and concentration marked, the spell being concentrated on, a card per spell, «Колдовать» puts the
  line into the action box. Spells are per-character records from the system's knowledge, not code.
- **The hero's sheet can change in play** (item 18): the DM through a dedicated path (level up, prepared spells, a
  changed line), the owner by editing; every change shown as a chip.
Acceptance: a scripted sandbox scenario — fight → search → hand out → equip → drink a potion → shoot arrows → buy →
split coins — with every record checked against the story; screenshots of the character, inventory and spells screens
at 1920×1080 and 2560×1440, filling the window (item 33: «должно быть больше, на весь экран»).

## Stage C — the turn on screen and combat

- **The turn as one timeline** (items 53, 63 — owner: «остро»): text → the roll card in its place → the continuation;
  text never vanishes and comes back; the pause is named («ждёт твой бросок», «бросок Брама»); no «Ведущий думает…» in
  the middle of a turn that is already telling.
- **Roll cards** (items 43, 44): one card per hero roll the player makes; companions' and enemies' rolls as compact
  chips in place (the DM rolls for companions — owner's decision); every addend visible.
- **Combat** (items 45, 46, 61, 64, 65 and the section «Combat — a separate stage»): the `combat` tool gets round and
  turn advance and real per-combatant action/bonus/reaction state (today only start/position/end, resources fixed
  1/1/1; the panel showed «Раунд 1» for the whole mine fight); enemy HP from stat blocks recorded at combat start and
  decremented per hit; **enemy HP and damage visible, BG3-style** (bars with numbers — owner's decision); damage rolls
  shown per attack; reactions — when an enemy attack would hit the hero and the hero has a reaction (Shield, an
  opportunity attack), the turn pauses with a choice card; coup de grâce on a helpless target as an execution (the
  guide's rule) with no HP exchange.
- **The battle map** (the owner's design in the notes' combat section and his memory): an initiative ribbon with
  portraits; a «Зоны / Карта» toggle with a top-down drawn background and portrait tokens on a 5-ft grid; positions held
  by the server, distances computed by the server and given to the DM as text; dragging the hero's token writes the
  intent into the action box; enemy cards with portraits, HP bars and what is known (unlocked by checks); an
  end-of-fight summary. No D&D rules hardcoded — the grid size and movement come from the campaign's system.
- **Ambush** (item 54, owner's decision 23:19): the planned opening of an ambush the party set — the signal, the first
  strike — happens before initiative is rolled, then the fight runs in order; a campaign rule option, on by default
  for this owner's campaigns (5e surprise still applies to the ambushed).
- **Screen**: the action box grows with the text (item 42); the session transcript does not unfold under the play
  screen (item 57); the owner panel is not forced open during combat.
Acceptance: a sandbox fight on the synthetic campaign recorded as screenshots per round; the owner's pass.

## Stage E — pictures, the gallery, the session close

- **Frames** (items 77–79): the frame appears in its turn, in place, and goes to the gallery; the button targets the
  last turn with narration (never a failed or out-of-game one) and shows every non-queued status in words; no frame for
  an out-of-game-only turn; the caption is the shot's own moment, not the turn's first sentence; role words (маг,
  сержант, купец, мальчишка) resolve to the scene's people, the hero first; props only from the records (no invented
  shield or lantern); the hero's position and the light from the turn; a temporary look the story set (soot on the
  face, a burned robe, bandages) kept as the current appearance until the story removes it; references for identity
  only — the brief gives each person's gaze, expression and action and says which hand does what; portrait anchors in a
  neutral front or three-quarter pose, two angles; a cheap vision check after each frame (extra or missing limbs, gear
  that is not his, open eyes at 0 HP) → one automatic redraw or a mark for the owner. The daily picture count resets at
  the owner's local midnight, not UTC (17:00 for him). The reference frame for the checks: item 76's.
- **The gallery replaces the chronicle** (item 80): the game screen's «Хроника» becomes «Галерея» — all frames in story
  order by session, each with its caption, a large view with «К ходу» and «Перерисовать», tabs Кадры / Люди / Места /
  Вещи / Карты (the existing «Картинки» page grows into it); the chronicle screen and its one-click batch redraw leave
  the navigation.
- **The session close** (item 81, owner's design): one digest per session, shown once (stage A's guard); by length —
  after a short session «что было» in a few lines and the open threads; after a long one (several hours or 30+ turns)
  ending cards in the spirit of an RPG's final slides — one per person or group met this session, with the portrait,
  where they are, how they stand with the hero, one line of fate, «неизвестно» when the hero does not know; then the open
  threads from all live threads; then one «Тем временем» delivered through an in-world channel (a report to the
  captain, a rumour, a letter) that moves the story without answering an open question; «Ранее в…» three or four
  sentences, forward-looking (where we are, what is at stake, what comes next).
- **Party council** screen: the hero is never offered as a listener (item 75).

## Stage F — screens and settings

Items 1–7, 10–13, 15, 16, 19–26, 29–32, 34 (what remains after D and C took theirs). Highlights: the hero created in one
pass (item 20, the owner's top priority from the wizard), the names the owner gave in the opening review used (34), the
new-campaign flow in order (21), the screens filling the window (22), readable text sizes and «Крупный текст истории»
working (5, 6), the DM Craft screen redesign (7), the leftover provider block (4), the campaign settings (26) — the DC and
dice settings visible under «Логика мира» (39), the library view (25), the map's scale (31), the small issues (30), the
history window (23 — decide its size with stage A's cost numbers, not before). Each screen gets a line in the owner's
acceptance checklist.
