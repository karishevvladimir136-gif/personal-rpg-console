import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { integrationFixture, command } from "./d2a-integration-fixture.mjs";
import { seedSource } from "./d1-qa-fixture.mjs";
import { createLabContinuationService } from "../src/lib/world-lab/continuation.ts";
import { writeVisualFrame } from "../src/lib/visual-frame/authority.ts";
import {
  buildFrame,
  newVisualReference,
  visualDocumentMutation,
  mockAssetMutation,
  parseVisualMetadata,
  serializeVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";

const sharedRoot = process.env.FRAME_LIFECYCLE_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.FRAME_LIFECYCLE_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : new URL("../", import.meta.url);
const request = (input, requestId = randomUUID()) => ({ ...input, requestId });
async function visualSqlFixture({
  corrected = true,
  withSource = false,
  withReference = false,
  withReservedMalformed = false,
} = {}) {
  let seededSource = null,
    referenceId = null;
  const f = await integrationFixture({
    beforeSave: async (base) => {
      for (const file of base.files.slice(16, 22))
        await base.db.exec(await readFile(new URL(file, base.folder), "utf8"));
      if (withReservedMalformed)
        await base.mutation(
          "document.save",
          base.cid,
          {
            title: "Malformed reserved history",
            status: "reference",
            body:
              "RPG_VISUAL_FRAME_V0\n" +
              JSON.stringify({ schema: 1, kind: "frame", incomplete: true }),
          },
          0,
          "campaign",
        );
      if (withReference) {
        const current = await base.saves(base.cid, "campaign");
        const reference = {
          ...newVisualReference(current, { kind: "entity", id: base.hero }),
          appearance: "Public amber coat",
          approval: "approved",
        };
        const saved = await base.mutation(
          "document.save",
          base.cid,
          {
            title: "Visual reference: Ari",
            status: "reference",
            body: serializeVisualMetadata(reference),
          },
          0,
          "campaign",
        );
        referenceId = saved.id;
      }
      if (withSource)
        seededSource = await seedSource(base, (pack) => {
          for (const claim of pack.body.claims) {
            claim.knowledge = "canon_at_entry";
            claim.knownByEntityIds = [];
            claim.evidence = claim.evidence.map((e) => ({
              ...e,
              knowledge: "canon_at_entry",
            }));
          }
        });
    },
  });
  try {
    if (corrected)
      await f.db.exec(
        await readFile(
          new URL(
            "supabase/migrations/202609270023_v1_frame_lifecycle.sql",
            sharedRoot,
          ),
          "utf8",
        ),
      );
    const approved = await f.approve(),
      raw = await f.store.prepare(approved.request),
      services = await f.services();
    const parent = await services.lab.perform({
      action: "continue",
      input: command(raw),
    });
    assert.ok(parent.checkpoints.length > 1, parent.reason ?? parent.status);
    const selection = {
      sourceRunId: parent.id,
      sourceCheckpointId: parent.checkpoints.at(-1).id,
      expectedRevision: parent.revision,
    };
    const snapshot = async () => f.saves(f.cid, "campaign");
    const generation = async () =>
      (
        await f.one(
          "select canon_generation from rpg_private.timeline_campaigns where campaign_id=$1",
          [f.cid],
        )
      ).canon_generation;
    const ordinary = async (input) =>
      (
        await f.one(
          "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7) result",
          [
            input.requestId,
            input.operation,
            input.campaignId,
            input.expectedRevision,
            JSON.stringify(input.payload),
            JSON.stringify(input.timeline),
            input.correctionScope ?? null,
          ],
        )
      ).result;
    const frame = async (input, ownerId = f.owner) =>
      (
        await f.one("select public.rpg_frame_lifecycle($1,$2::jsonb) result", [
          ownerId,
          JSON.stringify(input),
        ])
      ).result;
    const receipt = async (input) =>
      (
        await f.one("select public.rpg_mutation_receipt($1,$2::jsonb) result", [
          f.owner,
          JSON.stringify(input),
        ])
      ).result;
    const calls = [];
    const authority = {
      authorize: async (cid) => {
        calls.push("authorize");
        assert.equal(cid, f.cid);
      },
      receipt: async (input) => {
        calls.push("receipt");
        return receipt(input);
      },
      snapshot: async () => {
        calls.push("snapshot");
        return snapshot();
      },
      apply: async (input) => {
        calls.push("ordinary");
        return ordinary(input);
      },
      ...(corrected
        ? {
            applyFrame: async (input) => {
              calls.push("frame");
              return frame(input);
            },
          }
        : {}),
    };
    const continuation = createLabContinuationService({
      ownerId: f.owner,
      execute: f.rpc,
      library: services.library,
      lab: services.lab,
      language: "en",
      models: [
        {
          modelId: "gpt-6-astra",
          label: "Astra",
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
    const base = () => f.lab("continuation_base", selection);
    async function prepareChild() {
      const interpreted = await continuation.perform({
        action: "interpret",
        input: {
          operationId: randomUUID(),
          campaignId: f.cid,
          source: selection,
          premise:
            "What if rain changed the next crossing at this exact checkpoint?",
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
      return accepted.run;
    }
    const queue = async () => {
      const current = await snapshot(),
        metadata = buildFrame(
          current,
          f.scene,
          referenceId ? [referenceId] : [],
          "wide",
        ),
        input = request(visualDocumentMutation(current, metadata));
      const result = await writeVisualFrame(input, authority);
      const next = await snapshot(),
        record = next.documents.find((d) => d.id === result.id);
      return { input, result, metadata, record };
    };
    return {
      ...f,
      parent,
      selection,
      snapshot,
      generation,
      ordinary,
      frame,
      receipt,
      authority,
      calls,
      continuation,
      base,
      prepareChild,
      queue,
      seededSource,
      referenceId,
    };
  } catch (cause) {
    await f.db.close();
    throw cause;
  }
}

test("pre-correction ordinary FRAME queue reproduces Canon generation and eligible checkpoint invalidation", async () => {
  const f = await visualSqlFixture({ corrected: false });
  try {
    const before = await f.generation();
    assert.ok(await f.base());
    const queued = await f.queue();
    assert.equal(parseVisualMetadata(queued.record).kind, "frame");
    assert.equal(await f.generation(), before + 1);
    await assert.rejects(f.base(), /rpg_conflict|rpg_validation/);
    assert.deepEqual(f.calls, ["authorize", "receipt", "snapshot", "ordinary"]);
  } finally {
    await f.db.close();
  }
});

test("FRAME SQL lifecycle preserves eligible checkpoints through queue/fail/cancel/complete and exact retries", async () => {
  const f = await visualSqlFixture();
  try {
    const generation = await f.generation(),
      playable = await f.active();
    for (const status of ["failed", "cancelled", "completed"]) {
      const queued = await f.queue();
      assert.equal(await f.generation(), generation);
      assert.ok(await f.base());
      const replay = await writeVisualFrame(queued.input, f.authority);
      assert.deepEqual(replay, queued.result);
      let asset = null;
      if (status === "completed") {
        const assetInput = request(
          mockAssetMutation(await f.snapshot(), queued.record, queued.metadata),
          queued.record.id,
        );
        asset = await writeVisualFrame(assetInput, f.authority);
        assert.deepEqual(
          await writeVisualFrame(assetInput, f.authority),
          asset,
        );
      }
      const terminal = request(
        visualDocumentMutation(
          await f.snapshot(),
          { ...queued.metadata, status, resultAssetId: asset?.id ?? null },
          queued.record,
        ),
        asset?.id ?? randomUUID(),
      );
      const written = await writeVisualFrame(terminal, f.authority);
      assert.equal(await f.generation(), generation);
      assert.ok(await f.base());
      // Original queue and final attachment receipts replay before changed document preflight.
      assert.deepEqual(
        await writeVisualFrame(queued.input, f.authority),
        queued.result,
      );
      assert.deepEqual(await writeVisualFrame(terminal, f.authority), written);
      const history = await f.query(
        "select version,body from public.rpg_document_versions where campaign_id=$1 and document_id=$2 order by version",
        [f.cid, queued.record.id],
      );
      assert.equal(history.length, 2);
      assert.equal(parseVisualMetadata(history[0]).status, "queued");
      assert.equal(parseVisualMetadata(history[1]).status, status);
    }
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from public.rpg_assets where campaign_id=$1",
          [f.cid],
        )
      ).n,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and text like 'RPG_VISUAL_FRAME_V0%'",
          [f.cid],
        )
      ).n,
      0,
    );
    const child = await f.prepareChild();
    assert.equal(child.startWorldMinutes, f.parent.currentWorldMinutes);
    const after = await f.active();
    for (const family of [
      "public.rpg_entities",
      "public.rpg_items",
      "public.rpg_locations",
    ])
      assert.deepEqual(after.projection[family], playable.projection[family]);
    assert.equal(await f.generation(), generation);
    assert.ok(await f.base());
  } finally {
    await f.db.close();
  }
});

test("dedicated SQL rejects malformed/prefix/true-reference/target/receipt/fence bypasses without an exemption", async () => {
  const f = await visualSqlFixture();
  try {
    const generation = await f.generation(),
      current = await f.snapshot(),
      metadata = buildFrame(current, f.scene, [], "wide"),
      valid = request(visualDocumentMutation(current, metadata));
    const attempts = [
      {
        ...valid,
        requestId: randomUUID(),
        payload: { ...valid.payload, body: "RPG_VISUAL_FRAME_V0\nnot-json" },
      },
      {
        ...valid,
        requestId: randomUUID(),
        payload: {
          ...valid.payload,
          body:
            "RPG_VISUAL_FRAME_V0\n" +
            JSON.stringify({ ...metadata, hidden: "NO_EXTRA_FIELD" }),
        },
      },
      request(
        visualDocumentMutation(
          current,
          newVisualReference(current, { kind: "style", id: f.cid }),
        ),
      ),
      {
        ...valid,
        requestId: randomUUID(),
        payload: { ...valid.payload, status: "canon" },
      },
      { ...valid, requestId: randomUUID(), campaignId: f.other },
      {
        ...valid,
        requestId: randomUUID(),
        timeline: { ...valid.timeline, epoch: valid.timeline.epoch + 1 },
      },
      {
        ...valid,
        requestId: randomUUID(),
        payload: { ...valid.payload, id: current.dmGuideDocumentId },
        expectedRevision: current.documents.find(
          (d) => d.id === current.dmGuideDocumentId,
        ).revision,
      },
    ];
    for (const input of attempts) await assert.rejects(f.frame(input));
    await assert.rejects(f.frame(valid, f.other));
    await f.db.exec("set role authenticated");
    try {
      await assert.rejects(f.frame(valid), (error) => error.code === "42501");
    } finally {
      await f.db.exec("reset role");
    }
    assert.equal(await f.generation(), generation);
    assert.ok(await f.base());
    const queued = await f.queue();
    await assert.rejects(
      f.frame({
        ...queued.input,
        payload: {
          ...queued.input.payload,
          title: "Changed request with reused receipt",
        },
      }),
    );
    const terminal = request(
      visualDocumentMutation(
        await f.snapshot(),
        { ...queued.metadata, status: "failed" },
        queued.record,
      ),
    );
    await writeVisualFrame(terminal, f.authority);
    const latest = (await f.snapshot()).documents.find(
      (d) => d.id === queued.record.id,
    );
    await assert.rejects(
      f.frame(
        request(
          visualDocumentMutation(await f.snapshot(), queued.metadata, latest),
        ),
      ),
    );
    assert.equal(await f.generation(), generation);
    assert.ok(await f.base());
    // A prefix on an ordinary manual document grants no exemption at all.
    await f.ordinary({
      ...valid,
      requestId: randomUUID(),
      payload: {
        ...valid.payload,
        body: "RPG_VISUAL_FRAME_V0\nowner malformed reference correction",
      },
    });
    assert.equal(await f.generation(), generation + 1);
    await assert.rejects(f.base(), /rpg_conflict|rpg_validation/);
  } finally {
    await f.db.close();
  }
});

test("scene revision race after production preflight is rejected by SQL without FRAME generation effects", async () => {
  const f = await visualSqlFixture();
  try {
    const before = await f.generation(),
      current = await f.snapshot(),
      original = current.scenes.find((s) => s.id === f.scene);
    const input = request(
      visualDocumentMutation(current, buildFrame(current, f.scene, [], "wide")),
    );
    const racing = {
      ...f.authority,
      applyFrame: async (mutation) => {
        await f.ordinary(
          request({
            operation: "scene.save",
            campaignId: f.cid,
            timeline: current.timeline,
            correctionScope: "timeline",
            expectedRevision: original.revision,
            payload: {
              id: original.id,
              session_id: original.session_id,
              title: original.title,
              body: original.body + " Owner correction.",
              role: original.role,
            },
          }),
        );
        return f.frame(mutation);
      },
    };
    await assert.rejects(writeVisualFrame(input, racing));
    assert.equal(await f.generation(), before);
    assert.equal(
      (await f.snapshot()).documents.filter(
        (d) => parseVisualMetadata(d)?.kind === "frame",
      ).length,
      0,
    );
    assert.equal(
      (await f.snapshot()).scenes.find((s) => s.id === f.scene).revision,
      original.revision + 1,
    );
  } finally {
    await f.db.close();
  }
});

test("genuine visual reference/factual document corrections retain Canon generation and stale-base invalidation", async () => {
  for (const correction of ["visual reference", "factual document"]) {
    const f = await visualSqlFixture();
    try {
      const generation = await f.generation(),
        current = await f.snapshot();
      assert.ok(await f.base());
      if (correction === "visual reference")
        await writeVisualFrame(
          request(
            visualDocumentMutation(
              current,
              newVisualReference(current, { kind: "entity", id: f.hero }),
            ),
          ),
          f.authority,
        );
      else
        await f.ordinary(
          request({
            operation: "document.save",
            campaignId: f.cid,
            timeline: current.timeline,
            correctionScope: "campaign",
            expectedRevision: 0,
            payload: {
              title: "Owner factual correction",
              status: "canon",
              body: "The public harbor record is corrected by the owner.",
            },
          }),
        );
      assert.equal(await f.generation(), generation + 1);
      await assert.rejects(f.base(), /rpg_conflict|rpg_validation/);
      await assert.rejects(
        f.prepareChild(),
        (error) => error.code === "conflict",
      );
    } finally {
      await f.db.close();
    }
  }
});

test("real immutable private Source correction still invalidates a FRAME-preserved checkpoint and child preparation", async () => {
  const f = await visualSqlFixture({ withSource: true });
  try {
    const generation = await f.generation();
    await f.queue();
    assert.equal(await f.generation(), generation);
    assert.ok(await f.base());
    const original = f.seededSource,
      correctedText = "The owner corrected the original public source.";
    await f.library({
      ...structuredClone(original),
      version: original.version + 1,
      versionId: randomUUID(),
      previousVersionId: original.versionId,
      body: {
        ...original.body,
        visibility: "private",
        original: { kind: "text", text: correctedText },
        digest: sha256(correctedText),
      },
    });
    await assert.rejects(f.base(), /rpg_conflict|rpg_validation/);
    await assert.rejects(
      f.prepareChild(),
      (error) => error.code === "conflict",
    );
  } finally {
    await f.db.close();
  }
});

test("reviewed Visual Bible references support queue/completion and semantic SQL duplicate detection", async () => {
  const f = await visualSqlFixture({
    withReference: true,
    withReservedMalformed: true,
  });
  try {
    const before = await f.generation(),
      queued = await f.queue();
    assert.equal(queued.metadata.basis.references.length, 1);
    assert.equal(queued.metadata.basis.references[0].documentId, f.referenceId);
    const current = await f.snapshot(),
      value = queued.metadata;
    const reordered = {
      resultAssetId: value.resultAssetId,
      art: value.art,
      prompt: value.prompt,
      basis: {
        references: value.basis.references,
        scene: {
          body: value.basis.scene.body,
          title: value.basis.scene.title,
          revision: value.basis.scene.revision,
          id: value.basis.scene.id,
        },
        timeline: value.basis.timeline,
      },
      composition: value.composition,
      status: value.status,
      model: value.model,
      provider: value.provider,
      campaign_id: value.campaign_id,
      kind: value.kind,
      schema: value.schema,
    };
    await assert.rejects(
      f.frame(
        request({
          ...visualDocumentMutation(current, value),
          payload: {
            ...visualDocumentMutation(current, value).payload,
            body: serializeVisualMetadata(reordered),
          },
        }),
      ),
      /rpg_conflict/,
    );
    const asset = await writeVisualFrame(
      request(
        mockAssetMutation(current, queued.record, value),
        queued.record.id,
      ),
      f.authority,
    );
    await writeVisualFrame(
      request(
        visualDocumentMutation(
          await f.snapshot(),
          { ...value, status: "completed", resultAssetId: asset.id },
          queued.record,
        ),
        asset.id,
      ),
      f.authority,
    );
    assert.equal(await f.generation(), before);
    assert.ok(await f.base());
    await f.prepareChild();
  } finally {
    await f.db.close();
  }
});

test("approved visual subject revision race bypassing TypeScript preflight is stopped by SQL", async () => {
  const f = await visualSqlFixture({
    withReference: true,
    withReservedMalformed: true,
  });
  try {
    const before = await f.generation(),
      current = await f.snapshot(),
      hero = current.entities.find((e) => e.id === f.hero);
    const metadata = buildFrame(current, f.scene, [f.referenceId], "wide");
    const racing = {
      ...f.authority,
      applyFrame: async (input) => {
        const {
          id,
          kind,
          name,
          details,
          hp,
          max_hp,
          stats,
          resources,
          conditions,
          equipment_slots,
        } = hero;
        await f.ordinary(
          request({
            operation: "entity.save",
            campaignId: f.cid,
            timeline: current.timeline,
            correctionScope: "timeline",
            expectedRevision: hero.revision,
            payload: {
              id,
              kind,
              name,
              details: details + " Owner source revision.",
              hp,
              max_hp,
              stats,
              resources,
              conditions,
              equipment_slots,
            },
          }),
        );
        return f.frame(input);
      },
    };
    await assert.rejects(
      writeVisualFrame(
        request(visualDocumentMutation(current, metadata)),
        racing,
      ),
      /rpg_conflict/,
    );
    assert.equal(await f.generation(), before);
    assert.equal(
      (await f.snapshot()).documents.filter(
        (d) => parseVisualMetadata(d)?.kind === "frame",
      ).length,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("service-only FRAME delegation accepts an authorized owner with empty auth.uid and restores prior identity", async () => {
  const f = await visualSqlFixture();
  try {
    const before = await f.generation(),
      current = await f.snapshot(),
      input = request(
        visualDocumentMutation(
          current,
          buildFrame(current, f.scene, [], "wide"),
        ),
      );
    await f.one("select set_config('request.jwt.claim.sub','',false)");
    await f.db.exec("set role service_role");
    try {
      const saved = await f.frame(input);
      assert.equal(saved.campaign_id, f.cid);
      assert.equal(
        (
          await f.one(
            "select current_setting('request.jwt.claim.sub',true) sub",
          )
        ).sub,
        "",
      );
      assert.deepEqual(await f.frame(input), saved);
      assert.equal(
        (
          await f.one(
            "select current_setting('request.jwt.claim.sub',true) sub",
          )
        ).sub,
        "",
      );
      await assert.rejects(
        f.frame({ ...input, requestId: randomUUID() }, f.other),
        (error) => error.code === "42501",
      );
    } finally {
      await f.db.exec("reset role");
      await f.one("select set_config('request.jwt.claim.sub',$1,false)", [
        f.owner,
      ]);
    }
    assert.equal(await f.generation(), before);
    assert.ok(await f.base());
    await f.prepareChild();
  } finally {
    await f.db.close();
  }
});
