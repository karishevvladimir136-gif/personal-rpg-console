import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { waveFixture } from "./wave1-integration-fixture.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import {
  description,
  profile,
  proposal,
  draft,
} from "./wave3-compiler-fixtures.mjs";
import { approveInput, packSave } from "./wave2-library-fixtures.mjs";

test("SQL Describe → scripted compiler → explicit review → Pack → pinned campaign preserves provenance", async () => {
  const f = await waveFixture();
  try {
    let calls = 0;
    const store = createRpcLibraryStore(f.owner, async (args) => {
      const response = await f.library(args);
      if (response.error) console.error(response.error);
      return response;
    });
    const service = createOwnerLibraryAuthoring(f.owner, store, {
      resolveProfile: profile,
      compile: async (input) => {
        calls++;
        return {
          output: proposal(input),
          usage: {
            model: input.job.assistance.executionProfile.modelId,
            inputTokens: 80,
            outputTokens: 60,
            calls: 1,
            latencyMs: 1,
          },
        };
      },
    });
    const built = await draft({ service }, [description()]);
    assert.equal(calls, 1);
    assert.equal(built.pack.body.status, "draft");
    assert.ok(
      built.pack.body.claims.every(
        (c) => c.authority === "reference" && c.origin !== "source_fact",
      ),
    );
    const edit = packSave(built.pack);
    edit.claims[0] = {
      ...edit.claims[0],
      knowledge: "canon_at_entry",
      validFrom: 0,
    };
    const edited = await service.execute(edit);
    const reviewed = await service.pack(edited.versionId);
    const approved = await service.execute(
      approveInput(reviewed, { canonClaimIds: [reviewed.body.claims[0].id] }),
    );
    const pack = await store.get("pack", approved.versionId);
    assert.equal(pack.body.status, "approved");
    const cid = await f.campaign();
    const binding = {
      schemaVersion: 1,
      id: randomUUID(),
      campaignId: cid,
      ownerId: f.owner,
      packId: pack.id,
      packVersionId: pack.versionId,
      scenarioVersionId: null,
      sourceVersionIds: pack.body.sourceVersionIds,
      sourcePriority: pack.body.sourcePriority,
      entry: { label: "Owner premise start", worldMinutes: 0, evidence: [] },
      mappings: pack.body.entities.map((e) => ({
        packEntityId: e.id,
        entityId: randomUUID(),
      })),
    };
    await f.write(cid, "bind", { binding });
    const source = built.sources[0];
    await service.execute(
      description({
        sourceId: source.id,
        expectedVersionId: source.versionId,
        text: "Corrected dragon Europe premise.",
      }),
    );
    assert.equal((await f.read(cid)).bindings[0].packVersionId, pack.versionId);
    assert.equal(
      (await store.get("pack", pack.versionId)).body.status,
      "approved",
    );
  } finally {
    await f.db.close();
  }
});
