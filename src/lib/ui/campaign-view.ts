// Presentation-only selectors over the public campaign projection.
// No private DM state, no writes. Every screen of Stage 5 reads through here.
import type {
  CampaignSnapshot,
  Entity,
  Item,
  Location,
  Quest,
  Scene,
  Storage,
} from "../persistence/contracts.ts";
import type { PlaySnapshot } from "../gameplay/contracts.ts";
import { resourcePresentation } from "../resource-presentation.ts";

export type Lang = "en" | "ru";
const pick = (lang: Lang, ru: string, en: string) => (lang === "ru" ? ru : en);

export function sceneOrder<T extends Pick<Scene, "sequence">>(rows: T[]) {
  return [...rows].sort((a, b) => a.sequence - b.sequence);
}

export function currentSession(data: CampaignSnapshot) {
  return data.sessions.find((row) => row.id === data.publicState.current_session_id) ?? null;
}
export function currentPlace(data: CampaignSnapshot) {
  return data.locations.find((row) => row.id === data.publicState.current_location_id) ?? null;
}
export function currentScene(data: CampaignSnapshot) {
  return data.scenes.find((row) => row.id === data.publicState.current_scene_id) ?? null;
}
export function sessionNumber(data: CampaignSnapshot, sessionId: string | null | undefined) {
  if (!sessionId) return null;
  const ordered = [...data.sessions].sort((a, b) => a.updated_at.localeCompare(b.updated_at) || a.id.localeCompare(b.id));
  const firstScene = (id: string) => Math.min(...data.scenes.filter((row) => row.session_id === id).map((row) => row.sequence), Number.MAX_SAFE_INTEGER);
  ordered.sort((a, b) => firstScene(a.id) - firstScene(b.id));
  const index = ordered.findIndex((row) => row.id === sessionId);
  return index < 0 ? null : index + 1;
}

/** "Day 5 · 06:40" from the campaign's world clock (minutes since the start). */
export function worldClock(minutes: number | null | undefined, lang: Lang) {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes) || minutes < 0) return null;
  const day = Math.floor(minutes / 1440) + 1;
  const rest = Math.floor(minutes % 1440);
  const time = `${String(Math.floor(rest / 60)).padStart(2, "0")}:${String(rest % 60).padStart(2, "0")}`;
  return `${pick(lang, "День", "Day")} ${day} · ${time}`;
}

export function heroOf(data: CampaignSnapshot, play?: PlaySnapshot | null): Entity | null {
  const controlled = new Set(play?.configuration?.controlledEntityIds ?? []);
  return data.entities.find((row) => row.kind === "player" && controlled.has(row.id))
    ?? data.entities.find((row) => row.kind === "player")
    ?? null;
}

export type ResourceView = { key: string; label: string; value: number; max: number | null };
export type MoneyView = { key: string; label: string; value: number };
/** Named counters and money exactly as the record keeps them. Labels come from
 * resourcePresentation (English source phrases for the shared catalog);
 * a paired `<key>_max` value is the cap. No ruleset vocabulary here. */
export function resourcesOf(entity: Pick<Entity, "resources">) {
  const resources: ResourceView[] = [];
  const money: MoneyView[] = [];
  for (const [key, value] of Object.entries(entity.resources)) {
    if (key.endsWith("_max") || !Number.isFinite(value)) continue;
    const shown = resourcePresentation(key);
    const maxValue = entity.resources[`${key}_max`];
    if (shown.kind === "money") money.push({ key, label: shown.label, value });
    else resources.push({ key, label: shown.label, value, max: Number.isFinite(maxValue) ? maxValue : null });
  }
  return { resources, money };
}

/** A label for a mechanical stat key of the record (no ruleset assumptions). */
export function statLabel(key: string) {
  return resourcePresentation(key).label;
}

export function inventoryOf(data: CampaignSnapshot, entityId: string): Item[] {
  const storages = new Set(data.storages.filter((row) => row.entity_id === entityId).map((row) => row.id));
  return data.items
    .filter((item) => item.quantity > 0 && (storages.has(item.storage_id) || item.owner_entity_id === entityId || item.equipped_entity_id === entityId))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type SlotView = { id: string; label: string; item: Item | null };
export function equipmentOf(data: CampaignSnapshot, entity: Entity): SlotView[] {
  return entity.equipment_slots.map((slot) => ({
    id: slot.id,
    label: slot.label,
    item: data.items.find((item) => item.equipped_entity_id === entity.id && item.equipped_slot === slot.id && item.quantity > 0) ?? null,
  }));
}

export type PartyMember = { entity: Entity; present: boolean };
/** Companions only. "Present" follows the public play configuration of the scene. */
export function partyOf(data: CampaignSnapshot, play?: PlaySnapshot | null): PartyMember[] {
  const present = new Set(play?.configuration?.presentEntityIds ?? []);
  const known = play?.configuration !== null && play?.configuration !== undefined;
  return data.entities
    .filter((row) => row.kind === "companion")
    .map((entity) => ({ entity, present: known ? present.has(entity.id) : true }))
    .sort((a, b) => Number(b.present) - Number(a.present) || a.entity.name.localeCompare(b.entity.name));
}
export function inCombat(play?: PlaySnapshot | null) {
  return Boolean(play?.encounters.some((row) => row.status === "active"));
}

export type HoldingKind = "camp" | "transport" | "mount";
export type HoldingView = {
  id: string;
  kind: HoldingKind;
  name: string;
  storage: Storage | null;
  entity: Entity | null;
  items: Item[];
};
/** Camp always; transports and mounts when the DM created them (storage kinds). */
export function holdingsOf(data: CampaignSnapshot): HoldingView[] {
  const itemsIn = (storageId: string | null) =>
    storageId ? data.items.filter((item) => item.storage_id === storageId && item.quantity > 0) : [];
  const camps = data.storages.filter((row) => row.kind === "camp");
  const result: HoldingView[] = camps.length
    ? camps.map((storage) => ({ id: storage.id, kind: "camp", name: storage.name, storage, entity: null, items: itemsIn(storage.id) }))
    : [{ id: "camp", kind: "camp", name: "", storage: null, entity: null, items: [] }];
  const vehicles = data.entities.filter((row) => row.kind === "transport" || row.kind === "mount");
  for (const entity of vehicles) {
    const storage = data.storages.find((row) => row.entity_id === entity.id) ?? null;
    result.push({ id: entity.id, kind: entity.kind === "mount" ? "mount" : "transport", name: entity.name, storage, entity, items: itemsIn(storage?.id ?? null) });
  }
  for (const storage of data.storages.filter((row) => row.kind === "transport" && !vehicles.some((entity) => entity.id === row.entity_id)))
    result.push({ id: storage.id, kind: "transport", name: storage.name, storage, entity: null, items: itemsIn(storage.id) });
  return result;
}
export function holdingsNavLabel(holdings: HoldingView[], lang: Lang) {
  return holdings.some((row) => row.kind !== "camp")
    ? pick(lang, "Имущество", "Holdings")
    : pick(lang, "Лагерь", "Camp");
}

export function questsOf(data: CampaignSnapshot) {
  const byDate = (a: Quest, b: Quest) => b.updated_at.localeCompare(a.updated_at) || a.title.localeCompare(b.title);
  const active = data.quests.filter((row) => row.status === "open").sort(byDate);
  const done = data.quests.filter((row) => row.status === "complete").sort(byDate);
  return { active, done, goal: active[0] ?? null };
}

export type CodexGroup = { id: "allies" | "known"; title: string; entries: Entity[] };
/** Only records the player can see. Relationship groups need data the backend does not expose yet. */
export function codexOf(data: CampaignSnapshot, query: string, lang: Lang): CodexGroup[] {
  const needle = query.trim().toLocaleLowerCase();
  const match = (row: Entity) => !needle || `${row.name}\n${row.details}`.toLocaleLowerCase().includes(needle);
  const byName = (a: Entity, b: Entity) => a.name.localeCompare(b.name);
  const groups: CodexGroup[] = [
    { id: "allies", title: pick(lang, "Спутники", "Companions"), entries: data.entities.filter((row) => row.kind === "companion" && match(row)).sort(byName) },
    { id: "known", title: pick(lang, "Встреченные", "People met"), entries: data.entities.filter((row) => row.kind === "npc" && match(row)).sort(byName) },
  ];
  return groups.filter((group) => group.entries.length);
}

export type PlaceView = { location: Location; current: boolean };
export function placesOf(data: CampaignSnapshot): PlaceView[] {
  return data.locations
    .filter((row) => row.status === "known" || row.status === "visited")
    .map((location) => ({ location, current: location.id === data.publicState.current_location_id }))
    .sort((a, b) => Number(b.current) - Number(a.current) || Number(b.location.status === "visited") - Number(a.location.status === "visited") || a.location.name.localeCompare(b.location.name));
}

/** The visible story of the current session: player inputs and narration, in order. */
export function sessionStory(data: CampaignSnapshot, sessionId: string | null) {
  return sceneOrder(data.scenes.filter((row) => row.session_id === sessionId && (row.role === "player" || row.role === "narration")));
}

export function initials(name: string) {
  return name.split(/\s+/u).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}
