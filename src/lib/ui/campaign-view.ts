// Presentation-only selectors over the public campaign projection.
// No private DM state, no writes. Every screen of Stage 5 reads through here.
import type {
  CampaignSnapshot,
  Entity,
  Item,
  Location,
  PinnedFact,
  PublicProfile,
  Quest,
  Scene,
  Storage,
} from "../persistence/contracts.ts";
import type { PlaySnapshot, PublicTurn } from "../gameplay/contracts.ts";
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
/** The time of day in words (polish group 6: no ticking clock on the player's screen). */
export function timeOfDayWord(minutes: number, lang: Lang) {
  const hour = Math.floor((((minutes % 1440) + 1440) % 1440) / 60);
  const key = hour < 5 ? "night" : hour < 11 ? "morning" : hour < 14 ? "midday" : hour < 17 ? "afternoon" : hour < 22 ? "evening" : "night";
  const ru = { night: "ночь", morning: "утро", midday: "полдень", afternoon: "день", evening: "вечер" }[key];
  return pick(lang, ru, key);
}
export function worldClock(minutes: number | null | undefined, lang: Lang) {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes) || minutes < 0) return null;
  const day = Math.floor(minutes / 1440) + 1;
  return `${pick(lang, "День", "Day")} ${day} · ${timeOfDayWord(minutes, lang)}`;
}

/** The addressee named at the start of the player's text — «@Тамсин», «Тамсин, …», «Тамсин: …» —
 * among the people present; stems compare, so an inflected name still matches (polish group 6). */
export function detectAddressee<T extends Pick<Entity, "id" | "name">>(text: string, present: T[]): T | null {
  const match = /^\s*(@?)([\p{L}][\p{L}'’-]{1,40})\s*([,:!—–-]?)/u.exec(text);
  if (!match || (!match[1] && !match[3])) return null;
  const stem = (value: string) => { const word = value.toLocaleLowerCase().replace(/[^\p{L}]/gu, ""); return word.slice(0, Math.max(3, word.length - 2)); };
  const typed = stem(match[2]);
  if (typed.length < 3) return null;
  return present.find((row) => { const name = stem(row.name.split(/\s+/)[0] ?? ""); return name.length >= 3 && (name.startsWith(typed) || typed.startsWith(name)); }) ?? null;
}

/** The order of the turn's chips (polish group 6): what the hero holds first — items and money — then
 * wounds and counters, the journal, people and places, travel, rest and time last. */
const CHANGE_RANK: Record<string, number> = { item: 0, money: 1, resource: 2, quest: 3, holding: 5, upsert_character: 4, note_character: 4, upsert_place: 5, move_party: 6, rest: 7, combat: 8, advance_time: 9 };
export function orderChanges<T extends { name?: string; tool?: string }>(changes: T[]): T[] {
  const rank = (change: T) => CHANGE_RANK[change.name ?? change.tool ?? ""] ?? 5;
  return changes.map((change, index) => ({ change, index })).sort((a, b) => rank(a.change) - rank(b.change) || a.index - b.index).map((row) => row.change);
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
/** The universal paper doll (polish group 8, the registry port): twelve slots for any ruleset — left
 * голова, шея, талисман, тело, плащ; right основная рука, вторая рука, кольцо I, кольцо II, руки; bottom
 * пояс, ноги. Records created before the polish stage, or with no slots, show it; the loop's equip
 * tool uses the record's own slots, so the migration gives every hero these as records too. */
export function universalSlots(language: Lang): { id: string; label: string; accepts: string[] }[] {
  const ru = language === "ru";
  return [
    { id: "head", label: ru ? "Голова" : "Head", accepts: ["armor", "clothing"] },
    { id: "neck", label: ru ? "Шея" : "Neck", accepts: ["accessory", "jewelry", "gear"] },
    { id: "talisman", label: ru ? "Талисман" : "Talisman", accepts: ["accessory", "jewelry", "misc"] },
    { id: "body", label: ru ? "Тело" : "Body", accepts: ["armor", "clothing"] },
    { id: "cloak", label: ru ? "Плащ" : "Cloak", accepts: ["clothing", "armor"] },
    { id: "hand", label: ru ? "Основная рука" : "Main hand", accepts: ["weapon", "tool"] },
    { id: "offhand", label: ru ? "Вторая рука" : "Off hand", accepts: ["weapon", "shield", "tool"] },
    { id: "ring1", label: ru ? "Кольцо I" : "Ring I", accepts: ["jewelry", "accessory"] },
    { id: "ring2", label: ru ? "Кольцо II" : "Ring II", accepts: ["jewelry", "accessory"] },
    { id: "gloves", label: ru ? "Руки" : "Hands", accepts: ["clothing", "armor", "gear"] },
    { id: "belt", label: ru ? "Пояс" : "Belt", accepts: ["gear", "clothing", "consumable", "weapon", "tool"] },
    { id: "legs", label: ru ? "Ноги" : "Legs", accepts: ["armor", "clothing"] },
  ];
}
export function equipmentOf(data: CampaignSnapshot, entity: Entity): SlotView[] {
  const slots = entity.equipment_slots.length ? entity.equipment_slots : universalSlots(data.campaign.language === "ru" ? "ru" : "en");
  return slots.map((slot) => ({
    id: slot.id,
    label: slot.label,
    item: data.items.find((item) => item.equipped_entity_id === entity.id && item.equipped_slot === slot.id && item.quantity > 0) ?? null,
  }));
}

/** The campaign's currency as the world named it: the first currency on any record, else the
 * language's plain word. A wallet always exists (polish group 8): 0 when nothing was recorded. */
export function campaignCurrency(data: Pick<CampaignSnapshot, "entities" | "campaign">): { key: string; label: string } {
  for (const row of data.entities) {
    const key = Object.keys(row.resources).find((name) => name.startsWith("currency_"));
    if (key) return { key, label: resourcePresentation(key).label };
  }
  const label = data.campaign.language === "ru" ? "монеты" : "coins";
  return { key: `currency_${label}`, label: resourcePresentation(`currency_${label}`).label };
}
export function walletOf(data: Pick<CampaignSnapshot, "entities" | "campaign">, entity: Pick<Entity, "resources">): MoneyView[] {
  const { money } = resourcesOf(entity);
  if (money.length) return money;
  const currency = campaignCurrency(data);
  return [{ key: currency.key, label: currency.label, value: 0 }];
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

export type HoldingKind = "camp" | "transport" | "mount" | "base";
export type HoldingDetails = { features: { name: string; description: string }[]; armament: string; passengers: Entity[] };
export type HoldingView = {
  id: string;
  kind: HoldingKind;
  name: string;
  storage: Storage | null;
  entity: Entity | null;
  items: Item[];
  /** Features, armament and people aboard (UI_DATA_NEEDS #12), when the record has them. */
  details: HoldingDetails | null;
};
/** Camp always; transports, mounts and bases when the DM created them. */
export function holdingsOf(data: CampaignSnapshot): HoldingView[] {
  const itemsIn = (storageId: string | null) =>
    storageId ? data.items.filter((item) => item.storage_id === storageId && item.quantity > 0) : [];
  const people = (ids: string[]) => ids.map((id) => data.entities.find((row) => row.id === id)).filter((row): row is Entity => !!row);
  const details = (holding: PublicProfile["holding"] | undefined): HoldingDetails | null =>
    holding ? { features: holding.features ?? [], armament: holding.armament ?? "", passengers: people(holding.passengers ?? []) } : null;
  const camps = data.storages.filter((row) => row.kind === "camp");
  const result: HoldingView[] = camps.filter((row) => row.detail?.holding?.kind !== "base").length
    ? camps.filter((row) => row.detail?.holding?.kind !== "base").map((storage) => ({ id: storage.id, kind: "camp" as const, name: storage.name, storage, entity: null, items: itemsIn(storage.id), details: null }))
    : [{ id: "camp", kind: "camp", name: "", storage: null, entity: null, items: [], details: null }];
  for (const storage of camps.filter((row) => row.detail?.holding?.kind === "base"))
    result.push({ id: storage.id, kind: "base", name: storage.name, storage, entity: null, items: itemsIn(storage.id), details: details(storage.detail?.holding) });
  const vehicles = data.entities.filter((row) => row.kind === "transport" || row.kind === "mount");
  for (const entity of vehicles) {
    const storage = data.storages.find((row) => row.entity_id === entity.id) ?? null;
    result.push({ id: entity.id, kind: entity.kind === "mount" ? "mount" : "transport", name: entity.name, storage, entity, items: itemsIn(storage?.id ?? null), details: details(profileOf(entity).holding) });
  }
  for (const storage of data.storages.filter((row) => row.kind === "transport" && !vehicles.some((entity) => entity.id === row.entity_id)))
    result.push({ id: storage.id, kind: "transport", name: storage.name, storage, entity: null, items: itemsIn(storage.id), details: null });
  return result;
}
export function holdingsNavLabel(holdings: HoldingView[], lang: Lang) {
  return holdings.some((row) => row.kind !== "camp")
    ? pick(lang, "Имущество", "Holdings")
    : pick(lang, "Лагерь", "Camp");
}

const questKind = (row: Quest) => row.kind ?? "quest";
/** Quests proper (jobs the hero took); threads, debts, promises and the arc are in journalOf. */
export function questsOf(data: CampaignSnapshot) {
  const byDate = (a: Quest, b: Quest) => b.updated_at.localeCompare(a.updated_at) || a.title.localeCompare(b.title);
  const active = data.quests.filter((row) => row.status === "open" && questKind(row) === "quest").sort(byDate);
  const done = data.quests.filter((row) => row.status === "complete" && questKind(row) === "quest").sort(byDate);
  // Polish group 6: the goal is the quest the hero took (the newest open one), else the open main arc.
  const arc = data.quests.filter((row) => row.status === "open" && questKind(row) === "arc").sort(byDate)[0] ?? null;
  return { active, done, goal: active[0] ?? arc ?? null };
}

export type JournalEntry = { quest: Quest; kind: "thread" | "debt" | "promise"; counterpart: Entity | null; sinceSession: number | null };
/** The journal (UI_DATA_NEEDS #3, #4): the main arc with its steps, open threads, debts and promises. */
export function journalOf(data: CampaignSnapshot) {
  const arc = data.quests.filter((row) => questKind(row) === "arc" && row.status === "open").sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null;
  const entry = (quest: Quest): JournalEntry => ({ quest, kind: questKind(quest) as JournalEntry["kind"],
    counterpart: quest.detail?.counterpartId ? data.entities.find((row) => row.id === quest.detail?.counterpartId) ?? null : null,
    sinceSession: sessionNumber(data, quest.detail?.sinceSessionId ?? null) });
  const open = data.quests.filter((row) => row.status === "open").sort((a, b) => b.updated_at.localeCompare(a.updated_at) || a.title.localeCompare(b.title));
  return {
    arc: arc ? { quest: arc, steps: arc.detail?.steps ?? [] } : null,
    threads: open.filter((row) => questKind(row) === "thread").map(entry),
    debts: open.filter((row) => questKind(row) === "debt").map(entry),
    promises: open.filter((row) => questKind(row) === "promise").map(entry),
    closed: data.quests.filter((row) => row.status !== "open" && ["thread", "debt", "promise"].includes(questKind(row))).map(entry),
  };
}

export const profileOf = (entity: Entity): PublicProfile => (entity.public_profile && typeof entity.public_profile === "object" ? entity.public_profile : {});

export type CodexGroup = { id: "allies" | "family" | "ally" | "murky" | "neutral" | "foe" | "known"; title: string; entries: Entity[] };
/** Only records the player can see, grouped by the hero's known relation (UI_DATA_NEEDS #7). */
export function codexOf(data: CampaignSnapshot, query: string, lang: Lang): CodexGroup[] {
  const needle = query.trim().toLocaleLowerCase();
  const match = (row: Entity) => !needle || `${row.name}\n${row.details}\n${profileOf(row).relation?.note ?? ""}`.toLocaleLowerCase().includes(needle);
  const byName = (a: Entity, b: Entity) => Number(!!profileOf(b).important) - Number(!!profileOf(a).important) || a.name.localeCompare(b.name);
  // A person the DM recorded ahead of the story stays out until the hero meets them (polish).
  const npcs = data.entities.filter((row) => row.kind === "npc" && !profileOf(row).unmet && match(row));
  const group = (id: CodexGroup["id"], title: string, filter: (row: Entity) => boolean): CodexGroup =>
    ({ id, title, entries: npcs.filter(filter).sort(byName) });
  const relation = (row: Entity) => profileOf(row).relation?.group ?? null;
  const groups: CodexGroup[] = [
    { id: "allies", title: pick(lang, "Спутники", "Companions"), entries: data.entities.filter((row) => row.kind === "companion" && !profileOf(row).unmet && match(row)).sort(byName) },
    group("family", pick(lang, "Семья и свои", "Family"), (row) => relation(row) === "family"),
    group("ally", pick(lang, "Союзники", "Allies"), (row) => relation(row) === "ally"),
    group("murky", pick(lang, "Мутные", "Murky"), (row) => relation(row) === "murky"),
    group("foe", pick(lang, "Враги", "Foes"), (row) => relation(row) === "foe"),
    group("neutral", pick(lang, "Нейтральные", "Neutral"), (row) => relation(row) === "neutral"),
    group("known", pick(lang, "Встреченные", "People met"), (row) => relation(row) === null),
  ];
  return groups.filter((group) => group.entries.length);
}

export type FactionView = { entity: Entity; publicNote: string; relation: "ally" | "neutral" | "foe" | "unknown"; members: Entity[] };
/** Factions the hero knows (UI_DATA_NEEDS #8). */
export function factionsOf(data: CampaignSnapshot): FactionView[] {
  return data.entities.filter((row) => row.kind === "faction").map((entity) => ({ entity,
    publicNote: profileOf(entity).faction?.publicNote ?? entity.details, relation: profileOf(entity).faction?.relation ?? "unknown",
    members: data.entities.filter((row) => row.kind !== "faction" && profileOf(row).factionId === entity.id).sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.entity.name.localeCompare(b.entity.name));
}

/** A companion's observable attitude toward the hero (UI_DATA_NEEDS #6); never Character Model text. */
export function companionAttitude(entity: Entity): { text: string; lastNoticed: string } | null {
  return profileOf(entity).attitude ?? null;
}

/** People back home (UI_DATA_NEEDS #11): everyone with a known home place, grouped by place. */
export function homeRosterOf(data: CampaignSnapshot): { place: Location; people: Entity[] }[] {
  const byPlace = new Map<string, Entity[]>();
  for (const row of data.entities) {
    const home = profileOf(row).homePlaceId;
    if (!home || row.kind === "player" || row.kind === "faction") continue;
    (byPlace.get(home) ?? byPlace.set(home, []).get(home)!).push(row);
  }
  return [...byPlace.entries()].flatMap(([placeId, people]) => {
    const place = data.locations.find((row) => row.id === placeId);
    return place ? [{ place, people: people.sort((a, b) => a.name.localeCompare(b.name)) }] : [];
  }).sort((a, b) => a.place.name.localeCompare(b.place.name));
}

export const pinnedOf = (data: CampaignSnapshot): PinnedFact[] => data.campaign.pinned_facts ?? [];

/** Owner-facing numbers of the last turns (UI_DATA_NEEDS #5) from the public turns. */
export function turnStatsOf(turns: PublicTurn[], count = 20) {
  const rows = turns.filter((turn) => turn.status === "committed" && turn.stats).slice(-count).map((turn) => turn.stats!);
  if (!rows.length) return null;
  const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; };
  // Polish item 14: from the player's send to the first visible word, whatever request it came from.
  const firstWords = rows.map((row) => row.firstWordMs ?? row.firstTextMs).filter((value): value is number => value !== null && value !== undefined);
  return { turns: rows.length, medianFirstWordMs: firstWords.length ? median(firstWords) : null, medianTurnMs: median(rows.map((row) => row.latencyMs)),
    avgCostUsd: rows.reduce((sum, row) => sum + row.costUsd, 0) / rows.length, rejectedCalls: rows.reduce((sum, row) => sum + row.rejectedCalls, 0),
    cacheReadShare: rows.filter((row) => row.cacheReadShare !== null).length ? rows.reduce((sum, row) => sum + (row.cacheReadShare ?? 0), 0) / rows.filter((row) => row.cacheReadShare !== null).length : null };
}

export type PlaceView = { location: Location; current: boolean; rumored: boolean; goal: boolean };
/** Known, visited and rumoured places (UI_DATA_NEEDS #10); a place tied to an open quest's goal is marked. */
export function placesOf(data: CampaignSnapshot): PlaceView[] {
  const openQuests = new Set(data.quests.filter((row) => row.status === "open").map((row) => row.id));
  return data.locations
    .filter((row) => row.status === "known" || row.status === "visited" || row.status === "rumored")
    .map((location) => ({ location, current: location.id === data.publicState.current_location_id, rumored: location.status === "rumored",
      goal: (location.detail?.questIds ?? []).some((id) => openQuests.has(id)) }))
    .sort((a, b) => Number(b.current) - Number(a.current) || Number(a.rumored) - Number(b.rumored) || Number(b.location.status === "visited") - Number(a.location.status === "visited") || a.location.name.localeCompare(b.location.name));
}

/** The visible story of the current session: player inputs and narration, in order. */
export function sessionStory(data: CampaignSnapshot, sessionId: string | null) {
  return sceneOrder(data.scenes.filter((row) => row.session_id === sessionId && (row.role === "player" || row.role === "narration")));
}

export function initials(name: string) {
  return name.split(/\s+/u).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}
