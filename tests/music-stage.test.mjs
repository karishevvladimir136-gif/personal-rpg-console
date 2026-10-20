// The music stage (docs/stages/STAGE_MUSIC.md): the model registry and request bodies, the audio
// length readers, the prompts, the mood chooser and its hysteresis, the player's decisions, the fal
// adapter on a fake queue, the job engine on fakes, migration 71 on PGlite, and the 20-turn synthetic
// session log. No paid call, no network, disposable databases only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { MUSIC_MODELS, musicModel, musicPriceUsdMicros, musicRequestBody, requestedSeconds, sniffAudio } from "../src/lib/audio/models.ts";
import { audioDurationMs, mp3DurationMs, wavDurationMs } from "../src/lib/audio/audio-meta.ts";
import { cueSeconds, musicPrompt, musicRequestFor, suggestMusicStyle } from "../src/lib/audio/prompts.ts";
import { MOOD_IDS, MOODS, isMoodId } from "../src/lib/audio/moods.ts";
import { CANDIDATE_TURNS, MIN_DWELL_MS, MOOD_FALLBACKS, chooseMood, initialMoodState, isNight, latestCommittedTurn, placeKind, signalFromPlay, stepMood } from "../src/lib/audio/mood-select.ts";
import { FADE, clampVolume, loopPoint, pickTrack, targetGain, tracksForMood } from "../src/lib/audio/player-engine.ts";
import { FalMusicError, falMusicFileUrl, generateFalMusic } from "../src/lib/audio/fal-music.ts";
import { MusicJobError, planPack, runNextTrack, storeUpload, trackStoragePath } from "../src/lib/audio/music-job.ts";
import { parseMusicState, parseMusicTrack } from "../src/lib/audio/contracts.ts";
import { effectiveEnd } from "../src/lib/audio/web-player.ts";
import { replaySession } from "../scripts/music-session-log.mjs";

const MIGRATION = "202610210371_music_stage.sql";
const call = (f, cid, action, payload = {}, user = f.owner) =>
  f.one("select public.rpg_music($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)]).then((row) => row.result);
const fails = (promise, code) => assert.rejects(promise, (error) => error.message.includes(code));

// ---- synthetic audio bytes ----
function wavBytes(seconds, sampleRate = 8000, channels = 1) {
  const data = Math.round(seconds * sampleRate) * channels * 2;
  const b = Buffer.alloc(44 + data);
  b.write("RIFF", 0); b.writeUInt32LE(36 + data, 4); b.write("WAVE", 8); b.write("fmt ", 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(channels, 22);
  b.writeUInt32LE(sampleRate, 24); b.writeUInt32LE(sampleRate * channels * 2, 28); b.writeUInt16LE(channels * 2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(data, 40);
  return new Uint8Array(b);
}
/** CBR MPEG-1 layer III, 128 kbps, 44.1 kHz, stereo: 417-byte frames of 1152 samples. */
function mp3Bytes(frames, id3 = false) {
  const frame = Buffer.alloc(417);
  frame[0] = 0xff; frame[1] = 0xfb; frame[2] = 0x90; frame[3] = 0x00;
  const tag = id3 ? Buffer.concat([Buffer.from("ID3\x03\x00\x00\x00\x00\x00\x0a", "latin1"), Buffer.alloc(10)]) : Buffer.alloc(0);
  return new Uint8Array(Buffer.concat([tag, ...Array.from({ length: frames }, () => frame)]));
}

test("music models: endpoints, request bodies as the queue's validation confirmed them, prices never under-counted", () => {
  assert.equal(MUSIC_MODELS.length, 7);
  const lyria = musicRequestBody({ model: "fal-ai/lyria3/pro", prompt: "p", negativePrompt: "vocals", seconds: 60, seed: 7 });
  assert.deepEqual(lyria, { prompt: "p" }, "Lyria 3 refuses a negative prompt and has no seed");
  assert.deepEqual(musicRequestBody({ model: "google/lyria-3.5", prompt: "p", negativePrompt: "x", seconds: 60 }), { prompt: "p" });
  const el = musicRequestBody({ model: "elevenlabs/music/v2.5", prompt: "p", negativePrompt: "x", seconds: 75, seed: 3, styleWords: ["brass", "steam"] });
  assert.equal(el.force_instrumental, undefined, "refused together with a plan");
  assert.equal(el.composition_plan.chunks.length, 1);
  assert.equal(el.composition_plan.chunks[0].duration_ms, 75000);
  assert.equal(el.composition_plan.chunks[0].text, "", "no lyrics");
  assert.deepEqual(el.composition_plan.chunks[0].positive_styles, ["p"]);
  assert.ok(el.composition_plan.positive_global_styles.includes("instrumental"));
  assert.equal(el.seed, 3);
  assert.equal(el.output_format, "mp3_44100_128");
  assert.deepEqual(musicRequestBody({ model: "fal-ai/stable-audio-3/medium/text-to-audio", prompt: "p", negativePrompt: "n", seconds: 90, seed: 1 }), { prompt: "p", negative_prompt: "n", duration: 90, output_format: "mp3", seed: 1 });
  assert.deepEqual(musicRequestBody({ model: "fal-ai/stable-audio-25/text-to-audio", prompt: "p", negativePrompt: "n", seconds: 60 }), { prompt: "p", seconds_total: 60 });
  assert.deepEqual(musicRequestBody({ model: "fal-ai/lyria2", prompt: "p", negativePrompt: "n", seconds: 60, seed: 5 }), { prompt: "p", negative_prompt: "n", seed: 5 });
  assert.deepEqual(musicRequestBody({ model: "fal-ai/ace-step/prompt-to-audio", prompt: "p", negativePrompt: "n", seconds: 60 }), { prompt: "p", instrumental: true, duration: 60 });
  assert.throws(() => musicRequestBody({ model: "nope", prompt: "p", negativePrompt: "", seconds: 1 }));
  // Prices: per track, per minute rounded up, per second; the length is clamped to the model's range.
  assert.equal(musicPriceUsdMicros("fal-ai/lyria3/pro", 60), 80_000);
  assert.equal(musicPriceUsdMicros("elevenlabs/music/v2.5", 61), 1_600_000, "61 s bills two minutes");
  assert.equal(musicPriceUsdMicros("elevenlabs/music/v2.5", 60), 800_000);
  assert.equal(musicPriceUsdMicros("fal-ai/ace-step/prompt-to-audio", 60), 300_000);
  assert.equal(requestedSeconds(musicModel("fal-ai/lyria2"), 90), 30, "a fixed-length model");
  assert.equal(requestedSeconds(musicModel("fal-ai/stable-audio-25/text-to-audio"), 500), 190);
  // Containers by their first bytes.
  assert.equal(sniffAudio(wavBytes(1)), "audio/wav");
  assert.equal(sniffAudio(mp3Bytes(2)), "audio/mpeg");
  assert.equal(sniffAudio(mp3Bytes(2, true)), "audio/mpeg");
  assert.equal(sniffAudio(new Uint8Array(Buffer.from("OggS" + "x".repeat(20)))), "audio/ogg");
  assert.equal(sniffAudio(new Uint8Array(Buffer.from("\x89PNG\r\n\x1a\n" + "x".repeat(20), "latin1"))), null);
  assert.equal(sniffAudio(new Uint8Array(4)), null);
});

test("audio length: WAV from the header, MP3 by its frames (with and without an ID3 tag)", () => {
  assert.equal(wavDurationMs(wavBytes(2.5)), 2500);
  assert.equal(wavDurationMs(wavBytes(1, 44100, 2)), 1000);
  assert.equal(mp3DurationMs(mp3Bytes(100)), Math.round((100 * 1152 * 1000) / 44100));
  assert.equal(mp3DurationMs(mp3Bytes(10, true)), Math.round((10 * 1152 * 1000) / 44100));
  assert.equal(audioDurationMs(wavBytes(3)), 3000);
  assert.equal(audioDurationMs(new Uint8Array(Buffer.from("OggS" + "x".repeat(40)))), null, "unknown containers are measured after decoding");
  assert.equal(wavDurationMs(new Uint8Array(10)), null);
});

test("prompts: the world's style, the mood, a loop-friendly shape, no vocals; the length only where the model takes it in words", () => {
  const lyria = musicPrompt({ styleText: "Brass and steam.", moodId: "combat", model: "fal-ai/lyria3/pro", seconds: 90 });
  assert.ok(lyria.includes("Brass and steam.") && lyria.includes("driving rhythm") && lyria.includes("No vocals") && lyria.includes("About 90 seconds"));
  const sa = musicPrompt({ styleText: "Brass and steam.", moodId: "combat", model: "fal-ai/stable-audio-3/medium/text-to-audio", seconds: 90, variant: 2 });
  assert.ok(!sa.includes("About 90 seconds") && sa.includes("Variation 2"));
  assert.ok(musicPrompt({ styleText: "x".repeat(3000), moodId: "quiet", model: "fal-ai/lyria2", seconds: 30 }).length < 2000, "the style is capped");
  const request = musicRequestFor({ styleText: "Muted trumpet, analog pads, rain on glass.", moodId: "night", model: "elevenlabs/music/v2.5" });
  assert.equal(request.seconds, cueSeconds("night"));
  assert.ok(request.styleWords.includes("Muted trumpet") && request.styleWords.includes("instrumental"));
  assert.ok(request.negativePrompt.includes("vocals"));
  assert.deepEqual([cueSeconds("quiet"), cueSeconds("tension"), cueSeconds("climax")], [60, 75, 90]);
  // A starting style from what the records say about the world.
  const steampunk = suggestMusicStyle({ title: "Мир Шва", premise: "Стимпанк поверх руин Старого мира: Шов, эфирит, Паровая Лига.", visualStyle: "масляная живопись" });
  assert.ok(steampunk.includes("clockwork") && steampunk.startsWith("The world: Стимпанк"));
  assert.ok(suggestMusicStyle({ premise: "A rain-soaked neon noir city of syndicates and implants." }).includes("synthwave noir"));
  assert.ok(suggestMusicStyle({ premise: "" }).includes("cinematic orchestral"), "a default when nothing matches");
  assert.ok(suggestMusicStyle({ premise: "x".repeat(5000) }).length <= 1200);
});

test("moods: fifteen with labels in both languages; every stand-in is a mood", () => {
  assert.equal(MOODS.length, 15);
  for (const mood of MOODS) { assert.ok(mood.label.ru && mood.label.en && mood.hint.length > 20 && mood.energy >= 1 && mood.energy <= 5); assert.ok(isMoodId(mood.id)); }
  for (const id of MOOD_IDS) { assert.ok(MOOD_FALLBACKS[id].length >= 2); for (const fallback of MOOD_FALLBACKS[id]) assert.ok(isMoodId(fallback) && fallback !== id); }
  assert.equal(isMoodId("ambush"), false);
});

test("mood chooser: danger first, then what the scene is about, then the place and the hour; never a private fact", () => {
  const base = { turnId: "t", sceneKinds: [], tension: null, hint: null, playerMoment: false, encounterActive: false, worldMinutes: 600, place: null };
  const pick = (patch) => chooseMood({ ...base, ...patch }).mood;
  assert.equal(pick({ encounterActive: true }), "combat");
  assert.equal(pick({ sceneKinds: ["combat"], tension: "climax" }), "climax");
  assert.equal(pick({ sceneKinds: ["combat"], playerMoment: true }), "climax");
  assert.equal(pick({ sceneKinds: ["combat", "humor"] }), "combat", "a fight beats a joke");
  assert.equal(pick({ sceneKinds: ["conversation"], hint: "climax" }), "tension", "a climax without a fight is tension");
  assert.equal(pick({ sceneKinds: ["mystery"] }), "mystery");
  assert.equal(pick({ sceneKinds: ["mystery"], tension: "tense" }), "tension");
  assert.equal(pick({ sceneKinds: ["mystery"], tension: "tense", place: { name: "Склеп под собором", description: "" } }), "dread");
  assert.equal(pick({ sceneKinds: ["mystery"], hint: "tense", worldMinutes: 1440 + 60 }), "dread", "a tense mystery at night");
  assert.equal(pick({ sceneKinds: ["conversation"], tension: "tense" }), "tension");
  assert.equal(pick({ sceneKinds: ["trade", "conversation"] }), "trade");
  assert.equal(pick({ sceneKinds: ["humor", "conversation"] }), "humor");
  assert.equal(pick({ sceneKinds: ["quiet", "conversation"] }), "warm");
  assert.equal(pick({ sceneKinds: ["quiet"] }), "quiet");
  assert.equal(pick({ sceneKinds: ["quiet"], worldMinutes: 23 * 60 }), "night");
  assert.equal(pick({ sceneKinds: ["travel"] }), "travel");
  assert.equal(pick({ sceneKinds: ["travel"], tension: "tense" }), "tension");
  assert.equal(pick({ sceneKinds: ["travel"], worldMinutes: 2 * 60 }), "night");
  assert.equal(pick({ sceneKinds: ["exploration"] }), "explore");
  assert.equal(pick({ sceneKinds: ["exploration"], tension: "tense" }), "dread");
  assert.equal(pick({ sceneKinds: ["exploration"], place: { name: "Пещера дома Альвареш", description: "" } }), "mystery");
  assert.equal(pick({ sceneKinds: ["conversation"] }), "warm");
  assert.equal(pick({ sceneKinds: ["conversation"], place: { name: "Таверна «Кривой якорь»", description: "" } }), "humor");
  assert.equal(pick({ sceneKinds: ["conversation"], place: { name: "Harbor market", description: "stalls" } }), "trade");
  assert.equal(pick({ sceneKinds: ["other"], place: { name: "Kowloon Stack 9", description: "Forty levels of apartments, noodle stalls and illegal clinics." } }), "town");
  assert.equal(pick({ sceneKinds: [], place: { name: "Небо над Пиренеями", description: "" } }), "travel");
  assert.equal(pick({ sceneKinds: [], place: { name: "Небо над Пиренеями", description: "" }, worldMinutes: 23 * 60 }), "night");
  assert.equal(pick({}), "quiet");
  // The place kind from public words only.
  assert.equal(placeKind({ name: "Лиссабон", description: "Город на семи холмах, порт." }), "town");
  assert.equal(placeKind({ name: "«Бабка»", description: "Дирижабль; палуба скрипит." }), "ship");
  assert.equal(placeKind(null), "unknown");
  assert.equal(isNight(null), false);
  assert.equal(isNight(1440 * 3 + 22 * 60), true);
  // From the public play snapshot: the committed turn's projection, the encounter list, the clock, the place.
  const play = { worldMinutes: 2000, encounters: [{ status: "ended" }, { status: "active" }], turns: [
    { id: "a", status: "committed", sceneKinds: ["travel"], nextTension: "tense", stats: { depthTension: "calm" } },
    { id: "b", status: "generating" }] };
  const data = { locations: [{ id: "L", name: "Женева", description: "Город под Швом" }], publicState: { current_location_id: "L" } };
  const signal = signalFromPlay(play, data);
  assert.deepEqual(signal, { turnId: "a", sceneKinds: ["travel"], tension: "calm", hint: "tense", playerMoment: false, encounterActive: true, worldMinutes: 2000, place: { name: "Женева", description: "Город под Швом" } });
  assert.equal(latestCommittedTurn(play).id, "a");
  assert.equal(chooseMood(signal).mood, "combat", "an active public encounter is a fight");
  assert.deepEqual(signalFromPlay(null, null), { turnId: null, sceneKinds: [], tension: null, hint: null, playerMoment: false, encounterActive: false, worldMinutes: null, place: null });
});

test("hysteresis: a fight at once, a step down or sideways only after two turns or the minimum dwell", () => {
  const choice = (mood) => ({ mood, reason: mood });
  let s = initialMoodState();
  let step = stepMood(s, choice("travel"), 0);
  assert.ok(step.switched && step.mood === "travel");
  s = step.state;
  step = stepMood(s, choice("warm"), 10_000);
  assert.ok(!step.switched && step.mood === "travel" && step.state.candidateTurns === 1, "sideways: one turn is not enough");
  step = stepMood(step.state, choice("warm"), 20_000);
  assert.ok(step.switched && step.mood === "warm" && step.reason.includes(`held for ${CANDIDATE_TURNS} turns`));
  s = step.state;
  step = stepMood(s, choice("combat"), 25_000);
  assert.ok(step.switched && step.mood === "combat" && step.reason.includes("escalation"), "a fight switches at once");
  s = step.state;
  step = stepMood(s, choice("climax"), 26_000);
  assert.ok(step.switched && step.mood === "climax");
  s = step.state;
  step = stepMood(s, choice("combat"), 27_000);
  assert.ok(!step.switched && step.mood === "climax", "a step down inside a fight waits");
  step = stepMood(s, choice("quiet"), 27_000);
  assert.ok(!step.switched, "the calm after a fight waits too");
  step = stepMood(s, choice("quiet"), 26_000 + MIN_DWELL_MS);
  assert.ok(step.switched && step.reason.includes("minimum"), "…until the current mood played its minimum");
  s = initialMoodState();
  s = stepMood(s, choice("quiet"), 0).state;
  step = stepMood(s, choice("tension"), 1000);
  assert.ok(step.switched, "quiet (1) → tension (3) is a jump of two steps");
  step = stepMood(stepMood(initialMoodState(), choice("travel"), 0).state, choice("travel"), 5000);
  assert.ok(!step.switched && step.reason.includes("unchanged") && step.state.candidateTurns === 0);
});

test("player decisions: a track of the mood, never the same take twice when there is a choice, stand-ins, pin and gain", () => {
  const t = (id, moods, extra = {}) => ({ id, moods, source: "generated", title: id, seconds: 60, hidden: false, ...extra });
  const tracks = [t("c1", ["combat"]), t("c2", ["combat"]), t("own", ["combat", "climax"], { source: "upload" }), t("q1", ["quiet"]), t("hidden", ["travel"], { hidden: true })];
  assert.deepEqual(tracksForMood(tracks, "combat").tracks.map((r) => r.id), ["c1", "c2", "own"], "own uploads mix with the pack");
  assert.deepEqual([tracksForMood(tracks, "travel").moodUsed, tracksForMood(tracks, "travel").tracks.map((r) => r.id)], ["quiet", ["q1"]], "a hidden track never plays: the stand-in does");
  assert.equal(tracksForMood(tracks, "warm").moodUsed, "quiet", "the nearest stand-in");
  assert.equal(tracksForMood(tracks, "trade").moodUsed, null);
  for (let i = 0; i < 20; i += 1) assert.notEqual(pickTrack(tracks, "combat", "c1", Math.random).track.id, "c1");
  assert.equal(pickTrack(tracks, "quiet", "q1").track.id, "q1", "the only take repeats");
  assert.equal(pickTrack(tracks, "trade", null).track, null);
  assert.equal(pickTrack(tracks, "climax", null, () => 0).track.id, "own");
  assert.equal(targetGain({ enabled: true, volume: 0.5, muted: false }, false), 0.5);
  assert.equal(targetGain({ enabled: true, volume: 0.5, muted: false }, true), 0.5 * FADE.duckGain, "ducked under a video's sound");
  assert.equal(targetGain({ enabled: true, volume: 0.5, muted: true }, false), 0);
  assert.equal(targetGain({ enabled: false, volume: 1, muted: false }, false), 0);
  assert.equal(clampVolume(1.7), 1);
  assert.equal(clampVolume("x"), 0.5);
  assert.deepEqual(loopPoint(60), { at: 57, overlap: 3 });
  assert.deepEqual(loopPoint(2), { at: 1.5, overlap: 0.5 });
  // The effective end of a decoded track: before its fade-out.
  const rate = 1000, length = 10 * rate, data = new Float32Array(length);
  for (let i = 0; i < length; i += 1) data[i] = i < 8 * rate ? 0.5 * Math.sin(i / 7) : 0.001 * Math.sin(i / 7);
  const end = effectiveEnd({ length, sampleRate: rate, numberOfChannels: 1, getChannelData: () => data });
  assert.ok(end > 7.9 && end <= 8.1, `the end sits where the music stops, got ${end}`);
});

test("fal music adapter on a fake queue: submit, poll, result, download; refusals and empty results", async () => {
  const requests = [];
  const audio = wavBytes(2);
  const fetcher = async (url, init = {}) => {
    requests.push({ url, method: init.method ?? "GET", auth: init.headers?.Authorization ?? null, body: init.body ? JSON.parse(init.body) : null });
    if (url === "https://queue.fal.run/fal-ai/stable-audio-3/medium/text-to-audio") return Response.json({ request_id: "req-00000001" });
    if (url.endsWith("/status?logs=0")) return Response.json({ status: requests.filter((r) => r.url.endsWith("/status?logs=0")).length < 2 ? "IN_PROGRESS" : "COMPLETED" });
    if (url === "https://queue.fal.run/fal-ai/stable-audio-3/requests/req-00000001") return Response.json({ audio: { url: "https://v3.fal.media/files/x/track.mp3", content_type: "audio/mpeg" } });
    if (url === "https://v3.fal.media/files/x/track.mp3") return new Response(audio);
    throw new Error("unexpected " + url);
  };
  const result = await generateFalMusic("key", { model: "fal-ai/stable-audio-3/medium/text-to-audio", prompt: "p", negativePrompt: "n", seconds: 60 }, { fetcher, sleep: async () => {} });
  assert.equal(result.contentType, "audio/wav", "the container is read from the bytes, not from the provider's label");
  assert.equal(result.bytes.byteLength, audio.byteLength);
  assert.equal(result.requestId, "req-00000001");
  assert.equal(result.priceUsdMicros, 40_000);
  assert.deepEqual(result.outputKeys, ["audio"]);
  assert.equal(requests[0].auth, "Key key");
  assert.deepEqual(requests[0].body, { prompt: "p", negative_prompt: "n", duration: 60, output_format: "mp3" });
  assert.equal(requests.at(-1).auth, null, "no credentials on the CDN download");
  assert.equal(requests.filter((r) => r.method === "POST").length, 1, "never a second submit");
  // A refusal at submit carries the field path; a completion without a file is a validation error.
  const refusing = async () => new Response(JSON.stringify({ detail: [{ loc: ["body", "prompt"], msg: "flagged by a content checker" }] }), { status: 422 });
  await assert.rejects(generateFalMusic("key", { model: "fal-ai/lyria3/pro", prompt: "p", negativePrompt: "", seconds: 60 }, { fetcher: refusing }), (e) => e instanceof FalMusicError && e.code === "validation" && e.detail === "HTTP 422: prompt: flagged by a content checker");
  const empty = async (url) => url.endsWith("/status?logs=0") ? Response.json({ status: "COMPLETED" }) : Response.json(url.includes("/requests/") ? { detail: "nothing" } : { request_id: "req-00000002" });
  await assert.rejects(generateFalMusic("key", { model: "fal-ai/lyria2", prompt: "p", negativePrompt: "", seconds: 30 }, { fetcher: empty, sleep: async () => {} }), (e) => e.code === "validation" && e.detail.includes("without audio"));
  await assert.rejects(generateFalMusic("", { model: "fal-ai/lyria2", prompt: "p", negativePrompt: "", seconds: 30 }), (e) => e.code === "not_configured");
  assert.equal(falMusicFileUrl({ audio_file: { url: "https://fal.media/files/a.wav" } }), "https://fal.media/files/a.wav");
  assert.equal(falMusicFileUrl({ audio: { url: "https://evil.example/a.wav" } }), null, "only fal's CDN");
  assert.equal(falMusicFileUrl({ audio_url: "https://v2.fal.media/files/b.mp3" }), "https://v2.fal.media/files/b.mp3");
});

/** A fake of the job context: rows in memory, the RPC's rules for claim/cap/settle, a scripted fal. */
function fakeContext({ generate, cap = 8_000_000 } = {}) {
  const rows = new Map(), puts = [], calls = [];
  let n = 0;
  const ctx = {
    campaignId: "11111111-1111-4111-8111-111111111111", puts, calls,
    newId: () => `${(++n).toString(16).padStart(8, "0")}-0000-4000-8000-000000000000`,
    sha256: () => "c".repeat(64),
    storage: { put: async (path, bytes, contentType) => { puts.push({ path, bytes: bytes.byteLength, contentType }); } },
    generate: generate ?? (async () => { throw new FalMusicError("unavailable"); }),
    rpc: async (action, payload = {}) => {
      calls.push({ action, payload });
      const row = (id) => { const r = rows.get(id); if (!r) throw new Error("rpg_not_found"); return r; };
      const json = (r) => ({ id: r.id, packId: r.packId, scope: "campaign", source: r.source, moods: r.moods, variant: r.variant, title: r.title, model: r.model ?? null, requestedSeconds: r.requestedSeconds ?? null, status: r.status, hidden: false,
        contentType: r.contentType ?? null, bytes: r.bytes ?? null, durationMs: r.durationMs ?? null, costUsdMicros: r.cost ?? 0, elapsedMs: r.elapsedMs ?? null, error: r.error ?? null, createdAt: "2026-10-20T00:00:00Z", readyAt: r.status === "ready" ? "2026-10-20T00:00:01Z" : null });
      const packCost = (packId) => [...rows.values()].filter((r) => r.packId === packId).reduce((s, r) => s + (r.cost ?? 0), 0);
      switch (action) {
        case "pack.create":
          for (const t of payload.tracks) rows.set(t.id, { ...t, packId: payload.id, source: "generated", status: "queued" });
          return { id: payload.id, scope: "campaign", scopeId: ctx.campaignId, version: 1, styleText: payload.styleText, model: payload.model, moods: payload.moods, variants: payload.variants, capUsdMicros: payload.capUsdMicros, status: "generating", costUsdMicros: 0, createdAt: "2026-10-20T00:00:00Z", finishedAt: null };
        case "track.next": {
          const next = [...rows.values()].find((r) => r.status === "queued");
          return next ? { ...json(next), prompt: next.prompt, seed: next.seed, capUsdMicros: cap, packCostUsdMicros: packCost(next.packId) } : null;
        }
        case "track.update": {
          const r = row(payload.id);
          if (payload.status === "generating") { if (packCost(r.packId) + payload.costUsdMicros > cap) { r.status = "failed"; r.error = "cap"; } else { r.status = "generating"; r.cost = payload.costUsdMicros; } }
          else if (payload.status === "ready") Object.assign(r, { status: "ready", cost: payload.costUsdMicros, elapsedMs: payload.elapsedMs, ...payload.output });
          else Object.assign(r, { status: "failed", error: payload.error, cost: payload.costUsdMicros });
          return json(r);
        }
        case "upload.create": { const r = { ...payload, packId: null, source: "upload", variant: 1, status: "ready", ...payload.output }; rows.set(r.id, r); return json(r); }
        default: throw new Error("unexpected " + action);
      }
    },
  };
  return ctx;
}
const settings = { enabled: true, model: "fal-ai/lyria3/pro", variants: 2, packCapUsdMicros: 8_000_000, styleText: "Brass and steam, airships, clockwork percussion.", revision: 1 };

test("job engine: a pack is planned with prompts and list prices; tracks are generated one per call, counted before the request, failures end in the row", async () => {
  const plan = planPack({ settings, newId: fakeContext().newId });
  assert.equal(plan.tracks.length, 30, "15 moods × 2 takes");
  assert.equal(plan.expectedUsdMicros, 30 * 80_000);
  assert.ok(plan.tracks.every((t) => t.prompt.includes("Brass and steam") && t.model === "fal-ai/lyria3/pro" && t.seed === null && [60, 75, 90].includes(t.requestedSeconds)));
  assert.equal(plan.tracks[0].title, "On the road 1");
  const small = planPack({ settings: { ...settings, model: "elevenlabs/music/v2.5" }, moods: ["combat", "quiet"], variants: 1, newId: fakeContext().newId });
  assert.deepEqual(small.tracks.map((t) => [t.moods[0], t.requestedSeconds, t.seed !== null]), [["combat", 90, true], ["quiet", 60, true]]);
  assert.equal(small.expectedUsdMicros, 1_600_000 + 800_000, "90 s bills two minutes");
  assert.throws(() => planPack({ settings: { ...settings, styleText: "" }, newId: fakeContext().newId }), (e) => e instanceof MusicJobError && e.code === "validation");
  assert.throws(() => planPack({ settings, moods: ["combat", "combat"], newId: fakeContext().newId }), (e) => e.code === "validation");
  assert.throws(() => planPack({ settings, model: "x", newId: fakeContext().newId }), (e) => e.code === "validation");

  const audio = mp3Bytes(200);
  let generated = 0;
  const ctx = fakeContext({ generate: async (request) => { generated += 1; if (generated === 2) throw new FalMusicError("failed"); if (generated === 3) throw new FalMusicError("validation", "HTTP 422: prompt: flagged"); return { bytes: audio, contentType: "audio/mpeg", requestId: "r" + generated, model: request.model, requestedSeconds: request.seconds, priceUsdMicros: 80_000, elapsedMs: 1200, outputKeys: ["audio"] }; } });
  const pack = await (await import("../src/lib/audio/music-job.ts")).createPack(ctx, planPack({ settings, moods: ["travel", "combat", "quiet", "warm"], variants: 1, newId: ctx.newId }));
  assert.equal(pack.status, "generating");
  const first = await runNextTrack(ctx);
  assert.equal(first.outcome, "ready");
  assert.equal(first.track.status, "ready");
  assert.equal(first.track.durationMs, Math.round((200 * 1152 * 1000) / 44100), "the length read from the bytes");
  assert.deepEqual(ctx.puts[0], { path: trackStoragePath(ctx.campaignId, first.track.id, "audio/mpeg"), bytes: audio.byteLength, contentType: "audio/mpeg" });
  assert.ok(ctx.puts[0].path.endsWith(".mp3"));
  const claim = ctx.calls.find((c) => c.action === "track.update" && c.payload.status === "generating");
  assert.equal(claim.payload.costUsdMicros, 80_000, "the list price is counted before the request");
  assert.ok(ctx.calls.findIndex((c) => c === claim) < ctx.calls.findIndex((c) => c.action === "track.update" && c.payload.status === "ready"));
  const second = await runNextTrack(ctx);
  assert.equal(second.outcome, "failed");
  assert.equal(second.track.error, "failed");
  assert.equal(second.track.costUsdMicros, 80_000, "a failure after the submit may still be billed");
  const third = await runNextTrack(ctx);
  assert.equal(third.outcome, "failed");
  assert.equal(third.track.costUsdMicros, 0, "a refusal at submit was never queued");
  assert.equal(third.track.error, "validation: HTTP 422: prompt: flagged");
  assert.equal((await runNextTrack(ctx)).outcome, "ready");
  assert.equal((await runNextTrack(ctx)).outcome, "idle", "nothing queued");
  assert.equal(generated, 4);
  // The cap: a claim over it fails the track without a request.
  const capped = fakeContext({ cap: 100_000, generate: async () => { throw new Error("must not be called"); } });
  await (await import("../src/lib/audio/music-job.ts")).createPack(capped, planPack({ settings: { ...settings, packCapUsdMicros: 100_000 }, moods: ["travel", "combat"], variants: 1, newId: capped.newId }));
  capped.generate = async (request) => ({ bytes: audio, contentType: "audio/mpeg", requestId: "r", model: request.model, requestedSeconds: request.seconds, priceUsdMicros: 80_000, elapsedMs: 1, outputKeys: [] });
  assert.equal((await runNextTrack(capped)).outcome, "ready");
  capped.generate = async () => { throw new Error("must not be called"); };
  const over = await runNextTrack(capped);
  assert.equal(over.outcome, "cap");
  assert.equal(over.track.error, "cap");
  // Uploads: audio only, within the size, tagged with real moods.
  const up = await storeUpload(ctx, { bytes: wavBytes(3), title: "  My Suno theme ", moods: ["travel", "town"] });
  assert.equal(up.source, "upload");
  assert.equal(up.durationMs, 3000);
  assert.equal(up.title, "My Suno theme");
  assert.ok(ctx.puts.at(-1).path.endsWith(".wav"));
  await assert.rejects(storeUpload(ctx, { bytes: new Uint8Array(Buffer.from("not audio at all, really not")), title: "x", moods: ["travel"] }), (e) => e.code === "validation");
  await assert.rejects(storeUpload(ctx, { bytes: wavBytes(3), title: "x", moods: ["ambush"] }), (e) => e.code === "validation");
  await assert.rejects(storeUpload(ctx, { bytes: wavBytes(3), title: "", moods: ["travel"] }), (e) => e.code === "validation");
});

test("migration 71: settings, a pack with queued tracks, the claim against the cap, ready/failed, uploads, tags, projections without secrets", async () => {
  const f = await fixture();
  try {
    assert.ok(f.files.includes(MIGRATION));
    const w = await world(f);
    const read = await call(f, w.cid, "read");
    assert.deepEqual(Object.keys(read).sort(), ["campaignId", "pack", "packs", "scope", "scopeId", "settings", "spentUsdMicros", "tracks", "worldId"]);
    assert.equal(read.scope, "campaign", "no world is bound: the campaign has its own soundtrack");
    assert.equal(read.scopeId, w.cid);
    assert.equal(read.pack, null);
    assert.deepEqual(read.settings, { enabled: true, model: "fal-ai/lyria3/pro", variants: 2, packCapUsdMicros: 8000000, styleText: "", revision: 0 });
    assert.ok(parseMusicState({ ...read, generation: { configured: false } }), "the projection parses on the client");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 1, enabled: true, model: "fal-ai/lyria3/pro", variants: 2, packCapUsdMicros: 100, styleText: "x" }), "rpg_conflict");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 0, enabled: true, model: "fal-ai/lyria3/pro", variants: 4, packCapUsdMicros: 100, styleText: "x" }), "rpg_validation");
    await fails(call(f, w.cid, "settings.save", { expectedRevision: 0, enabled: true, model: "fal-ai/lyria3/pro", variants: 2, packCapUsdMicros: 100, styleText: "x".repeat(1201) }), "rpg_validation");
    const saved = await call(f, w.cid, "settings.save", { expectedRevision: 0, enabled: false, model: "google/lyria-3.5", variants: 1, packCapUsdMicros: 500000, styleText: "Brass and steam." });
    assert.deepEqual(saved, { enabled: false, model: "google/lyria-3.5", variants: 1, packCapUsdMicros: 500000, styleText: "Brass and steam.", revision: 1 });
    // A pack with its queued tracks; a second one cannot start while it generates.
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const track = (id, mood, variant, seconds = 60) => ({ id, moods: [mood], variant, title: `${mood} ${variant}`, model: "google/lyria-3.5", prompt: `A ${mood} cue.`, seed: null, requestedSeconds: seconds });
    const packId = randomUUID();
    await fails(call(f, w.cid, "pack.create", { id: packId, styleText: "Brass.", model: "google/lyria-3.5", moods: ["travel", "ambush"], variants: 1, capUsdMicros: 500000, tracks: [track(ids[0], "travel", 1)] }), "rpg_validation");
    await fails(call(f, w.cid, "pack.create", { id: packId, styleText: "Brass.", model: "google/lyria-3.5", moods: ["travel"], variants: 1, capUsdMicros: 500000, tracks: [{ ...track(ids[0], "travel", 1), extra: 1 }] }), "rpg_validation");
    const pack = await call(f, w.cid, "pack.create", { id: packId, styleText: "Brass.", model: "google/lyria-3.5", moods: ["travel", "combat"], variants: 1, capUsdMicros: 250000, tracks: [track(ids[0], "travel", 1), track(ids[1], "combat", 1, 90), track(ids[2], "combat", 2, 90)] });
    assert.equal(pack.version, 1);
    assert.equal(pack.status, "generating");
    await fails(call(f, w.cid, "pack.create", { id: randomUUID(), styleText: "Brass.", model: "google/lyria-3.5", moods: ["travel"], variants: 1, capUsdMicros: 500000, tracks: [track(randomUUID(), "travel", 1)] }), "rpg_conflict");
    let state = await call(f, w.cid, "read");
    assert.equal(state.pack.id, packId);
    assert.deepEqual(state.tracks.map((t) => [t.title, t.status]), [["travel 1", "queued"], ["combat 1", "queued"], ["combat 2", "queued"]]);
    for (const t of state.tracks) { assert.ok(!("prompt" in t) && !("storagePath" in t) && !("seed" in t), "the projection never carries the prompt, the seed or a storage path"); assert.ok(parseMusicTrack(t)); }
    // The next queued track, privately; the claim counts the list price against the cap.
    const next = await call(f, w.cid, "track.next");
    assert.equal(next.id, ids[0]);
    assert.equal(next.prompt, "A travel cue.");
    assert.equal(next.capUsdMicros, 250000);
    assert.equal(next.packCostUsdMicros, 0);
    const claimed = await call(f, w.cid, "track.update", { id: ids[0], status: "generating", costUsdMicros: 100000 });
    assert.equal(claimed.status, "generating");
    assert.equal(claimed.costUsdMicros, 100000);
    await fails(call(f, w.cid, "track.update", { id: ids[0], status: "generating", costUsdMicros: 100000 }), "rpg_validation", "generating → generating is not a transition");
    await fails(call(f, w.cid, "track.update", { id: ids[0], status: "ready", output: { storagePath: `${w.cid}/music/${ids[0]}.mp3` } }), "rpg_validation");
    await fails(call(f, w.cid, "track.update", { id: ids[0], status: "ready", costUsdMicros: 100000, output: { storagePath: `elsewhere/${ids[0]}.mp3`, contentType: "audio/mpeg", bytes: 5, durationMs: 60000, sha256: "a".repeat(64) } }), "violates check");
    const ready = await call(f, w.cid, "track.update", { id: ids[0], status: "ready", costUsdMicros: 100000, requestId: "req-1", elapsedMs: 20000, output: { storagePath: `${w.cid}/music/${ids[0]}.mp3`, contentType: "audio/mpeg", bytes: 900000, durationMs: 60500, sha256: "a".repeat(64) } });
    assert.equal(ready.status, "ready");
    assert.equal(ready.durationMs, 60500);
    assert.equal(ready.readyAt !== null, true);
    assert.equal((await call(f, w.cid, "read")).pack.costUsdMicros, 100000, "the pack's cost follows its tracks");
    assert.equal((await call(f, w.cid, "track.next")).id, ids[1]);
    const second = await call(f, w.cid, "track.update", { id: ids[1], status: "generating", costUsdMicros: 100000 });
    assert.equal(second.status, "generating");
    const failed = await call(f, w.cid, "track.update", { id: ids[1], status: "failed", error: "unavailable: HTTP 503", costUsdMicros: 100000 });
    assert.equal(failed.status, "failed");
    assert.equal(failed.error, "unavailable: HTTP 503");
    const over = await call(f, w.cid, "track.update", { id: ids[2], status: "generating", costUsdMicros: 100000 });
    assert.equal(over.status, "failed", "200000 spent + 100000 > the 250000 cap: failed without a request");
    assert.equal(over.error, "cap");
    assert.equal(over.costUsdMicros, 0);
    state = await call(f, w.cid, "read");
    assert.equal(state.pack.status, "ready", "no track queued or generating, one ready");
    assert.equal(state.pack.finishedAt !== null, true);
    assert.equal(state.spentUsdMicros, 200000);
    assert.equal(await call(f, w.cid, "track.next"), null);
    // Finished tracks are history: cost and bytes never change; hide, tags and the title may.
    await fails(f.one("update rpg_private.music_tracks set cost_usd_micros=1 where id=$1", [ids[0]]), "rpg_conflict");
    await fails(f.one("delete from rpg_private.music_tracks where id=$1", [ids[0]]), "rpg_conflict");
    await fails(f.one("update rpg_private.music_packs set style_text='x' where id=$1", [packId]), "rpg_conflict");
    const hidden = await call(f, w.cid, "track.hide", { id: ids[0], hidden: true });
    assert.equal(hidden.hidden, true);
    const tagged = await call(f, w.cid, "track.tag", { id: ids[0], moods: ["travel", "explore"], title: "Road again" });
    assert.deepEqual([tagged.moods, tagged.title], [["travel", "explore"], "Road again"]);
    await fails(call(f, w.cid, "track.tag", { id: ids[0], moods: ["travel", "travel"] }), "rpg_validation");
    // The private view for the server only.
    const priv = await call(f, w.cid, "track.private", { id: ids[0] });
    assert.equal(priv.storagePath, `${w.cid}/music/${ids[0]}.mp3`);
    assert.equal(priv.prompt, "A travel cue.");
    // The owner's own track: ready at once, no pack.
    const upId = randomUUID();
    const up = await call(f, w.cid, "upload.create", { id: upId, title: " Suno theme ", moods: ["warm", "night"], output: { storagePath: `${w.cid}/music/${upId}.wav`, contentType: "audio/wav", bytes: 4000000, durationMs: 95000, sha256: "b".repeat(64) } });
    assert.deepEqual([up.source, up.packId, up.status, up.title, up.moods], ["upload", null, "ready", "Suno theme", ["warm", "night"]]);
    await fails(call(f, w.cid, "upload.create", { id: randomUUID(), title: "x", moods: ["warm"], output: { storagePath: `${w.cid}/music/x.exe`, contentType: "application/x-msdownload", bytes: 1, durationMs: null, sha256: "b".repeat(64) } }), "violates check");
    state = await call(f, w.cid, "read");
    assert.equal(state.tracks.length, 4, "the pack's tracks and the upload");
    // A new pack is the next version; its queued tracks can be cancelled; the old pack stays in history.
    const pack2 = await call(f, w.cid, "pack.create", { id: randomUUID(), styleText: "Brass, take two.", model: "fal-ai/lyria3/pro", moods: ["travel"], variants: 1, capUsdMicros: 500000, tracks: [track(randomUUID(), "travel", 1)] });
    assert.equal(pack2.version, 2);
    state = await call(f, w.cid, "read");
    assert.equal(state.pack.id, pack2.id);
    assert.equal(state.tracks.filter((t) => t.source === "generated").length, 1, "the read shows the newest pack's tracks and every upload");
    const cancelled = await call(f, w.cid, "pack.cancel", { id: pack2.id });
    assert.equal(cancelled.status, "cancelled");
    state = await call(f, w.cid, "read");
    assert.equal(state.pack.id, packId, "a cancelled pack steps aside for the last good one");
    assert.equal(state.packs.length, 2);
    await fails(call(f, w.cid, "pack.cancel", { id: pack2.id }), "rpg_conflict");
    await fails(call(f, w.cid, "read", {}, f.other), "rpg_forbidden");
    await fails(call(f, w.cid, "nope"), "rpg_validation");
  } finally {
    await f.db.close();
  }
});

test("the 20-turn synthetic session: calm moods hold, fights switch at once, nothing switches on every turn", () => {
  const rows = replaySession();
  assert.equal(rows.length, 20);
  const playing = rows.map((r) => r.playing);
  assert.equal(playing[0], "travel");
  assert.equal(playing[1], "travel", "one quiet turn does not switch");
  assert.equal(playing[2], "warm", "two turns of a calm talk do");
  assert.equal(playing[4], "tension", "a tense mystery after a warm scene is a jump of two steps");
  assert.equal(playing[6], "climax", "the fight starts at once");
  assert.equal(playing[8], "humor", "the galley after the fight, once the climax played its minimum");
  assert.equal(playing[12], "travel");
  assert.equal(playing[16], "climax");
  assert.equal(playing[18], "climax", "a wounded ally inside the fight does not drop the climax");
  const switches = rows.filter((r) => r.switched).length;
  assert.ok(switches >= 8 && switches <= 11, `about half the turns switch, got ${switches}`);
  assert.equal(playing[19], "climax");
  assert.ok(rows.every((r) => r.reason.length > 0 && isMoodId(r.wanted) && isMoodId(r.playing)));
});
