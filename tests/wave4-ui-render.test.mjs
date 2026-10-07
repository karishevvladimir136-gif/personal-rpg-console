import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as client from "../src/lib/foundation-loop-client.ts";
import * as fence from "../src/lib/saves/fence.ts";
import { foundationText } from "../src/components/foundation-loop/text.ts";
import { foundationUiFixture } from "./wave4-ui-fixtures.mjs";

const require = createRequire(import.meta.url);
const components = fileURLToPath(
  new URL("../src/components/", import.meta.url),
);
function renderer(language) {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const loadedModule = { exports: {} };
    const localRequire = (name) => {
      if (name.endsWith("language-context"))
        return { useLanguage: () => ({ language, t: (text) => text }) };
      if (name.endsWith("persistence-context"))
        return { useUnsavedChanges: () => {} };
      if (name === "@/lib/foundation-loop-client") return client;
      if (name === "@/lib/saves/fence") return fence;
      if (name.endsWith(".css")) return {};
      if (name.startsWith(".")) {
        const target = resolve(dirname(path), name);
        return load(
          existsSync(`${target}.tsx`) ? `${target}.tsx` : `${target}.ts`,
        );
      }
      return require(name);
    };
    vm.runInThisContext(
      `(function(require, module, exports) { ${output}\n })`,
      { filename: path },
    )(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(resolve(components, "foundation-loop/foundation-loop.tsx"));
}
function render(
  language,
  section,
  initialData = foundationUiFixture(),
  activeTimeline = initialData.command.timeline,
) {
  const { FoundationLoopEditor } = renderer(language);
  return renderToStaticMarkup(
    createElement(FoundationLoopEditor, {
      section,
      initialData,
      activeTimeline,
      load: () => assert.fail("render cannot load"),
      send: () => assert.fail("render cannot write"),
    }),
  );
}

test("actual EN/RU commerce shows funds, stock, restrictions and ordinary Game link", () => {
  for (const language of ["en", "ru"]) {
    const c = foundationText(language),
      html = render(language, "trade");
    for (const key of ["trade", "buy", "sell", "quest", "game", "quote"])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.includes("40"));
    assert.match(html, /max="4"/);
    assert.match(html, /<fieldset disabled="">/);
    assert.match(html, /&lt;script&gt;unsafe\(\)&lt;\/script&gt;/);
    assert.equal(html.includes("<script>unsafe()"), false);
    assert.equal(
      html.includes(c.confirm),
      false,
      "No confirmation until an authoritative quote exists",
    );
    assert.match(html, /href="\/campaigns\/[^\"]+\/game"/);
  }
});

test("Trade keeps the rules profile inside a closed Advanced disclosure", () => {
  for (const language of ["en", "ru"]) {
    const view = foundationUiFixture();
    const profileName = view.profile.id === "world-logic-v1" ? "World Logic" : "Console Basic";
    const html = render(language, "trade", view);
    const advanced = html.match(/<details[^>]*><summary>[^<]*(?:trade rules|правила торговли)<\/summary><p>[^<]*<\/p><\/details>/)?.[0];
    assert.ok(advanced);
    assert.ok(advanced.includes(profileName));
    assert.ok(advanced.includes(foundationText(language).profile));
    const primary = html.replace(advanced, "");
    assert.ok(!primary.includes(profileName));
    assert.ok(!primary.includes(foundationText(language).profile));
    assert.ok(render(language, "settings", view).includes(profileName));
  }
});

test("actual EN/RU progression shows explicit current and earned rank choices", () => {
  for (const language of ["en", "ru"]) {
    const c = foundationText(language),
      html = render(language, "progression");
    for (const key of [
      "pendingTitle",
      "before",
      "after",
      "choose",
      "rewards",
      "claim",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.includes("Mira"));
    assert.ok(html.includes("Trail reading"));
    assert.match(html, /type="radio"/);
    assert.match(html, /<button[^>]*disabled=""[^>]*>[^<]*<\/button>/);
  }
});

test("Off suppresses progress meters and XP while retaining claimable non-progress rewards", () => {
  const view = foundationUiFixture();
  view.progression.enabled = false;
  for (const language of ["en", "ru"]) {
    const c = foundationText(language),
      html = render(language, "progression", view);
    assert.ok(html.includes(c.off));
    assert.equal(html.includes("<progress"), false);
    assert.equal(html.includes('type="radio"'), false);
    assert.equal(html.includes("Fieldcraft"), false);
    assert.ok(html.includes(c.claim));
  }
});

test("owner settings render named correction fields with hidden selector identities", () => {
  for (const language of ["en", "ru"]) {
    const c = foundationText(language),
      html = render(language, "settings");
    for (const key of [
      "resourceKey",
      "unitValue",
      "stock",
      "buyPrice",
      "sellPrice",
      "usesFunds",
      "thresholds",
      "capability",
      "source",
      "recipients",
      "entries",
      "correction",
      "saveCommerce",
      "saveProgression",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.equal(
      /<input[^>]*value="00000000-0000-4000-8000-/.test(html),
      false,
      "identity values belong only in selectors",
    );
    assert.equal(html.includes("JSON"), false);
    assert.match(html, /type="number"/);
    assert.match(html, /href="\/campaigns\/[^\"]+\/inventory"/);
  }
});

test("an active timeline switch freezes old records and offers explicit reload", () => {
  const view = foundationUiFixture();
  const html = render("en", "settings", view, {
    ...view.command.timeline,
    epoch: 2,
  });
  assert.ok(html.includes(foundationText("en").stale));
  assert.ok(
    html.includes(foundationText("en").reload.replaceAll("&", "&amp;")),
  );
  assert.match(html, /<fieldset disabled="">/);
});
