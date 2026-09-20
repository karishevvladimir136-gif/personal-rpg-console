import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import * as client from "../src/lib/world-library-client.ts";
import * as locale from "../src/lib/world-library-i18n.ts";
import * as oldLocale from "../src/lib/locales/wave2-library.ts";
import {
  compilerFixture,
  description,
  draft,
  id,
} from "./wave3-compiler-fixtures.mjs";
import { approveInput } from "./wave2-library-fixtures.mjs";

const require = createRequire(import.meta.url);

// Exercise actual component event handlers with isolated hooks and synthetic data.
// This is a deterministic interaction harness, not browser/layout acceptance.
function componentHarness(file, language = "en") {
  let cursor = 0;
  const states = [];
  const react = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in states))
        states[slot] = typeof initial === "function" ? initial() : initial;
      return [
        states[slot],
        (next) => {
          states[slot] = typeof next === "function" ? next(states[slot]) : next;
        },
      ];
    },
  };
  const source = readFileSync(
    new URL(`../src/components/world-library/${file}.tsx`, import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  const mocks = {
    react,
    "@/lib/world-library-client": client,
    "@/lib/world-library-i18n": locale,
    "@/lib/locales/wave2-library": oldLocale,
    "../language-context": { useLanguage: () => ({ language }) },
    "../persistence-context": { useUnsavedChanges: () => {} },
    "./authoring": {},
    "./guided-review": {
      ReviewOverview: "ReviewOverview",
      CanonPreview: "CanonPreview",
      RefinementEditor: "RefinementEditor",
    },
    "./compiler-panel": {
      ASSISTANCE_DISCLOSURE:
        "Uses the configured compiler model. An explicit request sends selected source excerpts to the provider and may incur a charge; the cost is unknown here. No substitute model is selected if unavailable.",
    },
    "./world-library.module.css": {},
  };
  new Function("require", "module", "exports", js)(
    (name) => (name in mocks ? mocks[name] : require(name)),
    loaded,
    loaded.exports,
  );
  return (name, props) => {
    cursor = 0;
    return loaded.exports[name](props);
  };
}
function nodes(tree, predicate) {
  const result = [];
  function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    if (predicate(node)) result.push(node);
    walk(node.props?.children);
  }
  walk(tree);
  return result;
}
function label(tree) {
  if (Array.isArray(tree)) return tree.map(label).join("");
  if (tree && typeof tree === "object") return label(tree.props?.children);
  return tree == null ? "" : String(tree);
}
const by = (tree, type, text) =>
  nodes(
    tree,
    (node) =>
      node.type === type && (text === undefined || label(node).trim() === text),
  )[0];

test("description UI captures exact EN/RU text without running compilation and preserves language across UI changes", async () => {
  for (const language of ["en", "ru"]) {
    const render = componentHarness("authoring", language),
      calls = [],
      dirty = [];
    let props = {
      language,
      detail: null,
      busy: false,
      save: async (value) => {
        calls.push(value);
      },
      setDirty: (value) => dirty.push(value),
      onVersion: () => {},
    };
    let tree = render("DescriptionEditor", props);
    assert.equal(calls.length, 0);
    assert.ok(by(tree, "textarea").props.rows >= 14);
    const original =
      language === "ru"
        ? "  Мир с драконами.\r\n😀\n"
        : "  A world with dragons.\r\n😀\n";
    nodes(tree, (node) => node.type === "input")[0].props.onChange({
      target: { value: "Synthetic world" },
    });
    tree = render("DescriptionEditor", props);
    by(tree, "textarea").props.onChange({ target: { value: original } });
    props = { ...props, language: language === "en" ? "ru" : "en" };
    tree = render("DescriptionEditor", props);
    assert.equal(by(tree, "textarea").props.value, original);
    await by(tree, "form").props.onSubmit({ preventDefault() {} });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].action, "source.describe");
    assert.equal(calls[0].text, original);
    assert.equal(calls[0].language, language);
    assert.equal(calls[0].expectedVersionId, null);
    assert.equal(dirty.at(-1), true);
  }
});

test("Describe commands allowlist provenance fields and retain an operation ID only for identical retries", async () => {
  const f = compilerFixture();
  const input = client.ownerDescriptionDraft({
    ...description({ text: "  Original\r\n" }),
    authority: "approved_canon",
    authoredBy: "spoof",
    apiKey: "synthetic",
  });
  assert.deepEqual(
    Object.keys(input).sort(),
    [
      "action",
      "sourceId",
      "expectedVersionId",
      "title",
      "text",
      "language",
      "visibility",
      "knowledge",
    ].sort(),
  );
  const first = client.ownerLibraryAttempt(null, input, id);
  assert.strictEqual(client.ownerLibraryAttempt(first, input, id), first);
  assert.notEqual(
    client.ownerLibraryAttempt(first, { ...input, text: "revision" }, id)
      .operationId,
    first.operationId,
  );
  const saved = await f.service.execute(first);
  assert.deepEqual(await f.service.execute(first), saved);
  const detail = await f.service.source(saved.versionId);
  assert.equal(detail.text, input.text);
  assert.deepEqual(detail.provenance, {
    kind: "owner_authored",
    method: "describe",
    language: "en",
  });
  assert.equal(f.calls.length, 0);
});

test("compiler UI never requests on render; selected source order, model choice and retry fence require clicks", async () => {
  const render = componentHarness("compiler-panel"),
    calls = [];
  const selected = [id(), id()];
  const job = {
    id: id(),
    versionId: id(),
    version: 3,
    status: "indexing",
    checkpoints: [],
    mode: "assisted",
    requestPending: false,
    executionProfile: { modelId: "configured-model", reasoning: "max" },
  };
  const props = {
    language: "en",
    index: { sources: [], packs: [], jobs: [job] },
    selected,
    setSelected() {},
    busy: false,
    dirty: false,
    save: async (value) => calls.push(value),
  };
  let tree = render("CompilerPanel", props);
  assert.equal(calls.length, 0);
  assert.match(label(tree), /may incur a charge/);
  assert.match(label(tree), /configured-model/);
  by(tree, "select").props.onChange({ target: { value: "assisted" } });
  tree = render("CompilerPanel", props);
  await by(tree, "button", "Create assisted job").props.onClick();
  assert.deepEqual(calls[0], {
    action: "compiler.start",
    mode: "assisted",
    sourcePriority: selected,
    maxUnits: 180,
  });
  await by(tree, "button", "Request assisted draft").props.onClick();
  assert.deepEqual(calls[1], {
    action: "compiler.step",
    expectedVersionId: job.versionId,
  });
  const pendingTree = render("CompilerPanel", {
    ...props,
    index: { ...props.index, jobs: [{ ...job, requestPending: true }] },
  });
  assert.equal(by(pendingTree, "button", "Request assisted draft"), undefined);
  assert.match(label(pendingTree), /may lead to another charged request/);
  await by(pendingTree, "button", "Prepare explicit retry").props.onClick();
  assert.deepEqual(calls[2], {
    action: "compiler.retry",
    expectedVersionId: job.versionId,
  });
  for (const status of ["completed", "invalidated"])
    assert.equal(client.ownerCompilerAction({ ...job, status }), null);
});

test("guided review rejects immutably, fences stale edits, and promotes only explicitly selected reviewed claims", async () => {
  const f = compilerFixture(),
    { pack } = await draft(f);
  const body = structuredClone(pack.body),
    rejected = body.claims[1].id;
  body.claims[0] = {
    ...body.claims[0],
    text: "Owner correction",
    origin: "scenario_assumption",
    epistemic: "fact",
    knowledge: "canon_at_entry",
    validFrom: 0,
    authority: "approved_canon",
  };
  const command = client.ownerPackDraft(pack, body, [rejected]);
  assert.equal(command.expectedVersionId, pack.versionId);
  assert.equal(
    command.claims.some((claim) => claim.id === rejected),
    false,
  );
  for (const claim of command.claims)
    for (const forbidden of ["authority", "evidence", "subjectId", "structure"])
      assert.equal(forbidden in claim, false);
  const result = await f.service.execute(
    client.ownerLibraryAttempt(null, command, id),
  );
  const saved = await f.service.pack(result.versionId);
  assert.ok(
    saved.body.claims.every((claim) => claim.authority === "reference"),
  );
  assert.equal(
    (await f.service.pack(pack.versionId)).body.claims.length,
    pack.body.claims.length,
  );
  await assert.rejects(
    () =>
      f.service.execute(
        client.ownerLibraryAttempt(null, client.ownerPackDraft(pack, body), id),
      ),
    /conflict/,
  );
  assert.equal(
    client.ownerClaimCanonEligible(saved.body, saved.body.claims[0]),
    true,
  );
  for (const patch of [
    { knowledge: "future_source" },
    { epistemic: "hypothesis" },
    { validFrom: null },
    { knowledge: "character", knownByEntityIds: [] },
  ])
    assert.equal(
      client.ownerClaimCanonEligible(saved.body, {
        ...saved.body.claims[0],
        ...patch,
      }),
      false,
    );
  const approved = await f.service.execute(
    approveInput(saved, { canonClaimIds: [saved.body.claims[0].id] }),
  );
  assert.equal(
    (await f.service.pack(approved.versionId)).body.claims.filter(
      (claim) => claim.authority === "approved_canon",
    ).length,
    1,
  );
});

test("actual Pack editor keeps Russian enum values stable and clears approval when an owner rejects a claim", async () => {
  const f = compilerFixture(),
    { pack } = await draft(f);
  const render = componentHarness("world-library", "ru"),
    calls = [],
    dirty = [];
  const props = {
    detail: pack,
    sources: [],
    busy: false,
    save: async (value) => calls.push(value),
    setDirty: (value) => dirty.push(value),
    onVersion() {},
  };
  let tree = render("PackEditor", props);
  const visibility = nodes(
    tree,
    (node) => node.type === "select" && node.props.value === "public",
  );
  assert.ok(visibility.length > 0);
  await by(tree, "button", "Отклонить").props.onClick();
  tree = render("PackEditor", props);
  assert.equal(dirty.at(-1), true);
  assert.equal(
    by(tree, "button", "Утвердить проверенную версию пакета").props.disabled,
    true,
  );
  await by(tree, "button", "Сохранить новую версию черновика").props.onClick();
  assert.deepEqual(calls[0].rejectedClaimIds, [pack.body.claims[0].id]);
  assert.equal(calls[0].claims.length, pack.body.claims.length - 1);
  assert.equal(calls[0].expectedVersionId, pack.versionId);
});

test("refinement preserves exact instructions, gates edits and makes no request until explicit submit", async () => {
  const f = compilerFixture(),
    { pack } = await draft(f);
  const render = componentHarness("guided-review"),
    calls = [],
    dirty = [];
  const props = {
    language: "en",
    detail: pack,
    disabled: false,
    save: async (value) => {
      calls.push(value);
      return null;
    },
    onDirty: (value) => dirty.push(value),
  };
  let tree = render("RefinementEditor", props);
  assert.equal(calls.length, 0);
  assert.match(label(tree), /cost is unknown/);
  const original = "  Clarify factions.\nKeep the border disputed.  ";
  by(tree, "textarea").props.onChange({ target: { value: original } });
  tree = render("RefinementEditor", props);
  await by(tree, "form").props.onSubmit({ preventDefault() {} });
  assert.deepEqual(calls[0], {
    action: "pack.refine",
    expectedVersionId: pack.versionId,
    text: original,
    maxUnits: 180,
  });
  assert.equal(
    by(render("RefinementEditor", props), "textarea").props.value,
    original,
  );
  assert.equal(dirty.at(-1), true);
  assert.equal(
    by(render("RefinementEditor", { ...props, disabled: true }), "fieldset")
      .props.disabled,
    true,
  );
});

test("entity identity controls allow direct EN/RU edits and retain blank alias lines while typing", async () => {
  const f = compilerFixture(),
    { pack } = await draft(f);
  for (const language of ["en", "ru"]) {
    const render = componentHarness("guided-review", language);
    let body = structuredClone(pack.body);
    const props = () => ({
      language,
      detail: pack,
      body,
      sources: [],
      rejectedIds: [],
      disabled: false,
      onChange: (next) => {
        body = next;
      },
    });
    let tree = render("ReviewOverview", props());
    const originalId = body.entities[0].id;
    by(tree, "input").props.onChange({
      target: { value: "Орден владельца / Owner Order" },
    });
    tree = render("ReviewOverview", props());
    by(tree, "textarea").props.onChange({ target: { value: "Орден\n" } });
    tree = render("ReviewOverview", props());
    assert.equal(by(tree, "textarea").props.value, "Орден\n");
    by(tree, "textarea").props.onChange({
      target: { value: "Орден\nThe Order" },
    });
    tree = render("ReviewOverview", props());
    by(tree, "select").props.onChange({ target: { value: "faction" } });
    assert.equal(body.entities[0].name, "Орден владельца / Owner Order");
    assert.equal(body.entities[0].kind, "faction");
    assert.deepEqual(body.entities[0].aliases, ["Орден", "The Order"]);
    assert.equal(body.entities[0].id, originalId);
    assert.deepEqual(body.claims, pack.body.claims);
    const disabled = render("ReviewOverview", { ...props(), disabled: true });
    assert.ok(
      nodes(disabled, (node) => node.type === "fieldset").every(
        (node) => node.props.disabled,
      ),
    );
    const vocabulary =
      language === "ru"
        ? ["Отображаемое имя", "Тип сущности", "Другие имена"]
        : ["Display name", "Entity type", "Aliases"];
    for (const text of vocabulary) assert.ok(label(tree).includes(text));
    assert.equal(
      nodes(
        tree,
        (node) =>
          ["input", "textarea"].includes(node.type) &&
          node.props.value === originalId,
      ).length,
      0,
    );
  }
});

test("identity and owner-note changes clear pending review, fence history and save through existing Pack authority", async () => {
  const f = compilerFixture(),
    { pack } = await draft(f);
  for (const language of ["en", "ru"]) {
    const render = componentHarness("world-library", language),
      calls = [];
    const props = {
      detail: pack,
      sources: [],
      busy: false,
      save: async (input) => calls.push(input),
      setDirty() {},
      onVersion() {},
    };
    const w = (key) => locale.worldAuthoringText(language, key);
    let tree = render("PackEditor", props);
    const checks = nodes(
      tree,
      (node) => node.type === "input" && node.props.type === "checkbox",
    );
    for (const check of checks) {
      check.props.onChange({ target: { checked: true } });
      tree = render("PackEditor", props);
    }
    const next = structuredClone(pack.body);
    next.entities[0].name = "Edited by owner";
    by(tree, "ReviewOverview").props.onChange(next);
    tree = render("PackEditor", props);
    assert.equal(
      by(tree, "button", w("Approve reviewed Pack version")).props.disabled,
      true,
    );
    assert.deepEqual(by(tree, "CanonPreview").props.canonIds, []);
    assert.ok(
      nodes(
        tree,
        (node) => node.type === "input" && node.props.type === "checkbox",
      ).every((node) => !node.props.checked),
    );
    const noteLabel = by(
      tree,
      "label",
      w("Owner note / resolution (optional)"),
    );
    by(noteLabel, "textarea").props.onChange({
      target: { value: "  Ответ владельца\nKeep this uncertain.  " },
    });
    tree = render("PackEditor", props);
    await by(tree, "button", w("Save new draft version")).props.onClick();
    assert.equal(calls[0].action, "pack.save");
    assert.equal(calls[0].expectedVersionId, pack.versionId);
    assert.equal(calls[0].entities[0].name, "Edited by owner");
    assert.equal(
      calls[0].unknownNotes[0].note,
      "  Ответ владельца\nKeep this uncertain.  ",
    );
    assert.equal(calls.length, 1);
    assert.equal(
      by(render("PackEditor", { ...props, busy: true }), "ReviewOverview").props
        .disabled,
      true,
    );
    assert.equal(
      by(
        render("PackEditor", {
          ...props,
          detail: {
            ...pack,
            history: [{ ...pack, versionId: id() }, ...pack.history],
          },
        }),
        "ReviewOverview",
      ).props.disabled,
      true,
    );
    await by(tree, "button", w("Discard edit")).props.onClick();
    tree = render("PackEditor", props);
    assert.equal(
      by(tree, "ReviewOverview").props.body.entities[0].name,
      pack.body.entities[0].name,
    );
    assert.equal(
      by(by(tree, "label", w("Owner note / resolution (optional)")), "textarea")
        .props.value,
      "",
    );
    assert.equal(
      by(tree, "button", w("Save new draft version")).props.disabled,
      true,
    );
  }
});

test("new authoring and review vocabulary is bilingual without translating authored content", () => {
  for (const file of [
    "authoring",
    "compiler-panel",
    "guided-review",
    "world-library",
  ]) {
    const source = readFileSync(
      new URL(`../src/components/world-library/${file}.tsx`, import.meta.url),
      "utf8",
    );
    const ast = ts.createSourceFile(
      "ui.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const missing = [];
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(ast) === "w" &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const key = node.arguments[0].text;
        if (
          /[a-z]/i.test(key) &&
          !locale.WORLD_AUTHORING_RU[key] &&
          !oldLocale.WORLD_LIBRARY_RU[key] &&
          !key.includes("SHA-256")
        )
          missing.push(key);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.deepEqual(missing, [], file);
  }
  for (const key of Object.keys(locale.WORLD_AUTHORING_RU))
    assert.match(locale.worldAuthoringText("ru", key), /[А-Яа-я]/u);
  const authored = "My original 🌊\r\nМой мир";
  assert.equal(locale.worldAuthoringText("ru", authored), authored);
});

test("assisted configuration errors stay explicit, sanitized and bilingual without a fallback request", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(
      JSON.stringify({
        error: { code: "not_configured", message: "synthetic provider secret" },
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  };
  try {
    await assert.rejects(
      () =>
        client.writeOwnerLibrary({
          action: "compiler.start",
          operationId: id(),
          sourcePriority: [id()],
          maxUnits: 180,
          mode: "assisted",
        }),
      (error) => {
        assert.match(error.message, /Assistance is unavailable/);
        assert.match(error.message, /No substitute model/);
        assert.doesNotMatch(error.message, /secret/);
        assert.match(
          locale.worldAuthoringText("ru", error.message),
          /недоступна/,
        );
        return true;
      },
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/api/world-library");
    assert.equal(calls[0].options.method, "POST");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
