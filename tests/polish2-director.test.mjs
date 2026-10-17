// Polish 2, part 3 (docs/stages/POLISH_2.md §3): the shot director — the visual
// brief request and its parser, the prompt compiled from a brief per model
// family, the references keyed to the brief's people, migration 65 (visual
// profiles with versions, the brief of a queued picture), the profile draft
// request, and the wiring (the redraw comment, the profile editor on the cards).
// No model call, no key.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { briefReferences, briefRequest, briefWordCount, compileBriefPrompt, parseBrief } from "../src/lib/visual-frame/brief.ts";
import { emptyPictureBoard, parsePictureBoard, parseVisualProfile, profileFor } from "../src/lib/visual-frame/pictures.ts";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));

const sample = {
  who: ["Рэй", "Мокей"], beat: "The old net-maker smears dark resin over the fresh cut on the hero's forearm.",
  brief: "Medium close shot inside a net-maker's shed on the pontoons. In the foreground the old net-maker, lean and grey-bearded in a knitted cap, bends over the hero's bared forearm and smears dark pine resin over a fresh cut with two fingers; a bucket of water stands at his feet. The hero sits on an upturned crate, jacket off, sleeve rolled up, jaw set, watching the wound. Nets hang from the rafters behind them; tar pots and coiled rope line the wall. Grey afternoon light comes through the open door on the left and catches the wet resin and the hero's forearm. Muted palette, cold grey with the warm brown of the resin. Camera at eye level, slightly to the side, a 50 mm feel. Same shed as the previous frame; the winch gear from before lies on the bench.",
  short: "Inside a net-maker's shed an old grey-bearded man smears dark resin over a fresh cut on a seated man's bared forearm; nets and tar pots behind, grey daylight from the open door.",
  avoid: "No other people, no blood on the floor, no text.", timeOfDay: "in the daytime", weather: null,
  profileUpdates: [{ who: "Рэй", change: "a fresh cut on the left forearm, smeared with dark resin" }], edit: null,
};

test("the brief request carries the whole narration, the profiles, the state, the clock, the previous brief and the owner's comment; names are for `who` only", () => {
  const { system, user } = briefRequest({
    narration: "Мокей молча берёт твою руку. Вода из ведра холодная.\n\nОн мажет порез смолой.", heroName: "Рэй", names: ["Мокей", "Марта"], placeName: "Сарай сетевяза",
    profiles: [{ name: "Рэй", kind: "person", look: "a man of about 35–40, a former harbour diver", changes: ["a borrowed grey linen shirt"] }, { name: "Сарай сетевяза", kind: "place", look: "a plank shed on the pontoons", changes: [] }],
    state: [{ name: "Рэй", lines: ["wears or carries work jacket, revolver"] }], clock: { timeOfDay: "in the daytime" }, previous: "The hero kneels on a pontoon filing a gear.",
    style: "Cinematic noir", comment: "сделай ночь", language: "ru",
  });
  assert.match(system, /the most visual moment of the whole turn — not simply its first sentence/);
  assert.match(system, /80–150 words of plain English prose, never more than 160/);
  assert.match(system, /do not restate a whole profile/);
  assert.match(system, /never by name/);
  assert.match(system, /profileUpdates: only when the text itself changes/);
  assert.match(user, /Known names: Рэй, Мокей, Марта\./);
  assert.match(user, /Рэй \(person\): a man of about 35–40, a former harbour diver Now: a borrowed grey linen shirt\./);
  assert.match(user, /Сарай сетевяза \(place\): a plank shed/);
  assert.match(user, /Visible state from the records:\nРэй: wears or carries work jacket, revolver/);
  assert.match(user, /The clock says: in the daytime\./);
  assert.match(user, /previous frame's brief \(for continuity\):\nThe hero kneels/);
  assert.match(user, /Owner's comment for the redraw \(one change to make\): сделай ночь/);
  assert.match(user, /The turn's narration \(Russian\):\nМокей молча берёт твою руку\. Вода из ведра холодная\.\n\nОн мажет порез смолой\./, "the whole turn, paragraphs kept");
});

test("the parser takes a real brief and bounds everything else; a short or broken reply is no brief", () => {
  const brief = parseBrief(`Here it is:\n${JSON.stringify(sample)}`);
  assert.ok(brief);
  assert.deepEqual(brief.who, ["Рэй", "Мокей"]);
  assert.equal(brief.timeOfDay, "in the daytime");
  assert.equal(brief.weather, null);
  assert.deepEqual(brief.profileUpdates, sample.profileUpdates);
  assert.equal(brief.edit, null);
  assert.ok(briefWordCount(brief) >= 80 && briefWordCount(brief) <= 160, `the sample brief is ${briefWordCount(brief)} words`);
  assert.equal(parseBrief(JSON.stringify({ ...sample, brief: "too short" })), null);
  assert.equal(parseBrief("no json here"), null);
  const noShort = parseBrief(JSON.stringify({ ...sample, short: "", profileUpdates: [{ who: "", change: "x" }, { who: "Рэй", change: 5 }], who: ["a", "b", "c", "d", "e", "f"] }));
  assert.equal(noShort.short.split(" ").length, 60, "the short form falls back to the brief's first 60 words");
  assert.deepEqual(noShort.profileUpdates, [], "half-empty updates are dropped");
  assert.equal(noShort.who.length, 4);
});

test("the prompt from a brief: GPT Image takes the brief whole with numbered references and identity locks; FLUX gets the short form, no negatives", () => {
  const brief = parseBrief(JSON.stringify(sample));
  const people = [
    { key: "e-hero", label: "the hero", pronoun: "they", appearance: "a former diver" },
    { key: "e-mokey", label: "person 2", pronoun: "they", appearance: "an old net-maker" },
  ];
  const references = briefReferences([
    { id: "r-style", role: "style", entityId: null }, { id: "r-mokey", role: "face", entityId: "e-mokey" }, { id: "r-place", role: "place", entityId: null },
    { id: "r-figure", role: "figure", entityId: "e-hero" }, { id: "r-face", role: "face", entityId: "e-hero" },
  ], people, 6);
  assert.deepEqual(references.map((row) => row.id), ["r-face", "r-figure", "r-mokey", "r-place", "r-style"], "the hero's face and figure first, then the others, the place, the style");
  const gpt = compileBriefPrompt({ brief, people, references, style: "Cinematic noir", modelId: "gpt-image-2.5-flare" });
  assert.match(gpt, /^Reference images: Image 1 — the hero's face and hair \(keep exact\)\. Image 2 — the hero's full figure and build \(keep exact; their clothes follow the brief\)\. Image 3 — person 2's face and hair \(keep exact\)\. Image 4 — the place \(setting only\)\. Image 5 — the art style \(style only\)\./);
  assert.ok(gpt.includes(sample.brief), "the brief goes in whole");
  assert.match(gpt, /Exactly two people are in the frame, each of them once\./);
  assert.match(gpt, /The hero is the person in Images 1 and 2: keep their face, facial features, skin tone, hair, age and build exactly as there/);
  assert.match(gpt, /Person 2 is the person in Image 3/);
  assert.match(gpt, /Do not show: No other people, no blood on the floor, no text\./);
  assert.match(gpt, /No text, letters, numbers, logos, signs or watermarks/);
  assert.match(gpt, /Art style: Cinematic noir\.$/);
  assert.doesNotMatch(gpt, /Рэй|Мокей/, "no names in the prompt");
  const flux = compileBriefPrompt({ brief, people, references: references.slice(0, 2), style: "Cinematic noir", modelId: "fal-ai/flux-2/klein/9b" });
  assert.ok(flux.includes(sample.short) && !flux.includes(sample.brief), "FLUX reads the short form");
  assert.doesNotMatch(flux, /Do not show|No text/);
  assert.match(flux, /All surfaces, clothing, signs and objects are plain and unmarked\./);
  assert.match(flux, /The first image shows the hero's face and hair/);
  assert.match(flux, /Natural anatomy/);
  // Five people and no references: the count line still holds and nothing is locked.
  const crowd = compileBriefPrompt({ brief, people: Array.from({ length: 5 }, (_, i) => ({ key: `p${i}`, label: `person ${i + 1}`, pronoun: "they", appearance: "" })), references: [], style: "", modelId: "gpt-image-2.5-sunburst" });
  assert.match(crowd, /Exactly five people are in the frame/);
  assert.doesNotMatch(crowd, /Reference images/);
  assert.match(crowd, /Art style: painterly illustration with cinematic light\./);
});

test("the board carries visual profiles: the newest version wins; the parser bounds the changes", () => {
  const cid = randomUUID(), hero = randomUUID();
  const row = (version, source, changes = []) => ({ id: randomUUID(), subjectKind: "entity", subjectId: hero, version, look: `look v${version}`, changes, source, createdAt: `2026-10-17T0${version}:00:00Z` });
  const board = parsePictureBoard({ campaignId: cid, settings: {}, today: {}, styles: [], pictures: [], profiles: [row(2, "owner", ["a cut on the forearm", "", 7]), row(1, "model"), { bad: true }] });
  assert.equal(board.profiles.length, 2);
  const current = profileFor(board, { kind: "entity", id: hero });
  assert.equal(current.version, 2);
  assert.equal(current.source, "owner");
  assert.deepEqual(current.changes, ["a cut on the forearm"]);
  assert.equal(profileFor(board, { kind: "location", id: hero }), null);
  assert.deepEqual(emptyPictureBoard(cid).profiles, []);
  assert.equal(parseVisualProfile({ ...row(1, "model"), source: "dm" }), null);
});

test("migration 65: profiles are append-only versions per subject; a queued picture takes its brief, a ready one never", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610170065_polish2_shot_director.sql"));
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const read0 = await call(f, w.cid, "read");
    assert.deepEqual(read0.profiles, [], "the board lists profiles");
    const v1 = await call(f, w.cid, "profile.save", { id: randomUUID(), subjectKind: "entity", subjectId: w.hero, look: "A man of about forty.", changes: [], source: "model" });
    assert.equal(v1.version, 1);
    assert.equal(v1.source, "model");
    const v2 = await call(f, w.cid, "profile.save", { id: randomUUID(), subjectKind: "entity", subjectId: w.hero, look: "A man of about forty, grey at the temples.", changes: ["a fresh cut on the forearm"], source: "owner" });
    assert.equal(v2.version, 2);
    assert.deepEqual(v2.changes, ["a fresh cut on the forearm"]);
    const read = await call(f, w.cid, "read");
    assert.equal(read.profiles.length, 1, "the newest version of each subject");
    assert.equal(read.profiles[0].version, 2);
    await fails(call(f, w.cid, "profile.save", { id: randomUUID(), subjectKind: "entity", subjectId: randomUUID(), look: "x", changes: [], source: "model" }), "rpg_not_found");
    await fails(call(f, w.cid, "profile.save", { id: randomUUID(), subjectKind: "entity", subjectId: w.hero, look: "x", changes: [""], source: "model" }), "rpg_validation");
    await fails(call(f, w.cid, "profile.save", { id: randomUUID(), subjectKind: "entity", subjectId: w.hero, look: "x", changes: [], source: "dm" }), "rpg_validation");
    await fails(f.one("update rpg_private.visual_profiles set look='changed' where id=$1", [v1.id]), "rpg_conflict");
    await fails(f.one("delete from rpg_private.visual_profiles where id=$1", [v1.id]), "rpg_conflict");
    await fails(call(f, w.cid, "read", {}, f.other), "rpg_forbidden");
    // The brief of a queued picture: prompt, shot and references change; a ready picture is immutable.
    const base = { timeline: fence, tier: "fast", trigger: "live", model: "gpt-image-2.5-flare", styleVersionId: null, shot: { who: ["Ari"], action: "x" }, prompt: "A shot prompt.", referenceIds: [] };
    const anchor = await call(f, w.cid, "picture.create", { id: randomUUID(), kind: "anchor", subjectKind: "entity", subjectId: w.hero, composition: "portrait", ...base, trigger: "manual", tier: "quality" });
    await call(f, w.cid, "picture.update", { id: anchor.id, status: "generating" });
    await call(f, w.cid, "picture.update", { id: anchor.id, status: "ready", output: { storagePath: `${w.cid}/pictures/${anchor.id}.jpg`, contentType: "image/jpeg", width: 1024, height: 1024, bytes: 1000, sha256: "b".repeat(64) }, costUsdMicros: 45000 });
    const turnId = randomUUID();
    await f.one("insert into rpg_private.turns(id,campaign_id,owner_id,input,expected_revision,settings_revision,settings,guide_revision) values($1,$2,$3,'{}',1,1,'{}',1)", [turnId, w.cid, f.owner]);
    const frame = await call(f, w.cid, "picture.create", { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame", ...base });
    const briefed = await call(f, w.cid, "picture.brief", { id: frame.id, prompt: "The brief prompt.", shot: { who: ["Ari", "Mokey"], brief: { brief: "words" } }, referenceIds: [anchor.id] });
    assert.equal(briefed.id, frame.id);
    const priv = await call(f, w.cid, "picture.private", { id: frame.id });
    assert.equal(priv.prompt, "The brief prompt.");
    assert.deepEqual(priv.shot.who, ["Ari", "Mokey"]);
    assert.deepEqual(priv.referenceIds, [anchor.id]);
    await fails(call(f, w.cid, "picture.brief", { id: frame.id, prompt: "x", shot: null, referenceIds: [randomUUID()] }), "rpg_conflict", "references must be ready pictures");
    await call(f, w.cid, "picture.update", { id: frame.id, status: "generating" });
    await call(f, w.cid, "picture.brief", { id: frame.id, prompt: "Still allowed while generating.", shot: null, referenceIds: [] });
    await fails(call(f, w.cid, "picture.brief", { id: anchor.id, prompt: "late", shot: null, referenceIds: [] }), "rpg_conflict", "a ready picture keeps its prompt");
    await fails(f.one("update rpg_private.pictures set prompt='hacked' where id=$1", [anchor.id]), "rpg_conflict");
    assert.ok(!("prompt" in briefed) && !("shot" in briefed), "the projection never carries the brief");
  } finally {
    await f.db.close();
  }
});

test("the wiring: the frames panel sends the owner's comment with the redraw; the cards carry the profile editor; the service directs after the response", () => {
  const frames = src("src/components/registry/live-frames.tsx");
  assert.match(frames, /trigger: "redraw", \.\.\.\(text \? \{ comment: text \} : \{\}\)/);
  assert.match(frames, /data-testid="redraw-comment"/);
  const redraw = src("src/components/registry/redraw-anchor.tsx");
  assert.match(redraw, /pictures\.profile\.save/);
  assert.match(redraw, /pictures\.profile\.draft/);
  assert.match(redraw, /data-testid="visual-profile-look"/);
  const service = src("src/lib/server/media/pictures-service.ts");
  assert.match(service, /const directed = await directFrame\(ctx, picture\.id/, "the brief is written after the response, before the paid picture");
  assert.match(service, /wholeNarration\(ctx\.campaignId, operationId, trigger === "live" \? NARRATION_WAIT_MS : 0\)/, "a live frame waits for the whole narration");
  assert.match(service, /compileEditPrompt\(brief\.edit!, promptFamily\(input\.model\)\)/, "a redraw with a comment is an edit of the previous frame");
  assert.match(service, /referenceIds = edit \? \[previousOfTurn!\.id\]/);
  assert.match(service, /ctx\.rpc\("profile\.save", \{ id: crypto\.randomUUID\(\), subjectKind: subject\.kind, subjectId: subject\.id, look: current\?\.look \?\? ""/, "a story change joins the profile without touching the owner's look");
  assert.match(service, /if \(!profileFor\(board, subject\)\?\.look\.trim\(\)\) await draftProfileFor/, "a ready anchor without a profile gets one drafted");
  const route = src("src/app/api/visual-frame/route.ts");
  assert.match(route, /case "pictures\.profile\.save": return saveVisualProfile/);
  assert.match(route, /case "pictures\.profile\.draft": return draftVisualProfile/);
  const model = src("src/lib/server/media/brief-model.ts");
  assert.match(model, /model: BRIEF_MODEL, max_tokens: 3000, output_config: \{ effort: "low" \}/);
  assert.doesNotMatch(model, /console\./, "the model layer logs nothing (no prompt, no key)");
});
