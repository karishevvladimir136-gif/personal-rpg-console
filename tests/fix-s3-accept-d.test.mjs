// Fix S3-accept, block Д — the map (docs/stages/FIX_S3_ACCEPT.md, the owner's design 19:36–19:44):
// Д1 the map is a tree of places with breadcrumbs, «Карта» opens it, the old atlas's tools under one «Ещё»;
// Д3 the DM designs the region first (public part in the canon, hidden part in the DM's private notes), the painter
// paints from it, the markers sit on their objects and are checked like the scenes; Д2 the forced redraw stays.
// Synthetic Russian campaign only (a village like Берегово with a guard post, a bridge downstream, hearsay places).
// Disposable PGlite for SQL; nothing reaches 127.0.0.1:3000; no paid call.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";
import { createCampaignSettings } from "../src/lib/campaign-settings.ts";
import { parseLive2dBoard, parseRegionMap, parseRegionPrep } from "../src/lib/live2d/contracts.ts";
import { live2dCrumbs, live2dMapOpening, live2dOpeningLevel, live2dView } from "../src/lib/live2d/hierarchy.ts";
import { attachToSettlements, canonParents, fallbackRegionPrep, mergeRegionPrep, missingFromPrep, parseRegionPrepReply, regionCanonBody, regionCanonText, regionHiddenKey, regionPaintBrief,
  regionPlaceIds, regionPrepRequest, regionPrepSource, withCanonParents } from "../src/lib/live2d/region-prep.ts";
import { INNER_RADIUS, parseRegionCheck, regionCheckItems, regionCheckRequest, regionMapMarkers, regionMarkers, regionVerdict } from "../src/lib/live2d/region-marks.ts";
import { draftRegionPrep, checkRegionMap, imageSize } from "../src/lib/live2d/server/region-vision.ts";
import { regionDrawDecision, regionDrawInput } from "../src/lib/live2d/region.ts";
import { LIVE2D_IDS, live2dBoard, live2dPictures, live2dPlacements, live2dPlay, live2dSnapshot } from "../src/lib/ui/preview/live2d-fixture.ts";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const id = (name) => stableGameplayId("fix-s3-accept-d", name);
const AT = "2026-10-23T00:00:00Z";
const CID = id("campaign");

/** A synthetic Russian campaign: Березень (a village by the river, like Берегово) with the guard post the records
 * never put inside it, the elder's house and the smithy that are; a stone bridge downstream; hearsay places. */
function village() {
  const settings = createCampaignSettings(CID);
  settings.language = "ru";
  const loc = (key, name, status, description, detail) => ({ id: id(key), campaign_id: CID, revision: 1, updated_at: AT, name, description, status, ...(detail ? { detail } : {}) });
  const locations = [
    loc("village", "Березень", "visited", "Деревня на левом берегу Ольховки: частокол, площадь с колодцем."),
    loc("post", "Пост стражи", "visited", "Бревенчатая сторожевая башня у северных ворот."),
    loc("elder", "Дом старосты", "known", "Самый большой дом на площади.", { parentId: id("village") }),
    loc("smithy", "Кузня", "known", "Кузня у южного частокола.", { parentId: id("village"), whereabouts: "у южного частокола" }),
    loc("bridge", "Каменный мост", "known", "Старый мост ниже по течению."),
    loc("mill", "Мельница на Ольховке", "rumored", "Говорят, выше по реке стоит заброшенная мельница."),
    loc("barrow", "Старый курган", "rumored", "Где-то в холмах, говорят, курган."),
  ];
  const scene = (n, body) => ({ id: id(`scene-${n}`), campaign_id: CID, revision: 1, updated_at: AT, session_id: id("session"), title: "", body, role: "narration", settings_revision: 1, created_at: AT, sequence: n });
  const snapshot = {
    timeline: { timelineId: id("timeline"), epoch: 1 },
    campaign: { id: CID, campaign_id: CID, revision: 1, updated_at: AT, title: "Ольховка", subtitle: "", language: "ru" },
    settings: { campaign_id: CID, revision: 1, updated_at: AT, values: settings }, settingsHistory: [],
    documents: [{ id: id("world"), campaign_id: CID, revision: 1, updated_at: AT, title: "Ольховский край", status: "canon", current_version_id: id("world-v"), body: "Край по реке Ольховке: деревни, мельницы, старый тракт." }],
    entities: [], storages: [], items: [], sessions: [], quests: [], assets: [], feedback: [], dmGuideDocumentId: null,
    scenes: [scene(1, "Вы входите в Березень через северные ворота; у ворот — Пост стражи, бревенчатая башня. Ниже по течению виден Каменный мост.")],
    publicState: { campaign_id: CID, revision: 3, updated_at: AT, summary: "Отряд на Посту стражи в Березене.", current_session_id: id("session"), current_scene_id: null, current_location_id: id("post") },
    locations,
  };
  const place = (key, x, y) => ({ campaign_id: CID, location_id: id(key), level: "world", parent_location_id: null, x, y, revision: 1, updated_at: AT });
  return { snapshot, placements: [place("village", 0.4, 0.4), place("bridge", 0.6, 0.7)] };
}
/** The DM's reply to the prep request (as the probe's model answers it): the guard post inside the village. */
const DM_REPLY = JSON.stringify({
  overview: "Ольховка течёт с севера на юг. Березень стоит на левом берегу у старого тракта; ниже по течению, в полудне пути, — Каменный мост.",
  landscape: "A river runs from the north to the south-east; a village with a palisade on its west bank; a road follows the river south to a stone bridge; hills in the east.",
  places: [
    { id: id("village"), role: "village", within: null, x: 0.35, y: 0.4, where: "на левом берегу Ольховки, у тракта", look: "a palisaded village of log houses" },
    { id: id("post"), role: "guard post", within: id("village"), x: 0.35, y: 0.4, where: "у северных ворот Березеня", look: "a timber watchtower by the north gate" },
    { id: id("elder"), role: "house", within: id("village"), x: 0.35, y: 0.4, where: "на площади", look: "the largest house on the square" },
    { id: id("bridge"), role: "stone bridge", within: null, x: 0.62, y: 0.72, where: "ниже по течению, полдня пути", look: "an old stone bridge" },
    { id: id("mill"), role: "mill", within: null, x: 0.2, y: 0.15, where: "выше по реке", look: "a ruined watermill" },
    { id: id("barrow"), role: "barrow", within: null, x: null, y: null, where: "где-то в холмах", look: "" },
    { id: id("invented"), role: "castle", within: null, x: 0.9, y: 0.9, where: "", look: "a castle" },
  ],
  routes: [{ from: id("village"), to: id("bridge"), way: "тракт вниз по реке", days: 0.5 }, { from: id("village"), to: id("nowhere"), way: "", days: 1 }],
  hidden: "ТАЙНО: под мельницей прячут контрабанду; староста в доле.",
});

test("Д1 the map is a tree of places: the guard post sits inside the village by the region's prep; «Карта» opens at the village, «2D» at the scene", () => {
  const { snapshot, placements } = village();
  // Before the prep: the records alone — the guard post is a place of the region, the screen opens at the region.
  assert.deepEqual(live2dCrumbs(snapshot, placements, id("post")).map((row) => row.level), ["region", "scene"]);
  assert.deepEqual(live2dMapOpening(snapshot, placements, id("post")), { level: "region", anchorId: null }, "today: the region");
  const bare = live2dView(snapshot, placements, "region", null, id("post"));
  assert.deepEqual(bare.pins.map((row) => row.name).sort(), ["Березень", "Каменный мост", "Мельница на Ольховке", "Пост стражи", "Старый курган"], "every known place of the region appears");
  assert.deepEqual(bare.pins.filter((row) => row.approximate).map((row) => row.name).sort(), ["Мельница на Ольховке", "Пост стражи", "Старый курган"], "the places nobody placed: «положение примерное»");
  // The prep says the guard post is inside the village: the tree follows (the records' own parents always win).
  const draft = parseRegionPrepReply(DM_REPLY, regionPlaceIds(snapshot, bare.pins.map((row) => row.locationId)));
  const maps = [{ prep: draft.prep }];
  assert.deepEqual([...canonParents(snapshot, maps).entries()], [[id("post"), id("village")]], "only the link the records lack; Дом старосты keeps its own");
  const tree = withCanonParents(snapshot, maps);
  assert.equal(snapshot.locations.find((row) => row.id === id("post")).detail, undefined, "the records themselves never change");
  assert.deepEqual(live2dCrumbs(tree, placements, id("post")).map((row) => [row.level, row.name]), [["region", ""], ["town", "Березень"], ["scene", "Пост стражи"]]);
  assert.deepEqual(live2dMapOpening(tree, placements, id("post")), { level: "town", anchorId: id("village") }, "«Карта»: the deepest map level with content — the village");
  assert.deepEqual(live2dOpeningLevel(tree, placements, id("post")), { level: "scene", anchorId: id("post") }, "«2D»: the scene, the leaf");
  const town = live2dView(tree, placements, "town", id("village"), id("post"));
  assert.deepEqual(town.pins.map((row) => row.name).sort(), ["Дом старосты", "Кузня", "Пост стражи"], "a village is one picture with its markers");
  const region = live2dView(tree, placements, "region", null, id("post"));
  assert.ok(!region.pins.some((row) => row.name === "Пост стражи"), "on the region the post is inside the village, not a place of its own");
  assert.ok(region.pins.find((row) => row.name === "Березень").hasChildren, "down by marker: the village opens");
  // A loop in the preps never makes a tree: a place cannot be its own parent's parent.
  const looped = canonParents(snapshot, [{ prep: { ...draft.prep, places: [{ ...draft.prep.places[0], within: id("post") }, ...draft.prep.places.slice(1)] } }]);
  assert.ok(!(looped.get(id("village")) === id("post") && looped.get(id("post")) === id("village")), "one direction at most");
});

test("Д1 «Карта» opens the tree; the old atlas route is gone; the extra sections fold under one «Ещё»", () => {
  const page = src("src/app/campaigns/[campaignId]/[screen]/page.tsx");
  assert.match(page, /case "map":\s*return <MapRoute \/>;/, "the map route renders the tree of places");
  assert.doesNotMatch(page, /case "map":\s*return <PersistentSecondaryPage/, "the old atlas no longer renders on the campaign's map route");
  assert.match(src("src/components/registry/shell.tsx"), /\{ id: "map", label: c\("Карта", "Map"\), icon: MapIcon \}/, "the «Карта» nav entry stays and opens it");
  const route = src("src/components/live2d/route.tsx");
  assert.match(route, /export function MapRoute\(\) \{\s*return <RecordBoundary>\{\(data\) => <LiveWithPlay data=\{data\} entry="map" \/>\}<\/RecordBoundary>;/);
  assert.match(route, /<LiveWithPlay data=\{data\} entry="live" \/>/, "«2D» keeps working: the same screen at the current scene");
  assert.match(route, /<PersistentSupporting screen="map" \/>/, "«Исправить записи»");
  assert.match(route, /href\("world"\)/, "«что, если»: World Lab is linked, never touched");
  const more = src("src/components/live2d/map-more.tsx");
  assert.match(more, /c\("Изменить размещение", "Edit the layout"\)/);
  assert.match(more, /\{open && tools\}/, "the owner's record tools mount only when «Ещё» is open");
  const screen = src("src/components/live2d/live2d-screen.tsx");
  assert.equal(screen.match(/<MapMore /g)?.length, 2, "one «Ещё» on each map level (the region, the town or district); the scene keeps its own");
  assert.doesNotMatch(screen, /onDoubleClick/, "down by one tap on a marker");
});

// ---- the screen, rendered from the synthetic preview (nothing is sent) ----------------------------------------------
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../src/", import.meta.url));
let language = "ru";
const stubs = {
  [resolve(root, "components/language-context.tsx")]: { useLanguage: () => ({ language, setLanguage() {}, t: (phrase) => phrase }), LanguageProvider: ({ children }) => children },
  "next/link": { __esModule: true, default: ({ href, children, ...rest }) => createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children) },
  "next/image": { __esModule: true, default: (props) => createElement("img", { src: props.src, alt: props.alt ?? "" }) },
  "next/navigation": { usePathname: () => "/preview/live2d", useRouter: () => ({ push() {}, replace() {} }), useSearchParams: () => new URLSearchParams() },
  "server-only": {},
};
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
      // A css module reads its class names back (not an ES module, so the default import is the proxy itself).
      if (name.endsWith(".css")) return new Proxy({}, { get: (_, key) => (key === "__esModule" ? false : typeof key === "string" ? key : "") });
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
const { LanguageProvider } = load(resolve(root, "components/language-context.tsx"));
const { PreviewPictures } = load(resolve(root, "components/registry/live-frames.tsx"));
const { CampaignDataPreview } = load(resolve(root, "components/persistence-context.tsx"));
const refuse = { board: () => assert.fail("render must not read"), send: () => assert.fail("render must not send") };
// After the merge with Б4: the scene's action box reads the records, so the screen renders inside the records provider,
// as the preview page and the app mount it.
function render(preview, { snapshot = live2dSnapshot(), entry = "live", placements = live2dPlacements, board = live2dBoard, images = live2dPictures.images } = {}) {
  return renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(CampaignDataPreview, { snapshot, refresh: async () => {} },
      createElement(PreviewPictures, { board: live2dPictures.board, images: live2dPictures.images },
        createElement(Live2dScreen, { snapshot, play: live2dPlay(), transport: refuse, entry, tools: createElement("i", null, "TOOLS"), preview: { board, placements, images, ...preview } })))));
}
const attr = (html, name) => [...html.matchAll(new RegExp(`${name}="([^"]+)"`, "g"))].map((match) => match[1]).sort();

test("Д1 down by marker, up by crumb: «Карта» opens at the town with breadcrumbs, never the old level tabs; the region shows the places inside the town within it", () => {
  const map = render({}, { entry: "map" });
  for (const crumb of ["Ардан", "Серый тракт", "Вереск"]) assert.ok(map.includes(`>${crumb}</button>`), crumb);
  assert.ok(map.includes('aria-current="true">Вереск</button>'), "«Карта» opens at the town the party stands in");
  assert.ok(map.includes(">Карта<") || map.includes("Карта"), "the plate says «Карта»");
  assert.deepEqual(attr(map, "data-pin"), [LIVE2D_IDS.market, LIVE2D_IDS.wharf].sort(), "the town's places are its markers");
  assert.ok(!map.includes("Уровень карты") && !map.includes(">Окрестности<"), "no «Мир / Регион / Окрестности» tabs: breadcrumbs replace them");
  assert.ok(!map.includes("TOOLS"), "the owner's tools stay unmounted until «Ещё» opens");
  assert.ok(map.includes(">Ещё</summary>") && map.includes("Изменить размещение"));
  const live = render({}, { entry: "live" });
  assert.ok(live.includes('aria-current="true">Рыночная площадь</button>'), "«2D» opens at the current scene, the leaf");
  const region = render({ level: "region", anchorId: LIVE2D_IDS.market });
  assert.deepEqual(attr(region, "data-pin"), [LIVE2D_IDS.ford, LIVE2D_IDS.lodge, LIVE2D_IDS.veresk].sort(), "the region's own places");
  assert.deepEqual(attr(region, "data-pin-inner"), [LIVE2D_IDS.market, LIVE2D_IDS.wharf].sort(), "the town's places sit inside it on the region");
  assert.match(region, /data-pin-inner="[^"]+"[^>]*aria-label="Старая верфь · положение примерное"|aria-label="Старая верфь · положение примерное"/, "a place the picture could not show is approximate");
  assert.ok(region.includes("Подготовка края") && region.includes("Серый тракт идёт с юга на север"), "the region's prep is under «Ещё»");
  assert.ok(region.includes("тракт вниз по реке · полдня"), "the roads with their days");
  assert.ok(region.includes("Открыть в Библиотеке (канон мира)"), "the canon document is one click away");
  assert.ok(!region.includes("onDoubleClick") && !region.includes("двойное нажатие"), "one tap goes down: no double-tap any more");
});

test("Д3 all known places appear: visited bright, known by hearsay dim, «положение примерное» where the canon gives no position", () => {
  const { snapshot, placements } = village();
  const draft = parseRegionPrepReply(DM_REPLY, regionPlaceIds(snapshot, snapshot.locations.map((row) => row.id)));
  const items = regionCheckItems(draft.prep, new Map(snapshot.locations.map((row) => [row.id, row.name])));
  const check = { model: "m", costUsdMicros: 0, checkedAt: AT, peopleInBackground: false, contradictions: [],
    items: items.map((row) => ({ key: row.key, visible: row.name !== "Мельница на Ольховке", x: row.name === "Пост стражи" ? 0.63 : row.x, y: row.name === "Пост стражи" ? 0.7 : row.y, confidence: 0.9 })) };
  const map = { anchorId: null, pictureId: id("picture"), signature: [id("barrow"), id("bridge"), id("mill"), id("village")].sort().join(","), status: "flagged", updatedAt: AT, revision: 2, markers: regionMarkers(items, check), check, sideList: [], prep: draft.prep,
    prepRevision: 1, prepDocumentId: null, picturePrepRevision: 1 };
  const board = { campaignId: CID, settings: { markers: "all", revision: 1 }, scenes: [], pois: [], regionMaps: [map], battleMaps: [] };
  const html = render({ level: "region", anchorId: id("post") }, { snapshot, placements, board, images: { [id("picture")]: "/preview/live2d/region.jpg" } });
  assert.ok(html.includes("/preview/live2d/region.jpg"), "the painted map");
  assert.deepEqual(attr(html, "data-pin"), [id("barrow"), id("bridge"), id("mill"), id("village")].sort(), "every known place of the region, hearsay too («Всё известное»)");
  assert.deepEqual(attr(html, "data-pin-inner"), [id("elder"), id("post"), id("smithy")].sort(), "the guard post, the elder's house and the smithy inside the village");
  assert.match(html, /class="pin visitedPin[^"]*"[^>]*aria-label="Березень/, "visited: bright");
  assert.match(html, /class="pin knownPin[^"]*"[^>]*aria-label="Каменный мост/, "known by hearsay: dim");
  assert.match(html, /aria-label="Старый курган · положение примерное"/, "no position in the canon: «положение примерное»");
  const marks = regionMapMarkers(withCanonParents(snapshot, [map]), live2dView(withCanonParents(snapshot, [map]), placements, "region", null, id("post")).pins, map);
  const post = marks.inner.find((row) => row.locationId === id("post"));
  const town = marks.pins.find((row) => row.locationId === id("village"));
  assert.ok(Math.hypot(post.x - town.x, post.y - town.y) <= INNER_RADIUS, "the guard post's marker is inside the village, not at the bridge");
  assert.equal(marks.pins.find((row) => row.locationId === id("barrow")).y, 0.92, "a place with no spot on the picture waits along the bottom edge");
});

test("Д3 the region's prep: the records, the canon and the public narration in; the hidden part only in the DM's private input and its own note", () => {
  const { snapshot, placements } = village();
  const pins = live2dView(snapshot, placements, "region", null, id("post")).pins;
  const placeIds = regionPlaceIds(snapshot, pins.map((row) => row.locationId));
  assert.deepEqual(placeIds.sort(), [id("barrow"), id("bridge"), id("elder"), id("mill"), id("post"), id("smithy"), id("village")].sort(), "the region's places and the places inside them");
  const source = regionPrepSource(snapshot, { anchorId: null, placeIds, hidden: "Тайный слой: контрабанда на мельнице.", existing: null });
  const request = regionPrepRequest(source);
  assert.match(request.system, /geography in detail/);
  assert.match(request.system, /how many days it takes to walk/);
  assert.match(request.system, /what stays in your hidden layer/);
  assert.match(request.system, /Keep every secret out of overview, landscape, where, look and way/);
  // A place the canon's words put at a settlement lies inside it, even when the DM left `within` empty.
  const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
  const loose = { overview: "", landscape: "", routes: [], source: "model", places: [
    { locationId: id("village"), role: "village", within: null, x: 0.55, y: 0.55, where: "на левом берегу", look: "" },
    { locationId: id("post"), role: "guard post", within: null, x: 0.56, y: 0.51, where: "у северных ворот Березеня", look: "" },
    { locationId: id("bridge"), role: "bridge", within: null, x: 0.48, y: 0.82, where: "в полудне пути от Березеня", look: "" },
    { locationId: id("mill"), role: "mill", within: null, x: 0.57, y: 0.53, where: "выше по реке", look: "" }] };
  const attached = attachToSettlements(loose, names);
  assert.deepEqual(attached.places.map((row) => [names.get(row.locationId), names.get(row.within) ?? null]),
    [["Березень", null], ["Пост стражи", "Березень"], ["Каменный мост", null], ["Мельница на Ольховке", null]], "at the village and named so: inside; far off or not named: its own landmark");
  assert.deepEqual([attached.places[1].x, attached.places[1].y], [0.55, 0.55], "drawn as part of the village");
  assert.equal(attachToSettlements(loose, names, new Set([id("bridge")])).places[1].within, null, "an amend never touches the places already designed");
  assert.match(src("src/lib/live2d/server/region.ts"), /const prep = attachToSettlements\(/, "the server applies it to every prep it saves");
  assert.match(request.user, /\n\d+ — Пост стражи — visited/, "place numbers, never the records' IDs");
  assert.ok(!request.user.includes(id("post")), "no record ID in the request");
  assert.match(request.user, /Кузня — known — inside Березень \(\d+\)/, "the records' parents");
  assert.match(request.user, /у ворот — Пост стражи/, "the public narration that names the places");
  assert.match(request.user, /## Ольховский край/, "the canon");
  assert.match(request.user, /Your own notes as the game master[^]*контрабанда/, "the DM reads its private notes; the prep keeps to them");
  // The reply by numbers maps back to the records: N is the request's N-th place.
  const numberOf = (placeId) => source.places.findIndex((row) => row.id === placeId) + 1;
  const byKeys = parseRegionPrepReply(JSON.stringify({ overview: "Река.", places: [{ n: numberOf(id("post")), role: "guard post", within: numberOf(id("village")), x: 0.3, y: 0.4, where: "у ворот", look: "a tower" }, { n: 99, role: "castle", x: 0.1, y: 0.1 }],
    routes: [{ from: numberOf(id("village")), to: numberOf(id("bridge")), way: "тракт", days: 0.5 }], hidden: "тайна" }), source.places.map((row) => row.id));
  assert.deepEqual(byKeys.prep.places.map((row) => [row.locationId, row.within]), [[id("post"), id("village")]], "numbers back to IDs; an unknown number is dropped");
  assert.deepEqual([byKeys.prep.routes[0].from, byKeys.prep.routes[0].to, byKeys.hidden], [id("village"), id("bridge"), "тайна"]);
  const draft = parseRegionPrepReply(DM_REPLY, placeIds);
  assert.ok(!draft.prep.places.some((row) => row.locationId === id("invented")), "never a place the records do not have");
  assert.equal(draft.prep.routes.length, 1, "a road to an unknown place is dropped");
  assert.equal(draft.prep.places.find((row) => row.locationId === id("barrow")).x, null, "no position given: none invented");
  assert.match(draft.hidden, /контрабанду/);
  const pub = JSON.stringify(draft.prep);
  assert.ok(!pub.includes("контрабанд") && !pub.includes("ТАЙНО") && !("hidden" in draft.prep), "the hidden part never rides in the public prep");
  const parsed = parseRegionMap({ anchorId: null, pictureId: null, signature: "", status: "ready", updatedAt: AT, prep: { ...draft.prep, hidden: "ТАЙНО" }, markers: [] });
  assert.ok(!JSON.stringify(parsed).includes("ТАЙНО"), "the board's parser keeps only the public fields");
  assert.equal(regionHiddenKey(null), "region_hidden_known");
  assert.match(regionHiddenKey(id("region")), /^region_hidden_[a-z0-9]{16}$/, "a private-notes key the dossier accepts");
  const server = src("src/lib/live2d/server/region.ts");
  assert.match(server, /dossier\.privateNotes\(\{ set: \[\{ kind: "fact", key: regionHiddenKey\(anchorId\), value \}\], remove: \[\] \}, snapshot\.timeline\)/, "the hidden part goes to the DM's private notes");
  assert.doesNotMatch(server, /log\([^)]*draft\.hidden[^.]/, "the log never carries the hidden text");
  // The canon document: the DM's public text, versioned like any document; the owner's edits are never overwritten.
  // (names: above)
  const canon = regionCanonText(draft.prep, names, { regionName: "", language: "ru" });
  assert.equal(canon.title, "Карта края — известный край");
  assert.match(canon.body, /Канон мира: карту рисуют по ней, перерисовка картинки её не меняет/);
  assert.match(canon.body, /- Березень \(village\): на левом берегу Ольховки, у тракта\n {2}- Пост стражи \(guard post\): у северных ворот Березеня/, "the guard post listed inside the village");
  assert.match(canon.body, /- Старый курган \(barrow\): где-то в холмах; положение примерное/);
  assert.match(canon.body, /- Березень — Каменный мост: тракт вниз по реке \(полдня пути\)/);
  assert.ok(!canon.body.includes("контрабанд"));
  const more = { ...draft.prep, places: [...draft.prep.places, { locationId: id("smithy"), role: "smithy", within: id("village"), x: 0.35, y: 0.4, where: "у южного частокола", look: "" }] };
  assert.equal(regionCanonBody(canon.body, draft.prep, more, names, { regionName: "", language: "ru" }), regionCanonText(more, names, { regionName: "", language: "ru" }).body, "the DM's own text is rewritten whole");
  const owned = `${canon.body}\n\nВладелец: мост чинили в прошлом году.`;
  const next = regionCanonBody(owned, draft.prep, more, names, { regionName: "", language: "ru" });
  assert.ok(next.startsWith(owned) && /Добавлено ведущим:\nМеста:\n- Кузня/.test(next), "an owner-edited canon keeps his text; the new place is appended");
});

test("Д3 the painter paints from the prep: the places by role at their spots, the places inside a settlement as part of it, nothing beyond", () => {
  const { snapshot } = village();
  const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
  const draft = parseRegionPrepReply(DM_REPLY, snapshot.locations.map((row) => row.id));
  const brief = regionPaintBrief(draft.prep, { regionName: "", names, style: "", family: "gpt" });
  assert.match(brief, /The land, as the game master designed it \(north is up, west is left\): A river runs from the north/);
  assert.match(brief, /village \(Березень\) near the centre: a palisaded village of log houses; as part of it, inside it and not as separate landmarks: a timber watchtower by the north gate \(Пост стражи\)/);
  assert.match(brief, /stone bridge \(Каменный мост\) in the south: an old stone bridge/);
  assert.match(brief, /Roads join: Березень — Каменный мост \(a short way apart\)/);
  assert.match(brief, /no extra towns, castles, towers or ruins/);
  assert.match(brief, /No text, letters/);
  assert.ok(!brief.includes("Старый курган"), "a place with no position is not painted anywhere");
  assert.ok(!brief.includes("контрабанд") && !brief.includes("castle (") , "nothing hidden, nothing invented");
  const corrected = regionPaintBrief(draft.prep, { regionName: "", names, style: "", family: "gpt", correction: { missing: ["a ruined watermill (Мельница на Ольховке)"], misplaced: ["Пост стражи inside Березень"], contradictions: ["a castle"] } });
  assert.match(corrected, /put each exactly where it is said to be: Пост стражи inside Березень/);
  // The records alone (the DM's model failed): the atlas spots and the records' parents; never saved as the canon.
  const fallback = fallbackRegionPrep(regionPrepSource(snapshot, { anchorId: null, placeIds: [id("village"), id("smithy")], hidden: "", existing: null }), new Map([[id("village"), { x: 0.4, y: 0.4 }]]));
  assert.equal(fallback.source, "records");
  assert.deepEqual(fallback.places.map((row) => [row.within, row.x]), [[null, 0.4], [id("village"), null]]);
  assert.match(src("src/lib/live2d/server/region.ts"), /const painting = prep \?\? fallbackRegionPrep\(/, "the fallback paints, the canon stays the DM's");
});

test("Д3 markers on their objects, checked like the scenes: the guard post drawn at the bridge is a mismatch and its marker goes into the village", () => {
  const { snapshot } = village();
  const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
  const draft = parseRegionPrepReply(DM_REPLY, snapshot.locations.map((row) => row.id));
  const items = regionCheckItems(draft.prep, names);
  const keyOf = (name) => items.find((row) => row.name === name).key;
  assert.deepEqual(items.filter((row) => row.required).map((row) => row.name).sort(), ["Березень", "Каменный мост", "Мельница на Ольховке"], "the landmarks the prep places must be on the picture");
  assert.deepEqual(items.filter((row) => !row.required).map((row) => row.name).sort(), ["Дом старосты", "Пост стражи"], "the places inside the village are located where drawn");
  const request = regionCheckRequest(items, "");
  assert.match(request.system, /painted map of a region against the game master's design/);
  assert.match(request.text, new RegExp(`${keyOf("Пост стражи")} — Пост стражи: a timber watchtower by the north gate, inside Березень`));
  // The model's reply in the scenes' shape: the village found, the guard post found at the bridge, the mill missing.
  const reply = `Looking… {"items":[{"key":"${keyOf("Березень")}","visible":true,"x":0.37,"y":0.42,"confidence":0.92},{"key":"${keyOf("Каменный мост")}","visible":true,"x":0.62,"y":0.71,"confidence":0.9},`
    + `{"key":"${keyOf("Мельница на Ольховке")}","visible":false,"x":null,"y":null,"confidence":0.1},{"key":"${keyOf("Пост стражи")}","visible":true,"x":0.63,"y":0.69,"confidence":0.8},`
    + `{"key":"${keyOf("Дом старосты")}","visible":true,"x":0.38,"y":0.41,"confidence":0.4}],"contradictions":[{"what":"a castle on a hill","detail":"not in the design"}]}`;
  const check = parseRegionCheck(reply, items, "claude-sonnet-5-5", 1000, AT);
  const verdict = regionVerdict(items, check, "ru");
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.missing.map((row) => row.name), ["Мельница на Ольховке"]);
  assert.deepEqual(verdict.sideList, ["Мельница на Ольховке", "Пост стражи — не в Березень"], "the mismatch list names what is wrong");
  assert.deepEqual(verdict.contradictions, ["a castle on a hill"]);
  const markers = regionMarkers(items, check);
  const at = (name) => markers.find((row) => row.locationId === snapshot.locations.find((loc) => loc.name === name).id);
  assert.deepEqual([at("Березень").x, at("Березень").y, at("Березень").source, at("Березень").approximate], [0.37, 0.42, "check", false], "the village's marker on the village drawn");
  const post = at("Пост стражи");
  assert.ok(Math.hypot(post.x - 0.37, post.y - 0.42) <= INNER_RADIUS && post.source === "prep" && post.approximate, "the guard post's marker is inside the village, never at the bridge");
  assert.deepEqual([at("Дом старосты").source, at("Дом старосты").approximate], ["check", true], "found inside the village, unsure: kept there, approximate");
  assert.deepEqual([at("Мельница на Ольховке").x, at("Мельница на Ольховке").source, at("Мельница на Ольховке").approximate], [0.2, "prep", true], "not on the picture: the prep's spot, approximate");
  assert.equal(at("Старый курган"), undefined, "no spot anywhere: no invented marker (the screen lays it along the edge)");
  const good = parseRegionCheck(reply.replace('"x":0.63,"y":0.69', '"x":0.38,"y":0.4').replace('"visible":false,"x":null,"y":null', '"visible":true,"x":0.2,"y":0.16').replace(/"contradictions":\[[^\]]*\]/, '"contradictions":[]'), items, "m", 0, AT);
  assert.equal(regionVerdict(items, good, "ru").ok, true, "everything on its object: the map passes");
});

test("Д3 the calls fail soft and report their cost; the chain: prep before the painter, the redraw reuses it", async () => {
  const { snapshot, placements } = village();
  const pins = live2dView(snapshot, placements, "region", null, id("post")).pins;
  const source = regionPrepSource(snapshot, { anchorId: null, placeIds: regionPlaceIds(snapshot, pins.map((row) => row.locationId)), hidden: "", existing: null });
  const ok = await draftRegionPrep(async () => ({ text: DM_REPLY, usage: { inputTokens: 5000, outputTokens: 2000 }, costUsdMicros: 60_000, model: "claude-opus-5-5" }), source);
  assert.ok(ok.draft && ok.costUsdMicros === 60_000 && ok.error === null);
  const bad = await draftRegionPrep(async () => { throw new Error("HTTP 529: overloaded"); }, source);
  assert.deepEqual([bad.draft, bad.error], [null, "HTTP 529: overloaded"]);
  const unreadable = await draftRegionPrep(async () => ({ text: "no json", usage: null, costUsdMicros: 10, model: "m" }), source);
  assert.deepEqual([unreadable.draft, unreadable.error], [null, "unparsable"]);
  assert.equal((await checkRegionMap("", [], "", { bytes: new Uint8Array(), contentType: "image/png" })).error, "not_configured", "no key: no call");
  // An amend keeps the region as designed: the places already there stay exactly, only the new one joins.
  const amend = mergeRegionPrep(ok.draft.prep, { ...ok.draft.prep, overview: "", places: [{ ...ok.draft.prep.places[0], x: 0.9 }, { locationId: id("smithy"), role: "smithy", within: id("village"), x: 0.35, y: 0.4, where: "", look: "" }] });
  assert.equal(amend.places.find((row) => row.locationId === id("village")).x, 0.35, "a known place never moves");
  assert.ok(amend.places.some((row) => row.locationId === id("smithy")));
  assert.deepEqual(missingFromPrep(ok.draft.prep, [id("village"), id("smithy")]), [id("smithy")], "a newly known place is the reason to ask the DM again");
  const amendRequest = regionPrepRequest({ ...source, existing: ok.draft.prep });
  assert.match(amendRequest.system, /Keep every place exactly where it is/);
  assert.match(amendRequest.user, /New known places to design[^]*Кузня/);
  // The wiring: the stored prep first; the DM only for what it lacks; the painter from the prep; the check; the markers.
  const server = src("src/lib/live2d/server/region.ts");
  const chain = server.slice(server.indexOf("async function paintRegion"), server.indexOf("const summary ="));
  const order = ["missingFromPrep(prep, placeIds)", "prepareRegion(", "drawRegionOnce(", "checkRegionMap(", "regionMarkers(items, check)", "saveRegionMap(ctx, { anchorId, pictureId, signature"].map((needle) => chain.indexOf(needle));
  assert.ok(order.every((at, index) => at > 0 && (index === 0 || at > order[index - 1])), `prep → picture → check → markers (${order})`);
  assert.match(chain, /let prep: RegionPrep \| null = existing\?\.prep \?\? null/, "a redraw paints from the stored prep: the geography never changes");
  assert.match(chain, /!options\.force && !existing\?\.pictureId/, "the one corrected picture only on a first draw, never on the owner's forced redraw");
  assert.match(server, /expectedRevision: existing\?\.prepRevision \?\? 0, source: "model"/, "the prep is fenced by its revision");
});

test("Д3 the check asks for pixels of the picture's size (steadier than fractions in the probe) and reads them back as fractions", async () => {
  const { snapshot } = village();
  const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
  const items = regionCheckItems(parseRegionPrepReply(DM_REPLY, snapshot.locations.map((row) => row.id)).prep, names);
  const size = { width: 1344, height: 768 };
  const request = regionCheckRequest(items, "", size);
  assert.match(request.system, /in pixels from the top-left corner of the picture, which is 1344 pixels wide and 768 pixels high/);
  assert.match(regionCheckRequest(items, "").system, /as fractions of the picture's width and height/, "without a size: the scenes' fractions");
  const village0 = items.find((row) => row.name === "Березень").key;
  const check = parseRegionCheck(`{"items":[{"key":"${village0}","visible":true,"x":672,"y":192,"confidence":0.9}],"contradictions":[]}`, items, "m", 0, AT, size);
  assert.deepEqual(check.items.find((row) => row.key === village0), { key: village0, visible: true, x: 0.5, y: 0.25, confidence: 0.9 });
  assert.equal(parseRegionCheck(`{"items":[{"key":"${village0}","visible":true,"x":2000,"y":10,"confidence":0.9}]}`, items, "m", 0, AT, size).items[0].visible, false, "a spot outside the picture is not a spot");
  // The picture's size from its own header (PNG; JPEG by its frame marker).
  const png = new Uint8Array(32); png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 5, 64, 0, 0, 3, 0]);
  assert.deepEqual(imageSize(png), { width: 1344, height: 768 });
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 17, 8, 3, 0, 5, 64, 3, 0, 0, 0, 0]);
  assert.deepEqual(imageSize(jpeg), { width: 1344, height: 768 });
  const vision = src("src/lib/live2d/server/region-vision.ts");
  assert.match(vision, /const size = options\.coordinates === "fraction" \? null : imageSize\(picture\.bytes\);/, "pixels by default");
  assert.match(vision, /const model = options\.model \?\? CHECK_MODEL;/, "the app checks with CHECK_MODEL; only a probe overrides it");
});

test("Д2 the forced redraw stays a real redraw that changes only the picture", () => {
  assert.deepEqual(regionDrawInput(null, { pictureId: id("picture") }), { anchorId: null, force: true });
  assert.equal(regionDrawDecision({ status: "ready", signature: "a" }, "a", true), "draw");
  assert.equal(regionDrawDecision({ status: "drawing", signature: "a" }, "a", true), "drawing");
  const server = src("src/lib/live2d/server/region.ts");
  const draw = server.slice(server.indexOf("export async function drawRegionMap"), server.indexOf("async function paintRegion"));
  assert.match(draw, /schedule\(\(\) => paintRegion\(ctx, pictures, campaignId, anchorId, \{ signature, force: value\.force === true \}\)\)/);
  assert.doesNotMatch(draw, /prepareRegion|saveRegionPrep/, "the request itself never touches the prep");
  const screen = src("src/components/live2d/live2d-screen.tsx");
  assert.match(screen, /c\("Перерисовать карту региона", "Redraw the region map"\)/);
});

test("Д3 migration 202610230541: the prep with its versions, the markers with the owner's kept, a flagged map; the board stays public", async () => {
  const f = await fixture(999);
  try {
    assert.ok(f.files.includes("202610230541_fix_s3_accept_region_prep.sql"));
    const w = await world(f);
    const call = (action, payload = {}, user = f.owner) => f.one("select public.rpg_live2d($1,$2,$3,$4::jsonb) result", [user, w.cid, action, JSON.stringify(payload)]).then((row) => row.result);
    const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));
    const marker = (more = {}) => ({ locationId: w.location, x: 0.3, y: 0.4, confidence: 0.9, source: "check", approximate: false, ...more });
    await fails(call("region.prep.save", { anchorId: null, prep: {}, documentId: null, expectedRevision: 0, source: "model" }), "rpg_not_found");
    const drawing = await call("region.save", { anchorId: null, pictureId: null, signature: "", status: "drawing" });
    assert.deepEqual([drawing.revision, drawing.markers, drawing.prep, drawing.prepRevision, drawing.sideList], [1, [], null, 0, []]);
    const prep = { overview: "Река", landscape: "A river", places: [{ locationId: w.location, role: "village", within: null, x: 0.3, y: 0.4, where: "у реки", look: "" }], routes: [], source: "model" };
    await fails(call("region.prep.save", { anchorId: null, prep, documentId: null, expectedRevision: 3, source: "model" }), "rpg_conflict");
    await fails(call("region.prep.save", { anchorId: null, prep, documentId: randomUUID(), expectedRevision: 0, source: "model" }), "rpg_conflict");
    const doc = await f.mutation("document.save", w.cid, { title: "Карта края — известный край", status: "canon", body: "Подготовка ведущего" }, 0, "campaign");
    const prepared = await call("region.prep.save", { anchorId: null, prep, documentId: doc.id, expectedRevision: 0, source: "model" });
    assert.deepEqual([prepared.prepRevision, prepared.prepDocumentId, prepared.prep.overview], [1, doc.id, "Река"]);
    // The picture's markers, the check and the side list ride with the map; a flagged map is a status.
    await fails(call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "flagged", markers: [marker({ x: 1.4 })] }), "rpg_validation");
    await fails(call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "flagged", markers: [marker({ locationId: randomUUID() })] }), "rpg_conflict");
    await fails(call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "flagged", markers: [marker(), marker()] }), "rpg_validation");
    await fails(call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "done" }), "rpg_validation");
    const flagged = await call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "flagged", markers: [marker()], check: { model: "m", items: [], contradictions: [], peopleInBackground: false, costUsdMicros: 1, checkedAt: AT }, sideList: ["Пост стражи — не в Березень"], picturePrepRevision: 1 });
    assert.deepEqual([flagged.status, flagged.markers.length, flagged.sideList, flagged.picturePrepRevision, flagged.prep.overview], ["flagged", 1, ["Пост стражи — не в Березень"], 1, "Река"], "a redraw's save never touches the prep");
    // The owner moves the marker (fenced by the map's revision); the next picture's markers never replace it.
    await fails(call("region.marker.save", { anchorId: null, locationId: w.location, x: 0.5, y: 0.5, expectedRevision: flagged.revision + 1 }), "rpg_conflict");
    const moved = await call("region.marker.save", { anchorId: null, locationId: w.location, x: 0.5, y: 0.55, expectedRevision: flagged.revision });
    assert.deepEqual(moved.markers.map((row) => [row.source, row.x, row.y]), [["owner", 0.5, 0.55]]);
    const redrawn = await call("region.save", { anchorId: null, pictureId: null, signature: "s", status: "ready", markers: [marker({ x: 0.9, y: 0.9 })], sideList: [] });
    assert.deepEqual(redrawn.markers.map((row) => [row.source, row.x]), [["owner", 0.5]], "the owner's spot is the highest authority");
    assert.equal(redrawn.prepRevision, 1, "the geography survives the redraw");
    const amended = await call("region.prep.save", { anchorId: null, prep: { ...prep, overview: "Река и мост" }, documentId: null, expectedRevision: 1, source: "model" });
    assert.deepEqual([amended.prepRevision, amended.prepDocumentId], [2, doc.id], "an amend keeps the canon document");
    const versions = await f.query("select revision, source, prep->>'overview' overview from rpg_private.live2d_region_prep_versions where campaign_id=$1 order by revision", [w.cid]);
    assert.deepEqual(versions, [{ revision: 1, source: "model", overview: "Река" }, { revision: 2, source: "model", overview: "Река и мост" }]);
    await fails(f.one("update rpg_private.live2d_region_prep_versions set source='owner' where campaign_id=$1", [w.cid]), "rpg_conflict");
    await fails(f.one("delete from rpg_private.live2d_region_prep_versions where campaign_id=$1", [w.cid]), "rpg_conflict");
    const read = await call("read");
    assert.deepEqual(Object.keys(read).sort(), ["battleMaps", "campaignId", "pois", "regionMaps", "scenes", "settings"], "the board's shape is unchanged");
    const board = parseLive2dBoard(read);
    assert.equal(board.regionMaps[0].prep.places[0].where, "у реки");
    assert.ok(!JSON.stringify(read).includes("hidden"), "no hidden part anywhere in the board");
    await fails(call("region.marker.save", { anchorId: null, locationId: w.location, x: 0.5, y: 0.5, expectedRevision: 1 }, f.other), "rpg_forbidden");
    // An old map (before the migration) reads with its defaults.
    assert.deepEqual(parseRegionMap({ anchorId: null, pictureId: null, signature: "", status: "ready", updatedAt: AT }).markers, []);
    assert.equal(parseRegionPrep({ places: [{ locationId: "not-an-id" }] }).places.length, 0);
  } finally {
    await f.db.close();
  }
});
