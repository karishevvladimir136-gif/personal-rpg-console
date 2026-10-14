import test from "node:test";
import assert from "node:assert/strict";
import {
  appHealthFromResponse, appProcessSpec, excludedPortOverlap, listenersOnlyLoopback,
  parseCredentials, parseDotEnv, privatePort, runStartup, shouldStartApp,
  supabaseReady, validateLocalConfiguration,
} from "../scripts/local-start.mjs";

test("local credentials stay in the server process environment", () => {
  const credentials = parseCredentials("Email: owner@example.test\nPassword: very-private-value\n");
  const spec = appProcessSpec("C:\\Tools\\pnpm.cmd", credentials,
    { EXISTING: "ok", SUPABASE_URL: "http://wrong", SUPABASE_PUBLISHABLE_KEY: "wrong" },
    { SUPABASE_URL: "http://127.0.0.1:34321", SUPABASE_ANON_KEY: "public-key", RPG_OWNER_USER_ID: "owner-id" });
  assert.equal(spec.env.RPG_LOCAL_OWNER_PASSWORD, "very-private-value");
  assert.equal(spec.env.RPG_TRUSTED_LOCAL_OWNER, "1");
  assert.equal(spec.env.EXISTING, "ok");
  assert.equal(spec.env.NODE_ENV, "development");
  assert.equal(spec.env.SUPABASE_URL, "http://127.0.0.1:34321");
  assert.equal(spec.env.SUPABASE_ANON_KEY, "public-key");
  assert.equal(spec.env.RPG_OWNER_USER_ID, "owner-id");
  assert.equal(spec.env.SUPABASE_PUBLISHABLE_KEY, undefined);
  assert.doesNotMatch(JSON.stringify(spec.args), /very-private-value|owner@example\.test/);
  assert.match(spec.args[3], /--hostname 127\.0\.0\.1/);
});

test("configuration requires the stable loopback Supabase API", () => {
  const values = parseDotEnv("SUPABASE_URL=http://127.0.0.1:34321\nSUPABASE_ANON_KEY=public-key\nRPG_OWNER_USER_ID=39d1b773-0b4f-4f4a-b227-6b3654296d75\n");
  assert.equal(validateLocalConfiguration(values).apiUrl, "http://127.0.0.1:34321");
  values.set("SUPABASE_URL", "http://192.168.1.2:34321");
  assert.throws(() => validateLocalConfiguration(values), /loopback/);
  values.set("SUPABASE_URL", "http://127.0.0.1:54321");
  assert.throws(() => validateLocalConfiguration(values), /34321/);
});

test("app readiness requires this app's marker and trusted local mode", () => {
  assert.equal(appHealthFromResponse(200, { app: "personal-rpg-console", trustedLocalOwner: true }), true);
  assert.equal(appHealthFromResponse(200, { app: "personal-rpg-console", trustedLocalOwner: false }), false);
  assert.equal(appHealthFromResponse(200, { app: "other", trustedLocalOwner: true }), false);
  assert.equal(appHealthFromResponse(404, { app: "personal-rpg-console", trustedLocalOwner: true }), false);
  assert.equal(shouldStartApp("ours"), false);
  assert.equal(shouldStartApp("free"), true);
  assert.throws(() => shouldStartApp("other"), /No process was stopped/);
});

test("Supabase readiness requires the existing volume, DB, Auth, API, and private binding", () => {
  const ready = { volume: true, db: true, auth: true, api: true, loopback: true };
  assert.equal(supabaseReady(ready), true);
  for (const key of Object.keys(ready))
    assert.equal(supabaseReady({ ...ready, [key]: false }), false, key);
});

test("actual published bindings and app listeners must all be loopback", () => {
  const container = { NetworkSettings: { Ports: { "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "34321" }] } },
    HostConfig: { PortBindings: { "8000/tcp": [{ HostIp: "127.0.0.1", HostPort: "34321" }] } } };
  assert.equal(privatePort(container, 34321), true);
  container.NetworkSettings.Ports["8000/tcp"].push({ HostIp: "0.0.0.0", HostPort: "34321" });
  assert.equal(privatePort(container, 34321), false);
  delete container.NetworkSettings.Ports;
  assert.equal(privatePort(container, 34321), false);
  assert.equal(listenersOnlyLoopback(["127.0.0.1", "::1"]), true);
  assert.equal(listenersOnlyLoopback(["127.0.0.1", "0.0.0.0"]), false);
  assert.equal(listenersOnlyLoopback([]), false);
});

test("Windows excluded ranges are checked across the entire local Supabase range", () => {
  const output = "Start Port    End Port\r\n----------    --------\r\n      50000       50059\r\n      34327       34327     *\r\n";
  assert.equal(excludedPortOverlap(output), true);
  assert.equal(excludedPortOverlap("      50000       50059\r\n"), false);
  assert.equal(excludedPortOverlap("      34319       34320\r\n"), true);
});

test("startup uses Docker then Supabase then app, and reuses a healthy app", async () => {
  const calls = [];
  const make = (state) => ({
    docker: async () => calls.push("docker"),
    supabase: async () => calls.push("supabase"),
    probe: async () => { calls.push("probe"); return state; },
    launch: async () => calls.push("launch"),
    browser: () => calls.push("browser"),
  });
  await runStartup(make("free"));
  assert.deepEqual(calls, ["docker", "supabase", "probe", "launch", "browser"]);
  calls.length = 0;
  await runStartup(make("ours"));
  assert.deepEqual(calls, ["docker", "supabase", "probe", "browser"]);
  calls.length = 0;
  await assert.rejects(runStartup(make("other")), /Port 3000/);
  assert.deepEqual(calls, ["docker", "supabase", "probe"]);
});
