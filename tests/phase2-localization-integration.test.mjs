import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import ru from "../src/lib/locales/ru.json" with { type: "json" };

test("conditional action labels and the saved house-profile label translate in Russian", () => {
  assert.ok(ru["Console basic house rules"]);
  for (const name of ["gameplay-actions", "gameplay-combat"]) {
    const file = new URL(`../src/components/${name}.tsx`, import.meta.url);
    const ast = ts.createSourceFile(
      name,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function literal(node) {
      if (ts.isStringLiteral(node))
        assert.ok(ru[node.text], `Missing translated control: ${node.text}`);
      else if (ts.isConditionalExpression(node)) {
        literal(node.whenTrue);
        literal(node.whenFalse);
      }
    }
    function visit(node) {
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(ast) === "label" &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression
      )
        literal(node.initializer.expression);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
});
