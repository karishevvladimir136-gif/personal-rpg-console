import type { FoundationSnapshot } from "../production/contracts.ts";
import { validTimeline } from "../memory/timeline.ts";
import { DmError } from "../gameplay/dm-errors.ts";

// Internal compatibility projection only. SQL remains the save engine and must
// restore/validate exact manifest families before calling this adapter. It does
// not enumerate Events, read library history, resolve a model, or replay work.
export function readFoundationSave(
  manifestVersion: 1 | 2,
  saved: FoundationSnapshot | null,
  serving: Pick<
    FoundationSnapshot,
    | "ownerId"
    | "campaignId"
    | "timeline"
    | "runtimeRevision"
    | "headId"
    | "worldMinutes"
  >,
): FoundationSnapshot {
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const valid = (condition: unknown) => {
    if (!condition) throw new DmError("validation");
  };
  valid(uuid.test(serving.ownerId) && uuid.test(serving.campaignId));
  valid(validTimeline(serving.timeline));
  valid(
    Number.isSafeInteger(serving.runtimeRevision) &&
      serving.runtimeRevision >= 0,
  );
  valid(
    Number.isSafeInteger(serving.worldMinutes) && serving.worldMinutes >= 0,
  );
  valid(serving.headId === null || uuid.test(serving.headId));
  const active = {
    ownerId: serving.ownerId,
    campaignId: serving.campaignId,
    timeline: { ...serving.timeline },
    runtimeRevision: serving.runtimeRevision,
    headId: serving.headId,
    worldMinutes: serving.worldMinutes,
  };
  if (manifestVersion === 1) {
    valid(saved === null);
    return {
      schemaVersion: 1,
      ...active,
      revision: 0,
      world: null,
      bindings: [],
      ruleset: {
        id: "console-basic-v1",
        version: 1,
        mode: "full_ruleset",
        validatorVersion: "console-basic-v1",
      },
      executionPolicy: null,
    };
  }
  valid(manifestVersion === 2 && saved !== null);
  if (!saved) throw new DmError("validation");
  valid(
    saved.schemaVersion === 1 &&
      saved.ownerId === serving.ownerId &&
      saved.campaignId === serving.campaignId,
  );
  valid(validTimeline(saved.timeline));
  valid(Number.isSafeInteger(saved.revision) && saved.revision >= 0);
  // A manifest cannot restore a foundation from a later/earlier game clock.
  valid(saved.worldMinutes === serving.worldMinutes);
  valid(
    saved.world === null ||
      (!!saved.world &&
        typeof saved.world === "object" &&
        !Array.isArray(saved.world)),
  );
  valid(Array.isArray(saved.bindings));
  for (const binding of saved.bindings) {
    valid(
      binding.schemaVersion === 1 &&
        binding.ownerId === serving.ownerId &&
        binding.campaignId === serving.campaignId,
    );
  }
  // Exact policy/source/ruleset values survive even if their provider or registry
  // is unavailable now. Execution will separately validate a pending profile.
  return {
    schemaVersion: 1,
    ...active,
    revision: saved.revision,
    world: structuredClone(saved.world),
    bindings: structuredClone(saved.bindings),
    ruleset: structuredClone(saved.ruleset),
    executionPolicy: structuredClone(saved.executionPolicy),
  };
}
