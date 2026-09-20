import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  continuation,
  continuationHash,
  initializeContinuation,
  ContinuationLedger,
  verifyHistory,
} from "../src/continuation-ledger.ts";
import { recoverRoom } from "../src/room-recovery.ts";
import { runNext, approve, bill } from "../src/runner.ts";
import { Ledger } from "../src/ledger.ts";
import { canonical, hash, protocol, protocolHash } from "../src/protocol.ts";
import {
  clock,
  world,
  spz,
  png,
  glb,
  fakeProvider,
  credentials,
  reviewFor,
  COMMIT,
} from "./fixtures.mjs";
import { webp } from "./webp-fixtures.mjs";
globalThis.fetch = async () => {
  throw Error("OFFLINE_NETWORK_FORBIDDEN");
};
function setup(t) {
  const parent = mkdtempSync(join(tmpdir(), "phase38-continuation-")),
    original = join(parent, "original"),
    root = join(parent, "new-run");
  const orig = join(original, continuation.originalRunRelativePath);
  mkdirSync(orig, { recursive: true });
  const journal = readFileSync(
    new URL("../results/live-run-001-ledger.jsonl", import.meta.url),
  );
  const rows = journal.toString().trim().split("\n").map(JSON.parse);
  writeFileSync(join(orig, "journal.jsonl"), journal);
  writeFileSync(
    join(orig, "witness.jsonl"),
    rows.map((r) => r.digest).join("\n") + "\n",
  );
  const identity =
    canonical({
      version: 1,
      protocolHash,
      commit: continuation.originalExecutionSHA,
    }) + "\n";
  writeFileSync(join(orig, "identity.json"), identity);
  writeFileSync(orig + ".anchor", identity);
  verifyHistory(original);
  initializeContinuation(root, COMMIT, original);
  const ledger = new ContinuationLedger(root, COMMIT, original);
  const time = clock();
  time.advance(Number(ledger.rows("reserve")[0].started) - time.now() + 600000);
  const s = { parent, original, orig, root, ledger, time, requests: [] };
  t.after(() => {
    s.ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  s.transport = async (r) => {
    s.requests.push(r);
    assert.equal(r.method, "GET");
    let bytes;
    if (!r.asset) {
      assert.equal(
        r.url,
        `https://api.worldlabs.ai/marble/v1/worlds/${continuation.room.worldId}`,
      );
      const w = world(
        protocol.jobs[0],
        Number(s.ledger.rows("reserve")[0].started),
      );
      w.world_id = continuation.room.worldId;
      w.world_marble_url = `https://marble.worldlabs.ai/world/${w.world_id}`;
      w.world_prompt = {
        type: "text",
        text_prompt: "Synthetic recaptioned room.",
      };
      w.assets.thumbnail_url =
        "https://cdn.marble.worldlabs.ai/synthetic/thumbnail.webp";
      bytes = Buffer.from(JSON.stringify(w));
    } else
      bytes =
        r.asset.role === "splat"
          ? spz()
          : r.asset.role === "collider"
            ? glb()
            : r.asset.role === "thumbnail"
              ? webp()
              : png();
    return { status: 200, url: r.url, headers: {}, bytes };
  };
  return s;
}
function originals(s) {
  return Object.fromEntries(
    Object.keys(continuation.originalFileHashes).map((p) => [
      p,
      hash(readFileSync(join(s.original, p))),
    ]),
  );
}
function review(s, id) {
  if (!s.ledger.rows("billing", id).length)
    bill(
      s.ledger,
      id,
      `op-${id}`,
      protocol.jobs.find((j) => j.id === id).maxPriceMicroUSD,
      "dashboard",
      hash("synthetic-receipt"),
    );
  approve(s.ledger, id, reviewFor(s.ledger, id));
}
test("immutable historical stopped evidence and accounting are carried once into distinct identity", (t) => {
  const s = setup(t),
    before = originals(s),
    sum = s.ledger.summary();
  assert.equal(sum.reservedMicroUSD, 1300000);
  assert.equal(sum.knownReportedMicroUSD, 1264000);
  assert.equal(sum.attempted, 1);
  assert.equal(sum.cumulativeGenerationSubmissions, 1);
  assert.equal(sum.cumulativeAPIRequests, 21);
  assert.equal(sum.cumulativeWorldReads, 3);
  assert.equal(sum.originalStatus, "STOPPED");
  assert.equal(s.ledger.rows("historical_stop").length, 1);
  assert.equal(s.ledger.rows("stop").length, 0);
  assert.throws(
    () => initializeContinuation(s.root, COMMIT, s.original),
    /run_already_exists/,
  );
  s.ledger.close();
  s.ledger = new ContinuationLedger(s.root, COMMIT, s.original);
  assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
  assert.deepEqual(originals(s), before);
  assert.throws(
    () => new Ledger(s.root, COMMIT),
    /EEXIST|continuation_identity_mismatch/,
  );
  const ident = JSON.parse(readFileSync(join(s.root, "identity.json")));
  assert.equal(ident.continuation.manifestHash, continuationHash);
  assert.equal(
    ident.continuation.room.operationId,
    continuation.room.operationId,
  );
});
test("room cannot be regenerated or refunded and next is blocked before recovery", async (t) => {
  const s = setup(t);
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /prior_job_not_approved/,
  );
  assert.throws(
    () =>
      s.ledger.append("request", { jobId: "spatial-room-1", type: "submit" }),
    /room_regeneration_forbidden/,
  );
  assert.throws(
    () => s.ledger.append("reserve", s.ledger.rows("reserve")[0]),
    /duplicate_submission/,
  );
  assert.throws(
    () =>
      bill(
        s.ledger,
        "spatial-room-1",
        continuation.room.operationId,
        0,
        "dashboard",
        hash("refund"),
      ),
    /duplicate_or_unreserved/,
  );
  assert.equal(s.requests.length, 0);
  assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
});
test("history alteration blocks initialization/reopen and later I/O", async (t) => {
  const s = setup(t);
  writeFileSync(join(s.orig, "journal.jsonl"), "altered");
  assert.throws(
    () => verifyHistory(s.original),
    /continuation_history_changed/,
  );
  assert.throws(
    () => initializeContinuation(join(s.parent, "another"), COMMIT, s.original),
    /continuation_history_changed/,
  );
  const r = await recoverRoom(s.ledger, s.transport, credentials, s.time);
  assert.equal(r.status, "STOPPED");
  assert.equal(s.requests.length, 0);
});
test("identity/op/world mismatch cannot begin recovery", (t) => {
  const s = setup(t);
  for (const patch of [
    { operationId: "wrong" },
    { worldId: "wrong" },
    { continuationHash: hash("wrong") },
  ]) {
    assert.throws(
      () =>
        s.ledger.append("recovery_begin", {
          jobId: "spatial-room-1",
          operationId: continuation.room.operationId,
          worldId: continuation.room.worldId,
          continuationHash,
          ...patch,
        }),
      /continuation_identity_mismatch/,
    );
  }
  assert.equal(s.requests.length, 0);
});
test("successful recovery uses two world GETs and four exact assets, retains WebP, and requires review", async (t) => {
  const s = setup(t),
    before = originals(s);
  const result = await recoverRoom(s.ledger, s.transport, credentials, s.time);
  assert.equal(result.status, "awaiting_output_review");
  assert.equal(s.requests.length, 6);
  assert.equal(s.requests.filter((r) => !r.asset).length, 2);
  assert.deepEqual(
    s.requests.filter((r) => r.asset).map((r) => r.asset.role),
    continuation.recovery.assetRoles,
  );
  assert.ok(
    s.requests
      .filter((r) => r.asset)
      .every((r) => Object.keys(r.headers).length === 0),
  );
  const r = JSON.parse(s.ledger.readEvidence(s.ledger.rows("result")[0].file));
  assert.equal(r.world.worldId, continuation.room.worldId);
  assert.equal(r.requestId, continuation.room.operationId);
  assert.equal(
    r.assets.find((a) => a.role === "thumbnail").metadata.format,
    "webp",
  );
  assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
  assert.equal(s.ledger.rows("approval").length, 0);
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  await assert.rejects(
    recoverRoom(s.ledger, s.transport, credentials, s.time),
    /room_recovery_already_attempted/,
  );
  assert.equal(s.requests.length, 6);
  assert.deepEqual(originals(s), before);
});
test("manual review releases exactly remaining three original jobs; cumulative ceiling and generation count stay four", async (t) => {
  const s = setup(t);
  await recoverRoom(s.ledger, s.transport, credentials, s.time);
  const invalid = {
    ...reviewFor(s.ledger, "spatial-room-1"),
    panoramaSharingPermitted: false,
  };
  assert.throws(
    () => approve(s.ledger, "spatial-room-1", invalid),
    /panorama_not_approved/,
  );
  review(s, "spatial-room-1");
  const fake = fakeProvider(s.time);
  for (const id of continuation.remainingJobIds) {
    const r = await runNext(s.ledger, fake.transport, credentials, s.time);
    assert.equal(r.jobId, id);
    assert.notEqual(r.status, "STOPPED");
    review(s, id);
  }
  const sum = s.ledger.summary();
  assert.equal(sum.reservedMicroUSD, 4750000);
  assert.equal(sum.knownReportedMicroUSD, 4553000);
  assert.equal(sum.cumulativeGenerationSubmissions, 4);
  assert.equal(fake.requests.filter((r) => r.method === "POST").length, 3);
  await assert.rejects(
    runNext(s.ledger, fake.transport, credentials, s.time),
    /four_call_maximum/,
  );
  assert.equal(
    s.ledger.rows("reserve").filter((r) => r.jobId === "spatial-room-1").length,
    1,
  );
  s.ledger.close();
  s.ledger = new ContinuationLedger(s.root, COMMIT, s.original);
  assert.equal(s.ledger.summary().reservedMicroUSD, 4750000);
  await assert.rejects(
    recoverRoom(s.ledger, s.transport, credentials, s.time),
    /room_recovery_already_attempted/,
  );
});
for (const failure of [
  "HTTP",
  "wrong-world",
  "wrong-model",
  "public",
  "changed-reopen",
  "malformed-webp",
  "oversized",
  "redirect",
  "network",
]) {
  test(`failed recovery ${failure} releases no new generation and cannot rerun`, async (t) => {
    const s = setup(t),
      base = s.transport;
    let count = 0;
    const bad = async (r) => {
      count++;
      if (failure === "network") throw Error("SYNTHETIC_SECRET");
      const reply = await base(r);
      if (failure === "HTTP") reply.status = 503;
      if (failure === "redirect") reply.url += "/elsewhere";
      if (!r.asset) {
        const w = JSON.parse(reply.bytes);
        if (failure === "wrong-world") w.world_id = "other";
        if (failure === "wrong-model") w.model = "different";
        if (failure === "public") w.permission.public = true;
        if (failure === "changed-reopen" && count === 2)
          w.assets.splats.semantics_metadata.metric_scale_factor = 2;
        reply.bytes = Buffer.from(JSON.stringify(w));
      }
      if (r.asset?.role === "thumbnail" && failure === "malformed-webp")
        reply.bytes = Buffer.from("RIFFtruncated");
      if (failure === "oversized" && !r.asset)
        reply.bytes = Buffer.alloc(r.limit + 1);
      return reply;
    };
    const r = await recoverRoom(s.ledger, bad, credentials, s.time);
    assert.equal(r.status, "STOPPED");
    const before = count;
    await assert.rejects(recoverRoom(s.ledger, bad, credentials, s.time));
    await assert.rejects(runNext(s.ledger, bad, credentials, s.time));
    assert.equal(count, before);
    assert.equal(s.ledger.summary().cumulativeGenerationSubmissions, 1);
    assert.equal(s.ledger.rows("reserve").length, 1);
    assert.ok(
      !readFileSync(join(s.root, "journal.jsonl")).includes(
        Buffer.from("SYNTHETIC_SECRET"),
      ),
    );
  });
}
test("crash after durable recovery begin cannot restart asset recovery", async (t) => {
  const s = setup(t);
  s.ledger.append("recovery_begin", {
    jobId: "spatial-room-1",
    continuationHash,
    operationId: continuation.room.operationId,
    worldId: continuation.room.worldId,
  });
  s.ledger.close();
  s.ledger = new ContinuationLedger(s.root, COMMIT, s.original);
  await assert.rejects(recoverRoom(s.ledger, s.transport, credentials, s.time));
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  assert.equal(s.requests.length, 0);
});
test("failed remaining submission keeps reservation/unknown charge and stops further jobs", async (t) => {
  const s = setup(t);
  await recoverRoom(s.ledger, s.transport, credentials, s.time);
  review(s, "spatial-room-1");
  let posts = 0;
  const r = await runNext(
    s.ledger,
    async () => {
      posts++;
      throw Error("offline failure");
    },
    credentials,
    s.time,
  );
  assert.equal(r.status, "STOPPED");
  assert.equal(r.reservedMicroUSD, 3800000);
  assert.deepEqual(r.unknownChargeJobs, ["spatial-courtyard-1"]);
  await assert.rejects(runNext(s.ledger, s.transport, credentials, s.time));
  assert.equal(posts, 1);
});
test("oversized reservation/prefix alteration and duplicate recovery assets fail closed", async (t) => {
  const s = setup(t);
  await recoverRoom(s.ledger, s.transport, credentials, s.time);
  review(s, "spatial-room-1");
  assert.throws(
    () =>
      s.ledger.append("reserve", {
        jobId: "spatial-courtyard-1",
        microUSD: 3450001,
      }),
    /reservation_mismatch/,
  );
  assert.throws(
    () =>
      s.ledger.append("request", {
        jobId: "spatial-room-1",
        type: "download",
        role: "thumbnail",
      }),
    /recovery_incomplete/,
  );
  const row = s.ledger.entries.find((e) => e.kind === "billing");
  row.data.microUSD = 0;
  assert.throws(
    () => s.ledger.append("test", {}),
    /continuation_prefix_mismatch/,
  );
});
test("legacy live CLI cannot start fresh room at continuation checkpoint", () => {
  const result = spawnSync(
    process.execPath,
    [
      "experiments/phase38-spatial/src/cli.ts",
      "init",
      "--live",
      "--approved-sha=" + COMMIT,
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.ok(!existsSync(new URL("../private-run", import.meta.url)));
});
