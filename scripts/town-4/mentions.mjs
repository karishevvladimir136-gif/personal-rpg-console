#!/usr/bin/env node
// TOWN_4 (from TOWN_2): candidate lines to read — every say, post, diary entry, proposal, objection and outside() text of a
// world that matches a pattern, with citizen, cycle and source. Default: the chain — a line that names the square or a
// gathering AND rations, energy, food or the workshop. A list to read, not a coding: the session decides «noticed» /
// «understood» from it, quoting verbatim (coding.py checks every quote).
//   node scripts/town-4/mentions.mjs <world> [--from <cycle>] [--to <cycle>] [--grep <regex>] [--live] [--who <name>]
import { existsSync, readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { textsOf } from "../town-2/mentions.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SQUARE = /\b(square|gather(ing|ings|ed)?|music|songs?|stor(y|ies)|company|festival|concert|perform)/i;
export const FOOD = /\b(ration|rations|energy|food|eat(ing)?|hungry|hunger|starv|workshop|shifts?|stock|market)\b/i;
export const chain = (t) => SQUARE.test(t) && FOOD.test(t);

export function loadFor(name, { live = false } = {}) {
  const gz = join(ROOT, "docs", "runs", "town-4-worlds", name, "world.json.gz");
  const file = live || !existsSync(gz) ? join(ROOT, ".town-4-work", "live", name, "world.json") : gz;
  return file.endsWith(".gz") ? JSON.parse(gunzipSync(readFileSync(file))) : JSON.parse(readFileSync(file, "utf8"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const name = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
  const from = Number(opt("--from", 0)), to = Number(opt("--to", 1e9));
  const who = opt("--who", null);
  const re = args.includes("--grep") ? new RegExp(opt("--grep"), "i") : null;
  const world = loadFor(name, { live: args.includes("--live") });
  for (const t of textsOf(world).filter((x) => x.cycle >= from && x.cycle <= to && (re ? re.test(x.text) : chain(x.text)) && (!who || world.state.agents[x.id].name === who)))
    console.log(`c${t.cycle} ${world.state.agents[t.id].name} [${t.source}] ${t.text.replace(/\s*\n\s*/g, " ⏎ ")}`);
}
