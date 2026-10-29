#!/usr/bin/env node
// Scale 1 (docs/stages/SCALE_1.md, on origin/claude/handoff), step 1: which lineages have BOTH base and instruct weights
// hosted on OpenRouter. A checkpoint counts as hosted only when OpenRouter lists at least one endpoint (a host) for it;
// an id that is in the catalog with no endpoint, or not in the catalog at all, is not hosted. A lineage needs a base and
// an instruct checkpoint of the same size, both hosted; one without both is dropped, never substituted (a community
// fine-tune is not the lineage's instruct, and another lineage's base is not its base).
//
//   node scripts/persona-emotions/scale-1-lineages.mjs           (free GETs: the catalog, each candidate's endpoints,
//                                                                  OpenRouter's credit; then, for each base id the
//                                                                  catalog names, one routing probe with the key —
//                                                                  1 token, $0 when no host exists)
//                                                                  → docs/runs/scale-1-lineages.json and .md
//
// Run with NODE_USE_ENV_PROXY=1 in the cloud. The key is read by the door helper and never printed or written.
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { anthropicEndpoint } from "../eval/lib/anthropic-endpoint.mjs";
import { providerKey } from "../eval/lib/keys.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const API = `${anthropicEndpoint({ ANTHROPIC_PROVIDER: "openrouter" }).baseUrl}/v1`;
export const CAP_USD = 30;

/** The stage's candidates, each size with every id OpenRouter has used or could use for its base and its instruct
 * weights. Sizes with no public base release are marked (Qwen3 32B and 235B-A22B: Qwen published no base for them). */
export const CANDIDATES = [
  { lineage: "Qwen3", sizes: [
    { size: "0.6B", base: ["qwen/qwen3-0.6b-base"], instruct: ["qwen/qwen3-0.6b", "qwen/qwen3-0.6b-04-28"] },
    { size: "1.7B", base: ["qwen/qwen3-1.7b-base"], instruct: ["qwen/qwen3-1.7b"] },
    { size: "4B", base: ["qwen/qwen3-4b-base"], instruct: ["qwen/qwen3-4b", "qwen/qwen3-4b:free"] },
    { size: "8B", base: ["qwen/qwen3-8b-base"], instruct: ["qwen/qwen3-8b", "qwen/qwen3-8b:free"] },
    { size: "14B", base: ["qwen/qwen3-14b-base"], instruct: ["qwen/qwen3-14b"] },
    { size: "30B-A3B", base: ["qwen/qwen3-30b-a3b-base"], instruct: ["qwen/qwen3-30b-a3b", "qwen/qwen3-30b-a3b-instruct-2507"] },
    { size: "32B", base: [], noBaseRelease: true, instruct: ["qwen/qwen3-32b"] },
    { size: "235B-A22B", base: ["qwen/qwen3-235b-a22b-base"], noBaseRelease: true, instruct: ["qwen/qwen3-235b-a22b", "qwen/qwen3-235b-a22b-2507"] },
  ] },
  { lineage: "Llama 3.x", sizes: [
    { size: "3 8B", base: ["meta-llama/llama-3-8b"], instruct: ["meta-llama/llama-3-8b-instruct"] },
    { size: "3 70B", base: ["meta-llama/llama-3-70b"], instruct: ["meta-llama/llama-3-70b-instruct"] },
    { size: "3.1 8B", base: ["meta-llama/llama-3.1-8b"], instruct: ["meta-llama/llama-3.1-8b-instruct"] },
    { size: "3.1 70B", base: ["meta-llama/llama-3.1-70b"], instruct: ["meta-llama/llama-3.1-70b-instruct"] },
    { size: "3.1 405B", base: ["meta-llama/llama-3.1-405b", "meta-llama/llama-3.1-405b:free"], instruct: ["meta-llama/llama-3.1-405b-instruct"] },
    { size: "3.2 1B", base: ["meta-llama/llama-3.2-1b"], instruct: ["meta-llama/llama-3.2-1b-instruct"] },
    { size: "3.2 3B", base: ["meta-llama/llama-3.2-3b"], instruct: ["meta-llama/llama-3.2-3b-instruct"] },
    { size: "3.3 70B", base: [], noBaseRelease: true, instruct: ["meta-llama/llama-3.3-70b-instruct"] },
  ] },
  { lineage: "Mistral", sizes: [
    { size: "7B", base: ["mistralai/mistral-7b", "mistralai/mistral-7b-v0.1"], instruct: ["mistralai/mistral-7b-instruct", "mistralai/mistral-7b-instruct-v0.1", "mistralai/mistral-7b-instruct-v0.3"] },
    { size: "Mixtral 8x7B", base: ["mistralai/mixtral-8x7b"], instruct: ["mistralai/mixtral-8x7b-instruct"] },
    { size: "Mixtral 8x22B", base: ["mistralai/mixtral-8x22b"], instruct: ["mistralai/mixtral-8x22b-instruct"] },
    { size: "Nemo 12B", base: ["mistralai/mistral-nemo-base-2407"], instruct: ["mistralai/mistral-nemo"] },
    { size: "Small 3 24B", base: ["mistralai/mistral-small-24b-base-2501"], instruct: ["mistralai/mistral-small-24b-instruct-2501"] },
  ] },
  { lineage: "DeepSeek V3", sizes: [
    { size: "V3 671B-A37B", base: ["deepseek/deepseek-v3-base", "deepseek/deepseek-v3-base:free"], instruct: ["deepseek/deepseek-chat", "deepseek/deepseek-chat-v3-0324"] },
    { size: "V3.1 671B-A37B", base: ["deepseek/deepseek-v3.1-base"], instruct: ["deepseek/deepseek-chat-v3.1", "deepseek/deepseek-v3.1-terminus"] },
  ] },
];

const BASE_WORD = /(^|[-/ (])(base|pt|pretrain(ed)?)([-: )]|$)/i;

/** One GET on OpenRouter's public API: the parsed body, or { error }. */
async function getJson(fetcher, path, apiKey = null) {
  try {
    const r = await fetcher(`${API}/${path}`, { headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {}, signal: AbortSignal.timeout(30_000) });
    const v = await r.json().catch(() => null);
    return r.ok ? v : { error: `HTTP ${r.status}${v?.error?.message ? ` ${String(v.error.message).slice(0, 80)}` : ""}` };
  } catch (error) { return { error: String(error?.message ?? error).slice(0, 80) }; }
}

/** An id's hosting: not in the catalog, in the catalog with no endpoint, or its endpoints (host, quantisation, prices). */
export function hostingOf(body) {
  if (body?.error) return /HTTP 404/.test(body.error) ? { state: "not in catalog", endpoints: [] } : { state: "not read", error: body.error, endpoints: [] };
  const endpoints = (body?.data?.endpoints ?? []).map((e) => ({ host: e.provider_name ?? null, tag: e.tag ?? null, quantization: e.quantization ?? null,
    status: e.status ?? null, contextLength: e.context_length ?? null, promptUsdPerM: e.pricing?.prompt != null ? Number(e.pricing.prompt) * 1e6 : null,
    completionUsdPerM: e.pricing?.completion != null ? Number(e.pricing.completion) * 1e6 : null, supportedParameters: e.supported_parameters ?? [] }));
  return { state: endpoints.length ? "hosted" : "listed, no host", endpoints };
}

/** The verdict: a size qualifies when one of its base ids and one of its instruct ids are hosted; a lineage qualifies with
 * one such size. The run goes on only with ≥ 2 lineages (the stage: fewer than two → stop and report). */
export function verdictOf(rows) {
  const lineages = rows.map((l) => {
    const sizes = l.sizes.map((s) => {
      const base = s.base.find((b) => b.hosting.state === "hosted") ?? null, instruct = s.instruct.find((i) => i.hosting.state === "hosted") ?? null;
      return { size: s.size, base: base?.id ?? null, instruct: instruct?.id ?? null, both: Boolean(base && instruct) };
    });
    return { lineage: l.lineage, qualifyingSizes: sizes.filter((s) => s.both).map((s) => s.size), sizes };
  });
  const qualifying = lineages.filter((l) => l.qualifyingSizes.length);
  return { lineages, qualifying: qualifying.map((l) => l.lineage), go: qualifying.length >= 2 };
}

/** One routing probe with the key: a 1-token completion on a base id. With no host OpenRouter answers 404 without a charge. */
async function routeProbe(fetcher, apiKey, model) {
  try {
    const r = await fetcher(`${API}/completions`, { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model, prompt: "The", max_tokens: 1, usage: { include: true } }), signal: AbortSignal.timeout(60_000) });
    const v = await r.json().catch(() => null);
    return { model, status: r.status, message: v?.error?.message ? String(v.error.message).slice(0, 160) : null, chargedUsd: typeof v?.usage?.cost === "number" ? v.usage.cost : 0, servedBy: v?.provider ?? null };
  } catch (error) { return { model, status: null, message: String(error?.message ?? error).slice(0, 120), chargedUsd: 0 }; }
}

const cell = (h) => (h.state === "hosted" ? `hosted: ${h.endpoints.map((e) => `${e.host} (${e.quantization ?? "?"})`).join(", ")}` : h.state);

export function markdownOf(record) {
  const { verdict, rows, catalog, spend, probes } = record;
  const lines = ["# Scale 1 — lineages with base and instruct weights on OpenRouter", "",
    `Checked ${record.checkedAt} by \`scripts/persona-emotions/scale-1-lineages.mjs\` (record \`scale-1-lineages.json\`). A checkpoint is hosted only when`,
    "OpenRouter lists at least one endpoint for it. Every id that names the checkpoint was checked; a size with no public base release is marked.", "",
    `**Verdict: ${verdict.qualifying.length} lineage${verdict.qualifying.length === 1 ? "" : "s"} with both (${verdict.qualifying.join(", ") || "none"}) — ${verdict.go ? "the run goes on" : "fewer than two: stop and report (the stage's rule)"}.**`, "",
    "| Lineage | Size | Base ids → hosting | Instruct ids → hosting | Both hosted |", "| --- | --- | --- | --- | --- |"];
  for (const l of rows) for (const s of l.sizes) {
    const base = s.base.length ? s.base.map((b) => `\`${b.id}\` → ${cell(b.hosting)}`).join("<br>") : "–";
    const instruct = s.instruct.map((i) => `\`${i.id}\` → ${cell(i.hosting)}`).join("<br>");
    const both = verdict.lineages.find((v) => v.lineage === l.lineage).sizes.find((v) => v.size === s.size).both;
    lines.push(`| ${l.lineage} | ${s.size} | ${base}${s.noBaseRelease ? " (no public base release)" : ""} | ${instruct} | ${both ? "**yes**" : "no"} |`);
  }
  lines.push("", `**The catalog:** ${catalog.count} models listed; ids or names with a base / pretrained marker: ${catalog.baseMarked.length ? catalog.baseMarked.map((m) => `\`${m}\``).join(", ") : "none"}.`,
    `**Spend check (free GET):** ${spend.error ? `not read (${spend.error})` : `$${spend.left.toFixed(2)} of OpenRouter credit left; this stage's spend $0 of $${CAP_USD}`}.`,
    `**Routing probe with the key** (1-token completion on each base id the catalog names): ${probes.length ? probes.map((p) => `\`${p.model}\` → HTTP ${p.status ?? "–"}${p.message ? ` «${p.message}»` : ""}`).join("; ") : "not run"}. Charged: $${probes.reduce((s, p) => s + (p.chargedUsd ?? 0), 0).toFixed(4)}.`,
    "", "No host is pinned: there is no lineage to pin one for. Hosted instruct checkpoints are listed so a later stage can pin them if base weights return.");
  return `${lines.join("\n")}\n`;
}

export async function checkLineages({ fetcher = fetch, apiKey = providerKey("OPENROUTER_API_KEY") } = {}) {
  const checkedAt = new Date().toISOString();
  const models = await getJson(fetcher, "models");
  const list = models?.data ?? [];
  const catalog = { count: list.length, baseMarked: list.filter((m) => BASE_WORD.test(m.id) || BASE_WORD.test(m.name ?? "")).map((m) => m.id) };
  const rows = [];
  for (const l of CANDIDATES) {
    const sizes = [];
    for (const s of l.sizes) {
      const base = [], instruct = [];
      for (const id of s.base) base.push({ id, hosting: hostingOf(await getJson(fetcher, `models/${id}/endpoints`)) });
      for (const id of s.instruct) instruct.push({ id, hosting: hostingOf(await getJson(fetcher, `models/${id}/endpoints`)) });
      sizes.push({ size: s.size, noBaseRelease: Boolean(s.noBaseRelease), base, instruct });
    }
    rows.push({ lineage: l.lineage, sizes });
  }
  const credits = apiKey ? await getJson(fetcher, "credits", apiKey) : { error: "no key" };
  const spend = credits?.data ? { totalCredits: credits.data.total_credits, totalUsage: credits.data.total_usage, left: credits.data.total_credits - credits.data.total_usage } : { error: credits?.error ?? "no answer" };
  const probes = [];
  if (apiKey && !spend.error && spend.left > CAP_USD) {
    for (const l of rows) for (const s of l.sizes) for (const b of s.base) if (b.hosting.state === "listed, no host") probes.push(await routeProbe(fetcher, apiKey, b.id));
  }
  return { stage: "scale-1", step: "lineages", checkedAt, catalog, rows, verdict: verdictOf(rows), spend, probes };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const record = await checkLineages();
  await writeFile(join(ROOT, "docs/runs/scale-1-lineages.json"), `${JSON.stringify(record, null, 2)}\n`);
  await writeFile(join(ROOT, "docs/runs/scale-1-lineages.md"), markdownOf(record));
  console.log(`lineages with both: ${record.verdict.qualifying.join(", ") || "none"} → ${record.verdict.go ? "go" : "stop"}; spend ${record.spend.error ?? `$${record.spend.left.toFixed(2)} left`}; probes ${record.probes.map((p) => `${p.model} ${p.status}`).join(", ")}`);
}
