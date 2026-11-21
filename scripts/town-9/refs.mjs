#!/usr/bin/env node
// TOWN_9: the reference rows — TOWN_5's sol-nonotice (TOWN_2's sol-hall to c24, no hand after) and TOWN_5's week (c1–48;
// fresh, no purpose, no shed) beside the TOWN_9 worlds: per day, what the town did with its institutions and its pen.
// Mechanical counts only; the aims are the recorded goal checks. Writes docs/runs/town-9-worlds/reference-rows.md.
//   node scripts/town-9/refs.mjs
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { synchronyOf } from "../town-5/control.mjs";
import { ACT_TOOLS_9, ACT_WORDS_9 } from "./coding.mjs";
import { SHED_TOOL_NAMES } from "./shed.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gz = (f) => JSON.parse(gunzipSync(readFileSync(f)));
const json = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

function aimsOf(dir, cycle) {
  const f = [join(dir, `goal-check-c${cycle}.json`), join(dir, "goal-check.json")].find((x) => existsSync(x) && (json(x)?.cycle ?? 24) === cycle);
  const g = f ? json(f) : null;
  if (!g) return "–";
  const aims = g.aims?.length ? g.aims : [{ aim: g.aim, count: g.count }];
  return aims.map((a) => `«${a.aim}» (${a.count ?? "?"})`).join("; ");
}

function row(label, dir, from, to, { aimsDir = dir, world = null } = {}) {
  const w = world ?? gz(join(dir, "world.json.gz"));
  const s = w.state, ids = new Set(s.citizens);
  const ev = w.log.filter((e) => e.round >= from && e.round <= to && ids.has(e.agent) && e.ok);
  const count = (t) => ev.filter((e) => e.tool === t).length;
  const sync = synchronyOf(w, { from, to, actTools: ACT_TOOLS_9, actWords: ACT_WORDS_9 }).filter((r) => r.all);
  const words = ev.filter((e) => e.tool === "write_diary").reduce((n, e) => n + String(e.args.text).split(/\s+/).length, 0);
  const shed = ev.filter((e) => SHED_TOOL_NAMES.includes(e.tool)).length;
  const props = s.proposals.filter((p) => p.round >= from && p.round <= to);
  return `| ${label} | ${from}–${to} | ${props.length} (${props.filter((p) => p.status === "passed").length} passed; ${props.filter((p) => p.kind === "open_tool").length} to open a tool) | ${count("vote")} | ${count("post")} | ${count("write_diary")} (${words} words) | ${count("say")} | ${shed} | ${count("outside")} / ${count("object")} / ${count("leave")} | ${sync.length} | ${aimsOf(aimsDir, to)} |`;
}

const L = ["Mechanical counts per day (citizens' successful calls), and the aims of the recorded goal checks. sol-nonotice's day 1 is TOWN_2's sol-hall (scarcity on, no notice in day 1); the week is TOWN_5's fresh Sol town (scarcity off), its first two days; neither had a shed or a purpose sentence. The «all» column counts cycles where every turn did the same act (the shed's acts included).", "",
  "| world | cycles | proposals | votes | posts | diary entries | says | shed calls | outside() / object() / leave() | «all» cycles | the aim(s) of the day's goal check (citizens naming it) |", "|---|---|---|---|---|---|---|---|---|---|---|"];
const t5 = join(ROOT, "docs/runs/town-5-worlds");
const solHall = join(ROOT, "docs/runs/town-2-worlds/sol-hall");
const nonotice = gz(join(t5, "sol-nonotice", "world.json.gz"));
L.push(row("TOWN_5 sol-nonotice (day 1 = TOWN_2 sol-hall)", null, 1, 24, { world: nonotice, aimsDir: solHall }), row("TOWN_5 sol-nonotice", null, 25, 48, { world: nonotice, aimsDir: join(t5, "sol-nonotice") }));
const week = gz(join(t5, "sol-week", "world.json.gz"));
L.push(row("TOWN_5 sol-week", null, 1, 24, { world: week, aimsDir: join(t5, "sol-week") }), row("TOWN_5 sol-week", null, 25, 48, { world: week, aimsDir: join(t5, "sol-week") }));
const t9 = join(ROOT, "docs/runs/town-9-worlds");
for (const name of ["sol-shed", "sol-purpose", "sol-client", "haiku-purpose"]) {
  const dir = join(t9, name);
  if (!existsSync(join(dir, "world.json.gz"))) continue;
  L.push(row(`**TOWN_9 ${name}**`, dir, 1, 24), row(`**TOWN_9 ${name}**`, dir, 25, 48));
}
writeFileSync(join(t9, "reference-rows.md"), `${L.join("\n")}\n`);
console.log(L.join("\n"));
