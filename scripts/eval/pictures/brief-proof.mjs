// The shot director's proof (polish 2 §3, docs/stages/POLISH_2.md): the eight
// bake-off shots, today's one-clause shot against the visual brief written by
// Claude Sonnet 5.5 from a whole turn of narration, on GPT Image 2.5 Sunburst
// and Flare, two samples each; the vision judges of the bake-off; the owner's
// blind page in docs/samples/pictures-brief/ (the bake-off's JSON shape).
//   PICTURES_RUN=pictures-brief node scripts/eval/pictures/brief-proof.mjs <command>
//   briefs                      the brief per shot (Sonnet; stored, never rewritten)
//   frames [--models a,b] [--modes shot,brief] [--samples 2] [--shots t1,t2]
//   score | rank | blind | summary | status
// Every paid call goes through the guard in lib.mjs (PICTURES_CAP_USD; the ledger
// docs/runs/pictures-brief-ledger.json); finished pictures are never drawn again.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { anthropicKey, scriptAnthropicEndpoint } from "../lib/anthropic-endpoint.mjs";
import { briefReferences, briefRequest, compileBriefPrompt, parseBrief, BRIEF_MODEL, BRIEF_PRICE_PER_MILLION } from "../../../src/lib/visual-frame/brief.ts";
import { compileFramePrompt, orderReferences, promptFamily } from "../../../src/lib/visual-frame/prompt-compiler.ts";
import { sniffImage } from "../../../src/lib/visual-frame/fal-image.ts";
import { BudgetError, CAP_USD, MODELS, SIZES, draw, judgeFrame, ledger, mean, median, putRow, rankIdentity, reserve, results, root, rowOf, runsDir, RUN, samplesDir, saveImage, settle, usd } from "./lib.mjs";
import { PEOPLE, SHOTS, STYLE } from "./scene.mjs";
import { NARRATIONS } from "./narration.mjs";

if (RUN === "pictures") { console.error("set PICTURES_RUN=pictures-brief: this proof keeps its own ledger and samples"); process.exit(2); }
const args = process.argv.slice(2);
const command = args[0];
const arg = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const list = (name, fallback) => arg(name, fallback).split(",");
const hero = PEOPLE.hero;
const bakeoffSamples = join(root, "docs", "samples", "pictures");
const anchors = JSON.parse(readFileSync(join(bakeoffSamples, "anchors", "hero.json"), "utf8"));
const readBakeoffImage = (file) => { const bytes = new Uint8Array(readFileSync(join(bakeoffSamples, file))); return { bytes, contentType: sniffImage(bytes) }; };
const briefsFile = join(runsDir, `${RUN}-briefs.json`);
const briefs = existsSync(briefsFile) ? JSON.parse(readFileSync(briefsFile, "utf8")) : { model: BRIEF_MODEL, rows: {} };
const saveBriefs = () => writeFileSync(briefsFile, JSON.stringify(briefs, null, 2) + "\n");
const MODERATION = "low"; // as the app (picture-job.ts)
let stopped = null;

const heroReferences = () => [
  { role: "face", person: hero.key, entityId: hero.key, label: "portrait of the man (the hero)", file: anchors.portrait },
  { role: "figure", person: hero.key, entityId: hero.key, label: "full figure of the same man", file: anchors.figure },
];
const maxRefs = 6;
const peopleOf = (shot) => shot.people.map((key) => ({ ...PEOPLE[key], state: shot.state?.[key] ?? [] }));

/** Today's prompt: the one-clause shot through the compiler (the bake-off's «compiled» mode). */
function shotPrompt(shot, modelKey) {
  const people = peopleOf(shot);
  const references = shot.people.includes("hero") ? orderReferences(heroReferences(), people, maxRefs) : [];
  const prompt = compileFramePrompt({ shot: { who: people.map((row) => row.key), ...shot.shot }, people, references, clock: shot.clock, style: STYLE }, promptFamily(MODELS[modelKey].id));
  return { prompt, references };
}
/** The brief's prompt: the stored brief, its people matched to the fixture by name, the hero's references. */
function briefPrompt(shot, modelKey) {
  const brief = briefs.rows[shot.id]?.brief;
  if (!brief) throw new Error(`no brief for ${shot.id}: run briefs first`);
  const known = Object.values(PEOPLE);
  const matched = brief.who.map((name) => known.find((row) => row.key === name) ?? null).filter(Boolean);
  const ordered = [...matched].sort((a, b) => (a === hero ? -1 : 0) - (b === hero ? -1 : 0));
  const people = ordered.map((row, index) => ({ key: row.key, label: row === hero ? "the hero" : `person ${index + 1}`, pronoun: row.pronoun, appearance: row.appearance }));
  const references = people.some((row) => row.key === hero.key) ? briefReferences(heroReferences(), people, maxRefs) : [];
  const prompt = compileBriefPrompt({ brief, people, references, style: STYLE, modelId: MODELS[modelKey].id });
  return { prompt, references, people };
}

async function sonnet(system, content, note, maxTokens) {
  const apiKey = anthropicKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const entry = reserve("brief", BRIEF_MODEL, Math.round(6_000 * BRIEF_PRICE_PER_MILLION.input + maxTokens * BRIEF_PRICE_PER_MILLION.output), note);
  const started = Date.now();
  const door = scriptAnthropicEndpoint();
  const response = await fetch(door.messagesUrl, {
    method: "POST", headers: door.headers(apiKey),
    body: JSON.stringify({ model: door.modelId(BRIEF_MODEL), max_tokens: maxTokens, output_config: { effort: "low" }, system, messages: [{ role: "user", content }] }),
    signal: AbortSignal.timeout(120_000),
  });
  const value = await response.json().catch(() => null);
  const usage = { input: value?.usage?.input_tokens ?? 0, output: value?.usage?.output_tokens ?? 0 };
  const cost = Math.round(usage.input * BRIEF_PRICE_PER_MILLION.input + usage.output * BRIEF_PRICE_PER_MILLION.output);
  settle(entry, cost, { usage });
  if (!response.ok) throw new Error(`HTTP ${response.status}${value?.error?.type ? `: ${value.error.type}` : ""}`);
  const text = (value?.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n");
  return { text, usage, cost, ms: Date.now() - started };
}

/** The brief per shot, exactly as the app asks for it: the whole narration, the profiles (the fixture's
 * appearances), the records' state, the clock, the previous shot's brief for continuity. */
async function briefsCommand() {
  let previous = null;
  for (const shot of SHOTS) {
    if (briefs.rows[shot.id]?.brief) { previous = briefs.rows[shot.id].brief.brief; console.log(`${shot.id}: brief kept (${briefs.rows[shot.id].words} words)`); continue; }
    const people = peopleOf(shot);
    const request = briefRequest({
      narration: NARRATIONS[shot.id], heroName: hero.key, names: Object.values(PEOPLE).map((row) => row.key).filter((key) => key !== hero.key), placeName: null,
      profiles: Object.values(PEOPLE).map((row) => ({ name: row.key, kind: "person", look: row.appearance, changes: [] })),
      state: people.filter((row) => row.state.length).map((row) => ({ name: row.key, lines: row.state })),
      clock: { timeOfDay: shot.clock?.timeOfDay ?? null }, previous, style: STYLE, comment: null, language: "ru",
    });
    let outcome;
    try { outcome = await sonnet(request.system, request.user, `brief ${shot.id}`, 3000); }
    catch (error) { if (error instanceof BudgetError) { console.log(error.message); return; } throw error; }
    const brief = parseBrief(outcome.text);
    briefs.rows[shot.id] = { shot: shot.id, brief, words: brief ? brief.brief.split(/\s+/).length : 0, ms: outcome.ms, usage: outcome.usage, usdMicros: outcome.cost, at: new Date().toISOString(), raw: brief ? null : outcome.text.slice(0, 600) };
    saveBriefs();
    previous = brief?.brief ?? previous;
    console.log(`${shot.id}: ${brief ? `${briefs.rows[shot.id].words} words, who ${JSON.stringify(brief.who)}, updates ${brief.profileUpdates.length}` : "UNPARSABLE"} · ${(outcome.ms / 1000).toFixed(1)} s · ${usd(outcome.cost)}`);
  }
}

async function paint(key, modelKey, request, meta) {
  if (stopped) return null;
  const done = rowOf(key);
  if (done && (done.file || done.refusal)) return done;
  let outcome;
  try { outcome = await draw(modelKey, { ...request, note: key, moderation: MODERATION }); }
  catch (error) { if (error instanceof BudgetError) { stopped = error.message; console.log(error.message); return null; } throw error; }
  const row = { key, ...meta, model: modelKey, modelId: MODELS[modelKey].id, label: MODELS[modelKey].label, size: request.size, prompt: request.prompt, references: request.refRoles ?? [], at: new Date().toISOString(), usd: usd(outcome.usdMicros), usdMicros: outcome.usdMicros };
  if (outcome.ok) {
    Object.assign(row, { file: saveImage(outcome.bytes), endpoint: outcome.endpoint, width: outcome.width, height: outcome.height, ms: outcome.ms, usage: outcome.usage ?? null });
    console.log(`${key}: ${outcome.width}x${outcome.height} ${usd(outcome.usdMicros)} ${(outcome.ms / 1000).toFixed(1)} s`);
  } else {
    Object.assign(row, { error: outcome.code, detail: outcome.detail, refusal: outcome.refusal });
    console.log(`${key}: ${outcome.refusal ? "REFUSED" : "failed"} ${outcome.code} ${outcome.detail ?? ""}`);
  }
  putRow(row);
  return row;
}

async function frames() {
  const modelKeys = list("--models", "gpt25s,gpt25f");
  const modes = list("--modes", "shot,brief");
  const shots = arg("--shots") ? SHOTS.filter((row) => list("--shots").includes(row.id)) : SHOTS;
  const samples = Number(arg("--samples", 2));
  await Promise.all(modelKeys.map(async (modelKey) => {
    for (let sample = 1; sample <= samples; sample++) for (const shot of shots) for (const mode of modes) {
      const { prompt, references } = mode === "brief" ? briefPrompt(shot, modelKey) : shotPrompt(shot, modelKey);
      await paint(`frame:${modelKey}:${shot.id}:${mode}:s${sample}`, modelKey, {
        prompt, size: SIZES.frame, references: references.map((ref) => readBakeoffImage(ref.file)), refRoles: references.map((ref) => ref.role),
      }, { kind: "frame", shot: shot.id, mode, sampleIndex: sample });
    }
  }));
}

const describe = (shot) => {
  const people = shot.people.map((key) => PEOPLE[key]);
  const state = Object.values(shot.state ?? {}).flat();
  return `${shot.shot.action}. Place: ${shot.shot.where}${shot.clock?.timeOfDay ? `, ${shot.clock.timeOfDay}` : ""}${shot.clock?.weather ? `; ${shot.clock.weather}` : ""}. People: ${people.map((p) => `${p.label} (${p.appearance.slice(0, 120)})`).join("; ")}.${state.length ? ` State: ${state.join("; ")}.` : ""} Art style: ${STYLE}.`;
};
const readImage = (file) => { const bytes = new Uint8Array(readFileSync(join(samplesDir, file))); return { bytes, contentType: sniffImage(bytes) }; };

/** The per-picture judge (Claude Haiku 5.5): the bake-off's questions against the shot's description —
 * the same yardstick for both prompts, so the brief is judged on what the scene asked for. */
async function score() {
  const rows = results.rows.filter((row) => row.kind === "frame" && row.file && !row.scores?.haiku);
  for (const row of rows) {
    const shot = SHOTS.find((s) => s.id === row.shot);
    const refs = shot.people.includes("hero") ? heroReferences().map((ref) => ({ ...readBakeoffImage(ref.file), label: ref.label })) : [];
    let judged;
    try { judged = await judgeFrame("haiku", { frame: readImage(row.file), refs, description: describe(shot), expectedPeople: shot.people.length, clothingQuestion: shot.check?.clothing ?? null }); }
    catch (error) { if (error instanceof BudgetError) { console.log(error.message); return; } throw error; }
    row.scores = { ...(row.scores ?? {}), haiku: judged.score ?? { error: judged.error } };
    putRow(row);
    console.log(`${row.key}: ${judged.score ? `adherence ${judged.score.adherence} identity ${judged.score.identity} people ${judged.score.people} clothing ${judged.score.clothing} text ${judged.score.text}` : `error ${judged.error}`}`);
  }
}
/** Identity side by side (Claude Sonnet 5.5): per shot with the hero, every frame of both prompts and both models under a letter. */
async function rank() {
  const rankFile = join(runsDir, `${RUN}-identity-rank.json`);
  const ranking = existsSync(rankFile) ? JSON.parse(readFileSync(rankFile, "utf8")) : { rows: [] };
  for (const shot of SHOTS.filter((s) => s.people.includes("hero") && s.id !== "t3")) {
    if (ranking.rows.some((row) => row.shot === shot.id && row.ranks)) continue;
    const frames = results.rows.filter((row) => row.kind === "frame" && row.shot === shot.id && row.file);
    const shuffled = [...frames].sort((a, b) => createHash("sha1").update(shot.id + a.key).digest("hex").localeCompare(createHash("sha1").update(shot.id + b.key).digest("hex")));
    const lettered = shuffled.map((row, i) => ({ letter: String.fromCharCode(65 + i), key: row.key, ...readImage(row.file) }));
    let ranked;
    try { ranked = await rankIdentity("sonnet", { portrait: readBakeoffImage(anchors.portrait), frames: lettered, note: shot.id }); }
    catch (error) { if (error instanceof BudgetError) { console.log(error.message); return; } throw error; }
    ranking.rows.push({ shot: shot.id, ranks: ranked.ranks, keys: Object.fromEntries(lettered.map((f) => [f.letter, f.key])), notes: ranked.notes, error: ranked.error ?? null, usdMicros: ranked.usdMicros });
    writeFileSync(rankFile, JSON.stringify(ranking, null, 2) + "\n");
    console.log(`${shot.id}: ${ranked.ranks ? JSON.stringify(ranked.ranks) : `error ${ranked.error}`}`);
  }
}

function identityOf(key) {
  const rankFile = join(runsDir, `${RUN}-identity-rank.json`);
  if (!existsSync(rankFile)) return null;
  for (const row of JSON.parse(readFileSync(rankFile, "utf8")).rows) {
    if (!row.ranks) continue;
    for (const [letter, k] of Object.entries(row.keys)) if (k === key) return row.ranks[letter];
  }
  return null;
}
function summary() {
  const table = [];
  for (const modelKey of ["gpt25s", "gpt25f"]) for (const mode of ["shot", "brief"]) {
    const rows = results.rows.filter((row) => row.kind === "frame" && row.model === modelKey && row.mode === mode);
    if (!rows.length) continue;
    const drawn = rows.filter((row) => row.file);
    const scored = drawn.map((row) => row.scores?.haiku).filter((s) => s && !s.error);
    const stateShots = SHOTS.filter((s) => s.check?.clothing).map((s) => s.id);
    const clothing = drawn.filter((row) => stateShots.includes(row.shot)).map((row) => row.scores?.haiku).filter((s) => s && !s.error && s.clothing !== null);
    const people = drawn.filter((row) => row.scores?.haiku && !row.scores.haiku.error).map((row) => row.scores.haiku.people === SHOTS.find((s) => s.id === row.shot).people.length);
    const identity = drawn.map((row) => identityOf(row.key)).filter((v) => typeof v === "number");
    table.push({
      model: MODELS[modelKey].label, prompt: mode, frames: drawn.length, refused: rows.filter((row) => row.refusal).length, failed: rows.filter((row) => row.error && !row.refusal).length,
      medianS: median(drawn.map((row) => row.ms)) !== null ? Number((median(drawn.map((row) => row.ms)) / 1000).toFixed(1)) : null,
      usdPerImage: drawn.length ? usd(Math.round(drawn.reduce((sum, row) => sum + row.usdMicros, 0) / drawn.length)) : null,
      adherence: mean(scored.map((s) => s.adherence)), identitySideBySide: mean(identity), identityPerPicture: mean(scored.map((s) => s.identity)),
      clothingKept: clothing.length ? `${clothing.filter((s) => s.clothing).length}/${clothing.length}` : null,
      peopleCountRight: people.length ? `${people.filter(Boolean).length}/${people.length}` : null,
      noText: scored.length ? `${scored.filter((s) => !s.text).length}/${scored.length}` : null, anatomyOk: scored.length ? `${scored.filter((s) => s.anatomyOk).length}/${scored.length}` : null,
    });
  }
  const briefRows = Object.values(briefs.rows).filter((row) => row.brief);
  const out = { run: RUN, at: new Date().toISOString(), table,
    briefs: { count: briefRows.length, words: { min: Math.min(...briefRows.map((r) => r.words)), median: median(briefRows.map((r) => r.words)), max: Math.max(...briefRows.map((r) => r.words)) },
      medianS: median(briefRows.map((r) => r.ms)) !== null ? Number((median(briefRows.map((r) => r.ms)) / 1000).toFixed(1)) : null, usdPerBrief: briefRows.length ? usd(Math.round(briefRows.reduce((s, r) => s + r.usdMicros, 0) / briefRows.length)) : null,
      firstSentenceBeats: briefRows.filter((r) => NARRATIONS[r.shot].split(/(?<=[.!?…])\s+/)[0].toLowerCase().includes(r.brief.beat.toLowerCase().slice(0, 20))).length },
    spentUsd: usd(ledger.totalUsdMicros), capUsd: CAP_USD };
  writeFileSync(join(runsDir, `${RUN}-summary.json`), JSON.stringify(out, null, 2) + "\n");
  console.table(table);
  console.log(JSON.stringify(out.briefs), `spent ${out.spentUsd} of $${CAP_USD}`);
}

/** The owner's blind page: per shot four variants (two models × two prompts) under shuffled letters, both samples each; the same JSON shape as the bake-off. */
function blind() {
  const commit = execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();
  const run = `${RUN}-${new Date().toISOString().slice(0, 10)}`;
  for (const name of readdirSync(samplesDir)) if (/^t\d-[0-9a-f]{6}\.json$/.test(name)) rmSync(join(samplesDir, name));
  const seal = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  const shuffle = (items, salt) => [...items].sort((a, b) => createHash("sha1").update(salt + a).digest("hex").localeCompare(createHash("sha1").update(salt + b).digest("hex")));
  const index = [];
  for (const shot of SHOTS) {
    const variants = shuffle(["gpt25s:shot", "gpt25s:brief", "gpt25f:shot", "gpt25f:brief"], shot.id).map((v, i) => {
      const [modelKey, mode] = v.split(":");
      const rows = results.rows.filter((row) => row.kind === "frame" && row.model === modelKey && row.mode === mode && row.shot === shot.id).sort((x, y) => x.sampleIndex - y.sampleIndex);
      const files = rows.filter((row) => row.file).map((row) => row.file);
      return { letter: String.fromCharCode(65 + i), file: files[0] ?? null, files, refused: rows.filter((row) => row.refusal).length,
        sealed: seal({ model: modelKey, modelId: MODELS[modelKey].id, label: MODELS[modelKey].label, provider: "openai", prompt: mode }) };
    }).filter((v) => v.files.length);
    if (!variants.length) continue;
    const file = `${shot.id}-${createHash("sha1").update(shot.id + commit).digest("hex").slice(0, 6)}.json`;
    writeFileSync(join(samplesDir, file), JSON.stringify({ schemaVersion: 1, kind: "picture-blind", shot: shot.id, title: shot.title, description: describe(shot),
      narration: NARRATIONS[shot.id], state: Object.values(shot.state ?? {}).flat(), createdAt: new Date().toISOString(), commit, run,
      references: shot.people.includes("hero") ? [{ role: "face", file: `../pictures/${anchors.portrait}` }, { role: "figure", file: `../pictures/${anchors.figure}` }] : [], variants }, null, 2) + "\n");
    index.push(file);
  }
  writeFileSync(join(samplesDir, "index.json"), JSON.stringify({ schemaVersion: 1, run, commit, question: { ru: "Какая картинка лучше показывает этот ход? Выбери лучшую и отметь те, что нравятся.", en: "Which picture shows this turn best? Pick the best and mark the ones you like." }, files: index }, null, 2) + "\n");
  console.log(`blind: ${index.length} files`);
}
function status() {
  console.log(`briefs: ${Object.values(briefs.rows).filter((r) => r.brief).length}/8; frames: ${results.rows.filter((r) => r.file).length} drawn, ${results.rows.filter((r) => r.refusal).length} refused; spent ${usd(ledger.totalUsdMicros)} of $${CAP_USD}`);
}

const commands = { briefs: briefsCommand, frames, score, rank, blind, summary, status };
if (!commands[command]) { console.error(`usage: brief-proof.mjs <${Object.keys(commands).join("|")}>`); process.exit(2); }
await commands[command]();
if (!["blind", "summary", "status"].includes(command)) console.log(`ledger: ${usd(ledger.totalUsdMicros)} of $${CAP_USD}`);
