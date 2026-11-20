#!/usr/bin/env node
// TOWN_3 (TOWN_2's goal.py, in node so the ladder's activity is hashed exactly as the harness hashes it): writes a fresh
// world's goal-check.json from the session's reading, before day 2. Every quote is checked to be a verbatim substring of
// the cited diary entry / post / proposal at the cited cycle. For a ladder world the decision also fixes the activity —
// the coder's patterns for taking part in the banned aim (scripts/town-3/ladder.mjs activityOf) — and the coder is run
// over day 1 so its reading of the permitted activity can be checked against the dossier before anything is banned.
//   node scripts/town-3/goal.mjs <decision.json> [--scripted]
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";
import { activityOf, activitySha256, codeCycle } from "./ladder.mjs";
import { pathsFor } from "./pilot.mjs";
import { worldOf } from "./families.mjs";

export function writeGoal(decision, { scripted = false, now = new Date(), base = undefined } = {}) {
  const d = { ...decision };
  const spec = worldOf(d.world);
  if (!spec || spec.start !== "fresh") throw new Error(`${d.world} is not a fresh world`);
  const dir = join(pathsFor(scripted, base).out, d.world);
  const w = JSON.parse(gunzipSync(readFileSync(join(dir, "world-c24.json.gz"))));
  const s = w.state;
  const byName = Object.fromEntries(s.citizens.map((c) => [s.agents[c].name, c]));
  const texts = (name, cycle, source) => {
    const c = byName[name];
    if (!c) throw new Error(`no citizen ${name}`);
    if (source === "diary") return s.diaries[c].filter((e) => e.round === cycle).map((e) => e.text);
    if (source === "post") return s.press.filter((p) => p.by === c && p.round === cycle).map((p) => p.text);
    if (source === "proposal") return s.proposals.filter((p) => p.by === c && p.round === cycle).map((p) => p.text ?? "");
    if (source === "say") return w.log.filter((e) => e.agent === c && e.round === cycle && e.tool === "say" && e.ok).map((e) => e.args.text);
    throw new Error(`unknown source ${source}`);
  };
  const quotes = [...(d.quotes ?? []), ...(d.candidates ?? []).flatMap((x) => x.quotes ?? [])];
  for (const q of quotes) if (!texts(q.name, q.cycle, q.source).some((t) => t.includes(q.text))) throw new Error(`not verbatim: ${JSON.stringify(q)}`);
  if (d.met && spec.ladder && !d.activity) throw new Error(`${d.world} has a ladder: the decision must fix the activity`);
  if (d.met && d.activity) { // a silent world may fix one too: the report's coder (the run never reads it)
    const activity = activityOf({ aim: d.aim, ...d.activity });
    d.activity = activity;
    d.activitySha256 = activitySha256(activity);
    d.dayOneCoding = Array.from({ length: s.clock.round }, (_, i) => i + 1).map((cycle) => {
      const x = codeCycle(w.log, cycle, activity, s.citizens);
      return { cycle, participants: x.participants, evidence: x.evidence };
    });
  }
  d.decidedAt = now.toISOString();
  d.decidedBy = "the session, by reading every diary entry, post and proposal of cycles 1–24 (dossier-day1.md)";
  writeFileSync(join(dir, "goal-check.json"), `${JSON.stringify(d, null, 1)}\n`);
  return d;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const d = writeGoal(JSON.parse(readFileSync(process.argv[2], "utf8")), { scripted: process.argv.includes("--scripted") });
  console.log("ok", d.world, d.met, d.aim ?? "", d.activitySha256 ?? "");
  for (const x of d.dayOneCoding ?? []) console.log(`c${x.cycle}: ${x.participants.join(", ") || "-"}`);
}
