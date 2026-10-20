// Part 2 (docs/stages/LIVE2D_1.md): the combat state the server holds. It lives in
// the existing encounter records — per combatant in `public_resources` and
// `public_position`, the battlefield in the encounter's `public_field` — so the
// turn's commit stays atomic and the play projection carries it to every client.
// Old rows (no coordinates, an empty field) read as «no map»; the zones view and
// the map view both derive from the same coordinates and never disagree.
// No D&D rules are hard-coded: the grid is 5-ft cells, movement, conditions and
// the action economy are words and numbers the DM supplies from the campaign's
// system as knowledge; the server only measures.
import type { JsonObject } from "../../gameplay/contracts.ts";

export type Side = "party" | "foe" | "other";
export const SIDES: Side[] = ["party", "foe", "other"];
export type Economy = { action: boolean; bonus: boolean; reaction: boolean; moveFeet: number; moveMaxFeet: number };
export type Combatant = {
  initiative: number | null;
  active: boolean;
  side: Side;
  economy: Economy;
  /** Free words from the system: prone, paralysed, concentrating, surprised, fled, unconscious, dying, dead… */
  conditions: string[];
  deathSaves: { success: number; fail: number } | null;
  /** Enemies and animals: the stat block's HP, mirrored here for the map; party HP stays on the entity. */
  hp: { current: number; max: number } | null;
  /** «Что известно»: lines revealed by knowledge checks or observation; unrevealed lines show as «???». */
  known: { text: string; revealed: boolean }[];
  /** The enemy's intent, shown only when someone in the party noticed it. */
  intent: { text: string; noticedBy: string | null } | null;
  /** Kept for the older readers of the encounter panel. */
  defending: boolean;
  withdrawn: boolean;
};
export type Zone = "nearby" | "far" | "cover";
export type Placement = { position: Zone; x: number | null; y: number | null; z: number };
export type FeatureKind = "cover" | "difficult" | "light" | "burning" | "wall" | "elevation";
export const FEATURE_KINDS: FeatureKind[] = ["cover", "difficult", "light", "burning", "wall", "elevation"];
export type Cover = "half" | "three-quarters" | "full";
export const COVERS: Cover[] = ["half", "three-quarters", "full"];
export type Feature = {
  key: string;
  kind: FeatureKind;
  label: string;
  cells: [number, number][];
  cover?: Cover;
  radiusFeet?: number;
  dimRadiusFeet?: number;
  heightFeet?: number;
};
export type Ambient = "bright" | "dim" | "dark";
export type LogLine = { round: number; actor: string; what: string; result: string; ref: string | null };
export type PendingReaction = { targetId: string; trigger: string; options: string[] } | null;
export type Field = {
  grid: { cols: number; rows: number; feetPerCell: number };
  locationId: string | null;
  features: Feature[];
  ambient: Ambient;
  activeParticipantId: string | null;
  turnInRound: number;
  /** The planned opening: the party's declared action resolves before initiative (the owner's house rule). */
  opening: "party" | null;
  pendingReaction: PendingReaction;
  log: LogLine[];
};

export const DEFAULT_GRID = { cols: 24, rows: 18, feetPerCell: 5 } as const;
export const MAX_LOG = 40;
export const defaultEconomy = (moveMaxFeet = 30): Economy => ({ action: true, bonus: true, reaction: true, moveFeet: moveMaxFeet, moveMaxFeet });

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const KEY = /^[a-z0-9][a-z0-9_-]{0,59}$/;

/** The combatant of a participant row; an old row (`{action:1, move:1, …}`) reads with defaults. */
export function parseCombatant(raw: unknown, fallback: { side: Side; active?: boolean } = { side: "other" }): Combatant {
  const v = isRecord(raw) ? raw : {};
  const economy = isRecord(v.economy) ? v.economy : {};
  const legacyMove = typeof v.move === "number" ? v.move > 0 : true;
  const moveMax = int(economy.moveMaxFeet, 30);
  return {
    initiative: typeof v.initiative === "number" && Number.isFinite(v.initiative) ? v.initiative : null,
    active: bool(v.active, fallback.active ?? false),
    side: SIDES.includes(v.side as Side) ? (v.side as Side) : fallback.side,
    economy: {
      action: bool(economy.action, typeof v.action === "number" ? v.action > 0 : true),
      bonus: bool(economy.bonus, true),
      reaction: bool(economy.reaction, typeof v.reaction === "number" ? v.reaction > 0 : true),
      moveFeet: Math.max(0, int(economy.moveFeet, legacyMove ? moveMax : 0)),
      moveMaxFeet: Math.max(0, moveMax),
    },
    conditions: Array.isArray(v.conditions) ? v.conditions.map((row) => str(row, 40)).filter(Boolean).slice(0, 12) : [],
    deathSaves: isRecord(v.deathSaves) ? { success: Math.min(3, Math.max(0, int(v.deathSaves.success, 0))), fail: Math.min(3, Math.max(0, int(v.deathSaves.fail, 0))) } : null,
    hp: isRecord(v.hp) && typeof v.hp.current === "number" && typeof v.hp.max === "number" ? { current: Math.round(v.hp.current), max: Math.max(1, Math.round(v.hp.max)) } : null,
    known: Array.isArray(v.known) ? v.known.flatMap((row) => (isRecord(row) && str(row.text, 200) ? [{ text: str(row.text, 200), revealed: row.revealed === true }] : [])).slice(0, 12) : [],
    intent: isRecord(v.intent) && str(v.intent.text, 200) ? { text: str(v.intent.text, 200), noticedBy: typeof v.intent.noticedBy === "string" ? v.intent.noticedBy : null } : null,
    defending: bool(v.defending, false),
    withdrawn: bool(v.withdrawn, false),
  };
}
export function combatantJson(row: Combatant): JsonObject {
  return { ...row, deathSaves: row.deathSaves, hp: row.hp, intent: row.intent, known: row.known.map((line) => ({ ...line })),
    conditions: [...row.conditions], economy: { ...row.economy },
    // The old readers' numbers (the encounter panel of the game screen).
    action: row.economy.action ? 1 : 0, move: row.economy.moveFeet > 0 ? 1 : 0, reaction: row.economy.reaction ? 1 : 0 } as JsonObject;
}
export function parsePlacement(raw: unknown): Placement {
  const v = isRecord(raw) ? raw : {};
  const x = typeof v.x === "number" && Number.isInteger(v.x) && v.x >= 0 ? v.x : null;
  const y = typeof v.y === "number" && Number.isInteger(v.y) && v.y >= 0 ? v.y : null;
  return { position: v.position === "far" || v.position === "cover" ? v.position : "nearby", x: x !== null && y !== null ? x : null, y: x !== null && y !== null ? y : null, z: int(v.z, 0) };
}
export const placementJson = (row: Placement): JsonObject => ({ position: row.position, x: row.x, y: row.y, z: row.z });

export function parseFeature(raw: unknown): Feature | null {
  if (!isRecord(raw) || !KEY.test(String(raw.key)) || !FEATURE_KINDS.includes(raw.kind as FeatureKind)) return null;
  const cells = Array.isArray(raw.cells) ? raw.cells.flatMap((cell) => (Array.isArray(cell) && cell.length === 2 && Number.isInteger(cell[0]) && Number.isInteger(cell[1]) && cell[0] >= 0 && cell[1] >= 0 ? [[cell[0], cell[1]] as [number, number]] : [])).slice(0, 400) : [];
  if (!cells.length) return null;
  const feature: Feature = { key: String(raw.key), kind: raw.kind as FeatureKind, label: str(raw.label, 80) || String(raw.key), cells };
  if (COVERS.includes(raw.cover as Cover)) feature.cover = raw.cover as Cover;
  if (typeof raw.radiusFeet === "number" && raw.radiusFeet > 0) feature.radiusFeet = Math.round(raw.radiusFeet);
  if (typeof raw.dimRadiusFeet === "number" && raw.dimRadiusFeet > 0) feature.dimRadiusFeet = Math.round(raw.dimRadiusFeet);
  if (typeof raw.heightFeet === "number" && raw.heightFeet !== 0) feature.heightFeet = Math.round(raw.heightFeet);
  if (feature.kind === "cover" && !feature.cover) feature.cover = "half";
  return feature;
}
export function parseField(raw: unknown): Field {
  const v = isRecord(raw) ? raw : {};
  const grid = isRecord(v.grid) ? v.grid : {};
  const reaction = isRecord(v.pendingReaction) && typeof v.pendingReaction.targetId === "string" ? v.pendingReaction : null;
  return {
    grid: { cols: Math.min(60, Math.max(4, int(grid.cols, DEFAULT_GRID.cols))), rows: Math.min(60, Math.max(4, int(grid.rows, DEFAULT_GRID.rows))), feetPerCell: Math.max(1, int(grid.feetPerCell, DEFAULT_GRID.feetPerCell)) },
    locationId: typeof v.locationId === "string" ? v.locationId : null,
    features: Array.isArray(v.features) ? v.features.map(parseFeature).filter((row): row is Feature => row !== null).slice(0, 40) : [],
    ambient: v.ambient === "dim" || v.ambient === "dark" ? v.ambient : "bright",
    activeParticipantId: typeof v.activeParticipantId === "string" ? v.activeParticipantId : null,
    turnInRound: Math.max(0, int(v.turnInRound, 0)),
    opening: v.opening === "party" ? "party" : null,
    pendingReaction: reaction ? { targetId: String(reaction.targetId), trigger: str(reaction.trigger, 240), options: Array.isArray(reaction.options) ? reaction.options.map((row) => str(row, 120)).filter(Boolean).slice(0, 4) : [] } : null,
    log: Array.isArray(v.log) ? v.log.flatMap((row) => (isRecord(row) ? [{ round: int(row.round, 0), actor: str(row.actor, 80), what: str(row.what, 160), result: str(row.result, 160), ref: typeof row.ref === "string" ? row.ref : null }] : [])).slice(-MAX_LOG) : [],
  };
}
export const fieldJson = (field: Field): JsonObject => structuredClone(field) as unknown as JsonObject;
/** A field that was never set up on a grid (old encounters, the Astra path): no map, zones only. */
export const hasMap = (field: Field, placements: readonly Placement[]) => placements.some((row) => row.x !== null) || field.features.length > 0;
