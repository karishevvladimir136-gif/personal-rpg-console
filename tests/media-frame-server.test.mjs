import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import { fixture } from "./media-frame-fixture.mjs";
import * as model from "../src/lib/visual-frame/real-frame.ts";
import * as subjectJob from "../src/lib/visual-frame/subject-job.ts";
import * as mapJob from "../src/lib/visual-frame/map-job.ts";
import * as validation from "../src/lib/persistence/validation.ts";
import * as fence from "../src/lib/saves/fence.ts";
import * as orchestration from "../src/lib/server/media/orchestration.ts";
import * as pricing from "../src/lib/server/media/pricing.ts";
import * as groundingState from "../src/lib/server/media/grounding-state.ts";
import * as png from "../src/lib/server/media/png.ts";
function compile(path, dependencies, env = {}) {
  const compiledModule = { exports: {} },
    source = readFileSync(new URL("../" + path, import.meta.url), "utf8"),
    output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
  runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    TextEncoder,
    structuredClone,
    Uint8Array,
    process: { env },
    require: (name) => dependencies[name] ?? {},
  });
  return compiledModule.exports;
}
async function serverFixture() {
  const f = fixture(),
    owner = randomUUID(),
    rpcCalls = [],
    uploads = [],
    files = new Map();
  let authorized = true;
  class PersistenceError extends Error {
    constructor(code) {
      super(code);
      this.code = code;
    }
  }
  const fakeClient = {
    rpc: async (name, args) => {
      rpcCalls.push({ name, args });
      if (name === "rpg_frame_basis")
        return { data: structuredClone(f.proof), error: null };
      if (name === "rpg_real_frame_lifecycle")
        return {
          data: await f.authority.lifecycle(args.p_mutation),
          error: null,
        };
      if (name === "rpg_real_frame_claim")
        return {
          data: await f.authority.claim(args.p_mutation, args.p_budget_id),
          error: null,
        };
      if (name === "rpg_frame_check_claim")
        return {
          data: await f.authority.checkClaim({
            campaignId: args.p_campaign_id,
            jobId: args.p_job_id,
            jobVersionId: args.p_job_version_id,
            imageSha256: args.p_image_sha256,
          }),
          error: null,
        };
      if (name === "rpg_frame_check_complete")
        return {
          data: await f.authority.checkComplete(
            {
              campaignId: args.p_campaign_id,
              jobId: args.p_job_id,
              jobVersionId: args.p_job_version_id,
              imageSha256: args.p_image_sha256,
            },
            args.p_result,
          ),
          error: null,
        };
      if (name === "rpg_real_frame_draft")
        return {
          data: await f.authority.draft(args.p_mutation, args.p_output),
          error: null,
        };
      if (name === "rpg_real_frame_recovery_receipt")
        return {
          data: await f.authority.recoveryReceipt(args.p_intent),
          error: null,
        };
      if (name === "rpg_frame_draft_pixels") {
        const row = f.snapshot.documents.find((d) => d.id === args.p_job_id),
          frame = row && model.parseRealFrame(row),
          q = f.checkReceipts.get(args.p_job_id);
        if (
          args.p_owner_id !== owner ||
          args.p_campaign_id !== f.snapshot.campaign.id ||
          frame?.status !== "draft" ||
          q?.draftVersionId !== row.current_version_id
        )
          return { data: null, error: { message: "rpg_not_found" } };
        return {
          data: {
            storagePath:
              frame.campaign_id + "/frames/" + row.id + "/output.png",
            imageSha256: frame.review.imageSha256,
          },
          error: null,
        };
      }
      if (name === "rpg_real_frame_complete")
        return {
          data: await f.authority.complete(
            args.p_mutation,
            args.p_asset,
            args.p_output,
          ),
          error: null,
        };
      throw Error("unexpected-rpc");
    },
    storage: {
      from: (bucket) => {
        assert.equal(bucket, "rpg-media");
        return {
          upload: async (path, bytes, options) => {
            uploads.push({ path, options });
            assert.equal(options.upsert, false);
            f.pixels.set(path.split("/")[2], {
              bytes: structuredClone(bytes),
              output: structuredClone(options.metadata.frameOutput),
            });
            files.set(path, {
              bytes: structuredClone(bytes),
              metadata: structuredClone(options.metadata),
            });
            return { data: { path }, error: null };
          },
          download: async (path) =>
            files.has(path)
              ? {
                  data: new Blob([files.get(path).bytes], {
                    type: "image/png",
                  }),
                  error: null,
                }
              : {
                  data: null,
                  error: { status: 404, message: "Object not found" },
                },
          info: async (path) => ({
            data: { metadata: files.get(path).metadata },
            error: null,
          }),
          createSignedUrl: async (path, seconds) => {
            assert.ok(files.has(path));
            assert.ok([60, 300].includes(seconds));
            return {
              data: { signedUrl: "https://synthetic.invalid/private-image" },
              error: null,
            };
          },
        };
      },
    },
  };
  const env = {
    SUPABASE_URL: "https://synthetic.invalid",
    SUPABASE_SERVICE_ROLE_KEY: "SYNTHETIC_SERVICE_ONLY",
    RPG_OWNER_USER_ID: owner,
    OPENAI_API_KEY: "SYNTHETIC_IMAGE_ONLY",
    RPG_FRAME_ENABLED: "true",
    RPG_FRAME_VERIFY_MODEL: "gpt-5.4",
    RPG_FRAME_VERIFY_REASONING: "high",
    RPG_FRAME_MODEL: f.policy.model,
    RPG_MEDIA_BUDGET_ID: f.policy.budgetId,
  };
  const server = compile(
    "src/lib/server/media/server.ts",
    {
      "server-only": {},
      "@supabase/supabase-js": {
        createClient: (url, key, options) => {
          assert.equal(url, env.SUPABASE_URL);
          assert.equal(key, env.SUPABASE_SERVICE_ROLE_KEY);
          assert.equal(options.auth.persistSession, false);
          return fakeClient;
        },
      },
      "../campaign-authorization": {
        authorizeCampaign: async (cid) => {
          if (!authorized || cid !== f.snapshot.campaign.id)
            throw new PersistenceError("forbidden");
          return { user: { id: owner } };
        },
      },
      "../repository": { readCampaign: async () => f.snapshot },
      "../mutation-receipt": {
        readMutationReceipt: async (id, input) => {
          assert.equal(id, owner);
          return f.authority.receipt(input);
        },
      },
      "../errors": {
        PersistenceError,
        databaseError: (error) =>
          new PersistenceError(
            error.message === "rpg_conflict" ? "conflict" : "unavailable",
          ),
      },
      "../../persistence/validation": validation,
      "../../saves/fence": fence,
      "../../visual-frame/real-frame": model,
      "../../visual-frame/subject-job": subjectJob,
      "../../visual-frame/map-job": mapJob,
      "../map-layout": { readMapPlacementsForSnapshot: async () => [] },
      "./orchestration": orchestration,
      "./pricing": pricing,
      "./provider": { openAiFrameProvider: () => f.provider },
      "./png": png,
      "./grounding": { openAiFrameVerifier: () => f.verifier },
      "./grounding-state": groundingState,
    },
    env,
  );
  return {
    f,
    server,
    env,
    rpcCalls,
    uploads,
    files,
    deny: () => (authorized = false),
  };
}
test("production server adapter pins the Lead RPC signatures and persists private PNG/usage metadata before atomic attachment", async () => {
  const h = await serverFixture(),
    q = await h.f.queue(),
    input = h.f.dispatch(q.record);
  const result = await h.server.runMediaFrame({
    action: "media.dispatch",
    input,
  });
  assert.equal(result.status, "draft");
  assert.equal(
    h.f.snapshot.assets.some((a) => a.id === q.record.id),
    false,
  );
  assert.equal(
    await h.server.signedFrameDraft(h.f.snapshot.campaign.id, q.record.id),
    "https://synthetic.invalid/private-image",
  );
  await h.f.accept(q.record.id);
  assert.equal(h.f.providerCalls(), 1);
  assert.equal(h.uploads.length, 1);
  assert.equal(h.uploads[0].options.upsert, false);
  assert.equal(
    h.uploads[0].options.metadata.frameOutput.usage.outputTokens,
    1372,
  );
  const claim = h.rpcCalls.find((r) => r.name === "rpg_real_frame_claim"),
    complete = h.rpcCalls.find((r) => r.name === "rpg_real_frame_draft");
  assert.equal(claim.args.p_budget_id, h.env.RPG_MEDIA_BUDGET_ID);
  assert.equal(complete.args.p_output.usage.outputTokens, 1372);
  assert.equal(complete.args.p_mutation.payload.id, q.record.id);
  assert.doesNotMatch(
    JSON.stringify(result),
    /SYNTHETIC_SERVICE_ONLY|SYNTHETIC_IMAGE_ONLY/,
  );
  assert.equal(
    await h.server.signedFrameImage(h.f.snapshot.campaign.id, q.record.id),
    "https://synthetic.invalid/private-image",
  );
});
test("authorized prepare reads authoritative head/canon proof; client cannot choose head or hidden fields", async () => {
  const h = await serverFixture(),
    input = {
      campaignId: h.f.snapshot.campaign.id,
      timeline: h.f.snapshot.timeline,
      expectedPublicStateRevision: h.f.snapshot.publicState.revision,
      referenceIds: [],
      composition: "wide",
      retryOf: null,
    };
  const frame = await h.server.prepareMediaFrame(input);
  assert.equal(frame.basis.expectedHeadId, h.f.proof.expectedHeadId);
  assert.equal(frame.basis.canonGeneration, h.f.proof.canonGeneration);
  await assert.rejects(
    h.server.prepareMediaFrame({ ...input, expectedHeadId: randomUUID() }),
    (e) => e.code === "validation",
  );
  assert.equal(h.f.providerCalls(), 0);
});
test("standalone subject prepare uses only current public record, server head and shared media policy", async () => {
  const h = await serverFixture();
  const entity = h.f.snapshot.entities[0];
  h.f.snapshot.privateState = { secret: "PRIVATE_IMAGE_CANARY" };
  const job = await h.server.prepareSubjectVisual({
    campaignId: h.f.snapshot.campaign.id,
    timeline: h.f.snapshot.timeline,
    expectedPublicStateRevision: h.f.snapshot.publicState.revision,
    subject: { kind: "entity", id: entity.id },
    referenceIds: [],
    retryOf: null,
  });
  assert.equal(job.schema, 5);
  assert.equal(job.basis.subject.id, entity.id);
  assert.equal(job.model, h.f.policy.model);
  assert.equal(job.basis.expectedHeadId, h.f.proof.expectedHeadId);
  assert.equal(job.basis.canonGeneration, h.f.proof.canonGeneration);
  assert.equal(JSON.stringify(job).includes("PRIVATE_IMAGE_CANARY"), false);
  assert.equal(h.f.providerCalls(), 0);
});
test("disabled/missing explicit image model or budget stays unavailable; no default paid model is selected", async () => {
  for (const field of [
    "RPG_FRAME_ENABLED",
    "RPG_FRAME_MODEL",
    "RPG_MEDIA_BUDGET_ID",
    "OPENAI_API_KEY",
    "RPG_FRAME_VERIFY_MODEL",
    "RPG_FRAME_VERIFY_REASONING",
  ]) {
    const h = await serverFixture();
    delete h.env[field];
    const capability = await h.server.mediaCapability(h.f.snapshot.campaign.id);
    assert.equal(capability.enabled, false);
    assert.equal(capability.model, null);
    assert.equal(h.rpcCalls.length, 0);
    assert.equal(h.f.providerCalls(), 0);
  }
});
test("unauthorized/fake/foreign assets cannot produce signed storage URLs or provider calls", async () => {
  const h = await serverFixture();
  await assert.rejects(
    h.server.signedFrameImage(h.f.snapshot.campaign.id, randomUUID()),
    (e) => e.code === "not_found",
  );
  h.deny();
  await assert.rejects(
    h.server.mediaCapability(h.f.snapshot.campaign.id),
    (e) => e.code === "forbidden",
  );
  await assert.rejects(
    h.server.signedFrameImage(h.f.snapshot.campaign.id, randomUUID()),
    (e) => e.code === "forbidden",
  );
  assert.equal(h.f.providerCalls(), 0);
  assert.equal(h.rpcCalls.length, 0);
});
test("FRAME API keeps ordinary MOCK writes and gates real prepare/dispatch behind the same write policy", async () => {
  const calls = [],
    route = compile("src/app/api/visual-frame/route.ts", {
      "@/lib/visual-frame/server": {
        saveVisualFrame: async (input) => {
          calls.push(["mock", input]);
          return { mock: true };
        },
      },
      "@/lib/server/media/server": {
        prepareMediaFrame: async (input) => {
          calls.push(["prepare", input]);
          return { prepared: true };
        },
        prepareSubjectVisual: async (input) => {
          calls.push(["subject", input]);
          return { subjectPrepared: true };
        },
        runMediaFrame: async (input) => {
          calls.push(["media", input]);
          return { media: true };
        },
        mediaCapability: async (cid) => ({ cid }),
        signedFrameImage: async (cid, id) => {
          calls.push(["image", cid, id]);
          return "https://synthetic.invalid/private";
        },
      },
      "@/lib/persistence/http-policy": {
        readWriteRequest: async (request) => {
          calls.push(["policy"]);
          return request.value;
        },
      },
      "@/lib/persistence/route-response": {
        publicJson: (v) => v,
        errorResponse: (e) => e,
      },
      "@/lib/visual-frame/real-frame": model,
    });
  assert.equal(
    (await route.POST({ value: { operation: "document.save" } })).mock,
    true,
  );
  assert.equal(
    (
      await route.POST({
        value: { action: "media.prepare", input: { campaignId: "synthetic" } },
      })
    ).prepared,
    true,
  );
  assert.equal(
    (
      await route.POST({
        value: { action: "media.recover", input: { requestId: "synthetic" } },
      })
    ).media,
    true,
  );
  assert.equal(
    (
      await route.POST({
        value: { action: "media.prepareSubject", input: { campaignId: "synthetic" } },
      })
    ).subjectPrepared,
    true,
  );
  assert.deepEqual(
    calls.map((r) => r[0]),
    ["policy", "mock", "policy", "prepare", "policy", "media", "policy", "subject"],
  );
});
