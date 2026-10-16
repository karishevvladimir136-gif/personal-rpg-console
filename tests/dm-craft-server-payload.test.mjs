import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { fixture } from "./phase35-storage-fixture.mjs";
import * as validation from "../src/lib/dm-craft/validation.ts";

// Loads a server-only module with stubbed imports, as the Next.js server would
// run it, so the test exercises the real command handling end to end.
function loadServerModule(file, modules) {
  const source = readFileSync(new URL(`../src/lib/server/${file}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const loaded = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, { filename: file })(
    (name) => Object.hasOwn(modules, name) ? modules[name] :
      (() => { throw new Error(`Unexpected module ${name}`); })(),
    loaded, loaded.exports);
  return loaded.exports;
}

// The Supabase client is replaced by one that forwards rpg_dm_craft to the
// real migrated function in PGlite and reports errors like PostgREST does.
function dmCraftServer(f) {
  const calls = [];
  const errors = loadServerModule("errors.ts", { "server-only": {} });
  const server = loadServerModule("dm-craft.ts", {
    "server-only": {},
    "@supabase/supabase-js": { createClient: () => ({
      rpc: async (name, args) => {
        calls.push({ name, args: structuredClone(args) });
        assert.equal(name, "rpg_dm_craft");
        try {
          const row = await f.one("select public.rpg_dm_craft($1,$2,$3::jsonb) result", [
            args.p_owner_id, args.p_action, JSON.stringify(args.p_payload),
          ]);
          return { data: row.result, error: null };
        } catch (cause) {
          return { data: null, error: { code: cause.code, message: cause.message } };
        }
      },
    }) },
    "./auth": { requireOwner: async () => ({ user: { id: f.owner } }) },
    "./campaign-authorization": { authorizeCampaign: async () => {
      throw new Error("DM Craft must not authorize a campaign");
    } },
    "./errors": errors,
    "../dm-craft/validation": validation,
  });
  return { server, calls };
}

function ownerEnvironment(owner) {
  const names = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RPG_OWNER_USER_ID"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  Object.assign(process.env, {
    SUPABASE_URL: "http://supabase.invalid",
    SUPABASE_SERVICE_ROLE_KEY: "test-placeholder",
    RPG_OWNER_USER_ID: owner,
  });
  return () => {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  };
}

const revisionOf = (view, key) =>
  view.effective.find((row) => row.key === key)?.activationRevision ?? 0;
const activeIdOf = (view, key) =>
  view.effective.find((row) => row.key === key)?.activeVersionId;

test("DM Craft screen restore and approve reach rpg_dm_craft in the shape the RPC accepts", async () => {
  const f = await fixture();
  const restoreEnvironment = ownerEnvironment(f.owner);
  try {
    const { server, calls } = dmCraftServer(f);
    const before = await server.readDmCraft();
    const active = new Set(before.effective.map((row) => row.activeVersionId));
    const pending = before.versions.find((version) => !active.has(version.id));
    assert.ok(pending, "the seeded library has a version that is not active");

    // «Restore this version», exactly as the screen posts it.
    const activate = {
      action: "activate", requestId: randomUUID(), key: pending.key,
      versionId: pending.id, expectedActivationRevision: revisionOf(before, pending.key),
    };
    const activated = await server.executeDmCraft(activate);
    assert.equal(activeIdOf(activated, pending.key), pending.id);
    assert.equal(revisionOf(activated, pending.key), activate.expectedActivationRevision + 1);
    assert.equal(activated.versions.length, before.versions.length);
    // A retried click with the same request replays the stored result.
    assert.deepEqual(await server.executeDmCraft(activate), activated);

    // «Approve new version» of the card just restored, as the editor posts it.
    const save = {
      action: "save", requestId: randomUUID(),
      expectedActivationRevision: revisionOf(activated, pending.key),
      entry: {
        key: pending.key, kind: pending.kind, category: pending.category,
        stages: [...pending.stages], triggers: [...pending.triggers],
        en: { ...pending.en, title: "Owner edited title" }, ru: { ...pending.ru },
        provenance: "Owner manual edit",
      },
    };
    const saved = await server.executeDmCraft(save);
    assert.equal(saved.versions.length, activated.versions.length + 1);
    const created = saved.versions.find((version) => version.id === activeIdOf(saved, pending.key));
    assert.equal(created.en.title, "Owner edited title");
    assert.equal(revisionOf(saved, pending.key), save.expectedActivationRevision + 1);
    assert.deepEqual(await server.executeDmCraft(save), saved);

    // The action travels only as p_action; the payload keeps the RPC's exact fields.
    assert.deepEqual(
      calls.filter((call) => call.args.p_action !== "read")
        .map((call) => [call.args.p_action, Object.keys(call.args.p_payload).sort()]),
      [
        ["activate", ["expectedActivationRevision", "key", "requestId", "versionId"]],
        ["activate", ["expectedActivationRevision", "key", "requestId", "versionId"]],
        ["save", ["entry", "expectedActivationRevision", "requestId"]],
        ["save", ["entry", "expectedActivationRevision", "requestId"]],
      ],
    );

    // A stale revision is still refused by the database, not by payload shape.
    await assert.rejects(
      server.executeDmCraft({ ...activate, requestId: randomUUID() }),
      (error) => error.code === "validation",
    );
    assert.equal(activeIdOf(await server.readDmCraft(), pending.key), created.id);
  } finally {
    restoreEnvironment();
    await f.db.close();
  }
});
