// Stage V: the pure picture board (styles, anchors, autopilot and restyle plans,
// references) and the shot builder. No network, sample fixtures only.
import assert from "node:assert/strict";
import test from "node:test";
import {
  activeStyle, anchorFor, anchorSet, capRemaining, chronicleChapters, frameFor, parsePictureBoard, pictureCostUsdMicros,
  planAutopilot, referencesForAnchor, referencesForShot, restylePlan, sharedItemAnchor, STYLE_PRESETS, styleTextFor,
} from "../src/lib/visual-frame/pictures.ts";
import { fallbackShot, firstParagraph, framePrompt, isKeyMoment, parseShot, shotEntityIds, shotRequest } from "../src/lib/visual-frame/shot.ts";
import { shovSample } from "../src/lib/ui/preview/stage5-fixture.ts";

const snapshot = shovSample.snapshot();
const cid = snapshot.campaign.id;
const hero = snapshot.entities.find((row) => row.kind === "player");
const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id);
const uuid = (n) => `9e9e9e9e-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (n) => new Date(Date.UTC(2026, 9, 15, 12, n)).toISOString();
const picture = (n, over = {}) => ({
  id: uuid(n), kind: "anchor", subjectKind: "entity", subjectId: hero.id, composition: "portrait", timeline: snapshot.timeline, version: 1,
  status: "ready", hidden: false, model: "fal-ai/flux-2/klein/9b", tier: "fast", trigger: "autopilot", styleVersionId: null, width: 1024, height: 1024,
  costUsdMicros: 17000, elapsedMs: 1500, error: null, createdAt: at(n), readyAt: at(n), ...over,
});
const style = (n, over = {}) => ({ id: uuid(n), scope: "campaign", scopeId: cid, version: 1, preset: "line-art", label: "Line art", styleText: STYLE_PRESETS[0].text, hasReference: false, active: true, createdAt: at(n), ...over });
const board = (pictures = [], styles = [], settings = {}) => parsePictureBoard({
  campaignId: cid, worldId: null, settings: { frames: "every", quality: "fast", dailyCap: 10, autopilot: { enabled: true, items: true, portraits: true, figures: true, places: true, holdings: true, autoAccept: true, provider: "fal" }, revision: 1, ...settings },
  today: { count: pictures.length, costUsdMicros: 0 }, styles, pictures,
});

test("board parsing drops malformed rows and keeps defaults; style resolution: campaign over world over the visual style text", () => {
  const parsed = board([picture(1), { id: "nope" }], [style(50, { scope: "world", scopeId: uuid(60) }), style(51, { version: 2 })]);
  assert.equal(parsed.pictures.length, 1);
  assert.equal(parsed.settings.dailyCap, 10);
  assert.equal(activeStyle(parsed).id, uuid(51), "the campaign override wins");
  assert.equal(activeStyle(board([], [style(50, { scope: "world", scopeId: uuid(60) })])).id, uuid(50));
  assert.equal(styleTextFor(board(), "Steam and brass").trim(), "Steam and brass");
  assert.equal(styleTextFor(board([], [style(50)]), "Steam and brass"), STYLE_PRESETS[0].text);
  assert.ok(STYLE_PRESETS.some((row) => row.key === "noir") && STYLE_PRESETS.some((row) => row.key === "line-art"));
  assert.equal(parsePictureBoard({ campaignId: "x" }), null);
});

test("anchors: newest ready unhidden version shows, drawing and failed states, items share one picture per type", () => {
  const b = board([picture(1), picture(2, { version: 2, hidden: true }), picture(3, { version: 3, status: "generating", readyAt: null })]);
  const shown = anchorFor(b, { kind: "entity", id: hero.id }, "portrait", snapshot.timeline);
  assert.equal(shown.picture.id, uuid(1), "the hidden newer version is skipped");
  assert.equal(shown.drawing, true);
  assert.deepEqual(shown.version, { index: 1, total: 1 });
  const other = board([picture(4, { timeline: { timelineId: uuid(999), epoch: 1 } })]);
  assert.equal(anchorFor(other, { kind: "entity", id: hero.id }, "portrait", snapshot.timeline).picture, null, "another timeline's anchors stay there");
  assert.equal(anchorFor(other, { kind: "entity", id: hero.id }, "portrait", { timelineId: snapshot.timeline.timelineId, epoch: 7 }).picture, null);
  const failed = board([picture(5, { status: "failed", readyAt: null, error: "validation" })]);
  assert.equal(anchorFor(failed, { kind: "entity", id: hero.id }, "portrait").failed, "validation");
  const potions = snapshot.items.filter((row) => row.category === "consumable");
  const withItem = board([picture(6, { subjectKind: "item", subjectId: potions[0].id, composition: "item" })]);
  assert.equal(sharedItemAnchor(withItem, snapshot, potions[0].id).picture.id, uuid(6));
  const twin = { ...snapshot, items: [...snapshot.items, { ...potions[0], id: uuid(70), quantity: 1 }] };
  assert.equal(sharedItemAnchor(withItem, twin, uuid(70)).picture.id, uuid(6), "same type shares the picture");
});

test("anchor set, autopilot plan and restyle plan follow the records, the cap and the style version", () => {
  const set = anchorSet(snapshot, { items: true, portraits: true, figures: true, places: true, holdings: true });
  assert.equal(set[0].reason, "holding");
  assert.ok(set.some((row) => row.reason === "figure" && row.subject.id === hero.id));
  assert.ok(set.filter((row) => row.reason === "place").every((row) => snapshot.locations.find((l) => l.id === row.subject.id).status === "visited"));
  const itemNames = set.filter((row) => row.reason === "item").map((row) => row.name);
  assert.equal(new Set(itemNames).size, itemNames.length);
  const empty = board();
  assert.equal(planAutopilot(snapshot, empty)[0].reason, "holding");
  assert.equal(planAutopilot(snapshot, board([], [], { autopilot: { ...empty.settings.autopilot, enabled: false } })).length, 0);
  assert.equal(planAutopilot(snapshot, board([], [], { dailyCap: 0 })).length, 0, "the cap stops the autopilot");
  const busy = board([picture(1, { status: "queued", readyAt: null })]);
  assert.equal(planAutopilot(snapshot, busy).length, 0, "one anchor at a time");
  const transport = snapshot.entities.find((row) => row.kind === "transport");
  const triedTransport = board([picture(2, { subjectId: transport.id, composition: "holding", status: "failed", readyAt: null, error: "validation" })]);
  assert.notEqual(planAutopilot(snapshot, triedTransport)[0].subject.id, transport.id, "a failed attempt is never retried on its own");
  const withStyle = board([picture(2, { subjectId: transport.id, composition: "holding" })], [style(50)]);
  const restyle = restylePlan(snapshot, withStyle);
  assert.ok(restyle.plan.some((row) => row.subject.id === transport.id), "an anchor in the old style is re-rendered");
  assert.equal(restyle.fastUsdMicros, restyle.plan.reduce((sum, row) => sum + pictureCostUsdMicros("fast", row.composition), 0));
  assert.ok(restyle.qualityUsdMicros > restyle.fastUsdMicros);
  const done = board([picture(2, { subjectId: transport.id, composition: "holding", styleVersionId: uuid(50) })], [style(50)], { autopilot: { ...empty.settings.autopilot, enabled: false } });
  assert.equal(restylePlan(snapshot, done).plan.length, 0, "nothing left once every anchor has the new style");
  assert.equal(capRemaining(board([picture(1), picture(2, { version: 2 })], [], { dailyCap: 2 })), 0);
});

test("references: style image first, then the place, then the people, within the model's limit", () => {
  const meg = snapshot.entities.find((row) => row.kind === "companion");
  const b = board([
    picture(1), picture(2, { subjectId: meg.id }), picture(3, { subjectKind: "location", subjectId: place.id, composition: "location" }),
  ], [style(50, { hasReference: true })]);
  const refs = referencesForShot(b, { entityIds: [hero.id, meg.id, uuid(77)], locationId: place.id, model: "fal-ai/flux-2/klein/9b", timeline: snapshot.timeline });
  assert.deepEqual(refs, [uuid(50), uuid(3), uuid(1), uuid(2)]);
  const many = referencesForShot(b, { entityIds: [hero.id, meg.id], locationId: place.id, model: "fal-ai/flux-2/flash" });
  assert.ok(many.length <= 4);
  assert.deepEqual(referencesForAnchor(b, { kind: "entity", id: hero.id }, "figure", "fal-ai/flux-2/klein/9b", snapshot.timeline), [uuid(50), uuid(1)]);
  assert.deepEqual(referencesForAnchor(board(), { kind: "entity", id: hero.id }, "portrait", "fal-ai/flux-2/klein/9b"), []);
});

test("frames per turn and the chronicle chapters", () => {
  const play = shovSample.play();
  const turn = play.turns.find((row) => row.mode === "game");
  const b = board([
    picture(1, { kind: "frame", subjectKind: "turn", subjectId: turn.id, composition: "frame", trigger: "live" }),
    picture(2, { kind: "frame", subjectKind: "turn", subjectId: turn.id, composition: "frame", trigger: "key_moment", version: 2, tier: "quality" }),
  ]);
  assert.equal(frameFor(b, turn.id).picture.id, uuid(2));
  assert.equal(frameFor(b, uuid(5)).picture, null);
  const chapters = chronicleChapters(snapshot, play.turns, b);
  assert.ok(chapters.length >= 1);
  const last = chapters.at(-1);
  assert.equal(last.turns.length, 1, "companion talk and uncommitted turns stay out of the book");
  assert.equal(last.turns[0].frame.id, uuid(2));
  assert.ok(chapters[0].session.recap.length > 0);
});

test("first paragraph: waits for enough words, takes the paragraph break, cuts at a sentence", () => {
  assert.equal(firstParagraph("Туман над"), null);
  assert.equal(firstParagraph("Туман над Тежу ещё не решил."), null, "too short unless the stream is over");
  assert.equal(firstParagraph("Туман над Тежу ещё не решил.", true), "Туман над Тежу ещё не решил.");
  const text = "Первый абзац истории, в котором что-то происходит.\n\nВторой абзац.";
  assert.equal(firstParagraph(text), "Первый абзац истории, в котором что-то происходит.");
  const long = "Слово ".repeat(40) + "конец.";
  assert.equal(firstParagraph(long), long.trim(), "a long sentence-ended text is enough");
  const huge = ("Предложение номер один. ".repeat(60)).trim();
  const cut = firstParagraph(huge, true);
  assert.ok(cut.length <= 900 && cut.endsWith("."));
});

test("shot: strict JSON parsing with bounds, the deterministic fallback, entity matching, prompt and key moments", () => {
  const context = { heroName: hero.name, names: snapshot.entities.filter((row) => row.kind === "companion").map((row) => row.name), placeName: place.name, language: "ru" };
  const request = shotRequest("Абзац.", context);
  assert.match(request.system, /JSON object only/);
  assert.match(request.user, new RegExp(hero.name));
  assert.doesNotMatch(request.system, /private|secret/i);
  const shot = parseShot('Sure: {"who":["Meg","Hale"],"action":"  Meg stubs out a cigarillo on the rail ","where":"airship gondola","angle":"low angle","mood":"dawn fog","extra":1}');
  assert.deepEqual(shot, { who: ["Meg", "Hale"], action: "Meg stubs out a cigarillo on the rail", where: "airship gondola", angle: "low angle", mood: "dawn fog" });
  assert.equal(parseShot("no json here"), null);
  assert.equal(parseShot('{"who":[]}'), null, "an action is required");
  assert.equal(parseShot(`{"who":["a","b","c","d","e","f"],"action":"${"x".repeat(500)}"}`).who.length, 4);
  const paragraph = snapshot.scenes.at(-2).body;
  const fallback = fallbackShot(paragraph, context);
  assert.ok(fallback.action.length > 10 && fallback.action.length <= 240);
  assert.equal(fallback.where, place.name);
  const ids = shotEntityIds({ who: ["Мэг", "кто-то"], action: "", where: "", angle: "", mood: "" }, snapshot.entities);
  assert.deepEqual(ids, [snapshot.entities.find((row) => row.name.startsWith("Мэг")).id]);
  const prompt = framePrompt(shot, "Ink and wash", { people: ["Meg"], place: "the gondola", style: true });
  assert.match(prompt, /Who: Meg, Hale\./);
  assert.match(prompt, /Art style: Ink and wash/);
  assert.match(prompt, /first reference image sets the art style/);
  assert.match(prompt, /No text, letters/);
  assert.equal(isKeyMoment([{ name: "finish_turn", ok: true, summary: "Your moment: describe how you do it" }]), true);
  assert.equal(isKeyMoment([{ name: "combat", ok: true, summary: "Combat ends: the ambush is beaten" }]), true);
  assert.equal(isKeyMoment([{ name: "combat", ok: false, summary: "Combat ends" }, { name: "item", ok: true, summary: "+1 lantern" }]), false);
});
