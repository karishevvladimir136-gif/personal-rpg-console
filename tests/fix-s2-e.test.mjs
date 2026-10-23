// Fix run after session 2, stage E (docs/stages/FIX_S2_CDEF.md «Stage E»): frames that match their turn — role words to
// people, no frame for an out-of-game reply, the caption of the shot's own moment, gear only from the records, gaze
// and hands per person, identity-only references, a temporary look kept until the story removes it, the vision check
// with one automatic redraw, the daily count from the owner's local midnight. Synthetic fixtures only.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applyLookChange, briefRequest, compileBriefPrompt, parseBrief, relabel } from "../src/lib/visual-frame/brief.ts";
import { compileAnchorPrompt } from "../src/lib/visual-frame/prompt-compiler.ts";
import { correctionLine, frameCheckRequest, parseFrameCheck, checkFrame } from "../src/lib/visual-frame/frame-check.ts";
import { fallbackShot, outOfGameOnly, parseShot, resolveWho, shotRequest, storyText } from "../src/lib/visual-frame/shot.ts";
import { parsePicture, parsePictureSettings } from "../src/lib/visual-frame/pictures.ts";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { buildDigestRequest, parseDigest, sessionPeople, sessionShape, LONG_SESSION } from "../src/lib/gameplay/dm-loop/digest.ts";

const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_pictures($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));

// A synthetic scene: the hero is a mage, a sergeant and a scout ride with him, a merchant waits in the yard.
const HERO = "11111111-1111-4111-8111-111111111111", SERGEANT = "22222222-2222-4222-8222-222222222222", SCOUT = "33333333-3333-4333-8333-333333333333", MERCHANT = "44444444-4444-4444-8444-444444444444";
const scene = [
  { id: MERCHANT, name: "Тобиас Крейн", kind: "npc", role: "Купец, торгует железом во дворе." },
  { id: SCOUT, name: "Лира", kind: "companion", role: "a companion of the party; Scout; Разведчица из пограничья." },
  { id: SERGEANT, name: "Хальвар", kind: "companion", role: "a companion of the party; Veteran; Сержант стражи, седой и упрямый." },
  { id: HERO, name: "Эдрик Вейл", kind: "player", role: "the hero; Wizard; Молодой маг из академии." },
];

test("E: role words resolve to the scene's people — «маг» is the hero, the sergeant and the merchant by their roles, names by their stems", () => {
  assert.deepEqual(resolveWho(["маг", "сержант"], scene), [HERO, SERGEANT], "«Горн выслушивает мага» — the mage is the hero, not a stranger");
  assert.deepEqual(resolveWho(["мага", "сержанта", "купца"], scene), [HERO, SERGEANT, MERCHANT], "inflected role words");
  assert.deepEqual(resolveWho(["the mage", "the old sergeant", "the scout"], scene), [HERO, SERGEANT, SCOUT], "English role words find the records' own words");
  assert.deepEqual(resolveWho(["Хальвара", "Эдрик"], scene), [SERGEANT, HERO], "names first");
  assert.deepEqual(resolveWho(["волк", "магазин"], scene), [null, null], "a creature nobody records; «магазин» is not «маг»");
});

test("E: an out-of-game reply is no moment of the story — no frame; an aside inside a story turn never reaches the shot", () => {
  assert.equal(outOfGameOnly("(Вне игры: записываю.)"), true);
  assert.equal(outOfGameOnly("*(Вне игры: да, давай на «ты».)*"), true, "the asterisk form of session 2");
  assert.equal(outOfGameOnly("OOC: noted, the rest is tomorrow."), true);
  const turn = "(Вне игры: записываю.)\n\nСержант присаживается у костра и чертит палкой в пыли путь до рудника.";
  assert.equal(outOfGameOnly(turn), false);
  assert.equal(storyText(turn), "Сержант присаживается у костра и чертит палкой в пыли путь до рудника.");
  assert.equal(storyText("Ты киваешь. (Вне игры: бросок за меня.) Сержант уходит."), "Ты киваешь. Сержант уходит.");
  assert.equal(outOfGameOnly("Вне игровых правил нет, говорит сержант, и это правда, которую знает вся застава."), false, "«вне игровых» is not «вне игры»");
  assert.equal(outOfGameOnly("Сержант кивает."), false, "a short story line is still story");
});

test("E: the shot and the brief resolve role words, write the caption in the campaign language, direct gaze and hands, keep gear to the records", () => {
  const context = { heroName: "Эдрик Вейл", names: ["Хальвар", "Лира"], placeName: "Застава", language: "ru", people: scene.map(({ name, role }) => ({ name, role })) };
  const shot = shotRequest("Хальвар выслушивает мага и кивает.", context);
  assert.match(shot.system, /маг, сержант, купец, мальчишка/);
  assert.match(shot.system, /never list a role word/);
  assert.match(shot.system, /caption: the moment this shot shows, one sentence of at most 160 characters in Russian/);
  assert.match(shot.user, /Who they are:\n[^]*Эдрик Вейл — the hero; Wizard; Молодой маг/);
  assert.equal(parseShot('{"who":["Эдрик Вейл"],"action":"the hero kneels","where":"","angle":"","mood":"","caption":"Эдрик опускается на колено."}').caption, "Эдрик опускается на колено.");
  assert.equal(fallbackShot("Ты опускаешься на колено. Дальше тихо.", context).caption, "Ты опускаешься на колено.", "without the model the caption is the shot's own sentence");

  const { system, user } = briefRequest({
    narration: "Ты поднимаешься из-за корневища на колено и целишься.", heroName: "Эдрик Вейл", names: ["Хальвар"], people: context.people, placeName: "Овраг",
    profiles: [], state: [{ name: "Хальвар", lines: ["wears or holds Длинный меч, Кольчуга", "holds no weapon or tool of their own"] }], clock: { timeOfDay: null },
    previous: null, style: "", comment: null, language: "ru",
  });
  assert.match(system, /very often the role word is the hero/);
  assert.match(system, /caption: that same moment for the reader, one sentence of at most 160 characters in Russian/);
  assert.match(system, /from the narration only, never from the private notes/);
  assert.match(system, /looksAt — at whom or what this person looks/);
  assert.match(system, /never at the viewer and never up into the distance/);
  assert.match(system, /which hand does what/);
  assert.match(system, /a person at 0 hit points or unconscious: eyes closed/);
  assert.match(system, /where the hero is in the moment — in the open, hidden or behind what/);
  assert.match(system, /never add a weapon, a shield, a lantern, a torch/);
  assert.match(system, /identity only: never describe a pose, a head angle or a gaze taken from them/);
  assert.match(system, /"no longer: "/);
  assert.match(user, /Visible state from the records \(what each person wears, holds and carries — nothing else\):\nХальвар: wears or holds Длинный меч/);

  const brief = parseBrief(JSON.stringify({
    who: ["Эдрик Вейл", "Хальвар"], beat: "The hero rises to one knee behind the root and aims.", caption: "Эдрик поднимается из-за корневища на колено и целится.",
    people: [{ who: "Эдрик Вейл", label: "the hero", looksAt: "the bandits across the ravine", expression: "tense, focused", action: "kneels behind a root, aiming a light crossbow", hands: "left hand steadies the stock, right hand on the trigger" },
      { who: "Хальвар", label: "the sergeant", looksAt: "Эдрика", expression: "grim", action: "crouches beside him", hands: null }],
    brief: "A ravine at dusk. In the foreground the hero kneels behind a thick root, half hidden, aiming a light crossbow across the stream bed; the sergeant crouches beside him with his longsword drawn, watching the hero. Bandits move among the rocks on the far side. Low cold light, deep shadows under the roots. Camera low and close behind the root, the far side soft. The scene keeps the stream bed and cliffs of the previous frame, the light now lower.",
    short: "A hero kneeling behind a root aims a crossbow across a ravine, a grim sergeant crouched beside him.", avoid: "no shield, no lantern, no text",
    timeOfDay: "dusk", weather: null, profileUpdates: [], edit: null,
  }));
  assert.equal(brief.caption, "Эдрик поднимается из-за корневища на колено и целится.");
  assert.equal(brief.people.length, 2);
  assert.equal(brief.people[0].hands, "left hand steadies the stock, right hand on the trigger");

  const prompt = compileBriefPrompt({
    brief, style: "", modelId: "gpt-image-2.5-sunburst",
    people: [
      { key: HERO, label: "the hero", pronoun: "they", appearance: "", gear: { worn: ["Посох", "Мантия"], packed: ["Верёвка"] }, direction: brief.people[0] },
      { key: SERGEANT, label: "the sergeant", pronoun: "they", appearance: "", gear: { worn: ["Длинный меч", "Кольчуга"], packed: [] },
        direction: { ...brief.people[1], looksAt: relabel(brief.people[1].looksAt, [{ name: "Эдрик Вейл", label: "the hero" }]) } },
    ],
    references: [{ role: "face", person: HERO }, { role: "face", person: SERGEANT }],
  });
  assert.match(prompt, /That picture shows identity only: do not copy its pose, head angle, gaze or expression/);
  assert.match(prompt, /The hero: kneels behind a root, aiming a light crossbow; looks at the bandits across the ravine; expression: tense, focused; left hand steadies the stock, right hand on the trigger\./);
  assert.match(prompt, /The sergeant: crouches beside him; looks at the hero; expression: grim\./, "a name in the direction becomes the label");
  assert.match(prompt, /The sergeant wears or holds: Длинный меч, Кольчуга\. Besides what this moment puts in their hands, nothing else: no other weapon, no shield, no lantern, no torch\./);
  assert.match(prompt, /packed away, not in hand: Верёвка/);
  assert.match(prompt, /exactly two arms and two hands with five fingers each/);
  assert.doesNotMatch(prompt, /Эдрик|Хальвар/, "no name reaches the image model");
  const prose = compileBriefPrompt({ brief: { ...brief, brief: `${brief.brief} He looks at Halvar.` }, people: [], references: [], style: "", modelId: "gpt-image-2.5-sunburst",
    names: [{ name: "Хальвар", label: "the sergeant" }] });
  assert.match(prose, /He looks at the sergeant\./, "a name in the brief's own prose (the probe's «looking at Lira») becomes the label");
  assert.equal(relabel("looks at Lira and at Halvar", [{ name: "Лира", label: "the scout" }, { name: "Хальвар", label: "the sergeant" }]), "looks at the scout and at the sergeant",
    "a name the model spelled in Latin letters goes too (the probe's «looks at Lira»)");
  const flux = compileBriefPrompt({ brief, style: "", modelId: "fal-ai/flux-2-pro", people: [{ key: SERGEANT, label: "the sergeant", pronoun: "they", appearance: "", gear: { worn: ["Длинный меч"], packed: [] } }], references: [] });
  assert.match(flux, /The sergeant's gear: Длинный меч\./);
  assert.doesNotMatch(flux, /no shield/, "FLUX reads no negatives");
});

test("E: a temporary look stays until the story removes it; the portrait anchor is neutral, front to three-quarter", () => {
  const soot = applyLookChange([], "ash paste and soot smeared over his face");
  assert.deepEqual(soot, ["ash paste and soot smeared over his face"]);
  assert.equal(applyLookChange(soot, "ash paste and soot smeared over his face"), null, "the same change once");
  const burned = applyLookChange(soot, "the hem of his robe burned");
  assert.deepEqual(applyLookChange(burned, "no longer: soot on his face"), ["the hem of his robe burned"], "the face washed — only the robe stays");
  assert.equal(applyLookChange(burned, "no longer: a bandage on the arm"), null, "nothing to remove");
  const anchor = compileAnchorPrompt({ person: { key: HERO, label: "the hero", pronoun: "he", appearance: "a young man" }, composition: "portrait", references: [], style: "" }, "gpt-image");
  assert.match(anchor, /front view turned slightly to a gentle three-quarter, head level, looking straight at the viewer, calm neutral expression/);
  assert.doesNotMatch(anchor, /expressive face/);
});

test("E: the vision check names limbs, gear the person does not have and open eyes at 0 HP; a failed check corrects the redraw", async () => {
  const people = [{ key: HERO, label: "the hero", worn: ["Посох"], packed: [], down: true }, { key: SERGEANT, label: "the sergeant", worn: ["Длинный меч"], packed: [], down: false }];
  const request = frameCheckRequest({ people, moment: "The hero lies behind the burning cart; the sergeant stands over the dead leader." });
  assert.match(request, /1\. the hero: wears or holds Посох; DOWN at 0 hit points — unconscious, eyes must be closed\./);
  assert.match(request, /an extra or a missing arm, hand or leg/);
  assert.match(request, /a weapon, a shield, a lantern, a torch/);
  assert.match(request, /other figures the moment itself names \(a sentry, a figure in the distance, a crowd\) are fine/);
  assert.match(src("src/lib/visual-frame/frame-check.ts"), /max_tokens: FRAME_CHECK_MAX_TOKENS/);
  assert.ok((await import("../src/lib/visual-frame/frame-check.ts")).FRAME_CHECK_MAX_TOKENS >= 2000, "room for the model's thinking (700 was all thinking in the probe)");
  const verdict = parseFrameCheck('{"problems":["the hero has three hands","the sergeant holds a shield"],"gaze":[{"person":1,"looksAt":"up-right"},{"person":2,"looksAt":"the hero"},{"person":9,"looksAt":"x"}]}', people);
  assert.deepEqual(verdict.problems, ["the hero has three hands", "the sergeant holds a shield"]);
  assert.deepEqual(verdict.gaze, [{ key: HERO, looksAt: "up-right" }, { key: SERGEANT, looksAt: "the hero" }]);
  assert.equal(parseFrameCheck("not json", people), null);
  assert.match(correctionLine(verdict.problems), /^Correct these mistakes of an earlier drawing of this moment: the hero has three hands; the sergeant holds a shield\./);
  // One request with the picture; the key goes in the header only.
  let sent = null;
  const fetcher = async (url, init) => { sent = { url, init }; return new Response(JSON.stringify({ content: [{ type: "text", text: '{"problems":[],"gaze":[]}' }], usage: { input_tokens: 1800, output_tokens: 40 } }), { status: 200 }); };
  const result = await checkFrame("test-key", { image: { bytes: new Uint8Array([1, 2, 3]), contentType: "image/png" }, people, moment: "m" }, { fetcher });
  assert.deepEqual(result.verdict, { problems: [], gaze: [] });
  assert.equal(JSON.parse(sent.init.body).model, "claude-haiku-5-5");
  assert.equal(JSON.parse(sent.init.body).messages[0].content[0].type, "image");
  assert.ok(!sent.init.body.includes("test-key"));
  assert.equal((await checkFrame("", { image: { bytes: new Uint8Array(1), contentType: "image/png" }, people, moment: "" })).error, "not_configured");
  assert.equal((await checkFrame("k", { image: { bytes: new Uint8Array(4_000_000), contentType: "image/png" }, people, moment: "" }, { fetcher })).error, "too_large");
});

test("E: the picture projection carries the caption and the review; the settings carry the owner's zone", () => {
  const base = { id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: randomUUID(), composition: "frame", timeline: { timelineId: randomUUID(), epoch: 1 }, version: 1, status: "ready",
    model: "gpt-image-2.5-sunburst", tier: "fast", trigger: "live", createdAt: "2026-10-20T00:00:00Z" };
  const picture = parsePicture({ ...base, caption: "  Сержант чертит в пыли путь.  ", review: { ok: false, problems: ["three hands"], redrawId: base.id, gaze: [{ key: HERO, looksAt: "the map" }], checkedAt: "t" } });
  assert.equal(picture.caption, "Сержант чертит в пыли путь.");
  assert.deepEqual(picture.review, { ok: false, problems: ["three hands"], redrawId: base.id, gaze: [{ key: HERO, looksAt: "the map" }], checkedAt: "t" });
  assert.equal(parsePicture(base).caption, null);
  assert.equal(parsePicture(base).review, null);
  assert.equal(parsePictureSettings({ timeZone: "America/Los_Angeles" }).timeZone, "America/Los_Angeles");
  assert.equal(parsePictureSettings({ timeZone: "'; drop table" }).timeZone, "UTC");
});

test("E migration 79: a caption with the picture or its brief; the review once, on a ready picture; the day starts at the owner's midnight", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes("202610200079_fix_s2_pictures.sql"));
    const w = await world(f);
    const fence = await f.fence(w.cid);
    const turnId = randomUUID();
    await f.one("insert into rpg_private.turns(id,campaign_id,owner_id,input,expected_revision,settings_revision,settings,guide_revision) values($1,$2,$3,'{}',1,1,'{}',1)", [turnId, w.cid, f.owner]);
    const base = { kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame", timeline: fence, tier: "fast", trigger: "live", model: "gpt-image-2.5-sunburst", styleVersionId: null, shot: { who: [] }, prompt: "p", referenceIds: [] };
    const frame = await call(f, w.cid, "picture.create", { id: randomUUID(), ...base, caption: "  Эдрик опускается на колено.  " });
    assert.equal(frame.caption, "Эдрик опускается на колено.");
    const old = await call(f, w.cid, "picture.create", { id: randomUUID(), ...base });
    assert.equal(old.caption, null, "a caller without a caption (the older path) still works");
    const briefed = await call(f, w.cid, "picture.brief", { id: frame.id, prompt: "p2", shot: null, referenceIds: [], caption: "Эдрик целится из-за корневища." });
    assert.equal(briefed.caption, "Эдрик целится из-за корневища.");
    assert.equal((await call(f, w.cid, "picture.brief", { id: frame.id, prompt: "p3", shot: null, referenceIds: [] })).caption, "Эдрик целится из-за корневища.", "a brief without a caption keeps it");
    await fails(call(f, w.cid, "picture.review", { id: frame.id, review: { ok: true, problems: [] } }), "rpg_conflict", "a queued picture is not reviewed");
    await call(f, w.cid, "picture.update", { id: frame.id, status: "generating" });
    await call(f, w.cid, "picture.update", { id: frame.id, status: "ready", output: { storagePath: `${w.cid}/pictures/${frame.id}.png`, contentType: "image/png", width: 1536, height: 1024, bytes: 1000, sha256: "c".repeat(64) } });
    await fails(call(f, w.cid, "picture.brief", { id: frame.id, prompt: "late", shot: null, referenceIds: [], caption: "late" }), "rpg_conflict");
    await fails(f.one("update rpg_private.pictures set caption='hacked' where id=$1", [frame.id]), "rpg_conflict");
    const reviewed = await call(f, w.cid, "picture.review", { id: frame.id, review: { ok: false, problems: ["three hands"], redrawId: null, gaze: [], checkedAt: "now" } });
    assert.deepEqual(reviewed.review.problems, ["three hands"]);
    await fails(call(f, w.cid, "picture.review", { id: frame.id, review: { ok: true, problems: [] } }), "rpg_conflict", "once");
    await fails(f.one("update rpg_private.pictures set review='{\"ok\":true}' where id=$1", [frame.id]), "rpg_conflict");
    await call(f, w.cid, "picture.hide", { id: frame.id, hidden: true });
    const read = await call(f, w.cid, "read");
    assert.equal(read.pictures.find((row) => row.id === frame.id).caption, "Эдрик целится из-за корневища.");
    assert.equal(read.settings.timeZone, "UTC");

    // The day: two pictures yesterday evening in Los Angeles (after UTC midnight), one the evening before.
    const settings = read.settings;
    const save = (extra) => call(f, w.cid, "settings.save", { expectedRevision: settings.revision, frames: settings.frames, quality: settings.quality, dailyCap: settings.dailyCap, autopilot: settings.autopilot, ...extra });
    await fails(save({ timeZone: "Mars/Olympus_Mons" }), "rpg_validation");
    const saved = await save({ timeZone: "America/Los_Angeles" });
    assert.equal(saved.timeZone, "America/Los_Angeles");
    const kept = await call(f, w.cid, "settings.save", { expectedRevision: saved.revision, frames: "key", quality: saved.quality, dailyCap: saved.dailyCap, autopilot: saved.autopilot });
    assert.equal(kept.timeZone, "America/Los_Angeles", "a save without the zone keeps it");
    const localMidnight = (await f.one("select (date_trunc('day', now() at time zone 'America/Los_Angeles') at time zone 'America/Los_Angeles') t")).t;
    const utcMidnight = (await f.one("select (date_trunc('day', now() at time zone 'UTC') at time zone 'UTC') t")).t;
    const today = (await f.one("select rpg_private.picture_today($1) t", [w.cid])).t;
    assert.equal(new Date(today.since).getTime(), new Date(localMidnight).getTime(), "the count starts at midnight in Los Angeles");
    // created_at is immutable through the trigger: the test moves one row back with the trigger off.
    const count = async () => (await f.one("select rpg_private.picture_today($1) t", [w.cid])).t.count;
    const before = await count();
    await f.db.query("alter table rpg_private.pictures disable trigger picture_immutable");
    await f.db.query("update rpg_private.pictures set created_at=$2 where id=$1", [old.id, new Date(new Date(localMidnight).getTime() - 60_000).toISOString()]);
    await f.db.query("alter table rpg_private.pictures enable trigger picture_immutable");
    assert.equal(await count(), before - 1, "a picture drawn a minute before the owner's midnight is yesterday's");
    assert.notEqual(new Date(localMidnight).getTime(), new Date(utcMidnight).getTime(), "Los Angeles is not UTC");
    assert.equal((await f.one("select rpg_private.picture_zone('Nowhere/Land') z")).z, "UTC", "an unknown zone counts as UTC");
  } finally {
    await f.db.close();
  }
});

test("E wiring: the service refuses a frame for an out-of-game turn, resolves role words, sends the caption and checks each drawn frame once", () => {
  const service = src("src/lib/server/media/pictures-service.ts");
  assert.match(service, /if \(mode === "ooc" \|\| mode === "feedback" \|\| \(finished && outOfGameOnly\(text\)\)\) return \{ status: "ooc" \};/);
  assert.match(service, /paragraphFor\(trigger, storyText\(text\), finished\)/);
  assert.match(service, /const resolved = resolveWho\(shot\.who, scene\);/);
  assert.match(service, /caption: shot\.caption \?\? null/);
  assert.match(service, /\.\.\.\(brief\.caption \? \{ caption: brief\.caption \} : \{\}\)/);
  assert.match(service, /typeof meta\.autoRedrawOf !== "string"/, "one automatic redraw, never a second");
  assert.match(service, /capRemaining\(board\) > 0/, "never past the daily cap");
  assert.match(service, /applyLookChange\(/);
  assert.match(src("src/lib/server/media/pictures-store.ts"), /isTimeZone\(value\.timeZone\) \? \{ timeZone: value\.timeZone \} : \{\}/);
});

// --- the session close (item 81) -------------------------------------------------------------------------------------
test("E: the session's length decides its ending — «что было» after an hour, the cards after a long evening; pauses are not play", () => {
  const at = (minute) => new Date(Date.UTC(2026, 9, 20, 18, 0) + minute * 60_000).toISOString();
  const hour = Array.from({ length: 24 }, (_, index) => ({ role: index % 2 ? "narration" : "player", created_at: at(index * 2.5) }));
  assert.deepEqual(sessionShape(hour), { turns: 12, playMinutes: 58, form: "short" });
  const night = [...hour, { role: "player", created_at: at(60 * 14) }, { role: "narration", created_at: at(60 * 14 + 1) }];
  assert.equal(sessionShape(night).form, "short", "a session left open overnight is not fourteen hours of play");
  assert.equal(sessionShape(night).playMinutes, 58 + 15 + 1);
  const long = Array.from({ length: 2 * LONG_SESSION.turns }, (_, index) => ({ role: index % 2 ? "narration" : "player", created_at: at(index) }));
  assert.equal(sessionShape(long).form, "cards", "thirty turns");
  const slow = Array.from({ length: 40 }, (_, index) => ({ role: index % 2 ? "narration" : "player", created_at: at(index * 5) }));
  assert.equal(sessionShape(slow).turns, 20);
  assert.equal(sessionShape(slow).form, "cards", "three hours and more");
});

test("E: the digest asks for the form the length decided — cards for the people met, open threads from all live threads, «Тем временем» through the world; the parser bounds it", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const companion = source.snapshot.entities.find((row) => row.kind !== "player" && row.kind !== "faction");
    assert.ok(companion, "the fixture has someone besides the hero");
    const scenes = [{ role: "player", body: "Иду к костру." }, { role: "narration", body: `${companion.name} подсаживается к огню и молчит.` }];
    assert.deepEqual(sessionPeople(source, scenes).map((row) => row.id), [companion.id]);
    const session = { id: randomUUID(), title: "Вечер", scenes, startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes };
    const long = buildDigestRequest(source, { ...session, shape: { turns: 34, playMinutes: 250, form: "cards" } }, "high");
    const text = long.messages[0].text, now = long.system.at(-1).text;
    assert.match(text, /"cards": \[ \{ "entityId"/);
    assert.doesNotMatch(text, /"lines":/);
    assert.match(text, /three or four sentences looking forward — where the hero is now, what is at stake, what comes next; not a list of facts, no minor details/);
    assert.match(text, /from all live threads of the story, not only the quest log/);
    assert.match(text, /a guard's report to the captain, a rumour in the market, a letter, a messenger\. Not an all-seeing camera/);
    assert.match(text, /it never answers a question the hero was left with/);
    assert.match(now, /It was a long session: 34 turns, about 4\.2 hours of play\. Close it with the ending cards/);
    assert.match(now, new RegExp(`PEOPLE OF THIS SESSION \\(ID — name\\): ${companion.id} — `));
    const short = buildDigestRequest(source, { ...session, shape: { turns: 9, playMinutes: 50, form: "short" } }, "high");
    assert.match(short.messages[0].text, /"lines": \["«what happened»: 3–5 short lines/);
    assert.doesNotMatch(short.messages[0].text, /"cards":/);
    assert.doesNotMatch(short.system.at(-1).text, /PEOPLE OF THIS SESSION/);

    const reply = JSON.stringify({ recap: "Мы у заставы. Ставка — караван через шесть дней. Дальше — покупатель железа.", title: "Зелёный сургуч", notebook: "n", plans: [],
      cards: [{ entityId: companion.id, name: companion.name, where: "у костра", standing: "доверяет", fate: "остаётся с отрядом" },
        { entityId: randomUUID(), name: "Освобождённые пленники", where: "неизвестно", standing: "благодарны", fate: "ушли на юг" },
        { entityId: null, name: "", where: "", standing: "", fate: "без имени" }],
      threads: ["Раненый на свободе", "Покупатель железа", "Караван через шесть дней"], lines: ["не для длинной"],
      stinger: "Стражник докладывает капитану: раненого видели на окраине.", channel: "донесение капитану стражи" });
    const digest = parseDigest(reply, source, source.runtime.worldMinutes, long.shape, long.people);
    assert.equal(digest.ending.form, "cards");
    assert.deepEqual(digest.ending.cards.map((row) => row.entityId), [companion.id, null], "an unknown ID becomes a group card; a card without a name goes");
    assert.deepEqual(digest.ending.lines, [], "no «что было» lines in the long form");
    assert.equal(digest.ending.threads.length, 3);
    assert.equal(digest.ending.channel, "донесение капитану стражи");
    assert.equal(digest.ending.turns, 34);
    const plain = parseDigest(JSON.stringify({ recap: "r", title: "t", notebook: "", plans: [], lines: ["Пришли к заставе."], stinger: "" , channel: "слух" }), source, 0);
    assert.equal(plain.ending.form, "short", "older callers get the short form");
    assert.deepEqual(plain.ending.lines, ["Пришли к заставе."]);
    assert.equal(plain.ending.channel, "", "no channel without a stinger");

    // Migration 80: rpg_dossier stores the ending with the recap; the public snapshot carries it; a digest without it keeps it.
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    const sessionId = (await c.f.one("select current_session_id from public.rpg_public_state where campaign_id=$1", [c.cid])).current_session_id;
    await c.f.memory(c.cid, "end", { requestId: randomUUID(), campaignId: c.cid, expectedRevision: play.revision, sessionId }, play.timeline);
    await c.dossier("digest", { sessionId, recap: digest.recap, title: digest.title, notebook: digest.notebook, plans: [], stinger: digest.stinger, ending: digest.ending }, source.timeline);
    const snapshot = await c.f.saves(c.cid, "campaign");
    const stored = snapshot.sessions.find((row) => row.id === sessionId);
    assert.equal(stored.ending.form, "cards");
    assert.equal(stored.ending.cards[0].fate, "остаётся с отрядом");
    await c.dossier("digest", { sessionId, recap: "r2", title: "t2", notebook: "", plans: [] }, source.timeline);
    assert.equal((await c.f.saves(c.cid, "campaign")).sessions.find((row) => row.id === sessionId).ending.form, "cards", "kept");
    assert.deepEqual((await c.f.one("select rpg_private.timeline_row_defaults('public.rpg_sessions') d")).d, { stinger: "", ending: {} });
  } finally { await c.f.db.close(); }
});

test("E wiring: the session close shows «Что было» or the cards with portraits, the gathered threads and the channel of «Тем временем»", () => {
  const view = src("src/components/registry/session-end.tsx");
  assert.match(view, /c\("Что было", "What happened"\)/);
  assert.match(view, /c\("Судьбы", "Fates"\)/);
  // Fix S3-accept Е1: the portrait «Люди» shows (an anchor or an earlier picture), through the shared resolver.
  assert.match(view, /<Art subject=\{\{ kind: "entity", id: entityId \}\} name=\{card\.name\}/);
  assert.match(view, /c\("Открытые нити", "Open threads"\)/);
  assert.match(view, /ending\?\.channel \? ` · \$\{ending\.channel\}` : ""/);
  assert.match(src("src/lib/server/session-digest.ts"), /const shape = sessionShape\(rows\);/);
  assert.match(src("src/lib/server/session-digest.ts"), /ending: result\.digest\.ending,/);
});

test("E (item 75): the party council never offers the hero as a listener, and the council's people are the companions", () => {
  const composer = src("src/components/gameplay-composer.tsx");
  assert.match(composer, /row\.id !== companionId && row\.kind !== "player" &&\s*play\.configuration\?\.presentEntityIds\.includes\(row\.id\)/);
  assert.match(src("src/lib/ui/campaign-view.ts"), /export function partyOf[^]*?\.filter\(\(row\) => row\.kind === "companion"\)/);
});

test("E (items 77, 80): the frame button says every answer in words; the gallery holds every frame in story order by session with its own caption", async () => {
  const { frameStatusText, galleryChapters, frameCaptionOf } = await import("../src/lib/visual-frame/pictures.ts");
  assert.equal(frameStatusText("queued", "ru"), null, "a queued frame shows itself drawing");
  assert.equal(frameStatusText("cap", "ru"), "Дневной лимит картинок исчерпан — новый день начнётся в полночь.");
  assert.equal(frameStatusText("no_text", "ru"), "У этого хода нет текста — рисовать нечего.");
  assert.equal(frameStatusText("ooc", "ru"), "Это ответ вне игры — кадр ему не нужен.");
  assert.equal(frameStatusText("off", "en"), "Frames are off in the picture settings.");
  assert.match(frameStatusText("error", "ru"), /попробуй ещё раз/);
  const session = (id, at) => ({ id, campaign_id: "c", title: id, status: "closed", recap: "", revision: 1, updated_at: at });
  const turn = (id, sid, at) => ({ id, session_id: sid, input: "", narration: `Ход ${id}.`, created_at: at, status: "committed", mode: "game" });
  const frame = (id, turnId, at, extra = {}) => ({ id, kind: "frame", subjectKind: "turn", subjectId: turnId, composition: "frame", version: 1, status: "ready", hidden: false, createdAt: at, caption: null, review: null, ...extra });
  const chapters = galleryChapters({ sessions: [session("s2", "2026-10-20"), session("s1", "2026-10-19")] },
    [turn("a", "s1", "1"), turn("b", "s1", "2"), turn("c", "s2", "3"), turn("d", "s2", "4")],
    { pictures: [frame("fa", "a", "1", { caption: "Сержант чертит путь." }), frame("fc", "c", "3"), frame("fd", "d", "4", { hidden: true })] });
  assert.deepEqual(chapters.map((row) => [row.session.id, row.frames.map((f) => f.picture.id)]), [["s1", ["fa"]], ["s2", ["fc"]]], "story order by session; a hidden frame stays out");
  assert.equal(frameCaptionOf(chapters[0].frames[0].turn, chapters[0].frames[0].picture), "Сержант чертит путь.");
  assert.equal(frameCaptionOf(chapters[1].frames[0].turn, chapters[1].frames[0].picture), "Ход c.");

  const gallery = src("src/components/registry/pictures-screen.tsx");
  for (const label of ['c("Галерея", "Gallery")', 'c(`Кадры · ${frameCount}`', 'c("Люди", "People")', 'c("Места", "Places")', 'c("Вещи", "Things")', 'c("Карты", "Maps")'])
    assert.ok(gallery.includes(label), label);
  assert.match(gallery, /turnHref=\{\(turnId\) => `\$\{gameHref\}#saved-turn-\$\{turnId\}`\}/, "«К ходу» opens the turn in the game");
  assert.match(gallery, /"pictures\.frame", \{ operationId: entry\.turn\.id, trigger: "redraw" \}/, "«Перерисовать» from the large view");
  assert.doesNotMatch(gallery, /href\("chronicle"\)|\/chronicle|c\("Хроника"/, "the chronicle left the navigation");
  const frames = src("src/components/registry/live-frames.tsx");
  assert.match(frames, /c\("Галерея", "Gallery"\)/);
  assert.doesNotMatch(frames, /c\("Хроника", "Chronicle"\)/);
  assert.match(frames, /const words = result \? frameStatusText\(/, "the answer is read, never swallowed");
  assert.match(frames, /export function TurnFrame\(/, "the frame of a turn, in that turn");
  assert.match(frames, /c\("Проверка кадра: ", "Frame check: "\)/, "the vision check's mark");
  assert.match(src("src/components/registry/routes.tsx"), /<RegistryPictures data=\{data\} play=\{runtime\.play\}/);
  const autopilot = src("src/components/registry/visual-autopilot.tsx");
  assert.match(autopilot, /\.\.\.\(zone \? \{ timeZone: zone \} : \{\}\)/, "every picture-settings save carries the device's zone");
  assert.match(autopilot, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
});

test("E (the default path, the director off): the shot gives gaze and hands; the records frame carries identity-only references, the records' gear, 0 HP and the direction", async () => {
  const { compileRecordsFrame } = await import("../src/lib/visual-frame/prompt-compiler.ts");
  const shot = parseShot(JSON.stringify({ who: ["Эдрик Вейл", "Хальвар"], action: "the hero kneels behind a root aiming a crossbow; the sergeant crouches beside him", where: "a ravine", angle: "low", mood: "cold dusk",
    caption: "Ты целишься из-за корневища.", gaze: [{ who: "Эдрик Вейл", looksAt: "the figure across the ravine" }, { who: "Хальвар", looksAt: "Эдрик" }], hands: "left hand steadies the stock, right hand on the trigger" }));
  assert.equal(shot.gaze.length, 2);
  assert.equal(shot.hands, "left hand steadies the stock, right hand on the trigger");
  assert.match(shotRequest("x", { heroName: "Эдрик", names: [], placeName: null, language: "ru" }).system, /never at the viewer/);
  const people = [
    { name: "Эдрик Вейл", entity: { id: HERO, kind: "player", conditions: [] }, appearance: "a young man", gear: { worn: ["Посох", "Лёгкий арбалет"], packed: ["Верёвка"] }, down: false,
      direction: { looksAt: "the figure across the ravine", expression: "", action: "", hands: "left hand steadies the stock, right hand on the trigger" } },
    { name: "Хальвар", entity: { id: SERGEANT, kind: "companion", conditions: [] }, appearance: "a grey veteran", gear: { worn: ["Длинный меч"], packed: [] }, down: true,
      direction: { looksAt: "the hero", expression: "", action: "", hands: null } },
  ];
  const { prompt } = compileRecordsFrame({ modelId: "gpt-image-2.5-sunburst", shot, style: "", people, items: [], maxReferences: 6,
    references: [{ id: "a", role: "face", entityId: HERO }, { id: "b", role: "face", entityId: SERGEANT }] });
  assert.match(prompt, /That picture shows identity only: do not copy its pose, head angle, gaze or expression\./);
  assert.match(prompt, /The hero looks at the figure across the ravine; left hand steadies the stock, right hand on the trigger\./);
  assert.match(prompt, /The hero wears or holds only: Посох and Лёгкий арбалет; packed away, not in hand: Верёвка\. No other weapon, no shield, no lantern, no torch\./);
  assert.match(prompt, /Person 2 looks at the hero\./);
  assert.match(prompt, /down at 0 hit points: unconscious, eyes closed/);
  assert.doesNotMatch(prompt, /Эдрик|Хальвар/);
  const flux = compileRecordsFrame({ modelId: "fal-ai/flux-2-pro", shot, style: "", people, items: [], maxReferences: 4, references: [{ id: "a", role: "face", entityId: HERO }] }).prompt;
  assert.doesNotMatch(flux, /do not|no shield/i, "FLUX reads no negatives");
  assert.match(src("src/lib/server/media/pictures-service.ts"), /gear: gearOf\(snapshot, entity\.id\), down: isDown\(entity\)/);
});
