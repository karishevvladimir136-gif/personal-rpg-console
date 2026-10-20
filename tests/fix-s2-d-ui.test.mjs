// Fix run after session 2, stage D — the screens' owner moves (docs/runs/fix-s2-inventory-design.md §3, §5, §8):
// the pure planners of src/lib/inventory/owner-moves.ts (whole, part, merge, a lent thing, equip, two hands, the
// kind picker, older dolls, money between people), their undo, and the screens that send them.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  applyPlan, castSlot, coinCode, concentrationOf, entityPayload, hasSpellSlots, holderLabel, itemPayload, loanMark, planEquip, planKind, planMoney, planSheet,
  planMove, planUnequip, sheetCounters, slotsFor, undoPayload, withHistory,
} from "../src/lib/inventory/owner-moves.ts";
import { spellBook, universalSlots, walletLine, walletOfEntity } from "../src/lib/inventory/model.ts";
import { equipmentOf, sheetOf, walletOf } from "../src/lib/ui/campaign-view.ts";
import { shovSample } from "../src/lib/ui/preview/stage5-fixture.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const person = (id, name, kind = "companion", extra = {}) => ({ id, campaign_id: "c", revision: 1, updated_at: "", kind, name, details: "", hp: 10, max_hp: 10,
  stats: {}, resources: {}, conditions: [], equipment_slots: universalSlots("ru"), character_sheet: null, public_profile: {}, ...extra });
const bag = (id, entity, kind = "companion", extra = {}) => ({ id, campaign_id: "c", revision: 1, updated_at: "", name: `Вещи ${entity}`, kind, entity_id: entity, ...extra });
const thing = (id, name, category, extra = {}) => ({ id, campaign_id: "c", revision: 1, updated_at: "", name, category, quantity: 1, description: "", mechanics: "",
  owner_entity_id: "hero", storage_id: "bag-hero", equipped_entity_id: null, equipped_slot: null, detail: {}, ...extra });
function world(items = [], extra = {}) {
  return {
    campaign: { id: "c", language: "ru" },
    entities: [person("hero", "Рэй", "player"), person("bram", "Брам"), person("toby", "Тоби"), person("mule", "Мул", "mount", { equipment_slots: [], hp: null, max_hp: null }),
      ...(extra.entities ?? [])],
    storages: [bag("bag-hero", "hero", "player"), bag("bag-bram", "bram"), bag("bag-toby", "toby"), { ...bag("bag-mule", "mule", "transport"), name: "Седельные сумки (Мул)" },
      { id: "pile", campaign_id: "c", revision: 1, updated_at: "", name: "Сундук", kind: "place", entity_id: null, detail: { locationId: "cave", wallet: { "зм": 80 } } },
      ...(extra.storages ?? [])],
    items,
    locations: [{ id: "cave", campaign_id: "c", revision: 1, updated_at: "", name: "Пещера", description: "", status: "visited" }],
  };
}
let counter = 0;
const ctx = () => { counter = 0; return { language: "ru", at: 600, newId: () => `new-${++counter}` }; };
const ok = (plan) => { assert.ok(plan.ok, plan.reason); return plan; };
const row = (data, id) => data.items.find((item) => item.id === id);

test("D UI: a whole stack moves in one save; a worn thing comes off; the move is in the thing's history", () => {
  const data = world([thing("cloak", "Красный плащ", "clothing", { equipped_entity_id: "hero", equipped_slot: "cloak" })]);
  const plan = ok(planMove(data, "cloak", { entityId: "toby" }, null, ctx()));
  assert.deepEqual(plan.steps.map((step) => [step.operation, step.payload.id]), [["item.save", "cloak"]]);
  const after = applyPlan(data, plan.steps);
  assert.deepEqual(Object.values(pick(row(after, "cloak"), ["owner_entity_id", "storage_id", "equipped_entity_id", "equipped_slot"])), ["toby", "bag-toby", null, null]);
  assert.deepEqual(row(after, "cloak").detail.history, [{ at: 600, event: "owner_moved", note: "Рэй → Тоби" }]);
  assert.equal(plan.steps[0].before.revision, 1, "the save expects the row's revision");
  assert.deepEqual(Object.keys(plan.steps[0].payload).sort(), ["category", "description", "detail", "equipped_entity_id", "equipped_slot", "id", "mechanics", "name",
    "owner_entity_id", "quantity", "storage_id"], "an item.save carries ItemInput with its id");
  assert.equal(planMove(after, "cloak", { entityId: "toby" }, null, ctx()).ok, false, "already there");
});

test("D UI: part of a stack — the new stack at the destination first, then the source; the part keeps what the thing is", () => {
  const data = world([thing("bolts", "Болты", "ammunition", { quantity: 20, detail: { bonuses: [{ to: "атака", value: 1 }], history: [{ at: 1, event: "created", note: "" }] } })]);
  const plan = ok(planMove(data, "bolts", { entityId: "bram" }, 5, ctx()));
  assert.deepEqual(plan.steps.map((step) => [step.payload.id, step.before?.id ?? null, step.payload.quantity]), [["new-1", null, 5], ["bolts", "bolts", 15]]);
  const after = applyPlan(data, plan.steps);
  assert.equal(row(after, "new-1").owner_entity_id, "bram");
  assert.deepEqual(row(after, "new-1").detail.bonuses, [{ to: "атака", value: 1 }]);
  assert.deepEqual(row(after, "new-1").detail.history.map((entry) => entry.note), ["Рэй → Брам"], "not the stack's old history");
  assert.equal(row(after, "bolts").detail.history.at(-1).note, "Рэй → Брам: −5");
  assert.equal(planMove(data, "bolts", { entityId: "bram" }, 21, ctx()).ok, false);
  assert.equal(planMove(data, "bolts", { entityId: "bram" }, 0, ctx()).ok, false);
});

test("D UI: the same thing at the destination takes the quantity («лёгкие болты» into «болты для лёгкого арбалета»); the moved row goes to 0", () => {
  const data = world([thing("light", "Лёгкие болты", "ammunition", { quantity: 9 }), thing("bolts", "Болты для лёгкого арбалета", "ammunition", { quantity: 7, owner_entity_id: "bram", storage_id: "bag-bram" })]);
  const whole = applyPlan(data, ok(planMove(data, "light", { entityId: "bram" }, null, ctx())).steps);
  assert.equal(row(whole, "bolts").quantity, 16);
  assert.equal(row(whole, "light").quantity, 0);
  assert.equal(row(whole, "light").storage_id, "bag-hero", "the emptied row stays where it was");
  const part = ok(planMove(data, "light", { entityId: "bram" }, 4, ctx()));
  assert.deepEqual(part.steps.map((step) => [step.payload.id, step.payload.quantity]), [["bolts", 11], ["light", 5]], "the destination first, then the source");
});

test("D UI: a lent crossbow — marked on both lists, moves whole, back to its owner it keeps the title and the loan ends", () => {
  const crossbow = thing("xbow", "Лёгкий арбалет", "weapon", { storage_id: "bag-toby", detail: { status: "lent", holderId: "toby", history: [] } });
  const data = world([crossbow]);
  assert.deepEqual(loanMark(data, crossbow, "hero"), { kind: "out", status: "lent", name: "Тоби" });
  assert.deepEqual(loanMark(data, crossbow, "toby"), { kind: "in", status: "lent", name: "Рэй" });
  assert.equal(loanMark(data, crossbow, "bram"), null);
  assert.equal(planEquip(data, "xbow", "toby", {}, ctx()).ok, false, "a lent thing is not equipped (the DM's rule)");
  const back = applyPlan(data, ok(planMove(data, "xbow", { entityId: "hero" }, null, ctx())).steps);
  assert.equal(row(back, "xbow").owner_entity_id, "hero");
  assert.equal(row(back, "xbow").storage_id, "bag-hero");
  assert.equal(row(back, "xbow").detail.status, undefined);
  assert.equal(loanMark(back, row(back, "xbow"), "hero"), null);
  const gift = applyPlan(data, ok(planMove(data, "xbow", { entityId: "bram" }, null, ctx())).steps);
  assert.deepEqual([row(gift, "xbow").owner_entity_id, row(gift, "xbow").detail.status], ["bram", undefined], "to anyone else it becomes theirs");
});

test("D UI: the mount's saddlebags and «Забрать» from the place; a character without a bag gets one first", () => {
  const data = world([thing("tent", "Палатка", "gear", { owner_entity_id: null, storage_id: "pile" })], { entities: [person("kid", "Малой")] });
  const toMule = applyPlan(data, ok(planMove(data, "tent", { entityId: "mule" }, null, ctx())).steps);
  assert.deepEqual([row(toMule, "tent").owner_entity_id, row(toMule, "tent").storage_id], ["mule", "bag-mule"]);
  assert.equal(row(toMule, "tent").detail.history[0].note, "Пещера → Седельные сумки (Мул)");
  assert.equal(holderLabel(data, "pile", null, "ru"), "Пещера");
  const plan = ok(planMove(data, "tent", { entityId: "kid" }, null, ctx()));
  assert.deepEqual(plan.steps.map((step) => step.operation), ["storage.save", "item.save"]);
  assert.deepEqual(plan.steps[0].payload, { id: "new-1", name: "Вещи: Малой", kind: "companion", entity_id: "kid" });
  assert.equal(plan.steps[1].payload.storage_id, "new-1");
  assert.equal(undoPayload(plan.steps[0]), null, "a new bag is left (empty is harmless)");
});

test("D UI: «Надеть» — rings left then right, the occupant comes off first, a two-handed staff empties the off hand", () => {
  let data = world([thing("r1", "Кольцо защиты", "jewelry"), thing("r2", "Кольцо тепла", "jewelry"), thing("r3", "Перстень", "jewelry"),
    thing("shield", "Щит", "shield", { equipped_entity_id: "hero", equipped_slot: "offhand" }), thing("staff", "Посох", "weapon", { detail: { hands: 2 } })]);
  data = applyPlan(data, ok(planEquip(data, "r1", "hero", {}, ctx())).steps);
  data = applyPlan(data, ok(planEquip(data, "r2", "hero", {}, ctx())).steps);
  assert.deepEqual([row(data, "r1").equipped_slot, row(data, "r2").equipped_slot], ["ring_left", "ring_right"]);
  const swap = ok(planEquip(data, "r3", "hero", { slot: "ring_left" }, ctx()));
  assert.deepEqual(swap.steps.map((step) => [step.payload.id, step.payload.equipped_slot]), [["r1", null], ["r3", "ring_left"]], "the occupant first");
  assert.equal(swap.steps[0].payload.detail.history.at(-1).event, "owner_unequipped");
  assert.deepEqual(swap.steps[1].payload.detail.history.at(-1), { at: 600, event: "owner_equipped", note: "Рэй — Кольцо (левая)" });
  const staff = ok(planEquip(data, "staff", "hero", {}, ctx()));
  assert.deepEqual(staff.steps.map((step) => [step.payload.id, step.payload.equipped_slot]), [["shield", null], ["staff", "hand"]]);
  data = applyPlan(data, staff.steps);
  const blocked = planEquip(data, "shield", "hero", {}, ctx());
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /Вторая рука занята: Посох/);
  const slots = equipmentOf({ ...data, campaign: { language: "ru" } }, data.entities[0]);
  assert.equal(slots.find((slot) => slot.id === "offhand").blockedBy.name, "Посох", "the doll reads «занято: Посох»");
  const off = ok(planUnequip(data, "staff", ctx()));
  assert.deepEqual(off.steps.map((step) => [step.payload.id, step.payload.equipped_entity_id]), [["staff", null]]);
});

test("D UI: the kind picker — a thing no slot takes asks for its kind; the chosen kind is saved and the thing goes on in one save", () => {
  const data = world([thing("boots", "Сапоги скорохода", "misc"), thing("ring", "Кольцо", "jewelry"), thing("knife", "Нож", "weapon", { owner_entity_id: "bram", storage_id: "bag-bram" })]);
  const asked = planEquip(data, "boots", "hero", {}, ctx());
  assert.equal(asked.ok, false);
  assert.equal(asked.kinds.length, 11, "the eleven kinds");
  const plan = ok(planEquip(data, "boots", "hero", { kind: "clothing" }, ctx()));
  assert.equal(plan.steps.length, 1);
  assert.deepEqual(pick(plan.steps[0].payload, ["category", "equipped_slot"]), { category: "clothing", equipped_slot: "boots" });
  assert.deepEqual(plan.steps[0].payload.detail.history.map((entry) => entry.event), ["owner_kind", "owner_equipped"]);
  const wrongSlot = planEquip(data, "ring", "hero", { slot: "hand" }, ctx());
  assert.equal(wrongSlot.ok, false, "a ring dropped on the main hand");
  assert.deepEqual(wrongSlot.kinds, ["weapon", "tool"]);
  const kindOnly = ok(planKind(data, "boots", "gear", ctx()));
  assert.equal(kindOnly.steps[0].payload.category, "gear");
  // A thing from another's bag: it moves to the wearer's bag and goes on in the same save (the server equips from the wearer's bag).
  const knife = ok(planEquip(data, "knife", "hero", {}, ctx()));
  assert.deepEqual(pick(knife.steps[0].payload, ["owner_entity_id", "storage_id", "equipped_slot"]), { owner_entity_id: "hero", storage_id: "bag-hero", equipped_slot: "hand" });
});

test("D UI: an older doll gets the eleven first — what is worn moves to the slot of the same meaning", () => {
  const old = person("bram", "Брам", "companion", { equipment_slots: [{ id: "neck", label: "Шея", accepts: ["jewelry"] }, { id: "legs", label: "Ноги", accepts: ["armor"] }] });
  const data = world([thing("amulet", "Амулет", "jewelry", { owner_entity_id: "bram", storage_id: "bag-bram", equipped_entity_id: "bram", equipped_slot: "neck" }),
    thing("greaves", "Поножи", "armor", { owner_entity_id: "bram", storage_id: "bag-bram", equipped_entity_id: "bram", equipped_slot: "legs" }),
    thing("sword", "Меч", "weapon", { owner_entity_id: "bram", storage_id: "bag-bram" })]);
  data.entities = data.entities.map((row) => (row.id === "bram" ? old : row));
  assert.deepEqual(slotsFor(old, "ru").map((slot) => slot.id), universalSlots("ru").map((slot) => slot.id), "shown with the eleven");
  const plan = ok(planEquip(data, "sword", "bram", {}, ctx()));
  assert.deepEqual(plan.steps.map((step) => [step.operation, step.payload.id, step.operation === "entity.save" ? step.payload.equipment_slots.length : step.payload.equipped_slot]),
    [["item.save", "amulet", null], ["item.save", "greaves", null], ["entity.save", "bram", 11], ["item.save", "amulet", "amulet"], ["item.save", "sword", "hand"]],
    "a thing in an old slot comes off before the record changes and goes back on after (the database checks each save)");
  assert.equal(plan.steps[3].before.revision, 2, "the second save of a row expects the revision of the first");
  assert.deepEqual(Object.keys(plan.steps[2].payload).sort(), ["conditions", "details", "equipment_slots", "hp", "id", "kind", "max_hp", "name", "resources", "stats"],
    "an entity.save carries EntityInput with its id — never the profile, the sheet or the row's clock");
});

test("D UI: money between people — the giver first, never below 0; the same coin under another word is one balance", () => {
  const data = world([], {});
  data.entities = data.entities.map((row) => (row.id === "hero" ? { ...row, resources: { currency_зм: 10, currency_см: 11, currency_мм: 26, hit_dice: 3, hit_dice_max: 6 } }
    : row.id === "bram" ? { ...row, resources: { currency_золотые: 5 } } : row));
  const plan = ok(planMoney(data, "hero", "bram", { "зм": 4, "см": 5, "мм": 0 }, ctx()));
  assert.deepEqual(plan.steps.map((step) => [step.operation, step.payload.id]), [["entity.save", "hero"], ["entity.save", "bram"]]);
  const after = applyPlan(data, plan.steps);
  const hero = after.entities.find((row) => row.id === "hero"), bram = after.entities.find((row) => row.id === "bram");
  assert.equal(walletLine(walletOfEntity(hero), "ru"), "Кошелёк: 6 зм · 6 см · 26 мм");
  assert.deepEqual(bram.resources, { currency_золотые: 9, currency_см: 5 });
  assert.equal(hero.resources.hit_dice, 3, "counters untouched");
  assert.equal(planMoney(data, "hero", "bram", { "зм": 11 }, ctx()).ok, false, "never below 0");
  assert.equal(planMoney(data, "hero", "bram", { "зм": -1 }, ctx()).ok, false);
  assert.equal(planMoney(data, "hero", "hero", { "зм": 1 }, ctx()).ok, false);
  assert.equal(coinCode("золотые", "ru"), "зм");
  // Undo restores both records as they were.
  assert.deepEqual(undoPayload(plan.steps[0]).resources, data.entities[0].resources);
});

test("D UI: undo and history — a created part goes to 0, an existing row back to itself; history keeps the last 20", () => {
  const data = world([thing("bolts", "Болты", "ammunition", { quantity: 3 })]);
  const plan = ok(planMove(data, "bolts", { entityId: "toby" }, 1, ctx()));
  assert.equal(undoPayload(plan.steps[0]).quantity, 0);
  assert.deepEqual(undoPayload(plan.steps[1]), itemPayload(data.items[0]));
  let detail = {};
  for (let index = 0; index < 25; index++) detail = withHistory(detail, index, "owner_moved", `#${index}`);
  assert.equal(detail.history.length, 20);
  assert.equal(detail.history[0].note, "#5");
  assert.ok(!("public_profile" in entityPayload(data.entities[0])));
});

test("D UI: the sheet — counters without money or slots (an unlabelled one marked), concentration, the slot «Колдовать» spends", () => {
  const entity = person("hero", "Рэй", "player", { resources: { currency_зм: 10, spell_slots_1: 0, spell_slots_1_max: 4, spell_slots_2: 2, spell_slots_2_max: 3, sorcery_points: 4, sorcery_points_max: 6, aether_charge: 1 },
    conditions: ["Концентрация: Невидимость"], public_profile: {} });
  const counters = sheetCounters(entity, "ru");
  assert.deepEqual(counters.map((row) => [row.key, row.label, row.labelled, row.max]), [["sorcery_points", "Очки чародейства", true, 6], ["aether_charge", "Aether charge", false, null]]);
  assert.ok(hasSpellSlots(entity));
  assert.equal(concentrationOf(entity), "Невидимость");
  assert.equal(concentrationOf({ conditions: ["Отравлен"] }), null);
  const book = spellBook([{ name: "Щит", level: 1 }], entity.resources, "ru");
  assert.equal(castSlot({ level: 1 }, book), 2, "level 1 spent: the lowest free slot above it");
  assert.equal(castSlot({ level: 0 }, book), null);
  assert.equal(castSlot({ level: 3 }, book), null);
});

test("D UI: the owner's sheet edit — «Подготовить» and a level through patchSheet; a schema-1 sheet becomes schema 2; undo restores it", () => {
  const v1 = { schemaVersion: 1, mode: "structured_rpg", role: "Маг", background: "", level: 3, tier: null, attributes: null, skills: ["Магия +5"], abilities: [], limitations: [], spells: ["Свет"] };
  const data = world();
  data.entities = data.entities.map((row) => (row.id === "hero" ? { ...row, character_sheet: v1 } : row));
  const plan = ok(planSheet(data, "hero", { level: 4, spells: [{ name: "Щит", level: 1, prepared: true }] }, ctx()));
  assert.deepEqual(plan.steps.map((step) => step.operation), ["entity.save"]);
  const sheet = plan.steps[0].payload.character_sheet;
  assert.equal(sheet.schemaVersion, 2);
  assert.equal(sheet.level, 4);
  assert.deepEqual(sheet.skills, ["Магия +5"], "the lines are kept");
  assert.deepEqual(sheet.spells.map((spell) => [spell.name, spell.prepared]), [["Щит", true]]);
  assert.match(plan.note, /Рэй: уровень 3 → 4/);
  assert.deepEqual(undoPayload(plan.steps[0]).character_sheet, v1);
  const after = applyPlan(data, plan.steps);
  const back = ok(planSheet(after, "hero", { spells: [{ name: "Щит", level: 1, prepared: false }] }, ctx()));
  assert.equal(back.steps[0].payload.character_sheet.spells[0].prepared, false);
  assert.equal(planSheet(after, "hero", { level: 4 }, ctx()).ok, false, "nothing changed");
});

test("D UI: the preview sample shows what the stage asks for", () => {
  const data = shovSample.snapshot();
  const hero = data.entities.find((row) => row.kind === "player");
  assert.equal(walletLine(walletOfEntity(hero), "ru"), "Кошелёк: 10 зм · 11 см · 26 мм");
  assert.deepEqual(walletOf(data, hero).map((row) => row.label), ["зм", "см", "мм"], "the side panel's wallet rows: codes in the order of value");
  const doll = equipmentOf(data, hero);
  assert.equal(doll.length, 11);
  assert.ok(doll.find((slot) => slot.id === "ring_left").item && doll.find((slot) => slot.id === "ring_right").item, "a ring on each hand");
  assert.ok(doll.find((slot) => slot.id === "offhand").blockedBy, "a two-handed staff");
  const counters = sheetCounters(hero, "ru");
  assert.equal(counters.length, 3);
  assert.equal(counters.filter((row) => !row.labelled).length, 1);
  const sheet = sheetOf(hero);
  assert.deepEqual([...new Set(sheet.spells.map((spell) => spell.level))].sort(), [0, 1, 2, 3]);
  const companion = data.entities.find((row) => row.kind === "companion" && sheetOf(row).schema === 2);
  assert.ok(companion && sheetOf(companion).attacks.length && sheetOf(companion).armorClass, "a companion with a sheet from a stat block");
  const mule = data.entities.find((row) => row.kind === "mount");
  const saddlebags = data.storages.find((row) => row.entity_id === mule.id);
  assert.ok(data.items.some((item) => item.storage_id === saddlebags.id) && Object.keys(saddlebags.detail.wallet).length);
  const pile = data.storages.find((row) => row.kind === "place" && row.detail.locationId === data.publicState.current_location_id);
  assert.equal(data.items.filter((item) => item.storage_id === pile.id).length, 2);
  assert.ok(Object.keys(pile.detail.wallet).length);
  assert.ok(data.items.some((item) => item.detail?.status === "lent" && /арбалет/i.test(item.name)));
});

test("D UI: the screens send owner corrections — no «Передать…» into the action box; drag, Escape and the card's toggle", () => {
  const screen = src("src/components/registry/character-screen.tsx");
  assert.doesNotMatch(screen, /Передать…/);
  assert.match(screen, /planEquip\(/);
  assert.match(screen, /planMove\(/);
  assert.match(screen, /planMoney\(/);
  assert.match(screen, /correctionScope: "timeline"/);
  assert.match(screen, /onDrop=/);
  assert.match(screen, /"Escape"/);
  assert.match(screen, /appendToComposerDraft/, "«Колдовать» and «Использовать» still write the action box");
  assert.match(screen, /castLine\(/);
  const party = src("src/components/registry/party-screen.tsx");
  assert.doesNotMatch(party, /Экипаж и люди дома/);
  assert.match(party, /WalletLine/);
  const holdings = src("src/components/registry/holdings-screen.tsx");
  assert.doesNotMatch(holdings, /Передаю/);
});

function pick(object, keys) {
  return Object.fromEntries(keys.map((key) => [key, object[key]]));
}
