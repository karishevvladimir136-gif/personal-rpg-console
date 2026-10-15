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

const style = "Steampunk over the ruins of an old world, oil painting, warm brass light, smoke and violet aether glow, painterly texture.";
const jobs = [
  ["hero-portrait", "portrait", "fal-ai/flux-2-pro", "James Hale", "A wiry man in his thirties with a short dark beard, a travelling mechanic and mage, warm amber light in his eyes, worn brown leather coat, brass goggles pushed up on his forehead, a pocket-watch chain on his waistcoat, friendly wry smile."],
  ["hero-figure", "figure", "fal-ai/flux-2-pro", "James Hale", "The same wiry sorcerer-mechanic seen in full: worn leather coat, tool belt with a smuggler's satchel, a heavy engraved revolver holstered at the hip, army boots, faint red scales at one temple."],
  ["meg", "portrait", "fal-ai/flux-2-pro", "Red Meg", "A confident red-haired woman airship pilot in her forties, freckles, aviator cap with goggles, fur-collared brown leather flight jacket, knowing smile."],
  ["urzul", "portrait", "fal-ai/flux-2-pro", "Urzul Ironside", "A massive orc warrior with green-grey skin, tusks, one side of his torso plated with riveted iron, many scars, calm eyes."],
  ["wolf", "portrait", "fal-ai/flux-2-pro", "Wolf Kessler", "A grizzled German engineer-soldier in his fifties, grey stubble, a brass monocle, oil-stained officer coat."],
  ["zarga", "portrait", "fal-ai/flux-2-pro", "Zarga", "An orc shaman woman with braided black hair, chalk-white tattoos, bone and copper charms, piercing amber eyes."],
  ["airship", "holding", "fal-ai/flux-2-pro", "The Iron Granny", "A battered old steampunk airship: patched canvas balloon, riveted wooden gondola, two brass propeller engines, one of them smoking, flying above clouds at sunrise."],
  ["cave", "location", "fal-ai/flux-2-pro", "Alvares family sea cave", "A sea cave hangar under the cliffs of Lisbon at dawn, an old airship moored inside, lanterns, crates, fog drifting in from the Tagus river."],
  ["geneva", "location", "fal-ai/flux-2-pro", "Geneva", "A lakeside city of spires under a shimmering violet tear in the sky, steam trams on the bridges, evening light."],
  ["atlas", "atlas", "fal-ai/flux-2-pro", "Atlas of Western Europe", "An old hand-drawn atlas of western Europe and the Atlantic coast, parchment, sepia ink, faint compass rose, coastlines and mountains, no labels."],
  ["crystal", "item", "fal-ai/flux-2/flash", "Aetherite crystal", "A glowing violet-blue aetherite crystal held in a small brass cage setting."],
  ["revolver", "item", "fal-ai/flux-2/flash", "The Argument revolver", "A heavy engraved six-shot revolver with brass fittings and a worn walnut grip."],
  ["watch", "item", "fal-ai/flux-2/flash", "Father's pocket watch", "An old silver pocket watch with a cracked glass, its hands stopped at 3:17."],
];

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
for (const [name, composition, model, subject, description] of jobs) {
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
