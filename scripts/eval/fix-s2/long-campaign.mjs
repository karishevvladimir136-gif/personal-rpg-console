// Fix run A2: a synthetic long campaign (45 turns by default) for the cost measurements — the Russian harbour
// world of the replay scenario, played on PGlite with scripted answers that grow the dossier the way session 2
// did (lib/campaign.mjs). The state before each turn is saved exactly as the app saves it at a commit, so the
// replay tool (and the cache simulator) can play any of them. Nothing paid, nothing of the owner's.
//   node scripts/eval/fix-s2/long-campaign.mjs --out scripts/eval/out/long-campaign-a.json --turns 45 --seed a
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ROOT } from "../real-replay/lib/ledger.mjs";
import { buildLongCampaign } from "./lib/campaign.mjs";

const args = { out: join(ROOT, "scripts", "eval", "out", "long-campaign-a.json"), turns: 45, seed: "a" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--seed") args.seed = value();
  else throw new Error(`unknown argument ${flag}`);
}
const built = await buildLongCampaign({ turns: args.turns, seed: args.seed });
await built.c.f.db.close();
await mkdir(dirname(args.out), { recursive: true });
await writeFile(args.out, JSON.stringify({ campaignId: built.rows[0]?.payload.input.campaignId ?? "synthetic", title: built.title, snapshots: built.rows }), "utf8");
console.log(`${built.rows.length} snapshot(s) of the long synthetic campaign (seed ${args.seed}) written to ${args.out.replace(`${ROOT}/`, "")}`);
