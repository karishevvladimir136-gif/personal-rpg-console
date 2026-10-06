// Deterministic synthetic gate. No credentials, network, or owner-state imports.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runMechanicalPreflight } from "../../spikes/astra-primary-dm/mechanical-preflight.mjs";

const directory = process.env.RPG_ASTRA_MECHANICAL_OUTPUT_DIR;
assert.ok(directory);
await mkdir(directory, { recursive: true });
const result = await runMechanicalPreflight(join(directory, "preflight-journal.json"));
const receipt = { startingSha: "e7d88584bb9dbb4a8737e77d9a1eabb2823b7974",
  acceptanceVersion: "v2",
  ...result };
await writeFile(join(directory, "preflight-result.json"), JSON.stringify(receipt, null, 2));
process.stdout.write(JSON.stringify({ status: receipt.status, turns: receipt.turns,
  rejectedNoOp: receipt.rejectedNoOp, finalState: receipt.finalState,
  providerCalls: 0, receiptPath: join(directory, "preflight-result.json") }) + "\n");
