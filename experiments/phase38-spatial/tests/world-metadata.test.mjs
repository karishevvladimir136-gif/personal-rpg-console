import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { worldFence, inspectWorldMetadata } from "../src/world-metadata.ts";
import { worldOutput } from "../src/outputs.ts";
import {
  protocol,
  protocolHash,
  canonical,
  hash,
  must,
  safeFailureReason,
} from "../src/protocol.ts";
import { Ledger, initialize } from "../src/ledger.ts";
import { runNext } from "../src/runner.ts";
import {
  world,
  clock,
  fakeProvider,
  COMMIT,
  credentials,
  asBytes,
} from "./fixtures.mjs";

globalThis.fetch = async () => {
  throw Error("OFFLINE_TEST_NETWORK_FORBIDDEN");
};
const job = protocol.jobs[0];
function context() {
  const started = clock().now();
  const submission = {
    jobId: job.id,
    started,
    model: job.model,
    endpoint: job.endpoint,
    inputHash: hash(canonical(job.input)),
  };
  const operation = {
    operation_id: `op-${job.id}`,
    done: true,
    error: null,
    response: {
      world_id: `world-${job.id}`,
      model: null,
      created_at: null,
      world_prompt: null,
    },
  };
  return { submission, operation, receipt: operation.operation_id };
}
function fixture() {
  const c = context();
  return {
    w: world(job),
    fence: worldFence(c.operation, job, c.receipt, c.submission),
  };
}
function setup(t, mutate) {
  const parent = mkdtempSync(join(tmpdir(), "phase38-correction-"));
  // Cleanup is restricted to the freshly created test directory.
  const root = join(parent, "run");
  initialize(root, COMMIT);
  const ledger = new Ledger(root, COMMIT),
    time = clock(),
    fake = fakeProvider(time, mutate);
  t.after(() => {
    ledger.close();
    rmSync(parent, { recursive: true, force: true });
  });
  return { root, ledger, time, ...fake };
}

test("observed flat shape with changed returned text passes metadata inspection, without treating echo as identity", () => {
  const { w, fence } = fixture();
  // Shape-equivalent synthetic substitute: no real response prompt or signed URL fixture.
  w.world_prompt = {
    type: "text",
    text_prompt: "A recaptioned synthetic room.",
  };
  w.assets.splats.spz_urls["500k"] =
    "https://wlt-ai-cdn.art/synthetic/500k.spz";
  w.assets.splats.spz_urls.full_res =
    "https://wlt-ai-cdn.art/synthetic/full.spz";
  w.assets.splats.semantics_metadata = {
    metric_scale_factor: 2.268181800842285,
    ground_plane_offset: 1.537428617477417,
  };
  const meta = inspectWorldMetadata(w, job, fence);
  assert.equal(meta.promptEchoMatches, false);
  assert.equal(meta.actualModel, "marble-1.1");
  assert.equal(meta.privacy, "private");
  assert.equal(meta.returnedPromptHash, hash(canonical(w.world_prompt)));
  assert.equal(worldOutput(w, job, fence).assets.length, 4);
  assert.ok(!JSON.stringify(meta).includes("recaptioned"));
  assert.ok(!JSON.stringify(meta).includes("https://"));
});

for (const field of ["model", "created_at", "permission", "assets"]) {
  for (const mode of ["null", "omitted"]) {
    test(`documented optional ${field} ${mode} remains unknown, not fabricated`, () => {
      const { w, fence } = fixture();
      if (mode === "null") w[field] = null;
      else delete w[field];
      const meta = inspectWorldMetadata(w, job, fence);
      if (field === "model") assert.equal(meta.actualModel, null);
      if (field === "created_at") assert.equal(meta.createdAt, null);
      if (field === "world_prompt") assert.equal(meta.promptEchoMatches, null);
      if (field === "permission") {
        assert.equal(meta.privacy, "unknown");
        assert.throws(
          () => worldOutput(w, job, fence),
          /world_privacy_unverified/,
        );
      }
      if (field === "assets")
        assert.throws(
          () => worldOutput(w, job, fence),
          /world_assets_unavailable/,
        );
    });
  }
}

test("optional omitted full-world prompt is unknown; null snapshot prompt never supplies identity", () => {
  const { w, fence } = fixture();
  delete w.world_prompt;
  assert.equal(inspectWorldMetadata(w, job, fence).promptEchoMatches, null);
  w.world_prompt = null;
  assert.throws(() => inspectWorldMetadata(w, job, fence), /invalid_object/);
});

test("display name is descriptive, not authoritative request identity", () => {
  const { w, fence } = fixture();
  w.display_name = "";
  assert.equal(inspectWorldMetadata(w, job, fence).displayNameMatches, false);
});

for (const [name, mutate, reason] of [
  [
    "wrong world",
    (w) => {
      w.world_id = "different-world";
    },
    "stale_world_id",
  ],
  [
    "conflicting world alias",
    (w) => {
      w.id = "different-world";
    },
    "stale_world_id",
  ],
  [
    "missing required world ID",
    (w) => {
      delete w.world_id;
    },
    "stale_world_id",
  ],
  [
    "wrong reported model",
    (w) => {
      w.model = "marble-1.1-plus";
    },
    "model_pin",
  ],
  [
    "malformed model",
    (w) => {
      w.model = {};
    },
    "invalid_text",
  ],
  [
    "stale timestamp",
    (w) => {
      w.created_at = "2020-01-01T00:00:00Z";
    },
    "stale_world_time",
  ],
  [
    "malformed timestamp",
    (w) => {
      w.created_at = "not-a-time";
    },
    "stale_world_time",
  ],
  [
    "malformed name",
    (w) => {
      w.display_name = null;
    },
    "world_display_name_shape",
  ],
  [
    "wrong locator",
    (w) => {
      w.world_marble_url = "https://marble.worldlabs.ai/world/other";
    },
    "hosted_world_url",
  ],
  [
    "malformed prompt",
    (w) => {
      w.world_prompt = { type: "text", text_prompt: 123 };
    },
    "world_prompt_shape",
  ],
  [
    "wrong prompt modality",
    (w) => {
      w.world_prompt = { type: "image", text_prompt: "test" };
    },
    "world_prompt_shape",
  ],
  [
    "malformed permission",
    (w) => {
      w.permission = { public: "false" };
    },
    "world_permission_shape",
  ],
  [
    "malformed assets",
    (w) => {
      w.assets = [];
    },
    "invalid_object",
  ],
]) {
  test(`${name} fails closed with safe specific assertion`, () => {
    const { w, fence } = fixture();
    mutate(w);
    assert.throws(
      () => inspectWorldMetadata(w, job, fence),
      (error) => {
        assert.equal(safeFailureReason(error), reason);
        return true;
      },
    );
  });
}

for (const [name, mutate, reason] of [
  [
    "wrong receipt",
    (c) => {
      c.receipt = "wrong-op";
    },
    "stale_request_id",
  ],
  [
    "pending operation",
    (c) => {
      c.operation.done = false;
    },
    "world_operation_incomplete",
  ],
  [
    "failed operation",
    (c) => {
      c.operation.error = { message: "SYNTHETIC_SECRET" };
    },
    "world_operation_incomplete",
  ],
  [
    "wrong reservation job",
    (c) => {
      c.submission.jobId = "spatial-courtyard-1";
    },
    "world_submission_fence",
  ],
  [
    "wrong submitted prompt hash",
    (c) => {
      c.submission.inputHash = hash("changed prompt");
    },
    "world_submission_fence",
  ],
  [
    "wrong endpoint",
    (c) => {
      c.submission.endpoint = "https://unapproved.test";
    },
    "world_submission_fence",
  ],
  [
    "wrong requested model",
    (c) => {
      c.submission.model = "wrong-model";
    },
    "world_submission_fence",
  ],
  [
    "wrong snapshot model",
    (c) => {
      c.operation.response.model = "wrong-model";
    },
    "model_pin",
  ],
  [
    "conflicting operation world",
    (c) => {
      c.operation.metadata = { world_id: "different" };
    },
    "stale_world_id",
  ],
  [
    "fallback",
    (c) => {
      c.operation.fallback = true;
    },
    "unexpected_fallback",
  ],
  [
    "extra attempt",
    (c) => {
      c.operation.provider_attempts = 2;
    },
    "unexpected_attempts",
  ],
]) {
  test(`operation/submission fence rejects ${name}`, () => {
    const c = context();
    mutate(c);
    assert.throws(
      () => worldFence(c.operation, job, c.receipt, c.submission),
      (error) => {
        assert.equal(safeFailureReason(error), reason);
        return true;
      },
    );
  });
}

test("mutated frozen job and cross-campaign-style world substitution cannot bypass fence", () => {
  const c = context();
  assert.throws(
    () =>
      worldFence(
        c.operation,
        { ...job, endpoint: "https://wrong.test" },
        c.receipt,
        c.submission,
      ),
    /world_job_fence/,
  );
  const { w, fence } = fixture();
  assert.throws(
    () => inspectWorldMetadata(w, job, { ...fence, inputHash: hash("wrong") }),
    /world_submission_fence/,
  );
  assert.throws(
    () => inspectWorldMetadata(w, protocol.jobs[1], fence),
    /world_submission_fence/,
  );
});

for (const [name, mutate, reason] of [
  [
    "public world",
    (w) => {
      w.permission.public = true;
    },
    "world_privacy_unverified",
  ],
  [
    "absent privacy proof",
    (w) => {
      w.permission = {};
    },
    "world_privacy_unverified",
  ],
  [
    "invalid scale",
    (w) => {
      w.assets.splats.semantics_metadata.metric_scale_factor = 0;
    },
    "invalid_scale",
  ],
  [
    "missing SPZ",
    (w) => {
      delete w.assets.splats.spz_urls["100k"];
    },
    "invalid_text",
  ],
  [
    "unapproved asset host",
    (w) => {
      w.assets.splats.spz_urls["100k"] = "https://unapproved.test/world.spz";
    },
    "asset_host_not_allowed",
  ],
  [
    "unsafe asset path",
    (w) => {
      w.assets.splats.spz_urls["100k"] =
        "https://wlt-ai-cdn.art/%2e%2e/world.spz";
    },
    "unsafe_url",
  ],
]) {
  test(`metadata compatibility never releases ${name}`, () => {
    const { w, fence } = fixture();
    mutate(w);
    inspectWorldMetadata(w, job, fence);
    assert.throws(
      () => worldOutput(w, job, fence),
      (error) => {
        assert.equal(safeFailureReason(error), reason);
        return true;
      },
    );
  });
}

test("future mock run retains actual unknown provenance and changed-prompt hash; never auto-approves", async (t) => {
  const s = setup(t, ({ type, data, reply }) => {
    if (type === "world") {
      data.model = null;
      data.world_prompt = {
        type: "text",
        text_prompt: "Different synthetic returned caption.",
      };
      reply.bytes = asBytes(data);
    }
  });
  assert.equal(
    (await runNext(s.ledger, s.transport, credentials, s.time)).status,
    "awaiting_output_review",
  );
  const r = JSON.parse(s.ledger.readEvidence(s.ledger.rows("result")[0].file));
  assert.equal(r.actualModel, null);
  assert.equal(r.world.metadata.promptEchoMatches, false);
  assert.equal(s.ledger.rows("approval").length, 0);
  await assert.rejects(
    runNext(s.ledger, s.transport, credentials, s.time),
    /prior_job_not_approved/,
  );
});

for (const [name, change, reason] of [
  [
    "bad URL",
    ({ data, reply }) => {
      data.assets.splats.spz_urls["100k"] =
        "https://unapproved.test/a?secret=SYNTHETIC_SIGNED_TOKEN";
      reply.bytes = asBytes(data);
    },
    "asset_host_not_allowed",
  ],
  [
    "wrong world",
    ({ data, reply }) => {
      data.world_id = "other";
      reply.bytes = asBytes(data);
    },
    "stale_world_id",
  ],
  [
    "invalid JSON",
    ({ reply }) => {
      reply.bytes = Buffer.from('{"secret":"SYNTHETIC_SIGNED_TOKEN"');
    },
    "invalid_json",
  ],
  [
    "credential error",
    () => {
      throw Error("SYNTHETIC_SIGNED_TOKEN");
    },
    "unexplained_or_invalid_response",
  ],
  [
    "forged assertion error",
    () => {
      throw Error("stale_world_id");
    },
    "unexplained_or_invalid_response",
  ],
]) {
  test(`mock ${name}: specific safe stop, identity retained, no asset request or retry`, async (t) => {
    const s = setup(t, (x) => {
      if (x.type === "world") change(x);
    });
    const r = await runNext(s.ledger, s.transport, credentials, s.time);
    assert.equal(r.status, "STOPPED");
    assert.equal(s.ledger.rows("stop")[0].reason, reason);
    assert.equal(s.ledger.rows("world_identity")[0].worldId, `world-${job.id}`);
    const before = readFileSync(join(s.root, "journal.jsonl"));
    const count = s.requests.length;
    await assert.rejects(
      runNext(s.ledger, s.transport, credentials, s.time),
      /experiment_stopped/,
    );
    assert.equal(s.requests.length, count);
    assert.equal(s.requests.filter((x) => x.method === "POST").length, 1);
    assert.equal(
      s.ledger.rows("request").filter((x) => x.type === "download").length,
      0,
    );
    assert.deepEqual(readFileSync(join(s.root, "journal.jsonl")), before);
    assert.ok(!before.includes(Buffer.from("SYNTHETIC_SIGNED_TOKEN")));
    assert.equal(s.ledger.summary().reservedMicroUSD, 1300000);
    assert.equal(s.ledger.summary().knownReportedMicroUSD, 1264000);
  });
}

test("unknown internal codes and external errors never persist their message", () => {
  try {
    must(false, "SYNTHETIC_SECRET");
  } catch (e) {
    assert.equal(safeFailureReason(e), "unexplained_or_invalid_response");
  }
  assert.equal(
    safeFailureReason(new Error("asset_host_not_allowed")),
    "unexplained_or_invalid_response",
  );
});

test("protocol limits and append-only historical recovery remain unchanged", () => {
  assert.equal(
    protocolHash,
    "496360cc4171778eb153009ff4fe445d8ef75b08ab9aa0c4e884452e21c3bacb",
  );
  const recovery = JSON.parse(
    readFileSync(new URL("../results/recovery-001.json", import.meta.url)),
  );
  assert.equal(recovery.currentWorldBodyMatchesOriginal, true);
  assert.equal(recovery.frozenValidator.firstFailure, "stale_prompt");
  assert.equal(recovery.requests.length, 2);
  assert.equal(recovery.generationCalls, 0);
  assert.equal(recovery.assetDownloads, 0);
  assert.equal(recovery.originalLedgerUnchanged, true);
  assert.equal(recovery.world.assets.spz["100k"].allowlisted, false);
});
