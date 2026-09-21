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
import { authoringText } from "../src/components/world-lab/authoring-text.ts";
import { worldLabText } from "../src/components/world-lab/text.ts";
import { authoringUiFixture } from "./d2a-ui-fixtures.mjs";
import { labUiFixture } from "./d1-ui-fixtures.mjs";

const require = createRequire(import.meta.url),
  root = fileURLToPath(
    new URL("../src/components/world-lab/", import.meta.url),
  );
function modules() {
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
    const loaded = { exports: {} };
    cache.set(path, loaded.exports);
    const localRequire = (name) => {
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
    };
    vm.runInThisContext(`(function(require,module,exports) { ${source}\n })`, {
      filename: path,
    })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  return {
    panel: load(resolve(root, "world-lab-panel.tsx")).WorldLabPanel,
    editor: load(resolve(root, "world-lab-authoring.tsx")),
  };
}
function render(language, f = authoringUiFixture(language)) {
  const noCall = () =>
    assert.fail("render must not request providers or mutate");
  return renderToStaticMarkup(
    createElement(modules().panel, {
      campaignId: f.campaign.campaignId,
      language,
      initialCatalog: f.campaign,
      initialAuthoringCatalog: f.authoring,
      transport: { load: noCall, send: noCall },
      authoringTransport: { load: noCall, send: noCall },
    }),
  );
}

test("D2A actual EN/RU primary form shows plain-language input, offered model and cost disclosure", () => {
  for (const language of ["en", "ru"]) {
    const f = authoringUiFixture(language, { empty: true }),
      c = authoringText(language),
      d1 = worldLabText(language),
      html = render(language, f);
    for (const value of [
      c.whatIf,
      c.interpret,
      c.interpretCost,
      c.base,
      c.model,
      c.reasoning,
      d1.nonCanon,
      d1.boundary,
      d1.reuse,
    ])
      assert.ok(html.includes(value), value);
    assert.match(html, /<textarea[^>]+maxLength="6000"/);
    assert.ok(html.indexOf(c.interpret) < html.indexOf(d1.reuse));
    assert.doesNotMatch(html, /type="hidden"|contenteditable|<pre/);
    assert.ok(html.includes(`GPT-5.4 · ${c.unavailable}`));
  }
});

test("D2A actual review exposes every safe edit and separately labels source/future/actor assumptions", () => {
  for (const language of ["en", "ru"]) {
    const f = authoringUiFixture(language, { ambiguous: true }),
      c = authoringText(language),
      html = render(language, f);
    for (const key of [
      "title",
      "change",
      "divergenceType",
      "timing",
      "offset",
      "location",
      "actors",
      "threads",
      "assumptions",
      "constraints",
      "baseline",
      "horizon",
      "model",
      "reasoning",
      "policy",
      "policyHelp",
      "evidence",
      "source_fact",
      "future_source",
      "character",
      "owner_assumption",
      "save",
      "approve",
      "approvalHelp",
    ])
      assert.ok(html.includes(c[key].replaceAll("&", "&amp;")), key);
    assert.ok(html.includes(f.draft.proposal.ambiguities[0].question));
    assert.ok(html.includes(c.blockers.ambiguity_unresolved));
    assert.match(html, /<button[^>]*disabled=""[^>]*>[^<]*<svg/);
    assert.equal((html.match(/type="checkbox"/g) ?? []).length, 3);
    assert.doesNotMatch(
      html,
      /inputDigest|baseManifestId|sourceVersionId|executionProfile|leaseGeneration/,
    );
    assert.ok(html.includes(c.policyHelp));
  }
});

test("D2A form conversion retains line edits, finite values and original read-only policy", () => {
  const { editor } = modules(),
    f = authoringUiFixture(),
    review = f.draft.proposal.review;
  const form = editor.compositionReviewForm(review);
  form.title = "Owner title";
  form.changeDescription = "Owner correction";
  form.timingText = "Later today";
  form.offsetMinutes = "10";
  form.locationIndex = 1;
  form.affectedActorIndexes = [1];
  form.affectedThreadIndexes = [];
  form.assumptions = "First owner assumption\n\nSecond owner assumption";
  form.constraints = "Keep resources unchanged";
  form.unchangedBaseline = "The western quay remains closed";
  form.horizonMinutes = "90";
  const parsed = editor.compositionReviewFromForm(form);
  assert.equal(parsed.title, "Owner title");
  assert.equal(parsed.offsetMinutes, 10);
  assert.equal(parsed.horizonMinutes, 90);
  assert.deepEqual(parsed.assumptions, [
    "First owner assumption",
    "Second owner assumption",
  ]);
  assert.deepEqual(parsed.policy, review.policy);
  assert.throws(() =>
    editor.compositionReviewFromForm({ ...form, horizonMinutes: "Infinity" }),
  );
  assert.throws(() =>
    editor.compositionReviewFromForm({ ...form, offsetMinutes: "" }),
  );
  assert.throws(() =>
    editor.compositionReviewFromForm({ ...form, ownerId: "injected" }),
  );
});

test("D2A requested and unavailable states never fabricate approval or silently choose an unavailable model", () => {
  const requested = authoringUiFixture("en", { phase: "requested" }),
    c = authoringText("en");
  const html = render("en", requested);
  assert.ok(html.includes(c.retryInterpret) && html.includes(c.retryHelp));
  assert.equal(html.includes(`>${c.approve}<`), false);
  const unavailable = authoringUiFixture("en", { empty: true });
  unavailable.authoring.models.forEach((m) => {
    m.available = false;
  });
  const noModel = render("en", unavailable);
  assert.ok(noModel.includes(c.modelEmpty));
  assert.match(noModel, /<button[^>]+type="submit"[^>]+disabled=""/);
  unavailable.campaign.bases = [];
  const noBase = render("en", unavailable);
  assert.ok(noBase.includes(c.noBase));
  assert.equal(noBase.includes("<textarea"), false);
});

test("D2A model run has separate explicit Start, pinned usage and committed chronology", () => {
  for (const language of ["en", "ru"]) {
    const f = authoringUiFixture(language, { empty: true }),
      run = labUiFixture(language).runs[0],
      c = worldLabText(language);
    run.status = "prepared";
    run.currentWorldMinutes = run.startWorldMinutes;
    run.checkpoints = run.checkpoints.slice(0, 1);
    run.execution = {
      modelId: "gpt-6-astra",
      reasoning: "max",
      recordedResponses: 0,
      inputTokens: null,
      outputTokens: null,
    };
    f.campaign.runs = [run];
    const html = render(language, f);
    for (const key of [
      "start",
      "runCost",
      "selectedModel",
      "responses",
      "usageUnavailable",
      "history",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.equal(html.includes(`>${c.continue}<`), false);
    assert.ok(html.includes(run.checkpoints[0].summary));
  }
});

test("D2A raw markup remains escaped and private response extras are withheld", () => {
  const f = authoringUiFixture();
  f.draft.proposal.review.changeDescription = "<script>NO_EXECUTION()</script>";
  f.authoring.drafts = [f.draft];
  const html = render("en", f);
  assert.ok(html.includes("&lt;script&gt;NO_EXECUTION()&lt;/script&gt;"));
  assert.equal(html.includes("<script>NO_EXECUTION()"), false);
  f.draft.proposal.privateState = "PRIVATE_NEVER_RENDERED";
  assert.equal(render("en", f).includes("PRIVATE_NEVER_RENDERED"), false);
});
