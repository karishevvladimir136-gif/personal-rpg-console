// The Russian blind test (docs/stages/BLIND_RU.md): the Russian scenes mirror the
// English blind scenes step for step, each names its key turn, the Russian campaign
// fixture passes the character-creation grounding rule, a campaign built from it
// plays a turn in Russian with no English fixture text in the game master's context,
// and the language check finds Latin-script words in narration and records.
import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { freshCampaign } from "../scripts/eval/lib/loop-harness.mjs";
import { latinWords, recordTexts, russianVerdict } from "../scripts/eval/lib/language.mjs";

const folder = (name) => new URL(`../scripts/eval/scenarios/${name}/`, import.meta.url);
const json = async (url) => JSON.parse(await readFile(url, "utf8"));
const KEY_STEPS = { "tavern-talk": "t3", "companion-heart": "h2", "secret-pressure": "p3", "power-creep": "obey",
  "combat-climax": "c2", "travel-consequences": "travel" };

test("every English blind scene has a Russian copy with the same steps and its key turn", async () => {
  const english = (await readdir(folder("blind"))).filter((file) => file.endsWith(".json")).sort();
  const russian = (await readdir(folder("blind-ru"))).filter((file) => file.endsWith(".json") && file !== "campaign.json").sort();
  assert.deepEqual(russian, english);
  for (const file of english) {
    const en = await json(new URL(file, folder("blind")));
    const ru = await json(new URL(file, folder("blind-ru")));
    const scene = file.replace(/\.json$/, "");
    assert.equal(ru.keyStep, KEY_STEPS[scene], scene);
    assert.ok(ru.steps.some((step) => step.id === ru.keyStep && step.say), `${scene}: key step is a player turn`);
    assert.equal(ru.runtime, en.runtime);
    assert.deepEqual(ru.steps.map((step) => [step.id, step.action ?? "say", step.dice ?? null, Boolean(step.companion)]),
      en.steps.map((step) => [step.id, step.action ?? "say", step.dice ?? null, Boolean(step.companion)]), scene);
    for (const step of ru.steps.filter((entry) => entry.say)) assert.deepEqual(latinWords(step.say), [], `${scene} ${step.id}`);
    assert.deepEqual(latinWords(`${ru.title} ${ru.description}`), [], scene);
  }
});

test("the Russian campaign fixture is grounded and builds a Russian campaign whose context carries no English fixture text", async () => {
  const campaign = await json(new URL("campaign.json", folder("blind-ru")));
  assert.equal(campaign.language, "ru");
  // Character creation accepts a capability, limit or item only when the description quotes it.
  for (const label of [...campaign.caps, ...campaign.limits, campaign.item])
    assert.ok(campaign.description.toLocaleLowerCase().includes(label.toLocaleLowerCase()), label);
  const c = await freshCampaign(campaign);
  try {
    const play = await c.turn("Осматриваюсь.", [{ text: "Дождь стучит по доске объявлений.", toolCalls: [] }]);
    assert.equal(play.result.status, "committed");
    const context = play.model.requests[0].system.map((block) => block.text).join("\n");
    assert.match(context, /Campaign language: Russian\./);
    const campaignData = context.slice(context.indexOf("Campaign: "));
    for (const text of [campaign.title, campaign.name, campaign.location, campaign.npc, campaign.adventureTitle, campaign.narration])
      assert.ok(campaignData.includes(text), text);
    for (const english of ["Synthetic", "First Adventure", "ordinary public conversation", "Wayside square", "work organiser", "Rowan"])
      assert.ok(!campaignData.includes(english), english);
  } finally {
    await c.f.db.close();
  }
});

test("the language check flags Latin words in narration and in the game master's records, not IDs or enum values", () => {
  const receipts = [
    { call: { name: "upsert_place", arguments: { localKey: "copper_kettle", name: "Трактир «Медный котелок»", status: "visited", ref: null } } },
    { call: { name: "note_character", arguments: { actorRef: "innkeeper", current: { stress: "settled", goal: "Keep the inn" } } } },
    { call: { name: "roll", arguments: { formula: "1d20+2", reason: "Борьба", actorRef: "00f3e48c-477a-5155-be4a-335728d73fab", visibility: "player" } } },
  ];
  assert.deepEqual(recordTexts(receipts), ["Трактир «Медный котелок»", "Keep the inn", "Борьба"]);
  assert.deepEqual(russianVerdict("Хозяин кивает.", receipts), { fullyRussian: false, narrationLatin: [], recordsLatin: ["Keep", "the", "inn"] });
  assert.deepEqual(russianVerdict("Хозяин кивает: «Okay».", receipts.slice(0, 1)), { fullyRussian: false, narrationLatin: ["Okay"], recordsLatin: [] });
  assert.equal(russianVerdict("Хозяин кивает.", receipts.slice(0, 1)).fullyRussian, true);
  assert.equal(russianVerdict("", []).fullyRussian, false);
});
