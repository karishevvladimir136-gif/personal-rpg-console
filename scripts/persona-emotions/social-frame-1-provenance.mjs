#!/usr/bin/env node
// SOCIAL_FRAME_1 — the provenance check (the provider amendment): before any paid call of the stage, per family three
// identification calls through llmapi.ai with fallbacks disabled (`X-No-Fallback: true`) and the provider pinned
// (`provider/model`); the `model` field of every response is stored. A family whose answers or `model` field do not match
// the named model is not used on this gateway.
//
// The rule (fixed before the calls): a family passes when (1) the `model` field matches the requested id in all three
// responses (the id itself, or with a provider prefix or a date suffix), and (2) each of the three answers names the
// family's developer or model family and names no other developer or family before its own. The version a model gives for
// itself is recorded and not required (self-reported versions are unreliable); a disagreement is printed beside.
//
//   node scripts/persona-emotions/social-frame-1-provenance.mjs [--families a,b]
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FAMILY_SPECS, llmapiCall, modelMatches, pinnedModel, readCredit, sha256 } from "./llmapi.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const OUT_JSON = "docs/runs/social-frame-1-provenance.json";
export const OUT_MD = "docs/runs/social-frame-1-provenance.md";
export const PROMPT = "Which AI model are you? Answer in one line: the company that made you, and the model's name and version as far as you know them.";
export const CALLS = 3;
export const EFFORT = "medium";
export const MAX_TOKENS = 4000;
export const ORDER = ["haiku", "sonnet", "opus", "fable", "fable52", "glm", "kimi", "deepseek", "sol", "grok", "astra"];

/** What an answer must name (developer or family); the first developer or family it names must be its own. */
export const NAMES = {
  Anthropic: /\b(anthropic|claude)\b/i, OpenAI: /\b(openai|gpt|chatgpt)\b/i, xAI: /\b(xai|x\.ai|grok)\b/i, DeepSeek: /\bdeepseek\b/i,
  "Z.ai (Zhipu)": /\b(zhipu|z\.ai|zai|glm|chatglm)\b/i, "Moonshot AI": /\b(moonshot|kimi)\b/i,
  Google: /\b(google|gemini|deepmind)\b/i, Meta: /\b(meta ai|llama)\b/i, Alibaba: /\b(alibaba|qwen)\b/i, Mistral: /\bmistral\b/i,
};
export function answerMatches(spec, text) {
  const t = String(text ?? "");
  const first = (re) => { const m = new RegExp(re.source, "i").exec(t); return m ? m.index : Infinity; };
  const at = Object.fromEntries(Object.entries(NAMES).map(([d, re]) => [d, first(re)]));
  const names = at[spec.developer] < Infinity;
  const others = Object.keys(NAMES).filter((d) => d !== spec.developer && at[d] < Infinity);
  // The model's own name must come first: another developer named before it (or alone) is a claim to be that model.
  const claimsOther = others.some((d) => at[d] < at[spec.developer]);
  return { names, others, claimsOther, ok: names && !claimsOther };
}

export async function main(args = process.argv.slice(2), out = (l) => process.stdout.write(`${l}\n`)) {
  const at = args.indexOf("--families");
  const families = at >= 0 ? args[at + 1].split(",") : ORDER;
  const before = await readCredit();
  out(`credit before: ${before.error ? `not read (${before.error})` : `$${before.total.toFixed(4)}`}`);
  if (before.error) throw new Error("the credit could not be read: no call is made");
  const results = await Promise.all(families.map(async (f) => {
    const spec = FAMILY_SPECS[f];
    const calls = [];
    for (let i = 0; i < CALLS; i++) {
      const r = await llmapiCall(spec, { messages: [{ role: "user", content: PROMPT }], maxTokens: MAX_TOKENS, effort: EFFORT });
      const m = answerMatches(spec, r.text);
      calls.push({ i: i + 1, at: new Date().toISOString(), pinned: r.pinned, noFallback: true, status: r.status, error: r.error, model: r.model, modelMatches: modelMatches(spec, r.model),
        responseId: r.responseId, headers: r.headers, answer: r.text, answerMatches: m, refused: r.refused, stopReason: r.stopReason, usage: r.usage, chargedUsd: r.chargedUsd });
      const said = r.text.replace(/\s+/g, " ").slice(0, 140), matchWord = modelMatches(spec, r.model) ? "matches" : "DOES NOT MATCH", cost = r.chargedUsd ?? "?";
      out(r.error ? `${f} #${i + 1}: ERROR ${r.error}` : `${f} #${i + 1}: model=${r.model} (${matchWord}) · «${said}» · ${m.ok ? "answer ok" : "ANSWER DOES NOT MATCH"} · $${cost}`);
    }
    const pass = calls.every((c) => !c.error && c.modelMatches && c.answerMatches.ok);
    return { family: f, label: spec.label, developer: spec.developer, requested: spec.model, pinned: pinnedModel(spec), route: spec.route, calls, pass };
  }));
  // An earlier run's results are kept: a family asked again keeps its earlier attempts on record.
  let earlier = null;
  try { earlier = JSON.parse(await readFile(join(ROOT, OUT_JSON), "utf8")); } catch { /* the first run */ }
  if (earlier) {
    for (const r of results) { const e = earlier.results.find((x) => x.family === r.family); if (e) r.earlierAttempts = [...(e.earlierAttempts ?? []), { pinned: e.pinned, calls: e.calls, pass: e.pass }]; }
    for (const e of earlier.results) if (!results.some((r) => r.family === e.family)) results.push(e);
    results.sort((a, b) => ORDER.indexOf(a.family) - ORDER.indexOf(b.family));
  }
  const after = await readCredit();
  const spent = after.error ? null : Math.round((before.total - after.total) * 10000) / 10000;
  const charged = results.flatMap((r) => r.calls).reduce((s, c) => s + (c.chargedUsd ?? 0), 0);
  const record = { stage: "SOCIAL_FRAME_1", what: "provenance check", at: new Date().toISOString(), runs: [...(earlier?.runs ?? [{ at: earlier?.at ?? null, families: earlier?.results.map((r) => r.family) ?? [], creditBefore: earlier?.creditBefore ?? null, creditAfter: earlier?.creditAfter ?? null }].filter((x) => x.at)), { at: new Date().toISOString(), families, creditBefore: before, creditAfter: null }], baseUrl: "https://api.llmapi.ai/v1", prompt: PROMPT, promptSha256: sha256(PROMPT), effort: EFFORT, maxTokens: MAX_TOKENS,
    rule: "pass = the `model` field matches the requested id in 3 of 3 (the id, or with a provider prefix or a date suffix) and each of the 3 answers names the family's developer or model family and names no other developer or family before its own; the self-reported version recorded, not required",
    creditBefore: before, creditAfter: after, spentByCredit: spent, chargedByUsage: Math.round(charged * 10000) / 10000, results };
  await writeFile(join(ROOT, OUT_JSON), `${JSON.stringify(record, null, 2)}\n`);
  const cell = (c) => c.error ? `error: ${c.error.slice(0, 60)}` : `\`${c.model}\`${c.modelMatches ? "" : " ✗"}`;
  const ans = (c) => c.error ? "–" : `${c.answerMatches.ok ? "" : "✗ "}${c.answer.replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, 110)}`;
  const md = [
    "# SOCIAL_FRAME_1 — provenance check (llmapi.ai)", "",
    `Run ${record.at}. Base URL \`https://api.llmapi.ai/v1\`; every call pinned (\`provider/model\`) with \`X-No-Fallback: true\`; Claude models on the gateway's Messages route (\`output_config.effort\` ${EFFORT}), the others on chat completions (\`reasoning_effort\` ${EFFORT}); max_tokens ${MAX_TOKENS}. The prompt (three times per family): «${PROMPT}»`, "",
    `Rule: ${record.rule}.`, "",
    `Credit before $${before.total.toFixed(4)}, after ${after.error ? "not read" : `$${after.total.toFixed(4)}`} (spent ${spent === null ? "?" : `$${spent.toFixed(4)}`}; the gateway's own charges sum to $${record.chargedByUsage.toFixed(4)}).`, "",
    "| Family | Pinned | `model` field ×3 | Answers | Pass |", "| --- | --- | --- | --- | --- |",
    ...results.map((r) => `| ${r.label} | \`${r.pinned}\` | ${r.calls.map(cell).join("<br>")} | ${r.calls.map(ans).join("<br>")} | ${r.pass ? "yes" : "**no**"} |`), "",
    ...(results.some((r) => r.earlierAttempts) ? ["Earlier attempts (kept):", "", "| Family | Pinned | `model` field ×3 | Answers | Pass |", "| --- | --- | --- | --- | --- |",
      ...results.flatMap((r) => (r.earlierAttempts ?? []).map((e) => `| ${r.label} | \`${e.pinned}\` | ${e.calls.map(cell).join("<br>")} | ${e.calls.map(ans).join("<br>")} | ${e.pass ? "yes" : "no"} |`)), ""] : []),
  ].join("\n");
  await writeFile(join(ROOT, OUT_MD), md);
  out(`written ${OUT_JSON} and ${OUT_MD}; pass: ${results.filter((r) => r.pass).map((r) => r.family).join(", ") || "none"}; fail: ${results.filter((r) => !r.pass).map((r) => r.family).join(", ") || "none"}`);
  return record;
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { process.stderr.write(`${e.stack ?? e}\n`); process.exit(1); });
