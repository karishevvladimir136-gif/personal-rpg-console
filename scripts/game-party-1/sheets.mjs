// Game party 1 (docs/stages/GAME_PARTY_1.md): the three characters, written once and shared by every table so the players
// differ and the heroes do not. Three distinct classes — a fighter, a caster, a rogue — level 5, mixed coin, no alignment
// (ALIGN_1's confound avoided). Each is the owner's review of a new hero (the wizard's «Проверьте предложение» screen,
// field by field: src/lib/adventures/hero-draft.ts HeroReview), so all three are written into the app the same way:
// seat 1's character through the wizard's own commit, seats 2 and 3 as party companions carrying the same records.
//   - Bram Halloway, fighter 5 (seat 1: the app's hero record) — the front; Protection style; a healer's kit (stabilise).
//   - Sefa Marrin, warlock 5 (seat 2) — the Celestial patron: Healing Light (the stage's first rule-measurable care) and
//     two pact slots that come back only on a rest (P-DUNGEON's scarcity).
//   - Pell Dunmore, rogue 5 (seat 3) — the Thief: Fast Hands; carries the company's one healing satchel (three potions).
// The light they carry is counted (torches, one lantern and its oil). Nothing here names a goal, an errand or another
// character: how they know each other is the arm's premise.

/** One spell as the sheet records it. */
const spell = (name, level, rest = {}) => ({ name, level, known: true, prepared: true, ...rest });
const item = (name, kind, description, { quantity = 1, slot = null, mechanics = "", detail = {} } = {}) => ({ name, description, quantity, kind, slot, mechanics, detail });
const counter = (key, label, value, max = value) => ({ key, label, value, max });

/** The «Who are you?» text of each character: what the player reads as their own character, and the hero's text the
 * wizard is given. Written in the voice of 05_hero_warlock_5.md, without an alignment line and without an errand. */
export const WHO = {
  bram: `Fighter, 5th level; human, 38. Bram Halloway.

He grew up in a smithy's yard in the Fields of the Dead and left it at sixteen with a free company — six years of road work, then ten as a caravan guard on the Trade Way between Baldur's Gate and Amn. He has buried friends on that road and brought more wagons through than he can count. He walks with a shield on his arm out of habit and stands where the trouble will come. His last caravan paid him off in Nashkel; what he does next is his own business.

What he does: holds the front, keeps a line, takes the blow meant for the person beside him (Protection), hits hard twice a turn, gets back up once when he should not (Second Wind) and pushes once when it matters (Action Surge). Knows roads, weather and wagons; reads a crowd for the man who will start something.

Ability scores: Strength 17, Dexterity 12, Constitution 15, Intelligence 10, Wisdom 13, Charisma 10. Hit points 44. AC 18 (chain mail and shield). Speed 30 feet. Proficiency bonus +3. Saving throws: Strength and Constitution. Background: guard of caravans (soldier); skills Athletics, Intimidation, Perception, Survival; land vehicles.

Gear: chain mail; a shield with an old company's mark painted over; a longsword; four javelins; a healer's kit; a pack with a bedroll, a tinderbox, three torches, five days of hardtack and a waterskin; 50 feet of hempen rope.

Money: 23 gold, 14 silver, 30 copper.`,
  sefa: `Warlock, 5th level; human, 29. Sefa Marrin. Patron: a celestial power she calls the Lantern. Pact of the Tome.

She was a novice in a hospice of the Lower City of Baldur's Gate, the year the fever came up from the docks. On the ninth night, with the oil gone and the ward dark, something answered her: a voice like a lamp being lit. She has carried its light since — in her hands, in the book it left her, in a debt she has never been told the size of. She left the hospice when the sisters began to look at her hands instead of her face.

What she does: heals with the Lantern's light (Healing Light, a pool of six dice a day), steadies the dying with a word (Spare the Dying), strikes at range with Eldritch Blast, and keeps two pact slots for what matters — they come back only after a rest. Reads people well; speaks well; knows the Faith and the arcane.

Ability scores: Strength 8, Dexterity 14, Constitution 14, Intelligence 12, Wisdom 10, Charisma 18. Hit points 38. AC 14 (studded leather). Speed 30 feet. Proficiency bonus +3, spell attack +7, spell save DC 15. Saving throws: Wisdom and Charisma. Background: acolyte; skills Insight, Religion, Arcana, Persuasion.

Gear: studded leather; the Book of Shadows (her pact and her focus); a dagger; prayer beads from the hospice; a pack with a bedroll, a tinderbox, two candles, five days of rations and a waterskin.

Money: 1 platinum, 8 gold, 41 silver, 12 copper.`,
  pell: `Rogue, 5th level; human, 26. Pell Dunmore.

Lower City born, raised on the roofs above the Wide; a lockpick at twelve, a guild runner at fifteen, out of it at twenty with a debt paid and a name he does not use. Since then he has worked for whoever pays in coin rather than favours: doors, ledgers, the second floor of houses whose first floor has dogs. He carries the satchel of potions because he is the one who can get to someone fast.

What he does: goes unseen and unheard, opens what is locked, climbs what is high, strikes hard from where he is not expected (Sneak Attack), slips away (Cunning Action), turns a blow aside (Uncanny Dodge), and uses a potion, a lock or a lamp in the blink of a bonus action (Fast Hands).

Ability scores: Strength 10, Dexterity 17, Constitution 13, Intelligence 13, Wisdom 12, Charisma 12. Hit points 33. AC 15 (studded leather). Speed 30 feet. Proficiency bonus +3. Saving throws: Dexterity and Intelligence. Background: urchin; skills Stealth (expertise), Sleight of Hand, Acrobatics, Perception, Investigation, Insight; thieves' tools (expertise).

Gear: studded leather; a shortsword; two daggers; a shortbow and twenty arrows; thieves' tools; a healer's satchel with three potions of healing; a hooded lantern and two flasks of oil; a pack with a bedroll, a tinderbox, five days of rations, a waterskin and 50 feet of silk rope.

Money: 31 gold, 2 electrum, 6 silver, 55 copper.`,
};

/** The three reviews, as the owner fills the review screen (HeroReview). `mechanics` is derived at commit. */
export const REVIEWS = {
  bram: {
    name: "Bram Halloway",
    description: WHO.bram,
    capabilities: [], limitations: [], answers: [],
    // The hit points the owner types on the review (the rest of the combat profile is derived at commit).
    mechanics: { hp: 44, attack: 0, defense: 10, skill: 0, weaponName: null, weaponDamage: null },
    equipmentProfile: "standard_humanoid",
    sheet: {
      schemaVersion: 2, mode: "structured_rpg", level: 5, tier: null,
      role: "Human, fighter 5 (Champion; Protection fighting style), former caravan guard of the Trade Way",
      background: "Caravan guard (soldier): six years with a free company, ten guarding caravans on the Trade Way between Baldur's Gate and Amn. Paid off in Nashkel.",
      attributes: { strength: 17, dexterity: 12, constitution: 15, intelligence: 10, wisdom: 13, charisma: 10 },
      skills: ["Athletics +6", "Perception +4", "Survival +4", "Intimidation +3", "Tools: land vehicles +3"],
      saves: ["Strength saving throw +6 (proficient)", "Constitution saving throw +5 (proficient)", "Dexterity saving throw +1", "Intelligence saving throw +0", "Wisdom saving throw +1", "Charisma saving throw +0"],
      attacks: ["Longsword +6 to hit, 1d8+3 slashing (1d10+3 two-handed)", "Javelin +6 to hit, 1d6+3 piercing, range 30/120", "Extra Attack: two attacks with the Attack action"],
      abilities: [
        "Proficiency bonus +3",
        "Extra Attack: attacks twice when taking the Attack action",
        "Fighting style, Protection: with a shield, a reaction imposes disadvantage on an attack against a creature within 5 feet of him",
        "Second Wind: a bonus action, regains 1d10+5 hit points; once per short rest",
        "Action Surge: one additional action on his turn; once per short rest",
        "Improved Critical (Champion): a weapon attack crits on 19 or 20",
        "Healer's kit: stabilises a dying creature without a check (ten uses)",
      ],
      limitations: ["No magic at all", "Heavy armour: disadvantage on Stealth", "Second Wind and Action Surge return only after a short rest"],
      speed: "30 feet", armorClass: 18, spells: [],
    },
    possessions: [
      item("Chain Mail", "armor", "Rings of iron over a padded coat, mended at the left shoulder. AC 16; disadvantage on Stealth.", { slot: "body", mechanics: "AC 16, heavy armour" }),
      item("Shield", "shield", "A round oak shield rimmed with iron; an old free company's mark painted over in brown. +2 AC.", { slot: "offhand", mechanics: "+2 AC" }),
      item("Longsword", "weapon", "A plain soldier's blade, re-hilted twice.", { slot: "hand", mechanics: "1d8+3 slashing, versatile 1d10" }),
      item("Javelin", "weapon", "Short throwing spears in a leather quiver on his back.", { quantity: 4, mechanics: "1d6+3 piercing, thrown 30/120" }),
      item("Healer's Kit", "tool", "A leather pouch of bandages, salves and splints. As an action, stabilises a creature at 0 hit points without a check.", { mechanics: "stabilise a dying creature", detail: { charges: { value: 10, max: 10 } } }),
      item("Torch", "consumable", "Pitch-soaked torches. Each burns about an hour: bright light 20 feet, dim 20 more.", { quantity: 3, mechanics: "light, burns 1 hour" }),
      item("Tinderbox", "tool", "Flint, steel and dry tinder.", { mechanics: "lights a fire or a torch" }),
      item("Hempen Rope (50 feet)", "gear", "Coiled at his belt.", { mechanics: "50 feet" }),
      item("Bedroll and Hardtack", "gear", "A bedroll, five days of hardtack and a waterskin.", { mechanics: "5 days of rations" }),
    ],
    counters: [counter("hit_dice", "Hit dice (d10)", 5), counter("second_wind", "Second Wind", 1), counter("action_surge", "Action Surge", 1)],
    wallet: [{ code: "gp", amount: 23 }, { code: "sp", amount: 14 }, { code: "cp", amount: 30 }],
  },
  sefa: {
    name: "Sefa Marrin",
    description: WHO.sefa,
    capabilities: [], limitations: [], answers: [],
    // The hit points the owner types on the review (the rest of the combat profile is derived at commit).
    mechanics: { hp: 38, attack: 0, defense: 10, skill: 0, weaponName: null, weaponDamage: null },
    equipmentProfile: "standard_humanoid",
    sheet: {
      schemaVersion: 2, mode: "structured_rpg", level: 5, tier: null,
      role: "Human, warlock 5 (The Celestial — the Lantern; Pact of the Tome), former hospice novice",
      background: "Acolyte of a hospice in the Lower City of Baldur's Gate; the Lantern answered her on the ninth night of the dock fever. Pact of the Tome: the Book of Shadows.",
      attributes: { strength: 8, dexterity: 14, constitution: 14, intelligence: 12, wisdom: 10, charisma: 18 },
      skills: ["Persuasion +7", "Arcana +4", "Religion +4", "Insight +3"],
      saves: ["Wisdom saving throw +3 (proficient)", "Charisma saving throw +7 (proficient)", "Strength saving throw −1", "Dexterity saving throw +2", "Constitution saving throw +2", "Intelligence saving throw +1"],
      attacks: ["Eldritch Blast +7 to hit, two beams, 1d10+4 force each, range 120 feet", "Dagger +5 to hit, 1d4+2 piercing, thrown 20/60"],
      abilities: [
        "Proficiency bonus +3",
        "Spell attack +7; spell save DC 15",
        "Pact Magic: two 3rd-level pact slots, recovered only on a short or long rest",
        "Healing Light: a pool of six d6 per long rest; a bonus action spends up to four dice to heal a creature within 60 feet",
        "Pact of the Tome: the Book of Shadows holds three extra cantrips (Guidance, Spare the Dying, Thaumaturgy)",
        "Agonizing Blast: +4 to each Eldritch Blast beam's damage",
        "Repelling Blast: a beam that hits pushes the target up to 10 feet away",
        "Eyes of the Rune Keeper: reads all writing",
      ],
      limitations: ["Two pact slots only, back only after a rest", "Light armour; Strength 8 — weak up close", "One concentration spell at a time"],
      speed: "30 feet", armorClass: 14,
      spells: [
        spell("Eldritch Blast", 0, { castingTime: "1 action", range: "120 feet", components: "V, S", duration: "Instantaneous", saveOrAttack: "Ranged spell attack +7", damage: "1d10+4 force per beam (2 beams)", text: "Two beams of crackling energy; a separate attack for each." }),
        spell("Light", 0, { castingTime: "1 action", range: "Touch", components: "V, M", duration: "1 hour", text: "An object sheds bright light 20 feet and dim light 20 more." }),
        spell("Sacred Flame", 0, { castingTime: "1 action", range: "60 feet", components: "V, S", duration: "Instantaneous", saveOrAttack: "Dexterity save DC 15", damage: "2d8 radiant" }),
        spell("Mage Hand", 0, { castingTime: "1 action", range: "30 feet", components: "V, S", duration: "1 minute" }),
        spell("Minor Illusion", 0, { castingTime: "1 action", range: "30 feet", components: "S, M", duration: "1 minute" }),
        spell("Guidance", 0, { castingTime: "1 action", range: "Touch", components: "V, S", duration: "Concentration, up to 1 minute", concentration: true, text: "The target adds 1d4 to one ability check of its choice." }),
        spell("Spare the Dying", 0, { castingTime: "1 action", range: "Touch", components: "V, S", duration: "Instantaneous", text: "A living creature at 0 hit points becomes stable." }),
        spell("Thaumaturgy", 0, { castingTime: "1 action", range: "30 feet", components: "V", duration: "Up to 1 minute" }),
        spell("Cure Wounds", 1, { castingTime: "1 action", range: "Touch", components: "V, S", duration: "Instantaneous", text: "Heals 1d8+4 per slot level (3d8+4 from a pact slot).", higherLevels: "+1d8 per slot level above 1st." }),
        spell("Guiding Bolt", 1, { castingTime: "1 action", range: "120 feet", components: "V, S", duration: "1 round", saveOrAttack: "Ranged spell attack +7", damage: "6d6 radiant from a pact slot", text: "The next attack against the target has advantage." }),
        spell("Misty Step", 2, { castingTime: "1 bonus action", range: "Self", components: "V", duration: "Instantaneous", text: "Teleports up to 30 feet to a place she can see." }),
        spell("Lesser Restoration", 2, { castingTime: "1 action", range: "Touch", components: "V, S", duration: "Instantaneous", text: "Ends a disease or one condition: blinded, deafened, paralysed or poisoned." }),
        spell("Hold Person", 2, { castingTime: "1 action", range: "60 feet", components: "V, S, M", duration: "Concentration, up to 1 minute", concentration: true, saveOrAttack: "Wisdom save DC 15", text: "A humanoid is paralysed; from a 3rd-level slot, two humanoids." }),
        spell("Daylight", 3, { castingTime: "1 action", range: "60 feet", components: "V, S", duration: "1 hour", text: "A 60-foot sphere of bright light and 60 feet of dim light beyond; dispels magical darkness of 3rd level or lower." }),
      ],
    },
    possessions: [
      item("Studded Leather Armour", "armor", "Dark leather, the studs blackened with lamp soot. AC 12 + Dexterity.", { slot: "body", mechanics: "AC 12 + Dex, light armour" }),
      item("Book of Shadows", "accessory", "A small book bound in pale leather whose pages stay faintly warm; the Lantern's pact. Her spellcasting focus.", { slot: "belt", mechanics: "pact tome, spellcasting focus" }),
      item("Dagger", "weapon", "A plain hospice knife, kept sharp.", { slot: "hand", mechanics: "1d4+2 piercing, finesse, thrown 20/60" }),
      item("Prayer Beads", "jewelry", "Wooden beads from the hospice; one is cracked.", { slot: "amulet", mechanics: "" }),
      item("Candle", "consumable", "Tallow candles. Each burns about an hour: dim light 5 feet.", { quantity: 2, mechanics: "light, burns 1 hour" }),
      item("Tinderbox", "tool", "Flint, steel and dry tinder.", { mechanics: "lights a fire or a candle" }),
      item("Bedroll and Rations", "gear", "A bedroll, five days of rations and a waterskin.", { mechanics: "5 days of rations" }),
    ],
    counters: [counter("pact_slots", "Pact slots (3rd level)", 2), counter("healing_light", "Healing Light (d6)", 6), counter("hit_dice", "Hit dice (d8)", 5)],
    wallet: [{ code: "pp", amount: 1 }, { code: "gp", amount: 8 }, { code: "sp", amount: 41 }, { code: "cp", amount: 12 }],
  },
  pell: {
    name: "Pell Dunmore",
    description: WHO.pell,
    capabilities: [], limitations: [], answers: [],
    // The hit points the owner types on the review (the rest of the combat profile is derived at commit).
    mechanics: { hp: 33, attack: 0, defense: 10, skill: 0, weaponName: null, weaponDamage: null },
    equipmentProfile: "standard_humanoid",
    sheet: {
      schemaVersion: 2, mode: "structured_rpg", level: 5, tier: null,
      role: "Human, rogue 5 (Thief), Lower City roof-runner turned hireling",
      background: "Urchin of the Lower City of Baldur's Gate; a guild runner at fifteen, out at twenty with his debt paid. Works for coin: doors, ledgers, second floors.",
      attributes: { strength: 10, dexterity: 17, constitution: 13, intelligence: 13, wisdom: 12, charisma: 12 },
      skills: ["Stealth +9 (expertise)", "Sleight of Hand +6", "Acrobatics +6", "Perception +4", "Investigation +4", "Insight +4", "Tools: thieves' tools +9 (expertise)"],
      saves: ["Dexterity saving throw +6 (proficient)", "Intelligence saving throw +4 (proficient)", "Strength saving throw +0", "Constitution saving throw +1", "Wisdom saving throw +1", "Charisma saving throw +1"],
      attacks: ["Shortsword +6 to hit, 1d6+3 piercing", "Dagger +6 to hit, 1d4+3 piercing, thrown 20/60", "Shortbow +6 to hit, 1d6+3 piercing, range 80/320", "Sneak Attack: +3d6 once a turn with advantage or an ally beside the target"],
      abilities: [
        "Proficiency bonus +3",
        "Sneak Attack 3d6",
        "Cunning Action: Dash, Disengage or Hide as a bonus action",
        "Uncanny Dodge: a reaction halves the damage of an attack he can see",
        "Fast Hands (Thief): a bonus action to use an object — a potion on another, a lock, a lamp",
        "Second-Story Work: climbs at full speed",
        "Thieves' Cant",
      ],
      limitations: ["Light armour; 33 hit points — he cannot stand at the front for long", "Sneak Attack needs advantage or an ally beside the target"],
      speed: "30 feet", armorClass: 15, spells: [],
    },
    possessions: [
      item("Studded Leather Armour", "armor", "Close-fitting, dark, the studs filed flat so they do not catch the light. AC 12 + Dexterity.", { slot: "body", mechanics: "AC 12 + Dex, light armour" }),
      item("Shortsword", "weapon", "A short, straight blade worn on the right hip.", { slot: "hand", mechanics: "1d6+3 piercing, finesse, light" }),
      item("Dagger", "weapon", "Balanced for throwing.", { quantity: 2, mechanics: "1d4+3 piercing, finesse, thrown 20/60" }),
      item("Shortbow", "weapon", "A horn-backed bow, unstrung on the road.", { mechanics: "1d6+3 piercing, range 80/320, two hands", detail: { hands: 2 } }),
      item("Arrow", "ammunition", "In a quiver at his hip.", { quantity: 20, mechanics: "for the shortbow" }),
      item("Thieves' Tools", "tool", "Picks, a tension wrench, a small mirror and a file, rolled in oiled cloth.", { slot: "belt", mechanics: "thieves' tools, expertise" }),
      item("Potion of Healing", "consumable", "Three red flasks in a padded healer's satchel — the only healing potions he carries. Each heals 2d4+2; drinking one is a bonus action, and with Fast Hands he can give one to another as a bonus action.", { quantity: 3, mechanics: "heals 2d4+2" }),
      item("Hooded Lantern", "gear", "Brass, with a shutter. Bright light 30 feet, dim 30 more; a flask of oil burns six hours.", { mechanics: "light, 6 hours a flask" }),
      item("Flask of Oil", "consumable", "Lamp oil for the hooded lantern.", { quantity: 2, mechanics: "6 hours of lantern light each" }),
      item("Silk Rope (50 feet)", "gear", "Light and strong.", { mechanics: "50 feet" }),
      item("Bedroll and Rations", "gear", "A bedroll, a tinderbox, five days of rations and a waterskin.", { mechanics: "5 days of rations" }),
    ],
    counters: [counter("hit_dice", "Hit dice (d8)", 5)],
    wallet: [{ code: "gp", amount: 31 }, { code: "ep", amount: 2 }, { code: "sp", amount: 6 }, { code: "cp", amount: 55 }],
  },
};

/** The order of the characters at the table: seat 1, 2, 3. Seat 1's character is the app's hero record. */
export const CHARACTERS = [
  { id: "bram", seat: 1, name: "Bram Halloway", short: "Bram", cls: "fighter", line: "Bram Halloway — a human fighter in chain mail with a shield, a former caravan guard of the Trade Way." },
  { id: "sefa", seat: 2, name: "Sefa Marrin", short: "Sefa", cls: "warlock", line: "Sefa Marrin — a human warlock of a celestial patron, once a hospice novice in Baldur's Gate; she heals with light." },
  { id: "pell", seat: 3, name: "Pell Dunmore", short: "Pell", cls: "rogue", line: "Pell Dunmore — a human rogue from the Lower City of Baldur's Gate, quick and quiet; he carries a healer's satchel of potions." },
];
export const characterOf = (id) => CHARACTERS.find((c) => c.id === id) ?? null;

/** The sheet as the player reads it in their own files (the review screen's fields, in the order of 05 §2). */
export function sheetText(review) {
  const s = review.sheet;
  const a = s.attributes;
  const lines = [
    `Role / archetype: ${s.role}`,
    `Background: ${s.background}`,
    `Ability scores: Strength ${a.strength} · Dexterity ${a.dexterity} · Constitution ${a.constitution} · Intelligence ${a.intelligence} · Wisdom ${a.wisdom} · Charisma ${a.charisma}`,
    `Level ${s.level} · AC ${s.armorClass} · Speed ${s.speed}`,
    `Skills: ${s.skills.join("; ")}`,
    `Saving throws: ${s.saves.join("; ")}`,
    `Attacks: ${s.attacks.join("; ")}`,
    `Abilities: ${s.abilities.join("; ")}`,
    `Limits: ${s.limitations.join("; ")}`,
    ...(s.spells.length ? [`Spells: ${s.spells.map((x) => `${x.name} (${x.level === 0 ? "cantrip" : `level ${x.level}`})`).join("; ")}`] : []),
    `Things carried: ${review.possessions.map((x) => `${x.name}${x.quantity > 1 ? ` ×${x.quantity}` : ""}${x.slot ? " (worn)" : ""}`).join("; ")}`,
    `Counters: ${review.counters.map((c) => `${c.label} ${c.value}${c.max !== null ? `/${c.max}` : ""}`).join("; ")}`,
    `Money: ${review.wallet.map((c) => `${c.amount} ${c.code}`).join(", ")}`,
  ];
  return lines.join("\n");
}
