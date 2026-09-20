import type { CampaignPremiseCommand, CampaignPremiseInput } from "./premise-contracts.ts";
import { ensure, integer, literal, object, uuid } from "../world-library/validation.ts";

export function parseCampaignPremiseInput(value: unknown): CampaignPremiseInput {
  const v = object(value, ["text", "language"]);
  ensure(typeof v.text === "string" && v.text.trim().length > 0 && v.text.length <= 20_000 && !v.text.includes("\u0000"));
  // Keep original whitespace, spelling and instructions as inert owner data.
  return { text: v.text as string, language: literal(v.language, ["en", "ru"] as const) };
}
export function parseCampaignPremiseCommand(value: unknown): CampaignPremiseCommand {
  ensure(value !== null && typeof value === "object" && !Array.isArray(value));
  const action = literal((value as Record<string, unknown>).action, ["save", "review", "restore"] as const);
  const v = object(value, ["operationId", "timeline", "expectedRevision", "action", ...(action === "save" ? ["text", "language"] : action === "restore" ? ["versionId"] : [])]);
  const fence = object(v.timeline, ["timelineId", "epoch"]);
  const base = { operationId: uuid(v.operationId), timeline: { timelineId: uuid(fence.timelineId), epoch: integer(fence.epoch, 0) }, expectedRevision: integer(v.expectedRevision, 0) };
  if (action === "save") return { ...base, action, ...parseCampaignPremiseInput({ text: v.text, language: v.language }) };
  return action === "review" ? { ...base, action } : { ...base, action, versionId: uuid(v.versionId) };
}
