import type { TurnInput, JsonObject } from "./contracts.ts";
import type { RecordChange, RuntimeSource } from "./server-contracts.ts";
import { stableGameplayId } from "./dice.ts";
import { requireRule } from "./turn-errors.ts";
import { applyAstraShadowChanges } from "./astra-ordered-effects.ts";
import { selectedContinuitySubjects } from "./astra-natural-continuity.ts";
import { planNaturalEncounter } from "./astra-natural-effects.ts";
import { effectiveNaturalChanges } from "./astra-natural-effective.ts";

export type NaturalMaterializationRequest = {
  subjectRef: string;
  kind: "npc" | "creature" | "place" | "item";
  purpose: "job" | "trade" | "inventory" | "combat" | "party" | "track" | "recurring";
  ownerRef: string | null;
};
export type NaturalMaterializationReceipt = {
  position: number;
  request: NaturalMaterializationRequest;
  recordId: string;
  changes: RecordChange[];
};
export type NaturalTurnState = {
  schemaVersion: 1;
  materializations: NaturalMaterializationReceipt[];
  sourceHash?: string;
  effectiveRecordIds?: string[];
  publication?: { continuity: JsonObject | null; behavior: JsonObject[] };
};
type Origin = { subjectRef: string; kind: NaturalMaterializationRequest["kind"]; recordId: string };
type NaturalSource = RuntimeSource & { astraNaturalState?: NaturalTurnState;
  astraNaturalOrigins?: Origin[] };
const bounded = (value: unknown, max: number): value is string => typeof value === "string" &&
  value.length > 0 && value.length <= max && !/^ | $/.test(value) && !/[\u0000-\u001f\u007f]/.test(value);

function subject(source: RuntimeSource, input: TurnInput, request: NaturalMaterializationRequest) {
  if (request.subjectRef.startsWith("input:")) {
    const name = request.subjectRef.slice(6);
    requireRule(bounded(name, 100) && input.input.includes(name));
    return { name, description: `An ordinary ${name}.` };
  }
  // The continuity selector is current-first: an older description of the
  // same public subject must not override its latest established identity.
  const found = selectedContinuitySubjects(source, input).find((row) =>
    row.id === request.subjectRef && row.kind === request.kind);
  if (found) return found;
  requireRule(false);
  throw new Error("unreachable");
}

export function naturalLocaleKey(source: RuntimeSource): string | null {
  const scene = source.snapshot.scenes.find((row) => row.id === source.snapshot.publicState.current_scene_id);
  const capsule = (scene as unknown as { public_continuity?: {
    parentLocationId: string; locale: { name: string } | null;
  } } | undefined)?.public_continuity;
  return capsule?.parentLocationId === source.snapshot.publicState.current_location_id
    ? capsule.locale?.name.replace(/[A-Z]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 32)) ?? null : null;
}

/** Public records are projections until the fenced final commit; these changes
 * are never granted directly to a model or persisted by the TypeScript layer. */
export function materializeNaturalSubject(source: RuntimeSource, input: TurnInput,
  request: NaturalMaterializationRequest, position: number): {
    receipt: NaturalMaterializationReceipt; source: RuntimeSource;
  } {
  requireRule(source.snapshot.campaign.id === input.campaignId &&
    source.runtime.campaignId === input.campaignId && input.mode === "game" &&
    source.runtime.revision === input.expectedRevision &&
    Number.isInteger(position) && position >= 0 && position < 8 && request &&
    Object.keys(request).length === 4 &&
    ["npc", "creature", "place", "item"].includes(request.kind) &&
    ["job", "trade", "inventory", "combat", "party", "track", "recurring"].includes(request.purpose));
  const state = (source as NaturalSource).astraNaturalState ?? { schemaVersion: 1, materializations: [] };
  requireRule(position === state.materializations.length);
  requireRule(request.kind === "place" ? ["track", "recurring"].includes(request.purpose)
    : request.kind === "item" ? ["inventory", "trade", "track", "recurring"].includes(request.purpose)
    : request.purpose !== "inventory");
  const identity = subject(source, input, request);
  const existing = [...((source as NaturalSource).astraNaturalOrigins ?? []).filter((row) =>
    !request.subjectRef.startsWith("input:") && row.subjectRef === request.subjectRef),
    ...state.materializations.map((row) => ({ subjectRef: row.request.subjectRef,
      kind: row.request.kind, recordId: row.recordId }))].find((row) =>
    row.subjectRef === request.subjectRef && row.kind === request.kind);
  const id = existing?.recordId ?? stableGameplayId(input.operationId,
    `natural:${request.kind}:${request.subjectRef}`);
  const changes: RecordChange[] = [];
  const parent = source.snapshot.publicState.current_location_id;
  requireRule(parent && source.snapshot.locations.some((row) => row.id === parent &&
    row.campaign_id === input.campaignId && ["known", "visited"].includes(row.status)));
  requireRule(request.ownerRef === null || request.kind === "item" && request.purpose === "trade");
  if (!existing) {
    requireRule(![...source.snapshot.entities, ...source.snapshot.locations, ...source.snapshot.items]
      .some((row) => row.id === id));
    if (request.kind === "npc" || request.kind === "creature") {
      requireRule(request.ownerRef === null);
      changes.push({ family: "entities", id, expectedRevision: null, values: {
        kind: "npc", name: identity.name, details: identity.description,
        hp: 8, max_hp: 8, stats: { attack: 0, defense: 10, skill: 0 },
        resources: {}, conditions: [], equipment_slots: [],
      } });
    } else if (request.kind === "place") {
      requireRule(request.ownerRef === null && ["track", "recurring"].includes(request.purpose));
      changes.push({ family: "locations", id, expectedRevision: null,
        values: { name: identity.name, description: identity.description, status: "known" } });
    } else {
      let ownerId: string | null = null;
      let storageId: string;
      if (request.purpose === "inventory") {
        ownerId = source.runtime.configuration?.controlledEntityIds[0] ?? null;
        requireRule(ownerId && source.runtime.configuration?.controlledEntityIds.length === 1);
        const storage = source.snapshot.storages.find((row) => row.campaign_id === input.campaignId &&
          row.kind === "player" && row.entity_id === ownerId);
        requireRule(storage); storageId = storage.id;
      } else if (request.purpose === "trade") {
        requireRule(request.ownerRef !== null);
        ownerId = state.materializations.find((row) => row.request.subjectRef === request.ownerRef &&
          ["npc", "creature"].includes(row.request.kind))?.recordId ?? request.ownerRef;
        const owner = source.snapshot.entities.find((row) => row.id === ownerId &&
          row.campaign_id === input.campaignId && row.kind === "npc");
        requireRule(owner && source.runtime.configuration?.presentEntityIds.includes(owner.id));
        const storage = source.snapshot.storages.filter((row) => row.campaign_id === input.campaignId &&
          row.kind === "merchant" && row.entity_id === ownerId).sort((a, b) => a.id.localeCompare(b.id))[0];
        storageId = storage?.id ?? stableGameplayId(input.operationId, `natural:actor-storage:${ownerId}`);
        if (!storage) changes.push({ family: "storages", id: storageId, expectedRevision: null,
          values: { name: `Inventory of ${owner.name}`.slice(0, 160), kind: "merchant", entity_id: ownerId } });
      } else {
        const locale = naturalLocaleKey(source);
        storageId = stableGameplayId(input.campaignId, `natural:ground:${parent}:${locale ?? ""}`);
        if (!source.snapshot.storages.some((row) => row.id === storageId))
          changes.push({ family: "storages", id: storageId, expectedRevision: null,
            values: { name: "Ground", kind: "ground", entity_id: null,
              location_id: parent, locale_key: locale } });
      }
      changes.push({ family: "items", id, expectedRevision: null, values: {
        name: identity.name, category: "misc", quantity: 1, description: identity.description,
        mechanics: "", owner_entity_id: ownerId, storage_id: storageId,
        equipped_entity_id: null, equipped_slot: null,
      } });
    }
  }
  const receipt = { position, request: structuredClone(request), recordId: id, changes };
  if (request.purpose === "combat") {
    requireRule(["npc", "creature"].includes(request.kind));
    const provisional = projectNaturalSource(source,
      { ...state, materializations: [...state.materializations, receipt] });
    requireRule(!provisional.runtime.encounters.some((row) => row.status === "active"));
    const hero = provisional.runtime.configuration?.controlledEntityIds[0];
    requireRule(hero);
    const plan = planNaturalEncounter(provisional, input, { kind: "mechanic_actions",
      actions: [{ kind: "encounter.start", participantIds: [hero, id] }], restSafety: null });
    for (const change of plan.resolution.changes) {
      const created = changes.find((row) => row.family === change.family && row.id === change.id);
      if (created) Object.assign(created.values, change.values);
      else changes.push(change);
    }
  }
  return { receipt, source: projectNaturalSource(source,
    { ...state, materializations: [...state.materializations, receipt] }) };
}

export function projectNaturalSource(source: RuntimeSource, state: NaturalTurnState): RuntimeSource {
  const projected = structuredClone(source) as NaturalSource;
  const selectedChanges = naturalMaterializationChanges(state);
  for (const change of selectedChanges) {
    const runtimeKey = ({ encounters: "encounters", encounter_participants: "participants" } as Record<string, string>)[change.family];
    const rows = runtimeKey ? (projected.runtime as unknown as Record<string, {id:string;revision?:number}[]>)[runtimeKey]
      : projected.snapshot[change.family as "entities" | "storages" | "items" | "locations"];
    if (rows?.some((row) => row.id === change.id)) continue;
    applyAstraShadowChanges(projected, [change]);
    const row = rows?.find((entry) => entry.id === change.id);
    if (row) { if (runtimeKey) delete row.revision; else row.revision = 1; }
  }
  for (const receipt of state.materializations) {
    if (state.effectiveRecordIds && !state.effectiveRecordIds.includes(receipt.recordId)) continue;
    if (["npc", "creature"].includes(receipt.request.kind) &&
      !["track", "recurring"].includes(receipt.request.purpose) && projected.runtime.configuration) {
      if (!projected.runtime.configuration.presentEntityIds.includes(receipt.recordId))
        projected.runtime.configuration.presentEntityIds.push(receipt.recordId);
      if (projected.worldTakeover && !projected.worldTakeover.presentEntityIds.includes(receipt.recordId))
        projected.worldTakeover.presentEntityIds.push(receipt.recordId);
      const actor = projected.snapshot.entities.find((row) => row.id === receipt.recordId);
      if (projected.worldTakeover && actor && !projected.worldTakeover.actors.some((row) => row.entityId === actor.id))
        projected.worldTakeover.actors.push({ entityId: actor.id, publicName: actor.name,
          publicCapabilities: [], publicLimitations: [], publicKnowledge: [] });
    }
    if (receipt.request.kind === "place" && projected.worldTakeover &&
      !projected.worldTakeover.routeLocationIds.includes(receipt.recordId))
      projected.worldTakeover.routeLocationIds.push(receipt.recordId);
  }
  projected.astraNaturalState = structuredClone(state);
  return projected;
}

/** Keep required auxiliary rows even if the receipt that first created them
 * has an unaccepted primary Item. Shared storage does not confer ownership of
 * that unrelated Item or force it to be persisted. */
export function naturalMaterializationChanges(state: NaturalTurnState): RecordChange[] {
  return effectiveNaturalChanges(state);
}
