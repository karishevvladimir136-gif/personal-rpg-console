import test from "node:test";
import assert from "node:assert/strict";
import { testConfig, testOptIn } from "../scripts/persistence-fixtures.mjs";

function configured(url, check) {
  const names = [
    "RPG_ALLOW_DISPOSABLE_TESTS", "SUPABASE_URL", "SUPABASE_ANON_KEY",
    "RPG_TEST_OWNER_EMAIL", "RPG_TEST_OWNER_PASSWORD",
  ];
  const prior = new Map(names.map((name) => [name, process.env[name]]));
  Object.assign(process.env, {
    RPG_ALLOW_DISPOSABLE_TESTS: testOptIn,
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: "synthetic_key_only",
    RPG_TEST_OWNER_EMAIL: "synthetic@example.invalid",
    RPG_TEST_OWNER_PASSWORD: "synthetic_password_only",
  });
  try { check(); }
  finally {
    for (const [name, value] of prior)
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
  }
}

test("synthetic acceptance refuses the normal owner Supabase port even with test opt-in", () => {
  configured("http://127.0.0.1:54321", () =>
    assert.throws(testConfig, /normal owner Supabase project/));
});

test("synthetic acceptance allows a separately configured local disposable port", () => {
  configured("http://127.0.0.1:55321", () =>
    assert.equal(testConfig().url, "http://127.0.0.1:55321"));
});
