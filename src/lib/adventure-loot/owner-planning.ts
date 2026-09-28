import type { LoopContext, LoopPlan } from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import type { OwnerLootView, OwnerObjectInput } from "./owner-contracts.ts";
import { projectLootObjects } from "./public.ts";
import { readLootObject, type LootObjectVersion } from "./state.ts";
import { planLootObjectCorrection } from "./planning.ts";
import {
  buildCreateOwnerObjectInput,
  buildEditOwnerObjectInput,
} from "./owner-form.ts";
import { requireLoot } from "./validation.ts";
import { fields } from "../progression/validation.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import { loopCommand } from "../foundation-loop/authority.ts";

export function ownerLootView(context: LoopContext): OwnerLootView {
  const player = context.world.actors.find(
    (a) =>
      a.control === "player" &&
      a.entityId ===
        context.snapshot.entities.find((e) => e.kind === "player")?.id,
  );
  const publicObjects = player
    ? projectLootObjects(context, player.id).filter((o) => {
        const owner = readLootObject(context, o.id)?.object.ownerEntityId;
        return context.world.actors.some(
          (a) =>
            a.entityId === owner &&
            a.publicName !== null &&
            a.locationId === context.snapshot.publicState.current_location_id,
        );
      })
    : [];
  const current = context.snapshot.publicState.current_location_id;
  const entities = context.world.actors
    .filter(
      (a) => a.entityId && a.publicName !== null && a.locationId === current,
    )
    .map((a) => ({ id: a.entityId!, label: a.publicName! }));
  const existing = new Set(
    context.events
      .filter(
        (e) =>
          e.campaignId === context.foundation.campaignId &&
          e.visibility === "private" &&
          [
            "loot.object.configured",
            "loot.object.changed",
            "loot.object.corrected",
          ].includes(e.kind),
      )
      .map((e) => (e.payload.object as { storageId?: string })?.storageId)
      .filter(Boolean),
  );
  const storages = context.snapshot.storages
    .filter(
      (s) =>
        s.entity_id &&
        entities.some((e) => e.id === s.entity_id) &&
        !existing.has(s.id) &&
        context.snapshot.items
          .filter((i) => i.storage_id === s.id)
          .every((i) =>
            context.state.itemPolicies.some(
              (p) => p.itemId === i.id && p.visibility === "public",
            ),
          ),
    )
    .map((s) => ({ id: s.id, label: s.name, entityId: s.entity_id }));
  const command = loopCommand(context, context.foundation.campaignId);
  const { operationId, ...fence } = command;
  void operationId;
  return {
    command: fence,
    objects: publicObjects.map((o) => {
      const v = readLootObject(context, o.id)!;
      const { knownBy, contentsKnownBy, materializationId, ...object } =
        v.object;
      void knownBy;
      void contentsKnownBy;
      void materializationId;
      return {
        id: object.id,
        revision: object.revision,
        storageId: object.storageId,
        locationId: object.locationId,
        ownerEntityId: object.ownerEntityId,
        label: object.label,
        access: object.access,
        lockClass: object.lockClass,
        structureClass: object.structureClass,
        environmentTags: object.environmentTags,
        portable: object.portable,
        contentsEstablished: object.contentsEstablished,
      };
    }),
    choices: {
      storages,
      entities,
      locations: context.snapshot.locations
        .filter((l) => l.id === current && l.status === "visited")
        .map((l) => ({ id: l.id, label: l.name })),
      capabilities: [...(player?.capabilities ?? [])],
    },
  };
}
export function planOwnerLootConfiguration(
  context: LoopContext,
  command: FoundationCommand,
  raw: unknown,
  ownerId: string,
): LoopPlan {
  const view = ownerLootView(context);
  requireLoot(raw && typeof raw === "object");
  const action = (raw as OwnerObjectInput).action;
  let input: OwnerObjectInput;
  let version: LootObjectVersion;
  if (action === "edit") {
    const v = fields(raw, [
      "action",
      "objectId",
      "expectedObjectRevision",
      "label",
      "access",
      "portable",
    ]);
    const object = view.objects.find(
      (o) => o.id === v.objectId && o.revision === v.expectedObjectRevision,
    );
    requireLoot(object, "conflict");
    input = buildEditOwnerObjectInput(object, {
      label: v.label as string,
      access: v.access as OwnerObjectInput["access"],
      portable: v.portable as boolean | null,
    });
    const before = readLootObject(context, object.id)!;
    version = structuredClone(before);
    version.expectedObjectRevision = object.revision;
    version.object = {
      ...version.object,
      revision: object.revision + 1,
      label: input.label,
      access: input.access,
      portable: input.portable,
    };
    version.authority = "owner";
  } else {
    const v = fields(raw, [
      "action",
      "storageId",
      "locationId",
      "ownerEntityId",
      "label",
      "access",
      "portable",
      "capability",
      "lockDc",
      "forceDc",
    ]);
    requireLoot(action === "create");
    requireLoot(
      v.lockDc === null ||
        (Number.isInteger(v.lockDc) &&
          Number(v.lockDc) >= 1 &&
          Number(v.lockDc) <= 40),
    );
    requireLoot(
      v.forceDc === null ||
        (Number.isInteger(v.forceDc) &&
          Number(v.forceDc) >= 1 &&
          Number(v.forceDc) <= 40),
    );
    input = buildCreateOwnerObjectInput(
      {
        storageId: v.storageId as string,
        locationId: v.locationId as string,
        ownerEntityId: v.ownerEntityId as string,
        label: v.label as string,
        access: v.access as OwnerObjectInput["access"],
        portable: v.portable as boolean | null,
        capability: v.capability as string,
        lockDc: v.lockDc === null ? "" : String(v.lockDc),
        forceDc: v.forceDc === null ? "" : String(v.forceDc),
      },
      view.choices,
    );
    const oid = stableGameplayId(
        command.operationId,
        "owner:secured-object-v1",
      ),
      player = context.world.actors.find(
        (a) =>
          a.control === "player" &&
          a.entityId ===
            context.snapshot.entities.find((e) => e.kind === "player")?.id,
      );
    requireLoot(player);
    const route = (id: string, dc: number, to: "open" | "broken") => ({
      id,
      capability: input.action === "create" ? input.capability : "",
      from: ["closed", "locked", "sealed", "jammed"] as (
        "closed" | "locked" | "sealed" | "jammed"
      )[],
      lockClass: id === "lock" ? "owner-lock" : null,
      structureClass: id === "force" ? "owner-structure" : null,
      environmentTags: [],
      requiresPortable: false,
      requiredItemIds: [],
      resourceCost: null,
      check: { index: 0, stat: "skill" as const, dc },
      to,
      noise: to === "broken",
      fragileLoss: 0,
    });
    version = {
      schemaVersion: 1,
      expectedObjectRevision: null,
      authority: "owner",
      object: {
        schemaVersion: 1,
        campaignId: context.foundation.campaignId,
        id: oid,
        revision: 1,
        storageId: input.storageId,
        locationId: input.locationId,
        ownerEntityId: input.ownerEntityId,
        label: input.label,
        access: input.access,
        portable: input.portable,
        lockClass: input.lockDc === null ? null : "owner-lock",
        structureClass: input.forceDc === null ? null : "owner-structure",
        environmentTags: [],
        contentsEstablished: true,
        materializationId: stableGameplayId(oid, "loot:materialization-v1"),
        knownBy: [player.id],
        contentsKnownBy: [],
      },
      policy: {
        schemaVersion: 1,
        campaignId: context.foundation.campaignId,
        objectId: oid,
        id: "owner-object-v1",
        version: 1,
        profile: structuredClone(context.state.profile),
        discoveryCheck: null,
        contents: [],
        approaches: [
          ...(input.lockDc === null
            ? []
            : [route("lock", input.lockDc, "open")]),
          ...(input.forceDc === null
            ? []
            : [route("force", input.forceDc, "broken")]),
        ],
      },
      privateItems: [],
    };
  }
  return planLootObjectCorrection(context, command, version, ownerId);
}
