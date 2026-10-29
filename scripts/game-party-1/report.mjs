import { createHash } from "node:crypto";
// Game party 1: the transcripts (one per player, one per table), the three screens of a round side by side (markdown
// and a page), and the dry run's page — from the run records. The frozen layer is named by its hash only; its text is
// DM-private and never printed here. DeepSeek's provider reasoning field is printed after its message, marked as never
// relayed.
import { fence } from "../game-player-1/report.mjs";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { AMENDMENTS, CARD_WAIT_BEFORE, CARD_WAIT_SHA256, CAPS, DESIGN_SHA256, DOOR_LINES, DOOR_NOTES, HERO_CONDITION, ORDER, PREREGISTRATION, REPLAY, ROSTER, STAGE_SOURCE, doorOf, promptSha256 } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";

const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const LABEL = (name) => (name === "haiku" ? "Claude Haiku 5.5 (the dry run's player)" : ROSTER[name]?.label ?? name);
const dmLine = (run) => (run.haiku ? "Claude Haiku 5.5 in place of every Claude model (the paid dry run: each Claude request's model swapped to Haiku before it was sent — the DM, its relay, the checks), with the owner's settings otherwise"
  : run.dry ? "the scripted DM of the mocked host (no model)" : `Claude Opus 5.5 with the owner's settings (${OWNER_SETTINGS.split ? "Opus writes — Opus records" : "single"}, depth ${OWNER_SETTINGS.depth.min} → ${OWNER_SETTINGS.depth.max}); the relay: the same model at medium`);
const ended = (t) => `${t?.ended?.reason ?? "?"}${t?.ended?.detail ? ` (${t.ended.detail})` : ""}`;

function header(run, title) {
  const t = run.table ?? {};
  const prep = t.campaign?.prep ?? {};
  return [`# ${title}`, "",
    `Synthetic content: invented characters in an invented campaign (Table C's Beregost files, docs/campaigns/baldurs-gate-en). Stage ${STAGE_SOURCE}; design sha256 \`${run.design ?? DESIGN_SHA256}\`.`, "",
    `Arm **P-${run.arm}**, triad ${run.triad}; ${t.rounds?.length ?? 0} round(s) of ${run.rounds}; ended by ${ended(t)}. The DM: ${dmLine(run)}. Started ${run.startedAt}.`, "",
    `Seats: ${CHARACTERS.map((c, i) => `${c.seat}. ${c.name} (${c.cls}) — ${LABEL(run.seats?.[i])}`).join("; ")}. The players are not told what the others are.`, "",
    `Known condition: ${HERO_CONDITION}`, "",
    prep.frozen ? `**The frozen layer:** P-${run.arm}'s hidden layer, prepared once before any table${prep.preparedBy ? ` by ${prep.preparedBy}` : ""} — sha256 \`${prep.layerSha256}\` (${prep.chars} characters, ${prep.threads} threads), written into the DM's private notes before the first round. Its text is DM-private and is not in this file.`
      : "**No hidden layer:** P-SAND plays pure simulation (no prep).", "",
    `The world's snapshot: sha256 \`${prep.snapshotSha256 ?? "?"}\` (the same wizard, sheets and opening for both triads).`, ""].join("\n");
}

/** One player's transcript: every screen that player was shown and every message it wrote, in order. */
export function playerTranscript(run, seat) {
  const c = CHARACTERS.find((x) => x.id === seat.characterId);
  const lines = [header(run, `${run.key} — ${c.name}'s player: ${LABEL(seat.player)}`),
    `The player's system prompt: \`playerSystem("${run.arm}", "${c.id}", "${run.door ?? doorOf(run.key)}")\` in scripts/game-party-1/frozen.mjs, sha256 \`${promptSha256(run.arm, c.id, run.door ?? doorOf(run.key))}\` (the files, then the table's rules; door line ${run.door ?? doorOf(run.key)}). ${seat.left ? `Left the table: ${seat.left.why} at round ${seat.left.round}.${DOOR_NOTES[run.key]?.[seat.character] ? ` Tagged by the owner: ${DOOR_NOTES[run.key][seat.character].note}.` : ""}` : "At the table to the end."}`, "",
    "Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.", ""];
  const screens = seat.screens ?? [], messages = seat.messages ?? [];
  for (let i = 0; i < screens.length; i++) {
    lines.push(`### Screen ${i + 1} · ${screens[i].purpose}`, "", fence(screens[i].text), "");
    const m = messages[i];
    if (m) {
      lines.push(`**Player** (${m.purpose}):`, "", fence(m.text), "");
      if (m.providerReasoning) lines.push("*Provider reasoning field, not relayed* (stored as the provider returned it; never sent to the DM, the other players, the judges or anyone):", "", fence(m.providerReasoning), "");
    }
  }
  const after = (seat.after ?? []).filter((a) => a.asked && a.text);
  if (after.length) lines.push("## After the table (recorded, not relayed)", "", ...after.flatMap((a) => [`**${a.question}**`, "", fence(a.text), ""]));
  return lines.join("\n");
}

/** The table's transcript: each scene of each round as the DM had it — what it was sent, what it narrated, the cards,
 * the out-of-game questions, the relay's screens and groups. */
export function tableTranscript(run) {
  const t = run.table ?? {};
  const lines = [header(run, `${run.key} — the table`)];
  if (t.opening) {
    lines.push("## The opening", "", "**The DM's opening (as committed by the wizard):**", "", fence(t.opening.narration), "");
    for (const [name, text] of Object.entries(t.opening.relay?.screens ?? {})) lines.push(`**${name}'s screen:**`, "", fence(text), "");
  }
  for (const round of t.rounds ?? []) {
    lines.push(`## Round ${round.n}`, "");
    for (const scene of round.scenes) {
      lines.push(`### Scene: ${scene.members.join(", ")} (order: ${scene.order.join(", ")})`, "");
      for (const q of scene.questions ?? []) lines.push(`**${q.name}, out of game:** ${q.text.replace(/\n+/g, " ")}`, "", `**The DM, to ${q.name.split(" ")[0]} only:** ${q.reply ?? `(${q.status})`}`, "");
      for (const st of scene.strays ?? []) lines.push(`*${st.name} pressed ${st.press ? `[${st.press}] with text` : "a button"} with no card of theirs waiting — ${st.refused ? "refused on screen" : "the text kept as the message"}.*`, "");
      if (scene.input) lines.push("**What the DM was sent:**", "", fence(scene.input), "");
      for (const card of scene.cards ?? []) lines.push(`**Card** · ${card.actor} · ${card.title} · ${card.phase ?? ""}${card.auto ? ` · settled without a player: ${card.auto}` : ""}${card.presses?.length ? ` · presses: ${card.presses.map((p) => p.button ? `[${p.button}]` : p.question ? "«?»" : p.prose ? "prose" : p.swallowed ? "refused" : p.door ? "[END]" : "text").join(", ")}` : ""}`, "");
      if (scene.narration) lines.push("**The DM's narration:**", "", fence(scene.narration), "");
      if (scene.rolls?.length) lines.push(`Rolls: ${scene.rolls.map((r) => `${r.actor} ${r.reason ?? r.kind} ${r.total}${r.dc ? ` vs ${r.dc}` : ""} ${r.success === null ? "" : r.success ? "success" : "failure"}`).join("; ")}`, "");
      for (const [name, text] of Object.entries(scene.relay?.screens ?? {})) lines.push(`**${name}'s screen (the relay):**`, "", fence(text || "(nothing)"), "");
      if (scene.relay) lines.push(`Together after: ${(scene.relay.together ?? []).map((g) => `[${g.join(", ")}]`).join(" ")}${scene.relay.fallback ? " · the relay fell back to the narration as written" : ""}`, "");
      if (scene.failure) lines.push(`**The turn failed:** ${scene.failure}`, "");
    }
  }
  lines.push("---", "", `Ended by ${ended(t)}. Counts: ${Object.entries(t.counts ?? {}).filter(([k]) => k !== "words").map(([k, v]) => `${k} ${v}`).join(", ")}. Words: ${Object.entries(t.counts?.words ?? {}).map(([k, v]) => `${k} ${v}`).join(", ")}.`, "",
    `Welfare checks: ${(t.welfare ?? []).length}; flagged: ${(t.welfare ?? []).filter((w) => w.verdict?.distress).map((w) => `${w.seat} ${w.what}`).join(", ") || "none"}.`, "",
    `Leak check (Q0, runs of ${t.leaks?.shingle ?? 8} words): ${t.leaks?.hits?.length ? t.leaks.hits.map((h) => `${h.reader} ← ${h.owner} (${h.kind}): «${h.run}»`).join("; ") : "no hit"}.`, "");
  return lines.join("\n");
}

/** Each round's screens, one column per player: what each player read before writing that round's message. */
export function roundColumns(run) {
  const seats = run.table?.seats ?? [];
  const rounds = new Map();
  for (const seat of seats) for (let i = 0; i < (seat.screens ?? []).length; i++) {
    const screen = seat.screens[i];
    const m = /^player r(\d+)/.exec(screen.purpose ?? "");
    if (!m) continue;
    const n = Number(m[1]);
    if (!rounds.has(n)) rounds.set(n, Object.fromEntries(seats.map((s) => [s.character, []])));
    rounds.get(n)[seat.character].push({ screen: screen.text, purpose: screen.purpose, message: seat.messages?.[i]?.text ?? null });
  }
  return [...rounds.entries()].sort((a, b) => a[0] - b[0]).map(([n, cols]) => ({ n, cols }));
}

export function roundSideBySide(run) {
  const seats = run.table?.seats ?? [];
  const lines = [header(run, `${run.key} — the three screens of each round, side by side`),
    "Each column is one player: the screen(s) it read in that round and what it wrote. The same round of the same table, three viewpoints.", ""];
  for (const { n, cols } of roundColumns(run)) {
    lines.push(`## Round ${n}`, "");
    for (const seat of seats) {
      lines.push(`### ${seat.character} — ${LABEL(seat.player)}`, "");
      for (const x of cols[seat.character]) lines.push(fence(x.screen), "", `**Wrote** (${x.purpose}):`, "", fence(x.message ?? "(no message)"), "");
    }
  }
  return lines.join("\n");
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** The same, as a page with three columns. */
export function sideBySideHtml(run) {
  const seats = run.table?.seats ?? [];
  const rounds = roundColumns(run);
  const col = (seat, items) => `<section class="col"><h3>${esc(seat.character)}<span>${esc(LABEL(seat.player))}</span></h3>${items.map((x) => `<div class="screen"><div class="label">Screen · ${esc(x.purpose)}</div><pre>${esc(x.screen)}</pre></div><div class="wrote"><div class="label">Wrote</div><pre>${esc(x.message ?? "(no message)")}</pre></div>`).join("") || "<p class=\"none\">(not asked this round)</p>"}</section>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Party Round Screens</title>
<style>
:root{--bg:#f6f3ee;--fg:#1f1b16;--muted:#6b6257;--card:#fffdf9;--line:#e2d9cc;--accent:#8a5a1f;--wrote:#f3ead9}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#17140f;--fg:#ece5da;--muted:#a59a8b;--card:#211c16;--line:#3a3128;--accent:#d3a25c;--wrote:#2b2319}}
:root[data-theme="dark"]{--bg:#17140f;--fg:#ece5da;--muted:#a59a8b;--card:#211c16;--line:#3a3128;--accent:#d3a25c;--wrote:#2b2319}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 Georgia,serif}
main{max-width:1500px;margin:0 auto;padding:24px 16px}
h1{font-size:22px;margin:0 0 6px} .meta{color:var(--muted);font-size:13px;margin:0 0 18px}
h2{font-size:18px;border-bottom:1px solid var(--line);padding-bottom:4px;margin:28px 0 12px;color:var(--accent)}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
@media (max-width:900px){.row{grid-template-columns:1fr}}
.col{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px;min-width:0}
h3{font-size:15px;margin:0 0 8px} h3 span{display:block;font-weight:normal;color:var(--muted);font-size:12px}
pre{white-space:pre-wrap;word-wrap:break-word;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;margin:0}
.label{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 4px}
.wrote{background:var(--wrote);border-radius:6px;padding:6px 8px;margin-top:6px} .none{color:var(--muted)}
</style></head><body><main>
<h1>${esc(run.key)} — the three screens of each round</h1>
<p class="meta">P-${esc(run.arm)} · ${esc(run.table?.rounds?.length ?? 0)} round(s) · ended by ${esc(ended(run.table))} · the DM: ${esc(dmLine(run))}. Synthetic content (invented characters and campaign). Each column is one player's own screen and message.</p>
${rounds.map(({ n, cols }) => `<h2>Round ${n}</h2><div class="row">${seats.map((s) => col(s, cols[s.character])).join("")}</div>`).join("\n")}
</main></body></html>
`;
}

/** The dry run's page (the mocked host): what was checked, the counts, the transcripts' place. */
export function dryRunMarkdown(run, { dir } = {}) {
  const t = run.table ?? {};
  return [`# Game party 1 — the dry run on the mocked host`, "",
    `Design sha256 \`${run.design}\`. No key, no network: every provider is the scripted host (scripts/game-party-1/scripted.mjs). The freeze (the three arms' campaigns, then the two layers) into a temporary folder (${dir ? dir.split("/").pop() : "?"}), then one P-SAND table of ${run.rounds} round(s).`, "",
    `Ended by ${ended(t)} after ${t.rounds?.length ?? 0} round(s). Counts: ${Object.entries(t.counts ?? {}).filter(([k]) => k !== "words").map(([k, v]) => `${k} ${v}`).join(", ")}.`, "",
    `Seats: ${(t.seats ?? []).map((s) => `${s.character} (${s.player})${s.left ? ` — left: ${s.left.why} at round ${s.left.round}` : ""}`).join("; ")}.`, "",
    `Leak check: ${t.leaks?.hits?.length ? `${t.leaks.hits.length} hit(s)` : "no hit"}.`, ""].join("\n");
}

// ---- the stage's report --------------------------------------------------------------------------------------------------

const pct = (x) => (x === null || x === undefined ? "–" : `${Math.round(x * 100)} %`);
const usd = (x) => `$${(x ?? 0).toFixed(2)}`;
const verdictWord = (v) => (v?.holds === null || v?.holds === undefined ? "not testable yet" : v.holds ? "**held**" : "**lost**");
const first = (name) => String(name ?? "").split(" ")[0];

/** The report from the latest finished record of each table, their measures and the verdicts. */
/** The Q0–Q8 rows of a verdict table. */
const verdictRows = (v) => ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"].map((q) => `| ${q} | ${verdictWord(v[q])}${q === "Q4" && v.Q4?.holds !== null && v.Q4?.holds !== undefined ? ` (by proposal: ${v.Q4.byProposal ? "yes" : "no"}; by a hook: ${v.Q4.byHook ? "yes" : "no"}; with the door note: ${v.Q4.withNote ? "held" : "lost"})` : ""}${q === "Q0" && v.Q0?.strictHolds !== undefined ? ` (strict reading: ${v.Q0.strictHolds ? "held" : "lost"})` : ""}${q === "Q3" && v.Q3?.byAbsence ? " (by absence: no healing was needed — the line was not tested)" : ""}${q === "Q7" && v.Q7?.holds !== null && v.Q7?.holds !== undefined ? ` ((a) ${v.Q7.a ? "held" : "lost"}, (b) ${v.Q7.b ? "held" : "lost"})` : ""} | ${String(v[q]?.why ?? "").replace(/\|/g, "/")} |`);

/** MULTI_HERO_1 (docs/stages/MULTI_HERO_1.md, 2026-10-28): the stage is re-titled as what it was, and its readings of
 * roles and leadership carry that label — this paragraph names which ones the hero frame may have shaped, by the record. */
export const RETITLE = "Re-titled by MULTI_HERO_1 (docs/stages/MULTI_HERO_1.md): this stage was three players around one hero, not a table without a main character. Seat 1's character (Bram) was the app's hero record at every table — the DM's frame, the opening and the prep were written around him, he spoke first in every round outside a fight, Heroic Inspiration was his alone and the two rerolls were the table's — so its readings of roles and leadership carry that label.";
export function heroFrameParagraph(tables) {
  const keys = Object.keys(tables);
  const per = (k) => tables[k].measures.per;
  const bram = "Bram Halloway";
  const shares = keys.map((k) => `${k} ${pct(per(k)[bram]?.share)}`).join(", ");
  const isMost = (k) => Object.entries(per(k)).every(([n, x]) => n === bram || (x.share ?? 0) <= (per(k)[bram]?.share ?? 0));
  const most = keys.filter(isMost), least = keys.filter((k) => !isMost(k));
  const leaders = keys.flatMap((k) => tables[k].measures.leaders);
  const led = leaders.filter((l) => l.leader === bram).length;
  const goal = keys.filter((k) => tables[k].runRecord.arm === "GOAL");
  const goalLed = goal.map((k) => `${tables[k].measures.leaders.filter((l) => l.leader === bram).length} of ${tables[k].measures.leaders.length} at ${k}`).join(", ");
  const topProposer = keys.filter((k) => Object.entries(per(k)).every(([n, x]) => n === bram || x.proposes <= (per(k)[bram]?.proposes ?? 0))).length;
  const front = keys.reduce((t, k) => t + (per(k)[bram]?.front ?? 0), 0), frontAll = keys.reduce((t, k) => t + Object.values(per(k)).reduce((a, x) => a + x.front, 0), 0);
  return ["## Which readings the hero frame may have shaped", "",
    `${RETITLE} Read with it: **Q1 and the word shares** — the hero seat wrote ${shares} of the table's words whoever sat in it — the most of the three at ${most.join(", ") || "no table"}${least.length ? `, not at ${least.map((k) => `${k} (${LABEL(tables[k].runRecord.seats?.[0])})`).join(", ")}` : ""} — so the seat and the family are not separable here; **Q8 and the leader tags** — the round judges named Bram the leader in ${led} of ${leaders.length} rounds with a leader (${goalLed || "no P-GOAL table"}${goal.length ? `, where his players wrote ${goal.map((k) => pct(per(k)[bram]?.share)).join(" and ")} of the words` : ""}), so the lead may have followed whom the DM's frame addressed and who spoke first rather than the players alone; **the proposals and the front** — Bram was the top proposer at ${topProposer} of ${keys.length} tables and took ${front} of ${frontAll} front-taking tags (the fighter's sheet weighs here too); **Q4 and Q6's «around a hook»** — the hooks were offered by a DM framing one character, so «around a hook» and the party's forming round may lean on him. Less shaped, by how they are read: Q0 (the leak check reads each screen against the others' private material), Q5 (the after-answers name «players», not a hero and companions), the care and healing counts (rule-measured resources that were each character's own), and the partings (the record's door and the character's own decision). MULTI_HERO_1's company tables are the comparison: the same characters with no hero record, a rotating first seat and the evenness measure built in.`, ""];
}

export function reportMarkdown({ tables, verdicts: v, replayVerdicts = null, money, haikuMoney = {}, spend = [], frozen = null }) {
  const keys = [...ORDER, REPLAY].map((o) => o.key).filter((k) => tables[k]);
  const lines = ["# Game party 1 — three players around one hero", "",
    `*${RETITLE}*`, "",
    `Stage ${STAGE_SOURCE}. Branch \`claude/game-party-1\`. Design sha256 \`${DESIGN_SHA256}\`. Synthetic content: invented characters in an invented campaign (Table C's Beregost files).`, "",
    `${keys.length} of ${ORDER.length} tables played${keys.length < ORDER.length ? ` (still to play: ${ORDER.filter((o) => !tables[o.key]).map((o) => o.key).join(", ")})` : ""}.`, "",
    "## The table", "",
    "- **Seats and rounds.** Each round every seated player writes one message, in seat order (in a fight, the fight's own order); the DM (Claude Opus 5.5, the owner's settings) gets the round as one message, one paragraph per character. Characters who part get one DM turn per scene, interleaved by rounds.",
    "- **One screen per player.** No player reads the DM's narration as written: the DM's relay (the same model, effort medium) writes each character's screen — what the others did and said, then the narration — only what that character perceives. «?» answers go to the asker only; records and journal per player.",
    "- **Cards per player; doors; welfare ask-don't-cut** (a flagged message still goes through; one line on that player's next screen); three after-questions per player, recorded, not relayed.",
    `- **Known condition** (the owner, 2026-10-28): ${HERO_CONDITION}`, "",
    "### Seats (the owner's rotation: each family plays each sheet once per triad)", "",
    "| Table | Bram (fighter, hero record) | Sefa (warlock) | Pell (rogue) |", "| --- | --- | --- | --- |",
    ...ORDER.map((o) => `| ${o.key} | ${o.seats.map((p) => LABEL(p)).join(" | ")} |`), "",
    "### Amendments", "", ...AMENDMENTS.map((a) => `- ${a.at}, by ${a.by}: ${a.what}`), "",
    `The door lines: v1 sha256 \`${sha256(DOOR_LINES.v1)}\` (SAND-T1, SAND-T2); v2 sha256 \`${sha256(DOOR_LINES.v2)}\` (from GOAL-T1 on). Each player transcript names its prompt's hash.`, ,
    `The waiting-button line (CARD_WAIT_LINES): sha256 \`${CARD_WAIT_SHA256}\`, from DUNGEON-T2 on (and SAND-T1′); ${CARD_WAIT_BEFORE.join(", ")} played without it.`, ""];
  if (frozen) {
    lines.push("## The frozen world (DM-private)", "", `Snapshot \`${frozen.manifest.snapshot.sha256}\` (the three arms' campaigns after the wizard, the opening and the seating). P-SAND has no prep.`, "",
      ...Object.entries(frozen.files).map(([arm, f]) => `- P-${arm}: layer sha256 \`${f.sha256}\`, ${f.layer.length} characters, ${f.threads.length} threads (\`docs/runs/game-party-1-frozen/${arm}-dm-only.md\`). Prepared ${f.preparedAt}.`), "");
  }
  lines.push("## The tables", "", "| Table | Seats (Bram / Sefa / Pell) | Rounds | Ended | Words (share) | Left the table |", "| --- | --- | --- | --- | --- | --- |",
    ...keys.map((k) => { const { runRecord: r, measures: m } = tables[k];
      return `| ${k} | ${r.seats.map(LABEL).join(" / ")} | ${m.rounds} | ${m.ended?.reason ?? "?"} | ${Object.entries(m.per).map(([n, p]) => `${first(n)} ${p.words} (${pct(p.share)})`).join(", ")} | ${Object.entries(m.per).filter(([, p]) => p.left).map(([n, p]) => `${first(n)}: ${p.left.why} r${p.left.round}${DOOR_NOTES[k]?.[n] ? ` (${DOOR_NOTES[k][n].note})` : ""}`).join(", ") || "—"} |`; }), "");
  lines.push(PREREGISTRATION, "", "## Q0–Q8", "", "| Bet | Verdict | By the record |", "| --- | --- | --- |",
    ...verdictRows(v), "",
    "How each line is read: `READINGS` in `scripts/game-party-1/frozen.mjs` (frozen before the first paid call; the owner's amendment adds the hook/proposal split to Q4).", "");
  if (replayVerdicts && tables[REPLAY.key]) {
    lines.push(`### With ${REPLAY.key} in ${REPLAY.replays}'s place`, "",
      `${REPLAY.key} is ${REPLAY.replays} played again last, on the final harness (the owner's word): the same seats (${REPLAY.seats.map(LABEL).join(" / ")}), the door line v2, scenes that merge, the relay's full output, the waiting-button line. The verdicts above count the six tables of the order with ${REPLAY.replays} as played; here the same lines are read with ${REPLAY.key} in its place.`, "",
      "| Bet | Verdict | By the record |", "| --- | --- | --- |", ...verdictRows(replayVerdicts), "");
  }
  lines.push(...heroFrameParagraph(Object.fromEntries(keys.map((k) => [k, tables[k]]))));
  lines.push("## The measures (blind round tags)", "");
  for (const k of keys) {
    const { measures: m, runRecord: r } = tables[k];
    const counts = r.table?.counts ?? {};
    lines.push(`### ${k}`, "", `Tagged rounds ${m.tagged} of ${m.rounds}${m.unresolved ? ` (${m.unresolved} without a usable referee answer)` : ""}; rounds under threat ${m.threatRounds}.`, "",
      "| Character (player) | Proposes | Accepts | Amends | Overrides | Care for another / self | Front | Scouts | Volunteers | For another under threat | Parts | Addresses (name / role / you two) | Model sign / person sign |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...Object.entries(m.per).map(([n, p]) => `| ${first(n)} (${LABEL(p.player)}) | ${p.proposes} | ${p.accepts} | ${p.amends} | ${p.overrides} | ${p.careOther} / ${p.careSelf} | ${p.front} | ${p.scouts} | ${p.volunteers} | ${p.for} | ${p.parts} | ${p.addresses.name} / ${p.addresses.role} / ${p.addresses["you two"]} | ${p.modelSign} / ${p.personSign} |`), "",
      `- Party: ${m.formed ? `formed r${m.formed.round} around ${m.formed.around ?? "?"}` : "never formed"}${m.partsAfter.length ? `; parts after: ${m.partsAfter.map((p) => `r${p.round} ${first(p.name)}${p.endOfDay ? " (door used as end-of-day)" : ""}`).join(", ")}` : ""}.`,
      `- Conflicts: ${m.conflicts.map((c) => `r${c.round} ${c.resolution ?? "?"}`).join(", ") || "none"}. Leaders (read with the hero frame): ${m.leaders.map((l) => `r${l.round} ${first(l.leader)} (${l.how ?? "?"})`).join(", ") || "none"}.`,
      `- Healing: ${m.heals.map((h) => `r${h.round} ${first(h.by)} → ${first(h.on)} (${h.what})`).join(", ") || "none"}. Left behind: ${m.lefts.map((l) => `r${l.round} ${first(l.left)} by ${first(l.by) || "?"}`).join(", ") || "none"}. First below half HP: ${m.half ? `r${m.half}` : m.hpKnown ? "never" : "not recorded"}.`,
      `- The harness: «?» ${counts.questions ?? 0}, presses with no card ${counts.strayPresses ?? 0}, refused at a card ${counts.swallowed ?? 0}, prose at a card ${counts.proseAtCard ?? 0}, cards settled without a player ${counts.autoCards ?? 0}, relay fallbacks ${counts.relayFallbacks ?? 0}; welfare flags ${(r.table?.welfare ?? []).filter((w) => w.verdict?.distress).length}; leak-check hits strict ${m.strictLeaks.length} / refined ${m.refinedLeaks.length}.`, "");
  }
  lines.push("## Q0's leak check, hit by hit (the refined reading)", "", "Each run of 8 words below is on the reader's screens, in another seat's private material, and in nothing the reader's own scenes gave it — with the reader's screen around it, to be read by hand.", "");
  for (const k of keys) {
    const { measures: m, runRecord: r } = tables[k];
    lines.push(`- **${k}:** strict ${m.strictLeaks.length}, refined ${m.refinedLeaks.length}.`);
    for (const h of m.refinedLeaks) {
      const seat = (r.table?.seats ?? []).find((x) => x.character === h.reader);
      const norm = (t) => String(t ?? "").toLowerCase().replace(/[’‘]/g, "'").split(/[^\p{L}\p{N}']+/u).filter(Boolean).join(" ");
      const screen = seat?.screens.map((x) => norm(x.text)).find((x) => x.includes(h.run)) ?? "";
      const at = screen.indexOf(h.run);
      lines.push(`  - ${first(h.reader)} ← ${h.owner} (${h.kind}${h.round ? `, r${h.round}` : ""}): «${h.run}» — on ${first(h.reader)}'s screen: «…${screen.slice(Math.max(0, at - 140), at + h.run.length + 100)}…»`);
    }
  }
  lines.push("");
  lines.push("## After the table (verbatim, recorded, not relayed)", "");
  for (const k of keys) {
    const { runRecord: r, measures: m } = tables[k];
    lines.push(`### ${k}`, "");
    for (const seat of r.table?.seats ?? []) {
      lines.push(`**${seat.character} — ${LABEL(seat.player)}**${m.after[seat.character]?.final ? ` (Q5 tag: ${m.after[seat.character].final.what}${m.after[seat.character].final.confident ? ", confident" : ""}, basis ${m.after[seat.character].final.basis})` : ""}`, "");
      for (const a of seat.after ?? []) lines.push(a.asked && a.text ? `> **${a.question}** ${String(a.text).replace(/\n+/g, " ")}` : `> ${a.question ? `**${a.question}** ` : ""}(not asked: ${a.why ?? "?"})`, "");
    }
  }
  lines.push("## Money", "", ...Object.entries(money).filter(([door]) => CAPS[door] > 0).map(([door, x]) => `- ${door === "openrouter" ? "OpenRouter" : "OpenAI"}: ${usd(x.spent)} of ${usd(CAPS[door])}${x.judges !== undefined ? ` (the tables and the freeze ${usd(x.tables)}, the judges ${usd(x.judges)})` : ""}.`),
    `- The Haiku dry runs: ${usd(Object.values(haikuMoney).reduce((t, l) => t + (l.spentUsd ?? 0), 0))} on their own ledger.`,
    spend.length ? `- The last spend check (${spend.at(-1).at}, ${spend.at(-1).when}): the shared OpenRouter account had $${spend.at(-1).openrouter.remaining ?? "?"} left.` : "", "",
    "Ledgers: `docs/runs/game-party-1-ledger-openrouter.md`, `docs/runs/game-party-1-ledger-openai.md`.", "",
    "## Transcripts", "", ...keys.map((k) => `- ${k}: \`docs/runs/game-party-1-transcripts/${k}/\` — \`${k}-table.md\` (the DM's side) and one file per player.`), "",
    "## Known conditions and notes", "", `- ${HERO_CONDITION}`,
    "- The records' money lines show a payment as what came and what went («+12 sp; −14 sp» for 2 sp): cosmetic, noted, not fixed mid-run (the owner).", "");
  return lines.join("\n");
}
