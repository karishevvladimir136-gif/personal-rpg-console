// Polish stage, group 1 (docs/stages/POLISH.md): correctness of the turn and
// the records — every text part reaches the player with its paragraph break,
// the silent continuation after a roll is asked for once, the player's chips
// speak the campaign language and never show private work, money works in the
// world's own currency, items are lost / changed / pledged, «Твой момент» is
// server-checked, world-level plans, play time, and «Закончить сессию» closes
// the session for the digest (with the stinger).
import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loopCampaign } from "./dm-loop-fixture.mjs";
import { createScriptedDmModel } from "../src/lib/gameplay/dm-loop/scripted-model.ts";
import { continuation, joinText, narrationNames, textSeparator } from "../src/lib/gameplay/dm-loop/loop.ts";
import { currencyAmount, durationText, possessionsLabel } from "../src/lib/gameplay/dm-loop/receipt-text.ts";
import { sameCurrency } from "../src/lib/gameplay/dm-loop/execute.ts";
import { parseDigest } from "../src/lib/gameplay/dm-loop/digest.ts";

const finish = (extra = {}) => ({ name: "finish_turn", arguments: { sceneKinds: ["conversation"], spotlight: [], playerMoment: false, ...extra } });
const publicTurn = async (c, operationId) => (await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid)).turns.find((row) => row.id === operationId);
const summaries = (turn) => turn.changes.map((change) => change.summary);

test("text parts: a dialogue dash after a finished sentence starts a paragraph; an interrupted sentence continues", () => {
  assert.equal(textSeparator("…и ни монетой больше.", "— Выстрелишь или утопишь, — сказала Дуня."), "\n\n");
  assert.equal(textSeparator("Рован тянет ставню на себя —", "— петля скрипит."), "");
  assert.equal(continuation("Рован тянет ставню —", "— и петля скрипит."), " и петля скрипит.".replace(/^ /, ""));
  assert.equal(joinText("Он кивает,", "— ладно."), "Он кивает, — ладно.");
  assert.equal(joinText("Он смотрит в воду.", "Ничего."), "Он смотрит в воду.\n\nНичего.");
  assert.equal(narrationNames("Сетевяз Мокей кивает. Марте он не верит.", "Мокей"), true);
  assert.equal(narrationNames("Мокея здесь нет.", "Мокей"), true);
  assert.equal(narrationNames("Марте он не верит.", "Марта"), true);
  assert.equal(narrationNames("Моки — не он.", "Мокей"), false);
  assert.equal(narrationNames("Someone knocks.", "Dana Velvet"), false);
  assert.equal(narrationNames("Dana opens the door.", "Dana Velvet"), true);
});

test("receipt text: currency inflection, durations and the possessions label", () => {
  assert.equal(currencyAmount("ru", 1, "монета"), "1 монета");
  assert.equal(currencyAmount("ru", 2, "монета"), "2 монеты");
  assert.equal(currencyAmount("ru", 5, "монета"), "5 монет");
  assert.equal(currencyAmount("ru", 21, "монета"), "21 монета");
  assert.equal(currencyAmount("ru", 3, "талер"), "3 талера");
  assert.equal(currencyAmount("ru", 11, "талер"), "11 талеров");
  assert.equal(currencyAmount("ru", 2, "рубль"), "2 рубля");
  assert.equal(currencyAmount("en", 1, "coins"), "1 coin");
  assert.equal(currencyAmount("en", 7, "silver piece"), "7 silver pieces");
  assert.equal(durationText("ru", 10), "10 минут");
  assert.equal(durationText("ru", 60), "час");
  assert.equal(durationText("ru", 135), "2 часа 15 минут");
  assert.equal(durationText("en", 300), "5 hours");
  assert.equal(possessionsLabel("ru", "Марта"), "Вещи Марты");
  assert.equal(possessionsLabel("ru", "Мокей"), "Вещи Мокея");
  assert.equal(possessionsLabel("ru", "Дуня"), "Вещи Дуни");
  assert.equal(possessionsLabel("ru", "Чужак в сухом пальто"), "Вещи: Чужак в сухом пальто");
  assert.equal(possessionsLabel("en", "Marta"), "Marta's things");
  assert.equal(sameCurrency("монета", "Монеты"), true);
  assert.equal(sameCurrency("монет", "монетами"), true);
  assert.equal(sameCurrency("coin", "coins"), true);
  assert.equal(sameCurrency("silver piece", "silver pieces"), true);
  assert.equal(sameCurrency("монеты", "талеры"), false);
  assert.equal(sameCurrency("соль", "солид"), false);
});

test("a text part after a tool call inside one message keeps its paragraph break and reaches the player in order", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Ищу второго гребца.", [
      { parts: [
        { text: "Дуня сплёвывает за борт. — Гребца тебе? Есть один." },
        { toolCall: { name: "upsert_character", arguments: { localKey: "mokey", name: "Мокей", kind: "npc", description: "Сетевяз с крайнего понтона.", present: false } } },
        { text: "— Мокей, с крайнего понтона. Говорит за неделю меньше, чем Сапог за минуту." },
        { toolCall: finish() },
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.equal(row.narration, "Дуня сплёвывает за борт. — Гребца тебе? Есть один.\n\n— Мокей, с крайнего понтона. Говорит за неделю меньше, чем Сапог за минуту.");
    const streamed = c.live.filter((event) => event.type === "text").map((event) => event.text).join("");
    assert.equal(streamed, row.narration);
    // The narration names Мокей, so the player's chips show the new person.
    const turn = await publicTurn(c, played.input.operationId);
    assert.ok(summaries(turn).includes("Новый человек: Мокей"), JSON.stringify(turn.changes));
  } finally { await c.f.db.close(); }
});

test("a person recorded ahead of the story stays out of the chips and the codex until the narration names them", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const first = await c.turn("Прошу Дуню найти ещё одного гребца.", [
      { text: "Дуня кивает: она подумает. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "mokey", name: "Мокей", kind: "npc", description: "Сетевяз.", present: false } },
        { name: "note_character", arguments: { actorRef: "mokey", identity: { wants: ["починить ворот"], observableVoice: "Молчун." } } },
        finish(),
      ] },
    ]);
    assert.equal(first.result.status, "committed", JSON.stringify(c.errors));
    const turn1 = await publicTurn(c, first.input.operationId);
    assert.ok(!summaries(turn1).some((line) => line.includes("Мокей")), JSON.stringify(turn1.changes));
    assert.ok(!summaries(turn1).some((line) => /notes|DM|recorded/i.test(line)), JSON.stringify(turn1.changes));
    const snapshot = await c.f.saves(c.cid, "campaign");
    const mokey = snapshot.entities.find((row) => row.name === "Мокей");
    assert.equal(mokey.public_profile.unmet, true);
    assert.ok(!c.live.some((event) => event.type === "tool" && /Мокей/.test(event.summary)));
    // The next turn introduces him: the chip appears and the mark clears.
    const second = await c.turn("Кто он?", [
      { text: "— Мокей, сетевяз с крайнего понтона, — говорит Дуня. ", toolCalls: [
        { name: "upsert_character", arguments: { ref: mokey.id, present: true } },
        finish(),
      ] },
    ]);
    assert.equal(second.result.status, "committed", JSON.stringify(c.errors));
    const turn2 = await publicTurn(c, second.input.operationId);
    assert.ok(summaries(turn2).includes("Новый человек: Мокей"), JSON.stringify(turn2.changes));
    const after = await c.f.saves(c.cid, "campaign");
    assert.equal(after.entities.find((row) => row.id === mokey.id).public_profile.unmet, undefined);
  } finally { await c.f.db.close(); }
});

test("the model that ends on a roll without narrating its outcome is asked once; the outcome reaches the player", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Пробую оживить ворот.", [
      { text: "Рэй берётся за рукоять.", toolCalls: [
        { name: "roll", arguments: { formula: "1d20", reason: "оживить ворот Мокея", actorRef: c.hero, visibility: "player", dc: 12, kind: "skill" } },
      ] },
      { toolCalls: [finish({ nextTension: "tense" })] },
      { text: "Ворот скрипит, потом поддаётся: барабан делает полный оборот." },
    ], { dice: [15] });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const row = await c.row(played.input.operationId);
    assert.match(row.narration, /Ворот скрипит/);
    assert.equal(played.model.requests.length, 3);
    const asked = played.model.requests[2].messages.filter((m) => m.role === "user" && /saw the roll/.test(m.text));
    assert.equal(asked.length, 1, "asked once");
    assert.ok(row.checkpoint.dmLoop.diagnostics.some((row) => row.kind === "outcome_asked"));
  } finally { await c.f.db.close(); }
});

test("the player's chips speak the campaign language and never show private rolls, notes or plans", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Иду на понтонный рынок и покупаю хлеб.", [
      { text: "Рынок гудит. ", toolCalls: [
        { name: "roll", arguments: { formula: "1d20+2", reason: "видит ли Фрол руку под кафтаном", actorRef: "dm", visibility: "private", dc: 11 } },
        { name: "upsert_place", arguments: { localKey: "market", name: "Понтонный рынок", description: "Лодки борт к борту.", status: "visited" } },
        { name: "upsert_place", arguments: { localKey: "mole", name: "Чёрный волнорез", description: "Говорят, туда не ходят.", status: "rumored" } },
        { name: "item", arguments: { action: "create", localKey: "bread", name: "Буханка", category: "consumable", ownerRef: c.hero, description: "Тёплая." } },
        { name: "money", arguments: { action: "grant", currency: "Монеты", amount: 15, toRef: c.hero, reason: "плата за прошлую работу" } },
        { name: "money", arguments: { action: "spend", currency: "монет", amount: 2, fromRef: c.hero, reason: "хлеб" } },
        { name: "resource", arguments: { actorRef: c.hero, resource: "hp", set: 9, max: 10, reason: "порез о мидии" } },
        { name: "quest", arguments: { action: "create", localKey: "debt", kind: "debt", title: "Сорок монет Марте", description: "За постой." } },
        { name: "quest", arguments: { action: "create", localKey: "lead", kind: "thread", title: "Ящик у Чёрного волнореза", description: "Слух." } },
        { name: "note_world", arguments: { kind: "fact", key: "plan_frol", operation: "set", value: "Фрол продаст молчание утром.", actorRef: "world", dueInMinutes: 600, consequence: "Патруль узнаёт о лодке.", warning: "Фрол крутится у стойки." } },
        { name: "note_world", arguments: { kind: "fact", key: "guild_valve", operation: "set", value: "В ящике регенераторный клапан Гильдии." } },
        { name: "advance_time", arguments: { minutes: 10, reason: "покупка" } },
        finish(),
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const turn = await publicTurn(c, played.input.operationId);
    const lines = summaries(turn);
    assert.ok(lines.includes("Новое место: Понтонный рынок"), JSON.stringify(lines));
    assert.ok(lines.includes("Слух о месте: Чёрный волнорез"), JSON.stringify(lines));
    assert.ok(lines.includes("Получено: Буханка"), JSON.stringify(lines));
    assert.ok(lines.includes("+15 монет (плата за прошлую работу)"), JSON.stringify(lines));
    assert.ok(lines.includes("−2 монеты (хлеб)"), JSON.stringify(lines));
    assert.ok(lines.some((line) => /^Хиты: \d+ → \d+ из \d+ \(порез о мидии\)$/.test(line)), JSON.stringify(lines));
    assert.ok(lines.includes("Долг: Сорок монет Марте"), JSON.stringify(lines));
    assert.ok(lines.includes("Зацепка: Ящик у Чёрного волнореза"), JSON.stringify(lines));
    assert.ok(lines.includes("Прошло: 10 минут"), JSON.stringify(lines));
    // Nothing private, nothing English, no plan counters.
    assert.ok(!lines.some((line) => /rolls|DM|note|plan|recorded|updated|minutes pass|Looked up|Фрол/.test(line)), JSON.stringify(lines));
    assert.ok(!lines.some((line) => /[A-Za-z]/.test(line)), JSON.stringify(lines));
    const live = c.live.filter((event) => event.type === "tool");
    assert.equal(live.length, lines.length);
    assert.ok(!live.some((event) => /Фрол|клапан/.test(event.summary)));
    // The world-level plan was accepted with no actor; the storages carry the campaign's words.
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    const plan = receipts.find((r) => r.call.arguments.key === "plan_frol");
    assert.equal(plan.result.ok, true, JSON.stringify(plan.result));
    assert.equal(plan.result.value.plan.actor, null);
    const state = await c.state();
    assert.ok(state.storages.every((row) => !/Possessions of/.test(row.name)), JSON.stringify(state.storages));
  } finally { await c.f.db.close(); }
});

test("money in the world's own currency: Russian names and inflections, mixed case, a reward claimed in the completing message", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const marta = await c.turn("Марта.", [
      { text: "Марта считает. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "marta", name: "Марта", kind: "npc", description: "Трактирщица.", present: true } },
        { name: "money", arguments: { action: "grant", currency: "Монеты", amount: 94, toRef: c.hero, reason: "старый долг гильдии" } },
        { name: "money", arguments: { action: "transfer", currency: "монет", amount: 31, fromRef: c.hero, toRef: "marta" } },
        { name: "money", arguments: { action: "transfer", currency: "монета", amount: 1, fromRef: c.hero, toRef: "marta" } },
        { name: "quest", arguments: { action: "create", localKey: "box", title: "Ящик с «Сельди»", description: "Поднять ящик.", issuerRef: "marta", reward: { currency: "монетами", amount: 94 } } },
        finish(),
      ] },
    ]);
    assert.equal(marta.result.status, "committed", JSON.stringify(c.errors));
    let receipts = (await c.row(marta.input.operationId)).checkpoint.dmLoop.receipts;
    assert.ok(receipts.every((r) => r.result.ok), JSON.stringify(receipts.filter((r) => !r.result.ok).map((r) => r.result.reason)));
    let state = await c.state();
    let hero = state.entities.find((row) => row.id === c.hero);
    assert.deepEqual(Object.keys(hero.resources).filter((key) => key.startsWith("currency_")), ["currency_монеты"]);
    assert.equal(hero.resources["currency_монеты"], 62);
    const martaRow = state.entities.find((row) => row.name === "Марта");
    assert.equal(martaRow.resources["currency_монеты"], 32);
    // claim_reward before complete in one message: both accepted; the reward is paid once.
    const paid = await c.turn("Отдаю ящик Марте.", [
      { text: "Марта ставит ящик на стойку. ", toolCalls: [
        { name: "quest", arguments: { action: "claim_reward", questRef: "Ящик с «Сельди»" } },
        { name: "quest", arguments: { action: "complete", questRef: "Ящик с «Сельди»" } },
        { name: "quest", arguments: { action: "claim_reward", questRef: "Ящик с «Сельди»" } },
        finish(),
      ] },
    ]);
    assert.equal(paid.result.status, "committed", JSON.stringify(c.errors));
    receipts = (await c.row(paid.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, true, JSON.stringify(receipts[0].result));
    assert.equal(receipts[0].result.value.completed, true);
    assert.equal(receipts[1].result.ok, true, JSON.stringify(receipts[1].result));
    assert.equal(receipts[2].result.ok, false);
    assert.match(receipts[2].result.reason, /already paid/);
    state = await c.state();
    hero = state.entities.find((row) => row.id === c.hero);
    assert.equal(hero.resources["currency_монеты"], 62 + 94);
    assert.equal(state.quests.find((row) => row.title === "Ящик с «Сельди»").status, "complete");
    const turn = await publicTurn(c, paid.input.operationId);
    assert.ok(summaries(turn).includes("Награда за «Ящик с «Сельди»»: 94 монеты"), JSON.stringify(turn.changes));
    // The other order works too, on a second job.
    const again = await c.turn("Вторая работа.", [
      { text: "Марта кивает. ", toolCalls: [
        { name: "quest", arguments: { action: "create", localKey: "second", title: "Вторая работа", description: "x", issuerRef: "Марта", reward: { currency: "МОНЕТ", amount: 3 } } },
        { name: "quest", arguments: { action: "complete", questRef: "second" } },
        { name: "quest", arguments: { action: "claim_reward", questRef: "second" } },
        finish(),
      ] },
    ]);
    assert.equal(again.result.status, "committed", JSON.stringify(c.errors));
    receipts = (await c.row(again.input.operationId)).checkpoint.dmLoop.receipts;
    assert.ok(receipts.slice(0, 3).every((r) => r.result.ok), JSON.stringify(receipts.map((r) => r.result)));
    state = await c.state();
    assert.equal(state.entities.find((row) => row.id === c.hero).resources["currency_монеты"], 62 + 94 + 3);
  } finally { await c.f.db.close(); }
});

test("items: lost, changed, pledged and returned; taking off is not using up", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const setup = await c.turn("Снаряжаюсь.", [
      { text: "Рэй собирает вещи. ", toolCalls: [
        { name: "upsert_character", arguments: { localKey: "dunya", name: "Дуня", kind: "npc", description: "Лодочница.", present: true } },
        { name: "item", arguments: { action: "create", localKey: "knife", name: "Нож", category: "weapon", ownerRef: c.hero } },
        { name: "item", arguments: { action: "create", localKey: "shirt", name: "Рубаха Яна", category: "gear", ownerRef: c.hero, description: "Широкая, с подолом." } },
        { name: "item", arguments: { action: "create", localKey: "pistol", name: "Гарпунный пистолет", category: "weapon", ownerRef: c.hero } },
        { name: "item", arguments: { action: "create", localKey: "gloves", name: "Смоляные рукавицы", category: "gear", ownerRef: c.hero } },
        { name: "item", arguments: { action: "equip", itemRef: "gloves" } },
        finish(),
      ] },
    ]);
    assert.equal(setup.result.status, "committed", JSON.stringify(c.errors));
    const played = await c.turn("Снимаю рукавицы, отдаю пистолет Дуне в залог, режу подол, теряю нож в иле.", [
      { text: "Нож уходит в ил. ", toolCalls: [
        { name: "item", arguments: { action: "consume", itemRef: "Смоляные рукавицы" } },
        { name: "item", arguments: { action: "unequip", itemRef: "Смоляные рукавицы" } },
        { name: "item", arguments: { action: "pledge", itemRef: "Гарпунный пистолет", ownerRef: "Дуня", condition: "шестнадцать монет, если выстрелит" } },
        { name: "item", arguments: { action: "modify", itemRef: "Рубаха Яна", name: "Рубаха Яна без подола", description: "Подол срезан на обмотку шланга.", reason: "подол пошёл на шланг" } },
        { name: "item", arguments: { action: "lose", itemRef: "Нож", reason: "ушёл в ил" } },
        { name: "item", arguments: { action: "equip", itemRef: "Гарпунный пистолет" } },
        finish(),
      ] },
    ]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const receipts = (await c.row(played.input.operationId)).checkpoint.dmLoop.receipts;
    assert.equal(receipts[0].result.ok, false);
    assert.match(receipts[0].result.reason, /not a consumable/);
    assert.ok(receipts.slice(1, 5).every((r) => r.result.ok), JSON.stringify(receipts.map((r) => r.result)));
    assert.equal(receipts[5].result.ok, false, "a pledged thing cannot be equipped by its owner");
    const turn = await publicTurn(c, played.input.operationId);
    const lines = summaries(turn);
    assert.ok(lines.includes("Снято: Смоляные рукавицы"), JSON.stringify(lines));
    assert.ok(lines.includes("Залог: Гарпунный пистолет → Дуня — шестнадцать монет, если выстрелит"), JSON.stringify(lines));
    assert.ok(lines.includes("Изменено: Рубаха Яна → Рубаха Яна без подола (подол пошёл на шланг)"), JSON.stringify(lines));
    assert.ok(lines.includes("Потерян: Нож — ушёл в ил"), JSON.stringify(lines));
    const snapshot = await c.f.saves(c.cid, "campaign");
    const knife = snapshot.items.find((row) => row.name === "Нож");
    assert.equal(knife.quantity, 0);
    assert.equal(knife.detail.status, "lost");
    assert.equal(knife.detail.note, "ушёл в ил");
    const shirt = snapshot.items.find((row) => row.name === "Рубаха Яна без подола");
    assert.ok(shirt, "the same record, renamed");
    assert.equal(shirt.detail.history.at(-1).event, "modified");
    const pistol = snapshot.items.find((row) => row.name === "Гарпунный пистолет");
    const dunya = snapshot.entities.find((row) => row.name === "Дуня");
    assert.equal(pistol.owner_entity_id, c.hero, "the owner keeps title");
    assert.equal(pistol.detail.status, "pledged");
    assert.equal(pistol.detail.holderId, dunya.id);
    assert.equal(snapshot.storages.find((row) => row.id === pistol.storage_id).entity_id, dunya.id, "the holder has it");
    const gloves = snapshot.items.find((row) => row.name === "Смоляные рукавицы");
    assert.equal(gloves.quantity, 1);
    assert.equal(gloves.equipped_slot, null);
    // Dunya gives the pistol back: a transfer to its owner returns it.
    const back = await c.turn("Дуня возвращает пистолет.", [
      { text: "Дуня протягивает пистолет рукоятью вперёд. ", toolCalls: [
        { name: "item", arguments: { action: "transfer", itemRef: "Гарпунный пистолет", ownerRef: c.hero } },
        finish(),
      ] },
    ]);
    assert.equal(back.result.status, "committed", JSON.stringify(c.errors));
    const after = await c.f.saves(c.cid, "campaign");
    const returned = after.items.find((row) => row.name === "Гарпунный пистолет");
    assert.equal(returned.detail.status, undefined);
    assert.equal(after.storages.find((row) => row.id === returned.storage_id).entity_id, c.hero);
    assert.ok(summaries(await publicTurn(c, back.input.operationId)).includes("Возвращено: Гарпунный пистолет"));
  } finally { await c.f.db.close(); }
});

test("«Твой момент» is accepted only after a successful player-visible roll in a tense scene", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    // No roll at all: refused.
    const quiet = await c.turn("Несу ящик к стойке.", [
      { text: "Ящик стоит на стойке. ", toolCalls: [finish({ playerMoment: true, nextTension: "tense" })] },
    ]);
    assert.equal(quiet.result.status, "committed", JSON.stringify(c.errors));
    let turn = await publicTurn(c, quiet.input.operationId);
    assert.equal(turn.playerMoment, false);
    let receipts = (await c.row(quiet.input.operationId)).checkpoint.dmLoop.receipts;
    assert.match(receipts.at(-1).result.value.playerMomentRefused, /no player-visible roll/);
    assert.ok(!c.live.some((event) => event.type === "moment"));
    // A failed roll: refused.
    const failed = await c.turn("Пробую вскрыть замок.", [
      { text: "Отмычка скрипит.", toolCalls: [{ name: "roll", arguments: { formula: "1d20", reason: "вскрыть замок", actorRef: c.hero, visibility: "player", dc: 12 } }] },
      { text: " Замок не поддаётся.", toolCalls: [finish({ playerMoment: true, nextTension: "calm" })] },
    ], { dice: [1] });
    assert.equal(failed.result.status, "committed", JSON.stringify(c.errors));
    turn = await publicTurn(c, failed.input.operationId);
    assert.equal(turn.playerMoment, false);
    receipts = (await c.row(failed.input.operationId)).checkpoint.dmLoop.receipts;
    assert.match(receipts.at(-1).result.value.playerMomentRefused, /failed/);
    // A success in a calm scene: refused.
    const calm = await c.turn("Чиню компрессор.", [
      { text: "Рэй подтягивает фланец.", toolCalls: [{ name: "roll", arguments: { formula: "1d20", reason: "оживить компрессор", actorRef: c.hero, visibility: "player", dc: 10 } }] },
      { text: " Компрессор чихает и заводится.", toolCalls: [finish({ playerMoment: true, nextTension: "calm" })] },
    ], { dice: [18] });
    turn = await publicTurn(c, calm.input.operationId);
    assert.equal(turn.playerMoment, false);
    // A decisive success in a tense scene: accepted, with the roll's reason for the banner.
    const won = await c.turn("Уворачиваюсь от весла и выталкиваю ящик.", [
      { text: "Весло свистит над шлемом.", toolCalls: [{ name: "roll", arguments: { formula: "1d20", reason: "увернуться от весла", actorRef: c.hero, visibility: "player", dc: 13 } }] },
      { text: " Рэй уходит под удар.", toolCalls: [finish({ playerMoment: true, nextTension: "climax", sceneKinds: ["combat"] })] },
    ], { dice: [20] });
    assert.equal(won.result.status, "committed", JSON.stringify(c.errors));
    turn = await publicTurn(c, won.input.operationId);
    assert.equal(turn.playerMoment, true);
    assert.equal(turn.playerMomentReason, "увернуться от весла");
    assert.ok(c.live.some((event) => event.type === "moment" && event.reason === "увернуться от весла"));
    assert.ok(summaries(turn).some((line) => /^увернуться от весла: 20 — крит$/.test(line) || /увернуться от весла: 20( против 13)? — крит/.test(line)), JSON.stringify(turn.changes));
    assert.ok(!summaries(turn).some((line) => /moment|finish/i.test(line)));
  } finally { await c.f.db.close(); }
});

test("play time counts real minutes per committed turn (1–30)", async () => {
  const c = await loopCampaign();
  try {
    const events = [];
    const played = await c.turn("I wait.", [{ text: "You wait. ", toolCalls: [finish()] }],
      { deps: { afterCommit: async (event) => { events.push(event); } } });
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    assert.equal(events.length, 1);
    assert.ok(events[0].playMinutes >= 1 && events[0].playMinutes <= 30, JSON.stringify(events[0]));
    await c.dossier("play_time", { minutes: events[0].playMinutes });
    assert.ok((await c.dossier("read")).playMinutes >= 1);
  } finally { await c.f.db.close(); }
});

test("«Закончить сессию» ends the session for the digest at once; the digest writes the stinger; «Продолжить» opens the next", async () => {
  const c = await loopCampaign({ language: "ru" });
  try {
    const played = await c.turn("Иду к Марте.", [{ text: "Марта наливает. ", toolCalls: [
      { name: "note_world", arguments: { kind: "fact", key: "plan_customs", operation: "set", value: "Таможенные водолазы найдут вскрытый рундук.", actorRef: "world", dueInMinutes: 300, consequence: "Патруль ищет лодку без сети.", warning: "Фонарь патруля у волнореза." } },
      finish()] }]);
    assert.equal(played.result.status, "committed", JSON.stringify(c.errors));
    const store = (await c.deps(createScriptedDmModel([]))).store;
    const play = await store.readPlay(c.cid);
    const sessionId = (await c.f.one("select current_session_id from public.rpg_public_state where campaign_id=$1", [c.cid])).current_session_id;
    const ended = await c.f.memory(c.cid, "end", { requestId: randomUUID(), campaignId: c.cid, expectedRevision: play.revision, sessionId }, play.timeline);
    assert.ok(ended.currentBoundary, "the memory boundary exists as before");
    const session = await c.f.one("select status,recap,stinger from public.rpg_sessions where id=$1", [sessionId]);
    assert.equal(session.status, "open", "the row closes on «Продолжить» (an unfinished action survives END)");
    assert.equal(ended.currentBoundary.sessionId, sessionId, "the memory boundary marks the session ended");
    assert.equal(session.stinger, "");
    // The digest's answer carries the stinger; rpg_dossier stores it with the recap and the title.
    const source = (await c.f.one("select public.rpg_dossier($1,$2,'source','{}'::jsonb,null) result", [c.owner, c.cid])).result;
    const digest = parseDigest(JSON.stringify({ recap: "Утро прошло у Марты.", title: "Сорок монет", notebook: "Предложить работу.", plans: [],
      playerLikes: null, stinger: "Тем временем у волнореза качается фонарь патруля: лодку без сети заметили." }), source, source.runtime.worldMinutes);
    assert.equal(digest.stinger.startsWith("Тем временем"), true);
    await c.dossier("digest", { sessionId, recap: digest.recap, title: digest.title, notebook: digest.notebook, plans: digest.plans, stinger: digest.stinger }, source.timeline);
    const after = await c.f.one("select title,recap,stinger from public.rpg_sessions where id=$1", [sessionId]);
    assert.equal(after.title, "Сорок монет");
    assert.equal(after.stinger, digest.stinger);
    const snapshot = await c.f.saves(c.cid, "campaign");
    assert.equal(snapshot.sessions.find((row) => row.id === sessionId).stinger, digest.stinger);
    // «Продолжить» still opens the next session.
    const revision = (await c.f.one("select revision from rpg_private.runtime_state where campaign_id=$1", [c.cid])).revision;
    const continued = await c.f.memory(c.cid, "continue", { requestId: randomUUID(), campaignId: c.cid, expectedRevision: revision, boundaryId: ended.currentBoundary.id }, play.timeline);
    assert.equal(continued.currentBoundary?.state ?? "continued", "continued");
    const next = await c.f.one("select current_session_id from public.rpg_public_state where campaign_id=$1", [c.cid]);
    assert.notEqual(next.current_session_id, sessionId);
    assert.equal((await c.f.one("select status from public.rpg_sessions where id=$1", [sessionId])).status, "closed");
  } finally { await c.f.db.close(); }
});
