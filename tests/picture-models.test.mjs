// Picture-model bake-off: the new catalogue entries' request shapes, the OpenAI
// GPT Image adapter (request, cost from usage, refusal, no key anywhere but the
// Authorization header), and the deterministic prompt compiler. Fake transport only.
import assert from "node:assert/strict";
import test from "node:test";
import { FAL_IMAGE_MODELS, falEndpoint, falImagePriceUsdMicros, falQueueRoot, falRequestBody, generateFalImage, isContentRefusal } from "../src/lib/visual-frame/fal-image.ts";
import { generateOpenAIImage, openAIImageCostUsdMicros, openAIImageReserveUsdMicros, openAIRequest, openAIRequestFields } from "../src/lib/visual-frame/openai-image.ts";
import { compileAnchorPrompt, compileEditPrompt, compileFramePrompt, compileRecordsFrame, orderReferences, promptFamily, timeOfDay } from "../src/lib/visual-frame/prompt-compiler.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const ref = { bytes: jpeg, contentType: "image/jpeg" };
const KEY = "sk-test-SECRETKEY-0123456789";
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("catalogue: the new fal models keep one queue owner per model and their own request shape", () => {
  const ids = FAL_IMAGE_MODELS.map((row) => row.id);
  for (const id of ["fal-ai/nano-banana-pro", "fal-ai/nano-banana-2", "bytedance/seedream/v5/pro/text-to-image", "blackforestlabs/flux-3/text-to-image", "fal-ai/qwen-image-3/text-to-image"])
    assert.ok(ids.includes(id), id);
  for (const model of FAL_IMAGE_MODELS) assert.equal(falQueueRoot(model.editEndpoint), falQueueRoot(model.id), model.id);
  const base = { prompt: "A harbour at dusk", size: "landscape_16_9_hd", format: "jpeg", seed: 7 };

  const nano = falRequestBody({ ...base, model: "fal-ai/nano-banana-pro", references: [ref] });
  assert.equal(falEndpoint({ model: "fal-ai/nano-banana-pro", references: [ref] }), "fal-ai/nano-banana-pro/edit");
  assert.deepEqual(Object.keys(nano).sort(), ["aspect_ratio", "image_urls", "limit_generations", "num_images", "output_format", "prompt", "resolution", "seed"]);
  assert.equal(nano.aspect_ratio, "16:9");
  assert.equal(nano.resolution, "1K");

  const seedream = falRequestBody({ ...base, model: "bytedance/seedream/v5/pro/text-to-image", references: [ref, ref] });
  assert.deepEqual(seedream.image_size, { width: 1344, height: 768 });
  assert.equal("seed" in seedream, false, "Seedream has no seed");
  assert.equal(falEndpoint({ model: "bytedance/seedream/v5/pro/text-to-image", references: [ref] }), "bytedance/seedream/v5/pro/edit");

  const flux3 = falRequestBody({ ...base, model: "blackforestlabs/flux-3/text-to-image", size: "portrait_16_9_hd", safetyTolerance: "4" });
  assert.deepEqual(flux3, { prompt: base.prompt, aspect_ratio: "9:16", resolution: "1k", output_format: "jpeg", safety_tolerance: 4 });
  assert.equal(falEndpoint({ model: "blackforestlabs/flux-3/text-to-image", references: [ref] }), "blackforestlabs/flux-3/edit-image");

  const qwen = falRequestBody({ ...base, model: "fal-ai/qwen-image-3/text-to-image", size: "landscape_16_9" });
  assert.equal(qwen.image_size, "landscape_16_9", "fal's named sizes stay names");
  assert.equal(qwen.seed, 7);
  assert.throws(() => falRequestBody({ ...base, model: "fal-ai/qwen-image-3/text-to-image", references: [ref, ref, ref, ref] }), (e) => e.code === "validation", "Qwen takes at most three");
  assert.throws(() => falRequestBody({ ...base, model: "bytedance/seedream/v5/pro/text-to-image", format: "webp" }), (e) => e.code === "validation");
  assert.throws(() => falRequestBody({ ...base, model: "fal-ai/nano-banana-2", acceleration: "high" }), (e) => e.code === "validation");

  const grok = falRequestBody({ ...base, model: "xai/grok-imagine-image", references: [ref] });
  assert.deepEqual(Object.keys(grok).sort(), ["aspect_ratio", "enable_safety_checker", "image_urls", "num_images", "output_format", "prompt", "resolution"]);
  assert.equal(falEndpoint({ model: "xai/grok-imagine-image", references: [ref] }), "xai/grok-imagine-image/edit");
  assert.equal(promptFamily("xai/grok-imagine-image"), "grok");

  // The FLUX.2 request is unchanged; the new near-megapixel size goes as explicit dimensions.
  assert.deepEqual(falRequestBody({ ...base, model: "fal-ai/flux-2/klein/9b" }).image_size, { width: 1344, height: 768 });
});

test("catalogue prices: per image, Seedream's per-reference charge, per megapixel unchanged", () => {
  assert.equal(falImagePriceUsdMicros("fal-ai/nano-banana-pro", 1376, 768, 2), 150_000);
  assert.equal(falImagePriceUsdMicros("bytedance/seedream/v5/pro/text-to-image", 1344, 768, 0), 67_500);
  assert.equal(falImagePriceUsdMicros("bytedance/seedream/v5/pro/text-to-image", 1344, 768, 3), 76_500);
  assert.equal(falImagePriceUsdMicros("blackforestlabs/flux-3/text-to-image", 1344, 768), 24_000);
  assert.equal(falImagePriceUsdMicros("blackforestlabs/flux-3/text-to-image", 1376, 768), 48_000, "just over a megapixel rounds up");
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2/klein/9b", 1024, 576, 2), 17_000, "FLUX.2 references are not billed here");
});

test("fal: a content refusal of a new model is a refusal; the key never reaches the error", async () => {
  const fetcher = async (url) => {
    if (String(url).endsWith("/status?logs=0")) return json({ status: "COMPLETED" });
    if (String(url).includes("/requests/")) return json({ detail: "The content could not be processed because it contained material flagged by a content checker." });
    return json({ request_id: "req-abcdefgh" });
  };
  await assert.rejects(generateFalImage(KEY, { model: "fal-ai/nano-banana-2", prompt: "x y z", size: "square_hd", format: "jpeg" }, { fetcher, sleep: async () => {} }),
    (error) => isContentRefusal(error) && !JSON.stringify({ message: error.message, detail: error.detail }).includes(KEY));
});

test("OpenAI request: JSON without references, multipart image[] with them; no seed; limits", async () => {
  const input = { model: "gpt-image-2.5-sunburst", prompt: "A diver", width: 1344, height: 768, quality: "high", format: "jpeg" };
  assert.deepEqual(openAIRequestFields(input), { model: "gpt-image-2.5-sunburst", prompt: "A diver", size: "1344x768", quality: "high", output_format: "jpeg", n: 1 });
  const plain = openAIRequest(input);
  assert.equal(plain.url, "https://api.openai.com/v1/images/generations");
  assert.equal(plain.json, true);
  const edit = openAIRequest({ ...input, references: [ref, { bytes: jpeg, contentType: "image/png" }] });
  assert.equal(edit.url, "https://api.openai.com/v1/images/edits");
  const images = edit.body.getAll("image[]");
  assert.equal(images.length, 2);
  assert.equal(images[1].name, "reference-2.png");
  assert.equal(edit.body.get("size"), "1344x768");
  assert.equal(edit.body.get("seed"), null);
  assert.throws(() => openAIRequestFields({ ...input, width: 1350 }), (e) => e.code === "validation", "sizes are multiples of 16");
  assert.throws(() => openAIRequestFields({ ...input, quality: "max" }), (e) => e.code === "validation");
  assert.throws(() => openAIRequestFields({ ...input, model: "dall-e-3" }), (e) => e.code === "validation");
  assert.throws(() => openAIRequestFields({ ...input, references: Array.from({ length: 7 }, () => ref) }), (e) => e.code === "validation");
});

test("OpenAI adapter: the price comes from the reply's usage; the key goes only to the Authorization header", async () => {
  const calls = [];
  const logged = [];
  const original = { log: console.log, info: console.info, error: console.error, warn: console.warn };
  for (const name of Object.keys(original)) console[name] = (...parts) => logged.push(parts.join(" "));
  try {
    const fetcher = async (url, init) => {
      calls.push({ url, init });
      return json({ data: [{ b64_json: Buffer.from(jpeg).toString("base64") }], usage: { input_tokens: 1300, input_tokens_details: { text_tokens: 300, image_tokens: 1000 }, output_tokens: 4000 } });
    };
    const result = await generateOpenAIImage(KEY, { model: "gpt-image-2", prompt: "A diver", width: 1024, height: 1024, quality: "medium", format: "jpeg", references: [ref] }, { fetcher });
    assert.equal(result.contentType, "image/jpeg");
    assert.deepEqual(result.usage, { textInputTokens: 300, imageInputTokens: 1000, outputTokens: 4000 });
    assert.equal(result.priceUsdMicros, 300 * 5 + 1000 * 8 + 4000 * 30);
    assert.equal(result.priceUsdMicros, openAIImageCostUsdMicros(result.usage));
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${KEY}`);
    assert.equal("Content-Type" in calls[0].init.headers, false, "multipart sets its own boundary");
    const sentFields = [...calls[0].init.body.entries()].filter(([, value]) => typeof value === "string").map(([, value]) => value).join(" ");
    assert.equal(sentFields.includes(KEY), false);
  } finally {
    Object.assign(console, original);
  }
  assert.deepEqual(logged, [], "the adapter logs nothing");
});

test("OpenAI adapter: a moderation block is a content refusal; transport trouble is not; errors never carry the key", async () => {
  const blocked = async () => json({ error: { code: "moderation_blocked", message: `Your request was rejected by the safety system. (key ${KEY})`, type: "invalid_request_error" } }, 400);
  await assert.rejects(generateOpenAIImage(KEY, { model: "gpt-image-2.5-flare", prompt: "A fight", width: 1024, height: 1024, quality: "low", format: "jpeg" }, { fetcher: blocked }),
    (error) => isContentRefusal(error) && /moderation_blocked/.test(error.detail) && !error.detail.includes(KEY) && !error.message.includes(KEY));
  const down = async () => json({ error: { message: "upstream" } }, 503);
  await assert.rejects(generateOpenAIImage(KEY, { model: "gpt-image-2", prompt: "A ship", width: 1024, height: 1024, quality: "low", format: "jpeg" }, { fetcher: down }),
    (error) => error.code === "unavailable" && !isContentRefusal(error));
  const broken = async () => { throw new Error(`socket closed for ${KEY}`); };
  await assert.rejects(generateOpenAIImage(KEY, { model: "gpt-image-2", prompt: "A ship", width: 1024, height: 1024, quality: "low", format: "jpeg" }, { fetcher: broken }),
    (error) => error.code === "unavailable" && error.detail === null);
  await assert.rejects(generateOpenAIImage("", { model: "gpt-image-2", prompt: "A ship", width: 1024, height: 1024, quality: "low", format: "jpeg" }), (error) => error.code === "not_configured");
  assert.ok(openAIImageReserveUsdMicros({ width: 1344, height: 768, quality: "high", references: [ref, ref] }) > openAIImageReserveUsdMicros({ width: 1344, height: 768, quality: "medium" }));
});

const people = [
  { key: "Рэй", label: "the man", pronoun: "he", appearance: "about 35–40, dark swept-back hair, stubble", state: ["he wears a borrowed grey linen shirt under his dark work jacket"] },
  { key: "Фрол", label: "the docker", pronoun: "he", appearance: "a big red-nosed man in a flat cap" },
];
const brief = {
  shot: { who: ["Рэй", "Фрол"], action: "the docker reads a pencil note while the man waits", where: "an attic room", angle: "medium shot", mood: "candlelight" },
  people, references: orderReferences([{ role: "style" }, { role: "figure", person: "Рэй" }, { role: "place" }, { role: "face", person: "Рэй" }], people, 6),
  clock: { timeOfDay: "in the evening", weather: "rain on the window" }, style: "Cinematic noir",
};

test("prompt compiler: references by role in a fixed order, numbered for GPT Image and by position for the others", () => {
  assert.deepEqual(brief.references.map((row) => row.role), ["face", "figure", "place", "style"]);
  assert.deepEqual(orderReferences(brief.references, people, 2).map((row) => row.role), ["face", "figure"], "subjects survive the cut");
  const gpt = compileFramePrompt(brief, "gpt-image");
  assert.match(gpt, /^Reference images: Image 1 — the man's face and hair \(keep exact\)\. Image 2 — the man's full figure and build/);
  assert.match(gpt, /Image 3 — the place \(setting only\)\. Image 4 — the art style \(style only\)\./);
  // Fix run E (item 79): identity only — the anchor's pose and gaze are not copied.
  assert.match(gpt, /Keep his face, facial features, skin tone, hair, age and build exactly as in Images 1–2\. That picture shows identity only: do not copy its pose, head angle, gaze or expression\./);
  const nano = compileFramePrompt(brief, "nano-banana");
  assert.match(nano, /^A cinematic story illustration of one moment: the docker reads a pencil note/);
  assert.match(nano, /The first image shows the man's face and hair/);
  assert.match(nano, /exactly as in the first and second images/);
  assert.equal(compileFramePrompt(brief, "nano-banana"), nano, "deterministic");
});

test("prompt compiler: state, clock, count, anatomy and lettering; no names; FLUX gets no negatives", () => {
  for (const family of ["gpt-image", "nano-banana", "seedream", "qwen", "flux"]) {
    const prompt = compileFramePrompt(brief, family);
    assert.equal(/Рэй|Фрол/.test(prompt), false, `${family}: names never reach the picture`);
    assert.match(prompt, /Right now: he wears a borrowed grey linen shirt under his dark work jacket\./);
    assert.match(prompt, /The setting: an attic room, in the evening; rain on the window\./);
    assert.match(prompt, /Exactly two people are in the frame, each of them once\./);
    assert.match(prompt, /two arms and two hands with five fingers each/);
    assert.match(prompt, /Art style: Cinematic noir\./);
    if (family === "flux") {
      assert.equal(/\bno\b|\bnot\b/i.test(prompt), false, "FLUX prompts carry no negatives");
      assert.match(prompt, /plain and unmarked/);
    } else assert.match(prompt, /No text, letters, numbers, logos, signs or watermarks anywhere in the picture\./);
  }
  const empty = compileFramePrompt({ ...brief, people: [], references: [], shot: { ...brief.shot, who: [] }, clock: null }, "gpt-image");
  assert.match(empty, /No people in the frame\./);
  assert.equal(/Reference images/.test(empty), false);
  assert.equal(compileFramePrompt({ ...brief, allowText: true }, "gpt-image").includes("No text"), false);
});

test("prompt compiler: model families, the anchor prompt, the edit prompt, time of day", () => {
  assert.equal(promptFamily("gpt-image-2.5-flare"), "gpt-image");
  assert.equal(promptFamily("fal-ai/nano-banana-pro"), "nano-banana");
  assert.equal(promptFamily("bytedance/seedream/v5/pro/text-to-image"), "seedream");
  assert.equal(promptFamily("fal-ai/qwen-image-3/text-to-image"), "qwen");
  assert.equal(promptFamily("fal-ai/flux-2/klein/9b"), "flux");
  assert.equal(promptFamily("blackforestlabs/flux-3/text-to-image"), "flux");
  const figure = compileAnchorPrompt({ person: people[0], composition: "figure", references: [{ role: "face", person: "Рэй" }], style: "Cinematic noir" }, "gpt-image");
  assert.match(figure, /^Reference images: Image 1 — the man's face and hair \(keep exact\)\./);
  assert.match(figure, /whole figure visible from head to boots, arms down at his sides/);
  assert.match(figure, /Exactly one person: one head, two arms, two hands with five fingers each, two legs/);
  assert.equal(figure.includes("Рэй"), false);
  assert.match(compileEditPrompt("make his shirt grey linen", "gpt-image"), /^Edit Image 1: change only this — make his shirt grey linen\. Keep everything else exactly as it is/);
  assert.match(compileEditPrompt("make his shirt grey linen", "flux"), /^Change only this in the image: make his shirt grey linen\. Everything else stays exactly the same/);
  assert.equal(timeOfDay(null), null);
  assert.equal(timeOfDay(6 * 60), "at dawn");
  assert.equal(timeOfDay(1440 + 9 * 60), "in the morning");
  assert.equal(timeOfDay(20 * 60), "at dusk");
  assert.equal(timeOfDay(23 * 60), "at night");
});

test("records path: worn items and conditions become the state, references go subjects first and keep their IDs", () => {
  const heroRow = { id: "hero-1", kind: "player", conditions: ["soaked"] };
  const docker = { id: "npc-2", kind: "npc", conditions: [] };
  const out = compileRecordsFrame({
    modelId: "fal-ai/flux-2/klein/9b",
    shot: { who: ["Рэй", "Фрол"], action: "the docker reads a note while the hero waits", where: "an attic", angle: "medium shot", mood: "candlelight" },
    style: "Cinematic noir",
    people: [{ name: "Рэй", entity: heroRow, appearance: "dark swept-back hair, stubble" }, { name: "Фрол", entity: docker, appearance: "big, red-nosed" }],
    items: [
      { name: "grey linen shirt", quantity: 1, equipped_entity_id: "hero-1" },
      { name: "spare rope", quantity: 1, equipped_entity_id: null },
      { name: "torn sack", quantity: 0, equipped_entity_id: "hero-1" },
    ],
    references: [{ id: "style-1", role: "style" }, { id: "place-1", role: "place" }, { id: "p-hero", role: "face", entityId: "hero-1" },
      { id: "p-docker", role: "face", entityId: "npc-2" }, { id: "f-hero", role: "figure", entityId: "hero-1" }],
    maxReferences: 4,
    worldMinutes: 19 * 60 + 30,
  });
  assert.deepEqual(out.referenceIds, ["p-hero", "f-hero", "p-docker", "place-1"], "the hero's face and figure first; the style is cut before any subject");
  assert.match(out.prompt, /Right now: they wear or carry grey linen shirt; visible condition: soaked\./);
  assert.equal(/spare rope|torn sack|Рэй|Фрол/.test(out.prompt), false);
  assert.match(out.prompt, /The hero \(the first and second images\)/);
  assert.match(out.prompt, /at dusk/);
  assert.match(out.prompt, /plain and unmarked/, "a FLUX model gets the FLUX dialect");
});
