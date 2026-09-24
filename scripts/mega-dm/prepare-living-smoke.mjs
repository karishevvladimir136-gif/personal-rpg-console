// Network-disabled preparation only. No provider import, fetch, or adapter.
import { isAbsolute, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { livingSmokePlan, LIVING_SMOKE_VERSION } from "../../test-fixtures/mega-dm/living-smoke-v1.mjs";
import { blindLivingSmokeArtifacts } from "../../test-fixtures/mega-dm/living-review-v1.mjs";

function flag(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1] ?? null;
}
const output = flag("--output");
const reviewOutput = flag("--review-output");
const revealOutput = flag("--reveal-output");
const model = flag("--model");
if (![output, reviewOutput, revealOutput].every((path) => path && isAbsolute(path)) ||
    new Set([output, reviewOutput, revealOutput].map((path) => resolve(path))).size !== 3 ||
    !model || !/^[a-zA-Z0-9._-]{3,80}$/.test(model)) {
  process.stderr.write("Provide three distinct absolute --output, --review-output, --reveal-output paths and an explicit supported --model. Preparation only.\n");
  process.exitCode = 1;
} else {
  const plan = livingSmokePlan(model);
  const { review, reveal } = blindLivingSmokeArtifacts();
  await writeFile(resolve(output), JSON.stringify({ version: LIVING_SMOKE_VERSION, networkAttempts: 0,
    status: "PREPARED_ONLY", ownerLiveAuthorization: "required separately", calls: plan }, null, 2), { flag: "wx" });
  await writeFile(resolve(reviewOutput), JSON.stringify(review, null, 2), { flag: "wx" });
  await writeFile(resolve(revealOutput), JSON.stringify(reveal, null, 2), { flag: "wx" });
  process.stdout.write(`Prepared ${plan.length} frozen request records; zero provider calls.\n`);
}
