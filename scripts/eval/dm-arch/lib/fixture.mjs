// Saved states for the bake-off: a campaign's PGlite data directory dumped
// before a scene turn and reopened later, so every variant plays the scene
// from the same state. The reopened fixture mirrors the SQL wrappers of
// tests/phase35-storage-fixture.mjs over the restored database (the fixture
// closes over its own `db`, so it cannot be re-pointed).
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { attachLoop } from "../../../../tests/dm-loop-fixture.mjs";

/** Dump the campaign's database (gzip tar) with the ids the reopened fixture needs. */
export async function dumpState(c, file) {
  const blob = await c.f.db.dumpDataDir("gzip");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await blob.arrayBuffer()));
  await writeFile(`${file}.json`, `${JSON.stringify({ owner: c.f.owner, other: c.f.other ?? null, cid: c.cid, hero: c.hero,
    dumpedAt: new Date().toISOString(), bytes: blob.size }, null, 2)}\n`, "utf8");
  return blob.size;
}

/** Reopen a dumped state as a loop campaign (`attachLoop` over the restored database). */
export async function restoreState(file) {
  const meta = JSON.parse(await readFile(`${file}.json`, "utf8"));
  const bytes = await readFile(file);
  const db = new PGlite({ loadDataDir: new Blob([bytes]) });
  await db.waitReady;
  const owner = meta.owner;
  const query = async (sql, params = []) => (await db.query(sql, params)).rows;
  const one = async (sql, params = []) => (await query(sql, params))[0];
  await one("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
  const saves = async (cid, action, payload = {}, user = owner) =>
    (await one("select public.rpg_saves($1,$2,$3,$4::jsonb) result", [user, cid, action, JSON.stringify(payload)])).result;
  const fence = async (cid) => saves(cid, "fence");
  const command = async (cid, more) => {
    const data = await saves(cid, "read");
    return { requestId: randomUUID(), campaignId: cid, timeline: data.timeline, expectedRevision: data.runtimeRevision,
      expectedSavesRevision: data.revision, ...more };
  };
  const runtime = async (cid, action, payload = {}, bound = undefined) =>
    (await one("select public.rpg_runtime($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [owner, cid, action, JSON.stringify(payload), JSON.stringify(bound ?? (await fence(cid)))])).result;
  const memory = async (cid, action, payload = {}, bound = undefined) =>
    (await one("select public.rpg_memory($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [owner, cid, action, JSON.stringify(payload), JSON.stringify(bound ?? (await fence(cid)))])).result;
  const f = { db, owner, other: meta.other, cid: meta.cid, query, one, saves, fence, command, runtime, memory };
  const c = await attachLoop(f);
  if (c.hero !== meta.hero) throw new Error(`restored state: hero ${c.hero} differs from the dump's ${meta.hero}`);
  return c;
}
