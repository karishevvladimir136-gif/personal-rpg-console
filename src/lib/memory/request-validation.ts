import { isUuid } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import type {
  ContinueSessionInput,
  EndSessionInput,
  RetryMemoryInput,
} from "./contracts.ts";

export function validateMemoryRequest(
  value: unknown,
  campaignId: string,
  action: "end",
): EndSessionInput;
export function validateMemoryRequest(
  value: unknown,
  campaignId: string,
  action: "continue",
): ContinueSessionInput;
export function validateMemoryRequest(
  value: unknown,
  campaignId: string,
  action: "retry",
): RetryMemoryInput;
export function validateMemoryRequest(
  value: unknown,
  campaignId: string,
  action: "end" | "continue" | "retry",
) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new DmError("validation");
  const input = value as Record<string, unknown>;
  const allowed = [
    "requestId",
    "campaignId",
    ...(action === "retry" ? [] : ["expectedRevision"]),
    action === "end" ? "sessionId" : "boundaryId",
    ...(Object.hasOwn(input, "timeline") ? ["timeline"] : []),
  ];
  if (
    Object.keys(input).length !== allowed.length ||
    !allowed.every((key) => Object.hasOwn(input, key)) ||
    !isUuid(campaignId) ||
    input.campaignId !== campaignId ||
    !isUuid(input.requestId)
  )
    throw new DmError("validation");
  if (Object.hasOwn(input, "timeline") && !isTimelineFence(input.timeline))
    throw new DmError("validation");
  if (
    action !== "retry" &&
    (!Number.isSafeInteger(input.expectedRevision) ||
      (input.expectedRevision as number) < 1)
  )
    throw new DmError("validation");
  const target = action === "end" ? input.sessionId : input.boundaryId;
  if (!(action === "retry" && target === null) && !isUuid(target))
    throw new DmError("validation");
  return input as unknown as
    EndSessionInput | ContinueSessionInput | RetryMemoryInput;
}
