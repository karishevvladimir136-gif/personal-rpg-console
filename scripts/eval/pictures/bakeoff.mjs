// Picture model bake-off (docs/stages/PICTURE_MODELS.md): one hero, eight shots
// from the owner's first session, every candidate model with the same two anchors,
// its compiled prompt (three seeds) and today's generic prompt; a redraw of the
// hero's full-figure anchor per model; vision scores; the owner's blind page JSON.
//   node scripts/eval/pictures/bakeoff.mjs <command> [options]
//   portrait --models a,b              hero portrait candidates (text only)
//   figure   --model m --portrait f    hero full-figure candidates from a portrait
//   pick     --portrait f --figure f   fix the two anchors every candidate gets
//   frames   --models all|a,b --mode compiled|generic [--shots t1,t2] [--seeds 1-3]
//   redraw   --models all|a,b          each model redraws the full-figure anchor from the portrait
//   legacy   --model m [--n 3]          control: the app's current figure prompt on one model
//   score    [--judge haiku|sonnet] [--models …] [--kinds frame,figure] [--limit n]
//   rank     [--judge sonnet|haiku] [--samples 1,2] [--shots …]   comparative identity per shot
//   blind | summary | status          (no paid call)
// Every paid call goes through the guard in lib.mjs: reserved before it is sent,
// settled afterwards, stopped at the cap (PICTURES_CAP_USD, default 20). Finished
// pictures are never drawn again (the results file is the resume point).
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compileAnchorPrompt, compileFramePrompt, orderReferences, promptFamily } from "../../../src/lib/visual-frame/prompt-compiler.ts";
import { framePrompt } from "../../../src/lib/visual-frame/shot.ts";
import { falModel, falSubjectPrompt } from "../../../src/lib/visual-frame/fal-image.ts";
import { openAIImageModel } from "../../../src/lib/visual-frame/openai-image.ts";
import { BudgetError, CAP_USD, MODELS, SEED_VALUES, SIZES, anchorsDir, draw, judgeFrame, ledger, mean, median, putRow, rankIdentity, readImage, results, rowOf, runsDir, samplesDir, saveImage, usd } from "./lib.mjs";
import { GENERIC_SHOTS, PEOPLE, SHOTS, STYLE } from "./scene.mjs";

const args = process.argv.slice(2);
const command = args[0];
const arg = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const modelKeys = (value) => (!value || value === "all" ? Object.keys(MODELS).filter((key) => !MODELS[key].extra) : value.split(",")).map((key) => { if (!MODELS[key]) throw new Error(`unknown model ${key}`); return key; });
const hero = PEOPLE.hero;
const anchorsFile = join(anchorsDir, "hero.json");
const anchors = () => { if (!existsSync(anchorsFile)) throw new Error("no anchors yet: run portrait, figure and pick first"); return JSON.parse(readFileSync(anchorsFile, "utf8")); };
const maxRefs = (key) => (MODELS[key].provider === "fal" ? falModel(MODELS[key].id).maxReferences : openAIImageModel(MODELS[key].id).maxReferences);
let stopped = null;

function heroReferences() {
  const a = anchors();
  return [{ role: "face", person: hero.key, label: "portrait of the man (the hero)", file: a.portrait }, { role: "figure", person: hero.key, label: "full figure of the same man", file: a.figure }];
}
/** The brief the compiler receives, and today's generic prompt from the same shot. */
function prompts(shot, modelKey) {
  const people = shot.people.map((key) => ({ ...PEOPLE[key], state: shot.state?.[key] ?? [] }));
  const hasHero = shot.people.includes("hero");
  const references = hasHero ? orderReferences(heroReferences(), people, maxRefs(modelKey)) : [];
  const shotObject = { who: people.map((row) => row.key), ...shot.shot };
  const compiled = compileFramePrompt({ shot: shotObject, people, references, clock: shot.clock, style: STYLE }, promptFamily(MODELS[modelKey].id));
  const appearance = Object.fromEntries(people.map((row) => [row.key, row.appearance]));
  const generic = framePrompt(shotObject, STYLE, { people: hasHero ? [hero.key] : [], place: null, style: false }, appearance);
  return { compiled, generic, references };
}
const describe = (shot) => {
  const people = shot.people.map((key) => PEOPLE[key]);
  const state = Object.values(shot.state ?? {}).flat();
  return `${shot.shot.action}. Place: ${shot.shot.where}${shot.clock?.timeOfDay ? `, ${shot.clock.timeOfDay}` : ""}${shot.clock?.weather ? `; ${shot.clock.weather}` : ""}. People: ${people.map((p) => `${p.label} (${p.appearance.slice(0, 120)})`).join("; ")}.${state.length ? ` State: ${state.join("; ")}.` : ""} Art style: ${STYLE}.`;
};

async function paint(key, modelKey, request, meta) {
  if (stopped) return null;
  const done = rowOf(key);
  if (done && (done.file || done.refusal || args.includes("--no-retry"))) return done;
  let outcome;
  try {
    outcome = await draw(modelKey, { ...request, note: key });
  } catch (error) {
    if (error instanceof BudgetError) { stopped = error.message; console.log(error.message); return null; }
    throw error;
  }
  const row = { key, ...meta, model: modelKey, modelId: MODELS[modelKey].id, label: MODELS[modelKey].label, size: request.size, seed: request.seed ?? null,
    prompt: request.prompt, references: (request.refRoles ?? []), at: new Date().toISOString(), usd: usd(outcome.usdMicros), usdMicros: outcome.usdMicros };
  if (outcome.ok) {
    Object.assign(row, { file: saveImage(outcome.bytes), endpoint: outcome.endpoint, requestId: outcome.requestId, width: outcome.width, height: outcome.height, ms: outcome.ms, usage: outcome.usage ?? null });
    console.log(`${key}: ${outcome.width}x${outcome.height} ${usd(outcome.usdMicros)} ${(outcome.ms / 1000).toFixed(1)} s`);
  } else {
    Object.assign(row, { error: outcome.code, detail: outcome.detail, refusal: outcome.refusal });
    console.log(`${key}: ${outcome.refusal ? "REFUSED" : "failed"} ${outcome.code} ${outcome.detail ?? ""}`);
  }
  putRow(row);
  return row;
}

async function portrait() {
  await Promise.all(modelKeys(arg("--models")).map(async (modelKey) => {
    const n = Number(arg("--n", 1));
    for (let i = 1; i <= n; i++) {
      const prompt = compileAnchorPrompt({ person: hero, composition: "portrait", references: [], style: STYLE }, promptFamily(MODELS[modelKey].id));
      await paint(`anchor-portrait:${modelKey}:${i}`, modelKey, { prompt, size: SIZES.portrait, seed: SEED_VALUES[i - 1] }, { kind: "anchor-portrait" });
    }
  }));
}
async function figure() {
  const modelKey = arg("--model"), source = arg("--portrait"), n = Number(arg("--n", 1));
  for (let i = 1; i <= n; i++) {
    const prompt = compileAnchorPrompt({ person: hero, composition: "figure", references: [{ role: "face", person: hero.key }], style: STYLE }, promptFamily(MODELS[modelKey].id));
    await paint(`anchor-figure:${modelKey}:${createHash("sha1").update(source).digest("hex").slice(0, 6)}:${i}`, modelKey,
      { prompt, size: SIZES.figure, seed: SEED_VALUES[i - 1], references: [readImage(source)], refRoles: ["face"] }, { kind: "anchor-figure", source });
  }
}
function pick() {
  const value = { portrait: arg("--portrait"), figure: arg("--figure"), pickedAt: new Date().toISOString(), why: arg("--why", "") };
  for (const file of [value.portrait, value.figure]) if (!existsSync(join(samplesDir, file))) throw new Error(`missing ${file}`);
  writeFileSync(anchorsFile, JSON.stringify(value, null, 2) + "\n");
  console.log(value);
}

async function frames() {
  const mode = arg("--mode", "compiled");
  const shotIds = arg("--shots") ? arg("--shots").split(",") : mode === "generic" ? GENERIC_SHOTS : SHOTS.map((row) => row.id);
  const [from, to] = arg("--seeds", mode === "generic" ? "1-1" : "1-3").split("-").map(Number);
  await Promise.all(modelKeys(arg("--models")).map(async (modelKey) => {
    for (let seed = from; seed <= to; seed++) for (const id of shotIds) {
      const shot = SHOTS.find((row) => row.id === id);
      const { compiled, generic, references } = prompts(shot, modelKey);
      await paint(`frame:${modelKey}:${id}:${mode}:s${seed}`, modelKey, {
        prompt: mode === "generic" ? generic : compiled, size: SIZES.frame, seed: SEED_VALUES[seed - 1],
        references: references.map((ref) => readImage(ref.file)), refRoles: references.map((ref) => ref.role),
      }, { kind: "frame", shot: id, mode, sampleIndex: seed });
    }
  }));
}
async function redraw() {
  const a = anchors();
  await Promise.all(modelKeys(arg("--models")).map(async (modelKey) => {
    const prompt = compileAnchorPrompt({ person: hero, composition: "figure", references: [{ role: "face", person: hero.key }], style: STYLE }, promptFamily(MODELS[modelKey].id));
    await paint(`figure:${modelKey}:redraw:s1`, modelKey, { prompt, size: SIZES.figure, seed: SEED_VALUES[0], references: [readImage(a.portrait)], refRoles: ["face"] }, { kind: "figure", sampleIndex: 1 });
  }));
}

async function score() {
  const judgeKey = arg("--judge", "haiku");
  const kinds = (arg("--kinds", "frame,figure,anchor-figure,legacy-figure")).split(",");
  const models = modelKeys(arg("--models"));
  const limit = Number(arg("--limit", 100_000));
  const todo = results.rows.filter((row) => row.file && kinds.includes(row.kind) && models.includes(row.model) && !row.scores?.[judgeKey]).slice(0, limit);
  console.log(`scoring ${todo.length} pictures with ${judgeKey}`);
  const queue = [...todo];
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let row = queue.shift(); row && !stopped; row = queue.shift()) {
      const isFigure = row.kind !== "frame";
      const shot = isFigure ? null : SHOTS.find((s) => s.id === row.shot);
      const a = anchors();
      const refs = isFigure ? [{ label: "portrait of the man", ...readImage(a.portrait) }]
        : shot.people.includes("hero") ? [{ label: "portrait of the man (the hero)", ...readImage(a.portrait) }, { label: "full figure of the same man", ...readImage(a.figure) }] : [];
      let result;
      try {
        result = await judgeFrame(judgeKey, {
          frame: readImage(row.file), refs, kind: isFigure ? "figure" : "frame",
          description: isFigure ? `a full-body picture of the man from the reference: ${hero.appearance}. Whole figure visible from head to boots, standing, plain dark backdrop. Art style: ${STYLE}.` : describe(shot),
          expectedPeople: isFigure ? 1 : shot.people.length, clothingQuestion: isFigure ? null : shot.check?.clothing ?? null,
        });
      } catch (error) {
        if (error instanceof BudgetError) { stopped = error.message; console.log(error.message); return; }
        throw error;
      }
      row.scores = { ...(row.scores ?? {}), [judgeKey]: { ...result.score, error: result.error ?? null, usdMicros: result.usdMicros ?? 0 } };
      putRow(row);
      const s = result.score;
      console.log(`${row.key}: ${s ? `id ${s.identity} cloth ${s.clothing} people ${s.people} anat ${s.anatomyOk ? "ok" : "BAD " + s.anatomyIssues} adh ${s.adherence} text ${s.text}` : result.error}`);
    }
  }));
}

/** Control: the app's current full-figure anchor prompt (falSubjectPrompt, as queueAnchor builds it, the
 * hero's name included) on one model, to compare with the compiled anchor prompt and its anatomy guard. */
async function legacyFigure() {
  const modelKey = arg("--model", "flux2-pro"), n = Number(arg("--n", 3));
  const a = anchors();
  const prompt = falSubjectPrompt({ composition: "figure", name: hero.key, description: hero.appearance, style: STYLE }) + "\nReferences: a reference portrait shows this person's face: keep it.";
  for (let i = 1; i <= n; i++)
    await paint(`legacy-figure:${modelKey}:s${i}`, modelKey, { prompt, size: SIZES.figure, seed: SEED_VALUES[i - 1], references: [readImage(a.portrait)], refRoles: ["face"] }, { kind: "legacy-figure", sampleIndex: i });
}

/** Comparative identity: per shot and sample, every model's frame side by side against the portrait. */
async function rank() {
  const judgeKey = arg("--judge", "sonnet");
  const samples = arg("--samples", "1").split(",").map(Number);
  const shotIds = arg("--shots") ? arg("--shots").split(",") : SHOTS.filter((s) => s.people.includes("hero") && s.id !== "t3").map((s) => s.id);
  const a = anchors();
  const file = join(runsDir, "pictures-identity-rank.json");
  const record = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { judge: null, rows: [] };
  for (const sample of samples) for (const id of shotIds) {
    if (record.rows.some((row) => row.shot === id && row.sample === sample && row.judge === judgeKey && row.ranks)) continue;
    const rows = results.rows.filter((row) => row.kind === "frame" && row.mode === "compiled" && row.shot === id && row.sampleIndex === sample && row.file);
    const order = [...rows].sort((x, y) => createHash("sha1").update(`${id}${sample}${x.model}`).digest("hex").localeCompare(createHash("sha1").update(`${id}${sample}${y.model}`).digest("hex")));
    const frames = order.map((row, i) => ({ letter: String.fromCharCode(65 + i), model: row.model, ...readImage(row.file) }));
    let out;
    try { out = await rankIdentity(judgeKey, { portrait: readImage(a.portrait), frames, note: `${id} s${sample}` }); }
    catch (error) { if (error instanceof BudgetError) { stopped = error.message; break; } throw error; }
    const ranks = out.ranks ? Object.fromEntries(frames.map((f) => [f.model, out.ranks[f.letter]])) : null;
    record.rows.push({ shot: id, sample, judge: judgeKey, ranks, letters: Object.fromEntries(frames.map((f) => [f.letter, f.model])), notes: out.notes ?? null, error: out.error ?? null, usdMicros: out.usdMicros ?? 0 });
    writeFileSync(file, JSON.stringify(record, null, 2) + "\n");
    console.log(`${id} s${sample}: ${ranks ? Object.entries(ranks).map(([m, n]) => `${m} ${n}`).join(", ") : out.error}`);
  }
}

// ---- no paid calls below ---------------------------------------------------------------
function blind() {
  const commit = execSync("git rev-parse --short HEAD", { cwd: samplesDir }).toString().trim();
  const run = `pictures-${new Date().toISOString().slice(0, 10)}`;
  for (const name of readdirSync(samplesDir)) if (/^(t\d|figure)-[0-9a-f]{6}\.json$/.test(name)) rmSync(join(samplesDir, name));
  const seal = (value) => Buffer.from(JSON.stringify(value)).toString("base64");
  // A fixed shuffle per shot: letters do not follow the model across shots.
  const shuffle = (list, salt) => [...list].sort((a, b) => createHash("sha1").update(salt + a).digest("hex").localeCompare(createHash("sha1").update(salt + b).digest("hex")));
  const a = anchors();
  const write = (id, payload) => {
    const file = `${id}-${createHash("sha1").update(id + commit).digest("hex").slice(0, 6)}.json`;
    writeFileSync(join(samplesDir, file), JSON.stringify(payload, null, 2) + "\n");
    return file;
  };
  const index = [];
  for (const shot of SHOTS) {
    const models = shuffle(Object.keys(MODELS), shot.id).filter((m) => results.rows.some((row) => row.kind === "frame" && row.model === m && row.shot === shot.id && row.mode === "compiled"));
    const variants = models.map((modelKey, i) => {
      const rows = results.rows.filter((row) => row.kind === "frame" && row.model === modelKey && row.shot === shot.id && row.mode === "compiled").sort((x, y) => x.sampleIndex - y.sampleIndex);
      const files = rows.filter((row) => row.file).map((row) => row.file);
      return { letter: String.fromCharCode(65 + i), file: files[0] ?? null, files, refused: rows.filter((row) => row.refusal).length,
        sealed: seal({ model: modelKey, modelId: MODELS[modelKey].id, label: MODELS[modelKey].label, provider: MODELS[modelKey].provider, prompt: "compiled" }) };
    });
    index.push(write(shot.id, { schemaVersion: 1, kind: "picture-blind", shot: shot.id, title: shot.title, description: describe(shot),
      state: Object.values(shot.state ?? {}).flat(), createdAt: new Date().toISOString(), commit, run,
      references: shot.people.includes("hero") ? [{ role: "face", file: a.portrait }, { role: "figure", file: a.figure }] : [], variants }));
  }
  const models = shuffle(Object.keys(MODELS), "figure").filter((m) => rowOf(`figure:${m}:redraw:s1`)?.file);
  index.push(write("figure", { schemaVersion: 1, kind: "picture-blind", shot: "figure", title: { ru: "Опорная фигура героя в полный рост (перерисовка по портрету)", en: "The hero's full-figure anchor, redrawn from the portrait" },
    description: `Full figure of the hero from the portrait: ${hero.appearance}.`, state: [], createdAt: new Date().toISOString(), commit, run,
    references: [{ role: "face", file: a.portrait }],
    variants: models.map((modelKey, i) => ({ letter: String.fromCharCode(65 + i), file: rowOf(`figure:${modelKey}:redraw:s1`).file, files: [rowOf(`figure:${modelKey}:redraw:s1`).file],
      sealed: seal({ model: modelKey, modelId: MODELS[modelKey].id, label: MODELS[modelKey].label, provider: MODELS[modelKey].provider, prompt: "compiled" }) })) }));
  writeFileSync(join(samplesDir, "index.json"), JSON.stringify({ schemaVersion: 1, run, commit, files: index }, null, 2) + "\n");
  console.log(`blind: ${index.length} files`);
}

function aggregate() {
  const table = [];
  const rankFile = join(runsDir, "pictures-identity-rank.json");
  const ranking = existsSync(rankFile) ? JSON.parse(readFileSync(rankFile, "utf8")).rows.filter((row) => row.ranks) : [];
  for (const modelKey of Object.keys(MODELS)) {
    const rows = results.rows.filter((row) => row.model === modelKey);
    if (!rows.length) continue;
    const frames = (mode) => rows.filter((row) => row.kind === "frame" && row.mode === mode);
    const compiled = frames("compiled"), generic = frames("generic");
    const scored = (list, judge = "haiku") => list.map((row) => row.scores?.[judge]).filter((s) => s && !s.error);
    const sc = scored(compiled), sg = scored(generic);
    // The same shots for both prompts: the generic shots, sample 1.
    const pairedCompiled = scored(compiled.filter((row) => GENERIC_SHOTS.includes(row.shot) && row.sampleIndex === 1));
    // Clothing and state: only the two shots that carry a state from the records (t6, t8).
    const stateShots = SHOTS.filter((shot) => shot.check?.clothing).map((shot) => shot.id);
    const stateScores = (list) => list.filter((row) => stateShots.includes(row.shot)).map((row) => row.scores?.haiku).filter((s) => s && !s.error && s.clothing !== null);
    const clothing = stateScores(compiled);
    const clothingGeneric = stateScores(generic);
    const people = (list) => list.filter((row) => row.scores?.haiku && !row.scores.haiku.error).map((row) => row.scores.haiku.people === SHOTS.find((s) => s.id === row.shot).people.length);
    const figure = rowOf(`figure:${modelKey}:redraw:s1`)?.scores?.haiku;
    const drawn = rows.filter((row) => row.file && row.kind === "frame");
    const ms = drawn.filter((row) => row.mode === "compiled").map((row) => row.ms);
    table.push({
      model: modelKey, label: MODELS[modelKey].label, provider: MODELS[modelKey].provider,
      frames: drawn.length, refused: rows.filter((row) => row.refusal).length, failed: rows.filter((row) => row.error && !row.refusal).length,
      medianMs: median(ms), maxMs: ms.length ? Math.max(...ms) : null, under6s: ms.length ? `${ms.filter((v) => v <= 6_000).length}/${ms.length}` : null,
      perImageUsd: usd(Math.round(drawn.reduce((sum, row) => sum + row.usdMicros, 0) / Math.max(1, drawn.length))),
      identityRank: mean(ranking.map((row) => row.ranks[modelKey])), identityRankN: ranking.filter((row) => typeof row.ranks[modelKey] === "number").length,
      identity: mean(sc.map((s) => s.identity)), identityGeneric: mean(sg.map((s) => s.identity)), identityCompiledSameShots: mean(pairedCompiled.map((s) => s.identity)),
      clothingKept: clothing.length ? `${clothing.filter((s) => s.clothing).length}/${clothing.length}` : null,
      clothingKeptGeneric: clothingGeneric.length ? `${clothingGeneric.filter((s) => s.clothing).length}/${clothingGeneric.length}` : null,
      anatomyOk: sc.length ? `${sc.filter((s) => s.anatomyOk).length}/${sc.length}` : null,
      anatomyOkGeneric: sg.length ? `${sg.filter((s) => s.anatomyOk).length}/${sg.length}` : null,
      peopleRight: (() => { const p = people(compiled); return p.length ? `${p.filter(Boolean).length}/${p.length}` : null; })(),
      adherence: mean(sc.map((s) => s.adherence)), adherenceGeneric: mean(sg.map((s) => s.adherence)),
      textFree: sc.length ? `${sc.filter((s) => !s.text).length}/${sc.length}` : null,
      figureAnatomyOk: figure ? figure.anatomyOk : null, figureIdentity: figure?.identity ?? null, figureIssues: figure?.anatomyIssues ?? null,
      spentUsd: usd(rows.reduce((sum, row) => sum + (row.usdMicros ?? 0), 0)),
    });
  }
  return table;
}
/** Generic vs compiled over every model at once, on the same shots and the first sample. */
function pooled() {
  const pick = (mode) => results.rows.filter((row) => row.kind === "frame" && row.mode === mode && GENERIC_SHOTS.includes(row.shot) && row.sampleIndex === 1 && !MODELS[row.model].extra)
    .map((row) => ({ shot: row.shot, s: row.scores?.haiku })).filter((row) => row.s && !row.s.error);
  const stat = (list) => ({
    pictures: list.length, identity: mean(list.map((r) => r.s.identity)), adherence: mean(list.map((r) => r.s.adherence)),
    stateKept: (() => { const st = list.filter((r) => r.shot === "t6" && r.s.clothing !== null); return `${st.filter((r) => r.s.clothing).length}/${st.length}`; })(),
    anatomyOk: `${list.filter((r) => r.s.anatomyOk).length}/${list.length}`, textFree: `${list.filter((r) => !r.s.text).length}/${list.length}`,
    peopleRight: `${list.filter((r) => r.s.people === SHOTS.find((x) => x.id === r.shot).people.length).length}/${list.length}`,
  });
  return { shots: GENERIC_SHOTS, sample: 1, generic: stat(pick("generic")), compiled: stat(pick("compiled")) };
}
function summary() {
  const table = aggregate();
  const both = pooled();
  writeFileSync(join(runsDir, "pictures-summary.json"), JSON.stringify({ generatedAt: new Date().toISOString(), ledgerUsd: usd(ledger.totalUsdMicros), capUsd: CAP_USD, table, genericVsCompiled: both }, null, 2) + "\n");
  console.log(JSON.stringify(both));
  const lines = [
    "| Model | Frames | Refused | Median s (≤6 s) | $/image | Identity, side by side (Sonnet) | Identity (compiled) | Identity generic → compiled (same shots) | Clothing kept | Anatomy ok | People count right | Adherence | No text | Figure redraw anatomy |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...table.map((r) => `| ${r.label} | ${r.frames} | ${r.refused} | ${r.medianMs !== null ? (r.medianMs / 1000).toFixed(1) : ""} (${r.under6s}) | ${r.perImageUsd} | ${r.identityRank ?? ""} (${r.identityRankN}) | ${r.identity ?? ""} | ${r.identityGeneric ?? ""} → ${r.identityCompiledSameShots ?? ""} | ${r.clothingKept ?? ""} (generic ${r.clothingKeptGeneric ?? "—"}) | ${r.anatomyOk ?? ""} | ${r.peopleRight ?? ""} | ${r.adherence ?? ""} (generic ${r.adherenceGeneric ?? "—"}) | ${r.textFree ?? ""} | ${r.figureAnatomyOk === null ? "" : r.figureAnatomyOk ? "ok" : `bad: ${r.figureIssues}`} |`),
  ];
  console.log(lines.join("\n"));
  console.log(`ledger: ${usd(ledger.totalUsdMicros)} of $${CAP_USD}`);
}
function status() {
  const by = {};
  for (const entry of ledger.entries) by[entry.kind] = (by[entry.kind] ?? 0) + entry.usdMicros;
  console.log(JSON.stringify({ spent: usd(ledger.totalUsdMicros), cap: CAP_USD, calls: ledger.entries.length, byKind: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, usd(v)])),
    pictures: results.rows.filter((row) => row.file).length, refused: results.rows.filter((row) => row.refusal).length, failed: results.rows.filter((row) => row.error && !row.refusal).length }, null, 2));
}

const commands = { portrait, figure, pick, frames, redraw, legacy: legacyFigure, score, rank, blind, summary, status };
if (!commands[command]) { console.log("usage: see the header of scripts/eval/pictures/bakeoff.mjs"); process.exit(1); }
await commands[command]();
if (stopped) console.log(`stopped: ${stopped}`);
if (!["blind", "summary", "status"].includes(command)) console.log(`ledger: ${usd(ledger.totalUsdMicros)} of $${CAP_USD}`);
