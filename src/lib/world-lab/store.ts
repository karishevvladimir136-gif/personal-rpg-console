// INTERNAL RPC adapter for rpg_world_lab. Public projections live in projection.ts.
// A browser must import the Lead-owned validation.ts/contracts.ts instead.
import type { LabPrepareInput, LabRunCommand } from "./contracts.ts";
import type { DetachedState, LabRpc, LabRun } from "./server-contracts.ts";
import {
  canonicalLabJson, parseLabDocumentPins, parseLabPrepareSelection, parseLabSourceHeads, prepareLabInput,
} from "./inputs.ts";
import { parseLabRun, parseLabRunCommand } from "./lifecycle.ts";
import { ensure, FoundationValidationError, object, uuid } from "../foundation-loop/fields.ts";

export type LabDetachedParser = (
  value: unknown,
  scope: { ownerId: string; campaignId: string; manifestId?: string; timelineId?: string; runId?: string | null },
) => DetachedState;
export type LabStore = ReturnType<typeof createRpcLabStore>;

export function createRpcLabStore(ownerId: string, execute: LabRpc, readState: LabDetachedParser) {
  uuid(ownerId);
  async function rpc(campaignId: string, action: string, payload: unknown): Promise<unknown> {
    uuid(campaignId);
    let result: Awaited<ReturnType<LabRpc>>;
    try {
      result = await execute({ p_owner_id: ownerId, p_campaign_id: campaignId, p_action: action, p_payload: payload });
    } catch {
      throw new FoundationValidationError("unavailable");
    }
    if (result.error) {
      const message = result.error.message ?? "";
      throw new FoundationValidationError(
        message.includes("rpg_conflict") ? "conflict" : message.includes("rpg_forbidden") ? "scope" :
          message.includes("rpg_validation") || result.error.code?.startsWith("22") || result.error.code?.startsWith("23") ? "validation" : "unavailable",
      );
    }
    return result.data;
  }

  async function prepare(value: LabPrepareInput): Promise<LabRun> {
    const request = parseLabPrepareSelection(value);
    // Receipts must win before fresh basis validation: an exact retry reports the
    // original preparation and must neither repin sources nor create a new run.
    const previous = await rpc(request.campaignId, "read", { operationId: request.operationId, request });
    if (previous !== null) {
      const run = parseLabRun(previous, { ownerId, campaignId: request.campaignId });
      ensure(run.input.base.saveId === request.saveId && run.input.scenarioVersionId === request.scenarioVersionId && run.input.divergenceVersionId === request.divergenceVersionId && run.label === request.label && run.input.throughWorldMinutes - run.input.startWorldMinutes === request.horizonMinutes, "conflict");
      return run;
    }
    const envelope = object(await rpc(request.campaignId, "read_detached", {
      saveId: request.saveId, scenarioVersionId: request.scenarioVersionId, divergenceVersionId: request.divergenceVersionId,
    }), ["state", "sourceHeads", "documents"]);
    const state = readState(envelope.state, { ownerId, campaignId: request.campaignId, runId: null });
    const prepared = prepareLabInput(request, {
      ownerId, campaignId: request.campaignId, saveId: request.saveId, state,
      sourceHeads: parseLabSourceHeads(envelope.sourceHeads), documents: parseLabDocumentPins(envelope.documents),
    });
    const run = parseLabRun(await rpc(request.campaignId, "prepare", { request, ...prepared }), { ownerId, campaignId: request.campaignId });
    ensure(run.inputDigest === prepared.inputDigest && canonicalLabJson(run.input) === canonicalLabJson(prepared.input) && run.label === request.label, "conflict");
    return run;
  }

  async function command(action: "claim" | "pause" | "cancel" | "resume", value: LabRunCommand): Promise<LabRun> {
    const request = parseLabRunCommand(value);
    // SQL checks exact receipt first, then owner/revision/basis in its transaction.
    return parseLabRun(await rpc(request.campaignId, action, request), { ownerId, campaignId: request.campaignId, runId: request.runId });
  }

  async function readDetached(campaignId: string, runId: string, manifestId?: string): Promise<DetachedState> {
    uuid(runId);
    if (manifestId !== undefined) uuid(manifestId);
    const payload = manifestId === undefined ? { runId } : { runId, manifestId };
    return readState(await rpc(campaignId, "read_detached", payload), { ownerId, campaignId, runId, ...(manifestId === undefined ? {} : { manifestId }) });
  }

  return {
    // Intentionally unknown: raw catalog/read are private authority and must pass
    // through the detached reader and allowlist projection before an API reply.
    catalog: (campaignId: string): Promise<unknown> => rpc(campaignId, "catalog", {}),
    read: (campaignId: string, runId: string): Promise<unknown> => rpc(campaignId, "read", { runId: uuid(runId) }),
    prepare, readDetached,
    claim: (input: LabRunCommand) => command("claim", input),
    pause: (input: LabRunCommand) => command("pause", input),
    cancel: (input: LabRunCommand) => command("cancel", input),
    resume: (input: LabRunCommand) => command("resume", input),
  };
}
