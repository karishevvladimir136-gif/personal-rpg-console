// 2D Live, part 1a (docs/stages/LIVE2D_1.md): the pure model — contracts, the
// hierarchy world → region → town → district → scene, travel as presentation,
// marker visibility, the scene sheet, brief, check verdict and POIs that never
// invent, the region map's signature and prompt.
import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import { parseLive2dBoard, parsePoi, parseSceneSheet, parsePoiSeed } from "../src/lib/live2d/contracts.ts";
import { live2dCrumbs, live2dView, live2dOpeningLevel, regionAnchorOf, childPlaces } from "../src/lib/live2d/hierarchy.ts";
import { routePath, startTravel, travelDurationMs, travelMinutesOf, travelPoint, travelProgress } from "../src/lib/live2d/travel.ts";
import { trackedPlaceIds, visiblePins } from "../src/lib/live2d/markers.ts";
import { placeIntent, poiIntent } from "../src/lib/live2d/intents.ts";
import { checkRequest, fallbackSheet, locatorRequest, parseCheckReply, parseLocatorReply, parseSheetReply, placePois, poiCandidates, sceneBrief, scenePois, sceneVerdict, sheetForDm, sheetRequest, sheetSourceOf, sideListOf, slug } from "../src/lib/live2d/scene.ts";
import { newPlacesSince, regionMapPrompt, regionSignature } from "../src/lib/live2d/region.ts";

const AT = "2026-10-20T00:00:00Z";
const uuid = (n) => id(`live2d-${n}`);

/** A nested campaign: a world, a region under it, towns under the region, a district and a house. */
function nested() {
  const snapshot = fixture().snapshot;
  const cid = snapshot.campaign.id;
  const loc = (key, status, detail) => ({ id: uuid(key), campaign_id: cid, revision: 1, updated_at: AT, name: key, description: `${key} description`, status, ...(detail ? { detail } : {}) });
  const world = loc("Faerun", "known"), region = loc("Sword Coast", "visited");
  const beregost = loc("Beregost", "visited"), nashkel = loc("Nashkel", "known"), ford = loc("Crooked ford", "visited"), cloakwood = loc("Cloakwood", "rumored");
  const market = loc("Market", "visited", { parentId: beregost.id }), smithy = loc("Smithy", "known", { parentId: market.id });
  snapshot.locations = [world, region, beregost, nashkel, ford, cloakwood, market, smithy];
  snapshot.publicState.current_location_id = beregost.id;
  const place = (location, level, parent, x, y) => ({ campaign_id: cid, location_id: location.id, level, parent_location_id: parent?.id ?? null, x, y, revision: 1, updated_at: AT });
  const placements = [place(world, "world", null, 0.4, 0.5), place(region, "region", world, 0.3, 0.5), place(beregost, "local", region, 0.5, 0.4), place(nashkel, "local", region, 0.55, 0.8), place(ford, "local", region, 0.5, 0.6)];
  return { snapshot, placements, world, region, beregost, nashkel, ford, cloakwood, market, smithy };
}
/** A flat campaign (session 2): every place at the world level, no region record. */
function flat() {
  const snapshot = fixture().snapshot;
  const cid = snapshot.campaign.id;
  const loc = (key, status) => ({ id: uuid(key), campaign_id: cid, revision: 1, updated_at: AT, name: key, description: "", status });
  const post = loc("Guard post", "visited"), ford = loc("Crooked ford", "visited"), nashkel = loc("Nashkel", "known");
  snapshot.locations = [post, ford, nashkel];
  snapshot.publicState.current_location_id = ford.id;
  const place = (location, x, y) => ({ campaign_id: cid, location_id: location.id, level: "world", parent_location_id: null, x, y, revision: 1, updated_at: AT });
  return { snapshot, placements: [place(post, 0.3, 0.3), place(ford, 0.5, 0.5), place(nashkel, 0.6, 0.8)], post, ford, nashkel };
}

test("contracts: a board never carries seeds; sheets, POIs and seeds parse strictly", () => {
  assert.equal(parseLive2dBoard({ campaignId: uuid("c"), seeds: [] }), null, "a projection with seeds is not public");
  const board = parseLive2dBoard({ campaignId: uuid("c"), settings: { markers: "all", revision: 2 }, scenes: [], pois: [{ id: uuid("p"), locationId: uuid("l"), key: "altar", kind: "object", label: "Алтарь", source: "locator", revision: 1, updatedAt: AT, x: 0.4, y: 1.2 }], regionMaps: [] });
  assert.equal(board.settings.markers, "all");
  assert.equal(board.pois[0].x, null, "a coordinate outside 0..1 drops the position, never clamps it");
  assert.equal(parsePoi({ id: uuid("p"), locationId: uuid("l"), key: "Bad Key", kind: "object", label: "x", source: "locator", revision: 1, updatedAt: AT }), null);
  const sheet = parseSceneSheet({ summary: "A hall.", features: [{ key: "door", label: "Дверь", kind: "entrance", mustShow: true }, { key: "door", label: "dup", kind: "object" }], people: [{ name: "Alma", at: "door" }, { name: "Nobody", at: "nowhere" }], never: ["a forge"], crowded: "yes" });
  assert.equal(sheet.features.length, 1, "duplicate keys collapse");
  assert.deepEqual(sheet.people.map((row) => row.at), ["door", null]);
  assert.equal(sheet.crowded, false);
  assert.equal(parsePoiSeed({ id: uuid("s"), areaLocationId: null, key: "note_x", theme: "", premise: "", status: "latent", createdAt: AT }), null, "a seed key is poi_seed_*");
  assert.ok(parsePoiSeed({ id: uuid("s"), areaLocationId: null, key: "poi_seed_coast_1", theme: "an old cemetery", premise: "private", status: "latent", createdAt: AT }));
});

test("hierarchy: world → region → town → district → scene from the records and the atlas placements", () => {
  const f = nested();
  const crumbs = live2dCrumbs(f.snapshot, f.placements, f.smithy.id);
  assert.deepEqual(crumbs.map((row) => [row.level, row.name]), [["world", "Faerun"], ["region", "Sword Coast"], ["town", "Beregost"], ["district", "Market"], ["scene", "Smithy"]]);
  assert.deepEqual(live2dCrumbs(f.snapshot, f.placements, f.beregost.id).map((row) => row.level), ["world", "region", "town"], "a town with children opens as a town, not a scene");
  assert.deepEqual(live2dCrumbs(f.snapshot, f.placements, f.ford.id).map((row) => row.level), ["world", "region", "scene"]);
  const region = live2dView(f.snapshot, f.placements, "region", f.region.id, f.beregost.id);
  // Fix S3-accept Д3: every known place of the region appears — Cloakwood (a rumour nobody placed) joins, approximate.
  assert.deepEqual(region.pins.map((row) => row.name).sort(), ["Beregost", "Cloakwood", "Crooked ford", "Nashkel"], "the region shows the places under it; the town's children stay inside the town");
  assert.deepEqual(region.pins.filter((row) => row.approximate).map((row) => row.name), ["Cloakwood"]);
  assert.ok(region.pins.find((row) => row.name === "Beregost").hasChildren);
  assert.deepEqual(region.down, { level: "town", anchorId: f.beregost.id });
  const town = live2dView(f.snapshot, f.placements, "town", f.beregost.id, f.smithy.id);
  assert.deepEqual(town.pins.map((row) => row.name), ["Market"]);
  assert.ok(town.pins[0].x > 0 && town.pins[0].x < 1 && town.pins[0].y > 0 && town.pins[0].y < 1);
  assert.deepEqual(town.down, { level: "district", anchorId: f.market.id });
  const district = live2dView(f.snapshot, f.placements, "district", f.market.id, f.smithy.id);
  assert.deepEqual(district.pins.map((row) => row.name), ["Smithy"]);
  assert.deepEqual(district.down, { level: "scene", anchorId: f.smithy.id });
  assert.deepEqual(live2dOpeningLevel(f.snapshot, f.placements, f.ford.id), { level: "scene", anchorId: f.ford.id }, "a visited place opens at its scene");
  assert.deepEqual(live2dOpeningLevel(f.snapshot, f.placements, f.nashkel.id), { level: "region", anchorId: f.region.id }, "a known, unvisited place opens at the region: detail is drawn lazily");
  assert.equal(regionAnchorOf(f.snapshot, f.placements, f.smithy.id), f.region.id);
  assert.deepEqual(childPlaces(f.snapshot, f.beregost.id).map((row) => row.name), ["Market"]);
  const world = live2dView(f.snapshot, f.placements, "world", null, f.beregost.id);
  assert.deepEqual(world.pins.map((row) => row.name), ["Faerun"]);
});

test("hierarchy: a flat campaign has the known region without a world level, and the region holds every place", () => {
  const f = flat();
  assert.deepEqual(live2dCrumbs(f.snapshot, f.placements, f.ford.id).map((row) => [row.level, row.anchorId]), [["region", null], ["scene", f.ford.id]]);
  const region = live2dView(f.snapshot, f.placements, "region", null, f.ford.id);
  assert.deepEqual(region.pins.map((row) => row.name).sort(), ["Crooked ford", "Guard post", "Nashkel"]);
  assert.equal(region.anchorId, null);
  assert.equal(regionAnchorOf(f.snapshot, f.placements, f.ford.id), null);
  assert.deepEqual(live2dOpeningLevel(f.snapshot, f.placements, null), { level: "region", anchorId: null });
});

test("travel: the glide follows the turn's time, retargets on an interrupting turn, and the minutes come from the public chip", () => {
  assert.equal(travelDurationMs(0), 1200);
  assert.equal(travelDurationMs(60), 2700);
  assert.equal(travelDurationMs(100000), 9000);
  assert.equal(travelMinutesOf([{ name: "move_party", ok: true, summary: "Переход: Нашкель (2 часа 30 минут)" }]), 150);
  assert.equal(travelMinutesOf([{ tool: "move_party", ok: true, summary: "Travel: Nashkel (1 day 40 minutes)" }]), 1480);
  assert.equal(travelMinutesOf([{ name: "move_party", ok: true, summary: "Переход: брод (час)" }]), 60);
  assert.equal(travelMinutesOf([{ name: "item", ok: true, summary: "+ факел" }]), null);
  const first = startTravel(null, { fromId: "a", toId: "b", from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, minutes: 60, now: 0 });
  assert.equal(travelProgress(first, 0), 0);
  assert.equal(travelProgress(first, 2700), 1);
  const mid = travelPoint(first, 1350);
  assert.ok(mid.x > 0.4 && mid.x < 0.6);
  const interrupted = startTravel(first, { fromId: "b", toId: "c", from: { x: 1, y: 1 }, to: { x: 0, y: 1 }, minutes: 10, now: 1350 });
  assert.equal(interrupted.fromId, "a", "the glide was running: it continues from where the marker is");
  assert.ok(Math.abs(interrupted.from.x - mid.x) < 1e-9);
  assert.equal(interrupted.toId, "c");
  const later = startTravel(first, { fromId: "b", toId: "c", from: { x: 1, y: 1 }, to: { x: 0, y: 1 }, minutes: 10, now: 5000 });
  assert.deepEqual(later.from, { x: 1, y: 1 }, "a finished glide starts the next one at the place");
  assert.match(routePath({ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.4 }), /^M 10\.00 10\.00 Q [\d.]+ [\d.]+ 90\.00 40\.00$/);
});

test("markers: Off / Tracked only / Standard / All known read the same known state; seeds are never an input", () => {
  const f = nested();
  f.snapshot.quests = [{ id: uuid("q"), campaign_id: f.snapshot.campaign.id, revision: 1, updated_at: AT, title: "To Nashkel", description: "", status: "open", detail: { locationIds: [f.nashkel.id] } }];
  const tracked = trackedPlaceIds(f.snapshot);
  assert.deepEqual([...tracked], [f.nashkel.id]);
  const region = live2dView(f.snapshot, f.placements, "region", f.region.id, f.beregost.id);
  // Fix S3-accept Д3: the region itself now carries the unplaced rumour (Cloakwood), so the pins are the region's own.
  const pins = region.pins;
  const context = { currentId: f.beregost.id, destinationId: null, trackedIds: tracked };
  const names = (visibility) => visiblePins(visibility, pins, context).map((row) => row.name).sort();
  assert.deepEqual(names("off"), ["Beregost"]);
  assert.deepEqual(names("tracked"), ["Beregost", "Nashkel"]);
  assert.deepEqual(names("standard"), ["Beregost", "Crooked ford", "Nashkel"]);
  assert.deepEqual(names("all"), ["Beregost", "Cloakwood", "Crooked ford", "Nashkel"]);
  assert.deepEqual(visiblePins("off", pins, { ...context, destinationId: f.ford.id }).map((row) => row.name).sort(), ["Beregost", "Crooked ford"], "the destination stays in every mode");
});

test("intents: a click is words in the action box, the DM decides", () => {
  assert.equal(placeIntent("Нашкель", "ru"), "Идём в Нашкель.");
  assert.equal(placeIntent("Nashkel", "en"), "We go to Nashkel.");
  assert.equal(poiIntent({ kind: "person", label: "кузнецу" }, "ru"), "Подхожу к кузнецу.");
  assert.equal(poiIntent({ kind: "object", label: "алтарь" }, "ru"), "Осматриваю алтарь.");
  assert.equal(poiIntent({ kind: "exit", label: "the yard" }, "en"), "I go to the yard.");
});

test("scene: the sheet comes from the records and the public narration; the brief carries must show, must not show and no people", () => {
  const f = nested();
  f.snapshot.locations.find((row) => row.id === f.beregost.id).description = "A trade town on the Trade Way; a smithy by the gate, the temple of Lathander on the hill.";
  f.snapshot.scenes.push({ id: uuid("sc"), campaign_id: f.snapshot.campaign.id, revision: 1, updated_at: AT, sequence: 9, session_id: null, title: "", role: "narration", body: "In Beregost the smith hammers at the gate; the back gate opens on the yard.", settings_revision: 1, created_at: AT });
  const source = sheetSourceOf(f.snapshot, f.beregost.id, { presentIds: [id("companion")], timeOfDay: "evening" });
  assert.deepEqual(source.exits.map((row) => [row.name, row.relation]), [["Market", "child"]]);
  assert.equal(source.passages.length, 1);
  const request = sheetRequest(source);
  assert.match(request.system, /never invent/);
  assert.ok(request.user.includes("Market"));
  assert.ok(request.user.includes("[1] In Beregost"));
  const sheet = parseSheetReply(`Here: {"summary":"A trade town gate.","features":[{"key":"gate","label":"Ворота","kind":"entrance","description":"the town gate","mustShow":true},{"key":"smithy","label":"Кузница","kind":"object","description":"a smithy with an anvil","mustShow":true},{"key":"back-gate","label":"Задние ворота","kind":"exit","description":"a back gate to the yard","mustShow":false,"targetLocationId":"${f.market.id}"}],"people":[{"name":"Smith","entityId":null,"at":"smithy"}],"light":"evening sun","timeOfDay":"evening","never":["a second gate","a forge chimney"],"crowded":false}`);
  assert.equal(sheet.features.length, 3);
  assert.equal(sheet.people[0].at, "smithy");
  const brief = sceneBrief(sheet, { placeName: "Beregost", style: "ink and wash" });
  assert.match(brief, /MUST SHOW.*the town gate.*a smithy with an anvil/);
  assert.match(brief, /MUST NOT SHOW: no people/);
  assert.match(brief, /MUST NOT SHOW: a second gate; a forge chimney/);
  assert.match(brief, /No text/);
  assert.doesNotMatch(brief, /Smith\b/, "no named person goes into the background brief");
  const corrected = sceneBrief(sheet, { placeName: "Beregost", style: "", correction: { missing: [sheet.features[1]], contradictions: ["a staircase"] } });
  assert.match(corrected, /previous attempt missed.*a smithy with an anvil/);
  assert.match(corrected, /invented these; leave them out: a staircase/);
  const fallback = fallbackSheet(source);
  assert.equal(fallback.features[0].kind, "entrance");
  assert.equal(fallback.features[1].targetLocationId, f.market.id);
  assert.match(sheetForDm(sheet, "Beregost"), /^Scene sheet of Beregost .*Not there: a second gate/);
  assert.equal(slug("Задние ворота"), "zadnie-vorota");
});

test("scene: the check's verdict, the one redraw's reasons, the side list; POIs only for what is in the records, approximate when unsure", () => {
  const f = nested();
  const sheet = parseSheetReply(JSON.stringify({ summary: "A hall.", features: [
    { key: "door", label: "Дверь", kind: "entrance", description: "the main door", mustShow: true },
    { key: "altar", label: "Алтарь", kind: "object", description: "a stone altar", mustShow: true },
    { key: "hatch", label: "Люк в погреб", kind: "exit", description: "a cellar hatch", mustShow: true },
    { key: "bench", label: "Скамья", kind: "feature", description: "a bench", mustShow: false },
  ], people: [{ name: "Synthetic companion", entityId: id("companion"), at: "altar" }, { name: "Synthetic enemy", entityId: id("enemy"), at: "door" }], light: "", never: ["a second door"], crowded: false }));
  const request = checkRequest(sheet, "Hall");
  assert.deepEqual(request.keys, ["door", "altar", "hatch"]);
  assert.match(request.text, /Must not be there: a second door/);
  const check = parseCheckReply('{"items":[{"key":"door","visible":true,"x":0.5,"y":0.9,"confidence":0.95},{"key":"altar","visible":true,"x":0.5,"y":0.4,"confidence":0.9},{"key":"hatch","visible":false,"x":null,"y":null,"confidence":0.1},{"key":"extra","visible":true,"x":0.1,"y":0.1,"confidence":1}],"contradictions":[{"what":"a second door","detail":"on the left wall"}],"peopleInBackground":false}', request.keys, "claude-sonnet-5-5", 1200, AT);
  assert.deepEqual(check.items.map((row) => [row.key, row.visible]), [["door", true], ["altar", true], ["hatch", false]], "only the required keys, in order");
  const verdict = sceneVerdict(sheet, check);
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.missing.map((row) => row.key), ["hatch"]);
  assert.deepEqual(verdict.contradictions, ["a second door"]);
  assert.equal(verdict.found, 2);
  assert.deepEqual(sideListOf(sheet, check), ["Люк в погреб"]);
  const candidates = poiCandidates(sheet, f.snapshot, f.beregost.id, [id("companion")]);
  assert.deepEqual(candidates.map((row) => [row.key, row.kind]), [["door", "exit"], ["altar", "object"], ["hatch", "exit"], ["bench", "feature"], ["person-synthetic-companion", "person"]], "the enemy is not present: no token; the hero is never a POI");
  const locator = locatorRequest(candidates, "Hall");
  assert.deepEqual(locator.keys, ["door", "altar", "hatch", "bench"]);
  const located = parseLocatorReply('{"positions":[{"key":"bench","x":0.2,"y":0.7,"confidence":0.5},{"key":"invented","x":0.5,"y":0.5,"confidence":1},{"key":"hatch","x":0.8,"y":0.8,"confidence":0.3},{"key":"bench","x":0.9,"y":0.9}]}', locator.keys);
  assert.deepEqual(located.map((row) => row.key), ["bench", "hatch"], "an invented key is dropped; a duplicate is ignored");
  let n = 0;
  const pois = placePois(candidates, located, check, { id: () => uuid(`poi-${n++}`), now: AT, locationId: f.beregost.id });
  const byKey = Object.fromEntries(pois.map((row) => [row.key, row]));
  assert.deepEqual([byKey.door.x, byKey.door.y, byKey.door.approximate], [0.5, 0.9, false], "the check's position serves a must-show feature");
  assert.deepEqual([byKey.bench.x, byKey.bench.approximate], [0.2, true], "confidence 0.5 shows as approximate");
  assert.deepEqual([byKey.hatch.x, byKey.hatch.approximate], [0.8, true]);
  assert.equal(byKey["person-synthetic-companion"].x, 0.54, "a person stands at their feature, offset");
  assert.equal(byKey["person-synthetic-companion"].entityId, id("companion"));
  assert.ok(pois.every((row) => candidates.some((candidate) => candidate.key === row.key)), "no marker for anything outside the records");
  const rows = pois.map((row, index) => ({ ...row, revision: 1, hidden: index === 3 }));
  const shown = scenePois(rows, f.snapshot, f.beregost.id, { presentIds: [] });
  assert.deepEqual(shown.map((row) => row.key), ["door", "altar", "hatch"], "a hidden marker and a person who left are gone from the scene");
  assert.ok(scenePois(rows, f.snapshot, f.beregost.id, { includeHidden: true, presentIds: [id("companion")] }).some((row) => row.kind === "person"));
  const unchecked = parseCheckReply("no json here", request.keys, "m", 0, AT);
  assert.equal(unchecked, null);
});

test("region: the signature names the places drawn, a new place is the reason to redraw, the prompt names nothing beyond the records", () => {
  const f = nested();
  const region = live2dView(f.snapshot, f.placements, "region", f.region.id, f.beregost.id);
  const signature = regionSignature(region.pins);
  // Fix S3-accept Д3: four places — the unplaced rumour Cloakwood is a place of the region too.
  assert.equal(signature.split(",").length, 4);
  assert.equal(regionSignature([...region.pins].reverse()), signature, "order-free");
  assert.deepEqual(newPlacesSince(signature, region.pins), []);
  assert.deepEqual(newPlacesSince(signature, [...region.pins, { locationId: uuid("Candlekeep"), name: "Candlekeep", status: "known", x: 0.8, y: 0.2, hasChildren: false }]).map((row) => row.name), ["Candlekeep"]);
  const prompt = regionMapPrompt({ regionName: "Sword Coast", regionDescription: "The coast road.", canon: "", places: region.pins.map((row) => ({ name: row.name, description: "", x: row.x, y: row.y, status: row.status })), route: ["Crooked ford", "Beregost"], style: "", family: "gpt" });
  assert.match(prompt, /Beregost near the centre/);
  assert.match(prompt, /Nashkel in the south/);
  assert.match(prompt, /A road joins, in this order: Crooked ford → Beregost/);
  assert.match(prompt, /no extra towns/);
  assert.match(prompt, /No text/);
});
