// Findings S3, item 4 (docs/stages/FINDINGS_S3.md «Old sheets under the 5e module»): the class named by the role's first
// class word; a class's saves without a level ask for the level («уровень не указан» with «Изменить лист») instead of
// showing bare modifiers; the owner's hero of «Приключения начинаются» corrected once by a migration (level 5, the
// wizard's Int and Wis saves) as an owner correction with its receipt. Pure functions, the screens by their source and
// the migration on disposable PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { classOf, deriveSheet5e, derivedSheetOf } from "../src/lib/live2d/battle/rules-5e.ts";
import { patchSheet } from "../src/lib/inventory/sheet.ts";
import { fixture } from "./phase35-storage-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const MIGRATION = "202610230601_findings_s3_old_sheet.sql";
const CID = "00000000-0000-4000-8000-0000000000c4";
const HERO = "00000000-0000-4000-8000-0000000000a4";
/** The owner's hero as his creation wrote him: schema 1, no level, no save lines, the scores present. */
const OLD_SHEET = { schemaVersion: 1, mode: "structured_rpg", role: "Маг школы Воплощения, выпускник Академии", background: "Сын картографа из Глубоководья.",
  level: null, tier: null, attributes: { strength: 8, dexterity: 14, constitution: 13, intelligence: 17, wisdom: 12, charisma: 10 },
  skills: ["Магия", "История"], abilities: ["Огненный снаряд", "Щит"], limitations: ["Хрупкое здоровье"], spells: [] };
const hero = (sheet = OLD_SHEET, stats = { attack: 5, defense: 12, skill: 3 }) => ({ id: HERO, campaign_id: CID, revision: 1, updated_at: "", kind: "player",
  name: "Джеймс Вордсден", details: "", hp: 27, max_hp: 27, stats, resources: {}, conditions: [], equipment_slots: [], character_sheet: sheet, public_profile: {} });
const derive = (entity, language = "ru") => deriveSheet5e({ entity, items: [], language });
const byAbility = (saves) => Object.fromEntries(saves.map((save) => [save.ability, [save.value, save.text]]));

test("item 4: the class is the role's first class word, Russian or English; a qualifier after it never decides", () => {
  const cases = {
    "Маг школы Воплощения…": "wizard", "Wizard of the Evocation school": "wizard", "Колдун Великого Древнего": "warlock", "Warlock of the Fiend": "warlock",
    "Волшебник, школа воплощения": "wizard", "Волшебница": "wizard", "Боевой маг": "wizard", "Жрец домена Жизни": "cleric", "Cleric of the Light domain": "cleric",
    "Друид круга Луны": "druid", "Бард коллегии Знаний": "bard", "Паладин ордена Друидов": "paladin", "Следопыт": "ranger", "Ranger": "ranger",
    "Плут-вор": "rogue", "Rogue": "rogue", "Карманный вор": "rogue", "Воин": "fighter", "Воительница": "fighter", "Fighter": "fighter", "Варвар": "barbarian",
    "Монах": "monk", "Monk": "monk", "Чародейка": "sorcerer", "Sorcerer": "sorcerer", "Изобретатель": "artificer", "Artificer": "artificer",
    "Воин-маг": "fighter", "Плут, ученик волшебника": "rogue", "Эльфийка-друид": "druid", "Half-elf wizard": "wizard",
  };
  for (const [role, expected] of Object.entries(cases)) assert.equal(classOf(role), expected, role);
  for (const role of ["Странник", "Хранитель волшебного леса", "Магистр торговой гильдии", "", null, undefined]) assert.equal(classOf(role), null, String(role));
});

test("item 4: the old sheet without a level — no bare modifiers as saves, «level not set» instead; the rest as before", () => {
  const before = derive(hero());
  assert.equal(before.proficiency, null, "no level, no proficiency");
  assert.deepEqual(before.saves, [], "the bare modifiers are not shown as the saves");
  assert.equal(before.savesNeedLevel, true);
  assert.equal(before.ac.value, 12, "AC by the rules still: 10 + Dex 2");
  // A class the words do not name, or a sheet without scores: nothing to ask (and no saves, as before).
  assert.equal(derive(hero({ ...OLD_SHEET, role: "Странник" })).savesNeedLevel, false);
  assert.equal(derive(hero({ ...OLD_SHEET, attributes: null })).savesNeedLevel, false);
  // A sheet with its own save lines keeps them, level or not.
  const own = derive(hero({ ...patchSheet(OLD_SHEET, { saves: ["Спасбросок Ловкости +5"] }) }));
  assert.equal(own.savesNeedLevel, false);
  assert.deepEqual(byAbility(own.saves).dexterity, [5, "по листу +5"]);
  assert.deepEqual(byAbility(own.saves).intelligence, [3, "Инт +3"], "the others are the modifier");
  // A level on the record's stats counts as the level.
  assert.equal(derive(hero(OLD_SHEET, { attack: 5, level: 5 })).savesNeedLevel, false);
});

test("item 4: with level 5 the wizard's Int and Wis saves carry the proficiency (+3); the corrected sheet reads the same", () => {
  // The level alone (the owner's «Изменить лист»): the class gives the proficient saves.
  const levelled = derive(hero(patchSheet(OLD_SHEET, { level: 5 })));
  assert.equal(levelled.savesNeedLevel, false);
  assert.equal(levelled.proficiency.text, "+3 мастерство · уровень 5");
  const saves = byAbility(levelled.saves);
  assert.deepEqual(saves.intelligence, [6, "Инт +3 +3 мастерство"]);
  assert.deepEqual(saves.wisdom, [4, "Мдр +1 +3 мастерство"]);
  assert.deepEqual(saves.strength, [-1, "Сил −1"]);
  assert.deepEqual(saves.dexterity, [2, "Лов +2"]);
  assert.deepEqual(saves.charisma, [0, "Хар +0"]);
  // The migration's sheet: level 5 and the two save lines — the same numbers, explained as proficient.
  const corrected = derive(hero(patchSheet(OLD_SHEET, { level: 5, saves: ["Спасбросок Интеллекта +6", "Спасбросок Мудрости +4"] })));
  assert.deepEqual(byAbility(corrected.saves), saves);
  assert.deepEqual(corrected.saves.map((save) => save.label).slice(3, 5), ["Спасбросок Интеллекта", "Спасбросок Мудрости"]);
  // English: «Wizard of the Evocation school».
  const english = derive(hero(patchSheet({ ...OLD_SHEET, role: "Wizard of the Evocation school" }, { level: 5 })), "en");
  assert.deepEqual(byAbility(english.saves).intelligence, [6, "Int +3 +3 proficiency"]);
  assert.deepEqual(byAbility(english.saves).wisdom, [4, "Wis +1 +3 proficiency"]);
  // Level → proficiency +2..+6.
  assert.deepEqual([1, 4, 5, 9, 13, 17, 20].map((level) => derive(hero(patchSheet(OLD_SHEET, { level }))).proficiency.value), [2, 2, 3, 4, 5, 6, 6]);
});

test("item 4: the owner's numbers still outrank; another system keeps its sheet", () => {
  const manual = derive(hero(OLD_SHEET, { attack: 5, defense: 12, skill: 3, ac_manual: 15 }));
  assert.deepEqual([manual.ac.value, manual.ac.source], [15, "manual"]);
  const data = (label) => ({ campaign: { id: CID, language: "ru" }, settings: { values: { rulesSystem: { id: "world-logic-v1", label } } }, entities: [hero()], items: [], storages: [] });
  assert.equal(derivedSheetOf(data("Pathfinder 2e"), hero()), null, "Pathfinder: no 5e numbers, no level prompt");
  assert.equal(derivedSheetOf(data("World Logic"), hero()), null);
  assert.equal(derivedSheetOf(data("D&D 5e (2014)"), hero()).savesNeedLevel, true);
});

test("item 4: the saves block reads «Уровень не указан» with «Изменить лист», which opens the sheet's own editor (the level focused)", () => {
  const screen = src("src/components/registry/character-screen.tsx");
  assert.match(screen, /const levelUnset = !explained && savesNeedLevel && \(/);
  assert.match(screen, /c\("Уровень не указан", "Level not set"\)/);
  assert.match(screen, /\{onEditSheet && <button type="button" className=\{s\.linkButton\} onClick=\{onEditSheet\}>\{c\("Изменить лист", "Edit sheet"\)\}<\/button>\}/);
  assert.match(screen, /\{explained \|\| levelUnset \|\| numbered\(c\("Спасброски", "Saving throws"\), sheet\.saves\)\}/);
  assert.match(screen, /savesNeedLevel=\{derived\?\.savesNeedLevel\}\s+onEditSheet=\{\(\) => setEditing\(\{ entityId: entity\.id, level: true \}\)\}/);
  assert.match(screen, /open=\{editing\?\.entityId === entity\.id\} focusLevel=\{!!editing\?\.level\}/);
  assert.match(screen, /autoFocus=\{focusLevel && key === "level"\}/);
  // One editor: the link and the prompt open the same form; no second editor.
  assert.equal((screen.match(/function SheetForm\(/g) ?? []).length, 1);
  assert.match(screen, /if \(!open\) return <button type="button" className=\{s\.linkButton\} onClick=\{onOpen\}>\{c\("Изменить лист…", "Edit the sheet…"\)\}<\/button>;/);
  // The party card says it too (no editor there).
  assert.match(src("src/components/registry/party-screen.tsx"), /<SheetLines sheet=\{sheet\} skills=\{model\.skills\} saves=\{derived\?\.saves\} savesNeedLevel=\{derived\?\.savesNeedLevel\} compact \/>/);
});

// --- the owner's one-time correction ------------------------------------------------------------------------------
async function oldCampaign(f, title, sheet = OLD_SHEET, name = "Джеймс Вордсден") {
  const cid = (await f.mutation("campaign.create", null, { title, subtitle: "", language: "ru" })).id;
  const hero = (await f.mutation("entity.save", cid, { kind: "player", name, details: "Маг из Глубоководья.", hp: 27, max_hp: 27,
    stats: { attack: 5, defense: 12, skill: 3, ac_manual: 13 }, resources: { focus: 2 }, conditions: ["Доспехи мага"], equipment_slots: [], character_sheet: sheet })).id;
  return { cid, hero };
}

test("item 4: the migration corrects «Приключения начинаются» once — level 5, Int and Wis saves — as the owner's correction with its receipt", async () => {
  // Every migration ran on the empty database (this one among them) without touching anything.
  const f = await fixture();
  try {
    const sql = src(`supabase/migrations/${MIGRATION}`);
    const entity = (id) => f.one("select revision,stats,conditions,resources,character_sheet from public.rpg_entities where id=$1", [id]);
    const receipts = async () => Number((await f.one("select count(*) n from rpg_private.mutation_receipts")).n);
    // No such campaign: nothing changes.
    const other = await oldCampaign(f, "Другая кампания");
    let count = await receipts();
    await f.db.exec(sql);
    assert.equal(await receipts(), count, "no campaign of that title: no correction");
    assert.equal((await entity(other.hero)).revision, 1);

    const own = await oldCampaign(f, "Приключения начинаются");
    const companion = await f.mutation("entity.save", own.cid, { kind: "companion", name: "Вордсден-старший", details: "", hp: null, max_hp: null,
      stats: {}, resources: {}, conditions: [], equipment_slots: [], character_sheet: OLD_SHEET });
    const levelled = await oldCampaign(f, "Приключения начинаются", { ...patchSheet(OLD_SHEET, { level: 3 }) });
    // A record the owner's save would refuse (a condition longer than its 120 characters): left as it is, the load goes on.
    const refused = await oldCampaign(f, "Приключения начинаются");
    await f.query("update public.rpg_entities set conditions=$2::jsonb where id=$1", [refused.hero, JSON.stringify(["x".repeat(130)])]);
    // The migration runs as a launcher would (another session subject, or none): it acts as the owner and restores it.
    await f.one("select set_config('request.jwt.claim.sub',$1,false)", [f.other]);
    count = await receipts();
    await f.db.exec(sql);
    assert.equal((await f.one("select current_setting('request.jwt.claim.sub',true) s")).s, f.other, "the session's subject is restored");
    await f.one("select set_config('request.jwt.claim.sub',$1,false)", [f.owner]);
    assert.equal(await receipts(), count + 1, "one owner correction");

    const after = await entity(own.hero);
    assert.equal(after.revision, 2, "a new revision of the record");
    assert.deepEqual(after.character_sheet, { schemaVersion: 2, mode: "structured_rpg", role: OLD_SHEET.role, background: OLD_SHEET.background, level: 5, tier: null,
      attributes: OLD_SHEET.attributes, skills: OLD_SHEET.skills, abilities: OLD_SHEET.abilities, limitations: OLD_SHEET.limitations, spells: [],
      saves: ["Спасбросок Интеллекта +6", "Спасбросок Мудрости +4"] });
    assert.deepEqual(after.character_sheet, { ...patchSheet(OLD_SHEET, { level: 5, saves: ["Спасбросок Интеллекта +6", "Спасбросок Мудрости +4"] }) },
      "the sheet the owner's «Изменить лист» would save");
    assert.deepEqual(after.stats, { attack: 5, defense: 12, skill: 3, ac_manual: 13 }, "the owner's AC by hand and the stats stay");
    assert.deepEqual([after.conditions, after.resources], [["Доспехи мага"], { focus: 2 }]);
    // The receipt: an owner's `entity.save` of the timeline, by a known request id, its payload the corrected record.
    const receipt = await f.one("select owner_id,campaign_id,request,result from rpg_private.mutation_receipts where request_id=rpg_private.wave4_id($1,'findings-s3:old-sheet')", [own.hero]);
    assert.equal(receipt.owner_id, f.owner);
    assert.equal(receipt.campaign_id, own.cid);
    assert.equal(receipt.request.operation, "entity.save");
    assert.equal(receipt.request.expected_revision, 1);
    assert.deepEqual(receipt.request.payload.character_sheet, after.character_sheet);
    assert.equal(receipt.result.revision, 2);
    assert.ok(await f.one("select 1 from rpg_private.timeline_mutation_receipts where request_id=rpg_private.wave4_id($1,'findings-s3:old-sheet')", [own.hero]), "on the active timeline");
    assert.equal((await f.one("select authority from rpg_private.memory_public_sources where source_id=$1 and current and kind='entity'", [own.hero])).authority, "correction",
      "the DM's memory reads the record as the owner's correction");
    // The 5e module reads the corrected sheet: Int and Wis proficient (+3).
    const saves = byAbility(derive(hero(after.character_sheet, after.stats)).saves);
    assert.deepEqual([saves.intelligence, saves.wisdom, saves.dexterity], [[6, "Инт +3 +3 мастерство"], [4, "Мдр +1 +3 мастерство"], [2, "Лов +2"]]);

    // Untouched: a hero whose sheet already has a level, the same hero in another campaign, a companion of that name,
    // a record the owner's save refuses.
    assert.equal((await entity(levelled.hero)).revision, 1);
    assert.deepEqual([(await entity(refused.hero)).revision, (await entity(refused.hero)).character_sheet], [1, OLD_SHEET]);
    assert.equal((await entity(other.hero)).revision, 1);
    assert.equal((await entity(companion.id)).revision, 1);
    // Idempotent: a second run changes nothing.
    count = await receipts();
    await f.db.exec(sql);
    assert.equal(await receipts(), count);
    assert.equal((await entity(own.hero)).revision, 2);
  } finally { await f.db.close(); }
});

test("item 4: the correction is an additive migration after every earlier one, documented for the owner's reload", () => {
  const files = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort();
  assert.ok(files.indexOf(MIGRATION) > files.indexOf("202610230551_fix_s3_accept_adventure_wishes.sql"));
  const sql = src(`supabase/migrations/${MIGRATION}`);
  assert.match(sql, /^-- Findings S3, item 4 \(docs\/stages\/FINDINGS_S3\.md «Old sheets under the 5e module»\)/);
  assert.match(sql, /perform public\.rpg_apply_mutation\(rpg_private\.wave4_id\(e\.id,'findings-s3:old-sheet'\),'entity\.save',c\.id,e\.revision,/, "the owner's own save path");
  assert.match(sql, /exception when others then\n\s+perform set_config\('request\.jwt\.claim\.sub',coalesce\(prior,''\),true\);\n\s+raise warning/, "a refusal never stops the load");
  assert.doesNotMatch(sql, /\bdelete\b|\bdrop\b|\btruncate\b|update public\./i, "nothing removed; no row written past the owner's save");
  const guide = src("docs/SANDBOX_LOAD_FIX_S2.md");
  assert.match(guide, /\| 0601 `findings_s3_old_sheet` \| \*\*changes a record\*\*/);
});
