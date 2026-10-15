// Paid fal image smoke test (Stage 5). Generates the sample art used by the
// synthetic Stage 5 previews and reports the list price of every image.
//   node scripts/fal-image-smoke.mjs [--cap 3] [--only name,name] [--dry]
// Reads FAL_KEY from .env.local (never printed). Stops before any request that
// would push the total over the cap. Never touches the owner's database.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMPOSITION_SIZE,
  FAL_SIZES,
  falImagePriceUsdMicros,
  falSubjectPrompt,
  generateFalImage,
  usd,
} from "../src/lib/visual-frame/fal-image.ts";
import { previewArtJobs } from "../src/lib/ui/preview/stage5-art.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const capUsd = Number(arg("--cap") ?? 3);
const only = arg("--only")?.split(",");
const dry = args.includes("--dry");
const force = args.includes("--force");

function readKey() {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((row) => row.startsWith("FAL_KEY="));
  return line ? line.slice("FAL_KEY=".length).trim().replace(/^["']|["']$/g, "") : "";
}

// The sample subjects live with the preview fixtures, never in app code.
const jobs = previewArtJobs;

const key = readKey();
if (!key && !dry) {
  console.log("FAL_KEY is not set in .env.local — nothing was generated.");
  process.exit(1);
}
const out = join(root, "public", "preview", "stage-5");
mkdirSync(out, { recursive: true });
const capMicros = Math.round(capUsd * 1_000_000);
// The cap covers every paid run of this stage: earlier runs are read back from the report.
const reportFile = join(root, "docs", "screens", "stage-5", "fal-cost.json");
const micros = (text) => Math.round(Number(String(text ?? "0").replace("$", "")) * 1_000_000);
const previous = existsSync(reportFile) ? JSON.parse(readFileSync(reportFile, "utf8")).images ?? [] : [];
const paid = previous.filter((row) => row.priceUsd || row.countedUsd);
let spent = paid.reduce((sum, row) => sum + micros(row.priceUsd ?? row.countedUsd), 0);
const report = [...paid];
for (const { name, composition, model, subject, description, style } of jobs) {
  if (only && !only.includes(name)) continue;
  const file = join(out, `${name}.jpg`);
  if (existsSync(file) && !force) continue;
  const size = COMPOSITION_SIZE[composition];
  const [w, h] = FAL_SIZES[size];
  const expected = falImagePriceUsdMicros(model, w, h);
  if (spent + expected > capMicros) { console.log(`stop: ${name} would exceed the ${usd(capMicros)} cap`); break; }
  const prompt = falSubjectPrompt({ composition, name: subject, description, style });
  if (dry) { report.push({ name, model, size, expectedUsd: usd(expected) }); spent += expected; continue; }
  const started = Date.now();
  try {
    const result = await generateFalImage(key, { model, prompt, size, format: "jpeg" });
    writeFileSync(file, result.bytes);
    spent += result.priceUsdMicros;
    report.push({ name, model, width: result.width, height: result.height, bytes: result.bytes.length,
      seconds: Math.round((Date.now() - started) / 100) / 10, priceUsd: usd(result.priceUsdMicros) });
    console.log(`${name}: ${model} ${result.width}x${result.height} ${usd(result.priceUsdMicros)} in ${Math.round((Date.now() - started) / 1000)} s`);
  } catch (error) {
    // A failed submit may still be billed by fal; count the expected price to stay under the cap.
    spent += expected;
    report.push({ name, model, error: error?.code ?? "error", detail: error?.detail ?? null, countedUsd: usd(expected) });
    console.log(`${name}: failed (${error?.code ?? "error"}${error?.detail ? ` — ${error.detail}` : ""}), counted ${usd(expected)}`);
  }
}
const summary = { date: new Date().toISOString(), capUsd: usd(capMicros), totalUsd: usd(spent), images: report };
mkdirSync(dirname(reportFile), { recursive: true });
if (!dry) writeFileSync(reportFile, JSON.stringify(summary, null, 2) + "\n");
console.log(`total ${usd(spent)} of cap ${usd(capMicros)}`);
