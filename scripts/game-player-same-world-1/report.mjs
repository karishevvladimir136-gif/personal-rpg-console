// Game player same-world 1: the transcripts (the frozen layer's hash in every header) and the report, as markdown, from
// this stage's run records, the frozen world, group 2's records, the ledgers and the spend checks.
import { relative } from "node:path";
import { PLAYERS } from "../game-player-1/players.mjs";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { fence } from "../game-player-1/report.mjs";
import {
  AMENDMENTS, CAPS, DEEPSEEK, DESIGN_SHA256, FAMILIES, GROUP2_PROMPT_SHA256, ORDER, OWNER_BETS, PREREGISTRATION, PROMPT_SHA256, READINGS, STAGE_SOURCE, SUPERSEDED, TABLES, TURNS, promptSha256,
} from "./frozen.mjs";
import { rowOf as group2RowOf } from "../game-player-replicate-1/score.mjs";
import { familyOf, rowOf, seatOf, verdictsW } from "./score.mjs";
import { layerFile } from "./world.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const DOORS = { anthropic: "Claude Console", openrouter: "OpenRouter", openai: "OpenAI" };
const LABEL = (name) => (name === "deepseek" ? DEEPSEEK.label : PLAYERS[name]?.label ?? (name === "haiku" ? "Claude Haiku 5.5 (the dry run's player)" : name));
const yesNo = (v) => (v === null || v === undefined ? "not testable yet" : v ? "**held**" : "**lost**");
const cell = (x, n = 2) => (x === null || x === undefined || !Number.isFinite(x) ? "–" : String(Math.round(x * 10 ** n) / 10 ** n));
const usd = (x) => `$${(x ?? 0).toFixed(2)}`;
const order = (key) => { const i = ORDER.findIndex((s) => s.key === key); return i < 0 ? 999 : i; };
const rel = (dir) => { const r = relative(ROOT, dir); return r.startsWith("..") ? `(a temporary folder outside the repository: ${dir.split("/").pop()})` : r; };

// ---- the transcript ------------------------------------------------------------------------------------------------------

/** One session as the player saw it, with the frozen world named in its header (the layer's hash; its text is not here),
 * and DeepSeek's provider reasoning field after each of its messages, marked as never relayed. */
export function transcriptOf(session, { dir, haiku = false } = {}) {
  const prep = session.campaign?.prep ?? {};
  const dm = haiku ? "Claude Haiku 5.5 in place of every Claude model (the paid dry run: each Claude request's model swapped to Haiku before it was sent), with the owner's settings otherwise"
    : `Claude Opus 5.5 with the owner's settings (${OWNER_SETTINGS.split ? "Opus writes — Opus records" : "single"}, depth ${OWNER_SETTINGS.depth.min} → ${OWNER_SETTINGS.depth.max})`;
  const lines = [`# ${session.key} — ${LABEL(session.player)} at Table ${session.table}`, "",
    `Synthetic content: an invented hero in an invented campaign (docs/campaigns/baldurs-gate-en). The DM: ${dm}. Started ${session.startedAt}; ended by ${session.ended?.reason ?? "?"} after ${session.turns?.length ?? 0} turn(s)${session.ended?.detail ? ` (${session.ended.detail})` : ""}.`, "",
    `**The frozen world (${STAGE_SOURCE.split(" (")[0]}):** Table ${session.table}'s hidden layer, prepared once before any player${prep.preparedBy ? ` by ${prep.preparedBy}` : ""}${prep.preparedAt ? ` at ${prep.preparedAt}` : ""} — sha256 \`${prep.layerSha256 ?? "?"}\` (\`${dir ? `${rel(dir)}/` : ""}${layerFile(session.table)}\`, ${prep.chars ?? "?"} characters, ${prep.threads ?? "?"} threads). The session started from the world's snapshot (sha256 \`${prep.snapshotSha256 ?? "?"}\`: the same wizard, sheet and opening for every session at this table) with that layer written into the DM's private notes. The layer's text is DM-private and is not in this file.`, "",
    "The hero's sheet carries no alignment line (the first group without it).", "",
    "Each «Screen» block is what the player was shown (the system prompt with the files stands before it); each «Player» block is the player's message as written.", ""];
  const screens = session.screens ?? [], messages = session.messages ?? [];
  for (let i = 0; i < screens.length; i++) {
    lines.push(`### Screen ${i + 1}`, "", fence(screens[i]), "");
    if (messages[i]) {
      lines.push(`**Player** (${messages[i].purpose}):`, "", fence(messages[i].text), "");
      if (messages[i].providerReasoning) lines.push("*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the judges or anyone):", "", fence(messages[i].providerReasoning), "");
    }
  }
  const flagged = (session.welfare ?? []).filter((w) => w.verdict?.distress);
  lines.push("---", "", `Welfare checks: ${(session.welfare ?? []).length}; flagged: ${flagged.length ? flagged.map((w) => w.what).join(", ") : "none"}.`, "");
  return lines.join("\n");
}
/** The header alone (the first lines before the first screen). */
export const transcriptHeader = (session, opts) => transcriptOf(session, opts).split("\n### Screen 1")[0].trim();

// ---- the frozen world ---------------------------------------------------------------------------------------------------

export function frozenSection(frozen, dir) {
  if (!frozen) return ["## The frozen world", "", "_Not prepared yet._", ""].join("\n");
  const { manifest, files } = frozen;
  return ["## The frozen world", "", `Prepared ${manifest.builtAt}${manifest.by ? ` by ${manifest.by}` : ""}. Snapshot \`${rel(dir)}/${manifest.snapshot.file}\` (${(manifest.snapshot.bytes / 1e6).toFixed(1)} MB, sha256 \`${manifest.snapshot.sha256}\`): both tables' campaigns after the wizard and the opening, before any prep.`, "",
    ...TABLES.filter((t) => files[t]).flatMap((t) => {
      const f = files[t], m = manifest.tables[t];
      return [`### Table ${t}`, "", `DM-only file \`${rel(dir)}/${layerFile(t)}\` (readable: \`${t}-dm-only.md\`) — sha256 \`${f.sha256}\`; the layer ${f.layer.length} characters, ${f.writes.length} writes into the DM's notes, ${f.threads.length} threads.${m.alignmentRemoved?.length ? ` The review cut ${m.alignmentRemoved.length} alignment mention(s) the draft wrote: ${m.alignmentRemoved.map((x) => `«${x}»`).join("; ")}.` : " The drafted sheet named no alignment."}`, "",
        "| Thread | Kind | What |", "| --- | --- | --- |", ...f.threads.map((x) => `| ${x.id} | ${x.kind} | ${x.text.replace(/\|/g, "/").slice(0, 220)}${x.text.length > 220 ? "…" : ""} |`), ""];
    })].join("\n");
}

/** What this group holds constant that groups 1 and 2 did not (the owner, 2026-10-27, on the go). */
function designSection() {
  return ["## What is held constant", "",
    "- **The same opening for every player at a table.** The freeze keeps the wizard's whole campaign — the hero's sheet as drafted, the opening scene, the people in it — with the hidden layer, because the layer names the opening's people. This is the first group where every player at a table starts from the same opening (groups 1 and 2 drew a fresh wizard, opening and layer every session), so W1 and W2 are the clean test by design: whatever differs between two sessions at a table is the player's or the DM's improvisation in play, never the DM's preparation.",
    "- **No alignment line** on the sheet (the owner, 2026-10-26); nothing in its place.",
    "- **No bonds.** The stage speaks of «the three bonds» on the sheet; the hero file (`docs/campaigns/baldurs-gate-en/05_hero_warlock_5.md`) has none, and nothing was added (the owner, 2026-10-27).",
    "- **DeepSeek's reasoning field** (`providerReasoning`, `notRelayed: true`) is stored on every DeepSeek message record, as SOLITUDE_1 did (REPLICATE did not request it). It is never relayed: the DM gets the visible text only, the judges read the visible text only, and only this stage's transcripts print it.",
    "- **The owner's bets on W1–W5:** none (blank).", ""].join("\n");
}

function promptSection() {
  return ["## The player's prompt", "", "REPLICATE_1's text (game player 1's), with the hero's alignment cut from the files — «Alignment: chaotic good.» from «Who are you?» and «Chaotic good.» from the background; nothing in their place. Everything else byte for byte.", "",
    "| Table | sha256 now | group 2's | frozen |", "| --- | --- | --- | --- |",
    ...TABLES.map((t) => `| ${t} | \`${promptSha256(t)}\` | \`${GROUP2_PROMPT_SHA256[t]}\` | ${promptSha256(t) === PROMPT_SHA256[t] ? "yes" : "**no**"} |`), "",
    `DeepSeek: REPLICATE's seat (${DEEPSEEK.upstream.name} ${DEEPSEEK.upstream.tag} through OpenRouter, effort medium) with the provider's reasoning field stored (\`reasoning.exclude: false\`), printed in its transcripts under «Provider reasoning field, not relayed», never sent on.`, ""].join("\n");
}
function preregistrationSection() {
  return [PREREGISTRATION, "", `### How each line is read (frozen before the first paid call, design sha256 \`${SUPERSEDED.sha256}\`, commit ${SUPERSEDED.commit}; with the amendment below, \`${DESIGN_SHA256}\`)`, "", ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), "",
    "### Amendments after the freeze", "", ...AMENDMENTS.map((a) => `- **${a.at}, ${a.by}.** ${a.what} *Why:* ${a.why}`), "",
    `The owner's bets on W1–W5: ${Object.values(OWNER_BETS).every((x) => x === null) ? "none given before the first paid call (blank, as the stage says)." : Object.entries(OWNER_BETS).map(([k, v]) => `${k} ${v ?? "–"}`).join(", ")}`, ""].join("\n");
}

// ---- the report ----------------------------------------------------------------------------------------------------------

export function reportMarkdown({ combined = { sessions: [] }, ledgers = {}, spend = [], frozen = null, final = { roads: {}, group2World: {} }, group2 = [], dir } = {}) {
  const sessions = [...combined.sessions].sort((a, b) => order(a.key) - order(b.key));
  const rows = sessions.map((s) => rowOf(s));
  const g2rows = group2.map((s) => ({ ...group2RowOf(s), family: s.player, prepared: final.group2World?.[s.key]?.final?.prepared ?? null }));
  const same = (a, b) => { const r = final.roads?.[`${a}|${b}`] ?? final.roads?.[`${b}|${a}`]; const v = r?.final?.same; return v === 1 ? true : v === 0 ? false : null; };
  const threads = Object.fromEntries(TABLES.map((t) => [t, (frozen?.files?.[t]?.threads ?? []).map((x) => x.id)]));
  const v = verdictsW({ rows, group2: g2rows, threads, same });
  const money = Object.entries(ledgers).map(([d, l]) => ({ door: d, spent: l.spentUsd, cap: CAPS[d] ?? l.capUsd }));
  const out = [`# Game player same-world 1 — one hidden layer per table, frozen`, "",
    `Stage: \`docs/stages/GAME_PLAYER_SAME_WORLD_1.md\` (${STAGE_SOURCE.split(" (")[0]}). Branch \`claude/game-player-same-world-1\` from \`origin/claude/fix-s4-run-1-apsty3\` (11w, 11w′, the letter fix) with 11w″ and REPLICATE_1's harness merged. Sessions finished: ${rows.length} of ${ORDER.length}. ${TURNS} turns each.`, "",
    combined.summary ? `## In short\n\n${combined.summary}\n` : null,
    "## W1–W5", "", "| Line | Result | The reading |", "| --- | --- | --- |",
    `| W1 nearest neighbour | ${yesNo(v.W1.holds)} | ${v.W1.cells.map((c) => `${c.table}: ${c.statistic ?? "–"} of 5 (p ${c.p ?? "–"})`).join("; ")}; both tables p ${v.W1.both.p ?? "–"} |`,
    `| W2 roads | ${yesNo(v.W2.holds)} | ${v.W2.cells.map((c) => (c.judged ? `${c.table}: ${c.distinct ?? "–"} distinct of 5 first sessions, ${c.changed.length} famil${c.changed.length === 1 ? "y" : "ies"} changed road` : `${c.table}: the same-road pairs are not judged yet`)).join("; ")} |`,
    `| W3 the layer's reach | ${yesNo(v.W3.holds)} | ${v.W3.cells.map((c) => `${c.table}: every share < 0.50 ${c.below === undefined ? "–" : c.below ? "yes" : "no"}, untouched overlap ${c.observed ?? "–"} (p ${c.p ?? "–"})`).join("; ")} |`,
    `| W4 DeepSeek to turn 20 | ${yesNo(v.W4.holds)} | ${v.W4.toTwenty} of ${v.W4.sessions.length} (${v.W4.sessions.map((s) => `${s.key} ${s.ended ?? "?"}${s.ended !== "turns" && s.at ? ` at ${s.at}` : ""}`).join(", ") || "–"}) |`,
    `| W5 no alignment | ${yesNo(v.W5.holds)} | ${v.W5.families} of 5 families within 20 % of group 2 on do share and words per action |`, "",
    "## The twenty sessions", "",
    "| Session | Turns | Ended | Do share | Tests / action | Words / action | Rerolls | Declines | Made | «?» | Refused | Prose at card | Threads touched | World prepared |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.key} | ${r.turns} | ${r.ended}${r.ended !== "turns" ? ` at ${r.endedAt}` : ""} | ${cell(r.doShare)} | ${cell(r.testsPerAction)} | ${cell(r.wordsPerAction, 0)} | ${r.rerollCount} | ${r.declineCount} | ${r.made} | ${r.questions} | ${r.harness.swallowed} | ${r.harness.prose} | ${r.touched ? `${r.touched.length}/${threads[r.table].length}${r.unknownThreads ? ` (${r.unknownThreads} unknown)` : ""}` : "–"} | ${r.prepared === null ? "–" : r.prepared ? "yes" : "no"} |`), "",
    "## Thread overlap against the frozen layer (W3)", "",
    ...TABLES.flatMap((t) => {
      const at = rows.filter((r) => r.table === t), ids = threads[t], c = v.W3.cells.find((x) => x.table === t);
      if (!ids.length || !at.length) return [`Table ${t}: –`, ""];
      return [`### Table ${t}`, "", `| Thread | ${at.map((r) => r.key.slice(2)).join(" | ")} | Sessions |`, `| --- | ${at.map(() => "---").join(" | ")} | --- |`,
        ...ids.map((id) => `| ${id} | ${at.map((r) => (r.touched === null ? "?" : r.touched.includes(id) ? "✓" : "")).join(" | ")} | ${at.filter((r) => r.touched?.includes(id)).length} |`), "",
        `Share touched: ${(c.shares ?? []).map((s) => `${s.key.slice(2)} ${s.share}`).join(", ") || "–"}. Untouched overlap (mean Jaccard, pairs of different families): ${c.observed ?? "–"}, p ${c.p ?? "–"} against random deals. Never touched: ${c.neverTouched?.length ? c.neverTouched.join(", ") : "none"}.`, ""];
    }),
    "## Road codes (W2)", "",
    ...TABLES.flatMap((t) => [`### Table ${t}`, "", ...rows.filter((r) => r.table === t).map((r) => `- **${r.key}**: ${r.road.line}`), "",
      `Same road (judged pairs): ${Object.entries(final.roads ?? {}).filter(([id]) => id.startsWith(`${t}-`)).map(([id, r]) => `${id.replace(/\|/, " ~ ").replace(new RegExp(`${t}-`, "g"), "")} ${r?.final?.same === 1 ? "same" : r?.final?.same === 0 ? "different" : "?"}`).join("; ") || "not judged yet"}. Families that changed road: ${v.W2.cells.find((c) => c.table === t).changed.join(", ") || "none"}.`, ""]),
    "## Nearest neighbour, with the exact permutation test (W1)", "",
    ...v.W1.cells.flatMap((c) => [`**Table ${c.table}** — counts kept: ${c.kept?.join(", ") ?? "–"}. ${(c.families ?? []).map((f) => `${f.family}: second's nearest ${f.nearest ? f.nearest.slice(2) : "–"}${f.holds ? " ✓" : ""}`).join("; ") || "–"}. Statistic ${c.statistic ?? "–"} of 5; p = ${c.p ?? "–"} (exact, 30 240 deals).`, ""]),
    `Both tables: summed statistic ${v.W1.both.statistic ?? "–"} of 10, p = ${v.W1.both.p ?? "–"}.`, "",
    "## W5 against group 2", "", "| Family | A do share (then → now) | A words / action | B do share | B words / action | Within |", "| --- | --- | --- | --- | --- | --- |",
    ...v.W5.rows.map((r) => `| ${LABEL(r.family)} | ${r.cells.map((c) => `${cell(c.then, c.measure === "wordsPerAction" ? 0 : 2)} → ${cell(c.now, c.measure === "wordsPerAction" ? 0 : 2)}${c.within === false ? " ✗" : ""}`).join(" | ")} | ${r.holds === null ? "–" : r.holds ? "yes" : "no"} |`), "",
    "## What the frozen layer cost in play", "",
    ...v.world.map((w) => `- Table ${w.table}: world read as prepared in ${w.now ? `${w.now.prepared} of ${w.now.of}` : "–"} sessions now, ${w.group2 ? `${w.group2.prepared} of ${w.group2.of}` : "–"} in group 2 (blind, the DM's replies only).`), "",
    "## Counted: refused presses, prose at a card, closures", "",
    `Refused while a card waited: ${v.counted.swallowed}. Prose at a card relayed as the player's proposal (11w″): ${v.counted.prose}. Closed «stuck»: ${v.counted.stuck.join(", ") || "none"}.${v.counted.swallowed || v.counted.stuck.length ? " Each non-zero is a FIX_S4 item." : ""}`, "",
    "## Money by door", "", "| Door | Spent | Cap |", "| --- | --- | --- |", ...money.map((m) => `| ${DOORS[m.door] ?? m.door} | ${usd(m.spent)} | ${usd(m.cap)} |`), "",
    spend.length ? `Spend checks: ${spend.length}; the last (${spend.at(-1).when}, ${spend.at(-1).at}): OpenRouter account $${spend.at(-1).openrouter.totalUsage ?? "?"} used of $${spend.at(-1).openrouter.totalCredits ?? "?"} (left $${spend.at(-1).openrouter.remaining ?? "?"}).` : null, "",
    designSection(), frozenSection(frozen, dir), promptSection(), preregistrationSection(),
    "## Transcripts", "", `\`docs/runs/game-player-same-world-1-transcripts/\` — one file per session; each header names its table's frozen layer by hash.`, ""];
  return out.filter((x) => x !== null).join("\n");
}

// ---- the dry runs -----------------------------------------------------------------------------------------------------------

export function dryRunMarkdown(runRecord, ledgers, { dir } = {}) {
  const s = runRecord.sessions.filter((x) => x.turns);
  return ["# Game player same-world 1 — the scripted dry run (no paid call, no key)", "", `Design sha256 \`${DESIGN_SHA256}\`. The freeze (the wizard for both tables on one local database, the snapshot, one scripted prep per table, the DM-only files) and one session per table from the frozen world, on scripted providers.`, "",
    ...s.map((x) => `- ${x.key}: ${x.turns.length} turn(s), ended by ${x.ended?.reason}; layer sha256 \`${x.campaign?.prep?.layerSha256 ?? "?"}\`; note ${x.note?.text ? "recorded" : x.note?.why ?? "–"}; prose at a card ${x.proseAtCard ?? 0}; refused ${x.swallowed ?? 0}.`), "",
    `Scripted calls metered: ${Object.entries(ledgers).map(([d, l]) => `${DOORS[d] ?? d} ${l.calls.length}`).join(", ")}.`, "",
    ...s.slice(0, 1).map((x) => ["## One header", "", transcriptHeader(x, { dir })].join("\n"))].join("\n");
}

export function haikuMarkdown({ combined = { sessions: [] }, ledgers = {}, frozen = null, dir } = {}) {
  const sessions = [...combined.sessions].sort((a, b) => a.key.localeCompare(b.key));
  return ["# Game player same-world 1 — the dry run on Haiku", "",
    "The whole pipeline once, cheaply, before the first paid call of the run: the freeze (the wizard for both tables, the snapshot, one prep per table, the DM-only files) and one short session per table started from the frozen world, every Claude call sent as Claude Haiku 5.5 (the request's model swapped before it was sent; the ledger books what was sent), the player Claude Haiku 5.5. Nothing here is a result: the run's world is prepared again, by the owner's DM, at the start of the paid run.", "",
    ...sessions.map((s) => `- **${s.key}**: ${s.turns.length} turn(s), ended by ${s.ended?.reason}${s.ended?.detail ? ` (${s.ended.detail})` : ""}; prose at a card ${s.proseAtCard ?? 0}; refused ${s.swallowed ?? 0}; overlap ${s.tags?.sameWorld?.overlap ? "tagged" : "–"}; road: ${s.tags?.sameWorld?.road?.line ?? "–"}.`), "",
    "## Money", "", ...Object.entries(ledgers).map(([d, l]) => `- ${DOORS[d] ?? d}: ${usd(l.spentUsd)} (${l.calls.length} calls)`), "",
    frozenSection(frozen, dir),
    ...sessions.flatMap((s) => [`## ${s.key}: the transcript header`, "", transcriptHeader(s, { dir, haiku: true }), ""]),
    `Transcripts: \`docs/runs/game-player-same-world-1-haiku-transcripts/\`.`, ""].join("\n");
}

export { FAMILIES, familyOf, seatOf };
