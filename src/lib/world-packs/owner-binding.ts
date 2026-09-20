import type { CampaignPackBinding } from "../production/contracts.ts";
import type { LibraryStore } from "../world-library/store.ts";
import { libraryId } from "../world-library/local-compiler.ts";
import { ensure, uuid } from "../world-library/validation.ts";
import { buildCampaignBinding, parseBinding } from "./bindings.ts";

// The caller must authorize campaign ownership and submit the result under the current
// FoundationCommand fence/idle boundary. This helper never reads campaign private state.
export async function prepareOwnerPackBinding(
  library: LibraryStore,
  input: {
    ownerId: string;
    campaignId: string;
    operationId: string;
    packVersionId: string;
    existingBinding: CampaignPackBinding | null;
    entry: CampaignPackBinding["entry"];
  },
): Promise<CampaignPackBinding> {
  uuid(input.ownerId);
  uuid(input.campaignId);
  uuid(input.operationId);
  const pack = await library.get("pack", uuid(input.packVersionId));
  const previous = input.existingBinding
    ? parseBinding(input.existingBinding)
    : null;
  if (previous)
    ensure(
      previous.ownerId === input.ownerId &&
        previous.campaignId === input.campaignId &&
        previous.packId === pack.id &&
        previous.scenarioVersionId === null,
      "scope",
    );
  let index = 0;
  const binding = buildCampaignBinding({
    id:
      previous?.id ??
      libraryId(
        `${input.ownerId}:${input.campaignId}:${input.operationId}:binding`,
      ),
    campaignId: input.campaignId,
    ownerId: input.ownerId,
    pack,
    entry: input.entry,
    sourcePriority: pack.body.sourcePriority,
    allocateEntityId: () =>
      libraryId(
        `${input.campaignId}:${pack.id}:${pack.body.entities[index++].id}:instance`,
      ),
  });
  return parseBinding({
    ...binding,
    mappings: binding.mappings.map((m) => ({
      ...m,
      entityId:
        previous?.mappings.find((p) => p.packEntityId === m.packEntityId)
          ?.entityId ?? m.entityId,
    })),
  });
}
