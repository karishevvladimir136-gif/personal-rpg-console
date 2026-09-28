import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { isUuid } from "../src/lib/persistence/validation.ts";
import { isTimelineFence, sameTimeline } from "../src/lib/saves/fence.ts";
const errorExports = {};
vm.runInNewContext(
  ts.transpileModule(
    readFileSync(
      new URL("../src/lib/server/errors.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  {
    exports: errorExports,
    require: (name) => {
      assert.equal(name, "server-only");
      return {};
    },
    Error,
  },
);
const { databaseError, PersistenceError } = errorExports;

const owner = "11111111-1111-4111-8111-000000000001",
  cid = "11111111-1111-4111-8111-000000000002";
const input = {
  requestId: owner,
  operation: "document.save",
  campaignId: cid,
  timeline: { timelineId: owner, epoch: 2 },
  expectedRevision: 0,
  correctionScope: "campaign",
  payload: {
    title: "MOCK",
    status: "reference",
    body: "validated by production authority",
  },
};
const result = {
  id: owner,
  revision: 1,
  campaign_id: cid,
  timeline: input.timeline,
};
function load(response, overrides = {}) {
  const calls = [];
  const exports = {},
    code = ts.transpileModule(
      readFileSync(
        new URL(
          "../src/lib/server/frame-lifecycle-mutation.ts",
          import.meta.url,
        ),
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText;
  const stubs = {
    "server-only": {},
    "@supabase/supabase-js": {
      createClient: (url, key, options) => ({
        rpc: async (name, args) => {
          calls.push({ url, key, options, name, args });
          return response;
        },
      }),
    },
    "../persistence/validation": { isUuid },
    "../saves/fence": { isTimelineFence, sameTimeline },
    "./errors": { databaseError, PersistenceError },
  };
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      assert.ok(name in stubs, name);
      return stubs[name];
    },
    process: {
      env: {
        SUPABASE_URL: "http://synthetic.invalid",
        SUPABASE_SERVICE_ROLE_KEY: "SYNTHETIC_NOT_A_CREDENTIAL",
        RPG_OWNER_USER_ID: owner,
        ...overrides,
      },
    },
  });
  return { run: exports.applyFrameLifecycleMutation, calls };
}
test("service helper invokes the one dedicated RPC with exact owner/request and projects safe receipt fields only", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("UNEXPECTED_NETWORK");
  });
  const f = load({
    data: { ...result, privateState: "PRIVATE_CANARY" },
    error: null,
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(await f.run(owner, input))),
    result,
  );
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].name, "rpg_frame_lifecycle");
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls[0].args)), {
    p_owner_id: owner,
    p_mutation: input,
  });
});
test("service helper refuses missing configuration, wrong owner, unsupported mutation and missing timeline before RPC", async () => {
  for (const [env, user, request] of [
    [{ SUPABASE_URL: "" }, owner, input],
    [{}, cid, input],
    [{}, owner, { ...input, operation: "asset.save" }],
    [{}, owner, { ...input, timeline: null }],
  ]) {
    const f = load({ data: result, error: null }, env);
    await assert.rejects(
      f.run(user, request),
      (e) => e instanceof PersistenceError,
    );
    assert.equal(f.calls.length, 0);
  }
});
test("service helper fails closed on DB errors or malformed/foreign/stale returned receipts", async () => {
  for (const data of [
    null,
    { ...result, id: "invalid" },
    { ...result, revision: 0 },
    { ...result, campaign_id: owner },
    { ...result, timeline: { ...input.timeline, epoch: 3 } },
  ]) {
    const f = load({ data, error: null });
    await assert.rejects(
      f.run(owner, input),
      (e) => e instanceof PersistenceError && e.code === "unavailable",
    );
    assert.equal(f.calls.length, 1);
  }
  const f = load({
    data: null,
    error: { message: "rpg_conflict", code: "P0001" },
  });
  await assert.rejects(
    f.run(owner, input),
    (e) => e instanceof PersistenceError && e.code === "conflict",
  );
});
