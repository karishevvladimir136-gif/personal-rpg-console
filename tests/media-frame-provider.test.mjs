import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { fixture, png, parameters } from "./media-frame-fixture.mjs";
import {
  imageResponsePixels,
  checkedPng,
} from "../src/lib/server/media/png.ts";
const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { openAiFrameProvider } =
  await import("../src/lib/server/media/provider.ts");
hook.deregister();
async function generating() {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  return {
    f,
    frame: JSON.parse(input.payload.body.slice("RPG_VISUAL_FRAME_V0\n".length)),
    jobId: q.record.id,
  };
}
function response(overrides = {}, headers = {}) {
  return new Response(
    JSON.stringify({
      data: [{ b64_json: Buffer.from(png()).toString("base64") }],
      size: parameters.size,
      quality: "high",
      output_format: "png",
      usage: {
        input_tokens_details: { text_tokens: 100, image_tokens: 0 },
        output_tokens: 1372,
      },
      ...overrides,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-request-id": "synthetic-request",
        ...headers,
      },
    },
  );
}
test("direct Images boundary sends only pinned public prompt, one explicit PNG and no DM/Responses/tool/fallback", async () => {
  const { frame, jobId } = await generating(),
    calls = [],
    key = "SYNTHETIC_NOT_A_CREDENTIAL";
  const provider = openAiFrameProvider(key, async (...args) => {
    calls.push(args);
    return response();
  });
  const data = await provider.generate(frame, jobId);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "https://api.openai.com/v1/images/generations");
  const body = JSON.parse(calls[0][1].body);
  assert.deepEqual(body, {
    model: frame.model,
    prompt: frame.prompt,
    size: "1536x1024",
    quality: "high",
    output_format: "png",
    n: 1,
    stream: false,
  });
  assert.equal(calls[0][1].redirect, "error");
  assert.doesNotMatch(JSON.stringify(data.output), new RegExp(key));
  assert.equal(data.output.providerRequestId, "synthetic-request");
  assert.equal(data.output.usage.outputTokens, 1372);
  assert.equal(checkedPng(data.bytes), data.output.sha256);
});
test("eligible selected pixel reference fails closed BEFORE any network call, with no silent text substitution", async () => {
  const { frame, jobId } = await generating();
  frame.basis.references.push({
    documentId: randomUUID(),
    versionId: randomUUID(),
    subject: { kind: "style", id: frame.campaign_id },
    sourceRevision: 0,
    imageAssetId: randomUUID(),
    imageAssetRevision: 1,
  });
  let calls = 0;
  await assert.rejects(
    openAiFrameProvider("synthetic", async () => {
      calls++;
      throw Error("no-network");
    }).generate(frame, jobId),
    (e) => e.code === "not_configured",
  );
  assert.equal(calls, 0);
});
for (const mutate of [
  (f) => (f.model = "arbitrary-model"),
  (f) => (f.parameters.n = 2),
  (f) => (f.prompt = "Я".repeat(30001)),
  (f) => (f.dispatch.reservationUsdMicros = 1),
])
  test("invalid model, count, prompt or reservation never reaches the provider", async () => {
    const { frame, jobId } = await generating();
    mutate(frame);
    let calls = 0;
    await assert.rejects(
      openAiFrameProvider("synthetic", async () => {
        calls++;
        return response();
      }).generate(frame, jobId),
    );
    assert.equal(calls, 0);
  });
for (const override of [
  { model: "silent-fallback" },
  { size: "1024x1024" },
  { quality: "auto" },
  { output_format: "jpeg" },
  { data: [{ url: "https://evil.example/image.png" }] },
  { data: [{ b64_json: "invalid" }, { b64_json: "invalid" }] },
  { usage: { output_tokens: -1 } },
])
  test("unexpected response identity/parameters/pixels/usage becomes uncertain without fetching external URLs", async () => {
    const { frame, jobId } = await generating();
    let calls = 0;
    await assert.rejects(
      openAiFrameProvider("synthetic", async () => {
        calls++;
        return response(override);
      }).generate(frame, jobId),
      (e) => e.code === "unavailable",
    );
    assert.equal(calls, 1);
  });
test("transport loss and 5xx are uncertain; definite rejection has no automatic retry", async () => {
  const { frame, jobId } = await generating();
  for (const status of [400, 401, 403, 429, 500]) {
    let calls = 0;
    await assert.rejects(
      openAiFrameProvider("synthetic", async () => {
        calls++;
        return new Response("PRIVATE-PROVIDER-ERROR", { status });
      }).generate(frame, jobId),
      (e) => {
        assert.doesNotMatch(e.message, /PRIVATE/);
        return e.code === (status === 500 ? "unavailable" : "validation");
      },
    );
    assert.equal(calls, 1);
  }
  let count = 0;
  await assert.rejects(
    openAiFrameProvider("synthetic", async () => {
      count++;
      throw Error("secret transport details");
    }).generate(frame, jobId),
    (e) => e.code === "unavailable",
  );
  assert.equal(count, 1);
});
test("PNG truncation, bad checksums, wrong dimensions and oversized body are rejected; missing usage is explicitly unknown", () => {
  const f = fixture(),
    id = randomUUID(),
    valid = png();
  assert.throws(() => checkedPng(valid.slice(0, 33)));
  const bad = valid.slice();
  bad[25] ^= 1;
  assert.throws(() => checkedPng(bad));
  assert.throws(() => checkedPng(png(1024, 1024), parameters));
  assert.throws(() => checkedPng(new Uint8Array(12000001)));
  const data = imageResponsePixels(
    { data: [{ b64_json: Buffer.from(valid).toString("base64") }] },
    f.snapshot.campaign.id,
    id,
    parameters,
    null,
  );
  assert.equal(data.output.usage, null);
  assert.equal(data.output.providerRequestId, null);
});
test("reported charge beyond reservation or unexpected billed image input stores evidence then stops uncertain without attachment", async () => {
  for (const usage of [
    { textInputTokens: 90000, imageInputTokens: 0, outputTokens: 1372 },
    { textInputTokens: 100, imageInputTokens: 1, outputTokens: 1372 },
  ]) {
    const f = fixture(),
      q = await f.queue(),
      generate = f.provider.generate;
    f.provider.generate = async (...args) => {
      const data = await generate(...args);
      data.output.usage = usage;
      return data;
    };
    await assert.rejects(
      f.run("media.dispatch", f.dispatch(q.record)),
      (e) => e.code === "unavailable",
    );
    assert.equal(f.providerCalls(), 1);
    assert.equal(
      f.snapshot.assets.some((a) => a.id === q.record.id),
      false,
    );
    assert.deepEqual(f.pixels.get(q.record.id).output.usage, usage);
    assert.equal(
      JSON.parse(
        f.snapshot.documents
          .find((r) => r.id === q.record.id)
          .body.slice("RPG_VISUAL_FRAME_V0\n".length),
      ).status,
      "uncertain",
    );
  }
});
