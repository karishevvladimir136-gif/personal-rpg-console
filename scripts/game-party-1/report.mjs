// Game party 1: the transcripts (one per player, one per table), the three screens of a round side by side (markdown
// and a page), and the dry run's page — from the run records. The frozen layer is named by its hash only; its text is
// DM-private and never printed here. DeepSeek's provider reasoning field is printed after its message, marked as never
// relayed.
import { fence } from "../game-player-1/report.mjs";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { DESIGN_SHA256, ROSTER, STAGE_SOURCE, promptSha256 } from "./frozen.mjs";
import { CHARACTERS } from "./sheets.mjs";

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
    prep.frozen ? `**The frozen layer:** P-${run.arm}'s hidden layer, prepared once before any table${prep.preparedBy ? ` by ${prep.preparedBy}` : ""} — sha256 \`${prep.layerSha256}\` (${prep.chars} characters, ${prep.threads} threads), written into the DM's private notes before the first round. Its text is DM-private and is not in this file.`
      : "**No hidden layer:** P-SAND plays pure simulation (no prep).", "",
    `The world's snapshot: sha256 \`${prep.snapshotSha256 ?? "?"}\` (the same wizard, sheets and opening for both triads).`, ""].join("\n");
}

/** One player's transcript: every screen that player was shown and every message it wrote, in order. */
export function playerTranscript(run, seat) {
  const c = CHARACTERS.find((x) => x.id === seat.characterId);
  const lines = [header(run, `${run.key} — ${c.name}'s player: ${LABEL(seat.player)}`),
    `The player's system prompt: \`playerSystem("${run.arm}", "${c.id}")\` in scripts/game-party-1/frozen.mjs, sha256 \`${promptSha256(run.arm, c.id)}\` (the files, then the table's rules). ${seat.left ? `Left the table: ${seat.left.why} at round ${seat.left.round}.` : "At the table to the end."}`, "",
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
