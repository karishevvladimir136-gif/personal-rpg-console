import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { deflateRawSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { hash, canonical } from "../src/protocol.ts";
import { safeHTTP } from "../src/fal-recovery-contract.ts";
import { sanitizeWorldFile } from "../src/fal-host-diagnostic-metadata.ts";
import {
  artifact as c,
  artifactHash,
  qualifyArtifact,
  validateDescriptor,
  capabilityURL,
} from "../src/fal-artifact-contract.ts";
import {
  verifyArtifactEvidence,
  verifyArtifactSources,
  initializeArtifact,
  ArtifactLedger,
} from "../src/fal-artifact-state.ts";
import {
  streamArtifact,
  openPinnedAsset,
} from "../src/fal-artifact-download.ts";
import { inspectWorldZIP, crc32 } from "../src/fal-artifact-zip.ts";
import { runExactArtifact } from "../src/fal-artifact.ts";
const COMMIT = "1".repeat(40),
  TOKEN = "SYNTHETIC_QUERY_TOKEN",
  SECRET = "SYNTHETIC_FAL_SECRET";
globalThis.fetch = async () => {
  throw Error("OFFLINE_FETCH_FORBIDDEN");
};
function temp(t) {
  const p = mkdtempSync(join(tmpdir(), "phase38-exact-artifact-test-"));
  t.after(() => rmSync(p, { recursive: true, force: true }));
  return p;
}
function fixture(bytes = Buffer.from("SYNTHETIC_ZIP_BYTES")) {
  const body = {
    world_file: {
      url: `https://storage.googleapis.com/synthetic/world.zip?token=${TOKEN}`,
      content_type: "application/octet-stream",
      file_name: "SYNTHETIC_PRIVATE_NAME.zip",
      file_size: bytes.length,
    },
  };
  const raw = Buffer.from(JSON.stringify(body)),
    pins = {
      ...c,
      resultBodySHA256: hash(raw),
      descriptor: sanitizeWorldFile(body.world_file),
    };
  return { body, raw, pins, cap: qualifyArtifact(raw, pins).cap, bytes };
}
const descriptorCases = [
  [
    "hostname",
    (d) =>
      (d.url = d.url.replace("storage.googleapis.com", "elsewhere.example")),
    "artifact_hostname",
  ],
  [
    "same host different object",
    (d) => (d.url = d.url.replace("world.zip", "another.zip")),
    "artifact_path_hash",
  ],
  [
    "query missing",
    (d) => (d.url = d.url.split("?")[0]),
    "artifact_query_required",
  ],
  ["query changed", (d) => (d.url += "x"), "artifact_url_hash"],
  ["fragment", (d) => (d.url += "#x"), "artifact_port_or_fragment"],
  [
    "embedded credentials",
    (d) => (d.url = d.url.replace("https://", "https://user:pass@")),
    "artifact_credentials_or_scheme",
  ],
  [
    "nonstandard port",
    (d) => (d.url = d.url.replace(".com/", ".com:8443/")),
    "artifact_port_or_fragment",
  ],
  [
    "explicit standard port",
    (d) => (d.url = d.url.replace(".com/", ".com:443/")),
    "artifact_port_or_fragment",
  ],
  [
    "HTTP",
    (d) => (d.url = d.url.replace("https:", "http:")),
    "artifact_https_required",
  ],
  [
    "slash encoding",
    (d) => (d.url = d.url.replace("world.zip", "world%2f.zip")),
    "artifact_unsafe_path",
  ],
  [
    "percent double encoding",
    (d) => (d.url = d.url.replace("world.zip", "world%252e.zip")),
    "artifact_unsafe_path",
  ],
  [
    "backslash",
    (d) => (d.url = d.url.replace("world.zip", "world\\x.zip")),
    "artifact_https_required",
  ],
  ["size", (d) => d.file_size++, "artifact_reported_size"],
  ["type", (d) => (d.content_type = "text/html"), "artifact_content_type"],
  ["extension", (d) => (d.file_name = "world.exe"), "artifact_extension"],
];
for (const [name, mutate, reason] of descriptorCases)
  test(`exact artifact rejects ${name}`, () => {
    const f = fixture();
    mutate(f.body.world_file);
    assert.throws(
      () => validateDescriptor(f.body.world_file, f.pins.descriptor),
      new RegExp(reason),
    );
  });
for (const key of ["hostnameSHA256", "urlSHA256", "pathSHA256"])
  test(`exact artifact rejects mismatched ${key}`, () => {
    const f = fixture();
    assert.throws(() =>
      validateDescriptor(f.body.world_file, {
        ...f.pins.descriptor,
        [key]: "0".repeat(64),
      }),
    );
  });
test("capability requires exact body before interpretation and retains no public URL", () => {
  const f = fixture();
  assert.throws(
    () => qualifyArtifact(Buffer.from("{"), f.pins),
    /artifact_changed_result_body/,
  );
  assert.throws(() => qualifyArtifact(f.raw), /artifact_changed_result_body/);
  assert.equal(capabilityURL(f.cap), f.body.world_file.url);
  assert.equal(JSON.stringify(f.cap).includes(TOKEN), false);
  assert.throws(
    () => capabilityURL({ ...f.cap }),
    /artifact_provenance_required/,
  );
});
for (const [key, value] of [
  ["request_id", "wrong"],
  ["model", "wrong"],
  ["provider", "other"],
  ["fallback", true],
  ["provider_attempts", 2],
  ["model_attempts", 2],
])
  test(`optional identity rejects ${key}`, () => {
    const f = fixture();
    f.body[key] = value;
    const b = Buffer.from(JSON.stringify(f.body));
    assert.throws(() =>
      qualifyArtifact(b, { ...f.pins, resultBodySHA256: hash(b) }),
    );
  });
test("accepted evidence bindings are exact", () => {
  const b = readFileSync(
    new URL("../results/fal-host-diagnostic-001.json", import.meta.url),
  );
  assert.equal(
    verifyArtifactEvidence(b).executionSHA,
    "adebc5e5d9c8e83c1ed6ace277582147b37d5901",
  );
  assert.equal(hash(b), c.sourceEvidenceSHA256);
  assert.equal(
    c.sourceEvidenceCommit,
    "745ee77f32ca61f795948f1292f7921d4fe406e7",
  );
  assert.throws(
    () => verifyArtifactEvidence(Buffer.concat([b, Buffer.from(" ")])),
    /artifact_evidence_hash/,
  );
});
function assetReply(bytes, overrides = {}) {
  return {
    status: 200,
    headers: {
      "content-length": String(bytes.length),
      "content-type": "application/octet-stream",
    },
    body: (async function* () {
      for (let i = 0; i < bytes.length; i += 3) yield bytes.subarray(i, i + 3);
    })(),
    destroy() {},
    ...overrides,
  };
}
test("stream writes private artifact with SHA, exact bytes and one use only", async (t) => {
  const root = temp(t),
    f = fixture();
  let calls = 0;
  const records = [];
  const open = async (cap) => {
    calls++;
    assert.equal(cap, f.cap);
    return assetReply(f.bytes);
  };
  const r = await streamArtifact(f.cap, root, (...e) => records.push(e), {
    open,
  });
  assert.equal(calls, 1);
  assert.equal(r.sha256, hash(f.bytes));
  assert.equal(r.bytes, f.bytes.length);
  assert.deepEqual(readFileSync(r.path), f.bytes);
  assert.equal(existsSync(join(root, "artifact.zip.partial")), false);
  await assert.rejects(
    streamArtifact(f.cap, root, () => {}, { open }),
    /artifact_capability_consumed/,
  );
  assert.equal(calls, 1);
  assert.equal(JSON.stringify(records).includes(TOKEN), false);
});
for (const [name, overrides, reason] of [
  ["redirect", { status: 302 }, "artifact_asset_http_or_redirect"],
  ["HTTP failure", { status: 403 }, "artifact_asset_http_or_redirect"],
  [
    "content length",
    { headers: { "content-length": "999" } },
    "artifact_content_length",
  ],
  [
    "invalid length",
    { headers: { "content-length": "10x" } },
    "artifact_content_length",
  ],
  [
    "HTML MIME",
    { headers: { "content-type": "text/html" } },
    "artifact_asset_content_type",
  ],
  [
    "transfer encoding",
    { headers: { "content-encoding": "gzip" } },
    "artifact_content_encoding",
  ],
])
  test(`stream rejects ${name} and never retries`, async (t) => {
    const f = fixture(),
      root = temp(t),
      events = [];
    let calls = 0;
    const open = async () => {
      calls++;
      return assetReply(f.bytes, overrides);
    };
    await assert.rejects(
      streamArtifact(f.cap, root, (...e) => events.push(e), { open }),
      new RegExp(reason),
    );
    assert.equal(events.at(-1)[1].complete, false);
    await assert.rejects(streamArtifact(f.cap, root, () => {}, { open }));
    assert.equal(calls, 1);
  });
test("absent Content-Length accepted only on exact final size", async (t) => {
  const f = fixture();
  await streamArtifact(f.cap, temp(t), () => {}, {
    open: async () => assetReply(f.bytes, { headers: {} }),
  });
});
test("overflow stops with bounded retained partial evidence", async (t) => {
  const f = fixture(),
    root = temp(t),
    events = [];
  await assert.rejects(
    streamArtifact(f.cap, root, (...e) => events.push(e), {
      maxBytes: f.bytes.length,
      open: async () =>
        assetReply(Buffer.alloc(f.bytes.length + 5), { headers: {} }),
    }),
    /artifact_byte_overflow/,
  );
  const e = events.at(-1)[1];
  assert.equal(e.complete, false);
  assert.ok(e.bytes <= f.bytes.length);
  assert.equal(
    e.sha256,
    hash(readFileSync(join(root, "artifact.zip.partial"))),
  );
});
test("partial transport failure is durable and cannot be retried with same or freshly minted capability", async (t) => {
  const f = fixture(),
    root = temp(t),
    events = [];
  let calls = 0;
  const open = async () => {
    calls++;
    return assetReply(f.bytes, {
      headers: {},
      body: (async function* () {
        yield f.bytes.subarray(0, 5);
        throw Error(TOKEN);
      })(),
    });
  };
  await assert.rejects(
    streamArtifact(f.cap, root, (...e) => events.push(e), { open }),
    /artifact_stream_failure/,
  );
  assert.equal(events.at(-1)[1].bytes, 5);
  assert.equal(JSON.stringify(events).includes(TOKEN), false);
  await assert.rejects(streamArtifact(f.cap, root, () => {}, { open }));
  await assert.rejects(
    streamArtifact(qualifyArtifact(f.raw, f.pins).cap, root, () => {}, {
      open,
    }),
  );
  assert.equal(calls, 1);
});
test("truncated final size rejected", async (t) => {
  const f = fixture();
  await assert.rejects(
    streamArtifact(f.cap, temp(t), () => {}, {
      open: async () => assetReply(f.bytes.subarray(0, 2), { headers: {} }),
    }),
    /artifact_final_size/,
  );
});
for (const address of [
  "127.0.0.1",
  "10.0.0.1",
  "169.254.169.254",
  "::1",
  "::ffff:127.0.0.1",
])
  test(`asset DNS rejects ${address} before connection`, async () => {
    let connections = 0;
    await assert.rejects(
      openPinnedAsset(
        fixture().cap,
        500,
        async () => [{ address, family: address.includes(":") ? 6 : 4 }],
        () => {
          connections++;
        },
      ),
      /artifact_non_public_destination/,
    );
    assert.equal(connections, 0);
  });
test("mixed public/private DNS and excessive answers fail closed", async () => {
  for (const answer of [
    [
      { address: "8.8.8.8", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ],
    Array.from({ length: 33 }, () => ({ address: "8.8.8.8", family: 4 })),
  ])
    await assert.rejects(
      openPinnedAsset(
        fixture().cap,
        500,
        async () => answer,
        () => assert.fail("connect"),
      ),
      /artifact_non_public_destination/,
    );
});
test("pinned HTTPS uses no auth, no fallback DNS/address, one request and validates TLS", async () => {
  const f = fixture();
  let resolves = 0,
    connects = 0;
  const reply = await openPinnedAsset(
    f.cap,
    1000,
    async (host) => {
      resolves++;
      assert.equal(host, "storage.googleapis.com");
      return [{ address: "8.8.8.8", family: 4 }];
    },
    (url, options, cb) => {
      connects++;
      assert.equal(String(url), f.body.world_file.url);
      assert.deepEqual(options.headers, {});
      assert.equal(options.method, "GET");
      assert.equal(options.agent, false);
      assert.equal(options.autoSelectFamily, false);
      assert.equal(options.rejectUnauthorized, true);
      options.lookup("storage.googleapis.com", {}, (error, ip) => {
        assert.equal(error, null);
        assert.equal(ip, "8.8.8.8");
      });
      const req = new EventEmitter();
      req.destroy = () => {};
      req.end = () => cb({ statusCode: 302, headers: {}, destroy() {} });
      return req;
    },
  );
  assert.equal(reply.status, 302);
  assert.equal(resolves, 1);
  assert.equal(connects, 1);
  reply.destroy();
});
function setup(t) {
  const parent = mkdtempSync(join(tmpdir(), "phase38-exact-ledger-test-")),
    root = join(parent, "private-fal-artifact"),
    sources = {
      continuationRoot: join(parent, "old"),
      recoveryRoot: join(parent, "status"),
      retrievalRoot: join(parent, "retrieval"),
      diagnosticRoot: join(parent, "diagnostic"),
    };
  for (const p of Object.values(sources)) {
    mkdirSync(p);
    writeFileSync(join(p, "sentinel"), "IMMUTABLE");
  }
  const verify = () => {
    for (const p of Object.values(sources))
      assert.equal(readFileSync(join(p, "sentinel"), "utf8"), "IMMUTABLE");
    return {};
  };
  initializeArtifact(root, COMMIT, sources, verify);
  const ledger = new ArtifactLedger(root, COMMIT, sources, verify);
  t.after(() => {
    ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  return { root, sources, verify, ledger };
}
function mocks() {
  let downloads = 0;
  return {
    get downloads() {
      return downloads;
    },
    read: async (_r, record) => {
      record(safeHTTP("result", c.resultURL, 200, c.resultURL, null));
      return {
        bytes: Buffer.from("SYNTHETIC_INJECTED_TEST_RESULT"),
        bodyHash: c.resultBodySHA256,
      };
    },
    qualify: () => ({
      cap: {
        urlHash: c.descriptor.urlSHA256,
        expectedBytes: c.descriptor.fileSize,
      },
      identity: {
        requestId: c.requestId,
        actualModel: null,
        providerReportedRequestId: null,
      },
      descriptor: c.descriptor,
    }),
    download: async (_cap, _root, record) => {
      downloads++;
      record("artifact_http", { stage: "asset", httpStatus: 200 });
      record("artifact_file", {
        complete: true,
        bytes: 85481294,
        sha256: "1".repeat(64),
        file: "artifact.zip",
      });
      return {
        path: "SYNTHETIC",
        bytes: 85481294,
        sha256: "1".repeat(64),
        file: "artifact.zip",
        complete: true,
      };
    },
    inspect: async (_path, _limits, record) => {
      const inventory = { entryCount: 1 };
      record(inventory);
      return {
        inventory,
        inspection: { drcPresent: true, structuralUsability: "UNVERIFIED" },
      };
    },
  };
}
test("one result and one artifact maximum; success remains manual stop and no accounting change", async (t) => {
  const s = setup(t),
    m = mocks();
  const out = await runExactArtifact(s.ledger, SECRET, m);
  assert.equal(out.terminal.status, "RETRIEVED_AWAITING_OWNER_REVIEW");
  assert.equal(out.terminal.approval, false);
  assert.equal(out.terminal.nextReleased, false);
  assert.equal(out.apiRequests, 1);
  assert.equal(out.assetAttempts, 1);
  assert.equal(m.downloads, 1);
  assert.equal(out.accounting.cumulativeReservedMicroUSD, 4150000);
  assert.equal(out.accounting.knownReportedMicroUSD, 2528000);
  assert.equal(out.accounting.falReportedMicroUSD, null);
  assert.equal(out.newReservations, 0);
  await assert.rejects(
    runExactArtifact(s.ledger, SECRET, m),
    /artifact_already_attempted/,
  );
  assert.equal(m.downloads, 1);
  assert.equal(JSON.stringify(s.ledger.entries).includes(SECRET), false);
});
test("changed body stops before any interpretation or asset operation", async (t) => {
  const s = setup(t),
    m = mocks();
  m.read = async (_r, record) => {
    record(safeHTTP("result", c.resultURL, 200, c.resultURL, null));
    return { bytes: Buffer.from("{"), bodyHash: hash("{") };
  };
  m.qualify = () => assert.fail("interpretation");
  const r = await runExactArtifact(s.ledger, SECRET, m);
  assert.equal(r.terminal.reason, "artifact_changed_result_body");
  assert.equal(r.assetAttempts, 0);
  assert.equal(m.downloads, 0);
});
for (const stage of ["read", "qualify", "download", "inspect"])
  test(`failure in ${stage} stops permanently`, async (t) => {
    const s = setup(t),
      m = mocks();
    m[stage] = async () => {
      throw Error("SYNTHETIC_UNSAFE_EXCEPTION");
    };
    if (stage === "qualify")
      m.qualify = () => {
        throw Error("SYNTHETIC_UNSAFE_EXCEPTION");
      };
    const out = await runExactArtifact(s.ledger, SECRET, m);
    assert.equal(out.terminal.status, "STOPPED_AWAITING_OWNER_REVIEW");
    await assert.rejects(runExactArtifact(s.ledger, SECRET, m));
    assert.equal(
      JSON.stringify(s.ledger.entries).includes("SYNTHETIC_UNSAFE_EXCEPTION"),
      false,
    );
  });
test("reopen cannot repeat attempt; init cannot reset identity; old histories unchanged", async (t) => {
  const s = setup(t),
    m = mocks();
  await runExactArtifact(s.ledger, SECRET, m);
  s.ledger.close();
  const again = new ArtifactLedger(s.root, COMMIT, s.sources, s.verify);
  await assert.rejects(runExactArtifact(again, SECRET, m));
  again.close();
  assert.throws(
    () => initializeArtifact(s.root, COMMIT, s.sources, s.verify),
    /run_already_exists/,
  );
  assert.equal(m.downloads, 1);
  s.verify();
});
for (const kind of [
  "reserve",
  "billing",
  "request",
  "review",
  "approve",
  "next",
  "evidence",
])
  test(`ledger refuses unapproved ${kind} mutation`, (t) => {
    const s = setup(t);
    assert.throws(() => s.ledger.append(kind, {}), /artifact_event_forbidden/);
  });
function zip(entries) {
  const locals = [],
    centrals = [];
  let offset = 0;
  for (const en of entries) {
    const b = en.bytes ?? Buffer.from("synthetic"),
      name = Buffer.from(en.name ?? "world.drc"),
      method = en.method ?? 0,
      compressed = method === 8 ? deflateRawSync(b) : b,
      crc = en.crc ?? crc32(b),
      flags = en.flags ?? 0x800,
      l = Buffer.alloc(30);
    l.writeUInt32LE(0x04034b50);
    l.writeUInt16LE(20, 4);
    l.writeUInt16LE(flags, 6);
    l.writeUInt16LE(method, 8);
    l.writeUInt32LE(crc, 14);
    l.writeUInt32LE(compressed.length, 18);
    l.writeUInt32LE(en.size ?? b.length, 22);
    l.writeUInt16LE(name.length, 26);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50);
    cd.writeUInt16LE(0x314, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(flags, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compressed.length, 20);
    cd.writeUInt32LE(en.size ?? b.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(en.attr ?? (0x81a4 << 16) >>> 0, 38);
    cd.writeUInt32LE(offset, 42);
    locals.push(l, name, compressed);
    centrals.push(cd, name);
    offset += l.length + name.length + compressed.length;
  }
  const cb = Buffer.concat(centrals),
    end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cb.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cb, end]);
}
const drc = Buffer.from([68, 82, 65, 67, 79, 2, 2, 1, 1, 0, 0, 11, 12, 13]);
async function inspect(t, bytes, limits) {
  const root = temp(t),
    path = join(root, "synthetic.zip");
  writeFileSync(path, bytes);
  return inspectWorldZIP(path, limits);
}
for (const method of [0, 8])
  test(`ZIP method ${method}: CRC/hash inventory plus DRC header without claiming full decode`, async (t) => {
    const result = await inspect(
      t,
      zip([{ name: "SYNTHETIC_PRIVATE_NAME.drc", bytes: drc, method }]),
    );
    assert.equal(result.inventory.entryCount, 1);
    assert.equal(result.inventory.entries[0].sha256, hash(drc));
    assert.equal(result.inspection.drcPresent, true);
    assert.match(
      result.inspection.observations[0].structuralUsability,
      /REQUIRES_DRACO_DECODE/,
    );
    assert.equal(
      JSON.stringify(result).includes("SYNTHETIC_PRIVATE_NAME"),
      false,
    );
    assert.equal(result.inventory.noExtraction, true);
  });
for (const name of [
  "../x.drc",
  "a/../../x.drc",
  "/x.drc",
  "C:/x.drc",
  "C:x.drc",
  "\\server\\x.drc",
  "a\\..\\x.drc",
  "a//x.drc",
  "a/./x.drc",
  "a/CON.txt",
  "a/nul",
  "a/com1.drc",
  "a/trailing.",
  "a/trailing ",
  "%2e%2e/x.drc",
  "a\0x.drc",
])
  test(`ZIP rejects unsafe pathname ${JSON.stringify(name)}`, async (t) => {
    await assert.rejects(inspect(t, zip([{ name, bytes: drc }])));
  });
for (const mode of [0xa1ff, 0x21b6, 0x61b6, 0x11b6, 0xc1ff])
  test(`ZIP rejects special file mode ${mode.toString(16)}`, async (t) => {
    await assert.rejects(
      inspect(t, zip([{ bytes: drc, attr: (mode << 16) >>> 0 }])),
      /zip_special_file/,
    );
  });
for (const names of [
  ["x.drc", "x.drc"],
  ["x.drc", "X.drc"],
  ["dir/x.drc", "DIR/y.drc"],
  ["dir", "dir/x.drc"],
])
  test(`ZIP rejects duplicate/collision ${names.join(",")}`, async (t) => {
    await assert.rejects(
      inspect(t, zip(names.map((name) => ({ name, bytes: drc })))),
      /zip_duplicate_or_case_conflict|zip_case_conflicting_parent|zip_file_directory_conflict/,
    );
  });
for (const [name, entry, limits, reason] of [
  ["CRC", { bytes: drc, crc: 1 }, undefined, "zip_crc_or_size"],
  [
    "wrong declared size",
    { bytes: drc, size: 15 },
    undefined,
    "zip_crc_or_size",
  ],
  [
    "compression bomb",
    { name: "x.bin", bytes: Buffer.alloc(100000), method: 8 },
    undefined,
    "zip_entry_size_or_ratio",
  ],
  [
    "individual bound",
    { bytes: drc },
    { ...c.zip, maxEntryBytes: 4 },
    "zip_entry_size_or_ratio",
  ],
  [
    "aggregate bound",
    { bytes: drc },
    { ...c.zip, maxTotalBytes: 4 },
    "zip_total_size",
  ],
  [
    "entry count",
    { bytes: drc },
    { ...c.zip, maxEntries: 0 },
    "zip_entry_count_or_multidisk",
  ],
  [
    "invalid DRC",
    { bytes: Buffer.from("not a draco header") },
    undefined,
    "zip_invalid_drc_header",
  ],
  [
    "encrypted",
    { bytes: drc, flags: 1 },
    undefined,
    "zip_unsupported_features",
  ],
  [
    "unsupported compression",
    { bytes: drc, method: 99 },
    undefined,
    "zip_unsupported_features",
  ],
])
  test(`ZIP rejects ${name}`, async (t) => {
    await assert.rejects(inspect(t, zip([entry]), limits), new RegExp(reason));
  });
for (const n of [0, 3, 25, 70])
  test(`ZIP rejects truncated length ${n}`, async (t) => {
    await assert.rejects(inspect(t, zip([{ bytes: drc }]).subarray(0, n)));
  });
test("ZIP rejects corrupted deflate bytes", async (t) => {
  const b = zip([{ bytes: drc, method: 8 }]);
  b[30 + "world.drc".length] ^= 255;
  await assert.rejects(inspect(t, b));
});
test("ZIP rejects local/central name mismatch", async (t) => {
  const b = zip([{ bytes: drc }]);
  b[30] ^= 1;
  await assert.rejects(inspect(t, b), /zip_local_name_mismatch/);
});
test("ZIP missing DRC reports absence without inventing world usability", async (t) => {
  const r = await inspect(t, zip([{ name: "other.bin" }]));
  assert.equal(r.inspection.drcPresent, false);
  assert.equal(r.inspection.worldCandidateCount, 0);
  assert.equal(r.inspection.structuralUsability, "MANUAL_REVIEW_REQUIRED");
});
test("ZIP nested valid directories need no extraction", async (t) => {
  const r = await inspect(
    t,
    zip([
      { name: "scene/", bytes: Buffer.alloc(0), attr: (0x41ed << 16) >>> 0 },
      { name: "scene/world.drc", bytes: drc },
    ]),
  );
  assert.equal(r.inventory.entryCount, 2);
});
test("new artifact bytes/root/anchor are gitignored; no actual initialized directory exists", () => {
  const result = spawnSync(
    "git",
    [
      "check-ignore",
      "experiments/phase38-spatial/private-fal-artifact/artifact.zip",
      "experiments/phase38-spatial/private-fal-artifact/artifact.zip.partial",
      "experiments/phase38-spatial/private-fal-artifact.anchor",
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim().split("\n").length, 3);
  assert.equal(
    existsSync(new URL("../private-fal-artifact/", import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL("../private-fal-artifact.anchor", import.meta.url)),
    false,
  );
});
test("new modules import only Node or isolated experiment; CLI provides no URL/pin/limit overrides", () => {
  for (const name of readdirSync(new URL("../src/", import.meta.url)).filter(
    (n) => n.startsWith("fal-artifact"),
  )) {
    const s = readFileSync(new URL("../src/" + name, import.meta.url), "utf8");
    for (const m of s.matchAll(/from\s+["']([^"']+)["']/g))
      assert.ok(m[1].startsWith("node:") || m[1].startsWith("./"), name);
    assert.equal(s.includes("process.env.OPENAI"), false);
  }
  const cli = readFileSync(
    new URL("../src/fal-artifact-cli.ts", import.meta.url),
    "utf8",
  );
  assert.equal(cli.includes("--url="), false);
  assert.equal(cli.includes("--hash="), false);
});
test("global GCS asset-host policy remains rejecting shared host", async () => {
  const { assetUrl } = await import("../src/protocol.ts");
  assert.throws(
    () => assetUrl(fixture().body.world_file.url, "fal"),
    /asset_host_not_allowed/,
  );
});
test("accounting is immutable and inherits all prior attempts", () => {
  assert.equal(c.accounting.historicalAPIRequests, 46);
  assert.equal(c.accounting.historicalDownloads, 8);
  assert.equal(c.accounting.historicalGenerationSubmissions, 3);
  assert.equal(c.accounting.ceilingMicroUSD, 4750000);
  assert.equal(c.accounting.falReservedMicroUSD, 350000);
  assert.equal(c.accounting.unreleasedChestMicroUSD, 600000);
  assert.throws(() => (c.accounting.falReportedMicroUSD = 0));
  assert.equal(artifactHash, hash(canonical(c)));
  assert.equal(typeof verifyArtifactSources, "function");
});

test("an @ inside a hash-pinned synthetic query is not a URL credential", () => {
  const f = fixture();
  f.body.world_file.url += "@synthetic.example";
  const raw = Buffer.from(JSON.stringify(f.body)),
    pins = {
      ...f.pins,
      resultBodySHA256: hash(raw),
      descriptor: sanitizeWorldFile(f.body.world_file),
    };
  assert.equal(
    qualifyArtifact(raw, pins).cap.urlHash,
    hash(f.body.world_file.url),
  );
});
test("existing completed artifact cannot be overwritten", async (t) => {
  const root = temp(t),
    f = fixture();
  writeFileSync(join(root, "artifact.zip"), "KEEP");
  await assert.rejects(
    streamArtifact(f.cap, root, () => {}, {
      open: () => assert.fail("network"),
    }),
    /artifact_existing_completed_file/,
  );
  assert.equal(readFileSync(join(root, "artifact.zip"), "utf8"), "KEEP");
});
test("fake capability is rejected before DNS or private writes", async (t) => {
  const root = temp(t);
  await assert.rejects(
    streamArtifact(
      { urlHash: c.descriptor.urlSHA256, expectedBytes: 85481294 },
      root,
      () => {},
      { open: () => assert.fail("network") },
    ),
    /artifact_provenance_required/,
  );
  assert.deepEqual(readdirSync(root), []);
});
test("a crash after result reservation cannot schedule another request", async (t) => {
  const s = setup(t);
  s.ledger.append("artifact_begin", {
    requestId: c.requestId,
    artifactHash,
    started: 0,
  });
  s.ledger.append("artifact_request", {
    stage: "result",
    method: "GET",
    requestId: c.requestId,
    urlHash: hash(c.resultURL),
    at: 0,
  });
  s.ledger.close();
  const reopened = new ArtifactLedger(s.root, COMMIT, s.sources, s.verify);
  await assert.rejects(
    runExactArtifact(reopened, SECRET, mocks()),
    /artifact_already_attempted/,
  );
  reopened.close();
});
test("second asset reservation is rejected before a second transport call", async (t) => {
  const s = setup(t),
    m = mocks();
  m.download = async () => {
    assert.throws(
      () =>
        s.ledger.append("artifact_request", {
          stage: "asset",
          method: "GET",
          requestId: c.requestId,
          urlHash: c.descriptor.urlSHA256,
        }),
      /artifact_one_asset/,
    );
    throw Error("SYNTHETIC_STOP");
  };
  const result = await runExactArtifact(s.ledger, SECRET, m);
  assert.equal(result.assetAttempts, 1);
});
test("missing/broken diagnostic histories fail read-only source verification", (t) => {
  const root = temp(t);
  assert.throws(() =>
    verifyArtifactSources({
      continuationRoot: root,
      recoveryRoot: root,
      retrievalRoot: root,
      diagnosticRoot: root,
    }),
  );
  assert.deepEqual(readdirSync(root), []);
});
for (const part of [
  "executionSHA",
  "diagnosticHash",
  "requestId",
  "accounting",
])
  test(`modified accepted evidence ${part} fails exact hash`, () => {
    const e = JSON.parse(
      readFileSync(
        new URL("../results/fal-host-diagnostic-001.json", import.meta.url),
      ),
    );
    e[part] = "TAMPER";
    assert.throws(
      () => verifyArtifactEvidence(Buffer.from(JSON.stringify(e))),
      /artifact_evidence_hash/,
    );
  });
test("ZIP signed data descriptor is validated", async (t) => {
  const b = zip([{ bytes: drc }]),
    localLen = 30 + 9 + drc.length,
    descriptor = Buffer.alloc(16);
  descriptor.writeUInt32LE(0x08074b50);
  descriptor.writeUInt32LE(crc32(drc), 4);
  descriptor.writeUInt32LE(drc.length, 8);
  descriptor.writeUInt32LE(drc.length, 12);
  b.writeUInt16LE(0x808, 6);
  b.writeUInt16LE(0x808, localLen + 8);
  b.fill(0, 14, 26);
  const out = Buffer.concat([
    b.subarray(0, localLen),
    descriptor,
    b.subarray(localLen),
  ]);
  out.writeUInt32LE(localLen + 16, out.length - 6);
  assert.equal((await inspect(t, out)).inventory.crcChecked, true);
  descriptor.writeUInt32LE(1, 4);
  const bad = Buffer.concat([
    out.subarray(0, localLen),
    descriptor,
    out.subarray(localLen + 16),
  ]);
  await assert.rejects(inspect(t, bad), /zip_data_descriptor/);
});
test("ZIP overlapping local entries fail", async (t) => {
  const b = zip([{ name: "a.bin" }, { name: "b.bin" }]),
    central = b.readUInt32LE(b.length - 6),
    second = central + 46 + 5;
  b.writeUInt32LE(0, second + 42);
  await assert.rejects(inspect(t, b), /zip_overlap_or_gap/);
});
test("ZIP trailing appended payload fails", async (t) => {
  await assert.rejects(
    inspect(t, Buffer.concat([zip([{ bytes: drc }]), Buffer.from("TRAILER")])),
    /zip_end_missing/,
  );
});
test("ZIP damaged central signature fails", async (t) => {
  const b = zip([{ bytes: drc }]);
  b[b.readUInt32LE(b.length - 6)] ^= 1;
  await assert.rejects(inspect(t, b), /zip_central_invalid/);
});
test("ZIP invalid glTF fails locally without external fetching", async (t) => {
  await assert.rejects(
    inspect(
      t,
      zip([
        {
          name: "scene.gltf",
          bytes: Buffer.from('{"asset":{"version":"1.0"}}'),
        },
      ]),
    ),
    /zip_invalid_gltf_header/,
  );
});
test("ZIP glTF 2.0 with external URI remains explicitly unverified, never fetched or leaked", async (t) => {
  const r = await inspect(
    t,
    zip([
      {
        name: "scene.gltf",
        bytes: Buffer.from(
          JSON.stringify({
            asset: { version: "2.0" },
            buffers: [{ uri: "https://SYNTHETIC_PRIVATE.example/token" }],
          }),
        ),
      },
    ]),
  );
  assert.match(r.inspection.observations[0].structuralUsability, /UNVERIFIED/);
  assert.equal(JSON.stringify(r).includes("SYNTHETIC_PRIVATE"), false);
});
test("ZIP unsupported ZIP64 version fails closed", async (t) => {
  const b = zip([{ bytes: drc }]),
    central = b.readUInt32LE(b.length - 6);
  b.writeUInt16LE(45, central + 6);
  await assert.rejects(inspect(t, b), /zip_unsupported_features/);
});

test("complete safe ZIP inventory is retained before geometry validation failure", async (t) => {
  const path = join(temp(t), "synthetic.zip");
  writeFileSync(
    path,
    zip([
      {
        name: "SYNTHETIC_PRIVATE.drc",
        bytes: Buffer.from("not Draco content"),
      },
    ]),
  );
  const observed = [];
  await assert.rejects(
    inspectWorldZIP(path, c.zip, (i) => observed.push(i)),
    /zip_invalid_drc_header/,
  );
  assert.equal(observed.length, 1);
  assert.equal(observed[0].crcChecked, true);
  assert.equal(JSON.stringify(observed).includes("SYNTHETIC_PRIVATE"), false);
});
test("corrupt archive never emits a valid inventory", async (t) => {
  const path = join(temp(t), "synthetic.zip");
  writeFileSync(path, zip([{ bytes: drc, crc: 1 }]));
  await assert.rejects(
    inspectWorldZIP(path, c.zip, () => assert.fail("unvalidated inventory")),
    /zip_crc_or_size/,
  );
});
