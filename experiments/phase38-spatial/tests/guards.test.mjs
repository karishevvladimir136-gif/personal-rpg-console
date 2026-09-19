import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Ledger, initialize } from "../src/ledger.ts";
import { protocol, hash, apiUrl, assetUrl } from "../src/protocol.ts";
import {
  runNext,
  approve,
  bill,
  nextJob,
  responseByteLimit,
} from "../src/runner.ts";
import { authorization } from "../src/cli.ts";
import { httpTransport } from "../src/transport.ts";
import { inspectAsset } from "../src/outputs.ts";
import {
  COMMIT,
  credentials,
  clock,
  fakeProvider,
  reviewFor,
  asBytes,
  png,
  glb,
  spz,
} from "./fixtures.mjs";
// No test may use an implicit live network transport.
globalThis.fetch = async () => {
  throw Error("OFFLINE_TEST_NETWORK_FORBIDDEN");
};
function setup(t, mutate) {
  const parent = mkdtempSync(join(tmpdir(), "phase38-mock-")),
    root = join(parent, "run");
  initialize(root, COMMIT);
  const ledger = new Ledger(root, COMMIT),
    time = clock(),
    fake = fakeProvider(time, mutate);
  const state = { root, ledger, time, ...fake };
  t.after(() => {
    state.ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  return state;
}
function accept(s, id) {
  if (!s.ledger.rows("billing", id).length)
    bill(
      s.ledger,
      id,
      `op-${id}`,
      protocol.jobs.find((j) => j.id === id).maxPriceMicroUSD,
      "dashboard",
      hash("synthetic-receipt-" + id),
    );
  approve(s.ledger, id, reviewFor(s.ledger, id));
}
async function advance(s, count) {
  for (let i = 0; i < count; i++) {
    const r = await runNext(s.ledger, s.transport, credentials, s.time);
    assert.notEqual(r.status, "STOPPED");
    accept(s, r.jobId);
  }
}
function allBytes(root) {
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((x) =>
      x.isDirectory() ? walk(join(d, x.name)) : [readFileSync(join(d, x.name))],
    );
  return Buffer.concat(walk(root));
}
test("frozen four IDs, prompts, endpoint/model pairs, options and integer costs", () => {
  assert.deepEqual(
    protocol.jobs.map((j) => j.id),
    [
      "spatial-room-1",
      "spatial-courtyard-1",
      "spatial-fal-world-1",
      "spatial-chest-1",
    ],
  );
  assert.equal(
    protocol.jobs.reduce((n, j) => n + j.reserveMicroUSD, 0),
    4750000,
  );
  assert.equal(
    protocol.jobs.reduce((n, j) => n + j.maxPriceMicroUSD, 0),
    4553000,
  );
  const doc = readFileSync(
    new URL("../../../PHASE38B_LIVE_PROTOCOL.md", import.meta.url),
    "utf8",
  );
  for (const j of protocol.jobs)
    if (j.input.world_prompt)
      assert.ok(doc.includes(j.input.world_prompt.text_prompt));
    else if (j.input.prompt) assert.ok(doc.includes(j.input.prompt));
  assert.deepEqual(protocol.jobs[3].input, {
    prompt: protocol.jobs[3].input.prompt,
    generate_type: "Normal",
    enable_pbr: true,
  });
  assert.ok(!("face_count" in protocol.jobs[3].input));
  assert.equal(protocol.limits.automaticRetries, 0);
  assert.equal(protocol.limits.fallbacks, 0);
});
test("four successful synthetic jobs; fifth rejected; cumulative reservation survives reopen", async (t) => {
  const s = setup(t);
  await advance(s, 4);
  assert.equal(s.requests.filter((r) => r.method === "POST").length, 4);
  assert.equal(s.ledger.summary().reservedMicroUSD, 4750000);
  assert.equal(s.ledger.summary().knownReportedMicroUSD, 4553000);
  s.ledger.close();
  s.ledger = new Ledger(s.root, COMMIT);
  t.after(() => s.ledger.close());
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /four_call_maximum/,
  );
  assert.equal(s.requests.filter((r) => r.method === "POST").length, 4);
});
test("next generation requires explicit output review even when billing is known", async (t) => {
  const s = setup(t);
  await runNext(s.ledger, s.transport, credentials, s.time);
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /not_approved/,
  );
  assert.equal(s.requests.filter((r) => r.method === "POST").length, 1);
});
test("aggregate budget check rejects insufficient remaining reservation", (t) => {
  const s = setup(t);
  s.ledger.summary = () => ({ reservedMicroUSD: 3450001 });
  assert.throws(() => nextJob(s.ledger), /reservation_ceiling/);
  assert.equal(s.requests.length, 0);
});
test("reservation cannot change amount", (t) => {
  const s = setup(t);
  assert.throws(
    () =>
      s.ledger.append("reserve", {
        jobId: "spatial-room-1",
        microUSD: 4750001,
      }),
    /reservation_mismatch/,
  );
});
test("duplicate reservation rejected", (t) => {
  const s = setup(t);
  const r = { jobId: "spatial-room-1", microUSD: 1300000 };
  s.ledger.append("reserve", r);
  assert.throws(() => s.ledger.append("reserve", r), /duplicate_submission/);
});
test("out-of-order job rejected", (t) => {
  const s = setup(t);
  assert.throws(
    () =>
      s.ledger.append("reserve", {
        jobId: "spatial-chest-1",
        microUSD: 600000,
      }),
    /job_order/,
  );
});
test("second process cannot take ledger lock", (t) => {
  const s = setup(t);
  const moduleURL = new URL("../src/ledger.ts", import.meta.url).href;
  const child = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import {Ledger} from ${JSON.stringify(moduleURL)};new Ledger(${JSON.stringify(s.root)},${JSON.stringify(COMMIT)});`,
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(child.status, 0);
  assert.match(child.stderr, /EEXIST/);
});
test("duplicate simultaneous runNext cannot submit twice", async (t) => {
  const s = setup(t);
  const first = runNext(s.ledger, s.transport, credentials, s.time);
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /not_approved/,
  );
  await first;
  assert.equal(s.requests.filter((r) => r.method === "POST").length, 1);
});
for (const stage of ["submit", "poll", "world", "result", "download"]) {
  test(`HTTP failure at ${stage} stops before next generation with zero retries`, async (t) => {
    let enabled = false;
    const s = setup(t, ({ type, reply }) => {
      if (enabled && type === stage) reply.status = 503;
    });
    if (stage === "result") await advance(s, 2);
    enabled = true;
    const before = s.requests.length;
    const r = await runNext(s.ledger, s.transport, credentials, s.time);
    assert.equal(r.status, "STOPPED");
    const count = s.requests.length;
    await assert.rejects(
      runNext(s.ledger, s.transport, credentials, s.time),
      /experiment_stopped/,
    );
    assert.equal(s.requests.length, count);
    assert.equal(
      s.requests.slice(before).filter((x) => x.method === "POST").length,
      1,
    );
  });
}
for (const variant of [
  "malformed-json",
  "stale-operation",
  "wrong-model",
  "extra-attempt",
  "fallback",
  "missing-scale",
  "public-world",
  "stale-world",
  "changed-world",
  "missing-asset",
  "bad-format",
  "bad-billing",
]) {
  test(`reject ${variant} and block continuation`, async (t) => {
    let worldReads = 0;
    const s = setup(t, ({ type, reply, data, job }) => {
      if (type === "poll") {
        if (variant === "malformed-json") reply.bytes = Buffer.from("not json");
        if (variant === "stale-operation")
          reply.bytes = asBytes({ ...data, operation_id: "old" });
        if (variant === "extra-attempt")
          reply.bytes = asBytes({ ...data, provider_attempts: 2 });
        if (variant === "fallback")
          reply.bytes = asBytes({ ...data, fallback: true });
        if (variant === "bad-billing")
          reply.bytes = asBytes({ ...data, cost: { total_credits: 999999 } });
      }
      if (type === "world") {
        worldReads++;
        if (variant === "wrong-model") data.model = "marble-1.0";
        if (variant === "missing-scale")
          delete data.assets.splats.semantics_metadata;
        if (variant === "public-world") data.permission.public = true;
        if (variant === "stale-world") data.created_at = "2020-01-01T00:00:00Z";
        if (variant === "changed-world" && worldReads === 2)
          data.assets.imagery.pano_url = `https://wlt-ai-cdn.art/other/${job.id}.png`;
        if (variant === "missing-asset") delete data.assets.mesh;
        reply.bytes = asBytes(data);
      }
      if (type === "download" && variant === "bad-format")
        reply.bytes = Buffer.from("<html>not geometry</html>");
    });
    const r = await runNext(s.ledger, s.transport, credentials, s.time);
    assert.equal(r.status, "STOPPED");
    await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
    assert.equal(s.requests.filter((r) => r.method === "POST").length, 1);
  });
}
test("missing billing remains UNKNOWN, preserves full reservation and pauses", async (t) => {
  const s = setup(t, ({ type, data, reply }) => {
    if (type === "poll") {
      delete data.cost;
      reply.bytes = asBytes(data);
    }
  });
  const r = await runNext(s.ledger, s.transport, credentials, s.time);
  assert.equal(r.status, "awaiting_billing_and_output_review");
  assert.equal(r.reportedMicroUSD, null);
  assert.equal(r.reservedMicroUSD, 1300000);
  assert.throws(
    () => approve(s.ledger, r.jobId, reviewFor(s.ledger, r.jobId)),
    /billing_unknown/,
  );
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  s.ledger.close();
  s.ledger = new Ledger(s.root, COMMIT);
  t.after(() => s.ledger.close());
  assert.equal(s.ledger.summary().reportedMicroUSD, null);
  assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
});
test("explicit matched receipt appends known billing without rewriting UNKNOWN history", async (t) => {
  const s = setup(t, ({ type, data, reply }) => {
    if (type === "poll") {
      delete data.cost;
      reply.bytes = asBytes(data);
    }
  });
  await runNext(s.ledger, s.transport, credentials, s.time);
  const before = readFileSync(join(s.root, "journal.jsonl"));
  bill(
    s.ledger,
    "spatial-room-1",
    "op-spatial-room-1",
    1264000,
    "dashboard",
    hash("synthetic-receipt"),
  );
  assert.ok(
    readFileSync(join(s.root, "journal.jsonl"))
      .subarray(0, before.length)
      .equals(before),
  );
  assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
  assert.equal(s.ledger.summary().reportedMicroUSD, 1264000);
});
for (const variant of [
  "wrong-request",
  "over-price",
  "negative",
  "fractional",
  "bad-hash",
]) {
  test(`billing ${variant} cannot release next job`, async (t) => {
    const s = setup(t, ({ type, data, reply }) => {
      if (type === "poll") {
        delete data.cost;
        reply.bytes = asBytes(data);
      }
    });
    await runNext(s.ledger, s.transport, credentials, s.time);
    assert.throws(() =>
      bill(
        s.ledger,
        "spatial-room-1",
        variant === "wrong-request" ? "wrong" : "op-spatial-room-1",
        variant === "over-price"
          ? 1264001
          : variant === "negative"
            ? -1
            : variant === "fractional"
              ? 1.5
              : 1264000,
        "dashboard",
        variant === "bad-hash" ? "bad" : hash("receipt"),
      ),
    );
    await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  });
}
for (const url of [
  "http://wlt-ai-cdn.art/a",
  "https://127.0.0.1/a",
  "https://wlt-ai-cdn.art.evil.test/a",
  "https://user:password@wlt-ai-cdn.art/a",
  "https://wlt-ai-cdn.art:444/a",
  "https://wlt-ai-cdn.art/a#fragment",
  "file:///a",
  "https://wlt-ai-cdn.art/%2e%2e/a",
]) {
  test(`asset URL rejects ${url}`, () =>
    assert.throws(() => assetUrl(url, "worldlabs")));
}
for (const url of [
  "https://queue.falrun.com/fal-ai/hunyuan_world/image-to-world",
  "https://queue.fal.run/other/model",
  "https://queue.fal.run/fal-ai/hunyuan_world/image-to-world?fallback=1",
]) {
  test(`API endpoint rejects ${url}`, () =>
    assert.throws(() => apiUrl(url, protocol.jobs[2], "submit")));
}
test("fal returned request ID and paths are pinned", () => {
  assert.throws(() =>
    apiUrl(
      "https://queue.fal.run/fal-ai/hunyuan_world/requests/old/status",
      protocol.jobs[2],
      "poll",
      "new",
    ),
  );
  assert.equal(
    apiUrl(
      "https://queue.fal.run/fal-ai/hunyuan_world/requests/new/status",
      protocol.jobs[2],
      "poll",
      "new",
    ),
    "https://queue.fal.run/fal-ai/hunyuan_world/requests/new/status",
  );
});
test("both fal opt-outs set, raw HTTP only, no asset credentials", async (t) => {
  const s = setup(t);
  await advance(s, 4);
  for (const r of s.requests.filter(
    (x) => x.method === "POST" && x.url.includes("fal.run"),
  )) {
    assert.equal(r.headers["X-Fal-No-Retry"], "1");
    assert.equal(r.headers["x-app-fal-disable-fallback"], "true");
  }
  for (const r of s.requests.filter(
    (x) => x.url.includes("wlt-ai-cdn.art") || x.url.includes("fal.media"),
  ))
    assert.deepEqual(r.headers, {});
  assert.ok(!s.requests.some((x) => x.url.includes("falrun.com")));
});
test("fal input is only the approved retained synthetic room panorama", async (t) => {
  const s = setup(t);
  await advance(s, 3);
  const r = s.requests.find((x) => x.url === protocol.jobs[2].endpoint);
  assert.equal(
    JSON.parse(r.body).image_url,
    "https://wlt-ai-cdn.art/synthetic/spatial-room-1/pano.png",
  );
  assert.equal(s.ledger.rows("dependency").length, 1);
});
test("failed panorama permission or stale review cannot permit next generation", async (t) => {
  const s = setup(t);
  await runNext(s.ledger, s.transport, credentials, s.time);
  const r = reviewFor(s.ledger, "spatial-room-1");
  assert.throws(() =>
    approve(s.ledger, "spatial-room-1", {
      ...r,
      panoramaSharingPermitted: false,
    }),
  );
  assert.throws(() =>
    approve(s.ledger, "spatial-room-1", { ...r, resultSHA256: hash("stale") }),
  );
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
});
test("poll cap 45, spacing 20 seconds, deadline 15 minutes", async (t) => {
  const s = setup(t, ({ type, reply, data }) => {
    if (type === "poll") reply.bytes = asBytes({ ...data, done: false });
  });
  const r = await runNext(s.ledger, s.transport, credentials, s.time);
  assert.equal(r.status, "STOPPED");
  const polls = s.ledger.rows("request").filter((x) => x.type === "poll");
  assert.equal(polls.length, 45);
  for (let i = 1; i < polls.length; i++)
    assert.equal(polls[i].at - polls[i - 1].at, 20000);
  assert.equal(polls.at(-1).at - s.ledger.rows("reserve")[0].started, 900000);
});
test("slow response crossing deadline stops immediately", async (t) => {
  const s = setup(t, ({ type, time }) => {
    if (type === "submit") time.advance(900001);
  });
  const r = await runNext(s.ledger, s.transport, credentials, s.time);
  assert.equal(r.status, "STOPPED");
  assert.equal(s.requests.length, 1);
});
for (const [type, limit] of [
  ["download", 14],
  ["poll", 45],
  ["world", 2],
  ["result", 1],
  ["submit", 1],
])
  test(`${type} hard counter cannot overflow`, (t) => {
    const s = setup(t);
    s.ledger.append("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
    for (let i = 0; i < limit; i++)
      s.ledger.append("request", {
        jobId: "spatial-room-1",
        type,
        at: i,
        urlHash: hash("url"),
      });
    assert.throws(() =>
      s.ledger.append("request", {
        jobId: "spatial-room-1",
        type,
        at: limit,
        urlHash: hash("url"),
      }),
    );
  });
test("rerun cannot initialize or repeat an attempted-but-uncertain submission", async (t) => {
  const s = setup(t);
  s.ledger.append("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
  s.ledger.close();
  assert.throws(() => initialize(s.root, COMMIT));
  s.ledger = new Ledger(s.root, COMMIT);
  t.after(() => s.ledger.close());
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  assert.equal(s.requests.length, 0);
});
for (const variant of ["truncate", "remove", "alter", "partial", "witness"]) {
  test(`ledger ${variant} refuses reopen`, (t) => {
    const s = setup(t);
    s.ledger.append("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
    s.ledger.close();
    const f = join(s.root, "journal.jsonl");
    if (variant === "remove") unlinkSync(f);
    else if (variant === "witness")
      writeFileSync(join(s.root, "witness.jsonl"), "");
    else if (variant === "truncate") writeFileSync(f, "");
    else if (variant === "partial")
      writeFileSync(f, readFileSync(f).subarray(0, -1));
    else writeFileSync(f, readFileSync(f, "utf8").replace("1300000", "0"));
    assert.throws(() => new Ledger(s.root, COMMIT));
  });
}
test("orphan/modified evidence refuses reopen", (t) => {
  const s = setup(t);
  const e = s.ledger.evidence(Buffer.from("synthetic asset"), "bin");
  s.ledger.close();
  writeFileSync(join(s.root, "evidence", e.file), "changed");
  assert.throws(() => new Ledger(s.root, COMMIT));
});
test("credential-bearing error/response is never persisted", async (t) => {
  const s = setup(t, ({ type, reply }) => {
    if (type === "submit") reply.bytes = Buffer.from(credentials.worldlabs);
  });
  assert.equal(
    (await runNext(s.ledger, s.transport, credentials, s.time)).status,
    "STOPPED",
  );
  assert.ok(!allBytes(s.root).includes(Buffer.from(credentials.worldlabs)));
});
test("transport exception messages cannot leak secrets", async (t) => {
  const s = setup(t, () => {
    throw Error(credentials.worldlabs);
  });
  await runNext(s.ledger, s.transport, credentials, s.time);
  assert.ok(!allBytes(s.root).includes(Buffer.from(credentials.worldlabs)));
});
for (const args of [
  [],
  ["--live"],
  [`--approved-sha=${COMMIT}`],
  ["--live", `--approved-sha=${"2".repeat(40)}`],
])
  test(`exact SHA live gate denies ${args.join(" ") || "default"}`, () =>
    assert.throws(() => authorization(args, COMMIT, false)));
test("dirty checkout blocks execution even with SHA flag", () =>
  assert.throws(() =>
    authorization(["--live", `--approved-sha=${COMMIT}`], COMMIT, true),
  ));
test("exact clean SHA acknowledgement is required", () =>
  authorization(["--live", `--approved-sha=${COMMIT}`], COMMIT, false));
for (const kind of ["http", "redirect", "oversized", "network"]) {
  test(`transport ${kind} never retries`, async () => {
    let calls = 0;
    const transport = httpTransport(async (url, options) => {
      calls++;
      assert.equal(options.redirect, "manual");
      if (kind === "network") throw Error("network");
      return {
        status: kind === "http" ? 503 : 200,
        url: kind === "redirect" ? url + "/other" : url,
        headers: new Headers(
          kind === "oversized" ? { "content-length": "999" } : {},
        ),
        body: new ReadableStream({
          start(c) {
            c.enqueue(Buffer.from("{}"));
            c.close();
          },
        }),
      };
    });
    await assert.rejects(
      transport({
        url: protocol.jobs[0].endpoint,
        method: "POST",
        headers: {},
        body: "{}",
        limit: 5,
        timeoutMs: 1000,
      }),
    );
    assert.equal(calls, 1);
  });
}
test("stream byte cap catches absent content length", async () => {
  let cancelled = false;
  const transport = httpTransport(async (url) => ({
    status: 200,
    url,
    headers: new Headers(),
    body: new ReadableStream({
      start(c) {
        c.enqueue(Buffer.alloc(10));
      },
      cancel() {
        cancelled = true;
      },
    }),
  }));
  await assert.rejects(
    transport({
      url: protocol.jobs[0].endpoint,
      method: "GET",
      headers: {},
      limit: 5,
      timeoutMs: 1000,
    }),
  );
  assert.equal(cancelled, true);
});
for (const kind of ["glb", "splat", "image", "geometry"]) {
  test(`truncated ${kind} output rejected`, () =>
    assert.throws(() =>
      inspectAsset(
        Buffer.from("bad"),
        { role: "pano", kind, url: "unused" },
        protocol.jobs[0],
      ),
    ));
}
test("non-equirectangular panorama rejected", () =>
  assert.throws(
    () =>
      inspectAsset(
        png(1, 1),
        { role: "pano", kind: "image", url: "unused" },
        protocol.jobs[0],
      ),
    /incompatible_panorama/,
  ));
test("valid synthetic GLB, SPZ and PNG pass structural checks only", () => {
  assert.equal(
    inspectAsset(
      glb(),
      { role: "object", kind: "glb", url: "unused" },
      protocol.jobs[3],
    ).format,
    "glb",
  );
  assert.equal(
    inspectAsset(
      spz(),
      { role: "splat", kind: "splat", url: "unused" },
      protocol.jobs[0],
    ).format,
    "spz",
  );
  assert.equal(
    inspectAsset(
      png(),
      { role: "pano", kind: "image", url: "unused" },
      protocol.jobs[0],
    ).width,
    2,
  );
});
test("harness has no production imports or database/mutation endpoints", () => {
  const src = new URL("../src/", import.meta.url);
  for (const f of readdirSync(src)) {
    const s = readFileSync(new URL(f, src), "utf8");
    assert.ok(
      !s.includes("@supabase/") &&
        !s.includes("src/lib/") &&
        !s.includes("localhost:3000") &&
        !s.includes("/rest/v1/"),
    );
  }
  assert.deepEqual(
    [...new Set(protocol.jobs.map((x) => new URL(x.endpoint).hostname))].sort(),
    ["api.worldlabs.ai", "queue.fal.run"],
  );
});
test("fixture files contain synthetic markers only, no dotenv or live key material", () => {
  const s = readFileSync(new URL("./fixtures.mjs", import.meta.url), "utf8");
  assert.ok(s.includes("SYNTHETIC_WLT_CREDENTIAL_MARKER"));
  assert.ok(
    !/sk-[A-Za-z0-9]{20,}|sb_secret_[A-Za-z0-9]+|eyJ[A-Za-z0-9_-]{30,}/.test(s),
  );
  assert.ok(
    !s.includes(".env.local") && !s.includes("James") && !s.includes("Jinn"),
  );
});

test("deleted run directory cannot be reinitialized because anchor survives", (t) => {
  const s = setup(t);
  s.ledger.close();
  rmSync(s.root, { recursive: true });
  assert.throws(() => initialize(s.root, COMMIT), /run_already_exists/);
});
test("poll transport error is not retried after process reopen", async (t) => {
  const s = setup(t, ({ type }) => {
    if (type === "poll") throw Error("synthetic fault");
  });
  await runNext(s.ledger, s.transport, credentials, s.time);
  const count = s.requests.length;
  s.ledger.close();
  s.ledger = new Ledger(s.root, COMMIT);
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /experiment_stopped/,
  );
  assert.equal(s.requests.length, count);
});
test("partial journal/witness commit fails closed without repair", (t) => {
  const s = setup(t);
  s.ledger.append("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
  s.ledger.close();
  writeFileSync(join(s.root, "witness.jsonl"), "partial");
  assert.throws(() => new Ledger(s.root, COMMIT));
});
test("invalid fal result request identity blocks next generation", async (t) => {
  let fail = false;
  const s = setup(t, ({ type, reply }) => {
    if (fail && type === "result")
      reply.headers["x-fal-request-id"] = "other-request";
  });
  await advance(s, 2);
  fail = true;
  assert.equal(
    (await runNext(s.ledger, s.transport, credentials, s.time)).status,
    "STOPPED",
  );
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
});
test("unknown asset host stops before downloading from it", async (t) => {
  const s = setup(t, ({ type, data, reply }) => {
    if (type === "world") {
      data.assets.imagery.pano_url = "https://evil.test/secret";
      reply.bytes = asBytes(data);
    }
  });
  assert.equal(
    (await runNext(s.ledger, s.transport, credentials, s.time)).status,
    "STOPPED",
  );
  assert.ok(!s.requests.some((x) => x.url.includes("evil.test")));
});

test("all API counters reach exactly 190, then reject before I/O", (t) => {
  const s = setup(t);
  for (const job of protocol.jobs) {
    s.ledger.append("reserve", {
      jobId: job.id,
      microUSD: job.reserveMicroUSD,
    });
    for (const type of [
      "submit",
      ...Array(45).fill("poll"),
      ...(job.provider === "worldlabs" ? ["world", "world"] : ["result"]),
    ])
      s.ledger.append("request", { jobId: job.id, type });
  }
  assert.equal(s.ledger.summary().apiRequests, 190);
  assert.throws(
    () => s.ledger.append("request", { jobId: "spatial-room-1", type: "poll" }),
    /api_limit/,
  );
  assert.equal(s.ledger.summary().apiRequests, 190);
  assert.equal(s.requests.length, 0);
});
test("unapproved request category cannot bypass counters", (t) => {
  const s = setup(t);
  s.ledger.append("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
  assert.throws(
    () =>
      s.ledger.append("request", {
        jobId: "spatial-room-1",
        type: "diagnostic",
      }),
    /unapproved_request_type/,
  );
});
test("remaining cumulative byte allowance bounds the next download before transport", (t) => {
  const s = setup(t);
  s.ledger.append("response", {
    type: "download",
    bytes: protocol.limits.maxTotalAssetBytes - 3,
  });
  assert.equal(responseByteLimit(s.ledger, "download"), 3);
  s.ledger.append("response", { type: "download", bytes: 3 });
  assert.throws(
    () => responseByteLimit(s.ledger, "download"),
    /asset_total_limit/,
  );
  assert.equal(s.requests.length, 0);
});
