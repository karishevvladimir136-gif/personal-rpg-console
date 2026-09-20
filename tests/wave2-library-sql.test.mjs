import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { waveFixture } from "./wave1-integration-fixture.mjs";
import {
  sourceInput,
  createDraft,
  packSave,
  approveInput,
} from "./wave2-library-fixtures.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import { prepareOwnerPackBinding } from "../src/lib/world-packs/owner-binding.ts";
import { createRpcPackStore } from "../src/lib/world-packs/bindings.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";

async function sqlAuthoring() {
  const f = await waveFixture();
  const store = createRpcLibraryStore(f.owner, f.library);
  return { ...f, store, service: createOwnerLibraryAuthoring(f.owner, store) };
}

function approvalRecord(draft, ownerId) {
  return {
    ...structuredClone(draft),
    versionId: randomUUID(),
    version: draft.version + 1,
    previousVersionId: draft.versionId,
    body: {
      ...structuredClone(draft.body),
      status: "approved",
      approval: {
        ownerId,
        reviewedConflictIds: draft.body.contradictions.map((c) => c.id),
        reviewedUnknownIds: draft.body.unknowns.map((u) => u.id),
      },
    },
  };
}

const putSql = (f, record, operationId = randomUUID()) =>
  f.library({
    p_owner_id: f.owner,
    p_campaign_id: null,
    p_action: "put",
    p_payload: { operationId, record },
    p_timeline: null,
  });

test("independent QA SQL: actual authoring compiles UTF-8/CRLF evidence, reviews, approves, pins and preserves history after correction", async () => {
  const f = await sqlAuthoring();
  try {
    const original =
      "\ufeffperson: Мара 🌊\r\nlocation: Гавань\r\nalias: Капитан\r\n";
    const { sources, job, pack } = await createDraft(f, [
      sourceInput({ text: original, visibility: "public" }),
    ]);
    assert.equal(pack.status, "draft");
    assert.equal((await f.service.source(sources[0].versionId)).text, original);
    assert.equal(
      (await f.service.source(sources[0].versionId)).digest,
      sha256(original),
    );
    assert.deepEqual(
      pack.evidence.map((e) => e.excerpt),
      original.split("\r\n").filter(Boolean),
    );
    assert.equal(
      (await f.store.get("compiler_job", job.versionId)).body.status,
      "awaiting_review",
    );
    assert.equal((await f.store.read({ kind: "compiler_job" })).length, 5);
    const edit = packSave(pack);
    edit.claims[1] = {
      ...edit.claims[1],
      knowledge: "character",
      validFrom: 0,
      epistemic: "fact",
      knownByEntityIds: [pack.body.entities[0].id],
      uncertainty: null,
    };
    const saved = await f.service.execute(edit);
    const reviewed = await f.service.pack(saved.versionId);
    const approval = approveInput(reviewed, {
      canonClaimIds: [reviewed.body.claims[1].id],
    });
    const approved = await f.service.execute(approval);
    assert.equal(
      (await f.service.pack(approved.versionId)).body.claims[1].authority,
      "approved_canon",
    );
    const campaignId = await f.campaign("QA source-derived campaign");
    const command = await f.foundationCommand(campaignId);
    const binding = await prepareOwnerPackBinding(f.store, {
      ownerId: f.owner,
      campaignId,
      operationId: command.operationId,
      packVersionId: approved.versionId,
      existingBinding: null,
      entry: { label: "QA entry", worldMinutes: 0, evidence: [] },
    });
    const packs = createRpcPackStore(
      f.owner,
      campaignId,
      command.timeline,
      f.store,
      f.rpc,
    );
    const pinned = await packs.bind(command, binding);
    assert.equal(pinned.bindings[0].packVersionId, approved.versionId);
    assert.deepEqual(
      (await packs.bind(command, binding)).bindings,
      pinned.bindings,
    );
    const before = await f.store.get("pack", approved.versionId);
    await f.service.execute(
      sourceInput({
        sourceId: sources[0].id,
        expectedVersionId: sources[0].versionId,
        text: "person: Мара 🌊\r\nlocation: Исправленная гавань\r\n",
        visibility: "public",
      }),
    );
    const after = await f.read(campaignId);
    assert.deepEqual(after.bindings, pinned.bindings);
    assert.deepEqual(await f.store.get("pack", approved.versionId), before);
    assert.equal((await f.service.source(sources[0].versionId)).text, original);
    assert.equal(
      (await f.service.read()).jobs.find((j) => j.id === job.id).status,
      "invalidated",
    );
    assert.deepEqual(
      await f.service.execute(approval),
      approved,
      "exact successful approval receipt remains replayable after later source changes",
    );
    assert.equal(
      (await f.store.read({ kind: "pack", id: approved.id })).length,
      3,
    );
  } finally {
    await f.db.close();
  }
});

test("independent QA SQL: stale approval is rejected at atomic persistence after application validation could have raced", async () => {
  const f = await sqlAuthoring();
  try {
    const { sources, pack } = await createDraft(f, [
      sourceInput({ visibility: "public" }),
    ]);
    const validatedEarlier = approvalRecord(
      await f.store.get("pack", pack.versionId),
      f.owner,
    );
    await f.service.execute(
      sourceInput({
        sourceId: sources[0].id,
        expectedVersionId: sources[0].versionId,
        text: "Corrected after the earlier validation.",
      }),
    );
    const response = await putSql(f, validatedEarlier);
    assert.ok(
      response.error,
      "SQL must reject an already-validated request whose sources changed before persistence",
    );
    assert.match(response.error.message, /conflict|validation/);
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.library_records where version_id=$1",
          [validatedEarlier.versionId],
        )
      ).n,
      0,
    );
    assert.equal((await f.service.pack(pack.versionId)).status, "draft");
  } finally {
    await f.db.close();
  }
});

test("independent QA SQL: exact UTF-16 evidence rejects split-surrogate, wrong-digest and future-source laundering", async () => {
  const f = await sqlAuthoring();
  try {
    const original = "person: 星🌊\r\nnotice: 🧭 astral 🌒\r\n";
    const { pack } = await createDraft(f, [
      sourceInput({
        text: original,
        visibility: "public",
        knowledge: "future_source",
      }),
    ]);
    assert.deepEqual(
      pack.evidence.map((e) => e.excerpt),
      original.split("\r\n").filter(Boolean),
    );
    const draft = await f.store.get("pack", pack.versionId);
    for (const mutate of [
      (r) => {
        r.body.claims[0].evidence[0].digest = "0".repeat(64);
      },
      (r) => {
        r.body.claims[0].evidence[0].locator.value = `0:${original.indexOf("🌊") + 1}`;
        r.body.claims[0].evidence[0].digest = sha256(
          original.slice(0, original.indexOf("🌊") + 1),
        );
      },
      (r) => {
        r.body.claims[0].knowledge = "character";
        r.body.claims[0].knownByEntityIds = [r.body.entities[0].id];
        r.body.claims[0].evidence[0].knowledge = "character";
        r.body.claims[0].validFrom = 0;
      },
    ]) {
      const forged = structuredClone(draft);
      forged.id = randomUUID();
      forged.versionId = randomUUID();
      forged.version = 1;
      forged.previousVersionId = null;
      forged.body.compilerJobVersionId = null;
      mutate(forged);
      const response = await putSql(f, forged);
      assert.ok(response.error, JSON.stringify(forged.body.claims[0].evidence));
      assert.equal(
        (
          await f.one(
            "select count(*)::int n from rpg_private.library_records where version_id=$1",
            [forged.versionId],
          )
        ).n,
        0,
      );
    }
  } finally {
    await f.db.close();
  }
});
