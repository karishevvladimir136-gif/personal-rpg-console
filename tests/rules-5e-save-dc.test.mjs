// The 5e rules module (src/lib/live2d/battle/rules-5e.ts): a warlock's pact rod with «+1 to spell save DC» was read as +1
// to every one of his own saving throws (the word «save»). A save DC is what others roll against; only a bonus to the
// wearer's own saves adds to them.
import test from "node:test";
import assert from "node:assert/strict";
import { deriveSheet5e, textBonuses } from "../src/lib/live2d/battle/rules-5e.ts";

const CID = "00000000-0000-4000-8000-0000000000c2";
const HERO = "00000000-0000-4000-8000-0000000000a2";
const BAG = "00000000-0000-4000-8000-0000000000b2";
const sheet = { schemaVersion: 2, mode: "structured_rpg", role: "Human, warlock 5 (The Celestial; Pact of the Chain)",
  level: 5, tier: null, background: "", attributes: { strength: 9, dexterity: 15, constitution: 14, intelligence: 11, wisdom: 13, charisma: 18 },
  skills: ["Deception +7"], abilities: [], limitations: [], attacks: ["Eldritch Blast: 2 beams, +8 to hit each, 1d10+4 force per beam, range 120 ft"],
  saves: ["Strength save −1", "Dexterity save +2", "Constitution save +2", "Intelligence save +0", "Wisdom save +4", "Charisma save +7"],
  speed: "30 feet", armorClass: 15, spells: [] };
const hero = { id: HERO, campaign_id: CID, revision: 1, updated_at: "", kind: "player", name: "Corin Vale", details: "", hp: 38, max_hp: 38,
  stats: { attack: 8, defense: 15, skill: 3 }, resources: {}, conditions: [], equipment_slots: [], character_sheet: sheet, public_profile: {} };
let n = 0;
const item = (name, category, slot, mechanics, detail = {}) => ({ id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`, campaign_id: CID, revision: 1,
  updated_at: "", name, category, quantity: 1, description: "", mechanics, owner_entity_id: HERO, storage_id: BAG, equipped_entity_id: slot ? HERO : null, equipped_slot: slot, detail });
const armour = item("Studded Jerkin", "armor", "body", "light armour, AC 12 + Dex");
const cloak = item("Grey Wanderer's Cloak", "clothing", "cloak", "Cloak of Protection: +1 to AC and saving throws; requires attunement",
  { bonuses: [{ to: "AC", value: 1 }, { to: "saving throws", value: 1 }], attunement: true });
const rod = item("Blackwood Pact Rod", "tool", "hand", "spellcasting focus; requires attunement by a warlock; once a day regain one spent pact slot",
  { bonuses: [{ to: "spell attack", value: 1 }, { to: "spell save DC", value: 1 }], attunement: true });
const off = (thing) => ({ ...thing, equipped_entity_id: null, equipped_slot: null });
const derive = (items) => deriveSheet5e({ entity: hero, items, language: "en" });
const saves = (derived) => Object.fromEntries(derived.saves.map((save) => [save.ability, [save.value, save.text]]));

test("the rod's «spell save DC +1» adds to the spell attack, never to the warlock's own saves; the cloak's +1 does", () => {
  const worn = derive([armour, cloak, rod]);
  assert.equal(worn.ac.value, 15);
  assert.equal(worn.ac.text, "Studded Jerkin 12 + Dex 2 + Grey Wanderer's Cloak 1 = 15");
  assert.equal(worn.attack.value, 8);
  assert.equal(worn.attack.text, "+4 Cha +3 proficiency +1 Blackwood Pact Rod");
  const all = saves(worn);
  assert.deepEqual(all.strength, [0, "Str −1 +1 Grey Wanderer's Cloak"]);
  assert.deepEqual(all.dexterity, [3, "Dex +2 +1 Grey Wanderer's Cloak"]);
  assert.deepEqual(all.wisdom, [5, "Wis +1 +3 proficiency +1 Grey Wanderer's Cloak"]);
  assert.deepEqual(all.charisma, [8, "Cha +4 +3 proficiency +1 Grey Wanderer's Cloak"]);
  assert.ok(worn.saves.every((save) => !save.text.includes("Pact Rod")), "the rod is no source of any save");
  // The cloak off: AC 14 and the bare saves; the rod off: the attack without it, the saves unchanged.
  const noCloak = derive([armour, off(cloak), rod]);
  assert.equal(noCloak.ac.value, 14);
  assert.deepEqual(saves(noCloak).wisdom, [4, "Wis +1 +3 proficiency"]);
  assert.deepEqual(saves(noCloak).charisma, [7, "Cha +4 +3 proficiency"]);
  const noRod = derive([armour, cloak, off(rod)]);
  assert.equal(noRod.attack.value, 7);
  assert.deepEqual(saves(noRod), all);
});

test("a save DC in an item's words or recorded bonuses is no save bonus, in English and Russian; own saves still count", () => {
  assert.deepEqual(textBonuses("+1 to spell attack rolls and spell save DC"), { ac: null, saves: [], attack: 1 });
  assert.deepEqual(textBonuses("+1 to the DC of your spell saves").saves, []);
  assert.deepEqual(textBonuses("+1 к атакам заклинаниями и Сл спасброска от заклинаний"), { ac: null, saves: [], attack: 1 });
  assert.deepEqual(textBonuses("+1 к сложности спасбросков от заклинаний").saves, []);
  // What already counted keeps counting.
  assert.deepEqual(textBonuses("+1 to AC and saving throws"), { ac: 1, saves: [{ value: 1, ability: null }], attack: null });
  assert.deepEqual(textBonuses("+2 to Wisdom saving throws").saves, [{ value: 2, ability: "wisdom" }]);
  assert.deepEqual(textBonuses("+2 к спасброскам и Сл спасброска от заклинаний").saves, [{ value: 2, ability: null }]);
  assert.deepEqual(textBonuses("+1 к КД и спасброскам").saves, [{ value: 1, ability: null }]);
  // Recorded bonuses: «Сл спасброска заклинаний» adds nothing to saves; «спасброски» does.
  const amulet = (to) => item("Amulet", "jewelry", "amulet", "", { bonuses: [{ to, value: 1 }] });
  assert.equal(saves(derive([armour, amulet("Сл спасброска заклинаний")])).wisdom[0], 4);
  assert.equal(saves(derive([armour, amulet("save DC")])).charisma[0], 7);
  assert.equal(saves(derive([armour, amulet("спасброски")])).wisdom[0], 5);
});
