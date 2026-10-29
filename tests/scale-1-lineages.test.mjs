// Scale 1, step 1: the lineage check's readings — an id's hosting from OpenRouter's endpoints answer, and the verdict
// (a lineage needs a base and an instruct of one size, both hosted; fewer than two lineages → stop) — no network, no cost.
import test from "node:test";
import assert from "node:assert/strict";
import { CANDIDATES, checkLineages, hostingOf, markdownOf, verdictOf } from "../scripts/persona-emotions/scale-1-lineages.mjs";

const hosted = (host) => ({ data: { endpoints: [{ provider_name: host, quantization: "bf16", pricing: { prompt: "0.0000001", completion: "0.0000002" } }] } });

test("hosting: an endpoint is a host; a catalog id with none is not; a 404 is not in the catalog", () => {
  assert.deepEqual(hostingOf({ error: "HTTP 404 Not Found" }), { state: "not in catalog", endpoints: [] });
  assert.equal(hostingOf({ data: { endpoints: [] } }).state, "listed, no host");
  const h = hostingOf(hosted("DeepInfra"));
  assert.equal(h.state, "hosted");
  assert.equal(h.endpoints[0].host, "DeepInfra");
  assert.ok(Math.abs(h.endpoints[0].promptUsdPerM - 0.1) < 1e-9);
  assert.equal(hostingOf({ error: "HTTP 500" }).state, "not read");
});

test("verdict: both of one size per lineage; two lineages to go on; an instruct alone never counts", () => {
  const row = (lineage, base, instruct) => ({ lineage, sizes: [{ size: "8B", base: [{ id: `${lineage}-base`, hosting: { state: base } }], instruct: [{ id: `${lineage}-it`, hosting: { state: instruct } }] }] });
  assert.equal(verdictOf([row("A", "hosted", "hosted"), row("B", "hosted", "hosted")]).go, true);
  const one = verdictOf([row("A", "hosted", "hosted"), row("B", "listed, no host", "hosted")]);
  assert.deepEqual([one.qualifying, one.go], [["A"], false]);
  assert.equal(verdictOf([row("A", "not in catalog", "hosted"), row("B", "listed, no host", "hosted")]).qualifying.length, 0);
});

test("the check on a mocked catalog: free GETs first, the spend check, then a 1-token probe only on base ids listed with no host", async () => {
  const calls = [];
  const fetcher = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? "GET" });
    const ok = (body) => ({ ok: true, status: 200, json: async () => body });
    if (url.endsWith("/v1/models")) return ok({ data: [{ id: "x/model-it", name: "X: Model" }] });
    if (url.endsWith("/v1/credits")) return ok({ data: { total_credits: 100, total_usage: 10 } });
    if (url.endsWith("/v1/completions")) return { ok: false, status: 404, json: async () => ({ error: { message: "no provider serves this model anymore" } }) };
    if (url.includes("deepseek-v3-base/endpoints")) return ok({ data: { endpoints: [] } });
    if (url.includes("-instruct/endpoints") || url.includes("deepseek-chat/endpoints")) return ok(hosted("DeepInfra"));
    return { ok: false, status: 404, json: async () => ({ error: { message: "Not Found" } }) };
  };
  const record = await checkLineages({ fetcher, apiKey: "or-key" });
  assert.equal(record.verdict.go, false);
  assert.equal(record.spend.left, 90);
  const posts = calls.filter((c) => c.method === "POST");
  assert.deepEqual(posts.map((c) => c.url.split("/v1/")[1]), ["completions"]);
  assert.equal(record.probes[0].model, "deepseek/deepseek-v3-base");
  assert.ok(calls.findIndex((c) => c.url.endsWith("/credits")) < calls.findIndex((c) => c.method === "POST"));
  assert.match(markdownOf(record), /fewer than two: stop and report/);
  assert.equal(record.rows.length, CANDIDATES.length);
});
