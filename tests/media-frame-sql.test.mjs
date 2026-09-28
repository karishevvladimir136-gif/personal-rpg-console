import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { integrationFixture, command } from "./d2a-integration-fixture.mjs";
import { createLabContinuationService } from "../src/lib/world-lab/continuation.ts";
import {
  buildRealFrame,
  realFrameDocumentMutation,
  parseRealFrame,
} from "../src/lib/visual-frame/real-frame.ts";
import { executeMediaFrame } from "../src/lib/server/media/orchestration.ts";
import { storedPixels } from "../src/lib/server/media/png.ts";
import { png, model, parameters } from "./media-frame-fixture.mjs";
const sharedRoot = process.env.MEDIA_FRAME_SOURCE_ROOT
  ? pathToFileURL(
      process.env.MEDIA_FRAME_SOURCE_ROOT.replaceAll("\\", "/").replace(
        /\/$/,
        "",
      ) + "/",
    )
  : new URL("../", import.meta.url);
async function sqlFixture() {
  const f = await integrationFixture({
    beforeSave: async (base) => {
      for (const file of base.files.slice(16, 23))
        await base.db.exec(await readFile(new URL(file, base.folder), "utf8"));
      await base.db.exec(
        await readFile(
          new URL(
            "supabase/migrations/202609270025_real_frame.sql",
            sharedRoot,
          ),
          "utf8",
        ),
      );
    },
  });
  try {
    await f.db.exec(await readFile(new URL("supabase/migrations/202609280027_frame_grounding.sql", sharedRoot),"utf8"));
    const approved = await f.approve(),
      prepared = await f.store.prepare(approved.request),
      services = await f.services();
    const parent = await services.lab.perform({
      action: "continue",
      input: command(prepared),
    });
    assert.ok(parent.checkpoints.length > 1, parent.reason ?? parent.status);
    const selection = {
      sourceRunId: parent.id,
      sourceCheckpointId: parent.checkpoints.at(-1).id,
      expectedRevision: parent.revision,
    };
    const budgetId = randomUUID(),
      calls = [],
      outputs = new Map();
    let providerCalls = 0;
    await f.one("select public.rpg_media_budget_prepare($1,$2,$3,2000000,5)", [
      f.owner,
      budgetId,
      model,
    ]);
    const snapshot = () => f.saves(f.cid, "campaign");
    const source = async () =>
      (
        await f.one("select public.rpg_frame_basis($1,$2,$3::jsonb) result", [
          f.owner,
          f.cid,
          JSON.stringify(await f.fence(f.cid)),
        ])
      ).result;
    const authority = {
      authorize: async (cid) => {
        calls.push("authorize");
        assert.equal(cid, f.cid);
      },
      receipt: async (input) => {
        calls.push("receipt");
        return (
          await f.one(
            "select public.rpg_mutation_receipt($1,$2::jsonb) result",
            [f.owner, JSON.stringify(input)],
          )
        ).result;
      },
      snapshot: async () => {
        calls.push("snapshot");
        return snapshot();
      },
      source: async () => {
        calls.push("source");
        return source();
      },
      lifecycle: async (input) => {
        calls.push("lifecycle");
        return (
          await f.one(
            "select public.rpg_real_frame_lifecycle($1,$2::jsonb) result",
            [f.owner, JSON.stringify(input)],
          )
        ).result;
      },
      claim: async (input, budget) => {
        calls.push("claim");
        return (
          await f.one(
            "select public.rpg_real_frame_claim($1,$2::jsonb,$3) result",
            [f.owner, JSON.stringify(input), budget],
          )
        ).result;
      },
      checkClaim: async (input) => (await f.one("select public.rpg_frame_check_claim($1,$2,$3,$4,$5) result", [f.owner,input.campaignId,input.jobId,input.jobVersionId,input.imageSha256])).result,
      checkComplete: async (input,result) => (await f.one("select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) result",[f.owner,input.campaignId,input.jobId,input.jobVersionId,input.imageSha256,JSON.stringify(result)])).result,
      complete: async (input, asset, output) => {
        calls.push("complete");
        return (
          await f.one(
            "select public.rpg_real_frame_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
            [
              f.owner,
              JSON.stringify(input),
              JSON.stringify(asset),
              JSON.stringify(output),
            ],
          )
        ).result;
      },
    };
    const deps = {
      authority,
      policy: { model, parameters, reservationUsdMicros: 400000, budgetId },
      store: {
        put: async (cid, id, pixels) =>
          outputs.set(id, structuredClone(pixels)),
        read: async (cid, id) => outputs.get(id) ?? null,
      },
      verifier: {preflight:(frame)=>assert.equal(frame.schema,3),check:async()=>({schemaVersion:1,verdict:{schemaVersion:1,status:"pass",reasons:[]},actualModel:"gpt-5.4",inputTokens:3000,outputTokens:200,latencyMs:10})},
      provider: {
        generate: async (frame, id) => {
          providerCalls++;
          return storedPixels(
            frame.campaign_id,
            id,
            png(),
            { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
            "synthetic-sql",
          );
        },
      },
    };
    const run = (action, input) => executeMediaFrame({ action, input }, deps);
    async function queue(retryOf = null) {
      const current = await snapshot(),
        frame = buildRealFrame(
          current,
          [],
          "wide",
          model,
          parameters,
          await source(),
          retryOf,
        ),
        input = {
          ...realFrameDocumentMutation(current, frame),
          requestId: randomUUID(),
        };
      const result = await run("media.save", input);
      const next = await snapshot();
      return {
        frame,
        input,
        result,
        record: next.documents.find((r) => r.id === result.result.id),
      };
    }
    async function dispatch(record) {
      const current = await snapshot(),
        frame = parseRealFrame(record),
        requestId = randomUUID();
      return {
        ...realFrameDocumentMutation(
          current,
          {
            ...frame,
            status: "generating",
            dispatch: { requestId, reservationUsdMicros: 400000 },
          },
          record,
        ),
        requestId,
      };
    }
    async function cancel(record) {
      const current = await snapshot(),
        frame = parseRealFrame(record);
      return {
        ...realFrameDocumentMutation(
          current,
          { ...frame, status: "cancelled", failure: null },
          record,
        ),
        requestId: randomUUID(),
      };
    }
    const continuation = createLabContinuationService({
      ownerId: f.owner,
      execute: f.rpc,
      library: services.library,
      lab: services.lab,
      language: "en",
      models: [
        {
          modelId: "gpt-6-astra",
          label: "Synthetic composer",
          reasoning: ["max"],
          available: true,
        },
      ],
      compose: async () => ({
        output: f.proposal,
        usage: {
          model: "gpt-6-astra",
          inputTokens: 10,
          outputTokens: 10,
          calls: 1,
          latencyMs: 1,
        },
      }),
    });
    async function child() {
      const interpreted = await continuation.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          source: selection,
          premise:
            "What if rain changed the next crossing from this reviewed checkpoint?",
          model: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "max",
          },
        },
      });
      const accepted = await continuation.perform({
        action: "approve",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          source: selection,
          versionId: interpreted.draft.versionId,
        },
      });
      assert.equal(accepted.run.status, "prepared");
      assert.equal(
        accepted.run.continuation.sourceCheckpointId,
        selection.sourceCheckpointId,
      );
    }
    return {
      ...f,
      snapshot,
      source,
      authority,
      deps,
      calls,
      queue,
      dispatch,
      cancel,
      run,
      budgetId,
      outputs,
      providerCalls: () => providerCalls,
      base: () => f.lab("continuation_base", selection),
      child,
    };
  } catch (cause) {
    await f.db.close();
    throw cause;
  }
}
test("real SQL FRAME queue/claim/complete/cancel/failure leave eligible checkpoint valid and normal approved child prepares", async () => {
  const f = await sqlFixture();
  try {
    const before = await f.source();
    assert.ok(await f.base());
    const q = await f.queue();
    await f.run("media.dispatch", await f.dispatch(q.record));
    const second = await f.queue(q.record.id);
    await f.run("media.save", await f.cancel(second.record));
    const third = await f.queue(second.record.id);
    f.deps.provider.generate = async () => {
      throw new Error("synthetic-transport-loss");
    };
    await assert.rejects(
      f.run("media.dispatch", await f.dispatch(third.record)),
    );
    const current = await f.snapshot();
    assert.equal(
      parseRealFrame(current.documents.find((r) => r.id === third.record.id))
        .status,
      "uncertain",
    );
    assert.deepEqual(await f.source(), before);
    assert.ok(await f.base());
    await f.child();
    assert.equal(f.providerCalls(), 1);
    assert.equal(current.assets.filter((a) => a.id === q.record.id).length, 1);
  } finally {
    await f.db.close();
  }
});
test("actual SQL uncertain completion receipt recovers after factual correction without mutable preflight or duplicate writes", async () => {
  const f = await sqlFixture();
  try {
    const q = await f.queue(),
      dispatch = await f.dispatch(q.record),
      complete = f.authority.complete;
    let retained;
    f.authority.complete = async (...args) => {
      retained = structuredClone(args[0]);
      await complete(...args);
      throw Error("lost-final-response");
    };
    await assert.rejects(f.run("media.dispatch", dispatch));
    const current = await f.snapshot(),
      scene = current.scenes.find(
        (s) => s.id === current.publicState.current_scene_id,
      );
    await f.mutation(
      "scene.save",
      f.cid,
      {
        id: scene.id,
        title: scene.title,
        body: scene.body + " Corrected visible detail.",
        role: scene.role,
        session_id: scene.session_id,
      },
      scene.revision,
      "timeline",
    );
    await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Owner factual correction",
        status: "canon",
        body: "The known visible harbor fact was corrected.",
      },
      0,
      "campaign",
    );
    await assert.rejects(f.base(), /rpg_conflict|rpg_validation/);
    f.calls.length = 0;
    const recovered = await f.run("media.recover", retained);
    assert.equal(recovered.status, "completed");
    assert.deepEqual(f.calls, ["authorize", "receipt"]);
    assert.equal(
      (await f.snapshot()).assets.filter((a) => a.id === q.record.id).length,
      1,
    );
    assert.equal(f.providerCalls(), 1);
  } finally {
    await f.db.close();
  }
});
test("SQL catches source revision race after TS preflight before atomic claim and reserves no cost", async () => {
  const f = await sqlFixture();
  try {
    const q = await f.queue(),
      input = await f.dispatch(q.record),
      claim = f.authority.claim;
    f.authority.claim = async (...args) => {
      const current = await f.snapshot(),
        scene = current.scenes.find(
          (s) => s.id === current.publicState.current_scene_id,
        );
      await f.mutation(
        "scene.save",
        f.cid,
        {
          id: scene.id,
          title: scene.title,
          body: scene.body + " Owner correction.",
          role: scene.role,
          session_id: scene.session_id,
        },
        scene.revision,
        "timeline",
      );
      return claim(...args);
    };
    await assert.rejects(f.run("media.dispatch", input), /rpg_conflict/);
    assert.equal(
      (
        await f.one(
          "select reserved_usd_micros from rpg_private.media_budgets where id=$1",
          [f.budgetId],
        )
      ).reserved_usd_micros,
      0,
    );
    assert.equal(f.providerCalls(), 0);
  } finally {
    await f.db.close();
  }
});
test("service SQL restores empty auth subject, rejects other owner and has no browser RPC grants", async () => {
  const f = await sqlFixture();
  try {
    const q = await f.queue();
    await f.one("select set_config('request.jwt.claim.sub','',false)");
    const replay = (
      await f.one(
        "select public.rpg_real_frame_lifecycle($1,$2::jsonb) result",
        [f.owner, JSON.stringify(q.input)],
      )
    ).result;
    assert.equal(replay.id, q.record.id);
    assert.equal(
      (await f.one("select current_setting('request.jwt.claim.sub',true) sub"))
        .sub,
      "",
    );
    await assert.rejects(
      f.one("select public.rpg_real_frame_lifecycle($1,$2::jsonb)", [
        f.other,
        JSON.stringify(q.input),
      ]),
      /rpg_forbidden/,
    );
    for (const role of ["anon", "authenticated"])
      for (const name of [
        "rpg_real_frame_lifecycle(uuid,jsonb)",
        "rpg_real_frame_claim(uuid,jsonb,uuid)",
        "rpg_real_frame_complete(uuid,jsonb,jsonb,jsonb)",
        "rpg_frame_basis(uuid,uuid,jsonb)",
      ]) {
        assert.equal(
          (
            await f.one(
              "select has_function_privilege($1,$2,'execute') allowed",
              [role, "public." + name],
            )
          ).allowed,
          false,
        );
      }
  } finally {
    await f.db.close();
  }
});
