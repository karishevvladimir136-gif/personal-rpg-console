import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { WORLD_LIBRARY_RU, worldLibraryText, worldLibraryCompilerNote } from "../src/lib/world-library/ui-language.ts";

test("owner authoring vocabulary switches EN/RU without changing stored source text", () => {
  for (const label of ["World Library", "Preserve source", "Version history", "Compile a draft", "Possible contradictions", "Approve reviewed Pack version", "Source knowledge only", "Future source events only", "This version changed. Reload and review the latest version before saving."]) {
    assert.equal(worldLibraryText("en", label), label);
    assert.match(worldLibraryText("ru", label), /[А-Яа-я]/u);
  }
  assert.equal(worldLibraryText("ru", "{title} · version {n}", { title: "Mara's source", n: 4 }), "Mara's source · версия 4");
  const original = "My private source 🌊\r\nlocation: Harbor";
  assert.equal(worldLibraryText("ru", original), original);
  assert.match(worldLibraryCompilerNote("ru", "Some source lines remain unindexed (2/5). Originals remain available."), /2\/5/);
  assert.match(worldLibraryCompilerNote("ru", "“Mara” occurs in separate source identities. They were not merged; review whether they denote the same entity."), /«Mara»/);
});

test("owner UI uses shared language state and localizes every visible static label except format examples", async () => {
  const source = await readFile(new URL("../src/components/world-library/world-library.tsx", import.meta.url), "utf8");
  assert.match(source, /useLanguage\(\)/);
  assert.match(source, /worldLibraryText\(language, key, values\)/);
  assert.match(source, /\{t\(error\)\}/);
  assert.match(source, /\{t\(notice\)\}/);
  const parsed = ts.createSourceFile("ui.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const missing = [], literalUi = [];
  const stable = new Set(["Markdown", "SHA-256:", "· SHA-256"]);
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(parsed) === "t" && ts.isStringLiteral(node.arguments[0])) {
      const key = node.arguments[0].text;
      if (/[A-Za-z]/.test(key) && !WORLD_LIBRARY_RU[key] && !stable.has(key)) missing.push(key);
    }
    if (ts.isJsxText(node) && /[A-Za-z]/.test(node.text)) {
      const parent = node.parent;
      if (!ts.isJsxElement(parent) || parent.openingElement.tagName.getText(parsed) !== "code") literalUi.push(node.text.trim());
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  assert.deepEqual(missing, []);
  assert.deepEqual(literalUi, []);
});
