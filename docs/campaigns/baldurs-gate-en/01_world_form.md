# 1. The «Создать Мир» form (new-campaign wizard → «Мир» step → «Создать Мир»)

## «Название Мира» (World name)

Sword Coast — Baldur's Gate

## «Опишите сеттинг» (Describe the setting) — paste everything between the rules

---

The Forgotten Realms, D&D 5e rules. Faerûn's western shore: the Sword Coast. At the heart of the campaign stands Baldur's Gate, a great port at the mouth of the Chionthar, and south of it the lands along the Trade Way — Candlekeep, the Friendly Arm, Beregost, Nashkel, the Cloakwood.

It is about 1495 DR. The last few years have been hard on the Gate. Elturel, upriver, was dragged bodily into Avernus and then returned; refugees came down the Chionthar; there were fires and riots; the Flaming Fist lost men and trust. Life is mending, but the marks show — a packed Outer City, sideways looks at tieflings, sellswords on every corner.

The tone is classic heroic fantasy in the spirit of Baldur's Gate: roads and taverns, hired blades and old ruins, guilds and the intrigues of a rich trading city. The world runs on its own; people and factions have their own business and don't wait for the hero. Danger is real and reward is earned. Humour comes from character and circumstance — this is no parody. Magic is real and, in big cities, ordinary, but it costs. Gods answer their priests. Monsters exist, but inside the walls the greatest danger is people.

The city. The Upper City sits behind the inner wall — patriars, old families, villas and temples — guarded by the Watch; its gates close at night. The Lower City runs down to the harbour: docks, warehouses, markets, taverns, the Guild and its underground market, the Undercellar. The Outer City sprawls beyond the walls — newcomers, refugees and the poor: Little Calimshan, Rivington, the bridge-district of Wyrm's Crossing. The Council of Four, the Grand Dukes, rules; the Flaming Fist, a mercenary army, keeps order in the Lower and Outer City.

The country around. Candlekeep is a fortress-library on a sea cliff; the price of entry is a book the collection lacks. The Friendly Arm is a fortified inn on the Trade Way — hiring, rumours, company for the road. Beregost is a town of smiths with a temple of Lathander. Nashkel is a mining town on the Amnian border. The Cloakwood is a dark coastal forest: spiders, druids, bandits, abandoned mines.

Powers. The Guild, the Flaming Fist, the patriars; the Harpers, the Zhentarim, the Lords' Alliance, the Order of the Gauntlet, the Emerald Enclave; the temples of Tymora, Lathander, Gond and Umberlee; and, in secret, the cult of Bhaal, god of murder.

Rules — D&D 5e: ability scores, proficiency bonus, classes and levels, AC and hit points, advantage and disadvantage, spell slots, short and long rests, death saves.

The plots of particular games and modules are only echoes and tavern tales here. This campaign has its own story, and the story is about the hero.

---

# 2. The hero is yours (the «Кто вы?» field)

Only the mechanics of fitting a 5th-level character into the app's form; who the hero is, you decide.

- In «Кто вы?» (Who are you?) state the level in words: "warlock, 5th level". The wizard has no separate level field; without those words the AI won't know it.
- On the «Проверьте предложение» (Review the proposal) screen set «Стиль листа персонажа» (Character sheet style) → **«Структурированный RPG»** (Structured RPG).
- «Роль / архетип» (Role / archetype): race, class, level, subclass. For example "Human, warlock 5 (The Celestial)".
- The six ability scores (Strength…Charisma) are display only; they don't feed the dice. So modifiers go in as lines with a number — the server finds the number by the line's name.
- **«Навыки»** (Skills, 12 lines): the six ability checks first, then the six saving throws, in exactly this order and wording:
  "Strength check −1", "Dexterity check +2", "Constitution check +2", "Intelligence check +0", "Wisdom check +1", "Charisma check +4", "Strength save −1", "Dexterity save +2", "Constitution save +2", "Intelligence save +0", "Wisdom save +4", "Charisma save +7" (your numbers).
  Order matters: the server takes the first matching line, and if a save sits above a check, an ordinary Charisma check would get the save's +7.
- **«Способности»** (Abilities, 12 lines): the skills the hero is proficient in, with the number ("Deception +7", "Persuasion +7", "Arcana +3"), "Spell attack +8", "Spell save DC 16", class features, and the spells as lines: "Cantrips: …", "Spells known: …", "Invocations: …". There is no separate spell field at creation.
- «Утвердить боевой профиль» (Confirm the combat profile): «Хиты» (HP), «Защита» (AC), «Атака (модификатор)» (attack modifier — the spell attack or weapon bonus), «Урон оружия» (weapon damage — the average of the main cantrip). The DM still rolls the dice by formula.
- «Начальные вещи и ресурсы» (Starting items and resources) — the counters: "Pact slots", "Hit dice", "Gold", and class resources.

# 3. The «Ведущий» (DM) step

- Model — **Claude Opus 5.5**. Depth can stay as is; the campaign gets the "high — very high" range by itself.
- «Что мне нравится в играх» (What I like in games) — in your own words: fights, talk, mysteries, trade, companions — whatever matters to you.
- Language for this campaign: **English**; the DM's instructions in English; no voice samples.
