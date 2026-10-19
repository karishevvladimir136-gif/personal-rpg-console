// Synthetic Stage 5 preview campaign ("Мир Шва", the sample of design/canvas).
// Public DTO shapes only; no request ever reaches a server with these records.
import { DM_LOOP_DEFAULT_LIMITS } from "../../gameplay/dm-loop/limits.ts";
import type {
  Campaign,
  CampaignSnapshot,
  Entity,
  Item,
  Location,
  Quest,
  Scene,
  Session,
  Storage,
} from "../../persistence/contracts.ts";
import type { PlaySnapshot, PublicTurn, VisibleCheck } from "../../gameplay/contracts.ts";
import { createCampaignSettings } from "../../campaign-settings.ts";
import type { PreviewSample } from "./stage5-sample.ts";
import { previewPictureBoard } from "./stage-v-pictures.ts";

export const PREVIEW_CAMPAIGN_ID = "5e5e5e5e-0000-4000-8000-000000000001";
const id = (n: number) => `5e5e5e5e-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (minute: number) => new Date(Date.UTC(2026, 9, 14, 18, minute)).toISOString();
const row = (n: number, minute = 0) => ({ id: id(n), campaign_id: PREVIEW_CAMPAIGN_ID, revision: 1, updated_at: at(minute) });

const slots = [
  { id: "head", label: "Голова", accepts: ["armor", "gear"] },
  { id: "neck", label: "Шея", accepts: ["gear", "misc"] },
  { id: "body", label: "Тело", accepts: ["armor"] },
  { id: "hand", label: "Рука", accepts: ["weapon", "tool"] },
  { id: "offhand", label: "Вторая рука", accepts: ["weapon", "tool", "gear"] },
  { id: "belt", label: "Пояс", accepts: ["gear", "tool"] },
  { id: "legs", label: "Ноги", accepts: ["armor"] },
  { id: "boots", label: "Обувь", accepts: ["armor"] },
];

const entity = (n: number, value: Partial<Entity> & Pick<Entity, "kind" | "name">): Entity => ({
  ...row(n),
  details: "",
  hp: null,
  max_hp: null,
  stats: {},
  resources: {},
  conditions: [],
  equipment_slots: [],
  character_sheet: null,
  ...value,
});

export const PREVIEW_IDS = {
  hero: id(10), meg: id(11), urzul: id(12), wolf: id(13), zarga: id(14), irena: id(15),
  isolde: id(20), tiago: id(21), tinka: id(22), gruk: id(23), rourke: id(24), cornelius: id(25),
  airship: id(30),
  heroStorage: id(40), camp: id(41), hold: id(42), megStorage: id(43),
  lisbon: id(50), cave: id(51), alcantara: id(52), tower: id(53), geneva: id(54), boston: id(55),
  session5: id(60), session6: id(61), session7: id(62),
  revolver: id(70), watch: id(71), core: id(72), crystal: id(73), toolkit: id(74), coat: id(75), boots: id(76), potion: id(77), satchel: id(78), goggles: id(79),
  rations: id(80), rope: id(81), tent: id(82), screw: id(83), water: id(84), aether: id(85), rifle: id(86),
};
const I = PREVIEW_IDS;

const entities: Entity[] = [
  entity(10, {
    kind: "player", name: "Джеймс Хейл", hp: 49, max_hp: 56,
    details: "Внук гудзонской контрабандистки. Чинит довоенные машины руками и магией — сам не до конца понимает, откуда она. Язык подвешен лучше, чем рука на револьвере. Отцовские часы остановились на 3:17.",
    stats: { level: 6, armor_class: 17, attack: 8, spell_dc: 15, speed: 30, proficiency: 3 },
    resources: {
      resource_spell_slots_1: 3, resource_spell_slots_1_max: 4,
      resource_spell_slots_2: 2, resource_spell_slots_2_max: 3,
      resource_spell_slots_3: 3, resource_spell_slots_3_max: 3,
      resource_sorcery_points: 4, resource_sorcery_points_max: 6,
      currency_gold: 185,
    },
    conditions: [],
    equipment_slots: slots,
    character_sheet: {
      schemaVersion: 1, mode: "structured_rpg", role: "Чародей · красная драконья кровь", level: 6, tier: null,
      background: "Народный герой, наладчик довоенных машин.",
      attributes: { strength: 8, dexterity: 14, constitution: 15, intelligence: 12, wisdom: 10, charisma: 18 },
      skills: ["Убеждение +7", "Обман +7", "Запугивание +7", "Анализ (механизмы) +7", "Ловкость рук +5", "Проницательность +3"],
      abilities: ["Метамагия: ускоренное заклинание", "Драконья стойкость", "Чутьё на механизмы"],
      limitations: ["Боится высоты, хотя летает на дирижабле"],
      spells: ["Огненный шар", "Щит", "Огненный снаряд", "Зеркальное отражение", "Починка"],
    },
  }),
  entity(11, { kind: "companion", name: "Мэг Рыжая", hp: 45, max_hp: 45, details: "Пилот «Бабки». Курит сигариллы, держит штурвал и половину долгов экипажа.", stats: { level: 6, armor_class: 15 }, character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Пилот · стрелок", level: 6, tier: null, background: "", attributes: null, skills: [], abilities: [], limitations: [], spells: [] } }),
  entity(12, { kind: "companion", name: "Урзул Железный Бок", hp: 61, max_hp: 68, details: "Орк из Гхара; половина рёбер заменена клёпаным железом. Говорит мало, держит слово.", stats: { level: 6, armor_class: 18 }, character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Воин · страж", level: 6, tier: null, background: "", attributes: null, skills: [], abilities: [], limitations: [], spells: [] } }),
  entity(13, { kind: "companion", name: "Вольф Кесслер", hp: 60, max_hp: 60, details: "Инженер Паровой Лиги, бывший офицер. Монокль, привычка всё записывать.", stats: { level: 6, armor_class: 14 }, character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Инженер · артиллерист", level: 6, tier: null, background: "", attributes: null, skills: [], abilities: [], limitations: [], spells: [] } }),
  entity(14, { kind: "companion", name: "Зарга", hp: 40, max_hp: 40, details: "Шаманка Гхара. Слышит Шов и не любит, когда о нём шутят.", stats: { level: 6, armor_class: 13 }, character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Шаманка · целительница", level: 6, tier: null, background: "", attributes: null, skills: [], abilities: [], limitations: [], spells: [] } }),
  entity(15, { kind: "companion", name: "Ирэна", hp: 29, max_hp: 42, details: "Разведчица. Осталась в Лиссабоне долечивать ногу.", stats: { level: 5, armor_class: 14 }, character_sheet: { schemaVersion: 1, mode: "structured_rpg", role: "Разведчица", level: 5, tier: null, background: "", attributes: null, skills: [], abilities: [], limitations: [], spells: [] } }),
  entity(20, { kind: "npc", name: "Изольда Вэйл", details: "Директриса Фабрики Искр. Под клятвой, но смотрит на сердечник Г-7 слишком внимательно." }),
  entity(21, { kind: "npc", name: "Тиаго Альвареш", details: "Глава дома Альвареш. Дал пещеру под «Бабку» — и записал это в долг." }),
  entity(22, { kind: "npc", name: "Тинка", details: "Механик-гоблинша. Висит вниз головой где угодно, лишь бы рядом был двигатель." }),
  entity(23, { kind: "npc", name: "Грук", details: "Кок экипажа. Сардины, ром и мрачные пророчества." }),
  entity(24, { kind: "npc", name: "Майор Рурк", details: "Ведёт экспедицию к складке под Женевой. Двое его людей не вернулись." }),
  entity(25, { kind: "npc", name: "Корнелиус", details: "Сбежал из-под стражи после пожара в Алкантаре." }),
  entity(30, { kind: "transport", name: "«Железная Бабка»", hp: 120, max_hp: 140, details: "Старый дирижабль: латаная оболочка, деревянная гондола на заклёпках, два латунных винта — правый кашляет.", stats: { speed: 40, crew: 6, cargo: 12 } }),
];

const storages: Storage[] = [
  { ...row(40), name: "Торба Джеймса", kind: "player", entity_id: I.hero },
  { ...row(41), name: "Общий запас", kind: "camp", entity_id: null },
  { ...row(42), name: "Трюм «Бабки»", kind: "transport", entity_id: I.airship },
  { ...row(43), name: "Сумка Мэг", kind: "companion", entity_id: I.meg },
];

const item = (n: number, value: Partial<Item> & Pick<Item, "name" | "category" | "storage_id">): Item => ({
  ...row(n, n), quantity: 1, description: "", mechanics: "", owner_entity_id: null, equipped_entity_id: null, equipped_slot: null, ...value,
});
const items: Item[] = [
  item(70, { name: "Револьвер «Аргумент»", category: "weapon", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "hand", description: "Тяжёлый шестизарядный, гравировка по стволу, рукоять из ореха.", mechanics: "1d10 колющий, дальность 40/120" }),
  item(71, { name: "Отцовские часы", category: "misc", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "neck", description: "Серебряные карманные часы. Стрелки остановились на 3:17. Сюжетная вещь: отец что-то оставил внутри.", mechanics: "" }),
  item(72, { name: "Сердечник Г-7", category: "misc", storage_id: I.heroStorage, owner_entity_id: I.hero, description: "Ключевой предмет задания «Сердца для Узора». Тёплый на ощупь, тихо гудит.", mechanics: "" }),
  item(73, { name: "Кристалл эфирита", category: "consumable", quantity: 2, storage_id: I.heroStorage, owner_entity_id: I.hero, description: "Светится фиолетовым. Подпитывает двигатель или заклинание.", mechanics: "Магический: восстанавливает 1 ячейку заклинаний 1 круга" }),
  item(74, { name: "Набор наладчика", category: "tool", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "offhand", description: "Ключи, щупы, мотки медной проволоки.", mechanics: "Преимущество на починку механизмов" }),
  item(75, { name: "Кожаный плащ наладчика", category: "armor", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "body", description: "Потёртая кожа, десяток карманов.", mechanics: "КД 11 + ЛОВ" }),
  item(76, { name: "Армейские сапоги", category: "armor", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "boots", description: "Довоенные, на вечной подошве.", mechanics: "" }),
  item(77, { name: "Зелье лечения", category: "consumable", quantity: 3, storage_id: I.heroStorage, owner_entity_id: I.hero, description: "Красное, горьковатое.", mechanics: "2d4+2 хитов" }),
  item(78, { name: "Торба контрабандистки", category: "gear", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "belt", description: "Бабушкина. Внутри больше, чем снаружи.", mechanics: "Магическая: вмещает вдвое больше" }),
  item(79, { name: "Латунные очки", category: "gear", storage_id: I.heroStorage, owner_entity_id: I.hero, equipped_entity_id: I.hero, equipped_slot: "head", description: "С тёмными и увеличительными стёклами.", mechanics: "" }),
  item(80, { name: "Сухари", category: "consumable", quantity: 12, storage_id: I.camp, description: "Запас на неделю.", mechanics: "" }),
  item(81, { name: "Верёвка, 15 м", category: "gear", quantity: 2, storage_id: I.camp, description: "", mechanics: "" }),
  item(82, { name: "Палатка на четверых", category: "gear", storage_id: I.camp, description: "", mechanics: "" }),
  item(83, { name: "Запасной винт", category: "tool", storage_id: I.hold, description: "Для правого двигателя — пригодится.", mechanics: "" }),
  item(84, { name: "Бочка воды", category: "consumable", quantity: 6, storage_id: I.hold, description: "", mechanics: "" }),
  item(85, { name: "Ящик эфирита", category: "misc", quantity: 1, storage_id: I.hold, description: "Древний армейский ящик, реликт Старого мира. Внутри восемь кристаллов.", mechanics: "" }),
  item(86, { name: "Длинная винтовка", category: "weapon", storage_id: I.megStorage, owner_entity_id: I.meg, equipped_entity_id: I.meg, equipped_slot: "hand", description: "", mechanics: "1d10" }),
];

const locations: Location[] = [
  { ...row(50), name: "Лиссабон", description: "Город на холмах над Тежу. Дом Альвареш, Белая башня, пепел Алкантары.", status: "visited" },
  { ...row(51), name: "Пещера дома Альвареш", description: "Морская пещера под скалами; здесь «Бабка» стоит на швартовах. Пахнет мокрым камнем, маслом и жареной сардиной.", status: "visited" },
  { ...row(52), name: "Алкантара", description: "Фабрика Искр взлетела на воздух. Квартал оцеплен.", status: "visited" },
  { ...row(53), name: "Белая башня", description: "Ночь у башни закончилась клятвой Директрисы.", status: "visited" },
  { ...row(54), name: "Женева", description: "Город под Швом. Там «Глубина-1» и край складки.", status: "known" },
  { ...row(55), name: "Бостон", description: "Родина бабушки-контрабандистки. Давно не были.", status: "known" },
];

const quests: Quest[] = [
  { ...row(90, 50), title: "Экспедиция Рурка", description: "Майор Рурк ждёт у края складки под Женевой. Двое его людей так и не вышли.", status: "open" },
  { ...row(91, 40), title: "Сердца для Узора", description: "Найти ещё два сердечника и собрать Узор Семи. Один — Г-7 — уже в торбе.", status: "open" },
  { ...row(92, 30), title: "Долг Тиаго", description: "Тиаго дал пещеру и ремонт. Он попросит услугу — и вряд ли простую.", status: "open" },
  { ...row(93, 20), title: "Фабрика Искр", description: "Остановить запуск в Алкантаре. Фабрика уничтожена.", status: "complete" },
  { ...row(94, 10), title: "«Звезда Атлантики»", description: "Корабль догорел в Тежу; экипаж спасён.", status: "complete" },
];

const sessions: Session[] = [
  { ...row(60, 1), title: "Пепел Алкантары", status: "closed", recap: "Фабрика Искр в Алкантаре взлетела на воздух. Корнелиус ушёл через дым." },
  { ...row(61, 2), title: "Ночь у Белой башни", status: "closed", recap: "Фабрика Искр взлетела на воздух, «Звезда Атлантики» догорела в Тежу. Директриса под клятвой, а Корнелиус — на свободе. На рассвете «Бабка» ждёт в пещере Альварешей. Курс — Женева." },
  { ...row(62, 3), title: "Рассвет над Тежу", status: "open", recap: "" },
];

const scene = (n: number, sequence: number, session: string, role: Scene["role"], title: string, body: string): Scene => ({
  ...row(n, sequence), sequence, session_id: session, title, body, role, settings_revision: 1, created_at: at(sequence),
});
const scenes: Scene[] = [
  scene(100, 1, I.session5, "narration", "Пепел", "Алкантара горит."),
  scene(101, 2, I.session6, "narration", "Башня", "Клятва дана."),
  scene(102, 3, I.session7, "narration", "Рассвет над Тежу", "Туман над Тежу ещё не решил, уходить ему или остаться. Под сводами пещеры пахнет мокрым камнем, машинным маслом и жареной сардиной — Грук уже колдует над камбузом, а «Бабка» покачивается на швартовах, будто ей тоже не терпится взлететь."),
  scene(103, 4, I.session7, "player", "Ход Джеймса", "Проверяю, всё ли готово к вылету, и присматриваюсь к Изольде — не задумала ли она чего."),
  scene(104, 5, I.session7, "narration", "У трапа", "Изольда Вэйл стоит у трапа, руки за спиной; перстня-печати на пальце больше нет. Смотрит она не на тебя, а на сердечник Г-7, торчащий из твоей торбы."),
  scene(105, 6, I.session7, "note", "Улика: перстень", "Перстня-печати на Изольде больше нет."),
];

export const previewCampaign: Campaign = { ...row(1), id: PREVIEW_CAMPAIGN_ID, title: "Мир Шва", subtitle: "Кампания 2 · «Железная Бабка»", language: "ru" };

export function previewSnapshot(): CampaignSnapshot {
  const settings = createCampaignSettings(PREVIEW_CAMPAIGN_ID);
  settings.language = "ru";
  settings.visualStyle = "Стимпанк поверх руин Старого мира, масляная живопись, тёплый латунный свет, дым и эфиритовое сияние; без текста на картинке.";
  settings.dicePresentation = "all-player-rolls";
  settings.showDc = true;
  return structuredClone({
    timeline: { timelineId: id(900), epoch: 1 },
    campaign: previewCampaign,
    settings: { campaign_id: PREVIEW_CAMPAIGN_ID, revision: 1, updated_at: at(0), values: settings },
    settingsHistory: [],
    documents: [{ ...row(110), title: "Путеводитель ведущего", status: "canon", current_version_id: id(111), body: "Мир Шва: стимпанк поверх руин Старого мира." }],
    entities,
    storages,
    items,
    sessions,
    scenes,
    publicState: { campaign_id: PREVIEW_CAMPAIGN_ID, revision: 7, updated_at: at(9), summary: "Рассвет в пещере Альварешей. «Бабка» готовится к вылету в Женеву.", current_session_id: I.session7, current_scene_id: id(104), current_location_id: I.cave },
    quests,
    locations,
    assets: [],
    feedback: [],
    dmGuideDocumentId: id(110),
  } satisfies CampaignSnapshot);
}

const check: VisibleCheck = {
  id: id(300), kind: "skill", actorId: I.hero, actorName: "Джеймс · Проницательность", dice: [17], kept: 17, modifier: 3, total: 20,
  success: true, dc: 15, advantage: "normal", interactive: false, canReroll: false, rollNumber: 1,
};
const turn = (n: number, input: string, narration: string, checks: VisibleCheck[], minute: number, sceneId: string): PublicTurn => ({
  narrationSceneId: sceneId, id: id(n), campaign_id: PREVIEW_CAMPAIGN_ID, session_id: I.session7, mode: "game", input, companionId: null, listenerIds: [],
  status: "committed", expectedRevision: 6, committedRevision: 7, settingsRevision: 1, created_at: at(minute), updated_at: at(minute), narration,
  visualDescription: null, checks, proposal: null, failure: null, canRetry: false, canCancel: false, timeline: { timelineId: id(900), epoch: 1 },
});

export function previewPlay(options: { combat?: boolean } = {}): PlaySnapshot {
  return structuredClone({
    rulesetId: "world-logic-v1",
    startupPending: false,
    timeline: { timelineId: id(900), epoch: 1 },
    campaignId: PREVIEW_CAMPAIGN_ID,
    revision: 7,
    configured: true,
    model: "claude-opus-5-5",
    configuration: {
      profile: "console-basic-v1",
      controlledEntityIds: [I.hero],
      presentEntityIds: [I.hero, I.meg, I.urzul, I.wolf, I.zarga, I.isolde, I.tinka, I.gruk],
      nearbyStorageIds: [I.camp, I.hold],
      safeLocationIds: [I.cave],
      itemRules: [],
    },
    worldMinutes: 4 * 1440 + 400,
    turns: [
      { ...turn(201, "Как думаешь, Изольде можно верить?", "Мэг щёлкает затвором, не глядя на тебя. «Клятве — да. Ей — нет. Клятва держит руки, а не язык. Следи, с кем она заговорит в Женеве».", [], 6, id(104)), mode: "companion", companionId: I.meg, listenerIds: [] },
      turn(200, "Проверяю, всё ли готово к вылету, и присматриваюсь к Изольде — не задумала ли она чего.",
        "Тинка висит вниз головой на кормовой балке, гаечный ключ в зубах. Она выплёвывает его в ладонь: «Левый двигатель дышит, правый кашляет. До Женевы дотянем, если по дороге в нас никто не будет стрелять».\n\n«Кто-нибудь обязательно будет, — Мэг гасит сигариллу о борт. — Мы же туда летим».\n\nИзольда Вэйл стоит у трапа, руки за спиной; перстня-печати на пальце больше нет. Смотрит она не на тебя, а на сердечник Г-7, торчащий из твоей торбы. Дважды за минуту она оборачивается к выходу, туда, где за скалой гудит кабель Дома голосов.",
        [check], 8, id(104)),
    ],
    restRecords: [],
    recipes: [],
    effects: [],
    encounters: options.combat ? [{ id: id(400), campaign_id: PREVIEW_CAMPAIGN_ID, status: "active", round: 2, outcome: null, settings_revision: 1, public_summary: "Засада у трапа" }] : [],
    participants: [],
    pendingActions: [],
    conversations: [],
    sessionGuidance: [],
    provenance: [],
  } satisfies PlaySnapshot);
}

/** Sample art made with fal for these previews (scripts/fal-image-smoke.mjs). */
export const previewImages: Record<string, string> = {
  [I.hero]: "/preview/stage-5/hero-portrait.jpg",
  [I.meg]: "/preview/stage-5/meg.jpg",
  [I.urzul]: "/preview/stage-5/urzul.jpg",
  [I.wolf]: "/preview/stage-5/wolf.jpg",
  [I.zarga]: "/preview/stage-5/zarga.jpg",
  [I.airship]: "/preview/stage-5/airship.jpg",
  [I.cave]: "/preview/stage-5/cave.jpg",
  [I.geneva]: "/preview/stage-5/geneva.jpg",
  [I.crystal]: "/preview/stage-5/crystal.jpg",
  [I.revolver]: "/preview/stage-5/revolver.jpg",
  [I.watch]: "/preview/stage-5/watch.jpg",
};
export const previewFigure = "/preview/stage-5/hero-figure.jpg";
export const previewAtlas = "/preview/stage-5/atlas.jpg";
/** Subjects shown in the "drawing" state, to preview the shimmer. */
export const previewDrawing = new Set([I.irena, I.potion, I.lisbon]);

/** Other campaigns of the library preview. */
export const previewLibrary: Campaign[] = [
  previewCampaign,
  { ...row(2), id: id(2), title: "Ирис", subtitle: "Свой мир · 23 сессии", language: "ru" },
  { ...row(3), id: id(3), title: "Мир Шва · Кампания 1", subtitle: "Пешком по Подземке", language: "ru" },
];

/** Stage V sample board: anchors on the sample art, one live frame per game turn, the world's style. */
export const previewPictures = previewPictureBoard({
  campaignId: PREVIEW_CAMPAIGN_ID, worldId: id(600), timeline: { timelineId: id(900), epoch: 1 }, at,
  style: { id: id(700), scope: "world", preset: "oil", label: "Масляная живопись", hasReference: false },
  anchors: [
    { id: id(710), subjectKind: "entity", subjectId: I.hero, composition: "portrait", image: "/preview/stage-v/shov-oil-klein9b-%D0%B4%D0%B6%D0%B5%D0%B9%D0%BC%D1%81-%D1%85%D0%B5%D0%B9%D0%BB-portrait.jpg" },
    { id: id(711), subjectKind: "entity", subjectId: I.hero, composition: "figure", image: "/preview/stage-v/shov-oil-klein9b-%D0%B4%D0%B6%D0%B5%D0%B9%D0%BC%D1%81-%D1%85%D0%B5%D0%B9%D0%BB-figure.jpg" },
    { id: id(712), subjectKind: "entity", subjectId: I.meg, composition: "portrait", image: "/preview/stage-v/shov-oil-klein9b-%D0%BC%D1%8D%D0%B3-%D1%80%D1%8B%D0%B6%D0%B0%D1%8F-portrait.jpg" },
    { id: id(713), subjectKind: "entity", subjectId: I.urzul, composition: "portrait", image: "/preview/stage-v/shov-oil-klein9b-%D1%83%D1%80%D0%B7%D1%83%D0%BB-%D0%B6%D0%B5%D0%BB%D0%B5%D0%B7%D0%BD%D1%8B%D0%B9-%D0%B1%D0%BE%D0%BA-portrait.jpg" },
    { id: id(714), subjectKind: "entity", subjectId: I.wolf, composition: "portrait", image: "/preview/stage-v/shov-oil-klein9b-%D0%B2%D0%BE%D0%BB%D1%8C%D1%84-%D0%BA%D0%B5%D1%81%D1%81%D0%BB%D0%B5%D1%80-portrait.jpg" },
    { id: id(715), subjectKind: "entity", subjectId: I.zarga, composition: "portrait", image: "/preview/stage-v/shov-oil-klein9b-%D0%B7%D0%B0%D1%80%D0%B3%D0%B0-portrait.jpg" },
    { id: id(716), subjectKind: "entity", subjectId: I.airship, composition: "holding", image: "/preview/stage-v/shov-oil-klein9b-%D0%B6%D0%B5%D0%BB%D0%B5%D0%B7%D0%BD%D0%B0%D1%8F-%D0%B1%D0%B0%D0%B1%D0%BA%D0%B0-holding.jpg" },
    { id: id(717), subjectKind: "location", subjectId: I.cave, composition: "location", image: "/preview/stage-v/shov-oil-klein9b-%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B0-%D0%B4%D0%BE%D0%BC%D0%B0-%D0%B0%D0%BB%D1%8C%D0%B2%D0%B0%D1%80%D0%B5%D1%88-location.jpg" },
    { id: id(718), subjectKind: "location", subjectId: I.geneva, composition: "location", image: "/preview/stage-5/geneva.jpg" },
    { id: id(719), subjectKind: "item", subjectId: I.crystal, composition: "item", image: "/preview/stage-v/shov-oil-klein9b-%D0%BA%D1%80%D0%B8%D1%81%D1%82%D0%B0%D0%BB%D0%BB-%D1%8D%D1%84%D0%B8%D1%80%D0%B8%D1%82%D0%B0-item.jpg" },
    { id: id(720), subjectKind: "item", subjectId: I.revolver, composition: "item", image: "/preview/stage-v/shov-oil-klein9b-%D1%80%D0%B5%D0%B2%D0%BE%D0%BB%D1%8C%D0%B2%D0%B5%D1%80-%D0%B0%D1%80%D0%B3%D1%83%D0%BC%D0%B5%D0%BD%D1%82-item.jpg" },
    { id: id(721), subjectKind: "item", subjectId: I.watch, composition: "item", image: "/preview/stage-v/shov-oil-klein9b-%D0%BE%D1%82%D1%86%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B5-%D1%87%D0%B0%D1%81%D1%8B-item.jpg" },
  ],
  frames: [
    { id: id(730), turnId: id(200), image: "/preview/stage-v/shov-oil-klein9b-refs-t01.jpg", trigger: "live" },
    // The streaming turn of the game preview: its frame is being drawn.
    { id: id(731), turnId: id(202), image: "", trigger: "live", status: "generating" },
  ],
});

export const shovSample: PreviewSample = {
  key: "shov",
  language: "ru",
  snapshot: previewSnapshot,
  play: previewPlay,
  live: (language) => ({
    operationId: id(202),
    status: "generating",
    text: "Изольда замечает твой взгляд и улыбается краем рта. «Ты слишком долго смотришь на мою руку, наладчик. Перстень я оставила в Белой башне — вместе с клятвой»",
    changes: [
      { name: "advance_time", ok: true, summary: language === "ru" ? "Время +40 мин" : "Time +40 min" },
      { name: "money", ok: true, summary: language === "ru" ? "−12 зм · Тиаго, за ремонт" : "−12 gold · Tiago, for repairs" },
      { name: "item", ok: true, summary: language === "ru" ? "+ запасной кристалл эфирита" : "+ spare aetherite crystal" },
      { name: "quest", ok: true, summary: language === "ru" ? "Задание «Экспедиция Рурка» обновлено" : "Quest “Rourke's expedition” updated" },
    ],
  }),
  adventure: () => ({
    id: id(500), versionId: id(501), previousVersionId: null, version: 1, campaignId: PREVIEW_CAMPAIGN_ID, timelineId: id(900),
    worldId: id(600), worldVersion: 2, title: "Курс на Женеву", premise: "Довести «Бабку» до края складки и найти людей Рурка.",
    pacing: { kind: "evening", custom: null }, mode: "canon", status: "active",
    start: { worldMinutes: 4 * 1440 + 300, sceneId: null }, completion: null, summary: null, review: null, createdAt: at(0),
  }),
  dmSettings: { campaignId: PREVIEW_CAMPAIGN_ID, runtime: "dm-loop-v1", dmTurn: { providerId: "anthropic", modelId: "claude-opus-5-5", reasoning: "medium" }, limits: { ...DM_LOOP_DEFAULT_LIMITS }, customLimits: false, depth: { min: "medium", max: "xhigh" }, notebookVisible: false, boostNext: false, voiceExamples: false, voiceMode: "off", voiceTokenCap: 30_000, split: null, snapshotsKeep: null, revision: 3 },
  library: previewLibrary,
  images: previewImages,
  drawing: previewDrawing,
  figure: previewFigure,
  atlas: previewAtlas,
  talkTo: I.meg,
  pictures: previewPictures,
  course: I.geneva,
  placements: [
    [I.lisbon, 0.3, 0.64], [I.cave, 0.27, 0.7], [I.alcantara, 0.34, 0.6], [I.tower, 0.29, 0.58], [I.geneva, 0.66, 0.36], [I.boston, 0.07, 0.3],
  ].map(([location, x, y]) => ({ campaign_id: PREVIEW_CAMPAIGN_ID, location_id: location as string, level: "world" as const, parent_location_id: null, x: x as number, y: y as number, revision: 1, updated_at: at(0) })),
  worlds: { worlds: [{ id: id(600), versionId: id(601), version: 2, title: "Мир Шва", premise: "Стимпанк поверх руин Старого мира: Шов, эфирит, Паровая Лига и орочий Гхар.", packVersionIds: [] }], packs: [] },
};
