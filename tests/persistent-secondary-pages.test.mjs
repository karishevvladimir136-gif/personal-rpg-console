import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import {
  secondaryPageRecords,
  gallerySubjectAssets,
} from "../src/lib/persistence/secondary-page-model.ts";
import {
  newVisualReference,
  serializeVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
import { translate } from "../src/lib/i18n.ts";

const noCall = () =>
  assert.fail("Closed secondary tools must not load or mutate anything");
const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
function sample() {
  const data = fixture().snapshot;
  const row = {
    id: id("journal-note"),
    campaign_id: data.campaign.id,
    revision: 1,
    updated_at: "2026-01-02T00:00:00Z",
  };
  data.scenes = [
    {
      ...row,
      session_id: data.sessions[0].id,
      sequence: 1,
      role: "note",
      title: "Check the old seal",
      body: "My own theory, not an established fact.",
      settings_revision: 1,
      created_at: row.updated_at,
    },
  ];
  data.assets = [
    {
      ...row,
      id: id("standalone-art"),
      title: "Saved illustration",
      kind: "image",
      storage_path: null,
      description: "An ordinary metadata-only image.",
    },
  ];
  return data;
}

test("secondary projection scopes every family and discards orphan/foreign notes without mutation", () => {
  const data = sample();
  for (const key of [
    "quests",
    "entities",
    "locations",
    "sessions",
    "scenes",
    "assets",
    "items",
  ]) {
    data[key].push({
      ...data[key][0],
      id: id(`foreign-${key}`),
      campaign_id: id("other-campaign"),
      title: "FOREIGN_MARKER",
      name: "FOREIGN_MARKER",
      body: "FOREIGN_MARKER",
      description: "FOREIGN_MARKER",
    });
  }
  data.scenes.push({
    ...data.scenes[0],
    id: id("orphan-note"),
    session_id: id("absent-session"),
    body: "ORPHAN_MARKER",
  });
  const before = JSON.stringify(data);
  const projected = secondaryPageRecords(data);
  assert.doesNotMatch(
    JSON.stringify(projected),
    /FOREIGN_MARKER|ORPHAN_MARKER/,
  );
  assert.equal(
    projected.currentLocation.id,
    data.publicState.current_location_id,
  );
  assert.equal(projected.notes.length, 1);
  assert.equal(JSON.stringify(data), before);
});

test("ordinary items are not promoted to evidence by their names or prose", () => {
  const data = sample();
  data.items[0].name = "Evidence of a murder";
  data.items[0].description = "A rumor says this is a clue.";
  assert.equal(secondaryPageRecords(data).evidenceItems.length, 0);
  data.items[0].category = "evidence";
  assert.equal(secondaryPageRecords(data).evidenceItems.length, 1);
});

test("gallery subject filtering requires approved current saved association; titles cannot assign subjects", () => {
  const data = sample();
  data.assets[0].title = data.entities[0].name;
  assert.equal(gallerySubjectAssets(data, "entity").length, 0);
  const reference = newVisualReference(data, {
    kind: "entity",
    id: data.entities[0].id,
  });
  Object.assign(reference, {
    imageAssetId: data.assets[0].id,
    imageAssetRevision: data.assets[0].revision,
  });
  data.documents = [
    {
      id: id("reference"),
      campaign_id: data.campaign.id,
      revision: 1,
      updated_at: "",
      title: "Saved reference",
      status: "reference",
      current_version_id: id("reference-version"),
      body: serializeVisualMetadata(reference),
    },
  ];
  assert.equal(gallerySubjectAssets(data, "entity").length, 0);
  reference.approval = "approved";
  data.documents[0].body = serializeVisualMetadata(reference);
  assert.equal(gallerySubjectAssets(data, "entity")[0].id, data.assets[0].id);
  data.entities[0].revision++;
  assert.equal(gallerySubjectAssets(data, "entity").length, 0);
});

function render(data, screen, language = "en", tab, reviewOnly = false) {
  const cache = new Map();
  function load(relative) {
    let path = resolve(root, relative);
    if (!existsSync(path)) path += existsSync(path + ".tsx") ? ".tsx" : ".ts";
    if (cache.has(path)) return cache.get(path);
    if (path.endsWith(".json")) return JSON.parse(readFileSync(path, "utf8"));
    const loaded = { exports: {} };
    cache.set(path, loaded.exports);
    const code = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (name) => {
      if (name === "react")
        return {
          ...require(name),
          ...(reviewOnly ? { useSyncExternalStore: () => "open" } : {}),
          useState: (initial) =>
            require("react").useState(
              tab && ["Quests", "World", "Session", "Frames"].includes(initial)
                ? tab
                : initial,
            ),
        };
      if (name.endsWith("language-context"))
        return {
          useLanguage: () => ({
            language,
            t: (key, values) => translate(language, key, values),
          }),
        };
      if (name.endsWith("persistent-records"))
        return {
          RecordBoundary: ({ children }) => children(data),
          RecordEditor: noCall,
          RecordField: noCall,
        };
      if (
        [
          "persistent-game",
          "persistent-saves",
          "persistent-timeline-explorer",
          "persistent-places-belonging",
          "persistent-adventures",
          "persistent-adventure-loot",
          "persistent-visual-frame",
          "session-memory",
          "current-scene-media-frame",
          "current-scene-video",
        ].some((part) => name.endsWith(part))
      )
        return new Proxy({}, { get: () => noCall });
      if (name === "next/link") return { __esModule: true, default: "a" };
      if (name === "next/image") return { __esModule: true, default: "img" };
      if (name.endsWith(".css"))
        return {
          __esModule: true,
          default: new Proxy({}, { get: (_, key) => String(key) }),
        };
      if (name === "server-only") return noCall();
      if (name.startsWith(".") || name.startsWith("@/"))
        return load(
          name.startsWith("@/")
            ? resolve(root, "src", name.slice(2))
            : resolve(dirname(path), name),
        );
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
      filename: path,
    })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  const Component = load("src/components/persistent-secondary-pages.tsx")[
    reviewOnly ? "SecondaryPageView" : "PersistentSecondaryPage"
  ];
  return renderToStaticMarkup(
    createElement(Component, { screen, data, reviewOnly }),
  );
}

for (const language of ["en", "ru"]) {
  for (const screen of ["journal", "map", "sessions", "gallery"]) {
    test(`${language} ${screen}: real public fixture renders without loading collapsed tools or sample art`, () => {
      const data = sample();
      const before = JSON.stringify(data);
      const html = render(data, screen, language);
      assert.match(html, new RegExp(`/campaigns/${data.campaign.id}/game`));
      assert.doesNotMatch(
        html,
        /James|New York|Chicago|Jinn|Convergence|PRIVATE_MARKER|\/art\//,
      );
      assert.match(html, /<details[^>]*><summary>/);
      assert.equal(JSON.stringify(data), before);
    });
  }
}

test("evidence board renders saved notes, not speculative links or fake clues", () => {
  const html = render(sample(), "journal", "en", "Evidence");
  assert.match(html, /Check the old seal/);
  assert.doesNotMatch(html, /evidence-threads|Unknown Sender|Find the sender/);
});

test("local map detail cannot show a previously selected distant place as current", () => {
  const data = sample();
  const html = render(data, "map", "en", "Local");
  assert.match(html, /Safe clearing/);
  assert.doesNotMatch(html, /Second clearing/);
});

test("gallery suppresses malformed reserved metadata rather than rendering raw internal descriptions", () => {
  const data = sample();
  data.assets[0].description = "RPG_REAL_FRAME_ASSET_V1\nRAW_INTERNAL_MARKER";
  const html = render(data, "gallery");
  assert.doesNotMatch(html, /RAW_INTERNAL_MARKER/);
});

for (const [screen, tab] of [
  ["journal", "Quests"],
  ["journal", "Timeline"],
  ["journal", "Locations"],
  ["journal", "Notes"],
  ["map", "World"],
  ["sessions", "Session"],
  ["sessions", "Saves"],
  ["gallery", "Frames"],
  ["gallery", "Visual references"],
]) {
  test(`synthetic ${screen}/${tab}: even open advanced panels never mount API tools`, () => {
    const html = render(sample(), screen, "en", tab, true);
    assert.match(html, /Synthetic UI review/);
    assert.match(html, /does not load or change campaign records/);
    if (tab === "Notes") assert.match(html, /disabled=""/);
  });
}
