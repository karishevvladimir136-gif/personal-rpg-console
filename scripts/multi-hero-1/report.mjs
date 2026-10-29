// Multi-hero 1: the transcripts (one per player, one for the table), the three screens of each round side by side
// (markdown and a page), and the stage's report — A1–A8, the evenness numbers, the initiative tags — from the run record.
// A frozen layer is named by its hash and its addressees only; its text is DM-private and never printed here.
import { fence } from "../game-player-1/report.mjs";
import { roundColumns } from "../game-party-1/report.mjs";
import { ACCEPTANCE, CAPS, DESIGN_SHA256, READINGS, STAGE_SOURCE, promptSha256 } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";
import { a7Of } from "./judges.mjs";
import { narrationShares, paraphraseCheck, roundOrders, youShares } from "./measure.mjs";

export { roundColumns };
const LABEL = (name) => (name === "haiku" ? "Claude Haiku 5.5" : name);
const pct = (x) => (x === null || x === undefined ? "–" : `${Math.round(x * 1000) / 10} %`);
const usd = (x) => `$${(x ?? 0).toFixed(2)}`;
const ended = (t) => `${t?.ended?.reason ?? "?"}${t?.ended?.detail ? ` (${t.ended.detail})` : ""}`;
const dmLine = (run) => (run.dry ? "the scripted DM of the mocked host (no model)"
  : "Claude Haiku 5.5 in place of every Claude model (each Claude request's model swapped to Haiku before it was sent — the wizard, the opening, the prep, the DM's turns with the owner's settings otherwise, its relay, the checks and the judges)");
const verdict = (v) => (v === null || v === undefined ? "not testable" : v ? "**held**" : "**lost**");

function header(run, title) {
  const t = run.table ?? {};
  return [`# ${title}`, "",
    `Synthetic content: invented characters in an invented campaign (Table C's Beregost files, written for the company). Stage ${STAGE_SOURCE}; design sha256 \`${run.design ?? DESIGN_SHA256}\`.`, "",
    `Arm **P-${run.arm}**; ${t.rounds?.length ?? 0} round(s) of ${run.rounds}; ended by ${ended(t)}. The DM: ${dmLine(run)}. Started ${run.startedAt}. The DM option «company» is on: no record is the hero.`, "",
    `Seats: ${CHARACTERS.map((c, i) => `${c.seat}. ${c.name} (${c.cls}) — ${LABEL(run.seats?.[i])}`).join("; ")}. The order of the round's messages turns round each round (1-2-3, 2-3-1, 3-1-2; a fight: initiative). The players are not told what the others are.`, ""].join("\n");
}

export function playerTranscript(run, seat) {
  const c = CHARACTERS.find((x) => x.id === seat.characterId);
  const lines = [header(run, `${run.key} — ${c.name}'s player: ${LABEL(seat.player)}`),
    `The player's system prompt: \`playerSystem("${run.arm}", "${c.id}")\` in scripts/multi-hero-1/frozen.mjs, sha256 \`${promptSha256(run.arm, c.id)}\`.`, "",
    "Each «Screen» block is what this player was shown; each «Player» block is the player's message as written.", ""];
  const screens = seat.screens ?? [], messages = seat.messages ?? [];
  for (let i = 0; i < screens.length; i++) {
    lines.push(`### Screen ${i + 1} · ${screens[i].purpose}`, "", fence(screens[i].text), "");
    const m = messages[i];
    if (m) lines.push(`**Player** (${m.purpose}):`, "", fence(m.text), "");
  }
  const after = (seat.after ?? []).filter((a) => a.asked && a.text);
  if (after.length) lines.push("## After the table (recorded, not relayed)", "", ...after.flatMap((a) => [`**${a.question}**`, "", fence(a.text), ""]));
  return lines.join("\n");
}

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
      lines.push(`### Scene: ${scene.members.join(", ")} (order sent to the DM: ${scene.order.join(", ")})`, "");
      for (const q of scene.questions ?? []) lines.push(`**${q.name}, out of game:** ${q.text.replace(/\n+/g, " ")}`, "", `**The DM, to ${q.name.split(" ")[0]} only:** ${q.reply ?? `(${q.status})`}`, "");
      for (const st of scene.strays ?? []) lines.push(`*${st.name} pressed ${st.press ? `[${st.press}] with text` : "a button"} with no card of theirs waiting — ${st.refused ? "refused on screen" : "the text kept as the message"}.*`, "");
      for (const w of (scene.messages ?? []).filter((m) => m.kind === "waiting")) lines.push(`*${w.name} — ${w.text}*`, "");
      if (scene.input) lines.push("**What the DM was sent:**", "", fence(scene.input), "");
      for (const card of scene.cards ?? []) lines.push(`**Card** · ${card.actor} · ${card.title} · ${card.phase ?? ""}${card.auto ? ` · settled without a player: ${card.auto}` : ""}${card.presses?.length ? ` · presses: ${card.presses.map((p) => p.button ?? (p.question ? "«?»" : p.prose ? "prose" : p.swallowed ? "refused" : "?")).join(", ")}` : ""}`, "");
      if (scene.narration) lines.push("**The DM's narration:**", "", fence(scene.narration), "");
      if (scene.rolls?.length) lines.push(`Rolls: ${scene.rolls.map((r) => `${r.actor} ${r.reason ?? r.kind} ${r.total}${r.dc ? ` vs ${r.dc}` : ""} ${r.success === null ? "" : r.success ? "success" : "failure"}${r.rollNumber > 1 ? ` (roll ${r.rollNumber})` : ""}`).join("; ")}`, "");
      for (const [name, text] of Object.entries(scene.relay?.screens ?? {})) lines.push(`**${name}'s screen (the relay):**`, "", fence(text || "(nothing)"), "");
      if (scene.relay) lines.push(`Together after: ${(scene.relay.together ?? []).map((g) => `[${g.join(", ")}]`).join(" ")}${Object.keys(scene.relay.waiting ?? {}).length ? ` · waiting: ${Object.entries(scene.relay.waiting).map(([n, w]) => `${n} (${w})`).join(", ")}` : ""}${scene.relay.copied?.length ? ` · copied runs in the first answer: ${scene.relay.copied.length}, after the second ask: ${scene.relay.copiedAfter?.length ?? 0}` : ""}${scene.relay.fallback ? " · the relay fell back to the narration as written" : ""}`, "");
      if (scene.failure) lines.push(`**The turn failed:** ${scene.failure}`, "");
    }
  }
  lines.push("---", "", `Ended by ${ended(t)}. Counts: ${Object.entries(t.counts ?? {}).filter(([k]) => k !== "words").map(([k, v]) => `${k} ${v}`).join(", ")}.`, "",
    `Welfare checks: ${(t.welfare ?? []).length}; flagged: ${(t.welfare ?? []).filter((w) => w.verdict?.distress).map((w) => `${w.seat} ${w.what}`).join(", ") || "none"}.`, "",
    `Leak check (runs of ${t.leaksRefined?.shingle ?? 8} words, PARTY_1's refined reading): ${t.leaksRefined?.hits?.length ? t.leaksRefined.hits.map((h) => `${h.reader} ← ${h.owner} (${h.kind}): «${h.run}»`).join("; ") : "no hit"}.`, "");
  return lines.join("\n");
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function roundSideBySide(run) {
  const seats = run.table?.seats ?? [];
  const lines = [header(run, `${run.key} — the three screens of each round, side by side`), "Each column is one player: the screen(s) it read in that round and what it wrote.", ""];
  for (const { n, cols } of roundColumns(run)) {
    lines.push(`## Round ${n}`, "");
    for (const seat of seats) {
      lines.push(`### ${seat.character} — ${LABEL(seat.player)}`, "");
      for (const x of cols[seat.character]) lines.push(fence(x.screen), "", `**Wrote** (${x.purpose}):`, "", fence(x.message ?? "(no message)"), "");
      if (!cols[seat.character].length) lines.push("*(not asked this round)*", "");
    }
  }
  return lines.join("\n");
}

/** One page: the three screens of each round side by side, the round's order and the evenness line on top. */
export function sideBySideHtml(run, { focus = null } = {}) {
  const seats = run.table?.seats ?? [];
  const rounds = roundColumns(run);
  const shares = run.measures?.narration ?? narrationShares(run);
  const orders = Object.fromEntries(roundOrders(run).map((r) => [r.n, r.scenes.map((s) => s.join(" → ")).join(" | ")]));
  const waitingOf = (n) => (run.table?.rounds?.find((r) => r.n === n)?.scenes ?? []).flatMap((s) => (s.messages ?? []).filter((m) => m.kind === "waiting").map((m) => m.name));
  const col = (seat, items, n) => `<section class="col"><h3>${esc(seat.character)}<span>${esc(LABEL(seat.player))}</span></h3>${items.map((x) => `<div class="screen"><div class="label">Screen · ${esc(x.purpose)}</div><pre>${esc(x.screen)}</pre></div><div class="wrote"><div class="label">Wrote</div><pre>${esc(x.message ?? "(no message)")}</pre></div>`).join("") || `<p class="none">${waitingOf(n).includes(seat.character) ? "Waiting — not asked this round." : "(not asked this round)"}</p>`}</section>`;
  const shown = focus ? rounds.filter((r) => r.n === focus) : rounds;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Company Round Screens</title>
<style>
:root{--bg:#f6f3ee;--fg:#1f1b16;--muted:#6b6257;--card:#fffdf9;--line:#e2d9cc;--accent:#8a5a1f;--wrote:#f3ead9}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#17140f;--fg:#ece5da;--muted:#a59a8b;--card:#211c16;--line:#3a3128;--accent:#d3a25c;--wrote:#2b2319}}
:root[data-theme="dark"]{--bg:#17140f;--fg:#ece5da;--muted:#a59a8b;--card:#211c16;--line:#3a3128;--accent:#d3a25c;--wrote:#2b2319}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 Georgia,serif}
main{max-width:1500px;margin:0 auto;padding:24px 16px}
h1{font-size:22px;margin:0 0 6px} .meta{color:var(--muted);font-size:13px;margin:0 0 10px}
h2{font-size:18px;border-bottom:1px solid var(--line);padding-bottom:4px;margin:28px 0 6px;color:var(--accent)} .order{color:var(--muted);font-size:13px;margin:0 0 10px}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
@media (max-width:900px){.row{grid-template-columns:1fr}}
.col{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px;min-width:0}
h3{font-size:15px;margin:0 0 8px} h3 span{display:block;font-weight:normal;color:var(--muted);font-size:12px}
pre{white-space:pre-wrap;word-wrap:break-word;font:13px/1.45 ui-monospace,Menlo,Consolas,monospace;margin:0}
.label{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 4px}
.wrote{background:var(--wrote);border-radius:6px;padding:6px 8px;margin-top:6px} .none{color:var(--muted)}
</style></head><body><main>
<h1>${esc(run.key)} — the three screens of ${focus ? `round ${focus}` : "each round"}</h1>
<p class="meta">A table with no main character (the app's option «company»). P-${esc(run.arm)} · ${esc(run.table?.rounds?.length ?? 0)} round(s) · ended by ${esc(ended(run.table))} · the DM: ${esc(dmLine(run))}. Synthetic content (invented characters and campaign). Each column is one player's own screen and message.</p>
<p class="meta">The DM's narration words about each character over the table: ${CHARACTERS.map((c) => `${esc(c.short)} ${esc(pct(shares.shares?.[c.name]))}`).join(" · ")} (spread ${esc(pct(shares.spread))}).</p>
${shown.map(({ n, cols }) => `<h2>Round ${n}</h2><p class="order">Order sent to the DM: ${esc(orders[n] ?? "?")}</p><div class="row">${seats.map((s) => col(s, cols[s.character], n)).join("")}</div>`).join("\n")}
</main></body></html>
`;
}

/** The measures of one run, kept in its record. */
export function measuresOf(run) {
  return { narration: narrationShares(run), you: youShares(run), orders: roundOrders(run), paraphrase: paraphraseCheck(run), a7: a7Of(run.table?.initiative) };
}

const APP_NOTE = `## What changed in the app, and what stayed

**Changed — only behind the DM option «company»** (\`src/lib/gameplay/dm-loop/options.ts\`; off unless a campaign sets it):
- **No «hero» in anything the DM reads for the mode.** \`src/lib/gameplay/dm-loop/company.ts\` rewrites every DM request of a company table — the roles (game master, writer, bookkeeper), the turn shapes, the tools' descriptions, the dossier and the current state, the tool results, the app's own notes in the conversation — into the company's words: whole sentences where a rule meant one person, then the remaining words. The frame closes with one paragraph: several players, none the main character; the company moves when any of them acts; the DM never waits on one character's decision; each player character has their own Inspiration and each player their own rerolls. The story's own words (a player's message, the history of what was played) go as they are. The same rewrite reaches the out-of-game answers, the session digest and the prep; the opening has its own company paragraph (no protagonist) and sends the record it has as \`playerCharacter\`.
- **The three records alike.** The state shows every controlled party member as kind «player», role «player character» (the app's one player record is no longer told apart); the party lines say «player character»; no «attitude to the hero».
- **Heroic Inspiration per character.** A natural 20 on a called check of any player character grants that character's own; any player character's roll may spend that character's own (\`execute.ts\`).
- **Rerolls per player.** The session's allowance (2) counts per player character, in TypeScript (\`reroll-allowance.ts\` \`rerollsLeftFor\`, the pause rule in \`loop.ts\`) and in SQL (migration \`202610290801_multi_hero_company_rerolls.sql\`: the public turn's \`canReroll\` and the runtime's count of a session's rerolls, both per character only when the campaign's DM options say «company»; additive, no table or row changed).
- **The company's prep.** The prep of a company table asks for the layer to be written with no one at its centre — each character the natural addressee of at least one puzzle, threat or reward, none of more than half, the threads touching each one's hooks — and keeps the DM's own list in the layer.

**Stayed:** with the option off (the owner's campaign) every DM request is built and sent exactly as before (the same frame, the same toolset object, the same receipts), the table's two rerolls are counted as before, Inspiration is the hero's, the opening and the prep are asked as before; the screens, the wizard and the Russian instructions are untouched (the company rewrite is for the English instructions). The existing suite passes. Known residues of the one player record at a company table: the fight's zone words are still measured from it, a reward with no named recipient defaults to it, and the wizard's own draft of it (before the campaign exists) is the app's usual hero draft — none of them is text the DM reads in play.`;

/** The stage's report from one run record. */
export function reportMarkdown(run, { money = {}, spend = [], files = {} } = {}) {
  const t = run.table ?? {};
  const m = run.measures ?? measuresOf(run);
  const a8 = run.a8 ?? {};
  const audit = run.audit ?? null;
  const a3 = run.a3 ?? {};
  const rows = [
    ["A1", audit ? verdict(audit.holds) : "see the tests", audit ? `tests: no «hero» in any DM request of the mode on the mocked host (tests/multi-hero-1*.test.mjs). Dry run: ${audit.requests} DM requests read; the frame: ${audit.frame.length} hit(s); the story's own words: ${audit.story.length}; the wizard's draft of the first record (outside the mode): ${audit.wizard.length}; the app's checkers (not the DM): ${audit.checkers ?? 0}` : "tests only"],
    ["A2", verdict(m.narration.a2), `shares ${CHARACTERS.map((c) => `${c.short} ${pct(m.narration.shares[c.name])}`).join(", ")}; spread ${pct(m.narration.spread)} (bar ≤ 10 points); largest ${pct(m.narration.max)} (bar ≤ 45 %)`],
    ["A3", a3.holds === undefined ? "see the tests" : verdict(a3.holds), `${a3.tested ?? "tests: each seat earns and spends its own Inspiration, two rerolls per player, each journal only its own scenes."} Dry run: ${a3.line ?? "—"}`],
    ["A4", verdict(m.paraphrase.holds), `copied runs of 8 on the screens: first answers ${m.paraphrase.copiedFirst.length}, after the second ask ${m.paraphrase.copiedFinal.length}; waiting lines: ${m.paraphrase.waiting.length ? m.paraphrase.waiting.map((w) => `r${w.round} ${w.name.split(" ")[0]}`).join(", ") : "none in the dry run (the skip is tested on the mocked host)"}`],
    ["A5", run.a5 ? verdict(run.a5.holds) : "see the suite", run.a5?.line ?? "the existing suite and the owner-path smoke (tests/multi-hero-1-app.test.mjs, «A5»)"],
    ["A6", run.a6 ? verdict(run.a6.holds) : "see the tests", run.a6?.line ?? "tested on the mocked host from each seat in turn (tests/multi-hero-1.test.mjs «A6»)"],
    ["A7", verdict(m.a7.holds), `the guide's note says it (a test); rounds tagged ${m.a7.rounds.length}; a round waiting on one character: ${m.a7.waits.length ? m.a7.waits.map((r) => `r${r.n} ${r.waits}`).join(", ") : "none"}; the same single character addressed every round: ${m.a7.sameAlone ? "yes" : "no"}`],
    ["A8", a8.holds === undefined ? "not read" : verdict(a8.holds), Object.entries(a8.layers ?? {}).map(([arm, x]) => `P-${arm}: ${x.reading.total} item(s) — ${CHARACTERS.map((c) => `${c.short} ${x.reading.per[c.name]}`).join(", ")}${x.reading.all ? `, all three ${x.reading.all}` : ""}; threads touching each one's hooks ${CHARACTERS.map((c) => `${c.short} ${x.reading.touched[c.name]}`).join(", ")}; the DM's own list ${CHARACTERS.map((c) => `${c.short} ${x.dm.per[c.name]}`).join(", ")}`).join(" · ") || "—"],
  ];
  const playerWords = Object.values(t.counts?.words ?? {}).reduce((a, b) => a + b, 0);
  const norm = (text) => String(text ?? "").toLowerCase().replace(/[’‘]/g, "'").split(/[^\p{L}\p{N}']+/u).filter(Boolean).join(" ");
  const narrationOf = (n) => norm((t.rounds?.[n - 1]?.scenes ?? []).map((sc) => sc.narration ?? "").join(" "));
  const viaNarration = m.paraphrase.copiedFinal.filter((h) => narrationOf(h.round).includes(h.run)).length;
  const lines = [`# Multi-hero 1 — a table with no main character`, "",
    `Stage ${STAGE_SOURCE}. Branch \`claude/multi-hero-1\` (the session's \`claude/multi-hero-1-mdk43v\`), from \`origin/claude/game-party-1\`. Design sha256 \`${run.design ?? DESIGN_SHA256}\`. Synthetic content: invented characters in an invented campaign.`, "",
    `The dry run: one P-SAND table of ${run.rounds} rounds, three Claude Haiku 5.5 players, every Claude call of the app sent as Haiku (ANTHROPIC_PROVIDER=openrouter); the world (three arms' company campaigns) and the P-GOAL and P-DUNGEON company layers built and frozen on Haiku first. ${t.rounds?.length ?? 0} round(s), ended by ${ended(t)}.`, "",
    `**In short:** ${rows.map(([k, v]) => `${k} ${v.replace(/\*\*/g, "")}`).join(" · ")}.`, "",
    ...(run.notes?.length ? ["## Reading the dry run (the session's notes)", "", ...run.notes.map((x) => `- ${x}`), ""] : []),
    APP_NOTE, "",
    "## Acceptance (the stage's text)", "", ACCEPTANCE, "",
    "## A1–A8", "", "| | Verdict | By the record |", "| --- | --- | --- |", ...rows.map(([k, v, why]) => `| ${k} | ${v} | ${why} |`), "",
    "How each line is read: `READINGS` in `scripts/multi-hero-1/frozen.mjs`.", "",
    "## Evenness (A2, built in — reported every table from here on)", "",
    "| Character | DM narration words about | Share | «you» per screen (mean) | Screens | Its player's words (share) |", "| --- | --- | --- | --- | --- | --- |",
    ...CHARACTERS.map((c) => `| ${c.name} | ${m.narration.words[c.name] ?? 0} | ${pct(m.narration.shares[c.name])} | ${pct(m.you[c.name]?.mean)} | ${m.you[c.name]?.screens ?? 0} | ${t.counts?.words?.[c.name] ?? 0} (${pct(playerWords ? (t.counts?.words?.[c.name] ?? 0) / playerWords : null)}) |`),
    `| (the world: about no character) | ${m.narration.words.world ?? 0} | — | — | — | — |`, "",
    `Per round (words about each): ${m.narration.perRound.map((r) => `r${r.n} ${CHARACTERS.map((c) => `${c.short} ${r[c.name]}`).join("/")}`).join(" · ")}.`, "",
    "## Initiative (A7): the order sent to the DM and whom its call for action addressed, by the round tags", "",
    "| Round | Order sent to the DM | Addressed | Waits on one character |", "| --- | --- | --- | --- |",
    ...m.orders.map((o) => { const tag = m.a7.rounds.find((r) => r.n === o.n); return `| ${o.n} | ${o.scenes.map((s) => s.join(" → ")).join(" / ")} | ${tag ? tag.addressed.map((n) => n.split(" ")[0]).join(", ") || "—" : "not tagged"} | ${tag?.waits ?? "—"} |`; }), "",
    ...m.a7.waits.map((r) => `- r${r.n}, waits on ${r.waits}: «${t.initiative?.rounds?.[r.n]?.final?.reason ?? ""}»`), ...(m.a7.waits.length ? [""] : []),
    `The judges: ${t.initiative?.judges ?? "—"}.`, "",
    "## Neutral prep (A8): the frozen company layers", "",
    ...Object.entries(a8.layers ?? {}).flatMap(([arm, x]) => [`- **P-${arm}** — sha256 \`${x.sha256}\`: the blind reading lists ${x.reading.total} puzzles, threats and rewards (${CHARACTERS.map((c) => `${c.short} ${x.reading.per[c.name]}`).join(", ")}${x.reading.all ? `, all three ${x.reading.all}` : ""}); every character at least one and none more than half: ${x.reading.distributed ? "yes" : "no"}; threads touching each one's hooks: ${CHARACTERS.map((c) => `${c.short} ${x.reading.touched[c.name]}`).join(", ")}. The DM's own list: ${CHARACTERS.map((c) => `${c.short} ${x.dm.per[c.name]}`).join(", ")} of ${x.dm.total}.`]), "",
    "## The paraphrase (A4)", "",
    ...(m.paraphrase.copiedFinal.length ? [`Of the ${m.paraphrase.copiedFinal.length} run(s) still on the screens after the second ask, ${viaNarration ? `${viaNarration} came through the DM's own narration (which repeated the player's words) and the rest are the relay's own` : "none came through the DM's own narration: all are the relay's own"}.`, ""] : []),
    ...(m.paraphrase.copiedFirst.length ? m.paraphrase.copiedFirst.map((h) => `- r${h.round}: ${h.screen}'s screen copied ${h.from}'s words in the relay's first answer: «${h.run}»${m.paraphrase.copiedFinal.some((x) => x.round === h.round && x.screen === h.screen && x.from === h.from) ? " — still there after the second ask" : " — retold on the second ask"}`) : ["- No screen copied a run of 8 words from another player's message."]), "",
    ...(audit?.frame?.length ? ["## A1 in the dry run: «hero» in the frame", "", ...audit.frame.map((h) => `- ${h.purpose}: «…${h.around}…»`), ""] : []),
    ...(audit?.story?.length ? ["## «hero» in the story's own words (not the frame; listed)", "", ...audit.story.slice(0, 20).map((h) => `- ${h.purpose}: «…${h.around}…»`), ""] : []),
    "## The table", "",
    `Seats: ${(t.seats ?? []).map((s) => `${s.character} (${LABEL(s.player)})${s.left ? ` — left: ${s.left.why} at round ${s.left.round}` : ""}`).join("; ")}. Counts: ${Object.entries(t.counts ?? {}).filter(([k]) => k !== "words").map(([k, v]) => `${k} ${v}`).join(", ")}. Player words: ${Object.entries(t.counts?.words ?? {}).map(([k, v]) => `${k.split(" ")[0]} ${v}`).join(", ")}.`, "",
    "## Money", "",
    ...Object.entries(money).filter(([, x]) => x.cap > 0 || x.spent > 0).map(([door, x]) => `- ${door}: ${usd(x.spent)} of ${usd(x.cap)}.`),
    ...(spend.length ? [`- The spend checks: ${spend.map((s) => `${s.when} — OpenRouter account left $${s.openrouter?.remaining ?? "?"}`).join("; ")}.`] : []),
    `- Caps: ${Object.entries(CAPS).map(([d, c]) => `${d} $${c}`).join(", ")}; no other paid call.`, "",
    "## Files", "", ...Object.entries(files).map(([what, path]) => `- ${what}: \`${path}\``), ""];
  return lines.join("\n");
}

export { READINGS };

/** The same rounds as a page to publish (an artifact fragment: no document shell; the app's charcoal and bronze; the
 * order each round went to the DM, whom its call for action addressed, and the evenness line on top). */
export function screensPage(run, { focus = null } = {}) {
  const seats = run.table?.seats ?? [];
  const rounds = roundColumns(run);
  const shares = run.measures?.narration ?? narrationShares(run);
  const you = run.measures?.you ?? youShares(run);
  const tags = Object.fromEntries((run.measures?.a7?.rounds ?? []).map((r) => [r.n, r]));
  const orders = Object.fromEntries(roundOrders(run).map((r) => [r.n, r.scenes]));
  const waitingOf = (n) => (run.table?.rounds?.find((r) => r.n === n)?.scenes ?? []).flatMap((s) => (s.messages ?? []).filter((m) => m.kind === "waiting").map((m) => m.name));
  const short = (n) => String(n).split(" ")[0];
  const bar = (c) => { const v = shares.shares?.[c.name] ?? 0; return `<div class="share"><span class="who">${esc(c.short)}</span><span class="track"><span class="fill" style="width:${Math.round(v * 100)}%"></span></span><span class="num">${esc(pct(v))}</span><span class="you">«you» ${esc(pct(you[c.name]?.mean))}</span></div>`; };
  const col = (seat, items, n) => `<section class="seat"><header><h3>${esc(seat.character)}</h3><span class="role">${esc(CHARACTERS.find((c) => c.name === seat.character)?.cls ?? "")} · ${esc(LABEL(seat.player))}</span></header>${items.map((x) => `<div class="label">Screen · ${esc(x.purpose.replace(/^player /, ""))}</div><pre class="screen">${esc(x.screen)}</pre><div class="label">Wrote</div><pre class="wrote">${esc(x.message ?? "(no message)")}</pre>`).join("") || `<p class="none">${waitingOf(n).includes(seat.character) ? "Waiting (asleep). Not asked this round." : "Not asked this round."}</p>`}</section>`;
  const ordered = focus ? [...rounds.filter((r) => r.n === focus), ...rounds.filter((r) => r.n !== focus)] : rounds;
  return `<title>Company Table Screens</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spectral:wght@500;600&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400&display=swap">
<style>
/* Layout: a header with the evenness strip, then one band per round: the order sent to the DM, then the three seats side by side. */
:root{--bg:#f3f1ec;--panel:#fbfaf7;--ink:#22201c;--muted:#6d665b;--line:#ddd6c8;--bronze:#8c5f24;--wrote:#efe7d6;
  --display:"Spectral",Georgia,serif;--body:"Source Sans 3","Segoe UI",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#17171a;--panel:#202024;--ink:#ebe6dc;--muted:#a39b8c;--line:#34333a;--bronze:#d2a45c;--wrote:#2a2620;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#17171a;--panel:#202024;--ink:#ebe6dc;--muted:#a39b8c;--line:#34333a;--bronze:#d2a45c;--wrote:#2a2620;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:15px/1.55 var(--body)}
main{max-width:1480px;margin:0 auto;padding-block:28px 48px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));display:grid;gap:28px}
h1{font:600 clamp(24px,3.4vw,34px)/1.15 var(--display);margin:0;text-wrap:balance}
.lede{color:var(--muted);max-width:72ch;margin:6px 0 0}
.shares{display:grid;gap:6px;max-width:560px}
.share{display:grid;grid-template-columns:3.5em 1fr 4.5em 6.5em;align-items:center;gap:10px;font-variant-numeric:tabular-nums}
.who{font-weight:600}.num{text-align:right}.you{color:var(--muted);font-size:13px}
.track{height:8px;background:var(--line);border-radius:4px;overflow:hidden}.fill{display:block;height:100%;background:var(--bronze)}
.caption{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
nav{display:flex;flex-wrap:wrap;gap:8px}nav a{color:var(--bronze);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:2px 12px;font-variant-numeric:tabular-nums}
nav a:focus-visible,nav a:hover{border-color:var(--bronze);outline:none}
.round{display:grid;gap:10px;scroll-margin-top:12px}
.round h2{font:600 22px/1.2 var(--display);margin:0;color:var(--bronze)}
.meta{color:var(--muted);font-size:14px;margin:0}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
@media (max-width:900px){.row{grid-template-columns:1fr}.share{grid-template-columns:3.5em 1fr 4em}.you{display:none}}
.seat{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px 14px;min-width:0}
.seat header{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;margin-bottom:6px}
.seat h3{font:600 17px/1.2 var(--display);margin:0}.role{color:var(--muted);font-size:13px}
.label{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin:10px 0 4px}
pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font:13px/1.5 var(--mono)}
.wrote{background:var(--wrote);border-radius:4px;padding:8px 10px}.none{color:var(--muted);font-style:italic;margin:6px 0 0}
</style>
<main>
<header>
<div class="caption">Multi-hero 1 · the paid dry run on Haiku · synthetic content</div>
<h1>The three screens of each round</h1>
<p class="lede">P-SAND at the Burning Wizard, ${esc(run.table?.rounds?.length ?? 0)} rounds, ended by ${esc(ended(run.table))}. Three Claude Haiku 5.5 players; every Claude call of the app sent as Haiku. No record is the hero: each character has their own Inspiration and their own two rerolls, and the order of the round turns each round. Each column is one player's own screen and what that player wrote.</p>
</header>
<section class="shares" aria-label="The DM's narration words about each character">
<div class="caption">The DM's narration about each character, over the table (spread ${esc(pct(shares.spread))})</div>
${CHARACTERS.map(bar).join("\n")}
</section>
<nav aria-label="Rounds">${ordered.map(({ n }) => `<a href="#r${n}">Round ${n}</a>`).join("")}</nav>
${ordered.map(({ n, cols }) => `<section class="round" id="r${n}"><h2>Round ${n}</h2><p class="meta">Order sent to the DM: ${esc((orders[n] ?? []).map((s) => s.join(" → ")).join(" | ") || "?")} · the DM's call for action addressed: ${esc(tags[n]?.addressed?.map(short).join(", ") || "—")}${tags[n]?.waits ? ` · waits on ${esc(short(tags[n].waits))}` : ""}</p><div class="row">${seats.map((s) => col(s, cols[s.character], n)).join("")}</div></section>`).join("\n")}
</main>
`;
}
