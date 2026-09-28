import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { fixture as frameFixture } from "./media-frame-fixture.mjs";
import * as model from "../src/lib/scene-video/model.ts";
import * as frame from "../src/lib/visual-frame/real-frame.ts";
import * as validation from "../src/lib/persistence/validation.ts";
import * as fence from "../src/lib/saves/fence.ts";
function compile(path, deps, env = {}) {
  const compiledModule = { exports: {} };
  runInNewContext(
    ts.transpileModule(
      readFileSync(new URL("../" + path, import.meta.url), "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
    {
      module: compiledModule,
      exports: compiledModule.exports,
      process: { env },
      Response,
      URL,
      require: (n) => deps[n] ?? {},
    },
  );
  return compiledModule.exports;
}
async function fixture() {
  const f = frameFixture(),
    q = await f.queue();
  await f.run("media.dispatch", f.dispatch(q.record));
  await f.accept(q.record.id);
  const owner = randomUUID(),
    calls = [];
  let deny = false,
    proof = f.proof;
  class E extends Error {
    constructor(code) {
      super(code);
      this.code = code;
    }
  }
  const env = {
    SUPABASE_URL: "https://synthetic.invalid",
    SUPABASE_SERVICE_ROLE_KEY: "SYNTHETIC_SERVICE_SECRET",
    RPG_OWNER_USER_ID: owner,
    RPG_MEDIA_BUDGET_ID: randomUUID(),
    RPG_VIDEO_ENABLED: "true",
    RPG_VIDEO_MODEL: model.VIDEO_MODEL,
    FAL_KEY: "SYNTHETIC_FAL_SECRET",
  };
  const client = {
    rpc: async (name, args) => {
      calls.push([name, args]);
      if (name === "rpg_video_source") return { data: proof, error: null };
      return { data: null, error: { message: "rpg_not_found" } };
    },
    storage: {
      from: () => ({
        createSignedUrl: async () => {
          assert.fail("forged/unverified video must never get a signed URL");
        },
      }),
    },
  };
  const authorizeCampaign = async (cid) => {
    if (deny || cid !== f.snapshot.campaign.id) throw new E("forbidden");
    return { user: { id: owner } };
  };
  const server = compile(
    "src/lib/server/media/video-server.ts",
    {
      "@supabase/supabase-js": { createClient: () => client },
      "../campaign-authorization": { authorizeCampaign },
      "../repository": { readCampaign: async () => f.snapshot },
      "../mutation-receipt": { readMutationReceipt: async () => null },
      "../errors": {
        PersistenceError: E,
        databaseError: () => new E("not_found"),
      },
      "../../persistence/validation": validation,
      "../../saves/fence": fence,
      "../../visual-frame/real-frame": frame,
      "../../scene-video/model": model,
      "./video-orchestration": {
        executeSceneVideo: () =>
          assert.fail(
            "capability/prepare/read must never execute a generation",
          ),
      },
      "./video-provider": {
        falVideoProvider: () => assert.fail("no provider"),
        MAX_VIDEO_BYTES: 60_000_000,
      },
    },
    env,
  );
  const intent = () => ({
    campaignId: f.snapshot.campaign.id,
    timeline: f.snapshot.timeline,
    expectedPublicStateRevision: f.snapshot.publicState.revision,
    sourceAssetId: q.record.id,
    retryOf: null,
  });
  return {
    f,
    server,
    env,
    calls,
    intent,
    deny: () => {
      deny = true;
    },
    invalidate: () => {
      proof = { ...proof, canonGeneration: proof.canonGeneration + 1 };
    },
  };
}
test("VIDEO capability is authorized, disabled by default and never exposes credential material", async () => {
  const h = await fixture();
  const c = await h.server.videoCapability(h.f.snapshot.campaign.id);
  assert.equal(c.enabled, true);
  assert.equal(c.model, model.VIDEO_MODEL);
  assert.equal(c.reservationUsdMicros, 7_000_000);
  assert.doesNotMatch(JSON.stringify(c), /SYNTHETIC.*SECRET/);
  assert.equal(h.calls.length, 0);
  h.deny();
  await assert.rejects(
    h.server.videoCapability(h.f.snapshot.campaign.id),
    (e) => e.code === "forbidden",
  );
});
for (const field of [
  "RPG_VIDEO_ENABLED",
  "RPG_VIDEO_MODEL",
  "FAL_KEY",
  "RPG_MEDIA_BUDGET_ID",
])
  test(
    "missing " + field + " fails closed with no model default/provider work",
    async () => {
      const h = await fixture();
      delete h.env[field];
      const c = await h.server.videoCapability(h.f.snapshot.campaign.id);
      assert.equal(c.enabled, false);
      assert.equal(c.model, null);
      await assert.rejects(
        h.server.prepareSceneVideo(h.intent()),
        (e) => e.code === "not_configured",
      );
      assert.equal(h.calls.length, 0);
    },
  );
test("prepared proposal derives only accepted current FRAME, exact source proof and fixed parameters", async () => {
  const h = await fixture(),
    p = await h.server.prepareSceneVideo(h.intent());
  assert.equal(p.status, "queued");
  assert.equal(p.source.assetId, h.intent().sourceAssetId);
  assert.equal(
    p.source.ownerApprovalRequestId,
    frame.ownerAcceptedFrameAsset(h.f.snapshot, h.f.snapshot.assets[0])
      .ownerApproval.requestId,
  );
  assert.deepEqual(p.parameters, model.VIDEO_PARAMETERS);
  assert.deepEqual(
    h.calls.map((c) => c[0]),
    ["rpg_video_source"],
  );
});
test("client cannot inject prompt, URL, arbitrary model, manifest or authority into prepare", async () => {
  for (const field of [
    "prompt",
    "sourceUrl",
    "model",
    "expectedHeadId",
    "canonGeneration",
    "privateIds",
  ]) {
    const h = await fixture();
    await assert.rejects(
      h.server.prepareSceneVideo({ ...h.intent(), [field]: "forged" }),
      (e) => e.code === "validation",
    );
    assert.equal(h.calls.length, 0);
  }
});
test("stale timeline/public basis fails before RPC; genuine Canon correction rejects prepared source", async () => {
  const h = await fixture();
  await assert.rejects(
    h.server.prepareSceneVideo({
      ...h.intent(),
      expectedPublicStateRevision: 0,
    }),
    (e) => e.code === "conflict",
  );
  assert.equal(h.calls.length, 0);
  h.invalidate();
  await assert.rejects(
    h.server.prepareSceneVideo(h.intent()),
    (e) => e.code === "conflict",
  );
  assert.equal(h.calls.length, 1);
});
test("foreign campaign source has no provider or signing privilege", async () => {
  const h = await fixture();
  await assert.rejects(
    h.server.prepareSceneVideo({ ...h.intent(), campaignId: randomUUID() }),
    (e) => e.code === "forbidden",
  );
  await assert.rejects(
    h.server.signedSceneVideo(h.f.snapshot.campaign.id, randomUUID()),
    (e) => e.code === "not_found",
  );
  h.deny();
  await assert.rejects(
    h.server.signedSceneVideo(h.f.snapshot.campaign.id, randomUUID()),
    (e) => e.code === "forbidden",
  );
  assert.equal(h.calls.length, 0);
});
test("VIDEO route uses existing write policy and safe errors; read-only capability never dispatches", async () => {
  const calls = [],
    route = compile("src/app/api/scene-video/route.ts", {
      "@/lib/persistence/http-policy": {
        readWriteRequest: async (r) => {
          calls.push("policy");
          if (r.deny) throw Error("safe-denial");
          return r.value;
        },
      },
      "@/lib/persistence/route-response": {
        publicJson: (v) => v,
        errorResponse: () => ({ safe: "unavailable" }),
      },
      "@/lib/visual-frame/real-frame": frame,
      "@/lib/server/media/video-server": {
        prepareSceneVideo: async (v) => {
          calls.push("prepare");
          return v;
        },
        runSceneVideo: async () => {
          calls.push("run");
          return {};
        },
        videoCapability: async () => {
          calls.push("capability");
          return { enabled: false };
        },
        signedSceneVideo: async () => {
          throw Error("private");
        },
      },
    });
  await route.POST({ value: { action: "video.prepare", input: {} } });
  assert.deepEqual(calls, ["policy", "prepare"]);
  await route.GET({
    url: "https://synthetic.invalid/api/scene-video?action=capability&campaignId=x",
  });
  assert.equal(calls.at(-1), "capability");
  const denied = await route.POST({ deny: true });
  assert.equal(denied.safe, "unavailable");
  assert(!calls.includes("run"));
  assert.equal(route.maxDuration, 120);
});
