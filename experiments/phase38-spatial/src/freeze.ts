import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, hash, must, object, protocolHash } from "./protocol.ts";
export const experimentRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export function freezeInputs() {
  const paths = [
    "protocol.json",
    "package.json",
    "tsconfig.json",
    ".gitignore",
    ".gitattributes",
    "README.md",
    "PREPARATION_RESULTS.md",
    "OFFICIAL_EVIDENCE.md",
    "CORRECTION_PROPOSAL.md",
    ...readdirSync(join(experimentRoot, "src"))
      .filter((x) => x.endsWith(".ts"))
      .map((x) => `src/${x}`),
    ...readdirSync(join(experimentRoot, "tests"))
      .filter((x) => x.endsWith(".mjs"))
      .map((x) => `tests/${x}`),
  ].sort();
  return Object.fromEntries(
    paths.map((path) => [path, hash(readFileSync(join(experimentRoot, path)))]),
  );
}
export function verifyFreeze() {
  const f = object(
    JSON.parse(readFileSync(join(experimentRoot, "freeze.json"), "utf8")),
  );
  must(
    f.protocolHash === protocolHash &&
      canonical(f.files) === canonical(freezeInputs()),
    "freeze_mismatch",
  );
  return f;
}
if (
  process.argv[1] &&
  relative(fileURLToPath(import.meta.url), process.argv[1]) === ""
) {
  writeFileSync(
    join(experimentRoot, "freeze.json"),
    JSON.stringify(
      { version: 1, protocolHash, files: freezeInputs() },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({ protocolHash, files: Object.keys(freezeInputs()).length }),
  );
}
