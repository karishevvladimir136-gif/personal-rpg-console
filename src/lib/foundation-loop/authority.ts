import { isDeepStrictEqual } from "node:util";
import type {
  FoundationCommand,
  FoundationRpc,
} from "../production/contracts.ts";
import type { LoopContext, LoopPlan } from "./contracts.ts";
import { parseFoundationCommand } from "../world-packs/bindings.ts";
import { readLoopContext } from "./state.ts";

export class LoopError extends Error {
  readonly code: "validation" | "conflict" | "unavailable";
  constructor(code: "validation" | "conflict" | "unavailable" = "validation") {
    super(
      code === "conflict"
        ? "State changed. Review the current values."
        : "This operation needs review.",
    );
    this.code = code;
  }
}
export function loopCommand(
  context: LoopContext,
  operationId: string,
): FoundationCommand {
  const f = context.foundation;
  return {
    operationId,
    campaignId: f.campaignId,
    timeline: f.timeline,
    expectedRevision: f.revision,
    expectedRuntimeRevision: f.runtimeRevision,
    expectedHeadId: f.headId,
  };
}
export function assertLoopCommand(
  context: LoopContext,
  value: unknown,
): FoundationCommand {
  const command = parseFoundationCommand(value);
  if (!isDeepStrictEqual(command, loopCommand(context, command.operationId)))
    throw new LoopError("conflict");
  if (!isDeepStrictEqual(context.state.profile, context.foundation.ruleset))
    throw new LoopError("conflict");
  return command;
}
export async function readFoundationLoop(
  rpc: FoundationRpc,
  ownerId: string,
  campaignId: string,
  timeline: FoundationCommand["timeline"],
) {
  const response = await rpc({
    p_owner_id: ownerId,
    p_campaign_id: campaignId,
    p_action: "loop_read",
    p_payload: {},
    p_timeline: timeline,
  });
  if (response.error)
    throw new LoopError(
      response.error.message?.includes("conflict") ? "conflict" : "unavailable",
    );
  const context = readLoopContext(response.data);
  if (
    context.foundation.ownerId !== ownerId ||
    context.foundation.campaignId !== campaignId ||
    !isDeepStrictEqual(context.foundation.timeline, timeline)
  )
    throw new LoopError("conflict");
  return context;
}
export type LoopRequest = {
  command: FoundationCommand;
  kind: string;
  input: unknown;
};
export function parseLoopRequest(value: unknown): LoopRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new LoopError();
  const row = value as Record<string, unknown>;
  if (
    Object.keys(row).sort().join() !== "command,input,kind" ||
    ![
      "quote",
      "trade",
      "commerce.configure",
      "progression.configure",
      "progression.correct",
      "reward",
      "advancement",
      "prepare",
    ].includes(String(row.kind))
  )
    throw new LoopError();
  return {
    command: parseFoundationCommand(row.command),
    kind: row.kind as string,
    input: row.input,
  };
}
export function createLoopStore(
  rpc: FoundationRpc,
  ownerId: string,
  campaignId: string,
) {
  const invoke = async (
    action: string,
    request: LoopRequest,
    plan?: LoopPlan,
  ) => {
    if (request.command.campaignId !== campaignId) throw new LoopError();
    const response = await rpc({
      p_owner_id: ownerId,
      p_campaign_id: campaignId,
      p_action: action,
      p_timeline: request.command.timeline,
      p_payload: { ...request, ...(plan ? { plan } : {}) },
    });
    if (response.error)
      throw new LoopError(
        response.error.message?.includes("conflict")
          ? "conflict"
          : "validation",
      );
    return response.data as { committed: true; operationId: string } | null;
  };
  return {
    receipt: (request: LoopRequest) => invoke("loop_receipt", request),
    commit: (request: LoopRequest, plan: LoopPlan) =>
      invoke("loop_commit", request, plan),
  };
}
