// Fix S3-accept Д3 probe material: a synthetic Russian campaign invented for the region probes only (nothing from the
// owner's campaigns) — a village (like Берегово) with a guard post the records never put inside it, the elder's house
// and the smithy that are, a stone bridge downstream, a forest lodge up the road, two places known by hearsay.
import { stableGameplayId } from "../../../src/lib/gameplay/dice.ts";
import { createCampaignSettings } from "../../../src/lib/campaign-settings.ts";
import { live2dView } from "../../../src/lib/live2d/hierarchy.ts";
import { regionPlaceIds, regionPrepSource } from "../../../src/lib/live2d/region-prep.ts";

export const id = (name) => stableGameplayId("fix-s3-accept-d-probe", name);
const CID = id("campaign"), AT = "2026-10-23T00:00:00Z";
export function campaign() {
  const settings = createCampaignSettings(CID);
  settings.language = "ru";
  const loc = (key, name, status, description, detail) => ({ id: id(key), campaign_id: CID, revision: 1, updated_at: AT, name, description, status, ...(detail ? { detail } : {}) });
  const scene = (n, body) => ({ id: id(`scene-${n}`), campaign_id: CID, revision: 1, updated_at: AT, session_id: id("session"), title: "", body, role: "narration", settings_revision: 1, created_at: AT, sequence: n });
  return {
    timeline: { timelineId: id("timeline"), epoch: 1 },
    campaign: { id: CID, campaign_id: CID, revision: 1, updated_at: AT, title: "Заречный край", subtitle: "Синтетическая проба", language: "ru" },
    settings: { campaign_id: CID, revision: 1, updated_at: AT, values: settings }, settingsHistory: [],
    documents: [{ id: id("world"), campaign_id: CID, revision: 1, updated_at: AT, title: "Заречный край", status: "canon", current_version_id: id("world-v"),
      body: "Заречный край — тихая окраина княжества у реки Быстрицы. Деревни живут рекой и лесом; старый тракт идёт вдоль левого берега с севера на юг. Магия здесь редка, о курганах в холмах говорят шёпотом." }],
    entities: [], storages: [], items: [], sessions: [], quests: [], assets: [], feedback: [], dmGuideDocumentId: null,
    locations: [
      loc("village", "Заречье", "visited", "Деревня на левом берегу Быстрицы: частокол, площадь с колодцем, два десятка изб."),
      loc("post", "Пост стражи", "visited", "Бревенчатая сторожевая башня с караулкой; здесь сидит десятник Ждан."),
      loc("elder", "Дом старосты", "known", "Самый большой дом на площади, с резным крыльцом.", { parentId: id("village") }),
      loc("smithy", "Кузня Ольги", "known", "Кузня у южного частокола, дым виден издалека.", { parentId: id("village"), whereabouts: "у южного частокола" }),
      loc("bridge", "Каменный мост", "known", "Старый каменный мост через Быстрицу ниже по течению."),
      loc("lodge", "Лесная сторожка", "known", "Изба лесника на опушке, куда ведёт тракт на север."),
      loc("mill", "Мельница у Чёрного омута", "rumored", "Говорят, выше по реке у омута стоит заброшенная мельница."),
      loc("barrow", "Старый курган", "rumored", "Где-то в восточных холмах, говорят, есть курган."),
    ],
    scenes: [
      scene(1, "Вы подходите к Заречью по тракту с юга. Деревня стоит на левом берегу Быстрицы, за частоколом — избы и площадь с колодцем. У северных ворот Заречья — Пост стражи: бревенчатая башня и караулка, где десятник Ждан проверяет всех, кто идёт к лесу."),
      scene(2, "Ждан машет рукой на юг: «Каменный мост ниже по течению, полдня пути. Купцы теперь ходят через него, брод совсем размыло». Из Кузни Ольги у южного частокола тянет дымом."),
      scene(3, "Староста у своего дома на площади рассказывает: на север тракт уходит в лес, к Лесной сторожке — день пути. Выше по реке, у Чёрного омута, будто бы стоит старая мельница, а в восточных холмах — курган, но туда никто не ходит."),
    ],
    publicState: { campaign_id: CID, revision: 3, updated_at: AT, summary: "Отряд у Поста стражи в Заречье.", current_session_id: id("session"), current_scene_id: null, current_location_id: id("post") },
  };
}
/** The DM's private notes of this synthetic campaign: the prep reads them; the public part must never carry them. */
export const HIDDEN_LAYER = "Тайный слой кампании: мельник у Чёрного омута прячет в подвале украденную церковную утварь; десятник Ждан берёт с купцов лишнюю плату за проход через мост.";
export const SECRET = /утвар|лишнюю плату/i;
export const PLACEMENTS = [
  { campaign_id: CID, location_id: id("village"), level: "world", parent_location_id: null, x: 0.4, y: 0.45, revision: 1, updated_at: AT },
  { campaign_id: CID, location_id: id("bridge"), level: "world", parent_location_id: null, x: 0.55, y: 0.75, revision: 1, updated_at: AT },
];
/** The prep's source for the probe's region, the production way (the region's places and the places inside them). */
export function probeSource({ hidden = true } = {}) {
  const snapshot = campaign();
  const pins = live2dView(snapshot, PLACEMENTS, "region", null, id("post")).pins;
  const placeIds = regionPlaceIds(snapshot, pins.map((row) => row.locationId));
  return regionPrepSource(snapshot, { anchorId: null, placeIds, hidden: hidden ? HIDDEN_LAYER : "", existing: null });
}
