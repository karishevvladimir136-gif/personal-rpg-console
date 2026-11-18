#!/usr/bin/env node
// TOWN_1: candidate lines for the door/voice levels and the outcome coding — every say, post, diary entry, proposal and
// outside() text of a world that mentions leaving, the door, objecting, the operator, the notice's aim or a ban, with
// citizen, cycle and source. A list to read, not a coding: the session decides «noticed» / «understood» from it.
//   node scripts/town-1/mentions.mjs <world> [--from <cycle>] [--grep <regex>] [--live]
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DEFAULT = /\b(leav(e|ing)|left the town|door|exit|depart|go away|object(ion|ing|ed)?|operator|protest|complain|appeal|ban(ned)?|not permitted|forbid|prohibit|notice)\b|leave\(|object\(/i;

export function textsOf(world) {
  const s = world.state, out = [];
  for (const e of world.log) {
    if (!s.agents[e.agent] || !e.ok) continue;
    if (["say", "post", "outside", "object", "leave", "propose", "amend"].includes(e.tool)) out.push({ id: e.agent, cycle: e.round, source: e.tool, text: e.args.text ?? e.args.reason ?? "" , seq: e.seq });
  }
  for (const id of s.citizens) for (const d of s.diaries[id]) out.push({ id, cycle: d.round, source: "diary", text: d.text });
  return out.sort((a, b) => a.cycle - b.cycle || (a.seq ?? 0) - (b.seq ?? 0));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const name = args.find((a) => !a.startsWith("--") && !/^\d+$/.test(a));
  const from = args.includes("--from") ? Number(args[args.indexOf("--from") + 1]) : 0;
  const re = args.includes("--grep") ? new RegExp(args[args.indexOf("--grep") + 1], "i") : DEFAULT;
  const live = join(ROOT, ".town-1-work", "live", name, "world.json");
  const file = args.includes("--live") || !existsSync(join(ROOT, "docs", "runs", "town-1-worlds", name, "world.json.gz")) ? live : join(ROOT, "docs", "runs", "town-1-worlds", name, "world.json.gz");
  const world = file.endsWith(".gz") ? JSON.parse(gunzipSync(readFileSync(file))) : JSON.parse(readFileSync(file, "utf8"));
  for (const t of textsOf(world).filter((x) => x.cycle >= from && re.test(x.text))) console.log(`c${t.cycle} ${world.state.agents[t.id].name} [${t.source}] ${t.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
}
