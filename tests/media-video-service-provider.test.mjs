import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fixture as frameFixture, png } from "./media-frame-fixture.mjs";
import {
  buildSceneVideo,
  parseSceneVideo,
  videoDocumentMutation,
  videoIsCurrent,
  VIDEO_MODEL,
  VIDEO_RESERVATION_USD_MICROS,
  safeVideoAsset,
} from "../src/lib/scene-video/model.ts";
const hook = registerHooks({
  resolve(s, c, n) {
    return s === "server-only"
      ? { url: "data:text/javascript,export%20{}", shortCircuit: true }
      : n(s, c);
  },
});
const { falVideoProvider, checkedMp4, storedVideo, permittedVideoUrl } =
  await import("../src/lib/server/media/video-provider.ts");
const { executeSceneVideo } =
  await import("../src/lib/server/media/video-orchestration.ts");
hook.deregister();
function mp4() {
  const box = (name, size) => {
    const b = Buffer.alloc(size);
    b.writeUInt32BE(size);
    b.write(name, 4);
    return b;
  };
  const f = box("ftyp", 16);
  f.write("isom", 8);
  return new Uint8Array(Buffer.concat([f, box("moov", 8), box("mdat", 16)]));
}
async function fixture() {
  const f = frameFixture(),
    q = await f.queue();
  await f.run("media.dispatch", f.dispatch(q.record));
  await f.accept(q.record.id);
  const snapshot = f.snapshot,
    receipts = new Map(),
    stored = new Map();
  let submits = 0,
    polls = 0,
    reserved = 0,
    requestId = null;
  const calls = [],
    cid = snapshot.campaign.id;
  function apply(m) {
    const old = snapshot.documents.find((d) => d.id === m.payload.id);
    assert.equal(m.expectedRevision, old?.revision ?? 0);
    const row = {
      ...m.payload,
      id: old?.id ?? randomUUID(),
      campaign_id: cid,
      revision: m.expectedRevision + 1,
      current_version_id: randomUUID(),
      updated_at: new Date().toISOString(),
    };
    if (old) snapshot.documents.splice(snapshot.documents.indexOf(old), 1, row);
    else snapshot.documents.push(row);
    const result = {
      id: row.id,
      campaign_id: cid,
      revision: row.revision,
      timeline: snapshot.timeline,
    };
    receipts.set(m.requestId, { m: structuredClone(m), result });
    return result;
  }
  const authority = {
    authorize: async (id) => {
      calls.push("authorize");
      assert.equal(id, cid);
    },
    snapshot: async () => snapshot,
    source: async () => f.proof,
    receipt: async (m) => {
      calls.push("receipt");
      const r = receipts.get(m.requestId);
      if (!r) return null;
      assert.deepEqual(m, r.m);
      return r.result;
    },
    lifecycle: async (m) => apply(m),
    claim: async (m) => {
      assert(videoIsCurrent(snapshot, parseSceneVideo(m.payload), f.proof));
      reserved += VIDEO_RESERVATION_USD_MICROS;
      return { result: apply(m), claimed: true };
    },
    submission: async (_cid, _jid, id) => {
      if (id) requestId = id;
      return requestId;
    },
    complete: async (m, a) => {
      assert(videoIsCurrent(snapshot, parseSceneVideo(m.payload), f.proof));
      const result = apply(m);
      snapshot.assets.push({
        ...a.payload,
        id: a.payload.id,
        campaign_id: cid,
        revision: 1,
        current_version_id: randomUUID(),
        updated_at: new Date().toISOString(),
      });
      return result;
    },
  };
  const deps = {
    authority,
    policy: {
      model: VIDEO_MODEL,
      budgetId: randomUUID(),
      reservationUsdMicros: VIDEO_RESERVATION_USD_MICROS,
    },
    provider: {
      submit: async () => {
        submits++;
        return randomUUID();
      },
      poll: async (r, c, j) => {
        polls++;
        return { status: "ready", pixels: storedVideo(c, j, mp4(), r) };
      },
    },
    store: {
      frame: async (c, id) => f.store.read(c, id),
      read: async (c, j) => stored.get(j) ?? null,
      put: async (c, j, p) => {
        assert(!stored.has(j));
        stored.set(j, p);
      },
    },
  };
  const run = (v) => executeSceneVideo(v, deps),
    row = () => snapshot.documents.find((d) => d.id === jobId);
  let jobId;
  async function queue() {
    const v = buildSceneVideo(snapshot, q.record.id, f.proof),
      input = {
        ...videoDocumentMutation(snapshot, v),
        requestId: randomUUID(),
      };
    const result = await run({ action: "video.save", input });
    jobId = result.result.id;
    return { input, result };
  }
  function dispatch() {
    const v = parseSceneVideo(row()),
      id = randomUUID();
    return {
      ...videoDocumentMutation(
        snapshot,
        {
          ...v,
          status: "generating",
          dispatch: {
            requestId: id,
            reservationUsdMicros: VIDEO_RESERVATION_USD_MICROS,
          },
        },
        row(),
      ),
      requestId: id,
    };
  }
  const poll = () => run({ action: "video.poll", campaignId: cid, jobId });
  return {
    f,
    snapshot,
    deps,
    receipts,
    stored,
    calls,
    run,
    queue,
    dispatch,
    poll,
    row,
    submits: () => submits,
    polls: () => polls,
    reserved: () => reserved,
  };
}
test("accepted FRAME → VIDEO queue/submit/same-ID recover → one asset; exact retry never generates again", async () => {
  const h = await fixture(),
    before = structuredClone(h.snapshot),
    input = (await h.queue(), h.dispatch());
  await h.run({ action: "video.dispatch", input });
  const result = await h.poll();
  assert.equal(result.status, "ready");
  assert(safeVideoAsset(h.snapshot, h.snapshot.assets.at(-1)));
  await h.poll();
  h.f.proof.canonGeneration++;
  assert.deepEqual(
    (await h.run({ action: "video.dispatch", input })).result,
    h.receipts.get(input.requestId).result,
  );
  assert.equal(h.submits(), 1);
  assert.equal(h.polls(), 1);
  assert.equal(h.reserved(), 7_000_000);
  assert.equal(h.snapshot.assets.length, before.assets.length + 1);
  for (const k of [
    "publicState",
    "items",
    "storages",
    "entities",
    "locations",
    "scenes",
    "settings",
    "quests",
    "timeline",
  ])
    assert.deepEqual(h.snapshot[k], before[k]);
});
test("lost submission response holds one reservation and never resubmits on exact retry or poll", async () => {
  const h = await fixture();
  await h.queue();
  const input = h.dispatch();
  let calls = 0;
  h.deps.provider.submit = async () => {
    calls++;
    throw Error("response lost");
  };
  const r = await h.run({ action: "video.dispatch", input });
  assert.equal(r.status, "uncertain");
  assert.equal((await h.poll()).status, "uncertain");
  await h.run({ action: "video.dispatch", input });
  assert.equal(calls, 1);
  assert.equal(h.reserved(), 7_000_000);
  assert.equal(h.snapshot.assets.length, 1);
});
test("lost durable provider-ID receipt recovers known same ID and never resubmits", async () => {
  const h = await fixture();
  await h.queue();
  const submission = h.deps.authority.submission;
  let lost = true;
  h.deps.authority.submission = async (...a) => {
    const result = await submission(...a);
    if (a[2] && lost) {
      lost = false;
      throw Error("lost audit response");
    }
    return result;
  };
  const input = h.dispatch();
  await assert.rejects(h.run({ action: "video.dispatch", input }));
  await h.run({ action: "video.dispatch", input });
  assert.equal((await h.poll()).status, "ready");
  assert.equal(h.submits(), 1);
});
test("lost completion response leaves stored MP4 and exact ready checkpoint; next poll has no new provider work", async () => {
  const h = await fixture();
  await h.queue();
  await h.run({ action: "video.dispatch", input: h.dispatch() });
  const complete = h.deps.authority.complete;
  h.deps.authority.complete = async (...args) => {
    await complete(...args);
    throw Error("lost completion");
  };
  await assert.rejects(h.poll());
  assert.equal((await h.poll()).status, "ready");
  assert.equal(h.polls(), 1);
  assert.equal(h.snapshot.assets.length, 2);
});
test("failure before atomic attachment recovers stored bytes without another provider call", async () => {
  const h = await fixture();
  await h.queue();
  await h.run({ action: "video.dispatch", input: h.dispatch() });
  const complete = h.deps.authority.complete;
  h.deps.authority.complete = async () => {
    throw Error("interrupted before transaction");
  };
  await assert.rejects(h.poll());
  assert.equal(h.snapshot.assets.length, 1);
  h.deps.authority.complete = complete;
  assert.equal((await h.poll()).status, "ready");
  assert.equal(h.polls(), 1);
});
test("stale source correction rejects status work before network or result attachment", async () => {
  const h = await fixture();
  await h.queue();
  await h.run({ action: "video.dispatch", input: h.dispatch() });
  h.f.proof.canonGeneration++;
  await assert.rejects(h.poll(), (e) => e.code === "conflict");
  assert.equal(h.polls(), 0);
  assert.equal(h.snapshot.assets.length, 1);
});
test("cancellation while a poll is in flight rejects its late asset, preserving prior art", async () => {
  const h = await fixture();
  await h.queue();
  await h.run({ action: "video.dispatch", input: h.dispatch() });
  const poll = h.deps.provider.poll;
  h.deps.provider.poll = async (...args) => {
    const p = await poll(...args),
      r = h.row(),
      v = parseSceneVideo(r);
    await h.run({
      action: "video.save",
      input: {
        ...videoDocumentMutation(
          h.snapshot,
          { ...v, status: "cancelled", failure: null },
          r,
        ),
        requestId: randomUUID(),
      },
    });
    return p;
  };
  await assert.rejects(h.poll(), (e) => e.code === "conflict");
  assert.equal(parseSceneVideo(h.row()).status, "cancelled");
  assert.equal(h.snapshot.assets.length, 1);
  assert.equal((await h.poll()).status, "cancelled");
});
test("definite provider failure has no partial asset and exact dispatch replay does not retry", async () => {
  const h = await fixture();
  await h.queue();
  const input = h.dispatch();
  h.deps.provider.poll = async () => ({ status: "failed" });
  await h.run({ action: "video.dispatch", input });
  assert.equal((await h.poll()).status, "failed");
  await h.run({ action: "video.dispatch", input });
  assert.equal(h.submits(), 1);
  assert.equal(h.snapshot.assets.length, 1);
});
test("server-only fal submit uses exact pinned source and parameters, one POST, and disables remote retry", async () => {
  const h = await fixture();
  await h.queue();
  const v = parseSceneVideo(h.dispatch().payload),
    calls = [],
    id = randomUUID();
  const provider = falVideoProvider("SYNTHETIC_NOT_A_KEY", async (...a) => {
    calls.push(a);
    return Response.json({ request_id: id, status: "IN_QUEUE" });
  });
  assert.equal(await provider.submit(v, png()), id);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "https://queue.fal.run/" + VIDEO_MODEL);
  const init = calls[0][1],
    body = JSON.parse(init.body);
  assert.equal(init.headers["X-Fal-No-Retry"], "1");
  assert.equal(init.redirect, "error");
  assert.deepEqual(
    { ...body, image_url: "redacted" },
    {
      image_url: "redacted",
      prompt: v.prompt,
      resolution: "720p",
      duration: "10",
      aspect_ratio: "auto",
      generate_audio: true,
      bitrate_mode: "standard",
      codec: "H264",
    },
  );
  assert(body.image_url.startsWith("data:image/png;base64,"));
});
test("provider poll retrieves only same recorded ID and downloads permitted MP4 without credentials", async () => {
  const id = randomUUID(),
    cid = randomUUID(),
    jid = randomUUID(),
    calls = [],
    bytes = mp4();
  const p = falVideoProvider("SYNTHETIC_NOT_A_KEY", async (url, init) => {
    calls.push([url, init]);
    if (url.endsWith("/status?logs=0"))
      return Response.json({ request_id: id, status: "COMPLETED" });
    if (url.endsWith("/requests/" + id))
      return Response.json({
        model: VIDEO_MODEL,
        video: {
          url: "https://v3.fal.media/files/abc/output.mp4",
          content_type: "video/mp4",
          file_size: bytes.length,
        },
      });
    return new Response(bytes, { headers: { "content-type": "video/mp4" } });
  });
  const r = await p.poll(id, cid, jid);
  assert.equal(r.status, "ready");
  assert.equal(r.pixels.output.actualModel, VIDEO_MODEL);
  assert.equal(calls.length, 3);
  assert(!("headers" in calls[2][1]));
  assert.equal(calls[2][1].redirect, "error");
  assert(
    calls
      .slice(0, 2)
      .every((c) =>
        c[0].startsWith(
          "https://queue.fal.run/bytedance/seedance-2.5/requests/" + id,
        ),
      ),
  );
});
for (const status of ["IN_QUEUE", "IN_PROGRESS"])
  test(
    "pending " +
      status +
      " performs one same-ID read and no generation/download",
    async () => {
      let n = 0;
      const id = randomUUID(),
        p = falVideoProvider("synthetic", async () => {
          n++;
          return Response.json({ request_id: id, status });
        });
      const r = await p.poll(id, randomUUID(), randomUUID());
      assert.equal(r.status, status === "IN_QUEUE" ? "queued" : "generating");
      assert.equal(n, 1);
    },
  );
for (const response of [
  () => new Response("bad json"),
  () => Response.json({ request_id: randomUUID(), model: "wrong" }),
  () => new Response("denied", { status: 401 }),
  () => new Response("overloaded", { status: 503 }),
])
  test("bad provider response fails closed with one network attempt and no fallback", async () => {
    const h = await fixture();
    await h.queue();
    let calls = 0;
    const p = falVideoProvider("synthetic", async () => {
      calls++;
      return response();
    });
    await assert.rejects(
      p.submit(parseSceneVideo(h.dispatch().payload), png()),
    );
    assert.equal(calls, 1);
  });
test("native fetch failure never retries and returns only safe unavailable category", async () => {
  const h = await fixture();
  await h.queue();
  let calls = 0;
  await assert.rejects(
    falVideoProvider("synthetic", async () => {
      calls++;
      throw Error("secret provider diagnostic");
    }).submit(parseSceneVideo(h.dispatch().payload), png()),
    (e) => e.code === "unavailable" && !e.message.includes("secret"),
  );
  assert.equal(calls, 1);
});
for (const url of [
  "http://v3.fal.media/files/a.mp4",
  "https://evil.invalid/files/a.mp4",
  "https://user:pass@v3.fal.media/files/a.mp4",
  "https://v3.fal.media/files/a.mp4?secret=x",
  "https://v3.fal.media:8443/files/a.mp4",
  "https://v3.fal.media/files/a.png",
  "https://localhost/files/a.mp4",
])
  test("download URL is rejected: " + url, () =>
    assert.equal(permittedVideoUrl(url), false),
  );
test("malformed/oversized/non-MP4 container cannot become a usable asset", () => {
  for (const b of [
    new Uint8Array(31),
    new Uint8Array(50),
    new Uint8Array(60_000_001),
  ])
    assert.throws(() => checkedMp4(b));
  assert.equal(checkedMp4(mp4()).length, 64);
});
test("ordinary Game/Gallery wires VIDEO and never exposes malformed reserved media provenance as prose", () => {
  const s = readFileSync(
    new URL("../src/components/persistent-game.tsx", import.meta.url),
    "utf8",
  );
  assert.match(s, /<CurrentSceneVideo transport=\{videoTransport\}/);
  assert.match(s, /safeVideoAsset\(data, row\)/);
  assert.match(s, /row.description.startsWith\(VIDEO_ASSET_PREFIX\)/);
  assert.match(s, /RPG_OWNER_FRAME_ASSET_V1/);
  assert.match(s, /<SceneVideoHistory transport=\{videoTransport\}/);
});
