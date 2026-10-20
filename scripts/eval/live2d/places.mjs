// The probe set: eight synthetic places with the material a scene sheet is written
// from — the records' description, known neighbours, who is present, and one or
// two passages of invented narration (campaign language Russian). Nothing from the
// owner's campaigns; names and people are made up for this probe only.
import { stableGameplayId } from "../../../src/lib/gameplay/dice.ts";

const id = (name) => stableGameplayId("live2d-probe", name);
export const CAMPAIGN_ID = id("campaign");
const place = (key) => ({ id: id(`place-${key}`) });
const person = (key, name, kind = "npc") => ({ id: id(`person-${key}`), name, kind });

export const PLACES = [
  {
    key: "warehouse", name: "Склад Гребня", kind: "warehouse",
    description: "Длинный дощатый склад у причала: ряды бочек и тюков, подъёмный ворот под потолком, конторка приказчика у входа, задняя дверь на пирс.",
    exits: [{ ...place("pier"), name: "Пирс", relation: "neighbour" }],
    present: [person("clerk", "Приказчик Торм")],
    passages: ["Склад Гребня пахнет смолой и мокрой пенькой. Ворот под потолком скрипит на ветру; у конторки приказчик Торм сверяет бирки на тюках, не поднимая головы. Задняя дверь на пирс приоткрыта — оттуда тянет холодом."],
    timeOfDay: "in the evening",
  },
  {
    key: "temple", name: "Храм Тихой Воды", kind: "temple",
    description: "Круглый храм с колодцем посередине зала, алтарь из серого камня под куполом, скамьи для паломников, низкая дверь в крипту за алтарём.",
    exits: [{ ...place("crypt"), name: "Крипта", relation: "child" }],
    present: [person("priestess", "Жрица Ольга")],
    passages: ["В Храме Тихой Воды свет падает сквозь отверстие в куполе прямо на колодец. Жрица Ольга стоит у серого алтаря и молчит. Низкая дверь в крипту за алтарём заперта на засов."],
    timeOfDay: "in the daytime",
  },
  {
    key: "mine-yard", name: "Двор Старой Шахты", kind: "mine yard",
    description: "Двор перед заколоченным входом в штольню: ржавый подъёмник, отвал пустой породы, сторожка с провалившейся крышей, телега без колеса.",
    exits: [{ ...place("adit"), name: "Штольня", relation: "child" }],
    present: [],
    passages: ["Двор Старой Шахты зарос бурьяном. Вход в штольню заколочен крест-накрест, подъёмник над ним проржавел насквозь. У сторожки с провалившейся крышей стоит телега без одного колеса."],
    timeOfDay: "at dusk",
  },
  {
    key: "forest-camp", name: "Лагерь у Чёрного Ручья", kind: "forest camp",
    description: "Стоянка в ельнике у ручья: кострище из камней, навес из еловых лап, привязь для лошадей, тропа вниз к воде.",
    exits: [{ ...place("stream"), name: "Чёрный Ручей", relation: "neighbour" }],
    present: [person("hunter", "Охотник Биргир")],
    passages: ["Лагерь у Чёрного Ручья — кострище из закопчённых камней под навесом из еловых лап. Охотник Биргир подкладывает хворост. Лошади переступают у привязи; тропа уходит вниз, к воде."],
    timeOfDay: "at night",
  },
  {
    key: "tavern", name: "Таверна «Кривой Якорь»", kind: "tavern",
    description: "Низкая таверна с длинной стойкой, очагом у дальней стены, лестницей на второй этаж, дверью во двор за стойкой и бочонками у входа.",
    exits: [{ ...place("yard"), name: "Задний двор", relation: "child" }, { ...place("rooms"), name: "Комнаты наверху", relation: "child" }],
    present: [person("keeper", "Хозяйка Магда"), person("sailor", "Матрос Ульф")],
    passages: ["В «Кривом Якоре» дымно и тепло. Хозяйка Магда протирает длинную стойку; у очага сидит матрос Ульф с пустой кружкой. Лестница наверх скрипит; дверь во двор за стойкой кто-то только что хлопнул."],
    timeOfDay: "in the evening",
  },
  {
    key: "ford", name: "Кривой брод", kind: "ford",
    description: "Мелкий брод через быструю реку: каменистая отмель, вешки из жердей, остатки старого моста на том берегу, придорожный столб с указателем без надписи.",
    exits: [{ ...place("far-bank"), name: "Тот берег", relation: "neighbour" }],
    present: [person("ferryman", "Старик Гром")],
    passages: ["У Кривого брода вода бьёт по камням отмели; вешки из жердей показывают, где мельче. На том берегу торчат чёрные сваи старого моста. Старик Гром сидит у придорожного столба и чинит сеть."],
    timeOfDay: "in the morning",
  },
  {
    key: "market", name: "Рыночная площадь Белого Камня", kind: "market square",
    description: "Площадь с колодцем в центре, рядами прилавков под навесами, лавкой менялы у ратуши, помостом глашатая и аркой на улицу Кузнецов.",
    exits: [{ ...place("smiths"), name: "Улица Кузнецов", relation: "neighbour" }],
    present: [person("changer", "Меняла Ивар")],
    passages: ["Рыночная площадь Белого Камня гудит: прилавки под полосатыми навесами, толпа у колодца, глашатай на помосте. Меняла Ивар сидит в своей лавке у ратуши. Под аркой на улицу Кузнецов звенят молоты."],
    timeOfDay: "in the daytime",
  },
  {
    key: "guard-post", name: "Застава у Южных ворот", kind: "guard post",
    description: "Каменная сторожка при воротах: опущенная решётка, жаровня, стойка с копьями, лестница на стену, окошко для бумаг.",
    exits: [{ ...place("wall"), name: "Стена", relation: "child" }],
    present: [person("sergeant", "Сержант Касса")],
    passages: ["На заставе у Южных ворот решётка опущена. Сержант Касса греет руки над жаровней и кивает на окошко для бумаг. У стены стойка с копьями; лестница ведёт наверх, на стену."],
    timeOfDay: "at dawn",
  },
].map((row) => ({ ...row, ...place(row.key) }));

/** A snapshot-shaped object for poiCandidates / scenePois (the probe has no database). */
export function probeSnapshot() {
  return {
    campaign: { id: CAMPAIGN_ID },
    entities: PLACES.flatMap((row) => row.present.map((p) => ({ id: p.id, campaign_id: CAMPAIGN_ID, kind: p.kind, name: p.name, details: "" }))),
    locations: PLACES.flatMap((row) => [{ id: row.id, campaign_id: CAMPAIGN_ID, name: row.name, description: row.description, status: "visited" },
      ...row.exits.map((exit) => ({ id: exit.id, campaign_id: CAMPAIGN_ID, name: exit.name, description: "", status: "known" }))]),
    scenes: [],
    settings: { values: { language: "ru" } },
  };
}

/** The synthetic region for the region-map probe: the eight places on one painted map. */
export const REGION = {
  name: "Серый тракт",
  description: "Дорога вдоль реки от Белого Камня на юг: заставы, броды, старые шахты в холмах и ельники у Чёрного Ручья.",
  places: [
    ["market", 0.48, 0.22], ["guard-post", 0.52, 0.3], ["warehouse", 0.3, 0.34], ["tavern", 0.38, 0.4],
    ["ford", 0.55, 0.52], ["temple", 0.7, 0.45], ["forest-camp", 0.62, 0.72], ["mine-yard", 0.8, 0.8],
  ],
  route: ["Рыночная площадь Белого Камня", "Застава у Южных ворот", "Таверна «Кривой Якорь»", "Кривой брод"],
};
