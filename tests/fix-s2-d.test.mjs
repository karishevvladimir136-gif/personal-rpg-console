// Fix run after session 2, stage D — records and inventory (docs/runs/fix-s2-inventory-design.md).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { coinOf, counterLabel, equipPlan, equippedBonuses, guessKind, potionCounter, sameStack, spellBook, castLine, universalSlots, walletLine, walletParts }
  from "../src/lib/inventory/model.ts";

const item = (name, extra = {}) => ({ id: name, campaign_id: "c", revision: 1, updated_at: "", name, category: "ammunition", quantity: 5, description: "", mechanics: "",
  owner_entity_id: "h", storage_id: "s", equipped_entity_id: null, equipped_slot: null, detail: {}, ...extra });

// --- the model ----------------------------------------------------------------------------------------------------
test("D model: stacks merge only when one thing — «лёгкие болты» joins «болты для лёгкого арбалета», a greater potion never joins a plain one", () => {
  assert.ok(sameStack(item("лёгкие болты"), item("болты для лёгкого арбалета")));
  assert.ok(sameStack(item("стрелы"), item("Стрела")));
  assert.ok(sameStack(item("light bolts"), item("bolts for a light crossbow")));
  assert.ok(!sameStack(item("зелье лечения"), item("зелье великого лечения")));
  assert.ok(!sameStack(item("медный ключ"), item("ключ")));
  assert.ok(!sameStack(item("болты"), item("стрелы")));
  assert.ok(!sameStack(item("болты"), item("болты", { owner_entity_id: "t" })), "another owner");
  assert.ok(!sameStack(item("болты"), item("болты", { detail: { status: "lent" } })), "a lent stack stays apart");
  assert.ok(!sameStack(item("болты", { rarity: "magic" }), item("болты")), "a magic thing is never merged");
});

test("D model: the wallet is one line in the order of value with the 5e codes; «золотые» and «зм» are one coin", () => {
  assert.equal(walletLine({ "зм": 10, "мм": 26, "см": 11 }, "ru"), "Кошелёк: 10 зм · 11 см · 26 мм");
  assert.equal(walletLine({}, "ru"), "Кошелёк: пусто");
  assert.deepEqual(walletParts({ "золотые": 5, "зм": 10 }, "ru"), [{ label: "зм", amount: 15, title: "золотые монеты", value: 100 }]);
  assert.equal(walletLine({ "талеры": 3, "gp": 2 }, "en"), "Purse: 2 gp · 3 талеры");
  for (const [word, code] of [["золотых монет", "зм"], ["Зм", "зм"], ["серебряные", "см"], ["медяки", "мм"], ["gold pieces", "зм"], ["пм", "пм"]])
    assert.equal(coinOf(word, "ru")?.code, code, word);
  assert.equal(coinOf("монеты", "ru"), null);
});

test("D model: the eleven slots; rings left then right; a two-handed thing keeps the off hand empty; attunement is limited to three", () => {
  const slots = universalSlots("ru");
  assert.deepEqual(slots.map((slot) => slot.id), ["head", "amulet", "cloak", "body", "gloves", "belt", "boots", "ring_left", "ring_right", "hand", "offhand"]);
  assert.ok(!slots.some((slot) => /Ноги/.test(slot.label)));
  const hero = { id: "h", name: "Рэй", equipment_slots: slots };
  const ring = (name) => item(name, { category: "jewelry", quantity: 1 });
  let worn = [];
  const wear = (thing, slot = null) => { const plan = equipPlan(hero, worn, thing, slot, "ru"); assert.ok(plan.ok, plan.reason); worn = [...worn.filter((row) => !plan.unequip.includes(row) && row.id !== thing.id), { ...thing, equipped_entity_id: "h", equipped_slot: plan.slot.id }]; return plan; };
  assert.equal(wear(ring("Кольцо защиты")).slot.id, "ring_left");
  assert.equal(wear(ring("Кольцо тепла")).slot.id, "ring_right");
  const staff = item("Посох", { category: "weapon", quantity: 1, detail: { hands: 2 } });
  const shield = item("Щит", { category: "shield", quantity: 1 });
  wear(shield);
  const plan = wear(staff);
  assert.equal(plan.slot.id, "hand");
  assert.deepEqual(plan.unequip.map((row) => row.name), ["Щит"], "the two-handed staff takes the shield off");
  const blocked = equipPlan(hero, worn, shield, null, "ru");
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /Вторая рука занята: Посох/);
  const attuned = (name, slot) => ({ ...item(name, { category: "jewelry", quantity: 1, detail: { attunement: true } }), equipped_entity_id: "h", equipped_slot: slot });
  const three = [attuned("A", "amulet"), attuned("B", "ring_left"), attuned("C", "ring_right")];
  const fourth = equipPlan(hero, three, item("D", { category: "jewelry", quantity: 1, detail: { attunement: true } }), "ring_left", "ru");
  assert.equal(fourth.ok, false);
  assert.match(fourth.reason, /не больше чем на 3/);
  assert.equal(equipPlan(hero, [], item("Сапоги", { category: "misc", quantity: 1 }), null, "ru").ok, false, "a thing that fits no slot");
});

test("D model: equipped bonuses reach a matching roll with their source; counters have labels, never raw keys; potions are things", () => {
  const ring = item("Кольцо защиты", { category: "jewelry", quantity: 1, equipped_entity_id: "h", equipped_slot: "ring_right", detail: { bonuses: [{ to: "спасброски", value: 1 }, { to: "КД", value: 1 }] } });
  assert.deepEqual(equippedBonuses([ring], "h", "Спасбросок Ловкости от огня"), [{ source: "Кольцо защиты +1", value: 1 }]);
  assert.deepEqual(equippedBonuses([{ ...ring, equipped_entity_id: null, equipped_slot: null }], "h", "Спасбросок"), [], "not worn, no bonus");
  assert.deepEqual(equippedBonuses([{ ...item("Перчатки вора", { category: "clothing", quantity: 1, equipped_entity_id: "h", equipped_slot: "gloves", detail: { bonuses: [{ to: "Ловкость рук", value: 2 }] } }) }], "h", "Ловкость рук: вскрыть замок"), [{ source: "Перчатки вора +2", value: 2 }]);
  assert.equal(counterLabel({ public_profile: {} }, "spell_slots_3", "ru"), "Ячейки 3 круга");
  assert.equal(counterLabel({ public_profile: {} }, "hit_dice", "ru"), "Кости хитов");
  assert.equal(counterLabel({ public_profile: { counterLabels: { shaman_tusk: "Клык шамана" } } }, "shaman_tusk", "ru"), "Клык шамана");
  assert.ok(potionCounter("healing_potions") && potionCounter("potions") && potionCounter("x", "Зелья лечения") && !potionCounter("spell_slots_1"));
  assert.deepEqual(["Посох", "Кольчужная рубаха", "Зелье лечения", "Болты", "Шляпа", "Набор отмычек", "Компас", "Кольцо защиты", "Щит"].map(guessKind),
    ["weapon", "armor", "consumable", "ammunition", "clothing", "tool", "gear", "jewelry", "shield"]);
});

test("D model: the spells tab groups cantrips and levels with slot pips and «подготовлено N из M»; «Колдовать» writes the line", () => {
  const spells = [{ name: "Огненный шар", level: 3, prepared: true }, { name: "Свет", level: 0 }, { name: "Щит", level: 1, prepared: true }, { name: "Обнаружение магии", level: 1, ritual: true, concentration: true }];
  const book = spellBook(spells, { spell_slots_1: 3, spell_slots_1_max: 4, spell_slots_3: 2, spell_slots_3_max: 3, spell_slots_2: 1, spell_slots_2_max: 3 }, "ru");
  assert.deepEqual(book.map((row) => [row.label, row.spells.length, row.slots, row.prepared]),
    [["Заговоры", 1, null, 0], ["1 круг", 2, { value: 3, max: 4 }, 1], ["2 круг", 0, { value: 1, max: 3 }, 0], ["3 круг", 1, { value: 2, max: 3 }, 1]]);
  assert.equal(castLine(spells[0], 3, "ru"), "Колдую «Огненный шар» ячейкой 3 круга на ");
  assert.equal(castLine(spells[1], null, "ru"), "Колдую «Свет» на ");
});

// --- the migrations ------------------------------------------------------------------------------------------------
test("D migrations: SQL and TypeScript agree — the eleven slots, the kind a name says, the coin a word names", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    for (const language of ["ru", "en"]) {
      const sql = (await c.f.one("select rpg_private.universal_slots($1) s", [language])).s;
      assert.deepEqual(sql, universalSlots(language), language);
    }
    const names = ["Посох", "Кольчужная рубаха", "Зелье лечения", "Болты", "Шляпа", "Набор отмычек", "Компас", "Кольцо защиты", "Щит", "Длинный лук", "Свиток огня", "Robe", "Healing potion", "Плащ с капюшоном"];
    for (const name of names) assert.equal((await c.f.one("select rpg_private.guess_item_kind($1) k", [name])).k, guessKind(name), name);
    for (const word of ["золотые", "зм", "Зм", "золотых_монет", "серебряные", "см", "медяки", "gold_pieces", "пм", "монеты", "талеры"]) {
      const sql = (await c.f.one("select rpg_private.coin_code($1,'ru') c", [word])).c;
      assert.equal(sql, coinOf(word.replaceAll("_", " "), "ru")?.code ?? null, word);
    }
  } finally { await c.f.db.close(); }
});

test("D migration 77: an older hero converts once — the doll keeps what he wears (legs come off), possessions get kinds, potions become items, coins join under their codes, a mount drops its riders", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    const storage = (await f.one("select id from public.rpg_storages where entity_id=$1 order by id limit 1", [c.hero])).id;
    const old = [
      { id: "head", label: "Голова", accepts: ["armor", "clothing"] }, { id: "neck", label: "Шея / амулет", accepts: ["accessory", "jewelry", "gear"] },
      { id: "body", label: "Броня / плащ", accepts: ["armor", "clothing"] }, { id: "hand", label: "Основная рука", accepts: ["weapon", "tool"] },
      { id: "offhand", label: "Вторая рука", accepts: ["weapon", "shield", "tool"] }, { id: "belt", label: "Пояс", accepts: ["gear", "clothing", "consumable"] },
      { id: "legs", label: "Ноги", accepts: ["armor", "clothing"] }, { id: "boots", label: "Сапоги", accepts: ["armor", "clothing"] }];
    await f.db.query("update public.rpg_entities set equipment_slots=$2::jsonb, resources=resources||$3::jsonb where id=$1",
      [c.hero, JSON.stringify(old), JSON.stringify({ healing_potions: 3, healing_potions_max: 5, "currency_золотые": 10, "currency_зм": 5, "currency_см": 4, spell_slots_1: 2 })]);
    const add = async (name, category, slot) => (await f.one(`insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail,revision)
      values(gen_random_uuid(),$1,$2,$3,1,'','',$4,$5,$6,$7,'{}',1) returning id`, [c.cid, name, category, c.hero, storage, slot ? c.hero : null, slot])).id;
    const tusk = await add("Клык шамана", "gear", "neck");
    const trousers = await add("Шерстяные штаны", "clothing", "legs");
    const staff = await add("Посох", "possession", "hand");
    const compass = await add("Компас", "possession", null);
    const mount = (await f.one(`insert into public.rpg_entities(id,campaign_id,kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots,public_profile,revision)
      values(gen_random_uuid(),$1,'mount','Казённые лошади','',null,null,'{}','{}','[]','[]',$2::jsonb,1) returning id`, [c.cid, JSON.stringify({ holding: { features: [], armament: "", passengers: [c.hero] } })])).id;

    const convert = readFileSync(new URL("../supabase/migrations/202610200077_fix_s2_inventory_convert.sql", import.meta.url), "utf8").replaceAll("create function", "create or replace function");
    await f.db.exec(convert);
    const items = Object.fromEntries((await f.db.query("select id,name,category,quantity,equipped_slot from public.rpg_items where campaign_id=$1", [c.cid])).rows.map((row) => [row.id, row]));
    assert.equal(items[tusk].equipped_slot, "amulet");
    assert.equal(items[tusk].category, "jewelry", "the worn tusk takes the amulet slot's kind");
    assert.equal(items[trousers].equipped_slot, null, "«Ноги» is gone: the trousers come off and stay");
    assert.equal(items[staff].category, "weapon");
    assert.equal(items[staff].equipped_slot, "hand");
    assert.equal(items[compass].category, "gear");
    const potions = Object.values(items).filter((row) => row.name === "Зелье лечения");
    assert.deepEqual(potions.map((row) => [row.category, row.quantity]), [["consumable", 3]]);
    const hero = await f.one("select equipment_slots, resources from public.rpg_entities where id=$1", [c.hero]);
    assert.deepEqual(hero.equipment_slots, universalSlots("ru"));
    assert.equal(hero.resources.healing_potions, undefined);
    assert.equal(hero.resources.healing_potions_max, undefined);
    assert.equal(hero.resources.spell_slots_1, 2, "spell slots untouched");
    assert.equal(hero.resources["currency_зм"], 15, "«золотые» joined «зм»");
    assert.equal(hero.resources["currency_золотые"], undefined);
    assert.equal(hero.resources["currency_см"], 4);
    assert.deepEqual((await f.one("select public_profile from public.rpg_entities where id=$1", [mount])).public_profile.holding.passengers, []);

    // Idempotent: a second run changes nothing.
    const before = (await f.db.query("select id,revision from public.rpg_entities where campaign_id=$1 union all select id,revision from public.rpg_items where campaign_id=$1 order by 1", [c.cid])).rows;
    await f.db.exec(convert);
    const after = (await f.db.query("select id,revision from public.rpg_entities where campaign_id=$1 union all select id,revision from public.rpg_items where campaign_id=$1 order by 1", [c.cid])).rows;
    assert.deepEqual(after, before);
  } finally { await c.f.db.close(); }
});

test("D migration 76: a place storage belongs to nobody; the sheet of schema 2 holds the level and spells; schema 1 stays valid", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    await f.db.query("insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,detail,revision) values(gen_random_uuid(),$1,'Здесь лежит: логово','place',null,$2::jsonb,1)",
      [c.cid, JSON.stringify({ locationId: "x", wallet: { "зм": 80 } })]);
    await assert.rejects(f.db.query("insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,detail,revision) values(gen_random_uuid(),$1,'x','place',$2,'{}',1)", [c.cid, c.hero]));
    await assert.rejects(f.db.query("insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,detail,revision) values(gen_random_uuid(),$1,'x','player',null,'{}',1)", [c.cid]));
    const valid = async (sheet) => (await f.one("select rpg_private.sheet_valid($1::jsonb) v", [JSON.stringify(sheet)])).v;
    const v2 = { schemaVersion: 2, mode: "structured_rpg", role: "Волшебник", level: 7, attributes: { strength: 8, dexterity: 14, constitution: 14, intelligence: 18, wisdom: 12, charisma: 10 },
      skills: ["Магия +7", "История +7"], saves: ["Интеллект +7"], attacks: ["Посох +2, 1к6 дробящий"], speed: "30 футов", armorClass: 12, preparedMax: 11,
      spells: [{ name: "Огненный шар", level: 3, prepared: true, text: "Сфера огня радиусом 20 футов" }, { name: "Свет", level: 0 }] };
    assert.equal(await valid(v2), true);
    assert.equal(await valid({ ...v2, spells: [...v2.spells, { name: "огненный шар", level: 3 }] }), false, "one spell once");
    assert.equal(await valid({ ...v2, spells: [{ name: "X", level: 10 }] }), false);
    assert.equal(await valid({ ...v2, extra: 1 }), false);
    const v1 = (await f.one("select character_sheet s from public.rpg_entities where id=$1", [c.hero])).s;
    if (v1) assert.equal(await valid(v1), true);
  } finally { await c.f.db.close(); }
});
