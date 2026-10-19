import type {
  CraftCommand,
  CraftVersionInput,
  TeachCommand,
} from "./contracts.ts";
import { isUuid } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_dm_craft");
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, expected: string[], optional: string[] = []) {
  if (
    expected.some((key) => !Object.hasOwn(value, key)) ||
    Object.keys(value).some((key) => !expected.includes(key) && !optional.includes(key))
  )
    throw new Error("invalid_dm_craft");
}
function string(value: unknown, maximum: number, minimum = 1): string {
  if (
    typeof value !== "string" ||
    value.trim().length < minimum ||
    value.length > maximum
  )
    throw new Error("invalid_dm_craft");
  return value;
}
function uuid(value: unknown): string {
  if (!isUuid(value)) throw new Error("invalid_dm_craft");
  return value;
}
function integer(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0)
    throw new Error("invalid_dm_craft");
  return value as number;
}
const choices = <T extends string>(value: unknown, accepted: readonly T[]): T => {
  if (typeof value !== "string" || !accepted.includes(value as T))
    throw new Error("invalid_dm_craft");
  return value as T;
};
function uniqueStrings(value: unknown, maximum: number, length: number) {
  if (!Array.isArray(value) || value.length > maximum)
    throw new Error("invalid_dm_craft");
  const strings = value.map((entry) => string(entry, length, 2));
  if (new Set(strings).size !== strings.length)
    throw new Error("invalid_dm_craft");
  return strings;
}
function locale(value: unknown) {
  const item = record(value);
  keys(item, ["title", "guidance", "avoid"]);
  return {
    title: string(item.title, 120),
    guidance: string(item.guidance, 1600),
    avoid: string(item.avoid, 800),
  };
}
export function parseCraftEntry(value: unknown): CraftVersionInput {
  const item = record(value);
  keys(item, [
    "key",
    "kind",
    "category",
    "stages",
    "triggers",
    "en",
    "ru",
    "provenance",
  ], ["role"]);
  // Polish 3 §7: the card's role (writer, bookkeeper, both); absent means both.
  const role = item.role === undefined ? undefined : choices(item.role, ["writer", "bookkeeper", "both"] as const);
  const key = string(item.key, 80, 2);
  if (!/^[a-z][a-z0-9-]{1,79}$/.test(key))
    throw new Error("invalid_dm_craft");
  const kind = choices(item.kind, ["doctrine", "card"] as const);
  if ((key === "core-doctrine") !== (kind === "doctrine"))
    throw new Error("invalid_dm_craft");
  const stages = uniqueStrings(item.stages, 2, 10).map((stage) =>
    choices(stage, ["plan", "narrate"] as const),
  );
  if (!stages.length) throw new Error("invalid_dm_craft");
  const triggers = uniqueStrings(item.triggers, 12, 80);
  return {
    key,
    kind,
    category: string(item.category, 80),
    stages,
    triggers,
    ...(role ? { role } : {}),
    en: locale(item.en),
    ru: locale(item.ru),
    provenance: string(item.provenance, 240),
  };
}
export function parseCraftCommand(value: unknown): CraftCommand {
  const item = record(value);
  const action = choices(item.action, ["save", "activate"] as const);
  if (action === "save") {
    keys(item, ["action", "requestId", "expectedActivationRevision", "entry"]);
    return {
      action,
      requestId: uuid(item.requestId),
      expectedActivationRevision: integer(item.expectedActivationRevision),
      entry: parseCraftEntry(item.entry),
    };
  }
  keys(item, [
    "action",
    "requestId",
    "expectedActivationRevision",
    "key",
    "versionId",
  ]);
  return {
    action,
    requestId: uuid(item.requestId),
    expectedActivationRevision: integer(item.expectedActivationRevision),
    key: string(item.key, 80, 2),
    versionId: uuid(item.versionId),
  };
}
export function parseDmStyle(value: unknown) {
  const item = record(value);
  keys(item, [
    "companionAgency",
    "descriptionDensity",
    "dialogueDensity",
    "dramaticPace",
    "mystery",
    "failForward",
    "tone",
  ], ["emotionalTone", "tragedyIntensity"]);
  return {
    companionAgency: choices(item.companionAgency, ["low", "normal", "high"] as const),
    descriptionDensity: choices(item.descriptionDensity, ["concise", "balanced", "rich"] as const),
    dialogueDensity: choices(item.dialogueDensity, ["concise", "balanced", "rich"] as const),
    dramaticPace: choices(item.dramaticPace, ["measured", "balanced", "brisk"] as const),
    mystery: choices(item.mystery, ["low", "normal", "high"] as const),
    failForward: choices(item.failForward, ["low", "normal", "high"] as const),
    tone: choices(item.tone, ["grounded", "warm", "cinematic"] as const),
    emotionalTone: item.emotionalTone === undefined ? "hopeful_humanist" as const : choices(item.emotionalTone, ["hopeful_humanist", "balanced", "bleak"] as const),
    tragedyIntensity: item.tragedyIntensity === undefined ? "normal" as const : choices(item.tragedyIntensity, ["low", "normal", "unrestricted"] as const),
  };
}
export function parseTeachCommand(value: unknown, campaignId: string): TeachCommand {
  const item = record(value);
  const action = choices(item.action, ["approve-style", "approve-global", "reject"] as const);
  const expected = action === "approve-style"
    ? ["action", "requestId", "campaignId", "timeline", "operationId", "proposalId", "expectedSettingsRevision", "style"]
    : action === "approve-global"
      ? ["action", "requestId", "campaignId", "timeline", "operationId", "proposalId", "expectedActivationRevision", "entry"]
      : ["action", "requestId", "campaignId", "timeline", "operationId", "proposalId"];
  keys(item, expected);
  if (item.campaignId !== campaignId || !isTimelineFence(item.timeline))
    throw new Error("invalid_dm_craft");
  const common = {
    requestId: uuid(item.requestId),
    campaignId,
    timeline: item.timeline,
    operationId: uuid(item.operationId),
    proposalId: uuid(item.proposalId),
  };
  if (action === "approve-style")
    return { action, ...common, expectedSettingsRevision: integer(item.expectedSettingsRevision), style: parseDmStyle(item.style) };
  if (action === "approve-global")
    return { action, ...common, expectedActivationRevision: integer(item.expectedActivationRevision), entry: parseCraftEntry(item.entry) };
  return { action, ...common };
}
