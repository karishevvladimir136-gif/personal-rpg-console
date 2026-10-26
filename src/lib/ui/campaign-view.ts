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
import { coinOf, itemMechanics, universalSlots as modelUniversalSlots, walletOfEntity, walletOfStorage, type SpellRecord } from "../inventory/model.ts";
import { slotsFor } from "../inventory/owner-moves.ts";
import { derivedSheetOf, sheetLabels5e, signed } from "../live2d/battle/rules-5e.ts";
import { campaignDay, longRestEnds } from "../gameplay/world-day.ts";

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
/** Fix S4 11u′: the day turns at first light or at the end of a long rest, never at midnight (world-day.ts, the one
 * function the DM's context uses too); pass the play's rest records (or the minutes their long rests ended) so a long
 * rest counts. */
export function worldClock(minutes: number | null | undefined, lang: Lang, rests?: readonly (number | NonNullable<Parameters<typeof longRestEnds>[0]>[number])[] | null) {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes) || minutes < 0) return null;
  const day = campaignDay(minutes, (rests ?? []).flatMap((row) => (typeof row === "number" ? [row] : longRestEnds([row]))));
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
export type MoneyView = { key: string; label: string; value: number; /** A known coin's full name, for the hover. */ title?: string };
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

export type SlotView = { id: string; label: string; accepts: string[]; item: Item | null; blockedBy: Item | null };
/** The paper doll (fix S2, stage D, items 14, 27, 33): the model's eleven slots — Голова, Амулет, Плащ, Броня /
 * одежда, Перчатки / наручи, Пояс, Сапоги, Кольцо (левая), Кольцо (правая), Основная рука, Вторая рука; no «Ноги». */
export const universalSlots = (language: Lang) => modelUniversalSlots(language);
/** A person's doll: the eleven when the record's own slots are older or missing (the first owner move gives the
 * record them), else its own; a two-handed thing in the main hand blocks the off hand («занято: посох»). */
export function equipmentOf(data: Pick<CampaignSnapshot, "items" | "campaign">, entity: Entity): SlotView[] {
  const slots = slotsFor(entity, data.campaign.language === "ru" ? "ru" : "en");
  const worn = (id: string) => data.items.find((item) => item.equipped_entity_id === entity.id && item.equipped_slot === id && item.quantity > 0) ?? null;
  const main = worn("hand");
  const twoHanded = main && itemMechanics(main).hands === 2 ? main : null;
  return slots.map((slot) => {
    const item = worn(slot.id);
    return { id: slot.id, label: slot.label, accepts: slot.accepts, item, blockedBy: slot.id === "offhand" && !item ? twoHanded : null };
  });
}
/** Where each slot sits on the doll (BG3-like): the body down the left, jewellery and belt on the right, the two
 * hands under the figure. A slot a world named itself goes to the shorter column. */
export function dollLayout<T extends { id: string }>(slots: T[]): { left: T[]; right: T[]; hands: T[] } {
  const LEFT = ["head", "cloak", "body", "gloves", "boots"], RIGHT = ["amulet", "ring_left", "ring_right", "belt"], HANDS = ["hand", "offhand"];
  const order = (ids: string[]) => ids.map((id) => slots.find((slot) => slot.id === id)).filter((slot): slot is T => !!slot);
  const left = order(LEFT), right = order(RIGHT), hands = order(HANDS);
  for (const slot of slots.filter((row) => ![...LEFT, ...RIGHT, ...HANDS].includes(row.id))) (left.length <= right.length ? left : right).push(slot);
  return { left, right, hands };
}

/** The campaign's currency as the world named it: the first currency on any record, else the
 * language's plain word. A wallet always exists (polish group 8): 0 when nothing was recorded. */
export function campaignCurrency(data: Pick<CampaignSnapshot, "entities" | "campaign">): { key: string; label: string } {
  for (const row of data.entities) {
    const key = Object.keys(row.resources).find((name) => name.startsWith("currency_"));
    if (key) return { key, label: coinOf(key.slice("currency_".length).replaceAll("_", " "), data.campaign.language)?.code ?? resourcePresentation(key).label };
  }
  const label = data.campaign.language === "ru" ? "монеты" : "coins";
  return { key: `currency_${label}`, label: resourcePresentation(`currency_${label}`).label };
}
/** The wallet as rows (the play screen's side panel): a known coin under its code in lower case, in the order of value,
 * two records of one coin summed (item 52); a world's own currency keeps its word. */
export function walletOf(data: Pick<CampaignSnapshot, "entities" | "campaign">, entity: Pick<Entity, "resources">): MoneyView[] {
  const { money } = resourcesOf(entity);
  if (!money.length) {
    const currency = campaignCurrency(data);
    return [{ key: currency.key, label: currency.label, value: 0 }];
  }
  const language = data.campaign.language;
  const rows = new Map<string, MoneyView & { rank: number; index: number }>();
  money.forEach((row, index) => {
    const coin = coinOf(row.key.slice("currency_".length).replaceAll("_", " "), language);
    const label = coin?.code ?? row.label;
    const seen = rows.get(label);
    if (seen) seen.value += row.value;
    else rows.set(label, { key: row.key, label, value: row.value, rank: coin?.value ?? -1, index, ...(coin ? { title: coin.name } : {}) });
  });
  return [...rows.values()].sort((a, b) => b.rank - a.rank || a.index - b.index)
    .map((row) => ({ key: row.key, label: row.label, value: row.value, ...(row.title ? { title: row.title } : {}) }));
}

/** The character sheet as the screens show it, schema 1 (creation) or 2 (level, saves, attacks, speed, armour class,
 * the spells as records — a companion's from its stat block). */
export type SheetView = {
  schema: 1 | 2;
  mode: "structured_rpg" | "narrative";
  role: string | null;
  level: number | null;
  tier: string | null;
  attributes: readonly (readonly [string, number])[];
  armorClass: number | null;
  speed: string | null;
  skills: string[];
  saves: string[];
  attacks: string[];
  abilities: string[];
  limitations: string[];
  /** Schema 2: the spells as records (the spells tab). */
  spells: SpellRecord[];
  /** Schema 1: the spells as lines. */
  spellLines: string[];
  preparedMax: number | null;
};
const lines = (value: unknown) => (Array.isArray(value) ? value.filter((line): line is string => typeof line === "string" && line.trim().length > 0) : []);
export function sheetOf(entity: Pick<Entity, "character_sheet" | "stats">): SheetView {
  const sheet = (entity.character_sheet ?? null) as Record<string, unknown> | null;
  const schema = sheet?.schemaVersion === 2 ? 2 : 1;
  const attributes = sheet?.attributes && typeof sheet.attributes === "object" ? sheet.attributes as Record<string, number> : null;
  const number = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
  const stat = number(entity.stats?.level);
  const spells = schema === 2 && Array.isArray(sheet?.spells)
    ? (sheet!.spells as unknown[]).filter((spell): spell is SpellRecord => !!spell && typeof spell === "object" && typeof (spell as SpellRecord).name === "string" && Number.isInteger((spell as SpellRecord).level))
    : [];
  return {
    schema,
    mode: sheet?.mode === "structured_rpg" ? "structured_rpg" : "narrative",
    role: typeof sheet?.role === "string" && sheet.role.trim() ? sheet.role : null,
    // A schema-2 sheet's level is the one the DM's level-up and the owner's edit change; else the older stat.
    level: schema === 2 && number(sheet?.level) !== null ? number(sheet?.level) : stat && stat > 0 ? stat : number(sheet?.level),
    tier: typeof sheet?.tier === "string" && sheet.tier.trim() ? sheet.tier : null,
    attributes: attributes ? ([["STR", attributes.strength], ["DEX", attributes.dexterity], ["CON", attributes.constitution], ["INT", attributes.intelligence],
      ["WIS", attributes.wisdom], ["CHA", attributes.charisma]] as const).filter(([, value]) => Number.isFinite(value)) : [],
    armorClass: number(sheet?.armorClass),
    speed: typeof sheet?.speed === "string" && sheet.speed.trim() ? sheet.speed : null,
    skills: lines(sheet?.skills),
    saves: lines(sheet?.saves),
    attacks: lines(sheet?.attacks),
    abilities: lines(sheet?.abilities),
    limitations: lines(sheet?.limitations),
    spells,
    spellLines: schema === 1 ? lines(sheet?.spells) : [],
    preparedMax: number(sheet?.preparedMax),
  };
}

/** One plate of the sheet's numbers: its label (already in the language when `translated`, else the English source
 * phrase for the catalogue), its value, and how it is made (the hover / tap line), when the rules module knows. */
export type Plate = { key: string; label: string; value: string | number; text: string | null; translated: boolean };
/** Fix S3-accept Г1: the stat block's keys a 5e campaign's plates already say («КД», «Атака», «Навык»). */
const RULED_STATS = /^(ac|кд|armou?r|armou?r_class|defen[cs]e|защита|attack|skill|proficiency|proficiency_bonus|ac_manual)$/i;
/** The sheet's plates (character sheet, party card, the hero line): in a 5e campaign «КД», «Атака», «Навык» from the
 * rules module with their breakdowns (the server's numbers); otherwise the sheet's armour class, the speed and the
 * record's stats as before — a stub zero never shows, a label already given is not repeated. */
export function sheetPlates(data: Pick<CampaignSnapshot, "items" | "settings" | "campaign">, entity: Entity, stats: readonly (readonly [string, number])[]): Plate[] {
  const sheet = sheetOf(entity);
  const derived = derivedSheetOf(data, entity);
  const plates: Plate[] = [];
  if (derived) {
    const words = sheetLabels5e(data.campaign.language);
    if (derived.ac) plates.push({ key: "ac", label: words.ac, value: derived.ac.value, text: derived.ac.text, translated: true });
    if (sheet.speed) plates.push({ key: "speed", label: "Speed", value: sheet.speed, text: null, translated: false });
    if (derived.attack) plates.push({ key: "attack", label: words.attack, value: signed(derived.attack.value), text: derived.attack.text, translated: true });
    const skill = stats.find(([key]) => key === "skill")?.[1];
    if (derived.proficiency) plates.push({ key: "skill", label: words.skill, value: signed(derived.proficiency.value), text: derived.proficiency.text, translated: true });
    // A sheet with no level keeps the record's own «Навык» number, said where it comes from.
    else if (skill) plates.push({ key: "skill", label: words.skill, value: signed(skill), text: data.campaign.language === "ru" ? `${signed(skill)} по листу` : `${signed(skill)} from the sheet`, translated: true });
  } else {
    if (sheet.armorClass !== null) plates.push({ key: "armorClass", label: "Armor class", value: sheet.armorClass, text: null, translated: false });
    if (sheet.speed) plates.push({ key: "speed", label: "Speed", value: sheet.speed, text: null, translated: false });
  }
  for (const [key, value] of stats.filter(([key, value]) => value !== 0 && key !== "ac_manual" && !(derived && RULED_STATS.test(key)))) {
    const label = statLabel(key);
    if (!plates.some((plate) => plate.label === label)) plates.push({ key, label, value, text: null, translated: false });
  }
  return plates;
}

/** «Здесь лежит» (item 55, design §4): what lies at the party's place and nobody carries — storages of kind `place`
 * at the current location, with their things and coins. */
export type PileView = { storage: Storage; place: Location | null; items: Item[]; wallet: Record<string, number> };
export function placePilesOf(data: Pick<CampaignSnapshot, "storages" | "items" | "locations" | "publicState">): PileView[] {
  const here = data.publicState.current_location_id;
  if (!here) return [];
  return data.storages
    .filter((storage) => storage.kind === "place" && storage.detail?.locationId === here)
    .map((storage) => ({ storage, place: data.locations.find((row) => row.id === here) ?? null,
      items: data.items.filter((item) => item.storage_id === storage.id && item.quantity > 0).sort((a, b) => a.name.localeCompare(b.name)),
      wallet: walletOfStorage(storage) }));
}
/** The party's mounts with their saddlebags (item 35): a mount carries things and coins, never riders. */
export type MountView = { entity: Entity; storage: Storage | null; items: Item[]; wallet: Record<string, number> };
export function mountsOf(data: Pick<CampaignSnapshot, "entities" | "storages" | "items">): MountView[] {
  return data.entities.filter((row) => row.kind === "mount").map((entity) => {
    const storage = data.storages.find((row) => row.entity_id === entity.id) ?? null;
    const wallet: Record<string, number> = { ...walletOfEntity(entity) };
    for (const [label, amount] of Object.entries(storage ? walletOfStorage(storage) : {})) wallet[label] = (wallet[label] ?? 0) + amount;
    return { entity, storage, wallet, items: storage ? data.items.filter((item) => item.storage_id === storage.id && item.quantity > 0).sort((a, b) => a.name.localeCompare(b.name)) : [] };
  }).sort((a, b) => a.entity.name.localeCompare(b.entity.name));
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

/** FIX_S4 11t (Astra C: «a compact end-of-session summary» instead of the full records every turn): where things stand
 * when a session closes — the hero's hit points and counters, the money, the promises and debts, the open questions —
 * one short line each, from the public records only. */
export type SessionStanding = { resources: string; money: string; promises: string[]; questions: string[] };
export function sessionStanding(data: CampaignSnapshot, threads: readonly string[] = []): SessionStanding | null {
  const hero = heroOf(data);
  if (!hero) return null;
  const { resources } = resourcesOf(hero);
  const hp = hero.max_hp ? `${pick(data.campaign.language === "ru" ? "ru" : "en", "Хиты", "HP")} ${hero.hp}/${hero.max_hp}` : "";
  const counters = resources.map((row) => `${row.label} ${row.value}${row.max !== null ? `/${row.max}` : ""}`);
  const journal = journalOf(data);
  return {
    resources: [hp, ...counters].filter(Boolean).join(" · "),
    money: walletOf(data, hero).map((row) => `${row.value} ${row.title ?? row.label}`).join(", "),
    promises: [...journal.promises, ...journal.debts].map((entry) => entry.quest.title).slice(0, 8),
    questions: (threads.length ? [...threads] : journal.threads.map((entry) => entry.quest.title)).slice(0, 8),
  };
}
