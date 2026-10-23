// Fix run after session 2, stage D (§7, §9 of docs/runs/fix-s2-inventory-design.md): the character sheet of schema 2 —
// the hero's sheet changing in play (the DM's path: level up, prepared spells, a changed line) and a companion's or an
// NPC's sheet written from its 5e stat block, shown with the same view as the hero's. The limits are the database's
// (rpg_private.sheet_valid, migration 76): lines up to 200 characters and each once, spells by name once.
import type { CharacterSheetV1 } from "../adventures/bootstrap-contracts.ts";
import { spellId, type SpellRecord } from "./model.ts";

export type CharacterSheetV2 = {
  schemaVersion: 2;
  mode: "structured_rpg" | "narrative";
  role: string | null;
  background?: string;
  level?: number | null;
  tier?: string | null;
  attributes?: CharacterSheetV1["attributes"];
  skills?: string[];
  abilities?: string[];
  limitations?: string[];
  saves?: string[];
  attacks?: string[];
  speed?: string | null;
  armorClass?: number | null;
  spells?: SpellRecord[];
  preparedMax?: number | null;
};
export type AnySheet = CharacterSheetV1 | CharacterSheetV2;
/** What a call may change: the fields given replace the stored ones; spells are added or updated by name. */
export type SheetPatch = Partial<Pick<CharacterSheetV2, "level" | "armorClass" | "speed" | "skills" | "saves" | "attacks" | "abilities" | "preparedMax">> & {
  /** Fix S3-accept В1: a spell's `history` given as one line (the DM's «переписано со свитка») is appended to its history. */
  spells?: (Omit<SpellRecord, "history"> & { history?: string[] | string })[];
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HISTORY = 12;

const LINE = 200;
const lines = (value: unknown, max: number): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const raw of value) {
    const line = typeof raw === "string" ? raw.trim().slice(0, LINE) : "";
    if (line && !out.includes(line) && !/^(world[.:]|loot[.:]|trade[.:]|can:)/i.test(line)) out.push(line);
  }
  return out.slice(0, max);
};
const bounded = (value: unknown, lo: number, hi: number): number | null =>
  typeof value === "number" && Number.isInteger(value) && value >= lo && value <= hi ? value : null;
const text = (value: unknown, max: number): string | undefined => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined);

function spell(raw: NonNullable<SheetPatch["spells"]>[number]): SpellRecord | null {
  const name = text(raw?.name, 120);
  const level = bounded(raw?.level, 0, 9);
  if (!name || level === null) return null;
  const out: SpellRecord = { name, level };
  for (const key of ["castingTime", "range", "components", "duration", "saveOrAttack", "damage"] as const) { const v = text(raw[key], 160); if (v) out[key] = v; }
  const higher = text(raw.higherLevels, 800); if (higher) out.higherLevels = higher;
  const body = text(raw.text, 2400); if (body) out.text = body;
  for (const key of ["ritual", "concentration", "known", "prepared"] as const) if (typeof raw[key] === "boolean") out[key] = raw[key];
  // Fix S3-accept В1: the id (its picture's subject), the school and the history (the database's limits, migration 202610230511).
  if (typeof raw.id === "string" && UUID.test(raw.id)) out.id = raw.id.toLowerCase();
  const school = text(raw.school, 60); if (school) out.school = school;
  const history = (Array.isArray(raw.history) ? raw.history : [raw.history]).map((line) => text(line, 200)).filter((line): line is string => !!line);
  if (history.length) out.history = [...new Set(history)].slice(-HISTORY);
  return out;
}
/** A spell written by a call: the stored fields it does not give stay; its history lines are added to the stored ones;
 * it keeps its id (or gets the one its name gives). */
function mergeSpell(stored: SpellRecord | undefined, row: SpellRecord): SpellRecord {
  const history = [...new Set([...(stored?.history ?? []), ...(row.history ?? [])])].slice(-HISTORY);
  return { ...(stored ?? {}), ...row, id: row.id ?? stored?.id ?? spellId(row.name), ...(history.length ? { history } : {}) };
}

/** The sheet after a patch: a schema-1 sheet (or none) becomes schema 2 with its lines kept. */
export function patchSheet(current: AnySheet | null | undefined, patch: SheetPatch): CharacterSheetV2 {
  const base: CharacterSheetV2 = current
    ? { schemaVersion: 2, mode: current.mode, role: current.role, background: current.background ?? "", level: current.level ?? null, tier: current.tier ?? null,
      attributes: current.attributes ?? null, skills: current.skills ?? [], abilities: current.abilities ?? [], limitations: current.limitations ?? [],
      ...(current.schemaVersion === 2 ? { saves: current.saves, attacks: current.attacks, speed: current.speed ?? null, armorClass: current.armorClass ?? null,
        spells: current.spells ?? [], preparedMax: current.preparedMax ?? null } : { spells: [] }) }
    : { schemaVersion: 2, mode: "structured_rpg", role: null, background: "", level: null, tier: null, attributes: null, skills: [], abilities: [], limitations: [], spells: [] };
  const next: CharacterSheetV2 = { ...base };
  if (patch.level !== undefined) next.level = bounded(patch.level, 0, 30);
  if (patch.armorClass !== undefined) next.armorClass = bounded(patch.armorClass, 1, 40);
  if (patch.preparedMax !== undefined) next.preparedMax = bounded(patch.preparedMax, 0, 60);
  if (patch.speed !== undefined) next.speed = text(patch.speed, 80) ?? null;
  for (const [key, max] of [["skills", 40], ["saves", 12], ["attacks", 12], ["abilities", 40]] as const) {
    const given = lines(patch[key], max);
    if (given) next[key] = given;
  }
  if (Array.isArray(patch.spells)) {
    const byName = new Map((next.spells ?? []).map((row) => [row.name.toLocaleLowerCase(), row]));
    for (const raw of patch.spells) {
      const row = spell(raw);
      if (row) byName.set(row.name.toLocaleLowerCase(), mergeSpell(byName.get(row.name.toLocaleLowerCase()), row));
    }
    next.spells = [...byName.values()].slice(0, 160);
  }
  return next;
}

/** One line of what changed, in the campaign language («уровень 8 → 9; подготовлено: Огненный шар»). */
export function sheetChanges(before: AnySheet | null | undefined, after: CharacterSheetV2, language: unknown): string {
  const ru = language === "ru";
  const parts: string[] = [];
  const old = before && before.schemaVersion === 2 ? before : null;
  if ((before?.level ?? null) !== (after.level ?? null)) parts.push(ru ? `уровень ${before?.level ?? "—"} → ${after.level ?? "—"}` : `level ${before?.level ?? "—"} → ${after.level ?? "—"}`);
  if ((old?.armorClass ?? null) !== (after.armorClass ?? null) && after.armorClass) parts.push(ru ? `КД ${after.armorClass}` : `AC ${after.armorClass}`);
  const lineDiff = (key: "skills" | "saves" | "attacks" | "abilities", word: [string, string]) => {
    const was = new Set((before as CharacterSheetV2 | null)?.[key] ?? []), now = after[key] ?? [];
    const added = now.filter((line) => !was.has(line));
    if (added.length) parts.push(`${word[ru ? 0 : 1]}: ${added.slice(0, 3).join(", ")}${added.length > 3 ? "…" : ""}`);
  };
  lineDiff("skills", ["навыки", "skills"]); lineDiff("saves", ["спасброски", "saves"]); lineDiff("attacks", ["атаки", "attacks"]); lineDiff("abilities", ["умения", "abilities"]);
  const wasSpells = new Map(((old?.spells) ?? []).map((row) => [row.name.toLocaleLowerCase(), row]));
  const learned = (after.spells ?? []).filter((row) => !wasSpells.has(row.name.toLocaleLowerCase())).map((row) => row.name);
  const prepared = (after.spells ?? []).filter((row) => row.prepared && wasSpells.get(row.name.toLocaleLowerCase())?.prepared === false).map((row) => row.name);
  if (learned.length) parts.push(`${ru ? "заклинания" : "spells"}: ${learned.slice(0, 4).join(", ")}${learned.length > 4 ? "…" : ""}`);
  if (prepared.length) parts.push(`${ru ? "подготовлено" : "prepared"}: ${prepared.slice(0, 4).join(", ")}`);
  return parts.join("; ") || (ru ? "лист обновлён" : "sheet updated");
}

/** The schema-1 view of any sheet, for the screens written before schema 2 (spells as names, lists never absent). */
export function sheetLines(sheet: AnySheet): CharacterSheetV1 {
  if (sheet.schemaVersion === 1) return sheet;
  return { schemaVersion: 1, mode: sheet.mode, role: sheet.role, background: sheet.background ?? "", level: sheet.level ?? null, tier: sheet.tier ?? null,
    attributes: sheet.attributes ?? null, skills: sheet.skills ?? [], abilities: sheet.abilities ?? [], limitations: sheet.limitations ?? [],
    spells: (sheet.spells ?? []).map((spell) => spell.name) };
}
