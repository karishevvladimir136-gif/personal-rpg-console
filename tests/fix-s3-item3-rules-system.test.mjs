// Fix S3 item 3 (docs/stages/FINDINGS_S3.md, «The rules system is set at creation»): a new campaign whose world names
// D&D 5e or Pathfinder is created with that rules system (the label the 5e module and the rules module read; the
// ruleset id the turn path needs stays `world-logic-v1`); «Правила и кости» offers the choice with a line on the 5e
// module; the game screen shows «5e-модуль: включён / выключен». A world that names no system stays as today, and the
// owner's choice always wins.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import { createCampaignSettings, updateCampaignSettings } from "../src/lib/campaign-settings.ts";
import { isFifthEdition } from "../src/lib/live2d/battle/rules-5e.ts";
import { rulesOnByDefault } from "../src/lib/live2d/battle/rules.ts";
import { creationRulesSystemSave, detectRulesSystem, rulesSystemAtCreation, rulesSystemChoice, withRulesSystemChoice } from "../src/lib/rulesets/rules-system.ts";
import { examples, setup, usage } from "./universal-bootstrap-fixture.mjs";
import { attachLoop } from "./dm-loop-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const WORLD_LOGIC = { id: "world-logic-v1", label: "World Logic", enemyHpScaling: false, enemyDamageScaling: false };
const system = (text) => detectRulesSystem(text)?.choice ?? null;

test("item 3: a world's description naming D&D 5e or Pathfinder, in Russian and English; anything else names nothing", () => {
  for (const text of ["Забытые королевства; играем по D&D 5e.", "Классическое фэнтези по DnD.", "Играем в ДнД.", "Правила: 5-я редакция.",
    "Всё по пятой редакции.", "Dungeons & Dragons 5th edition, the Sword Coast.", "Подземелья и драконы", "D&D 2024", "SRD 5.1", "Правила 5e"])
    assert.equal(system(text), "dnd5e", text);
  for (const text of ["Голарион, Pathfinder 2e.", "Pathfinder", "PF2e", "Мир по правилам Следопыта.", "Система «Следопыт» 2e.", "Пасфайндер", "pathfinder 2e"])
    assert.equal(system(text), "pathfinder", text);
  for (const text of ["Пустошь после войны, без классов и уровней.", "Лес, где живут следопыты.", "Кодекс и правила следопытов гильдии.",
    "a pathfinder guides caravans", "Shadowrun 5e в Москве", "Вампиры: Маскарад 5-я редакция", "Это не D&D, а своя система.", "not a D&D game",
    "D&D 3.5", "ДнД 4-й редакции", "AD&D", ""])
    assert.equal(system(text), null, text);
  assert.deepEqual(detectRulesSystem("Не просто D&D, а D&D 5e с домашними правилами."), { choice: "dnd5e", label: "D&D 5e" }, "the mention the text keeps");
  assert.deepEqual(detectRulesSystem("Голарион, Pathfinder 2e."), { choice: "pathfinder", label: "Pathfinder" });
});

test("item 3: the setting's choice changes the label only — the 5e module on for D&D 5e, the rules module for Pathfinder, back to World Logic", () => {
  const settings = { ...createCampaignSettings("c1"), rulesSystem: { ...WORLD_LOGIC } };
  assert.equal(rulesSystemChoice(settings.rulesSystem), "world");
  const fifth = updateCampaignSettings(settings, { type: "rulesSystem", value: "dnd5e" });
  assert.deepEqual(fifth.rulesSystem, { ...WORLD_LOGIC, label: "D&D 5e" }, "the id the turn path reads stays");
  assert.deepEqual({ ...fifth, rulesSystem: null }, { ...settings, rulesSystem: null }, "nothing else changes");
  assert.equal(isFifthEdition(fifth.rulesSystem), true);
  const pathfinder = updateCampaignSettings(fifth, { type: "rulesSystem", value: "pathfinder" });
  assert.equal(pathfinder.rulesSystem.label, "Pathfinder");
  assert.equal(isFifthEdition(pathfinder.rulesSystem), false, "Pathfinder keeps its own sheet numbers");
  assert.equal(rulesOnByDefault(`${pathfinder.rulesSystem.label} ${pathfinder.rulesSystem.id}`), true, "the fight's rules module");
  const back = updateCampaignSettings(pathfinder, { type: "rulesSystem", value: "world" });
  assert.deepEqual(back.rulesSystem, WORLD_LOGIC);
  assert.equal(isFifthEdition(back.rulesSystem) || rulesOnByDefault(`${back.rulesSystem.label} ${back.rulesSystem.id}`), false);
  // The owner's own wording of a system is read, and the same choice keeps it as written.
  const owners = { ...WORLD_LOGIC, label: "D&D 5e (2014)" };
  assert.equal(rulesSystemChoice(owners), "dnd5e");
  assert.equal(withRulesSystemChoice(owners, "dnd5e"), owners);
  assert.equal(withRulesSystemChoice({ ...owners, id: "console-basic-v1" }, "world").label, "Console basic house rules");
});

test("item 3: creation fills in only the bootstrap's untouched World Logic default; the owner's choice wins", () => {
  const history = [{ values: { rulesSystem: { id: "custom", label: "Custom rules" } } }, { values: { rulesSystem: WORLD_LOGIC } }];
  assert.deepEqual(rulesSystemAtCreation(WORLD_LOGIC, history, "Мир по D&D 5e"), { ...WORLD_LOGIC, label: "D&D 5e" });
  assert.equal(rulesSystemAtCreation(WORLD_LOGIC, history, "Мир без названной системы"), null, "a world naming nothing stays as today");
  assert.equal(rulesSystemAtCreation({ ...WORLD_LOGIC, label: "Pathfinder" }, history, "Мир по D&D 5e"), null, "a set system is never replaced");
  assert.equal(rulesSystemAtCreation({ ...WORLD_LOGIC, id: "console-basic-v1", label: "Console basic house rules" }, history, "D&D 5e"), null);
  assert.equal(rulesSystemAtCreation(WORLD_LOGIC, [...history, { values: { rulesSystem: { ...WORLD_LOGIC, label: "D&D 5e" } } }, { values: { rulesSystem: WORLD_LOGIC } }],
    "Мир по D&D 5e"), null, "the owner chose a system and went back to World Logic: it stays");
  const snapshot = { campaign: { id: "c1" }, settings: { revision: 2, values: { ...createCampaignSettings("c1"), rulesSystem: WORLD_LOGIC } }, settingsHistory: history,
    timeline: { timelineId: "t", epoch: 1 } };
  const save = creationRulesSystemSave(snapshot, { title: "Побережье Мечей", premise: "Играем по ДнД." });
  assert.equal(save.operation, "settings.save");
  assert.equal(save.expectedRevision, 2);
  assert.deepEqual(save.payload, { ...snapshot.settings.values, rulesSystem: { ...WORLD_LOGIC, label: "D&D 5e" } });
  assert.equal(creationRulesSystemSave({ ...snapshot, timeline: undefined }, { title: "x", premise: "D&D 5e" }), null);
});

/** A campaign created through the bootstrap service with the server's after-creation step (applyWorldRulesSystem's
 * work on the synthetic database: read the campaign, the same settings save). */
async function created(world) {
  const f = await setup({ ...examples.fantasy, world }, "ru", Infinity);
  f.service = createBootstrapService(f.rpc, async (ticket) => ({ output: ticket.kind === "creation" ? f.creation : f.opening, usage }),
    async () => f.profile, async ({ campaignId, world: pinned }) => {
      const save = creationRulesSystemSave(await f.saves(campaignId, "campaign"), pinned);
      if (save) await f.mutation(save.operation, save.campaignId, save.payload, save.expectedRevision, save.correctionScope, save.timeline);
    });
  await f.create();
  return f;
}

test("item 3: a world naming D&D 5e creates a 5e campaign on the World Logic ruleset, and its turns play; a plain world stays World Logic", async () => {
  const f = await created({ title: "Побережье Мечей (синтетика)", premise: "Синтетический мир: тракт и броды. Правила — D&D 5e." });
  try {
    const settings = (await f.snapshot()).settings.values;
    assert.deepEqual(settings.rulesSystem, { ...WORLD_LOGIC, label: "D&D 5e" });
    assert.equal(isFifthEdition(settings.rulesSystem), true, "the 5e module is on from the start");
    await f.proposeOpening();
    await f.service.perform(f.openingCommit);
    const c = await attachLoop(f);
    const played = await c.turn("Осматриваюсь у брода.", [{ text: "У брода тихо. ", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal((await f.snapshot()).settings.values.rulesSystem.label, "D&D 5e");
  } finally { await f.db.close(); }
  const plain = await created({ title: "Открытые дороги", premise: "Обычные поселения и путники; без названной системы." });
  try {
    assert.deepEqual((await plain.snapshot()).settings.values.rulesSystem, WORLD_LOGIC, "a world that names no system stays as today");
  } finally { await plain.db.close(); }
});

test("item 3: «Правила и кости» offers the choice with the 5e line; the game screen shows the chip; the wizard's summary names the system", () => {
  const settings = src("src/components/registry/settings-screen.tsx");
  assert.match(settings, /value=\{rulesChoice\}/);
  assert.match(settings, /\{ value: "world", label: c\("Логика мира", "World Logic"\) \}, \{ value: "dnd5e", label: "D&D 5e" \}, \{ value: "pathfinder", label: "Pathfinder" \}/);
  assert.match(settings, /changeDice\(\{ type: "rulesSystem", value \}\)/);
  assert.match(settings, /5e-модуль: класс доспеха, спасброски и атаки считаются по правилам 5e из листа персонажа/);
  assert.match(settings, /5e module: armour class, saving throws and attacks are counted by the 5e rules from the character sheet/);
  assert.match(settings, /id="rules-and-dice"/);
  const game = src("src/components/registry/game-screen.tsx");
  assert.match(game, /const fifthEdition = isFifthEdition\(data\.settings\?\.values\?\.rulesSystem\);/);
  assert.match(game, /fifthEdition \? c\("5e-модуль: включён", "5e module: on"\) : c\("5e-модуль: выключен", "5e module: off"\)/);
  assert.match(game, /className=\{r\.chip\} href=\{`\$\{href\("settings"\)\}#rules-and-dice`\}/);
  const wizard = src("src/components/bootstrap/wizard.tsx");
  assert.match(wizard, /detectRulesSystem\(`\$\{world\.title\}\\n\$\{world\.premise\}`\)/);
  const server = src("src/lib/server/adventure-bootstrap.ts");
  assert.match(server, /\(\{ campaignId: cid, world \}\) => applyWorldRulesSystem\(cid, world\)/);
  const step = src("src/lib/server/campaign-rules-system.ts");
  assert.match(step, /creationRulesSystemSave\(await readCampaign\(campaignId\), world\)/);
  assert.match(step, /applyMutation\(/, "the ordinary validated settings save");
});
