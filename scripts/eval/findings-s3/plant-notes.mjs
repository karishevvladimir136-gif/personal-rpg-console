// Findings S3 §7: the five probe scenes at the new dose of the DM's own notes. Takes a probe file and the record of a paid
// digest (digest-probe.mjs) and writes a probe file whose every state carries that digest's notes as the app would store
// them after it: the hidden layer rewritten (up to 24 000 characters) and the DM's notebook. Nothing else changes. Free.
//   node scripts/eval/findings-s3/plant-notes.mjs --snapshots <probes.json> --digest docs/runs/findings-s3-digest-<stamp>.json --out <probes-24k.json>
import { readFile, writeFile } from "node:fs/promises";
import { HIDDEN_LAYER_KEY } from "../../../src/lib/gameplay/dm-loop/private-notes.ts";
import { HIDDEN_LAYER_MAX_CHARS } from "../../../src/lib/gameplay/dm-loop/hidden-layer.ts";

const args = { snapshots: null, digest: null, out: null };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--snapshots") args.snapshots = value();
  else if (flag === "--digest") args.digest = value();
  else if (flag === "--out") args.out = value();
  else throw new Error(`unknown argument ${flag}`);
}
if (!args.snapshots || !args.digest || !args.out) throw new Error("--snapshots, --digest and --out are required");
const record = JSON.parse(await readFile(args.digest, "utf8"));
const layer = record.digest?.hiddenLayer;
const notebook = record.digest?.notebook ?? "";
if (!layer) throw new Error("the digest record has no rewritten hidden layer");
if (layer.length > HIDDEN_LAYER_MAX_CHARS) throw new Error(`the layer is ${layer.length} characters, past the cap`);
const file = JSON.parse(await readFile(args.snapshots, "utf8"));
const rows = Array.isArray(file) ? file : file.snapshots;
for (const row of rows) {
  const state = row.payload.source.privateState;
  state.fact = { ...(state.fact ?? {}), [HIDDEN_LAYER_KEY]: layer, ...(notebook ? { notebook } : {}) };
}
const out = Array.isArray(file) ? rows : { ...file, title: `${file.title ?? "probes"} — the notes of ${record.run} (${layer.length} characters)`, snapshots: rows };
await writeFile(args.out, JSON.stringify(out), "utf8");
console.log(`${rows.length} state(s) with the hidden layer of ${layer.length} characters and a notebook of ${notebook.length} → ${args.out}`);
