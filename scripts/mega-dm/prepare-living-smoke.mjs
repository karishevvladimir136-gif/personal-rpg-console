// Network-disabled preparation only. No provider import, fetch, or adapter.
import { isAbsolute, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { livingSmokePlan, LIVING_SMOKE_VERSION } from "../../test-fixtures/mega-dm/living-smoke-v1.mjs";

function flag(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? null : process.argv[index + 1] ?? null;
}
const output = flag("--output");
const model = flag("--model");
if (!output || !isAbsolute(output) || !model || !/^[a-zA-Z0-9._-]{3,80}$/.test(model)) {
  process.stderr.write("Provide absolute --output and an explicit --model. This command prepares requests only.\n");
  process.exitCode = 1;
} else {
  const plan = livingSmokePlan(model);
  await writeFile(resolve(output), JSON.stringify({ version: LIVING_SMOKE_VERSION, networkAttempts: 0,
    status: "PREPARED_ONLY", ownerLiveAuthorization: "required separately", calls: plan }, null, 2), { flag: "wx" });
  process.stdout.write(`Prepared ${plan.length} frozen request records; zero provider calls.\n`);
}
