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
