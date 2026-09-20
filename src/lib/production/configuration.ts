import type { FoundationCommand, FoundationSnapshot, ModelSelection } from "./contracts.ts";
import type { CampaignProductionSettings, ConfigureProductionInput, ProviderSettings } from "./configuration-contracts.ts";
import { validateModelSelection, validateRuntimePolicy } from "../model-runtime/registry.ts";
import { LEGACY_RULESET_REF, WORLD_LOGIC_REF, parseRulesetRef } from "../rulesets/profiles.ts";
import { parseWorldPolicy, parseWorldState } from "../world/validation.ts";
import { reconcileWorldPolicy } from "../world/policy.ts";
import { integer, nullable, object, uuid, ensure } from "../world-library/validation.ts";
import type { WorldState } from "../world/contracts.ts";

export function providerSettings(environment: Record<string, string | undefined>): ProviderSettings {
  const configured = Boolean(environment.OPENAI_API_KEY?.trim());
  let globalDefault: ModelSelection | null = null;
  try {
    globalDefault = validateModelSelection({ providerId: "openai", modelId: environment.OPENAI_DM_MODEL ?? "", reasoning: environment.OPENAI_DM_REASONING ?? null });
  } catch { /* An invalid environment setting is unavailable, never echoed or replaced. */ }
  return {
    schemaVersion: 1,
    providers: [{ id: "openai", label: "OpenAI", status: configured ? "configured_not_tested" : "unavailable" }],
    models: ["gpt-6-astra", "gpt-5.4", "gpt-5.4-mini"].map((id) => ({
      providerId: "openai", id, label: id,
      reasoning: id === "gpt-6-astra" ? ["low", "medium", "high", "xhigh", "max"] : ["none", "low", "medium", "high", "xhigh"],
    })),
    globalDefault,
    globalDefaultStatus: configured && globalDefault ? "configured_not_tested" : "unavailable",
  };
}

export function configurationProjection(snapshot: FoundationSnapshot, providers: ProviderSettings, autonomy: "low" | "moderate" | "high"): CampaignProductionSettings {
  return {
    campaignId: snapshot.campaignId,
    timeline: { ...snapshot.timeline }, revision: snapshot.revision,
    runtimeRevision: snapshot.runtimeRevision, headId: snapshot.headId,
    worldPolicy: snapshot.world ? parseWorldState(snapshot.world, snapshot.campaignId).policy : { simulation: false, autonomy, deadlinePressure: "off" },
    ruleset: { ...snapshot.ruleset },
    runtimePolicy: snapshot.executionPolicy ? validateRuntimePolicy(snapshot.executionPolicy) : null,
    pins: snapshot.bindings.map((binding) => ({ bindingId: binding.id, packId: binding.packId, packVersionId: binding.packVersionId, sourceVersionIds: [...binding.sourceVersionIds] })),
    providers,
  };
}

export function parseConfigureProduction(value: unknown): ConfigureProductionInput {
  const v = object(value, ["operationId", "timeline", "expectedRevision", "expectedRuntimeRevision", "expectedHeadId", "worldPolicy", "ruleset", "runtimePolicy"]);
  const fence = object(v.timeline, ["timelineId", "epoch"]);
  const ruleset = parseRulesetRef(v.ruleset);
  ensure([LEGACY_RULESET_REF.id, WORLD_LOGIC_REF.id].includes(ruleset.id));
  return {
    operationId: uuid(v.operationId),
    timeline: { timelineId: uuid(fence.timelineId), epoch: integer(fence.epoch, 0) },
    expectedRevision: integer(v.expectedRevision, 0), expectedRuntimeRevision: integer(v.expectedRuntimeRevision, 0),
    expectedHeadId: nullable(v.expectedHeadId, uuid),
    worldPolicy: parseWorldPolicy(v.worldPolicy), ruleset,
    runtimePolicy: v.runtimePolicy === null ? null : validateRuntimePolicy(v.runtimePolicy),
  };
}

export function prepareConfiguration(snapshot: FoundationSnapshot, value: unknown) {
  const input = parseConfigureProduction(value);
  const command: FoundationCommand = {
    operationId: input.operationId, campaignId: snapshot.campaignId, timeline: input.timeline,
    expectedRevision: input.expectedRevision, expectedRuntimeRevision: input.expectedRuntimeRevision, expectedHeadId: input.expectedHeadId,
  };
  ensure(snapshot.timeline.timelineId === input.timeline.timelineId && snapshot.timeline.epoch === input.timeline.epoch && snapshot.revision === input.expectedRevision && snapshot.runtimeRevision === input.expectedRuntimeRevision && snapshot.headId === input.expectedHeadId, "conflict");
  if (input.runtimePolicy) ensure(input.runtimePolicy.revision === (snapshot.executionPolicy?.revision ?? 0) + 1, "conflict");
  const world: WorldState = snapshot.world
    ? reconcileWorldPolicy(parseWorldState(snapshot.world, snapshot.campaignId), input.worldPolicy, snapshot.worldMinutes, [])
    : { schemaVersion: 1, campaignId: snapshot.campaignId, policy: input.worldPolicy, policyChangedAtWorldMinutes: snapshot.worldMinutes, actors: [], threads: [], hooks: [], warnings: [] };
  return { command, world, ruleset: input.ruleset, executionPolicy: input.runtimePolicy };
}
