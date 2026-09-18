import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const campaign = "11111111-1111-4111-8111-111111111111";
const operation = "22222222-2222-4222-8222-222222222222";
const root = `/api/campaigns/${campaign}`;

async function safeFailure(response, allowed) {
  assert.ok(
    allowed.includes(response.status),
    `Unexpected status ${response.status}`,
  );
  assert.match(response.headers.get("cache-control"), /no-store/);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.deepEqual(Object.keys(body.error).sort(), ["code", "message"]);
  assert.equal(body.error.message, body.error.code);
  return body;
}

test("runtime reads require verified owner authorization, including turn reconnection", async () => {
  for (const path of [`${root}/play`, `${root}/turns/${operation}`]) {
    const body = await safeFailure(await fetch(base + path), [401, 403, 503]);
    assert.ok(
      ["unauthenticated", "forbidden", "not_configured"].includes(
        body.error.code,
      ),
    );
  }
});

test("all gameplay writes reject foreign origins and anonymous callers before execution", async () => {
  for (const path of [
    `${root}/turns`,
    `${root}/turns/${operation}/resume`,
    `${root}/play/config`,
    `${root}/guidance`,
  ]) {
    for (const origin of ["https://unrelated.invalid", base]) {
      const response = await fetch(base + path, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({
          privateState: "SYNTHETIC_UNTRUSTED_REQUEST_MARKER",
        }),
      });
      const body = await safeFailure(
        response,
        origin === base ? [401, 403, 503] : [403],
      );
      assert.ok(
        !JSON.stringify(body).includes("SYNTHETIC_UNTRUSTED_REQUEST_MARKER"),
      );
      assert.ok(
        ["unauthenticated", "forbidden", "not_configured"].includes(
          body.error.code,
        ),
      );
    }
  }
});
