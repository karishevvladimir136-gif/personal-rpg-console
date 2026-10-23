// Findings S3 §6 (docs/stages/FINDINGS_S3.md «People of the world written from the inside»): each person's private card
// holds a short first-person voice block the DM wrote as them — written by the hidden-layer prep and by the session
// digest, read by the DM in the person's card when they are in the scene, never in the player's snapshot, inside the
// cards' budget.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildPrepRequest, parsePrep, prepWrites } from "../src/lib/gameplay/dm-loop/hidden-layer.ts";
import { buildDigestRequest, parseDigest, runDigest } from "../src/lib/gameplay/dm-loop/digest.ts";
import { buildDmLoopContext } from "../src/lib/gameplay/dm-loop/context.ts";
import { boundInnerVoice, innerVoiceFor, innerVoices, innerVoiceWrites, voiceSlug, INNER_VOICE_MAX_WORDS } from "../src/lib/gameplay/dm-loop/inner-voice.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { loopCampaign } from "./dm-loop-fixture.mjs";

const BRAM = "Я двадцать лет в страже и знаю, чем кончаются ночные геройства. Хочу вернуть своих живыми, боюсь, что опять не успею. Знаю, кто в таможне берёт, — молчу, пока не докажу. Говорю коротко, на «ты», и не люблю, когда меня торопят.";
const words = (text) => text.split(/\s+/).filter(Boolean).length;

test("§6: the block — a slug for a name not on record, bounded under 80 words, found by ID, by name or by the first word", () => {
  assert.equal(voiceSlug("Сержант Брам"), "serzhant-bram");
  assert.equal(voiceSlug("Тит Багор"), "tit-bagor");
  assert.equal(boundInnerVoice("  Я  хочу\nдомой. "), "Я хочу домой.");
  const long = Array.from({ length: 30 }, (_, i) => `Я помню ночь номер ${i}.`).join(" ");
  const bounded = boundInnerVoice(long);
  assert.ok(words(bounded) <= INNER_VOICE_MAX_WORDS && bounded.endsWith("."), "cut at the last whole sentence inside 80 words");
  assert.equal(boundInnerVoice("   "), null);
  const entities = [{ id: "e1", name: "Брам", kind: "companion" }, { id: "e2", name: "Тоби", kind: "companion" }];
  const writes = innerVoiceWrites([{ name: "Брам", inner: BRAM }, { name: "Сержант Ефим", inner: "Я сторож." }, { name: "Тоби", inner: "" }], entities, {});
  assert.deepEqual(writes.map((row) => row.key), ["voice_e1", "voice_serzhant-efim"], "on record by ID, not yet on record by name; an empty block is dropped");
  assert.ok(writes[0].value.startsWith("Брам: Я двадцать лет"));
  const state = { fact: Object.fromEntries(writes.map((row) => [row.key, row.value])) };
  const voices = innerVoices(state);
  assert.match(innerVoiceFor({ id: "e1", name: "Брам" }, voices), /^Я двадцать лет/);
  assert.equal(innerVoiceFor({ id: "later", name: "Сержант Ефим" }, voices), "Я сторож.", "a person the prep named before the records gets it by name");
  assert.equal(innerVoiceFor({ id: "e2", name: "Тоби" }, voices), null);
  assert.deepEqual(innerVoiceWrites([{ name: "Брам", inner: "Другое." }], entities, state), [], "a person who has a block keeps it");
});

test("§6: the prep asks for the voices (the companions first) and its output carries the block for a fixture NPC; the DM reads it in the card when the person is in the scene; the player's snapshot never has it; the budget holds", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const npc = source.snapshot.entities.find((row) => row.id === c.npc);
    assert.ok(npc, "the fixture has a named NPC");
    const request = buildPrepRequest(source, "high").messages[0].text;
    assert.match(request, /"voices": \[ \{ "name": "a companion, or a named person/);
    assert.match(request, /three or four lines under 80 words, in the campaign language: what I want, what I fear, what I know and what I hide, how I talk/);
    // The prep's answer as the model gives it: the layer and a voice for the fixture NPC.
    const reply = JSON.stringify({ truth: "Маяк продаёт огни контрабандистам.", factions: [], secrets: [], clocks: [], clues: [],
      voices: [{ name: npc.name, inner: BRAM }, { name: "Безымянный", inner: "" }] });
    const prep = parsePrep(reply, "ru");
    assert.deepEqual(prep.voices.map((row) => row.name), [npc.name]);
    const writes = prepWrites(prep, source);
    const voice = writes.find((row) => row.key === `voice_${npc.id}`);
    assert.ok(voice, "the prep's output holds the NPC's block, under the NPC's ID");
    assert.ok(!prep.text.includes("двадцать лет"), "the block is the person's card, not the layer's text");

    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    await c.dossier("private_notes", { set: writes, remove: [] }, play.timeline);
    const after = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const input = { operationId: randomUUID(), campaignId: c.cid, timeline: play.timeline, expectedRevision: play.revision, mode: "game", input: "Осматриваюсь.", companionId: null, listenerIds: [], mechanic: null };
    const present = { ...after, runtime: { ...after.runtime, configuration: { ...(after.runtime.configuration ?? {}), presentEntityIds: [npc.id] } } };
    const absent = { ...after, runtime: { ...after.runtime, configuration: { ...(after.runtime.configuration ?? {}), presentEntityIds: [] } } };
    const inScene = buildDmLoopContext(present, input);
    const tail = inScene.parts.tail;
    assert.match(tail, new RegExp(`- ${npc.name} \\(${npc.id}, in the scene\\)[\\s\\S]*in their own words — the voice you wrote as them \\(private\\): Я двадцать лет`));
    assert.ok(!buildDmLoopContext(absent, input).system.map((block) => block.text).join("\n").includes("двадцать лет в страже"), "not in the scene: the DM does not carry the block");
    assert.ok(!/- fact voice_/.test(tail), "never in the general private notes");
    assert.match(buildDmLoopContext(present, input, { role: "writer" }).parts.tail, /Я двадцать лет в страже/, "the writer reads it too");
    // The player's snapshot never has it.
    const snapshot = JSON.stringify(await c.f.snapshot());
    assert.ok(snapshot.includes(npc.name), "the player's snapshot (the public campaign read) does name the NPC");
    assert.ok(!snapshot.includes("двадцать лет в страже"), "the player's snapshot never carries a voice block");
    assert.match(JSON.stringify((await c.state()).dmState), /двадцать лет в страже/, "it is stored DM-side");
    // The budget holds: the cards' layer stays within its budget with many blocks for people in the scene.
    const crowd = Array.from({ length: 200 }, (_, i) => ({ ...npc, id: randomUUID(), name: `Человек ${i}` }));
    const crowded = { ...present, dmOptions: { ...(present.dmOptions ?? {}), memory: "compact" }, snapshot: { ...present.snapshot, entities: [...present.snapshot.entities, ...crowd] },
      privateState: { ...present.privateState, fact: { ...(present.privateState.fact ?? {}), ...Object.fromEntries(crowd.map((row) => [`voice_${row.id}`, `${row.name}: ${BRAM}`])) } },
      runtime: { ...present.runtime, configuration: { ...present.runtime.configuration, presentEntityIds: [npc.id, ...crowd.map((row) => row.id)] } } };
    const context = buildDmLoopContext(crowded, input);
    const tailLayer = context.layers.find((layer) => layer.dropped.some((label) => /^Человек \d+$/.test(label)));
    assert.ok(tailLayer, `past the cards' budget the blocks drop by person (${JSON.stringify(context.layers.map((l) => [l.layer, l.usedTokens, l.budgetTokens, l.dropped.length]))})`);
    // The dossier's layers (3: living, 4: the session tail with the cards) hold their budgets; «now» is the state itself, never budgeted.
    for (const layer of context.layers.filter((row) => row.layer === 3 || row.layer === 4))
      assert.ok(layer.usedTokens <= layer.budgetTokens, `layer ${layer.layer} within its budget (${layer.usedTokens} of ${layer.budgetTokens})`);
    assert.equal(tailLayer.layer, 4, "the blocks count in the session tail, with the cards");
  } finally { await c.f.db.close(); }
});

test("§6: the digest writes the voices of the companions and of the people who recur, only for the people it named", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const npc = source.snapshot.entities.find((row) => row.id === c.npc);
    const companion = { ...npc, id: randomUUID(), name: "Брам", kind: "companion", details: "Сержант стражи." };
    const withCompanion = { ...source, snapshot: { ...source.snapshot, entities: [...source.snapshot.entities, companion] } };
    const session = { id: randomUUID(), title: "Вечер", scenes: [{ role: "player", body: "Брам, идём." }, { role: "narration", body: "Брам кивает." }],
      startWorldMinutes: null, endWorldMinutes: source.runtime.worldMinutes, shape: { turns: 1, playMinutes: 5, form: "short" } };
    const request = buildDigestRequest(withCompanion, session, "high");
    assert.deepEqual(request.voicesFor.map((row) => row.name), ["Брам"]);
    assert.match(request.system.at(-1).text, new RegExp(`PEOPLE WITHOUT A VOICE OF THEIR OWN \\(ID — name; write each one's voice block\\): ${companion.id} — Брам`));
    assert.match(request.messages[0].text, /"voices": \[ \{ "entityId": "<ID from PEOPLE WITHOUT A VOICE OF THEIR OWN>"/);
    const reply = JSON.stringify({ recap: "Отряд у брода.", title: "Брод", notebook: "Я решил…", plans: [], lines: ["Пришли."],
      voices: [{ entityId: companion.id, inner: BRAM }, { entityId: randomUUID(), inner: "Я чужой." }] });
    const result = await runDigest(createScriptedDmModel([{ text: reply, toolCalls: [] }]), request, withCompanion, source.runtime.worldMinutes);
    assert.deepEqual(result.digest.voices.map((row) => row.entityId), [companion.id], "only the people the request named");
    assert.deepEqual(innerVoiceWrites(result.digest.voices, withCompanion.snapshot.entities, withCompanion.privateState).map((row) => row.key), [`voice_${companion.id}`]);
    // A person with a block is not asked again; nobody to ask, no field.
    const voiced = { ...withCompanion, privateState: { ...withCompanion.privateState, fact: { ...(withCompanion.privateState.fact ?? {}), [`voice_${companion.id}`]: `Брам: ${BRAM}` } } };
    const again = buildDigestRequest(voiced, session, "high");
    assert.deepEqual(again.voicesFor, []);
    assert.doesNotMatch(again.messages[0].text, /"voices":/);
    assert.equal(parseDigest(reply, voiced, 0).voices.length, 0);
  } finally { await c.f.db.close(); }
});
