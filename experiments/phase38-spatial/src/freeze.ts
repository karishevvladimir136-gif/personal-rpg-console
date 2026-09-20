import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, hash, must, object, protocolHash } from "./protocol.ts";
export const experimentRoot = dirname(dirname(fileURLToPath(import.meta.url)));
export function freezeInputs() {
  const paths = [
    "protocol.json",
    "continuation.json",
    "fal-recovery.json",
    "fal-retrieval.json",
    "FAL_RETRIEVAL_PREPARATION.md",
    "FAL_RECOVERY_PREPARATION.md",
    "package.json",
    "tsconfig.json",
    ".gitignore",
    ".gitattributes",
    "README.md",
    "PREPARATION_RESULTS.md",
    "OFFICIAL_EVIDENCE.md",
    "CORRECTION_PROPOSAL.md",
    "URL_CORRECTION.md",
    "CONTINUATION_PREPARATION.md",
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
