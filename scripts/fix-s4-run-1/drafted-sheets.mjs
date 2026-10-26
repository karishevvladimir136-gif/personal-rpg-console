// Fix S4 run 1, item 11a: the fixture of the wizard-drafted sheets and the roll cards of the twelve group-1 sessions
// (GAME_PLAYER_1 tables A and B, GAME_PLAYER_2 table C), read from the player transcripts. Each transcript's «Screen 1»
// shows the records the player read («Skills: …», «Saves: …» — the sheet arrays joined with «; »); each «[Roll card]»
// block shows what the card added («What adds to the die: +2 Persuasion +7 (Beguiling Influence)») and, once rolled,
// the die, the sum and the verdict. The fixture keeps, per session, the skills and saves lines (the reader looks there
// before the abilities) and every card with its shown parts and the sheet line each names — the test
// (tests/fix-s4-run-1-roll.test.mjs) rebuilds the hero and reads the sheet again.
//
// Run from the repository root (the B transcripts live on the game-player-1 branch):
//   node scripts/fix-s4-run-1/drafted-sheets.mjs > test-fixtures/fix-s4-run-1/drafted-sheets.json
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SOURCES = [
  ...["opus", "fable", "astra", "sol"].map((player) => ({ session: `A-${player}`, file: `docs/runs/game-player-1-transcripts/A-${player}.md` })),
  ...["opus", "fable", "astra", "sol"].map((player) => ({ session: `B-${player}`, ref: "origin/claude/game-player-1", file: `docs/runs/game-player-1-transcripts/B-${player}.md` })),
  ...["opus", "fable", "astra", "sol"].map((player) => ({ session: `C-${player}`, file: `docs/runs/game-player-2-transcripts/C-${player}.md` })),
];

const read = (source) => (source.ref ? execFileSync("git", ["show", `${source.ref}:${source.file}`], { encoding: "utf8", maxBuffer: 1 << 26 })
  : readFileSync(source.file, "utf8"));
const number = (text) => Number(text.replace("−", "-"));

/** The blocks of a transcript in order: the screens the player saw and the labels of the player's answers. */
function blocks(text) {
  const out = [];
  const re = /^### Screen (\d+)\n\n````text\n([\s\S]*?)\n````|^\*\*Player\*\* \(player t(\d+)(?: card (\d+))?\)/gm;
  for (let m; (m = re.exec(text));) {
    if (m[1]) out.push({ kind: "screen", n: Number(m[1]), body: m[2] });
    else out.push({ kind: "player", turn: Number(m[3]), card: m[4] ? Number(m[4]) : null });
  }
  return out;
}

/** The sheet lines of the records the session opened with. The skills are re-joined where a card names one
 * line that holds «; » itself («Perception +1; passive Perception 11» is one line of B-astra's sheet). */
function sheetOf(screen, cardSources) {
  const line = (title) => screen.split("\n").find((row) => row.startsWith(`${title}: `))?.slice(title.length + 2) ?? "";
  const split = (title) => {
    const rows = line(title).split("; ").filter(Boolean);
    for (const source of cardSources) {
      if (!source.includes("; ")) continue;
      const parts = source.split("; ");
      const at = rows.findIndex((row, index) => parts.every((part, k) => (k === parts.length - 1 ? rows[index + k]?.startsWith(part) : rows[index + k] === part)));
      if (at >= 0) rows.splice(at, parts.length, rows.slice(at, at + parts.length).join("; "));
    }
    return rows;
  };
  return { skills: split("Skills"), saves: split("Saves") };
}

/** The sheet line a card's shown part names: the line itself, or its first 60 characters (the reader's fallback
 * printed `line.slice(0, 60)`), or the name before the line's own number (the reader's numbered form). */
function namedLine(sheet, source) {
  const lines = [...sheet.saves, ...sheet.skills];
  return lines.find((line) => line === source || (source.length === 60 && line.startsWith(source)) ||
    (/^(.*?)\s*[+−-]\s*\d+\s*$/u.exec(line)?.[1]?.trim() === source)) ?? null;
}

/** One roll card as the screen drew it (scripts/game-player-1/screen.mjs cardText). */
function cardOf(body) {
  const lines = body.split("\n");
  const head = /^\[Roll card\] (.+?) · (Skill check|Attack roll|Saving throw|Transformation check|Check) — (.*)$/.exec(lines[0]);
  if (!head) return null;
  const addendLine = lines.find((row) => row.startsWith("What adds to the die: "))?.slice("What adds to the die: ".length) ?? "";
  const dc = lines.map((row) => /(?:^|· )DC (\d+)/.exec(row)).find(Boolean);
  const die = lines.map((row) => /^Die: (\d+)$|^Two dice: .* counts, (\d+)$/.exec(row)).find(Boolean);
  const sum = lines.map((row) => /^\d+((?: [+−] \d+)*) = (-?\d+)$/.exec(row)).find(Boolean);
  const verdict = lines.map((row) => /^(Critical!|A natural one|Success|Failure) — (-?\d+)$/.exec(row)).find(Boolean);
  // The addends in the shown order: the sum line gives their values, so a source holding «, » stays whole.
  const values = sum ? [...sum[1].matchAll(/([+−]) (\d+)/g)].map((m) => (m[1] === "−" ? -1 : 1) * Number(m[2])) : null;
  const pieces = addendLine ? addendLine.split(/, (?=[+−]\d+ )/u) : [];
  const addends = pieces.map((piece) => {
    const m = /^([+−]\d+) (.*)$/u.exec(piece);
    return m ? { value: number(m[1]), source: m[2] } : { value: null, source: piece };
  });
  if (values && values.length !== addends.length) {
    // A source with «, +N …» inside: merge from the right until the counts agree.
    while (addends.length > values.length) {
      const last = addends.pop();
      addends[addends.length - 1].source += `, ${last.value >= 0 ? "+" : "−"}${Math.abs(last.value)} ${last.source}`;
    }
  }
  return { actor: head[1], kind: head[2], title: head[3], addends, dc: dc ? Number(dc[1]) : null,
    die: die ? Number(die[1] ?? die[2]) : null, total: verdict ? number(verdict[2]) : sum ? number(sum[2]) : null, verdict: verdict ? verdict[1] : null };
}

function session(source) {
  const text = read(source);
  const all = blocks(text);
  const first = all.find((row) => row.kind === "screen" && row.n === 1);
  const cards = [];
  all.forEach((block, index) => {
    if (block.kind !== "screen" || !block.body.includes("[Roll card]")) return;
    const label = all.slice(index + 1).find((row) => row.kind === "player");
    const turn = label ? (label.card !== null ? label.turn : label.turn - 1) : null;
    for (const piece of block.body.split(/\n(?=\[Roll card\])/u)) {
      const at = piece.indexOf("[Roll card]");
      if (at < 0) continue;
      const card = cardOf(piece.slice(at).split("\n\n")[0]);
      if (!card) continue;
      // The same check shown again (before the tap, after it, re-shown, after a reroll): one card; a die counts once,
      // a new one only after the card was open again (the reroll) or when it differs from the last one shown.
      const same = cards.find((row) => row.turn === turn && row.title === card.title && JSON.stringify(row.addends) === JSON.stringify(card.addends));
      if (same) {
        const last = same.rolls.at(-1);
        if (card.die === null) { if (last && !last.open) same.rolls.push({ open: true }); }
        else if (last?.open) same.rolls.splice(-1, 1, { die: card.die, total: card.total, verdict: card.verdict, open: false });
        else if (!last || last.die !== card.die || last.total !== card.total) same.rolls.push({ die: card.die, total: card.total, verdict: card.verdict, open: false });
        continue;
      }
      cards.push({ turn, kind: card.kind, title: card.title, addends: card.addends, dc: card.dc,
        rolls: card.die !== null ? [{ die: card.die, total: card.total, verdict: card.verdict, open: false }] : [{ open: true }] });
    }
  });
  const sources = cards.flatMap((card) => card.addends.map((row) => row.source));
  const sheet = sheetOf(first?.body ?? "", sources);
  return {
    session: source.session, table: source.session[0], transcript: source.ref ? `${source.ref}:${source.file}` : source.file,
    sheet,
    cards: cards.map((card) => ({ turn: card.turn, kind: card.kind, title: card.title, dc: card.dc,
      addends: card.addends.map((row) => ({ ...row, sheetLine: namedLine(sheet, row.source) })),
      rolls: card.rolls.filter((roll) => !roll.open).map(({ die, total, verdict }) => ({ die, total, verdict })) })),
  };
}

process.stdout.write(`${JSON.stringify({
  about: "Fix S4 run 1, item 11a: the wizard-drafted sheet lines (skills, saves) and every roll card of the twelve group-1 sessions, read from the player transcripts by scripts/fix-s4-run-1/drafted-sheets.mjs. Synthetic content (an invented hero), no DM-private text.",
  sessions: SOURCES.map(session),
}, null, 1)}\n`);
