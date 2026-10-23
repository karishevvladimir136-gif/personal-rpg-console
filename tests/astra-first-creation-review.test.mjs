import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { astraFirstCreationReviewReady } from "../src/lib/adventures/astra-startup-review.ts";

const require = createRequire(import.meta.url);
const narrative = { sheet: { schemaVersion: 1, mode: "narrative" } };
const structured = { sheet: { schemaVersion: 1, mode: "structured_rpg" },
  mechanics: { hp: 10, attack: 1, defense: 11, skill: 2,
    weaponName: null, weaponDamage: null } };

function serverFixture({ replay = false } = {}) {
  const calls = { client: 0, performed: 0, rpc: [] };
  class PersistenceError extends Error {
    constructor(code) { super(code); this.code = code; }
  }
  const modules = {
    "server-only": {},
    "@supabase/supabase-js": { createClient: () => {
      calls.client++;
      return { rpc: async (name, args) => {
        calls.rpc.push({ name, args });
        return { data: { approved: replay }, error: null };
      } };
    } },
    "./auth": { requireOwner: async () => ({ user: { id: "owner" } }) },
    "./campaign-authorization": { authorizeCampaign: async () => ({ user: { id: "owner" } }) },
    "./errors": { PersistenceError },
    "../adventures/bootstrap-service.ts": { createBootstrapService: () => ({
      perform: async () => { calls.performed++; return "accepted"; },
    }) },
    "../adventures/astra-startup-review.ts": { astraFirstCreationReviewReady },
    "./adventure-bootstrap-provider.ts": { createBootstrapProvider: () => () => {} },
    "./hero-draft-provider.ts": { createHeroDraftProvider: () => () => {} },
    "../adventures/hero-draft-request.ts": { HERO_DRAFT_DM: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } },
    "../model-runtime/registry.ts": { resolveExecutionProfile: () => ({}) },
    "../model-runtime/defaults.ts": { applicationModelSelection: () => ({}) },
    "./model-runtime/profiles.ts": { executionProviderOptions: () => ({}) },
    "./dm-settings": { readDmSettings: async () => ({ dmTurn: null }) },
    "./campaign-rules-system": { applyWorldRulesSystem: async () => {} },
  };
  const source = readFileSync(new URL("../src/lib/server/adventure-bootstrap.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`,
    { filename: "adventure-bootstrap.ts" })(
      (name) => name === "node:crypto" ? require(name) :
        Object.hasOwn(modules, name) ? modules[name] :
          (() => { throw new Error(`Unexpected module ${name}`); })(),
      loadedModule, loadedModule.exports);
  return { performBootstrap: loadedModule.exports.performBootstrap, calls };
}

test("modern Astra-first creation requires a structured sheet and reviewed mechanics", () => {
  assert.equal(astraFirstCreationReviewReady(narrative), false);
  assert.equal(astraFirstCreationReviewReady({ sheet: structured.sheet }), false);
  assert.equal(astraFirstCreationReviewReady(structured), true);
  assert.equal(astraFirstCreationReviewReady({}), true); // historical v1 draft
});

test("direct creation.commit cannot bypass Astra-first review; v1 and flag-off recovery remain", async () => {
  const previous = {
    flag: process.env.RPG_ASTRA_PRIMARY_P1,
    owner: process.env.RPG_OWNER_USER_ID,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  try {
    process.env.RPG_OWNER_USER_ID = "owner";
    process.env.SUPABASE_URL = "http://synthetic.invalid";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-test-key";
    process.env.RPG_ASTRA_PRIMARY_P1 = "1";
    const blocked = serverFixture();
    const narrativeInput = { requestId: "existing-or-new", review: narrative };
    await assert.rejects(blocked.performBootstrap({ action: "creation.commit",
      input: narrativeInput }), { code: "validation" });
    assert.equal(blocked.calls.client, 1);
    assert.equal(blocked.calls.performed, 0);
    assert.deepEqual(blocked.calls.rpc, [{ name: "rpg_bootstrap", args: {
      p_owner_id: "owner", p_campaign_id: null,
      p_action: "creation_replay_status", p_payload: narrativeInput,
    } }]);
    const exactReplay = serverFixture({ replay: true });
    assert.equal(await exactReplay.performBootstrap({ action: "creation.commit",
      input: narrativeInput }), "accepted");
    assert.equal(exactReplay.calls.performed, 1);
    assert.equal(exactReplay.calls.rpc.length, 1);
    const ready = serverFixture();
    assert.equal(await ready.performBootstrap({ action: "creation.commit",
      input: { review: structured } }), "accepted");
    const historical = serverFixture();
    assert.equal(await historical.performBootstrap({ action: "creation.commit",
      input: { review: {} } }), "accepted");
    process.env.RPG_ASTRA_PRIMARY_P1 = "0";
    const legacy = serverFixture();
    assert.equal(await legacy.performBootstrap({ action: "creation.commit",
      input: { review: narrative } }), "accepted");
  } finally {
    const values = [
      ["RPG_ASTRA_PRIMARY_P1", previous.flag],
      ["RPG_OWNER_USER_ID", previous.owner],
      ["SUPABASE_URL", previous.url],
      ["SUPABASE_SERVICE_ROLE_KEY", previous.key],
    ];
    for (const [name, value] of values) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
