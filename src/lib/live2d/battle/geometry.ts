// Battlefield geometry on a 5-ft grid (Part 2): distances, paths, line of sight,
// cover, light, area templates. Pure and measured, never ruled: the server
// reports what the picture would show («в 10 фт», «укрытие на три четверти», «вне
// света»); the DM and the campaign's system decide what it means.
import type { Cover, Feature, Field, Placement, Zone } from "./contracts.ts";

export type Cell = { x: number; y: number };
const key = (cell: Cell) => `${cell.x},${cell.y}`;

/** Chebyshev distance in cells: a diagonal step counts one (the 5-ft-per-diagonal convention). */
export const cellDistance = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
/** Distance in feet between two placements, elevation added for reach and range. */
export function distanceFeet(a: Placement, b: Placement, feetPerCell = 5): number | null {
  if (a.x === null || a.y === null || b.x === null || b.y === null) return null;
  return cellDistance({ x: a.x, y: a.y }, { x: b.x, y: b.y }) * feetPerCell + Math.abs((a.z ?? 0) - (b.z ?? 0));
}

/** The cells on a straight line from a to b (Bresenham), both ends included. */
export function lineCells(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = [];
  let x = a.x, y = a.y;
  const dx = Math.abs(b.x - a.x), dy = -Math.abs(b.y - a.y);
  const sx = a.x < b.x ? 1 : -1, sy = a.y < b.y ? 1 : -1;
  let err = dx + dy;
  for (let guard = 0; guard < 10_000; guard++) {
    cells.push({ x, y });
    if (x === b.x && y === b.y) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
  return cells;
}

const featureAt = (field: Field, cell: Cell, kind?: Feature["kind"]) =>
  field.features.filter((row) => (!kind || row.kind === kind) && row.cells.some(([x, y]) => x === cell.x && y === cell.y));
const COVER_RANK: Record<Cover, number> = { half: 1, "three-quarters": 2, full: 3 };

/** Line of sight and the best cover between two cells: a wall or full cover on the line blocks;
 * half and three-quarters cover on the line (not at either end) shield the target. */
export function sight(field: Field, from: Cell, to: Cell): { visible: boolean; cover: Cover | null; blockedBy: Feature | null; coverBy: Feature | null } {
  const cells = lineCells(from, to);
  let cover: Cover | null = null, coverBy: Feature | null = null;
  for (const cell of cells.slice(1, -1)) {
    for (const feature of featureAt(field, cell)) {
      if (feature.kind === "wall" || (feature.kind === "cover" && feature.cover === "full")) return { visible: false, cover: "full", blockedBy: feature, coverBy: feature };
      if (feature.kind === "cover" && feature.cover && (!cover || COVER_RANK[feature.cover] > COVER_RANK[cover])) { cover = feature.cover; coverBy = feature; }
    }
  }
  return { visible: true, cover, blockedBy: null, coverBy };
}

export type Light = "bright" | "dim" | "dark";
/** The light on a cell: bright within a source's radius, dim within its dim radius, else the ambient. */
export function lightAt(field: Field, cell: Cell): { light: Light; source: Feature | null } {
  let best: Light = field.ambient, source: Feature | null = null;
  const rank: Record<Light, number> = { dark: 0, dim: 1, bright: 2 };
  for (const feature of field.features) {
    if (feature.kind !== "light" && feature.kind !== "burning") continue;
    const radius = feature.radiusFeet ?? (feature.kind === "burning" ? 10 : 20);
    const dim = feature.dimRadiusFeet ?? radius * 2;
    const nearest = Math.min(...feature.cells.map(([x, y]) => cellDistance(cell, { x, y }) * field.grid.feetPerCell));
    const here: Light | null = nearest <= radius ? "bright" : nearest <= dim ? "dim" : null;
    if (here && rank[here] > rank[best]) { best = here; source = feature; }
  }
  return { light: best, source };
}

/** Hazards and ground under a cell. */
export function groundAt(field: Field, cell: Cell): { difficult: boolean; burning: boolean; elevationFeet: number; features: Feature[] } {
  const here = featureAt(field, cell);
  return {
    difficult: here.some((row) => row.kind === "difficult"),
    burning: here.some((row) => row.kind === "burning"),
    elevationFeet: here.filter((row) => row.kind === "elevation").reduce((sum, row) => sum + (row.heightFeet ?? 5), 0),
    features: here,
  };
}

/** A straight move's cost in feet: each cell entered costs one step, doubled on difficult ground;
 * a wall cannot be entered. The cells crossed and the hazards met are reported. */
export function moveCost(field: Field, from: Cell, to: Cell): { feet: number; cells: Cell[]; blocked: Feature | null; crossed: Feature[] } {
  const cells = lineCells(from, to);
  let feet = 0;
  const crossed = new Map<string, Feature>();
  for (const cell of cells.slice(1)) {
    const ground = groundAt(field, cell);
    const wall = ground.features.find((row) => row.kind === "wall");
    if (wall) return { feet, cells, blocked: wall, crossed: [...crossed.values()] };
    feet += field.grid.feetPerCell * (ground.difficult ? 2 : 1);
    for (const feature of ground.features) if (feature.kind !== "elevation") crossed.set(feature.key, feature);
  }
  return { feet, cells, blocked: null, crossed: [...crossed.values()] };
}

/** The zone a placement reads as from a viewer: adjacent → nearby («вплотную»), within 30 ft → nearby («рядом»),
 * beyond → far; cover when the best cover from the viewer is at least half. Both views derive from this. */
export function zoneFrom(field: Field, viewer: Placement, target: Placement): { zone: Zone; feet: number | null; cover: Cover | null; visible: boolean } {
  const feet = distanceFeet(viewer, target, field.grid.feetPerCell);
  if (feet === null || viewer.x === null || viewer.y === null || target.x === null || target.y === null) return { zone: target.position, feet: null, cover: null, visible: true };
  const look = sight(field, { x: viewer.x, y: viewer.y }, { x: target.x, y: target.y });
  const zone: Zone = look.cover ? "cover" : feet > 30 ? "far" : "nearby";
  return { zone, feet, cover: look.cover, visible: look.visible };
}

/** Cells inside a sphere (radius in feet) around a centre cell, or along a line (length, width 5 ft) from an origin towards a point. */
export function sphereCells(field: Field, centre: Cell, radiusFeet: number): Cell[] {
  const r = Math.floor(radiusFeet / field.grid.feetPerCell);
  const out: Cell[] = [];
  for (let y = Math.max(0, centre.y - r); y <= Math.min(field.grid.rows - 1, centre.y + r); y++)
    for (let x = Math.max(0, centre.x - r); x <= Math.min(field.grid.cols - 1, centre.x + r); x++)
      if (Math.hypot(x - centre.x, y - centre.y) <= r + 0.5) out.push({ x, y });
  return out;
}
export function lineTemplateCells(field: Field, origin: Cell, towards: Cell, lengthFeet: number): Cell[] {
  const steps = Math.floor(lengthFeet / field.grid.feetPerCell);
  const dx = towards.x - origin.x, dy = towards.y - origin.y;
  const length = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
  const end = { x: Math.round(origin.x + (dx / length) * steps), y: Math.round(origin.y + (dy / length) * steps) };
  return lineCells(origin, end).slice(1).filter((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < field.grid.cols && cell.y < field.grid.rows);
}
/** Which placements stand inside a set of cells. */
export function caught(cells: readonly Cell[], placements: readonly { id: string; placement: Placement }[]): string[] {
  const set = new Set(cells.map(key));
  return placements.filter((row) => row.placement.x !== null && row.placement.y !== null && set.has(key({ x: row.placement.x, y: row.placement.y }))).map((row) => row.id);
}
/** Foes adjacent to a cell with their reaction unspent: opportunity-attack candidates when leaving it. */
export function adjacentIds(field: Field, cell: Cell, others: readonly { id: string; placement: Placement }[]): string[] {
  return others.filter((row) => row.placement.x !== null && row.placement.y !== null && cellDistance(cell, { x: row.placement.x, y: row.placement.y }) <= 1).map((row) => row.id);
}
export const insideGrid = (field: Field, cell: Cell) => Number.isInteger(cell.x) && Number.isInteger(cell.y) && cell.x >= 0 && cell.y >= 0 && cell.x < field.grid.cols && cell.y < field.grid.rows;
