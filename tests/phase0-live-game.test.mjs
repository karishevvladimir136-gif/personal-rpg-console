import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";

const require = createRequire(import.meta.url);

test("live Game keeps the Phase-0 story and right-rail composition without a large empty scene banner", () => {
  const phase = readFileSync(new URL("../src/components/game.tsx", import.meta.url), "utf8");
  const live = readFileSync(new URL("../src/components/persistent-game.tsx", import.meta.url), "utf8");
  const presentation = [
    "game-title",
    "game-grid gameplay-live",
    "story-column",
    "scene panel",
    "narration",
    "scene-kicker",
    "context-column",
    "character-quick",
    "location-mini",
    "objective",
    "person-row",
    "clue-row",
  ];
  for (const className of presentation) {
    const phaseClass = className === "game-grid gameplay-live" ? "game-grid" : className;
    assert.ok(phase.includes(`className="${phaseClass}"`), `Phase-0 ${phaseClass}`);
    assert.ok(live.includes(`className="${className}"`), `Live ${className}`);
  }
  assert.doesNotMatch(live, /className="scene-art"/);
  assert.match(live, /className=\{gameStyles\.storyFlow\}/);
  const gameOnly = live.slice(live.indexOf("function GameRecords("), live.indexOf("export function PersistentGame("));
  assert.doesNotMatch(gameOnly, /usePreview|<Art\b|mockArtForAsset|James|Jinn|New York/);
});

function viewModel(frameDocuments = []) {
  const source = readFileSync(
    new URL("../src/components/persistent-game.tsx", import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  runInNewContext(js, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (name) => {
      if (name === "react" || name === "react/jsx-runtime") return require(name);
      if (name.endsWith("/real-frame"))
        return {
          realFrameDocuments: () => frameDocuments,
          ownerAcceptedFrameAsset: (_data, asset) => asset.description === "accepted",
        };
      if (name.endsWith("/scene-video/model"))
        return { videoDocuments: () => [], safeVideoAsset: () => false };
      if (name.endsWith("/record-model"))
        return { sceneOrder: (scenes) => scenes.toSorted((a, b) => a.sequence - b.sequence) };
      return { __esModule: true, default: {} };
    },
  });
  return compiledModule.exports.createGameViewModel;
}

function scene(data, name, role, sequence) {
  return {
    id: id(name),
    campaign_id: data.campaign.id,
    session_id: data.sessions[0].id,
    title: name,
    body: `${name} story`,
    role,
    sequence,
    revision: 1,
    settings_revision: 1,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };
}

test("Game view model uses public scene, active companions, objective and recent notes", () => {
  const data = fixture().snapshot;
  const hero = data.entities.find((row) => row.kind === "player");
  const otherPlayer = { ...hero, id: id("other-player"), name: "Other player" };
  const traveler = { ...hero, id: id("traveler"), kind: "companion", name: "Traveler" };
  const away = { ...hero, id: id("away"), kind: "companion", name: "Away" };
  const acquaintance = { ...hero, id: id("acquaintance"), kind: "npc", name: "Known person" };
  data.entities = [otherPlayer, hero, traveler, away, acquaintance];
  const opening = scene(data, "Opening", "narration", 1);
  data.scenes = [
    opening,
    scene(data, "Player action", "player", 2),
    scene(data, "Clue one", "note", 3),
    scene(data, "Clue two", "note", 4),
    scene(data, "Clue three", "note", 5),
    scene(data, "Clue four", "note", 6),
  ];
  data.publicState.current_session_id = data.sessions[0].id;
  data.publicState.current_scene_id = opening.id;
  data.quests = [
    { ...data.quests[0], id: id("closed"), status: "complete", title: "Closed" },
    { ...data.quests[0], id: id("open"), status: "open", title: "Live goal" },
  ];
  const play = {
    configuration: {
      controlledEntityIds: [hero.id],
      presentEntityIds: [hero.id, traveler.id, acquaintance.id],
    },
    turns: [],
  };
  const original = structuredClone({ data, play });
  const view = viewModel()(data, play);
  assert.equal(view.player.name, hero.name);
  assert.deepEqual(Array.from(view.companions, (row) => row.name), ["Traveler"]);
  assert.equal(view.objective.title, "Live goal");
  assert.deepEqual(Array.from(view.clues, (row) => row.title), ["Clue four", "Clue three", "Clue two"]);
  assert.equal(view.story, "Opening story");
  assert.equal(view.showOpening, true);
  assert.deepEqual({ data, play }, original);
});

test("Game scene art requires a completed current-scene result and accepted asset", () => {
  const data = fixture().snapshot;
  const current = scene(data, "Current", "narration", 1);
  data.scenes = [current];
  data.publicState.current_scene_id = current.id;
  const accepted = { ...data.assets[0], id: id("accepted"), description: "accepted" };
  const draft = { ...data.assets[0], id: id("draft"), description: "draft" };
  data.assets = [draft, accepted];
  const docs = [
    { value: { status: "completed", basis: { scene: { id: current.id } }, resultAssetId: accepted.id } },
    { value: { status: "completed", basis: { scene: { id: current.id } }, resultAssetId: draft.id } },
    { value: { status: "completed", basis: { scene: { id: id("other") } }, resultAssetId: draft.id } },
  ];
  assert.equal(viewModel(docs)(data, null).sceneFrame.id, accepted.id);
  assert.equal(viewModel(docs.slice(1))(data, null).sceneFrame, undefined);
});
