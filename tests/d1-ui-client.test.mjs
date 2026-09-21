import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { labControls, loadLabCatalog, mergeLabRun, pendingLabKey, prepareLabAttempt, readLabAttempt, readLabCatalog, readPublicLabRun, restoreLabAttempt, runLabAttempt, sendLabAttempt } from "../src/components/world-lab/client.ts";
import { labUiFixture, uiId } from "./d1-ui-fixtures.mjs";

test("D1 browser allowlist rejects private additions, wrong campaigns and non-simulation responses", () => {
  const catalog = labUiFixture();
  assert.deepEqual(readLabCatalog(catalog, catalog.campaignId), catalog);
  for (const mutate of [
    (value) => { value.privateState = "PRIVATE_MARKER"; },
    (value) => { value.runs[0].input = { ownerId: uiId(80) }; },
    (value) => { value.runs[0].scenario.sourceVersionIds = [uiId(80)]; },
    (value) => { value.runs[0].checkpoints[0].privateCount = 4; },
    (value) => { value.runs[0].checkpoints[1].events[0].evidence = ["PRIVATE_MARKER"]; },
    (value) => { value.runs[0].campaignId = uiId(80); },
    (value) => { value.runs[0].nonCanon = false; },
    (value) => { value.runs[0].purpose = "playable"; },
  ]) {
    const value = structuredClone(catalog); mutate(value);
    assert.throws(() => readLabCatalog(value, catalog.campaignId));
  }
  const reverse = structuredClone(catalog.runs[0]); reverse.checkpoints.reverse();
  assert.deepEqual(readPublicLabRun(reverse, catalog.campaignId).checkpoints, catalog.runs[0].checkpoints);
});

test("D1 selections use offered pairs only and cannot inject authority or nonfinite horizons", () => {
  const catalog = labUiFixture();
  const input = { saveId: uiId(2), scenarioVersionId: uiId(4), divergenceVersionId: uiId(5), label: "Another morning", horizonMinutes: 120 };
  const result = prepareLabAttempt(catalog, input, () => uiId(20));
  assert.deepEqual(result, { action: "prepare", input: { ...input, operationId: uiId(20), campaignId: catalog.campaignId } });
  for (const change of [{ saveId: uiId(80) }, { divergenceVersionId: uiId(80) }, { scenarioVersionId: uiId(80) }, { ownerId: uiId(80) }, { inputDigest: "fake" }, { horizonMinutes: Infinity }, { horizonMinutes: 43201 }, { horizonMinutes: 0 }, { horizonMinutes: 1.5 }, { label: " " }])
    assert.throws(() => prepareLabAttempt(catalog, { ...input, ...change }));
  assert.throws(() => readLabAttempt({ ...result, fence: "private" }, catalog.campaignId));
  assert.throws(() => readLabAttempt({ ...result, input: { ...result.input, campaignId: uiId(80) } }, catalog.campaignId));
});

test("D1 lost response retries preserve exact operation, action and body through session restoration", async () => {
  const catalog = labUiFixture(), attempt = runLabAttempt("continue", catalog.runs[0], () => uiId(21));
  const bodies = [];
  const fetcher = async (_url, init) => {
    bodies.push(init.body);
    if (bodies.length === 1) throw new Error("PRIVATE_NETWORK_DIAGNOSTIC");
    return Response.json(catalog.runs[0]);
  };
  await assert.rejects(() => sendLabAttempt(attempt, fetcher), (error) => error.code === "uncertain" && !error.message.includes("PRIVATE"));
  const recovered = restoreLabAttempt(JSON.stringify(attempt), catalog.campaignId);
  assert.deepEqual(recovered, attempt);
  assert.equal(pendingLabKey(catalog.campaignId), `world-lab-pending:${catalog.campaignId}`);
  await sendLabAttempt(recovered, fetcher);
  assert.equal(bodies[0], bodies[1]);
  assert.equal(restoreLabAttempt(JSON.stringify(attempt), uiId(80)), null);
  assert.equal(restoreLabAttempt("not JSON", catalog.campaignId), null);
  assert.equal(restoreLabAttempt(JSON.stringify({ ...attempt, ownerId: uiId(80) }), catalog.campaignId), null);
});

test("D1 transport sends language out of authority body and keeps all errors sanitized", async () => {
  const catalog = labUiFixture("ru"), attempt = runLabAttempt("pause", catalog.runs[0]);
  const calls = [];
  const fetcher = async (url, init) => { calls.push({ url, init }); return Response.json(init.method ? catalog.runs[0] : catalog); };
  await loadLabCatalog(catalog.campaignId, undefined, fetcher, "ru");
  await sendLabAttempt(attempt, fetcher, "ru");
  assert.equal(calls[0].url, `/api/world-lab?campaignId=${catalog.campaignId}`);
  assert.equal(calls[0].init.headers["Accept-Language"], "ru");
  assert.equal(calls[1].init.headers["Accept-Language"], "ru");
  assert.deepEqual(JSON.parse(calls[1].init.body), attempt);
  for (const [status, error, expected] of [[409, "conflict", "conflict"], [403, "scope", "forbidden"], [422, "PRIVATE_DB_DETAIL", "unavailable"], [500, "PRIVATE_DB_DETAIL", "uncertain"]])
    await assert.rejects(() => sendLabAttempt(attempt, async () => Response.json({ error: { code: error, message: "PRIVATE_IGNORED_DETAIL" } }, { status })), (value) => value.code === expected && !value.message.includes("PRIVATE"));
  await assert.rejects(() => sendLabAttempt(attempt, async () => Response.json({ ...catalog.runs[0], privateValue: "PRIVATE" })), (value) => value.code === "uncertain");
});

test("D1 controls respect bounded lifecycle and immutable completed/cancelled history", () => {
  const run = labUiFixture().runs[0];
  assert.equal(labControls(run).continue, true);
  assert.equal(labControls({ ...run, status: "prepared" }).continue, true);
  assert.equal(labControls({ ...run, status: "paused", reason: "review_required" }).resume, true);
  assert.equal(labControls({ ...run, status: "failed", reason: "unavailable" }).resume, true);
  for (const reason of ["source_changed", "work_limit", "unsupported"])
    assert.equal(labControls({ ...run, status: "paused", reason }).resume, false);
  for (const status of ["completed", "cancelled"])
    assert.ok(Object.values(labControls({ ...run, status })).every((value) => value === false));
  const catalog = labUiFixture();
  assert.equal(mergeLabRun(catalog, { ...run, revision: 1 }), catalog, "an old receipt cannot roll the visible run backward");
  assert.throws(() => mergeLabRun(catalog, { ...run, campaignId: uiId(80) }));
});

test("D1 component import boundary contains only public data and no active-timeline dependency", () => {
  for (const name of ["client.ts", "world-lab.tsx", "text.ts", "world-lab-panel.tsx"]) {
    const source = readFileSync(new URL(`../src/components/world-lab/${name}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /server-contracts|world-lab\/(inputs|store|lifecycle|writer)|service.role|process\.env|dangerouslySetInnerHTML/);
    assert.doesNotMatch(source, /activeTimeline|activationEpoch|useCampaignData/);
  }
});
