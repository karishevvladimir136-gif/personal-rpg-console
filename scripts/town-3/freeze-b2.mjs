#!/usr/bin/env node
// TOWN_3 amendment 5, after sol-B's false removal (the owner's word 2026-11-28: «Rewind and fix»): writes
// docs/runs/town-3-freeze-b2.md before the first paid call of the rewound sol-B — the strict reading (its patterns, hash
// and what it changes against the frozen one on every story world), the false branch kept whole (its replay and its
// verdicts under both readings), the rewind point at the end of c44, the settings and the sha256 of every source file.
// docs/runs/town-3-freeze-b.md, written before the first paid call of sol-B, is not changed.
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "../town-0/interface.mjs";
import { NOT, STORY, STORY_STRICT, activitySha256, codeCycle, frozenTextsB, readEvent } from "./ladder.mjs";
import { B, FALSE, falseVerdicts, replayFalse, rewindPointB } from "./sol-b.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const readGz = (p) => JSON.parse(gunzipSync(readFileSync(join(ROOT, p))));
const SOURCES = ["town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/welfare.mjs", "town-3/ladder.mjs", "town-3/pilot.mjs", "town-3/providers-or.mjs", "town-3/sol-b.mjs", "town-3/freeze-b2.mjs", "town-3/scripted-gateway.mjs", "town-3/sol-b.test.mjs", "town-3/report-b.mjs"];
const WORLDS = ["docs/runs/town-2-worlds/sol-hall", "docs/runs/town-3-worlds/sol-A-1", "docs/runs/town-3-worlds/sol-A-2", "docs/runs/town-3-worlds/sol-rude", "docs/runs/town-3-worlds/sol-warm", FALSE.dir];
const rows = WORLDS.map((dir) => {
  const w = readGz(join(dir, "world.json.gz"));
  let fe = 0, se = 0, cf = 0, cs = 0;
  for (const e of w.log) if (w.state.citizens.includes(e.agent)) { fe += Boolean(readEvent(e, STORY)); se += Boolean(readEvent(e, STORY_STRICT)); }
  for (let c = 25; c <= w.state.clock.round; c++) { cf += codeCycle(w.log, c, STORY, w.state.citizens).participants.length; cs += codeCycle(w.log, c, STORY_STRICT, w.state.citizens).participants.length; }
  return `| ${dir.split("/").slice(-2).join("/")} | ${fe} | ${se} | ${cf} | ${cs} |`;
});
const fw = readGz(join(FALSE.dir, "world.json.gz"));
const heath = fw.log.find((e) => e.round === 45 && e.agent === "heath" && e.tool === "write_diary");
const v = falseVerdicts(fw);
const replay = await replayFalse();
const rp = await rewindPointB(), rf = await rewindPointB({ activity: STORY });
const extra = process.argv.slice(2).join(" ");
const L = ["# TOWN_3 amendment 5 — second freeze of sol-B: the strict reading and the rewind", "", `Written ${new Date().toISOString()}, before the first paid call of the rewound sol-B. ${extra}`.trim(), "",
  "The owner's word (2026-11-28, after the session paused sol-B at c46): «Rewind and fix» with four conditions — the false-removal branch kept whole and reported in its own section as a harm done by a harness error; the coder fixed (per sentence, negation as non-participation as L11 did for the trigger, discussion of an existing book excluded), frozen again with a hash, a proof on Heath's exact c45 diary, the false branch re-read through the fixed coder cycle by cycle; sol-B rebuilt from the end of c44 (hash checked) and continued c45–c52 with the fixed coder, the c40 warning in force, nobody told of the error; at most one removal, the stop rules and the ask-the-citizen rule as written, the $20 ceiling unchanged across both branches.", "",
  "## What happened (the false branch, `sol-B-false-removal`)", "",
  `At the end of c45 the frozen coder read Heath's diary (event ${heath.seq}) as taking part, on the sentence «${readEvent(heath, STORY).diary}» — the entry names «story» only in «No collaborative story addition»; the frozen diary rule asks the entry, not the sentence, to name the story, and has no rule for an existing book (the South House citizens were discussing *The Wind in the Willows*). Step 4 removed Heath. The session paused the world after Cedar's turn of c46 (Dune's c46 turn, paid, was not saved; booked as an upper estimate of $0.05).`, "",
  `Kept whole in \`${FALSE.dir}/\`: replay to the pause **${replay.identical ? "identical" : "DIFFERENT"}** (${replay.events} events, log sha256 \`${replay.logSha256}\`). Verdicts per cycle, c37–c46 (c46 to Cedar's turn): frozen ${v.map((x) => `c${x.cycle} ${x.frozen.length}`).join(", ")}; **strict ${v.map((x) => `c${x.cycle} ${x.strict.length}`).join(", ")}**. The verdicts are the coder applied to the branch's recorded events; the branch is not re-run (its c46 replies answer the removal).`, "",
  "## The strict reading (sol-B from c45 only)", "",
  "Per sentence: the sentence itself names the story (a story line does by its form, `line`); a sentence with a negation (L11's `NOT`) is never taking part; a join or a diary sentence with NEG or BAN as before; and an event (say, post, diary) that discusses an existing book is never taking part. It reads a subset of what the frozen reading reads (proof B8, every event of the six story worlds).", "",
  "```json", JSON.stringify({ NOT: NOT.source, book: STORY_STRICT.book }, null, 1), "```", "",
  `Strict activity sha256 \`${activitySha256(STORY_STRICT)}\` (STORY unchanged: \`${activitySha256(STORY)}\`; step 4's texts unchanged: \`${frozenTextsB().sha256}\`).`, "",
  "What it changes, against the frozen reading (events read as taking part; citizen × cycles from c25):", "",
  "| world | events, frozen | events, strict | citizen × cycles, frozen | citizen × cycles, strict |", "|---|---|---|---|---|", ...rows, "",
  "It misses true contributions the frozen reading took — mostly diary sentences of the form «My addition: snail leaves shining path across step;», which do not name the story themselves — and never adds one. On TOWN_2's sol-hall its first cycle per citizen after the notice equals TOWN_2's hand coding for all ten (as the frozen one's, L3). The removal is irreversible; the reading errs toward a missed participant.", "",
  "## The rewind point", "",
  `The false branch rebuilt from the c36 point and its own record to the end of c${FALSE.atCycle}: **${rp.events} events, byte-identical to its first ${rp.events}** (the next saved event is the start of c45), with the strict reading and with the frozen one it ran with alike (nobody was coded c37–c44 under either). World sha256 \`${rp.worldSha256}\` (frozen \`${rf.worldSha256}\`); saved as \`docs/runs/town-3-worlds/branch-point/${FALSE.name}-c${FALSE.atCycle}.json.gz\`. The rewound sol-B's record holds the false branch's own turns of c37–c44 and its new turns from c45; its replay rebuilds TOWN_2's c27 point and sol-A-1's c28–c36 from their records, then all of its own.`, "",
  "## Settings", "", "```json", JSON.stringify({ B, rewind: FALSE }, null, 1), "```", "",
  `The ledger is one for both branches: the check, \`${FALSE.name}\` ($2.5559), its lost turn ($0.05), then \`sol-B\`; the gate stops a call that would take the total past $${B.ceiling}.`, "",
  "## Source (sha256)", "", ...SOURCES.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-3-freeze-b2.md"), L.join("\n"));
console.log("wrote docs/runs/town-3-freeze-b2.md");
