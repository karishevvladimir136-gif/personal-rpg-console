import type { JsonObject, TurnInput } from "./contracts.ts";
import type { MechanicsResolution, RecordChange, RuntimeSource } from "./server-contracts.ts";
import { requireRule, TurnError } from "./turn-errors.ts";
import { assertEffectScope, planAstraSettlement, type AstraEffectIntent,
  type AstraOrderedEffectsPlan, type AstraSettlementPlan } from "./astra-settlement.ts";
import { assertAstraMechanicsScope, planAstraMechanics,
  type AstraMechanicsIntent } from "./astra-mechanics.ts";

const snapshotFamilies = new Set(["entities", "storages", "items", "quests", "locations"]);
const runtimeFamilies: Record<string, string> = {
  rest_records: "restRecords", recipes: "recipes", effects: "effects",
  encounters: "encounters", encounter_participants: "participants",
  pending_actions: "pendingActions", conversations: "conversations", provenance: "provenance",
};

/** Only validated, server-derived changes enter this projection. Revisions remain
 * the original source revisions; the database applies each collapsed row once. */
export function applyAstraShadowChanges(source: RuntimeSource, changes: RecordChange[]) {
  for (const change of changes) {
    requireRule(change.values && typeof change.values === "object");
    if (change.family === "public_state") {
      requireRule(change.id === source.snapshot.campaign.id &&
        change.expectedRevision === source.snapshot.publicState.revision);
      Object.assign(source.snapshot.publicState, structuredClone(change.values));
      continue;
    }
    const container = snapshotFamilies.has(change.family) ? source.snapshot : source.runtime;
    const key = runtimeFamilies[change.family] ?? change.family;
    const rows = (container as unknown as Record<string, unknown>)[key] as
      (JsonObject & { id: string; campaign_id: string; revision?: number })[];
    requireRule(Array.isArray(rows));
    const row = rows.find((r) => r.id === change.id);
    if (row) {
      requireRule(row.campaign_id === source.snapshot.campaign.id &&
        (change.expectedRevision === null || change.expectedRevision === (row.revision ?? null)));
      Object.assign(row, structuredClone(change.values));
    } else {
      requireRule(change.expectedRevision === null);
      rows.push({ id: change.id, campaign_id: source.snapshot.campaign.id,
        revision: 0, created_at: "", updated_at: "", ...structuredClone(change.values) });
    }
  }
}

function collapse(changes: Map<string, RecordChange>, incoming: RecordChange[]) {
  for (const change of incoming) {
    const key = `${change.family}:${change.id}`;
    const before = changes.get(key);
    requireRule(!before || before.expectedRevision === null ||
      before.expectedRevision === change.expectedRevision);
    changes.set(key, { ...change,
      expectedRevision: before ? before.expectedRevision : change.expectedRevision,
      values: { ...before?.values, ...structuredClone(change.values) } });
  }
}

function applySettlementMetadata(shadow: RuntimeSource, input: TurnInput, plan: AstraSettlementPlan) {
  if (plan.currencyDefinition) {
    requireRule(shadow.astraProgressionState);
    shadow.astraSettlementCurrencies ??= [];
    shadow.astraSettlementCurrencies.push(structuredClone(plan.currencyDefinition));
    shadow.astraProgressionState.currencies.push(structuredClone(plan.currencyDefinition));
    shadow.astraProgressionState.version += 1;
  }
  if (plan.progressionState) shadow.astraProgressionState = structuredClone(plan.progressionState);
  const intent = plan.intent;
  if (intent.kind === "job_offer") {
    shadow.astraSettlementJobs ??= [];
    shadow.astraSettlementJobs.push({ questId: plan.publicOutcome.questId!,
      issuerId: intent.issuerId, rewardOperationId: null,
      rewardTerms: { issuerId: intent.issuerId, currencyName: intent.currencyName,
        currencyAmount: intent.currencyAmount, itemName: intent.itemName,
        itemCategory: intent.itemCategory, itemDescription: intent.itemDescription } });
  } else if (intent.kind === "job_reward") {
    const job = shadow.astraSettlementJobs?.find((j) => j.questId === intent.questId);
    requireRule(job);
    job.rewardOperationId = input.operationId;
  }
}

const isMechanics = (intent: AstraEffectIntent): intent is AstraMechanicsIntent =>
  intent.kind === "mechanic_actions" || intent.kind === "formal_rest";

/** Compose in the proposed order. An optional failure discards its entire local
 * shadow, so later effects observe only the previously accepted after-state. */
export function planAstraOrderedEffects(source: RuntimeSource, input: TurnInput,
  intents: AstraEffectIntent[], base: MechanicsResolution): AstraOrderedEffectsPlan | null {
  requireRule(Array.isArray(intents) && intents.length <= 6);
  if (!intents.length) return null;
  requireRule(input.mode === "game" && !!source.worldTakeover);
  let shadow = structuredClone(source);
  applyAstraShadowChanges(shadow, base.changes);
  shadow.runtime.worldMinutes = base.worldMinutes;
  shadow.runtime.configuration = structuredClone(base.configuration);
  if (shadow.worldTakeover && base.configuration)
    shadow.worldTakeover.presentEntityIds = [...base.configuration.presentEntityIds];
  const changes = new Map<string, RecordChange>();
  collapse(changes, base.changes);
  const effects: AstraOrderedEffectsPlan["effects"] = [];
  const indices: number[] = [];
  const normalized = structuredClone(intents);
  const rejected: AstraOrderedEffectsPlan["rejected"] = [];
  const outcomes = structuredClone(base.outcomes);
  let foundationTouched = false;
  for (const [index, intent] of intents.entries()) {
    if (intent.kind === "unsupported_optional") {
      requireRule(typeof intent.description === "string" &&
        intent.description.length >= 1 && intent.description.length <= 160);
      rejected.push({ index, reason: "not_authorized" });
      continue;
    }
    // Foreign identities are hard integrity failures even if the requested
    // mechanic would otherwise be unavailable in the current fiction.
    if (isMechanics(intent)) assertAstraMechanicsScope(shadow, input, intent);
    else assertEffectScope(shadow, intent);
    const candidate = structuredClone(shadow);
    try {
      const plan = isMechanics(intent) ? planAstraMechanics(candidate, input, intent)
        : planAstraSettlement(candidate, input, intent, []);
      requireRule(plan);
      const resolution = "resolution" in plan ? plan.resolution : null;
      const delta = resolution ? resolution.changes : (plan as AstraSettlementPlan).changes;
      applyAstraShadowChanges(candidate, delta);
      if (resolution) {
        candidate.runtime.configuration = structuredClone(resolution.configuration);
        candidate.runtime.worldMinutes = resolution.worldMinutes;
        if (candidate.worldTakeover && resolution.configuration)
          candidate.worldTakeover.presentEntityIds = [...resolution.configuration.presentEntityIds];
      } else {
        applySettlementMetadata(candidate, input, plan as AstraSettlementPlan);
      }
      const composed = new Map(changes);
      collapse(composed, delta);
      requireRule(composed.size <= 100 &&
        Number.isSafeInteger(candidate.runtime.worldMinutes) &&
        candidate.runtime.worldMinutes >= source.runtime.worldMinutes &&
        candidate.runtime.worldMinutes <= source.runtime.worldMinutes + 1440);
      changes.clear();
      for (const [key, value] of composed) changes.set(key, value);
      shadow = candidate;
      effects.push(plan);
      indices.push(index);
      normalized[index] = plan.intent;
      if (resolution) outcomes.push(...resolution.outcomes);
      foundationTouched ||= !resolution && (!!(plan as AstraSettlementPlan).currencyDefinition ||
        !!(plan as AstraSettlementPlan).progressionState);
    } catch (error) {
      if (!(error instanceof TurnError) || error.code !== "validation") throw error;
      rejected.push({ index, reason: "not_authorized" });
    }
  }
  return { schemaVersion: 2, effects, indices, intents: normalized, rejected,
    resolution: { changes: [...changes.values()], worldMinutes: shadow.runtime.worldMinutes,
      configuration: shadow.runtime.configuration, outcomes },
    foundationState: foundationTouched ? shadow.astraProgressionState ?? null : null };
}
