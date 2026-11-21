#!/usr/bin/env node
// TOWN_10: the reference rows beside the market (the stage: «TOWN_8's four worlds (scarcity without a product and without
// take) and TOWN_5's sol-week (no scarcity)») — the same counts over c1–48 (or what a reference world has published), read
// from their world files at $0: TOWN_5's sol-week from this branch; TOWN_8's worlds from origin/claude/town-8 as fetched.
// Writes docs/runs/town-10-worlds/reference.json ({ at, sources, rows, lines }).
//   node scripts/town-10/reference.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const git = (...a) => execFileSync("git", ["-C", ROOT, ...a], { maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "ignore"] });
const fromGit = (ref, path) => { try { return git("show", `${ref}:${path}`); } catch { return null; } };
const list = (ref, path) => { try { return String(git("ls-tree", "--name-only", `${ref}:${path}`)).trim().split("\n").filter(Boolean); } catch { return []; } };

/** The counts of one world over c1..upTo. */
export function counts(world, upTo = 48) {
  const s = world.state, ids = s.citizens, log = world.log.filter((e) => e.round >= 1 && e.round <= upTo);
  const ok = (tool, pred = () => true) => log.filter((e) => e.ok && ids.includes(e.agent) && e.tool === tool && pred(e)).length;
  const last = Math.min(upTo, s.clock.round);
  const en = {}; for (const c of ids) en[c] = 100;
  let minAt = null;
  for (const e of world.log) { if (e.round > last) break; for (const d of e.delta ?? []) { const m = /^agents\.([^.]+)\.energy$/.exec(d.path); if (m && m[1] in en) en[m[1]] = d.to; } }
  const staying = ids.filter((c) => !(s.agents[c].exit && s.agents[c].exit.round <= last));
  minAt = staying.length ? Math.min(...staying.map((c) => en[c])) : "– (all gone)";
  const props = s.proposals.filter((p) => p.round <= last);
  return { cycles: last, takes: ok("take"), takesTried: log.filter((e) => ids.includes(e.agent) && e.tool === "take").length, giveCredits: ok("give", (e) => e.args?.credits !== undefined), giveEnergy: ok("give", (e) => e.args?.energy !== undefined),
    work: ok("work"), shifts: ok("work", (e) => e.shift !== undefined), eats: ok("eat"), feeds: ok("feed"), proposals: props.length, passed: props.filter((p) => p.status === "passed").length,
    posts: ok("post"), objections: ok("object"), leaves: ok("leave"), minEnergyAtEnd: minAt, bankAtEnd: null };
}

function row(label, world, upTo, note) {
  const c = counts(world, upTo);
  return { label, ...c, note };
}

const rows = [];
const sources = [];
// TOWN_5's sol-week (this branch): c1–48
{
  const f = join(ROOT, "docs/runs/town-5-worlds/sol-week/world.json.gz");
  const w = JSON.parse(gunzipSync(readFileSync(f)));
  const g24 = JSON.parse(readFileSync(join(ROOT, "docs/runs/town-5-worlds/sol-week/goal-check-c24.json"), "utf8"));
  const g48 = JSON.parse(readFileSync(join(ROOT, "docs/runs/town-5-worlds/sol-week/goal-check-c48.json"), "utf8"));
  rows.push(row("TOWN_5 sol-week (no scarcity; rest +30; wage 5; take() and Article 3 as TOWN_0's)", w, 48, `aim c24 «${g24.aim}»; c48 «${g48.aim}»`));
  sources.push("docs/runs/town-5-worlds/sol-week/world.json.gz (this branch)");
}
// TOWN_8's worlds (origin/claude/town-8 as fetched): the whole world if published, else the latest world-cNN
const ref = "origin/claude/town-8";
let head = null; try { head = String(git("rev-parse", "--short", ref)).trim(); } catch { /* not fetched */ }
for (const name of ["sol-known", "sol-unknown", "haiku-known", "deepseek-known"]) {
  if (!head) break;
  const files = list(ref, `docs/runs/town-8-worlds/${name}`);
  const pick = files.includes("world.json.gz") ? "world.json.gz" : files.filter((f) => /^world-c\d+\.json\.gz$/.test(f)).sort((a, b) => Number(/\d+/.exec(b)) - Number(/\d+/.exec(a)))[0];
  if (!pick) { rows.push({ label: `TOWN_8 ${name}`, note: `not yet published on ${ref} (${head})` }); continue; }
  const w = JSON.parse(gunzipSync(fromGit(ref, `docs/runs/town-8-worlds/${name}/${pick}`)));
  const g = fromGit(ref, `docs/runs/town-8-worlds/${name}/goal-check-c24.json`);
  const sum = fromGit(ref, `docs/runs/town-8-worlds/${name}/summary.json`);
  const sj = sum ? JSON.parse(String(sum)) : null;
  rows.push(row(`TOWN_8 ${name} (the squeeze: rest 0, turn 5, the three-person shift, rations at the market; TOWN_0's take() of credits or items)`, w, 48,
    `${pick} at ${ref} ${head}${g ? `; aim c24 «${JSON.parse(String(g)).aim}»` : ""}${sj?.notice ? `; notice c${sj.notice.cycle}` : w.log.some((e) => e.tool === "notice") ? "; the notice at c25" : ""}${sj?.ended ? `; ended ${sj.ended.by} c${sj.ended.at}` : ""}`));
  sources.push(`${ref} ${head} docs/runs/town-8-worlds/${name}/${pick}`);
}
const fmt = (r) => (r.cycles === undefined ? `| ${r.label} | – | ${r.note} |` : `| ${r.label} | ${r.cycles} | ${r.takes} / ${r.takesTried} | ${r.work} | ${r.eats} / ${r.feeds} | ${r.giveCredits} / ${r.giveEnergy} | ${r.proposals} (${r.passed} passed) | ${r.posts} | ${r.objections} | ${r.leaves} | ${r.minEnergyAtEnd} | ${r.note} |`);
const lines = ["The same counts over c1–48 (or as far as a reference world is published), from the world files. take() is TOWN_0's (a citizen in the same place, «without asking», beside Article 3) in TOWN_5 and TOWN_8; TOWN_10's market rows are above.", "",
  "| world | cycles | takes made / tried | work (all shifts) | eat / feed | give credits / energy | proposals | posts | objections | leave | lowest energy at the end | note |", "|---|---|---|---|---|---|---|---|---|---|---|---|", ...rows.map(fmt)];
writeFileSync(join(ROOT, "docs/runs/town-10-worlds/reference.json"), `${JSON.stringify({ at: new Date().toISOString(), sources, rows, lines }, null, 1)}\n`);
console.log(lines.join("\n"));
