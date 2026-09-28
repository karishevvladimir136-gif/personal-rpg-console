import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import ru from "../src/lib/locales/ru.json" with { type: "json" };
import fragment from "../src/lib/locales/phase35-c-ru.json" with { type: "json" };
import {
  mobileCampaignScreens,
  saveNavigation,
} from "../src/lib/saves/navigation.ts";
import {
  SavesClientError,
  savesErrorMessage,
} from "../src/lib/saves/client.ts";
import {
  saveKindLabels,
  timelineChangedMessage,
} from "../src/lib/saves/client-state.ts";

const source = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("Saves is first-class campaign navigation and More retains four permanent mobile essentials", () => {
  const screens = saveNavigation.map(([id]) => id);
  assert.deepEqual(screens.slice(screens.indexOf("library")), [
    "library",
    "gallery",
    "frame",
    "sessions",
    "saves",
    "settings",
  ]);
  assert.ok(screens.indexOf("dm-chat") < screens.indexOf("library"));
  assert.deepEqual(mobileCampaignScreens, [
    "game",
    "character",
    "map",
    "journal",
  ]);
  for (const secondary of ["saves", "timeline", "home", "frame"]) {
    assert.ok(screens.includes(secondary), secondary);
    assert.equal(mobileCampaignScreens.includes(secondary), false, secondary);
  }
  for (const [, label] of saveNavigation) assert.ok(ru[label], label);
  assert.match(
    source("src/components/persistent-shell.tsx"),
    /more-campaign-nav/,
  );
});
test("save controls, recovery errors and correction scope explanations are translated with matching parameters", () => {
  const dictionary = { ...ru, ...fragment };
  const params = (text) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((value) => value[1]).sort();
  for (const [key, value] of Object.entries(fragment)) {
    assert.ok(value.trim());
    assert.deepEqual(params(key), params(value), key);
  }
  for (const label of [
    ...Object.values(saveKindLabels),
    timelineChangedMessage,
    ...[
      "unauthenticated",
      "forbidden",
      "conflict",
      "busy",
      "restricted",
      "validation",
      "not_found",
      "not_configured",
      "unavailable",
    ].map((code) => savesErrorMessage(new SavesClientError(code))),
  ])
    assert.ok(dictionary[label], label);
  for (const file of [
    "persistent-saves",
    "persistent-shell",
    "persistent-documents",
    "persistent-settings",
    "persistence-context",
    "gameplay-composer",
  ]) {
    const ast = ts.createSourceFile(
      file,
      source(`src/components/${file}.tsx`),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function phrase(node) {
      if (ts.isStringLiteral(node))
        assert.ok(dictionary[node.text], `${file}: ${node.text}`);
      else if (ts.isConditionalExpression(node)) {
        phrase(node.whenTrue);
        phrase(node.whenFalse);
      }
    }
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        phrase(node.arguments[0]);
      if (file === "persistent-saves" && ts.isJsxText(node))
        assert.doesNotMatch(
          node.text,
          /[A-Za-zА-Яа-яЁё]/,
          `untranslated JSX ${node.text}`,
        );
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
test("Saves UI uses public DTOs and transport only; no provider, private read, or gameplay mutation is dispatched", () => {
  for (const file of [
    "src/components/persistent-saves.tsx",
    "src/lib/saves/client.ts",
    "src/lib/saves/client-state.ts",
  ]) {
    const contents = source(file);
    assert.doesNotMatch(
      contents,
      /server-contracts|rpg_private|\/server\/|OPENAI_API_KEY|SUPABASE_SERVICE|dangerouslySetInnerHTML|Math\.random/,
    );
    assert.doesNotMatch(
      contents,
      /\b(?:resumeTurn|sendTurn|endSession|continueSession|retryMemory)\s*\(/,
    );
    assert.doesNotMatch(
      contents,
      /hiddenCount|privateCount|privateCheckpoint|privatePlan/,
    );
  }
});
test("mobile save controls wrap and support narrow screens without adding another permanent bottom item", () => {
  const css = source("src/app/saves.css");
  assert.match(css, /\.persistent-saves \.button[^}]+min-height:\s*44px/);
  assert.match(css, /\.persistent-saves \.button[^}]+white-space:\s*normal/);
  assert.match(
    css,
    /@media \(max-width: 760px\)[\s\S]+grid-template-columns:\s*minmax\(0, 1fr\)/,
  );
  assert.match(css, /\.saved-game-details dd[^}]+overflow-wrap:\s*anywhere/);
});
