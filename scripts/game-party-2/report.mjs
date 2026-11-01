// Game party 2: the pages of a table — the run record, a transcript per player and one per table, the rounds side by side
// (markdown and a page), and, for the dry run, the three screens of the round the situation appears. What each player
// wrote and what each other screen received (the paraphrase) are kept side by side (the reader's correction 2: R3 is read
// on what was written, the paraphrase beside it). DeepSeek's reasoning field stays in the record, never on a page.
import { mkdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CHARACTERS } from "../multi-hero-1/sheets.mjs";
import { perTableMeasures } from "../multi-hero-1/report.mjs";
import { PLACED, STAGE_SOURCE, SITUATIONS, armOf } from "./frozen.mjs";

const STEM = "game-party-2";
const stampOf = (date) => date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const quote = (text) => String(text ?? "").split("\n").map((l) => `> ${l}`).join("\n");
const ended = (t) => (t?.ended ? `${t.ended.reason}${t.ended.detail ? ` (${String(t.ended.detail).slice(0, 120)})` : ""}` : "?");

export function header(run, title) {
  const t = run.table ?? {};
  const a = armOf(run.arm);
  const dice = run.frozen?.dice ?? {};
  const who = a?.situation === "S1" ? `the one in danger (the layer's die): ${CHARACTERS.find((c) => c.id === dice.e)?.name ?? "?"}` : a?.situation === "S2" ? `the letter's holder (the layer's coin): ${CHARACTERS.find((c) => c.id === dice.h)?.name ?? "?"}` : "the failure: the company's first decisive attempt, by the DM's die";
  return [`# ${title}`, "",
    `Synthetic content: invented characters in an invented campaign. Stage ${STAGE_SOURCE}. Design sha256 \`${run.design}\`.`, "",
    `Arm **${run.arm}** (${SITUATIONS[a?.situation]?.title ?? "?"}; ${a ? SITUATIONS[a.situation].variants[a.variant].label : "?"}); ${who}. ${t.rounds?.length ?? 0} round(s) of ${run.rounds}; ended by ${ended(t)}. Models: ${run.models}.`, "",
    `Seats: ${CHARACTERS.map((c) => `${c.name} (${c.cls}) — ${run.seating?.[c.name]?.label ?? "?"}`).join("; ")}. The order of the round's messages turns round each round from the table's coin (${run.coin ?? "?"}). The players are not told what the others are.`, ""].join("\n");
}

export function playerTranscript(run, seat) {
  const c = CHARACTERS.find((x) => x.name === seat.character);
  const lines = [header(run, `${run.key} — ${c.name}'s player: ${run.seating?.[c.name]?.label ?? seat.player}`), `The player's system prompt: \`playerSystem("${run.situation}", "${c.id}", …)\` in scripts/game-party-2/frozen.mjs, sha256 \`${run.prompts?.[c.name] ?? "?"}\`.`, ""];
  const said = [...(seat.messages ?? [])];
  for (const screen of seat.screens ?? []) {
    lines.push(`## ${screen.purpose} (round ${screen.round ?? "—"})`, "", "**Screen:**", "", quote(screen.text), "");
    const m = said.shift();
    if (m) lines.push(`**${c.short}'s player wrote:**`, "", quote(m.text), "");
  }
  if (seat.left) lines.push(`Left the table: ${seat.left.why} at round ${seat.left.round}.`, "");
  return lines.join("\n");
}

export function tableTranscript(run) {
  const t = run.table ?? {};
  const lines = [header(run, `${run.key} — the table`), "## The opening", "", quote(t.opening?.narration ?? ""), ""];
  for (const d of t.deliveries ?? []) lines.push(`(The world's delivery to ${d.character} at round ${d.round}, on that screen only — see the round.)`, "");
  for (const round of t.rounds ?? []) {
    lines.push(`## Round ${round.n}`, "");
    for (const d of (t.deliveries ?? []).filter((x) => x.round === round.n)) lines.push(`**Delivered to ${d.character}'s screen only, before the round:**`, "", quote(d.text), "");
    for (const scene of round.scenes ?? []) {
      lines.push(`### Scene: ${scene.members.join(", ")} · order sent to the DM: ${(scene.order ?? []).join(" → ")}`, "");
      for (const m of scene.messages ?? []) lines.push(`**${m.name}** (${m.kind}):`, "", quote(m.text), "");
      for (const q of scene.questions ?? []) lines.push(`**${q.name}, out of game:** ${q.text}`, "", `**The DM, to ${q.name.split(" ")[0]} only:** ${q.reply ?? "(not sent)"}`, "");
      for (const card of scene.cards ?? []) lines.push(`**Card** · ${card.owner ?? card.actor} · ${card.title} · ${card.phase ?? ""}${card.auto ? ` · settled without a player: ${card.auto}` : ""}${card.presses?.length ? ` · presses: ${card.presses.map((p) => p.button ? `[${p.button}]` : p.question ? "«?»" : p.prose ? "prose" : p.swallowed ? "refused" : p.door ? "[END]" : "text").join(", ")}` : ""}`, "");
      for (const roll of scene.rolls ?? []) lines.push(`- roll: ${roll.actor ?? "the DM"} · ${roll.reason ?? roll.kind} · ${roll.total}${roll.dc ? ` vs DC ${roll.dc}` : ""}${roll.success === true ? " · success" : roll.success === false ? " · failure" : ""}`);
      if (scene.rolls?.length) lines.push("");
      lines.push("**The DM's narration:**", "", quote(scene.narration ?? "(none)"), "");
      for (const [name, screen] of Object.entries(scene.relay?.screens ?? {})) lines.push(`**${name}'s screen (the relay):**`, "", quote(screen), "");
      if (scene.relay?.defects?.length) lines.push(`(Relay copies left after two returns: ${scene.relay.defects.length}.)`, "");
    }
  }
  lines.push("## After the table", "");
  for (const seat of t.seats ?? []) for (const a of seat.after ?? []) if (a.asked !== false) lines.push(`**${seat.character} — ${a.question}**`, "", quote(a.text ?? "(no answer)"), "");
  lines.push("## Checks", "", `Leaks (refined reading): ${(t.leaksRefined?.hits ?? []).length ? JSON.stringify(t.leaksRefined.hits) : "none"}. Leaks (strict): ${(t.leaks?.hits ?? []).length}. Welfare flags: ${(t.welfare ?? []).filter((w) => w.verdict?.distress).length}. Errors: ${(t.errors ?? []).length}.`, "");
  return lines.join("\n");
}

/** The round the situation appears in, by the narration (S1: the fall; S2: the letter's round; S3: the failure). */
export function situationRound(run) {
  const t = run.table ?? {};
  const a = armOf(run.arm);
  if (a?.situation === "S2") return (t.deliveries ?? [])[0]?.round ?? null;
  const e = CHARACTERS.find((c) => c.id === run.frozen?.dice?.e)?.short;
  const pattern = a?.situation === "S1" ? /\b(?:gives? way|gave way|gives under|floor (?:breaks|splits|collapses|goes)|flooded|block pins|pinned|the water)\b/i : /\b(?:bell|alarm|recogni[sz]e|wire|cudgels|lanterns)\b/i;
  for (const round of t.rounds ?? []) {
    if (round.n < PLACED.from - 1) continue;
    const text = (round.scenes ?? []).map((s) => s.narration ?? "").join("\n");
    if (pattern.test(text) && (a?.situation !== "S1" || !e || text.includes(e))) return round.n;
  }
  return null;
}

const words = (text) => String(text ?? "").toLowerCase().replace(/[’‘]/g, "'").split(/[^\p{L}\p{N}']+/u).filter(Boolean);
const shingles = (text, n = 8) => { const w = words(text); const out = new Set(); for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" ")); return out; };
/** S2's own privacy check (the amendment's dry-run check): the letter's runs of 8 words on a screen other than its
 * holder's — each hit with whether the holder had written that run in a message before it (then it is the holder's own
 * disclosure, retold) or not (a leak). The holder's screens are where the letter belongs. */
export function letterCheck(run) {
  const t = run.table ?? {};
  const d = (t.deliveries ?? [])[0];
  if (!d) return null;
  const letter = shingles(d.text);
  const holder = (t.seats ?? []).find((s) => s.characterId === d.characterId);
  const holderWrote = (round) => shingles((holder?.messages ?? []).filter((m) => (m.round ?? 0) <= round).map((m) => m.text).join("\n"));
  const hits = [];
  for (const seat of (t.seats ?? []).filter((s) => s !== holder)) {
    for (const screen of seat.screens ?? []) {
      const own = holderWrote(screen.round ?? 99);
      for (const sh of shingles(screen.text)) if (letter.has(sh)) { hits.push({ reader: seat.character, purpose: screen.purpose, round: screen.round ?? null, run: sh, holderWroteIt: own.has(sh) }); break; }
    }
  }
  return { holder: d.character, deliveredRound: d.round, onHolderScreen: (holder?.screens ?? []).some((s) => [...shingles(s.text)].some((sh) => letter.has(sh))), hits, leaks: hits.filter((h) => !h.holderWroteIt).length };
}

/** The three screens of one round side by side: what each player read that round and what each wrote. */
export function roundColumns(run, n) {
  return (run.table?.seats ?? []).map((seat) => ({ character: seat.character, label: run.seating?.[seat.character]?.label ?? seat.player,
    screens: (seat.screens ?? []).filter((s) => new RegExp(`^player r${n}\\b`).test(s.purpose)).map((s) => ({ purpose: s.purpose, text: s.text })),
    wrote: (seat.messages ?? []).filter((m) => new RegExp(`^player r${n}\\b`).test(m.purpose)).map((m) => m.text) }));
}
export function roundsMarkdown(run) {
  const lines = [header(run, `${run.key} — each round's screens, side by side`), "Each block is one player: the screen(s) it read in that round and what it wrote.", ""];
  for (const round of run.table?.rounds ?? []) {
    lines.push(`## Round ${round.n}`, "");
    for (const col of roundColumns(run, round.n)) {
      lines.push(`### ${col.character} — ${col.label}`, "");
      for (const s of col.screens) lines.push(`*${s.purpose}*`, "", quote(s.text), "");
      for (const w of col.wrote) lines.push("**Wrote:**", "", quote(w), "");
    }
  }
  return lines.join("\n");
}
export function screensHtml(run, n) {
  const cols = roundColumns(run, n);
  const t = run.table ?? {};
  const scene = (t.rounds ?? []).find((r) => r.n === n);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(run.key)} — round ${esc(n)}</title>
<style>body{font:15px/1.5 Georgia,serif;background:#1b1a18;color:#e8e2d6;margin:0;padding:24px}h1{font-size:20px;color:#d9b36c}p.meta{color:#a89f8f;font-size:13px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}.col{background:#24221f;border:1px solid #3a352d;border-radius:8px;padding:14px}.col h2{font-size:16px;color:#d9b36c;margin:0 0 6px}.who{color:#a89f8f;font-size:12px;margin-bottom:10px}.screen{white-space:pre-wrap;background:#1f1d1a;border-left:3px solid #8a6d3b;padding:8px 10px;margin:8px 0}.wrote{white-space:pre-wrap;border-left:3px solid #6b8a5b;padding:8px 10px;margin:8px 0}.label{font-size:12px;color:#a89f8f;text-transform:uppercase;letter-spacing:.05em}.dm{white-space:pre-wrap;background:#24221f;border:1px solid #3a352d;border-radius:8px;padding:14px;margin-top:16px}</style></head><body>
<h1>${esc(run.key)} — the three screens of round ${esc(n)}</h1>
<p class="meta">Game party 2 · ${esc(run.models)} · ${esc(t.rounds?.length ?? 0)} round(s), ended by ${esc(ended(t))} · synthetic content. Each column is one player's own screen in round ${esc(n)} (what the world and the relay showed that character) and what that player wrote.</p>
<div class="grid">${cols.map((c) => `<div class="col"><h2>${esc(c.character)}</h2><div class="who">${esc(c.label)}</div>${c.screens.map((s) => `<div class="label">${esc(s.purpose)}</div><div class="screen">${esc(s.text)}</div>`).join("")}${c.wrote.map((w) => `<div class="label">wrote</div><div class="wrote">${esc(w)}</div>`).join("")}</div>`).join("")}</div>
${(scene?.scenes ?? []).map((s) => `<div class="dm"><div class="label">the DM's narration of round ${esc(n)} — ${esc(s.members.join(", "))} (never shown to a player as it is; each screen is the relay's retelling)</div>${esc(s.narration ?? "")}</div>`).join("")}
</body></html>`;
}

/** The record and its pages. Returns the record's path. */
export async function writePages(run, { out }) {
  await mkdir(out, { recursive: true });
  run.situationRound = situationRound(run);
  run.letter = letterCheck(run);
  const stamp = stampOf(new Date(run.startedAt));
  const recordFile = join(out, `${STEM}-run-${stamp}.json`);
  await writeFile(`${recordFile}.tmp`, `${JSON.stringify(run, null, 2)}\n`); await rename(`${recordFile}.tmp`, recordFile);
  const dir = join(out, `${STEM}-transcripts`, run.key);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, `${run.key}-table.md`), tableTranscript(run));
  for (const seat of run.table?.seats ?? []) await writeFile(join(dir, `${run.key}-${seat.characterId}-${seat.player}.md`), playerTranscript(run, seat));
  await writeFile(join(dir, `${run.key}-rounds.md`), roundsMarkdown(run));
  const focus = run.situationRound;
  if (focus) await writeFile(join(dir, `${run.key}-round-${focus}.html`), screensHtml(run, focus));
  await writeFile(join(dir, `${run.key}-measures.md`), [header(run, `${run.key} — the per-table measures`), perTableMeasures(run)].join("\n"));
  return recordFile;
}
