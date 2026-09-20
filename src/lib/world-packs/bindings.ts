import type {
  CampaignPackBinding,
  FoundationCommand,
  FoundationRpc,
  FoundationSnapshot,
} from "../production/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { sameTimeline, validTimeline } from "../memory/timeline.ts";
import type { LibraryStore } from "../world-library/store.ts";
import type { TypedRecord } from "../world-library/types.ts";
import { canonical } from "../world-library/store.ts";
import { parseEntry, parseLibraryRecord } from "../world-library/parsers.ts";
import {
  ensure,
  FoundationValidationError,
  ids,
  integer,
  list,
  literal,
  nullable,
  object,
  priority,
  sameSet,
  unique,
  uuid,
} from "../world-library/validation.ts";
import { parseRulesetRef } from "../rulesets/profiles.ts";

export function parseBinding(value: unknown): CampaignPackBinding {
  const v = object(value, [
    "schemaVersion",
    "id",
    "campaignId",
    "ownerId",
    "packId",
    "packVersionId",
    "scenarioVersionId",
    "sourceVersionIds",
    "sourcePriority",
    "entry",
    "mappings",
  ]);
  const sourceVersionIds = ids(v.sourceVersionIds),
    ownerId = uuid(v.ownerId);
  const mappings = unique(
    list(
      v.mappings,
      (entry) => {
        const m = object(entry, ["packEntityId", "entityId"]);
        return {
          packEntityId: uuid(m.packEntityId),
          entityId: uuid(m.entityId),
        };
      },
      500,
    ),
    (m) => m.packEntityId,
  );
  unique(mappings, (m) => m.entityId);
  ensure(
    mappings.every(
      (m) => !mappings.some((other) => other.packEntityId === m.entityId),
    ),
  );
  const entry = parseEntry(v.entry);
  ensure(
    entry.evidence.every(
      (e) =>
        e.ownerId === ownerId && sourceVersionIds.includes(e.sourceVersionId),
    ),
    "scope",
  );
  return {
    schemaVersion: literal(v.schemaVersion, [1]),
    id: uuid(v.id),
    campaignId: uuid(v.campaignId),
    ownerId,
    packId: uuid(v.packId),
    packVersionId: uuid(v.packVersionId),
    scenarioVersionId: nullable(v.scenarioVersionId, uuid),
    sourceVersionIds,
    sourcePriority: priority(sourceVersionIds, v.sourcePriority),
    entry,
    mappings,
  };
}
export function buildCampaignBinding(input: {
  id: string;
  campaignId: string;
  ownerId: string;
  pack: TypedRecord<"pack">;
  scenario?: TypedRecord<"scenario">;
  ingredientPacks?: TypedRecord<"pack">[];
  entry: CampaignPackBinding["entry"];
  sourcePriority: string[];
  allocateEntityId: () => string;
}): CampaignPackBinding {
  const pack = parseLibraryRecord(input.pack, input.ownerId);
  ensure(pack.kind === "pack" && pack.body.status === "approved", "conflict");
  const scenario = input.scenario
    ? parseLibraryRecord(input.scenario, input.ownerId)
    : null;
  const packs = [
    pack,
    ...(input.ingredientPacks ?? []).map((p) => {
      const parsed = parseLibraryRecord(p, input.ownerId);
      ensure(
        parsed.kind === "pack" && parsed.body.status === "approved",
        "conflict",
      );
      return parsed;
    }),
  ];
  unique(packs, (p) => p.versionId);
  if (scenario) {
    ensure(
      scenario.kind === "scenario" && scenario.body.status === "approved",
      "conflict",
    );
    ensure(
      sameSet(
        scenario.body.packVersionIds,
        packs.map((p) => p.versionId),
      ),
      "scope",
    );
    ensure(
      canonical(scenario.body.entry) === canonical(parseEntry(input.entry)) &&
        canonical(input.sourcePriority) ===
          canonical(scenario.body.sourcePriority),
      "conflict",
    );
  } else ensure(packs.length === 1);
  const sourceVersionIds = [
    ...new Set(packs.flatMap((p) => p.body.sourceVersionIds)),
  ];
  if (scenario)
    ensure(
      scenario.kind === "scenario" &&
        sameSet(sourceVersionIds, scenario.body.sourceVersionIds),
      "scope",
    );
  const entityIds = unique(
    packs.flatMap((p) => p.body.entities.map((e) => e.id)),
  );
  return parseBinding({
    schemaVersion: 1,
    id: input.id,
    campaignId: input.campaignId,
    ownerId: input.ownerId,
    packId: pack.id,
    packVersionId: pack.versionId,
    scenarioVersionId: scenario?.versionId ?? null,
    sourceVersionIds,
    sourcePriority: input.sourcePriority,
    entry: input.entry,
    mappings: entityIds.map((packEntityId) => ({
      packEntityId,
      entityId: input.allocateEntityId(),
    })),
  });
}
export function instantiatePackEntities(
  binding: CampaignPackBinding,
  packs: TypedRecord<"pack">[],
) {
  const b = parseBinding(binding);
  const parsed = packs.map((p) => {
    const r = parseLibraryRecord(p, b.ownerId);
    ensure(r.kind === "pack" && r.body.status === "approved", "scope");
    return r;
  });
  ensure(
    parsed.some((p) => p.id === b.packId && p.versionId === b.packVersionId),
    "scope",
  );
  ensure(
    sameSet(
      [...new Set(parsed.flatMap((p) => p.body.sourceVersionIds))],
      b.sourceVersionIds,
    ),
    "scope",
  );
  const entities = parsed.flatMap((p) =>
    p.body.entities.map((e) => ({ pack: p, entity: e })),
  );
  ensure(
    sameSet(
      entities.map((e) => e.entity.id),
      b.mappings.map((m) => m.packEntityId),
    ),
    "scope",
  );
  return b.mappings.map((mapping) => {
    const found = entities.find((e) => e.entity.id === mapping.packEntityId)!;
    return {
      campaignId: b.campaignId,
      entityId: mapping.entityId,
      name: found.entity.name,
      kind: found.entity.kind,
      origin: {
        packVersionId: found.pack.versionId,
        packEntityId: mapping.packEntityId,
      },
      mechanics: null,
    };
  });
}
export function parseFoundationCommand(value: unknown): FoundationCommand {
  const v = object(value, [
    "operationId",
    "campaignId",
    "timeline",
    "expectedRevision",
    "expectedRuntimeRevision",
    "expectedHeadId",
  ]);
  ensure(validTimeline(v.timeline));
  return {
    operationId: uuid(v.operationId),
    campaignId: uuid(v.campaignId),
    timeline: { ...v.timeline },
    expectedRevision: integer(v.expectedRevision),
    expectedRuntimeRevision: integer(v.expectedRuntimeRevision),
    expectedHeadId: nullable(v.expectedHeadId, uuid),
  };
}
export function createRpcPackStore(
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
  library: LibraryStore,
  execute: FoundationRpc,
) {
  uuid(ownerId);
  uuid(campaignId);
  ensure(validTimeline(timeline));
  const fence = { ...timeline };
  async function bind(
    command: FoundationCommand,
    binding: CampaignPackBinding,
  ): Promise<FoundationSnapshot> {
    const cmd = parseFoundationCommand(command),
      b = parseBinding(binding);
    ensure(
      cmd.campaignId === campaignId &&
        b.campaignId === campaignId &&
        b.ownerId === ownerId &&
        sameTimeline(fence, cmd.timeline),
      "scope",
    );
    const pack = await library.get("pack", b.packVersionId);
    ensure(
      pack.ownerId === ownerId &&
        pack.id === b.packId &&
        pack.body.status === "approved",
      "scope",
    );
    let packs = [pack];
    if (b.scenarioVersionId) {
      const scenario = await library.get("scenario", b.scenarioVersionId);
      ensure(
        scenario.ownerId === ownerId &&
          scenario.body.status === "approved" &&
          scenario.body.packVersionIds.includes(b.packVersionId),
        "scope",
      );
      ensure(
        canonical(scenario.body.entry) === canonical(b.entry) &&
          canonical(scenario.body.sourcePriority) ===
            canonical(b.sourcePriority),
        "conflict",
      );
      packs = await Promise.all(
        scenario.body.packVersionIds.map((id) => library.get("pack", id)),
      );
    }
    instantiatePackEntities(b, packs);
    for (const e of b.entry.evidence) {
      const source = await library.get("source", e.sourceVersionId);
      ensure(
        source.id === e.sourceId &&
          source.ownerId === ownerId &&
          (e.visibility === "private" || source.body.visibility === "public"),
        "scope",
      );
    }
    let response: Awaited<ReturnType<FoundationRpc>>;
    try {
      response = await execute({
        p_owner_id: ownerId,
        p_campaign_id: campaignId,
        p_timeline: fence,
        p_action: "bind",
        p_payload: { command: cmd, binding: b },
      });
    } catch {
      throw new FoundationValidationError("unavailable");
    }
    if (response.error)
      throw new FoundationValidationError(
        response.error.message?.includes("conflict")
          ? "conflict"
          : "unavailable",
      );
    const result = object(response.data, [
      "schemaVersion",
      "ownerId",
      "campaignId",
      "timeline",
      "revision",
      "runtimeRevision",
      "headId",
      "worldMinutes",
      "world",
      "bindings",
      "ruleset",
      "executionPolicy",
    ]);
    ensure(
      result.schemaVersion === 1 &&
        result.ownerId === ownerId &&
        result.campaignId === campaignId &&
        validTimeline(result.timeline) &&
        sameTimeline(fence, result.timeline),
      "scope",
    );
    integer(result.revision);
    integer(result.runtimeRevision);
    integer(result.worldMinutes);
    nullable(result.headId, uuid);
    parseRulesetRef(result.ruleset);
    const bindings = list(result.bindings, parseBinding);
    ensure(
      bindings.every(
        (row) => row.ownerId === ownerId && row.campaignId === campaignId,
      ),
      "scope",
    );
    ensure(
      bindings.some((row) => canonical(row) === canonical(b)),
      "conflict",
    );
    // Private snapshot stays on the server. World/runtime domains are validated by their owning adapters.
    return { ...result, bindings } as FoundationSnapshot;
  }
  return { bind };
}
