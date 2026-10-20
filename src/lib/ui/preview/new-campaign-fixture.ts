// Fix run after session 2, stage F: the new-campaign wizard's synthetic preview — a hero the DM «built» (read through
// the same tolerant reader as a real answer), a prepared first adventure and an opening with its people. Synthetic
// texts only; nothing here is sent anywhere.
import type { AdventureCatalog, WorldCatalog } from "../../adventures/contracts.ts";
import type { CreationDraft, OpeningDraft } from "../../adventures/bootstrap-contracts.ts";
import { normalizeHeroDraft } from "../../adventures/hero-draft.ts";
import { versionAdventureAttempt } from "../../adventures/client.ts";

const id = (n: number) => `5e5e5e5e-0000-4000-8f00-${String(n).padStart(12, "0")}`;
const description = [
  "Тессен Вран — волшебник 9 уровня, школа воплощения, бывший писарь гильдии картографов.",
  "Интеллект 20, Ловкость 14, Телосложение 14, Мудрость 12, Харизма 10, Сила 8. Хиты 52, КД 15 с доспехами мага.",
  "Ношу шляпу с широкими полями, дорожную мантию, сапоги, кольцо защиты на правой руке; в руке боевой посох.",
  "В сумке книга заклинаний, два зелья лечения, футляр с картами, 60 зм и 12 см.",
].join("\n");

const dmAnswer = {
  mode: "structured_rpg", role: "Волшебник 9-го уровня, школа воплощения", level: 9,
  background: "Бывший писарь гильдии картографов, ушёл в дорогу за картой, которой нет ни в одном архиве.",
  abilities: { strength: 8, dexterity: 14, constitution: 14, intelligence: 20, wisdom: 12, charisma: 10 },
  proficiencyBonus: 4, hp: 52, armorClass: 15, speed: "30 футов",
  saves: ["Спасбросок Интеллекта +9", "Спасбросок Мудрости +5"],
  skills: ["Магия +9", "История +9", "Анализ +9", "Проницательность +5"],
  attacks: ["Боевой посох: +3 к попаданию, 1d6−1 дробящий", "Огненный снаряд: +9 к попаданию, 2d10 огнём"],
  features: ["Магическое восстановление: раз в день после короткого отдыха", "Лепка заклинаний: союзники не страдают от моих взрывов", "Сильные заговоры"],
  limitations: ["Близорук без очков"],
  spells: [
    { name: "Огненный снаряд", level: 0, castingTime: "1 действие", range: "120 футов", damage: "2d10 огнём", text: "Пламенная искра в цель." },
    { name: "Волшебная рука", level: 0 }, { name: "Щит", level: 1, prepared: true, castingTime: "1 реакция", text: "+5 к КД до начала следующего хода." },
    { name: "Волшебная стрела", level: 1, prepared: true, damage: "3 × 1d4+1 силовым" }, { name: "Туманный шаг", level: 2, prepared: true },
    { name: "Огненный шар", level: 3, prepared: true, castingTime: "1 действие", range: "150 футов", saveOrAttack: "Ловкость, сл 17", damage: "8d6 огнём", text: "Взрыв пламени радиусом 20 футов." },
    { name: "Контрзаклинание", level: 3, prepared: true }, { name: "Стена огня", level: 4, prepared: true, concentration: true }, { name: "Конус холода", level: 5, prepared: true },
  ],
  preparedMax: 14,
  items: [
    { name: "Боевой посох", description: "Дубовый посох с медной оковкой.\nНа набалдашнике выжжена роза ветров.", kind: "weapon", slot: "hand", damage: "1d6 дробящий", properties: "универсальное (1d8)" },
    { name: "Шляпа с широкими полями", description: "Пыльная дорожная шляпа.", kind: "clothing", slot: "head" },
    { name: "Дорожная мантия", description: "Серая мантия с карманами для мелков.", kind: "clothing", slot: "body" },
    { name: "Сапоги", kind: "clothing", slot: "boots" },
    { name: "Кольцо защиты", description: "Серебряное кольцо с щитом на печатке.", kind: "jewelry", slot: "ring_right", bonuses: [{ to: "КД", value: 1 }, { to: "спасброски", value: 1 }], attunement: true },
    { name: "Книга заклинаний", description: "Кожаный переплёт, сорок исписанных листов.", kind: "gear" },
    { name: "Зелье лечения", quantity: 2, kind: "consumable", damage: "2d4+2 хита" },
    { name: "Футляр с картами", description: "Карты тракта от Врат Балдура до Нашкеля.", kind: "gear" },
    { name: "Мешочек с компонентами", kind: "gear" }, { name: "Очки в роговой оправе", kind: "accessory" },
  ],
  counters: [
    { key: "spell_slots_1", label: "Ячейки 1 круга", value: 4, max: 4 }, { key: "spell_slots_2", label: "Ячейки 2 круга", value: 3, max: 3 },
    { key: "spell_slots_3", label: "Ячейки 3 круга", value: 3, max: 3 }, { key: "spell_slots_4", label: "Ячейки 4 круга", value: 3, max: 3 },
    { key: "spell_slots_5", label: "Ячейки 5 круга", value: 1, max: 1 }, { key: "hit_dice", label: "Кости хитов", value: 9, max: 9 },
    { key: "arcane_recovery", label: "Магическое восстановление", value: 1, max: 1 },
  ],
  money: [{ coin: "зм", amount: 60 }, { coin: "см", amount: 12 }],
  questions: ["Кто учил Тессена магии? (по желанию)"],
};

export function previewNewCampaign(worlds: WorldCatalog) {
  const world = worlds.worlds[0];
  const input = { requestId: id(1), worldId: world.id, worldVersion: world.version, title: "Тессен · " + world.title, language: "ru" as const, name: "Тессен Вран", description };
  const proposal = normalizeHeroDraft(dmAnswer, input);
  // One plain-words note, as a real answer that needed a repair would carry.
  proposal.notes = ["Сила 8 — как в твоём тексте (у ведущего было 10)."];
  const heroDraft: CreationDraft = { kind: "creation", draftId: input.requestId, input, proposal, usage: { model: "claude-opus-5-5", inputTokens: 0, outputTokens: 0, latencyMs: 0 } };
  const campaignId = id(10);
  const catalog: AdventureCatalog = {
    campaignId, timeline: { timelineId: id(11), epoch: 1 }, revision: 4, runtimeRevision: 6, expectedHeadId: null,
    worldBinding: { worldId: world.id, worldVersion: world.version, title: world.title }, activeAdventureId: null,
    adventures: [{ id: id(20), versionId: id(21), previousVersionId: null, version: 1, campaignId, timelineId: id(11), worldId: world.id, worldVersion: world.version,
      title: "Дорога на Нашкель", premise: "Караван гильдии идёт на юг; Тессену платят за карту бродов.", pacing: { kind: "evening", custom: null }, mode: "canon",
      status: "prepared", start: null, completion: null, summary: null, review: null, createdAt: "2026-10-20T10:00:00.000Z" }],
    history: [], canChange: true, detachedPlayable: false, requiresOpening: true,
  };
  const start = versionAdventureAttempt(catalog, id(20), "start", undefined, () => id(30));
  const openingDraft: OpeningDraft | null = start.action === "start" ? {
    kind: "opening", draftId: id(30), command: start, usage: { model: "claude-opus-5-5", inputTokens: 0, outputTokens: 0, latencyMs: 0 },
    proposal: {
      schemaVersion: 1,
      location: { name: "Застава у Северных ворот", description: "Каменная застава стражи тракта; у ворот ждут три фургона гильдии." },
      situation: "Рассвет. Караван готов, но старший возчик спорит с капитаном стражи о пошлине.",
      narration: "Рассвет над трактом серый и сырой. У Северных ворот стоят три фургона, лошади фыркают в холодном воздухе. Капитан заставы, Ульрик Брам, держит в руке подорожную каравана и не спешит её возвращать. Старший возчик оборачивается к тебе: «Маг, скажи ему — карта у тебя, ты нас ведёшь». Что ты делаешь?",
      actors: [
        { name: "Ульрик Брам", description: "Капитан заставы, седой ветеран тракта; по правилам 5e — ветеран.", capabilities: ["Знает каждый брод до Нашкеля"], limitations: [] },
        { name: "Хеген", description: "Старший возчик каравана гильдии, громкий и честный.", capabilities: [], limitations: [] },
      ],
      questions: [{ question: "Как зовут молодого стражника, который поедет с караваном?", consequential: false }],
    },
  } : null;
  return {
    heroDraft,
    created: { requestId: id(1), campaignId, heroId: id(12), name: "Тессен Вран", role: proposal.sheet.role, language: "ru" as const, title: input.title },
    catalog,
    openingDraft,
    adventure: { title: "Дорога на Нашкель", premise: "Караван гильдии картографов идёт по тракту на юг, к Нашкелю. Тессену платят за карту бродов и за то, чтобы он довёл фургоны до места к новолунию.",
      companions: "Двое стражников тракта: Брам-младший, ветеран, и Лис, новобранец." },
  };
}
