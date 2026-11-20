#!/usr/bin/env node
// TOWN_3: the coder's audit — say/post lines after the notice that the coder did not read as taking part but that carry
// story-like features (quoted speech, a narrative opener, story words, the story's own characters). The session reads
// each and keeps the ones that are taking part (reading.json `added`); nothing here changes a run.
//   node scripts/town-3/misses.mjs <world> [from-cycle]
import { analyse, load, activityFor } from "./analyse.mjs";
import { codeCycle } from "./ladder.mjs";
const w = load(process.argv[2]);
const s = w.world.state, act = activityFor(w), from = Number(process.argv[3] ?? (w.record.notice?.cycle ?? 25));
const FEATURES = /(?:[,?!][’'”"]\s*(?:said|asked)\b)|\b(?:said|asked) (?:the|a|her|his) \w+|[‘“][A-Z]|\bonce upon|\bin (?:our|the) (?:\w+ )?story|→|\b(?:a (?:small|little|short) (?:story|tale|one)|share a (?:little |small )?story|add (?:a|one|another) line)\b/i;
for (let c = from; c <= s.clock.round; c++) {
  const coded = act ? codeCycle(w.world.log, c, act, s.citizens) : { participants: [] };
  for (const e of w.world.log) if (e.round === c && s.agents[e.agent] && e.ok && (e.tool === "say" || e.tool === "post") && !coded.participants.includes(e.agent) && FEATURES.test(e.args.text ?? ""))
    console.log(`${c} ${s.agents[e.agent].name.padEnd(8)} ${e.tool} | ${String(e.args.text).replace(/\s*\n\s*/g, " ⏎ ").slice(0, 260)}`);
}
