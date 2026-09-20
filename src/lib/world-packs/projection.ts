import type { CampaignPackBinding } from "../production/contracts.ts";
import type { TypedRecord } from "../world-library/types.ts";
import { parseLibraryRecord } from "../world-library/parsers.ts";
import { ensure, integer, uuid } from "../world-library/validation.ts";
import { parseBinding } from "./bindings.ts";

export function projectCharacterKnowledge(
  pack: TypedRecord<"pack">,
  binding: CampaignPackBinding,
  entityId: string,
  worldMinutes: number,
  limit = 100,
): { text: string; epistemic: string }[] {
  const b = parseBinding(binding),
    p = parseLibraryRecord(pack, b.ownerId);
  uuid(entityId);
  integer(worldMinutes, b.entry.worldMinutes);
  integer(limit, 1, 200);
  ensure(
    p.kind === "pack" &&
      p.id === b.packId &&
      p.versionId === b.packVersionId &&
      p.body.status === "approved",
    "scope",
  );
  const actor = b.mappings.find((m) => m.entityId === entityId);
  ensure(actor, "scope");
  const disputed = new Set(
    p.body.contradictions
      .filter((c) => c.status === "unresolved")
      .flatMap((c) => c.claimIds),
  );
  return p.body.claims
    .filter(
      (c) =>
        c.visibility === "public" &&
        c.knowledge === "character" &&
        c.authority === "approved_canon" &&
        c.knownByEntityIds.includes(actor.packEntityId) &&
        c.validFrom !== null &&
        c.validFrom <= worldMinutes &&
        (c.validUntil === null || c.validUntil > worldMinutes) &&
        !disputed.has(c.id) &&
        c.evidence.every(
          (e) =>
            e.visibility === "public" &&
            e.knowledge === "character" &&
            b.sourceVersionIds.includes(e.sourceVersionId),
        ),
    )
    .sort((left, right) => {
      const rank = (claim: (typeof p.body.claims)[number]) =>
        Math.min(
          b.sourcePriority.length,
          ...claim.evidence.map((e) =>
            b.sourcePriority.indexOf(e.sourceVersionId),
          ),
        );
      return rank(left) - rank(right) || left.id.localeCompare(right.id);
    })
    .slice(0, limit)
    .map((c) => ({ text: c.text, epistemic: c.epistemic }));
}
export type CampaignSourceCorrection = {
  ownerId: string;
  campaignId: string;
  correctionId: string;
  sourceVersionId: string;
};
// Invoke with an existing committed manual correction. The owning Memory transaction
// supplies this hook; library upload alone never calls it or mutates another campaign.
export async function invalidateCampaignSource(
  binding: CampaignPackBinding,
  correction: CampaignSourceCorrection,
  invalidateExistingMemory: (scope: CampaignSourceCorrection) => Promise<void>,
): Promise<void> {
  const b = parseBinding(binding);
  const scope = {
    ownerId: uuid(correction.ownerId),
    campaignId: uuid(correction.campaignId),
    correctionId: uuid(correction.correctionId),
    sourceVersionId: uuid(correction.sourceVersionId),
  };
  ensure(
    scope.ownerId === b.ownerId &&
      scope.campaignId === b.campaignId &&
      b.sourceVersionIds.includes(scope.sourceVersionId),
    "scope",
  );
  await invalidateExistingMemory(scope);
}
