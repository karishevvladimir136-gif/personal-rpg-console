import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareEvaluation } from "../../spikes/astra-primary-dm/evaluation.mjs";

const directory = await mkdtemp(join(tmpdir(), "astra-primary-dm-eval-"));
const prepared = prepareEvaluation();
await writeFile(join(directory, "synthetic-requests.json"), JSON.stringify({ networkEnabled: false,
  calls: prepared.calls }, null, 2));
await writeFile(join(directory, "blind-review.json"), JSON.stringify(prepared.ownerBlindReview, null, 2));
await writeFile(join(directory, "reveal-key.json"), JSON.stringify(prepared.revealKey, null, 2));
process.stdout.write(JSON.stringify({ directory, scenarioCount: prepared.scenarioCount,
  primarySessions: prepared.primarySessions, maximumModelRoundTrips: prepared.maximumModelRoundTrips,
  providerNetworkCalls: 0 }) + "\n");
