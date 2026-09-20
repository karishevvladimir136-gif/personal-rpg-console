import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as client from "../src/lib/campaign-premise-client.ts";
import * as messages from "../src/lib/campaign-premise-i18n.ts";

// Render the actual TSX with only the outer application context replaced.
// No browser, provider, database or fixture route is required.
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
      if (name === "@/lib/campaign-premise-client") return client;
      if (name === "@/lib/campaign-premise-i18n") return messages;
      if (name.endsWith(".css")) return {};
      if (name.startsWith("./"))
        return load(resolve(dirname(path), `${name}.tsx`));
      return require(name);
    };
    vm.runInThisContext(
      `(function(require, module, exports) { ${output}\n })`,
      { filename: path },
    )(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  }
  return load(resolve(components, "campaign-premise.tsx"));
}
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
function current() {
  const original = {
    id: id(101),
    documentId: id(3),
    version: 1,
    text: "  Original\n<script>synthetic()</script>\nИсходный замысел.  ",
    language: "ru",
    reviewStatus: "draft",
    authoredBy: id(4),
    digest: "a".repeat(64),
    previousVersionId: null,
    restoredFromVersionId: null,
    createdAt: "2026-09-20T15:00:00.000Z",
  };
  const latest = {
    ...original,
    id: id(102),
    version: 2,
    text: "Current saved wording",
    previousVersionId: original.id,
  };
  return {
    schemaVersion: 1,
    campaignId: id(1),
    timeline: { timelineId: id(2), epoch: 1 },
    revision: 2,
    current: latest,
    versions: [latest, original],
    olderThan: null,
  };
}
function render(language, data = current(), timeline = data.timeline) {
  const { CampaignPremiseEditor } = renderer(language);
  return renderToStaticMarkup(
    createElement(CampaignPremiseEditor, {
      current: data,
      activeTimeline: timeline,
      defaultLanguage: "en",
      onSave: () => assert.fail("Rendering must not write"),
      onRefresh: () => assert.fail("Rendering must not load"),
      onCommitted: () => assert.fail("Rendering must not publish"),
    }),
  );
}

test("actual EN/RU editor renders substantial input, examples, exact escaped history and separate review", () => {
  for (const language of ["en", "ru"]) {
    const html = render(language);
    const c = messages.campaignPremiseText(language);
    for (const key of [
      "title",
      "label",
      "political",
      "exploration",
      "boundary",
      "reviewTitle",
      "acknowledge",
      "restore",
      "original",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.match(html, /<textarea[^>]*rows="12"[^>]*maxLength="20000"/);
    assert.match(html, /<input[^>]*type="checkbox"/);
    assert.ok(
      html.includes(
        "  Original\n&lt;script&gt;synthetic()&lt;/script&gt;\nИсходный замысел.  ",
      ),
    );
    assert.equal(html.includes("<script>synthetic()"), false);
    const review = html.slice(html.indexOf(c.acknowledge));
    assert.match(
      review,
      /<button[^>]*disabled=""[^>]*>/,
      "Review needs explicit acknowledgement",
    );
    assert.ok(
      !html.includes(id(4)),
      "Internal author identity is not an owner-facing label",
    );
  }
});

test("a timeline switch visibly retains the original draft and disables persistence controls", () => {
  const data = current();
  const html = render("en", data, { ...data.timeline, epoch: 2 });
  assert.ok(html.includes(messages.campaignPremiseText("en").scopeChanged));
  assert.match(html, /<textarea[^>]*>Current saved wording<\/textarea>/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>Save new version<\/button>/);
  assert.match(
    html,
    /<button[^>]*disabled=""[^>]*>Restore as a new draft<\/button>/,
  );
});

test("an empty campaign offers writing without presenting an existing reviewed version", () => {
  const data = { ...current(), revision: 0, current: null, versions: [] };
  const html = render("ru", data);
  assert.ok(html.includes(messages.campaignPremiseText("ru").empty));
  assert.equal(html.includes('type="checkbox"'), false);
  assert.equal(
    html.includes(messages.campaignPremiseText("ru").restore),
    false,
  );
});
