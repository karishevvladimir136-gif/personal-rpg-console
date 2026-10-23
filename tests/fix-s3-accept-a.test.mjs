// Fixes from the owner's acceptance pass before session 3 (docs/stages/FIX_S3_ACCEPT.md), blocks А and Е: the inventory as
// cells one holder at a time with the type filter, the item card's history folded and its buttons only where they apply,
// the ring of minor protection put on (a data fix by shape on PGlite), the companions' full-length figures, and the
// portraits on the «Судьбы» cards. Pure rules, the migration on a disposable PGlite campaign, the screens by their source.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { canUse, canWear, cellState, inGroup, kindFilter, kindGroup, shownHistory } from "../src/lib/inventory/grid.ts";
import { universalSlots } from "../src/lib/inventory/model.ts";
import { anchorSet, fateEntityId, fatePortraitPlan, parsePictureBoard, planAutopilot } from "../src/lib/visual-frame/pictures.ts";
import { compileAnchorPrompt } from "../src/lib/visual-frame/prompt-compiler.ts";
import { shovSample } from "../src/lib/ui/preview/stage5-fixture.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const RING = "202610230521_fix_s3_accept_ring.sql";
const thing = (category, description = "", mechanics = "", detail = {}, extra = {}) => ({ id: `i-${category}-${description.length}`, campaign_id: "c", revision: 1,
  updated_at: "", name: "Вещь", category, quantity: 1, description, mechanics, owner_entity_id: "hero", storage_id: "bag", equipped_entity_id: null,
  equipped_slot: null, detail, ...extra });

// --- А1 -------------------------------------------------------------------------------------------------------------
test("А1: the type filter — всё / оружие / доспех / украшения / расходуемое / снаряжение / инструмент / разное, in that order, with counts", () => {
  const items = [thing("weapon"), thing("armor"), thing("clothing"), thing("shield"), thing("jewelry"), thing("consumable"), thing("ammunition"), thing("gear"),
    thing("tool"), thing("misc"), thing("quest item"), thing("Weapons")];
  const chips = kindFilter(items, "ru");
  assert.deepEqual(chips.map((chip) => chip.label), ["Всё", "Оружие", "Доспех", "Украшения", "Расходуемое", "Снаряжение", "Инструмент", "Разное"]);
  assert.deepEqual(chips.map((chip) => chip.count), [12, 2, 3, 1, 2, 1, 1, 2]);
  assert.equal(kindGroup("clothing"), "armor", "a robe sits with the armour");
  assert.equal(kindGroup("ammunition"), "consumable", "bolts are used up one per shot");
  assert.equal(kindGroup("accessory"), "jewelry");
  assert.equal(kindGroup("possession"), "misc", "an unknown word is «разное»");
  assert.equal(kindGroup("Potions"), "consumable", "an older record's own word");
  assert.ok(inGroup(thing("weapon"), "all") && inGroup(thing("weapon"), "weapon") && !inGroup(thing("weapon"), "armor"));
  assert.deepEqual(kindFilter([], "en").map((chip) => chip.label), ["All", "Weapons", "Armour", "Jewellery", "Consumables", "Gear", "Tools", "Misc"]);
});

test("А1: worn items are marked on the cell (the slot's name), a lent thing by whom it is with", () => {
  const data = shovSample.snapshot();
  const hero = data.entities.find((row) => row.kind === "player");
  const ring = data.items.find((row) => row.equipped_entity_id === hero.id && row.equipped_slot === "ring_right");
  assert.deepEqual(cellState(data, ring, hero.id), { kind: "worn", text: "надето: Кольцо (правая)" });
  const loose = data.items.find((row) => row.owner_entity_id === hero.id && !row.equipped_entity_id && !row.detail?.status);
  assert.equal(cellState(data, loose, hero.id), null);
  const lent = data.items.find((row) => row.detail?.status === "lent");
  assert.equal(cellState(data, lent, lent.owner_entity_id).kind, "loan");
  assert.match(cellState(data, lent, lent.owner_entity_id).text, /^отдано: /);
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /state=\{cellState\(view, item, viewerId\)\}/);
  assert.match(grid, /state\.kind === "worn" \? s\.cellMarkWorn : s\.cellMarkLoan/);
  assert.match(grid, /aria-label=\{label\} title=\{label\}/, "the mark's words on hover and for a screen reader");
});

test("А1: one inventory at a time, as cells — the hero by default, companions, saddlebags and what lies here through the portrait switch", () => {
  const screen = src("src/components/registry/character-screen.tsx");
  assert.doesNotMatch(screen, /HolderList|ItemRows|s\.lists/, "no side-by-side lists of every holder");
  assert.match(screen, /\{tab === "inv" && \(bagHolder\.kind === "person" \? <div className=\{s\.gridInventory\}>\{doll\}\{bag\}<\/div> : bag\)\}/);
  assert.match(screen, /const bagHolder = tab === "inv" \? holders\.find\(\(holder\) => holder\.key === holderKey && holder\.kind !== "person"\) \?\? own : own;/);
  assert.match(screen, /const extraHolders = tab === "inv" \? holders\.filter\(\(holder\) => holder\.kind !== "person"\) : \[\];/, "mounts and place piles join the switch on the inventory tab");
  assert.match(screen, /onClick=\{\(\) => \{ setHolderKey\(holder\.key\); setCard\(null\); setFilter\("all"\); \}\} \{\.\.\.switchDrop\(holder\)\}/);
  assert.match(screen, /<InventoryGrid view=\{view\} items=\{holder\.items\}/, "the same cells on «Персонаж» and «Инвентарь»");
  // Handing over stays: «Отдать →» on the card and a drop on a portrait of the switch.
  assert.match(screen, /targets=\{targetsFor\(view, holders, selected, hero\?\.id \?\? null, c\)\}/);
  assert.match(screen, /onDrop: \(event: DragEvent\) => \{ event\.preventDefault\(\); const id = event\.dataTransfer\.getData\("text\/plain"\); if \(id\) dropOn\(holder, id\); \}/);
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /<div className=\{`\$\{r\.grid\} \$\{s\.bag\}/, "cells, as before the lists");
  assert.match(grid, /className=\{r\.cellEmpty\}/, "the empty cells after the things");
  assert.match(src("src/components/registry/holdings-screen.tsx"), /import \{ ItemCard, ItemCell \} from "\.\/inventory-grid";/);
});

// --- А2 -------------------------------------------------------------------------------------------------------------
test("А2: the history goes under a folded «История»; an «появилось» identical to the description is not shown at all", () => {
  const description = "Тонкое серебряное кольцо с руной щита. Даёт +1 к КД и спасброскам.";
  const history = [
    { at: 0, event: "created", note: "Тонкое серебряное кольцо с руной щита — даёт +1 к КД и спасброскам" },
    { at: 30, event: "owner_equipped", note: "Рэй — Кольцо (правая)" },
    { at: 40, event: "owner_unequipped", note: "Рэй — Кольцо (правая)" },
  ];
  assert.deepEqual(shownHistory({ description, detail: { history } }).map((row) => row.event), ["owner_unequipped", "owner_equipped"], "newest first, the duplicate gone");
  const long = "Плащ ".repeat(60).trim();
  assert.equal(shownHistory({ description: long, detail: { history: [{ at: 0, event: "created", note: long.slice(0, 200) }] } }).length, 0, "the DM's note is cut at 200");
  assert.equal(shownHistory({ description, detail: { history: [{ at: 0, event: "created", note: "найдено в сундуке" }] } }).length, 1, "a different note stays");
  assert.equal(shownHistory({ description: "", detail: {} }).length, 0);
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /<details className=\{s\.historyFold\}>\s*<summary>\{c\(`История · \$\{history\.length\}`, `History · \$\{history\.length\}`\)\}<\/summary>/);
  assert.match(grid, /const history = shownHistory\(item\);/);
  assert.doesNotMatch(grid, /detail\?\.history \?\? \[\]\)\.slice\(-3\)/, "the open three-line history is gone");
  assert.match(grid, /owner_corrected: \["поправка", "corrected"\]/);
});

// --- А4 -------------------------------------------------------------------------------------------------------------
test("А4: «Надеть» only for items with a slot", () => {
  const slots = universalSlots("ru");
  for (const kind of ["weapon", "shield", "armor", "clothing", "jewelry", "accessory"]) assert.ok(canWear(thing(kind), slots), kind);
  for (const kind of ["consumable", "ammunition", "gear", "tool", "misc", "quest item"]) assert.ok(!canWear(thing(kind), slots), kind);
  assert.ok(!canWear(thing("jewelry"), []), "a doll without slots");
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /const wearable = !!wearer && canWear\(item, slotsFor\(wearer, view\.campaign\.language\)\);/);
  assert.match(grid, /: wearable && onEquip && <button/);
});

test("А4: «Использовать» only for consumables and items with an action (potion, scroll, food, signal horn, the taper)", () => {
  const yes = {
    potion: thing("consumable", "Красная жидкость в склянке", "Восстанавливает 2к4+2 хитов"),
    scroll: thing("consumable", "Свиток с заклинанием", ""),
    food: thing("consumable", "Сухари и вяленое мясо на три дня", ""),
    horn: thing("gear", "Медный рог на ремне, для подачи сигнала отряду", ""),
    taper: thing("gear", "Тонкая восковая свеча", "Горит час; тусклый свет на 5 футов"),
    wand: thing("gear", "Палочка из ясеня", "", { charges: { value: 3, max: 7 } }),
    activated: thing("jewelry", "Амулет", "Бонусным действием окутывает владельца тенью"),
  };
  const no = {
    ring: thing("jewelry", "Серебряное кольцо", "+1 к КД и спасброскам"),
    crossbow: thing("weapon", "Лёгкий арбалет", "1к8 колющий, боеприпас, перезарядка, двуручное"),
    robe: thing("clothing", "Мантия боевого мага", "+1 КД без доспеха и щита"),
    rope: thing("gear", "Пеньковая верёвка, 50 футов", ""),
    bolts: thing("ammunition", "Болты", ""),
    clue: thing("misc", "Письмо с печатью гильдии", ""),
  };
  for (const [name, item] of Object.entries(yes)) assert.ok(canUse(item), name);
  for (const [name, item] of Object.entries(no)) assert.ok(!canUse(item), name);
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /\{usable && onUse && <button type="button" className=\{r\.btnGhost\} onClick=\{onUse\}>\{c\("Использовать", "Use"\)\}<\/button>\}/);
});

test("А4: a clue keeps «Вид вещи» and «Отдать»", () => {
  const clue = thing("misc", "Письмо с печатью гильдии", "");
  assert.ok(!canWear(clue, universalSlots("ru")) && !canUse(clue));
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /\{onKind && <button type="button" className=\{s\.parchmentLink\} onClick=\{onKind\}>\{c\("Вид вещи…", "Kind…"\)\}<\/button>\}/, "«Вид вещи» for every thing");
  assert.match(grid, /\{targets\.length > 0 && \(\s*<div className=\{s\.give\}>/, "«Отдать →» for every thing with somewhere to go");
});

// --- А3 -------------------------------------------------------------------------------------------------------------
test("А3: the ring of minor protection is worn on «Кольцо (правая)» and its description loses «у куклы пока нет слота для колец»; history kept; idempotent", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const { f } = c;
    await f.db.query("update public.rpg_items set equipped_entity_id=null,equipped_slot=null where equipped_entity_id=$1", [c.hero]);
    await f.db.query("update public.rpg_entities set equipment_slots=rpg_private.universal_slots('ru') where id=$1", [c.hero]);
    await f.db.query("update rpg_private.runtime_state set world_minutes=600 where campaign_id=$1", [c.cid]);
    const bag = (await f.one("select id from public.rpg_storages where entity_id=$1 order by id limit 1", [c.hero])).id;
    const heroName = (await f.one("select name from public.rpg_entities where id=$1", [c.hero])).name;
    let order = 0;
    const put = async (name, category, description, mechanics = "", detail = {}) => (await f.one(`insert into public.rpg_items(id,campaign_id,name,category,quantity,description,
      mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail,revision,updated_at) values(gen_random_uuid(),$1,$2,$3,1,$4,$5,$6,$7,null,null,$8::jsonb,1,
      timestamptz '2026-10-01 12:00+00' + make_interval(mins => $9)) returning id`, [c.cid, name, category, description, mechanics, c.hero, bag, JSON.stringify(detail), ++order])).id;
    const created = { history: [{ at: 0, event: "created", note: "кольцо из тайника" }] };
    const minor = await put("Кольцо малой защиты", "jewelry", "Тонкое серебряное кольцо с руной щита. Даёт +1 к КД и спасброскам; у куклы пока нет слота для колец.", "+1 КД, +1 спасброски", created);
    const second = await put("Перстень с печаткой", "accessory", "Тяжёлый перстень.", "Печать дома (у куклы пока нет слота для колец)");
    const third = await put("Медное кольцо", "jewelry", "У куклы пока нет слота для колец. Простое медное кольцо.");
    const amulet = await put("Амулет", "jewelry", "Амулет; у куклы пока нет слота для колец.");
    const sql = await readFile(new URL(`../supabase/migrations/${RING}`, import.meta.url), "utf8");
    await f.db.exec(sql);
    const row = (id) => f.one("select name,category,description,mechanics,equipped_entity_id,equipped_slot,detail,revision from public.rpg_items where id=$1", [id]);
    const ring = await row(minor);
    assert.equal(ring.equipped_entity_id, c.hero);
    assert.equal(ring.equipped_slot, "ring_right", "«Кольцо (правая)»");
    assert.equal(ring.description, "Тонкое серебряное кольцо с руной щита. Даёт +1 к КД и спасброскам.");
    assert.equal(ring.mechanics, "+1 КД, +1 спасброски", "the properties without the phrase stay as they are");
    assert.equal(ring.revision, 2, "a new revision of the item");
    assert.deepEqual(ring.detail.history.map((entry) => entry.event), ["created", "owner_corrected", "owner_equipped"], "the history is kept and grows");
    assert.deepEqual(ring.detail.history.at(-1), { at: 600, event: "owner_equipped", note: `${heroName} — Кольцо (правая)` });
    // The right ring taken (the older ring first): the next ring goes on the left one (its kind becomes jewellery, the slot's kind); both taken: it stays in the bag.
    const seal = await row(second);
    assert.equal(seal.equipped_slot, "ring_left");
    assert.equal(seal.category, "jewelry");
    assert.equal(seal.mechanics, "Печать дома");
    const copper = await row(third);
    assert.equal(copper.equipped_slot, null, "two hands, two rings");
    assert.equal(copper.description, "Простое медное кольцо.");
    assert.deepEqual(copper.detail.history.map((entry) => entry.event), ["owner_corrected"]);
    const untouched = await row(amulet);
    assert.equal(untouched.revision, 1, "not a ring: never touched");
    assert.match(untouched.description, /у куклы пока нет слота для колец/);
    await f.db.exec(sql);
    assert.equal((await row(minor)).revision, 2, "idempotent: a fixed ring no longer carries the phrase");
    assert.equal((await row(third)).revision, 2);
  } finally { await c.f.db.close(); }
});

test("А3: the data fix is a migration in this stage's range, after every earlier one", async () => {
  const { readdirSync } = await import("node:fs");
  const files = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort();
  assert.ok(files.indexOf(RING) > files.indexOf("202610210403_fix_s3_pre_gallery_turns.sql"));
  assert.ok(RING >= "202610230521" && RING < "202610230530", "block А's range");
  const sql = src(`supabase/migrations/${RING}`);
  assert.match(sql, /^-- Fixes from the owner's acceptance pass \(docs\/stages\/FIX_S3_ACCEPT\.md А3\)/);
  assert.match(sql, /phrase constant text:='\[Уу\]\\s\+куклы\\s\+пока\\s\+нет\\s\+слота\\s\+для\\s\+колец';/, "found by shape, either case");
  assert.match(sql, /'event','owner_equipped'/, "the DM reads the move as an owner move");
  assert.doesNotMatch(sql, /\bdelete\b|\bdrop\b|\btruncate\b/i, "nothing removed");
});

// --- А5 -------------------------------------------------------------------------------------------------------------
test("А5: each companion gets a full-length figure like the hero's — after the portrait, one at a time, within the cap — and «Перерисовать» redraws it", () => {
  const data = shovSample.snapshot();
  const companions = data.entities.filter((row) => row.kind === "companion");
  assert.ok(companions.length >= 1);
  const set = anchorSet(data, { items: false, portraits: true, figures: true, places: false, holdings: false });
  for (const row of [data.entities.find((entity) => entity.kind === "player"), ...companions]) {
    const at = set.findIndex((step) => step.subject.id === row.id && step.composition === "portrait");
    assert.ok(at >= 0 && set[at + 1]?.composition === "figure" && set[at + 1].subject.id === row.id, `${row.name}: portrait, then figure`);
  }
  assert.equal(anchorSet(data, { items: false, portraits: true, figures: false, places: false, holdings: false }).filter((step) => step.composition === "figure").length, 0,
    "the owner's figure switch");
  const uuid = (n) => `9e9e9e9e-0000-4000-8000-${String(n).padStart(12, "0")}`;
  const ready = (n, subjectId, composition) => ({ id: uuid(n), kind: "anchor", subjectKind: "entity", subjectId, composition, timeline: data.timeline, version: 1, status: "ready",
    hidden: false, model: "fal-ai/flux-2/klein/9b", tier: "fast", trigger: "autopilot", styleVersionId: null, width: 1024, height: 1024, costUsdMicros: 17000, elapsedMs: 1, error: null,
    createdAt: new Date(Date.UTC(2026, 9, 22, 12, n)).toISOString(), readyAt: new Date(Date.UTC(2026, 9, 22, 12, n)).toISOString() });
  const board = (pictures, cap = 60) => parsePictureBoard({ campaignId: data.campaign.id, worldId: null, settings: { frames: "every", quality: "fast", dailyCap: cap,
    autopilot: { enabled: true, items: false, portraits: true, figures: true, places: false, holdings: false, autoAccept: true, provider: "fal" }, models: {}, revision: 1 },
    today: { count: 0, costUsdMicros: 0 }, styles: [], pictures });
  const people = [data.entities.find((entity) => entity.kind === "player"), ...companions];
  const drawn = people.flatMap((row, index) => [ready(index * 2 + 1, row.id, "portrait"), ...(row.kind === "player" ? [ready(index * 2 + 2, row.id, "figure")] : [])]);
  const [next] = planAutopilot(data, board(drawn));
  assert.equal(next.composition, "figure");
  assert.equal(next.subject.id, companions[0].id, "a companion's figure is next once the portraits and the hero's figure exist");
  assert.equal(planAutopilot(data, { ...board(drawn, 0) }).length, 0, "the cap stops it");
  // The brief: the record's look and the gear the companion wears, carried on the body, never in hand.
  const prompt = compileAnchorPrompt({ person: { key: companions[0].id, label: "this character", pronoun: "they", appearance: "a lean scout with a braid" },
    composition: "figure", carried: ["Скимитар", "Кожаный доспех"], references: [{ role: "face", person: companions[0].id }], style: "" }, "gpt-image");
  assert.match(prompt, /full-body character illustration of this character/);
  assert.match(prompt, /gear, worn on the body[^.]*: Скимитар and Кожаный доспех\./);
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /onRedraw=\{\(\) => setRedraw\(\{ kind: "entity", id: dollEntity\.id, composition: "figure" \}\)\}/);
  assert.match(screen, /<RedrawAnchor data=\{data\} subject=\{\{ kind: redraw\.kind, id: redraw\.id \}\} composition=\{redraw\.composition\}/);
  const redraw = src("src/components/registry/redraw-anchor.tsx");
  assert.match(redraw, /const current = composition === "figure" \? anchorFor\(board, subject, "figure"\) : anchorOf\(board, data, subject\);/);
  const grid = src("src/components/registry/inventory-grid.tsx");
  assert.match(grid, /<div className=\{s\.figureWait\}>/, "until the figure is ready the portrait keeps its own size");
  assert.doesNotMatch(grid, /: <Art subject=\{\{ kind: "entity", id: entity\.id \}\} name=\{entity\.name\} position="center 20%" \/>\}/, "never the portrait stretched over the frame");
  const css = src("src/components/registry/character.module.css");
  assert.match(css, /\.figurePortrait \{[^}]*aspect-ratio: 3 \/ 4;/);
});

// --- Е1 -------------------------------------------------------------------------------------------------------------
test("Е1: «Судьбы» cards show the portrait from «Люди»; the rest are drawn in one batch at the chapter's close within the cap; «Перерисовать» on click", () => {
  const data = shovSample.snapshot();
  const npcs = data.entities.filter((row) => row.kind === "npc" || row.kind === "companion").slice(0, 3);
  assert.ok(npcs.length >= 3, "the sample has people to meet");
  const [drawn, tried, fresh] = npcs;
  const uuid = (n) => `9e9e9e9e-0000-4000-8000-${String(n).padStart(12, "0")}`;
  const row = (n, subjectId, status) => ({ id: uuid(n), kind: "anchor", subjectKind: "entity", subjectId, composition: "portrait", timeline: data.timeline, version: 1, status,
    hidden: false, model: "fal-ai/flux-2/klein/9b", tier: "fast", trigger: "autopilot", styleVersionId: null, width: 1024, height: 1024, costUsdMicros: 0, elapsedMs: 1,
    error: status === "failed" ? "validation" : null, createdAt: new Date(Date.UTC(2026, 9, 22, 12, n)).toISOString(), readyAt: status === "ready" ? new Date(Date.UTC(2026, 9, 22, 12, n)).toISOString() : null });
  const board = (pictures, cap = 60, count = 0) => parsePictureBoard({ campaignId: data.campaign.id, worldId: null, settings: { frames: "every", quality: "fast", dailyCap: cap,
    autopilot: { enabled: false, items: true, portraits: true, figures: true, places: true, holdings: true, autoAccept: true, provider: "fal" }, models: {}, revision: 1 },
    today: { count, costUsdMicros: 0 }, styles: [], pictures });
  const cards = [
    { entityId: drawn.id, name: drawn.name }, { entityId: tried.id, name: tried.name }, { entityId: null, name: fresh.name },
    { entityId: fresh.id, name: fresh.name }, { entityId: null, name: "Стражники заставы" },
  ];
  const b = board([row(1, drawn.id, "ready"), row(2, tried.id, "failed")]);
  const plan = fatePortraitPlan(b, data, cards);
  assert.deepEqual(plan.map((step) => [step.subject.id, step.composition]), [[fresh.id, "portrait"]],
    "one batch: only the people without any portrait, each once (a card named like a record finds it); a failure is not retried on its own; a group has no portrait");
  assert.equal(fateEntityId({ entityId: null, name: ` ${fresh.name.toUpperCase()} ` }, data.entities), fresh.id);
  assert.equal(fateEntityId({ entityId: null, name: "Стражники заставы" }, data.entities), null);
  assert.equal(fatePortraitPlan(board([], 2, 2), data, cards).length, 0, "the cap");
  assert.equal(fatePortraitPlan(board([], 60), data, cards).length, 3);
  assert.equal(fatePortraitPlan(board([], 3, 1), data, cards).length, 2, "within what the cap leaves");
  // At the close: the digest queues the batch after it is written; the shown chapter asks once more (a chapter closed before).
  const digest = src("src/lib/server/session-digest.ts");
  assert.match(digest, /if \(result\.digest\.ending\.form === "cards" && result\.digest\.ending\.cards\.length\)\s*await queueFatePortraits\(campaignId, \{ sessionId \}, later\)/);
  const service = src("src/lib/server/media/pictures-service.ts");
  assert.match(service, /const plan = fatePortraitPlan\(board, snapshot, cards\);/);
  assert.match(service, /if \(fateBatches\.has\(campaignId\)\) return \{ status: "busy" as const/, "one batch at a time: never a person twice");
  assert.match(src("src/app/api/visual-frame/route.ts"), /case "pictures\.fates": return queueFatePortraits\(campaignId, input, schedule\);/);
  const view = src("src/components/registry/session-end.tsx");
  assert.match(view, /void sendPictures\("pictures\.fates", \{ sessionId \}\)/);
  assert.match(view, /<Art subject=\{\{ kind: "entity", id: entityId \}\} name=\{card\.name\} position="center 25%" drawingLabel=\{c\("рисуется…", "drawing…"\)\} \/>/, "the portrait «Люди» shows");
  assert.match(view, /onClick=\{\(\) => setRedrawId\(entityId\)\}/);
  assert.match(view, /<RedrawAnchor data=\{data\} subject=\{\{ kind: "entity", id: redrawId \}\} name=\{redrawName\} \/>/);
});
