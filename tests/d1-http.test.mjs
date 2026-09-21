import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const campaignId = "11111111-1111-4111-8111-111111111111";

test("D1 HTTP reads require owner authorization and never expose a private envelope", async () => {
  const response = await fetch(
    `${base}/api/world-lab?campaignId=${campaignId}`,
  );
  assert.ok([401, 403, 503].includes(response.status));
  assert.match(response.headers.get("cache-control"), /no-store/);
  const body = await response.json();
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.deepEqual(Object.keys(body.error).sort(), ["code", "message"]);
  assert.equal(body.error.message, body.error.code);
  assert.doesNotMatch(
    JSON.stringify(body),
    /inputDigest|leaseGeneration|sourceVersionId|stack|PRIVATE_/,
  );
});

test("D1 HTTP write boundary rejects cross-origin and arbitrary branch authority", async () => {
  const forged = {
    action: "commit",
    input: {
      campaignId,
      manifestId: campaignId,
      sourceVersionIds: [campaignId],
      privateState: { canary: "PRIVATE_CANARY" },
    },
  };
  const cross = await fetch(`${base}/api/world-lab`, {
    method: "POST",
    headers: {
      origin: "https://unrelated.invalid",
      "content-type": "application/json",
    },
    body: JSON.stringify(forged),
  });
  assert.equal(cross.status, 403);
  const invalid = await fetch(`${base}/api/world-lab`, {
    method: "POST",
    headers: { origin: base, "content-type": "application/json" },
    body: JSON.stringify(forged),
  });
  assert.equal(invalid.status, 422);
  assert.doesNotMatch(
    JSON.stringify(await invalid.json()),
    /PRIVATE_|manifestId|sourceVersion/,
  );
});
