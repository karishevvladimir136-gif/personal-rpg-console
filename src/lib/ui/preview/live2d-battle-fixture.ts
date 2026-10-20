// Two synthetic fights for the battle-map preview (Part 2): «ford» — an ambush
// the party set at a ford (surprise, a move with an opportunity attack, the hero
// down with death saves, the fight's card) — and «lair» — a caster on a ledge,
// a burning cart, a torch in the dark, a pending reaction. Each round is one
// state of the encounter rows, as the server would have written them. Invented
// names only; nothing leaves the browser.
import type { CampaignSnapshot, Entity } from "../../persistence/contracts.ts";
import type { EncounterParticipant, EncounterRecord, PlaySnapshot, PublicTurn } from "../../gameplay/contracts.ts";
import type { Combatant, Field, Placement } from "../../live2d/battle/contracts.ts";
import { combatantJson, defaultEconomy, fieldJson, placementJson } from "../../live2d/battle/contracts.ts";
import type { Live2dBoard } from "../../live2d/contracts.ts";
import { LIVE2D_CAMPAIGN_ID, LIVE2D_IDS, live2dBoard, live2dPictures, live2dPlay, live2dSnapshot } from "./live2d-fixture.ts";

export type Fight = "ford" | "lair";
const id = (n: number) => `1d1d1d1d-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (minute: number) => new Date(Date.UTC(2026, 9, 20, 10, minute)).toISOString();
const I = LIVE2D_IDS;
export const BATTLE_IDS = {
  khvat: id(200), kosoy: id(201), ryaboy: id(202), velda: id(203), grym: id(204), zhuk: id(205),
  fordFight: id(210), lairFight: id(211),
  picBattleFord: id(220),
};
const B = BATTLE_IDS;

const entity = (n: string, value: Partial<Entity> & Pick<Entity, "kind" | "name">): Entity => ({
  id: n, campaign_id: LIVE2D_CAMPAIGN_ID, revision: 1, updated_at: at(0), details: "", hp: null, max_hp: null, stats: {}, resources: {}, conditions: [], equipment_slots: [], character_sheet: null, ...value,
});
const foes: Entity[] = [
  entity(B.khvat, { kind: "npc", name: "Хват", details: "Вожак дорожной шайки.", hp: 16, max_hp: 22 }),
  entity(B.kosoy, { kind: "npc", name: "Косой", details: "Лучник шайки.", hp: 11, max_hp: 11 }),
  entity(B.ryaboy, { kind: "npc", name: "Рябой", details: "Громила с дубиной.", hp: 13, max_hp: 13 }),
  entity(B.velda, { kind: "npc", name: "Вельда", details: "Колдунья логова.", hp: 18, max_hp: 18 }),
  entity(B.grym, { kind: "npc", name: "Грым", details: "Телохранитель с копьём.", hp: 20, max_hp: 24 }),
  entity(B.zhuk, { kind: "npc", name: "Жук", details: "Мелкий поджигатель.", hp: 6, max_hp: 9 }),
];

const combatant = (side: Combatant["side"], over: Partial<Combatant> = {}): Combatant => ({
  initiative: null, active: false, side, economy: defaultEconomy(), conditions: [], deathSaves: null, hp: null, known: [], intent: null, defending: false, withdrawn: false,
  ac: null, resist: [], immune: [], vulnerable: [], ...over,
});
const field = (over: Partial<Field>): Field => ({
  grid: { cols: 20, rows: 12, feetPerCell: 5 }, locationId: I.ford, features: [], ambient: "bright", activeParticipantId: null, turnInRound: 0, opening: null, rules: true, pendingReaction: null, log: [], ...over,
});
type Row = { id: string; entityId: string; name: string; order: number; placement: Placement; combatant: Combatant };
const row = (participantId: string, entityId: string, name: string, order: number, placement: Placement, value: Combatant): Row => ({ id: participantId, entityId, name, order, placement, combatant: value });
const pid = (fight: string, n: number) => id(300 + (fight === "ford" ? 0 : 20) + n);
const place = (x: number, y: number, z = 0, position: Placement["position"] = "nearby"): Placement => ({ position, x, y, z });

type State = { encounter: Omit<EncounterRecord, "campaign_id">; rows: Row[]; changes: PublicTurn["changes"]; narration: string };

/** The ford ambush, round by round. */
function fordStates(): State[] {
  const log = (round: number, actor: string, what: string, result: string) => ({ round, actor, what, result, ref: null });
  const ground = field({
    locationId: I.ford,
    features: [
      { key: "boulders", kind: "cover", label: "валуны", cells: [[8, 4], [9, 4]], cover: "half" },
      { key: "shallows", kind: "difficult", label: "отмель", cells: [[6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6]] },
      { key: "hut", kind: "wall", label: "сторожка", cells: [[14, 2], [15, 2], [14, 3], [15, 3]] },
    ],
    opening: "party",
  });
  const hero = (over: Partial<Combatant> = {}) => combatant("party", { initiative: 17, ...over });
  const tobin = (over: Partial<Combatant> = {}) => combatant("party", { initiative: 12, ...over });
  const khvat = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 15, hp: { current: 22, max: 22 }, known: [{ text: "Вожак; остальные слушают его.", revealed: true }, { text: "Боится воды.", revealed: false }], ...over });
  const kosoy = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 9, hp: { current: 11, max: 11 }, ...over });
  const ryaboy = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 6, hp: { current: 13, max: 13 }, conditions: ["surprised"], economy: { ...defaultEconomy(), action: false, bonus: false, reaction: false, moveFeet: 0 }, ...over });
  const rows1 = [
    row(pid("ford", 1), I.hero, "Ярвен", 1, place(5, 8), hero({ active: true })),
    row(pid("ford", 2), B.khvat, "Хват", 2, place(9, 3, 0, "far"), khvat({ intent: { text: "обойти по валунам и ударить в спину", noticedBy: I.tobin } })),
    row(pid("ford", 3), I.tobin, "Тобин", 3, place(4, 9), tobin()),
    row(pid("ford", 4), B.kosoy, "Косой", 4, place(13, 4, 0, "far"), kosoy()),
    row(pid("ford", 5), B.ryaboy, "Рябой", 5, place(10, 2, 0, "far"), ryaboy()),
  ];
  const encounter = (round: number, over: Partial<Omit<EncounterRecord, "campaign_id">> = {}): Omit<EncounterRecord, "campaign_id"> =>
    ({ id: B.fordFight, status: "active", round, outcome: null, settings_revision: 1, public_summary: "Засада у Каменного брода", public_field: fieldJson({ ...ground, activeParticipantId: pid("ford", 1) }), ...over });
  const r1: State = { encounter: encounter(1), rows: rows1, narration: "Шайка выходит на отмель; вы ждали их за сторожкой.", changes: [{ tool: "combat", ok: true, summary: "Бой: Ярвен, Хват, Тобин, Косой, Рябой", action: "start" }] };
  const r2: State = {
    encounter: encounter(2, { public_field: fieldJson({ ...ground, activeParticipantId: pid("ford", 2), turnInRound: 1, log: [log(1, "Ярвен", "удар из засады", "19 против КД 14 · попал, 9 урона → Хват"), log(1, "Хват", "атака по возможности", "промах")] }) }),
    rows: [
      row(pid("ford", 1), I.hero, "Ярвен", 1, place(8, 5), hero({ economy: { ...defaultEconomy(), action: false, moveFeet: 10 } })),
      row(pid("ford", 2), B.khvat, "Хват", 2, place(9, 3, 0, "nearby"), khvat({ active: true, hp: { current: 13, max: 22 } })),
      row(pid("ford", 3), I.tobin, "Тобин", 3, place(6, 7), tobin()),
      row(pid("ford", 4), B.kosoy, "Косой", 4, place(13, 4, 0, "far"), kosoy()),
      row(pid("ford", 5), B.ryaboy, "Рябой", 5, place(10, 2, 0, "nearby"), ryaboy({ conditions: [], economy: defaultEconomy() })),
    ],
    narration: "Ярвен бьёт первым из-за валунов; Хват промахивается, когда он проскакивает мимо.",
    changes: [{ tool: "combat", ok: true, summary: "Ярвен → (8, 5), 20 фт", action: "move" }, { tool: "combat", ok: true, summary: "Хват: −9 (13/22)", action: "hp" }, { tool: "combat", ok: true, summary: "Раунд 2 · ходит Хват", action: "next_turn" }],
  };
  const r3: State = {
    encounter: encounter(3, { public_field: fieldJson({ ...ground, activeParticipantId: pid("ford", 3), turnInRound: 2, log: [log(1, "Ярвен", "удар из засады", "19 против КД 14 · попал, 9 урона → Хват"), log(1, "Хват", "атака по возможности", "промах"), log(2, "Хват", "удар топором", "крит! 14 урона → Ярвен"), log(2, "Косой", "стрела", "промах")] }) }),
    rows: [
      row(pid("ford", 1), I.hero, "Ярвен", 1, place(8, 5), hero({ conditions: ["dying"], deathSaves: { success: 1, fail: 1 }, economy: { ...defaultEconomy(), action: false, bonus: false, reaction: false, moveFeet: 0 } })),
      row(pid("ford", 2), B.khvat, "Хват", 2, place(9, 4), khvat({ hp: { current: 13, max: 22 }, known: [{ text: "Вожак; остальные слушают его.", revealed: true }, { text: "Боится воды.", revealed: true }] })),
      row(pid("ford", 3), I.tobin, "Тобин", 3, place(7, 6), tobin({ active: true })),
      row(pid("ford", 4), B.kosoy, "Косой", 4, place(12, 4, 0, "far"), kosoy()),
      row(pid("ford", 5), B.ryaboy, "Рябой", 5, place(10, 3), ryaboy({ conditions: [], economy: defaultEconomy(), hp: { current: 13, max: 13 } })),
    ],
    narration: "Топор Хвата находит Ярвена; он падает на камни. Тобин бросается к нему.",
    changes: [{ tool: "combat", ok: true, summary: "Ярвен: dying · 1✓/1✗", action: "condition" }, { tool: "combat", ok: true, summary: "Раунд 3 · ходит Тобин", action: "next_turn" }],
  };
  const r4: State = {
    encounter: encounter(4, { status: "ended", outcome: "victory", public_summary: "Шайка разбита у брода; Хват бежал.", public_field: fieldJson({ ...ground, activeParticipantId: null, turnInRound: 0, log: [log(1, "Ярвен", "удар из засады", "19 против КД 14 · попал, 9 урона → Хват"), log(1, "Хват", "атака по возможности", "промах"), log(2, "Хват", "удар топором", "крит! 14 урона → Ярвен"), log(2, "Косой", "стрела", "промах"), log(3, "Тобин", "выстрел", "17 против КД 12 · попал, 8 урона → Косой"), log(4, "Тобин", "выстрел", "11 урона → Косой")] }) }),
    rows: [
      row(pid("ford", 1), I.hero, "Ярвен", 1, place(8, 5), hero({ conditions: ["unconscious"], deathSaves: { success: 2, fail: 1 } })),
      row(pid("ford", 2), B.khvat, "Хват", 2, place(16, 1, 0, "far"), khvat({ hp: { current: 13, max: 22 }, conditions: ["fled"] })),
      row(pid("ford", 3), I.tobin, "Тобин", 3, place(7, 6), tobin()),
      row(pid("ford", 4), B.kosoy, "Косой", 4, place(12, 4, 0, "far"), kosoy({ hp: { current: 0, max: 11 }, conditions: ["dead"] })),
      row(pid("ford", 5), B.ryaboy, "Рябой", 5, place(17, 2, 0, "far"), ryaboy({ conditions: ["fled"], hp: { current: 13, max: 13 } })),
    ],
    narration: "Косой падает со второй стрелой; остальные бегут через отмель.",
    changes: [{ tool: "combat", ok: true, summary: "Бой окончен: победа · Итог: 4 р., нанесено 28, получено 14, на грани: Ярвен", action: "end" }],
  };
  return [r1, r2, r3, r4];
}

/** The lair fight: a ledge, a burning cart, a torch, the dark; a reaction pending in round 3. */
function lairStates(): State[] {
  const log = (round: number, actor: string, what: string, result: string) => ({ round, actor, what, result, ref: null });
  const ground = field({
    locationId: I.lodge, ambient: "dark", grid: { cols: 20, rows: 14, feetPerCell: 5 },
    features: [
      { key: "cart", kind: "cover", label: "горящая телега", cells: [[9, 7], [10, 7]], cover: "three-quarters" },
      { key: "fire", kind: "burning", label: "огонь", cells: [[9, 7], [10, 7]], radiusFeet: 10, dimRadiusFeet: 20 },
      { key: "ledge", kind: "elevation", label: "уступ", cells: [[14, 2], [15, 2], [16, 2], [14, 3], [15, 3], [16, 3]], heightFeet: 10 },
      { key: "torch", kind: "light", label: "факел на столбе", cells: [[4, 4]], radiusFeet: 20, dimRadiusFeet: 40 },
      { key: "rubble", kind: "difficult", label: "обвал", cells: [[12, 9], [13, 9], [13, 10]] },
      { key: "wall", kind: "wall", label: "стена логова", cells: [[0, 11], [1, 11], [2, 11], [3, 11], [4, 11]] },
    ],
  });
  const hero = (over: Partial<Combatant> = {}) => combatant("party", { initiative: 14, ...over });
  const tobin = (over: Partial<Combatant> = {}) => combatant("party", { initiative: 11, ...over });
  const velda = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 18, hp: { current: 18, max: 18 }, conditions: ["concentrating"], known: [{ text: "Читает заклинания с уступа.", revealed: true }], resist: ["fire"], ...over });
  const grym = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 10, hp: { current: 24, max: 24 }, ...over });
  const zhuk = (over: Partial<Combatant> = {}) => combatant("foe", { initiative: 8, hp: { current: 9, max: 9 }, ...over });
  const rows = (active: number, over: Partial<Record<number, Partial<Combatant>>> = {}, moved: Partial<Record<number, Placement>> = {}) => [
    row(pid("lair", 1), B.velda, "Вельда", 1, moved[1] ?? place(15, 2, 10, "far"), velda({ active: active === 1, ...over[1] })),
    row(pid("lair", 2), I.hero, "Ярвен", 2, moved[2] ?? place(5, 8), hero({ active: active === 2, ...over[2] })),
    row(pid("lair", 3), I.tobin, "Тобин", 3, moved[3] ?? place(3, 9), tobin({ active: active === 3, ...over[3] })),
    row(pid("lair", 4), B.grym, "Грым", 4, moved[4] ?? place(11, 6, 0, "cover"), grym({ active: active === 4, ...over[4] })),
    row(pid("lair", 5), B.zhuk, "Жук", 5, moved[5] ?? place(13, 8, 0, "far"), zhuk({ active: active === 5, ...over[5] })),
  ];
  const encounter = (round: number, over: Partial<Omit<EncounterRecord, "campaign_id">> = {}): Omit<EncounterRecord, "campaign_id"> =>
    ({ id: B.lairFight, status: "active", round, outcome: null, settings_revision: 1, public_summary: "Логово под зимовьем", public_field: fieldJson(ground), ...over });
  const r1: State = { encounter: encounter(1, { public_field: fieldJson({ ...ground, activeParticipantId: pid("lair", 1) }) }), rows: rows(1), narration: "Телега горит; с уступа Вельда начинает читать.", changes: [{ tool: "combat", ok: true, summary: "Бой: Вельда, Ярвен, Тобин, Грым, Жук", action: "start" }] };
  const r2: State = {
    encounter: encounter(2, { public_field: fieldJson({ ...ground, activeParticipantId: pid("lair", 2), turnInRound: 1, log: [log(1, "Вельда", "огненный луч", "промах"), log(1, "Грым", "копьё", "16 против КД 15 · попал, 7 урона → Ярвен")] }) }),
    rows: rows(2, { 2: { economy: { ...defaultEconomy(), moveFeet: 30 } }, 4: { intent: { text: "держать телегу между собой и лучником", noticedBy: null } } }, { 4: place(10, 6, 0, "cover") }),
    narration: "Грым достаёт копьём из-за телеги. Ваш ход.",
    changes: [{ tool: "combat", ok: true, summary: "Ярвен: −7 (7/18)", action: "hp" }, { tool: "combat", ok: true, summary: "Раунд 2 · ходит Ярвен", action: "next_turn" }],
  };
  const r3: State = {
    encounter: encounter(3, { public_field: fieldJson({ ...ground, activeParticipantId: pid("lair", 1), turnInRound: 0, pendingReaction: { targetId: pid("lair", 2), trigger: "Вельда бьёт Ярвена огненным лучом: 19 против КД 17", options: ["Щит", "Принять удар"] }, log: [log(1, "Вельда", "огненный луч", "промах"), log(1, "Грым", "копьё", "16 против КД 15 · попал, 7 урона → Ярвен"), log(2, "Ярвен", "выстрел в Жука", "15 против КД 13 · попал, 6 урона → Жук")] }) }),
    rows: rows(1, { 2: { economy: { ...defaultEconomy(), action: false, moveFeet: 10 } }, 5: { hp: { current: 3, max: 9 }, conditions: ["frightened"] } }, { 2: place(8, 6) }),
    narration: "Луч Вельды летит в Ярвена — есть мгновение на Щит.",
    changes: [{ tool: "combat", ok: true, summary: "Жук: −6 (3/9)", action: "hp" }, { tool: "combat", ok: true, summary: "Реакция Ярвен: Щит / Принять удар", action: "reaction" }],
  };
  return [r1, r2, r3];
}

export const fightStates = (fight: Fight) => (fight === "ford" ? fordStates() : lairStates());
export const fightRounds = (fight: Fight) => fightStates(fight).length;

/** The preview's records for one fight at one round: the snapshot with the foes, the play with the encounter rows, the board with the ford's battle map. */
export function battlePreview(fight: Fight, round: number): { snapshot: CampaignSnapshot; play: PlaySnapshot; board: Live2dBoard; pictures: typeof live2dPictures } {
  const states = fightStates(fight);
  const state = states[Math.min(states.length, Math.max(1, round)) - 1];
  const snapshot = live2dSnapshot();
  snapshot.entities = [...snapshot.entities.map((row) => (row.id === I.hero ? { ...row, hp: fight === "ford" ? (round >= 3 ? 0 : 18) : round >= 2 ? 7 : 18, max_hp: 18 } : row)), ...foes];
  snapshot.publicState.current_location_id = state.encounter.public_field && typeof state.encounter.public_field.locationId === "string" ? state.encounter.public_field.locationId : I.ford;
  const play = live2dPlay();
  play.configuration = { ...play.configuration!, presentEntityIds: [I.hero, I.tobin, ...state.rows.map((row) => row.entityId)] };
  play.encounters = [{ campaign_id: LIVE2D_CAMPAIGN_ID, ...state.encounter }];
  play.participants = state.rows.map((row): EncounterParticipant => ({ id: row.id, campaign_id: LIVE2D_CAMPAIGN_ID, encounter_id: state.encounter.id, entity_id: row.entityId, public_name: row.name, turn_order: row.order,
    public_position: placementJson(row.placement), public_resources: combatantJson(row.combatant) }));
  play.turns = [...play.turns, { ...play.turns[play.turns.length - 1], id: id(400 + round), input: "…", narration: state.narration, changes: state.changes, created_at: at(round), updated_at: at(round) }];
  const board: Live2dBoard = { ...live2dBoard, battleMaps: fight === "ford" ? [{ locationId: I.ford, sheetRevision: 1, pictureId: B.picBattleFord, status: "ready", check: null, grid: { cols: 20, rows: 12, feetPerCell: 5 }, updatedAt: at(0) }] : [] };
  const pictures = {
    board: { ...live2dPictures.board, pictures: [...live2dPictures.board.pictures, { ...live2dPictures.board.pictures[0], id: B.picBattleFord, kind: "anchor" as const, subjectKind: "location" as const, subjectId: I.ford, composition: "battle" as const, width: 1344, height: 768 }] },
    images: { ...live2dPictures.images, [B.picBattleFord]: "/preview/live2d/market.jpg" },
  };
  return { snapshot, play, board, pictures };
}
