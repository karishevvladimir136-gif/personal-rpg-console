// The World Engine bridge (stage task §2b): the off-screen plans of a loop
// campaign, kept as private "plan_" facts, are projected into the existing World
// Engine structure — one thread per open plan with one deadline step — so the
// world save a loop campaign makes is a usable World Lab («Мастерская мира»)
// basis. Threads the engine already had that are not plans stay as they are;
// resolved plans resolve their thread; warnings are never touched (the
// configure action requires them unchanged). Deterministic IDs: the same plan
// always maps to the same thread, so a re-projection changes nothing.
import type { JsonObject } from "../contracts.ts";
import type { RuntimeSource } from "../server-contracts.ts";
import type { WorldActor, WorldPolicy, WorldState, WorldThread } from "../../world/contracts.ts";
import { stableGameplayId } from "../dice.ts";
import { allPlans } from "./plans.ts";

export const PLAN_THREAD_TITLE_PREFIX = "plan:";

export function worldPolicyFromSettings(values: { worldAutonomy?: string }): WorldPolicy {
  const autonomy = values.worldAutonomy === "low" || values.worldAutonomy === "high" ? values.worldAutonomy : "moderate";
  return { simulation: true, autonomy, deadlinePressure: "normal" };
}

/** The World Engine state after projecting the dossier's plans. Returns null
 * when nothing would change against `existing`. */
export function worldStateFromDossier(source: RuntimeSource, existing: WorldState | null, policy: WorldPolicy): WorldState | null {
  const cid = source.snapshot.campaign.id;
  const minutes = source.runtime.worldMinutes;
  const controlled = new Set(source.runtime.configuration?.controlledEntityIds ?? []);
  const plans = allPlans(source.privateState);
  const threadId = (key: string) => stableGameplayId(cid, `world-bridge:thread:${key}`);
  const stepId = (key: string) => stableGameplayId(cid, `world-bridge:step:${key}`);
  const actorsById = new Map(existing?.actors.map((actor) => [actor.id, actor]) ?? []);
  const actorFor = (entityId: string): WorldActor | null => {
    const entity = source.snapshot.entities.find((row) => row.id === entityId && row.campaign_id === cid);
    if (!entity) return null;
    const current = actorsById.get(entityId);
    const control: WorldActor["control"] = entity.kind === "player" || controlled.has(entityId) ? "player" : "autonomous";
    if (current) return current.control === control ? current : { ...current, control };
    return { id: entityId, campaignId: cid, revision: 1, kind: "entity", entityId, control,
      publicName: entity.name, locationId: null, capabilities: [], knowledge: [] };
  };
  const hero = source.snapshot.entities.find((row) => row.kind === "player" && row.campaign_id === cid);
  const actors = new Map<string, WorldActor>();
  for (const actor of existing?.actors ?? []) actors.set(actor.id, actor);
  if (hero) { const actor = actorFor(hero.id); if (actor) actors.set(actor.id, actor); }
  const threads: WorldThread[] = (existing?.threads ?? []).filter((thread) => !thread.title.startsWith(PLAN_THREAD_TITLE_PREFIX));
  for (const plan of plans) {
    const actor = plan.actorId ? actorFor(plan.actorId) : null;
    if (actor) actors.set(actor.id, actor);
    // A plan of the hero's own party is not an autonomous thread.
    if (actor && actor.control === "player") continue;
    const resolved = plan.status !== "open";
    threads.push({
      id: threadId(plan.key), campaignId: cid, revision: 1, title: `${PLAN_THREAD_TITLE_PREFIX}${plan.key}`, publicTitle: null,
      actorIds: actor ? [actor.id] : [], decisionActorIds: actor ? [actor.id] : [], locationIds: [], prerequisiteThreadIds: [],
      status: resolved ? "resolved" : "active", cursor: resolved ? 1 : 0,
      steps: [{ id: stepId(plan.key), trigger: { kind: "deadline", atWorldMinutes: Math.max(0, plan.dueWorldMinutes), scenarioCritical: false, established: false },
        resolution: "resolver_required", consequence: plan.warning ? "surface_before_complete" : "background",
        privateText: `${plan.goal}${plan.consequence ? `\nConsequence: ${plan.consequence}` : ""}${plan.warning ? `\nWarning: ${plan.warning}` : ""}`.slice(0, 4000),
        evidence: [], publicOutcome: null, warning: null, hookChanges: [] }],
    });
  }
  const next: WorldState = { schemaVersion: 1, campaignId: cid, policy: existing?.policy ?? policy,
    policyChangedAtWorldMinutes: existing?.policyChangedAtWorldMinutes ?? minutes,
    actors: [...actors.values()], threads, hooks: existing?.hooks ?? [], warnings: existing?.warnings ?? [] };
  if (existing && JSON.stringify(existing) === JSON.stringify(next)) return null;
  return next;
}

export const worldStateJson = (state: WorldState) => state as unknown as JsonObject;
