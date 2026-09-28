import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { fixture, png } from "./media-frame-fixture.mjs";
import { parseRealFrame } from "../src/lib/visual-frame/real-frame.ts";
const hook = registerHooks({
  resolve(specifier, context, next) {
    return specifier === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : next(specifier, context);
  },
});
const { openAiFrameVerifier, frameGroundingContext } =
  await import("../src/lib/server/media/grounding.ts");
hook.deregister();
const pass = { schemaVersion: 2, status: "safe_to_review", reasons: [] };
function wire(verdict = pass, changes = {}) {
  return new Response(
    JSON.stringify({
      id: "resp_grounding_synthetic",
      model: "gpt-5.4-2026-03-05",
      service_tier: "default",
      reasoning: { effort: "high" },
      status: "completed",
      usage: { input_tokens: 6000, output_tokens: 800 },
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: JSON.stringify(verdict) }],
        },
      ],
      ...changes,
    }),
    { status: 200, headers: { "x-request-id": "req_synthetic_qa" } },
  );
}
function setup(fetcher) {
  const f = fixture(),
    requests = [],
    diagnostics = [];
  const verifier = openAiFrameVerifier({
    apiKey: "sk-SYNTHETIC_NOT_A_REAL_KEY_1234",
    model: "gpt-5.4",
    reasoning: "high",
    fetcher: async (url, init) => {
      requests.push({ url, init });
      return fetcher(url, init);
    },
    diagnosticObserver: (v) => diagnostics.push(v),
  });
  f.deps.verifier = verifier;
  return { ...f, verifier, requests, diagnostics };
}
test("vision check uses the single existing requester, same public contract, fixed high detail/model/tier and 4096/60s bounds", async () => {
  const f = setup(() => wire()),
    before = structuredClone(f.snapshot.publicState),
    q = await f.queue();
  const result = await f.run("media.dispatch", f.dispatch(q.record));
  assert.equal(result.status, "draft");
  assert.equal(f.requests.length, 1);
  const { url, init } = f.requests[0],
    body = JSON.parse(init.body);
  assert.equal(url, "https://api.openai.com/v1/responses");
  assert.equal(body.model, "gpt-5.4");
  assert.deepEqual(body.reasoning, { effort: "high" });
  assert.equal(body.service_tier, "default");
  assert.equal(body.max_output_tokens, 4096);
  assert.equal(body.store, false);
  assert.equal(body.truncation, "disabled");
  assert.equal(init.redirect, "error");
  assert.equal(body.input.length, 1);
  assert.equal(body.input[0].content.length, 2);
  assert.equal(body.input[0].content[0].text, parseRealFrame(q.record).prompt);
  assert.equal(body.input[0].content[1].detail, "high");
  assert.match(body.input[0].content[1].image_url, /^data:image\/png;base64,/);
  assert.ok(!Object.hasOwn(body, "tools"));
  assert.ok(!Object.hasOwn(body, "background"));
  assert.doesNotMatch(
    JSON.stringify(body),
    /expectedHeadId|canonGeneration|campaign_id|sourceVersionId|DM_PRIVATE_CANARY/,
  );
  assert.deepEqual(f.snapshot.publicState, before);
  assert.equal(f.diagnostics[0].success, true);
  assert.doesNotMatch(
    JSON.stringify(f.diagnostics),
    /SYNTHETIC_NOT_A_REAL_KEY/,
  );
});
test("preflight includes image accounting and output reserve and fails before any paid request when full input exceeds ceiling", async () => {
  const f = setup(() => wire()),
    frame = f.prepare();
  const context = frameGroundingContext(frame);
  assert.equal(context.budget.outputReserve, 4096);
  assert.equal(context.budget.inputCap, 20000);
  assert.ok(context.estimatedTokens > 1844);
  assert.ok(context.estimatedTokens <= 20000);
  frame.prompt += "а".repeat(15000);
  await assert.rejects(f.queue(frame));
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.requests.length, 0);
  assert.equal(f.reserved(), 0);
});
for (const [label, changes] of [
  ["wrong model", { model: "gpt-6-sol" }],
  ["related but wrong model", { model: "gpt-5.4-mini" }],
  ["unknown model", { model: null }],
  ["wrong tier", { service_tier: "priority" }],
  ["wrong reasoning", { reasoning: { effort: "low" } }],
  ["incomplete", { status: "incomplete" }],
  ["too much input", { usage: { input_tokens: 20001, output_tokens: 100 } }],
  ["too much output", { usage: { input_tokens: 3000, output_tokens: 4097 } }],
  [
    "bad structured output",
    {
      output: [
        {
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: '{"gameplayPatch":{}}' }],
        },
      ],
    },
  ],
])
  test(`verifier ${label} fails closed with one attempt, no fallback or usable attachment`, async () => {
    const f = setup(() => wire(pass, changes)),
      before = structuredClone(f.snapshot.publicState),
      q = await f.queue(),
      dispatch = f.dispatch(q.record);
    await assert.rejects(f.run("media.dispatch", dispatch));
    assert.equal(f.requests.length, 1);
    assert.equal(
      f.snapshot.assets.some((a) => a.id === q.record.id),
      false,
    );
    await f.run("media.dispatch", dispatch);
    assert.equal(f.requests.length, 1);
    const rec = f.snapshot.documents.find((d) => d.id === q.record.id);
    await assert.rejects(f.run("media.recover", f.recovery(rec)));
    assert.equal(f.requests.length, 1);
    assert.equal(f.providerCalls(), 1);
    assert.deepEqual(f.snapshot.publicState, before);
  });
test("timeout preserves a reserved unknown QA claim and never retries or mutates gameplay", async () => {
  const f = setup(() => {
      throw new DOMException("Synthetic deadline", "TimeoutError");
    }),
    q = await f.queue(),
    before = structuredClone(f.snapshot.publicState);
  await assert.rejects(f.run("media.dispatch", f.dispatch(q.record)));
  assert.equal(f.requests.length, 1);
  assert.equal(f.diagnostics[0].abortKind, "timeout");
  const record = f.snapshot.documents.find((d) => d.id === q.record.id);
  await assert.rejects(f.run("media.recover", f.recovery(record)));
  assert.equal(f.requests.length, 1);
  assert.deepEqual(f.snapshot.publicState, before);
  assert.equal(
    parseRealFrame(f.snapshot.documents.find((d) => d.id === q.record.id))
      .status,
    "uncertain",
  );
});
for (const [status, category] of [
  ["hard_reject", "location"],
  ["hard_reject", "essential_action"],
  ["hard_reject", "major_subject"],
  ["hard_reject", "central_unsupported"],
  ["review_warning", "uncertain_quality"],
])
  test(`${status}/${category} retains rejected evidence and previous usable art; exact retry never pays again`, async () => {
    const f = setup(() => wire()),
      first = await f.queue();
    await f.run("media.dispatch", f.dispatch(first.record));
    await f.accept(first.record.id);
    const prior = structuredClone(f.snapshot.assets);
    const original = f.deps.verifier;
    f.deps.verifier = {
      ...original,
      check: async (...args) => ({
        ...(await original.check(...args)),
        verdict: {
          schemaVersion: 2,
          status,
          reasons: [
            { category, detail: "Observable synthetic grounding deviation." },
          ],
        },
      }),
    };
    const second = await f.queue(f.prepare([], first.record.id)),
      input = f.dispatch(second.record),
      result = await f.run("media.dispatch", input);
    assert.equal(result.status, status === "hard_reject" ? "failed" : "draft");
    assert.deepEqual(f.snapshot.assets, prior);
    assert.ok(f.pixels.has(second.record.id));
    assert.equal(f.requests.length, 2);
    const row = f.snapshot.documents.find((d) => d.id === second.record.id);
    assert.equal(
      parseRealFrame(row).failure,
      status === "hard_reject" ? "grounding" : null,
    );
    await f.run("media.dispatch", input);
    assert.equal(f.requests.length, 2);
    assert.equal(f.providerCalls(), 2);
    assert.equal(f.reserved(), 1200000);
  });
test("lost QA result receipt replays completed verdict without another image or QA call", async () => {
  const f = setup(() => wire()),
    q = await f.queue(),
    complete = f.authority.checkComplete;
  f.authority.checkComplete = async (...args) => {
    await complete(...args);
    throw Error("lost-check-result-response");
  };
  await assert.rejects(f.run("media.dispatch", f.dispatch(q.record)));
  f.authority.checkComplete = complete;
  const row = f.snapshot.documents.find((d) => d.id === q.record.id),
    recovery = f.recovery(row);
  await f.run("media.recover", recovery);
  await f.run("media.recover", recovery);
  assert.equal(f.requests.length, 1);
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.snapshot.assets.filter((a) => a.id === q.record.id).length, 0);
});
test("lost QA claim response never permits a second check generation", async () => {
  const f = setup(() => wire()),
    q = await f.queue(),
    claim = f.authority.checkClaim;
  f.authority.checkClaim = async (...args) => {
    await claim(...args);
    throw Error("lost-claim-response");
  };
  await assert.rejects(f.run("media.dispatch", f.dispatch(q.record)));
  assert.equal(f.requests.length, 0);
  f.authority.checkClaim = claim;
  const row = f.snapshot.documents.find((d) => d.id === q.record.id);
  await assert.rejects(f.run("media.recover", f.recovery(row)));
  assert.equal(f.requests.length, 0);
  assert.equal(f.providerCalls(), 1);
  assert.equal(
    f.snapshot.assets.some((a) => a.id === q.record.id),
    false,
  );
});
test("foreign campaign pixels or image checksum mutation never reach the provider", async () => {
  const f = setup(() => wire()),
    frame = f.prepare(),
    id = randomUUID(),
    version = randomUUID();
  const image = {
    bytes: png(),
    output: {
      storagePath: `${randomUUID()}/frames/${id}/output.png`,
      sha256: "a".repeat(64),
      bytes: 100,
    },
  };
  await assert.rejects(f.verifier.check(frame, image, id, version));
  assert.equal(f.requests.length, 0);
});
test("missing verifier fails before image dispatch, rather than attaching unchecked art", async () => {
  const f = fixture();
  delete f.deps.verifier;
  await assert.rejects(f.queue());
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.reserved(), 0);
});
