import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonical, hash } from "../src/protocol.ts";
import { chestRoot, manifestHash, check, verifySources } from "./contract.ts";
export function inputs() {
  const names = readdirSync(chestRoot)
    .filter(
      (n) =>
        n.endsWith(".ts") ||
        n.endsWith(".test.mjs") ||
        ["manifest.json", "tsconfig.json", ".gitignore", "README.md"].includes(
          n,
        ),
    )
    .sort();
  return Object.fromEntries(
    names.map((n) => [n, hash(readFileSync(join(chestRoot, n)))]),
  );
}
export function verifyChestFreeze() {
  const f = JSON.parse(readFileSync(join(chestRoot, "freeze.json"), "utf8"));
  check(
    f.manifestHash === manifestHash &&
      canonical(f.files) === canonical(inputs()),
    "chest_freeze_mismatch",
  );
  return f;
}
// Explicit offline freeze creation only; not used by the future live CLI.
export function writeFreeze() {
  verifySources();
  const f = { version: 1, manifestHash, files: inputs() };
  writeFileSync(
    join(chestRoot, "freeze.json"),
    JSON.stringify(f, null, 2) + "\n",
  );
  return f;
}
