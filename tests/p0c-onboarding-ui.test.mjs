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

test("EN/RU Campaigns keeps creation and real-data Continue cards", () => {
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
    const card = nodes.find(
      (n) =>
        n.type?.name === "CampaignCard" &&
        n.props.campaign.id === campaign.id,
    );
    assert.ok(card);
    h.reset([]);
    assert.ok(
      walk(card.type(card.props)).some(
        (n) => n.props.href === `/campaigns/${campaign.id}/game`,
      ),
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

test("campaign card screenshot adapter uses supplied public records without fetching live data", () => {
  const h = hooks();
  h.react.useEffect = (effect) => effect();
  const campaign = {
    id: id(1),
    title: "Fixture world",
    subtitle: "A quiet road",
    language: "en",
  };
  const snapshot = {
    campaign,
    publicState: {
      current_session_id: id(2),
      current_scene_id: id(3),
      current_location_id: id(4),
    },
    sessions: [{ id: id(2), title: "The Return" }],
    scenes: [{ id: id(3), title: "At the bridge" }],
    locations: [{ id: id(4), name: "Old Bridge" }],
    entities: [{ id: id(5), kind: "player", name: "Mara", stats: { level: 2 } }],
    assets: [],
  };
  const ui = modules({
    react: h.react,
    "./language-context": label("en"),
    "@/lib/persistence/client": { loadCampaign: fail },
  });
  const Review = ui("components/persistent-campaigns.tsx").CampaignCardsReview;
  const card = walk(
    Review({ campaigns: [campaign], snapshots: { [campaign.id]: snapshot } }),
  ).find((node) => node.type?.name === "CampaignCard");
  assert.ok(card);
  h.begin();
  const nodes = walk(card.type(card.props));
  const strings = (value) =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(strings)
        : [];
  const visibleText = nodes.flatMap((node) => strings(node.props.children)).join(" ");
  for (const value of ["The Return", "At the bridge", "Old Bridge", "Mara"])
    assert.ok(visibleText.includes(value), value);
  assert.deepEqual(
    nodes
      .filter((node) => typeof node.props.href === "string")
      .map((node) => node.props.href),
    [
      "/preview/live-ui?screen=game",
      "/preview/live-ui?screen=library",
      "/preview/live-ui?screen=sessions",
    ],
  );
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
    assert.equal(advanced.length, 4);
    assert.ok(advanced.every((n) => !n.props.open));
    assert.ok(
      walk(advanced[0]).some(
        (n) => n.type?.name === "CampaignIdentityForm",
      ),
    );
    const production = walk(advanced[1]).find(
      (n) => n.type?.name === "CampaignProductionSettingsPanel",
    );
    assert.ok(production);
    assert.equal(production.props.campaignId, id(1));
    assert.deepEqual(production.props.timeline, f.catalog.timeline);
    assert.equal(typeof production.props.onLoaded, "function");
    assert.equal(
      walk(advanced[2]).filter(
        (n) => n.type?.name === "PersistentAdventures",
      ).length,
      1,
    );
    assert.equal(
      walk(advanced[3]).filter(
        (n) => n.type?.name === "CampaignPackSettingsPanel",
      ).length,
      1,
    );
    assert.equal(
      walk(advanced[3]).filter((n) => n.type?.name === "FoundationLoopPanel")
        .length,
      1,
    );
    h.begin();
    const review = walk(
      ui("components/persistent-settings.tsx").PersistentCampaignSettings({
        reviewOnly: true,
      }),
    );
    assert.ok(
      review.some((node) => node.type?.name === "CampaignSettingsReview"),
    );
    assert.ok(
      !review.some(
        (node) => node.type?.name === "CampaignProductionSettingsPanel",
      ),
    );
  }
});

// Fix run after session 2 (item 25): one document panel — it opens only when a document is picked, reads the text as
// Markdown, «Изменить» turns the same panel into the editor (no nested fold), and a save closes it back to the list
// with «Сохранено» on the saved row.
test("live Library groups real public documents; the picked document reads in one panel that turns into its editor", () => {
  for (const language of ["en", "ru"]) {
    const h = hooks();
    const record = {
      id: id(23),
      campaign_id: id(1),
      title: "Old Road Notes",
      body: "Public route notes only.",
      status: "canon",
      revision: 2,
      current_version_id: id(24),
    };
    const data = {
      campaign: { id: id(1), title: "Current world" },
      documents: [record],
      dmGuideDocumentId: id(99),
    };
    const ui = modules({
      react: h.react,
      "./language-context": label(language),
      "./persistence-context": {
        useCampaignData: () => ({ data, campaignId: id(1), refresh: fail }),
      },
    });
    const Library = ui("components/persistent-documents.tsx").PersistentLibrary;
    const render = () => {
      h.begin();
      return walk(Library());
    };
    let nodes = render();
    const tabs = nodes.find((node) => node.type?.name === "Tabs");
    assert.deepEqual(tabs?.props.options, [
      "All documents",
      "Canon",
      "Reference",
      "Archived",
    ]);
    const panelOf = (list) => list.find((node) => node.type?.name === "Panel" && node.props.className === "document-panel");
    assert.ok(!panelOf(nodes), "no document panel until a document is picked");
    assert.ok(!nodes.some((node) => node.type?.name === "LibraryDocumentEditor"));
    const row = nodes.find(
      (node) =>
        node.type === "button" && node.props.className === "document-row",
    );
    assert.ok(row);
    row.props.onClick();
    nodes = render();
    const body = nodes.find((node) => node.props.className === "persistence-document-body");
    assert.equal(body?.props.children.type?.name, "MarkdownView", "the document reads as rendered Markdown");
    assert.equal(body.props.children.props.text, record.body);
    assert.ok(!nodes.some((node) => node.type?.name === "LibraryDocumentEditor"), "reading comes first");
    assert.ok(!nodes.some((node) => node.type === "details" && walk(node).some((child) => child.type?.name === "LibraryDocumentEditor")), "no editor folded under the reader");
    const edit = walk(panelOf(nodes).props.action).find((node) => node.type?.name === "Button" && !node.props.label);
    assert.equal(edit.props.children, language === "ru" ? "Изменить" : "Edit this document");
    edit.props.onClick();
    nodes = render();
    const editor = nodes.find((node) => node.type?.name === "LibraryDocumentEditor");
    assert.ok(editor, "the same panel turns into the editor");
    assert.equal(editor.props.record, record);
    assert.ok(!nodes.some((node) => node.props.className === "persistence-document-body"));
    editor.props.onSaved(record.id);
    nodes = render();
    assert.ok(!panelOf(nodes), "saving closes the document panel");
    assert.ok(nodes.some((node) => node.props.className === "document-saved" && node.props.children === (language === "ru" ? "Сохранено" : "Saved")),
      "«Сохранено» on the saved row");
    nodes.find((node) => node.type?.name === "Button" && node.props.primary).props.onClick();
    nodes = render();
    assert.ok(nodes.some((node) => node.type?.name === "LibraryDocumentEditor" && !node.props.record), "«Новый документ» opens an empty editor");
  }
});

test("synthetic Library review keeps document detail read-only without version loading", () => {
  const h = hooks();
  const record = {
    id: id(23),
    campaign_id: id(1),
    title: "Harbor notes",
    body: "Public details only.",
    status: "canon",
    revision: 1,
    current_version_id: id(24),
  };
  const ui = modules({
    react: h.react,
    "./language-context": label("en"),
    "./persistence-context": {
      useCampaignData: () => ({
        data: {
          campaign: { id: id(1), title: "Fixture world" },
          documents: [record],
          dmGuideDocumentId: null,
        },
        campaignId: id(1),
        refresh: fail,
      }),
    },
  });
  const Library = ui("components/persistent-documents.tsx").PersistentLibrary;
  h.begin();
  let nodes = walk(Library({ reviewOnly: true }));
  assert.ok(!nodes.some((node) => node.type?.name === "DocumentEditor"));
  assert.ok(!nodes.some((node) => node.props.children === "New Document"));
  assert.ok(nodes.some((node) => node.type === "details"));
  nodes.find((node) => node.type === "button" && node.props.className === "document-row")
    .props.onClick();
  h.begin();
  nodes = walk(Library({ reviewOnly: true }));
  assert.ok(nodes.some((node) => node.props.className === "persistence-document-body"));
  assert.ok(!nodes.some((node) => node.type?.name === "DocumentEditor"));
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
