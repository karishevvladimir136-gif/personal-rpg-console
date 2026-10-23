// Fix S3-accept Д3: the DM designs the region first, then the painter paints it. Pure helpers: the prep's source
// (the records, the canon, the public narration, and — DM-only — the hidden layer), the request to the DM, the
// reply split into the public part (stored in the canon, survives every redraw) and the hidden part (the DM's
// private notes, never the board, the client or the painter), the canon document's text, the painter's brief
// built from the public text with the places listed by role, and the tree's parents the prep adds where the
// records give none. A redraw changes the picture, never the geography: the brief always reads the stored prep.
import type { CampaignSnapshot, Location } from "../persistence/contracts.ts";
import type { RegionMap, RegionPrep, RegionPrepPlace, RegionPrepRoute } from "./contracts.ts";
import { parseRegionPrep } from "./contracts.ts";

export type RegionPrepSourcePlace = { id: string; name: string; status: Location["status"]; description: string; parentId: string | null; whereabouts: string };
/** What the DM reads before designing a region. `hidden` is DM-private (the hidden layer, the owner's secrets): the
 * server builds it, the model reads it, nothing of it comes back except into the private notes. */
export type RegionPrepSource = {
  language: "ru" | "en";
  campaignTitle: string;
  region: { id: string | null; name: string; description: string };
  places: RegionPrepSourcePlace[];
  canon: { title: string; body: string }[];
  passages: string[];
  hidden: string;
  /** The region's prep so far: the DM adds the new places and never moves what it already placed. */
  existing: RegionPrep | null;
};
export type RegionPrepDraft = { prep: RegionPrep; hidden: string };

const flat = (value: string, max: number) => value.replace(/\s+/g, " ").trim().slice(0, max);
const known = (snapshot: CampaignSnapshot) => snapshot.locations.filter((row) => row.campaign_id === snapshot.campaign.id && ["known", "visited", "rumored"].includes(row.status));

/** The places of a region the prep designs: the region's own places and every place inside them (the tree). */
export function regionPlaceIds(snapshot: CampaignSnapshot, topIds: readonly string[]): string[] {
  const rows = known(snapshot);
  const out = new Set(topIds.filter((id) => rows.some((row) => row.id === id)));
  for (let pass = 0; pass < 4; pass++) for (const row of rows) if (row.detail?.parentId && out.has(row.detail.parentId)) out.add(row.id);
  return [...out];
}

/** The prep's source from the records (public), the canon documents and the narration that names the places. */
export function regionPrepSource(snapshot: CampaignSnapshot, input: { anchorId: string | null; placeIds: readonly string[]; hidden: string; existing: RegionPrep | null }): RegionPrepSource {
  const rows = known(snapshot);
  const anchor = input.anchorId ? snapshot.locations.find((row) => row.id === input.anchorId) ?? null : null;
  const places = input.placeIds.flatMap((id) => {
    const row = rows.find((place) => place.id === id);
    return row ? [{ id: row.id, name: row.name, status: row.status, description: flat(row.description, 500), parentId: row.detail?.parentId ?? null, whereabouts: flat(row.detail?.whereabouts ?? "", 160) }] : [];
  }).slice(0, 48);
  // The narration that names a place (public text), newest last, within one budget for the whole region.
  const needles = places.map((row) => row.name.toLocaleLowerCase().slice(0, Math.max(4, row.name.length - 2)));
  const passages: string[] = [];
  let budget = 14_000;
  for (const scene of [...snapshot.scenes].reverse()) {
    if (scene.role !== "narration" || budget <= 0) continue;
    const body = scene.body.toLocaleLowerCase();
    if (!needles.some((needle) => body.includes(needle))) continue;
    const text = flat(scene.body, 1200);
    passages.unshift(text);
    budget -= text.length;
  }
  const guide = snapshot.dmGuideDocumentId;
  const canon = snapshot.documents.filter((doc) => doc.status === "canon" && doc.id !== guide).map((doc) => ({ title: doc.title, body: flat(doc.body, 4000) })).slice(0, 6);
  return {
    language: snapshot.settings.values.language === "en" ? "en" : "ru", campaignTitle: snapshot.campaign.title,
    region: { id: anchor?.id ?? null, name: anchor?.name ?? "", description: flat(anchor?.description ?? snapshot.publicState.summary ?? "", 800) },
    places, canon, passages, hidden: input.hidden.slice(0, 8000), existing: input.existing,
  };
}

const SYSTEM = [
  // The opening line in the plainest words: the probe's model refused («cyber», a false positive) whenever the prompt
  // opened with «You are the game master of a role-playing campaign, preparing the map…» (docs/runs/fix-s3-accept-d-bisect.json).
  "You prepare one region of a fantasy story's world before an artist paints its map. Work out the region's geography in detail and keep it consistent with the records, the canon and the story so far: the land (hills, forests, coast, marsh), the rivers and which way they flow, the roads and paths, where each known settlement and place lies and what lies between them, and how many days it takes to walk from one to another. The artist paints from your design, the places are marked on the picture by it, and the story keeps to it later.",
  "Reply with one JSON object only, no prose:",
  "{\"overview\":\"...\",\"landscape\":\"...\",\"places\":[{\"n\":1,\"role\":\"...\",\"within\":null,\"x\":0.5,\"y\":0.5,\"where\":\"...\",\"look\":\"...\"}],\"routes\":[{\"from\":1,\"to\":2,\"way\":\"...\",\"days\":0.5}],\"hidden\":\"...\"}",
  "overview: 3–6 sentences in the campaign language — the land, the rivers and roads, what lies between the settlements; only what the heroes know or could see from a road or a hilltop.",
  "landscape: the same land in plain English for the illustrator, one paragraph of 60–120 words, north is up: where the rivers run, where the forests, hills, coast and roads are.",
  "places: one entry per known place listed below, by its number n (1, 2, …) — never a new place. role: what it is, 1–4 English words (village, walled town, guard post, stone bridge, ford, inn, mill, ruined tower, hunting lodge, district, house). within: the number of the settlement or place it lies inside when it is part of one (a guard post in a village, a smithy in a town, a district of a city), else null; the records' parent wins when they give one. x, y: where it lies on the region's sheet as fractions from the top-left (0..1, north is up, west is left); a place inside a settlement takes the settlement's spot; both null only when nothing in the records or the story places it (a rumour of «somewhere in the hills»). where: one sentence in the campaign language — on which bank, by which road, how far from what. look: what the illustrator draws for it, one plain English clause (for a place inside a settlement, how it shows there: «a timber watchtower by the north gate»).",
  "routes: the roads, rivers and paths between the places, each settlement reached by at least one: from and to by place number, way in the campaign language (the road or river and what lies between), days of travel on foot as a number (0.1 for a short walk) or null when unknown.",
  "hidden: what stays in your hidden layer as the game master, in the campaign language — secret places in the region, who really holds the roads, dangers the heroes have not met, how the region ties to the story's mysteries. The players never see it. Keep every secret out of overview, landscape, where, look and way.",
  "Ground everything in the records, the canon, the story so far and your own notes; never contradict them. Do not invent named settlements, castles or ruins the records do not have: the land between the places stays nameless terrain.",
].join("\n");
const AMEND = "The region is already designed (below, «The region so far»). Keep every place exactly where it is and every route as it is. Design only the new places: reply with the same JSON shape holding the new places, the routes that reach them, and a hidden note about them (or an empty string); overview and landscape stay empty strings unless the new places change what the heroes know of the land.";
/** Fix S3-accept Д3: the model works with place numbers (1, 2, …) — fewer tokens, and a prompt that reads as a game
 * master's notes rather than a list of identifiers (the probe's previous model refused UUID- and «key»-laden requests
 * as cyber content); the reply maps them back to the records' IDs. */
const numberOf = (index: number) => index + 1;

/** The DM's request: strict JSON from the records, the canon, the public narration and the DM's private notes. */
export function regionPrepRequest(source: RegionPrepSource): { system: string; user: string } {
  const key = new Map(source.places.map((row, index) => [row.id, numberOf(index)]));
  const name = (id: string | null) => source.places.find((row) => row.id === id)?.name ?? "";
  const designed = new Set(source.existing?.places.map((row) => row.locationId) ?? []);
  const list = (rows: RegionPrepSourcePlace[]) => rows.map((row) => `${key.get(row.id)} — ${row.name} — ${row.status}${row.parentId && key.has(row.parentId) ? ` — inside ${name(row.parentId)} (${key.get(row.parentId)})` : ""}${row.whereabouts ? ` — ${row.whereabouts}` : ""}${row.description ? `: ${row.description}` : ""}`).join("\n");
  const fresh = source.places.filter((row) => !designed.has(row.id));
  // The region so far, in the same numbers (a place outside this request's list is left out: it never moves anyway).
  const keyed = (id: string | null) => (id ? key.get(id) ?? null : null);
  const existing = source.existing ? { overview: source.existing.overview,
    places: source.existing.places.filter((row) => key.has(row.locationId)).map((row) => ({ ...row, locationId: undefined, n: keyed(row.locationId), within: keyed(row.within) })),
    routes: source.existing.routes.filter((row) => key.has(row.from) && key.has(row.to)).map((row) => ({ ...row, from: keyed(row.from), to: keyed(row.to) })) } : null;
  const user = [
    `Campaign: ${source.campaignTitle}. Campaign language: ${source.language === "ru" ? "Russian" : "English"}.`,
    source.region.name ? `The region: ${source.region.name}.${source.region.description ? ` ${source.region.description}` : ""}` : `The region the heroes travel (it has no name of its own in the records).${source.region.description ? ` ${source.region.description}` : ""}`,
    existing ? `The region so far (keep it):\n${JSON.stringify(existing)}` : "",
    `${source.existing ? "New known places to design" : "Known places of the region"} (n — name — status — parent — whereabouts: description):\n${list(source.existing ? fresh : source.places) || "(none)"}`,
    source.existing && fresh.length < source.places.length ? `Already designed: ${source.places.filter((row) => designed.has(row.id)).map((row) => `${row.name} (${key.get(row.id)})`).join(", ")}.` : "",
    source.canon.length ? `The canon (established facts of this world):\n${source.canon.map((doc) => `## ${doc.title}\n${doc.body}`).join("\n")}` : "",
    source.passages.length ? `Narration passages that name these places (public text, oldest first):\n${source.passages.map((row, index) => `[${index + 1}] ${row}`).join("\n")}` : "No narration names these places yet: use the records alone.",
    source.hidden ? `Your own notes as the game master for this campaign (the players do not see them; keep the land consistent with them, and put whatever of them touches this region only into «hidden»):\n${source.hidden}` : "",
  ].filter(Boolean).join("\n\n");
  return { system: source.existing ? `${SYSTEM}\n${AMEND}` : SYSTEM, user };
}

/** The reply as the prep's public part (only the listed places, by number or record ID) and the hidden part; null when
 * unreadable. `placeIds` is the request's place list in its order (number N is its N-th place). */
export function parseRegionPrepReply(text: string, placeIds: readonly string[]): RegionPrepDraft | null {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let raw: Record<string, unknown>;
  try { raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>; } catch { return null; }
  const allowed = new Set(placeIds);
  const idOf = (value: unknown) => {
    const number = typeof value === "number" ? value : typeof value === "string" && /^p?\d+$/.test(value.trim()) ? Number(value.trim().replace(/^p/, "")) : null;
    return number !== null ? (Number.isInteger(number) ? placeIds[number - 1] ?? null : null) : value;
  };
  const places = (Array.isArray(raw.places) ? raw.places : []).map((row) => {
    const r = row && typeof row === "object" ? row as Record<string, unknown> : {};
    return { ...r, locationId: idOf(r.n ?? r.id ?? r.locationId), within: idOf(r.within) };
  });
  const routes = (Array.isArray(raw.routes) ? raw.routes : []).map((row) => {
    const r = row && typeof row === "object" ? row as Record<string, unknown> : {};
    return { ...r, from: idOf(r.from), to: idOf(r.to) };
  });
  const prep = parseRegionPrep({ overview: raw.overview, landscape: raw.landscape, places, routes, source: "model" });
  if (!prep) return null;
  prep.places = prep.places.filter((row) => allowed.has(row.locationId)).map((row) => (row.within && !allowed.has(row.within) ? { ...row, within: null } : row));
  prep.routes = prep.routes.filter((row) => allowed.has(row.from) && allowed.has(row.to));
  if (!prep.places.length && !prep.overview) return null;
  const secrets = typeof raw.secrets === "string" ? raw.secrets : typeof raw.hidden === "string" ? raw.hidden : "";
  return { prep, hidden: secrets.trim().slice(0, 5000) };
}

/** Fix S3-accept Д3: a place the prep puts at a settlement — on (nearly) the settlement's own spot, and its «where»
 * names the settlement («у северных ворот Заречья») — lies inside it, even when the DM left `within` empty: the map
 * draws it as part of the settlement and the tree puts it under it. A place with its own spot some way off stays a
 * landmark of its own. (A rule in the prep's request said this too, but the probe's model refused the request as
 * cyber content with it; the canon's own words decide it here, deterministically.) */
export const AT_SETTLEMENT = 0.06;
export function attachToSettlements(prep: RegionPrep, names: ReadonlyMap<string, string>, only: ReadonlySet<string> | null = null): RegionPrep {
  const stem = (name: string) => name.toLocaleLowerCase().slice(0, Math.max(4, name.length - 2));
  const hosts = prep.places.filter((row) => !row.within && row.x !== null && row.y !== null && names.get(row.locationId));
  const places = prep.places.map((row) => {
    if ((only && !only.has(row.locationId)) || row.within || row.x === null || row.y === null || !row.where) return row;
    const where = row.where.toLocaleLowerCase();
    const host = hosts.filter((other) => other.locationId !== row.locationId && Math.hypot(other.x! - row.x!, other.y! - row.y!) <= AT_SETTLEMENT && where.includes(stem(names.get(other.locationId)!)))
      .sort((a, b) => Math.hypot(a.x! - row.x!, a.y! - row.y!) - Math.hypot(b.x! - row.x!, b.y! - row.y!))[0];
    // Never under a place that itself lies inside this one.
    return host && !prep.places.some((other) => other.locationId === host.locationId && other.within === row.locationId) ? { ...row, within: host.locationId, x: host.x, y: host.y } : row;
  });
  return { ...prep, places };
}

/** An amend keeps the region as designed: the places and routes already there stay exactly; only new ones join. */
export function mergeRegionPrep(existing: RegionPrep, added: RegionPrep): RegionPrep {
  const have = new Set(existing.places.map((row) => row.locationId));
  const pair = (row: RegionPrepRoute) => [row.from, row.to].sort().join(":");
  const routes = new Set(existing.routes.map(pair));
  return {
    overview: [existing.overview, added.overview].filter(Boolean).join(" ").slice(0, 3000),
    landscape: existing.landscape || added.landscape,
    places: [...existing.places, ...added.places.filter((row) => !have.has(row.locationId))].slice(0, 60),
    routes: [...existing.routes, ...added.routes.filter((row) => !routes.has(pair(row)))].slice(0, 60),
    source: existing.source === "model" || added.source === "model" ? "model" : "records",
  };
}

/** The records alone, when the DM's model is not configured or fails: the atlas spots and the records' parents. Used
 * for the picture of the moment; never saved as the canon, so the next draw asks the DM again. */
export function fallbackRegionPrep(source: RegionPrepSource, spots: ReadonlyMap<string, { x: number; y: number } | null>): RegionPrep {
  return {
    overview: source.region.description, landscape: "", routes: [], source: "records",
    places: source.places.map((row): RegionPrepPlace => {
      const spot = spots.get(row.id) ?? null;
      return { locationId: row.id, role: "", within: row.parentId, x: spot?.x ?? null, y: spot?.y ?? null, where: row.whereabouts, look: "" };
    }),
  };
}

/** The places the prep does not design yet (a place that became known after the region was prepared). */
export const missingFromPrep = (prep: RegionPrep | null, placeIds: readonly string[]) => placeIds.filter((id) => !prep?.places.some((row) => row.locationId === id));

const daysText = (days: number | null, ru: boolean) => {
  if (days === null) return "";
  if (days < 0.3) return ru ? "рукой подать" : "a short walk";
  if (days < 0.75) return ru ? "полдня пути" : "half a day";
  const n = Math.round(days * 2) / 2;
  if (!ru) return `${n} day${n === 1 ? "" : "s"}`;
  const whole = Number.isInteger(n) ? n : null;
  if (whole === null) return `${String(n).replace(".", ",")} дня пути`;
  const tail = whole % 10 === 1 && whole % 100 !== 11 ? "день" : [2, 3, 4].includes(whole % 10) && ![12, 13, 14].includes(whole % 100) ? "дня" : "дней";
  return `${whole} ${tail} пути`;
};

/** The canon document's text: what the DM reads every turn as an established fact of the world. */
export function regionCanonText(prep: RegionPrep, names: ReadonlyMap<string, string>, input: { regionName: string; language: "ru" | "en" }): { title: string; body: string } {
  const ru = input.language === "ru";
  const name = (id: string) => names.get(id) ?? "";
  const title = ru ? `Карта края — ${input.regionName || "известный край"}` : `Region map — ${input.regionName || "the known region"}`;
  const line = (row: RegionPrepPlace, indent: string) => {
    const bits = [row.where, row.x === null ? (ru ? "положение примерное" : "position approximate") : ""].filter(Boolean);
    return `${indent}- ${name(row.locationId)}${row.role ? ` (${row.role})` : ""}${bits.length ? `: ${bits.join("; ")}` : ""}`;
  };
  const named = prep.places.filter((row) => name(row.locationId));
  const tops = named.filter((row) => !row.within || !named.some((other) => other.locationId === row.within));
  const inside = (id: string, depth: number): string[] => depth > 3 ? [] : named.filter((row) => row.within === id).flatMap((row) => [line(row, "  ".repeat(depth)), ...inside(row.locationId, depth + 1)]);
  const places = tops.flatMap((row) => [line(row, ""), ...inside(row.locationId, 1)]);
  const routes = prep.routes.filter((row) => name(row.from) && name(row.to)).map((row) => `- ${name(row.from)} — ${name(row.to)}${row.way ? `: ${row.way}` : ""}${row.days !== null ? ` (${daysText(row.days, ru)})` : ""}`);
  const body = [
    ru ? "Подготовка ведущего: география края. Канон мира: карту рисуют по ней, перерисовка картинки её не меняет." : "The DM's prep: the region's geography. A fact of the world: the map is painted from it; a redraw never changes it.",
    prep.overview,
    places.length ? `${ru ? "Места" : "Places"}:\n${places.join("\n")}` : "",
    routes.length ? `${ru ? "Дороги и расстояния" : "Roads and distances"}:\n${routes.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
  return { title: title.slice(0, 200), body: body.slice(0, 20_000) };
}

/** The canon document's next body after an amend: the full text again while the document is still the DM's own
 * text; once the owner edited it (the highest authority), his text stays and only the new places are appended. */
export function regionCanonBody(current: string | null, previous: RegionPrep | null, next: RegionPrep, names: ReadonlyMap<string, string>, input: { regionName: string; language: "ru" | "en" }): string {
  const full = regionCanonText(next, names, input).body;
  if (current === null || !previous || current.trim() === regionCanonText(previous, names, input).body.trim()) return full;
  const had = new Set(previous.places.map((row) => row.locationId));
  const pair = (row: RegionPrepRoute) => [row.from, row.to].sort().join(":");
  const roads = new Set(previous.routes.map(pair));
  const added = regionCanonText({ ...next, overview: "", places: next.places.filter((row) => !had.has(row.locationId)), routes: next.routes.filter((row) => !roads.has(pair(row))) }, names, input).body;
  const tail = added.split("\n\n").slice(1).join("\n\n");
  return tail ? `${current.trimEnd()}\n\n${input.language === "ru" ? "Добавлено ведущим" : "Added by the DM"}:\n${tail}`.slice(0, 20_000) : current;
}

/** The DM's private note that holds a region's hidden part (rpg_dossier private notes; never the board). */
export const regionHiddenKey = (anchorId: string | null) => `region_hidden_${anchorId ? anchorId.replace(/[^a-z0-9]/gi, "").slice(0, 16).toLowerCase() : "known"}`;

function where(x: number, y: number) {
  const ns = y < 0.33 ? "north" : y > 0.66 ? "south" : "";
  const ew = x < 0.33 ? "west" : x > 0.66 ? "east" : "";
  return ns && ew ? `in the ${ns}-${ew}` : ns ? `in the ${ns}` : ew ? `in the ${ew}` : "near the centre";
}
export type RegionBriefInput = {
  regionName: string;
  names: ReadonlyMap<string, string>;
  style: string;
  family: "gpt" | "flux" | "other";
  /** After a failed check: what to draw unmistakably, and what to leave out. */
  correction?: { missing: string[]; misplaced: string[]; contradictions: string[] } | null;
};
/** The painter's brief from the prep's public part: the land as designed, then the places by role at their spots,
 * the places inside a settlement drawn as part of it, the roads; nothing beyond the places named, no writing. */
export function regionPaintBrief(prep: RegionPrep, input: RegionBriefInput): string {
  const name = (id: string) => input.names.get(id) ?? "";
  const placed = prep.places.filter((row) => name(row.locationId));
  const top = placed.filter((row) => (!row.within || !placed.some((other) => other.locationId === row.within)) && row.x !== null && row.y !== null);
  const inside = (id: string) => placed.filter((row) => row.within === id);
  const landmark = (row: RegionPrepPlace) => {
    const parts = inside(row.locationId).map((child) => `${child.look || child.role || "a building"} (${name(child.locationId)})`);
    return `${row.role || "a landmark"} (${name(row.locationId)}) ${where(row.x!, row.y!)}${row.look ? `: ${row.look}` : ""}${parts.length ? `; as part of it, inside it and not as separate landmarks: ${parts.join("; ")}` : ""}`;
  };
  const roads = prep.routes.filter((row) => top.some((place) => place.locationId === row.from) && top.some((place) => place.locationId === row.to))
    .map((row) => `${name(row.from)} — ${name(row.to)}${row.days !== null ? ` (${row.days < 0.75 ? "a short way" : `${Math.round(row.days * 2) / 2} days`} apart)` : ""}`);
  const text = input.family === "flux"
    ? "Every surface is plain: no lettering, no labels, no compass letters, no legend."
    : "No text, letters, numbers, labels, a legend, a compass rose with letters or any writing anywhere on the map.";
  return [
    `A painted map of ${input.regionName ? `the region of ${input.regionName}` : "the region the travellers know"}, seen from high above at a slight angle, as a page of an illustrated atlas: terrain, forests, water, roads and settlements as small painted landmarks, with aged paper and ink at the edges.`,
    prep.landscape ? `The land, as the game master designed it (north is up, west is left): ${prep.landscape}` : prep.overview ? `The land: ${flat(prep.overview, 600)}` : "",
    top.length ? `Draw these places by role, each a distinct landmark exactly where it is said to be, with open ground between them: ${top.map(landmark).join("; ")}.` : "No separate places are known yet: draw the land itself.",
    roads.length ? `Roads join: ${roads.join("; ")}.` : "",
    input.correction?.missing.length ? `The previous attempt missed these; draw them unmistakably this time, each large enough to be found: ${input.correction.missing.join("; ")}.` : "",
    input.correction?.misplaced.length ? `The previous attempt put these in the wrong place; put each exactly where it is said to be: ${input.correction.misplaced.join("; ")}.` : "",
    input.correction?.contradictions.length ? `The previous attempt invented these; leave them out: ${input.correction.contradictions.join("; ")}.` : "",
    "The app writes the names over the picture, so no written names on the map itself. Nothing beyond the places named: no extra towns, castles, towers or ruins the design does not have.",
    text,
    input.style.trim() ? `Art style: ${input.style.trim().slice(0, 800)}` : "Art style: an ink and watercolour atlas page.",
  ].filter(Boolean).join("\n").slice(0, 8000);
}

/** The tree's parents the regions' preps add where the records give none (a guard post inside the village); the
 * records' own `parentId` always wins. Only a known place can be a parent, never the place itself or its child. */
export function canonParents(snapshot: CampaignSnapshot, maps: readonly Pick<RegionMap, "prep">[]): Map<string, string> {
  const rows = known(snapshot);
  const ids = new Set(rows.map((row) => row.id));
  const parent = new Map<string, string>();
  for (const row of rows) if (row.detail?.parentId) parent.set(row.id, row.detail.parentId);
  const links = new Map<string, string>();
  for (const map of maps) for (const place of map.prep?.places ?? []) {
    if (!place.within || !ids.has(place.locationId) || !ids.has(place.within) || parent.has(place.locationId) || place.within === place.locationId) continue;
    // No loop: the parent's own chain never reaches the place.
    let cursor: string | undefined = place.within, loop = false;
    for (let step = 0; cursor && step < 10; step++) { if (cursor === place.locationId) { loop = true; break; } cursor = parent.get(cursor); }
    if (loop) continue;
    parent.set(place.locationId, place.within);
    links.set(place.locationId, place.within);
  }
  return links;
}
/** The snapshot the map's tree reads: the records with the preps' parents filled in where the records have none.
 * Presentation only — the records themselves never change. */
export function withCanonParents(snapshot: CampaignSnapshot, maps: readonly Pick<RegionMap, "prep">[]): CampaignSnapshot {
  const links = canonParents(snapshot, maps);
  if (!links.size) return snapshot;
  return { ...snapshot, locations: snapshot.locations.map((row) => (links.has(row.id) ? { ...row, detail: { ...row.detail, parentId: links.get(row.id) } } : row)) };
}
