import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPreparationDraft,
  validatePreparationDraft,
  planPreparation,
} from "../src/lib/playable-world/preparation.ts";
import { parsePreparationDraft } from "../src/lib/playable-world/draft.ts";
import { projectPublicWorld } from "../src/lib/world/public.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";
import { buildCampaignBinding } from "../src/lib/world-packs/bindings.ts";
import { fixture, apply, id } from "./wave4-preparation-fixtures.mjs";

function selected(f, merchant = false) {
  const draft = buildPreparationDraft(f.source, f.context);
  draft.entities.forEach((entity) => {
    entity.selected = true;
    entity.merchant = merchant && entity.kind === "npc";
  });
  draft.threads.forEach((thread) => {
    thread.selected = true;
  });
  return draft;
}

test("ordinary unmapped PC reviews public entry Canon without an automatic knowledge grant or bulk creation", () => {
  const f = fixture();
  const before = structuredClone(f);
  const draft = buildPreparationDraft(f.source, f.context);
  assert.equal(draft.entities.length, 3);
  assert.equal(draft.threads.length, 1);
  assert(draft.entities.every((row) => !row.selected));
  assert(draft.threads.every((row) => !row.selected));
  assert(!JSON.stringify(draft).includes("PRIVATE_ALIAS_MARKER"));
  const empty = planPreparation(f.context, f.source, draft);
  assert.deepEqual(empty.changes, []);
  assert.deepEqual(empty.events, []);
  assert.deepEqual(empty.state, f.context.state);
  assert.deepEqual(f, before);
  draft.entities[0].selected = true;
  const plan = planPreparation(f.context, f.source, draft);
  assert.equal(plan.changes.length, 1);
  assert.equal(plan.world.actors.length, f.context.world.actors.length + 1);
  assert.deepEqual(plan.world.actors.at(-1).knowledge, []);
  assert.equal(plan.state.preparations.length, 1);
  assert.equal(plan.events[0].visibility, "private");
  assert.equal(plan.events[0].payload.author, "owner");
  assert.equal(
    plan.events[0].payload.provenance[0].claims[0].knowledge,
    "canon_at_entry",
  );
});

test("private, future, source-only, unknown-time, inferred, disputed and other-character facts cannot enter a draft", () => {
  const f = fixture();
  const safe = f.source.pack.body.claims[0];
  const extra = (name, patch) => ({
    ...structuredClone(safe),
    id: id(name),
    text: `${name}_MARKER`,
    ...patch,
  });
  f.source.pack.body.claims.push(
    extra("private", {
      visibility: "private",
      evidence: [{ ...safe.evidence[0], visibility: "private" }],
    }),
    extra("source", {
      knowledge: "source",
      evidence: [{ ...safe.evidence[0], knowledge: "source" }],
    }),
    extra("future", {
      knowledge: "future_source",
      evidence: [{ ...safe.evidence[0], knowledge: "future_source" }],
    }),
    extra("later", { validFrom: 10 }),
    extra("expired", { validFrom: 0, validUntil: 1 }),
    extra("unknown", { validFrom: null }),
    extra("inferred", { origin: "source_inference", uncertainty: "Maybe" }),
    extra("rumor", { epistemic: "rumor" }),
    extra("other-character", {
      knowledge: "character",
      knownByEntityIds: [f.ids.person],
      evidence: [{ ...safe.evidence[0], knowledge: "character" }],
    }),
    extra("disputed", {}),
  );
  const conflict = id("contradiction");
  f.source.pack.body.contradictions.push({
    id: conflict,
    claimIds: [id("disputed"), id("later")],
    status: "unresolved",
    resolution: null,
  });
  f.source.pack.body.approval.reviewedConflictIds.push(conflict);
  f.source.binding.entry.worldMinutes = 2;
  f.source.worldMinutes = 100;
  f.context.foundation.worldMinutes = 100;
  const draft = buildPreparationDraft(f.source, f.context);
  assert(!JSON.stringify(draft).includes("MARKER"));
  const plan = planPreparation(f.context, f.source, selected(f));
  assert(!JSON.stringify(plan).includes("MARKER"));
});

test("source ownership/access/version are verified even if claim labels assert public", () => {
  for (const mutate of [
    (f) => {
      f.source.sources[0].body.visibility = "private";
    },
    (f) => {
      f.source.sources[0].body.knowledge = "future_source";
    },
  ]) {
    const f = fixture();
    mutate(f);
    assert.deepEqual(buildPreparationDraft(f.source, f.context).entities, []);
  }
  for (const mutate of [
    (f) => {
      f.source.sources[0].ownerId = id("foreign-owner");
    },
    (f) => {
      f.source.sources[0].versionId = id("foreign-source-version");
    },
    (f) => {
      f.source.pack.versionId = id("unpinned-version");
    },
    (f) => {
      f.source.pack.body.status = "draft";
      f.source.pack.body.approval = null;
    },
    (f) => {
      f.source.sources = [];
    },
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => buildPreparationDraft(f.source, f.context));
  }
  const f = fixture();
  f.source.pack.body.claims[0].evidence[0].sourceId = id("other-source");
  assert(
    !buildPreparationDraft(
      f.source,
      f.context,
    ).entities[0].description.includes("porter"),
  );
});

test("a mapped player receives only explicitly character-known claims; source names/aliases need a safe mention", () => {
  const f = fixture();
  const playerId = f.source.characterEntityId;
  f.source.binding.mappings[0].entityId = playerId;
  const claim = f.source.pack.body.claims[0];
  claim.knowledge = "character";
  claim.knownByEntityIds = [f.ids.person];
  claim.evidence[0].knowledge = "character";
  f.source.pack.body.entities[0].name = "SECRET_REAL_NAME_MARKER";
  const draft = buildPreparationDraft(f.source, f.context);
  assert(draft.entities[0].description.includes("Mara is a porter."));
  assert.equal(draft.entities[0].name, "Known person 1");
  assert(!JSON.stringify(draft).includes("MARKER"));
  assert.throws(
    () => planPreparation(f.context, f.source, selected(f)),
    /conflict/,
  );
});

test("strict owner fields reject arbitrary patches, identity editing, duplicates, excess length and forged membership", () => {
  const f = fixture();
  const draft = selected(f);
  for (const mutate of [
    (d) => {
      d.privateState = {};
    },
    (d) => {
      d.entities[0].entityId = id("forged");
    },
    (d) => {
      d.entities[0].resources = { coins: 999 };
    },
    (d) => {
      d.entities[0].name = "x".repeat(161);
    },
    (d) => {
      d.entities[0].capabilities = Array(17).fill("extra");
    },
    (d) => {
      d.entities[0].aliases = ["Mara", " mara "];
    },
    (d) => {
      d.entities[1].merchant = true;
    },
    (d) => {
      d.entities.push(structuredClone(d.entities[0]));
    },
    (d) => {
      d.entities[0].selected = "yes";
    },
    (d) => {
      d.threads[0].policy = "hard_deadline";
    },
    (d) => {
      d.threads[0].goal = "\u0000";
    },
  ]) {
    const changed = structuredClone(draft);
    mutate(changed);
    assert.throws(() => parsePreparationDraft(changed));
  }
  for (const mutate of [
    (d) => {
      d.bindingId = id("foreign-binding");
    },
    (d) => {
      d.packVersionId = id("foreign-version");
    },
    (d) => {
      d.entities[0].packEntityId = id("foreign-entity");
    },
    (d) => {
      d.threads[0].id = id("foreign-thread");
    },
    (d) => {
      d.threads[0].entityIds = [id("foreign-instance")];
    },
    (d) => {
      d.entities[0].selected = false;
    },
  ]) {
    const changed = structuredClone(draft);
    mutate(changed);
    assert.throws(() => validatePreparationDraft(changed, f.source, f.context));
  }
});

test("selected Pack identities create ordinary people/locations, coarse Actors, a Thread and known location Hook", () => {
  const f = fixture();
  const before = structuredClone(f);
  const draft = selected(f);
  const plan = planPreparation(f.context, f.source, draft);
  assert.equal(
    plan.changes.filter((row) => row.family === "entities").length,
    1,
  );
  assert.equal(
    plan.changes.filter((row) => row.family === "locations").length,
    1,
  );
  assert.equal(
    plan.world.actors.length,
    before.context.world.actors.length + 3,
  );
  const actor = plan.world.actors.find(
    (row) => row.id === f.source.binding.mappings[0].entityId,
  );
  assert.equal(actor.entityId, actor.id);
  assert.equal(plan.world.actors.at(-1).kind, "faction");
  assert.equal(plan.world.actors.at(-1).entityId, null);
  const thread = plan.world.threads.at(-1);
  assert.equal(thread.steps[0].resolution, "resolver_required");
  assert.equal(thread.steps[0].publicOutcome, null);
  assert.equal(thread.steps[0].consequence, "surface_before_complete");
  assert.equal(plan.world.hooks.at(-1).status, "discovered");
  assert.deepEqual(plan.world.hooks.at(-1).discovery.evidence, []);
  const entity = plan.changes[0].values;
  assert.equal(entity.hp, null);
  assert.deepEqual(entity.resources, {});
  assert.deepEqual(entity.stats, {});
  parseWorldState(plan.world, f.source.binding.campaignId);
  assert.equal(
    projectPublicWorld(plan.world).hooks.at(-1).text,
    draft.threads[0].goal,
  );
  assert.deepEqual(f, before);
});

test("merchant preparation uses one ordinary storage, no fabricated stock or currency, stable identity and unchanged retry", () => {
  const f = fixture();
  const draft = selected(f, true);
  const first = planPreparation(f.context, f.source, draft);
  assert.equal(first.storageCreates.length, 1);
  assert.equal(first.storageCreates[0].values.kind, "merchant");
  assert.equal(
    first.storageCreates[0].values.entity_id,
    first.state.merchants[0].entityId,
  );
  assert.deepEqual(first.state.merchants[0].currencyIds, []);
  assert(!first.changes.some((row) => row.family === "items"));
  const next = apply(f.context, first);
  const repeated = planPreparation(
    next,
    f.source,
    buildPreparationDraft(f.source, next),
  );
  assert.deepEqual(repeated.changes, []);
  assert.deepEqual(repeated.storageCreates, []);
  assert.deepEqual(repeated.events, []);
  assert.equal(repeated.state.version, first.state.version);
  assert.deepEqual(repeated.world, first.world);
  assert.deepEqual(
    planPreparation(f.context, f.source, structuredClone(draft)),
    first,
  );
});

test("owner corrections preserve origin, stock, resources, advancement, moved actors and completed Threads", () => {
  const f = fixture();
  let context = apply(
    f.context,
    planPreparation(f.context, f.source, selected(f, true)),
  );
  const merchant = context.state.merchants[0];
  const actor = context.world.actors.find((row) => row.id === merchant.actorId);
  actor.locationId = id("moved-location");
  actor.capabilities.push("PRIVATE_CURRENT_CAPABILITY_MARKER");
  const entity = context.snapshot.entities.find(
    (row) => row.id === merchant.entityId,
  );
  entity.resources = { credit: 17 };
  context.state.progress.push({
    entityId: entity.id,
    trackId: "skill",
    value: 12,
    rank: 2,
    unlocks: ["craft"],
  });
  context.snapshot.items.push({
    ...structuredClone(context.snapshot.items[0]),
    id: id("merchant-stock"),
    storage_id: merchant.storageId,
    owner_entity_id: entity.id,
    quantity: 4,
  });
  const thread = context.world.threads.at(-1);
  thread.cursor = 1;
  thread.status = "resolved";
  thread.steps[0].privateText = "PRIVATE_CURRENT_GOAL_MARKER";
  const draft = buildPreparationDraft(f.source, context);
  assert(!JSON.stringify(draft).includes("MARKER"));
  const corrected = draft.entities[0];
  corrected.name = "Mara the ferryman";
  corrected.aliases = ["M"];
  corrected.description = "Owner corrected description.";
  corrected.limitations = ["Will not cross at night."];
  corrected.merchantLabel = "Mara’s ferry";
  draft.threads[0].title = "Quay repairs";
  const before = structuredClone(context);
  const plan = planPreparation(context, f.source, draft);
  assert.equal(plan.storageCreates.length, 0);
  assert.deepEqual(plan.changes[0].values, {
    name: corrected.name,
    details: corrected.description,
  });
  assert.equal(plan.changes[0].expectedRevision, entity.revision);
  assert.deepEqual(
    plan.state.preparations[0].sourceVersionIds,
    before.state.preparations[0].sourceVersionIds,
  );
  assert.equal(plan.state.preparations[0].packEntityId, f.ids.person);
  assert.equal(plan.state.merchants[0].storageId, merchant.storageId);
  assert.equal(plan.state.merchants[0].version, merchant.version + 1);
  assert.deepEqual(plan.state.progress, before.state.progress);
  assert.equal(
    plan.world.actors.find((row) => row.id === actor.id).locationId,
    actor.locationId,
  );
  assert(
    plan.world.actors
      .find((row) => row.id === actor.id)
      .capabilities.includes("PRIVATE_CURRENT_CAPABILITY_MARKER"),
  );
  assert.equal(plan.world.threads.at(-1).status, "resolved");
  assert.equal(plan.world.threads.at(-1).cursor, 1);
  assert.equal(
    plan.world.threads.at(-1).steps[0].privateText,
    "PRIVATE_CURRENT_GOAL_MARKER",
  );
  assert(!JSON.stringify(plan.events).includes("MARKER"));
  context = apply(context, plan);
  assert.equal(
    context.snapshot.entities.find((row) => row.id === entity.id).resources
      .credit,
    17,
  );
  assert.equal(
    context.snapshot.items.find((row) => row.id === id("merchant-stock"))
      .quantity,
    4,
  );
  assert.equal(context.events[0].payload.entities[0].name, "Mara");
  assert.equal(
    buildPreparationDraft(f.source, context).entities[0].name,
    corrected.name,
  );
  const disable = buildPreparationDraft(f.source, context);
  disable.entities[0].merchant = false;
  const disabled = planPreparation(context, f.source, disable);
  assert.equal(disabled.state.merchants[0].available, false);
  assert.equal(disabled.storageCreates.length, 0);
  assert.equal(disabled.changes.length, 0);
});

test("preparation refuses foreign scopes, stolen identities, unsupported retyping and repinned provenance", () => {
  for (const mutate of [
    (f) => {
      f.context.foundation.ownerId = id("other-owner");
    },
    (f) => {
      f.context.snapshot.campaign.id = id("other-campaign");
    },
    (f) => {
      f.context.snapshot.entities[0].campaign_id = id("other-campaign");
    },
    (f) => {
      f.context.snapshot.timeline.epoch += 1;
    },
    (f) => {
      f.context.foundation.worldMinutes += 1;
    },
    (f) => {
      f.context.foundation.bindings = [];
    },
    (f) => {
      f.source.binding.mappings[0].entityId = f.context.snapshot.entities[1].id;
    },
    (f) => {
      f.source.binding.mappings[0].entityId = f.context.snapshot.storages[0].id;
    },
    (f) => {
      f.source.binding.mappings[0].entityId = f.source.pack.body.entities[0].id;
    },
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => planPreparation(f.context, f.source, selected(f)));
  }
  const f = fixture();
  const context = apply(
    f.context,
    planPreparation(f.context, f.source, selected(f)),
  );
  const draft = buildPreparationDraft(f.source, context);
  draft.entities[0].kind = "location";
  assert.throws(() => planPreparation(context, f.source, draft), /conflict/);
  context.state.preparations[0].packVersionId = id("old-pin");
  assert.throws(() => buildPreparationDraft(f.source, context), /conflict/);
});

test("different campaigns keep source identities separate and detached planning does not mutate the Pack", () => {
  const f = fixture();
  const before = structuredClone(f.source.pack);
  const other = structuredClone(f.source);
  let index = 0;
  other.binding = buildCampaignBinding({
    id: id("other-binding"),
    campaignId: id("other-campaign"),
    ownerId: other.pack.ownerId,
    pack: other.pack,
    entry: other.binding.entry,
    sourcePriority: other.pack.body.sourcePriority,
    allocateEntityId: () => id(`other-instance-${index++}`),
  });
  const first = buildPreparationDraft(f.source);
  const second = buildPreparationDraft(other);
  assert.equal(first.entities[0].packEntityId, second.entities[0].packEntityId);
  assert.notEqual(first.threads[0].id, second.threads[0].id);
  assert.notEqual(
    first.threads[0].entityIds[0],
    second.threads[0].entityIds[0],
  );
  assert.deepEqual(f.source.pack, before);
});

test("private candidates are filtered before limits and no source metadata or counts are projected", () => {
  const f = fixture();
  const baseClaim = f.source.pack.body.claims[0];
  const hidden = Array.from({ length: 70 }, (_, index) => ({
    id: id(`hidden-person-${index}`),
    name: `HIDDEN_PERSON_${index}_MARKER`,
    kind: "person",
    aliases: [],
  }));
  f.source.pack.body.entities.unshift(...hidden);
  f.source.pack.body.claims.unshift(
    ...hidden.map((entity, index) => ({
      ...structuredClone(baseClaim),
      id: id(`hidden-claim-${index}`),
      subjectId: entity.id,
      text: entity.name,
      visibility: "private",
      predicate: "goal",
      evidence: baseClaim.evidence.map((entry) => ({
        ...entry,
        visibility: "private",
      })),
    })),
  );
  f.source.binding.mappings.push(
    ...hidden.map((entity, index) => ({
      packEntityId: entity.id,
      entityId: id(`hidden-instance-${index}`),
    })),
  );
  f.source.pack.body.title = "SOURCE_TITLE_MARKER";
  f.source.binding.entry.label = "ENTRY_LABEL_MARKER";
  const draft = buildPreparationDraft(f.source, f.context);
  assert.equal(draft.entities.length, 3);
  assert.equal(draft.threads.length, 1);
  assert(!JSON.stringify(draft).includes("MARKER"));
  assert.deepEqual(Object.keys(draft).sort(), [
    "bindingId",
    "entities",
    "packVersionId",
    "schemaVersion",
    "threads",
  ]);
});

test("bounded owner capability and goal corrections replace their exact fields without reopening a finished thread", () => {
  const f = fixture();
  const context = apply(
    f.context,
    planPreparation(f.context, f.source, selected(f)),
  );
  const actor = context.world.actors.at(-3);
  const thread = context.world.threads.at(-1);
  actor.capabilities = ["PRIVATE_CAPABILITY_MARKER"];
  thread.steps[0].privateText = "PRIVATE_GOAL_MARKER";
  thread.status = "resolved";
  thread.cursor = 1;
  const draft = buildPreparationDraft(f.source, context);
  draft.entities[0].capabilities = ["Repair boats", "Read tides"];
  draft.threads[0].goal = "Owner goal: inspect the completed quay.";
  draft.threads[0].policy = "background";
  draft.entities[2].kind = "group";
  const plan = planPreparation(context, f.source, draft);
  assert.deepEqual(
    plan.world.actors.find((row) => row.id === actor.id).capabilities,
    draft.entities[0].capabilities,
  );
  assert.equal(plan.world.actors.at(-1).kind, "group");
  assert.equal(
    plan.world.threads.at(-1).steps[0].privateText,
    draft.threads[0].goal,
  );
  assert.equal(plan.world.threads.at(-1).steps[0].consequence, "background");
  assert.equal(plan.world.threads.at(-1).status, "resolved");
  assert.equal(plan.world.threads.at(-1).cursor, 1);
  assert(!JSON.stringify(plan.events).includes("MARKER"));
  const next = apply(context, plan);
  const reviewed = buildPreparationDraft(f.source, next);
  assert.deepEqual(
    reviewed.entities[0].capabilities,
    draft.entities[0].capabilities,
  );
  assert.equal(reviewed.threads[0].goal, draft.threads[0].goal);
});

test("owner-owned branch events are required for correcting prepared Threads and hidden private text is never a fallback", () => {
  const f = fixture();
  const context = apply(
    f.context,
    planPreparation(f.context, f.source, selected(f)),
  );
  context.world.threads.at(-1).steps[0].privateText = "PRIVATE_SAVE_MARKER";
  context.events = [];
  const draft = buildPreparationDraft(f.source, context);
  assert(!JSON.stringify(draft).includes("MARKER"));
  assert.equal(draft.threads[0].selected, false);
  draft.threads[0].selected = true;
  assert.throws(() => planPreparation(context, f.source, draft), /conflict/);
  const ru = structuredClone(f.source);
  ru.language = "ru";
  ru.pack.body.entities[0].name = "HIDDEN_NAME_MARKER";
  assert.match(
    buildPreparationDraft(ru).entities[0].name,
    /^Известный персонаж/,
  );
});
