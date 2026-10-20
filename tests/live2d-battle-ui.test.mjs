// 2D Live, part 2: the battle screen renders the synthetic fights — the ribbon
// in initiative order with the active glow, the zones derived from the same
// coordinates as the map, the enemy card with HP numbers and «???», the reaction
// card, the end-of-fight card — and sends nothing on render.
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
import { BATTLE_IDS, battlePreview, fightRounds } from "../src/lib/ui/preview/live2d-battle-fixture.ts";
import { LIVE2D_IDS, live2dPlacements } from "../src/lib/ui/preview/live2d-fixture.ts";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../src/", import.meta.url));
let language = "ru";
const stubs = {
  [resolve(root, "components/language-context.tsx")]: { useLanguage: () => ({ language, setLanguage() {}, t: (phrase) => phrase }), LanguageProvider: ({ children }) => children },
  "next/link": { __esModule: true, default: ({ href, children, ...rest }) => createElement("a", { href: typeof href === "string" ? href : "#", ...rest }, children) },
  "next/image": { __esModule: true, default: (props) => createElement("img", { src: props.src, alt: props.alt ?? "" }) },
  "next/navigation": { usePathname: () => "/preview/live2d/battle", useRouter: () => ({ push() {}, replace() {} }), useSearchParams: () => new URLSearchParams() },
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
const { BattleScreen } = load(resolve(root, "components/live2d/battle/battle-screen.tsx"));
const { Live2dScreen } = load(resolve(root, "components/live2d/live2d-screen.tsx"));
const { LanguageProvider } = load(resolve(root, "components/language-context.tsx"));
const { PreviewPictures } = load(resolve(root, "components/registry/live-frames.tsx"));

function render(fight, round, props = {}) {
  const sample = battlePreview(fight, round);
  return renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(PreviewPictures, { board: sample.pictures.board, images: sample.pictures.images },
      createElement(BattleScreen, { snapshot: sample.snapshot, play: sample.play, board: sample.board, images: sample.pictures.images, preview: true, ...props }))));
}
const slots = (html) => [...html.matchAll(/data-slot="([^"]+)"/g)].map((match) => match[1]);
const zoneOf = (html, zone) => (new RegExp(`data-zone="${zone}"([\\s\\S]*?)</div></div>`).exec(html)?.[1] ?? "");

test("the ribbon follows the initiative order, the active one glows, the map draws the tokens, features and the battle picture", () => {
  const html = render("ford", 2);
  assert.equal(slots(html).length, 5);
  assert.ok(/data-slot="[^"]+"[^>]*aria-current="true"/.test(html.replace(/\n/g, "")), "one active slot");
  assert.ok(html.includes("Бой</h2>") || html.includes("Бой · раунд 2"), "the header names the round");
  assert.ok(html.includes("раунд") && html.includes("Хват"));
  assert.ok(html.includes('data-token="'), "tokens on the map");
  assert.ok(html.includes('data-cell="8,5"'), "the hero stands where the records put him");
  assert.ok(html.includes('data-feature="boulders"') && html.includes('data-feature="hut"'), "cover and walls are drawn");
  assert.ok(html.includes("/preview/live2d/market.jpg"), "the battle background is the place's top-down picture");
  assert.ok(html.includes("13/22"), "enemy HP as numbers on the token");
  assert.ok(html.includes("Текст"), "the text is one click away");
  assert.ok(html.includes("Шар 20 фт") && html.includes("Линия 30 фт"), "area templates");
  assert.ok(html.includes("/preview/live2d/hero.jpg"), "the hero's portrait token");
});

test("the zones view derives from the same coordinates: adjacent, near and far rows, cover and sight tags", () => {
  const html = render("ford", 2, { initialMode: "zones" });
  assert.ok(html.includes('data-zone="adjacent"') && html.includes('data-zone="near"') && html.includes('data-zone="far"'));
  const near = zoneOf(html, "near");
  assert.ok(near.includes("Хват"), "Хват 2 cells away is near");
});

test("the zones rows agree with the distances", () => {
  const html = render("ford", 2, { initialMode: "zones" });
  const near = zoneOf(html, "near"), far = zoneOf(html, "far"), adjacent = zoneOf(html, "adjacent");
  // Hero at (8,5): Хват (9,3) → 10 ft near; Тобин (6,7) → 10 ft near; Косой (13,4) → 25 ft near; Рябой (10,2) → 15 ft near.
  for (const name of ["Хват", "Тобин", "Косой", "Рябой"]) assert.ok(near.includes(name), `${name} is near`);
  assert.ok(!adjacent.includes("Хват") && !far.includes("Хват"));
  assert.ok(near.includes("10 фт") && near.includes("25 фт"), "distances are on the chips");
  const lair = render("lair", 1, { initialMode: "zones" });
  assert.ok(zoneOf(lair, "far").includes("Вельда"), "the caster on the ledge, 60 ft away, is far");
  assert.ok(zoneOf(lair, "near").includes("за укрытием") || zoneOf(lair, "far").includes("за укрытием"), "Грым behind the cart is behind cover");
});

test("the target card shows HP numbers, conditions, «???» for unknown lines and the intent only when noticed; the hero's footer", () => {
  const html = render("ford", 1);
  assert.ok(html.includes('data-target="'), "a target card is shown");
  assert.ok(html.includes("22 / 22") || html.includes("13 / 22"), "HP as numbers");
  assert.ok(html.includes("Вожак; остальные слушают его."), "a revealed line");
  assert.ok(html.includes(">???<"), "unrevealed lines stay «???»");
  assert.ok(html.includes("обойти по валунам") && html.includes("Тобин"), "the intent noticed by Тобин is shown");
  assert.ok(!html.includes("Боится воды"), "an unrevealed line is not printed");
  assert.ok(html.includes("Твой ход, Ярвен"), "the hero's footer when he acts");
  assert.ok(html.includes("Движение") && html.includes("30 фт"));
  const lair = render("lair", 2);
  assert.ok(!lair.includes("держать телегу"), "an unnoticed intent stays hidden");
});

test("the reaction card offers the options; the end-of-fight card sums the log; death saves show", () => {
  const lair = render("lair", 3);
  assert.ok(lair.includes('data-reaction="Щит"') && lair.includes('data-reaction="Принять удар"'), "the reaction choices");
  assert.ok(lair.includes("19 против КД 17"), "the trigger line");
  const dying = render("ford", 3);
  assert.ok(dying.includes("Спасброски от смерти") && dying.includes("✓") && dying.includes("✗"));
  const ended = render("ford", fightRounds("ford"));
  assert.ok(ended.includes('data-end-card="true"'), "the end card");
  assert.ok(ended.includes(">28<") && ended.includes(">14<"), "damage dealt 9+8+11 = 28, taken 14");
  assert.ok(ended.includes("На грани") && ended.includes("Ярвен"));
  assert.ok(ended.includes("Повержены") && ended.includes("Косой"));
  assert.ok(ended.includes("Боя нет"), "no active fight");
});

test("the 2D screen shows the fight banner and switches to the battle view; nothing is sent", () => {
  const sample = battlePreview("ford", 2);
  const refuse = { board: () => assert.fail("render must not read"), send: () => assert.fail("render must not send") };
  const html = renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(PreviewPictures, { board: sample.pictures.board, images: sample.pictures.images },
      createElement(Live2dScreen, { snapshot: sample.snapshot, play: sample.play, transport: refuse, preview: { board: sample.board, placements: live2dPlacements, images: sample.pictures.images, level: "region", anchorId: LIVE2D_IDS.market } }))));
  assert.ok(html.includes("Идёт бой") && html.includes("Открыть карту боя"), "the banner on the region view");
  const direct = renderToStaticMarkup(createElement(LanguageProvider, null,
    createElement(PreviewPictures, { board: sample.pictures.board, images: sample.pictures.images },
      createElement(Live2dScreen, { snapshot: sample.snapshot, play: sample.play, transport: refuse, preview: { board: sample.board, placements: live2dPlacements, images: sample.pictures.images } }))));
  assert.ok(direct.includes('data-slot="'), "with no level chosen, a fight opens the battle view");
  assert.ok(!direct.includes(BATTLE_IDS.khvat.slice(0, 8)) || direct.includes("Хват"));
  language = "en";
  try { assert.ok(render("ford", 2).includes("Your turn") || render("ford", 2).includes("to act")); } finally { language = "ru"; }
});
