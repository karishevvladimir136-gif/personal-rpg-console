// Fix S3-accept, block Г (docs/stages/FIX_S3_ACCEPT.md): the sheet's numbers. Г3 — AC (and the saves) derived by the 5e
// rules module from the worn things and the effects, on the server, one number for the sheet, the doll, the battle block
// and `combat attack`; Г1 — the 5e plates «КД», «Атака», «Навык» with their breakdowns. (Г2 extends tests/i18n.test.mjs.)
// Pure functions, component source text and the real turn path with scripted models on disposable PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deriveSheet5e, derivedSheetOf, isFifthEdition, withDerivedSheets, endsAtOwnTurn, sheetLabels5e } from "../src/lib/live2d/battle/rules-5e.ts";
import { sheetPlates } from "../src/lib/ui/campaign-view.ts";
import { planSheet } from "../src/lib/inventory/owner-moves.ts";
import { loopCampaign } from "./dm-loop-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const CID = "00000000-0000-4000-8000-0000000000c1";
const HERO = "00000000-0000-4000-8000-0000000000a1";
const BAG = "00000000-0000-4000-8000-0000000000b1";
const sheet = (over = {}) => ({ schemaVersion: 2, mode: "structured_rpg", role: "Волшебник, школа воплощения", level: 5, tier: null, background: "",
  attributes: { strength: 8, dexterity: 14, constitution: 14, intelligence: 18, wisdom: 12, charisma: 10 }, skills: ["Магия +7"], abilities: [], limitations: [],
  saves: ["Спасбросок Интеллекта +7", "Спасбросок Мудрости +4"], attacks: ["Огненный снаряд: +7 к попаданию, 2d10 огнём"], speed: "30 футов", armorClass: 12, spells: [], ...over });
const hero = (over = {}) => ({ id: HERO, campaign_id: CID, revision: 3, updated_at: "", kind: "player", name: "Ярвен", details: "", hp: 30, max_hp: 30,
  stats: { level: 5, attack: 7, defense: 12, skill: 3 }, resources: {}, conditions: [], equipment_slots: [], character_sheet: sheet(), public_profile: {}, ...over });
let n = 0;
const item = (name, category, slot, mechanics = "", detail = {}, description = "") => ({ id: `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`, campaign_id: CID, revision: 1,
  updated_at: "", name, category, quantity: 1, description, mechanics, owner_entity_id: HERO, storage_id: BAG, equipped_entity_id: slot ? HERO : null, equipped_slot: slot, detail });
const robe = (slot = "body") => item("Мантия боевого мага", "clothing", slot, "+1 к КД, если на вас нет доспехов и щита");
const data = (entities, items, label = "D&D 5e (2014)") => ({ campaign: { id: CID, language: "ru" }, settings: { values: { rulesSystem: { id: "world-logic-v1", label } } }, entities, items, storages: [] });
const ac = (entity, items, fight) => deriveSheet5e({ entity, items, fight, language: "ru" }).ac;

test("Г3: robe on/off → AC 13/12 (the robe counts with no armour and no shield)", () => {
  assert.equal(ac(hero(), [robe()]).value, 13);
  assert.equal(ac(hero(), [robe()]).text, "10 + Ловкость 2 + Мантия боевого мага 1 = 13");
  assert.equal(ac(hero(), [robe(null)]).value, 12, "taken off, kept in the bag");
  assert.equal(ac(hero(), []).value, 12);
  // Its condition honoured: a shield or a body armour switches the robe's +1 off.
  assert.equal(ac(hero(), [robe("cloak"), item("Деревянный щит", "shield", "offhand")]).value, 14, "10 + Dex 2 + shield 2, no robe");
  assert.equal(ac(hero(), [robe("cloak"), item("Кожаный доспех", "armor", "body")]).value, 13, "leather 11 + Dex 2, no robe");
  // The armour's own words and the SRD names: medium armour lets at most +2 count, heavy none.
  const dex18 = hero({ character_sheet: sheet({ attributes: { strength: 8, dexterity: 18, constitution: 14, intelligence: 18, wisdom: 12, charisma: 10 } }) });
  assert.equal(ac(dex18, [item("Кольчужная рубаха", "armor", "body")]).value, 15, "13 + Dex 4 capped at 2");
  assert.equal(ac(dex18, [item("Латы", "armor", "body")]).value, 18);
  assert.equal(ac(dex18, [item("Странная броня", "armor", "body", "КД 14 + Лов (макс. 1)")]).value, 15);
  // A bonus recorded on the item (detail.bonuses) counts once, not again from its words.
  const ring = item("Кольцо защиты", "jewelry", "ring_right", "+1 к КД и спасброскам", { bonuses: [{ to: "КД", value: 1 }, { to: "спасброски", value: 1 }] });
  assert.equal(ac(hero(), [robe(), ring]).value, 14);
  // The robe as the DM may have recorded it: kind «armor», its bonus and condition in detail.bonuses — still a robe, not armour.
  const asArmour = item("Мантия боевого мага", "armor", "body", "", { bonuses: [{ to: "КД (без доспехов и щита)", value: 1 }] });
  assert.equal(ac(hero(), [asArmour]).value, 13);
  assert.equal(ac(hero(), [asArmour, item("Щит", "shield", "offhand")]).value, 14, "with a shield: 10 + 2 + 2, the robe off");
});

test("Г3: Mage Armor active → 15; Shield +5 until the caster's next turn (a fight condition)", () => {
  const armoured = hero({ conditions: ["Доспехи мага"] });
  assert.equal(ac(armoured, []).value, 15);
  assert.equal(ac(armoured, []).text, "10 + Ловкость 2 = 12 · с Доспехами мага 15", "the owner's breakdown, word for word");
  assert.equal(ac(armoured, [robe()]).value, 16, "Mage Armor is no armour: the robe still counts");
  assert.equal(ac(armoured, [item("Кожаный доспех", "armor", "body")]).value, 13, "worn armour ends Mage Armor's base");
  assert.equal(ac(hero(), [], ["mage armor"]).value, 15, "written in the fight works too");
  assert.equal(ac(armoured, [], ["щит"]).value, 20);
  assert.equal(ac(armoured, [], ["щит"]).text, "10 + Ловкость 2 = 12 · с Доспехами мага 15 · со Щитом 20");
  assert.equal(ac(hero({ conditions: ["Щит"] }), []).value, 12, "Shield on the record outside a fight counts for nothing (it needs a next turn)");
  assert.equal(ac(hero(), [], ["щит веры"]).value, 12, "Shield of Faith is another spell");
  assert.ok(endsAtOwnTurn("щит") && endsAtOwnTurn("Shield") && !endsAtOwnTurn("доспехи мага") && !endsAtOwnTurn("prone"));
});

test("Г3: the ring's +1 to all saves — the six saves derived, each explained", () => {
  const ring = item("Кольцо малой защиты", "jewelry", "ring_right", "+1 к КД и спасброскам");
  const saves = deriveSheet5e({ entity: hero(), items: [ring], language: "ru" }).saves;
  assert.equal(saves.length, 6);
  const byAbility = Object.fromEntries(saves.map((save) => [save.ability, save]));
  assert.deepEqual([byAbility.intelligence.label, byAbility.intelligence.value, byAbility.intelligence.text],
    ["Спасбросок Интеллекта", 8, "Инт +4 +3 мастерство +1 Кольцо малой защиты"]);
  assert.deepEqual([byAbility.dexterity.label, byAbility.dexterity.value, byAbility.dexterity.text], ["Ловкость", 3, "Лов +2 +1 Кольцо малой защиты"]);
  assert.equal(byAbility.strength.value, 0, "Str −1 +1");
  assert.equal(ac(hero(), [ring]).value, 13, "and +1 AC");
  const off = deriveSheet5e({ entity: hero(), items: [{ ...ring, equipped_entity_id: null, equipped_slot: null }], language: "ru" }).saves;
  assert.equal(off.find((save) => save.ability === "intelligence").value, 7, "a ring in the bag adds nothing");
  // A save of one ability only.
  const amulet = item("Амулет мудреца", "jewelry", "amulet", "+2 к спасброскам Мудрости");
  const wis = deriveSheet5e({ entity: hero(), items: [amulet], language: "ru" }).saves;
  assert.equal(wis.find((save) => save.ability === "wisdom").value, 6);
  assert.equal(wis.find((save) => save.ability === "charisma").value, 0);
  // A sheet of schema 1 lists no saves: the class's proficient ones (a wizard: INT, WIS) add the proficiency.
  const early = hero({ character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Волшебница", background: "", level: 5, tier: null,
    attributes: sheet().attributes, skills: [], abilities: [], limitations: [], spells: [] } });
  const byClass = Object.fromEntries(deriveSheet5e({ entity: early, items: [ring], language: "ru" }).saves.map((save) => [save.ability, [save.value, save.text]]));
  assert.deepEqual(byClass.intelligence, [8, "Инт +4 +3 мастерство +1 Кольцо малой защиты"]);
  assert.deepEqual(byClass.wisdom, [5, "Мдр +1 +3 мастерство +1 Кольцо малой защиты"]);
  assert.deepEqual(byClass.dexterity, [3, "Лов +2 +1 Кольцо малой защиты"]);
  const unknown = hero({ character_sheet: { ...early.character_sheet, role: "Странник" } });
  assert.deepEqual(deriveSheet5e({ entity: unknown, items: [], language: "ru" }).saves, [], "a class the words do not name: no saves guessed");
});

test("Г3: a non-5e campaign keeps its stored number; a sheet without DEX keeps it in 5e too", () => {
  assert.equal(isFifthEdition({ id: "world-logic-v1", label: "D&D 5e (2014)" }), true);
  assert.equal(isFifthEdition({ id: "world-logic-v1", label: "World Logic" }), false);
  assert.equal(isFifthEdition("Pathfinder 2e"), false, "Pathfinder counts its own AC");
  const other = data([hero()], [robe()], "World Logic");
  assert.equal(derivedSheetOf(other, hero()), null);
  const plates = sheetPlates(other, hero(), [["attack", 7], ["defense", 12], ["skill", 3]]);
  assert.deepEqual(plates.map((plate) => [plate.label, plate.value]), [["Armor class", 12], ["Speed", "30 футов"], ["Attack", 7], ["Defense", 12], ["Skill", 3]]);
  assert.ok(plates.every((plate) => plate.text === null && !plate.translated));
  const noDex = hero({ character_sheet: sheet({ attributes: null }) });
  assert.deepEqual([ac(noDex, [robe()]).value, ac(noDex, [robe()]).source, ac(noDex, [robe()]).text], [12, "sheet", "по листу 12"]);
  assert.equal(deriveSheet5e({ entity: noDex, items: [], fight: ["щит"], fightAc: 14, language: "ru" }).ac.value, 19, "the fight's number + Shield");
});

test("Г3: the owner's «КД вручную» outranks the rules; empty is by the rules again", () => {
  const view = data([hero()], [robe()]);
  const ctx = { language: "ru", at: 0, newId: () => "x" };
  const plan = planSheet(view, HERO, {}, ctx, 17);
  assert.equal(plan.ok, true, plan.reason);
  assert.deepEqual(plan.steps[0].payload.stats, { level: 5, attack: 7, defense: 12, skill: 3, ac_manual: 17 });
  assert.equal("character_sheet" in plan.steps[0].payload, false, "the sheet itself is not rewritten");
  assert.match(plan.note, /КД вручную 17/);
  const manual = hero({ stats: { ...hero().stats, ac_manual: 17 } });
  assert.deepEqual([ac(manual, [robe()]).value, ac(manual, [robe()]).source, ac(manual, [robe()]).text], [17, "manual", "вручную 17 · по правилам 13"]);
  assert.equal(ac(manual, [robe()], ["щит"]).value, 22, "Shield still adds in a fight");
  const cleared = planSheet(data([manual], [robe()]), HERO, {}, ctx, null);
  assert.equal(cleared.ok, true);
  assert.equal("ac_manual" in cleared.steps[0].payload.stats, false);
  assert.equal(planSheet(view, HERO, {}, ctx, undefined).ok, false, "nothing changed");
  // The editor: «КД вручную» where the rules count, the stored number elsewhere.
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /ruledAc \? c\("КД вручную \(пусто — по правилам\)", "AC by hand \(empty: by the rules\)"\) : c\.label\("Armor class"\)/);
  assert.match(screen, /onSave=\{\(patch, manualAc\) => moves\.run\(planSheet\(view, entity\.id, patch, ctx, manualAc\)\)\}/);
});

test("Г3: computed on the server — the public read carries each person's numbers; the sheet, the doll and the battle block read them", () => {
  const view = data([hero({ conditions: ["Доспехи мага"] }), { ...hero(), id: "f", kind: "faction", character_sheet: null }], [robe()]);
  const read = withDerivedSheets(view);
  assert.equal(read.entities[0].derived.ac.value, 16);
  assert.equal(read.entities[1].derived, undefined, "a faction has no sheet numbers");
  assert.equal(withDerivedSheets(data([hero()], [robe()], "World Logic")).entities[0].derived, undefined, "another system: nothing attached");
  // The screens read the server's numbers (a stale client copy is not recomputed).
  const served = { ...read.entities[0], derived: { ...read.entities[0].derived, ac: { value: 99, text: "server", source: "rules" } } };
  assert.equal(derivedSheetOf(read, served).ac.value, 99);
  assert.equal(derivedSheetOf(read, served, { conditions: [] }).ac.value, 16, "a fight's own reading recounts");
  assert.match(src("src/lib/server/public-campaign.ts"), /const snapshot = withDerivedSheets\(await readCampaign\(campaignId\)\);/);
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /const derived = derivedSheetOf\(view, entity\);/);
  assert.match(screen, /armour=\{dollAc\}/, "the doll shows the AC");
  // The doll lives in inventory-grid.tsx since А1 moved it there.
  assert.match(src("src/components/registry/inventory-grid.tsx"), /action=\{armour \? <span className=\{r\.badge\} title=\{armour\.text\} data-doll-ac="">/);
  assert.match(src("src/components/live2d/battle/battle-model.ts"), /derivedSheetOf\(snapshot, entity, \{ conditions: fighter\.combatant\.conditions, ac: fighter\.combatant\.ac \}\)/);
  assert.match(src("src/components/live2d/battle/battle-screen.tsx"), /\{heroAc && <span className=\{r\.badge\} title=\{heroAc\.text \|\| undefined\} data-battle-ac="">\{c\("КД", "AC"\)\} \{heroAc\.value\}<\/span>\}/);
  assert.match(src("src/lib/gameplay/dm-loop/context.ts"), /counted: \{ \.\.\.\(derived\.ac \? \{ armourClass: derived\.ac\.value, how: derived\.ac\.text \} : \{\}\)/);
});

test("Г1: in a 5e campaign the plates read «КД», «Атака», «Навык», each with its breakdown", () => {
  const armoured = hero({ conditions: ["Доспехи мага"] });
  const plates = sheetPlates(data([armoured], []), armoured, [["attack", 7], ["defense", 12], ["skill", 3], ["spell_dc", 15]]);
  assert.deepEqual(plates.map((plate) => [plate.label, plate.value, plate.text]), [
    ["КД", 15, "10 + Ловкость 2 = 12 · с Доспехами мага 15"],
    ["Speed", "30 футов", null],
    ["Атака", "+7", "+4 Инт +3 мастерство"],
    ["Навык", "+3", "+3 мастерство · уровень 5"],
    ["Spell dc", 15, null],
  ], "the house-profile «Защита», «Атака», «Навык» are not repeated; other stats stay");
  // A sheet without a level (the bootstrap's) keeps the record's «Навык» and «Атака», said where they come from.
  const levelless = hero({ stats: { attack: 7, defense: 12, skill: 3 }, character_sheet: sheet({ level: null }) });
  assert.deepEqual(sheetPlates(data([levelless], []), levelless, [["attack", 7], ["defense", 12], ["skill", 3]]).map((plate) => [plate.label, plate.value, plate.text]),
    [["КД", 12, "10 + Ловкость 2 = 12"], ["Speed", "30 футов", null], ["Атака", "+7", "+7 по листу"], ["Навык", "+3", "+3 по листу"]]);
  assert.deepEqual(sheetLabels5e("ru"), { ac: "КД", attack: "Атака", skill: "Навык", saves: "Спасброски" });
  assert.deepEqual(sheetLabels5e("en").ac, "AC");
  // A fighter's attack: the better of STR and DEX; a worn thing's own bonus to attacks counts (a weapon's «+5 к попаданию» is its whole to-hit).
  const fighter = hero({ character_sheet: sheet({ role: "Воин", attributes: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 10, charisma: 8 } }) });
  const gear = [item("Длинный меч", "weapon", "hand", "+6 к попаданию, 1d8+3 рубящий"), item("Перчатки меткости", "accessory", "gloves", "+1 к атакам")];
  assert.equal(deriveSheet5e({ entity: fighter, items: gear, language: "ru" }).attack.text, "+3 Сил +3 мастерство +1 Перчатки меткости");
  // The screens: a plate the rules explain is a button with the breakdown on hover (title) and on a tap.
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /<button type="button" className=\{`\$\{r\.stat\} \$\{s\.plate\}`\} title=\{text\} aria-expanded=\{open\} onClick=\{\(\) => setOpen\(!open\)\}>/);
  assert.match(screen, /\{open && <div className=\{s\.plateWhy\}>\{text\}<\/div>\}/);
  assert.match(screen, /const tiles = sheetPlates\(view, entity, model\.derivedStats\)/);
  assert.match(screen, /<SheetLines sheet=\{sheet\} skills=\{model\.skills\} saves=\{derived\?\.saves\} \/>/);
  assert.match(src("src/components/registry/party-screen.tsx"), /<span key=\{label\} className=\{r\.badge\} title=\{why \?\? undefined\}>\{label\} \{value\}<\/span>/);
  assert.match(src("src/components/registry/game-screen.tsx"), /const numbers = sheetPlates\(data, hero, model\.derivedStats\)/);
});

/** The owner's wizard on PGlite: a 5e campaign, a schema-2 sheet with DEX 14, the robe worn; a goblin in the fight. */
async function wizardFight() {
  const c = await loopCampaign({ language: "ru" });
  await c.f.query("update public.rpg_settings set values = jsonb_set(values, '{rulesSystem,label}', '\"D&D 5e (2014)\"') where campaign_id = $1", [c.cid]);
  await c.f.query("update public.rpg_entities set character_sheet = $2::jsonb, revision = revision + 1 where id = $1", [c.hero, JSON.stringify(sheet({ armorClass: 12 }))]);
  const opened = await c.turn("Иду к мосту.", [{ text: "У моста гоблин. ", toolCalls: [
    { name: "item", arguments: { action: "create", name: "Мантия боевого мага", category: "clothing", ownerRef: c.hero, properties: "+1 к КД, если на вас нет доспехов и щита" } },
    { name: "item", arguments: { action: "equip", itemRef: "Мантия боевого мага", slot: "body" } },
    { name: "upsert_character", arguments: { localKey: "gob", name: "Гоблин", kind: "npc", present: true, hp: 7, maxHp: 7 } },
    { name: "combat", arguments: { action: "start", summary: "Мост", grid: { cols: 10, rows: 8 }, rules: true,
      placements: [{ actorRef: c.hero, x: 2, y: 2, initiative: 15 }, { actorRef: "gob", x: 3, y: 2, initiative: 10 }],
      // The DM's stat row still says the sheet's old 12: the derived number wins for a party member.
      hp: [{ actorRef: "gob", current: 7, max: 7, ac: 15 }] } },
    { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }]);
  assert.equal(opened.result.status, "committed", JSON.stringify(c.errors));
  return c;
}
const attackOn = (c, extra = []) => [{ text: "Гоблин бьёт. ", toolCalls: [...extra,
  { name: "combat", arguments: { action: "attack", actorRef: "Гоблин", targetRef: c.hero, attackBonus: 4, damage: "1d6+2", damageType: "рубящий", reason: "Гоблин бьёт" } },
  { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }];
const attackReceipt = async (c, played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts.find((r) => r.call.name === "combat" && r.call.arguments.action === "attack");

test("Г3: `combat attack` uses the derived AC — the robe's 13, Mage Armor recorded by the DM, Shield until the hero's next turn", async () => {
  const c = await wizardFight();
  try {
    // 9 + 4 = 13 against AC 13: a hit (the sheet's stored 12 would hit too; 12 below misses).
    let played = await c.turn("Жду.", attackOn(c), { dice: [8, 3] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    let receipt = await attackReceipt(c, played);
    assert.equal(receipt.result.ok, true, JSON.stringify(receipt.result));
    assert.equal(receipt.result.value.attacks[0].ac, 13, "10 + Dex 2 + the robe 1");
    assert.equal(receipt.result.value.attacks[0].hit, false, "8 + 4 = 12 misses AC 13");
    // The DM records Mage Armor on the hero (a lasting effect, with a reason): 13 + 2 + the robe = 16.
    played = await c.turn("Читаю «Доспехи мага».", attackOn(c, [
      { name: "upsert_character", arguments: { ref: c.hero, conditions: { add: ["Доспехи мага"] }, reason: "Доспехи мага, 8 часов" } }]), { dice: [11, 3] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    receipt = await attackReceipt(c, played);
    assert.equal(receipt.result.value.attacks[0].ac, 16);
    const state = await c.f.one("select conditions from public.rpg_entities where id = $1", [c.hero]);
    assert.deepEqual(state.conditions, ["Доспехи мага"]);
    // Shield as the hero's reaction: +5 in the fight; it ends when the hero's turn starts.
    played = await c.turn("Щит!", attackOn(c, [{ name: "combat", arguments: { action: "condition", actorRef: c.hero, add: ["щит"] } }]), { dice: [15, 3] });
    receipt = await attackReceipt(c, played);
    assert.equal(receipt.result.value.attacks[0].ac, 21);
    assert.equal(receipt.result.value.attacks[0].hit, false, "15 + 4 = 19 against 21");
    played = await c.turn("Мой ход.", [{ text: "Ход героя. ", toolCalls: [{ name: "combat", arguments: { action: "next_turn" } }, { name: "combat", arguments: { action: "next_turn" } },
      { name: "finish_turn", arguments: { sceneKinds: ["combat"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const heroRow = await c.f.one("select p.public_resources from public.rpg_encounter_participants p where p.entity_id = $1", [c.hero]);
    assert.deepEqual(heroRow.public_resources.conditions, [], "Shield ended at the start of the hero's turn");
    played = await c.turn("Жду.", attackOn(c), { dice: [11, 3] });
    assert.equal((await attackReceipt(c, played)).result.value.attacks[0].ac, 16);
  } finally { await c.f.db.close(); }
});

test("Г3: in a campaign of another system `combat attack` keeps the sheet's stored number", async () => {
  const c = await wizardFight();
  try {
    await c.f.query("update public.rpg_settings set values = jsonb_set(values, '{rulesSystem,label}', '\"Свои правила\"') where campaign_id = $1", [c.cid]);
    const played = await c.turn("Жду.", attackOn(c), { dice: [8, 3] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipt = await attackReceipt(c, played);
    assert.equal(receipt.result.value.attacks[0].ac, 12, "the stored 12, the robe not counted");
    assert.equal(receipt.result.value.attacks[0].hit, true);
  } finally { await c.f.db.close(); }
});
