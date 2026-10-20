// The scene probe (docs/stages/LIVE2D_1.md «Measured, not assumed»): eight synthetic
// places through the production chain — the sheet (Sonnet 5.5) from the records and
// the passages, the brief, one picture on the quality tier (GPT Image 2.5 Sunburst,
// no people), the strong vision check (Sonnet 5.5), one corrected redraw on a miss
// or a contradiction, the cheap locator (Haiku 5.5) for the records' POIs only.
// Reports the share of «must show» found, the contradiction rate, the redraw rate,
// named people in backgrounds, invented markers (always zero by construction) and
// the cost per scene. Every paid call goes through the ledger; a finished place is
// never drawn again (docs/runs/live2d-1-probe-results.json is the resume point).
//   node scripts/eval/live2d/probe.mjs [--budget-usd 6] [--only ford,tavern] [--region] [--summary]
import { PLACES, REGION, probeSnapshot } from "./places.mjs";
import { checkFor, drawScene, locateFor, mean, putRow, results, rowOf, saveImage, seedsFor, setRunBudget, sheetFor, spentUsdMicros, usd, readImage, BudgetError } from "./lib.mjs";
import { fallbackSheet, placePois, poiCandidates, sceneBrief, sceneVerdict, sideListOf } from "../../../src/lib/live2d/scene.ts";
import { regionMapPrompt } from "../../../src/lib/live2d/region.ts";
import { randomUUID } from "node:crypto";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
setRunBudget(Number(value("--budget-usd", 6)));
const only = value("--only", null)?.split(",") ?? null;
const STYLE = "Painterly fantasy illustration, warm earthy palette, soft brushwork, clear readable shapes; no text on the picture.";

function summary() {
  const rows = results.rows.filter((row) => row.kind === "scene");
  const found = rows.map((row) => row.final?.found / row.final?.required);
  const table = rows.map((row) => `| ${row.name} | ${row.final?.required ?? "–"} | ${row.final?.found ?? "–"} | ${row.firstPass?.found ?? "–"}/${row.firstPass?.required ?? "–"} | ${row.final?.contradictions?.length ?? "–"} | ${row.redraws} | ${row.final?.people ? "yes" : "no"} | ${row.pois?.placed ?? "–"}/${row.pois?.total ?? "–"} (${row.pois?.approximate ?? 0} approx.) | ${usd(row.usdMicros)} | ${row.files?.join(", ") ?? ""} |`);
  const scenes = rows.length;
  const perfect = rows.filter((row) => row.final && row.final.found === row.final.required).length;
  const firstPerfect = rows.filter((row) => row.firstPass && row.firstPass.found === row.firstPass.required && !row.firstPass.contradictions.length).length;
  const text = [
    "| Place | Must show | Found (final) | Found (first pass) | Contradictions (final) | Redraws | People in background | POIs placed | Cost | Files |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...table,
    "",
    `Scenes: ${scenes}. «Must show» found after at most one redraw: ${(100 * (mean(found) ?? 0)).toFixed(1)}% (${perfect}/${scenes} places complete). First pass complete without contradictions: ${firstPerfect}/${scenes}.`,
    `Redraw rate: ${rows.filter((row) => row.redraws > 0).length}/${scenes}. Contradicting objects after the chain: ${rows.reduce((sum, row) => sum + (row.final?.contradictions?.length ?? 0), 0)} across ${scenes} scenes. Named people in backgrounds: ${rows.filter((row) => row.final?.people).length}. Markers outside the records: 0 (by construction).`,
    `Cost per scene: ${usd(Math.round(mean(rows.map((row) => row.usdMicros)) ?? 0))} mean (${usd(Math.min(...rows.map((row) => row.usdMicros)))}–${usd(Math.max(...rows.map((row) => row.usdMicros)))}). Spent by the ledger so far: ${usd(spentUsdMicros())}.`,
  ].join("\n");
  console.log(text);
  return text;
}

async function probePlace(place) {
  const existing = rowOf(place.key);
  if (existing?.done) { console.log(`· ${place.name}: done (${usd(existing.usdMicros)})`); return; }
  const started = Date.now();
  let usdMicros = 0;
  const snapshot = probeSnapshot();
  const source = { place: { id: place.id, name: place.name, description: place.description }, exits: place.exits, present: place.present, passages: place.passages, timeOfDay: place.timeOfDay, language: "ru" };
  const built = await sheetFor(source, `sheet ${place.key}`);
  usdMicros += built.costUsdMicros;
  const sheet = built.sheet ?? fallbackSheet(source);
  console.log(`· ${place.name}: sheet ${built.sheet ? "model" : "fallback"} (${sheet.features.length} features, ${sheet.features.filter((row) => row.mustShow).length} must show, ${built.elapsedMs} ms, ${usd(built.costUsdMicros)})`);
  const files = [];
  const draw = async (correction, label) => {
    const prompt = sceneBrief(sheet, { placeName: place.name, style: STYLE, correction });
    const drawn = await drawScene(prompt, { note: `${label} ${place.key}` });
    if (!drawn.ok) return { prompt, drawn, check: null, file: null };
    const file = saveImage(drawn.bytes, place.key);
    files.push(file);
    const checked = await checkFor(sheet, place.name, { bytes: drawn.bytes, contentType: drawn.contentType }, `check ${place.key}`);
    usdMicros += drawn.usdMicros + checked.costUsdMicros;
    return { prompt, drawn, check: checked.check, checkError: checked.error, file, ms: drawn.ms };
  };
  const first = await draw(null, "scene");
  if (!first.drawn.ok) { putRow({ key: place.key, name: place.name, kind: "scene", done: false, error: first.drawn.code, usdMicros, sheet }); console.log(`  picture failed: ${first.drawn.code} ${first.drawn.detail ?? ""}`); return; }
  usdMicros += 0;
  const verdictOf = (check) => (check ? sceneVerdict(sheet, check) : null);
  const firstVerdict = verdictOf(first.check);
  console.log(`  first pass: ${first.ms} ms, ${firstVerdict ? `${firstVerdict.found}/${firstVerdict.required} found, ${firstVerdict.contradictions.length} contradictions${firstVerdict.people ? ", PEOPLE" : ""}` : `check failed (${first.checkError})`}`);
  let finalPass = first, redraws = 0;
  if (firstVerdict && !firstVerdict.ok) {
    const second = await draw({ missing: firstVerdict.missing, contradictions: [...firstVerdict.contradictions, ...(firstVerdict.people ? ["people or faces"] : [])] }, "redraw");
    redraws = 1;
    const secondVerdict = verdictOf(second.check);
    console.log(`  redraw: ${second.drawn.ok ? `${second.ms} ms, ${secondVerdict ? `${secondVerdict.found}/${secondVerdict.required} found, ${secondVerdict.contradictions.length} contradictions${secondVerdict.people ? ", PEOPLE" : ""}` : `check failed (${second.checkError})`}` : `failed ${second.drawn.code}`}`);
    const score = (v) => (v ? v.missing.length * 10 + v.contradictions.length + (v.people ? 5 : 0) : 99);
    if (second.drawn.ok && score(secondVerdict) <= score(firstVerdict)) finalPass = second;
  }
  const finalVerdict = verdictOf(finalPass.check);
  const image = readImage(finalPass.file);
  const candidates = poiCandidates(sheet, snapshot, place.id, place.present.map((row) => row.id));
  const located = await locateFor(candidates, place.name, image, `locate ${place.key}`);
  usdMicros += located.costUsdMicros;
  const pois = placePois(candidates, located.located, finalPass.check, { id: () => randomUUID(), now: new Date().toISOString(), locationId: place.id });
  const invented = pois.filter((row) => !candidates.some((c) => c.key === row.key)).length;
  console.log(`  locator: ${located.located.length}/${candidates.filter((c) => c.kind !== "person").length} features located (${located.elapsedMs} ms); POIs placed ${pois.filter((row) => row.x !== null).length}/${pois.length}, approximate ${pois.filter((row) => row.approximate).length}, invented ${invented}; side list: ${sideListOf(sheet, finalPass.check).join(", ") || "—"}; total ${usd(usdMicros)} in ${Math.round((Date.now() - started) / 1000)} s`);
  putRow({
    key: place.key, name: place.name, kind: "scene", done: true, usdMicros, redraws, files, sheet, sheetSource: built.sheet ? "model" : "fallback",
    firstPass: firstVerdict ? { found: firstVerdict.found, required: firstVerdict.required, contradictions: firstVerdict.contradictions, people: firstVerdict.people, missing: firstVerdict.missing.map((row) => row.key) } : null,
    final: finalVerdict ? { found: finalVerdict.found, required: finalVerdict.required, contradictions: finalVerdict.contradictions, people: finalVerdict.people, missing: finalVerdict.missing.map((row) => row.key), file: finalPass.file } : null,
    pois: { total: pois.length, placed: pois.filter((row) => row.x !== null).length, approximate: pois.filter((row) => row.approximate).length, invented, rows: pois },
    prompts: { first: first.prompt, redraw: redraws ? finalPass.prompt : null },
    check: finalPass.check,
  });
}

async function probeRegion() {
  if (rowOf("region")?.done) { console.log(`· region map: done`); return; }
  const prompt = regionMapPrompt({
    regionName: REGION.name, regionDescription: REGION.description, canon: "",
    places: REGION.places.map(([key, x, y]) => { const place = PLACES.find((row) => row.key === key); return { name: place.name, description: place.description, x, y, status: "known" }; }),
    route: REGION.route, style: STYLE, family: "gpt",
  });
  const drawn = await drawScene(prompt, { note: "region map" });
  if (!drawn.ok) { console.log(`· region map failed: ${drawn.code}`); return; }
  const file = saveImage(drawn.bytes, "region");
  const seeds = await seedsFor({ areaName: REGION.name, description: REGION.description, canon: "", places: PLACES.map((row) => row.name), language: "ru" }, "seeds region");
  console.log(`· region map: ${drawn.ms} ms, ${usd(drawn.usdMicros)} → ${file}; seeds: ${seeds.seeds.length} (${usd(seeds.costUsdMicros)}; private, themes only: ${seeds.seeds.map((row) => row.theme).join("; ")})`);
  putRow({ key: "region", kind: "region", done: true, usdMicros: drawn.usdMicros + seeds.costUsdMicros, file, prompt, seedThemes: seeds.seeds.map((row) => row.theme), seedCount: seeds.seeds.length });
}

try {
  if (!flag("--summary")) {
    for (const place of PLACES) if (!only || only.includes(place.key)) await probePlace(place);
    if (flag("--region")) await probeRegion();
  }
  summary();
} catch (error) {
  if (error instanceof BudgetError) { console.error(error.message); summary(); process.exit(2); }
  throw error;
}
