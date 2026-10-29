#!/usr/bin/env node
// Blind decisions 1 (docs/stages/BLIND_DECISIONS_1.md): no session is played; every completed table session is reduced to
// a decision strip, the fork profiles are tested, and three model judges read the strips blind.
//   node --experimental-transform-types scripts/blind-decisions-1/run.mjs --freeze           the design hash and the vocabulary page
//   … --places [--go]          the move destinations' classes (Haiku, names only; without --go: what would be asked)
//   … --tag [--go] [--only <session ids>] [--limit <turns>] [--lanes 8]   the blind tagger over every turn (resumes)
//   … --strips                 the strips from the record and the tags (no call): -strips.json, -strips.md
//   … --profiles               the fork profiles and their tests (no call): -profiles.json
//   … --judge [--go] [--judges astra,deepseek,haiku] [--tasks T1,T2,T3,T4]   the judges (resumes)
//   … --packet                 the human readers' packet (no call)
//   … --report                 the report (no call)
// Paid calls in the cloud need NODE_USE_ENV_PROXY=1. Caps: $20 OpenRouter (Haiku, DeepSeek), $5 OpenAI (Astra), $0 the
// Console, on this stage's own ledgers (docs/runs/blind-decisions-1-ledger-*.json); keys from the APP_ variables, never printed.
import { existsSync, readFileSync } from "node:fs";
import { rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOOR_LABELS, RUNS, ledgerSuffix, runKeys, stageLedgers } from "../game-player-1/run.mjs";
import { createLedger, createMeter, ledgerMarkdown } from "../game-player-1/paid.mjs";
import { judgeCall } from "../game-player-1/players.mjs";
import { paidCall } from "../game-player-1/session.mjs";
import { openrouterChat } from "../game-player-replicate-1/openrouter-chat.mjs";
import { CAPS, DESIGN_SHA256, JUDGES, PROFILE, STEM, TAGGER } from "./frozen.mjs";
import { destinations, finalTurn, loadSessions, machineTurn, mergeTags, parsePlaces, parseTag, placeRequest, profileOf, domainsOf, stripOf, tagRequest, tagsAgree } from "./strips.mjs";
import { judgeTasks, parseAnswer } from "./judges.mjs";
import { profileTests } from "./profiles.mjs";
import { humanPacket, humanSets } from "./packet.mjs";
import { reportMarkdown, vocabularyMarkdown } from "./report.mjs";
import { stripsMarkdown } from "./report-body.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FILES = Object.fromEntries(["places", "tags", "strips", "profiles", "judges"].map((name) => [name, join(RUNS, `${STEM}-${name}.json`)]));
const readJson = (file, fallback = null) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback);
async function writeJson(file, value) { await writeFile(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`); await rename(`${file}.tmp`, file); }
const STAGE_LEDGERS = { caps: CAPS, stem: STEM };

// ---- paid calls ------------------------------------------------------------------------------------------------------------

/** A paid pass: the meter on this stage's ledgers, the keys, and the ledgers written after (one run entry per pass). */
async function paidPass(what, fn, log = console.log) {
  const keys = await runKeys();
  if (!keys.openrouter || !keys.openai) throw new Error("APP_OPENROUTER_API_KEY and APP_OPENAI_API_KEY must be set (the cloud environment rpg-console)");
  if (keys.door?.provider !== "openrouter") throw new Error("ANTHROPIC_PROVIDER must be openrouter for this stage (APP_ANTHROPIC_PROVIDER)");
  const { before, ledgers } = await stageLedgers(STAGE_LEDGERS);
  const meter = createMeter({ ledgers, fetcher: globalThis.fetch.bind(globalThis), log });
  try { return await fn({ meter, keys }); } finally {
    await meter.drain();
    const finishedAt = new Date().toISOString();
    for (const door of Object.keys(ledgers)) {
      if (!ledgers[door].calls.length) continue;
      const runs = [...(before[door].runs ?? []), { finishedAt, what, design: DESIGN_SHA256, spentUsd: ledgers[door].runUsd, stopped: meter.stopped, calls: ledgers[door].calls }];
      const spentUsd = runs.reduce((s, r) => s + (r.spentUsd ?? 0), 0);
      await writeJson(join(RUNS, `${STEM}-ledger${ledgerSuffix(door)}.json`), { capUsd: CAPS[door], spentUsd, updatedAt: finishedAt, runs });
      const all = createLedger(door, CAPS[door], 0);
      all.calls.push(...runs.flatMap((r) => r.calls ?? []));
      await writeFile(join(RUNS, `${STEM}-ledger${ledgerSuffix(door)}.md`), ledgerMarkdown(all, `Blind decisions 1 — the ${DOOR_LABELS[door] ?? door} ledger`));
      log(`${DOOR_LABELS[door] ?? door}: this pass $${ledgers[door].runUsd.toFixed(4)}, stage $${spentUsd.toFixed(4)} of $${CAPS[door]}`);
    }
    if (meter.stopped) log(`STOPPED: ${meter.stopped}`);
  }
}
/** One call: Astra through OpenAI's Responses, Haiku through the Claude door (OpenRouter), DeepSeek through OpenRouter's
 * chat completions pinned to DeepInfra — each in its metering context. */
const askOf = ({ meter, keys, log }) => ({ judge, system, user, maxTokens, effort, purpose, session }) => paidCall({ meter, session, purpose, log,
  call: () => (judge.provider === "openrouter"
    ? openrouterChat({ apiKey: keys.openrouter, spec: judge.spec, system, messages: [{ role: "user", content: user }], maxTokens, effort, fetcher: meter.fetch })
    : judgeCall({ model: judge.model, system, user, maxTokens, effort, keys, fetcher: meter.fetch })) });
const HAIKU = { provider: "anthropic", model: TAGGER.model };

async function pool(items, lanes, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(lanes, items.length) }, async () => { while (next < items.length) { const i = next++; await fn(items[i], i); } }));
}

// ---- the place classes -------------------------------------------------------------------------------------------------------

export async function classifyPlaces({ go = false, log = console.log } = {}) {
  const sessions = loadSessions(ROOT);
  const names = destinations(sessions);
  const batches = [];
  for (let i = 0; i < names.length; i += 60) batches.push(names.slice(i, i + 60));
  log(`${names.length} destination names in ${batches.length} batches`);
  if (!go) return log(placeRequest(batches[0]).user.slice(0, 1500));
  return paidPass("the move destinations' classes", async ({ meter, keys }) => {
    const ask = askOf({ meter, keys, log });
    const passes = [{}, {}, {}];
    const once = async (batch, pass) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await ask({ judge: HAIKU, ...placeRequest(batch), maxTokens: 8000, effort: "low", purpose: `places pass ${pass + 1}`, session: "places" });
        if (r.notSent) throw new Error(r.error);
        const parsed = parsePlaces(r.text, batch);
        if (parsed) return parsed;
      }
      return {};
    };
    for (const batch of batches) { const [a, b] = await Promise.all([once(batch, 0), once(batch, 1)]); Object.assign(passes[0], a); Object.assign(passes[1], b); }
    const split = names.filter((n) => passes[0][n] !== passes[1][n]);
    for (let i = 0; i < split.length; i += 60) Object.assign(passes[2], await once(split.slice(i, i + 60), 2));
    const classes = Object.fromEntries(names.map((n) => {
      const votes = [passes[0][n], passes[1][n], passes[2][n]].filter(Boolean);
      const major = votes.find((v) => votes.filter((x) => x === v).length >= 2);
      return [n, major ?? passes[2][n] ?? passes[0][n] ?? null];
    }));
    await writeJson(FILES.places, { design: DESIGN_SHA256, rule: "two Haiku passes over the names; a third on the names they split; the majority, else the third pass", names: names.length, split: split.length, classes, passes });
    log(`places: ${names.length} names, ${split.length} split between the passes, ${Object.values(classes).filter((c) => !c).length} unclassified`);
  }, log);
}

// ---- the blind tagger ----------------------------------------------------------------------------------------------------------

export async function tagTurns({ go = false, only = null, limit = Infinity, lanes = 8, log = console.log } = {}) {
  const places = readJson(FILES.places)?.classes;
  if (!places) throw new Error("run --places --go first");
  const sessions = loadSessions(ROOT).filter((s) => !only || only.includes(s.id));
  const store = readJson(FILES.tags, { design: DESIGN_SHA256, tagger: TAGGER, turns: {} });
  if (store.design !== DESIGN_SHA256) throw new Error(`the tags file was made under design ${store.design}, not ${DESIGN_SHA256}`);
  const jobs = [];
  for (const session of sessions) for (const turn of session.record.turns) {
    const machine = machineTurn(session, turn, places);
    const id = `${session.id}#t${turn.k}`;
    if (machine.text && !store.turns[id]?.final) jobs.push({ id, session, request: tagRequest(machine.text, session.brief) });
  }
  const todo = jobs.slice(0, limit);
  log(`${todo.length} turns to tag (${jobs.length} open; ${Object.keys(store.turns).length} on file)`);
  if (!go) { if (todo[0]) log(`${todo[0].request.system}\n\n${todo[0].request.user}`); return; }
  return paidPass(`the blind tagger (${todo.length} turns)`, async ({ meter, keys }) => {
    const ask = askOf({ meter, keys, log });
    let done = 0;
    const onePass = async (job, pass) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const r = await ask({ judge: HAIKU, ...job.request, maxTokens: TAGGER.maxTokens, effort: TAGGER.effort, purpose: `tag ${job.id} pass ${pass}`, session: `tag ${job.session.id}` });
        if (r.notSent) return { stop: r.error };
        const parsed = parseTag(r.text);
        if (parsed) return { parsed, stopReason: r.stopReason ?? null };
        if (r.stopReason === "refusal") return { refusal: true };
      }
      return { parsed: null };
    };
    await pool(todo, lanes, async (job) => {
      if (meter.stopped) return;
      const first = await Promise.all([onePass(job, 1), onePass(job, 2)]);
      if (first.some((x) => x.stop)) return;
      const passes = first.map((x) => x.parsed ?? null);
      if (!tagsAgree(passes[0], passes[1])) { const third = await onePass(job, 3); if (third.stop) return; passes.push(third.parsed ?? null); }
      const final = mergeTags(passes);
      store.turns[job.id] = { passes, final, ...(first.some((x) => x.refusal) ? { refusal: true } : {}) };
      if (++done % 25 === 0) { await writeJson(FILES.tags, store); log(`tagged ${done} of ${todo.length}`); }
    });
    await writeJson(FILES.tags, store);
    log(`tagged ${done} of ${todo.length}; on file ${Object.keys(store.turns).length}`);
  }, log);
}

/** The smoke before the freeze: the tagger on a few turns from different stages, printed, nothing written but the ledger. */
export async function smokeTagger({ ids, log = console.log } = {}) {
  const sessions = loadSessions(ROOT);
  const picks = ids.map((id) => { const [sid, k] = id.split("#t"); const session = sessions.find((s) => s.id === sid); return { id, session, turn: session.record.turns.find((t) => t.k === Number(k)) }; });
  return paidPass(`the tagger's smoke before the freeze (${picks.length} turns)`, async ({ meter, keys }) => {
    const ask = askOf({ meter, keys, log });
    for (const { id, session, turn } of picks) {
      const request = tagRequest(machineTurn(session, turn, {}).text, session.brief);
      const r = await ask({ judge: HAIKU, ...request, maxTokens: TAGGER.maxTokens, effort: TAGGER.effort, purpose: `smoke ${id}`, session: "smoke" });
      log(`${id}: ${r.error ?? ""} ${JSON.stringify(parseTag(r.text))}\n  raw: ${String(r.text).slice(0, 400)}`);
    }
  }, log);
}

// ---- strips, profiles ------------------------------------------------------------------------------------------------------------

export async function buildStrips({ log = console.log } = {}) {
  const places = readJson(FILES.places)?.classes ?? {};
  const tags = readJson(FILES.tags, { turns: {} });
  const sessions = loadSessions(ROOT);
  const out = [];
  let missing = 0, unclassified = 0;
  for (const session of sessions) {
    const finals = session.record.turns.map((turn) => {
      const machine = machineTurn(session, turn, places);
      unclassified += machine.unclassified.length;
      const tag = machine.text ? tags.turns[`${session.id}#t${turn.k}`]?.final ?? null : null;
      if (machine.text && !tag) missing++;
      return finalTurn(machine, tag);
    });
    const strip = stripOf(session, finals);
    out.push({ ...strip, from: session.from, ended: session.record.ended?.reason ?? null, profile: profileOf(finals), domains: domainsOf(finals), codes: finals });
  }
  await writeJson(FILES.strips, { design: DESIGN_SHA256, builtAt: new Date().toISOString(), missingTags: missing, unclassifiedMoves: unclassified, strips: out });
  log(`${out.length} strips, ${out.reduce((s, x) => s + x.turns, 0)} lines; turns without a tag ${missing}; moves without a class ${unclassified}`);
  return out;
}
export async function runProfiles({ log = console.log } = {}) {
  const { strips } = readJson(FILES.strips);
  const result = profileTests(strips);
  await writeJson(FILES.profiles, { design: DESIGN_SHA256, profile: PROFILE, ...result });
  log(JSON.stringify(result.primary, null, 2));
  return result;
}

// ---- the judges ------------------------------------------------------------------------------------------------------------------

export async function runJudges({ go = false, judges = JUDGES.map((j) => j.id), tasks = null, log = console.log } = {}) {
  const { strips } = readJson(FILES.strips);
  const store = readJson(FILES.judges, { design: DESIGN_SHA256, answers: {} });
  // The pre-registered tasks first, the supplementary sets last (a cap reached late cuts only those).
  const jobs = judgeTasks(strips).filter((j) => judges.includes(j.judge.id) && (!tasks || tasks.includes(j.task)) && !store.answers[j.id]?.answer)
    .sort((a, b) => Number(a.supplementary) - Number(b.supplementary));
  log(`${jobs.length} judge calls to make`);
  if (!go) { if (jobs[0]) log(`${jobs[0].system}\n\n${jobs[0].user}`); return; }
  return paidPass(`the judges (${jobs.length} tasks)`, async ({ meter, keys }) => {
    const ask = askOf({ meter, keys, log });
    // One judge's calls one at a time, the three judges side by side.
    await pool(judges, judges.length, async (judgeId) => {
      for (const job of jobs.filter((j) => j.judge.id === judgeId)) {
        if (meter.stopped) return;
        const attempts = [];
        let answer = null;
        for (let attempt = 0; attempt <= job.retries && !answer; attempt++) {
          const r = await ask({ judge: job.judge, system: job.system, user: job.user, maxTokens: job.judge.maxTokens, effort: job.judge.effort, purpose: `${job.task} ${job.set} attempt ${attempt + 1}`, session: `judge ${job.judge.id}` });
          if (r.notSent) return;
          answer = parseAnswer(job, r.text);
          attempts.push({ text: r.text, stopReason: r.stopReason ?? null, error: r.error ?? null, usage: r.usage ?? null, valid: Boolean(answer) });
        }
        store.answers[job.id] = { judge: job.judge.id, task: job.task, set: job.set, order: job.order, ...(job.labels ? { labels: job.labels } : {}), system: job.system, user: job.user, attempts, answer };
        await writeJson(FILES.judges, store);
        log(`${job.id}: ${answer ? "answered" : "no valid answer"}`);
      }
    });
  }, log);
}

// ---- the command line ----------------------------------------------------------------------------------------------------------

async function main(argv) {
  const has = (flag) => argv.includes(flag);
  const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null; };
  const list = (flag) => value(flag)?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
  console.log(`Blind decisions 1 · design ${DESIGN_SHA256}`);
  if (has("--freeze")) { await writeFile(join(RUNS, `${STEM}-vocabulary.md`), vocabularyMarkdown()); console.log(`wrote docs/runs/${STEM}-vocabulary.md`); }
  else if (has("--places")) await classifyPlaces({ go: has("--go") });
  else if (has("--tag")) await tagTurns({ go: has("--go"), only: list("--only"), limit: value("--limit") ? Number(value("--limit")) : Infinity, lanes: Number(value("--lanes") ?? 8) });
  else if (has("--smoke")) await smokeTagger({ ids: list("--smoke") });
  else if (has("--strips")) await buildStrips();
  else if (has("--profiles")) await runProfiles();
  else if (has("--judge")) await runJudges({ go: has("--go"), judges: list("--judges") ?? JUDGES.map((j) => j.id), tasks: list("--tasks") });
  else if (has("--packet")) {
    const { strips } = readJson(FILES.strips);
    await writeFile(join(RUNS, `${STEM}-human-packet.md`), humanPacket(strips));
    // The key: each set's strips in the packet's order (readers are asked not to open it).
    await writeJson(join(RUNS, `${STEM}-human-key.json`), { design: DESIGN_SHA256, sets: humanSets(strips).map(({ section, title, order, labels }) => ({ section, title, order, ...(labels ? { labels } : {}) })) });
    console.log(`wrote docs/runs/${STEM}-human-packet.md and -human-key.json`);
  } else if (has("--report")) {
    await writeFile(join(RUNS, `${STEM}-strips.md`), stripsMarkdown(readJson(FILES.strips).strips));
    await writeFile(join(RUNS, `${STEM}-report.md`), reportMarkdown({ root: ROOT, files: FILES, readJson }));
    console.log(`wrote docs/runs/${STEM}-report.md and -strips.md`);
  }
  else console.log("nothing to do: see the header of this file");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
