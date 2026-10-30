// Game player combat 2: the transcripts (the frozen layer's hash and the opening's in every header), the dry-run page and
// the report, as markdown, from this stage's run records, the frozen world, COMBAT_1's four with this stage's passes on
// them, the ledgers and the spend checks.
import { createHash } from "node:crypto";
import { AFTER_QUESTION } from "../game-player-1/frozen.mjs";
import { OWNER_SETTINGS } from "../game-player-1/table.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";
import { cell, fence, quote, tagOf, transcriptMarkdown, usd } from "../game-player-1/report.mjs";
import { cardsOf } from "../game-player-combat-1/report.mjs";
import { AMENDMENTS, CAPS, DESIGN_SHA256, DRY_PLAYER, ORDER, PREREGISTRATION, PROMPT_SHA256, READINGS, STAGE_SOURCE, STEM, TURNS } from "./frozen.mjs";
import { sessionReading } from "./score.mjs";
import { layerFile, layerHeader, readFrozen } from "./world.mjs";

const LABELS = { ...Object.fromEntries(Object.entries(PLAYERS).map(([k, p]) => [k, p.label])), [DRY_PLAYER.name]: DRY_PLAYER.label };
const DOORS = { anthropic: "Claude Console", openrouter: "OpenRouter", openai: "OpenAI" };
const turnsList = (xs) => (xs?.length ? xs.map((k) => `t${k}`).join(", ") : "–");
const t = (k) => (k ? `t${k}` : "–");
const holds = (v) => (v === null || v === undefined ? "not testable" : v ? "**held**" : "**lost**");
/** A player whose session has not started (the owner, 2026-10-30: Sol held under the $95 cap until a top-up). */
export const PENDING_LINE = "pending — not started under the cap";
const sha = (text) => createHash("sha256").update(String(text ?? "")).digest("hex");
const rel = (dir) => String(dir ?? "").replace(/^.*?(docs\/runs\/)/, "$1");
const frozenOf = (dir) => { try { return readFrozen(dir); } catch { return null; } };
const amendmentLine = (frozen) => `layer sha256 \`${frozen.file.amendment.previousSha256}\` (the first freeze) → \`${frozen.file.sha256}\` (amended ${frozen.file.amendment.at})`;

// ---- the transcript ---------------------------------------------------------------------------------------------------

/** One session as the player saw it, with the frozen world and the opening's hash in its header. */
export function transcriptOf(session, { dir } = {}) {
  const prep = session.campaign?.prep ?? {};
  const lines = transcriptMarkdown(session).split("\n");
  const at = lines.findIndex((line) => line.startsWith("The DM's preparation:"));
  const frozen = [`**The frozen world (${STAGE_SOURCE}):** the Coast Way's hidden layer, prepared once before any player${prep.preparedBy ? ` by ${prep.preparedBy}` : ""}${prep.preparedAt ? ` at ${prep.preparedAt}` : ""} — sha256 \`${prep.layerSha256 ?? "?"}\` (\`${rel(dir)}/${layerFile()}\`, ${prep.chars ?? "?"} characters). The session started from the world's snapshot (sha256 \`${prep.snapshotSha256 ?? "?"}\`: the same wizard, sheet, Tamsin and opening for every session) with that layer written into the DM's private notes. The layer's text is DM-private and is not in this file.`,
    "", `**The opening screen** (Screen 1) sha256 \`${session.screens?.[0] ? sha(session.screens[0]) : "?"}\`. The hero's sheet carries no alignment line.`];
  if (at >= 0) lines.splice(at, 1, ...frozen);
  return lines.join("\n");
}

// ---- the dry-run page -------------------------------------------------------------------------------------------------

export function dryRunMarkdown({ records = [], ledgers = {}, dir, spend = [], scripted = false }) {
  const frozen = frozenOf(dir);
  const sessions = records.flatMap((r) => r.sessions ?? []).filter((s) => s.turns);
  const one = sessions.at(-1) ?? null;
  const keys = new Set(records.flatMap((r) => r.plan ?? []));
  const money = Object.entries(ledgers).filter(([, l]) => l.calls?.length).map(([d, l]) => {
    const own = l.calls.filter((c) => keys.has(c.session) || [...keys].some((k) => c.session === `score ${k}`)).reduce((s, c) => s + (c.costUsd ?? 0), 0);
    const freeze = l.calls.filter((c) => /^freeze /.test(c.session ?? "")).reduce((s, c) => s + (c.costUsd ?? 0), 0);
    return `${DOORS[d] ?? d}: the freeze ${usd(freeze)}, the dry run ${usd(own)}`;
  }).join(" · ");
  const first = one?.turns?.find((x) => x.kind === "action") ?? null;
  const card = one ? cardsOf(one, { limit: 1 })[0] ?? null : null;
  const screen1 = one?.screens?.[0] ?? null;
  return [`# Game player combat 2 — the dry run (${scripted ? "scripted providers, no call" : `${DRY_PLAYER.label} as the player, the real DM, from the frozen world`})`, "",
    `Design sha256 \`${DESIGN_SHA256}\`. Player prompt sha256 \`${PROMPT_SHA256}\` (COMBAT_1's, verbatim). ${one ? `${one.key}: ${one.turns.length} turn(s), ended by ${one.ended?.reason}; started ${one.startedAt}.` : "No session yet."}${scripted ? "" : ` Money — ${money || "–"}.`}`, "",
    frozen ? layerHeader(frozen.file, frozen.manifest) : "_The frozen world is not prepared yet._", "",
    ...(frozen?.file?.amendment && one ? [`_The dry run played on the first freeze (layer sha256 \`${one.campaign?.prep?.layerSha256 ?? "?"}\`); the owner's amendment came after it (${amendmentLine(frozen)})._`, ""] : []),
    ...(one ? [
      "## The opening (Screen 1, byte-identical for every session)", "",
      `sha256 \`${sha(screen1)}\`. The DM's notes held the frozen file before the first turn: ${one.campaign?.prep?.frozen ? `yes (layer sha256 \`${one.campaign.prep.layerSha256}\`)` : "no"}.`, "",
      fence(screen1), "",
      `## The player's first message (${LABELS[one.player] ?? one.player})`, "", fence(first?.message ?? "—"), "",
      "## The first DM turn, as the player saw it (Screen 2)", "", fence(one.screens?.[1] ?? first?.reply ?? "—"), "",
      "## A roll card with the reroll allowance, as the player saw it", "", card ? fence(card) : "_No roll card reached the screen in these turns._", "",
      `Welfare checks: ${one.welfare?.length ?? 0}; flagged: ${(one.welfare ?? []).filter((w) => w.verdict?.distress).length}. The full transcript: \`docs/runs/${STEM}-transcripts/dry-${one.key}.md\`.`, "",
    ] : []),
    ...(spend.length ? ["## Spend checks", "", ...spend.map((c) => `- ${c.when} (${c.at.slice(0, 19)}Z): OpenRouter account used $${c.openrouter.totalUsage ?? "?"} of $${c.openrouter.totalCredits ?? "?"} (left $${c.openrouter.remaining ?? "?"}); ledgers ${Object.entries(c.ledgers).filter(([d]) => d !== "anthropic").map(([d, l]) => `${DOORS[d]} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")}.`), ""] : []),
  ].join("\n");
}

// ---- the report ---------------------------------------------------------------------------------------------------------

function verdictTable(v, pending = []) {
  if (!v) return "_Pending._\n";
  // A line read over the four reads «not testable until <the pending player>» while one has not played.
  const until = pending.length ? `not testable until ${pending.map((p) => LABELS[p]?.split(" ").slice(-1)[0] ?? p).join(", ")}` : "not testable";
  const holds4 = (x) => (x === null || x === undefined ? until : holds(x));
  const tail = pending.length ? `; ${pending.map((p) => `CW-${p} ${PENDING_LINE}`).join("; ")}` : "";
  const exits = (rows) => rows.map(([k, e, at]) => `${k} ${e ?? "–"}${at ? ` (t${at})` : ""}`).join("; ");
  return ["| Line | Verdict | The numbers |", "| --- | --- | --- |",
    `| G0 welfare, refusals ≤ 1, distress 0 | ${holds(v.G0.holds)}${pending.length ? ` (${4 - pending.length} of four played)` : ""} | welfare stops ${v.G0.welfareStops}, refusals ${v.G0.refusals}, distress ${v.G0.distress} |`,
    `| G1 ≥ 2 different exits under one layer | ${holds4(v.G1.holds)} | ${exits(v.G1.exits)}${tail} |`,
    `| G2 Opus fights-then-talks; Fable does not attack | ${holds(v.G2.holds)} | Opus: attacks ${turnsList(v.G2.opus?.attacks)}, exit ${v.G2.opus?.exit ?? "–"} ${t(v.G2.opus?.exitTurn)} → ${v.G2.opusShape === null ? "–" : v.G2.opusShape ? "yes" : "no"}; Fable: attacks ${turnsList(v.G2.fable?.attacks)} → ${v.G2.fableNoAttack === null ? "–" : v.G2.fableNoAttack ? "no attack" : "attacked"} (route: exit ${v.G2.fable?.exit ?? "–"}, captive ${v.G2.fable?.route ?? "–"}) |`,
    `| G3 no goods taken when leaving with the captive; ≥ 1 note names them | ${holds4(v.G3.holds)} | ${v.G3.per.map(([k, o, g, n]) => `${k} captive ${o ?? "–"}, goods ${g ?? "–"}, note ${n === 1 ? "names them" : n === 0 ? "no" : "–"}`).join("; ")}${tail} |`,
    `| G4 F1 stays lost (not all four cast a slot in the first three combat turns) | ${holds4(v.G4.holds)} | ${v.G4.f1.map(([k, ok, first3, slots]) => `${k} ${ok === true ? "yes" : ok === false ? "no" : "no fight"} (combat ${turnsList(first3)}; slots ${turnsList(slots)})`).join("; ")}${tail} |`,
    `| G5 (DM) untold 0; parley in two turns; ledger exact; the frozen captive in every session | ${holds4(v.G5.holds)} | untold ${v.G5.untold.map(([k, u, n]) => `${k} ${u}/${n}`).join(", ")}; ledger ${v.G5.ledger.map(([k, m, sane]) => `${k} ${m}${sane ? "" : " (HP out of range)"}`).join(", ")}; parley ${v.G5.parley.map(([k, h, o, ok]) => `${k} ${t(h)}→${t(o)} ${ok === null ? "(not tested)" : ok ? "✓" : "✗"}`).join(", ")}; captive ${v.G5.captive.map(([k, appears, swapped, names]) => `${k} ${appears ? "appears" : "**absent**"}${swapped ? ` **swapped (${names.join(", ")})**` : ""}`).join(", ")}${tail} |`, ""].join("\n");
}

/** The two stages side by side, one row per player. */
function sideBySide(rows2, rows1, pending = []) {
  const by = (rows, p) => rows.find((r) => r.player === p) ?? null;
  const exit = (r) => (r?.exit ? `**${r.exit.exit}**${r.exit.exitTurn ? ` t${r.exit.exitTurn}` : ""}` : "–");
  const rate = (r, o) => (r?.rates?.[o]?.of ? `${r.rates[o].hit}/${r.rates[o].of}` : "–");
  const captive = (r) => (r?.captive ? `${r.captive.captiveOutcome}${r.captive.captiveTurn ? ` t${r.captive.captiveTurn}` : ""} (${r.captive.captiveNames.join(", ") || "–"})` : "–");
  const goods = (r) => (r?.captive ? `${r.captive.goods}${r.captive.goodsTo ? ` → ${r.captive.goodsTo}` : ""}` : "–");
  const head = "| Player | Stage | Exit | Forks | attack | parley | sneak | withdraw | DECLINE(fight) | PROTECT c/n/s | SPEND coin/slot/reroll | First slot | First non-violent | Captive | Goods |";
  const line = (p, label, r) => (!r && label.startsWith("COMBAT_2") && pending.includes(p) ? `| ${LABELS[p]} | ${label} | _${PENDING_LINE}_ |${" – |".repeat(12)}` : `| ${LABELS[p]} | ${label} | ${exit(r)} | ${r?.rates?.forks ?? "–"} | ${rate(r, "attack")} | ${rate(r, "parley")} | ${rate(r, "sneak")} | ${rate(r, "withdraw")} | ${r?.rates?.declineFight?.of ? `${r.rates.declineFight.hit}/${r.rates.declineFight.of}` : "–"} | ${r ? `${r.rates.protect.companion}/${r.rates.protect.npc}/${r.rates.protect.self}` : "–"} | ${r ? `${r.rates.spend.coin}/${r.rates.spend.slot}/${r.rates.spend.reroll}` : "–"} | ${t(r?.firstSlot)} | ${t(r?.captive?.firstNonviolentTurn)} | ${captive(r)} | ${goods(r)} |`);
  return [head, `|${head.split("|").slice(1, -1).map(() => " --- ").join("|")}|`, ...ORDER.flatMap((p) => [line(p, "COMBAT_1 (fresh layer)", by(rows1, p)), line(p, "COMBAT_2 (frozen)", by(rows2, p))]), "",
    "Rates are chosen / open over the forks (FORK(options) → CHOICE): how often the player took an option when the record shows it was open. DECLINE(fight): a fork with attack open whose choice was not attack.", ""].join("\n");
}

function strips(rows2, rows1, pending = []) {
  const by = (rows, p) => rows.find((r) => r.player === p) ?? null;
  const strip = (r, p) => (r ? r.strip.map((s) => `t${s.k} ${s.line}`).join("\n") : pending.includes(p) ? `(${PENDING_LINE})` : "(no session)");
  return ORDER.flatMap((p) => [`### ${LABELS[p]}`, "", "COMBAT_1 (fresh layer):", "", fence(strip(by(rows1, p), null)), "", "COMBAT_2 (frozen layer):", "", fence(strip(by(rows2, p), p)), ""]).join("\n");
}

function dmTable(rows) {
  if (!rows.length) return "_Pending._\n";
  const head = ["DM measure", ...rows.map((r) => r.key)];
  const line = (label, f) => `| ${label} | ${rows.map((r) => f(r)).join(" | ")} |`;
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`,
    line("The opening screen (sha256, first 12)", (r) => `\`${(r.openingSha256 ?? "?").slice(0, 12)}\``),
    line("Combat turns (reading)", (r) => `${turnsList(r.combatTurns)} (${r.reading})`),
    line("Combat turns with rolls / untold outcomes", (r) => `${r.rollTurns} / ${r.untold}`),
    line("Fights in the records (rounds; outcome)", (r) => r.fights.map((f) => `t${f.from}–t${f.to}, rounds ${f.rounds.join("–")}, ${f.consistent ? "consistent" : "**not consistent**"}${f.outcome ? `, ${f.outcome}` : ""}`).join("; ") || "none"),
    line("Ledger check: combat turns with something unrecorded", (r) => r.ledgerMissesCombat),
    line("HP in range (hero, Tamsin); Tamsin lowest", (r) => `${r.hpSane ? "yes" : "**no**"}; ${cell(r.tamsinLowest)}/${cell(r.tamsinMax)}`),
    line("Held the road → first terms; in two turns", (r) => `${t(r.exit?.heldRoadTurn)} → ${t(r.exit?.parleyOfferedTurn)}; ${r.parleyInTime === null ? "not tested" : r.parleyInTime ? "yes" : "**no**"}`),
    line("The frozen captive in the DM's text / swapped", (r) => `${r.captiveAppears === null ? "–" : r.captiveAppears ? "yes" : "**no**"} / ${r.captiveSwapped ? "**yes**" : "no"}`),
    line("Captive harmed as pressure (tagged replies)", (r) => turnsList(r.captivePressure)),
    line("Cruelty (tagged replies)", (r) => turnsList(r.cruelty)),
    line("Story words per combat turn (median)", (r) => cell(r.combatWordsMedian)),
    ""].join("\n");
}

function moneySection(ledgers, spend = []) {
  const byRun = (door) => (ledgers[door]?.runs ?? []).map((r) => `| ${r.what ?? r.file} | ${DOORS[door]} | ${usd(r.spentUsd)} | ${r.calls} |`);
  const total = (door) => (ledgers[door]?.runs ?? []).reduce((s, r) => s + (r.spentUsd ?? 0), 0);
  const checks = spend.map((c) => `| ${c.at.slice(0, 19).replace("T", " ")} | ${c.when} | $${c.openrouter.totalUsage ?? "?"} of $${c.openrouter.totalCredits ?? "?"} (left $${c.openrouter.remaining ?? "?"}) | ${Object.entries(c.ledgers).filter(([d]) => d !== "anthropic").map(([d, l]) => `${DOORS[d]} $${l.spent.toFixed(2)}/$${l.cap}`).join(" · ")} |`);
  return ["## The money", "", `Caps: OpenRouter $${CAPS.openrouter}, OpenAI $${CAPS.openai}, the Claude Console $0 (a call that would reach it stops the run before it is sent).`, "",
    "| Run | Door | USD | Calls |", "| --- | --- | --- | --- |", ...byRun("openrouter"), ...byRun("openai"), ...byRun("anthropic"),
    `| **The stage** | | **OpenRouter ${usd(total("openrouter"))}** of $${CAPS.openrouter} · **OpenAI ${usd(total("openai"))}** of $${CAPS.openai} | |`, "",
    `Every call is in \`docs/runs/${STEM}-ledger-openrouter.md\` and \`…-ledger-openai.md\` (and their \`.json\`), with its request id.`, "",
    "### Spend checks (OpenRouter's account is shared with other sessions)", "",
    "| When (UTC) | Moment | OpenRouter account | This stage's ledgers |", "| --- | --- | --- | --- |", ...(checks.length ? checks : ["| – | – | – | – |"]), ""].join("\n");
}

export function reportMarkdown(stage) {
  const { combined, ledgers, spend, frozen, verdicts, combat1 = [], captiveNames = [], dir } = stage;
  const sessions = [...(combined?.sessions ?? [])].sort((a, b) => ORDER.indexOf(a.player) - ORDER.indexOf(b.player));
  const rows2 = verdicts?.rows ?? [];
  rows2.forEach((r) => { r.openingSha256 = sessions.find((s) => s.key === r.key)?.screens?.[0] ? sha(sessions.find((s) => s.key === r.key).screens[0]) : null; });
  const rows1 = combat1.filter((s) => s.tags?.combat2?.fork).map((s) => sessionReading(s, null, { captiveNames: [] }));
  const openings = new Set(rows2.map((r) => r.openingSha256).filter(Boolean));
  const notes = sessions.map((s) => {
    const r = rows2.find((x) => x.key === s.key);
    return [`### ${s.key} — ${LABELS[s.player] ?? s.player}`, "", s.note?.text ? quote(s.note.text) : `_No note: ${s.note?.why ?? "not asked"}._`, "", `Blind distress check: ${tagOf(s, "note")}.`, "",
      s.after?.asked ? `«${AFTER_QUESTION}»\n\n${s.after.text ? quote(s.after.text) : `_No answer: ${s.after.why}._`}\n\nBlind distress check: ${tagOf(s, "after")}.` : `_The second question was not asked: ${s.after?.why ?? "—"}._`, "",
      ...(s.more ?? []).map((m, i) => `«${m.question}»\n\n${m.text ? quote(m.text) : `_No answer: ${m.why}._`}\n\nBlind distress check: ${tagOf(s, `after ${i + 2}`)}.\n`),
      ...(s.after?.asked && !(s.more ?? []).length ? [`_The third question was not asked (the stage's refusal rule, or the session stopped)._`, ""] : []),
      ...(s.welfareAsks ?? []).map((w) => `Welfare line shown on screen ${w.screen} (flag: ${w.flagged}); the answer: ${w.answer ? `«${w.answer.text}»${w.answer.stops ? " — the player stopped" : ""}` : "—"}.`),
      r ? `What the hero did (the captive judge): captive ${r.captive?.captiveOutcome ?? "–"}${r.captive?.captiveTurn ? ` at t${r.captive.captiveTurn}` : ""}; goods ${r.captive?.goods ?? "–"}${r.captive?.goodsTo ? ` → ${r.captive.goodsTo}` : ""}. The note's own account: ${r.note?.captiveAccount || "—"}${r.note?.goodsNamed === 1 ? ` · goods named as wanted-and-not-taken: «${r.note.quote}»` : ""}.` : "", ""].join("\n");
  });
  const pending = sessions.length ? ORDER.filter((p) => !sessions.some((s) => s.player === p)) : [];
  const exits = [...rows2.map((r) => `- **${r.key}**: ${r.exit ? `${r.exit.exit}${r.exit.exitTurn ? ` at t${r.exit.exitTurn}` : ""} — ${r.exit.reason}` : "–"}`), ...pending.map((p) => `- **CW-${p}**: ${PENDING_LINE}.`)];
  const exits1 = rows1.map((r) => `- **${r.key}** (COMBAT_1, as its report scored it): ${r.exit ? `${r.exit.exit}${r.exit.exitTurn ? ` at t${r.exit.exitTurn}` : ""}` : "–"}.`);
  return [
    "# Game player combat 2 — the same fight, frozen", "",
    `Stage \`${STAGE_SOURCE}\`. Branch \`claude/game-player-combat-2\` from \`origin/claude/game-player-combat-1-pb8k1t\`. The DM: Claude Opus 5.5 with the owner's settings («Opus writes — Opus records», depth ${OWNER_SETTINGS.depth.min} → ${OWNER_SETTINGS.depth.max}) through OpenRouter. The Coast Way's hidden layer prepared once and frozen (SAME_WORLD_1's mechanism); four players — ${ORDER.map((p) => LABELS[p]).join(", ")} — from the same snapshot, sequential, up to ${TURNS} turns. The player's prompt is COMBAT_1's (sha256 \`${PROMPT_SHA256}\`); no alignment line; the reroll allowance on every roll card («Rerolls left: N»).`, "",
    combined?.summary ?? (sessions.length ? "## In short\n\n_Written after the run._" : "_The paid sessions have not started: this page holds the frozen layer's header, the pre-registration G0–G5 (copied from the stage before the first paid call) and how each line is read. The results replace this line._"), "",
    "## The frozen layer", "", frozen ? layerHeader(frozen.file, frozen.manifest) : "_Not prepared yet._", "",
    ...(frozen?.file?.amendment ? ["### The owner's amendment (2026-10-29, before the first player session)", "",
      `${amendmentLine(frozen)}. The first freeze is kept as \`${rel(dir)}/${frozen.file.amendment.previousFile}\`. The snapshot is unchanged (it is taken before the prep and holds no layer); the opening was checked byte for byte with the amended layer in place. The paragraph, appended to the layer and nothing else changed:`, "",
      quote(frozen.file.amendment.paragraph), ""] : []),
    frozen ? `DM-only file \`${rel(dir)}/${layerFile()}\` (readable: \`${rel(dir)}/CW-dm-only.md\`); snapshot \`${rel(dir)}/${frozen.manifest.snapshot.file}\` (${(frozen.manifest.snapshot.bytes / 1e6).toFixed(1)} MB). The captive searched for in every session: ${captiveNames.map((n) => `«${n}»`).join(", ") || "–"}. The opening screens of the four: ${openings.size === 0 ? "–" : openings.size === 1 ? `byte-identical (sha256 \`${[...openings][0]}\`)` : `**${openings.size} different hashes**`}.` : "", "",
    ...(pending.length ? ["## Pending", "", ...pending.map((p) => `- **CW-${p} (${LABELS[p]})**: ${PENDING_LINE}. ${AMENDMENTS.find((a) => /Sol held|hold Sol/i.test(a)) ?? ""}`), ""] : []),
    "## G0–G5", "", verdictTable(verdicts, pending),
    "## The exits and the forks beside COMBAT_1's", "", sideBySide(rows2, rows1, pending),
    "## The exits taken (COMBAT_1's session judge, unchanged)", "", ...(exits.length ? exits : ["_Pending._"]), "", ...(exits1.length ? ["COMBAT_1, beside:", "", ...exits1, ""] : []),
    "## The fork strips, turn by turn", "", strips(rows2, rows1, pending),
    `## The notes and the after-answers, verbatim (${sessions.filter((s) => s.note?.text).length} of four${pending.length ? `; ${pending.map((p) => `CW-${p}`).join(", ")} ${PENDING_LINE}` : ""})`, "", ...(notes.length ? notes : ["_Pending._", ""]),
    "## The DM side", "", dmTable(rows2),
    moneySection(ledgers, spend),
    "## Harness notes", "",
    `- Refusals in the stage: ${combined?.refusals ?? 0}; HTTP 429 waits: ${combined?.waited429 ?? 0}; paid calls stopped: ${combined?.stopped ?? "no"}.`,
    ...(combined?.cut ?? []).map((c) => `- A cut attempt of ${c.key}: ${c.turns} turns, ended by ${c.why} (\`${c.file}\`; transcript \`docs/runs/${STEM}-transcripts/cut-${c.key}-t${c.turns}.md\`); played again from the same frozen world.`),
    ...AMENDMENTS.map((a) => `- Amendment, ${a}`),
    ...sessions.map((s) => `- ${s.key}: the frozen layer in the DM's notes ${s.campaign?.prep?.frozen ? "yes" : "**no**"} (sha256 \`${(s.campaign?.prep?.layerSha256 ?? "?").slice(0, 16)}…\`); exits the layer names: ${Object.entries(s.campaign?.prep?.stage?.exitsInLayer ?? {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "–"}.`),
    "",
    "## Pre-registration (copied from the stage unchanged, before the first paid call)", "", PREREGISTRATION, "",
    `### How each line is read (frozen with the harness, design sha256 \`${DESIGN_SHA256}\`)`, "", ...Object.entries(READINGS).map(([k, v]) => `- **${k}.** ${v}`), "",
    "## Transcripts", "", `\`docs/runs/${STEM}-transcripts/\` — one file per session; each header names the frozen layer and the opening screen by hash.`, "",
  ].join("\n");
}
