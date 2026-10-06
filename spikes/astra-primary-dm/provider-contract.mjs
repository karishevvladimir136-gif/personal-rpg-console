const nil = (type) => ({ type: [type, "null"] });
const obj = (properties) => ({ type: "object", additionalProperties: false,
  properties, required: Object.keys(properties) });
const exact = (value) => ({ type: "string", enum: [value] });

/** Writable capabilities are derived only from the authoritative, curated packet. */
export function writableCapabilities(packet) {
  const state = packet?.consoleContext?.structuredState;
  if (!state || !state.actors || !state.items || !state.locations)
    throw Error("missing authoritative contract state");
  const actors = Object.values(state.actors).map((actor) => {
    if (!actor || typeof actor.id !== "string" || !actor.resources ||
      Object.values(actor.resources).some((value) => !Number.isSafeInteger(value)))
      throw Error("malformed authoritative actor resources");
    const resourceKeys = Object.keys(actor.resources).sort();
    return { id: actor.id, resourceKeys,
      positionWritable: Boolean(packet.activeEncounter) && resourceKeys.includes("move") };
  });
  return { actors, itemIds: Object.keys(state.items),
    locationIds: Object.keys(state.locations) };
}

/** The strict final schema cannot offer an encounter-only patch during exploration. */
export function responseSchemaForPacket(packet) {
  const capabilities = writableCapabilities(packet);
  const actorGroups = new Map();
  for (const actor of capabilities.actors) {
    const key = JSON.stringify([actor.resourceKeys, actor.positionWritable]);
    const group = actorGroups.get(key) ?? { ids: [], ...actor };
    group.ids.push(actor.id);
    actorGroups.set(key, group);
  }
  const values = (hp, resources, position, quantity) => obj({ hp, resources, position, quantity });
  const branches = [...actorGroups.values()].map((group) => {
    const resourceShape = group.resourceKeys.length ? { anyOf: [obj(Object.fromEntries(
      group.resourceKeys.map((key) => [key, nil("integer")] ))), { type: "null" }] } : { type: "null" };
    return obj({ family: exact("actors"), id: { type: "string", enum: group.ids },
      expectedRevision: nil("integer"), values: values(nil("integer"), resourceShape,
        group.positionWritable ? { type: ["string", "null"],
          enum: ["nearby", "far", "cover", null] } : { type: "null" }, { type: "null" }) });
  });
  if (capabilities.itemIds.length) branches.push(obj({ family: exact("items"),
    id: { type: "string", enum: capabilities.itemIds }, expectedRevision: nil("integer"),
    values: values({ type: "null" }, { type: "null" }, { type: "null" }, nil("integer")) }));
  if (capabilities.locationIds.length) branches.push(obj({ family: exact("location"),
    id: { type: "string", enum: capabilities.locationIds }, expectedRevision: { type: "null" },
    values: values({ type: "null" }, { type: "null" }, { type: "null" }, { type: "null" }) }));
  const toolCall = obj({ kind: { type: "string",
    enum: ["query", "skill", "attack", "save", "damage"] }, actorId: nil("string"),
  targetId: nil("string"), dc: nil("integer"), itemId: nil("string"), scope: nil("string") });
  const finalProposal = obj({ schemaVersion: { type: "integer" }, operationId: { type: "string" },
    campaignId: { type: "string" }, expectedRevision: { type: "integer" }, input: { type: "string" },
    narration: { type: "string" }, visualDescription: { type: "string" },
    publicChanges: { type: "array", items: { anyOf: branches } },
    privateChanges: { type: "array", items: obj({ key: { type: "string" }, value: { type: "string" } }) },
    memoryCandidates: { type: "array", items: obj({ visibility: { type: "string", enum: ["public", "private"] },
      text: { type: "string" } }) }, rollRefs: { type: "array", items: { type: "string" } },
    worldMinutes: { type: "integer" }, clarification: nil("string") });
  return obj({ type: { type: "string", enum: ["tool", "final"] },
    call: { anyOf: [toolCall, { type: "null" }] },
    proposal: { anyOf: [finalProposal, { type: "null" }] } });
}
