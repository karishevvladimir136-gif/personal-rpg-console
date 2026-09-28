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
import { projectTimelineExplorer } from "../src/lib/timeline-explorer/projection.ts";
import { timelineText } from "../src/components/timeline-explorer/text.ts";
import { readTimelineSupplement } from "../src/components/timeline-explorer/client.ts";
import { timelineFixture } from "./timeline-explorer-fixtures.mjs";

const require = createRequire(import.meta.url),
  root = fileURLToPath(
    new URL("../src/components/timeline-explorer/", import.meta.url),
  );
function component(customReact, entry = "timeline-explorer.tsx") {
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
    const loaded = { exports: {} };
    const localRequire = (name) => {
      if (name === "react" && customReact) return customReact;
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
    vm.runInThisContext(`(function(require,module,exports) { ${output}\n })`, {
      filename: path,
    })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  const loaded = load(resolve(root, entry));
  return entry === "timeline-explorer-panel.tsx"
    ? loaded.TimelineExplorerPanel
    : loaded.TimelineExplorer;
}
function render(language, source = timelineFixture(), initialBranchKey) {
  return renderToStaticMarkup(
    createElement(component(), {
      projection: projectTimelineExplorer(source),
      language,
      initialBranchKey,
    }),
  );
}

test("Timeline actual EN/RU reader shows chronological scenes, unknown links and read-only lineage", () => {
  for (const language of ["en", "ru"]) {
    const c = timelineText(language),
      html = render(language);
    for (const key of [
      "title",
      "readOnly",
      "active",
      "approximate",
      "search",
      "order",
      "actors",
      "place",
      "consequences",
      "unknown",
      "timeUnknown",
      "currentDirectory",
      "directoryHelp",
      "lineage",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.indexOf("Departure") < html.indexOf("Return"));
    assert.ok(html.includes("Mira") && html.includes("Harbor"));
    assert.match(html, /type="search"/);
    assert.match(html, /href="\/campaigns\/[^/]+\/saves"/);
    assert.doesNotMatch(
      html,
      /<textarea|contenteditable|type="hidden"|Activate|Load save|Enter This World|Promote|<form/,
    );
  }
});

test("Timeline actual NON-CANON reader shows exact checkpoint inspection without exposing event/source/diagnostic IDs", () => {
  for (const language of ["en", "ru"]) {
    const source = timelineFixture(),
      run = source.lab.runs[0],
      c = timelineText(language);
    run.execution = {
      modelId: "mock-recorded-model",
      reasoning: "high",
      recordedResponses: 919191,
      inputTokens: 828282,
      outputTokens: 737373,
    };
    run.scenario.scenarioVersionId = "SCENARIO_SOURCE_CANARY";
    run.privatePlan = "PRIVATE_PLAN_CANARY";
    run.checkpoints[0].events.push({
      id: "PUBLIC_EVENT_SOURCE_ID_CANARY",
      worldMinutes: 350,
      text: "A recorded public event.",
    });
    const html = render(language, source, `lab:${run.id}`);
    for (const key of [
      "nonCanon",
      "labHelp",
      "checkpoint",
      "checkpointIdentity",
      "savedTime",
      "base",
      "unknown",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.includes("mock-recorded-model"));
    assert.ok(html.includes(run.checkpoints[0].id));
    assert.ok(html.includes("A recorded public event."));
    assert.doesNotMatch(
      html,
      /CANARY|919191|828282|737373|Continue|Compare|Activate|Resume|Cancel/,
    );
    assert.equal(html.includes(c.approximate), false);
  }
});

test("Timeline actual empty, unavailable and inactive history states keep honest scope labels", () => {
  const source = timelineFixture(),
    c = timelineText("en");
  source.snapshot.scenes = [];
  assert.ok(render("en", source).includes(c.empty));
  const sibling = source.saves.timelines[1];
  const html = render("en", source, `playable:${sibling.id}`);
  assert.ok(html.includes(c.inactiveHelp) && html.includes("Another crossing"));
  assert.equal(html.includes(c.approximate), false);
  source.saves.timeline = { ...source.saves.timeline, epoch: 99 };
  assert.ok(render("en", source).includes(c.changed));
});

test("Timeline actual record rendering escapes prose and omits unrelated properties", () => {
  const source = timelineFixture();
  source.snapshot.scenes[1].body = "<script>malicious()</script>";
  source.snapshot.privateState = "PRIVATE_CONTEXT_CANARY";
  const html = render("en", source);
  assert.ok(html.includes("&lt;script&gt;malicious()&lt;/script&gt;"));
  assert.doesNotMatch(html, /<script>malicious|PRIVATE_CONTEXT_CANARY/);
});

test("Timeline supplemental reader uses only existing GET endpoints and excludes failed/cross-campaign sources", async () => {
  const source = timelineFixture(),
    requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return Response.json(url.includes("world-lab") ? source.lab : source.saves);
  };
  try {
    const supplement = await readTimelineSupplement(
      source.snapshot.campaign.id,
      "ru",
      new AbortController().signal,
    );
    assert.equal(supplement.saves.campaignId, source.snapshot.campaign.id);
    assert.equal(supplement.lab.campaignId, source.snapshot.campaign.id);
    assert.equal(requests.length, 2);
    for (const request of requests) {
      assert.ok(!request.options.method || request.options.method === "GET");
      assert.equal(request.options.cache, "no-store");
      assert.equal(request.options.credentials, "same-origin");
      assert.equal(request.options.body, undefined);
    }
    assert.equal(
      requests.find((request) => request.url.includes("world-lab")).options
        .headers["Accept-Language"],
      "ru",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  const controller = new AbortController();
  const partial = await readTimelineSupplement(
    source.snapshot.campaign.id,
    "en",
    controller.signal,
    {
      saves: async () => {
        throw new Error("PRIVATE_ERROR_CANARY");
      },
      lab: async () => source.lab,
    },
  );
  assert.equal(partial.saves, null);
  assert.equal(partial.lab.campaignId, source.snapshot.campaign.id);
  const wrong = await readTimelineSupplement(
    source.snapshot.campaign.id,
    "en",
    controller.signal,
    {
      saves: async () => ({ ...source.saves, campaignId: "other" }),
      lab: async () => ({ ...source.lab, campaignId: "other" }),
    },
  );
  assert.deepEqual(wrong, { saves: null, lab: null });
});

test("Timeline responsive styles keep long records within mobile columns and usable controls", () => {
  const css = readFileSync(
    new URL(
      "../src/components/timeline-explorer/timeline-explorer.module.css",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(css, /max-width: 600px/);
  assert.match(css, /max-width: 850px/);
  assert.match(css, /minmax\(0, 1fr\)/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /min-height: 43px/);
  assert.match(css, /focus-visible/);
});

test("Timeline actual panel withdraws optional history on same-epoch corrections and rejects late aborted reads", async () => {
  const slots = [],
    pending = [];
  let cursor = 0;
  const changed = (previous, next) =>
    !previous ||
    previous.length !== next.length ||
    next.some((value, index) => value !== previous[index]);
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: initial };
      return [
        slots[index].value,
        (next) => {
          slots[index].value =
            typeof next === "function" ? next(slots[index].value) : next;
        },
      ];
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (changed(slots[index]?.deps, deps))
        slots[index] = { value: factory(), deps };
      return slots[index].value;
    },
    useEffect(effect, deps) {
      const index = cursor++;
      if (changed(slots[index]?.deps, deps)) {
        const cleanup = slots[index]?.cleanup;
        slots[index] = { deps };
        pending.push(() => {
          cleanup?.();
          slots[index].cleanup = effect();
        });
      }
    },
  };
  const savesCalls = [],
    labCalls = [];
  const transport = {
    saves: () => new Promise((resolve) => savesCalls.push({ resolve })),
    lab: (_campaignId, signal) =>
      new Promise((resolve) => labCalls.push({ resolve, signal })),
  };
  const Panel = component(hooks, "timeline-explorer-panel.tsx");
  const source = timelineFixture();
  let snapshot = source.snapshot;
  const renderPanel = () => {
    cursor = 0;
    return Panel({ snapshot, language: "en", transport }).props;
  };
  const flush = () => {
    while (pending.length) pending.shift()();
  };
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  assert.equal(renderPanel().refreshing, true);
  flush();
  savesCalls[0].resolve(source.saves);
  labCalls[0].resolve(source.lab);
  await tick();
  assert.equal(renderPanel().refreshing, false);
  assert.equal(renderPanel().projection.branches.length, 3);

  snapshot = structuredClone(snapshot); // same epoch, new corrected public snapshot
  snapshot.scenes[0].body = "Owner correction takes priority.";
  const withdrawn = renderPanel();
  assert.equal(withdrawn.refreshing, true);
  assert.equal(withdrawn.projection.branches.length, 1);
  assert.ok(
    JSON.stringify(withdrawn.projection).includes(
      "Owner correction takes priority.",
    ),
  );
  flush();
  snapshot = structuredClone(snapshot);
  snapshot.publicState.revision++;
  renderPanel();
  flush();
  assert.equal(labCalls[1].signal.aborted, true);
  const latestLab = structuredClone(source.lab);
  latestLab.runs[0].label = "Current authorized run";
  savesCalls[2].resolve(source.saves);
  labCalls[2].resolve(latestLab);
  await tick();
  assert.ok(
    JSON.stringify(renderPanel().projection).includes("Current authorized run"),
  );
  const lateLab = structuredClone(source.lab);
  lateLab.runs[0].label = "STALE_READ_CANARY";
  savesCalls[1].resolve(source.saves);
  labCalls[1].resolve(lateLab);
  await tick();
  const final = renderPanel();
  assert.equal(final.refreshing, false);
  assert.ok(
    JSON.stringify(final.projection).includes("Current authorized run"),
  );
  assert.equal(
    JSON.stringify(final.projection).includes("STALE_READ_CANARY"),
    false,
  );
});
