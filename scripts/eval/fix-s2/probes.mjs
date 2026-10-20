// Fix run after session 2: the probe scenes (synthetic, in the repo) — states built on the long synthetic
// campaign (lib/campaign.mjs) by scripted setup turns, each saved exactly as the app saves a turn's snapshot,
// with the player's line of the probe and its pass rule. The replay tool plays them live (paid, guarded):
//   node scripts/eval/fix-s2/probes.mjs --out scripts/eval/out/fix-s2-probes-a.json [--seed a] [--turns 45]
//   node scripts/eval/real-replay/replay.mjs --snapshots scripts/eval/out/fix-s2-probes-a.json --turns 1,2 --variants A --budget-usd 3
// The probes of stage A: a mine-style fight with several rolls in one round (requests per turn, bundled
// rolls), a long rest after a heavy night (bookkeeping, one `rest`), an ordinary talk, a council line.
// Stage B adds its own (an objection to an order, a letter everyone read, «is it a conspiracy?», a lair
// search, a fresh campaign's prep). Nothing paid here; nothing of the owner's.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ROOT } from "../real-replay/lib/ledger.mjs";
import { buildLongCampaign } from "./lib/campaign.mjs";

const args = { out: join(ROOT, "scripts", "eval", "out", "fix-s2-probes-a.json"), turns: 45, seed: "a" };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i], value = () => process.argv[++i];
  if (flag === "--out") args.out = join(ROOT, value());
  else if (flag === "--turns") args.turns = Number(value());
  else if (flag === "--seed") args.seed = value();
  else throw new Error(`unknown argument ${flag}`);
}

const finish = (kinds = ["conversation"], tension = "calm") => ({ name: "finish_turn", arguments: { sceneKinds: kinds, spotlight: [], playerMoment: false, nextTension: tension } });
const time = (minutes, reason = "время идёт") => ({ name: "advance_time", arguments: { minutes, reason } });

/** The probes: id, what it measures, the pass rule (checked by probe-metrics.mjs), the player's line. */
export const PROBES = [
  { id: "talk", label: "an ordinary talk", pass: "committed; one or two requests; no rejected record" },
  { id: "council", label: "a council line to a companion", pass: "committed; the light call (two system blocks); medium depth; under 20 s" },
  { id: "fight", label: "a mine-style fight round with several rolls", pass: "committed; at most 3 requests and $0.60; every attack rolled with its damage in the same call; every roll told" },
  { id: "rest", label: "a long rest after a heavy night", pass: "committed; one rest call (no per-counter resource calls); no cut by the cap" },
];

const built = await buildLongCampaign({ turns: args.turns, seed: args.seed });
const { c, capture, decorate, met } = built;
const probes = [];
const take = async (id, line, options = {}) => {
  // A quiet scripted beat whose snapshot is the probe's state; the probe's own line replaces the beat's.
  const { payload } = await capture(options.beat ?? "Осматриваюсь.", [{ text: "Тихо. Ветер с моря.", toolCalls: [time(1), finish(["quiet"])] }]);
  payload.input = { ...payload.input, input: line, ...(options.mode ? { mode: options.mode } : {}), ...(options.companionId ? { companionId: options.companionId } : {}),
    ...(options.listenerIds ? { listenerIds: options.listenerIds } : {}) };
  const probe = PROBES.find((row) => row.id === id);
  probes.push({ turnNo: probes.length + 1, probe: { id, label: probe.label, pass: probe.pass }, payload: decorate(payload) });
};
try {
  // Setup 1: two companions join with their 5e stat blocks (a veteran, a scout) — the session 2 party's shape.
  await capture("Нанимаю двух стражников в провожатые.", [{ text: "Двое стражников кивают и берут оружие.", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "bram", name: "Брам", kind: "companion", party: true, present: true, important: true, hp: 58, maxHp: 58,
      description: "Сержант стражи, ветеран; длинный меч, тяжёлый арбалет, кольчуга.", statblock: "Ветеран (5e): КД 17, хиты 58, мультиатака: два удара длинным мечом +5 (1d8+3) или тяжёлый арбалет +3 (1d10), Атлетика +5, Восприятие +2." } },
    { name: "upsert_character", arguments: { localKey: "toby", name: "Тоби", kind: "companion", party: true, present: true, important: true, hp: 16, maxHp: 16,
      description: "Молодой разведчик стражи; длинный лук, короткий меч, кожаная броня.", statblock: "Разведчик (5e): КД 13, хиты 16, мультиатака: два выстрела из длинного лука +4 (1d8+2), Скрытность +6, Выживание +5, Восприятие +5." } },
    { name: "note_character", arguments: { actorRef: "bram", identity: { values: ["порядок", "свои люди"], wants: ["вернуть пропавших"], boundaries: ["не бросает своих"], loyalties: ["стража"], signatures: ["поправляет ремень"], observableVoice: "Коротко, по делу, на «ты»." } } },
    { name: "note_character", arguments: { actorRef: "toby", identity: { values: ["честность"], wants: ["показать себя"], boundaries: ["не стреляет в спящих"], loyalties: ["Брам"], signatures: ["сглатывает"], observableVoice: "Сбивчиво, на «вы»." } } },
    time(20, "сборы"), finish(["conversation"])] }]);
  const state = await c.state();
  const bram = state.entities.find((row) => row.name === "Брам");
  const npc = met.at(-1)?.name ?? "смотритель";
  await take("talk", `Расспрашиваю ${npc} о лодке без огней: кто на ней ходит и когда.`);
  await take("council", "Брам, ты бы полез к барже ночью? Только честно.", { mode: "companion", companionId: bram.id, listenerIds: [] });
  // Setup 2: the raid — three enemies with stat-block hit points, the fight started.
  await capture("Подкрадываемся к складу у отмели.", [{ text: "У склада трое: громила у двери, часовой на крыше, главарь у костра.", toolCalls: [
    { name: "upsert_character", arguments: { localKey: "brute", name: "Громила", kind: "npc", present: true, hp: 32, maxHp: 32, description: "Громила с моргенштерном, в кожаной куртке.", statblock: "Громила (5e thug): КД 11, хиты 32, мультиатака: два удара моргенштерном +4 (1d8+2)." } },
    { name: "upsert_character", arguments: { localKey: "sentry", name: "Часовой", kind: "npc", present: true, hp: 11, maxHp: 11, description: "Часовой с лёгким арбалетом на крыше склада.", statblock: "Бандит (5e): КД 12, хиты 11, лёгкий арбалет +3 (1d8+1)." } },
    { name: "upsert_character", arguments: { localKey: "boss", name: "Главарь", kind: "npc", present: true, hp: 65, maxHp: 65, description: "Главарь с саблей и кинжалом, в бригантине.", statblock: "Капитан бандитов (5e): КД 15, хиты 65, мультиатака: две атаки саблей +5 (1d6+3) и кинжал +5 (1d4+3)." } },
    { name: "combat", arguments: { action: "start", participantRefs: ["brute", "sentry", "boss", "Брам", "Тоби"], summary: "Налёт на склад у отмели" } },
    // An ordinary round (tense), not the fight's climax: the common shape, at the range's base depth.
    time(5, "подход"), finish(["combat"], "tense")] }]);
  await take("fight", "Стреляю из гарпунного пистолета в главаря. Брам — тяжёлый арбалет по громиле, Тоби — два выстрела по часовому на крыше.", { beat: "Жду сигнала." });
  // Setup 3: the fight is over; the hero is hurt; a heavy night behind.
  await capture("Добиваем последних и обыскиваем склад.", [{ text: "Бой окончен. Ты весь в синяках, в ухе звенит.", toolCalls: [
    { name: "combat", arguments: { action: "end", outcome: "victory", summary: "Склад взят" } },
    { name: "resource", arguments: { actorRef: c.hero, resource: "hp", set: 3, reason: "раны после боя" } },
    time(240, "бой, обыск и ночь"), finish(["combat"], "calm")] }]);
  await take("rest", "Встаём лагерем у склада: долгий отдых до утра. Утром идём к капитану стражи на совет.");
} finally { await c.f.db.close(); }

await mkdir(dirname(args.out), { recursive: true });
await writeFile(args.out, JSON.stringify({ campaignId: probes[0]?.payload.input.campaignId ?? "synthetic", title: `Fix run probes (seed ${args.seed})`, snapshots: probes }, null, 0), "utf8");
console.log(`${probes.length} probe(s) written to ${args.out.replace(`${ROOT}/`, "")}: ${probes.map((row) => `${row.turnNo} ${row.probe.id}`).join(", ")}`);
