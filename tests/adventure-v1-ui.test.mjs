import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./adventure-v1-fixtures.mjs";
import { adventureText } from "../src/components/adventures/text.ts";
import { versionAdventureAttempt } from "../src/lib/adventures/client.ts";
const root = fileURLToPath(new URL("../src/", import.meta.url)),
  require = createRequire(import.meta.url);
function modules(overrides = {}) {
  const cache = new Map();
  const load = (path) => {
    if (cache.has(path)) return cache.get(path);
    const compiled = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const loaded = { exports: {} };
    cache.set(path, loaded.exports);
    const localRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.endsWith(".css") || name === "server-only") return {};
      if (name.startsWith(".") || name.startsWith("@/")) {
        const target = name.startsWith("@/")
          ? resolve(root, name.slice(2))
          : resolve(dirname(path), name);
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
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, {
      filename: path,
    })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  };
  return (relative) => load(resolve(root, relative));
}
const ui = modules(),
  noCall = () =>
    assert.fail("static rendering cannot invoke APIs, models or mutations");
const transport = {
  worlds: noCall,
  read: noCall,
  send: noCall,
  createWorld: noCall,
  newHero: noCall,
};
const escaped = (s) => s.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
const render = (component, props) =>
  renderToStaticMarkup(createElement(component, props));

test("EN/RU setup has natural-language premise, manual review, bounded advisory pacing without unsupported continuity controls", () => {
  for (const language of ["en", "ru"]) {
    const c = adventureText(language),
      html = render(ui("components/adventures/forms.tsx").SetupForm, {
        language,
        disabled: false,
        onSave: noCall,
        onCancel: noCall,
        onDirty: noCall,
      });
    for (const value of [
      c.premise,
      c.reviewAdventure,
      c.quick,
      c.evening,
      c.mini,
      c.custom,
      c.open,
      c.pacingHelp,
    ])
      assert.ok(html.includes(escaped(value)), value);
    assert.match(html, /<textarea required=""[^>]*maxLength="20000"/);
    assert.doesNotMatch(html, /<option value="detached"/);
    assert.doesNotMatch(
      html,
      /Select model|Compare models|secret route|timerMinutes|PC action/,
    );
  }
});
test("existing Hero lifecycle renders exact recorded history; legacy catalog shows no fabricated World association", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture("active"),
      c = adventureText(language);
    const html = render(
      ui("components/adventures/adventures-panel.tsx").AdventuresPanel,
      {
        snapshot: f.snapshot,
        language,
        initialCatalog: f.catalog,
        initialWorlds: f.worlds,
        transport,
        onSaved: noCall,
        onDirty: noCall,
      },
    );
    for (const value of [
      c.existingHelp,
      c.end,
      c.editAdventure,
      c.history,
      f.adventure.premise,
      f.world.title,
    ])
      assert.ok(html.includes(escaped(value)), value);
    assert.doesNotMatch(
      html,
      /manifestId|packVersionIds|PRIVATE_|runtimeRevision|expectedHeadId/,
    );
    const legacy = structuredClone(f.catalog);
    legacy.worldBinding = null;
    legacy.activeAdventureId = null;
    legacy.adventures = [];
    legacy.history = [];
    const empty = render(
      ui("components/adventures/adventures-panel.tsx").AdventuresPanel,
      {
        snapshot: f.snapshot,
        language,
        initialCatalog: legacy,
        initialWorlds: f.worlds,
        transport,
        onSaved: noCall,
        onDirty: noCall,
      },
    );
    assert.ok(empty.includes(escaped(c.legacy)));
    assert.ok(empty.includes(escaped(c.firstAdventureHelp)));
    assert.ok(!empty.includes(escaped(c.bound)));
  }
});
test("owner End review is qualitative and preserves ordinary Campaign continuity", () => {
  for (const language of ["en", "ru"]) {
    const c = adventureText(language),
      html = render(ui("components/adventures/forms.tsx").ReviewForm, {
        language,
        closing: true,
        disabled: false,
        onSave: noCall,
        onCancel: noCall,
        onDirty: noCall,
      });
    for (const value of [
      c.endHelp,
      c.pacingReview,
      c.agencyReview,
      c.rewardsReview,
      c.payoffReview,
      c.notesReview,
    ])
      assert.ok(html.includes(escaped(value)), value);
    assert.equal((html.match(/<textarea/g) ?? []).length, 6);
    assert.doesNotMatch(
      html,
      /type="number"|name="score"|reset inventory|lootAmount/,
    );
  }
});
test("New Hero review is a normal supported Fighter Campaign and explicit owner World selection", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture(),
      c = adventureText(language),
      html = render(ui("components/adventures/new-hero.tsx").NewHeroForm, {
        language,
        initialWorlds: f.worlds,
        transport,
        onDirty: noCall,
        onCreated: noCall,
        onCancel: noCall,
      });
    for (const value of [
      c.newCampaign,
      c.starterHero,
      c.fighterHelp,
      c.heroName,
      c.simpleWorldHelp,
      c.noWorld,
      c.reviewHero,
    ])
      assert.ok(html.includes(escaped(value)), value);
    assert.equal((html.match(/<form/g) ?? []).length, 1);
    assert.doesNotMatch(
      html,
      /name="stats"|name="inventory"|activated Lab|source checkpoint/,
    );
  }
});
test("draft basis detects a head change without silently changing the draft", () => {
  const f = fixture(),
    before = structuredClone(f.catalog),
    same = ui("components/adventures/adventures-panel.tsx").sameAdventureBasis;
  assert.equal(same(before, f.catalog), true);
  for (const value of [
    { ...f.catalog, expectedHeadId: id(99) },
    { ...f.catalog, runtimeRevision: 8 },
    { ...f.catalog, revision: 8 },
    { ...f.catalog, timeline: { ...f.catalog.timeline, epoch: 2 } },
  ])
    assert.equal(same(before, value), false);
  assert.deepEqual(before, f.catalog);
});

test("P0A Start navigates only after confirmed active receipt; failure or unmount never navigates", async () => {
  for (const outcome of ["success", "uncertain", "unmounted", "wrong-active"]) {
    const f = fixture(),
      current = { current: null },
      mounted = { current: true };
    const events = [],
      commands = [];
    const live = modules({
      react: {
        ...React,
        useState: (value) => [
          typeof value === "function" ? value() : value,
          () => {},
        ],
        useMemo: (fn) => fn(),
        useCallback: (fn) => fn,
        useEffect: () => {},
        useRef: (value) => ({ current: value }),
      },
      "./use-pending": {
        usePending: () => ({
          pending: null,
          current,
          mounted,
          ready: true,
          remember: (value) => {
            current.current = value;
          },
        }),
      },
    });
    const tree = live(
      "components/adventures/adventures-panel.tsx",
    ).AdventuresPanel({
      snapshot: f.snapshot,
      language: "en",
      initialCatalog: f.catalog,
      initialWorlds: f.worlds,
      persistPending: false,
      onDirty: () => {},
      onSaved: async () => {
        events.push("refreshed");
        if (outcome === "unmounted") mounted.current = false;
      },
      onStarted: () => events.push("navigate"),
      transport: {
        ...transport,
        send: async (command) => {
          commands.push(command);
          if (outcome === "uncertain") throw new Error("lost response");
          return {
            requestId: command.input.requestId,
            snapshot: {
              ...f.catalog,
              activeAdventureId:
                outcome === "wrong-active" ? null : f.adventure.id,
            },
          };
        },
      },
    });
    const nodes = [];
    const walk = (value) => {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === "object" && "props" in value) {
        nodes.push(value);
        walk(value.props.children);
      }
    };
    walk(tree);
    const button = nodes.find(
      (n) =>
        n.type === "button" && n.props.children === adventureText("en").start,
    );
    assert.ok(button);
    assert.equal(button.props.disabled, false);
    button.props.onClick();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(commands.length, 1);
    assert.equal(commands[0].action, "start");
    assert.deepEqual(
      events,
      outcome === "success"
        ? ["refreshed", "navigate"]
        : outcome === "uncertain"
          ? []
          : ["refreshed"],
    );
    assert.equal(current.current === null, outcome !== "uncertain");
  }
});

test("P0A ordinary Adventure screen wires confirmed Start to its own campaign Game route", () => {
  const f = fixture(),
    paths = [];
  const panel = () => null;
  const live = modules({
    react: { ...React, useState: (value) => [value, () => {}] },
    "next/navigation": {
      useRouter: () => ({ push: (path) => paths.push(path) }),
    },
    "./persistence-context": {
      useCampaignData: () => ({ data: f.snapshot, refresh: async () => {} }),
      useUnsavedChanges: () => {},
    },
    "./language-context": { useLanguage: () => ({ language: "en" }) },
    "./adventures/adventures-panel": { AdventuresPanel: panel },
  });
  const element = live(
    "components/persistent-adventures.tsx",
  ).PersistentAdventures();
  assert.equal(element.type, panel);
  assert.deepEqual(paths, []);
  element.props.onStarted();
  assert.deepEqual(paths, [`/campaigns/${f.catalog.campaignId}/game`]);
});
test("actual Adventure routes reject foreign origin and URL campaign/query drift before adapter calls", async () => {
  const f = fixture(),
    calls = [];
  const routes = modules({ "./auth": {}, "./campaign-authorization": {} });
  const server = routes("lib/server/adventures.ts");
  server.adventureService = async (cid) => {
    calls.push(cid);
    return {
      read: async () => f.catalog,
      perform: async (command) => ({
        requestId: command.input.requestId,
        snapshot: f.catalog,
      }),
      worlds: async () => f.worlds,
    };
  };
  const campaign = routes("app/api/campaigns/[campaignId]/adventures/route.ts"),
    worlds = routes("app/api/worlds/route.ts");
  const context = { params: Promise.resolve({ campaignId: id(1) }) },
    command = versionAdventureAttempt(
      f.catalog,
      id(20),
      "start",
      undefined,
      () => id(250),
    );
  const post = (origin, value) =>
    new Request(`http://localhost/api/campaigns/${id(1)}/adventures`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify(value),
    });
  assert.equal(
    (await campaign.POST(post("https://foreign.invalid", command), context))
      .status,
    403,
  );
  assert.equal(
    (
      await campaign.POST(
        post("http://localhost", {
          ...command,
          input: { ...command.input, campaignId: id(90) },
        }),
        context,
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await campaign.GET(
        new Request(
          `http://localhost/api/campaigns/${id(1)}/adventures?timelineId=${id(2)}&epoch=1&private=true`,
        ),
        context,
      )
    ).status,
    422,
  );
  assert.equal(
    (await worlds.GET(new Request("http://localhost/api/worlds?owner=other")))
      .status,
    422,
  );
  assert.equal(calls.length, 0);
  const valid = await campaign.GET(
    new Request(
      `http://localhost/api/campaigns/${id(1)}/adventures?timelineId=${id(2)}&epoch=1`,
    ),
    context,
  );
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), f.catalog);
  assert.deepEqual(calls, [id(1)]);
});
