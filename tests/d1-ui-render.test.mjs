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
import { worldLabText } from "../src/components/world-lab/text.ts";
import { labUiFixture } from "./d1-ui-fixtures.mjs";

const require = createRequire(import.meta.url), root = fileURLToPath(new URL("../src/components/world-lab/", import.meta.url));
function component() {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const output = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const loaded = { exports: {} };
    const localRequire = (name) => {
      if (name.endsWith(".css")) return {};
      if (name.startsWith(".")) {
        const target = resolve(dirname(path), name);
        return load(existsSync(target) ? target : existsSync(`${target}.tsx`) ? `${target}.tsx` : `${target}.ts`);
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports) { ${output}\n })`, { filename: path })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  return load(resolve(root, "world-lab-panel.tsx")).WorldLabPanel;
}
function render(language, initialCatalog = labUiFixture(language)) {
  return renderToStaticMarkup(createElement(component(), { campaignId: initialCatalog.campaignId, language, initialCatalog, transport: { load: () => assert.fail("render must not read"), send: () => assert.fail("render must not mutate") } }));
}

test("D1 actual EN/RU component renders non-canon premise, chronological public history and explicit controls", () => {
  for (const language of ["en", "ru"]) {
    const c = worldLabText(language), catalog = labUiFixture(language), html = render(language, catalog);
    for (const key of ["title", "nonCanon", "scope", "scopeHelp", "assumptions", "changes", "history", "continue", "pause", "cancel"])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.indexOf(catalog.runs[0].checkpoints[0].summary) < html.indexOf(catalog.runs[0].checkpoints[1].summary));
    assert.match(html, /min="1" max="43200" step="1"/);
    assert.equal((html.match(/<input/g) ?? []).length, 2, "Only experiment label and horizon are editable inputs");
    assert.ok(html.includes(catalog.runs[0].checkpoints[1].events[0].text));
    assert.doesNotMatch(html, /<textarea|<pre|contenteditable|type="hidden"/);
  }
});

test("D1 actual empty state explains unavailable approved inputs without authoring or autoapproval", () => {
  for (const language of ["en", "ru"]) {
    const c = worldLabText(language), catalog = labUiFixture(language);
    catalog.bases = []; catalog.scenarios = []; catalog.runs = [];
    const html = render(language, catalog);
    assert.ok(html.includes(c.empty) && html.includes(c.emptyTitle));
    assert.equal(html.includes(c.prepare), false);
    assert.equal(html.includes(c.continue), false);
    assert.equal(html.includes("<input"), false);
  }
});

test("D1 actual terminal and invalidated runs preserve inspection and withhold forbidden controls", () => {
  const c = worldLabText("en");
  for (const status of ["completed", "cancelled"]) {
    const catalog = labUiFixture(); catalog.runs[0].status = status;
    if (status === "completed") catalog.runs[0].currentWorldMinutes = catalog.runs[0].throughWorldMinutes;
    const html = render("en", catalog);
    assert.ok(html.includes(c.history));
    assert.equal(html.includes(`>${c.continue}<`), false);
    assert.equal(html.includes(`>${c.cancel}<`), false);
  }
  const catalog = labUiFixture(); catalog.runs[0].status = "paused"; catalog.runs[0].reason = "source_changed";
  const html = render("en", catalog);
  assert.ok(html.includes(c.reason.source_changed));
  assert.equal(html.includes(`>${c.resume}<`), false);
});

test("D1 actual text escapes source-like markup and rejects private response additions", () => {
  const catalog = labUiFixture();
  catalog.runs[0].checkpoints[0].summary = '<script>PRIVATE_MARKER()</script>';
  const html = render("en", catalog);
  assert.ok(html.includes("&lt;script&gt;PRIVATE_MARKER()&lt;/script&gt;"));
  assert.equal(html.includes("<script>PRIVATE_MARKER()"), false);
  catalog.runs[0].privateState = "SECRET_NOT_RENDERED";
  assert.equal(render("en", catalog).includes("SECRET_NOT_RENDERED"), false);
});
