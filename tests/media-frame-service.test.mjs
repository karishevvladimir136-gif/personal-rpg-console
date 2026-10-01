import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture } from "./media-frame-fixture.mjs";
import {
  FRAME_RECOVERY_AFTER_MS,
  frameRecoveryOverdue,
  parseRealFrame,
  realFrameDocumentMutation,
} from "../src/lib/visual-frame/real-frame.ts";
import { MediaFrameError } from "../src/lib/server/media/orchestration.ts";
function job(f, id) {
  return f.snapshot.documents.find((r) => r.id === id);
}
function cancel(f, record) {
  const frame = parseRealFrame(record);
  return {
    ...realFrameDocumentMutation(
      f.snapshot,
      { ...frame, status: "cancelled", failure: null },
      record,
    ),
    requestId: randomUUID(),
  };
}
test("explicit queue and one server claim produces a private draft; explicit approval creates one immutable public asset, no gameplay/world/Lab source mutation", async () => {
  const f = fixture(),
    before = structuredClone(f.snapshot),
    proof = structuredClone(f.proof),
    q = await f.queue(),
    input = f.dispatch(q.record);
  assert.equal(f.providerCalls(), 0);
  const result = await f.run("media.dispatch", input);
  assert.equal(result.status, "draft");
  assert.equal(
    f.snapshot.assets.some((a) => a.id === q.record.id),
    false,
  );
  await f.accept(q.record.id);
  assert.equal(result.dispatched, true);
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.reserved(), 600000);
  assert.equal(parseRealFrame(job(f, q.record.id)).resultAssetId, q.record.id);
  assert.equal(f.snapshot.assets.at(-1).id, q.record.id);
  for (const key of [
    "publicState",
    "entities",
    "items",
    "locations",
    "scenes",
    "storages",
    "quests",
    "settings",
  ])
    assert.deepEqual(f.snapshot[key], before[key]);
  assert.deepEqual(f.proof, proof);
});
test("duplicate/lost queue response replays original receipt before corrected mutable sources and never dispatches", async () => {
  const f = fixture(),
    q = await f.queue();
  f.proof.canonGeneration++;
  f.calls.length = 0;
  const retry = await f.run("media.save", q.input);
  assert.equal(retry.result.id, q.record.id);
  assert.deepEqual(f.calls, ["authorize", "receipt"]);
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.writes.length, 1);
});
test("lost claim response holds the original reservation without an automatic paid redispatch", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    claim = f.authority.claim;
  f.authority.claim = async (...args) => {
    await claim(...args);
    throw new Error("lost-response");
  };
  await assert.rejects(f.run("media.dispatch", input));
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.reserved(), 600000);
  f.calls.length = 0;
  const retry = await f.run("media.dispatch", input);
  assert.equal(retry.dispatched, false);
  assert.deepEqual(f.calls, ["authorize", "receipt"]);
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.reserved(), 600000);
});
test("completed dispatch receipt replay cannot generate a second provider image", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  await f.run("media.dispatch", input);
  await f.accept(q.record.id);
  f.proof.expectedHeadId = randomUUID();
  f.calls.length = 0;
  await f.run("media.dispatch", input);
  assert.deepEqual(f.calls, ["authorize", "receipt"]);
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.snapshot.assets.filter((a) => a.id === q.record.id).length, 1);
});
test("retained completion recovers a committed lost response after scene/source correction before store/load/preflight", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    complete = f.authority.draft;
  let retained;
  f.authority.draft = async (...args) => {
    retained = structuredClone(args[0]);
    await complete(...args);
    throw new Error("lost-completion");
  };
  await assert.rejects(f.run("media.dispatch", input));
  f.proof.canonGeneration++;
  f.snapshot.scenes.find(
    (s) => s.id === f.snapshot.publicState.current_scene_id,
  ).revision++;
  f.calls.length = 0;
  const recovered = await f.run("media.save", retained);
  assert.equal(recovered.status, "draft");
  assert.deepEqual(f.calls, ["authorize", "receipt"]);
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.snapshot.assets.filter((a) => a.id === q.record.id).length, 0);
});
test("lost upload response recovers only previously stored bytes and exact deterministic attachment, never a new provider call", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    put = f.store.put;
  f.store.put = async (...args) => {
    await put(...args);
    throw new Error("lost-upload");
  };
  await assert.rejects(f.run("media.dispatch", input));
  const retained = f.recovery(job(f, q.record.id));
  await f.run("media.recover", retained);
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.reserved(), 600000);
  assert.equal(
    f.snapshot.assets.some((a) => a.id === q.record.id),
    false,
  );
  assert.equal(parseRealFrame(job(f, q.record.id)).status, "draft");
  f.calls.length = 0;
  await f.run("media.recover", retained);
  assert.deepEqual(f.calls, ["authorize", "recoveryReceipt", "receipt"]);
});
test("fresh missing pixels remain generating; overdue exact recovery becomes uncertain without a second paid image", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    claim = f.authority.claim;
  f.authority.claim = async (...args) => {
    await claim(...args);
    throw Error("lost-claim");
  };
  await assert.rejects(f.run("media.dispatch", input));
  const record = job(f, q.record.id),
    recovery = f.recovery(record),
    before = structuredClone(f.snapshot.publicState);
  assert.equal(frameRecoveryOverdue(record), false);
  await assert.rejects(f.run("media.recover", recovery));
  assert.equal(parseRealFrame(job(f, record.id)).status, "generating");
  record.updated_at = new Date(Date.now() - FRAME_RECOVERY_AFTER_MS - 1000).toISOString();
  assert.equal(frameRecoveryOverdue(record), true);
  const result = await f.run("media.recover", recovery);
  assert.equal(result.status, "uncertain");
  assert.equal(parseRealFrame(job(f, record.id)).status, "uncertain");
  assert.equal(f.providerCalls(), 0);
  assert.equal(f.reserved(), 600000);
  assert.deepEqual(f.snapshot.publicState, before);
  const writes = f.writes.length;
  await assert.rejects(f.run("media.recover", recovery));
  assert.equal(f.writes.length, writes);
  assert.equal(f.providerCalls(), 0);
});
test("overdue saved pixels recover to owner draft after lost response with one generation", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    originalPut = f.store.put;
  f.store.put = async (...args) => {
    await originalPut(...args);
    throw Error("lost-upload-response");
  };
  await assert.rejects(f.run("media.dispatch", input));
  const record = job(f, q.record.id);
  record.updated_at = new Date(Date.now() - FRAME_RECOVERY_AFTER_MS - 1000).toISOString();
  const recovered = await f.run("media.recover", f.recovery(record));
  assert.equal(recovered.status, "draft");
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.reserved(), 600000);
  assert.equal(parseRealFrame(job(f, record.id)).status, "draft");
});
test("lost grounding response keeps immutable pixels and never repeats the claimed paid check", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record),
    originalCheck = f.verifier.check;
  f.verifier.check = async (...args) => {
    await originalCheck(...args);
    throw Error("lost-check-response");
  };
  await assert.rejects(f.run("media.dispatch", input));
  const record = job(f, q.record.id);
  assert.equal(parseRealFrame(record).status, "generating");
  record.updated_at = new Date(Date.now() - FRAME_RECOVERY_AFTER_MS - 1000).toISOString();
  const checked = await f.run("media.recover", f.recovery(record));
  assert.equal(checked.status, "uncertain");
  assert.equal(parseRealFrame(job(f, record.id)).status, "uncertain");
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.verifierCalls(), 1);
  assert.equal(f.reserved(), 600000);
});
test("uncommitted stored-result recovery after genuine correction conflicts, preserving prior art", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  f.authority.draft = async () => {
    throw new Error("uncommitted");
  };
  await assert.rejects(f.run("media.dispatch", input));
  const retained = f.recovery(job(f, q.record.id));
  const prior = structuredClone(f.snapshot.assets);
  f.proof.canonGeneration++;
  await assert.rejects(
    f.run("media.recover", retained),
    (e) => e.code === "conflict",
  );
  assert.deepEqual(f.snapshot.assets, prior);
  assert.equal(f.providerCalls(), 1);
});
for (const mutate of [
  (f) => (f.proof.expectedHeadId = randomUUID()),
  (f) => f.proof.canonGeneration++,
  (f) => f.snapshot.timeline.epoch++,
  (f) => f.snapshot.publicState.revision++,
])
  test("stale head/source/timeline claim is rejected before budget reservation or provider dispatch", async () => {
    const f = fixture(),
      q = await f.queue(),
      input = f.dispatch(q.record);
    mutate(f);
    await assert.rejects(
      f.run("media.dispatch", input),
      (e) => e.code === "conflict",
    );
    assert.equal(f.reserved(), 0);
    assert.equal(f.providerCalls(), 0);
  });
test("another concurrent claim cannot reserve or dispatch a second paid request for the same queued job", async () => {
  const f = fixture(),
    q = await f.queue(),
    a = f.dispatch(q.record),
    b = f.dispatch(q.record);
  await f.run("media.dispatch", a);
  await assert.rejects(
    f.run("media.dispatch", b),
    (e) => e.code === "conflict",
  );
  assert.equal(f.providerCalls(), 1);
  assert.equal(f.reserved(), 600000);
});
for (const definite of [false, true])
  test("provider failure remains nonblocking and never creates artwork or automatically retries", async () => {
    const f = fixture(),
      q = await f.queue(),
      input = f.dispatch(q.record),
      before = structuredClone(f.snapshot.publicState);
    f.provider.generate = async () => {
      throw definite
        ? new MediaFrameError("validation")
        : new Error("unknown-outcome");
    };
    await assert.rejects(f.run("media.dispatch", input));
    assert.equal(
      parseRealFrame(job(f, q.record.id)).status,
      definite ? "failed" : "uncertain",
    );
    assert.deepEqual(f.snapshot.publicState, before);
    assert.equal(
      f.snapshot.assets.some((a) => a.id === q.record.id),
      false,
    );
    const count = f.writes.length;
    await f.run("media.dispatch", input);
    assert.equal(f.writes.length, count);
  });
test("cancel before dispatch has no provider cost, and late completion after cancellation cannot attach", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  await f.run("media.save", cancel(f, q.record));
  await assert.rejects(
    f.run("media.dispatch", input),
    (e) => e.code === "conflict",
  );
  assert.equal(f.reserved(), 0);
  const g = fixture(),
    next = await g.queue(),
    claim = g.authority.claim;
  g.authority.claim = async (...args) => {
    const result = await claim(...args);
    const record = job(g, next.record.id);
    await g.run("media.save", cancel(g, record));
    return result;
  };
  await assert.rejects(
    g.run("media.dispatch", g.dispatch(next.record)),
    (e) => e.code === "conflict",
  );
  assert.equal(g.providerCalls(), 0);
  assert.equal(
    g.snapshot.assets.some((a) => a.id === next.record.id),
    false,
  );
});
test("source correction during provider execution rejects late result attachment without changing gameplay", async () => {
  const f = fixture(),
    q = await f.queue(),
    generate = f.provider.generate;
  f.provider.generate = async (...args) => {
    const data = await generate(...args);
    f.proof.canonGeneration++;
    return data;
  };
  await assert.rejects(
    f.run("media.dispatch", f.dispatch(q.record)),
    (e) => e.code === "conflict",
  );
  assert.equal(f.providerCalls(), 1);
  assert.equal(
    f.snapshot.assets.some((a) => a.id === q.record.id),
    false,
  );
  assert.ok(f.pixels.has(q.record.id));
});
test("explicit regeneration after terminal job gets new lineage and retains prior usable asset", async () => {
  const f = fixture(),
    q = await f.queue();
  await f.run("media.dispatch", f.dispatch(q.record));
  await f.accept(q.record.id);
  const previous = structuredClone(f.snapshot.assets.at(-1));
  const retry = await f.queue(f.prepare([], q.record.id));
  f.provider.generate = async () => {
    throw new Error("uncertain");
  };
  await assert.rejects(f.run("media.dispatch", f.dispatch(retry.record)));
  assert.deepEqual(
    f.snapshot.assets.find((a) => a.id === previous.id),
    previous,
  );
  assert.equal(parseRealFrame(job(f, retry.record.id)).retryOf, q.record.id);
  assert.equal(parseRealFrame(job(f, q.record.id)).status, "completed");
});
test("disabled policy and malformed/unapproved model cannot dispatch or reserve", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  f.deps.policy = null;
  await assert.rejects(
    f.run("media.dispatch", input),
    (e) => e.code === "not_configured",
  );
  assert.equal(f.reserved(), 0);
  const bad = structuredClone(input);
  const frame = parseRealFrame(bad.payload);
  frame.model = "arbitrary-provider";
  bad.payload.body = "RPG_VISUAL_FRAME_V0\n" + JSON.stringify(frame);
  await assert.rejects(
    f.run("media.dispatch", bad),
    (e) => e.code === "validation",
  );
  assert.equal(f.providerCalls(), 0);
});
test("unauthorized campaign never reaches receipt, source, provider or storage", async () => {
  const f = fixture(),
    q = await f.queue(),
    input = f.dispatch(q.record);
  input.campaignId = randomUUID();
  f.calls.length = 0;
  await assert.rejects(
    f.run("media.dispatch", input),
    (e) => e.code === "forbidden",
  );
  assert.deepEqual(f.calls, ["authorize"]);
});
