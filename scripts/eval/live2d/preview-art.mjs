// The preview's sample art for the synthetic walk (public/preview/live2d/): the
// probe's own scene and region pictures copied over, plus three small synthetic
// portraits and one town view drawn here (through the ledger). Nothing from the
// owner's campaigns; the faces are invented for the preview fixture only.
//   node scripts/eval/live2d/preview-art.mjs [--budget-usd 1]
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { drawScene, results, root, samplesDir, setRunBudget, usd } from "./lib.mjs";

const args = process.argv.slice(2);
setRunBudget(Number(args.includes("--budget-usd") ? args[args.indexOf("--budget-usd") + 1] : 1));
const out = join(root, "public", "preview", "live2d");
mkdirSync(out, { recursive: true });
const STYLE = "Painterly fantasy illustration, warm earthy palette, soft brushwork, clear readable shapes; no text on the picture.";

const copy = (key, target) => {
  const row = results.rows.find((r) => r.key === key);
  const file = row?.final?.file ?? row?.file;
  if (!file || !existsSync(join(samplesDir, file))) { console.log(`· ${target}: no probe picture for ${key}`); return; }
  copyFileSync(join(samplesDir, file), join(out, target));
  console.log(`· ${target} ← ${file}`);
};
copy("market", "market.jpg");
copy("ford", "ford.jpg");
copy("region", "region.jpg");

const wanted = [
  ["hero.jpg", "square_hd", `Head-and-shoulders portrait of a travelling swordswoman in her thirties, short dark hair, a weathered green cloak, calm grey eyes, plain dark background. ${STYLE}`],
  ["tobin.jpg", "square_hd", `Head-and-shoulders portrait of a stout bald innkeeper in his fifties with a grey beard and a leather apron, warm lamplight, plain dark background. ${STYLE}`],
  ["orm.jpg", "square_hd", `Head-and-shoulders portrait of a lean young fisherman with sun-bleached hair and a knitted cap, plain dark background. ${STYLE}`],
  ["veresk.jpg", "landscape_16_9_hd", `A wide view of a small river town of timber houses and a stone bridge seen from a hill at evening, a market square with a well in the middle, a boatyard with hulls on trestles by the water, no people, no text. ${STYLE}`],
];
for (const [file, size, prompt] of wanted) {
  if (existsSync(join(out, file))) { console.log(`· ${file}: exists`); continue; }
  const drawn = await drawScene(prompt, { size, note: `preview art ${file}` });
  if (!drawn.ok) { console.log(`· ${file}: failed ${drawn.code}`); continue; }
  writeFileSync(join(out, file), drawn.bytes);
  console.log(`· ${file}: ${drawn.ms} ms, ${usd(drawn.usdMicros)}`);
}
