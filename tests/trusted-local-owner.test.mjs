import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ensureTrustedLocalOwnerSession,
  hasTrustedLocalCredentials,
  isLoopbackRequest,
  isTrustedLocalOwnerRequest,
  localOwnerModeAllowed,
  trustedLocalOwnerFromHeaders,
} from "../src/lib/server/trusted-local-owner.ts";

const owner = "39d1b773-0b4f-4f4a-b227-6b3654296d75";
const local = "http://127.0.0.1:3000/campaigns";
const headers = (host = "127.0.0.1:3000", extra = {}) =>
  new Headers({ host, ...extra });
const env = {
  NODE_ENV: "development",
  RPG_TRUSTED_LOCAL_OWNER: "1",
  SUPABASE_URL: "http://127.0.0.1:34321",
  RPG_OWNER_USER_ID: owner,
  RPG_LOCAL_OWNER_EMAIL: "local-owner@example.invalid",
  RPG_LOCAL_OWNER_PASSWORD: "synthetic-only-password",
};

test("trusted local owner requires every explicit gate and separate credentials", () => {
  assert.equal(isTrustedLocalOwnerRequest(local, headers(), env), true);
  assert.equal(hasTrustedLocalCredentials(env), true);
  assert.equal(trustedLocalOwnerFromHeaders("/", headers(), env), true);
  for (const changed of [
    { NODE_ENV: "production" },
    { RPG_TRUSTED_LOCAL_OWNER: "0" },
    { RPG_TRUSTED_LOCAL_OWNER: undefined },
    { SUPABASE_URL: "https://project.supabase.co" },
    { SUPABASE_URL: "http://192.168.1.4:34321" },
    { SUPABASE_URL: "http://localhost.evil.invalid:34321" },
    { RPG_OWNER_USER_ID: "not-a-uuid" },
    { RPG_OWNER_USER_ID: undefined },
  ])
    assert.equal(
      isTrustedLocalOwnerRequest(local, headers(), { ...env, ...changed }),
      false,
      JSON.stringify(changed),
    );
  assert.equal(
    hasTrustedLocalCredentials({ ...env, RPG_LOCAL_OWNER_PASSWORD: undefined }),
    false,
  );
});

test("sandbox --prod opt-in: flag absent → the trusted owner and the health route stay disabled in production", () => {
  const production = { ...env, NODE_ENV: "production" };
  assert.equal(localOwnerModeAllowed(env), true);
  assert.equal(localOwnerModeAllowed({ ...env, NODE_ENV: undefined }), true);
  for (const flag of [undefined, "", "0", "true", "yes", " 1", "1 "]) {
    const changed = { ...production, APP_SANDBOX_TRUSTED_OWNER: flag };
    assert.equal(localOwnerModeAllowed(changed), false, String(flag));
    assert.equal(
      isTrustedLocalOwnerRequest(local, headers(), changed),
      false,
      String(flag),
    );
    assert.equal(
      trustedLocalOwnerFromHeaders("/", headers(), changed),
      false,
      String(flag),
    );
  }
  const optedIn = { ...production, APP_SANDBOX_TRUSTED_OWNER: "1" };
  assert.equal(localOwnerModeAllowed(optedIn), true);
  assert.equal(isTrustedLocalOwnerRequest(local, headers(), optedIn), true);
  assert.equal(trustedLocalOwnerFromHeaders("/", headers(), optedIn), true);
  // The flag opens nothing by itself: every other gate still applies.
  for (const changed of [
    { RPG_TRUSTED_LOCAL_OWNER: undefined },
    { SUPABASE_URL: "https://project.supabase.co" },
    { RPG_OWNER_USER_ID: undefined },
  ])
    assert.equal(
      isTrustedLocalOwnerRequest(local, headers(), { ...optedIn, ...changed }),
      false,
      JSON.stringify(changed),
    );
  for (const [url, requestHeaders] of [
    ["http://192.168.1.4:3100/campaigns", headers("192.168.1.4:3100")],
    [local, headers("127.0.0.1:3000", { "x-forwarded-for": "192.168.1.4" })],
    [local, headers("127.0.0.1:3000", { forwarded: "for=192.168.1.4" })],
  ])
    assert.equal(isTrustedLocalOwnerRequest(url, requestHeaders, optedIn), false);
  // A build fixes a literal process.env.NODE_ENV at compile time, so the route
  // must read the gate from the run-time environment through the helper.
  const health = readFileSync(
    new URL("../src/app/api/local-launch/health/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(health, /!localOwnerModeAllowed\(process\.env\)/);
  assert.doesNotMatch(health, /process\.env\.NODE_ENV/);
});

test("request gate rejects nonlocal and forwarded hosts or clients", () => {
  for (const [url, requestHeaders] of [
    ["http://192.168.1.4:3000/campaigns", headers("192.168.1.4:3000")],
    [
      "http://localhost.evil.invalid:3000/campaigns",
      headers("localhost.evil.invalid:3000"),
    ],
    [local, headers("localhost:3000")],
    [local, headers("127.0.0.1:3000", { "x-forwarded-host": "evil.invalid" })],
    [local, headers("127.0.0.1:3000", { "x-forwarded-for": "192.168.1.4" })],
    [
      local,
      headers("127.0.0.1:3000", {
        "x-forwarded-for": "127.0.0.1, 192.168.1.4",
      }),
    ],
    [local, headers("127.0.0.1:3000", { forwarded: "for=192.168.1.4" })],
    ["https://127.0.0.1:3000/campaigns", headers()],
  ]) {
    assert.equal(isLoopbackRequest(url, requestHeaders), false);
    assert.equal(isTrustedLocalOwnerRequest(url, requestHeaders, env), false);
  }
  assert.equal(
    isTrustedLocalOwnerRequest(
      "http://localhost:3000/login",
      headers("localhost:3000"),
      { ...env, SUPABASE_URL: "http://localhost:34321" },
    ),
    true,
  );
});

function fakeClient({
  current = null,
  signedIn = owner,
  rpc = true,
  rpcError = null,
  signInError = null,
  signInThrows = false,
  getUserError = null,
  signOutError = null,
} = {}) {
  let user = current;
  let signIns = 0;
  let signOuts = 0;
  let ownerChecks = 0;
  let getUserCalls = 0;
  let passwordSeen = null;
  const operations = [];
  return {
    auth: {
      async getUser() {
        operations.push("getUser");
        getUserCalls++;
        return {
          data: { user: user ? { id: user } : null },
          error: getUserCalls === 1 ? getUserError : null,
        };
      },
      async signInWithPassword(credentials) {
        operations.push("signIn");
        signIns++;
        passwordSeen = credentials.password;
        if (signInThrows) throw new Error("synthetic interrupted sign-in");
        user = signInError ? null : signedIn;
        return {
          data: { user: user ? { id: user } : null },
          error: signInError,
        };
      },
      async signOut() {
        operations.push("signOut");
        signOuts++;
        if (!signOutError) user = null;
        return { error: signOutError };
      },
    },
    async rpc(name) {
      operations.push("rpg_is_owner");
      assert.equal(name, "rpg_is_owner");
      ownerChecks++;
      return { data: rpc, error: rpcError };
    },
    stats: () => ({ signIns, signOuts, ownerChecks, passwordSeen, user }),
    operations: () => operations,
  };
}

test("silent session signs in through Supabase Auth and checks user plus owner RPC", async () => {
  const client = fakeClient();
  assert.equal(
    await ensureTrustedLocalOwnerSession(client, owner, {
      email: env.RPG_LOCAL_OWNER_EMAIL,
      password: env.RPG_LOCAL_OWNER_PASSWORD,
    }),
    undefined,
  );
  assert.deepEqual(client.stats(), {
    signIns: 1,
    signOuts: 0,
    ownerChecks: 1,
    passwordSeen: env.RPG_LOCAL_OWNER_PASSWORD,
    user: owner,
  });
  await ensureTrustedLocalOwnerSession(client, owner, {
    email: env.RPG_LOCAL_OWNER_EMAIL,
    password: env.RPG_LOCAL_OWNER_PASSWORD,
  });
  assert.equal(client.stats().signIns, 1);
});

test("wrong configured credentials, failed RPC, or bad password never completes bootstrap", async () => {
  for (const setup of [
    { signedIn: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
    { rpc: false },
    { rpcError: new Error("synthetic RPC failure") },
    { signInError: new Error("synthetic auth failure") },
    { signInThrows: true },
  ]) {
    const client = fakeClient(setup);
    await assert.rejects(
      ensureTrustedLocalOwnerSession(client, owner, {
        email: env.RPG_LOCAL_OWNER_EMAIL,
        password: env.RPG_LOCAL_OWNER_PASSWORD,
      }),
      { message: "local_owner_denied" },
    );
    assert.equal(client.stats().signOuts, 1);
    assert.equal(client.stats().user, null);
  }
});

test("a valid non-owner local cookie is cleared before owner sign-in and owner RPC", async () => {
  const nonownerCookie = fakeClient({
    current: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  });
  await ensureTrustedLocalOwnerSession(nonownerCookie, owner, {
    email: env.RPG_LOCAL_OWNER_EMAIL,
    password: env.RPG_LOCAL_OWNER_PASSWORD,
  });
  assert.deepEqual(nonownerCookie.operations(), [
    "getUser",
    "signOut",
    "signIn",
    "getUser",
    "rpg_is_owner",
  ]);
  assert.equal(nonownerCookie.stats().user, owner);
  assert.equal(nonownerCookie.stats().ownerChecks, 1);
});

test("stale Auth cookie recovers, while transport and ambiguous Auth results fail closed", async () => {
  const missingSession = fakeClient({
    getUserError: { name: "AuthSessionMissingError" },
  });
  await ensureTrustedLocalOwnerSession(missingSession, owner, {
    email: env.RPG_LOCAL_OWNER_EMAIL,
    password: env.RPG_LOCAL_OWNER_PASSWORD,
  });
  assert.equal(missingSession.stats().signOuts, 0);
  assert.equal(missingSession.stats().ownerChecks, 1);
  const staleCookie = fakeClient({
    getUserError: { name: "AuthApiError", status: 401 },
  });
  await ensureTrustedLocalOwnerSession(staleCookie, owner, {
    email: env.RPG_LOCAL_OWNER_EMAIL,
    password: env.RPG_LOCAL_OWNER_PASSWORD,
  });
  assert.deepEqual(staleCookie.operations(), [
    "getUser",
    "signOut",
    "signIn",
    "getUser",
    "rpg_is_owner",
  ]);
  for (const setup of [
    { getUserError: { name: "AuthRetryableFetchError", status: 503 } },
    { current: owner, getUserError: { name: "AuthApiError", status: 401 } },
    {
      current: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      signOutError: new Error("synthetic clear failure"),
    },
  ]) {
    const client = fakeClient(setup);
    await assert.rejects(
      ensureTrustedLocalOwnerSession(client, owner, {
        email: env.RPG_LOCAL_OWNER_EMAIL,
        password: env.RPG_LOCAL_OWNER_PASSWORD,
      }),
      { message: "local_owner_denied" },
    );
    assert.equal(client.stats().signIns, 0);
    assert.equal(client.stats().ownerChecks, 0);
  }
  const ownerDenied = fakeClient({ current: owner, rpc: false });
  await assert.rejects(
    ensureTrustedLocalOwnerSession(ownerDenied, owner, {
      email: env.RPG_LOCAL_OWNER_EMAIL,
      password: env.RPG_LOCAL_OWNER_PASSWORD,
    }),
    { message: "local_owner_denied" },
  );
  assert.equal(ownerDenied.stats().signIns, 0);
  assert.equal(ownerDenied.stats().ownerChecks, 1);
});

test("wrong password after clearing a non-owner cookie leaves no owner session", async () => {
  const client = fakeClient({
    current: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    signInError: new Error("synthetic bad password"),
  });
  await assert.rejects(
    ensureTrustedLocalOwnerSession(client, owner, {
      email: env.RPG_LOCAL_OWNER_EMAIL,
      password: env.RPG_LOCAL_OWNER_PASSWORD,
    }),
    { message: "local_owner_denied" },
  );
  assert.equal(client.stats().user, null);
  assert.equal(client.stats().ownerChecks, 0);
  assert.deepEqual(client.operations(), [
    "getUser",
    "signOut",
    "signIn",
    "signOut",
  ]);
});

test("local credentials stay in server process and cannot enter client bundles or response text", () => {
  const proxy = readFileSync(
    new URL("../src/proxy.ts", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL("../src/app/login/page.tsx", import.meta.url),
    "utf8",
  );
  const health = readFileSync(
    new URL("../src/app/api/local-launch/health/route.ts", import.meta.url),
    "utf8",
  );
  const client = readFileSync(
    new URL("../src/components/owner-access.tsx", import.meta.url),
    "utf8",
  );
  assert.match(proxy, /ensureTrustedLocalOwnerSession/);
  assert.match(proxy, /candidate response may contain cookies/i);
  assert.doesNotMatch(
    page + health + client,
    /RPG_LOCAL_OWNER_PASSWORD|RPG_LOCAL_OWNER_EMAIL/,
  );
  assert.doesNotMatch(
    proxy + page + health + client,
    /synthetic-only-password/,
  );
});
