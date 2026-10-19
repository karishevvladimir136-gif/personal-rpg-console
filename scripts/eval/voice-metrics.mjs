// Voice stage part 6: the voice metrics per variant over any set of samples.
//   node scripts/eval/voice-metrics.mjs <sample dir | sample.json | run.jsonl> [...] [--by voice|variant|file] [--json]
// Samples: the blind JSON files of a replay or the bake-off (docs/samples/…; the variant inside each
// file — its `voice` label when the replay ran with --voice, else its id). Runs: a bench record
// (docs/runs/*.jsonl, one `turn` row per turn; the variant is the run's model/writer label). The
// quotable flags come from a sample turn's `quotable.flags` (the replay tool writes them) or a
// turn record's `quotable`. Prints a markdown table; --json prints the numbers.
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { voiceMetrics, voiceMetricsTable } from "./lib/voice-metrics.mjs";

const args = { paths: [], by: "voice", json: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === "--by") args.by = process.argv[++i];
  else if (flag === "--json") args.json = true;
  else args.paths.push(flag);
}
if (!args.paths.length) throw new Error("give sample directories, sample files or run records");
if (!["voice", "variant", "file"].includes(args.by)) throw new Error("--by must be voice, variant or file");

async function files(path) {
  const info = await stat(path);
  if (info.isDirectory()) return (await readdir(path)).filter((name) => name.endsWith(".json") || name.endsWith(".jsonl")).map((name) => join(path, name));
  return [path];
}

/** One row per turn: {variant, narration, flags|undefined, names}. */
async function turnsOf(file) {
  const text = await readFile(file, "utf8");
  if (file.endsWith(".jsonl")) {
    const rows = text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const run = rows.find((row) => row.type === "run") ?? {};
    const label = run.writer ? `${run.writer}${run.bookkeeper ? `+${run.bookkeeper}` : ""}` : run.model ?? "run";
    return rows.filter((row) => row.type === "turn" && row.narration).map((row) => ({
      variant: args.by === "file" ? file : label, narration: row.narration, flags: row.quotable?.flags,
      names: [...(row.party ?? []).map((p) => (typeof p === "string" ? p : p?.name)), ...(row.partyNames ?? [])].filter((name) => typeof name === "string") }));
  }
  const sample = JSON.parse(text);
  const variant = args.by === "file" ? file : args.by === "voice" ? `${sample.variant?.voice ?? "live"} · ${sample.variant?.id ?? "?"}` : sample.variant?.id ?? "?";
  return (sample.turns ?? []).filter((turn) => turn.narration).map((turn) => ({ variant, narration: turn.narration, flags: turn.quotable?.flags, names: sample.names ?? [] }));
}

const all = [];
for (const path of args.paths) for (const file of await files(path)) all.push(...await turnsOf(file));
if (!all.length) throw new Error("no turn with a narration found");
// Names for the per-character phrases: the attributions themselves name the people; collect capitalised words
// that follow an attribution verb as candidates («сказал Фрол», «говорит Марта»), plus any names the samples carry.
const names = new Set(all.flatMap((turn) => turn.names).filter((name) => typeof name === "string"));
for (const turn of all) for (const m of turn.narration.matchAll(/(?:сказал[аи]?|говорит|цедит|бросает|отвечает|буркнул[аи]?|кивает|усмехается|says|said)\s+([А-ЯЁA-Z]\p{L}+)/gu)) names.add(m[1]);
const groups = new Map();
for (const turn of all) (groups.get(turn.variant) ?? groups.set(turn.variant, []).get(turn.variant)).push(turn);
const rows = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([variant, turns]) => ({ variant, metrics: voiceMetrics(turns, [...names]) }));
if (args.json) console.log(JSON.stringify(rows, null, 2));
else console.log(voiceMetricsTable(rows));
