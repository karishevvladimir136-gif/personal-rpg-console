// Off-screen plans of important NPCs and factions (plan §9, stage task §2b):
// private facts whose key starts with "plan_", kept as JSON. The receipts of
// advance_time, move_party and rest list the plans that came due, the dossier
// shows them to the DM, and the session digest advances them for the game
// time that passed. No agent, no background process: a part of the same turn.
import type { JsonObject } from "../contracts.ts";

export const PLAN_PREFIX = "plan_";

export type OffScreenPlan = {
  key: string;
  actorId: string | null;
  goal: string;
  dueWorldMinutes: number;
  setAtWorldMinutes: number;
  consequence: string;
  warning: string;
  status: "open" | "done" | "dropped";
};

export const planKey = (key: string) => key.startsWith(PLAN_PREFIX);

export function parsePlan(key: string, raw: unknown): OffScreenPlan | null {
  if (typeof raw !== "string") return null;
  let value: Record<string, unknown>;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== "object") return null;
  const status = value.status === "done" || value.status === "dropped" ? value.status : "open";
  return {
    key, actorId: typeof value.actorId === "string" ? value.actorId : null,
    goal: typeof value.goal === "string" ? value.goal : "",
    dueWorldMinutes: Number.isFinite(Number(value.dueWorldMinutes)) ? Number(value.dueWorldMinutes) : 0,
    setAtWorldMinutes: Number.isFinite(Number(value.setAtWorldMinutes)) ? Number(value.setAtWorldMinutes) : 0,
    consequence: typeof value.consequence === "string" ? value.consequence : "",
    warning: typeof value.warning === "string" ? value.warning : "",
    status,
  };
}

/** Every plan in the private state, open first, soonest due first. */
export function allPlans(privateState: JsonObject): OffScreenPlan[] {
  const bucket = privateState.fact;
  if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return [];
  return Object.entries(bucket).flatMap(([key, raw]) => (planKey(key) ? [parsePlan(key, raw)] : []))
    .filter((plan): plan is OffScreenPlan => plan !== null)
    .sort((a, b) => Number(a.status !== "open") - Number(b.status !== "open") || a.dueWorldMinutes - b.dueWorldMinutes);
}

/** Open plans whose due time has passed by `worldMinutes`. */
export function duePlans(privateState: JsonObject, worldMinutes: number): OffScreenPlan[] {
  return allPlans(privateState).filter((plan) => plan.status === "open" && plan.dueWorldMinutes <= worldMinutes);
}

export function serializePlan(plan: OffScreenPlan): string {
  const { key: _key, ...body } = plan;
  void _key;
  return JSON.stringify(body);
}
