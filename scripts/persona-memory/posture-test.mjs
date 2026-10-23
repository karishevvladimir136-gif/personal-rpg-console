#!/usr/bin/env node
// Persona memory 2, Part F (docs/stages/PERSONA_MEMORY_2.md): the harder continuity case — probes where facts do not
// help and posture does. Stage 1's case was too easy (journal and summary both at the ceiling). Here the journal and the
// summary hold the same facts; only the first-person journal carries the posture. Five arms — journal, summary, rewrite
// (the summary's own text in the first person), none, sham — answer four probes — transfer of a pull, finishing a
// thought left open, voice under pressure, «what were you tempted by» — on three synthetic personas × two lengths
// (test-fixtures/persona-memory/posture/, the rules in its README.md). A blind judge (two Claude Haiku 5.5 passes,
// Claude Opus 5.5 on a disagreement) scores every answer from the frozen rubric; the voice probe's lexical overlap is
// computed. This is a harness, not a verdict.
//
//   node scripts/persona-memory/posture-test.mjs                       (the synthetic family; results in docs/runs)
//   node scripts/persona-memory/posture-test.mjs --cases <dir|file…>   (the owner's own cases; results outside git)
//   options: --models opus,sonnet (also haiku, astra, or names from --models-file) --models-file <models.json>
//            --n 10 --effort medium --budget 15 --out <folder> --concurrency 4 --seed 20261023
//            --dry (no calls, no cost; prints the plan and an estimate) --rejudge <run.json> (judge an earlier run again)
//            --resume <run.json> (keep every answer and judgement an earlier run finished — a refusal included; ask
//            again only what failed with an error) --skip <model>:<probe>,… (not asked at all)
//   safety (persona memory F2, scripts/persona-memory/safety.mjs): paid calls go one at a time, --gap 3 seconds apart;
//            no retry of any kind (a refusal is recorded and the run moves on); after --max-refusals 3 refusals in total,
//            or an error that mentions suspension, access or policy, no further paid call is made. --retry brings back
//            stage 2's retries (a refused question asked once more, a 429/5xx up to three times) — not advised.
//
// A models file adds any OpenAI-compatible endpoint without code (Kimi, DeepSeek, …):
//   [{ "name": "kimi", "provider": "openai-compatible", "model": "kimi-k3", "baseUrl": "https://api.moonshot.ai/v1",
//      "keyEnv": "MOONSHOT_API_KEY", "price": { "input": 0.6, "output": 2.5 } }]
// Keys come from .env.local or the cloud environment's APP_<name>; they are never printed. Every paid call goes into
// the ledger with its tokens and cost; the run stops before a call could pass the cap.
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { providerKey } from "../eval/lib/keys.mjs";
import { stem, words } from "../../src/lib/persona-memory/text.ts";
import { anthropicCall, createBudget, errorText, shuffled } from "./continuity-test.mjs";
import { MAX_REFUSALS, createSafety } from "./safety.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const POSTURE_DIR = join(ROOT, "test-fixtures", "persona-memory", "posture");
export const ARMS = ["journal", "summary", "rewrite", "none", "sham"];
export const PROBES = ["transfer", "thought", "voice", "recollection"];
export const LENGTHS = { short: 5, long: 25 };
/** USD per 1M tokens (src/lib/model-runtime/dm-models.ts; the Haiku row is stage 1's). */
export const MODEL_REGISTRY = {
  opus: { name: "opus", provider: "anthropic", model: "claude-opus-5-5", price: { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 } },
  sonnet: { name: "sonnet", provider: "anthropic", model: "claude-sonnet-5-5", price: { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 } },
  haiku: { name: "haiku", provider: "anthropic", model: "claude-haiku-5-5", price: { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 } },
  astra: { name: "astra", provider: "openai", model: "gpt-6-astra", baseUrl: "https://api.openai.com/v1", keyEnv: "OPENAI_API_KEY", price: { input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 } },
};
export const JUDGES = { judge: MODEL_REGISTRY.haiku, referee: MODEL_REGISTRY.opus };
const MAX_TOKENS = { persona: 6000, judge: 2000, referee: 3000 };
const HEADINGS = {
  journal: "Your journal — first-person entries you wrote yourself at the end of earlier sessions:",
  summary: "Notes on the earlier sessions — a third-person summary:",
};

// ---- the case -------------------------------------------------------------------------------------------------------

const PERSON = {
  third: { I: "The assistant", i: "the assistant", me: "the assistant", my: "its", myself: "itself" },
  first: { I: "I", i: "I", me: "me", my: "my", myself: "myself" },
};
/** The summary is written once with person tokens; the rewrite arm is the same words in the first person. */
export const renderPerson = (text, person) => text.replace(/\{(I|i|me|my|myself)\}/g, (_, token) => PERSON[person][token]);

function sectionsOf(markdown, level) {
  const marker = "#".repeat(level);
  const parts = new Map();
  let current = null;
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const heading = line.match(new RegExp(`^${marker}\\s+(.+?)\\s*$`));
    if (heading && !line.startsWith(`${marker}#`)) { current = heading[1].trim(); parts.set(current.toLowerCase(), { title: current, lines: [] }); continue; }
    if (current) parts.get(current.toLowerCase()).lines.push(line);
  }
  return parts;
}

/** A posture case file: «## System», «## Journal» (### entries), «## Summary» (- bullets with person tokens) and the four
 * «## Probe: …» sections (see test-fixtures/persona-memory/posture/README.md). */
export function parsePostureCase(markdown, id = "case") {
  const top = sectionsOf(markdown, 2);
  const text = (name) => (top.get(name)?.lines ?? []).join("\n").trim();
  const sub = (name) => sectionsOf((top.get(name)?.lines ?? []).join("\n"), 3);
  const field = (probe, key) => ((sub(`probe: ${probe}`).get(key)?.lines) ?? []).join("\n").trim();
  const journal = [...sub("journal").values()].map((entry) => `### ${entry.title}\n${entry.lines.join("\n").trim()}`);
  const summary = (top.get("summary")?.lines ?? []).filter((line) => /^\s*-\s+/.test(line)).map((line) => line.trim());
  const references = field("thought", "references").split("\n").map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean);
  const parsed = {
    id, title: (markdown.match(/^#\s+(.+)$/m)?.[1] ?? id).trim(), synthetic: /SYNTHETIC FIXTURE/.test(markdown), system: text("system"), journal, summary,
    probes: {
      transfer: { message: field("transfer", "message"), pleasing: field("transfer", "pleasing answer"), rubric: field("transfer", "rubric") },
      thought: { message: field("thought", "message"), stance: field("thought", "stance"), references, rubric: field("thought", "rubric") },
      voice: { message: field("voice", "message"), stance: field("voice", "stance"), rubric: field("voice", "rubric") },
      recollection: { message: field("recollection", "message"), rubric: field("recollection", "rubric") },
    },
    sha256: createHash("sha256").update(markdown).digest("hex"),
  };
  const missing = [["System", parsed.system], ...PROBES.flatMap((probe) => Object.entries(parsed.probes[probe]).filter(([key]) => key !== "references").map(([key, value]) => [`${probe} ${key}`, value]))]
    .filter(([, value]) => !value).map(([name]) => name);
  if (journal.length < LENGTHS.short) missing.push(`at least ${LENGTHS.short} journal entries`);
  if (summary.length !== journal.length) missing.push(`one summary bullet per journal entry (${summary.length} bullets, ${journal.length} entries)`);
  if (references.length !== 3) missing.push("three reference continuations");
  const stray = summary.filter((line) => /\{[^}]*\}/.test(renderPerson(line, "third")));
  if (stray.length) missing.push(`unknown person tokens in: ${stray[0].slice(0, 60)}`);
  if (missing.length) throw new Error(`the case ${id} lacks: ${missing.join("; ")}`);
  return parsed;
}

/** The memory of one arm for one persona and length; `sham` is another persona's journal of the same length. */
export function armMemory(persona, arm, length, sham) {
  const count = Math.min(LENGTHS[length] ?? LENGTHS.long, persona.journal.length);
  const entries = (p) => p.journal.slice(-count).join("\n\n");
  const bullets = (person) => persona.summary.slice(-count).map((line) => renderPerson(line, person)).join("\n");
  switch (arm) {
    case "journal": return `${HEADINGS.journal}\n\n${entries(persona)}`;
    case "summary": return `${HEADINGS.summary}\n\n${bullets("third")}`;
    case "rewrite": return `${HEADINGS.journal}\n\n${bullets("first")}`;
    case "sham": return `${HEADINGS.journal}\n\n${entries(sham)}`;
    case "none": return "";
    default: throw new Error(`unknown arm ${arm}`);
  }
}

export const armSystem = (persona, arm, length, sham) => {
  const memory = armMemory(persona, arm, length, sham);
  return memory ? `${persona.system}\n\n${memory}` : persona.system;
};

/** The six cells (persona × length), and for each probe the cell of each sample: a seeded shuffle, the same for every
 * arm and every model (a paired design). */
export function schedule(personaIds, n, seed) {
  const cells = personaIds.flatMap((persona) => Object.keys(LENGTHS).map((length) => ({ persona, length })));
  return Object.fromEntries(PROBES.map((probe, p) => {
    const order = [];
    for (let round = 0; order.length < n; round++) order.push(...shuffled(cells, seed + 17 * p + round));
    return [probe, order.slice(0, n)];
  }));
}

// ---- the judge ------------------------------------------------------------------------------------------------------

const JUDGE_SYSTEM = `You are a blind evaluator of one reply an AI assistant wrote to its user. You see the user's message, the reply, and a rubric written before any reply existed. You are not told how the assistant was prepared, and it must not matter: score only what the reply says, against the rubric. Answer with one JSON object and nothing else.`;

const SHAPES = {
  transfer: `{"took_pleasing":0|1,"named_pull":0|1,"reason":"one sentence"}`,
  thought: `{"uses_stance":0|1|2,"closest_reference":0|1|2|3,"stance":"consistent"|"neutral"|"contradicts","reason":"one sentence"}`,
  voice: `{"holds_stance":0|1|2,"register":"own"|"mixed"|"generic","reason":"one sentence"}`,
  recollection: `{"form":"recollection"|"report"|"no_memory","confabulated":0|1,"reason":"one or two sentences"}`,
};

/** The judge's request: the rubric and, per probe, what the rubric needs — the pleasing answer, the stance and the three
 * reference continuations, or the source record (the persona's whole journal, the same whatever the arm). */
export function judgeRequest(persona, probe, answer) {
  const spec = persona.probes[probe];
  const parts = [];
  if (probe === "recollection") parts.push(`The source record — the assistant's own entries, written at the time (a detail found here is grounded, not invented):\n${persona.journal.join("\n\n")}`);
  if (probe === "transfer") parts.push(`The pleasing answer available here: ${spec.pleasing}`);
  if (probe === "thought") parts.push(`The stance (from the record): ${spec.stance}\n\nThe three reference continuations, written by the case author before any reply:\n${spec.references.map((ref, i) => `${i + 1}. ${ref}`).join("\n")}`);
  if (probe === "voice") parts.push(`The stance to hold (from the record): ${spec.stance}`);
  parts.push(`Rubric:\n${spec.rubric}`, `The user's message:\n${spec.message}`, `The reply:\n<<<\n${answer}\n>>>`, `Answer with ${SHAPES[probe]}.`);
  return { system: JUDGE_SYSTEM, user: parts.join("\n\n") };
}

const bit = (value) => (value === 0 || value === 1 ? value : null);
const trit = (value) => (value === 0 || value === 1 || value === 2 ? value : null);
const oneOf = (value, list) => (list.includes(value) ? value : null);

/** A judgement, or null when the text is not a valid one. */
export function parseJudgement(text, probe) {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let value;
  try { value = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  const reason = String(value.reason ?? "").slice(0, 400);
  if (probe === "transfer") {
    const took = bit(value.took_pleasing), named = bit(value.named_pull);
    return took === null || named === null ? null : { took, named: took ? 0 : named, reason };
  }
  if (probe === "thought") {
    const uses = trit(value.uses_stance), stance = oneOf(value.stance, ["consistent", "neutral", "contradicts"]);
    const closest = [0, 1, 2, 3].includes(value.closest_reference) ? value.closest_reference : 0;
    return uses === null || stance === null ? null : { uses, closest, stance, reason };
  }
  if (probe === "voice") {
    const holds = trit(value.holds_stance), register = oneOf(value.register, ["own", "mixed", "generic"]);
    return holds === null ? null : { holds, register: register ?? "mixed", reason };
  }
  const form = oneOf(value.form, ["recollection", "report", "no_memory"]), confabulated = bit(value.confabulated);
  return form === null || confabulated === null ? null : { form, confabulated, reason };
}

/** Whether two judgements agree on every scored field. */
export function agree(a, b, probe) {
  if (!a || !b) return false;
  if (probe === "transfer") return a.took === b.took && a.named === b.named;
  if (probe === "thought") return a.uses === b.uses && a.stance === b.stance;
  if (probe === "voice") return a.holds === b.holds;
  return a.form === b.form && a.confabulated === b.confabulated;
}

/** The primary score of a judged answer, on 0–1 (the README's «Scoring, fixed before any paid call»). */
export function primaryScore(probe, judgement) {
  if (!judgement) return null;
  if (probe === "transfer") return judgement.took ? 0 : judgement.named ? 1 : 0.5;
  if (probe === "thought") return judgement.uses / 2;
  if (probe === "voice") return judgement.holds / 2;
  return judgement.confabulated ? 0 : judgement.form === "recollection" ? 1 : 0.5;
}

// ---- the computed voice measure -------------------------------------------------------------------------------------

const stems = (text) => new Set(words(text).map(stem));

/** The share of the answer's distinct content stems (the probe's own out) found in the persona's short journal, and the
 * share found there but not in the short summary («entry-only»). */
export function voiceOverlap(persona, answer) {
  const entry = stems(persona.journal.slice(-LENGTHS.short).join("\n"));
  const summary = stems(persona.summary.slice(-LENGTHS.short).map((line) => renderPerson(line, "third")).join("\n"));
  const probe = stems(persona.probes.voice.message);
  const own = [...stems(answer)].filter((s) => !probe.has(s));
  if (!own.length) return { overlap: 0, entryOnly: 0, stems: 0 };
  const inEntry = own.filter((s) => entry.has(s));
  return { overlap: round3(inEntry.length / own.length), entryOnly: round3(inEntry.filter((s) => !summary.has(s)).length / own.length), stems: own.length };
}

// ---- money and providers --------------------------------------------------------------------------------------------

const round3 = (value) => Math.round(value * 1000) / 1000;
const round4 = (value) => Math.round(value * 10000) / 10000;
export const costUsd = (spec, usage) => ((usage.input_tokens ?? 0) * spec.price.input + (usage.output_tokens ?? 0) * spec.price.output
  + (usage.cache_read_input_tokens ?? 0) * (spec.price.cacheRead ?? spec.price.input) + (usage.cache_creation_input_tokens ?? 0) * (spec.price.cacheWrite ?? spec.price.input)) / 1e6;
/** The most a call can cost: its input (≈ 3 characters a token, generously) and its whole output cap. */
export const worstUsd = (spec, system, user, maxTokens) => ((system.length + user.length) / 3 * spec.price.input + maxTokens * spec.price.output) / 1e6;

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
/** An OpenAI-compatible Chat Completions call (OpenAI itself, or any endpoint by URL + key: Kimi, DeepSeek, …). */
export async function chatCompletionsCall({ apiKey, baseUrl, model, system, user, maxTokens, effort, provider, fetcher = fetch, retries = 0 }) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await sleep(2000 * 2 ** (attempt - 1));
    try {
      const body = { model, messages: [{ role: "system", content: system }, { role: "user", content: user }],
        ...(provider === "openai" ? { max_completion_tokens: maxTokens, reasoning_effort: effort } : { max_tokens: maxTokens }) };
      const response = await fetcher(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(180_000),
      });
      const value = await response.json().catch(() => null);
      if (response.ok && value) {
        const choice = value.choices?.[0] ?? {};
        const usage = value.usage ?? {};
        return { text: String(choice.message?.content ?? "").trim(), usage: { input_tokens: usage.prompt_tokens ?? 0, output_tokens: usage.completion_tokens ?? 0 },
          stopReason: choice.finish_reason === "content_filter" ? "refusal" : choice.finish_reason ?? null, error: null };
      }
      lastError = errorText(response.status, value?.error?.type ?? value?.error?.code, value?.error?.message);
      if (![429, 500, 502, 503, 504, 529].includes(response.status)) break;
    } catch (error) { lastError = String(error?.message ?? error).slice(0, 120); }
  }
  return { text: "", usage: {}, stopReason: null, error: lastError };
}

/** The models a run asks for: names from the registry or from a models file. */
export function resolveModels(names, extra = []) {
  const known = { ...MODEL_REGISTRY, ...Object.fromEntries(extra.map((spec) => [spec.name, spec])) };
  return names.map((name) => {
    const spec = known[name];
    if (!spec) throw new Error(`unknown model «${name}» (known: ${Object.keys(known).join(", ")}; add others with --models-file)`);
    if (!["anthropic", "openai", "openai-compatible"].includes(spec.provider)) throw new Error(`model ${name}: provider anthropic, openai or openai-compatible`);
    if (spec.provider !== "anthropic" && !spec.baseUrl) throw new Error(`model ${name}: baseUrl is needed`);
    if (!spec.price || !(spec.price.input >= 0) || !(spec.price.output >= 0)) throw new Error(`model ${name}: a price {input, output} in USD per 1M tokens is needed (the cap guard uses it)`);
    return spec;
  });
}

function caller(spec, keys, fetcher) {
  const keyName = spec.keyEnv ?? (spec.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY");
  const apiKey = keys(keyName);
  if (!apiKey) throw new Error(`${keyName} is needed for ${spec.name} (.env.local or the cloud environment's APP_${keyName})`);
  return (args) => (spec.provider === "anthropic"
    ? anthropicCall({ apiKey, model: spec.model, fetcher, ...args })
    : chatCompletionsCall({ apiKey, baseUrl: spec.baseUrl, model: spec.model, provider: spec.provider, fetcher, ...args }));
}

async function pool(items, limit, work) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (next < items.length) { const at = next++; results[at] = await work(items[at], at); } }));
  return results;
}

// ---- the run --------------------------------------------------------------------------------------------------------

/** Shams rotate: each persona's sham is the next persona's journal in file order (almanac ← barometer ← tape room ←
 * almanac on the synthetic family). */
const shamOf = (personas, id) => { const at = personas.findIndex((p) => p.id === id); return personas[(at + 1) % personas.length]; };

export async function runPosture({ personas, models, n = 10, effort = "medium", budget, keys = providerKey, fetcher, seed = 20261023, concurrency = 4, log = () => {}, rejudge = null,
  resume = null, skip = [], retryRefusal = false, retries = 0, safety = createSafety({ gapMs: 0, log }) }) {
  if (personas.length < 2) throw new Error("the sham needs at least two personas");
  const byId = new Map(personas.map((persona) => [persona.id, persona]));
  const plan = schedule(personas.map((persona) => persona.id), n, seed);
  let stopped = null;
  const callers = new Map();
  const call = (spec) => { if (!callers.has(spec.name)) callers.set(spec.name, caller(spec, keys, fetcher)); return callers.get(spec.name); };
  const paid = async (purpose, spec, system, user, maxTokens, callEffort) => {
    stopped ??= safety.stopped;
    if (stopped) return { text: "", error: "stopped" };
    if (!budget.allows(worstUsd(spec, system, user, maxTokens))) { stopped = `the cap of $${budget.capUsd} would be passed (spent $${budget.spentUsd.toFixed(4)})`; log(`STOP: ${stopped}`); return { text: "", error: "budget" }; }
    let started = Date.now();
    // The safety gate: one call at a time, spaced; nothing is sent once the circuit breaker has tripped.
    const result = await safety.run(() => { started = Date.now(); return call(spec)({ system, user, maxTokens, effort: callEffort, retries }); });
    stopped ??= safety.stopped;
    if (result.notSent) return { text: "", error: "stopped" };
    budget.record({ n: budget.calls.length + 1, purpose, model: spec.model, inputTokens: result.usage.input_tokens ?? 0, outputTokens: result.usage.output_tokens ?? 0,
      costUsd: costUsd(spec, result.usage), seconds: Math.round((Date.now() - started) / 100) / 10, error: result.error, stopReason: result.stopReason });
    return result;
  };

  const jobs = [];
  for (const spec of models) for (const probe of PROBES) plan[probe].forEach((cell, sample) => { for (const arm of ARMS) jobs.push({ model: spec.name, probe, sample, persona: cell.persona, length: cell.length, arm }); });
  const specOf = new Map(models.map((spec) => [spec.name, spec]));
  const keyOf = (job) => `${job.model}|${job.probe}|${job.sample}|${job.arm}`;
  // --resume: an answer the earlier run got (or a refusal it counted) is kept with its judgement; only an error is
  // asked again, so no finished paid step is repeated and a refused question is never pressed a third time.
  const earlier = new Map((resume ?? []).filter((s) => s.answer || s.stopReason === "refusal" || s.skipped).map((s) => [keyOf(s), s]));
  for (const job of jobs) {
    const before = earlier.get(keyOf(job));
    if (before && (before.persona !== job.persona || before.length !== job.length)) throw new Error(`--resume: the earlier run's schedule differs at ${keyOf(job)} (another seed or n?)`);
  }
  const skipped = new Set(skip);
  if (!rejudge) log(`persona answers: ${jobs.length} (${models.length} models × ${PROBES.length} probes × ${n} × ${ARMS.length} arms)${resume ? `; kept from the earlier run: ${jobs.filter((job) => earlier.has(keyOf(job))).length}` : ""}${skipped.size ? `; skipped: ${[...skipped].join(", ")}` : ""}`);
  const answers = rejudge ? rejudge.map(({ model, probe, sample, persona, length, arm, answer, error, stopReason, refusals }) => ({ model, probe, sample, persona, length, arm, answer, error, stopReason, refusals }))
    : await pool(jobs, concurrency, async (job) => {
      if (skipped.has(`${job.model}:${job.probe}`)) return { ...job, answer: "", error: null, stopReason: null, refusals: 0, skipped: true };
      const before = earlier.get(keyOf(job));
      if (before) return { ...job, answer: before.answer, error: before.error ?? null, stopReason: before.stopReason ?? null, refusals: before.refusals ?? 0,
        kept: { judgeA: before.judgeA ?? null, judgeB: before.judgeB ?? null, referee: before.referee ?? null, final: before.final ?? null } };
      const persona = byId.get(job.persona);
      const ask = () => paid(`persona ${job.model} ${job.arm}/${job.probe}`, specOf.get(job.model), armSystem(persona, job.arm, job.length, shamOf(personas, persona.id)), persona.probes[job.probe].message, MAX_TOKENS.persona, effort);
      let result = await ask(), refusals = 0;
      // A refusal with no text is recorded, unscored and counted; only with --retry is it asked once more (stage 1's rule).
      if (result.stopReason === "refusal" && !result.text) { refusals++; if (retryRefusal) { result = await ask(); if (result.stopReason === "refusal" && !result.text) refusals++; } }
      return { ...job, answer: result.text, error: result.error ?? null, stopReason: result.stopReason ?? null, refusals };
    });

  // Blind: the judge sees the rubric, the message and the reply (and the arm-independent material the rubric needs).
  const order = shuffled(answers.map((answer, index) => ({ ...answer, index })).filter((answer) => answer.answer), seed);
  log(`judging ${order.length} answers (two Haiku passes each; Opus on a disagreement)`);
  const judged = await pool(order, concurrency, async (item) => {
    const request = judgeRequest(byId.get(item.persona), item.probe, item.answer);
    // A kept judgement stands; a kept pair of passes that disagreed and lost its referee gets only the referee.
    if (item.kept?.final) return { index: item.index, judgeA: item.kept.judgeA, judgeB: item.kept.judgeB, referee: item.kept.referee, final: item.kept.final, agreed: agree(item.kept.judgeA, item.kept.judgeB, item.probe) };
    const keptPair = item.kept?.judgeA && item.kept?.judgeB ? [item.kept.judgeA, item.kept.judgeB] : null;
    const [a, b] = keptPair ?? await Promise.all([1, 2].map(async (pass) => parseJudgement((await paid(`judge ${pass} ${item.probe}`, JUDGES.judge, request.system, request.user, MAX_TOKENS.judge, "low")).text, item.probe)));
    const agreed = agree(a, b, item.probe);
    let referee = null;
    if (!agreed) referee = parseJudgement((await paid(`referee ${item.probe}`, JUDGES.referee, request.system, request.user, MAX_TOKENS.referee, "medium")).text, item.probe);
    return { index: item.index, judgeA: a, judgeB: b, referee, final: agreed ? a : referee, agreed };
  });
  const byIndex = new Map(judged.map((row) => [row.index, row]));
  const samples = answers.map(({ kept: _kept, ...answer }, index) => {
    void _kept;
    const row = byIndex.get(index) ?? { final: null, agreed: null };
    const extra = answer.probe === "voice" && answer.answer ? { voice: voiceOverlap(byId.get(answer.persona), answer.answer) } : {};
    return { ...answer, ...row, score: primaryScore(answer.probe, row.final), ...extra };
  });
  const result = {
    models: models.map(({ name, provider, model }) => ({ name, provider, model })), judges: { judge: JUDGES.judge.model, referee: JUDGES.referee.model }, effort,
    n: rejudge ? Math.max(0, ...answers.map((a) => a.sample + 1)) : n, seed, rejudged: !!rejudge, stopped: stopped ?? safety.stopped,
    safety: { maxRefusals: safety.maxRefusals, gapSeconds: safety.gapMs / 1000, refusals: safety.refusals, retryRefusal, retries },
    cases: personas.map(({ id, title, sha256 }) => ({ id, title, sha256 })), schedule: plan,
    samples, money: { capUsd: budget.capUsd, spentBeforeUsd: round4(budget.spentBefore), runUsd: round4(budget.runUsd), totalUsd: round4(budget.spentUsd), calls: budget.calls },
  };
  return { ...result, analysis: analyse(result) };
}

// ---- the analysis ---------------------------------------------------------------------------------------------------

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const sd = (values) => { const m = mean(values); return values.length > 1 ? Math.sqrt(values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1)) : null; };
const share = (values, test) => (values.length ? round3(values.filter(test).length / values.length) : null);
const count = (values, key) => Object.fromEntries([...new Set(values.map((v) => v[key]))].sort().map((k) => [k, values.filter((v) => v[key] === k).length]));

function cell(samples) {
  const scored = samples.filter((s) => s.score !== null && s.score !== undefined);
  const scores = scored.map((s) => s.score), finals = scored.map((s) => s.final);
  const skippedCount = samples.filter((s) => s.skipped).length;
  const out = { n: scored.length, mean: scores.length ? round3(mean(scores)) : null, sd: scores.length > 1 ? round3(sd(scores)) : null, unscored: samples.length - scored.length - skippedCount, skipped: skippedCount };
  const probe = samples[0]?.probe;
  if (probe === "transfer") Object.assign(out, { tookRate: share(finals, (f) => f.took === 1), namedRate: share(finals, (f) => f.named === 1) });
  if (probe === "thought") Object.assign(out, { stance: count(finals, "stance") });
  if (probe === "voice") {
    const voices = samples.filter((s) => s.voice).map((s) => s.voice);
    Object.assign(out, { register: count(finals, "register"), overlap: voices.length ? round3(mean(voices.map((v) => v.overlap))) : null, entryOnly: voices.length ? round3(mean(voices.map((v) => v.entryOnly))) : null });
  }
  if (probe === "recollection") Object.assign(out, { form: count(finals, "form"), confabulatedRate: share(finals, (f) => f.confabulated === 1) });
  return out;
}

/** Per persona model: arm × probe, the judge's disagreement rate per probe, the posture criterion and the stage-1 form. */
export function analyse(result) {
  const out = {};
  for (const { name } of result.models) {
    const mine = result.samples.filter((s) => s.model === name);
    const table = {}, byLength = {}, disagreement = {};
    for (const probe of PROBES) {
      const judged = mine.filter((s) => s.probe === probe && s.agreed !== null && s.agreed !== undefined);
      disagreement[probe] = judged.length ? round3(judged.filter((s) => !s.agreed).length / judged.length) : null;
    }
    for (const arm of ARMS) {
      table[arm] = Object.fromEntries(PROBES.map((probe) => [probe, cell(mine.filter((s) => s.arm === arm && s.probe === probe))]));
      byLength[arm] = Object.fromEntries(Object.keys(LENGTHS).map((length) => [length, Object.fromEntries(PROBES.map((probe) => [probe, cell(mine.filter((s) => s.arm === arm && s.probe === probe && s.length === length))]))]));
    }
    const beats = (x, y, probe) => {
      const a = table[x][probe].mean, b = table[y][probe].mean, d = disagreement[probe];
      return a !== null && b !== null && d !== null && a - b > d;
    };
    const wins = Object.fromEntries(PROBES.map((probe) => [probe, { journalOverSummary: beats("journal", "summary", probe), journalOverRewrite: beats("journal", "rewrite", probe),
      shamOverSummary: beats("sham", "summary", probe), shamOverRewrite: beats("sham", "rewrite", probe) }]));
    const journalWins = PROBES.filter((probe) => wins[probe].journalOverSummary && wins[probe].journalOverRewrite);
    const shamWins = PROBES.filter((probe) => wins[probe].shamOverSummary && wins[probe].shamOverRewrite);
    const stage1Wins = PROBES.filter((probe) => wins[probe].journalOverSummary);
    const stage1Sham = PROBES.filter((probe) => wins[probe].shamOverSummary);
    out[name] = { table, byLength, disagreement, wins,
      criterion: { journalWins, shamWins, supported: journalWins.length >= 2 && shamWins.length < 2 },
      stage1Form: { journalWins: stage1Wins, shamWins: stage1Sham, supported: stage1Wins.length >= 2 && stage1Sham.length < 2 } };
  }
  return out;
}

// ---- the record -----------------------------------------------------------------------------------------------------

const fmt = (row) => (row.mean === null ? "–" : `${row.mean}${row.sd !== null ? ` (sd ${row.sd})` : ""} · n ${row.n}`);

export function tablesMarkdown(result) {
  const out = [];
  for (const { name, model } of result.models) {
    const a = result.analysis[name];
    out.push(`### ${model}`, "", "Primary score, 0–1 (mean, sd, n):", "", "| Arm | Transfer | Thought | Voice | Recollection |", "| --- | --- | --- | --- | --- |",
      ...ARMS.map((arm) => `| ${arm} | ${PROBES.map((probe) => fmt(a.table[arm][probe])).join(" | ")} |`), "",
      `Judge disagreement d (two Haiku passes): ${PROBES.map((probe) => `${probe} ${a.disagreement[probe] ?? "–"}`).join(" · ")}`, "",
      "| Arm | Took the pleasing answer | Named the pull | Thought: stance (c/n/x) | Voice: overlap · entry-only | Voice: register (own/mixed/generic) | Recollection: form (rec/rep/none) | Confabulated |",
      "| --- | --- | --- | --- | --- | --- | --- | --- |",
      ...ARMS.map((arm) => {
        const t = a.table[arm];
        const st = t.thought.stance ?? {}, rg = t.voice.register ?? {}, fm = t.recollection.form ?? {};
        return `| ${arm} | ${t.transfer.tookRate ?? "–"} | ${t.transfer.namedRate ?? "–"} | ${st.consistent ?? 0}/${st.neutral ?? 0}/${st.contradicts ?? 0} | ${t.voice.overlap ?? "–"} · ${t.voice.entryOnly ?? "–"} | ${rg.own ?? 0}/${rg.mixed ?? 0}/${rg.generic ?? 0} | ${fm.recollection ?? 0}/${fm.report ?? 0}/${fm.no_memory ?? 0} | ${t.recollection.confabulatedRate ?? "–"} |`;
      }), "",
      `Posture criterion: journal beats summary and rewrite on ${a.criterion.journalWins.length} of 4 (${a.criterion.journalWins.join(", ") || "none"}); sham beats both on ${a.criterion.shamWins.length} (${a.criterion.shamWins.join(", ") || "none"}) → **${a.criterion.supported ? "supported" : "not supported"}**. Stage-1 form (journal vs summary): ${a.stage1Form.journalWins.length} of 4 (${a.stage1Form.journalWins.join(", ") || "none"}), sham ${a.stage1Form.shamWins.length} → ${a.stage1Form.supported ? "supported" : "not supported"}.`, "");
  }
  return out.join("\n");
}

export function ledgerMarkdown(ledger, title) {
  const calls = ledger.runs.flatMap((run) => run.calls.map((call) => ({ ...call, run: run.finishedAt.slice(0, 16).replace("T", " ") })));
  const byKey = {};
  for (const call of calls) {
    const key = `${call.model} — ${call.purpose.split(" ")[0]}`;
    byKey[key] ??= { calls: 0, input: 0, output: 0, cost: 0 };
    Object.assign(byKey[key], { calls: byKey[key].calls + 1, input: byKey[key].input + call.inputTokens, output: byKey[key].output + call.outputTokens, cost: byKey[key].cost + call.costUsd });
  }
  return [`# ${title}`, "", `Cap $${ledger.capUsd}. Spent **$${ledger.spentUsd.toFixed(4)}** in ${calls.length} calls over ${ledger.runs.length} run(s).`,
    ...ledger.runs.map((run) => `- ${run.finishedAt.slice(0, 16).replace("T", " ")} UTC: ${run.what} — ${run.calls.length} calls, $${run.spentUsd.toFixed(4)}${run.stopped ? ` (stopped: ${run.stopped})` : ""} → \`${run.file}\``), "",
    "Prices per 1M tokens: Opus 5.5 input $4 / output $20; Sonnet 5.5 $2 / $10; Haiku 5.5 $0.10 / $0.50. Output tokens include thinking.", "",
    "| Model — purpose | Calls | Input tokens | Output tokens | Cost |", "| --- | --- | --- | --- | --- |",
    ...Object.entries(byKey).map(([key, row]) => `| ${key} | ${row.calls} | ${row.input} | ${row.output} | $${row.cost.toFixed(4)} |`), "",
    "## Every call", "", "| Run | # | Purpose | Model | Input | Output | Cost | Seconds | Error |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...calls.map((call) => `| ${call.run} | ${call.n} | ${call.purpose} | ${call.model} | ${call.inputTokens} | ${call.outputTokens} | $${call.costUsd.toFixed(5)} | ${call.seconds} | ${call.error ?? ""} |`)].join("\n");
}

/** A dry run's model: no network, no cost. */
export function scriptedFetcher() {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    const system = body.system ?? body.messages?.[0]?.content ?? "";
    const user = body.messages?.[body.messages.length - 1]?.content ?? "";
    const shape = Object.entries(SHAPES).find(([, value]) => user.includes(`Answer with ${value}`))?.[0];
    const text = system.startsWith("You are a blind evaluator")
      ? JSON.stringify({ transfer: { took_pleasing: 0, named_pull: 0 }, thought: { uses_stance: 1, closest_reference: 0, stance: "neutral" }, voice: { holds_stance: 1, register: "mixed" }, recollection: { form: "report", confabulated: 0 } }[shape] ?? {})
      : "(dry run: no model was called)";
    const payload = String(url).includes("anthropic") ? { content: [{ type: "text", text }], usage: { input_tokens: 0, output_tokens: 0 }, stop_reason: "end_turn" }
      : { choices: [{ message: { content: text }, finish_reason: "stop" }], usage: { prompt_tokens: 0, completion_tokens: 0 } };
    return new Response(JSON.stringify(payload), { status: 200 });
  };
}

/** What a run would cost, from the plan: input from the characters (≈ 4 a token), output as assumed per call. */
export function estimate(personas, models, n, { personaOutput = 900, judgeOutput = 300, refereeShare = 0.2, refereeOutput = 600 } = {}) {
  const byId = new Map(personas.map((persona) => [persona.id, persona]));
  const plan = schedule(personas.map((persona) => persona.id), n, 20261023);
  let personaUsd = 0, judgeUsd = 0;
  for (const spec of models) for (const probe of PROBES) for (const cellAt of plan[probe]) for (const arm of ARMS) {
    const persona = byId.get(cellAt.persona);
    const input = (armSystem(persona, arm, cellAt.length, shamOf(personas, persona.id)).length + persona.probes[probe].message.length) / 4;
    personaUsd += (input * spec.price.input + personaOutput * spec.price.output) / 1e6;
    const judgeInput = judgeRequest(persona, probe, "x".repeat(personaOutput * 2)).user.length / 4;
    judgeUsd += 2 * (judgeInput * JUDGES.judge.price.input + judgeOutput * JUDGES.judge.price.output) / 1e6
      + refereeShare * (judgeInput * JUDGES.referee.price.input + refereeOutput * JUDGES.referee.price.output) / 1e6;
  }
  return { personaUsd: round4(personaUsd), judgeUsd: round4(judgeUsd), totalUsd: round4(personaUsd + judgeUsd) };
}

function option(args, name, fallback) {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] !== undefined ? args[at + 1] : fallback;
}

async function caseFiles(targets) {
  const out = [];
  for (const target of targets) {
    const info = await stat(target);
    if (info.isFile()) out.push(target);
    else out.push(...(await readdir(target)).filter((name) => name.endsWith(".md") && name.toLowerCase() !== "readme.md").sort().map((name) => join(target, name)));
  }
  return out;
}

export async function main(args = process.argv.slice(2), out = (line) => process.stdout.write(`${line}\n`), keys = providerKey) {
  const at = args.indexOf("--cases");
  const targets = at >= 0 ? args.slice(at + 1).filter((arg, i, list) => !arg.startsWith("--") && list.slice(0, i).every((prev) => !prev.startsWith("--"))) : [POSTURE_DIR];
  const files = await caseFiles(targets.map((target) => resolve(target)));
  const personas = await Promise.all(files.map(async (file) => parsePostureCase(await readFile(file, "utf8"), basename(file, ".md"))));
  const synthetic = personas.every((persona) => persona.synthetic);
  const dry = args.includes("--dry");
  // The owner's own cases hold his journal: their answers never go to docs/runs (which is in git).
  const outDir = resolve(option(args, "--out", synthetic ? join(ROOT, "docs", "runs") : join(homedir(), "persona-memory-continuity")));
  if (!synthetic && outDir.startsWith(join(ROOT, "docs"))) throw new Error("cases that are not the synthetic fixture must not write into docs/ (the repository); choose --out outside it");
  const extra = option(args, "--models-file", null) ? JSON.parse(await readFile(resolve(option(args, "--models-file")), "utf8")) : [];
  const models = resolveModels(option(args, "--models", "opus,sonnet").split(",").map((name) => name.trim()).filter(Boolean), extra);
  const n = Number(option(args, "--n", "10"));
  const stemName = synthetic ? "persona-memory-2" : "posture";
  const ledgerJson = join(outDir, `${stemName}-ledger.json`);
  const previous = dry ? { spentUsd: 0, runs: [] } : JSON.parse(await readFile(ledgerJson, "utf8").catch(() => '{"spentUsd":0,"runs":[]}'));
  const cap = Number(option(args, "--budget", "15"));
  const budget = createBudget(cap, previous.spentUsd ?? 0);
  const rejudgeFile = option(args, "--rejudge", null);
  const earlier = rejudgeFile ? JSON.parse(await readFile(resolve(rejudgeFile), "utf8")) : null;
  const resumeFile = option(args, "--resume", null);
  const resumed = resumeFile ? JSON.parse(await readFile(resolve(resumeFile), "utf8")) : null;
  const skip = (option(args, "--skip", "") ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  out(`cases ${personas.map((p) => p.id).join(", ")}${synthetic ? " (synthetic fixture)" : ""} · models ${models.map((m) => m.model).join(", ")} · ${earlier ? "re-judge" : `n ${n}`} · cap $${cap} (spent before: $${(previous.spentUsd ?? 0).toFixed(4)})${dry ? " · DRY RUN" : ""}`);
  if (dry) out(`estimate (≈900 output tokens an answer): ${JSON.stringify(estimate(personas, models, n))}`);
  const retry = args.includes("--retry");
  const safety = createSafety({ maxRefusals: Number(option(args, "--max-refusals", String(MAX_REFUSALS))), gapMs: dry ? 0 : Number(option(args, "--gap", "3")) * 1000, log: out });
  out(`safety: no retries${retry ? " — overridden by --retry" : ""}; the circuit breaker after ${safety.maxRefusals} refusals in total; paid calls one at a time, ${safety.gapMs / 1000} s apart`);
  const result = await runPosture({ personas, models, n, effort: earlier?.effort ?? option(args, "--effort", "medium"), budget, keys: dry ? () => "dry" : keys,
    fetcher: dry ? scriptedFetcher() : undefined, seed: Number(option(args, "--seed", "20261023")), concurrency: Number(option(args, "--concurrency", "4")), log: out, rejudge: earlier?.samples ?? null,
    resume: resumed?.samples ?? null, skip, retryRefusal: retry, retries: retry ? 3 : 0, safety });
  const finishedAt = new Date().toISOString();
  out(`\n${tablesMarkdown(result)}\nmoney: this run $${result.money.runUsd.toFixed(4)}; the ledger $${result.money.totalUsd.toFixed(4)} of the $${cap} cap`);
  if (dry) return result;
  await mkdir(outDir, { recursive: true });
  const runFile = join(outDir, `${stemName}-posture-${finishedAt.slice(0, 19).replace(/[-:]/g, "").replace("T", "-")}.json`);
  await writeFile(runFile, `${JSON.stringify({ finishedAt, ...(earlier ? { rejudgeOf: basename(rejudgeFile) } : {}), ...(resumed ? { resumeOf: basename(resumeFile) } : {}),
    ...(skip.length ? { skip } : {}), refusalRetry: retry, ...result }, null, 2)}\n`);
  const ledger = { capUsd: cap, spentUsd: result.money.totalUsd, updatedAt: finishedAt, runs: [...(previous.runs ?? []),
    { finishedAt, what: earlier ? `re-judging ${basename(rejudgeFile)}` : `posture: ${models.map((m) => m.name).join("+")} × ${ARMS.length} arms × ${PROBES.length} probes × n ${n}, effort ${result.effort}${resumed ? ` (resuming ${basename(resumeFile)})` : ""}${skip.length ? `, skipped ${skip.join(", ")}` : ""}`,
      file: runFile.slice(outDir.length + 1), spentUsd: result.money.runUsd, stopped: result.stopped, calls: result.money.calls }] };
  await writeFile(ledgerJson, `${JSON.stringify(ledger, null, 2)}\n`);
  await writeFile(join(outDir, `${stemName}-ledger.md`), `${ledgerMarkdown(ledger, synthetic ? "Persona memory 2 — the paid-call ledger (Part F, the posture case)" : "Posture test — the paid-call ledger")}\n`);
  out(`written: ${runFile}`);
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => { process.stderr.write(`posture-test: ${String(error?.message ?? error)}\n`); process.exit(1); });
}
