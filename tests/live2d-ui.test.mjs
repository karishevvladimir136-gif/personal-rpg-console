// 2D Live, part 1d (docs/stages/LIVE2D_1.md): the screen renders the synthetic
// sample — the breadcrumb, the region's pins under each marker mode, the scene's
// hotspots with their labels, the side list — and sends nothing on render.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LIVE2D_IDS, live2dBoard, live2dPictures, live2dPlacements, live2dPlay, live2dSnapshot } from "../src/lib/ui/preview/live2d-fixture.ts";
import { markerLabel } from "../src/lib/live2d/markers.ts";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../src/", import.meta.url));
// The language provider resets to English on a fresh render; the tests pick the language directly.
let language = "ru";
const stubs = {
  [resolve(root, "components/language-context.tsx")]: { useLanguage: () => ({ language, setLanguage() {}, t: (phrase) => phrase }), LanguageProvider: ({ children }) => children },
  "next/link": { __esModule: true, default: ({ href, children, ...rest }) => createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children) },
  "next/image": { __esModule: true, default: (props) => createElement("img", { src: props.src, alt: props.alt ?? "" }) },
  "next/navigation": { usePathname: () => "/preview/live2d", useRouter: () => ({ push() {}, replace() {} }), useSearchParams: () => new URLSearchParams() },
  "server-only": {},
};

/** Transpiles the TSX under src/ on the fly; css modules are empty objects; next/* is stubbed. */
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
const { LanguageProvider } = load(resolve(root, "components/language-context.tsx"));
const { PreviewPictures } = load(resolve(root, "components/registry/live-frames.tsx"));
const { CampaignDataPreview } = load(resolve(root, "components/persistence-context.tsx"));

const refuse = { board: () => assert.fail("render must not read"), send: () => assert.fail("render must not send") };
// Fix S3-accept Б4: the scene carries the DM's answer and the action box, which read the campaign's records — the
// screen renders inside the records provider, as the preview page and the app mount it.
function render(preview, { play = live2dPlay(), snapshot = live2dSnapshot() } = {}) {
  return renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(CampaignDataPreview, { snapshot, refresh: async () => {} },
      createElement(PreviewPictures, { board: live2dPictures.board, images: live2dPictures.images },
        createElement(Live2dScreen, { snapshot, play, transport: refuse, preview: { board: live2dBoard, placements: live2dPlacements, images: live2dPictures.images, ...preview } })))));
}
const pins = (html) => [...html.matchAll(/data-pin="([^"]+)"/g)].map((match) => match[1]).sort();
const hotspots = (html) => [...html.matchAll(/data-poi="([^"]+)"/g)].map((match) => match[1]);

test("the scene opens for the current visited place with its breadcrumb, hotspots, tokens and the side list", () => {
  const html = render({});
  for (const crumb of ["Ардан", "Серый тракт", "Вереск", "Рыночная площадь"]) assert.ok(html.includes(`>${crumb}</button>`), crumb);
  assert.deepEqual(hotspots(html), ["well", "smithy", "stall", "wharf-gate", "person-tobin", "person-orm"], "every positioned POI of the records; Мальва is not present");
  assert.ok(html.includes('aria-label="Прилавок трав · примерно"'), "the approximate marker says so");
  assert.ok(html.includes('data-kind="exit"'));
  assert.ok(html.includes("/preview/live2d/tobin.jpg"), "a present companion is a portrait token");
  assert.ok(html.includes("Здесь также") && html.includes("<span>Часовня</span>"), "the side list names what the picture lacks");
  assert.ok(html.includes("/preview/live2d/market.jpg"), "the scene picture is the background");
  assert.ok(html.includes("Текст"), "the text is one click away");
  assert.ok(!html.includes("Мальва"), "a person who is not present is not drawn");
});

test("the region shows the painted map, the party, the pins the marker mode allows, and travel on the way", () => {
  const region = render({ level: "region", anchorId: LIVE2D_IDS.market });
  assert.ok(region.includes("/preview/live2d/region.jpg"));
  assert.deepEqual(pins(region), [LIVE2D_IDS.ford, LIVE2D_IDS.lodge, LIVE2D_IDS.veresk].sort(), "standard: every known place; the districts stay inside the town");
  assert.ok(region.includes("вы здесь") && region.includes("можно открыть"), "the party stands at the town; the town can be opened");
  for (const mode of ["off", "tracked", "standard", "all"]) assert.ok(region.includes(`>${markerLabel(mode, "ru")}</button>`), mode);
  assert.ok(region.includes('aria-pressed="true">Обычно<'));
  const off = render({ level: "region", anchorId: LIVE2D_IDS.market, board: { ...live2dBoard, settings: { markers: "off", revision: 1 } } });
  assert.deepEqual(pins(off), [LIVE2D_IDS.veresk], "off: only where the party is");
  const tracked = render({ level: "region", anchorId: LIVE2D_IDS.market, board: { ...live2dBoard, settings: { markers: "tracked", revision: 1 } } });
  assert.deepEqual(pins(tracked), [LIVE2D_IDS.lodge, LIVE2D_IDS.veresk].sort(), "tracked: the open quest's goal joins");
  const travel = render({ level: "region", anchorId: LIVE2D_IDS.market, travel: { fromId: LIVE2D_IDS.ford, toId: LIVE2D_IDS.veresk, minutes: 150 } });
  assert.ok(travel.includes("в пути") && travel.includes("Каменный брод → Вереск"), "a glide in progress says where the party is going");
  assert.match(travel, /<path d="M [\d.]+ [\d.]+ Q/, "the route is drawn");
});

test("the town shows its districts over the place's illustration; an unvisited place has no scene; English copy renders", () => {
  const town = render({ level: "town", anchorId: LIVE2D_IDS.veresk });
  assert.ok(town.includes("/preview/live2d/veresk.jpg"));
  assert.deepEqual(pins(town), [LIVE2D_IDS.market, LIVE2D_IDS.wharf].sort());
  const unvisited = render({ level: "scene", anchorId: LIVE2D_IDS.lodge });
  assert.ok(unvisited.includes("Место ещё не посещали"));
  assert.equal(hotspots(unvisited).length, 0);
  language = "en";
  try {
    const html = render({ level: "scene", anchorId: LIVE2D_IDS.market });
    assert.ok(html.includes("Also here") && html.includes("Рыночная площадь"), "the interface language follows the provider, the records stay as written");
  } finally { language = "ru"; }
  const fresh = render({ level: "region", anchorId: LIVE2D_IDS.market, board: { ...live2dBoard, regionMaps: [{ ...live2dBoard.regionMaps[0], signature: LIVE2D_IDS.ford }] } });
  assert.ok(fresh.includes("На карте появилось новое место") && fresh.includes("Вереск, Зимовье Гарта"), "a new known place is the reason to redraw");
});

test("the hotspots and pins carry the words the click writes; nothing private or invented reaches the markup", () => {
  const html = render({});
  assert.ok(!html.includes("poi_seed"), "no seed ever reaches the screen");
  assert.ok(!html.includes("MUST SHOW"), "the illustrator's brief is not on the screen");
  const withoutScene = render({ level: "scene", anchorId: LIVE2D_IDS.market, board: { ...live2dBoard, scenes: [], pois: [] } });
  assert.ok(withoutScene.includes("Подготовить сцену"), "a visited place without a scene offers to prepare one");
  assert.equal(hotspots(withoutScene).length, 0);
  const flagged = render({ level: "scene", anchorId: LIVE2D_IDS.market, board: { ...live2dBoard, scenes: [{ ...live2dBoard.scenes[0], status: "flagged" }] } });
  assert.ok(flagged.includes("не сошлась с записями"), "a flagged scene asks the owner to check");
});
