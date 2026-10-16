// The sandbox launcher's pure parts (docs/SANDBOX.md): the derived config,
// the CLI status parsing and the app environment that keeps the owner's real
// Supabase values out of the sandbox.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appEnvironment, parseStatusEnv, sandboxConfig } from "../scripts/sandbox-start.mjs";

test("the sandbox config is the committed config with its own project and ports", () => {
  const derived = sandboxConfig(readFileSync(new URL("../supabase/config.toml", import.meta.url), "utf8"));
  assert.match(derived, /^project_id = "personal-rpg-console-sandbox"$/m);
  assert.doesNotMatch(derived, /3432\d/);
  for (const port of [44320, 44321, 44322, 44323, 44324, 44327]) assert.ok(derived.includes(String(port)), String(port));
  assert.match(derived, /\[analytics\]\nenabled = false/);
  assert.match(derived, /site_url = "http:\/\/127\.0\.0\.1:3100"/);
  assert.throws(() => sandboxConfig('project_id = "x"\n[api]\nport = 1\n'), /changed shape/);
});

test("the CLI status is read as key=value lines", () => {
  const status = parseStatusEnv('API_URL="http://127.0.0.1:44321"\nANON_KEY="anon.key"\nSERVICE_ROLE_KEY="service.key"\nDB_URL="postgresql://x"\n');
  assert.equal(status.get("API_URL"), "http://127.0.0.1:44321");
  assert.equal(status.get("SERVICE_ROLE_KEY"), "service.key");
});

test("the app environment carries the AI keys but never the real project or owner", () => {
  const status = parseStatusEnv('API_URL="http://127.0.0.1:44321"\nANON_KEY="sandbox-anon"\nSERVICE_ROLE_KEY="sandbox-service"\n');
  const dotEnv = new Map([["OPENAI_API_KEY", "sk-test"], ["SUPABASE_URL", "http://127.0.0.1:34321"],
    ["SUPABASE_SERVICE_ROLE_KEY", "real-service"], ["RPG_OWNER_USER_ID", "real-owner"], ["NODE_ENV", "production"]]);
  const env = appEnvironment({ PATH: "/bin", SUPABASE_URL: "http://127.0.0.1:34321", RPG_LOCAL_OWNER_PASSWORD: "real" }, dotEnv, status,
    { id: "11111111-1111-4111-8111-111111111111", email: "owner@sandbox.local", password: "pw" }, { fake: true });
  assert.equal(env.PATH, "/bin");
  assert.equal(env.OPENAI_API_KEY, "sk-test");
  assert.equal(env.SUPABASE_URL, "http://127.0.0.1:44321");
  assert.equal(env.SUPABASE_PUBLISHABLE_KEY, "sandbox-anon");
  assert.equal(env.SUPABASE_SERVICE_ROLE_KEY, "sandbox-service");
  assert.equal(env.RPG_OWNER_USER_ID, "11111111-1111-4111-8111-111111111111");
  assert.equal(env.RPG_LOCAL_OWNER_PASSWORD, "pw");
  assert.equal(env.RPG_TRUSTED_LOCAL_OWNER, "1");
  assert.equal(env.RPG_DM_FAKE_MODEL, "1");
  assert.equal(env.NODE_ENV, "development");
  assert.ok(!Object.values(env).includes("real-service") && !Object.values(env).includes("real-owner"));
  assert.equal(appEnvironment({}, new Map(), status, { id: "x", email: "e", password: "p" }, { fake: false }).RPG_DM_FAKE_MODEL, undefined);
});
