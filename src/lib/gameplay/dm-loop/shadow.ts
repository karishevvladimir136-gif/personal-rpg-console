// The shadow state of one dm-loop-v1 turn: a clone of the claimed source that
// every accepted tool call mutates, plus the collapsed RecordChange list that
// the commit sends to SQL. References from the model resolve against it.
import type { JsonObject, MechanicsConfiguration } from "../contracts.ts";
import type { Entity, Item, Location, Quest, Storage } from "../../persistence/contracts.ts";
import type { PrivatePatch, RecordChange, RecordFamily, RuntimeSource } from "../server-contracts.ts";
import { applyAstraShadowChanges } from "../astra-ordered-effects.ts";
import { stableGameplayId } from "../dice.ts";
import { isUuid } from "../../persistence/validation.ts";
import type { DmLoopShadowDelta } from "./contracts.ts";

/** A rejected tool call: the reason goes back to the model, the turn continues. */
export class ToolReject extends Error {
  readonly hint: string | null;
  constructor(reason: string, hint: string | null = null) {
    super(reason);
    this.name = "ToolReject";
    this.hint = hint;
  }
}
export function reject(condition: unknown, reason: string, hint: string | null = null): asserts condition {
  if (!condition) throw new ToolReject(reason, hint);
}

const familyRank: Record<RecordFamily, number> = {
  entities: 0, locations: 1, storages: 2, items: 3, quests: 4, public_state: 5,
  conversations: 6, rest_records: 6, recipes: 6, effects: 6, encounters: 6,
  encounter_participants: 7, pending_actions: 7, provenance: 7,
};

export type ShadowRef = { family: "entities" | "items" | "locations" | "quests" | "storages"; id: string };

export class ShadowState {
  readonly source: RuntimeSource;
  readonly operationId: string;
  readonly campaignId: string;
  private readonly changes = new Map<string, RecordChange>();
  readonly privatePatches: PrivatePatch[] = [];
  readonly localKeys = new Map<string, ShadowRef>();
  readonly createdIds = new Set<string>();
  minutesAdvanced = 0;
  finished = false;

  constructor(source: RuntimeSource, operationId: string) {
    this.source = structuredClone(source);
    this.operationId = operationId;
    this.campaignId = source.snapshot.campaign.id;
  }

  /** Rebuild the after-state of an earlier attempt from its persisted delta. */
  static restore(source: RuntimeSource, operationId: string, delta: DmLoopShadowDelta | null): ShadowState {
    const shadow = new ShadowState(source, operationId);
    if (!delta) return shadow;
    for (const change of delta.changes) shadow.apply(change);
    shadow.privatePatches.push(...structuredClone(delta.privatePatches));
    for (const entry of delta.localKeys) shadow.localKeys.set(entry.key, { family: entry.family as ShadowRef["family"], id: entry.id });
    for (const id of delta.createdIds) shadow.createdIds.add(id);
    shadow.source.runtime.worldMinutes = delta.worldMinutes;
    shadow.source.runtime.configuration = structuredClone(delta.configuration);
    shadow.minutesAdvanced = delta.minutesAdvanced;
    shadow.finished = delta.finished;
    return shadow;
  }

  /** A deep copy to try one tool call on; adopted only when the call is accepted. */
  clone(): ShadowState {
    const copy = new ShadowState(this.source, this.operationId);
    for (const [key, change] of this.changes) copy.changes.set(key, structuredClone(change));
    copy.privatePatches.push(...structuredClone(this.privatePatches));
    for (const [key, ref] of this.localKeys) copy.localKeys.set(key, ref);
    for (const id of this.createdIds) copy.createdIds.add(id);
    copy.minutesAdvanced = this.minutesAdvanced;
    copy.finished = this.finished;
    return copy;
  }

  /** Take over the state of a candidate clone (an accepted tool call). */
  adopt(candidate: ShadowState) {
    this.source.snapshot = candidate.source.snapshot;
    this.source.runtime = candidate.source.runtime;
    this.source.privateState = candidate.source.privateState;
    this.changes.clear();
    for (const change of candidate.changesInOrder()) this.changes.set(`${change.family}:${change.id}`, change);
    this.privatePatches.splice(0, this.privatePatches.length, ...candidate.privatePatches);
    this.localKeys.clear();
    for (const [key, ref] of candidate.localKeys) this.localKeys.set(key, ref);
    this.createdIds.clear();
    for (const id of candidate.createdIds) this.createdIds.add(id);
    this.minutesAdvanced = candidate.minutesAdvanced;
    this.finished = candidate.finished;
  }

  changesInOrder(): RecordChange[] {
    return [...this.changes.values()];
  }

  delta(): DmLoopShadowDelta {
    return {
      changes: this.orderedChanges(),
      privatePatches: structuredClone(this.privatePatches),
      localKeys: [...this.localKeys.entries()].map(([key, ref]) => ({ key, family: ref.family, id: ref.id })),
      worldMinutes: this.source.runtime.worldMinutes,
      configuration: structuredClone(this.source.runtime.configuration),
      createdIds: [...this.createdIds],
      minutesAdvanced: this.minutesAdvanced,
      finished: this.finished,
    };
  }

  /** Collapsed changes, parents before children, one row per record. */
  orderedChanges(): RecordChange[] {
    return [...this.changes.values()].map((change, index) => ({ change, index }))
      .sort((a, b) => familyRank[a.change.family] - familyRank[b.change.family] || a.index - b.index)
      .map((entry) => structuredClone(entry.change));
  }

  get snapshot() { return this.source.snapshot; }
  get runtime() { return this.source.runtime; }
  get worldMinutes() { return this.source.runtime.worldMinutes; }

  /** Apply one validated change to the clone and collapse it into the commit list. */
  apply(change: RecordChange) {
    applyAstraShadowChanges(this.source, [structuredClone(change)]);
    const key = `${change.family}:${change.id}`;
    const before = this.changes.get(key);
    this.changes.set(key, {
      family: change.family, id: change.id,
      expectedRevision: before ? before.expectedRevision : change.expectedRevision,
      values: { ...before?.values, ...structuredClone(change.values) },
    });
    if (!before && change.expectedRevision === null) this.createdIds.add(change.id);
  }

  /** Deterministic ID for a record this turn creates under a local key. */
  newId(key: string): string {
    return stableGameplayId(this.operationId, `dm-loop:${key}`);
  }

  bindLocalKey(key: string, ref: ShadowRef) {
    reject(!this.localKeys.has(key), `The local key "${key}" is already used in this turn.`,
      "Choose another localKey, or refer to the existing record by it.");
    this.localKeys.set(key, ref);
  }

  entity(id: string): Entity | undefined {
    return this.snapshot.entities.find((row) => row.id === id && row.campaign_id === this.campaignId);
  }
  item(id: string): Item | undefined {
    return this.snapshot.items.find((row) => row.id === id && row.campaign_id === this.campaignId);
  }
  location(id: string): Location | undefined {
    return this.snapshot.locations.find((row) => row.id === id && row.campaign_id === this.campaignId);
  }
  quest(id: string): Quest | undefined {
    return this.snapshot.quests.find((row) => row.id === id && row.campaign_id === this.campaignId);
  }
  storage(id: string): Storage | undefined {
    return this.snapshot.storages.find((row) => row.id === id && row.campaign_id === this.campaignId);
  }

  /** The player's hero: the controlled player entity. */
  hero(): Entity {
    const controlled = this.runtime.configuration?.controlledEntityIds ?? [];
    const hero = this.snapshot.entities.find((row) => row.kind === "player" &&
      row.campaign_id === this.campaignId && (controlled.length === 0 || controlled.includes(row.id)))
      ?? this.snapshot.entities.find((row) => row.kind === "player" && row.campaign_id === this.campaignId);
    reject(hero, "This campaign has no player character yet.");
    return hero;
  }

  /** Party: the hero plus companions marked controlled. */
  partyIds(): string[] {
    const hero = this.hero();
    const controlled = new Set(this.runtime.configuration?.controlledEntityIds ?? []);
    return [hero.id, ...this.snapshot.entities.filter((row) => row.kind === "companion" &&
      row.campaign_id === this.campaignId && controlled.has(row.id) && row.id !== hero.id).map((row) => row.id)];
  }

  isPresent(entityId: string): boolean {
    return this.runtime.configuration?.presentEntityIds.includes(entityId) ?? false;
  }

  /** Resolve a model reference: an ID, a local key, or a unique exact name. */
  resolve(value: unknown, families: ShadowRef["family"][], what: string): ShadowRef {
    reject(typeof value === "string" && value.trim().length > 0, `${what} is missing.`);
    const text = value.trim();
    const local = this.localKeys.get(text);
    if (local && families.includes(local.family)) return local;
    // (the guard is called on an unknown so the string type survives the false branch)
    if (isUuid(text as unknown)) {
      for (const family of families) {
        if (this.rowsOf(family).some((row) => row.id === text)) return { family, id: text };
      }
      throw new ToolReject(`${what}: no ${families.join("/")} record with ID ${text} in this campaign.`,
        "Use an ID from the context or a local key of a record created in this turn.");
    }
    const lower = text.toLocaleLowerCase();
    const matches: ShadowRef[] = [];
    for (const family of families) {
      for (const row of this.rowsOf(family)) {
        const named = row as unknown as { name?: unknown; title?: unknown };
        const name = typeof named.name === "string" ? named.name : typeof named.title === "string" ? named.title : "";
        if (name.toLocaleLowerCase() === lower) matches.push({ family, id: row.id });
      }
    }
    if (matches.length === 1) return matches[0];
    if (matches.length > 1)
      throw new ToolReject(`${what}: the name "${text}" matches several records.`,
        `Use one of the IDs: ${matches.map((m) => m.id).join(", ")}.`);
    throw new ToolReject(`${what}: nothing named "${text}" exists yet and it is not a local key of this turn.`,
      "Create the record first (upsert_character / upsert_place / item create) or use an existing ID.");
  }

  rowsOf(family: ShadowRef["family"]): { id: string; campaign_id: string }[] {
    const rows = family === "entities" ? this.snapshot.entities : family === "items" ? this.snapshot.items
      : family === "locations" ? this.snapshot.locations : family === "quests" ? this.snapshot.quests
      : this.snapshot.storages;
    return rows.filter((row) => row.campaign_id === this.campaignId);
  }

  /** Names close to a given one (same words, case-insensitive) for a creation hint. */
  similarEntities(name: string): Entity[] {
    const words = new Set(name.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3));
    if (!words.size) return [];
    return this.snapshot.entities.filter((row) => row.campaign_id === this.campaignId &&
      row.name.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).some((w) => w.length >= 3 && words.has(w)));
  }

  /** Storage that holds an entity's possessions, created on demand. */
  storageFor(entity: Entity): Storage {
    const existing = this.snapshot.storages.filter((row) => row.campaign_id === this.campaignId &&
      row.entity_id === entity.id).sort((a, b) => a.id.localeCompare(b.id))[0];
    if (existing) return existing;
    const kind: Storage["kind"] = entity.kind === "player" ? "player" : entity.kind === "companion" ? "companion"
      : entity.kind === "npc" ? "merchant" : "transport";
    const id = this.newId(`storage:${entity.id}`);
    this.apply({ family: "storages", id, expectedRevision: null,
      values: { name: `Possessions of ${entity.name}`.slice(0, 160), kind, entity_id: entity.id } });
    return this.storage(id)!;
  }

  /** The shared camp stock (always exists; created on first use). */
  campStorage(): Storage {
    const existing = this.snapshot.storages.filter((row) => row.campaign_id === this.campaignId &&
      row.kind === "camp").sort((a, b) => a.id.localeCompare(b.id))[0];
    if (existing) return existing;
    const id = this.newId("storage:camp");
    this.apply({ family: "storages", id, expectedRevision: null, values: { name: "Camp", kind: "camp", entity_id: null } });
    return this.storage(id)!;
  }

  setConfiguration(next: MechanicsConfiguration) {
    this.source.runtime.configuration = structuredClone(next);
  }

  configuration(): MechanicsConfiguration {
    const current = this.runtime.configuration;
    if (current) return structuredClone(current);
    const hero = this.hero();
    return { profile: "console-basic-v1", controlledEntityIds: [hero.id], presentEntityIds: [hero.id],
      nearbyStorageIds: [], safeLocationIds: [], itemRules: [] };
  }

  /** Private fact bucket as the shadow sees it (patches of this turn included). */
  privateValue(kind: PrivatePatch["kind"], key: string): string | number | null {
    const bucket = this.source.privateState[kind];
    const value = bucket && typeof bucket === "object" && !Array.isArray(bucket) ? bucket[key] : undefined;
    return typeof value === "string" || typeof value === "number" ? value : null;
  }

  setPrivate(kind: PrivatePatch["kind"], key: string, value: string) {
    const bucket = this.source.privateState[kind];
    const next: JsonObject = bucket && typeof bucket === "object" && !Array.isArray(bucket) ? bucket : {};
    next[key] = value;
    this.source.privateState[kind] = next;
    this.privatePatches.push({ kind, key, operation: "set", value, amount: null });
  }

  advanceClock(key: string, amount: number) {
    const bucket = this.source.privateState.clock;
    const next: JsonObject = bucket && typeof bucket === "object" && !Array.isArray(bucket) ? bucket : {};
    next[key] = Number(next[key] ?? 0) + amount;
    this.source.privateState.clock = next;
    this.privatePatches.push({ kind: "clock", key, operation: "advance", value: null, amount });
  }
}
