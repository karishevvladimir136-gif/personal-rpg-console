import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { translate } from "../src/lib/i18n.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const react = require("react");
const jsx = require("react/jsx-runtime");
const privateCanary = "PRIVATE_TEST_CANARY_DO_NOT_RENDER";

function publicSnapshot() {
  const data = fixture().snapshot;
  data.timeline = { timelineId: id("review-timeline"), epoch: 1 };
  data.entities[0].name = "Public hero";
  data.entities[0].details = "A recorded public character description.";
  data.entities[0].stats = { level: 3, Agility: 4 };
  data.entities[0].resources = { Focus: 2 };
  data.entities[1].name = "Public companion";
  data.entities[2].name = "Public acquaintance";
  data.items[0].name = "Public recorded item";
  data.quests[0].title = "Public active objective";
  data.quests[0].description = "An established objective description.";
  data.publicState.summary = "Public story summary.";
  const makeScene = (key, role, sequence, body) => ({
    id: id(key),
    campaign_id: data.campaign.id,
    session_id: data.sessions[0].id,
    role,
    title: key,
    body,
    sequence,
    revision: 1,
    settings_revision: 1,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  });
  data.scenes = [
    makeScene(
      "ordinary-narration",
      "narration",
      1,
      "Narrative mentions a clue but is not a saved note.",
    ),
    {
      ...makeScene("recorded-clue", "note", 2, "Public recorded clue."),
      title: "Public recorded clue",
    },
  ];
  data.publicState.current_scene_id = data.scenes[0].id;
  // Deliberately contaminate otherwise public DTOs with extra private properties.
  // Presentation must select its public fields rather than serialize whole records.
  data.privateState = { hidden: privateCanary };
  data.publicState.dm_private = privateCanary;
  data.entities.forEach((entity) => {
    entity.private_notes = privateCanary;
  });
  data.items.forEach((item) => {
    item.private_mechanics = privateCanary;
  });
  return data;
}

/** Mount real components, collect their effects, and block every fetch at the boundary.
 * Open disclosures are forced through the actual useSyncExternalStore consumer.
 * No effectful product component or transport is replaced with a harmless placeholder.
 */
function harness({
  data = publicSnapshot(),
  pathname = "/preview/live-ui",
  language = "en",
  open = true,
} = {}) {
  const cache = new Map();
  const effects = [];
  const requests = [];
  const listeners = [];
  const timers = [];
  const buttons = [];
  const inventoryState = new Map();
  let inventoryHook = 0;
  let snapshot = data;
  const storage = new Map();
  const noMutation = () =>
    assert.fail("Presentation tried to mutate campaign records");
  const browserStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  const sandbox = vm.createContext({
    console,
    URL,
    URLSearchParams,
    AbortController,
    Date,
    Event,
    fetch: async (input) => {
      requests.push(String(input));
      throw new Error("Synthetic test blocked a real transport request");
    },
    window: {
      localStorage: browserStorage,
      sessionStorage: browserStorage,
      addEventListener: (name) => listeners.push(name),
      removeEventListener() {},
      dispatchEvent() {},
      setInterval: () => {
        timers.push("interval");
        return 1;
      },
      clearInterval() {},
      setTimeout: () => {
        timers.push("timeout");
        return 1;
      },
      clearTimeout() {},
      confirm: noMutation,
    },
    document: {
      addEventListener() {},
      removeEventListener() {},
      visibilityState: "visible",
    },
    setTimeout,
    clearTimeout,
    CustomEvent: class extends Event {},
  });
  const context = () => ({
    campaignId: snapshot.campaign.id,
    data: snapshot,
    loading: false,
    error: "",
    refresh: async () => noMutation(),
    mutate: async () => noMutation(),
  });
  const wrappedJsx = (fn) => (type, props, key) => {
    if (type === "button" && props.role === "tab") buttons.push(props);
    return fn(type, props, key);
  };
  function load(relative) {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loadedModule = { exports: {} };
    cache.set(path, loadedModule.exports);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    function localRequire(name) {
      if (name === "react")
        return {
          ...react,
          useEffect: (effect) => {
            effects.push(effect);
          },
          useSyncExternalStore: (_subscribe, _get, server) =>
            open ? "open" : server(),
          useState: (initial) => {
            const actual = react.useState(initial);
            if (!new Error().stack.includes("at InventoryRecords"))
              return actual;
            const key = inventoryHook++;
            if (!inventoryState.has(key)) inventoryState.set(key, actual[0]);
            return [
              inventoryState.get(key),
              (value) =>
                inventoryState.set(
                  key,
                  typeof value === "function"
                    ? value(inventoryState.get(key))
                    : value,
                ),
            ];
          },
        };
      if (name === "react/jsx-runtime")
        return { ...jsx, jsx: wrappedJsx(jsx.jsx), jsxs: wrappedJsx(jsx.jsxs) };
      if (name.endsWith("language-context"))
        return {
          useLanguage: () => ({
            language,
            t: (key, values) => translate(language, key, values),
          }),
        };
      if (name.endsWith("persistence-context"))
        return {
          useCampaignData: context,
          useOptionalCampaignData: context,
          useWorkspaceData: () => ({
            data: { preferences: {} },
            loading: false,
            error: "",
          }),
          CampaignDataPreview: ({ snapshot: next, children }) => {
            snapshot = next;
            return children;
          },
          useCampaignDraftScope: () => ({
            timeline: snapshot.timeline,
            stale: false,
            reset() {},
          }),
          useUnsavedChanges() {},
          TimelineDraftNotice: () => null,
        };
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name === "next/navigation")
        return {
          usePathname: () => pathname,
          useRouter: () => ({ push: noMutation, refresh: noMutation }),
        };
      if (name.endsWith(".css"))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => String(key) }),
        };
      if (name === "server-only")
        return assert.fail("Public UI imported server-only code");
      if (name.startsWith(".") || name.startsWith("@/")) {
        return load(
          name.startsWith("@/")
            ? resolve(root, "src", name.slice(2))
            : resolve(dirname(path), name),
        );
      }
      return require(name);
    }
    vm.runInContext(
      `(function(require,module,exports){${output}\n})`,
      sandbox,
      { filename: path },
    )(localRequire, loadedModule, loadedModule.exports);
    cache.set(path, loadedModule.exports);
    return loadedModule.exports;
  }
  function render(file, exported, props = {}) {
    inventoryHook = 0;
    buttons.length = 0;
    return renderToStaticMarkup(createElement(load(file)[exported], props));
  }
  async function runEffects() {
    for (const effect of effects.splice(0)) effect();
    // Drain rejection/finally chains while keeping all requests inside the barrier.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return {
    load,
    render,
    runEffects,
    requests,
    listeners,
    timers,
    buttons,
    inventoryState,
  };
}

for (const screen of [
  "game",
  "character",
  "inventory",
  "party",
  "journal",
  "map",
  "gallery",
  "sessions",
  "library",
  "settings",
]) {
  test(`synthetic ${screen}: opening disclosures never starts real API requests or gameplay polling`, async () => {
    const h = harness();
    const html = h.render("src/components/live-ui-review.tsx", "LiveUiReview", {
      initialScreen: screen,
    });
    assert.match(html, /SYNTHETIC UI REVIEW/);
    await h.runEffects();
    assert.deepEqual(
      h.requests,
      [],
      "A review panel started a real transport request",
    );
    assert.deepEqual(h.timers, [], "A review panel started runtime polling");
    assert.ok(!h.listeners.includes("rpg-gameplay-changed"));
  });
}

test("gameplay runtime suppresses mount and explicit refresh in reviewOnly mode", async () => {
    const h = harness({ pathname: "/preview/live-ui" });
    let runtime;
    function HookProbe() {
      runtime = h
        .load("src/components/gameplay-runtime.tsx")
        .useGameplayRuntime(true);
      return null;
    }
    renderToStaticMarkup(createElement(HookProbe));
    await h.runEffects();
    assert.equal(await runtime.refresh(), null);
    assert.equal(runtime.loading, false);
    assert.deepEqual(h.requests, []);
    assert.deepEqual(h.timers, []);
    assert.deepEqual(h.listeners, []);
});

test("transport barrier sees live gameplay and live progression requests (positive control)", async () => {
  const h = harness({ pathname: "/campaigns/synthetic/character" });
  h.render("src/components/persistent-records.tsx", "PersistentCharacter");
  await h.runEffects();
  assert.ok(
    h.requests.some((url) => url.includes("foundation")),
    "The real effect must reach the transport barrier",
  );
  h.requests.length = 0;
  function HookProbe() {
    h.load("src/components/gameplay-runtime.tsx").useGameplayRuntime();
    return null;
  }
  renderToStaticMarkup(createElement(HookProbe));
  await h.runEffects();
  assert.ok(h.requests.some((url) => url.includes("play")));
  assert.ok(h.listeners.includes("rpg-gameplay-changed"));
  assert.equal(h.timers.length, 1);
});

test("Game contextual rail renders recorded public state without promoting narration to clues", () => {
  const data = publicSnapshot();
  const before = structuredClone(data);
  const h = harness({ data });
  const html = h.render(
    "src/components/persistent-game.tsx",
    "PersistentGame",
    { reviewOnly: true },
  );
  const start = html.indexOf('<aside class="context-column"');
  assert.ok(start >= 0, "Contextual rail should be present");
  const rail = html.slice(start, html.indexOf("</aside>", start));
  for (const text of [
    "Public hero",
    "Current objective",
    "Public active objective",
    "Traveling companions",
    "Public companion",
    "Public recorded clue",
    "Focus",
    "Safe clearing",
  ])
    assert.ok(rail.includes(text), text);
  assert.ok(!rail.includes("Narrative mentions a clue"));
  const clues = rail.slice(
    rail.indexOf("<summary>Recent known clues</summary>"),
  );
  assert.ok(!clues.includes("ordinary-narration"));
  assert.ok(
    !rail.includes("Public acquaintance"),
    "Known NPCs must not become traveling companions",
  );
  for (const screen of ["character", "map", "journal", "party"])
    assert.ok(rail.includes(`/campaigns/${data.campaign.id}/${screen}`));
  assert.ok(!html.includes(privateCanary));
  assert.deepEqual(data, before);
});

for (const [exported, expected] of [
  ["PersistentCharacter", "Public hero"],
  ["PersistentInventory", "Public recorded item"],
  ["PersistentParty", "Public companion"],
]) {
  test(`${exported} selects public fields, never private record properties`, () => {
    const data = publicSnapshot();
    const before = structuredClone(data);
    const html = harness({ data }).render(
      "src/components/persistent-records.tsx",
      exported,
      { reviewOnly: true },
    );
    assert.ok(html.includes(expected));
    assert.ok(!html.includes(privateCanary));
    assert.deepEqual(data, before);
  });
}

test("Inventory storage tabs select their actual storage and reset a previous category filter", () => {
  const data = publicSnapshot();
  data.items = data.storages.map((storage, index) => ({
    ...data.items[0],
    id: id(`storage-item-${index}`),
    storage_id: storage.id,
    owner_entity_id: storage.entity_id,
    equipped_entity_id: null,
    equipped_slot: null,
    name: `Recorded cargo ${index}`,
    category: `category-${index}`,
  }));
  const h = harness({ data, open: false });
  const render = () =>
    h.render("src/components/persistent-records.tsx", "PersistentInventory", {
      reviewOnly: true,
    });
  let html = render();
  assert.match(html, /Recorded cargo 0/);
  const labels = [
    "Player",
    "Companions",
    "Camp / Shared Stash",
    "Transport &amp; Mounts",
  ];
  for (const label of labels) assert.ok(html.includes(label), label);
  for (let index = 1; index < data.storages.length; index++) {
    // category is the third InventoryRecords useState. A category belonging to
    // the old storage must not hide items after selecting the next group.
    h.inventoryState.set(2, "category-0");
    const tabs = h.buttons;
    assert.equal(tabs.length, data.storages.length);
    tabs[index].onClick();
    html = render();
    assert.ok(html.includes(`Recorded cargo ${index}`));
    for (let other = 0; other < data.storages.length; other++) {
      if (other !== index) assert.ok(!html.includes(`Recorded cargo ${other}`));
    }
    assert.equal(h.buttons[index]["aria-selected"], true);
    assert.equal(h.inventoryState.get(2), "");
  }
});

function publicTurn(overrides = {}) {
  return {
    id: id("public-turn"),
    campaign_id: id("campaign"),
    session_id: id("session"),
    timeline: { timelineId: id("review-timeline"), epoch: 1 },
    mode: "game",
    input: "Public companion: I speak as the hero.",
    companionId: null,
    listenerIds: [],
    status: "committed",
    expectedRevision: 1,
    committedRevision: 2,
    settingsRevision: 1,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    narration:
      "Public companion: A spoken sentence. Public hero: Another sentence.",
    visualDescription: null,
    checks: [],
    proposal: null,
    failure: null,
    canRetry: false,
    canCancel: false,
    privateNarration: privateCanary,
    ...overrides,
  };
}
function turnHtml(data, overrides) {
  return harness({ data }).render(
    "src/components/gameplay-turn.tsx",
    "GameplayTurn",
    {
      turn: publicTurn(overrides),
      busy: false,
      onCommand: () => assert.fail("Rendering submitted a command"),
      onSaved: async () => {},
    },
  );
}

test("turn portrait uses authoritative companionId, never names in input or narration", () => {
  const data = publicSnapshot();
  const hero = turnHtml(data);
  assert.match(
    hero,
    /class="gameplay-speaker-portrait" aria-hidden="true">P<\/span>/,
  );
  assert.match(hero, /class="eyebrow">Public hero<\/span>/);
  assert.match(
    hero,
    /class="gameplay-narration"><span class="eyebrow">DM<\/span>/,
  );
  assert.equal((hero.match(/gameplay-speaker-portrait/g) || []).length, 1);
  const companion = turnHtml(data, {
    companionId: data.entities[1].id,
    input: "Public hero: misleading prose.",
  });
  assert.match(companion, /class="eyebrow">Public companion<\/span>/);
  assert.equal((companion.match(/gameplay-speaker-portrait/g) || []).length, 1);
  assert.ok(!companion.includes(privateCanary));
});

test("feedback, mechanic input, unknown companion and ambiguous player have no invented portrait", () => {
  const data = publicSnapshot();
  for (const overrides of [
    { mode: "feedback" },
    { mode: "mechanic" },
    { companionId: id("unknown-companion") },
  ]) {
    const html = turnHtml(data, overrides);
    assert.ok(!html.includes("gameplay-speaker-portrait"));
  }
  data.entities.push({
    ...data.entities[0],
    id: id("second-player"),
    name: "Second public hero",
  });
  const html = turnHtml(data);
  assert.ok(!html.includes("gameplay-speaker-portrait"));
  assert.match(html, /class="eyebrow">Your action<\/span>/);
});
