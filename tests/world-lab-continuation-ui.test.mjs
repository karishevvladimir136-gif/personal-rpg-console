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
import { continuationUiFixture } from "./world-lab-continuation-fixtures.mjs";
import { continuationText } from "../src/components/world-lab/continuation-text.ts";
import { authoringText } from "../src/components/world-lab/authoring-text.ts";

const require = createRequire(import.meta.url);
const root = fileURLToPath(
  new URL("../src/components/world-lab/", import.meta.url),
);
const cache = new Map();
function load(path) {
  if (cache.has(path)) return cache.get(path);
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  cache.set(path, loadedModule.exports);
  function localRequire(name) {
    if (name.endsWith(".css")) return {};
    if (name.startsWith(".")) {
      const target = resolve(dirname(path), name);
      return load(
        existsSync(target)
          ? target
          : existsSync(`${target}.tsx`)
            ? `${target}.tsx`
            : `${target}.ts`,
      );
    }
    return require(name);
  }
  vm.runInThisContext(`(function(require,module,exports) { ${source}\n })`, {
    filename: path,
  })(localRequire, loadedModule, loadedModule.exports);
  cache.set(path, loadedModule.exports);
  return loadedModule.exports;
}
function render(f, props = {}) {
  const noCall = () =>
    assert.fail("render may not call APIs, model, or mutations");
  return renderToStaticMarkup(
    createElement(
      load(resolve(root, "continuation.tsx")).WorldLabContinuation,
      {
        campaignId: f.campaign.campaignId,
        campaign: f.campaign,
        language: f.draft.proposal.language,
        disabled: false,
        onPendingChange: noCall,
        onPrepared: noCall,
        transport: { inspect: noCall, load: noCall, send: noCall },
        ...props,
      },
    ),
  );
}

test("EN/RU inspect then choose child path remains explicit and renders public checkpoint only", () => {
  for (const language of ["en", "ru"]) {
    const f = continuationUiFixture(language),
      c = continuationText(language);
    const selector = render(f);
    assert.ok(selector.includes(c.inspect));
    assert.ok(selector.includes(c.nonCanon));
    assert.equal(selector.includes(c.interpret), false);
    const inspected = render(f, { initialInspection: f.inspection });
    for (const value of [
      c.recorded,
      c.choose,
      f.inspection.checkpoint.summary,
      f.inspection.checkpoint.events[0].text,
    ])
      assert.ok(inspected.includes(value));
    assert.equal(inspected.includes(c.interpret), false);
    assert.doesNotMatch(
      inspected,
      /PRIVATE_|Enter This World|Compare models|sourceInputDigest|headRevision/,
    );
  }
});

test("EN/RU child authoring contains mandatory natural language, one model and cost disclosure", () => {
  for (const language of ["en", "ru"]) {
    const f = continuationUiFixture(language, { empty: true }),
      c = continuationText(language);
    const html = render(f, {
      initialInspection: f.inspection,
      initialCatalog: f.catalog,
    });
    for (const value of [c.whatIf, c.interpret, c.cost, c.model, c.reasoning])
      assert.ok(
        html.includes(value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")),
        value,
      );
    assert.match(html, /<textarea[^>]*maxLength="6000"/);
    assert.match(html, /<option value="gpt-6-astra" selected="">/);
    assert.match(html, /<option value="high" selected="">/);
    assert.doesNotMatch(html, /multiple=""|Enter This World|Compare models/);
  }
});

test("child reuses existing review editor with unresolved timing and disabled approval", () => {
  const f = continuationUiFixture("en", { ambiguous: true }),
    c = authoringText("en");
  f.draft.proposal.review.offsetMinutes = null;
  f.draft.proposal.review.horizonMinutes = null;
  f.draft.proposal.review.timingReview = null;
  f.draft.proposal.blockers = [
    "ambiguity_unresolved",
    "timing_unresolved",
    "timing_review_required",
  ];
  f.catalog.drafts = [f.draft];
  const html = render(f, {
    initialInspection: f.inspection,
    initialCatalog: f.catalog,
  });
  for (const value of [c.confirmTiming, c.save, c.approve, c.timingHelp])
    assert.ok(
      html.includes(value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")),
      value,
    );
  assert.match(html, /<input[^>]*type="number"[^>]*value=""/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>[^<]*(?:<[^>]+>)*Approve/);
  assert.ok(html.includes(f.draft.proposal.ambiguities[0].question));
});

test("blocked checkpoint offers an explanation and no child-authoring action", () => {
  const f = continuationUiFixture(),
    c = continuationText("en");
  const html = render(f, {
    initialInspection: { ...f.inspection, eligible: false },
  });
  assert.ok(html.includes(c.blocked));
  assert.equal(html.includes(c.choose), false);
  assert.equal(html.includes(c.interpret), false);
});
