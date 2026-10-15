import type { TurnInput } from "./contracts.ts";
import type { RuntimeSource } from "./server-contracts.ts";
import { DmError } from "./dm-errors.ts";

export const naturalBehaviorStances = ["accept", "refuse", "hesitate", "deflect", "leave", "attack", "offer_conditions"] as const;
export const naturalBehaviorTones = ["neutral", "warm", "firm", "guarded", "angry", "fearful", "tired"] as const;
export type NaturalBehavior = {
  actorId: string;
  stance: typeof naturalBehaviorStances[number];
  tone: typeof naturalBehaviorTones[number];
  intensity: 1 | 2 | 3;
};

function shape(value: unknown): NaturalBehavior[] {
  if (!Array.isArray(value) || value.length > 2) throw new DmError("validation");
  const seen = new Set<string>();
  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new DmError("validation");
    const row = entry as Record<string, unknown>;
    if (Object.keys(row).length !== 4 ||
      !["actorId", "stance", "tone", "intensity"].every((key) => Object.hasOwn(row, key)) ||
      typeof row.actorId !== "string" || seen.has(row.actorId) ||
      !naturalBehaviorStances.includes(row.stance as NaturalBehavior["stance"]) ||
      !naturalBehaviorTones.includes(row.tone as NaturalBehavior["tone"]) ||
      ![1, 2, 3].includes(Number(row.intensity)) || typeof row.intensity !== "number")
      throw new DmError("validation");
    seen.add(row.actorId);
    return { actorId: row.actorId, stance: row.stance as NaturalBehavior["stance"],
      tone: row.tone as NaturalBehavior["tone"], intensity: row.intensity as 1 | 2 | 3 };
  });
}

/** Observable behavior only: no cognition, explanation, secret text or state
 * authority can cross the private/public narration boundary through this shape. */
export function validateNaturalBehavior(source: RuntimeSource, input: TurnInput, value: unknown): NaturalBehavior[] {
  if (source.snapshot.campaign.id !== input.campaignId || source.runtime.campaignId !== input.campaignId)
    throw new DmError("validation");
  const present = new Set(source.runtime.configuration?.presentEntityIds ?? source.worldTakeover?.presentEntityIds ?? []);
  const controlled = new Set(source.runtime.configuration?.controlledEntityIds ?? []);
  const rows = shape(value);
  if (rows.some((row) => !present.has(row.actorId) || controlled.has(row.actorId) ||
    !source.snapshot.entities.some((actor) => actor.id === row.actorId &&
      actor.campaign_id === input.campaignId && ["npc", "companion"].includes(actor.kind))))
    throw new DmError("validation");
  return rows;
}

/** Recreate the exact allowlist instead of spreading an untrusted object. The
 * actor scope must already have passed validateNaturalBehavior at final pin. */
export function projectNaturalBehavior(value: readonly NaturalBehavior[]): NaturalBehavior[] {
  return shape(value);
}
