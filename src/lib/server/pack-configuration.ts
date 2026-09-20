import "server-only";
import { authorizeCampaign } from "./campaign-authorization";
import { createSaveStore } from "./saves/store";
import { createLibraryStore } from "./world-library/store";
import { createPackStore } from "./world-packs/store";
import { readWorldFoundation } from "./world/store";
import { worldRpc } from "./production-configuration";
import { prepareOwnerPackBinding } from "../world-packs/owner-binding";
import { parseFoundationCommand } from "../world-packs/bindings";
import {
  object,
  uuid,
  text,
  integer,
  ensure,
} from "../world-library/validation";
import type { CampaignPackSettings } from "../production/pack-configuration-contracts";

export async function readCampaignPacks(
  campaignId: string,
): Promise<CampaignPackSettings> {
  const { user } = await authorizeCampaign(campaignId);
  const timeline = await createSaveStore(user.id).fence(campaignId);
  const snapshot = await readWorldFoundation(
    worldRpc(user.id),
    user.id,
    campaignId,
    timeline,
  );
  const library = createLibraryStore(user.id);
  const records = await library.read({ kind: "pack" });
  const packs = records.flatMap((p) =>
    p.kind === "pack" && p.body.status === "approved"
      ? [
          {
            id: p.id,
            versionId: p.versionId,
            version: p.version,
            title: p.body.title,
          },
        ]
      : [],
  );
  const pins = await Promise.all(
    snapshot.bindings.map(async (b) => {
      const pack = await library.get("pack", b.packVersionId);
      return {
        bindingId: b.id,
        packId: b.packId,
        packVersionId: b.packVersionId,
        title: pack.body.title,
        version: pack.version,
        entry: { label: b.entry.label, worldMinutes: b.entry.worldMinutes },
        sources: await Promise.all(
          b.sourcePriority.map(async (id) => {
            const source = await library.get("source", id);
            return {
              versionId: id,
              title: source.body.title,
              version: source.version,
              digest: source.body.digest,
            };
          }),
        ),
      };
    }),
  );
  return {
    campaignId,
    timeline,
    expectedRevision: snapshot.revision,
    expectedRuntimeRevision: snapshot.runtimeRevision,
    expectedHeadId: snapshot.headId,
    worldMinutes: snapshot.worldMinutes,
    packs,
    pins,
  };
}

export async function bindCampaignPack(campaignId: string, raw: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  const value = object(raw, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
    "packVersionId",
    "entry",
  ]);
  const { packVersionId, entry: entryRaw, ...rest } = value;
  const command = parseFoundationCommand(rest);
  ensure(command.campaignId === campaignId, "scope");
  const e = object(entryRaw, ["label", "worldMinutes"]);
  const entry = {
    label: text(e.label, 240),
    worldMinutes: integer(e.worldMinutes, 0),
    evidence: [],
  };
  const library = createLibraryStore(user.id);
  const pack = await library.get("pack", uuid(packVersionId));
  const snapshot = await readWorldFoundation(
    worldRpc(user.id),
    user.id,
    campaignId,
    command.timeline,
  );
  const binding = await prepareOwnerPackBinding(library, {
    ownerId: user.id,
    campaignId,
    operationId: command.operationId,
    packVersionId: pack.versionId,
    existingBinding:
      snapshot.bindings.find((b) => b.packId === pack.id) ?? null,
    entry,
  });
  await createPackStore(user.id, campaignId, command.timeline).bind(
    command,
    binding,
  );
  return readCampaignPacks(campaignId);
}
