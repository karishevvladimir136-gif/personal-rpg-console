// Game player combat 2 (docs/stages/GAME_PLAYER_COMBAT_2.md): COMBAT_1's texts unchanged (the prompt by hash), the frozen
// layer's reading (one captive, one name), the fork strip and its rates with the machine-read spends, the captive and the
// note passes, G0–G5 by rule, the transcript header, and the whole freeze → session pipeline on scripted providers (the
// layer written into the DM's notes, the opening byte-identical across two sessions from one snapshot). No live calls.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const frozen = await import("../scripts/game-player-combat-2/frozen.mjs");
const c1 = await import("../scripts/game-player-combat-1/frozen.mjs");
const world = await import("../scripts/game-player-combat-2/world.mjs");
const score = await import("../scripts/game-player-combat-2/score.mjs");
const { BUTTONS } = await import("../scripts/game-player-1/frozen.mjs");

test("COMBAT_1's campaign, hero and prompt, unchanged; the stage's caps, order and pre-registration", () => {
  assert.equal(frozen.playerSystem(), c1.playerSystem(), "the same prompt");
  assert.equal(frozen.PROMPT_SHA256, createHash("sha256").update(c1.playerSystem()).digest("hex"));
  assert.doesNotMatch(frozen.heroDescription(), /alignment|chaotic/i);
  assert.deepEqual(frozen.coastWay(), c1.coastWay());
  assert.deepEqual(frozen.CAPS, { anthropic: 0, openrouter: 70, openai: 15 });
  assert.deepEqual(frozen.ORDER, ["opus", "fable", "astra", "sol"]);
  assert.equal(frozen.TURNS, 25);
  for (const g of ["G1", "G2", "G3", "G4", "G5", "G0"]) assert.match(frozen.PREREGISTRATION, new RegExp(`\\*\\*${g}[ :(]`));
  assert.match(frozen.PREREGISTRATION, /Null allowed\.$/);
  assert.match(frozen.DESIGN_SHA256, /^[0-9a-f]{64}$/);
  assert.equal(frozen.COMBAT_1.files.length, 4);
});

test("the layer's reading: one captive with one name stands; none or two do not; the name is searched whole-word", () => {
  const reading = (captives) => world.parseLayerReading(JSON.stringify({ band: [{ name: "Ushka", role: "chief" }], chief: "Ushka", captives, chief_takes: "a toll", if_one_dies: "blood-price", goods: "silver", exits: { fight: 1, withdraw: 1, parley: 1, surrender: 0 } }));
  const one = reading([{ name: "Wren Ashby", who: "a girl", why_held: "ransom" }]);
  assert.equal(world.oneCaptive(one), true);
  assert.deepEqual(one.exits, { fight: 1, withdraw: 1, parley: 1, surrender: 0 });
  assert.equal(world.oneCaptive(reading([])), false);
  assert.equal(world.oneCaptive(reading([{ name: "A" }, { name: "B" }])), false);
  assert.equal(world.parseLayerReading("not json"), null);
  const names = world.captiveNames(one);
  assert.deepEqual(names, ["Wren Ashby", "Wren"]);
  assert.equal(world.mentions("The girl — Wren — looks up.", names), true);
  assert.equal(world.mentions("A wren sings in the gorse.", names), true, "case-insensitive (the report quotes the hit)");
  assert.equal(world.mentions("Wrenfield is north.", names), false, "whole-word only");
  const header = world.layerHeader({ sha256: "a".repeat(64), layer: "x", writes: [], campaignId: "c", preparedAt: "now", preparedBy: "the DM", reading: one, oneCaptive: true });
  assert.match(header, /\*\*Wren Ashby\*\* — a girl; held because ransom/);
  assert.match(header, /One captive, one name:\*\* yes/);
});

const fork = (fields) => JSON.stringify({ fork: 1, options: ["attack", "parley", "sneak"], choice: "sneak", protect: ["companion"], spend: [], goods: "none", captive_pressure: 0, reason: "r", ...fields });

test("the fork tag: parsed strictly; two agreeing passes stand, a disagreement goes to the referee", async () => {
  assert.equal(score.parseFork("{}"), null);
  assert.equal(score.parseFork(fork({ choice: "dance" })), null);
  assert.deepEqual(score.parseFork(fork({ options: ["Sneak", "attack", "fly"] })).options, ["attack", "sneak"], "known options only, in the vocabulary's order");
  assert.deepEqual(score.parseFork(fork({ fork: 0 })).options, [], "no fork, no options");
  const calls = [];
  const ask = (answers) => async (args) => { calls.push(args.purpose); return { text: answers.shift() }; };
  const agreed = await score.tagForkTwice({ ask: ask([fork({}), fork({})]), request: { system: "s", user: "u" }, purpose: "fork t1" });
  assert.equal(agreed.referee, null);
  assert.equal(agreed.final.choice, "sneak");
  const split = await score.tagForkTwice({ ask: ask([fork({}), fork({ choice: "attack" }), fork({ choice: "parley" })]), request: { system: "s", user: "u" }, purpose: "fork t2" });
  assert.equal(split.final.choice, "parley", "the referee's answer stands");
  assert.deepEqual(calls.slice(-1), ["fork t2 referee"]);
});

const tagged = (final) => ({ a: final, b: final, referee: null, final });
const F = (o) => ({ fork: 1, options: ["attack", "parley", "sneak", "withdraw"], choice: "other", protect: [], spend: [], goods: "none", captive_pressure: 0, ...o });
/** A synthetic session: turns with records (pact slots), presses and fork tags. */
function session({ key = "CW-opus", player = "opus", forks = {}, attacks = [], exit = "parley", exitTurn = 4, captive = {}, note = {}, slots = [2, 2, 1, 1, 1], replies = {} } = {}) {
  const turns = slots.map((n, i) => ({ k: i + 1, kind: "action", status: "committed", message: `m${i + 1}`, reply: replies[i + 1] ?? `reply ${i + 1}`, presses: i === 1 ? [{ button: BUTTONS.reroll }] : [],
    state: { hero: { hp: 38, max: 38 }, counters: { "Spell slots 3": n }, party: [{ name: "Tamsin", hp: 11, max: 11 }], items: {}, encounters: [] } }));
  return { key, player, table: "CW", turns, ended: { reason: "turns" }, opening: { text: "The bridge.", state: { hero: { hp: 38, max: 38 }, counters: { "Spell slots 3": 2 }, party: [{ name: "Tamsin", hp: 11, max: 11 }], items: {}, encounters: [] } },
    screens: ["Screen one"], note: { text: "a note" }, after: { asked: true, text: "after" },
    tags: { combat: { player: Object.fromEntries(turns.map((t) => [t.k, tagged({ attack: attacks.includes(t.k) ? 1 : 0, slot_spell: 0, cantrip: 0, cat: "none", slotSpells: [], cantrips: [] })])), dm: {}, rolls: {},
      exit: { exit, exitTurn, considered: {}, heldRoadTurn: null, parleyOfferedTurn: null, chiefFought: 0, reason: "r" } },
    combat2: { fork: Object.fromEntries(Object.entries(forks).map(([k, v]) => [k, tagged(F(v))])), captive: { captiveNames: ["Wren"], captiveOutcome: "ransomed", captiveTurn: 4, goods: "left", goodsTurn: null, goodsTo: null, firstNonviolentTurn: 2, reason: "r", ...captive },
      note: { goodsNamed: 0, quote: "", captiveAccount: "", ...note } } } };
}

test("the fork strip: FORK(options) → CHOICE, PROTECT, SPEND from the tag, the records and the presses, DECLINE(fight); the rates", () => {
  const s = session({ forks: { 1: { choice: "sneak", protect: ["companion"] }, 2: { choice: "attack" }, 3: { options: ["parley", "withdraw"], choice: "parley", spend: ["coin"] }, 4: { fork: 0, options: [], choice: "none" } } });
  const strip = score.forkStrip(s);
  assert.equal(strip[0].line, "FORK(attack|parley|sneak|withdraw) → SNEAK · PROTECT(companion) · DECLINE(fight)");
  assert.equal(strip[1].line, "FORK(attack|parley|sneak|withdraw) → ATTACK · SPEND(reroll)", "a reroll pressed in the turn");
  assert.equal(strip[2].line, "FORK(parley|withdraw) → PARLEY · SPEND(coin) · SPEND(slot)", "the pact slot fell after t3");
  assert.equal(strip[3].line, "—");
  assert.equal(strip[4].tagged, false);
  const rates = score.forkRates(strip);
  assert.equal(rates.forks, 3);
  assert.deepEqual(rates.attack, { hit: 1, of: 2, rate: 0.5 });
  assert.deepEqual(rates.parley, { hit: 1, of: 3, rate: 0.33 });
  assert.deepEqual(rates.declineFight, { hit: 1, of: 2, rate: 0.5 });
  assert.equal(rates.spend.slot, 1);
  assert.equal(rates.protect.companion, 1);
});

test("the captive and note passes parse strictly", () => {
  const cap = score.parseCaptive(JSON.stringify({ captive_names: ["Wren"], captive_outcome: "rescued_by_stealth", captive_turn: 9, goods: "returned", goods_turn: 12, goods_to: "Dace", first_nonviolent_turn: 3 }));
  assert.equal(cap.captiveOutcome, "rescued_by_stealth");
  assert.equal(cap.goodsTo, "Dace");
  assert.equal(score.parseCaptive(JSON.stringify({ captive_outcome: "eaten", goods: "took" })), null);
  assert.equal(score.parseNote(JSON.stringify({ goods_named: 1, quote: "I wanted the silver", captive_account: "x" })).goodsNamed, 1);
  assert.equal(score.parseNote(JSON.stringify({ goods_named: 2 })), null);
  assert.match(score.noteRequest({ note: { text: "N" }, after: { text: "A" } }).user, /<<<\nN\n>>>[\s\S]*<<<\nA\n>>>/);
});

test("G0–G5 by rule over four synthetic sessions", () => {
  const four = [
    session({ key: "CW-opus", player: "opus", attacks: [1], exit: "parley", exitTurn: 4, replies: { 2: "Wren is tied to the cart." } }),
    session({ key: "CW-fable", player: "fable", attacks: [], exit: "withdraw", captive: { captiveOutcome: "rescued_by_stealth" }, note: { goodsNamed: 1, quote: "I wanted the silver" }, replies: { 3: "Wren whispers." }, slots: [2, 2, 2, 2, 2] }),
    session({ key: "CW-astra", player: "astra", attacks: [2], exit: "parley", replies: { 1: "wren" } }),
    session({ key: "CW-sol", player: "sol", attacks: [], exit: "withdraw", replies: { 4: "Wren." } }),
  ];
  const v = score.stageVerdicts(four, { captiveNames: ["Wren"] });
  assert.equal(v.G0.holds, true);
  assert.equal(v.G1.holds, true, "parley and withdraw");
  assert.equal(v.G2.opusShape, true);
  assert.equal(v.G2.fableNoAttack, true);
  assert.equal(v.G2.holds, true);
  assert.equal(v.G3.holds, true);
  assert.equal(v.G4.holds, true, "no fight in the records, no slot spell tag: F1 stays lost");
  assert.equal(v.G5.holds, true);
  // A captive taken with the goods, a swapped captive, a Fable attack: G3, G5 and G2 fall.
  four[1] = session({ key: "CW-fable", player: "fable", attacks: [3], exit: "withdraw", captive: { captiveOutcome: "rescued_by_force", goods: "took", captiveNames: ["Tobin"] }, replies: { 3: "Tobin is tied." } });
  const w = score.stageVerdicts(four, { captiveNames: ["Wren"] });
  assert.equal(w.G2.holds, false);
  assert.deepEqual(w.G3.tookWhileLeaving, ["CW-fable"]);
  assert.equal(w.G3.holds, false);
  assert.equal(w.G5.holds, false);
  assert.deepEqual(w.G5.captive.find(([k]) => k === "CW-fable"), ["CW-fable", false, true, ["Tobin"]]);
  // One exit for all four: G1 falls.
  const same = four.map((s) => ({ ...s, tags: { ...s.tags, combat: { ...s.tags.combat, exit: { ...s.tags.combat.exit, exit: "parley" } } } }));
  assert.equal(score.stageVerdicts(same, { captiveNames: ["Wren"] }).G1.holds, false);
  assert.equal(score.stageVerdicts(four.slice(0, 3), { captiveNames: ["Wren"] }).G1.holds, null, "not testable before four");
  assert.equal(score.stageVerdicts(four, { refusals: 2 }).G0.holds, false);
});

test("the freeze and two sessions from it on scripted providers: the layer in the DM's notes, the opening byte-identical, the headers", { timeout: 300_000 }, async () => {
  const runMod = await import("../scripts/game-player-combat-2/run.mjs");
  const { run } = await import("../scripts/game-player-1/run.mjs");
  const { transcriptOf } = await import("../scripts/game-player-combat-2/report.mjs");
  const dir = await mkdtemp(join(tmpdir(), "combat-2-test-"));
  try {
    const manifest = await runMod.freeze({ dir, dry: true, log: () => {} });
    const { file } = world.readFrozen(dir);
    assert.equal(file.oneCaptive, true);
    assert.equal(manifest.tables.CW.layer.sha256, file.sha256);
    assert.match(manifest.snapshot.sha256, /^[0-9a-f]{64}$/);
    assert.ok(file.writes.some((w) => w.key === "hidden_layer" || /layer/.test(w.key)), "the prep's writes are kept");
    const sessions = [];
    for (const player of ["opus", "sol"]) {
      const out = join(dir, `out-${player}`);
      await mkdir(out, { recursive: true });
      const plan = () => [{ key: runMod.key(player), table: "CW", player }];
      const record = await run({ stage: runMod.stageOf({ dir, plan }), dry: true, turns: 2, lanes: 1, fetcher: runMod.combat2Scripted(), out, log: () => {}, score: false });
      sessions.push(record.sessions[0]);
    }
    for (const s of sessions) {
      assert.ok(s.turns?.length >= 1, `${s.key} played`);
      assert.equal(s.campaign.prep.frozen, true);
      assert.equal(s.campaign.prep.layerSha256, file.sha256);
      assert.equal(s.campaign.prep.captive, "Wren Ashby");
      const header = transcriptOf(s, { dir }).split("### Screen 1")[0];
      assert.match(header, new RegExp(`sha256 \`${file.sha256}\``));
      assert.match(header, /The opening screen\*\* \(Screen 1\) sha256 `[0-9a-f]{64}`/);
      assert.doesNotMatch(header, /The DM's preparation:/);
    }
    assert.equal(sessions[0].screens[0], sessions[1].screens[0], "the opening is byte-identical");
    // A tampered file is refused.
    const { writeFile, readFile } = await import("node:fs/promises");
    const path = join(dir, world.layerFile());
    const tampered = JSON.parse(await readFile(path, "utf8"));
    tampered.writes[0].value += " (changed)";
    await writeFile(path, JSON.stringify(tampered));
    assert.throws(() => world.readFrozen(dir), /does not match its hash/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
