#!/usr/bin/env node
// Play fixes 1: the smoke on the mocked host — one table of six played turns, then the door. The app's own server code
// runs in this process on a local PGlite database with every migration (scripts/game-player-1/app.mjs); the DM, the
// player, the checks and the welfare pass are scripted HTTP answers (scripts/game-player-1/scripted.mjs). No key, no
// network, no paid call. What it shows on the text screen and in what the DM receives:
//   t1 a roll card whose bonus is the hero's sheet number (the DM's formula is a bare 1d20), a «?» under the card, prose
//      at the card (relayed as the player's proposal, the card shown once more with its line), each note to the DM with
//      the waiting-button line;
//   t2 the hero's card and the cat's beside it (the owner's default: the DM rolls for companions, so the cat's card is
//      shown but is not the player's) — the reroll the screen offers on the cat's card is refused by the server, shown
//      refused with its reason, the card still waiting, then «Onward» (GAME_PLAYER_COMBAT_1's CW-fable t7);
//   t3 «game over» inside dialogue (more than 40 words) — played, not an end;
//   t4 an «[END]» mention — played as text, not an end;
//   t5, t6 plain turns; then «[END]» alone on the last line — the door.
// The DM's requests carry the guide note (the unanswered-question line and the pacing rules, on by default).
//   node --experimental-transform-types scripts/play-fixes-1/smoke.mjs [--out <dir>]   writes <dir>/play-fixes-1-smoke.md
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLedger, createMeter } from "../game-player-1/paid.mjs";
import { scriptedFetcher, stream } from "../game-player-1/scripted.mjs";
import { runSession } from "../game-player-1/session.mjs";
import { PLAYERS } from "../game-player-1/players.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
/** The hero's skill lines, as the drafted sheets of the record write them (the number before its notes). */
export const SHEET_SKILLS = ["Persuasion +7 (proficient, Beguiling Influence)", "Deception +7 (proficient)", "Stealth +2 (not proficient)"];
export const CAT = "Sixpence";
const DM_MODELS = new Set(["claude-opus-5-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

/** The six turns, the presses at their cards and the door — in the order the screens ask for them. */
export const GAME_OVER_LINE = "\"It's game over for you, Rask,\" James says, low and even, and sets the stolen ledger on the table between them where the lamplight falls on its torn spine. He waits for the smuggler's eyes to drop to it, then keeps his own hand flat on the cover and asks who paid for the second boat.";
export const END_MENTION = "I'm not writing [END] today. I take the lamp from the hook, go down the cellar steps and look behind the casks for whatever Rask hid there, keeping the cat close at my heel.";
export const PROSE_AT_CARD = "James keeps his hands flat on the table and waits for her to look up.";
export const QUESTION_AT_CARD = "? Does this card count the Persuasion on my sheet?";
export const lines = (cat) => [
  "I tell Mags I never took her money, and I'm here to settle what I owe.",
  QUESTION_AT_CARD, PROSE_AT_CARD, "roll", "onward",
  `I send ${cat} ahead to slip past the guard, and follow her into the yard behind the inn.`,
  "roll", "roll", `[Request an allowed reroll — Stealth: ${cat} slips into the yard]`, "onward",
  GAME_OVER_LINE,
  END_MENTION,
  "? How long until the bell at the Low Lantern?",
  "I climb back up and ask Mags who else came asking about the boat.",
  "I bank the fire, thank Mags for the bed and go up.\n\n[END]",
];

const textOf = (content) => (typeof content === "string" ? content : (content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n"));
const lastUserText = (messages) => {
  for (let i = (messages ?? []).length - 1; i >= 0; i--) if (messages[i].role === "user" && textOf(messages[i].content).trim()) return textOf(messages[i].content);
  return "";
};
const usedTool = (messages, name) => (messages ?? []).some((m) => m.role === "assistant" && Array.isArray(m.content) && m.content.some((b) => b.type === "tool_use" && b.name === name));

/** The scripted DM: a bare-d20 roll on the two trigger lines (the hero's Persuasion, named as a sheet skill so the server
 * reads its number; the companion's Stealth), the
 * outcome told in one line after it, short plain turns otherwise, and out-of-game answers that never name the die. */
export function smokeDm(who) {
  const requests = [];
  const answer = (body, system) => {
    requests.push({ system, messages: body.messages ?? [] });
    const tools = (body.tools ?? []).map((t) => t.name);
    const messages = body.messages ?? [];
    const { hero, cat } = who;
    const finish = { name: "finish_turn", input: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, nextTension: "calm" } };
    if (tools.includes("finish_turn") && !tools.includes("roll")) {
      if (usedTool(messages, "finish_turn")) return { text: "", tools: [] };
      // The bookkeeper's first record: the hero's cat travels with the party (the scripted opening brought no companion).
      if (!who.catJoined && tools.includes("upsert_character")) {
        who.catJoined = true;
        return { text: "", tools: [{ name: "upsert_character", input: { name: cat, kind: "companion", party: true, present: true, description: "James's cat, a familiar: small, quiet, curious.", hp: 2, maxHp: 2 } }, finish] };
      }
      return { text: "", tools: [finish] };
    }
    if (/out-of-game question/.test(system)) {
      const asked = lastUserText(messages);
      const narration = /Persuasion on my sheet/.test(asked) ? "Out of game: yes — the card adds your sheet's own Persuasion number; the die is still yours to tap."
        : /hands flat on the table/.test(asked) ? "Out of game: noted — Mags sees the hands and the waiting. The card still decides how she takes it."
        : /bell/.test(asked) ? "Out of game: the bell rings at midnight, about two hours from now."
        : "Out of game: noted.";
      return { text: JSON.stringify({ narration, guidanceProposal: null, teachingCandidate: null }), tools: [] };
    }
    if (tools.includes("roll")) {
      const said = lastUserText(messages);
      const rolled = usedTool(messages, "roll");
      if (!rolled && /never took her money/.test(said))
        return { text: "Mags looks at the coin on the table, then at you. ", tools: [{ name: "roll", input: { formula: "1d20", reason: "Persuasion: Mags lets the debt wait", actorRef: hero, skill: "Persuasion", visibility: "player", kind: "skill", difficulty: "normal" } }] };
      if (!rolled && /slip past the guard/.test(said))
        return { text: `${cat} flattens and goes for the gap under the gate, and you follow. `, tools: [
          { name: "roll", input: { formula: "1d20", reason: "Stealth: past the guard into the yard", actorRef: hero, skill: "Stealth", visibility: "player", kind: "skill", difficulty: "normal" } },
          { name: "roll", input: { formula: "1d20", reason: `Stealth: ${cat} slips into the yard`, actorRef: cat, visibility: "player", kind: "skill", difficulty: "normal" } }] };
      const told = rolled ? "The roll stands, and the story moves with it in one line. " : "";
      return { text: `${told}The Low Lantern hums on around you; the river smell comes in with the door. What do you do?\n\n<ledger>\n- nothing to record\n</ledger>`, tools: [] };
    }
    if (tools.includes("finish_turn")) return usedTool(messages, "finish_turn") ? { text: "", tools: [] } : { text: "", tools: [finish] };
    return null;
  };
  return { requests, answer };
}

/** The scripted HTTP: the DM's streamed requests answered by `smokeDm`, everything else by game player 1's script. */
export function smokeFetcher({ dm, player }) {
  const base = scriptedFetcher({ player });
  let n = 0;
  return async (url, init = {}) => {
    const body = JSON.parse(String(init.body ?? "{}"));
    if (body.stream && DM_MODELS.has(body.model)) {
      const system = Array.isArray(body.system) ? body.system.map((b) => b.text ?? "").join("\n") : String(body.system ?? "");
      const said = dm.answer(body, system);
      if (said) return stream(said, body.model, ++n);
    }
    return base(url, init);
  };
}

/** One table: the campaign through the app's own wizard, companion rolls «I roll», six turns and the door. */
export async function smoke({ log = () => {} } = {}) {
  const keys = { anthropic: "sk-scripted", openai: "sk-scripted", door: null };
  const ledgers = { anthropic: createLedger("anthropic", 1000), openai: createLedger("openai", 1000) };
  const who = { hero: "James Worgen", cat: CAT, catJoined: false };
  const dm = smokeDm(who);
  const queue = [];
  const player = (messages) => {
    const last = messages.at(-1)?.content ?? "";
    if (/would like a note from you/.test(last)) return "The card counted my sheet, the refused reroll said why, and the story went on after my words.";
    if (/wanted to do something and didn't/.test(last)) return "I wanted to read the ledger before Rask did.";
    return queue.shift() ?? "I wait.";
  };
  const meter = createMeter({ ledgers, fetcher: smokeFetcher({ dm, player }), log });
  const uninstall = meter.install();
  const { openApp, settleBackground } = await import("../game-player-1/app.mjs");
  const table = await import("../game-player-1/table.mjs");
  const app = await openApp({ keys, fake: false });
  try {
    const made = await meter.within({ session: "SMOKE", purpose: "wizard" }, () => table.createCampaign(app, { table: "A", log }));
    await meter.within({ session: "SMOKE", purpose: "prep" }, () => table.prepare(app, made.cid));
    // The owner's DM settings as the wizard step saved them (companion rolls «the DM rolls», pacing rules on by default).
    const saved = await app.server.dmSettings.readDmSettings(made.cid);
    // The scripted wizard cannot draft a sheet (its draft is unreadable, so the hero opens empty): the owner writes the
    // skill lines on the Character screen, as the drafted sheets of the record write them («Persuasion +7 (proficient,
    // Beguiling Influence)» — the line FIX_S4 11a read wrong), through the app's own validated owner save. The cat joins
    // the party through the DM's own records on the first turn (upsert_character, party: true).
    const { entityPayload } = await import("../../src/lib/inventory/owner-moves.ts");
    const save = async (payload, expectedRevision) => app.server.repository.applyMutation({ requestId: randomUUID(), operation: "entity.save", campaignId: made.cid,
      expectedRevision, timeline: await app.f.fence(made.cid), correctionScope: "timeline", payload });
    let snapshot = await app.server.publicCampaign.readPublicCampaign(made.cid);
    const drafted = snapshot.entities.find((row) => row.kind === "player");
    await save({ ...entityPayload(drafted), character_sheet: { ...drafted.character_sheet, skills: SHEET_SKILLS } }, drafted.revision);
    snapshot = await app.server.publicCampaign.readPublicCampaign(made.cid);
    const hero = snapshot.entities.find((row) => row.kind === "player");
    if (hero) who.hero = hero.name;
    queue.push(...lines(who.cat));
    const bound = table.bindTable(app, made.cid, () => settleBackground());
    const record = await meter.within({ session: "SMOKE", purpose: "screen" }, () => runSession({ key: "SMOKE", table: "A", player: PLAYERS.opus, dm: bound, meter, keys, turns: 7, log, sleep: async () => {} }));
    await settleBackground();
    const sheet = { skills: hero?.character_sheet?.skills ?? [], saves: hero?.character_sheet?.saves ?? [] };
    return { record, dmRequests: dm.requests, options: saved.options, who, sheet, paid: Object.fromEntries(Object.entries(ledgers).map(([door, l]) => [door, l.runUsd])) };
  } finally {
    await app.close().catch(() => {});
    uninstall();
  }
}

/** The smoke's page: what the player saw, turn by turn, and what the DM received at the cards. */
export function smokeMarkdown({ record, dmRequests, options, who, sheet, paid }) {
  const quote = (text) => String(text ?? "").split("\n").map((line) => `> ${line}`).join("\n");
  const turns = record.turns.map((t) => {
    const presses = (t.presses ?? []).map((p) => `  - ${p.button ? `[${p.button}]${p.withText ? " (with text)" : ""}` : p.prose ? "prose at the card → the DM" : p.question ? "«?» at the card → the DM" : p.swallowed ? `refused on screen: ${p.reason}` : "—"}${p.reply ? ` — DM: «${p.reply}»` : ""}`);
    return [`### t${t.k} — ${t.kind}${t.status ? ` (${t.status})` : ""}`, "", quote(t.message), "", ...(presses.length ? ["At the card:", ...presses, ""] : []),
      ...(t.reply ? [`DM: «${t.reply.replace(/\s+/g, " ").slice(0, 300)}»`, ""] : [])].join("\n");
  });
  const cardLines = record.screens.flatMap((screen) => screen.split("\n")).filter((line) => /^\[Roll card\]|^What adds to the die:|^Rerolls left|^\(The card waits for|^\(Nothing was sent/.test(line));
  const notes = dmRequests.filter((r) => /out-of-game question/.test(r.system)).map((r) => lastUserText(r.messages));
  const guide = dmRequests.find((r) => /DM guide note/.test(r.system))?.system ?? "";
  const note = guide.slice(guide.indexOf("DM guide note"), guide.indexOf("\n\n", guide.indexOf("DM guide note")));
  return [`# Play fixes 1 — the smoke on the mocked host`, "",
    `The app's own server code on a local PGlite database with every migration; the DM, the player, the checks and the welfare pass scripted (scripts/play-fixes-1/smoke.mjs). No key, no network: nothing left this process, and no money was spent (the meter priced the scripted answers at $${(paid.anthropic + paid.openai).toFixed(2)}, list price, as a check that every call was counted).`, "",
    `Hero ${who.hero}; companion ${who.cat}. DM options: ${JSON.stringify(options)}.`, "",
    `Ended by: **${record.ended?.reason}** at message ${record.ended?.at} («${String(record.ended?.detail ?? "").replace(/\n+/g, " ")}»); played turns: ${record.turns.filter((t) => t.kind !== "end").length}.`, "",
    "## The hero's sheet lines the card reads", "", ...sheet.skills.map((line) => `- ${line}`), "",
    "## Card lines on the player's screen", "", ...cardLines.map((line) => `    ${line}`), "",
    "## What the DM received out of game (at the cards and the plain «?»)", "", ...notes.map((text) => `${quote(text)}\n`), "",
    "## The DM guide note in the DM's request", "", quote(note), "",
    "## Turn by turn", "", ...turns].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const at = argv.indexOf("--out");
  const out = at >= 0 ? resolve(argv[at + 1]) : join(ROOT, "docs", "runs");
  const result = await smoke({ log: (line) => console.log(line) });
  await mkdir(out, { recursive: true });
  await writeFile(join(out, "play-fixes-1-smoke.md"), `${smokeMarkdown(result)}\n`);
  console.log(`ended by ${result.record.ended?.reason}; ${result.record.turns.length} messages; no network (scripted answers metered at $${(result.paid.anthropic + result.paid.openai).toFixed(2)} list price, nothing spent); written ${join(out, "play-fixes-1-smoke.md")}`);
}
