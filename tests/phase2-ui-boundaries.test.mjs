import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import baseline from "../src/lib/locales/ru.json" with { type: "json" };
import fragment from "../src/lib/locales/phase2-c-ru.json" with { type: "json" };
import {
  turnFailureLabels,
  turnStatusLabels,
} from "../src/lib/gameplay/client-state.ts";

test("Phase 2 Russian strings preserve interpolation and every UI literal has a translation", () => {
  const dictionary = { ...baseline, ...fragment };
  const params = (text) =>
    [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [source, translated] of Object.entries(fragment)) {
    assert.ok(translated.trim());
    assert.deepEqual(params(source), params(translated), source);
  }
  for (const label of [
    ...Object.values(turnFailureLabels),
    ...Object.values(turnStatusLabels),
  ])
    assert.ok(Object.hasOwn(dictionary, label), label);
  const directory = new URL("../src/components/", import.meta.url);
  for (const file of readdirSync(directory).filter(
    (file) =>
      file.startsWith("gameplay-") ||
      ["persistent-game.tsx", "persistent-dm-chat.tsx"].includes(file),
  )) {
    const ast = ts.createSourceFile(
      file,
      readFileSync(new URL(file, directory), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function phrase(node) {
      if (ts.isStringLiteral(node))
        assert.ok(
          Object.hasOwn(dictionary, node.text),
          `${file}: ${node.text}`,
        );
      else if (ts.isConditionalExpression(node)) {
        phrase(node.whenTrue);
        phrase(node.whenFalse);
      }
    }
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        phrase(node.arguments[0]);
      if (ts.isJsxText(node))
        assert.ok(
          !/[A-Za-zА-Яа-яЁё]/.test(node.text),
          `${file}: untranslated text`,
        );
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
test("persistent dice only presents recorded server checks; replay cannot make network or randomness calls", () => {
  const dice = readFileSync(
    new URL("../src/components/gameplay-dice.tsx", import.meta.url),
    "utf8",
  );
  assert.match(dice, /VisibleCheck/);
  assert.match(dice, /check\.kept/);
  assert.match(dice, /check\.total/);
  assert.match(dice, /check\.dc !== null/);
  assert.match(dice, /prefers-reduced-motion/);
  assert.doesNotMatch(
    dice,
    /Math\.random|crypto\.|fetch\(|resumeTurn|sendTurn|demoFixtures|getDemoResult/,
  );
  assert.match(dice, /controller\.dispose\(\)/);
});
test("new browser components cannot access provider, database or private runtime modules", () => {
  const directory = new URL("../src/components/", import.meta.url);
  for (const file of readdirSync(directory).filter((file) =>
    file.startsWith("gameplay-"),
  )) {
    const source = readFileSync(new URL(file, directory), "utf8");
    assert.doesNotMatch(
      source,
      /OPENAI_API_KEY|SUPABASE_SERVICE|rpg_private|server-contracts|\/server\/dm|dangerouslySetInnerHTML/,
    );
  }
  const chat = readFileSync(
    new URL("../src/components/persistent-dm-chat.tsx", import.meta.url),
    "utf8",
  );
  assert.match(chat, /mode="feedback"/);
  assert.match(chat, /DocumentEditor/);
  assert.doesNotMatch(chat, /document\.save|document\.restore|feedback\.send/);
});
