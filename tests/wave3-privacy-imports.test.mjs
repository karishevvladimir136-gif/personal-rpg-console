import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

test("QA: all client entry points keep provider adapters, private authority and credential reads out of browser imports", async () => {
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const files = [];
  async function collect(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await collect(file);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name)) files.push(file);
    }
  }
  await collect(root);
  const sources = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(file, "utf8")])),
  );
  const entries = files.filter((file) =>
    /^\s*["']use client["'];?/.test(sources.get(file)),
  );
  const visited = new Set();
  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.doesNotMatch(file.replaceAll("\\", "/"), /\/lib\/server\//, file);
    const source = sources.get(file) ?? (await readFile(file, "utf8"));
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const imports = new Set();
    function inspect(node) {
      const credential = /^(?:OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|FAL_KEY|FAL_API_KEY)$/;
      if (ts.isIdentifier(node)) assert.doesNotMatch(node.text, credential, file);
      if (
        ts.isElementAccessExpression(node) &&
        /(?:process|import\.meta)\.env/.test(node.expression.getText(parsed)) &&
        ts.isStringLiteral(node.argumentExpression)
      )
        assert.doesNotMatch(node.argumentExpression.text, credential, file);
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const names = clause?.namedBindings;
        const typesOnly =
          clause?.isTypeOnly ||
          (clause &&
            !clause.name &&
            names &&
            ts.isNamedImports(names) &&
            names.elements.length > 0 &&
            names.elements.every((entry) => entry.isTypeOnly));
        if (!typesOnly) imports.add(node.moduleSpecifier.text);
      }
      if (
        ts.isExportDeclaration(node) &&
        !node.isTypeOnly &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const names = node.exportClause;
        const typesOnly =
          names &&
          ts.isNamedExports(names) &&
          names.elements.length > 0 &&
          names.elements.every((entry) => entry.isTypeOnly);
        if (!typesOnly) imports.add(node.moduleSpecifier.text);
      }
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === "require")) &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      )
        imports.add(node.arguments[0].text);
      ts.forEachChild(node, inspect);
    }
    inspect(parsed);
    for (const specifier of imports) {
      assert.notEqual(specifier, "server-only", file);
      assert.ok(!specifier.startsWith("node:"), `${file}: ${specifier}`);
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
      const base = specifier.startsWith("@/")
        ? path.join(root, specifier.slice(2))
        : path.resolve(path.dirname(file), specifier);
      if (/\.(css|json|svg|png|jpe?g|webp)$/.test(base)) continue;
      const candidates = path.extname(base)
        ? [base]
        : [base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")];
      let resolved;
      for (const candidate of candidates) {
        try {
          await access(candidate);
          resolved = candidate;
          break;
        } catch {
          // The next supported module suffix may resolve this import.
        }
      }
      assert.ok(resolved, `${file}: unresolved runtime import ${specifier}`);
      await visit(resolved);
    }
  }
  for (const file of entries) await visit(file);
  assert.ok(entries.length > 10);
  assert.ok(visited.size > 50);
  assert.ok([...visited].some((file) => file.replaceAll("\\", "/").endsWith("/world-library/world-library.tsx")));
});
