// Fix S3-accept Д3: the markers of a painted region sit on their objects, checked by the same mismatch control the
// scenes use. The vision check reads the picture against the DM's prep (every settlement and landmark the prep
// places must be there; nothing the design lacks), locates each place, and a place inside a settlement must be
// drawn inside it — a guard post found at a bridge downstream is a mismatch, and its marker goes into its village.
// Pure helpers: the check's request (parsed by the scenes' own parser), the verdict, the markers saved with the map,
// and the client's overlay (the saved markers, then the prep's spots, then «положение примерное»).
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { RegionMap, RegionMarker, RegionPrep, SceneCheck } from "./contracts.ts";
import { childPlaces, type Live2dPin } from "./hierarchy.ts";
import { APPROXIMATE_BELOW, parseCheckReply } from "./scene.ts";

/** One place the check looks for: `required` for a landmark the prep places; a place inside a settlement is located
 * when visible and must lie within its settlement. `x`, `y` are the prep's spot (the settlement's for a place in it). */
export type RegionCheckItem = { key: string; locationId: string; name: string; description: string; required: boolean; within: string | null; x: number | null; y: number | null; depth: number };
/** A place drawn inside a settlement stays within this distance of the settlement's own spot. */
export const INNER_RADIUS = 0.09;
/** A landmark found this far from the prep's spot is drawn in the wrong place. */
export const MISPLACED_BEYOND = 0.3;

export function regionCheckItems(prep: RegionPrep, names: ReadonlyMap<string, string>): RegionCheckItem[] {
  const placed = prep.places.filter((row) => names.get(row.locationId));
  const byId = new Map(placed.map((row) => [row.locationId, row]));
  const depthOf = (id: string) => { let depth = 0, cursor = byId.get(id)?.within ?? null; while (cursor && byId.has(cursor) && depth < 6) { depth += 1; cursor = byId.get(cursor)!.within; } return depth; };
  const spotOf = (id: string): { x: number | null; y: number | null } => {
    let row = byId.get(id);
    for (let step = 0; row && row.within && byId.has(row.within) && step < 6; step++) row = byId.get(row.within);
    return { x: row?.x ?? null, y: row?.y ?? null };
  };
  return placed.map((row, index) => {
    const depth = depthOf(row.locationId);
    const spot = spotOf(row.locationId);
    const parent = depth ? byId.get(row.within!) ?? null : null;
    const description = [row.look || row.role, parent ? `inside ${names.get(parent.locationId)}` : ""].filter(Boolean).join(", ");
    return { key: `p${index + 1}`, locationId: row.locationId, name: names.get(row.locationId)!, description, required: depth === 0 && spot.x !== null,
      within: parent?.locationId ?? null, x: spot.x, y: spot.y, depth };
  }).filter((row) => row.x !== null).sort((a, b) => a.depth - b.depth);
}

/** The picture's size in pixels: the check asks for pixel positions of a picture whose size it is told (a vision model
 * places a landmark far better in pixels than in fractions), converted back to fractions on parse. */
export type PictureSize = { width: number; height: number };
/** The check's request: the scenes' JSON shape (items, contradictions), worded for a painted map. */
export function regionCheckRequest(items: readonly RegionCheckItem[], regionName: string, size: PictureSize | null = null) {
  const required = items.filter((row) => row.required), optional = items.filter((row) => !row.required);
  const position = size
    ? `x, y: its centre in pixels from the top-left corner of the picture, which is ${size.width} pixels wide and ${size.height} pixels high (x from 0 to ${size.width}, y from 0 to ${size.height}); null when not visible.`
    : "x, y: its centre as fractions of the picture's width and height from the top-left (0..1), null when not visible.";
  const system = [
    "You check a painted map of a region against the game master's design for an illustrated role-playing game. Be exact and literal: the app puts a marker on each place where you find it, and a player relies on it.",
    "Reply with one JSON object only, no prose:",
    `{"items":[{"key":"...","visible":true,"x":${size ? Math.round(size.width / 2) : 0.5},"y":${size ? Math.round(size.height / 2) : 0.5},"confidence":0.9}],"contradictions":[{"what":"...","detail":"..."}],"peopleInBackground":false}`,
    `items: one entry per key given below, in that order. visible: true only if that landmark is clearly drawn and a player could point at it. ${position} For a place said to be inside a settlement, give where it is drawn — inside the settlement if it is there, or wherever else it was drawn; null when the settlement shows no such part. confidence: 0..1.`,
    "contradictions: prominent settlements, castles, towers, bridges or other structures the design does not have, which a player would take for a real place — not terrain, forests, fields, rivers or roads. Empty when none.",
  ].join("\n");
  const text = [
    `The region: ${regionName || "the region the travellers know"}.`,
    required.length ? `Landmarks the design places (key — what it is — where it should be): ${required.map((row) => `${row.key} — ${row.name}: ${row.description || "a landmark"} — ${spotWords(row.x!, row.y!)}`).join("; ")}.` : "",
    optional.length ? `Places inside a settlement, to locate when drawn (key — what it is): ${optional.map((row) => `${row.key} — ${row.name}: ${row.description}`).join("; ")}.` : "",
  ].filter(Boolean).join("\n");
  return { system, text, keys: items.map((row) => row.key) };
}
const spotWords = (x: number, y: number) => `${y < 0.33 ? "north" : y > 0.66 ? "south" : "middle"}, ${x < 0.33 ? "west" : x > 0.66 ? "east" : "centre"}`;

export function parseRegionCheck(text: string, items: readonly RegionCheckItem[], model: string, costUsdMicros: number, checkedAt: string, size: PictureSize | null = null): SceneCheck | null {
  const keys = items.map((row) => row.key);
  if (!size) return parseCheckReply(text, keys, model, costUsdMicros, checkedAt);
  // Pixels back to fractions of the picture (the scenes' parser keeps only unit positions).
  const end = text.lastIndexOf("}");
  for (let start = text.lastIndexOf("{", end); start >= 0; start = text.lastIndexOf("{", start - 1)) {
    let raw: unknown;
    try { raw = JSON.parse(text.slice(start, end + 1)); } catch { if (start === 0) break; continue; }
    if (!raw || typeof raw !== "object" || !Array.isArray((raw as { items?: unknown }).items)) { if (start === 0) break; continue; }
    const unit = (value: unknown, span: number) => (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= span ? Number((value / span).toFixed(4)) : null);
    const converted = { ...(raw as Record<string, unknown>), items: ((raw as { items: unknown[] }).items).map((row) => {
      const r = row && typeof row === "object" ? row as Record<string, unknown> : {};
      return { ...r, x: unit(r.x, size.width), y: unit(r.y, size.height) };
    }) };
    return parseCheckReply(JSON.stringify(converted), keys, model, costUsdMicros, checkedAt);
  }
  return null;
}

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
type Spot = { x: number; y: number };

/** Where each place sits on the picture: a landmark the check found → on it (the player sees it there; a spot far
 * from the prep's is the verdict's mismatch); a place inside a settlement found inside it → there, found elsewhere
 * or not found → inside its settlement, fanned around the settlement's spot; a landmark the check did not find →
 * the prep's spot, approximate. */
export function regionMarkers(items: readonly RegionCheckItem[], check: SceneCheck | null): RegionMarker[] {
  const found = new Map<string, { x: number; y: number; confidence: number }>();
  for (const row of check?.items ?? []) if (row.visible && row.x !== null && row.y !== null) found.set(row.key, { x: row.x, y: row.y, confidence: row.confidence });
  const spots = new Map<string, Spot>();
  const out: RegionMarker[] = [];
  const siblings = new Map<string, number>();
  for (const item of [...items].sort((a, b) => a.depth - b.depth)) {
    const hit = found.get(item.key);
    const parent = item.within ? spots.get(item.within) ?? null : null;
    if (!item.within || !parent) {
      const prep = { x: item.x!, y: item.y! };
      const ok = !!hit && !item.within;
      const spot = ok ? { x: hit!.x, y: hit!.y } : prep;
      spots.set(item.locationId, spot);
      out.push({ locationId: item.locationId, x: round(spot.x), y: round(spot.y), confidence: ok ? round(hit!.confidence) : null, source: ok ? "check" : "prep", approximate: !ok || hit!.confidence < APPROXIMATE_BELOW });
      continue;
    }
    const index = siblings.get(item.within!) ?? 0;
    siblings.set(item.within!, index + 1);
    if (hit && distance(hit, parent) <= INNER_RADIUS) {
      // Found inside its settlement; a spot right on the settlement's own marker moves a little aside so both read.
      const spot = distance(hit, parent) < 0.02 ? fan(parent, index) : { x: round(hit.x), y: round(hit.y) };
      spots.set(item.locationId, spot);
      out.push({ locationId: item.locationId, x: spot.x, y: spot.y, confidence: round(hit.confidence), source: "check", approximate: hit.confidence < APPROXIMATE_BELOW });
      continue;
    }
    const spot = fan(parent, index);
    spots.set(item.locationId, spot);
    out.push({ locationId: item.locationId, x: spot.x, y: spot.y, confidence: null, source: "prep", approximate: true });
  }
  return out;
}
const round = (value: number) => Number(Math.min(1, Math.max(0, value)).toFixed(3));
/** A spot inside a settlement, around its centre: the n-th part on a small ring. */
function fan(parent: Spot, index: number): Spot {
  const angle = -Math.PI / 2 + index * 2.1;
  const radius = 0.035 + (index % 3) * 0.01;
  return { x: round(parent.x + Math.cos(angle) * radius), y: round(parent.y + Math.sin(angle) * radius * 1.4) };
}

/** The verdict: what the picture missed, what it put elsewhere (a place drawn outside its settlement), what it
 * invented; the side list names them in the campaign's language. */
export function regionVerdict(items: readonly RegionCheckItem[], check: SceneCheck, language: "ru" | "en") {
  const found = new Map(check.items.filter((row) => row.visible && row.x !== null && row.y !== null).map((row) => [row.key, { x: row.x!, y: row.y! }]));
  const markers = regionMarkers(items, check);
  const spotOf = (id: string) => markers.find((row) => row.locationId === id) ?? null;
  const required = items.filter((row) => row.required);
  const missing = required.filter((row) => !found.has(row.key));
  const misplaced = items.filter((row) => {
    const hit = found.get(row.key);
    if (!hit) return false;
    if (!row.within) return distance(hit, { x: row.x!, y: row.y! }) > MISPLACED_BEYOND;
    const parent = spotOf(row.within);
    return !!parent && distance(hit, parent) > INNER_RADIUS;
  });
  const contradictions = check.contradictions.map((row) => row.what);
  const ru = language === "ru";
  const nameOf = (id: string | null) => items.find((row) => row.locationId === id)?.name ?? "";
  const sideList = [...missing.map((row) => row.name),
    ...misplaced.map((row) => (row.within ? (ru ? `${row.name} — не в ${nameOf(row.within)}` : `${row.name} — not in ${nameOf(row.within)}`) : (ru ? `${row.name} — не на своём месте` : `${row.name} — out of place`)))];
  return { ok: !missing.length && !misplaced.length && !contradictions.length, missing, misplaced, contradictions, found: required.length - missing.length, required: required.length, sideList };
}

export type MapMarker = Live2dPin & { parentId: string | null };
/** The client's markers on the region: the saved markers of the painted map; a place the map does not know yet
 * at the prep's spot (no picture) or along the bottom edge («положение примерное»); the places inside each
 * settlement as small markers within it. */
export function regionMapMarkers(tree: CampaignSnapshot, pins: readonly Live2dPin[], map: Pick<RegionMap, "pictureId" | "markers" | "prep"> | null): { pins: MapMarker[]; inner: MapMarker[] } {
  const saved = new Map((map?.markers ?? []).map((row) => [row.locationId, row]));
  const prep = new Map((map?.prep?.places ?? []).filter((row) => row.x !== null && row.y !== null).map((row) => [row.locationId, row]));
  const painted = !!map?.pictureId;
  const homeless: MapMarker[] = [];
  const top = pins.map((pin): MapMarker => {
    const marker = saved.get(pin.locationId);
    if (marker) return { ...pin, x: marker.x, y: marker.y, approximate: marker.approximate, parentId: null };
    const spot = prep.get(pin.locationId);
    if (!painted && spot) return { ...pin, x: spot.x!, y: spot.y!, approximate: false, parentId: null };
    if (!painted) return { ...pin, parentId: null };
    const row: MapMarker = { ...pin, approximate: true, parentId: null };
    homeless.push(row);
    return row;
  });
  homeless.forEach((row, index) => { row.x = Number(((index + 1) / (homeless.length + 1)).toFixed(3)); row.y = 0.92; });
  const inner = top.flatMap((parent) => childPlaces(tree, parent.locationId).map((child, index): MapMarker => {
    const marker = saved.get(child.id);
    const spot = marker ?? fan(parent, index);
    return { locationId: child.id, name: child.name, status: child.status, x: spot.x, y: spot.y, hasChildren: childPlaces(tree, child.id).length > 0,
      approximate: marker ? marker.approximate : true, parentId: parent.locationId };
  }));
  return { pins: top, inner };
}
