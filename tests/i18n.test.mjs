import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
import { translate, languageOptions } from "../src/lib/i18n.ts";
import {
  navigation,
  items,
  clues,
  locations,
  documents,
} from "../src/lib/mock-data.ts";

test("English source dictionary and Russian preserve interpolation parameters", () => {
  const parameters = (text) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [english, translated] of Object.entries(russian)) {
    assert.ok(translated.trim(), `Empty translation: ${english}`);
    assert.deepEqual(parameters(translated), parameters(english), english);
    assert.equal(translate("en", english), english);
    assert.equal(translate("ru", english), translated);
  }
});

test("translator supports both languages, safe fallback, and literal interpolation", () => {
  assert.deepEqual(
    languageOptions.map((option) => option.value),
    ["en", "ru"],
  );
  assert.equal(translate("ru", "Settings"), "Настройки");
  assert.equal(translate("ru", "Session {number}", { number: 4 }), "Сессия 4");
  assert.equal(
    translate("en", "Select {location}", { location: "New York" }),
    "Select New York",
  );
  assert.equal(
    translate("ru", "Select {location}", { location: "$& {unchanged}" }),
    "Выбрать: $& {unchanged}",
  );
  assert.equal(translate("ru", "An unknown key"), "An unknown key");
  assert.equal(translate("ru", "toString"), "toString");
  assert.equal(translate("ru", 4), "4");
});

test("every navigation and player-readable mock field has a Russian translation", () => {
  for (const [, label] of navigation)
    assert.ok(Object.hasOwn(russian, label), label);
  const visibleFields = [
    "name",
    "title",
    "category",
    "detail",
    "mechanics",
    "storage",
    "type",
    "description",
    "region",
    "status",
    "supplies",
    "body",
  ];
  for (const record of [...items, ...clues, ...locations, ...documents]) {
    for (const field of visibleFields) {
      if (field in record)
        assert.ok(Object.hasOwn(russian, record[field]), record[field]);
    }
  }
});

test("UI phrases use the dictionary, including conditional labels and accessibility text", () => {
  const files = readdirSync(new URL("../src/components/", import.meta.url))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => new URL(`../src/components/${file}`, import.meta.url))
    .concat(new URL("../src/app/not-found.tsx", import.meta.url));
  function checkMessage(expression, file) {
    if (ts.isStringLiteral(expression)) {
      assert.ok(
        Object.hasOwn(russian, expression.text),
        `${file}: missing ${expression.text}`,
      );
    } else if (ts.isConditionalExpression(expression)) {
      checkMessage(expression.whenTrue, file);
      checkMessage(expression.whenFalse, file);
    } else if (
      ts.isBinaryExpression(expression) &&
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken
    ) {
      checkMessage(expression.right, file);
    }
  }
  for (const file of files) {
    const ast = ts.createSourceFile(
      file.pathname,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        checkMessage(node.arguments[0], file.pathname);
      if (ts.isJsxText(node))
        assert.ok(
          !/[A-Za-zА-Яа-яЁё]/.test(node.text),
          `${file.pathname}: untranslated JSX ${node.text.trim()}`,
        );
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(ast) === "message" &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      )
        checkMessage(node.initializer, file.pathname);
      if (
        ts.isJsxAttribute(node) &&
        ["title", "label", "aria-label", "placeholder"].includes(
          node.name.getText(ast),
        ) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer)
      ) {
        assert.fail(`${file.pathname}: untranslated ${node.name.getText(ast)}`);
      }
      // Translated display labels must never replace stable selection values or keys.
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(ast) === "key" &&
        node.initializer &&
        ts.isJsxExpression(node.initializer)
      ) {
        assert.ok(
          !node.initializer.getText(ast).includes("t("),
          `${file.pathname}: translated key`,
        );
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
