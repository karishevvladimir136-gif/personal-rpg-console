// 2D Live, part 1c: the model calls of the 2D layer over a stubbed fetch — the
// sheet, the strong check, the cheap locator and the private seeds — report
// their usage and cost, parse strictly, and fail soft (never throw) on a bad
// reply or a transport error. No key, no network.
import test from "node:test";
import assert from "node:assert/strict";
import { buildSheet, checkScene, locateScene, draftSeeds, parseSeedsReply, seedsRequest, costUsdMicros, CHECK_MODEL, LOCATOR_MODEL, SHEET_MODEL } from "../src/lib/live2d/server/vision.ts";

const reply = (text, usage = { input_tokens: 1000, output_tokens: 200 }) => async (_url, init) => {
  const body = JSON.parse(init.body);
  reply.last = body;
  return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text }], usage }) };
};
const failing = async () => ({ ok: false, status: 529, json: async () => ({ error: { type: "overloaded_error" } }) });
const picture = { bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 1, 2, 3]), contentType: "image/jpeg" };
const source = { place: { id: "p", name: "Брод", description: "Мелкий брод через реку." }, exits: [], present: [], passages: ["У брода вода бьёт по камням."], timeOfDay: "in the morning", language: "ru" };
// Fix S3-accept Б2/Б3: a sheet that keeps the rule (5–8 hotspots, the player's text in the campaign's language) is asked once;
// a short or English one is asked again (tests/fix-s3-accept-b.test.mjs).
const feature = (key, label, kind, description, brief) => ({ key, label, kind, description, brief, mustShow: true });
const sheetJson = JSON.stringify({ summary: "Мелкий брод.", features: [feature("shoal", "Отмель", "feature", "Каменистая отмель.", "a stony shoal"), feature("post", "Столб", "object", "Дорожный столб.", "a signpost"),
  feature("bank", "Берег", "feature", "Пологий берег.", "a low bank"), feature("road", "Дорога", "exit", "Дорога к броду.", "the road to the ford"), feature("willow", "Ива", "object", "Старая ива.", "an old willow")],
people: [], light: "утреннее солнце", timeOfDay: "morning", never: ["мост"], crowded: false });

test("the sheet call: Sonnet, strict JSON, cost from the usage, soft failure", async () => {
  const fetcher = reply(sheetJson);
  const built = await buildSheet("key", source, { fetcher });
  assert.equal(reply.last.model, SHEET_MODEL);
  assert.match(reply.last.system, /never invent/);
  assert.equal(built.sheet.features.length, 5);
  assert.equal(built.asks, 1, "a sheet that keeps the rule is asked once");
  assert.equal(built.costUsdMicros, costUsdMicros(SHEET_MODEL, { inputTokens: 1000, outputTokens: 200 }));
  assert.equal(built.costUsdMicros, 4000, "1000 in at $2 + 200 out at $10 per million");
  const bad = await buildSheet("key", source, { fetcher: reply("not json") });
  assert.equal(bad.sheet, null);
  assert.equal(bad.error, "unparsable");
  const down = await buildSheet("key", source, { fetcher: failing });
  assert.equal(down.sheet, null);
  assert.match(down.error, /HTTP 529/);
  const off = await buildSheet("", source, { fetcher: reply(sheetJson) });
  assert.equal(off.error, "not_configured");
});

test("the check: the strong model sees the picture and answers per required key; the locator never returns a key outside the list", async () => {
  const sheet = { summary: "A ford.", features: [{ key: "shoal", label: "Отмель", kind: "feature", description: "a stony shoal", mustShow: true, targetLocationId: null }, { key: "post", label: "Столб", kind: "object", description: "a signpost", mustShow: true, targetLocationId: null }], people: [], light: "", timeOfDay: null, never: [], crowded: false };
  const fetcher = reply('{"items":[{"key":"shoal","visible":true,"x":0.5,"y":0.5,"confidence":0.9},{"key":"post","visible":false}],"contradictions":[],"peopleInBackground":false}');
  const checked = await checkScene("key", sheet, "Брод", picture, { fetcher });
  assert.equal(reply.last.model, CHECK_MODEL);
  assert.equal(reply.last.messages[0].content[1].type, "image");
  assert.equal(reply.last.messages[0].content[1].source.media_type, "image/jpeg");
  assert.deepEqual(checked.check.items.map((row) => [row.key, row.visible]), [["shoal", true], ["post", false]]);
  assert.ok(checked.costUsdMicros > 0);
  const located = await locateScene("key", [{ key: "shoal", kind: "feature", label: "Отмель", note: "", description: "a stony shoal", entityId: null, targetLocationId: null, at: null }], "Брод", picture,
    { fetcher: reply('{"positions":[{"key":"shoal","x":0.4,"y":0.6,"confidence":0.8},{"key":"tower","x":0.1,"y":0.1,"confidence":1}]}') });
  assert.equal(reply.last.model, LOCATOR_MODEL);
  assert.deepEqual(located.located, [{ key: "shoal", x: 0.4, y: 0.6, confidence: 0.8 }]);
  const none = await locateScene("key", [], "Брод", picture, { fetcher: reply("{}") });
  assert.deepEqual(none.located, []);
  assert.equal(none.costUsdMicros, 0, "no features: no call");
});

test("seeds: the request asks for private hooks only; the reply parses to at most five themed premises", async () => {
  const request = seedsRequest({ areaName: "Серый тракт", description: "Дорога на юг.", canon: "", places: ["Брод", "Таверна"], language: "ru" });
  assert.match(request.system, /private notebook/);
  assert.match(request.user, /Known places in it: Брод, Таверна/);
  const seeds = parseSeedsReply('{"seeds":[{"theme":"Старое кладбище","premise":"Там что-то есть."},{"theme":"","premise":"x"},{"theme":"A","premise":"B"},{"theme":"C","premise":"D"},{"theme":"E","premise":"F"},{"theme":"G","premise":"H"},{"theme":"I","premise":"J"}]}');
  assert.equal(seeds.length, 5);
  assert.equal(seeds[0].theme, "Старое кладбище");
  const drafted = await draftSeeds("key", { areaName: "x", description: "", canon: "", places: [], language: "en" }, { fetcher: reply('{"seeds":[{"theme":"A mine","premise":"Sealed for a reason."}]}') });
  assert.equal(drafted.seeds.length, 1);
  assert.equal(drafted.error, null);
});
