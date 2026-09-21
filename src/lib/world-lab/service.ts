// Private orchestration over the one detached ledger. No active-store adapter.
import type {
  LabCatalog,
  LabRequest,
  LabScenarioChoice,
  PublicLabRun,
} from "./contracts.ts";
import type { LabRpc } from "./server-contracts.ts";
import { createRpcLabStore } from "./store.ts";
import { readDetachedState } from "../saves/detached-reader.ts";
import {
  createDetachedRunFence,
  sameDetachedRunFence,
} from "../saves/detached-fence.ts";
import { createRpcDetachedWriter } from "./writer.ts";
import { projectLabRun } from "./projection.ts";
import { parseLabRun } from "./lifecycle.ts";
import { prepareLabStep } from "./runtime.ts";
import { parseLabRequest } from "./validation.ts";
import {
  ensure,
  FoundationValidationError,
  integer,
  list,
  object,
  text,
  uuid,
} from "../foundation-loop/fields.ts";
import { parseLibraryRecord } from "../world-library/parsers.ts";

export function createLabService(
  ownerId: string,
  execute: LabRpc,
  language: "en" | "ru" = "en",
) {
  const store = createRpcLabStore(ownerId, execute, readDetachedState);
  const writer = createRpcDetachedWriter(ownerId, execute);
  async function rpc(campaignId: string, action: string, payload: unknown) {
    let response: Awaited<ReturnType<LabRpc>>;
    try {
      response = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_action: action,
        p_payload: payload,
      });
    } catch {
      throw new FoundationValidationError("unavailable");
    }
    if (response.error)
      throw new FoundationValidationError(
        response.error.message?.includes("rpg_conflict")
          ? "conflict"
          : "unavailable",
      );
    return response.data;
  }
  function project(raw: unknown, campaignId: string): PublicLabRun {
    const row = object(raw, [
      "run",
      "base",
      "scenario",
      "checkpoints",
      "applicable",
    ]);
    ensure(
      typeof row.applicable === "boolean" && Array.isArray(row.checkpoints),
    );
    return projectLabRun(row.run, row.checkpoints, {
      ownerId,
      campaignId,
      language,
      base: row.base as PublicLabRun["base"],
      scenario: row.scenario as LabScenarioChoice,
      applicable: row.applicable,
    });
  }
  const readRun = async (campaignId: string, runId: string) =>
    project(await store.read(campaignId, runId), campaignId);
  const readResult = async (request: LabRequest) =>
    project(
      await rpc(request.input.campaignId, "read_result", {
        action: request.action,
        request: request.input,
      }),
      request.input.campaignId,
    );
  async function catalog(campaignId: string): Promise<LabCatalog> {
    uuid(campaignId);
    const raw = object(await store.catalog(campaignId), [
      "campaignId",
      "bases",
      "scenarios",
      "runs",
    ]);
    ensure(raw.campaignId === campaignId);
    const bases = list(
      raw.bases,
      (value) => {
        const row = object(value, [
          "saveId",
          "timelineId",
          "label",
          "worldMinutes",
        ]);
        return {
          saveId: uuid(row.saveId),
          timelineId: uuid(row.timelineId),
          label: text(row.label, 200),
          worldMinutes: integer(row.worldMinutes, 0, 2147483646),
        };
      },
      100,
    );
    const scenarios = list(
      raw.scenarios,
      (value): LabScenarioChoice => {
        const row = object(value, ["scenario", "divergence"]);
        const scenario = parseLibraryRecord(row.scenario, ownerId),
          divergence = parseLibraryRecord(row.divergence, ownerId);
        ensure(
          scenario.kind === "scenario" && divergence.kind === "divergence",
        );
        ensure(
          scenario.body.status === "approved" &&
            scenario.body.approval !== null &&
            divergence.body.approval !== null &&
            divergence.body.scenarioVersionId === scenario.versionId,
        );
        return {
          scenarioVersionId: scenario.versionId,
          divergenceVersionId: divergence.versionId,
          scenarioTitle: scenario.body.title,
          divergenceTitle: divergence.body.title,
          assumptions: scenario.body.assumptions
            .filter((a) => a.visibility === "public")
            .map((a) => a.text),
          changes: divergence.body.changes
            .filter((a) => a.visibility === "public")
            .map((a) => a.text),
        };
      },
      500,
    );
    return {
      campaignId,
      bases,
      scenarios,
      runs: list(raw.runs, (run) => project(run, campaignId), 100),
    };
  }
  async function perform(value: LabRequest): Promise<PublicLabRun> {
    const request = parseLabRequest(value);
    const { campaignId } = request.input;
    if (request.action === "prepare") {
      await store.prepare(request.input);
      return readResult(request);
    }
    const command = request.input;
    if (request.action !== "continue") {
      await store[request.action](command);
      return readResult(request);
    }
    const prior = await rpc(campaignId, "read", {
      operationId: command.operationId,
      request: command,
    });
    const receipt = prior === null ? null : object(prior, ["claim", "commit"]);
    // A committed receipt wins before any fresh read/recomputation. Its result
    // does not renew a lease or authorize work against a later checkpoint.
    if (receipt?.commit !== null && receipt?.commit !== undefined)
      return readResult(request);
    const claimed = receipt
      ? parseLabRun(receipt.claim, {
          ownerId,
          campaignId,
          runId: command.runId,
        })
      : await store.claim(command);
    const state = await store.readDetached(campaignId, command.runId);
    ensure(
      state.run &&
        sameDetachedRunFence(
          createDetachedRunFence(state.run),
          createDetachedRunFence(claimed),
        ),
      "conflict",
    );
    const step = prepareLabStep(state, command.operationId);
    if (step.status === "paused") {
      await rpc(campaignId, "commit", {
        operationId: command.operationId,
        fence: createDetachedRunFence(claimed),
        kind: "pause",
        reason: step.reason,
      });
    } else {
      await writer.commit(
        {
          state,
          fence: createDetachedRunFence(claimed),
          operationId: command.operationId,
          throughWorldMinutes: step.commit.throughWorldMinutes,
          worldInput: step.worldInput,
        },
        step.commit,
      );
    }
    return readResult(request);
  }
  return { catalog, readRun, perform };
}
