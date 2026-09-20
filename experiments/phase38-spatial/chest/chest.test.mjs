import test from "node:test";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  manifest as c,
  manifestHash,
  validateContract,
  verifyFiles,
  verifySources,
  selectChest,
} from "./contract.ts";
import { ChestLedger, initializeChest, reserveChest } from "./state.ts";
import { runChest, requiredAsset, validateIdentity } from "./runner.ts";
import { inspectChestGLB, classifyLid } from "./glb.ts";
import { verifyChestFreeze } from "./freeze.ts";
import { privateRoot, main } from "./cli.ts";
import { protocol, canonical, hash } from "../src/protocol.ts";
import { nextJob } from "../src/runner.ts";
import { httpTransport } from "../src/transport.ts";
const COMMIT = "1".repeat(40),
  KEY = "SYNTHETIC_CHEST_SECRET",
  ID = "synthetic-chest-request",
  ASSET = "https://fal.media/synthetic/chest.glb";
globalThis.fetch = async () => {
  throw Error("OFFLINE_FETCH_FORBIDDEN");
};
function setup(t) {
  const base = mkdtempSync(join(tmpdir(), "chest-release-test-"));
  const root = join(base, "private-chest");
  initializeChest(root, COMMIT, () => {});
  const ledger = new ChestLedger(root, COMMIT, () => {});
  t.after(() => {
    ledger.close();
    assert.ok(resolve(base).startsWith(resolve(tmpdir())));
    rmSync(base, { recursive: true, force: true });
  });
  return { root, ledger };
}
function geometry(mutator = () => {}) {
  const bin = Buffer.alloc(44);
  [0, 0, 0, 1, 0, 0, 0, 1, 1].forEach((v, i) => bin.writeFloatLE(v, i * 4));
  [0, 1, 2].forEach((v, i) => bin.writeUInt16LE(v, 36 + i * 2));
  const d = {
    asset: { version: "2.0" },
    buffers: [{ byteLength: 42 }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36 },
      { buffer: 0, byteOffset: 36, byteLength: 6 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    ],
    meshes: [
      {
        primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }],
      },
    ],
    nodes: [{ mesh: 0 }],
    materials: [
      { pbrMetallicRoughness: { metallicFactor: 0.2, roughnessFactor: 0.7 } },
    ],
    scenes: [{ nodes: [0] }],
    scene: 0,
  };
  mutator(d, bin);
  const json = Buffer.from(JSON.stringify(d)),
    padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32);
  json.copy(padded);
  const head = Buffer.alloc(20);
  head.write("glTF");
  head.writeUInt32LE(2, 4);
  head.writeUInt32LE(20 + padded.length + 8 + bin.length, 8);
  head.writeUInt32LE(padded.length, 12);
  head.writeUInt32LE(0x4e4f534a, 16);
  const bh = Buffer.alloc(8);
  bh.writeUInt32LE(bin.length);
  bh.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([head, padded, bh, bin]);
}
function mock({
  submit = {},
  poll = {},
  result = {},
  bytes = geometry(),
  failStage = null,
  redirectStage = null,
  status = "COMPLETED",
  header = {},
} = {}) {
  const calls = [];
  let now = 0;
  const transport = async (r) => {
    calls.push(r);
    const stage =
      r.method === "POST"
        ? "submit"
        : r.asset
          ? "download"
          : r.url.endsWith("/status")
            ? "poll"
            : "result";
    if (stage === failStage) throw Error("SYNTHETIC_TRANSPORT_ERROR");
    let body;
    if (stage === "submit")
      body = {
        request_id: ID,
        status,
        status_url: `https://queue.fal.run/fal-ai/hunyuan-3d/requests/${ID}/status`,
        response_url: `https://queue.fal.run/fal-ai/hunyuan-3d/requests/${ID}`,
        ...submit,
      };
    else if (stage === "poll")
      body = { request_id: ID, status: "COMPLETED", ...poll };
    else
      body = {
        model_glb: {
          url: ASSET,
          content_type: "model/gltf-binary",
          file_size: bytes.length,
        },
        ...result,
      };
    return {
      status: stage === redirectStage ? 302 : 200,
      url: r.url,
      headers: header,
      bytes: stage === "download" ? bytes : Buffer.from(JSON.stringify(body)),
    };
  };
  return {
    calls,
    transport,
    clock: {
      now: () => now,
      sleep: async (ms) => {
        now += ms;
      },
    },
  };
}
test("exact job, protocol, accounting and accepted PLY bindings", () => {
  validateContract();
  assert.equal(selectChest().id, "spatial-chest-1");
  assert.equal(c.acceptedFalWorld.ownerAcceptedStructuralOnly, true);
  assert.equal(c.acceptedFalWorld.noRetry, true);
  assert.equal(canonical(selectChest()), canonical(protocol.jobs[3]));
  assert.equal(
    c.accounting.priorReservedMicroUSD + c.job.reserveMicroUSD,
    4750000,
  );
});
for (const id of [
  "spatial-room-1",
  "spatial-courtyard-1",
  "spatial-fal-world-1",
  "spatial-chest-2",
  "next",
])
  test(`no selection path for ${id}`, () =>
    assert.throws(() => selectChest(id), /chest_only/));
for (const [name, change] of [
  ["model", (m) => (m.job.model = "other")],
  ["endpoint", (m) => (m.job.endpoint += "x")],
  ["prompt", (m) => (m.job.input.prompt += " changed")],
  ["PBR", (m) => (m.job.input.enable_pbr = false)],
  ["generate_type", (m) => (m.job.input.generate_type = "LowPoly")],
  ["extra parameter", (m) => (m.job.input.face_count = 1000)],
  ["reservation", (m) => (m.job.reserveMicroUSD = 1)],
  ["price", (m) => (m.job.maxPriceMicroUSD = 1)],
  ["budget", (m) => (m.accounting.ceilingMicroUSD = 5000000)],
  ["prior charge", (m) => (m.accounting.falWorldReportedMicroUSD = 0)],
  ["submission limit", (m) => (m.limits.submissions = 2)],
  ["retry", (m) => (m.limits.retries = 1)],
  ["fallback", (m) => (m.limits.fallbacks = 1)],
  ["concurrency", (m) => (m.limits.concurrentGenerations = 2)],
  ["history hash", (m) => (m.originalProtocolHash = "0".repeat(64))],
])
  test(`altered ${name} rejected`, () => {
    const m = structuredClone(c);
    change(m);
    assert.throws(() => validateContract(m));
  });
test("source hash alterations rejected", () => {
  const bytes = Buffer.from("synthetic");
  assert.doesNotThrow(() => verifyFiles({ a: hash(bytes) }, () => bytes));
  assert.throws(
    () => verifyFiles({ a: hash(bytes) }, () => Buffer.from("changed")),
    /history_changed/,
  );
});
test("all actual accepted histories verify read-only", () => {
  const before = c.privateHistory.map((p) =>
    readFileSync(join("C:/Dev", p.worktree, p.path)),
  );
  verifySources();
  c.privateHistory.forEach((p, i) =>
    assert.ok(
      readFileSync(join("C:/Dev", p.worktree, p.path)).equals(before[i]),
    ),
  );
});
test("original stopped nextJob guard is preserved", () =>
  assert.throws(
    () => nextJob({ rows: (kind) => (kind === "stop" ? [{}] : []) }),
    /experiment_stopped/,
  ));
test("private root ignore guard creates nothing", () => {
  const root = privateRoot();
  assert.equal(existsSync(root), false);
  assert.equal(existsSync(root + ".anchor"), false);
});
test("init once with no reservation and cannot reinitialize anchor", (t) => {
  const { ledger, root } = setup(t);
  assert.equal(ledger.entries.length, 0);
  assert.equal(ledger.summary().reservedMicroUSD, 4150000);
  assert.throws(
    () => initializeChest(root, COMMIT, () => {}),
    /run_already_exists/,
  );
});
test("one final reservation consumes allocation once", (t) => {
  const { ledger } = setup(t);
  reserveChest(ledger, 0);
  assert.equal(ledger.summary().reservedMicroUSD, 4750000);
  assert.equal(ledger.summary().remainingReservationMicroUSD, 0);
  assert.throws(() => reserveChest(ledger, 1), /already_started/);
});
test("wrong generation ledger event rejected", (t) => {
  const { ledger } = setup(t);
  assert.throws(
    () => ledger.append("reserve", { jobId: "spatial-room-1" }),
    /chest_only/,
  );
  assert.equal(ledger.entries.length, 0);
});
test("fused chest is successful terminal limitation, never retry permission", async (t) => {
  const { ledger, root } = setup(t),
    m = mock();
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 3);
  assert.equal(
    ledger.rows("inspection")[0].lidClassification,
    "FUSED_OR_NOT_SEPARATELY_ADDRESSABLE",
  );
  assert.equal(ledger.rows("end")[0].status, "AWAITING_OWNER_REVIEW");
  assert.equal(ledger.summary().reservedMicroUSD, 4750000);
  assert.equal(ledger.summary().knownReportedMicroUSD, 2528000);
  assert.equal(ledger.summary().reportedMicroUSD, null);
  assert.ok(existsSync(join(root, "chest.glb")));
  assert.equal(m.calls[2].headers.Authorization, undefined);
  assert.deepEqual(m.calls[2].headers, {});
  assert.equal(m.calls[0].headers["X-Fal-No-Retry"], "1");
  assert.equal(m.calls[0].headers["x-app-fal-disable-fallback"], "true");
  await assert.rejects(
    runChest(ledger, KEY, m.transport, m.clock),
    /already_started/,
  );
  assert.equal(m.calls.length, 3);
});
test("restart cannot duplicate attempted submission", async (t) => {
  const { ledger, root } = setup(t),
    m = mock({ failStage: "submit" });
  await runChest(ledger, KEY, m.transport, m.clock);
  ledger.close();
  const second = new ChestLedger(root, COMMIT, () => {});
  try {
    await assert.rejects(
      runChest(second, KEY, m.transport, m.clock),
      /already_started/,
    );
    assert.equal(m.calls.length, 1);
  } finally {
    second.close();
  }
});
test("crash after reservation forbids rerun without network", async (t) => {
  const { ledger } = setup(t);
  reserveChest(ledger, 0);
  const m = mock();
  await assert.rejects(
    runChest(ledger, KEY, m.transport, m.clock),
    /already_started/,
  );
  assert.equal(m.calls.length, 0);
});
for (const stage of ["submit", "poll", "result", "download"])
  test(`transport failure at ${stage} stops without retry`, async (t) => {
    const { ledger } = setup(t),
      m = mock({ failStage: stage, status: "IN_QUEUE" });
    await runChest(ledger, KEY, m.transport, m.clock);
    assert.equal(ledger.rows("end")[0].status, "STOPPED");
    assert.equal(
      m.calls.filter((r) =>
        stage === "submit"
          ? r.method === "POST"
          : stage === "poll"
            ? r.url.endsWith("/status")
            : stage === "download"
              ? !!r.asset
              : !r.asset && r.method === "GET" && !r.url.endsWith("/status"),
      ).length,
      1,
    );
    const count = m.calls.length;
    await assert.rejects(runChest(ledger, KEY, m.transport, m.clock));
    assert.equal(m.calls.length, count);
  });
for (const stage of ["submit", "poll", "result", "download"])
  test(`redirect at ${stage} stops before next request`, async (t) => {
    const { ledger } = setup(t),
      m = mock({ redirectStage: stage, status: "IN_QUEUE" });
    await runChest(ledger, KEY, m.transport, m.clock);
    assert.equal(ledger.rows("end")[0].status, "STOPPED");
    assert.equal(ledger.rows("end")[0].reason, "chest_http_or_redirect");
  });
for (const [field, value] of [
  ["model", "other"],
  ["endpoint_id", "other"],
  ["provider", "worldlabs"],
  ["fallback", true],
  ["model_attempts", 2],
  ["provider_attempts", 2],
  ["request_id", "wrong"],
])
  test(`wrong result ${field} stops before download`, async (t) => {
    const { ledger } = setup(t),
      m = mock({ result: { [field]: value } });
    await runChest(ledger, KEY, m.transport, m.clock);
    assert.equal(ledger.rows("end")[0].status, "STOPPED");
    assert.equal(m.calls.length, 2);
  });
test("wrong status request identity stops before result", async (t) => {
  const { ledger } = setup(t),
    m = mock({ status: "IN_QUEUE", poll: { request_id: "wrong" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 2);
  assert.equal(ledger.rows("end")[0].reason, "chest_request_id");
});
for (const url of [
  "https://storage.googleapis.com/a.glb",
  "https://127.0.0.1/a.glb",
  "https://fal.media/a.zip",
  "https://fal.media/../a.glb",
  "http://fal.media/a.glb",
])
  test(`unsupported/unsafe asset fails closed: ${url}`, () =>
    assert.throws(() => requiredAsset({ model_glb: { url } }, ID)));
test("wrong queue URL stops after sole submission", async (t) => {
  const { ledger } = setup(t),
    m = mock({
      submit: {
        status_url:
          "https://queue.fal.run/fal-ai/hunyuan_world/requests/" +
          ID +
          "/status",
      },
    });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 1);
  assert.equal(ledger.rows("end")[0].status, "STOPPED");
});
test("polling respects cadence and deadline without another submission", async (t) => {
  const { ledger } = setup(t),
    m = mock({ status: "IN_QUEUE", poll: { status: "IN_PROGRESS" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.filter((r) => r.method === "POST").length, 1);
  assert.ok(m.calls.filter((r) => r.url.endsWith("/status")).length <= 45);
  assert.equal(ledger.rows("end")[0].status, "STOPPED");
  assert.equal(
    ledger.rows("request").filter((r) => r.type === "result").length,
    0,
  );
});
test("unknown queue state stops rather than polls again", async (t) => {
  const { ledger } = setup(t),
    m = mock({ status: "IN_QUEUE", poll: { status: "MAYBE" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 2);
  assert.equal(ledger.rows("end")[0].status, "STOPPED");
});
test("invalid GLB stops with private retained bytes and no retry", async (t) => {
  const { ledger, root } = setup(t),
    m = mock({ bytes: Buffer.from("SYNTHETIC_NOT_GLB") });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.ok(existsSync(join(root, "chest.glb")));
  assert.equal(ledger.rows("end")[0].status, "STOPPED");
  assert.equal(m.calls.length, 3);
});
test("untrusted provider errors are never recorded verbatim", async (t) => {
  const { ledger } = setup(t),
    m = mock({ result: { error: "SYNTHETIC_PRIVATE_ERROR" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(
    JSON.stringify(ledger.entries).includes("SYNTHETIC_PRIVATE_ERROR"),
    false,
  );
  assert.equal(JSON.stringify(ledger.entries).includes(KEY), false);
});
test("safe reported billable units never inferred as USD", async (t) => {
  const { ledger } = setup(t),
    m = mock({ header: { "x-fal-billable-units": "1" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(ledger.rows("response")[0].billableUnits, 1);
  assert.equal(ledger.summary().reportedMicroUSD, null);
});
test("numeric billing metadata failure stops before next call", async (t) => {
  const { ledger } = setup(t),
    m = mock({ header: { "x-fal-billable-units": "unknown bad" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 1);
  assert.equal(ledger.rows("end")[0].reason, "chest_billing_metadata");
});
test("actual model omitted stays unknown", () =>
  assert.equal(validateIdentity({ model: null }, ID).model, null));
test("generic provider transport never follows redirects", async () => {
  let calls = 0;
  const t = httpTransport(async (_url, options) => {
    calls++;
    assert.equal(options.redirect, "manual");
    return new Response("", { status: 302 });
  });
  await assert.rejects(
    t({
      url: c.job.endpoint,
      method: "POST",
      headers: {},
      limit: 100,
      timeoutMs: 100,
    }),
  );
  assert.equal(calls, 1);
});
test("GLB mesh/node/material counts, PBR and geometry bounds", () => {
  const r = inspectChestGLB(geometry());
  assert.equal(r.meshes, 1);
  assert.equal(r.nodes, 1);
  assert.equal(r.materials, 1);
  assert.equal(r.primitiveCount, 1);
  assert.equal(r.vertexCount, 3);
  assert.equal(r.indexCount, 3);
  assert.deepEqual(r.bounds, { min: [0, 0, 0], max: [1, 1, 1] });
  assert.equal(r.pbrMaterials[0].metallicFactor, 0.2);
});
test("node translation affects bounds without guessing metric scale", () => {
  const r = inspectChestGLB(
    geometry((d) => {
      d.nodes[0].translation = [2, 3, 4];
    }),
  );
  assert.deepEqual(r.bounds, { min: [2, 3, 4], max: [3, 4, 5] });
  assert.match(r.boundsScope, /no canonical metric scale/);
});
test("lid names and material texture boundaries do not fabricate articulation", () => {
  const r = inspectChestGLB(
    geometry((d) => {
      d.nodes[0].name = "lid";
      d.meshes[0].name = "chest";
      d.materials.push({ name: "lid paint", pbrMetallicRoughness: {} });
    }),
  );
  assert.equal(r.lidClassification, "FUSED_OR_NOT_SEPARATELY_ADDRESSABLE");
  assert.equal(r.separateLidVerified, false);
});
test("separate meshes are only plausible unverified parts", () => {
  const r = inspectChestGLB(
    geometry((d) => {
      d.meshes.push(structuredClone(d.meshes[0]));
      d.nodes.push({ mesh: 1, name: "lid", translation: [0, 2, 0] });
      d.scenes[0].nodes.push(1);
    }),
  );
  assert.equal(r.lidClassification, "POSSIBLE_BUT_UNVERIFIED_LID");
  assert.equal(r.separateLidVerified, false);
  assert.equal(r.nodeHierarchy.length, 2);
});
test("uninspected geometry remains STRUCTURE_UNVERIFIED", () =>
  assert.equal(classifyLid(0, false), "STRUCTURE_UNVERIFIED"));
for (const [name, mutate] of [
  ["out of bounds indices", (_d, b) => b.writeUInt16LE(8, 36)],
  ["nonfinite position", (_d, b) => b.writeFloatLE(NaN, 0)],
  ["buffer overflow", (d) => (d.bufferViews[0].byteLength = 999999)],
  ["accessor overflow", (d) => (d.accessors[0].count = 999999999)],
  ["sparse accessor", (d) => (d.accessors[0].sparse = {})],
  [
    "external image",
    (d) => (d.images = [{ uri: "https://example.invalid/image.png" }]),
  ],
  [
    "required extension",
    (d) => (d.extensionsRequired = ["KHR_draco_mesh_compression"]),
  ],
  ["node cycle", (d) => (d.nodes[0].children = [0])],
  ["missing PBR", (d) => (d.materials = [{}])],
  ["invalid material", (d) => (d.meshes[0].primitives[0].material = 99)],
  ["invalid transform", (d) => (d.nodes[0].rotation = [0, 0, 0, 0])],
  ["animation", (d) => (d.animations = [{}])],
])
  test(`invalid/unsupported ${name} fails structural inspection`, () =>
    assert.throws(() => inspectChestGLB(geometry(mutate))));
test("frozen source bindings cannot be silently edited", () => {
  const frozen = verifyChestFreeze();
  assert.equal(frozen.manifestHash, manifestHash);
});

test("exclusive lock blocks simultaneous chest processes", (t) => {
  const { root } = setup(t);
  assert.throws(() => new ChestLedger(root, COMMIT, () => {}), /EEXIST/);
});
test("retained binary corruption fails on reopening without another request", async (t) => {
  const { root, ledger } = setup(t),
    m = mock();
  await runChest(ledger, KEY, m.transport, m.clock);
  ledger.close();
  writeFileSync(join(root, "chest.glb"), "synthetic corruption");
  assert.throws(
    () => new ChestLedger(root, COMMIT, () => {}),
    /retained_asset_changed/,
  );
  assert.equal(m.calls.length, 3);
});
test("a different identity cannot open chest ledger", (t) => {
  const { root, ledger } = setup(t);
  ledger.close();
  const identityPath = join(root, "identity.json");
  const old = JSON.parse(readFileSync(identityPath, "utf8"));
  old.continuation.chestHash = "0".repeat(64);
  writeFileSync(identityPath, canonical(old) + "\n");
  writeFileSync(root + ".anchor", canonical(old) + "\n");
  assert.throws(
    () => new ChestLedger(root, COMMIT, () => {}),
    /continuation_identity_mismatch/,
  );
});
test("malformed result JSON stops before asset", async (t) => {
  const { ledger } = setup(t),
    m = mock();
  const send = async (r) => {
    const reply = await m.transport(r);
    if (r.method === "GET" && !r.asset) reply.bytes = Buffer.from("{broken");
    return reply;
  };
  await runChest(ledger, KEY, send, m.clock);
  assert.equal(m.calls.length, 2);
  assert.equal(ledger.rows("end")[0].status, "STOPPED");
});
test("wrong reported request header stops before next call", async (t) => {
  const { ledger } = setup(t),
    m = mock({ header: { "x-fal-request-id": "wrong" } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 1);
  assert.equal(ledger.rows("end")[0].reason, "chest_header_request_id");
});
test("changed status result URL stops before result", async (t) => {
  const { ledger } = setup(t),
    m = mock({
      status: "IN_QUEUE",
      poll: { response_url: "https://queue.fal.run/other" },
    });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 2);
  assert.equal(ledger.rows("end")[0].reason, "chest_changed_result_url");
});
test("wrong returned HTTP URL stops before next call", async (t) => {
  const { ledger } = setup(t),
    m = mock();
  await runChest(
    ledger,
    KEY,
    async (r) => ({ ...(await m.transport(r)), url: r.url + "/different" }),
    m.clock,
  );
  assert.equal(m.calls.length, 1);
  assert.equal(ledger.rows("end")[0].reason, "chest_http_or_redirect");
});
test("declared final size mismatch stops without retry", async (t) => {
  const { ledger } = setup(t),
    m = mock({ result: { model_glb: { url: ASSET, file_size: 1 } } });
  await runChest(ledger, KEY, m.transport, m.clock);
  assert.equal(m.calls.length, 3);
  assert.equal(ledger.rows("end")[0].reason, "chest_final_size");
});
for (const args of [
  ["next"],
  ["init"],
  [
    "run",
    "--live",
    "--approved-sha=" + "0".repeat(40),
    "--job-id=spatial-room-1",
  ],
])
  test(`CLI rejects unapproved command/override: ${args[0]}/${args.length}`, async () => {
    await assert.rejects(main(args), /chest_arguments/);
    assert.equal(existsSync(privateRoot()), false);
  });
test("CLI rejects wrong clean authorization before initialization", async () => {
  await assert.rejects(
    main(["init", "--live", "--approved-sha=" + "0".repeat(40)]),
    /chest_exact_clean_authorization/,
  );
  assert.equal(existsSync(privateRoot()), false);
});

test("node matrices are reported as structural orientation evidence only", () => {
  const r = inspectChestGLB(
    geometry((d) => {
      d.nodes[0].translation = [2, 3, 4];
    }),
  );
  assert.deepEqual(r.nodeHierarchy[0].worldTransform.slice(12), [2, 3, 4, 1]);
  assert.match(r.orientation, /UNVERIFIED/);
});
test("overflowing dimensions fail rather than serialize as unknown numbers", () =>
  assert.throws(
    () =>
      inspectChestGLB(
        geometry((d, b) => {
          b.writeFloatLE(-1, 0);
          d.nodes[0].scale = [1e308, 1, 1];
        }),
      ),
    /dimension_overflow/,
  ));
