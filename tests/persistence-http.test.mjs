import assert from "node:assert/strict";
import test from "node:test";
import {
  readWriteRequest,
  safeError,
} from "../src/lib/persistence/http-policy.ts";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const request = (body = "{}", headers = {}) =>
  new Request(base + "/api/mutations", {
    method: "POST",
    headers: { origin: base, "content-type": "application/json", ...headers },
    body,
  });
test("write policy rejects missing or foreign origins and non-JSON bodies", async () => {
  for (const headers of [
    { origin: "" },
    { origin: "https://unrelated.invalid" },
    { "content-type": "text/plain" },
  ]) {
    await assert.rejects(readWriteRequest(request("{}", headers)));
  }
  assert.deepEqual(
    await readWriteRequest(request('{"text":"literal owner writing"}')),
    { text: "literal owner writing" },
  );
});
test("write policy bounds streamed input and rejects malformed JSON", async () => {
  await assert.rejects(readWriteRequest(request("{")));
  await assert.rejects(
    readWriteRequest(request('"' + "x".repeat(1_000_001) + '"')),
  );
  await assert.rejects(
    readWriteRequest(request("{}", { "content-length": "1000001" })),
  );
});
test("server errors never forward raw provider or private payloads", () => {
  for (const error of [
    new Error("invented-private-marker"),
    { code: "42P01", message: "invented-private-marker" },
    { code: "conflict", details: "invented-private-marker" },
  ]) {
    const result = safeError(error);
    assert.ok(!JSON.stringify(result).includes("invented-private-marker"));
    assert.ok([409, 503].includes(result.status));
  }
});
test("unauthenticated persistence reads fail closed with safe no-store errors", async () => {
  for (const path of [
    "/api/workspace",
    "/api/campaigns/11111111-1111-4111-8111-111111111111",
    "/api/campaigns/11111111-1111-4111-8111-111111111111/documents/22222222-2222-4222-8222-222222222222/versions",
  ]) {
    const response = await fetch(base + path);
    assert.ok(
      [401, 403, 503].includes(response.status),
      `${path}: ${response.status}`,
    );
    assert.match(response.headers.get("cache-control"), /no-store/);
    const body = await response.json();
    assert.deepEqual(Object.keys(body), ["error"]);
    assert.ok(
      ["unauthenticated", "forbidden", "not_configured"].includes(
        body.error.code,
      ),
    );
    assert.equal(body.error.message, body.error.code);
  }
});
test("HTTP mutations require same-origin and owner authorization", async () => {
  const body = JSON.stringify({
    operation: "feedback.send",
    campaignId: "11111111-1111-4111-8111-111111111111",
    requestId: crypto.randomUUID(),
    expectedRevision: 0,
    payload: { body: "synthetic feedback" },
  });
  const denied = await fetch(base + "/api/mutations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://unrelated.invalid",
    },
    body,
  });
  assert.equal(denied.status, 403);
  const ownerGate = await fetch(base + "/api/mutations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body,
  });
  assert.ok([401, 403, 503].includes(ownerGate.status));
});
test("Phase 1 exposes neither gameplay nor private state endpoints", async () => {
  for (const path of [
    "/api/dm",
    "/api/dice",
    "/api/private",
    "/api/combat",
    "/api/auth/sign-up",
  ]) {
    const response = await fetch(base + path, {
      method: "POST",
      headers: { Origin: base, "Content-Type": "application/json" },
      body: "{}",
    });
    assert.ok(
      [404, 405].includes(response.status),
      `${path}: ${response.status}`,
    );
  }
});
