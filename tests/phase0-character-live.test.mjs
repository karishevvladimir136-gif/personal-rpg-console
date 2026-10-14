import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as React from "react";
import * as JSXRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { characterViewModel } from "../src/lib/character-view-model.ts";
import { EQUIPPED_FILTER, inventoryCategoryLabel, inventoryItemLabel } from "../src/lib/live-inventory-view.ts";
import { itemDisplayDescription } from "../src/lib/persistence/item-description.ts";

function loadPresentation(selectSubjectVisual) {
  const file = new URL("../src/components/phase0-character.tsx", import.meta.url);
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loaded = { exports: {} };
  const stubs = {
    "react": React,
    "react/jsx-runtime": JSXRuntime,
    "next/image": {
      __esModule: true,
      default: ({ unoptimized, ...props }) => {
        void unoptimized;
        return React.createElement("img", props);
      },
    },
    "@/lib/persistence/record-model": { itemIcon: () => "Package" },
    "@/lib/persistence/item-description": { itemDisplayDescription },
    "@/lib/live-inventory-view": { EQUIPPED_FILTER, inventoryCategoryLabel, inventoryItemLabel },
    "@/lib/visual-frame/subject-visual": { selectSubjectVisual },
    "./language-context": { useLanguage: () => ({ language: "en", t: (key) => key }) },
    "./visual-frame/generate-visual": { GenerateVisual: () => null },
    "./ui": {
      Icon: ({ name }) => React.createElement("i", { "data-icon": name }),
      Panel: ({ title, className, children }) => React.createElement("section", { className }, React.createElement("h2", null, title), children),
    },
    "./phase0-character.module.css": { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) },
  };
  const artFile = new URL("../src/components/visual-frame/equipped-item-art.tsx", import.meta.url);
  const artCode = ts.transpileModule(readFileSync(artFile, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const artModule = { exports: {} };
  const artImports = {
    "react/jsx-runtime": JSXRuntime,
    "next/image": stubs["next/image"],
    "@/lib/persistence/record-model": stubs["@/lib/persistence/record-model"],
    "@/lib/visual-frame/subject-visual": stubs["@/lib/visual-frame/subject-visual"],
    "../ui": stubs["./ui"],
  };
  vm.runInThisContext(`(function(require,module,exports){${artCode}\n})`, { filename: artFile.pathname })(
    (name) => {
      if (!(name in artImports)) throw new Error(`Unexpected art import: ${name}`);
      return artImports[name];
    },
    artModule,
    artModule.exports,
  );
  stubs["./visual-frame/equipped-item-art"] = artModule.exports;
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: file.pathname })(
    (name) => {
      if (!(name in stubs)) throw new Error(`Unexpected import: ${name}`);
      return stubs[name];
    },
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

test("Character presentation uses reviewed live attributes and only this hero's public possessions", () => {
  const { snapshot } = fixture();
  const hero = snapshot.entities[0];
  hero.name = "Mira";
  hero.stats = { level: 2, attack: 4, defense: 15, strength: 99 };
  hero.resources = { focus: 3 };
  hero.conditions = ["Winded"];
  hero.character_sheet = {
    schemaVersion: 1,
    mode: "structured_rpg",
    role: "Ranger",
    background: "Knows the north road.",
    level: 2,
    tier: null,
    attributes: {
      strength: 12, dexterity: 16, constitution: 13,
      intelligence: 11, wisdom: 15, charisma: 10,
    },
    skills: ["Tracking"],
    abilities: ["Woodland stride"],
    limitations: [],
    spells: [],
  };
  const sword = {
    ...snapshot.items[0],
    id: id("mira-sword"),
    campaign_id: snapshot.campaign.id,
    owner_entity_id: hero.id,
    equipped_entity_id: hero.id,
    equipped_slot: "hand",
  };
  snapshot.items = [
    sword,
    { ...sword, id: id("other-campaign-item"), campaign_id: id("another-campaign") },
    { ...sword, id: id("other-owner-item"), owner_entity_id: id("another-hero"),
      equipped_entity_id: null, storage_id: snapshot.storages.find((row) => row.kind === "camp").id },
    { ...sword, id: id("remote-owned-item"), owner_entity_id: hero.id,
      equipped_entity_id: null, storage_id: snapshot.storages.find((row) => row.kind === "camp").id },
  ];
  const before = structuredClone(snapshot);
  const model = characterViewModel(
    snapshot,
    hero,
    { capabilities: ["Tracking", "Reads old trails"], limitations: ["No formal magic"] },
    [{ label: "Experience", value: 25, nextThreshold: 100 }],
  );
  assert.equal(model.level, 2);
  assert.deepEqual(model.attributes, [
    ["STR", 12], ["DEX", 16], ["CON", 13],
    ["INT", 11], ["WIS", 15], ["CHA", 10],
  ]);
  assert.deepEqual(model.derivedStats, [["attack", 4], ["defense", 15]]);
  assert.deepEqual(model.skills, ["Tracking", "Reads old trails"]);
  assert.deepEqual(model.abilities, ["Woodland stride"]);
  assert.deepEqual(model.limitations, ["No formal magic"]);
  assert.deepEqual(model.conditions, ["Winded"]);
  assert.deepEqual(model.resources, [["focus", 3]]);
  assert.deepEqual(model.owned.map((item) => item.id), [sword.id, id("remote-owned-item")]);
  assert.deepEqual(model.carried.map((item) => item.id), [sword.id]);
  assert.deepEqual(model.equipped.map((item) => item.id), [sword.id]);
  assert.deepEqual(model.progress, [{ label: "Experience", value: 25, nextThreshold: 100 }]);
  assert.deepEqual(snapshot, before);
});

test("historical Character records have no fabricated attributes, class or powers", () => {
  const { snapshot } = fixture();
  const hero = snapshot.entities[0];
  hero.character_sheet = null;
  hero.details = "A traveler looking for home.";
  hero.stats = {};
  const model = characterViewModel(snapshot, hero);
  assert.equal(model.reviewed, false);
  assert.equal(model.level, null);
  assert.equal(model.sheet.role, null);
  assert.deepEqual(model.attributes, []);
  assert.deepEqual(model.abilities, []);
  assert.deepEqual(model.spells, []);
});

test("narrow Character layout stacks the sheet and exposes every tab", () => {
  const css = readFileSync(new URL("../src/components/phase0-character.module.css", import.meta.url), "utf8");
  const narrow = css.split("@media (max-width: 520px) {")[1];
  assert.ok(narrow, "Character has a narrow-phone breakpoint");
  assert.match(narrow, /\.characterGrid \.characterSheet\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.match(narrow, /\.tabs\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(narrow, /\.paperDoll\s*\{[^}]*border-left:\s*0/s);
  assert.match(narrow, /\.inventoryPanel :global\(\.item-slot-wrap:nth-child\(n\) \.item-tooltip\)\s*\{[^}]*position:\s*fixed;[^}]*left:\s*16px;[^}]*right:\s*16px/s);
});

test("Character renders accepted standalone portrait and item art without a reference", () => {
  const { snapshot } = fixture();
  const hero = snapshot.entities[0];
  hero.equipment_slots = [{ id: "hand", label: "Main hand", accepts: ["weapon"] }];
  const item = { ...snapshot.items[0], owner_entity_id: hero.id, equipped_entity_id: hero.id, equipped_slot: "hand" };
  snapshot.items = [item];
  const model = characterViewModel(snapshot, hero);
  const calls = [];
  const presentation = loadPresentation((_data, subject, options) => {
    calls.push({ subject, options });
    return {
      approval: null,
      image: { kind: "real", url: `/accepted-${subject.kind}.png` },
    };
  });
  const portrait = renderToStaticMarkup(React.createElement(presentation.CharacterEquipmentDoll, {
    data: snapshot, entity: hero, model, onSelect() {}, reviewOnly: true,
  }));
  const inventory = renderToStaticMarkup(React.createElement(presentation.CharacterInventory, {
    data: snapshot, items: [item], onSelect() {},
  }));
  assert.match(portrait, /src="\/accepted-entity\.png"/);
  assert.match(portrait, /src="\/accepted-item\.png"/);
  assert.match(inventory, /src="\/accepted-item\.png"/);
  assert.ok(calls.every((call) => call.options.acceptedOnly === true));
});

test("Character excludes draft art and keeps a literal Equipped category distinct", () => {
  const { snapshot } = fixture();
  const hero = snapshot.entities[0];
  hero.equipment_slots = [{ id: "hand", label: "Main hand", accepts: ["weapon"] }];
  const presentation = loadPresentation((_data, _subject, options) => {
    assert.equal(options.acceptedOnly, true);
    return null; // A draft is excluded by the accepted-only selector.
  });
  const categoryItem = {
    ...snapshot.items[0], id: id("equipped-category"), category: "Equipped",
    owner_entity_id: hero.id, equipped_entity_id: null, name: "Travel kit",
  };
  const wornItem = {
    ...snapshot.items[0], id: id("worn-item"), category: "weapon",
    owner_entity_id: hero.id, equipped_entity_id: hero.id, equipped_slot: "hand", name: "Road sword",
  };
  const items = [categoryItem, wornItem];
  snapshot.items = items;
  const model = characterViewModel(snapshot, hero);
  assert.deepEqual(presentation.filterCharacterInventory(items, EQUIPPED_FILTER, "", "en").map((item) => item.id), [wornItem.id]);
  assert.deepEqual(presentation.filterCharacterInventory(items, "Equipped", "", "en").map((item) => item.id), [categoryItem.id]);
  const portrait = renderToStaticMarkup(React.createElement(presentation.CharacterEquipmentDoll, {
    data: snapshot, entity: hero, model, onSelect() {}, reviewOnly: true,
  }));
  const inventory = renderToStaticMarkup(React.createElement(presentation.CharacterInventory, {
    data: snapshot, items, onSelect() {},
  }));
  assert.doesNotMatch(portrait + inventory, /<img/);
  assert.match(portrait, /Main hand: Road sword/);
  assert.match(portrait, /data-icon="Package"/);
  assert.match(inventory, />Equipped<\/button>/);
  assert.match(inventory, />Category: Equipped<\/button>/);
});
