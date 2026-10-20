// Fix run: the synthetic long campaign as a library — long-campaign.mjs writes its snapshots, probes.mjs plays
// the probe setups on top of it. Every word is generated from the templates below with a seeded random:
// synthetic, nothing of the owner's.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loopCampaign } from "../../../../tests/dm-loop-fixture.mjs";
import { snapshotSource } from "../../../../src/lib/gameplay/turn-snapshot.ts";
import { ROOT } from "../../real-replay/lib/ledger.mjs";

/** Plays `turns` scripted turns of the Russian harbour campaign. Returns the open campaign `c` (the caller
 * closes `c.f.db`), the snapshot rows (the state before each turn, as the app saves it at a commit),
 * `capture` (one more scripted turn whose snapshot is returned) and `decorate` (adds the synthetic canon
 * and DM guide of session-2 size to a snapshot). For the memory presets (fix run A2/B2): `keepFrom` keeps
 * only the snapshots from that turn on (a 300-turn campaign's every snapshot would be gigabytes), `lean`
 * grows the records slower (an item every fourth turn, a place every ninth) so a long campaign's state stays
 * near session 2's size, `scale` multiplies the narration's paragraphs, and `plant` ({turn, paragraph})
 * puts one paragraph into that turn's narration only (the recall probe's fact). */
export async function buildLongCampaign({ turns = 45, seed = "a", log = console.log, keepFrom = 1, lean = false, scale = 1, plant = null } = {}) {
  const args = { turns, seed };
  /** A small seeded random (mulberry32) so each seed is one stable campaign. */
  function seeded(text) {
    let h = 1779033703;
    for (const ch of text) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h |= 0; h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const rand = seeded(`long-campaign-${args.seed}`);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

  // Every seed renames the cast, so two seeds never share a cached prefix (the before/after measurements).
  const FIRST = ["Ведана", "Ярош", "Мирон", "Злата", "Тихон", "Агния", "Ермолай", "Василиса", "Остап", "Любава", "Прохор", "Ульяна", "Савва", "Дарина", "Кондрат", "Есения",
    "Фрол", "Мелания", "Гордей", "Таисия", "Лукьян", "Пелагея", "Нестор", "Арина"];
  const LAST = ["Сетевяз", "Кривощёк", "Солодов", "Багор", "Тинник", "Ракушкин", "Варгань", "Смоляк", "Пескарь", "Гвоздарь", "Медовар", "Канатов"];
  const ROLES = ["лодочник", "смотритель маяка", "водолаз из гильдии", "старая знахарка", "таможенный писарь", "контрабандист", "кузнец у моста", "хозяйка лавки снастей",
    "сторож складов", "мальчишка-посыльный", "капитан шхуны", "сборщик долгов", "звонарь часовни", "рыбачка с северного ряда", "помощник мастера гильдии"];
  const PLACES = ["Солёный причал", "Канатная улица", "Старая таможня", "маяк на Волнорезе", "Рыбный ряд", "кузня у моста", "часовня Тихой Воды", "склад смолы", "дом гильдии водолазов",
    "отмель у Гнилых свай", "лавка снастей", "трактир «Сухой Якорь»", "лодочный сарай", "волнорез"];
  const THINGS = ["медный ключ", "моток просмолённой верёвки", "шлемовое стекло", "свёрток с накладными", "складной нож", "фонарь с треснувшим стеклом", "кусок цепи с клеймом", "мешочек соли",
    "печать таможни", "записка в воске", "шерстяные рукавицы", "насосный клапан"];
  const shuffled = (list) => list.map((value) => [rand(), value]).sort((a, b) => a[0] - b[0]).map(([, value]) => value);
  const cast = shuffled(FIRST).slice(0, 22).map((first, index) => ({ key: `p${index}`, name: `${first} ${pick(LAST)}`, role: pick(ROLES) }));
  const places = shuffled(PLACES);

  const OPENERS = ["Ветер с моря тянет запах смолы и сырой рыбы", "Над гаванью стоит низкий туман", "Сваи под настилом скрипят на каждом шаге", "Где-то за складами бьёт колокол часовни",
    "Чайки дерутся над пустой бочкой", "Прилив поднимает лодки у причала", "Дождь стучит по жестяным навесам", "Фонари вдоль набережной горят через один"];
  const ACTIONS = ["отряхивает мокрый рукав и смотрит на тебя исподлобья", "перекладывает сеть с одного плеча на другое", "долго молчит, потом кивает на дверь склада",
    "щурится на воду, будто там кто-то есть", "стучит костяшками по бочке, считая что-то про себя", "говорит тише, чем нужно, и оглядывается на улицу",
    "вытирает ладони о штаны и не спешит отвечать", "достаёт из-за пазухи сложенную бумагу и тут же прячет её обратно"];
  const LINES = ["Ночью у отмели снова видели лодку без огней.", "Мастер гильдии велел никого к затонувшей барже не пускать.", "Если таможня спросит, я тебя не видел.",
    "Долг сам себя не заплатит, а работы в гавани мало.", "Цепь с таким клеймом в нашей кузне не ковали.", "Шлем тебе дадут, но насос качать будешь сам.",
    "Сторож со складов пропал третьего дня, жена его ходит по причалам.", "Там внизу не только ящики, там что-то стучит в борт.", "Писарь знает больше, чем пишет в своих книгах.",
    "Капитан шхуны платит серебром и не задаёт вопросов.", "Звонарь видел огни на маяке, когда маяк уже месяц стоит тёмный.", "Знахарка просила принести ей воды с отмели, только в стеклянной банке."];
  const OUTCOMES = ["Разговор обрывается на полуслове: с улицы кто-то зовёт по имени.", "Ты замечаешь на настиле мокрые следы, ведущие к складам.",
    "Вдалеке хлопает дверь таможни, и голоса стихают.", "Прилив подходит к самому краю настила, вода тёмная и тяжёлая.", "Кто-то оставил у бочки обрывок верёвки с узлом, какой вяжут только на шхунах."];

  function paragraph(person, place) {
    const parts = [`${pick(OPENERS)}. ${person.name} ${pick(ACTIONS)}.`];
    parts.push(`— ${pick(LINES)} — говорит ${person.name.split(" ")[0]}. — ${pick(LINES)}`);
    if (rand() < 0.7) parts.push(`У места под названием ${place} ${pick(["пусто", "людно", "тихо", "пахнет гарью", "сохнут сети"])}, и ${pick(OUTCOMES).toLocaleLowerCase()}`);
    return parts.join("\n\n");
  }
  function narration(people, place) {
    return Array.from({ length: Math.round(between(5, 8) * scale) }, () => paragraph(pick(people), place)).join("\n\n");
  }
  const PLAYER = ["Расспрашиваю {name} о том, что видели ночью у отмели.", "Иду к месту «{place}» и осматриваюсь.", "Предлагаю {name} помочь с работой за долю.",
    "Показываю {name} {thing} и спрашиваю, откуда такое.", "Жду у склада до темноты и слежу, кто выходит.", "Спускаюсь под воду у баржи, проверяю трюм.",
    "Торгуюсь с {name} о цене за шлем на день.", "Записываю всё, что узнал, и иду к {name}.", "Нападаю на того, кто прячется за бочками.", "Отдыхаю в трактире, пока не стихнет дождь."];


  const scenario = JSON.parse(await readFile(join(ROOT, "scripts", "eval", "scenarios", "19-polish-ru-replay.json"), "utf8"));
  const c = await loopCampaign({ language: scenario.language, example: scenario.fixture, startMinutes: scenario.startMinutes });
  const rows = [];
  const met = [];
  /** One scripted turn; returns the snapshot payload of the state before it (exactly what the app saves). */
  async function capture(say, rounds, options = {}) {
    let captured = null;
    const played = await c.turn(say, rounds, { ...options, deps: { ...(options.deps ?? {}),
      afterCommit: async ({ input, source }) => { captured = { input, source: snapshotSource(source) }; } } });
    if (played.result.status !== "committed") throw new Error(`«${say}» ${played.result.status}: ${JSON.stringify(c.errors)}`);
    const settings = await c.settings.read();
    return { played, payload: { schemaVersion: 1, input: captured.input, source: captured.source, takenAt: new Date().toISOString(),
      settings: { limits: settings.limits, depth: settings.depth, split: settings.split, dmTurn: settings.dmTurn } } };
  }
  await c.activateStage4Craft();
    for (let turn = 1; turn <= args.turns; turn++) {
      const fresh = turn % 2 === 1 && met.length < cast.length ? cast[met.length] : null;
      if (fresh) met.push(fresh);
      const people = met.length ? met.slice(-4) : [cast[0]];
      const person = fresh ?? pick(people);
      const place = places[Math.floor(turn / 4) % places.length];
      const say = pick(PLAYER).replace("{name}", person.name).replace("{place}", place).replace("{thing}", pick(THINGS));
      const calls = [];
      if (fresh) {
        calls.push({ name: "upsert_character", arguments: { localKey: fresh.key, name: fresh.name, kind: "npc", present: true, important: rand() < 0.6,
          description: `${fresh.role}; ${pick(["седой", "молодой", "широкоплечий", "сутулый", "рыжий", "худой"])}, ${pick(["с обветренным лицом", "в мокром плаще", "с перевязанной рукой", "в кожаном фартуке"])}; ${pick(["держится настороженно", "говорит охотно", "смотрит в сторону", "всё время что-то считает"])}` } });
        calls.push({ name: "note_character", arguments: { actorRef: fresh.key,
          identity: { values: [pick(["честный счёт", "своя лодка", "семья", "гильдейская клятва", "тишина"])], wants: [pick(["вернуть долг", "уехать на юг", "узнать, кто ходит ночью к барже", "чтобы его оставили в покое"])],
            boundaries: [pick(["не врёт про воду", "не берёт чужого", "не ходит на отмель ночью"])], loyalties: [pick(["гильдия", "семья", "капитан шхуны", "никто"])],
            signatures: [pick(["трёт переносицу", "постукивает по бочке", "щурится на воду", "теребит пуговицу"])], observableVoice: pick(["Короткие фразы, на «ты».", "Говорит медленно, с присказками.", "Сбивается, перебивает себя."]) },
          current: { goal: pick(["дожить до весны", "найти пропавшего сторожа", "продать улов", "закрыть долг"]), stress: pick(["settled", "strained", "acute"]) },
          speech: { register: "просторечие порта", sentenceLength: pick(["short", "mixed"]), tics: [{ phrase: pick(["слышь", "вот ведь", "ну"]), frequency: "sometimes" }], neverSays: ["красивых слов"], address: [] } } });
      }
      // Session 2's habit (item 85): a private note per setup and per fight round, never closed.
      calls.push({ name: "note_world", arguments: { kind: "fact", key: `turn_${turn}_${pick(["setup", "round", "clue", "rumour"])}`, operation: "set",
        value: `${person.name}: ${pick(LINES)} ${pick(OUTCOMES)} Проверить у места «${place}».` } });
      // Loot and purchases (session 2 ended with dozens of items on the hero, the companions and the camp).
      for (let n = 0; n < (lean ? (turn % 4 === 0 ? 1 : 0) : between(1, 2)); n++)
        calls.push({ name: "item", arguments: { action: "create", name: `${pick(THINGS)} (${turn}.${n})`, category: pick(["gear", "tool", "misc", "consumable"]), ownerRef: c.hero,
          description: `Найдено у места «${place}». ${pick(OUTCOMES)}`, properties: pick(["вес 1 фунт", "можно продать за 3 монеты", "пахнет смолой", "клеймо гильдии на ручке"]) } });
      if (turn % (lean ? 9 : 3) === 1) calls.push({ name: "upsert_place", arguments: { localKey: `pl${turn}`, name: `${place} (${turn})`, status: pick(["known", "visited"]),
        description: `${pick(OPENERS)}. ${pick(OUTCOMES)} ${pick(LINES)}` } });
      if (turn % (lean ? 14 : 7) === 3) calls.push({ name: "quest", arguments: { action: "create", localKey: `q${turn}`, kind: pick(["thread", "quest", "promise"]), title: `${pick(["Огни", "Цепь", "Сторож", "Баржа", "Писарь"])} у места «${place}»`, description: pick(LINES) } });
      // The people present grow their models every turn (episodes, beliefs), as the DM did in session 2.
      for (const other of people.filter((row) => row !== fresh).slice(0, 2))
        calls.push({ name: "note_character", arguments: { actorRef: other.name, current: { goal: pick(["выяснить, кто платит контрабандистам", "спрятать улов", "найти свидетеля"]), stress: pick(["settled", "strained"]) },
          beliefs: [{ text: `${pick(LINES)} ${pick(OUTCOMES)}`, confidence: pick(["tentative", "supported"]) }],
          episodes: [{ meaning: `${pick(LINES)} Герой был рядом у места «${place}». ${pick(OUTCOMES)}`, cue: pick(["колокол", "туман", "запах смолы"]) }] } });
      calls.push({ name: "advance_time", arguments: { minutes: between(10, 90), reason: "разговор и дорога" } });
      calls.push({ name: "finish_turn", arguments: { sceneKinds: [pick(["conversation", "exploration", "mystery"])], spotlight: [person.name], playerMoment: false, nextTension: pick(["calm", "tense"]) } });
      const text = plant?.turn === turn ? `${plant.paragraph}\n\n${narration(people, place)}` : narration(people, place);
      const { payload } = await capture(say, [{ text, toolCalls: calls }]);
      if (turn >= keepFrom) rows.push({ turnNo: turn, payload });
      if (turn % 10 === 0) log(`turn ${turn}: ${met.length} people met`);
    }

  // A world canon of the size the owner's world text and canon had in session 2 (~30k tokens) and a DM guide (~5k).
  const canonBody = Array.from({ length: 90 }, (_, index) => `## ${pick(PLACES)} — ${index + 1}\n${Array.from({ length: 4 }, () => `${pick(OPENERS)}. ${pick(LINES)} ${pick(OUTCOMES)}`).join(" ")}`).join("\n\n");
  const guideBody = `# Руководство ведущего\n\n${Array.from({ length: 40 }, () => `- ${pick(LINES)} ${pick(OUTCOMES)}`).join("\n")}`;
  const stamp = new Date().toISOString();
  function decorate(payload) {
    const snapshot = payload.source.snapshot;
    const canonId = `00000000-0000-4000-8000-${String(1).padStart(12, "0")}`;
    const guideId = `00000000-0000-4000-8000-${String(2).padStart(12, "0")}`;
    snapshot.documents = [...(snapshot.documents ?? []).filter((doc) => doc.id !== canonId && doc.id !== guideId),
      { id: canonId, campaign_id: snapshot.campaign.id, title: `Канон: Ржавое побережье (${args.seed})`, status: "canon", body: canonBody, current_version_id: canonId, revision: 1, updated_at: stamp },
      { id: guideId, campaign_id: snapshot.campaign.id, title: "Руководство ведущего", status: "reference", body: guideBody, current_version_id: guideId, revision: 1, updated_at: stamp }];
    snapshot.dmGuideDocumentId = guideId;
    return payload;
  }

  for (const row of rows) decorate(row.payload);
  return { c, rows, cast, met, places, pick, between, rand, narration, capture, decorate, LINES, OUTCOMES, THINGS, title: `${scenario.title} — long (${args.seed})` };
}
