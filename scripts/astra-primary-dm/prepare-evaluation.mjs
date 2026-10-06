import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareEvaluation } from "../../spikes/astra-primary-dm/evaluation.mjs";
import { prepareStage2Template } from "../../spikes/astra-primary-dm/stage2.mjs";

const directory = await mkdtemp(join(tmpdir(), "astra-primary-dm-eval-"));
const prepared = prepareEvaluation();
await writeFile(join(directory, "synthetic-requests.json"), JSON.stringify({ networkEnabled: false,
  calls: prepared.calls }, null, 2));
await writeFile(join(directory, "blind-review.json"), JSON.stringify(prepared.ownerBlindReview, null, 2));
await writeFile(join(directory, "reveal-key.json"), JSON.stringify(prepared.revealKey, null, 2));
await writeFile(join(directory, "stage2-sequential-template.json"), JSON.stringify(prepareStage2Template(), null, 2));
process.stdout.write(JSON.stringify({ directory, scenarioCount: prepared.scenarioCount,
  primarySessions: prepared.primarySessions, maximumModelRoundTrips: prepared.maximumModelRoundTrips,
  maximumEstimatedUsd: prepared.maximumEstimatedUsd, stage2TurnsPerArm: prepareStage2Template().turnsPerArm,
  providerNetworkCalls: 0 }) + "\n");
