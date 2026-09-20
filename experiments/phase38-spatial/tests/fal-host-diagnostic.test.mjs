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
import { canonical, hash, protocolHash, protocol } from "../src/protocol.ts";
import { retrieval, retrievalHash } from "../src/fal-retrieval-contract.ts";
import { safeHTTP } from "../src/fal-recovery-contract.ts";
import {
  diagnostic as c,
  diagnosticHash,
  initializeDiagnostic,
  DiagnosticLedger,
  verifyDiagnosticEvidence,
  verifyRetrievalHistory,
} from "../src/fal-host-diagnostic-state.ts";
import {
  sanitizeWorldFile,
  classifyWorldFile,
} from "../src/fal-host-diagnostic-metadata.ts";
import {
  readDiagnosticBody,
  runHostDiagnostic,
} from "../src/fal-host-diagnostic.ts";
const SECRET = "SYNTHETIC_DIAGNOSTIC_CREDENTIAL",
  TOKEN = "SYNTHETIC_QUERY_SECRET",
  COMMIT = "1".repeat(40);
const RESULT = {
  world_file: {
    url: `https://new-cdn.fal.media/files/world.drc?token=${TOKEN}`,
    content_type: "application/octet-stream",
    file_name: "SYNTHETIC_PRIVATE_NAME.drc",
    file_size: 12345,
  },
};
const evidenceBytes = readFileSync(
  new URL("../results/fal-retrieval-001.json", import.meta.url),
);
globalThis.fetch = async () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
function reply(body = RESULT, status = 200, url = c.resultURL, headers = {}) {
  const r = new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    { status, headers },
  );
  Object.defineProperty(r, "url", { value: url });
  return r;
}
function req(other = {}) {
  return {
    method: "GET",
    url: c.resultURL,
    credential: SECRET,
    timeoutMs: 100,
    ...other,
  };
}
function setup(t) {
  const parent = mkdtempSync(join(tmpdir(), "fal-host-diagnostic-offline-")),
    root = join(parent, "diagnostic"),
    sources = {
      continuationRoot: join(parent, "continuation"),
      recoveryRoot: join(parent, "recovery"),
      retrievalRoot: join(parent, "retrieval"),
    };
  for (const p of Object.values(sources)) {
    mkdirSync(p);
    writeFileSync(join(p, "sentinel"), "IMMUTABLE_SYNTHETIC_HISTORY");
  }
  const verify = () => {
    for (const p of Object.values(sources))
      assert.equal(
        readFileSync(join(p, "sentinel"), "utf8"),
        "IMMUTABLE_SYNTHETIC_HISTORY",
      );
    return {};
  };
  initializeDiagnostic(root, COMMIT, sources, verify);
  const s = {
    parent,
    root,
    sources,
    verify,
    ledger: new DiagnosticLedger(root, COMMIT, sources, verify),
    calls: [],
  };
  // Mock reader represents a hash-matched synthetic response. Production reader computes SHA-256 from actual bytes; no CLI dependency override exists.
  s.read = async (r, record) => {
    s.calls.push(r);
    assert.equal(r.method, "GET");
    assert.equal(r.url, c.resultURL);
    record(safeHTTP("result", c.resultURL, 200, c.resultURL, null));
    return {
      bytes: Buffer.from(JSON.stringify(RESULT)),
      bodyHash: c.bindings.previousResultBodySHA256,
    };
  };
  t.after(() => {
    s.ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  return s;
}
function start(s) {
  s.ledger.append("diagnostic_begin", {
    requestId: c.requestId,
    diagnosticHash,
    started: 0,
  });
}
function historyFixture(t) {
  const parent = mkdtempSync(join(tmpdir(), "fal-diagnostic-history-")),
    root = join(parent, "private-fal-retrieval");
  mkdirSync(root);
  const e = JSON.parse(evidenceBytes),
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
  add("retrieval_begin", {
    requestId: c.requestId,
    retrievalHash,
    started: Date.parse(e.observation.startedAtUTC),
  });
  add("retrieval_request", {
    at: Date.parse(e.observation.resultRequestAtUTC),
    method: "GET",
    requestId: c.requestId,
    stage: "result",
    urlHash: e.observation.http.requestedURLHash,
  });
  add("retrieval_http", e.observation.http);
  add("retrieval_identity", e.observation.identity);
  add("retrieval_end", e.observation.terminal);
  writeFileSync(
    join(root, "journal.jsonl"),
    rows.map(canonical).join("\n") + "\n",
  );
  writeFileSync(
    join(root, "witness.jsonl"),
    rows.map((r) => r.digest).join("\n") + "\n",
  );
  const identity = {
    version: 1,
    protocolHash,
    commit: c.bindings.retrievalPreparationSHA,
    continuation: { retrievalHash, contract: retrieval },
  };
  writeFileSync(join(root, "identity.json"), canonical(identity) + "\n");
  writeFileSync(root + ".anchor", canonical(identity) + "\n");
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  return root;
}
test("exact prior successful result and finding B history required", (t) => {
  assert.equal(
    verifyDiagnosticEvidence(evidenceBytes).observation.identity.bodyHash,
    c.bindings.previousResultBodySHA256,
  );
  assert.equal(
    verifyRetrievalHistory(historyFixture(t)).retrievalTerminalDigest,
    c.bindings.retrievalTerminalDigest,
  );
});
for (const p of [
  "journal.jsonl",
  "witness.jsonl",
  "identity.json",
  "../private-fal-retrieval.anchor",
])
  test(`prior ${p} alteration rejected`, (t) => {
    const root = historyFixture(t);
    writeFileSync(join(root, p), "changed");
    assert.throws(() => verifyRetrievalHistory(root));
  });
for (const key of [
  "executionSHA",
  "requestId",
  "retrievalHash",
  "requestedModel",
  "originalProtocolHash",
  "completedStatusEvidenceCommit",
])
  test(`altered evidence ${key} rejected`, () => {
    const e = JSON.parse(evidenceBytes);
    e[key] = "wrong";
    assert.throws(() =>
      verifyDiagnosticEvidence(Buffer.from(JSON.stringify(e))),
    );
  });
for (const method of ["POST", "PUT", "DELETE", "PATCH", "HEAD"])
  test(`diagnostic cannot ${method}`, async () => {
    let n = 0;
    await assert.rejects(
      readDiagnosticBody(
        req({ method }),
        () => {},
        async () => {
          n++;
        },
      ),
    );
    assert.equal(n, 0);
  });
for (const url of [
  c.resultURL + "/status",
  c.resultURL + "/cancel",
  c.resultURL + "?x=1",
  c.resultURL.replace(c.requestId, "another"),
  "https://fal.media/files/world.drc",
  "https://api.worldlabs.ai/marble/v1/worlds/test",
  "https://evil.example/result",
])
  test(`no arbitrary/poll/asset route ${url}`, async () => {
    let n = 0;
    await assert.rejects(
      readDiagnosticBody(
        req({ url }),
        () => {},
        async () => {
          n++;
        },
      ),
    );
    assert.equal(n, 0);
  });
test("GET body rejected before any transport", async () => {
  await assert.rejects(
    readDiagnosticBody(
      req({ body: "anything" }),
      () => {},
      async () => assert.fail(),
    ),
  );
});
test("real diagnostic reader computes the exact body hash with manual redirects", async () => {
  const bytes = Buffer.from(JSON.stringify(RESULT)),
    events = [];
  const r = await readDiagnosticBody(
    req(),
    (x) => events.push(x),
    async (url, init) => {
      assert.equal(url, c.resultURL);
      assert.equal(init.method, "GET");
      assert.equal(init.redirect, "manual");
      return reply();
    },
  );
  assert.equal(r.bodyHash, hash(bytes));
  assert.deepEqual(r.bytes, bytes);
  assert.equal(events[0].httpStatus, 200);
});
for (const body of [RESULT, "MALFORMED JSON CHANGED BODY"])
  test(`changed body stops BEFORE any interpretation (${typeof body})`, async (t) => {
    const s = setup(t);
    s.read = (r, record) =>
      readDiagnosticBody(r, record, async () => {
        s.calls.push(r);
        return reply(body);
      });
    const result = await runHostDiagnostic(s.ledger, SECRET, s);
    assert.equal(result.terminal.reason, "changed_provider_result");
    assert.equal(s.ledger.rows("diagnostic_body")[0].matchesPrevious, false);
    assert.equal(s.ledger.rows("diagnostic_identity").length, 0);
    assert.equal(s.ledger.rows("diagnostic_descriptor").length, 0);
    assert.equal(s.calls.length, 1);
  });
test("matching result retains sanitized metadata then classifies new provider-looking hostname", async (t) => {
  const s = setup(t),
    result = await runHostDiagnostic(s.ledger, SECRET, s),
    m = s.ledger.rows("diagnostic_descriptor")[0];
  assert.equal(m.hostname, "new-cdn.fal.media");
  assert.equal(m.hostnameSHA256, hash(m.hostname));
  assert.equal(m.urlSHA256, hash(RESULT.world_file.url));
  assert.equal(m.pathname, "/files/world.drc");
  assert.equal(m.queryPresent, true);
  assert.equal(m.fileExtension, "drc");
  assert.equal(m.fileSize, 12345);
  assert.equal(
    result.terminal.classification,
    "new_same_provider_looking_host_requires_review",
  );
  assert.equal(result.terminal.downloadAuthorized, false);
  assert.equal(result.downloads, 0);
  const raw = readFileSync(join(s.root, "journal.jsonl"), "utf8");
  for (const secret of [
    TOKEN,
    SECRET,
    RESULT.world_file.url,
    "SYNTHETIC_PRIVATE_NAME",
    "Authorization",
  ])
    assert.ok(!raw.includes(secret));
  assert.deepEqual(readdirSync(join(s.root, "evidence")), []);
  s.verify();
});
for (const [url, classification] of [
  ["https://fal.media/files/world.glb", "currently_allowed_host"],
  [
    "https://new.fal.media/files/world.drc",
    "new_same_provider_looking_host_requires_review",
  ],
  [
    "https://new.fal.run/files/world.drc",
    "new_same_provider_looking_host_requires_review",
  ],
  [
    "https://fal.media.evil.example/files/world.drc",
    "clearly_unapproved_or_unsafe_host",
  ],
  [
    "https://evil-fal.media/files/world.drc",
    "clearly_unapproved_or_unsafe_host",
  ],
  [
    "https://unreviewed.example/files/world.drc",
    "clearly_unapproved_or_unsafe_host",
  ],
])
  test(`host classification only: ${url}`, () => {
    const before = canonical(protocol.assetHosts);
    const m = sanitizeWorldFile({ url });
    assert.equal(classifyWorldFile(url, m).classification, classification);
    assert.equal(canonical(protocol.assetHosts), before);
  });
for (const url of [
  "http://fal.media/files/world.drc",
  "https://user:SECRET@fal.media/files/world.drc",
  "https://fal.media:443/files/world.drc",
  "https://fal.media:8443/files/world.drc",
  "https://fal.media/files/world.drc#SECRET",
  "https://fal.media/a/../world.drc",
  "https://fal.media/%2e%2e/world.drc",
  "https://127.0.0.1/files/world.drc",
  "https://[::1]/files/world.drc",
  "https://localhost/files/world.drc",
  "file:///SECRET",
  "not a url",
  "",
])
  test(`unsafe URL recorded safely and stopped: ${url}`, async (t) => {
    const s = setup(t);
    s.read = async (r, record) => {
      s.calls.push(r);
      record(safeHTTP("result", c.resultURL, 200, c.resultURL, null));
      return {
        bodyHash: c.bindings.previousResultBodySHA256,
        bytes: Buffer.from(JSON.stringify({ world_file: { url } })),
      };
    };
    const result = await runHostDiagnostic(s.ledger, SECRET, s);
    assert.equal(
      result.terminal.classification,
      "clearly_unapproved_or_unsafe_host",
    );
    assert.equal(result.terminal.status, "STOPPED_AWAITING_OWNER_REVIEW");
    assert.equal(s.calls.length, 1);
    assert.equal(result.downloads, 0);
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes("SECRET"),
    );
  });
test("credential and explicit default port presence retained without values", () => {
  const m = sanitizeWorldFile({
    url: "https://secret:password@fal.media:443/files/world.drc?token=secret#hidden",
  });
  assert.equal(m.credentialsPresent, true);
  assert.equal(m.explicitPortPresent, true);
  assert.equal(m.fragmentPresent, true);
  assert.equal(m.queryPresent, true);
  for (const s of ["password", "token=secret", "hidden"])
    assert.ok(!JSON.stringify(m).includes(s));
});
test("only coarse safe path or path hash is retained", () => {
  const url =
    "https://fal.media/SECRET_TOKEN/value/private-user-file.drc?SECRET_TOKEN";
  const m = sanitizeWorldFile({ url });
  assert.equal(m.pathname, null);
  assert.equal(m.pathSHA256, hash(new URL(url).pathname));
  assert.ok(!JSON.stringify(m).includes("SECRET_TOKEN"));
});
for (const size of [
  -1,
  1.5,
  "123",
  null,
  NaN,
  Infinity,
  c.limits.maxReportedFileBytes + 1,
])
  test(`invalid reported file size ${size} omitted`, () =>
    assert.equal(
      sanitizeWorldFile({ url: RESULT.world_file.url, file_size: size })
        .fileSize,
      null,
    ));
for (const type of [
  "text/html; token=SECRET",
  "SECRET",
  "a/" + "x".repeat(100),
  "application/SECRET",
])
  test(`unsafe content type ${type} omitted`, () =>
    assert.equal(sanitizeWorldFile({ content_type: type }).contentType, null));
test("only extension classification, no arbitrary names or descriptor fields", () => {
  const m = sanitizeWorldFile({
    url: RESULT.world_file.url,
    file_name: "SECRET/name.DRC",
    content_type: "model/gltf-binary",
    file_size: 0,
    arbitrary: "SECRET",
  });
  assert.equal(m.fileExtension, "drc");
  assert.equal(m.contentType, "model/gltf-binary");
  assert.equal(m.fileSize, 0);
  assert.ok(!JSON.stringify(m).includes("SECRET"));
  assert.equal(
    sanitizeWorldFile({ file_name: "secret.env" }).fileExtension,
    null,
  );
});
test("oversized/malformed URLs remain bounded metadata", () => {
  const m = sanitizeWorldFile({
    url: "https://" + "x".repeat(10000) + "?SECRET",
  });
  assert.equal(m.hostname, null);
  assert.equal(m.pathname, null);
  assert.ok(JSON.stringify(m).length < 1000);
  assert.ok(!JSON.stringify(m).includes("SECRET"));
});
for (const [field, value] of [
  ["request_id", "wrong"],
  ["model", "wrong"],
  ["endpoint_id", "wrong"],
  ["provider", "other"],
  ["fallback", true],
  ["provider_attempts", 2],
  ["model_attempts", 2],
  ["error", "SECRET"],
])
  test(`same-hash mock still applies result identity ${field}`, async (t) => {
    const s = setup(t);
    s.read = async (r, record) => {
      record(safeHTTP("result", c.resultURL, 200, c.resultURL, null));
      return {
        bodyHash: c.bindings.previousResultBodySHA256,
        bytes: Buffer.from(JSON.stringify({ ...RESULT, [field]: value })),
      };
    };
    const out = await runHostDiagnostic(s.ledger, SECRET, s);
    assert.equal(out.terminal.status, "STOPPED_AWAITING_OWNER_REVIEW");
    assert.equal(s.ledger.rows("diagnostic_descriptor").length, 0);
  });
for (const code of [202, 301, 302, 307, 403, 500])
  test(`HTTP ${code} stops without body interpretation or redirects`, async (t) => {
    const s = setup(t);
    s.read = (r, record) =>
      readDiagnosticBody(r, record, async () => {
        s.calls.push(r);
        return reply("SECRET", code, c.resultURL, {
          location: "https://evil.example/SECRET?token=SECRET",
        });
      });
    const result = await runHostDiagnostic(s.ledger, SECRET, s);
    assert.equal(s.calls.length, 1);
    assert.equal(s.ledger.rows("diagnostic_http")[0].httpStatus, code);
    assert.equal(s.ledger.rows("diagnostic_body").length, 0);
    assert.equal(result.downloads, 0);
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl"), "utf8").includes("SECRET"),
    );
  });
for (const mode of ["network", "changed-url", "size", "header"])
  test(`transport ${mode} fails closed`, async (t) => {
    const s = setup(t);
    s.read = (r, record) =>
      readDiagnosticBody(r, record, async () => {
        s.calls.push(r);
        if (mode === "network") throw Error("SECRET");
        if (mode === "changed-url")
          return reply(RESULT, 200, c.resultURL + "/status");
        return reply(
          RESULT,
          200,
          c.resultURL,
          mode === "size"
            ? { "content-length": String(c.limits.maxJsonBytes + 1) }
            : { "x-fal-request-id": "wrong" },
        );
      });
    await runHostDiagnostic(s.ledger, SECRET, s);
    assert.equal(s.calls.length, 1);
    assert.equal(s.ledger.rows("diagnostic_descriptor").length, 0);
  });
test("duplicate initialization and observation cannot reset or repeat", async (t) => {
  const s = setup(t),
    anchor = readFileSync(s.root + ".anchor");
  assert.throws(() =>
    initializeDiagnostic(s.root, COMMIT, s.sources, s.verify),
  );
  await runHostDiagnostic(s.ledger, SECRET, s);
  s.ledger.close();
  s.ledger = new DiagnosticLedger(s.root, COMMIT, s.sources, s.verify);
  await assert.rejects(runHostDiagnostic(s.ledger, SECRET, s));
  assert.equal(s.calls.length, 1);
  assert.deepEqual(readFileSync(s.root + ".anchor"), anchor);
});
for (const kind of [
  "reserve",
  "billing",
  "approval",
  "request",
  "evidence",
  "download",
  "generation",
  "next",
])
  test(`journal cannot mutate ${kind}`, (t) => {
    const s = setup(t);
    assert.throws(() => s.ledger.append(kind, {}));
    assert.equal(readFileSync(join(s.root, "journal.jsonl")).length, 0);
  });
for (const stage of ["status", "asset", "chest", "world", "submit"])
  test(`no ${stage} request`, (t) => {
    const s = setup(t);
    start(s);
    assert.throws(() =>
      s.ledger.append("diagnostic_request", {
        method: "GET",
        stage,
        requestId: c.requestId,
        urlHash: hash(c.resultURL),
      }),
    );
  });
test("second result read and changed-body interpretation rejected by journal", (t) => {
  const s = setup(t);
  start(s);
  const d = {
    method: "GET",
    stage: "result",
    requestId: c.requestId,
    urlHash: hash(c.resultURL),
  };
  s.ledger.append("diagnostic_request", d);
  assert.throws(() => s.ledger.append("diagnostic_request", d));
  s.ledger.append(
    "diagnostic_http",
    safeHTTP("result", c.resultURL, 200, c.resultURL, null),
  );
  s.ledger.append("diagnostic_body", {
    bodyHash: hash("changed"),
    matchesPrevious: false,
  });
  assert.throws(() =>
    s.ledger.append("diagnostic_identity", { requestId: c.requestId }),
  );
});
test("partial/crashed diagnostic cannot resume or reset", async (t) => {
  const s = setup(t);
  start(s);
  s.ledger.close();
  s.ledger = new DiagnosticLedger(s.root, COMMIT, s.sources, s.verify);
  await assert.rejects(runHostDiagnostic(s.ledger, SECRET, s));
  assert.throws(() =>
    initializeDiagnostic(s.root, COMMIT, s.sources, s.verify),
  );
  assert.equal(s.calls.length, 0);
});
test("corrupt witness fails closed", (t) => {
  const s = setup(t);
  start(s);
  s.ledger.close();
  writeFileSync(join(s.root, "witness.jsonl"), "");
  assert.throws(
    () => new DiagnosticLedger(s.root, COMMIT, s.sources, s.verify),
  );
});
test("history/accounting untouched, descriptor recorded before classification", async (t) => {
  const s = setup(t),
    r = await runHostDiagnostic(s.ledger, SECRET, s);
  s.verify();
  assert.equal(r.newReservations, 0);
  assert.equal(r.newGenerations, 0);
  assert.equal(r.attempted, 3);
  assert.equal(r.reservedMicroUSD, 4150000);
  assert.equal(r.knownReportedMicroUSD, 2528000);
  assert.equal(r.reportedMicroUSD, null);
  assert.equal(r.accounting.falReservedMicroUSD, 350000);
  assert.equal(r.accounting.unreleasedChestMicroUSD, 600000);
  const kinds = s.ledger.entries.map((x) => x.kind);
  assert.ok(
    kinds.indexOf("diagnostic_descriptor") < kinds.indexOf("diagnostic_end"),
  );
});
for (const action of [
  "status",
  "poll",
  "download",
  "retrieve",
  "next",
  "submit",
  "cancel",
  "chest",
  "world",
])
  test(`CLI refuses ${action}`, () => {
    const p = spawnSync(
      process.execPath,
      ["experiments/phase38-spatial/src/fal-host-diagnostic-cli.ts", action],
      { encoding: "utf8" },
    );
    assert.notEqual(p.status, 0);
  });
test("offline inspect verifies freeze; no downloader or DNS imported/exposed", () => {
  const p = spawnSync(
    process.execPath,
    ["experiments/phase38-spatial/src/fal-host-diagnostic-cli.ts", "inspect"],
    { encoding: "utf8" },
  );
  assert.equal(p.status, 0, p.stderr);
  const v = JSON.parse(p.stdout);
  assert.equal(v.diagnosticHash, diagnosticHash);
  assert.equal(v.limits.artifactDownloads, 0);
  assert.equal(v.limits.resultReads, 1);
  assert.equal(v.limits.statusReads, 0);
  for (const file of readdirSync(new URL("../src", import.meta.url)).filter(
    (x) => x.startsWith("fal-host-diagnostic"),
  )) {
    const text = readFileSync(
      new URL("../src/" + file, import.meta.url),
      "utf8",
    );
    assert.ok(!/from ["'](?:node:dns|.*asset-download|.*outputs)/.test(text));
    assert.ok(
      !/runFalRetrieval|runFalRecovery|getRetrievalResult|--url=|--model=/.test(
        text,
      ),
    );
  }
  assert.ok(
    !existsSync(new URL("../private-fal-host-diagnostic", import.meta.url)),
  );
});
