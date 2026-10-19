// Polish 2, part 2 (docs/stages/POLISH_2.md §2): GPT Image 2.5 in the app by the
// owner's blind picks — the model per tier (default and the owner's choice), the
// OpenAI path of the picture job with the same key check, price ledger and daily
// cap, the Flare → Sunburst refusal ladder, the full-figure anchor prompt with the
// carried items as a separate constraint, and the clock in the frame prompt.
// Fake transport only; no key, no paid call.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { runPictureJob, refusalFallbackModel } from "../src/lib/visual-frame/picture-job.ts";
import { DEFAULT_TIER_MODELS, isOpenAIPictureModel, maxReferencesFor, modelForTier, parsePictureSettings, PICTURE_MODELS, pictureCostUsdMicros, pictureSizeFor, referencesForShot, referencesForAnchor } from "../src/lib/visual-frame/pictures.ts";
import { compileAnchorPrompt, compileRecordsFrame } from "../src/lib/visual-frame/prompt-compiler.ts";
import { openAIImageTypicalUsdMicros } from "../src/lib/visual-frame/openai-image.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const cid = randomUUID();
const timeline = { timelineId: randomUUID(), epoch: 1 };
const KEY_OPENAI = "sk-openai-SECRET-0123456789";
const KEY_FAL = "fal-SECRET-0123456789";
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const picture = (over = {}) => ({
  id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: randomUUID(), composition: "frame", timeline, version: 1, status: "queued", hidden: false,
  model: "gpt-image-2.5-flare", tier: "fast", trigger: "live", styleVersionId: null, width: null, height: null, costUsdMicros: 0, elapsedMs: null, error: null,
  createdAt: new Date().toISOString(), readyAt: null, prompt: "A frame of a man in his thirties with a revolver.", shot: null, storagePath: null, contentType: null, sha256: null, referenceIds: [], requestId: null, ...over,
});
function fakeContext(rows, objects = {}) {
  const updates = [];
  const stored = {};
  const logged = [];
  const row = (id) => { const r = rows[id]; if (!r) { const e = new Error("not_found"); e.code = "not_found"; throw e; } return r; };
  const ctx = {
    campaignId: cid,
    rpc: async (action, payload) => {
      if (action === "picture.private") return { ...row(payload.id) };
      if (action === "style.private") { const e = new Error("not_found"); e.code = "not_found"; throw e; }
      if (action === "picture.update") {
        const r = row(payload.id);
        updates.push(payload);
        Object.assign(r, { status: payload.status, costUsdMicros: payload.costUsdMicros ?? r.costUsdMicros, error: payload.error ?? null, model: payload.model ?? r.model,
          ...(payload.output ? { storagePath: payload.output.storagePath, width: payload.output.width, height: payload.output.height, readyAt: new Date().toISOString() } : {}) });
        return { ...r };
      }
      throw new Error("unexpected " + action);
    },
    storage: { put: async (path, bytes, contentType) => { stored[path] = { bytes, contentType }; }, get: async (path) => objects[path] ?? null },
    sha256: () => "c".repeat(64),
    log: (event, data) => logged.push({ event, ...data }),
  };
  return { ctx, updates, stored, logged };
}
const openAIReply = (outputTokens = 1000, imageTokens = 0) => json({ data: [{ b64_json: Buffer.from(jpeg).toString("base64") }],
  usage: { input_tokens: 2000 + imageTokens, input_tokens_details: { text_tokens: 2000, image_tokens: imageTokens }, output_tokens: outputTokens } });
const moderationBlock = () => json({ error: { code: "moderation_blocked", message: "Your request was rejected by the safety system.", type: "invalid_request_error" } }, 400);

test("the model per tier: the blind picks by default, the owner's choice from the picture settings, unknown IDs ignored", () => {
  assert.deepEqual(DEFAULT_TIER_MODELS, { fast: "gpt-image-2.5-sunburst", quality: "gpt-image-2.5-sunburst" }); // polish 3 §5: live frames on Sunburst too
  assert.equal(modelForTier("quality"), "gpt-image-2.5-sunburst");
  assert.equal(modelForTier("fast"), "gpt-image-2.5-sunburst");
  const settings = parsePictureSettings({ models: { fast: "fal-ai/flux-2/klein/9b", quality: "no-such-model" } });
  assert.deepEqual(settings.models, { fast: "fal-ai/flux-2/klein/9b" }, "a model outside the catalogue is dropped");
  assert.equal(modelForTier("fast", settings), "fal-ai/flux-2/klein/9b", "FLUX stays in the catalogue for the owner's switch");
  assert.equal(modelForTier("quality", settings), "gpt-image-2.5-sunburst");
  assert.deepEqual(parsePictureSettings({}).models, {});
  assert.ok(PICTURE_MODELS.some((row) => row.id === "fal-ai/flux-2-pro" && row.provider === "fal"));
  assert.ok(PICTURE_MODELS.some((row) => row.id === "gpt-image-2.5-sunburst" && row.provider === "openai" && row.medianSeconds === 27));
  assert.equal(new Set(PICTURE_MODELS.map((row) => row.id)).size, PICTURE_MODELS.length, "one entry per model");
  assert.equal(isOpenAIPictureModel("gpt-image-2.5-flare"), true);
  assert.equal(isOpenAIPictureModel("fal-ai/flux-2-pro"), false);
  assert.equal(maxReferencesFor("gpt-image-2.5-flare"), 6);
  assert.equal(maxReferencesFor("fal-ai/flux-2/klein/9b"), 4);
});

test("sizes and price labels: GPT Image draws frames and figures at the bake-off's near-megapixel sizes; fal keeps the Stage V presets", () => {
  assert.equal(pictureSizeFor("gpt-image-2.5-flare", "frame"), "landscape_16_9_hd");
  assert.equal(pictureSizeFor("gpt-image-2.5-sunburst", "figure"), "portrait_16_9_hd");
  assert.equal(pictureSizeFor("gpt-image-2.5-sunburst", "portrait"), "square_hd");
  assert.equal(pictureSizeFor("fal-ai/flux-2/klein/9b", "frame"), "landscape_16_9");
  // One megapixel at high quality on 2.5: about 1,000 output tokens ($0.03) plus about 2,000 text tokens ($0.01).
  const frame = pictureCostUsdMicros("fast", "frame");
  assert.equal(frame, openAIImageTypicalUsdMicros({ model: "gpt-image-2.5-flare", width: 1344, height: 768, quality: "high" }));
  assert.ok(frame > 35_000 && frame < 50_000, `about $0.04–0.05 a frame, got ${frame}`);
  assert.ok(pictureCostUsdMicros("quality", "frame", "gpt-image-2") > 3 * frame, "GPT Image 2 costs about three times 2.5");
  assert.equal(pictureCostUsdMicros("fast", "frame", "fal-ai/flux-2/klein/9b"), 17_000, "fal prices unchanged");
  assert.equal(pictureCostUsdMicros("quality", "item", "fal-ai/flux-2-pro"), 30_000);
});

test("the reference helpers take any catalogue model, trimmed to its limit", () => {
  const uuid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
  const hero = uuid(1);
  const pictures = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    id: uuid(50 + n), kind: "anchor", subjectKind: "entity", subjectId: uuid(n), composition: "portrait", timeline, version: 1, status: "ready", hidden: false,
    model: "gpt-image-2.5-sunburst", tier: "quality", trigger: "autopilot", styleVersionId: null, width: 1024, height: 1024, costUsdMicros: 0, elapsedMs: 1, error: null, createdAt: "2026-10-17T00:00:00Z", readyAt: "2026-10-17T00:00:01Z",
  }));
  const board = { campaignId: cid, worldId: null, settings: parsePictureSettings({}), today: { count: 0, costUsdMicros: 0 }, styles: [], pictures };
  assert.equal(referencesForShot(board, { entityIds: [1, 2, 3, 4, 5, 6, 7].map(uuid), locationId: null, model: "gpt-image-2.5-flare" }).length, 6);
  assert.equal(referencesForShot(board, { entityIds: [1, 2, 3, 4, 5, 6, 7].map(uuid), locationId: null, model: "fal-ai/qwen-image-3/text-to-image" }).length, 3);
  assert.deepEqual(referencesForAnchor(board, { kind: "entity", id: hero }, "figure", "gpt-image-2.5-sunburst"), [uuid(51)]);
});

test("the OpenAI path of the picture job: the server's OpenAI key, the price from the reply's usage, references as an edit, the row's model", async () => {
  const anchor = picture({ kind: "anchor", subjectKind: "entity", composition: "portrait", status: "ready", model: "gpt-image-2.5-sunburst", storagePath: `${cid}/pictures/a.jpg` });
  const frame = picture({ referenceIds: [anchor.id] });
  const { ctx, updates, stored, logged } = fakeContext({ [anchor.id]: anchor, [frame.id]: frame }, { [`${cid}/pictures/a.jpg`]: { bytes: jpeg, contentType: "image/jpeg" } });
  const calls = [];
  const fetcher = async (url, init = {}) => { calls.push({ url: String(url), init }); return openAIReply(1000, 1000); };
  const ready = await runPictureJob(ctx, frame.id, { apiKey: KEY_FAL, openAIApiKey: KEY_OPENAI, extraCostUsdMicros: 120, fetcher });
  assert.equal(ready.status, "ready");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.openai.com/v1/images/edits", "a reference makes it an edit");
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${KEY_OPENAI}`, "the OpenAI key, never the fal one");
  assert.equal(calls[0].init.body.get("model"), "gpt-image-2.5-flare");
  assert.equal(calls[0].init.body.get("size"), "1344x768");
  assert.equal(calls[0].init.body.get("quality"), "high");
  assert.equal(calls[0].init.body.get("moderation"), "low");
  assert.equal(calls[0].init.body.getAll("image[]").length, 1);
  assert.equal(ready.costUsdMicros, 2000 * 5 + 1000 * 8 + 1000 * 30 + 120, "exact usage plus the shot's cost");
  assert.equal(ready.width, 1344);
  assert.equal(ready.height, 768);
  assert.deepEqual(updates.map((row) => row.status), ["generating", "ready"]);
  assert.equal(updates[1].model, "gpt-image-2.5-flare");
  assert.equal("requestId" in updates[1], false, "OpenAI replies carry no request id");
  assert.ok(stored[`${cid}/pictures/${frame.id}.jpg`]);
  const text = JSON.stringify([updates, logged, ready]);
  assert.equal(text.includes(KEY_OPENAI) || text.includes(KEY_FAL), false, "no key in rows or logs");
  // The same key check as fal's: an empty OpenAI key ends the row as not configured, nothing is sent.
  const unconfigured = picture({ model: "gpt-image-2.5-sunburst" });
  const second = fakeContext({ [unconfigured.id]: unconfigured });
  const failed = await runPictureJob(second.ctx, unconfigured.id, { apiKey: KEY_FAL, openAIApiKey: "", fetcher: async () => { throw new Error("must not be called"); } });
  assert.equal(failed.status, "failed");
  assert.equal(failed.error, "not_configured");
  // A fal model on the same job still goes to fal with the fal key.
  const klein = picture({ model: "fal-ai/flux-2/klein/9b" });
  const third = fakeContext({ [klein.id]: klein });
  const falCalls = [];
  let polls = 0;
  const falFetcher = async (url, init = {}) => {
    falCalls.push({ url: String(url), init });
    if (url === "https://queue.fal.run/fal-ai/flux-2/klein/9b") return json({ request_id: "req-abcdefgh" });
    if (String(url).endsWith("/status?logs=0")) return json({ status: polls++ ? "COMPLETED" : "IN_PROGRESS" });
    if (String(url).endsWith("/requests/req-abcdefgh")) return json({ images: [{ url: "https://v3.fal.media/files/f.jpg", width: 1024, height: 576 }] });
    if (url === "https://v3.fal.media/files/f.jpg") return new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } });
    throw new Error("unexpected " + url);
  };
  const drawn = await runPictureJob(third.ctx, klein.id, { apiKey: KEY_FAL, openAIApiKey: KEY_OPENAI, fetcher: falFetcher, sleep: async () => {} });
  assert.equal(drawn.status, "ready");
  assert.equal(falCalls[0].init.headers.Authorization, `Key ${KEY_FAL}`);
  assert.equal(drawn.costUsdMicros, 17_000);
  assert.equal(JSON.parse(falCalls[0].init.body).image_size, "landscape_16_9", "fal keeps its Stage V size");
});

test("the refusal ladder: a moderation block → one softened re-submit → Sunburst once; Sunburst itself has no fallback; nothing retries a transport failure", async () => {
  assert.equal(refusalFallbackModel("gpt-image-2.5-flare"), "gpt-image-2.5-sunburst");
  assert.equal(refusalFallbackModel("gpt-image-2.5-sunburst"), null);
  assert.equal(refusalFallbackModel("fal-ai/flux-2-pro"), "fal-ai/flux-2/klein/9b");
  assert.equal(refusalFallbackModel("fal-ai/flux-2/klein/9b"), null);
  const frame = picture({ prompt: "A frame of a man in his thirties with a revolver washing a bleeding cut." });
  const { ctx, updates, logged } = fakeContext({ [frame.id]: frame });
  const submits = [];
  const fetcher = async (url, init = {}) => {
    const body = JSON.parse(init.body);
    submits.push({ model: body.model, prompt: body.prompt });
    return submits.length < 3 ? moderationBlock() : openAIReply();
  };
  const ready = await runPictureJob(ctx, frame.id, { apiKey: KEY_FAL, openAIApiKey: KEY_OPENAI, fetcher });
  assert.equal(ready.status, "ready");
  assert.deepEqual(submits.map((row) => row.model), ["gpt-image-2.5-flare", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst"]);
  assert.doesNotMatch(submits[1].prompt, /thirties|revolver|bleeding/, "the second attempt is softened");
  assert.equal(submits[2].prompt, frame.prompt, "the fallback model gets the original prompt");
  assert.equal(updates.at(-1).model, "gpt-image-2.5-sunburst", "the row records the model that drew it");
  assert.deepEqual(logged.map((row) => row.event), ["picture_content_refusal", "picture_fast_fallback", "picture_ready"]);
  // Sunburst: two attempts, then the row fails with the reason.
  const sunburst = picture({ model: "gpt-image-2.5-sunburst", tier: "quality", trigger: "key_moment" });
  const second = fakeContext({ [sunburst.id]: sunburst });
  let attempts = 0;
  const failed = await runPictureJob(second.ctx, sunburst.id, { apiKey: KEY_FAL, openAIApiKey: KEY_OPENAI, fetcher: async () => { attempts++; return moderationBlock(); } });
  assert.equal(failed.status, "failed");
  assert.equal(attempts, 2);
  assert.match(failed.error, /^validation: HTTP 400: moderation_blocked/);
  assert.equal(failed.costUsdMicros, 0, "a refusal is not billed");
  // A transport failure is not a refusal: one attempt, the row fails.
  const down = picture();
  const third = fakeContext({ [down.id]: down });
  let tries = 0;
  const unavailable = await runPictureJob(third.ctx, down.id, { apiKey: KEY_FAL, openAIApiKey: KEY_OPENAI, fetcher: async () => { tries++; return json({ error: { message: "upstream" } }, 503); } });
  assert.equal(unavailable.status, "failed");
  assert.equal(tries, 1);
});

test("the full-figure anchor prompt: carried items are their own constraint, hands empty, never inside the pose", () => {
  const person = { key: "hero", label: "the hero", pronoun: "they", appearance: "a former diver about 35, dark swept-back hair, stubble, worn dark work jacket" };
  const prompt = compileAnchorPrompt({ person, composition: "figure", references: [{ role: "face", person: "hero" }], style: "Cinematic noir", carried: ["revolver", "copper diving helmet", "coil of rope"] }, "gpt-image");
  assert.match(prompt, /arms down at their sides, both hands empty, on a plain dark backdrop\./);
  assert.match(prompt, /Their gear, worn on the body, slung or hung from the belt and straps, not held in the hands: revolver, copper diving helmet and coil of rope\./);
  assert.doesNotMatch(prompt, /in hand|in hands/);
  assert.match(prompt, /Exactly one person: one head, two arms, two hands with five fingers each, two legs/);
  const flux = compileAnchorPrompt({ person, composition: "figure", references: [], style: "", carried: ["revolver"] }, "flux");
  assert.match(flux, /not held in the hands: revolver\./);
  assert.equal(compileAnchorPrompt({ person, composition: "portrait", references: [], style: "" }, "gpt-image").includes("gear"), false, "no gear line without items");
});

test("the clock reaches the frame prompt as the time of day; without it the prompt says nothing about time", () => {
  const shot = { who: ["Рэй"], action: "a man kneels on a pontoon filing a winch gear", where: "a floating market pontoon", angle: "medium shot", mood: "cold grey light" };
  const base = { modelId: "gpt-image-2.5-flare", shot, style: "Cinematic noir", items: [], maxReferences: 6, people: [{ name: "Рэй", entity: { id: "e1", kind: "player", conditions: [] }, appearance: "a diver" }], references: [] };
  assert.match(compileRecordsFrame({ ...base, worldMinutes: 2 * 1440 + 20 * 60 }).prompt, /The setting: a floating market pontoon, at dusk\./);
  assert.match(compileRecordsFrame({ ...base, worldMinutes: 7 * 60 + 30 }).prompt, /in the morning\./);
  assert.doesNotMatch(compileRecordsFrame({ ...base, worldMinutes: null }).prompt, /at dusk|morning|night|daytime/);
});
