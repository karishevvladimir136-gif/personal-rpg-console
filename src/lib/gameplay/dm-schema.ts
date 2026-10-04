import type {
  DmPlan,
  FeedbackResult,
  NarrationResult,
} from "./server-contracts.ts";
import { DmError } from "./dm-errors.ts";
import {
  foundationActionSchema,
  parseFoundationActionProposal,
} from "../foundation-actions/index.ts";

type Schema = {
  type?:
    "object" | "array" | "string" | "integer" | "number" | "boolean" | "null";
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: false;
  items?: Schema;
  anyOf?: Schema[];
  enum?: (string | number | boolean | null)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  maxItems?: number;
  pattern?: string;
};
const str = (maxLength = 2000): Schema => ({ type: "string", maxLength });
const int = (minimum: number, maximum: number): Schema => ({
  type: "integer",
  minimum,
  maximum,
});
const bool: Schema = { type: "boolean" };
const uuid: Schema = {
  type: "string",
  pattern:
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
};
const choice = (...values: string[]): Schema => ({
  type: "string",
  enum: values,
});
const nullable = (schema: Schema): Schema => ({
  anyOf: [schema, { type: "null" }],
});
const list = (items: Schema, maxItems = 20): Schema => ({
  type: "array",
  items,
  maxItems,
});
const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
const itemQuantity = obj({ itemId: uuid, quantity: int(1, 1000) });
const mechanic = (kind: string, properties: Record<string, Schema>) =>
  obj({ kind: choice(kind), ...properties });
export const mechanicSchema: Schema = {
  anyOf: [
    mechanic("resource.spend", {
      entityId: uuid,
      resource: str(80),
      amount: int(1, 1000),
    }),
    mechanic("item.consume", {
      actorId: uuid,
      itemId: uuid,
      quantity: int(1, 1000),
    }),
    mechanic("item.transfer", {
      actorId: uuid,
      itemId: uuid,
      quantity: int(1, 1000),
      destinationStorageId: uuid,
    }),
    mechanic("item.equip", {
      actorId: uuid,
      itemId: uuid,
      slot: nullable(str(80)),
    }),
    mechanic("quest.transition", {
      questId: uuid,
      status: choice("open", "complete", "archived"),
    }),
    mechanic("location.move", { locationId: uuid }),
    mechanic("encounter.start", { participantIds: list(uuid) }),
    mechanic("encounter.action", {
      actorId: uuid,
      action: choice(
        "attack",
        "attempt",
        "defend",
        "move",
        "end-turn",
        "intercept",
        "item",
      ),
      targetId: nullable(uuid),
      itemId: nullable(uuid),
      position: nullable(choice("nearby", "far", "cover")),
    }),
    mechanic("encounter.end", {
      outcome: choice(
        "victory",
        "escape",
        "surrender",
        "negotiation",
        "objective-completion",
      ),
    }),
    mechanic("rest.enter", {
      restKind: choice("short", "long"),
      participantIds: list(uuid),
    }),
    mechanic("rest.leave", { restId: uuid }),
    mechanic("rest.complete", { restId: uuid, supplies: list(itemQuantity) }),
    mechanic("recipe.prepare", {
      actorId: uuid,
      recipe: choice("meal", "coffee"),
      ingredients: list(itemQuantity),
      outputStorageId: uuid,
    }),
    mechanic("recipe.serve", {
      actorId: uuid,
      itemId: uuid,
      recipientIds: list(uuid),
    }),
    mechanic("item.transform", {
      actorId: uuid,
      recipe: choice("improvised-spear"),
      inputs: list(itemQuantity),
      toolIds: list(uuid),
      outputStorageId: uuid,
    }),
    mechanic("forage", { actorId: uuid, outputStorageId: uuid }),
  ],
};
export const checkSchema = obj({
  index: int(0, 7),
  actorId: uuid,
  targetId: nullable(uuid),
  kind: choice("skill", "attack", "save", "transform"),
  stat: choice("skill", "attack", "save"),
  dc: int(1, 40),
  dcPublic: bool,
  visibility: choice("player", "private"),
  important: bool,
  uncertainty: choice("meaningful", "trivial", "impossible", "unchanged"),
  advantage: choice("normal", "advantage", "disadvantage"),
});
export const planSchema = obj({
  narration: str(4000),
  checks: list(checkSchema, 8),
  publicPatches: list(mechanicSchema, 12),
  privatePatches: list(
    obj({
      kind: choice("fact", "clock", "npc", "faction", "consequence"),
      key: { ...str(80), minLength: 1, pattern: "^[a-zA-Z0-9_-]+$" },
      operation: choice("set", "advance"),
      value: nullable(str(2000)),
      amount: nullable(int(0, 100)),
    }),
    20,
  ),
  visualDescription: str(2000),
  clarification: nullable(str(1000)),
  guidanceProposal: nullable(str(2000)),
});
export const narrationSchema = obj({
  narration: { ...str(6000), minLength: 1 },
  visualDescription: str(2000),
  clarification: nullable(str(1000)),
});
export const foundationPlanSchema = obj({
  ...planSchema.properties!,
  foundationAction: nullable(foundationActionSchema),
});
const teachingStyleDeltaSchema = obj({
  companionAgency: nullable(choice("low", "normal", "high")),
  descriptionDensity: nullable(choice("concise", "balanced", "rich")),
  dialogueDensity: nullable(choice("concise", "balanced", "rich")),
  dramaticPace: nullable(choice("measured", "balanced", "brisk")),
  mystery: nullable(choice("low", "normal", "high")),
  failForward: nullable(choice("low", "normal", "high")),
  tone: nullable(choice("grounded", "warm", "cinematic")),
});
const teachingLocaleSchema = obj({
  title: { ...str(120), minLength: 1 },
  guidance: { ...str(1600), minLength: 1 },
  avoid: { ...str(800), minLength: 1 },
});
export const teachingCandidateSchema: Schema = {
  anyOf: [
    obj({
      kind: choice("campaign_style"),
      explanation: { ...str(1000), minLength: 1 },
      styleDelta: teachingStyleDeltaSchema,
    }),
    obj({
      kind: choice("global_craft"),
      explanation: { ...str(1000), minLength: 1 },
      entry: obj({
        category: { ...str(80), minLength: 1 },
        stages: list(choice("plan", "narrate"), 2),
        triggers: list({ ...str(80), minLength: 2 }, 12),
        en: teachingLocaleSchema,
        ru: teachingLocaleSchema,
        provenance: choice("Proposed owner-reviewed generalized lesson"),
      }),
    }),
  ],
};
export const feedbackSchema = obj({
  narration: { ...str(6000), minLength: 1 },
  guidanceProposal: nullable(str(2000)),
  teachingCandidate: nullable(teachingCandidateSchema),
});

// Validate independently even when the provider claims strict schema adherence.
export function validates(schema: Schema, value: unknown, depth = 0): boolean {
  if (depth > 20) return false;
  if (schema.anyOf)
    return schema.anyOf.some((candidate) =>
      validates(candidate, value, depth + 1),
    );
  if (schema.enum && !schema.enum.some((candidate) => candidate === value))
    return false;
  switch (schema.type) {
    case "null":
      return value === null;
    case "boolean":
      return typeof value === "boolean";
    case "integer":
    case "number":
      return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        (schema.type !== "integer" || Number.isSafeInteger(value)) &&
        value >= (schema.minimum ?? -Infinity) &&
        value <= (schema.maximum ?? Infinity)
      );
    case "string":
      return (
        typeof value === "string" &&
        value.length >= (schema.minLength ?? 0) &&
        value.length <= (schema.maxLength ?? Infinity) &&
        (!schema.pattern || new RegExp(schema.pattern).test(value))
      );
    case "array":
      return (
        Array.isArray(value) &&
        value.length <= (schema.maxItems ?? Infinity) &&
        value.every((item) => validates(schema.items!, item, depth + 1))
      );
    case "object": {
      if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
      const record = value as Record<string, unknown>;
      return (
        Object.keys(record).length === schema.required!.length &&
        schema.required!.every(
          (key) =>
            Object.hasOwn(record, key) &&
            validates(schema.properties![key], record[key], depth + 1),
        )
      );
    }
    default:
      return false;
  }
}
export function parsePlan(value: unknown): DmPlan {
  const extended =
    value !== null &&
    typeof value === "object" &&
    Object.hasOwn(value, "foundationAction");
  if (!validates(extended ? foundationPlanSchema : planSchema, value))
    throw new DmError("validation");
  const plan = value as DmPlan;
  if (plan.foundationAction)
    parseFoundationActionProposal(plan.foundationAction);
  if (
    new Set(plan.checks.map((check) => check.index)).size !==
      plan.checks.length ||
    plan.privatePatches.some((patch) =>
      patch.operation === "set"
        ? patch.value === null || patch.amount !== null
        : patch.amount === null ||
          patch.value !== null ||
          patch.kind !== "clock",
    )
  )
    throw new DmError("validation");
  return plan;
}
export function parseNarration(value: unknown): NarrationResult {
  if (!validates(narrationSchema, value)) throw new DmError("validation");
  return value as NarrationResult;
}
export function parseFeedback(value: unknown): FeedbackResult {
  // Previously recorded/scripted feedback had no candidate field.
  const normalized = value && typeof value === "object" && !Array.isArray(value) &&
    !Object.hasOwn(value, "teachingCandidate")
    ? { ...value, teachingCandidate: null } : value;
  if (!validates(feedbackSchema, normalized)) throw new DmError("validation");
  const candidate = (normalized as FeedbackResult).teachingCandidate;
  if (candidate?.kind === "campaign_style") {
    const count = Object.values(candidate.styleDelta).filter((entry) => entry !== null).length;
    if (count < 1 || count > 3) throw new DmError("validation");
  }
  if (candidate?.kind === "global_craft") {
    if (!candidate.entry.stages.length || new Set(candidate.entry.stages).size !== candidate.entry.stages.length ||
      new Set(candidate.entry.triggers).size !== candidate.entry.triggers.length)
      throw new DmError("validation");
  }
  // Preserve the exact legacy result shape for already-scripted providers.
  return value as FeedbackResult;
}
