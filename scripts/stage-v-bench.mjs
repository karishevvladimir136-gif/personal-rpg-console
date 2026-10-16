// Stage V paid bench: anchors and live frames of the synthetic sample worlds in
// chosen styles, timings, prices, consistency scores with and without reference
// pictures. Research-grade records go to docs/runs/stage-v/, images to
// public/preview/stage-v/ (the preview screens show them).
//   node --conditions=react-server scripts/stage-v-bench.mjs <command> [options]
//   anchors    --world shov|noir --style oil|line-art|noir|pixel|watercolor --model klein9b|klein4b|flash|pro [--only a,b] [--force]
//   frames     --world shov|noir --style <preset> --model <m> --refs on|off [--turns 1-20] [--tag name] [--anchors <m>]
//   score      --run <docs/runs/stage-v/…frames….json> | --match <part of a record name> (the newest)
//   rerun-cost --world shov|noir                     (no paid call)
//   summary                                           (no paid call; writes SUMMARY.md)
// Keys come from .env.local (never printed). Every paid call is counted in
// docs/runs/stage-v/ledger.json before it is sent; the run stops at --cap (default 25 USD).
// Synthetic campaigns only; the owner's database is never touched.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COMPOSITION_SIZE, FAL_SIZES, falImagePriceUsdMicros, falSubjectPrompt, generateFalImage, isContentRefusal, sniffImage, softenPrompt, usd } from "../src/lib/visual-frame/fal-image.ts";
import { anchorSet, pictureCostUsdMicros, STYLE_PRESETS } from "../src/lib/visual-frame/pictures.ts";
import { fallbackShot, firstParagraph, framePrompt, shotEntityIds } from "../src/lib/visual-frame/shot.ts";
import { buildShot, scoreConsistency } from "../src/lib/server/media/shot-model.ts";
import { shovSample } from "../src/lib/ui/preview/stage5-fixture.ts";
import { noirSample } from "../src/lib/ui/preview/stage5-noir.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const runsDir = join(root, "docs", "runs", "stage-v");
const imagesDir = join(root, "public", "preview", "stage-v");
mkdirSync(runsDir, { recursive: true });
mkdirSync(imagesDir, { recursive: true });
const args = process.argv.slice(2);
const command = args[0];
const arg = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const flag = (name) => args.includes(name);
const dry = flag("--dry");
const capUsd = Number(arg("--cap", 25));
const MODELS = { klein9b: "fal-ai/flux-2/klein/9b", klein4b: "fal-ai/flux-2/klein/4b", flash: "fal-ai/flux-2/flash", pro: "fal-ai/flux-2-pro" };
const samples = { shov: shovSample, noir: noirSample };

function env(name) {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((row) => row.startsWith(name + "="));
  return line ? line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}
const falKey = env("FAL_KEY"), anthropicKey = env("ANTHROPIC_API_KEY");

// The ledger: every paid call of this stage, counted before it is sent.
const ledgerFile = join(runsDir, "ledger.json");
const ledger = existsSync(ledgerFile) ? JSON.parse(readFileSync(ledgerFile, "utf8")) : { capUsd: usd(capUsd * 1_000_000), totalUsdMicros: 0, entries: [] };
function reserve(kind, expectedMicros, note) {
  if (ledger.totalUsdMicros + expectedMicros > capUsd * 1_000_000) throw new Error(`budget: ${note} would exceed the ${usd(capUsd * 1_000_000)} cap (spent ${usd(ledger.totalUsdMicros)})`);
  const entry = { at: new Date().toISOString(), kind, note, usdMicros: expectedMicros, settled: false };
  ledger.entries.push(entry);
  ledger.totalUsdMicros += expectedMicros;
  writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + "\n");
  return entry;
}
function settle(entry, actualMicros) {
  ledger.totalUsdMicros += actualMicros - entry.usdMicros;
  entry.usdMicros = actualMicros;
  entry.settled = true;
  writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + "\n");
}
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const saveRun = (name, record) => { const file = join(runsDir, `${stamp()}-${name}.json`); writeFileSync(file, JSON.stringify(record, null, 2) + "\n"); console.log(`record: ${file.replace(root + "/", "")}`); return file; };
const styleOf = (key) => STYLE_PRESETS.find((row) => row.key === key) ?? (() => { throw new Error(`unknown style ${key}`); })();
const slug = (text) => text.toLowerCase().replace(/[«»"]/g, "").replace(/[^a-zа-яё0-9]+/giu, "-").replace(/^-|-$/g, "").slice(0, 32);
const indexFile = (world, style, model) => join(imagesDir, `${world}-${style}-${model}-anchors.json`);

async function falCall(input, note) {
  const [w, h] = FAL_SIZES[input.size];
  const expected = falImagePriceUsdMicros(input.model, w, h);
  const entry = reserve("fal", expected, note);
  if (dry) { settle(entry, 0); return { dry: true, expected }; }
  try {
    const result = await generateFalImage(falKey, input);
    settle(entry, result.priceUsdMicros);
    return { result };
  } catch (error) {
    if (isContentRefusal(error)) {
      const retry = reserve("fal", expected, note + " (softened)");
      try {
        const result = await generateFalImage(falKey, { ...input, prompt: softenPrompt(input.prompt) });
        settle(retry, result.priceUsdMicros);
        return { result, softened: true, firstError: error.detail };
      } catch (second) {
        settle(retry, expected);
        return { error: second, softened: true, firstError: error.detail };
      }
    }
    settle(entry, expected);
    return { error };
  }
}

async function runAnchors() {
  const world = arg("--world", "shov"), style = arg("--style", "oil"), modelKey = arg("--model", "klein9b");
  const model = MODELS[modelKey];
  const sample = samples[world];
  const snapshot = sample.snapshot();
  const only = arg("--only")?.split(",");
  const preset = styleOf(style);
  const index = existsSync(indexFile(world, style, modelKey)) ? JSON.parse(readFileSync(indexFile(world, style, modelKey), "utf8")) : {};
  const set = anchorSet(snapshot, { items: true, portraits: true, figures: true, places: true, holdings: true });
  const rows = [];
  for (const row of set) {
    const name = `${slug(row.name)}-${row.composition}`;
    if (only && !only.some((part) => name.includes(part))) continue;
    const file = `${world}-${style}-${modelKey}-${name}.jpg`;
    const key = `${row.subject.id}:${row.composition}`;
    if (index[key] && existsSync(join(imagesDir, index[key].file)) && !flag("--force")) continue;
    const references = [];
    if (row.composition === "figure") {
      const portrait = index[`${row.subject.id}:portrait`];
      if (portrait) { const bytes = new Uint8Array(readFileSync(join(imagesDir, portrait.file))); references.push({ bytes, contentType: sniffImage(bytes) }); }
    }
    const prompt = falSubjectPrompt({ composition: row.composition, name: row.name, description: row.description, style: preset.text }) +
      (references.length ? "\nReferences: a reference portrait shows this person's face: keep it." : "");
    const size = COMPOSITION_SIZE[row.composition];
    const input = { model, prompt, size, format: "jpeg", references, ...(model === "fal-ai/flux-2-pro" && (row.composition === "portrait" || row.composition === "figure") ? { safetyTolerance: "4" } : {}) };
    const started = Date.now();
    let outcome;
    try { outcome = await falCall(input, `anchor ${name}`); } catch (error) { console.log(error.message); break; }
    const entry = { name: row.name, composition: row.composition, subjectId: row.subject.id, model, size, references: references.length, prompt, file };
    if (outcome.dry) { rows.push({ ...entry, expectedUsd: usd(outcome.expected) }); continue; }
    if (outcome.result) {
      writeFileSync(join(imagesDir, file), outcome.result.bytes);
      index[key] = { file, composition: row.composition, name: row.name };
      rows.push({ ...entry, endpoint: outcome.result.endpoint, requestId: outcome.result.requestId, width: outcome.result.width, height: outcome.result.height, bytes: outcome.result.bytes.length,
        falMs: outcome.result.elapsedMs, totalMs: Date.now() - started, priceUsd: usd(outcome.result.priceUsdMicros), softened: !!outcome.softened, firstError: outcome.firstError ?? null });
      console.log(`${name}: ${outcome.result.width}x${outcome.result.height} ${usd(outcome.result.priceUsdMicros)} in ${(outcome.result.elapsedMs / 1000).toFixed(1)} s${outcome.softened ? " (softened)" : ""}`);
    } else {
      rows.push({ ...entry, error: outcome.error?.code ?? "error", detail: outcome.error?.detail ?? null, softened: !!outcome.softened, firstError: outcome.firstError ?? null });
      console.log(`${name}: failed (${outcome.error?.code}${outcome.error?.detail ? ` — ${outcome.error.detail}` : ""})`);
    }
    writeFileSync(indexFile(world, style, modelKey), JSON.stringify(index, null, 2) + "\n");
  }
  saveRun(`anchors-${world}-${style}-${modelKey}`, { command: "anchors", world, style: preset.key, styleText: preset.text, model, dry, rows, spentUsd: usd(rows.reduce((sum, row) => sum + Math.round(Number(String(row.priceUsd ?? "0").slice(1)) * 1_000_000), 0)) });
}

async function runFrames() {
  const world = arg("--world", "shov"), style = arg("--style", "oil"), modelKey = arg("--model", "klein9b"), refs = arg("--refs", "on") === "on";
  const model = MODELS[modelKey];
  const tag = arg("--tag", "");
  const anchorsKey = arg("--anchors", modelKey);
  const scene = JSON.parse(readFileSync(join(root, "test-fixtures", "stage-v", `${world}-scene.json`), "utf8"));
  const sample = samples[world];
  const snapshot = sample.snapshot();
  const preset = styleOf(style);
  const [from, to] = (arg("--turns", `1-${scene.turns.length}`)).split("-").map(Number);
  const index = existsSync(indexFile(world, style, anchorsKey)) ? JSON.parse(readFileSync(indexFile(world, style, anchorsKey), "utf8")) : {};
  const anchorFor = (subjectId, composition) => index[`${subjectId}:${composition}`] ?? null;
  const byName = (name) => snapshot.entities.find((row) => row.name === name) ?? null;
  const placeId = (key) => snapshot.locations.find((row) => row.name === scene.places[key])?.id ?? null;
  const rows = [];
  for (let n = from; n <= Math.min(to, scene.turns.length); n++) {
    const turn = scene.turns[n - 1];
    const paragraph = firstParagraph(turn.narration, true);
    const context = { heroName: scene.hero, names: scene.names, placeName: scene.places[turn.place] ?? null, language: scene.language };
    // The shot: one small-model request, the deterministic fallback on failure.
    let shotEntry = reserve("haiku", 2_000, `shot t${n}`);
    const built = dry ? { shot: null, source: "fallback", usage: null, costUsdMicros: 0, elapsedMs: 0, error: "dry" } : await buildShot(anthropicKey, paragraph, context);
    settle(shotEntry, built.costUsdMicros);
    const shot = built.shot ?? fallbackShot(paragraph, context);
    const entityIds = shotEntityIds(shot, snapshot.entities);
    const references = [];
    const referenceNames = [];
    const place = placeId(turn.place);
    if (refs) {
      const placeAnchor = place ? anchorFor(place, "location") : null;
      if (placeAnchor) { const bytes = new Uint8Array(readFileSync(join(imagesDir, placeAnchor.file))); references.push({ bytes, contentType: sniffImage(bytes) }); referenceNames.push(`place: ${placeAnchor.name}`); }
      for (const id of entityIds) {
        const entity = snapshot.entities.find((row) => row.id === id);
        const anchor = anchorFor(id, entity && (entity.kind === "transport" || entity.kind === "mount") ? "holding" : "portrait");
        if (anchor && references.length < 4) { const bytes = new Uint8Array(readFileSync(join(imagesDir, anchor.file))); references.push({ bytes, contentType: sniffImage(bytes) }); referenceNames.push(anchor.name); }
      }
    }
    const people = entityIds.map((id) => snapshot.entities.find((row) => row.id === id)?.name).filter(Boolean);
    const prompt = framePrompt(shot, preset.text, { people: refs ? people.filter((name) => referenceNames.includes(name)) : [], place: refs && referenceNames[0]?.startsWith("place") ? scene.places[turn.place] : null, style: false });
    const input = { model, prompt, size: COMPOSITION_SIZE.frame, format: "jpeg", references };
    const started = Date.now();
    let outcome;
    try { outcome = await falCall(input, `frame t${n} ${refs ? "refs" : "norefs"}`); } catch (error) { console.log(error.message); break; }
    const file = `${world}-${style}-${modelKey}-${refs ? "refs" : "norefs"}${tag ? `-${tag}` : ""}-t${String(n).padStart(2, "0")}.jpg`;
    const entry = { turn: n, input: turn.input, paragraph, shot, shotSource: built.source, shotUsage: built.usage, shotUsd: usd(built.costUsdMicros), shotMs: built.elapsedMs, shotError: built.error,
      who: turn.who, matchedEntities: people, references: referenceNames, prompt, model, file };
    if (outcome.dry) { rows.push({ ...entry, expectedUsd: usd(outcome.expected) }); continue; }
    if (outcome.result) {
      writeFileSync(join(imagesDir, file), outcome.result.bytes);
      rows.push({ ...entry, endpoint: outcome.result.endpoint, requestId: outcome.result.requestId, width: outcome.result.width, height: outcome.result.height, bytes: outcome.result.bytes.length,
        falMs: outcome.result.elapsedMs, frameMs: built.elapsedMs + outcome.result.elapsedMs, totalMs: Date.now() - started + built.elapsedMs, priceUsd: usd(outcome.result.priceUsdMicros),
        turnUsd: usd(outcome.result.priceUsdMicros + built.costUsdMicros), softened: !!outcome.softened });
      console.log(`t${n}: shot ${built.source} ${built.elapsedMs} ms · ${outcome.result.endpoint} ${outcome.result.elapsedMs} ms · ${usd(outcome.result.priceUsdMicros)} · refs ${references.length} (${people.join(", ") || "—"})`);
    } else {
      rows.push({ ...entry, error: outcome.error?.code ?? "error", detail: outcome.error?.detail ?? null, softened: !!outcome.softened });
      console.log(`t${n}: failed (${outcome.error?.code}${outcome.error?.detail ? ` — ${outcome.error.detail}` : ""})`);
    }
  }
  const done = rows.filter((row) => row.frameMs);
  const median = (list) => { const sorted = [...list].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null; };
  const summary = {
    frames: done.length, failed: rows.filter((row) => row.error).length,
    medianShotMs: median(done.map((row) => row.shotMs)), medianFalMs: median(done.map((row) => row.falMs)), medianFrameMs: median(done.map((row) => row.frameMs)),
    shotFromModel: done.filter((row) => row.shotSource === "model").length,
    perFrameUsd: usd(done.length ? Math.round(done.reduce((sum, row) => sum + Number(row.priceUsd.slice(1)) * 1_000_000, 0) / done.length) : 0),
    perTurnUsd: usd(done.length ? Math.round(done.reduce((sum, row) => sum + Number(row.turnUsd.slice(1)) * 1_000_000, 0) / done.length) : 0),
  };
  console.log(JSON.stringify(summary));
  saveRun(`frames-${world}-${style}-${modelKey}-${refs ? "refs" : "norefs"}${tag ? `-${tag}` : ""}`, { command: "frames", world, style: preset.key, styleText: preset.text, model, anchorsModel: anchorsKey, refs, dry, summary, rows });
}

async function runScore() {
  const file = arg("--run") ?? (() => {
    const match = arg("--match");
    const found = readdirSync(runsDir).filter((name) => name.includes(match) && name.includes("-frames-")).sort().at(-1);
    if (!found) throw new Error(`no frames record matches ${match}`);
    return join("docs", "runs", "stage-v", found);
  })();
  const record = JSON.parse(readFileSync(join(root, file), "utf8"));
  const index = JSON.parse(readFileSync(indexFile(record.world, record.style, record.anchorsModel ?? Object.entries(MODELS).find(([, id]) => id === record.model)[0]), "utf8"));
  const snapshot = samples[record.world].snapshot();
  const scene = JSON.parse(readFileSync(join(root, "test-fixtures", "stage-v", `${record.world}-scene.json`), "utf8"));
  const scores = [];
  for (const row of record.rows) {
    if (!row.file || row.error) continue;
    const turn = scene.turns[row.turn - 1];
    const anchors = [];
    const place = snapshot.locations.find((loc) => loc.name === scene.places[turn.place]);
    const placeAnchor = place ? index[`${place.id}:location`] : null;
    if (placeAnchor) anchors.push({ label: `the place, ${placeAnchor.name}`, file: placeAnchor.file });
    for (const name of row.matchedEntities ?? []) {
      const entity = snapshot.entities.find((e) => e.name === name);
      const anchor = entity ? index[`${entity.id}:${entity.kind === "transport" || entity.kind === "mount" ? "holding" : "portrait"}`] : null;
      if (anchor && anchors.length < 4) anchors.push({ label: `portrait of ${anchor.name}`, file: anchor.file });
    }
    if (!anchors.length) { scores.push({ turn: row.turn, skipped: "no anchors" }); continue; }
    const entry = reserve("haiku", 12_000, `score t${row.turn}`);
    if (dry) { settle(entry, 0); continue; }
    const load = (name) => { const bytes = new Uint8Array(readFileSync(join(imagesDir, name))); return { bytes, contentType: sniffImage(bytes) }; };
    try {
      const result = await scoreConsistency(anthropicKey, { frame: load(row.file), anchors: anchors.map((anchor) => ({ label: anchor.label, ...load(anchor.file) })), shot: row.shot });
      settle(entry, result.costUsdMicros);
      scores.push({ turn: row.turn, anchors: anchors.map((anchor) => anchor.label), score: result.score, usage: result.usage, usd: usd(result.costUsdMicros), raw: result.raw });
      console.log(`t${row.turn}: people ${result.score?.people} place ${result.score?.place} style ${result.score?.style} — ${result.score?.notes}`);
    } catch (error) {
      settle(entry, 0);
      scores.push({ turn: row.turn, error: String(error.message).slice(0, 120) });
    }
  }
  const scored = scores.filter((row) => row.score);
  const mean = (key) => scored.length ? Number((scored.reduce((sum, row) => sum + row.score[key], 0) / scored.length).toFixed(2)) : null;
  const withPeople = scored.filter((row) => row.anchors.some((label) => label.startsWith("portrait")));
  const summary = { scored: scored.length, meanPeople: withPeople.length ? Number((withPeople.reduce((sum, row) => sum + row.score.people, 0) / withPeople.length).toFixed(2)) : null, meanPlace: mean("place"), meanStyle: mean("style") };
  console.log(JSON.stringify(summary));
  saveRun(`score-${record.world}-${record.style}-${Object.entries(MODELS).find(([, id]) => id === record.model)[0]}-${record.refs ? "refs" : "norefs"}${file.includes("-cmp") ? "-cmp" : file.includes("-key") ? "-key" : ""}`, { command: "score", run: file, world: record.world, style: record.style, model: record.model, refs: record.refs, summary, scores });
}

function rerunCost() {
  const world = arg("--world", "shov");
  const snapshot = samples[world].snapshot();
  const set = anchorSet(snapshot, { items: true, portraits: true, figures: true, places: true, holdings: true });
  const cost = (tier) => set.reduce((sum, row) => sum + pictureCostUsdMicros(tier, row.composition), 0);
  const byReason = {};
  for (const row of set) byReason[row.reason] = (byReason[row.reason] ?? 0) + 1;
  console.log(JSON.stringify({ world, anchors: set.length, byReason, fastUsd: usd(cost("fast")), qualityUsd: usd(cost("quality")) }));
}

function summary() {
  const files = readdirSync(runsDir).filter((name) => name.endsWith(".json") && name !== "ledger.json").sort();
  const lines = ["# Stage V paid runs — summary", "", `Ledger: ${usd(ledger.totalUsdMicros)} of ${ledger.capUsd} (${ledger.entries.length} paid calls). Generated by \`scripts/stage-v-bench.mjs summary\`.`, ""];
  lines.push("| Record | Command | World | Style | Model | Refs | Frames / anchors | Median shot ms | Median fal ms | Median frame ms | Per frame | Per turn | People | Place | Style |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const name of files) {
    const r = JSON.parse(readFileSync(join(runsDir, name), "utf8"));
    const s = r.summary ?? {};
    const count = r.command === "anchors" ? r.rows.filter((row) => row.priceUsd).length : s.frames ?? s.scored ?? "";
    lines.push(`| ${name} | ${r.command} | ${r.world} | ${r.style} | ${(r.model ?? "").replace("fal-ai/", "")} | ${r.refs === undefined ? "" : r.refs ? "on" : "off"} | ${count} | ${s.medianShotMs ?? ""} | ${s.medianFalMs ?? ""} | ${s.medianFrameMs ?? ""} | ${s.perFrameUsd ?? ""} | ${s.perTurnUsd ?? ""} | ${s.meanPeople ?? ""} | ${s.meanPlace ?? ""} | ${s.meanStyle ?? ""} |`);
  }
  writeFileSync(join(runsDir, "SUMMARY.md"), lines.join("\n") + "\n");
  console.log(lines.join("\n"));
}

if (!["rerun-cost", "summary"].includes(command) && !dry && (!falKey || !anthropicKey)) { console.log("FAL_KEY and ANTHROPIC_API_KEY must be set in .env.local"); process.exit(1); }
if (command === "anchors") await runAnchors();
else if (command === "frames") await runFrames();
else if (command === "score") await runScore();
else if (command === "rerun-cost") rerunCost();
else if (command === "summary") summary();
else { console.log("usage: see the header of scripts/stage-v-bench.mjs"); process.exit(1); }
console.log(`ledger: ${usd(ledger.totalUsdMicros)} of ${ledger.capUsd}`);
