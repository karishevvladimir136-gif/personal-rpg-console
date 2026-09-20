import type { FoundationLoopState, LoopContext } from "./contracts.ts";
import type { FoundationSnapshot } from "../production/contracts.ts";
import type { WorldState } from "../world/contracts.ts";
import { validateFoundationSnapshot } from "../world/stage.ts";
import { parseWorldState } from "../world/validation.ts";

export function emptyLoopState(
  foundation: FoundationSnapshot,
): FoundationLoopState {
  return {
    schemaVersion: 1,
    version: 0,
    profile: structuredClone(foundation.ruleset),
    progression: "off",
    currencies: [],
    itemPolicies: [],
    merchants: [],
    tracks: [],
    rewards: [],
    progress: [],
    pending: [],
    preparations: [],
  };
}

export function emptyWorld(foundation: FoundationSnapshot): WorldState {
  return {
    schemaVersion: 1,
    campaignId: foundation.campaignId,
    policy: {
      simulation: false,
      autonomy: "moderate",
      deadlinePressure: "off",
    },
    policyChangedAtWorldMinutes: foundation.worldMinutes,
    actors: [],
    threads: [],
    hooks: [],
    warnings: [],
  };
}

// Private RPC adapter only. Each domain independently validates the records it uses.
export function readLoopContext(value: unknown): LoopContext {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("rpg_validation");
  const raw = value as LoopContext;
  validateFoundationSnapshot(raw.foundation);
  if (
    raw.snapshot?.campaign.id !== raw.foundation.campaignId ||
    !Array.isArray(raw.events)
  )
    throw new Error("rpg_validation");
  const state = raw.state ?? emptyLoopState(raw.foundation);
  if (
    state.schemaVersion !== 1 ||
    !Number.isSafeInteger(state.version) ||
    state.version < 0
  )
    throw new Error("rpg_validation");
  const world =
    raw.foundation.world === null
      ? emptyWorld(raw.foundation)
      : parseWorldState(raw.foundation.world, raw.foundation.campaignId);
  return {
    foundation: raw.foundation,
    state,
    snapshot: raw.snapshot,
    world,
    events: raw.events,
  };
}
