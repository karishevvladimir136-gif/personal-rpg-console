import type {
  LoopContext,
  PreparationDraft,
  PreparationEntityEdit,
  PreparationOrigin,
  PreparationThreadEdit,
} from "../foundation-loop/contracts.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import type { WorldActor, WorldThread } from "../world/contracts.ts";
import type { PackClaim, PackEntity } from "../world-library/types.ts";
import type { PreparationPlan, PreparationSource } from "./contracts.ts";
import { stableGameplayId } from "../gameplay/dice.ts";
import { sameTimeline } from "../memory/timeline.ts";
import { parseBinding } from "../world-packs/bindings.ts";
import { parseLibraryRecord } from "../world-library/parsers.ts";
import { canonical } from "../world-library/store.ts";
import {
  ensure,
  integer,
  sameSet,
  unique,
  uuid,
} from "../world-library/validation.ts";
import { parseWorldState } from "../world/validation.ts";
import {
  parsePreparationDraft,
  parsePreparationEntityEdit,
  parsePreparationThreadEdit,
  PREPARATION_LIMITS,
} from "./draft.ts";

const EVENT_KIND = "owner_preparation";
type Candidate = {
  source: PackEntity;
  entityId: string;
  claims: PackClaim[];
  edit: PreparationEntityEdit;
};
type ThreadCandidate = {
  claim: PackClaim;
  edit: PreparationThreadEdit;
  locationIds: string[];
};

const same = (left: unknown, right: unknown) =>
  canonical(left) === canonical(right);
function mentions(text: string, label: string): boolean {
  if (!label.trim()) return false;
  let start = text.indexOf(label);
  while (start >= 0) {
    const before = start === 0 ? "" : text[start - 1];
    const after = text[start + label.length] ?? "";
    if (
      (!before || !/[\p{L}\p{N}]/u.test(before)) &&
      (!after || !/[\p{L}\p{N}]/u.test(after))
    )
      return true;
    start = text.indexOf(label, start + 1);
  }
  return false;
}
const sourceKind = (kind: PackEntity["kind"]): PreparationEntityEdit["kind"] =>
  kind === "person"
    ? "npc"
    : kind === "institution"
      ? "faction"
      : kind === "object"
        ? "npc"
        : kind;

function boundedDescription(claims: PackClaim[]): string {
  const result: string[] = [];
  for (const claim of claims) {
    if (
      claim.epistemic !== "fact" ||
      ["capability", "limitation", "goal", "objective", "intention"].includes(
        claim.predicate.toLowerCase(),
      )
    )
      continue;
    const remaining =
      PREPARATION_LIMITS.description -
      result.join("\n").length -
      (result.length ? 1 : 0);
    if (remaining <= 0) break;
    result.push(claim.text.slice(0, remaining));
  }
  return result.join("\n");
}

function neutralName(
  kind: PreparationEntityEdit["kind"],
  index: number,
  language: "en" | "ru",
) {
  const labels =
    language === "ru"
      ? {
          npc: "Известный персонаж",
          group: "Известная группа",
          faction: "Известная фракция",
          location: "Известное место",
        }
      : {
          npc: "Known person",
          group: "Known group",
          faction: "Known faction",
          location: "Known place",
        };
  return `${labels[kind]} ${index + 1}`;
}

/** Positive eligibility only, before limits. Entry time never slides to the source future. */
function selection(input: PreparationSource) {
  const binding = parseBinding(input.binding);
  const parsed = parseLibraryRecord(input.pack, binding.ownerId);
  uuid(input.characterEntityId);
  integer(input.worldMinutes, binding.entry.worldMinutes, 1_000_000_000);
  ensure(
    input.language === undefined ||
      input.language === "en" ||
      input.language === "ru",
  );
  ensure(
    parsed.kind === "pack" &&
      parsed.body.status === "approved" &&
      parsed.id === binding.packId &&
      parsed.versionId === binding.packVersionId,
    "scope",
  );
  const pack = parsed;
  ensure(Array.isArray(input.sources) && input.sources.length <= 200);
  const sources = unique(
    input.sources.map((value) => {
      const source = parseLibraryRecord(value, binding.ownerId);
      ensure(source.kind === "source", "scope");
      return source;
    }),
    (source) => source.versionId,
  );
  ensure(
    sameSet(
      pack.body.sourceVersionIds,
      sources.map((source) => source.versionId),
    ),
    "scope",
  );
  ensure(
    pack.body.sourceVersionIds.every((id) =>
      binding.sourceVersionIds.includes(id),
    ),
    "scope",
  );
  ensure(
    pack.body.entities.every((entity) =>
      binding.mappings.some((mapping) => mapping.packEntityId === entity.id),
    ),
    "scope",
  );
  const sourceIds = new Set([
    pack.id,
    pack.versionId,
    binding.id,
    ...pack.body.entities.map((entity) => entity.id),
    ...pack.body.claims.map((claim) => claim.id),
    ...sources.flatMap((source) => [source.id, source.versionId]),
  ]);
  ensure(
    binding.mappings.every((mapping) => !sourceIds.has(mapping.entityId)),
    "scope",
  );
  const perspective = binding.mappings.find(
    (mapping) => mapping.entityId === input.characterEntityId,
  )?.packEntityId;
  const disputed = new Set(
    pack.body.contradictions
      .filter((row) => row.status === "unresolved")
      .flatMap((row) => row.claimIds),
  );
  const claims = pack.body.claims
    .filter(
      (claim) =>
        claim.visibility === "public" &&
        claim.authority === "approved_canon" &&
        claim.origin !== "source_inference" &&
        ["fact", "intention"].includes(claim.epistemic) &&
        (claim.knowledge === "canon_at_entry" ||
          (claim.knowledge === "character" &&
            perspective !== undefined &&
            claim.knownByEntityIds.includes(perspective))) &&
        claim.validFrom !== null &&
        claim.validFrom <= binding.entry.worldMinutes &&
        (claim.validUntil === null ||
          claim.validUntil > binding.entry.worldMinutes) &&
        !disputed.has(claim.id) &&
        claim.evidence.length > 0 &&
        claim.evidence.every((evidence) => {
          const source = sources.find(
            (row) => row.versionId === evidence.sourceVersionId,
          );
          return (
            evidence.ownerId === binding.ownerId &&
            evidence.visibility === "public" &&
            evidence.knowledge === claim.knowledge &&
            source?.id === evidence.sourceId &&
            source.body.visibility === "public" &&
            source.body.knowledge !== "future_source"
          );
        }),
    )
    .sort((left, right) => {
      const rank = (claim: PackClaim) =>
        Math.min(
          ...claim.evidence.map((entry) =>
            binding.sourcePriority.indexOf(entry.sourceVersionId),
          ),
        );
      return rank(left) - rank(right) || left.id.localeCompare(right.id);
    });
  const candidates: Candidate[] = pack.body.entities
    .filter(
      (entity) =>
        entity.kind !== "object" &&
        claims.some((claim) => claim.subjectId === entity.id),
    )
    .slice(0, PREPARATION_LIMITS.entities)
    .map((entity, index) => {
      const known = claims.filter((claim) => claim.subjectId === entity.id);
      const knownText = known.map((claim) => claim.text).join("\n");
      const kind = sourceKind(entity.kind);
      const named =
        entity.name.length <= PREPARATION_LIMITS.name &&
        mentions(knownText, entity.name);
      const name = named
        ? entity.name
        : neutralName(kind, index, input.language ?? "en");
      const namedLines = (predicate: string, max: number, count: number) =>
        known
          .filter(
            (claim) =>
              claim.epistemic === "fact" &&
              claim.predicate.toLowerCase() === predicate &&
              claim.text.length <= max,
          )
          .map((claim) => claim.text.trim())
          .filter(
            (line, at, all) =>
              all.findIndex(
                (other) => other.toLowerCase() === line.toLowerCase(),
              ) === at,
          )
          .slice(0, count);
      return {
        source: entity,
        entityId: binding.mappings.find(
          (mapping) => mapping.packEntityId === entity.id,
        )!.entityId,
        claims: known,
        edit: {
          packEntityId: entity.id,
          selected: false,
          name,
          kind,
          aliases: entity.aliases
            .map((alias) => alias.trim())
            .filter(
              (alias, at, all) =>
                alias.length <= PREPARATION_LIMITS.alias &&
                mentions(knownText, alias) &&
                all.findIndex(
                  (other) => other.toLowerCase() === alias.toLowerCase(),
                ) === at,
            )
            .slice(0, PREPARATION_LIMITS.aliases),
          description: boundedDescription(known),
          capabilities: namedLines(
            "capability",
            PREPARATION_LIMITS.capability,
            PREPARATION_LIMITS.capabilities,
          ),
          limitations: namedLines(
            "limitation",
            PREPARATION_LIMITS.limitation,
            PREPARATION_LIMITS.limitations,
          ),
          merchant: false,
          merchantLabel: name,
        },
      };
    });
  const threads: ThreadCandidate[] = claims
    .filter(
      (claim) =>
        (claim.epistemic === "intention" ||
          ["goal", "objective", "intention", "hook"].includes(
            claim.predicate.toLowerCase(),
          ) ||
          claim.structure?.kind === "premise") &&
        candidates.some((entity) => entity.source.id === claim.subjectId),
    )
    .slice(0, PREPARATION_LIMITS.threads)
    .map((claim) => {
      const subject = candidates.find(
        (entity) => entity.source.id === claim.subjectId,
      )!;
      const related = claims
        .filter(
          (row) =>
            row.subjectId === claim.subjectId &&
            row.structure?.kind === "geography",
        )
        .flatMap((row) =>
          row.structure?.kind === "geography" ? [row.structure.objectId] : [],
        );
      const places = candidates.filter(
        (entity) =>
          entity.edit.kind === "location" &&
          (entity.source.id === claim.subjectId ||
            related.includes(entity.source.id)),
      );
      return {
        claim,
        locationIds: places.map((entity) => entity.entityId),
        edit: {
          id: stableGameplayId(binding.id, `preparation:thread:${claim.id}`),
          selected: false,
          title: claim.text.slice(0, PREPARATION_LIMITS.title),
          goal: claim.text.slice(0, PREPARATION_LIMITS.goal),
          entityIds: [
            ...new Set([
              subject.entityId,
              ...places.map((place) => place.entityId),
            ]),
          ],
          policy: "surface_before_complete",
        },
      };
    });
  return { binding, pack, candidates, threads };
}

function checkContext(context: LoopContext, source: PreparationSource) {
  const binding = parseBinding(source.binding);
  ensure(
    context.foundation.ownerId === binding.ownerId &&
      context.foundation.campaignId === binding.campaignId &&
      context.snapshot.campaign.id === binding.campaignId &&
      context.world.campaignId === binding.campaignId,
    "scope",
  );
  ensure(
    context.foundation.bindings.some((row) => same(row, binding)),
    "conflict",
  );
  ensure(
    context.foundation.worldMinutes === source.worldMinutes &&
      same(context.foundation.ruleset, context.state.profile),
    "conflict",
  );
  if (context.snapshot.timeline)
    ensure(
      sameTimeline(context.snapshot.timeline, context.foundation.timeline),
      "conflict",
    );
  const character = context.snapshot.entities.find(
    (entity) => entity.id === source.characterEntityId,
  );
  ensure(
    character?.campaign_id === binding.campaignId &&
      (character.kind === "player" ||
        context.world.actors.some(
          (actor) => actor.id === character.id && actor.control === "player",
        )),
    "scope",
  );
  for (const family of [
    context.snapshot.entities,
    context.snapshot.locations,
    context.snapshot.storages,
    context.snapshot.items,
    context.snapshot.quests,
    context.snapshot.sessions,
    context.snapshot.scenes,
    context.snapshot.assets,
    context.snapshot.documents,
  ]) {
    ensure(new Set(family.map((row) => row.id)).size === family.length);
    ensure(
      family.every((row) => row.campaign_id === binding.campaignId),
      "scope",
    );
  }
  unique(context.state.preparations, (origin) => origin.actorId);
  unique(
    context.state.preparations,
    (origin) => `${origin.bindingId}:${origin.packEntityId}`,
  );
  parseWorldState(context.world, binding.campaignId);
}

/** Only snapshots authored by this bounded command are replayed into the owner editor.
 * Current private Actor capabilities / Thread privateText are deliberately not projected. */
function recordedEdits(
  context: LoopContext | undefined,
  source: PreparationSource,
) {
  const entities = new Map<string, PreparationEntityEdit>();
  const threads = new Map<string, PreparationThreadEdit>();
  for (const event of [...(context?.events ?? [])].sort(
    (left, right) => left.sequence - right.sequence,
  )) {
    if (
      event.campaignId !== source.binding.campaignId ||
      event.kind !== EVENT_KIND
    )
      continue;
    const payload = event.payload;
    if (
      payload.schemaVersion !== 1 ||
      payload.author !== "owner" ||
      payload.bindingId !== source.binding.id ||
      payload.packVersionId !== source.pack.versionId
    )
      continue;
    ensure(
      Array.isArray(payload.entities) && Array.isArray(payload.threads),
      "conflict",
    );
    for (const row of payload.entities) {
      const edit = parsePreparationEntityEdit(row);
      entities.set(edit.packEntityId, edit);
    }
    for (const row of payload.threads) {
      const edit = parsePreparationThreadEdit(row);
      threads.set(edit.id, edit);
    }
  }
  return { entities, threads };
}

function originFor(
  context: LoopContext | undefined,
  source: PreparationSource,
  candidate: Candidate,
): PreparationOrigin | undefined {
  const origin = context?.state.preparations.find(
    (row) =>
      row.bindingId === source.binding.id &&
      row.packEntityId === candidate.source.id,
  );
  if (origin)
    ensure(
      origin.packVersionId === source.pack.versionId &&
        origin.entityId === candidate.entityId &&
        origin.actorId === candidate.entityId,
      "conflict",
    );
  return origin;
}

export function buildPreparationDraft(
  source: PreparationSource,
  context?: LoopContext,
): PreparationDraft {
  if (context) checkContext(context, source);
  const { binding, candidates, threads } = selection(source);
  const recorded = recordedEdits(context, source);
  return parsePreparationDraft({
    schemaVersion: 1,
    bindingId: binding.id,
    packVersionId: binding.packVersionId,
    entities: candidates.map((candidate) => {
      const origin = originFor(context, source, candidate);
      if (!origin) return candidate.edit;
      const actor = context!.world.actors.find(
        (row) => row.id === origin.actorId,
      );
      ensure(actor && actor.publicName !== null, "conflict");
      const previous = recorded.entities.get(candidate.source.id);
      const merchant = context!.state.merchants.find(
        (row) => row.actorId === actor.id,
      );
      // Entity/location descriptions are public. Origin text is explicitly owner authored.
      const row =
        actor.kind === "entity"
          ? context!.snapshot.entities.find((entity) => entity.id === actor.id)
          : actor.kind === "location"
            ? context!.snapshot.locations.find(
                (location) => location.id === actor.id,
              )
            : undefined;
      return {
        ...candidate.edit,
        selected: true,
        name: row?.name ?? actor.publicName,
        kind: actor.kind === "entity" ? "npc" : actor.kind,
        aliases: [...origin.aliases],
        description:
          row && "details" in row
            ? row.details
            : row && "description" in row
              ? row.description
              : origin.ownerDescription,
        capabilities: [
          ...(previous?.capabilities ?? candidate.edit.capabilities),
        ],
        limitations: [...origin.limitations],
        merchant: merchant?.available ?? false,
        merchantLabel:
          merchant?.label ??
          previous?.merchantLabel ??
          candidate.edit.merchantLabel,
      };
    }),
    threads: threads.map((candidate) => {
      const previous = recorded.threads.get(candidate.edit.id);
      if (!previous) return candidate.edit;
      const thread = context?.world.threads.find(
        (row) => row.id === candidate.edit.id,
      );
      ensure(thread, "conflict");
      return {
        ...previous,
        selected: true,
        title: thread.publicTitle ?? previous.title,
      };
    }),
  });
}

export function validatePreparationDraft(
  value: unknown,
  source: PreparationSource,
  context?: LoopContext,
): PreparationDraft {
  const draft = parsePreparationDraft(value);
  const expected = buildPreparationDraft(source, context);
  ensure(
    draft.bindingId === expected.bindingId &&
      draft.packVersionId === expected.packVersionId,
    "scope",
  );
  ensure(
    draft.entities.every((row) =>
      expected.entities.some(
        (entity) => entity.packEntityId === row.packEntityId,
      ),
    ),
    "scope",
  );
  ensure(
    draft.threads.every((row) =>
      expected.threads.some(
        (thread) =>
          thread.id === row.id && sameSet(thread.entityIds, row.entityIds),
      ),
    ),
    "scope",
  );
  const { candidates } = selection(source);
  for (const thread of draft.threads.filter((row) => row.selected)) {
    ensure(
      thread.entityIds.every((id) => {
        const candidate = candidates.find((row) => row.entityId === id);
        return (
          candidate &&
          (draft.entities.some(
            (row) => row.packEntityId === candidate.source.id && row.selected,
          ) ||
            Boolean(originFor(context, source, candidate)))
        );
      }),
      "conflict",
    );
  }
  return draft;
}

/** Pure changes only. The existing server command must commit the entire plan atomically. */
export function planPreparation(
  context: LoopContext,
  source: PreparationSource,
  value: unknown,
): PreparationPlan {
  checkContext(context, source);
  const draft = validatePreparationDraft(value, source, context);
  const { binding, candidates, threads } = selection(source);
  const previousDraft = buildPreparationDraft(source, context);
  const previousEdits = recordedEdits(context, source);
  const state = structuredClone(context.state);
  const world = parseWorldState(context.world, binding.campaignId);
  const changes: RecordChange[] = [];
  const storageCreates: PreparationPlan["storageCreates"] = [];
  const changedEntities: PreparationEntityEdit[] = [];
  const changedThreads: PreparationThreadEdit[] = [];
  const snapshotFamilies = {
    entities: context.snapshot.entities,
    locations: context.snapshot.locations,
    storages: context.snapshot.storages,
    items: context.snapshot.items,
    quests: context.snapshot.quests,
    sessions: context.snapshot.sessions,
    scenes: context.snapshot.scenes,
    assets: context.snapshot.assets,
    documents: context.snapshot.documents,
  };
  const worldOtherIds = new Set([
    ...world.threads.map((row) => row.id),
    ...world.hooks.map((row) => row.id),
    ...world.threads.flatMap((row) => row.steps.map((step) => step.id)),
  ]);
  function freeOrdinaryId(
    id: string,
    allowed?: "entities" | "locations" | "storages",
  ) {
    ensure(!worldOtherIds.has(id), "conflict");
    for (const [family, rows] of Object.entries(snapshotFamilies))
      ensure(
        family === allowed || !rows.some((row) => row.id === id),
        "conflict",
      );
  }
  function write(
    family: "entities" | "locations",
    id: string,
    values: RecordChange["values"],
  ) {
    const row = snapshotFamilies[family].find((record) => record.id === id);
    if (
      row &&
      Object.entries(values).every(([key, value]) =>
        same((row as unknown as Record<string, unknown>)[key], value),
      )
    )
      return;
    changes.push({
      family,
      id,
      expectedRevision: row?.revision ?? null,
      values,
    });
  }

  for (const edit of draft.entities.filter((row) => row.selected)) {
    const candidate = candidates.find(
      (row) => row.source.id === edit.packEntityId,
    )!;
    const origin = originFor(context, source, candidate);
    const existingActor = world.actors.find(
      (actor) => actor.id === candidate.entityId,
    );
    const kind: WorldActor["kind"] = edit.kind === "npc" ? "entity" : edit.kind;
    const ordinaryFamily =
      edit.kind === "npc"
        ? "entities"
        : edit.kind === "location"
          ? "locations"
          : undefined;
    freeOrdinaryId(candidate.entityId, origin ? ordinaryFamily : undefined);
    ensure(
      !state.preparations.some(
        (row) =>
          row.actorId === candidate.entityId &&
          (row.bindingId !== binding.id ||
            row.packEntityId !== edit.packEntityId),
      ),
      "conflict",
    );
    ensure(
      origin ? existingActor !== undefined : existingActor === undefined,
      "conflict",
    );
    if (existingActor) {
      // Changing between a person and a place would require deleting live inventory or identity.
      ensure(
        (existingActor.kind === "entity") === (kind === "entity") &&
          (existingActor.kind === "location") === (kind === "location"),
        "conflict",
      );
      if (ordinaryFamily)
        ensure(
          snapshotFamilies[ordinaryFamily].some(
            (row) => row.id === candidate.entityId,
          ),
          "conflict",
        );
    }
    if (edit.kind === "npc")
      write(
        "entities",
        candidate.entityId,
        existingActor
          ? { name: edit.name, details: edit.description }
          : {
              kind: "npc",
              name: edit.name,
              details: edit.description,
              hp: null,
              max_hp: null,
              stats: {},
              resources: {},
              conditions: [],
              equipment_slots: [],
            },
      );
    if (edit.kind === "location")
      write(
        "locations",
        candidate.entityId,
        existingActor
          ? { name: edit.name, description: edit.description }
          : { name: edit.name, description: edit.description, status: "known" },
      );
    const oldEdit = previousDraft.entities.find(
      (row) => row.packEntityId === edit.packEntityId,
    )!;
    const capabilitiesChanged = !same(oldEdit.capabilities, edit.capabilities);
    const nextActor: WorldActor = existingActor
      ? {
          ...existingActor,
          kind,
          publicName: edit.name,
          capabilities: capabilitiesChanged
            ? [...edit.capabilities]
            : existingActor.capabilities,
        }
      : {
          id: candidate.entityId,
          campaignId: binding.campaignId,
          revision: 1,
          kind,
          entityId: kind === "entity" ? candidate.entityId : null,
          control: "autonomous",
          publicName: edit.name,
          locationId: kind === "location" ? candidate.entityId : null,
          capabilities: [...edit.capabilities],
          // Source Canon/public setup is not an automatic grant of any Actor's knowledge.
          knowledge: [],
        };
    if (existingActor && !same(existingActor, nextActor)) {
      nextActor.revision = existingActor.revision + 1;
      world.actors[world.actors.indexOf(existingActor)] = nextActor;
    } else if (!existingActor) world.actors.push(nextActor);
    const nextOrigin: PreparationOrigin = {
      bindingId: binding.id,
      packVersionId: binding.packVersionId,
      packEntityId: edit.packEntityId,
      entityId: candidate.entityId,
      actorId: candidate.entityId,
      sourceVersionIds: origin?.sourceVersionIds ?? [
        ...new Set(
          candidate.claims.flatMap((claim) =>
            claim.evidence.map((entry) => entry.sourceVersionId),
          ),
        ),
      ],
      aliases: [...edit.aliases],
      limitations: [...edit.limitations],
      ownerDescription: edit.description,
    };
    const priorOrigin = state.preparations.findIndex(
      (row) => row.actorId === candidate.entityId,
    );
    if (priorOrigin >= 0) state.preparations[priorOrigin] = nextOrigin;
    else state.preparations.push(nextOrigin);
    const merchant = state.merchants.find(
      (row) => row.actorId === candidate.entityId,
    );
    ensure(origin || !merchant, "conflict");
    if (merchant) ensure(edit.merchantLabel.length > 0, "validation");
    if (edit.merchant) {
      ensure(edit.kind === "npc", "validation");
      if (merchant) {
        ensure(merchant.entityId === candidate.entityId, "conflict");
        const storage = context.snapshot.storages.find(
          (row) => row.id === merchant.storageId,
        );
        ensure(
          storage?.entity_id === candidate.entityId &&
            String(storage.kind) === "merchant",
          "conflict",
        );
        if (merchant.label !== edit.merchantLabel || !merchant.available) {
          merchant.label = edit.merchantLabel;
          merchant.available = true;
          merchant.version += 1;
        }
      } else {
        const existingStorage = context.snapshot.storages.filter(
          (row) =>
            row.entity_id === candidate.entityId &&
            String(row.kind) === "merchant",
        );
        ensure(existingStorage.length <= 1, "conflict");
        const storageId =
          existingStorage[0]?.id ??
          stableGameplayId(
            binding.id,
            `preparation:storage:${candidate.entityId}`,
          );
        freeOrdinaryId(
          storageId,
          existingStorage.length ? "storages" : undefined,
        );
        ensure(
          !world.actors.some((row) => row.id === storageId) &&
            !binding.mappings.some((row) => row.entityId === storageId),
          "conflict",
        );
        if (!existingStorage.length)
          storageCreates.push({
            id: storageId,
            expectedRevision: null,
            values: {
              name: edit.merchantLabel,
              kind: "merchant",
              entity_id: candidate.entityId,
            },
          });
        state.merchants.push({
          actorId: candidate.entityId,
          entityId: candidate.entityId,
          version: 1,
          label: edit.merchantLabel,
          storageId,
          currencyIds: state.currencies.map((currency) => currency.id),
          available: true,
          acceptsStolen: false,
          usesFunds: true,
          capacity: null,
          buyBasisPoints: 10000,
          sellBasisPoints: 10000,
          haggleLimitBasisPoints: 0,
        });
      }
    } else if (
      merchant &&
      (merchant.available || merchant.label !== edit.merchantLabel)
    ) {
      merchant.available = false;
      merchant.label = edit.merchantLabel;
      merchant.version += 1;
    }
    if (!origin || !same({ ...oldEdit, selected: true }, edit))
      changedEntities.push(edit);
  }

  for (const edit of draft.threads.filter((row) => row.selected)) {
    const candidate = threads.find((row) => row.edit.id === edit.id)!;
    const previous = previousEdits.threads.get(edit.id);
    const existing = world.threads.find((row) => row.id === edit.id);
    ensure(
      existing ? previous !== undefined : previous === undefined,
      "conflict",
    );
    for (const id of edit.entityIds)
      ensure(
        world.actors.some((actor) => actor.id === id),
        "conflict",
      );
    if (existing) {
      ensure(
        sameSet(existing.actorIds, edit.entityIds) &&
          existing.steps.length === 1,
        "conflict",
      );
      const next = structuredClone(existing);
      if (edit.title !== previous!.title) {
        next.title = edit.title;
        next.publicTitle = edit.title;
      }
      if (edit.goal !== previous!.goal) next.steps[0].privateText = edit.goal;
      if (edit.policy !== previous!.policy)
        next.steps[0].consequence = edit.policy;
      if (!same(next, existing)) {
        next.revision += 1;
        world.threads[world.threads.indexOf(existing)] = next;
      }
    } else {
      freeOrdinaryId(edit.id);
      ensure(!world.actors.some((row) => row.id === edit.id), "conflict");
      const stepId = stableGameplayId(
        binding.id,
        `preparation:step:${candidate.claim.id}`,
      );
      freeOrdinaryId(stepId);
      const thread: WorldThread = {
        id: edit.id,
        campaignId: binding.campaignId,
        revision: 1,
        title: edit.title,
        publicTitle: edit.title,
        actorIds: [...edit.entityIds],
        decisionActorIds: edit.entityIds.filter(
          (id) =>
            world.actors.find((actor) => actor.id === id)?.control ===
            "autonomous",
        ),
        locationIds: candidate.locationIds.filter((id) =>
          world.actors.some(
            (actor) => actor.id === id && actor.kind === "location",
          ),
        ),
        prerequisiteThreadIds: [],
        status: "active",
        cursor: 0,
        steps: [
          {
            id: stepId,
            trigger: {
              kind: "autonomy",
              atWorldMinutes: integer(
                source.worldMinutes + 1,
                0,
                1_000_000_000,
              ),
              scope: "related",
            },
            resolution: "resolver_required",
            consequence: edit.policy,
            privateText: edit.goal,
            evidence: structuredClone(candidate.claim.evidence),
            publicOutcome: null,
            warning: null,
            hookChanges: [],
          },
        ],
      };
      world.threads.push(thread);
    }
    for (const locationId of candidate.locationIds) {
      if (
        !world.actors.some(
          (actor) => actor.id === locationId && actor.kind === "location",
        )
      )
        continue;
      const hookId = stableGameplayId(
        binding.id,
        `preparation:hook:${candidate.claim.id}:${locationId}`,
      );
      const hook = world.hooks.find((row) => row.id === hookId);
      if (hook) {
        ensure(
          hook.threadId === edit.id &&
            hook.locationId === locationId &&
            previous,
          "conflict",
        );
        if (edit.goal !== previous.goal) hook.privatePremise = edit.goal;
        if (hook.discovery) {
          if (edit.title !== previous.title) hook.discovery.label = edit.title;
          if (edit.goal !== previous.goal) hook.discovery.text = edit.goal;
        }
      } else {
        ensure(!existing, "conflict");
        freeOrdinaryId(hookId);
        world.hooks.push({
          id: hookId,
          campaignId: binding.campaignId,
          locationId,
          threadId: edit.id,
          privatePremise: edit.goal,
          status: "discovered",
          discovery: {
            label: edit.title,
            text: edit.goal,
            kind: "clue",
            eventId: null,
            evidence:
              candidate.claim.knowledge === "character"
                ? structuredClone(candidate.claim.evidence)
                : [],
          },
        });
      }
    }
    if (!previous || !same({ ...previous, selected: true }, edit))
      changedThreads.push(edit);
  }
  parseWorldState(world, binding.campaignId);
  const changed =
    changes.length > 0 ||
    storageCreates.length > 0 ||
    !same(state, context.state) ||
    !same(world, context.world);
  if (!changed)
    return { state, world, changes: [], storageCreates: [], events: [] };
  state.version = integer(state.version + 1);
  const provenance = changedEntities.map((edit) => {
    const candidate = candidates.find(
      (row) => row.source.id === edit.packEntityId,
    )!;
    return {
      packEntityId: edit.packEntityId,
      entityId: candidate.entityId,
      claims: candidate.claims.map((claim) => ({
        id: claim.id,
        knowledge: claim.knowledge,
        origin: claim.origin,
        epistemic: claim.epistemic,
        evidence: structuredClone(claim.evidence),
      })),
    };
  });
  return {
    state,
    world,
    changes,
    storageCreates,
    events: [
      {
        kind: EVENT_KIND,
        visibility: "private",
        text: "Owner prepared selected world records.",
        actorIds: changedEntities.map(
          (edit) =>
            candidates.find((row) => row.source.id === edit.packEntityId)!
              .entityId,
        ),
        threadIds: changedThreads.map((edit) => edit.id),
        payload: {
          schemaVersion: 1,
          author: "owner",
          bindingId: binding.id,
          packVersionId: binding.packVersionId,
          entryWorldMinutes: binding.entry.worldMinutes,
          entities: changedEntities,
          threads: changedThreads,
          provenance,
          threadProvenance: changedThreads.map((edit) => {
            const claim = threads.find((row) => row.edit.id === edit.id)!.claim;
            return {
              threadId: edit.id,
              claimId: claim.id,
              knowledge: claim.knowledge,
              origin: claim.origin,
              evidence: structuredClone(claim.evidence),
            };
          }),
        },
      },
    ],
  };
}
