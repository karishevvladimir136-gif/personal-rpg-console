// Fix S3-accept Д3: how well the region check locates places — the probe's first picture (prep v1) read twice by the
// check model: as fractions of the picture (the scenes' wording) and as pixels of the stated size (converted back to
// fractions). The truth is the landmarks' spots as drawn, measured by eye on the saved picture. Paid (two small vision
// calls); registered in the stage ledger (fixs3accept, stage D). Only coordinates and usage are recorded.
//   FIX_S2_STAGE=D node scripts/eval/live2d/region-check-variants.mjs [--model claude-sonnet-5] [--picture <file>]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { providerKey } from "../lib/keys.mjs";
import { openRun } from "../real-replay/lib/ledger.mjs";
import { sniffImage } from "../../../src/lib/visual-frame/fal-image.ts";
import { regionCheckItems } from "../../../src/lib/live2d/region-marks.ts";
import { checkRegionMap, imageSize } from "../../../src/lib/live2d/server/region-vision.ts";
import { campaign, id } from "./region-probe-campaign.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const args = process.argv.slice(2);
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "claude-sonnet-5";
const price = { input: 2, output: 10 };
const record = JSON.parse(readFileSync(join(root, "docs", "runs", "fix-s3-accept-d-probe-v1.json"), "utf8"));
const file = args.includes("--picture") ? args[args.indexOf("--picture") + 1] : record.files[0].plain;
const bytes = new Uint8Array(readFileSync(file.startsWith("/") ? file : join(root, file)));
const picture = { bytes, contentType: sniffImage(bytes) };
const snapshot = campaign();
const names = new Map(snapshot.locations.map((row) => [row.id, row.name]));
const items = regionCheckItems(record.prep.public, names);
// The landmarks as drawn on prep v1's first picture (by eye, fractions of the picture).
const truth = { [id("village")]: [0.55, 0.55], [id("bridge")]: [0.43, 0.83], [id("post")]: [0.51, 0.37], [id("lodge")]: [0.56, 0.17], [id("mill")]: [0.4, 0.05], [id("barrow")]: [0.92, 0.26] };
const run = await openRun(`fix-s3-accept-d-check-variants-${new Date().toISOString().slice(0, 19)}`, 0.2, `Д3 region check: fractions vs pixels (${model}), prep v1 picture`, "fixs3accept", "D");
const out = { at: new Date().toISOString(), model, picture: file, size: imageSize(bytes), variants: {} };
let spent = 0;
for (const coordinates of ["fraction", "pixel"]) {
  const result = await checkRegionMap(providerKey("ANTHROPIC_API_KEY"), items, "", picture, { model, price, coordinates });
  spent += result.costUsdMicros / 1e6;
  const rows = items.filter((item) => truth[item.locationId]).map((item) => {
    const found = result.check?.items.find((row) => row.key === item.key);
    const [tx, ty] = truth[item.locationId];
    const error = found?.visible ? Number(Math.hypot(found.x - tx, found.y - ty).toFixed(3)) : null;
    return { name: item.name, truth: [tx, ty], found: found?.visible ? [found.x, found.y] : null, error };
  });
  const errors = rows.map((row) => row.error).filter((value) => value !== null);
  out.variants[coordinates] = { error: result.error, usd: Number((result.costUsdMicros / 1e6).toFixed(4)), usage: result.usage,
    meanError: errors.length ? Number((errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(3)) : null, rows };
  console.log(coordinates, out.variants[coordinates].meanError, JSON.stringify(rows.map((row) => [row.name, row.found, row.error])));
}
await run.settle(spent, { file: "docs/runs/fix-s3-accept-d-check-variants.json" });
let previous = [];
try { previous = JSON.parse(readFileSync(join(root, "docs", "runs", "fix-s3-accept-d-check-variants.json"), "utf8")); } catch { previous = []; }
writeFileSync(join(root, "docs", "runs", "fix-s3-accept-d-check-variants.json"), `${JSON.stringify([...previous, out], null, 2)}\n`);
