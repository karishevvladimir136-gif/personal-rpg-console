// Fix S3-accept block Б probe (docs/stages/FIX_S3_ACCEPT.md): the new scene-sheet request on three synthetic Russian
// places (scripts/eval/live2d/places.mjs) — is the player-facing hotspot text Russian, are there 5–8 hotspots, how often
// is the second ask needed — and one run of the one-time redo of an older English sheet. Text calls only, no pictures.
// The production request code (src/lib/live2d/server/vision.ts buildSheet / relangSheet) is called as is; the only
// probe-side change is the model id in transit when the app's sheet model is not reachable with this key (the app's own
// model choice is untouched; the record says which model answered). Every call is in the stage's ledger
// (docs/runs/fix-s3-accept-ledger.json, block B, $2.50 share); the key is read by providerKey() and never printed.
//   NODE_USE_ENV_PROXY=1 node scripts/eval/live2d/fix-s3-accept-b-probe.mjs [--sheet-model claude-sonnet-5]
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { providerKey } from "../lib/keys.mjs";
import { openRun, ROOT } from "../real-replay/lib/ledger.mjs";
import { PLACES } from "./places.mjs";
import { buildSheet, relangSheet, SHEET_MODEL, RELANG_MODEL } from "../../../src/lib/live2d/server/vision.ts";
import { foreignTexts, needsLanguageRedo } from "../../../src/lib/live2d/scene-language.ts";
import { SHEET_MAX_FEATURES, SHEET_MIN_FEATURES } from "../../../src/lib/live2d/scene.ts";

const args = process.argv.slice(2);
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const PROBE_SHEET_MODEL = value("--sheet-model", SHEET_MODEL);
const BUDGET_USD = 0.5;
const key = providerKey("ANTHROPIC_API_KEY");
if (!key) { console.error("no Anthropic key (.env.local or APP_ANTHROPIC_API_KEY)"); process.exit(2); }

const calls = [];
// The same request code; the model id swapped in transit only when asked (a probe-only override).
const fetcher = async (url, init) => {
  const body = JSON.parse(init.body);
  const asked = body.model;
  if (body.model === SHEET_MODEL && PROBE_SHEET_MODEL !== SHEET_MODEL) body.model = PROBE_SHEET_MODEL;
  const response = await fetch(url, { ...init, body: JSON.stringify(body) });
  const json = await response.clone().json().catch(() => null);
  calls.push({ asked, sent: body.model, status: response.status, servedBy: json?.model ?? null, usage: json?.usage ? { input: json.usage.input_tokens, output: json.usage.output_tokens } : null,
    error: response.ok ? null : json?.error?.type ?? `HTTP ${response.status}` });
  return response;
};

const run = `fix-s3-accept-b-probe-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const ledger = await openRun(run, BUDGET_USD, `Block Б probe: the scene sheet on 3 Russian places (${PROBE_SHEET_MODEL}) and one redo of an English sheet (${RELANG_MODEL}); text only`, "fixs3accept", "B");
let spentMicros = 0;
const left = () => ledger.budgetUsd * 1_000_000 - spentMicros;
const record = { run, at: new Date().toISOString(), appSheetModel: SHEET_MODEL, probeSheetModel: PROBE_SHEET_MODEL, relangModel: RELANG_MODEL,
  rule: `${SHEET_MIN_FEATURES}–${SHEET_MAX_FEATURES} hotspots, player text in the campaign's language`, places: [], redo: null, calls, spentUsd: 0 };

try {
  for (const key_ of ["guard-post", "mine-yard", "temple"]) {
    if (left() < 60_000) { record.stopped = "budget"; break; }
    const place = PLACES.find((row) => row.key === key_);
    const source = { place: { id: place.id, name: place.name, description: place.description }, exits: place.exits, present: place.present, passages: place.passages, timeOfDay: place.timeOfDay, language: "ru" };
    const built = await buildSheet(key, source, { fetcher });
    spentMicros += built.costUsdMicros;
    const sheet = built.sheet;
    record.places.push({
      place: place.name, ok: !!sheet, error: built.error, asks: built.asks ?? 0, costUsdMicros: built.costUsdMicros, usage: built.usage, ms: built.elapsedMs,
      features: sheet?.features.length ?? 0, withinRule: !!sheet && sheet.features.length >= SHEET_MIN_FEATURES && sheet.features.length <= SHEET_MAX_FEATURES,
      languageMark: sheet?.language ?? null, foreignTexts: sheet ? foreignTexts(sheet, "ru") : [],
      hotspots: sheet?.features.map((row) => ({ key: row.key, label: row.label, kind: row.kind, mustShow: row.mustShow, description: row.description, brief: row.brief ?? null })) ?? [],
      summary: sheet?.summary ?? null, light: sheet?.light ?? null, never: sheet?.never ?? [],
    });
    console.log(`${place.name}: ${sheet ? `${sheet.features.length} hotspots, asks ${built.asks}, language ${sheet.language ?? "—"}, foreign ${foreignTexts(sheet, "ru").length}` : built.error} · $${(built.costUsdMicros / 1e6).toFixed(4)}`);
  }
  // The one-time redo on an older English sheet (the shape session 2 stored for the guard post).
  if (left() >= 10_000) {
    const old = { summary: "A stone gatehouse at the south gate: the portcullis down, a brazier, a spear rack, stairs up to the wall, a window for papers.",
      features: [
        { key: "portcullis", label: "Решётка", kind: "entrance", description: "The lowered iron portcullis of the south gate", mustShow: true, targetLocationId: null },
        { key: "brazier", label: "Жаровня", kind: "object", description: "An iron brazier with glowing coals", mustShow: true, targetLocationId: null },
        { key: "stairs", label: "Лестница на стену", kind: "exit", description: "Stone stairs leading up to the wall walk", mustShow: false, targetLocationId: null },
      ], people: [], light: "the brazier's glow at dawn", timeOfDay: "dawn", never: ["a second gate", "a stable"], crowded: false };
    const redone = await relangSheet(key, old, "Застава у Южных ворот", "ru", { fetcher });
    spentMicros += redone.costUsdMicros;
    record.redo = { ok: !!redone.sheet, error: redone.error, costUsdMicros: redone.costUsdMicros, usage: redone.usage, ms: redone.elapsedMs, dueBefore: needsLanguageRedo(old, "ru"),
      dueAfter: redone.sheet ? needsLanguageRedo(redone.sheet, "ru") : null, languageMark: redone.sheet?.language ?? null,
      features: redone.sheet?.features.map((row) => ({ key: row.key, description: row.description, brief: row.brief ?? null })) ?? [], summary: redone.sheet?.summary ?? null,
      light: redone.sheet?.light ?? null, never: redone.sheet?.never ?? [] };
    console.log(`redo: ${redone.sheet ? `ok, language ${redone.sheet.language}` : redone.error} · $${(redone.costUsdMicros / 1e6).toFixed(4)}`);
  }
} finally {
  record.spentUsd = Number((spentMicros / 1e6).toFixed(4));
  writeFileSync(join(ROOT, "docs", "runs", "fix-s3-accept-b-probe.json"), `${JSON.stringify(record, null, 2)}\n`);
  await ledger.settle(spentMicros / 1e6, { file: "docs/runs/fix-s3-accept-b-probe.json", calls: calls.length, probeSheetModel: PROBE_SHEET_MODEL });
  console.log(`spent $${record.spentUsd} of the $${ledger.budgetUsd} reserved; ${calls.length} calls`);
}
