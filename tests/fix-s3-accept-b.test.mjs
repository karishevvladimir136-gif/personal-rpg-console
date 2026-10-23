// Fixes from the owner's acceptance pass, block Б — the 2D screen (docs/stages/FIX_S3_ACCEPT.md): Б4 play from the scene
// (the action box under the picture, the same turn path as «Игра», the DM's answer under the picture, the turn's frame
// in it), Б2 the hotspots' text in the campaign's language (and the one-time redo of the older English sheets), Б3 5–8
// hotspots per scene and the mismatch list under «Ещё». Disposable PGlite and stubbed model calls only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { finishSheet, parseSheetReply, poiCandidates, sceneBrief, checkRequest, sceneMismatches, sheetRequest, SHEET_MAX_FEATURES, SHEET_MIN_FEATURES } from "../src/lib/live2d/scene.ts";
import { foreignTexts, needsLanguageRedo, parseRelangReply, relangPoiRows } from "../src/lib/live2d/scene-language.ts";
import { buildSheet, RELANG_MODEL, SHEET_MODEL } from "../src/lib/live2d/server/vision.ts";
import { redoSceneLanguage } from "../src/lib/live2d/server/scene-language-job.ts";
import { parseLive2dBoard, parseSceneSheet } from "../src/lib/live2d/contracts.ts";
import { poiIntent } from "../src/lib/live2d/intents.ts";
import { appendToComposerDraft } from "../src/lib/ui/composer-draft.ts";
import { loadJournal } from "../src/lib/gameplay/client-state.ts";
import { previewPictureBoard } from "../src/lib/ui/preview/stage-v-pictures.ts";
import { LIVE2D_IDS, live2dBoard, live2dPictures, live2dPlacements, live2dPlay, live2dSnapshot } from "../src/lib/ui/preview/live2d-fixture.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// ---- the model, stubbed: each reply in turn; every request kept ------------------------------------------------
function replies(...texts) {
  const requests = [];
  const fetcher = async (_url, init) => {
    const body = JSON.parse(init.body);
    requests.push(body);
    const next = texts[Math.min(requests.length - 1, texts.length - 1)];
    if (next instanceof Error) return { ok: false, status: 529, json: async () => ({ error: { type: "overloaded_error" } }) };
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text: next }], usage: { input_tokens: 1000, output_tokens: 300 } }) };
  };
  return { fetcher, requests };
}
const feature = (key, label, kind, description, brief, mustShow = false) => ({ key, label, kind, description, brief, mustShow });
const ruFeatures = [
  feature("door", "Дверь поста", "entrance", "Тяжёлая дубовая дверь, окованная железом.", "a heavy iron-bound oak door", true),
  feature("window", "Окно", "feature", "Узкое окно с решёткой, за ним горит свеча.", "a narrow barred window lit by a candle", true),
  feature("barrels", "Бочки", "object", "Три бочки у стены, одна с отбитым обручем.", "three barrels by the wall", false),
  feature("road", "Дорога на Берегово", "exit", "Разбитая дорога вниз, к Берегову.", "a rutted road leading down to the town", false),
  feature("fence", "Изгородь", "feature", "Покосившаяся жердевая изгородь вокруг двора.", "a leaning rail fence around the yard", false),
  feature("bell", "Колокольня", "feature", "Колокольня за крышами, колокол молчит.", "a bell tower behind the roofs", true),
];
const sheetJson = (features, more = {}) => JSON.stringify({ summary: "Сторожевой пост у дороги: бревенчатый дом, двор с изгородью, бочки у стены.", features, people: [],
  light: "свеча в окне, сумерки", timeOfDay: "dusk", never: ["второй этаж", "конюшня"], crowded: false, ...more });
const source = { place: { id: "p", name: "Пост стражи", description: "Бревенчатый пост у дороги на Берегово." }, exits: [], present: [], passages: ["У поста стражи бочки, изгородь, за крышами колокольня."], timeOfDay: "at dusk", language: "ru" };

test("Б2: the generator's prompt and output language — the player's hotspot text in Russian, the illustrator's clause in English", async () => {
  const request = sheetRequest(source);
  assert.match(request.system, /Write summary, description, light and never in Russian, the campaign's language; brief is always plain English; labels and names in Russian\./);
  assert.match(request.system, /description: one sentence in the campaign's language for the player/);
  assert.match(request.system, /brief: the same thing as one clause of plain English for the illustrator/);
  assert.match(request.system, /never invent/);
  assert.match(request.user, /Campaign language: Russian\./);
  assert.match(sheetRequest({ ...source, language: "en" }).system, /Write summary, description, light and never in English/);
  // The answer keeps the rule: asked once, stored with the language mark; the hotspot reads Russian, the brief English.
  const model = replies(sheetJson(ruFeatures));
  const built = await buildSheet("key", source, { fetcher: model.fetcher });
  assert.equal(model.requests.length, 1);
  assert.equal(model.requests[0].model, SHEET_MODEL);
  assert.equal(built.asks, 1);
  assert.equal(built.sheet.language, "ru");
  assert.deepEqual(foreignTexts(built.sheet, "ru"), []);
  const brief = sceneBrief(built.sheet, { placeName: "Пост стражи", style: "" });
  assert.match(brief, /MUST SHOW.*a heavy iron-bound oak door \(Дверь поста\).*a narrow barred window lit by a candle \(Окно\)/);
  assert.match(brief, /Also there, where the layout puts it: three barrels by the wall; a rutted road/);
  assert.doesNotMatch(brief, /Тяжёлая дубовая дверь/, "the player's sentence is not the illustrator's clause");
  const snapshot = { campaign: { id: "c" }, locations: [], entities: [] };
  const candidates = poiCandidates(built.sheet, snapshot, "p", null);
  assert.equal(candidates[0].note, "Тяжёлая дубовая дверь, окованная железом.", "the hotspot says it in Russian");
  assert.equal(candidates[0].description, "a heavy iron-bound oak door", "the locator reads the English clause");
  assert.match(checkRequest(built.sheet, "Пост стражи").system, /Write each contradiction's what and detail in Russian/);
  assert.match(checkRequest(built.sheet, "Пост стражи").text, /door — a heavy iron-bound oak door/);
  // An older stored sheet (plain English description, no brief) still reads: the description is the illustrator's clause.
  const old = parseSceneSheet({ summary: "A guard post.", features: [{ key: "door", label: "Дверь поста", kind: "entrance", description: "The main door of the guard post", mustShow: true }], people: [], light: "", never: [], crowded: false });
  assert.equal(old.language, undefined);
  assert.equal(old.features[0].brief, undefined);
  assert.match(sceneBrief(old, { placeName: "Пост", style: "" }), /MUST SHOW.*The main door of the guard post \(Дверь поста\)/);
  // An answer in English for a Russian campaign is asked again once; the Russian one stays.
  const english = ruFeatures.map((row) => ({ ...row, description: row.brief }));
  const twice = replies(sheetJson(english, { summary: "A guard post by the road.", light: "a candle", never: ["a second floor"] }), sheetJson(ruFeatures));
  const fixed = await buildSheet("key", source, { fetcher: twice.fetcher });
  assert.equal(twice.requests.length, 2);
  assert.deepEqual(twice.requests[1].messages.map((row) => row.role), ["user", "assistant", "user"], "the second ask carries the first answer and the correction");
  assert.match(twice.requests[1].messages[2].content, /must be in Russian, the campaign's language \(brief stays English\); these are not: «A guard post by the road\.»/);
  assert.equal(fixed.sheet.features[0].description, "Тяжёлая дубовая дверь, окованная железом.");
  assert.equal(fixed.sheet.language, "ru");
  assert.equal(fixed.costUsdMicros, 2 * (1000 * 2 + 300 * 10), "both asks are paid for and reported");
  // Still English after the second ask: kept (better than nothing) but unmarked, so the one-time redo picks it up.
  const stubborn = replies(sheetJson(english, { summary: "A guard post." }));
  const kept = await buildSheet("key", source, { fetcher: stubborn.fetcher });
  assert.equal(stubborn.requests.length, 2, "asked again once, never a third time");
  assert.equal(kept.sheet.language, undefined);
  assert.equal(needsLanguageRedo(kept.sheet, "ru"), true);
  // An English campaign reads English: never asked again for its language.
  const en = replies(sheetJson(english, { summary: "A guard post." }));
  const english1 = await buildSheet("key", { ...source, language: "en" }, { fetcher: en.fetcher });
  assert.equal(en.requests.length, 1);
  assert.equal(english1.sheet.language, "en");
});

test("Б3: 5–8 hotspots — the rule with its minimum in the prompt, a short sheet asked again once, the better answer kept, more than 8 trimmed", async () => {
  assert.equal(SHEET_MIN_FEATURES, 5);
  assert.equal(SHEET_MAX_FEATURES, 8);
  const request = sheetRequest(source);
  assert.match(request.system, /features: 5–8 hotspots, never fewer than 5 — every thing a player would look at or walk to here/);
  for (const thing of ["a door", "windows", "a fence", "the houses and sheds around", "barrels", "the road", "a bell tower"]) assert.ok(request.system.includes(thing), thing);
  // Short (3) → asked again → 6: the six stay.
  const short = replies(sheetJson(ruFeatures.slice(0, 3)), sheetJson(ruFeatures));
  const grown = await buildSheet("key", source, { fetcher: short.fetcher });
  assert.equal(short.requests.length, 2);
  assert.match(short.requests[1].messages[2].content, /It has 3 features; the rule is 5–8: add every thing a player would look at or walk to here/);
  assert.equal(grown.sheet.features.length, 6);
  assert.equal(grown.asks, 2);
  // Short again with fewer: the first answer stays; a failed second ask keeps the first too; never a third ask.
  const worse = replies(sheetJson(ruFeatures.slice(0, 3)), sheetJson(ruFeatures.slice(0, 2)));
  assert.equal((await buildSheet("key", source, { fetcher: worse.fetcher })).sheet.features.length, 3);
  assert.equal(worse.requests.length, 2);
  const down = replies(sheetJson(ruFeatures.slice(0, 3)), new Error("down"));
  const soft = await buildSheet("key", source, { fetcher: down.fetcher });
  assert.equal(soft.sheet.features.length, 3);
  assert.equal(soft.error, null);
  // More than 8: trimmed to 8, the must-show ones kept wherever they stood; a person's spot only at a kept feature.
  const many = [...Array.from({ length: 9 }, (_, index) => feature(`f${index}`, `Вещь ${index}`, "object", `Вещь номер ${index}.`, `thing ${index}`)), feature("altar", "Алтарь", "object", "Каменный алтарь.", "a stone altar", true)];
  const sheet = parseSheetReply(sheetJson(many, { people: [{ name: "Жрица", entityId: null, at: "f8" }] }));
  const trimmed = finishSheet(sheet, "ru");
  assert.equal(trimmed.features.length, 8);
  assert.ok(trimmed.features.some((row) => row.key === "altar"), "the must-show feature is kept");
  assert.equal(trimmed.people[0].at, null, "the dropped feature's person stands nowhere in particular");
  // The wiring: prepare and redraw write the sheet through the same builder; a redraw of a sheet written before the
  // rule (fewer than 5) asks for a new sheet first, so the new hotspots are drawn into the new picture.
  const scenes = src("src/lib/live2d/server/scenes.ts");
  const redraw = scenes.slice(scenes.indexOf("export async function redrawScene"), scenes.indexOf("export async function readBoardInLanguage"));
  assert.match(redraw, /if \(existing\.sheet\.features\.length < SHEET_MIN_FEATURES\) \{\s*const written = await writeSheet\(campaignId, await readCampaign\(campaignId\), locationId\);/);
  assert.match(redraw, /if \(written\.model && written\.sheet\.features\.length > existing\.sheet\.features\.length\)\s*sheet = \(await saveScene\(ctx, \{ locationId, sheet: written\.sheet, source: "model", expectedRevision: existing\.revision \}\)\)\.sheet;/);
  assert.match(redraw, /schedule\(\(\) => drawAndCheck\(ctx, pictures, campaignId, locationId, sheet, \{ comment, redraws: existing\.redraws \+ 1, extraCostUsdMicros: sheetCost \}\)\);/);
  assert.equal((scenes.match(/await buildSheet\(/g) ?? []).length, 1, "one builder for both");
});

// ---- the screen, rendered (the loader of tests/live2d-ui.test.mjs) ------------------------------------------------
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../src/", import.meta.url));
let language = "ru";
const stubs = {
  [resolve(root, "components/language-context.tsx")]: { useLanguage: () => ({ language, setLanguage() {}, t: (phrase) => russianOf(phrase) }), LanguageProvider: ({ children }) => children },
  "next/link": { __esModule: true, default: ({ href, children, ...rest }) => createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children) },
  "next/image": { __esModule: true, default: (props) => createElement("img", { src: props.src, alt: props.alt ?? "" }) },
  "next/navigation": { usePathname: () => "/campaigns/x/live", useRouter: () => ({ push() {}, replace() {} }), useSearchParams: () => new URLSearchParams() },
  "server-only": {},
};
const russian = JSON.parse(readFileSync(new URL("../src/lib/locales/ru.json", import.meta.url), "utf8"));
const russianOf = (phrase) => (language === "ru" ? russian[phrase] ?? phrase : phrase);
function loader() {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
    const loaded = { exports: {} };
    cache.set(path, loaded.exports);
    const file = (target) => (existsSync(target) && !target.endsWith("/") ? target : existsSync(`${target}.tsx`) ? `${target}.tsx` : existsSync(`${target}.ts`) ? `${target}.ts` : `${target}/index.tsx`);
    const localRequire = (name) => {
      if (name in stubs) return stubs[name];
      if (name.endsWith(".css")) return new Proxy({}, { get: (_, key) => (typeof key === "string" ? key : "") });
      if (name.startsWith("@/") || name.startsWith(".")) {
        const target = file(name.startsWith("@/") ? resolve(root, name.slice(2).replace(/\.tsx?$/, "")) : resolve(dirname(path), name.replace(/\.tsx?$/, "")));
        return target in stubs ? stubs[target] : load(target);
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports) { ${output}\n })`, { filename: path })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  return load;
}
const load = loader();
const { Live2dScreen } = load(resolve(root, "components/live2d/live2d-screen.tsx"));
const { ScenePlay, SceneFrame } = load(resolve(root, "components/live2d/scene-play.tsx"));
const { LanguageProvider } = load(resolve(root, "components/language-context.tsx"));
const { PreviewPictures } = load(resolve(root, "components/registry/live-frames.tsx"));
const { CampaignDataPreview } = load(resolve(root, "components/persistence-context.tsx"));
const refuse = { board: () => assert.fail("render must not read"), send: () => assert.fail("render must not send") };
const wrap = (snapshot, pictures, child) => renderToStaticMarkup(createElement(LanguageProvider, null,
  createElement(CampaignDataPreview, { snapshot, refresh: async () => {} }, createElement(PreviewPictures, pictures, child))));
const screen = (preview, { snapshot = live2dSnapshot(), play = live2dPlay(), pictures = live2dPictures } = {}) =>
  wrap(snapshot, { board: pictures.board, images: pictures.images }, createElement(Live2dScreen, { snapshot, play, transport: refuse,
    preview: { board: live2dBoard, placements: live2dPlacements, images: pictures.images, ...preview } }));

test("Б3: the mismatch list behind «Картинка не сошлась с записями» is shown under «Ещё» — misses, inventions, people, a check that gave no answer", () => {
  const scene = live2dBoard.scenes[0];
  const check = { ...scene.check, contradictions: [{ what: "вторая дверь", detail: "в левой стене" }], peopleInBackground: true };
  const flagged = { ...scene, status: "flagged", check };
  assert.deepEqual(sceneMismatches(flagged), { missing: ["Часовня"], extra: [{ what: "вторая дверь", detail: "в левой стене" }], people: true, checkError: null });
  assert.equal(sceneMismatches({ ...scene, check: { ...scene.check, items: scene.check.items.map((row) => ({ ...row, visible: true, x: 0.5, y: 0.5 })) } }), null, "a scene that kept the sheet lists nothing");
  assert.deepEqual(sceneMismatches({ ...scene, status: "flagged", check: null, error: "check: unparsable" }).checkError, "unparsable", "no check is no pass: the reason is named");
  assert.equal(sceneMismatches({ ...scene, status: "flagged", check: null, error: "check: HTTP 529: overloaded_error" }).checkError, "unavailable");
  const html = screen({ board: { ...live2dBoard, scenes: [flagged] } });
  assert.ok(html.includes("Что не сошлось, перечислено в «Ещё»."), "the warning says where the list is");
  const more = html.slice(html.indexOf(">Ещё</summary>"));
  assert.ok(more.includes('data-testid="scene-mismatches"'), "the list is under «Ещё»");
  assert.ok(more.includes("Нет на картинке: Часовня"));
  assert.ok(more.includes("Лишнее на картинке: вторая дверь — в левой стене"));
  assert.ok(more.includes("На картинке нарисованы люди"));
  const unchecked = screen({ board: { ...live2dBoard, scenes: [{ ...scene, status: "flagged", check: null, error: "check: unparsable" }] } });
  assert.ok(unchecked.includes("Картинку не проверили: ответ проверки не прочитался"));
  const kept = { ...scene, check: { ...scene.check, items: scene.check.items.map((row) => ({ ...row, visible: true, x: 0.5, y: 0.5 })) } };
  assert.ok(!screen({ board: { ...live2dBoard, scenes: [kept] } }).includes('data-testid="scene-mismatches"'), "a scene that kept its sheet shows no list");
});

// ---- Б2: the one-time redo of the older sheets, on PGlite with the model stubbed ------------------------------------
test("Б2: an older English scene sheet is redone once in the campaign's language — the hotspots follow, the owner's note, the status and the battle background stay; never twice", async () => {
  const { fixture, world } = await import("./phase35-storage-fixture.mjs");
  const f = await fixture();
  try {
    const w = await world(f);
    const call = (action, payload = {}) => f.one("select public.rpg_live2d($1,$2,$3,$4::jsonb) result", [f.owner, w.cid, action, JSON.stringify(payload)]).then((row) => row.result);
    const pictures = (action, payload) => f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [f.owner, w.cid, action, JSON.stringify(payload)]).then((row) => row.result);
    // The guard post as session 2 left it: an English sheet, a checked picture, hotspots with English notes, a battle background.
    const english = { summary: "A log guard post by the road.", features: [
      { key: "door", label: "Дверь поста", kind: "entrance", description: "The main door of the guard post", mustShow: true, targetLocationId: null },
      { key: "window", label: "Окно", kind: "feature", description: "A barred window", mustShow: true, targetLocationId: null },
      { key: "barrels", label: "Бочки", kind: "object", description: "Barrels by the wall", mustShow: false, targetLocationId: null },
    ], people: [], light: "a candle in the window", timeOfDay: "dusk", never: ["a second floor"], crowded: false };
    await call("scene.save", { locationId: w.location, sheet: english, source: "model", expectedRevision: null });
    const fence = await f.fence(w.cid);
    const picture = await pictures("picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "location", subjectId: w.location, composition: "scene", timeline: fence,
      tier: "quality", trigger: "manual", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: null, prompt: "A scene.", referenceIds: [] });
    const checkResult = { model: "m", items: [], contradictions: [], peopleInBackground: false, costUsdMicros: 0, checkedAt: "2026-10-20T00:00:00Z" };
    await call("scene.update", { locationId: w.location, status: "checked", pictureId: picture.id, check: checkResult, sideList: [] });
    const poi = (key, note, more = {}) => ({ id: randomUUID(), key, kind: key === "door" ? "exit" : "object", label: english.features.find((row) => row.key === key).label, note,
      entityId: null, targetLocationId: null, x: 0.4, y: 0.6, confidence: 0.9, approximate: false, source: "locator", hidden: false, ...more });
    const placed = await call("poi.replace", { locationId: w.location, pois: [poi("door", "The main door of the guard post"), poi("window", "A barred window"), poi("barrels", "Barrels by the wall")] });
    // The owner moved the barrels and wrote his own note: the highest authority.
    const barrels = placed.find((row) => row.key === "barrels");
    await call("poi.save", { id: barrels.id, expectedRevision: barrels.revision, x: 0.1, y: 0.8, hidden: false, note: "Здесь прячут контрабанду." });
    await call("battle.save", { locationId: w.location, sheetRevision: 1, pictureId: picture.id, status: "ready", check: checkResult, grid: { cols: 24, rows: 18, feetPerCell: 5 } });
    const board = parseLive2dBoard(await call("read"));
    assert.equal(needsLanguageRedo(board.scenes[0].sheet, "ru"), true);
    assert.equal(needsLanguageRedo(board.scenes[0].sheet, "en"), false, "an English campaign reads it as it is");
    const answer = JSON.stringify({ summary: "Бревенчатый сторожевой пост у дороги.", light: "свеча в окне", never: ["второй этаж"], features: [
      { key: "door", description: "Главная дверь сторожевого поста." }, { key: "window", description: "Окно с решёткой." }, { key: "barrels", description: "Бочки у стены." }] });
    const model = replies(answer);
    const rpc = (action, payload) => call(action, payload);
    const result = await redoSceneLanguage(board, w.location, { rpc, apiKey: "key", language: "ru", placeName: "Пост стражи", options: { fetcher: model.fetcher } });
    assert.equal(result.status, "redone", JSON.stringify(result));
    assert.equal(model.requests.length, 1);
    assert.equal(model.requests[0].model, RELANG_MODEL, "the cheap model");
    assert.match(model.requests[0].system, /in Russian/);
    assert.equal(result.costUsdMicros, Math.round(1000 * 0.1 + 300 * 0.5));
    const after = parseLive2dBoard(await call("read"));
    const scene = after.scenes[0];
    assert.equal(scene.sheet.language, "ru");
    assert.equal(scene.revision, 2);
    assert.deepEqual(scene.sheet.features.map((row) => [row.description, row.brief]), [
      ["Главная дверь сторожевого поста.", "The main door of the guard post"], ["Окно с решёткой.", "A barred window"], ["Бочки у стены.", "Barrels by the wall"]], "the English clause stays for the illustrator");
    assert.equal(scene.sheet.summary, "Бревенчатый сторожевой пост у дороги.");
    assert.deepEqual(scene.sheet.never, ["второй этаж"]);
    assert.deepEqual([scene.status, scene.pictureId, scene.check?.model], ["checked", picture.id, "m"], "the scene keeps its picture, check and status");
    const notes = Object.fromEntries(after.pois.map((row) => [row.key, [row.note, row.x, row.y, row.source]]));
    assert.deepEqual(notes.door, ["Главная дверь сторожевого поста.", 0.4, 0.6, "locator"], "the hotspot says it in Russian, in the same place");
    assert.deepEqual(notes.window[0], "Окно с решёткой.");
    assert.deepEqual(notes.barrels, ["Здесь прячут контрабанду.", 0.1, 0.8, "owner"], "the owner's note and spot stay");
    assert.equal(after.battleMaps[0].sheetRevision, 2, "the battle background stays current: no redraw for a change of words");
    assert.equal(after.battleMaps[0].pictureId, picture.id);
    const versions = await f.query("select revision, source, sheet->'features'->0->>'description' d from rpg_private.live2d_scene_versions where campaign_id=$1 order by revision", [w.cid]);
    assert.deepEqual(versions, [{ revision: 1, source: "model", d: "The main door of the guard post" }, { revision: 2, source: "model", d: "Главная дверь сторожевого поста." }], "history keeps the English sheet");
    // Never twice: the marked sheet is not due; no call is made.
    const again = await redoSceneLanguage(after, w.location, { rpc, apiKey: "key", language: "ru", placeName: "Пост стражи", options: { fetcher: model.fetcher } });
    assert.deepEqual([again.status, again.reason], ["skipped", "in_language"]);
    assert.equal(model.requests.length, 1);
  } finally {
    await f.db.close();
  }
});

test("Б2: the redo is failure-safe — a failed or partial answer, no key, a drawing scene write nothing; the 2D screen's read runs it once, off the turn's path", async () => {
  const sheet = parseSceneSheet({ summary: "A guard post.", features: [{ key: "door", label: "Дверь", kind: "entrance", description: "The main door", mustShow: true }], people: [], light: "", never: [], crowded: false });
  const board = { campaignId: "c", settings: { markers: "standard", revision: 0 }, scenes: [{ locationId: "l", revision: 3, sheet, status: "flagged", pictureId: null, check: null, sideList: [], redraws: 0, error: null, updatedAt: "x" }], pois: [], regionMaps: [], battleMaps: [] };
  const rpc = async () => assert.fail("nothing is written");
  const deps = (fetcher, apiKey = "key") => ({ rpc, apiKey, language: "ru", placeName: "Пост", options: { fetcher } });
  assert.equal((await redoSceneLanguage(board, "l", deps(replies(new Error("down")).fetcher))).status, "failed");
  assert.equal((await redoSceneLanguage(board, "l", deps(replies('{"summary":"Пост.","features":[]}').fetcher))).status, "failed", "a reply that leaves a hotspot in English writes nothing");
  assert.equal((await redoSceneLanguage(board, "l", deps(replies('{"summary":"A post.","features":[{"key":"door","description":"The door"}]}').fetcher))).status, "failed");
  assert.deepEqual((await redoSceneLanguage(board, "l", deps(replies("{}").fetcher, ""))).reason, "not_configured");
  assert.deepEqual((await redoSceneLanguage({ ...board, scenes: [{ ...board.scenes[0], status: "drawing" }] }, "l", deps(replies("{}").fetcher))).reason, "drawing");
  assert.equal(parseRelangReply('{"summary":"Пост.","features":[{"key":"door","description":"Главная дверь."}]}', sheet, "ru").features[0].brief, "The main door");
  const rows = relangPoiRows([{ id: "p1", locationId: "l", key: "door", kind: "exit", label: "Дверь", note: "The main door", entityId: null, targetLocationId: null, x: 0.2, y: 0.3, confidence: 0.8, approximate: false, source: "owner", hidden: true, revision: 2, updatedAt: "x" }],
    "l", sheet, { ...sheet, features: [{ ...sheet.features[0], description: "Главная дверь." }] });
  assert.deepEqual([rows.changed, rows.rows[0].note, rows.rows[0].x, rows.rows[0].hidden, rows.rows[0].source], [true, "Главная дверь.", 0.2, true, "owner"], "an owner's dragged marker keeps its spot; the note was the old text, so it follows");
  // The wiring: the GET of the 2D board runs it, once per scene revision and server process, waits a few seconds at most,
  // and any failure returns the board as it is (never the turn's path: the play route is untouched).
  const route = src("src/app/api/campaigns/[campaignId]/live2d/route.ts");
  assert.match(route, /return publicJson\(await readBoardInLanguage\(\(await context\.params\)\.campaignId\)\);/);
  const scenes = src("src/lib/live2d/server/scenes.ts");
  const read = scenes.slice(scenes.indexOf("export async function readBoardInLanguage"));
  assert.match(read, /!scene\.sheet\.language && scene\.status !== "drawing" && !languageExamined\.has\(mark\(scene\)\)/);
  assert.match(read, /for \(const scene of due\) languageExamined\.add\(mark\(scene\)\);/);
  assert.match(read, /export async function readBoardInLanguage\(campaignId: string, waitMs = 12_000\)/);
  assert.match(read, /\} catch \(error\) \{[\s\S]*return board;\s*\}/);
  assert.doesNotMatch(src("src/lib/server/gameplay-service.ts"), /readBoardInLanguage|redoSceneLanguage/);
});

// ---- Б4: play from the 2D screen ----------------------------------------------------------------------------------
test("Б4: a turn sent from the 2D route commits and renders — the hotspot fills the shared draft, the DM loop commits it, the answer with its rolls and the companion's chip stands under the picture, the frame lands in the scene", async () => {
  const { loopCampaign } = await import("./dm-loop-fixture.mjs");
  const { createScriptedDmModel } = await import("../src/lib/gameplay/dm-loop/scripted-model.ts");
  const c = await loopCampaign({ language: "ru" });
  try {
    // Тобин travels with the hero (an earlier turn put him in the party).
    const joined = await c.turn("Зову Тобина с собой.", [{ text: "Тобин закидывает мешок на плечо. ", toolCalls: [
      { name: "upsert_character", arguments: { localKey: "tobin", name: "Тобин", kind: "companion", party: true, present: true, maxHp: 11 } },
      { name: "finish_turn", arguments: { sceneKinds: ["quiet"], spotlight: [], playerMoment: false } }] }]);
    assert.equal(joined.result.status, "committed", JSON.stringify(c.errors));
    const tobin = (await c.state()).entities.find((row) => row.name === "Тобин").id;
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const before = await store.readPlay(c.cid);
    // 1. The click on a hotspot writes the words into the draft «Игра» keeps — the very key the box under the scene
    //    reads (mode «game», no companion, the campaign's timeline), so the owner edits and sends them there.
    const draft = new Map();
    const storage = { getItem: (key) => draft.get(key) ?? null, setItem: (key, value) => { draft.set(key, value); }, removeItem: (key) => { draft.delete(key); } };
    const words = poiIntent({ kind: "object", label: "Ворота пристани" }, "ru");
    assert.equal(words, "Осматриваю Ворота пристани.");
    assert.equal(appendToComposerDraft(storage, { campaignId: c.cid, mode: "game", companionId: null, timeline: before.timeline, text: words }), true);
    assert.equal(loadJournal(storage, c.cid, "game", null, before.timeline).text, words, "the box under the scene opens with the hotspot's words");
    // 2. The send: the same request the composer makes (a new operation, the play's revision, mode «game») through the
    //    DM loop the play route runs; a visible roll for the hero, a roll for the companion, committed.
    const played = await c.turn(words, [
      { text: "Ворота пристани скрипят на ветру. ", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "Внимательность: следы у ворот", actorRef: c.hero, visibility: "player", dc: 12, kind: "skill" } },
        { name: "roll", arguments: { formula: "1d20", reason: "Внимательность: засов", actorRef: tobin, visibility: "player", dc: 10, kind: "skill" } },
      ] },
      { text: "На засове свежая смола — ворота открывали этой ночью.", toolCalls: [{ name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } }] },
    ], { dice: [15, 9] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(played.input.input, words);
    assert.equal(played.input.mode, "game");
    const play = { ...(await store.readPlay(c.cid)), configured: true };
    const turn = play.turns.find((row) => row.id === played.input.operationId);
    assert.equal(turn.status, "committed");
    // 3. The answer under the picture: the 2D box renders the committed turn the way «Игра» does — the owner's words,
    //    the DM's narration, the hero's roll card, the companion's chip — and the action box; the frame is not repeated
    //    in the turn (it is in the picture).
    const snapshot = await c.f.snapshot();
    const frames = previewPictureBoard({ campaignId: c.cid, worldId: randomUUID(), timeline: play.timeline, at: (minute) => new Date(Date.UTC(2026, 9, 23, 9, minute)).toISOString(),
      style: { id: randomUUID(), scope: "campaign", preset: "watercolor", label: "Гуашь" }, anchors: [], frames: [{ id: randomUUID(), turnId: turn.id, image: "/preview/frame-gate.jpg" }] });
    const html = wrap(snapshot, frames, createElement(ScenePlay, { snapshot, play, nonce: 1, live: null, onLiveView() {}, preview: false }));
    assert.ok(html.includes('data-testid="scene-play"'));
    assert.ok(html.includes(words), "the owner's words");
    assert.ok(html.includes("Ворота пристани скрипят на ветру.") && html.includes("На засове свежая смола"), "the DM's narration");
    assert.match(html, /<section class="gameplay-check moment-card success[^"]*" aria-label="Внимательность: следы у ворот">[\s\S]*?<strong class="moment-total">15<\/strong>/, "the hero's roll card, from the server's die");
    assert.match(html, /<strong>Тобин<\/strong> · Внимательность: засов: кубик 9 → 9 против 10 — не вышло/, "the companion's chip with his die");
    const at = (needle) => html.indexOf(needle);
    assert.ok(at(words) < at("Ворота пристани скрипят") && at("Ворота пристани скрипят") < at("gameplay-check") && at("gameplay-check") < at("<strong>Тобин") && at("<strong>Тобин") < at("На засове") && at("На засове") < at("<textarea"),
      "told in order — the words, the narration, the card, the chip, the rest — and the action box after the answer");
    assert.match(html, /<button type="submit"[^>]*>(?:<svg[\s\S]*?<\/svg>)?Отправить<\/button><a href="\/campaigns\/[^"]+\/game"[^>]*>(?:<svg[\s\S]*?<\/svg>)?Весь текст<\/a>/, "«Отправить» sends from here; «Игра» stays one click away");
    assert.ok(!html.includes('data-testid="turn-frame"'), "the frame is not repeated in the turn");
    const frame = wrap(snapshot, frames, createElement(SceneFrame, { play, live: null }));
    assert.ok(frame.includes('data-testid="scene-frame"') && frame.includes("/preview/frame-gate.jpg"), "the turn's frame lands in the scene");
    assert.equal(wrap(snapshot, { ...frames, board: { ...frames.board, pictures: [] } }, createElement(SceneFrame, { play, live: null })), "", "no frame yet: the picture stays clear");
  } finally {
    await c.f.db.close();
  }
  // 4. On the screen: at the scene, the box stands under the picture (after the hotspots, before «Ещё»), the frame inside
  //    the picture where the party stands; elsewhere it is not shown.
  const at = screen({}, { pictures: { ...live2dPictures, board: { ...live2dPictures.board, pictures: [...live2dPictures.board.pictures, { ...live2dPictures.board.pictures.find((row) => row.composition === "scene"), id: "f1", kind: "frame", subjectKind: "turn", subjectId: LIVE2D_IDS.turnTalk, composition: "frame" }] }, images: { ...live2dPictures.images, f1: "/preview/live2d/frame.jpg" } } });
  const stageEnd = at.indexOf('data-testid="scene-play"');
  assert.ok(at.indexOf('data-poi="well"') < stageEnd && stageEnd < at.indexOf(">Ещё</summary>"), "picture → answer and box → «Ещё»");
  assert.ok(at.indexOf('data-testid="scene-frame"') > 0 && at.indexOf('data-testid="scene-frame"') < stageEnd, "the frame is in the picture");
  assert.ok(at.includes("Колодец, кузня, прилавки. Тобин уже у воды."), "the preview shows the last answer under the scene");
  assert.ok(!screen({ level: "region", anchorId: LIVE2D_IDS.market }).includes('data-testid="scene-play"'), "the region has no box");
  // 5. The same path, by construction: the box is «Игра»'s composer (no second sender), fed by the play runtime «Игра»
  //    uses; a hotspot on the scene fills it, not the text screen's.
  const play2d = src("src/components/live2d/scene-play.tsx");
  assert.match(play2d, /<GameplayComposer\s+key=\{nonce\}\s+play=\{play\}\s+mode="game"\s+compact\s+onSaved=\{onSaved\}/);
  assert.match(play2d, /resolveSend=\{resolveSend\}/);
  assert.match(play2d, /onLiveView=\{onLiveView\}/);
  assert.match(play2d, /useLiveFrameTrigger\(live, play, pictures\);/, "the frame is asked for as on «Игра»");
  assert.match(play2d, /const \{ resolveSend, chip, setDraft \} = useAddressee\(\{ present, combat \}\);/, "the addressee decides the mode as on «Игра»");
  assert.doesNotMatch(play2d, /sendTurn|resumeTurn|fetch\(|readJson/, "no second way to send a turn");
  assert.match(src("src/components/live2d/route.tsx"), /const runtime = useGameplayRuntime\(\);\s*return <Live2dScreen snapshot=\{data\} play=\{runtime\.play\} onSaved=\{runtime\.afterMutation\} \/>;/);
  const live2d = src("src/components/live2d/live2d-screen.tsx");
  assert.match(live2d, /if \(written && level === "scene"\) \{ setSceneDraft\(\(value\) => value \+ 1\); setNote\(null\); return; \}/);
  assert.match(live2d, /<ScenePlay snapshot=\{snapshot\} play=\{play\} onSaved=\{onSaved\} nonce=\{draftNonce\} live=\{live\} onLiveView=\{setLive\} preview=\{preview\} \/>/);
  assert.match(live2d, /\{location\.id === snapshot\.publicState\.current_location_id && <SceneFrame play=\{play\} live=\{live\} \/>\}/);
  assert.match(src("src/components/registry/game-screen.tsx"), /useTurnAftermath\(\{ play, live, mode, dmSettings, forceMoment: !!preview\?\.playerMoment \}\)/, "«Игра» and the scene share the turn's aftermath");
});
