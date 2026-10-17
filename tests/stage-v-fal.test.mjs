// Stage V: the fal adapter's new endpoints, reference pictures and the
// softened re-submit. Fake transport only; no paid call.
import assert from "node:assert/strict";
import test from "node:test";
import {
  FAL_IMAGE_MODELS,
  falEndpoint,
  falImagePriceUsdMicros,
  falQueueRoot,
  falRequestBody,
  FalImageError,
  generateFalImage,
  isContentRefusal,
  referenceDataUrl,
  softenPrompt,
} from "../src/lib/visual-frame/fal-image.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);

test("fal models: every model has an edit endpoint under the same queue owner and a reference limit", () => {
  for (const model of FAL_IMAGE_MODELS) {
    assert.equal(falQueueRoot(model.editEndpoint), falQueueRoot(model.id), model.id);
    assert.ok(model.maxReferences >= 3 && model.maxReferences <= 8, model.id);
    assert.ok(model.firstMegapixelUsdMicros > 0);
  }
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2/klein/4b", 1024, 576), 16_000);
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2/klein/9b", 1024, 1024), 17_000);
  assert.equal(falImagePriceUsdMicros("fal-ai/flux-2/klein/9b", 2048, 1024), 19_000);
  assert.equal(falQueueRoot("fal-ai/flux-2/klein/9b/edit"), "https://queue.fal.run/fal-ai/flux-2");
  assert.equal(falQueueRoot("fal-ai/flux-2-pro/edit"), "https://queue.fal.run/fal-ai/flux-2-pro");
});

test("fal request body: references go to the edit endpoint as data URIs; limits hold", () => {
  const plain = { model: "fal-ai/flux-2/klein/9b", prompt: "A lantern", size: "landscape_16_9", format: "jpeg" };
  assert.equal(falEndpoint(plain), "fal-ai/flux-2/klein/9b");
  assert.deepEqual(falRequestBody(plain), { prompt: "A lantern", image_size: "landscape_16_9", output_format: "jpeg", enable_safety_checker: true, num_images: 1 });
  const withRefs = { ...plain, references: [{ bytes: jpeg, contentType: "image/jpeg" }], acceleration: "high" };
  assert.equal(falEndpoint(withRefs), "fal-ai/flux-2/klein/9b/edit");
  const body = falRequestBody(withRefs);
  assert.equal(body.acceleration, "high");
  assert.deepEqual(body.image_urls, [referenceDataUrl(withRefs.references[0])]);
  assert.match(body.image_urls[0], /^data:image\/jpeg;base64,\/9j\//);
  assert.throws(() => falRequestBody({ ...plain, references: Array.from({ length: 5 }, () => ({ bytes: jpeg, contentType: "image/jpeg" })) }), (e) => e.code === "validation", "klein takes at most 4 references");
  assert.throws(() => falRequestBody({ ...plain, model: "fal-ai/flux-2-pro", acceleration: "high" }), (e) => e.code === "validation", "pro has no acceleration");
  assert.throws(() => falRequestBody({ ...plain, safetyTolerance: "4" }), (e) => e.code === "validation", "safety tolerance is pro-only");
  assert.equal(falRequestBody({ ...plain, model: "fal-ai/flux-2-pro", safetyTolerance: "4" }).safety_tolerance, "4");
  assert.equal(falRequestBody({ ...plain, model: "fal-ai/flux-2-pro" }).safety_tolerance, "2");
  assert.throws(() => falRequestBody({ ...plain, model: "fal-ai/flux-2-pro", format: "webp" }), (e) => e.code === "validation");
});

test("fal adapter: an edit submit carries the references; a completed request without images is a validation failure", async () => {
  const calls = [];
  let polls = 0;
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
  const fetcher = async (url, init = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
    if (url === "https://queue.fal.run/fal-ai/flux-2/klein/9b/edit") return json({ request_id: "req-abcdefgh" });
    if (String(url).endsWith("/status?logs=0")) return json({ status: polls++ ? "COMPLETED" : "IN_QUEUE" });
    if (url === "https://queue.fal.run/fal-ai/flux-2/requests/req-abcdefgh") return json({ images: [{ url: "https://v3.fal.media/files/y.jpg", width: 1024, height: 576 }] });
    if (url === "https://v3.fal.media/files/y.jpg") return new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } });
    throw new Error("unexpected " + url);
  };
  const result = await generateFalImage("k", { model: "fal-ai/flux-2/klein/9b", prompt: "A lantern", size: "landscape_16_9", format: "jpeg",
    references: [{ bytes: jpeg, contentType: "image/jpeg" }] }, { fetcher, sleep: async () => {} });
  assert.equal(result.endpoint, "fal-ai/flux-2/klein/9b/edit");
  assert.equal(result.contentType, "image/jpeg");
  assert.equal(result.priceUsdMicros, 17_000);
  assert.ok(result.elapsedMs >= 0);
  assert.equal(calls[0].body.image_urls.length, 1);
  const rejected = async (url) => {
    if (String(url).endsWith("/status?logs=0")) return json({ status: "COMPLETED" });
    if (String(url).includes("/requests/")) return json({ detail: [{ type: "missing", loc: ["body", "prompt"], msg: "Field required" }] });
    return json({ request_id: "req-abcdefgh" });
  };
  await assert.rejects(generateFalImage("k", { model: "fal-ai/flux-2/flash", prompt: "x", size: "square_hd", format: "png" }, { fetcher: rejected, sleep: async () => {} }),
    (error) => error.code === "validation" && /without images: Field required/.test(error.detail));
});

test("content refusal is told apart from transport trouble; the softened prompt drops the flagged word classes", () => {
  assert.equal(isContentRefusal(new FalImageError("validation", "HTTP 422: The content could not be processed because it contained material flagged by a content checker.")), true);
  assert.equal(isContentRefusal(new FalImageError("validation", "HTTP 400: bad size")), false);
  assert.equal(isContentRefusal(new FalImageError("unavailable", "HTTP 503")), false);
  const soft = softenPrompt("A wiry man in his thirties with a short dark beard, a travelling mechanic, a heavy engraved revolver holstered at the hip, scars on both hands, 42 years old, a grizzled German engineer-soldier.");
  assert.doesNotMatch(soft, /thirties|revolver|holster|scars|42 years old|German/);
  assert.match(soft, /wiry man .* short dark beard, a travelling mechanic/);
  const ru = softenPrompt("Жилистый мужчина лет тридцати, шрам на щеке, тяжёлый револьвер в кобуре, немецкий инженер.");
  assert.doesNotMatch(ru, /шрам|револьвер|кобур|немецк/u);
  assert.match(ru, /Жилистый мужчина/u);
});
