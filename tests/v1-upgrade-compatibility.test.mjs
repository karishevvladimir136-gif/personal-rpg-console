import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fixture } from "./phase35-storage-fixture.mjs";

for (const prefix of [1, 7, 9, 10, 11, 12, 13, 14, 16, 20]) {
  test(`V1 additive upgrade preserves populated prefix ${prefix}, immutable saves and existing document history`, async (t) => {
    t.mock.method(globalThis, "fetch", () => {
      throw Error("UNEXPECTED_NETWORK");
    });
    const f = await fixture(prefix);
    try {
      const cid = await f.campaign(`Historical prefix ${prefix}`);
      const document = await f.mutation(
        "document.save",
        cid,
        {
          title: "Preserved owner reference",
          status: "reference",
          body: "Historical ordinary reference evidence.",
        },
        0,
        "campaign",
      );
      const versions = await f.query(
        "select id,document_id,version,title,status,body from public.rpg_document_versions where campaign_id=$1 and document_id=$2 order by version",
        [cid, document.id],
      );
      let save = null,
        manifest = null;
      if (prefix >= 9) {
        await f.saves(
          cid,
          "create",
          await f.command(cid, {
            kind: "manual",
            name: "Preserved checkpoint",
          }),
        );
        save = await f.one(
          "select * from rpg_private.save_points where campaign_id=$1 and name=$2",
          [cid, "Preserved checkpoint"],
        );
        manifest = await f.one(
          "select id,refs,public_metadata,canon_generation,schema_version from rpg_private.timeline_manifests where id=$1",
          [save.manifest_id],
        );
      }
      for (const file of f.files.slice(prefix))
        await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
      assert.deepEqual(
        await f.query(
          "select id,document_id,version,title,status,body from public.rpg_document_versions where campaign_id=$1 and document_id=$2 order by version",
          [cid, document.id],
        ),
        versions,
      );
      assert.equal(
        (
          await f.one("select body from public.rpg_documents where id=$1", [
            document.id,
          ])
        ).body,
        "Historical ordinary reference evidence.",
      );
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
            [cid],
          )
        ).n,
        0,
      );
      if (save) {
        assert.deepEqual(
          await f.one(
            "select id,refs,public_metadata,canon_generation,schema_version from rpg_private.timeline_manifests where id=$1",
            [save.manifest_id],
          ),
          manifest,
        );
        await f.saves(
          cid,
          "load",
          await f.command(cid, {
            saveId: save.id,
            label: "Recovered checkpoint",
            recovery: false,
          }),
        );
        assert.equal(
          (
            await f.one("select body from public.rpg_documents where id=$1", [
              document.id,
            ])
          ).body,
          "Historical ordinary reference evidence.",
        );
        assert.equal(
          (
            await f.one(
              "select count(*)::integer n from rpg_private.world_lab_runs where campaign_id=$1",
              [cid],
            )
          ).n,
          0,
        );
      }
    } finally {
      await f.db.close();
    }
  });
}
