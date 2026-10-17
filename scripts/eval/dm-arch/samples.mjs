// The owner's blind samples of the bake-off: per scene, the narrations of every
// variant under a random file name (docs/samples/dm-arch/<scene>-<random>.json),
// the same shape as the Stage 4 blind samples (scene, input, the turn, the
// variant inside the file, never in its name). The planner builds the page.
//   node scripts/eval/dm-arch/samples.mjs [--out docs/samples/dm-arch]
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { RUNS_DIR, ROOT } from "./lib/harness.mjs";
import { VARIANTS, SCENES } from "./lib/variants.mjs";

const args = { out: join(ROOT, "docs", "samples", "dm-arch") };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else throw new Error(`unknown argument ${flag}`);
}

const files = (await readdir(RUNS_DIR)).filter((file) => /^dmarch-.*-(reference|scenes).*\.jsonl$/.test(file) && !/-dry|-smoke/.test(file)).sort();
const latest = new Map(); // `${step}:${variant}` → the latest committed scene turn
for (const file of files)
  for (const line of (await readFile(join(RUNS_DIR, file), "utf8")).split("\n")) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    if (record.type !== "turn" || record.outcome !== "committed" || !record.narration || !SCENES.includes(record.step)) continue;
    latest.set(`${record.step}:${record.variant}`, { ...record, file });
  }
const scenario = JSON.parse(await readFile(join(ROOT, "scripts", "eval", "scenarios", "19-polish-ru-replay.json"), "utf8"));

await rm(args.out, { recursive: true, force: true });
await mkdir(args.out, { recursive: true });
let written = 0;
const index = [];
for (const scene of SCENES) {
  const step = scenario.steps.find((s) => s.id === scene);
  for (const variantId of Object.keys(VARIANTS)) {
    const turn = latest.get(`${scene}:${variantId}`);
    if (!turn) continue;
    const variant = VARIANTS[variantId];
    const sample = {
      schemaVersion: 1, scene, title: `Scene ${scene}`, description: `Harbour replay, turn ${scene}: the same state for every variant; one turn.`,
      language: "ru", keyStep: scene, createdAt: new Date().toISOString(), run: turn.run, record: `docs/runs/${turn.file}`,
      variant: { id: variantId, label: variant.label, runtime: variant.runtime, writer: turn.writer, bookkeeper: turn.bookkeeper, effort: turn.pin?.effort ?? variant.effort },
      turns: [{ step: scene, input: step?.say ?? turn.input, outcome: turn.outcome, narration: turn.narration,
        firstWordMs: turn.firstWordMs, textDoneMs: turn.textDoneMs, durationMs: turn.durationMs, requests: turn.requests,
        effort: turn.pin?.effort ?? null, tension: turn.pin?.depth?.tension ?? null, tokens: turn.tokens, cacheReadShare: turn.cacheReadShare, costUsd: turn.costUsd,
        tools: { accepted: turn.effects.accepted, rejected: turn.effects.rejected, player: turn.effects.player, rolls: turn.effects.rolls },
        diagnostics: turn.diagnostics, leaks: turn.leaks }],
      totals: { costUsd: turn.costUsd, committed: 1, failed: 0, leaks: turn.leaks.length },
    };
    const file = join(args.out, `${scene}-${randomBytes(3).toString("hex")}.json`);
    await writeFile(file, `${JSON.stringify(sample, null, 2)}\n`, "utf8");
    index.push({ scene, file: file.replace(`${ROOT}/`, "") });
    written++;
  }
}
await writeFile(join(args.out, "README.md"), `# DM architecture bake-off — blind samples

One file per scene × variant of \`docs/stages/DM_ARCH.md\`: the same saved state before the turn for every variant, one
turn each, the player's input and the full narration as the player saw it (the writer's ledger is never in a sample).
The file name carries no hint of the variant; the variant (writer, bookkeeper, effort), the timings, the tokens, the
cost and the accepted records are inside each file, so the planner can build the owner's blind page and reveal the
letters afterwards. ${written} samples over ${new Set(index.map((row) => row.scene)).size} scenes. Rebuilt by
\`node scripts/eval/dm-arch/samples.mjs\` from the records in \`docs/runs/dmarch-*.jsonl\`.
`, "utf8");
console.log(`${written} sample(s) written to ${args.out.replace(`${ROOT}/`, "")}`);
