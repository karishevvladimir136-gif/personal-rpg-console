import type { WorldState } from "./contracts.ts";
import { parseWorldState } from "./validation.ts";

/** Explicit allowlist. Latent hook counts, private titles, causal membership, current
 * undisclosed progress/status and actor knowledge never become browser state. */
export function projectPublicWorld(value: WorldState) {
  const world = parseWorldState(value, value.campaignId);
  return {
    campaignId: world.campaignId,
    policy: { ...world.policy },
    actors: world.actors
      .filter((actor) => actor.publicName !== null)
      .map((actor) => ({ id: actor.id, name: actor.publicName! })),
    threads: world.threads
      .filter((thread) => thread.publicTitle !== null)
      .map((thread) => ({ id: thread.id, title: thread.publicTitle! })),
    hooks: world.hooks
      .filter((hook) => hook.discovery !== null)
      .map((hook) => ({
        id: hook.id,
        locationId: hook.locationId,
        label: hook.discovery!.label,
        text: hook.discovery!.text,
        kind: hook.discovery!.kind,
      })),
  };
}
