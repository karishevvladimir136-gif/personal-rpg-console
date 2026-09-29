import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./adventure-v1-fixtures.mjs";
import { adventureText } from "../src/components/adventures/text.ts";
import { campaignPremiseText } from "../src/lib/campaign-premise-i18n.ts";
import { translate } from "../src/lib/i18n.ts";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const require = createRequire(import.meta.url);
const fail = () =>
  assert.fail("Rendering must not call a service or mutate state");
const transport = {
  worlds: fail,
  read: fail,
  send: fail,
  createWorld: fail,
  newHero: fail,
};
function modules(overrides = {}) {
  const cache = new Map();
  const load = (path) => {
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return require(path);
    const compiled = ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const mod = { exports: {} };
    cache.set(path, mod.exports);
    const localRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.endsWith(".css") || name === "server-only") return {};
      if (name.startsWith(".") || name.startsWith("@/")) {
        const target = name.startsWith("@/")
          ? resolve(root, name.slice(2))
          : resolve(dirname(path), name);
        return load(
          fs.existsSync(target)
            ? target
            : fs.existsSync(`${target}.tsx`)
              ? `${target}.tsx`
              : `${target}.ts`,
        );
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, {
      filename: path,
    })(localRequire, mod, mod.exports);
    cache.set(path, mod.exports);
    return mod.exports;
  };
  return (relative) => load(resolve(root, relative));
}
function hooks(seed = []) {
  const values = [...seed],
    refs = [];
  let index = 0,
    ri = 0;
  return {
    begin: () => {
      index = 0;
      ri = 0;
    },
    reset: (seed) => {
      values.length = 0;
      values.push(...seed);
      refs.length = 0;
      index = 0;
      ri = 0;
    },
    react: {
      ...React,
      useState: (initial) => {
        const i = index++;
        if (!(i in values))
          values[i] = typeof initial === "function" ? initial() : initial;
        return [
          values[i],
          (next) => {
            values[i] = typeof next === "function" ? next(values[i]) : next;
          },
        ];
      },
      useRef: (initial) => refs[ri++] ?? (refs[ri - 1] = { current: initial }),
      useEffect: () => {},
      useMemo: (fn) => fn(),
      useCallback: (fn) => fn,
    },
  };
}
const walk = (tree) => {
  const nodes = [];
  const visit = (v) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object" && "props" in v) {
      nodes.push(v);
      visit(v.props.children);
    }
  };
  visit(tree);
  return nodes;
};
const html = (component, props) =>
  renderToStaticMarkup(React.createElement(component, props));
const contains = (markup, text) =>
  assert.ok(
    markup.includes(text.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")),
    text,
  );
const label = (language) => ({
  useLanguage: () => ({ language, t: (s, v) => translate(language, s, v) }),
});
const pending = () => {
  const state = {
    pending: null,
    current: { current: null },
    mounted: { current: true },
    ready: true,
  };
  state.remember = (v) => {
    state.pending = v;
    state.current.current = v;
  };
  return state;
};

test("EN/RU Campaigns has one primary World Logic entry, advanced empty creation, and unchanged Continue cards", () => {
  for (const language of ["en", "ru"]) {
    const h = hooks(),
      c = adventureText(language);
    const campaign = { id: id(1), title: "Existing hero", language: "en" };
    const ui = modules({
      react: h.react,
      "./language-context": label(language),
      "./persistence-context": {
        useWorkspaceData: () => ({
          data: { campaigns: [campaign] },
          refresh: fail,
          mutate: fail,
        }),
        useUnsavedChanges: () => {},
      },
    });
    const Component = ui(
      "components/persistent-campaigns.tsx",
    ).PersistentCampaigns;
    const render = () => {
      h.begin();
      return Component();
    };
    let nodes = walk(render());
    const primary = nodes.filter((n) => n.props.primary);
    assert.equal(primary.length, 1);
    assert.equal(primary[0].props.children, c.newCampaign);
    assert.ok(
      nodes.some(
        (n) =>
          n.type === "details" &&
          !n.props.open &&
          walk(n).some((child) => child.props.children === c.createEmpty),
      ),
    );
    assert.ok(
      nodes.some((n) => n.props.href === `/campaigns/${campaign.id}/game`),
    );
    assert.ok(!nodes.some((n) => n.props.children === c.newHero));
    primary[0].props.onClick();
    nodes = walk(render());
    assert.ok(nodes.some((n) => n.type?.name === "NewCampaignForm"));
    assert.ok(!nodes.some((n) => n.type === "form"));
    const emptyHooks = hooks();
    const emptyUi = modules({
      react: emptyHooks.react,
      "./language-context": label(language),
      "./persistence-context": {
        useWorkspaceData: () => ({
          data: { campaigns: [] },
          refresh: fail,
          mutate: fail,
        }),
        useUnsavedChanges: () => {},
      },
    });
    const Empty = emptyUi(
      "components/persistent-campaigns.tsx",
    ).PersistentCampaigns;
    emptyHooks.begin();
    walk(Empty())
      .find((n) => n.props.children === c.createEmpty)
      .props.onClick();
    emptyHooks.begin();
    const empty = walk(Empty());
    assert.ok(empty.some((n) => n.type === "form"));
    assert.ok(!empty.some((n) => n.type?.name === "NewHeroForm"));
  }
});

test("starter Worlds distinguish compatible Worlds from Pack-backed advanced foundations", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture(),
      c = adventureText(language);
    f.worlds.worlds.push({
      ...f.world,
      id: id(13),
      versionId: id(14),
      title: "Advanced foundation",
      packVersionIds: [id(12)],
    });
    const view = html(
      modules()("components/adventures/worlds.tsx").WorldPicker,
      {
        language,
        starter: true,
        worldId: id(13),
        disabled: false,
        initial: f.worlds,
        transport,
        persistPending: false,
        onSelect: fail,
        onCatalog: fail,
        onBusy: fail,
        onDirty: fail,
      },
    );
    contains(view, c.simpleWorlds);
    contains(view, c.packWorlds);
    contains(view, c.foundationHelp);
    assert.doesNotMatch(
      view,
      /compiler|Mark Canon|canon_generation|sourceDigest/,
    );
  }
});

test("World editor has large resizable description, contextual review, no empty Pack section and collapsed optional Pack choices", () => {
  for (const language of ["en", "ru"])
    for (const hasPacks of [false, true]) {
      const f = fixture(),
        c = adventureText(language),
        h = hooks([f.worlds, false, false, true]);
      if (!hasPacks) f.worlds.packs = [];
      const p = pending();
      const ui = modules({
        react: h.react,
        "./use-pending": { usePending: () => p },
      });
      const Picker = ui("components/adventures/worlds.tsx").WorldPicker;
      h.begin();
      const creator = walk(
        Picker({
          language,
          worldId: "",
          disabled: false,
          starter: true,
          initial: f.worlds,
          transport,
          persistPending: false,
          onSelect: fail,
          onCatalog: fail,
          onBusy: fail,
          onDirty: fail,
        }),
      ).find((n) => n.type?.name === "WorldCreator");
      assert.ok(creator);
      h.reset(["World", "A grounded simple setting", [], false, false, ""]);
      const creatorTree = creator.type(creator.props);
      const nodes = walk(creatorTree);
      const textarea = nodes.find((n) => n.type === "textarea");
      assert.equal(textarea.props.rows, 12);
      assert.equal(textarea.props.maxLength, 20000);
      assert.ok(nodes.some((n) => n.props.children === c.reviewWorld));
      assert.ok(!nodes.some((n) => n.props.children === c.noPacks));
      assert.equal(
        nodes.some(
          (n) =>
            n.type === "details" &&
            !n.props.open &&
            walk(n).some((v) => v.props.children === c.advancedFoundation),
        ),
        hasPacks,
      );
      nodes
        .find((n) => n.type === "form")
        .props.onSubmit({ preventDefault() {} });
      h.begin();
      const review = walk(creator.type(creator.props));
      assert.ok(review.some((n) => n.props.children === c.worldCreate));
      assert.ok(review.some((n) => n.props.children === c.editWorld));
    }
  assert.match(
    fs.readFileSync(
      resolve(root, "components/adventures/adventures.module.css"),
      "utf8",
    ),
    /resize: vertical/,
  );
});

test("Hero success routes only to First Adventure, while uncertain retry reuses the exact command", async () => {
  for (const outcome of ["success", "uncertain"]) {
    const f = fixture(),
      c = adventureText("en"),
      p = pending();
    const h = hooks([
      f.worlds,
      f.world.id,
      false,
      false,
      "Campaign",
      "Hero",
      "en",
      true,
      false,
      "",
      null,
    ]);
    const calls = [],
      commandRefs = [];
    let complete = false;
    const ui = modules({
      react: h.react,
      "./use-pending": { usePending: () => p },
    });
    const Form = ui("components/adventures/new-hero.tsx").NewHeroForm;
    const props = {
      language: "en",
      onDirty: () => {},
      onCreated: async () => {
        complete = true;
      },
      onCancel: () => {},
      initialWorlds: f.worlds,
      persistPending: false,
      transport: {
        ...transport,
        newHero: async (command) => {
          calls.push(structuredClone(command));
          commandRefs.push(command);
          if (outcome === "uncertain") throw Error("lost response");
          return { campaignId: id(60) };
        },
      },
    };
    h.begin();
    let tree = Form(props);
    walk(tree)
      .find((n) => n.type === "form")
      .props.onSubmit({ preventDefault() {} });
    await new Promise((resolve) => setImmediate(resolve));
    h.begin();
    tree = Form(props);
    if (outcome === "success") {
      const link = walk(tree).find((n) => n.props.children === c.prepareFirst);
      assert.equal(link.props.href, `/campaigns/${id(60)}/adventures`);
      assert.ok(!walk(tree).some((n) => n.props.href?.endsWith("/game")));
      assert.equal(complete, true);
      assert.equal(p.pending, null);
    } else {
      const retry = walk(tree).find(
        (n) => n.type === "button" && n.props.children === c.retry,
      );
      assert.ok(retry);
      await retry.props.onClick();
      assert.equal(calls.length, 2);
      assert.deepEqual(calls[1], calls[0]);
      assert.equal(commandRefs[0], commandRefs[1]);
      assert.equal(complete, false);
    }
  }
});

test("EN/RU ordinary starter tells the truth about Fighter/Starter Rules and uses Hero-specific review labels", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture(),
      c = adventureText(language);
    const view = html(
      modules()("components/adventures/new-hero.tsx").NewHeroForm,
      {
        language,
        onDirty: fail,
        onCreated: fail,
        onCancel: fail,
        initialWorlds: f.worlds,
        persistPending: false,
        transport,
      },
    );
    for (const t of [
      c.newCampaign,
      c.chooseWorld,
      c.yourHero,
      c.starterHero,
      c.fighterHelp,
      c.reviewHero,
    ])
      contains(view, t);
    assert.doesNotMatch(
      view,
      /Console Basic|full D&amp;D|Edit premise \/ pacing/,
    );
    assert.match(view, /<fieldset disabled="">/);
  }
});

test("fresh Adventure leads with Prepare First Adventure and never offers Game before Start; established play remains accessible", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture(),
      c = adventureText(language),
      Component = modules()(
        "components/adventures/adventures-panel.tsx",
      ).AdventuresPanel;
    f.catalog.adventures = [];
    f.catalog.history = [];
    f.snapshot.publicState = { current_location_id: null };
    const props = {
      snapshot: f.snapshot,
      language,
      initialCatalog: f.catalog,
      initialWorlds: f.worlds,
      transport,
      onDirty: fail,
      onSaved: fail,
      persistPending: false,
    };
    const before = html(Component, props);
    contains(before, c.prepareFirst);
    contains(before, c.firstAdventureHelp);
    assert.ok(!before.includes(`/campaigns/${f.catalog.campaignId}/game`));
    f.snapshot.publicState.current_location_id = id(70);
    assert.ok(
      html(Component, props).includes(
        `/campaigns/${f.catalog.campaignId}/game`,
      ),
    );
    const setup = html(modules()("components/adventures/forms.tsx").SetupForm, {
      language,
      disabled: false,
      onSave: fail,
      onCancel: fail,
      onDirty: fail,
    });
    contains(setup, c.reviewAdventure);
    contains(setup, c.evening);
    assert.doesNotMatch(
      setup,
      /value="detached"|value="canon"|Edit premise \/ pacing/,
    );
  }
});

test("Settings reorder basics/play preferences/premise and keep scoped engine panels mounted inside closed Advanced sections", () => {
  const f = fixture();
  for (const language of ["en", "ru"]) {
    const h = hooks();
    const ui = modules({
      react: h.react,
      "./language-context": label(language),
      "./persistence-context": {
        useCampaignData: () => ({
          data: f.snapshot,
          campaignId: id(1),
          refresh: fail,
        }),
        useUnsavedChanges: () => {},
        useCampaignDraftScope: () => ({ timeline: f.catalog.timeline }),
      },
    });
    h.begin();
    const tree = ui(
      "components/persistent-settings.tsx",
    ).PersistentCampaignSettings();
    const nodes = walk(tree);
    const names = nodes
      .filter((n) => typeof n.type === "function")
      .map((n) => n.type.name);
    assert.ok(
      names.indexOf("CampaignIdentityForm") <
        names.indexOf("CampaignPreferencesForm"),
    );
    assert.ok(
      names.indexOf("CampaignPreferencesForm") <
        names.indexOf("CampaignPremisePanel"),
    );
    const advanced = nodes.filter((n) => n.type === "details");
    assert.equal(advanced.length, 2);
    assert.ok(advanced.every((n) => !n.props.open));
    const production = walk(advanced[0]).find(
      (n) => n.type?.name === "CampaignProductionSettingsPanel",
    );
    assert.ok(production);
    assert.equal(production.props.campaignId, id(1));
    assert.deepEqual(production.props.timeline, f.catalog.timeline);
    assert.equal(typeof production.props.onLoaded, "function");
    assert.equal(
      walk(advanced[1]).filter(
        (n) => n.type?.name === "CampaignPackSettingsPanel",
      ).length,
      1,
    );
    assert.equal(
      walk(advanced[1]).filter((n) => n.type?.name === "FoundationLoopPanel")
        .length,
      1,
    );
  }
});

test("Premise prominently warns it is planning only; examples are optional prose rather than modes", () => {
  for (const language of ["en", "ru"]) {
    const c = campaignPremiseText(language);
    const view = html(
      modules({ "./language-context": label(language) })(
        "components/campaign-premise-fields.tsx",
      ).CampaignPremiseFields,
      { value: { text: "", language }, onChange: fail },
    );
    contains(view, c.planning);
    contains(view, c.examples);
    contains(view, c.boundary);
    assert.ok(view.indexOf(c.planning) < view.indexOf("<textarea"));
    assert.match(view, /<details[^>]*><summary>/);
    assert.doesNotMatch(view, /Two ways to begin|type="radio"/);
  }
});
