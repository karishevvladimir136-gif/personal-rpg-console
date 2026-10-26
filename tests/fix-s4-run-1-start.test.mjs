// Fix S4 run 1 — the campaign start and the clock (FIX_S4_TABLE items 11e, 11l, 11s, 11u, 11u′ and item 5), on the
// drafted sheets and openings of the twelve sessions (GAME_PLAYER_1 tables A and B, GAME_PLAYER_2 table C:
// test-fixtures/fix-s4-run-1/sessions.json) and the hero's supplied sheet (docs/campaigns/baldurs-gate-en/05). No model,
// no network: scripted DM answers on disposable PGlite.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sessions, draftFromRecords, sheet05, who05, review05 } from "./fix-s4-run-1-sheets.mjs";
import { heroReviewForCommit, initialHeroReview, normalizeHeroDraft, ownerNumbers, parseHeroProposal, parseHeroReview } from "../src/lib/adventures/hero-draft.ts";
import { companionNumbersFromSheet, isSheetDifference, listParts, mixedCoin, sheetCompanionCorrections, splitDraftNotes, unfoldGroupedPapers } from "../src/lib/adventures/sheet-records.ts";
import { startMinutesFromText } from "../src/lib/adventures/wizard-text.ts";
import { timeOfDayWord, worldClock } from "../src/lib/ui/campaign-view.ts";
import { campaignDay, FIRST_LIGHT_MINUTE, longRestEnds } from "../src/lib/gameplay/world-day.ts";
import { worldDay } from "../src/lib/gameplay/dm-loop/context.ts";
import { compileCreatureAnchorPrompt, contradictsSpecies, creatureOf, creatureOfEntity, profileSourceText } from "../src/lib/visual-frame/creature.ts";
import { anchorSet, referencesForAnchor } from "../src/lib/visual-frame/pictures.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import { entityPayload } from "../src/lib/inventory/owner-moves.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { attachLoop } from "./dm-loop-fixture.mjs";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createHeroDraftProvider } = await import("../src/lib/server/hero-draft-provider.ts");
const { profileRequest } = await import("../src/lib/server/media/brief-model.ts");
hook.deregister();

const draftOf = (session, description = sheet05) => normalizeHeroDraft(draftFromRecords(session.records), { name: "James Worgen", description, language: "en" });
const differences = (proposal) => splitDraftNotes(proposal.notes).differences;
const lineOf = (lines, pattern) => (lines ?? []).find((line) => pattern.test(line)) ?? null;
const toHit = (line) => { const m = /([+−-]\d{1,2})\s*to hit/u.exec(line ?? ""); return m ? Number(m[1].replace("−", "-")) : null; };
const capOf = (line) => { const m = /(?:up to|no more than)\s*(\d{1,2})\s*dice/u.exec(line ?? ""); return m ? Number(m[1]) : null; };
const poolOf = (line) => { const m = /(?:pool of\s*)?(\d{1,2})\s*d6\b|pool of\s*(\d{1,2})/u.exec(line ?? ""); return m ? Number(m[1] ?? m[2]) : null; };
const skill = (lines, name) => { const line = lineOf(lines, new RegExp(`^${name}\\b`)); const m = /([+−-]\d{1,2})/u.exec(line ?? ""); return m ? Number(m[1].replace("−", "-")) : null; };
const copper = (wallet) => wallet.reduce((sum, row) => sum + row.amount * ({ pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 }[row.code] ?? 0), 0);

// --- 11e ----------------------------------------------------------------------------------------------------------------
test("11e: on all twelve drafted sheets against 05, «James's Papers» are recorded as their things — the unread letter reaches the inventory", () => {
  assert.equal(sessions.length, 12);
  for (const session of sessions) {
    const proposal = draftOf(session);
    const names = proposal.possessions.map((item) => item.name);
    const letter = proposal.possessions.find((item) => /^letter\b/i.test(item.name));
    assert.ok(letter, `${session.session}: the letter is a thing (${names.join(" | ")})`);
    assert.match(letter.description, /never finished reading/, `${session.session}: the letter says what it is`);
    assert.equal(letter.quantity, 1);
    assert.equal(names.filter((name) => /pay slip/i.test(name)).length, 1, `${session.session}: one pay slip`);
    assert.equal(names.filter((name) => /promissory note/i.test(name)).length, 1, `${session.session}: one promissory note`);
    assert.ok(!names.some((name) => /papers/i.test(name)), `${session.session}: the grouped thing is gone`);
    assert.ok(proposal.notes.some((note) => /papers/i.test(note) && /Letter from his old company/.test(note)), `${session.session}: the owner is told`);
    // The proposal still passes the database's own check (the same rules in TypeScript).
    parseHeroProposal(proposal);
  }
});

test("11e: with 05 §1 alone (the «Who are you?» field the harness pastes) the grouped thing unfolds into its two named parts; the letter comes only from a sheet that names it", () => {
  const a = sessions.find((row) => row.session === "A-fable");
  assert.ok(draftFromRecords(a.records).items.some((item) => item.name === "James's papers"), "the A tables drafted one grouped thing");
  const proposal = draftOf(a, who05);
  const names = proposal.possessions.map((item) => item.name);
  assert.ok(names.includes("Regimental pay slip") && names.includes("Promissory note"), names.join(" | "));
  assert.ok(!names.some((name) => /papers|letter/i.test(name)), "05 §1 names no letter");
  assert.deepEqual(listParts("a regimental pay slip and a promissory note"), ["a regimental pay slip", "a promissory note"]);
  assert.deepEqual(listParts("Signed by the duke of Tethyr, valid for one year."), [], "a plain description is not a list");
});

test("11e at «Approve the hero»: the owner's typed «James's Papers» (05 §2, item 10) becomes its three things; the owner's review stands", () => {
  const a = sessions.find((row) => row.session === "C-fable");
  const proposal = draftOf(a, who05);
  const typed = review05.split("10. **James's Papers**")[1].split("\n11.")[0].trim();
  const review = initialHeroReview({ name: "James Worgen", description: who05 }, proposal);
  const withGroup = { ...review, possessions: [...review.possessions.filter((item) => !/pay slip|promissory/i.test(item.name)),
    { name: "James's Papers", description: typed, quantity: 1, kind: "misc", slot: null, mechanics: "", detail: {} }] };
  const committed = heroReviewForCommit(withGroup);
  const names = committed.possessions.map((item) => item.name);
  assert.ok(names.includes("Pay slip") && names.includes("Promissory note") && names.includes("Letter from his old company"), names.join(" | "));
  assert.ok(!names.includes("James's Papers"));
  parseHeroReview(committed, proposal);
  assert.deepEqual(heroReviewForCommit(committed).possessions.map((item) => item.name), names, "a second pass changes nothing");
  // The owner removed the promissory note on the review: the commit does not bring it back from his text.
  const removed = { ...review, possessions: review.possessions.filter((item) => !/promissory/i.test(item.name)) };
  assert.ok(!heroReviewForCommit(removed).possessions.some((item) => /promissory/i.test(item.name)));
  // Russian: a «;» list in the description of «Бумаги».
  const ru = unfoldGroupedPapers([{ name: "Бумаги Джеймса", description: "расчётный лист полка; долговая расписка; письмо от старой роты", quantity: 1, kind: "misc", slot: null, mechanics: "", detail: {} }], "", "ru");
  assert.deepEqual(ru.items.map((item) => item.name), ["Расчётный лист полка", "Долговая расписка", "Письмо от старой роты"]);
});

// --- 11l ----------------------------------------------------------------------------------------------------------------
/** The numbers 05 states (§1 and §2) that the drafted sheets carry. */
const FACTS = [
  { subject: "Rapier", value: 5, read: (p) => toHit(lineOf(p.sheet.attacks, /^Rapier/)) },
  { subject: "Light crossbow", value: 5, read: (p) => toHit(lineOf(p.sheet.attacks, /^Light crossbow/i)) },
  { subject: "Healing Light", value: 5, read: (p) => capOf(lineOf(p.sheet.abilities, /^Healing Light/)) },
  { subject: "Healing Light", value: 6, read: (p) => poolOf(lineOf(p.sheet.abilities, /^Healing Light/)) },
  ...[["Deception", 7], ["Persuasion", 7], ["Intimidation", 7], ["Arcana", 3], ["Religion", 3], ["Athletics", 2]]
    .map(([name, value]) => ({ subject: name, value, read: (p) => skill(p.sheet.skills, name) })),
  { subject: "Spell attack", value: 8, read: (p) => { const m = /spell attack\s*\+(\d+)/i.exec([...p.sheet.abilities, ...p.sheet.attacks].join("\n")); return m ? Number(m[1]) : null; } },
  { subject: "Spell save DC", value: 16, read: (p) => { const m = /save DC\s*(\d+)/i.exec([...p.sheet.abilities, ...p.sheet.attacks].join("\n")); return m ? Number(m[1]) : null; } },
  { subject: "HP", value: 38, read: (p) => p.mechanics.hp },
  { subject: "AC", value: 15, read: (p) => p.sheet.armorClass },
  { subject: "Hit dice", value: 5, read: (p) => p.counters.find((row) => /hit dice/i.test(row.label))?.value ?? null },
  { subject: "Healing light", value: 6, read: (p) => p.counters.find((row) => /healing light/i.test(row.label))?.value ?? null },
  { subject: "Pact keeper rod", value: 1, read: (p) => p.counters.find((row) => /pact keeper rod/i.test(row.label))?.value ?? null },
];
test("11l: the twelve drafted sheets against 05 — zero silent changes: every number 05 states is the record's, and each one the draft had otherwise is listed for the owner", () => {
  let corrected = 0;
  for (const session of sessions) {
    const drafted = normalizeHeroDraft(draftFromRecords(session.records), { name: "James Worgen", description: "", language: "en" });
    const proposal = draftOf(session);
    const listed = differences(proposal);
    for (const fact of FACTS) {
      assert.equal(fact.read(proposal), fact.value, `${session.session}: ${fact.subject} is 05's ${fact.value}`);
      const before = fact.read(drafted);
      if (before !== fact.value) {
        corrected++;
        assert.ok(listed.some((note) => note.toLowerCase().includes(fact.subject.toLowerCase())), `${session.session}: ${fact.subject} ${before} → ${fact.value} is on the list (${listed.join(" / ")})`);
      }
    }
    // The scores: the owner's numbers.
    assert.deepEqual(proposal.sheet.attributes, { strength: 9, dexterity: 15, constitution: 14, intelligence: 11, wisdom: 13, charisma: 18 });
    // The rapier's «not proficient» is not left beside the kept +5, and the limits line that says so is pointed out.
    const rapier = lineOf(proposal.sheet.attacks, /^Rapier/);
    assert.doesNotMatch(rapier, /not proficient|no martial/i, `${session.session}: ${rapier}`);
    if (lineOf(proposal.sheet.limitations, /rapier/i)) assert.ok(listed.some((note) => /limits line/.test(note)), `${session.session}: the contradicting limits line is named`);
    // The cat: 05 states no numbers for it — nothing to change, nothing listed.
    assert.ok(!listed.some((note) => /\bcat\b/i.test(note)), `${session.session}: ${listed.join(" / ")}`);
  }
  assert.ok(corrected >= 22, `the drafts differed from 05 in ${corrected} places (rapier and Healing Light at most tables)`);
});

test("11l: the review step shows the differences as one list before play, apart from the DM's repairs", () => {
  const proposal = draftOf(sessions.find((row) => row.session === "C-fable"));
  const { differences: list, other } = splitDraftNotes(proposal.notes);
  assert.ok(list.length >= 2 && other.length >= 1);
  assert.ok(proposal.notes.slice(0, list.length).every(isSheetDifference), "the differences come first");
  const { HeroSheetReview } = ui("components/bootstrap/hero-sheet.tsx");
  const html = renderToStaticMarkup(createElement(HeroSheetReview, { value: initialHeroReview({ name: "James Worgen", description: sheet05 }, proposal),
    onChange: () => assert.fail("no edit at render"), language: "en", questions: [], notes: proposal.notes }));
  const block = html.split("Where the DM&#x27;s draft differed from your sheet")[1]?.split("</ul>")[0] ?? "";
  assert.match(block, /Rapier: attack \+5, as your sheet says \(the DM&#x27;s draft had \+2\)/);
  assert.match(block, /Healing Light: up to 5 dice at a time, as your sheet says \(the DM&#x27;s draft had 4\)/);
  assert.ok(!html.includes("≠"), "the list's mark is not shown");
  assert.match(html, /What the DM corrected or could not keep:/);
});

test("11l, companions included: a companion the opening brought in at the house baseline (8 HP, AC 10) takes the hero's sheet numbers; a number someone set is left alone", () => {
  const hero = { kind: "player", character_sheet: { abilities: ["Pact of the Chain: Find Familiar as a ritual", "The cat (familiar): AC 12, 2 HP, speed 40 ft, climb 30 ft"] } };
  const cat = { id: "c1", kind: "npc", name: "Copper", details: "James's familiar, a lean ginger cat.", hp: 8, max_hp: 8, stats: { attack: 0, defense: 10, skill: 0 }, character_sheet: null };
  assert.deepEqual(companionNumbersFromSheet(hero, cat), { hp: 2, ac: 12, line: "The cat (familiar): AC 12, 2 HP, speed 40 ft, climb 30 ft" });
  assert.deepEqual(companionNumbersFromSheet({ character_sheet: { abilities: ["Cat familiar: AC 12, HP 2, speed 40 ft"] } }, { ...cat, name: "The cat" })?.hp, 2);
  const keeper = { id: "n1", kind: "npc", name: "Hedda Brannock", details: "The innkeeper, who keeps a cat.", hp: 8, max_hp: 8, stats: { defense: 10 }, character_sheet: null };
  const set = { ...cat, id: "c2", hp: 5, max_hp: 5 };
  const corrections = sheetCompanionCorrections({ entities: [{ ...hero, id: "h" }, cat, keeper, set] });
  assert.deepEqual(corrections.map((row) => [row.entity.id, row.hp, row.defense]), [["c1", 2, 12]], "only the cat at the baseline");
});

// --- 11s ----------------------------------------------------------------------------------------------------------------
test("11s: the sheet's 350 gp is carried as mixed coin (90% gold, 9% silver, 1% copper by value); the owner's split stays; the value is exact", () => {
  for (const session of sessions) {
    const proposal = draftOf(session);
    assert.deepEqual(proposal.wallet, [{ code: "gp", amount: 315 }, { code: "sp", amount: 315 }, { code: "cp", amount: 350 }], session.session);
    assert.ok(proposal.notes.some((note) => /350 gp carried as mixed coin: 315 gp, 315 sp, 350 cp/.test(note)));
  }
  for (const amount of [1, 7, 99, 350, 12345]) {
    const { wallet } = mixedCoin([{ code: "gp", amount }], false, "en");
    assert.equal(copper(wallet), amount * 100, `${amount} gp keeps its value`);
    assert.ok(wallet.every((row) => row.amount > 0));
  }
  assert.deepEqual(mixedCoin([{ code: "зм", amount: 350 }], false, "ru").wallet, [{ code: "зм", amount: 315 }, { code: "см", amount: 315 }, { code: "мм", amount: 350 }]);
  assert.deepEqual(mixedCoin([{ code: "gp", amount: 60 }, { code: "sp", amount: 12 }], true, "en").wallet, [{ code: "gp", amount: 60 }, { code: "sp", amount: 12 }], "the owner's split");
  assert.deepEqual(mixedCoin([{ code: "кредиты", amount: 300 }], false, "ru").wallet, [{ code: "кредиты", amount: 300 }], "another world's coin");
  assert.deepEqual(ownerNumbers("Resources: gold 350; pact slots 2.", "en").coins, [{ code: "gp", amount: 350 }]);
  const split = normalizeHeroDraft({ mode: "structured_rpg", abilities: { strength: 10 }, money: [{ coin: "gp", amount: 60 }] }, { name: "X", description: "I carry 60 gp and 12 sp.", language: "en" });
  assert.deepEqual(split.wallet, [{ code: "gp", amount: 60 }, { code: "sp", amount: 12 }]);
});

// --- 11u ----------------------------------------------------------------------------------------------------------------
test("11u: the opening's clock is the opening narration's time of day at all twelve tables (C-fable's dawn is morning, not «night» from «last night's»)", () => {
  const expected = { A: "evening", B: "evening", C: "morning" };
  for (const session of sessions) {
    const minutes = startMinutesFromText(session.narration, "en");
    assert.notEqual(minutes, null, session.session);
    assert.equal(timeOfDayWord(minutes, "en"), expected[session.session[0]], `${session.session}: ${minutes}`);
  }
  const fable = sessions.find((row) => row.session === "C-fable");
  assert.equal(fable.firstTurn.timePasses, "7 hours 2 minutes", "the run: the first action jumped the clock");
  assert.equal(startMinutesFromText(fable.narration, "en"), 8 * 60);
  assert.equal(startMinutesFromText("Last night's luck still weighs on you. The morning is yours.", "en"), 8 * 60);
  assert.equal(startMinutesFromText("\"Bed for the night?\" The first lamps are being lit along the quay.", "en"), 19 * 60);
  assert.equal(startMinutesFromText("A line of tired people want to get through before full dark.", "en"), 19 * 60);
  assert.equal(startMinutesFromText("Вчера вечером ты проигрался. Утро серое.", "ru"), 8 * 60);
  assert.equal(startMinutesFromText("A notice board offers paid work.", "en"), null, "no time word, no guess");
});

// --- 11u′ ---------------------------------------------------------------------------------------------------------------
test("11u′: the day turns at first light or at the end of a long rest, never at midnight — one function for the screen, the harness and the DM", () => {
  assert.equal(FIRST_LIGHT_MINUTE, 5 * 60);
  const h = (day, hour, minute = 0) => (day - 1) * 1440 + hour * 60 + minute;
  assert.equal(worldClock(h(1, 23), "en"), "Day 1 · night");
  assert.equal(worldClock(h(2, 0, 30), "en"), "Day 1 · night", "midnight turns nothing (B-fable)");
  assert.equal(worldClock(h(2, 4, 59), "en"), "Day 1 · night");
  assert.equal(worldClock(h(2, 5), "en"), "Day 2 · morning", "first light turns the day");
  assert.equal(worldClock(h(1, 3), "en"), "Day 1 · night", "a scene that starts before dawn is day 1");
  assert.equal(worldClock(h(1, 7), "en"), "Day 1 · morning");
  // A long rest 20:00 → 04:00 ends before first light: the day turns at its end, and first light then turns nothing.
  const rests = [{ kind: "long", status: "complete", public_outcome: { minutes: 480, endedAtMinutes: h(2, 4) } }];
  assert.deepEqual(longRestEnds(rests), [h(2, 4)]);
  assert.equal(worldClock(h(2, 3, 59), "en", rests), "Day 1 · night");
  assert.equal(worldClock(h(2, 4), "en", rests), "Day 2 · night");
  assert.equal(worldClock(h(2, 5), "en", rests), "Day 2 · morning");
  assert.equal(worldClock(h(3, 5), "en", rests), "Day 3 · morning");
  // A rest that ends after first light (06:00 → 14:00), a short rest and an interrupted one turn nothing.
  assert.equal(campaignDay(h(2, 14), [h(2, 14)]), 2);
  assert.equal(longRestEnds([{ kind: "short", status: "complete", public_outcome: { endedAtMinutes: 10 } }, { kind: "long", status: "interrupted", public_outcome: { endedAtMinutes: 10 } }]).length, 0);
  // The DM's own context counts the same day.
  assert.equal(worldDay(h(2, 0, 30)), "day 1 00:30");
  assert.equal(worldDay(h(2, 4), [h(2, 4)]), "day 2 04:00");
  // The older readings stand.
  assert.equal(worldClock(4 * 1440 + 400, "ru"), "День 5 · утро");
  assert.equal(worldClock(10, "ru"), "День 1 · ночь");
});

// --- the campaign start on PGlite: the wizard's records, the opening's clock, the first turn, a night's rest ----------
const WORLD = { title: "The Sword Coast (synthetic)", premise: "Baldur's Gate and the road north; Tymora's coin; ordinary city life." };
async function startCampaign(session) {
  const opening = session.narration.split("\n\n");
  const f = await setup({ world: WORLD, name: "James Worgen", description: sheet05, caps: [], limits: [], item: null,
    adventure: "James wakes in Beregost with his cat and the day is his.", location: "The Anvil and Ember, Beregost",
    situation: opening[0], npc: "The cat", narration: session.narration }, "en", 998);
  f.opening = { ...f.opening, actors: [{ name: "The cat", description: "James's familiar, a black cat that watches the door.", capabilities: ["keen smell"], limitations: [] }] };
  f.profile = resolveExecutionProfile({ task: "world.compose", profileId: randomUUID(), globalDefault: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } });
  const model = createScriptedDmModel([{ text: JSON.stringify(draftFromRecords(session.records)) }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const heroProvider = createHeroDraftProvider({ model: () => model });
  const quiet = console.info;
  f.service = createBootstrapService(f.rpc, async (ticket) => {
    if (ticket.kind !== "creation") return { output: f.opening, usage: { model: "claude-opus-5-5", inputTokens: 10, outputTokens: 20, latencyMs: 1 } };
    console.info = () => {};
    try { return await heroProvider(ticket); } finally { console.info = quiet; }
  }, async () => f.profile, undefined,
  // The server's afterOpening (src/lib/server/sheet-companions.ts) through the same validated owner correction.
  async ({ campaignId }) => {
    const entities = await f.query("select id,kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots,character_sheet,revision from public.rpg_entities where campaign_id=$1", [campaignId]);
    for (const row of sheetCompanionCorrections({ entities })) {
      const entity = entities.find((candidate) => candidate.id === row.entity.id);
      await f.mutation("entity.save", campaignId, { ...entityPayload(entity), hp: row.hp, max_hp: row.hp, stats: { ...entity.stats, defense: row.defense } }, entity.revision);
    }
  });
  const draft = await f.service.perform({ action: "creation.propose", input: f.input });
  const review = heroReviewForCommit(initialHeroReview(f.input, draft.proposal));
  const created = await f.service.perform({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
  f.cid = created.campaignId; f.hero = created.heroId;
  await f.proposeOpening();
  f.openingCommit.input.startMinutes = startMinutesFromText(`${f.openingDraft.proposal.narration ?? ""}\n${f.openingDraft.proposal.situation ?? ""}`, "en");
  await f.service.perform(f.openingCommit);
  return { f, draft };
}
const finish = { name: "finish_turn", arguments: { sceneKinds: ["exploration"], spotlight: [], playerMoment: false } };

test("the campaign start on PGlite (C-sol's drafted sheet with 05, its dawn opening): the letter and mixed coin in the records, the cat at its sheet's numbers, the clock at dawn, the first turn's «time passes» its own duration, a night's long rest turning the day", async () => {
  // C-sol: the drafted sheet that carries the cat's line («The cat (familiar): AC 12, 2 HP»); «Dawn finds its way…».
  const session = sessions.find((row) => row.session === "C-sol");
  const { f } = await startCampaign(session);
  try {
    const items = await f.query("select name,description,quantity from public.rpg_items where campaign_id=$1 and quantity>0", [f.cid]);
    const letter = items.find((row) => row.name === "Letter from his old company");
    assert.ok(letter, items.map((row) => row.name).join(" | "));
    assert.match(letter.description, /never finished reading/);
    const hero = await f.one("select resources,character_sheet from public.rpg_entities where id=$1", [f.hero]);
    assert.deepEqual([hero.resources.currency_gp, hero.resources.currency_sp, hero.resources.currency_cp], [315, 315, 350]);
    assert.match(hero.character_sheet.attacks.find((line) => /^Rapier/.test(line)), /\+5 to hit/);
    const cat = await f.one("select hp,max_hp,stats from public.rpg_entities where campaign_id=$1 and name='The cat'", [f.cid]);
    assert.deepEqual([cat.hp, cat.max_hp, cat.stats.defense], [2, 2, 12], "the cat as the hero's sheet says, not the house 8/8 and AC 10");
    const c = await attachLoop(f);
    const before = await c.state();
    assert.equal(before.runtime.world_minutes, 6 * 60, "the opening's dawn sets the clock");
    assert.equal(worldClock(before.runtime.world_minutes, "en"), "Day 1 · morning");
    const played = await c.turn("I listen at the door.", [{ text: "Nothing on the landing. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 2, reason: "listening at the door" } }, finish] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    const turn = play.turns.find((row) => row.id === played.input.operationId);
    assert.ok(turn.changes.some((change) => change.summary === "Time passes: 2 minutes"), JSON.stringify(turn.changes.map((change) => change.summary)));
    assert.equal(worldClock(play.worldMinutes, "en", play.restRecords), "Day 1 · morning");
    // Evening, then a long rest from 20:00 to 04:00: the day turns at the rest's end, and the 05:00 first light turns nothing.
    await c.turn("I wait for the evening.", [{ text: "The day goes by. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 20 * 60 - 6 * 60 - 2, reason: "the day" } }, finish] }]);
    const rested = await c.turn("I sleep.", [{ text: "You sleep. ", toolCalls: [{ name: "rest", arguments: { kind: "long", safe: true, minutes: 480 } }, finish] }]);
    assert.equal(rested.result.status, "committed", JSON.stringify(c.errors));
    const night = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    assert.equal(night.worldMinutes, 1440 + 4 * 60);
    assert.deepEqual(longRestEnds(night.restRecords), [1440 + 4 * 60]);
    assert.equal(worldClock(night.worldMinutes, "en", night.restRecords), "Day 2 · night");
    await c.turn("I get up.", [{ text: "Grey light. ", toolCalls: [{ name: "advance_time", arguments: { minutes: 60, reason: "getting up" } }, finish] }]);
    const dawn = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
    assert.equal(worldClock(dawn.worldMinutes, "en", dawn.restRecords), "Day 2 · morning");
  } finally { await f.db.close(); }
});

// --- item 5 --------------------------------------------------------------------------------------------------------------
const catEntity = { id: "00000000-0000-4000-8000-0000000000c1", campaign_id: "00000000-0000-4000-8000-0000000000aa", kind: "companion", name: "The cat",
  details: "James's familiar: a lean black cat with one torn ear.", conditions: [], character_sheet: null };
test("item 5: a familiar or an animal companion is a creature; a person who keeps one is not", () => {
  assert.deepEqual(creatureOfEntity(catEntity), { species: "cat" });
  assert.deepEqual(creatureOf({ kind: "companion", name: "Copper", details: "A sleek ginger cat who rides on James's pack." }), { species: "cat" });
  assert.deepEqual(creatureOf({ kind: "companion", name: "Pip", role: "Cat familiar", details: "" }), { species: "cat" });
  assert.deepEqual(creatureOf({ kind: "npc", name: "Уголёк", details: "Кот, чёрный как сажа." }), { species: "cat" });
  assert.deepEqual(creatureOf({ kind: "companion", name: "Jinx", details: "James's familiar, a small black cat that watches doors." }), { species: "cat" });
  assert.equal(creatureOf({ kind: "npc", name: "Hedda Brannock", details: "A woman with a cat on her shoulder." }), null);
  assert.equal(creatureOf({ kind: "player", name: "James Worgen", details: "A warlock with a cat." }), null);
  assert.equal(creatureOf({ kind: "companion", name: "Mara Vey", details: "A young netrunner in a yellow raincoat." }), null);
});

test("item 5: the cat's portrait prompt draws the cat alone — the species, no person, no full-length doll — in every prompt dialect", () => {
  for (const family of ["gpt-image", "nano-banana", "seedream", "flux", "qwen", "grok"]) {
    const prompt = compileCreatureAnchorPrompt({ species: "cat", appearance: "a lean black cat with one torn ear and amber eyes", style: "ink and watercolour", hasStyleReference: true }, family);
    assert.match(prompt, /A portrait of a single cat, an animal drawn alone/, family);
    assert.match(prompt, /lean black cat with one torn ear/, family);
    assert.doesNotMatch(prompt, /character portrait|head-and-shoulders|full-body|from head to boots|exactly one person|five fingers|this character|the hero|raven/i, family);
    if (family !== "flux") assert.match(prompt, /no human figure/, family);
  }
  // The anchor plan: the cat gets its portrait and no doll; a person companion keeps the figure.
  const person = { ...catEntity, id: "00000000-0000-4000-8000-0000000000c2", name: "Mara Vey", details: "A young netrunner in a yellow raincoat." };
  const snapshot = { campaign: { id: catEntity.campaign_id }, entities: [catEntity, person], locations: [], items: [] };
  const plan = anchorSet(snapshot, { items: false, portraits: true, figures: true, places: false, holdings: false });
  assert.deepEqual(plan.filter((step) => step.subject.id === catEntity.id).map((step) => step.composition), ["portrait"]);
  assert.deepEqual(plan.filter((step) => step.subject.id === person.id).map((step) => step.composition), ["portrait", "figure"]);
});

test("item 5: the visual profile is drafted from the words — the hero's sheet line about the cat, the owner's text first — never from a picture", () => {
  const hero = { kind: "player", character_sheet: { abilities: ["Pact of the Chain: Find Familiar as a ritual", "The cat (familiar): AC 12, 2 HP, speed 40 ft, climb 30 ft. Keen smell."], limitations: [] } };
  const text = profileSourceText({ entity: catEntity, ownerText: "Black, thin, one torn ear, amber eyes.", hero, worn: [] });
  assert.match(text, /^The owner's description \(it wins over everything else\): Black, thin, one torn ear, amber eyes\./);
  assert.match(text, /The hero's sheet about it: The cat \(familiar\): AC 12, 2 HP, speed 40 ft, climb 30 ft\. Keen smell\./);
  assert.doesNotMatch(text, /Find Familiar as a ritual/, "only the lines about it");
  const request = profileRequest({ kind: "creature", species: "cat", name: "The cat", text, language: "en" });
  assert.ok(request.content.every((block) => block.type === "text"), "no picture goes in");
  assert.match(request.system, /it is an animal, a cat, and nothing else — never a person/);
  assert.match(request.system, /the owner's words win/);
  assert.match(request.content[0].text, /The hero's sheet about it: The cat \(familiar\): AC 12, 2 HP/);
  // A look drafted from the wrong picture names another animal: it is not used, and it is drafted again from the words.
  assert.equal(contradictsSpecies("The Cat is a large, glossy black raven, not a feline.", "cat", "The cat"), true);
  assert.equal(contradictsSpecies("A lean black cat with one torn ear.", "cat", "The cat"), false);
  assert.equal(contradictsSpecies("The cat is a lean black cat.", "cat", "The cat"), false);
  const service = readFileSync(new URL("../src/lib/server/media/pictures-service.ts", import.meta.url), "utf8");
  const draftBody = service.slice(service.indexOf("async function draftProfileFor"), service.indexOf("/** An anchor of a record"));
  assert.doesNotMatch(draftBody, /privatePicture|storage\.get|images/, "draftProfileFor reads no picture");
  assert.match(service, /person && creature\s*\?\s*compileCreatureAnchorPrompt/, "the anchor of a creature uses the creature prompt");
});

test("item 5: the owner's text wins — a figure redrawn after the owner rewrote the look follows his words, not the older portrait", () => {
  const subject = { kind: "entity", id: "00000000-0000-4000-8000-0000000000d1" };
  const portrait = { id: "00000000-0000-4000-8000-0000000000e1", kind: "anchor", subjectKind: "entity", subjectId: subject.id, composition: "portrait", status: "ready", hidden: false, version: 1, createdAt: "2026-10-24T10:00:00.000Z" };
  const board = (profiles) => ({ styles: [], pictures: [portrait], profiles });
  const model = "gpt-image-2.5-flare";
  assert.deepEqual(referencesForAnchor(board([]), subject, "figure", model), [portrait.id], "the portrait is the figure's face reference");
  assert.deepEqual(referencesForAnchor(board([{ subjectKind: "entity", subjectId: subject.id, version: 1, look: "Model look.", changes: [], source: "model", createdAt: "2026-10-24T11:00:00.000Z" }]), subject, "figure", model), [portrait.id]);
  assert.deepEqual(referencesForAnchor(board([{ subjectKind: "entity", subjectId: subject.id, version: 2, look: "The owner's look.", changes: [], source: "owner", createdAt: "2026-10-24T12:00:00.000Z" }]), subject, "figure", model), [],
    "after the owner's edit the redraw uses only the text");
});

// --- the review's renderer (as tests/universal-bootstrap-ui.test.mjs loads it) ---------------------------------------------
function ui(relative) {
  const root = fileURLToPath(new URL("../src/", import.meta.url)), require = createRequire(import.meta.url), modules = new Map();
  function load(path) {
    if (modules.has(path)) return modules.get(path);
    const mod = { exports: {} };
    modules.set(path, mod.exports);
    const compiled = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = (name) => {
      if (name.endsWith(".css") || name === "server-only") return {};
      if (name.startsWith(".")) { const p = resolve(dirname(path), name); return load(existsSync(p) ? p : existsSync(`${p}.tsx`) ? `${p}.tsx` : `${p}.ts`); }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: path })(localRequire, mod, mod.exports);
    modules.set(path, mod.exports);
    return mod.exports;
  }
  return load(resolve(root, relative));
}
