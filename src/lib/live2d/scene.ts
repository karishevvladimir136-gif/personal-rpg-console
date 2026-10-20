// The scene of a place (slice items 3 and «Quality — the scene must not hallucinate»):
// pure helpers for the sheet, the illustrator's brief with «must show» and «must
// not show», the vision check's verdict, the one corrected redraw, and the POIs
// the locator may place (only what is in the sheet and the records; never an
// invented marker). The paid calls live in server/; this file is testable alone.
import type { CampaignSnapshot } from "../persistence/contracts.ts";
import type { Poi, SceneCheck, SceneSheet, SheetFeature } from "./contracts.ts";
import { KEY_PATTERN, parseSceneSheet } from "./contracts.ts";

/** The records' material for the sheet: the place, its known neighbours and children, who is
 * present, and the narration that mentions the place (public text only; never DM notes). */
export type SheetSource = {
  place: { id: string; name: string; description: string };
  /** Known child places (exits lead to them) and the parent, by name. */
  exits: { id: string; name: string; relation: "child" | "parent" | "neighbour" }[];
  /** People the records put in the place (present now). */
  present: { id: string; name: string; kind: string }[];
  /** Public narration passages that mention the place, newest last. */
  passages: string[];
  timeOfDay: string | null;
  language: "ru" | "en";
};

export function sheetSourceOf(snapshot: CampaignSnapshot, locationId: string, options: { presentIds?: readonly string[]; timeOfDay?: string | null } = {}): SheetSource | null {
  const place = snapshot.locations.find((row) => row.id === locationId && row.campaign_id === snapshot.campaign.id);
  if (!place) return null;
  const known = snapshot.locations.filter((row) => row.campaign_id === snapshot.campaign.id && (row.status === "known" || row.status === "visited"));
  const exits: SheetSource["exits"] = [];
  for (const row of known) {
    if (row.id === place.id) continue;
    if (row.detail?.parentId === place.id) exits.push({ id: row.id, name: row.name, relation: "child" });
    else if (place.detail?.parentId === row.id) exits.push({ id: row.id, name: row.name, relation: "parent" });
    else if (place.detail?.parentId && row.detail?.parentId === place.detail.parentId) exits.push({ id: row.id, name: row.name, relation: "neighbour" });
  }
  const presentIds = new Set(options.presentIds ?? []);
  const present = snapshot.entities
    .filter((row) => row.campaign_id === snapshot.campaign.id && ["player", "companion", "npc"].includes(row.kind) && (presentIds.size ? presentIds.has(row.id) : row.kind !== "npc"))
    .map((row) => ({ id: row.id, name: row.name, kind: row.kind }));
  const needle = place.name.toLocaleLowerCase().slice(0, Math.max(4, place.name.length - 2));
  const passages = snapshot.scenes
    .filter((row) => row.role === "narration" && row.body.toLocaleLowerCase().includes(needle))
    .slice(-6).map((row) => row.body.replace(/\s+/g, " ").trim().slice(0, 1500));
  return { place: { id: place.id, name: place.name, description: place.description }, exits, present, passages, timeOfDay: options.timeOfDay ?? null,
    language: snapshot.settings.values.language === "en" ? "en" : "ru" };
}

/** The request for the sheet: strict JSON, from the records and the narration only. */
export function sheetRequest(source: SheetSource) {
  const system = [
    "You write the scene sheet of one place of an illustrated role-playing campaign: what an illustrator must draw so that the picture never contradicts the story, and a player can click what is there.",
    "Reply with one JSON object only, no prose:",
    "{\"summary\":\"...\",\"features\":[{\"key\":\"...\",\"label\":\"...\",\"kind\":\"entrance|exit|object|feature\",\"description\":\"...\",\"mustShow\":true,\"targetLocationId\":null}],\"people\":[{\"name\":\"...\",\"entityId\":null,\"at\":\"<feature key or null>\"}],\"light\":\"...\",\"timeOfDay\":\"...\",\"never\":[\"...\"],\"crowded\":false}",
    "summary: one paragraph of plain English (60–120 words): the place as the records and the story describe it — materials, size, layout, what is where.",
    "features: 4–10 things the story or the records named — the entrance, exits (doors, a back gate to the yard, stairs, a cellar hatch), a counter, a stall, a shrine, a body, a notable object. key: lowercase letters, digits and dashes, unique. label: the name in the campaign's language, as the player would say it. description: one clause of plain English for the illustrator. mustShow: true for the things the story relies on (at most 6). kind exit: a way to another known place; put its ID in targetLocationId when the known places below name it, else null.",
    "people: the named people the passages put in this place right now, with the feature key they stand at (or null); entityId from the list below when the name matches, else null. People are never drawn into the background: they are shown as tokens.",
    "light: the light sources and their quality, one clause. timeOfDay: the time of day the passages imply, or null. never: things that must not be drawn because the story rules them out or would invent a fact (an invented forge, a second door, a lantern nobody has) — 2–6 items. crowded: true only if the place is said to be full of people (a market).",
    "Use only what the records and passages say; never invent features, people or exits that are not in them. Write summary, description, light and never in English; labels and names in the campaign's language.",
  ].join("\n");
  const user = [
    `The place: ${source.place.name}.`,
    source.place.description ? `The records say: ${source.place.description.replace(/\s+/g, " ").slice(0, 1500)}` : "The records have no description yet.",
    source.exits.length ? `Known places next to it (ID — name — relation): ${source.exits.map((row) => `${row.id} — ${row.name} — ${row.relation}`).join("; ")}.` : "No other known place is tied to it.",
    source.present.length ? `People present (ID — name): ${source.present.map((row) => `${row.id} — ${row.name}`).join("; ")}.` : "Nobody is recorded as present.",
    source.timeOfDay ? `Time of day now: ${source.timeOfDay}.` : "",
    `Campaign language: ${source.language === "ru" ? "Russian" : "English"}.`,
    source.passages.length ? `Narration passages that mention the place (public text):\n${source.passages.map((row, index) => `[${index + 1}] ${row}`).join("\n")}` : "No narration mentions the place yet: use the records alone.",
  ].filter(Boolean).join("\n");
  return { system, user };
}
export function parseSheetReply(text: string): SceneSheet | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const sheet = parseSceneSheet(JSON.parse(text.slice(start, end + 1)));
    return sheet && sheet.features.length ? sheet : null;
  } catch {
    return null;
  }
}
/** A sheet the records give without a model: the place's description, exits as features. Used when
 * the model is not configured or fails; the owner can edit it. */
export function fallbackSheet(source: SheetSource): SceneSheet {
  const features: SheetFeature[] = [{ key: "entrance", label: source.language === "ru" ? "Вход" : "Entrance", kind: "entrance", description: "the way in", mustShow: true, targetLocationId: null }];
  for (const exit of source.exits.slice(0, 6)) {
    const key = `exit-${slug(exit.name)}`;
    if (!features.some((row) => row.key === key)) features.push({ key, label: exit.name, kind: "exit", description: `the way to ${exit.name}`, mustShow: false, targetLocationId: exit.id });
  }
  return { summary: source.place.description.replace(/\s+/g, " ").slice(0, 1200), features, people: source.present.map((row) => ({ name: row.name, entityId: row.id, at: null })),
    light: "", timeOfDay: source.timeOfDay, never: [], crowded: false };
}
export function slug(value: string): string {
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
  const out = [...value.toLocaleLowerCase()].map((char) => map[char] ?? char).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return KEY_PATTERN.test(out) ? out : `f${Math.abs(hash(value)) % 100000}`;
}
function hash(value: string): number {
  let h = 0;
  for (const char of value) h = (Math.imul(h, 31) + (char.codePointAt(0) ?? 0)) | 0;
  return h;
}

export const mustShow = (sheet: SceneSheet) => sheet.features.filter((row) => row.mustShow);

/** The illustrator's brief: a wide, readable composition of the place without people, the key
 * objects separated, nothing invented, no text. `correction`: after a failed check, what to fix. */
export function sceneBrief(sheet: SceneSheet, input: { placeName: string; style: string; correction?: { missing: SheetFeature[]; contradictions: string[] } | null }): string {
  const must = mustShow(sheet);
  const others = sheet.features.filter((row) => !row.mustShow);
  const lines = [
    `A wide establishing illustration of ${input.placeName}, a place in a role-playing story, seen from a slightly raised viewpoint so the whole layout reads at a glance. Pixels only show; nothing here is a game fact.`,
    sheet.summary ? `The place: ${sheet.summary}` : "",
    must.length ? `MUST SHOW, each clearly visible and separated from the others: ${must.map((row) => `${row.description || row.label} (${row.label})`).join("; ")}.` : "",
    others.length ? `Also there, where the layout puts it: ${others.map((row) => row.description || row.label).join("; ")}.` : "",
    sheet.light ? `Light: ${sheet.light}${sheet.timeOfDay ? `, ${sheet.timeOfDay}` : ""}.` : sheet.timeOfDay ? `Time of day: ${sheet.timeOfDay}.` : "",
    sheet.crowded ? "The place is crowded: anonymous background figures, small and unidentifiable, no faces in focus." : "MUST NOT SHOW: no people, no figures, no faces, no silhouettes — the place is empty of people.",
    sheet.never.length ? `MUST NOT SHOW: ${sheet.never.join("; ")}.` : "",
    "No text, letters, signs with writing, labels or captions anywhere. No clutter: the key objects stand apart with room around each.",
    input.correction?.missing.length ? `The previous attempt missed these; draw them unmistakably this time, each large enough to be found: ${input.correction.missing.map((row) => `${row.description || row.label} (${row.label})`).join("; ")}.` : "",
    input.correction?.contradictions.length ? `The previous attempt invented these; leave them out: ${input.correction.contradictions.join("; ")}.` : "",
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}` : "Art style: painterly, warm, readable.",
  ];
  return lines.filter(Boolean).join("\n").slice(0, 8000);
}

/** The vision check's request: every must-show item visible and locatable, no prominent object that
 * contradicts the sheet, no named people in the background. Strict JSON. */
export function checkRequest(sheet: SceneSheet, placeName: string) {
  const must = mustShow(sheet);
  const system = [
    "You check an illustration of a place against its scene sheet for an illustrated role-playing game. Be exact and literal: a clickable scene is a promise that what is drawn is what is there.",
    "Reply with one JSON object only, no prose:",
    "{\"items\":[{\"key\":\"...\",\"visible\":true,\"x\":0.5,\"y\":0.5,\"confidence\":0.9}],\"contradictions\":[{\"what\":\"...\",\"detail\":\"...\"}],\"peopleInBackground\":false}",
    "items: one entry per required feature key given below, in that order. visible: true only if the feature is clearly there and a player could point at it. x, y: the centre of the feature as fractions of the picture's width and height from the top-left (0..1), null when not visible. confidence: 0..1.",
    "contradictions: prominent objects, structures or features in the picture that the sheet rules out or does not mention and that would make the story wrong if a player relied on them (a second door, an invented forge, a staircase, a lantern, a body) — not vegetation, sky, texture, furniture of no consequence or ordinary clutter. Empty when none.",
    "peopleInBackground: true if any recognisable person or face is drawn (anonymous distant crowd figures in a crowded place do not count).",
  ].join("\n");
  const text = [
    `The place: ${placeName}.`,
    `The sheet: ${sheet.summary || "(no summary)"}`,
    `Required features (key — what it is): ${must.map((row) => `${row.key} — ${row.description || row.label}`).join("; ")}.`,
    sheet.features.some((row) => !row.mustShow) ? `Other features that may be there: ${sheet.features.filter((row) => !row.mustShow).map((row) => row.description || row.label).join("; ")}.` : "",
    sheet.never.length ? `Must not be there: ${sheet.never.join("; ")}.` : "",
  ].filter(Boolean).join("\n");
  return { system, text, keys: must.map((row) => row.key) };
}
export function parseCheckReply(text: string, keys: readonly string[], model: string, costUsdMicros: number, checkedAt: string): SceneCheck | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const items = Array.isArray(raw.items) ? raw.items : [];
    const byKey = new Map<string, Record<string, unknown>>();
    for (const row of items) if (row && typeof row === "object" && typeof (row as Record<string, unknown>).key === "string") byKey.set(String((row as Record<string, unknown>).key), row as Record<string, unknown>);
    const unit = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : null);
    return {
      model, costUsdMicros, checkedAt,
      items: keys.map((key) => {
        const row = byKey.get(key);
        const visible = row?.visible === true;
        const x = visible ? unit(row?.x) : null, y = visible ? unit(row?.y) : null;
        return { key, visible: visible && x !== null && y !== null, x: visible ? x : null, y: visible ? y : null, confidence: unit(row?.confidence) ?? (visible ? 0.5 : 0) };
      }),
      contradictions: Array.isArray(raw.contradictions) ? raw.contradictions.flatMap((row) => {
        const r = row as Record<string, unknown>;
        return r && typeof r.what === "string" && r.what.trim() ? [{ what: r.what.trim().slice(0, 120), detail: typeof r.detail === "string" ? r.detail.trim().slice(0, 240) : "" }] : [];
      }).slice(0, 8) : [],
      peopleInBackground: raw.peopleInBackground === true,
    };
  } catch {
    return null;
  }
}

/** The verdict: what the picture missed, what it invented, whether a redraw is due. */
export function sceneVerdict(sheet: SceneSheet, check: SceneCheck) {
  const must = mustShow(sheet);
  const missing = must.filter((row) => !check.items.find((item) => item.key === row.key)?.visible);
  const contradictions = check.contradictions.map((row) => row.what);
  const ok = missing.length === 0 && contradictions.length === 0 && !check.peopleInBackground;
  return { ok, missing, contradictions, people: check.peopleInBackground, found: must.length - missing.length, required: must.length };
}

/** The POI candidates of a place: the sheet's features and exits, the people present (tokens at
 * the feature they stand at), nothing else. The locator may only place these. */
export type PoiCandidate = { key: string; kind: Poi["kind"]; label: string; note: string; description: string; entityId: string | null; targetLocationId: string | null; at: string | null };
export function poiCandidates(sheet: SceneSheet, snapshot: CampaignSnapshot, locationId: string, presentIds: readonly string[] | null): PoiCandidate[] {
  const out: PoiCandidate[] = sheet.features.map((row) => ({
    key: row.key, kind: row.kind === "entrance" || row.kind === "exit" ? "exit" : row.kind, label: row.label, note: row.description, description: row.description,
    entityId: null, targetLocationId: row.targetLocationId && snapshot.locations.some((loc) => loc.id === row.targetLocationId && loc.campaign_id === snapshot.campaign.id) ? row.targetLocationId : null, at: null,
  }));
  const present = presentIds ? new Set(presentIds) : null;
  for (const person of sheet.people) {
    const entity = person.entityId ? snapshot.entities.find((row) => row.id === person.entityId && row.campaign_id === snapshot.campaign.id) : null;
    if (!entity || entity.kind === "player") continue;
    if (present && !present.has(entity.id)) continue;
    const key = `person-${slug(entity.name)}`;
    if (out.some((row) => row.key === key)) continue;
    out.push({ key, kind: "person", label: entity.name, note: entity.details.replace(/\s+/g, " ").slice(0, 200), description: "", entityId: entity.id, targetLocationId: null, at: person.at });
  }
  void locationId;
  return out.slice(0, 30);
}

/** The locator's request (a cheap vision call): positions for the given keys only. */
export function locatorRequest(candidates: readonly PoiCandidate[], placeName: string) {
  const features = candidates.filter((row) => row.kind !== "person");
  const system = [
    "You locate named features in an illustration of a place for a point-and-click scene. Reply with one JSON object only, no prose: {\"positions\":[{\"key\":\"...\",\"x\":0.5,\"y\":0.5,\"confidence\":0.8}]}.",
    "One entry per key given below. x, y: the centre of the feature as fractions of the picture's width and height from the top-left (0..1). confidence: 0..1 — below 0.4 when you cannot really see it. Never add keys that are not in the list; omit a key you cannot find at all.",
  ].join("\n");
  const text = [`The place: ${placeName}.`, `Features (key — what it is): ${features.map((row) => `${row.key} — ${row.description || row.label}`).join("; ")}.`].join("\n");
  return { system, text, keys: features.map((row) => row.key) };
}
export type Located = { key: string; x: number; y: number; confidence: number };
export function parseLocatorReply(text: string, keys: readonly string[]): Located[] {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as { positions?: unknown };
    const allowed = new Set(keys);
    const seen = new Set<string>();
    return (Array.isArray(raw.positions) ? raw.positions : []).flatMap((row) => {
      const r = row as Record<string, unknown>;
      const unit = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : null);
      const key = typeof r?.key === "string" ? r.key : "";
      const x = unit(r?.x), y = unit(r?.y);
      if (!allowed.has(key) || seen.has(key) || x === null || y === null) return [];
      seen.add(key);
      return [{ key, x, y, confidence: unit(r.confidence) ?? 0.5 }];
    });
  } catch {
    return [];
  }
}

export const APPROXIMATE_BELOW = 0.6;
/** POI rows from the candidates and the positions: a position only for a candidate (never an
 * invented marker); low confidence is «approximate»; a person stands at their feature, offset a
 * little; a candidate nobody located gets no position (it is listed, not guessed). The check's own
 * positions count for must-show features when the locator has none. */
export function placePois(candidates: readonly PoiCandidate[], located: readonly Located[], check: SceneCheck | null, make: { id: () => string; now: string; locationId: string }): Omit<Poi, "revision">[] {
  const positions = new Map<string, Located>();
  for (const item of check?.items ?? []) if (item.visible && item.x !== null && item.y !== null) positions.set(item.key, { key: item.key, x: item.x, y: item.y, confidence: item.confidence });
  for (const row of located) positions.set(row.key, row);
  const feature = (key: string | null) => (key ? positions.get(key) ?? null : null);
  let personIndex = 0;
  return candidates.map((candidate) => {
    const own = candidate.kind === "person" ? feature(candidate.at) : positions.get(candidate.key) ?? null;
    const offset = candidate.kind === "person" && own ? { x: Math.min(0.95, own.x + 0.04 + (personIndex++ % 3) * 0.05), y: Math.min(0.95, own.y + 0.06) } : own;
    return {
      id: make.id(), locationId: make.locationId, key: candidate.key, kind: candidate.kind, label: candidate.label, note: candidate.note,
      entityId: candidate.entityId, targetLocationId: candidate.targetLocationId,
      x: offset ? Number(offset.x.toFixed(3)) : null, y: offset ? Number(offset.y.toFixed(3)) : null,
      confidence: own ? Number(own.confidence.toFixed(2)) : null, approximate: !!own && own.confidence < APPROXIMATE_BELOW,
      source: candidate.kind === "person" ? "sheet" : "locator", hidden: false, updatedAt: make.now,
    };
  });
}

/** The side list («здесь также: погреб»): must-show features the picture still lacks. */
export const sideListOf = (sheet: SceneSheet, check: SceneCheck | null) => (check ? sceneVerdict(sheet, check).missing.map((row) => row.label) : []);

/** The hotspots a scene shows now: positioned, not hidden, and still in the records (a person who
 * left is no longer present; an exit to a place no longer known is gone). The owner's hidden
 * markers return with `includeHidden`. */
export function scenePois(pois: readonly Poi[], snapshot: CampaignSnapshot, locationId: string, options: { presentIds?: readonly string[] | null; includeHidden?: boolean } = {}): Poi[] {
  const present = options.presentIds ? new Set(options.presentIds) : null;
  return pois.filter((poi) => {
    if (poi.locationId !== locationId || poi.x === null || poi.y === null) return false;
    if (poi.hidden && !options.includeHidden) return false;
    if (poi.kind === "person") {
      if (!poi.entityId || !snapshot.entities.some((row) => row.id === poi.entityId && row.campaign_id === snapshot.campaign.id)) return false;
      if (present && !present.has(poi.entityId)) return false;
    }
    if (poi.targetLocationId && !snapshot.locations.some((row) => row.id === poi.targetLocationId && (row.status === "known" || row.status === "visited"))) return false;
    return true;
  });
}

/** What the DM should read about a drawn place (a proposal for the fix run's context: one block per
 * visited place with a scene), so later narration does not contradict the picture. */
export function sheetForDm(sheet: SceneSheet, placeName: string): string {
  const parts = [`Scene sheet of ${placeName} (what the drawn scene shows; keep narration consistent with it): ${sheet.summary}`];
  if (sheet.features.length) parts.push(`Features: ${sheet.features.map((row) => `${row.label}${row.description ? ` — ${row.description}` : ""}`).join("; ")}.`);
  if (sheet.never.length) parts.push(`Not there: ${sheet.never.join("; ")}.`);
  if (sheet.light) parts.push(`Light: ${sheet.light}.`);
  return parts.join(" ");
}
