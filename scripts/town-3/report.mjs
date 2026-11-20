#!/usr/bin/env node
// TOWN_3: the mechanical parts of docs/runs/town-3-report.md, from the world folders (analyse.mjs) — tables of the
// worlds, the ladder, per-citizen participation and the step at which it stopped, latencies, new-action candidates,
// door and voice, welfare, costs, replay, the after-answers. The session's reading (the nine outcomes, Astra's three
// features, the quotes chosen) is written in `docs/runs/town-3-worlds/reading.json` and merged here; every quote in it is
// checked verbatim against the world.
//   node scripts/town-3/report.mjs > docs/runs/town-3-report.parts.md
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WORLDS, FAMILIES } from "./families.mjs";
import { analyse, load } from "./analyse.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "docs", "runs", "town-3-worlds");
const one = (t, n = 400) => { const s = String(t ?? "").replace(/\s*\n\s*/g, " ⏎ "); return s.length > n ? `${s.slice(0, n)}…` : s; };
const q = (t, n = 600) => `«${one(t, n)}»`;
const usd = (x, d = 2) => (x === null || x === undefined ? "–" : `$${x.toFixed(d)}`);

/** Every quote in the reading: {name, cycle, source, text} must be a substring of that citizen's text at that cycle. */
export function checkQuotes(w, reading) {
  const s = w.world.state;
  const byName = Object.fromEntries(s.citizens.map((c) => [s.agents[c].name, c]));
  const texts = (name, cycle, source) => {
    const c = byName[name];
    if (source === "diary") return s.diaries[c].filter((e) => e.round === cycle).map((e) => e.text);
    if (source === "after") return [w.record.agents[c].after?.text ?? ""];
    return w.world.log.filter((e) => e.agent === c && e.round === cycle && e.tool === source && e.args && typeof e.args === "object").map((e) => String(e.args.text ?? e.args.reason ?? ""));
  };
  const walk = function* (x) { if (Array.isArray(x)) for (const v of x) yield* walk(v); else if (x && typeof x === "object") { if (["name", "cycle", "source", "text"].every((k) => k in x)) yield x; for (const v of Object.values(x)) yield* walk(v); } };
  let n = 0;
  for (const qt of walk(reading)) { if (!texts(qt.name, qt.cycle, qt.source).some((t) => t.includes(qt.text))) throw new Error(`${w.name}: not verbatim: ${JSON.stringify(qt)}`); n++; }
  return n;
}

export function reportParts() {
  const done = WORLDS.filter((x) => existsSync(join(OUT, x.name, "summary.json")));
  const ws = done.map((x) => ({ spec: x, w: load(x.name) })).map((o) => ({ ...o, a: analyse(o.w) }));
  const refs = ["ref:sol-hall", "ref:sol-screen"].map((n) => { const w = load(n); return { w, a: analyse(w) }; });
  const L = [];
  L.push("## The worlds", "", "| world | start | family | first word | scarcity | cycles | goal check (c24) | notice | trigger (passed) | steps reached (cycle) | closed | fines | exits | refusals | flags | ledger | replay |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const { spec, w, a } of ws) {
    const g = a.goal ? (a.goal.met ? `met — «${a.goal.aim}»` : "not met") : "– (inherited: «collaboratively telling a story», met c24 in TOWN_2)";
    L.push(`| ${spec.name} | ${a.start === "branch" ? `**branch** of TOWN_2 sol-hall after c${w.record.branch.atCycle}` : "fresh"} | ${FAMILIES[spec.families[0]].label} | ${spec.tone ?? "– (silent)"} | ${a.scarcity ? "on" : "off"} | ${a.cycles}${a.stopped ? ` (stopped: ${a.stopped})` : ""} | ${g} | ${a.notice ? `c${a.notice}` : "–"} | ${a.trigger ? `${a.trigger.proposal} (c${a.trigger.passed})` : spec.ladder ? "none passed" : "– (no ladder)"} | ${a.steps.map((x) => `${x.step} (c${x.cycle})`).join(", ") || "–"} | ${a.closed.join(", ") || "–"} | ${a.fines.total ? `${a.fines.total} cr in ${a.fines.events}` : "–"} | ${Object.values(a.perCitizen).filter((p) => p.exit).map((p) => `${p.name} ${p.exit.kind} c${p.exit.round}`).join(", ") || "none"} | ${a.refusals.length} | ${a.welfare.flags.length} | ${usd(a.ledgerUsd)} | ${a.replay?.identical ? "identical" : a.replay?.prefixIdentical ? "prefix identical" : "**different**"} |`);
  }
  for (const { w, a } of refs) L.push(`| *${w.name.slice(4)}* (TOWN_2, reference: the silent operator) | fresh | GPT-6.1 Sol | – (silent) | on | 48 | met — «${w.record.notice.aim}» | c25 | ${w.world.state.proposals.find((p) => p.status === "passed")?.id} (c${w.world.state.proposals.find((p) => p.status === "passed")?.closed.round}) | – | – | – | none | 0 | 0 | ${usd(a.ledgerUsd)} | identical |`);
  L.push("");
  for (const { spec, w, a } of [...ws, ...refs.map((r) => ({ spec: { name: r.w.name }, ...r }))]) {
    L.push(`<details><summary>${spec.name}: the coder per citizen and cycle (l story line / j join / d diary; . none)${a.start === "branch" ? `; cycles 1–${w.record.branch.atCycle} are the shared history` : ""}</summary>`, "", "```text", `           ${Array.from({ length: a.cycles }, (_, i) => String((i + 1) % 10)).join("")}`,
      ...Object.values(a.perCitizen).map((p) => `${p.name.padEnd(10)} ${p.marks ?? "(no activity fixed)"}`), "```", "",
      "| citizen | cycles taking part before c25 | after the notice | first after the notice | last | participation stopped | fined (credits) |", "|---|---|---|---|---|---|---|",
      ...Object.values(a.perCitizen).map((p) => `| ${p.name} | ${p.before} | ${p.afterNotice} | ${p.firstAfterNotice ? `c${p.firstAfterNotice}` : "–"} | ${p.last ? `c${p.last}` : "–"} | ${p.stopped} | ${p.fined || "–"} |`), "", "</details>", "");
  }
  L.push("### Latency from each operator text to the first collective act after it", "", "| world | operator text (cycle) | first proposal | first post | first object() |", "|---|---|---|---|---|");
  const cell = (x) => (x ? `c${x.cycle} (+${x.latency}) ${x.who}` : "–");
  for (const { spec, a } of [...ws, ...refs.map((r) => ({ spec: { name: `*${r.w.name.slice(4)}*` }, a: r.a }))]) for (const l of a.latency) L.push(`| ${spec.name} | ${q(l.text, 90)} (c${l.cycle}) | ${cell(l.proposal)} | ${cell(l.post)} | ${cell(l.objection)} |`);
  L.push("");
  L.push("### Door, voice, welfare, costs", "", "| world | leave() | object() | door mentioned | hall reads | welfare checks | referee | flags | not checked | ledger | calls | replay log sha256 |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const { spec, a } of ws) L.push(`| ${spec.name} | ${a.leaves.length} | ${a.objectCalls} | ${a.door.length} | ${a.hallReads} | ${a.welfare.checks} | ${a.welfare.referee} | ${a.welfare.flags.length} | ${a.welfare.notChecked} | ${usd(a.ledgerUsd, 2)} | ${a.calls} | \`${a.replay?.logSha256?.slice(0, 16)}…\` |`);
  L.push("");
  for (const { spec, w } of ws) {
    L.push(`<details><summary>${spec.name}: the after-answers (c48)</summary>`, "");
    for (const id of w.world.state.citizens) { const x = w.record.agents[id].after; L.push(`**${w.world.state.agents[id].name}**: ${x?.asked ? q(x.text || x.refused || x.error, 4000) : `not asked (${x?.why ?? "–"})`}`, ""); }
    L.push("</details>", "");
  }
  return { markdown: L.join("\n"), worlds: ws.map((o) => o.a), refs: refs.map((r) => r.a) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(reportParts().markdown);
