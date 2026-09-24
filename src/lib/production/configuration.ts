import type {
  FoundationCommand,
  FoundationSnapshot,
  ModelSelection,
} from "./contracts.ts";
import type {
  CampaignProductionSettings,
  ConfigureProductionInput,
  ProviderSettings,
} from "./configuration-contracts.ts";
import {
  validateModelSelection,
  validateRuntimePolicy,
} from "../model-runtime/registry.ts";
import {
  LEGACY_RULESET_REF,
  WORLD_LOGIC_REF,
  parseRulesetRef,
} from "../rulesets/profiles.ts";
import { parseWorldPolicy, parseWorldState } from "../world/validation.ts";
import { openAiModelCapabilities } from "../model-runtime/capabilities.ts";
import {
  parseWorldReconciliationChoice,
  prepareWorldPolicyReconciliation,
} from "../world/reconciliation.ts";
import {
  integer,
  nullable,
  object,
  uuid,
  ensure,
} from "../world-library/validation.ts";

export function providerSettings(
  environment: Record<string, string | undefined>,
): ProviderSettings {
  const configured = Boolean(environment.OPENAI_API_KEY?.trim());
  let globalDefault: ModelSelection | null = null;
  try {
    globalDefault = validateModelSelection({
      providerId: "openai",
      modelId: environment.OPENAI_DM_MODEL ?? "",
      reasoning: environment.OPENAI_DM_REASONING ?? null,
    });
  } catch {
    /* An invalid environment setting is unavailable, never echoed or replaced. */
  }
  return {
    schemaVersion: 1,
    providers: [
      {
        id: "openai",
        label: "OpenAI",
        status: configured ? "configured_not_tested" : "unavailable",
      },
    ],
    models: Object.entries(openAiModelCapabilities).map(([id, capability]) => ({
      providerId: "openai",
      id,
      label: id,
      reasoning: [...capability.reasoning],
    })),
    globalDefault,
    globalDefaultStatus:
      configured && globalDefault ? "configured_not_tested" : "unavailable",
  };
}

export function configurationProjection(
  snapshot: FoundationSnapshot,
  providers: ProviderSettings,
  autonomy: "low" | "moderate" | "high",
): CampaignProductionSettings {
  return {
    campaignId: snapshot.campaignId,
    timeline: { ...snapshot.timeline },
    revision: snapshot.revision,
    runtimeRevision: snapshot.runtimeRevision,
    headId: snapshot.headId,
    worldPolicy: snapshot.world
      ? parseWorldState(snapshot.world, snapshot.campaignId).policy
      : { simulation: false, autonomy, deadlinePressure: "off" },
    ruleset: { ...snapshot.ruleset },
    runtimePolicy: snapshot.executionPolicy
      ? validateRuntimePolicy(snapshot.executionPolicy)
      : null,
    pins: snapshot.bindings.map((binding) => ({
      bindingId: binding.id,
      packId: binding.packId,
      packVersionId: binding.packVersionId,
      sourceVersionIds: [...binding.sourceVersionIds],
    })),
    providers,
  };
}

export function parseConfigureProduction(
  value: unknown,
): ConfigureProductionInput {
  const v = object(value, [
    "operationId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
    "worldPolicy",
    "ruleset",
    "runtimePolicy",
    ...(value &&
    typeof value === "object" &&
    Object.hasOwn(value, "reconciliation")
      ? ["reconciliation"]
      : []),
  ]);
  const fence = object(v.timeline, ["timelineId", "epoch"]);
  const ruleset = parseRulesetRef(v.ruleset);
  ensure([LEGACY_RULESET_REF.id, WORLD_LOGIC_REF.id].includes(ruleset.id));
  const runtimePolicy =
    v.runtimePolicy === null ? null : validateRuntimePolicy(v.runtimePolicy);
  ensure(!runtimePolicy?.taskOverrides["canon.compile"]);
  // Authoring selections are pinned by their explicit jobs, not gameplay overrides.
  ensure(!runtimePolicy?.taskOverrides["world.compose"]);
  return {
    operationId: uuid(v.operationId),
    timeline: {
      timelineId: uuid(fence.timelineId),
      epoch: integer(fence.epoch, 0),
    },
    expectedRevision: integer(v.expectedRevision, 0),
    expectedRuntimeRevision: integer(v.expectedRuntimeRevision, 0),
    expectedHeadId: nullable(v.expectedHeadId, uuid),
    worldPolicy: parseWorldPolicy(v.worldPolicy),
    ruleset,
    runtimePolicy,
    ...(Object.hasOwn(v, "reconciliation")
      ? {
          reconciliation:
            v.reconciliation === null
              ? null
              : parseWorldReconciliationChoice(v.reconciliation),
        }
      : {}),
  };
}

export function prepareConfiguration(
  snapshot: FoundationSnapshot,
  value: unknown,
) {
  const input = parseConfigureProduction(value);
  const command: FoundationCommand = {
    operationId: input.operationId,
    campaignId: snapshot.campaignId,
    timeline: input.timeline,
    expectedRevision: input.expectedRevision,
    expectedRuntimeRevision: input.expectedRuntimeRevision,
    expectedHeadId: input.expectedHeadId,
  };
  ensure(
    snapshot.timeline.timelineId === input.timeline.timelineId &&
      snapshot.timeline.epoch === input.timeline.epoch &&
      snapshot.revision === input.expectedRevision &&
      snapshot.runtimeRevision === input.expectedRuntimeRevision &&
      snapshot.headId === input.expectedHeadId,
    "conflict",
  );
  if (input.runtimePolicy)
    ensure(
      input.runtimePolicy.revision ===
        (snapshot.executionPolicy?.revision ?? 0) + 1,
      "conflict",
    );
  const { world } = prepareWorldPolicyReconciliation(
    snapshot,
    command,
    input.worldPolicy,
    input.reconciliation ?? null,
  );
  return {
    command,
    world,
    ruleset: input.ruleset,
    executionPolicy: input.runtimePolicy,
  };
}
