// Fix run A3/A5: synthetic data for the preview of the owner screen «Для владельца» — turn prices shaped like the
// stage A probe measurements (a council line, a fight round, a long rest, a cold first turn, one expensive turn with
// its cause, one turn with an unrecorded event) and a «Что видит ведущий» view with sizes only. No real campaign text.
import type { PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import type { DmView } from "@/lib/gameplay/dm-loop/dm-view";

type Stats = NonNullable<PublicTurn["stats"]>;
const stats = (costUsd: number, requests: number, seconds: number, effort: string, extra: Partial<Stats> = {}): Stats => ({
  requests, latencyMs: seconds * 1000, firstTextMs: 9000, costUsd, cacheReadShare: 0.8, rejectedCalls: 0, effort, firstWordMs: 12000, ...extra });

const ROWS: [string, "game" | "companion", Stats][] = [
  ["Встаём лагерем у склада: долгий отдых до утра.", "game", stats(0.34, 1, 53, "high")],
  ["Стреляю в главаря; Брам — по громиле, Тоби — по часовому.", "game", stats(0.46, 3, 48, "high")],
  ["Брам, ты бы полез к барже ночью?", "companion", stats(0.16, 1, 16, "medium")],
  ["Обыскиваем склад и забираем, что найдём.", "game", stats(0.52, 4, 81, "high", { unrecorded: ["не записано: три сабли бандитов"], checkerUsd: 0.001 })],
  ["⚡ Прыгаю на баржу, пока она не ушла.", "game", stats(1.18, 6, 154, "xhigh", { expensiveCauses: ["a long continuation chain: 6 requests", "deep thinking (xhigh)"] })],
  ["Расспрашиваю смотрителя о лодке без огней.", "game", stats(1.06, 1, 59, "high", { expensiveCauses: ["a low cache share (0.00)"] })],
];

export function previewOwnerPlay(play: PlaySnapshot): PlaySnapshot {
  const base = play.turns.find((turn) => turn.mode === "game") ?? play.turns[0];
  const turns = ROWS.map(([input, mode, row], index) => ({ ...base, id: `00000000-0000-4000-8000-0000000007${String(index).padStart(2, "0")}`,
    input, mode, companionId: null, listenerIds: [], status: "committed" as const, stats: row }));
  return { ...play, turns: [...turns].reverse() };
}

export const previewDmView: DmView = {
  turnNo: 46, operationId: "00000000-0000-4000-8000-000000000799", input: "Стреляю в главаря; Брам — по громиле, Тоби — по часовому.", mode: "game",
  language: "ru", instructions: "en", memory: "compact", secretsVisible: false, totalTokens: 137_000,
  layers: [
    { key: "howToDm", tokens: 21_400, budgetTokens: 24_000, dropped: [], blocks: 1, cached: true, text: "(The role, the turn rules, the voice and the craft doctrine — the preview shows sizes only.)" },
    { key: "world", tokens: 57_800, budgetTokens: 60_000, dropped: [], blocks: 1, cached: true, text: "(The campaign, «Что мне нравится», the DM guide, the canon, the rules.)" },
    { key: "history", tokens: 29_600, budgetTokens: 45_000, dropped: ["older scenes before the window"], blocks: 212, cached: true, text: "(The recent scenes and lines, verbatim.)" },
    { key: "living", tokens: 14_900, budgetTokens: 16_000, dropped: [], blocks: 1, cached: true, text: null },
    { key: "tail", tokens: 7_100, budgetTokens: 9_000, dropped: [], blocks: 1, cached: false, text: null },
    { key: "now", tokens: 6_200, budgetTokens: 6_000, dropped: [], blocks: 1, cached: false, text: null },
  ],
  craftCards: ["Три улики на каждую тайну", "Открытые вопросы остаются открытыми"],
  pinnedFacts: ["Сложность броска показывать игроку до броска."],
  memoryGauge: { used: 3_300, budget: 3_500, notes: 41, closed: 9, dropped: 5, hiddenLayer: true },
};
