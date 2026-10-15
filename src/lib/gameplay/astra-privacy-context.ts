import type { BuiltContext, RuntimeSource } from "./server-contracts.ts";
import type { Json, JsonObject, TurnInput } from "./contracts.ts";
import { characterPacket } from "./character-model.ts";
import { memoryTerms } from "../memory/source-analysis.ts";
import type { MemorySource } from "../memory/server-contracts.ts";

function content(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.some(content);
  if (typeof value === "object") return Object.values(value).some(content);
  return true;
}
function object(value: Json | undefined): JsonObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function publicWorld(source: RuntimeSource): RuntimeSource["worldTakeover"] {
  const world = source.worldTakeover;
  if (!world) return undefined;
  const visible = new Map(source.snapshot.entities.map((row) => [row.id, row.name]));
  const known = new Set(source.snapshot.locations.filter((row) =>
    row.status === "known" || row.status === "visited").map((row) => row.id));
  const controlled = new Set(source.runtime.configuration?.controlledEntityIds ?? []);
  const publicKnowledge = (value: Json) => {
    const locator = object(value);
    if (!locator || locator.visibility !== "public") return false;
    return source.snapshot.documents.some((row) => row.status === "canon" &&
      row.id === locator.sourceId && row.current_version_id === locator.sourceVersionId) ||
      [...(source.memory?.historical ?? []), ...(source.memory?.exactEvents ?? [])].some((row) =>
        row.ref.visibility === "public" && row.ref.id === locator.sourceId &&
        row.ref.version === locator.sourceVersionId &&
        (row.authority === "canon" || row.knownBy.some((id) => controlled.has(id))));
  };
  const proven = (actorId: string, value: Json) => {
    if (typeof value !== "string") return false;
    const actor = source.snapshot.entities.find((row) => row.id === actorId);
    if (actor?.details.includes(value)) return true;
    if (controlled.has(actorId) && source.astraProgressionBaseline?.includes(value)) return true;
    return source.snapshot.documents.some((row) => row.status === "canon" &&
      !!actor && row.body.includes(actor.name) && row.body.includes(value));
  };
  return { schemaVersion: 1, sourceWorldRevision: world.sourceWorldRevision,
    presentEntityIds: world.presentEntityIds.filter((id) => visible.has(id)),
    routeLocationIds: world.routeLocationIds.filter((id) => known.has(id)),
    actors: world.actors.flatMap((actor) => typeof actor.entityId === "string" && visible.has(actor.entityId)
      ? [{ entityId: actor.entityId, publicName: visible.get(actor.entityId)!,
          publicCapabilities: Array.isArray(actor.capabilities ?? actor.publicCapabilities)
            ? (actor.capabilities ?? actor.publicCapabilities as Json[]) as Json[] : [],
          publicLimitations: Array.isArray(actor.limitations ?? actor.publicLimitations)
            ? (actor.limitations ?? actor.publicLimitations as Json[]) as Json[] : [],
          publicKnowledge: Array.isArray(actor.knowledge ?? actor.publicKnowledge)
            ? ((actor.knowledge ?? actor.publicKnowledge) as Json[]).filter(publicKnowledge) : [] }].map((row) => ({
              ...row, publicCapabilities: row.publicCapabilities.filter((value) => proven(String(actor.entityId), value)),
              publicLimitations: row.publicLimitations.filter((value) => proven(String(actor.entityId), value)),
            })) : []),
    policy: {}, unresolvedThreads: [],
    recentWorldEvents: world.recentWorldEvents.filter((event) => event.visibility === "public") };
}

/** Deterministic relevance selection, not a second DM or a fiction classifier.
 * Private retrieval is already scoped/ranked by the existing Memory authority.
 * Unrelated private rows do not force every turn in the campaign through a
 * private prompt. A selected private original always remains private evidence. */
export function curateAstraContextSource(source: RuntimeSource, input: TurnInput): RuntimeSource {
  if (source.astraResponseContract !== "unified-v1") return source;
  const terms = new Set(memoryTerms(input.input));
  const lower = input.input.toLocaleLowerCase();
  const present = new Set(source.worldTakeover?.presentEntityIds ??
    source.runtime.configuration?.presentEntityIds ?? []);
  const relevantActors = new Set(source.snapshot.entities.filter((row) =>
    row.kind !== "player" && row.campaign_id === input.campaignId &&
    (row.id === input.companionId || input.listenerIds.includes(row.id) ||
      (row.name.length >= 3 && lower.includes(row.name.toLocaleLowerCase())) ||
      (present.has(row.id) && memoryTerms(row.name).some((term) => terms.has(term)))))
    .map((row) => row.id));
  // Reuse the accepted bounded Character Packet selection. In-scene models
  // remain relevant even when ordinary dialogue uses a pronoun or no name.
  for (const row of characterPacket(source, input, "plan")) relevantActors.add(row.actorId);
  const locationId = source.snapshot.publicState.current_location_id;
  const overlaps = (value: unknown, minimum = 2) => {
    const selected = memoryTerms(typeof value === "string" ? value : JSON.stringify(value));
    return [...new Set(selected)].filter((term) => terms.has(term)).length >= minimum;
  };
  const explicitlyScoped = (value: Json): boolean => {
    const row = typeof value === "string" && /^[\[{]/.test(value.trim())
      ? (() => { try { return JSON.parse(value) as Json; } catch { return null; } })() : value;
    if (!row || typeof row !== "object" || Array.isArray(row)) return false;
    return ["actorId", "entityId", "npcId"].some((key) => typeof row[key] === "string" &&
      relevantActors.has(row[key] as string)) ||
      ["locationId", "currentLocationId"].some((key) => locationId !== null && row[key] === locationId);
  };
  const selectedPrivate = [
    ...(source.memory?.privateHistorical ?? []),
    ...(source.memory?.exactEvents.filter((row) => row.ref.visibility === "private") ?? []),
  ];
  for (const row of selectedPrivate)
    for (const id of row.entityIds) if (source.snapshot.entities.some((actor) =>
      actor.id === id && actor.kind !== "player")) relevantActors.add(id);
  const privateState: JsonObject = {};
  for (const [bucketKey, bucketValue] of Object.entries(source.privateState)) {
    const bucket = object(bucketValue);
    if (!bucket) {
      if (explicitlyScoped(bucketValue) || overlaps([bucketKey, bucketValue]))
        privateState[bucketKey] = bucketValue;
      continue;
    }
    const selected = Object.fromEntries(Object.entries(bucket).filter(([key, value]) =>
      key.startsWith("character_") ? relevantActors.has(key.slice("character_".length)) :
        relevantActors.has(key) || (locationId !== null && key === locationId) ||
        explicitlyScoped(value) || overlaps(key, 1) || overlaps([bucketKey, key, value])));
    if (Object.keys(selected).length) privateState[bucketKey] = selected;
  }
  const relevantSummary = (row: MemorySource) => selectedPrivate.some((selected) => selected.id === row.id) ||
    row.entityIds.some((id) => relevantActors.has(id)) || overlaps(row.text);
  const privateSummaryEntries = source.memory?.privateSummary?.entries.filter(relevantSummary) ?? [];
  const memory = source.memory ? { ...source.memory,
    privateSummary: source.memory.privateSummary && privateSummaryEntries.length
      ? { ...source.memory.privateSummary, entries: privateSummaryEntries } : null,
  } : undefined;
  const world = publicWorld(source);
  if (world && source.worldTakeover) {
    world.actors = world.actors.map((actor) => {
      const original = source.worldTakeover!.actors.find((row) => row.entityId === actor.entityId);
      return relevantActors.has(String(actor.entityId)) && original
        ? { ...actor,
            privateCapabilities: Array.isArray(original.capabilities ?? original.privateCapabilities)
              ? ((original.capabilities ?? original.privateCapabilities) as Json[]).filter((value) =>
              !(Array.isArray(actor.publicCapabilities) && actor.publicCapabilities.includes(value))) : [],
            privateLimitations: Array.isArray(original.limitations ?? original.privateLimitations)
              ? ((original.limitations ?? original.privateLimitations) as Json[]).filter((value) =>
              !(Array.isArray(actor.publicLimitations) && actor.publicLimitations.includes(value))) : [],
            privateKnowledge: Array.isArray(original.knowledge ?? original.privateKnowledge)
              ? ((original.knowledge ?? original.privateKnowledge) as Json[]).filter((value) =>
                !(Array.isArray(actor.publicKnowledge) && actor.publicKnowledge.some((entry) =>
                  JSON.stringify(entry) === JSON.stringify(value)))) : [] } : actor;
    });
    world.unresolvedThreads = source.worldTakeover.unresolvedThreads.filter((row) => overlaps(row));
    world.recentWorldEvents = source.worldTakeover.recentWorldEvents.filter((row) =>
      overlaps(row) || (Array.isArray(row.actorIds) && row.actorIds.some((id) =>
        typeof id === "string" && relevantActors.has(id))));
  }
  return { ...source, privateState, memory, worldTakeover: world,
    narrationBridge: undefined };
}

/** The routing decision inspects the actual selected provider packet. It never
 * consults the mere existence of private campaign rows or an omitted summary. */
export function astraContextHasPrivateEvidence(context: Pick<BuiltContext, "input">): boolean {
  const packet = JSON.parse(context.input) as {
    mandatory?: { privateState?: Record<string, unknown>; characterPacket?: Record<string, unknown>[];
      checkpoint?: Record<string, unknown>; worldTakeover?: {
      actors?: Record<string, unknown>[]; unresolvedThreads?: unknown; recentWorldEvents?: unknown;
    } };
    memory?: { privateContinuity?: Record<string, unknown> };
    astraPrimary?: Record<string, unknown>;
  };
  const mandatory = packet.mandatory;
  const world = mandatory?.worldTakeover;
  const metadata = new Set(["id", "campaignId", "ownerId", "timeline", "schemaVersion", "revision", "stateRevision"]);
  const state = Object.entries(mandatory?.privateState ?? {}).some(([key, value]) =>
    !metadata.has(key) && content(value));
  const characters = mandatory?.characterPacket?.some((row) => {
    const identity = row.identity as Record<string, unknown> | undefined;
    const current = row.current as Record<string, unknown> | undefined;
    const entries = (key: string) => Array.isArray(row[key]) ? row[key] as Record<string, unknown>[] : [];
    return ["values", "wants", "boundaries", "loyalties", "signatures"].some((key) => content(identity?.[key])) ||
      ["goal", "stress", "preoccupation", "obligation"].some((key) => content(current?.[key])) ||
      entries("beliefs").some((entry) => content(entry.text)) ||
      entries("relationships").some((entry) => ["affection", "trust", "respect", "unresolvedHurt"].some((key) => content(entry[key]))) ||
      entries("episodes").some((entry) => content(entry.meaning) || content(entry.cue));
  });
  const continuity = packet.memory?.privateContinuity;
  const privateMemory = ["exactEvents", "history", "digest"].some((key) =>
    Array.isArray(continuity?.[key]) && (continuity[key] as Record<string, unknown>[]).some((row) =>
      typeof row.text === "string" && row.text.trim().length > 0));
  const point = mandatory?.checkpoint;
  const privateCheckpoint = !!point && (["privateText", "privateResume", "privateState", "privateMemory"].some((key) =>
    content(point[key])) || (point.visibility === "private" && content(point.resume)));
  const privateWorldEvents = Array.isArray(world?.recentWorldEvents) &&
    (world.recentWorldEvents as Record<string, unknown>[]).some((event) =>
      event.visibility !== "public" && (content(event.text) || content(event.privateText)));
  const unknown = (value: unknown, allowed: string[]) => value && typeof value === "object" &&
    !Array.isArray(value) && Object.entries(value).some(([key, entry]) => !allowed.includes(key) && content(entry));
  const authoring = packet.astraPrimary;
  const settlement = authoring?.settlementAuthority as Record<string, unknown> | undefined;
  // Public-agreed jobs/currencies are existing mechanics, not private DM truth.
  // An unknown future authoring field must be reviewed before the one-call
  // public route may receive it; it cannot bypass routing by another key name.
  const unknownAuthoring = unknown(authoring, ["responseContract", "responseMode", "capabilities", "toolPolicy",
    "settlementAuthority", "mechanicsAuthority", "currentProgression", "authority"]) ||
    unknown(settlement, ["controlledPlayerId", "progressionTracks", "presentNpcIds", "jobs", "existingCurrencies",
      "transferableItemIds", "purchasableItemIds", "sellableItemIds", "merchantBuyerIds", "mundaneIngredientItemIds",
      "barterOfferItemIds", "limits"]) ||
    (Array.isArray(settlement?.jobs) && (settlement.jobs as Record<string, unknown>[]).some((job) =>
      unknown(job, ["questId", "title", "status", "issuerId", "rewardTerms"]) ||
      unknown(job.rewardTerms, ["schemaVersion", "issuerId", "currencyName", "currencyAmount", "itemName", "itemCategory", "itemDescription"])));
  return state || !!characters || privateMemory || privateCheckpoint || !!unknownAuthoring ||
    !!world?.actors?.some((actor) => content(actor.privateKnowledge) || content(actor.privateLimitations) ||
      content(actor.privateCapabilities) || content(actor.knowledge) || content(actor.limitations) ||
      content(actor.capabilities)) || content(world?.unresolvedThreads) || privateWorldEvents;
}

/** Public model context is constructed by projection before any request. No
 * private model output/intent is handed to its narrator as a paraphrase bridge. */
export function projectAstraPublicSource(source: RuntimeSource, input: TurnInput,
  options?: { forNarration?: boolean }): RuntimeSource {
  const selected = curateAstraContextSource(source, input);
  const present = new Set(source.worldLogicPresence?.presentEntityIds ??
    source.worldTakeover?.presentEntityIds ?? source.runtime.configuration?.presentEntityIds ?? []);
  const controlled = new Set(source.worldLogicPresence?.controlledEntityIds ??
    source.runtime.configuration?.controlledEntityIds ?? []);
  const visible = new Set(source.snapshot.entities.filter((row) => row.campaign_id === input.campaignId &&
    ["npc", "companion"].includes(row.kind) && present.has(row.id) && !controlled.has(row.id)).map((row) => row.id));
  const voices = new Map<string, { actorId: string; observableVoice: string }>();
  // Reprojection sees an already-cleared private namespace. Preserve the
  // server-owned public voice instead of needing its Character Model again.
  for (const row of [...characterPacket(selected, input, "narrate"), ...(source.observableCharacters ?? [])]) {
    if (visible.has(row.actorId) && !voices.has(row.actorId) &&
      typeof row.observableVoice === "string" && row.observableVoice.trim().length > 0 && row.observableVoice.length <= 180)
      voices.set(row.actorId, { actorId: row.actorId, observableVoice: row.observableVoice });
  }
  const observableCharacters = [...voices.values()].slice(0, 2);
  return { ...source, privateState: {}, privateStateRevision: undefined,
    observableCharacters, narrationBridge: undefined, foundationOptions: undefined,
    lootChecks: undefined, worldLogicMundaneDetail: undefined,
    worldTakeover: options?.forNarration ? undefined : publicWorld(source),
    ...(options?.forNarration ? { astraSettlementJobs: undefined, astraSettlementCurrencies: undefined,
      astraSettlementItemPolicies: undefined, astraProgressionState: undefined, astraProgressionBaseline: undefined } : {}),
    memory: source.memory ? { ...source.memory, privateHistorical: [], privateSummary: null,
      requiredPrivateHistoricalSourceIds: [],
      exactEvents: source.memory.exactEvents.filter((row) => row.ref.visibility === "public"),
      checkpoint: null } : undefined,
    checkpoint: null };
}

