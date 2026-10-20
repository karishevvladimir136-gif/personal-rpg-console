// Fix run after session 2, stage D — records and inventory (docs/runs/fix-s2-inventory-design.md).
import test from "node:test";
import assert from "node:assert/strict";
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

test("D conversion (migration 77, run by the owner's session): an older hero converts once — the doll keeps what he wears (legs come off), possessions get kinds, potions become items, coins join under their codes, a mount drops its riders", async () => {
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

    // Migration 77 defines the conversion; the owner's local session runs it once (docs/SANDBOX_LOAD_FIX_S2.md).
    const convert = async () => (await f.one("select rpg_private.fix_s2_inventory_convert() r")).r;
    const done = await convert();
    assert.deepEqual(done, { itemKinds: 0, dolls: 1, takenOff: 1, potionItems: 3, mounts: 1, wallets: 1 }, "the possessions got their kinds on insert (migration 76's trigger)");
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
    assert.deepEqual(await convert(), { itemKinds: 0, dolls: 0, takenOff: 0, potionItems: 0, mounts: 0, wallets: 0 });
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

// --- the DM's tools (the scripted acceptance scenario, the DM's side) ------------------------------------------------
const time = (minutes = 1) => ({ name: "advance_time", arguments: { minutes, reason: "время" } });
const finish = (kinds = ["exploration"]) => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false, nextTension: "calm" } });

test("D scenario (the DM's side): gear from a stat block, bolts that merge and are spent per shot, the chest's coins lie here and are paid once, rings and a two-handed staff, potions are things, the hero's sheet with a reason, a mount with saddlebags", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const receipts = async (played) => (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    const items = async () => (await c.f.query("select id,name,category,quantity,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail from public.rpg_items where campaign_id=$1 order by name", [c.cid]));
    const entity = async (id) => c.f.one("select id,name,resources,equipment_slots,character_sheet,public_profile from public.rpg_entities where id=$1", [id]);
    const find = async (name) => (await items()).find((row) => row.name === name);

    // 1. A companion and a bandit from stat blocks.
    const hired = await c.turn("Нанимаю Брама.", [{ text: "Брам берёт оружие. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, hp: 58, maxHp: 58,
        statblock: "Ветеран (5e): мультиатака, длинный меч +5 (1d8+3)",
        gear: [{ name: "Длинный меч", kind: "weapon", equipped: true }, { name: "Кольчуга", kind: "armor", equipped: true }, { name: "Тяжёлый арбалет", kind: "weapon", properties: "1к10" }],
        sheet: { level: 3, armorClass: 17, skills: ["Атлетика +5", "Восприятие +2"], attacks: ["Длинный меч +5, 1к8+3 рубящий"] } } },
      { name: "upsert_character", arguments: { localKey: "bandit", name: "Бандит у костра", kind: "npc", present: true, hp: 11, maxHp: 11, statblock: "Бандит: атака скимитаром +3 (1d6+1)" } },
      time(), finish(["combat"])] }]);
    assert.equal(hired.result.status, "committed", JSON.stringify(c.errors));
    const bramId = (await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Брам'", [c.cid])).id;
    assert.equal((await find("Длинный меч")).equipped_slot, "hand");
    assert.equal((await find("Кольчуга")).equipped_slot, "body");
    assert.equal((await find("Тяжёлый арбалет")).equipped_slot, null);
    const bram = await entity(bramId);
    assert.equal(bram.character_sheet.schemaVersion, 2);
    assert.equal(bram.character_sheet.armorClass, 17);
    assert.deepEqual(bram.equipment_slots.map((slot) => slot.id), universalSlots("ru").map((slot) => slot.id));
    const banditReceipt = (await receipts(hired)).find((r) => r.call.arguments.name === "Бандит у костра");
    assert.match(banditReceipt.result.value.gearHint, /carries no weapon/);

    // 2. Bolts: two stacks of one thing merge; a shot spends one; none left → no shot.
    c.forceDice([15]);
    const shot = await c.turn("Стреляю в бандита.", [{ text: "Щелчок тетивы. ", toolCalls: [
      { name: "item", arguments: { action: "create", localKey: "bolts", name: "Лёгкие болты", category: "ammunition", quantity: 9, ownerRef: c.hero } },
      { name: "item", arguments: { action: "create", localKey: "bolts2", name: "Болты для лёгкого арбалета", category: "ammunition", quantity: 7, ownerRef: c.hero } },
      { name: "roll", arguments: { formula: "1d20+5", reason: "Выстрел из лёгкого арбалета", actorRef: c.hero, visibility: "player", kind: "attack", dc: 12, ammunitionRef: "bolts" } }] },
      { text: "Болт входит бандиту в плечо.", toolCalls: [time(), finish(["combat"])] }]);
    assert.equal(shot.result.status, "committed", JSON.stringify({ errors: c.errors, failure: (await c.row(shot.input.operationId)).failure, result: shot.result }).slice(0, 2000));
    const bolts = (await items()).filter((row) => row.category === "ammunition" && row.owner_entity_id === c.hero && row.quantity > 0);
    assert.deepEqual(bolts.map((row) => [row.name, row.quantity]), [["Лёгкие болты", 15]], "one stack of 16, one bolt spent");
    const rollReceipt = (await receipts(shot)).find((r) => r.call.name === "roll");
    assert.deepEqual(rollReceipt.result.value.ammunition, { name: "Лёгкие болты", before: 16, after: 15 });
    assert.match(rollReceipt.result.player, /Лёгкие болты: 16 → 15/);

    // 3. The search: the chest's coins and the shirt lie here; a second grant from the chest is refused; taking is a transfer.
    const search = await c.turn("Обыскиваем сундук.", [{ text: "В сундуке монеты и рубаха. ", toolCalls: [
      { name: "money", arguments: { action: "grant", currency: "золотые", amount: 80, toRef: "here", reason: "сундук главаря", sourceRef: "сундук главаря" } },
      { name: "item", arguments: { action: "create", name: "Мифриловая рубаха", category: "armor", ownerRef: "here", rarity: "magic" } },
      { name: "money", arguments: { action: "grant", currency: "зм", amount: 80, toRef: "here", reason: "сундук главаря", sourceRef: "сундук главаря" } },
      { name: "money", arguments: { action: "transfer", currency: "зм", amount: 80, fromRef: "here", toRef: c.hero } },
      time(5), finish()] }]);
    assert.equal(search.result.status, "committed", JSON.stringify(c.errors));
    const moneyReceipts = (await receipts(search)).filter((r) => r.call.name === "money");
    assert.deepEqual(moneyReceipts.map((r) => r.result.ok), [true, false, true]);
    assert.match(moneyReceipts[1].result.reason, /Уже выплачено: 80 зм/);
    const pile = await c.f.one("select id,kind,entity_id,detail from public.rpg_storages where campaign_id=$1 and kind='place'", [c.cid]);
    const here = (await c.f.one("select current_location_id from public.rpg_public_state where campaign_id=$1", [c.cid])).current_location_id;
    assert.equal(pile.detail.locationId, here);
    assert.deepEqual(pile.detail.wallet, { "зм": 0 });
    assert.equal((await find("Мифриловая рубаха")).storage_id, pile.id);
    assert.equal((await entity(c.hero)).resources["currency_зм"], 80, "«золотые» are the 5e gold coins, «зм»");

    // 4. Hand out and equip: the shirt to the hero; rings left and right; a two-handed staff takes the shield off; a ring's bonus on a save.
    c.forceDice([10]);
    const equip = await c.turn("Надеваю всё.", [{ text: "Рэй одевается. ", toolCalls: [
      { name: "item", arguments: { action: "transfer", itemRef: "Мифриловая рубаха", ownerRef: c.hero } },
      { name: "item", arguments: { action: "create", localKey: "ring1", name: "Кольцо защиты", category: "jewelry", ownerRef: c.hero, bonuses: [{ to: "спасброски", value: 1 }] } },
      { name: "item", arguments: { action: "create", localKey: "ring2", name: "Кольцо тепла", category: "jewelry", ownerRef: c.hero } },
      { name: "item", arguments: { action: "create", localKey: "staff", name: "Посох", category: "weapon", ownerRef: c.hero, hands: 2 } },
      { name: "item", arguments: { action: "create", localKey: "shield", name: "Щит", category: "shield", ownerRef: c.hero } },
      { name: "item", arguments: { action: "equip", itemRef: "ring1" } },
      { name: "item", arguments: { action: "equip", itemRef: "ring2" } },
      { name: "item", arguments: { action: "equip", itemRef: "shield" } },
      { name: "item", arguments: { action: "equip", itemRef: "staff" } },
      { name: "item", arguments: { action: "equip", itemRef: "shield" } },
      { name: "roll", arguments: { formula: "1d20", reason: "Спасбросок Ловкости от огня", actorRef: c.hero, visibility: "player", kind: "save", dc: 13 } }] },
      { text: "Рэй уходит от огня, не обжёгшись.", toolCalls: [time(), finish()] }]);
    assert.equal(equip.result.status, "committed", JSON.stringify(c.errors));
    const worn = Object.fromEntries((await items()).filter((row) => row.equipped_entity_id === c.hero).map((row) => [row.name, row.equipped_slot]));
    assert.deepEqual(worn, { "Кольцо защиты": "ring_left", "Кольцо тепла": "ring_right", "Посох": "hand" });
    const equips = (await receipts(equip)).filter((r) => r.call.name === "item" && r.call.arguments.action === "equip");
    assert.equal(equips.at(-1).result.ok, false);
    assert.match(equips.at(-1).result.reason, /Вторая рука занята: Посох/);
    const save = (await receipts(equip)).find((r) => r.call.name === "roll");
    assert.match(save.result.value.modifierSource, /Кольцо защиты \+1/);
    assert.equal(save.result.value.total, 11, "the ring's +1 reaches the save");

    // 5. Potions are things; the counter is refused. Money: a purchase; too much is refused.
    const potion = await c.turn("Пью зелье и покупаю верёвку.", [{ text: "Глоток. ", toolCalls: [
      { name: "resource", arguments: { actorRef: c.hero, resource: "healing_potions", set: 2, reason: "зелья" } },
      { name: "item", arguments: { action: "create", localKey: "potion", name: "Зелье лечения", category: "consumable", quantity: 2, ownerRef: c.hero } },
      { name: "item", arguments: { action: "consume", itemRef: "potion" } },
      { name: "money", arguments: { action: "spend", currency: "зм", amount: 5, fromRef: c.hero, reason: "верёвка" } },
      { name: "money", arguments: { action: "spend", currency: "зм", amount: 1000, fromRef: c.hero, reason: "корабль" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "tusk_charges", set: 3, max: 3, reason: "клык" } },
      time(), finish()] }]);
    const potionReceipts = await receipts(potion);
    assert.equal(potionReceipts[0].result.ok, false);
    assert.match(potionReceipts[0].result.reason, /potions and ammunition are items/);
    assert.equal((await find("Зелье лечения")).quantity, 1);
    assert.equal((await entity(c.hero)).resources["currency_зм"], 75);
    assert.equal(potionReceipts.filter((r) => r.call.name === "money")[1].result.ok, false);
    assert.equal(potionReceipts.at(-3).result.ok, false, "a party counter without its name is refused");
    assert.match(potionReceipts.at(-3).result.reason, /needs its name in the campaign language/);

    // 6. The hero's sheet: only with a reason, only the sheet.
    const level = await c.turn("Я вырос.", [{ text: "Рэй чувствует силу. ", toolCalls: [
      { name: "upsert_character", arguments: { ref: c.hero, sheet: { level: 2, spells: [{ name: "Огненный шар", level: 3, prepared: true }] }, reason: "повышение уровня" } },
      { name: "upsert_character", arguments: { ref: c.hero, name: "Новое имя" } },
      { name: "upsert_character", arguments: { ref: c.hero, sheet: { level: 3 } } },
      time(), finish()] }]);
    const sheetReceipts = (await receipts(level)).filter((r) => r.call.name === "upsert_character");
    assert.deepEqual(sheetReceipts.map((r) => r.result.ok), [true, false, false]);
    assert.match(sheetReceipts[0].result.player, /^Лист героя: уровень .* → 2; заклинания: Огненный шар \(повышение уровня\)$/);
    const hero = await entity(c.hero);
    assert.equal(hero.character_sheet.schemaVersion, 2);
    assert.equal(hero.character_sheet.level, 2);

    // 7. A mount carries saddlebags, not riders; the crossbow goes into its bags; «here» is listed on request.
    const mount = await c.turn("Покупаем лошадь.", [{ text: "Гнедая фыркает. ", toolCalls: [
      { name: "holding", arguments: { action: "create", localKey: "horse", kind: "mount", name: "Гнедая", passengerRefs: [c.hero] } },
      { name: "holding", arguments: { action: "create", localKey: "horse", kind: "mount", name: "Гнедая" } },
      { name: "item", arguments: { action: "transfer", itemRef: "Тяжёлый арбалет", ownerRef: "horse" } },
      { name: "query_state", arguments: { topic: "inventory", ref: "here" } },
      time(), finish()] }]);
    const mountReceipts = await receipts(mount);
    assert.deepEqual(mountReceipts.slice(0, 4).map((r) => r.result.ok), [false, true, true, true]);
    assert.match(mountReceipts[0].result.reason, /saddlebags, not riders/);
    assert.equal(mountReceipts[3].result.value.place, pile.id ? (await c.f.one("select name from public.rpg_storages where id=$1", [pile.id])).name : null);
    const horse = (await c.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Гнедая'", [c.cid])).id;
    assert.equal((await find("Тяжёлый арбалет")).owner_entity_id, horse);
  } finally { await c.f.db.close(); }
});

test("D migration 78: the owner's saves carry an item's detail (an owner move's history), a place pile, and a character's sheet; the checks still hold", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    assert.equal(typeof f.mutation, "function");
    const storage = await f.one("select id from public.rpg_storages where entity_id=$1 order by id limit 1", [c.hero]);
    const created = await f.mutation("item.save", c.cid, { name: "Красный плащ", category: "clothing", quantity: 1, description: "", mechanics: "", owner_entity_id: c.hero,
      storage_id: storage.id, equipped_entity_id: null, equipped_slot: null, detail: { history: [{ at: 0, event: "owner_moved", note: "лагерь → Рэй" }] } });
    const row = await f.one("select detail from public.rpg_items where id=$1", [created.id]);
    assert.equal(row.detail.history[0].event, "owner_moved");
    // A wrong rarity, an array for detail, a place pile with an owner — refused.
    await assert.rejects(f.mutation("item.save", c.cid, { id: created.id, name: "Красный плащ", category: "clothing", quantity: 1, description: "", mechanics: "", owner_entity_id: c.hero,
      storage_id: storage.id, equipped_entity_id: null, equipped_slot: null, detail: [] }, created.revision));
    const pile = await f.mutation("storage.save", c.cid, { name: "Здесь лежит: склад", kind: "place", entity_id: null, detail: { locationId: "x", wallet: { "зм": 3 } } });
    assert.ok(pile.id);
    await assert.rejects(f.mutation("storage.save", c.cid, { name: "x", kind: "place", entity_id: c.hero, detail: {} }));
    // The owner edits the hero's sheet (schema 2); an invalid sheet is refused by the table's check.
    const hero = await f.one("select * from public.rpg_entities where id=$1", [c.hero]);
    const fields = { kind: hero.kind, name: hero.name, details: hero.details, hp: hero.hp, max_hp: hero.max_hp, stats: hero.stats, resources: hero.resources, conditions: hero.conditions, equipment_slots: hero.equipment_slots };
    const sheet = { schemaVersion: 2, mode: "structured_rpg", role: "Волшебник", level: 7, skills: ["Магия +7"], spells: [{ name: "Огненный шар", level: 3, prepared: true }] };
    const saved = await f.mutation("entity.save", c.cid, { id: c.hero, ...fields, character_sheet: sheet }, hero.revision);
    assert.equal((await f.one("select character_sheet from public.rpg_entities where id=$1", [c.hero])).character_sheet.level, 7);
    await assert.rejects(f.mutation("entity.save", c.cid, { id: c.hero, ...fields, character_sheet: { ...sheet, level: 99 } }, saved.revision));
  } finally { await c.f.db.close(); }
});

test("D: a «resource_»-prefixed counter of a known pool has its name (the noir sample's Stress); the Holdings screen gets the game time", async () => {
  const { counterLabel: label, counterLabelled: labelled } = await import("../src/lib/inventory/model.ts");
  assert.equal(label({ public_profile: {} }, "resource_stress", "ru"), "Стресс");
  assert.equal(labelled({ public_profile: {} }, "resource_stress"), true);
  assert.equal(labelled({ public_profile: {} }, "resource_mystery"), false);
  const { readFileSync } = await import("node:fs");
  assert.match(readFileSync(new URL("../src/components/registry/routes.tsx", import.meta.url), "utf8"), /<RegistryHoldings data=\{data\} play=\{runtime\.play\} \/>/);
});

test("D acceptance, the owner's side: hand out one potion of three, split the coins, equip the staff — each through the real saves; the DM sees the moves next turn", async () => {
  const { planEquip, planMoney, planMove } = await import("../src/lib/inventory/owner-moves.ts");
  const { randomUUID } = await import("node:crypto");
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    const finish = { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, nextTension: "calm" } };
    const hired = await c.turn("Нанимаю Брама.", [{ text: "Брам кивает. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, hp: 20, maxHp: 20 } },
      { name: "advance_time", arguments: { minutes: 1, reason: "время" } }, finish] }]);
    assert.equal(hired.result.status, "committed", JSON.stringify(c.errors));
    const bram = (await f.one("select id from public.rpg_entities where campaign_id=$1 and name='Брам'", [c.cid])).id;
    const bag = (await f.one("select id from public.rpg_storages where entity_id=$1 order by id limit 1", [c.hero])).id;
    const item = (name, category, quantity) => f.mutation("item.save", c.cid, { name, category, quantity, description: "", mechanics: "", owner_entity_id: c.hero,
      storage_id: bag, equipped_entity_id: null, equipped_slot: null, detail: {} });
    const potions = await item("Зелье лечения", "consumable", 3);
    const staff = await item("Посох", "weapon", 1);
    await f.db.query("update public.rpg_entities set resources=resources||'{\"currency_зм\":10,\"currency_см\":3}'::jsonb where id=$1", [c.hero]);
    const ctx = { language: "ru", at: 600, newId: () => randomUUID() };
    const send = async (plan) => {
      assert.equal(plan.ok, true, plan.reason);
      const revisions = new Map();
      for (const step of plan.steps) {
        const saved = await f.mutation(step.operation, c.cid, step.payload, revisions.get(step.payload.id) ?? step.before?.revision ?? 0);
        revisions.set(step.payload.id, saved.revision);
      }
    };
    const snapshot = () => f.saves(c.cid, "campaign");
    // 1. One potion of three to Брам.
    await send(planMove(await snapshot(), potions.id, { entityId: bram }, 1, ctx));
    const rows = (await f.db.query("select name,quantity,owner_entity_id,detail from public.rpg_items where campaign_id=$1 and name='Зелье лечения' order by quantity", [c.cid])).rows;
    assert.deepEqual(rows.map((row) => [row.quantity, row.owner_entity_id]), [[1, bram], [2, c.hero]], "the stack split");
    assert.ok(rows.every((row) => (row.detail.history ?? []).at(-1)?.event?.startsWith("owner_")), "both rows say the owner moved them");
    // 2. Coins: four gold to Брам.
    await send(planMoney(await snapshot(), c.hero, bram, { "зм": 4 }, ctx));
    const wallet = async (id) => (await f.one("select resources from public.rpg_entities where id=$1", [id])).resources;
    assert.equal((await wallet(c.hero))["currency_зм"], 6);
    assert.equal((await wallet(bram))["currency_зм"], 4);
    assert.equal((await wallet(c.hero))["currency_см"], 3, "the silver stays");
    // 3. The staff in the hero's hand.
    await send(planEquip(await snapshot(), staff.id, c.hero, {}, ctx));
    const worn = await f.one("select equipped_entity_id,equipped_slot from public.rpg_items where id=$1", [staff.id]);
    assert.deepEqual([worn.equipped_entity_id, worn.equipped_slot], [c.hero, "hand"]);
    // The DM's next turn sees what the owner moved.
    const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
    const source = (await f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const context = buildDmLoopContext(source, { operationId: randomUUID(), campaignId: c.cid, timeline: source.timeline, expectedRevision: source.runtime.revision, mode: "game",
      input: "Дальше.", companionId: null, listenerIds: [], mechanic: null });
    const text = context.system.map((block) => block.text).join("\n");
    assert.match(text, /ownerMovesSinceYouLastTouchedThem/);
    assert.match(text, /Зелье лечения/);
  } finally { await c.f.db.close(); }
});

test("D (migration 83): the starting things go on the doll at creation — weapon in hand, armour on the body, hat, rings left then right; a stack, a second thing for a slot and the off hand beside a staff stay in the pack", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    await f.db.query("update public.rpg_items set equipped_entity_id=null,equipped_slot=null where equipped_entity_id=$1", [c.hero]);
    // A new hero has the eleven slots before its things are written (migration 76's bootstrap).
    await f.db.query("update public.rpg_entities set equipment_slots=rpg_private.universal_slots('ru') where id=$1", [c.hero]);
    const bag = (await f.one("select id from public.rpg_storages where entity_id=$1 order by id limit 1", [c.hero])).id;
    const names = ["Посох", "Кинжал", "Кольчужная рубаха", "Шляпа", "Кольцо защиты", "Перстень с печаткой", "Серебряное кольцо", "Сапоги", "Плащ с капюшоном", "Стрелы"];
    for (const name of names) await f.db.query(`insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail,revision)
      values(gen_random_uuid(),$1,$2,'possession',$3,'','',$4,$5,null,null,'{}',1)`, [c.cid, name, name === "Стрелы" ? 20 : 1, c.hero, bag]);
    const rows = Object.fromEntries((await f.db.query("select name,category,equipped_slot from public.rpg_items where campaign_id=$1 and owner_entity_id=$2", [c.cid, c.hero])).rows.map((row) => [row.name, row]));
    assert.equal(rows["Посох"].equipped_slot, "hand");
    assert.equal(rows["Кинжал"].equipped_slot, null, "no off-hand weapon beside a staff");
    assert.equal(rows["Кольчужная рубаха"].equipped_slot, "body");
    assert.equal(rows["Шляпа"].equipped_slot, "head");
    assert.equal(rows["Кольцо защиты"].equipped_slot, "ring_left");
    assert.equal(rows["Перстень с печаткой"].equipped_slot, "ring_right");
    assert.equal(rows["Серебряное кольцо"].equipped_slot, null, "two hands, two rings");
    assert.equal(rows["Сапоги"].equipped_slot, "boots");
    assert.equal(rows["Плащ с капюшоном"].equipped_slot, "cloak", "a cloak by its own word, not the hood's");
    assert.equal(rows["Стрелы"].equipped_slot, null, "a stack stays in the pack");
    // A thing the DM or the owner adds later with a real kind is never put on by itself.
    await f.db.query(`insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail,revision)
      values(gen_random_uuid(),$1,'Перчатки','clothing',1,'','',$2,$3,null,null,'{}',1)`, [c.cid, c.hero, bag]);
    assert.equal((await f.one("select equipped_slot from public.rpg_items where campaign_id=$1 and name='Перчатки'", [c.cid])).equipped_slot, null);
  } finally { await c.f.db.close(); }
});

test("F (item 32 b): a counter named in the campaign language works — «Ячейки 1 круга» is spell_slots_1, any other name gets a Latin key and keeps its name", async () => {
  const { counterKeyOf } = await import("../src/lib/inventory/model.ts");
  assert.deepEqual(counterKeyOf("Ячейки 1 круга"), { key: "spell_slots_1", label: "Ячейки 1 круга" });
  assert.deepEqual(counterKeyOf("Кости хитов"), { key: "hit_dice", label: "Кости хитов" });
  assert.deepEqual(counterKeyOf("Очки удачи"), { key: "ochki_udachi", label: "Очки удачи" });
  assert.deepEqual(counterKeyOf("stress"), { key: "stress", label: null });
  assert.equal(counterKeyOf("!!!"), null);
  const c = await loopCampaign({ language: "ru" });
  try {
    const finish = { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false, nextTension: "calm" } };
    const done = await c.turn("Отдыхаю.", [{ text: "Ты переводишь дух. ", toolCalls: [
      { name: "resource", arguments: { actorRef: c.hero, resource: "Ячейки 1 круга", set: 4, max: 4, reason: "лист героя" } },
      { name: "resource", arguments: { actorRef: c.hero, resource: "Очки удачи", set: 3, reason: "лист героя" } }, finish] }]);
    assert.equal(done.result.status, "committed", JSON.stringify(c.errors));
    const hero = await c.f.one("select resources, public_profile from public.rpg_entities where id=$1", [c.hero]);
    assert.equal(hero.resources.spell_slots_1, 4);
    assert.equal(hero.resources.ochki_udachi, 3);
    assert.equal(hero.public_profile.counterLabels.ochki_udachi, "Очки удачи");
  } finally { await c.f.db.close(); }
});
