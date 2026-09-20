import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { canonical, hash, protocolHash } from "../src/protocol.ts";
import {
  falRecovery as c,
  falRecoveryHash,
  recoveryURL,
  safeHTTP,
  validateQueue,
} from "../src/fal-recovery-contract.ts";
import {
  FalRecoveryLedger,
  initializeFalRecovery,
  verifyFalSource,
} from "../src/fal-recovery-ledger.ts";
import { getRecoveryJSON, runFalRecovery } from "../src/fal-recovery.ts";
import { glb, COMMIT } from "./fixtures.mjs";
const SECRET = "SYNTHETIC_FAL_RECOVERY_CREDENTIAL_ONLY",
  COMPLETE = { request_id: c.requestId, status: "COMPLETED" };
globalThis.fetch = async () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
function setup(t, limits = c.limits) {
  const parent = mkdtempSync(join(tmpdir(), "fal-recovery-offline-")),
    sourceRoot = join(parent, "source"),
    sourceRun = join(
      sourceRoot,
      "experiments/phase38-spatial/private-continuation",
    ),
    root = join(parent, "recovery");
  mkdirSync(sourceRun, { recursive: true });
  const rows = [];
  const add = (kind, data) => {
    const body = {
      sequence: rows.length,
      previous: rows.at(-1)?.digest ?? "GENESIS",
      protocolHash,
      kind,
      data,
    };
    rows.push({ ...body, digest: hash(canonical(body)) });
  };
  add("reserve", { jobId: "spatial-room-1", microUSD: 1300000 });
  add("reserve", { jobId: "spatial-courtyard-1", microUSD: 2500000 });
  add("reserve", { jobId: c.jobId, microUSD: 350000, model: c.model });
  add("billing", { jobId: "spatial-room-1", microUSD: 1264000 });
  add("billing", { jobId: "spatial-courtyard-1", microUSD: 1264000 });
  add("receipt", { jobId: c.jobId, requestId: c.requestId, provider: "fal" });
  add("request", { jobId: c.jobId, type: "submit" });
  add("request", {
    jobId: c.jobId,
    type: "poll",
    urlHash: hash(recoveryURL("status")),
  });
  add("stop", {
    jobId: c.jobId,
    reason: "http_or_redirect_failure",
    stage: "poll",
    billing: "UNKNOWN",
  });
  writeFileSync(
    join(sourceRun, "journal.jsonl"),
    rows.map((x) => canonical(x)).join("\n") + "\n",
  );
  writeFileSync(
    join(sourceRun, "witness.jsonl"),
    rows.map((x) => x.digest).join("\n") + "\n",
  );
  const identity =
    canonical({
      commit: c.originalExecutionSHA,
      protocolHash,
      continuation: { manifestHash: c.continuationHash },
    }) + "\n";
  writeFileSync(join(sourceRun, "identity.json"), identity);
  writeFileSync(sourceRun + ".anchor", identity);
  const names = [
    "experiments/phase38-spatial/private-continuation/journal.jsonl",
    "experiments/phase38-spatial/private-continuation/witness.jsonl",
    "experiments/phase38-spatial/private-continuation/identity.json",
    "experiments/phase38-spatial/private-continuation.anchor",
  ];
  const source = {
    sourceRoot,
    files: Object.fromEntries(
      names.map((n) => [n, hash(readFileSync(join(sourceRoot, n)))]),
    ),
  };
  initializeFalRecovery(root, COMMIT, source, limits);
  const s = {
    parent,
    source,
    sourceRun,
    root,
    limits,
    ledger: new FalRecoveryLedger(root, COMMIT, source, limits),
    calls: [],
    downloads: [],
  };
  t.after(() => {
    s.ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  s.fetcher = async (url, init) => {
    s.calls.push({ url, init });
    assert.equal(init.method, "GET");
    assert.equal(init.redirect, "manual");
    return reply(
      url,
      url.endsWith("/status")
        ? COMPLETE
        : { world_file: { url: "https://fal.media/synthetic/world.glb" } },
    );
  };
  s.download = async (req) => {
    s.downloads.push(req);
    assert.equal(req.method, "GET");
    assert.deepEqual(req.headers, {});
    return { status: 200, url: req.url, headers: {}, bytes: glb() };
  };
  return s;
}
function reply(url, body = COMPLETE, status = 200, headers = {}) {
  const r = new Response(JSON.stringify(body), { status, headers });
  Object.defineProperty(r, "url", { value: url });
  return r;
}
const full = { statusReads: 1, resultReads: 1, assetDownloads: 1 };
function readHashTree(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? readHashTree(join(root, e.name))
      : [[join(root, e.name), hash(readFileSync(join(root, e.name)))]],
  );
}

test("observation-only CLI limits are frozen; no new reservation or generation count", async (t) => {
  const s = setup(t),
    before = readHashTree(s.source.sourceRoot);
  const result = await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(result.newReservations, 0);
  assert.equal(result.reservedMicroUSD, 4150000);
  assert.equal(result.attempted, 3);
  assert.deepEqual(result.unknownChargeJobs, [c.jobId]);
  assert.equal(result.apiRequests, 1);
  assert.equal(result.newGenerationSubmissions, 0);
  assert.equal(result.retainedCumulativeReservedMicroUSD, 4150000);
  assert.equal(result.knownReportedMicroUSD, 2528000);
  assert.equal(result.reportedMicroUSD, null);
  assert.equal(result.falCharge, "UNKNOWN");
  assert.equal(result.terminal, "OBSERVED_AWAITING_OWNER_REVIEW");
  assert.equal(s.calls.length, 1);
  assert.equal(s.downloads.length, 0);
  assert.deepEqual(readHashTree(s.source.sourceRoot), before);
  assert.equal(s.ledger.rows("recovery_status")[0].validatedComplete, true);
  assert.equal(s.ledger.rows("recovery_result").length, 0);
});
for (const method of ["POST", "PUT", "DELETE", "PATCH", "HEAD"]) {
  test(`recovery refuses ${method} before transport`, async () => {
    let calls = 0;
    await assert.rejects(
      getRecoveryJSON(
        {
          stage: "status",
          method,
          url: recoveryURL("status"),
          credential: SECRET,
          timeoutMs: 100,
        },
        () => {},
        async () => {
          calls++;
        },
      ),
      /get_only/,
    );
    assert.equal(calls, 0);
  });
}
for (const [label, url] of [
  ["arbitrary", "https://evil.test/status"],
  [
    "chest",
    `https://queue.fal.run/fal-ai/hunyuan-3d/requests/${c.requestId}/status`,
  ],
  ["other ID", recoveryURL("status").replace(c.requestId, "wrong-request")],
  ["model path", recoveryURL("status").replace("hunyuan_world", "wrong_model")],
  ["World Labs", "https://api.worldlabs.ai/marble/v1/worlds/test"],
  ["cancel", recoveryURL("result") + "/cancel"],
  ["query", recoveryURL("status") + "?logs=1"],
  ["traversal", recoveryURL("status").replace("/requests/", "/x/../requests/")],
]) {
  test(`GET rejects ${label}`, async () => {
    let calls = 0;
    await assert.rejects(
      getRecoveryJSON(
        {
          stage: "status",
          method: "GET",
          url,
          credential: SECRET,
          timeoutMs: 100,
        },
        () => {},
        async () => {
          calls++;
        },
      ),
    );
    assert.equal(calls, 0);
  });
}
test("request and model pins cannot be replaced", () => {
  assert.throws(() => recoveryURL("status", "another"), /identity/);
  assert.throws(() => recoveryURL("result", c.requestId, "wrong"), /identity/);
  assert.throws(() => recoveryURL("cancel"), /stage/);
  assert.equal(c.provider, "fal");
});
for (const status of [
  201, 202, 204, 301, 302, 307, 308, 400, 401, 403, 404, 429, 500,
]) {
  test(`HTTP ${status} safely recorded before stop; no guessed status acceptance`, async (t) => {
    const s = setup(t);
    s.fetcher = async (url, init) => {
      s.calls.push(init);
      const r = new Response(status === 204 ? null : "SYNTHETIC_PRIVATE_BODY", {
        status,
        headers: { location: "https://evil.test/secret?token=SYNTHETIC_TOKEN" },
      });
      Object.defineProperty(r, "url", { value: url });
      return r;
    };
    await runFalRecovery(s.ledger, SECRET, s);
    assert.equal(s.ledger.rows("recovery_http")[0].httpStatus, status);
    assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
    assert.equal(s.calls.length, 1);
    assert.equal(s.downloads.length, 0);
    const evidence = readFileSync(join(s.root, "journal.jsonl"), "utf8");
    assert.ok(
      !evidence.includes("SYNTHETIC_PRIVATE_BODY") &&
        !evidence.includes("SYNTHETIC_TOKEN") &&
        !evidence.includes(SECRET),
    );
  });
}
for (const [label, url, classification] of [
  [
    "off-origin",
    "https://evil.test/a?token=SYNTHETIC_SECRET",
    "unexpected_origin_or_path",
  ],
  [
    "same-origin wrong path",
    "https://queue.fal.run/not-the-request",
    "unexpected_origin_or_path",
  ],
  [
    "existing canonical alias",
    `https://queue.fal.run/${c.model}/requests/${c.requestId}/status`,
    "allowed_same_origin_canonicalization",
  ],
]) {
  test(`response URL mismatch retains ${label} safely`, async (t) => {
    const s = setup(t);
    s.fetcher = async () => reply(url);
    await runFalRecovery(s.ledger, SECRET, s);
    const d = s.ledger.rows("recovery_http")[0];
    assert.equal(d.classification, classification);
    assert.equal(d.response.urlHash, hash(url));
    assert.equal(d.responseURLMatches, false);
    assert.equal(
      s.ledger.rows("recovery_end")[0].reason,
      "fal_recovery_response_url_mismatch",
    );
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes(
        "SYNTHETIC_SECRET",
      ),
    );
  });
}
test("allowed relative Location is classified but never followed", async (t) => {
  const s = setup(t);
  s.fetcher = async (url, init) => {
    s.calls.push(init);
    return reply(url, {}, 307, { location: new URL(url).pathname });
  };
  await runFalRecovery(s.ledger, SECRET, s);
  const d = s.ledger.rows("recovery_http")[0];
  assert.equal(d.classification, "redirect_to_allowed_queue_path");
  assert.equal(d.location.hostname, "queue.fal.run");
  assert.equal(s.calls.length, 1);
  assert.equal(
    s.ledger.rows("recovery_end")[0].reason,
    "fal_recovery_redirect_stop",
  );
});
test("credential-bearing Location and response bodies/headers never enter evidence", async (t) => {
  const s = setup(t);
  s.fetcher = async (url) =>
    reply(url, { ...COMPLETE, secret: SECRET }, 302, {
      location: `https://${SECRET}:password@evil.test/${SECRET}?key=${SECRET}`,
      authorization: SECRET,
      "x-unapproved-secret": SECRET,
    });
  await runFalRecovery(s.ledger, SECRET, s);
  const data = readFileSync(join(s.root, "journal.jsonl"), "utf8");
  for (const x of [SECRET, "password", "authorization", "x-unapproved-secret"])
    assert.ok(!data.includes(x));
  assert.equal(
    s.ledger.rows("recovery_http")[0].location.credentialsPresent,
    true,
  );
});
test("transport failures retain null status without exception text", async (t) => {
  const s = setup(t);
  s.fetcher = async () => {
    throw Error(SECRET);
  };
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.ledger.rows("recovery_http")[0].httpStatus, null);
  assert.ok(
    !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes(SECRET),
  );
});
test("status response ignores secret extra body fields, retaining only normalized safe state", async (t) => {
  const s = setup(t);
  s.fetcher = async (url) =>
    reply(url, {
      ...COMPLETE,
      private_body: SECRET,
      provider_debug: { authorization: SECRET },
    });
  await runFalRecovery(s.ledger, SECRET, s);
  assert.ok(
    !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes(SECRET),
  );
});
for (const body of [
  { ...COMPLETE, request_id: "wrong" },
  { ...COMPLETE, model: "wrong" },
  { ...COMPLETE, endpoint_id: "wrong" },
  { ...COMPLETE, status: "UNKNOWN" },
  { ...COMPLETE, fallback: true },
  { ...COMPLETE, provider_attempts: 2 },
  { ...COMPLETE, model_attempts: 2 },
  { status: "COMPLETED" },
]) {
  test(`queue validation fails closed ${JSON.stringify(body)}`, async (t) => {
    const s = setup(t, full);
    s.fetcher = async (url, init) => {
      s.calls.push(init);
      return reply(url, body);
    };
    await runFalRecovery(s.ledger, SECRET, s);
    assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
    assert.equal(s.calls.length, 1);
    assert.equal(s.downloads.length, 0);
  });
}
for (const status of ["IN_QUEUE", "IN_PROGRESS"]) {
  test(`${status} cannot release a result even in future retrieval contract`, async (t) => {
    const s = setup(t, full);
    s.fetcher = async (url, init) => {
      s.calls.push(init);
      return reply(url, { request_id: c.requestId, status });
    };
    await runFalRecovery(s.ledger, SECRET, s);
    assert.equal(s.calls.length, 1);
    assert.equal(s.downloads.length, 0);
    assert.equal(s.ledger.rows("recovery_result").length, 0);
  });
}
test("future validated completion can retrieve one result and retain one guarded asset", async (t) => {
  const s = setup(t, full);
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.calls.length, 2);
  assert.equal(s.calls[1].url, recoveryURL("result"));
  assert.equal(s.downloads.length, 1);
  assert.equal(s.ledger.rows("recovery_asset")[0].metadata.format, "glb");
  assert.equal(
    s.ledger.rows("recovery_end")[0].status,
    "RECOVERED_AWAITING_OWNER_REVIEW",
  );
  assert.equal(s.ledger.summary().reportedMicroUSD, null);
  s.ledger.close();
  s.ledger = new FalRecoveryLedger(s.root, COMMIT, s.source, full);
  await assert.rejects(
    runFalRecovery(s.ledger, SECRET, s),
    /already_attempted/,
  );
  assert.equal(s.calls.length, 2);
  assert.equal(s.downloads.length, 1);
});
test("wrong result request identity never downloads", async (t) => {
  const s = setup(t, full);
  s.fetcher = async (url, init) => {
    s.calls.push(init);
    return reply(
      url,
      url.endsWith("status")
        ? COMPLETE
        : {
            request_id: "wrong",
            world_file: { url: "https://fal.media/a.glb" },
          },
    );
  };
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(
    s.ledger.rows("recovery_end")[0].reason,
    "fal_recovery_result_identity",
  );
  assert.equal(s.downloads.length, 0);
});
test("wrong result header identity never reaches result validation", async (t) => {
  const s = setup(t, full);
  s.fetcher = async (url) =>
    reply(url, COMPLETE, 200, { "x-fal-request-id": "other" });
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.ledger.rows("recovery_http")[0].httpStatus, 200);
  assert.equal(s.downloads.length, 0);
});
test("existing result model, URL and geometry validators remain required", async (t) => {
  const s = setup(t, full);
  s.fetcher = async (url) =>
    reply(
      url,
      url.endsWith("status")
        ? COMPLETE
        : { world_file: { url: "http://127.0.0.1/secret" } },
    );
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.downloads.length, 0);
  assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
});
test("opaque DRC is not falsely accepted as supported navigable geometry", async (t) => {
  const s = setup(t, full);
  s.download = async (req) => {
    s.downloads.push(req);
    return {
      status: 200,
      url: req.url,
      headers: {},
      bytes: Buffer.from("DRACO_SYNTHETIC_OPAQUE"),
    };
  };
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.downloads.length, 1);
  assert.equal(s.ledger.rows("recovery_asset").length, 0);
  assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
});
test("duplicate initialization rejected; deletion cannot reset surviving anchor", (t) => {
  const s = setup(t);
  assert.throws(
    () => initializeFalRecovery(s.root, COMMIT, s.source),
    /already_exists/,
  );
  s.ledger.close();
  rmSync(s.root, { recursive: true });
  assert.throws(
    () => initializeFalRecovery(s.root, COMMIT, s.source),
    /already_exists/,
  );
});
test("history mutation blocks later request and cannot be silently repaired", async (t) => {
  const s = setup(t);
  writeFileSync(join(s.sourceRun, "journal.jsonl"), "CHANGED");
  assert.throws(() => verifyFalSource(s.source), /history/);
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.calls.length, 0);
  assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
});
test("new journal cannot append reservation, generation or approval", (t) => {
  const s = setup(t);
  for (const kind of [
    "reserve",
    "request",
    "receipt",
    "approval",
    "billing",
    "next",
  ])
    assert.throws(
      () =>
        s.ledger.append(kind, { jobId: "spatial-chest-1", microUSD: 600000 }),
      /observation_only/,
    );
  assert.equal(s.ledger.summary().newReservations, 0);
});
test("crash after durable begin is append-only and cannot repeat observation", async (t) => {
  const s = setup(t);
  s.ledger.append("recovery_begin", {
    requestId: c.requestId,
    falRecoveryHash,
  });
  const old = readFileSync(join(s.root, "journal.jsonl"));
  s.ledger.close();
  s.ledger = new FalRecoveryLedger(s.root, COMMIT, s.source);
  await assert.rejects(
    runFalRecovery(s.ledger, SECRET, s),
    /already_attempted/,
  );
  assert.deepEqual(readFileSync(join(s.root, "journal.jsonl")), old);
  assert.equal(s.calls.length, 0);
});
test("duplicate result and asset request accounting is blocked in future contract", (t) => {
  const s = setup(t, full);
  s.ledger.append("recovery_begin", {
    requestId: c.requestId,
    falRecoveryHash,
  });
  assert.throws(
    () =>
      s.ledger.append("recovery_request", {
        requestId: c.requestId,
        stage: "result",
        method: "GET",
        urlHash: hash(recoveryURL("result")),
      }),
    /before_completion/,
  );
  s.ledger.append("recovery_status", {
    ...COMPLETE,
    state: "COMPLETED",
    requestId: c.requestId,
    validatedComplete: true,
  });
  const r = {
    requestId: c.requestId,
    stage: "result",
    method: "GET",
    urlHash: hash(recoveryURL("result")),
  };
  s.ledger.append("recovery_request", r);
  assert.throws(() => s.ledger.append("recovery_request", r), /read_limit/);
  s.ledger.append("recovery_result", { requestId: c.requestId });
  const a = {
    requestId: c.requestId,
    stage: "asset",
    method: "GET",
    urlHash: hash("synthetic-asset"),
  };
  s.ledger.append("recovery_request", a);
  assert.throws(() => s.ledger.append("recovery_request", a), /read_limit/);
});
test("body size cap and deadline cannot be bypassed", async (t) => {
  const s = setup(t);
  s.fetcher = async (url) =>
    reply(url, COMPLETE, 200, {
      "content-length": String(c.limits.maxJsonBytes + 1),
    });
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.ledger.rows("recovery_end")[0].status, "STOPPED");
  assert.equal(s.ledger.rows("recovery_status").length, 0);
});
test("current CLI has no result/download/release/next/operator URL surface", () => {
  for (const action of ["next", "result", "download", "release", "cancel"]) {
    const run = spawnSync(
      process.execPath,
      ["experiments/phase38-spatial/src/fal-recovery-cli.ts", action],
      { encoding: "utf8" },
    );
    assert.equal(run.status, 1);
  }
  const src = readFileSync(
    new URL("../src/fal-recovery-cli.ts", import.meta.url),
    "utf8",
  );
  assert.ok(!src.includes('"--result"'));
  assert.equal(c.limits.resultReads, 0);
  assert.equal(c.limits.assetDownloads, 0);
});
test("source uses existing public-DNS download transport; no production or submission runner imports", () => {
  for (const name of [
    "fal-recovery.ts",
    "fal-recovery-cli.ts",
    "fal-recovery-contract.ts",
    "fal-recovery-ledger.ts",
  ]) {
    const s = readFileSync(new URL("../src/" + name, import.meta.url), "utf8");
    assert.ok(
      !s.includes('from "./runner.ts"') &&
        !s.includes('method: "POST"') &&
        !s.includes("@supabase/"),
    );
  }
  const s = readFileSync(
    new URL("../src/fal-recovery.ts", import.meta.url),
    "utf8",
  );
  assert.ok(s.includes("assetDownloadTransport"));
  assert.ok(s.includes("falOutput"));
  assert.ok(s.includes("validatedAssetURL"));
});
test("safe metadata refuses guessed canonicalization of traversal", () => {
  const url = recoveryURL("status").replace("/requests/", "/bad/../requests/");
  assert.equal(
    safeHTTP("status", recoveryURL("status"), 200, url, null).classification,
    "unexpected_origin_or_path",
  );
});
test("wrong request cannot be encoded into a validated queue status", () => {
  assert.throws(() => validateQueue({ request_id: "x", status: "COMPLETED" }));
  assert.ok(!existsSync(new URL("../private-fal-recovery", import.meta.url)));
});

test("operation deadline stops before another read", async (t) => {
  const s = setup(t);
  let tick = 0;
  s.now = () => (tick++ === 0 ? 0 : c.limits.operationDeadlineMs + 1);
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.calls.length, 0);
  assert.equal(s.ledger.rows("recovery_request").length, 0);
  assert.equal(s.ledger.rows("recovery_end")[0].reason, "job_deadline");
});
test("undeclared oversized streaming body stops without retaining content", async (t) => {
  const s = setup(t);
  s.fetcher = async (url) => {
    const response = new Response("x".repeat(c.limits.maxJsonBytes + 1));
    Object.defineProperty(response, "url", { value: url });
    return response;
  };
  await runFalRecovery(s.ledger, SECRET, s);
  assert.equal(s.ledger.rows("recovery_http")[0].httpStatus, 200);
  assert.equal(s.ledger.rows("recovery_status").length, 0);
  assert.equal(s.ledger.rows("recovery_end")[0].reason, "response_too_large");
});
test("crash after durable status request cannot send the request again", async (t) => {
  const s = setup(t);
  s.ledger.append("recovery_begin", {
    requestId: c.requestId,
    falRecoveryHash,
  });
  s.ledger.append("recovery_request", {
    stage: "status",
    method: "GET",
    requestId: c.requestId,
    urlHash: hash(recoveryURL("status")),
  });
  const previous = readFileSync(join(s.root, "journal.jsonl"));
  s.ledger.close();
  s.ledger = new FalRecoveryLedger(s.root, COMMIT, s.source);
  await assert.rejects(
    runFalRecovery(s.ledger, SECRET, s),
    /already_attempted/,
  );
  assert.deepEqual(readFileSync(join(s.root, "journal.jsonl")), previous);
  assert.equal(s.calls.length, 0);
});
