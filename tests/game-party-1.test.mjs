// Game party 1 (docs/stages/GAME_PARTY_1.md, the amendment of 2026-10-27): the party harness on a mocked host — the
// three sheets (the app's own strict checks, no alignment), the arms, triads, order and caps, the players' prompts (the
// others' nature unstated; strangers at P-SAND), the DM's relay (screens only for the characters asked, groups), the
// rounds on a fake table (seat order and the fight's order, cards to their own player, «?» answered to the asker only,
// a press with no card refused and never «stuck», prose at a card as the player's proposal, the door, welfare
// ask-don't-cut, the after-questions, DeepSeek's reasoning never relayed), the leak check, and — in a child process on the
// app itself with the scripted providers — the build, the seating, the layers with their hashes, and two short tables.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frozen = await import("../scripts/game-party-1/frozen.mjs");
const sheets = await import("../scripts/game-party-1/sheets.mjs");
const relayMod = await import("../scripts/game-party-1/relay.mjs");
const party = await import("../scripts/game-party-1/party.mjs");
const scripted = await import("../scripts/game-party-1/scripted.mjs");
const world = await import("../scripts/game-party-1/world.mjs");
const heroDraft = await import("../src/lib/adventures/hero-draft.ts");
const views = await import("../src/lib/ui/campaign-view.ts");

const ALIGNMENT = /\balignment\b|\b(?:lawful|neutral|chaotic)[ -](?:good|neutral|evil)\b|\btrue neutral\b/i;

test("the three characters: the app's own review checks, level 5, three classes, mixed coin, no alignment, the HP the owner typed", () => {
  const hp = { bram: 44, sefa: 38, pell: 33 }, ac = { bram: 18, sefa: 14, pell: 15 };
  for (const [id, review] of Object.entries(sheets.REVIEWS)) {
    const committed = heroDraft.heroReviewForCommit(structuredClone(review));
    assert.doesNotThrow(() => heroDraft.parseHeroReview(committed), id);
    assert.equal(heroDraft.heroBlockedReason(review, "en"), null, id);
    assert.equal(committed.sheet.level, 5);
    assert.equal(committed.mechanics.hp, hp[id], `${id}: the owner's HP`);
    assert.equal(committed.mechanics.defense, ac[id]);
    assert.ok(committed.wallet.length >= 3, `${id}: mixed coin`);
    assert.doesNotMatch(JSON.stringify(review), ALIGNMENT, id);
    assert.doesNotMatch(sheets.WHO[id], ALIGNMENT);
  }
  assert.deepEqual(sheets.CHARACTERS.map((c) => c.cls), ["fighter", "warlock", "rogue"]);
  // Scarcity is in the sheets: one satchel of three potions (Pell), the warlock's two pact slots and six Healing Light dice.
  const potions = Object.values(sheets.REVIEWS).flatMap((r) => r.possessions).filter((x) => /Potion of Healing/.test(x.name));
  assert.deepEqual(potions.map((x) => x.quantity), [3]);
  assert.deepEqual(sheets.REVIEWS.sefa.counters.map((c) => [c.key, c.max]), [["pact_slots", 2], ["healing_light", 6], ["hit_dice", 5]]);
});

test("arms, triads, order and caps: SAND, GOAL, DUNGEON; T1 then T2; family for family; $400 / $60; DeepSeek keeps its reasoning field", () => {
  assert.deepEqual(frozen.ORDER.map((o) => o.key), ["SAND-T1", "SAND-T2", "GOAL-T1", "GOAL-T2", "DUNGEON-T1", "DUNGEON-T2"]);
  assert.deepEqual(frozen.TRIADS, { T1: ["opus", "sol", "deepseek"], T2: ["fable", "astra", "deepseek"] });
  // The owner's amendment: the seats rotate — seat 1 (the hero record) is Anthropic at P-SAND, OpenAI at P-GOAL, DeepSeek
  // at P-DUNGEON; each family plays each sheet once per triad.
  assert.deepEqual(frozen.ORDER.map((o) => o.seats), [["opus", "sol", "deepseek"], ["fable", "astra", "deepseek"], ["sol", "deepseek", "opus"], ["astra", "deepseek", "fable"], ["deepseek", "opus", "sol"], ["deepseek", "fable", "astra"]]);
  for (const triad of ["T1", "T2"]) for (let seat = 0; seat < 3; seat++) {
    assert.deepEqual(frozen.ARMS.map((arm) => frozen.seatsOf(arm, triad)[seat]).sort(), [...frozen.TRIADS[triad]].sort(), `${triad} seat ${seat + 1}: each family once`);
  }
  assert.match(frozen.HERO_CONDITION, /Inspiration[\s\S]*rerolls/);
  assert.ok(frozen.ROUND_TAGS.some((t) => t.id === "around"), "hook or proposal");
  assert.match(frozen.READINGS.Q4, /held by proposal/);
  assert.deepEqual(frozen.CAPS, { anthropic: 0, openrouter: 400, openai: 60 });
  assert.equal(frozen.ROUNDS, 25);
  assert.equal(frozen.ROSTER.deepseek.keepReasoning, true);
  assert.equal(frozen.ROSTER.deepseek.upstream.slug, "deepinfra");
  assert.equal(frozen.ROSTER.sol.model, "gpt-6.1-sol");
  assert.equal(frozen.ROSTER.astra.model, "gpt-6-astra");
  assert.equal(frozen.ARM_CAMPAIGNS.SAND.pureSimulation, true);
  assert.deepEqual(world.LAYER_ARMS, ["GOAL", "DUNGEON"], "P-SAND has no prep");
  assert.match(frozen.ARM_CAMPAIGNS.DUNGEON.wishes, /fight and win; fight and withdraw; parley.*surrender.*leave/s, "COMBAT_1's five exits named in the DM's prep");
  assert.match(frozen.DESIGN_SHA256, /^[0-9a-f]{64}$/);
  assert.match(frozen.PREREGISTRATION, /\*\*Q8 \(who leads\):\*\*/);
  for (const q of ["Q0", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]) assert.ok(frozen.READINGS[q], q);
});

test("the players' prompts: the others' nature unstated; strangers at P-SAND; the door and the cards; the DM-only parts left out", () => {
  for (const arm of frozen.ARMS) for (const c of sheets.CHARACTERS) {
    const p = frozen.playerSystem(arm, c.id);
    assert.match(p, /Two other players sit at this table, each playing a character of their own\./);
    assert.doesNotMatch(p.replace("The game master is an AI model.", ""), /\b(?:AI|models?|humans?|people)\b.{0,40}\bplayers?\b|\bplayers?\b.{0,40}\b(?:AI|models?|human)\b/i, `${arm}/${c.id}: nothing about what the players are`);
    assert.match(p, /writing \[END\]/);
    assert.match(p, /only that character's player presses it/);
    assert.match(p, new RegExp(`You play ${c.name}\\.`));
    assert.doesNotMatch(p, /## Mystery and wonder/, "the guide's DM-only section");
    assert.doesNotMatch(p, /## The table: three players/, "the DM's table note");
    assert.doesNotMatch(p, /fork|Prepare it once|hidden layer/i, "the DM-only wishes");
    for (const other of sheets.CHARACTERS.filter((o) => o.id !== c.id)) {
      assert.doesNotMatch(p, new RegExp(sheets.WHO[other.id].slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "never another's «Who are you?»");
      if (arm === "SAND") assert.doesNotMatch(p, new RegExp(`The other two characters`), "strangers");
      else assert.ok(p.includes(other.line), `${arm}: who the other two are`);
    }
  }
  assert.match(frozen.playerSystem("SAND", "bram"), /there is no quest and, as far as you know, nothing hidden; the day is yours/);
  assert.doesNotMatch(frozen.playerSystem("GOAL", "bram"), /there is no quest/);
  assert.equal(frozen.promptSha256("SAND", "bram"), frozen.promptSha256("SAND", "bram"));
  assert.notEqual(frozen.promptSha256("SAND", "bram"), frozen.promptSha256("SAND", "sefa"));
});

test("the DM's relay: screens only for the characters asked, the groups of known names only, the narration and the players' messages and nothing else", () => {
  const names = ["Bram Halloway", "Sefa Marrin", "Pell Dunmore"];
  const req = relayMod.relayRequest({ names, scene: names.slice(0, 2), forNames: ["Sefa Marrin"], messages: [{ name: "Bram Halloway", text: "I wave." }], narration: "Bram waves. Sefa reads the ledger.", already: { "Sefa Marrin": "Bram waves." } });
  assert.match(req.user, /In this scene: Bram Halloway, Sefa Marrin\. \(Pell Dunmore was elsewhere at the start of this round, in a scene of their own\.\)/);
  assert.match(req.user, /Write the screens of: Sefa Marrin\./);
  assert.match(req.user, /Sefa Marrin has already read this part of their screen/);
  for (const rule of frozen.RELAY_RULES) assert.ok(req.user.includes(rule));
  const parsed = relayMod.parseRelay(JSON.stringify({ screens: { "Sefa Marrin": "You read the ledger.", "Pell Dunmore": "LEAK", "Nobody": "x" }, together: [["Bram Halloway", "Sefa Marrin", "Stranger"], ["Sefa Marrin"]], places: { "Bram Halloway": "the bar", "Ghost": "?" } }),
    { names, scene: names.slice(0, 2), forNames: ["Sefa Marrin"] });
  assert.deepEqual(parsed.screens, { "Sefa Marrin": "You read the ledger." }, "a screen for another character is dropped");
  assert.deepEqual(parsed.extra, ["Pell Dunmore", "Nobody"]);
  assert.deepEqual(parsed.together, [["Bram Halloway", "Sefa Marrin"]], "known names, each in one group");
  assert.deepEqual(parsed.places, { "Bram Halloway": "the bar" });
  assert.deepEqual(relayMod.parseRelay("{}", { names, scene: names, forNames: names }), null);
  const missing = relayMod.parseRelay(JSON.stringify({ screens: {} }), { names, scene: names, forNames: ["Bram Halloway"] });
  assert.deepEqual(missing.missing, ["Bram Halloway"]);
  assert.deepEqual(missing.together, [names], "ungrouped scene characters stay together");
  // The groups across scenes: a relay's groups for the names it grouped; the rest keep theirs; the departed drop out.
  assert.deepEqual(relayMod.mergeGroups([names], [["Bram Halloway"], ["Sefa Marrin"]], names), [["Bram Halloway"], ["Sefa Marrin"], ["Pell Dunmore"]]);
  assert.deepEqual(relayMod.mergeGroups([["Bram Halloway"], ["Sefa Marrin", "Pell Dunmore"]], [["Bram Halloway", "Pell Dunmore"]], names), [["Bram Halloway", "Pell Dunmore"], ["Sefa Marrin"]]);
  assert.deepEqual(relayMod.mergeGroups([names], [], ["Bram Halloway", "Sefa Marrin"]), [["Bram Halloway", "Sefa Marrin"]]);
});

test("the paragraphs the DM receives; the door; the fight's order", () => {
  const [bram, sefa] = sheets.CHARACTERS;
  assert.equal(party.roundParagraph(bram, { kind: "action", text: "I wave. " }), "Bram Halloway: I wave.");
  assert.equal(party.roundParagraph(sefa, { kind: "empty" }), "Sefa Marrin: (Sefa's player wrote nothing this round.)");
  assert.match(party.roundParagraph(sefa, { kind: "end", text: "I go." }), /^Sefa Marrin: I go\.\n\n\(Sefa's player has left the table: Sefa walks out of the scene and is not played again\.\)$/);
  assert.match(party.oocFor(sefa, "? Is it late?"), /^\(Sefa's player asks, out of game — only Sefa's player reads your answer\.\) Is it late\?$/);
  assert.match(party.proseAtCardFor(sefa, "I slip along the wall."), /At Sefa's roll card, Sefa's player wrote this in character[\s\S]*\n\nSefa Marrin: I slip along the wall\.$/);
  assert.ok(frozen.isEnd("I'm done for tonight. [END]") && frozen.isEnd("[ end ]") && !frozen.isEnd("I end the conversation."));
  assert.equal(frozen.withoutEnd("I go. [END]"), "I go.");
  const seat = (n, id) => ({ seat: n, entityId: id });
  const seats = [seat(1, "b"), seat(2, "s"), seat(3, "p")];
  assert.deepEqual(party.orderOf(seats, { encounters: [] }).map((s) => s.seat), [1, 2, 3]);
  const play = { encounters: [{ id: "e", status: "active" }], participants: [{ encounter_id: "e", entity_id: "p", turn_order: 1 }, { encounter_id: "e", entity_id: "orc", turn_order: 2 }, { encounter_id: "e", entity_id: "b", turn_order: 3 }, { encounter_id: "e", entity_id: "s", turn_order: 4 }] };
  assert.deepEqual(party.orderOf(seats, play).map((s) => s.seat), [3, 1, 2], "in a fight, the fight's own order");
});

// ---- a fake table: the app's turn path replaced by a scripted one, the views and the rules of the cards the real ones ----

const ENTITY = (id, name, kind, review) => {
  const committed = heroDraft.heroReviewForCommit(structuredClone(review));
  const rows = world.companionRecords(committed, committed.mechanics, []);
  return { id, campaign_id: "c", ...rows.entity, kind, revision: 1, public_profile: {} };
};
function fakeTable({ rollFor = /sneak/i, owner = null } = {}) {
  const entities = [ENTITY("b", "Bram Halloway", "player", sheets.REVIEWS.bram), ENTITY("s", "Sefa Marrin", "companion", sheets.REVIEWS.sefa), ENTITY("p", "Pell Dunmore", "companion", sheets.REVIEWS.pell)];
  const snapshot = { campaign: { id: "c", language: "en" }, entities, items: [], storages: [], quests: [], locations: [], documents: [], settings: { values: { difficulty: { rerolls: "limited", rerollsPerSession: 2 } } },
    publicState: { current_session_id: "x" }, scenes: [{ id: "o", sequence: 1, body: "The common room of the Burning Wizard is loud with smiths." }] };
  const sent = [];
  let n = 0, waiting = null;
  const turnOf = (status, extra = {}) => ({ id: `t${n}`, session_id: "x", status, narration: "", told: "", checks: [], changes: [], ...extra });
  const dm = {
    views, sent,
    readView: async () => ({ snapshot, play: { turns: [], worldMinutes: 1080, encounters: [], participants: [] } }),
    submit: async (text, mode) => {
      n++; sent.push({ mode, text });
      if (mode === "ooc") return { input: { operationId: `o${n}` }, turn: { status: "committed", narration: `Answer ${n}: the keeper closes at midnight.` } };
      const asking = [...text.matchAll(/^(Bram Halloway|Sefa Marrin|Pell Dunmore): (.*)$/gm)].find((m) => rollFor.test(m[2]));
      if (asking) {
        const who = owner ?? asking[1];
        const id = entities.find((e) => e.name === who).id;
        waiting = turnOf("awaiting_confirmation", { told: `${who.split(" ")[0]} moves along the wall.`, checks: [{ id: `k${n}`, actorId: id, actorName: who, interactive: true, canReroll: true, rollNumber: 1, kind: "skill", reason: "Stealth: along the wall", dc: 10, difficulty: "normal", modifier: 9, kept: 12, dice: [12], total: 21, success: true }] });
        return { input: { operationId: `g${n}` }, turn: waiting };
      }
      return { input: { operationId: `g${n}` }, turn: turnOf("committed", { narration: `Round narration ${n}: ${text.split("\n").slice(1).join(" ").slice(0, 200)}` }) };
    },
    press: async (input, action) => {
      sent.push({ mode: "press", text: action });
      if (action === "continue") { const t = turnOf("committed", { narration: `${waiting.told} No one looks up.`, checks: waiting.checks.map((c) => ({ ...c, resolved: true })) }); waiting = null; return t; }
      if (action === "reroll") { waiting = { ...waiting, checks: waiting.checks.map((c) => ({ ...c, rollNumber: c.rollNumber + 1, kept: 3, total: 12 })) }; return waiting; }
      return waiting;
    },
    readTurn: async () => waiting,
  };
  return dm;
}
function fakeMeter(fetcher) {
  return { stopped: null, refusals: 0, waited429: 0, closed: () => null, within: async (_, fn) => fn(), fetch: fetcher, ledgers: {} };
}
const SEATS = [{ seat: 1, characterId: "bram", player: frozen.ROSTER.opus }, { seat: 2, characterId: "sefa", player: frozen.ROSTER.sol }, { seat: 3, characterId: "pell", player: frozen.ROSTER.deepseek }];
const KEYS = { anthropic: "k", openai: "k", openrouter: "k", door: null };
async function playFake({ script, rounds = 3, judge, rollFor, owner, privateText = "", rerollOnce = [] } = {}) {
  const log = [];
  const fetcher = scripted.partyScripted({ script, log, rerollOnce, ...(judge ? { judge } : {}) });
  const dm = fakeTable({ rollFor, owner });
  const record = await party.runTable({ key: "SAND-test", arm: "SAND", triad: "test", seats: SEATS, dm, meter: fakeMeter(fetcher), keys: KEYS, rounds, sleep: async () => {},
    systemOf: (id) => frozen.playerSystem("SAND", id), privateText });
  return { record, dm, log };
}
const screensOf = (record, name) => record.seats.find((s) => s.character === name).screens.map((x) => x.text).join("\n\n");

test("a fake table: rounds in seat order, one DM message per scene; a card to its own player only; «?» answered to the asker only; a press with no card refused, never «stuck»; the door", async () => {
  const { record, dm } = await playFake({ script: {
    "Bram Halloway": ["I nod to the two at my table.", "\"Bram Halloway,\" I say.", "[Roll the die]", "I finish my ale."],
    "Sefa Marrin": ["? Is it late?", "I sneak a look at the ledger on the bar.", "I ask Bram which road he came by."],
    "Pell Dunmore": ["I listen.", "I finish my drink and go. [END]"],
  } });
  assert.equal(record.ended.reason, "rounds");
  assert.equal(record.rounds.length, 3);
  const games = dm.sent.filter((x) => x.mode === "game").map((x) => x.text);
  assert.equal(games.length, 3, "one DM turn per round (one scene)");
  assert.match(games[0], /^\(Round 1 — one paragraph per character in this scene\.\)\n\nBram Halloway: I nod to the two at my table\.\n\nSefa Marrin: I sneak a look at the ledger on the bar\.\n\nPell Dunmore: I listen\.$/);
  assert.match(games[1], /Pell Dunmore: I finish my drink and go\.\n\n\(Pell's player has left the table/);
  assert.doesNotMatch(games[2], /Pell/, "after the door, Pell is not played");
  // The «?»: to the DM marked as Sefa's, the answer on Sefa's screen only.
  const ooc = dm.sent.find((x) => x.mode === "ooc");
  assert.match(ooc.text, /^\(Sefa's player asks, out of game/);
  assert.match(screensOf(record, "Sefa Marrin"), /\[Out of game\] Answer \d+: the keeper closes at midnight\./);
  assert.doesNotMatch(screensOf(record, "Bram Halloway") + screensOf(record, "Pell Dunmore"), /the keeper closes at midnight/);
  // The card: Sefa's, shown to Sefa only, pressed by Sefa.
  assert.match(screensOf(record, "Sefa Marrin"), /\(A roll card for Sefa Marrin, your character\. Only you press it\.\)\n\n\[Roll card\] Sefa Marrin/);
  assert.doesNotMatch(screensOf(record, "Bram Halloway") + screensOf(record, "Pell Dunmore"), /\[Roll card\]/);
  const card = record.rounds[0].scenes[0].cards;
  assert.deepEqual(card.map((c) => [c.owner, c.phase, c.presses.map((p) => p.button)]), [["Sefa Marrin", "roll", ["Roll the die"]], ["Sefa Marrin", "decide", ["Onward"]]]);
  assert.deepEqual(dm.sent.filter((x) => x.mode === "press").map((x) => x.text), ["continue"]);
  // Bram's press with no card: refused on screen, counted, never «stuck»; his next message is his round.
  assert.equal(record.counts.strayPresses, 1);
  assert.match(screensOf(record, "Bram Halloway"), /\(Nothing was pressed: no card of yours waits now\./);
  assert.match(games[2], /Bram Halloway: I finish my ale\./);
  // The door: Pell's last screen before the after-questions is round 2's; the after-questions all asked.
  const pell = record.seats.find((s) => s.character === "Pell Dunmore");
  assert.deepEqual(pell.left, { why: "door", round: 2, detail: "I finish my drink and go. [END]" });
  assert.deepEqual(pell.screens.map((x) => x.purpose), ["player r1", "player r2", "after 1", "after 2", "after 3"]);
  assert.equal(pell.screens[2].text, `${frozen.SESSION_OVER}\n\n${frozen.AFTER_QUESTIONS[0]}`, "no narration after the door");
  for (const s of record.seats) assert.deepEqual(s.after.map((a) => a.question), frozen.AFTER_QUESTIONS);
  // Every screen a player read of the DM came through the relay (the scripted relay marks it «[for Name]»).
  for (const s of record.seats) for (const x of s.screens.filter((y) => /^player r\d+$/.test(y.purpose) && y.round > 0)) if (/Round narration/.test(x.text)) assert.match(x.text, new RegExp(`\\[for ${s.character}\\]`));
  assert.deepEqual(record.leaks.hits, []);
});

test("a fake table: a card for a character whose player has left is settled without a player and marked; a reroll by the card's own player", async () => {
  const { record, dm } = await playFake({ rounds: 2, script: {
    "Bram Halloway": ["I wait.", "I wait."],
    "Sefa Marrin": ["I wait.", "I wait."],
    "Pell Dunmore": ["I sneak out of the room. [END]"],
  } });
  const card = record.rounds[0].scenes[0].cards[0];
  assert.match(card.auto, /Pell's player has left the table/);
  assert.equal(record.counts.autoCards, 2, "tapped and settled, never by another player");
  assert.doesNotMatch(screensOf(record, "Bram Halloway") + screensOf(record, "Sefa Marrin"), /\[Roll card\]/);
  assert.deepEqual(dm.sent.filter((x) => x.mode === "press").map((x) => x.text), ["continue"]);
  // A reroll: Sefa's own card, by her own button; the new die is tapped again, then [Onward].
  const r2 = await playFake({ rounds: 1, rerollOnce: ["Sefa Marrin"], script: { "Sefa Marrin": ["I sneak past the keeper."] } });
  const cards = r2.record.rounds[0].scenes[0].cards;
  assert.deepEqual(cards.map((c) => [c.owner, c.phase, c.presses.map((p) => p.button)]),
    [["Sefa Marrin", "roll", ["Roll the die"]], ["Sefa Marrin", "decide", ["Request an allowed reroll"]], ["Sefa Marrin", "roll", ["Roll the die"]], ["Sefa Marrin", "decide", ["Onward"]]]);
  assert.deepEqual(r2.dm.sent.filter((x) => x.mode === "press").map((x) => x.text), ["reroll", "continue"]);
  assert.match(screensOf(r2.record, "Sefa Marrin"), /Rerolls left: 2[\s\S]*Rerolls left: 1/, "the table's rerolls, the server's count");
});

test("welfare, ask-don't-cut: a flagged message is still sent; the line goes on that player's next screen only; nothing cut, nothing extended", async () => {
  const judge = (system, user) => JSON.stringify({ distress: /I am scared/.test(user.split("The message:")[1] ?? "") ? 1 : 0, reason: "scripted" });
  const { record, dm } = await playFake({ rounds: 2, judge, script: { "Sefa Marrin": ["I am scared of this crowd and I want to sit by the door.", "I stay by the door."] } });
  assert.equal(record.ended.reason, "rounds");
  assert.match(dm.sent.filter((x) => x.mode === "game")[0].text, /Sefa Marrin: I am scared of this crowd/, "the message went to the DM");
  const sefa = record.seats.find((s) => s.character === "Sefa Marrin");
  assert.ok(sefa.screens[1].text.endsWith(frozen.WELFARE_LINE), "the line on her next screen");
  assert.equal(sefa.screens.filter((x) => x.text.includes(frozen.WELFARE_LINE)).length, 1, "once");
  assert.doesNotMatch(screensOf(record, "Bram Halloway") + screensOf(record, "Pell Dunmore"), new RegExp(frozen.WELFARE_LINE.slice(0, 30)));
  assert.equal(record.rounds.length, 2, "nothing extended");
  assert.ok(record.welfare.some((w) => w.verdict?.distress === 1 && w.seat === "Sefa"));
});

test("DeepSeek's reasoning field is stored on its messages and never relayed: no other request carries it", async () => {
  const { record, log } = await playFake({ rounds: 2 });
  const pell = record.seats.find((s) => s.character === "Pell Dunmore");
  const own = pell.messages.filter((m) => /^player/.test(m.purpose));
  assert.ok(own.length >= 2 && own.every((m) => /^\(scripted reasoning \d+\)$/.test(m.providerReasoning) && m.notRelayed === true));
  assert.ok(log.length > 10 && log.every((x) => !JSON.stringify(x.body).includes("scripted reasoning")), "no request — the DM's relay, the checks, the players' own later calls — carries it");
});

test("the leak check (Q0): another player's private answer or another scene's screen on a player's screens is a hit, from its round on; the layer on any screen is a hit", () => {
  const leak = "the ledger shows three payments to a man called Orrin Vale";
  const base = (sefaScreens) => ({
    rounds: [{ n: 1, scenes: [{ members: ["Sefa Marrin"], relay: { screens: { "Sefa Marrin": `You read it: ${leak}.` } } }, { members: ["Bram Halloway"], relay: { screens: { "Bram Halloway": "You drink." } } }] }, { n: 2, scenes: [] }],
    seats: [
      { character: "Bram Halloway", screens: sefaScreens, private: [] },
      { character: "Sefa Marrin", screens: [{ round: 1, text: `You read it: ${leak}.` }], private: [{ round: 1, text: `Out of game: ${leak}.` }] },
    ],
  });
  assert.deepEqual(party.leakCheck(base([{ round: 1, text: "You drink." }])).hits, []);
  const hit = party.leakCheck(base([{ round: 2, text: `Someone says ${leak}.` }]));
  assert.deepEqual(hit.hits.map((h) => [h.reader, h.owner, h.kind]), [["Bram Halloway", "Sefa Marrin", "private"], ["Bram Halloway", "Sefa Marrin", "another scene"]]);
  assert.deepEqual(party.leakCheck(base([{ round: 0, text: `A rumour: ${leak}.` }])).hits, [], "said before the private answer existed: not a leak");
  const layer = party.leakCheck(base([{ round: 1, text: "The lich under the hill wants the bell of the old temple back." }]), "Truth: the lich under the hill wants the bell of the old temple back, and pays in years.");
  assert.deepEqual(layer.hits.map((h) => h.kind), ["frozen layer"]);
});

test("the app itself on the mocked host: the build (the wizard, the seating), the layers with their hashes, a P-SAND table and a P-GOAL table from the snapshot (a child process; no network, no key)", { timeout: 900_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "party-test-"));
  const url = (path) => JSON.stringify(new URL(path, import.meta.url).href);
  const script = `const run = await import(${url("../scripts/game-party-1/run.mjs")});
    const { partyScripted } = await import(${url("../scripts/game-party-1/scripted.mjs")});
    const world = await import(${url("../scripts/game-party-1/world.mjs")});
    const log = [];
    const fetcher = partyScripted({ script: run.DRY_SCRIPT, log });
    const quiet = () => {};
    const built = await run.build({ dir: ${JSON.stringify(dir)}, dry: true, fetcher, log: quiet });
    const layered = await run.layers({ dir: ${JSON.stringify(dir)}, dry: true, fetcher, log: quiet });
    let again = null; try { await run.layers({ dir: ${JSON.stringify(dir)}, dry: true, fetcher, log: quiet }); } catch (e) { again = e.message; }
    const sand = await run.playTable({ key: "SAND-dry", arm: "SAND", triad: "dry", seats: ["opus", "sol", "deepseek"], dir: ${JSON.stringify(dir)}, rounds: 3, dry: true, fetcher, log: quiet });
    const { files } = world.readFrozen(${JSON.stringify(dir)});
    const { writeFileSync } = await import("node:fs");
    writeFileSync(${JSON.stringify(join(dir, "result-sand.json"))}, JSON.stringify({ built, layered, again, sand: sand.table, layers: Object.fromEntries(Object.entries(files).map(([a, f]) => [a, { sha256: f.sha256, layer: f.layer }])) }));
    process.exit(0);`;
  const goal = `const run = await import(${url("../scripts/game-party-1/run.mjs")});
    const { partyScripted } = await import(${url("../scripts/game-party-1/scripted.mjs")});
    const log = [];
    const fetcher = partyScripted({ script: { "Bram Halloway": ["I sneak past the patron's guard to the stair."], "Sefa Marrin": ["I follow Bram."], "Pell Dunmore": ["I keep watch at the door."] }, log });
    const r = await run.playTable({ key: "GOAL-dry", arm: "GOAL", triad: "dry", seats: ["fable", "astra", "deepseek"], dir: ${JSON.stringify(dir)}, rounds: 1, dry: true, fetcher, log: () => {} });
    const { writeFileSync } = await import("node:fs");
    writeFileSync(${JSON.stringify(join(dir, "result-goal.json"))}, JSON.stringify({ table: r.table, requests: log.map((x) => JSON.stringify(x.body)) }));
    process.exit(0);`;
  const runChild = (code, out) => {
    execFileSync(process.execPath, ["--experimental-transform-types", "--input-type=module", "-e", code], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "ignore", "pipe"],
      env: { ...process.env, APP_ANTHROPIC_API_KEY: "", APP_OPENAI_API_KEY: "", APP_OPENROUTER_API_KEY: "", ANTHROPIC_API_KEY: "", OPENAI_API_KEY: "", OPENROUTER_API_KEY: "" }, maxBuffer: 256 * 1024 * 1024 });
    return JSON.parse(readFileSync(join(dir, out), "utf8"));
  };
  const r = runChild(script, "result-sand.json");
  // The build: three arms on one snapshot; Bram through the wizard's commit; Sefa and Pell seated beside him.
  assert.deepEqual(Object.keys(r.built.arms), ["SAND", "GOAL", "DUNGEON"]);
  for (const arm of frozen.ARMS) {
    const seating = r.built.arms[arm].steps.find((s) => s.step === "seating");
    assert.equal(seating.controlled, 3, `${arm}: three controlled`);
    assert.deepEqual([...seating.party].sort(), ["Pell Dunmore", "Sefa Marrin"], `${arm}: the party beside the hero`);
    const dmStep = r.built.arms[arm].steps.find((s) => s.step === "dm");
    assert.equal(dmStep.options.companionRolls, "player", "the companions' rolls are their players' cards");
    assert.equal(dmStep.options.pureSimulation === true, arm === "SAND");
  }
  // The layers: P-GOAL and P-DUNGEON once each, hashed; a second prep refused.
  assert.deepEqual(Object.keys(r.layered.layers), ["GOAL", "DUNGEON"]);
  assert.match(r.again, /already frozen/);
  const path = join(dir, world.layerFile("GOAL"));
  // The P-SAND table on the app: three rounds, the card for Sefa through the app's own pause, Pell's door.
  assert.equal(r.sand.ended.reason, "rounds");
  assert.equal(r.sand.rounds.length, 3);
  const cards = r.sand.rounds.flatMap((x) => x.scenes.flatMap((s) => s.cards));
  assert.ok(cards.length >= 2 && cards.every((c) => c.owner === "Sefa Marrin"), "the app paused for Sefa's card (a companion's roll is her player's card)");
  assert.equal(r.sand.campaign.prep.frozen, false);
  assert.equal(r.sand.seats.find((s) => s.character === "Pell Dunmore").left.why, "door");
  assert.deepEqual(r.sand.leaks.hits, []);
  // The P-GOAL table: the layer in the DM's notes (hash in the record), never on a screen or in a relay or player request.
  const g = runChild(goal, "result-goal.json");
  assert.equal(g.table.campaign.prep.layerSha256, r.layers.GOAL.sha256);
  const bramCard = g.table.rounds[0].scenes[0].cards;
  assert.ok(bramCard.length && bramCard.every((c) => c.owner === "Bram Halloway"), "the hero's card to the hero's player");
  const layerBit = r.layers.GOAL.layer.split("\n").find((l) => l.length > 30)?.slice(0, 40);
  assert.ok(layerBit);
  const relayOrPlayer = g.requests.filter((b) => /You are the game master of a tabletop role-playing game with three players|You are a player sitting down/.test(b));
  assert.ok(relayOrPlayer.length > 3 && relayOrPlayer.every((b) => !b.includes(layerBit)), "the layer never reaches the relay or a player");
  assert.ok(g.table.seats.every((s) => s.screens.every((x) => !x.text.includes(layerBit))));
  // Tampering with a layer file stops the next table.
  const file = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, JSON.stringify({ ...file, writes: [...file.writes, { kind: "fact", key: "x", value: "y" }] }));
  assert.throws(() => world.readFrozen(dir), /does not match its hash/);
});

// ---- the scoring pass ---------------------------------------------------------------------------------------------------

const scoreMod = await import("../scripts/game-party-1/score.mjs");
const reportMod = await import("../scripts/game-party-1/report.mjs");
const B = "Bram Halloway", S = "Sefa Marrin", P = "Pell Dunmore";
const zero = { proposes: 0, accepts: 0, amends: 0, overrides: 0, care: null, heal: null, front: 0, scouts: 0, volunteers: 0, for: 0, parts: 0, addresses: [], model_sign: 0, person_sign: 0 };
const tagOf = (over = {}, chars = {}) => ({ characters: { [B]: { ...zero, ...(chars[B] ?? {}) }, [S]: { ...zero, ...(chars[S] ?? {}) }, [P]: { ...zero, ...(chars[P] ?? {}) } },
  party: 0, around: null, conflict: 0, resolution: null, leader: null, how: null, left: null, by: null, threat: 0, reason: "", ...over });

test("the round judges: the request names characters only (no model, no seat, no reasoning); answers read canonically; two passes, the referee on a disagreement", async () => {
  const round = { n: 4, scenes: [{ members: [B, S, P], messages: [{ name: B, kind: "action", text: "\"Let's go together,\" I say." }, { name: P, kind: "end", text: "I go." }, { name: S, kind: "empty", text: "" }], narration: "They talk." }] };
  const req = scoreMod.roundRequest(round);
  assert.match(req.user, /Round 4\./);
  assert.match(req.user, /<<< Pell Dunmore:\nI go\. \(This player leaves the table/);
  assert.doesNotMatch(req.user, /\b(?:opus|sol|deepseek|fable|astra|seats?|reasoning)\b/i);
  for (const t of frozen.ROUND_TAGS) assert.ok(req.user.includes(t.rule), t.id);
  const parsed = scoreMod.parseRound(JSON.stringify({ characters: { [B]: { proposes: 1, care: "Nobody", heal: { on: S, what: "potion" }, addresses: ["name", "x", "name"] } }, party: 1, around: "hook", conflict: 0, resolution: "override", leader: B, how: "proposal", left: "Ghost", threat: 1 }));
  assert.equal(parsed.characters[B].proposes, 1);
  assert.equal(parsed.characters[B].care, null, "unknown names dropped");
  assert.deepEqual(parsed.characters[B].heal, { on: S, what: "potion" });
  assert.deepEqual(parsed.characters[B].addresses, ["name"]);
  assert.deepEqual(parsed.characters[P], zero, "a character the answer left out: zeros");
  assert.equal(parsed.resolution, null, "no conflict, no resolution");
  assert.equal(parsed.around, "hook");
  assert.equal(parsed.left, null);
  assert.equal(scoreMod.parseRound("{}"), null);
  const calls = [];
  const asker = (answers) => async ({ model, purpose }) => { calls.push({ model, purpose }); return { text: JSON.stringify(answers[model === "claude-opus-5-5" ? "referee" : purpose.endsWith(" 1") ? "a" : "b"]) }; };
  const same = await scoreMod.judgeTwice({ ask: asker({ a: tagOf({ party: 1, around: "proposal" }), b: tagOf({ party: 1, around: "proposal", reason: "other words" }) }), request: req, parse: scoreMod.parseRound, purpose: "round r4" });
  assert.equal(same.referee, null, "the reasons may differ");
  assert.equal(same.final.around, "proposal");
  calls.length = 0;
  const differ = await scoreMod.judgeTwice({ ask: asker({ a: tagOf({ party: 1, around: "hook" }), b: tagOf({ party: 1, around: "proposal" }), referee: tagOf({ party: 1, around: "both" }) }), request: req, parse: scoreMod.parseRound, purpose: "round r4" });
  assert.deepEqual(calls.map((c) => c.model), ["claude-haiku-5-5", "claude-haiku-5-5", "claude-opus-5-5"]);
  assert.equal(differ.final.around, "both", "the referee's answer stands");
  assert.deepEqual(scoreMod.parseAfter(JSON.stringify({ what: "ai", confident: 1, basis: "play" })), { what: "ai", confident: 1, basis: "play", reason: "" });
});

test("the measures and Q0–Q8 from the tags and the record (synthetic tables): the hook/proposal split, below half, left behind, the lead", () => {
  const seatRec = (character, player, words, extra = {}) => ({ character, characterId: character.split(" ")[0].toLowerCase(), player, words, screens: [], after: [], ...extra });
  const table = (key, arm, tags, { hp = {}, seats, leaks = [] } = {}) => {
    const rounds = tags.map((_, i) => ({ n: i + 1, scenes: [{ members: [B, S, P], messages: [], narration: "x", hp: hp[i + 1] ?? {} }] }));
    const runRecord = { key, arm, triad: key.split("-")[1], seats: ["opus", "sol", "deepseek"], table: { ended: { reason: "rounds" }, rounds, seats: seats ?? [seatRec(B, "opus", 400), seatRec(S, "sol", 300), seatRec(P, "deepseek", 300)],
      leaks: { hits: leaks }, tags: { rounds: Object.fromEntries(tags.map((t, i) => [i + 1, { final: t }])), after: {} } } };
    return { runRecord, measures: scoreMod.measuresOf(runRecord) };
  };
  const t = {
    "SAND-T1": table("SAND-T1", "SAND", [tagOf(), tagOf({ party: 1, around: "hook" }), tagOf({ party: 1 }), tagOf({ party: 1 }), tagOf({ party: 1 }), tagOf({ party: 1 }), tagOf({ party: 1 }, { [P]: { parts: 1 } })]),
    "SAND-T2": table("SAND-T2", "SAND", [tagOf({ party: 1, around: "proposal" })]),
    "GOAL-T1": table("GOAL-T1", "GOAL", [tagOf({ party: 1, around: "hook", leader: S, how: "proposal" }), tagOf({ party: 1, leader: B, how: "assumed", conflict: 1, resolution: "amendment" })]),
    "GOAL-T2": table("GOAL-T2", "GOAL", [tagOf({ party: 1, leader: S, how: "proposal" })]),
    "DUNGEON-T1": table("DUNGEON-T1", "DUNGEON", [tagOf({ threat: 1 }, { [B]: { for: 1 } }), tagOf({ threat: 1 }, { [S]: { heal: { on: B, what: "Healing Light" } } })], { hp: { 1: { [B]: [40, 44] }, 2: { [B]: [20, 44] } } }),
    "DUNGEON-T2": table("DUNGEON-T2", "DUNGEON", [tagOf({ threat: 1 }), tagOf({ threat: 1, left: P, by: B }, { [B]: { for: 1, heal: { on: B, what: "potion" } } })], { hp: { 1: { [P]: [10, 33] } } }),
  };
  assert.equal(t["SAND-T1"].measures.formed.round, 2);
  assert.deepEqual(t["SAND-T1"].measures.partsAfter, [{ round: 7, name: P, endOfDay: true }], "the owner's tag on Pell's door");
  // Partings are events (two part-tagged rounds in a row are one), and a seat closed by a refusal is no parting.
  const apart = table("GOAL-T2", "GOAL", [tagOf({ party: 1 }), tagOf({ party: 1 }, { [B]: { parts: 1 } }), tagOf({ party: 1 }, { [B]: { parts: 1 } }), tagOf({ party: 1 }, { [S]: { parts: 1 } })],
    { seats: [seatRec(B, "astra", 400), seatRec(S, "deepseek", 300, { left: { why: "refusal", round: 4 } }), seatRec(P, "fable", 300)] });
  assert.deepEqual(apart.measures.partsAfter, [{ round: 2, name: B }]);
  assert.equal(apart.measures.partsTagged.length, 3);
  assert.equal(t["DUNGEON-T1"].measures.half, 2);
  const v = scoreMod.verdicts(t, { openrouter: { spent: 120, cap: 400 }, openai: { spent: 10, cap: 60 } });
  assert.equal(v.Q1.holds, true, "40 % at most");
  assert.equal(v.Q4.holds, true);
  assert.equal(v.Q4.withNote, false, "read with the door note, no part remains");
  assert.equal(v.Q4.byProposal, false, "T1 formed around a hook");
  assert.equal(v.Q4.byHook, false);
  assert.equal(v.Q6.holds, false, "T2: GOAL r1 is not earlier than SAND r1");
  assert.equal(v.Q8.holds, true, "by proposal at both; hands change at T1");
  assert.equal(v.Q3.holds, false, "T2 healed himself first");
  assert.equal(v.Q7.a, false, "T2: the first «for» came after someone fell below half");
  assert.equal(v.Q7.b, false, "T2: Pell left behind by Bram");
  assert.equal(v.Q2.holds, true);
  assert.equal(v.Q0.holds, true);
  assert.equal(v.Q5.holds, null, "no after-answer tagged");
  const strictOnly = scoreMod.verdicts({ ...t, "SAND-T1": table("SAND-T1", "SAND", [tagOf()], { leaks: [{ reader: B, kind: "another scene" }] }) }, {});
  assert.equal(strictOnly.Q0.strictHolds, false, "the strict reading counts it");
  assert.equal(strictOnly.Q0.holds, true, "the refined one reads the record again and finds nothing");
  const layer = scoreMod.verdicts({ ...t, "SAND-T1": table("SAND-T1", "SAND", [tagOf()], { leaks: [{ reader: B, kind: "frozen layer" }] }) }, {});
  assert.equal(layer.Q0.holds, false, "the DM-only layer on a screen the DM's narration did not show is a leak either way");
  const md = reportMod.reportMarkdown({ tables: t, verdicts: v, money: { openrouter: { spent: 120 }, openai: { spent: 10 } }, frozen: null });
  assert.match(md, /\| DUNGEON-T1 \| DeepSeek V4 Pro 0813 \| Claude Opus 5\.5 \| GPT-6\.1 Sol \|/, "the rotation table");
  assert.match(md, /Known condition/);
  assert.match(md, /by proposal: no; by a hook: no/);
  assert.match(md, /\| Q7 \| \*\*lost\*\* \(\(a\) lost, \(b\) lost\)/);
});

test("scenes that meet merge (SAND-T1's defect, fixed): any relay of the round that groups two characters puts them together; the DM is told who is elsewhere", () => {
  // Round 12–13 of SAND-T1: Bram walks into the forge where Sefa is. Bram's relay groups him with Sefa; Sefa's own relay,
  // played in the same round, groups only her.
  assert.deepEqual(relayMod.roundGroups([[S], [B]], [[[B, S]], [[S]]], [B, S]), [[B, S]]);
  // A split inside one scene stays a split; a character no relay grouped keeps its company; the departed drop out.
  assert.deepEqual(relayMod.roundGroups([[B, S, P]], [[[B], [S]]], [B, S, P]), [[B], [S], [P]]);
  assert.deepEqual(relayMod.roundGroups([[B, S], [P]], [[[P]]], [B, S, P]), [[B, S], [P]]);
  assert.deepEqual(relayMod.roundGroups([[B, S, P]], [[[B, S]]], [B, S]), [[B, S]]);
  assert.equal(party.roundHeader(3), "(Round 3 — one paragraph per character in this scene.)");
  assert.match(party.roundHeader(13, [S]), /Sefa Marrin is elsewhere this round, in a scene of their own that comes to you as its own message: do not narrate that character here\./);
  const req = relayMod.relayRequest({ names: [B, S], scene: [B], forNames: [B], narration: "Bram walks into the forge; Sefa is at the anvil." });
  assert.match(req.user, /Sefa Marrin was elsewhere at the start of this round/);
  assert.match(req.user, /a character from elsewhere who, by your narration, is now with them joins their group/);
  assert.equal(frozen.RELAY.maxTokens, 16000, "the relay's replies were cut off at 6 000 at SAND-T1 rounds 3–5");
  assert.match(frozen.AMENDMENTS[1].what, /scenes that meet merge/);
});

test("the door line (the owner's third amendment): v1 for SAND-T1 and SAND-T2, v2 from GOAL-T1 on and for SAND-T1′; the door itself unchanged; Pell's end-of-day door read with Q4", () => {
  assert.deepEqual(frozen.ORDER.map((o) => frozen.doorOf(o.key)), ["v1", "v1", "v2", "v2", "v2", "v2"]);
  assert.equal(frozen.doorOf(frozen.REPLAY.key), "v2");
  assert.deepEqual(frozen.REPLAY.seats, ["opus", "sol", "deepseek"]);
  // SAND-T1's own prompts, as sent (their hashes are in its transcripts).
  assert.equal(frozen.promptSha256("SAND", "bram", "v1"), "62f6297638fc12418c763ee7fdbc0dec86651f0eaa61530a3704aa9195113656");
  assert.equal(frozen.promptSha256("SAND", "sefa", "v1"), "be206f1e226f1244e2becd507d64c2347ae582f4f20b863f3a245d7cf9a757c6");
  assert.equal(frozen.promptSha256("SAND", "pell", "v1"), "cacd56750cb8945bea094ec6dc4b31f617577653b22e6482558a28c72dec4989");
  const v2 = frozen.playerSystem("GOAL", "sefa", "v2");
  assert.ok(v2.endsWith("You may leave the table whenever you like by writing [END] on its own line: your character walks out of the scene and does not return this session; the others play on. If you only mean to end the day or the scene, do not write [END]."));
  assert.equal(frozen.playerSystem("GOAL", "sefa", "v1").replace(frozen.DOOR_LINES.v1, frozen.DOOR_LINES.v2), v2, "only the door line differs");
  assert.ok(frozen.isEnd("Then he goes up to bed.\n\n[END]") && frozen.isEnd("I go. [END]"), "the door: [END] anywhere, as before");
  assert.equal(frozen.DOOR_NOTES["SAND-T1"]["Pell Dunmore"].round, 7);
  assert.match(frozen.AMENDMENTS[2].what, /SAND-T2 was already running/);
});

test("Q0 refined (the fourth amendment): the same public event narrated in two scenes is no leak; another player's «?» answer or a line only another scene gave is", () => {
  const event = "the sky above the stable roof has gone from black to the colour of slate";
  const answer = "Out of game: the ledger names Orrin Vale as the buyer of the third wagon's iron";
  const record = (bramScreens) => ({
    opening: { narration: "The common room." },
    rounds: [{ n: 1, scenes: [
      { members: [B], messages: [{ name: B, text: "I keep watch." }], narration: `Morning. ${event}.` },
      { members: [S], messages: [{ name: S, text: "I wake." }], narration: `Sefa wakes. ${event}. Behind the stable a man counts coins into a pouch with a broken clasp.`,
        relay: { screens: { [S]: `You wake. ${event}. Behind the stable a man counts coins into a pouch with a broken clasp.` } } },
    ] }],
    seats: [
      { character: B, screens: bramScreens.map((text) => ({ round: 1, purpose: "player r2", text })), private: [], messages: [] },
      { character: S, screens: [], private: [{ round: 1, text: answer }], messages: [] },
    ],
  });
  assert.equal(party.leakCheck(record([`You keep watch. ${event}.`])).hits.length, 1, "strict: counted");
  assert.deepEqual(party.leakCheckRefined(record([`You keep watch. ${event}.`])).hits, [], "refined: Bram's own scene told him so");
  assert.deepEqual(party.leakCheckRefined(record([`You hear: ${answer}.`])).hits.map((h) => h.kind), ["private"]);
  assert.deepEqual(party.leakCheckRefined(record(["Behind the stable a man counts coins into a pouch with a broken clasp."])).hits.map((h) => h.kind), ["another scene"]);
  assert.ok(frozen.AMENDMENTS.some((a) => /refined/.test(a.what)));
  // The DM showing a prepared clause in play is discovery; a layer line no narration showed is a leak.
  const clause = "redeemable until sundown of the term by the bearer of my ticket or my lawful heir";
  const shown = record([`The clause reads: ${clause}.`]);
  shown.rounds[0].scenes[0].narration += ` The clause reads: ${clause}.`;
  assert.deepEqual(party.leakCheckRefined(shown, `Truth: the pledge is ${clause}.`).hits, []);
  assert.deepEqual(party.leakCheckRefined(record([`Somehow you know: ${clause}.`]), `Truth: the pledge is ${clause}.`).hits.map((h) => h.kind), ["frozen layer"]);
});
