// Stage V: the paid job of one picture over a fake context — references,
// one fal request, the one softened re-submit, storage, the row's result.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { loadReferences, pictureStoragePath, runPictureJob } from "../src/lib/visual-frame/picture-job.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const cid = randomUUID();
const timeline = { timelineId: randomUUID(), epoch: 1 };
function fakeContext(rows, objects = {}) {
  const updates = [];
  const stored = {};
  const styles = {};
  const row = (id) => {
    const r = rows[id];
    if (!r) { const error = new Error("not_found"); error.code = "not_found"; throw error; }
    return r;
  };
  const ctx = {
    campaignId: cid,
    rpc: async (action, payload) => {
      if (action === "picture.private") return { ...row(payload.id) };
      if (action === "style.private") { if (!styles[payload.styleId]) { const error = new Error("not_found"); error.code = "not_found"; throw error; } return styles[payload.styleId]; }
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
    log: () => {},
  };
  return { ctx, updates, stored, styles };
}
const picture = (over = {}) => ({
  id: randomUUID(), kind: "frame", subjectKind: "turn", subjectId: randomUUID(), composition: "frame", timeline, version: 1, status: "queued", hidden: false,
  model: "fal-ai/flux-2/klein/9b", tier: "fast", trigger: "live", styleVersionId: null, width: null, height: null, costUsdMicros: 0, elapsedMs: null, error: null,
  createdAt: new Date().toISOString(), readyAt: null, prompt: "A frame of a man in his thirties with a revolver.", shot: null, storagePath: null, contentType: null, sha256: null, referenceIds: [], requestId: null, ...over,
});
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("a queued picture becomes ready: references load in order, the edit endpoint is used, cost adds the shot", async () => {
  const anchor = picture({ id: randomUUID(), kind: "anchor", subjectKind: "entity", composition: "portrait", status: "ready", storagePath: `${cid}/pictures/a.jpg` });
  const frame = picture({ referenceIds: [anchor.id, randomUUID()] });
  const { ctx, updates, stored, styles } = fakeContext({ [anchor.id]: anchor, [frame.id]: frame }, { [`${cid}/pictures/a.jpg`]: { bytes: jpeg, contentType: "image/jpeg" } });
  styles[frame.referenceIds[1]] = { referencePath: "styles/s/reference.jpg" };
  const calls = [];
  let polls = 0;
  const fetcher = async (url, init = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
    if (url === "https://queue.fal.run/fal-ai/flux-2/klein/9b/edit") return json({ request_id: "req-abcdefgh" });
    if (String(url).endsWith("/status?logs=0")) return json({ status: polls++ ? "COMPLETED" : "IN_PROGRESS" });
    if (String(url).endsWith("/requests/req-abcdefgh")) return json({ images: [{ url: "https://v3.fal.media/files/f.jpg", width: 1024, height: 576 }] });
    if (url === "https://v3.fal.media/files/f.jpg") return new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } });
    throw new Error("unexpected " + url);
  };
  const ready = await runPictureJob(ctx, frame.id, { apiKey: "k", extraCostUsdMicros: 120, fetcher, sleep: async () => {} });
  assert.equal(ready.status, "ready");
  assert.equal(ready.costUsdMicros, 17_120, "image price plus the shot's cost");
  assert.deepEqual(updates.map((row) => row.status), ["generating", "ready"]);
  assert.equal(calls[0].body.image_urls.length, 1, "the missing style reference object is skipped, the anchor is sent");
  assert.ok(stored[pictureStoragePath(cid, frame.id, "image/jpeg")]);
  assert.equal(updates[1].output.sha256, "c".repeat(64));
  assert.equal(await runPictureJob(ctx, frame.id, { apiKey: "k", fetcher }).then((row) => row.status), "ready", "a finished row is left alone");
});

test("a content refusal is re-submitted once with a softened prompt; a second refusal fails the row with the reason", async () => {
  const frame = picture({ model: "fal-ai/flux-2-pro", composition: "portrait", kind: "anchor", subjectKind: "entity" });
  const { ctx } = fakeContext({ [frame.id]: frame });
  const prompts = [];
  const refusal = () => json({ detail: "The content could not be processed because it contained material flagged by a content checker." }, 422);
  let polls = 0;
  const fetcher = async (url, init = {}) => {
    if (url === "https://queue.fal.run/fal-ai/flux-2-pro") {
      const body = JSON.parse(init.body);
      prompts.push(body.prompt);
      assert.equal(body.safety_tolerance, "4", "portraits on the pro model use the measured tolerance");
      return prompts.length === 1 ? refusal() : json({ request_id: "req-abcdefgh" });
    }
    if (String(url).endsWith("/status?logs=0")) return json({ status: polls++ ? "COMPLETED" : "IN_QUEUE" });
    if (String(url).endsWith("/requests/req-abcdefgh")) return json({ images: [{ url: "https://v3.fal.media/files/f.jpg", width: 1024, height: 1024 }] });
    if (url === "https://v3.fal.media/files/f.jpg") return new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } });
    throw new Error("unexpected " + url);
  };
  const ready = await runPictureJob(ctx, frame.id, { apiKey: "k", fetcher, sleep: async () => {} });
  assert.equal(ready.status, "ready");
  assert.equal(prompts.length, 2);
  assert.doesNotMatch(prompts[1], /thirties|revolver/);
  assert.equal(ready.costUsdMicros, 30_000);
  // A second refusal on [pro] hands the picture to the fast model once (its queue has no prompt checker); a refusal there ends the row.
  const twice = picture({ model: "fal-ai/flux-2-pro", composition: "portrait", kind: "anchor", subjectKind: "entity" });
  const second = fakeContext({ [twice.id]: twice });
  const submits = [];
  let kleinPolls = 0;
  const ladder = async (url) => {
    if (url === "https://queue.fal.run/fal-ai/flux-2-pro") { submits.push("pro"); return refusal(); }
    if (url === "https://queue.fal.run/fal-ai/flux-2/klein/9b") { submits.push("klein"); return json({ request_id: "req-klein123" }); }
    if (String(url).endsWith("/status?logs=0")) return json({ status: kleinPolls++ ? "COMPLETED" : "IN_QUEUE" });
    if (String(url).endsWith("/requests/req-klein123")) return json({ images: [{ url: "https://v3.fal.media/files/k.jpg", width: 1024, height: 1024 }] });
    if (url === "https://v3.fal.media/files/k.jpg") return new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } });
    throw new Error("unexpected " + url);
  };
  const drawn = await runPictureJob(second.ctx, twice.id, { apiKey: "k", fetcher: ladder, sleep: async () => {} });
  assert.equal(drawn.status, "ready");
  assert.deepEqual(submits, ["pro", "pro", "klein"], "two pro attempts, then the fast model, nothing more");
  assert.equal(second.updates.at(-1).model, "fal-ai/flux-2/klein/9b", "the row records the model that drew it");
  assert.equal(drawn.costUsdMicros, 17_000);
  const thrice = picture({ model: "fal-ai/flux-2-pro", composition: "portrait", kind: "anchor", subjectKind: "entity" });
  const third = fakeContext({ [thrice.id]: thrice });
  const failed = await runPictureJob(third.ctx, thrice.id, { apiKey: "k", fetcher: async () => refusal(), sleep: async () => {} });
  assert.equal(failed.status, "failed");
  assert.match(failed.error, /^validation: HTTP 422/);
  assert.equal(third.updates.length, 2, "generating, then failed: no fourth attempt");
  assert.equal(failed.costUsdMicros, 0);
  const kleinOnly = picture({ model: "fal-ai/flux-2/klein/9b" });
  const fourth = fakeContext({ [kleinOnly.id]: kleinOnly });
  const kleinFailed = await runPictureJob(fourth.ctx, kleinOnly.id, { apiKey: "k", fetcher: async () => refusal(), sleep: async () => {} });
  assert.equal(kleinFailed.status, "failed", "the fast model has no further fallback");
  const unconfigured = picture();
  const fifth = fakeContext({ [unconfigured.id]: unconfigured });
  assert.equal((await runPictureJob(fifth.ctx, unconfigured.id, { apiKey: "" })).error, "not_configured");
});

test("references: ready pictures and style references by id, missing ones skipped", async () => {
  const ready = picture({ status: "ready", storagePath: `${cid}/pictures/r.jpg` });
  const queued = picture();
  const { ctx, styles } = fakeContext({ [ready.id]: ready, [queued.id]: queued }, { [`${cid}/pictures/r.jpg`]: { bytes: jpeg, contentType: "image/jpeg" }, "styles/x/reference.png": { bytes: jpeg, contentType: "image/jpeg" } });
  const styleId = randomUUID();
  styles[styleId] = { referencePath: "styles/x/reference.png" };
  const refs = await loadReferences(ctx, [styleId, ready.id, queued.id, randomUUID()].filter(Boolean));
  assert.equal(refs.length, 2);
});
