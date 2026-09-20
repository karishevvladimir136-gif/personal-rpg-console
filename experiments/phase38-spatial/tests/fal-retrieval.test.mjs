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
  retrieval as c,
  retrievalHash,
  validateResultIdentity,
} from "../src/fal-retrieval-contract.ts";
import {
  verifyCompletedEvidence,
  verifyCompletedRecovery,
} from "../src/fal-retrieval-source.ts";
import {
  initializeRetrieval,
  RetrievalLedger,
} from "../src/fal-retrieval-ledger.ts";
import {
  getRetrievalResult,
  runFalRetrieval,
  detectArtifact,
} from "../src/fal-retrieval.ts";
import { falRecovery } from "../src/fal-recovery-contract.ts";
import { glb, spz, COMMIT } from "./fixtures.mjs";
const SECRET = "SYNTHETIC_RETRIEVAL_CREDENTIAL_ONLY",
  SIGNED = "https://fal.media/synthetic/world.glb?token=SYNTHETIC_SIGNED_TOKEN";
const statusBytes = readFileSync(
  new URL("../results/fal-status-observation-001.json", import.meta.url),
);
globalThis.fetch = async () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
function response(
  body = { world_file: { url: SIGNED } },
  code = 200,
  url = c.resultURL,
  headers = {},
) {
  const r = new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    { status: code, headers },
  );
  Object.defineProperty(r, "url", { value: url });
  return r;
}
function setup(t) {
  const parent = mkdtempSync(join(tmpdir(), "fal-retrieval-offline-")),
    root = join(parent, "retrieval");
  const sources = {
    continuationRoot: join(parent, "old"),
    recoveryRoot: join(parent, "completed"),
  };
  for (const p of Object.values(sources)) mkdirSync(p);
  const old = join(sources.continuationRoot, "sentinel"),
    completed = join(sources.recoveryRoot, "sentinel");
  writeFileSync(old, "ORIGINAL_STOPPED");
  writeFileSync(completed, "COMPLETED_HISTORY");
  // Unit seam substitutes local synthetic source files only. CLI never exposes a verifier override.
  const verify = () => {
    assert.equal(readFileSync(old, "utf8"), "ORIGINAL_STOPPED");
    assert.equal(readFileSync(completed, "utf8"), "COMPLETED_HISTORY");
    return {};
  };
  initializeRetrieval(root, COMMIT, sources, verify);
  const s = {
    parent,
    root,
    sources,
    verify,
    calls: [],
    downloads: [],
    ledger: new RetrievalLedger(root, COMMIT, sources, verify),
  };
  s.fetcher = async (url, init) => {
    s.calls.push({ url, init });
    assert.equal(url, c.resultURL);
    assert.equal(init.method, "GET");
    assert.equal(init.redirect, "manual");
    return response();
  };
  s.download = async (req) => {
    s.downloads.push(req);
    assert.equal(req.method, "GET");
    assert.deepEqual(req.headers, {});
    assert.equal(req.url, SIGNED);
    return { status: 200, url: req.url, bytes: glb(), headers: {} };
  };
  t.after(() => {
    s.ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  return s;
}
function request(overrides = {}) {
  return {
    method: "GET",
    url: c.resultURL,
    credential: SECRET,
    timeoutMs: 1000,
    ...overrides,
  };
}
function begin(s) {
  s.ledger.append("retrieval_begin", {
    retrievalHash,
    requestId: c.requestId,
    started: 0,
  });
}
function completedFixture(t) {
  const parent = mkdtempSync(join(tmpdir(), "fal-completed-history-")),
    root = join(parent, "private-fal-recovery");
  mkdirSync(root);
  const e = JSON.parse(statusBytes),
    rows = [];
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
  add("recovery_begin", {
    falRecoveryHash: c.recoveryHash,
    mode: "single_status_observation",
    requestId: c.requestId,
    started: Date.parse(e.observation.startedAtUTC),
  });
  add("recovery_request", {
    at: Date.parse(e.observation.requestAtUTC),
    method: "GET",
    requestId: c.requestId,
    stage: "status",
    urlHash: e.observation.http.requestedURLHash,
  });
  add("recovery_http", e.observation.http);
  add("recovery_status", e.observation.validatedQueue);
  add("recovery_end", e.observation.terminal);
  writeFileSync(
    join(root, "journal.jsonl"),
    rows.map(canonical).join("\n") + "\n",
  );
  writeFileSync(
    join(root, "witness.jsonl"),
    rows.map((x) => x.digest).join("\n") + "\n",
  );
  const identity = {
    version: 1,
    protocolHash,
    commit: c.recoveryPreparationSHA,
    continuation: {
      falRecoveryHash: c.recoveryHash,
      contract: falRecovery,
      sourceFiles: falRecovery.sourceFiles,
      readLimits: { statusReads: 1, resultReads: 0, assetDownloads: 0 },
    },
  };
  writeFileSync(join(root, "identity.json"), canonical(identity) + "\n");
  writeFileSync(root + ".anchor", canonical(identity) + "\n");
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  return root;
}
test("exact accepted completed evidence and reconstructed safe journal qualify", (t) => {
  assert.equal(
    verifyCompletedEvidence(statusBytes).observation.validatedQueue.state,
    "COMPLETED",
  );
  const root = completedFixture(t);
  assert.equal(
    verifyCompletedRecovery(root).recoveryTerminalDigest,
    c.recoveryTerminalDigest,
  );
});
for (const part of [
  "journal.jsonl",
  "witness.jsonl",
  "identity.json",
  "../private-fal-recovery.anchor",
])
  test(`changed completed history ${part} fails closed`, (t) => {
    const root = completedFixture(t),
      p = join(root, part);
    writeFileSync(p, readFileSync(p, "utf8") + " ");
    assert.throws(() => verifyCompletedRecovery(root), /history_changed/);
  });
for (const field of [
  "requestId",
  "recoveryHash",
  "approvedExecutionSHA",
  "originalExecutionSHA",
  "continuationHash",
  "originalProtocolHash",
  "requestedModel",
])
  test(`changed status evidence ${field} rejected`, () => {
    const e = JSON.parse(statusBytes);
    e[field] = "wrong";
    assert.throws(
      () => verifyCompletedEvidence(Buffer.from(JSON.stringify(e))),
      /evidence_hash/,
    );
  });
for (const state of ["IN_QUEUE", "IN_PROGRESS", "FAILED", null])
  test(`status evidence without exact COMPLETED (${state}) rejected`, () => {
    const e = JSON.parse(statusBytes);
    e.observation.validatedQueue.state = state;
    assert.throws(() =>
      verifyCompletedEvidence(Buffer.from(JSON.stringify(e))),
    );
  });
test("missing evidence is not completion", () =>
  assert.throws(() => verifyCompletedEvidence(Buffer.from("{}"))));
for (const method of ["POST", "PUT", "DELETE", "PATCH", "HEAD"])
  test(`retrieval cannot ${method}`, async () => {
    let count = 0;
    await assert.rejects(
      getRetrievalResult(
        request({ method }),
        () => {},
        async () => {
          count++;
        },
      ),
    );
    assert.equal(count, 0);
  });
for (const url of [
  c.resultURL + "/status",
  c.resultURL + "/cancel",
  c.resultURL + "?other=1",
  c.resultURL.replace(c.requestId, "another"),
  "https://evil.example/result",
  "http://127.0.0.1/result",
])
  test(`non-pinned result URL rejected: ${url}`, async () => {
    let n = 0;
    await assert.rejects(
      getRetrievalResult(
        request({ url }),
        () => {},
        async () => {
          n++;
        },
      ),
    );
    assert.equal(n, 0);
  });
test("body on GET forbidden", async () => {
  await assert.rejects(
    getRetrievalResult(
      request({ body: "anything" }),
      () => {},
      async () => assert.fail(),
    ),
  );
});
test("one validated result then one download; original state and accounting unchanged", async (t) => {
  const s = setup(t),
    out = await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(s.calls.length, 1);
  assert.equal(s.downloads.length, 1);
  assert.equal(out.terminal.finding, "D_STRUCTURAL_PASS");
  assert.equal(out.accounting.cumulativeReservedMicroUSD, 4150000);
  assert.equal(out.accounting.knownReportedMicroUSD, 2528000);
  assert.equal(out.accounting.falReportedMicroUSD, null);
  assert.equal(out.accounting.falReservedMicroUSD, 350000);
  assert.equal(out.accounting.unreleasedChestMicroUSD, 600000);
  assert.equal(out.attempted, 3);
  assert.equal(out.newReservations, 0);
  s.verify();
  assert.equal(s.ledger.rows("retrieval_identity")[0].actualModel, null);
  const json = readFileSync(join(s.root, "journal.jsonl"), "utf8");
  assert.ok(
    !json.includes(SECRET) &&
      !json.includes(SIGNED) &&
      !json.includes("Authorization"),
  );
  assert.equal(s.ledger.rows("retrieval_result")[0].drcReturned, "UNVERIFIED");
  s.ledger.close();
  s.ledger = new RetrievalLedger(s.root, COMMIT, s.sources, s.verify);
  await assert.rejects(
    runFalRetrieval(s.ledger, SECRET, s),
    /already_attempted/,
  );
  assert.equal(s.calls.length, 1);
  assert.equal(s.downloads.length, 1);
});
test("duplicate initialization cannot replace the anchor", (t) => {
  const s = setup(t),
    before = readFileSync(s.root + ".anchor");
  assert.throws(
    () => initializeRetrieval(s.root, COMMIT, s.sources, s.verify),
    /run_already_exists/,
  );
  assert.deepEqual(readFileSync(s.root + ".anchor"), before);
});
for (const event of [
  "reserve",
  "billing",
  "approval",
  "request",
  "receipt",
  "stop",
  "generation",
  "next",
])
  test(`retrieval journal rejects ${event}`, (t) => {
    const s = setup(t);
    assert.throws(() => s.ledger.append(event, {}));
    assert.equal(readFileSync(join(s.root, "journal.jsonl")).length, 0);
  });
for (const stage of ["status", "submit", "cancel", "chest", "world"])
  test(`no ${stage} request capability`, (t) => {
    const s = setup(t);
    begin(s);
    assert.throws(() =>
      s.ledger.append("retrieval_request", {
        stage,
        method: "GET",
        requestId: c.requestId,
        urlHash: hash(c.resultURL),
      }),
    );
  });
test("asset cannot precede a validated result", (t) => {
  const s = setup(t);
  begin(s);
  assert.throws(() =>
    s.ledger.append("retrieval_request", {
      stage: "asset",
      method: "GET",
      requestId: c.requestId,
      urlHash: hash(SIGNED),
    }),
  );
});
test("second result request rejected durably", (t) => {
  const s = setup(t);
  begin(s);
  const d = {
    stage: "result",
    method: "GET",
    requestId: c.requestId,
    urlHash: hash(c.resultURL),
  };
  s.ledger.append("retrieval_request", d);
  assert.throws(() => s.ledger.append("retrieval_request", d));
  assert.equal(s.ledger.rows("retrieval_request").length, 1);
});
for (const [field, value] of [
  ["request_id", "wrong"],
  ["request_id", null],
  ["model", "wrong"],
  ["endpoint_id", "wrong"],
  ["provider", "other"],
  ["fallback", true],
  ["model_attempts", 2],
  ["provider_attempts", 2],
  ["error", "SYNTHETIC_PROVIDER_SECRET"],
  ["error_type", "failure"],
])
  test(`invalid result ${field} cannot download`, async (t) => {
    const s = setup(t);
    s.fetcher = async () => {
      s.calls.push({});
      return response({ world_file: { url: SIGNED }, [field]: value });
    };
    const result = await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(result.terminal.finding, "A_NO_VALIDATED_RESULT");
    assert.equal(s.calls.length, 1);
    assert.equal(s.downloads.length, 0);
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes(
        "SYNTHETIC_PROVIDER_SECRET",
      ),
    );
  });
test("null model is UNKNOWN; present exact model retained", () => {
  assert.equal(validateResultIdentity({ model: null }).model, undefined);
  assert.equal(
    validateResultIdentity({
      model: c.model,
      request_id: c.requestId,
      endpoint_id: c.model,
      provider: "fal",
      fallback: false,
      provider_attempts: 1,
      model_attempts: 1,
    }).model,
    c.model,
  );
});
for (const body of [
  {},
  { world_file: null },
  { world_file: { url: "https://evil.example/model.drc" } },
  { world_file: { url: "https://fal.media/../x" } },
  { world_file: { url: "http://fal.media/x" } },
  { world_file: { url: "https://user:pass@fal.media/x" } },
  { world_file: { url: "https://127.0.0.1/x" } },
])
  test(`invalid output/URL ${JSON.stringify(body)} distinguished`, async (t) => {
    const s = setup(t);
    s.fetcher = async () => response(body);
    const r = await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(r.terminal.finding, "B_INVALID_OUTPUT_OR_ASSET_URL");
    assert.equal(s.downloads.length, 0);
  });
for (const code of [202, 301, 302, 307, 403, 500])
  test(`HTTP ${code} records safe metadata and never reads result body/downloads/retries`, async (t) => {
    const s = setup(t);
    s.fetcher = async () => {
      s.calls.push({});
      return response("SECRET_RAW_BODY", code, c.resultURL, {
        location: "https://evil.example/SECRET?token=SECRET",
      });
    };
    const r = await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(s.ledger.rows("retrieval_http")[0].httpStatus, code);
    assert.equal(s.downloads.length, 0);
    assert.equal(s.calls.length, 1);
    assert.equal(r.terminal.finding, "A_NO_VALIDATED_RESULT");
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes("SECRET"),
    );
  });
test("changed response URL never qualifies", async (t) => {
  const s = setup(t);
  s.fetcher = async () => response({}, 200, c.resultURL + "/status");
  const r = await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(r.terminal.reason, "retrieval_response_url_mismatch");
  assert.equal(s.downloads.length, 0);
});
for (const mode of ["network", "timeout", "bad-json", "oversize", "header-id"])
  test(`${mode} fails closed without retry`, async (t) => {
    const s = setup(t);
    s.fetcher = async () => {
      s.calls.push({});
      if (mode === "network" || mode === "timeout") throw Error("SECRET");
      if (mode === "bad-json") return response("not json");
      if (mode === "oversize")
        return response({}, 200, c.resultURL, {
          "content-length": String(c.limits.maxJsonBytes + 1),
        });
      return response({}, 200, c.resultURL, { "x-fal-request-id": "wrong" });
    };
    await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(s.calls.length, 1);
    assert.equal(s.downloads.length, 0);
  });
for (const [name, bytes, format] of [
  ["DRC", Buffer.from("DRACO\0synthetic"), "draco_header"],
  ["ZIP", Buffer.from([80, 75, 3, 4, 1, 2]), "zip_archive"],
  ["opaque", Buffer.from("unknown synthetic geometry"), "unknown"],
  [
    "glTF JSON",
    Buffer.from(
      '{"asset":{"version":"2.0"},"buffers":[{"uri":"https://evil.example/x"}]}',
    ),
    "gltf_json",
  ],
])
  test(`${name} retains hash/size/local bytes before unsupported stop`, async (t) => {
    const s = setup(t);
    s.download = async (req) => {
      s.downloads.push(req);
      return { status: 200, url: req.url, bytes, headers: {} };
    };
    const out = await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(out.terminal.finding, "C_UNSUPPORTED_ARTIFACT");
    assert.equal(out.terminal.providerGenerationFailure, false);
    const seen = s.ledger.rows("retrieval_asset_observation")[0];
    assert.equal(seen.bytes, bytes.length);
    assert.equal(seen.sha256, hash(bytes));
    assert.equal(seen.detectedFormat, format);
    assert.equal(seen.urlHash, hash(SIGNED));
    assert.deepEqual(s.ledger.readEvidence(hash(bytes) + ".bin"), bytes);
    const kinds = s.ledger.entries.map((e) => e.kind);
    assert.ok(
      kinds.indexOf("retrieval_asset_observation") <
        kinds.indexOf("retrieval_inspection"),
    );
    assert.equal(s.downloads.length, 1);
    await assert.rejects(runFalRetrieval(s.ledger, SECRET, s));
    assert.equal(s.downloads.length, 1);
  });
test("accepted SPZ uses existing bounded structural inspector", async (t) => {
  const s = setup(t);
  s.download = async (req) => ({
    status: 200,
    url: req.url,
    bytes: spz(),
    headers: {},
  });
  const r = await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(r.terminal.finding, "D_STRUCTURAL_PASS");
  assert.equal(s.ledger.rows("retrieval_inspection")[0].metadata.format, "spz");
});
test("malformed supported GLB is distinct from opaque unsupported output; bytes retained", async (t) => {
  const s = setup(t),
    bytes = Buffer.from("glTFbad");
  s.download = async (req) => ({
    status: 200,
    url: req.url,
    bytes,
    headers: {},
  });
  const r = await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(r.terminal.finding, "STRUCTURAL_INVALID_OR_UNVERIFIED");
  assert.equal(
    s.ledger.rows("retrieval_asset_observation")[0].sha256,
    hash(bytes),
  );
});
for (const mode of ["redirect", "changed-url", "oversize", "dns", "timeout"])
  test(`asset ${mode} stops without repeat`, async (t) => {
    const s = setup(t);
    s.download = async (req) => {
      s.downloads.push(req);
      if (mode === "dns" || mode === "timeout") throw Error("SECRET");
      return {
        status: mode === "redirect" ? 302 : 200,
        url: mode === "changed-url" ? "https://evil.example/x" : req.url,
        bytes:
          mode === "oversize" ? { length: c.limits.maxAssetBytes + 1 } : glb(),
        headers: {},
      };
    };
    const r = await runFalRetrieval(s.ledger, SECRET, s);
    assert.equal(r.terminal.finding, "ASSET_RETRIEVAL_FAILED");
    assert.equal(s.downloads.length, 1);
    assert.equal(s.ledger.rows("retrieval_asset_observation").length, 0);
  });
for (const mode of [
  "before-request",
  "after-request",
  "partial-journal",
  "missing-witness",
])
  test(`crash ${mode} cannot resume or duplicate retrieval`, async (t) => {
    const s = setup(t);
    begin(s);
    if (mode !== "before-request")
      s.ledger.append("retrieval_request", {
        stage: "result",
        method: "GET",
        requestId: c.requestId,
        urlHash: hash(c.resultURL),
      });
    s.ledger.close();
    if (mode === "partial-journal")
      writeFileSync(join(s.root, "journal.jsonl"), '{"partial":', {
        flag: "a",
      });
    if (mode === "missing-witness")
      writeFileSync(join(s.root, "witness.jsonl"), "");
    if (mode.startsWith("before") || mode.startsWith("after")) {
      s.ledger = new RetrievalLedger(s.root, COMMIT, s.sources, s.verify);
      await assert.rejects(runFalRetrieval(s.ledger, SECRET, s));
    } else
      assert.throws(
        () => new RetrievalLedger(s.root, COMMIT, s.sources, s.verify),
      );
    assert.equal(s.calls.length, 0);
    assert.throws(() =>
      initializeRetrieval(s.root, COMMIT, s.sources, s.verify),
    );
  });
test("modified source history blocks before a future request", async (t) => {
  const s = setup(t);
  writeFileSync(join(s.sources.recoveryRoot, "sentinel"), "changed");
  await assert.rejects(runFalRetrieval(s.ledger, SECRET, s));
  assert.equal(s.calls.length, 0);
});
for (const action of [
  "status",
  "observe-status",
  "next",
  "submit",
  "cancel",
  "poll",
  "chest",
  "world",
])
  test(`CLI has no ${action} action`, () => {
    const r = spawnSync(
      process.execPath,
      ["experiments/phase38-spatial/src/fal-retrieval-cli.ts", action],
      { encoding: "utf8" },
    );
    assert.notEqual(r.status, 0);
  });
test("CLI exposes no source/hash/model/URL/limit bypass; ignored local bytes only", () => {
  const cli = readFileSync(
    new URL("../src/fal-retrieval-cli.ts", import.meta.url),
    "utf8",
  );
  assert.ok(
    !cli.includes("fetch(") &&
      !cli.includes("POST") &&
      !cli.includes("--url=") &&
      !cli.includes("--model=") &&
      !cli.includes("--limits="),
  );
  const ignore = readFileSync(
    new URL("../.gitignore", import.meta.url),
    "utf8",
  );
  assert.ok(
    ignore.includes("private-fal-retrieval/\n") &&
      ignore.includes("private-fal-retrieval.anchor"),
  );
  assert.ok(!existsSync(new URL("../private-fal-retrieval", import.meta.url)));
  for (const file of readdirSync(new URL("../src", import.meta.url)).filter(
    (x) => x.startsWith("fal-retrieval"),
  )) {
    const code = readFileSync(
      new URL("../src/" + file, import.meta.url),
      "utf8",
    );
    assert.ok(!/from ["'](?:@\/|\.\.\/\.\.\/)/.test(code));
    assert.ok(
      !code.includes("runFalRecovery") && !code.includes("getRecoveryJSON"),
    );
  }
});
test("format detection does not trust extension or execute/extract content", () => {
  assert.equal(
    detectArtifact(Buffer.from("<script>doNotExecute()</script>")),
    "unknown",
  );
  assert.equal(detectArtifact(glb()), "glb");
});

test("second artifact request rejected while first attempt is active", async (t) => {
  const s = setup(t);
  s.download = async (req) => {
    s.downloads.push(req);
    assert.throws(() =>
      s.ledger.append("retrieval_request", {
        stage: "asset",
        method: "GET",
        requestId: c.requestId,
        urlHash: hash(req.url),
      }),
    );
    return { status: 200, url: req.url, bytes: glb(), headers: {} };
  };
  await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(s.downloads.length, 1);
  assert.equal(
    s.ledger.rows("retrieval_request").filter((x) => x.stage === "asset")
      .length,
    1,
  );
});
test("operation deadline prevents asset release", async (t) => {
  const s = setup(t);
  let now = 0;
  s.now = () => now;
  s.fetcher = async () => {
    s.calls.push({});
    now = c.limits.operationDeadlineMs + 1;
    return response();
  };
  const r = await runFalRetrieval(s.ledger, SECRET, s);
  assert.equal(r.terminal.reason, "retrieval_deadline");
  assert.equal(s.calls.length, 1);
  assert.equal(s.downloads.length, 0);
});
test("CLI offline inspection qualifies the current freeze and makes no request", () => {
  const p = spawnSync(
    process.execPath,
    ["experiments/phase38-spatial/src/fal-retrieval-cli.ts", "inspect"],
    { encoding: "utf8" },
  );
  assert.equal(p.status, 0, p.stderr);
  const v = JSON.parse(p.stdout);
  assert.equal(v.retrievalHash, retrievalHash);
  assert.equal(v.limits.statusReads, 0);
  assert.equal(v.limits.resultReads, 1);
  assert.equal(v.limits.artifactDownloads, 1);
  assert.equal(v.limits.submissions, 0);
});
