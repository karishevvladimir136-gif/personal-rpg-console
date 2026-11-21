#!/usr/bin/env node
// TOWN_9: a glance at a running world's live save (no network; reads .town-9-work/live/<world>/world.json).
//   node scripts/town-9/peek.mjs <world> [--texts]
import { readFileSync } from "node:fs";
const [name, flag] = process.argv.slice(2);
const w = JSON.parse(readFileSync(`.town-9-work/live/${name}/world.json`, "utf8"));
const s = w.state, nm = (id) => s.agents[id]?.name ?? id;
console.log(`${name}: cycle ${s.clock.round}, events ${w.log.length}; open: ${Object.entries(s.shed.open).filter(([, o]) => o).map(([t, o]) => `${t}@${o.place}`).join(", ") || "none"}; sealed ${JSON.stringify(s.shed.sealed)}`);
for (const p of s.proposals) console.log(`  ${p.id} c${p.round} ${nm(p.by)} ${p.kind}${p.tool ? ` ${p.tool}@${p.place}` : ""} ${p.status}${p.closed ? ` ${p.closed.for}-${p.closed.against}/${p.closed.electorate} c${p.closed.round}` : ` (${Object.keys(p.votes).length} voted)`}: ${String(p.text ?? "").slice(0, 140)}`);
const sh = s.shed;
console.log(`  tray ${sh.tray.length}, wishes ${sh.wishes.length}, archive ${sh.archive.length}, articles ${sh.articles.length}, structures ${sh.structures.length}, signs ${sh.signs.length}, posts ${s.press.length}, crafted ${sh.crafted.length}, letters ${sh.letters.length}, broadcasts ${sh.broadcasts.length}, notes ${sh.notes.length}${sh.visitor ? `, client acks ${sh.visitor.acks.length}` : ""}`);
if (flag === "--texts") {
  for (const x of sh.wishes) console.log(`  WISH c${x.round} ${nm(x.by)}: ${x.name} — ${x.description}`);
  for (const x of sh.tray) console.log(`  TRAY c${x.round} ${nm(x.by)}: ${x.text.slice(0, 300)}`);
  for (const x of sh.structures) console.log(`  BUILD c${x.round} ${nm(x.by)} @${x.place}: ${x.name}`);
  for (const x of s.press) console.log(`  POST ${x.n} c${x.round} ${nm(x.by)}: ${x.text.slice(0, 200)}`);
}
