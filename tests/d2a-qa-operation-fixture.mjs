import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { leafRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

const { integrationFixture } = await import(
  new URL(
    "tests/d2a-integration-fixture.mjs",
    leafRoot("D2A_INTEGRATION_SOURCE_ROOT"),
  ).href
);
const { createDetachedRunFence } = await moduleFromSource(
  "src/lib/saves/detached-fence.ts",
);
const { prepareLabSimulation } = await moduleFromSource(
  "src/lib/world-lab/simulation.ts",
);
const { buildDetachedWorldCommit } = await moduleFromSource(
  "src/lib/world-lab/writer.ts",
);
const { canonicalLabJson } = await moduleFromSource(
  "src/lib/world-lab/inputs.ts",
);
const { sha256 } = await moduleFromSource("src/lib/world-library/parsers.ts");

export async function pendingOperation(options = {}) {
  const f = await integrationFixture(options);
  try {
    const approved = await f.approve(),
      preparedRun = await f.store.prepare(approved.request);
    const command = {
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: preparedRun.id,
      expectedRevision: preparedRun.revision,
    };
    const run = await f.store.claim(command),
      state = await f.store.readDetached(f.cid, run.id);
    const prepared = prepareLabSimulation(state, command.operationId);
    assert.equal(prepared.status, "ready", JSON.stringify(prepared));
    const request = {
      operationId: command.operationId,
      fence: createDetachedRunFence(run),
      profile: prepared.profile,
      contractVersion: "world-resolver-simulation-v2",
      contextDigest: sha256(
        canonicalLabJson({
          scope: prepared.scope,
          selection: prepared.selection,
          from: prepared.worldInput.snapshot.worldMinutes,
          through: prepared.worldInput.resolution.worldMinutes,
        }),
      ),
    };
    const writeRequest = () => f.lab("model_request", request);
    const generate = async () => {
      const response = await f.transport
        .resolver(prepared.profile)
        .simulate(prepared.worldInput, prepared.scope, prepared.profile);
      return {
        operationId: command.operationId,
        fence: request.fence,
        result: {
          proposal: response.proposal,
          usage: response.usage,
          error: null,
        },
      };
    };
    const record = async () => {
      await writeRequest();
      const result = await generate();
      await f.lab("model_result", result);
      const input = {
        state,
        fence: request.fence,
        operationId: command.operationId,
        throughWorldMinutes: prepared.worldInput.resolution.worldMinutes,
        worldInput: prepared.worldInput,
        simulationProposal: result.result.proposal,
      };
      return { result, input, commit: buildDetachedWorldCommit(input) };
    };
    return {
      ...f,
      approved,
      run,
      state,
      prepared,
      modelCommand: command,
      modelRequest: request,
      writeRequest,
      generate,
      record,
    };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}
