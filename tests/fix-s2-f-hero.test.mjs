// Fix run after session 2, stage F (items 8, 15, 16, 19, 20, 34): the new campaign's hero created in one pass by the
// campaign's DM (a scripted DmModel — no provider is contacted), its numbers kept as the owner wrote them, no quote
// grounding, no 12/8 caps, things written with their kind and slot and worn, counters with their names, the wallet;
// the world's text as a canon document the DM's turn reads; the adventure's full text in the turn; the owner's answers
// to the questions pinned for the DM. Synthetic texts only.
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createBootstrapService } from "../src/lib/adventures/bootstrap-service.ts";
import { initialOpeningReview } from "../src/lib/adventures/bootstrap-validation.ts";
import {
  heroBlockedReason, heroReviewForCommit, initialHeroReview, manualHeroProposal, normalizeHeroDraft, ownerNumbers,
  parseHeroProposal, parseHeroReview, readHeroDraft, counterKeyFrom,
} from "../src/lib/adventures/hero-draft.ts";
import { buildHeroDraftRequest } from "../src/lib/adventures/hero-draft-request.ts";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";

const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === "server-only" ? { url: "data:text/javascript,export%20{}", shortCircuit: true } : nextResolve(specifier, context);
} });
const { createHeroDraftProvider } = await import("../src/lib/server/hero-draft-provider.ts");
hook.deregister();

const world = {
  title: "Побережье Мечей (синтетика)",
  premise: "Синтетический мир для теста: торговый тракт, города-крепости, гильдии магов и стража тракта. Правила — D&D 5e.",
};
const description = [
  "Волшебник 9 уровня, школа воплощения. Интеллект 20, Ловкость 14, Телосложение 14, Мудрость 12, Харизма 10, Сила 8.",
  "Хиты 52, КД 15 (доспехи мага). 60 зм и 12 см.",
  "Ношу шляпу, мантию, сапоги, кольцо защиты на правой руке, боевой посох. В сумке два зелья лечения и книга заклинаний.",
].join("\n");
// The DM's answer (one JSON object) — with the faults session 2 had: a wrong score, a Russian counter id, potions as a
// counter, an unknown slot, an unnamed thing, a ring in a hand slot, a repeat.
const dmAnswer = {
  mode: "structured_rpg", role: "Волшебник 9-го уровня, школа воплощения", level: 9, background: "Маг тракта.",
  abilities: { strength: 8, dexterity: 14, constitution: 14, intelligence: 18, wisdom: 12, charisma: 10 },
  proficiencyBonus: 4, hp: 52, armorClass: 15, speed: "30 футов",
  saves: ["Спасбросок Интеллекта +9", "Спасбросок Мудрости +5"], skills: ["Магия +9", "История +9", "Анализ +9"],
  attacks: ["Боевой посох: +3 к попаданию, 1d6−1 дробящий"], features: ["Магическое восстановление: раз в день после короткого отдыха"],
  limitations: [],
  spells: [
    { name: "Огненный шар", level: 3, prepared: true, castingTime: "1 действие", range: "150 футов", damage: "8d6 огнём", text: "Взрыв пламени." },
    { name: "Волшебная стрела", level: 1, prepared: true }, { name: "Огненный снаряд", level: 0 }, { name: "Без круга" },
  ],
  preparedMax: 14,
  items: [
    { name: "Боевой посох", description: "Дубовый посох.\nВторая строка.", quantity: 1, kind: "weapon", slot: "hand", damage: "1d6 дробящий", properties: "универсальное (1d8)" },
    { name: "Шляпа волшебника", quantity: 1, kind: "clothing", slot: "head" },
    { name: "Мантия", quantity: 1, kind: "clothing", slot: "body" },
    { name: "Сапоги", quantity: 1, kind: "clothing", slot: "boots" },
    { name: "Кольцо защиты", quantity: 1, kind: "jewelry", slot: "ring_right", bonuses: [{ to: "КД", value: 1 }, { to: "спасброски", value: 1 }], attunement: true },
    { name: "Книга заклинаний", quantity: 1, kind: "gear", slot: "pocket" },
    { name: "Перо", quantity: 1, kind: "jewelry", slot: "hand" },
    { name: "", quantity: 1 },
    { name: "Мантия", quantity: 1 },
    ...Array.from({ length: 14 }, (_, i) => ({ name: `Свиток ${i + 1}`, quantity: 1, kind: "consumable", slot: null })),
  ],
  counters: [
    { key: "ячейки_1", label: "Ячейки 1 круга", value: 4, max: 4 }, { key: "spell_slots_2", label: "Ячейки 2 круга", value: 3, max: 3 },
    { key: "hit_dice", label: "Кости хитов", value: 9, max: 9 }, { key: "potions", label: "Зелья лечения", value: 2, max: 2 },
    { key: "arcane", label: "Магическое восстановление", value: 1, max: 1 },
  ],
  money: [{ coin: "зм", amount: 50 }, { coin: "см", amount: 12 }],
  questions: ["Какой у героя наставник?"],
};
const input = (extra = {}) => ({ name: "Тессен", description, language: "ru", ...extra });

test("the DM's one-pass hero is read tolerantly: the owner's numbers win, faults repaired or dropped in plain words", () => {
  const owner = ownerNumbers(description, "ru");
  assert.equal(owner.attributes.intelligence, 20);
  assert.equal(owner.attributes.strength, 8);
  assert.equal(owner.level, 9);
  assert.equal(owner.hp, 52);
  assert.equal(owner.armorClass, 15);
  assert.deepEqual(owner.coins, [{ code: "зм", amount: 60 }, { code: "см", amount: 12 }]);
  assert.deepEqual(ownerNumbers("Спасбросок Интеллекта +7, Интеллект +4", "ru").attributes, {}, "a signed number is a modifier, not a score");

  const proposal = readHeroDraft(`Вот лист:\n${JSON.stringify(dmAnswer)}\n`, input());
  assert.ok(proposal);
  assert.equal(proposal.schemaVersion, 3);
  assert.equal(proposal.sheet.attributes.intelligence, 20, "the owner's score, not the DM's 18");
  assert.ok(proposal.notes.some((note) => /Интеллект 20 — как в твоём тексте/.test(note)));
  assert.equal(proposal.sheet.level, 9);
  assert.equal(proposal.sheet.armorClass, 15);
  assert.equal(proposal.mechanics.hp, 52);
  assert.equal(proposal.mechanics.defense, 15);
  assert.equal(proposal.mechanics.weaponName, "Боевой посох");
  assert.equal(proposal.sheet.abilities[0], "Бонус мастерства +4");
  assert.deepEqual(proposal.sheet.spells.map((spell) => spell.name), ["Огненный шар", "Волшебная стрела", "Огненный снаряд"]);
  assert.ok(proposal.notes.some((note) => /Заклинаний не вошло: 1/.test(note)));
  const byName = Object.fromEntries(proposal.possessions.map((item) => [item.name, item]));
  assert.equal(byName["Боевой посох"].slot, "hand");
  assert.equal(byName["Боевой посох"].mechanics, "1d6 дробящий; универсальное (1d8)");
  assert.equal(byName["Кольцо защиты"].slot, "ring_right");
  assert.deepEqual(byName["Кольцо защиты"].detail, { bonuses: [{ to: "КД", value: 1 }, { to: "спасброски", value: 1 }], attunement: true });
  assert.equal(byName["Книга заклинаний"].slot, null, "an unknown slot leaves the thing in the pack");
  assert.equal(byName["Перо"].slot, null, "a slot that does not take the kind");
  assert.equal(byName["Мантия"].quantity, 2, "a repeated name stacks");
  assert.equal(byName["Мантия"].slot, null, "a stack is not worn");
  assert.equal(byName["Зелья лечения"].kind, "consumable", "potions are things, not a counter");
  assert.equal(proposal.possessions.length, 22, "more than twelve things");
  assert.deepEqual(proposal.counters.map((row) => row.key), ["spell_slots_1", "spell_slots_2", "hit_dice", "arcane"]);
  assert.equal(proposal.counters[0].label, "Ячейки 1 круга");
  assert.deepEqual(proposal.wallet, [{ code: "зм", amount: 60 }, { code: "см", amount: 12 }], "the owner's 60 зм, not the DM's 50");
  assert.deepEqual(proposal.questions, [{ question: "Какой у героя наставник?", consequential: false }], "a question never blocks");
  assert.doesNotThrow(() => parseHeroProposal(proposal), "the strict check takes the repaired draft");
  // Nothing of it is a verbatim quote of the owner's words — and nothing needs to be.
  assert.ok(!description.includes("Огненный шар"));
});

test("an unreadable or failed answer still opens a sheet to fill in by hand, with the owner's numbers and the reason", () => {
  assert.equal(readHeroDraft("не JSON", input()), null);
  const manual = manualHeroProposal(input(), "Ведущий не ответил.");
  assert.equal(manual.sheet.attributes.intelligence, 20);
  assert.equal(manual.mechanics.hp, 52);
  assert.deepEqual(manual.wallet, [{ code: "зм", amount: 60 }, { code: "см", amount: 12 }]);
  assert.deepEqual(manual.notes, ["Ведущий не ответил."]);
  assert.doesNotThrow(() => parseHeroProposal(manual));
  assert.equal(counterKeyFrom("кости", "Кости хитов"), "hit_dice");
  assert.equal(counterKeyFrom(null, "Ячейки 3 круга"), "spell_slots_3");
  assert.equal(counterKeyFrom("", "Клык шамана"), "klyk_shamana");
});

test("the review: edits are applied at «Утвердить героя», a grey button always says why", () => {
  const proposal = readHeroDraft(JSON.stringify(dmAnswer), input());
  const review = initialHeroReview({ name: "Тессен", description }, proposal);
  assert.equal(heroBlockedReason(review, "ru"), null);
  const twoInHand = { ...review, possessions: review.possessions.map((item) => item.name === "Шляпа волшебника" ? { ...item, kind: "weapon", slot: "hand" } : item) };
  assert.match(heroBlockedReason(twoInHand, "ru"), /В слоте «Основная рука» две вещи/);
  const edited = { ...review, sheet: { ...review.sheet, skills: [...review.sheet.skills, "  ", "Убеждение +4"] }, mechanics: { ...review.mechanics, hp: 60 } };
  const committed = heroReviewForCommit(edited);
  assert.deepEqual(committed.sheet.skills.at(-1), "Убеждение +4");
  assert.equal(committed.mechanics.hp, 60, "the owner's HP edit is kept");
  assert.doesNotThrow(() => parseHeroReview(committed, proposal));
});

test("the provider asks the campaign's DM once (scripted model) and logs the attempt; a failure gives a manual sheet", async () => {
  const lines = [];
  const original = console.info;
  console.info = (line) => lines.push(String(line));
  try {
    const model = createScriptedDmModel([{ text: JSON.stringify(dmAnswer), usage: { inputTokens: 3000, outputTokens: 2000 } }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
    const ticket = { kind: "creation", input: { requestId: randomUUID(), worldId: randomUUID(), worldVersion: 1, title: "Т", ...input() },
      world: { title: world.title, premise: world.premise }, profile: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" }, context: {} };
    const result = await createHeroDraftProvider({ model: () => model })(ticket);
    assert.equal(model.requests.length, 1);
    assert.equal(model.requests[0].effort, "high");
    assert.equal(model.requests[0].toolset, null);
    assert.match(model.requests[0].messages[0].text, /Интеллект 20/);
    assert.match(model.requests[0].messages[0].text, /Побережье Мечей/);
    assert.equal(result.usage.model, "claude-opus-5-5");
    assert.equal(result.output.sheet.attributes.intelligence, 20);
    const failing = createScriptedDmModel([{ failBefore: "transport" }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
    const manual = await createHeroDraftProvider({ model: () => failing })(ticket);
    assert.equal(manual.output.possessions.length, 0);
    assert.match(manual.output.notes[0], /Ведущий не ответил/);
    assert.ok(lines.some((line) => /"event":"bootstrap_provider_attempt"/.test(line)));
    assert.ok(lines.some((line) => /"event":"bootstrap_provider_done"/.test(line)));
    assert.ok(lines.some((line) => /"event":"bootstrap_provider_refused".*"code":"retryable_transport"/.test(line)));
  } finally { console.info = original; }
  const request = buildHeroDraftRequest({ language: "ru", name: "Тессен", description, world }, "high");
  assert.match(request.system[0].text, /Every number the owner gave is kept exactly/);
  assert.match(request.system[1].text, /Russian/);
});

async function heroCampaign(answer = dmAnswer) {
  const f = await setup({ world, name: "Тессен", description, caps: [], limits: [], item: null,
    adventure: "Синтетическое приключение.", location: "Пост стражи", situation: "Утро у поста стражи.", npc: "Капитан стражи",
    narration: "Утро. Капитан стражи ждёт у ворот. Что ты делаешь?" }, "ru", 999);
  f.profile = resolveExecutionProfile({ task: "world.compose", profileId: randomUUID(), globalDefault: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "high" } });
  const model = createScriptedDmModel([{ text: JSON.stringify(answer) }], { providerId: "anthropic", modelId: "claude-opus-5-5" });
  const heroProvider = createHeroDraftProvider({ model: () => model });
  const quiet = console.info;
  f.service = createBootstrapService(f.rpc, async (ticket) => {
    f.calls++;
    f.ticket = ticket;
    if (ticket.kind !== "creation") return { output: f.opening, usage: { model: "claude-opus-5-5", inputTokens: 10, outputTokens: 20, latencyMs: 1 } };
    console.info = () => {};
    try { return await heroProvider(ticket); } finally { console.info = quiet; }
  }, async () => f.profile);
  return f;
}

test("the hero of schema 3 commits: sheet, the eleven slots, things with kind and slot worn, counters with names, the wallet, the world as canon, answers pinned", async () => {
  const f = await heroCampaign();
  try {
    const draft = await f.service.perform({ action: "creation.propose", input: f.input });
    assert.equal(draft.proposal.schemaVersion, 3);
    assert.equal(draft.usage.model, "claude-opus-5-5");
    const review = heroReviewForCommit({ ...initialHeroReview(f.input, draft.proposal), answers: ["Старый маг из Кендлкипа."] });
    const created = await f.service.perform({ action: "creation.commit", input: { requestId: randomUUID(), draftId: draft.draftId, review } });
    f.cid = created.campaignId; f.hero = created.heroId;
    const hero = await f.one("select character_sheet,hp,max_hp,stats,resources,public_profile,equipment_slots from public.rpg_entities where id=$1", [created.heroId]);
    assert.equal(hero.character_sheet.schemaVersion, 2);
    assert.equal(hero.character_sheet.level, 9);
    assert.equal(hero.character_sheet.attributes.intelligence, 20);
    assert.equal(hero.character_sheet.spells.length, 3);
    assert.equal(hero.hp, 52);
    assert.equal(hero.max_hp, 52);
    assert.equal(hero.stats.defense, 15);
    assert.equal(hero.equipment_slots.length, 11);
    assert.equal(hero.resources.spell_slots_1, 4);
    assert.equal(hero.resources.spell_slots_1_max, 4);
    assert.equal(hero.resources.hit_dice_max, 9);
    assert.equal(hero.resources["currency_зм"], 60);
    assert.equal(hero.resources["currency_см"], 12);
    assert.equal(hero.public_profile.counterLabels.spell_slots_1, "Ячейки 1 круга");
    assert.equal(hero.public_profile.counterLabels.arcane, "Магическое восстановление");
    const items = await f.query("select name,category,quantity,mechanics,detail,equipped_entity_id,equipped_slot from public.rpg_items where campaign_id=$1", [created.campaignId]);
    assert.equal(items.length, 22, "no 12-thing cap");
    const item = (name) => items.find((row) => row.name === name);
    assert.deepEqual([item("Боевой посох").category, item("Боевой посох").equipped_slot, item("Боевой посох").mechanics], ["weapon", "hand", "1d6 дробящий; универсальное (1d8)"]);
    assert.deepEqual([item("Кольцо защиты").category, item("Кольцо защиты").equipped_slot, item("Кольцо защиты").equipped_entity_id], ["jewelry", "ring_right", created.heroId]);
    assert.equal(item("Кольцо защиты").detail.attunement, true);
    assert.deepEqual([item("Шляпа волшебника").equipped_slot, item("Сапоги").equipped_slot], ["head", "boots"]);
    assert.equal(item("Книга заклинаний").category, "gear");
    assert.equal(item("Книга заклинаний").equipped_slot, null, "the review's slot, not a guess from the name");
    assert.equal(item("Зелья лечения").category, "consumable");
    // Item 8: the world's text is a canon document the DM's world layer reads.
    const docs = await f.query("select title,status,body from public.rpg_documents where campaign_id=$1 and status='canon'", [created.campaignId]);
    assert.deepEqual(docs.map((row) => [row.title, row.status, row.body]), [[world.title, "canon", world.premise]]);
    // Item 34 (the hero review's side): the answer is an owner-pinned fact.
    const campaign = await f.one("select pinned_facts from public.rpg_campaigns where id=$1", [created.campaignId]);
    assert.deepEqual(campaign.pinned_facts.map((pin) => pin.text), ["Какой у героя наставник? — Старый маг из Кендлкипа."]);
    // Replaying the same commit returns the same receipt and writes nothing twice.
    const again = await f.service.perform({ action: "creation.commit", input: { requestId: created.requestId, draftId: draft.draftId, review } });
    assert.equal(again.campaignId, created.campaignId);
    assert.equal((await f.query("select id from public.rpg_documents where campaign_id=$1 and status='canon'", [created.campaignId])).length, 1);
    // The opening: the owner names the captain in his answer; the answer is pinned, the opening (Astra handoff included) commits.
    f.opening = { ...f.opening, questions: [{ question: "Как зовут капитана стражи?", consequential: true }] };
    await f.proposeOpening();
    f.openingCommit.input.review = { ...f.openingCommit.input.review, answers: ["Ульрик Брам, ветеран"] };
    await f.service.perform(f.openingCommit);
    const pins = (await f.one("select pinned_facts from public.rpg_campaigns where id=$1", [created.campaignId])).pinned_facts.map((pin) => pin.text);
    assert.ok(pins.includes("Как зовут капитана стражи? — Ульрик Брам, ветеран"));
    assert.equal(f.ticket.context.protagonist.sheet.level, 9, "the opening's DM sees the hero's sheet");
    const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
    const source = (await f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [f.owner, created.campaignId])).result;
    const context = buildDmLoopContext(source, { operationId: randomUUID(), campaignId: created.campaignId, timeline: source.timeline, expectedRevision: source.runtime.revision,
      mode: "game", input: "Осматриваюсь.", companionId: null, listenerIds: [], mechanic: null });
    const text = context.system.map((block) => block.text).join("\n");
    assert.match(text, /(?:Canon documents|Документы канона)[\s\S]*Побережье Мечей \(синтетика\)[\s\S]*гильдии магов/, "the world's text reaches the turn");
    assert.match(text, /Ульрик Брам/, "the opening's answer is in the DM's context");
  } finally { await f.db.close(); }
});

test("the database refuses a schema-3 review that breaks integrity (two things in a slot, a ring in the hand, a key that is money)", async () => {
  const f = await heroCampaign();
  try {
    const draft = await f.service.perform({ action: "creation.propose", input: f.input });
    const review = heroReviewForCommit(initialHeroReview(f.input, draft.proposal));
    const check = (value) => f.one("select rpg_private.bootstrap_review('creation',$1::jsonb,$2::jsonb)", [JSON.stringify(value), JSON.stringify(draft.proposal)]);
    await check(review);
    const swap = (name, change) => ({ ...review, possessions: review.possessions.map((item) => (item.name === name ? { ...item, ...change } : item)) });
    await assert.rejects(check(swap("Шляпа волшебника", { slot: "hand", kind: "weapon" })), /rpg_validation/);
    await assert.rejects(check(swap("Кольцо защиты", { slot: "hand" })), /rpg_validation/);
    await assert.rejects(check({ ...review, counters: [...review.counters, { key: "currency_gold", label: "Золото", value: 1, max: null }] }), /rpg_validation/);
    await assert.rejects(check({ ...review, possessions: [...review.possessions, ...Array.from({ length: 81 - review.possessions.length }, (_, i) => ({ name: `Камень ${i}`, description: "", quantity: 1, kind: "misc", slot: null, mechanics: "", detail: {} }))] }), /rpg_validation/, "80 things at most");
    // Older drafts keep their grounding, now with the higher ceilings.
    assert.deepEqual(normalizeHeroDraft({}, input()).possessions, []);
  } finally { await f.db.close(); }
});

test("an opening's people: the owner's name answers are applied before play", async () => {
  const { applyOpeningAnswers } = await import("../src/lib/adventures/opening-answers.ts");
  const review = { ...initialOpeningReview({ schemaVersion: 1, location: { name: "Пост", description: "Пост." }, situation: "Утро.", narration: "Капитан стражи и сержант ждут.",
    actors: [{ name: "Капитан стражи", description: "Строгий.", capabilities: [], limitations: [] }, { name: "Сержант", description: "Усталый.", capabilities: [], limitations: [] }],
    questions: [] }), answers: ["Ульрик Брам, ветеран (5e Veteran)", "Неважно", null] };
  const questions = [{ question: "Как зовут капитана стражи?", consequential: true }, { question: "Что везёт караван?", consequential: false }, { question: "Как зовут сержанта?", consequential: false }];
  const applied = applyOpeningAnswers(review, questions, "ru");
  assert.equal(applied.actors[0].name, "Ульрик Брам");
  assert.match(applied.actors[0].description, /^Капитан стражи\. Строгий\. Уточнение владельца: Ульрик Брам, ветеран \(5e Veteran\)$/);
  assert.equal(applied.actors[1].name, "Сержант", "no answer, no change");
  assert.deepEqual(applied.answers, review.answers, "the answers themselves are kept (they are pinned for the DM)");
});

test("item 15: the active adventure's whole text reaches the turn (it was cut at 600 characters as «never new facts»)", async () => {
  const tail = "С героем идут два стражника тракта: Брам, ветеран, и Лис, новобранец.";
  const adventure = `${"Дорога на юг идёт через холмы и броды; караван ждёт у ворот. ".repeat(14)}${tail}`;
  const f = await setup({ world, name: "Тессен", description: "Волшебник. Ношу посох.", caps: [], limits: [], item: null, adventure,
    location: "Пост стражи", situation: "Утро у поста стражи.", npc: "Капитан стражи", narration: "Утро у поста. Что ты делаешь?" }, "ru", 999);
  try {
    f.creation = { ...f.creation, possessions: [] };
    await f.create();
    await f.startOpening();
    const { buildDmLoopContext } = await import("../src/lib/gameplay/dm-loop/context.ts");
    const source = (await f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [f.owner, f.cid])).result;
    assert.ok(adventure.length > 600);
    const context = buildDmLoopContext(source, { operationId: randomUUID(), campaignId: f.cid, timeline: source.timeline, expectedRevision: source.runtime.revision,
      mode: "game", input: "Иду к каравану.", companionId: null, listenerIds: [], mechanic: null });
    const text = context.system.map((block) => block.text).join("\n");
    assert.ok(text.includes(tail), "the end of a long adventure text is in the turn");
    assert.match(text, /is established for this adventure/);
    assert.doesNotMatch(text, /never new facts/);
  } finally { await f.db.close(); }
});
