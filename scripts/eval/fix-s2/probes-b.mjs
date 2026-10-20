// Fix run after session 2, stage B: the DM-core probe scenes (synthetic, on the long synthetic campaign of
// lib/campaign.mjs), each saved exactly as the app saves a turn's snapshot, with the player's line and its pass rule.
// The replay plays them live (paid, guarded); stage A's fight and long rest (probes.mjs) are played with them.
//   node scripts/eval/fix-s2/probes-b.mjs --out scripts/eval/out/fix-s2-probes-b.json [--seed b] [--turns 45]
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ROOT } from "../real-replay/lib/ledger.mjs";
import { buildLongCampaign } from "./lib/campaign.mjs";
import { createScriptedDmModel } from "../../../src/lib/gameplay/dm-loop/scripted-model.ts";
import { HIDDEN_LAYER_KEY } from "../../../src/lib/gameplay/dm-loop/private-notes.ts";

const args = { out: join(ROOT, "scripts", "eval", "out", "fix-s2-probes-b.json"), turns: 45, seed: "b" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--seed") args.seed = value();
  else throw new Error(`unknown argument ${flag}`);
}

const finish = (kinds = ["conversation"], tension = "calm") => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false, nextTension: tension } });
const time = (minutes, reason = "время идёт") => ({ name: "advance_time", arguments: { minutes, reason } });

export const PROBES_B = [
  { id: "objection", label: "a companion objects to an order", pass: "the companion says his reason aloud and the turn ends on it; the hero's action is not carried out, changed or replaced; no line written for the hero" },
  { id: "letter", label: "companions react to a letter everyone read", pass: "each companion reacts from his own character; nobody restates the letter or the scene; speech ends on the thought (no maxim); no quip on another's word" },
  { id: "conspiracy", label: "«is it a conspiracy?» in an interrogation", pass: "the prisoner says only what he knows; nobody explains the whole picture; the hidden truth is not said; at least one clue points further" },
  { id: "loot", label: "a lair search after a fight", pass: "loot by the 5e treasure guidance for the challenge (coins, gear, possibly a magic thing with a history and an open question); every find recorded (item / money); no residual ledger miss" },
];

const built = await buildLongCampaign({ turns: args.turns, seed: args.seed });
const { c, capture, decorate } = built;
const probes = [];
const take = async (id, line) => {
  const { payload } = await capture("Осматриваюсь.", [{ text: "Тихо. Ветер с моря.", toolCalls: [time(1), finish(["quiet"])] }]);
  payload.input = { ...payload.input, input: line };
  const probe = PROBES_B.find((row) => row.id === id);
  probes.push({ turnNo: probes.length + 1, probe: { id, label: probe.label, pass: probe.pass }, payload: decorate(payload) });
};
try {
  // The party: two companions with 5e stat blocks and characters that object for a reason; the hero with hit points.
  await capture("Нанимаю двух стражников в провожатые.", [{ text: "Двое стражников кивают и берут оружие.", toolCalls: [
    { name: "resource", arguments: { actorRef: c.hero, resource: "hp", set: 18, max: 18, reason: "лист героя" } },
    { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, important: true, hp: 58, maxHp: 58,
      description: "Сержант стражи, ветеран; длинный меч, тяжёлый арбалет, кольчуга.", statblock: "Ветеран (5e): КД 17, хиты 58, мультиатака: два удара длинным мечом +5 (1d8+3) или тяжёлый арбалет +3 (1d10), Атлетика +5, Восприятие +2." } },
    { name: "upsert_character", arguments: { localKey: "toby", name: "Тоби", kind: "companion", party: true, present: true, important: true, hp: 16, maxHp: 16,
      description: "Молодой разведчик стражи; длинный лук, короткий меч, кожаная броня.", statblock: "Разведчик (5e): КД 13, хиты 16, мультиатака: два выстрела из длинного лука +4 (1d8+2), Скрытность +6, Выживание +5, Восприятие +5." } },
    { name: "note_character", arguments: { actorRef: "bram", identity: { values: ["порядок", "свои люди"], wants: ["вернуть пропавших"], boundaries: ["не оставляет раненых на дороге"], loyalties: ["стража"], signatures: ["поправляет ремень"], observableVoice: "Коротко, по делу, на «ты»." } } },
    { name: "note_character", arguments: { actorRef: "toby", identity: { values: ["честность"], wants: ["показать себя"], boundaries: ["не стреляет в спящих"], loyalties: ["Брам"], signatures: ["сглатывает"], observableVoice: "Сбивчиво, на «вы»." } } },
    time(20, "сборы"), finish(["conversation"])] }]);
  // Probe 1 — the objection: a wounded watchman found on the way; the hero orders to leave him.
  await capture("Идём вдоль отмели к барже.", [{ text: "У свай лежит сторож складов, раненый, но живой.", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "watch", name: "Сторож Ефим", kind: "npc", present: true, hp: 2, maxHp: 9, description: "Пропавший сторож складов; рана в боку, бредит." } },
    time(15, "дорога"), finish(["exploration"], "tense")] }]);
  await take("objection", "Бросаем сторожа здесь — он нас только задержит. Брам, Тоби, за мной к барже, живо.");
  // Probe 2 — the letter: a wax-sealed note found on the watchman, read aloud to the party.
  await capture("Обыскиваю сторожа и забираю, что при нём.", [{ text: "За пазухой у сторожа — записка в воске.", toolCalls: [
    { name: "item", arguments: { action: "create", localKey: "letter", name: "Записка в воске", category: "misc", ownerRef: c.hero,
      description: "Сложенный лист, залитый воском. Внутри: «Груз — в третью ночь. Огни на Волнорезе не зажигать до сигнала. Писарь получит своё, как условились. — К.»" } },
    time(5, "обыск"), finish(["exploration"])] }]);
  await take("letter", "Читаю записку вслух. Брам, Тоби — что скажете?");
  // The campaign's hidden layer (as the prep would write it) and a captured smuggler who knows only his part.
  const play = await (await c.deps(createScriptedDmModel([]))).store.readPlay(c.cid);
  await c.dossier("private_notes", { set: [{ kind: "fact", key: HIDDEN_LAYER_KEY, value: [
    "Тайный слой кампании (подготовка ведущего; игрок этого не видит; правда открывается по уликам, никто не объясняет её целиком):",
    "Правда: таможенный писарь продаёт контрабандистам расписание обходов, а огни на тёмном маяке зажигает его брат-звонарь; над ними стоит капитан шхуны «Серая чайка», который возит груз со дна гавани для мастера гильдии водолазов — тот прячет так долги гильдии.",
    "Тайны (не привязаны к месту):\n- писарь и звонарь — братья, хотя носят разные фамилии\n- на барже лежит не товар, а гильдейская казна, утопленная при прошлом мастере\n- пропавший сторож видел, кто открывал склад ночью\n- «К.» в записках — капитан, не контрабандист",
    "Чудо: медная печать с чужим гербом на ящиках баржи. История: печать ордена смотрителей маяков, распущенного сто лет назад. Открытый вопрос: кто носит её теперь?",
    "Улики к правде:\n- почерк записки совпадает с записями в книгах таможни\n- звонарь бьёт в колокол не в свой час в ночи, когда горят огни\n- водолазы гильдии чинят насос, которым никто не пользуется"].join("\n") }], remove: [] }, play.timeline);
  await capture("Подходим к лодке у отмели.", [{ text: "В лодке — связанный контрабандист.", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "smuggler", name: "Тит Багор", kind: "npc", present: true, important: true, description: "Пойманный контрабандист; мокрый, злой, держится нагло." } },
    { name: "note_character", arguments: { actorRef: "smuggler", identity: { values: ["своя шкура"], wants: ["уйти живым"], boundaries: ["не выдаёт своих лодочников"], loyalties: ["деньги"], signatures: ["сплёвывает"], observableVoice: "Грубо, с вызовом, на «ты»." },
      current: { goal: "выторговать свободу", stress: "acute", preoccupation: "знает только, что платит человек из таможни (имени не знает) и что огни на маяке — сигнал к выгрузке" } } },
    time(10, "дорога"), finish(["mystery"], "tense")] }]);
  await take("conspiracy", "Это заговор? Кто за всем этим стоит? Говори, или отдам тебя страже.");
  // Probe 4 — the lair: the smugglers' leader dead after a fight, the lair under the warehouse.
  await capture("Спускаемся в логово под складом.", [{ text: "Бой в логове кончился. Главарь лежит у сундука.", toolCalls: [
    { name: "upsert_place", arguments: { localKey: "lair", name: "Логово под складом смолы", status: "visited", description: "Сырой подвал под складом: сундук, бочки, тайник в стене." } },
    { name: "move_party", arguments: { placeRef: "lair", minutes: 5, reason: "спуск в логово" } },
    { name: "upsert_character", arguments: { localKey: "leader", name: "Главарь контрабандистов", kind: "npc", present: true, hp: 0, maxHp: 65, description: "Капитан бандитов (5e, опасность 2), убит." } },
    finish(["combat"], "calm")] }]);
  await take("loot", "Обыскиваем логово главаря: сундук, тайник в стене, всё, что при нём.");
} finally { await c.f.db.close(); }

await mkdir(dirname(args.out), { recursive: true });
await writeFile(args.out, JSON.stringify({ campaignId: probes[0]?.payload.input.campaignId ?? "synthetic", title: `Fix run B probes (seed ${args.seed})`, snapshots: probes }, null, 0), "utf8");
console.log(`${probes.length} probe(s) written to ${args.out.replace(`${ROOT}/`, "")}: ${probes.map((row) => `${row.turnNo} ${row.probe.id}`).join(", ")}`);
