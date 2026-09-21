import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";
import {
  qaFixture,
  running,
  commitPlan,
  vaultState,
  seedSource,
} from "./d1-qa-fixture.mjs";

test("D1 QA each typed write and full fence is independently checked in SQL before persistence", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      { plan } = await commitPlan(f, run);
    const stable = await vaultState(f);
    const mutations = [
      (p) => {
        p.writes[0].payload.revision += 7;
      },
      (p) => {
        p.writes[0].payload.loop_state = { forgedReward: true };
      },
      (p) => {
        p.writes[0].expectedVersionId = randomUUID();
      },
      (p) => {
        p.writes[0].payload.campaign_id = randomUUID();
      },
      (p) => {
        p.writes[0].payload.world.threads[0].cursor = 2;
      },
      (p) => {
        p.writes.pop();
      },
      (p) => {
        p.writes.push(structuredClone(p.writes[0]));
      },
      (p) => {
        p.proof.settlement.events[0].text = "Invented authority";
      },
      (p) => {
        p.proof.settlement = null;
      },
      (p) => {
        p.throughWorldMinutes = 121;
      },
      (p) => {
        p.throughWorldMinutes = -1;
      },
      (p) => {
        p.fence.canonGeneration++;
      },
      (p) => {
        p.fence.leaseGeneration++;
      },
      (p) => {
        p.fence.headRevision++;
      },
      (p) => {
        p.fence.inputDigest = "0".repeat(64);
      },
      (p) => {
        p.fence.epoch = 1;
      },
      (p) => {
        p.kind = "noop";
      },
    ];
    for (const mutate of mutations) {
      const bad = structuredClone(plan);
      bad.operationId = randomUUID();
      // Keep the proposal operation stable so failure cannot be attributed only
      // to mismatched event IDs: each mutation begins with a fresh genuine plan.
      const fresh = (await commitPlan(f, run, 30, bad.operationId)).plan;
      mutate(fresh);
      await assert.rejects(() => f.lab("commit", fresh));
      assert.deepEqual(await vaultState(f), stable);
    }
  } finally {
    await f.db.close();
  }
});

test("D1 QA failure after vault writes rolls back every row, manifest and receipt; exact retry can recover", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      { plan } = await commitPlan(f, run);
    const stable = await vaultState(f);
    await f.db.exec(`
      create function pg_temp.qa_fail_manifest() returns trigger language plpgsql as $$
      begin
        if new.schema_version=3 and (new.public_metadata->>'labOrdinal')::integer=1 then
          raise exception 'QA_SYNTHETIC_STORAGE_FAILURE';
        end if;
        return new;
      end $$;
      create trigger qa_fail_manifest before insert on rpg_private.timeline_manifests
      for each row execute function pg_temp.qa_fail_manifest();
    `);
    await assert.rejects(
      () => f.lab("commit", plan),
      /QA_SYNTHETIC_STORAGE_FAILURE/,
    );
    assert.deepEqual(await vaultState(f), stable);
    await f.db.exec(
      "drop trigger qa_fail_manifest on rpg_private.timeline_manifests",
    );
    const result = await f.lab("commit", plan);
    assert.equal(result.run.headRevision, 1);
    assert.deepEqual(await f.lab("commit", plan), result);
  } finally {
    await f.db.close();
  }
});

test("D1 QA new source versions invalidate old leases without rewriting pinned inputs or receipts", async () => {
  const f = await qaFixture();
  try {
    const source = await seedSource(f),
      run = await running(f);
    const first = await commitPlan(f, run),
      committed = await f.lab("commit", first.plan);
    const pending = await commitPlan(f, committed.run, 90);
    const text = "A corrected synthetic harbor.";
    await f.library({
      ...structuredClone(source),
      version: 2,
      previousVersionId: source.versionId,
      versionId: randomUUID(),
      body: {
        ...source.body,
        original: { kind: "text", text },
        digest: createHash("sha256").update(text).digest("hex"),
      },
    });
    const stable = await vaultState(f);
    await assert.rejects(() => f.lab("commit", pending.plan), /rpg_conflict/);
    assert.deepEqual(await vaultState(f), stable);
    const read = await f.lab("read", { runId: run.id });
    assert.equal(read.applicable, false);
    assert.equal(read.run.reason, "source_changed");
    assert.deepEqual(read.run.input, run.input);
    assert.equal(read.run.input.sourceVersionIds[0], source.versionId);
    assert.deepEqual(await f.lab("commit", first.plan), committed);
    assert.equal((await f.store.prepare(f.request)).id, run.id);
    await assert.rejects(() =>
      f.store.prepare({ ...f.request, operationId: randomUUID() }),
    );
  } finally {
    await f.db.close();
  }
});

test("D1 QA SQL independently rejects an approved Pack with unresolved contradictions", async () => {
  const f = await qaFixture();
  try {
    await seedSource(f, (pack) => {
      const conflictId = randomUUID();
      pack.body.claims.push({
        ...structuredClone(pack.body.claims[0]),
        id: randomUUID(),
        text: "Conflicting reviewed claim.",
      });
      pack.body.contradictions = [
        {
          id: conflictId,
          claimIds: pack.body.claims.map((claim) => claim.id),
          status: "unresolved",
          resolution: null,
        },
      ];
      pack.body.approval.reviewedConflictIds = [conflictId];
    });
    await assert.rejects(() => f.store.prepare(f.request));
    const stable = await vaultState(f);
    await assert.rejects(async () => {
      const context = await f.lab("read_detached", {
        saveId: f.request.saveId,
        scenarioVersionId: f.request.scenarioVersionId,
        divergenceVersionId: f.request.divergenceVersionId,
      });
      const { input } = await f.one(
        "select rpg_private.lab_input($1,$2,$3::jsonb,$4::jsonb) input",
        [f.owner, f.cid, JSON.stringify(f.request), JSON.stringify(context)],
      );
      const { digest } = await f.one(
        "select rpg_private.lab_digest($1::jsonb) digest",
        [JSON.stringify(input)],
      );
      await f.lab("prepare", {
        request: f.request,
        input,
        inputDigest: digest,
      });
    });
    assert.deepEqual(await vaultState(f), stable);
  } finally {
    await f.db.close();
  }
});

test("D1 QA SQL exact manifest membership rejects corrupt digests, row keys and family substitutions", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      raw = await f.lab("read_detached", { runId: run.id });
    const rt = raw.versions.find(
      (row) => row.tableName === "rpg_private.runtime_state",
    );
    const base = await f.one(
      "select * from rpg_private.timeline_manifests where id=$1",
      [run.headManifestId],
    );
    const cloneManifest = async (refs) => {
      const id = randomUUID();
      await f.one(
        `insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id)
        values($1,$2,$3,$4::jsonb,$5::jsonb,$6,3,$7)`,
        [
          id,
          f.cid,
          run.timelineId,
          JSON.stringify(refs),
          JSON.stringify(base.public_metadata),
          base.canon_generation,
          run.id,
        ],
      );
      return id;
    };
    for (const mutate of [
      (refs) => {
        refs[rt.tableName] = [randomUUID()];
      },
      (refs) => {
        refs[rt.tableName].push(rt.id);
      },
      (refs) => {
        refs["public.rpg_items"].push(rt.id);
      },
      (refs) => {
        delete refs["rpg_private.world_events"];
      },
      (refs) => {
        refs["rpg_private.world_lab_runs"] = [];
      },
    ]) {
      const refs = structuredClone(raw.manifest.refs);
      mutate(refs);
      const manifestId = await cloneManifest(refs);
      await assert.rejects(() =>
        f.lab("read_detached", { runId: run.id, manifestId }),
      );
    }
    for (const variant of ["digest", "rowKey", "campaignPayload"]) {
      const payload = structuredClone(rt.payload);
      if (variant === "campaignPayload") payload.campaign_id = randomUUID();
      const id = randomUUID();
      await f.one(
        `insert into rpg_private.timeline_versions(id,campaign_id,table_name,row_key,digest,payload,origin_timeline_id)
        values($1,$2,$3,$4,case when $5='digest' then repeat('0',64) else encode(sha256(convert_to($6::jsonb::text,'UTF8')),'hex') end,$6::jsonb,$7)`,
        [
          id,
          f.cid,
          rt.tableName,
          variant === "rowKey" ? randomUUID() : rt.rowKey,
          variant,
          JSON.stringify(payload),
          run.timelineId,
        ],
      );
      const refs = { ...raw.manifest.refs, [rt.tableName]: [id] };
      const manifestId = await cloneManifest(refs);
      await assert.rejects(() =>
        f.lab("read_detached", { runId: run.id, manifestId }),
      );
    }
    await assert.rejects(
      () =>
        f.one(
          "update rpg_private.timeline_versions set digest=repeat('0',64) where id=$1",
          [rt.id],
        ),
      /rpg_immutable_history/,
    );
    await assert.rejects(
      () =>
        f.one(
          "update rpg_private.world_lab_runs set input_digest=repeat('0',64) where id=$1",
          [run.id],
        ),
      /rpg_immutable_history/,
    );
  } finally {
    await f.db.close();
  }
});
